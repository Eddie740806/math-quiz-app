'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getOnlineCount,
  getTodayStats,
  getTotalStats,
  getGradeDistribution,
  getHardestQuestions,
  subscribeToOnlineCount,
  getAllUsers,
  deleteUser,
  getErrorReports,
  updateErrorReportStatus,
  ErrorReport
} from '@/lib/supabase'

interface UserData {
  id: string
  username: string
  grade: number
  role: string
  created_at: string
  last_active: string
}

interface Stats {
  online: number
  today: {
    users: number
    answers: number
    correctRate: number
  }
  users: UserData[]
  total: {
    users: number
    answers: number
    correctRate: number
  }
  gradeDistribution: { grade: number; count: number }[]
  hardestQuestions: { questionId: string; total: number; errorRate: number }[]
  errorReports: ErrorReport[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Simple password check (you can change this)
  const ADMIN_PASSWORD = 'eddie2026'

  const loadStats = async () => {
    try {
      const [online, today, total, gradeDistribution, hardestQuestions, users, errorReports] = await Promise.all([
        getOnlineCount(),
        getTodayStats(),
        getTotalStats(),
        getGradeDistribution(),
        getHardestQuestions(),
        getAllUsers(),
        getErrorReports()
      ])

      setStats({
        online,
        today,
        total,
        gradeDistribution,
        hardestQuestions,
        users: users as UserData[],
        errorReports: errorReports as ErrorReport[]
      })
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authenticated) return

    loadStats()

    // Subscribe to real-time online count
    const unsubscribe = subscribeToOnlineCount((count) => {
      setStats(prev => prev ? { ...prev, online: count } : null)
    })

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">🔐 管理後台</h1>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (password === ADMIN_PASSWORD) {
              setAuthenticated(true)
            } else {
              alert('密碼錯誤')
            }
          }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入管理密碼"
              className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              進入後台
            </button>
          </form>
          <Link href="/" className="block text-center text-gray-400 mt-4 hover:text-white">
            ← 返回首頁
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">📊 管理後台</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              更新於 {lastUpdate?.toLocaleTimeString()}
            </span>
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 重新整理
            </button>
            <Link href="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              返回首頁
            </Link>
          </div>
        </div>

        {/* Online Count - Hero */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 mb-6 text-center">
          <div className="text-6xl font-bold text-white mb-2">
            {stats?.online || 0}
          </div>
          <div className="text-green-100 text-xl">🟢 即時在線人數</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="今日新用戶"
            value={stats?.today.users || 0}
            icon="👤"
            color="blue"
          />
          <StatCard
            title="今日答題數"
            value={stats?.today.answers || 0}
            icon="📝"
            color="purple"
          />
          <StatCard
            title="今日正確率"
            value={`${stats?.today.correctRate || 0}%`}
            icon="✅"
            color="green"
          />
          <StatCard
            title="總用戶數"
            value={stats?.total.users || 0}
            icon="👥"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="總答題數"
            value={stats?.total.answers || 0}
            icon="📚"
            color="pink"
          />
          <StatCard
            title="總正確率"
            value={`${stats?.total.correctRate || 0}%`}
            icon="🎯"
            color="cyan"
          />
          <StatCard
            title="平均每人答題"
            value={stats?.total.users ? Math.round(stats.total.answers / stats.total.users) : 0}
            icon="📈"
            color="yellow"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 年級分布</h2>
            {stats?.gradeDistribution && stats.gradeDistribution.length > 0 ? (
              <div className="space-y-3">
                {stats.gradeDistribution.map(({ grade, count }) => {
                  const maxCount = Math.max(...stats.gradeDistribution.map(g => g.count))
                  const percentage = (count / maxCount) * 100
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <span className="text-gray-400 w-16">{grade} 年級</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">尚無資料</p>
            )}
          </div>

          {/* Hardest Questions */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">😰 最難的題目 (錯誤率)</h2>
            {stats?.hardestQuestions && stats.hardestQuestions.length > 0 ? (
              <div className="space-y-2">
                {stats.hardestQuestions.map(({ questionId, total, errorRate }, index) => (
                  <div key={questionId} className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">#{index + 1}</span>
                      <span className="text-white">題目 {questionId}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">{total} 次作答</span>
                      <span className={`font-bold ${errorRate >= 70 ? 'text-red-500' : errorRate >= 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {errorRate}% 錯誤
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">尚無足夠資料（需至少 5 次作答）</p>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="bg-gray-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">👥 註冊用戶列表</h2>
          {stats?.users && stats.users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-3 px-2">#</th>
                    <th className="text-left text-gray-400 py-3 px-2">用戶名</th>
                    <th className="text-left text-gray-400 py-3 px-2">角色</th>
                    <th className="text-left text-gray-400 py-3 px-2">年級</th>
                    <th className="text-left text-gray-400 py-3 px-2">註冊時間</th>
                    <th className="text-left text-gray-400 py-3 px-2">最後活動</th>
                    <th className="text-left text-gray-400 py-3 px-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.map((user, index) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-2 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-2 text-white font-medium">{user.username}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'teacher' ? 'bg-green-600 text-white' :
                          user.role === 'parent' ? 'bg-blue-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {user.role === 'teacher' ? '👨‍🏫 老師' : 
                           user.role === 'parent' ? '👨‍👩‍👧 家長' : 
                           '👦 學生'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-300">{user.grade} 年級</td>
                      <td className="py-3 px-2 text-gray-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-sm">
                        {new Date(user.last_active).toLocaleString('zh-TW')}
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={async () => {
                            if (confirm(`確定要刪除用戶 "${user.username}" 嗎？\n此操作無法復原！`)) {
                              const success = await deleteUser(user.id)
                              if (success) {
                                loadStats()
                              } else {
                                alert('刪除失敗')
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                        >
                          🗑️ 刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">尚無註冊用戶</p>
          )}
        </div>

        {/* Error Reports */}
        <div className="bg-gray-800 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            🚨 題目回報 
            {stats?.errorReports && stats.errorReports.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
                {stats.errorReports.filter(r => r.status === 'pending').length} 待處理
              </span>
            )}
          </h2>
          {stats?.errorReports && stats.errorReports.length > 0 ? (
            <div className="space-y-4">
              {stats.errorReports.map((report) => (
                <div 
                  key={report.id} 
                  className={`p-4 rounded-xl border ${
                    report.status === 'pending' 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        report.error_type === 'wrong_answer' ? 'bg-red-600' :
                        report.error_type === 'wrong_explanation' ? 'bg-orange-600' :
                        report.error_type === 'typo' ? 'bg-yellow-600' :
                        report.error_type === 'unclear' ? 'bg-blue-600' :
                        'bg-gray-600'
                      } text-white`}>
                        {report.error_type === 'wrong_answer' ? '❌ 答案錯誤' :
                         report.error_type === 'wrong_explanation' ? '📝 解析錯誤' :
                         report.error_type === 'typo' ? '✏️ 錯字' :
                         report.error_type === 'unclear' ? '❓ 看不懂' :
                         report.error_type === 'duplicate' ? '🔄 重複' :
                         '💬 其他'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        report.status === 'pending' ? 'bg-yellow-600' :
                        report.status === 'resolved' ? 'bg-green-600' :
                        'bg-gray-600'
                      } text-white`}>
                        {report.status === 'pending' ? '⏳ 待處理' :
                         report.status === 'resolved' ? '✅ 已解決' :
                         report.status}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(report.created_at).toLocaleString('zh-TW')}
                    </span>
                  </div>
                  
                  <div className="text-gray-300 text-sm mb-2">
                    <span className="text-gray-500">題目 ID:</span> {report.question_id}
                  </div>
                  
                  <div className="text-white mb-2">
                    {report.question_content}
                  </div>
                  
                  <div className="text-gray-400 text-sm mb-2">
                    <span className="text-gray-500">目前答案:</span> {report.current_answer}
                    {report.correct_answer && (
                      <span className="ml-4">
                        <span className="text-gray-500">建議答案:</span> 
                        <span className="text-green-400 ml-1">{report.correct_answer}</span>
                      </span>
                    )}
                  </div>
                  
                  {report.description && (
                    <div className="text-gray-400 text-sm italic mb-3">
                      「{report.description}」
                    </div>
                  )}
                  
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const success = await updateErrorReportStatus(report.id, 'resolved', 'admin')
                          if (success) loadStats()
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                      >
                        ✅ 標記已解決
                      </button>
                      <button
                        onClick={async () => {
                          const success = await updateErrorReportStatus(report.id, 'ignored', 'admin')
                          if (success) loadStats()
                        }}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
                      >
                        🙈 忽略
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">🎉 目前沒有待處理的回報</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 mt-8">
          國小數學練習平台 | 管理後台 v1.0
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: {
  title: string
  value: number | string
  icon: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-600 to-blue-500',
    purple: 'from-purple-600 to-purple-500',
    green: 'from-green-600 to-green-500',
    orange: 'from-orange-600 to-orange-500',
    pink: 'from-pink-600 to-pink-500',
    cyan: 'from-cyan-600 to-cyan-500',
    yellow: 'from-yellow-600 to-yellow-500',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-center`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/80 text-sm">{title}</div>
    </div>
  )
}
