(function (global) {
  "use strict";

  function gatewayUrl() {
    var config = global.TMA_STORAGE_CONFIG || {};
    return String(config.gatewayUrl || "").replace(/\/$/, "");
  }

  async function parseResponse(response) {
    var contentType = response.headers.get("Content-Type") || "";
    var body = contentType.indexOf("application/json") !== -1
      ? await response.json().catch(function () { return {}; })
      : await response.text();
    if (!response.ok) {
      var message = body && body.error && (body.error.message || body.error);
      var error = new Error(message || (body && body.message) || "Máy chủ thi thử trả về lỗi " + response.status + ".");
      error.status = response.status;
      error.data = body;
      throw error;
    }
    return body;
  }

  async function publicRequest(path, payload) {
    if (!gatewayUrl()) throw new Error("Chưa cấu hình Cloudflare Worker cho cổng thi thử.");
    var response = await fetch(gatewayUrl() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    return parseResponse(response);
  }

  async function getTeacherToken() {
    try {
      if (global.supabaseClient && global.supabaseClient.auth) {
        var sessionResult = await global.supabaseClient.auth.getSession();
        var freshToken = sessionResult && sessionResult.data && sessionResult.data.session && sessionResult.data.session.access_token;
        if (freshToken) {
          var current = JSON.parse(localStorage.getItem("teacherInfo") || "{}");
          current.token = freshToken;
          localStorage.setItem("teacherInfo", JSON.stringify(current));
          return freshToken;
        }
      }
    } catch (error) {
      console.warn("Không thể làm mới phiên giáo viên:", error);
    }
    try {
      var info = JSON.parse(localStorage.getItem("teacherInfo") || "null");
      return info && info.token ? String(info.token) : "";
    } catch (_error) {
      return "";
    }
  }

  async function adminFetch(path, options) {
    if (!gatewayUrl()) throw new Error("Chưa cấu hình Cloudflare Worker.");
    var token = await getTeacherToken();
    if (!token) throw new Error("Phiên giáo viên đã hết hạn. Vui lòng đăng nhập lại.");
    var requestOptions = options || {};
    var headers = new Headers(requestOptions.headers || {});
    headers.set("Authorization", "Bearer " + token);
    requestOptions.headers = headers;
    return fetch(gatewayUrl() + path, requestOptions);
  }

  async function adminJson(path, method, payload) {
    var response = await adminFetch(path, {
      method: method || "GET",
      headers: payload === undefined ? {} : { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload)
    });
    return parseResponse(response);
  }

  global.TMAMockExam = {
    checkIn: function (phone, examCode) {
      return publicRequest("/mock/check-in", { phone: phone, examCode: examCode || "" });
    },
    submit: function (token, answers) {
      return publicRequest("/mock/submit", { token: token, answers: answers || {} });
    },
    lookupResult: function (phone, examCode) {
      return publicRequest("/mock/result", { phone: phone, examCode: examCode || "" });
    }
  };

  global.TMAMockAdmin = {
    upsertExam: function (exam) {
      return adminJson("/mock/admin/exams/upsert", "POST", exam);
    },
    saveAnswerKeys: function (examCode, answers) {
      return adminJson("/mock/admin/answer-keys", "POST", { examCode: examCode, answers: answers });
    },
    importCandidates: function (examCode, candidates, replace) {
      return adminJson("/mock/admin/candidates/import", "POST", { examCode: examCode, candidates: candidates, replace: replace === true });
    },
    dashboard: function (examCode) {
      return adminJson("/mock/admin/dashboard?examCode=" + encodeURIComponent(examCode), "GET");
    },
    publish: function (examCode, published, releaseAt) {
      return adminJson("/mock/admin/publish", "POST", { examCode: examCode, published: published === true, releaseAt: releaseAt || null });
    },
    syncSheet: function (examCode) {
      return adminJson("/mock/admin/sync-sheet", "POST", { examCode: examCode });
    },
    downloadCsv: async function (examCode) {
      var response = await adminFetch("/mock/admin/export.csv?examCode=" + encodeURIComponent(examCode), { method: "GET" });
      if (!response.ok) return parseResponse(response);
      var blob = await response.blob();
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = examCode + "-ket-qua.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 500);
      return { success: true };
    }
  };
})(window);
