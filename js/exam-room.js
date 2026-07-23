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

  // Global auto-fallback for broken relative images (redirect to CDN)
  window.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'IMG') {
      var img = e.target;
      if (img.dataset.failedOnce) return;
      img.dataset.failedOnce = 'true';
      var src = img.getAttribute('src') || '';
      if (src && src.indexOf('http://') !== 0 && src.indexOf('https://') !== 0 && src.indexOf('data:') !== 0) {
        if (src.indexOf('assets/') === 0) {
          img.src = 'https://assets.tmastudy.io.vn/' + src;
        } else {
          img.src = 'https://assets.tmastudy.io.vn/assets/' + src;
        }
      }
    }
  }, true);

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

  let mockExamSession = null;
  try {
    mockExamSession = JSON.parse(sessionStorage.getItem("tmaMockExamSession") || "null");
  } catch (e) {
    mockExamSession = null;
  }
  const hasMockSession = !!(
    mockExamSession &&
    mockExamSession.token &&
    mockExamSession.exam &&
    String(mockExamSession.exam.examCode || "").toUpperCase() === examCode.toUpperCase()
  );

  const studentInfo = {
    name: "Nguyễn Văn Hải",
    code: "TMA507905"
  };

  try {
    const cachedStudent = JSON.parse(localStorage.getItem("studentInfo"));
    if (cachedStudent) {
      studentInfo.name = cachedStudent.name || cachedStudent.username || cachedStudent.email || studentInfo.name;
      studentInfo.code = cachedStudent.code || cachedStudent.phone || studentInfo.code;
      studentInfo.email = cachedStudent.email || studentInfo.email;
      studentInfo.token = cachedStudent.token || studentInfo.token;
    }
  } catch (e) {
    console.warn("Lỗi đọc studentInfo từ localStorage:", e);
  }

  if (hasMockSession && mockExamSession.candidate) {
    studentInfo.name = mockExamSession.candidate.name || "Thí sinh";
    studentInfo.code = mockExamSession.candidate.code || "";
    studentInfo.phone = mockExamSession.candidate.code || "";
    studentInfo.email = "";
    studentInfo.token = "";
  }

  const isPreviewMode = urlParams.get("preview") === "true";
  let teacherPreviewInfo = null;
  try {
    teacherPreviewInfo = JSON.parse(localStorage.getItem("teacherInfo") || "null");
  } catch (e) {
    teacherPreviewInfo = null;
  }

  const hasStudentSession = !!(studentInfo.email && studentInfo.token);
  const hasTeacherPreviewSession = !!(isPreviewMode && teacherPreviewInfo && teacherPreviewInfo.role === "teacher" && teacherPreviewInfo.token);

  if (!hasStudentSession && !hasTeacherPreviewSession && !hasMockSession) {
    window.location.replace("login.html?redirect=exam.html");
    return;
  }

  if (!hasStudentSession && hasTeacherPreviewSession) {
    studentInfo.name = teacherPreviewInfo.name || "Teacher preview";
    studentInfo.code = "PREVIEW";
    studentInfo.email = teacherPreviewInfo.email || "";
    studentInfo.token = "";
  }

  // Khởi tạo Supabase Client từ cấu hình dùng chung
  let supabaseClient = null;
  let supabaseUrl = '';
  const examStorageUrl = window.TMA_STORAGE_CONFIG.examsBaseUrl;
  let studentEmail = studentInfo ? studentInfo.email : '';
  let studentToken = studentInfo ? studentInfo.token : '';
  if (!hasMockSession && typeof supabase !== 'undefined' && supabase.createClient && window.SUPABASE_CONFIG) {
    supabaseUrl = window.SUPABASE_CONFIG.url;
    supabaseClient = supabase.createClient(supabaseUrl, window.SUPABASE_CONFIG.anonKey, {
      global: {
        headers: {
          'x-student-email': studentEmail || '',
          'x-student-password-hash': studentToken || ''
        }
      }
    });
  } else if (!hasMockSession) {
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
  let isSubmitting = false;
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

  function preprocessMathContent(text) {
    if (!text) return "";
    var str = String(text);

    // Parse short image tag: [IMG: filename] or [IMG: filename | width]
    str = str.replace(/\[IMG:\s*([^\]\|]+)(?:\|\s*([^\]]+))?\]/gi, function(match, file, width) {
      file = file.trim();
      width = (width || "48%").trim();
      
      // If no file extension, default to .png
      var filename = file;
      if (!filename.includes(".") && !filename.startsWith("data:")) {
        filename += ".png";
      }

      var src = filename;
      if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:") && !src.startsWith("assets/")) {
        var folder = (function() {
          var code = new URLSearchParams(window.location.search).get("exam") || 
                     window.currentExamCode || 
                     window.examCode || 
                     "TSA_PRACTICE_FULL_01";
          return String(code).trim().toUpperCase().replace(/_TEACHER_DRAFT/g, "");
        })();
        src = "assets/" + folder + "/" + filename;
      }

      return '<img class="tsa-auto-img" style="width: ' + width + '; max-width: 100%; height: auto; display: block; margin: 15px auto; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" src="' + src + '">';
    });

    // Parse Markdown bold **text** or ++text++ -> <strong>text</strong>
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    str = str.replace(/\+\+(.*?)\+\+/g, '<strong>$1</strong>');
    // Replace standalone bullet points
    str = str.replace(/(^|\n)[\s]*[\*\-]\s+(.*?)(?=\n|$)/g, '$1&bull; $2');

    return str
      .replace(/\\\(/g, '\\(\\displaystyle ')
      .replace(/\$([^$]+)\$/g, '$\\displaystyle $1$')
      .replace(/\\frac(?![a-zA-Z])/g, '\\dfrac')
      .replace(/\\int(?!\\limits)(?![a-zA-Z])/g, '\\int\\limits')
      .replace(/\\sum(?!\\limits)(?![a-zA-Z])/g, '\\sum\\limits')
      .replace(/\\prod(?!\\limits)(?![a-zA-Z])/g, '\\prod\\limits')
      .replace(/\\lim(?!\\limits)(?![a-zA-Z])/g, '\\lim\\limits');
  }

  function sanitizeHtml(value) {
    const html = preprocessMathContent(String(value == null ? "" : value));
    if (typeof DOMPurify !== "undefined" && DOMPurify.sanitize) {
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true, svg: true, mathMl: true },
        ADD_TAGS: ["style"],
        ADD_ATTR: ["stroke-dasharray", "marker-end", "orient", "refX", "refY", "markerWidth", "markerHeight"]
      });
    }
    return esc(html);
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

  function updateSubmitButtonState() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";

    const submitBtn = $('[data-action="submit"]');
    if (submitBtn) {
      if (viewSolution || isSubmitted) {
        submitBtn.textContent = "Thoát";
        submitBtn.style.background = "#dc2626";
        submitBtn.style.borderColor = "#dc2626";
        submitBtn.style.color = "#ffffff";
        // Remove existing submit exam listener and bind exit instead
        submitBtn.replaceWith(submitBtn.cloneNode(true));
        const newSubmitBtn = $('[data-action="submit"]');
        newSubmitBtn.addEventListener("click", leaveExamRoom);
      }
    }

    const openBtn = $("#open-submit-menu-btn");
    if (openBtn) {
      if (viewSolution || isSubmitted) {
        openBtn.innerHTML = "<span>Thoát</span>";
        openBtn.style.background = "#dc2626";
        openBtn.style.borderColor = "#dc2626";
        openBtn.style.color = "#ffffff";
        // Remove existing open drawer listener and bind exit instead
        openBtn.replaceWith(openBtn.cloneNode(true));
        const newOpenBtn = $("#open-submit-menu-btn");
        newOpenBtn.addEventListener("click", leaveExamRoom);
      }
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
    updateSubmitButtonState();
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
      duration_minutes: (function() {
        if (rawExam.subject === "math") return 60;
        if (rawExam.subject === "reading") return 30;
        if (rawExam.subject === "science") return 60;
        return rawExam.duration_minutes || 45;
      })(),
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
      duration_minutes: (function() {
        if (subj === "math") return 60;
        if (subj === "reading") return 30;
        if (subj === "science") return 60;
        return rawExam.duration_minutes || (examMeta && examMeta.duration_minutes) || 45;
      })(),
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
          passage: group.stimulus?.content || group.passage || "",
          passage_image_url: group.stimulus?.image_url || group.passage_image_url || "",
          passage_image_width: group.stimulus?.image_width || group.image_width || 100,
          stimulus: group.stimulus || null
        });
      });
    });

    return normalized;
  }

  async function fetchJson(path) {
    const cacheKey = `tmaTsaJsonCache_${path}`;
    const cacheTimeKey = `tmaTsaJsonCacheTime_${path}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = Date.now();

    // R2 is the canonical source. Browser cache prevents repeat downloads.
    const isIndexFile = typeof path === 'string' && path.endsWith('index.json');
    const cacheTtl = isIndexFile ? 30000 : 30 * 60 * 1000;
    if (cachedData && cachedTime && (now - parseInt(cachedTime)) < cacheTtl) {
      try {
        console.log(`Loading cached JSON for ${path}`);
        return JSON.parse(cachedData);
      } catch (e) {
        console.warn("Failed to parse cached JSON:", e);
      }
    }

    const response = await fetch(path, { cache: 'default' });
    if (!response.ok) throw new Error(`Không tải được ${path}`);
    const data = await response.json();

    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTimeKey, now.toString());
      
      // Clean up old caches
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("tmaTsaJsonCacheTime_")) {
          const t = localStorage.getItem(key);
          if (t && (now - parseInt(t) > 86400000)) { // clean caches older than 1 day
            const origKey = key.replace("tmaTsaJsonCacheTime_", "tmaTsaJsonCache_");
            localStorage.removeItem(key);
            localStorage.removeItem(origKey);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to save JSON to localStorage cache:", e);
    }

    return data;
  }

  async function loadRawExam() {
    if (urlParams.get("preview") === "true") {
      const draft = readLocalJson(`tma_tsa_teacher_draft_${examCode}`) || readLocalJson(`tma_tsa_exam_${examCode}`);
      if (draft) return { rawExam: draft, examMeta: null };
    }

    let examsList = readLocalJson("tma_tsa_exam_index");

    // Read the published index from Cloudflare R2 only.
    try {
      const fetchedIndex = await fetchJson(`${examStorageUrl}index.json`);
      if (Array.isArray(fetchedIndex) && fetchedIndex.length > 0) {
        examsList = fetchedIndex;
        writeLocalJson("tma_tsa_exam_index", fetchedIndex);
      }
    } catch (error) {
      console.warn("Không tải được index.json từ R2, dùng bản cache gần nhất.");
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
      ? examsList.find((item) => item.exam_code === targetFetchCode && item.subject === subject) ||
        examsList.find((item) => item.exam_code === targetFetchCode) ||
        examsList.find((item) => item.exam_code === examCode && item.subject === subject) ||
        examsList.find((item) => item.exam_code === examCode) ||
        examsList.find((item) => item.exam_code === "TSA001")
      : null;

    let rawExam = null;

    // Prefer the canonical combined exam so a normal load needs one R2 request.
    try {
      rawExam = await fetchJson(`${examStorageUrl}${encodeURIComponent(targetFetchCode)}.json`);
    } catch (e) {}

    // Some entries point to a split subject file. Preserve its nested R2 path.
    if (!rawExam && examMeta && examMeta.file) {
      const relativePath = String(examMeta.file).replace(/^\/?data\/exams\//i, "");
      const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
      try {
        rawExam = await fetchJson(`${examStorageUrl}${encodedPath}`);
      } catch (e) {
        console.warn("Không tải được đề thi từ R2, thử bản cache cục bộ...");
      }
    }

    // Fallback tải cục bộ hoặc localStorage
    if (!rawExam) {
      const cleanCodes = [targetFetchCode, examCode, "TSA001"].map(c => String(c || "").trim().toLowerCase()).filter(Boolean);
      for (const cCode of cleanCodes) {
        try {
          const folderPath = `${examStorageUrl}${cCode}.json/`;
          const [mathData, readingData, scienceData] = await Promise.all([
            fetchJson(folderPath + "math.json"),
            fetchJson(folderPath + "reading.json"),
            fetchJson(folderPath + "science.json")
          ]);
          if (mathData && readingData && scienceData) {
            rawExam = {
              exam_code: targetFetchCode,
              title: mathData.title || targetFetchCode,
              duration_minutes: mathData.duration_minutes || 150,
              status: mathData.status || "published",
              sections: [
                (mathData.sections && mathData.sections[0]) ? mathData.sections[0] : mathData,
                (readingData.sections && readingData.sections[0]) ? readingData.sections[0] : readingData,
                (scienceData.sections && scienceData.sections[0]) ? scienceData.sections[0] : scienceData
              ]
            };
            console.log("Loaded split exam sections from directory:", folderPath);
            break;
          }
        } catch (e) {}
      }
    }

    if (!rawExam && targetFetchCode !== examCode) {
      try {
        rawExam = await fetchJson(`${examStorageUrl}${encodeURIComponent(examCode)}.json`);
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
      const mathSidebar = document.querySelector(".exam-sidebar");
      const mathOverlay = document.getElementById("exam-math-drawer-overlay");
      if (mathSidebar) mathSidebar.classList.remove("open");
      if (mathOverlay) mathOverlay.classList.remove("active");
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

    // Helper to fix image URLs in HTML strings
    function fixImageUrlsInHtml(html) {
      if (!html) return html;
      var isLocalFile = (window.location.protocol === "file:");
      return html.replace(/<img\s+([^>]*\s+)?src=(["'])([^"'\s]+)\2/gi, function(match, prefix, quote, src) {
        var newSrc = src;
        if (src.indexOf("http://") !== 0 && src.indexOf("https://") !== 0 && src.indexOf("data:") !== 0) {
          if (isLocalFile) {
            if (src.indexOf("assets/") === 0) {
              newSrc = src;
            } else {
              newSrc = "assets/" + src;
            }
          } else {
            if (src.indexOf("assets/") === 0) {
              newSrc = "https://assets.tmastudy.io.vn/" + src;
            } else {
              newSrc = "https://assets.tmastudy.io.vn/assets/" + src;
            }
          }
        } else if (isLocalFile && src.indexOf("https://assets.tmastudy.io.vn/") === 0) {
          newSrc = src.replace("https://assets.tmastudy.io.vn/", "");
        }
        return '<img ' + (prefix || '') + 'src=' + quote + newSrc + quote;
      });
    }

    const mobileTabs = $(".mobile-exam-tabs");
    const splitContainer = $(".question-reading-split");

    const hasPassage = Boolean(question.passage || question.passage_image_url || question.group_title);
    if (!hasPassage) {
      passagePane.innerHTML = "";
      passagePane.style.display = "none";
      if (divider) divider.style.display = "none";
      if (mobileTabs) mobileTabs.style.display = "none";
      if (splitContainer) {
        splitContainer.classList.remove('show-questions');
        splitContainer.classList.remove('show-passage');
      }
      return;
    }

    passagePane.style.display = "block";
    if (divider) divider.style.display = "flex";
    if (mobileTabs) mobileTabs.style.display = "flex";

    // Always reset mobile view to show the passage tab on question load
    if (splitContainer) {
      splitContainer.classList.remove('show-questions');
      splitContainer.classList.add('show-passage');
      
      const tabs = splitContainer.querySelectorAll('.mobile-exam-tab');
      tabs.forEach(t => {
        if (t.dataset.target === 'passage') t.classList.add('active');
        else t.classList.remove('active');
      });
    }

    // Tìm dải câu hỏi tự động thuộc cùng nhóm group_id
    let rangeText = "";
    if (question.group_id && examData && Array.isArray(examData.questions)) {
      const groupQs = examData.questions.filter(q => q.group_id === question.group_id);
      if (groupQs.length > 0) {
        const startNo = groupQs[0].question_no;
        const endNo = groupQs[groupQs.length - 1].question_no;
        rangeText = `Dựa vào thông tin dưới đây và trả lời các câu hỏi sau từ câu ${startNo} - ${endNo}:`;
      }
    }

    var fixedImgUrl = question.passage_image_url || "";
    if (fixedImgUrl && window.location.protocol === "file:" && fixedImgUrl.indexOf("https://assets.tmastudy.io.vn/") === 0) {
      fixedImgUrl = fixedImgUrl.replace("https://assets.tmastudy.io.vn/", "");
    }

    const group = {
      title: question.group_title || "Ngữ liệu",
      rangeText: rangeText,
      stimulus: {
        type: "text",
        content: fixImageUrlsInHtml(question.passage || ""),
        image_url: fixedImgUrl,
        image_width: question.passage_image_width || 100
      }
    };

    if (typeof renderStimulusGroup === "function") {
      renderStimulusGroup(group, { target: passagePane, typeset: false });
    } else {
      passagePane.innerHTML = `<h3>${sanitizeHtml(group.title)}</h3><div>${sanitizeHtml(group.stimulus.content)}</div>`;
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
      } else if (qType === "fill_blank" && typeof question.correct_answer === "object" && question.correct_answer !== null) {
        correctText = Object.keys(question.correct_answer).map(k => `${k}: ${question.correct_answer[k]}`).join("; ");
      } else if (qType === "fill_blank" && typeof question.correct_answer === "string" && question.correct_answer.includes("=")) {
        correctText = question.correct_answer.split("|").map(s => s.trim()).join("; ");
      } else {
        correctText = question.correct_answer;
      }

      feedbackDiv.style.background = "#fef2f2";
      feedbackDiv.style.border = "1px solid #fca5a5";
      feedbackDiv.style.color = "#991b1b";
      feedbackDiv.innerHTML = `<div style="font-weight:700;font-size:14px;">Chưa chính xác</div><div style="margin-top:6px;"><strong>Đáp án đúng:</strong> ${esc(correctText)}</div>`;
    }

    // Single solution box is rendered by question-renderers.js
    container.querySelectorAll("input, select").forEach((el) => { el.disabled = true; });
  }

  function showResultsPanel() {
    if (!examData) return;
    if (hasMockSession) return;

    let correctCount = 0;
    let totalPoints = 0;
    let scoredPoints = 0;

    examData.questions.forEach((q) => {
      const pts = 1;
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

    banner.style.display = "none";

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

  async function submitExamToServer(subjectAnswers) {
    const statusEl = document.getElementById("supabase-save-status");
    if (!supabaseClient) {
      return { success: false, message: "Chạy offline, không chấm điểm trên server." };
    }
    try {
      if (statusEl) {
        statusEl.style.color = "#475569";
        statusEl.innerHTML = "• Đang chấm điểm và lưu kết quả...";
      }
      const { data, error } = await supabaseClient.rpc('submit_exam_attempt', {
        p_email: studentInfo.email || studentInfo.code,
        p_exam_code: examCode,
        p_subject: subject,
        p_answers: subjectAnswers
      });
      if (error) throw error;
      if (data && data.success) {
        if (statusEl) {
          statusEl.style.color = "#166534";
          statusEl.innerHTML = "✓ Kết quả thi đã được chấm và lưu thành công trên Server!";
        }
        return data;
      } else {
        throw new Error(data?.message || "Lỗi chấm điểm từ server.");
      }
    } catch (err) {
      console.error("Lỗi khi chấm điểm trên server:", err);
      if (statusEl) {
        statusEl.style.color = "#991b1b";
        statusEl.innerHTML = "✗ Lỗi chấm điểm trên Server. Vui lòng liên hệ Giáo viên.";
      }
      return { success: false, message: err.message || err };
    }
  }

  async function submitExamToServerForSubject(targetSubject, targetAnswers) {
    if (!supabaseClient) return { success: false };
    try {
      const { data, error } = await supabaseClient.rpc('submit_exam_attempt', {
        p_email: studentInfo.email || studentInfo.code,
        p_exam_code: examCode,
        p_subject: targetSubject,
        p_answers: targetAnswers
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Lỗi chấm điểm môn ${targetSubject}:`, err);
      return { success: false, message: err.message || err };
    }
  }

  async function submitMockAttempt(sectionAnswers) {
    if (!hasMockSession || !window.TMAMockExam) {
      throw new Error("Phiên thi thử không hợp lệ.");
    }
    const result = await window.TMAMockExam.submit(mockExamSession.token, sectionAnswers || {});
    if (!result || result.success !== true) {
      throw new Error((result && result.message) || "Không thể ghi nhận bài thi.");
    }
    return result;
  }

  function showMockSubmissionError(error) {
    const statusEl = document.getElementById("supabase-save-status");
    if (statusEl) {
      statusEl.style.color = "#b91c1c";
      statusEl.textContent = "Chưa thể gửi bài. Vui lòng kiểm tra kết nối và bấm nộp lại.";
    }
    console.error("Không thể gửi bài thi thử:", error);
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

    // Nếu có kết nối Supabase, điểm số đã được tự động tính và lưu an toàn ở Server qua RPC submit_exam_attempt.
    // Không thực hiện lệnh insert trực tiếp từ Client để tránh xung đột RLS.
    if (statusEl) {
      statusEl.style.color = "#166534";
      statusEl.innerHTML = "✓ Điểm số đã được Server chấm và lưu trữ an toàn!";
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
      
      updateNavigationButtons();
      
      // Update timer display immediately
      setText("#question-time", formatTime(questionElapsedSeconds));
    }
  }

  function getGroupNavigationInfo() {
    if (subject === "math" || !examData || !examData.questions.length) {
      return null;
    }
    const uniqueGroups = [];
    examData.questions.forEach(q => {
      if (q.group_id && uniqueGroups.indexOf(q.group_id) === -1) {
        uniqueGroups.push(q.group_id);
      }
    });
    if (uniqueGroups.length <= 1) return null;
    
    const curQ = examData.questions[currentQuestionIndex];
    const curGroupId = curQ ? curQ.group_id : null;
    const groupIdx = curGroupId ? uniqueGroups.indexOf(curGroupId) : -1;
    
    return {
      groups: uniqueGroups,
      currentIndex: groupIdx,
      isFirst: groupIdx <= 0,
      isLast: groupIdx === uniqueGroups.length - 1
    };
  }

  function updateNavigationButtons() {
    const prevBtn = $('[data-action="previous"]');
    const nextBtn = $('[data-action="next"]');
    
    const navInfo = getGroupNavigationInfo();
    if (navInfo) {
      if (prevBtn) prevBtn.disabled = navInfo.isFirst;
      if (nextBtn) {
        const labelSpan = nextBtn.querySelector(".button-label");
        if (labelSpan) {
          labelSpan.textContent = navInfo.isLast ? "Hoàn thành" : "Câu tiếp";
        }
      }
    } else {
      if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
      if (nextBtn) {
        const labelSpan = nextBtn.querySelector(".button-label");
        if (labelSpan) {
          labelSpan.textContent = currentQuestionIndex === examData.questions.length - 1 ? "Hoàn thành" : "Câu tiếp";
        }
      }
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
      
      const isViewSolutionMode = isSubmitted || urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution" || isPreviewMode;
      const savedAnswer = answers[question.question_no];
      renderQuestion(question, savedAnswer, (newVal) => {
        if (isSubmitted) return;
        if (hasAnswer(newVal)) answers[question.question_no] = newVal;
        else delete answers[question.question_no];
        saveLocalState();
        updateSidebarStats();
      }, { showSolution: isViewSolutionMode });

      updateNavigationButtons();
      updateGridSelection();
      if (isSubmitted || isPreviewMode || urlParams.get("view_solution") === "true") showQuestionFeedback(question);

      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      }
      if (typeof window.makeElementsEditable === "function") {
        window.makeElementsEditable();
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
          const isViewSolutionMode = isSubmitted || urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution" || isPreviewMode;
          const savedAnswer = answers[q.question_no];
          renderQuestionTo(q, savedAnswer, (newVal) => {
            if (isSubmitted) return;
            if (hasAnswer(newVal)) answers[q.question_no] = newVal;
            else delete answers[q.question_no];
            saveLocalState();
            updateSidebarStats();
          }, qBody, qAns, { typeset: false, showSolution: isViewSolutionMode });

          if (isSubmitted || isPreviewMode || urlParams.get("view_solution") === "true") {
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
    updateNavigationButtons();
    updateGridSelection();
    if (typeof window.makeElementsEditable === "function") {
      window.makeElementsEditable();
    }
  }

  function startTimer() {
    if (isPreviewMode) return;
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
  function leaveExamRoomWithLoading() {
    clearFullscreenRequirement();
    if (hasMockSession) {
      try {
        sessionStorage.setItem("tmaResultAutoLookup", JSON.stringify({
          phone: mockExamSession.candidate ? mockExamSession.candidate.code : "",
          examCode: mockExamSession.exam ? mockExamSession.exam.examCode : examCode
        }));
      } catch (error) {}
    }
    const inIframe = window.parent && window.parent !== window;
    if (inIframe) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";
        window.parent.postMessage({ 
          type: "tsa-exam-submitted-loading",
          examCode: examCode,
          examTitle: examData ? examData.title : "",
          isSolutionMode: viewSolution
        }, "*");
        return;
      } catch (error) {
        // Fallback
      }
    }
    if (hasMockSession) {
      window.location.replace("result.html");
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const fromPortal = urlParams.get("from_portal") === "true";
    window.location.href = fromPortal ? "exam.html" : "select.html";
  }

  function leaveExamRoom() {
    clearFullscreenRequirement();
    const inIframe = window.parent && window.parent !== window;
    if (inIframe) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";
        window.parent.postMessage({ 
          type: "tsa-exam-finished",
          examCode: examCode,
          examTitle: examData ? examData.title : "",
          isSolutionMode: viewSolution
        }, "*");
        return;
      } catch (error) {
        // Nếu vì lý do nào đó không gửi được message thì rơi xuống điều hướng.
      }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const fromPortal = urlParams.get("from_portal") === "true";
    window.location.href = fromPortal ? "exam.html" : "select.html";
  }

  async function autoSubmitExam() {
    isSubmitted = true;
    saveLocalState();
    clearInterval(timerInterval);
    clearFullscreenRequirement();

    const isPreview = urlParams.get("preview") === "true";
    const isComposite = (examCode.startsWith("TSA_PRACTICE_FULL_") || examCode.startsWith("TSA_EXAM_")) && !isSingleSubject;

    if (isComposite && !isPreview) {
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
          const pts = 1;
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, mathAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        readingData.questions.forEach((q) => {
          const pts = 1;
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, readingAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        scienceData.questions.forEach((q) => {
          const pts = 1;
          totalPoints += pts;
          totalQuestionsCount++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, scienceAnswers[q.question_no])) {
            totalCorrect++;
            totalScoredPoints += pts;
          }
        });

        if (hasMockSession) {
          try {
            await submitMockAttempt({ math: mathAnswers, reading: readingAnswers, science: scienceAnswers });
            localStorage.removeItem("tsaCompletedSubjects");
            leaveExamRoomWithLoading();
          } catch (error) {
            isSubmitted = false;
            saveLocalState();
            showMockSubmissionError(error);
          }
          return;
        }

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
        const pts = 1;
        totalPoints += pts;
        if (typeof gradeQuestion === "function" && gradeQuestion(q, answers[q.question_no])) {
          correctCount++;
          scoredPoints += pts;
        }
      });

      if (hasMockSession) {
        try {
          await submitMockAttempt({ [subject]: answers });
          leaveExamRoomWithLoading();
        } catch (error) {
          isSubmitted = false;
          saveLocalState();
          showMockSubmissionError(error);
        }
        return;
      }

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
    if (isSubmitting) {
      return;
    }

    const answeredCount = examData.questions.filter((q) => hasAnswer(answers[q.question_no])).length;
    if (!await showCustomConfirm(`Bạn đã làm ${answeredCount}/${examData.questions.length} câu. Bạn chắc chắn muốn nộp bài?`)) return;

    isSubmitting = true;
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
        const urlParams = new URLSearchParams(window.location.search);
        const fromPortal = urlParams.get("from_portal") === "true";
        window.location.href = `waiting.html?exam=${examCode}${fromPortal ? '&from_portal=true' : ''}`;
        return;
      } else if (subject === "science") {
        // Hiển thị hiệu ứng loading trên trang cha ngay lập tức khi hoàn thành kíp thi (nộp Science) để ẩn độ trễ kết nối Supabase
        const inIframe = window.parent && window.parent !== window;
        if (inIframe) {
          try {
            window.parent.postMessage({ type: "tsa-exam-submitting" }, "*");
          } catch (error) {
            console.warn("Lỗi gửi postMessage:", error);
          }
        }

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

        let mathCorrect = 0, mathTotal = 0, mathPoints = 0, mathScore = 0;
        let readingCorrect = 0, readingTotal = 0, readingPoints = 0, readingScore = 0;
        let scienceCorrect = 0, scienceTotal = 0, sciencePoints = 0, scienceScore = 0;

        mathData.questions.forEach((q) => {
          const pts = 1;
          mathPoints += pts;
          mathTotal++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, mathAnswers[q.question_no])) {
            mathCorrect++;
            mathScore += pts;
          }
        });

        readingData.questions.forEach((q) => {
          const pts = 1;
          readingPoints += pts;
          readingTotal++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, readingAnswers[q.question_no])) {
            readingCorrect++;
            readingScore += pts;
          }
        });

        scienceData.questions.forEach((q) => {
          const pts = 1;
          sciencePoints += pts;
          scienceTotal++;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, scienceAnswers[q.question_no])) {
            scienceCorrect++;
            scienceScore += pts;
          }
        });

        totalCorrect = mathCorrect + readingCorrect + scienceCorrect;
        totalQuestionsCount = mathTotal + readingTotal + scienceTotal;
        totalPoints = mathPoints + readingPoints + sciencePoints;
        totalScoredPoints = mathScore + readingScore + scienceScore;

        if (hasMockSession && urlParams.get("preview") !== "true") {
          try {
            await submitMockAttempt({ math: mathAnswers, reading: readingAnswers, science: scienceAnswers });
            try { localStorage.removeItem("tsaCompletedSubjects"); } catch (error) {}
            leaveExamRoomWithLoading();
          } catch (error) {
            isSubmitting = false;
            isSubmitted = false;
            saveLocalState();
            showMockSubmissionError(error);
          }
          return;
        }

        let onlineSuccess = false;
        if (supabaseClient && urlParams.get("preview") !== "true") {
          try {
            const mathRes = await submitExamToServerForSubject("math", mathAnswers);
            const readingRes = await submitExamToServerForSubject("reading", readingAnswers);
            const scienceRes = await submitExamToServer(scienceAnswers);

            if (mathRes.success && readingRes.success && scienceRes.success) {
              // Save local result for instant modal display
              const localResult = {
                id: "local_" + Date.now(),
                exam_code: examCode,
                user_email: studentInfo.email || studentInfo.code || "local",
                student_name: studentInfo.name || "Học sinh",
                correct_count: totalCorrect,
                total_questions: totalQuestionsCount,
                score: totalScoredPoints,
                created_at: new Date().toISOString(),
                math_correct: mathCorrect,
                math_total: mathTotal,
                reading_correct: readingCorrect,
                reading_total: readingTotal,
                science_correct: scienceCorrect,
                science_total: scienceTotal
              };
              localStorage.setItem("tma_tsa_last_local_result_" + examCode, JSON.stringify(localResult));

              onlineSuccess = true;
              leaveExamRoomWithLoading();
              return;
            } else {
              throw new Error("Không thể chấm điểm một trong các phần thi.");
            }
          } catch (err) {
            console.error("Lỗi nộp bài kíp thi:", err);
          }
        }

        if (!onlineSuccess) {
          // Save local result for fallback
          const localResult = {
            id: "local_" + Date.now(),
            exam_code: examCode,
            user_email: studentInfo.email || studentInfo.code || "local",
            student_name: studentInfo.name || "Học sinh",
            correct_count: totalCorrect,
            total_questions: totalQuestionsCount,
            score: totalScoredPoints,
            created_at: new Date().toISOString(),
            math_correct: mathCorrect,
            math_total: mathTotal,
            reading_correct: readingCorrect,
            reading_total: readingTotal,
            science_correct: scienceCorrect,
            science_total: scienceTotal
          };
          localStorage.setItem("tma_tsa_last_local_result_" + examCode, JSON.stringify(localResult));

          leaveExamRoomWithLoading();
          return;
        }
        try {
          localStorage.removeItem("tsaCompletedSubjects");
        } catch (e) {}
        leaveExamRoom();
        return;
      }
    } else {
      // Hiển thị hiệu ứng loading trên trang cha ngay lập tức khi nộp đề đơn lẻ để ẩn độ trễ kết nối Supabase
      const inIframe = window.parent && window.parent !== window;
      if (inIframe) {
        try {
          window.parent.postMessage({ type: "tsa-exam-submitting" }, "*");
        } catch (error) {
          console.warn("Lỗi gửi postMessage:", error);
        }
      }

      let correctCount = 0;
      let totalPoints = 0;
      let scoredPoints = 0;

      examData.questions.forEach((q) => {
        const pts = 1;
        totalPoints += pts;
        if (typeof gradeQuestion === "function" && gradeQuestion(q, answers[q.question_no])) {
          correctCount++;
          scoredPoints += pts;
        }
      });

      if (hasMockSession && urlParams.get("preview") !== "true") {
        try {
          await submitMockAttempt({ [subject]: answers });
          leaveExamRoomWithLoading();
        } catch (error) {
          isSubmitting = false;
          isSubmitted = false;
          saveLocalState();
          showMockSubmissionError(error);
        }
        return;
      }

      let onlineSuccess = false;
      if (supabaseClient && urlParams.get("preview") !== "true") {
        try {
          const res = await submitExamToServer(answers);
          if (res.success) {
            // Save local result for instant modal display
            const localResult = {
              id: "local_" + Date.now(),
              exam_code: examCode,
              user_email: studentInfo.email || studentInfo.code || "local",
              student_name: studentInfo.name || "Học sinh",
              correct_count: res.correct_count,
              total_questions: res.total_questions,
              score: res.score,
              created_at: new Date().toISOString(),
              math_correct: subject === "math" ? res.correct_count : 0,
              math_total: subject === "math" ? res.total_questions : 0,
              reading_correct: subject === "reading" ? res.correct_count : 0,
              reading_total: subject === "reading" ? res.total_questions : 0,
              science_correct: subject === "science" ? res.correct_count : 0,
              science_total: subject === "science" ? res.total_questions : 0
            };
            localStorage.setItem("tma_tsa_last_local_result_" + examCode, JSON.stringify(localResult));

            onlineSuccess = true;
            leaveExamRoomWithLoading();
            return;
          } else {
            throw new Error(res.message);
          }
        } catch (err) {
          console.error("Lỗi nộp bài online:", err);
        }
      }
      
      if (!onlineSuccess) {
        // Fallback offline
        let correctCount = 0;
        let totalPoints = 0;
        let scoredPoints = 0;
        examData.questions.forEach((q) => {
          const pts = 1;
          totalPoints += pts;
          if (typeof gradeQuestion === "function" && gradeQuestion(q, answers[q.question_no])) {
            correctCount++;
            scoredPoints += pts;
          }
        });

        // Save local result
        const localResult = {
          id: "local_" + Date.now(),
          exam_code: examCode,
          user_email: studentInfo.email || studentInfo.code || "local",
          student_name: studentInfo.name || "Học sinh",
          correct_count: correctCount,
          total_questions: examData.questions.length,
          score: scoredPoints,
          created_at: new Date().toISOString(),
          math_correct: subject === "math" ? correctCount : 0,
          math_total: subject === "math" ? examData.questions.length : 0,
          reading_correct: subject === "reading" ? correctCount : 0,
          reading_total: subject === "reading" ? examData.questions.length : 0,
          science_correct: subject === "science" ? correctCount : 0,
          science_total: subject === "science" ? examData.questions.length : 0
        };
        localStorage.setItem("tma_tsa_last_local_result_" + examCode, JSON.stringify(localResult));

        leaveExamRoomWithLoading();
        return;
      }
      leaveExamRoom();
    }
  }

  async function loadExamData() {
    try {
      const loaded = await loadRawExam();
      rawExamData = loaded.rawExam;
      examMetaGlobal = loaded.examMeta;
      if (typeof migrateImagesToHtml === "function") {
        migrateImagesToHtml();
      }
      examData = normalizeExamForSubject(rawExamData, loaded.examMeta);

      const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";
      if (viewSolution) {
        if (supabaseClient) {
          try {
            // Tải đáp án từ server RPC sau khi học sinh đã nộp bài
            const { data: solRes, error: solErr } = await supabaseClient.rpc('get_exam_solutions', {
              p_email: studentInfo.email || studentInfo.code,
              p_exam_code: examCode,
              p_subject: subject
            });
            if (solErr) throw solErr;
            if (solRes && solRes.success && Array.isArray(solRes.details)) {
              window.examGradingDetails = solRes.details;
              examData.questions.forEach(q => {
                const detail = solRes.details.find(d => d.question_no === q.question_no);
                if (detail) {
                  q.correct_answer = detail.correct_answer;
                  q.explanation = detail.solution;
                }
              });
            } else {
              console.warn("Không thể lấy đáp án từ RPC (sử dụng đáp án cục bộ):", solRes?.message);
            }
          } catch (err) {
            console.error("Lỗi khi tải đáp án từ Supabase:", err);
          }
        }
      }

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

      remainingSeconds = Number(examData.duration_minutes || (function() {
        if (subject === "math") return 60;
        if (subject === "reading") return 30;
        if (subject === "science") return 60;
        return 45;
      })()) * 60;

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
      showErrorMessage(`Không tải được đề ${examCode} từ Cloudflare R2. Hãy kiểm tra data/exams/index.json và data/exams/${examCode}.json.`);
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

    const urlParams = new URLSearchParams(window.location.search);
    const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";

    if (openBtn) {
      if (viewSolution || isSubmitted) {
        openBtn.innerHTML = "<span>Thoát</span>";
        openBtn.style.background = "#dc2626";
        openBtn.style.borderColor = "#dc2626";
        openBtn.style.color = "#ffffff";
        openBtn.addEventListener("click", leaveExamRoom);
      } else {
        openBtn.addEventListener("click", openSubmitDrawer);
      }
    }
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

    // --- DI CƯ HÌNH ẢNH VÀO TRONG HTML ĐỂ CHỈNH SỬA NHƯ WORD ---
    function migrateImagesToHtml() {
      if (!isPreviewMode || !rawExamData) return;
      
      function migrateQ(q) {
        if (q.image_url) {
          const w = q.image_width || 100;
          const imgHtml = `<br><img class="tma-inline-img" src="${q.image_url}" style="width:${w}%; max-width:100%; height:auto; display:block; margin:10px auto;">`;
          
          if (q.question !== undefined) {
            if (!q.question.includes(q.image_url)) {
              q.question = (q.question || "") + imgHtml;
            }
          } else if (q.prompt !== undefined) {
            if (!q.prompt.includes(q.image_url)) {
              q.prompt = (q.prompt || "") + imgHtml;
            }
          }
          delete q.image_url;
        }
        if (q.passage_image_url) {
          delete q.passage_image_url;
        }
      }

      function migrateGroup(g) {
        if (g.stimulus && g.stimulus.image_url) {
          const w = g.stimulus.image_width || 100;
          const imgHtml = `<br><img class="tma-inline-img" src="${g.stimulus.image_url}" style="width:${w}%; max-width:100%; height:auto; display:block; margin:10px auto;">`;
          
          const content = g.stimulus.content || g.passage || "";
          if (!content.includes(g.stimulus.image_url)) {
            g.stimulus.content = content + imgHtml;
            g.passage = content + imgHtml;
          } else {
            g.stimulus.content = content;
            g.passage = content;
          }
          // Do not delete g.stimulus.image_url so it remains accessible
        } else if (g.passage_image_url) {
          const w = g.image_width || g.stimulus?.image_width || 100;
          const imgHtml = `<br><img class="tma-inline-img" src="${g.passage_image_url}" style="width:${w}%; max-width:100%; height:auto; display:block; margin:10px auto;">`;
          const content = g.passage || (g.stimulus ? g.stimulus.content : "") || "";
          if (!content.includes(g.passage_image_url)) {
            g.passage = content + imgHtml;
            if (g.stimulus) g.stimulus.content = content + imgHtml;
          }
        }
      }

      if (Array.isArray(rawExamData.questions)) {
        rawExamData.questions.forEach(migrateQ);
      }
      if (Array.isArray(rawExamData.sections)) {
        rawExamData.sections.forEach(sec => {
          if (Array.isArray(sec.questions)) sec.questions.forEach(migrateQ);
          if (Array.isArray(sec.groups)) {
            sec.groups.forEach(g => {
              migrateGroup(g);
              if (Array.isArray(g.questions)) g.questions.forEach(migrateQ);
            });
          }
        });
      }
    }

    // --- CHẾ ĐỘ BIÊN TẬP VIÊN KHI XEM THỬ ---
    function initTeacherEditor() {
      if (!isPreviewMode) return;

      // Ghi đè CSS chặn kéo thả ảnh của base.css và toàn bộ thẻ cha, đồng thời ẩn exam-header cho rộng
      const overrideStyle = document.createElement("style");
      overrideStyle.innerHTML = `
        .tma-inline-img {
          -webkit-user-drag: element !important;
          user-drag: element !important;
          -webkit-user-select: auto !important;
          user-select: auto !important;
          cursor: move !important;
          display: block !important;
          margin: 10px auto !important;
        }
        .passage-pane, .question-column, .question-body, .question-lead, .stimulus-content, .stimulus-card, #question-text-content, .split-question-row, .stimulus-card * {
          -webkit-user-select: text !important;
          user-select: text !important;
          -webkit-user-drag: auto !important;
          user-drag: auto !important;
        }
        .exam-header {
          display: none !important;
        }
        .exam-footer {
          display: none !important;
        }
      `;
      document.head.appendChild(overrideStyle);

      const bar = document.createElement("div");
      bar.id = "tma-teacher-editor-bar";
      bar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 48px;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(8px);
        z-index: 9999999;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-bottom: 2px solid #135c97;
      `;
      
      let isTeacherEditMode = true;

      bar.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="background:#135c97; color:#fff; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px; text-transform:uppercase; letter-spacing:1px;">Biên tập</span>
          <span style="font-weight:600; margin-right:10px;">Chỉnh sửa như Word</span>
          <div id="tma-fmt-controls-wrap" style="display:flex; align-items:center; gap:8px;">
            <div style="display:flex; align-items:center; gap:4px; background:#334155; padding:3px 6px; border-radius:6px; margin-right:10px;">
              <button id="tma-fmt-bold" type="button" title="In đậm (Ctrl+B)" style="background:transparent; color:#fff; border:none; padding:4px 8px; font-weight:bold; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">B</button>
            </div>
            <span style="color:#94a3b8; font-size:11px; margin-right:4px;">Chèn ký hiệu mục:</span>
            <div style="display:flex; align-items:center; gap:2px; background:#334155; padding:3px 6px; border-radius:6px; margin-right:15px;">
              <button class="tma-symbol-btn" data-symbol="▶" type="button" title="Chèn ▶" style="background:transparent; color:#fff; border:none; padding:4px 6px; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">▶</button>
              <button class="tma-symbol-btn" data-symbol="➤" type="button" title="Chèn ➤" style="background:transparent; color:#fff; border:none; padding:4px 6px; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">➤</button>
              <button class="tma-symbol-btn" data-symbol="•" type="button" title="Chèn •" style="background:transparent; color:#fff; border:none; padding:4px 6px; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">•</button>
              <button class="tma-symbol-btn" data-symbol="–" type="button" title="Chèn –" style="background:transparent; color:#fff; border:none; padding:4px 6px; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">–</button>
              <button class="tma-symbol-btn" data-symbol="▪" type="button" title="Chèn ▪" style="background:transparent; color:#fff; border:none; padding:4px 6px; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">▪</button>
              <button class="tma-symbol-btn" data-symbol="✔" type="button" title="Chèn ✔" style="background:transparent; color:#fff; border:none; padding:4px 6px; cursor:pointer; font-size:12px; border-radius:4px; outline:none;">✔</button>
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span id="tma-editor-status" style="color:#94a3b8; font-style:italic;">Chưa có thay đổi</span>
          <button id="tma-editor-toggle-preview" style="background:#0284c7; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; font-size:12px; transition: background 0.15s;">👁 Xem học sinh</button>
          <button id="tma-editor-save-local" style="background:#475569; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; font-size:12px; transition: background 0.15s;">Lưu nháp</button>
          <button id="tma-editor-save-cloud" style="background:#135c97; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; font-size:12px; transition: background 0.15s;">Đồng bộ Cloud</button>
        </div>
      `;
      document.body.appendChild(bar);
      document.body.style.paddingTop = "48px";

      let isModified = false;
      function setModified(modified) {
        isModified = modified;
        const statusEl = document.getElementById("tma-editor-status");
        if (statusEl) {
          statusEl.textContent = modified ? "Có thay đổi chưa lưu!" : "Đã lưu nháp";
          statusEl.style.color = modified ? "#ef4444" : "#22c55e";
        }
      }

      async function saveLocalDraft() {
        if (!rawExamData) return;
        writeLocalJson(`tma_tsa_teacher_draft_${examCode}`, rawExamData);
        writeLocalJson(`tma_tsa_exam_${examCode}`, rawExamData);
        setModified(false);
      }

      async function saveCloud() {
        if (!rawExamData) return;
        await saveLocalDraft();
        
        const statusEl = document.getElementById("tma-editor-status");
        if (statusEl) {
          statusEl.textContent = "Đang đồng bộ Cloud...";
          statusEl.style.color = "#3b82f6";
        }

        if (!supabaseClient) {
          alert("Supabase Client chưa được khởi tạo. Không thể lưu lên Cloud.");
          setModified(true);
          return;
        }

        try {
          const examFileName = (rawExamData.exam_code || examCode) + ".json";
          if (!window.TMAExamSecurity) throw new Error("Thiếu bộ lọc bảo mật đề thi.");
          const publicExamData = window.TMAExamSecurity.createPublicExamCopy(rawExamData);

          // Cập nhật đáp án trong bảng exam_answers trên Supabase (nếu có)
          const answersToInsert = [];
          if (Array.isArray(rawExamData.sections)) {
            rawExamData.sections.forEach((sec) => {
              const secId = sec.section_id || sec.id || rawExamData.subject;
              if (Array.isArray(sec.questions)) {
                sec.questions.forEach((q) => {
                  if (q.correct_answer !== undefined) {
                    answersToInsert.push({
                      exam_code: rawExamData.exam_code,
                      subject: secId,
                      question_no: q.question_no,
                      question_type: q.question_type || q.type || "single_choice",
                      correct_answer: JSON.stringify(q.correct_answer),
                      accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                      points: q.points || 1,
                      solution_details: q.explanation || ""
                    });
                  }
                });
              }
              if (Array.isArray(sec.groups)) {
                sec.groups.forEach((g) => {
                  if (Array.isArray(g.questions)) {
                    g.questions.forEach((q) => {
                      if (q.correct_answer !== undefined) {
                        answersToInsert.push({
                          exam_code: rawExamData.exam_code,
                          subject: secId,
                          question_no: q.question_no,
                          question_type: q.question_type || q.type || "single_choice",
                          correct_answer: JSON.stringify(q.correct_answer),
                          accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                          points: q.points || 1,
                          solution_details: q.explanation || ""
                        });
                      }
                    });
                  }
                });
              }
            });
          } else if (Array.isArray(rawExamData.questions)) {
            rawExamData.questions.forEach((q) => {
              if (q.correct_answer !== undefined) {
                answersToInsert.push({
                  exam_code: rawExamData.exam_code,
                  subject: rawExamData.subject,
                  question_no: q.question_no,
                  question_type: q.question_type || q.type || "single_choice",
                  correct_answer: JSON.stringify(q.correct_answer),
                  accepted_answers: q.accepted_answers ? JSON.stringify(q.accepted_answers) : null,
                  points: q.points || 1,
                  solution_details: q.explanation || ""
                });
              }
            });
          }

          if (answersToInsert.length > 0) {
            await supabaseClient.from('exam_answers').delete().eq('exam_code', rawExamData.exam_code);
            const { error: answersInsertError } = await supabaseClient
              .from('exam_answers')
              .insert(answersToInsert);
            if (answersInsertError) throw answersInsertError;
          }

          await window.TMAR2.putJson("data/exams/" + examFileName, publicExamData);

          alert("✓ Đồng bộ đề thi lên Cloudflare R2 thành công!");
          setModified(false);
        } catch (err) {
          console.error("Lỗi đồng bộ Cloud:", err);
          alert("Lỗi đồng bộ Cloud: " + (err.message || err));
          setModified(true);
        }
      }

      function toggleTeacherEditMode(enabled) {
        isTeacherEditMode = enabled;
        const toggleBtn = document.getElementById("tma-editor-toggle-preview");
        if (toggleBtn) {
          toggleBtn.innerHTML = enabled ? "👁 Xem học sinh" : "✏️ Vào chỉnh sửa";
          toggleBtn.style.background = enabled ? "#0284c7" : "#16a34a";
        }
        const fmtWrap = document.getElementById("tma-fmt-controls-wrap");
        if (fmtWrap) {
          fmtWrap.style.display = enabled ? "flex" : "none";
        }
        if (!enabled && activeResizer) {
          activeResizer.remove();
          activeResizer = null;
          document.querySelectorAll("img.tma-editing-active").forEach(el => {
            el.classList.remove("tma-editing-active");
            el.style.borderColor = "transparent";
          });
        }
        if (typeof window.makeElementsEditable === "function") {
          window.makeElementsEditable();
        }
      }

      document.getElementById("tma-editor-toggle-preview").addEventListener("click", () => {
        toggleTeacherEditMode(!isTeacherEditMode);
      });

      document.getElementById("tma-editor-save-local").addEventListener("click", saveLocalDraft);
      document.getElementById("tma-editor-save-cloud").addEventListener("click", saveCloud);

      // Định dạng nút bấm Word (mousedown mới không làm mất tiêu điểm)
      document.getElementById("tma-fmt-bold").addEventListener("mousedown", (e) => {
        e.preventDefault();
        document.execCommand("bold", false, null);
        setModified(true);
      });

      function insertSymbolAtCursor(sym) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        
        // Kiểm tra xem vị trí con trỏ có nằm trong phần tử contenteditable không
        const container = range.startContainer;
        const editableNode = container.nodeType === 3 ? container.parentNode : container;
        if (!editableNode.closest("[contenteditable='true']")) {
          return;
        }
        
        range.deleteContents();
        const textNode = document.createTextNode(sym + " ");
        range.insertNode(textNode);
        
        // Di chuyển con trỏ ra sau ký tự vừa chèn
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        
        // Kích hoạt cập nhật dữ liệu DOM ngay lập tức
        const lead = editableNode.closest(".question-lead");
        const passageContent = editableNode.closest(".stimulus-content");
        if (lead) updateQuestionTextFromDom(lead);
        else if (passageContent) updatePassageTextFromDom(passageContent);
      }

      document.querySelectorAll(".tma-symbol-btn").forEach(btn => {
        btn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          const sym = btn.getAttribute("data-symbol");
          insertSymbolAtCursor(sym);
          setModified(true);
        });
      });

      function updateQuestionTextFromDom(lead) {
        const newText = lead.innerHTML;
        const currentQ = examData.questions[currentQuestionIndex];
        if (currentQ) {
          const originalNo = currentQ.original_question_no || currentQ.question_no;
          const rawQ = findQuestionInRaw(originalNo);
          if (rawQ) {
            if (rawQ.question !== undefined) rawQ.question = newText;
            else rawQ.prompt = newText;
            
            if (currentQ.question !== undefined) currentQ.question = newText;
            else currentQ.prompt = newText;
          }
        }
      }

      function updatePassageTextFromDom(passageContent) {
        const newText = passageContent.innerHTML;
        const currentQ = examData.questions[currentQuestionIndex];
        if (currentQ && currentQ.group_id) {
          const rawGroup = findGroupInRaw(currentQ.group_id);
          if (rawGroup && rawGroup.stimulus) {
            rawGroup.stimulus.content = newText;
            
            currentQ.passage = newText;
            if (currentQ.stimulus) currentQ.stimulus.content = newText;
          }
        }
      }

      window.makeElementsEditable = function() {
        const enabled = isTeacherEditMode;

        // 1. Chỉnh sửa đề bài
        const lead = document.querySelector(".question-lead");
        if (lead) {
          lead.setAttribute("contenteditable", enabled ? "true" : "false");
          lead.setAttribute("spellcheck", "false");
          lead.style.border = enabled ? "1px dashed #cbd5e1" : "none";
          lead.style.padding = enabled ? "8px" : "0";
          lead.style.borderRadius = "4px";
          lead.style.outline = "none";
          
          if (!lead.dataset.hasListeners) {
            lead.dataset.hasListeners = "true";
            lead.addEventListener("blur", () => {
              if (isTeacherEditMode) {
                updateQuestionTextFromDom(lead);
                setModified(true);
              }
            });
            lead.addEventListener("input", () => {
              if (isTeacherEditMode) {
                updateQuestionTextFromDom(lead);
                setModified(true);
              }
            });
            lead.addEventListener("drop", () => {
              if (isTeacherEditMode) {
                setTimeout(() => {
                  updateQuestionTextFromDom(lead);
                  setModified(true);
                }, 100);
              }
            });
          }
        }

        // 2. Chỉnh sửa ngữ liệu
        const passageContent = document.querySelector(".stimulus-content");
        if (passageContent) {
          passageContent.setAttribute("contenteditable", enabled ? "true" : "false");
          passageContent.setAttribute("spellcheck", "false");
          passageContent.style.border = enabled ? "1px dashed #cbd5e1" : "none";
          passageContent.style.padding = enabled ? "8px" : "0";
          passageContent.style.borderRadius = "4px";
          passageContent.style.outline = "none";

          if (!passageContent.dataset.hasListeners) {
            passageContent.dataset.hasListeners = "true";
            passageContent.addEventListener("blur", () => {
              if (isTeacherEditMode) {
                updatePassageTextFromDom(passageContent);
                setModified(true);
              }
            });
            passageContent.addEventListener("input", () => {
              if (isTeacherEditMode) {
                updatePassageTextFromDom(passageContent);
                setModified(true);
              }
            });
            passageContent.addEventListener("drop", () => {
              if (isTeacherEditMode) {
                setTimeout(() => {
                  updatePassageTextFromDom(passageContent);
                  setModified(true);
                }, 100);
              }
            });
          }
        }

        // 3. Tương tác hình ảnh
        const images = document.querySelectorAll(".question-lead img, .stimulus-content img");
        images.forEach((img) => {
          img.style.cursor = enabled ? "pointer" : "default";
          img.style.border = enabled ? "2px solid transparent" : "none";
          
          if (!img.dataset.hasListeners) {
            img.dataset.hasListeners = "true";
            img.addEventListener("mouseenter", () => {
              if (isTeacherEditMode) img.style.borderColor = "#135c97";
            });
            img.addEventListener("mouseleave", () => {
              if (isTeacherEditMode) {
                if (!img.classList.contains("tma-editing-active")) {
                  img.style.borderColor = "transparent";
                }
              }
            });

            img.addEventListener("click", (e) => {
              if (!isTeacherEditMode) return;
              e.stopPropagation();
              showImageController(img);
            });

            img.addEventListener("dragstart", (e) => {
              if (!isTeacherEditMode) {
                e.preventDefault();
                return;
              }
              if (activeResizer) {
                activeResizer.remove();
                activeResizer = null;
              }
            });
          }
        });
      };

      function findQuestionInRaw(originalNo) {
        if (!rawExamData) return null;
        if (Array.isArray(rawExamData.questions)) {
          return rawExamData.questions.find(q => q.question_no === originalNo);
        }
        if (Array.isArray(rawExamData.sections)) {
          for (const sec of rawExamData.sections) {
            if (Array.isArray(sec.questions)) {
              const found = sec.questions.find(q => q.question_no === originalNo);
              if (found) return found;
            }
            if (Array.isArray(sec.groups)) {
              for (const grp of sec.groups) {
                if (Array.isArray(grp.questions)) {
                  const found = grp.questions.find(q => q.question_no === originalNo);
                  if (found) return found;
                }
              }
            }
          }
        }
        return null;
      }

      function findGroupInRaw(groupId) {
        if (!rawExamData || !rawExamData.sections) return null;
        for (const sec of rawExamData.sections) {
          if (Array.isArray(sec.groups)) {
            const found = sec.groups.find(g => g.group_id === groupId);
            if (found) return found;
          }
        }
        return null;
      }

      let activeResizer = null;
      function showImageController(img) {
        if (!isTeacherEditMode) return;
        if (activeResizer) activeResizer.remove();
        document.querySelectorAll("img.tma-editing-active").forEach(el => {
          el.classList.remove("tma-editing-active");
          el.style.borderColor = "transparent";
        });

        img.classList.add("tma-editing-active");
        img.style.borderColor = "#135c97";

        const resizer = document.createElement("div");
        resizer.id = "tma-img-resizer";
        resizer.style.cssText = `
          position: absolute;
          border: 1px dashed #135c97;
          z-index: 2147483600;
          pointer-events: none;
          box-sizing: border-box;
        `;

        const corners = ["tl", "tr", "bl", "br"];
        corners.forEach((c) => {
          const h = document.createElement("div");
          h.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: #fff;
            border: 1.5px solid #135c97;
            border-radius: 50%;
            pointer-events: auto;
            box-sizing: border-box;
          `;
          if (c === "tl") { h.style.top = "-4px"; h.style.left = "-4px"; h.style.cursor = "nwse-resize"; }
          else if (c === "tr") { h.style.top = "-4px"; h.style.right = "-4px"; h.style.cursor = "nesw-resize"; }
          else if (c === "bl") { h.style.bottom = "-4px"; h.style.left = "-4px"; h.style.cursor = "nesw-resize"; }
          else if (c === "br") { h.style.bottom = "-4px"; h.style.right = "-4px"; h.style.cursor = "nwse-resize"; }

          resizer.appendChild(h);

          h.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startWidth = img.offsetWidth;
            const parentWidth = img.parentElement.offsetWidth;

            function onMouseMove(moveEvent) {
              const deltaX = moveEvent.clientX - startX;
              let newWidth = startWidth;
              if (c === "tr" || c === "br") {
                newWidth = startWidth + deltaX;
              } else {
                newWidth = startWidth - deltaX;
              }

              if (newWidth < 20) newWidth = 20;
              if (newWidth > parentWidth) newWidth = parentWidth;

              const pct = Math.round((newWidth / parentWidth) * 100);

              img.setAttribute("style", `width:${pct}%; max-width:100%; height:auto; display:block; margin:10px auto;`);
              img.style.width = `${pct}%`;

              updateResizerPos();
              setModified(true);
            }

            function onMouseUp() {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);

              const lead = img.closest(".question-lead");
              const passageContent = img.closest(".stimulus-content");
              if (lead) updateQuestionTextFromDom(lead);
              else if (passageContent) updatePassageTextFromDom(passageContent);
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          });
        });

        document.body.appendChild(resizer);
        activeResizer = resizer;

        function updateResizerPos() {
          const rect = img.getBoundingClientRect();
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

          resizer.style.left = `${rect.left + scrollLeft}px`;
          resizer.style.top = `${rect.top + scrollTop}px`;
          resizer.style.width = `${rect.width}px`;
          resizer.style.height = `${rect.height}px`;
        }

        updateResizerPos();

        window.addEventListener("resize", updateResizerPos);
        window.addEventListener("scroll", updateResizerPos);

        function dismissResizer(e) {
          if (e.target !== img && !resizer.contains(e.target)) {
            resizer.remove();
            activeResizer = null;
            document.removeEventListener("mousedown", dismissResizer);
            window.removeEventListener("resize", updateResizerPos);
            window.removeEventListener("scroll", updateResizerPos);
          }
        }
        setTimeout(() => {
          document.addEventListener("mousedown", dismissResizer);
        }, 50);
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      initMobileExamControls();
      bindDrawerControls();
      loadExamData();
      initTeacherEditor();

    initAutoFullscreen();
    enforceFullscreen();
    document.addEventListener("fullscreenchange", enforceFullscreen);
    document.addEventListener("webkitfullscreenchange", enforceFullscreen);
    document.addEventListener("mozfullscreenchange", enforceFullscreen);
    document.addEventListener("MSFullscreenChange", enforceFullscreen);

    const prevBtn = $('[data-action="previous"]');
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (!examData) return;
        const navInfo = getGroupNavigationInfo();
        if (navInfo) {
          if (!navInfo.isFirst) {
            const prevGroup = navInfo.groups[navInfo.currentIndex - 1];
            const prevIdx = examData.questions.findIndex(q => q.group_id === prevGroup);
            if (prevIdx !== -1) {
              currentQuestionIndex = prevIdx;
              questionElapsedSeconds = 0;
              renderActiveQuestion();
            }
          }
        } else {
          if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            questionElapsedSeconds = 0;
            renderActiveQuestion();
          }
        }
      });
    }

    const nextBtn = $('[data-action="next"]');
    const urlParams = new URLSearchParams(window.location.search);
    const viewSolution = urlParams.get("view_solution") === "true" || urlParams.get("mode") === "solution";

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (!examData) return;
        const navInfo = getGroupNavigationInfo();
        if (navInfo) {
          if (!navInfo.isLast) {
            const nextGroup = navInfo.groups[navInfo.currentIndex + 1];
            const nextIdx = examData.questions.findIndex(q => q.group_id === nextGroup);
            if (nextIdx !== -1) {
              currentQuestionIndex = nextIdx;
              questionElapsedSeconds = 0;
              renderActiveQuestion();
            }
          } else {
            if (viewSolution) {
              leaveExamRoom();
            } else {
              submitExam();
            }
          }
        } else {
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
      if (viewSolution || isSubmitted) {
        submitBtn.textContent = "Thoát";
        submitBtn.style.background = "#dc2626";
        submitBtn.style.borderColor = "#dc2626";
        submitBtn.style.color = "#ffffff";
        submitBtn.addEventListener("click", leaveExamRoom);
      } else {
        submitBtn.addEventListener("click", submitExam);
      }
    }
  });

  function initMobileExamControls() {
    // 1. Math page mobile sidebar open/close
    const openMathBtn = document.getElementById("open-math-sidebar-btn");
    const closeMathBtn = document.getElementById("close-math-sidebar-btn");
    const mathSidebar = document.querySelector(".exam-sidebar");
    const mathOverlay = document.getElementById("exam-math-drawer-overlay");

    if (openMathBtn && mathSidebar && mathOverlay) {
      openMathBtn.addEventListener("click", () => {
        mathSidebar.classList.add("open");
        mathOverlay.classList.add("active");
      });
    }

    if (closeMathBtn && mathSidebar && mathOverlay) {
      closeMathBtn.addEventListener("click", () => {
        mathSidebar.classList.remove("open");
        mathOverlay.classList.remove("active");
      });
    }

    if (mathOverlay && mathSidebar) {
      mathOverlay.addEventListener("click", () => {
        mathSidebar.classList.remove("open");
        mathOverlay.classList.remove("active");
      });
    }

    // 2. Reading/Science mobile tab toggle
    document.querySelectorAll('.mobile-exam-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const splitContainer = tab.closest('.question-reading-split');
        if (!splitContainer) return;

        const target = tab.dataset.target;
        
        splitContainer.querySelectorAll('.mobile-exam-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (target === 'passage') {
          splitContainer.classList.remove('show-questions');
          splitContainer.classList.add('show-passage');
        } else {
          splitContainer.classList.remove('show-passage');
          splitContainer.classList.add('show-questions');
        }
      });
    });

    // Automatic sync: reload exam data if draft is saved in another tab
    window.addEventListener("storage", (e) => {
      if (e.key && (e.key.startsWith("tma_tsa_teacher_draft_") || e.key.startsWith("tma_tsa_exam_"))) {
        console.log("Teacher draft updated from another tab, reloading questions...");
        if (typeof loadExamData === "function") {
          loadExamData().catch(err => console.error(err));
        }
      }
    });
  }
})();
