const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('editor-role-tabs-nav') || line.includes('editor-role-tab-btn')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
