const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('topbar-group-tabs-container')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
