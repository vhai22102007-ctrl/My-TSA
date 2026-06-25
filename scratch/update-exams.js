const fs = require('fs');
const path = require('path');

const examsDir = path.join(__dirname, '..', 'data', 'exams');

if (!fs.existsSync(examsDir)) {
  console.error("Exams directory does not exist at: " + examsDir);
  process.exit(1);
}

const files = fs.readdirSync(examsDir);

files.forEach(file => {
  if (path.extname(file).toLowerCase() === '.json' && file !== 'index.json') {
    const filePath = path.join(examsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const exam = JSON.parse(content);
      
      let modified = false;
      if (exam && Array.isArray(exam.sections)) {
        // 1. Reading Section Schema Enforcement
        const readingSec = exam.sections.find(s => s.section_id === 'reading');
        if (readingSec) {
          if (!Array.isArray(readingSec.groups)) readingSec.groups = [];
          
          // Keep only g1 and g2
          const oldGroups = readingSec.groups;
          readingSec.groups = readingSec.groups.filter(g => g.group_id === 'g1' || g.group_id === 'g2' || g.group_id === 'group_reading_multiverse_01' || g.group_id === 'group_reading_multiverse_02');
          
          // Check/Create g1
          let g1 = readingSec.groups.find(g => g.group_id === 'g1' || g.group_id === 'group_reading_multiverse_01');
          if (!g1) {
            g1 = oldGroups[0] || {
              group_id: 'g1',
              title: "Ngữ liệu Đọc hiểu số 01",
              stimulus: { type: "text", content: "Nhập nội dung ngữ liệu 1 ở đây...", image_url: "", image_width: 100 },
              questions: []
            };
            g1.group_id = 'g1';
            readingSec.groups.push(g1);
          } else {
            g1.group_id = 'g1';
          }
          if (!Array.isArray(g1.questions)) g1.questions = [];
          while (g1.questions.length < 10) {
            const nextNo = g1.questions.length + 1;
            g1.questions.push({
              question_no: nextNo,
              question_type: "single_choice",
              question: "",
              image_url: "",
              options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }],
              correct_answer: "A",
              explanation: "",
              points: 1
            });
          }
          g1.questions.sort((a, b) => (Number(a.question_no) || 0) - (Number(b.question_no) || 0));
          for (let i = 0; i < g1.questions.length; i++) {
            g1.questions[i].question_no = i + 1;
          }

          // Check/Create g2
          let g2 = readingSec.groups.find(g => g.group_id === 'g2' || g.group_id === 'group_reading_multiverse_02');
          if (!g2) {
            g2 = oldGroups[1] || {
              group_id: 'g2',
              title: "Ngữ liệu Đọc hiểu số 02",
              stimulus: { type: "text", content: "Nhập nội dung ngữ liệu 2 ở đây...", image_url: "", image_width: 100 },
              questions: []
            };
            g2.group_id = 'g2';
            readingSec.groups.push(g2);
          } else {
            g2.group_id = 'g2';
          }
          if (!Array.isArray(g2.questions)) g2.questions = [];
          while (g2.questions.length < 10) {
            const nextNo = g2.questions.length + 11;
            g2.questions.push({
              question_no: nextNo,
              question_type: "single_choice",
              question: "",
              image_url: "",
              options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }],
              correct_answer: "A",
              explanation: "",
              points: 1
            });
          }
          g2.questions.sort((a, b) => (Number(a.question_no) || 0) - (Number(b.question_no) || 0));
          for (let i = 0; i < g2.questions.length; i++) {
            g2.questions[i].question_no = i + 11;
          }

          readingSec.g1 = g1;
          readingSec.g2 = g2;
          readingSec.g1_questions = g1.questions;
          readingSec.g2_questions = g2.questions;
          
          readingSec.groups = [g1, g2];
          modified = true;
        }

        // 2. Science Section Schema Enforcement
        const scienceSec = exam.sections.find(s => s.section_id === 'science');
        if (scienceSec) {
          if (!Array.isArray(scienceSec.groups)) scienceSec.groups = [];
          
          // Gather all existing science questions and groups stimulus information
          const allScienceQs = [];
          const oldGroupsInfo = [];
          
          scienceSec.groups.forEach(g => {
            oldGroupsInfo.push({
              title: g.title,
              stimulus: g.stimulus
            });
            if (Array.isArray(g.questions)) {
              g.questions.forEach(q => {
                allScienceQs.push(q);
              });
            }
          });
          
          const newGroups = [];
          const allowedScienceGroups = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"];
          
          for (let gIdx = 1; gIdx <= 8; gIdx++) {
            const gId = "g" + gIdx;
            const startNo = (gIdx - 1) * 5 + 1;
            
            // Try to find old group info, or create default
            const oldInfo = oldGroupsInfo[gIdx - 1] || {};
            const group = {
              group_id: gId,
              title: oldInfo.title || `Ngữ liệu Khoa học số 0${gIdx}`,
              stimulus: oldInfo.stimulus || { type: "text", content: `Nhập nội dung ngữ liệu khoa học ${gIdx} ở đây...`, image_url: "", image_width: 100 },
              questions: []
            };
            
            // Gather questions in range for this group
            for (let i = 0; i < 5; i++) {
              const qNo = startNo + i;
              let q = allScienceQs.find(item => Number(item.question_no) === qNo);
              if (!q) {
                q = {
                  question_no: qNo,
                  question_type: "single_choice",
                  question: "",
                  image_url: "",
                  options: [{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }],
                  correct_answer: "A",
                  explanation: "",
                  points: 1
                };
              } else {
                q = JSON.parse(JSON.stringify(q));
                q.question_no = qNo;
              }
              group.questions.push(q);
            }
            
            newGroups.push(group);
            scienceSec[gId] = group;
            scienceSec[gId + "_questions"] = group.questions;
          }
          
          scienceSec.groups = newGroups;
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(exam, null, 2), 'utf8');
        console.log(`Updated Reading & Science section format for: ${file}`);
      }
    } catch (e) {
      console.error(`Error updating file ${file}:`, e);
    }
  }
});
