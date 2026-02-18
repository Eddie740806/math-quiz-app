'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserAchievements, ACHIEVEMENTS, Achievement, User, applyFontSize, getDisplayedBadges, toggleDisplayedBadge } from '@/lib/storage';
import { initTheme } from '@/lib/theme';

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [displayedBadges, setDisplayedBadges] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

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
      showToast('尚未解鎖此成就');
      return;
    }
    
    const result = toggleDisplayedBadge(user.id, achievementId);
    if (result.success) {
      setDisplayedBadges(getDisplayedBadges(user.id));
      showToast(result.isDisplayed ? '已裝備徽章！' : '已卸除徽章');
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50 animate-fade-in">
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
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
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
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700">🎖️ 展示中的徽章</h2>
            <span className="text-sm text-gray-500">{displayedBadges.length}/3</span>
          </div>
          <div className="flex gap-3 justify-center min-h-[60px] items-center">
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
                    className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 cursor-pointer hover:scale-110 transition text-center"
                    title={`${achievement.name} - 點擊卸除`}
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="text-xs text-purple-600 font-medium mt-1">{achievement.name}</div>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">展示的徽章會顯示在你的名字旁邊</p>
        </div>

        {/* 成就列表 */}
        <div className="grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const displayed = isDisplayed(achievement.id);
            const unlockedDate = getUnlockedDate(achievement.id);
            
            return (
              <div
                key={achievement.id}
                onClick={() => handleToggleBadge(achievement.id)}
                className={`bg-white rounded-xl shadow p-4 text-center transition cursor-pointer ${
                  unlocked 
                    ? displayed 
                      ? 'ring-2 ring-purple-500 ring-offset-2' 
                      : 'hover:scale-105 hover:shadow-lg'
                    : 'opacity-50 grayscale cursor-not-allowed'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-bold text-gray-800 text-sm">{achievement.name}</div>
                <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
                {unlocked && unlockedDate && (
                  <div className="text-xs text-purple-500 mt-2">
                    {displayed ? '✨ 展示中' : `✓ ${unlockedDate}`}
                  </div>
                )}
                {!unlocked && (
                  <div className="text-xs text-gray-400 mt-2">🔒 未解鎖</div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 說明 */}
        <div className="mt-6 p-4 bg-white/20 rounded-xl text-white text-sm">
          <p className="font-medium mb-1">💡 小提示</p>
          <p className="text-white/80">點擊已解鎖的徽章可以裝備展示（最多 3 個），展示的徽章會顯示在你的名字旁邊！</p>
        </div>
      </div>
    </main>
  );
}
