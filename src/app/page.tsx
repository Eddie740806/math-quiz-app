'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, getUserProgress, getWeakCategories, getUserAchievements, getTodayAnsweredCount, getBookmarks, getDisplayedBadgesWithNames, User, UserProgress, applyFontSize } from '@/lib/storage';
import { initTheme, toggleTheme, getTheme } from '@/lib/theme';
import Tour from '@/components/Tour';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [weakCategories, setWeakCategories] = useState<{ category: string; accuracy: number; total: number }[]>([]);
  const [achievementCount, setAchievementCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [displayedBadges, setDisplayedBadges] = useState<{ icon: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    initTheme();
    applyFontSize();
    setIsDark(getTheme() === 'dark');
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.role === 'student') {
        setProgress(getUserProgress(currentUser.id));
        setWeakCategories(getWeakCategories(currentUser.id, 3));
        setAchievementCount(getUserAchievements(currentUser.id).length);
        setTodayCount(getTodayAnsweredCount(currentUser.id));
        setBookmarkCount(getBookmarks(currentUser.id).length);
        setDisplayedBadges(getDisplayedBadgesWithNames(currentUser.id));
      }
    }
    setLoading(false);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setIsDark(newTheme === 'dark');
  };

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

  // 根據角色導向不同頁面
  const navigateByRole = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'parent') {
      router.push('/parent-dashboard');
    } else if (user.role === 'teacher') {
      router.push('/class-management');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  // 非學生用戶顯示簡化介面
  if (user && user.role !== 'student') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 relative">
            <button
              onClick={handleToggleTheme}
              className="absolute right-0 top-8 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">📐 國小數學題庫</h1>
            <p className="text-blue-100">五、六年級數學練習平台</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">歡迎回來！</p>
                <p className="text-2xl font-bold text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500">
                  {user.role === 'parent' ? '👨‍👩‍👧 家長帳號' : '👨‍🏫 教師帳號'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/settings')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm transition"
                >
                  ⚙️ 設定
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-sm transition"
                >
                  登出
                </button>
              </div>
            </div>
          </div>

          {/* 角色專屬功能 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            {user.role === 'parent' ? (
              <button
                onClick={() => router.push('/parent-dashboard')}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition text-lg"
              >
                👨‍👩‍👧 進入家長專區
              </button>
            ) : (
              <button
                onClick={() => router.push('/class-management')}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition text-lg"
              >
                👨‍🏫 進入班級管理
              </button>
            )}
          </div>

          {/* 其他功能 */}
          <div className="flex flex-wrap justify-center gap-3">
            <div
              onClick={() => router.push('/leaderboard')}
              className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20"
            >
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-bold text-gray-800 text-xs">排行榜</div>
            </div>
            <div
              onClick={() => router.push('/parent-view')}
              className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20"
            >
              <div className="text-2xl mb-1">🔍</div>
              <div className="font-bold text-gray-800 text-xs">查詢學生</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {/* 新手引導 */}
      {user && <Tour />}
      
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center py-8 relative">
          {/* 設定按鈕 */}
          <button
            onClick={() => router.push('/settings')}
            className="absolute left-0 top-8 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            title="設定"
          >
            ⚙️
          </button>
          
          {/* 深色模式切換 */}
          <button
            onClick={handleToggleTheme}
            className="absolute right-0 top-8 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            title={isDark ? '切換淺色模式' : '切換深色模式'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-2">📐 國小數學題庫</h1>
          <p className="text-blue-100">五、六年級數學練習平台</p>
        </div>

        {/* 用戶狀態 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">歡迎回來！</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold text-gray-800">{user.username}</p>
                  {displayedBadges.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {displayedBadges.map((badge, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full font-medium">
                          {badge.icon}{badge.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleLogout();
                    router.push('/login');
                  }}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 text-sm transition"
                >
                  切換帳號
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-sm transition"
                >
                  登出
                </button>
              </div>
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

        {/* 一鍵開始 - 今日 10 題（遊客也能看到） */}
        <div className="grid md:grid-cols-2 gap-4 mb-6" data-tour="quick-start">
          <button
            onClick={() => user ? router.push('/quiz?grade=5&count=10') : router.push('/login')}
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
            onClick={() => user ? router.push('/quiz?grade=6&count=10') : router.push('/login')}
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

        {/* 今日目標 + 統計 */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
            {/* 今日目標進度條 */}
            <div className="mb-4 pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">🎯 今日目標：10 題</span>
                <span className="text-sm text-blue-500 font-bold">{Math.min(todayCount, 10)}/10</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((todayCount / 10) * 100, 100)}%` }}
                />
              </div>
              {todayCount >= 10 && (
                <div className="text-center text-green-500 text-sm mt-2 font-medium">✅ 已完成今日目標！繼續加油 💪</div>
              )}
            </div>
            
            {/* 統計數據 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📈</div>
                <div>
                  <div className="text-sm text-gray-500">累計練習</div>
                  <div className="text-xl font-bold text-gray-800">{progress?.totalAnswered || 0} 題</div>
                </div>
              </div>
              
              {/* 連續天數 */}
              <div className="text-center px-4">
                <div className="text-2xl">🔥</div>
                <div className="text-lg font-bold text-orange-500">{progress?.streak || 1}</div>
                <div className="text-xs text-gray-500">連續天數</div>
              </div>
              
              {/* 成就 */}
              <div className="text-center px-4">
                <div className="text-2xl">🏅</div>
                <div className="text-lg font-bold text-purple-500">{achievementCount}/14</div>
                <div className="text-xs text-gray-500">成就</div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">正確率</div>
                <div className="text-xl font-bold text-green-500">
                  {progress && progress.totalAnswered > 0 
                    ? Math.round(progress.correctCount / progress.totalAnswered * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 弱點分析 Top3 */}
        {user && weakCategories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6" data-tour="weak-practice">
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
            <button
              onClick={() => router.push('/quiz?count=10&focus=weak')}
              className="w-full mt-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition"
            >
              🎯 針對弱點練習
            </button>
          </div>
        )}

        {/* 年級選擇 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6" data-tour="create-quiz">
          <div
            onClick={() => startQuiz(5)}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-105 transition transform"
          >
            <div className="text-5xl mb-3">5️⃣</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">五年級數學</h2>
            <div className="flex flex-wrap gap-1 mb-2">
              {['分數', '小數', '面積', '因數倍數', '體積'].map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{tag}</span>
              ))}
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">+18 種題型</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">📚 含 1,100+ 道精選題目</div>
            <div className="text-blue-500 font-medium text-sm">選擇難度和題數 →</div>
          </div>

          <div
            onClick={() => startQuiz(6)}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-105 transition transform"
          >
            <div className="text-5xl mb-3">6️⃣</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">六年級數學</h2>
            <div className="flex flex-wrap gap-1 mb-2">
              {['正負數', '代數', '圓', '體積', '百分率'].map(tag => (
                <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">{tag}</span>
              ))}
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">+18 種題型</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">📚 含 1,100+ 道精選題目</div>
            <div className="text-purple-500 font-medium text-sm">選擇難度和題數 →</div>
          </div>
        </div>

        {/* 功能區塊 */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {/* 排行榜 */}
          <div
            onClick={() => router.push('/leaderboard')}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20"
            data-tour="leaderboard"
          >
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-bold text-gray-800 text-xs">排行榜</div>
          </div>

          {/* 成就 */}
          <div
            onClick={() => router.push('/achievements')}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20 relative"
            data-tour="achievements"
          >
            <div className="text-2xl mb-1">🏅</div>
            <div className="font-bold text-gray-800 text-xs">成就</div>
            {achievementCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {achievementCount}
              </span>
            )}
          </div>

          {/* 錯題本 */}
          <div
            onClick={() => user ? router.push('/wrong-answers') : router.push('/login')}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20 relative"
            data-tour="wrong-book"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="font-bold text-gray-800 text-xs">錯題本</div>
            {progress && progress.wrongRecords.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {progress.wrongRecords.length}
              </span>
            )}
          </div>

          {/* 出卷 */}
          <div
            onClick={() => router.push('/create-quiz')}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20"
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="font-bold text-gray-800 text-xs">出卷</div>
          </div>

          {/* 收藏 */}
          <div
            onClick={() => user ? router.push('/bookmarks') : router.push('/login')}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20 relative"
          >
            <div className="text-2xl mb-1">⭐</div>
            <div className="font-bold text-gray-800 text-xs">收藏</div>
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </div>

          {/* 家長查看 */}
          <div
            onClick={() => router.push('/parent-view')}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:scale-105 transition text-center w-20"
          >
            <div className="text-2xl mb-1">👨‍👩‍👧</div>
            <div className="font-bold text-gray-800 text-xs">家長</div>
          </div>
        </div>

        {/* 新用戶提示 */}
        {!user && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 text-white text-center">
            <div className="text-2xl mb-2">👋 第一次來嗎？</div>
            <p className="text-blue-100 mb-4">註冊免費帳號，記錄你的學習進度！</p>
            <ul className="text-left text-sm text-blue-100 space-y-1 max-w-xs mx-auto">
              <li>✅ 2000+ 道精選題目</li>
              <li>✅ 錯題本自動收集</li>
              <li>✅ 弱點分析報告</li>
              <li>✅ 連擊系統超好玩</li>
            </ul>
          </div>
        )}

        {/* 頁尾 */}
        <div className="text-center py-8 text-blue-100 text-sm">
          <p>國小數學練習平台 ｜ 張可享 林弘恩 湯千儀 楊凱麟 聯合製作</p>
        </div>
      </div>
    </main>
  );
}
