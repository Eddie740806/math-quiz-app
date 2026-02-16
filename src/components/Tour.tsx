'use client';

import { useState, useEffect } from 'react';
import { hasCompletedTour, setTourCompleted } from '@/lib/storage';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="quick-start"]',
    title: '⚡ 快速開始',
    content: '點這裡可以立即開始 10 題練習，不需要任何設定！',
    position: 'bottom'
  },
  {
    target: '[data-tour="create-quiz"]',
    title: '📝 自訂出卷',
    content: '想要更多題目或選擇特定題型？點這裡自己出卷！',
    position: 'bottom'
  },
  {
    target: '[data-tour="weak-practice"]',
    title: '🎯 弱點練習',
    content: '系統會分析你的弱點，針對常錯的題型加強練習。',
    position: 'bottom'
  },
  {
    target: '[data-tour="wrong-book"]',
    title: '📖 錯題本',
    content: '所有答錯的題目都會收集在這裡，方便複習。',
    position: 'bottom'
  },
  {
    target: '[data-tour="leaderboard"]',
    title: '🏆 排行榜',
    content: '和其他同學比賽誰的分數最高！',
    position: 'bottom'
  },
  {
    target: '[data-tour="achievements"]',
    title: '🏅 成就徽章',
    content: '完成各種挑戰可以獲得成就徽章，來收集它們吧！',
    position: 'bottom'
  }
];

export default function Tour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // 檢查是否需要顯示 tour
    if (!hasCompletedTour()) {
      // 延遲一下再顯示，讓頁面先渲染完成
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (!element) {
      // 找不到元素，跳到下一步
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    // 計算 tooltip 位置
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10001
    };

    const tooltipWidth = 300;
    const tooltipHeight = 150;
    const gap = 12;

    switch (step.position) {
      case 'top':
        style.left = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
        style.top = rect.top + scrollY - tooltipHeight - gap;
        break;
      case 'bottom':
        style.left = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
        style.top = rect.bottom + scrollY + gap;
        break;
      case 'left':
        style.left = rect.left + scrollX - tooltipWidth - gap;
        style.top = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        style.left = rect.right + scrollX + gap;
        style.top = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
        break;
    }

    // 確保不超出螢幕
    if ((style.left as number) < 10) style.left = 10;
    if ((style.left as number) + tooltipWidth > window.innerWidth - 10) {
      style.left = window.innerWidth - tooltipWidth - 10;
    }

    setTooltipStyle(style);

    // 高亮目標元素
    element.classList.add('tour-highlight');

    // 滾動到元素位置
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return () => {
      element.classList.remove('tour-highlight');
    };
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setTourCompleted(true);
    setIsOpen(false);
  };

  const handleFinish = () => {
    setTourCompleted(true);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* 遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 z-[10000]"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <div
        style={{
          ...tooltipStyle,
          width: 300
        }}
        className="bg-white rounded-xl shadow-2xl p-4 animate-fadeIn"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800">{step?.title}</h3>
          <span className="text-xs text-gray-400">
            {currentStep + 1} / {tourSteps.length}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{step?.content}</p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            跳過
          </button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
            >
              {currentStep < tourSteps.length - 1 ? '下一步' : '完成'}
            </button>
          </div>
        </div>

        {/* 進度點 */}
        <div className="flex justify-center gap-1 mt-3">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition ${
                index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 10001 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 12px;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
