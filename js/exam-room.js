/**
 * Engine cho 3 phòng luyện cũ:
 * - exam-math.html      -> data-subject="math"
 * - exam-reading.html   -> data-subject="reading"
 * - exam-science.html   -> data-subject="science"
 *
 * Không tạo phòng luyện mới. File này chỉ nạp dữ liệu JSON và render vào 3 giao diện sẵn có.
 */
(function () {
  "use strict";

  if (!document.body || !document.body.classList.contains("exam-page")) return;

  // Keep localStorage drafts to sync teacher edits directly to student view

  const urlParams = new URLSearchParams(window.location.search);
  const examCode = (urlParams.get("exam") || "TSA001").trim() || "TSA001";
  const subject = document.body.dataset.subject || "math";
  const isSingleSubject = urlParams.get("single") === "true";

  const SECTION_LABELS = {
    math: "Tư duy Toán học",
    reading: "Đọc hiểu",
    science: "Khoa học"
  };

  const studentInfo = {
    name: "Nguyễn Văn Hải",
    code: "TMA507905"
  };

  try {
    const cachedStudent = JSON.parse(localStorage.getItem("studentInfo"));
    if (cachedStudent) {
      studentInfo.name = cachedStudent.name || cachedStudent.username || cachedStudent.email || studentInfo.name;
      studentInfo.code = cachedStudent.code || cachedStudent.phone || studentInfo.code;
    }
  } catch (e) {
    console.warn("Lỗi đọc studentInfo từ localStorage:", e);
  }

  // Khởi tạo Supabase Client từ cấu hình dùng chung
  let supabaseClient = null;
  let supabaseUrl = '';
  let supabaseStorageUrl = '';
  if (typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
    supabaseUrl = window.SUPABASE_CONFIG.url;
    supabaseClient = supabase.createClient(supabaseUrl, window.SUPABASE_CONFIG.anonKey);
    supabaseStorageUrl = `${supabaseUrl}/storage/v1/object/public/exams/`;
  } else {
    console.error("Supabase config or library not loaded!");
  }

  let examData = null;
  let rawExamData = null;
  let examMetaGlobal = null;
  let currentQuestionIndex = 0;
  let answers = {};
  let flagged = {};
  let remainingSeconds = 45 * 60;
  let questionElapsedSeconds = 0;
  let isSubmitted = false;
  let timerInterval = null;
  let renderedGroupId = null;

  const storageKey = `exam_answers_${examCode}_${subject}`;
  const flaggedKey = `exam_flagged_${examCode}_${subject}`;
  const submittedKey = `exam_submitted_${examCode}_${subject}`;
  const fullscreenRequiredKey = "tsaShouldFullscreen";
  const fullscreenStartedKey = "tsaFullscreenStarted";

  function $(selector) {
    return document.querySelector(selector);
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value;
  }

  function readSessionFlag(key) {
    try {
      return sessionStorage.getItem(key) === "1";
    } catch (error) {
      return false;
    }
  }

  function writeSessionFlag(key, value) {
    try {
      if (value) sessionStorage.setItem(key, "1");
      else sessionStorage.removeItem(key);
    } catch (error) {
      console.warn("Không lưu được sessionStorage:", error);
    }
  }

  function shouldEnforceFullscreen() {
    return readSessionFlag(fullscreenRequiredKey) || readSessionFlag(fullscreenStartedKey);
  }

  function clearFullscreenRequirement() {
    hasBeenFullscreen = false;
    writeSessionFlag(fullscreenRequiredKey, false);
    writeSessionFlag(fullscreenStartedKey, false);
  }

  function isInFullscreen() {
    const currentDocumentFullscreen = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (currentDocumentFullscreen) return true;

    try {
      const parentDocument = window.parent && window.parent !== window ? window.parent.document : null;
      return Boolean(
        parentDocument &&
        (
          parentDocument.fullscreenElement ||
          parentDocument.webkitFullscreenElement ||
          parentDocument.mozFullScreenElement ||
          parentDocument.msFullscreenElement
        )
      );
    } catch (error) {
      return false;
    }
  }

  function requestExamFullscreen() {
    if (isInFullscreen()) return Promise.resolve();

    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!req) return Promise.reject(new Error("Fullscreen API is not supported."));

    return Promise.resolve(req.call(el));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hasAnswer(answer) {
    if (answer === undefined || answer === null || answer === "") return false;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === "object") return Object.keys(answer).length > 0;
    return true;
  }

  function formatTime(secs) {
    const safe = Math.max(0, Number(secs) || 0);
    const m = Math.floor(safe / 60).toString().padStart(2, "0");
    const s = (safe % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function readLocalJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeLocalJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Không lưu được localStorage:", error);
    }
  }

  function loadLocalState() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("preview") === "true") {
      localStorage.removeItem(submittedKey);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(flaggedKey);
    }
    answers = readLocalJson(storageKey) || {};
    flagged = readLocalJson(flaggedKey) || {};

    const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";
    if (viewSolution) {
      isSubmitted = true;
    } else {
      isSubmitted = localStorage.getItem(submittedKey) === "true";
    }
  }

  function saveLocalState() {
    writeLocalJson(storageKey, answers);
    writeLocalJson(flaggedKey, flagged);
    localStorage.setItem(submittedKey, String(isSubmitted));
  }

  function showErrorMessage(msg) {
    const bodyEl = $("#question-body");
    if (bodyEl) {
      bodyEl.innerHTML = `<div style="color:#ef4444;padding:20px;font-weight:700;border:1px dashed #fca5a5;background:#fef2f2;border-radius:8px;line-height:1.5;">${esc(msg)}</div>`;
    }
    const ansEl = $("#answer-area");
    if (ansEl) ansEl.innerHTML = "";
  }

  function findSection(rawExam, sectionId) {
    return (rawExam.sections || []).find((section) => section.section_id === sectionId);
  }

  function normalizeFlatLegacyExam(rawExam) {
    return {
      exam_code: rawExam.exam_code || examCode,
      title: rawExam.title || examCode,
      subject: rawExam.subject || subject,
      subject_label: rawExam.subject_label || SECTION_LABELS[subject] || subject,
      duration_minutes: rawExam.duration_minutes || 45,
      questions: Array.isArray(rawExam.questions) ? rawExam.questions : [],
      passage: rawExam.passage || rawExam.passageText || ""
    };
  }

  function normalizeExamForSubject(rawExam, examMeta, subj = subject) {
    if (!rawExam || !Array.isArray(rawExam.sections)) {
      const legacy = normalizeFlatLegacyExam(rawExam || {});
      if (legacy.subject && legacy.subject !== subj && legacy.subject !== "tsa") {
        legacy.questions = [];
      }
      return legacy;
    }

    const section = findSection(rawExam, subj);
    const title = rawExam.title || (examMeta && examMeta.title) || examCode;
    const normalized = {
      exam_code: rawExam.exam_code || examCode,
      title: `${title} - ${SECTION_LABELS[subj] || subj}`,
      subject: subj,
      subject_label: section?.section_label || SECTION_LABELS[subj] || subj,
      duration_minutes: rawExam.duration_minutes || (examMeta && examMeta.duration_minutes) || 45,
      questions: []
    };

    if (!section) return normalized;

    if (subj === "math") {
      // Filter out blank/placeholder questions (questions with no real content)
      const allMathQs = (section.questions || []);
      const filledQs = allMathQs.filter((q) => {
        const text = (q.question || "").trim();
        if (!text) return false;
        // Reject default placeholder text like "Nội dung câu hỏi X chưa được nhập."
        if (/^N\u1ed9i dung c\u00e2u h\u1ecfi\s+\d+\s+ch\u01b0a \u0111\u01b0\u1ee3c nh\u1eadp/i.test(text)) return false;
        return true;
      });
      // Re-index sequentially from 1 so grid always starts at 1
      normalized.questions = filledQs.map((question, index) => ({
        ...question,
        question_no: index + 1,
        original_question_no: question.question_no
      }));
      return normalized;
    }

    let no = 1;
    (section.groups || []).forEach((group) => {
      (group.questions || []).forEach((question) => {
        const qNo = Number(question.question_no) || no;
        no = qNo + 1;
        normalized.questions.push({
          ...question,
          question_no: qNo,
          original_question_no: question.question_no,
          group_id: group.group_id,
          group_title: group.title,
          passage: group.stimulus?.content || "",
          passage_image_url: group.stimulus?.image_url || "",
          stimulus: group.stimulus || null
        });
      });
    });

    return normalized;
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Không tải được ${path}`);
    return response.json();
  }

  async function loadRawExam() {
    if (urlParams.get("preview") === "true") {
      const draft = readLocalJson(`tma_tsa_teacher_draft_${examCode}`) || readLocalJson(`tma_tsa_exam_${examCode}`);
      if (draft) return { rawExam: draft, examMeta: null };
    }

    let examsList = readLocalJson("tma_tsa_exam_index");

    // Tải index từ Supabase Storage trước
    try {
      const fetchedIndex = await fetchJson(`${supabaseStorageUrl}index.json`);
      if (Array.isArray(fetchedIndex) && fetchedIndex.length > 0) {
        examsList = fetchedIndex;
        writeLocalJson("tma_tsa_exam_index", fetchedIndex);
      }
    } catch (error) {
      console.warn("Không tải được index.json từ Supabase Storage, thử tải từ file cục bộ...");
      try {
        const fetchedIndex = await fetchJson("data/exams/index.json");
        if (Array.isArray(fetchedIndex)) {
          examsList = fetchedIndex;
          writeLocalJson("tma_tsa_exam_index", fetchedIndex);
        }
      } catch (e) {
        // Fallback sang localStorage nếu chạy offline hoàn toàn
      }
    }

    // Ánh xạ mã đề thi đơn lẻ TSAxx sang đề thi ghép TSA_PRACTICE_FULL_xx
    let targetFetchCode = examCode;
    const tsaMatch = examCode.match(/^TSA(\d+)$/i);
    if (tsaMatch) {
      const num = parseInt(tsaMatch[1], 10);
      const numStr = String(num).padStart(2, "0");
      targetFetchCode = `TSA_PRACTICE_FULL_${numStr}`;
    }

    const examMeta = Array.isArray(examsList)
      ? examsList.find((item) => item.exam_code === targetFetchCode) ||
        examsList.find((item) => item.exam_code === examCode) ||
        examsList.find((item) => item.exam_code === "TSA001")
      : null;

    let rawExam = null;

    // Tải đề từ Supabase Storage
    if (examMeta && examMeta.file) {
      const filename = examMeta.file.split('/').pop();
      try {
        rawExam = await fetchJson(`${supabaseStorageUrl}${encodeURIComponent(filename)}`);
      } catch (e) {
        console.warn("Không tải được đề thi từ Supabase Storage, thử tải cục bộ...");
      }
    } else {
      // Thử tải trực tiếp theo targetFetchCode.json từ Supabase Storage
      try {
        rawExam = await fetchJson(`${supabaseStorageUrl}${encodeURIComponent(targetFetchCode + ".json")}`);
      } catch (e) {}
    }

    // Fallback tải cục bộ hoặc localStorage
    if (!rawExam) {
      try {
        rawExam = await fetchJson(`data/exams/${encodeURIComponent(targetFetchCode)}.json`);
      } catch (e) {}
    }
    if (!rawExam && targetFetchCode !== examCode) {
      try {
        rawExam = await fetchJson(`data/exams/${encodeURIComponent(examCode)}.json`);
      } catch (e) {}
    }
    if (!rawExam) {
      rawExam = readLocalJson(`tma_tsa_exam_${examCode}`) || readLocalJson(`tma_tsa_teacher_draft_${examCode}`);
    }
    return { rawExam, examMeta };
  }

  function initMetadata() {
    if (!examData) return;

    setText("#sidebar-candidate-name", studentInfo.name);
    setText("#sidebar-candidate-id", studentInfo.code);
    setText("#submit-candidate-name", studentInfo.name);
    setText("#submit-candidate-id", studentInfo.code);
    setText("#header-candidate-id", studentInfo.code);
    setText("#progress-total-count", examData.questions.length);
    setText("#submit-progress-total-count", examData.questions.length);

    const headerTitle = $("#header-exam-title");
    if (headerTitle) headerTitle.textContent = examData.title;

    updateSidebarStats();
  }

  function updateSidebarStats() {
    if (!examData) return;

    const total = examData.questions.length;
    let answeredCount = 0;
    let flaggedCount = 0;

    examData.questions.forEach((q) => {
      if (hasAnswer(answers[q.question_no])) answeredCount++;
      if (flagged[q.question_no]) flaggedCount++;
    });

    const unanswered = total - answeredCount;
    const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

    setText("#stats-answered", answeredCount);
    setText("#stats-flagged", flaggedCount);
    setText("#stats-unanswered", unanswered);
    setText("#submit-stats-answered", answeredCount);
    setText("#submit-stats-flagged", flaggedCount);
    setText("#submit-stats-unanswered", unanswered);
    setText("#progress-done-count", answeredCount);
    setText("#submit-progress-done-count", answeredCount);
    setText("#progress-label", `${percent}%`);
    setText("#submit-progress-label", `${percent}%`);

    const progressBar = $("#progress-bar");
    if (progressBar) progressBar.style.width = `${percent}%`;
    const submitProgressBar = $("#submit-progress-bar");
    if (submitProgressBar) submitProgressBar.style.width = `${percent}%`;

    renderQuestionGrids();
  }

  function makeGridButton(question, idx) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "question-index";
    btn.textContent = question.question_no;

    if (idx === currentQuestionIndex) btn.classList.add("is-current");
    if (hasAnswer(answers[question.question_no])) btn.classList.add("is-answered");
    else btn.classList.add("is-unanswered");
    if (flagged[question.question_no]) btn.classList.add("is-flagged");

    if (isSubmitted) {
      const isCorrect = typeof gradeQuestion === "function" && gradeQuestion(question, answers[question.question_no]);
      btn.style.background = isCorrect ? "#22c55e" : "#ef4444";
      btn.style.color = "#ffffff";
      btn.style.borderColor = isCorrect ? "#22c55e" : "#ef4444";
    }

    btn.addEventListener("click", () => {
      currentQuestionIndex = idx;
      questionElapsedSeconds = 0;
      renderActiveQuestion();
      closeSubmitDrawer();
    });

    return btn;
  }

  function renderQuestionGrids() {
    if (!examData) return;
    ["#question-grid", "#submit-question-grid"].forEach((selector) => {
      const grid = $(selector);
      if (!grid) return;
      grid.innerHTML = "";
      examData.questions.forEach((q, idx) => grid.appendChild(makeGridButton(q, idx)));
    });
  }

  function updateGridSelection() {
    document.querySelectorAll("#question-grid .question-index, #submit-question-grid .question-index").forEach((item, idx) => {
      const realIndex = idx % Math.max(1, examData.questions.length);
      item.classList.toggle("is-current", realIndex === currentQuestionIndex);
    });
  }

  function renderPassage(question) {
    const passagePane = $("#passage-pane");
    const divider = $("#split-divider");
    if (!passagePane) return;

    const hasPassage = Boolean(question.passage || question.passage_image_url || question.group_title);
    if (!hasPassage) {
      passagePane.innerHTML = "";
      passagePane.style.display = "none";
      if (divider) divider.style.display = "none";
      return;
    }

    passagePane.style.display = "block";
    if (divider) divider.style.display = "flex";

    const group = {
      title: question.group_title || "Ngữ liệu",
      stimulus: {
        type: "text",
        content: question.passage || "",
        image_url: question.passage_image_url || ""
      }
    };

    if (typeof renderStimulusGroup === "function") {
      renderStimulusGroup(group, { target: passagePane });
    } else {
      passagePane.innerHTML = `<h3>${esc(group.title)}</h3><div>${esc(group.stimulus.content)}</div>`;
    }
  }

  function showQuestionFeedback(question, targetContainer) {
    const container = targetContainer || $("#answer-area");
    if (!container) return;

    if (container.querySelector(".feedback-box")) return;

    const ans = answers[question.question_no];
    const isCorrect = typeof gradeQuestion === "function" && gradeQuestion(question, ans);
    const qType = question.question_type || question.type;
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback-box";
    feedbackDiv.style.cssText = "margin-top:20px;padding:16px;border-radius:8px;font-size:13px;line-height:1.55;";

    if (isCorrect) {
      feedbackDiv.style.background = "#f0fdf4";
      feedbackDiv.style.border = "1px solid #bbf7d0";
      feedbackDiv.style.color = "#166534";
      feedbackDiv.innerHTML = '<div style="font-weight:700;font-size:14px;">Chính xác</div>';
    } else {
      let correctText = "";
      if (qType === "multiple_choice") {
        correctText = Array.isArray(question.correct_answer) ? question.correct_answer.join(", ") : question.correct_answer;
      } else if (qType === "true_false") {
        correctText = Object.keys(question.correct_answer || {}).map((key) => `${key}: ${question.correct_answer[key] ? "Đúng" : "Sai"}`).join("; ");
      } else if (qType === "drag_drop") {
        correctText = Object.keys(question.correct_answer || {}).map((key) => {
          const item = (question.items || []).find((it) => it.id === question.correct_answer[key]);
          return `${key}: ${item ? item.text : question.correct_answer[key]}`;
        }).join("; ");
      } else {
        correctText = question.correct_answer;
      }

      feedbackDiv.style.background = "#fef2f2";
      feedbackDiv.style.border = "1px solid #fca5a5";
      feedbackDiv.style.color = "#991b1b";
      feedbackDiv.innerHTML = `<div style="font-weight:700;font-size:14px;">Chưa chính xác</div><div style="margin-top:6px;"><strong>Đáp án đúng:</strong> ${esc(correctText)}</div>`;
    }

    container.appendChild(feedbackDiv);

    if (question.explanation) {
      const solutionContainer = document.createElement("div");
      solutionContainer.className = "solution-container";
      solutionContainer.style.cssText = "margin-top:16px; text-align: left;";

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "btn-toggle-solution";
      toggleBtn.style.cssText = `
        background-color: #a91e2c;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 8px 18px;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.2s;
        margin-bottom: 12px;
      `;
      toggleBtn.innerHTML = `<span>Lời giải</span> <svg class="arrow-icon" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(180deg);"><polyline points="18 15 12 9 6 15"></polyline></svg>`;

      const explanationBox = document.createElement("div");
      explanationBox.className = "explanation-box";
      explanationBox.style.cssText = `
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 18px;
        display: block;
      `;

      explanationBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #0284c7; font-weight: 700; font-size: 13.5px;">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Lời giải chi tiết:</span>
        </div>
        <div class="explanation-content text-left" style="color: #334155; font-size: 13.5px; line-height: 1.6;">
          ${question.explanation}
        </div>
      `;

      toggleBtn.addEventListener("click", () => {
        const isHidden = explanationBox.style.display === "none";
        explanationBox.style.display = isHidden ? "block" : "none";
        const arrow = toggleBtn.querySelector(".arrow-icon");
        if (arrow) {
          arrow.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
        }
      });

      solutionContainer.appendChild(toggleBtn);
      solutionContainer.appendChild(explanationBox);
      container.appendChild(solutionContainer);
    }

    container.querySelectorAll("input, select").forEach((el) => { el.disabled = true; });
  }

  function showResultsPanel() {
    if (!examData) return;

    let correctCount = 0;
    let totalPoints = 0;
    let scoredPoints = 0;

    examData.questions.forEach((q) => {
      const pts = Number(q.points == null ? 1 : q.points);
      totalPoints += pts;
      if (typeof gradeQuestion === "function" && gradeQuestion(q, answers[q.question_no])) {
        correctCount++;
        scoredPoints += pts;
      }
    });

    const parent = $(".question-card");
    if (!parent) return;

    let banner = $("#exam-results-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "exam-results-banner";
      banner.style.cssText = "background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;color:#166534;font-size:13px;";
      parent.insertBefore(banner, parent.firstChild);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";

    banner.innerHTML = `
      <h3 style="margin:0 0 8px;font-weight:800;font-size:15px;color:#15803d;text-transform:none;">Kết quả làm bài</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:8px;">
        <div style="background:#fff;padding:10px;border-radius:6px;border:1px solid #dcfce7;text-align:center;">
          <div style="font-size:10px;color:#16a34a;text-transform:uppercase;font-weight:700;">Số câu đúng</div>
          <div style="font-size:18px;font-weight:800;margin-top:4px;color:var(--text);">${correctCount} / ${examData.questions.length}</div>
        </div>
        <div style="background:#fff;padding:10px;border-radius:6px;border:1px solid #dcfce7;text-align:center;">
          <div style="font-size:10px;color:#16a34a;text-transform:uppercase;font-weight:700;">Điểm số</div>
          <div style="font-size:18px;font-weight:800;margin-top:4px;color:var(--text);">${scoredPoints.toFixed(1)} / ${totalPoints.toFixed(1)}</div>
        </div>
        <div style="background:#fff;padding:10px;border-radius:6px;border:1px solid #dcfce7;text-align:center;">
          <div style="font-size:10px;color:#16a34a;text-transform:uppercase;font-weight:700;">Độ chính xác</div>
          <div style="font-size:18px;font-weight:800;margin-top:4px;color:var(--text);">${examData.questions.length ? Math.round((correctCount / examData.questions.length) * 100) : 0}%</div>
        </div>
      </div>
      <div id="supabase-save-status" style="margin-top:12px;font-size:12px;color:#1e293b;line-height:1.45;display:flex;align-items:center;gap:6px;">
        ${viewSolution ? 
          `<span style="color:#0284c7;font-weight:600;">✓ Bạn đang xem lời giải chi tiết của bài thi.</span>` :
          `<span class="spinner" style="display:inline-block;width:10px;height:10px;border:2px solid #0284c7;border-radius:50%;border-top-color:transparent;animation:spin 0.8s linear infinite;"></span>
           <span>Đang gửi kết quả lên máy chủ Supabase...</span>`
        }
      </div>
    `;

    // Định nghĩa animation quay nếu chưa có
    if (!document.getElementById("supabase-spin-style")) {
      const style = document.createElement("style");
      style.id = "supabase-spin-style";
      style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(style);
    }

    // Gửi điểm số lên Supabase nếu không ở chế độ xem giải
    if (!viewSolution) {
      saveResultToSupabase(correctCount, totalPoints, scoredPoints);
    }
  }

  async function saveResultToSupabase(correctCount, totalPoints, scoredPoints) {
    const statusEl = document.getElementById("supabase-save-status");
    if (!supabaseClient) {
      if (statusEl) {
        statusEl.style.color = "#475569";
        statusEl.innerHTML = "• Bản này chạy offline (không có Supabase CDN), chưa lưu điểm.";
      }
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from('exam_results')
        .insert([
          {
            user_email: studentInfo.code,
            student_name: studentInfo.name,
            exam_code: examCode,
            correct_count: correctCount,
            total_questions: examData.questions.length,
            score: Number(scoredPoints.toFixed(1))
          }
        ]);

      if (error) throw error;

      if (statusEl) {
        statusEl.style.color = "#166534";
        statusEl.innerHTML = "✓ Đã lưu kết quả thi lên hệ thống Supabase!";
      }
    } catch (err) {
      console.error("Lỗi khi lưu kết quả lên Supabase:", err);
      if (statusEl) {
        statusEl.style.color = "#991b1b";
        statusEl.innerHTML = "✗ Không thể lưu điểm lên Supabase (Vui lòng kiểm tra kết nối mạng).";
      }
    }
  }

  function setActiveQuestionInGroup(qNo) {
    const idx = examData.questions.findIndex(q => q.question_no === qNo);
    if (idx !== -1 && idx !== currentQuestionIndex) {
      currentQuestionIndex = idx;
      questionElapsedSeconds = 0;
      
      // Update active row class
      document.querySelectorAll(".split-question-row").forEach((row) => {
        const rowQNo = Number(row.dataset.qNo);
        row.classList.toggle("is-active-row", rowQNo === qNo);
      });
      
      // Update grid selection in sidebar/drawer
      updateGridSelection();
      
      // Enable/disable navigation buttons based on new currentQuestionIndex
      const prevBtn = $('[data-action="previous"]');
      const nextBtn = $('[data-action="next"]');
      if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
      if (nextBtn) {
        const labelSpan = nextBtn.querySelector(".button-label");
        if (labelSpan) labelSpan.textContent = currentQuestionIndex === examData.questions.length - 1 ? "Hoàn thành" : "Câu tiếp";
      }
      
      // Update timer display immediately
      setText("#question-time", formatTime(questionElapsedSeconds));
    }
  }

  function renderActiveQuestion() {
    if (!examData || !examData.questions.length) {
      showErrorMessage(`Phần ${SECTION_LABELS[subject] || subject} chưa có câu hỏi trong đề ${examCode}.`);
      return;
    }

    const question = examData.questions[currentQuestionIndex];

    // For Math, run original single-question rendering
    if (subject === "math") {
      setText("#question-number", question.question_no);
      const bookmarkBtn = $('[data-action="bookmark"]');
      if (bookmarkBtn) bookmarkBtn.classList.toggle("is-active", Boolean(flagged[question.question_no]));
      
      const savedAnswer = answers[question.question_no];
      renderQuestion(question, savedAnswer, (newVal) => {
        if (isSubmitted) return;
        if (hasAnswer(newVal)) answers[question.question_no] = newVal;
        else delete answers[question.question_no];
        saveLocalState();
        updateSidebarStats();
      });

      const prevBtn = $('[data-action="previous"]');
      const nextBtn = $('[data-action="next"]');
      if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
      if (nextBtn) {
        const labelSpan = nextBtn.querySelector(".button-label");
        if (labelSpan) labelSpan.textContent = currentQuestionIndex === examData.questions.length - 1 ? "Hoàn thành" : "Câu tiếp";
      }

      updateGridSelection();
      if (isSubmitted) showQuestionFeedback(question);

      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      }
      return;
    }

    // For Reading and Science: Grouped scrolling view
    // Hide the global question number circle and global bookmark column
    const globalQNum = $("#question-number");
    if (globalQNum) globalQNum.style.display = "none";
    const globalActionCol = $(".question-action-column");
    if (globalActionCol) globalActionCol.style.display = "none";

    const currentGroupId = question.group_id;
    const groupQuestions = examData.questions.filter(q => q.group_id === currentGroupId);

    // Render the passage/stimulus
    renderPassage(question);

    const questionTextContent = $("#question-text-content");
    if (questionTextContent) {
      if (renderedGroupId !== currentGroupId) {
        renderedGroupId = currentGroupId;
        questionTextContent.innerHTML = "";

        // Build list of questions for this group
        groupQuestions.forEach((q) => {
          const qRow = document.createElement("div");
          qRow.className = "split-question-row";
          qRow.dataset.qNo = q.question_no;
          if (q.question_no === question.question_no) {
            qRow.classList.add("is-active-row");
          }

          // Question header row
          const qHeader = document.createElement("div");
          qHeader.className = "split-q-header";

          // Question number circle/badge (on the left)
          const qNumBox = document.createElement("div");
          qNumBox.className = "split-q-num-box";
          qNumBox.textContent = q.question_no;

          // Question body
          const qBody = document.createElement("div");
          qBody.className = "question-body";
          qBody.id = `q-body-${q.question_no}`;

          // Bookmark action box (right)
          const qActionBox = document.createElement("div");
          qActionBox.className = "split-q-action-box";

          const qBookmarkBtn = document.createElement("button");
          qBookmarkBtn.type = "button";
          qBookmarkBtn.className = "bookmark-button";
          qBookmarkBtn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
              <path fill="currentColor" d="m19 18 2 1V3c0-1.1-.9-2-2-2H8.99C7.89 1 7 1.9 7 3h10c1.1 0 2 .9 2 2zM15 5H5c-1.1 0-2 .9-2 2v16l7-3 7 3V7c0-1.1-.9-2-2-2"></path>
            </svg>
          `;
          qBookmarkBtn.classList.toggle("is-active", Boolean(flagged[q.question_no]));
          qBookmarkBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent changing active row on flag click
            flagged[q.question_no] = !flagged[q.question_no];
            if (!flagged[q.question_no]) delete flagged[q.question_no];
            qBookmarkBtn.classList.toggle("is-active", Boolean(flagged[q.question_no]));
            saveLocalState();
            updateSidebarStats();
          });
          qActionBox.appendChild(qBookmarkBtn);

          qHeader.appendChild(qNumBox);
          qHeader.appendChild(qBody);
          qHeader.appendChild(qActionBox);

          // Answer form (bottom)
          const qAns = document.createElement("form");
          qAns.className = "answer-area";
          qAns.id = `q-ans-${q.question_no}`;

          qRow.appendChild(qHeader);
          qRow.appendChild(qAns);

          // Handle click to set active question
          qRow.addEventListener("click", () => {
            setActiveQuestionInGroup(q.question_no);
          });

          questionTextContent.appendChild(qRow);

          // Render options and contents
          const savedAnswer = answers[q.question_no];
          renderQuestionTo(q, savedAnswer, (newVal) => {
            if (isSubmitted) return;
            if (hasAnswer(newVal)) answers[q.question_no] = newVal;
            else delete answers[q.question_no];
            saveLocalState();
            updateSidebarStats();
          }, qBody, qAns, { typeset: false });

          if (isSubmitted) {
            showQuestionFeedback(q, qAns);
          }
        });

        // Trigger mathjax typesetting
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([questionTextContent]).catch(() => {});
        }
      } else {
        // Just update classes of rows
        document.querySelectorAll(".split-question-row").forEach((row) => {
          const qNo = Number(row.dataset.qNo);
          row.classList.toggle("is-active-row", qNo === question.question_no);
          
          // Sync bookmark buttons
          const bookmarkBtn = row.querySelector(".bookmark-button");
          if (bookmarkBtn) {
            bookmarkBtn.classList.toggle("is-active", Boolean(flagged[qNo]));
          }
        });
      }

      // Scroll active row into view
      const activeRow = questionTextContent.querySelector(`.split-question-row[data-q-no="${question.question_no}"]`);
      if (activeRow) {
        activeRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    // Navigation and Grid
    const prevBtn = $('[data-action="previous"]');
    const nextBtn = $('[data-action="next"]');
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) {
      const labelSpan = nextBtn.querySelector(".button-label");
      if (labelSpan) labelSpan.textContent = currentQuestionIndex === examData.questions.length - 1 ? "Hoàn thành" : "Câu tiếp";
    }

    updateGridSelection();
  }

  function startTimer() {
    setText("#countdown", formatTime(remainingSeconds));
    setText("#submit-countdown", formatTime(remainingSeconds));

    if (timerInterval) clearInterval(timerInterval);
    if (isSubmitted) return;

    timerInterval = setInterval(() => {
      remainingSeconds -= 1;
      questionElapsedSeconds += 1;

      setText("#countdown", formatTime(remainingSeconds));
      setText("#submit-countdown", formatTime(remainingSeconds));
      setText("#question-time", formatTime(questionElapsedSeconds));

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        autoSubmitExam();
      }
    }, 1000);
  }

  // Thoát phòng thi sau khi nộp bài.
  // Nếu đang chạy trong iframe (mở từ select.html), báo trang cha đóng lớp vỏ
  // phòng thi và thoát toàn màn hình — chứ KHÔNG tự điều hướng trong iframe (vì
  // làm vậy chỉ nạp lại select.html bên trong iframe, trang cha vẫn kẹt full màn).
  // Nếu mở trực tiếp file (không có trang cha), điều hướng về select.html.
  function leaveExamRoom() {
    clearFullscreenRequirement();
    const inIframe = window.parent && window.parent !== window;
    if (inIframe) {
      try {
        window.parent.postMessage({ type: "tsa-exam-finished" }, "*");
        return;
      } catch (error) {
        // Nếu vì lý do nào đó không gửi được message thì rơi xuống điều hướng.
      }
    }
    window.location.href = "select.html";
  }

  async function autoSubmitExam() {
    isSubmitted = true;
    saveLocalState();
    clearInterval(timerInterval);
    clearFullscreenRequirement();

    const isComposite = (examCode.startsWith("TSA_PRACTICE_FULL_") || examCode.startsWith("TSA_EXAM_")) && !isSingleSubject;

    if (isComposite) {
      let completed = {};
      try {
        completed = JSON.parse(localStorage.getItem("tsaCompletedSubjects") || "{}") || {};
      } catch (e) {
        completed = {};
      }
      completed[subject] = true;
      localStorage.setItem("tsaCompletedSubjects", JSON.stringify(completed));
      sessionStorage.setItem("tsaSubmittedSubject", "1");

      if (subject === "math" || subject === "reading") {
        await showCustomAlert(`Hết giờ làm bài phần ${SECTION_LABELS[subject]}! Hệ thống tự động nộp bài phần này.`);
        window.location.href = `waiting.html?exam=${examCode}`;
        return;
      } else if (subject === "science") {
        let totalCorrect = 0;
        let totalQuestionsCount = 0;
        let totalPoints = 0;
        let totalScoredPoints = 0;

        const mathAnswers = readLocalJson(`exam_answers_${examCode}_math`) || {};
        const readingAnswers = readLocalJson(`exam_answers_${examCode}_reading`) || {};
        const scienceAnswers = answers;

        let mathData = { questions: [] };
        let readingData = { questions: [] };
        let scienceData = { questions: [] };

        if (rawExamData) {
          mathData = normalizeExamForSubject(rawExamData, examMetaGlobal, "math");
          readingData = normalizeExamForSubject(rawExamData, examMetaGlobal, "reading");
          scienceData = normalizeExamForSubject(rawExamData, examMetaGlobal, "science");
        } else {
          scienceData = examData;
        }

        mathData.questions.forEach((q) => {
          const pts = Number(q.points == null ? 1 : q.points);
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, mathAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        readingData.questions.forEach((q) => {
          const pts = Number(q.points == null ? 1 : q.points);
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, readingAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        scienceData.questions.forEach((q) => {
          const pts = Number(q.points == null ? 1 : q.points);
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, scienceAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        await showCustomAlert(`Hết giờ làm bài phần Khoa học!\nTổng điểm cả kíp thi (Toán, Đọc hiểu, Khoa học):\n- Số câu đúng: ${totalCorrect}/${totalQuestionsCount}\n- Điểm số: ${totalScoredPoints.toFixed(1)}/${totalPoints.toFixed(1)}\n\nNhấn OK để quay về trang chủ.`);
        await saveResultToSupabase(totalCorrect, totalPoints, totalScoredPoints);
        try {
          localStorage.removeItem("tsaCompletedSubjects");
        } catch (e) {}
        leaveExamRoom();
        return;
      }
    } else {
      let correctCount = 0;
      let totalPoints = 0;
      let scoredPoints = 0;

      examData.questions.forEach((q) => {
        const pts = Number(q.points == null ? 1 : q.points);
        totalPoints += pts;
        if (typeof gradeQuestion === "function" && gradeQuestion(q, answers[q.question_no])) {
          correctCount++;
          scoredPoints += pts;
        }
      });

      await showCustomAlert(`Hết giờ làm bài! Bài thi đã tự động được nộp.\n- Số câu đúng: ${correctCount}/${examData.questions.length}\n- Điểm số: ${scoredPoints.toFixed(1)}/${totalPoints.toFixed(1)}\n\nNhấn OK để quay về trang chủ.`);
      saveResultToSupabase(correctCount, totalPoints, scoredPoints);
      leaveExamRoom();
    }
  }

  async function submitExam() {
    if (!examData) return;
    if (isSubmitted) {
      await showCustomAlert("Bạn đã nộp bài này rồi.");
      return;
    }

    const answeredCount = examData.questions.filter((q) => hasAnswer(answers[q.question_no])).length;
    if (!await showCustomConfirm(`Bạn đã làm ${answeredCount}/${examData.questions.length} câu. Bạn chắc chắn muốn nộp bài?`)) return;

    isSubmitted = true;
    saveLocalState();
    clearInterval(timerInterval);
    clearFullscreenRequirement();

    const isComposite = (examCode.startsWith("TSA_PRACTICE_FULL_") || examCode.startsWith("TSA_EXAM_")) && !isSingleSubject;

    if (isComposite) {
      let completed = {};
      try {
        completed = JSON.parse(localStorage.getItem("tsaCompletedSubjects") || "{}") || {};
      } catch (e) {
        completed = {};
      }
      completed[subject] = true;
      localStorage.setItem("tsaCompletedSubjects", JSON.stringify(completed));
      sessionStorage.setItem("tsaSubmittedSubject", "1");

      if (subject === "math" || subject === "reading") {
        window.location.href = `waiting.html?exam=${examCode}`;
        return;
      } else if (subject === "science") {
        let totalCorrect = 0;
        let totalQuestionsCount = 0;
        let totalPoints = 0;
        let totalScoredPoints = 0;

        const mathAnswers = readLocalJson(`exam_answers_${examCode}_math`) || {};
        const readingAnswers = readLocalJson(`exam_answers_${examCode}_reading`) || {};
        const scienceAnswers = answers;

        let mathData = { questions: [] };
        let readingData = { questions: [] };
        let scienceData = { questions: [] };

        if (rawExamData) {
          mathData = normalizeExamForSubject(rawExamData, examMetaGlobal, "math");
          readingData = normalizeExamForSubject(rawExamData, examMetaGlobal, "reading");
          scienceData = normalizeExamForSubject(rawExamData, examMetaGlobal, "science");
        } else {
          scienceData = examData;
        }

        mathData.questions.forEach((q) => {
          const pts = Number(q.points == null ? 1 : q.points);
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, mathAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        readingData.questions.forEach((q) => {
          const pts = Number(q.points == null ? 1 : q.points);
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, readingAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        scienceData.questions.forEach((q) => {
          const pts = Number(q.points == null ? 1 : q.points);
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, scienceAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        await showCustomAlert(`Nộp bài thành công!\nTổng điểm cả kíp thi (Toán, Đọc hiểu, Khoa học):\n- Số câu đúng: ${totalCorrect}/${totalQuestionsCount}\n- Điểm số: ${totalScoredPoints.toFixed(1)}/${totalPoints.toFixed(1)}\n\nNhấn OK để quay về trang chủ.`);
        await saveResultToSupabase(totalCorrect, totalPoints, totalScoredPoints);
        try {
          localStorage.removeItem("tsaCompletedSubjects");
        } catch (e) {}
        leaveExamRoom();
        return;
      }
    } else {
      let correctCount = 0;
      let totalPoints = 0;
      let scoredPoints = 0;

      examData.questions.forEach((q) => {
        const pts = Number(q.points == null ? 1 : q.points);
        totalPoints += pts;
        if (typeof gradeQuestion === "function" && gradeQuestion(q, answers[q.question_no])) {
          correctCount++;
          scoredPoints += pts;
        }
      });

      await showCustomAlert(`Nộp bài thành công!\n- Số câu đúng: ${correctCount}/${examData.questions.length}\n- Điểm số: ${scoredPoints.toFixed(1)}/${totalPoints.toFixed(1)}\n\nNhấn OK để quay về trang chủ.`);
      saveResultToSupabase(correctCount, totalPoints, scoredPoints);
      leaveExamRoom();
    }
  }

  async function loadExamData() {
    try {
      const loaded = await loadRawExam();
      rawExamData = loaded.rawExam;
      examMetaGlobal = loaded.examMeta;
      examData = normalizeExamForSubject(loaded.rawExam, loaded.examMeta);

      const previewQNo = urlParams.get("preview_qno");
      if (previewQNo) {
        const targetQNo = Number(previewQNo);
        const filteredQ = examData.questions.find(q => q.original_question_no === targetQNo || q.question_no === targetQNo);
        if (filteredQ) {
          const previewQ = Object.assign({}, filteredQ, { question_no: 1 });
          examData.questions = [previewQ];
        } else if (loaded.rawExam) {
          const section = Array.isArray(loaded.rawExam.sections)
            ? loaded.rawExam.sections.find(s => s.section_id === subject)
            : null;
          if (section) {
            let foundRaw = null;
            if (subject === "math") {
              foundRaw = (section.questions || []).find(q => q.question_no === targetQNo);
            } else {
              (section.groups || []).forEach(g => {
                const found = (g.questions || []).find(q => q.question_no === targetQNo);
                if (found) {
                  foundRaw = Object.assign({}, found, {
                    question_no: 1,
                    original_question_no: targetQNo,
                    group_id: g.group_id,
                    group_title: g.title,
                    passage: g.stimulus?.content || "",
                    passage_image_url: g.stimulus?.image_url || "",
                    stimulus: g.stimulus || null
                  });
                }
              });
            }
            if (foundRaw) {
              if (subject === "math") {
                foundRaw = Object.assign({}, foundRaw, { question_no: 1, original_question_no: targetQNo });
              }
              examData.questions = [foundRaw];
            }
          }
        }
      }

      remainingSeconds = Number(examData.duration_minutes || 45) * 60;

      loadLocalState();
      initMetadata();
      currentQuestionIndex = 0;
      const targetQParam = urlParams.get("q");
      if (targetQParam) {
        const tQNo = Number(targetQParam);
        const idx = examData.questions.findIndex(q => q.question_no === tQNo || q.original_question_no === tQNo);
        if (idx !== -1) {
          currentQuestionIndex = idx;
        }
      }

      if (isSubmitted) {
        clearFullscreenRequirement();
        const urlParams = new URLSearchParams(window.location.search);
        const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";
        const countdownText = viewSolution ? "Xem lời giải" : "Đã nộp bài";
        setText("#countdown", countdownText);
        setText("#submit-countdown", countdownText);
        showResultsPanel();
      } else {
        startTimer();
      }

      renderActiveQuestion();
      initSplitter();
    } catch (error) {
      console.error(error);
      showErrorMessage(`Không tải được đề ${examCode}. Hãy kiểm tra data/exams/index.json và data/exams/${examCode}.json, hoặc xuất đề từ teacher.html.`);
    }
  }

  function initSplitter() {
    const divider = $("#split-divider");
    const passagePane = $("#passage-pane");
    const container = $(".question-reading-split");
    if (!divider || !passagePane || !container) return;

    let isDragging = false;

    divider.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      divider.classList.add("is-dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = container.getBoundingClientRect();
      let pct = ((e.clientX - rect.left) / rect.width) * 100;
      pct = Math.max(15, Math.min(85, pct));
      passagePane.style.flex = `0 0 ${pct}%`;
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      divider.classList.remove("is-dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    });
  }

  function openSubmitDrawer() {
    const overlay = $("#submit-menu-overlay");
    const drawer = $("#submit-menu-drawer");
    if (overlay) overlay.classList.add("is-active");
    if (drawer) drawer.classList.add("is-active");
    updateSidebarStats();
  }

  function closeSubmitDrawer() {
    const overlay = $("#submit-menu-overlay");
    const drawer = $("#submit-menu-drawer");
    if (overlay) overlay.classList.remove("is-active");
    if (drawer) drawer.classList.remove("is-active");
  }

  function bindDrawerControls() {
    const openBtn = $("#open-submit-menu-btn");
    const closeBtn = $("#close-submit-menu-btn");
    const overlay = $("#submit-menu-overlay");
    const finalSubmit = $("#final-submit-btn");

    if (openBtn) openBtn.addEventListener("click", openSubmitDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeSubmitDrawer);
    if (overlay) overlay.addEventListener("click", closeSubmitDrawer);
    if (finalSubmit) finalSubmit.addEventListener("click", submitExam);
  }

  let hasBeenFullscreen = false;

  // Fullscreen enforcement logic
  //
  // LƯU Ý: KHÔNG hiển thị lớp phủ chặn toàn bộ giao diện bên trong iframe.
  // Lớp phủ #fullscreen-enforce-overlay trước đây che kín màn hình khi học sinh
  // thoát toàn màn hình, khiến mọi nút (Câu tiếp, Nộp bài, chọn đáp án...) bấm
  // không được. Việc nhắc quay lại toàn màn hình đã do trang cha (select.html)
  // đảm nhiệm bằng một thanh nhắc không che khuất, nên ở đây chỉ theo dõi trạng
  // thái và luôn ẩn lớp phủ cũ nếu nó còn tồn tại.
  function enforceFullscreen() {
    const isFS = isInFullscreen();

    if (isFS) {
      hasBeenFullscreen = true;
      writeSessionFlag(fullscreenStartedKey, true);
    }

    const overlay = document.getElementById("fullscreen-enforce-overlay");
    if (overlay) overlay.style.display = "none";
  }

  // Theo dõi trạng thái toàn màn hình.
  //
  // LƯU Ý: KHÔNG chặn (preventDefault/stopImmediatePropagation) các cú click của
  // học sinh. Trước đây hàm này gắn listener ở capture phase để "nuốt" cú click
  // đầu tiên nhằm xin toàn màn hình ngầm; nhưng khi đề chạy trong iframe (trang
  // cha select.html đã lo toàn màn hình), lệnh xin luôn thất bại và listener
  // không bao giờ được gỡ -> MỌI nút và đáp án bấm đều không ăn.
  // Việc bật/nhắc toàn màn hình đã do trang cha đảm nhiệm hoàn toàn.
  function initAutoFullscreen() {
    if (!shouldEnforceFullscreen()) return;
    if (isInFullscreen()) {
      hasBeenFullscreen = true;
      writeSessionFlag(fullscreenStartedKey, true);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindDrawerControls();
    loadExamData();

    initAutoFullscreen();
    enforceFullscreen();
    document.addEventListener("fullscreenchange", enforceFullscreen);
    document.addEventListener("webkitfullscreenchange", enforceFullscreen);
    document.addEventListener("mozfullscreenchange", enforceFullscreen);
    document.addEventListener("MSFullscreenChange", enforceFullscreen);

    const prevBtn = $('[data-action="previous"]');
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          questionElapsedSeconds = 0;
          renderActiveQuestion();
        }
      });
    }

    const nextBtn = $('[data-action="next"]');
    const urlParams = new URLSearchParams(window.location.search);
    const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (!examData) return;
        if (currentQuestionIndex < examData.questions.length - 1) {
          currentQuestionIndex++;
          questionElapsedSeconds = 0;
          renderActiveQuestion();
        } else {
          if (viewSolution) {
            leaveExamRoom();
          } else {
            submitExam();
          }
        }
      });
    }

    const bookmarkBtn = $('[data-action="bookmark"]');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", () => {
        if (!examData || !examData.questions.length) return;
        const qNo = examData.questions[currentQuestionIndex].question_no;
        if (flagged[qNo]) delete flagged[qNo];
        else flagged[qNo] = true;
        saveLocalState();
        updateSidebarStats();
        renderActiveQuestion();
      });
    }

    const submitBtn = $('[data-action="submit"]');
    if (submitBtn) {
      if (viewSolution) {
        submitBtn.textContent = "Thoát";
        submitBtn.style.background = "#64748b";
        submitBtn.style.borderColor = "#64748b";
        submitBtn.addEventListener("click", leaveExamRoom);
      } else {
        submitBtn.addEventListener("click", submitExam);
      }
    }
  });
})();
