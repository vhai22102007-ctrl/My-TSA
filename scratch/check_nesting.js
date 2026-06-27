const fs = require('fs');

const html = fs.readFileSync('select.html', 'utf8');

// Find indices
const mainIdx = html.indexOf('class="course-study-main"');
const sidebarIdx = html.indexOf('class="course-study-sidebar"');
const layoutIdx = html.indexOf('class="course-study-layout"');

console.log(`layoutIdx: ${layoutIdx}`);
console.log(`mainIdx: ${mainIdx}`);
console.log(`sidebarIdx: ${sidebarIdx}`);

if (sidebarIdx > mainIdx) {
    // Check if there is a closing div for course-study-main before sidebarIdx
    const textBetween = html.substring(mainIdx, sidebarIdx);
    
    // Count open and close divs in textBetween
    let openCount = (textBetween.match(/<div\b/g) || []).length;
    let closeCount = (textBetween.match(/<\/div>/g) || []).length;
    
    console.log(`Divs opened between main and sidebar: ${openCount}`);
    console.log(`Divs closed between main and sidebar: ${closeCount}`);
    console.log(`Net open divs: ${openCount - closeCount}`);
    
    if (openCount - closeCount > 0) {
        console.log("CRITICAL ERROR: course-study-sidebar is INSIDE course-study-main!");
    } else {
        console.log("SUCCESS: course-study-sidebar is outside course-study-main.");
    }
}
