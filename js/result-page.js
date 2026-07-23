(function () {
  "use strict";

  var elements = {
    form: document.getElementById("result-form"),
    phone: document.getElementById("result-phone"),
    submit: document.getElementById("result-submit"),
    error: document.getElementById("result-error"),
    lookupView: document.getElementById("lookup-view"),
    choiceView: document.getElementById("exam-choice-view"),
    examList: document.getElementById("result-exam-list"),
    choiceBack: document.getElementById("choice-back"),
    resultView: document.getElementById("result-view")
  };
  var currentPhone = "";

  function normalizePhone(value) {
    var phone = String(value || "").replace(/\D/g, "");
    if (phone.indexOf("0084") === 0) phone = "0" + phone.slice(4);
    else if (phone.indexOf("84") === 0 && phone.length >= 11) phone = "0" + phone.slice(2);
    return phone.slice(0, 15);
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function setBusy(busy) {
    elements.submit.disabled = busy;
    elements.submit.textContent = busy ? "Đang tra cứu..." : "Tra cứu kết quả";
  }

  function showLookup() {
    elements.lookupView.hidden = false;
    elements.choiceView.hidden = true;
    elements.resultView.hidden = true;
    elements.phone.focus();
  }

  function renderChoices(exams) {
    elements.lookupView.hidden = true;
    elements.choiceView.hidden = false;
    elements.resultView.hidden = true;
    elements.examList.innerHTML = "";
    exams.forEach(function (exam) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "result-exam-option";
      button.innerHTML = '<span><span class="result-exam-name"></span><span class="result-exam-meta"></span></span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      button.querySelector(".result-exam-name").textContent = exam.title;
      button.querySelector(".result-exam-meta").textContent = exam.examCode + " · " + (exam.released ? "Đã công bố" : exam.submitted ? "Đang chờ công bố" : "Chưa có bài nộp");
      button.addEventListener("click", function () { lookup(exam.examCode); });
      elements.examList.appendChild(button);
    });
  }

  function renderStatus(data) {
    elements.lookupView.hidden = true;
    elements.choiceView.hidden = true;
    elements.resultView.hidden = false;
    var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
    var isGrading = data.status === "pending_grading";
    var title = isGrading ? "Bài thi đã được ghi nhận" : (data.status === "pending" ? "Bài thi đang chờ công bố" : "Chưa ghi nhận bài thi");
    var detail = isGrading
      ? "Hệ thống đang hoàn tất chấm điểm. Kết quả sẽ hiển thị sau khi giáo viên công bố."
      : (data.status === "pending"
        ? (data.releaseAt ? "Kết quả dự kiến được công bố lúc " + formatDate(data.releaseAt) + "." : "Giáo viên chưa công bố kết quả. Vui lòng quay lại sau.")
        : "Hệ thống chưa tìm thấy bài nộp cho kỳ thi này.");
    elements.resultView.innerHTML = '<div class="result-status-panel"><div class="result-status-icon">' + icon + '</div><h2>' + escapeHtml(title) + '</h2><p><strong>' + escapeHtml(data.candidateName || "Thí sinh") + '</strong><br>' + escapeHtml(data.exam.title) + '</p><p>' + escapeHtml(detail) + '</p></div><div class="result-actions"><button type="button" class="result-text-button" id="result-search-again"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>Tra cứu số khác</button><a class="result-text-button" href="exam.html">Về cổng thi</a></div>';
    document.getElementById("result-search-again").addEventListener("click", showLookup);
  }

  function renderReleased(data) {
    try {
      sessionStorage.setItem("tmaReleasedReport", JSON.stringify(data));
      window.location.assign("report.html");
    } catch (error) {
      elements.lookupView.hidden = true;
      elements.choiceView.hidden = true;
      elements.resultView.hidden = false;
      elements.resultView.innerHTML = '<div class="result-status-panel"><h2>Không thể mở phiếu kết quả</h2><p>Vui lòng cho phép trình duyệt lưu dữ liệu phiên và thử lại.</p></div>';
    }
  }

  async function lookup(examCode) {
    if (!window.TMAMockExam) {
      elements.error.textContent = "Dịch vụ tra cứu chưa sẵn sàng.";
      return;
    }
    setBusy(true);
    elements.error.textContent = "";
    try {
      var data = await window.TMAMockExam.lookupResult(currentPhone, examCode || "");
      if (data.selectionRequired) renderChoices(data.exams || []);
      else if (data.status === "released") renderReleased(data);
      else renderStatus(data);
    } catch (error) {
      showLookup();
      elements.error.textContent = error.message || "Không thể tra cứu kết quả.";
    } finally {
      setBusy(false);
    }
  }

  elements.phone.addEventListener("input", function (event) {
    var phone = normalizePhone(event.target.value);
    event.target.value = phone.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    elements.error.textContent = "";
  });

  elements.form.addEventListener("submit", function (event) {
    event.preventDefault();
    currentPhone = normalizePhone(elements.phone.value);
    if (!/^0\d{8,10}$/.test(currentPhone)) {
      elements.error.textContent = "Vui lòng nhập số điện thoại hợp lệ đã dùng để đăng ký.";
      return;
    }
    lookup("");
  });

  elements.choiceBack.addEventListener("click", showLookup);

  try {
    var autoLookup = JSON.parse(sessionStorage.getItem("tmaResultAutoLookup") || "null");
    sessionStorage.removeItem("tmaResultAutoLookup");
    if (autoLookup && autoLookup.phone) {
      currentPhone = normalizePhone(autoLookup.phone);
      elements.phone.value = currentPhone.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      lookup(autoLookup.examCode || "");
    }
  } catch (error) {
    sessionStorage.removeItem("tmaResultAutoLookup");
  }
})();
