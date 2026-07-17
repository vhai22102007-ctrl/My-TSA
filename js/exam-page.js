(() => {
  let supabaseClient = null;
  if (typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
    supabaseClient = supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  }

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
  elements.studentName.textContent = studentInfo.name || studentInfo.email || studentInfo.username || "Học sinh";
  elements.profileFooter.style.display = "flex";

  // Logout handler
  elements.logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("studentInfo");
    window.location.reload();
  });

  // Dynamic code formatting (XXXX-XXXX-XX)
  elements.codeInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (value.length > 10) value = value.slice(0, 10);
    
    let formatted = "";
    if (value.length > 0) {
      formatted += value.slice(0, 4);
    }
    if (value.length > 4) {
      formatted += "-" + value.slice(4, 8);
    }
    if (value.length > 8) {
      formatted += "-" + value.slice(8, 10);
    }
    e.target.value = formatted;
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

    if (rawCode.length !== 10) {
      elements.errorMsg.textContent = "Mã dự thi phải gồm đúng 10 ký tự.";
      return;
    }

    elements.errorMsg.textContent = "";
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = "Đang kiểm tra...";

    const examCode = rawCode.toUpperCase();

    // Query exam code from database
    let isValid = false;
    let examTitle = "Đề thi thử TSA";

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('exams')
          .select('exam_code, title')
          .eq('exam_code', examCode)
          .maybeSingle();

        if (!error && data) {
          isValid = true;
          examTitle = data.title || examTitle;
        }
      } catch (err) {
        console.error("DB Query error:", err);
      }
    }

    // Local check fallback
    if (!isValid) {
      const fallbackExams = ["TSA_PRACTICE_FULL_01", "TSA_PRACTICE_FULL_02", "TSA_PRACTICE_FULL_03", "TSA_PRACTICE_FULL_04", "TSA_PRACTICE_FULL_05"];
      if (fallbackExams.includes(examCode) || examCode.startsWith("TSA_")) {
        isValid = true;
        examTitle = "Bài thi thử: " + examCode.replace(/_/g, " ");
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
