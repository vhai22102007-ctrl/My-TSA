(function () {
  "use strict";

  var elements = {
    lobbyUi: document.getElementById("lobby-ui"),
    loadingUi: document.getElementById("loading-ui"),
    codeForm: document.getElementById("code-form"),
    codeInput: document.getElementById("code-input"),
    submitBtn: document.getElementById("submit-btn"),
    errorMsg: document.getElementById("error-msg"),
    iframe: document.getElementById("portal-iframe"),
    phoneEntryPanel: document.getElementById("phone-entry-panel"),
    examSelectPanel: document.getElementById("exam-select-panel"),
    examOptionList: document.getElementById("exam-option-list"),
    examSelectBack: document.getElementById("exam-select-back")
  };

  var examShellActive = false;
  var examShellWasFullscreen = false;
  var pendingPhone = "";

  function normalizePhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.indexOf("0084") === 0) digits = "0" + digits.slice(4);
    else if (digits.indexOf("84") === 0 && digits.length >= 11) digits = "0" + digits.slice(2);
    return digits.slice(0, 15);
  }

  function validPhone(phone) {
    return /^0\d{8,10}$/.test(phone);
  }

  function setBusy(busy, text) {
    elements.submitBtn.disabled = busy;
    elements.submitBtn.textContent = text || (busy ? "Đang kiểm tra..." : "Tiếp theo");
  }

  function showError(message) {
    elements.errorMsg.textContent = message || "";
  }

  elements.codeInput.addEventListener("input", function (event) {
    var digits = normalizePhone(event.target.value);
    event.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    showError("");
  });

  function isFullscreenActive() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  }

  function showExamFullscreenWarning() {
    var overlay = document.getElementById("exam-shell-fullscreen-warning");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "exam-shell-fullscreen-warning";
      overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.96);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,sans-serif;";
      overlay.innerHTML = '<div style="width:min(480px,100%);background:#fff;color:#0f172a;border:2px solid #135c97;border-radius:12px;padding:32px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.3);"><h2 style="margin:0 0 12px;color:#135c97;font-size:20px;font-weight:800;">Yêu cầu toàn màn hình</h2><p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Bài thi đang diễn ra trong chế độ toàn màn hình. Bấm nút bên dưới để tiếp tục làm bài.</p><button id="exam-shell-fullscreen-btn" type="button" style="width:100%;height:48px;border:0;border-radius:8px;background:#135c97;color:#fff;font-size:16px;font-weight:800;cursor:pointer;">Tiếp tục toàn màn hình</button></div>';
      document.body.appendChild(overlay);
      document.getElementById("exam-shell-fullscreen-btn").addEventListener("click", async function () {
        try {
          var root = document.documentElement;
          if (root.requestFullscreen) await root.requestFullscreen();
          else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
          else if (root.msRequestFullscreen) await root.msRequestFullscreen();
          sessionStorage.setItem("tsaFullscreenStarted", "1");
          enforceExamShellFullscreen();
        } catch (error) {
          console.warn("Fullscreen request rejected:", error);
        }
      });
    }
    overlay.style.display = "flex";
  }

  function enforceExamShellFullscreen() {
    var warning = document.getElementById("exam-shell-fullscreen-warning");
    if (!examShellActive || !elements.iframe || elements.iframe.style.display === "none") {
      examShellActive = false;
      examShellWasFullscreen = false;
      if (warning) warning.style.display = "none";
      return;
    }
    if (isFullscreenActive()) {
      examShellWasFullscreen = true;
      sessionStorage.setItem("tsaFullscreenStarted", "1");
      if (warning) warning.style.display = "none";
    } else if (examShellWasFullscreen) {
      showExamFullscreenWarning();
    }
  }

  ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach(function (eventName) {
    document.addEventListener(eventName, enforceExamShellFullscreen);
  });

  function resetLocalAttempt(examCode) {
    ["math", "reading", "science"].forEach(function (subject) {
      localStorage.removeItem("exam_answers_" + examCode + "_" + subject);
      localStorage.removeItem("exam_flagged_" + examCode + "_" + subject);
      localStorage.removeItem("exam_submitted_" + examCode + "_" + subject);
    });
    localStorage.removeItem("tsaCompletedSubjects");
  }

  async function launchExamSession(result) {
    var examCode = result.exam.examCode;
    resetLocalAttempt(examCode);
    sessionStorage.setItem("tmaMockExamSession", JSON.stringify({
      token: result.token,
      candidate: result.candidate,
      exam: result.exam,
      createdAt: new Date().toISOString()
    }));
    sessionStorage.setItem("currentExamTitle", result.exam.title);
    sessionStorage.setItem("tsaShouldFullscreen", "1");

    examShellActive = true;
    try {
      var root = document.documentElement;
      if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
      else if (root.msRequestFullscreen) await root.msRequestFullscreen();
      sessionStorage.setItem("tsaFullscreenStarted", "1");
      examShellWasFullscreen = true;
    } catch (error) {
      examShellWasFullscreen = false;
      console.warn("Fullscreen request blocked:", error);
    }

    var category = String(result.exam.category || examCode.split("_")[0] || "TSA").toUpperCase();
    elements.iframe.src = category === "TSA"
      ? "waiting.html?exam=" + encodeURIComponent(examCode) + "&from_portal=true&mock=true"
      : "confirm.html?exam=" + encodeURIComponent(examCode) + "&subject=math&single=true&from_portal=true&mock=true";
    elements.lobbyUi.style.display = "none";
    elements.loadingUi.style.display = "flex";
    setTimeout(function () {
      elements.loadingUi.style.display = "none";
      elements.iframe.style.display = "block";
    }, 1200);
  }

  async function verifyCandidate(phone, examCode) {
    if (!window.TMAMockExam) throw new Error("Dịch vụ thi thử chưa sẵn sàng.");
    var result = await window.TMAMockExam.checkIn(phone, examCode || "");
    if (result.selectionRequired) {
      showExamSelection(result.exams || []);
      return;
    }
    await launchExamSession(result);
  }

  function showExamSelection(exams) {
    elements.phoneEntryPanel.hidden = true;
    elements.examSelectPanel.hidden = false;
    elements.examOptionList.innerHTML = "";
    exams.forEach(function (exam) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "exam-option";
      button.innerHTML = '<span class="exam-option-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></span><span><span class="exam-option-title"></span><span class="exam-option-code"></span></span><svg class="exam-option-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      button.querySelector(".exam-option-title").textContent = exam.title;
      button.querySelector(".exam-option-code").textContent = exam.examCode;
      button.addEventListener("click", async function () {
        button.disabled = true;
        try {
          await verifyCandidate(pendingPhone, exam.examCode);
        } catch (error) {
          elements.examSelectPanel.hidden = true;
          elements.phoneEntryPanel.hidden = false;
          showError(error.message);
        } finally {
          button.disabled = false;
        }
      });
      elements.examOptionList.appendChild(button);
    });
  }

  elements.examSelectBack.addEventListener("click", function () {
    elements.examSelectPanel.hidden = true;
    elements.phoneEntryPanel.hidden = false;
    elements.codeInput.focus();
  });

  elements.codeForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    pendingPhone = normalizePhone(elements.codeInput.value);
    if (!validPhone(pendingPhone)) {
      showError("Vui lòng nhập số điện thoại hợp lệ đã dùng để đăng ký.");
      return;
    }
    showError("");
    setBusy(true);
    try {
      await verifyCandidate(pendingPhone, "");
    } catch (error) {
      showError(error.message || "Không thể xác thực mã dự thi.");
      setBusy(false);
    }
  });

  window.addEventListener("message", function (event) {
    if (!event || !event.data || (event.data.type !== "tsa-exam-finished" && event.data.type !== "tsa-exam-exit" && event.data.type !== "tsa-exam-submitted-loading")) return;
    if (event.data.type === "tsa-exam-submitted-loading") {
      try {
        var completedSession = JSON.parse(sessionStorage.getItem("tmaMockExamSession") || "null");
        sessionStorage.setItem("tmaResultAutoLookup", JSON.stringify({
          phone: completedSession && completedSession.candidate ? completedSession.candidate.code : "",
          examCode: event.data.examCode || (completedSession && completedSession.exam ? completedSession.exam.examCode : "")
        }));
      } catch (error) {}
      sessionStorage.removeItem("tmaMockExamSession");
      window.location.replace("result.html");
      return;
    }
    examShellActive = false;
    examShellWasFullscreen = false;
    var warning = document.getElementById("exam-shell-fullscreen-warning");
    if (warning) warning.style.display = "none";
    try {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } catch (error) {}
    elements.iframe.style.display = "none";
    elements.iframe.src = "";
    elements.loadingUi.style.display = "none";
    elements.lobbyUi.style.display = "block";
    elements.examSelectPanel.hidden = true;
    elements.phoneEntryPanel.hidden = false;
    sessionStorage.removeItem("tmaMockExamSession");
    setBusy(false);
    elements.codeInput.value = "";
  });
})();
