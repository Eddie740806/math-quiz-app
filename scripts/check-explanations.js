/**
 * 檢查解析品質
 */
const fs = require('fs');

const mainQuestions = require('../src/data/questions.json').questions;
const geometryQuestions = require('../src/data/questions-geometry.json').questions;
const privateSchoolData = require('../src/data/questions-private-school.json');

let privateSchoolQuestions = [];
privateSchoolData.units.forEach(unit => {
  if (unit.questions) {
    privateSchoolQuestions = privateSchoolQuestions.concat(unit.questions);
  }
});

const allQuestions = [...mainQuestions, ...geometryQuestions, ...privateSchoolQuestions];

console.log('========================================');
console.log('📝 解析品質檢查');
console.log('========================================\n');

// 統計
const stats = {
  total: allQuestions.length,
  hasExplanation: 0,
  noExplanation: 0,
  shortExplanation: [],  // < 20 字
  mediumExplanation: [], // 20-50 字
  longExplanation: [],   // > 50 字
  withSteps: 0,          // 有步驟
  oneLiner: [],          // 只有一行
};

// 分析每題
allQuestions.forEach(q => {
  const exp = q.explanation || '';
  
  if (!exp || exp.trim() === '') {
    stats.noExplanation++;
    return;
  }
  
  stats.hasExplanation++;
  const length = exp.length;
  const lines = exp.split('\n').filter(l => l.trim()).length;
  const hasSteps = exp.includes('步驟') || exp.includes('1.') || exp.includes('1、');
  
  if (hasSteps) stats.withSteps++;
  
  if (length < 20) {
    stats.shortExplanation.push({ id: q.id, exp, length });
  } else if (length <= 50) {
    stats.mediumExplanation.push({ id: q.id, length });
  } else {
    stats.longExplanation.push({ id: q.id, length });
  }
  
  if (lines === 1 && length < 40) {
    stats.oneLiner.push({ id: q.id, exp });
  }
});

console.log(`總題數: ${stats.total}`);
console.log(`有解析: ${stats.hasExplanation} (${(stats.hasExplanation/stats.total*100).toFixed(1)}%)`);
console.log(`無解析: ${stats.noExplanation}\n`);

console.log('--- 解析長度分布 ---\n');
console.log(`  短解析 (<20字): ${stats.shortExplanation.length} 題`);
console.log(`  中解析 (20-50字): ${stats.mediumExplanation.length} 題`);
console.log(`  長解析 (>50字): ${stats.longExplanation.length} 題`);
console.log(`  含步驟解析: ${stats.withSteps} 題\n`);

// 顯示短解析範例
if (stats.shortExplanation.length > 0) {
  console.log('--- ⚠️ 較短的解析範例 ---\n');
  stats.shortExplanation.slice(0, 10).forEach(item => {
    console.log(`  ${item.id}: "${item.exp}" (${item.length}字)`);
  });
  if (stats.shortExplanation.length > 10) {
    console.log(`  ... 還有 ${stats.shortExplanation.length - 10} 題\n`);
  }
}

// 顯示優質解析範例
console.log('\n--- ✅ 優質解析範例 ---\n');
const goodExamples = allQuestions
  .filter(q => q.explanation && q.explanation.length > 80)
  .slice(0, 5);

goodExamples.forEach(q => {
  console.log(`【${q.id}】${q.content.substring(0, 40)}...`);
  console.log(`解析: ${q.explanation.substring(0, 150)}...`);
  console.log();
});

// 幾何題解析檢查
console.log('--- 🔷 幾何題解析檢查 ---\n');
const geoExps = geometryQuestions.map(q => ({
  id: q.id,
  content: q.content.substring(0, 30),
  exp: q.explanation,
  length: (q.explanation || '').length
}));

console.log(`幾何題: ${geoExps.length} 題`);
console.log(`平均解析長度: ${Math.round(geoExps.reduce((a,b) => a + b.length, 0) / geoExps.length)} 字\n`);

console.log('幾何題解析範例:');
geoExps.slice(0, 5).forEach(g => {
  console.log(`  ${g.id}: ${g.exp}`);
});

console.log('\n========================================');
