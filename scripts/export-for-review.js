/**
 * 輸出所有題目供人工審查
 */
const fs = require('fs');
const path = require('path');

const mainData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questions.json'), 'utf8'));
const geoData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questions-geometry.json'), 'utf8'));
const privateData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questions-private-school.json'), 'utf8'));

const allQuestions = [
  ...mainData.questions,
  ...geoData.questions,
  ...(privateData.units?.flatMap(u => u.questions) || [])
];

let output = `題庫人工審查清單\n`;
output += `總題數: ${allQuestions.length}\n`;
output += `生成時間: ${new Date().toLocaleString('zh-TW')}\n`;
output += `${'='.repeat(80)}\n\n`;

allQuestions.forEach((q, idx) => {
  const answerLetter = ['A', 'B', 'C', 'D'][q.answer];
  output += `【${idx + 1}】${q.id} | ${q.grade}年級 | ${q.category} | ${q.difficulty}\n`;
  output += `題目: ${q.content}\n`;
  output += `選項:\n`;
  q.options.forEach((opt, i) => {
    const mark = i === q.answer ? '✓' : ' ';
    output += `  ${mark} ${['A', 'B', 'C', 'D'][i]}. ${opt}\n`;
  });
  output += `正確答案: ${answerLetter}\n`;
  if (q.explanation) {
    output += `解析: ${q.explanation.substring(0, 100)}${q.explanation.length > 100 ? '...' : ''}\n`;
  }
  output += `${'─'.repeat(80)}\n\n`;
});

fs.writeFileSync(path.join(__dirname, 'all-questions-review.txt'), output);
console.log(`已輸出 ${allQuestions.length} 題到 all-questions-review.txt`);
