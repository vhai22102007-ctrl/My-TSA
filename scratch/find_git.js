const fs = require('fs');
const path = require('path');

const possiblePaths = [
    'C:\\Program Files\\Git\\bin\\git.exe',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files (x86)\\Git\\bin\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
    path.join(process.env.USERPROFILE, 'AppData\\Local\\Programs\\Git\\bin\\git.exe'),
    path.join(process.env.USERPROFILE, 'AppData\\Local\\Programs\\Git\\cmd\\git.exe')
];

possiblePaths.forEach(p => {
    if (fs.existsSync(p)) {
        console.log(`Found git: ${p}`);
    }
});
console.log("Check complete.");
