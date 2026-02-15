'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, getUserProgress, getWeakCategories, User, UserProgress } from '@/lib/storage';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [weakCategories, setWeakCategories] = useState<{ category: string; accuracy: number; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProgress(getUserProgress(currentUser.id));
      setWeakCategories(getWeakCategories(currentUser.id, 3));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setProgress(null);
  };

  const startQuiz = (grade: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/quiz?grade=${grade}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">📐 國小數學題庫</h1>
          <p className="text-blue-100">五、六年級數學練習平台</p>
        </div>

        {/* 用戶狀態 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">歡迎回來！</p>
                <p className="text-2xl font-bold text-gray-800">{user.username}</p>
                {progress && (
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>已答題：{progress.totalAnswered}</span>
                    <span>正確：{progress.correctCount}</span>
                    <span>
                      正確率：{progress.totalAnswered > 0 
                        ? Math.round(progress.correctCount / progress.totalAnswered * 100) 
                        : 0}%
                    </span>
                    {progress.streak && progress.streak > 1 && (
                      <span className="text-orange-500 font-medium">🔥 連續 {progress.streak} 天</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition"
              >
                登出
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">登入後開始練習，記錄你的學習進度！</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  登入
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                >
                  註冊
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 一鍵開始 - 今日 10 題 */}
        {user && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => router.push('/quiz?grade=5&count=10')}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-2xl shadow-xl p-6 text-white text-left transition transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-80">⚡ 快速開始</div>
                  <div className="text-xl font-bold">今日 10 題（五年級）</div>
                </div>
                <div className="text-4xl">5️⃣</div>
              </div>
            </button>
            <button
              onClick={() => router.push('/quiz?grade=6&count=10')}
              className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-2xl shadow-xl p-6 text-white text-left transition transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-80">⚡ 快速開始</div>
                  <div className="text-xl font-bold">今日 10 題（六年級）</div>
                </div>
                <div className="text-4xl">6️⃣</div>
              </div>
            </button>
          </div>
        )}

        {/* 弱點分析 Top3 */}
        {user && weakCategories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span> 弱點分析
            </h3>
            <div className="space-y-3">
              {weakCategories.map((cat, index) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className={`text-sm font-bold ${
                        cat.accuracy < 50 ? 'text-red-500' : cat.accuracy < 70 ? 'text-orange-500' : 'text-yellow-600'
                      }`}>
                        {cat.accuracy}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cat.accuracy < 50 ? 'bg-red-500' : cat.accuracy < 70 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${cat.accuracy}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">已練習 {cat.total} 題</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">💡 建議多練習正確率較低的單元</p>
          </div>
        )}

        {/* 年級選擇 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div
            onClick={() => startQuiz(5)}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:scale-105 transition transform"
          >
            <div className="text-6xl mb-4">5️⃣</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">五年級數學</h2>
            <p className="text-gray-500">分數、小數、面積、因數倍數...</p>
            <div className="mt-4 text-blue-500 font-medium">開始練習 →</div>
          </div>

          <div
            onClick={() => startQuiz(6)}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:scale-105 transition transform"
          >
            <div className="text-6xl mb-4">6️⃣</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">六年級數學</h2>
            <p className="text-gray-500">正負數、代數、圓、體積、百分率...</p>
            <div className="mt-4 text-blue-500 font-medium">開始練習 →</div>
          </div>
        </div>

        {/* 錯題本入口 */}
        {user && progress && progress.wrongRecords.length > 0 && (
          <div
            onClick={() => router.push('/wrong-answers')}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-102 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📝</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">錯題本</h3>
                  <p className="text-gray-500">你有 {progress.wrongRecords.length} 道題目需要複習</p>
                </div>
              </div>
              <div className="text-blue-500 font-medium">去複習 →</div>
            </div>
          </div>
        )}

        {/* 頁尾 */}
        <div className="text-center py-8 text-blue-100 text-sm">
          <p>支點教育 K12 團隊專屬練習平台</p>
        </div>
      </div>
    </main>
  );
}
