const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'teacher.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = regex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code.length === 0) continue;
  try {
    new vm.Script(code);
    count++;
  } catch (err) {
    console.error(`Syntax error in script block ${count}:\n`, err);
    process.exit(1);
  }
}

console.log(`All ${count} inline script blocks inside teacher.html have valid syntax!`);
