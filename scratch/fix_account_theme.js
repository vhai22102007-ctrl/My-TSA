const fs = require('fs');

const filePath = 'select.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace Profile Header Card
const headerTarget = `<!-- Flat Profile Header Card -->\n          <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); margin-bottom: 20px; position: relative;">`;
const headerReplacement = `<!-- Flat Profile Header Card -->\n          <div style="background: rgba(255, 255, 255, 0.28); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1.5px solid rgba(255, 255, 255, 0.4); border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.01); margin-bottom: 20px; position: relative;">`;

if (content.includes(headerTarget)) {
  content = content.replace(headerTarget, headerReplacement);
  console.log("Successfully replaced Profile Header Card style");
} else {
  console.warn("Could not find Profile Header Card target");
}

// 2. Replace Details Cards
const cardTarget = `<div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">`;
const cardReplacement = `<div style="background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1.5px solid rgba(255, 255, 255, 0.35); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(255,255,255,0.6)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.35)';">`;

let cardCount = 0;
while (content.includes(cardTarget)) {
  content = content.replace(cardTarget, cardReplacement);
  cardCount++;
}
console.log(`Successfully replaced ${cardCount} detail cards`);

// 3. Replace Address Card (handles grid-column)
const addressTarget = `<div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm); grid-column: 1 / -1; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">`;
const addressReplacement = `<div style="background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1.5px solid rgba(255, 255, 255, 0.35); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); grid-column: 1 / -1; transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(255,255,255,0.6)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.35)';">`;

if (content.includes(addressTarget)) {
  content = content.replace(addressTarget, addressReplacement);
  console.log("Successfully replaced Address Card style");
} else {
  console.warn("Could not find Address Card target");
}

// 4. Replace Activity Heatmap Section
const heatmapTarget = `<!-- Activity Heatmap / Chart Section -->\n          <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); margin-top: 20px;">`;
const heatmapReplacement = `<!-- Activity Heatmap / Chart Section -->\n          <div style="background: rgba(255, 255, 255, 0.28); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1.5px solid rgba(255, 255, 255, 0.4); border-radius: 20px; padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.01); margin-top: 20px;">`;

if (content.includes(heatmapTarget)) {
  content = content.replace(heatmapTarget, heatmapReplacement);
  console.log("Successfully replaced Activity Heatmap style");
} else {
  console.warn("Could not find Activity Heatmap target");
}

// 5. Replace Stats Panels in Chart
const statsTarget = `<div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px;">`;
const statsReplacement = `<div style="background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 8px; padding: 10px 14px;">`;

let statsCount = 0;
while (content.includes(statsTarget)) {
  content = content.replace(statsTarget, statsReplacement);
  statsCount++;
}
console.log(`Successfully replaced ${statsCount} stats sub-cards`);

// 6. Replace switchTab scroll to top behavior
const scrollTarget = `window.scrollTo({ top: 0, behavior: "smooth" });`;
const scrollReplacement = `window.scrollTo({ top: 0, behavior: "smooth" });\n        setTimeout(() => {\n          const activePanel = document.querySelector(".tab-panel.active");\n          if (activePanel) {\n            activePanel.scrollTop = 0;\n          }\n        }, 80);`;

if (content.includes(scrollTarget)) {
  content = content.replace(scrollTarget, scrollReplacement);
  console.log("Successfully updated scroll-to-top behavior in switchTab");
} else {
  console.warn("Could not find scroll-to-top target in switchTab");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Completed modifying select.html!");
