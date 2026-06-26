const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
let found = [];
lines.forEach((line, idx) => {
    if (line.includes('renderReadingGroupForm') || line.includes('renderScienceGroupForm') || line.includes('reading-group-form') || line.includes('science-group-form')) {
        found.push(`${idx + 1}: ${line.trim()}`);
    }
});
console.log(found.join('\n'));
