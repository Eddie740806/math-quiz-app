import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if credentials are provided
let supabase: SupabaseClient | null = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Types for database
export interface DbUser {
  id: string
  username: string
  grade: number
  created_at: string
  last_active: string
}

export interface DbAnswer {
  id: string
  user_id: string
  question_id: string
  is_correct: boolean
  time_spent: number
  created_at: string
}

export interface DbSession {
  id: string
  user_id: string
  started_at: string
  last_ping: string
  is_active: boolean
}

// Helper functions
export async function trackUser(username: string, grade: number) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      username,
      grade,
      last_active: new Date().toISOString()
    }, {
      onConflict: 'username'
    })
    .select()
    .single()
  
  if (error) console.error('Track user error:', error)
  return data
}

export async function trackAnswer(userId: string, questionId: string, isCorrect: boolean, timeSpent: number) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('answers')
    .insert({
      user_id: userId,
      question_id: questionId,
      is_correct: isCorrect,
      time_spent: timeSpent
    })
    .select()
    .single()
  
  if (error) console.error('Track answer error:', error)
  return data
}

export async function pingSession(userId: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('sessions')
    .upsert({
      user_id: userId,
      last_ping: new Date().toISOString(),
      is_active: true
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()
  
  if (error) console.error('Ping session error:', error)
  return data
}

export async function endSession(userId: string) {
  if (!supabase) return null
  
  const { error } = await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
  
  if (error) console.error('End session error:', error)
}

// Admin stats functions
export async function getOnlineCount() {
  if (!supabase) return 0
  
  // Count sessions with last_ping within 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  
  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .gte('last_ping', fiveMinutesAgo)
  
  if (error) console.error('Get online count error:', error)
  return count || 0
}

export async function getTodayStats() {
  if (!supabase) return { users: 0, answers: 0, correctRate: 0 }
  
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()
  
  // Today's new users
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayIso)
  
  // Today's answers
  const { data: answers } = await supabase
    .from('answers')
    .select('is_correct')
    .gte('created_at', todayIso)
  
  const totalAnswers = answers?.length || 0
  const correctAnswers = answers?.filter(a => a.is_correct).length || 0
  const correctRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
  
  return {
    users: newUsers || 0,
    answers: totalAnswers,
    correctRate
  }
}

export async function getTotalStats() {
  if (!supabase) return { users: 0, answers: 0, correctRate: 0 }
  
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  const { data: answers } = await supabase
    .from('answers')
    .select('is_correct')
  
  const totalAnswers = answers?.length || 0
  const correctAnswers = answers?.filter(a => a.is_correct).length || 0
  const correctRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
  
  return {
    users: totalUsers || 0,
    answers: totalAnswers,
    correctRate
  }
}

export async function getGradeDistribution() {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('users')
    .select('grade')
  
  if (error || !data) return []
  
  const distribution: Record<number, number> = {}
  data.forEach(u => {
    distribution[u.grade] = (distribution[u.grade] || 0) + 1
  })
  
  return Object.entries(distribution).map(([grade, count]) => ({
    grade: Number(grade),
    count
  })).sort((a, b) => a.grade - b.grade)
}

export async function getHardestQuestions(limit = 10) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('answers')
    .select('question_id, is_correct')
  
  if (error || !data) return []
  
  // Group by question_id
  const stats: Record<string, { total: number, wrong: number }> = {}
  data.forEach(a => {
    if (!stats[a.question_id]) {
      stats[a.question_id] = { total: 0, wrong: 0 }
    }
    stats[a.question_id].total++
    if (!a.is_correct) stats[a.question_id].wrong++
  })
  
  // Calculate error rate and sort
  return Object.entries(stats)
    .map(([questionId, s]) => ({
      questionId,
      total: s.total,
      errorRate: Math.round((s.wrong / s.total) * 100)
    }))
    .filter(q => q.total >= 5) // At least 5 attempts
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, limit)
}

// Real-time subscription for online count
export function subscribeToOnlineCount(callback: (count: number) => void) {
  if (!supabase) return () => {}
  
  const client = supabase // Capture for cleanup
  const channel = client
    .channel('online-count')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'sessions'
    }, async () => {
      const count = await getOnlineCount()
      callback(count)
    })
    .subscribe()
  
  return () => {
    client.removeChannel(channel)
  }
}
