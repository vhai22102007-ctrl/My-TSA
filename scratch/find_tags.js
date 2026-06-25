const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\chim-lac.svg";
const content = fs.readFileSync(filePath, 'utf8');

const tags = content.match(/<[a-zA-Z0-9:-]+/g) || [];
const tagCounts = {};
for (const tag of tags) {
  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
}

console.log("Tag counts:", tagCounts);
