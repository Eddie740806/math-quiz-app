/**
 * 修復國小題庫中的負數問題
 * 改成「賺 X 元」或「賠 X 元」
 */
const fs = require('fs');

const mainPath = './src/data/questions.json';
const mainData = require('.' + mainPath);

let fixed = 0;
const fixedList = [];

mainData.questions.forEach(q => {
  // 只處理五年級的題目
  if (q.grade !== 5) return;
  
  // 檢查選項是否有負數
  let hasNegative = false;
  q.options.forEach((opt, idx) => {
    if (typeof opt === 'string' && opt.match(/^-\d+$/)) {
      hasNegative = true;
    }
  });
  
  if (!hasNegative) return;
  
  // 是利潤問題嗎？
  if (q.category === '利潤問題' || q.content.includes('利潤')) {
    // 修改選項：-5 -> 賠 5 元
    q.options = q.options.map(opt => {
      if (typeof opt === 'string') {
        const negMatch = opt.match(/^-(\d+)$/);
        if (negMatch) {
          return `賠 ${negMatch[1]} 元`;
        }
        const posMatch = opt.match(/^(\d+)$/);
        if (posMatch && parseInt(posMatch[1]) > 0) {
          return `賺 ${posMatch[1]} 元`;
        }
        if (opt === '0') {
          return '不賺不賠';
        }
      }
      return opt;
    });
    
    // 修改題目：「利潤是多少元」->「賺或賠多少元」
    if (q.content.includes('利潤是多少元')) {
      q.content = q.content.replace('利潤是多少元', '是賺還是賠？賺或賠多少元');
    }
    
    // 修改解析
    if (q.explanation) {
      q.explanation = q.explanation.replace('答案：-', '答案：賠 ');
      q.explanation = q.explanation.replace(/答案：(\d+)$/, '答案：賺 $1 元');
      q.explanation += '\n\n💡 小提醒：利潤為正數是賺錢，利潤為負數是賠錢！';
    }
    
    fixed++;
    fixedList.push({
      id: q.id,
      content: q.content.substring(0, 40),
      options: q.options
    });
  }
});

// 保存
fs.writeFileSync(mainPath, JSON.stringify(mainData, null, 2), 'utf8');

console.log('========================================');
console.log('📝 修復國小負數問題');
console.log('========================================\n');
console.log(`✅ 修復了 ${fixed} 題\n`);

if (fixedList.length > 0) {
  console.log('修復的題目：');
  fixedList.slice(0, 10).forEach(item => {
    console.log(`  ${item.id}: ${item.content}...`);
    console.log(`    選項: ${item.options.join(', ')}`);
  });
  if (fixedList.length > 10) {
    console.log(`  ... 還有 ${fixedList.length - 10} 題`);
  }
}

console.log('\n========================================');
