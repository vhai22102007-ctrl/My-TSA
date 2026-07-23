(function () {
  "use strict";

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var element = byId(id);
    if (element) element.textContent = value == null || value === "" ? "--" : String(value);
  }

  function formatDate(value) {
    if (!value) return "--";
    var text = String(value).trim();
    if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}$/.test(text)) return text.replace(/[/.]/g, "-");
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return text;
    return [String(date.getDate()).padStart(2, "0"), String(date.getMonth() + 1).padStart(2, "0"), date.getFullYear()].join("-");
  }

  function issueDates(value) {
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) date = new Date();
    return {
      vi: String(date.getDate()).padStart(2, "0") + " tháng " + String(date.getMonth() + 1).padStart(2, "0") + " năm " + date.getFullYear(),
      en: date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    };
  }

  function formatScore(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) return "--";
    return number.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(number) ? 0 : 2, maximumFractionDigits: 2 });
  }

  function isFemale(value) {
    var gender = String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
    return gender === "nu" || gender === "female" || gender === "f" || gender.indexOf("nu ") === 0;
  }

  function makeReportNumber(data) {
    var candidate = data.candidate || {};
    var source = [data.exam && data.exam.examCode, candidate.phone, data.submittedAt].join("|");
    var hash = 0;
    for (var index = 0; index < source.length; index++) hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
    var date = new Date(data.submittedAt || Date.now());
    var dateCode = String(date.getFullYear()).slice(-2) + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
    return "TMA-" + dateCode + "-" + String(candidate.phone || "0000").slice(-4) + "-" + String(Math.abs(hash) % 10000).padStart(4, "0");
  }

  function sectionLabel(key) {
    var labels = {
      math: ["Tư duy Toán học", "Mathematical thinking skills"],
      reading: ["Tư duy Đọc hiểu", "Reading comprehension skills"],
      science: ["Tư duy Khoa học/Giải quyết vấn\u00A0đề", "Scientific thinking skills/\nProblem-solving thinking skills"]
    };
    return labels[key] || ["Phần " + String(key || "Tổng hợp"), "Exam section"];
  }

  function renderSections(data) {
    var container = byId("report-sections");
    var sections = data.sections && typeof data.sections === "object" ? data.sections : {};
    var entries = Object.keys(sections).filter(function (key) { return sections[key] && typeof sections[key] === "object"; });
    if (!entries.length) entries = ["overall"];
    container.innerHTML = "";
    entries.slice(0, 4).forEach(function (key) {
      var section = key === "overall" ? { correctCount: data.correctCount, totalQuestions: data.totalQuestions } : sections[key];
      var label = key === "overall" ? ["Kết quả tổng hợp", "Overall performance"] : sectionLabel(key);
      var row = document.createElement("div");
      row.className = "section-score-row";
      row.dataset.section = key;
      row.innerHTML = '<div class="section-score-value"><strong></strong><span></span></div><div class="section-score-label"><strong></strong><i></i></div>';
      row.querySelector(".section-score-value strong").textContent = Number(section.correctCount) || 0;
      row.querySelector(".section-score-value span").textContent = "0 - " + (Number(section.totalQuestions) || 0);
      row.querySelector(".section-score-label strong").textContent = label[0];
      row.querySelector(".section-score-label i").textContent = label[1];
      container.appendChild(row);
    });
  }

  function renderQr(reportNumber, data) {
    var container = byId("report-qr");
    var payload = ["TMA-STUDY", reportNumber, data.exam && data.exam.examCode, data.score, data.maxScore].join("|");
    try {
      if (typeof window.qrcode !== "function") throw new Error("QR library unavailable");
      var qr = window.qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      container.innerHTML = qr.createSvgTag(3, 0);
    } catch (error) {
      container.textContent = reportNumber;
      container.style.fontSize = "10px";
      container.style.overflowWrap = "anywhere";
    }
  }

  var data = null;
  try {
    data = JSON.parse(sessionStorage.getItem("tmaReleasedReport") || "null");
  } catch (error) {
    data = null;
  }
  if (!data || data.status !== "released") {
    window.location.replace("result.html");
    return;
  }

  var candidate = data.candidate || { name: data.candidateName || "", candidateId: "" };
  var female = isFemale(candidate.gender);
  var reportNumber = makeReportNumber(data);
  var issued = issueDates(new Date());
  setText("report-name", candidate.name || data.candidateName);
  setText("report-dob", formatDate(candidate.dateOfBirth));
  setText("report-gender", female ? "Nữ - Female" : "Nam - Male");
  setText("report-id-number", candidate.idNumber);
  setText("report-test-date", formatDate(data.submittedAt));
  setText("report-candidate-id", candidate.candidateId || candidate.phone);
  setText("report-score", formatScore(data.score));
  setText("report-max-score", "0 - " + formatScore(data.maxScore));
  setText("report-exam-title", data.exam && data.exam.title);
  setText("report-number", reportNumber);
  setText("report-issue-date", issued.vi);
  setText("report-issue-date-en", issued.en);
  setText("report-rank", "#" + (Number(data.rank) || 1));
  setText("report-participants", (Number(data.participantCount) || 1) + " thí sinh");
  byId("report-avatar").src = female
    ? "https://assets.tmastudy.io.vn/assets/nu.png"
    : "https://assets.tmastudy.io.vn/assets/nam.png";
  byId("report-avatar").alt = female ? "Ảnh đại diện thí sinh nữ" : "Ảnh đại diện thí sinh nam";
  renderSections(data);
  renderQr(reportNumber, data);
})();
