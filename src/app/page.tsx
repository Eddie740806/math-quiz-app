'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, getUserProgress, User, UserProgress } from '@/lib/storage';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProgress(getUserProgress(currentUser.id));
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
