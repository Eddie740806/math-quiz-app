'use client';

// 需要圖形的題目 ID 列表
const QUESTIONS_WITH_IMAGE = [
  'ps-060', 'ps-062', 'ps-122',  // 原有題目
  'geo-001', 'geo-002', 'geo-003', 'geo-004', 'geo-005'  // 新增 5 題
];

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
    case 'geo-001':
      return <RectangleAreaImage />;
    case 'geo-002':
      return <CircleAreaImage />;
    case 'geo-003':
      return <ShadowCircleImage />;
    case 'geo-004':
      return <CompositeShapeImage />;
    case 'geo-005':
      return <TrapezoidImage />;
    default:
      return null;
  }
}

// ========== 原有題目 ==========

// ps-060: 三角形摺成長方形
function TriangleFoldImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="280" height="140" viewBox="0 0 280 140">
        <polygon points="20,120 100,20 100,120" fill="#fca5a5" stroke="#dc2626" strokeWidth="2"/>
        <text x="60" y="135" textAnchor="middle" fontSize="12" fill="#666">三角形</text>
        <line x1="115" y1="70" x2="155" y2="70" stroke="#666" strokeWidth="2" />
        <polygon points="155,70 145,65 145,75" fill="#666" />
        <text x="135" y="60" textAnchor="middle" fontSize="10" fill="#666">摺</text>
        <rect x="170" y="40" width="90" height="60" fill="#86efac" stroke="#16a34a" strokeWidth="2"/>
        <line x1="170" y1="70" x2="260" y2="70" stroke="#666" strokeWidth="1" strokeDasharray="4,2" />
        <text x="215" y="135" textAnchor="middle" fontSize="12" fill="#666">長方形</text>
        <text x="215" y="115" textAnchor="middle" fontSize="11" fill="#333" fontWeight="bold">面積 = 42</text>
      </svg>
    </div>
  );
}

// ps-062: 正方形分割陰影面積
function ShadowAreaImage() {
  const scale = 12;
  const segments = [3, 2, 5, 2, 2];
  const positions = [0, 3, 5, 10, 12, 14];
  
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="220" height="220" viewBox="0 0 220 220">
        <rect x="20" y="20" width={14*scale} height={14*scale} fill="white" stroke="#333" strokeWidth="2" />
        {positions.slice(0, -1).map((x, i) => 
          positions.slice(0, -1).map((y, j) => {
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
        <text x="20" y="15" fontSize="9" fill="#333">3</text>
        <text x="56" y="15" fontSize="9" fill="#333">2</text>
        <text x="90" y="15" fontSize="9" fill="#333">5</text>
        <text x="140" y="15" fontSize="9" fill="#333">2</text>
        <text x="164" y="15" fontSize="9" fill="#333">2</text>
        <text x="5" y="45" fontSize="9" fill="#333">3</text>
        <text x="5" y="70" fontSize="9" fill="#333">2</text>
        <text x="5" y="105" fontSize="9" fill="#333">5</text>
        <text x="5" y="150" fontSize="9" fill="#333">2</text>
        <text x="5" y="175" fontSize="9" fill="#333">2</text>
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
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`h-${i}`} x1={offset} y1={offset + i * cellSize} x2={offset + 4 * cellSize} y2={offset + i * cellSize} stroke="#333" strokeWidth="2"/>
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`v-${i}`} x1={offset + i * cellSize} y1={offset} x2={offset + i * cellSize} y2={offset + 4 * cellSize} stroke="#333" strokeWidth="2"/>
        ))}
        <text x={offset + 2 * cellSize} y="20" textAnchor="middle" fontSize="12" fill="#666" fontWeight="bold">4 × 4 網格</text>
        <text x={offset + 2 * cellSize} y="190" textAnchor="middle" fontSize="11" fill="#666">數一數：有幾個正方形？</text>
        <rect x={offset + cellSize} y={offset + cellSize} width={cellSize * 2} height={cellSize * 2} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2"/>
      </svg>
    </div>
  );
}

// ========== 新增 5 題 ==========

// geo-001: 長方形面積
function RectangleAreaImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="240" height="160" viewBox="0 0 240 160">
        {/* 長方形 */}
        <rect x="40" y="30" width="160" height="80" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="3"/>
        {/* 長度標示 */}
        <line x1="40" y1="125" x2="200" y2="125" stroke="#333" strokeWidth="2"/>
        <line x1="40" y1="120" x2="40" y2="130" stroke="#333" strokeWidth="2"/>
        <line x1="200" y1="120" x2="200" y2="130" stroke="#333" strokeWidth="2"/>
        <text x="120" y="145" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">12 公分</text>
        {/* 寬度標示 */}
        <line x1="25" y1="30" x2="25" y2="110" stroke="#333" strokeWidth="2"/>
        <line x1="20" y1="30" x2="30" y2="30" stroke="#333" strokeWidth="2"/>
        <line x1="20" y1="110" x2="30" y2="110" stroke="#333" strokeWidth="2"/>
        <text x="18" y="75" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold" writingMode="vertical-rl">8 公分</text>
      </svg>
    </div>
  );
}

// geo-002: 圓形面積
function CircleAreaImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* 圓形 */}
        <circle cx="90" cy="90" r="70" fill="#fca5a5" stroke="#dc2626" strokeWidth="3"/>
        {/* 半徑線 */}
        <line x1="90" y1="90" x2="160" y2="90" stroke="#333" strokeWidth="2" strokeDasharray="5,3"/>
        {/* 圓心點 */}
        <circle cx="90" cy="90" r="4" fill="#333"/>
        {/* 半徑標示 */}
        <text x="125" y="82" fontSize="14" fill="#333" fontWeight="bold">7 公分</text>
      </svg>
    </div>
  );
}

// geo-003: 陰影面積（正方形內切圓）
function ShadowCircleImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="180" height="200" viewBox="0 0 180 200">
        {/* 正方形（陰影） */}
        <rect x="20" y="20" width="140" height="140" fill="#6366f1"/>
        {/* 圓形（白色，挖空效果） */}
        <circle cx="90" cy="90" r="70" fill="white"/>
        {/* 正方形邊框 */}
        <rect x="20" y="20" width="140" height="140" fill="none" stroke="#4f46e5" strokeWidth="3"/>
        {/* 邊長標示 */}
        <text x="90" y="180" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">10 公分</text>
        {/* 說明 */}
        <text x="90" y="195" textAnchor="middle" fontSize="11" fill="#666">求紫色陰影面積</text>
      </svg>
    </div>
  );
}

// geo-004: 組合圖形（長方形+三角形）
function CompositeShapeImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="240" height="160" viewBox="0 0 240 160">
        {/* 長方形 */}
        <rect x="30" y="40" width="100" height="70" fill="#86efac" stroke="#16a34a" strokeWidth="3"/>
        {/* 三角形 */}
        <polygon points="130,40 190,75 130,110" fill="#fde047" stroke="#ca8a04" strokeWidth="3"/>
        {/* 長方形尺寸 */}
        <text x="80" y="135" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">6 公分</text>
        <line x1="30" y1="125" x2="130" y2="125" stroke="#333" strokeWidth="1"/>
        {/* 高度 */}
        <text x="15" y="80" fontSize="13" fill="#333" fontWeight="bold">4</text>
        <line x1="22" y1="40" x2="22" y2="110" stroke="#333" strokeWidth="1"/>
        {/* 三角形底 */}
        <text x="130" y="80" fontSize="11" fill="#333">4公分</text>
        {/* 三角形高 */}
        <line x1="130" y1="75" x2="190" y2="75" stroke="#333" strokeWidth="1" strokeDasharray="3,2"/>
        <text x="160" y="68" fontSize="11" fill="#333">4公分</text>
      </svg>
    </div>
  );
}

// geo-005: 梯形
function TrapezoidImage() {
  return (
    <div className="flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <svg width="220" height="170" viewBox="0 0 220 170">
        {/* 梯形 */}
        <polygon points="70,30 150,30 190,130 30,130" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="3"/>
        {/* 上底標示 */}
        <line x1="70" y1="20" x2="150" y2="20" stroke="#333" strokeWidth="2"/>
        <line x1="70" y1="15" x2="70" y2="25" stroke="#333" strokeWidth="2"/>
        <line x1="150" y1="15" x2="150" y2="25" stroke="#333" strokeWidth="2"/>
        <text x="110" y="15" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">4 公分</text>
        {/* 下底標示 */}
        <line x1="30" y1="145" x2="190" y2="145" stroke="#333" strokeWidth="2"/>
        <line x1="30" y1="140" x2="30" y2="150" stroke="#333" strokeWidth="2"/>
        <line x1="190" y1="140" x2="190" y2="150" stroke="#333" strokeWidth="2"/>
        <text x="110" y="162" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">8 公分</text>
        {/* 高標示（虛線） */}
        <line x1="110" y1="30" x2="110" y2="130" stroke="#333" strokeWidth="2" strokeDasharray="5,3"/>
        <text x="125" y="85" fontSize="13" fill="#333" fontWeight="bold">5 公分</text>
      </svg>
    </div>
  );
}

export default QuestionImage;
