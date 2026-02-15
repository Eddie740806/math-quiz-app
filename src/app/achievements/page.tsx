'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserAchievements, ACHIEVEMENTS, Achievement, User } from '@/lib/storage';
import { initTheme } from '@/lib/theme';

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    initTheme();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setUserAchievements(getUserAchievements(currentUser.id));
  }, [router]);

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(a => a.id === achievementId);
  };

  const getUnlockedDate = (achievementId: string) => {
    const achievement = userAchievements.find(a => a.id === achievementId);
    if (achievement?.unlockedAt) {
      return new Date(achievement.unlockedAt).toLocaleDateString();
    }
    return null;
  };

  const unlockedCount = userAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
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

        {/* 成就列表 */}
        <div className="grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const unlockedDate = getUnlockedDate(achievement.id);
            
            return (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl shadow p-4 text-center transition ${
                  unlocked ? '' : 'opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-bold text-gray-800 text-sm">{achievement.name}</div>
                <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
                {unlocked && unlockedDate && (
                  <div className="text-xs text-purple-500 mt-2">✓ {unlockedDate}</div>
                )}
                {!unlocked && (
                  <div className="text-xs text-gray-400 mt-2">🔒 未解鎖</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
