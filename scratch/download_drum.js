const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://upload.wikimedia.org/wikipedia/commons/1/16/Tr%E1%BB%91ng_%C4%91%E1%BB%93ng_%C4%90%C3%B4ng_S%C6%A1n.svg";
const destPath = "c:\\Users\\vhai2\\OneDrive\\Desktop\\MY TSA\\assets\\trong-dong.svg";

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

console.log(`Downloading detailed drum from ${url}...`);

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
    console.log('Detailed drum download completed successfully!');
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
