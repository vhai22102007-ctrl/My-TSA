const { execSync } = require('child_process');
const path = require('path');

const paths = [
  'git',
  'C:\\Program Files\\Git\\bin\\git.exe',
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\bin\\git.exe',
  'C:\\Program Files (x86)\\Git\\cmd\\git.exe'
];

if (process.env.LOCALAPPDATA) {
  paths.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'bin', 'git.exe'));
  paths.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'cmd', 'git.exe'));
}

let restored = false;
for (const p of paths) {
  try {
    execSync(`"${p}" checkout js/teacher-page.js`, { stdio: 'inherit' });
    console.log("Restored successfully using path:", p);
    restored = true;
    break;
  } catch (err) {
    // try next
  }
}

if (!restored) {
  console.log("Could not find Git path. Checking git version...");
  try {
    execSync('git --version', { stdio: 'inherit' });
  } catch (e) {
    console.log("Git is not installed on this machine.");
  }
}
