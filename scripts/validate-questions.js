/**
 * 題庫校對系統
 * 模擬 100 位學生，各做 100 題，檢查題目品質
 */

const fs = require('fs');

// 載入所有題庫
const mainQuestions = require('../src/data/questions.json').questions;
const geometryQuestions = require('../src/data/questions-geometry.json').questions;
const privateSchoolData = require('../src/data/questions-private-school.json');

// 收集私校題庫
let privateSchoolQuestions = [];
privateSchoolData.units.forEach(unit => {
  if (unit.questions) {
    privateSchoolQuestions = privateSchoolQuestions.concat(unit.questions);
  }
});

const allQuestions = [...mainQuestions, ...geometryQuestions, ...privateSchoolQuestions];

console.log('========================================');
console.log('📊 題庫校對系統 - 100 位虛擬學生測試');
console.log('========================================\n');

console.log(`總題數: ${allQuestions.length}`);
console.log(`主題庫: ${mainQuestions.length}`);
console.log(`幾何題庫: ${geometryQuestions.length}`);
console.log(`私校題庫: ${privateSchoolQuestions.length}\n`);

// 錯誤收集
const errors = {
  missingContent: [],      // 題目內容缺失
  missingOptions: [],      // 選項缺失
  invalidAnswer: [],       // 答案索引無效
  duplicateOptions: [],    // 選項重複
  missingExplanation: [],  // 缺少解析
  wrongCalculation: [],    // 計算錯誤
  formatIssues: [],        // 格式問題
};

// 驗證單題
function validateQuestion(q, index) {
  const issues = [];
  
  // 1. 檢查必要欄位
  if (!q.id) issues.push('缺少 ID');
  if (!q.content || q.content.trim() === '') {
    errors.missingContent.push({ id: q.id, index });
    issues.push('題目內容為空');
  }
  
  // 2. 檢查選項
  if (!q.options || !Array.isArray(q.options)) {
    errors.missingOptions.push({ id: q.id, index });
    issues.push('選項缺失');
  } else {
    if (q.options.length < 4) {
      errors.missingOptions.push({ id: q.id, index, count: q.options.length });
      issues.push(`選項不足 4 個 (只有 ${q.options.length} 個)`);
    }
    
    // 檢查選項重複
    const uniqueOptions = new Set(q.options.map(o => o.toString().trim()));
    if (uniqueOptions.size < q.options.length) {
      errors.duplicateOptions.push({ id: q.id, options: q.options });
      issues.push('有重複選項');
    }
    
    // 檢查選項是否為空
    q.options.forEach((opt, i) => {
      if (!opt || opt.toString().trim() === '') {
        issues.push(`選項 ${i + 1} 為空`);
      }
    });
  }
  
  // 3. 檢查答案索引
  if (q.answer === undefined || q.answer === null) {
    errors.invalidAnswer.push({ id: q.id, index });
    issues.push('答案索引缺失');
  } else if (q.options && (q.answer < 0 || q.answer >= q.options.length)) {
    errors.invalidAnswer.push({ id: q.id, answer: q.answer, optionCount: q.options.length });
    issues.push(`答案索引無效 (answer=${q.answer}, options=${q.options.length})`);
  }
  
  // 4. 檢查解析
  if (!q.explanation || q.explanation.trim() === '') {
    errors.missingExplanation.push({ id: q.id });
  }
  
  // 5. 驗證幾何題計算
  if (q.id && q.id.startsWith('geo-') && q.explanation) {
    const calcResult = verifyGeometryCalculation(q);
    if (calcResult.error) {
      errors.wrongCalculation.push({ id: q.id, ...calcResult });
      issues.push(`計算驗證失敗: ${calcResult.error}`);
    }
  }
  
  // 6. 格式檢查
  if (q.content && q.content.includes('undefined')) {
    errors.formatIssues.push({ id: q.id, issue: '題目包含 undefined' });
    issues.push('題目包含 undefined');
  }
  if (q.content && q.content.includes('NaN')) {
    errors.formatIssues.push({ id: q.id, issue: '題目包含 NaN' });
    issues.push('題目包含 NaN');
  }
  
  return issues;
}

// 驗證幾何題計算
function verifyGeometryCalculation(q) {
  const explanation = q.explanation || '';
  const correctOption = q.options[q.answer];
  
  // 從解析中提取計算結果
  const resultMatch = explanation.match(/=\s*([\d.]+)\s*(?:平方)?公分/);
  if (resultMatch) {
    const calculatedResult = parseFloat(resultMatch[1]);
    
    // 從正確選項提取數字
    const optionMatch = correctOption.match(/([\d.]+)/);
    if (optionMatch) {
      const optionValue = parseFloat(optionMatch[1]);
      
      // 允許小數誤差
      if (Math.abs(calculatedResult - optionValue) > 0.1) {
        return {
          error: '計算結果與選項不符',
          calculated: calculatedResult,
          option: optionValue
        };
      }
    }
  }
  
  return { ok: true };
}

// 模擬學生答題
function simulateStudent(studentId, questionCount) {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, questionCount);
  
  let correct = 0;
  let issuesFound = 0;
  
  selected.forEach((q, idx) => {
    // 驗證題目
    const issues = validateQuestion(q, idx);
    if (issues.length > 0) {
      issuesFound += issues.length;
    }
    
    // 模擬答題（隨機選擇，正確率約 25%）
    const userAnswer = Math.floor(Math.random() * 4);
    if (userAnswer === q.answer) {
      correct++;
    }
  });
  
  return { correct, total: questionCount, issuesFound };
}

// 執行測試
console.log('🚀 開始校對測試...\n');

const studentCount = 100;
const questionsPerStudent = 100;

let totalIssues = 0;
let totalCorrect = 0;

for (let i = 1; i <= studentCount; i++) {
  const result = simulateStudent(i, questionsPerStudent);
  totalCorrect += result.correct;
  totalIssues += result.issuesFound;
  
  if (i % 20 === 0) {
    console.log(`  學生 ${i}/100 完成...`);
  }
}

// 全面檢查所有題目
console.log('\n🔍 全面檢查所有題目...\n');
allQuestions.forEach((q, idx) => {
  validateQuestion(q, idx);
});

// 輸出報告
console.log('========================================');
console.log('📋 校對報告');
console.log('========================================\n');

console.log(`✅ 總題數: ${allQuestions.length}`);
console.log(`📝 測試覆蓋: ${studentCount} 位學生 × ${questionsPerStudent} 題 = ${studentCount * questionsPerStudent} 次答題\n`);

console.log('--- 問題統計 ---\n');

let hasErrors = false;

if (errors.missingContent.length > 0) {
  hasErrors = true;
  console.log(`❌ 題目內容缺失: ${errors.missingContent.length} 題`);
  errors.missingContent.slice(0, 5).forEach(e => console.log(`   - ${e.id}`));
  if (errors.missingContent.length > 5) console.log(`   ... 還有 ${errors.missingContent.length - 5} 題`);
  console.log();
}

if (errors.missingOptions.length > 0) {
  hasErrors = true;
  console.log(`❌ 選項問題: ${errors.missingOptions.length} 題`);
  errors.missingOptions.slice(0, 5).forEach(e => console.log(`   - ${e.id} (${e.count || '缺失'})`));
  if (errors.missingOptions.length > 5) console.log(`   ... 還有 ${errors.missingOptions.length - 5} 題`);
  console.log();
}

if (errors.invalidAnswer.length > 0) {
  hasErrors = true;
  console.log(`❌ 答案索引無效: ${errors.invalidAnswer.length} 題`);
  errors.invalidAnswer.slice(0, 5).forEach(e => 
    console.log(`   - ${e.id}: answer=${e.answer}, options=${e.optionCount}`)
  );
  if (errors.invalidAnswer.length > 5) console.log(`   ... 還有 ${errors.invalidAnswer.length - 5} 題`);
  console.log();
}

if (errors.duplicateOptions.length > 0) {
  hasErrors = true;
  console.log(`⚠️ 選項重複: ${errors.duplicateOptions.length} 題`);
  errors.duplicateOptions.slice(0, 5).forEach(e => 
    console.log(`   - ${e.id}: ${JSON.stringify(e.options)}`)
  );
  if (errors.duplicateOptions.length > 5) console.log(`   ... 還有 ${errors.duplicateOptions.length - 5} 題`);
  console.log();
}

if (errors.wrongCalculation.length > 0) {
  hasErrors = true;
  console.log(`❌ 計算錯誤: ${errors.wrongCalculation.length} 題`);
  errors.wrongCalculation.forEach(e => 
    console.log(`   - ${e.id}: 計算=${e.calculated}, 選項=${e.option}`)
  );
  console.log();
}

if (errors.formatIssues.length > 0) {
  hasErrors = true;
  console.log(`⚠️ 格式問題: ${errors.formatIssues.length} 題`);
  errors.formatIssues.forEach(e => 
    console.log(`   - ${e.id}: ${e.issue}`)
  );
  console.log();
}

if (errors.missingExplanation.length > 0) {
  console.log(`📝 缺少解析: ${errors.missingExplanation.length} 題`);
  console.log(`   (這不是錯誤，但建議補充)\n`);
}

// 統計各題型
console.log('--- 題型分布 ---\n');
const categoryCount = {};
allQuestions.forEach(q => {
  const cat = q.category || '未分類';
  categoryCount[cat] = (categoryCount[cat] || 0) + 1;
});
Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} 題`);
  });

console.log('\n========================================');
if (!hasErrors) {
  console.log('🎉 校對完成！沒有發現嚴重錯誤');
} else {
  console.log('⚠️ 校對完成！發現一些問題需要修復');
}
console.log('========================================\n');

// 保存詳細報告
const report = {
  timestamp: new Date().toISOString(),
  totalQuestions: allQuestions.length,
  testCoverage: studentCount * questionsPerStudent,
  errors,
  categoryCount
};

fs.writeFileSync(
  './scripts/validation-report.json',
  JSON.stringify(report, null, 2),
  'utf8'
);
console.log('📄 詳細報告已保存到 scripts/validation-report.json');
