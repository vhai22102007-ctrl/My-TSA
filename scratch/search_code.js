const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\teacher.html";
if (!fs.existsSync(filePath)) {
  console.log("File not found");
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const searchTerms = ["Danh sách câu", "luong-soan-de", "tab-math", "renderMath", "Toán", "0/40"];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const term of searchTerms) {
    if (line.toLowerCase().includes(term.toLowerCase())) {
      console.log(`Line ${i + 1} (${term}): ${line.trim().slice(0, 150)}`);
      break;
    }
  }
}
