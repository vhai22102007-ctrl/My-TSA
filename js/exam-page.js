(() => {
  const elements = {
    lobbyUi: document.getElementById("lobby-ui"),
    loadingUi: document.getElementById("loading-ui"),
    codeForm: document.getElementById("code-form"),
    codeInput: document.getElementById("code-input"),
    submitBtn: document.getElementById("submit-btn"),
    errorMsg: document.getElementById("error-msg"),
    profileFooter: document.getElementById("profile-footer"),
    studentName: document.getElementById("student-name"),
    logoutBtn: document.getElementById("logout-btn"),
    iframe: document.getElementById("portal-iframe")
  };

  // Fullscreen state tracking variables
  let examShellActive = false;
  let examShellWasFullscreen = false;

  // Check login
  let studentInfo = null;
  try {
    studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "null");
  } catch (e) {}

  if (!studentInfo) {
    elements.errorMsg.textContent = "Bạn chưa đăng nhập. Đang chuyển hướng sang trang đăng nhập...";
    elements.submitBtn.disabled = true;
    setTimeout(() => {
      window.location.href = "login.html?redirect=exam.html";
    }, 2000);
    return;
  }

  // Display user profile info
  if (elements.studentName) {
    elements.studentName.textContent = studentInfo.name || studentInfo.email || studentInfo.username || "Học sinh";
  }
  if (elements.profileFooter) elements.profileFooter.style.display = "flex";

  // Logout handler
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("studentInfo");
      window.location.reload();
    });
  }

  // Keep long room codes intact; only remove unsupported characters.
  elements.codeInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase().slice(0, 64);
  });

  function isFullscreenActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  }

  function showExamFullscreenWarning() {
    let overlay = document.getElementById("exam-shell-fullscreen-warning");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "exam-shell-fullscreen-warning";
      overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.96);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,sans-serif;";
      overlay.innerHTML = `
        <div style="width:min(480px,100%);background:#fff;color:#0f172a;border:2px solid #135c97;border-radius:16px;padding:32px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.3);">
          <h2 style="margin:0 0 12px;color:#135c97;font-size:20px;font-weight:800;font-family:Inter,sans-serif;">YÊU CẦU TOÀN MÀN HÌNH</h2>
          <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;font-family:Inter,sans-serif;">Bài thi đang diễn ra trong chế độ toàn màn hình. Vui lòng bấm nút bên dưới để tiếp tục làm bài.</p>
          <button id="exam-shell-fullscreen-btn" type="button" style="width:100%;height:48px;border:0;border-radius:10px;background:#135c97;color:#fff;font-size:16px;font-weight:800;cursor:pointer;font-family:Inter,sans-serif;">Tiếp tục toàn màn hình</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById("exam-shell-fullscreen-btn").addEventListener("click", async () => {
        try {
          const el = document.documentElement;
          if (el.requestFullscreen) {
            await el.requestFullscreen();
          } else if (el.webkitRequestFullscreen) {
            await el.webkitRequestFullscreen();
          } else if (el.msRequestFullscreen) {
            await el.msRequestFullscreen();
          }
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
    const warning = document.getElementById("exam-shell-fullscreen-warning");
    
    // Check if the exam iframe is loaded and currently visible
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

  // Listen to fullscreen changes globally on the document
  ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach((eventName) => {
    document.addEventListener(eventName, enforceExamShellFullscreen);
  });

  // Verify and enter room
  elements.codeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawCode = elements.codeInput.value.replace(/-/g, "").trim();
    if (!rawCode) {
      elements.errorMsg.textContent = "Vui lòng nhập mã phòng thi.";
      return;
    }

    if (!/^[A-Za-z0-9_]{4,64}$/.test(rawCode)) {
      elements.errorMsg.textContent = "Mã phòng thi chỉ gồm chữ, số hoặc dấu gạch dưới.";
      return;
    }

    elements.errorMsg.textContent = "";
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = "Đang kiểm tra...";

    const examCode = rawCode.toUpperCase();

    // Validate the room against the R2 index to avoid a Database request.
    let isValid = false;
    let examTitle = "Đề thi thử TSA";

    // Exact match only. Never accept a room-code prefix.
    {
      const indexSources = [window.TMA_STORAGE_CONFIG.examsBaseUrl + "index.json"];
      for (const source of indexSources) {
        try {
          const response = await fetch(source, { cache: "default" });
          if (!response.ok) continue;
          const index = await response.json();
          const match = Array.isArray(index) ? index.find((item) => String(item.exam_code || "").toUpperCase() === examCode) : null;
          if (match && match.status !== "draft" && match.is_open === true && Number(match.question_count || 1) > 0) {
            isValid = true;
            examTitle = match.title || examTitle;
            break;
          }
        } catch (error) {
          console.warn("Không tải được nguồn mã phòng thi:", source, error);
        }
      }
    }

    if (!isValid) {
      elements.errorMsg.textContent = "Mã phòng thi không chính xác hoặc đã đóng.";
      elements.submitBtn.disabled = false;
      elements.submitBtn.textContent = "Tiếp theo";
      return;
    }

    // Mark the exam session as active
    examShellActive = true;
    examShellWasFullscreen = true;

    // 1. Trigger Fullscreen on the parent document (locks fullscreen mode)
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      sessionStorage.setItem("tsaShouldFullscreen", "1");
      sessionStorage.setItem("tsaFullscreenStarted", "1");
    } catch (fsErr) {
      console.warn("Fullscreen request blocked or failed:", fsErr);
    }

    // Set exam metadata
    sessionStorage.setItem("currentExamTitle", examTitle);

    // 2. Load the waiting lobby inside the iframe (keeps fullscreen locked during redirect)
    if (elements.iframe) {
      elements.iframe.src = `waiting.html?exam=${examCode}&from_portal=true`;
    }

    // 3. Show premium loading screen overlay
    elements.lobbyUi.style.display = "none";
    elements.loadingUi.style.display = "flex";

    // 4. Transition to show the iframe after loading animation completes
    setTimeout(() => {
      elements.loadingUi.style.display = "none";
      if (elements.iframe) {
        elements.iframe.style.display = "block";
      }
    }, 1800);
  });

  // Listen to exit signals from the iframe
  window.addEventListener("message", (event) => {
    if (event && event.data) {
      if (event.data.type === "tsa-exam-finished" || event.data.type === "tsa-exam-exit") {
        // Reset state so fullscreen check is bypassed
        examShellActive = false;
        examShellWasFullscreen = false;

        const warning = document.getElementById("exam-shell-fullscreen-warning");
        if (warning) warning.style.display = "none";

        // Exit fullscreen mode on parent window
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        } catch (fsErr) {
          console.warn("Exit fullscreen failed:", fsErr);
        }

        // Hide iframe and clear its source to release memory
        if (elements.iframe) {
          elements.iframe.style.display = "none";
          elements.iframe.src = "";
        }

        // Reset and display lobby card
        elements.lobbyUi.style.display = "block";
        elements.loadingUi.style.display = "none";
        
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = "Tiếp theo";
        elements.codeInput.value = "";
      }
    }
  });
})();
