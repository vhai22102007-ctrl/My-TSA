const fs = require('fs');

const html = fs.readFileSync('select.html', 'utf8');
const lines = html.split('\n');

const mainIdx = html.indexOf('class="course-study-main"');
const sidebarIdx = html.indexOf('class="course-study-sidebar"');

let mainLine = 0;
let temp = html.substring(0, mainIdx);
mainLine = (temp.match(/\n/g) || []).length;

let sidebarLine = 0;
temp = html.substring(0, sidebarIdx);
sidebarLine = (temp.match(/\n/g) || []).length;

let stack = [];
console.log("Trace of Divs open/close:");
for (let i = mainLine; i <= sidebarLine; i++) {
    const lineText = lines[i];
    const regex = /<\/?div\b(?:\s+[^>]*)?>/g;
    let match;
    while ((match = regex.exec(lineText)) !== null) {
        const tag = match[0];
        const isClosing = tag.startsWith('</');
        if (!isClosing) {
            stack.push({ line: i + 1, tag: tag });
            console.log(`[OPEN] Line ${i + 1}: ${tag} (Stack depth: ${stack.length})`);
        } else {
            const popped = stack.pop();
            console.log(`[CLOSE] Line ${i + 1}: ${tag} -> closes Line ${popped ? popped.line : 'NONE'} (Stack depth: ${stack.length})`);
        }
    }
}
