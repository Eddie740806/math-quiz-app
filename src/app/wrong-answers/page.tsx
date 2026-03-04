'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getWrongRecords, removeFromWrongRecords, recordAnswer, User, WrongRecord, applyFontSize } from '@/lib/storage';
import { initTheme } from '@/lib/theme';
import questionsData from '@/data/questions.json';

interface Question {
  id: string;
  grade: number;
  content: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: string;
  source: string;
  explanation?: string;
}

export default function WrongAnswersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wrongRecords, setWrongRecords] = useState<WrongRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [reviewMode, setReviewMode] = useState<'list' | 'practice'>('list');
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);

  useEffect(() => {
    initTheme();
    applyFontSize();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadWrongRecords(currentUser.id);
  }, [router]);

  const loadWrongRecords = (odiserId: string) => {
    const records = getWrongRecords(odiserId);
    setWrongRecords(records);
  };

  const getQuestionById = (id: string): Question | undefined => {
    return questionsData.questions.find((q: Question) => q.id === id);
  };

  const startPractice = () => {
    const questions = wrongRecords
      .map(r => getQuestionById(r.questionId))
      .filter((q): q is Question => q !== undefined);
    
    setPracticeQuestions(questions);
    setReviewMode('practice');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !user) return;
    
    const currentQuestion = practiceQuestions[currentIndex];
    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // 記錄答案（含分類）
    recordAnswer(user.id, currentQuestion.id, selectedAnswer, currentQuestion.answer, currentQuestion.category);
    
    // 如果答對了，從錯題本移除
    if (correct) {
      removeFromWrongRecords(user.id, currentQuestion.id);
    }
  };

  const handleNext = () => {
    if (currentIndex >= practiceQuestions.length - 1) {
      // 重新載入錯題記錄
      if (user) {
        loadWrongRecords(user.id);
      }
      setReviewMode('list');
      return;
    }
    
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleRemoveFromWrongList = (questionId: string) => {
    if (!user) return;
    removeFromWrongRecords(user.id, questionId);
    loadWrongRecords(user.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="text-blue-600 text-xl">載入中...</div>
      </div>
    );
  }

  // 錯題練習模式
  if (reviewMode === 'practice' && practiceQuestions.length > 0) {
    const currentQuestion = practiceQuestions[currentIndex];
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-4">
        <div className="max-w-2xl mx-auto">
          {/* 頂部狀態 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setReviewMode('list')}
              className="text-blue-700 hover:text-blue-500 transition"
            >
              ← 返回
            </button>
            <div className="text-blue-800 font-bold">
              錯題複習
            </div>
            <div className="text-blue-700">
              {currentIndex + 1} / {practiceQuestions.length}
            </div>
          </div>

          {/* 進度條 */}
          <div className="bg-blue-300/50 rounded-full h-2 mb-6">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%` }}
            />
          </div>

          {/* 題目卡片 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                {currentQuestion.category}
              </span>
              <span className="text-gray-400 text-sm">
                {currentQuestion.grade}年級
              </span>
            </div>

            <h2 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed">
              {currentQuestion.content}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition ";
                
                if (showResult) {
                  if (index === currentQuestion.answer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (index === selectedAnswer && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-50 text-red-700";
                  } else {
                    buttonClass += "border-gray-200 text-gray-400";
                  }
                } else {
                  if (index === selectedAnswer) {
                    buttonClass += "border-orange-500 bg-orange-50 text-orange-700";
                  } else {
                    buttonClass += "border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 提交/下一題按鈕 */}
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-lg transition"
            >
              確認答案
            </button>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl text-center ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isCorrect ? '🎉 這次答對了！已從錯題本移除' : `😅 還是錯了，正確答案是 ${String.fromCharCode(65 + currentQuestion.answer)}`}
              </div>
              
              {/* 詳解區塊 */}
              {currentQuestion.explanation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600">💡</span>
                    <span className="font-medium text-yellow-800">解題思路</span>
                  </div>
                  <p className="text-yellow-900 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}
              
              <button
                onClick={handleNext}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-lg transition"
              >
                {currentIndex >= practiceQuestions.length - 1 ? '完成複習' : '下一題'}
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 錯題列表模式
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-700 hover:text-blue-500 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-blue-800 font-bold text-xl">📝 錯題本</h1>
          <div className="w-20"></div>
        </div>

        {wrongRecords.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">太棒了！</h2>
            <p className="text-gray-500 mb-6">目前沒有錯題，繼續保持！</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
            >
              繼續練習
            </button>
          </div>
        ) : (
          <>
            {/* 開始複習按鈕 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    你有 {wrongRecords.length} 道錯題
                  </h2>
                  <p className="text-gray-500 text-sm">複習一下，加深印象！</p>
                </div>
                <button
                  onClick={startPractice}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  開始複習
                </button>
              </div>
              <button
                onClick={() => {
                  if (confirm('確定要清空所有錯題嗎？此操作無法復原。')) {
                    wrongRecords.forEach(r => handleRemoveFromWrongList(r.questionId));
                  }
                }}
                className="w-full py-2 text-sm text-gray-400 hover:text-red-500 transition"
              >
                🗑️ 清空錯題本
              </button>
            </div>

            {/* 錯題列表 */}
            <div className="space-y-4">
              {wrongRecords.map((record) => {
                const question = getQuestionById(record.questionId);
                if (!question) return null;
                
                return (
                  <div key={record.questionId} className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">
                        {question.grade}年級 · {question.category}
                      </span>
                      <span className="text-red-500 text-xs">
                        錯了 {record.wrongCount} 次
                      </span>
                    </div>
                    <p className="text-gray-800 mb-3">{question.content}</p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">
                        正確答案: {String.fromCharCode(65 + question.answer)}. {question.options[question.answer]}
                      </span>
                      <button
                        onClick={() => handleRemoveFromWrongList(record.questionId)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        移除
                      </button>
                    </div>
                    {question.explanation && (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-sm">
                        <span className="text-yellow-600">💡</span>
                        <span className="text-yellow-800 ml-1">{question.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
