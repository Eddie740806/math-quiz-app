'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import svgParams from '@/data/geometry-svg-params.json';

const paramsMap: Record<string, any> = {};
(svgParams as any[]).forEach(p => {
  paramsMap[p.id] = p;
});

export function hasGeometryImage(questionId: string): boolean {
  return questionId in paramsMap;
}

export function GeometryImage({ questionId }: { questionId: string }) {
  const data = paramsMap[questionId];
  if (!data) return null;

  const { type, params } = data;

  switch (type) {
    case 'rectangle':
      return <RectangleSvg length={params.length} width={params.width} />;
    case 'square':
      return <SquareSvg side={params.side} />;
    case 'triangle':
      return <TriangleSvg base={params.base} height={params.height} />;
    case 'parallelogram':
      return <ParallelogramSvg base={params.base} height={params.height} />;
    case 'trapezoid':
      return <TrapezoidSvg top={params.top} bottom={params.bottom} height={params.height} />;
    case 'circle':
    case 'circle_circumference':
      return <CircleSvg radius={params.radius} showRadius={true} />;
    case 'shadow_circle_in_square':
      return <ShadowCircleSvg side={params.side} />;
    case 'sector':
      return <SectorSvg radius={params.radius} angle={params.angle} />;
    default:
      return null;
  }
}

// 容器樣式
const containerClass = "flex justify-center my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl";

// 長方形
function RectangleSvg({ length, width }: { length: number; width: number }) {
  const scale = 12;
  const w = length * scale;
  const h = width * scale;
  
  return (
    <div className={containerClass}>
      <svg width={w + 80} height={h + 60} viewBox={`0 0 ${w + 80} ${h + 60}`}>
        <rect x="40" y="20" width={w} height={h} fill="#a5b4fc" stroke="#4f46e5" strokeWidth="3"/>
        {/* 長度標示 */}
        <line x1="40" y1={h + 35} x2={40 + w} y2={h + 35} stroke="#333" strokeWidth="2"/>
        <text x={40 + w/2} y={h + 52} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{length} 公分</text>
        {/* 寬度標示 */}
        <line x1="25" y1="20" x2="25" y2={20 + h} stroke="#333" strokeWidth="2"/>
        <text x="12" y={20 + h/2 + 5} fontSize="13" fill="#333" fontWeight="bold">{width}</text>
      </svg>
    </div>
  );
}

// 正方形
function SquareSvg({ side }: { side: number }) {
  const scale = 14;
  const s = side * scale;
  
  return (
    <div className={containerClass}>
      <svg width={s + 70} height={s + 60} viewBox={`0 0 ${s + 70} ${s + 60}`}>
        <rect x="40" y="20" width={s} height={s} fill="#86efac" stroke="#16a34a" strokeWidth="3"/>
        <line x1="40" y1={s + 35} x2={40 + s} y2={s + 35} stroke="#333" strokeWidth="2"/>
        <text x={40 + s/2} y={s + 52} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{side} 公分</text>
      </svg>
    </div>
  );
}

// 三角形
function TriangleSvg({ base, height }: { base: number; height: number }) {
  const scale = 12;
  const b = base * scale;
  const h = height * scale;
  
  return (
    <div className={containerClass}>
      <svg width={b + 80} height={h + 60} viewBox={`0 0 ${b + 80} ${h + 60}`}>
        <polygon points={`40,${h + 20} ${40 + b/2},20 ${40 + b},${h + 20}`} fill="#fca5a5" stroke="#dc2626" strokeWidth="3"/>
        {/* 底 */}
        <line x1="40" y1={h + 35} x2={40 + b} y2={h + 35} stroke="#333" strokeWidth="2"/>
        <text x={40 + b/2} y={h + 52} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{base} 公分</text>
        {/* 高（虛線） */}
        <line x1={40 + b/2} y1="20" x2={40 + b/2} y2={h + 20} stroke="#333" strokeWidth="2" strokeDasharray="5,3"/>
        <text x={40 + b/2 + 15} y={h/2 + 20} fontSize="12" fill="#333">高 {height}</text>
      </svg>
    </div>
  );
}

// 平行四邊形
function ParallelogramSvg({ base, height }: { base: number; height: number }) {
  const scale = 12;
  const b = base * scale;
  const h = height * scale;
  const offset = 30;
  
  return (
    <div className={containerClass}>
      <svg width={b + offset + 80} height={h + 60} viewBox={`0 0 ${b + offset + 80} ${h + 60}`}>
        <polygon 
          points={`${40 + offset},20 ${40 + offset + b},20 ${40 + b},${h + 20} 40,${h + 20}`} 
          fill="#c4b5fd" stroke="#7c3aed" strokeWidth="3"
        />
        {/* 底 */}
        <line x1="40" y1={h + 35} x2={40 + b} y2={h + 35} stroke="#333" strokeWidth="2"/>
        <text x={40 + b/2} y={h + 52} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{base} 公分</text>
        {/* 高（虛線） */}
        <line x1={40 + offset} y1="20" x2={40 + offset} y2={h + 20} stroke="#333" strokeWidth="2" strokeDasharray="5,3"/>
        <text x={40 + offset + 12} y={h/2 + 25} fontSize="12" fill="#333">高 {height}</text>
      </svg>
    </div>
  );
}

// 梯形
function TrapezoidSvg({ top, bottom, height }: { top: number; bottom: number; height: number }) {
  const scale = 12;
  const t = top * scale;
  const b = bottom * scale;
  const h = height * scale;
  const offset = (b - t) / 2;
  
  return (
    <div className={containerClass}>
      <svg width={b + 80} height={h + 70} viewBox={`0 0 ${b + 80} ${h + 70}`}>
        <polygon 
          points={`${40 + offset},20 ${40 + offset + t},20 ${40 + b},${h + 20} 40,${h + 20}`} 
          fill="#fde047" stroke="#ca8a04" strokeWidth="3"
        />
        {/* 上底 */}
        <line x1={40 + offset} y1="12" x2={40 + offset + t} y2="12" stroke="#333" strokeWidth="2"/>
        <text x={40 + offset + t/2} y="10" textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">{top} 公分</text>
        {/* 下底 */}
        <line x1="40" y1={h + 35} x2={40 + b} y2={h + 35} stroke="#333" strokeWidth="2"/>
        <text x={40 + b/2} y={h + 52} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{bottom} 公分</text>
        {/* 高 */}
        <line x1={40 + b/2} y1="20" x2={40 + b/2} y2={h + 20} stroke="#333" strokeWidth="2" strokeDasharray="5,3"/>
        <text x={40 + b/2 + 20} y={h/2 + 25} fontSize="12" fill="#333">{height}</text>
      </svg>
    </div>
  );
}

// 圓形
function CircleSvg({ radius, showRadius }: { radius: number; showRadius?: boolean }) {
  const scale = 10;
  const r = radius * scale;
  const size = r * 2 + 60;
  
  return (
    <div className={containerClass}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="#fca5a5" stroke="#dc2626" strokeWidth="3"/>
        {showRadius && (
          <>
            <line x1={size/2} y1={size/2} x2={size/2 + r} y2={size/2} stroke="#333" strokeWidth="2" strokeDasharray="5,3"/>
            <circle cx={size/2} cy={size/2} r="4" fill="#333"/>
            <text x={size/2 + r/2} y={size/2 - 8} fontSize="13" fill="#333" fontWeight="bold">{radius} 公分</text>
          </>
        )}
      </svg>
    </div>
  );
}

// 陰影面積（正方形內切圓）
function ShadowCircleSvg({ side }: { side: number }) {
  const scale = 10;
  const s = side * scale;
  const r = s / 2;
  
  return (
    <div className={containerClass}>
      <svg width={s + 60} height={s + 70} viewBox={`0 0 ${s + 60} ${s + 70}`}>
        {/* 正方形（陰影） */}
        <rect x="30" y="20" width={s} height={s} fill="#6366f1"/>
        {/* 圓形（白色） */}
        <circle cx={30 + s/2} cy={20 + s/2} r={r} fill="white"/>
        {/* 邊框 */}
        <rect x="30" y="20" width={s} height={s} fill="none" stroke="#4f46e5" strokeWidth="3"/>
        {/* 邊長標示 */}
        <text x={30 + s/2} y={s + 45} textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{side} 公分</text>
        <text x={30 + s/2} y={s + 60} textAnchor="middle" fontSize="11" fill="#666">求紫色陰影面積</text>
      </svg>
    </div>
  );
}

// 扇形
function SectorSvg({ radius, angle }: { radius: number; angle: number }) {
  const scale = 10;
  const r = radius * scale;
  const size = r + 80;
  const cx = 50;
  const cy = size - 30;
  
  // 計算弧線終點
  const endAngle = -angle * Math.PI / 180;
  const endX = cx + r * Math.cos(endAngle);
  const endY = cy + r * Math.sin(endAngle);
  
  const largeArc = angle > 180 ? 1 : 0;
  
  // 扇形路徑
  const d = `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${endX} ${endY} Z`;
  
  return (
    <div className={containerClass}>
      <svg width={size + 40} height={size} viewBox={`0 0 ${size + 40} ${size}`}>
        <path d={d} fill="#86efac" stroke="#16a34a" strokeWidth="3"/>
        {/* 半徑標示 */}
        <text x={cx + r/2} y={cy + 18} fontSize="12" fill="#333" fontWeight="bold">{radius} 公分</text>
        {/* 角度標示 */}
        <text x={cx + 25} y={cy - 15} fontSize="11" fill="#333">{angle}°</text>
        {/* 圓心 */}
        <circle cx={cx} cy={cy} r="3" fill="#333"/>
      </svg>
    </div>
  );
}

export default GeometryImage;
