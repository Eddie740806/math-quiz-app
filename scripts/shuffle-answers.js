const fs = require('fs');

// 讀取題庫
const data = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

// Fisher-Yates shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 打亂每題的選項
data.questions = data.questions.map(q => {
  const correctAnswer = q.options[q.answer]; // 記住正確答案
  const shuffledOptions = shuffle(q.options); // 打亂選項
  const newAnswerIndex = shuffledOptions.indexOf(correctAnswer); // 找到新位置
  
  return {
    ...q,
    options: shuffledOptions,
    answer: newAnswerIndex
  };
});

// 統計答案分布
const dist = {0: 0, 1: 0, 2: 0, 3: 0};
data.questions.forEach(q => dist[q.answer]++);
console.log('答案分布:', dist);

// 寫回檔案
fs.writeFileSync('src/data/questions.json', JSON.stringify(data, null, 2));
console.log('完成！已打亂', data.questions.length, '題的選項順序');
