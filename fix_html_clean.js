const fs = require('fs');

function cleanHtmlFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const startMarker = '<div class="btn-row" id="reading-editor-save-btn-row">';
  const endMarker = '<!-- LMS COURSE MODAL (ADD / EDIT) -->';

  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find markers in ' + filePath, startIdx, endIdx);
    return;
  }

  const cleanSection = startMarker + `
                  <button class="btn btn-primary" type="button" data-save-question="reading">Lưu câu hỏi</button>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; display: none;">
                  <span style="font-weight:600; font-size:14px; color:#475569;">Câu hỏi đi kèm:</span>
                  <button class="btn btn-danger btn-small" type="button" onclick="clearAllQuestions('reading')" style="display: none; margin:0; padding:4px 8px; font-size:11px; font-weight:700;">Xóa tất cả câu hỏi</button>
                </div>
                <div class="table-wrap" style="margin-top:8px; display: none;">
                  <table>
                    <thead><tr><th>Câu</th><th>Nội dung</th><th>Mẫu</th><th>Hành động</th></tr></thead>
                    <tbody id="reading-question-list"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </article>
        </section>

        <!-- SECTION: SCIENCE -->
        <section class="tab-panel" id="tab-science">
          <div class="science-tabs-nav" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
            <button class="science-tab-btn active" id="science-tab-btn-g1" type="button" onclick="switchScienceGroupTab('g1')">Ngữ liệu 1</button>
            <button class="science-tab-btn" id="science-tab-btn-g2" type="button" onclick="switchScienceGroupTab('g2')">Ngữ liệu 2</button>
            <button class="science-tab-btn" id="science-tab-btn-g3" type="button" onclick="switchScienceGroupTab('g3')">Ngữ liệu 3</button>
            <button class="science-tab-btn" id="science-tab-btn-g4" type="button" onclick="switchScienceGroupTab('g4')">Ngữ liệu 4</button>
            <button class="science-tab-btn" id="science-tab-btn-g5" type="button" onclick="switchScienceGroupTab('g5')">Ngữ liệu 5</button>
            <button class="science-tab-btn" id="science-tab-btn-g6" type="button" onclick="switchScienceGroupTab('g6')">Ngữ liệu 6</button>
            <button class="science-tab-btn" id="science-tab-btn-g7" type="button" onclick="switchScienceGroupTab('g7')">Ngữ liệu 7</button>
            <button class="science-tab-btn" id="science-tab-btn-g8" type="button" onclick="switchScienceGroupTab('g8')">Ngữ liệu 8</button>
          </div>
          <article class="card">
            <div class="card-body passage-layout">
              <div>
                <div class="eyebrow">Cột trái: dữ liệu khoa học</div>
                <div class="wizard-nav-wrap" style="background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: 800; font-size: 13px; color: var(--text);">Câu hỏi của ngữ liệu:</span>
                    <span id="science-wizard-progress" style="font-weight: 700; font-size: 11px; color: var(--brand);">Tiến độ: 0/5 câu đã soạn</span>
                  </div>
                  <div id="science-wizard-grid" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
                </div>
                <form id="science-group-form" onsubmit="return false;"></form>
                <div class="btn-row" style="display: none;">
                  <button class="btn btn-outline" type="button" data-new-group="science">Thêm dữ liệu</button>
                  <button class="btn btn-primary" type="button" data-save-group="science">Lưu dữ liệu</button>
                </div>
                <div class="mini-list" id="science-group-list" style="display: none; margin-top:16px;"></div>
              </div>
              <div>
                <div class="eyebrow">Cột phải: câu hỏi của dữ liệu</div>
                <form id="science-question-form" onsubmit="return false;"></form>
                <div class="btn-row" id="science-editor-save-btn-row">
                  <button class="btn btn-primary" type="button" data-save-question="science">Lưu câu hỏi</button>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; display: none;">
                  <span style="font-weight:600; font-size:14px; color:#475569;">Câu hỏi đi kèm:</span>
                  <button class="btn btn-danger btn-small" type="button" onclick="clearAllQuestions('science')" style="display: none; margin:0; padding:4px 8px; font-size:11px; font-weight:700;">Xóa tất cả câu hỏi</button>
                </div>
                <div class="table-wrap" style="margin-top:8px; display: none;">
                  <table>
                    <thead><tr><th>Câu</th><th>Nội dung</th><th>Mẫu</th><th>Hành động</th></tr></thead>
                    <tbody id="science-question-list"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </article>
        </section>

        <!-- SECTION: EXPORT -->
        <section class="tab-panel" id="tab-export">
          <article class="card">
            <div class="card-header">
              <div>
                <h2>Lưu và xuất đề</h2>
                <p style="margin: 4px 0 0; color: var(--muted);">Xuất file JSON hoặc lưu đề thi vào hệ thống</p>
              </div>
            </div>
            <div class="card-body">
              <div class="summary-grid" id="export-summary"></div>
              <div class="btn-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-primary" type="button" id="download-exam-button">Tải JSON đề (Đủ 3 phần)</button>
                <button class="btn btn-outline" type="button" id="import-exam-button" style="background-color: #f59e0b; border-color: #d97706; color: #ffffff;">Nhập JSON đề (Đủ 3 phần)</button>
                <button class="btn btn-outline" type="button" id="download-index-button">Tải index.json</button>
                <button class="btn btn-soft" type="button" id="save-project-button">Lưu vào thư mục dự án</button>
                <button class="btn btn-primary" style="background-color: #15803d; border-color: #15803d;" type="button" id="upload-supabase-button">Lưu lên Supabase Cloud</button>
              </div>

              <div class="hero-note" style="margin-top:16px;">
                Nếu trình duyệt không hỗ trợ ghi thư mục, hãy tải file JSON rồi đặt thủ công:
                <br>Đề: <code>data/exams/[exam_code].json</code>
                <br>Danh sách đề: <code>data/exams/index.json</code>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  </div>

  `;

  html = html.slice(0, startIdx) + cleanSection + html.slice(endIdx);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('🎉 Cleaned ' + filePath + ' 100%!');
}

cleanHtmlFile('teacher.html');
cleanHtmlFile('deploy-web/teacher.html');
