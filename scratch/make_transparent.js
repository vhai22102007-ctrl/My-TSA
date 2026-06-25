const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\trong-dong.svg";
if (!fs.existsSync(filePath)) {
  console.log("File not found");
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Replace fill:#ffffff with fill:none in the style of circle path16418
const targetStr = 'style="fill:#ffffff;';
const replacementStr = 'style="fill:none;';

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("SVG background made transparent successfully!");
} else {
  console.log("Target style string not found in SVG file.");
}
