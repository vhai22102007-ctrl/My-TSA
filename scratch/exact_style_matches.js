const fs = require('fs');

// ===== UPDATE CSS FILE =====
let css = fs.readFileSync('css/select-page.css', 'utf8');

// We want to make the topbar EXACTLY match the blue background in the image.
// Looking at the image, it is a clean medium blue (#0f5a9e or #0b579a or #074f8b). Let's use #0b579a (standard MSTeams/MSOffice blue)
// We also want to arrange headers/icons to match exactly.
const customStudyStyles = `
    /* ===== EXACT MATCH THE USER IMAGE STYLES ===== */

    #course-study-modal {
      background: #f8fafc !important;
    }

    /* TOPBAR: Deep MS Blue color (#0b579a) */
    #course-study-modal .course-modal-topbar {
      background: #0f5a9e !important;
      height: 52px !important;
      padding: 0 16px !important;
      border-bottom: none !important;
    }

    #course-study-modal .study-back-btn {
      color: #ffffff !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      background: transparent !important;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #course-study-modal .study-topbar-lesson-label {
      color: #ffffff !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      max-width: 600px;
    }

    /* Topbar Right navigation icons like home, library, notification, avatar */
    #course-study-modal .topbar-right {
      gap: 16px !important;
    }

    #course-study-modal .study-topbar-icon {
      color: #ffffff;
      opacity: 0.9;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }
    #course-study-modal .study-topbar-icon:hover {
      opacity: 1;
    }

    #course-study-modal .study-avatar {
      border: 2px solid rgba(255,255,255,0.8);
      background: #e2e8f0;
      width: 32px;
      height: 32px;
    }

    /* SIDEBAR TABS: Right aligned to match exactly (Bình luận on left, Mục lục on right) */
    #course-study-modal .study-sidebar-tabs {
      border-bottom: 1.5px solid #e2e8f0;
      padding: 0;
      background: #ffffff;
    }

    #course-study-modal .study-sidebar-tab {
      font-size: 12px !important;
      font-weight: 700 !important;
      text-transform: none !important;
      color: #475569 !important;
      padding: 12px 0 !important;
      border-bottom: 2.5px solid transparent !important;
    }

    #course-study-modal .study-sidebar-tab.active {
      color: #0f5a9e !important;
      border-bottom-color: #0f5a9e !important;
    }

    /* PROGRESS BAR */
    #course-study-modal .study-progress-wrap {
      background: #ffffff;
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    #course-study-modal .study-progress-label {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
    }

    #course-study-modal .study-progress-pct {
      color: #0f5a9e !important;
    }

    #course-study-modal .study-progress-track {
      height: 6px !important;
      background: #f1f5f9 !important;
    }

    #course-study-modal .study-progress-fill {
      background: #0f5a9e !important;
    }

    /* CHAPTER HEADINGS */
    #course-study-modal .tree-chapter-header {
      background: #ffffff !important;
      color: #94a3b8 !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 0.05em !important;
      padding: 16px 16px 8px !important;
      border-top: none !important;
    }

    /* LESSON ROW STYLING (matching the screenshot) */
    #course-study-modal .tree-bai-row {
      padding: 10px 16px !important;
      font-size: 13px !important;
      color: #475569 !important;
      font-weight: 500 !important;
      background: #ffffff;
    }

    #course-study-modal .tree-bai-row.active {
      background: #ffffff !important;
      color: #0f5a9e !important;
      font-weight: 600 !important;
      border-left-color: transparent !important;
    }

    #course-study-modal .tree-row-icon {
      border: 1.5px solid #94a3b8 !important;
      background: #ffffff !important;
      color: #94a3b8 !important;
      width: 20px !important;
      height: 20px !important;
    }

    #course-study-modal .tree-bai-row.active .tree-row-icon {
      border-color: #0f5a9e !important;
      color: #0f5a9e !important;
    }

    #course-study-modal .tree-bai-row.completed-row .tree-row-icon {
      border-color: #22c55e !important;
      color: #22c55e !important;
    }

    /* SUB-LESSON (PHẦN) STYLING */
    #course-study-modal .tree-sub-list {
      background: #ffffff;
    }

    #course-study-modal .tree-phan-row {
      padding: 8px 16px 8px 44px !important;
      font-size: 12.5px !important;
      color: #64748b !important;
      background: #ffffff;
      border-left: none !important;
    }

    #course-study-modal .tree-phan-row.active {
      background: #eff6ff !important;
      color: #0f5a9e !important;
      border-radius: 8px;
      margin: 2px 16px 2px 32px !important;
      padding-left: 12px !important;
      font-weight: 600 !important;
    }

    #course-study-modal .tree-phan-row::before {
      left: 36px !important;
      background: #e2e8f0 !important;
    }

    #course-study-modal .tree-phan-row.active::before {
      display: none !important;
    }

    #course-study-modal .tree-phan-indent {
      display: none !important; /* Hide the arrow char ↳ because we use padding & border lines */
    }

    #course-study-modal .tree-phan-icon {
      width: 18px !important;
      height: 18px !important;
      background: transparent !important;
      border: 1.5px solid #94a3b8 !important;
      color: #94a3b8 !important;
      margin-right: 4px;
    }

    #course-study-modal .tree-phan-row.active .tree-phan-icon {
      border-color: #0f5a9e !important;
      color: #0f5a9e !important;
    }

    #course-study-modal .tree-phan-row.completed .tree-phan-icon {
      border-color: #22c55e !important;
      color: #22c55e !important;
    }

    /* STANDALONE DOCUMENTS / TESTS */
    #course-study-modal .tree-standalone-row {
      background: #ffffff !important;
      padding: 10px 16px !important;
      font-size: 13px !important;
      color: #475569 !important;
      border-left: none !important;
    }

    #course-study-modal .tree-standalone-row.active {
      color: #0f5a9e !important;
      font-weight: 600 !important;
    }

    #course-study-modal .tree-doc-icon,
    #course-study-modal .tree-test-icon {
      background: transparent !important;
      border: none !important;
      width: 20px !important;
      height: 20px !important;
      color: #94a3b8 !important;
    }

    /* VIDEO PLAYER AREA CARD (white background container below player) */
    #course-study-modal .study-lesson-info-bar {
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px !important;
      margin: 20px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
    }

    #course-study-modal .lesson-complete-btn {
      border: 1.5px solid #10b981 !important;
      color: #10b981 !important;
      background: transparent !important;
      border-radius: 6px !important;
    }

    #course-study-modal .lesson-complete-btn.completed {
      background: #10b981 !important;
      color: #ffffff !important;
    }

    /* Bottom dynamic view count badge style */
    .study-view-count-badge {
      background: #fee2e2;
      color: #ef4444;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 99px;
      margin-left: 8px;
      display: inline-flex;
      align-items: center;
    }
`;

css += customStudyStyles;
fs.writeFileSync('css/select-page.css', css, 'utf8');
console.log('Appended layout customization styles.');
