const https = require('https');

const queryUrl = "https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=Chim%20L%E1%BA%A1c%20file:svg&srnamespace=6&format=json";

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(queryUrl, options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    try {
      const data = JSON.parse(body);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Parse error:", e);
    }
  });
}).on("error", (e) => {
  console.error("HTTP error:", e);
});
