document.querySelectorAll("[data-exam]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = button.dataset.exam;
  });
});

document.querySelector('[data-action="back"]').addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  }
});

document.querySelector('[data-action="finish"]').addEventListener("click", () => {
  window.alert("Đây là giao diện demo. Hệ thống thật sẽ xử lý thao tác hoàn thành kíp thi.");
});
