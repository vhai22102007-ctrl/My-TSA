(function () {
  "use strict";

  var selectedProfileId = "";
  var toastTimer = null;

  function byId(id) { return document.getElementById(id); }

  function showToast(message, isError) {
    var toast = byId("toast");
    toast.textContent = message;
    toast.className = "toast show" + (isError ? " error" : "");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.className = "toast"; }, 2600);
  }

  function formatUpdatedAt(value) {
    if (!value) return "Chưa lưu";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Đã lưu";
    return "Cập nhật " + date.toLocaleDateString("vi-VN");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
    });
  }

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function renderProfileList() {
    var profiles = window.TMA_AI.getProfiles();
    var active = window.TMA_AI.getActiveProfile();
    if (!selectedProfileId || !profiles.some(function (profile) { return profile.id === selectedProfileId; })) {
      selectedProfileId = active.id;
    }

    byId("profile-list").innerHTML = profiles.map(function (profile) {
      var isActive = profile.id === active.id;
      var isSelected = profile.id === selectedProfileId;
      return '<button class="profile-item' + (isSelected ? ' selected' : '') + '" type="button" data-profile-id="' + escapeHtml(profile.id) + '">' +
        '<span class="profile-item-icon"><i data-lucide="sliders-horizontal"></i></span>' +
        '<span class="profile-item-copy"><strong>' + escapeHtml(profile.name) + '</strong><small>' + escapeHtml(formatUpdatedAt(profile.updatedAt)) + '</small></span>' +
        (isActive ? '<i class="active-mark" data-lucide="circle-check"></i>' : '<span></span>') +
      '</button>';
    }).join("");

    byId("profile-list").querySelectorAll("[data-profile-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectedProfileId = button.getAttribute("data-profile-id") || "";
        loadSelectedProfile();
        renderProfileList();
      });
    });
    renderIcons();
  }

  function getSelectedProfile() {
    return window.TMA_AI.getProfiles().find(function (profile) { return profile.id === selectedProfileId; }) || window.TMA_AI.getActiveProfile();
  }

  function updateCounts() {
    [
      ["profile-system", "system-count", 12000],
      ["profile-latex", "latex-count", 6000],
      ["profile-output", "output-count", 6000],
      ["profile-examples", "examples-count", 12000]
    ].forEach(function (entry) {
      byId(entry[1]).textContent = byId(entry[0]).value.length + "/" + entry[2];
    });
    byId("temperature-output").textContent = Number(byId("profile-temperature").value).toFixed(2).replace(/0$/, "");
  }

  function loadSelectedProfile() {
    var profile = getSelectedProfile();
    selectedProfileId = profile.id;
    byId("profile-name").value = profile.name;
    byId("profile-system").value = profile.systemPrompt;
    byId("profile-latex").value = profile.latexRules;
    byId("profile-output").value = profile.outputRules;
    byId("profile-examples").value = profile.examples;
    byId("profile-temperature").value = profile.temperature;
    var isActive = window.TMA_AI.getActiveProfile().id === profile.id;
    byId("activate-profile-button").classList.toggle("is-active", isActive);
    byId("activate-profile-button").querySelector("span").textContent = isActive ? "Đang được kích hoạt" : "Kích hoạt hồ sơ";
    byId("delete-profile-button").disabled = window.TMA_AI.getProfiles().length <= 1;
    byId("save-state").textContent = isActive ? "Mọi nút AI đang dùng hồ sơ này." : "Lưu rồi kích hoạt để áp dụng cho các nút AI.";
    updateCounts();
  }

  function readFormProfile() {
    var current = getSelectedProfile();
    var name = byId("profile-name").value.trim();
    if (!name) throw new Error("Vui lòng đặt tên cho hồ sơ Prompt.");
    return {
      id: current.id,
      name: name,
      systemPrompt: byId("profile-system").value,
      latexRules: byId("profile-latex").value,
      outputRules: byId("profile-output").value,
      examples: byId("profile-examples").value,
      temperature: Number(byId("profile-temperature").value)
    };
  }

  function saveSelectedProfile(silent) {
    var saved = window.TMA_AI.saveProfile(readFormProfile());
    selectedProfileId = saved.id;
    renderProfileList();
    loadSelectedProfile();
    if (!silent) showToast("Đã lưu hồ sơ Prompt.");
    return saved;
  }

  function createNewProfile() {
    var base = window.TMA_AI.DEFAULT_PROFILE;
    var created = window.TMA_AI.saveProfile({
      id: window.TMA_AI.createProfileId(),
      name: "Phong cách mới",
      systemPrompt: base.systemPrompt,
      latexRules: base.latexRules,
      outputRules: base.outputRules,
      examples: "",
      temperature: base.temperature
    });
    selectedProfileId = created.id;
    renderProfileList();
    loadSelectedProfile();
    byId("profile-name").select();
  }

  function duplicateSelectedProfile() {
    var current = readFormProfile();
    current.id = window.TMA_AI.createProfileId();
    current.name = current.name + " - Bản sao";
    var created = window.TMA_AI.saveProfile(current);
    selectedProfileId = created.id;
    renderProfileList();
    loadSelectedProfile();
    showToast("Đã nhân bản hồ sơ.");
  }

  function deleteSelectedProfile() {
    var profile = getSelectedProfile();
    if (!window.confirm('Xóa hồ sơ "' + profile.name + '"?')) return;
    try {
      window.TMA_AI.deleteProfile(profile.id);
      selectedProfileId = window.TMA_AI.getActiveProfile().id;
      renderProfileList();
      loadSelectedProfile();
      showToast("Đã xóa hồ sơ.");
    } catch (error) {
      showToast(error.message, true);
    }
  }

  function activateSelectedProfile() {
    var saved = saveSelectedProfile(true);
    window.TMA_AI.setActiveProfile(saved.id);
    renderProfileList();
    loadSelectedProfile();
    showToast("Đã áp dụng hồ sơ cho toàn bộ công cụ AI.");
  }

  function exportProfiles() {
    var blob = new Blob([window.TMA_AI.exportProfiles()], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tma-ai-prompt-profiles.json";
    link.click();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }

  function importProfiles(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var profiles = window.TMA_AI.importProfiles(String(reader.result || ""));
        selectedProfileId = profiles[profiles.length - 1].id;
        renderProfileList();
        loadSelectedProfile();
        showToast("Đã nhập hồ sơ Prompt.");
      } catch (error) {
        showToast(error.message, true);
      } finally {
        byId("import-file").value = "";
      }
    };
    reader.readAsText(file);
  }

  function fileToInlinePart(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve(null);
      if (file.size > 10 * 1024 * 1024) return reject(new Error("Tệp vượt quá 10 MB."));
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) && file.type !== "application/pdf") {
        return reject(new Error("Chỉ hỗ trợ PNG, JPG, WEBP hoặc PDF."));
      }
      var reader = new FileReader();
      reader.onload = function () {
        var base64 = String(reader.result || "").split(",")[1] || "";
        resolve({ inline_data: { mime_type: file.type, data: base64 } });
      };
      reader.onerror = function () { reject(new Error("Không đọc được tệp đính kèm.")); };
      reader.readAsDataURL(file);
    });
  }

  function parseGeminiText(data) {
    return data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
      ? data.candidates[0].content.parts.map(function (part) { return part.text || ""; }).join("")
      : "";
  }

  function parseLooseJson(text) {
    var clean = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    try { return JSON.parse(clean); } catch (error) { return { raw: clean }; }
  }

  function setTestStatus(message, state) {
    var element = byId("test-status");
    element.textContent = message || "";
    element.className = "test-status" + (state ? " " + state : "");
  }

  async function runTest() {
    var input = byId("test-input").value.trim();
    var file = byId("test-file").files[0] || null;
    if (!input && !file) {
      setTestStatus("Nhập văn bản hoặc đính kèm một tệp để chạy thử.", "error");
      return;
    }

    var button = byId("run-test-button");
    var original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i data-lucide="loader-circle"></i><span>Đang xử lý</span>';
    renderIcons();
    setTestStatus("AI đang đọc dữ liệu và chuẩn hóa LaTeX...", "");

    try {
      var testProfile = saveSelectedProfile(true);
      var parts = [{
        text: "Hãy đọc chính xác nội dung đề dưới đây, sửa lỗi OCR và chuyển công thức toán sang LaTeX. Trả về duy nhất JSON hợp lệ có cấu trúc: {\"clean_text\":\"nội dung đã làm sạch\",\"latex\":\"nội dung có LaTeX\",\"notes\":[\"điểm cần giáo viên kiểm tra\"]}. Không tự giải hoặc tự thêm đáp án nếu yêu cầu không nói rõ.\n\nYÊU CẦU/VĂN BẢN:\n" + (input || "Đọc nội dung trong tệp đính kèm.")
      }];
      var inlinePart = await fileToInlinePart(file);
      if (inlinePart) parts.push(inlinePart);

      var response = await window.TMA_AI.generate({
        contents: [{ role: "user", parts: parts }],
        generationConfig: { responseMimeType: "application/json", temperature: Number(byId("profile-temperature").value) }
      }, { profile: testProfile });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        throw new Error(data && data.error && data.error.message ? data.error.message : "AI trả về lỗi " + response.status + ".");
      }

      var parsed = parseLooseJson(parseGeminiText(data));
      byId("test-json-output").textContent = JSON.stringify(parsed, null, 2);
      byId("test-preview-output").textContent = parsed.latex || parsed.clean_text || parsed.raw || "Không có nội dung xem trước.";
      if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
        await window.MathJax.typesetPromise([byId("test-preview-output")]);
      }
      setTestStatus("Hoàn tất. Hãy kiểm tra các ghi chú trước khi dùng trong đề thật.", "success");
    } catch (error) {
      setTestStatus(error.message || "Không thể chạy thử AI.", "error");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
      renderIcons();
    }
  }

  function switchOutputTab(button) {
    document.querySelectorAll(".output-tab").forEach(function (tab) { tab.classList.toggle("active", tab === button); });
    document.querySelectorAll(".output-panel").forEach(function (panel) { panel.classList.remove("active"); });
    byId(button.getAttribute("data-output-tab") === "preview" ? "test-preview-output" : "test-json-output").classList.add("active");
  }

  async function initializeSupabase() {
    try {
      var teacherInfo = JSON.parse(localStorage.getItem("teacherInfo") || "null");
      if (!teacherInfo || !teacherInfo.token || !window.supabase || !window.SUPABASE_CONFIG) throw new Error("Thiếu phiên giáo viên.");
      window.supabaseClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey, {
        global: { headers: { Authorization: "Bearer " + teacherInfo.token, "x-teacher-token": teacherInfo.token, "x-teacher-email": teacherInfo.email || "" } }
      });
      var roleResult = await window.supabaseClient.from("students").select("role").eq("email", String(teacherInfo.email || "").toLowerCase()).eq("role", "teacher").maybeSingle();
      if (roleResult.error || !roleResult.data) throw new Error("Phiên giáo viên không hợp lệ.");
    } catch (error) {
      localStorage.removeItem("teacherInfo");
      window.location.replace("login.html#teacher");
    }
  }

  async function checkBackend() {
    var state = byId("backend-state");
    var text = byId("backend-state-text");
    try {
      var health = await window.TMA_AI.health();
      if (!health.configured) throw new Error("Chưa cấu hình key");
      state.className = "backend-state ready";
      text.textContent = "AI sẵn sàng";
      state.title = "Model: " + (health.model || "Gemini");
    } catch (error) {
      state.className = "backend-state error";
      text.textContent = "AI chưa sẵn sàng";
      state.title = error.message || "Backend AI chưa sẵn sàng";
    }
  }

  async function initialize() {
    renderIcons();
    await initializeSupabase();
    selectedProfileId = window.TMA_AI.getActiveProfile().id;
    renderProfileList();
    loadSelectedProfile();

    byId("new-profile-button").addEventListener("click", createNewProfile);
    byId("save-profile-button").addEventListener("click", function () {
      try { saveSelectedProfile(false); } catch (error) { showToast(error.message, true); }
    });
    byId("duplicate-profile-button").addEventListener("click", function () {
      try { duplicateSelectedProfile(); } catch (error) { showToast(error.message, true); }
    });
    byId("delete-profile-button").addEventListener("click", deleteSelectedProfile);
    byId("activate-profile-button").addEventListener("click", function () {
      try { activateSelectedProfile(); } catch (error) { showToast(error.message, true); }
    });
    byId("export-button").addEventListener("click", exportProfiles);
    byId("import-button").addEventListener("click", function () { byId("import-file").click(); });
    byId("import-file").addEventListener("change", function () { importProfiles(byId("import-file").files[0]); });
    byId("run-test-button").addEventListener("click", runTest);
    byId("test-file").addEventListener("change", function () {
      var file = byId("test-file").files[0];
      byId("file-label").textContent = file ? file.name : "Đính kèm ảnh hoặc PDF";
    });
    document.querySelectorAll(".output-tab").forEach(function (button) { button.addEventListener("click", function () { switchOutputTab(button); }); });
    ["profile-system", "profile-latex", "profile-output", "profile-examples", "profile-temperature"].forEach(function (id) {
      byId(id).addEventListener("input", updateCounts);
    });

    checkBackend();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
