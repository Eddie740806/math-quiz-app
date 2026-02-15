'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLeaderboard, LeaderboardEntry } from '@/lib/storage';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 5 | 6>('all');

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const filteredLeaderboard = filter === 'all' 
    ? leaderboard 
    : leaderboard.filter(e => e.grade === filter);

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

        {filteredLeaderboard.length === 0 ? (
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
            {filteredLeaderboard.map((entry, index) => (
              <div
                key={index}
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
      </div>
    </main>
  );
}
