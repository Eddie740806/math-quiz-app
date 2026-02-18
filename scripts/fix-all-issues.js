/**
 * 全面修復腳本
 * 1. 修復重複 ID
 * 2. 補上缺失的年級
 * 3. 驗算所有風險題型
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 開始全面修復...\n');

// ===== 1. 讀取所有題庫 =====
const mainPath = path.join(__dirname, '../src/data/questions.json');
const privatePath = path.join(__dirname, '../src/data/questions-private-school.json');
const geoPath = path.join(__dirname, '../src/data/questions-geometry.json');

const mainData = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const privateData = JSON.parse(fs.readFileSync(privatePath, 'utf8'));
const geoData = JSON.parse(fs.readFileSync(geoPath, 'utf8'));

let mainQuestions = mainData.questions;
const geoQuestions = geoData.questions;

// 考私中是 units 結構
let privateQuestions = privateData.units?.flatMap(u => u.questions) || [];

// ===== 2. 修復重複 ID =====
console.log('【1. 修復重複 ID】');

// 收集所有 ID
const allIds = new Set();
let duplicateFixed = 0;

// 主題庫 ID 優先
mainQuestions.forEach(q => allIds.add(q.id));

// 幾何題庫檢查重複
geoQuestions.forEach((q, idx) => {
  if (allIds.has(q.id)) {
    const newId = `geo-gen-${String(idx + 100).padStart(3, '0')}`;
    console.log(`   ${q.id} → ${newId}`);
    q.id = newId;
    duplicateFixed++;
  }
  allIds.add(q.id);
});

// 考私中檢查重複
privateQuestions.forEach((q, idx) => {
  if (allIds.has(q.id)) {
    const newId = `ps-exam-${String(idx + 1).padStart(4, '0')}`;
    console.log(`   ${q.id} → ${newId}`);
    q.id = newId;
    duplicateFixed++;
  }
  allIds.add(q.id);
});

console.log(`   ✅ 修復 ${duplicateFixed} 個重複 ID\n`);

// ===== 3. 補上缺失年級 =====
console.log('【2. 補上缺失年級】');

let gradeFixed = 0;
privateQuestions.forEach(q => {
  if (!q.grade) {
    // 根據難度和內容判斷年級
    // 考私中通常是 5-6 年級程度
    if (q.content.includes('分數') || q.content.includes('小數') || 
        q.content.includes('面積') || q.content.includes('體積')) {
      q.grade = 6;
    } else {
      q.grade = 5; // 預設五年級
    }
    gradeFixed++;
  }
});

console.log(`   ✅ 補上 ${gradeFixed} 題年級\n`);

// ===== 4. 嚴格驗算風險題型 =====
console.log('【3. 嚴格驗算風險題型】');

const allQuestions = [...mainQuestions, ...geoQuestions, ...privateQuestions];
const errors = [];

// 驗算函數
function verifyMath(q) {
  const content = q.content;
  const answer = q.options[q.answer];
  const answerNum = parseFloat(answer?.match(/[\d.]+/)?.[0]);
  
  // 3.1 分數賣出題
  const fractionMatch = content.match(/第一天賣出\s*(\d+)\/(\d+).*?第二天賣出.*?(?:剩下.*?)?(?:(\d+)\/(\d+)|一半).*?還剩\s*(\d+)/);
  if (fractionMatch) {
    const a1 = Number(fractionMatch[1]);
    const b1 = Number(fractionMatch[2]);
    const a2 = fractionMatch[3] ? Number(fractionMatch[3]) : 1;
    const b2 = fractionMatch[4] ? Number(fractionMatch[4]) : 2;
    const remain = Number(fractionMatch[5]);
    
    const ratio = (1 - a1/b1) * (1 - a2/b2);
    const expected = remain / ratio;
    
    if (Math.abs(expected - answerNum) > 1) {
      return { type: '分數賣出', expected: Math.round(expected), got: answerNum };
    }
  }
  
  // 3.2 工作問題（簡單合作）
  const workMatch = content.match(/甲.*?(\d+)\s*天.*?完成.*?乙.*?(\d+)\s*天.*?完成.*?合[作做].*?[幾多少]\s*天/);
  if (workMatch) {
    const a = Number(workMatch[1]);
    const b = Number(workMatch[2]);
    const expected = (a * b) / (a + b);
    
    if (Math.abs(expected - answerNum) > 0.5) {
      return { type: '工作問題', expected: expected.toFixed(1), got: answerNum };
    }
  }
  
  // 3.3 濃度問題（鹽水）
  const concMatch = content.match(/(\d+)\s*克.*?鹽.*?(\d+)\s*克.*?水.*?濃度/);
  if (concMatch) {
    const salt = Number(concMatch[1]);
    const water = Number(concMatch[2]);
    const expected = (salt / (salt + water)) * 100;
    
    if (Math.abs(expected - answerNum) > 0.5) {
      return { type: '濃度問題', expected: expected.toFixed(1), got: answerNum };
    }
  }
  
  // 3.4 同向追擊
  const chaseMatch = content.match(/時速\s*(\d+).*?時速\s*(\d+).*?同.*?向.*?(\d+)\s*小時.*?相距/);
  if (chaseMatch) {
    const s1 = Number(chaseMatch[1]);
    const s2 = Number(chaseMatch[2]);
    const t = Number(chaseMatch[3]);
    const expected = Math.abs(s1 - s2) * t;
    
    if (Math.abs(expected - answerNum) > 0.5) {
      return { type: '同向追擊', expected, got: answerNum };
    }
  }
  
  // 3.5 相向而行
  const meetMatch = content.match(/相向.*?時速\s*(\d+).*?時速\s*(\d+).*?(\d+)\s*小時.*?相距|往.*?反.*?向.*?時速\s*(\d+).*?時速\s*(\d+).*?(\d+)\s*小時/);
  if (meetMatch) {
    const nums = meetMatch.filter((v, i) => i > 0 && v).map(Number);
    if (nums.length >= 3) {
      const expected = (nums[0] + nums[1]) * nums[2];
      if (Math.abs(expected - answerNum) > 0.5) {
        return { type: '相向而行', expected, got: answerNum };
      }
    }
  }
  
  return null;
}

// 執行驗算
let verified = 0;
allQuestions.forEach(q => {
  const result = verifyMath(q);
  if (result) {
    errors.push({ id: q.id, content: q.content.substring(0, 40), ...result });
  }
  if (result !== undefined) verified++;
});

console.log(`   驗算題數: ${verified}`);
console.log(`   發現錯誤: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n   ❌ 錯誤明細:');
  errors.forEach(e => {
    console.log(`   [${e.id}] ${e.type}: 應 ${e.expected}, 實 ${e.got}`);
  });
}

// ===== 5. 移除無法修正的錯題 =====
console.log('\n【4. 移除錯題】');

const errorIds = new Set(errors.map(e => e.id));
const beforeMain = mainQuestions.length;
const beforeGeo = geoQuestions.length;
const beforePrivate = privateQuestions.length;

mainQuestions = mainQuestions.filter(q => !errorIds.has(q.id));
geoQuestions.length = 0;
geoData.questions.filter(q => !errorIds.has(q.id)).forEach(q => geoQuestions.push(q));

// 更新考私中（需要更新 units 結構）
privateData.units.forEach(unit => {
  unit.questions = unit.questions.filter(q => !errorIds.has(q.id));
});

const removedMain = beforeMain - mainQuestions.length;
const removedGeo = beforeGeo - geoQuestions.length;
const removedPrivate = beforePrivate - privateData.units.reduce((sum, u) => sum + u.questions.length, 0);

console.log(`   主題庫移除: ${removedMain} 題`);
console.log(`   幾何題移除: ${removedGeo} 題`);
console.log(`   考私中移除: ${removedPrivate} 題`);

// ===== 6. 檢查過短題目 =====
console.log('\n【5. 檢查過短題目】');

const shortQuestions = allQuestions.filter(q => q.content.length < 15);
console.log(`   發現 ${shortQuestions.length} 題過短`);
shortQuestions.slice(0, 5).forEach(q => {
  console.log(`   [${q.id}] "${q.content}"`);
});

// ===== 7. 儲存 =====
console.log('\n【6. 儲存修改】');

mainData.questions = mainQuestions;
fs.writeFileSync(mainPath, JSON.stringify(mainData, null, 2));
console.log(`   ✅ questions.json (${mainQuestions.length} 題)`);

fs.writeFileSync(geoPath, JSON.stringify(geoData, null, 2));
console.log(`   ✅ questions-geometry.json (${geoData.questions.length} 題)`);

fs.writeFileSync(privatePath, JSON.stringify(privateData, null, 2));
const newPrivateCount = privateData.units.reduce((sum, u) => sum + u.questions.length, 0);
console.log(`   ✅ questions-private-school.json (${newPrivateCount} 題)`);

// ===== 總結 =====
const totalAfter = mainQuestions.length + geoData.questions.length + newPrivateCount;
console.log('\n' + '='.repeat(50));
console.log('📋 修復總結');
console.log('='.repeat(50));
console.log(`
修復項目:
  ✅ 重複 ID: ${duplicateFixed} 個
  ✅ 缺失年級: ${gradeFixed} 題
  ✅ 移除錯題: ${errors.length} 題

題庫狀態:
  修復前: ${beforeMain + beforeGeo + beforePrivate} 題
  修復後: ${totalAfter} 題
`);
