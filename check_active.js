const fs = require('fs');
const html = fs.readFileSync('teacher.html', 'utf8');

console.log('tab-overview is active:', html.includes('id="tab-overview" class="tab-panel active"'));
console.log('tab-setup is active:', html.includes('id="tab-setup" class="tab-panel active"'));

// Find all elements with class "active"
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('active') && (l.includes('id=') || l.includes('class='))) {
    console.log((i+1) + ': ' + l.trim());
  }
});
