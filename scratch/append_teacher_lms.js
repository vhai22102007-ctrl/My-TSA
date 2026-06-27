const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'js', 'teacher-page.js');
const txtPath = path.join(__dirname, 'clean_teacher_lms.txt');

let content = fs.readFileSync(jsPath, 'utf8');
const replacement = fs.readFileSync(txtPath, 'utf8');

const marker = 'function init() {';
const index = content.indexOf(marker);
if (index === -1) {
  console.error("Could not find init marker!");
  process.exit(1);
}

const newContent = content.substring(0, index) + replacement + '\n\n      ' + content.substring(index);
fs.writeFileSync(jsPath, newContent, 'utf8');
console.log("Teacher LMS code appended successfully!");
