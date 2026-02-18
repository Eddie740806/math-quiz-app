/**
 * 修正批量生成的錯題
 * 主要問題：
 * 1. 分數賣出題：公式錯誤
 * 2. 工作問題：合作天數公式錯誤
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
let questions = data.questions;

let fixed = 0;
let removed = 0;

// ===== 1. 修正分數賣出題 =====
// 公式：剩下 = 原有 × (1 - a/b) × (1 - c/d)
// 所以原有 = 剩下 / [(1 - a/b) × (1 - c/d)]

const fractionPattern = /第一天賣出\s*(\d+)\/(\d+).*?第二天賣出.*?剩下.*?(?:的)?(?:(\d+)\/(\d+)|一半).*?還剩\s*(\d+)\s*件/;

questions = questions.map(q => {
  const match = q.content.match(fractionPattern);
  if (!match) return q;
  
  const a1 = Number(match[1]);
  const b1 = Number(match[2]);
  // 第二天：如果沒匹配到分數，預設是 1/2（一半）
  const a2 = match[3] ? Number(match[3]) : 1;
  const b2 = match[4] ? Number(match[4]) : 2;
  const remain = Number(match[5]);
  
  const remainRatio = (1 - a1/b1) * (1 - a2/b2);
  const original = remain / remainRatio;
  
  // 檢查是否為整數
  if (Math.abs(original - Math.round(original)) > 0.01) {
    // 不是整數，需要調整 remain
    // 找一個讓答案為整數的 remain（改成 remainRatio 的倍數）
    const multiplier = Math.ceil(1 / remainRatio);
    const newRemain = Math.round(multiplier * remainRatio) * Math.ceil(remain / (multiplier * remainRatio));
    const newOriginal = Math.round(newRemain / remainRatio);
    
    // 太複雜了，直接移除這題
    console.log(`🗑️ 移除無法修正的分數題: ${q.id}`);
    removed++;
    return null;
  }
  
  const correctAnswer = Math.round(original);
  const currentAnswer = parseInt(q.options[q.answer]);
  
  if (currentAnswer !== correctAnswer) {
    console.log(`✅ 修正分數題: ${q.id}`);
    console.log(`   ${remain} ÷ ${remainRatio.toFixed(4)} = ${correctAnswer} (原答案: ${currentAnswer})`);
    
    q.options = [
      String(correctAnswer),
      String(correctAnswer + 20),
      String(correctAnswer - 10 > 0 ? correctAnswer - 10 : correctAnswer + 30),
      String(correctAnswer + 50)
    ];
    q.answer = 0;
    q.explanation = `【解題步驟】
1. 第一天賣出 ${a1}/${b1}，剩下 ${b1-a1}/${b1}
2. 第二天賣出剩下的 ${a2}/${b2}，剩 (${b1-a1}/${b1}) × (${b2-a2}/${b2}) = ${remainRatio.toFixed(4)}
3. 剩下 ${remainRatio.toFixed(4)} = ${remain} 件
4. 原有 = ${remain} ÷ ${remainRatio.toFixed(4)} = ${correctAnswer} 件`;
    fixed++;
  }
  
  return q;
}).filter(q => q !== null);

// ===== 2. 修正工作問題 =====
// 公式：合作天數 = (甲天數 × 乙天數) / (甲天數 + 乙天數)

const workPattern = /甲.*?(\d+)\s*天.*?完成.*?乙.*?(\d+)\s*天.*?完成.*?合[作做].*?[幾多少]\s*天/;

questions = questions.map(q => {
  const match = q.content.match(workPattern);
  if (!match) return q;
  
  const daysA = Number(match[1]);
  const daysB = Number(match[2]);
  const correctAnswer = (daysA * daysB) / (daysA + daysB);
  
  // 四捨五入到小數點後一位
  const roundedAnswer = Math.round(correctAnswer * 10) / 10;
  const currentAnswer = parseFloat(q.options[q.answer]);
  
  if (Math.abs(currentAnswer - roundedAnswer) > 0.2) {
    console.log(`✅ 修正工作題: ${q.id}`);
    console.log(`   (${daysA} × ${daysB}) / (${daysA} + ${daysB}) = ${roundedAnswer} (原答案: ${currentAnswer})`);
    
    // 生成干擾選項
    const distractors = [
      roundedAnswer + 1.5,
      roundedAnswer - 1 > 0 ? roundedAnswer - 1 : roundedAnswer + 2,
      roundedAnswer + 3
    ];
    
    q.options = [
      String(roundedAnswer),
      String(distractors[0]),
      String(distractors[1]),
      String(distractors[2])
    ];
    q.answer = 0;
    q.explanation = `【解題步驟】
1. 甲每天完成 1/${daysA} 的工作量
2. 乙每天完成 1/${daysB} 的工作量
3. 合作每天完成 1/${daysA} + 1/${daysB} = ${((1/daysA + 1/daysB)).toFixed(4)}
4. 完成全部需要 1 ÷ ${((1/daysA + 1/daysB)).toFixed(4)} ≈ ${roundedAnswer} 天

💡 公式：合作天數 = (甲天數 × 乙天數) ÷ (甲天數 + 乙天數)`;
    fixed++;
  }
  
  return q;
});

// ===== 3. 移除明顯有問題且難以修正的題目 =====
const problemIds = [
  'g5-sh-010',  // 買雞蛋比較，邏輯複雜
  'g5-af-505',  // 濃度問題，題目本身有誤
  'g6-cn-001',  // 濃度問題，公式理解錯誤
  'g6-pf-208',  // 利潤計算，多重條件
];

const beforeCount = questions.length;
questions = questions.filter(q => !problemIds.includes(q.id));
removed += beforeCount - questions.length;

// 儲存
data.questions = questions;
fs.writeFileSync(questionsPath, JSON.stringify(data, null, 2));

console.log(`\n📊 修正完成:`);
console.log(`   修正: ${fixed} 題`);
console.log(`   移除: ${removed} 題`);
console.log(`   剩餘: ${questions.length} 題`);
