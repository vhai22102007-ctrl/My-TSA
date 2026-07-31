(function () {
  "use strict";

  var targetCode = "TMA_RANDOM_001";
  var examObj = null;
  var indexList = [];

  // Active view state
  var selectedSubject = "math"; // 'math', 'reading', 'science'
  
  // Selected state for editor
  var selectedGroupId = null; 
  var selectedQuestionIdx = null; 

  // Search/Filter state
  var currentPage = 1;
  var itemsPerPage = 15;
  var filteredItems = []; // Can be questions (for math) or groups (for reading/science)

  // Check login state
  try {
    var teacher = JSON.parse(localStorage.getItem("teacherInfo") || "null");
    if (!teacher || teacher.role !== "teacher" || !teacher.token) {
      window.location.replace("login.html#teacher");
      return;
    }
  } catch (error) {
    window.location.replace("login.html#teacher");
    return;
  }

  // DOM Elements
  var statusText = document.getElementById("backend-state-text");
  var statusDot = document.getElementById("backend-state");
  var syncBtn = document.getElementById("sync-btn");
  var qForm = document.getElementById("question-form");
  var activeQTitle = document.getElementById("editor-heading");
  var aiStatusEl = document.getElementById("ai-status-text");

  // MathJax utility
  function triggerMathJax() {
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetPromise().catch(function (err) {
        console.warn("MathJax render error:", err);
      });
    }
  }

  // Init page
  window.addEventListener("DOMContentLoaded", async function () {
    if (window.lucide) window.lucide.createIcons();
    checkAiHealth();
    await loadExamData();
    
    // Default load Math tab
    window.switchSubjectTab("math");
  });

  async function checkAiHealth() {
    if (statusDot) {
      statusDot.className = "backend-state checking";
      if (statusText) statusText.textContent = "Đang kiểm tra AI...";
    }
    if (window.TMA_AI && typeof window.TMA_AI.health === "function") {
      try {
        await window.TMA_AI.health();
        if (statusDot) statusDot.className = "backend-state ready";
        if (statusText) statusText.textContent = "AI Sẵn sàng";
      } catch (err) {
        if (statusDot) statusDot.className = "backend-state error";
        if (statusText) statusText.textContent = "Lỗi kết nối AI";
      }
    } else {
      if (statusDot) statusDot.className = "backend-state error";
      if (statusText) statusText.textContent = "Thiếu dịch vụ AI";
    }
  }

  async function loadExamData() {
    var local = localStorage.getItem("tma_tsa_exam_" + targetCode) || localStorage.getItem("tma_tsa_teacher_draft_" + targetCode);
    if (local) {
      try { examObj = JSON.parse(local); } catch (e) {}
    }

    if (!examObj) {
      try {
        var r2Url = window.TMAR2.examUrl(targetCode + ".json");
        var res = await fetch(r2Url);
        if (res.ok) {
          examObj = await res.json();
          localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
          localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
        }
      } catch (err) {
        console.warn("R2 fetch error:", err);
      }
    }

    if (!examObj) {
      examObj = {
        exam_code: targetCode,
        title: "Đề ngẫu nhiên số 01",
        duration_minutes: 150,
        status: "published",
        sections: [
          { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] },
          { section_id: "reading", section_label: "Tư duy Đọc hiểu", layout: "passage", groups: [] },
          { section_id: "science", section_label: "Tư duy Khoa học", layout: "passage", groups: [] }
        ]
      };
    }

    if (!Array.isArray(examObj.sections)) {
      examObj.sections = [
        { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] },
        { section_id: "reading", section_label: "Tư duy Đọc hiểu", layout: "passage", groups: [] },
        { section_id: "science", section_label: "Tư duy Khoa học", layout: "passage", groups: [] }
      ];
    }

    try {
      var idxRes = await fetch(window.TMAR2.examUrl("index.json"));
      if (idxRes.ok) indexList = await idxRes.json();
    } catch (e) {}
  }

  function getSection(id) {
    return (examObj.sections || []).find(s => s.section_id === id);
  }

  function getActiveGroup() {
    if (selectedSubject === "math") return null;
    var section = getSection(selectedSubject);
    if (!section || !Array.isArray(section.groups)) return null;
    return section.groups.find(g => g.group_id === selectedGroupId);
  }

  function getActiveQuestion() {
    var section = getSection(selectedSubject);
    if (!section) return null;
    if (selectedSubject === "math") {
      return (section.questions || [])[selectedQuestionIdx];
    } else {
      var group = getActiveGroup();
      return group ? (group.questions || [])[selectedQuestionIdx] : null;
    }
  }

  // Switch large top navigation tabs
  window.switchSubjectTab = function (sub) {
    selectedSubject = sub;
    currentPage = 1;

    // Toggle tab active styles
    document.querySelectorAll(".subject-tab").forEach(function (btn) {
      if (btn.id === "tab-" + sub) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    // Update Header buttons and page title
    var pageTitle = document.getElementById("page-title");
    var addMathBtn = document.getElementById("header-add-math-btn");
    var addPassageBtn = document.getElementById("header-add-passage-btn");

    if (sub === "math") {
      if (pageTitle) pageTitle.textContent = "Ngân hàng câu hỏi Toán học";
      if (addMathBtn) addMathBtn.style.display = "inline-flex";
      if (addPassageBtn) addPassageBtn.style.display = "none";

      // Show difficulty and type filters for Math
      document.getElementById("filter-difficulty-wrapper").style.display = "flex";
      document.getElementById("filter-type-wrapper").style.display = "flex";
    } else {
      var subText = sub === "reading" ? "Đọc hiểu" : "Khoa học";
      if (pageTitle) pageTitle.textContent = "Ngân hàng ngữ liệu " + subText;
      if (addMathBtn) addMathBtn.style.display = "none";
      if (addPassageBtn) addPassageBtn.style.display = "inline-flex";

      // Hide difficulty and type filters (passages contain multiple question types & difficulties)
      document.getElementById("filter-difficulty-wrapper").style.display = "none";
      document.getElementById("filter-type-wrapper").style.display = "none";
    }

    // Render Table Header dynamically
    var tableHeader = document.getElementById("qb-table-header");
    if (tableHeader) {
      if (sub === "math") {
        tableHeader.innerHTML = `
          <tr>
            <th style="width: 110px;">Mã ID</th>
            <th style="width: 180px;">Chuyên đề</th>
            <th>Nội dung câu hỏi Toán / Preview</th>
            <th style="width: 120px;">Độ khó</th>
            <th style="width: 160px;">Dạng đề</th>
            <th style="width: 90px; text-align: center;">Thao tác</th>
          </tr>
        `;
      } else {
        tableHeader.innerHTML = `
          <tr>
            <th style="width: 110px;">Mã ID</th>
            <th style="width: 220px;">Ngữ liệu bài đọc</th>
            <th>Nội dung đoạn văn ngữ liệu / Tóm tắt</th>
            <th style="width: 130px; text-align: center;">Số câu con</th>
            <th style="width: 180px;">Chuyên đề</th>
            <th style="width: 90px; text-align: center;">Thao tác</th>
          </tr>
        `;
      }
    }

    // Reset Search field
    var searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";

    // Refresh Topic Dropdown & Apply Filters
    populateTopicDropdown();
    applyFilters();
  };

  // Populate dynamic topics dropdown
  function populateTopicDropdown() {
    var topicSelect = document.getElementById("filter-topic");
    if (!topicSelect) return;

    var topicsSet = new Set();
    var section = getSection(selectedSubject);
    if (section) {
      if (selectedSubject === "math") {
        (section.questions || []).forEach(q => {
          if (q.topic) topicsSet.add(q.topic.trim());
        });
      } else {
        (section.groups || []).forEach(g => {
          // Check passage level topic or search question topic
          (g.questions || []).forEach(q => {
            if (q.topic) topicsSet.add(q.topic.trim());
          });
        });
      }
    }

    topicSelect.innerHTML = `<option value="all">Tất cả chuyên đề (${topicsSet.size})</option>`;
    var sortedTopics = Array.from(topicsSet).sort();
    sortedTopics.forEach(function (topic) {
      var option = document.createElement("option");
      option.value = topic;
      option.textContent = topic;
      topicSelect.appendChild(option);
    });
  }

  // Filter Items (questions for math, groups for passages)
  window.applyFilters = function () {
    var query = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
    var fTopic = document.getElementById("filter-topic")?.value || "all";
    var fDiff = document.getElementById("filter-difficulty")?.value || "all";
    var fType = document.getElementById("filter-type")?.value || "all";

    var section = getSection(selectedSubject);
    if (!section) return;

    if (selectedSubject === "math") {
      var list = section.questions || [];
      var mapped = list.map((q, idx) => ({ type: "math_q", ref: q, index: idx }));
      filteredItems = mapped.filter(function (item) {
        var q = item.ref;
        // Filter by topic
        if (fTopic !== "all" && q.topic !== fTopic) return false;
        // Filter by difficulty
        if (fDiff !== "all" && String(q.difficulty) !== fDiff) return false;
        // Filter by type
        if (fType !== "all" && q.question_type !== fType) return false;
        // Search query
        if (query) {
          var textMatch = (q.question || "").toLowerCase().includes(query);
          var topicMatch = (q.topic || "").toLowerCase().includes(query);
          if (!textMatch && !topicMatch) return false;
        }
        return true;
      });
    } else {
      var list = section.groups || [];
      var mapped = list.map((g, idx) => ({ type: "passage", ref: g, id: g.group_id, index: idx }));
      filteredItems = mapped.filter(function (item) {
        var g = item.ref;
        // Search query (passage title, passage content)
        if (query) {
          var titleMatch = (g.title || "").toLowerCase().includes(query);
          var passageMatch = (g.passage || "").toLowerCase().includes(query);
          var topicMatch = (g.questions || []).some(q => (q.topic || "").toLowerCase().includes(query));
          if (!titleMatch && !passageMatch && !topicMatch) return false;
        }
        // Filter by topic
        if (fTopic !== "all") {
          var hasTopic = (g.questions || []).some(q => q.topic === fTopic);
          if (!hasTopic) return false;
        }
        return true;
      });
    }

    currentPage = 1;
    renderDatatable();
  };

  function padZero(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  function getPlainSnippet(htmlString, maxLength) {
    if (!htmlString) return "";
    // Remove all HTML tags
    var text = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
    // Collapse multiple spaces/newlines
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  }

  // Render datatable list items
  function renderDatatable() {
    var tbody = document.getElementById("qb-table-body");
    var pagInfo = document.getElementById("pagination-info");
    var prevBtn = document.getElementById("prev-page-btn");
    var nextBtn = document.getElementById("next-page-btn");
    if (!tbody) return;

    tbody.innerHTML = "";

    var totalItems = filteredItems.length;
    var totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage === totalPages);

    if (pagInfo) {
      pagInfo.innerHTML = `Hiển thị <strong>${totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)}</strong> trong tổng số <strong>${totalItems}</strong> ${selectedSubject === 'math' ? 'câu hỏi' : 'ngữ liệu'}.`;
    }

    if (totalItems === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 40px;">Không tìm thấy kết quả nào phù hợp với bộ lọc.</td></tr>`;
      return;
    }

    var startIdx = (currentPage - 1) * itemsPerPage;
    var endIdx = Math.min(startIdx + itemsPerPage, totalItems);

    for (var i = startIdx; i < endIdx; i++) {
      var item = filteredItems[i];
      var tr = document.createElement("tr");

      var codeLabel = "";
      if (item.type === "math_q") {
        codeLabel = "Math " + padZero(item.index + 1, 3);
      } else {
        var prefix = selectedSubject === "reading" ? "Read " : "Sci ";
        codeLabel = prefix + padZero(item.index + 1, 3);
      }

      if (item.type === "math_q") {
        var q = item.ref;
        var diffLabel = q.difficulty === 3 ? "Khó" : (q.difficulty === 2 ? "Trung bình" : "Dễ");
        var diffClass = q.difficulty === 3 ? "level-3" : (q.difficulty === 2 ? "level-2" : "level-1");
        
        var typeLabel = "Trắc nghiệm";
        if (q.question_type === "true_false") typeLabel = "Đúng / Sai";
        else if (q.question_type === "numeric_answer") typeLabel = "Điền số";
        else if (q.question_type === "fill_blank") typeLabel = "Điền khuyết";
        else if (q.question_type === "drag_drop") typeLabel = "Kéo thả";

        tr.innerHTML = `
          <td style="font-weight: 700; color: #475569;">${codeLabel}</td>
          <td style="font-weight: 600; font-size:12.5px;">${q.topic || "Khác"}</td>
          <td><div class="snippet-col" title="${q.question || ''}">${q.question || ""}</div></td>
          <td><span class="badge-diff ${diffClass}">${diffLabel}</span></td>
          <td><span class="badge-type">${typeLabel}</span></td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="qb-action-btn edit-btn" onclick="window.editMathQuestion(${item.index})" title="Sửa câu hỏi"><i data-lucide="edit-3" style="width:15px; height:15px;"></i></button>
              <button class="qb-action-btn delete-btn" onclick="window.deleteMathQuestion(${item.index})" title="Xóa câu hỏi"><i data-lucide="trash-2" style="width:15px; height:15px;"></i></button>
            </div>
          </td>
        `;
      } else {
        // Passage Group Row
        var g = item.ref;
        var qCount = (g.questions || []).length;
        var pTopic = (g.questions && g.questions[0] && g.questions[0].topic) ? g.questions[0].topic : (selectedSubject === "science" ? "Khoa học" : "Đọc hiểu");
        
        var cleanSnippet = getPlainSnippet(g.passage, 80);
        var cleanTooltip = getPlainSnippet(g.passage, 250);

        tr.innerHTML = `
          <td style="font-weight: 700; color: #475569;">${codeLabel}</td>
          <td style="font-weight: 700; color: #1e293b;">📰 ${g.title || "Chưa đặt tên"}</td>
          <td><div class="snippet-col" title="${cleanTooltip}">${cleanSnippet || "Không có nội dung văn bản..."}</div></td>
          <td style="text-align: center;">
            <span style="font-size: 11px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 9px; border-radius: 12px; font-weight: 800;">
              ${qCount} Câu hỏi
            </span>
          </td>
          <td style="font-weight: 600; font-size:12.5px;">${pTopic}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="qb-action-btn edit-btn" onclick="window.editPassage('${g.group_id}')" title="Chỉnh sửa ngữ liệu & câu hỏi con"><i data-lucide="edit-3" style="width:15px; height:15px;"></i></button>
              <button class="qb-action-btn delete-btn" onclick="window.deletePassage('${g.group_id}')" title="Xóa ngữ liệu"><i data-lucide="trash-2" style="width:15px; height:15px;"></i></button>
            </div>
          </td>
        `;
      }

      tbody.appendChild(tr);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  window.prevPage = function () {
    if (currentPage > 1) {
      currentPage--;
      renderDatatable();
    }
  };

  window.nextPage = function () {
    var totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      renderDatatable();
    }
  };

  // Switch to Editor Mode
  window.editMathQuestion = function (idx) {
    selectedSubject = "math";
    selectedGroupId = null;
    selectedQuestionIdx = idx;

    document.getElementById("list-view").style.display = "none";
    document.getElementById("editor-view").style.display = "flex";
    
    var mainHeader = document.querySelector(".studio-header");
    if (mainHeader) mainHeader.style.display = "none";

    var section = getSection("math");
    loadQuestionToEditor(section.questions[idx]);
  };

  window.editPassage = function (groupId) {
    selectedGroupId = groupId;
    
    var section = getSection(selectedSubject);
    var group = section.groups.find(g => g.group_id === groupId);
    if (!group) return;

    // Default to editing first question of group, or empty passage screen
    selectedQuestionIdx = (group.questions && group.questions.length > 0) ? 0 : null;

    document.getElementById("list-view").style.display = "none";
    document.getElementById("editor-view").style.display = "flex";
    
    var mainHeader = document.querySelector(".studio-header");
    if (mainHeader) mainHeader.style.display = "none";

    loadQuestionToEditor(selectedQuestionIdx !== null ? group.questions[0] : null, group);
  };

  window.backToListView = function () {
    document.getElementById("editor-view").style.display = "none";
    document.getElementById("list-view").style.display = "block";
    
    var mainHeader = document.querySelector(".studio-header");
    if (mainHeader) mainHeader.style.display = "flex";
    
    populateTopicDropdown();
    applyFilters();
  };

  // Add items
  window.addNewMathQuestion = function () {
    var section = getSection("math");
    if (!section) return;

    if (!Array.isArray(section.questions)) section.questions = [];
    var newQ = {
      question_no: section.questions.length + 1,
      question_type: "single_choice",
      question: "Nội dung câu hỏi Toán mới...",
      difficulty: 1,
      topic: "Khảo sát hàm số",
      options: [
        { key: "A", text: "Phương án A" },
        { key: "B", text: "Phương án B" },
        { key: "C", text: "Phương án C" },
        { key: "D", text: "Phương án D" }
      ],
      correct_answer: "A",
      explanation: "",
      points: 1
    };

    section.questions.push(newQ);
    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));

    window.editMathQuestion(section.questions.length - 1);
  };

  window.addNewPassage = function () {
    var title = prompt("Nhập tiêu đề cho Ngữ liệu mới:", "Bài đọc số " + (Date.now() % 1000));
    if (title === null) return;
    if (!title.trim()) title = "Ngữ liệu bài đọc mới";

    var section = getSection(selectedSubject);
    if (!section) return;

    if (!Array.isArray(section.groups)) section.groups = [];
    var newGroupId = "g_" + Date.now();
    var newGroup = {
      group_id: newGroupId,
      title: title.trim(),
      passage: "Dán đoạn văn ngữ liệu bài đọc mới vào đây...",
      questions: []
    };

    section.groups.push(newGroup);
    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));

    window.editPassage(newGroupId);
  };

  // Delete items
  window.deleteMathQuestion = function (idx) {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi Toán này?")) return;

    var section = getSection("math");
    if (section) {
      section.questions.splice(idx, 1);
      section.questions.forEach((q, i) => q.question_no = i + 1);
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));

    showToast("✓ Đã xóa câu hỏi Toán!");
    applyFilters();
  };

  window.deletePassage = function (groupId) {
    if (!confirm("Cảnh báo: Hành động này sẽ xóa Ngữ liệu cùng toàn bộ các câu hỏi con của nó. Bạn có chắc chắn?")) return;

    var section = getSection(selectedSubject);
    if (section && Array.isArray(section.groups)) {
      section.groups = section.groups.filter(g => g.group_id !== groupId);
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));

    showToast("✓ Đã xóa Ngữ liệu!");
    applyFilters();
  };

  // Load question to form inputs
  function loadQuestionToEditor(q, group) {
    if (!qForm) return;

    if (!q) {
      if (selectedSubject !== "math" && group) {
        renderPassageOnlyForm(group);
      } else {
        clearForm();
      }
      return;
    }

    var codeLabel = "";
    if (selectedSubject === "math") {
      codeLabel = "Math " + padZero(selectedQuestionIdx + 1, 3);
    } else {
      var section = getSection(selectedSubject);
      var gIdx = section.groups.findIndex(g => g.group_id === selectedGroupId);
      var prefix = selectedSubject === "reading" ? "Read " : "Sci ";
      codeLabel = prefix + padZero(gIdx + 1, 3);
    }
    
    var editorSub = document.getElementById("editor-subtitle");
    if (editorSub) {
      editorSub.textContent = selectedSubject === "math" ? "TƯ DUY TOÁN HỌC" : (selectedSubject === "reading" ? "TƯ DUY ĐỌC HIỂU" : "TƯ DUY KHOA HỌC");
    }
    var editorIdEl = document.getElementById("editor-question-id");
    if (editorIdEl) {
      editorIdEl.textContent = codeLabel;
    }
    var editorNoEl = document.getElementById("editor-question-no-text");
    if (editorNoEl) {
      editorNoEl.textContent = selectedSubject === "math" ? " (Câu hỏi độc lập)" : " (Câu hỏi số " + (selectedQuestionIdx + 1) + ")";
    }

    var isPassageType = (selectedSubject !== "math");
    var passageSectionHtml = "";
    
    if (isPassageType && group) {
      var isCollapsed = localStorage.getItem("tma_qb_passage_collapsed_" + group.group_id) === "true";
      
      passageSectionHtml = `
        <div style="border-bottom: 2px solid var(--line); padding-bottom: 12px; margin-bottom: 12px;">
          <div class="passage-collapse-header" onclick="window.togglePassageCollapse('${group.group_id}')">
            <h4 style="margin: 0; font-size: 13.5px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 6px;">
              <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" style="width: 16px; height: 16px;"></i>
              1. Ngữ liệu bài đọc: ${group.title || "Chưa đặt tên"}
            </h4>
            <span style="font-size: 11px; color: var(--muted); font-weight: 600;">${isCollapsed ? 'Hiện văn bản' : 'Thu gọn'}</span>
          </div>
          <div id="passage-editor-body" style="display: ${isCollapsed ? 'none' : 'block'}; margin-top: 10px;">
            <label class="field" style="margin-bottom: 10px;">
              <span>Tiêu đề bài đọc</span>
              <input type="text" id="g-title" value="${group.title || ""}" style="font-weight: 700; height: 38px;" oninput="window.syncPassageMetaLive()">
            </label>
            <label class="field">
              <span>Đoạn văn ngữ liệu</span>
              <textarea id="g-passage" rows="6" style="min-height: 100px; font-family: inherit; font-size: 13px;" oninput="window.syncPassageMetaLive()">${group.passage || ""}</textarea>
            </label>
          </div>
        </div>
      `;
    }

    var qType = q.question_type || "single_choice";
    var diff = q.difficulty || 1;
    var topic = q.topic || "";
    
    // Render Horizontal Pills navigation
    var sectionObj = getSection(selectedSubject);
    var questionsList = selectedSubject === "math" ? (sectionObj.questions || []) : (group ? (group.questions || []) : []);
    var pillsBarHtml = renderQuestionPills(questionsList);

    var pillsBarHeaderHtml = "";
    if (selectedSubject !== "math") {
      pillsBarHeaderHtml = `
        <h4 style="margin: 0 0 10px; font-size: 13.5px; font-weight: 800; color: #1e293b;">
          2. Các câu hỏi thuộc Ngữ liệu
        </h4>
        ${pillsBarHtml}
      `;
    }

    var showExtraMeta = (selectedSubject === "math");
    var gridStyle = showExtraMeta 
      ? 'display: grid; grid-template-columns: 1.2fr 0.8fr 1.2fr 1fr; gap: 12px; margin-bottom: 14px;' 
      : 'display: block; margin-bottom: 14px;';

    var formHtml = `
      ${passageSectionHtml}
      
      <div>
        ${pillsBarHeaderHtml}

        <div style="${gridStyle}">
          <label class="field" style="${showExtraMeta ? '' : 'max-width: 320px;'}">
            <span>Dạng câu hỏi</span>
            <select id="q-type" onchange="window.onEditorQTypeChange()" class="filter-control" style="cursor: pointer; height: 38px;">
              <option value="single_choice" ${qType === "single_choice" ? "selected" : ""}>Trắc nghiệm 4 lựa chọn</option>
              <option value="true_false" ${qType === "true_false" ? "selected" : ""}>Trắc nghiệm Đúng/Sai</option>
              <option value="numeric_answer" ${qType === "numeric_answer" ? "selected" : ""}>Điền số tự do</option>
              <option value="fill_blank" ${qType === "fill_blank" ? "selected" : ""}>Điền khuyết ô trống</option>
              <option value="drag_drop" ${qType === "drag_drop" ? "selected" : ""}>Kéo thả thẻ từ</option>
            </select>
          </label>
          <div style="display: ${showExtraMeta ? 'block' : 'none'};">
            <label class="field">
              <span>Độ khó</span>
              <select id="q-difficulty" class="filter-control" style="cursor: pointer; height: 38px;">
                <option value="1" ${diff === 1 ? "selected" : ""}>Mức 1 (Dễ)</option>
                <option value="2" ${diff === 2 ? "selected" : ""}>Mức 2 (Trung bình)</option>
                <option value="3" ${diff === 3 ? "selected" : ""}>Mức 3 (Khó)</option>
              </select>
            </label>
          </div>
          <div style="display: ${showExtraMeta ? 'block' : 'none'};">
            <label class="field">
              <span>Chuyên đề / Topic</span>
              <input type="text" id="q-topic" value="${topic || (selectedSubject === 'math' ? 'Toán học' : (selectedSubject === 'science' ? 'Khoa học' : 'Đọc hiểu'))}" class="filter-control" placeholder="Chuyên đề..." style="height: 38px;">
            </label>
          </div>
          <div style="display: ${showExtraMeta ? 'block' : 'none'};">
            <label class="field">
              <span>Đoạn thi thử (Môn)</span>
              <select id="q-subject" onchange="window.onEditorSubjectChange()" class="filter-control" style="cursor: pointer; height: 38px;">
                <option value="math" ${selectedSubject === "math" ? "selected" : ""}>Toán học</option>
                <option value="reading" ${selectedSubject === "reading" ? "selected" : ""}>Đọc hiểu</option>
                <option value="science" ${selectedSubject === "science" ? "selected" : ""}>Khoa học</option>
              </select>
            </label>
          </div>
        </div>

        <label class="field" style="margin-bottom: 14px;">
          <span>Đề bài (Hỗ trợ định dạng LaTeX dùng $)</span>
          <textarea id="q-text" rows="4" style="min-height: 90px; font-size: 13.5px; font-family: inherit; width: 100%;" oninput="window.updateLivePreview()">${q.question || ""}</textarea>
        </label>

        <div id="q-fields-container" style="margin-bottom: 14px;"></div>

        <label class="field" style="margin-bottom: 14px;">
          <span>Lời giải chi tiết (LaTeX dùng $)</span>
          <textarea id="q-explanation" rows="4" style="min-height: 90px; font-size: 13px; font-family: inherit; width: 100%;" oninput="window.updateLivePreview()">${q.explanation || q.solution_details || ""}</textarea>
        </label>
        
        <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--line); padding-top: 12px; margin-top: 12px;">
          <button class="button secondary" type="button" onclick="window.duplicateCurrentQuestion()"><i data-lucide="copy"></i> Nhân bản</button>
          <button class="button primary" type="button" onclick="window.saveActiveQuestionChanges()"><i data-lucide="save"></i> Lưu câu hỏi</button>
        </div>
      </div>
    `;

    qForm.innerHTML = formHtml;
    if (window.lucide) window.lucide.createIcons();

    // Populate question-type fields defensively
    populateTypeFields(q);

    // Live preview update
    updateLivePreview();
  }

  function renderPassageOnlyForm(group) {
    var isCollapsed = localStorage.getItem("tma_qb_passage_collapsed_" + group.group_id) === "true";
    var formHtml = `
      <div style="border-bottom: 2px solid var(--line); padding-bottom: 12px; margin-bottom: 12px;">
        <div class="passage-collapse-header" onclick="window.togglePassageCollapse('${group.group_id}')">
          <h4 style="margin: 0; font-size: 13.5px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" style="width: 16px; height: 16px;"></i>
            1. Ngữ liệu bài đọc: ${group.title || "Chưa đặt tên"}
          </h4>
          <span style="font-size: 11px; color: var(--muted); font-weight: 600;">${isCollapsed ? 'Hiện văn bản' : 'Thu gọn'}</span>
        </div>
        <div id="passage-editor-body" style="display: ${isCollapsed ? 'none' : 'block'}; margin-top: 10px;">
          <label class="field" style="margin-bottom: 10px;">
            <span>Tiêu đề bài đọc</span>
            <input type="text" id="g-title" value="${group.title || ""}" style="font-weight: 700; height: 38px;" oninput="window.syncPassageMetaLive()">
          </label>
          <label class="field">
            <span>Đoạn văn ngữ liệu</span>
            <textarea id="g-passage" rows="7" style="min-height: 120px; font-family: inherit; font-size: 13px;" oninput="window.syncPassageMetaLive()">${group.passage || ""}</textarea>
          </label>
        </div>
      </div>
      
      <div style="text-align: center; padding: 30px; background: #fafafa; border-radius: 8px; border: 1.5px dashed var(--line);">
        <p style="color: var(--muted); font-size: 13px; font-weight: 500; margin-bottom: 14px;">Ngữ liệu này chưa có câu hỏi trắc nghiệm nào đi kèm.</p>
        <button type="button" class="button primary" onclick="window.addNewQuestionPill()">
          <i data-lucide="plus"></i> Thêm câu hỏi đầu tiên
        </button>
      </div>
    `;
    qForm.innerHTML = formHtml;
    if (window.lucide) window.lucide.createIcons();
    document.getElementById("preview-area").innerHTML = `<div style="padding: 40px; text-align: center; color: var(--muted);">Nhấn nút thêm câu hỏi con để bắt đầu biên soạn.</div>`;
  }

  // Toggle Collapse
  window.togglePassageCollapse = function (groupId) {
    var key = "tma_qb_passage_collapsed_" + groupId;
    var collapsed = localStorage.getItem(key) === "true";
    localStorage.setItem(key, collapsed ? "false" : "true");
    
    var group = getActiveGroup();
    var q = getActiveQuestion();
    loadQuestionToEditor(q, group);
  };

  // Sync Passage Live
  window.syncPassageMetaLive = function () {
    var group = getActiveGroup();
    if (group) {
      group.title = document.getElementById("g-title")?.value || "";
      group.passage = document.getElementById("g-passage")?.value || "";
      if (group.stimulus) group.stimulus.content = group.passage;
    }
  };

  // Render question tabs horizontally
  function renderQuestionPills(questions) {
    if (!Array.isArray(questions)) return "";
    var pillsHtml = "";
    
    questions.forEach(function (q, idx) {
      var isSelected = (selectedQuestionIdx === idx);
      var diffLabel = q.difficulty === 3 ? "Khó" : (q.difficulty === 2 ? "TB" : "Dễ");
      var diffClass = q.difficulty === 3 ? "level-3" : (q.difficulty === 2 ? "level-2" : "level-1");
      pillsHtml += `
        <button type="button" class="qb-pill-btn ${isSelected ? 'selected' : ''} ${diffClass}" onclick="window.selectQuestionPill(${idx})">
          Câu ${idx + 1} (${diffLabel})
        </button>
      `;
    });

    pillsHtml += `
      <button type="button" class="qb-pill-btn qb-pill-action" onclick="window.addNewQuestionPill()">
        <i data-lucide="plus" style="width: 14px; height: 14px; margin-right: 2px;"></i> Thêm Câu
      </button>
    `;

    if (questions.length > 0) {
      pillsHtml += `
        <button type="button" class="qb-pill-btn qb-pill-delete" onclick="window.deleteCurrentQuestionPill()" title="Xóa câu hỏi đang chọn">
          <i data-lucide="trash-2" style="width: 14px; height: 14px; margin-right: 2px;"></i> Xóa Câu
        </button>
      `;
    }

    return `<div class="qb-pills-bar">${pillsHtml}</div>`;
  }

  window.selectQuestionPill = function (idx) {
    selectedQuestionIdx = idx;
    var group = getActiveGroup();
    var q = getActiveQuestion();
    loadQuestionToEditor(q, group);
  };

  // Add new question through pills bar
  window.addNewQuestionPill = function () {
    var section = getSection(selectedSubject);
    if (!section) return;

    var newQ = {
      question_no: 1,
      question_type: "single_choice",
      question: "Nội dung câu hỏi con mới...",
      difficulty: 1,
      topic: selectedSubject === "math" ? "Toán học" : "Đọc hiểu",
      options: [
        { key: "A", text: "Phương án A" },
        { key: "B", text: "Phương án B" },
        { key: "C", text: "Phương án C" },
        { key: "D", text: "Phương án D" }
      ],
      correct_answer: "A",
      explanation: "",
      points: 1
    };

    if (selectedSubject === "math") {
      if (!Array.isArray(section.questions)) section.questions = [];
      newQ.question_no = section.questions.length + 1;
      section.questions.push(newQ);
      selectedQuestionIdx = section.questions.length - 1;
      selectedGroupId = null;
      loadQuestionToEditor(newQ);
    } else {
      var group = getActiveGroup();
      if (!group) {
        alert("Vui lòng chọn hoặc tạo một Ngữ liệu bài đọc trước.");
        return;
      }
      if (!Array.isArray(group.questions)) group.questions = [];
      newQ.question_no = group.questions.length + 1;
      group.questions.push(newQ);
      selectedQuestionIdx = group.questions.length - 1;
      loadQuestionToEditor(newQ, group);
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
    showToast("✓ Đã thêm câu hỏi con mới!");
  };

  // Delete current question pill
  window.deleteCurrentQuestionPill = function () {
    if (selectedQuestionIdx === null) return;
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi con này?")) return;

    var section = getSection(selectedSubject);
    if (!section) return;

    if (selectedSubject === "math") {
      section.questions.splice(selectedQuestionIdx, 1);
      section.questions.forEach((q, idx) => q.question_no = idx + 1);
      selectedQuestionIdx = section.questions.length > 0 ? 0 : null;
      var newQ = getActiveQuestion();
      loadQuestionToEditor(newQ || null);
    } else {
      var group = getActiveGroup();
      if (group) {
        group.questions.splice(selectedQuestionIdx, 1);
        group.questions.forEach((q, idx) => q.question_no = idx + 1);
        selectedQuestionIdx = group.questions.length > 0 ? 0 : null;
        loadQuestionToEditor(group.questions[0] || null, group);
      }
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
    showToast("✓ Đã xóa câu hỏi!");
  };

  // Defensive rendering of question options / statements
  function populateTypeFields(q) {
    var container = document.getElementById("q-fields-container");
    if (!container) return;

    var qType = q.question_type || "single_choice";
    var opts = q.options || [];

    if (qType === "single_choice") {
      var optA = "";
      var optB = "";
      var optC = "";
      var optD = "";
      if (Array.isArray(opts)) {
        optA = (opts.find(o => o && o.key === "A")?.text || "Phương án A").trim();
        optB = (opts.find(o => o && o.key === "B")?.text || "Phương án B").trim();
        optC = (opts.find(o => o && o.key === "C")?.text || "Phương án C").trim();
        optD = (opts.find(o => o && o.key === "D")?.text || "Phương án D").trim();
      } else {
        optA = "Phương án A";
        optB = "Phương án B";
        optC = "Phương án C";
        optD = "Phương án D";
      }
      var corr = q.correct_answer || "A";

      container.innerHTML = `
        <span style="font-weight: 700; font-size: 11.5px; color: #344054; display: block; margin-bottom: 8px;">Các phương án lựa chọn và đáp án đúng</span>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="option-field ${corr === 'A' ? 'is-correct' : ''}">
            <div class="option-badge">A</div>
            <input type="text" id="opt-A" value="${optA}" oninput="window.updateLivePreview()">
          </div>
          <div class="option-field ${corr === 'B' ? 'is-correct' : ''}">
            <div class="option-badge">B</div>
            <input type="text" id="opt-B" value="${optB}" oninput="window.updateLivePreview()">
          </div>
          <div class="option-field ${corr === 'C' ? 'is-correct' : ''}">
            <div class="option-badge">C</div>
            <input type="text" id="opt-C" value="${optC}" oninput="window.updateLivePreview()">
          </div>
          <div class="option-field ${corr === 'D' ? 'is-correct' : ''}">
            <div class="option-badge">D</div>
            <input type="text" id="opt-D" value="${optD}" oninput="window.updateLivePreview()">
          </div>
        </div>
        <label class="field" style="margin-top: 10px;">
          <span>Chọn đáp án đúng</span>
          <select id="opt-correct" onchange="window.updateOptCorrectDisplay()" style="height: 38px; border: 1px solid var(--line-strong); border-radius: 6px; background: white; padding: 0 8px; font-weight: 700;">
            <option value="A" ${corr === 'A' ? "selected" : ""}>Đáp án A</option>
            <option value="B" ${corr === 'B' ? "selected" : ""}>Đáp án B</option>
            <option value="C" ${corr === 'C' ? "selected" : ""}>Đáp án C</option>
            <option value="D" ${corr === 'D' ? "selected" : ""}>Đáp án D</option>
          </select>
        </label>
      `;
    } else if (qType === "true_false") {
      var stmts = Array.isArray(q.statements) ? q.statements : [];
      if (stmts.length === 0) {
        stmts = [
          { id: "a", text: "Mệnh đề a" },
          { id: "b", text: "Mệnh đề b" },
          { id: "c", text: "Mệnh đề c" },
          { id: "d", text: "Mệnh đề d" }
        ];
      }
      var corrObj = (q.correct_answer && typeof q.correct_answer === "object") ? q.correct_answer : { a: true, b: false, c: true, d: false };

      var stmtsHtml = "";
      stmts.forEach(function (st) {
        var isT = corrObj[st.id] === true;
        stmtsHtml += `
          <div style="display: flex; gap: 8px; align-items: center; border: 1px solid var(--line); border-radius: 6px; padding: 8px; background: #fafafa;">
            <span style="font-weight: 800; font-size: 11px; background: #e2e8f0; color: #475569; width: 22px; height: 22px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; text-transform: uppercase;">${st.id}</span>
            <input type="text" id="stmt-text-${st.id}" value="${st.text || ""}" style="flex: 1; border: 1px solid var(--line-strong); border-radius: 5px; height: 32px; padding: 0 8px;" oninput="window.updateLivePreview()">
            <select id="stmt-corr-${st.id}" style="height: 32px; border: 1px solid var(--line-strong); border-radius: 5px; font-weight: 700; width: 76px;" onchange="window.updateLivePreview()">
              <option value="T" ${isT ? "selected" : ""}>ĐÚNG</option>
              <option value="F" ${!isT ? "selected" : ""}>SAI</option>
            </select>
          </div>
        `;
      });

      container.innerHTML = `
        <span style="font-weight: 700; font-size: 11.5px; color: #344054; display: block; margin-bottom: 8px;">Nhập các mệnh đề phát biểu và đáp án Đúng/Sai</span>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${stmtsHtml}
        </div>
      `;
    } else if (qType === "numeric_answer") {
      var numCorr = q.correct_answer || "";
      var tol = q.tolerance || 0;
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <label class="field">
            <span>Đáp án số đúng</span>
            <input type="number" id="num-corr" step="any" value="${numCorr}" oninput="window.updateLivePreview()">
          </label>
          <label class="field">
            <span>Sai số cho phép (Tolerance)</span>
            <input type="number" id="num-tol" step="any" value="${tol}" oninput="window.updateLivePreview()">
          </label>
        </div>
      `;
    } else if (qType === "fill_blank") {
      var corrStr = "";
      if (typeof q.correct_answer === "object" && q.correct_answer !== null) {
        var pairs = [];
        for (var k in q.correct_answer) {
          pairs.push(k + "=" + q.correct_answer[k]);
        }
        corrStr = pairs.join(" | ");
      } else {
        corrStr = String(q.correct_answer || "");
      }
      container.innerHTML = `
        <label class="field">
          <span>Đáp án điền khuyết (Ngăn cách nhiều ô bằng dấu gạch đứng |)</span>
          <input type="text" id="fill-corr" value="${corrStr}" placeholder="Ví dụ: o1=phân số | o2=đạo hàm" oninput="window.updateLivePreview()">
        </label>
      `;
    } else if (qType === "drag_drop") {
      var itemsArr = q.items || [];
      var itemsStr = itemsArr.map(it => it.text).join(" | ");
      
      var corrStr = "";
      if (typeof q.correct_answer === "object" && q.correct_answer !== null) {
        var pairs = [];
        for (var k in q.correct_answer) {
          pairs.push(k + "=" + q.correct_answer[k]);
        }
        corrStr = pairs.join(" | ");
      } else {
        corrStr = String(q.correct_answer || "");
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label class="field">
            <span>Danh sách nhãn kéo thả (phân cách bằng dấu gạch đứng |)</span>
            <input type="text" id="drag-items" value="${itemsStr}" placeholder="Ví dụ: điện năng | hóa năng | cơ năng" oninput="window.updateLivePreview()">
          </label>
          <label class="field">
            <span>Đáp án ghép nối (dạng o1=i1 | o2=i2...)</span>
            <input type="text" id="drag-corr" value="${corrStr}" placeholder="Ví dụ: o1=item1 | o2=item2" oninput="window.updateLivePreview()">
          </label>
        </div>
      `;
    }
  }

  // Update correct option highlights
  window.updateOptCorrectDisplay = function () {
    var val = document.getElementById("opt-correct")?.value;
    document.querySelectorAll(".option-field").forEach(function (f) {
      f.classList.remove("is-correct");
    });
    if (val) {
      var targetInput = document.getElementById("opt-" + val);
      if (targetInput) {
        targetInput.parentElement.classList.add("is-correct");
      }
    }
    window.updateLivePreview();
  };

  // Live preview math rendering
  window.updateLivePreview = function () {
    var previewEl = document.getElementById("preview-area");
    if (!previewEl) return;

    var selectedQ = collectFormQuestion();
    if (!selectedQ) return;

    if (selectedSubject === "math") {
      // Single Math question preview (using renderQuestionTo)
      previewEl.innerHTML = "";
      
      var qRow = document.createElement("div");
      qRow.className = "split-question-row";
      qRow.style.cssText = "padding: 16px 20px; border: 1.5px solid #3b82f6; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";
      
      var qNumBox = document.createElement("div");
      qNumBox.className = "split-q-num-box";
      qNumBox.style.cssText = "background-color: #3b82f6; color: #ffffff;";
      qNumBox.textContent = selectedQ.question_no || 1;
      qRow.appendChild(qNumBox);
      
      var qMiddle = document.createElement("div");
      qMiddle.className = "split-q-middle";
      qMiddle.style.cssText = "flex: 1; min-width: 0;";
      
      var qBody = document.createElement("div");
      qBody.className = "question-body";
      qBody.id = "q-body-preview-math";
      qMiddle.appendChild(qBody);
      
      var qAns = document.createElement("div");
      qAns.className = "answer-area";
      qAns.id = "q-ans-preview-math";
      qMiddle.appendChild(qAns);
      
      qRow.appendChild(qMiddle);
      
      var qActionBox = document.createElement("div");
      qActionBox.className = "split-q-action-box";
      var qBookmarkBtn = document.createElement("button");
      qBookmarkBtn.type = "button";
      qBookmarkBtn.className = "bookmark-button";
      qBookmarkBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
          <path fill="currentColor" d="m19 18 2 1V3c0-1.1-.9-2-2-2H8.99C7.89 1 7 1.9 7 3h10c1.1 0 2 .9 2 2zM15 5H5c-1.1 0-2 .9-2 2v16l7-3 7 3V7c0-1.1-.9-2-2-2"></path>
        </svg>
      `;
      qActionBox.appendChild(qBookmarkBtn);
      qRow.appendChild(qActionBox);
      
      previewEl.appendChild(qRow);
      
      if (window.renderQuestionTo) {
        var previewAns = prepareSavedAnswerForPreview(selectedQ);
        window.renderQuestionTo(selectedQ, previewAns, null, qBody, qAns, { showSolution: false });
      }

      // Append solution explanation if present
      if (selectedQ.explanation && selectedQ.explanation.trim()) {
        var expDiv = document.createElement("div");
        expDiv.style.cssText = "margin-top: 16px; border-top: 1.5px dashed var(--line-strong); padding-top: 16px;";
        expDiv.innerHTML = `
          <h5 style="margin: 0 0 8px; font-size: 13.5px; font-weight: 800; color: var(--green); display: flex; align-items: center; gap: 4px;">
            💡 Lời giải chi tiết:
          </h5>
          <div style="font-size: 13.5px; line-height: 1.7; color: #475569;">
            ${selectedQ.explanation.replace(/\n/g, "<br>")}
          </div>
        `;
        qMiddle.appendChild(expDiv);
      }
    } else {
      // Grouped Scrolling View for Reading and Science
      var group = getActiveGroup();
      if (!group) return;

      previewEl.innerHTML = "";

      // 1. Render the passage stimulus at the top
      if (group.passage) {
        var passageCard = document.createElement("div");
        passageCard.className = "stimulus-card";
        passageCard.style.cssText = "margin-bottom: 24px; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);";
        
        var passageTitle = document.createElement("h3");
        passageTitle.style.cssText = "text-align: center; font-weight: 800; font-size: 17px; margin: 0 0 16px; color: #0f172a; line-height: 1.4;";
        passageTitle.textContent = group.title || "Chưa đặt tên";
        passageCard.appendChild(passageTitle);
        
        var passageBody = document.createElement("div");
        passageBody.className = "passage-body";
        passageBody.style.cssText = "font-size: 14.5px; line-height: 1.8; color: #334155; max-height: 400px; overflow-y: auto; padding-right: 8px;";
        
        // Custom image url resolver inside the HTML string to fetch CDN assets correctly
        var passageHtml = group.passage || "";
        var isLocalFile = (window.location.protocol === "file:");
        passageHtml = passageHtml.replace(/<img\s+([^>]*\s+)?src=(["'])([^"\'\s]+)\2/gi, function(match, prefix, quote, src) {
          var newSrc = src;
          if (src.indexOf("http://") !== 0 && src.indexOf("https://") !== 0 && src.indexOf("data:") !== 0) {
            if (isLocalFile) {
              newSrc = src.indexOf("assets/") === 0 ? src : "assets/" + src;
            } else {
              newSrc = src.indexOf("assets/") === 0 ? "https://assets.tmastudy.io.vn/" + src : "https://assets.tmastudy.io.vn/assets/" + src;
            }
          }
          return '<img ' + (prefix || '') + 'src=' + quote + newSrc + quote;
        });

        passageBody.innerHTML = passageHtml;
        passageCard.appendChild(passageBody);
        previewEl.appendChild(passageCard);
        
        var hr = document.createElement("hr");
        hr.style.cssText = "border: none; border-top: 2px dashed #cbd5e1; margin: 24px 0;";
        previewEl.appendChild(hr);
      }

      // 2. Render all sub-questions of the passage group stacked vertically
      var tempQuestions = (group.questions || []).map((origQ, idx) => {
        if (idx === selectedQuestionIdx) {
          return selectedQ; // Use current live unsaved state from form inputs
        }
        return origQ;
      });

      tempQuestions.forEach((q, idx) => {
        var qRow = document.createElement("div");
        qRow.className = "split-question-row";
        
        // Active sub-question has border highlight
        var isActive = (idx === selectedQuestionIdx);
        qRow.style.cssText = `
          padding: 16px 20px; 
          border: 1.5px solid ${isActive ? '#3b82f6' : '#e2e8f0'}; 
          border-radius: 8px; 
          background: #ffffff; 
          margin-bottom: 24px; 
          box-shadow: ${isActive ? '0 4px 12px rgba(59,130,246,0.08)' : '0 1px 3px rgba(0,0,0,0.02)'};
          transition: all 0.2s ease;
        `;
        
        var qNumBox = document.createElement("div");
        qNumBox.className = "split-q-num-box";
        if (isActive) {
          qNumBox.style.cssText = "background-color: #3b82f6; color: #ffffff;";
        }
        qNumBox.textContent = q.question_no || (idx + 1);
        qRow.appendChild(qNumBox);
        
        var qMiddle = document.createElement("div");
        qMiddle.className = "split-q-middle";
        qMiddle.style.cssText = "flex: 1; min-width: 0;";
        
        var qBody = document.createElement("div");
        qBody.className = "question-body";
        qBody.id = "q-body-preview-" + idx;
        qMiddle.appendChild(qBody);
        
        var qAns = document.createElement("div");
        qAns.className = "answer-area";
        qAns.id = "q-ans-preview-" + idx;
        qMiddle.appendChild(qAns);
        
        qRow.appendChild(qMiddle);
        
        var qActionBox = document.createElement("div");
        qActionBox.className = "split-q-action-box";
        var qBookmarkBtn = document.createElement("button");
        qBookmarkBtn.type = "button";
        qBookmarkBtn.className = "bookmark-button";
        qBookmarkBtn.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
            <path fill="currentColor" d="m19 18 2 1V3c0-1.1-.9-2-2-2H8.99C7.89 1 7 1.9 7 3h10c1.1 0 2 .9 2 2zM15 5H5c-1.1 0-2 .9-2 2v16l7-3 7 3V7c0-1.1-.9-2-2-2"></path>
          </svg>
        `;
        qActionBox.appendChild(qBookmarkBtn);
        qRow.appendChild(qActionBox);
        
        previewEl.appendChild(qRow);
        
        if (window.renderQuestionTo) {
          var previewAns = prepareSavedAnswerForPreview(q);
          window.renderQuestionTo(q, previewAns, null, qBody, qAns, { showSolution: false });
        }

        // Render explanation for this question
        if (q.explanation && q.explanation.trim()) {
          var expDiv = document.createElement("div");
          expDiv.style.cssText = "margin-top: 16px; border-top: 1.5px dashed var(--line-strong); padding-top: 16px;";
          expDiv.innerHTML = `
            <h5 style="margin: 0 0 8px; font-size: 13.5px; font-weight: 800; color: var(--green); display: flex; align-items: center; gap: 4px;">
              💡 Lời giải chi tiết:
            </h5>
            <div style="font-size: 13.5px; line-height: 1.7; color: #475569;">
              ${q.explanation.replace(/\n/g, "<br>")}
            </div>
          `;
          qMiddle.appendChild(expDiv);
        }
      });
    }

    triggerMathJax();
    initLiveEditing();
  };

  function initLiveEditing() {
    var previewEl = document.getElementById("preview-area");
    if (!previewEl) return;

    // 1. Passage body editing in place
    var passageBody = previewEl.querySelector(".passage-body");
    if (passageBody) {
      passageBody.contentEditable = "true";
      passageBody.title = "Nhấp chuột để sửa văn bản trực tiếp";

      // On focus, temporarily restore raw LaTeX / HTML source for editing
      passageBody.addEventListener("focus", function () {
        var textarea = document.getElementById("g-passage");
        if (textarea) {
          passageBody.innerHTML = textarea.value;
        }
      });

      // On input, sync raw changes to the left textarea
      passageBody.addEventListener("input", function () {
        var textarea = document.getElementById("g-passage");
        if (textarea) {
          textarea.value = passageBody.innerHTML;
          window.syncPassageMetaLive();
        }
      });

      // On blur, re-trigger full live preview to compile math symbols
      passageBody.addEventListener("blur", function () {
        window.updateLivePreview();
      });
    }

    // 2. Active question prompt editing in place
    var activeRow = previewEl.querySelectorAll(".split-question-row")[selectedQuestionIdx];
    if (activeRow) {
      var qBody = activeRow.querySelector(".question-body");
      if (qBody) {
        qBody.contentEditable = "true";
        qBody.title = "Nhấp chuột để sửa câu hỏi trực tiếp";

        // On focus, temporarily restore raw LaTeX for editing
        qBody.addEventListener("focus", function () {
          var textarea = document.getElementById("q-text");
          if (textarea) {
            qBody.innerHTML = textarea.value;
          }
        });

        // On input, sync raw changes to the left textarea
        qBody.addEventListener("input", function () {
          var textarea = document.getElementById("q-text");
          if (textarea) {
            textarea.value = qBody.innerHTML;
          }
        });

        // On blur, re-render to compile math symbols
        qBody.addEventListener("blur", function () {
          window.updateLivePreview();
        });
      }
    }

    // 3. Image Click Resize Overlay
    previewEl.querySelectorAll("img").forEach(function (img) {
      img.style.cursor = "pointer";
      img.title = "Click để điều chỉnh kích thước ảnh";
      
      img.addEventListener("click", function (e) {
        e.stopPropagation();
        
        // Remove existing overlay if any
        var oldOverlay = document.getElementById("tma-img-resize-ctrl");
        if (oldOverlay) oldOverlay.remove();
        
        // Create new overlay
        var ctrl = document.createElement("div");
        ctrl.id = "tma-img-resize-ctrl";
        ctrl.style.cssText = "position: absolute; display: flex; gap: 8px; background: #0f172a; padding: 6px 10px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); z-index: 9999; align-items: center; border: 1px solid #334155; color: white; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;";
        
        // Buttons
        var btnDec = document.createElement("button");
        btnDec.type = "button";
        btnDec.textContent = "Co lại ( - )";
        btnDec.style.cssText = "background: #1e293b; border: 1px solid #475569; color: white; border-radius: 4px; padding: 3px 8px; cursor: pointer; font-size: 11px;";
        
        var labelWidth = document.createElement("span");
        var initialWidth = img.getAttribute("width") || img.style.width || img.width || "100%";
        labelWidth.textContent = initialWidth;
        labelWidth.style.cssText = "margin: 0 4px; color: #94a3b8;";
        
        var btnInc = document.createElement("button");
        btnInc.type = "button";
        btnInc.textContent = "Giãn ra ( + )";
        btnInc.style.cssText = "background: #1e293b; border: 1px solid #475569; color: white; border-radius: 4px; padding: 3px 8px; cursor: pointer; font-size: 11px;";

        var btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.textContent = "Xóa ảnh";
        btnDel.style.cssText = "background: #bd2632; border: 1px solid #bd2632; color: white; border-radius: 4px; padding: 3px 8px; cursor: pointer; font-size: 11px; margin-left: 8px;";
        
        ctrl.appendChild(btnDec);
        ctrl.appendChild(labelWidth);
        ctrl.appendChild(btnInc);
        ctrl.appendChild(btnDel);
        
        // Positioning
        previewEl.appendChild(ctrl);
        var rect = img.getBoundingClientRect();
        var containerRect = previewEl.getBoundingClientRect();
        var top = rect.top - containerRect.top + previewEl.scrollTop - 44;
        var left = rect.left - containerRect.left + (rect.width / 2) - 120;
        
        ctrl.style.top = top + "px";
        ctrl.style.left = Math.max(10, left) + "px";
        
        // Functions
        function triggerParentSync() {
          var parentEditable = img.closest("[contenteditable='true']");
          if (parentEditable) {
            var event = new Event("input", { bubbles: true });
            parentEditable.dispatchEvent(event);
          }
        }
        
        btnDec.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var widthStr = img.getAttribute("width") || img.style.width || "100%";
          var isPercent = widthStr.includes("%");
          var val = parseInt(widthStr, 10) || 100;
          
          if (isPercent) {
            val = Math.max(10, val - 10);
            img.setAttribute("width", val + "%");
            img.style.width = val + "%";
          } else {
            val = Math.max(50, val - 50);
            img.setAttribute("width", val + "");
            img.style.width = val + "px";
          }
          labelWidth.textContent = val + (isPercent ? "%" : "px");
          triggerParentSync();
        });
        
        btnInc.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var widthStr = img.getAttribute("width") || img.style.width || "100%";
          var isPercent = widthStr.includes("%");
          var val = parseInt(widthStr, 10) || 100;
          
          if (isPercent) {
            val = Math.min(100, val + 10);
            img.setAttribute("width", val + "%");
            img.style.width = val + "%";
          } else {
            val = Math.min(1200, val + 50);
            img.setAttribute("width", val + "");
            img.style.width = val + "px";
          }
          labelWidth.textContent = val + (isPercent ? "%" : "px");
          triggerParentSync();
        });
        
        btnDel.addEventListener("click", function (ev) {
          ev.stopPropagation();
          if (confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi nội dung?")) {
            var parent = img.parentNode;
            img.remove();
            if (parent) {
              var event = new Event("input", { bubbles: true });
              parent.dispatchEvent(event);
            }
            ctrl.remove();
          }
        });
      });
    });

    // Dismiss overlay on clicking anywhere else
    document.addEventListener("click", function (e) {
      var ctrl = document.getElementById("tma-img-resize-ctrl");
      if (ctrl && !ctrl.contains(e.target)) {
        ctrl.remove();
      }
    }, { once: true });
  }

  function prepareSavedAnswerForPreview(q) {
    var qType = q.question_type || q.type;
    var corr = q.correct_answer;
    if (!corr) return null;

    if (qType === "single_choice" || qType === "numeric_answer") {
      return corr; // Keep as string/number
    }

    if (qType === "true_false") {
      if (typeof corr === "object") return corr;
      var obj = {};
      if (typeof corr === "string") {
        corr.split("|").forEach(function (part) {
          var sub = part.split("=");
          if (sub.length === 2) {
            var k = sub[0].trim();
            var v = sub[1].trim().toLowerCase();
            obj[k] = (v === "t" || v === "true" || v === "1");
          }
        });
        return obj;
      }
      return corr;
    }

    if (qType === "fill_blank" || qType === "drag_drop") {
      if (typeof corr === "object") return corr;
      var obj = {};
      if (typeof corr === "string") {
        if (corr.indexOf("=") !== -1) {
          corr.split("|").forEach(function (part) {
            var sub = part.split("=");
            if (sub.length === 2) {
              obj[sub[0].trim()] = sub[1].trim();
            }
          });
          return obj;
        } else {
          return corr;
        }
      }
      return corr;
    }

    return corr;
  };

  // Collect question details from form
  function collectFormQuestion() {
    var qType = document.getElementById("q-type").value;
    var diff = Number(document.getElementById("q-difficulty").value);
    var topic = document.getElementById("q-topic").value.trim();
    var qText = document.getElementById("q-text").value.trim();
    var expText = document.getElementById("q-explanation").value.trim();

    var base = {
      question_no: selectedQuestionIdx !== null ? (selectedQuestionIdx + 1) : 1,
      question_type: qType,
      question: qText,
      difficulty: diff,
      topic: topic,
      explanation: expText,
      solution_details: expText,
      points: 1
    };

    if (qType === "single_choice") {
      base.options = [
        { key: "A", text: (document.getElementById("opt-A")?.value || "").trim() },
        { key: "B", text: (document.getElementById("opt-B")?.value || "").trim() },
        { key: "C", text: (document.getElementById("opt-C")?.value || "").trim() },
        { key: "D", text: (document.getElementById("opt-D")?.value || "").trim() }
      ];
      base.correct_answer = document.getElementById("opt-correct").value;
    } else if (qType === "true_false") {
      var stmts = [];
      var correct_answer = {};
      ["a", "b", "c", "d"].forEach(function (id) {
        var txtInput = document.getElementById("stmt-text-" + id);
        var corrSel = document.getElementById("stmt-corr-" + id);
        if (txtInput) {
          stmts.push({ id: id, text: txtInput.value.trim() });
          correct_answer[id] = (corrSel ? corrSel.value === "T" : true);
        }
      });
      base.statements = stmts;
      base.correct_answer = correct_answer;
    } else if (qType === "numeric_answer") {
      base.correct_answer = Number(document.getElementById("num-corr")?.value || 0);
      base.tolerance = Number(document.getElementById("num-tol")?.value || 0);
    } else if (qType === "fill_blank") {
      var corrVal = document.getElementById("fill-corr").value.trim();
      if (corrVal.includes("=")) {
        var correct_answer = {};
        corrVal.split("|").forEach(function (pair) {
          var parts = pair.split("=");
          if (parts.length === 2) {
            correct_answer[parts[0].trim()] = parts[1].trim();
          }
        });
        base.correct_answer = correct_answer;
        base.accepted_answers = [];
      } else {
        base.correct_answer = corrVal;
        base.accepted_answers = [corrVal];
      }
    } else if (qType === "drag_drop") {
      var rawItems = (document.getElementById("drag-items").value || "").split("|").map(s => s.trim()).filter(Boolean);
      var items = rawItems.map((text, idx) => ({ id: "item" + (idx + 1), text: text }));
      base.items = items;

      var corrVal = (document.getElementById("drag-corr").value || "").trim();
      var correct_answer = {};
      corrVal.split("|").forEach(function (pair) {
        var parts = pair.split("=");
        if (parts.length === 2) {
          var blankId = parts[0].trim();
          var matchText = parts[1].trim();
          var foundItem = items.find(it => it.text === matchText);
          if (!foundItem) {
            var numMatch = matchText.match(/^(?:i|item)?(\d+)$/i);
            if (numMatch) {
              var idx = parseInt(numMatch[1], 10) - 1;
              if (idx >= 0 && idx < items.length) foundItem = items[idx];
            }
          }
          correct_answer[blankId] = foundItem ? foundItem.id : matchText;
        }
      });
      base.correct_answer = correct_answer;

      // Body layout
      var bodyStr = qText;
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
    }

    return base;
  }

  // Save active changes in-memory
  window.saveActiveQuestionChanges = function () {
    if (selectedQuestionIdx === null && selectedSubject === "math") return;
    
    var section = getSection(selectedSubject);
    if (!section) return;

    if (selectedSubject === "math") {
      var updatedQ = collectFormQuestion();
      section.questions[selectedQuestionIdx] = updatedQ;
    } else {
      var group = getActiveGroup();
      if (group) {
        group.title = document.getElementById("g-title")?.value || group.title;
        group.passage = document.getElementById("g-passage")?.value || group.passage;
        if (group.stimulus) group.stimulus.content = group.passage;

        if (selectedQuestionIdx !== null) {
          var updatedQ = collectFormQuestion();
          group.questions[selectedQuestionIdx] = updatedQ;
        }
      }
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));

    showToast("✓ Đã lưu thay đổi câu hỏi thành công!");
    
    var activeGrp = getActiveGroup();
    var activeQ = getActiveQuestion();
    loadQuestionToEditor(activeQ, activeGrp);
  };

  // Duplicate active question
  window.duplicateCurrentQuestion = function () {
    if (selectedQuestionIdx === null) return;

    var section = getSection(selectedSubject);
    if (!section) return;

    var currentQ = collectFormQuestion();
    var cloned = JSON.parse(JSON.stringify(currentQ));
    
    if (selectedSubject === "math") {
      cloned.question_no = section.questions.length + 1;
      section.questions.push(cloned);
      selectedQuestionIdx = section.questions.length - 1;
      loadQuestionToEditor(cloned);
    } else {
      var group = getActiveGroup();
      if (group) {
        cloned.question_no = group.questions.length + 1;
        group.questions.push(cloned);
        selectedQuestionIdx = group.questions.length - 1;
        loadQuestionToEditor(cloned, group);
      }
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
    showToast("✓ Nhân bản câu hỏi thành công!");
  };

  // Switch subject inside Editor
  window.onEditorSubjectChange = function() {
    var newSub = document.getElementById("q-subject").value;
    if (newSub === selectedSubject) return;

    if (!confirm("Bấm đồng ý sẽ chuyển câu hỏi này sang Môn học khác. Bạn có chắc chắn muốn đổi?")) {
      document.getElementById("q-subject").value = selectedSubject;
      return;
    }

    var currentQ = collectFormQuestion();
    var section = getSection(selectedSubject);
    
    if (selectedSubject === "math") {
      section.questions.splice(selectedQuestionIdx, 1);
      section.questions.forEach((q, i) => q.question_no = i + 1);
    } else {
      var group = getActiveGroup();
      if (group) {
        group.questions.splice(selectedQuestionIdx, 1);
        group.questions.forEach((q, i) => q.question_no = i + 1);
      }
    }

    var targetSec = getSection(newSub);
    if (newSub === "math") {
      if (!Array.isArray(targetSec.questions)) targetSec.questions = [];
      currentQ.question_no = targetSec.questions.length + 1;
      targetSec.questions.push(currentQ);
      
      selectedSubject = "math";
      selectedGroupId = null;
      selectedQuestionIdx = targetSec.questions.length - 1;
      loadQuestionToEditor(currentQ);
    } else {
      if (!Array.isArray(targetSec.groups)) targetSec.groups = [];
      var group = targetSec.groups[0];
      if (!group) {
        group = {
          group_id: "g_" + Date.now(),
          title: "Bài đọc mới",
          passage: "Vui lòng nhập văn bản ngữ liệu mới...",
          questions: []
        };
        targetSec.groups.push(group);
      }
      currentQ.question_no = group.questions.length + 1;
      group.questions.push(currentQ);

      selectedSubject = newSub;
      selectedGroupId = group.group_id;
      selectedQuestionIdx = group.questions.length - 1;
      loadQuestionToEditor(currentQ, group);
    }

    localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
    localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));
    showToast("✓ Đã chuyển đổi môn thành công!");
  };

  // AI Classifier
  window.triggerAiClassifier = async function () {
    var qText = document.getElementById("q-text")?.value || "";
    var qType = document.getElementById("q-type")?.value || "single_choice";
    if (!qText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi trước.");
      return;
    }

    setAiStatus("⏳ AI đang phân loại...");
    
    var prompt = `Hãy đóng vai trò một giáo viên chuyên môn cao. Phân tích nội dung câu hỏi sau:\n"${qText}"\n\nDạng câu hỏi: ${qType}.\n\nYêu cầu đầu ra dạng JSON chính xác có các thuộc tính sau:\n- difficulty: số nguyên đại diện mức độ (1: Dễ; 2: Trung bình; 3: Khó).\n- topic: Chuỗi tên chuyên đề hẹp của toán/đọc hiểu/khoa học cấp THPT.\n- reason: Chuỗi ngắn gọn giải thích lý do.\n\nJSON đầu ra:`;

    try {
      var payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      };
      
      var response = await window.TMA_AI.generate(payload);
      if (response.ok) {
        var resData = await response.json();
        var aiText = resData.candidates[0].content.parts[0].text;
        var parsed = JSON.parse(aiText);

        if (parsed.difficulty) document.getElementById("q-difficulty").value = String(parsed.difficulty);
        if (parsed.topic) document.getElementById("q-topic").value = parsed.topic;
        
        var reasonBox = document.getElementById("ai-reason-box");
        var reasonText = document.getElementById("ai-reason-text");
        if (reasonBox && reasonText) {
          reasonText.textContent = parsed.reason || "AI đã phân tích thành công.";
          reasonBox.style.display = "block";
        }
        
        setAiStatus("✅ AI đã phân loại xong!");
        showToast("✓ Phân loại AI thành công!");
      } else {
        throw new Error("Mã lỗi " + response.status);
      }
    } catch (err) {
      console.error(err);
      setAiStatus("❌ Lỗi AI: " + err.message);
    }
  };

  // AI Solver
  window.triggerAiSolver = async function () {
    var qText = document.getElementById("q-text")?.value || "";
    var qType = document.getElementById("q-type")?.value || "single_choice";
    
    var optionsContext = "";
    if (qType === "single_choice") {
      optionsContext = `\nCác phương án lựa chọn:\nA: ${document.getElementById("opt-A")?.value}\nB: ${document.getElementById("opt-B")?.value}\nC: ${document.getElementById("opt-C")?.value}\nD: ${document.getElementById("opt-D")?.value}\nĐáp án đúng: ${document.getElementById("opt-correct")?.value}`;
    }

    if (!qText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi trước.");
      return;
    }

    setAiStatus("⏳ AI đang giải chi tiết (LaTeX)...");

    var prompt = `Hãy viết lời giải chi tiết cho câu hỏi sau:\n"${qText}"\n\nDạng đề: ${qType}${optionsContext}\n\nYêu cầu lời giải:\n- Viết bằng tiếng Việt.\n- Trình bày từng bước rõ ràng.\n- Công thức toán bọc trong đô-la $...$ (ví dụ: $x^2$, $\\dfrac{a}{b}$).\n- KHÔNG dùng dấu sao ** để bôi đậm.\n- Trả về lời giải thô không kèm chào hỏi.`;

    try {
      var payload = { contents: [{ parts: [{ text: prompt }] }] };
      var response = await window.TMA_AI.generate(payload);
      if (response.ok) {
        var resData = await response.json();
        var aiText = resData.candidates[0].content.parts[0].text;
        
        var expArea = document.getElementById("q-explanation");
        if (expArea) {
          expArea.value = aiText.trim();
          window.updateLivePreview();
        }
        
        setAiStatus("✅ Đã tạo xong lời giải!");
        showToast("✓ Lời giải LaTeX đã tạo!");
      } else {
        throw new Error("Mã lỗi " + response.status);
      }
    } catch (err) {
      console.error(err);
      setAiStatus("❌ Lỗi AI: " + err.message);
    }
  };

  function setAiStatus(msg) {
    if (aiStatusEl) aiStatusEl.textContent = msg;
  }

  function showToast(msg, isError) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.className = "toast show" + (isError ? " error" : "");
    setTimeout(function () { toast.className = "toast"; }, 2500);
  }

  function clearForm() {
    if (activeQTitle) activeQTitle.textContent = "Chưa chọn mục soạn thảo";
    if (qForm) qForm.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">Chọn một Ngữ liệu hoặc Câu hỏi ngoài Danh sách để biên tập.</div>`;
    document.getElementById("preview-area").innerHTML = `<div style="padding: 40px; text-align: center; color: var(--muted);">Xem hiển thị LaTeX sẽ hiện ở đây.</div>`;
  }

  async function updateIndexInR2() {
    var exists = indexList.some(e => e.exam_code === targetCode);
    if (!exists) {
      indexList.push({
        exam_code: targetCode,
        title: "Đề ngẫu nhiên số 01",
        status: "published",
        duration_minutes: 150,
        is_open: true,
        subject: "tong-hop",
        file: "data/exams/TMA_RANDOM_001.json"
      });
      try {
        await window.TMAR2.putJson("data/exams/index.json", indexList);
        localStorage.setItem("tma_tsa_exam_index", JSON.stringify(indexList));
      } catch (err) {
        console.warn("Sync index failed:", err);
      }
    }
  }

  window.syncQuestionBankToCloud = async function () {
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<span>⏳ Đang đồng bộ...</span>`;
    }

    try {
      await updateIndexInR2();
      await window.TMAR2.putJson("data/exams/" + targetCode + ".json", examObj);
      
      localStorage.setItem("tma_tsa_exam_" + targetCode, JSON.stringify(examObj));
      localStorage.setItem("tma_tsa_teacher_draft_" + targetCode, JSON.stringify(examObj));

      showToast("✓ Đã đồng bộ Ngân hàng câu hỏi lên Cloudflare R2 thành công!");
    } catch (err) {
      console.error(err);
      showToast("❌ Lỗi đồng bộ: " + err.message, true);
    } finally {
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<i data-lucide="cloud-lightning"></i><span>Đồng bộ R2 Cloud</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };

  window.switchRightPanelTab = function (tabId) {
    document.querySelectorAll(".output-tab").forEach(function (tab) {
      var id = tab.getAttribute("data-output-tab");
      if (id === tabId) tab.classList.add("active");
      else tab.classList.remove("active");
    });

    document.querySelectorAll(".output-panel").forEach(function (panel) {
      var id = panel.getAttribute("id");
      if (id === "panel-" + tabId) panel.classList.add("active");
      else panel.classList.remove("active");
    });

    if (tabId === "preview") {
      window.updateLivePreview();
    }
  };

  window.onEditorQTypeChange = function () {
    var q = collectFormQuestion();
    populateTypeFields(q);
    window.updateLivePreview();
  };

  // AI Chatbot Widget Event Handlers
  // AI Chatbot Widget Event Handlers
  window.toggleAiChatbot = function () {
    var panel = document.getElementById("ai-chatbot-panel");
    if (panel) {
      panel.classList.toggle("active");
    }
  };

  function formatChatbotMessageText(text) {
    // 1. Escape HTML first
    var div = document.createElement("div");
    div.textContent = text;
    var html = div.innerHTML;

    // 2. Format Markdown bold **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 3. Format Bullet Lists
    html = html.replace(/^[*-]\s+(.*?)$/gm, "• $1");

    // 4. Linebreaks
    html = html.replace(/\n/g, "<br>");

    return html;
  }

  function appendChatbotMessage(sender, text) {
    var body = document.getElementById("ai-chatbot-body");
    if (!body) return;
    var msgDiv = document.createElement("div");
    msgDiv.className = "ai-chatbot-message " + sender;
    
    if (sender === "assistant") {
      msgDiv.innerHTML = formatChatbotMessageText(text);
    } else {
      msgDiv.textContent = text;
    }
    
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;

    // Compile MathJax equations in the new message
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([msgDiv]).catch(function (err) {
        console.warn("MathJax error in chat message:", err);
      });
    }
  }

  function updateChatbotThinkingDiv(thinkingDiv, text) {
    if (!thinkingDiv) return;
    thinkingDiv.innerHTML = formatChatbotMessageText(text);
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([thinkingDiv]).catch(function (err) {
        console.warn("MathJax error in thinking message:", err);
      });
    }
  }

  window.sendChatbotMessage = async function () {
    var input = document.getElementById("ai-chatbot-input");
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    input.value = "";
    appendChatbotMessage("user", text);

    // AI thinking state placeholder
    appendChatbotMessage("assistant", "⏳ AI đang suy nghĩ...");
    var thinkingMsgs = document.querySelectorAll(".ai-chatbot-message.assistant");
    var thinkingDiv = thinkingMsgs[thinkingMsgs.length - 1];

    var systemText = "Bạn là Trợ Lý AI Soạn Đề, một trợ lý AI thông minh chuyên nghiệp hỗ trợ thầy cô giáo biên soạn, phân loại câu hỏi và viết lời giải LaTeX cho đề thi đánh giá tư duy TMA TSA (Đại học Bách Khoa). Bạn được phát triển dựa trên nền tảng công nghệ API Gemini của Google. Khi trả lời thầy cô:\n1. Hãy giữ thái độ lịch sự, xưng hô 'Tôi' và 'Thầy cô'.\n2. Hỗ trợ giải thích hoặc gợi ý đề bài, chỉnh sửa công thức LaTeX (bọc bằng dấu đô-la $...$).\n3. Khi được hỏi về danh tính hoặc bạn là con AI nào, hãy trả lời rõ ràng: 'Tôi là Trợ Lý AI Soạn Đề thuộc hệ thống TMA TSA, hoạt động dựa trên mô hình ngôn ngữ lớn Gemini của Google.'";

    var chatbotProfile = {
      id: "tma-chatbot-assistant",
      name: "Trợ Lý AI Chatbot",
      systemPrompt: systemText,
      latexRules: "Dùng đô-la $...$ cho công thức nội dòng.",
      outputRules: "Trả lời lịch sự, thân thiện, khoa học.",
      examples: "",
      temperature: 0.3
    };

    try {
      var payload = {
        systemInstruction: {
          parts: [{ text: systemText }]
        },
        contents: [{ parts: [{ text: text }] }]
      };
      var response = await window.TMA_AI.generate(payload, { profile: chatbotProfile });
      if (response.ok) {
        var resData = await response.json();
        var aiText = resData.candidates[0].content.parts[0].text.trim();
        updateChatbotThinkingDiv(thinkingDiv, aiText);
      } else {
        throw new Error("Lỗi kết nối API");
      }
    } catch (err) {
      updateChatbotThinkingDiv(thinkingDiv, "❌ Lỗi: " + err.message);
    }
  };

  window.runChatbotClassifier = async function () {
    appendChatbotMessage("user", "Yêu cầu: Phân loại câu hỏi này.");
    appendChatbotMessage("assistant", "⏳ AI đang phân loại câu hỏi...");
    var thinkingMsgs = document.querySelectorAll(".ai-chatbot-message.assistant");
    var thinkingDiv = thinkingMsgs[thinkingMsgs.length - 1];

    var qText = document.getElementById("q-text")?.value || "";
    var qType = document.getElementById("q-type")?.value || "single_choice";
    if (!qText.trim()) {
      updateChatbotThinkingDiv(thinkingDiv, "❌ Không tìm thấy nội dung câu hỏi nào trong form để phân loại.");
      return;
    }

    var prompt = `Hãy phân tích nội dung câu hỏi sau:\n"${qText}"\n\nDạng câu hỏi: ${qType}.\n\nYêu cầu đầu ra dạng JSON chính xác có các thuộc tính sau:\n- difficulty: số nguyên đại diện mức độ (1: Dễ; 2: Trung bình; 3: Khó).\n- topic: Chuỗi tên chuyên đề hẹp của toán/đọc hiểu/khoa học cấp THPT.\n- reason: Chuỗi ngắn gọn giải thích lý do.\n\nJSON đầu ra:`;

    try {
      var payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      };
      
      var response = await window.TMA_AI.generate(payload);
      if (response.ok) {
        var resData = await response.json();
        var aiText = resData.candidates[0].content.parts[0].text;
        var parsed = JSON.parse(aiText);

        if (parsed.difficulty) document.getElementById("q-difficulty").value = String(parsed.difficulty);
        if (parsed.topic) document.getElementById("q-topic").value = parsed.topic;
        
        var msg = "🎯 Phân loại thành công:\n- Chuyên đề: " + (parsed.topic || "") + "\n- Độ khó: Mức " + (parsed.difficulty || "") + "\n- Lý do: " + (parsed.reason || "");
        updateChatbotThinkingDiv(thinkingDiv, msg);
        showToast("✓ Phân loại AI thành công!");
        window.updateLivePreview();
      } else {
        throw new Error("Mã lỗi " + response.status);
      }
    } catch (err) {
      updateChatbotThinkingDiv(thinkingDiv, "❌ Lỗi AI: " + err.message);
    }
  };

  window.runChatbotSolver = async function () {
    appendChatbotMessage("user", "Yêu cầu: Viết lời giải LaTeX cho câu hỏi.");
    appendChatbotMessage("assistant", "⏳ AI đang tính toán lời giải LaTeX...");
    var thinkingMsgs = document.querySelectorAll(".ai-chatbot-message.assistant");
    var thinkingDiv = thinkingMsgs[thinkingMsgs.length - 1];

    var qText = document.getElementById("q-text")?.value || "";
    var qType = document.getElementById("q-type")?.value || "single_choice";
    
    var optionsContext = "";
    if (qType === "single_choice") {
      optionsContext = `\nCác phương án lựa chọn:\nA: ${document.getElementById("opt-A")?.value}\nB: ${document.getElementById("opt-B")?.value}\nC: ${document.getElementById("opt-C")?.value}\nD: ${document.getElementById("opt-D")?.value}\nĐáp án đúng: ${document.getElementById("opt-correct")?.value}`;
    }

    if (!qText.trim()) {
      updateChatbotThinkingDiv(thinkingDiv, "❌ Không tìm thấy nội dung đề bài để giải.");
      return;
    }

    var prompt = `Hãy viết lời giải chi tiết cho câu hỏi sau:\n"${qText}"\n\nDạng đề: ${qType}${optionsContext}\n\nYêu cầu lời giải:\n- Viết bằng tiếng Việt.\n- Trình bày từng bước rõ ràng.\n- Công thức toán bọc trong đô-la $...$ (ví dụ: $x^2$, $\\dfrac{a}{b}$).\n- KHÔNG dùng dấu sao ** để bôi đậm.\n- Trả về lời giải thô không kèm chào hỏi.`;

    try {
      var payload = { contents: [{ parts: [{ text: prompt }] }] };
      var response = await window.TMA_AI.generate(payload);
      if (response.ok) {
        var resData = await response.json();
        var aiText = resData.candidates[0].content.parts[0].text;
        
        var expArea = document.getElementById("q-explanation");
        if (expArea) {
          expArea.value = aiText.trim();
        }
        
        updateChatbotThinkingDiv(thinkingDiv, "✅ Đã tạo xong lời giải chi tiết và điền trực tiếp vào ô Lời giải phía dưới.");
        showToast("✓ Lời giải LaTeX đã tạo!");
        window.updateLivePreview();
      } else {
        throw new Error("Mã lỗi " + response.status);
      }
    } catch (err) {
      updateChatbotThinkingDiv(thinkingDiv, "❌ Lỗi AI: " + err.message);
    }
  };

})();
