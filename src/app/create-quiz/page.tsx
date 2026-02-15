'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateQuizPage() {
  const router = useRouter();
  const [grade, setGrade] = useState<5 | 6>(5);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'' | 'easy' | 'hard'>('');
  const [quizName, setQuizName] = useState('');
  const [generated, setGenerated] = useState(false);
  const [quizLink, setQuizLink] = useState('');

  const generateQuiz = () => {
    // 產生一個唯一的測驗 ID
    const quizId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const params = new URLSearchParams({
      grade: grade.toString(),
      count: count.toString(),
      difficulty,
      quizId,
      name: quizName || `${grade}年級測驗`
    });
    
    const link = `${window.location.origin}/quiz?${params.toString()}`;
    setQuizLink(link);
    setGenerated(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(quizLink);
    alert('連結已複製！可以分享給學生了 📋');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-500 to-cyan-600 p-4">
      <div className="max-w-md mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-teal-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">📋 出卷系統</h1>
          <div className="w-20"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!generated ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">建立新測驗</h2>
              
              {/* 測驗名稱 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  測驗名稱（選填）
                </label>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  placeholder="例如：第一週練習"
                />
              </div>

              {/* 年級選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">年級</label>
                <div className="grid grid-cols-2 gap-2">
                  {([5, 6] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`py-3 rounded-lg font-medium transition ${
                        grade === g
                          ? 'bg-teal-500 text-white'
                          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                      }`}
                    >
                      {g} 年級
                    </button>
                  ))}
                </div>
              </div>

              {/* 難度選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">難度</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDifficulty('easy')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      difficulty === 'easy'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    🌱 基礎
                  </button>
                  <button
                    onClick={() => setDifficulty('')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      difficulty === ''
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    📚 綜合
                  </button>
                  <button
                    onClick={() => setDifficulty('hard')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      difficulty === 'hard'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    🔥 挑戰
                  </button>
                </div>
              </div>

              {/* 題數選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">題數</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCount(c)}
                      className={`py-2 rounded-lg font-medium transition ${
                        count === c
                          ? 'bg-teal-500 text-white'
                          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                      }`}
                    >
                      {c}題
                    </button>
                  ))}
                </div>
              </div>

              {/* 產生按鈕 */}
              <button
                onClick={generateQuiz}
                className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-lg transition"
              >
                🎯 產生測驗連結
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-gray-800">測驗已建立！</h2>
                <p className="text-gray-500 mt-2">
                  {quizName || `${grade}年級測驗`} · {count}題 · {difficulty === 'easy' ? '基礎' : difficulty === 'hard' ? '挑戰' : '綜合'}
                </p>
              </div>

              {/* 連結顯示 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">分享此連結給學生：</p>
                <p className="text-sm text-gray-800 break-all font-mono bg-white p-2 rounded border">
                  {quizLink}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={copyLink}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition"
                >
                  📋 複製連結
                </button>
                
                <button
                  onClick={() => window.open(quizLink, '_blank')}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  👁️ 預覽測驗
                </button>
                
                <button
                  onClick={() => {
                    setGenerated(false);
                    setQuizLink('');
                  }}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                >
                  🔄 建立新測驗
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
