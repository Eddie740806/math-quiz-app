'use client';

// 需要圖形的題目 ID 列表
const QUESTIONS_WITH_IMAGE = ['ps-060', 'ps-062', 'ps-122'];

export function hasImage(questionId: string): boolean {
  return QUESTIONS_WITH_IMAGE.includes(questionId);
}

export function QuestionImage({ questionId }: { questionId: string }) {
  switch (questionId) {
    case 'ps-060':
      return <TriangleFoldImage />;
    case 'ps-062':
      return <ShadowAreaImage />;
    case 'ps-122':
      return <GridCountImage />;
    default:
      return null;
  }
}

// ps-060: 三角形摺成長方形
function TriangleFoldImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="280" height="140" viewBox="0 0 280 140">
        {/* 左邊：原始三角形 */}
        <polygon 
          points="20,120 100,20 100,120" 
          fill="#fca5a5" 
          stroke="#dc2626" 
          strokeWidth="2"
        />
        <text x="60" y="135" textAnchor="middle" fontSize="12" fill="#666">三角形</text>
        
        {/* 箭頭 */}
        <line x1="115" y1="70" x2="155" y2="70" stroke="#666" strokeWidth="2" />
        <polygon points="155,70 145,65 145,75" fill="#666" />
        <text x="135" y="60" textAnchor="middle" fontSize="10" fill="#666">摺</text>
        
        {/* 右邊：摺成的長方形 */}
        <rect 
          x="170" y="40" width="90" height="60" 
          fill="#86efac" 
          stroke="#16a34a" 
          strokeWidth="2"
        />
        {/* 摺痕虛線 */}
        <line x1="170" y1="70" x2="260" y2="70" stroke="#666" strokeWidth="1" strokeDasharray="4,2" />
        <text x="215" y="135" textAnchor="middle" fontSize="12" fill="#666">長方形</text>
        <text x="215" y="115" textAnchor="middle" fontSize="11" fill="#333" fontWeight="bold">面積 = 42</text>
      </svg>
    </div>
  );
}

// ps-062: 正方形分割陰影面積
function ShadowAreaImage() {
  // 14公分正方形，分成 3,2,5,2,2 公分
  const scale = 12; // 1公分 = 12px
  const segments = [3, 2, 5, 2, 2]; // 總共 14
  const positions = [0, 3, 5, 10, 12, 14]; // 累積位置
  
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* 外框 */}
        <rect x="20" y="20" width={14*scale} height={14*scale} fill="white" stroke="#333" strokeWidth="2" />
        
        {/* 陰影區域（棋盤格樣式，部分格子塗色） */}
        {positions.slice(0, -1).map((x, i) => 
          positions.slice(0, -1).map((y, j) => {
            // 模擬陰影區域（交錯塗色）
            const isShadow = (i + j) % 2 === 0;
            const width = segments[i] * scale;
            const height = segments[j] * scale;
            return (
              <rect
                key={`${i}-${j}`}
                x={20 + x * scale}
                y={20 + y * scale}
                width={width}
                height={height}
                fill={isShadow ? '#a5b4fc' : 'white'}
                stroke="#666"
                strokeWidth="1"
              />
            );
          })
        )}
        
        {/* 上方尺寸標示 */}
        <text x="20" y="15" fontSize="9" fill="#333">3</text>
        <text x="56" y="15" fontSize="9" fill="#333">2</text>
        <text x="90" y="15" fontSize="9" fill="#333">5</text>
        <text x="140" y="15" fontSize="9" fill="#333">2</text>
        <text x="164" y="15" fontSize="9" fill="#333">2</text>
        
        {/* 左側尺寸標示 */}
        <text x="5" y="45" fontSize="9" fill="#333">3</text>
        <text x="5" y="70" fontSize="9" fill="#333">2</text>
        <text x="5" y="105" fontSize="9" fill="#333">5</text>
        <text x="5" y="150" fontSize="9" fill="#333">2</text>
        <text x="5" y="175" fontSize="9" fill="#333">2</text>
        
        {/* 說明 */}
        <text x="110" y="210" textAnchor="middle" fontSize="11" fill="#666">陰影區 = 藍色部分</text>
      </svg>
    </div>
  );
}

// ps-122: 4x4 網格數正方形
function GridCountImage() {
  const cellSize = 35;
  const offset = 30;
  
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* 4x4 網格 */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`h-${i}`}
            x1={offset}
            y1={offset + i * cellSize}
            x2={offset + 4 * cellSize}
            y2={offset + i * cellSize}
            stroke="#333"
            strokeWidth="2"
          />
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`v-${i}`}
            x1={offset + i * cellSize}
            y1={offset}
            x2={offset + i * cellSize}
            y2={offset + 4 * cellSize}
            stroke="#333"
            strokeWidth="2"
          />
        ))}
        
        {/* 標示 4x4 */}
        <text x={offset + 2 * cellSize} y="20" textAnchor="middle" fontSize="12" fill="#666" fontWeight="bold">4 × 4 網格</text>
        <text x={offset + 2 * cellSize} y="190" textAnchor="middle" fontSize="11" fill="#666">數一數：有幾個正方形？</text>
        
        {/* 示意：用虛線框出一個 2x2 的例子 */}
        <rect
          x={offset + cellSize}
          y={offset + cellSize}
          width={cellSize * 2}
          height={cellSize * 2}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
      </svg>
    </div>
  );
}

export default QuestionImage;
