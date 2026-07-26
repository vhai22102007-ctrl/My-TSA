function preprocessMathContent(text) {
  if (!text) return "";
  var str = String(text);

  // Strip Markdown bold **text** or ++text++ -> <strong>text</strong>
  str = str.replace(/\*\*(.*?)\*\*/g, '$1');
  str = str.replace(/\+\+(.*?)\+\+/g, '$1');

  // Clean up double escaped backslashes and redundant \displaystyle
  str = str.replace(/\\\\/g, '\\');
  str = str.replace(/\\\(\\displaystyle\s*/g, '\\(');
  str = str.replace(/\$\\displaystyle\s*/g, '$');
  
  // Replace \frac with \dfrac for better rendering
  str = str.replace(/\\frac(?![a-zA-Z])/g, '\\dfrac');

  // Replace asterisks * used as bullets with a clean bullet on a new line
  str = str.replace(/([^\n])\s*[\*•]\s+/g, '$1<br>&bull; ');
  str = str.replace(/(^|\n)\s*[\*•]\s+/g, '$1&bull; ');

  // Force line break before numbered steps like " 2. ", " 3. ", " 4. "
  str = str.replace(/([^\n])\s*(\d+\.\s+)(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ])/g, '$1<br><br><strong>$2</strong>');

  return str;
}

const sample = `1. Xác định các đại lượng đã cho: * Công suất nhiệt của bộ phận làm nóng, ký hiệu là P: P = 32,6 kW. * Tốc độ tăng nhiệt độ của phòng tắm hơi, ký hiệu là Delta T: 0,27 °C/s. 2. Chuyển đổi đơn vị về hệ SI: * Công suất P: P = 32,6 kW = 32600 W. * Tốc độ tăng nhiệt độ Delta T: Delta T = 0,27 K/s. 3. Thiết lập công thức liên hệ: Công suất nhiệt P là nhiệt lượng truyền đi trong một đơn vị thời gian.`;

console.log('--- RAW SAMPLE ---');
console.log(sample);
console.log('--- FORMATTED HTML ---');
console.log(preprocessMathContent(sample));
