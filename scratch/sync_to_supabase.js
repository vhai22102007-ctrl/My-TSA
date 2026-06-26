const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://bkkcrmxxqftgyegdotnh.supabase.co';
const anonKey = 'sb_publishable_p9BvyaPEvilfk0xsS4aFLw_er7tJzgR';

function uploadFile(filename, localPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(localPath)) {
      return reject(new Error(`Local file not found: ${localPath}`));
    }

    const fileContent = fs.readFileSync(localPath, 'utf8');
    const url = `${supabaseUrl}/storage/v1/object/exams/${encodeURIComponent(filename)}`;

    const options = {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'x-upsert': 'true',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(fileContent)
      }
    };

    console.log(`Uploading ${filename} to Supabase Storage...`);
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Successfully uploaded ${filename} (Status: ${res.statusCode})`);
          resolve(data);
        } else {
          reject(new Error(`Failed to upload ${filename}. Status: ${res.statusCode}, Response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(fileContent);
    req.end();
  });
}

async function run() {
  try {
    // 1. Upload TSA001.json
    await uploadFile('TSA001.json', 'data/exams/TSA001.json');
    // 2. Upload index.json
    await uploadFile('index.json', 'data/exams/index.json');
    console.log('\nAll files synced to Supabase Storage successfully!');
  } catch (error) {
    console.error('\nSync failed:', error.message);
  }
}

run();
