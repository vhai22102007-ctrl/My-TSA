// script.js – Handles dark mode toggle and placeholder upload to Google Drive

// Dark‑mode toggle
const darkToggle = document.getElementById('darkToggle');
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    // Optional: store preference in localStorage
    localStorage.setItem('theme', html.dataset.theme);
  });
  // Restore saved theme on load
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
  }
}

// Upload to Drive placeholder (teacher page)
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(uploadForm);
    // TODO: Replace URL with real Google Drive endpoint & add auth token
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
        // headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      alert('Upload thành công!');
      // Refresh file list (placeholder implementation)
      const fileList = document.getElementById('fileList');
      if (fileList) {
        const li = document.createElement('p');
        li.textContent = `✅ ${formData.get('file').name}`;
        fileList.appendChild(li);
      }
    } catch (err) {
      alert('Lỗi upload: ' + err.message);
    }
  });
}
