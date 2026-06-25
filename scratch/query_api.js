const https = require('https');

const title = "File:Vòng tròn Chim Lạc.svg";
const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(url, options, (res) => {
  let body = "";
  res.on("data", (chunk) => { body += chunk; });
  res.on("end", () => {
    try {
      const data = JSON.parse(body);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Parse error:", e.message);
    }
  });
}).on("error", (e) => {
  console.error("HTTP error:", e.message);
});
