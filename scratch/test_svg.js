const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\chim-lac.svg";
if (!fs.existsSync(filePath)) {
  console.log("File not found");
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

const whiteMatches = content.match(/#ffffff/gi) || [];
const whiteShortMatches = content.match(/#fff\b/gi) || [];
const fillWhiteMatches = content.match(/fill:\s*#ffffff/gi) || [];

console.log(`Total #ffffff: ${whiteMatches.length}`);
console.log(`Total #fff: ${whiteShortMatches.length}`);
console.log(`Total fill:#ffffff: ${fillWhiteMatches.length}`);

const lines = content.split('\n');
for (let i = 0; i < Math.min(lines.length, 30); i++) {
  console.log(`Line ${i + 1}: ${lines[i].trim().slice(0, 150)}...`);
}
