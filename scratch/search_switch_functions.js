const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('setGlobalEditorRoleView') || line.includes('setEditorRoleView')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
