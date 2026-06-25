const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://upload.wikimedia.org/wikipedia/commons/2/2c/V%C3%B2ng_tr%C3%B2n_Chim_L%E1%BA%A1c.svg";
const destPath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\chim-lac.svg";

// Ensure directory exists
const dir = path.dirname(destPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};

console.log(`Downloading from ${url}...`);

https.get(url, options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Request Failed. Status Code: ${res.statusCode}`);
    res.resume();
    return;
  }

  const fileStream = fs.createWriteStream(destPath);
  res.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Download completed successfully!');
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
