const examData = {
  math: {
    title: "[SHIBA]-Tư Duy Toán Học-Đề CK 1",
    studentName: "Nguyễn Văn Hải",
    duration: "60 phút",
    totalQuestions: "40 câu",
    target: "exam-math.html"
  },
  reading: {
    title: "[SHIBA]-Tư Duy Đọc Hiểu-Đề CK 1",
    studentName: "Nguyễn Văn Hải",
    duration: "20 phút",
    totalQuestions: "40 câu",
    target: "exam-reading.html"
  },
  science: {
    title: "[SHIBA]-Tư Duy Khoa Học & Giải Quyết Vấn Đề-Đề CK 1",
    studentName: "Nguyễn Văn Hải",
    duration: "60 phút",
    totalQuestions: "40 câu",
    target: "exam-science.html"
  }
};

const PROGRESS_DURATION_MS = 1500;
const part = new URLSearchParams(window.location.search).get("part");
const selectedExam = examData[part] || examData.math;
const elements = {
  checkingPanel: document.querySelector(".checking-panel"),
  examDuration: document.getElementById("exam-duration"),
  examTitle: document.getElementById("exam-title"),
  startButton: document.querySelector('[data-action="start"]'),
  studentName: document.getElementById("student-name"),
  totalQuestions: document.getElementById("total-questions")
};

function renderExamInformation() {
  elements.studentName.textContent = selectedExam.studentName;
  elements.examTitle.textContent = selectedExam.title;
  elements.examDuration.textContent = selectedExam.duration;
  elements.totalQuestions.textContent = selectedExam.totalQuestions;
}

function tryEnterFullscreen() {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    return document.documentElement.requestFullscreen().catch(() => {
      // Trình duyệt có thể chặn fullscreen. Flow vào phòng thi vẫn tiếp tục.
    });
  }

  return Promise.resolve();
}

function startExam() {
  tryEnterFullscreen();
  elements.startButton.hidden = true;
  elements.checkingPanel.hidden = false;

  window.requestAnimationFrame(() => {
    elements.checkingPanel.classList.add("is-running");
  });

  window.setTimeout(() => {
    window.location.href = selectedExam.target;
  }, PROGRESS_DURATION_MS);
}

elements.startButton.addEventListener("click", startExam);

document.querySelector('[data-action="back"]').addEventListener("click", () => {
  window.location.href = "select.html";
});

document.querySelector('[data-action="guide"]').addEventListener("click", (event) => {
  event.preventDefault();
  window.alert("Đây là giao diện demo. Đội IT sẽ nối nội dung hướng dẫn thật của hệ thống.");
});

renderExamInformation();
