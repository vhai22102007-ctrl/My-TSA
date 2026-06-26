const fs = require('fs');
const content = fs.readFileSync('select.html', 'utf8');

// Find all <div> and </div> tags and match them
const regex = /<\/?div(?:\s+[^>]*?)?>/g;
let match;
const stack = [];
const tabPanels = [];

while ((match = regex.exec(content)) !== null) {
  const fullTag = match[0];
  const isClosing = fullTag.startsWith('</');

  if (!isClosing) {
    const idMatch = fullTag.match(/id=["']([^"']+)["']/);
    const classMatch = fullTag.match(/class=["']([^"']+)["']/);
    const tagInfo = {
      tag: 'div',
      id: idMatch ? idMatch[1] : null,
      class: classMatch ? classMatch[1] : null,
      line: content.substring(0, match.index).split('\n').length
    };
    stack.push(tagInfo);
    if (tagInfo.id && tagInfo.id.startsWith('tab-')) {
      const parent = stack[stack.length - 2];
      tabPanels.push({
        id: tagInfo.id,
        line: tagInfo.line,
        parent: parent ? { tag: parent.tag, id: parent.id, class: parent.class, line: parent.line } : null,
        depth: stack.length - 1
      });
    }
  } else {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(`Extra </div> closed on line ${content.substring(0, match.index).split('\n').length}`);
    }
  }
}

console.log("=== Tab Panels Div-only Hierarchy ===");
tabPanels.forEach(tp => {
  console.log(`Tab: ${tp.id} (Line ${tp.line})`);
  console.log(`  Parent: ${tp.parent ? `${tp.parent.tag}${tp.parent.id ? '#' + tp.parent.id : ''}${tp.parent.class ? '.' + tp.parent.class : ''} (Line ${tp.parent.line})` : 'None'}`);
  console.log(`  Depth: ${tp.depth}`);
});

if (stack.length > 0) {
  console.log(`\n=== Unclosed divs left in stack: ${stack.length} ===`);
  stack.forEach((div, index) => {
    console.log(`${index}: Line ${div.line} <div id="${div.id || ''}" class="${div.class || ''}">`);
  });
} else {
  console.log("\nAll divs are perfectly balanced!");
}
