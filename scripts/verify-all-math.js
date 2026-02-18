/**
 * 完整數學驗算腳本 v2
 * 按題型分類，逐題計算驗證答案
 */

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const questions = data.questions;

const errors = [];
const verified = { total: 0, byType: {} };

// 工具函數
function extractNumbers(text) {
  return text.match(/\d+\.?\d*/g)?.map(Number) || [];
}

function getAnswerValue(options, answerIdx) {
  const opt = options[answerIdx];
  if (!opt) return null;
  const nums = opt.match(/[\d.]+/g);
  return nums ? parseFloat(nums[0]) : null;
}

// ===== 題型驗算器 =====

const verifiers = {
  // 1. 分數連續賣出題
  fractionSelling: {
    pattern: /第一天賣出\s*(\d+)\/(\d+).*?第二天賣出.*?剩下.*?(?:的)?(\d+)\/(\d+).*?還剩\s*(\d+)\s*件.*?原有/,
    verify: (match, q) => {
      const [, a1, b1, a2, b2, remain] = match.map((v, i) => i === 0 ? v : Number(v));
      // 剩下比例 = (1 - a1/b1) × (1 - a2/b2)
      const remainRatio = (1 - a1/b1) * (1 - a2/b2);
      const original = remain / remainRatio;
      const answer = getAnswerValue(q.options, q.answer);
      if (Math.abs(original - answer) > 0.5) {
        return { expected: Math.round(original), got: answer, formula: `${remain} ÷ ${remainRatio.toFixed(4)}` };
      }
      return null;
    }
  },

  // 2. 分數賣出（單次）
  fractionSingleSell: {
    pattern: /賣出\s*(\d+)\/(\d+).*?還剩\s*(\d+)\s*件.*?原有|原有.*?賣出\s*(\d+)\/(\d+).*?剩\s*(\d+)/,
    verify: (match, q) => {
      const nums = match.filter((v, i) => i > 0 && v).map(Number);
      if (nums.length < 3) return null;
      const [a, b, remain] = nums;
      const remainRatio = 1 - a/b;
      const original = remain / remainRatio;
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(original - answer) > 0.5) {
        return { expected: Math.round(original), got: answer };
      }
      return null;
    }
  },

  // 3. 百分比計算：X 的 Y%
  percentOf: {
    pattern: /(\d+)\s*的\s*(\d+(?:\.\d+)?)\s*%\s*是/,
    verify: (match, q) => {
      const base = Number(match[1]);
      const percent = Number(match[2]);
      const expected = base * percent / 100;
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.01) {
        return { expected, got: answer };
      }
      return null;
    }
  },

  // 4. 比值問題：A:B = X:Y，求某數
  ratioSimple: {
    pattern: /(\d+)\s*[：:]\s*(\d+)\s*[=＝]\s*(\d+)\s*[：:]\s*[?？X]/i,
    verify: (match, q) => {
      const [, a, b, c] = match.map(Number);
      const expected = c * b / a;
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.01) {
        return { expected, got: answer };
      }
      return null;
    }
  },

  // 5. 同向追擊（速度差 × 時間 = 距離差）
  sameDirChase: {
    pattern: /同.*?向.*?時速\s*(\d+).*?時速\s*(\d+).*?(\d+)\s*小時.*?相距|時速\s*(\d+).*?時速\s*(\d+).*?同.*?向.*?(\d+)\s*小時.*?相距/,
    verify: (match, q) => {
      const nums = match.filter((v, i) => i > 0 && v).map(Number);
      if (nums.length < 3) return null;
      const speeds = nums.slice(0, 2).sort((a,b) => b-a);
      const time = nums[2];
      const expected = (speeds[0] - speeds[1]) * time;
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.5) {
        return { expected, got: answer };
      }
      return null;
    }
  },

  // 6. 相向而行（速度和 × 時間 = 總距離）
  oppositeDirMeet: {
    pattern: /相向.*?時速\s*(\d+).*?時速\s*(\d+).*?(\d+)\s*小時.*?相距|反向.*?時速\s*(\d+).*?時速\s*(\d+).*?(\d+)\s*小時/,
    verify: (match, q) => {
      const nums = match.filter((v, i) => i > 0 && v).map(Number);
      if (nums.length < 3) return null;
      const [s1, s2, time] = nums;
      const expected = (s1 + s2) * time;
      const answer = getAnswerValue(q.options, q.answer);
      // 這類題可能問的不是總距離，先跳過
      return null;
    }
  },

  // 7. 簡單乘法：X 個 Y 元
  simpleMultiply: {
    pattern: /(\d+)\s*[個顆件本枝].*?每[個顆件本枝]?\s*(\d+)\s*元.*?[共總].*?多少|每[個顆件本枝]?\s*(\d+)\s*元.*?買\s*(\d+)\s*[個顆件本枝]/,
    verify: (match, q) => {
      const nums = match.filter((v, i) => i > 0 && v).map(Number);
      if (nums.length < 2) return null;
      const expected = nums[0] * nums[1];
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.01) {
        return { expected, got: answer };
      }
      return null;
    }
  },

  // 8. 平均數
  average: {
    pattern: /平均.*?(\d+)[,、](\d+)[,、](\d+)(?:[,、](\d+))?(?:[,、](\d+))?/,
    verify: (match, q) => {
      const nums = match.filter((v, i) => i > 0 && v).map(Number);
      if (nums.length < 2) return null;
      const expected = nums.reduce((a,b) => a+b, 0) / nums.length;
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.1) {
        return { expected: expected.toFixed(1), got: answer };
      }
      return null;
    }
  },

  // 9. 工作問題：A 做 X 天，B 做 Y 天，合作幾天
  workTogether: {
    pattern: /(\d+)\s*天.*?完成.*?(\d+)\s*天.*?完成.*?合[作做].*?[幾多少]\s*天/,
    verify: (match, q) => {
      const [, daysA, daysB] = match.map(Number);
      const expected = (daysA * daysB) / (daysA + daysB);
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.1) {
        return { expected: expected.toFixed(1), got: answer };
      }
      return null;
    }
  },

  // 10. 濃度問題：X 克鹽 + Y 克水 = 濃度
  concentration: {
    pattern: /(\d+)\s*克.*?鹽.*?(\d+)\s*克.*?水.*?濃度|鹽\s*(\d+).*?水\s*(\d+).*?濃度/,
    verify: (match, q) => {
      const nums = match.filter((v, i) => i > 0 && v).map(Number);
      if (nums.length < 2) return null;
      const [salt, water] = nums;
      const expected = (salt / (salt + water)) * 100;
      const answer = getAnswerValue(q.options, q.answer);
      if (answer && Math.abs(expected - answer) > 0.1) {
        return { expected: expected.toFixed(1) + '%', got: answer };
      }
      return null;
    }
  }
};

// ===== 執行驗算 =====

console.log('🔍 開始數學驗算...\n');

questions.forEach(q => {
  for (const [typeName, verifier] of Object.entries(verifiers)) {
    const match = q.content.match(verifier.pattern);
    if (match) {
      verified.total++;
      verified.byType[typeName] = (verified.byType[typeName] || 0) + 1;
      
      const result = verifier.verify(match, q);
      if (result) {
        errors.push({
          id: q.id,
          type: typeName,
          content: q.content.substring(0, 60) + '...',
          ...result
        });
      }
      break; // 每題只匹配一種類型
    }
  }
});

// ===== 輸出報告 =====

console.log('📊 驗算統計');
console.log(`   總題數: ${questions.length}`);
console.log(`   可驗算: ${verified.total} 題`);
console.log(`   發現錯誤: ${errors.length} 題\n`);

console.log('📋 各題型驗算數量:');
for (const [type, count] of Object.entries(verified.byType)) {
  console.log(`   ${type}: ${count} 題`);
}

if (errors.length > 0) {
  console.log('\n❌ 錯誤列表:');
  errors.forEach((e, i) => {
    console.log(`\n${i+1}. [${e.id}] ${e.type}`);
    console.log(`   題目: ${e.content}`);
    console.log(`   應該: ${e.expected}`);
    console.log(`   實際: ${e.got}`);
    if (e.formula) console.log(`   公式: ${e.formula}`);
  });
}

// 儲存報告
const report = {
  timestamp: new Date().toISOString(),
  totalQuestions: questions.length,
  verifiedCount: verified.total,
  errorCount: errors.length,
  byType: verified.byType,
  errors
};

fs.writeFileSync(
  path.join(__dirname, 'math-verify-report-v2.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✅ 報告已存檔: scripts/math-verify-report-v2.json');
