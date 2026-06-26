const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');

function search(query) {
  console.log(`--- Searching for: "${query}" ---`);
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

search('Giáo viên');
search('Học sinh');
