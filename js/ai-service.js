(function () {
  "use strict";

  var PROFILE_KEY = "tma_ai_prompt_profiles_v1";
  var ACTIVE_PROFILE_KEY = "tma_ai_active_profile_v1";
  var LEGACY_STYLE_KEY = "tma_teacher_ai_style";
  var REQUEST_TIMEOUT_MS = 90000;

  var DEFAULT_PROFILE = {
    id: "tma-tsa-standard",
    name: "Chuẩn TMA TSA",
    systemPrompt: "Bạn là trợ lý biên soạn và thẩm định câu hỏi TSA bằng tiếng Việt. Giữ nguyên dữ kiện, không tự bịa đáp án, trình bày ngắn gọn, chính xác và phù hợp học sinh THPT.",
    latexRules: "Dùng \\( ... \\) cho công thức nội dòng và \\[ ... \\] cho công thức khối. Dùng \\dfrac cho phân số, \\limits cho tổng hoặc tích có cận. Trong chuỗi JSON phải escape dấu gạch chéo ngược đúng chuẩn.",
    outputRules: "Không chào hỏi, không dùng emoji, không dùng dấu sao để định dạng. Khi tác vụ yêu cầu JSON, chỉ trả về JSON hợp lệ đúng cấu trúc được giao.",
    examples: "",
    temperature: 0.2,
    updatedAt: ""
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "profile-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function clampTemperature(value) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_PROFILE.temperature;
    return Math.min(1, Math.max(0, parsed));
  }

  function normalizeProfile(profile) {
    var source = profile && typeof profile === "object" ? profile : {};
    return {
      id: String(source.id || createId()).slice(0, 100),
      name: String(source.name || "Hồ sơ chưa đặt tên").trim().slice(0, 100),
      systemPrompt: String(source.systemPrompt || "").trim().slice(0, 12000),
      latexRules: String(source.latexRules || "").trim().slice(0, 6000),
      outputRules: String(source.outputRules || "").trim().slice(0, 6000),
      examples: String(source.examples || "").trim().slice(0, 12000),
      temperature: clampTemperature(source.temperature),
      updatedAt: source.updatedAt || new Date().toISOString()
    };
  }

  function writeProfiles(profiles) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles.map(normalizeProfile)));
  }

  function getProfiles() {
    var profiles = [];
    try {
      profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) || "[]");
    } catch (error) {
      profiles = [];
    }

    if (!Array.isArray(profiles) || profiles.length === 0) {
      var initial = clone(DEFAULT_PROFILE);
      initial.updatedAt = new Date().toISOString();
      try {
        var legacyStyle = localStorage.getItem(LEGACY_STYLE_KEY) || "";
        if (legacyStyle.trim()) initial.systemPrompt += "\n\nPhong cách cũ của giáo viên:\n" + legacyStyle.trim();
      } catch (error) {}
      profiles = [initial];
      writeProfiles(profiles);
      localStorage.setItem(ACTIVE_PROFILE_KEY, initial.id);
    }

    return profiles.map(normalizeProfile);
  }

  function getActiveProfile() {
    var profiles = getProfiles();
    var activeId = localStorage.getItem(ACTIVE_PROFILE_KEY) || "";
    var active = profiles.find(function (profile) { return profile.id === activeId; }) || profiles[0];
    if (active && active.id !== activeId) localStorage.setItem(ACTIVE_PROFILE_KEY, active.id);
    return clone(active);
  }

  function saveProfile(profile) {
    var normalized = normalizeProfile(profile);
    normalized.updatedAt = new Date().toISOString();
    var profiles = getProfiles();
    var index = profiles.findIndex(function (item) { return item.id === normalized.id; });
    if (index === -1) profiles.push(normalized);
    else profiles[index] = normalized;
    writeProfiles(profiles);
    window.dispatchEvent(new CustomEvent("tma-ai-profile-change", { detail: { profile: clone(normalized) } }));
    return clone(normalized);
  }

  function deleteProfile(profileId) {
    var profiles = getProfiles();
    if (profiles.length <= 1) throw new Error("Cần giữ lại ít nhất một hồ sơ Prompt.");
    profiles = profiles.filter(function (profile) { return profile.id !== profileId; });
    writeProfiles(profiles);
    if (localStorage.getItem(ACTIVE_PROFILE_KEY) === profileId) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
    }
    return getProfiles();
  }

  function setActiveProfile(profileId) {
    var profile = getProfiles().find(function (item) { return item.id === profileId; });
    if (!profile) throw new Error("Không tìm thấy hồ sơ Prompt.");
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    localStorage.setItem(LEGACY_STYLE_KEY, profile.systemPrompt || "");
    window.dispatchEvent(new CustomEvent("tma-ai-profile-change", { detail: { profile: clone(profile) } }));
    return clone(profile);
  }

  function importProfiles(rawValue) {
    var parsed = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
    var incoming = Array.isArray(parsed) ? parsed : parsed && parsed.profiles;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      throw new Error("Tệp không chứa hồ sơ Prompt hợp lệ.");
    }

    var current = getProfiles();
    incoming.map(normalizeProfile).forEach(function (profile) {
      var index = current.findIndex(function (item) { return item.id === profile.id; });
      if (index === -1) current.push(profile);
      else current[index] = profile;
    });
    writeProfiles(current);
    return getProfiles();
  }

  function exportProfiles() {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      activeProfileId: localStorage.getItem(ACTIVE_PROFILE_KEY),
      profiles: getProfiles()
    }, null, 2);
  }

  function getEndpoint() {
    if (window.TMA_AI_CONFIG && window.TMA_AI_CONFIG.endpoint) {
      return String(window.TMA_AI_CONFIG.endpoint);
    }
    throw new Error("Thiếu cấu hình Cloudflare Worker cho dịch vụ AI.");
  }

  async function getTeacherToken() {
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        var sessionResult = await window.supabaseClient.auth.getSession();
        var freshToken = sessionResult && sessionResult.data && sessionResult.data.session && sessionResult.data.session.access_token;
        if (freshToken) {
          var currentInfo = JSON.parse(localStorage.getItem("teacherInfo") || "{}");
          currentInfo.token = freshToken;
          localStorage.setItem("teacherInfo", JSON.stringify(currentInfo));
          return freshToken;
        }
      }
    } catch (error) {
      console.warn("Không thể làm mới phiên giáo viên cho AI:", error);
    }

    try {
      var teacherInfo = JSON.parse(localStorage.getItem("teacherInfo") || "null");
      return teacherInfo && teacherInfo.token ? String(teacherInfo.token) : "";
    } catch (error) {
      return "";
    }
  }

  async function request(action, data, options) {
    var opts = options || {};
    var token = await getTeacherToken();
    if (!token) throw new Error("Phiên giáo viên đã hết hạn. Vui lòng đăng nhập lại.");

    var controller = new AbortController();
    var timeoutId = window.setTimeout(function () { controller.abort(); }, opts.timeoutMs || REQUEST_TIMEOUT_MS);

    try {
      return await fetch(getEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          action: action,
          data: data || {},
          profile: opts.profile === false ? null : (opts.profile && typeof opts.profile === "object" ? normalizeProfile(opts.profile) : getActiveProfile())
        }),
        signal: controller.signal
      });
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error("AI phản hồi quá lâu. Hãy rút gọn dữ liệu hoặc thử lại.");
      }
      throw new Error("Không kết nối được backend AI trên Cloudflare Worker.");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function generate(payload, options) {
    return request("generate", { payload: payload }, options);
  }

  async function health() {
    var response = await request("health", {}, { profile: false, timeoutMs: 15000 });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(body && body.error && body.error.message ? body.error.message : "Backend AI chưa sẵn sàng.");
    return body;
  }

  window.TMA_AI = {
    DEFAULT_PROFILE: clone(DEFAULT_PROFILE),
    getProfiles: getProfiles,
    getActiveProfile: getActiveProfile,
    saveProfile: saveProfile,
    deleteProfile: deleteProfile,
    setActiveProfile: setActiveProfile,
    importProfiles: importProfiles,
    exportProfiles: exportProfiles,
    createProfileId: createId,
    generate: generate,
    health: health
  };
})();
