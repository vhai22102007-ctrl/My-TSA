(() => {
      function esc(str) {
        if (str == null) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      let currentLmsCourseId = "";
      let currentLmsLessonId = "";
      let isStudyDropdownListenerRegistered = false;

      // Result Modal logic
      const resultModal = document.getElementById("exam-result-modal");
      const closeResultBtn = document.getElementById("close-result-modal");
      const resultBackdrop = document.getElementById("exam-result-modal-backdrop");

      // Cert Modal logic
      const certModal = document.getElementById("cert-image-modal");
      const closeCertBtn = document.getElementById("close-cert-modal");
      const certBackdrop = document.getElementById("cert-image-modal-backdrop");

      window.openResultModal = (data) => {
        document.getElementById("result-modal-title").innerText = data.title;
        document.getElementById("result-modal-score").innerText = data.score;
        document.getElementById("result-modal-math-count").innerText = data.math;
        document.getElementById("result-modal-reading-count").innerText = data.reading;
        document.getElementById("result-modal-science-count").innerText = data.science;
        document.getElementById("result-modal-council").innerText = data.council;
        document.getElementById("result-modal-prep-time").innerText = data.prep;
        document.getElementById("result-modal-enter-time").innerText = data.enter;
        document.getElementById("result-modal-start-time").innerText = data.start;
        document.getElementById("result-modal-room").innerText = data.room;
        document.getElementById("result-modal-sbd").innerText = data.sbd;
        resultModal.hidden = false;
      };

      [closeResultBtn, resultBackdrop].forEach(el => {
        if (el) el.addEventListener("click", () => {
          if (resultModal) resultModal.hidden = true;
          exitFullscreenIfActive();
        });
      });

      if (certModal && closeCertBtn && certBackdrop) {
        [closeCertBtn, certBackdrop].forEach(el => {
          el.addEventListener("click", () => certModal.hidden = true);
        });
      }

      // HUST Result Modal logic
      const hustModal = document.getElementById("hust-result-modal");
      const closeHustBtn = document.getElementById("close-hust-modal");
      const hustBackdrop = document.getElementById("hust-result-modal-backdrop");
      const hustCertBtn = document.getElementById("hust-modal-cert-btn");

      [closeHustBtn, hustBackdrop].forEach(el => {
        if (el) el.addEventListener("click", () => {
          if (hustModal) hustModal.hidden = true;
        });
      });

      if (hustCertBtn && certModal) {
        hustCertBtn.addEventListener("click", () => {
          if (hustModal) hustModal.hidden = true;
          certModal.hidden = false;
        });
      }

      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      window.addEventListener("pageshow", () => window.scrollTo(0, 0));

      function resetExamAttempt(redirectUrl) {
        const targetUrl = new URL(redirectUrl, window.location.href);
        const examCode = (targetUrl.searchParams.get("exam") || "TSA001").trim() || "TSA001";
        ["math", "reading", "science"].forEach((subjectKey) => {
          localStorage.removeItem(`exam_submitted_${examCode}_${subjectKey}`);
          localStorage.removeItem(`exam_answers_${examCode}_${subjectKey}`);
          localStorage.removeItem(`exam_flagged_${examCode}_${subjectKey}`);
        });
      }

      let examShellActive = false;
      let examShellWasFullscreen = false;

      function isRootFullscreen() {
        return Boolean(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        );
      }

      function exitFullscreenIfActive() {
        if (isRootFullscreen()) {
          const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
          if (exit) {
            try { Promise.resolve(exit.call(document)).catch(() => {}); } catch (error) {}
          }
        }
      }

      function requestRootFullscreen() {
        if (isRootFullscreen()) return Promise.resolve();

        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (!req) return Promise.reject(new Error("Fullscreen API is not supported."));

        return Promise.resolve(req.call(el));
      }

      function showExamFullscreenWarning() {
        let overlay = document.getElementById("exam-shell-fullscreen-warning");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "exam-shell-fullscreen-warning";
          overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.96);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,sans-serif;";
          overlay.innerHTML = `
            <div style="width:min(480px,100%);background:#fff;color:#0f172a;border:2px solid #135c97;border-radius:16px;padding:32px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.3);">
              <h2 style="margin:0 0 12px;color:#135c97;font-size:20px;font-weight:800;">YÊU CẦU TOÀN MÀN HÌNH</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Bài thi đang diễn ra trong chế độ toàn màn hình. Vui lòng bấm nút bên dưới để tiếp tục làm bài.</p>
              <button id="exam-shell-fullscreen-btn" type="button" style="width:100%;height:48px;border:0;border-radius:10px;background:#135c97;color:#fff;font-size:16px;font-weight:800;cursor:pointer;">Tiếp tục toàn màn hình</button>
            </div>
          `;
          document.body.appendChild(overlay);

          document.getElementById("exam-shell-fullscreen-btn").addEventListener("click", () => {
            requestRootFullscreen()
              .then(() => {
                sessionStorage.setItem("tsaFullscreenStarted", "1");
                enforceExamShellFullscreen();
              })
              .catch((error) => console.warn("Fullscreen request rejected:", error));
          });
        }

        overlay.style.display = "flex";
      }

      function enforceExamShellFullscreen() {
        // Bảng "YÊU CẦU TOÀN MÀN HÌNH" CHỈ được phép xuất hiện khi đang thực sự ở
        // trong phòng thi — tức lớp vỏ iframe phòng thi còn tồn tại trong DOM.
        // Nếu không có iframe (đang ở trang chủ, đã nộp bài, hoặc cờ bị kẹt từ
        // phiên trước) thì luôn ẩn bảng và coi như không còn ở phòng thi.
        const shell = document.getElementById("exam-fullscreen-shell");
        const warning = document.getElementById("exam-shell-fullscreen-warning");

        if (!examShellActive || !shell) {
          examShellActive = false;
          examShellWasFullscreen = false;
          if (warning) warning.style.display = "none";
          return;
        }

        if (isRootFullscreen()) {
          examShellWasFullscreen = true;
          sessionStorage.setItem("tsaFullscreenStarted", "1");
          if (warning) warning.style.display = "none";
        } else if (examShellWasFullscreen) {
          showExamFullscreenWarning();
        }
      }

      ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach((eventName) => {
        document.addEventListener(eventName, enforceExamShellFullscreen);
      });

      function launchExamShell(redirectUrl) {
        examShellActive = true;
        document.body.style.overflow = "hidden";

        // --- Bước 1: Tạo overlay loading mượt trên select.html ---
        let loadingOverlay = document.getElementById("exam-shell-loading-overlay");
        if (!loadingOverlay) {
          loadingOverlay = document.createElement("div");
          loadingOverlay.id = "exam-shell-loading-overlay";
          loadingOverlay.style.cssText = [
            "position:fixed","inset:0","z-index:2147483601",
            "background:#fff",
            "display:flex","align-items:center","justify-content:center",
            "opacity:1","transition:opacity 0.45s ease","font-family:'Times New Roman',serif"
          ].join(";");
          loadingOverlay.innerHTML = `
            <style>
              @keyframes esl-brandFadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
              @keyframes esl-brandDrawLine{0%{stroke-dashoffset:200}100%{stroke-dashoffset:0}}
              @keyframes esl-brandFillLogo{0%,35%{fill:transparent}45%,85%{fill:#000}100%{fill:transparent}}
              @keyframes esl-brandLoadingBar{0%{transform:scaleX(0);transform-origin:left}49%{transform:scaleX(1);transform-origin:left}50%{transform:scaleX(1);transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}
              .esl-brand-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;animation:esl-brandFadeIn .8s ease-out forwards}
              .esl-logo-svg{width:160px;height:160px;margin-bottom:28px;overflow:visible;filter:drop-shadow(0 8px 6px rgba(0,0,0,.12))}
              .esl-logo-path{fill:transparent;stroke:#000;stroke-width:3;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:200;stroke-dashoffset:200;animation:esl-brandDrawLine 2.5s cubic-bezier(.4,0,.2,1) infinite alternate, esl-brandFillLogo 5s ease-in-out infinite}
              .esl-face-top{animation-delay:0s,0s}
              .esl-face-left{animation-delay:.2s,.2s}
              .esl-face-right{animation-delay:.4s,.4s}
              .esl-brand-title{margin:0 0 20px;font-family:'Times New Roman',serif;font-size:24px;font-weight:900;letter-spacing:6px;color:#000;text-transform:uppercase;text-align:center}
              .esl-bar-wrap{position:relative;width:160px;height:2px;background:#e0e0e0;overflow:hidden}
              .esl-bar-fill{position:absolute;top:0;left:0;width:100%;height:100%;background:#000;transform-origin:left;animation:esl-brandLoadingBar 2s cubic-bezier(.65,0,.35,1) infinite}
            </style>
            <div class="esl-brand-loader">
              <svg class="esl-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path class="esl-logo-path esl-face-top"  d="M 50 15 L 85 35 L 50 55 L 15 35 Z"/>
                <path class="esl-logo-path esl-face-left" d="M 15 35 L 50 55 L 50 90 L 15 70 Z"/>
                <path class="esl-logo-path esl-face-right" d="M 50 55 L 85 35 L 85 70 L 50 90 Z"/>
              </svg>
              <div class="esl-brand-title">TMA Study</div>
              <div class="esl-bar-wrap"><div class="esl-bar-fill"></div></div>
            </div>
          `;
          document.body.appendChild(loadingOverlay);
        } else {
          loadingOverlay.style.opacity = "1";
          loadingOverlay.style.filter = "blur(0)";
          loadingOverlay.style.pointerEvents = "auto";
          loadingOverlay.style.display = "flex";
        }

        // --- Bước 2: Tạo iframe nhưng ẩn đi, chờ load xong ---
        let shell = document.getElementById("exam-fullscreen-shell");
        if (!shell) {
          shell = document.createElement("div");
          shell.id = "exam-fullscreen-shell";
          shell.style.cssText = "position:fixed;inset:0;z-index:2147483600;background:#fff;opacity:0;";
          shell.innerHTML = '<iframe id="exam-fullscreen-frame" title="Phòng thi" allow="fullscreen" allowfullscreen style="width:100%;height:100%;border:0;display:block;background:#fff;"></iframe>';
          document.body.appendChild(shell);
        }

        const frame = document.getElementById("exam-fullscreen-frame");

        // Khi iframe load xong: ẩn overlay, hiện iframe (tối thiểu 2 giây, nếu xem đáp án thì 200ms cho mượt)
        const overlayShowStart = Date.now();
        function onFrameReady() {
          frame.removeEventListener("load", onFrameReady);
          const elapsed = Date.now() - overlayShowStart;
          const isSolution = redirectUrl.includes("mode=solution") || redirectUrl.includes("view_solution");
          const minDelay = isSolution ? 200 : 2000;
          const remaining = Math.max(0, minDelay - elapsed);
          setTimeout(() => {
            shell.style.transition = "opacity 0.25s ease";
            shell.style.opacity = "1";
            loadingOverlay.style.transition = "opacity 0.45s ease, filter 0.45s ease";
            loadingOverlay.style.opacity = "0";
            loadingOverlay.style.filter = "blur(8px)";
            setTimeout(() => {
              loadingOverlay.style.display = "none";
            }, 470);
          }, remaining + 100);
        }
        frame.addEventListener("load", onFrameReady);
        frame.src = redirectUrl;

        enforceExamShellFullscreen();
      }

      // Đóng phòng thi: gỡ lớp vỏ iframe và THOÁT toàn màn hình.
      // Gọi khi học sinh nộp bài / hết giờ (iframe gửi postMessage "tsa-exam-finished").
      function closeExamShell() {
        examShellActive = false;
        examShellWasFullscreen = false;

        const warning = document.getElementById("exam-shell-fullscreen-warning");
        if (warning) warning.style.display = "none";

        // Dọn loading overlay nếu còn
        const loadingOverlay = document.getElementById("exam-shell-loading-overlay");
        if (loadingOverlay) loadingOverlay.remove();

        const shell = document.getElementById("exam-fullscreen-shell");
        if (shell) {
          shell.style.transition = "opacity 0.25s ease";
          shell.style.opacity = "0";
          setTimeout(() => {
            shell.remove();
          }, 250);
        }

        document.body.style.overflow = "";

        sessionStorage.removeItem("tsaShouldFullscreen");
        sessionStorage.removeItem("tsaFullscreenStarted");

      }

      function showParentSubmitLoadingOverlay() {
        let loadingOverlay = document.getElementById("exam-submit-loading-overlay");
        if (!loadingOverlay) {
          loadingOverlay = document.createElement("div");
          loadingOverlay.id = "exam-submit-loading-overlay";
          loadingOverlay.style.cssText = [
            "position:fixed","inset:0","z-index:2147483601",
            "background:#fff",
            "display:flex","align-items:center","justify-content:center",
            "opacity:1","transition:opacity 0.45s ease","font-family:'Times New Roman',serif"
          ].join(";");
          loadingOverlay.innerHTML = `
            <style>
              @keyframes esl-brandFadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
              @keyframes esl-brandDrawLine{0%{stroke-dashoffset:200}100%{stroke-dashoffset:0}}
              @keyframes esl-brandFillLogo{0%,35%{fill:transparent}45%,85%{fill:#000}100%{fill:transparent}}
              @keyframes esl-brandLoadingBar{0%{transform:scaleX(0);transform-origin:left}49%{transform:scaleX(1);transform-origin:left}50%{transform:scaleX(1);transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}
              .esl-brand-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;animation:esl-brandFadeIn .8s ease-out forwards}
              .esl-logo-svg{width:160px;height:160px;margin-bottom:28px;overflow:visible;filter:drop-shadow(0 8px 6px rgba(0,0,0,.12))}
              .esl-logo-path{fill:transparent;stroke:#000;stroke-width:3;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:200;stroke-dashoffset:200;animation:esl-brandDrawLine 2.5s cubic-bezier(.4,0,.2,1) infinite alternate, esl-brandFillLogo 5s ease-in-out infinite}
              .esl-face-top{animation-delay:0s,0s}
              .esl-face-left{animation-delay:.2s,.2s}
              .esl-face-right{animation-delay:.4s,.4s}
              .esl-brand-title{margin:0 0 20px;font-family:'Times New Roman',serif;font-size:24px;font-weight:900;letter-spacing:6px;color:#000;text-transform:uppercase;text-align:center}
              .esl-bar-wrap{position:relative;width:160px;height:2px;background:#e0e0e0;overflow:hidden}
              .esl-bar-fill{position:absolute;top:0;left:0;width:100%;height:100%;background:#000;transform-origin:left;animation:esl-brandLoadingBar 2s cubic-bezier(.65,0,.35,1) infinite}
            </style>
            <div class="esl-brand-loader">
              <svg class="esl-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path class="esl-logo-path esl-face-top"  d="M 50 15 L 85 35 L 50 55 L 15 35 Z"/>
                <path class="esl-logo-path esl-face-left" d="M 15 35 L 50 55 L 50 90 L 15 70 Z"/>
                <path class="esl-logo-path esl-face-right" d="M 50 55 L 85 35 L 85 70 L 50 90 Z"/>
              </svg>
              <div class="esl-brand-title">TMA Study</div>
              <div class="esl-bar-wrap"><div class="esl-bar-fill"></div></div>
            </div>
          `;
          document.body.appendChild(loadingOverlay);
        } else {
          loadingOverlay.style.opacity = "1";
          loadingOverlay.style.filter = "blur(0)";
          loadingOverlay.style.pointerEvents = "auto";
          loadingOverlay.style.display = "flex";
        }
      }

      function hideParentSubmitLoadingOverlay() {
        const loadingOverlay = document.getElementById("exam-submit-loading-overlay");
        if (loadingOverlay) {
          loadingOverlay.style.transition = "opacity 0.4s ease, filter 0.4s ease";
          loadingOverlay.style.opacity = "0";
          loadingOverlay.style.filter = "blur(8px)";
          setTimeout(() => {
            loadingOverlay.style.display = "none";
          }, 420);
        }
      }

      window.addEventListener("message", (event) => {
        if (event && event.data) {
          const isSolutionMode = event.data.isSolutionMode === true;
          if (event.data.type === "tsa-exam-finished") {
            closeExamShell();
          } else if (event.data.type === "tsa-exam-submitting") {
            showParentSubmitLoadingOverlay();
          } else if (event.data.type === "tsa-exam-submitted-loading") {
            const finishedExamCode = event.data.examCode;
            const finishedExamTitle = event.data.examTitle;
            
            showParentSubmitLoadingOverlay();
            closeExamShell();

            // Nạp bảng điểm ngay lập tức (bên dưới lớp phủ loading) để không bị trễ
            if (!isSolutionMode && finishedExamCode && typeof showExamResultModal === "function") {
              showExamResultModal(finishedExamCode, finishedExamTitle);
            }

            // Thêm mã đề vào danh sách đã làm và tải lại các giao diện danh sách đề thi
            if (finishedExamCode && typeof completedExams !== "undefined") {
              completedExams.add(finishedExamCode);
              if (typeof updatePracticeRoomUI === "function") updatePracticeRoomUI();
              if (typeof updateExamRoomUI === "function") updateExamRoomUI();
              if (typeof renderExams === "function") renderExams();
            }

            // Ẩn lớp phủ loading mượt mà sau 1.2 giây
            setTimeout(() => {
              hideParentSubmitLoadingOverlay();
            }, 1200);
          }
        }
      });

      window.startExamDirectly = function(examTitle, redirectUrl) {
        resetExamAttempt(redirectUrl);
        
        sessionStorage.setItem('currentExamTitle', examTitle);
        sessionStorage.setItem('tsaShouldFullscreen', '1');
        sessionStorage.removeItem('tsaFullscreenStarted');

        requestRootFullscreen()
            .then(() => {
              sessionStorage.setItem('tsaFullscreenStarted', '1');
              examShellWasFullscreen = true;
              setTimeout(() => {
                launchExamShell(redirectUrl);
              }, 250);
            })
            .catch((err) => {
              console.warn("Fullscreen request rejected:", err);
              launchExamShell(redirectUrl);
            });
      };

      let studentInfo = null;
      try {
        studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "null");
      } catch (error) {
        studentInfo = null;
      }
      let studentEmail = studentInfo ? studentInfo.email : "";
      let studentToken = studentInfo ? studentInfo.token : "";

      // Khởi tạo Supabase Client từ cấu hình dùng chung
      let supabaseClient = null;
      let supabaseUrl = '';
      let supabaseStorageUrl = '';
      if (typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
        supabaseUrl = window.SUPABASE_CONFIG.url;
        supabaseClient = supabase.createClient(supabaseUrl, window.SUPABASE_CONFIG.anonKey, {
          global: {
            headers: {
              'x-student-email': studentEmail || '',
              'x-student-password-hash': studentToken || ''
            }
          }
        });
        window.supabaseClient = supabaseClient;
        supabaseStorageUrl = 'https://jlnfnnrboozwywikxtel.supabase.co/storage/v1/object/public/exams/';
      }

      /* Giữ giống logic cũ: chưa đăng nhập thì quay về login.html */
      if (!studentInfo) {
        window.location.href = "login.html";
        return;
      }

      // Define helpers globally at top for synchronous execution
      function cleanCatStr(s) {
        return String(s || "").trim().normalize("NFC").toUpperCase();
      }

      window.syncLibraryDocs = function() {
        try {
          const cached = JSON.parse(localStorage.getItem('tmaTsaDriveLinks'));
          if (Array.isArray(cached) && cached.length > 0) {
            window.LIBRARY_DOCS = cached.map(doc => {
              return {
                id: doc.id || "doc_" + Math.random(),
                title: doc.title || "",
                category: String(doc.category || "ĐGTD").trim().normalize("NFC").toUpperCase(),
                subject: String(doc.subject || "TOÁN").trim().normalize("NFC").toUpperCase(),
                views: doc.views || Math.floor(Math.random() * 3000) + 500,
                date: doc.date || new Date().toLocaleDateString("vi-VN"),
                url: doc.url || ""
              };
            });
          }
        } catch (e) {
          console.warn("Failed to parse cached library docs:", e);
        }
      };

      // Run sync immediately on page load
      window.syncLibraryDocs();


      const completedExams = new Set();

      async function loadCompletedExams() {
        // Tải lịch sử thi cục bộ từ localStorage trước
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("tma_tsa_last_local_result_")) {
            const examCode = key.substring("tma_tsa_last_local_result_".length);
            completedExams.add(examCode);
          }
        }

        // Tải thêm từ Supabase
        if (supabaseClient && studentEmail) {
          try {
            const { data, error } = await supabaseClient
              .from('exam_results')
              .select('exam_code')
              .eq('user_email', studentEmail);
            if (!error && data) {
              data.forEach(item => {
                if (item.exam_code) {
                  completedExams.add(item.exam_code);
                }
              });
            }
          } catch (err) {
            console.error("Lỗi tải danh sách đề đã làm:", err);
          }
        }
      }

      // Khởi chạy tải lịch sử bài làm
      loadCompletedExams().then(() => {
        if (typeof updatePracticeRoomUI === "function") updatePracticeRoomUI();
        if (typeof updateExamRoomUI === "function") updateExamRoomUI();
        if (typeof renderExams === "function") renderExams();
      });

      const VIETNAM_PROVINCES = [
        "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
      ];
      const MAJOR_DISTRICTS = {
        "Hà Nội": [
          "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Long Biên", "Quận Cầu Giấy", "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Hoàng Mai", "Quận Thanh Xuân", "Huyện Sóc Sơn", "Huyện Đông Anh", "Huyện Gia Lâm", "Quận Nam Từ Liêm", "Huyện Thanh Trì", "Quận Bắc Từ Liêm", "Huyện Mê Linh", "Quận Hà Đông", "Thị xã Sơn Tây", "Huyện Ba Vì", "Huyện Phúc Thọ", "Huyện Đan Phượng", "Huyện Hoài Đức", "Huyện Quốc Oai", "Huyện Thạch Thất", "Huyện Chương Mỹ", "Huyện Thanh Oai", "Huyện Thường Tín", "Huyện Phú Xuyên", "Huyện Ứng Hòa", "Huyện Mỹ Đức"
        ],
        "TP. Hồ Chí Minh": [
          "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Quận Bình Tân", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú", "Thành phố Thủ Đức", "Huyện Bình Chánh", "Huyện Cần Giờ", "Huyện Củ Chi", "Huyện Hóc Môn", "Huyện Nhà Bè"
        ],
        "Đà Nẵng": [
          "Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Liên Chiểu", "Quận Cẩm Lệ", "Huyện Hòa Vang", "Huyện Hoàng Sa"
        ]
      };

      function formatDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`; // dd/mm/yyyy
        }
        return dateStr;
      }

      window.renderDashboardHistory = function() {
        const grid = document.getElementById("activity-graph-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const activityMap = {};
        const historyData = window.EXAM_HISTORY_DATA || [];
        let totalExamsThisYear = 0;

        // Group attempts by date string 'YYYY-MM-DD'
        historyData.forEach(attempt => {
          if (!attempt.created_at) return;
          const d = new Date(attempt.created_at);
          if (isNaN(d.getTime())) return;
          
          // Only count for current year (2026)
          if (d.getFullYear() === 2026) {
            totalExamsThisYear++;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
          }
        });

        // Map count to level (0-4)
        const getLevelForCount = (count) => {
          if (!count) return 0;
          if (count === 1) return 1;
          if (count === 2) return 2;
          if (count === 3) return 3;
          return 4; // 4 or more
        };

        // Update total count footer text in DOM if exists
        const totalCountSpan = document.querySelector(".total-exams-count");
        if (totalCountSpan) {
          totalCountSpan.textContent = `${totalExamsThisYear} bài thi trong năm`;
        }

        const startDate = new Date(2026, 0, 1);
        const dayOfWeek = startDate.getDay(); // Thursday

        // Draw preceding empty cells in the first column
        let currentCol = document.createElement("div");
        currentCol.className = "graph-col";
        for (let i = 0; i < dayOfWeek; i++) {
          const emptyCell = document.createElement("div");
          emptyCell.className = "graph-cell empty";
          currentCol.appendChild(emptyCell);
        }

        // Loop through 365 days of 2026
        let tempDate = new Date(startDate);
        while (tempDate.getFullYear() === 2026) {
          const year = tempDate.getFullYear();
          const month = String(tempDate.getMonth() + 1).padStart(2, '0');
          const day = String(tempDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          const count = activityMap[dateStr] || 0;
          const level = getLevelForCount(count);

          const cell = document.createElement("div");
          cell.className = `graph-cell level-${level}`;
          
          const pad = (n) => String(n).padStart(2, '0');
          const dateStrFormatted = `${pad(tempDate.getDate())}/${pad(tempDate.getMonth() + 1)}/2026`;
          
          cell.setAttribute("data-count", count);
          cell.setAttribute("data-date", dateStrFormatted);
          cell.title = `${dateStrFormatted}: ${count > 0 ? count + ' bài thi' : 'Không có bài thi'}`;
          
          currentCol.appendChild(cell);

          if (currentCol.children.length === 7) {
            grid.appendChild(currentCol);
            currentCol = document.createElement("div");
            currentCol.className = "graph-col";
          }

          tempDate.setDate(tempDate.getDate() + 1);
        }

        // Append the last column if it has cells
        if (currentCol.children.length > 0) {
          while (currentCol.children.length < 7) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "graph-cell empty";
            currentCol.appendChild(emptyCell);
          }
          grid.appendChild(currentCol);
        }

        // Setup custom tooltip functionality
        const container = document.querySelector(".activity-graph-container");
        if (container) {
          let tooltip = container.querySelector(".graph-tooltip");
          if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "graph-tooltip";
            container.appendChild(tooltip);
          }

          let activeLockedCell = null;

          const showTooltip = (cellEl) => {
            const count = parseInt(cellEl.getAttribute("data-count") || "0", 10);
            const dateStr = cellEl.getAttribute("data-date");
            const rect = cellEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const left = rect.left - containerRect.left + (rect.width / 2);
            const top = rect.top - containerRect.top;
            
            tooltip.innerHTML = `<strong>${count > 0 ? count + ' bài thi' : 'Không có bài thi'}</strong> vào ngày ${dateStr}`;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top - 8}px`;
            tooltip.style.display = "block";
            
            // Allow CSS transition to play after display: block
            setTimeout(() => {
              tooltip.style.opacity = "1";
              tooltip.style.transform = "translate(-50%, -100%) scale(1)";
            }, 10);
          };

          const hideTooltip = () => {
            if (activeLockedCell) return;
            tooltip.style.opacity = "0";
            tooltip.style.transform = "translate(-50%, -100%) scale(0.95)";
            setTimeout(() => {
              if (tooltip.style.opacity === "0") {
                tooltip.style.display = "none";
              }
            }, 150);
          };

          // Attach events to all non-empty cells
          const cells = grid.querySelectorAll(".graph-cell:not(.empty)");
          cells.forEach(c => {
            c.addEventListener("mouseenter", () => {
              if (!activeLockedCell) showTooltip(c);
            });
            c.addEventListener("mouseleave", hideTooltip);
            c.addEventListener("click", (e) => {
              e.stopPropagation();
              if (activeLockedCell === c) {
                activeLockedCell = null;
                hideTooltip();
              } else {
                activeLockedCell = c;
                showTooltip(c);
              }
            });
          });

          // Click outside to dismiss tooltip
          document.addEventListener("click", (e) => {
            if (activeLockedCell && !grid.contains(e.target)) {
              activeLockedCell = null;
              hideTooltip();
            }
          });
        }
      };

      async function loadHistoryDataOnly() {
        let studentCode = studentInfo?.email || "test";
        try {
          const cached = JSON.parse(localStorage.getItem("studentInfo"));
          if (cached) {
            studentCode = cached.email || cached.username || studentCode;
          }
        } catch (e) {}

        let data = [];
        if (supabaseClient) {
          try {
            const { data: dbData, error } = await supabaseClient
              .from('exam_results')
              .select('id, exam_code, user_email, correct_count, total_questions, score, created_at')
              .eq('user_email', studentCode)
              .order('created_at', { ascending: false })
              .limit(50);
            if (!error && dbData) {
              data = dbData;
            }
          } catch (err) {
            console.error("Lỗi khi tải lịch sử từ Supabase:", err);
          }
        }

        let localAttempts = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("tma_tsa_last_local_result_")) {
            try {
              const item = JSON.parse(localStorage.getItem(key));
              if (item && item.exam_code) {
                localAttempts.push(item);
              }
            } catch (e) {}
          }
        }

        let combined = data || [];
        localAttempts.forEach(localAtt => {
          if (!combined.some(c => String(c.id) === String(localAtt.id))) {
            combined.push(localAtt);
          }
        });

        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        window.EXAM_HISTORY_DATA = combined;
        if (typeof window.renderDashboardHistory === "function") {
          window.renderDashboardHistory();
        }
      }

      function updateAccountUI() {
        if (!studentInfo) return;
        const displayName = (studentInfo.name || studentInfo.username || studentInfo.email || "Tài khoản test").replace(/[▪■•]/g, "").trim();
        
        const dispNameEl = document.getElementById("student-display-name");
        if (dispNameEl) dispNameEl.textContent = displayName;

        // Motivational quote and target reminder card for History page
        const historyGreetingEl = document.getElementById("history-welcome-greeting");
        if (historyGreetingEl) {
          const quotes = [
            "Con đường ngắn nhất để vượt qua khó khăn là đi xuyên qua nó. Hãy tiếp tục nỗ lực vì mục tiêu TSA!",
            "Sự kiên trì của ngày hôm nay sẽ là trái ngọt của ngày mai. Mỗi bài luyện tập là một bước tiến gần hơn đến thủ khoa!",
            "Đừng so sánh bản thân với người khác. Hãy so sánh bản thân với chính mình ngày hôm qua. Cố lên bạn nhé!",
            "Thành công không phải là ngẫu nhiên, đó là kết quả của sự chuẩn bị chu đáo và tinh thần tự học bền bỉ."
          ];
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          
          historyGreetingEl.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; background: #eff3f8; border-radius: 12px; padding: 14px 18px; font-family: 'Inter', sans-serif; box-sizing: border-box; width: fit-content; max-width: 100%;">
              <!-- Row 1: Quote -->
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="#0f5a9e" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                </svg>
                <p style="margin: 0; font-size: 13.5px; font-style: italic; color: #334155; line-height: 1.5;">
                  Chào <strong>${displayName}</strong>, "${randomQuote}"
                </p>
              </div>
            </div>
          `;
        }

        const logDispNameEl = document.getElementById("logout-display-name");
        if (logDispNameEl) logDispNameEl.textContent = displayName;
        
        const welcomeStudentName = document.getElementById("welcome-student-name");
        if (welcomeStudentName) welcomeStudentName.textContent = displayName;

        // Welcome name in bold dashboard greeting
        const welcomeStudentNameBold = document.getElementById("welcome-student-name-bold");
        if (welcomeStudentNameBold) welcomeStudentNameBold.textContent = displayName;

        // Sidebar Profile Box update
        const sidebarStudentName = document.getElementById("sidebar-student-name");
        if (sidebarStudentName) sidebarStudentName.textContent = displayName;

        const sidebarStudentUsername = document.getElementById("sidebar-student-username");
        if (sidebarStudentUsername) {
          sidebarStudentUsername.textContent = "TMA Study premium";
        }

        const gender = studentInfo?.gender || "Nam";
        const avatarFileName = gender === "Nữ" ? "nu.png" : "nam.png";
        const avatarUrl = `https://assets.tmastudy.io.vn/assets/${avatarFileName}`;
        const localAvatarUrl = `../assets/${avatarFileName}`;

        const sidebarAvatarImg = document.getElementById("sidebar-avatar-img");
        if (sidebarAvatarImg) {
          sidebarAvatarImg.src = avatarUrl;
          sidebarAvatarImg.onerror = () => {
            sidebarAvatarImg.src = localAvatarUrl;
          };
        }

        const topbarAvatarImg = document.getElementById("topbar-avatar-img");
        if (topbarAvatarImg) {
          topbarAvatarImg.src = avatarUrl;
          topbarAvatarImg.onerror = () => {
            topbarAvatarImg.src = localAvatarUrl;
          };
        }

        const logoutAvatarImg = document.getElementById("logout-avatar-img");
        if (logoutAvatarImg) {
          logoutAvatarImg.src = avatarUrl;
          logoutAvatarImg.onerror = () => {
            logoutAvatarImg.src = localAvatarUrl;
          };
        }

        // Dashboard date update
        const welcomeCurrentDate = document.getElementById("welcome-current-date");
        if (welcomeCurrentDate && typeof getVietnameseCurrentDate === "function") {
          welcomeCurrentDate.textContent = getVietnameseCurrentDate();
        }

        // Metrics update
        const metricEnrolledCount = document.getElementById("metric-enrolled-count");
        if (metricEnrolledCount && typeof getRegisteredCourseIds === "function") {
          metricEnrolledCount.textContent = getRegisteredCourseIds().length;
        }

        const metricLessonsCompleted = document.getElementById("metric-lessons-completed");
        if (metricLessonsCompleted && window.completedLessonIds) {
          metricLessonsCompleted.textContent = window.completedLessonIds.length;
        }

        const metricStudyHours = document.getElementById("metric-study-hours");
        if (metricStudyHours) {
          const completedCount = window.completedLessonIds ? window.completedLessonIds.length : 0;
          metricStudyHours.textContent = Math.round(completedCount * 0.4 * 10) / 10;
        }

        // Render dashboard elements
        if (typeof window.renderDashboardHistory === "function") window.renderDashboardHistory();
        if (typeof window.renderDashboardCourses === "function") window.renderDashboardCourses();
        if (typeof loadHistoryDataOnly === "function") loadHistoryDataOnly();
        
        const accountStudentName = document.getElementById("account-student-name");
        if (accountStudentName) accountStudentName.textContent = displayName;
        
        const accountStudentSub = document.getElementById("account-student-sub");
        if (accountStudentSub) {
          accountStudentSub.textContent = studentInfo.className ? `${studentInfo.className} · ${studentInfo.school || "TMA TSA"}` : "Lớp chuyên sâu TSA 2026";
        }

        // Detailed profile fields
        const fullNameEl = document.getElementById("account-full-name");
        if (fullNameEl) fullNameEl.textContent = studentInfo.name || "Chưa cập nhật";
        
        const usernameEl = document.getElementById("account-username");
        if (usernameEl) usernameEl.textContent = studentInfo.username || "Chưa cập nhật";

        const dobEl = document.getElementById("account-dob");
        if (dobEl) dobEl.textContent = studentInfo.dob ? formatDate(studentInfo.dob) : "Chưa cập nhật";

        const genderEl = document.getElementById("account-gender");
        if (genderEl) genderEl.textContent = studentInfo.gender || "Chưa cập nhật";

        const phoneEl = document.getElementById("account-phone");
        if (phoneEl) phoneEl.textContent = studentInfo.phone || "Chưa cập nhật";

        const emailEl = document.getElementById("account-email");
        if (emailEl) emailEl.textContent = studentInfo.email || "Chưa cập nhật";

        const schoolEl = document.getElementById("account-school");
        if (schoolEl) schoolEl.textContent = studentInfo.school || "Chưa cập nhật";

        const facebookEl = document.getElementById("account-facebook");
        if (facebookEl) facebookEl.textContent = studentInfo.facebook || "Chưa cập nhật";

        const provinceEl = document.getElementById("account-province");
        if (provinceEl) provinceEl.textContent = studentInfo.province || "Chưa cập nhật";

        // Profile summary and avatar text
        const displayProfName = document.getElementById("account-profile-display-name");
        if (displayProfName) displayProfName.textContent = displayName;

        const displayProfEmail = document.getElementById("account-profile-display-email");
        if (displayProfEmail) displayProfEmail.textContent = studentInfo.email || "";

        const firstChar = displayName ? displayName.trim().charAt(0).toUpperCase() : "Y";
        const avatarPlaceholder = document.getElementById("account-avatar-placeholder");
        if (avatarPlaceholder) avatarPlaceholder.textContent = firstChar;

        const infoAvatarPlaceholder = document.getElementById("account-info-avatar-placeholder");
        if (infoAvatarPlaceholder) infoAvatarPlaceholder.textContent = firstChar;
      }

      window.switchAccountSubTab = function(subTabId) {
        // Toggle active nav item
        const items = document.querySelectorAll(".account-nav-item");
        items.forEach(item => {
          if (item.getAttribute("onclick") && item.getAttribute("onclick").includes(subTabId)) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });

        // Toggle active panel
        const panels = document.querySelectorAll(".account-sub-panel");
        panels.forEach(panel => {
          if (panel.id === `account-sub-${subTabId}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });
      };

      // KHO TÀI LIỆU INTEGRATION
      const MATERIAL_LINKS_KEY = "tmaTsaDriveLinks";

      function loadMaterialLinks() {
        try {
          const saved = JSON.parse(localStorage.getItem(MATERIAL_LINKS_KEY) || "{}");
          return saved && typeof saved === "object" ? saved : {};
        } catch {
          return {};
        }
      }

      function getMaterialsList() {
        const saved = loadMaterialLinks();
        
        // If it is already in the new dynamic array format
        if (Array.isArray(saved)) {
          return saved;
        }
        
        // If it is the old object mapping format, parse/convert it
        const defaultMaterials = [
          { title: "Đề TSA số 01", category: "TSA", index: 0 },
          { title: "Đề TSA số 02", category: "TSA", index: 1 },
          { title: "Đề TSA số 03", category: "TSA", index: 2 },
          { title: "Đề TSA số 04", category: "TSA", index: 3 },
          { title: "Đề TSA số 05", category: "TSA", index: 4 },
          { title: "Đề TSA số 06", category: "TSA", index: 5 },
          { title: "Đề HSA số 01", category: "HSA", index: 6 },
          { title: "Đề HSA số 02", category: "HSA", index: 7 },
          { title: "Đề HSA số 03", category: "HSA", index: 8 },
          { title: "Đề HSA số 04", category: "HSA", index: 9 },
          { title: "Đề THPTQG số 01", category: "THPT", index: 10 },
          { title: "Đề THPTQG số 02", category: "THPT", index: 11 },
          { title: "Đề THPTQG số 03", category: "THPT", index: 12 },
          { title: "Đề THPTQG số 04", category: "THPT", index: 13 }
        ];

        if (saved && typeof saved === "object") {
          return defaultMaterials.map(m => ({
            id: "doc_old_" + m.index,
            title: m.title,
            category: m.category,
            url: saved[m.index] || ""
          }));
        }

        return defaultMaterials.map(m => ({
          id: "doc_old_" + m.index,
          title: m.title,
          category: m.category,
          url: ""
        }));
      }

      function getDriveThumbnailUrl(url) {
        const value = String(url || "").trim();
        if (!value) return "";

        const fileMatch = value.match(/\/file\/d\/([^/]+)/) || value.match(/[?&]id=([^&]+)/);
        if (fileMatch?.[1]) {
          return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w800`;
        }

        const docsMatch = value.match(/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([^/]+)/);
        if (docsMatch?.[1]) {
          return `https://drive.google.com/thumbnail?id=${docsMatch[1]}&sz=w800`;
        }

        return "";
      }

      function createMaterialPreview(driveUrl, labelText) {
        const preview = document.createElement("div");
        preview.className = "document-preview";

        const thumbnailUrl = getDriveThumbnailUrl(driveUrl);
        if (thumbnailUrl) {
          const img = document.createElement("img");
          img.src = thumbnailUrl;
          img.alt = labelText;
          img.loading = "lazy";
          img.addEventListener("error", () => {
            preview.innerHTML = "";
            preview.classList.add("is-empty");
          });
          preview.appendChild(img);
          return preview;
        }

        preview.classList.add("is-empty");
        preview.setAttribute("aria-label", "Giáo viên chưa gắn link Drive");
        return preview;
      }

      function renderMaterials() {
        const grid = document.getElementById("materials-grid");
        if (!grid) return;
        grid.textContent = "";

        const searchInput = document.getElementById("material-search-input");
        const keyword = searchInput ? searchInput.value.trim() : "";

        const filterSelect = document.getElementById("material-filter-select");
        const filterVal = filterSelect ? filterSelect.value : "all";

        function removeAccents(str) {
          return String(str || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
            .toLowerCase()
            .trim();
        }

        const activeMaterials = getMaterialsList();

        const filtered = activeMaterials.filter(m => {
          // Category filter
          if (m.category !== currentMaterialCategory.toUpperCase()) return false;
          
          // Search filter (accent-insensitive)
          if (keyword) {
            const cleanTitle = removeAccents(m.title);
            const cleanKeyword = removeAccents(keyword);
            if (!cleanTitle.includes(cleanKeyword)) return false;
          }
          
          // Chapter Filter
          if (filterVal !== "all") {
            const cleanTitle = removeAccents(m.title);
            const keywordMap = {
              tohop: ["to hop", "xac suat"],
              oxyz: ["oxyz", "o xyz", "toa do", "khong gian"],
              hamso: ["ham so", "do thi", "cuc tri", "tiem can", "khao sat", "bien thien"],
              mulogarit: ["mu", "logarit", "lo ga rit", "luy thua"],
              tichphan: ["tich phan", "nguyen ham", "tich-phan", "nguyen-ham"],
              dayso: ["day so", "cap so", "gioi han", "lim"],
              thongke: ["thong ke", "so lieu", "bieu do"]
            };
            const keywords = keywordMap[filterVal] || [];
            const matches = keywords.some(kw => cleanTitle.includes(kw));
            if (!matches) return false;
          }
          
          return true;
        });

        if (filtered.length === 0) {
          const noResult = document.createElement("div");
          noResult.style.gridColumn = "1 / -1";
          noResult.style.textAlign = "center";
          noResult.style.padding = "60px 20px";
          noResult.style.color = "#94a3b8";
          noResult.style.fontWeight = "600";
          noResult.style.fontSize = "15px";
          noResult.innerHTML = `
            <span style="font-size: 48px; display: block; margin-bottom: 12px; filter: grayscale(1);">🔍</span>
            Không tìm thấy tài liệu nào khớp với bộ lọc tìm kiếm.
          `;
          grid.appendChild(noResult);
          return;
        }

        filtered.forEach((material) => {
          const driveUrl = String(material.url || "").trim();
          const card = document.createElement("article");
          card.className = "material-card";
          if (driveUrl) card.classList.add("has-drive");

          const link = document.createElement("a");
          link.style.display = "block";
          link.href = driveUrl || "#";
          link.target = driveUrl ? "_blank" : "";
          link.rel = driveUrl ? "noopener" : "";
          link.addEventListener("click", (event) => {
            if (!driveUrl) {
              event.preventDefault();
              alert("Giáo viên chưa gắn link Drive cho tài liệu này.");
            }
          });

          const preview = createMaterialPreview(driveUrl, material.title);
          link.appendChild(preview);
          card.appendChild(link);

          // Info Container
          const info = document.createElement("div");
          info.className = "material-info";

          const title = document.createElement("h3");
          title.className = "material-title";
          title.textContent = material.title;
          info.appendChild(title);

          const footer = document.createElement("div");
          footer.style.display = "flex";
          footer.style.justifyContent = "space-between";
          footer.style.alignItems = "center";

          const categoryBadge = document.createElement("span");
          categoryBadge.textContent = material.category === "THPT" ? "THPTQG" : material.category;
          categoryBadge.style.fontSize = "10.5px";
          categoryBadge.style.fontWeight = "700";
          categoryBadge.style.background = "#f1f5f9";
          categoryBadge.style.color = "#475569";
          categoryBadge.style.padding = "2px 8px";
          categoryBadge.style.borderRadius = "4px";
          footer.appendChild(categoryBadge);

          if (driveUrl) {
            const dlBtn = document.createElement("span");
            dlBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download" style="margin-right: 4px; vertical-align: middle; margin-top: -2px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Tải về
            `;
            dlBtn.style.fontSize = "12px";
            dlBtn.style.fontWeight = "700";
            dlBtn.style.color = "var(--brand-red)";
            footer.appendChild(dlBtn);
          } else {
            const emptyLabel = document.createElement("span");
            emptyLabel.textContent = "Chưa gắn link";
            emptyLabel.style.fontSize = "12px";
            emptyLabel.style.fontWeight = "600";
            emptyLabel.style.color = "#ef4444";
            footer.appendChild(emptyLabel);
          }

          info.appendChild(footer);
          card.appendChild(info);
          grid.appendChild(card);
        });
      }

      // DYNAMIC COURSE REGISTRATION & SUPABASE SYNC ENGINE
      const MOCK_COURSES_DEFAULTS = [
        {
          id: "thpt-math-luyen-de",
          label: "Luyện Đề THPT",
          title: "Khoá Luyện Đề THPT Môn Toán",
          subheading: "Luyện đề thi thử tốt nghiệp THPT Quốc gia bám sát cấu trúc đề minh họa mới nhất.",
          desc: "Học sinh được làm đề bấm giờ, xem lời giải chi tiết bằng video và tải bản viết tay.",
          author: "Trần Hoàng Anh",
          tags: ["Toán học", "THPTQG"],
          badge: "Chưa mua",
          category: "THPT",
          lessons: [
            { title: "Chữa Đề Tăng Tốc Số 3", type: "video", video_drive_id: "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l1", preview_allowed: true },
            { title: "File Đề Tăng Tốc Số 3", type: "pdf", doc_link: "https://example.com/de-thi.pdf", preview_allowed: true },
            { title: "Bản Viết Tay Để Tăng Tốc Số 3", type: "write", doc_link: "https://example.com/bvt.pdf", preview_allowed: true },
            { title: "Chữa Đề Tăng Tốc Số 4", type: "video", video_drive_id: "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l2" },
            { title: "Đề Tăng Tốc Số 4", type: "pdf", doc_link: "https://example.com/de-thi-4.pdf" },
            { title: "BVT: Đề Tăng Tốc Số 4", type: "write", doc_link: "https://example.com/bvt-4.pdf" },
            { title: "Chữa Đề Tăng Tốc Số 5", type: "video", video_drive_id: "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l3" },
            { title: "File Đề Tăng Tốc Số 5", type: "pdf", doc_link: "https://example.com/de-thi-5.pdf" },
            { title: "BVT Đề Tăng Tốc Số 5", type: "write", doc_link: "https://example.com/bvt-5.pdf" }
          ],
          progress: 33
        },
        {
          id: "01",
          label: "TSA Core",
          title: "Nền tảng Toán TSA",
          subheading: "Gỡ mạch tư duy Toán, dựng lại cách đọc đề và xử lý dữ kiện nhiều bước.",
          desc: "Học chắc các dạng nền tảng, rèn phản xạ phân tích trước khi vào đề tổng hợp.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Toán tư duy", "TSA"],
          badge: "Toán",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Tư duy giải Toán và phản xạ đọc đề", status: "completed" },
            { title: "Bài 2: Các dạng toán định lượng trọng tâm", status: "completed" },
            { title: "Bài 3: Phân tích số liệu và giải thích biểu đồ", status: "pending" },
            { title: "Bài 4: Đề thi khảo sát năng lực số 1", status: "pending" }
          ],
          progress: 50
        },
        {
          id: "02",
          label: "Physics",
          title: "Nền tảng Vật lý THPT",
          subheading: "Hiểu công thức theo bản chất, không học vẹt và không phụ thuộc mẹo nhớ.",
          desc: "Tập trung hiện tượng, đồ thị, phương pháp lập luận và các dạng bài trọng tâm.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Vật lý 10-12", "THPT"],
          badge: "Vật lý",
          category: "THPT",
          lessons: [
            { title: "Bài 1: Dao động điều hòa và hiện tượng thực tế", status: "completed" },
            { title: "Bài 2: Các phương pháp lập luận Vật lý", status: "pending" },
            { title: "Bài 3: Đọc đồ thị dao động và bài toán du lịch", status: "pending" }
          ],
          progress: 33
        },
        {
          id: "03",
          label: "Practice",
          title: "Tổng ôn TSA",
          subheading: "Ôn theo cụm năng lực, vừa hệ thống kiến thức vừa luyện nhịp làm bài.",
          desc: "Mỗi buổi đều có phần chữa lỗi tư duy để học sinh biết mình đang kẹt ở đâu.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Tổng ôn", "Luyện đề"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Tổng ôn chuyên đề Định lượng", status: "completed" },
            { title: "Bài 2: Tổng ôn chuyên đề Định tính", status: "completed" },
            { title: "Bài 3: Tổng ôn chuyên đề Khoa học", status: "completed" },
            { title: "Bài 4: Đề thi tổng hợp TSA đợt 1", status: "pending" }
          ],
          progress: 75
        },
        {
          id: "04",
          label: "Sprint 1",
          title: "Về đích TSA đợt 1",
          subheading: "Chạy lại nền tảng nhanh, khóa lỗ hổng và làm quen format đề thi.",
          desc: "Phù hợp khi cần khởi động lại lộ trình trước giai đoạn tăng tốc.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Về đích", "Đợt 1"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Khởi động lộ trình và kiểm tra lỗ hổng", status: "completed" },
            { title: "Bài 2: Luyện đề thi thử TSA đợt 1", status: "pending" }
          ],
          progress: 50
        },
        {
          id: "05",
          label: "Sprint 2",
          title: "Về đích TSA đợt 2",
          subheading: "Luyện đề có chiến thuật, ưu tiên tốc độ đọc hiểu và độ chắc khi chọn đáp án.",
          desc: "Tập trung các dạng dễ mất điểm và cách kiểm soát thời gian trong phòng thi.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Về đích", "Đợt 2"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Chiến thuật kiểm soát thời gian", status: "pending" },
            { title: "Bài 2: Các dạng bài dễ mất điểm trong TSA", status: "pending" }
          ],
          progress: 0
        },
        {
          id: "06",
          label: "Sprint 3",
          title: "Về đích TSA đợt 3",
          subheading: "Tăng cường đề tổng hợp, sửa lỗi cá nhân và chốt chiến thuật trước ngày thi.",
          desc: "Đi sâu vào các câu phân loại để học sinh biết cách giữ điểm và kéo điểm.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Về đích", "Đợt 3"],
          badge: "TSA",
          category: "TSA",
          lessons: [
            { title: "Bài 1: Phân tích câu hỏi phân loại điểm 9-10", status: "pending" },
            { title: "Bài 2: Đề tổng hợp cuối cùng trước kì thi", status: "pending" }
          ],
          progress: 0
        },
        {
          id: "07",
          label: "HSA Core",
          title: "Nền tảng HSA toàn diện",
          subheading: "Hệ thống kiến thức Đánh giá năng lực HSA ĐHQGHN.",
          desc: "Tập trung các câu hỏi trắc nghiệm đa lựa chọn, điền số và đọc hiểu tư duy định tính/định lượng.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["ĐGNL", "HSA", "Toàn diện"],
          badge: "HSA",
          category: "HSA",
          lessons: [
            { title: "Bài 1: Cấu trúc đề thi HSA và phương pháp ôn luyện", status: "completed" },
            { title: "Bài 2: Tư duy định lượng trong đề HSA", status: "pending" },
            { title: "Bài 3: Đọc hiểu và giải quyết vấn đề định tính", status: "pending" }
          ],
          progress: 33
        },
        {
          id: "08",
          label: "HSA Practice",
          title: "Luyện đề thi thử HSA",
          subheading: "Luyện các bộ đề thi thử HSA sát với đề thi thực tế nhất.",
          desc: "Rèn luyện tốc độ làm 150 câu hỏi trong 195 phút dưới áp lực thời gian thực tế.",
          author: "Thầy Nghiêm Xuân Tân",
          tags: ["Luyện đề", "HSA", "Thi thử"],
          badge: "HSA",
          category: "HSA",
          lessons: [
            { title: "Đề thi thử HSA số 1 - Tổng hợp", status: "pending" },
            { title: "Đề thi thử HSA số 2 - Tổng hợp", status: "pending" }
          ],
          progress: 0
        },
        {
          id: "vact-online",
          title: "Thi thử Bài thi Đánh giá năng lực VACT",
          category: "VACT",
          typeBadge: "Thi trực tuyến",
          isOnline: true,
          regTime: "Hằng ngày",
          fee: "Miễn phí",
          examTime: "Hằng ngày",
          status: "online",
          actionUrl: "waiting.html",
          actionText: "Vào thi ngay",
          uploaded: false
        },
        {
          id: "qda-online",
          title: "Thi thử Bài thi Đánh giá năng lực QDA",
          category: "QDA",
          typeBadge: "Thi trực tuyến",
          isOnline: true,
          regTime: "Hằng ngày",
          fee: "Miễn phí",
          examTime: "Hằng ngày",
          status: "online",
          actionUrl: "waiting.html",
          actionText: "Vào thi ngay",
          uploaded: false
        },
        {
          id: "thpt-online",
          title: "Thi thử tốt nghiệp THPTQG",
          category: "THPT",
          typeBadge: "Thi trực tuyến",
          isOnline: true,
          regTime: "Hằng ngày",
          fee: "Miễn phí",
          examTime: "Hằng ngày",
          status: "online",
          actionUrl: "waiting.html",
          actionText: "Vào thi ngay",
          uploaded: false
        }
      ];

      let COURSES_DATA = [];
      let enrolledCourseIds = [];

      async function seedSupabaseDatabase() {
        try {
          console.log("Seeding Supabase Database...");
          
          for (const course of MOCK_COURSES_DEFAULTS) {
            if (course.isOnline) continue;

            const { data: insertedCourse, error: cErr } = await supabaseClient
              .from('courses')
              .insert({
                title: course.title,
                description: course.subheading + " " + course.desc,
                cover_image: course.category === "THPT" ? "https://assets.tmastudy.io.vn/assets/thpt.png" : "https://assets.tmastudy.io.vn/assets/anhnen.png",
                teacher: course.author,
                price: 0,
                active: true,
                category: course.category
              })
              .select('id')
              .single();

            if (cErr) {
              console.error("Error inserting course:", cErr.message);
              continue;
            }

            const courseId = insertedCourse.id;

            const lessonsToInsert = course.lessons.map((l, index) => ({
              course_id: courseId,
              title: l.title,
              short_description: l.title,
              type: l.title.toLowerCase().includes("file") ? "pdf" : (l.title.toLowerCase().includes("viết tay") || l.title.toLowerCase().includes("bvt") ? "write" : "video"),
              video_drive_id: l.video_drive_id || "17l2lP-G4mH0l9X2X1l1X1l1X1l1X1l1",
              doc_link: l.doc_link || "https://example.com/mock-document.pdf",
              order_index: index,
              preview_allowed: l.preview_allowed || false
            }));

            const { error: lErr } = await supabaseClient
              .from('lessons')
              .insert(lessonsToInsert);

            if (lErr) {
              console.error("Error inserting lessons:", lErr.message);
            }

            // Da go bo logic tu dong chen ma kich hoat '123' de bao mat
          }
          console.log("Seeding Supabase completed successfully!");
        } catch (seedErr) {
          console.error("Failed to seed database:", seedErr);
        }
      }

      async function loadCoursesAndEnrollments(forceRefresh = false) {
        if (!supabaseClient) {
          console.log("No supabaseClient. Running local mockup mode.");
          COURSES_DATA = [...MOCK_COURSES_DEFAULTS];
          return;
        }

        const studentCode = studentInfo?.email || studentInfo?.username || "test";

        // Bổ sung cache 5 phút bằng sessionStorage
        const cacheKey = `tmaTsaCoursesCache_${studentCode}`;
        const cacheTimeKey = `tmaTsaCoursesCacheTime_${studentCode}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        const cachedTime = sessionStorage.getItem(cacheTimeKey);
        const now = Date.now();

        if (!forceRefresh && cachedData && cachedTime && (now - parseInt(cachedTime)) < 300000) {
          try {
            const parsed = JSON.parse(cachedData);
            COURSES_DATA = parsed.coursesData;
            enrolledCourseIds = parsed.enrolledCourseIds;
            return;
          } catch (e) {
            console.warn("Failed to parse cached courses data:", e);
          }
        }

        try {
          const { data: dbCourses, error: courseError } = await supabaseClient
            .from('courses')
            .select('id, title, description, teacher, category, cover_image'); // Chỉ chọn những cột cần thiết

          if (courseError) throw courseError;

          if (!dbCourses || dbCourses.length === 0) {
            await seedSupabaseDatabase();
            const { data: reFetchedCourses } = await supabaseClient.from('courses').select('id, title, description, teacher, category, cover_image');
            COURSES_DATA = reFetchedCourses || [];
          } else {
            COURSES_DATA = [];
          }

          // Tránh truy vấn N+1 bằng cách lấy tất cả lessons trong 1 lần truy vấn
          let allLessons = [];
          if (dbCourses && dbCourses.length > 0) {
            const { data: dbLessons, error: lessonError } = await supabaseClient
              .from('lessons')
              .select('*')
              .order('order_index', { ascending: true })
              .order('created_at', { ascending: true });

            if (lessonError) throw lessonError;
            allLessons = dbLessons || [];
          }

          if (dbCourses && dbCourses.length > 0) {
            for (const c of dbCourses) {
              const lessonsForCourse = allLessons.filter(l => l.course_id === c.id);
              COURSES_DATA.push({
                id: c.id,
                title: c.title,
                subheading: c.description || "",
                desc: c.description || "",
                author: c.teacher || "Trần Hoàng Anh",
                category: c.category || "TSA",
                lessons: lessonsForCourse,
                progress: 33,
                cover_image: c.cover_image || ""
              });
            }
          }

          MOCK_COURSES_DEFAULTS.forEach(m => {
            if (m.isOnline) COURSES_DATA.push(m);
          });

          const { data: dbEnrollments, error: enrollError } = await supabaseClient
            .from('enrollments')
            .select('course_id')
            .eq('user_email', studentCode);

          if (enrollError) throw enrollError;
          enrolledCourseIds = (dbEnrollments || []).map(e => e.course_id);

          const key = `tmaTsaRegisteredCourses_${studentInfo.username}`;
          localStorage.setItem(key, JSON.stringify(enrolledCourseIds));

          // Ghi nhớ cache
          sessionStorage.setItem(cacheKey, JSON.stringify({
            coursesData: COURSES_DATA,
            enrolledCourseIds: enrolledCourseIds
          }));
          sessionStorage.setItem(cacheTimeKey, now.toString());

        } catch (err) {
          console.warn("Supabase fetch error:", err.message || err);
          COURSES_DATA = [];
        }
      }

      function getRegisteredCourseIds() {
        if (!studentInfo) return [];
        try {
          const key = `tmaTsaRegisteredCourses_${studentInfo.username}`;
          const saved = JSON.parse(localStorage.getItem(key) || "[]");
          return Array.isArray(saved) ? saved : [];
        } catch {
          return [];
        }
      }

      function registerCourse(courseId) {
        if (!studentInfo) return;
        const registered = getRegisteredCourseIds();
        if (!registered.includes(courseId)) {
          registered.push(courseId);
          const key = `tmaTsaRegisteredCourses_${studentInfo.username}`;
          localStorage.setItem(key, JSON.stringify(registered));
          
          // Re-render
          renderExamRoomCourses();
          renderOverviewCourses();
        }
      }

      function normalizeCourseText(value) {
        return String(value || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .toLowerCase();
      }

      function getCourseCardCover(course) {
        const searchable = normalizeCourseText(`${course.title} ${course.badge} ${course.label} ${course.category}`);

        if (searchable.includes("qda")) {
          return { className: "cover-qda", image: "https://assets.tmastudy.io.vn/assets/anhnen.png" };
        }

        if (searchable.includes("vat ly") || searchable.includes("physics") || /\bly\b/.test(searchable)) {
          return { className: "cover-physics", image: "https://assets.tmastudy.io.vn/assets/ly.png" };
        }

        if (searchable.includes("tsa")) {
          return { className: "cover-tsa", image: "https://assets.tmastudy.io.vn/assets/anhnen.png" };
        }

        return { className: "cover-default", image: "https://assets.tmastudy.io.vn/assets/anhnen.png" };
      }

      function getCoursePosterLines(course) {
        const searchable = normalizeCourseText(`${course.title} ${course.badge} ${course.label} ${course.category}`);

        if (searchable.includes("qda")) return ["QDA", "CORE"];
        if (searchable.includes("vat ly") || searchable.includes("physics") || /\bly\b/.test(searchable)) return ["VẬT", "LÝ"];
        if (searchable.includes("toan")) return ["TOÁN", "TƯ DUY"];
        if (searchable.includes("doc hieu") || searchable.includes("van")) return ["ĐỌC", "HIỂU"];
        if (searchable.includes("hsa")) return ["HSA", "CORE"];
        if (searchable.includes("tsa")) return ["TSA", "CORE"];

        return ["LUYỆN", "THI"];
      }

      function renderExamRoomCourses() {
        const grid = document.getElementById("exam-room-courses-grid");
        if (!grid) return;

        const registeredIds = getRegisteredCourseIds();
        grid.innerHTML = "";

        const filtered = COURSES_DATA.filter((course) => {
          // Filter by category (case-insensitive)
          const catMatch = course.category.toLowerCase() === currentExamCategory.toLowerCase();
          if (!catMatch) return false;

          // Filter by sub-tab (my courses vs all courses)
          if (currentSubtab === "my") {
            return registeredIds.includes(course.id);
          }
          return true;
        });

        if (filtered.length === 0) {
          const emptyCard = document.createElement("div");
          emptyCard.className = "no-courses-message";
          if (currentSubtab === "my") {
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; min-height: 55vh; border: none; background: transparent; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;";
            emptyCard.innerHTML = `
              <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Chưa tham gia khóa học nào" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
              <div style="font-size: 15px; font-weight: 600; color: #64748b;">Bạn chưa tham gia khóa học nào</div>
            `;
          } else {
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; min-height: 55vh; border: 1px solid var(--border); border-radius: 12px; background: #ffffff; color: var(--muted); width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;";
            emptyCard.innerHTML = `
              <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Không tìm thấy khóa học nào" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
              <div style="font-size: 15px; font-weight: 600; color: var(--text);">Không tìm thấy khóa học nào</div>
              <p style="font-size: 12px; margin: 4px 0 0; color: var(--muted);">Các khóa học đang được cập nhật.</p>
            `;
          }
          grid.appendChild(emptyCard);
          return;
        }

        filtered.forEach((course, idx) => {
          const card = document.createElement("article");
          card.className = "course-card";
          card.style.setProperty("--delay", `${idx * 80}ms`);
          card.style.cursor = "pointer";
          card.title = course.title;
          card.setAttribute("aria-label", course.title);

          let heroImage = course.cover_image || "";
          if (!heroImage) {
            const titleLower = course.title.toLowerCase();
            if (titleLower.includes("tsa")) {
              heroImage = "https://assets.tmastudy.io.vn/assets/anhnen.png";
            } else if (titleLower.includes("lý") || titleLower.includes("physics")) {
              heroImage = "https://assets.tmastudy.io.vn/assets/ly.png";
            } else {
              heroImage = "https://assets.tmastudy.io.vn/assets/thpt.png";
            }
          }

          const isRegistered = registeredIds.includes(course.id);
          const actionBtn = isRegistered
            ? `<button type="button" class="enter-btn enter-class-btn">Vào học</button>`
            : `<button type="button" class="enter-btn enter-class-btn not-registered">Xem thêm</button>`;

          card.innerHTML = `
            <div class="course-hero" style="background-image: url('${heroImage}')"></div>
            <div class="course-body">
              <h4 class="course-name">${course.title}</h4>
              <p class="course-desc">${course.category} | ${course.author || "TMA TSA"}</p>
              <div class="divider"></div>
              <div class="course-footer">
                <span class="lesson-count">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <span>${course.lessons?.length || 0} bài học</span>
                </span>
                ${actionBtn}
              </div>
            </div>
          `;

          // Clicking anywhere on the card opens the classroom details modal
          card.addEventListener("click", () => {
            openClassroomModal(course.id);
          });

          grid.appendChild(card);
        });

        if (typeof window.renderDashboardCourses === "function") {
          window.renderDashboardCourses();
        }
      }

      function renderOverviewCourses() {
        const grid = document.getElementById("overview-my-courses-grid");
        if (!grid) return;

        const registeredIds = getRegisteredCourseIds();
        grid.innerHTML = "";

        if (registeredIds.length === 0) {
          const empty = document.createElement("div");
          empty.style.cssText = "grid-column: span 2; text-align: center; padding: 24px; color: var(--muted); font-size: 12px; border: 1px solid var(--border); border-radius: 8px; background: #ffffff; width: 100%;";
          empty.innerHTML = `
            <p style="font-weight: 500;">Bạn chưa tham gia khóa học nào</p>
            <button type="button" class="btn btn-primary btn-xs" style="margin-top: 8px;" id="overview-go-to-courses">Đăng ký ngay</button>
          `;
          grid.appendChild(empty);
          
          document.getElementById("overview-go-to-courses")?.addEventListener("click", () => {
            switchTab("courses");
            window.location.hash = "courses";
          });
          return;
        }

        COURSES_DATA.filter(c => registeredIds.includes(c.id)).forEach((course) => {
          const card = document.createElement("div");
          card.className = "course-compact-card";
          card.innerHTML = `
            <div class="course-header">
              <span class="course-badge">${course.badge}</span>
              <h4>${course.title}</h4>
            </div>
            <div class="course-meta">
              <span>Tiến độ: ${course.progress}%</span>
              <div class="progress-bar"><div class="progress-bar-fill" style="width: ${course.progress}%;"></div></div>
            </div>
            <button type="button" class="btn btn-secondary btn-xs overview-enter-class-btn" data-course-id="${course.id}">Vào học</button>
          `;
          grid.appendChild(card);
        });

        grid.querySelectorAll(".overview-enter-class-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const courseId = btn.getAttribute("data-course-id");
            openClassroomModal(courseId);
          });
        });
      }
      function renderExamRoomCourses() {
        const grid = document.getElementById("exam-room-courses-grid");
        if (!grid) return;

        const registeredIds = getRegisteredCourseIds();
        grid.innerHTML = "";

        const filtered = COURSES_DATA.filter((course) => {
          // Filter by category (case-insensitive)
          const catMatch = course.category.toLowerCase() === currentExamCategory.toLowerCase();
          if (!catMatch) return false;

          // Filter by sub-tab (my courses vs all courses)
          if (currentSubtab === "my") {
            return registeredIds.includes(course.id);
          }
          return true;
        });

        if (filtered.length === 0) {
          const emptyCard = document.createElement("div");
          emptyCard.className = "no-courses-message";
          if (currentSubtab === "my") {
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; min-height: 55vh; border: none; background: transparent; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;";
            emptyCard.innerHTML = `
              <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Chưa tham gia khóa học nào" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
              <div style="font-size: 15px; font-weight: 600; color: #64748b;">Bạn chưa tham gia khóa học nào</div>
            `;
          } else {
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; min-height: 55vh; border: 1px solid var(--border); border-radius: 12px; background: #ffffff; color: var(--muted); width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;";
            emptyCard.innerHTML = `
              <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Không tìm thấy khóa học nào" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
              <div style="font-size: 15px; font-weight: 600; color: var(--text);">Không tìm thấy khóa học nào</div>
              <p style="font-size: 12px; margin: 4px 0 0; color: var(--muted);">Các khóa học đang được cập nhật.</p>
            `;
          }
          grid.appendChild(emptyCard);
          return;
        }

        filtered.forEach((course, idx) => {
          const card = document.createElement("article");
          card.className = "course-card";
          card.style.setProperty("--delay", `${idx * 80}ms`);
          card.style.cursor = "pointer";
          card.title = course.title;
          card.setAttribute("aria-label", course.title);

          let heroImage = course.cover_image || "";
          if (!heroImage) {
            const titleLower = course.title.toLowerCase();
            if (titleLower.includes("tsa")) {
              heroImage = "https://assets.tmastudy.io.vn/assets/anhnen.png";
            } else if (titleLower.includes("lý") || titleLower.includes("physics")) {
              heroImage = "https://assets.tmastudy.io.vn/assets/ly.png";
            } else {
              heroImage = "https://assets.tmastudy.io.vn/assets/thpt.png";
            }
          }

          const isRegistered = registeredIds.includes(course.id);
          const actionBtn = isRegistered
            ? `<button type="button" class="enter-btn enter-class-btn">Vào học</button>`
            : `<button type="button" class="enter-btn enter-class-btn not-registered">Xem thêm</button>`;

          card.innerHTML = `
            <div class="course-hero" style="background-image: url('${heroImage}')"></div>
            <div class="course-body">
              <h4 class="course-name">${course.title}</h4>
              <p class="course-desc">${course.category} | ${course.author || "TMA TSA"}</p>
              <div class="divider"></div>
              <div class="course-footer">
                <span class="lesson-count">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <span>${course.lessons?.length || 0} bài học</span>
                </span>
                ${actionBtn}
              </div>
            </div>
          `;

          // Clicking anywhere on the card opens the classroom details modal
          card.addEventListener("click", () => {
            openClassroomModal(course.id);
          });

          grid.appendChild(card);
        });
      }

      function renderOverviewCourses() {
        const grid = document.getElementById("overview-my-courses-grid");
        if (!grid) return;

        const registeredIds = getRegisteredCourseIds();
        grid.innerHTML = "";

        if (registeredIds.length === 0) {
          const empty = document.createElement("div");
          empty.style.cssText = "grid-column: span 2; text-align: center; padding: 24px; color: var(--muted); font-size: 12px; border: 1px solid var(--border); border-radius: 8px; background: #ffffff; width: 100%;";
          empty.innerHTML = `
            <p style="font-weight: 500;">Bạn chưa tham gia khóa học nào</p>
            <button type="button" class="btn btn-primary btn-xs" style="margin-top: 8px;" id="overview-go-to-courses">Đăng ký ngay</button>
          `;
          grid.appendChild(empty);
          
          document.getElementById("overview-go-to-courses")?.addEventListener("click", () => {
            switchTab("courses");
            window.location.hash = "courses";
          });
          return;
        }

        COURSES_DATA.filter(c => registeredIds.includes(c.id)).forEach((course) => {
          const card = document.createElement("div");
          card.className = "course-compact-card";
          card.innerHTML = `
            <div class="course-header">
              <span class="course-badge">${course.badge}</span>
              <h4>${course.title}</h4>
            </div>
            <div class="course-meta">
              <span>Tiến độ: ${course.progress}%</span>
              <div class="progress-bar"><div class="progress-bar-fill" style="width: ${course.progress}%;"></div></div>
            </div>
            <button type="button" class="btn btn-secondary btn-xs overview-enter-class-btn" data-course-id="${course.id}">Vào học</button>
          `;
          grid.appendChild(card);
        });

        grid.querySelectorAll(".overview-enter-class-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const courseId = btn.getAttribute("data-course-id");
            openClassroomModal(courseId);
          });
        });
      }

      // Course Study Modal Implementation
      const courseStudyModal = document.getElementById("course-study-modal");
      const closeCourseModalBtn = document.getElementById("close-course-modal-btn");
      const courseModalActivationBtn = document.getElementById("course-modal-activation-btn");
      
      let watermarkTimer = null;
      let activeIframeSrc = "";
      const COURSE_STUDY_THEME_KEY = "tmaTsaCourseStudyTheme";

      function getLessonMetricKey(kind, lessonId) {
        return `tmaTsaLessonMetric_${kind}_${lessonId || "unknown"}`;
      }

      function readLessonMetric(kind, lesson) {
        const directValue = lesson && (lesson[kind + "_count"] ?? lesson[kind + "s"]);
        const baseValue = Number.isFinite(Number(directValue)) ? Number(directValue) : 0;
        const key = getLessonMetricKey(kind, lesson?.id);
        const localValue = Math.max(0, parseInt(localStorage.getItem(key) || "0", 10) || 0);
        return baseValue + localValue;
      }

      function incrementLessonMetric(kind, lesson) {
        const key = getLessonMetricKey(kind, lesson?.id);
        const nextLocalValue = (Math.max(0, parseInt(localStorage.getItem(key) || "0", 10) || 0)) + 1;
        localStorage.setItem(key, String(nextLocalValue));
        return readLessonMetric(kind, lesson);
      }

      function applyCourseStudyTheme(theme) {
        const mode = theme === "dark" ? "dark" : "light";
        if (courseStudyModal) courseStudyModal.setAttribute("data-study-theme", mode);
        const toggle = document.getElementById("course-study-theme-toggle");
        if (toggle) {
          toggle.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
          toggle.classList.toggle("is-dark", mode === "dark");
        }
        const label = document.getElementById("study-theme-label");
        if (label) {
          label.textContent = "Sáng/Tối";
        }
      }

      function initCourseStudyThemeToggle() {
        const toggle = document.getElementById("course-study-theme-toggle");
        if (!toggle || toggle.dataset.bound === "true") return;
        toggle.dataset.bound = "true";
        applyCourseStudyTheme(localStorage.getItem(COURSE_STUDY_THEME_KEY) || "light");
        toggle.addEventListener("click", () => {
          const currentMode = courseStudyModal?.getAttribute("data-study-theme") === "dark" ? "dark" : "light";
          const nextMode = currentMode === "dark" ? "light" : "dark";
          localStorage.setItem(COURSE_STUDY_THEME_KEY, nextMode);
          applyCourseStudyTheme(nextMode);
        });
      }

      function getLessonIconSvg(title) {
        const titleLower = title.toLowerCase();
        // File / PDF
        if (titleLower.includes("file") || titleLower.includes("đề số") || titleLower.includes("de so") || titleLower.includes("đề tăng tốc") || titleLower.includes("de thi")) {
          return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        }
        // Write / BVT
        if (titleLower.includes("viết tay") || titleLower.includes("viet tay") || titleLower.includes("bvt")) {
          return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        }
        // Video / Chữa (Default)
        return `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" style="transform: translate(1px, 0);"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      }

      function startWatermark(studentName, studentPhone) {
        const overlay = document.getElementById("video-watermark-overlay");
        if (!overlay) return;
        overlay.style.display = "block";
        const text = `${studentName} - ${studentPhone || "0987654321"} - ${new Date().toLocaleDateString("vi-VN")}`;
        overlay.textContent = text;
        const container = document.getElementById("course-player-container");
        if (!container) return;
        function moveWatermark() {
          const cw = container.clientWidth, ch = container.clientHeight;
          const ww = overlay.clientWidth || 250, wh = overlay.clientHeight || 20;
          overlay.style.left = Math.floor(Math.random() * Math.max(10, cw - ww - 20)) + "px";
          overlay.style.top = Math.floor(Math.random() * Math.max(10, ch - wh - 20)) + "px";
        }
        moveWatermark();
        if (watermarkTimer) clearInterval(watermarkTimer);
        watermarkTimer = setInterval(moveWatermark, 4000);
      }

      function convertToDrivePreviewUrl(url) {
        const val = String(url || "").trim();
        if (!val) return "";

        if (val.includes("/preview")) {
          return val;
        }

        const fileMatch = val.match(/\/file\/d\/([^/?#]+)/) || val.match(/[?&]id=([^&]+)/);
        if (fileMatch?.[1]) {
          return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
        }

        const docTypes = ["document", "presentation", "spreadsheets", "drawings"];
        for (const type of docTypes) {
          if (val.includes(`docs.google.com/${type}/d/`)) {
            const docMatch = val.match(new RegExp(`docs\\.google\\.com/${type}/d/([^/?#]+)`));
            if (docMatch?.[1]) {
              return `https://docs.google.com/${type}/d/${docMatch[1]}/preview`;
            }
          }
        }

        return val;
      }

      function getLessonSortKey(title) {
        const t = String(title || "").toLowerCase().trim();
        const phanMatch = t.match(/(?:ph[aầ]n|p)\s*(\d+)\.(\d+)/i);
        if (phanMatch) {
          return [parseInt(phanMatch[1], 10), parseInt(phanMatch[2], 10), 1];
        }
        const numMatch = t.match(/(?:c[aâ]u|b[aà]i)\s*(\d+)/i);
        if (numMatch) {
          return [parseInt(numMatch[1], 10), 0, 0];
        }
        const generalNumMatch = t.match(/(\d+)/);
        if (generalNumMatch) {
          return [parseInt(generalNumMatch[1], 10), 0, 2];
        }
        return [9999, 0, 3];
      }

      function compareLessonSortKeys(a, b) {
        const keyA = getLessonSortKey(a.title);
        const keyB = getLessonSortKey(b.title);
        if (keyA[0] !== keyB[0]) return keyA[0] - keyB[0];
        if (keyA[1] !== keyB[1]) return keyA[1] - keyB[1];
        if (keyA[2] !== keyB[2]) return keyA[2] - keyB[2];
        if ((a.order_index || 0) !== (b.order_index || 0)) {
          return (a.order_index || 0) - (b.order_index || 0);
        }
        return a.title.localeCompare(b.title);
      }

      function updateLessonLikeUI(lesson) {
        const studentCode = studentInfo?.email || studentInfo?.username || "test";
        const userLikeKey = `tmaTsaUserLiked_${studentCode}_${lesson?.id}`;
        const isLiked = localStorage.getItem(userLikeKey) === "true";
        const count = readLessonMetric("like", lesson);
        
        const countEl = document.getElementById("study-lesson-like-count");
        if (countEl) countEl.textContent = count;
        
        const likeBtn = document.getElementById("lesson-like-toggle-btn");
        if (likeBtn) {
          const svg = likeBtn.querySelector("svg");
          const span = likeBtn.querySelector("span");
          if (isLiked) {
            likeBtn.style.background = "#fee2e2";
            likeBtn.style.borderColor = "#ef4444";
            likeBtn.style.color = "#ef4444";
            if (svg) svg.style.fill = "#ef4444";
            if (span) span.textContent = "Đã thích";
          } else {
            likeBtn.style.background = "transparent";
            likeBtn.style.borderColor = "#ef4444";
            likeBtn.style.color = "#ef4444";
            if (svg) svg.style.fill = "none";
            if (span) span.textContent = "Thích";
          }
        }
      }

      function toggleLessonLike(lesson) {
        const studentCode = studentInfo?.email || studentInfo?.username || "test";
        const userLikeKey = `tmaTsaUserLiked_${studentCode}_${lesson?.id}`;
        const isLiked = localStorage.getItem(userLikeKey) === "true";
        
        const metricKey = getLessonMetricKey("like", lesson?.id);
        let currentLikes = Math.max(0, parseInt(localStorage.getItem(metricKey) || "0", 10) || 0);

        if (isLiked) {
          localStorage.setItem(userLikeKey, "false");
          currentLikes = Math.max(0, currentLikes - 1);
          localStorage.setItem(metricKey, String(currentLikes));
        } else {
          localStorage.setItem(userLikeKey, "true");
          currentLikes += 1;
          localStorage.setItem(metricKey, String(currentLikes));
        }
        
        updateLessonLikeUI(lesson);
      }

      function updateCommentInputState() {
        const textarea = document.getElementById("course-comment-textarea");
        const submitBtn = document.getElementById("course-comment-submit-btn");
        const pillWrap = document.getElementById("course-comment-pill");
        if (!textarea) return;

        if (!currentLmsLessonId) {
          textarea.disabled = true;
          textarea.placeholder = "Chọn bài học để bình luận...";
          if (submitBtn) submitBtn.disabled = true;
          if (pillWrap) pillWrap.style.opacity = "0.5";
        } else {
          textarea.disabled = false;
          textarea.placeholder = "Aa";
          if (submitBtn) submitBtn.disabled = false;
          if (pillWrap) pillWrap.style.opacity = "1";
        }
      }

      async function loadLmsComments() {
        const listContainer = document.getElementById("course-comments-list");
        if (!listContainer) return;

        updateCommentInputState();

        if (!currentLmsLessonId) {
          listContainer.innerHTML = `
            <div style="padding:40px 20px;text-align:center;color:#94a3b8;margin:auto;">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" stroke-width="1.5" style="margin:0 auto 14px;display:block;opacity:0.3;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <p style="font-size:13px;margin:0;font-weight:600;">Vui lòng chọn bài học để xem và gửi bình luận.</p>
            </div>
          `;
          return;
        }

        listContainer.innerHTML = `
          <div style="text-align:center;color:#94a3b8;padding:20px;font-size:13px;font-weight:600;">
            Đang tải bình luận...
          </div>
        `;

        let comments = [];

        if (window.supabaseClient) {
          try {
            const { data, error } = await window.supabaseClient
              .from('course_comments')
              .select('*')
              .eq('course_id', currentLmsCourseId)
              .eq('lesson_id', currentLmsLessonId)
              .order('created_at', { ascending: true });

            if (!error && data) {
              comments = data;
            } else {
              throw error || new Error("Failed to load");
            }
          } catch (e) {
            console.warn("Supabase comments error, fallback to local storage:", e);
            comments = getLocalComments();
          }
        } else {
          comments = getLocalComments();
        }

        if (comments.length === 0) {
          listContainer.innerHTML = `
            <div style="padding:40px 20px;text-align:center;color:#94a3b8;margin:auto;">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" stroke-width="1.5" style="margin:0 auto 14px;display:block;opacity:0.3;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <p style="font-size:13px;margin:0;font-weight:600;">Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!</p>
            </div>
          `;
          return;
        }

        // Relative time formatter helper
        function getRelativeTime(dateString) {
          const date = new Date(dateString);
          const now = new Date();
          const diffMs = now - date;
          
          if (isNaN(diffMs) || diffMs < 0) return "vừa xong";
          
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 1) return "vừa xong";
          if (diffMins < 60) return `${diffMins} phút trước`;
          
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) return `${diffHours} giờ trước`;
          
          const diffDays = Math.floor(diffHours / 24);
          if (diffDays < 30) return `${diffDays} ngày trước`;
          
          const diffMonths = Math.floor(diffDays / 30);
          if (diffMonths < 12) return `${diffMonths} tháng trước`;
          
          return `${Math.floor(diffMonths / 12)} năm trước`;
        }

        const studentEmail = studentInfo?.email || studentInfo?.username || "test";

        // Parse comments and identify replies
        const roots = [];
        const repliesMap = {}; // parentId -> array of replies

        comments.forEach(c => {
          let parsedText = c.content;
          let replyTo = null;

          if (c.content && c.content.trim().startsWith('{')) {
            try {
              const obj = JSON.parse(c.content);
              if (obj.reply_to) {
                replyTo = obj.reply_to;
                parsedText = obj.text;
              }
            } catch (e) {}
          }

          c.parsedText = parsedText;
          c.replyTo = replyTo;

          if (replyTo) {
            if (!repliesMap[replyTo]) repliesMap[replyTo] = [];
            repliesMap[replyTo].push(c);
          } else {
            roots.push(c);
          }
        });

        // Function to build HTML for a single comment (root or reply)
        function renderSingleComment(c, isReply = false) {
          const timeStr = getRelativeTime(c.created_at);
          const name = c.user_name || "Học sinh";
          const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
          const isOwn = c.user_email === studentEmail;
          
          // Generate a deterministic color class for the avatar
          const avatarBg = isOwn ? "var(--brand-red)" : "#94a3b8";

          const id = c.id;
          const authorColor = isOwn ? "#0f5a9e" : "#1e293b";
          const itemClass = isReply ? "reply-item" : "root-comment-item";
          const avatarSize = isReply ? "24px" : "32px";
          const avatarFontSize = isReply ? "10px" : "12px";

          return `
            <div class="${itemClass}" style="display: flex; gap: 10px; align-items: flex-start; text-align: left; position: relative;" id="comment-item-${id}">
              <div style="width: ${avatarSize}; height: ${avatarSize}; border-radius: 50%; background: ${avatarBg}; color: white; font-weight: 700; font-size: ${avatarFontSize}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-transform: uppercase; user-select: none;">
                ${initials}
              </div>
              <div style="flex: 1; min-width: 0;">
                <!-- Content bubble -->
                <div class="comment-bubble-box">
                  <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 3px; flex-wrap: wrap;">
                    <span style="font-weight: 700; font-size: 12.5px; color: ${authorColor}; text-transform: capitalize;">${esc(name)}</span>
                    <span style="font-size: 11px; color: #64748b; font-weight: 500;">${timeStr}</span>
                  </div>
                  <div id="comment-text-${id}" data-raw-content="${esc(c.parsedText)}" data-reply-to="${c.replyTo || ''}" style="font-size: 13px; color: var(--text); line-height: 1.4; word-break: break-word; font-weight: 500;">
                    ${esc(c.parsedText)}
                  </div>
                </div>
                <!-- Action bar -->
                <div class="comment-action-links" id="comment-actions-${id}">
                  ${!isReply ? `<button class="action-btn" onclick="showReplyInput('${id}', '${esc(name)}')">Trả lời</button>` : ''}
                  ${isOwn ? `
                    <button class="action-btn" onclick="startEditComment('${id}')">Chỉnh sửa</button>
                    <button class="action-btn delete" onclick="deleteComment('${id}')">Xóa</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }

        let html = "";
        roots.forEach(root => {
          const rootHtml = renderSingleComment(root, false);
          const replies = repliesMap[root.id] || [];
          
          let repliesHtml = "";
          replies.forEach(reply => {
            repliesHtml += renderSingleComment(reply, true);
          });

          html += `
            <div class="comment-group" id="comment-group-${root.id}">
              ${rootHtml}
              <div class="comment-replies-list" id="replies-list-${root.id}">
                ${repliesHtml}
              </div>
            </div>
          `;
        });

        listContainer.innerHTML = html;
        listContainer.scrollTop = listContainer.scrollHeight;
      }

      function getLocalComments() {
        const key = `tmaTsaComments_${currentLmsCourseId}_${currentLmsLessonId}`;
        try {
          return JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
          return [];
        }
      }

      function saveLocalComment(comment) {
        const key = `tmaTsaComments_${currentLmsCourseId}_${currentLmsLessonId}`;
        const list = getLocalComments();
        list.push(comment);
        localStorage.setItem(key, JSON.stringify(list));
      }

      async function submitLmsComment() {
        const textarea = document.getElementById("course-comment-textarea");
        if (!textarea) return;

        let content = textarea.value.trim();
        if (!content) return;

        const studentName = (studentInfo?.name || studentInfo?.username || "Học sinh").replace(/[▪■•]/g, "").trim();
        const studentEmail = studentInfo?.email || studentInfo?.username || "test";
        const commentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));

        const newComment = {
          id: commentId,
          created_at: new Date().toISOString(),
          course_id: currentLmsCourseId,
          lesson_id: currentLmsLessonId,
          user_name: studentName,
          user_email: studentEmail,
          content: content
        };

        textarea.value = "";

        let success = false;
        if (window.supabaseClient) {
          try {
            const { error } = await window.supabaseClient
              .from('course_comments')
              .insert([newComment]);

            if (!error) {
              success = true;
            } else {
              throw error;
            }
          } catch (e) {
            console.warn("Failed to save comment to Supabase, fallback to localStorage:", e);
          }
        }

        saveLocalComment(newComment);
        loadLmsComments();
      }

      window.showReplyInput = (commentId, authorName) => {
        document.querySelectorAll(".reply-input-wrapper").forEach(el => el.remove());

        const repliesList = document.getElementById(`replies-list-${commentId}`);
        if (!repliesList) return;

        const loggedInStudentName = (studentInfo?.name || studentInfo?.username || "Học sinh").replace(/[▪■•]/g, "").trim();
        const initials = loggedInStudentName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

        const replyInputHtml = `
          <div class="reply-input-wrapper reply-item" id="reply-input-wrap-${commentId}">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #94a3b8; color: white; font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-transform: uppercase; user-select: none;">
              ${initials}
            </div>
            <div class="reply-input-box">
              <textarea placeholder="Viết bình luận dưới tên ${esc(authorName)}..." class="reply-textarea" id="reply-textarea-${commentId}" rows="1" oninput="handleReplyTextareaInput('${commentId}')"></textarea>
              <div class="reply-input-toolbar">
                <div class="toolbar-left">
                  <button type="button" class="toolbar-btn fx-btn" onclick="insertReplySymbol('${commentId}', '$$')">f(x)</button>
                  <button type="button" class="toolbar-btn tag-btn" onclick="insertReplySymbol('${commentId}', '#')">#</button>
                  <button type="button" class="toolbar-btn alpha-btn" onclick="insertReplySymbol('${commentId}', 'α')">α:</button>
                  <button type="button" class="toolbar-btn img-btn" onclick="insertReplySymbol('${commentId}', '[ảnh]')">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </button>
                  <button type="button" class="toolbar-btn magic-btn" onclick="insertReplySymbol('${commentId}', '✨')">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
                  </button>
                </div>
                <div class="toolbar-right" style="display: flex; align-items: center; gap: 8px;">
                  <span class="char-count" id="reply-char-count-${commentId}">0/1000</span>
                  <button type="button" class="reply-send-btn" id="reply-send-btn-${commentId}" onclick="submitReply('${commentId}')" style="opacity: 0.5; pointer-events: none;">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        repliesList.insertAdjacentHTML("beforeend", replyInputHtml);
        const textarea = document.getElementById(`reply-textarea-${commentId}`);
        if (textarea) {
          textarea.focus();
          textarea.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
          });
        }
      };

      window.handleReplyTextareaInput = (commentId) => {
        const textarea = document.getElementById(`reply-textarea-${commentId}`);
        const countSpan = document.getElementById(`reply-char-count-${commentId}`);
        const sendBtn = document.getElementById(`reply-send-btn-${commentId}`);
        if (!textarea) return;

        const len = textarea.value.length;
        if (countSpan) countSpan.textContent = `${len}/1000`;
        
        if (sendBtn) {
          if (textarea.value.trim().length > 0) {
            sendBtn.style.opacity = "1";
            sendBtn.style.pointerEvents = "auto";
          } else {
            sendBtn.style.opacity = "0.5";
            sendBtn.style.pointerEvents = "none";
          }
        }
      };

      window.insertReplySymbol = (commentId, symbol) => {
        const textarea = document.getElementById(`reply-textarea-${commentId}`);
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + symbol + val.substring(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
        window.handleReplyTextareaInput(commentId);
      };

      window.submitReply = async (parentCommentId) => {
        const textarea = document.getElementById(`reply-textarea-${parentCommentId}`);
        if (!textarea) return;

        const replyText = textarea.value.trim();
        if (!replyText) return;

        const studentName = (studentInfo?.name || studentInfo?.username || "Học sinh").replace(/[▪■•]/g, "").trim();
        const studentEmail = studentInfo?.email || studentInfo?.username || "test";
        const commentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));

        const newComment = {
          id: commentId,
          created_at: new Date().toISOString(),
          course_id: currentLmsCourseId,
          lesson_id: currentLmsLessonId,
          user_name: studentName,
          user_email: studentEmail,
          content: JSON.stringify({ reply_to: parentCommentId, text: replyText })
        };

        const wrap = document.getElementById(`reply-input-wrap-${parentCommentId}`);
        if (wrap) wrap.remove();

        let success = false;
        if (window.supabaseClient) {
          try {
            const { error } = await window.supabaseClient
              .from('course_comments')
              .insert([newComment]);

            if (!error) {
              success = true;
            } else {
              throw error;
            }
          } catch (e) {
            console.warn("Failed to save reply to Supabase, fallback to localStorage:", e);
          }
        }

        saveLocalComment(newComment);
        loadLmsComments();
      };

      window.deleteComment = async (commentId) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

        if (window.supabaseClient) {
          try {
            const { error } = await window.supabaseClient
              .from('course_comments')
              .delete()
              .eq('id', commentId);

            if (error) throw error;
          } catch (e) {
            console.warn("Failed to delete comment from Supabase, fallback to localStorage:", e);
          }
        }

        const key = `tmaTsaComments_${currentLmsCourseId}_${currentLmsLessonId}`;
        let list = getLocalComments();
        list = list.filter(c => c.id !== commentId);
        localStorage.setItem(key, JSON.stringify(list));

        loadLmsComments();
      };

      window.startEditComment = (commentId) => {
        const textContainer = document.getElementById(`comment-text-${commentId}`);
        const actionsContainer = document.getElementById(`comment-actions-${commentId}`);
        if (!textContainer) return;

        const currentText = textContainer.getAttribute("data-raw-content");
        
        if (actionsContainer) actionsContainer.style.display = "none";

        textContainer.innerHTML = `
          <div style="margin-top: 4px;">
            <textarea id="edit-textarea-${commentId}" style="width:100%; min-height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:6px; font-size:12.5px; outline:none; resize:vertical; font-family:inherit; background:#ffffff; color:#000000;">${currentText}</textarea>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:4px;">
              <button onclick="cancelEditComment('${commentId}')" style="background:#f1f5f9; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:600; color:#475569;">Hủy</button>
              <button onclick="saveEditComment('${commentId}')" style="background:#0f5a9e; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:600; color:#ffffff;">Lưu</button>
            </div>
          </div>
        `;
        
        const ta = document.getElementById(`edit-textarea-${commentId}`);
        if (ta) ta.focus();
      };

      window.cancelEditComment = (commentId) => {
        loadLmsComments();
      };

      window.saveEditComment = async (commentId) => {
        const ta = document.getElementById(`edit-textarea-${commentId}`);
        if (!ta) return;

        const newText = ta.value.trim();
        if (!newText) return;

        const textContainer = document.getElementById(`comment-text-${commentId}`);
        const replyTo = textContainer ? textContainer.getAttribute("data-reply-to") : null;

        let updatedContent = newText;
        if (replyTo) {
          updatedContent = JSON.stringify({ reply_to: replyTo, text: newText });
        }

        if (window.supabaseClient) {
          try {
            const { error } = await window.supabaseClient
              .from('course_comments')
              .update({ content: updatedContent })
              .eq('id', commentId);

            if (error) throw error;
          } catch (e) {
            console.warn("Failed to update comment in Supabase, fallback to localStorage:", e);
          }
        }

        const key = `tmaTsaComments_${currentLmsCourseId}_${currentLmsLessonId}`;
        const list = getLocalComments();
        list.forEach(c => {
          if (c.id === commentId) {
            c.content = updatedContent;
          }
        });
        localStorage.setItem(key, JSON.stringify(list));

        loadLmsComments();
      };

      function handleCommentSubmitKey(event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submitLmsComment();
        }
      }

      function handleCommentInput(event) {
        // Send button logic handled
      }

      window.submitLmsComment = submitLmsComment;
      window.handleCommentSubmitKey = handleCommentSubmitKey;
      window.handleCommentInput = handleCommentInput;

      function stopWatermark() {
        if (watermarkTimer) { clearInterval(watermarkTimer); watermarkTimer = null; }
        const overlay = document.getElementById("video-watermark-overlay");
        if (overlay) overlay.style.display = "none";
      }

      function openClassroomModal(courseId) {
        try {
          console.log("Opening classroom modal for course:", courseId);
          const course = COURSES_DATA.find(c => c.id === courseId);
          if (!course) { alert("Không tìm thấy khóa học: " + courseId); return; }
          courseStudyModal.oncontextmenu = (e) => e.preventDefault();
          initCourseStudyThemeToggle();

          const studentCode = studentInfo?.email || studentInfo?.username || "test";
          const registeredIds = getRegisteredCourseIds();
          const isRegistered = registeredIds.includes(courseId);

          // Update topbar with course name
          const topbarLessonLabel = document.getElementById("study-topbar-lesson-name");
          if (topbarLessonLabel) topbarLessonLabel.textContent = course.title;
          document.getElementById("course-player-cover-text").textContent = course.title;

          // Dynamically bind topbar student name
          const topbarStudentNameEl = document.getElementById("study-topbar-student-name");
          if (topbarStudentNameEl) {
            topbarStudentNameEl.textContent = (studentInfo?.name || studentInfo?.username || "học sinh").replace(/[▪■•]/g, "").trim();
          }

          // Setup profile dropdown in study topbar
          const profileTrigger = document.getElementById("study-profile-trigger");
          const profileDropdown = document.getElementById("study-profile-dropdown");
          const profileChevron = document.getElementById("study-profile-chevron");
          const avatarCharEl = document.getElementById("study-avatar-char");
          const dropdownStudentName = document.getElementById("study-dropdown-student-name");

          if (profileTrigger && profileDropdown) {
            const displayName = (studentInfo?.name || studentInfo?.username || "Học sinh").replace(/[▪■•]/g, "").trim();
            if (dropdownStudentName) dropdownStudentName.textContent = displayName;
            if (avatarCharEl) {
              avatarCharEl.textContent = displayName.charAt(0).toUpperCase();
            }

            profileTrigger.onclick = (e) => {
              e.stopPropagation();
              const isShown = profileDropdown.style.display === "block";
              profileDropdown.style.display = isShown ? "none" : "block";
              if (profileChevron) {
                profileChevron.style.transform = isShown ? "rotate(0deg)" : "rotate(180deg)";
              }
            };

            // Bind actions to dropdown items
            const navProfileBtn = document.getElementById("study-nav-profile-btn");
            if (navProfileBtn) {
              navProfileBtn.onclick = () => {
                profileDropdown.style.display = "none";
                if (profileChevron) profileChevron.style.transform = "rotate(0deg)";
                closeCourseStudyModalFunc();
                switchTab("account");
              };
            }

            const navCoursesBtn = document.getElementById("study-nav-courses-btn");
            if (navCoursesBtn) {
              navCoursesBtn.onclick = () => {
                profileDropdown.style.display = "none";
                if (profileChevron) profileChevron.style.transform = "rotate(0deg)";
                closeCourseStudyModalFunc();
                switchTab("courses");
              };
            }

            const navScheduleBtn = document.getElementById("study-nav-schedule-btn");
            if (navScheduleBtn) {
              navScheduleBtn.onclick = () => {
                profileDropdown.style.display = "none";
                if (profileChevron) profileChevron.style.transform = "rotate(0deg)";
                alert("Tính năng Lịch học sẽ được cập nhật trong phiên bản tiếp theo!");
              };
            }

            const studyLogoutBtn = document.getElementById("study-logout-btn");
            if (studyLogoutBtn) {
              studyLogoutBtn.onclick = () => {
                profileDropdown.style.display = "none";
                if (profileChevron) profileChevron.style.transform = "rotate(0deg)";
                closeCourseStudyModalFunc();
                openLogoutDialog();
              };
            }

            if (!isStudyDropdownListenerRegistered) {
              window.addEventListener("click", (e) => {
                const dropdown = document.getElementById("study-profile-dropdown");
                const chevron = document.getElementById("study-profile-chevron");
                if (dropdown && dropdown.style.display === "block" && !e.target.closest(".study-profile-menu-container")) {
                  dropdown.style.display = "none";
                  if (chevron) chevron.style.transform = "rotate(0deg)";
                }
              });
              isStudyDropdownListenerRegistered = true;
            }
          }

          // Wire sidebar tab switching (cloneNode to remove previous listeners)
          document.querySelectorAll(".study-sidebar-tab").forEach(btn => {
            const nb = btn.cloneNode(true);
            btn.parentNode.replaceChild(nb, btn);
            nb.addEventListener("click", () => {
              document.querySelectorAll(".study-sidebar-tab").forEach(b => b.classList.remove("active"));
              document.querySelectorAll(".study-tab-content").forEach(c => c.classList.remove("active"));
              nb.classList.add("active");
              const tabEl = document.getElementById("study-tab-" + nb.dataset.sidebartab);
              if (tabEl) tabEl.classList.add("active");
              if (nb.dataset.sidebartab === "binh-luan") {
                loadLmsComments();
              }
            });
          });

          // Reset player
          document.getElementById("course-player-cover").style.display = "flex";
          const iframe = document.getElementById("course-video-iframe");
          iframe.style.display = "none";
          iframe.src = "";
          const driveOverlay = document.getElementById("video-drive-overlay");
          if (driveOverlay) driveOverlay.style.display = "none";
          stopWatermark();

          // Hide lesson info bar
          const infoBar = document.getElementById("study-lesson-info-bar");
          if (infoBar) infoBar.style.display = "none";

          const controlsBar = document.getElementById("player-controls-bar");
          const completeBtn = document.getElementById("lesson-complete-toggle-btn");
          if (controlsBar) controlsBar.style.display = "none";

          const courseModalActivationBtn = document.getElementById("course-modal-activation-btn");

          let activeLessonId = null;
          currentLmsCourseId = courseId;
          currentLmsLessonId = "";
          loadLmsComments();

          async function loadProgressAndRender() {
            let completedLessonIds = [];
            try {
              // Always read from local storage first as instant fallback
              const key = `tmaTsaLessonProgress_${studentInfo.username || studentInfo.email || "test"}`;
              const localProg = JSON.parse(localStorage.getItem(key) || "[]");
              completedLessonIds = [...localProg];

              if (supabaseClient) {
                const { data: dbProgress, error } = await supabaseClient
                  .from('lesson_progress').select('lesson_id').eq('user_email', studentCode);
                if (!error && dbProgress) {
                  const dbIds = dbProgress.map(p => p.lesson_id);
                  dbIds.forEach(id => {
                    if (!completedLessonIds.includes(id)) {
                      completedLessonIds.push(id);
                    }
                  });
                }
              }
            } catch (err) {
              const key = `tmaTsaLessonProgress_${studentInfo.username || studentInfo.email || "test"}`;
              completedLessonIds = JSON.parse(localStorage.getItem(key) || "[]");
            }

            const badge = document.getElementById("course-modal-status-badge");
            const lessonsArray = course.lessons || [];
            const completedInCourse = lessonsArray.filter(l => completedLessonIds.includes(l.id));
            const percent = lessonsArray.length > 0 ? Math.round((completedInCourse.length / lessonsArray.length) * 100) : 0;

            if (isRegistered) {
              if (badge) { badge.textContent = `Đã mở khóa (${percent}%)`; badge.className = "course-status-badge unlocked"; }
              if (courseModalActivationBtn) courseModalActivationBtn.style.display = "none";
            } else {
              if (badge) { badge.textContent = "Chưa mua"; badge.className = "course-status-badge locked"; }
              if (courseModalActivationBtn) courseModalActivationBtn.style.display = "block";
            }

            // Update sidebar progress bar
            const fill = document.getElementById("study-progress-fill");
            const pct = document.getElementById("study-progress-pct");
            if (fill) fill.style.width = percent + "%";
            if (pct) pct.textContent = percent + "%";

            // ===== TREE SIDEBAR RENDER =====
            const lessonsList = document.getElementById("course-modal-lessons-list");
            lessonsList.innerHTML = "";

            // Helper: detect lesson type from title
            function getLessonType(title) {
              const raw = (title || "").trim();
              if (raw.startsWith("↳") || raw.startsWith("&rarr;") || raw.startsWith("->")) return "phan";
              const t = raw.toLowerCase();
              if (t.startsWith("phần") || t.startsWith("phan") || t.startsWith("phân") || t.startsWith("phản") || t.match(/^p\d/)) return "phan";
              if (t.startsWith("tài liệu") || t.startsWith("tai lieu") || t.startsWith("file")) return "document";
              if (t.startsWith("thi online") || t.startsWith("bài tập kiểm tra") || t.startsWith("bài kiểm tra")) return "test";
              return "bai"; // default = main lesson (Bài X)
            }

            // Helper: get parent bai key from title like "Phần 2.1" -> "2"
            function getParentBaiNum(title) {
              const m = title.match(/ph[aầ]n\s*(\d+)\.(\d+)/i) || title.match(/p(\d+)\.(\d+)/i);
              return m ? m[1] : null;
            }

            // Group by chapter and sort chronologically by upload order (created_at)
            const chapters = {};
            const chapterMinCreatedAt = {};
            lessonsArray.forEach((lesson, idx) => {
              const chName = lesson.chapter_name || "Chương 1: Bài học cơ bản";
              if (!chapters[chName]) {
                chapters[chName] = [];
              }
              chapters[chName].push(lesson);
              
              const lessonCreated = lesson.created_at ? new Date(lesson.created_at).getTime() : idx;
              if (chapterMinCreatedAt[chName] === undefined || lessonCreated < chapterMinCreatedAt[chName]) {
                chapterMinCreatedAt[chName] = lessonCreated;
              }
            });
            
            const chapterOrder = Object.keys(chapters);
            chapterOrder.sort((a, b) => {
              const timeA = chapterMinCreatedAt[a] || 0;
              const timeB = chapterMinCreatedAt[b] || 0;
              return timeA - timeB;
            });
            
            chapterOrder.forEach(chName => {
              chapters[chName].sort(compareLessonSortKeys);
            });

            // SVG icons
            const SVG_PLAY = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="none" stroke="currentColor" stroke-width="1.8"></polygon></svg>`;
            const SVG_CHECK = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            const SVG_LOCK = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
            const SVG_DOC = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"></path><polyline points="14 2 14 7 19 7"></polyline></svg>`;
            const SVG_TEST = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="2"></rect><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="16" x2="13" y2="16"></line></svg>`;
            const SVG_CHEVRON = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

            function makeLessonClickable(el, lesson) {
              const isCompleted = completedLessonIds.includes(lesson.id);
              el.addEventListener("click", () => {
                if (!isRegistered && !lesson.preview_allowed) {
                  showCustomAlert(`Khóa học chưa được mở. Vui lòng bấm "MÃ TRUY CẬP" để nhập mã kích hoạt!`);
                  return;
                }
                activeLessonId = lesson.id;
                currentLmsLessonId = lesson.id;
                loadLmsComments();

                // Remove old warning first
                const oldWarning = document.getElementById("lms-file-protocol-warning");
                if (oldWarning) oldWarning.remove();

                // Show lesson info bar
                const infoBar2 = document.getElementById("study-lesson-info-bar");
                const lessonTitleEl = document.getElementById("study-lesson-title");
                const viewCountBadge = document.getElementById("study-lesson-view-badge");
                const viewCountVal = document.getElementById("study-lesson-view-count");
                const downloadCountBadge = document.getElementById("study-lesson-download-badge");
                const downloadCountVal = document.getElementById("study-lesson-download-count");

                if (infoBar2) infoBar2.style.display = "flex";
                if (lessonTitleEl) lessonTitleEl.textContent = lesson.title;
                if (viewCountBadge && viewCountVal) {
                  viewCountBadge.style.display = "inline-flex";
                  viewCountVal.textContent = incrementLessonMetric("view", lesson);
                }
                if (downloadCountBadge && downloadCountVal) {
                  downloadCountBadge.style.display = "inline-flex";
                  downloadCountVal.textContent = readLessonMetric("download", lesson);
                }

                const likeBtn = document.getElementById("lesson-like-toggle-btn");
                if (likeBtn) {
                  likeBtn.onclick = () => {
                    toggleLessonLike(lesson);
                  };
                }
                updateLessonLikeUI(lesson);

                // Remove active class from all kinds of sidebar items
                lessonsList.querySelectorAll(".tree-bai-row, .tree-phan-row, .tree-standalone-row").forEach(item => item.classList.remove("active"));
                el.classList.add("active");



                document.getElementById("course-player-cover").style.display = "none";
                iframe.style.display = "block";

                if (completeBtn) {
                  if (isCompleted) {
                    completeBtn.className = "lesson-complete-btn completed";
                    completeBtn.querySelector("span").textContent = "Đã hoàn thành";
                  } else {
                    completeBtn.className = "lesson-complete-btn";
                    completeBtn.querySelector("span").textContent = "Đánh dấu hoàn thành";
                  }
                }
                                
                                const isVideo = getLessonIconSvg(lesson.title).includes("polygon");
                                const downloadDocBtn = document.getElementById("lesson-download-doc-btn");
                                if (downloadDocBtn) {
                                  downloadDocBtn.onclick = null;
                                  if (lesson.doc_link) {
                                    downloadDocBtn.href = lesson.doc_link;
                                    downloadDocBtn.style.display = "flex";
                                    downloadDocBtn.onclick = () => {
                                      const nextDownloadCount = incrementLessonMetric("download", lesson);
                                      const downloadCountVal = document.getElementById("study-lesson-download-count");
                                      if (downloadCountVal) downloadCountVal.textContent = nextDownloadCount;
                                    };
                                  } else {
                                    downloadDocBtn.removeAttribute("href");
                                    downloadDocBtn.style.display = "none";
                                  }
                                }
                                if (isVideo) {
                                  const videoId = lesson.video_drive_id || "";
                                  const isYouTube = videoId.length === 11 || videoId.includes("youtube.com") || videoId.includes("youtu.be");
                                  
                                  if (isYouTube) {
                                    let cleanYtId = videoId;
                                    const ytMatch = videoId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/ ]{11})/i);
                                    if (ytMatch && ytMatch[1]) {
                                      cleanYtId = ytMatch[1];
                                    }
                                    iframe.src = `https://www.youtube-nocookie.com/embed/${cleanYtId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&color=white&showinfo=0`;
                                    const driveOverlay = document.getElementById("video-drive-overlay");
                                    if (driveOverlay) driveOverlay.style.display = "none";
                                  } else {
                                    let cleanDriveId = videoId;
                                    const driveMatch = videoId.match(/\/d\/([a-zA-Z0-9_-]{25,100})/);
                                    if (driveMatch && driveMatch[1]) {
                                      cleanDriveId = driveMatch[1];
                                    }
                                    iframe.src = `https://drive.google.com/file/d/${cleanDriveId || "17l2lP"}/preview`;
                                    const driveOverlay = document.getElementById("video-drive-overlay");
                                    if (driveOverlay) driveOverlay.style.display = "block";
                                  }
                                  
                                  startWatermark(studentInfo.name || studentInfo.username || "Học sinh", studentInfo.phone);
                                  
                                  // Write video view log (Feature 2)
                                  writeVideoViewLog(studentCode, lesson, course.title);
                                } else {
                                  iframe.src = convertToDrivePreviewUrl(lesson.doc_link || "https://example.com/mock-doc.pdf");
                                  stopWatermark();
                                }
              });
            }

            chapterOrder.forEach((chName) => {
              const chapterLessons = chapters[chName];

              // Chapter header
              const chHeader = document.createElement("button");
              chHeader.type = "button";
              chHeader.className = "tree-chapter-header";
              const chTitle = document.createElement("span");
              chTitle.className = "tree-chapter-title";
              chTitle.textContent = chName.toUpperCase();
              const chToggle = document.createElement("span");
              chToggle.className = "tree-chapter-toggle open";
              chToggle.innerHTML = SVG_CHEVRON;
              chHeader.appendChild(chTitle);
              chHeader.appendChild(chToggle);
              lessonsList.appendChild(chHeader);

              const chapterBody = document.createElement("div");
              chapterBody.className = "tree-chapter-body";
              lessonsList.appendChild(chapterBody);
              chHeader.addEventListener("click", () => {
                const shouldCollapse = !chapterBody.hidden;
                chapterBody.hidden = shouldCollapse;
                chHeader.classList.toggle("collapsed", shouldCollapse);
                chToggle.classList.toggle("open", !shouldCollapse);
              });

              // Group bai -> phan sub-items
              const baiGroups = [];
              let currentBai = null;

              chapterLessons.forEach(lesson => {
                const type = lesson.type === "header" ? "header" : getLessonType(lesson.title);
                if (type === "header") {
                  currentBai = null;
                  baiGroups.push({ type: "header", lesson });
                } else if (type === "phan") {
                  if (currentBai) {
                    currentBai.phans.push(lesson);
                  } else {
                    // orphan phan - treat as standalone
                    baiGroups.push({ type: "phan-standalone", lesson });
                  }
                } else if (type === "document") {
                  currentBai = null;
                  baiGroups.push({ type: "document", lesson });
                } else if (type === "test") {
                  currentBai = null;
                  baiGroups.push({ type: "test", lesson });
                } else {
                  // Main Bai
                  currentBai = { type: "bai", lesson, phans: [] };
                  baiGroups.push(currentBai);
                }
              });

              // Render each group
              baiGroups.forEach(group => {
                const lesson = group.lesson;
                const isCompleted = completedLessonIds.includes(lesson.id);

                if (group.type === "bai") {
                  // Main lesson row (collapsible if has phans)
                  const hasSubs = group.phans.length > 0;
                  const baiRow = document.createElement("div");
                  baiRow.className = "tree-bai-row" + (activeLessonId === lesson.id ? " active" : "") + (isCompleted ? " completed-row" : "");

                  const toggleEl = document.createElement("div");
                  toggleEl.className = "tree-toggle-arrow" + (hasSubs ? " open" : "");
                  toggleEl.innerHTML = hasSubs ? SVG_CHEVRON : "";
                  toggleEl.style.visibility = hasSubs ? "visible" : "hidden";

                  const iconEl = document.createElement("div");
                  iconEl.className = "tree-row-icon";
                  iconEl.innerHTML = SVG_PLAY;

                  const labelEl = document.createElement("span");
                  labelEl.className = "tree-row-label";
                  labelEl.textContent = lesson.title;

                  const rightEl = document.createElement("div");
                  rightEl.className = "tree-right-icon";
                  if (!isRegistered && !lesson.preview_allowed) {
                    rightEl.innerHTML = SVG_LOCK;
                    rightEl.className = "tree-right-icon tree-lock-icon";
                  } else if (isCompleted) {
                    rightEl.innerHTML = SVG_CHECK;
                  }

                  baiRow.appendChild(iconEl);
                  baiRow.appendChild(labelEl);
                  if (hasSubs) {
                    baiRow.appendChild(toggleEl);
                  }
                  baiRow.appendChild(rightEl);
                  chapterBody.appendChild(baiRow);

                  // Sub-list for phans
                  const subList = document.createElement("div");
                  subList.className = "tree-sub-list";
                  subList.style.display = hasSubs ? "block" : "none";

                  group.phans.forEach((phan, index) => {
                    const phanCompleted = completedLessonIds.includes(phan.id);
                    const phanRow = document.createElement("div");
                    const isLast = index === group.phans.length - 1;
                    phanRow.className = "tree-phan-row" + (activeLessonId === phan.id ? " active" : "") + (phanCompleted ? " completed" : "") + (isLast ? " last-sub-lesson" : "");

                    phanRow.innerHTML = `
                      <span class="tree-phan-indent"><svg class="tree-branch-svg" viewBox="0 0 18 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 0v8a4 4 0 0 0 4 4h6m-3-3l3 3-3 3"/></svg></span>
                      <div class="tree-phan-icon">${SVG_PLAY}</div>
                      <span class="tree-phan-label">${phan.title}</span>
                      <div class="tree-right-icon ${(!isRegistered && !phan.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !phan.preview_allowed) ? SVG_LOCK : (phanCompleted ? SVG_CHECK : "")}</div>
                    `;

                    makeLessonClickable(phanRow, phan);
                    subList.appendChild(phanRow);
                  });

                  if (hasSubs) chapterBody.appendChild(subList);

                  // Toggle sub-list on bai click (if has subs)
                  if (hasSubs) {
                    toggleEl.addEventListener("click", (e) => {
                      e.stopPropagation();
                      const isOpen = subList.style.display !== "none";
                      subList.style.display = isOpen ? "none" : "block";
                      toggleEl.classList.toggle("open", !isOpen);
                    });
                  }

                  // Play lesson on bai row click (if no subs, or click label directly)
                  makeLessonClickable(baiRow, lesson);

                } else if (group.type === "header") {
                  const row = document.createElement("div");
                  row.className = "tree-header-row";
                  row.style.cssText = "padding: 10px 14px; background: transparent; border-bottom: 1px solid #f1f5f9; margin: 8px 10px 4px; font-weight: 700; color: #0f5a9e; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.3px; text-align: left; display: flex; align-items: center; gap: 6px;";
                  row.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="#0f5a9e" stroke="none" style="display: inline-block; vertical-align: middle; flex-shrink: 0; margin-right: 4px;"><path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/></svg> <span>${lesson.title}</span>`;
                  chapterBody.appendChild(row);

                } else if (group.type === "document") {
                  const row = document.createElement("div");
                  row.className = "tree-standalone-row" + (activeLessonId === lesson.id ? " active" : "") + (isCompleted ? " completed-row" : "");
                  row.innerHTML = `
                    <div class="tree-doc-icon">${SVG_DOC}</div>
                    <span class="tree-row-label">${lesson.title}</span>
                    <div class="tree-right-icon ${(!isRegistered && !lesson.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !lesson.preview_allowed) ? SVG_LOCK : (isCompleted ? SVG_CHECK : "")}</div>
                  `;
                  makeLessonClickable(row, lesson);
                  chapterBody.appendChild(row);

                } else if (group.type === "test") {
                  const row = document.createElement("div");
                  row.className = "tree-standalone-row" + (activeLessonId === lesson.id ? " active" : "") + (isCompleted ? " completed-row" : "");
                  row.innerHTML = `
                    <div class="tree-test-icon">${SVG_TEST}</div>
                    <span class="tree-row-label">${lesson.title}</span>
                    <div class="tree-right-icon ${(!isRegistered && !lesson.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !lesson.preview_allowed) ? SVG_LOCK : (isCompleted ? SVG_CHECK : "")}</div>
                  `;
                  makeLessonClickable(row, lesson);
                  chapterBody.appendChild(row);

                } else if (group.type === "phan-standalone") {
                  const phanRow = document.createElement("div");
                  const phanCompleted = completedLessonIds.includes(lesson.id);
                  phanRow.className = "tree-phan-row" + (activeLessonId === lesson.id ? " active" : "") + (phanCompleted ? " completed" : "") + " last-sub-lesson";
                  phanRow.innerHTML = `
                    <span class="tree-phan-indent"><svg class="tree-branch-svg" viewBox="0 0 18 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 0v8a4 4 0 0 0 4 4h6m-3-3l3 3-3 3"/></svg></span>
                    <div class="tree-phan-icon">${SVG_PLAY}</div>
                    <span class="tree-phan-label">${lesson.title}</span>
                    <div class="tree-right-icon ${(!isRegistered && !lesson.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !lesson.preview_allowed) ? SVG_LOCK : (phanCompleted ? SVG_CHECK : "")}</div>
                  `;
                  makeLessonClickable(phanRow, lesson);
                  chapterBody.appendChild(phanRow);
                }
              });
            });





            // DUMMY: keep this reference so JS compat is maintained
            const _legacyAccordionDummy = null;
          }

          // Initial render of progress
          loadProgressAndRender();

          // Tự động chọn bài học đầu tiên khi vừa mở modal để tránh màn hình trống
          setTimeout(() => {
            const firstLessonItem = lessonsList.querySelector(".tree-bai-row, .tree-phan-row, .tree-standalone-row");
            if (firstLessonItem) {
              const labelToClick = firstLessonItem.querySelector(".tree-row-label, .tree-phan-label") || firstLessonItem;
              labelToClick.click();
            }
          }, 300);

          // Set complete toggle handler
          if (completeBtn) {
            completeBtn.onclick = async () => {
              if (!activeLessonId) return;
              
              const isCompletedCurrently = completeBtn.classList.contains("completed");
              
              // Always write to localStorage first as an instant, non-blocking fallback
              const key = `tmaTsaLessonProgress_${studentInfo.username || studentInfo.email || "test"}`;
              let localProg = JSON.parse(localStorage.getItem(key) || "[]");
              if (isCompletedCurrently) {
                localProg = localProg.filter(id => id !== activeLessonId);
              } else {
                if (!localProg.includes(activeLessonId)) localProg.push(activeLessonId);
              }
              localStorage.setItem(key, JSON.stringify(localProg));

              if (supabaseClient) {
                try {
                  if (isCompletedCurrently) {
                    await supabaseClient
                      .from('lesson_progress')
                      .delete()
                      .eq('user_email', studentCode)
                      .eq('lesson_id', activeLessonId);
                  } else {
                    await supabaseClient
                      .from('lesson_progress')
                      .insert({
                        user_email: studentCode,
                        lesson_id: activeLessonId,
                        status: 'completed'
                      });
                  }
                } catch (dbErr) {
                  console.warn("Failed to update database progress, fallback to local:", dbErr);
                }
              }

              // Refresh sidebar progress and icon states
              await loadProgressAndRender();

              // Re-render button state
              const nowCompleted = !isCompletedCurrently;
              if (nowCompleted) {
                completeBtn.className = "lesson-complete-btn completed";
                completeBtn.querySelector("span").textContent = "Đã hoàn thành";
              } else {
                completeBtn.className = "lesson-complete-btn";
                completeBtn.querySelector("span").textContent = "Đánh dấu hoàn thành";
              }
            };
          }

          // Set activation click handler for this course
          courseModalActivationBtn.onclick = async () => {
            const codeInput = await showCustomPrompt(`NHẬP MÃ KÍCH HOẠT KHÓA HỌC:\nVui lòng nhập mã kích hoạt:`);
            if (codeInput !== null) {
              const cleanCode = codeInput.trim();
              const studentCode = studentInfo?.email || studentInfo?.username || "test";

              // Chế độ test local offline (chỉ hoạt động khi không cấu hình Supabase Client)
              if (!supabaseClient) {
                if (cleanCode === "123" || cleanCode.toUpperCase() === "VIP") {
                  registerCourse(courseId);
                  await showCustomAlert(`Kích hoạt thành công khóa học "${course.title}"! Chúc bạn học tập tốt!`);
                  openClassroomModal(courseId); // reload layout
                } else {
                  await showCustomAlert(`Mã kích hoạt không chính xác hoặc đã hết hạn sử dụng. Vui lòng liên hệ Admin để nhận mã kích hoạt hợp lệ!`);
                }
                return;
              }

              // Gọi Supabase thật qua RPC để bảo mật mã kích hoạt và ghi danh trên server
              try {
                const { data: rpcRes, error: rpcErr } = await supabaseClient.rpc('redeem_activation_code', {
                  p_email: studentCode,
                  p_code: cleanCode,
                  p_course_id: courseId
                });

                if (rpcErr) throw rpcErr;

                if (!rpcRes || !rpcRes.success) {
                  await showCustomAlert(rpcRes?.message || "Mã kích hoạt không chính xác hoặc đã hết hạn sử dụng.");
                  return;
                }

                // Tải lại quyền truy cập mới nhất
                await loadCoursesAndEnrollments(true);

                await showCustomAlert(`Kích hoạt thành công khóa học "${course.title}"! Chúc bạn học tập tốt!`);
                openClassroomModal(courseId); // reload layout
                
                // Re-render
                renderExamRoomCourses();
                renderOverviewCourses();

              } catch (err) {
                console.error("Lỗi kích hoạt:", err);
                await showCustomAlert(`Gặp lỗi khi kết nối máy chủ: ${err.message || err}`);
              }
            }
          };

          courseStudyModal.hidden = false;
          document.body.style.overflow = 'hidden';

        } catch (err) {
          alert("Lỗi khi mở giao diện học tập:\n" + err.message + "\n" + err.stack);
        }
      }

      function closeCourseStudyModalFunc() {
        courseStudyModal.hidden = true;
        document.body.style.overflow = '';
        stopWatermark();
        const iframe = document.getElementById("course-video-iframe");
        if (iframe) iframe.src = "";
        const driveOverlay = document.getElementById("video-drive-overlay");
        if (driveOverlay) driveOverlay.style.display = "none";
      }

      if (closeCourseModalBtn) closeCourseModalBtn.addEventListener("click", closeCourseStudyModalFunc);

      // Initialize UI
      updateAccountUI();
      loadCoursesAndEnrollments().then(() => {
        renderExamRoomCourses();
        renderOverviewCourses();
      });

      // EDIT PROFILE MODALS HANDLERS
      const editModal = document.getElementById("edit-profile-modal");
      const editBtn = document.getElementById("edit-profile-btn");
      const closeEditBtn = document.getElementById("close-edit-modal");
      const cancelEditBtn = document.getElementById("cancel-edit-btn");
      const editForm = document.getElementById("edit-profile-form");
      const editProvince = document.getElementById("edit-province");
      const editDistrictWrap = document.getElementById("edit-district-wrap");
      const editError = document.getElementById("edit-profile-error");

      // Fetch wrapper
      async function apiFetch(url) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("HTTP error");
          return await res.json();
        } catch (e) {
          console.warn("Fetch failed for " + url, e);
          return null;
        }
      }

      let cachedProvinces = null;
      async function loadProvincesForEdit() {
        if (cachedProvinces) return cachedProvinces;
        cachedProvinces = await apiFetch("https://provinces.open-api.vn/api/p/");
        return cachedProvinces;
      }

      function useStaticFallback(provinceName, selectedDistrict, selectedWard) {
        const districtWrap = document.getElementById("edit-district-wrap");
        const wardWrap = document.getElementById("edit-ward-wrap");
        
        if (MAJOR_DISTRICTS[provinceName]) {
          const select = document.createElement("select");
          select.id = "edit-district";
          select.className = "form-select";
          select.required = true;
          select.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
          MAJOR_DISTRICTS[provinceName].forEach((d) => {
            const opt = document.createElement("option");
            opt.value = d;
            opt.textContent = d;
            if (d === selectedDistrict) opt.selected = true;
            select.appendChild(opt);
          });
          districtWrap.innerHTML = "";
          districtWrap.appendChild(select);
        } else {
          const input = document.createElement("input");
          input.id = "edit-district";
          input.type = "text";
          input.required = true;
          input.placeholder = "Nhập Quận / Huyện";
          input.value = selectedDistrict || "";
          districtWrap.innerHTML = "";
          districtWrap.appendChild(input);
        }

        const wardInput = document.createElement("input");
        wardInput.id = "edit-ward";
        wardInput.type = "text";
        wardInput.required = true;
        wardInput.placeholder = "Nhập Phường / Xã";
        wardInput.value = selectedWard || "";
        wardWrap.innerHTML = "";
        wardWrap.appendChild(wardInput);
      }

      // Handle province change in edit modal
      if (editProvince) {
        editProvince.addEventListener("change", async () => {
          const provVal = editProvince.value;
          const districtWrap = document.getElementById("edit-district-wrap");
          const wardWrap = document.getElementById("edit-ward-wrap");
          
          districtWrap.innerHTML = '<input id="edit-district" type="text" placeholder="Đang tải Quận / Huyện..." required>';
          wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Đang tải Phường / Xã..." required>';
          
          if (!provVal) {
            districtWrap.innerHTML = '<input id="edit-district" type="text" placeholder="Nhập Quận / Huyện" required>';
            wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Nhập Phường / Xã" required>';
            return;
          }

          if (provVal.includes("|")) {
            const [provCode, provName] = provVal.split("|");
            const data = await apiFetch(`https://provinces.open-api.vn/api/p/${provCode}?depth=2`);
            if (data && data.districts && Array.isArray(data.districts)) {
              const select = document.createElement("select");
              select.id = "edit-district";
              select.className = "form-select";
              select.required = true;
              select.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
              data.districts.forEach((d) => {
                const opt = document.createElement("option");
                opt.value = `${d.code}|${d.name}`;
                opt.textContent = d.name;
                select.appendChild(opt);
              });
              districtWrap.innerHTML = "";
              districtWrap.appendChild(select);
              
              wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Chọn Quận / Huyện trước" disabled style="background: #f1f5f9; cursor: not-allowed;" required>';

              select.addEventListener("change", async () => {
                const distVal = select.value;
                wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Đang tải Phường / Xã..." required>';
                if (!distVal) {
                  wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Chọn Quận / Huyện trước" disabled style="background: #f1f5f9; cursor: not-allowed;" required>';
                  return;
                }
                if (distVal.includes("|")) {
                  const [distCode, distName] = distVal.split("|");
                  const wData = await apiFetch(`https://provinces.open-api.vn/api/d/${distCode}?depth=2`);
                  if (wData && wData.wards && Array.isArray(wData.wards)) {
                    const wardSelect = document.createElement("select");
                    wardSelect.id = "edit-ward";
                    wardSelect.className = "form-select";
                    wardSelect.required = true;
                    wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
                    wData.wards.forEach((w) => {
                      const opt = document.createElement("option");
                      opt.value = w.name;
                      opt.textContent = w.name;
                      wardSelect.appendChild(opt);
                    });
                    wardWrap.innerHTML = "";
                    wardWrap.appendChild(wardSelect);
                  } else {
                    wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Nhập Phường / Xã" required>';
                  }
                } else {
                  wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Nhập Phường / Xã" required>';
                }
              });
            } else {
              useStaticFallback(provName, "", "");
            }
          } else {
            useStaticFallback(provVal, "", "");
          }
        });
      }

      async function openEditModal() {
        if (!studentInfo) return;
        document.getElementById("edit-name").value = studentInfo.name || "";
        document.getElementById("edit-dob").value = studentInfo.dob || "";
        document.getElementById("edit-gender").value = studentInfo.gender || "Nam";
        document.getElementById("edit-cccd").value = studentInfo.cccd || "";
        document.getElementById("edit-phone").value = studentInfo.phone || "";
        document.getElementById("edit-email").value = studentInfo.email || "";
        document.getElementById("edit-school").value = studentInfo.school || "";
        document.getElementById("edit-class").value = studentInfo.className || "";
        document.getElementById("edit-street").value = studentInfo.street || "";
        
        editError.textContent = "";
        editModal.hidden = false;

        const provinceSelect = document.getElementById("edit-province");
        const districtWrap = document.getElementById("edit-district-wrap");
        const wardWrap = document.getElementById("edit-ward-wrap");

        provinceSelect.innerHTML = '<option value="">Đang tải...</option>';
        districtWrap.innerHTML = '<input id="edit-district" type="text" placeholder="Đang tải Quận / Huyện..." required>';
        wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Đang tải Phường / Xã..." required>';

        const userProvinceName = studentInfo.province || "";
        const userDistrictName = studentInfo.district || "";
        const userWardName = studentInfo.ward || "";

        const provinces = await loadProvincesForEdit();
        if (provinces && Array.isArray(provinces)) {
          provinceSelect.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>';
          let selectedProvValue = "";
          let selectedProvCode = "";

          provinces.forEach((p) => {
            const opt = document.createElement("option");
            const val = `${p.code}|${p.name}`;
            opt.value = val;
            opt.textContent = p.name;
            if (p.name === userProvinceName) {
              opt.selected = true;
              selectedProvValue = val;
              selectedProvCode = String(p.code);
            }
            provinceSelect.appendChild(opt);
          });

          if (selectedProvCode) {
            const districtsData = await apiFetch(`https://provinces.open-api.vn/api/p/${selectedProvCode}?depth=2`);
            if (districtsData && districtsData.districts && Array.isArray(districtsData.districts)) {
              const distSelect = document.createElement("select");
              distSelect.id = "edit-district";
              distSelect.className = "form-select";
              distSelect.required = true;
              distSelect.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
              
              let selectedDistValue = "";
              let selectedDistCode = "";

              districtsData.districts.forEach((d) => {
                const opt = document.createElement("option");
                const val = `${d.code}|${d.name}`;
                opt.value = val;
                opt.textContent = d.name;
                if (d.name === userDistrictName) {
                  opt.selected = true;
                  selectedDistValue = val;
                  selectedDistCode = String(d.code);
                }
                distSelect.appendChild(opt);
              });

              districtWrap.innerHTML = "";
              districtWrap.appendChild(distSelect);

              distSelect.addEventListener("change", async () => {
                const distVal = distSelect.value;
                wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Đang tải Phường / Xã..." required>';
                if (!distVal) {
                  wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Chọn Quận / Huyện trước" disabled style="background: #f1f5f9; cursor: not-allowed;" required>';
                  return;
                }
                if (distVal.includes("|")) {
                  const [distCode, distName] = distVal.split("|");
                  const wData = await apiFetch(`https://provinces.open-api.vn/api/d/${distCode}?depth=2`);
                  if (wData && wData.wards && Array.isArray(wData.wards)) {
                    const wardSelect = document.createElement("select");
                    wardSelect.id = "edit-ward";
                    wardSelect.className = "form-select";
                    wardSelect.required = true;
                    wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
                    wData.wards.forEach((w) => {
                      const opt = document.createElement("option");
                      opt.value = w.name;
                      opt.textContent = w.name;
                      wardSelect.appendChild(opt);
                    });
                    wardWrap.innerHTML = "";
                    wardWrap.appendChild(wardSelect);
                  } else {
                    wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Nhập Phường / Xã" required>';
                  }
                } else {
                  wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Nhập Phường / Xã" required>';
                }
              });

              if (selectedDistCode) {
                const wardsData = await apiFetch(`https://provinces.open-api.vn/api/d/${selectedDistCode}?depth=2`);
                if (wardsData && wardsData.wards && Array.isArray(wardsData.wards)) {
                  const wardSelect = document.createElement("select");
                  wardSelect.id = "edit-ward";
                  wardSelect.className = "form-select";
                  wardSelect.required = true;
                  wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';

                  wardsData.wards.forEach((w) => {
                    const opt = document.createElement("option");
                    opt.value = w.name;
                    opt.textContent = w.name;
                    if (w.name === userWardName) {
                      opt.selected = true;
                    }
                    wardSelect.appendChild(opt);
                  });

                  wardWrap.innerHTML = "";
                  wardWrap.appendChild(wardSelect);
                } else {
                  const wardInput = document.createElement("input");
                  wardInput.id = "edit-ward";
                  wardInput.type = "text";
                  wardInput.required = true;
                  wardInput.placeholder = "Nhập Phường / Xã";
                  wardInput.value = userWardName;
                  wardWrap.innerHTML = "";
                  wardWrap.appendChild(wardInput);
                }
              } else {
                wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Chọn Quận / Huyện trước" disabled style="background: #f1f5f9; cursor: not-allowed;" required>';
              }

            } else {
              useStaticFallback(userProvinceName, userDistrictName, userWardName);
            }
          } else {
            districtWrap.innerHTML = '<input id="edit-district" type="text" placeholder="Chọn Tỉnh / Thành phố trước" disabled style="background: #f1f5f9; cursor: not-allowed;" required>';
            wardWrap.innerHTML = '<input id="edit-ward" type="text" placeholder="Chọn Tỉnh / Thành phố trước" disabled style="background: #f1f5f9; cursor: not-allowed;" required>';
          }

        } else {
          provinceSelect.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>';
          VIETNAM_PROVINCES.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p;
            opt.textContent = p;
            if (p === userProvinceName) opt.selected = true;
            provinceSelect.appendChild(opt);
          });
          useStaticFallback(userProvinceName, userDistrictName, userWardName);
        }
      }

      function closeEditModalFunc() {
        editModal.hidden = true;
      }

      if (editBtn) editBtn.addEventListener("click", openEditModal);
      if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModalFunc);
      if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModalFunc);
      document.getElementById("edit-profile-backdrop").addEventListener("click", closeEditModalFunc);

      // Submit edit form
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const rawProv = document.getElementById("edit-province").value;
        const rawDist = document.getElementById("edit-district").value;
        const rawWard = document.getElementById("edit-ward").value;

        const cleanProv = rawProv.includes("|") ? rawProv.split("|")[1] : rawProv;
        const cleanDist = rawDist.includes("|") ? rawDist.split("|")[1] : rawDist;
        const cleanWard = rawWard.includes("|") ? rawWard.split("|")[1] : rawWard;

        const updated = {
          ...studentInfo,
          name: document.getElementById("edit-name").value.trim(),
          dob: document.getElementById("edit-dob").value,
          gender: document.getElementById("edit-gender").value,
          cccd: document.getElementById("edit-cccd").value.trim(),
          phone: document.getElementById("edit-phone").value.trim(),
          school: document.getElementById("edit-school").value.trim(),
          className: document.getElementById("edit-class").value.trim(),
          province: cleanProv,
          district: cleanDist,
          ward: cleanWard,
          street: document.getElementById("edit-street").value.trim(),
        };

        // Validate
        if (!updated.name || !updated.dob || !updated.gender || !updated.cccd || 
            !updated.phone || !updated.school || !updated.className || 
            !updated.province || !updated.district || !updated.ward || !updated.street) {
          editError.textContent = "Vui lòng nhập đầy đủ thông tin bắt buộc.";
          return;
        }

        // Sync with tmaTsaUsers
        if (studentInfo.username !== "test") {
          try {
            const users = JSON.parse(localStorage.getItem("tmaTsaUsers") || "[]");
            const index = users.findIndex(u => String(u.email || u.username).toLowerCase() === String(studentInfo.email).toLowerCase());
            if (index !== -1) {
              users[index] = {
                ...users[index],
                name: updated.name,
                dob: updated.dob,
                gender: updated.gender,
                cccd: updated.cccd,
                phone: updated.phone,
                school: updated.school,
                className: updated.className,
                province: updated.province,
                district: updated.district,
                ward: updated.ward,
                street: updated.street
              };
              localStorage.setItem("tmaTsaUsers", JSON.stringify(users));
            }
          } catch (err) {
            console.error("Failed to sync updated profile to users list", err);
          }
        }

        // Save studentInfo
        studentInfo = updated;
        localStorage.setItem("studentInfo", JSON.stringify(studentInfo));
        updateAccountUI();
        closeEditModalFunc();
      });

      // CHANGE PASSWORD MODALS HANDLERS
      const pwdModal = document.getElementById("change-pwd-modal");
      const pwdBtn = document.getElementById("change-pwd-btn");
      const closePwdBtn = document.getElementById("close-pwd-modal");
      const cancelPwdBtn = document.getElementById("cancel-pwd-btn");
      const pwdForm = document.getElementById("change-pwd-form");
      const pwdError = document.getElementById("change-pwd-error");

      function openPwdModal() {
        pwdForm.reset();
        pwdError.textContent = "";
        pwdModal.hidden = false;
      }

      function closePwdModalFunc() {
        pwdModal.hidden = true;
      }

      if (pwdBtn) pwdBtn.addEventListener("click", openPwdModal);
      if (closePwdBtn) closePwdBtn.addEventListener("click", closePwdModalFunc);
      if (cancelPwdBtn) cancelPwdBtn.addEventListener("click", closePwdModalFunc);
      document.getElementById("change-pwd-backdrop").addEventListener("click", closePwdModalFunc);

      async function hashPassword(password) {
        if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
          return "legacy:" + password;
        }
        const bytes = new TextEncoder().encode(password);
        const digest = await window.crypto.subtle.digest("SHA-256", bytes);
        return "sha256:" + Array.from(new Uint8Array(digest))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
      }

      pwdForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const oldPwd = document.getElementById("pwd-old").value;
        const newPwd = document.getElementById("pwd-new").value;
        const confirmPwd = document.getElementById("pwd-confirm").value;

        if (!oldPwd || !newPwd || !confirmPwd) {
          pwdError.textContent = "Vui lòng nhập đầy đủ thông tin.";
          return;
        }

        if (newPwd.length < 6) {
          pwdError.textContent = "Mật khẩu mới phải từ 6 ký tự.";
          return;
        }

        if (newPwd !== confirmPwd) {
          pwdError.textContent = "Mật khẩu xác nhận chưa khớp.";
          return;
        }

        if (studentInfo.username === "test") {
          if (oldPwd === "182201") {
            pwdError.textContent = "Không được phép đổi mật khẩu tài khoản test mặc định.";

          } else {
            pwdError.textContent = "Mật khẩu cũ không chính xác.";
          }
          return;
        }

        try {
          const users = JSON.parse(localStorage.getItem("tmaTsaUsers") || "[]");
          const index = users.findIndex(u => String(u.email || u.username).toLowerCase() === String(studentInfo.email).toLowerCase());
          if (index === -1) {
            pwdError.textContent = "Không tìm thấy thông tin tài khoản để đổi mật khẩu.";
            return;
          }

          const user = users[index];
          const oldHash = await hashPassword(oldPwd);
          
          if (user.passwordHash !== oldHash && user.password !== oldPwd) {
            pwdError.textContent = "Mật khẩu cũ không chính xác.";
            return;
          }

          // Update password
          user.passwordHash = await hashPassword(newPwd);
          if (user.password) delete user.password;
          users[index] = user;
          
          localStorage.setItem("tmaTsaUsers", JSON.stringify(users));
          alert("Đổi mật khẩu thành công!");
          closePwdModalFunc();
        } catch (err) {
          pwdError.textContent = "Đã xảy ra lỗi khi đổi mật khẩu.";
          console.error(err);
        }
      });

      const shell = document.querySelector(".tsa-shell");
      const sidebarToggle = document.getElementById("sidebar-toggle");
      sidebarToggle.addEventListener("click", () => {
        const isCollapsed = shell.classList.toggle("sidebar-collapsed");
        sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
        sidebarToggle.setAttribute("aria-label", isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên");
      });

      const tsaContent = document.querySelector(".tsa-content");
      if (tsaContent) {
        tsaContent.addEventListener("click", () => {
          if (window.innerWidth <= 768 && shell.classList.contains("sidebar-collapsed")) {
            shell.classList.remove("sidebar-collapsed");
            if (sidebarToggle) {
              sidebarToggle.setAttribute("aria-expanded", "false");
              sidebarToggle.setAttribute("aria-label", "Mở rộng thanh bên");
            }
          }
        });
      }

      // Close sidebar drawer on mobile after clicking any menu link
      const menuLinks = document.querySelectorAll(".tsa-sidebar a, .tsa-sidebar button");
      menuLinks.forEach(link => {
        link.addEventListener("click", () => {
          if (link.classList.contains("group-header") || link.id === "sidebar-profile-button") return;
          if (window.innerWidth <= 768 && shell && shell.classList.contains("sidebar-collapsed")) {
            shell.classList.remove("sidebar-collapsed");
            if (sidebarToggle) {
              sidebarToggle.setAttribute("aria-expanded", "false");
              sidebarToggle.setAttribute("aria-label", "Mở rộng thanh bên");
            }
          }
        });
      });

      const logoutDialog = document.getElementById("logout-dialog");
      const logoutButton = document.getElementById("logout-button");
      const confirmLogoutButton = document.getElementById("confirm-logout");
      const closeLogoutButtons = document.querySelectorAll("[data-close-logout]");
      const accountLogoutBtn = document.getElementById("account-logout-btn");

      function openLogoutDialog() {
        logoutDialog.hidden = false;
        if (logoutButton) {
          logoutButton.setAttribute("aria-expanded", "true");
        }
        confirmLogoutButton.focus();
      }

      function closeLogoutDialog() {
        logoutDialog.hidden = true;
        if (logoutButton) {
          logoutButton.setAttribute("aria-expanded", "false");
          logoutButton.focus();
        }
      }

      if (logoutButton) {
        logoutButton.addEventListener("click", openLogoutDialog);
      }
      if (accountLogoutBtn) {
        accountLogoutBtn.addEventListener("click", openLogoutDialog);
      }
      closeLogoutButtons.forEach((button) => button.addEventListener("click", closeLogoutDialog));
      confirmLogoutButton.addEventListener("click", () => {
        localStorage.removeItem("studentInfo");
        window.location.href = "login.html";
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !logoutDialog.hidden) closeLogoutDialog();
      });

      // TAB LOGIC AND EXAM ROOM CATEGORIES STATE
      let currentExamCategory = "tsa"; // 'tsa', 'hsa', 'thpt'
      let currentSubtab = "my"; // 'my', 'all'
      let currentPracticeCategory = "tsa"; // 'tsa', 'hsa', 'thpt'
      let currentTsaPracticeSubtab = "tong-hop"; // 'tong-hop', 'don-mon'
      let currentExamTypeCategory = "tsa"; // 'tsa', 'hsa', 'thpt'
      let currentMaterialCategory = "tsa"; // 'tsa', 'hsa', 'thpt'

      const menuItems = document.querySelectorAll(".tsa-menu a[data-tab], a.sidebar-profile[data-tab]");
      const tabPanels = document.querySelectorAll(".tab-panel");
      const quickActionTargets = document.querySelectorAll("[data-target-tab]");

      function updateExamRoomUI() {
        const titleEl = document.getElementById("exam-room-title");
        const descEl = document.getElementById("exam-room-desc");
        const subtabBtns = document.querySelectorAll(".exam-subtab-btn");

        if (currentExamCategory === "tsa") {
          titleEl.textContent = "Đánh giá tư duy - TSA";
          descEl.textContent = "Các khóa học thuộc chương trình ôn luyện Đánh giá tư duy Bách Khoa Hà Nội.";
        } else if (currentExamCategory === "hsa") {
          titleEl.textContent = "Đánh giá năng lực - HSA";
          descEl.textContent = "Các khóa học thuộc chương trình ôn luyện Đánh giá năng lực Đại học Quốc gia Hà Nội.";
        } else if (currentExamCategory === "thpt") {
          titleEl.textContent = "Thi tốt nghiệp THPTQG";
          descEl.textContent = "Các khóa học thuộc chương trình ôn luyện thi tốt nghiệp THPT Quốc gia.";
        }

        subtabBtns.forEach(btn => {
          const sub = btn.getAttribute("data-subtab");
          if (sub === currentSubtab) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        renderExamRoomCourses();
      }

      window.EXAMS_LIST = [];
      let fetchError = false;

      // Ưu tiên đọc localStorage (chạy được file:///) — fallback sang fetch JSON tĩnh
      (function loadExamsList() {
        const now = Date.now();
        let shouldFetchIndex = true;
        // Always fetch the latest index from network to get real-time open/closed status from the teacher
        shouldFetchIndex = true;

        if (shouldFetchIndex) {
          // Tải danh sách đề từ Supabase Storage trước
          fetch(`${supabaseStorageUrl}index.json?t=${Date.now()}`)
            .then(res => {
              if (!res.ok) throw new Error("Failed to fetch from Supabase");
              return res.json();
            })
            .then(data => {
              window.EXAMS_LIST = data;
              try {
                localStorage.setItem('tma_tsa_exam_index', JSON.stringify(data));
                localStorage.setItem('tma_tsa_index_cache_time', now.toString());
              } catch (e) {}
              const activePanel = document.querySelector(".tab-panel.active");
              if (activePanel) {
                if (activePanel.id === "tab-practice") {
                  renderPracticeRoom();
                } else if (activePanel.id === "tab-tsa-exam") {
                  renderExams();
                }
              }
            })
            .catch(err => {
              console.warn("Không tải được danh sách đề từ Supabase Storage, thử tải offline/local...");
              fetch("data/exams/index.json")
                .then(res => {
                  if (!res.ok) throw new Error("Failed to fetch local index");
                  return res.json();
                })
                .then(data => {
                  window.EXAMS_LIST = data;
                  try {
                    localStorage.setItem('tma_tsa_exam_index', JSON.stringify(data));
                    localStorage.setItem('tma_tsa_index_cache_time', now.toString());
                  } catch (e) {}
                  const activePanel = document.querySelector(".tab-panel.active");
                  if (activePanel && activePanel.id === "tab-practice") {
                    renderPracticeRoom();
                  }
                })
                .catch(localErr => {
                  console.error("Error loading exams index:", localErr);
                  fetchError = window.EXAMS_LIST.length === 0;
                  const activePanel = document.querySelector(".tab-panel.active");
                  if (activePanel && activePanel.id === "tab-practice") {
                    renderPracticeRoom();
                  }
                });
            });
        }

        let shouldFetchLinks = true;
        try {
          const linksCacheTime = localStorage.getItem('tma_tsa_links_cache_time');
          const linksData = localStorage.getItem('tmaTsaDriveLinks');
          if (linksData && linksCacheTime && (now - parseInt(linksCacheTime)) < 1800000) {
            shouldFetchLinks = false;
            if (typeof window.syncLibraryDocs === "function") {
              window.syncLibraryDocs();
            }
            const activePanel = document.querySelector(".tab-panel.active");
            if (activePanel && activePanel.id === "tab-documents") {
              if (typeof window.renderLibraryDocs === "function") {
                window.renderLibraryDocs();
              }
            }
          }
        } catch (e) {}

        if (shouldFetchLinks) {
          if (typeof window.fetchLibraryDocsFromCloud === "function") {
            window.fetchLibraryDocsFromCloud(false);
          }
        }
      })();

      function renderPracticeRoom() {
        const grid = document.getElementById("practice-grid-dynamic");
        if (!grid) return;
        grid.innerHTML = "";

        const category = currentPracticeCategory.toUpperCase(); // 'TSA', 'HSA', 'THPT', 'VACT', 'QDA'
        const subtabsContainer = document.getElementById("practice-subtabs-container");

        if (category === "TSA") {
          // Show TSA Subtabs Segment Controller (4 tabs: Đề tổng hợp, Tư duy Toán học, Tư duy Đọc hiểu, Tư duy Khoa học)
          if (subtabsContainer) {
            subtabsContainer.style.display = "flex";
            subtabsContainer.innerHTML = `
              <div class="practice-tabs-container">
                <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'tong-hop' ? 'active' : ''}" data-subtab="tong-hop">
                  <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  Đề tổng hợp
                </button>
                <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'math' ? 'active' : ''}" data-subtab="math">
                  <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                    <line x1="16" y1="14" x2="16" y2="18"></line>
                    <line x1="12" y1="10" x2="12" y2="10"></line>
                    <line x1="8" y1="10" x2="8" y2="10"></line>
                    <line x1="12" y1="14" x2="12" y2="14"></line>
                    <line x1="8" y1="14" x2="8" y2="14"></line>
                    <line x1="12" y1="18" x2="12" y2="18"></line>
                    <line x1="8" y1="18" x2="8" y2="18"></line>
                  </svg>
                  Tư duy Toán học
                </button>
                <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'reading' ? 'active' : ''}" data-subtab="reading">
                  <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  Tư duy Đọc hiểu
                </button>
                <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'science' ? 'active' : ''}" data-subtab="science">
                  <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 2v8L4.36 20.62A1 1 0 0 0 5.25 22h13.5a1 1 0 0 0 .89-1.38L14 10V2z"></path>
                    <path d="M6 18h12"></path>
                    <line x1="10" y1="2" x2="14" y2="2"></line>
                  </svg>
                  Tư duy Khoa học
                </button>
              </div>
            `;
            // Attach click listeners
            subtabsContainer.querySelectorAll(".tsa-practice-subtab-btn").forEach((btn) => {
              btn.addEventListener("click", () => {
                currentTsaPracticeSubtab = btn.getAttribute("data-subtab");
                renderPracticeRoom();
              });
            });
          }

           // Generate dynamic count of exams for selected TSA subtab
           let maxPracticeIndex = 10;
           try {
             const lsData = localStorage.getItem('tma_tsa_exam_index');
             if (lsData) {
               const parsed = JSON.parse(lsData);
               if (Array.isArray(parsed)) {
                 parsed.forEach(e => {
                   if (e.exam_code && e.exam_code.startsWith("TSA_PRACTICE_FULL_")) {
                     const parts = e.exam_code.split("_");
                     const num = parseInt(parts[parts.length - 1], 10);
                     if (num > maxPracticeIndex) maxPracticeIndex = num;
                   }
                 });
               }
             }
           } catch(e) {}

          for (let i = 1; i <= maxPracticeIndex; i++) {
            const numStr3 = String(i).padStart(3, "0");
            const numStr2 = String(i).padStart(2, "0");
            const numStr = numStr2;
            let examCodeToCheck = "TSA" + numStr3;
             if (category === "TSA") {
               const hasTma = (window.EXAMS_LIST || []).some(e => e.exam_code === "TMA" + numStr3);
               examCodeToCheck = hasTma ? ("TMA" + numStr3) : ("TSA_PRACTICE_FULL_" + numStr2);
             }
            let openStatus = {};
            try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

            const hasExamInList = (window.EXAMS_LIST || []).some(e => e.exam_code === examCodeToCheck);
            const hasLocalDraft = localStorage.getItem("tma_tsa_exam_" + examCodeToCheck) || localStorage.getItem("tma_tsa_teacher_draft_" + examCodeToCheck);
            const isUploaded = (i === 1) || hasExamInList || hasLocalDraft;

            let examTitle = "";
            let subjectText = "";
            let redirectUrl = "";
            let duration = (function() {
              if (currentTsaPracticeSubtab === "math") return "60 phút";
              if (currentTsaPracticeSubtab === "reading") return "30 phút";
              if (currentTsaPracticeSubtab === "science" || currentTsaPracticeSubtab === "don-mon") return "60 phút";
              if (currentTsaPracticeSubtab === "tong-hop") return "140 phút";
              return "45 phút";
            })();
            let qCount = (function() {
              if (currentTsaPracticeSubtab === "math") return "40 câu";
              if (currentTsaPracticeSubtab === "reading") return "20 câu";
              if (currentTsaPracticeSubtab === "science") return "40 câu";
              if (currentTsaPracticeSubtab === "tong-hop") return "100 câu";
              return "40 câu";
            })();

            const matchingExam = (window.EXAMS_LIST || []).find(e => e.exam_code === examCodeToCheck);
            if (matchingExam) {
              if (matchingExam.duration_minutes) duration = matchingExam.duration_minutes + " phút";
              if (matchingExam.question_count) qCount = matchingExam.question_count + " câu";
            }

            if (hasLocalDraft) {
              try {
                const parsed = JSON.parse(hasLocalDraft);
                if (parsed.duration_minutes) duration = parsed.duration_minutes + " phút";
                if (parsed.sections) {
                  const sect = parsed.sections.find(s => s.section_id === currentTsaPracticeSubtab);
                  if (sect && sect.questions) qCount = sect.questions.length + " câu";
                } else if (parsed.questions) {
                  qCount = parsed.questions.length + " câu";
                }
              } catch (e) {}
            }

            const isOpen = (matchingExam && matchingExam.is_open !== false && openStatus[examCodeToCheck] !== false) || (!matchingExam && openStatus[examCodeToCheck] !== false);

            if (currentTsaPracticeSubtab === "tong-hop") {
              examTitle = `Đề tổng hợp số ${numStr}`;
              subjectText = "Toán học, Đọc hiểu, Khoa học";
              redirectUrl = "waiting.html?exam=" + examCodeToCheck;
            } else if (currentTsaPracticeSubtab === "math") {
              examTitle = `Đề TSA số ${numStr} - Tư duy Toán học`;
              subjectText = "Tư duy Toán học";
              redirectUrl = `confirm.html?exam=${examCodeToCheck}&subject=math&single=true`;
            } else if (currentTsaPracticeSubtab === "reading") {
              examTitle = `Đề TSA số ${numStr} - Đọc hiểu`;
              subjectText = "Đọc hiểu";
              redirectUrl = `confirm.html?exam=${examCodeToCheck}&subject=reading&single=true`;
            } else if (currentTsaPracticeSubtab === "science" || currentTsaPracticeSubtab === "don-mon") {
              // fallback or science
              examTitle = `Đề TSA số ${numStr} - Khoa học`;
              subjectText = "Khoa học";
              redirectUrl = `confirm.html?exam=${examCodeToCheck}&subject=science&single=true`;
            }

            const card = document.createElement("div");
            card.className = "exam-card";

            const hasCompleted = completedExams.has(examCodeToCheck);
            const xemKetQuaHtml = hasCompleted 
              ? `<a href="#" onclick="window.showHustResultModal('${examCodeToCheck}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>`
              : `<span></span>`;

            let actionBtnHtml = "";
            if (isUploaded && isOpen) {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  ${xemKetQuaHtml}
                  <button class="btn btn-sm" style="background: #22c55e; border-color: #22c55e; color: #ffffff; font-weight: 600; padding: 6px 16px; border-radius: 8px; border: 1px solid #22c55e; cursor: pointer; transition: background 0.15s;" onclick="window.startExamDirectly(\`${examTitle}\`, '${redirectUrl}')">Bắt đầu</button>
                </footer>
              `;
            } else {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  ${xemKetQuaHtml}
                  <button class="btn btn-sm" style="background: #e2e8f0; border-color: #e2e8f0; color: #94a3b8; font-weight: 800; padding: 6px 16px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: not-allowed;" disabled>Bắt đầu</button>
                </footer>
              `;
            }

            card.innerHTML = `
              <header class="exam-card-header">
                <h3 style="text-transform: none;">${examTitle}</h3>
              </header>
              <div class="exam-card-body">
                <div class="exam-info-row">
                  <span class="info-label">Hình thức thi:</span>
                  <span class="badge-green">Thi trực tuyến</span>
                </div>
                <div class="exam-info-row">
                  <span class="info-label">Thời gian đăng ký:</span>
                  <span class="info-value">Hằng ngày</span>
                </div>
                <div class="exam-info-row">
                  <span class="info-label">Lệ phí:</span>
                  <span class="info-value font-bold">Miễn phí</span>
                </div>
                <div class="exam-info-row">
                  <span class="info-label">Thời gian thi:</span>
                  <span class="info-value">Hằng ngày</span>
                </div>
              </div>
              ${actionBtnHtml}
            `;
            grid.appendChild(card);
          }
          return;
        }

        // Hide TSA Subtabs Segment Controller for other categories
        if (subtabsContainer) {
          subtabsContainer.style.display = "none";
        }

        // Generate only uploaded practice exams for other categories, or show empty state
        const displayCategory = category === "THPT" ? "THPTQG" : category;
        const uploadedExams = [];
        
        for (let i = 1; i <= 10; i++) {
          const numStr = String(i).padStart(2, "0");
          const examCodeToCheck = category + numStr;
          const hasExamInList = (window.EXAMS_LIST || []).some(e => e.exam_code === examCodeToCheck);
          const hasLocalDraft = localStorage.getItem("tma_tsa_exam_" + examCodeToCheck) || localStorage.getItem("tma_tsa_teacher_draft_" + examCodeToCheck);
          const isUploaded = hasExamInList || hasLocalDraft;
          
          if (isUploaded) {
            uploadedExams.push({
              index: i,
              code: examCodeToCheck,
              title: `Đề ${displayCategory} số ${numStr}`
            });
          }
        }

        if (uploadedExams.length === 0) {
          const emptyState = document.createElement("div");
          emptyState.style.cssText = "grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 55vh; text-align: center; width: 100%; box-sizing: border-box;";
          emptyState.innerHTML = `
            <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Chưa cập nhật đề" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
            <div style="font-size: 15px; font-weight: 600; color: #64748b;">Giáo viên chưa cập nhật đề</div>
          `;
          grid.appendChild(emptyState);
          return;
        }

        uploadedExams.forEach((exam) => {
          const examCodeToCheck = exam.code;
          const examTitle = exam.title;

          const card = document.createElement("div");
          card.className = "exam-card";

          const hasCompleted = completedExams.has(examCodeToCheck);
          const xemKetQuaHtml = hasCompleted 
            ? `<a href="#" onclick="window.showHustResultModal('${examCodeToCheck}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>`
            : `<span></span>`;

          actionBtnHtml = `
            <footer class="exam-card-footer">
              ${xemKetQuaHtml}
              <button class="btn btn-sm" style="background: #22c55e; border-color: #22c55e; color: #ffffff; font-weight: 600; padding: 6px 16px; border-radius: 8px; border: 1px solid #22c55e; cursor: pointer; transition: background 0.15s;" onclick="window.startExamDirectly(\`${examTitle}\`, '${redirectUrl}')">Bắt đầu</button>
            </footer>
          `;

          card.innerHTML = `
            <header class="exam-card-header">
              <h3 style="text-transform: none;">${examTitle}</h3>
            </header>
            <div class="exam-card-body">
              <div class="exam-info-row">
                <span class="info-label">Hình thức thi:</span>
                <span class="badge-green">Thi trực tuyến</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Thời gian đăng ký:</span>
                <span class="info-value">Hằng ngày</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Lệ phí:</span>
                <span class="info-value font-bold">Miễn phí</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Thời gian thi:</span>
                <span class="info-value">Hằng ngày</span>
              </div>
            </div>
            ${actionBtnHtml}
          `;
          grid.appendChild(card);
        });
      }

            function updatePracticeRoomUI() {
        const titleEl = document.getElementById("practice-title");
        const descEl = document.getElementById("practice-desc");
        
        if (currentPracticeCategory === "tsa") {
          titleEl.textContent = "Phòng luyện đề: Đánh giá tư duy - TSA";
          descEl.textContent = "Khám phá các chế độ rèn luyện cấu trúc đề thi TSA Bách Khoa để khắc phục điểm yếu kiến thức.";
        } else if (currentPracticeCategory === "hsa") {
          titleEl.textContent = "Phòng luyện đề: Đánh giá năng lực - HSA";
          descEl.textContent = "Khám phá các chế độ rèn luyện cấu trúc đề thi HSA ĐHQGHN để khắc phục điểm yếu kiến thức.";
        } else if (currentPracticeCategory === "thpt") {
          titleEl.textContent = "Phòng luyện đề: Thi tốt nghiệp THPTQG";
          descEl.textContent = "Khám phá các chế độ rèn luyện cấu trúc đề thi tốt nghiệp THPTQG để khắc phục điểm yếu kiến thức.";
        } else if (currentPracticeCategory === "vact") {
          titleEl.textContent = "Phòng luyện đề: Đánh giá năng lực - VACT";
          descEl.textContent = "Khám phá các chế độ rèn luyện cấu trúc đề thi VACT ĐHQG TP.HCM để khắc phục điểm yếu kiến thức.";
        } else if (currentPracticeCategory === "qda") {
          titleEl.textContent = "Phòng luyện đề: Đánh giá năng lực - QDA";
          descEl.textContent = "Khám phá các chế độ rèn luyện cấu trúc đề thi QDA Bộ Quốc phòng để khắc phục điểm yếu kiến thức.";
        }

        renderPracticeRoom();
      }

      function renderExams() {
        const grid = document.getElementById("exams-list-grid");
        const titleEl = document.getElementById("exam-tab-title");
        const descEl = document.getElementById("exam-tab-desc");
        if (!grid) return;
        grid.innerHTML = "";

        // ── TSA: hiển thị 10 đề thi thử riêng biệt với key TSA_EXAM_XX ──
        if (currentExamTypeCategory === "tsa") {
          if (titleEl) titleEl.textContent = "Bài thi Đánh giá tư duy - TSA";
          if (descEl) descEl.textContent = "Các kỳ thi thử TSA được tổ chức theo cấu trúc Đại học Bách Khoa Hà Nội.";

          // Đọc trạng thái mở/đóng đề từ localStorage (do giáo viên điều khiển)
          let openStatus = {};
          try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

          for (let i = 1; i <= 1; i++) {
            const numStr = String(i).padStart(2, "0");
            const examCode = "TSA_EXAM_" + numStr;
            const examTitle = "Đề thi thử TSA";

            // Chỉ bật nếu đề có trong EXAMS_LIST VÀ giáo viên đã Mở đề
            const inList = (window.EXAMS_LIST || []).find(e => e.exam_code === examCode);
            const isOpen = inList && (inList.is_open === true || openStatus[examCode] === true);

            const redirectUrl = `waiting.html?exam=${examCode}`;

            const card = document.createElement("div");
            card.className = "exam-card";

            const hasCompleted = completedExams.has(examCode);
            const xemKetQuaHtml = hasCompleted 
              ? `<a href="#" onclick="window.showHustResultModal('${examCode}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>`
              : `<span></span>`;

            let actionBtnHtml = "";
            if (isOpen) {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  ${xemKetQuaHtml}
                  <button class="btn btn-sm" style="background:#22c55e;border-color:#22c55e;color:#fff;font-weight:600;padding:6px 16px;border-radius:8px;cursor:pointer;" onclick="window.startExamDirectly(\`${examTitle}\`, '${redirectUrl}')">Bắt đầu</button>
                </footer>
              `;
            } else {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  ${xemKetQuaHtml}
                  <button class="btn btn-sm" style="background:#e2e8f0;border-color:#e2e8f0;color:#94a3b8;font-weight:800;padding:6px 16px;border-radius:8px;cursor:not-allowed;" disabled>Chưa mở đề</button>
                </footer>
              `;
            }

            card.innerHTML = `
              <header class="exam-card-header">
                <h3 style="text-transform:none;">${examTitle}</h3>
              </header>
              <div class="exam-card-body">
                <div class="exam-info-row">
                  <span class="info-label">Hình thức thi:</span>
                  <span class="badge-green">Thi trực tuyến</span>
                </div>
                <div class="exam-info-row">
                  <span class="info-label">Thời gian thi:</span>
                  <span class="info-value">${inList && inList.duration_minutes ? inList.duration_minutes + " phút" : "150 phút"}</span>
                </div>
                <div class="exam-info-row">
                  <span class="info-label">Lệ phí:</span>
                  <span class="info-value font-bold">Miễn phí</span>
                </div>
                <div class="exam-info-row">
                  <span class="info-label">Trạng thái:</span>
                  <span class="${isOpen ? 'badge-green' : ''}" style="${!isOpen ? 'color:#94a3b8;font-size:12px;font-weight:600;' : ''}">${isOpen ? "Đang mở" : "Chưa mở"}</span>
                </div>
              </div>
              ${actionBtnHtml}
            `;
            grid.appendChild(card);
          }
          return;
        }

        if (titleEl) {
          titleEl.textContent = {
            hsa: "Bài thi Đánh giá năng lực - HSA",
            thpt: "Thi tốt nghiệp THPTQG",
            vact: "Bài thi Đánh giá năng lực - VACT",
            qda: "Bài thi Đánh giá năng lực - QDA"
          }[currentExamTypeCategory] || "Thi thử";
        }

          

        const categoryPrefix = currentExamTypeCategory.toUpperCase(); // "HSA", "THPT", "VACT", "QDA"
        const filtered = (window.EXAMS_LIST || []).filter(e => {
          return e.exam_code && e.exam_code.toUpperCase().startsWith(categoryPrefix);
        });

        if (filtered.length === 0) {
          const emptyState = document.createElement("div");
          emptyState.style.cssText = "grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 55vh; text-align: center; width: 100%; box-sizing: border-box;";
          emptyState.innerHTML = `
            <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Chưa cập nhật đề" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
            <div style="font-size: 15px; font-weight: 600; color: #64748b;">Giáo viên chưa cập nhật đề</div>
          `;
          grid.appendChild(emptyState);
          return;
        }

        filtered.forEach(exam => {
          const card = document.createElement("div");
          card.className = "exam-card";
          
          let isOpen = exam.is_open === true;
          let redirectUrl = "waiting.html?exam=" + exam.exam_code;
          let actionBtnHtml = "";
          
          const hasCompleted = completedExams.has(exam.exam_code);
          const xemKetQuaHtml = hasCompleted 
            ? `<a href="#" onclick="window.showHustResultModal('${exam.exam_code}', \`${exam.title}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>`
            : `<span></span>`;

          if (isOpen) {
            actionBtnHtml = `
              <footer class="exam-card-footer">
                ${xemKetQuaHtml}
                <button class="btn btn-sm" style="background:#22c55e;border-color:#22c55e;color:#fff;font-weight:600;padding:6px 16px;border-radius:8px;cursor:pointer;" onclick="window.startExamDirectly(\`${exam.title}\`, '${redirectUrl}')">Bắt đầu</button>
              </footer>
            `;
          } else {
            actionBtnHtml = `
              <footer class="exam-card-footer">
                ${xemKetQuaHtml}
                <button class="btn btn-sm" style="background:#e2e8f0;border-color:#e2e8f0;color:#94a3b8;font-weight:800;padding:6px 16px;border-radius:8px;cursor:not-allowed;" disabled>Chưa mở đề</button>
              </footer>
            `;
          }

          card.innerHTML = `
            <header class="exam-card-header"><h3 style="text-transform: none;">${exam.title}</h3></header>
            <div class="exam-card-body">
              <div class="exam-info-row"><span class="info-label">Hình thức thi:</span><span class="badge-green">Thi trực tuyến</span></div>
              <div class="exam-info-row"><span class="info-label">Thời gian thi:</span><span class="info-value">${exam.duration_minutes ? exam.duration_minutes + " phút" : "150 phút"}</span></div>
              <div class="exam-info-row"><span class="info-label">Lệ phí:</span><span class="info-value font-bold">Miễn phí</span></div>
              <div class="exam-info-row"><span class="info-label">Trạng thái:</span><span class="${isOpen ? 'badge-green' : ''}" style="${!isOpen ? 'color:#94a3b8;font-size:12px;font-weight:600;' : ''}">${isOpen ? "Đang mở" : "Chưa mở"}</span></div>
            </div>
            ${actionBtnHtml}
          `;
          grid.appendChild(card);
        });
      }



      // LIBRARY DOCUMENTS INTEGRATION
            window.LIBRARY_DOCS = [
        {
          id: "doc_1783876292129_0",
          title: "Đề TSA số 01",
          category: "ĐGTD",
          subject: "TOÁN",
          views: 3019,
          date: "08/06/2026",
          url: "https://drive.google.com/file/d/1gLhPWAMtPfFkMat893qt57RbaO3F-itd/view?usp=sharing"
        },
        {
          id: "doc_1783876292129_1",
          title: "Đề TSA số 02",
          category: "ĐGTD",
          subject: "TOÁN",
          views: 2831,
          date: "04/06/2026",
          url: "https://drive.google.com/file/d/14-g9kSExZRVrobvTbuKLNXpjzxAcvpWQ/view?usp=sharing"
        },
        {
          id: "doc_1783876292129_2",
          title: "Đề TSA số 03",
          category: "ĐGTD",
          subject: "TOÁN",
          views: 2078,
          date: "04/06/2026",
          url: "https://drive.google.com/file/d/14-g9kSExZRVrobvTbuKLNXpjzxAcvpWQ/view?usp=sharing"
        },
        {
          id: "doc_1783876292129_3",
          title: "Đề TSA số 04",
          category: "ĐGTD",
          subject: "TOÁN",
          views: 1273,
          date: "04/06/2026",
          url: "https://drive.google.com/file/d/14-g9kSExZRVrobvTbuKLNXpjzxAcvpWQ/view?usp=sharing"
        },
        {
          id: "doc_1783876292129_4",
          title: "Đề TSA số 05",
          category: "ĐGTD",
          subject: "TOÁN",
          views: 2380,
          date: "02/06/2026",
          url: "https://drive.google.com/file/d/14-g9kSExZRVrobvTbuKLNXpjzxAcvpWQ/view?usp=sharing"
        },
        {
          id: "doc_1783876292129_5",
          title: "Đề TSA số 06",
          category: "ĐGTD",
          subject: "TOÁN",
          views: 1574,
          date: "02/06/2026",
          url: "https://drive.google.com/file/d/14-g9kSExZRVrobvTbuKLNXpjzxAcvpWQ/view?usp=sharing"
        },
        {
          id: "doc_1783876292129_6",
          title: "Đề HSA số 01",
          category: "ĐGNL",
          subject: "TOÁN",
          views: 4510,
          date: "25/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_7",
          title: "Đề HSA số 02",
          category: "ĐGNL",
          subject: "TOÁN",
          views: 3120,
          date: "22/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_8",
          title: "Đề HSA số 03",
          category: "ĐGNL",
          subject: "TOÁN",
          views: 5890,
          date: "18/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_9",
          title: "Đề HSA số 04",
          category: "ĐGNL",
          subject: "TOÁN",
          views: 1890,
          date: "15/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_10",
          title: "Đề THPTQG số 01",
          category: "LỚP 12",
          subject: "TOÁN",
          views: 2901,
          date: "10/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_11",
          title: "Đề THPTQG số 02",
          category: "LỚP 12",
          subject: "TOÁN",
          views: 3201,
          date: "05/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_12",
          title: "Đề THPTQG số 03",
          category: "LỚP 12",
          subject: "TOÁN",
          views: 1540,
          date: "01/05/2026",
          url: ""
        },
        {
          id: "doc_1783876292129_13",
          title: "Đề THPTQG số 04",
          category: "LỚP 12",
          subject: "TOÁN",
          views: 2310,
          date: "28/04/2026",
          url: ""
        }
      ];

      

            window.LIBRARY_FOLDERS = [
        {
          title: "Đánh giá tư duy - ĐGTD",
          subtext: "6 tài liệu",
          classTag: "ĐGTD"
        },
        {
          title: "Đánh giá năng lực - ĐGNL",
          subtext: "4 tài liệu",
          classTag: "ĐGNL"
        },
        {
          title: "Thi thử tốt nghiệp THPT - Lớp 12",
          subtext: "4 tài liệu",
          classTag: "Lớp 12"
        }
      ];

      

      window.activeLibraryCategory = "ALL";
      window.activeLibrarySubject = "ALL";

      window.renderLibrarySubTabs = function() {
        const tabsContainer = document.querySelector(".library-subject-tabs");
        if (!tabsContainer) return;
        tabsContainer.innerHTML = "";

        const category = cleanCatStr(window.activeLibraryCategory);
        
        let tabs = [];
        if (category === "ĐGTD" || category === "DGTD") {
          tabs = [
            { key: "ALL", label: "Tất cả" },
            { key: "TDTAN", label: "Tư duy toán học" },
            { key: "TDDH", label: "Tư duy đọc hiểu" },
            { key: "TDKH", label: "Tư duy khoa học" }
          ];
        } else if (category === "ĐGNL" || category === "DGNL") {
          tabs = [
            { key: "ALL", label: "Tất cả" },
            { key: "DINH_TINH", label: "Định tính" },
            { key: "DINH_LUONG", label: "Định lượng" },
            { key: "KHOA_HOC", label: "Khoa học" },
            { key: "TIENG_ANH", label: "Tiếng Anh" }
          ];
        } else {
          tabs = [
            { key: "ALL", label: "Tất cả" },
            { key: "TOÁN", label: "Toán" },
            { key: "LÝ", label: "Lý" },
            { key: "SINH", label: "Sinh" },
            { key: "ANH", label: "Anh" },
            { key: "HOÁ", label: "Hoá" },
            { key: "VĂN", label: "Văn" }
          ];
        }

        const validKeys = tabs.map(t => t.key);
        if (!validKeys.includes(window.activeLibrarySubject)) {
          window.activeLibrarySubject = "ALL";
        }

        tabs.forEach(tab => {
          const btn = document.createElement("button");
          btn.className = `lib-sub-tab${window.activeLibrarySubject === tab.key ? " active" : ""}`;
          btn.setAttribute("data-subject", tab.key);
          btn.onclick = () => window.filterLibrarySubject(tab.key);
          btn.textContent = tab.label;
          tabsContainer.appendChild(btn);
        });
      };

      window.filterLibraryCategory = function(cat) {
        const normCat = cleanCatStr(cat);
        const activeNorm = cleanCatStr(window.activeLibraryCategory);
        if (activeNorm === normCat) {
          window.activeLibraryCategory = "ALL";
        } else {
          window.activeLibraryCategory = cat;
        }
        document.querySelectorAll(".lib-pill-btn").forEach(btn => {
          const btnCat = cleanCatStr(btn.getAttribute("data-category"));
          const currentActiveCat = cleanCatStr(window.activeLibraryCategory);
          if (btnCat === currentActiveCat) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });
        window.renderLibrarySubTabs();
        window.renderLibraryDocs();
      };

      window.filterLibrarySubject = function(sub) {
        window.activeLibrarySubject = sub;
        document.querySelectorAll(".lib-sub-tab").forEach(tab => {
          if (tab.getAttribute("data-subject") === sub) {
            tab.classList.add("active");
          } else {
            tab.classList.remove("active");
          }
        });
        window.renderLibraryDocs();
      };

      window.onLibrarySearchInput = function() {
        window.renderLibraryDocs();
      };

      window.renderLibraryDocs = function() {
        const grid = document.getElementById("library-docs-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const searchInput = document.getElementById("lib-search-input");
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

        function removeAccents(str) {
          return String(str || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
            .toLowerCase();
        }

        const filtered = window.LIBRARY_DOCS.filter(doc => {
          // 1. Category check
          const activeCat = cleanCatStr(window.activeLibraryCategory);
          const docCat = cleanCatStr(doc.category);
          if (activeCat !== "ALL" && docCat !== activeCat) {
            return false;
          }
          
          // 2. Subject check with smart mappings for ĐGTD & ĐGNL sub-tabs
          if (window.activeLibrarySubject !== "ALL") {
            const cat = cleanCatStr(window.activeLibraryCategory);
            const sub = window.activeLibrarySubject;
            const docSub = cleanCatStr(doc.subject);
            
            if (cat === "ĐGTD" || cat === "DGTD") {
              if (sub === "TDTAN") {
                if (docSub !== "TOÁN" && !doc.title.toLowerCase().includes("toán")) return false;
              } else if (sub === "TDDH") {
                if (docSub !== "VĂN" && !doc.title.toLowerCase().includes("đọc hiểu") && !doc.title.toLowerCase().includes("văn")) return false;
              } else if (sub === "TDKH") {
                if (!["LÝ", "HOÁ", "SINH"].includes(docSub) && !doc.title.toLowerCase().includes("khoa học")) return false;
              } else {
                if (docSub !== cleanCatStr(sub)) return false;
              }
            } else if (cat === "ĐGNL" || cat === "DGNL") {
              if (sub === "DINH_TINH") {
                if (docSub !== "VĂN" && !doc.title.toLowerCase().includes("định tính") && !doc.title.toLowerCase().includes("văn")) return false;
              } else if (sub === "DINH_LUONG") {
                if (docSub !== "TOÁN" && !doc.title.toLowerCase().includes("định lượng") && !doc.title.toLowerCase().includes("toán")) return false;
              } else if (sub === "KHOA_HOC") {
                if (!["LÝ", "HOÁ", "SINH"].includes(docSub) && !doc.title.toLowerCase().includes("khoa học")) return false;
              } else if (sub === "TIENG_ANH") {                if (docSub !== "ANH" && !doc.title.toLowerCase().includes("tiếng anh") && !doc.title.toLowerCase().includes("anh")) return false;
              } else {
                if (docSub !== cleanCatStr(sub)) return false;
              }
            } else {
              // Default class subjects check
              if (docSub !== cleanCatStr(sub)) return false;
            }
          }

          // 3. Search keyword check
          if (keyword) {
            const cleanTitle = removeAccents(doc.title);
            const cleanKeyword = removeAccents(keyword);
            if (!cleanTitle.includes(cleanKeyword)) return false;
          }
          return true;
        });

        if (filtered.length === 0) {
          grid.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 55vh; text-align: center; width: 100%; box-sizing: border-box;">
              <img src="https://assets.tmastudy.io.vn/assets/core.png" alt="Chưa có tài liệu" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto 16px; opacity: 0.95;" />
              <div style="font-size: 15px; font-weight: 600; color: #64748b;">Không tìm thấy tài liệu nào khớp với bộ lọc</div>
            </div>
          `;
          return;
        }

        filtered.forEach(doc => {
                    const card = document.createElement("a");
          card.className = "lib-doc-card";
          card.href = "#";
          card.onclick = function(e) {
            e.preventDefault();
            if (!doc.url) {
              alert("Giáo viên đang tải tài liệu này lên Drive, vui lòng quay lại sau!");
            } else {
              window.openLibraryDetailView(doc);
            }
          };

          card.innerHTML = `
            <div class="lib-doc-pdf-icon">
              <svg viewBox="0 0 16 16" fill="#c0392b" class="pdf-logo-svg">
                <path d="M4.603 12.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.187-.012.395-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.065.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.6 11.6 0 0 0-1.997.406 11.3 11.3 0 0 1-1.021 1.51c-.29.35-.608.655-.926.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.244.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 5.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z"/>
              </svg>
              <span>PDF</span>
            </div>
                        <div class="lib-doc-info">
              <h3 class="lib-doc-title">${doc.title}</h3>
              <div class="lib-doc-tags">
                <span class="lib-doc-tag subject">${doc.subject}</span>
                <span class="lib-doc-tag class">${doc.category}</span>
              </div>
              <div class="lib-doc-meta">
                <div class="lib-doc-meta-item">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span>${doc.views}</span>
                </div>
                <div class="lib-doc-meta-item">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>${doc.date}</span>
                </div>
              </div>
            </div>
          `;
          grid.appendChild(card);
        });
      };

      window.renderLibraryFolders = function() {
        const list = document.getElementById("library-folders-list");
        if (!list) return;
        list.innerHTML = "";

        window.LIBRARY_FOLDERS.forEach(folder => {
          const item = document.createElement("div");
          item.className = "lib-folder-item";

          item.onclick = function() {
            const cat = folder.classTag.toUpperCase();
            window.filterLibraryCategory(cat);
          };

          item.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; width: 76px;">
              <!-- Beautiful custom Folder + PDF sheet SVG -->
              <svg viewBox="0 0 64 48" width="64" height="48" style="flex-shrink: 0;">
              <!-- Folder Back -->
              <path d="M4 8a2 2 0 0 1 2-2h12l4 6h36a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" fill="#60a5fa"/>
              <!-- Paper Sheet 1 (Back) -->
              <path d="M26 8 h11.5 Q 38.5 8 39.2 8.7 L 43.3 12.8 Q 44 13.5 44 14.5 v17.5 H26 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
              <!-- Corner fold for Sheet 1 -->
              <path d="M38 8 L 38 12.5 Q 38 14 39.5 14 L 44 14 Z" fill="#cbd5e1"/>
              <!-- Lines on Sheet 1 -->
              <rect x="29" y="15" width="10" height="1.5" rx="0.75" fill="#cbd5e1"/>
              <rect x="29" y="19" width="10" height="1.5" rx="0.75" fill="#cbd5e1"/>
              <rect x="29" y="23" width="7" height="1.5" rx="0.75" fill="#cbd5e1"/>
              <!-- Paper Sheet 2 (Front) -->
              <path d="M16 12 h11.5 Q 28.5 12 29.2 12.7 L 33.3 16.8 Q 34 17.5 34 18.5 v17.5 H16 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
              <!-- Corner fold for Sheet 2 -->
              <path d="M28 12 L 28 16.5 Q 28 18 29.5 18 L 34 18 Z" fill="#cbd5e1"/>
              <!-- Red Acrobat loop on Sheet 2 -->
              <g transform="translate(19, 19) scale(0.9)">
                <path d="M4.603 12.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.187-.012.395-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.065.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.6 11.6 0 0 0-1.997.406 11.3 11.3 0 0 1-1.021 1.51c-.29.35-.608.655-.926.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.244.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 5.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z" fill="#ef4444"/>
              </g>
              <!-- Folder Front -->
              <path d="M4 14a2 2 0 0 1 2-2h52a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V14z" fill="#2563eb"/>
            </svg>
              <span class="lib-folder-badge">${folder.classTag}</span>
            </div>
            <div class="lib-folder-info">
              <h5 class="lib-folder-title">${folder.title}</h5>
              <p class="lib-folder-subtext">
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span style="vertical-align: middle; margin-left: 2px;">${folder.subtext}</span>
              </p>
            </div>
          `;

          list.appendChild(item);
        });
      };

      function updateDocumentsUI() {
        window.activeLibraryCategory = "ALL";
        window.activeLibrarySubject = "ALL";
        if (typeof window.fetchLibraryDocsFromCloud === "function") {
          window.fetchLibraryDocsFromCloud(true);
        }
        
        const searchInput = document.getElementById("lib-search-input");
        if (searchInput) searchInput.value = "";

        document.querySelectorAll(".lib-pill-btn").forEach(btn => {
          if (btn.getAttribute("data-category") === "ALL") btn.classList.add("active");
          else btn.classList.remove("active");
        });

        window.renderLibrarySubTabs();

        window.renderLibraryDocs();
        window.renderLibraryFolders();
      }

      window.switchTab = switchTab;
      function switchTab(tabId) {
        if (typeof window.closeLibraryDetailView === "function") {
          window.closeLibraryDetailView();
        }
        // Normalize legacy documents tab IDs
        if (["tsa-documents", "hsa-documents", "thpt-documents"].includes(tabId)) {
          tabId = "documents";
        }

        // Toggle full screen sidebar hidden mode for documents, history, and account tabs
        const shellContainer = document.querySelector(".tsa-shell");
        if (shellContainer) {
          if (["documents", "history", "account"].includes(tabId)) {
            shellContainer.classList.add("hide-sidebar");
          } else {
            shellContainer.classList.remove("hide-sidebar");
          }
        }

        // Normalize generic course tabs based on currentSubtab
        if (["tsa-courses", "hsa-courses", "thpt-courses"].includes(tabId)) {
          const cat = tabId.split("-")[0];
          tabId = cat + "-" + (currentSubtab === "my" ? "my" : "all") + "-courses";
        }

        const originalTabId = tabId;

        // Legacy redirects and mapping split course subtabs to the actual single panel view
        if (["tsa-my-courses", "hsa-my-courses", "thpt-my-courses"].includes(tabId)) {
          currentExamCategory = tabId.split("-")[0];
          currentSubtab = "my";
          tabId = currentExamCategory + "-courses";
        } else if (["tsa-all-courses", "hsa-all-courses", "thpt-all-courses"].includes(tabId)) {
          currentExamCategory = tabId.split("-")[0];
          currentSubtab = "all";
          tabId = currentExamCategory + "-courses";
        } else if (tabId === "my-courses") {
          currentSubtab = "my";
          tabId = currentExamCategory + "-courses";
        } else if (tabId === "courses") {
          currentSubtab = "all";
          tabId = currentExamCategory + "-courses";
        } else if (tabId === "practice") {
          tabId = currentPracticeCategory + "-practice";
        } else if (tabId === "tsa-exam") {
          tabId = currentExamTypeCategory + "-exams";
        }

        // Categorize tabId prefixes and set categories
        if (["tsa-courses", "hsa-courses", "thpt-courses"].includes(tabId)) {
          currentExamCategory = tabId.split("-")[0];
        } else if (["tsa-practice", "hsa-practice", "thpt-practice", "vact-practice", "qda-practice"].includes(tabId)) {
          currentPracticeCategory = tabId.split("-")[0];
        } else if (["tsa-exams", "hsa-exams", "thpt-exams", "vact-exams", "qda-exams"].includes(tabId)) {
          currentExamTypeCategory = tabId.split("-")[0];
        }

        // Determine active categories and panels
        const isExamRoom = ["tsa-courses", "hsa-courses", "thpt-courses"].includes(tabId);
        const isPracticeRoom = ["tsa-practice", "hsa-practice", "thpt-practice", "vact-practice", "qda-practice"].includes(tabId);
        const isExamList = ["tsa-exams", "hsa-exams", "thpt-exams", "vact-exams", "qda-exams"].includes(tabId);
        const isDocumentsRoom = tabId === "documents";

        // Toggle Active Menu Item
        menuItems.forEach(item => {
          const itemTab = item.getAttribute("data-tab");
          if (itemTab === originalTabId || itemTab === tabId) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });

        // Manage Accordions state (highlight and expand/collapse)
        document.querySelectorAll(".menu-group").forEach(group => {
          const submenu = group.querySelector(".submenu-wrapper");
          const items = group.querySelectorAll(".submenu-item");
          let hasActive = false;
          
          items.forEach(item => {
            const itemTab = item.getAttribute("data-tab");
            if (itemTab === originalTabId || itemTab === tabId) {
              hasActive = true;
            }
          });

          if (hasActive) {
            group.classList.add("has-active");
            group.classList.add("open");
            if (submenu) submenu.style.maxHeight = submenu.scrollHeight + "px";
          } else {
            group.classList.remove("has-active");
            group.classList.remove("open");
            if (submenu) submenu.style.maxHeight = "0px";
          }
        });

        // Toggle Active Tab Panel
        tabPanels.forEach(panel => {
          if (isExamRoom && panel.id === "tab-exam-room") {
            panel.classList.add("active");
          } else if (isPracticeRoom && panel.id === "tab-practice") {
            panel.classList.add("active");
          } else if (isExamList && panel.id === "tab-tsa-exam") {
            panel.classList.add("active");
          } else if (isDocumentsRoom && panel.id === "tab-documents") {
            panel.classList.add("active");
          } else if (!isExamRoom && !isPracticeRoom && !isExamList && !isDocumentsRoom && panel.id === `tab-${tabId}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });

        // Update corresponding UIs
        if (isExamRoom) {
          updateExamRoomUI();
          syncEnrollmentsFromDatabase();
        }
        if (isPracticeRoom) updatePracticeRoomUI();
        if (isExamList) renderExams();
        if (isDocumentsRoom) updateDocumentsUI();
        if (tabId === 'history') renderExamHistory();

        // Update topbar nav buttons active states
        document.querySelectorAll('.topbar-nav-btn').forEach(btn => btn.classList.remove('active'));
        if (tabId === 'overview') {
          const isCommunity = document.getElementById('dash-btn-community') && document.getElementById('dash-btn-community').classList.contains('active');
          if (isCommunity) {
            const btn = document.getElementById('topbar-btn-community');
            if (btn) btn.classList.add('active');
          } else {
            const btn = document.getElementById('topbar-btn-home');
            if (btn) btn.classList.add('active');
          }
        } else if (isExamRoom || tabId.includes('courses')) {
          const btn = document.getElementById('topbar-btn-courses');
          if (btn) btn.classList.add('active');
        } else if (isDocumentsRoom || tabId.includes('documents')) {
          const btn = document.getElementById('topbar-btn-documents');
          if (btn) btn.classList.add('active');
        } else if (isExamList || tabId === 'history') {
          const btn = document.getElementById('topbar-btn-exams');
          if (btn) btn.classList.add('active');
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          const activePanel = document.querySelector(".tab-panel.active");
          if (activePanel) {
            activePanel.scrollTop = 0;
          }
        }, 80);

        // Full-bleed for schedule tab
        const tsaContent = document.querySelector('.tsa-content');
        if (tsaContent) {
          if (tabId === 'schedule') {
            tsaContent.classList.add('schedule-active');
          } else {
            tsaContent.classList.remove('schedule-active');
          }
        }
      }

      // Bind menu item click listeners
      menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const tabId = item.getAttribute("data-tab");
          if (tabId === "documents" || tabId === "tai-lieu") {
            safePushState({ route: "tai-lieu" }, "", "/tai-lieu");
            handleRouting();
          } else {
            safePushState({ route: "homepage" }, "", "/");
            window.location.hash = tabId;
            switchTab(tabId);
          }
        });
      });

      // Bind quick actions click listeners
      quickActionTargets.forEach(target => {
        target.addEventListener("click", (e) => {
          e.preventDefault();
          const tabId = target.getAttribute("data-target-tab");
          switchTab(tabId);
          window.location.hash = tabId;
        });
      });

      // Accordion toggle controllers (Exclusive Accordion Mode)
      document.querySelectorAll(".menu-group").forEach(group => {
        const toggle = group.querySelector(".group-header");
        const submenu = group.querySelector(".submenu-wrapper");
        
        toggle.addEventListener("click", (e) => {
          e.preventDefault();
          
          const shell = document.querySelector(".tsa-shell");
          
          // Function to close all other accordion menu groups
          const closeAllOthers = () => {
            document.querySelectorAll(".menu-group").forEach(otherGroup => {
              if (otherGroup !== group) {
                otherGroup.classList.remove("open");
                const otherSubmenu = otherGroup.querySelector(".submenu-wrapper");
                if (otherSubmenu) {
                  otherSubmenu.classList.remove("open");
                  otherSubmenu.style.maxHeight = "0px";
                }
              }
            });
          };

          if (shell.classList.contains("sidebar-collapsed") && window.innerWidth > 768) {
            shell.classList.remove("sidebar-collapsed");
            const sidebarToggle = document.getElementById("sidebar-toggle");
            sidebarToggle.setAttribute("aria-expanded", "true");
            sidebarToggle.setAttribute("aria-label", "Thu gọn thanh bên");
            
            closeAllOthers();
            group.classList.add("open");
            submenu.classList.add("open");
            submenu.style.maxHeight = submenu.scrollHeight + "px";
          } else {
            const isOpen = group.classList.contains("open");
            closeAllOthers();
            if (isOpen) {
              group.classList.remove("open");
              submenu.classList.remove("open");
              submenu.style.maxHeight = "0px";
            } else {
              group.classList.add("open");
              submenu.classList.add("open");
              submenu.style.maxHeight = submenu.scrollHeight + "px";
            }
          }
        });
      });

      // Subtab toggle event listeners for course tabs segment controller (Synced with Sidebar)
      document.querySelectorAll(".exam-subtab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const sub = btn.getAttribute("data-subtab");
          const targetTabId = currentExamCategory + "-" + (sub === "my" ? "my" : "all") + "-courses";
          switchTab(targetTabId);
          window.location.hash = targetTabId;
        });
      });

      // Bind search and filter events for Kho Tài Liệu
      const searchInput = document.getElementById("material-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", renderMaterials);
      }
      const filterSelect = document.getElementById("material-filter-select");
      if (filterSelect) {
        filterSelect.addEventListener("change", renderMaterials);
      }

      // Global functions for TSA Overview Dashboard (exposed to window for HTML inline handlers)
      window.toggleTsaYear = function(year) {
        // Toggle tabs active class
        const buttons = document.querySelectorAll(".chart-tab-btn");
        buttons.forEach(btn => {
          if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(year)) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        // Toggle panel display
        const panels = document.querySelectorAll(".tsa-year-panel");
        panels.forEach(panel => {
          if (panel.id === `tsa-data-${year}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });
      };

      window.currentOverviewExam = 'tsa';
      window.currentOverviewTab = 'intro';

      window.updateOverviewDashboard = function() {
        // 1. Update Exam Selector Buttons active state
        const examButtons = document.querySelectorAll(".exam-selector-btn");
        examButtons.forEach(btn => {
          if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(window.currentOverviewExam)) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        // 2. Update Category Tab Buttons active state
        const tabButtons = document.querySelectorAll(".overview-tab-btn");
        tabButtons.forEach(btn => {
          if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(window.currentOverviewTab)) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        // 3. Update Category Sub-Panels (Giới thiệu, Phổ điểm, Điểm chuẩn)
        const subPanels = document.querySelectorAll(".overview-sub-panel");
        subPanels.forEach(panel => {
          if (panel.id === `overview-panel-${window.currentOverviewTab}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });

        // 4. Update Exam-Specific Sub-panels inside the categories
        // Intro panels
        const introPanels = document.querySelectorAll(".intro-exam-panel");
        introPanels.forEach(panel => {
          if (panel.id === `intro-exam-${window.currentOverviewExam}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });

        // Stats panels
        const statsPanels = document.querySelectorAll(".stats-exam-panel");
        statsPanels.forEach(panel => {
          if (panel.id === `stats-exam-${window.currentOverviewExam}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });

        // Cutoffs panels
        const cutoffsPanels = document.querySelectorAll(".cutoffs-exam-panel");
        cutoffsPanels.forEach(panel => {
          if (panel.id === `cutoffs-exam-${window.currentOverviewExam}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });

        // Schools panels
        const schoolsPanels = document.querySelectorAll(".schools-exam-panel");
        schoolsPanels.forEach(panel => {
          if (panel.id === `schools-exam-${window.currentOverviewExam}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });
      };

      window.switchOverviewExam = function(examId) {
        window.currentOverviewExam = examId;
        window.updateOverviewDashboard();
      };

      window.switchOverviewSubTab = function(tabId) {
        window.currentOverviewTab = tabId;
        window.updateOverviewDashboard();
      };

      window.toggleHsaYear = function(year) {
        const buttons = document.querySelectorAll(".hsa-chart-tab-btn");
        buttons.forEach(btn => {
          if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(year)) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        const panels = document.querySelectorAll(".hsa-year-panel");
        panels.forEach(panel => {
          if (panel.id === `hsa-data-${year}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });
      };

      window.toggleVactYear = function(year) {
        const buttons = document.querySelectorAll(".vact-chart-tab-btn");
        buttons.forEach(btn => {
          if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(year)) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        const panels = document.querySelectorAll(".vact-year-panel");
        panels.forEach(panel => {
          if (panel.id === `vact-data-${year}`) {
            panel.classList.add("active");
          } else {
            panel.classList.remove("active");
          }
        });
      };

      window.filterHsaTable = function() {
        const input = document.getElementById("hsa-cutoff-search");
        const filter = input.value.toUpperCase();
        const tbody = document.getElementById("hsa-cutoff-tbody");
        const trs = tbody.getElementsByTagName("tr");
        for (let i = 0; i < trs.length; i++) {
          const tds = trs[i].getElementsByTagName("td");
          let match = false;
          for (let j = 0; j < tds.length; j++) {
            if (tds[j] && tds[j].textContent.toUpperCase().indexOf(filter) > -1) {
              match = true;
              break;
            }
          }
          trs[i].style.display = match ? "" : "none";
        }
      };

      window.filterVactTable = function() {
        const input = document.getElementById("vact-cutoff-search");
        const filter = input.value.toUpperCase();
        const tbody = document.getElementById("vact-cutoff-tbody");
        const trs = tbody.getElementsByTagName("tr");
        for (let i = 0; i < trs.length; i++) {
          const tds = trs[i].getElementsByTagName("td");
          let match = false;
          for (let j = 0; j < tds.length; j++) {
            if (tds[j] && tds[j].textContent.toUpperCase().indexOf(filter) > -1) {
              match = true;
              break;
            }
          }
          trs[i].style.display = match ? "" : "none";
        }
      };

      // Official 2025 HUST cutoff values transcribed from the supplied table.
      const HUST_MAJORS_DATA = [
        { code: "IT-E10", name: "Khoa học dữ liệu và Trí tuệ nhân tạo (CT tiên tiến)", thpt: "29,39", xttn12: "93,13", xttn13: "95,64", dgtd: "86,97" },
        { code: "IT1", name: "CNTT: Khoa học Máy tính", thpt: "29,19", xttn12: "90,61", xttn13: "93,92", dgtd: "83,39" },
        { code: "IT2", name: "CNTT: Kỹ thuật Máy tính", thpt: "28,83", xttn12: "84,64", xttn13: "89,62", dgtd: "79,86" },
        { code: "IT-E15", name: "An toàn không gian số - Cyber Security (CT Tiên tiến)", thpt: "28,69", xttn12: "82,32", xttn13: "87,95", dgtd: "78,49" },
        { code: "IT-E7", name: "Công nghệ thông tin (Global ICT)", thpt: "28,66", xttn12: "81,82", xttn13: "87,59", dgtd: "78,19" },
        { code: "EE2", name: "Kỹ thuật Điều khiển - Tự động hoá", thpt: "28,48", xttn12: "78,83", xttn13: "85,44", dgtd: "76,43" },
        { code: "MS2", name: "Kỹ thuật Vi điện tử và Công nghệ nano", thpt: "28,25", xttn12: "77,20", xttn13: "80,90", dgtd: "74,76" },
        { code: "EE-E8", name: "Kỹ thuật Điều khiển - Tự động hoá (CT tiên tiến)", thpt: "28,12", xttn12: "76,40", xttn13: "78,24", dgtd: "73,86" },
        { code: "ET1", name: "Kỹ thuật Điện tử - Viễn thông", thpt: "28,07", xttn12: "76,09", xttn13: "77,22", dgtd: "73,51" },
        { code: "IT-E6", name: "Công nghệ thông tin (Việt - Nhật)", thpt: "27,97", xttn12: "75,47", xttn13: "75,17", dgtd: "72,81" },
        { code: "ME1", name: "Kỹ thuật Cơ điện tử", thpt: "27,90", xttn12: "75,04", xttn13: "73,74", dgtd: "72,32" },
        { code: "ET-E9", name: "Hệ thống nhúng thông minh và IoT (CT tiên tiến)", thpt: "27,85", xttn12: "74,73", xttn13: "72,71", dgtd: "71,97" },
        { code: "IT-EP", name: "Công nghệ thông tin (Việt - Pháp)", thpt: "27,83", xttn12: "74,61", xttn13: "72,30", dgtd: "71,83" },
        { code: "MI1", name: "Toán - Tin", thpt: "27,80", xttn12: "74,42", xttn13: "71,69", dgtd: "71,62" },
        { code: "MI2", name: "Hệ thống thông tin quản lý", thpt: "27,72", xttn12: "73,93", xttn13: "70,05", dgtd: "71,07" },
        { code: "EE1", name: "Kỹ thuật Điện", thpt: "27,55", xttn12: "72,88", xttn13: "66,57", dgtd: "69,88" },
        { code: "ET-E4", name: "Kỹ thuật Điện tử - Viễn thông (CT tiên tiến)", thpt: "27,55", xttn12: "72,88", xttn13: "66,57", dgtd: "69,88" },
        { code: "EE-EP", name: "Tin học công nghiệp và Tự động hóa (Chương trình Việt - Pháp PFIEV)", thpt: "27,27", xttn12: "70,85", xttn13: "65,26", dgtd: "68,73" },
        { code: "TE1", name: "Kỹ thuật Ô tô", thpt: "27,03", xttn12: "69,12", xttn13: "64,13", dgtd: "67,74" },
        { code: "ME-E1", name: "Kỹ thuật Cơ điện tử (CT tiên tiến)", thpt: "26,74", xttn12: "67,02", xttn13: "62,78", dgtd: "66,54" },
        { code: "ET-E16", name: "Truyền thông số và Kỹ thuật đa phương tiện (CT tiên tiến)", thpt: "26,62", xttn12: "66,15", xttn13: "62,21", dgtd: "66,05" },
        { code: "ME2", name: "Kỹ thuật Cơ khí", thpt: "26,62", xttn12: "66,15", xttn13: "62,21", dgtd: "66,05" },
        { code: "TE3", name: "Kỹ thuật Hàng không", thpt: "26,60", xttn12: "66,00", xttn13: "62,12", dgtd: "65,97" },
        { code: "EE-E18", name: "Hệ thống điện và năng lượng tái tạo (CT tiên tiến)", thpt: "26,56", xttn12: "65,71", xttn13: "61,93", dgtd: "65,80" },
        { code: "ET-LUH", name: "Điện tử - Viễn thông - hợp tác với ĐH Leibniz Hannover (Đức)", thpt: "26,55", xttn12: "65,64", xttn13: "61,89", dgtd: "65,76" },
        { code: "PH1", name: "Vật lý kỹ thuật", thpt: "26,41", xttn12: "64,63", xttn13: "61,23", dgtd: "65,19" },
        { code: "ET2", name: "Kỹ thuật Y sinh", thpt: "26,32", xttn12: "63,98", xttn13: "60,81", dgtd: "64,82" },
        { code: "TE2", name: "Kỹ thuật Cơ khí động lực", thpt: "26,25", xttn12: "63,47", xttn13: "60,48", dgtd: "64,53" },
        { code: "ME-LUH", name: "Cơ điện tử - hợp tác với ĐH Leibniz Hannover (Đức)", thpt: "26,19", xttn12: "63,04", xttn13: "60,20", dgtd: "64,28" },
        { code: "TE-EP", name: "Cơ khí hàng không (Chương trình Việt - Pháp PFIEV)", thpt: "25,84", xttn12: "60,50", xttn13: "58,56", dgtd: "62,84" },
        { code: "ME-NUT", name: "Cơ điện tử - hợp tác với ĐH Công nghệ Nagaoka (Nhật Bản)", thpt: "25,68", xttn12: "59,34", xttn13: "57,81", dgtd: "62,18" },
        { code: "ET-E5", name: "Kỹ thuật Y sinh (CT tiên tiến)", thpt: "25,58", xttn12: "58,62", xttn13: "57,34", dgtd: "61,77" },
        { code: "HE1", name: "Kỹ thuật Nhiệt", thpt: "25,47", xttn12: "57,82", xttn13: "56,83", dgtd: "61,32" },
        { code: "MS1", name: "Kỹ thuật Vật liệu", thpt: "25,39", xttn12: "57,24", xttn13: "56,45", dgtd: "60,99" },
        { code: "PH3", name: "Vật lý Y khoa", thpt: "25,20", xttn12: "55,87", xttn13: "55,56", dgtd: "60,20" },
        { code: "TE-E2", name: "Kỹ thuật Ô tô (CT tiên tiến)", thpt: "25,18", xttn12: "55,72", xttn13: "55,47", dgtd: "60,12" },
        { code: "MS3", name: "Công nghệ vật liệu Polyme và Compozit", thpt: "25,16", xttn12: "55,58", xttn13: "55,37", dgtd: "60,04" },
        { code: "PH2", name: "Kỹ thuật hạt nhân", thpt: "25,07", xttn12: "55,00", xttn13: "55,00", dgtd: "59,68" },
        { code: "ME-GU", name: "Cơ khí - Chế tạo máy - hợp tác với ĐH Griffith (Úc)", thpt: "25,00", xttn12: "55,00", xttn13: "55,00", dgtd: "59,49" },
        { code: "MS5", name: "Kỹ thuật in", thpt: "24,06", xttn12: "55,00", xttn13: "55,00", dgtd: "56,88" },
        { code: "CH1", name: "Kỹ thuật Hoá học", thpt: "24,05", xttn12: "55,00", xttn13: "55,00", dgtd: "56,86" },
        { code: "MS-E3", name: "Khoa học và Kỹ thuật vật liệu (CT tiên tiến)", thpt: "23,70", xttn12: "55,00", xttn13: "55,00", dgtd: "55,89" },
        { code: "BF2", name: "Kỹ thuật Thực phẩm", thpt: "23,38", xttn12: "55,00", xttn13: "55,00", dgtd: "55,05" },
        { code: "CH2", name: "Hoá học", thpt: "23,19", xttn12: "55,00", xttn13: "55,00", dgtd: "54,66" },
        { code: "BF1", name: "Kỹ thuật Sinh học", thpt: "23,02", xttn12: "55,00", xttn13: "55,00", dgtd: "54,30" },
        { code: "TX1", name: "Công nghệ Dệt - May", thpt: "22,48", xttn12: "55,00", xttn13: "55,00", dgtd: "53,17" },
        { code: "EV1", name: "Kỹ thuật Môi trường", thpt: "22,22", xttn12: "55,00", xttn13: "55,00", dgtd: "52,63" },
        { code: "EV2", name: "Quản lý Tài nguyên và Môi trường", thpt: "21,53", xttn12: "55,00", xttn13: "55,00", dgtd: "51,19" },
        { code: "CH-E11", name: "Kỹ thuật Hóa dược (CT tiên tiến)", thpt: "21,38", xttn12: "55,00", xttn13: "55,00", dgtd: "50,88" },
        { code: "BF-E12", name: "Kỹ thuật Thực phẩm (CT tiên tiến)", thpt: "21,00", xttn12: "55,00", xttn13: "55,00", dgtd: "50,08" },
        { code: "BF-E19", name: "Kỹ thuật sinh học (CT tiên tiến)", thpt: "20,00", xttn12: "55,00", xttn13: "55,00", dgtd: "47,99" },
        { code: "FL3", name: "Tiếng Trung KHKT và Công nghệ", thpt: "24,86", xttn12: "69,81", xttn13: "64,59", dgtd: "68,14" },
        { code: "EM3", name: "Quản trị kinh doanh", thpt: "24,30", xttn12: "65,73", xttn13: "61,94", dgtd: "65,81" },
        { code: "EM5", name: "Tài chính - Ngân hàng", thpt: "24,30", xttn12: "65,73", xttn13: "61,94", dgtd: "65,81" },
        { code: "FL1", name: "Tiếng Anh KHKT và Công nghệ", thpt: "24,30", xttn12: "65,73", xttn13: "61,94", dgtd: "65,81" },
        { code: "FL2", name: "Tiếng Anh chuyên nghiệp quốc tế", thpt: "24,30", xttn12: "65,73", xttn13: "61,94", dgtd: "65,81" },
        { code: "EM4", name: "Kế toán", thpt: "24,13", xttn12: "64,49", xttn13: "61,14", dgtd: "65,11" },
        { code: "EM2", name: "Quản lý công nghiệp", thpt: "23,90", xttn12: "62,81", xttn13: "60,05", dgtd: "64,15" },
        { code: "EM-E14", name: "Logistics và Quản lý chuỗi cung ứng (CT tiên tiến)", thpt: "23,71", xttn12: "61,42", xttn13: "59,16", dgtd: "63,36" },
        { code: "EM1", name: "Quản lý năng lượng", thpt: "23,70", xttn12: "61,35", xttn13: "59,11", dgtd: "63,32" },
        { code: "ED2", name: "Công nghệ giáo dục", thpt: "23,30", xttn12: "58,43", xttn13: "57,22", dgtd: "61,66" },
        { code: "ED3", name: "Quản lý giáo dục", thpt: "23,20", xttn12: "57,70", xttn13: "56,75", dgtd: "61,25" },
        { code: "EM-E13", name: "Phân tích kinh doanh (CT tiên tiến)", thpt: "23,06", xttn12: "56,68", xttn13: "56,09", dgtd: "60,66" },
        { code: "TROY-IT", name: "Khoa học máy tính - hợp tác với ĐH Troy (Hoa Kỳ)", thpt: "21,30", xttn12: "55,00", xttn13: "55,00", dgtd: "54,07" },
        { code: "TROY-BA", name: "Quản trị kinh doanh - hợp tác với ĐH Troy (Hoa Kỳ)", thpt: "19,00", xttn12: "55,00", xttn13: "55,00", dgtd: "46,48" }
      ];

      function normalizeCutoffSearch(value) {
        return String(value || "")
          .normalize("NFD")
          .replace(/[\\u0300-\\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toUpperCase();
      }

      function getCutoffBand(stt) {
        if (stt <= 9 || (stt >= 40 && stt <= 51)) return "band-blue";
        if (stt <= 19) return "band-green";
        if (stt <= 29) return "band-cyan";
        if (stt <= 39) return "band-purple";
        return "band-pink";
      }

      function renderCutoffTable(filterText = "") {
        const tbody = document.getElementById("hust-cutoff-tbody");
        if (!tbody) return;

        const filter = normalizeCutoffSearch(filterText);
        const visibleItems = HUST_MAJORS_DATA
          .map((item, index) => ({
            ...item,
            stt: index + 1,
            combination: index < 51 ? "A00" : "D01"
          }))
          .filter(item => {
            const searchable = normalizeCutoffSearch([
              item.stt,
              item.code,
              item.name,
              item.combination,
              item.thpt,
              item.xttn12,
              item.xttn13,
              item.dgtd
            ].join(" "));
            return !filter || searchable.includes(filter);
          });

        tbody.innerHTML = "";
        if (!visibleItems.length) {
          tbody.innerHTML = '<tr><td class="hust-cutoff-empty" colspan="8">Không tìm thấy mã xét tuyển phù hợp.</td></tr>';
          return;
        }

        const combinationCounts = visibleItems.reduce((counts, item) => {
          counts[item.combination] = (counts[item.combination] || 0) + 1;
          return counts;
        }, {});
        const renderedCombinations = new Set();

        visibleItems.forEach(item => {
          const tr = document.createElement("tr");
          tr.className = getCutoffBand(item.stt);

          let combinationCell = "";
          if (!renderedCombinations.has(item.combination)) {
            combinationCell = `<td class="cutoff-combination" rowspan="${combinationCounts[item.combination]}">${item.combination}</td>`;
            renderedCombinations.add(item.combination);
          }

          tr.innerHTML = `
            <td>${item.stt}</td>
            <td class="cutoff-code">${item.code}</td>
            <td class="cutoff-name">${item.name}</td>
            ${combinationCell}
            <td class="cutoff-score">${item.thpt}</td>
            <td class="cutoff-score">${item.xttn12}</td>
            <td class="cutoff-score">${item.xttn13}</td>
            <td class="cutoff-score">${item.dgtd}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      window.filterCutoffTable = function() {
        const input = document.getElementById("cutoff-search-input");
        renderCutoffTable(input.value);
      };

      // Initial render of cutoff table
      renderCutoffTable();

      // Cache for history data to enable instant local search
      window.EXAM_HISTORY_DATA = [];

      function getExamCategoryLabel(examCode) {
        const code = String(examCode || "").toUpperCase();
        if (code.includes("TSA")) return "Bài thi TSA";
        if (code.includes("HSA")) return "Bài thi HSA";
        if (code.includes("THPT")) return "Bài thi THPTQG";
        return "Bài thi Luyện tập";
      }

      function getGroupDateKey(isoString) {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return "Khác";
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      }

      function renderHistoryGroups(filteredData) {
        const container = document.getElementById("history-grouped-container");
        if (!container) return;

        if (!filteredData || filteredData.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b; font-size: 14px; background: #ffffff; border: 1px solid rgba(19, 92, 151, 0.1); border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.015);">
              Không tìm thấy kết quả làm bài nào phù hợp.
            </div>
          `;
          return;
        }

        // Group by Date
        const dateKeys = [];
        const groups = {};
        
        filteredData.forEach(row => {
          const dateKey = getGroupDateKey(row.created_at);
          if (!groups[dateKey]) {
            groups[dateKey] = [];
            dateKeys.push(dateKey);
          }
          groups[dateKey].push(row);
        });

        container.textContent = "";

        dateKeys.forEach(dateKey => {
          const rows = groups[dateKey];
          
          const block = document.createElement("div");
          block.className = "history-date-block";

          const title = document.createElement("h3");
          title.className = "history-date-title";
          title.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Ngày ${dateKey}</span>
          `;
          block.appendChild(title);

          const timeline = document.createElement("div");
          timeline.className = "history-timeline";

          rows.forEach(row => {
            // Find exam title
            let examTitle = row.exam_code;
            if (window.EXAMS_LIST) {
              const examMeta = window.EXAMS_LIST.find(e => e.exam_code === row.exam_code);
              if (examMeta) {
                examTitle = examMeta.title;
              } 
            }

            // Category Label & Badge Class
            const categoryLabel = getExamCategoryLabel(row.exam_code);
            let badgeClass = "badge-practice";
            let badgeText = "L.TẬP";
            if (categoryLabel === "Bài thi TSA") {
              badgeClass = "badge-tsa";
              badgeText = "TSA";
            } else if (categoryLabel === "Bài thi HSA") {
              badgeClass = "badge-hsa";
              badgeText = "HSA";
            } else if (categoryLabel === "Bài thi THPTQG") {
              badgeClass = "badge-thpt";
              badgeText = "THPT";
            }

            // Time string only (HH:MM:SS)
            const timeOnly = (function(iso) {   
              const d = new Date(iso);
              if (isNaN(d.getTime())) return "";
              const pad = (n) => String(n).padStart(2, '0');
              return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            })(row.created_at);

            // Full datetime for detail popup
            const timeStr = (function(iso) {
              const d = new Date(iso);
              if (isNaN(d.getTime())) return iso;
              const pad = (n) => String(n).padStart(2, '0');
              return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
            })(row.created_at);

            const item = document.createElement("div");
            item.className = "timeline-item";
            
            item.innerHTML = `
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-main-info">
                  <div class="timeline-badge-subject ${badgeClass}">${badgeText}</div>
                  <div class="timeline-text-content">
                    <div class="timeline-title">${examTitle}</div>
                    <div class="timeline-subtitle" style="display: inline-flex; align-items: center; gap: 6px;">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Nộp lúc: ${timeOnly}
                    </div>
                  </div>
                </div>
                <div class="timeline-stats-action">
                  <div class="timeline-stat-item">
                    <span class="stat-label">Số câu đúng</span>
                    <span class="stat-value">${row.correct_count}/${row.total_questions}</span>
                  </div>
                  <div class="timeline-divider"></div>
                  <div class="timeline-action-wrapper">
                    <span class="status-pill">Hoàn thành</span>
                    <a class="detail-action view-detail-btn">
                      Chi tiết
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 2px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                  </div>
                </div>
              </div>
            `;

            // Calculate scale 100 score for detail popup
            const totalQ = row.total_questions || 1;
            const score100 = Math.round((row.score / totalQ) * 100);

            item.querySelector(".view-detail-btn").addEventListener("click", (e) => {
              e.preventDefault();
              showParentSubmitLoadingOverlay();
              setTimeout(async () => {
                await window.showExamResultModal(row.exam_code, examTitle, row.id || row.created_at);
                hideParentSubmitLoadingOverlay();
              }, 800);
            });

            timeline.appendChild(item);
          });

          block.appendChild(timeline);
          container.appendChild(block);
        });
      }

      window.filterHistoryTable = function() {
        const query = String(document.getElementById("history-search-input")?.value || "").trim().toLowerCase();
        if (!query) {
          renderHistoryGroups(window.EXAM_HISTORY_DATA);
          return;
        }

        const filtered = window.EXAM_HISTORY_DATA.filter(row => {
          let examTitle = row.exam_code;
          if (window.EXAMS_LIST) {
            const examMeta = window.EXAMS_LIST.find(e => e.exam_code === row.exam_code);
            if (examMeta) {
              examTitle = examMeta.title;
            }
          }
          const categoryLabel = getExamCategoryLabel(row.exam_code);
          return examTitle.toLowerCase().includes(query) || 
                 row.exam_code.toLowerCase().includes(query) ||
                 categoryLabel.toLowerCase().includes(query);
        });

        renderHistoryGroups(filtered);
      };

      function getGroupDateKey(dateStr) {
        if (!dateStr) return "Không rõ ngày";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "Không rõ ngày";
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        } catch (e) {
          return "Không rõ ngày";
        }
      }

      function getExamCategoryLabel(examCode) {
        if (!examCode) return "Luyện tập";
        const code = String(examCode).toLowerCase();
        if (code.includes("tsa")) return "Bài thi TSA";
        if (code.includes("hsa")) return "Bài thi HSA";
        if (code.includes("thpt")) return "Bài thi THPTQG";
        return "Luyện tập";
      }

      async function renderExamHistory() {
        const container = document.getElementById("history-grouped-container");
        if (!container) return;

        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #64748b;">
            <span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #dc2626;border-radius:50%;border-top-color:transparent;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:8px;"></span>
            Đang tải lịch sử bài làm...
          </div>
        `;

        let studentCode = studentInfo?.email || "test";
        try {
          const cached = JSON.parse(localStorage.getItem("studentInfo"));
          if (cached) {
            studentCode = cached.email || cached.username || studentCode;
          }
        } catch (e) {}

        let data = [];
        if (supabaseClient) {
          try {
            const { data: dbData, error } = await supabaseClient
              .from('exam_results')
              .select('id, exam_code, user_email, correct_count, total_questions, score, created_at')
              .eq('user_email', studentCode)
              .order('created_at', { ascending: false })
              .limit(50);
            if (!error && dbData) {
              data = dbData;
            }
          } catch (err) {
            console.error("Lỗi khi tải lịch sử từ Supabase:", err);
          }
        }

        // Tải lịch sử thi cục bộ từ localStorage
        let localAttempts = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("tma_tsa_last_local_result_")) {
            try {
              const item = JSON.parse(localStorage.getItem(key));
              if (item && item.exam_code) {
                localAttempts.push(item);
              }
            } catch (e) {}
          }
        }

        // Hợp nhất dữ liệu
        let combined = data || [];
        localAttempts.forEach(localAtt => {
          if (!combined.some(c => String(c.id) === String(localAtt.id))) {
            combined.push(localAtt);
          }
        });

        // Sắp xếp theo thứ tự mới nhất đứng trước
        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        window.EXAM_HISTORY_DATA = combined;
        renderHistoryGroups(window.EXAM_HISTORY_DATA);
        if (typeof window.renderDashboardHistory === "function") {
          window.renderDashboardHistory();
        }
      }

      // EXAM RESULT MODAL HANDLERS
      window.showHustResultModal = async function(examCode, examTitle, targetAttemptId) {
        const modal = document.getElementById("hust-result-modal");
        if (!modal) return;

        let studentCode = studentInfo?.email || "test";
        try {
          const cached = JSON.parse(localStorage.getItem("studentInfo"));
          if (cached) {
            studentCode = cached.email || cached.username || studentCode;
          }
        } catch (e) {}

        const category = getExamCategoryLabel(examCode);

        // Fetch attempts
        let attempts = [];
        if (supabaseClient) {
          try {
            const { data, error } = await supabaseClient
              .from('exam_results')
              .select('id, exam_code, user_email, correct_count, total_questions, score, created_at')
              .eq('user_email', studentCode)
              .eq('exam_code', examCode)
              .order('created_at', { ascending: true });
            if (!error && data) {
              attempts = data;
            }
          } catch (err) {
            console.error("Lỗi khi tải lịch sử từ Supabase:", err);
          }
        }

        // Merge with local result if exists
        try {
          const localRes = JSON.parse(localStorage.getItem("tma_tsa_last_local_result_" + examCode));
          if (localRes) {
            if (!attempts.some(a => a.id === localRes.id)) {
              attempts.push(localRes);
            }
          }
        } catch (e) {}

        let result = null;
        if (targetAttemptId) {
          result = attempts.find(a => String(a.id) === String(targetAttemptId) || String(a.created_at) === String(targetAttemptId));
        } else if (attempts.length > 0) {
          result = attempts[attempts.length - 1]; // latest
        }

        if (result) {
          const grandTotal = result.total_questions || 100;
          const grandCorrect = result.correct_count || 0;
          const scaledScore = grandTotal > 0 ? ((grandCorrect / grandTotal) * 100).toFixed(2) : "0.00";

          // Cập nhật số điểm
          const scoreEl = document.getElementById("hust-modal-score");
          if (scoreEl) scoreEl.textContent = scaledScore;

          // Cập nhật tên đề
          const titleEl = document.getElementById("hust-modal-title");
          if (titleEl) titleEl.textContent = examTitle || "Bài thi TSA";

          // Tính số câu đúng từng môn
          let label1 = "Tư duy Toán học", label2 = "Tư duy Đọc hiểu", label3 = "Tư duy Khoa học/Giải quyết vấn đề";
          let c1 = 0, t1 = 40, c2 = 0, t2 = 20, c3 = 0, t3 = 40;
          if (category === "Bài thi HSA") {
            label1 = "Định lượng (Toán)"; label2 = "Định tính (Văn)"; label3 = "Khoa học (Lý/Hóa...)";
            t1 = t2 = t3 = Math.round(grandTotal / 3);
            c1 = Math.round(grandCorrect / 3); c2 = Math.round(grandCorrect / 3); c3 = grandCorrect - c1 - c2;
          } else {
            t1 = Math.round(grandTotal * 0.4); t2 = Math.round(grandTotal * 0.2); t3 = grandTotal - t1 - t2;
            c1 = Math.round(grandCorrect * 0.4); c2 = Math.round(grandCorrect * 0.2); c3 = grandCorrect - c1 - c2;
          }

          document.getElementById("hust-modal-subject-lbl-1").textContent = label1;
          document.getElementById("hust-modal-subject-lbl-2").textContent = label2;
          document.getElementById("hust-modal-subject-lbl-3").textContent = label3;

          document.getElementById("hust-modal-subject-cnt-1").textContent = c1;
          document.getElementById("hust-modal-subject-cnt-2").textContent = c2;
          document.getElementById("hust-modal-subject-cnt-3").textContent = c3;

          // Cập nhật thông tin dự thi
          const d = new Date(result.created_at);
          const pad = (n) => String(n).padStart(2, '0');
          const dateStr = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;

          document.getElementById("hust-modal-prep-time").textContent = `07:00 ${dateStr}`;
          document.getElementById("hust-modal-enter-time").textContent = `07:45 ${dateStr}`;
          document.getElementById("hust-modal-start-time").textContent = `08:30 ${dateStr}`;
          document.getElementById("hust-modal-sbd").textContent = (studentInfo.code || "TSA2603-" + String(studentInfo.username || "00000").substring(0, 5)).toUpperCase();
          document.getElementById("hust-modal-council").textContent = "TMA Study";
          document.getElementById("hust-modal-room").textContent = "Phòng thi trực tuyến TMA Study";

          modal.hidden = false;
        } else {
          alert("Không tìm thấy kết quả làm bài!");
        }
      };

      window.showExamResultModal = async function(examCode, examTitle, targetAttemptId) {
        const modal = document.getElementById("exam-result-modal");
        if (!modal) return;
        
        // SBD: either student code or mock (TMA + student username)
        let studentCode = studentInfo?.email || "test";
        let studentSbd = "TMA-STUDENT";
        try {
          const cached = JSON.parse(localStorage.getItem("studentInfo"));
          if (cached) {
            studentCode = cached.email || cached.username || studentCode;
            const rawUser = cached.username || cached.email || "STUDENT";
            const cleanUser = rawUser.split("@")[0].toUpperCase();
            studentSbd = "TMA-" + cleanUser;
          }
        } catch (e) {}
        
        const category = getExamCategoryLabel(examCode);
        const elCouncil = document.getElementById("result-modal-council");
        if (elCouncil) elCouncil.textContent = "TMA Study";
        const elRoom = document.getElementById("result-modal-room");
        if (elRoom) elRoom.textContent = "TMA Study Exam Practice Room";
        
        // Fetch attempts for this specific exam code
        let attempts = [];
        if (supabaseClient) {
          try {
            const { data, error } = await supabaseClient
              .from('exam_results')
              .select('id, exam_code, user_email, correct_count, total_questions, score, created_at')
              .eq('user_email', studentCode)
              .eq('exam_code', examCode)
              .order('created_at', { ascending: true }); // chronological order
            if (!error && data) {
              attempts = data;
            }

            // Merge with local result if exists
            try {
              const localRes = JSON.parse(localStorage.getItem("tma_tsa_last_local_result_" + examCode));
              if (localRes) {
                if (!attempts.some(a => a.id === localRes.id)) {
                  attempts.push(localRes);
                }
              }
            } catch (e) {}
          } catch (err) {
            console.error("Lỗi khi tải lịch sử bài thi:", err);
          }
        }
        
        // Fallback to local cache if Supabase is empty or failed
        if (attempts.length === 0) {
          const historyData = window.EXAM_HISTORY_DATA || [];
          attempts = historyData
            .filter(row => row.exam_code === examCode)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        const selectEl = document.getElementById("result-modal-attempt-select");
        
        async function displayAttempt(result) {
          if (result) {
            // Tính điểm theo thang 100
            const grandTotal = result.total_questions || 100;
            const grandCorrect = result.correct_count || 0;
            const scaledScore = grandTotal > 0 ? Math.round((grandCorrect / grandTotal) * 100) : 0;

            // Cập nhật số điểm
            const scoreEl = document.getElementById("result-modal-score");
            if (scoreEl) scoreEl.textContent = scaledScore + "/100";

            // Animate vòng tròn tiến độ
            const circleEl = document.getElementById("result-modal-circle-progress");
            if (circleEl) {
              setTimeout(() => { circleEl.style.strokeDashoffset = 515 - (scaledScore / 100) * 515; }, 120);
            }

            // Tính số câu đúng từng môn
            let label1 = "Tư duy Toán học", label2 = "Tư duy Đọc hiểu", label3 = "Tư duy Khoa học";
            let c1 = 0, t1 = 40, c2 = 0, t2 = 20, c3 = 0, t3 = 40;

            if (result.math_correct !== undefined) {
              c1 = result.math_correct; t1 = result.math_total || 0;
              c2 = result.reading_correct; t2 = result.reading_total || 0;
              c3 = result.science_correct; t3 = result.science_total || 0;
            } else if (supabaseClient) {
              try {
                const { data: answersData, error: answersError } = await supabaseClient
                  .from('exam_answers')
                  .select('subject, is_correct')
                  .eq('user_email', result.user_email)
                  .eq('exam_code', result.exam_code);
                  
                if (!answersError && answersData && answersData.length > 0) {
                  const mathRows = answersData.filter(a => a.subject === "math");
                  const readingRows = answersData.filter(a => a.subject === "reading");
                  const scienceRows = answersData.filter(a => a.subject === "science");

                  t1 = mathRows.length;
                  c1 = mathRows.filter(a => a.is_correct === true).length;

                  t2 = readingRows.length;
                  c2 = readingRows.filter(a => a.is_correct === true).length;

                  t3 = scienceRows.length;
                  c3 = scienceRows.filter(a => a.is_correct === true).length;
                } else {
                  // Proportional Fallback
                  if (category === "Bài thi HSA") {
                    t1 = t2 = t3 = Math.round(grandTotal / 3);
                    c1 = Math.round(grandCorrect / 3); c2 = Math.round(grandCorrect / 3); c3 = grandCorrect - c1 - c2;
                  } else {
                    t1 = Math.round(grandTotal * 0.4); t2 = Math.round(grandTotal * 0.2); t3 = grandTotal - t1 - t2;
                    c1 = Math.round(grandCorrect * 0.4); c2 = Math.round(grandCorrect * 0.2); c3 = grandCorrect - c1 - c2;
                  }
                }
              } catch (e) {
                console.error("Lỗi khi tải chi tiết đáp án:", e);
                if (category === "Bài thi HSA") {
                  t1 = t2 = t3 = Math.round(grandTotal / 3);
                  c1 = Math.round(grandCorrect / 3); c2 = Math.round(grandCorrect / 3); c3 = grandCorrect - c1 - c2;
                } else {
                  t1 = Math.round(grandTotal * 0.4); t2 = Math.round(grandTotal * 0.2); t3 = grandTotal - t1 - t2;
                  c1 = Math.round(grandCorrect * 0.4); c2 = Math.round(grandCorrect * 0.2); c3 = grandCorrect - c1 - c2;
                }
              }
            } else {
              // Proportional Fallback
              if (category === "Bài thi HSA") {
                t1 = t2 = t3 = Math.round(grandTotal / 3);
                c1 = Math.round(grandCorrect / 3); c2 = Math.round(grandCorrect / 3); c3 = grandCorrect - c1 - c2;
              } else {
                t1 = Math.round(grandTotal * 0.4); t2 = Math.round(grandTotal * 0.2); t3 = grandTotal - t1 - t2;
                c1 = Math.round(grandCorrect * 0.4); c2 = Math.round(grandCorrect * 0.2); c3 = grandCorrect - c1 - c2;
              }
            }

            if (category === "Bài thi HSA") {
              label1 = "Định lượng (Toán)"; label2 = "Định tính (Văn)"; label3 = "Khoa học (Lý/Hóa...)";
            }

            // Cập nhật từng thẻ phân môn
            [[1,label1,c1,t1],[2,label2,c2,t2],[3,label3,c3,t3]].forEach(([i,lbl,c,t]) => {
              const pct = t > 0 ? (c/t)*100 : 0;
              const elLbl = document.getElementById(`result-modal-subject-label-${i}`);
              const elCnt = document.getElementById(`result-modal-subject-count-text-${i}`);
              const elBar = document.getElementById(`result-modal-subject-bar-${i}`);
              const elSt  = document.getElementById(`result-modal-subject-status-${i}`);
              const elCard = document.getElementById(`result-modal-subject-card-${i}`);
              
              if (elCard) {
                if (t === 0) {
                  elCard.style.display = "none";
                } else {
                  elCard.style.display = "block";
                }
              }

              if (elLbl) elLbl.textContent = lbl;
              if (elCnt) elCnt.textContent = `${c}/${t}`;
              if (elBar) setTimeout(() => { elBar.style.width = pct + "%"; }, 80);
              if (elSt) {
                if (pct >= 80) { elSt.textContent = "Xuất sắc"; elSt.style.cssText = "font-size:10px;padding:2px 8px;border-radius:4px;font-weight:800;text-transform:uppercase;background:#e2fbe8;color:#15803d;"; }
                else if (pct >= 60) { elSt.textContent = "Khá"; elSt.style.cssText = "font-size:10px;padding:2px 8px;border-radius:4px;font-weight:800;text-transform:uppercase;background:#fef3c7;color:#a16207;"; }
                else { elSt.textContent = "Cần cải thiện"; elSt.style.cssText = "font-size:10px;padding:2px 8px;border-radius:4px;font-weight:800;text-transform:uppercase;background:#fee2e2;color:#b91c1c;"; }
              }

              // Render danh sách câu hỏi dạng bubble (hình tròn)
              const qe = document.getElementById(`result-modal-subject-questions-${i}`);
              if (qe) {
                qe.innerHTML = "";
                let max_q = t;
                for (let j = 1; j <= max_q; j++) {
                  const bubble = document.createElement("div");
                  bubble.className = "question-bubble";
                  bubble.textContent = j;
                  
                  // Tô màu các ô câu hỏi theo kết quả (đúng: xanh lá, sai: đỏ, chưa làm: xám)
                  if (j <= c) {
                    bubble.classList.add("correct");
                  } else if (j <= t) {
                    bubble.classList.add("incorrect");
                  } else {
                    bubble.classList.add("unanswered");
                  }
                  
                  qe.appendChild(bubble);
                }
              }

              // Gắn sự kiện cho nút "XEM ĐÁP ÁN" của từng phân môn
              const detailBtn = document.getElementById(`result-modal-detail-btn-${i}`);
              if (detailBtn) {
                detailBtn.onclick = () => {
                  modal.hidden = true;
                  let page = "exam-math.html";
                  if (i === 2) page = "exam-reading.html";
                  if (i === 3) page = "exam-science.html";
                  launchExamShell(`${page}?exam=${examCode}&mode=solution`);
                };
              }
            });

            // Thời gian hoàn thành
            const submissionDate = new Date(result.created_at);
            const pad = (n) => String(n).padStart(2, '0');
            const timeEl = document.getElementById("result-modal-time-text");
            if (timeEl) timeEl.textContent = `${pad(submissionDate.getHours())}:${pad(submissionDate.getMinutes())}:${pad(submissionDate.getSeconds())} | ${pad(submissionDate.getDate())}/${pad(submissionDate.getMonth()+1)}/${submissionDate.getFullYear()}`;

          } else {
            showNoScore();
          }
        }
        
        function showNoScore() {
          const scoreEl = document.getElementById("result-modal-score");
          if (scoreEl) scoreEl.textContent = "--/100";
          const circleEl = document.getElementById("result-modal-circle-progress");
          if (circleEl) circleEl.style.strokeDashoffset = "515";

          let label1 = "Tư duy Toán học", label2 = "Tư duy Đọc hiểu", label3 = "Tư duy Khoa học";
          if (category === "Bài thi HSA") { label1 = "Định lượng (Toán)"; label2 = "Định tính (Văn)"; label3 = "Khoa học (Lý/Hóa...)"; }
          else if (category === "Bài thi THPTQG") { label1 = "Toán học"; label2 = "Ngữ văn"; label3 = "Môn tự chọn"; }

          [[1,label1,"0/40"],[2,label2,"0/20"],[3,label3,"0/40"]].forEach(([i,lbl,cnt]) => {
            const el = document.getElementById(`result-modal-subject-label-${i}`);
            if (el) el.textContent = lbl;
            const ce = document.getElementById(`result-modal-subject-count-text-${i}`);
            if (ce) ce.textContent = cnt;
            const be = document.getElementById(`result-modal-subject-bar-${i}`);
            if (be) be.style.width = "0%";
            const se = document.getElementById(`result-modal-subject-status-${i}`);
            if (se) { se.textContent = "--"; se.style.background = "transparent"; }
            const qe = document.getElementById(`result-modal-subject-questions-${i}`);
            if (qe) qe.innerHTML = "";
          });

          const timeEl = document.getElementById("result-modal-time-text");
          if (timeEl) timeEl.textContent = "--:--:-- | --/--/----";
        }

        // Tiêu đề
        const titleEl = document.getElementById("result-modal-title");
        if (titleEl) titleEl.textContent = examTitle || "Bài thi TSA";

        // Nút quay lại
        const backLink = document.getElementById("result-back-to-history");
        if (backLink) backLink.onclick = (e) => {
          e.preventDefault();
          modal.hidden = true;
          exitFullscreenIfActive();
        };

        // Nút xem đáp án
        const redoBtn = document.getElementById("result-redo-exam-btn");
        if (redoBtn) {
          redoBtn.onclick = () => {
            modal.hidden = true;
            let redirectUrl = `exam-math.html?exam=${examCode}&mode=solution`;
            if (category === "Bài thi HSA") {
              redirectUrl = `exam-reading.html?exam=${examCode}&mode=solution`;
            } else if (category === "Bài thi THPTQG" || category === "Bài thi VACT" || category === "Bài thi QDA") {
              redirectUrl = `exam-science.html?exam=${examCode}&mode=solution`;
            }
            launchExamShell(redirectUrl);
          };
        }
        
        if (attempts.length > 0) {
          if (selectEl) {
            selectEl.innerHTML = "";
            attempts.forEach((att, idx) => {
              const opt = document.createElement("option");
              opt.value = idx;
              const d = new Date(att.created_at);
              const pad = (n) => String(n).padStart(2, '0');
              const dateStr = isNaN(d.getTime()) ? "" : `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
              opt.textContent = `Lần làm bài ${idx + 1} (${dateStr})`;
              selectEl.appendChild(opt);
            });
            
            let selectedIdx = attempts.length - 1;
            if (targetAttemptId) {
              const foundIdx = attempts.findIndex(att => 
                String(att.id) === String(targetAttemptId) || 
                String(att.created_at) === String(targetAttemptId)
              );
              if (foundIdx !== -1) {
                selectedIdx = foundIdx;
              }
            }
            
            if (attempts.length <= 1) {
              // Hide dropdown if there is only 1 attempt in total
              selectEl.style.display = "none";
            } else {
              // Show dropdown for multiple attempts
              selectEl.style.display = "inline-block";
            }
            selectEl.value = selectedIdx;
            
            selectEl.onchange = function() {
              const selectedIdx = parseInt(this.value, 10);
              displayAttempt(attempts[selectedIdx]);
            };
            displayAttempt(attempts[selectedIdx]);
          } else {
            displayAttempt(attempts[attempts.length - 1]);
          }
        } else {
          if (selectEl) {
            selectEl.style.display = "none";
          }
          showNoScore();
        }
        
        modal.hidden = false;
        modal.style.opacity = "0";
        modal.style.transition = "opacity 0.25s ease";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            modal.style.opacity = "1";
          });
        });
      };
      
      function closeResultModalFunc() {
        if (resultModal) {
          resultModal.style.transition = "opacity 0.2s ease";
          resultModal.style.opacity = "0";
          setTimeout(() => {
            resultModal.hidden = true;
          }, 200);
        }
      }
      
      document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
          const certModal = document.getElementById("cert-image-modal");
          if (certModal && !certModal.hidden) {
            certModal.hidden = true;
          } else if (resultModal && !resultModal.hidden) {
            closeResultModalFunc();
          }
        }
      });

      // Conditional Routing & Layouts
      function getActiveRoute() {
        const path = window.location.pathname;
        const hash = window.location.hash.substring(1);
        
        if (path === "/tai-lieu" || hash === "tai-lieu" || hash === "documents" || ["tsa-documents", "hsa-documents", "thpt-documents"].includes(hash)) {
          return "tai-lieu";
        }
        return "homepage";
      }

      function handleRouting() {
        const route = getActiveRoute();
        const shellContainer = document.querySelector(".tsa-shell");
        
        if (route === "tai-lieu") {
          if (shellContainer) shellContainer.classList.add("hide-sidebar");
          switchTab("documents");
        } else {
          const hash = window.location.hash.substring(1);
          if (shellContainer) {
            if (["history", "account"].includes(hash)) {
              shellContainer.classList.add("hide-sidebar");
            } else {
              shellContainer.classList.remove("hide-sidebar");
            }
          }
          if (hash && hash !== "tai-lieu" && hash !== "documents" && !["tsa-documents", "hsa-documents", "thpt-documents"].includes(hash)) {
            switchTab(hash);
          } else {
            switchTab("overview");
          }
        }
      }

      function safePushState(state, title, url) {
        if (window.location.protocol !== "file:") {
          try {
            history.pushState(state, title, url);
            return;
          } catch (e) {
            console.error("pushState failed: ", e);
          }
        }
        // Fallback to hash
        if (url === "/tai-lieu") {
          window.location.hash = "tai-lieu";
        } else if (url === "/") {
          window.location.hash = "overview";
        }
      }

      window.addEventListener("popstate", () => {
        handleRouting();
      });

      // Initial route handle
      handleRouting();

      // Helper to log video view event with IP details and check for account sharing (Feature 2)
      async function writeVideoViewLog(studentEmail, lesson, courseTitle) {
        const lessonKey = lesson.id || lesson.title || 'unknown';
        const cacheKey = `tmaTsaLastLoggedVideo_${studentEmail}_${lessonKey}`;
        const lastLogTime = sessionStorage.getItem(cacheKey);
        const now = Date.now();

        if (lastLogTime && (now - parseInt(lastLogTime)) < 600000) {
          console.log(`Video view log for "${lesson.title}" skipped (cached within 10 mins).`);
          return;
        }

        if (!supabaseClient) {
          // Offline fallback
          const key = 'tmaTsaLocalViewLogs';
          const logs = JSON.parse(localStorage.getItem(key) || "[]");
          logs.push({
            id: 'mock-log-' + Date.now(),
            user_email: studentEmail,
            lesson_title: lesson.title,
            course_title: courseTitle,
            viewed_at: new Date().toISOString(),
            ip_address: '127.0.0.1 (Offline)',
            user_agent: navigator.userAgent
          });
          localStorage.setItem(key, JSON.stringify(logs));
          
          sessionStorage.setItem(cacheKey, now.toString());
          return;
        }

        let ip = 'Unknown IP';
        try {
          // Fetch IP with 2 seconds timeout to keep page responsive
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const ipRes = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            ip = ipData.ip || 'Unknown IP';
          }
        } catch (ipErr) {
          console.warn("Could not fetch IP, writing log with fallback IP:", ipErr);
        }

        try {
          await supabaseClient
            .from('video_view_logs')
            .insert({
              user_email: studentEmail,
              lesson_id: lesson.id,
              lesson_title: lesson.title,
              course_title: courseTitle,
              ip_address: ip,
              user_agent: navigator.userAgent
            });
          
          sessionStorage.setItem(cacheKey, now.toString());
        } catch (logErr) {
          console.warn("Failed to write video view log to Supabase:", logErr);
        }
      }

                async function syncEnrollmentsFromDatabase() {
        if (!studentInfo || !supabaseClient) return;
        try {
          const studentCode = studentInfo.email || studentInfo.username;
          const { data: dbEnrollments, error: enrollError } = await supabaseClient
            .from('enrollments')
            .select('course_id')
            .eq('user_email', studentCode);
          if (!enrollError && dbEnrollments) {
            const enrolledCourseIds = dbEnrollments.map(e => e.course_id);
            const key = "tmaTsaRegisteredCourses_" + studentInfo.username;
            localStorage.setItem(key, JSON.stringify(enrolledCourseIds));
            renderExamRoomCourses();
            renderOverviewCourses();
          }
        } catch (e) {
          console.warn("Failed to sync enrollments from database:", e);
        }
      }

      window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('tmaTsaRegisteredCourses_')) {
          renderExamRoomCourses();
          renderOverviewCourses();
        }
      });

      // ==========================================================================
      // PREMIUM DASHBOARD FUNCTIONS
      // ==========================================================================

      function getVietnameseCurrentDate() {
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const now = new Date();
        const dayName = days[now.getDay()];
        const date = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${dayName} - ${date}/${month}/${year}`;
      }

      window.switchDashboardTab = function(tabName) {
        document.querySelectorAll('.dashboard-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.dashboard-sub-panel').forEach(panel => panel.classList.remove('active'));
        
        // Remove active class from overview-related topbar buttons
        const topbarHome = document.getElementById('topbar-btn-home');
        const topbarComm = document.getElementById('topbar-btn-community');
        if (topbarHome) topbarHome.classList.remove('active');
        if (topbarComm) topbarComm.classList.remove('active');

        if (tabName === 'home') {
          const btn = document.getElementById('dash-btn-home');
          if (btn) btn.classList.add('active');
          const panel = document.getElementById('dash-panel-home');
          if (panel) panel.classList.add('active');
          if (topbarHome) topbarHome.classList.add('active');
        } else {
          const btn = document.getElementById('dash-btn-community');
          if (btn) btn.classList.add('active');
          const panel = document.getElementById('dash-panel-community');
          if (panel) panel.classList.add('active');
          if (topbarComm) topbarComm.classList.add('active');
          // Render cutoff table on community tab display
          if (typeof renderCutoffTable === 'function') renderCutoffTable();
        }
      };

      window.handleConsultingSubmit = function(event) {
        event.preventDefault();
        const name = document.getElementById("consult-name").value;
        const phone = document.getElementById("consult-phone").value;
        const facebook = document.getElementById("consult-facebook").value;
        const className = document.getElementById("consult-class").value;
        const subject = document.getElementById("consult-subject").value;
        const message = document.getElementById("consult-message").value;

        if (typeof showCustomAlert === "function") {
          showCustomAlert("Gửi thông tin tư vấn thành công! Đội ngũ tuyển sinh TMA sẽ liên hệ với bạn sớm nhất.", "success");
        } else {
          alert("Gửi thông tin tư vấn thành công! Đội ngũ tuyển sinh TMA sẽ liên hệ với bạn sớm nhất.");
        }
        event.target.reset();
      };

      window.renderDashboardCourses = function() {
        const container = document.getElementById("dashboard-courses-thumbnails");
        if (!container) return;
        
        container.innerHTML = "";
        if (!COURSES_DATA || COURSES_DATA.length === 0) {
          container.innerHTML = `<div class="no-activity-message">Không có khóa học nào.</div>`;
          return;
        }
        
        COURSES_DATA.forEach(course => {
          let heroImage = "https://assets.tmastudy.io.vn/assets/thpt.png";
          const titleLower = course.title.toLowerCase();
          if (titleLower.includes("tsa")) {
            heroImage = "https://assets.tmastudy.io.vn/assets/anhnen.png";
          } else if (titleLower.includes("lý") || titleLower.includes("physics")) {
            heroImage = "https://assets.tmastudy.io.vn/assets/ly.png";
          }
          
          const item = document.createElement("div");
          item.className = "dashboard-course-thumb-card";
          item.title = course.title;
          item.innerHTML = `
            <img src="${heroImage}" alt="${course.title}">
            <div class="thumb-card-overlay">
              <span>${course.title}</span>
            </div>
          `;
          
          item.addEventListener("click", () => {
            if (typeof openClassroomModal === 'function') {
              openClassroomModal(course.id);
            }
          });
          
          container.appendChild(item);
        });
      };

    
      // Dynamic Social Links update
      function updateSocialLinks() {
        const defaultLinks = {
          facebook: { url: "https://facebook.com/mapstudy", text: "Facebook TMA Study" },
          youtube: { url: "https://youtube.com/c/ThayVuNgocAnh", text: "Youtube TMA Study" },
          tiktok: { url: "https://tiktok.com/@mapstudy", text: "Tiktok TMA Study" },
          messenger: { url: "https://m.me/mapstudy", text: "Messenger TMA Study" }
        };

        let saved = defaultLinks;
        try {
          const localData = localStorage.getItem("tmaTsaSocialLinks");
          if (localData) {
            saved = JSON.parse(localData);
          }
        } catch(e) {}

        const fbEl = document.getElementById("social-link-facebook");
        const fbText = document.getElementById("social-link-facebook-text");
        if (fbEl && saved.facebook) {
          fbEl.href = saved.facebook.url || defaultLinks.facebook.url;
          if (fbText) fbText.textContent = saved.facebook.text || defaultLinks.facebook.text;
        }

        const ytEl = document.getElementById("social-link-youtube");
        const ytText = document.getElementById("social-link-youtube-text");
        if (ytEl && saved.youtube) {
          ytEl.href = saved.youtube.url || defaultLinks.youtube.url;
          if (ytText) ytText.textContent = saved.youtube.text || defaultLinks.youtube.text;
        }

        const tkEl = document.getElementById("social-link-tiktok");
        const tkText = document.getElementById("social-link-tiktok-text");
        if (tkEl && saved.tiktok) {
          tkEl.href = saved.tiktok.url || defaultLinks.tiktok.url;
          if (tkText) tkText.textContent = saved.tiktok.text || defaultLinks.tiktok.text;
        }

        const msgEl = document.getElementById("social-link-messenger");
        const msgText = document.getElementById("social-link-messenger-text");
        if (msgEl && saved.messenger) {
          msgEl.href = saved.messenger.url || defaultLinks.messenger.url;
          if (msgText) msgText.textContent = saved.messenger.text || defaultLinks.messenger.text;
        }
      }

      // Call immediately
      updateSocialLinks();

      // Listen for updates from other tabs
      window.addEventListener('storage', function(e) {
        if (e.key === 'tmaTsaSocialLinks') {
          updateSocialLinks();
        }
      });

    
      // Custom Dropdown UI Initialization
      function initCustomDropdowns() {
        const containers = document.querySelectorAll('.custom-dropdown-container');
        
        containers.forEach(container => {
          const trigger = container.querySelector('.custom-dropdown-trigger');
          const menu = container.querySelector('.custom-dropdown-menu');
          const valueSpan = container.querySelector('.custom-dropdown-value');
          const select = container.querySelector('select');
          const options = container.querySelectorAll('.custom-dropdown-option');

          if (!trigger || !menu || !select) return;

          // Toggle dropdown on trigger click
          trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close all other dropdowns first
            document.querySelectorAll('.custom-dropdown-container').forEach(other => {
              if (other !== container) {
                other.classList.remove('open');
              }
            });
            
            container.classList.toggle('open');
          });

          // Option selection
          options.forEach(opt => {
            opt.addEventListener('click', (e) => {
              e.stopPropagation();
              
              const val = opt.getAttribute('data-value');
              const text = opt.textContent;

              // Update hidden select
              select.value = val;
              // Trigger change event just in case
              select.dispatchEvent(new Event('change'));

              // Update trigger text
              valueSpan.textContent = text;

              // Toggle selected class
              options.forEach(o => o.classList.remove('selected'));
              opt.classList.add('selected');

              // Close dropdown
              container.classList.remove('open');
            });
          });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
          document.querySelectorAll('.custom-dropdown-container').forEach(container => {
            container.classList.remove('open');
          });
        });
      }

      // Initialize on load
      initCustomDropdowns();

      // Helper function to render a document inside an embedded iframe preview
      window.openLibraryDetailView = function(doc) {
        const listView = document.getElementById("library-list-view");
        const detailView = document.getElementById("library-detail-view");
        if (!listView || !detailView) return;

        // Convert Google Drive view URL to embed preview URL
        let embedUrl = doc.url || "";
        if (embedUrl.includes("drive.google.com")) {
          const match = embedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
          }
        }

        // Set titles and metadata
        const breadcrumbTitle = document.getElementById("detail-breadcrumb-title");
        if (breadcrumbTitle) breadcrumbTitle.textContent = doc.title;
        
        const docTitle = document.getElementById("detail-doc-title");
        if (docTitle) docTitle.textContent = doc.title;
        
        const docViews = document.getElementById("detail-doc-views");
        if (docViews) docViews.textContent = doc.views;
        
        const docDate = document.getElementById("detail-doc-date");
        if (docDate) docDate.textContent = doc.date;

        const docSubject = document.getElementById("detail-doc-subject");
        if (docSubject) docSubject.textContent = (doc.subject || "TOÁN").toUpperCase();

        const infoCategory = document.getElementById("detail-info-category");
        if (infoCategory) infoCategory.textContent = doc.subject || "TSA";

        const infoDesc = document.getElementById("detail-info-desc");
        if (infoDesc) infoDesc.textContent = doc.title || "Tài liệu ôn thi thử TSA";

        const downloadBtnTop = document.getElementById("detail-download-btn-top");
        if (downloadBtnTop) {
          downloadBtnTop.onclick = function() {
            window.open(doc.url || "#", "_blank");
          };
        }

        // Set cover image from Drive thumbnail
        const imgEl = document.getElementById("detail-doc-img");
        const imgLinkEl = document.getElementById("detail-doc-img-link");
        if (imgEl && imgLinkEl) {
          const match = doc.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match) {
            const fileId = match[1];
            imgEl.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            imgLinkEl.href = doc.url;
          } else {
            imgEl.src = "assets/pdf-fallback.png";
            imgLinkEl.href = doc.url;
          }
        }
        
        const iframe = document.getElementById("detail-doc-iframe");
        if (iframe) iframe.src = embedUrl;

        // Set tags
        const tagsContainer = document.getElementById("detail-doc-tags");
        if (tagsContainer) {
          tagsContainer.innerHTML = `
            <span class="lib-doc-tag subject">${doc.subject}</span>
            <span class="lib-doc-tag class">${doc.category}</span>
          `;
        }

        // Retrieve student info from localStorage
        let studentNameVal = "Học sinh";
        try {
          const cachedInfo = JSON.parse(localStorage.getItem("studentInfo"));
          if (cachedInfo && cachedInfo.name) {
            studentNameVal = cachedInfo.name;
          }
        } catch (e) {}

        const firstChar = studentNameVal.charAt(0).toUpperCase();
        
        // Update avatar char
        const avatarEl = document.getElementById("comment-avatar");
        if (avatarEl) {
          avatarEl.textContent = firstChar;
        }

        // Update placeholder
        const textareaEl = document.getElementById("comment-textarea");
        if (textareaEl) {
          textareaEl.placeholder = `Viết bình luận dưới tên ${studentNameVal}...`;
          textareaEl.value = ""; // Reset
          textareaEl.oninput = window.updateCommentCharCount;
        }

        const charCountEl = document.getElementById("comment-char-count");
        if (charCountEl) {
          charCountEl.textContent = "0/1000";
        }

        // Toggle visibility
        listView.style.display = "none";
        detailView.style.display = "block";
        
        // Load comments for the document
        if (typeof window.renderDocumentComments === "function") {
          window.renderDocumentComments(doc.title);
        }
        
        // Scroll to top of tab container
        const tabPane = document.getElementById("tab-documents");
        if (tabPane) tabPane.scrollTop = 0;
      };

      // Comments dynamic logic helpers
      window.updateCommentCharCount = function() {
        const textarea = document.getElementById("comment-textarea");
        const countSpan = document.getElementById("comment-char-count");
        if (textarea && countSpan) {
          const len = textarea.value.length;
          countSpan.textContent = len + "/1000";
        }
      };

      window.insertCommentFormat = function(format) {
        const textarea = document.getElementById("comment-textarea");
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        let inserted = "";
        if (format === 'fx') inserted = "$";
        else if (format === '#') inserted = "#";
        else if (format === 'α') inserted = "α";
        else if (format === 'img') inserted = "[img]";
        else if (format === 'clean') {
          textarea.value = "";
          window.updateCommentCharCount();
          return;
        }
        textarea.value = text.substring(0, start) + inserted + text.substring(end);
        textarea.focus();
        textarea.selectionStart = start + inserted.length;
        textarea.selectionEnd = start + inserted.length;
        window.updateCommentCharCount();
      };

      window.renderDocumentComments = function(docTitle) {
        const container = document.getElementById("comments-list-container");
        if (!container) return;

        const key = `tma_doc_comments_${encodeURIComponent(docTitle)}`;
        let comments = [];
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            comments = JSON.parse(saved);
          } else {
            // Default seed comments
            comments = [
              {
                id: "seed-comment-1",
                author: "Trương Quang Huy",
                avatarColor: "#93c5fd",
                avatarTextColor: "#1e3a8a",
                timeText: "1 tháng trước",
                timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
                text: "có giải không ạ",
                replies: []
              }
            ];
            localStorage.setItem(key, JSON.stringify(comments));
          }
        } catch (e) {
          console.error("Error loading comments:", e);
        }

        container.innerHTML = "";

        comments.forEach(comment => {
          const commentEl = document.createElement("div");
          commentEl.style.cssText = "display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; flex-direction: column; width: 100%;";
          
          let repliesHtml = "";
          if (comment.replies && comment.replies.length > 0) {
            repliesHtml = comment.replies.map(reply => {
              const replyFirstChar = reply.author.charAt(0).toUpperCase();
              return `
                <div style="display: flex; gap: 8px; align-items: flex-start; margin-top: 8px; margin-left: 32px; position: relative; width: calc(100% - 32px);">
                  <div style="position: absolute; left: -16px; top: -10px; bottom: 50%; width: 12px; border-left: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; border-bottom-left-radius: 4px;"></div>
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; flex-shrink: 0; text-transform: uppercase; user-select: none;">
                    ${replyFirstChar}
                  </div>
                  <div style="flex: 1; min-width: 0; background: #f8fafc; border-radius: 10px; padding: 8px 12px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                      <span style="font-size: 11.5px; font-weight: 700; color: #334155;">${reply.author}</span>
                      <span style="font-size: 9px; color: #94a3b8;">${reply.timeText || "Vừa xong"}</span>
                    </div>
                    <div style="font-size: 11.5px; color: #1e293b; line-height: 1.4;">${reply.text}</div>
                  </div>
                </div>
              `;
            }).join("");
          }

          const commentFirstChar = comment.author.charAt(0).toUpperCase();
          const docTitleEncoded = encodeURIComponent(docTitle);

          commentEl.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: flex-start; width: 100%;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${comment.avatarColor || '#93c5fd'}; color: ${comment.avatarTextColor || '#1e3a8a'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; text-transform: uppercase; user-select: none;">
                ${commentFirstChar}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="background: #eff6ff; border-radius: 12px; padding: 10px 14px; border: 1px solid #dbeafe;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <span style="font-size: 12.5px; font-weight: 700; color: #1e3a8a;">${comment.author}</span>
                    <span style="font-size: 10px; color: #94a3b8;">${comment.timeText}</span>
                  </div>
                  <div style="font-size: 12.5px; color: #1e293b; line-height: 1.4;">${comment.text}</div>
                </div>
                <div style="margin-top: 2px; padding-left: 6px; display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 11px; color: #0f5a9e; font-weight: 700; cursor: pointer;" onclick="window.showDocReplyInput('${comment.id}', '${docTitleEncoded}')">Trả lời</span>
                </div>
                
                <div id="doc-replies-list-${comment.id}" style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px; width: 100%;">
                  ${repliesHtml}
                </div>
                
                <div id="doc-reply-input-wrap-${comment.id}" style="width: 100%;"></div>
              </div>
            </div>
          `;

          container.appendChild(commentEl);
        });
      };

      window.showDocReplyInput = function(commentId, docTitleEncoded) {
        document.querySelectorAll(".doc-reply-input-box-wrapper").forEach(el => el.remove());

        const wrap = document.getElementById(`doc-reply-input-wrap-${commentId}`);
        if (!wrap) return;

        let studentName = "Học sinh";
        try {
          const cachedInfo = JSON.parse(localStorage.getItem("studentInfo"));
          if (cachedInfo && cachedInfo.name) {
            studentName = cachedInfo.name;
          }
        } catch (e) {}
        const initials = studentName.charAt(0).toUpperCase();

        const inputHtml = `
          <div class="doc-reply-input-box-wrapper" style="display: flex; gap: 8px; align-items: center; margin-top: 8px; margin-left: 32px; animation: fadeInReply 0.2s ease; width: calc(100% - 32px);">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0f5a9e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; flex-shrink: 0; text-transform: uppercase;">
              ${initials}
            </div>
            <div style="flex: 1; display: flex; align-items: center; background: #f1f3f5; border-radius: 20px; padding: 4px 10px; gap: 6px; box-sizing: border-box; border: 1px solid #cbd5e1;">
              <input type="text" id="doc-reply-textarea-${commentId}" placeholder="Phản hồi..." style="flex: 1; border: none; background: transparent; outline: none; font-size: 12px; color: #1e293b; font-family: 'Inter', sans-serif; padding: 2px 0; margin: 0; box-sizing: border-box; width: 100%;" onkeyup="if(event.key === 'Enter') window.submitDocReply('${commentId}', '${docTitleEncoded}')">
            </div>
            <button onclick="window.submitDocReply('${commentId}', '${docTitleEncoded}')" style="background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#0f5a9e"><path d="M2 21l21-9L2 3v7l15 2-15 2z"></path></svg>
            </button>
          </div>
        `;
        wrap.innerHTML = inputHtml;
        
        const inputEl = document.getElementById(`doc-reply-textarea-${commentId}`);
        if (inputEl) inputEl.focus();
      };

      window.submitDocReply = function(commentId, docTitleEncoded) {
        const docTitle = decodeURIComponent(docTitleEncoded);
        const inputEl = document.getElementById(`doc-reply-textarea-${commentId}`);
        if (!inputEl || !inputEl.value.trim()) return;

        const replyText = inputEl.value.trim();
        const key = `tma_doc_comments_${encodeURIComponent(docTitle)}`;
        
        let comments = [];
        try {
          const saved = localStorage.getItem(key);
          if (saved) comments = JSON.parse(saved);
        } catch (e) {}

        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          let studentName = "Học sinh";
          try {
            const cachedInfo = JSON.parse(localStorage.getItem("studentInfo"));
            if (cachedInfo && cachedInfo.name) {
              studentName = cachedInfo.name;
            }
          } catch (e) {}

          if (!comment.replies) comment.replies = [];
          
          comment.replies.push({
            author: studentName,
            text: replyText,
            timeText: "Vừa xong",
            timestamp: Date.now()
          });

          localStorage.setItem(key, JSON.stringify(comments));
          window.renderDocumentComments(docTitle);
        }
      };

      window.submitCommentClick = function() {
        const textarea = document.getElementById("comment-textarea");
        if (!textarea || !textarea.value.trim()) return;

        const docTitle = document.getElementById("detail-doc-title") ? document.getElementById("detail-doc-title").textContent : "Tài liệu";
        const text = textarea.value.trim();

        let studentName = "Học sinh";
        try {
          const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
          if (studentInfo && studentInfo.name) {
            studentName = studentInfo.name;
          }
        } catch (e) {}

        const key = `tma_doc_comments_${encodeURIComponent(docTitle)}`;
        let comments = [];
        try {
          const saved = localStorage.getItem(key);
          if (saved) comments = JSON.parse(saved);
        } catch (e) {}

        const randomId = "doc-comment-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        comments.push({
          id: randomId,
          author: studentName,
          avatarColor: "#ec4899",
          avatarTextColor: "#ffffff",
          timeText: "Vừa xong",
          timestamp: Date.now(),
          text: text,
          replies: []
        });

        localStorage.setItem(key, JSON.stringify(comments));
        window.renderDocumentComments(docTitle);

        textarea.value = "";
        window.updateCommentCharCount();
      };

      window.closeLibraryDetailView = function() {
        const listView = document.getElementById("library-list-view");
        const detailView = document.getElementById("library-detail-view");
        if (!listView || !detailView) return;

        // Clear iframe source to stop loading/video
        const iframe = document.getElementById("detail-doc-iframe");
        if (iframe) iframe.src = "";

        // Toggle visibility
        listView.style.display = "block";
        detailView.style.display = "none";
      };

      window.navigateToLibrary = function() {
        if (window.closeLibraryDetailView) {
          window.closeLibraryDetailView();
        }
        window.location.hash = "tai-lieu";
        if (window.switchTab) {
          window.switchTab("documents");
        }
      };

      window.navigateToHome = function() {
        if (window.closeLibraryDetailView) {
          window.closeLibraryDetailView();
        }
        window.location.hash = "overview";
        if (window.switchTab) {
          window.switchTab("overview");
        }
        if (window.switchDashboardTab) {
          window.switchDashboardTab("home");
        }
      };

    })();