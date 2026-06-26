const fs = require('fs');
const path = require('path');

const targetDir = 'assets/questions/tsa001';

if (fs.existsSync(targetDir)) {
  console.log(`=== Files in ${targetDir} ===`);
  const files = fs.readdirSync(targetDir);
  files.forEach(f => console.log(f));
} else {
  console.log(`Directory not found: ${targetDir}`);
}
