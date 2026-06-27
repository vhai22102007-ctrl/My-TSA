const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'js', 'select-page.js');
const txtPath = path.join(__dirname, 'clean_classroom_modal.txt');

let content = fs.readFileSync(jsPath, 'utf8');
const replacement = fs.readFileSync(txtPath, 'utf8');

// Find start marker
const startMarker = 'function openClassroomModal(courseId) {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find startMarker in js/select-page.js!");
  process.exit(1);
}

// Find end marker
const endMarker = 'function closeCourseStudyModalFunc()';
const endIndex = content.indexOf(endMarker);
if (endIndex === -1) {
  console.error("Could not find endMarker in js/select-page.js!");
  process.exit(1);
}

const newContent = content.substring(0, startIndex) + replacement + '\n      ' + content.substring(endIndex);
fs.writeFileSync(jsPath, newContent, 'utf8');
console.log("openClassroomModal updated successfully using external txt file!");
