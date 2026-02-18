/**
 * 真正的數學驗算腳本
 * 針對有明確公式的題型，重新計算答案是否正確
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const questions = data.questions;

const errors = [];

// 驗算函數
function verifyQuestion(q) {
  const content = q.content;
  const correctOption = q.options[q.answer];
  
  // 1. 貨物分數題：第一天賣 a/b，第二天賣剩下的 c/d，還剩 X 件
  const fractionPattern1 = /第一天賣出 (\d+)\/(\d+)，第二天賣出剩下的.*?(\d+)\/(\d+).*?還剩 (\d+) 件.*?原有多少/;
  const match1 = content.match(fractionPattern1);
  if (match1) {
    const [, a, b, c, d, remain] = match1.map(Number);
    // 剩下比例 = (1 - a/b) × (1 - c/d)
    const remainRatio = (1 - a/b) * (1 - c/d);
    const original = remain / remainRatio;
    const answerNum = parseInt(correctOption);
    if (Math.abs(original - answerNum) > 0.01) {
      return { 
        error: `分數題計算錯誤`, 
        expected: original.toFixed(2), 
        got: answerNum,
        formula: `${remain} ÷ ${remainRatio.toFixed(4)} = ${original.toFixed(2)}`
      };
    }
  }
  
  // 2. 簡單百分比題：X 的 Y% 是多少
  const percentPattern = /(\d+) 的 (\d+)% 是/;
  const match2 = content.match(percentPattern);
  if (match2) {
    const [, base, percent] = match2.map(Number);
    const expected = base * percent / 100;
    const answerNum = parseFloat(correctOption);
    if (!isNaN(answerNum) && Math.abs(expected - answerNum) > 0.01) {
      return { error: `百分比計算錯誤`, expected, got: answerNum };
    }
  }
  
  // 3. 面積計算：長方形
  const rectPattern = /長 ?(\d+).*?寬 ?(\d+).*?面積/;
  const match3 = content.match(rectPattern);
  if (match3) {
    const [, length, width] = match3.map(Number);
    const expected = length * width;
    const answerNum = parseInt(correctOption);
    if (!isNaN(answerNum) && answerNum !== expected) {
      return { error: `長方形面積錯誤`, expected, got: answerNum };
    }
  }
  
  // 4. 周長計算
  const perimPattern = /長 ?(\d+).*?寬 ?(\d+).*?周長/;
  const match4 = content.match(perimPattern);
  if (match4) {
    const [, length, width] = match4.map(Number);
    const expected = (length + width) * 2;
    const answerNum = parseInt(correctOption);
    if (!isNaN(answerNum) && answerNum !== expected) {
      return { error: `周長計算錯誤`, expected, got: answerNum };
    }
  }
  
  // 5. 三角形面積
  const triPattern = /底.*?(\d+).*?高.*?(\d+).*?面積|底 ?(\d+).*?高 ?(\d+)/;
  const match5 = content.match(triPattern);
  if (match5 && content.includes('三角形')) {
    const nums = match5.filter(x => x && !isNaN(x)).map(Number);
    if (nums.length >= 2) {
      const expected = nums[0] * nums[1] / 2;
      const answerNum = parseFloat(correctOption);
      if (!isNaN(answerNum) && Math.abs(answerNum - expected) > 0.01) {
        return { error: `三角形面積錯誤`, expected, got: answerNum };
      }
    }
  }
  
  // 6. 速度時間距離
  const speedPattern = /時速 ?(\d+).*?(\d+) ?小時.*?多少公里|(\d+) ?公里.*?(\d+) ?小時.*?時速/;
  const match6 = content.match(speedPattern);
  if (match6) {
    const nums = match6.filter(x => x && !isNaN(x)).map(Number);
    if (nums.length >= 2) {
      // 判斷是求距離還是求速度
      if (content.includes('多少公里') || content.includes('走了')) {
        const expected = nums[0] * nums[1];
        const answerNum = parseInt(correctOption);
        if (!isNaN(answerNum) && answerNum !== expected) {
          return { error: `距離計算錯誤`, expected, got: answerNum };
        }
      }
    }
  }

  return null;
}

// 驗算所有題目
let verifiedCount = 0;
questions.forEach(q => {
  const result = verifyQuestion(q);
  if (result) {
    errors.push({
      id: q.id,
      content: q.content.substring(0, 50) + '...',
      ...result
    });
  }
  verifiedCount++;
});

console.log(`\n📊 數學驗算結果`);
console.log(`   驗算題數: ${verifiedCount}`);
console.log(`   發現錯誤: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n❌ 錯誤列表:`);
  errors.forEach(e => {
    console.log(`\n   [${e.id}] ${e.error}`);
    console.log(`   題目: ${e.content}`);
    console.log(`   應該: ${e.expected} | 實際: ${e.got}`);
    if (e.formula) console.log(`   公式: ${e.formula}`);
  });
}

// 儲存報告
fs.writeFileSync(
  path.join(__dirname, 'math-verify-report.json'),
  JSON.stringify({ verifiedCount, errors }, null, 2)
);
