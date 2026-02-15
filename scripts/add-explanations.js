const fs = require('fs');
const path = require('path');

// 讀取題庫
const questionsPath = path.join(__dirname, '../src/data/questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// 解析生成函數
function generateExplanation(q) {
  const content = q.content;
  const correctAnswer = q.options[q.answer];
  const category = q.category;
  
  // 根據題目類型生成解析
  
  // 分數加減
  if (category === '分數加減' || category === '分數計算') {
    if (content.includes('+')) {
      return `先通分，找到公分母，再進行加法運算。${correctAnswer.includes('又') ? '結果如為假分數需化為帶分數。' : ''}答案是 ${correctAnswer}`;
    }
    if (content.includes('-')) {
      return `先通分，找到公分母，再進行減法運算。答案是 ${correctAnswer}`;
    }
  }
  
  // 分數乘除
  if (category === '分數乘除' || category.includes('分數')) {
    if (content.includes('÷') || content.includes('除')) {
      return `分數除法：除以一個分數等於乘以它的倒數。計算後約分得到答案 ${correctAnswer}`;
    }
    if (content.includes('×') || content.includes('乘') || content.includes('的')) {
      return `分數乘法：分子乘分子，分母乘分母，最後約分。答案是 ${correctAnswer}`;
    }
  }
  
  // 小數運算
  if (category === '小數運算' || category === '小數綜合') {
    if (content.includes('+')) {
      return `小數加法：對齊小數點，從右往左依次相加。答案是 ${correctAnswer}`;
    }
    if (content.includes('-')) {
      return `小數減法：對齊小數點，從右往左依次相減，不夠借位。答案是 ${correctAnswer}`;
    }
    if (content.includes('×')) {
      return `小數乘法：先按整數乘法計算，再數小數位數點小數點。答案是 ${correctAnswer}`;
    }
    if (content.includes('÷')) {
      return `小數除法：移動小數點使除數變成整數，被除數也移動相同位數。答案是 ${correctAnswer}`;
    }
  }
  
  // 面積計算
  if (category === '面積計算' || category === '面積綜合') {
    if (content.includes('長方形')) {
      return `長方形面積 = 長 × 寬。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('正方形')) {
      return `正方形面積 = 邊長 × 邊長。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('三角形')) {
      return `三角形面積 = 底 × 高 ÷ 2。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('梯形')) {
      return `梯形面積 = (上底 + 下底) × 高 ÷ 2。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('平行四邊形')) {
      return `平行四邊形面積 = 底 × 高。代入數值計算得到答案 ${correctAnswer}`;
    }
    return `根據圖形面積公式計算，答案是 ${correctAnswer}`;
  }
  
  // 周長計算
  if (category === '周長計算') {
    if (content.includes('長方形')) {
      return `長方形周長 = (長 + 寬) × 2。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('正方形')) {
      return `正方形周長 = 邊長 × 4。代入數值計算得到答案 ${correctAnswer}`;
    }
    return `周長是圖形所有邊的總長度。計算得到答案 ${correctAnswer}`;
  }
  
  // 體積計算
  if (category === '體積計算' || category === '體積綜合' || category === '圓柱體積') {
    if (content.includes('長方體')) {
      return `長方體體積 = 長 × 寬 × 高。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('正方體')) {
      return `正方體體積 = 邊長 × 邊長 × 邊長。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('圓柱')) {
      return `圓柱體積 = π × 半徑² × 高。代入數值計算得到答案 ${correctAnswer}`;
    }
    return `根據體積公式計算，答案是 ${correctAnswer}`;
  }
  
  // 圓的周長與面積
  if (category === '圓的周長與面積') {
    if (content.includes('周長') || content.includes('圓周')) {
      return `圓周長 = 2 × π × 半徑 = π × 直徑。代入數值計算得到答案 ${correctAnswer}`;
    }
    if (content.includes('面積')) {
      return `圓面積 = π × 半徑²。代入數值計算得到答案 ${correctAnswer}`;
    }
  }
  
  // 因數與倍數
  if (category === '因數與倍數' || category === '質數與合數') {
    if (content.includes('最大公因數') || content.includes('公因數')) {
      return `找出兩數的所有因數，取共同因數中最大的。答案是 ${correctAnswer}`;
    }
    if (content.includes('最小公倍數') || content.includes('公倍數')) {
      return `找出兩數的倍數，取共同倍數中最小的。答案是 ${correctAnswer}`;
    }
    if (content.includes('質數')) {
      return `質數只有 1 和自己兩個因數。判斷後答案是 ${correctAnswer}`;
    }
  }
  
  // 比與比值
  if (category === '比與比值' || category === '比與比值應用') {
    return `比的化簡：找最大公因數約分。比值 = 前項 ÷ 後項。答案是 ${correctAnswer}`;
  }
  
  // 百分比
  if (category === '百分比基礎' || category === '百分率應用') {
    return `百分比 = (部分 ÷ 整體) × 100%。根據題意計算得到答案 ${correctAnswer}`;
  }
  
  // 速率問題
  if (category === '速率問題' || category === '速率問題進階') {
    return `速率公式：速率 = 距離 ÷ 時間，距離 = 速率 × 時間，時間 = 距離 ÷ 速率。計算得到答案 ${correctAnswer}`;
  }
  
  // 時間計算
  if (category === '時間計算') {
    return `注意時間單位換算：1小時 = 60分鐘，1分鐘 = 60秒。計算得到答案 ${correctAnswer}`;
  }
  
  // 和差問題
  if (category === '和差問題') {
    return `和差問題公式：大數 = (和 + 差) ÷ 2，小數 = (和 - 差) ÷ 2。計算得到答案 ${correctAnswer}`;
  }
  
  // 倍數問題
  if (category === '倍數問題') {
    return `設未知數列方程式，根據倍數關係求解。答案是 ${correctAnswer}`;
  }
  
  // 年齡問題
  if (category === '年齡問題' || category === '年齡問題進階') {
    return `年齡問題關鍵：年齡差不變。設未知數，列方程式求解。答案是 ${correctAnswer}`;
  }
  
  // 工作問題
  if (category === '工作問題' || category === '工程問題進階') {
    return `工作問題：設工作總量為 1，工作效率 = 1 ÷ 完成時間。合作時效率相加。答案是 ${correctAnswer}`;
  }
  
  // 濃度問題
  if (category === '濃度問題') {
    return `濃度 = 溶質 ÷ 溶液 × 100%。根據題意列式計算得到答案 ${correctAnswer}`;
  }
  
  // 利潤問題
  if (category === '利潤問題') {
    return `利潤 = 售價 - 成本，利潤率 = 利潤 ÷ 成本 × 100%。計算得到答案 ${correctAnswer}`;
  }
  
  // 雞兔問題
  if (category === '雞兔問題') {
    return `雞兔問題：假設全是雞（或兔），算出腳數差，再根據腳數差求出兔（或雞）的數量。答案是 ${correctAnswer}`;
  }
  
  // 植樹問題
  if (category === '植樹問題') {
    return `植樹問題：兩端都種棵數 = 間隔數 + 1；一端種棵數 = 間隔數；兩端不種棵數 = 間隔數 - 1。答案是 ${correctAnswer}`;
  }
  
  // 等差數列
  if (category === '等差數列') {
    return `等差數列：第 n 項 = 首項 + (n-1) × 公差；項數 = (末項 - 首項) ÷ 公差 + 1；總和 = (首項 + 末項) × 項數 ÷ 2。答案是 ${correctAnswer}`;
  }
  
  // 規律問題
  if (category === '規律問題') {
    return `找出數列或圖形的規律，根據規律推算答案。答案是 ${correctAnswer}`;
  }
  
  // 邏輯推理
  if (category === '邏輯推理') {
    return `根據題目條件，運用邏輯推理，排除錯誤選項。答案是 ${correctAnswer}`;
  }
  
  // 統計圖表
  if (category === '統計圖表' || category === '統計與圖表') {
    return `仔細閱讀圖表數據，根據題意進行計算或比較。答案是 ${correctAnswer}`;
  }
  
  // 正負數運算
  if (category === '正負數運算') {
    return `正負數運算規則：同號相加取同號，異號相加取絕對值大的符號。答案是 ${correctAnswer}`;
  }
  
  // 一元一次方程式
  if (category === '一元一次方程式' || category === '方程式應用') {
    return `設未知數為 x，根據題意列方程式，移項求解。答案是 ${correctAnswer}`;
  }
  
  // 幾何綜合
  if (category === '幾何綜合') {
    return `運用幾何公式和性質，分步計算求解。答案是 ${correctAnswer}`;
  }
  
  // 購物應用
  if (category === '購物應用') {
    return `根據單價和數量的關係：總價 = 單價 × 數量。計算得到答案 ${correctAnswer}`;
  }
  
  // 混合應用題 / 綜合應用
  if (category.includes('綜合') || category.includes('混合') || category.includes('應用')) {
    return `仔細分析題意，找出數量關係，列式計算。答案是 ${correctAnswer}`;
  }
  
  // 通用解析
  return `根據題意分析數量關係，列式計算得到答案 ${correctAnswer}`;
}

// 處理所有題目
let addedCount = 0;
let skippedCount = 0;

data.questions = data.questions.map(q => {
  if (!q.explanation || q.explanation.trim() === '') {
    q.explanation = generateExplanation(q);
    addedCount++;
  } else {
    skippedCount++;
  }
  return q;
});

// 寫回文件
fs.writeFileSync(questionsPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ 完成！`);
console.log(`   新增解析：${addedCount} 題`);
console.log(`   已有解析：${skippedCount} 題`);
console.log(`   總計：${data.questions.length} 題`);
