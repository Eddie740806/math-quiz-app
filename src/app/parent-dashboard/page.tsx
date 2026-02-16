'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  getChildrenForParent, 
  bindChildToParent,
  getChildProgress,
  getUserProgress,
  getUserAchievements,
  getWeakCategories,
  User,
  UserProgress,
  Achievement,
  applyFontSize
} from '@/lib/storage';
import { initTheme } from '@/lib/theme';

interface ChildData {
  user: User;
  progress: UserProgress | null;
  achievements: Achievement[];
  weakCategories: { category: string; accuracy: number; total: number }[];
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bindUsername, setBindUsername] = useState('');
  const [bindLoading, setBindLoading] = useState(false);
  const [bindMessage, setBindMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);

  useEffect(() => {
    initTheme();
    applyFontSize();
    
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'parent') {
      router.push('/');
      return;
    }
    
    setCurrentUserState(user);
    loadChildren(user.username);
  }, [router]);

  const loadChildren = async (parentUsername: string) => {
    setLoading(true);
    try {
      const childUsers = await getChildrenForParent(parentUsername);
      
      const childDataList: ChildData[] = [];
      for (const childUser of childUsers) {
        const progress = await getChildProgress(childUser.username);
        // 如果雲端沒有資料，嘗試從本地讀取
        const localProgress = progress || getUserProgress(childUser.id);
        const achievements = getUserAchievements(childUser.id);
        const weakCategories = getWeakCategories(childUser.id, 5);
        
        childDataList.push({
          user: childUser,
          progress: localProgress,
          achievements,
          weakCategories
        });
      }
      
      setChildren(childDataList);
    } catch (err) {
      console.error('Load children error:', err);
    }
    setLoading(false);
  };

  const handleBindChild = async () => {
    if (!currentUser || !bindUsername.trim()) return;
    
    setBindLoading(true);
    setBindMessage(null);
    
    const result = await bindChildToParent(currentUser.username, bindUsername.trim());
    
    if (result.success) {
      setBindMessage({ type: 'success', text: result.message });
      setBindUsername('');
      // 重新載入孩子列表
      await loadChildren(currentUser.username);
    } else {
      setBindMessage({ type: 'error', text: result.message });
    }
    
    setBindLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-indigo-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">👨‍👩‍👧 家長專區</h1>
          <div className="text-white text-sm">
            {currentUser?.username}
          </div>
        </div>

        {/* 綁定孩子 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">➕ 綁定孩子帳號</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={bindUsername}
              onChange={(e) => setBindUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBindChild()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="輸入孩子的用戶名"
            />
            <button
              onClick={handleBindChild}
              disabled={!bindUsername.trim() || bindLoading}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
            >
              {bindLoading ? '...' : '綁定'}
            </button>
          </div>
          {bindMessage && (
            <p className={`text-sm mt-2 ${bindMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {bindMessage.text}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            💡 輸入孩子註冊時使用的用戶名即可綁定，綁定後可以查看他們的學習進度。
          </p>
        </div>

        {/* 孩子列表 */}
        {children.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">還沒有綁定孩子</h2>
            <p className="text-gray-500">在上方輸入孩子的用戶名來綁定</p>
          </div>
        ) : selectedChild ? (
          /* 孩子詳情 */
          <div className="space-y-4">
            <button
              onClick={() => setSelectedChild(null)}
              className="text-white hover:text-indigo-200 transition mb-2"
            >
              ← 返回孩子列表
            </button>
            
            {/* 基本資訊 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
                  👦
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedChild.user.username}</h3>
                  <p className="text-gray-500 text-sm">
                    加入於 {new Date(selectedChild.user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedChild.progress && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-600">{selectedChild.progress.totalAnswered}</div>
                      <div className="text-sm text-gray-500">總答題數</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedChild.progress.totalAnswered > 0 
                          ? Math.round(selectedChild.progress.correctCount / selectedChild.progress.totalAnswered * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-500">正確率</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-orange-600">{selectedChild.progress.streak || 1}</div>
                      <div className="text-sm text-gray-500">連續天數</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">{selectedChild.progress.correctCount}</div>
                      <div className="text-sm text-gray-500">答對題數</div>
                    </div>
                  </div>
                  
                  {selectedChild.progress.lastActiveAt && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        📅 最近練習：{new Date(selectedChild.progress.lastActiveAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 弱點分析 */}
            {selectedChild.weakCategories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">📊 需要加強的單元</h3>
                <div className="space-y-3">
                  {selectedChild.weakCategories.map((cat, index) => (
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
              </div>
            )}

            {/* 成就 */}
            {selectedChild.achievements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">🏅 已獲得成就 ({selectedChild.achievements.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedChild.achievements.map((a) => (
                    <div key={a.id} className="bg-purple-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-xl">{a.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{a.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 錯題統計 */}
            {selectedChild.progress && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">📝 錯題本</h3>
                <p className="text-gray-600">
                  目前有 <span className="font-bold text-red-500">{selectedChild.progress.wrongRecords.length}</span> 道題目需要複習
                </p>
              </div>
            )}
          </div>
        ) : (
          /* 孩子列表 */
          <div className="grid gap-4">
            <h2 className="text-white font-bold text-lg">我的孩子 ({children.length})</h2>
            {children.map((child) => {
              const accuracy = child.progress && child.progress.totalAnswered > 0
                ? Math.round(child.progress.correctCount / child.progress.totalAnswered * 100)
                : 0;
              
              return (
                <div
                  key={child.user.id}
                  onClick={() => setSelectedChild(child)}
                  className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                      👦
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{child.user.username}</h3>
                      <p className="text-gray-500 text-sm">
                        {child.progress?.totalAnswered || 0} 題 · {accuracy}% 正確率 · 🔥 {child.progress?.streak || 1} 天
                      </p>
                    </div>
                    <div className="text-gray-400">
                      →
                    </div>
                  </div>
                  
                  {child.progress?.lastActiveAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      最近活動：{new Date(child.progress.lastActiveAt).toLocaleString('zh-TW')}
                    </p>
                  )}
                  
                  {/* 成就預覽 */}
                  {child.achievements.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {child.achievements.slice(0, 5).map((a) => (
                        <span key={a.id} title={a.name}>{a.icon}</span>
                      ))}
                      {child.achievements.length > 5 && (
                        <span className="text-gray-400 text-sm">+{child.achievements.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
