/**
 * 修正「貨物賣出 2/5，再賣剩下一半」類題目
 * 
 * 正確邏輯：剩下 = 原有 × 3/10
 * 所以原有 = 剩下 × 10/3
 * 
 * 為了讓答案是整數，剩下件數必須是 3 的倍數
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const questions = data.questions;

// 找出有問題的題目模式
const pattern = /一批貨物第一天賣出 2\/5，第二天賣出剩下的一半，還剩 (\d+) 件/;

// 修正映射：原本的「剩下」 → 改成 3 的倍數
const corrections = {
  '20': { newRemain: 30, newOriginal: 100 },
  '40': { newRemain: 30, newOriginal: 100 },  // 改成 30
  '50': { newRemain: 60, newOriginal: 200 },  // 改成 60
  '60': { newRemain: 60, newOriginal: 200 },  // 原本就對
};

let fixedCount = 0;
let removedCount = 0;
const seenQuestions = new Set();

const fixedQuestions = questions.filter(q => {
  const match = q.content.match(pattern);
  if (!match) return true;
  
  const remain = match[1];
  const correction = corrections[remain];
  
  if (!correction) {
    console.log(`⚠️ 未處理: 剩 ${remain} 件 (ID: ${q.id})`);
    return true;
  }
  
  // 檢查是否重複
  const signature = `${q.grade}-${correction.newRemain}-${correction.newOriginal}`;
  if (seenQuestions.has(signature)) {
    console.log(`🗑️ 移除重複: ${q.id}`);
    removedCount++;
    return false;
  }
  seenQuestions.add(signature);
  
  // 修正題目
  const oldContent = q.content;
  q.content = q.content.replace(`還剩 ${remain} 件`, `還剩 ${correction.newRemain} 件`);
  
  // 修正選項
  const correctAnswer = correction.newOriginal;
  q.options = [
    String(correctAnswer),
    String(correctAnswer + 50),
    String(correctAnswer - 20),
    String(correctAnswer + 80)
  ];
  q.answer = 0;
  
  // 修正解析
  q.explanation = `【解題步驟】
1. 第一天賣出 2/5，剩下 1 - 2/5 = 3/5
2. 第二天賣出剩下的一半，剩 (3/5) × (1/2) = 3/10
3. 剩下的 3/10 = ${correction.newRemain} 件
4. 原有 = ${correction.newRemain} ÷ (3/10) = ${correction.newRemain} × (10/3) = ${correctAnswer} 件

💡 小提醒：先算剩下比例，再用剩餘件數反推原數量
⚠️ 常見錯誤：把「剩下一半」誤解為「原本的一半」`;
  
  console.log(`✅ 修正: ${q.id}`);
  console.log(`   ${oldContent}`);
  console.log(`   → ${q.content}`);
  console.log(`   答案: ${correctAnswer}`);
  fixedCount++;
  
  return true;
});

data.questions = fixedQuestions;
fs.writeFileSync(questionsPath, JSON.stringify(data, null, 2));

console.log(`\n📊 修正完成:`);
console.log(`   修正: ${fixedCount} 題`);
console.log(`   移除重複: ${removedCount} 題`);
console.log(`   剩餘總題數: ${fixedQuestions.length}`);
