const fs = require('fs');
const content = fs.readFileSync('select.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('btn-topbar-toggle') || line.includes('toggleSidebar') || line.includes('sidebar-toggle')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
