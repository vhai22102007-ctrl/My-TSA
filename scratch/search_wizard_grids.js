const fs = require('fs');
const content = fs.readFileSync('teacher.html', 'utf8');
const lines = content.split('\n');
let found = [];
lines.forEach((line, idx) => {
    if (line.includes('math-wizard-grid') || line.includes('reading-wizard-grid') || line.includes('science-wizard-grid') || line.includes('wizard-grid') || line.includes('renderMathWizardNav') || line.includes('renderSubjectWizardNav')) {
        found.push(`${idx + 1}: ${line.trim()}`);
    }
});
console.log(found.join('\n'));
