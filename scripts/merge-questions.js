// 合併題庫腳本
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');

// 讀取所有題庫文件
const files = [
  'questions-grade5.json',
  'questions-grade5-part2.json',
  'questions-grade5-part3.json',
  'questions-grade5-part4.json',
  'questions-grade6.json',
  'questions-grade6-part2.json',
  'questions-grade6-part3.json',
  'questions-grade6-part4.json'
];

const allQuestions = [];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const grade = data.grade;
    data.units.forEach(unit => {
      unit.questions.forEach(q => {
        allQuestions.push({
          ...q,
          grade: grade,
          category: unit.name,
          difficulty: 'hard',
          source: '段考題'
        });
      });
    });
  }
});

// 生成新的 questions.json
const output = { questions: allQuestions };

fs.writeFileSync(
  path.join(dataDir, 'questions.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log(`合併完成！共 ${allQuestions.length} 題`);
console.log(`五年級: ${allQuestions.filter(q => q.grade === 5).length} 題`);
console.log(`六年級: ${allQuestions.filter(q => q.grade === 6).length} 題`);
