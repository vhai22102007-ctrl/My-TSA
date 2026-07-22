const fs = require("fs");
const path = require("path");
const vm = require("vm");

const workspace = path.resolve(__dirname, "..");
const publicExamDirectories = [
  path.join(workspace, "deploy-web", "data", "exams"),
  path.join(workspace, "r2-public-upload", "data", "exams")
];
const privateFields = new Set([
  "correct_answer",
  "accepted_answers",
  "explanation",
  "solution",
  "solution_details"
]);

function stripPrivateFields(value) {
  if (Array.isArray(value)) {
    value.forEach(stripPrivateFields);
    return value;
  }
  if (!value || typeof value !== "object") return value;

  for (const key of Object.keys(value)) {
    if (privateFields.has(key)) delete value[key];
    else stripPrivateFields(value[key]);
  }
  return value;
}

function containsPrivateFields(value) {
  if (Array.isArray(value)) return value.some(containsPrivateFields);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) => privateFields.has(key) || containsPrivateFields(child));
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

let sanitizedFiles = 0;
for (const directory of publicExamDirectories) {
  for (const file of listJsonFiles(directory)) {
    const data = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    const hadPrivateFields = containsPrivateFields(data);
    stripPrivateFields(data);
    if (containsPrivateFields(data)) throw new Error(`Không lọc hết đáp án trong ${file}`);
    if (hadPrivateFields) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
      sanitizedFiles += 1;
    }
  }
}

const fallbackFile = path.join(workspace, "deploy-web", "js", "tsa001-fallback.js");
if (fs.existsSync(fallbackFile)) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(fallbackFile, "utf8"), sandbox, { filename: fallbackFile });
  const fallbackData = sandbox.window.TSA001_FALLBACK_DATA;
  if (fallbackData) {
    stripPrivateFields(fallbackData);
    if (containsPrivateFields(fallbackData)) throw new Error("Không lọc hết đáp án trong TSA001 fallback.");
    fs.writeFileSync(fallbackFile, "window.TSA001_FALLBACK_DATA = " + JSON.stringify(fallbackData, null, 2) + ";\n", "utf8");
    sanitizedFiles += 1;
  }
}

console.log(`Đã làm sạch ${sanitizedFiles} tệp public; đáp án chỉ còn ở Database.`);
