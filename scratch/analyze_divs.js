const fs = require('fs');

const html = fs.readFileSync('select.html', 'utf8');
const lines = html.split('\n');

// We focus on lines from #course-study-modal (around line 3315) to the end
let startLine = 3314; // 0-based
let modalContent = lines.slice(startLine).join('\n');

// Parse tags manually to find unbalanced divs
const regex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
let match;
let stack = [];
let divCounter = 0;

console.log("Analyzing tag balance...");

while ((match = regex.exec(modalContent)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || ['img', 'br', 'hr', 'input', 'link', 'meta'].includes(tagName);

    if (isSelfClosing) continue;

    if (tagName === 'div') {
        if (!isClosing) {
            divCounter++;
            stack.push({ tag: tagName, line: getLineNumber(match.index, modalContent) + startLine + 1 });
        } else {
            divCounter--;
            if (stack.length === 0) {
                console.log(`Unmatched closing </div> at line ~${getLineNumber(match.index, modalContent) + startLine + 1}`);
            } else {
                stack.pop();
            }
        }
    }
}

console.log(`Final div balance counter: ${divCounter}`);
if (stack.length > 0) {
    console.log("Unclosed divs stack (First 10):");
    stack.slice(0, 10).forEach(item => {
        console.log(` - Open <div> at line ${item.line}`);
    });
}

function getLineNumber(index, text) {
    const temp = text.substring(0, index);
    return (temp.match(/\n/g) || []).length;
}
