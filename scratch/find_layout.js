const { execSync } = require('child_process');
const path = require('path');

const commits = ['8b8190e', 'da8b42f', 'aeb5afb', '7d5acc3', 'efc6ac5', '91ad1c0', '2c0c242'];
const gitPath = 'C:\\Users\\vhai2\\AppData\\Local\\GitHubDesktop\\app-3.6.1\\resources\\app\\git\\cmd\\git.exe';

commits.forEach(commit => {
  try {
    const content = execSync(`"${gitPath}" show ${commit}:select.html`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const modalStart = content.indexOf('id="exam-result-modal"');
    if (modalStart !== -1) {
      console.log(`=== COMMIT ${commit} ===`);
      // Find the parent div start by backtracking or just show from 100 chars before
      const startPos = Math.max(0, modalStart - 100);
      console.log(content.substring(startPos, startPos + 1000));
    } else {
      console.log(`=== COMMIT ${commit} : exam-result-modal not found ===`);
    }
  } catch (e) {
    console.log(`Failed for commit ${commit}: ${e.message}`);
  }
});
