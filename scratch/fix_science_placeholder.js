const fs = require('fs');
let c = fs.readFileSync('teacher.html', 'utf8');

// Find science title input line and add placeholder
// Old: id="science-' + gId + '-title" value="...">\
// New: id="science-' + gId + '-title" value="..." placeholder="...">

c = c.replace(
  `'<div class="field full"><label>Tiêu đề ngữ liệu ' + gIdx + '</label><input class="input" id="science-' + gId + '-title" value="' + attr(group.title || "") + '"></div>' +\n                '<div class="field full"><label>Nội dung văn bản / dữ liệu ' + gIdx + '</label><textarea class="textarea" id="science-' + gId + '-text" style="min-height:240px;">' + esc(group.stimulus?.content || "") + '</textarea></div>' +`,
  `'<div class="field full"><label>Tiêu đề ngữ liệu ' + gIdx + '</label><input class="input" id="science-' + gId + '-title" value="' + attr(group.title || "") + '" placeholder="Ví dụ: Ngữ liệu Khoa học số 0' + gIdx + '"></div>' +\n                '<div class="field full"><label>Nội dung văn bản / dữ liệu ' + gIdx + '</label><textarea class="textarea" id="science-' + gId + '-text" style="min-height:240px;" placeholder="Nhập nội dung dữ liệu khoa học ' + gIdx + ' vào đây...">' + esc(group.stimulus?.content || "") + '</textarea></div>' +`
);

fs.writeFileSync('teacher.html', c);
console.log('Done. Lines with science title/text:', c.includes('Ví dụ: Ngữ liệu Khoa học'));
