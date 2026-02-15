'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, getUserProgress, getUserAchievements, getWeakCategories, User, UserProgress, Achievement } from '@/lib/storage';
import { initTheme } from '@/lib/theme';

export default function ParentViewPage() {
  const router = useRouter();
  const [searchName, setSearchName] = useState('');
  const [childUser, setChildUser] = useState<User | null>(null);
  const [childProgress, setChildProgress] = useState<UserProgress | null>(null);
  const [childAchievements, setChildAchievements] = useState<Achievement[]>([]);
  const [childWeakCategories, setChildWeakCategories] = useState<{ category: string; accuracy: number; total: number }[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  const searchChild = () => {
    setError('');
    const users = getUsers();
    const found = users.find(u => u.username.toLowerCase() === searchName.toLowerCase());
    
    if (found) {
      setChildUser(found);
      setChildProgress(getUserProgress(found.id));
      setChildAchievements(getUserAchievements(found.id));
      setChildWeakCategories(getWeakCategories(found.id, 5));
      setSearched(true);
    } else {
      setError('找不到此用戶名，請確認是否輸入正確');
      setChildUser(null);
      setSearched(true);
    }
  };

  const accuracy = childProgress && childProgress.totalAnswered > 0
    ? Math.round(childProgress.correctCount / childProgress.totalAnswered * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-indigo-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">👨‍👩‍👧 家長查看</h1>
          <div className="w-20"></div>
        </div>

        {/* 搜尋區 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">查看孩子的學習進度</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchChild()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="輸入孩子的用戶名"
            />
            <button
              onClick={searchChild}
              disabled={!searchName.trim()}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
            >
              查詢
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* 結果區 */}
        {searched && childUser && childProgress && (
          <div className="space-y-4">
            {/* 基本資訊 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
                  👦
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{childUser.username}</h3>
                  <p className="text-gray-500 text-sm">
                    加入於 {new Date(childUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* 統計數據 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">{childProgress.totalAnswered}</div>
                  <div className="text-sm text-gray-500">總答題數</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                  <div className="text-sm text-gray-500">正確率</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-orange-600">{childProgress.streak || 0}</div>
                  <div className="text-sm text-gray-500">連續天數</div>
                </div>
              </div>
            </div>

            {/* 弱點分析 */}
            {childWeakCategories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">📊 需要加強的單元</h3>
                <div className="space-y-3">
                  {childWeakCategories.map((cat, index) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        cat.accuracy < 50 ? 'bg-red-500' : cat.accuracy < 70 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">{cat.category}</span>
                          <span className={`font-bold ${
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
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  💡 建議多練習正確率較低的單元
                </p>
              </div>
            )}

            {/* 成就 */}
            {childAchievements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">🏅 已獲得成就 ({childAchievements.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {childAchievements.map((a) => (
                    <div key={a.id} className="bg-purple-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-xl">{a.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{a.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 錯題統計 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-gray-800 mb-2">📝 錯題本</h3>
              <p className="text-gray-600">
                目前有 <span className="font-bold text-red-500">{childProgress.wrongRecords.length}</span> 道題目需要複習
              </p>
            </div>
          </div>
        )}

        {searched && !childUser && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">找不到此用戶，請確認用戶名是否正確</p>
          </div>
        )}

        {/* 說明 */}
        {!searched && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white text-center">
            <div className="text-2xl mb-2">👨‍👩‍👧</div>
            <p className="text-blue-100">
              輸入孩子註冊時使用的用戶名，即可查看學習進度、弱點分析和成就徽章。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
