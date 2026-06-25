const fs = require('fs');

function searchFile(filename, pattern) {
    console.log(`=== Searching in ${filename} for "${pattern}" ===`);
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n');
    let count = 0;
    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
            count++;
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    });
    console.log(`Found ${count} matches.\n`);
}

searchFile('select.html', 'exam_history_data');
