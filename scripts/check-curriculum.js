/**
 * 108課綱合規性檢查
 * 模擬 100 位學生各測 100 題
 * 找出不符合國小課綱的內容
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
console.log('📚 108課綱合規性檢查');
console.log('👨‍🎓 模擬 100 位學生 × 100 題');
console.log('========================================\n');

// 問題分類
const issues = {
  negativeNumbers: [],      // 負數（國小不教）
  absoluteValue: [],        // 絕對值（國中）
  squareRoot: [],           // 開根號（國中）
  equations: [],            // 代數方程（國中才正式教）
  advancedGeometry: [],     // 進階幾何（國中）
  probability: [],          // 機率（國中才系統教）
  otherIssues: []           // 其他問題
};

// 檢查單題是否符合課綱
function checkCurriculum(q) {
  const content = q.content || '';
  const options = q.options || [];
  const explanation = q.explanation || '';
  const grade = q.grade;
  const allText = content + ' ' + options.join(' ') + ' ' + explanation;
  
  const problems = [];
  
  // 1. 檢查負數（國小不應出現在五年級）
  // 六年級有些課綱會介紹負數概念，但正式計算是國一
  if (grade === 5 || grade === 6) {
    // 檢查選項中的負數
    options.forEach((opt, idx) => {
      if (typeof opt === 'string') {
        // 純負數如 "-5", "-12" 等
        if (/^-\d+(\.\d+)?$/.test(opt.trim())) {
          problems.push({
            type: 'negativeNumbers',
            detail: `選項 ${String.fromCharCode(65+idx)} 是負數: ${opt}`
          });
        }
        // 含負數如 "-5元", "-3度" 等
        if (/^-\d+/.test(opt.trim()) && !opt.includes('賠')) {
          problems.push({
            type: 'negativeNumbers', 
            detail: `選項含負數: ${opt}`
          });
        }
      }
    });
    
    // 檢查題目中的負數運算
    if (content.includes('(-') && content.includes(')')) {
      problems.push({
        type: 'negativeNumbers',
        detail: '題目含負數運算符號'
      });
    }
    
    // 海拔負數 - 這個在某些版本課綱有介紹概念，但不做計算
    if (content.includes('海拔 -') || content.includes('海拔-')) {
      problems.push({
        type: 'negativeNumbers',
        detail: '涉及負海拔計算'
      });
    }
    
    // 溫度負數 - 六年級有介紹概念
    if (grade === 5 && (content.includes('°C') && content.includes('-'))) {
      problems.push({
        type: 'negativeNumbers',
        detail: '五年級不應有負溫度計算'
      });
    }
  }
  
  // 2. 檢查絕對值（國中內容）
  if ((grade === 5 || grade === 6) && allText.includes('|')) {
    if (content.includes('|') || options.some(o => o.includes('|'))) {
      problems.push({
        type: 'absoluteValue',
        detail: '含絕對值符號 |x|'
      });
    }
  }
  
  // 3. 檢查開根號（國中內容）
  if ((grade === 5 || grade === 6)) {
    if (allText.includes('√') || allText.includes('根號') || allText.includes('平方根')) {
      problems.push({
        type: 'squareRoot',
        detail: '含開根號'
      });
    }
  }
  
  // 4. 檢查複雜代數（國中內容）
  // 國小有簡單的未知數概念，但不做複雜代數運算
  if (grade === 5) {
    if (content.match(/[a-z]\s*[×÷+\-]\s*[a-z]/i)) {
      problems.push({
        type: 'equations',
        detail: '含複雜代數運算'
      });
    }
  }
  
  // 5. 檢查次方符號 (國中內容，除了平方)
  if ((grade === 5 || grade === 6)) {
    // ³ ⁴ ⁵ 等次方
    if (content.match(/[²³⁴⁵⁶⁷⁸⁹⁰]+/) && !content.includes('²')) {
      // 只有平方OK，其他次方是國中
    }
    if (content.match(/\^[3-9]/) || content.includes('³') || content.includes('⁴')) {
      // 三次方以上
      if (!content.includes('立方公分') && !content.includes('立方公尺')) {
        problems.push({
          type: 'advancedGeometry',
          detail: '含三次方以上運算（非體積單位）'
        });
      }
    }
    // (-1)¹⁰⁰ 這類
    if (content.match(/\(-?\d\)[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)) {
      problems.push({
        type: 'negativeNumbers',
        detail: '負數次方運算'
      });
    }
  }
  
  return problems;
}

// 模擬 100 學生各做 100 題
console.log('🚀 開始測試...\n');

let totalIssuesFound = 0;
const uniqueIssues = new Map();

for (let student = 1; student <= 100; student++) {
  // 隨機抽 100 題
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 100);
  
  selected.forEach(q => {
    const problems = checkCurriculum(q);
    problems.forEach(p => {
      totalIssuesFound++;
      const key = `${q.id}|${p.type}`;
      if (!uniqueIssues.has(key)) {
        uniqueIssues.set(key, {
          id: q.id,
          grade: q.grade,
          category: q.category,
          content: q.content.substring(0, 50),
          type: p.type,
          detail: p.detail,
          options: q.options
        });
        issues[p.type].push(uniqueIssues.get(key));
      }
    });
  });
  
  if (student % 20 === 0) {
    console.log(`  學生 ${student}/100 完成...`);
  }
}

// 輸出報告
console.log('\n========================================');
console.log('📋 課綱合規性報告');
console.log('========================================\n');

console.log(`📊 測試覆蓋: 100 位學生 × 100 題 = 10,000 次答題`);
console.log(`⚠️ 發現問題: ${uniqueIssues.size} 題\n`);

const issueTypes = [
  { key: 'negativeNumbers', name: '❌ 負數問題（國中內容）', critical: true },
  { key: 'absoluteValue', name: '❌ 絕對值（國中內容）', critical: true },
  { key: 'squareRoot', name: '❌ 開根號（國中內容）', critical: true },
  { key: 'equations', name: '⚠️ 複雜代數（國中內容）', critical: false },
  { key: 'advancedGeometry', name: '⚠️ 進階次方運算', critical: false },
];

issueTypes.forEach(({ key, name, critical }) => {
  if (issues[key].length > 0) {
    console.log(`\n${name}: ${issues[key].length} 題`);
    console.log('─'.repeat(50));
    issues[key].slice(0, 8).forEach(item => {
      console.log(`  [${item.grade}年級] ${item.id}`);
      console.log(`    題目: ${item.content}...`);
      console.log(`    問題: ${item.detail}`);
      if (item.options) {
        console.log(`    選項: ${item.options.slice(0, 4).join(', ')}`);
      }
      console.log();
    });
    if (issues[key].length > 8) {
      console.log(`  ... 還有 ${issues[key].length - 8} 題\n`);
    }
  }
});

// 統計
console.log('\n========================================');
console.log('📈 統計');
console.log('========================================');
console.log(`總題數: ${allQuestions.length}`);
console.log(`五年級題數: ${allQuestions.filter(q => q.grade === 5).length}`);
console.log(`六年級題數: ${allQuestions.filter(q => q.grade === 6).length}`);
console.log(`問題題數: ${uniqueIssues.size} (${(uniqueIssues.size/allQuestions.length*100).toFixed(2)}%)`);

if (uniqueIssues.size === 0) {
  console.log('\n🎉 太棒了！所有題目都符合 108 課綱！');
} else {
  console.log('\n⚠️ 建議修正上述題目以符合 108 課綱');
}
console.log('========================================\n');

// 保存詳細報告
const report = {
  timestamp: new Date().toISOString(),
  totalQuestions: allQuestions.length,
  issuesFound: uniqueIssues.size,
  issues: Object.fromEntries(
    Object.entries(issues).map(([k, v]) => [k, v.map(i => ({ id: i.id, detail: i.detail }))])
  )
};

fs.writeFileSync('./scripts/curriculum-report.json', JSON.stringify(report, null, 2), 'utf8');
console.log('📄 詳細報告已保存到 scripts/curriculum-report.json');
