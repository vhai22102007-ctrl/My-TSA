const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://bkkcrmxxqftgyegdotnh.supabase.co';
const anonKey = 'sb_publishable_p9BvyaPEvilfk0xsS4aFLw_er7tJzgR';

const emptyExam = {
  "exam_code": "TSA001",
  "title": "Thi thử Bài thi Đánh giá tư duy TSA",
  "duration_minutes": 45,
  "status": "published",
  "sections": [
    {
      "section_id": "math",
      "section_label": "Tư duy Toán học",
      "layout": "single",
      "questions": []
    },
    {
      "section_id": "reading",
      "section_label": "Đọc hiểu",
      "layout": "passage",
      "groups": []
    },
    {
      "section_id": "science",
      "section_label": "Khoa học",
      "layout": "passage",
      "groups": []
    }
  ]
};

const originalIndex = [
  {
    "exam_code": "TSA001",
    "title": "Đề TSA số 01 - Tư duy Toán học",
    "subject": "math",
    "subject_label": "Tư duy Toán học",
    "duration_minutes": 45,
    "question_count": 0,
    "file": "data/exams/TSA001.json",
    "status": "published"
  },
  {
    "exam_code": "TSA001",
    "title": "Đề TSA số 01 - Đọc hiểu",
    "subject": "reading",
    "subject_label": "Đọc hiểu",
    "duration_minutes": 45,
    "question_count": 0,
    "file": "data/exams/TSA001.json",
    "status": "published"
  },
  {
    "exam_code": "TSA001",
    "title": "Đề TSA số 01 - Khoa học",
    "subject": "science",
    "subject_label": "Khoa học",
    "duration_minutes": 45,
    "question_count": 0,
    "file": "data/exams/TSA001.json",
    "status": "published"
  }
];

function uploadFileContent(filename, contentStr) {
  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/storage/v1/object/exams/${encodeURIComponent(filename)}`;

    const options = {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'x-upsert': 'true',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(contentStr)
      }
    };

    console.log(`Wiping and uploading empty ${filename} to Supabase...`);
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Successfully synced empty ${filename} (Status: ${res.statusCode})`);
          resolve(data);
        } else {
          reject(new Error(`Failed to sync ${filename}. Status: ${res.statusCode}, Response: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(contentStr);
    req.end();
  });
}

async function run() {
  try {
    const examStr = JSON.stringify(emptyExam, null, 4);
    const indexStr = JSON.stringify(originalIndex, null, 4);

    // 1. Write locally
    fs.writeFileSync('data/exams/TSA001.json', examStr, 'utf8');
    console.log('Wrote empty skeleton to local data/exams/TSA001.json');

    fs.writeFileSync('data/exams/index.json', indexStr, 'utf8');
    console.log('Wrote original empty list to local data/exams/index.json');

    // 2. Sync to Supabase Storage
    await uploadFileContent('TSA001.json', examStr);
    await uploadFileContent('index.json', indexStr);

    console.log('\nSuccessfully wiped all 40 questions from all platforms (Local & Cloud Supabase)!');
  } catch (error) {
    console.error('\nWipe failed:', error.message);
  }
}

run();
