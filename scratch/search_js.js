const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\teacher.html";
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("function switchEditorTab")) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
