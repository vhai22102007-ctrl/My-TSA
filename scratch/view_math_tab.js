const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\teacher.html";
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (let i = 2855; i < 2919; i++) {
  if (i < lines.length) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
