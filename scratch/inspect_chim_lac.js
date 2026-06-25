const fs = require('fs');

const filePath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\chim-lac.svg";
if (!fs.existsSync(filePath)) {
  console.log("File not found");
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Find all path tags
const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g;
let match;
const paths = [];

while ((match = pathRegex.exec(content)) !== null) {
  const fullTag = match[0];
  const dAttribute = match[1];
  
  // Find the first coordinate pair after M/m (absolute start)
  const firstCoordsMatch = dAttribute.match(/^[mM]\s*([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)/);
  if (firstCoordsMatch) {
    const startX = parseFloat(firstCoordsMatch[1]);
    const startY = parseFloat(firstCoordsMatch[2]);
    
    // Distance from center (1381, 1381)
    const dist = Math.sqrt((startX - 1381) ** 2 + (startY - 1381) ** 2);
    paths.push({
      tag: fullTag,
      startX,
      startY,
      dist,
      dPreview: dAttribute.slice(0, 100)
    });
  }
}

console.log(`Total paths found: ${paths.length}`);
// Sort by distance from center
paths.sort((a, b) => a.dist - b.dist);

for (let i = 0; i < Math.min(paths.length, 15); i++) {
  const p = paths[i];
  console.log(`Path #${i+1}:`);
  console.log(`  Distance from center: ${p.dist.toFixed(2)}`);
  console.log(`  Start Position: (${p.startX.toFixed(2)}, ${p.startY.toFixed(2)})`);
  console.log(`  Tag preview: ${p.tag.slice(0, 150)}...`);
}
