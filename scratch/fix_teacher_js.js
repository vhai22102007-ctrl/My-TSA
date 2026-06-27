const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'js', 'teacher-page.js');
let content = fs.readFileSync(jsPath, 'utf8');

// Find boundary start
const startMarker = '<span class="${examItem.badge}">${examItem.label}</span>';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find startMarker in js/teacher-page.js!");
  process.exit(1);
}

// Find boundary end
const endMarker = 'else if (tabId === "exams") {';
const endIndex = content.indexOf(endMarker);
if (endIndex === -1) {
  console.error("Could not find endMarker in js/teacher-page.js!");
  process.exit(1);
}

// Replacement string containing restored code and the new LMS tab routing
const replacement = `<span class="\${examItem.badge}">\${examItem.label}</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Thời gian đăng ký:</span>
              <span class="info-value">Hằng ngày</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Lệ phí:</span>
              <span class="info-value font-bold">Miễn phí</span>
            </div>
            <div class="exam-info-row">
              <span class="info-label">Thời gian thi:</span>
              <span class="info-value">Hằng ngày</span>
            </div>
          </div>
          <footer class="exam-card-footer">
            <button class="btn btn-sm btn-primary" style="font-weight: 800;" onclick="startEditingExam('\${examItem.title}', '\${examItem.code}')">Chỉnh sửa</button>
          </footer>
        \`;
        grid.appendChild(card);
      });
    }

    function switchSystemTab(tabId) {
      // Show correct dashboard panel
      document.querySelectorAll("#dashboard-container .tab-panel").forEach(function(panel) {
        panel.classList.toggle("active", panel.id === "tab-" + tabId);
      });

      // Update sidebar nav active states
      if (tabId === "approve-students" || tabId === "manage-students" || tabId === "manage-documents" || tabId === "manage-courses" || tabId === "activation-codes") {
        document.querySelectorAll("#sidebar-normal-nav .nav-button").forEach(function(btn) {
          var target = btn.getAttribute("data-tab-target");
          btn.classList.toggle("active", target === tabId);
        });
        document.querySelectorAll(".submenu-item").forEach(function(item) {
          item.classList.remove("active");
        });
        document.querySelectorAll(".menu-group").forEach(function(g) {
          g.classList.remove("has-active");
        });
      }

      if (tabId === "practice") {
        renderPracticeRoom();
      } `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(jsPath, newContent, 'utf8');
console.log("js/teacher-page.js successfully patched and restored!");
