(function () {
  "use strict";

  var state = {
    examCode: "",
    examTitle: "",
    dashboard: null,
    pendingCandidates: [],
    search: ""
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function normalizeHeader(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizePhone(value) {
    var phone = String(value || "").replace(/\D/g, "");
    if (phone.indexOf("0084") === 0) phone = "0" + phone.slice(4);
    else if (phone.indexOf("84") === 0 && phone.length >= 11) phone = "0" + phone.slice(2);
    return phone.slice(0, 15);
  }

  function categoryFromCode(code) {
    var prefix = String(code || "").split("_")[0].toUpperCase();
    return ["TSA", "HSA", "VACT", "QDA", "THPT"].indexOf(prefix) !== -1 ? prefix : "TSA";
  }

  function currentOpenState(code) {
    try {
      var list = JSON.parse(localStorage.getItem("tma_tsa_exam_index") || "[]");
      var item = Array.isArray(list) ? list.find(function (exam) { return String(exam.exam_code || "").toUpperCase() === String(code || "").toUpperCase(); }) : null;
      return Boolean(item && item.is_open === true);
    } catch (_error) {
      return false;
    }
  }

  function showImportStatus(message, ready) {
    var element = byId("mock-import-status");
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-ready", ready === true);
  }

  function setButtonBusy(button, busy, busyText) {
    if (!button) return function () {};
    var original = button.innerHTML;
    button.disabled = busy;
    if (busy && busyText) button.textContent = busyText;
    return function () {
      button.disabled = false;
      button.innerHTML = original;
    };
  }

  function formatDateTime(value) {
    if (!value) return "--";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function toLocalDatetimeValue(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    var local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  async function ensureExamRecord() {
    if (!window.TMAMockAdmin) throw new Error("Dịch vụ vận hành thi thử chưa sẵn sàng.");
    await window.TMAMockAdmin.upsertExam({
      examCode: state.examCode,
      title: state.examTitle,
      category: categoryFromCode(state.examCode),
      isOpen: currentOpenState(state.examCode)
    });
  }

  async function loadDashboard() {
    var refreshButton = byId("mock-ops-refresh");
    var restore = setButtonBusy(refreshButton, true);
    try {
      state.dashboard = await window.TMAMockAdmin.dashboard(state.examCode);
      renderDashboard();
    } catch (error) {
      showImportStatus(error.message || "Không tải được dữ liệu vận hành.", false);
      throw error;
    } finally {
      restore();
    }
  }

  function renderStats() {
    var stats = state.dashboard && state.dashboard.stats ? state.dashboard.stats : {};
    var values = {
      "mock-stat-registered": stats.registered || 0,
      "mock-stat-submitted": stats.submitted || 0,
      "mock-stat-pending": stats.pending || 0,
      "mock-stat-average": stats.average || 0,
      "mock-stat-median": stats.median || 0,
      "mock-stat-highest": stats.highest || 0,
      "mock-stat-lowest": stats.lowest || 0
    };
    Object.keys(values).forEach(function (id) {
      var element = byId(id);
      if (element) element.textContent = values[id];
    });
    var candidates = state.dashboard && state.dashboard.candidates ? state.dashboard.candidates : [];
    var topNames = candidates
      .filter(function (candidate) { return candidate.submittedAt && candidate.gradingStatus !== "pending" && Number(candidate.score) === Number(stats.highest); })
      .map(function (candidate) { return candidate.fullName; });
    var topName = byId("mock-stat-top-name");
    if (topName) topName.textContent = topNames.length ? topNames.slice(0, 2).join(", ") : "Chưa có";
  }

  function renderDistribution() {
    var container = byId("mock-distribution");
    if (!container) return;
    var items = state.dashboard && state.dashboard.stats && state.dashboard.stats.distribution
      ? state.dashboard.stats.distribution
      : [];
    var maximum = Math.max.apply(Math, [1].concat(items.map(function (item) { return Number(item.count) || 0; })));
    container.innerHTML = items.map(function (item) {
      var height = Math.max(3, Math.round(((Number(item.count) || 0) / maximum) * 112));
      return '<div class="mock-bar-item"><span class="mock-bar-count">' + escapeHtml(item.count || 0) + '</span><div class="mock-bar-track"><div class="mock-bar-fill" style="height:' + height + 'px"></div></div><span class="mock-bar-label">' + escapeHtml(item.label) + '</span></div>';
    }).join("");
  }

  function renderCandidates() {
    var body = byId("mock-results-body");
    if (!body) return;
    var candidates = state.dashboard && Array.isArray(state.dashboard.candidates) ? state.dashboard.candidates : [];
    var query = normalizeHeader(state.search);
    if (query) {
      candidates = candidates.filter(function (candidate) {
        return normalizeHeader([candidate.fullName, candidate.phone, candidate.school, candidate.className].join(" ")).indexOf(query) !== -1;
      });
    }
    if (!candidates.length) {
      body.innerHTML = '<tr><td colspan="6" class="mock-empty-cell">Không có thí sinh phù hợp</td></tr>';
      return;
    }
    body.innerHTML = candidates.map(function (candidate) {
      var submitted = Boolean(candidate.submittedAt);
      var gradingPending = submitted && candidate.gradingStatus === "pending";
      var schoolClass = [candidate.school, candidate.className].filter(Boolean).join(" · ") || "--";
      var statusText = gradingPending ? "Chờ chấm" : (submitted ? "Đã nộp" : "Chưa nộp");
      return '<tr><td><span class="mock-candidate-name">' + escapeHtml(candidate.fullName) + '</span><span class="mock-candidate-sub">' + escapeHtml(candidate.email || candidate.province || "") + '</span></td><td>' + escapeHtml(candidate.phone) + '</td><td>' + escapeHtml(schoolClass) + '</td><td><span class="mock-table-status ' + (submitted ? 'is-submitted' : '') + '">' + statusText + '</span></td><td class="mock-score-cell">' + (submitted && !gradingPending ? escapeHtml(candidate.score) + ' / ' + escapeHtml(candidate.maxScore) : '--') + '</td><td>' + escapeHtml(formatDateTime(candidate.submittedAt)) + '</td></tr>';
    }).join("");
  }

  function renderExamState() {
    var exam = state.dashboard && state.dashboard.exam ? state.dashboard.exam : {};
    var roomBadge = byId("mock-room-status");
    var roomButton = byId("mock-toggle-room");
    if (roomBadge) {
      roomBadge.textContent = exam.isOpen ? "Đang mở" : "Đang đóng";
      roomBadge.classList.toggle("is-open", exam.isOpen === true);
    }
    if (roomButton) roomButton.textContent = exam.isOpen ? "Đóng phòng thi" : "Mở phòng thi";
    var releaseInput = byId("mock-release-at");
    if (releaseInput) releaseInput.value = toLocalDatetimeValue(exam.resultReleaseAt);
    var releaseState = byId("mock-release-state");
    if (releaseState) {
      releaseState.className = "mock-release-state";
      if (exam.resultsPublished) {
        releaseState.textContent = "Đã công bố";
        releaseState.classList.add("is-published");
      } else if (exam.resultReleaseAt) {
        releaseState.textContent = "Hẹn " + formatDateTime(exam.resultReleaseAt);
        releaseState.classList.add("is-scheduled");
      } else {
        releaseState.textContent = "Chưa công bố";
      }
    }
  }

  function renderDashboard() {
    renderExamState();
    renderStats();
    renderDistribution();
    renderCandidates();
  }

  function showOperationsView() {
    var lobby = byId("exams-lobby-view");
    var management = byId("exams-management-view");
    var operations = byId("mock-operations-view");
    if (lobby) lobby.style.display = "none";
    if (management) management.style.display = "none";
    if (operations) operations.hidden = false;
    var shell = document.querySelector(".teacher-shell");
    if (shell && window.matchMedia("(max-width: 1080px)").matches) shell.classList.add("mock-ops-mobile-focus");
    var title = byId("mock-ops-title");
    var code = byId("mock-ops-code");
    if (title) title.textContent = state.examTitle;
    if (code) code.textContent = state.examCode;
  }

  window.openMockOperations = async function (examCode, examTitle) {
    state.examCode = String(examCode || "").toUpperCase();
    state.examTitle = examTitle || state.examCode;
    state.pendingCandidates = [];
    state.search = "";
    var search = byId("mock-candidate-search");
    if (search) search.value = "";
    showOperationsView();
    showImportStatus("Chưa chọn tệp", false);
    try {
      await ensureExamRecord();
      await loadDashboard();
    } catch (error) {
      console.error("Không mở được trung tâm vận hành:", error);
    }
  };

  window.closeMockOperations = function () {
    var management = byId("exams-management-view");
    var operations = byId("mock-operations-view");
    if (operations) operations.hidden = true;
    if (management) management.style.display = "block";
    var shell = document.querySelector(".teacher-shell");
    if (shell) shell.classList.remove("mock-ops-mobile-focus");
    if (typeof window.renderExamsList === "function") window.renderExamsList();
  };

  function findValue(row, aliases) {
    var normalized = {};
    Object.keys(row || {}).forEach(function (key) { normalized[normalizeHeader(key)] = row[key]; });
    for (var index = 0; index < aliases.length; index++) {
      if (normalized[aliases[index]] !== undefined && normalized[aliases[index]] !== "") return normalized[aliases[index]];
    }
    return "";
  }

  function mapRowsToCandidates(rows) {
    return (rows || []).map(function (row) {
      return {
        fullName: String(findValue(row, ["ho va ten", "ho ten", "ten thi sinh", "full name", "name"]) || "").trim(),
        phone: normalizePhone(findValue(row, ["so dien thoai", "sdt", "dien thoai", "phone", "ma du thi", "ma dinh danh"])),
        dateOfBirth: String(findValue(row, ["ngay sinh", "date of birth", "dob"]) || "").trim(),
        gender: String(findValue(row, ["gioi tinh", "gender", "sex"]) || "").trim(),
        idNumber: String(findValue(row, ["so cccd", "cccd", "cmnd", "id number", "can cuoc cong dan"]) || "").trim(),
        email: String(findValue(row, ["email", "e mail"]) || "").trim(),
        school: String(findValue(row, ["truong", "truong hoc", "school"]) || "").trim(),
        className: String(findValue(row, ["lop", "class", "class name"]) || "").trim(),
        province: String(findValue(row, ["tinh thanh", "tinh thanh pho", "dia chi", "province"]) || "").trim(),
        note: String(findValue(row, ["ghi chu", "note"]) || "").trim(),
        metadata: row
      };
    }).filter(function (candidate) { return candidate.fullName || candidate.phone; });
  }

  function renderImportPreview(candidates) {
    var preview = byId("mock-import-preview");
    if (!preview) return;
    preview.hidden = false;
    var rows = candidates.slice(0, 6).map(function (candidate) {
      return '<tr><td>' + escapeHtml(candidate.fullName || "--") + '</td><td>' + escapeHtml(candidate.phone || "Không hợp lệ") + '</td><td>' + escapeHtml(candidate.school || "--") + '</td><td>' + escapeHtml(candidate.className || "--") + '</td></tr>';
    }).join("");
    preview.innerHTML = '<table class="mock-preview-table"><thead><tr><th>Họ và tên</th><th>Số điện thoại</th><th>Trường</th><th>Lớp</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  async function readCandidateFile(file) {
    if (!window.XLSX) throw new Error("Thư viện đọc Excel chưa tải xong. Vui lòng thử lại.");
    var buffer = await file.arrayBuffer();
    var workbook = window.XLSX.read(buffer, { type: "array", cellDates: true });
    if (!workbook.SheetNames.length) throw new Error("Tệp Excel không có trang dữ liệu.");
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var rows = window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    if (!rows.length) throw new Error("Tệp không có dòng thí sinh.");
    return mapRowsToCandidates(rows);
  }

  function downloadTemplate() {
    var rows = [
      { "Họ và tên": "Nguyễn Văn An", "Số điện thoại": "0912345678", "Ngày sinh": "15/08/2008", "Giới tính": "Nam", "Số CCCD": "", "Email": "", "Trường": "THPT A", "Lớp": "12A1", "Tỉnh/Thành": "Hà Nội", "Ghi chú": "" },
      { "Họ và tên": "Trần Minh Anh", "Số điện thoại": "0987654321", "Ngày sinh": "03/11/2008", "Giới tính": "Nữ", "Số CCCD": "", "Email": "", "Trường": "THPT B", "Lớp": "12A2", "Tỉnh/Thành": "Hải Phòng", "Ghi chú": "" }
    ];
    if (window.XLSX) {
      var sheet = window.XLSX.utils.json_to_sheet(rows);
      sheet["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 24 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 20 }];
      var workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, sheet, "Danh sách thí sinh");
      window.XLSX.writeFile(workbook, "TMA-mau-danh-sach-thi-sinh.xlsx");
      return;
    }
    var csv = "Họ và tên,Số điện thoại,Ngày sinh,Giới tính,Số CCCD,Email,Trường,Lớp,Tỉnh/Thành,Ghi chú\r\nNguyễn Văn An,0912345678,15/08/2008,Nam,,,THPT A,12A1,Hà Nội,";
    var url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "TMA-mau-danh-sach-thi-sinh.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function publishResults(published, releaseAt, button) {
    var restore = setButtonBusy(button, true, "Đang lưu...");
    try {
      await window.TMAMockAdmin.publish(state.examCode, published, releaseAt || null);
      await loadDashboard();
    } catch (error) {
      window.alert(error.message || "Không cập nhật được trạng thái công bố.");
    } finally {
      restore();
    }
  }

  function bindEvents() {
    var back = byId("mock-ops-back");
    if (back) back.addEventListener("click", window.closeMockOperations);
    var refresh = byId("mock-ops-refresh");
    if (refresh) refresh.addEventListener("click", function () { loadDashboard().catch(function () {}); });
    var choose = byId("mock-choose-file");
    var fileInput = byId("mock-candidate-file");
    if (choose && fileInput) choose.addEventListener("click", function () { fileInput.click(); });
    if (fileInput) fileInput.addEventListener("change", async function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      showImportStatus("Đang đọc " + file.name + "...", false);
      try {
        state.pendingCandidates = await readCandidateFile(file);
        renderImportPreview(state.pendingCandidates);
        showImportStatus(file.name + " · " + state.pendingCandidates.length + " dòng dữ liệu", true);
        byId("mock-import-candidates").disabled = state.pendingCandidates.length === 0;
      } catch (error) {
        state.pendingCandidates = [];
        byId("mock-import-candidates").disabled = true;
        showImportStatus(error.message || "Không đọc được tệp.", false);
      }
    });
    var importButton = byId("mock-import-candidates");
    if (importButton) importButton.addEventListener("click", async function () {
      if (!state.pendingCandidates.length) return;
      var restore = setButtonBusy(importButton, true, "Đang nhập...");
      try {
        var result = await window.TMAMockAdmin.importCandidates(state.examCode, state.pendingCandidates, false);
        showImportStatus("Đã nhập/cập nhật " + result.imported + " thí sinh" + (result.invalidRows && result.invalidRows.length ? " · Bỏ qua " + result.invalidRows.length + " dòng lỗi" : ""), true);
        state.pendingCandidates = [];
        byId("mock-import-preview").hidden = true;
        await loadDashboard();
      } catch (error) {
        showImportStatus(error.message || "Không nhập được danh sách.", false);
      } finally {
        restore();
        importButton.disabled = state.pendingCandidates.length === 0;
      }
    });
    var template = byId("mock-download-template");
    if (template) template.addEventListener("click", downloadTemplate);
    var search = byId("mock-candidate-search");
    if (search) search.addEventListener("input", function () { state.search = search.value; renderCandidates(); });

    var toggleRoom = byId("mock-toggle-room");
    if (toggleRoom) toggleRoom.addEventListener("click", async function () {
      var isOpen = Boolean(state.dashboard && state.dashboard.exam && state.dashboard.exam.isOpen);
      var restore = setButtonBusy(toggleRoom, true, "Đang cập nhật...");
      try {
        if (typeof window.toggleExamOpen === "function") await window.toggleExamOpen(state.examCode, !isOpen);
        await window.TMAMockAdmin.upsertExam({ examCode: state.examCode, title: state.examTitle, category: categoryFromCode(state.examCode), isOpen: !isOpen });
        await loadDashboard();
      } catch (error) {
        window.alert(error.message || "Không cập nhật được phòng thi.");
      } finally {
        restore();
      }
    });

    var schedule = byId("mock-schedule-release");
    if (schedule) schedule.addEventListener("click", function () {
      var value = byId("mock-release-at").value;
      if (!value) {
        window.alert("Vui lòng chọn thời điểm công bố.");
        return;
      }
      publishResults(false, new Date(value).toISOString(), schedule);
    });
    var publish = byId("mock-publish-now");
    if (publish) publish.addEventListener("click", function () {
      if (window.confirm("Công bố điểm ngay cho tất cả thí sinh đã nộp bài?")) publishResults(true, null, publish);
    });
    var hide = byId("mock-hide-results");
    if (hide) hide.addEventListener("click", function () { publishResults(false, null, hide); });

    var exportButton = byId("mock-export-csv");
    if (exportButton) exportButton.addEventListener("click", async function () {
      var restore = setButtonBusy(exportButton, true, "Đang xuất...");
      try { await window.TMAMockAdmin.downloadCsv(state.examCode); }
      catch (error) { window.alert(error.message || "Không xuất được CSV."); }
      finally { restore(); }
    });
    var sheetButton = byId("mock-sync-sheet");
    if (sheetButton) sheetButton.addEventListener("click", async function () {
      var restore = setButtonBusy(sheetButton, true, "Đang đồng bộ...");
      try {
        var result = await window.TMAMockAdmin.syncSheet(state.examCode);
        if (result.sheetUrl) window.open(result.sheetUrl, "_blank", "noopener");
        else window.alert("Đã gửi dữ liệu sang Google Sheets.");
      } catch (error) {
        if (error.status === 501) {
          await window.TMAMockAdmin.downloadCsv(state.examCode);
          window.open("https://sheets.new", "_blank", "noopener");
        } else {
          window.alert(error.message || "Không đồng bộ được Google Sheets.");
        }
      } finally {
        restore();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindEvents);
  else bindEvents();
})();
