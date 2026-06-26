const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('teacher.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1];
  const srcAttr = match[0].match(/src=["']([^"']+)["']/i);
  if (srcAttr) {
    // External script
    continue;
  }
  
  count++;
  try {
    new vm.Script(code);
    console.log(`Script block ${count} is valid.`);
  } catch (err) {
    console.error(`Syntax error in script block ${count}:`, err.message);
    // Print lines around the error
    const lines = code.split('\n');
    const errLine = err.stack.split('\n')[0].match(/:(\d+)/);
    if (errLine) {
      const lineNum = parseInt(errLine[1], 10);
      console.error(`Error around line ${lineNum}:`);
      for (let i = Math.max(0, lineNum - 5); i < Math.min(lines.length, lineNum + 5); i++) {
        console.error(`${i + 1}: ${lines[i]}`);
      }
    }
    process.exit(1);
  }
}

console.log('All inline scripts parsed successfully!');
