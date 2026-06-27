/**
 * TSA Exam Bulk Import Tool
 * 
 * Usage:
 *   node scratch/import_exam.js <input_txt_file> <exam_code> <exam_title> [subject]
 * 
 * Example:
 *   node scratch/import_exam.js scratch/math_questions.txt TSA001 "Đề TSA số 01 - Tư duy Toán học" math
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: node scratch/import_exam.js <input_txt_file> <exam_code> <exam_title> [subject]");
  console.log("Example: node scratch/import_exam.js scratch/math_questions.txt TSA001 \"Đề TSA số 01\" math");
  process.exit(1);
}

const inputPath = args[0];
const examCode = args[1].toUpperCase().trim();
const examTitle = args[2].trim();
const subject = (args[3] || "math").toLowerCase().trim();

if (!fs.existsSync(inputPath)) {
  console.error(`Error: Input file not found at ${inputPath}`);
  process.exit(1);
}

const text = fs.readFileSync(inputPath, 'utf8');

// Escaping function for HTML entities (safe strings)
function esc(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Applies schema defaults for each question type
function applyTypeDefaults(q) {
  if (q.question_type === "single_choice" || q.question_type === "multiple_choice") {
    if (!Array.isArray(q.options) || !q.options.length) {
      q.options = [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" }
      ];
    }
    if (q.question_type === "single_choice" && Array.isArray(q.correct_answer)) {
      q.correct_answer = q.correct_answer[0] || "A";
    }
    if (q.question_type === "multiple_choice" && !Array.isArray(q.correct_answer)) {
      q.correct_answer = q.correct_answer ? [q.correct_answer] : [];
    }
  }
  if (q.question_type === "true_false") {
    q.statements = q.statements || [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" }
    ];
    q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer)
      ? q.correct_answer
      : { a: true, b: false, c: true, d: false };
  }
  if (q.question_type === "fill_blank") {
    q.correct_answer = typeof q.correct_answer === "string" ? q.correct_answer : String(q.correct_answer || "");
    q.accepted_answers = Array.isArray(q.accepted_answers) ? q.accepted_answers : [q.correct_answer];
  }
  if (q.question_type === "drag_drop") {
    q.body = Array.isArray(q.body) ? q.body : [
      { type: "text", content: "Điền " },
      { type: "blank", id: "b1" },
      { type: "text", content: " vào chỗ trống." }
    ];
    q.items = Array.isArray(q.items) ? q.items : [{ id: "i1", text: "đáp án" }];
    q.correct_answer = q.correct_answer && typeof q.correct_answer === "object" && !Array.isArray(q.correct_answer)
      ? q.correct_answer
      : { b1: "i1" };
  }
}

function parseQuestions(rawText) {
  const importedQuestions = [];
  // Split questions by \cau or \cau[points] or \question
  const regex = /\\cau(?:\[(\d+(?:\.\d+)?)\])?\s*([\s\S]*?)(?=\\cau|$)/g;
  let match;
  let count = 1;

  while ((match = regex.exec(rawText)) !== null) {
    const block = match[2].trim();
    if (!block) continue;
    const points = Number(match[1]) || 1;

    let qText = "";
    let qType = "single_choice"; // Default to single choice for convenience
    let correct = "";
    let image = "";
    let image_width = 100;
    let explanation = "";
    let options = [];
    let statements = [];
    let tfAnswers = [];
    let dragItems = [];
    let dragCorrect = "";

    const lines = block.split("\n");
    const cleanLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("%WEB:")) {
        const meta = line.substring(5).split("=");
        if (meta.length >= 2) {
          const key = meta[0].trim().toLowerCase();
          const val = meta.slice(1).join("=").trim();
          
          if (key === "type") qType = val;
          else if (key === "answer") correct = val;
          else if (key === "image") image = val;
          else if (key === "width") image_width = Number(val) || 100;
          else if (key === "explanation") explanation = val;
          else if (key === "statements") {
            statements = val.split(/\s+\|\s+/).map(s => s.trim()).filter(Boolean);
          }
          else if (key === "tf_answers") {
            tfAnswers = val.split(/\s+\|\s+/).map(s => s.trim().toUpperCase());
          }
          else if (key === "items") {
            dragItems = val.split(/\s+\|\s+/).map(s => s.trim()).filter(Boolean);
          }
          else if (key === "drag_correct") {
            dragCorrect = val;
          }
        }
      } else {
        cleanLines.push(lines[i]);
      }
    }

    let cleanBlock = cleanLines.join("\n").trim();
    qText = cleanBlock;

    // Check for LaTeX single choice choices: \choicefour {A} {B} {C} {D}
    const choiceRegex = /\\choicefour\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/;
    const choiceMatch = choiceRegex.exec(cleanBlock);
    if (choiceMatch) {
      qType = "single_choice";
      qText = cleanBlock.replace(choiceRegex, "").trim();
      options = [
        { key: "A", text: choiceMatch[1].trim() },
        { key: "B", text: choiceMatch[2].trim() },
        { key: "C", text: choiceMatch[3].trim() },
        { key: "D", text: choiceMatch[4].trim() }
      ];
    }

    // Fallback: If options are listed as A. B. C. D. at the end
    if (options.length === 0 && qType === "single_choice") {
      const optRegex = /A\.\s*([\s\S]*?)\s*B\.\s*([\s\S]*?)\s*C\.\s*([\s\S]*?)\s*D\.\s*([\s\S]*?)$/i;
      const optMatch = optRegex.exec(cleanBlock);
      if (optMatch) {
        qText = cleanBlock.replace(optRegex, "").trim();
        options = [
          { key: "A", text: optMatch[1].trim() },
          { key: "B", text: optMatch[2].trim() },
          { key: "C", text: optMatch[3].trim() },
          { key: "D", text: optMatch[4].trim() }
        ];
      }
    }

    const questionObj = {
      question_no: count++,
      question_type: qType,
      question: qText,
      image_url: image,
      image_width: image_width,
      options: options,
      correct_answer: correct,
      explanation: explanation,
      points: points
    };

    // Post-process specific types
    if (qType === "true_false") {
      const tfStatements = [];
      const tfCorrectObj = {};
      
      const targetStatements = statements.length ? statements : ["a", "b", "c", "d"];
      targetStatements.forEach((stText, idx) => {
        const id = statements.length ? "s" + (idx + 1) : stText;
        const textVal = statements.length ? stText : "Mệnh đề " + id.toUpperCase();
        tfStatements.push({ id: id, text: textVal });
        
        const ansChar = tfAnswers[idx] || "T";
        tfCorrectObj[id] = ansChar === "T" || ansChar === "TRUE" || ansChar === "ĐÚNG" || ansChar === "D";
      });
      
      questionObj.statements = tfStatements;
      questionObj.correct_answer = tfCorrectObj;
    }
    else if (qType === "multiple_choice") {
      if (typeof correct === "string") {
        questionObj.correct_answer = correct.split(/[\|,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
      }
    }
    else if (qType === "drag_drop") {
      const itemsList = dragItems.map((text, idx) => ({ id: "item" + (idx + 1), text: text }));
      questionObj.items = itemsList;

      const bodyBlocks = [];
      let lastIdx = 0;
      const regexDD = /\[(o\d+)\]/g;
      let matchDD;
      while ((matchDD = regexDD.exec(qText)) !== null) {
        const textBefore = qText.substring(lastIdx, matchDD.index);
        if (textBefore) bodyBlocks.push({ type: "text", content: textBefore });
        bodyBlocks.push({ type: "blank", id: matchDD[1] });
        lastIdx = regexDD.lastIndex;
      }
      const textAfter = qText.substring(lastIdx);
      if (textAfter) bodyBlocks.push({ type: "text", content: textAfter });
      questionObj.body = bodyBlocks;

      const dragCorrectObj = {};
      const finalDragCorrect = dragCorrect || correct;
      if (typeof finalDragCorrect === "string") {
        finalDragCorrect.split("|").forEach(pair => {
          const parts = pair.split("=");
          if (parts.length === 2) {
            const blankId = parts[0].trim();
            const matchText = parts[1].trim();
            const foundItem = itemsList.find(it => it.text === matchText);
            dragCorrectObj[blankId] = foundItem ? foundItem.id : matchText;
          }
        });
      }
      questionObj.correct_answer = dragCorrectObj;
    }

    applyTypeDefaults(questionObj);
    importedQuestions.push(questionObj);
  }

  return importedQuestions;
}

// 1. Parse questions from input file
console.log(`Parsing input file: ${inputPath}...`);
const parsedQuestions = parseQuestions(text);
console.log(`Parsed ${parsedQuestions.length} questions successfully!`);

if (parsedQuestions.length === 0) {
  console.error("Error: No questions parsed. Please make sure the input file is formatted correctly (starts with \\cau).");
  process.exit(1);
}

// 2. Prepare/load the target exam JSON
const examFilename = `${examCode}.json`;
const examFilePath = path.join('data/exams', examFilename);
let examData = {
  exam_code: examCode,
  title: examTitle,
  duration_minutes: 45,
  status: "published",
  sections: [
    { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] },
    { section_id: "reading", section_label: "Đọc hiểu", layout: "passage", groups: [] },
    { section_id: "science", section_label: "Khoa học", layout: "passage", groups: [] }
  ]
};

if (fs.existsSync(examFilePath)) {
  try {
    examData = JSON.parse(fs.readFileSync(examFilePath, 'utf8'));
    console.log(`Loaded existing exam file: ${examFilePath}`);
  } catch (e) {
    console.warn(`Could not parse existing exam file, creating a new one...`);
  }
}

// Ensure layout sections exist
if (!examData.sections) {
  examData.sections = [
    { section_id: "math", section_label: "Tư duy Toán học", layout: "single", questions: [] },
    { section_id: "reading", section_label: "Đọc hiểu", layout: "passage", groups: [] },
    { section_id: "science", section_label: "Khoa học", layout: "passage", groups: [] }
  ];
}

// Find target section or create it
let section = examData.sections.find(s => s.section_id === subject);
if (!section) {
  section = { section_id: subject, section_label: subject === "math" ? "Tư duy Toán học" : subject, layout: subject === "math" ? "single" : "passage", questions: [] };
  examData.sections.push(section);
}

// 3. Put parsed questions in the target section
if (subject === "math") {
  section.questions = parsedQuestions;
} else {
  // For reading/science, we default to adding them to a single default group
  section.groups = section.groups || [];
  let defaultGroup = section.groups.find(g => g.group_id === "g1");
  if (!defaultGroup) {
    defaultGroup = {
      group_id: "g1",
      title: "Ngữ liệu tổng hợp",
      stimulus: { type: "text", content: "Nội dung văn bản/ngữ liệu ở đây...", image_url: "" },
      questions: []
    };
    section.groups.push(defaultGroup);
  }
  defaultGroup.questions = parsedQuestions;
}

// Write the updated exam JSON
fs.writeFileSync(examFilePath, JSON.stringify(examData, null, 4), 'utf8');
console.log(`Saved exam JSON successfully to: ${examFilePath} (${fs.statSync(examFilePath).size} bytes)`);

// 4. Update data/exams/index.json
const indexPath = 'data/exams/index.json';
let indexList = [];
if (fs.existsSync(indexPath)) {
  try {
    indexList = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch (e) {}
}

const subjectLabels = {
  math: "Tư duy Toán học",
  reading: "Đọc hiểu",
  science: "Khoa học"
};

// Check if entry already exists in index
const existingIndex = indexList.findIndex(item => item.exam_code === examCode && item.subject === subject);
const indexEntry = {
  exam_code: examCode,
  title: examTitle + (subject !== "math" ? ` - ${subjectLabels[subject] || subject}` : ""),
  subject: subject,
  subject_label: subjectLabels[subject] || subject,
  duration_minutes: examData.duration_minutes || 45,
  question_count: parsedQuestions.length,
  file: `data/exams/${examFilename}`,
  status: "published"
};

if (existingIndex !== -1) {
  indexList[existingIndex] = indexEntry;
  console.log(`Updated index entry for ${examCode} [${subject}]`);
} else {
  indexList.push(indexEntry);
  console.log(`Added new index entry for ${examCode} [${subject}]`);
}

fs.writeFileSync(indexPath, JSON.stringify(indexList, null, 4), 'utf8');
console.log(`Updated index.json successfully at: ${indexPath}`);
console.log(`\nImport completed! Total questions imported: ${parsedQuestions.length}`);
