const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\chim-lac.svg";
const content = fs.readFileSync(filePath, 'utf8');

const polygonMatch = content.match(/<polygon[^>]*>/gi);
console.log("Polygon tag:", polygonMatch);

const circleMatches = content.match(/<circle[^>]*>/gi);
console.log("Circle tags:", circleMatches);
