const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('select.html', 'utf8');

// Simple regex to extract all script content
const regex = /<script(?:\s+[^>]*?)?>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 1;
let hasError = false;

while ((match = regex.exec(content)) !== null) {
  const code = match[1].trim();
  if (!code) continue;

  try {
    new vm.Script(code);
    console.log(`Script block ${scriptIndex++}: Valid syntax`);
  } catch (e) {
    console.error(`Error in script block ${scriptIndex++}:`, e.message);
    hasError = true;
  }
}

if (!hasError) {
  console.log("\nAll script blocks inside select.html have valid syntax!");
} else {
  console.log("\nSyntax check failed!");
}
