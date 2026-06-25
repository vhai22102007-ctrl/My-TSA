const fs = require('fs');
const path = require('path');

const logDir = 'C:\\Users\\vhai2\\.gemini\\antigravity\\brain\\a1189e05-213a-41c0-8830-3ce8dca9486d\\.system_generated\\logs';
const transcriptPath = path.join(logDir, 'transcript_full.jsonl');

if (fs.existsSync(transcriptPath)) {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
    let userInputs = [];
    lines.forEach((line, idx) => {
        try {
            const obj = JSON.parse(line);
            if (obj.type === 'USER_INPUT') {
                userInputs.push({ idx, content: obj.content });
            }
        } catch(e) {}
    });
    
    console.log("All USER inputs containing link, file, pdf, or gv:");
    userInputs.forEach((item, index) => {
        const lower = item.content.toLowerCase();
        if (lower.includes('link') || lower.includes('file') || lower.includes('pdf') || lower.includes('gv')) {
            console.log(`[Input #${index + 1}, line ${item.idx}]: ${item.content.trim()}`);
        }
    });
}
