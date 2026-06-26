const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('<button') || line.includes('onclick') || line.includes('preview')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
