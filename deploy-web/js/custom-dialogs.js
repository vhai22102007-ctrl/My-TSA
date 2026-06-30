// js/custom-dialogs.js - Custom elegant replacement for browser alert() and confirm()
(function () {
  "use strict";

  // Inject CSS Styles for Custom Dialogs
  const css = `
    .custom-dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.25s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .custom-dialog-backdrop.is-active {
      opacity: 1;
    }
    .custom-dialog-box {
      background: #ffffff;
      border-radius: 14px;
      width: 440px;
      max-width: 90%;
      padding: 24px;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1), 
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      transform: scale(0.92);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .custom-dialog-backdrop.is-active .custom-dialog-box {
      transform: scale(1);
    }
    .custom-dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .custom-dialog-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fee2e2;
      color: #ef4444;
      flex-shrink: 0;
    }
    .custom-dialog-icon.info {
      background: #e0f2fe;
      color: #0284c7;
    }
    .custom-dialog-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }
    .custom-dialog-message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0;
      white-space: pre-line;
    }
    .custom-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
    }
    .custom-dialog-btn {
      padding: 9px 18px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;
    }
    .custom-dialog-btn-cancel {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #475569;
    }
    .custom-dialog-btn-cancel:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    .custom-dialog-btn-ok {
      background: #dc2626;
      color: #ffffff;
    }
    .custom-dialog-btn-ok:hover {
      background: #b91c1c;
    }
    
    /* Dark Theme Support */
    html[data-theme="dark"] .custom-dialog-box {
      background: #1e293b;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.3), 
        0 10px 10px -5px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    }
    html[data-theme="dark"] .custom-dialog-title {
      color: #f8fafc;
    }
    html[data-theme="dark"] .custom-dialog-message {
      color: #cbd5e1;
    }
    html[data-theme="dark"] .custom-dialog-btn-cancel {
      background: #334155;
      border-color: #475569;
      color: #cbd5e1;
    }
    html[data-theme="dark"] .custom-dialog-btn-cancel:hover {
      background: #475569;
      color: #f8fafc;
    }
  `;

  // Inject CSS style
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // SVG Icons
  const infoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  const confirmSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `;

  // General showDialog helper
  function showDialog({ title, message, isConfirm, resolveValue }) {
    return new Promise((resolve) => {
      // Create element
      const backdrop = document.createElement("div");
      backdrop.className = "custom-dialog-backdrop";

      const box = document.createElement("div");
      box.className = "custom-dialog-box";

      const header = document.createElement("div");
      header.className = "custom-dialog-header";

      const icon = document.createElement("div");
      icon.className = `custom-dialog-icon ${isConfirm ? "confirm" : "info"}`;
      icon.innerHTML = isConfirm ? confirmSvg : infoSvg;

      const titleEl = document.createElement("h3");
      titleEl.className = "custom-dialog-title";
      titleEl.textContent = title;

      header.appendChild(icon);
      header.appendChild(titleEl);

      const msgEl = document.createElement("p");
      msgEl.className = "custom-dialog-message";
      msgEl.textContent = message;

      const actions = document.createElement("div");
      actions.className = "custom-dialog-actions";

      // OK Button
      const okBtn = document.createElement("button");
      okBtn.className = "custom-dialog-btn custom-dialog-btn-ok";
      okBtn.textContent = isConfirm ? "Xác nhận" : "Đóng";
      okBtn.type = "button";

      // Cancel Button (for confirm)
      let cancelBtn = null;
      if (isConfirm) {
        cancelBtn = document.createElement("button");
        cancelBtn.className = "custom-dialog-btn custom-dialog-btn-cancel";
        cancelBtn.textContent = "Hủy";
        cancelBtn.type = "button";
        actions.appendChild(cancelBtn);
      }

      actions.appendChild(okBtn);

      box.appendChild(header);
      box.appendChild(msgEl);
      box.appendChild(actions);
      backdrop.appendChild(box);
      document.body.appendChild(backdrop);

      // Trigger transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          backdrop.classList.add("is-active");
          // Focus OK button for convenience
          okBtn.focus();
        });
      });

      // Cleanup and resolve
      function close(val) {
        backdrop.classList.remove("is-active");
        setTimeout(() => {
          backdrop.remove();
          resolve(val);
        }, 250);
      }

      okBtn.addEventListener("click", () => close(resolveValue ?? true));
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => close(false));
      }

      // Close on backdrop click (for alert only, or default to cancel for confirm)
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          close(isConfirm ? false : true);
        }
      });

      // ESC key to close
      const escListener = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", escListener);
          close(isConfirm ? false : true);
        }
      };
      document.addEventListener("keydown", escListener);
    });
  }

  // Define window functions
  window.showCustomAlert = function (message, title = "Thông báo") {
    return showDialog({
      title: title,
      message: message,
      isConfirm: false,
      resolveValue: true
    });
  };

  window.showCustomConfirm = function (message, title = "Xác nhận") {
    return showDialog({
      title: title,
      message: message,
      isConfirm: true,
      resolveValue: true
    });
  };

  // Override window.alert
  // Since alert is natively synchronous, this override will run asynchronously.
  // Code after alert() will continue executing immediately without waiting for OK,
  // except where we explicitly await showCustomAlert(...)
  window.alert = function (message) {
    console.log("Custom alert triggered: ", message);
    window.showCustomAlert(String(message));
  };

  window.showCustomPrompt = function (message) {
    return new Promise((resolve) => {
      const val = prompt(message);
      resolve(val);
    });
  };
})();
