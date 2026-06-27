(() => {
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
        if (el) el.addEventListener("click", () => { if (resultModal) resultModal.hidden = true; });
      });

      if (certModal && closeCertBtn && certBackdrop) {
        [closeCertBtn, certBackdrop].forEach(el => {
          el.addEventListener("click", () => certModal.hidden = true);
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
            <div style="width:min(480px,100%);background:#fff;color:#0f172a;border:2px solid #c1121f;border-radius:16px;padding:32px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.3);">
              <h2 style="margin:0 0 12px;color:#c1121f;font-size:20px;font-weight:800;">YÊU CẦU TOÀN MÀN HÌNH</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">Bài thi đang diễn ra trong chế độ toàn màn hình. Vui lòng bấm nút bên dưới để tiếp tục làm bài.</p>
              <button id="exam-shell-fullscreen-btn" type="button" style="width:100%;height:48px;border:0;border-radius:10px;background:#c1121f;color:#fff;font-size:16px;font-weight:800;cursor:pointer;">Tiếp tục toàn màn hình</button>
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
            "opacity:1","transition:opacity 0.45s ease, filter 0.45s ease","font-family:'Times New Roman',serif"
          ].join(";");
          loadingOverlay.innerHTML = `
            <style>
              @keyframes esl-brandFadeIn{from{opacity:0;transform:scale(.95);filter:blur(5px)}to{opacity:1;transform:scale(1);filter:blur(0)}}
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

        // Khi iframe load xong: ẩn overlay, hiện iframe (tối thiểu 2 giây)
        const overlayShowStart = Date.now();
        function onFrameReady() {
          frame.removeEventListener("load", onFrameReady);
          const elapsed = Date.now() - overlayShowStart;
          const remaining = Math.max(0, 2000 - elapsed);
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
        if (shell) shell.remove();

        document.body.style.overflow = "";

        sessionStorage.removeItem("tsaShouldFullscreen");
        sessionStorage.removeItem("tsaFullscreenStarted");

        // Thoát toàn màn hình nếu đang bật — sau khi nộp bài không cần full màn nữa.
        if (isRootFullscreen()) {
          const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
          if (exit) {
            try { Promise.resolve(exit.call(document)).catch(() => {}); } catch (error) {}
          }
        }
      }

      window.addEventListener("message", (event) => {
        if (event && event.data && event.data.type === "tsa-exam-finished") {
          closeExamShell();
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

      // ─── FULL CALENDAR ENGINE ──────────────────────────────────────────
      const CAL_START_HOUR = 7;  // trục giờ: 7:00 → 23:00
      const CAL_END_HOUR   = 23;
      const PX_PER_HOUR    = 80; // pixels mỗi giờ
      const DAY_NAMES_VN   = ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
      const MONTHS_VN      = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                               'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

      // Sự kiện học (dayOfWeek: 0=CN,1=T2,...,6=T7; startH/startM; endH/endM)
      const CAL_EVENTS = [
        { id:1, title:'Toán tư duy nâng cao', type:'Toán học', teacher:'Thầy Phạm Hùng',
          room:'Zoom ID: 888 999 666', dayOfWeek:1, startH:19, startM:30, endH:21, endM:30,
          color:'rgba(255, 237, 213, 0.85)', accent:'#ea580c', textColor:'#7c2d12' },
        { id:2, title:'Đọc hiểu ngữ văn TSA', type:'Ngữ Văn', teacher:'Cô Linh Trang',
          room:'Zoom ID: 888 999 666', dayOfWeek:4, startH:19, startM:30, endH:21, endM:30,
          color:'rgba(255, 228, 230, 0.85)', accent:'#e11d48', textColor:'#4c0519' },
        { id:3, title:'Luyện đề TSA tổng hợp', type:'Luyện thi', teacher:'Thầy Nguyễn Tuấn',
          room:'Zoom ID: 777 888 999', dayOfWeek:6, startH:8, startM:0, endH:10, endM:30,
          color:'rgba(254, 226, 226, 0.85)', accent:'#dc2626', textColor:'#7f1d1d' },
      ];

      let calActiveEvent = null;

      window.openTimetableModal = function(id) {
        const ev = CAL_EVENTS.find(e => e.id === id);
        if (!ev) return;
        const daysName = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dateStr = daysName[ev.dayOfWeek] + ' hàng tuần';
        openCalModal(ev, dateStr);
      };

      function openCalModal(ev, dateStr) {
        calActiveEvent = ev;
        document.getElementById('cal-modal-title').textContent   = ev.title;
        document.getElementById('cal-modal-type').textContent    = ev.type;
        document.getElementById('cal-modal-time').textContent    =
          ev.startH.toString().padStart(2,'0')+':'+ev.startM.toString().padStart(2,'0')+' – '+
          ev.endH.toString().padStart(2,'0')+':'+ev.endM.toString().padStart(2,'0');
        document.getElementById('cal-modal-teacher').textContent = ev.teacher;
        document.getElementById('cal-modal-room').textContent    = ev.room;
        document.getElementById('cal-modal-date').textContent    = dateStr;
        const calModalBanner = document.getElementById('cal-modal-banner');
        if (calModalBanner) calModalBanner.style.background = `linear-gradient(90deg, ${ev.accent}, ${ev.color})`;
        const modal = document.getElementById('cal-event-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
      window.closeCalModal = function() {
        document.getElementById('cal-event-modal').style.display = 'none';
        document.body.style.overflow = '';
      };
      window.joinCalClass = function() {
        if (calActiveEvent) {
          const zoomId = calActiveEvent.room.replace(/[^0-9 ]/g,'').trim();
          alert('Đang kết nối phòng học...\n' + calActiveEvent.room + '\nMở Zoom và nhập ID: ' + zoomId);
        }
      };

      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCalModal(); });

      // Khởi tạo Supabase Client từ cấu hình dùng chung
      let supabaseClient = null;
      let supabaseUrl = '';
      let supabaseStorageUrl = '';
      if (typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
        supabaseUrl = window.SUPABASE_CONFIG.url;
        supabaseClient = supabase.createClient(supabaseUrl, window.SUPABASE_CONFIG.anonKey);
        supabaseStorageUrl = `${supabaseUrl}/storage/v1/object/public/exams/`;
      }

      let studentInfo = null;
      try {
        studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "null");
      } catch (error) {
        studentInfo = null;
      }

      /* Giữ giống logic cũ: chưa đăng nhập thì quay về login.html */
      if (!studentInfo) {
        window.location.href = "login.html";
        return;
      }

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

      function updateAccountUI() {
        if (!studentInfo) return;
        const displayName = studentInfo.name || studentInfo.username || studentInfo.email || "Tài khoản test";
        
        document.getElementById("student-display-name").textContent = displayName;
        document.getElementById("logout-display-name").textContent = displayName;
        
        const welcomeStudentName = document.getElementById("welcome-student-name");
        if (welcomeStudentName) welcomeStudentName.textContent = displayName;

        const accountStudentName = document.getElementById("account-student-name");
        if (accountStudentName) accountStudentName.textContent = displayName;
        
        const accountStudentSub = document.getElementById("account-student-sub");
        if (accountStudentSub) {
          accountStudentSub.textContent = studentInfo.className ? `${studentInfo.className} · ${studentInfo.school || "TMA TSA"}` : "Lớp chuyên sâu TSA 2026";
        }

        // Detailed profile fields
        document.getElementById("account-full-name").textContent = studentInfo.name || "Chưa cập nhật";
        document.getElementById("account-cccd").textContent = studentInfo.cccd || "Chưa cập nhật";
        document.getElementById("account-dob").textContent = studentInfo.dob ? formatDate(studentInfo.dob) : "Chưa cập nhật";
        document.getElementById("account-gender").textContent = studentInfo.gender || "Chưa cập nhật";
        document.getElementById("account-phone").textContent = studentInfo.phone || "Chưa cập nhật";
        document.getElementById("account-email").textContent = studentInfo.email || "Chưa cập nhật";
        document.getElementById("account-school").textContent = studentInfo.school || "Chưa cập nhật";
        document.getElementById("account-class").textContent = studentInfo.className || "Chưa cập nhật";

        // Format address: street, ward, district, province
        const addrParts = [];
        if (studentInfo.street) addrParts.push(studentInfo.street);
        if (studentInfo.ward) addrParts.push(studentInfo.ward);
        if (studentInfo.district) addrParts.push(studentInfo.district);
        if (studentInfo.province) addrParts.push(studentInfo.province);
        document.getElementById("account-address").textContent = addrParts.join(", ") || "Chưa cập nhật";
      }

      // KHO TÀI LIỆU INTEGRATION
      const MATERIAL_LINKS_KEY = "tmaTsaDriveLinks";
      const materials = [
        // TSA
        { title: "Đề TSA số 01", category: "TSA", index: 0 },
        { title: "Đề TSA số 02", category: "TSA", index: 1 },
        { title: "Đề TSA số 03", category: "TSA", index: 2 },
        { title: "Đề TSA số 04", category: "TSA", index: 3 },
        { title: "Đề TSA số 05", category: "TSA", index: 4 },
        { title: "Đề TSA số 06", category: "TSA", index: 5 },
        // HSA
        { title: "Đề HSA số 01", category: "HSA", index: 6 },
        { title: "Đề HSA số 02", category: "HSA", index: 7 },
        { title: "Đề HSA số 03", category: "HSA", index: 8 },
        { title: "Đề HSA số 04", category: "HSA", index: 9 },
        // THPTQG
        { title: "Đề THPTQG số 01", category: "THPT", index: 10 },
        { title: "Đề THPTQG số 02", category: "THPT", index: 11 },
        { title: "Đề THPTQG số 03", category: "THPT", index: 12 },
        { title: "Đề THPTQG số 04", category: "THPT", index: 13 }
      ];

      function loadMaterialLinks() {
        try {
          const saved = JSON.parse(localStorage.getItem(MATERIAL_LINKS_KEY) || "{}");
          return saved && typeof saved === "object" ? saved : {};
        } catch {
          return {};
        }
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

      function createMaterialPreview(driveUrl, index) {
        const preview = document.createElement("div");
        preview.className = "document-preview";

        const thumbnailUrl = getDriveThumbnailUrl(driveUrl);
        if (thumbnailUrl) {
          const img = document.createElement("img");
          img.src = thumbnailUrl;
          img.alt = `Đề số ${String(index + 1).padStart(2, "0")}`;
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
        const driveLinks = loadMaterialLinks();

        const filtered = materials.filter(m => m.category === currentMaterialCategory.toUpperCase());

        filtered.forEach((material) => {
          const driveUrl = String(driveLinks[material.index] || "").trim();
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

          const preview = createMaterialPreview(driveUrl, material.index);
          link.appendChild(preview);
          card.appendChild(link);
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
                cover_image: course.category === "THPT" ? "assets/thpt.png" : "assets/anhnen.png",
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

            if (course.id === "thpt-math-luyen-de") {
              await supabaseClient.from('activation_codes').insert({
                code: "123",
                course_id: courseId,
                max_uses: 9999,
                used_count: 0,
                active: true
              });
            }
          }
          console.log("Seeding Supabase completed successfully!");
        } catch (seedErr) {
          console.error("Failed to seed database:", seedErr);
        }
      }

      async function loadCoursesAndEnrollments() {
        if (!supabaseClient) {
          console.log("No supabaseClient. Running local mockup mode.");
          COURSES_DATA = [...MOCK_COURSES_DEFAULTS];
          return;
        }

        const studentCode = studentInfo?.code || studentInfo?.phone || studentInfo?.email || "test";

        try {
          const { data: dbCourses, error: courseError } = await supabaseClient
            .from('courses')
            .select('*');

          if (courseError) throw courseError;

          if (!dbCourses || dbCourses.length === 0) {
            await seedSupabaseDatabase();
            const { data: reFetchedCourses } = await supabaseClient.from('courses').select('*');
            COURSES_DATA = reFetchedCourses || [];
          } else {
            COURSES_DATA = [];
            for (const c of dbCourses) {
              const { data: dbLessons } = await supabaseClient
                .from('lessons')
                .select('*')
                .eq('course_id', c.id)
                .order('order_index', { ascending: true });

              COURSES_DATA.push({
                id: c.id,
                title: c.title,
                subheading: c.description || "",
                desc: c.description || "",
                author: c.teacher || "Trần Hoàng Anh",
                category: c.category || "TSA",
                lessons: dbLessons || [],
                progress: 33
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

        } catch (err) {
          console.warn("Supabase fetch error. Falling back to local mode:", err.message || err);
          COURSES_DATA = [...MOCK_COURSES_DEFAULTS];
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
          return { className: "cover-qda", image: "assets/qda.png" };
        }

        if (searchable.includes("vat ly") || searchable.includes("physics") || /\bly\b/.test(searchable)) {
          return { className: "cover-physics", image: "assets/ly.png" };
        }

        if (searchable.includes("tsa")) {
          return { className: "cover-tsa", image: "assets/anhnen.png" };
        }

        return { className: "cover-default", image: "assets/anhnen.png" };
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
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 20px 0; border: none; background: transparent; width: 100%;";
            emptyCard.innerHTML = `
              <img src="assets/core.png" alt="Chưa tham gia khóa học nào" style="max-width: 720px; width: 100%; height: auto; display: block; margin: 0 auto;" />
            `;
          } else {
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 40px; border: 1px solid var(--border); border-radius: 12px; background: #ffffff; color: var(--muted); width: 100%;";
            emptyCard.innerHTML = `
              <p style="font-size: 14px; font-weight: 600; color: var(--text);">Không tìm thấy khóa học nào</p>
              <p style="font-size: 12px; margin-top: 4px;">Các khóa học đang được cập nhật.</p>
            `;
          }
          grid.appendChild(emptyCard);
          return;
        }

        filtered.forEach((course, idx) => {
          const isRegistered = registeredIds.includes(course.id);
          const card = document.createElement("article");
          card.className = "course-card";
          card.style.setProperty("--delay", `${idx * 80}ms`);
          card.style.cursor = "pointer";

          let heroImage = "assets/thpt.png";
          const titleLower = course.title.toLowerCase();
          if (titleLower.includes("tsa")) {
            heroImage = "assets/anhnen.png";
          } else if (titleLower.includes("lý") || titleLower.includes("physics")) {
            heroImage = "assets/ly.png";
          }

          const actionBtn = isRegistered
            ? `<button type="button" class="enter-btn enter-class-btn" style="border:none; cursor:pointer; background:#22c55e;">Vào học</button>`
            : `<button type="button" class="enter-btn enter-class-btn" style="border:none; cursor:pointer; background:#64748b;">Chi tiết</button>`;

          card.innerHTML = `
            <div class="course-hero" style="background-image: url('${heroImage}')"></div>
            <div class="course-body">
              <h3 class="course-name">${course.title}</h3>
              <p class="course-desc">${course.label || course.category}</p>
              <div class="divider"></div>
              <div class="course-footer">
                <div class="lesson-count">
                  <span class="book-icon"></span>
                  <span>${course.lessons?.length || 33} bài học</span>
                </div>
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
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 20px 0; border: none; background: transparent; width: 100%;";
            emptyCard.innerHTML = `
              <img src="assets/core.png" alt="Chưa tham gia khóa học nào" style="max-width: 720px; width: 100%; height: auto; display: block; margin: 0 auto;" />
            `;
          } else {
            emptyCard.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 40px; border: 1px solid var(--border); border-radius: 12px; background: #ffffff; color: var(--muted); width: 100%;";
            emptyCard.innerHTML = `
              <p style="font-size: 14px; font-weight: 600; color: var(--text);">Không tìm thấy khóa học nào</p>
              <p style="font-size: 12px; margin-top: 4px;">Các khóa học đang được cập nhật.</p>
            `;
          }
          grid.appendChild(emptyCard);
          return;
        }

        filtered.forEach((course, idx) => {
          const isRegistered = registeredIds.includes(course.id);
          const card = document.createElement("article");
          card.className = "course-card";
          card.style.setProperty("--delay", `${idx * 80}ms`);
          card.style.cursor = "pointer";

          let heroImage = "assets/thpt.png";
          const titleLower = course.title.toLowerCase();
          if (titleLower.includes("tsa")) {
            heroImage = "assets/anhnen.png";
          } else if (titleLower.includes("lý") || titleLower.includes("physics")) {
            heroImage = "assets/ly.png";
          }

          const actionBtn = isRegistered
            ? `<button type="button" class="enter-btn enter-class-btn" style="border:none; cursor:pointer; background:#22c55e;">Vào học</button>`
            : `<button type="button" class="enter-btn enter-class-btn" style="border:none; cursor:pointer; background:#64748b;">Chi tiết</button>`;

          card.innerHTML = `
            <div class="course-hero" style="background-image: url('${heroImage}')"></div>
            <div class="course-body">
              <h3 class="course-name">${course.title}</h3>
              <p class="course-desc">${course.label || course.category}</p>
              <div class="divider"></div>
              <div class="course-footer">
                <div class="lesson-count">
                  <span class="book-icon"></span>
                  <span>${course.lessons?.length || 33} bài học</span>
                </div>
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

          const studentCode = studentInfo?.code || studentInfo?.phone || studentInfo?.email || "test";
          const registeredIds = getRegisteredCourseIds();
          const isRegistered = registeredIds.includes(courseId);

          // Update topbar with course name
          const topbarLessonLabel = document.getElementById("study-topbar-lesson-name");
          if (topbarLessonLabel) topbarLessonLabel.textContent = course.title;
          document.getElementById("course-player-cover-text").textContent = course.title;

          // Dynamically bind topbar student name
          const topbarStudentNameEl = document.getElementById("study-topbar-student-name");
          if (topbarStudentNameEl) {
            topbarStudentNameEl.textContent = studentInfo?.name || studentInfo?.username || "học sinh";
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
            });
          });

          // Reset player
          document.getElementById("course-player-cover").style.display = "flex";
          const iframe = document.getElementById("course-video-iframe");
          iframe.style.display = "none";
          iframe.src = "";
          stopWatermark();

          // Hide lesson info bar
          const infoBar = document.getElementById("study-lesson-info-bar");
          if (infoBar) infoBar.style.display = "none";

          const controlsBar = document.getElementById("player-controls-bar");
          const completeBtn = document.getElementById("lesson-complete-toggle-btn");
          if (controlsBar) controlsBar.style.display = "none";

          const courseModalActivationBtn = document.getElementById("course-modal-activation-btn");

          let activeLessonId = null;

          async function loadProgressAndRender() {
            let completedLessonIds = [];
            try {
              if (supabaseClient) {
                const { data: dbProgress } = await supabaseClient
                  .from('lesson_progress').select('lesson_id').eq('user_email', studentCode);
                completedLessonIds = (dbProgress || []).map(p => p.lesson_id);
              } else {
                const key = `tmaTsaLessonProgress_${studentInfo.username}`;
                completedLessonIds = JSON.parse(localStorage.getItem(key) || "[]");
              }
            } catch (err) {
              const key = `tmaTsaLessonProgress_${studentInfo.username}`;
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
              const t = title.toLowerCase();
              if (t.startsWith("phần") || t.startsWith("phan") || t.match(/^p\d/)) return "phan";
              if (t.startsWith("tài liệu") || t.startsWith("tai lieu") || t.startsWith("file")) return "document";
              if (t.startsWith("thi online") || t.startsWith("bài tập kiểm tra") || t.startsWith("bài kiểm tra")) return "test";
              return "bai"; // default = main lesson (Bài X)
            }

            // Helper: get parent bai key from title like "Phần 2.1" -> "2"
            function getParentBaiNum(title) {
              const m = title.match(/ph[aầ]n\s*(\d+)\.(\d+)/i) || title.match(/p(\d+)\.(\d+)/i);
              return m ? m[1] : null;
            }

            // Group by chapter
            const chapters = {};
            const chapterOrder = [];
            lessonsArray.forEach(lesson => {
              const chName = lesson.chapter_name || "Chương 1: Bài học cơ bản";
              if (!chapters[chName]) { chapters[chName] = []; chapterOrder.push(chName); }
              chapters[chName].push(lesson);
            });

            // SVG icons
            const SVG_PLAY = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="none" stroke="currentColor" stroke-width="1.8"></polygon></svg>`;
            const SVG_CHECK = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12.5 11 15.5 16.5 8.5"></polyline></svg>`;
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

                // Remove active class from all kinds of sidebar items
                lessonsList.querySelectorAll(".tree-bai-row, .tree-phan-row, .tree-standalone-row").forEach(item => item.classList.remove("active"));
                el.classList.add("active");



                document.getElementById("course-player-cover").style.display = "none";
                iframe.style.display = "block";

                if (isRegistered && completeBtn) {
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
                                  } else {
                                    iframe.src = `https://drive.google.com/file/d/${videoId || "17l2lP"}/preview`;
                                  }
                                  
                                  startWatermark(studentInfo.name || studentInfo.username || "Học sinh", studentInfo.phone);
                                  
                                  // Write video view log (Feature 2)
                                  writeVideoViewLog(studentCode, lesson, course.title);
                                } else {
                                  iframe.src = lesson.doc_link || "https://example.com/mock-doc.pdf";
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
                const type = getLessonType(lesson.title);
                if (type === "phan") {
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
                  baiRow.className = "tree-bai-row" + (activeLessonId === lesson.id ? " active" : "") + (isRegistered && isCompleted ? " completed-row" : "");

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
                  } else if (isRegistered && isCompleted) {
                    rightEl.innerHTML = SVG_CHECK;
                  }

                  baiRow.appendChild(toggleEl);
                  baiRow.appendChild(iconEl);
                  baiRow.appendChild(labelEl);
                  baiRow.appendChild(rightEl);
                  chapterBody.appendChild(baiRow);

                  // Sub-list for phans
                  const subList = document.createElement("div");
                  subList.className = "tree-sub-list";
                  subList.style.display = hasSubs ? "block" : "none";

                  group.phans.forEach(phan => {
                    const phanCompleted = completedLessonIds.includes(phan.id);
                    const phanRow = document.createElement("div");
                    phanRow.className = "tree-phan-row" + (activeLessonId === phan.id ? " active" : "") + (isRegistered && phanCompleted ? " completed" : "");

                    phanRow.innerHTML = `
                      <span class="tree-phan-indent">↳</span>
                      <div class="tree-phan-icon">${SVG_PLAY}</div>
                      <span class="tree-phan-label">${phan.title}</span>
                      <div class="tree-right-icon ${(!isRegistered && !phan.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !phan.preview_allowed) ? SVG_LOCK : (isRegistered && phanCompleted ? SVG_CHECK : "")}</div>
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

                } else if (group.type === "document") {
                  const row = document.createElement("div");
                  row.className = "tree-standalone-row" + (activeLessonId === lesson.id ? " active" : "") + (isRegistered && isCompleted ? " completed-row" : "");
                  row.innerHTML = `
                    <div class="tree-doc-icon">${SVG_DOC}</div>
                    <span class="tree-row-label">${lesson.title}</span>
                    <div class="tree-right-icon ${(!isRegistered && !lesson.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !lesson.preview_allowed) ? SVG_LOCK : (isRegistered && isCompleted ? SVG_CHECK : "")}</div>
                  `;
                  makeLessonClickable(row, lesson);
                  chapterBody.appendChild(row);

                } else if (group.type === "test") {
                  const row = document.createElement("div");
                  row.className = "tree-standalone-row" + (activeLessonId === lesson.id ? " active" : "") + (isRegistered && isCompleted ? " completed-row" : "");
                  row.innerHTML = `
                    <div class="tree-test-icon">${SVG_TEST}</div>
                    <span class="tree-row-label">${lesson.title}</span>
                    <div class="tree-right-icon ${(!isRegistered && !lesson.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !lesson.preview_allowed) ? SVG_LOCK : (isRegistered && isCompleted ? SVG_CHECK : "")}</div>
                  `;
                  makeLessonClickable(row, lesson);
                  chapterBody.appendChild(row);

                } else if (group.type === "phan-standalone") {
                  const phanRow = document.createElement("div");
                  const phanCompleted = completedLessonIds.includes(lesson.id);
                  phanRow.className = "tree-phan-row" + (activeLessonId === lesson.id ? " active" : "") + (isRegistered && phanCompleted ? " completed" : "");
                  phanRow.innerHTML = `
                    <span class="tree-phan-indent">↳</span>
                    <div class="tree-phan-icon">${SVG_PLAY}</div>
                    <span class="tree-phan-label">${lesson.title}</span>
                    <div class="tree-right-icon ${(!isRegistered && !lesson.preview_allowed) ? "tree-lock-icon" : ""}">${(!isRegistered && !lesson.preview_allowed) ? SVG_LOCK : (isRegistered && phanCompleted ? SVG_CHECK : "")}</div>
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
              
              try {
                if (supabaseClient) {
                  if (isCompletedCurrently) {
                    // Remove completion record from database
                    await supabaseClient
                      .from('lesson_progress')
                      .delete()
                      .eq('user_email', studentCode)
                      .eq('lesson_id', activeLessonId);
                  } else {
                    // Add completion record to database
                    await supabaseClient
                      .from('lesson_progress')
                      .insert({
                        user_email: studentCode,
                        lesson_id: activeLessonId,
                        status: 'completed'
                      });
                  }
                } else {
                  // Offline mockup
                  const key = `tmaTsaLessonProgress_${studentInfo.username}`;
                  let localProg = JSON.parse(localStorage.getItem(key) || "[]");
                  if (isCompletedCurrently) {
                    localProg = localProg.filter(id => id !== activeLessonId);
                  } else {
                    if (!localProg.includes(activeLessonId)) localProg.push(activeLessonId);
                  }
                  localStorage.setItem(key, JSON.stringify(localProg));
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
                  completeBtn.querySelector("span").textContent = "Đánh dấu đã hoàn thành";
                }

              } catch (err) {
                console.error("Failed to update progress:", err);
                await showCustomAlert("Lỗi khi cập nhật tiến độ học tập: " + (err.message || err));
              }
            };
          }

          // Set activation click handler for this course
          courseModalActivationBtn.onclick = async () => {
            const codeInput = await showCustomPrompt(`NHẬP MÃ KÍCH HOẠT KHÓA HỌC:\nVui lòng nhập mã kích hoạt:`);
            if (codeInput !== null) {
              const cleanCode = codeInput.trim();
              const studentCode = studentInfo?.code || studentInfo?.phone || studentInfo?.email || "test";

              // Chế độ test local offline
              const isLocalMockId = String(courseId).startsWith("thpt-") || String(courseId).length < 5;
              if (!supabaseClient || isLocalMockId) {
                if (cleanCode === "123" || cleanCode.toUpperCase() === "VIP") {
                  registerCourse(courseId);
                  await showCustomAlert(`Kích hoạt thành công khóa học "${course.title}"! Chúc bạn học tập tốt!`);
                  openClassroomModal(courseId); // reload layout
                } else {
                  await showCustomAlert(`Mã kích hoạt không chính xác hoặc đã hết hạn sử dụng. Vui lòng liên hệ Admin để nhận mã kích hoạt hợp lệ!`);
                }
                return;
              }

              // Gọi Supabase thật
              try {
                const { data: codeData, error: codeErr } = await supabaseClient
                  .from('activation_codes')
                  .select('*')
                  .eq('code', cleanCode)
                  .eq('active', true)
                  .single();

                if (codeErr || !codeData) {
                  await showCustomAlert(`Mã kích hoạt không chính xác hoặc đã hết hạn sử dụng. Vui lòng liên hệ Admin để nhận mã kích hoạt hợp lệ!`);
                  return;
                }

                if (codeData.course_id !== courseId) {
                  await showCustomAlert(`Mã kích hoạt này không áp dụng cho khóa học này!`);
                  return;
                }

                if (codeData.used_count >= codeData.max_uses) {
                  await showCustomAlert(`Mã kích hoạt này đã vượt quá số lần sử dụng tối đa!`);
                  return;
                }

                // Ghi nhận enrollment
                const { error: enrollErr } = await supabaseClient
                  .from('enrollments')
                  .insert({
                    user_email: studentCode,
                    course_id: courseId
                  });

                if (enrollErr && !enrollErr.message.includes("unique")) {
                  throw enrollErr;
                }

                // Cộng dồn used_count
                await supabaseClient
                  .from('activation_codes')
                  .update({ used_count: codeData.used_count + 1 })
                  .eq('id', codeData.id);

                // Tải lại quyền truy cập mới nhất
                await loadCoursesAndEnrollments();

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

      const logoutDialog = document.getElementById("logout-dialog");
      const logoutButton = document.getElementById("logout-button");
      const confirmLogoutButton = document.getElementById("confirm-logout");
      const closeLogoutButtons = document.querySelectorAll("[data-close-logout]");
      const accountLogoutBtn = document.getElementById("account-logout-btn");

      function openLogoutDialog() {
        logoutDialog.hidden = false;
        logoutButton.setAttribute("aria-expanded", "true");
        confirmLogoutButton.focus();
      }

      function closeLogoutDialog() {
        logoutDialog.hidden = true;
        logoutButton.setAttribute("aria-expanded", "false");
        logoutButton.focus();
      }

      logoutButton.addEventListener("click", openLogoutDialog);
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

      const menuItems = document.querySelectorAll(".tsa-menu a[data-tab]");
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
        try {
          const lsData = localStorage.getItem('tma_tsa_exam_index');
          if (lsData) {
            const parsed = JSON.parse(lsData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              window.EXAMS_LIST = parsed;
              const activePanel = document.querySelector(".tab-panel.active");
              if (activePanel && activePanel.id === "tab-practice") {
                renderPracticeRoom();
              }
              // Tiếp tục fetch data/exams/index.json; localStorage chỉ là fallback khi fetch lỗi.
            }
          }
        } catch (e) {
          console.warn("localStorage read error:", e);
        }
        
        // Tải danh sách đề từ Supabase Storage trước
        fetch(`${supabaseStorageUrl}index.json`, { cache: "no-store" })
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch from Supabase");
            return res.json();
          })
          .then(data => {
            window.EXAMS_LIST = data;
            try {
              localStorage.setItem('tma_tsa_exam_index', JSON.stringify(data));
            } catch (e) {}
            const activePanel = document.querySelector(".tab-panel.active");
            if (activePanel && activePanel.id === "tab-practice") {
              renderPracticeRoom();
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

        // Tải danh sách link Drive tài liệu từ Supabase Storage
        fetch(`${supabaseStorageUrl}drive_links.json`, { cache: "no-store" })
          .then(res => {
            if (res.ok) return res.json();
          })
          .then(data => {
            if (data && typeof data === "object") {
              localStorage.setItem('tmaTsaDriveLinks', JSON.stringify(data));
              const activePanel = document.querySelector(".tab-panel.active");
              if (activePanel && activePanel.id === "tab-documents") {
                renderMaterials();
              }
            }
          })
          .catch(err => console.warn("Không đồng bộ được link tài liệu từ Cloud:", err));
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
              // Các phần đơn môn (Toán, Đọc hiểu, Khoa học) đều đọc chung từ đề tổng hợp FULL để tránh tạo nhiều file thừa
              examCodeToCheck = "TSA_PRACTICE_FULL_" + numStr2;
            }
            const hasExamInList = (window.EXAMS_LIST || []).some(e => e.exam_code === examCodeToCheck);
            const hasLocalDraft = localStorage.getItem("tma_tsa_exam_" + examCodeToCheck) || localStorage.getItem("tma_tsa_teacher_draft_" + examCodeToCheck);
            const isUploaded = (i === 1) || hasExamInList || hasLocalDraft;

            let examTitle = "";
            let subjectText = "";
            let redirectUrl = "";
            let duration = currentTsaPracticeSubtab === "tong-hop" ? "150 phút" : "45 phút";
            let qCount = currentTsaPracticeSubtab === "tong-hop" ? "85 câu" : "6 câu";

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

            let actionBtnHtml = "";
            if (isUploaded) {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  <a href="#" onclick="window.showExamResultModal('${examCodeToCheck}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
                  <button class="btn btn-sm" style="background: #22c55e; border-color: #22c55e; color: #ffffff; font-weight: 600; padding: 6px 16px; border-radius: 8px; border: 1px solid #22c55e; cursor: pointer; transition: background 0.15s;" onclick="window.startExamDirectly(\`${examTitle}\`, '${redirectUrl}')">Bắt đầu</button>
                </footer>
              `;
            } else {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  <a href="#" onclick="window.showExamResultModal('${examCodeToCheck}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
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

        // Generate exactly 10 practice exams for other categories
        const displayCategory = category === "THPT" ? "THPTQG" : category;
        for (let i = 1; i <= 10; i++) {
          const numStr = String(i).padStart(2, "0");
          const examCodeToCheck = category + numStr;
          const hasExamInList = (window.EXAMS_LIST || []).some(e => e.exam_code === examCodeToCheck);
          const hasLocalDraft = localStorage.getItem("tma_tsa_exam_" + examCodeToCheck) || localStorage.getItem("tma_tsa_teacher_draft_" + examCodeToCheck);
          const isUploaded = (i === 1) || hasExamInList || hasLocalDraft;

          const examTitle = `Đề ${displayCategory} số ${numStr}`;

          const card = document.createElement("div");
          card.className = "exam-card";

          let actionBtnHtml = "";
          let redirectUrl = "waiting.html";
          if (category === "HSA") redirectUrl = `exam-reading.html?exam=${examCodeToCheck}`;
          else if (category === "THPT" || category === "VACT" || category === "QDA") redirectUrl = `exam-science.html?exam=${examCodeToCheck}`;

          if (isUploaded) {
            actionBtnHtml = `
              <footer class="exam-card-footer">
                <a href="#" onclick="window.showExamResultModal('${examCodeToCheck}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
                <button class="btn btn-sm" style="background: #22c55e; border-color: #22c55e; color: #ffffff; font-weight: 600; padding: 6px 16px; border-radius: 8px; border: 1px solid #22c55e; cursor: pointer; transition: background 0.15s;" onclick="window.startExamDirectly(\`${examTitle}\`, '${redirectUrl}')">Bắt đầu</button>
              </footer>
            `;
          } else {
            actionBtnHtml = `
              <footer class="exam-card-footer">
                <a href="#" onclick="window.showExamResultModal('${examCodeToCheck}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
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

            let actionBtnHtml = "";
            if (isOpen) {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  <a href="#" onclick="window.showExamResultModal('${examCode}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
                  <button class="btn btn-sm" style="background:#22c55e;border-color:#22c55e;color:#fff;font-weight:600;padding:6px 16px;border-radius:8px;cursor:pointer;" onclick="window.startExamDirectly(\`${examTitle}\`, '${redirectUrl}')">Bắt đầu</button>
                </footer>
              `;
            } else {
              actionBtnHtml = `
                <footer class="exam-card-footer">
                  <a href="#" onclick="window.showExamResultModal('${examCode}', \`${examTitle}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
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

        // ── Các loại khác: giữ logic thẻ đơn từ EXAMS_DATA ──
        if (titleEl) {
          titleEl.textContent = {
            hsa: "Bài thi Đánh giá năng lực - HSA",
            thpt: "Thi tốt nghiệp THPTQG",
            vact: "Bài thi Đánh giá năng lực - VACT",
            qda: "Bài thi Đánh giá năng lực - QDA"
          }[currentExamTypeCategory] || "Thi thử";
        }

        const filtered = EXAMS_DATA.filter(e => e.category === currentExamTypeCategory.toUpperCase());
        filtered.forEach(exam => {
          const card = document.createElement("div");
          card.className = "exam-card";
          let badgeClass = exam.isOnline ? "badge-green" : "badge-red";
          let actionBtnHtml = "";
          if (!exam.uploaded) {
            actionBtnHtml = `
              <footer class="exam-card-footer">
                <a href="#" onclick="window.showExamResultModal('${exam.id}', \`${exam.title}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
                <button class="btn btn-sm" style="background:#e2e8f0;border-color:#e2e8f0;color:#94a3b8;font-weight:600;padding:6px 16px;border-radius:8px;cursor:not-allowed;" disabled>Chưa mở đề</button>
              </footer>
            `;
          } else {
            actionBtnHtml = `
              <footer class="exam-card-footer">
                <a href="#" onclick="window.showExamResultModal('${exam.id}', \`${exam.title}\`); return false;" style="font-size: 13.5px; color: var(--brand-red); font-weight: 600; text-decoration: none; cursor: pointer;">Xem kết quả</a>
                <button class="btn btn-sm" style="background:#22c55e;border-color:#22c55e;color:#fff;font-weight:600;padding:6px 16px;border-radius:8px;cursor:pointer;" onclick="window.startExamDirectly(\`${exam.title}\`, '${exam.actionUrl}')">${exam.actionText}</button>
              </footer>
            `;
          }
          card.innerHTML = `
            <header class="exam-card-header"><h3>${exam.title}</h3></header>
            <div class="exam-card-body">
              <div class="exam-info-row"><span class="info-label">Hình thức thi:</span><span class="${badgeClass}">${exam.typeBadge}</span></div>
              <div class="exam-info-row"><span class="info-label">Thời gian đăng ký:</span><span class="info-value">${exam.regTime}</span></div>
              <div class="exam-info-row"><span class="info-label">Lệ phí:</span><span class="info-value font-bold">${exam.fee}</span></div>
              <div class="exam-info-row"><span class="info-label">Thời gian thi:</span><span class="info-value">${exam.examTime}</span></div>
            </div>
            ${actionBtnHtml}
          `;
          grid.appendChild(card);
        });
      }

      function updateDocumentsUI() {
        const titleEl = document.getElementById("documents-title");
        const descEl = document.getElementById("documents-desc");
        
        if (currentMaterialCategory === "tsa") {
          titleEl.textContent = "Kho tài liệu ôn tập - TSA";
          descEl.textContent = "Sách ôn thi và các bộ đề thi thử PDF Đánh giá tư duy tải xuống từ Drive.";
        } else if (currentMaterialCategory === "hsa") {
          titleEl.textContent = "Kho tài liệu ôn tập - HSA";
          descEl.textContent = "Sách ôn thi và các bộ đề thi thử PDF Đánh giá năng lực tải xuống từ Drive.";
        } else if (currentMaterialCategory === "thpt") {
          titleEl.textContent = "Kho tài liệu ôn tập - THPTQG";
          descEl.textContent = "Tài liệu lý thuyết trọng tâm và đề ôn thi tốt nghiệp THPT Quốc gia tải xuống từ Drive.";
        }
        
        renderMaterials();
      }

      window.switchTab = switchTab;
      function switchTab(tabId) {
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
        } else if (tabId === "documents") {
          tabId = currentMaterialCategory + "-documents";
        }

        // Categorize tabId prefixes and set categories
        if (["tsa-courses", "hsa-courses", "thpt-courses"].includes(tabId)) {
          currentExamCategory = tabId.split("-")[0];
        } else if (["tsa-practice", "hsa-practice", "thpt-practice", "vact-practice", "qda-practice"].includes(tabId)) {
          currentPracticeCategory = tabId.split("-")[0];
        } else if (["tsa-exams", "hsa-exams", "thpt-exams", "vact-exams", "qda-exams"].includes(tabId)) {
          currentExamTypeCategory = tabId.split("-")[0];
        } else if (["tsa-documents", "hsa-documents", "thpt-documents"].includes(tabId)) {
          currentMaterialCategory = tabId.split("-")[0];
        }

        // Determine active categories and panels
        const isExamRoom = ["tsa-courses", "hsa-courses", "thpt-courses"].includes(tabId);
        const isPracticeRoom = ["tsa-practice", "hsa-practice", "thpt-practice", "vact-practice", "qda-practice"].includes(tabId);
        const isExamList = ["tsa-exams", "hsa-exams", "thpt-exams", "vact-exams", "qda-exams"].includes(tabId);
        const isDocumentsRoom = ["tsa-documents", "hsa-documents", "thpt-documents"].includes(tabId);

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
          switchTab(tabId);
          window.location.hash = tabId;
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

          if (shell.classList.contains("sidebar-collapsed")) {
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
            <div style="text-align: center; padding: 40px; color: #64748b; font-size: 14px; background: #ffffff; border: 1px solid rgba(193, 18, 31, 0.1); border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.015);">
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
              window.showExamResultModal(row.exam_code, examTitle, row.id || row.created_at);
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

      async function renderExamHistory() {
        const container = document.getElementById("history-grouped-container");
        if (!container) return;

        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #64748b;">
            <span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #dc2626;border-radius:50%;border-top-color:transparent;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:8px;"></span>
            Đang tải lịch sử từ máy chủ...
          </div>
        `;

        if (!supabaseClient) {
          container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #ef4444; font-weight: 600; border: 1px solid var(--border); border-radius: 10px; background: #ffffff;">
              Không có kết nối với Supabase (Offline)
            </div>
          `;
          return;
        }

        // Get student info
        let studentCode = "TMA507905";
        try {
          const cached = JSON.parse(localStorage.getItem("studentInfo"));
          if (cached) {
            studentCode = cached.code || cached.phone || studentCode;
          }
        } catch (e) {}

        try {
          const { data, error } = await supabaseClient
            .from('exam_results')
            .select('*')
            .eq('user_email', studentCode)
            .order('created_at', { ascending: false });

          if (error) throw error;

          window.EXAM_HISTORY_DATA = data || [];
          renderHistoryGroups(window.EXAM_HISTORY_DATA);
        } catch (err) {
          console.error("Lỗi khi tải lịch sử:", err);
          container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #ef4444; border: 1px solid var(--border); border-radius: 10px; background: #ffffff;">
              Gặp lỗi khi tải lịch sử từ máy chủ: ${err.message || err}
            </div>
          `;
        }
      }

      // EXAM RESULT MODAL HANDLERS
      window.showExamResultModal = async function(examCode, examTitle, targetAttemptId) {
        const modal = document.getElementById("exam-result-modal");
        if (!modal) return;
        
        // SBD: either student code or mock (TMA + student username)
        let studentCode = "TMA507905";
        let studentSbd = "TMA-STUDENT";
        try {
          const cached = JSON.parse(localStorage.getItem("studentInfo"));
          if (cached) {
            studentCode = cached.code || cached.phone || studentCode;
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
              .select('*')
              .eq('user_email', studentCode)
              .eq('exam_code', examCode)
              .order('created_at', { ascending: true }); // chronological order
            if (!error && data) {
              attempts = data;
            }
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
        
        function displayAttempt(result) {
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
            if (category === "Bài thi HSA") {
              label1 = "Định lượng (Toán)"; label2 = "Định tính (Văn)"; label3 = "Khoa học (Lý/Hóa...)";
              t1 = t2 = t3 = Math.round(grandTotal / 3);
              c1 = Math.round(grandCorrect / 3); c2 = Math.round(grandCorrect / 3); c3 = grandCorrect - c1 - c2;
            } else {
              t1 = Math.round(grandTotal * 0.4); t2 = Math.round(grandTotal * 0.2); t3 = grandTotal - t1 - t2;
              c1 = Math.round(grandCorrect * 0.4); c2 = Math.round(grandCorrect * 0.2); c3 = grandCorrect - c1 - c2;
            }

            // Cập nhật từng thẻ phân môn
            [[1,label1,c1,t1],[2,label2,c2,t2],[3,label3,c3,t3]].forEach(([i,lbl,c,t]) => {
              const pct = t > 0 ? (c/t)*100 : 0;
              const elLbl = document.getElementById(`result-modal-subject-label-${i}`);
              const elCnt = document.getElementById(`result-modal-subject-count-text-${i}`);
              const elBar = document.getElementById(`result-modal-subject-bar-${i}`);
              const elSt  = document.getElementById(`result-modal-subject-status-${i}`);
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
                let max_q = 40;
                if (category === "Bài thi HSA") {
                  max_q = 50;
                } else {
                  if (i === 1) max_q = 40;
                  else if (i === 2) max_q = 20;
                  else if (i === 3) max_q = 40;
                }
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
        if (backLink) backLink.onclick = (e) => { e.preventDefault(); modal.hidden = true; };

        // Nút làm lại
        const redoBtn = document.getElementById("result-redo-exam-btn");
        if (redoBtn) redoBtn.onclick = () => { modal.hidden = true; launchExamShell(`exam-math.html?exam=${examCode}`); };
        
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
      };
      
      function closeResultModalFunc() {
        if (resultModal) resultModal.hidden = true;
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

      // Hash routing
      const currentHash = window.location.hash.substring(1);
      if (currentHash) {
        switchTab(currentHash);
      } else {
        switchTab("overview");
      }

      // Helper to log video view event with IP details and check for account sharing (Feature 2)
      async function writeVideoViewLog(studentEmail, lesson, courseTitle) {
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
    })();
