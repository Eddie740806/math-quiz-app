// 自動生成 100 題幾何圖形題
const fs = require('fs');

// 隨機整數
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 生成錯誤選項（接近正確答案）
const generateWrongOptions = (correct, count = 3) => {
  const options = new Set();
  while (options.size < count) {
    const variation = randInt(-30, 30);
    const wrong = correct + variation;
    if (wrong > 0 && wrong !== correct && !options.has(wrong)) {
      options.add(wrong);
    }
  }
  return Array.from(options);
};

// 打亂選項並返回正確答案的索引
const shuffleOptions = (correct, wrongs) => {
  const all = [correct, ...wrongs];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    options: all.map(v => `${v} 平方公分`),
    answer: all.indexOf(correct)
  };
};

const shuffleOptionsLength = (correct, wrongs) => {
  const all = [correct, ...wrongs];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    options: all.map(v => `${v} 公分`),
    answer: all.indexOf(correct)
  };
};

const questions = [];
const svgComponents = [];
let idCounter = 100;

// ========== 五年級題目 ==========

// 1. 長方形面積 (10題)
for (let i = 0; i < 10; i++) {
  const length = randInt(5, 15);
  const width = randInt(3, 10);
  const area = length * width;
  const id = `geo-${idCounter++}`;
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: "下圖是一個長方形，求它的面積是多少平方公分？",
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "easy",
    source: "幾何圖形",
    explanation: `長方形面積 = 長 × 寬 = ${length} × ${width} = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'rectangle',
    params: { length, width }
  });
}

// 2. 正方形面積 (8題)
for (let i = 0; i < 8; i++) {
  const side = randInt(4, 12);
  const area = side * side;
  const id = `geo-${idCounter++}`;
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: "下圖是一個正方形，求它的面積是多少平方公分？",
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "easy",
    source: "幾何圖形",
    explanation: `正方形面積 = 邊長 × 邊長 = ${side} × ${side} = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'square',
    params: { side }
  });
}

// 3. 三角形面積 (12題)
for (let i = 0; i < 12; i++) {
  const base = randInt(4, 14);
  const height = randInt(4, 12);
  const area = (base * height) / 2;
  const id = `geo-${idCounter++}`;
  
  // 確保面積是整數
  if (area !== Math.floor(area)) {
    idCounter--;
    continue;
  }
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: "下圖是一個三角形，求它的面積是多少平方公分？",
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `三角形面積 = 底 × 高 ÷ 2 = ${base} × ${height} ÷ 2 = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'triangle',
    params: { base, height }
  });
}

// 補足三角形題目到12題
while (questions.filter(q => q.id.startsWith('geo-') && q.explanation.includes('三角形')).length < 12) {
  const base = randInt(2, 7) * 2; // 偶數確保整數
  const height = randInt(3, 10);
  const area = (base * height) / 2;
  const id = `geo-${idCounter++}`;
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: "下圖是一個三角形，求它的面積是多少平方公分？",
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `三角形面積 = 底 × 高 ÷ 2 = ${base} × ${height} ÷ 2 = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'triangle',
    params: { base, height }
  });
}

// 4. 平行四邊形面積 (10題)
for (let i = 0; i < 10; i++) {
  const base = randInt(5, 12);
  const height = randInt(4, 10);
  const area = base * height;
  const id = `geo-${idCounter++}`;
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: "下圖是一個平行四邊形，求它的面積是多少平方公分？",
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `平行四邊形面積 = 底 × 高 = ${base} × ${height} = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'parallelogram',
    params: { base, height }
  });
}

// 5. 梯形面積 (10題)
for (let i = 0; i < 10; i++) {
  const top = randInt(3, 8);
  const bottom = randInt(top + 2, 14);
  const height = randInt(4, 10);
  const area = ((top + bottom) * height) / 2;
  const id = `geo-${idCounter++}`;
  
  if (area !== Math.floor(area)) {
    idCounter--;
    continue;
  }
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: `下圖是一個梯形，上底 ${top} 公分，下底 ${bottom} 公分，高 ${height} 公分，求面積是多少平方公分？`,
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `梯形面積 = (上底 + 下底) × 高 ÷ 2 = (${top} + ${bottom}) × ${height} ÷ 2 = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'trapezoid',
    params: { top, bottom, height }
  });
}

// 補足梯形到10題
while (questions.filter(q => q.explanation.includes('梯形')).length < 10) {
  const top = randInt(2, 4) * 2;
  const bottom = top + randInt(2, 4) * 2;
  const height = randInt(3, 8);
  const area = ((top + bottom) * height) / 2;
  const id = `geo-${idCounter++}`;
  
  const { options, answer } = shuffleOptions(area, generateWrongOptions(area));
  
  questions.push({
    id,
    content: `下圖是一個梯形，上底 ${top} 公分，下底 ${bottom} 公分，高 ${height} 公分，求面積是多少平方公分？`,
    options,
    answer,
    grade: 5,
    category: "面積計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `梯形面積 = (上底 + 下底) × 高 ÷ 2 = (${top} + ${bottom}) × ${height} ÷ 2 = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'trapezoid',
    params: { top, bottom, height }
  });
}

// ========== 六年級題目 ==========

// 6. 圓形面積 (15題)
for (let i = 0; i < 15; i++) {
  const radius = randInt(3, 10);
  const area = Math.round(3.14 * radius * radius * 10) / 10;
  const id = `geo-${idCounter++}`;
  
  const wrongs = [
    Math.round(3.14 * radius * 2 * 10) / 10, // 周長誤用
    Math.round(radius * radius * 10) / 10,    // 忘記 π
    Math.round(3.14 * radius * 10) / 10       // 忘記平方
  ].filter(w => w !== area && w > 0);
  
  const allOptions = [area, ...wrongs.slice(0, 3)];
  while (allOptions.length < 4) {
    allOptions.push(Math.round((area + randInt(-20, 20)) * 10) / 10);
  }
  
  // 打亂
  for (let j = allOptions.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [allOptions[j], allOptions[k]] = [allOptions[k], allOptions[j]];
  }
  
  questions.push({
    id,
    content: `下圖是一個圓形，半徑為 ${radius} 公分，求面積是多少平方公分？（π = 3.14）`,
    options: allOptions.map(v => `${v} 平方公分`),
    answer: allOptions.indexOf(area),
    grade: 6,
    category: "圓形計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `圓面積 = π × r² = 3.14 × ${radius} × ${radius} = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'circle',
    params: { radius }
  });
}

// 7. 圓周長 (10題)
for (let i = 0; i < 10; i++) {
  const radius = randInt(3, 12);
  const diameter = radius * 2;
  const circumference = Math.round(3.14 * diameter * 10) / 10;
  const id = `geo-${idCounter++}`;
  
  const wrongs = [
    Math.round(3.14 * radius * 10) / 10,
    Math.round(diameter * 10) / 10,
    Math.round(3.14 * radius * radius * 10) / 10
  ].filter(w => w !== circumference && w > 0);
  
  const allOptions = [circumference, ...wrongs.slice(0, 3)];
  while (allOptions.length < 4) {
    allOptions.push(Math.round((circumference + randInt(-15, 15)) * 10) / 10);
  }
  
  for (let j = allOptions.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [allOptions[j], allOptions[k]] = [allOptions[k], allOptions[j]];
  }
  
  questions.push({
    id,
    content: `下圖是一個圓形，半徑為 ${radius} 公分，求周長是多少公分？（π = 3.14）`,
    options: allOptions.map(v => `${v} 公分`),
    answer: allOptions.indexOf(circumference),
    grade: 6,
    category: "圓形計算",
    difficulty: "medium",
    source: "幾何圖形",
    explanation: `圓周長 = π × 直徑 = 3.14 × ${diameter} = ${circumference} 公分`
  });
  
  svgComponents.push({
    id,
    type: 'circle_circumference',
    params: { radius }
  });
}

// 8. 陰影面積 - 正方形內切圓 (15題)
for (let i = 0; i < 15; i++) {
  const side = randInt(6, 14);
  const squareArea = side * side;
  const circleRadius = side / 2;
  const circleArea = Math.round(3.14 * circleRadius * circleRadius * 10) / 10;
  const shadowArea = Math.round((squareArea - circleArea) * 10) / 10;
  const id = `geo-${idCounter++}`;
  
  const wrongs = [
    circleArea,
    squareArea,
    Math.round(squareArea / 2 * 10) / 10
  ].filter(w => w !== shadowArea && w > 0);
  
  const allOptions = [shadowArea, ...wrongs.slice(0, 3)];
  while (allOptions.length < 4) {
    allOptions.push(Math.round((shadowArea + randInt(-10, 20)) * 10) / 10);
  }
  
  for (let j = allOptions.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [allOptions[j], allOptions[k]] = [allOptions[k], allOptions[j]];
  }
  
  questions.push({
    id,
    content: `下圖正方形邊長 ${side} 公分，內有一個內切圓，求陰影部分的面積是多少平方公分？（π = 3.14）`,
    options: allOptions.map(v => `${v} 平方公分`),
    answer: allOptions.indexOf(shadowArea),
    grade: 6,
    category: "陰影面積",
    difficulty: "hard",
    source: "幾何圖形",
    explanation: `正方形面積 = ${side} × ${side} = ${squareArea}\n圓半徑 = ${side} ÷ 2 = ${circleRadius}\n圓面積 = 3.14 × ${circleRadius} × ${circleRadius} = ${circleArea}\n陰影面積 = ${squareArea} - ${circleArea} = ${shadowArea} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'shadow_circle_in_square',
    params: { side }
  });
}

// 9. 扇形面積 (10題)
for (let i = 0; i < 10; i++) {
  const radius = randInt(4, 10);
  const angle = [90, 60, 120, 45, 180][randInt(0, 4)];
  const area = Math.round(3.14 * radius * radius * (angle / 360) * 10) / 10;
  const id = `geo-${idCounter++}`;
  
  const wrongs = [
    Math.round(3.14 * radius * radius * 10) / 10,
    Math.round(area * 2 * 10) / 10,
    Math.round(area / 2 * 10) / 10
  ].filter(w => w !== area && w > 0);
  
  const allOptions = [area, ...wrongs.slice(0, 3)];
  while (allOptions.length < 4) {
    allOptions.push(Math.round((area + randInt(-10, 15)) * 10) / 10);
  }
  
  for (let j = allOptions.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [allOptions[j], allOptions[k]] = [allOptions[k], allOptions[j]];
  }
  
  questions.push({
    id,
    content: `下圖是一個扇形，半徑 ${radius} 公分，圓心角 ${angle} 度，求面積是多少平方公分？（π = 3.14）`,
    options: allOptions.map(v => `${v} 平方公分`),
    answer: allOptions.indexOf(area),
    grade: 6,
    category: "扇形計算",
    difficulty: "hard",
    source: "幾何圖形",
    explanation: `扇形面積 = π × r² × (角度/360) = 3.14 × ${radius} × ${radius} × (${angle}/360) = ${area} 平方公分`
  });
  
  svgComponents.push({
    id,
    type: 'sector',
    params: { radius, angle }
  });
}

// 輸出
console.log(`生成了 ${questions.length} 題`);
console.log(`五年級: ${questions.filter(q => q.grade === 5).length} 題`);
console.log(`六年級: ${questions.filter(q => q.grade === 6).length} 題`);

// 保存題目 JSON
fs.writeFileSync(
  './src/data/questions-geometry.json',
  JSON.stringify({ questions }, null, 2),
  'utf8'
);

// 保存 SVG 參數
fs.writeFileSync(
  './src/data/geometry-svg-params.json',
  JSON.stringify(svgComponents, null, 2),
  'utf8'
);

console.log('✅ 已保存到 questions-geometry.json 和 geometry-svg-params.json');
