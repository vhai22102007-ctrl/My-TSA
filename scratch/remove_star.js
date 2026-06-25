const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\chim-lac.svg";
if (!fs.existsSync(filePath)) {
  console.log("File not found");
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Find the polygon tag and remove it
const polygonRegex = /<polygon[^>]*\/>/gi;

if (polygonRegex.test(content)) {
  content = content.replace(polygonRegex, "");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Star polygon removed successfully from SVG!");
} else {
  console.log("No polygon tag found in SVG.");
}
