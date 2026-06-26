const fs = require('fs');
const content = fs.readFileSync('select.html', 'utf8');
const lines = content.split('\n');

console.log("=== Body and Html styles ===");
lines.forEach((line, index) => {
  if (index < 1000) {
    if (line.includes('body') || line.includes('html')) {
      console.log(`${index+1}: ${line.trim()}`);
    }
  }
});
