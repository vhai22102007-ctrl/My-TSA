// State management for Student lists
    var pendingStudents = [
      { id: 1, name: "Nguyễn Thị Minh Anh", email: "minhanh@gmail.com", phone: "0912345678", course: "Khóa học TSA", date: "2026-06-20" },
      { id: 2, name: "Trần Hoàng Nam", email: "namth@gmail.com", phone: "0987654321", course: "Khóa học HSA", date: "2026-06-21" },
      { id: 3, name: "Phạm Thùy Linh", email: "linhpt@gmail.com", phone: "0934567890", course: "Khóa học THPTQG", date: "2026-06-21" }
    ];

    var approvedStudents = [
      { id: 101, name: "Nguyễn Văn Hải", email: "vhai2@tma.edu.vn", phone: "0909090909", code: "TMA507905", course: "Khóa học TSA", date: "2026-06-15" },
      { id: 102, name: "Lê Minh Triết", email: "trietlm@tma.edu.vn", phone: "0808080808", code: "TMA507906", course: "Khóa học TSA", date: "2026-06-16" },
      { id: 103, name: "Phạm Thanh Hằng", email: "hangpt@tma.edu.vn", phone: "0707070707", code: "TMA507907", course: "Khóa học HSA", date: "2026-06-18" }
    ];

    function renderStudents() {
      // 1. Pending approval list
      var pendingTbody = document.getElementById("pending-students-list");
      if (pendingTbody) {
        if (pendingStudents.length === 0) {
          pendingTbody.innerHTML = '<tr><td colspan="5" class="empty">Không có yêu cầu đăng ký nào cần duyệt.</td></tr>';
        } else {
          pendingTbody.innerHTML = pendingStudents.map(function(s) {
            return `
              <tr>
                <td class="table-main">${esc(s.name)}</td>
                <td>
                  <div>${esc(s.email)}</div>
                  <div class="table-sub">${esc(s.phone)}</div>
                </td>
                <td><span class="status type">${esc(s.course)}</span></td>
                <td>${esc(s.date)}</td>
                <td>
                  <div class="actions">
                    <button class="btn btn-sm btn-success" onclick="approveStudent(${s.id})">Duyệt</button>
                    <button class="btn btn-sm btn-danger" onclick="rejectStudent(${s.id})">Từ chối</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("");
        }
      }

      // 2. Approved students list
      var approvedTbody = document.getElementById("approved-students-list");
      if (approvedTbody) {
        if (approvedStudents.length === 0) {
          approvedTbody.innerHTML = '<tr><td colspan="6" class="empty">Chưa có học sinh nào tham gia khóa học.</td></tr>';
        } else {
          approvedTbody.innerHTML = approvedStudents.map(function(s) {
            return `
              <tr>
                <td>
                  <div class="table-main">${esc(s.name)}</div>
                  <div class="table-sub">${esc(s.email)} • ${esc(s.phone)}</div>
                </td>
                <td style="font-family: monospace; font-weight: bold; color: var(--brand);">${esc(s.code)}</td>
                <td><span class="status type">${esc(s.course)}</span></td>
                <td>${esc(s.date)}</td>
                <td><span class="status published">Đang học</span></td>
                <td>
                  <div class="actions">
                    <button class="btn btn-sm btn-outline" onclick="viewStudentDetails(${s.id})">Chi tiết</button>
                    <button class="btn btn-sm btn-danger" onclick="kickStudent(${s.id})">Kích</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("");
        }
      }
    }



    function approveStudent(id) {
      var idx = pendingStudents.findIndex(function(s) { return s.id === id; });
      if (idx !== -1) {
        var student = pendingStudents[idx];
        pendingStudents.splice(idx, 1);
        
        // Add to approved
        var nextCodeNum = 507900 + approvedStudents.length + 8;
        var code = "TMA" + nextCodeNum;
        approvedStudents.push({
          id: Date.now(),
          name: student.name,
          email: student.email,
          phone: student.phone,
          code: code,
          course: student.course,
          date: new Date().toISOString().split('T')[0]
        });

        alert(`Đã phê duyệt học sinh: ${student.name}!\nMã học sinh cấp mới: ${code}`);
        renderStudents();
      }
    }

    async function rejectStudent(id) {
      var idx = pendingStudents.findIndex(function(s) { return s.id === id; });
      if (idx !== -1) {
        var student = pendingStudents[idx];
        if (await showCustomConfirm(`Bạn có chắc muốn từ chối đăng ký của học sinh: ${student.name}?`)) {
          pendingStudents.splice(idx, 1);
          renderStudents();
        }
      }
    }

    async function kickStudent(id) {
      var idx = approvedStudents.findIndex(function(s) { return s.id === id; });
      if (idx !== -1) {
        var student = approvedStudents[idx];
        if (await showCustomConfirm(`Bạn có chắc muốn kích học sinh: ${student.name} ra khỏi khóa học?`)) {
          approvedStudents.splice(idx, 1);
          renderStudents();
        }
      }
    }

    function viewStudentDetails(id) {
      var student = approvedStudents.find(function(s) { return s.id === id; });
      if (student) {
        document.getElementById("modal-student-name").textContent = student.name;
        document.getElementById("modal-student-code").textContent = "Mã học sinh: " + student.code;
        document.getElementById("modal-student-email").textContent = student.email;
        document.getElementById("modal-student-phone").textContent = student.phone;
        document.getElementById("modal-student-course").textContent = student.course;
        document.getElementById("modal-student-date").textContent = student.date;
        document.getElementById("student-detail-modal").style.display = "flex";
      }
    }

    function closeStudentModal() {
      document.getElementById("student-detail-modal").style.display = "none";
    }

    function esc(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

// State management for categories and subtabs (Practice & Exams)
    var currentPracticeCategory = "tsa";
    var currentExamCategory = "tsa";
    var currentTsaPracticeSubtab = "tong-hop";

    function selectCategoryTab(type, category, element) {
      // 1. Update UI state in sidebar
      document.querySelectorAll(".submenu-item").forEach(function(item) {
        item.classList.remove("active");
      });
      element.classList.add("active");

      // Set has-active for parent groups
      document.querySelectorAll(".menu-group").forEach(function(g) {
        g.classList.remove("has-active");
      });
      element.closest(".menu-group").classList.add("has-active");

      // Update sidebar nav active classes
      document.querySelectorAll("#sidebar-normal-nav > button.nav-button").forEach(function(btn) {
        btn.classList.remove("active");
      });

      // 2. Open dashboard tabs
      if (type === "practice") {
        currentPracticeCategory = category;
        switchSystemTab("practice");
      } else if (type === "exams") {
        currentExamCategory = category;
        switchSystemTab("exams");
      }
    }

    // Expose selectCategoryTab
    window.selectCategoryTab = selectCategoryTab;

    // KHO TÀI LIỆU (DRIVE LINKS) MANAGEMENT
    var MATERIALS_LIST = [
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

    function renderManageDocuments() {
      var container = document.getElementById("teacher-materials-inputs");
      if (!container) return;
      
      var savedLinks = {};
      try {
        savedLinks = JSON.parse(localStorage.getItem("tmaTsaDriveLinks") || "{}");
      } catch(e) {}

      var html = "";
      var categories = ["TSA", "HSA", "THPT"];
      
      categories.forEach(function(cat) {
        html += `<h3 style="margin-top: 16px; margin-bottom: 8px; border-bottom: 2px solid var(--border); padding-bottom: 6px; color: var(--brand); font-size: 14px;">Tài liệu ${cat}</h3>`;
        var filtered = MATERIALS_LIST.filter(function(m) { return m.category === cat; });
        filtered.forEach(function(material) {
          var currentUrl = savedLinks[material.index] || "";
          html += `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <label style="width: 150px; font-weight: 700; font-size: 13px;">${material.title}</label>
              <input class="input" type="text" data-doc-index="${material.index}" value="${esc(currentUrl)}" placeholder="Nhập link Google Drive..." style="flex: 1; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);">
            </div>
          `;
        });
      });
      container.innerHTML = html;
    }

    async function saveDocumentsToSupabase() {
      var client = window.supabaseClient;
      if (!client) {
        window.alert("Supabase Client chưa được khởi tạo hoặc đồng bộ. Vui lòng đợi trong giây lát.");
        return;
      }

      var btn = document.getElementById("save-documents-btn");
      var originalText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Đang lưu lên Cloud...";
      }

      try {
        var links = {};
        var inputs = document.querySelectorAll("#teacher-materials-inputs input");
        inputs.forEach(function(input) {
          var index = input.getAttribute("data-doc-index");
          var url = input.value.trim();
          if (url) {
            links[index] = url;
          }
        });

        // 1. Lưu cục bộ
        localStorage.setItem("tmaTsaDriveLinks", JSON.stringify(links));

        // 2. Đồng bộ lên Cloud Supabase Storage 'exams'
        var jsonStr = JSON.stringify(links, null, 2);
        var blob = new Blob([jsonStr], { type: "application/json" });
        var { error } = await client.storage
          .from('exams')
          .upload('drive_links.json', blob, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;
        window.alert("✓ Đã lưu danh sách link tài liệu lên Supabase Cloud thành công!");
      } catch(err) {
        console.error(err);
        window.alert("Lỗi khi tải tài liệu lên Supabase:\n" + (err.message || err));
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }
    }

    function clearAllDocumentLinks() {
      if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ link tài liệu không?")) {
        return;
      }
      var inputs = document.querySelectorAll("#teacher-materials-inputs input");
      inputs.forEach(function(input) {
        input.value = "";
      });
      localStorage.removeItem("tmaTsaDriveLinks");
      window.alert("Đã xóa nháp cục bộ. Nhấn 'Lưu lên Supabase Cloud' để đồng bộ xóa trên hệ thống.");
    }
    
    window.saveDocumentsToSupabase = saveDocumentsToSupabase;
    window.clearAllDocumentLinks = clearAllDocumentLinks;

    function renderPracticeRoom() {
      var grid = document.getElementById("practice-grid-dynamic");
      if (!grid) return;
      grid.innerHTML = "";

      var category = currentPracticeCategory.toUpperCase();
      var subtabsContainer = document.getElementById("practice-subtabs-container");

      // Update Page Headers
      var roomTitle = document.getElementById("practice-room-title");
      var roomDesc = document.getElementById("practice-room-desc");
      
      var labels = {
        TSA: ["Đánh giá tư duy - TSA", "Khám phá các chế độ rèn luyện cấu trúc đề thi TSA Bách Khoa để khắc phục điểm yếu kiến thức."],
        HSA: ["Đánh giá năng lực - HSA", "Khám phá các chế độ rèn luyện cấu trúc đề thi HSA ĐHQGHN để khắc phục điểm yếu kiến thức."],
        VACT: ["Đánh giá năng lực - VACT", "Khám phá các chế độ rèn luyện cấu trúc đề thi VACT ĐHQG TP.HCM để khắc phục điểm yếu kiến thức."],
        QDA: ["Đánh giá năng lực - QDA", "Khám phá các chế độ rèn luyện cấu trúc đề thi QDA Bộ Quốc phòng để khắc phục điểm yếu kiến thức."],
        THPT: ["Thi tốt nghiệp THPTQG", "Khám phá các chế độ rèn luyện cấu trúc đề thi tốt nghiệp THPTQG để khắc phục điểm yếu kiến thức."]
      };
      
      var info = labels[category] || labels.TSA;
      if (roomTitle) roomTitle.textContent = "Phòng luyện đề: " + info[0];
      if (roomDesc) roomDesc.textContent = info[1];

      if (category === "TSA") {
        if (subtabsContainer) {
          subtabsContainer.style.display = "flex";
          subtabsContainer.innerHTML = `
            <div style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); gap: 4px; overflow-x: auto; max-width: 100%;">
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'tong-hop' ? 'active' : ''}" data-subtab="tong-hop" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'tong-hop' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'tong-hop' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Đề tổng hợp</button>
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'math' ? 'active' : ''}" data-subtab="math" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'math' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'math' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Toán học</button>
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'reading' ? 'active' : ''}" data-subtab="reading" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'reading' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'reading' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Đọc hiểu</button>
              <button type="button" class="tsa-practice-subtab-btn ${currentTsaPracticeSubtab === 'science' ? 'active' : ''}" data-subtab="science" style="padding: 8px 20px; font-size: 13px; border-radius: 10px; border: 0; background: ${currentTsaPracticeSubtab === 'science' ? '#ffffff' : 'transparent'}; color: ${currentTsaPracticeSubtab === 'science' ? 'var(--brand)' : '#475569'}; font-weight: 800; cursor: pointer; transition: all 0.15s; white-space: nowrap;">Tư duy Khoa học</button>
            </div>
          `;
          // Attach subtab click listeners
          subtabsContainer.querySelectorAll(".tsa-practice-subtab-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              currentTsaPracticeSubtab = btn.getAttribute("data-subtab");
              renderPracticeRoom();
            });
          });
        }

        // Generate dynamic count of exams for selected TSA subtab
        var maxPracticeIndex = 10;
        try {
          var rawIdx = localStorage.getItem("tma_tsa_exam_index");
          if (rawIdx) {
            var parsedIdx = JSON.parse(rawIdx);
            if (Array.isArray(parsedIdx)) {
              parsedIdx.forEach(e => {
                if (e.exam_code && e.exam_code.startsWith("TSA_PRACTICE_FULL_")) {
                  var parts = e.exam_code.split("_");
                  var num = parseInt(parts[parts.length - 1], 10);
                  if (num > maxPracticeIndex) maxPracticeIndex = num;
                }
              });
            }
          }
        } catch(e) {}

        for (let i = 1; i <= maxPracticeIndex; i++) {
          var numStr = String(i).padStart(2, "0");
          var examTitle = "";
          var examCode = `TSA_PRACTICE_${currentTsaPracticeSubtab.toUpperCase()}_${numStr}`;

          if (currentTsaPracticeSubtab === "tong-hop") {
            examTitle = `Đề tổng hợp số ${numStr}`;
            examCode = `TSA_PRACTICE_FULL_${numStr}`;
          } else if (currentTsaPracticeSubtab === "math") {
            examTitle = `Đề TSA số ${numStr} - Tư duy Toán học`;
          } else if (currentTsaPracticeSubtab === "reading") {
            examTitle = `Đề TSA số ${numStr} - Đọc hiểu`;
          } else if (currentTsaPracticeSubtab === "science") {
            examTitle = `Đề TSA số ${numStr} - Khoa học`;
          }

          var card = document.createElement("div");
          card.className = "exam-card";
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
            <footer class="exam-card-footer">
              <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
            </footer>
          `;
          grid.appendChild(card);
        }
        return;
      }

      // Other categories
      if (subtabsContainer) subtabsContainer.style.display = "none";

      var displayCategory = category === "THPT" ? "THPTQG" : category;
      for (let i = 1; i <= 10; i++) {
        var numStr = String(i).padStart(2, "0");
        var examTitle = `Đề ${displayCategory} số ${numStr}`;
        var examCode = `${displayCategory}_PRACTICE_${numStr}`;

        var card = document.createElement("div");
        card.className = "exam-card";
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
          <footer class="exam-card-footer">
            <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('${examTitle}', '${examCode}')">Chỉnh sửa</button>
          </footer>
        `;
        grid.appendChild(card);
      }
    }

    var EXAMS_DATA_MOCK = [
      { id: "tsa-online", title: "Thi thử Bài thi Đánh giá tư duy TSA", category: "TSA", code: "TSA001", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "hsa-online", title: "Thi thử Bài thi Đánh giá năng lực HSA", category: "HSA", code: "HSA_MOCK", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "vact-online", title: "Thi thử Bài thi Đánh giá năng lực VACT", category: "VACT", code: "VACT_MOCK", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "qda-online", title: "Thi thử Bài thi Đánh giá năng lực QDA", category: "QDA", code: "QDA_MOCK", badge: "badge-green", label: "Thi trực tuyến" },
      { id: "thpt-online", title: "Thi thử tốt nghiệp THPTQG", category: "THPT", code: "THPT_MOCK", badge: "badge-green", label: "Thi trực tuyến" }
    ];

    function renderExamsList() {
      var grid = document.getElementById("exams-list-grid");
      if (!grid) return;
      grid.innerHTML = "";

      // Update Page Headers
      var examTitle = document.getElementById("exam-tab-title");
      var examDesc = document.getElementById("exam-tab-desc");

      var labels = {
        tsa: ["Bài thi Đánh giá tư duy - TSA", "Các kỳ thi thử được tổ chức theo cấu trúc Đại học Bách Khoa Hà Nội."],
        hsa: ["Bài thi Đánh giá năng lực - HSA", "Các kỳ thi thử được tổ chức theo cấu trúc ĐHQG Hà Nội."],
        vact: ["Bài thi Đánh giá năng lực - VACT", "Các kỳ thi thử được tổ chức theo cấu trúc ĐHQG TP.HCM."],
        qda: ["Bài thi Đánh giá năng lực - QDA", "Các kỳ thi thử được tổ chức theo cấu trúc Bộ Quốc Phòng."],
        thpt: ["Thi tốt nghiệp THPTQG", "Các kỳ thi thử được tổ chức theo cấu trúc kỳ thi tốt nghiệp THPT Quốc gia."]
      };
      
      var info = labels[currentExamCategory] || labels.tsa;
      if (examTitle) examTitle.textContent = info[0];
      if (examDesc) examDesc.textContent = info[1];

      if (currentExamCategory.toLowerCase() === "tsa") {
        let indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}

        for (let i = 1; i <= 1; i++) {
          const numStr = String(i).padStart(2, "0");
          const examCode = "TSA_EXAM_" + numStr;
          const examTitleStr = "Đề thi thử TSA";

          const inList = indexList.find(e => e.exam_code === examCode);
          const hasExam = !!inList;
          const isOpen = inList && (inList.is_open === true || openStatus[examCode] === true);

          var card = document.createElement("div");
          card.className = "exam-card";
          card.innerHTML = `
            <header class="exam-card-header">
              <h3 style="text-transform:none;">${examTitleStr}</h3>
            </header>
            <div class="exam-card-body">
              <div class="exam-info-row">
                <span class="info-label">Mã đề:</span>
                <span class="info-value font-bold">${examCode}</span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Trạng thái soạn đề:</span>
                <span class="${hasExam ? 'badge-green' : 'badge-red'}" style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                  ${hasExam ? 'ĐÃ CÓ ĐỀ' : 'CHƯA CÓ ĐỀ'}
                </span>
              </div>
              <div class="exam-info-row">
                <span class="info-label">Trạng thái phòng thi:</span>
                <span class="${isOpen ? 'badge-green' : ''}" style="${!isOpen ? 'color:#94a3b8;font-size:12px;font-weight:600;' : ''}">
                  ${isOpen ? 'Đang mở đề' : 'Đang đóng đề'}
                </span>
              </div>
            </div>
            <footer class="exam-card-footer" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
              <button class="btn btn-sm btn-primary" style="font-weight: 800; padding: 6px 12px; font-size: 12px;" onclick="startEditingExam('${examTitleStr}', '${examCode}')">
                Chỉnh sửa
              </button>
              ${isOpen ? `
                <button class="btn btn-sm btn-danger" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #ef4444; border-color: #ef4444; color: #fff;" onclick="toggleExamOpen('${examCode}', false)">
                  Đóng đề
                </button>
              ` : `
                <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #16a34a; border-color: #16a34a; color: #fff; cursor: ${hasExam ? 'pointer' : 'not-allowed'}; opacity: ${hasExam ? 1 : 0.6};" ${hasExam ? '' : 'disabled'} onclick="toggleExamOpen('${examCode}', true)">
                  Mở đề
                </button>
              `}
              <button class="btn btn-sm" style="font-weight: 800; padding: 6px 12px; font-size: 12px; background: #3b82f6; border-color: #3b82f6; color: #fff; cursor: ${hasExam ? 'pointer' : 'not-allowed'}; opacity: ${hasExam ? 1 : 0.6};" ${hasExam ? '' : 'disabled'} onclick="archiveMockToPractice()">
                Chuyển vào Phòng luyện
              </button>
            </footer>
          `;
          grid.appendChild(card);
        }
        return;
      }

      var filtered = EXAMS_DATA_MOCK.filter(function(item) {
        return item.category.toLowerCase() === currentExamCategory.toLowerCase();
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty" style="grid-column: 1/-1;">Chưa có kỳ thi thử chính thức nào cho danh mục này.</div>';
        return;
      }

      filtered.forEach(function(examItem) {
        var card = document.createElement("div");
        card.className = "exam-card";
        card.innerHTML = `
          <header class="exam-card-header">
            <h3>${examItem.title}</h3>
          </header>
          <div class="exam-card-body">
            <div class="exam-info-row">
              <span class="info-label">Hình thức thi:</span>
              <span class="${examItem.badge}">${examItem.label}</span>
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
          <footer class="exam-card-footer">
            <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('${examItem.title}', '${examItem.code}')">Chỉnh sửa</button>
          </footer>
        `;
        grid.appendChild(card);
      });
    }

    function switchSystemTab(tabId) {
      // Show correct dashboard panel
      document.querySelectorAll("#dashboard-container .tab-panel").forEach(function(panel) {
        panel.classList.toggle("active", panel.id === "tab-" + tabId);
      });

      // Update sidebar nav active states
      if (tabId === "approve-students" || tabId === "manage-students" || tabId === "manage-documents") {
        document.querySelectorAll("#sidebar-normal-nav .nav-button").forEach(function(btn) {
          var target = btn.getAttribute("data-tab-target");
          btn.classList.toggle("active", target === tabId);
        });
        document.querySelectorAll(".submenu-item").forEach(function(item) {
          item.classList.remove("active");
        });
        document.querySelectorAll(".menu-group").forEach(function(g) {
          g.classList.remove("has-active");
        });
      }

      if (tabId === "practice") {
        renderPracticeRoom();
      } else if (tabId === "exams") {
        renderExamsList();
      } else if (tabId === "manage-documents") {
        renderManageDocuments();
      }
    }

    // Attach normal sidebar listeners (for non-accordion simple buttons)
    document.querySelectorAll("#sidebar-normal-nav > button.nav-button").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var tabId = btn.getAttribute("data-tab-target");
        switchSystemTab(tabId);
      });
    });

    // Accordion sidebar toggles
    document.querySelectorAll(".menu-group").forEach(function(group) {
      var header = group.querySelector(".group-header");
      var submenu = group.querySelector(".submenu-wrapper");

      header.addEventListener("click", function(e) {
        e.preventDefault();
        var isOpen = group.classList.contains("open");

        // Close all other groups
        document.querySelectorAll(".menu-group").forEach(function(g) {
          g.classList.remove("open");
          var sub = g.querySelector(".submenu-wrapper");
          if (sub) {
            sub.classList.remove("open");
            sub.style.maxHeight = "0px";
          }
        });

        // Toggle current group
        if (!isOpen) {
          group.classList.add("open");
          submenu.classList.add("open");
          submenu.style.maxHeight = "250px";
        }
      });
    });

(function () {
      "use strict";

      // Khởi tạo Supabase Client từ cấu hình dùng chung
      var supabaseClient = null;
      if (typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
        supabaseClient = supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
        window.supabaseClient = supabaseClient;
      }

      var QUESTION_TYPES = [
        ["single_choice", "Trắc nghiệm 1 đáp án"],
        ["multiple_choice", "Trắc nghiệm nhiều đáp án"],
        ["true_false", "Đúng / Sai"],
        ["fill_blank", "Điền đáp án"],
        ["drag_drop", "Chọn thẻ vào chỗ trống"]
      ];

      var SECTION_LABELS = {
        math: "Tư duy Toán học",
        reading: "Đọc hiểu",
        science: "Khoa học"
      };

      var activeEditorTab = "setup";
      var activeGroupIds = { reading: "", science: "" };
      var editingQuestion = { math: null, reading: null, science: null };
      var activeMathQuestionNo = 1;
      var importedQuestions = [];
      var exam = createEmptyExam("TSA001", "Đề TSA số 01", 45, "published");

      function $(selector) { return document.querySelector(selector); }
      function $all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
      function clone(value) { return JSON.parse(JSON.stringify(value)); }
      function esc(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }
      var attr = esc;

      function normalizeCode(value) {
        return String(value || "TSA001").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "") || "TSA001";
      }
      function nowTime() {
        var d = new Date();
        return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0");
      }

      var FORMULA_CONTENT_PATTERN = new RegExp([
        "\\\\\\(", "\\\\\\[", "\\\\d?frac", "\\\\sqrt", "\\\\lim", "\\\\sin", "\\\\cos", "\\\\tan",
        "\\\\text", "\\\\mathbb", "\\\\left", "\\\\right", "\\\\begin", "\\\\end",
        "\\^\\{", "_\\{", "\\bsqrt\\s*\\{", "\\bRightarrow\\b", "\\bLeftrightarrow\\b"
      ].join("|"));

      function hasFormulaContent(value) {
        if (value == null) return false;
        if (typeof value === "string") return FORMULA_CONTENT_PATTERN.test(value);
        if (Array.isArray(value)) return value.some(hasFormulaContent);
        if (typeof value === "object") {
          return Object.keys(value).some(function (key) { return hasFormulaContent(value[key]); });
        }
        return false;
      }

      function stripFormulaQuestions(targetExam) {
        var changed = false;
        if (!targetExam) return false;

        if (Array.isArray(targetExam.questions)) {
          var keptRootQuestions = targetExam.questions.filter(function (question) { return !hasFormulaContent(question); });
          if (keptRootQuestions.length !== targetExam.questions.length) changed = true;
          targetExam.questions = keptRootQuestions;
        }

        if (!Array.isArray(targetExam.sections)) return changed;

        targetExam.sections.forEach(function (section) {
          if (Array.isArray(section.questions)) {
            var kept = section.questions.filter(function (question) { return !hasFormulaContent(question); });
            if (kept.length !== section.questions.length) changed = true;
            section.questions = kept;
          }

          if (Array.isArray(section.groups)) {
            section.groups.forEach(function (group) {
              if (hasFormulaContent(group.stimulus)) {
                group.stimulus = { type: "text", content: "", image_url: "", image_width: 100 };
                changed = true;
              }
              if (Array.isArray(group.questions)) {
                var keptGroupQuestions = group.questions.filter(function (question) { return !hasFormulaContent(question); });
                if (keptGroupQuestions.length !== group.questions.length) changed = true;
                group.questions = keptGroupQuestions;
              }
            });
          }
        });

        return changed;
      }

      function stripStoredFormulaQuestions() {
        try {
          var keys = [];
          for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
          keys.forEach(function (key) {
            if (!/^tma_tsa_(teacher_draft|exam)_/.test(key)) return;
            try {
              var storedExam = JSON.parse(localStorage.getItem(key));
              if (stripFormulaQuestions(storedExam)) {
                localStorage.setItem(key, JSON.stringify(storedExam));
              }
            } catch (error) {}
          });
        } catch (error) {}
      }

      function createEmptyExam(code, title, duration, status) {
        return {
          exam_code: normalizeCode(code),
          title: title || "Đề TSA",
          duration_minutes: Number(duration) || 45,
          status: status || "draft",
          sections: [
            { section_id: "math", section_label: SECTION_LABELS.math, layout: "single", questions: [] },
            { section_id: "reading", section_label: SECTION_LABELS.reading, layout: "passage", groups: [] },
            { section_id: "science", section_label: SECTION_LABELS.science, layout: "passage", groups: [] }
          ]
        };
      }

      function ensureSchema() {
        if (!Array.isArray(exam.sections)) exam.sections = createEmptyExam(exam.exam_code, exam.title, exam.duration_minutes, exam.status).sections;
        ["math", "reading", "science"].forEach(function (id) {
          if (!getSection(id)) {
            if (id === "math") {
              var mathQuestions = [];
              for (var i = 1; i <= 40; i++) {
                mathQuestions.push({
                  question_no: i,
                  question_type: "single_choice",
                  question: "",
                  image_url: "",
                  options: [
                    { "key": "A", "text": "" },
                    { "key": "B", "text": "" },
                    { "key": "C", "text": "" },
                    { "key": "D", "text": "" }
                  ],
                  correct_answer: "A",
                  explanation: "",
                  points: 1
                });
              }
              exam.sections.push({ section_id: id, section_label: SECTION_LABELS[id], layout: "single", questions: mathQuestions });
            } else {
              exam.sections.push({ section_id: id, section_label: SECTION_LABELS[id], layout: "passage", groups: [] });
            }
          }
        });
        
        var mathSec = getSection("math");
        if (!Array.isArray(mathSec.questions)) {
          mathSec.questions = [];
        }
        
        // Populate up to 40 questions for math section
        while (mathSec.questions.length < 40) {
          var nextNo = mathSec.questions.length + 1;
          mathSec.questions.push({
            question_no: nextNo,
            question_type: "single_choice",
            question: "",
            image_url: "",
            options: [
              { "key": "A", "text": "" },
              { "key": "B", "text": "" },
              { "key": "C", "text": "" },
              { "key": "D", "text": "" }
            ],
            correct_answer: "A",
            explanation: "",
            points: 1
          });
        }

        // Clean placeholders from existing questions and option values
        mathSec.questions.forEach(function (q) {
          var qText = (q.question || "").trim();
          if (qText.indexOf("Nội dung câu hỏi") === 0 && qText.indexOf("chưa được nhập.") !== -1) {
            q.question = "";
          }
          if (Array.isArray(q.options)) {
            q.options.forEach(function (opt) {
              if (opt.text === "Đáp án A" || opt.text === "Đáp án B" || opt.text === "Đáp án C" || opt.text === "Đáp án D") {
                opt.text = "";
              }
            });
          }
        });

        // Keep sorted by question no
        mathSec.questions.sort(function (a, b) {
          return (Number(a.question_no) || 0) - (Number(b.question_no) || 0);
        });

        // Normalize: always make question_no match the 1-based array position
        for (var i = 0; i < mathSec.questions.length; i++) {
          mathSec.questions[i].question_no = i + 1;
        }

        ["reading", "science"].forEach(function (id) {
          if (!Array.isArray(getSection(id).groups)) getSection(id).groups = [];
        });

        // Enforce Reading Section Schema (exactly 2 groups, 10 questions each)
        var readingSec = getSection("reading");
        if (readingSec) {
          if (!Array.isArray(readingSec.groups)) readingSec.groups = [];
          
          // Keep only g1 and g2
          readingSec.groups = readingSec.groups.filter(function(g) {
            return g.group_id === "g1" || g.group_id === "g2";
          });
          
          // Check/Create Group 1 (g1)
          var g1 = readingSec.groups.find(function(g) { return g.group_id === "g1"; });
          if (!g1) {
            g1 = {
              group_id: "g1",
              title: "",
              stimulus: { type: "text", content: "", image_url: "", image_width: 100 },
              questions: []
            };
            readingSec.groups.push(g1);
          }
          if (!Array.isArray(g1.questions)) g1.questions = [];
          // Strip legacy demo placeholder text if still present
          if (g1.title === "Ngữ liệu Đọc hiểu số 01") g1.title = "";
          if (g1.stimulus && g1.stimulus.content === "Nhập nội dung ngữ liệu 1 ở đây...") g1.stimulus.content = "";
          while (g1.questions.length < 10) {
            var nextNo = g1.questions.length + 1;
            g1.questions.push({
              question_no: nextNo,
              question_type: "single_choice",
              question: "",
              image_url: "",
              options: [
                { key: "A", text: "" },
                { key: "B", text: "" },
                { key: "C", text: "" },
                { key: "D", text: "" }
              ],
              correct_answer: "A",
              explanation: "",
              points: 1
            });
          }
          // Sort and assign question numbers 1 to 10
          g1.questions.sort(function(a, b) { return (Number(a.question_no) || 0) - (Number(b.question_no) || 0); });
          for (var i = 0; i < g1.questions.length; i++) {
            g1.questions[i].question_no = i + 1;
          }

          // Check/Create Group 2 (g2)
          var g2 = readingSec.groups.find(function(g) { return g.group_id === "g2"; });
          if (!g2) {
            g2 = {
              group_id: "g2",
              title: "",
              stimulus: { type: "text", content: "", image_url: "", image_width: 100 },
              questions: []
            };
            readingSec.groups.push(g2);
          }
          if (!Array.isArray(g2.questions)) g2.questions = [];
          // Strip legacy demo placeholder text if still present
          if (g2.title === "Ngữ liệu Đọc hiểu số 02") g2.title = "";
          if (g2.stimulus && g2.stimulus.content === "Nhập nội dung ngữ liệu 2 ở đây...") g2.stimulus.content = "";
          while (g2.questions.length < 10) {
            var nextNo = g2.questions.length + 11; // 11 to 20
            g2.questions.push({
              question_no: nextNo,
              question_type: "single_choice",
              question: "",
              image_url: "",
              options: [
                { key: "A", text: "" },
                { key: "B", text: "" },
                { key: "C", text: "" },
                { key: "D", text: "" }
              ],
              correct_answer: "A",
              explanation: "",
              points: 1
            });
          }
          // Sort and assign question numbers 11 to 20
          g2.questions.sort(function(a, b) { return (Number(a.question_no) || 0) - (Number(b.question_no) || 0); });
          for (var i = 0; i < g2.questions.length; i++) {
            g2.questions[i].question_no = i + 11;
          }
          
          readingSec.g1 = g1;
          readingSec.g2 = g2;
          readingSec.g1_questions = g1.questions;
          readingSec.g2_questions = g2.questions;
          
          if (!activeGroupIds["reading"]) {
            activeGroupIds["reading"] = "g1";
          }
        }

        // Enforce Science Section Schema (exactly 8 groups, 5 questions each)
        var scienceSec = getSection("science");
        if (scienceSec) {
          if (!Array.isArray(scienceSec.groups)) scienceSec.groups = [];
          
          // Keep only g1 to g8
          var allowedScienceGroups = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"];
          scienceSec.groups = scienceSec.groups.filter(function(g) {
            return allowedScienceGroups.indexOf(g.group_id) !== -1;
          });
          
          for (var gIdx = 1; gIdx <= 8; gIdx++) {
            var gId = "g" + gIdx;
            var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
            if (!group) {
              group = {
                group_id: gId,
                title: "",
                stimulus: { type: "text", content: "", image_url: "", image_width: 100 },
                questions: []
              };
              scienceSec.groups.push(group);
            }
            if (!Array.isArray(group.questions)) group.questions = [];
            // Strip legacy demo placeholder text if still present
            if (group.title === "Ngữ liệu Khoa học số 0" + gIdx) group.title = "";
            if (group.stimulus && group.stimulus.content === "Nhập nội dung ngữ liệu khoa học " + gIdx + " ở đây...") group.stimulus.content = "";
            
            var startNo = (gIdx - 1) * 5 + 1;
            while (group.questions.length < 5) {
              var nextNo = startNo + group.questions.length;
              group.questions.push({
                question_no: nextNo,
                question_type: "single_choice",
                question: "",
                image_url: "",
                options: [
                  { key: "A", text: "" },
                  { key: "B", text: "" },
                  { key: "C", text: "" },
                  { key: "D", text: "" }
                ],
                correct_answer: "A",
                explanation: "",
                points: 1
              });
            }
            // Sort and assign question numbers
            group.questions.sort(function(a, b) { return (Number(a.question_no) || 0) - (Number(b.question_no) || 0); });
            for (var i = 0; i < group.questions.length; i++) {
              group.questions[i].question_no = startNo + i;
            }
            
            scienceSec[gId] = group;
            scienceSec[gId + "_questions"] = group.questions;
          }
          
          // Keep groups ordered from g1 to g8 in scienceSec.groups array
          scienceSec.groups.sort(function(a, b) {
            return allowedScienceGroups.indexOf(a.group_id) - allowedScienceGroups.indexOf(b.group_id);
          });
          
          if (!activeGroupIds["science"]) {
            activeGroupIds["science"] = "g1";
          }
        }
      }

      function getSection(id) {
        return (exam.sections || []).find(function (section) { return section.section_id === id; });
      }

      function draftKey(code) {
        return "tma_tsa_teacher_draft_" + normalizeCode(code || exam.exam_code);
      }

      function saveDraft() {
        syncMetadataFromForm(false);
        stripFormulaQuestions(exam);
        ensureSchema();
        try {
          localStorage.setItem(draftKey(), JSON.stringify(exam));
          localStorage.setItem("tma_tsa_teacher_last_exam_code", exam.exam_code);
          var statusEl = $("#autosave-status");
          if (statusEl) statusEl.textContent = "Đã lưu nháp " + nowTime();
        } catch (error) {
          var statusEl = $("#autosave-status");
          if (statusEl) statusEl.textContent = "Không lưu được nháp";
          console.warn(error);
        }
      }

      function loadDraft(code) {
        try {
          var raw = localStorage.getItem(draftKey(code));
          return raw ? JSON.parse(raw) : null;
        } catch (error) {
          return null;
        }
      }

      function syncMetadataToForm() {
        var codeEl = $("#exam-code");
        var titleEl = $("#exam-title-input");
        var durEl = $("#exam-duration");
        var statEl = $("#exam-status");

        if (codeEl) codeEl.value = exam.exam_code || "TSA001";
        if (titleEl) titleEl.value = exam.title || "";
        if (durEl) durEl.value = exam.duration_minutes || 45;
        if (statEl) statEl.value = exam.status || "draft";
      }

      function syncMetadataFromForm(allowCodeChange) {
        var codeEl = $("#exam-code");
        var titleEl = $("#exam-title-input");
        var durEl = $("#exam-duration");
        var statEl = $("#exam-status");

        var oldCode = exam.exam_code;
        var newCode = normalizeCode(codeEl ? codeEl.value : "");
        if (allowCodeChange !== false) exam.exam_code = newCode;
        else exam.exam_code = oldCode || newCode;

        if (titleEl) exam.title = titleEl.value.trim() || "Đề TSA";
        if (durEl) exam.duration_minutes = Number(durEl.value) || 45;
        if (statEl) exam.status = statEl.value || "draft";
      }

      function countAllQuestions() {
        var math = getSection("math").questions.length;
        var reading = getSection("reading").groups.reduce(function (sum, group) { return sum + (group.questions || []).length; }, 0);
        var science = getSection("science").groups.reduce(function (sum, group) { return sum + (group.questions || []).length; }, 0);
        return { math: math, reading: reading, science: science, total: math + reading + science };
      }

      function renderSummary() {
        ensureSchema();
        var counts = countAllQuestions();
        var summaryGrid = $("#summary-grid");
        if (summaryGrid) {
          summaryGrid.innerHTML =
            '<div class="summary-item"><span>Mã đề</span><strong>' + esc(exam.exam_code) + '</strong></div>' +
            '<div class="summary-item"><span>Toán</span><strong>' + counts.math + '/40</strong></div>' +
            '<div class="summary-item"><span>Đọc hiểu</span><strong>' + counts.reading + '</strong></div>' +
            '<div class="summary-item"><span>Khoa học</span><strong>' + counts.science + '</strong></div>';
        }
        var exportSummary = $("#export-summary");
        if (exportSummary) {
          exportSummary.innerHTML =
            '<div class="summary-item"><span>Trạng thái</span><strong>' + esc(exam.status) + '</strong></div>' +
            '<div class="summary-item"><span>Thời gian</span><strong>' + esc(exam.duration_minutes) + '</strong></div>' +
            '<div class="summary-item"><span>Tổng câu</span><strong>' + counts.total + '</strong></div>' +
            '<div class="summary-item"><span>File đề</span><strong>' + esc(exam.exam_code) + '.json</strong></div>';
        }
      }

      function moveGroupTabsToTopbar(tab) {
        var container = document.getElementById("topbar-group-tabs-container");
        if (!container) return;
        container.innerHTML = "";
        if (tab === "reading") {
          var nav = document.querySelector("#tab-reading .reading-tabs-nav") || document.querySelector(".reading-tabs-nav");
          if (nav) {
            container.appendChild(nav);
            container.style.display = "block";
          } else {
            container.style.display = "none";
          }
        } else if (tab === "science") {
          var nav = document.querySelector("#tab-science .science-tabs-nav") || document.querySelector(".science-tabs-nav");
          if (nav) {
            container.appendChild(nav);
            container.style.display = "block";
          } else {
            container.style.display = "none";
          }
        } else {
          container.style.display = "none";
        }
      }

      function restoreGroupTabsToPanels() {
        var container = document.getElementById("topbar-group-tabs-container");
        if (container) container.style.display = "none";

        var readingNav = document.querySelector("#topbar-group-tabs-container .reading-tabs-nav");
        if (readingNav) {
          var readingPanel = document.getElementById("tab-reading");
          if (readingPanel) {
            readingPanel.insertBefore(readingNav, readingPanel.firstChild);
          }
        }
        var scienceNav = document.querySelector("#topbar-group-tabs-container .science-tabs-nav");
        if (scienceNav) {
          var sciencePanel = document.getElementById("tab-science");
          if (sciencePanel) {
            sciencePanel.insertBefore(scienceNav, sciencePanel.firstChild);
          }
        }
      }

      function switchEditorTab(tab) {
        restoreGroupTabsToPanels();
        activeEditorTab = tab;
        // Update navigation UI
        document.querySelectorAll("#sidebar-editor-nav .editor-step, #sidebar-editor-nav .nav-button").forEach(function (button) {
          button.classList.toggle("active", button.getAttribute("data-editor-tab-target") === tab);
        });
        
        // Show correct panel inside editor view
        document.querySelectorAll("#editor-container .tab-panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.id === "tab-" + tab);
        });

        var titles = {
          setup: "Tạo đề",
          math: "Soạn phần Toán",
          reading: "Soạn phần Đọc hiểu",
          science: "Soạn phần Khoa học",
          export: "Lưu và xuất đề"
        };
        $("#page-title").textContent = titles[tab] || "Bộ soạn đề TSA";

        // Hide/show topbar title/subtitle, autosave, and summary grid on math, reading, science tabs
        var isSubjectTab = (tab === "math" || tab === "reading" || tab === "science");
        var titleWrapper = document.getElementById("topbar-title-wrapper");
        var editorControls = document.getElementById("topbar-editor-controls");
        var autosaveStatus = document.getElementById("autosave-status");
        var summaryGrid = document.getElementById("summary-grid");
        var topbar = document.querySelector("#editor-container .topbar");

        if (isSubjectTab) {
          if (titleWrapper) titleWrapper.style.display = "none";
          if (editorControls) editorControls.style.display = "flex";
          if (autosaveStatus) autosaveStatus.style.display = "none";
          if (summaryGrid) summaryGrid.style.display = "none";
          if (topbar) {
            topbar.style.marginBottom = (tab === "math") ? "12px" : "0px";
            topbar.style.paddingBottom = "0px";
          }
          updateTopbarQNo();
        } else {
          if (titleWrapper) titleWrapper.style.display = "block";
          if (editorControls) editorControls.style.display = "none";
          if (autosaveStatus) autosaveStatus.style.display = "block";
          if (summaryGrid) summaryGrid.style.display = "grid";
          if (topbar) {
            topbar.style.marginBottom = "18px";
            topbar.style.paddingBottom = "";
          }
        }

        var previewBtn = document.getElementById("header-preview-btn");
        if (previewBtn) {
          if (tab === "math") {
            previewBtn.style.display = "none";
          } else {
            previewBtn.style.display = "block";
          }
        }

        renderAll();
        moveGroupTabsToTopbar(tab);
      }

      // Expose to window for clicks
      window.switchEditorTab = switchEditorTab;

      function defaultQuestion(sectionId) {
        return {
          question_no: nextQuestionNo(sectionId),
          question_type: "single_choice",
          question: "",
          image_url: "",
          options: [
            { key: "A", text: "" },
            { key: "B", text: "" },
            { key: "C", text: "" },
            { key: "D", text: "" }
          ],
          correct_answer: "A",
          explanation: "",
          points: 1
        };
      }

      function nextQuestionNo(sectionId) {
        if (sectionId === "math") {
          var mathQs = getSection("math").questions;
          return mathQs.length ? Math.max.apply(null, mathQs.map(function (q) { return Number(q.question_no) || 0; })) + 1 : 1;
        }
        var group = getActiveGroup(sectionId);
        var list = group ? (group.questions || []) : [];
        return list.length ? Math.max.apply(null, list.map(function (q) { return Number(q.question_no) || 0; })) + 1 : 1;
      }

      function getQuestionDraft(sectionId) {
        if (sectionId === "math") {
          ensureSchema();
          if (!editingQuestion["math"] || editingQuestion["math"].index !== activeMathQuestionNo - 1) {
            var mathQs = getSection("math").questions;
            var q = clone(mathQs[activeMathQuestionNo - 1]);
            q.question_no = activeMathQuestionNo; // always align displayed number with slot
            editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: q };
          }
        } else if (sectionId === "reading" || sectionId === "science") {
          ensureSchema();
          var gId = activeGroupIds[sectionId] || "g1";
          if (!editingQuestion[sectionId] || editingQuestion[sectionId].index === -1) {
            var sec = getSection(sectionId);
            var group = sec.groups.find(function(g) { return g.group_id === gId; });
            var q = group && group.questions && group.questions[0] ? clone(group.questions[0]) : defaultQuestion(sectionId);
            editingQuestion[sectionId] = { index: 0, question: q };
          }
        } else {
          if (!editingQuestion[sectionId]) editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
        }
        return editingQuestion[sectionId].question;
      }

      function resetQuestion(sectionId) {
        editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }

      function switchQuestionType(sectionId, type) {
        var current = collectBaseQuestion(sectionId, false);
        current.question_type = type;
        applyTypeDefaults(current);
        editingQuestion[sectionId].question = current;
        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }
      window.switchQuestionType = switchQuestionType;

      function typeTabsHtml(sectionId, selected) {
        var icons = {
          single_choice: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
          multiple_choice: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
          true_false: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
          fill_blank: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m14 4 4 4"/><path d="M21.5 2.5a2.12 2.12 0 0 1 0 3l-12 12-4 1-1-4 12-12a2.12 2.12 0 0 1 3 0Z"/><path d="M3 22h18"/></svg>',
          drag_drop: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/></svg>'
        };

        return QUESTION_TYPES.map(function (item) {
          var isActive = selected === item[0];
          var icon = icons[item[0]] || "";
          return '<button type="button" class="q-type-tab-btn' + (isActive ? ' active' : '') + '" data-value="' + item[0] + '" onclick="switchQuestionType(\'' + sectionId + '\', \'' + item[0] + '\')">' + icon + '<span>' + item[1] + '</span></button>';
        }).join("");
      }

      function renderQuestionForm(sectionId) {
        var q = getQuestionDraft(sectionId);
        var form = $("#" + sectionId + "-question-form");
        if (!form) return;
        updateTopbarQNo();
        form.innerHTML =
          '<div class="form-grid" style="grid-template-columns: 1fr; gap: 10px; align-items: center; margin-bottom: 8px;">' +
            '<input type="hidden" id="' + sectionId + '-q-no" value="' + attr(q.question_no || 1) + '">' +
            '<input type="hidden" id="' + sectionId + '-q-type" value="' + attr(q.question_type) + '">' +

            // Editor View Wrapper
            '<div id="' + sectionId + '-editor-view" style="width: 100%; display: flex; flex-direction: column; gap: 20px;">' +
              // Row 2: Question Type tabs
              '<div class="q-type-tabs-nav" style="width: 100%; margin-bottom: 8px;">' +
                typeTabsHtml(sectionId, q.question_type) +
              '</div>' +
              // Inputs
              '<div class="field full"><label>Nội dung câu hỏi</label><textarea class="textarea" id="' + sectionId + '-q-text" placeholder="Nhập nội dung câu hỏi">' + esc(q.question || "") + '</textarea></div>' +
              '<div class="field full" style="display: ' + (sectionId === "reading" ? 'none' : 'grid') + '; grid-template-columns: 360px 180px 1fr; gap: 10px; align-items: end; margin-bottom: 0;">' +
                '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh nếu có</label><input class="input" id="' + sectionId + '-q-image" value="' + attr(q.image_url || "") + '" placeholder="assets/questions/' + attr(exam.exam_code) + '/cau-01.webp"></div>' +
                '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh: <span id="' + sectionId + '-q-image-width-val">' + (q.image_width || 100) + '</span>%</label>' +
                  '<input type="range" class="slider" id="' + sectionId + '-q-image-width" min="10" max="100" value="' + (q.image_width || 100) + '" style="width: 100%; display: block; height: 28px; margin: 0; padding: 0; cursor: pointer;">' +
                '</div>' +
              '</div>' +
              '<div class="field full" id="' + sectionId + '-type-fields" style="width: 100%;"></div>' +
              '<div class="field full"><label>Giải thích lời giải</label><textarea class="textarea" id="' + sectionId + '-q-explanation">' + esc(q.explanation || "") + '</textarea></div>' +
            '</div>' +

            // Preview View Wrapper
            '<div id="' + sectionId + '-preview-view" style="display: none; width: 100%;">' +
              (sectionId === "math"
                ? ('<div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">' +
                    '<div class="question-card" style="width: 100%; box-sizing: border-box;">' +
                      '<div class="question-layout-row" style="width: 100%;">' +
                        '<div class="question-number-circle" id="' + sectionId + '-preview-qno-circle">' + attr(q.question_no || 1) + '</div>' +
                        '<div class="question-text-content" style="flex: 1; min-width: 0;">' +
                          '<div class="question-body" id="' + sectionId + '-preview-body" style="width: 100%; word-break: break-word;"></div>' +
                          '<div class="answer-area" id="' + sectionId + '-preview-answer" style="width: 100%;"></div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>')
                : ('<div style="display: grid; grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr); gap: 0; width: 100%; min-height: 480px; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff;">' +
                    '<div id="' + sectionId + '-preview-stimulus" style="overflow-y: auto; padding: 20px 24px; border-right: 1.5px solid var(--line); background: #f8fafc; line-height: 1.85;"></div>' +
                    '<div style="overflow-y: auto; padding: 20px 24px;">' +
                      '<div class="question-layout-row" style="width: 100%; align-items: flex-start;">' +
                        '<div class="question-number-circle" id="' + sectionId + '-preview-qno-circle">' + attr(q.question_no || 1) + '</div>' +
                        '<div class="question-text-content" style="flex: 1; min-width: 0;">' +
                          '<div class="question-body" id="' + sectionId + '-preview-body" style="width: 100%; word-break: break-word;"></div>' +
                          '<div class="answer-area" id="' + sectionId + '-preview-answer" style="width: 100%;"></div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>')
              ) +
            '</div>' +
          '</div>';
        renderTypeFields(sectionId, q);
        
        var slider = $("#" + sectionId + "-q-image-width");
        var indicator = $("#" + sectionId + "-q-image-width-val");
        if (slider && indicator) {
          slider.addEventListener("input", function () {
            indicator.textContent = this.value;
          });
        }

        $all("#" + sectionId + "-question-form input, #" + sectionId + "-question-form textarea, #" + sectionId + "-question-form select").forEach(function (input) {
          input.addEventListener("input", function () { updatePreview(sectionId); });
          input.addEventListener("change", function () { updatePreview(sectionId); });
        });

        var saveBtn = document.querySelector('button[data-save-question="' + sectionId + '"]');
        if (saveBtn) {
          if (sectionId === "reading") {
            saveBtn.textContent = "Lưu câu hỏi";
          } else {
            saveBtn.textContent = (editingQuestion[sectionId]?.index === -1) ? "Thêm vào ngữ liệu" : "Lưu câu hỏi";
          }
        }
      }

      function applyTypeDefaults(q) {
        if (q.question_type === "single_choice" || q.question_type === "multiple_choice") {
          if (!Array.isArray(q.options) || !q.options.length) {
            q.options = [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }];
          }
          if (q.question_type === "single_choice" && Array.isArray(q.correct_answer)) q.correct_answer = q.correct_answer[0] || "A";
          if (q.question_type === "multiple_choice" && !Array.isArray(q.correct_answer)) q.correct_answer = q.correct_answer ? [q.correct_answer] : [];
        }
        if (q.question_type === "true_false") {
          q.statements = q.statements || [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }, { id: "d", text: "" }];
          q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer) ? q.correct_answer : { a: true, b: false, c: true, d: false };
        }
        if (q.question_type === "fill_blank") {
          q.correct_answer = typeof q.correct_answer === "string" ? q.correct_answer : "";
          q.accepted_answers = Array.isArray(q.accepted_answers) ? q.accepted_answers : [];
        }
        if (q.question_type === "numeric_answer") {
          q.correct_answer = Number.isFinite(Number(q.correct_answer)) ? Number(q.correct_answer) : 0;
          q.tolerance = Number.isFinite(Number(q.tolerance)) ? Number(q.tolerance) : 0;
        }
        if (q.question_type === "drag_drop") {
          q.body = Array.isArray(q.body) ? q.body : [{ type: "text", content: "Điền " }, { type: "blank", id: "b1" }, { type: "text", content: " vào chỗ trống." }];
          q.items = Array.isArray(q.items) ? q.items : [{ id: "i1", text: "đáp án" }];
          q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer) ? q.correct_answer : { b1: "i1" };
        }
      }

      function optionByKey(options, key) {
        var found = (options || []).find(function (item) { return item.key === key; });
        return found ? found.text : "";
      }

      function renderChoicesForm(q, isMulti) {
        var options = q.options || [];
        var ans = q.correct_answer || (isMulti ? [] : "A");
        var containerClass = isMulti ? "is-multiple-choice" : "is-single-choice";
        var html = '<div class="choices-container ' + containerClass + '">';
        options.forEach(function (opt) {
          var isSelected = false;
          if (isMulti) {
            isSelected = Array.isArray(ans) ? ans.includes(opt.key) : false;
          } else {
            isSelected = ans === opt.key;
          }
          var selectedClass = isSelected ? " is-selected" : "";
          var inputType = isMulti ? "checkbox" : "radio";
          var checkedAttr = isSelected ? " checked" : "";
          
          html += '<div class="choice-item' + selectedClass + '" onclick="toggleTeacherChoiceSelection(this, \'' + opt.key + '\', ' + isMulti + ')">' +
            '<input type="' + inputType + '" name="choice-correct" value="' + opt.key + '"' + checkedAttr + ' style="display:none;">' +
            '<input class="choice-input-field" data-choice-key="' + opt.key + '" value="' + attr(opt.text || "") + '" placeholder="Nhập đáp án..." onclick="event.stopPropagation();">' +
            '</div>';
        });
        html += '</div>';
        return html;
      }

      function renderNumericForm(q) {
        return '<div class="form-grid">' +
          '<div class="field"><label>Đáp án số chính xác</label><input class="input" type="number" step="any" id="num-answer" value="' + attr(q.correct_answer || "") + '" placeholder="Nhập đáp án số"></div>' +
          '<div class="field"><label>Sai số cho phép (Tolerance)</label><input class="input" type="number" step="any" id="num-tolerance" value="' + attr(q.tolerance || 0) + '" placeholder="Ví dụ: 0.01"></div>' +
          '</div>';
      }

      function renderTrueFalseForm(q, sectionId) {
        var list = q.statements || [];
        var ans = q.correct_answer || {};
        
        var html = '<div class="statement-header-outside">';
        html += '<div></div>';
        html += '<div class="statement-header-label">Đúng</div>';
        html += '<div class="statement-header-label">Sai</div>';
        html += '<div></div>';
        html += '</div>';

        html += '<div class="statement-table">';
        list.forEach(function (item) {
          var id = item.id;
          var textVal = item.text || "";
          var isTrue = ans[id] === true;
          var isFalse = ans[id] === false;
          
          var trueActive = isTrue ? " is-active" : "";
          var falseActive = isFalse ? " is-active" : "";

          html +=
            '<div class="statement-row">' +
            '<div class="statement-cell-text"><input class="input-inline-editor" data-tf-id="' + id + '" value="' + attr(textVal) + '" placeholder="Nhập nhận định..."></div>' +
            '<div class="statement-cell-btn">' +
            '<button type="button" class="statement-btn' + trueActive + '" onclick="toggleTeacherTfSelection(\'' + id + '\', true, this)"></button>' +
            '<input type="radio" name="tf-correct-' + id + '" value="T"' + (isTrue ? " checked" : "") + ' style="display:none;">' +
            '</div>' +
            '<div class="statement-cell-btn">' +
            '<button type="button" class="statement-btn' + falseActive + '" onclick="toggleTeacherTfSelection(\'' + id + '\', false, this)"></button>' +
            '<input type="radio" name="tf-correct-' + id + '" value="F"' + (isFalse ? " checked" : "") + ' style="display:none;">' +
            '</div>' +
            '<div class="statement-cell-btn">' +
             '<button type="button" style="background: none; border: none; color: #b91c1c; font-weight: 700; font-size: 13.5px; cursor: pointer; padding: 0; margin: 0; display: inline-flex; align-items: center; justify-content: center;" onclick="removeTfStatement(\'' + sectionId + '\', \'' + id + '\')">Xóa</button>' +
            '</div>' +
            '</div>';
        });
        html += '</div>';
        html += '<button type="button" class="btn btn-outline" style="margin-top: 6px; font-weight: 700; min-height: 24px; height: 24px; padding: 0 8px; font-size: 11px; border-radius: 6px;" onclick="addTfStatement(\'' + sectionId + '\')">+ Thêm nhận định</button>';
        return html;
      }

      function renderTypeFields(sectionId, q) {
        var box = $("#" + sectionId + "-type-fields");
        var type = q.question_type || "single_choice";
        if (!box) return;
        box.innerHTML = "";
        if (type === "single_choice" || type === "multiple_choice") {
          box.innerHTML = renderChoicesForm(q, type === "multiple_choice");
        } else if (type === "true_false") {
          box.innerHTML = renderTrueFalseForm(q, sectionId);
        } else if (type === "fill_blank") {
          box.innerHTML = renderShortAnswerForm(q);
        } else if (type === "numeric_answer") {
          box.innerHTML = renderNumericForm(q);
        } else if (type === "drag_drop") {
          box.innerHTML = renderDragDropForm(q);
        }
      }

      function addTfStatement(sectionId) {
        var q = getQuestionDraft(sectionId);
        if (!Array.isArray(q.statements)) q.statements = [];
        
        var nextIdNum = q.statements.length + 1;
        var nextId = "s" + nextIdNum;
        while (q.statements.some(function(s) { return s.id === nextId; })) {
          nextIdNum++;
          nextId = "s" + nextIdNum;
        }

        q.statements.push({ id: nextId, text: "" });
        if (!q.correct_answer || typeof q.correct_answer !== "object") q.correct_answer = {};
        q.correct_answer[nextId] = true;

        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }
      window.addTfStatement = addTfStatement;

      function removeTfStatement(sectionId, id) {
        var q = getQuestionDraft(sectionId);
        if (!Array.isArray(q.statements)) return;
        q.statements = q.statements.filter(function(s) { return s.id !== id; });
        if (q.correct_answer && typeof q.correct_answer === "object") {
          delete q.correct_answer[id];
        }
        renderQuestionForm(sectionId);
        updatePreview(sectionId);
      }
      window.removeTfStatement = removeTfStatement;

      function renderShortAnswerForm(q) {
        var accepts = Array.isArray(q.accepted_answers) ? q.accepted_answers.join(" | ") : "";
        return '<div class="form-grid">' +
          '<div class="field"><label>Đáp án chính xác</label><input class="input" id="fill-correct" value="' + attr(q.correct_answer || "") + '" placeholder="Đáp án viết thường hoặc hoa đều chấp nhận"></div>' +
          '<div class="field"><label>Các đáp án đồng nghĩa khác (Ngăn cách bởi dấu |)</label><input class="input" id="fill-accepted" value="' + attr(accepts) + '" placeholder="ví dụ: 0.5 | 1/2"></div>' +
          '</div>';
      }

      function renderDragDropForm(q) {
        var itemsVal = (q.items || []).map(function (it) { return it.text; }).join(" | ");
        var bodyVal = (q.body || []).map(function (block) {
          return block.type === "blank" ? "[" + block.id + "]" : block.content;
        }).join("");
        var corrVal = Object.keys(q.correct_answer || {}).map(function (k) { return k + "=" + q.correct_answer[k]; }).join(" | ");
        return '<div style="display:grid;gap:10px;">' +
          '<div class="field"><label>Các nhãn thẻ kéo (Ngăn cách bởi dấu |)</label><input class="input" id="drag-items" value="' + attr(itemsVal) + '" placeholder="nhãn 1 | nhãn 2"></div>' +
          '<div class="field"><label>Nội dung chứa ô trống. Dùng [o1], [o2] làm vị trí ô trống.</label><textarea class="textarea" id="drag-body" style="min-height: 100px;" placeholder="Ví dụ: Ban đầu: [o1] | Lúc sau: [o2]">' + esc(bodyVal) + '</textarea></div>' +
          '<div class="field"><label>Đáp án đúng từng ô (Dạng: o1=nhãn1 | o2=nhãn2)</label><input class="input" id="drag-correct" value="' + attr(corrVal) + '" placeholder="Ví dụ: o1=5 | o2=8"></div>' +
          '</div>';
      }

      function collectBaseQuestion(sectionId, doValidation) {
        var base = {
          question_no: Number($("#" + sectionId + "-q-no")?.value) || nextQuestionNo(sectionId),
          question_type: $("#" + sectionId + "-q-type")?.value || "single_choice",
          question: $("#" + sectionId + "-q-text")?.value || "",
          image_url: $("#" + sectionId + "-q-image")?.value || "",
          image_width: Number($("#" + sectionId + "-q-image-width")?.value) || 100,
          explanation: $("#" + sectionId + "-q-explanation")?.value || "",
          points: 1
        };
        var type = base.question_type;
        if (type === "single_choice" || type === "multiple_choice") {
          var opts = [];
          $all("#" + sectionId + "-type-fields input[data-choice-key]").forEach(function (input) {
            opts.push({ key: input.getAttribute("data-choice-key"), text: input.value.trim() });
          });
          base.options = opts;
          if (type === "single_choice") {
            var checkedRadio = $("#"+sectionId+"-type-fields input[name='choice-correct']:checked");
            base.correct_answer = checkedRadio ? checkedRadio.value : "A";
          } else {
            var corrects = [];
            $all("#" + sectionId + "-type-fields input[name='choice-correct']:checked").forEach(function (cb) {
              corrects.push(cb.value);
            });
            base.correct_answer = corrects;
          }
        } else if (type === "true_false") {
          var statements = [];
          var correct_answer = {};
          $all("#" + sectionId + "-type-fields input[data-tf-id]").forEach(function (input) {
            var id = input.getAttribute("data-tf-id");
            statements.push({ id: id, text: input.value.trim() });
            var correctRadio = $("#"+sectionId+"-type-fields input[name='tf-correct-" + id + "']:checked");
            correct_answer[id] = correctRadio ? (correctRadio.value === "T") : true;
          });
          base.statements = statements;
          base.correct_answer = correct_answer;
        } else if (type === "fill_blank") {
          base.correct_answer = ($("#fill-correct")?.value || "").trim();
          var accs = ($("#fill-accepted")?.value || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
          base.accepted_answers = accs;
        } else if (type === "numeric_answer") {
          base.correct_answer = Number($("#num-answer")?.value) || 0;
          base.tolerance = Number($("#num-tolerance")?.value) || 0;
        } else if (type === "drag_drop") {
          var rawItems = ($("#drag-items")?.value || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
          var items = rawItems.map(function (text, index) { return { id: "item" + (index + 1), text: text }; });
          base.items = items;

          var bodyStr = $("#drag-body")?.value || "";
          var bodyBlocks = [];
          var lastIdx = 0;
          var regex = /\[(o\d+)\]/g;
          var match;
          while ((match = regex.exec(bodyStr)) !== null) {
            var textBefore = bodyStr.substring(lastIdx, match.index);
            if (textBefore) bodyBlocks.push({ type: "text", content: textBefore });
            bodyBlocks.push({ type: "blank", id: match[1] });
            lastIdx = regex.lastIndex;
          }
          var textAfter = bodyStr.substring(lastIdx);
          if (textAfter) bodyBlocks.push({ type: "text", content: textAfter });
          base.body = bodyBlocks;

          var correct_answer = {};
          var corrStr = $("#drag-correct")?.value || "";
          corrStr.split("|").forEach(function (pair) {
            var parts = pair.split("=");
            if (parts.length === 2) {
              var blankId = parts[0].trim();
              var matchText = parts[1].trim();
              var foundItem = items.find(function (it) { return it.text === matchText; });
              correct_answer[blankId] = foundItem ? foundItem.id : matchText;
            }
          });
          base.correct_answer = correct_answer;
        }
        return base;
      }

      function saveQuestion(sectionId) {
        var base = collectBaseQuestion(sectionId, true);
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        if (sectionId !== "math" && !getActiveGroup(sectionId)) {
          window.alert("Vui lòng tạo hoặc chọn một Ngữ liệu trước.");
          return;
        }

        var idx = editingQuestion[sectionId].index;
        if (idx === -1) {
          qList.push(base);
        } else {
          qList[idx] = base;
        }
        saveDraft();
        if (sectionId === "reading" || sectionId === "science") {
          editingQuestion[sectionId].question = clone(base);
          window.alert("Đã lưu câu hỏi " + base.question_no + " thành công!");
        } else {
          resetQuestion(sectionId);
        }
        renderAll();
      }

      function renderMathWizardNav() {
        var grid = $("#math-wizard-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        ensureSchema();
        var mathSec = getSection("math");
        var questions = mathSec.questions || [];
        
        var editedCount = 0;
        for (var i = 1; i <= 40; i++) {
          var q = questions.find(function(item) { return (Number(item.question_no) || 0) === i; });
          var isFilled = false;
          if (q) {
            var qText = (q.question || "").trim();
            var hasImage = (q.image_url || "").trim() !== "";
            var hasText = qText !== "" && qText !== ("Nội dung câu hỏi " + i + " chưa được nhập.");
            var hasOptions = false;
            if (Array.isArray(q.options)) {
              hasOptions = q.options.some(function (opt) {
                var oText = (opt.text || "").trim();
                return oText !== "" && oText !== "Đáp án A" && oText !== "Đáp án B" && oText !== "Đáp án C" && oText !== "Đáp án D";
              });
            }
            if (hasText || hasImage || hasOptions) {
              isFilled = true;
            }
          }
          if (isFilled) {
            editedCount++;
          }
          
          var isActive = i === activeMathQuestionNo;
          
          var styleStr = "display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; padding: 0;";
          if (isFilled) {
            styleStr += " background: var(--brand); border: 1.5px solid var(--brand-dark); color: #fff;";
          } else {
            styleStr += " background: #fff; border: 1.5px solid var(--line); color: var(--muted);";
          }
          if (isActive) {
            styleStr += " box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--brand); z-index: 1; font-weight: 800;";
          }
          
          var btnHtml = '<button type="button" style="' + styleStr + '" onclick="selectMathWizardQuestion(' + i + ')">' + i + '</button>';
          grid.innerHTML += btnHtml;
        }
        
        var progressEl = $("#math-wizard-progress");
        if (progressEl) {
          progressEl.textContent = "Tiến độ: " + editedCount + "/40 câu đã soạn";
        }
        
        var prevBtn = $("#math-wizard-prev");
        var nextBtn = $("#math-wizard-save-next");
        var navNextBtn = $("#math-wizard-next");
        if (prevBtn) {
          prevBtn.disabled = (activeMathQuestionNo === 1);
        }
        if (navNextBtn) {
          navNextBtn.disabled = (activeMathQuestionNo === 40);
        }
        if (nextBtn) {
          if (activeMathQuestionNo === 40) {
            nextBtn.textContent = "Lưu câu cuối cùng";
          } else {
            nextBtn.textContent = "Lưu & Câu tiếp →";
          }
        }
      }
      window.renderMathWizardNav = renderMathWizardNav;

      function selectMathWizardQuestion(qNo) {
        if (qNo < 1 || qNo > 40) return;
        
        // Auto-save current draft before switching
        if (editingQuestion["math"]) {
          var currentVal = collectBaseQuestion("math", false);
          currentVal.question_no = activeMathQuestionNo; // always keep question_no correct
          ensureSchema();
          var mathSec2 = getSection("math");
          mathSec2.questions[activeMathQuestionNo - 1] = currentVal;
          saveDraft();
        }
        
        activeMathQuestionNo = qNo;
        ensureSchema();
        var mathSec = getSection("math");
        // Load by array slot (ensureSchema ensures 40 items), then force question_no to match slot
        var targetQ = clone(mathSec.questions[activeMathQuestionNo - 1]);
        targetQ.question_no = activeMathQuestionNo; // always correct the displayed number
        
        editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: targetQ };
        renderQuestionForm("math");
        renderMathWizardNav();
        setEditorRoleView("math", "teacher");
        
        var form = $("#math-question-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      window.selectMathWizardQuestion = selectMathWizardQuestion;

      function navigateMathWizard(dir) {
        var targetQNo = activeMathQuestionNo + dir;
        if (targetQNo >= 1 && targetQNo <= 40) {
          selectMathWizardQuestion(targetQNo);
        }
      }
      window.navigateMathWizard = navigateMathWizard;

      function saveMathWizardQuestion(goToNext) {
        ensureSchema();
        var base = collectBaseQuestion("math", true);
        base.question_no = activeMathQuestionNo; // always keep question_no aligned with slot
        var targetSection = getSection("math");
        
        targetSection.questions[activeMathQuestionNo - 1] = base;
        
        saveDraft();
        renderMathWizardNav();
        
        if (goToNext && activeMathQuestionNo < 40) {
          selectMathWizardQuestion(activeMathQuestionNo + 1);
        } else {
          editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: clone(base) };
          renderQuestionForm("math");
          window.alert("Đã lưu câu hỏi " + activeMathQuestionNo + " thành công!");
        }
      }
      window.saveMathWizardQuestion = saveMathWizardQuestion;

      function editQuestion(sectionId, index) {
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        var q = clone(qList[index]);
        if (!q) return;

        editingQuestion[sectionId] = { index: index, question: q };
        renderQuestionForm(sectionId);
        setEditorRoleView(sectionId, "teacher");
        updatePreview(sectionId);
        
        var form = $("#" + sectionId + "-question-form");
        if (form) form.scrollIntoView({ behavior: "smooth" });
      }

      async function deleteQuestion(sectionId, index) {
        if (!await showCustomConfirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        qList.splice(index, 1);
        saveDraft();
        renderAll();
      }

      async function clearAllQuestions(sectionId) {
        if (!await showCustomConfirm("Bạn có chắc chắn muốn xóa TOÀN BỘ câu hỏi của phần này? Hành động này không thể hoàn tác.")) return;
        ensureSchema();
        var targetSection = getSection(sectionId);
        if (sectionId === "math") {
          targetSection.questions = [];
          activeMathQuestionNo = 1;
          editingQuestion["math"] = null;
        } else {
          var group = getActiveGroup(sectionId);
          if (group) {
            group.questions = [];
          }
        }
        saveDraft();
        renderAll();
      }
      window.clearAllQuestions = clearAllQuestions;

      function cloneQuestion(sectionId, index) {
        ensureSchema();
        var targetSection = getSection(sectionId);
        var qList = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);
        var original = qList[index];
        if (!original) return;

        var copied = clone(original);
        copied.question_no = nextQuestionNo(sectionId);
        qList.push(copied);
        saveDraft();
        renderAll();
      }

      // Group / Passage functions
      function getActiveGroup(sectionId) {
        var section = getSection(sectionId);
        if (!section || !Array.isArray(section.groups)) return null;
        var activeId = activeGroupIds[sectionId];
        if (!activeId) {
          if (section.groups.length) {
            activeGroupIds[sectionId] = section.groups[0].group_id;
            return section.groups[0];
          }
          return null;
        }
        return section.groups.find(function (g) { return g.group_id === activeId; }) || null;
      }

      function newGroup(sectionId) {
        var newId = "group_" + Date.now();
        var groupObj = {
          group_id: newId,
          title: "",
          stimulus: {
            type: "text",
            content: "",
            image_url: ""
          },
          questions: []
        };
        ensureSchema();
        getSection(sectionId).groups.push(groupObj);
        activeGroupIds[sectionId] = newId;
        saveDraft();
        renderAll();
      }

      function saveGroup(sectionId) {
        var group = getActiveGroup(sectionId);
        if (!group) return;
        var titleInp = $("#" + sectionId + "-g-title");
        var textInp = $("#" + sectionId + "-g-text");
        var imgInp = $("#" + sectionId + "-g-image");
        var imgWidthInp = $("#" + sectionId + "-g-image-width");

        if (titleInp) group.title = titleInp.value.trim() || "Chủ đề ngữ liệu";
        if (!group.stimulus) group.stimulus = {};
        if (textInp) group.stimulus.content = textInp.value || "";
        if (imgInp) group.stimulus.image_url = imgInp.value.trim() || "";
        if (imgWidthInp) group.stimulus.image_width = Number(imgWidthInp.value) || 100;

        saveDraft();
        renderAll();
        window.alert("Đã lưu nội dung ngữ liệu bên trái.");
      }

      function selectGroup(sectionId, id) {
        activeGroupIds[sectionId] = id;
        resetQuestion(sectionId);
        renderAll();
      }

      async function deleteGroup(sectionId, id) {
        if (!await showCustomConfirm("Xóa ngữ liệu này sẽ xóa TOÀN BỘ các câu hỏi đi kèm bên trong. Bạn chắc chắn?")) return;
        var section = getSection(sectionId);
        var idx = section.groups.findIndex(function (g) { return g.group_id === id; });
        if (idx !== -1) {
          section.groups.splice(idx, 1);
          if (activeGroupIds[sectionId] === id) activeGroupIds[sectionId] = "";
          saveDraft();
          resetQuestion(sectionId);
          renderAll();
        }
      }

      function renderAll() {
        renderSummary();
        if (activeEditorTab === "reading") {
          updateReadingTabsUI();
        }
        if (activeEditorTab === "science") {
          updateScienceTabsUI();
        }
        ["math", "reading", "science"].forEach(function (sectionId) {
          if (activeEditorTab === sectionId) {
            if (sectionId === "math") {
              ensureSchema();
              if (!editingQuestion["math"] || editingQuestion["math"].index !== activeMathQuestionNo - 1) {
                var mathQs = getSection("math").questions;
                editingQuestion["math"] = { index: activeMathQuestionNo - 1, question: clone(mathQs[activeMathQuestionNo - 1]) };
              }
              renderQuestionForm("math");
              renderMathWizardNav();
            } else {
              renderQuestionForm(sectionId);
              renderQuestionList(sectionId);
              renderGroupList(sectionId);
              renderActiveGroupDetails(sectionId);
              renderSubjectWizardNav(sectionId);
            }
            updatePreview(sectionId);
          }
        });
      }

      function renderImportGroups() {
        var select = $("#import-group");
        if (!select) return;
        var secId = $("#import-section").value;
        select.innerHTML = "";
        if (secId === "math") {
          select.innerHTML = '<option value="">Không dùng ngữ liệu (Mặc định phần Toán)</option>';
          return;
        }
        ensureSchema();
        var groups = getSection(secId).groups || [];
        if (!groups.length) {
          select.innerHTML = '<option value="">(Chưa có ngữ liệu nào, hãy sang tab ' + (secId === "reading" ? "Đọc hiểu" : "Khoa học") + ' tạo trước)</option>';
          return;
        }
        select.innerHTML = groups.map(function (g) {
          return '<option value="' + g.group_id + '">' + esc(g.title) + '</option>';
        }).join("");
      }

      function renderQuestionList(sectionId) {
        var tbody = $("#" + sectionId + "-question-list");
        if (!tbody) return;
        tbody.innerHTML = "";
        ensureSchema();

        if (sectionId === "reading") {
          var readingSec = getSection("reading");
          var gId = activeGroupIds["reading"] || "g1";
          var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
          var numberLabel = gId === "g1" ? "1" : "2";
          var rangeLabel = gId === "g1" ? "Câu 1 - 10" : "Câu 11 - 20";
          
          var html = "";
          
          html += '<tr><td colspan="4" style="background: #f8fafc; font-weight: 700; color: var(--brand); padding: 8px 12px; border-bottom: 1.5px solid var(--line);">Ngữ liệu ' + numberLabel + ' (' + rangeLabel + ')</td></tr>';
          var gList = group ? (group.questions || []) : [];
          if (!gList.length) {
            html += '<tr><td colspan="4" class="empty">Chưa có câu hỏi nào cho Ngữ liệu ' + numberLabel + '.</td></tr>';
          } else {
            html += gList.map(function (q, index) {
              var label = (QUESTION_TYPES.find(function (t) { return t[0] === q.question_type; }) || ["", "Khác"])[1];
              var isActive = editingQuestion["reading"]?.index === index;
              return '<tr class="' + (isActive ? 'table-row-active' : '') + '">' +
                '<td class="table-main" style="text-align:center;">' + q.question_no + '</td>' +
                '<td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(q.question || "Nội dung trống") + '</td>' +
                '<td><span class="status type">' + label + '</span></td>' +
                '<td><div class="actions">' +
                '<button class="btn btn-small btn-outline" onclick="editReadingQuestion(\'' + gId + '\', ' + index + ')">Sửa</button>' +
                '</div></td>' +
                '</tr>';
            }).join("");
          }
          
          tbody.innerHTML = html;
          return;
        }

        var targetSection = getSection(sectionId);
        var list = sectionId === "math" ? targetSection.questions : (getActiveGroup(sectionId)?.questions || []);

        if (!list.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="empty">Chưa có câu hỏi nào được thêm.</td></tr>';
          return;
        }

        tbody.innerHTML = list.map(function (q, index) {
          var label = (QUESTION_TYPES.find(function (t) { return t[0] === q.question_type; }) || ["", "Khác"])[1];
          return '<tr>' +
            '<td class="table-main" style="text-align:center;">' + q.question_no + '</td>' +
            '<td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(q.question) + '</td>' +
            '<td><span class="status type">' + label + '</span></td>' +
            '<td><div class="actions">' +
            '<button class="btn btn-small btn-outline" data-edit-question="' + sectionId + '" data-index="' + index + '">Sửa</button>' +
            '<button class="btn btn-small btn-outline" data-clone-question="' + sectionId + '" data-index="' + index + '">Nhân bản</button>' +
            '<button class="btn btn-small btn-danger" data-delete-question="' + sectionId + '" data-index="' + index + '">Xóa</button>' +
            '</div></td>' +
            '</tr>';
        }).join("");
      }



      function editReadingQuestion(groupId, index) {
        ensureSchema();
        activeGroupIds["reading"] = groupId;
        editQuestion("reading", index);
      }
      window.editReadingQuestion = editReadingQuestion;

      function renderGroupList(sectionId) {
        var listEl = $("#" + sectionId + "-group-list");
        if (!listEl) return;
        listEl.innerHTML = "";
        ensureSchema();
        var groups = getSection(sectionId).groups || [];
        if (!groups.length) {
          listEl.innerHTML = '<div class="empty">Chưa có chủ đề ngữ liệu nào. Hãy bấm "Thêm ngữ liệu".</div>';
          return;
        }

        var activeId = activeGroupIds[sectionId];
        listEl.innerHTML = groups.map(function (g) {
          var count = (g.questions || []).length;
          var activeClass = g.group_id === activeId ? " active" : "";
          return '<div class="mini-item' + activeClass + '">' +
            '<h4>' + esc(g.title || "Chưa có tiêu đề") + '</h4>' +
            '<p>' + count + ' câu hỏi đi kèm</p>' +
            '<div class="btn-row" style="margin-top:8px;">' +
            '<button class="btn btn-small btn-outline" data-select-group="' + sectionId + '" data-group-id="' + g.group_id + '">Chọn</button>' +
            '<button class="btn btn-small btn-danger" data-delete-group="' + sectionId + '" data-group-id="' + g.group_id + '">Xóa</button>' +
            '</div>' +
            '</div>';
        }).join("");
      }

      function renderActiveGroupDetails(sectionId) {
        var form = $("#" + sectionId + "-group-form");
        if (!form) return;
        form.innerHTML = "";
        
        if (sectionId === "reading") {
          ensureSchema();
          var readingSec = getSection("reading");
          var gId = activeGroupIds["reading"] || "g1";
          var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
          if (!group) return;
          
          var numberLabel = gId === "g1" ? "1" : "2";
          var rangeLabel = gId === "g1" ? "Câu 1 - 10" : "Câu 11 - 20";
          
          form.innerHTML = 
            '<div class="passage-group-card" style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #fff;">' +
              '<h3 style="font-size: 14px; font-weight: 700; color: var(--brand); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--brand);"></span> Ngữ liệu ' + numberLabel + ' (' + rangeLabel + ')' +
              '</h3>' +
              '<div class="form-grid" style="gap: 18px 20px;">' +
                '<div class="field full"><label>Tiêu đề ngữ liệu ' + numberLabel + '</label><input class="input" id="reading-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Đọc hiểu số 0' + numberLabel + '"></div>' +
                '<div class="field full"><label>Nội dung văn bản / dữ liệu ' + numberLabel + '</label><textarea class="textarea" id="reading-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung đoạn văn / ngữ liệu ' + numberLabel + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea></div>' +
                '<div class="btn-row" style="margin-top: 8px;">' +
                  '<button class="btn btn-primary btn-small" type="button" onclick="saveReadingGroupDirect(\'' + gId + '\')" style="background-color: var(--brand); border-color: var(--brand); font-weight: 700; color: #fff; border-radius: 8px; padding: 6px 12px;">Lưu ngữ liệu ' + numberLabel + '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
            
          var titleInp = $("#reading-" + gId + "-title");
          var textInp = $("#reading-" + gId + "-text");
          [titleInp, textInp].forEach(function(inp) {
            if (inp) {
              inp.addEventListener("input", function() {
                var readingSec = getSection("reading");
                var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
                if (group) {
                  if (inp.id.includes("title")) {
                    group.title = inp.value;
                  } else {
                    if (!group.stimulus) group.stimulus = {};
                    group.stimulus.content = inp.value;
                  }
                }
                updatePreview("reading");
              });
            }
          });
          return;
        }

        if (sectionId === "science") {
          ensureSchema();
          var scienceSec = getSection("science");
          var gId = activeGroupIds["science"] || "g1";
          var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
          if (!group) return;
          
          var gIdx = Number(gId.replace("g", "")) || 1;
          var startNo = (gIdx - 1) * 5 + 1;
          var rangeLabel = "Câu " + startNo + " - " + (startNo + 4);
          
          var groupImgWidth = group.stimulus?.image_width || 100;
          
          form.innerHTML = 
            '<div class="passage-group-card" style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background: #fff;">' +
              '<h3 style="font-size: 14px; font-weight: 700; color: var(--brand); margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--brand);"></span> Ngữ liệu ' + gIdx + ' (' + rangeLabel + ')' +
              '</h3>' +
              '<div class="form-grid" style="gap: 18px 20px;">' +
                '<div class="field full"><label>Tiêu đề ngữ liệu ' + gIdx + '</label><input class="input" id="science-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Khoa học số 0' + gIdx + '"></div>' +
                '<div class="field full"><label>Nội dung văn bản / dữ liệu ' + gIdx + '</label><textarea class="textarea" id="science-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung dữ liệu khoa học ' + gIdx + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea></div>' +
                '<div class="field full" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 0;">' +
                  '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh ngữ liệu ' + gIdx + ': <span id="science-' + gId + '-image-width-val" style="font-weight:700; color:var(--brand);">' + groupImgWidth + '</span>%</label>' +
                    '<input type="range" class="slider" id="science-' + gId + '-image-width" min="10" max="100" value="' + groupImgWidth + '" style="width: 100%; display: block; height: 28px; margin: 0; padding: 0; cursor: pointer;">' +
                  '</div>' +
                  '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh ngữ liệu ' + gIdx + ' nếu có</label><input class="input" id="science-' + gId + '-image" value="' + attr(group.stimulus?.image_url || "") + '" placeholder="assets/questions/' + attr(exam.exam_code) + '/ngu-lieu-01.webp"></div>' +
                '</div>' +
                '<div class="btn-row" style="margin-top: 8px;">' +
                  '<button class="btn btn-primary btn-small" type="button" onclick="saveScienceGroupDirect(\'' + gId + '\')" style="background-color: var(--brand); border-color: var(--brand); font-weight: 700; color: #fff; border-radius: 8px; padding: 6px 12px;">Lưu ngữ liệu ' + gIdx + '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
            
          var titleInp = $("#science-" + gId + "-title");
          var textInp = $("#science-" + gId + "-text");
          var imgInp = $("#science-" + gId + "-image");
          var slider = $("#science-" + gId + "-image-width");
          var indicator = $("#science-" + gId + "-image-width-val");
          
          if (slider && indicator) {
            slider.addEventListener("input", function() {
              indicator.textContent = this.value;
              var scienceSec = getSection("science");
              var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
              if (group) {
                if (!group.stimulus) group.stimulus = {};
                group.stimulus.image_width = Number(this.value);
              }
              updatePreview("science");
            });
          }
          
          [titleInp, textInp, imgInp].forEach(function(inp) {
            if (inp) {
              inp.addEventListener("input", function() {
                var scienceSec = getSection("science");
                var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
                if (group) {
                  if (inp.id.includes("title")) {
                    group.title = inp.value;
                  } else if (inp.id.includes("text")) {
                    if (!group.stimulus) group.stimulus = {};
                    group.stimulus.content = inp.value;
                  } else if (inp.id.includes("image")) {
                    if (!group.stimulus) group.stimulus = {};
                    group.stimulus.image_url = inp.value;
                  }
                }
                updatePreview("science");
              });
            }
          });
          return;
        }

        var group = getActiveGroup(sectionId);
        if (!group) return;

        var groupImgWidth = group.stimulus?.image_width || 100;
        form.innerHTML =
          '<div class="form-grid" style="gap: 12px 14px;">' +
          '<div class="field full"><label>Tiêu đề ngữ liệu</label><input class="input" id="' + sectionId + '-g-title" value="' + attr(group.title) + '"></div>' +
          '<div class="field full"><label>Nội dung văn bản / dữ liệu</label><textarea class="textarea" id="' + sectionId + '-g-text" style="min-height:180px;">' + esc(group.stimulus?.content || "") + '</textarea></div>' +
          '<div class="field full" style="display: grid; grid-template-columns: 360px 180px 1fr; gap: 10px; align-items: end; margin-bottom: 0;">' +
            '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Đường dẫn ảnh ngữ liệu nếu có</label><input class="input" id="' + sectionId + '-g-image" value="' + attr(group.stimulus?.image_url || "") + '" placeholder="assets/questions/' + attr(exam.exam_code) + '/ngu-lieu-01.webp"></div>' +
            '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;"><label>Kích thước ảnh: <span id="' + sectionId + '-g-image-width-val">' + groupImgWidth + '</span>%</label>' +
              '<input type="range" class="slider" id="' + sectionId + '-g-image-width" min="10" max="100" value="' + groupImgWidth + '" style="width: 100%; display: block; height: 38px; margin: 0; padding: 0; cursor: pointer;">' +
            '</div>' +
          '</div>' +
          '</div>';

        var slider = $("#" + sectionId + "-g-image-width");
        var indicator = $("#" + sectionId + "-g-image-width-val");
        if (slider && indicator) {
          slider.addEventListener("input", function() {
            indicator.textContent = this.value;
            updatePreview(sectionId);
          });
        }
        var titleInp = $("#" + sectionId + "-g-title");
        var textInp = $("#" + sectionId + "-g-text");
        var imgInp = $("#" + sectionId + "-g-image");
        [titleInp, textInp, imgInp].forEach(function(inp) {
          if (inp) {
            inp.addEventListener("input", function() { updatePreview(sectionId); });
          }
        });
      }

      function saveReadingGroupDirect(gId) {
        ensureSchema();
        var readingSec = getSection("reading");
        var group = readingSec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        var titleInp = $("#reading-" + gId + "-title");
        var textInp = $("#reading-" + gId + "-text");
        if (titleInp) group.title = titleInp.value.trim() || "Chủ đề ngữ liệu";
        if (!group.stimulus) group.stimulus = {};
        if (textInp) group.stimulus.content = textInp.value || "";
        
        saveDraft();
        renderAll();
        window.alert("Đã lưu nội dung " + (gId === "g1" ? "ngữ liệu 1" : "ngữ liệu 2") + " thành công!");
      }
      window.saveReadingGroupDirect = saveReadingGroupDirect;

      function switchReadingGroupTab(groupId) {
        activeGroupIds["reading"] = groupId;
        
        // Reset the active question index to the first question of this group
        ensureSchema();
        var readingSec = getSection("reading");
        var group = readingSec.groups.find(function(g) { return g.group_id === groupId; });
        var firstQ = group && group.questions && group.questions[0] ? clone(group.questions[0]) : defaultQuestion("reading");
        
        editingQuestion["reading"] = { index: 0, question: firstQ };
        
        renderAll();
      }
      window.switchReadingGroupTab = switchReadingGroupTab;

      function updateReadingTabsUI() {
        var activeId = activeGroupIds["reading"] || "g1";
        var btnG1 = document.getElementById("reading-tab-btn-g1");
        var btnG2 = document.getElementById("reading-tab-btn-g2");
        if (btnG1 && btnG2) {
          btnG1.classList.toggle("active", activeId === "g1");
          btnG2.classList.toggle("active", activeId === "g2");
        }
      }

      function switchScienceGroupTab(groupId) {
        activeGroupIds["science"] = groupId;
        
        // Reset the active question index to the first question of this group
        ensureSchema();
        var scienceSec = getSection("science");
        var group = scienceSec.groups.find(function(g) { return g.group_id === groupId; });
        var firstQ = group && group.questions && group.questions[0] ? clone(group.questions[0]) : defaultQuestion("science");
        
        editingQuestion["science"] = { index: 0, question: firstQ };
        
        renderAll();
      }
      window.switchScienceGroupTab = switchScienceGroupTab;


      function getActiveQuestionNo(sectionId) {
        if (sectionId === "math") {
          return activeMathQuestionNo;
        }
        var gId = activeGroupIds[sectionId] || "g1";
        var gIdx = Number(gId.replace("g", "")) || 1;
        var startNo = (sectionId === "reading") ? (gId === "g1" ? 1 : 11) : ((gIdx - 1) * 5 + 1);
        var activeIdx = (editingQuestion[sectionId] && editingQuestion[sectionId].index !== undefined) ? editingQuestion[sectionId].index : 0;
        if (activeIdx === -1) activeIdx = 0;
        return startNo + activeIdx;
      }
      window.getActiveQuestionNo = getActiveQuestionNo;

      function updateTopbarQNo() {
        var qNoCircle = document.getElementById("topbar-qno-circle");
        if (qNoCircle && activeEditorTab) {
          qNoCircle.textContent = getActiveQuestionNo(activeEditorTab);
        }
      }
      window.updateTopbarQNo = updateTopbarQNo;

      function setGlobalEditorRoleView(role) {
        if (activeEditorTab) {
          setEditorRoleView(activeEditorTab, role);
        }
      }
      window.setGlobalEditorRoleView = setGlobalEditorRoleView;


      function setEditorRoleView(sectionId, role) {
        var editorView = document.getElementById(sectionId + "-editor-view");
        var previewView = document.getElementById(sectionId + "-preview-view");
        var btnTeacher = document.getElementById("global-role-tab-teacher");
        var btnStudent = document.getElementById("global-role-tab-student");
        var saveRow = document.getElementById(sectionId + "-editor-save-btn-row");

        if (role === "student") {
          // Save the current question inputs to state before rendering preview
          var currentVal = collectBaseQuestion(sectionId, false);
          if (sectionId === "math") {
            currentVal.question_no = activeMathQuestionNo;
            ensureSchema();
            getSection("math").questions[activeMathQuestionNo - 1] = currentVal;
          } else {
            var idx = editingQuestion[sectionId].index;
            var group = getActiveGroup(sectionId);
            if (group) {
              if (idx === -1) {
                editingQuestion[sectionId].question = currentVal;
              } else {
                group.questions[idx] = currentVal;
                editingQuestion[sectionId].question = currentVal;
              }
            }
          }

          if (editorView) editorView.style.display = "none";
          if (previewView) previewView.style.display = "block";
          if (btnTeacher) btnTeacher.classList.remove("active");
          if (btnStudent) btnStudent.classList.add("active");
          if (saveRow) saveRow.style.display = "none";

          updatePreview(sectionId);
        } else {
          if (editorView) editorView.style.display = "block";
          if (previewView) previewView.style.display = "none";
          if (btnTeacher) btnTeacher.classList.add("active");
          if (btnStudent) btnStudent.classList.remove("active");
          if (saveRow) saveRow.style.display = "";
        }
      }
      window.setEditorRoleView = setEditorRoleView;




      function updateScienceTabsUI() {
        var activeId = activeGroupIds["science"] || "g1";
        for (var i = 1; i <= 8; i++) {
          var btn = document.getElementById("science-tab-btn-g" + i);
          if (btn) {
            btn.classList.toggle("active", activeId === "g" + i);
          }
        }
      }

      function saveScienceGroupDirect(gId) {
        ensureSchema();
        var scienceSec = getSection("science");
        var group = scienceSec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        var titleInp = $("#science-" + gId + "-title");
        var textInp = $("#science-" + gId + "-text");
        var imgInp = $("#science-" + gId + "-image");
        var widthInp = $("#science-" + gId + "-image-width");
        
        if (titleInp) group.title = titleInp.value.trim() || "Chủ đề ngữ liệu";
        if (!group.stimulus) group.stimulus = {};
        if (textInp) group.stimulus.content = textInp.value || "";
        if (imgInp) group.stimulus.image_url = imgInp.value || "";
        if (widthInp) group.stimulus.image_width = Number(widthInp.value) || 100;
        
        saveDraft();
        renderAll();
        var gIdx = Number(gId.replace("g", "")) || 1;
        window.alert("Đã lưu nội dung ngữ liệu " + gIdx + " thành công!");
      }
      window.saveScienceGroupDirect = saveScienceGroupDirect;

      function renderSubjectWizardNav(sectionId) {
        var grid = $("#" + sectionId + "-wizard-grid");
        if (!grid) return;
        grid.innerHTML = "";
        
        ensureSchema();
        var sec = getSection(sectionId);
        var gId = activeGroupIds[sectionId] || "g1";
        var group = sec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        
        var questions = group.questions || [];
        var numQuestions = sectionId === "reading" ? 10 : 5;
        
        var gIdx = Number(gId.replace("g", "")) || 1;
        var startNo = sectionId === "reading" ? (gId === "g1" ? 1 : 11) : ((gIdx - 1) * 5 + 1);
        
        var editedCount = 0;
        var activeIdx = editingQuestion[sectionId]?.index || 0;
        
        for (var i = 0; i < numQuestions; i++) {
          var qNo = startNo + i;
          var q = questions[i];
          var isFilled = false;
          if (q) {
            var qText = (q.question || "").trim();
            var hasImage = (q.image_url || "").trim() !== "";
            var hasText = qText !== "";
            var hasOptions = false;
            if (Array.isArray(q.options)) {
              hasOptions = q.options.some(function (opt) {
                return (opt.text || "").trim() !== "";
              });
            }
            if (hasText || hasImage || hasOptions) {
              isFilled = true;
            }
          }
          if (isFilled) {
            editedCount++;
          }
          
          var isActive = i === activeIdx;
          
          var styleStr = "display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; padding: 0;";
          if (isFilled) {
            styleStr += " background: var(--brand); border: 1.5px solid var(--brand-dark); color: #fff;";
          } else {
            styleStr += " background: #fff; border: 1.5px solid var(--line); color: var(--muted);";
          }
          if (isActive) {
            styleStr += " box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--brand); z-index: 1; font-weight: 800;";
          }
          
          var btnHtml = '<button type="button" style="' + styleStr + '" onclick="selectSubjectWizardQuestion(\'' + sectionId + '\', ' + i + ')">' + qNo + '</button>';
          grid.innerHTML += btnHtml;
        }
        
        var progressEl = $("#" + sectionId + "-wizard-progress");
        if (progressEl) {
          progressEl.textContent = "Tiến độ: " + editedCount + "/" + numQuestions + " câu đã soạn";
        }
      }
      window.renderSubjectWizardNav = renderSubjectWizardNav;

      function selectSubjectWizardQuestion(sectionId, idx) {
        ensureSchema();
        var sec = getSection(sectionId);
        var gId = activeGroupIds[sectionId] || "g1";
        var group = sec.groups.find(function(g) { return g.group_id === gId; });
        if (!group) return;
        
        // Auto-save currently edited question in the active group's question slot before switching
        if (editingQuestion[sectionId]) {
          var currentVal = collectBaseQuestion(sectionId, false);
          var activeIdx = editingQuestion[sectionId].index;
          if (activeIdx >= 0 && activeIdx < group.questions.length) {
            currentVal.question_no = group.questions[activeIdx].question_no; // preserve number
            group.questions[activeIdx] = currentVal;
            saveDraft();
          }
        }
        
        // Load target question
        var targetQ = clone(group.questions[idx]);
        editingQuestion[sectionId] = { index: idx, question: targetQ };
        
        renderQuestionForm(sectionId);
        renderSubjectWizardNav(sectionId);
        setEditorRoleView(sectionId, "teacher");
        updatePreview(sectionId);
        
        var form = $("#" + sectionId + "-question-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      window.selectSubjectWizardQuestion = selectSubjectWizardQuestion;

      function updatePreview(sectionId) {
        var bodyEl = $("#" + sectionId + "-preview-body");
        var ansEl = $("#" + sectionId + "-preview-answer");
        var stimEl = $("#" + sectionId + "-preview-stimulus");

        if (!bodyEl) return;
        bodyEl.innerHTML = "";
        if (ansEl) ansEl.innerHTML = "";
        if (stimEl) stimEl.innerHTML = "";

        var qNo = getActiveQuestionNo(sectionId);
        var qnoCircle = document.getElementById(sectionId + "-preview-qno-circle");
        if (qnoCircle) {
          qnoCircle.textContent = qNo;
        }

        var q = collectBaseQuestion(sectionId, false);
        if (sectionId !== "math") {
          var group = getActiveGroup(sectionId);
          if (stimEl && group) {
            var stimTitle = group.title || (sectionId === "reading" ? "Ngữ liệu đọc hiểu" : "Dữ liệu khoa học");
            stimEl.innerHTML =
              '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--brand);margin-bottom:10px;opacity:0.8;">' + esc(stimTitle) + '</div>' +
              '<div class="stimulus-content" style="font-size:14px;line-height:1.85;color:#1e293b;">' + esc(group.stimulus?.content || "") + '</div>';
            if (group.stimulus?.image_url) {
              var gWidth = group.stimulus?.image_width || 100;
              var widthStyle = 'style="width:' + gWidth + '%;max-width:100%;height:auto;"';
              stimEl.innerHTML += '<div class="question-image-wrap" style="text-align:center;"><img src="' + esc(group.stimulus.image_url) + '" alt="Group Image" ' + widthStyle + '></div>';
            }
          }
        }

        if (typeof window.renderQuestion === "function") {
          window.renderQuestion(q, null, function () {}, { bodyEl: bodyEl, answerEl: ansEl });
        } else {
          bodyEl.textContent = q.question;
        }
      }

      function downloadJson(filename, obj) {
        var str = JSON.stringify(obj, null, 2);
        var blob = new Blob([str], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function getIndexListWithCurrent() {
        var draftList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) draftList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(draftList)) draftList = [];

        var idx = draftList.findIndex(function (e) { return e.exam_code === exam.exam_code; });
        var existingMeta = idx !== -1 ? draftList[idx] : null;
        var isOpen = existingMeta ? (existingMeta.is_open === true) : false;

        var meta = {
          exam_code: exam.exam_code,
          title: exam.title,
          status: exam.status,
          duration_minutes: exam.duration_minutes,
          is_open: isOpen,
          subject: (function() {
            if (exam.exam_code.includes("_MATH_")) return "math";
            if (exam.exam_code.includes("_READING_")) return "reading";
            if (exam.exam_code.includes("_SCIENCE_")) return "science";
            if (exam.exam_code.includes("_FULL_") || exam.exam_code.startsWith("TSA_EXAM_")) return "tong-hop";
            return "math";
          })(),
          file: "data/exams/" + exam.exam_code + ".json"
        };
        if (idx === -1) draftList.push(meta);
        else draftList[idx] = meta;
        return draftList;
      }

      async function toggleExamOpen(examCode, open) {
        let openStatus = {};
        try { openStatus = JSON.parse(localStorage.getItem("tma_exam_open_status") || "{}"); } catch(e) {}
        openStatus[examCode] = open;
        localStorage.setItem("tma_exam_open_status", JSON.stringify(openStatus));

        let indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(indexList)) indexList = [];

        var examMeta = indexList.find(function (e) { return e.exam_code === examCode; });
        if (examMeta) {
          examMeta.is_open = open;
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
          try {
            var indexJsonStr = JSON.stringify(indexList, null, 2);
            var indexBlob = new Blob([indexJsonStr], { type: "application/json" });
            await supabaseClient.storage.from('exams').upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });
          } catch (err) {
            console.warn("Failed to sync index.json to Supabase:", err);
          }
        }

        renderExamsList();
      }
      window.toggleExamOpen = toggleExamOpen;

      async function archiveMockToPractice() {
        if (!confirm("Bạn có chắc chắn muốn chuyển Đề thi thử TSA hiện tại vào Phòng luyện không?\nĐề này sẽ được chuyển sang phần Phòng luyện dưới dạng Đề TSA số XX (ví dụ TSA số 11) và đề thi thử cũ vẫn được giữ nguyên.")) {
          return;
        }

        var mockCode = "TSA_EXAM_01";
        var examData = null;

        // 1. Lấy dữ liệu của Đề thi thử TSA
        try {
          var localDraft = localStorage.getItem("tma_tsa_teacher_draft_" + mockCode);
          if (localDraft) {
            examData = JSON.parse(localDraft);
          }
        } catch (e) {
          console.warn("Lỗi đọc local draft:", e);
        }

        if (!examData) {
          try {
            var localExam = localStorage.getItem("tma_tsa_exam_" + mockCode);
            if (localExam) {
              examData = JSON.parse(localExam);
            }
          } catch (e) {
            console.warn("Lỗi đọc local exam:", e);
          }
        }

        if (!examData && window.SUPABASE_CONFIG) {
          try {
            var supabaseUrl = window.SUPABASE_CONFIG.url;
            var response = await fetch(`${supabaseUrl}/storage/v1/object/public/exams/${mockCode}.json`, { cache: "no-store" });
            if (response.ok) {
              examData = await response.json();
            }
          } catch (e) {
            console.warn("Lỗi fetch từ Supabase:", e);
          }
        }

        if (!examData) {
          window.alert("Không tìm thấy nội dung của Đề thi thử TSA để chuyển. Vui lòng bấm 'Chỉnh sửa' đề thi thử và Lưu lại trước.");
          return;
        }

        // 2. Tìm index tiếp theo cho Phòng luyện
        var indexList = [];
        try {
          var raw = localStorage.getItem("tma_tsa_exam_index");
          if (raw) indexList = JSON.parse(raw);
        } catch (e) {}
        if (!Array.isArray(indexList)) indexList = [];

        var maxIdx = 10;
        indexList.forEach(e => {
          if (e.exam_code && e.exam_code.startsWith("TSA_PRACTICE_FULL_")) {
            var parts = e.exam_code.split("_");
            var num = parseInt(parts[parts.length - 1], 10);
            if (num > maxIdx) maxIdx = num;
          }
        });

        var nextIdx = maxIdx + 1;
        var nextIdxStr = String(nextIdx).padStart(2, "0");
        var newExamCode = "TSA_PRACTICE_FULL_" + nextIdxStr;
        var newExamTitle = "Đề tổng hợp số " + nextIdxStr;

        // 3. Clone và cập nhật thông tin mã đề mới
        var clonedExam = JSON.parse(JSON.stringify(examData));
        clonedExam.exam_code = newExamCode;
        clonedExam.title = newExamTitle;
        clonedExam.status = "published";

        // Lưu nháp mới
        try {
          localStorage.setItem("tma_tsa_teacher_draft_" + newExamCode, JSON.stringify(clonedExam));
          localStorage.setItem("tma_tsa_exam_" + newExamCode, JSON.stringify(clonedExam));
        } catch (e) {
          console.warn("Lỗi lưu nháp mới:", e);
        }

        // 4. Đồng bộ lên Supabase Cloud
        if (!supabaseClient) {
          window.alert("Đã sao lưu nháp offline dưới mã đề " + newExamCode + ".\nLưu ý: Không tìm thấy kết nối Supabase Client để đồng bộ tự động.");
          renderExamsList();
          renderPracticeRoom();
          return;
        }

        var btn = $("#upload-supabase-button");
        var originalText = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Đang lưu lên Cloud...";
        }

        try {
          // Upload file json của đề mới
          var examJsonStr = JSON.stringify(clonedExam, null, 2);
          var examBlob = new Blob([examJsonStr], { type: "application/json" });
          var { error: uploadExamError } = await supabaseClient.storage
            .from('exams')
            .upload(newExamCode + ".json", examBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadExamError) throw uploadExamError;

          // Cập nhật index.json
          var meta = {
            exam_code: newExamCode,
            title: newExamTitle,
            status: "published",
            duration_minutes: clonedExam.duration_minutes || 150,
            is_open: true,
            subject: "tong-hop",
            file: "data/exams/" + newExamCode + ".json"
          };

          var existIdx = indexList.findIndex(e => e.exam_code === newExamCode);
          if (existIdx === -1) {
            indexList.push(meta);
          } else {
            indexList[existIdx] = meta;
          }

          var indexJsonStr = JSON.stringify(indexList, null, 2);
          var indexBlob = new Blob([indexJsonStr], { type: "application/json" });
          var { error: uploadIndexError } = await supabaseClient.storage
            .from('exams')
            .upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadIndexError) throw uploadIndexError;

          // Đồng bộ lại local index
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("✓ Đã chuyển Đề thi thử TSA thành công sang Phòng luyện dưới dạng:\n\"" + newExamTitle + "\" (" + newExamCode + ")");
          
          // Re-render UI
          renderExamsList();
          renderPracticeRoom();

        } catch (err) {
          console.error(err);
          window.alert("Lỗi khi tải dữ liệu lên Supabase:\n" + (err.message || err));
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
          }
        }
      }
      window.archiveMockToPractice = archiveMockToPractice;

      async function saveToSupabaseCloud() {
        if (!supabaseClient) {
          window.alert("Thư viện Supabase chưa được nhúng hoặc bị lỗi kết nối.");
          return;
        }

        var btn = $("#upload-supabase-button");
        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Đang lưu lên Cloud...";

        try {
          // 1. Lưu file JSON đề: [exam_code].json
          var examJsonStr = JSON.stringify(exam, null, 2);
          var examBlob = new Blob([examJsonStr], { type: "application/json" });
          
          var examFileName = exam.exam_code + ".json";
          var { data: uploadExamData, error: uploadExamError } = await supabaseClient.storage
            .from('exams')
            .upload(examFileName, examBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadExamError) throw uploadExamError;

          // 2. Lưu file mục lục: index.json
          var indexList = getIndexListWithCurrent();
          var indexJsonStr = JSON.stringify(indexList, null, 2);
          var indexBlob = new Blob([indexJsonStr], { type: "application/json" });

          var { data: uploadIndexData, error: uploadIndexError } = await supabaseClient.storage
            .from('exams')
            .upload('index.json', indexBlob, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadIndexError) throw uploadIndexError;

          // Lưu index vào localStorage của giáo viên luôn để đồng bộ giao diện quản trị
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("✓ Đã tải đề thi lên Supabase Cloud thành công!\nĐề thi hiện đã sẵn sàng phục vụ học sinh.");
        } catch (error) {
          console.error(error);
          window.alert("Lỗi khi tải đề lên Supabase:\n" + (error.message || error));
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }

      async function saveToProjectFolder() {
        if (!window.showDirectoryPicker) {
          window.alert("Trình duyệt này không hỗ trợ ghi trực tiếp (File System Access API). Vui lòng sử dụng Chrome/Edge mới nhất hoặc tải file JSON về.");
          return;
        }
        try {
          var handle = await window.showDirectoryPicker({ mode: "readwrite" });
          
          var dataHandle = await handle.getDirectoryHandle("data", { create: true });
          var examsHandle = await dataHandle.getDirectoryHandle("exams", { create: true });

          // Write [exam_code].json
          var examFile = await examsHandle.getFileHandle(exam.exam_code + ".json", { create: true });
          var examWritable = await examFile.createWritable();
          await examWritable.write(JSON.stringify(exam, null, 2));
          await examWritable.close();

          // Write index.json
          var indexList = getIndexListWithCurrent();
          var indexFile = await examsHandle.getFileHandle("index.json", { create: true });
          var indexWritable = await indexFile.createWritable();
          await indexWritable.write(JSON.stringify(indexList, null, 2));
          await indexWritable.close();

          // Also save in localStorage
          localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));

          window.alert("Đã ghi đè thành công các file sau vào thư mục dự án:\n1. data/exams/" + exam.exam_code + ".json\n2. data/exams/index.json");
        } catch (error) {
          console.error(error);
          window.alert("Không thể ghi file. Có thể bạn đã từ chối cấp quyền truy cập thư mục.");
        }
      }

      function previewInStudentRoom() {
        // Collect and save active question state to draft before previewing
        if (activeEditorTab === "math") {
          var currentVal = collectBaseQuestion("math", false);
          currentVal.question_no = activeMathQuestionNo;
          ensureSchema();
          getSection("math").questions[activeMathQuestionNo - 1] = currentVal;
        } else if (activeEditorTab === "reading" || activeEditorTab === "science") {
          var currentVal = collectBaseQuestion(activeEditorTab, false);
          var idx = editingQuestion[activeEditorTab].index;
          var group = getActiveGroup(activeEditorTab);
          if (group) {
            if (idx === -1) {
              group.questions.push(currentVal);
              editingQuestion[activeEditorTab].index = group.questions.length - 1;
            } else {
              group.questions[idx] = currentVal;
            }
          }
        }
        saveDraft();

        var link = "";
        var qNo = 1;
        if (activeEditorTab === "reading") {
          var q = editingQuestion["reading"] ? editingQuestion["reading"].question : null;
          qNo = q ? q.question_no : 1;
          link = "exam-reading.html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
        } else if (activeEditorTab === "science") {
          var q = editingQuestion["science"] ? editingQuestion["science"].question : null;
          qNo = q ? q.question_no : 1;
          link = "exam-science.html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
        } else {
          qNo = activeMathQuestionNo;
          link = "exam-math.html?exam=" + exam.exam_code + "&preview=true&preview_qno=" + qNo;
        }
        openPreviewModal(link);
      }


      window.previewInStudentRoom = previewInStudentRoom;

      function toggleSidebar() {
        var shell = document.querySelector(".teacher-shell");
        if (shell) {
          shell.classList.toggle("sidebar-collapsed");
          var isCollapsed = shell.classList.contains("sidebar-collapsed");
          localStorage.setItem("tma_teacher_sidebar_collapsed", isCollapsed ? "true" : "false");
        }
      }
      window.toggleSidebar = toggleSidebar;

      function toggleTeacherChoiceSelection(el, key, isMulti) {
        var input = el.querySelector('input[name="choice-correct"]');
        if (!input) return;
        
        if (isMulti) {
          input.checked = !input.checked;
          el.classList.toggle("is-selected", input.checked);
        } else {
          var container = el.closest(".choices-container");
          container.querySelectorAll(".choice-item").forEach(function (item) {
            item.classList.remove("is-selected");
          });
          container.querySelectorAll('input[name="choice-correct"]').forEach(function (rad) {
            rad.checked = false;
          });
          input.checked = true;
          el.classList.add("is-selected");
        }
        updatePreview(activeEditorTab);
      }
      window.toggleTeacherChoiceSelection = toggleTeacherChoiceSelection;

      function toggleTeacherTfSelection(id, value, btn) {
        var row = btn.closest(".statement-row");
        var radios = row.querySelectorAll('input[type="radio"]');
        
        row.querySelectorAll(".statement-btn").forEach(function (b) {
          b.classList.remove("is-active");
        });
        
        var targetRadio = value ? radios[0] : radios[1];
        if (targetRadio.checked) {
          targetRadio.checked = false;
        } else {
          targetRadio.checked = true;
          btn.classList.add("is-active");
        }
        updatePreview(activeEditorTab);
      }
      window.toggleTeacherTfSelection = toggleTeacherTfSelection;

      function startEditingExam(title, code) {
        var cleanCode = normalizeCode(code);
        var existing = loadDraft(cleanCode);
        if (existing) {
          exam = existing;
          ensureSchema();
        } else {
          exam = createEmptyExam(cleanCode, title, 45, "published");
        }

        // Enter Editing Mode
        document.getElementById("dashboard-container").style.display = "none";
        document.getElementById("sidebar-normal-nav").style.display = "none";

        document.getElementById("editor-container").style.display = "block";
        document.getElementById("sidebar-editor-nav").style.display = "flex";

        $("#editor-subtitle").textContent = `Đang chỉnh sửa: ${title} (${cleanCode})`;
        syncMetadataToForm();
        saveDraft();
        switchEditorTab("setup");
      }

      function exitEditingMode() {
        document.getElementById("editor-container").style.display = "none";
        document.getElementById("sidebar-editor-nav").style.display = "none";

        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("sidebar-normal-nav").style.display = "block";

        // Refresh views
        renderPracticeRoom();
        renderExamsList();
      }

      // Expose to window object so clicking edit buttons work
      window.startEditingExam = startEditingExam;
      window.exitEditingMode = exitEditingMode;

      function bindEvents() {
        document.addEventListener("click", function (event) {
          var target = event.target.closest("button");
          if (!target) return;
          var tab = target.getAttribute("data-editor-tab-target");
          if (tab) { switchEditorTab(tab); return; }
          var reset = target.getAttribute("data-reset-question");
          if (reset) { resetQuestion(reset); return; }
          var preview = target.getAttribute("data-preview-question");
          if (preview) { updatePreview(preview); return; }
          var saveQ = target.getAttribute("data-save-question");
          if (saveQ) { saveQuestion(saveQ); return; }
          var edit = target.getAttribute("data-edit-question");
          if (edit) { editQuestion(edit, Number(target.getAttribute("data-index"))); return; }
          var del = target.getAttribute("data-delete-question");
          if (del) { deleteQuestion(del, Number(target.getAttribute("data-index"))); return; }
          var cloneAttr = target.getAttribute("data-clone-question");
          if (cloneAttr) { cloneQuestion(cloneAttr, Number(target.getAttribute("data-index"))); return; }
          var newGroupAttr = target.getAttribute("data-new-group");
          if (newGroupAttr) { newGroup(newGroupAttr); return; }
          var saveGroupAttr = target.getAttribute("data-save-group");
          if (saveGroupAttr) { saveGroup(saveGroupAttr); return; }
          var selectGroupAttr = target.getAttribute("data-select-group");
          if (selectGroupAttr) { selectGroup(selectGroupAttr, target.getAttribute("data-group-id")); return; }
          var deleteGroupAttr = target.getAttribute("data-delete-group");
          if (deleteGroupAttr) { deleteGroup(deleteGroupAttr, target.getAttribute("data-group-id")); return; }
        });

        var createExamBtn = $("#create-exam-button");
        if (createExamBtn) {
          createExamBtn.addEventListener("click", function () {
            var code = normalizeCode($("#exam-code").value);
            var existing = loadDraft(code);
            if (existing) {
              exam = existing;
              ensureSchema();
            } else {
              exam = createEmptyExam(code, $("#exam-title-input").value.trim() || "Đề TSA", Number($("#exam-duration").value) || 45, $("#exam-status").value || "draft");
            }
            syncMetadataToForm();
            saveDraft();
            switchEditorTab("math");
          });
        }

        var saveMetaBtn = $("#save-metadata-button");
        if (saveMetaBtn) {
          saveMetaBtn.addEventListener("click", function () {
            syncMetadataFromForm(true);
            saveDraft();
            renderAll();
          });
        }

        ["exam-title-input", "exam-duration", "exam-status"].forEach(function (id) {
          var inputEl = $("#" + id);
          if (inputEl) {
            inputEl.addEventListener("input", function () { saveDraft(); renderSummary(); });
            inputEl.addEventListener("change", function () { saveDraft(); renderSummary(); });
          }
        });

        var dlExamBtn = $("#download-exam-button");
        if (dlExamBtn) {
          dlExamBtn.addEventListener("click", function () {
            downloadJson(exam.exam_code + ".json", exam);
          });
        }
        var dlIdxBtn = $("#download-index-button");
        if (dlIdxBtn) {
          dlIdxBtn.addEventListener("click", function () {
            downloadJson("index.json", getIndexListWithCurrent());
          });
        }
        var saveProjBtn = $("#save-project-button");
        if (saveProjBtn) {
          saveProjBtn.addEventListener("click", function () {
            saveToProjectFolder().catch(function (error) {
              console.error(error);
              window.alert("Không lưu được vào thư mục dự án. Bạn vẫn có thể tải JSON rồi đặt file thủ công.");
            });
          });
        }
        var uploadCloudBtn = $("#upload-supabase-button");
        if (uploadCloudBtn) {
          uploadCloudBtn.addEventListener("click", function () {
            saveToSupabaseCloud().catch(function (error) {
              console.error(error);
              window.alert("Lỗi không mong muốn: " + error);
            });
          });
        }
      }

      function init() {
        stripStoredFormulaQuestions();
        var isCollapsed = localStorage.getItem("tma_teacher_sidebar_collapsed") === "true";
        if (isCollapsed) {
          var shell = document.querySelector(".teacher-shell");
          if (shell) shell.classList.add("sidebar-collapsed");
        }
        var lastCode = localStorage.getItem("tma_tsa_teacher_last_exam_code") || "TSA001";
        var draft = loadDraft(lastCode);
        if (draft) exam = draft;
        stripFormulaQuestions(exam);
        ensureSchema();
        syncMetadataToForm();
        ["math", "reading", "science"].forEach(function (sectionId) {
          editingQuestion[sectionId] = { index: -1, question: defaultQuestion(sectionId) };
        });
        bindEvents();
        renderAll();
        saveDraft();

        // Initial setup for the system dashboard
        renderPracticeRoom();
        renderExamsList();
        renderStudents();

        // Tải danh sách đề từ Supabase Storage để đồng bộ local storage của giáo viên
        if (window.SUPABASE_CONFIG) {
          var supabaseStorageUrl = `${window.SUPABASE_CONFIG.url}/storage/v1/object/public/exams/`;
          fetch(`${supabaseStorageUrl}index.json`, { cache: "no-store" })
            .then(res => {
              if (res.ok) return res.json();
            })
            .then(data => {
              if (data && Array.isArray(data)) {
                localStorage.setItem('tma_tsa_exam_index', JSON.stringify(data));
                renderPracticeRoom();
                renderExamsList();
              }
            })
            .catch(err => console.warn("Cannot sync index from Supabase on start:", err));

          fetch(`${supabaseStorageUrl}drive_links.json`, { cache: "no-store" })
            .then(res => {
              if (res.ok) return res.json();
            })
            .then(data => {
              if (data && typeof data === "object") {
                localStorage.setItem('tmaTsaDriveLinks', JSON.stringify(data));
                var activePanel = document.querySelector("#dashboard-container .tab-panel.active");
                if (activePanel && activePanel.id === "tab-manage-documents") {
                  renderManageDocuments();
                }
              }
            })
            .catch(err => console.warn("Cannot sync documents index from Supabase on start:", err));
        }
      }

      document.addEventListener("DOMContentLoaded", init);
    })();