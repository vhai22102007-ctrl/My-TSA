const fs = require('fs');
let html = fs.readFileSync('teacher.html', 'utf8');

const s = '<section class="tab-panel" id="tab-export">';
const e = '<!-- Profile Detail Modal -->';

const i1 = html.indexOf(s);
const i2 = html.indexOf(e);

if (i1 !== -1 && i2 !== -1) {
  const cleanExport = s + `
          <article class="card">
            <div class="card-header">
              <div>
                <h2>Lưu và xuất đề</h2>
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
  </div>\n\n  `;

  html = html.slice(0, i1) + cleanExport + html.slice(i2);
  fs.writeFileSync('teacher.html', html, 'utf8');
  console.log('🎉 Cleaned tab-export in teacher.html!');
} else {
  console.error('Could not find indices!');
}
