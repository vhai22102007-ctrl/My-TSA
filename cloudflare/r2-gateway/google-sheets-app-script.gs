/**
 * Google Apps Script webhook for TMA mock-exam results.
 *
 * Deploy this file as a Web app that executes as you, then store the Web app URL
 * in the Worker secret GOOGLE_SHEETS_WEBHOOK_URL. The URL itself is treated as a
 * secret and is never sent to the browser.
 */
function doPost(event) {
  try {
    var payload = JSON.parse((event && event.postData && event.postData.contents) || "{}");
    var exam = payload.exam || {};
    var rows = Array.isArray(payload.results)
      ? payload.results
      : (Array.isArray(payload.candidates) ? payload.candidates : []);
    var spreadsheet = getOrCreateSpreadsheet_();
    var examCode = pick_(exam, "examCode", "exam_code") || "KY THI";
    var sheet = getOrCreateSheet_(spreadsheet, examCode);

    var values = [[
      "STT",
      "Ma ky thi",
      "Ho va ten",
      "So dien thoai",
      "Ngay sinh",
      "Email",
      "Truong",
      "Lop",
      "Tinh/Thanh pho",
      "Trang thai",
      "Diem",
      "So cau dung",
      "Tong so cau",
      "Xep hang",
      "Nop luc"
    ]];

    rows.forEach(function (row, index) {
      var submittedAt = pick_(row, "submittedAt", "submitted_at");
      var gradingPending = pick_(row, "gradingStatus", "grading_status") === "pending";
      values.push([
        index + 1,
        examCode,
        safeCell_(pick_(row, "fullName", "full_name")),
        safeCell_(row.phone),
        safeCell_(pick_(row, "dateOfBirth", "date_of_birth")),
        safeCell_(row.email),
        safeCell_(row.school),
        safeCell_(pick_(row, "className", "class_name")),
        safeCell_(row.province),
        gradingPending ? "Cho cham" : (submittedAt ? "Da nop" : "Chua nop"),
        gradingPending ? "" : numberOrBlank_(row.score),
        gradingPending ? "" : numberOrBlank_(pick_(row, "correctCount", "correct_count")),
        gradingPending ? "" : numberOrBlank_(pick_(row, "totalQuestions", "total_questions")),
        submittedAt && !gradingPending ? index + 1 : "",
        safeCell_(submittedAt)
      ]);
    });

    sheet.clear();
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    formatResultsSheet_(sheet, values.length, values[0].length);
    updateSummarySheet_(spreadsheet, exam, payload.stats || {}, rows.length);
    SpreadsheetApp.flush();

    return jsonResponse_({
      success: true,
      sheetUrl: spreadsheet.getUrl(),
      sheetName: sheet.getName(),
      rows: rows.length
    });
  } catch (error) {
    return jsonResponse_({ success: false, message: String(error && error.message || error) });
  }
}

function getOrCreateSpreadsheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty("TMA_RESULTS_SPREADSHEET_ID");
  if (spreadsheetId) {
    try {
      return SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      properties.deleteProperty("TMA_RESULTS_SPREADSHEET_ID");
    }
  }

  var spreadsheet = SpreadsheetApp.create("TMA - Ket qua thi thu");
  properties.setProperty("TMA_RESULTS_SPREADSHEET_ID", spreadsheet.getId());
  return spreadsheet;
}

function getOrCreateSheet_(spreadsheet, examCode) {
  var name = String(examCode || "KY THI")
    .replace(/[\\/?*\[\]:]/g, "-")
    .trim()
    .slice(0, 80) || "KY THI";
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function updateSummarySheet_(spreadsheet, exam, stats, resultCount) {
  var sheet = spreadsheet.getSheetByName("TONG QUAN") || spreadsheet.insertSheet("TONG QUAN", 0);
  var values = [
    ["TMA - TONG QUAN KY THI", ""],
    ["Ma ky thi", pick_(exam, "examCode", "exam_code") || ""],
    ["Ten ky thi", exam.title || ""],
    ["Da dang ky", numberOrBlank_(stats.registered)],
    ["Da nop bai", numberOrBlank_(stats.submitted || resultCount)],
    ["Diem trung binh", numberOrBlank_(stats.average)],
    ["Trung vi", numberOrBlank_(stats.median)],
    ["Cao nhat", numberOrBlank_(stats.highest)],
    ["Thap nhat", numberOrBlank_(stats.lowest)],
    ["Cap nhat luc", new Date()]
  ];
  sheet.clear();
  sheet.getRange(1, 1, values.length, 2).setValues(values);
  sheet.getRange(1, 1, 1, 2).merge().setFontWeight("bold").setFontSize(15).setBackground("#c91f2c").setFontColor("#ffffff");
  sheet.getRange(2, 1, values.length - 1, 1).setFontWeight("bold").setBackground("#f4f6f8");
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 320);
  sheet.setFrozenRows(1);
}

function formatResultsSheet_(sheet, rowCount, columnCount) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columnCount)
    .setFontWeight("bold")
    .setBackground("#c91f2c")
    .setFontColor("#ffffff");
  sheet.getRange(1, 1, rowCount, columnCount).setVerticalAlignment("middle");
  if (rowCount > 1) {
    sheet.getRange(2, 1, rowCount - 1, columnCount).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    sheet.getRange(2, 4, rowCount - 1, 1).setNumberFormat("@");
    sheet.getRange(2, 11, rowCount - 1, 1).setNumberFormat("0.00");
  }
  sheet.autoResizeColumns(1, columnCount);
  sheet.setColumnWidth(3, Math.max(sheet.getColumnWidth(3), 190));
  sheet.setColumnWidth(4, Math.max(sheet.getColumnWidth(4), 130));
}

function safeCell_(value) {
  var text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function pick_(object, primaryKey, fallbackKey) {
  if (!object) return "";
  if (object[primaryKey] !== undefined && object[primaryKey] !== null) return object[primaryKey];
  return object[fallbackKey] !== undefined && object[fallbackKey] !== null ? object[fallbackKey] : "";
}

function numberOrBlank_(value) {
  return value === null || value === undefined || value === "" || !isFinite(Number(value)) ? "" : Number(value);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
