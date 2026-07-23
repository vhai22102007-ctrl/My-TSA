const MAX_CANDIDATES_PER_IMPORT = 2500;
const SESSION_TTL_SECONDS = 12 * 60 * 60;

function normalizeExamCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 64);
}

function normalizePhone(value) {
  let phone = String(value || "").replace(/\D/g, "");
  if (phone.startsWith("0084")) phone = "0" + phone.slice(4);
  else if (phone.startsWith("84") && phone.length >= 11) phone = "0" + phone.slice(2);
  return phone.slice(0, 15);
}

function validPhone(phone) {
  return /^0\d{8,10}$/.test(phone);
}

function cleanText(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function normalizeMetadataKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function metadataValue(metadata, aliases) {
  if (!metadata || typeof metadata !== "object") return "";
  const normalized = {};
  Object.keys(metadata).forEach((key) => { normalized[normalizeMetadataKey(key)] = metadata[key]; });
  for (const alias of aliases) {
    const value = normalized[normalizeMetadataKey(alias)];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function candidateProfile(item) {
  const metadata = parseJson(item.metadata_json, {});
  return {
    name: item.full_name,
    phone: item.phone,
    candidateId: item.phone,
    dateOfBirth: item.date_of_birth || "",
    gender: metadataValue(metadata, ["gender", "gioi tinh", "sex"]),
    idNumber: metadataValue(metadata, ["idNumber", "so cccd", "cccd", "cmnd", "id number", "can cuoc cong dan"]),
    school: item.school || "",
    className: item.class_name || "",
    province: item.province || ""
  };
}

function toBase64Url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function createCandidateToken(candidate, env) {
  if (!env.CANDIDATE_SESSION_SECRET) throw new Error("CANDIDATE_SESSION_SECRET is missing");
  const payload = toBase64Url(JSON.stringify({
    candidateId: candidate.id,
    examCode: candidate.exam_code,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  }));
  return payload + "." + toBase64Url(await hmac(payload, env.CANDIDATE_SESSION_SECRET));
}

async function verifyCandidateToken(token, env) {
  if (!env.CANDIDATE_SESSION_SECRET) return null;
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  const expected = await hmac(parts[0], env.CANDIDATE_SESSION_SECRET);
  const provided = fromBase64Url(parts[1]);
  if (expected.length !== provided.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected[i] ^ provided[i];
  if (mismatch !== 0) return null;
  const payload = parseJson(new TextDecoder().decode(fromBase64Url(parts[0])), null);
  if (!payload || Number(payload.exp) < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function teacherCategoryFromCode(code) {
  const prefix = String(code || "").split("_")[0].toUpperCase();
  return ["TSA", "HSA", "VACT", "QDA", "THPT"].includes(prefix) ? prefix : "TSA";
}

function normalizeAnswerText(value) {
  return String(value == null ? "" : value).trim().toLowerCase();
}

function normalizeAnswerKey(value) {
  return String(value == null ? "" : value).trim().toUpperCase();
}

function gradeAnswer(row, userAnswer) {
  const correct = parseJson(row.correct_answer_json, row.correct_answer_json);
  const type = row.question_type;
  if (type === "single_choice" || type === "single_choice_2") {
    return userAnswer != null && normalizeAnswerKey(userAnswer) === normalizeAnswerKey(correct);
  }
  if (type === "multiple_choice") {
    if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false;
    const user = userAnswer.map(normalizeAnswerKey).filter(Boolean).sort();
    const expected = correct.map(normalizeAnswerKey).filter(Boolean).sort();
    return user.length === expected.length && expected.every((value, index) => value === user[index]);
  }
  if (type === "true_false" || type === "drag_drop") {
    const answerObject = typeof userAnswer === "string" ? parseJson(userAnswer, {}) : userAnswer;
    if (!answerObject || typeof answerObject !== "object" || Array.isArray(answerObject) || !correct || typeof correct !== "object") return false;
    const keys = Object.keys(correct);
    if (!keys.length) return false;
    if (type === "true_false") {
      return keys.every((key) => {
        const userBool = [true, "true", 1, "1"].includes(answerObject[key]);
        const correctBool = [true, "true", 1, "1"].includes(correct[key]);
        return userBool === correctBool;
      });
    }
    return keys.every((key) => normalizeAnswerText(answerObject[key]) === normalizeAnswerText(correct[key]));
  }
  if (type === "numeric_answer") {
    const user = Number(userAnswer);
    const expected = Number(correct);
    const tolerance = Number.isFinite(Number(row.tolerance)) ? Number(row.tolerance) : 0;
    return Number.isFinite(user) && Number.isFinite(expected) && Math.abs(user - expected) <= tolerance;
  }
  if (type === "fill_blank") {
    if (userAnswer && typeof userAnswer === "object" && !Array.isArray(userAnswer) && correct && typeof correct === "object" && !Array.isArray(correct)) {
      const keys = Object.keys(correct);
      return keys.length > 0 && keys.every((key) => normalizeAnswerText(userAnswer[key]) === normalizeAnswerText(correct[key]));
    }
    const accepted = [correct].concat(parseJson(row.accepted_answers_json, []) || []);
    return accepted.some((value) => normalizeAnswerText(value) === normalizeAnswerText(userAnswer) && normalizeAnswerText(value));
  }
  return false;
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch (_error) {
    return null;
  }
}

async function checkPublicRateLimit(request, context) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const minute = Math.floor(Date.now() / 60000);
  const cacheKey = new Request("https://rate-limit.invalid/mock/" + encodeURIComponent(ip) + "/" + minute);
  const current = await caches.default.match(cacheKey);
  const count = current ? Number(await current.text()) || 0 : 0;
  if (count >= 40) return false;
  context.waitUntil(caches.default.put(cacheKey, new Response(String(count + 1), { headers: { "Cache-Control": "max-age=75" } })));
  return true;
}

function isReleased(exam) {
  if (Number(exam.results_published) === 1) return true;
  return Boolean(exam.result_release_at && Date.parse(exam.result_release_at) <= Date.now());
}

function roundScore(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function gradeAttempt(keys, answerMap) {
  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  const sections = {};
  for (const row of keys) {
    const points = Number(row.points) || 1;
    const sectionAnswers = answerMap[row.subject] && typeof answerMap[row.subject] === "object" ? answerMap[row.subject] : {};
    const correct = gradeAnswer(row, sectionAnswers[row.question_no]);
    if (!sections[row.subject]) sections[row.subject] = { score: 0, maxScore: 0, correctCount: 0, totalQuestions: 0 };
    sections[row.subject].maxScore += points;
    sections[row.subject].totalQuestions++;
    maxScore += points;
    if (correct) {
      score += points;
      correctCount++;
      sections[row.subject].score += points;
      sections[row.subject].correctCount++;
    }
  }
  return { score, maxScore, correctCount, totalQuestions: keys.length, sections };
}

function answerKeyObjectNames(examCode) {
  const upper = normalizeExamCode(examCode);
  const lower = upper.toLowerCase();
  const names = [
    `data/exams/${upper}.json`,
    `data/exams/${lower}.json`
  ];
  const tsaMatch = upper.match(/^TSA(?:_EXAM_|_PRACTICE_FULL_)?(\d+)$/);
  if (tsaMatch) {
    const number = Number(tsaMatch[1]);
    const shortNumber = String(number).padStart(2, "0");
    const folderNumber = String(number).padStart(3, "0");
    names.push(`data/exams/TSA_PRACTICE_FULL_${shortNumber}.json`);
    ["math", "reading", "science"].forEach((subject) => {
      names.push(`data/exams/tsa${folderNumber}.json/${subject}.json`);
    });
  }
  return [...new Set(names)];
}

function collectAnswerKeys(value, inheritedSubject, rows) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectAnswerKeys(item, inheritedSubject, rows));
    return;
  }
  const subject = cleanText(value.section_id || value.subject || inheritedSubject, 30) || "math";
  if (value.question_no != null && value.question_type && Object.prototype.hasOwnProperty.call(value, "correct_answer")) {
    const questionNo = cleanText(value.question_no, 50);
    if (questionNo) {
      rows.set(`${subject}:${questionNo}`, {
        subject,
        questionNo,
        questionType: cleanText(value.question_type, 50) || "single_choice",
        correctAnswer: value.correct_answer,
        acceptedAnswers: value.accepted_answers == null ? null : value.accepted_answers,
        tolerance: Number.isFinite(Number(value.tolerance)) ? Number(value.tolerance) : null,
        points: Number(value.points) || 1
      });
    }
  }
  Object.entries(value).forEach(([key, child]) => {
    if (key === "options" || key === "statements" || key === "correct_answer" || key === "accepted_answers") return;
    if (child && typeof child === "object") collectAnswerKeys(child, subject, rows);
  });
}

async function readBucketJson(env, key) {
  const object = await env.BUCKET.get(key);
  if (!object) return null;
  try {
    return JSON.parse(await object.text());
  } catch (_error) {
    return null;
  }
}

async function regradePendingAttempts(env, examCode, keys) {
  const attempts = await env.DB.prepare("SELECT id, answers_json FROM mock_attempts WHERE exam_code = ? AND grading_status = 'pending'")
    .bind(examCode).all();
  const statements = (attempts.results || []).map((attempt) => {
    const graded = gradeAttempt(keys, parseJson(attempt.answers_json, {}));
    return env.DB.prepare(`UPDATE mock_attempts SET score = ?, max_score = ?, correct_count = ?, total_questions = ?,
        section_scores_json = ?, grading_status = 'graded' WHERE id = ?`)
      .bind(graded.score, graded.maxScore, graded.correctCount, graded.totalQuestions, JSON.stringify(graded.sections), attempt.id);
  });
  for (let index = 0; index < statements.length; index += 90) await env.DB.batch(statements.slice(index, index + 90));
}

async function ensureAnswerKeys(env, examCode) {
  let stored = await env.DB.prepare("SELECT * FROM mock_answer_keys WHERE exam_code = ? ORDER BY subject, question_no")
    .bind(examCode).all();
  if ((stored.results || []).length) return stored.results;

  const rows = new Map();
  for (const objectName of answerKeyObjectNames(examCode)) {
    const data = await readBucketJson(env, objectName);
    if (!data) continue;
    const subjectMatch = objectName.match(/\/(math|reading|science)\.json$/i);
    collectAnswerKeys(data, subjectMatch ? subjectMatch[1].toLowerCase() : "", rows);
  }
  const generated = [...rows.values()];
  if (!generated.length) return [];

  const statements = generated.map((row) => env.DB.prepare(`INSERT OR IGNORE INTO mock_answer_keys
      (exam_code, subject, question_no, question_type, correct_answer_json, accepted_answers_json, tolerance, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(examCode, row.subject, row.questionNo, row.questionType, JSON.stringify(row.correctAnswer),
      row.acceptedAnswers == null ? null : JSON.stringify(row.acceptedAnswers), row.tolerance, row.points));
  for (let index = 0; index < statements.length; index += 90) await env.DB.batch(statements.slice(index, index + 90));

  stored = await env.DB.prepare("SELECT * FROM mock_answer_keys WHERE exam_code = ? ORDER BY subject, question_no")
    .bind(examCode).all();
  const keys = stored.results || [];
  if (keys.length) await regradePendingAttempts(env, examCode, keys);
  return keys;
}

function calculateStats(rows) {
  const submittedRows = rows.filter((row) => row.submitted_at);
  const gradedRows = submittedRows.filter((row) => row.grading_status !== "pending");
  const scored = gradedRows.map((row) => Number(row.score) || 0).sort((a, b) => a - b);
  const maxScores = gradedRows.map((row) => Number(row.max_score) || 0);
  const count = scored.length;
  const average = count ? scored.reduce((sum, score) => sum + score, 0) / count : 0;
  const median = count ? (count % 2 ? scored[(count - 1) / 2] : (scored[count / 2 - 1] + scored[count / 2]) / 2) : 0;
  const highest = count ? scored[count - 1] : 0;
  const lowest = count ? scored[0] : 0;
  const maxScore = maxScores.length ? Math.max(...maxScores) : 0;
  const distribution = Array.from({ length: 10 }, (_, index) => ({
    label: `${index * 10}-${(index + 1) * 10}%`,
    count: 0
  }));
  gradedRows.forEach((row) => {
    const percent = Number(row.max_score) > 0 ? (Number(row.score) / Number(row.max_score)) * 100 : 0;
    distribution[Math.min(9, Math.max(0, Math.floor(percent / 10)))].count++;
  });
  return {
    registered: rows.length,
    submitted: submittedRows.length,
    gradingPending: submittedRows.length - gradedRows.length,
    pending: Math.max(0, rows.length - submittedRows.length),
    average: roundScore(average),
    median: roundScore(median),
    highest: roundScore(highest),
    lowest: roundScore(lowest),
    maxScore: roundScore(maxScore),
    distribution
  };
}

async function getDashboardRows(env, examCode) {
  const result = await env.DB.prepare(`
    SELECT c.id, c.exam_code, c.phone, c.full_name, c.date_of_birth, c.email, c.school,
           c.class_name, c.province, c.note, c.status, c.checked_in_at,
           a.score, a.max_score, a.correct_count, a.total_questions,
           a.section_scores_json, a.grading_status, a.submitted_at
    FROM mock_candidates c
    LEFT JOIN mock_attempts a ON a.candidate_id = c.id AND a.exam_code = c.exam_code
    WHERE c.exam_code = ?
    ORDER BY CASE WHEN a.submitted_at IS NULL THEN 1 ELSE 0 END, a.score DESC, c.full_name COLLATE NOCASE
  `).bind(examCode).all();
  return result.results || [];
}

async function handleCheckIn(request, env, context, json) {
  if (!await checkPublicRateLimit(request, context)) return json(request, { error: { message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút." } }, 429);
  const body = await readJsonBody(request);
  const phone = normalizePhone(body && body.phone);
  const requestedCode = normalizeExamCode(body && body.examCode);
  if (!validPhone(phone)) return json(request, { error: { message: "Số điện thoại không hợp lệ." } }, 400);

  const query = requestedCode
    ? env.DB.prepare(`SELECT c.*, e.title, e.category, e.is_open, e.result_release_at
        FROM mock_candidates c JOIN mock_exams e ON e.exam_code = c.exam_code
        WHERE c.phone = ? AND c.exam_code = ? AND c.status = 'active' AND e.is_open = 1`).bind(phone, requestedCode)
    : env.DB.prepare(`SELECT c.*, e.title, e.category, e.is_open, e.result_release_at
        FROM mock_candidates c JOIN mock_exams e ON e.exam_code = c.exam_code
        WHERE c.phone = ? AND c.status = 'active' AND e.is_open = 1 ORDER BY e.updated_at DESC`).bind(phone);
  const result = await query.all();
  const matches = result.results || [];
  if (!matches.length) return json(request, { error: { message: "Không tìm thấy mã dự thi hoặc kỳ thi chưa được mở." } }, 404);
  if (!requestedCode && matches.length > 1) {
    return json(request, {
      selectionRequired: true,
      exams: matches.map((item) => ({ examCode: item.exam_code, title: item.title, category: item.category }))
    });
  }
  const candidate = matches[0];
  const existing = await env.DB.prepare("SELECT submitted_at FROM mock_attempts WHERE exam_code = ? AND candidate_id = ?")
    .bind(candidate.exam_code, candidate.id).first();
  if (existing) return json(request, { error: { message: "Mã dự thi này đã hoàn thành bài. Hãy sang trang Tra cứu kết quả." }, alreadySubmitted: true }, 409);
  const token = await createCandidateToken(candidate, env);
  await env.DB.prepare("UPDATE mock_candidates SET checked_in_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(candidate.id).run();
  return json(request, {
    success: true,
    token,
    exam: { examCode: candidate.exam_code, title: candidate.title, category: candidate.category },
    candidate: { name: candidate.full_name, code: candidate.phone }
  });
}

async function handleSubmit(request, env, context, json) {
  if (!await checkPublicRateLimit(request, context)) return json(request, { error: { message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút." } }, 429);
  const body = await readJsonBody(request);
  const session = await verifyCandidateToken(body && body.token, env);
  if (!session) return json(request, { error: { message: "Phiên dự thi không hợp lệ hoặc đã hết hạn." } }, 401);
  const examCode = normalizeExamCode(session.examCode);
  const candidate = await env.DB.prepare(`SELECT c.id, c.status, e.is_open FROM mock_candidates c
      JOIN mock_exams e ON e.exam_code = c.exam_code WHERE c.id = ? AND c.exam_code = ?`)
    .bind(session.candidateId, examCode).first();
  if (!candidate || candidate.status !== "active" || Number(candidate.is_open) !== 1) {
    return json(request, { error: { message: "Kỳ thi đã đóng hoặc mã dự thi không còn hiệu lực." } }, 403);
  }
  const existing = await env.DB.prepare("SELECT id FROM mock_attempts WHERE exam_code = ? AND candidate_id = ?")
    .bind(examCode, candidate.id).first();
  if (existing) return json(request, { error: { message: "Bài thi đã được ghi nhận trước đó." } }, 409);
  const answerMap = body && body.answers && typeof body.answers === "object" ? body.answers : {};
  if (JSON.stringify(answerMap).length > 700000) return json(request, { error: { message: "Dữ liệu bài làm vượt giới hạn." } }, 413);
  const keys = await ensureAnswerKeys(env, examCode);
  const gradingStatus = keys.length ? "graded" : "pending";
  const graded = gradeAttempt(keys, answerMap);
  try {
    await env.DB.prepare(`INSERT INTO mock_attempts
      (exam_code, candidate_id, score, max_score, correct_count, total_questions, section_scores_json, answers_json, grading_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`) 
      .bind(examCode, candidate.id, graded.score, graded.maxScore, graded.correctCount, graded.totalQuestions,
        JSON.stringify(graded.sections), JSON.stringify(answerMap), gradingStatus).run();
  } catch (error) {
    if (String(error && error.message).toLowerCase().includes("unique")) {
      return json(request, { error: { message: "Bài thi đã được ghi nhận trước đó." } }, 409);
    }
    throw error;
  }
  return json(request, {
    success: true,
    gradingPending: gradingStatus === "pending",
    submittedAt: new Date().toISOString(),
    message: "Bài thi đã được ghi nhận. Điểm sẽ hiển thị sau khi giáo viên công bố."
  });
}

async function handleResultLookup(request, env, context, json) {
  if (!await checkPublicRateLimit(request, context)) return json(request, { error: { message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút." } }, 429);
  const body = await readJsonBody(request);
  const phone = normalizePhone(body && body.phone);
  const requestedCode = normalizeExamCode(body && body.examCode);
  if (!validPhone(phone)) return json(request, { error: { message: "Số điện thoại không hợp lệ." } }, 400);
  const query = requestedCode
    ? env.DB.prepare(`SELECT c.id AS candidate_id, c.exam_code, c.full_name, c.phone, c.date_of_birth, c.school, c.class_name,
        c.province, c.metadata_json, e.title, e.results_published, e.result_release_at,
        a.score, a.max_score, a.correct_count, a.total_questions, a.section_scores_json, a.grading_status, a.submitted_at
        FROM mock_candidates c JOIN mock_exams e ON e.exam_code = c.exam_code
        LEFT JOIN mock_attempts a ON a.candidate_id = c.id AND a.exam_code = c.exam_code
        WHERE c.phone = ? AND c.exam_code = ?`).bind(phone, requestedCode)
    : env.DB.prepare(`SELECT c.id AS candidate_id, c.exam_code, c.full_name, c.phone, c.date_of_birth, c.school, c.class_name,
        c.province, c.metadata_json, e.title, e.results_published, e.result_release_at,
        a.score, a.max_score, a.correct_count, a.total_questions, a.section_scores_json, a.grading_status, a.submitted_at
        FROM mock_candidates c JOIN mock_exams e ON e.exam_code = c.exam_code
        LEFT JOIN mock_attempts a ON a.candidate_id = c.id AND a.exam_code = c.exam_code
        WHERE c.phone = ? ORDER BY e.updated_at DESC`).bind(phone);
  const result = await query.all();
  const matches = result.results || [];
  if (!matches.length) return json(request, { error: { message: "Không tìm thấy thí sinh với số điện thoại này." } }, 404);
  if (!requestedCode && matches.length > 1) {
    return json(request, {
      selectionRequired: true,
      exams: matches.map((item) => ({
        examCode: item.exam_code,
        title: item.title,
        submitted: Boolean(item.submitted_at),
        released: item.grading_status !== "pending" && isReleased(item)
      }))
    });
  }
  const item = matches[0];
  if (!item.submitted_at) {
    return json(request, { success: true, status: "not_submitted", exam: { examCode: item.exam_code, title: item.title }, candidateName: item.full_name });
  }
  if (item.grading_status === "pending") {
    const keys = await ensureAnswerKeys(env, item.exam_code);
    if (keys.length) {
      const attempt = await env.DB.prepare("SELECT id, answers_json FROM mock_attempts WHERE exam_code = ? AND candidate_id = ?")
        .bind(item.exam_code, item.candidate_id).first();
      if (attempt) {
        const graded = gradeAttempt(keys, parseJson(attempt.answers_json, {}));
        item.grading_status = "graded";
        item.score = graded.score;
        item.max_score = graded.maxScore;
        item.correct_count = graded.correctCount;
        item.total_questions = graded.totalQuestions;
        item.section_scores_json = JSON.stringify(graded.sections);
      }
    }
  }
  if (item.grading_status === "pending") {
    return json(request, {
      success: true,
      status: "pending_grading",
      exam: { examCode: item.exam_code, title: item.title },
      candidateName: item.full_name,
      submittedAt: item.submitted_at
    });
  }
  if (!isReleased(item)) {
    return json(request, {
      success: true,
      status: "pending",
      exam: { examCode: item.exam_code, title: item.title },
      candidateName: item.full_name,
      submittedAt: item.submitted_at,
      releaseAt: item.result_release_at || null
    });
  }
  const rankRow = await env.DB.prepare(`SELECT 1 + COUNT(*) AS rank FROM mock_attempts
      WHERE exam_code = ? AND score > ?`).bind(item.exam_code, item.score).first();
  const totalRow = await env.DB.prepare("SELECT COUNT(*) AS total FROM mock_attempts WHERE exam_code = ?").bind(item.exam_code).first();
  return json(request, {
    success: true,
    status: "released",
    exam: { examCode: item.exam_code, title: item.title },
    candidateName: item.full_name,
    candidate: candidateProfile(item),
    submittedAt: item.submitted_at,
    score: roundScore(item.score),
    maxScore: roundScore(item.max_score),
    correctCount: Number(item.correct_count) || 0,
    totalQuestions: Number(item.total_questions) || 0,
    rank: Number(rankRow && rankRow.rank) || 1,
    participantCount: Number(totalRow && totalRow.total) || 1,
    sections: parseJson(item.section_scores_json, {})
  });
}

async function handleAdminUpsertExam(request, env, json) {
  const body = await readJsonBody(request);
  const code = normalizeExamCode(body && body.examCode);
  const title = cleanText(body && body.title, 200);
  if (!code || !title) return json(request, { error: { message: "Thiếu mã đề hoặc tên kỳ thi." } }, 400);
  const category = cleanText(body.category || teacherCategoryFromCode(code), 20).toUpperCase();
  const open = body.isOpen === true ? 1 : 0;
  await env.DB.prepare(`INSERT INTO mock_exams (exam_code, title, category, is_open, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(exam_code) DO UPDATE SET title = excluded.title, category = excluded.category,
      is_open = excluded.is_open, updated_at = CURRENT_TIMESTAMP`)
    .bind(code, title, category, open).run();
  return json(request, { success: true, examCode: code });
}

async function handleAdminAnswerKeys(request, env, json) {
  const body = await readJsonBody(request);
  const code = normalizeExamCode(body && body.examCode);
  const rows = Array.isArray(body && body.answers) ? body.answers : [];
  if (!code || !rows.length || rows.length > 500) return json(request, { error: { message: "Danh sách đáp án không hợp lệ." } }, 400);
  const exam = await env.DB.prepare("SELECT exam_code FROM mock_exams WHERE exam_code = ?").bind(code).first();
  if (!exam) return json(request, { error: { message: "Hãy tạo cấu hình kỳ thi trước khi lưu đáp án." } }, 409);
  await env.DB.prepare("DELETE FROM mock_answer_keys WHERE exam_code = ?").bind(code).run();
  const statements = rows.map((row) => env.DB.prepare(`INSERT INTO mock_answer_keys
      (exam_code, subject, question_no, question_type, correct_answer_json, accepted_answers_json, tolerance, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      code,
      cleanText(row.subject, 30) || "math",
      cleanText(row.questionNo, 50),
      cleanText(row.questionType, 50) || "single_choice",
      JSON.stringify(row.correctAnswer),
      row.acceptedAnswers == null ? null : JSON.stringify(row.acceptedAnswers),
      Number.isFinite(Number(row.tolerance)) ? Number(row.tolerance) : null,
      Number(row.points) || 1
    ));
  for (let index = 0; index < statements.length; index += 90) await env.DB.batch(statements.slice(index, index + 90));
  const storedKeys = await env.DB.prepare("SELECT * FROM mock_answer_keys WHERE exam_code = ? ORDER BY subject, question_no").bind(code).all();
  const attempts = await env.DB.prepare("SELECT id, answers_json FROM mock_attempts WHERE exam_code = ?").bind(code).all();
  const regradeStatements = (attempts.results || []).map((attempt) => {
    const graded = gradeAttempt(storedKeys.results || [], parseJson(attempt.answers_json, {}));
    return env.DB.prepare(`UPDATE mock_attempts SET score = ?, max_score = ?, correct_count = ?, total_questions = ?,
        section_scores_json = ?, grading_status = 'graded' WHERE id = ?`)
      .bind(graded.score, graded.maxScore, graded.correctCount, graded.totalQuestions, JSON.stringify(graded.sections), attempt.id);
  });
  for (let index = 0; index < regradeStatements.length; index += 90) await env.DB.batch(regradeStatements.slice(index, index + 90));
  return json(request, { success: true, saved: rows.length, regraded: regradeStatements.length });
}

async function handleAdminImportCandidates(request, env, json) {
  const body = await readJsonBody(request);
  const code = normalizeExamCode(body && body.examCode);
  const candidates = Array.isArray(body && body.candidates) ? body.candidates : [];
  if (!code || !candidates.length || candidates.length > MAX_CANDIDATES_PER_IMPORT) {
    return json(request, { error: { message: `Danh sách phải có từ 1 đến ${MAX_CANDIDATES_PER_IMPORT} thí sinh.` } }, 400);
  }
  const exam = await env.DB.prepare("SELECT exam_code FROM mock_exams WHERE exam_code = ?").bind(code).first();
  if (!exam) return json(request, { error: { message: "Kỳ thi chưa được tạo trên hệ thống." } }, 409);
  const valid = [];
  const invalidRows = [];
  const seen = new Set();
  candidates.forEach((candidate, index) => {
    const phone = normalizePhone(candidate.phone);
    const name = cleanText(candidate.fullName || candidate.name, 160);
    if (!validPhone(phone) || !name || seen.has(phone)) {
      invalidRows.push(index + 2);
      return;
    }
    seen.add(phone);
    valid.push({
      phone,
      name,
      dateOfBirth: cleanText(candidate.dateOfBirth, 30),
      email: cleanText(candidate.email, 160),
      school: cleanText(candidate.school, 200),
      className: cleanText(candidate.className, 80),
      province: cleanText(candidate.province, 120),
      note: cleanText(candidate.note, 500),
      metadata: {
        ...(candidate.metadata && typeof candidate.metadata === "object" ? candidate.metadata : {}),
        gender: cleanText(candidate.gender, 30),
        idNumber: cleanText(candidate.idNumber, 40)
      }
    });
  });
  if (!valid.length) return json(request, { error: { message: "Không có dòng thí sinh hợp lệ trong tệp." }, invalidRows }, 400);
  if (body.replace === true) await env.DB.prepare("DELETE FROM mock_candidates WHERE exam_code = ?").bind(code).run();
  const statements = valid.map((candidate) => env.DB.prepare(`INSERT INTO mock_candidates
      (exam_code, phone, phone_last4, full_name, date_of_birth, email, school, class_name, province, note, metadata_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(exam_code, phone) DO UPDATE SET full_name = excluded.full_name,
      date_of_birth = excluded.date_of_birth, email = excluded.email, school = excluded.school,
      class_name = excluded.class_name, province = excluded.province, note = excluded.note,
      metadata_json = excluded.metadata_json, status = 'active', updated_at = CURRENT_TIMESTAMP`)
    .bind(code, candidate.phone, candidate.phone.slice(-4), candidate.name, candidate.dateOfBirth || null,
      candidate.email || null, candidate.school || null, candidate.className || null, candidate.province || null,
      candidate.note || null, JSON.stringify(candidate.metadata)));
  for (let index = 0; index < statements.length; index += 90) await env.DB.batch(statements.slice(index, index + 90));
  return json(request, { success: true, imported: valid.length, invalidRows });
}

async function handleAdminDashboard(request, env, url, json) {
  const code = normalizeExamCode(url.searchParams.get("examCode"));
  if (!code) return json(request, { error: { message: "Thiếu mã kỳ thi." } }, 400);
  const exam = await env.DB.prepare("SELECT * FROM mock_exams WHERE exam_code = ?").bind(code).first();
  if (!exam) return json(request, { error: { message: "Kỳ thi chưa có dữ liệu vận hành." } }, 404);
  const rows = await getDashboardRows(env, code);
  return json(request, {
    success: true,
    exam: {
      examCode: exam.exam_code,
      title: exam.title,
      category: exam.category,
      isOpen: Number(exam.is_open) === 1,
      resultsPublished: Number(exam.results_published) === 1,
      resultReleaseAt: exam.result_release_at,
      sheetUrl: exam.sheet_url
    },
    stats: calculateStats(rows),
    candidates: rows.map((row) => ({
      id: row.id,
      phone: row.phone,
      fullName: row.full_name,
      dateOfBirth: row.date_of_birth,
      email: row.email,
      school: row.school,
      className: row.class_name,
      province: row.province,
      note: row.note,
      status: row.status,
      checkedInAt: row.checked_in_at,
      submittedAt: row.submitted_at,
      gradingStatus: row.grading_status || null,
      score: row.submitted_at && row.grading_status !== "pending" ? roundScore(row.score) : null,
      maxScore: row.submitted_at && row.grading_status !== "pending" ? roundScore(row.max_score) : null,
      correctCount: row.submitted_at && row.grading_status !== "pending" ? Number(row.correct_count) : null,
      totalQuestions: row.submitted_at && row.grading_status !== "pending" ? Number(row.total_questions) : null,
      sections: parseJson(row.section_scores_json, {})
    }))
  });
}

async function handleAdminPublish(request, env, json) {
  const body = await readJsonBody(request);
  const code = normalizeExamCode(body && body.examCode);
  if (!code) return json(request, { error: { message: "Thiếu mã kỳ thi." } }, 400);
  const releaseAt = body.releaseAt ? new Date(body.releaseAt) : null;
  if (releaseAt && Number.isNaN(releaseAt.getTime())) return json(request, { error: { message: "Thời điểm công bố không hợp lệ." } }, 400);
  await env.DB.prepare(`UPDATE mock_exams SET results_published = ?, result_release_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE exam_code = ?`).bind(body.published === true ? 1 : 0, releaseAt ? releaseAt.toISOString() : null, code).run();
  return json(request, { success: true });
}

function csvCell(value) {
  let text = String(value == null ? "" : value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function makeCsv(exam, rows) {
  const headers = ["Mã đề", "Tên kỳ thi", "Họ và tên", "Số điện thoại", "Ngày sinh", "Email", "Trường", "Lớp", "Tỉnh/Thành", "Trạng thái", "Điểm", "Điểm tối đa", "Số câu đúng", "Tổng số câu", "Thời gian nộp"];
  const lines = [headers.map(csvCell).join(",")];
  rows.forEach((row) => lines.push([
    exam.exam_code, exam.title, row.full_name, row.phone, row.date_of_birth, row.email, row.school,
    row.class_name, row.province, row.submitted_at ? (row.grading_status === "pending" ? "Chờ chấm" : "Đã nộp") : "Chưa nộp",
    row.grading_status === "pending" ? "" : row.score, row.grading_status === "pending" ? "" : row.max_score,
    row.grading_status === "pending" ? "" : row.correct_count, row.grading_status === "pending" ? "" : row.total_questions, row.submitted_at
  ].map(csvCell).join(",")));
  return "\uFEFF" + lines.join("\r\n");
}

async function handleAdminExport(request, env, url, corsHeaders, json) {
  const code = normalizeExamCode(url.searchParams.get("examCode"));
  const exam = await env.DB.prepare("SELECT * FROM mock_exams WHERE exam_code = ?").bind(code).first();
  if (!exam) return json(request, { error: { message: "Không tìm thấy kỳ thi." } }, 404);
  const rows = await getDashboardRows(env, code);
  return new Response(makeCsv(exam, rows), {
    headers: {
      ...corsHeaders(request),
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${code}-ket-qua.csv"`,
      "Cache-Control": "no-store"
    }
  });
}

async function handleAdminSyncSheet(request, env, json) {
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return json(request, { error: { message: "Chưa cấu hình GOOGLE_SHEETS_WEBHOOK_URL. Bạn vẫn có thể xuất CSV và mở bằng Google Sheets." } }, 501);
  }
  const body = await readJsonBody(request);
  const code = normalizeExamCode(body && body.examCode);
  const exam = await env.DB.prepare("SELECT * FROM mock_exams WHERE exam_code = ?").bind(code).first();
  if (!exam) return json(request, { error: { message: "Không tìm thấy kỳ thi." } }, 404);
  const rows = await getDashboardRows(env, code);
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exam, stats: calculateStats(rows), candidates: rows })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json(request, { error: { message: result.message || "Google Sheets không nhận được dữ liệu." } }, 502);
  const sheetUrl = cleanText(result.sheetUrl || result.url, 1000);
  if (sheetUrl) await env.DB.prepare("UPDATE mock_exams SET sheet_url = ?, updated_at = CURRENT_TIMESTAMP WHERE exam_code = ?").bind(sheetUrl, code).run();
  return json(request, { success: true, sheetUrl: sheetUrl || null });
}

export async function handleMockExamRequest(request, env, context, helpers) {
  const { json, corsHeaders, verifyTeacher } = helpers;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/mock/")) return null;
  if (!env.DB) return json(request, { error: { message: "Cloudflare D1 chưa được gắn với Worker." } }, 503);

  try {
    if (url.pathname === "/mock/check-in" && request.method === "POST") return handleCheckIn(request, env, context, json);
    if (url.pathname === "/mock/submit" && request.method === "POST") return handleSubmit(request, env, context, json);
    if (url.pathname === "/mock/result" && request.method === "POST") return handleResultLookup(request, env, context, json);

    if (!url.pathname.startsWith("/mock/admin/")) return json(request, { error: "Not found" }, 404);
    const auth = await verifyTeacher(request, env, context);
    if (!auth.ok) return json(request, { error: { message: auth.message } }, auth.status);

    if (url.pathname === "/mock/admin/exams/upsert" && request.method === "POST") return handleAdminUpsertExam(request, env, json);
    if (url.pathname === "/mock/admin/answer-keys" && request.method === "POST") return handleAdminAnswerKeys(request, env, json);
    if (url.pathname === "/mock/admin/candidates/import" && request.method === "POST") return handleAdminImportCandidates(request, env, json);
    if (url.pathname === "/mock/admin/dashboard" && request.method === "GET") return handleAdminDashboard(request, env, url, json);
    if (url.pathname === "/mock/admin/publish" && request.method === "POST") return handleAdminPublish(request, env, json);
    if (url.pathname === "/mock/admin/export.csv" && request.method === "GET") return handleAdminExport(request, env, url, corsHeaders, json);
    if (url.pathname === "/mock/admin/sync-sheet" && request.method === "POST") return handleAdminSyncSheet(request, env, json);
    return json(request, { error: "Not found" }, 404);
  } catch (error) {
    console.error("Mock exam API failed", error);
    return json(request, { error: { message: "Hệ thống thi thử đang bận. Vui lòng thử lại.", detail: String(error && error.message || error) } }, 500);
  }
}
