/**
 * 修復最後的重複 ID
 */

const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../src/data/questions.json');
const data = JSON.parse(fs.readFileSync(mainPath, 'utf8'));

const seen = new Set();
let removed = 0;

data.questions = data.questions.filter(q => {
  if (seen.has(q.id)) {
    console.log(`移除重複: ${q.id}`);
    removed++;
    return false;
  }
  seen.add(q.id);
  return true;
});

fs.writeFileSync(mainPath, JSON.stringify(data, null, 2));
console.log(`\n✅ 移除 ${removed} 個重複，剩餘 ${data.questions.length} 題`);
