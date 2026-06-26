const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
let start = -1;
lines.forEach((line, idx) => {
    if (line.includes('function renderAll(') || line.includes('function renderAll()')) {
        start = idx;
    }
});
if (start !== -1) {
    console.log(lines.slice(start, start + 30).join('\n'));
}
