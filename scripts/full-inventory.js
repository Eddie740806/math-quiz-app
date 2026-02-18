/**
 * 題庫全面盤點
 */

const fs = require('fs');
const path = require('path');

// 讀取所有題庫
const mainQuestions = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/questions.json'), 'utf8'
)).questions;

// 考私中是 units 結構
const privateSchoolData = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/questions-private-school.json'), 'utf8'
));
const privateSchool = privateSchoolData.units?.flatMap(u => u.questions) || [];

const geometry = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../src/data/questions-geometry.json'), 'utf8'
)).questions || [];

const allQuestions = [...mainQuestions, ...privateSchool, ...geometry];

console.log('📊 題庫全面盤點報告');
console.log('='.repeat(50));
console.log(`\n📅 盤點時間: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);

// 1. 總題數
console.log('\n\n【1. 題庫來源統計】');
console.log(`   主題庫 (questions.json): ${mainQuestions.length} 題`);
console.log(`   考私中 (questions-private-school.json): ${privateSchool.length} 題`);
console.log(`   幾何題 (questions-geometry.json): ${geometry.length} 題`);
console.log(`   ─────────────────────────`);
console.log(`   總計: ${allQuestions.length} 題`);

// 2. 年級分布
console.log('\n\n【2. 年級分布】');
const byGrade = {};
allQuestions.forEach(q => {
  const g = q.grade || '未標';
  byGrade[g] = (byGrade[g] || 0) + 1;
});
Object.entries(byGrade).sort((a,b) => a[0] - b[0]).forEach(([grade, count]) => {
  const bar = '█'.repeat(Math.round(count / 50));
  console.log(`   ${grade}年級: ${count.toString().padStart(4)} 題 ${bar}`);
});

// 3. 難度分布
console.log('\n\n【3. 難度分布】');
const byDifficulty = {};
allQuestions.forEach(q => {
  const d = q.difficulty || '未標';
  byDifficulty[d] = (byDifficulty[d] || 0) + 1;
});
const diffOrder = ['easy', 'medium', 'hard', '未標'];
diffOrder.forEach(diff => {
  if (byDifficulty[diff]) {
    const pct = (byDifficulty[diff] / allQuestions.length * 100).toFixed(1);
    console.log(`   ${diff.padEnd(8)}: ${byDifficulty[diff].toString().padStart(4)} 題 (${pct}%)`);
  }
});

// 4. 題型/分類分布
console.log('\n\n【4. 題型分類 Top 15】');
const byCategory = {};
allQuestions.forEach(q => {
  const c = q.category || '未分類';
  byCategory[c] = (byCategory[c] || 0) + 1;
});
Object.entries(byCategory)
  .sort((a,b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(15)}: ${count.toString().padStart(4)} 題`);
  });

// 5. 解析完整度
console.log('\n\n【5. 解析完整度】');
let hasExplanation = 0;
let hasDetailedExplanation = 0;
allQuestions.forEach(q => {
  if (q.explanation && q.explanation.length > 0) {
    hasExplanation++;
    if (q.explanation.length > 100) hasDetailedExplanation++;
  }
});
console.log(`   有解析: ${hasExplanation} 題 (${(hasExplanation/allQuestions.length*100).toFixed(1)}%)`);
console.log(`   詳細解析(>100字): ${hasDetailedExplanation} 題 (${(hasDetailedExplanation/allQuestions.length*100).toFixed(1)}%)`);
console.log(`   無解析: ${allQuestions.length - hasExplanation} 題`);

// 6. 選項檢查
console.log('\n\n【6. 選項格式檢查】');
let optionIssues = [];
allQuestions.forEach(q => {
  if (!q.options || q.options.length !== 4) {
    optionIssues.push({ id: q.id, issue: `選項數量: ${q.options?.length || 0}` });
  }
  if (q.answer < 0 || q.answer > 3) {
    optionIssues.push({ id: q.id, issue: `答案索引異常: ${q.answer}` });
  }
  // 檢查選項是否有空白
  if (q.options?.some(o => !o || o.trim() === '')) {
    optionIssues.push({ id: q.id, issue: '有空白選項' });
  }
});
if (optionIssues.length === 0) {
  console.log(`   ✅ 全部通過，無異常`);
} else {
  console.log(`   ⚠️ 發現 ${optionIssues.length} 個問題:`);
  optionIssues.slice(0, 10).forEach(i => console.log(`      ${i.id}: ${i.issue}`));
  if (optionIssues.length > 10) console.log(`      ... 還有 ${optionIssues.length - 10} 個`);
}

// 7. ID 重複檢查
console.log('\n\n【7. ID 重複檢查】');
const idCounts = {};
allQuestions.forEach(q => {
  idCounts[q.id] = (idCounts[q.id] || 0) + 1;
});
const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
if (duplicates.length === 0) {
  console.log(`   ✅ 無重複 ID`);
} else {
  console.log(`   ⚠️ 發現 ${duplicates.length} 個重複 ID:`);
  duplicates.slice(0, 10).forEach(([id, count]) => console.log(`      ${id}: ${count} 次`));
}

// 8. 內容品質抽查
console.log('\n\n【8. 內容品質抽查】');
let shortQuestions = allQuestions.filter(q => q.content.length < 15);
let longQuestions = allQuestions.filter(q => q.content.length > 300);
let hasImage = allQuestions.filter(q => q.content.includes('圖') || q.hasImage || q.svgParams);
console.log(`   過短題目(<15字): ${shortQuestions.length} 題`);
console.log(`   超長題目(>300字): ${longQuestions.length} 題`);
console.log(`   含圖題目: ${hasImage.length} 題`);

// 9. 批量生成題目統計
console.log('\n\n【9. 題目來源分析】');
const batchGenerated = allQuestions.filter(q => q.id.startsWith('ps-batch-'));
const geoGenerated = allQuestions.filter(q => q.id.startsWith('geo-'));
const manual = allQuestions.filter(q => !q.id.startsWith('ps-batch-') && !q.id.startsWith('geo-'));
console.log(`   手動/原始題目: ${manual.length} 題`);
console.log(`   批量生成(ps-batch-): ${batchGenerated.length} 題`);
console.log(`   幾何生成(geo-): ${geoGenerated.length} 題`);

// 10. 數學驗算風險題目
console.log('\n\n【10. 數學邏輯風險評估】');
const riskPatterns = [
  { name: '分數賣出題', pattern: /第一天賣出.*?\/.*?第二天/ },
  { name: '工作問題', pattern: /獨做.*?天.*?完成.*?合[作做]/ },
  { name: '速度追擊題', pattern: /時速.*?同.*?向|相向.*?時速/ },
  { name: '濃度問題', pattern: /濃度|鹽水/ },
  { name: '利潤問題', pattern: /成本.*?售價|利潤|打.*?折/ },
];
riskPatterns.forEach(({ name, pattern }) => {
  const matched = allQuestions.filter(q => pattern.test(q.content));
  console.log(`   ${name.padEnd(12)}: ${matched.length.toString().padStart(3)} 題 ${matched.length > 0 ? '⚠️ 需驗算' : '✅'}`);
});

// 總結
console.log('\n\n' + '='.repeat(50));
console.log('📋 盤點總結');
console.log('='.repeat(50));
console.log(`
✅ 總題數: ${allQuestions.length} 題
✅ 年級覆蓋: ${Object.keys(byGrade).filter(g => g !== '未標').sort().join(', ')} 年級
✅ 解析覆蓋率: ${(hasExplanation/allQuestions.length*100).toFixed(1)}%
${optionIssues.length === 0 ? '✅' : '⚠️'} 選項格式: ${optionIssues.length === 0 ? '全部正常' : `${optionIssues.length} 個問題`}
${duplicates.length === 0 ? '✅' : '⚠️'} ID 唯一性: ${duplicates.length === 0 ? '無重複' : `${duplicates.length} 個重複`}
`);

// 儲存報告
const report = {
  timestamp: new Date().toISOString(),
  total: allQuestions.length,
  bySource: {
    main: mainQuestions.length,
    privateSchool: privateSchool.length,
    geometry: geometry.length
  },
  byGrade,
  byDifficulty,
  byCategory,
  quality: {
    hasExplanation,
    hasDetailedExplanation,
    optionIssues: optionIssues.length,
    duplicateIds: duplicates.length
  }
};

fs.writeFileSync(
  path.join(__dirname, 'inventory-report.json'),
  JSON.stringify(report, null, 2)
);
console.log('📁 詳細報告已存檔: scripts/inventory-report.json');
