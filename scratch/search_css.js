const fs = require('fs');
const content = fs.readFileSync('select.html', 'utf8');
const lines = content.split('\n');

console.log("=== account-related CSS rules ===");
lines.forEach((line, index) => {
  if (index < 3500) {
    if (line.includes('account') || line.includes('tab-account')) {
      console.log(`${index+1}: ${line.trim()}`);
    }
  }
});
