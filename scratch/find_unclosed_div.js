const fs = require('fs');

const html = fs.readFileSync('select.html', 'utf8');
const lines = html.split('\n');

const mainIdx = html.indexOf('class="course-study-main"');
const sidebarIdx = html.indexOf('class="course-study-sidebar"');

// Get line number of mainIdx
let mainLine = 0;
let temp = html.substring(0, mainIdx);
mainLine = (temp.match(/\n/g) || []).length;

let sidebarLine = 0;
temp = html.substring(0, sidebarIdx);
sidebarLine = (temp.match(/\n/g) || []).length;

console.log(`Main line: ${mainLine + 1}`);
console.log(`Sidebar line: ${sidebarLine + 1}`);

// Track tags between mainLine and sidebarLine
let stack = [];
for (let i = mainLine; i < sidebarLine; i++) {
    const lineText = lines[i];
    // Find all <div or </div> in this line
    const regex = /<\/?div\b(?:\s+[^>]*)?>/g;
    let match;
    while ((match = regex.exec(lineText)) !== null) {
        const tag = match[0];
        const isClosing = tag.startsWith('</');
        if (!isClosing) {
            stack.push({ line: i + 1, content: lineText.trim() });
        } else {
            if (stack.length === 0) {
                console.log(`Unmatched closing </div> at line ${i + 1}`);
            } else {
                stack.pop();
            }
        }
    }
}

console.log(`Remaining open divs in stack: ${stack.length}`);
stack.forEach(item => {
    console.log(` - Line ${item.line}: ${item.content}`);
});
