const fs = require('fs');

// ===== UPDATE CSS FILE =====
let css = fs.readFileSync('css/select-page.css', 'utf8');

const detailCardsCSS = `
    /* ===== CLASSROOM DETAILS & RATINGS BOXES ===== */
    .study-classroom-details-container {
      background: #f8fafc;
      width: 100%;
    }

    .study-detail-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .study-card-heading {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px;
    }

    /* Teacher layout */
    .study-teacher-profile-layout {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .study-teacher-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      min-width: 130px;
    }

    .study-teacher-avatar-backing {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
    }

    .study-teacher-avatar-backing img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .study-teacher-stats {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-start;
      width: 100%;
      padding-left: 10px;
    }

    .study-stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #475569;
      font-weight: 600;
    }

    .study-teacher-right {
      flex: 1;
      min-width: 200px;
    }

    .study-teacher-name-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f5a9e;
      margin: 0 0 4px;
    }

    .study-teacher-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 10px;
      font-weight: 500;
    }

    .study-teacher-bio {
      font-size: 13px;
      color: #374151;
      line-height: 1.5;
      margin: 0;
    }

    /* Rating overview block */
    .rating-overview-row {
      display: flex;
      gap: 32px;
      align-items: center;
      flex-wrap: wrap;
    }

    .rating-big-number {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .rating-num {
      font-size: 54px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1;
    }

    .rating-stars-row {
      color: #f59e0b;
      font-size: 16px;
      margin: 6px 0;
    }

    .star-active {
      color: #f59e0b;
    }

    .rating-count-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .rating-bars-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 220px;
    }

    .rating-bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
    }

    .rating-bar-track {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      max-width: 240px;
    }

    .rating-bar-fill {
      height: 100%;
      background: #10b981;
      border-radius: 4px;
    }

    .rating-row-stars {
      color: #f59e0b;
      display: flex;
      gap: 1px;
      min-width: 60px;
    }

    .rating-row-stars .star-empty {
      color: #cbd5e1;
    }

    .rating-pct-label {
      color: #64748b;
      font-weight: 600;
      min-width: 32px;
      text-align: right;
    }

    /* Comment item */
    .study-comment-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
    }

    .comment-avatar-backing {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .comment-content-area {
      flex: 1;
    }

    .comment-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .comment-author-name {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }

    .comment-stars {
      color: #f59e0b;
      font-size: 11px;
    }

    .comment-text-body {
      font-size: 12.5px;
      color: #475569;
      line-height: 1.4;
      margin: 0;
    }
`;

css += detailCardsCSS;
fs.writeFileSync('css/select-page.css', css, 'utf8');
console.log('Appended review and teacher layout CSS successfully.');
