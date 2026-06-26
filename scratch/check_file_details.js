const fs = require('fs');
const path = require('path');

const examDir = 'data/exams';
const files = fs.readdirSync(examDir);

files.forEach(file => {
  const filePath = path.join(examDir, file);
  const stat = fs.statSync(filePath);
  console.log(`File: ${file}, Size: ${stat.size} bytes`);
  
  if (file.endsWith('.json')) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.sections) {
        console.log(`  Sections:`);
        data.sections.forEach(sec => {
          console.log(`    - Section ${sec.section_id}: questions = ${sec.questions ? sec.questions.length : 'N/A'}, groups = ${sec.groups ? sec.groups.length : 'N/A'}`);
        });
      }
    } catch (e) {
      console.log(`  Error reading JSON: ${e.message}`);
    }
  }
});
