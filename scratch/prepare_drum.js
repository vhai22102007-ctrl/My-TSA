const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\trong-dong.svg";
const content = fs.readFileSync(filePath, 'utf8');

const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g;
let match;
const paths = [];

while ((match = pathRegex.exec(content)) !== null) {
  const fullTag = match[0];
  const dAttribute = match[1];
  
  // Find first coordinate pair
  const firstCoordsMatch = dAttribute.match(/^[mM]\s*([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)/);
  if (firstCoordsMatch) {
    const startX = parseFloat(firstCoordsMatch[1]);
    const startY = parseFloat(firstCoordsMatch[2]);
    
    // Distance from center (100, 197)
    const dist = Math.sqrt((startX - 100) ** 2 + (startY - 197) ** 2);
    paths.push({
      tag: fullTag,
      startX,
      startY,
      dist,
      dPreview: dAttribute.slice(0, 120)
    });
  }
}

console.log(`Total paths: ${paths.length}`);
paths.sort((a, b) => a.dist - b.dist);

for (let i = 0; i < Math.min(paths.length, 10); i++) {
  const p = paths[i];
  console.log(`Path #${i+1}:`);
  console.log(`  Distance from center (100, 197): ${p.dist.toFixed(2)}`);
  console.log(`  Start Position: (${p.startX.toFixed(2)}, ${p.startY.toFixed(2)})`);
  console.log(`  Tag preview: ${p.tag.slice(0, 150)}...`);
}
