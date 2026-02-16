'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initTheme } from '@/lib/theme';
import { applyFontSize } from '@/lib/storage';

// 題型分類
const CATEGORY_GROUPS = {
  5: [
    { key: 'fraction', label: '分數', categories: ['分數加減', '分數乘除', '分數綜合', '分數應用進階'] },
    { key: 'decimal', label: '小數', categories: ['小數運算', '小數綜合', '小數應用進階'] },
    { key: 'factor', label: '因數倍數', categories: ['因數與倍數', '倍數問題', '公倍數公因數應用', '質數與合數'] },
    { key: 'area', label: '面積體積', categories: ['面積計算', '體積計算', '面積綜合', '體積綜合'] },
    { key: 'time', label: '時間計算', categories: ['時間計算', '時間與速率強化'] },
    { key: 'application', label: '應用題', categories: ['和差問題', '植樹問題', '雞兔問題', '購物應用'] },
  ],
  6: [
    { key: 'negative', label: '正負數', categories: ['正負數運算', '正負數綜合', '正負數運算強化'] },
    { key: 'percent', label: '百分率', categories: ['百分比基礎', '百分率應用', '百分率進階', '利潤問題'] },
    { key: 'equation', label: '方程式', categories: ['一元一次方程式', '方程式應用', '方程式進階'] },
    { key: 'circle', label: '圓', categories: ['圓的周長與面積', '圓柱體積', '圓柱圓錐綜合'] },
    { key: 'ratio', label: '比與比值', categories: ['比與比值', '比與比值應用', '比例進階'] },
    { key: 'speed', label: '速率工程', categories: ['速率問題', '工作問題', '工程問題進階'] },
  ],
};

export default function CreateQuizPage() {
  const router = useRouter();
  const [grade, setGrade] = useState<5 | 6>(5);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'hard'>('mixed');
  const [quizName, setQuizName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [quizLink, setQuizLink] = useState('');

  useEffect(() => {
    initTheme();
    applyFontSize();
  }, []);

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
    
    // 如果有選擇題型，添加到參數
    if (selectedCategories.length > 0) {
      const selectedCats = selectedCategories
        .flatMap(key => CATEGORY_GROUPS[grade].find(g => g.key === key)?.categories || []);
      params.set('categories', selectedCats.join(','));
    }
    
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
                    onClick={() => setDifficulty('mixed')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      difficulty === 'mixed'
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

              {/* 題型選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  題型（可多選，不選則隨機）
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_GROUPS[grade].map((group) => (
                    <button
                      key={group.key}
                      onClick={() => {
                        if (selectedCategories.includes(group.key)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== group.key));
                        } else {
                          setSelectedCategories([...selectedCategories, group.key]);
                        }
                      }}
                      className={`py-2 px-2 rounded-lg text-sm font-medium transition ${
                        selectedCategories.includes(group.key)
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    清除選擇
                  </button>
                )}
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
                  {quizName || `${grade}年級測驗`} · {count}題 · {difficulty === 'easy' ? '基礎' : difficulty === 'hard' ? '挑戰' : difficulty === 'mixed' ? '綜合' : '綜合'}
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
