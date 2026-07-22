const fs = require('fs');
let html = fs.readFileSync('teacher.html', 'utf8');

const s = '<div id="subtab-manage-links" class="system-subtab-panel" style="display: none; padding-top: 10px;">';
const e = '<div id="subtab-security-logs" class="system-subtab-panel" style="display: none; padding-top: 10px;">';

const i1 = html.indexOf(s);
const i2 = html.lastIndexOf(e);

if (i1 !== -1 && i2 !== -1) {
  const cleanBlock = s + `
          <div class="topbar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <button class="btn-topbar-toggle" type="button" onclick="toggleSidebar()" title="Thu gọn / Mở rộng thanh bên">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                  <line x1="13" y1="10" x2="21" y2="10"></line><line x1="13" y1="14" x2="21" y2="14"></line>
                  <polygon points="10,10 6,12 10,14" fill="currentColor" stroke="none"></polygon>
                </svg>
              </button>
              <h1>Cấu hình liên kết</h1>
            </div>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: none; box-shadow: var(--shadow); margin-top: 20px;">
            <form id="social-links-form" style="display: flex; flex-direction: column; gap: 20px; max-width: 600px;">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  <label style="font-weight: 700; font-size: 13.5px; color: #1e293b;">Facebook Link</label>
                </div>
                <div style="display: flex; gap: 12px;">
                  <input type="text" id="link-fb-text" placeholder="Tên hiển thị" style="flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                  <input type="url" id="link-fb-url" placeholder="Đường dẫn URL" style="flex: 2; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                  <label style="font-weight: 700; font-size: 13.5px; color: #1e293b;">YouTube Link</label>
                </div>
                <div style="display: flex; gap: 12px;">
                  <input type="text" id="link-yt-text" placeholder="Tên hiển thị" style="flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                  <input type="url" id="link-yt-url" placeholder="Đường dẫn URL" style="flex: 2; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  <label style="font-weight: 700; font-size: 13.5px; color: #1e293b;">Tiktok Link</label>
                </div>
                <div style="display: flex; gap: 12px;">
                  <input type="text" id="link-tk-text" placeholder="Tên hiển thị" style="flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                  <input type="url" id="link-tk-url" placeholder="Đường dẫn URL" style="flex: 2; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c2272d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  <label style="font-weight: 700; font-size: 13.5px; color: #1e293b;">Messenger Link</label>
                </div>
                <div style="display: flex; gap: 12px;">
                  <input type="text" id="link-msg-text" placeholder="Tên hiển thị" style="flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                  <input type="url" id="link-msg-url" placeholder="Đường dẫn URL" style="flex: 2; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px;" required>
                </div>
              </div>
              <div style="margin-top: 10px;">
                <button type="submit" style="padding: 12px 24px; font-size: 13.5px; font-weight: 700; background: #c2272d; border: none; border-radius: 8px; color: white; cursor: pointer;">Lưu cấu hình</button>
              </div>
            </form>
          </div>
        </div>\n\n`;

  html = html.slice(0, i1) + cleanBlock + html.slice(i2);
  fs.writeFileSync('teacher.html', html, 'utf8');
  console.log('🎉 Cleaned teacher.html completely!');
} else {
  console.error('Could not find indices!');
}
