'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserAchievements, ACHIEVEMENTS, Achievement, User, applyFontSize, getDisplayedBadges, toggleDisplayedBadge } from '@/lib/storage';
import { initTheme } from '@/lib/theme';

// 成就分類
const CATEGORIES = [
  { id: 'beginner', name: '🌱 入門', ids: ['first_quiz', 'first_correct', 'first_10', 'both_grades', 'night_owl'] },
  { id: 'practice', name: '📚 練習量', ids: ['practice_50', 'practice_100', 'practice_200', 'practice_500', 'practice_1000', 'practice_2000', 'daily_30_questions', 'daily_50_questions'] },
  { id: 'combo', name: '🔥 連擊', ids: ['streak_3', 'streak_5', 'streak_10', 'streak_20', 'streak_30', 'streak_50', 'streak_100'] },
  { id: 'accuracy', name: '🎯 正確率', ids: ['accuracy_70', 'accuracy_80', 'accuracy_90', 'accuracy_95', 'accuracy_99', 'perfect_10'] },
  { id: 'daily', name: '📅 連續天數', ids: ['daily_3', 'daily_7', 'daily_14', 'daily_30', 'daily_60', 'daily_100', 'daily_365'] },
  { id: 'speed', name: '⚡ 速度', ids: ['speed_15', 'speed_10', 'speed_5', 'speed_3', 'instant_correct'] },
  { id: 'special', name: '💫 特殊挑戰', ids: ['comeback', 'perfectionist', 'marathon', 'iron_will', 'early_bird', 'weekend_warrior'] },
  { id: 'festival', name: '🎉 節慶限定', ids: ['new_year', 'lunar_new_year', 'valentines', 'childrens_day', 'teacher_day', 'christmas'] },
];

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [displayedBadges, setDisplayedBadges] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    initTheme();
    applyFontSize();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setUserAchievements(getUserAchievements(currentUser.id));
    setDisplayedBadges(getDisplayedBadges(currentUser.id));
  }, [router]);

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(a => a.id === achievementId);
  };

  const isDisplayed = (achievementId: string) => {
    return displayedBadges.includes(achievementId);
  };

  const getUnlockedDate = (achievementId: string) => {
    const achievement = userAchievements.find(a => a.id === achievementId);
    if (achievement?.unlockedAt) {
      return new Date(achievement.unlockedAt).toLocaleDateString();
    }
    return null;
  };

  const handleToggleBadge = (achievementId: string) => {
    if (!user) return;
    
    const unlocked = isUnlocked(achievementId);
    if (!unlocked) {
      showToast('🔒 尚未解鎖此成就');
      return;
    }
    
    const result = toggleDisplayedBadge(user.id, achievementId);
    if (result.success) {
      setDisplayedBadges(getDisplayedBadges(user.id));
      showToast(result.isDisplayed ? '✨ 已裝備徽章！' : '已卸除徽章');
    } else {
      showToast(result.message || '操作失敗');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const unlockedCount = userAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  // 根據分類篩選成就
  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return ACHIEVEMENTS;
    }
    const category = CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => category.ids.includes(a.id));
  };

  const filteredAchievements = getFilteredAchievements();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50 animate-pulse">
          {toast}
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-purple-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">🏅 成就徽章</h1>
          <div className="w-20"></div>
        </div>

        {/* 進度總覽 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-gray-800">{unlockedCount} / {totalCount}</div>
            <div className="text-gray-500">已解鎖成就</div>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">{progress}% 完成</div>
        </div>

        {/* 已裝備徽章區 */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700">🎖️ 展示中的徽章</h2>
            <span className="text-sm text-gray-500">{displayedBadges.length}/3</span>
          </div>
          <div className="flex gap-2 justify-center min-h-[50px] items-center flex-wrap">
            {displayedBadges.length === 0 ? (
              <p className="text-gray-400 text-sm">點擊下方已解鎖的徽章來裝備展示</p>
            ) : (
              displayedBadges.map(badgeId => {
                const achievement = ACHIEVEMENTS.find(a => a.id === badgeId);
                if (!achievement) return null;
                return (
                  <div
                    key={badgeId}
                    onClick={() => handleToggleBadge(badgeId)}
                    className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl px-3 py-2 cursor-pointer hover:scale-105 transition flex items-center gap-1"
                    title={`${achievement.name} - 點擊卸除`}
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <span className="text-sm text-purple-700 font-medium">{achievement.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 分類標籤 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            全部 ({totalCount})
          </button>
          {CATEGORIES.map(cat => {
            const catUnlocked = cat.ids.filter(id => isUnlocked(id)).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat.name} ({catUnlocked}/{cat.ids.length})
              </button>
            );
          })}
        </div>

        {/* 成就列表 */}
        <div className="grid grid-cols-2 gap-3">
          {filteredAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const displayed = isDisplayed(achievement.id);
            const unlockedDate = getUnlockedDate(achievement.id);
            
            return (
              <div
                key={achievement.id}
                onClick={() => handleToggleBadge(achievement.id)}
                className={`bg-white rounded-xl shadow p-3 text-center transition cursor-pointer ${
                  unlocked 
                    ? displayed 
                      ? 'ring-2 ring-purple-500 ring-offset-2' 
                      : 'hover:scale-105 hover:shadow-lg'
                    : 'opacity-50 grayscale cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mb-1">{achievement.icon}</div>
                <div className="font-bold text-gray-800 text-sm">{achievement.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{achievement.description}</div>
                {unlocked && unlockedDate && (
                  <div className="text-xs text-purple-500 mt-1">
                    {displayed ? '✨ 展示中' : `✓ ${unlockedDate}`}
                  </div>
                )}
                {!unlocked && (
                  <div className="text-xs text-gray-400 mt-1">🔒 未解鎖</div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 說明 */}
        <div className="mt-6 p-4 bg-white/20 rounded-xl text-white text-sm">
          <p className="font-medium mb-2">💡 小提示</p>
          <ul className="text-white/80 space-y-1 text-xs">
            <li>• 點擊已解鎖的徽章可以裝備展示（最多 3 個）</li>
            <li>• 展示的徽章會顯示在你的名字旁邊</li>
            <li>• 🎉 節慶限定成就只有在特定日期練習才能獲得！</li>
          </ul>
        </div>
        
        {/* 底部間距 */}
        <div className="h-8"></div>
      </div>
    </main>
  );
}
