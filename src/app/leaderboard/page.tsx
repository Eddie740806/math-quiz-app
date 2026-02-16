'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCloudLeaderboard, getLeaderboard, LeaderboardEntry, applyFontSize } from '@/lib/storage';
import { initTheme } from '@/lib/theme';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 5 | 6>('all');
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);

  useEffect(() => {
    initTheme();
    applyFontSize();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // 嘗試從雲端獲取
      const gradeFilter = filter === 'all' ? undefined : filter;
      const cloudData = await getCloudLeaderboard(gradeFilter);
      
      if (cloudData.length > 0) {
        setLeaderboard(cloudData);
        setIsCloud(true);
      } else {
        // 回退到本地數據
        const localData = getLeaderboard();
        const filtered = filter === 'all' 
          ? localData 
          : localData.filter(e => e.grade === filter);
        setLeaderboard(filtered);
        setIsCloud(false);
      }
    } catch (err) {
      console.error('Load leaderboard error:', err);
      // 回退到本地數據
      const localData = getLeaderboard();
      const filtered = filter === 'all' 
        ? localData 
        : localData.filter(e => e.grade === filter);
      setLeaderboard(filtered);
      setIsCloud(false);
    }
    setLoading(false);
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-yellow-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">🏆 排行榜</h1>
          <div className="w-20"></div>
        </div>

        {/* 雲端/本地標記 */}
        <div className="flex justify-center mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isCloud ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-200'
          }`}>
            {isCloud ? '☁️ 雲端排行榜' : '💾 本地排行榜'}
          </span>
        </div>

        {/* 篩選 */}
        <div className="flex justify-center gap-2 mb-6">
          {(['all', 5, 6] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {f === 'all' ? '全部' : `${f}年級`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">還沒有紀錄</h2>
            <p className="text-gray-500 mb-6">完成練習就能上榜！</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
            >
              開始練習
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.username}-${entry.date}-${index}`}
                className={`bg-white rounded-xl shadow p-4 flex items-center gap-4 ${
                  index < 3 ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {getRankEmoji(index)}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{entry.username}</div>
                  <div className="text-sm text-gray-500">
                    {entry.grade}年級 · {entry.totalQuestions}題 · {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-orange-500">{entry.score}分</div>
                  <div className="text-sm text-gray-500">
                    {entry.accuracy}% · 🔥{entry.maxCombo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 說明 */}
        <div className="mt-6 text-center text-white/60 text-sm">
          <p>排行榜每次練習完成後自動更新</p>
          {isCloud && <p>☁️ 資料已同步到雲端，換設備也能看到</p>}
        </div>
      </div>
    </main>
  );
}
