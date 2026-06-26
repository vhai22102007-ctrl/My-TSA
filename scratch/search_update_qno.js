const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
let start = -1;
lines.forEach((line, idx) => {
    if (line.includes('function updateTopbarQNo')) {
        start = idx;
    }
});
if (start !== -1) {
    console.log(lines.slice(start, start + 50).join('\n'));
}
