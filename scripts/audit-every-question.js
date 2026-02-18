/**
 * 全面逐題盤點腳本
 * 檢查每一題的：
 * 1. 基本格式（ID、題目、選項、答案、年級、難度、解析）
 * 2. 數學邏輯驗算
 * 3. 內容品質
 */

const fs = require('fs');
const path = require('path');

// 讀取所有題庫
const mainData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questions.json'), 'utf8'));
const geoData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questions-geometry.json'), 'utf8'));
const privateData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questions-private-school.json'), 'utf8'));

const mainQuestions = mainData.questions;
const geoQuestions = geoData.questions;
const privateQuestions = privateData.units?.flatMap(u => u.questions) || [];

const allQuestions = [...mainQuestions, ...geoQuestions, ...privateQuestions];

console.log('🔍 全面逐題盤點');
console.log('='.repeat(60));
console.log(`總題數: ${allQuestions.length}`);
console.log('='.repeat(60));

const issues = [];
const warnings = [];
let passCount = 0;

// ========== 數學驗算函數 ==========

function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

function verifyMathLogic(q) {
  const content = q.content;
  const answerText = q.options[q.answer];
  const answerNum = extractNumber(answerText);
  
  const errors = [];
  
  // 1. 分數連續賣出題
  const fractionMatch = content.match(/第一天賣出\s*(\d+)\/(\d+).*?第二天賣出.*?(?:剩下.*?)?(?:(\d+)\/(\d+)|一半).*?還剩\s*(\d+)/);
  if (fractionMatch) {
    const a1 = Number(fractionMatch[1]);
    const b1 = Number(fractionMatch[2]);
    const a2 = fractionMatch[3] ? Number(fractionMatch[3]) : 1;
    const b2 = fractionMatch[4] ? Number(fractionMatch[4]) : 2;
    const remain = Number(fractionMatch[5]);
    
    const ratio = (1 - a1/b1) * (1 - a2/b2);
    const expected = remain / ratio;
    
    if (answerNum && Math.abs(expected - answerNum) > 1) {
      errors.push(`分數賣出題: 應=${Math.round(expected)}, 實=${answerNum}`);
    }
  }
  
  // 2. 工作問題（甲乙合作）
  const workMatch = content.match(/甲.*?(\d+)\s*天.*?完成.*?乙.*?(\d+)\s*天.*?完成.*?合[作做].*?[幾多少]\s*天/);
  if (workMatch) {
    const a = Number(workMatch[1]);
    const b = Number(workMatch[2]);
    const expected = (a * b) / (a + b);
    
    if (answerNum && Math.abs(expected - answerNum) > 0.5) {
      errors.push(`工作問題: 應=${expected.toFixed(1)}, 實=${answerNum}`);
    }
  }
  
  // 3. 濃度問題（鹽/水）
  const concMatch = content.match(/(\d+)\s*克.*?鹽.*?[加入溶於].*?(\d+)\s*克.*?水.*?濃度/);
  if (concMatch) {
    const salt = Number(concMatch[1]);
    const water = Number(concMatch[2]);
    const expected = (salt / (salt + water)) * 100;
    
    if (answerNum && Math.abs(expected - answerNum) > 0.5) {
      errors.push(`濃度問題: 應=${expected.toFixed(1)}%, 實=${answerNum}`);
    }
  }
  
  // 4. 速度×時間=距離
  const distMatch = content.match(/時速\s*(\d+).*?(\d+)\s*小時.*?[走行跑了].*?[多少幾].*?[公里公尺]/);
  if (distMatch) {
    const speed = Number(distMatch[1]);
    const time = Number(distMatch[2]);
    const expected = speed * time;
    
    if (answerNum && Math.abs(expected - answerNum) > 0.5) {
      errors.push(`速度問題: 應=${expected}, 實=${answerNum}`);
    }
  }
  
  // 5. 同向追擊
  const chaseMatch = content.match(/同.*?向.*?時速\s*(\d+).*?時速\s*(\d+).*?(\d+)\s*小時.*?相距/);
  if (chaseMatch) {
    const s1 = Number(chaseMatch[1]);
    const s2 = Number(chaseMatch[2]);
    const t = Number(chaseMatch[3]);
    const expected = Math.abs(s1 - s2) * t;
    
    if (answerNum && Math.abs(expected - answerNum) > 0.5) {
      errors.push(`同向追擊: 應=${expected}, 實=${answerNum}`);
    }
  }
  
  // 6. 長方形面積
  const rectMatch = content.match(/長\s*(\d+).*?寬\s*(\d+).*?面積/);
  if (rectMatch && !content.includes('長方體') && !content.includes('切') && !content.includes('對摺')) {
    const l = Number(rectMatch[1]);
    const w = Number(rectMatch[2]);
    const expected = l * w;
    
    if (answerNum && Math.abs(expected - answerNum) > 0.5) {
      errors.push(`長方形面積: 應=${expected}, 實=${answerNum}`);
    }
  }
  
  // 7. 三角形面積
  const triMatch = content.match(/三角形.*?底\s*(\d+).*?高\s*(\d+).*?面積|底\s*(\d+).*?高\s*(\d+).*?三角形.*?面積/);
  if (triMatch && !content.includes('增加') && !content.includes('變成')) {
    const nums = triMatch.filter((v, i) => i > 0 && v).map(Number);
    if (nums.length >= 2) {
      const expected = nums[0] * nums[1] / 2;
      if (answerNum && Math.abs(expected - answerNum) > 0.5) {
        errors.push(`三角形面積: 應=${expected}, 實=${answerNum}`);
      }
    }
  }
  
  // 8. 圓面積 (πr²)
  const circleMatch = content.match(/圓.*?半徑\s*(\d+).*?面積|半徑\s*(\d+).*?圓.*?面積/);
  if (circleMatch && !content.includes('扇形')) {
    const r = Number(circleMatch[1] || circleMatch[2]);
    const expected = Math.PI * r * r;
    
    // 圓面積答案可能是 πr² 形式或數值
    if (answerNum && Math.abs(expected - answerNum) > 1 && !answerText.includes('π')) {
      errors.push(`圓面積: 應≈${expected.toFixed(1)}, 實=${answerNum}`);
    }
  }
  
  // 9. 圓周長 (2πr)
  const circumMatch = content.match(/圓.*?半徑\s*(\d+).*?周長|半徑\s*(\d+).*?圓.*?周長/);
  if (circumMatch) {
    const r = Number(circumMatch[1] || circumMatch[2]);
    const expected = 2 * Math.PI * r;
    
    if (answerNum && Math.abs(expected - answerNum) > 1 && !answerText.includes('π')) {
      errors.push(`圓周長: 應≈${expected.toFixed(1)}, 實=${answerNum}`);
    }
  }
  
  // 10. 百分比計算
  const pctMatch = content.match(/(\d+)\s*的\s*(\d+)\s*%\s*是/);
  if (pctMatch) {
    const base = Number(pctMatch[1]);
    const pct = Number(pctMatch[2]);
    const expected = base * pct / 100;
    
    if (answerNum && Math.abs(expected - answerNum) > 0.1) {
      errors.push(`百分比: 應=${expected}, 實=${answerNum}`);
    }
  }
  
  return errors;
}

// ========== 逐題檢查 ==========

allQuestions.forEach((q, idx) => {
  const qIssues = [];
  const qWarnings = [];
  
  // 1. 基本格式檢查
  if (!q.id) qIssues.push('缺少 ID');
  if (!q.content) qIssues.push('缺少題目內容');
  if (!q.options || q.options.length !== 4) qIssues.push(`選項數量異常: ${q.options?.length || 0}`);
  if (q.answer === undefined || q.answer < 0 || q.answer > 3) qIssues.push(`答案索引異常: ${q.answer}`);
  if (!q.grade) qWarnings.push('缺少年級');
  if (!q.difficulty) qWarnings.push('缺少難度');
  if (!q.category) qWarnings.push('缺少分類');
  
  // 2. 選項檢查
  if (q.options) {
    q.options.forEach((opt, i) => {
      if (!opt || opt.trim() === '') qIssues.push(`選項 ${String.fromCharCode(65+i)} 為空`);
    });
    
    // 檢查選項是否全部相同
    const uniqueOpts = new Set(q.options);
    if (uniqueOpts.size < q.options.length) {
      qWarnings.push('有重複選項');
    }
  }
  
  // 3. 內容品質檢查
  if (q.content && q.content.length < 10) qWarnings.push('題目過短');
  if (q.content && q.content.length > 500) qWarnings.push('題目過長');
  if (q.content && q.content.includes('undefined')) qIssues.push('內容包含 undefined');
  if (q.content && q.content.includes('null')) qWarnings.push('內容包含 null');
  
  // 4. 解析檢查
  if (!q.explanation || q.explanation.length < 5) qWarnings.push('解析過短或缺失');
  
  // 5. 數學驗算
  const mathErrors = verifyMathLogic(q);
  mathErrors.forEach(err => qIssues.push(`數學錯誤: ${err}`));
  
  // 統計結果
  if (qIssues.length > 0) {
    issues.push({ id: q.id || `索引${idx}`, issues: qIssues, content: q.content?.substring(0, 50) });
  } else if (qWarnings.length > 0) {
    warnings.push({ id: q.id, warnings: qWarnings });
  } else {
    passCount++;
  }
});

// ========== 輸出報告 ==========

console.log('\n📊 盤點結果');
console.log('─'.repeat(60));
console.log(`✅ 完全通過: ${passCount} 題 (${(passCount/allQuestions.length*100).toFixed(1)}%)`);
console.log(`⚠️ 有警告: ${warnings.length} 題`);
console.log(`❌ 有問題: ${issues.length} 題`);

if (issues.length > 0) {
  console.log('\n❌ 問題題目明細:');
  console.log('─'.repeat(60));
  issues.forEach((item, i) => {
    console.log(`\n${i+1}. [${item.id}]`);
    console.log(`   題目: ${item.content}...`);
    item.issues.forEach(issue => {
      console.log(`   ⛔ ${issue}`);
    });
  });
}

if (warnings.length > 0 && warnings.length <= 50) {
  console.log('\n⚠️ 警告題目 (前50題):');
  console.log('─'.repeat(60));
  warnings.slice(0, 50).forEach((item, i) => {
    console.log(`${i+1}. [${item.id}] ${item.warnings.join(', ')}`);
  });
}

// 按問題類型統計
console.log('\n📈 問題類型統計:');
console.log('─'.repeat(60));
const issueTypes = {};
issues.forEach(item => {
  item.issues.forEach(issue => {
    const type = issue.split(':')[0];
    issueTypes[type] = (issueTypes[type] || 0) + 1;
  });
});
Object.entries(issueTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type}: ${count} 題`);
  });

// 儲存詳細報告
const report = {
  timestamp: new Date().toISOString(),
  total: allQuestions.length,
  passed: passCount,
  warnings: warnings.length,
  issues: issues.length,
  issueDetails: issues,
  warningDetails: warnings.slice(0, 100),
  issueTypes
};

fs.writeFileSync(
  path.join(__dirname, 'full-audit-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📁 詳細報告已存檔: scripts/full-audit-report.json');
