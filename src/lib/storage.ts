// 本地存儲工具函數
import { trackUser, trackAnswer, pingSession, endSession, supabase } from './supabase'
import { hashPassword, verifyPassword, isPasswordHashed } from './crypto'

// Supabase user ID cache (username -> supabase id)
let supabaseUserIds: Record<string, string> = {}

export type UserRole = 'student' | 'parent' | 'teacher';

export interface User {
  id: string;
  username: string;
  password: string; // hash 或明文（舊用戶）
  role: UserRole;
  createdAt: string;
  supabaseId?: string;
}

export interface WrongRecord {
  questionId: string;
  wrongCount: number;
  lastWrongAt: string;
  userAnswer: number;
  category?: string;
}

export interface CategoryStats {
  category: string;
  totalAnswered: number;
  correctCount: number;
}

export interface UserProgress {
  odiserId: string;
  totalAnswered: number;
  correctCount: number;
  wrongRecords: WrongRecord[];
  lastActiveAt: string;
  categoryStats?: CategoryStats[];
  streak?: number;
  lastPracticeDate?: string;
}

// ========================================
// 字體大小設定
// ========================================
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '22px'
};

const FONT_SIZE_SCALE: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xlarge: 1.375
};

export function getFontSize(): FontSize {
  if (typeof window === 'undefined') return 'medium';
  return (localStorage.getItem('math_quiz_font_size') as FontSize) || 'medium';
}

export function setFontSize(size: FontSize) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('math_quiz_font_size', size);
  applyFontSize(size);
}

export function applyFontSize(size?: FontSize) {
  if (typeof window === 'undefined') return;
  const actualSize = size || getFontSize();
  document.documentElement.style.fontSize = FONT_SIZE_MAP[actualSize];
  document.documentElement.setAttribute('data-font-size', actualSize);
}

export function getFontSizeScale(): number {
  return FONT_SIZE_SCALE[getFontSize()];
}

// ========================================
// 用戶相關
// ========================================
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('math_quiz_users');
  const users = data ? JSON.parse(data) : [];
  // 舊用戶可能沒有 role 欄位
  return users.map((u: User) => ({ ...u, role: u.role || 'student' }));
}

export function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('math_quiz_users', JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('math_quiz_current_user');
  if (!data) return null;
  const user = JSON.parse(data);
  return { ...user, role: user.role || 'student' };
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('math_quiz_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('math_quiz_current_user');
  }
}

export async function registerUser(
  username: string, 
  password: string, 
  grade: number = 5,
  role: UserRole = 'student'
): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getUsers();
  
  // 檢查用戶名是否已存在
  if (users.find(u => u.username === username)) {
    return { success: false, message: '用戶名已存在' };
  }
  
  // 密碼加密
  const passwordHash = await hashPassword(password);
  
  const newUser: User = {
    id: Date.now().toString(),
    username,
    password: passwordHash,
    role,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // 初始化用戶進度
  if (role === 'student') {
    initUserProgress(newUser.id);
  }
  
  // 追蹤到 Supabase（背景執行，不阻塞）
  trackUserToCloud(username, grade, role, passwordHash).then(data => {
    if (data?.id) {
      supabaseUserIds[username] = data.id;
      newUser.supabaseId = data.id;
      // 更新本地用戶
      const updatedUsers = getUsers().map(u => 
        u.id === newUser.id ? { ...u, supabaseId: data.id } : u
      );
      saveUsers(updatedUsers);
    }
  }).catch(console.error);
  
  return { success: true, message: '註冊成功', user: newUser };
}

async function trackUserToCloud(username: string, grade: number, role: UserRole, passwordHash: string) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      username,
      grade,
      role,
      password_hash: passwordHash,
      last_active: new Date().toISOString()
    }, {
      onConflict: 'username'
    })
    .select()
    .single();
  
  if (error) console.error('Track user error:', error);
  return data;
}

export async function loginUser(username: string, password: string, grade: number = 5): Promise<{ success: boolean; message: string; user?: User }> {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return { success: false, message: '用戶名或密碼錯誤' };
  }
  
  // 檢查密碼 - 支援舊的明文密碼和新的 hash
  let passwordMatch = false;
  
  if (isPasswordHashed(user.password)) {
    // 新用戶：驗證 hash
    passwordMatch = await verifyPassword(password, user.password);
  } else {
    // 舊用戶：明文比對，然後遷移到 hash
    if (user.password === password) {
      passwordMatch = true;
      // 自動遷移到 hash
      const passwordHash = await hashPassword(password);
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: passwordHash } : u
      );
      saveUsers(updatedUsers);
      user.password = passwordHash;
      
      // 同步到雲端
      if (supabase) {
        (async () => {
          try {
            await supabase.from('users')
              .update({ password_hash: passwordHash })
              .eq('username', username);
            console.log('Password migrated to hash');
          } catch (err) {
            console.error('Password migration error:', err);
          }
        })();
      }
    }
  }
  
  if (passwordMatch) {
    setCurrentUser(user);
    
    // 追蹤到 Supabase（背景執行）
    trackUser(username, grade).then(data => {
      if (data?.id) {
        supabaseUserIds[username] = data.id;
        // 開始 session
        pingSession(data.id).catch(console.error);
        // 同步雲端進度到本地
        if (user.role === 'student') {
          syncProgressFromCloud(data.id, user.id);
        }
      }
    }).catch(console.error);
    
    return { success: true, message: '登入成功', user };
  }
  
  return { success: false, message: '用戶名或密碼錯誤' };
}

export function logoutUser() {
  const currentUser = getCurrentUser();
  if (currentUser && supabaseUserIds[currentUser.username]) {
    endSession(supabaseUserIds[currentUser.username]).catch(console.error);
  }
  setCurrentUser(null);
}

// Session heartbeat - call this periodically when user is active
export function heartbeat() {
  const currentUser = getCurrentUser();
  if (currentUser && supabaseUserIds[currentUser.username]) {
    pingSession(supabaseUserIds[currentUser.username]).catch(console.error);
  }
}

// ========================================
// 雲端同步功能
// ========================================
async function syncProgressFromCloud(supabaseUserId: string, localUserId: string) {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', supabaseUserId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Sync progress error:', error);
      return;
    }
    
    if (data) {
      // 雲端有資料，與本地合併
      const localProgress = getUserProgress(localUserId);
      const cloudProgress: UserProgress = {
        odiserId: localUserId,
        totalAnswered: data.total_answered || 0,
        correctCount: data.correct_count || 0,
        wrongRecords: data.wrong_records || [],
        lastActiveAt: data.updated_at || new Date().toISOString(),
        categoryStats: data.category_stats || [],
        streak: data.streak || 0,
        lastPracticeDate: data.last_practice_date || undefined
      };
      
      // 如果雲端資料比較新或比較多，使用雲端的
      if (cloudProgress.totalAnswered > localProgress.totalAnswered) {
        saveUserProgress(cloudProgress);
        console.log('Progress synced from cloud');
      }
      
      // 同步成就
      if (data.achievements && data.achievements.length > 0) {
        const localAchievements = getUserAchievements(localUserId);
        if (data.achievements.length > localAchievements.length) {
          saveUserAchievements(localUserId, data.achievements);
          console.log('Achievements synced from cloud');
        }
      }
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

export async function syncProgressToCloud(localUserId: string) {
  if (!supabase) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let supabaseUserId = supabaseUserIds[currentUser.username];
  
  // 如果緩存沒有，嘗試從 Supabase 查詢
  if (!supabaseUserId) {
    try {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('username', currentUser.username)
        .single();
      
      if (data?.id) {
        supabaseUserIds[currentUser.username] = data.id;
        supabaseUserId = data.id;
      }
    } catch (err) {
      console.error('Get user id error:', err);
    }
  }
  
  if (!supabaseUserId) return;
  
  const progress = getUserProgress(localUserId);
  const achievements = getUserAchievements(localUserId);
  
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: supabaseUserId,
        total_answered: progress.totalAnswered,
        correct_count: progress.correctCount,
        streak: progress.streak || 0,
        last_practice_date: progress.lastPracticeDate || null,
        category_stats: progress.categoryStats || [],
        wrong_records: progress.wrongRecords || [],
        achievements: achievements,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('Sync to cloud error:', error);
    } else {
      console.log('Progress synced to cloud');
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

// ========================================
// 進度相關
// ========================================
export function getUserProgress(odiserId: string): UserProgress {
  if (typeof window === 'undefined') {
    return {
      odiserId,
      totalAnswered: 0,
      correctCount: 0,
      wrongRecords: [],
      lastActiveAt: new Date().toISOString()
    };
  }
  
  const data = localStorage.getItem(`math_quiz_progress_${odiserId}`);
  if (data) {
    return JSON.parse(data);
  }
  
  return {
    odiserId,
    totalAnswered: 0,
    correctCount: 0,
    wrongRecords: [],
    lastActiveAt: new Date().toISOString()
  };
}

export function saveUserProgress(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`math_quiz_progress_${progress.odiserId}`, JSON.stringify(progress));
}

export function initUserProgress(odiserId: string) {
  const progress: UserProgress = {
    odiserId,
    totalAnswered: 0,
    correctCount: 0,
    wrongRecords: [],
    lastActiveAt: new Date().toISOString()
  };
  saveUserProgress(progress);
}

export function recordAnswer(odiserId: string, questionId: string, userAnswer: number, correctAnswer: number, category?: string, timeSpent?: number) {
  const progress = getUserProgress(odiserId);
  const isCorrect = userAnswer === correctAnswer;
  
  // 記錄今日答題數
  incrementTodayCount(odiserId);
  
  // 追蹤到 Supabase（背景執行）
  const currentUser = getCurrentUser();
  if (currentUser && supabaseUserIds[currentUser.username]) {
    trackAnswer(
      supabaseUserIds[currentUser.username],
      questionId,
      isCorrect,
      timeSpent || 0
    ).catch(console.error);
  }
  
  progress.totalAnswered++;
  progress.lastActiveAt = new Date().toISOString();
  
  // 更新連續練習天數
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastPracticeDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (progress.lastPracticeDate === yesterday) {
      progress.streak = (progress.streak || 0) + 1;
    } else if (progress.lastPracticeDate !== today) {
      progress.streak = 1;
    }
    progress.lastPracticeDate = today;
  }
  
  // 更新分類統計
  if (category) {
    if (!progress.categoryStats) {
      progress.categoryStats = [];
    }
    let catStat = progress.categoryStats.find(c => c.category === category);
    if (!catStat) {
      catStat = { category, totalAnswered: 0, correctCount: 0 };
      progress.categoryStats.push(catStat);
    }
    catStat.totalAnswered++;
    if (isCorrect) {
      catStat.correctCount++;
    }
  }
  
  if (isCorrect) {
    progress.correctCount++;
    // 如果之前答錯過，現在答對了，從錯題本移除
    progress.wrongRecords = progress.wrongRecords.filter(r => r.questionId !== questionId);
  } else {
    // 記錄錯題
    const existingRecord = progress.wrongRecords.find(r => r.questionId === questionId);
    if (existingRecord) {
      existingRecord.wrongCount++;
      existingRecord.lastWrongAt = new Date().toISOString();
      existingRecord.userAnswer = userAnswer;
      if (category) existingRecord.category = category;
    } else {
      progress.wrongRecords.push({
        questionId,
        wrongCount: 1,
        lastWrongAt: new Date().toISOString(),
        userAnswer,
        category
      });
    }
  }
  
  saveUserProgress(progress);
  
  // 每次答題後都同步到雲端（背景執行）
  syncProgressToCloud(odiserId);
  
  return isCorrect;
}

// 獲取今日答題數
export function getTodayAnsweredCount(userId: string): number {
  const progress = getUserProgress(userId);
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastPracticeDate === today) {
    const data = localStorage.getItem(`math_quiz_today_${userId}_${today}`);
    return data ? parseInt(data) : 0;
  }
  return 0;
}

// 記錄今日答題數
export function incrementTodayCount(userId: string): void {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().split('T')[0];
  const key = `math_quiz_today_${userId}_${today}`;
  const current = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, (current + 1).toString());
}

// 獲取弱點分類 Top3
export function getWeakCategories(odiserId: string, topN: number = 3): { category: string; accuracy: number; total: number }[] {
  const progress = getUserProgress(odiserId);
  if (!progress.categoryStats || progress.categoryStats.length === 0) {
    return [];
  }
  
  return progress.categoryStats
    .filter(c => c.totalAnswered >= 3) // 至少答過3題才算
    .map(c => ({
      category: c.category,
      accuracy: Math.round((c.correctCount / c.totalAnswered) * 100),
      total: c.totalAnswered
    }))
    .sort((a, b) => a.accuracy - b.accuracy) // 正確率低的排前面
    .slice(0, topN);
}

export function getWrongRecords(odiserId: string): WrongRecord[] {
  const progress = getUserProgress(odiserId);
  return progress.wrongRecords;
}

export function removeFromWrongRecords(odiserId: string, questionId: string) {
  const progress = getUserProgress(odiserId);
  progress.wrongRecords = progress.wrongRecords.filter(r => r.questionId !== questionId);
  saveUserProgress(progress);
}

// ========================================
// 排行榜（雲端同步）
// ========================================
export interface LeaderboardEntry {
  username: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  totalQuestions: number;
  date: string;
  grade: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('math_quiz_leaderboard');
  return data ? JSON.parse(data) : [];
}

export async function addToLeaderboard(entry: LeaderboardEntry) {
  if (typeof window === 'undefined') return;
  
  // 本地存儲
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
  const top50 = leaderboard.slice(0, 50);
  localStorage.setItem('math_quiz_leaderboard', JSON.stringify(top50));
  
  // 同步到雲端
  if (supabase) {
    try {
      await supabase.from('leaderboard').insert({
        username: entry.username,
        score: entry.score,
        accuracy: entry.accuracy,
        max_combo: entry.maxCombo,
        total_questions: entry.totalQuestions,
        grade: entry.grade
      });
      console.log('Leaderboard synced to cloud');
    } catch (err) {
      console.error('Leaderboard sync error:', err);
    }
  }
}

export async function getCloudLeaderboard(grade?: number): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return getLeaderboard(); // fallback to local
  }
  
  try {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(50);
    
    if (grade) {
      query = query.eq('grade', grade);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Get leaderboard error:', error);
      return getLeaderboard();
    }
    
    return (data || []).map(row => ({
      username: row.username,
      score: row.score,
      accuracy: row.accuracy,
      maxCombo: row.max_combo,
      totalQuestions: row.total_questions,
      date: row.created_at,
      grade: row.grade
    }));
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return getLeaderboard();
  }
}

export function clearLeaderboard() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('math_quiz_leaderboard');
}

// ========================================
// 家長功能
// ========================================
export async function getChildrenForParent(parentUsername: string): Promise<User[]> {
  if (!supabase) return [];
  
  try {
    // 先取得家長的 supabase ID
    const { data: parentData } = await supabase
      .from('users')
      .select('id')
      .eq('username', parentUsername)
      .single();
    
    if (!parentData) return [];
    
    // 取得綁定的孩子
    const { data: children } = await supabase
      .from('parent_children')
      .select('child_id')
      .eq('parent_id', parentData.id);
    
    if (!children || children.length === 0) return [];
    
    // 取得孩子的資料
    const childIds = children.map(c => c.child_id);
    const { data: childUsers } = await supabase
      .from('users')
      .select('*')
      .in('id', childIds);
    
    return (childUsers || []).map(u => ({
      id: u.id,
      username: u.username,
      password: '',
      role: 'student' as UserRole,
      createdAt: u.created_at,
      supabaseId: u.id
    }));
  } catch (err) {
    console.error('Get children error:', err);
    return [];
  }
}

export async function bindChildToParent(parentUsername: string, childUsername: string): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: '雲端服務未連接' };
  }
  
  try {
    // 取得家長和孩子的 ID
    const { data: parentData } = await supabase
      .from('users')
      .select('id, role')
      .eq('username', parentUsername)
      .single();
    
    const { data: childData } = await supabase
      .from('users')
      .select('id, role')
      .eq('username', childUsername)
      .single();
    
    if (!parentData) {
      return { success: false, message: '找不到家長帳號' };
    }
    
    if (!childData) {
      return { success: false, message: '找不到孩子帳號' };
    }
    
    if (childData.role === 'parent' || childData.role === 'teacher') {
      return { success: false, message: '只能綁定學生帳號' };
    }
    
    // 建立綁定關係
    const { error } = await supabase
      .from('parent_children')
      .insert({
        parent_id: parentData.id,
        child_id: childData.id
      });
    
    if (error) {
      if (error.code === '23505') { // unique violation
        return { success: false, message: '已經綁定過這個孩子' };
      }
      return { success: false, message: '綁定失敗' };
    }
    
    return { success: true, message: '綁定成功' };
  } catch (err) {
    console.error('Bind child error:', err);
    return { success: false, message: '綁定失敗' };
  }
}

export async function getChildProgress(childUsername: string): Promise<UserProgress | null> {
  if (!supabase) return null;
  
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('username', childUsername)
      .single();
    
    if (!userData) return null;
    
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userData.id)
      .single();
    
    if (!progressData) return null;
    
    return {
      odiserId: userData.id,
      totalAnswered: progressData.total_answered || 0,
      correctCount: progressData.correct_count || 0,
      wrongRecords: progressData.wrong_records || [],
      lastActiveAt: progressData.updated_at || new Date().toISOString(),
      categoryStats: progressData.category_stats || [],
      streak: progressData.streak || 0,
      lastPracticeDate: progressData.last_practice_date || undefined
    };
  } catch (err) {
    console.error('Get child progress error:', err);
    return null;
  }
}

// ========================================
// 班級功能
// ========================================
export interface ClassInfo {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  inviteCode: string;
  grade: number;
  memberCount?: number;
  createdAt: string;
}

export async function createClass(teacherUsername: string, name: string, description: string, grade: number): Promise<{ success: boolean; message: string; classInfo?: ClassInfo }> {
  if (!supabase) {
    return { success: false, message: '雲端服務未連接' };
  }
  
  try {
    // 取得老師 ID
    const { data: teacherData } = await supabase
      .from('users')
      .select('id')
      .eq('username', teacherUsername)
      .single();
    
    if (!teacherData) {
      return { success: false, message: '找不到教師帳號' };
    }
    
    // 生成邀請碼
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name,
        description,
        teacher_id: teacherData.id,
        invite_code: inviteCode,
        grade
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, message: '建立班級失敗' };
    }
    
    return {
      success: true,
      message: '班級建立成功',
      classInfo: {
        id: data.id,
        name: data.name,
        description: data.description,
        teacherId: data.teacher_id,
        inviteCode: data.invite_code,
        grade: data.grade,
        createdAt: data.created_at
      }
    };
  } catch (err) {
    console.error('Create class error:', err);
    return { success: false, message: '建立班級失敗' };
  }
}

export async function joinClass(studentUsername: string, inviteCode: string): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: '雲端服務未連接' };
  }
  
  try {
    // 取得學生 ID
    const { data: studentData } = await supabase
      .from('users')
      .select('id')
      .eq('username', studentUsername)
      .single();
    
    if (!studentData) {
      return { success: false, message: '找不到學生帳號' };
    }
    
    // 取得班級
    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (!classData) {
      return { success: false, message: '邀請碼無效或班級已關閉' };
    }
    
    // 加入班級
    const { error } = await supabase
      .from('class_members')
      .insert({
        class_id: classData.id,
        user_id: studentData.id
      });
    
    if (error) {
      if (error.code === '23505') {
        return { success: false, message: '你已經是這個班級的成員了' };
      }
      return { success: false, message: '加入班級失敗' };
    }
    
    return { success: true, message: '成功加入班級' };
  } catch (err) {
    console.error('Join class error:', err);
    return { success: false, message: '加入班級失敗' };
  }
}

export async function getTeacherClasses(teacherUsername: string): Promise<ClassInfo[]> {
  if (!supabase) return [];
  
  try {
    const { data: teacherData } = await supabase
      .from('users')
      .select('id')
      .eq('username', teacherUsername)
      .single();
    
    if (!teacherData) return [];
    
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (!classes) return [];
    
    // 取得每個班級的成員數
    const result: ClassInfo[] = [];
    for (const cls of classes) {
      const { count } = await supabase
        .from('class_members')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', cls.id);
      
      result.push({
        id: cls.id,
        name: cls.name,
        description: cls.description,
        teacherId: cls.teacher_id,
        inviteCode: cls.invite_code,
        grade: cls.grade,
        memberCount: count || 0,
        createdAt: cls.created_at
      });
    }
    
    return result;
  } catch (err) {
    console.error('Get teacher classes error:', err);
    return [];
  }
}

export async function getClassMembers(classId: string): Promise<{ username: string; progress: UserProgress | null }[]> {
  if (!supabase) return [];
  
  try {
    const { data: members } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', classId);
    
    if (!members || members.length === 0) return [];
    
    const result: { username: string; progress: UserProgress | null }[] = [];
    
    for (const member of members) {
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', member.user_id)
        .single();
      
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', member.user_id)
        .single();
      
      result.push({
        username: userData?.username || 'Unknown',
        progress: progressData ? {
          odiserId: member.user_id,
          totalAnswered: progressData.total_answered || 0,
          correctCount: progressData.correct_count || 0,
          wrongRecords: progressData.wrong_records || [],
          lastActiveAt: progressData.updated_at || new Date().toISOString(),
          categoryStats: progressData.category_stats || [],
          streak: progressData.streak || 0,
          lastPracticeDate: progressData.last_practice_date || undefined
        } : null
      });
    }
    
    return result;
  } catch (err) {
    console.error('Get class members error:', err);
    return [];
  }
}

// ========================================
// 新手引導
// ========================================
export function hasCompletedTour(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('math_quiz_tour_completed') === 'true';
}

export function setTourCompleted(completed: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('math_quiz_tour_completed', completed ? 'true' : 'false');
}

export function resetTour() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('math_quiz_tour_completed');
  // 觸發自定義事件，讓 Tour 組件知道要重新顯示
  window.dispatchEvent(new Event('tourReset'));
}

// ========================================
// 成就系統
// ========================================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ===== 入門成就 (5) =====
  { id: 'first_quiz', name: '初試身手', description: '完成第一次練習', icon: '🎯' },
  { id: 'first_correct', name: '開門紅', description: '第一題就答對', icon: '🍀' },
  { id: 'first_10', name: '小試牛刀', description: '累計練習 10 題', icon: '✏️' },
  { id: 'both_grades', name: '全年級挑戰', description: '五、六年級都練習過', icon: '📖' },
  { id: 'night_owl', name: '夜貓子', description: '晚上 10 點後練習', icon: '🦉' },
  
  // ===== 練習量成就 (8) =====
  { id: 'practice_50', name: '勤學者', description: '累計練習 50 題', icon: '📚' },
  { id: 'practice_100', name: '百題達人', description: '累計練習 100 題', icon: '🏅' },
  { id: 'practice_200', name: '學習狂人', description: '累計練習 200 題', icon: '📝' },
  { id: 'practice_500', name: '數學高手', description: '累計練習 500 題', icon: '🏆' },
  { id: 'practice_1000', name: '千題王者', description: '累計練習 1000 題', icon: '👑' },
  { id: 'practice_2000', name: '題海戰神', description: '累計練習 2000 題', icon: '⚔️' },
  { id: 'daily_30_questions', name: '日練三十', description: '單日練習 30 題', icon: '💪' },
  { id: 'daily_50_questions', name: '瘋狂刷題', description: '單日練習 50 題', icon: '🔥' },
  
  // ===== 連擊成就 (7) =====
  { id: 'streak_3', name: '三連勝', description: '連續答對 3 題', icon: '🔥' },
  { id: 'streak_5', name: '五連霸', description: '連續答對 5 題', icon: '⚡' },
  { id: 'streak_10', name: '十連神', description: '連續答對 10 題', icon: '🌟' },
  { id: 'streak_20', name: '二十連殺', description: '連續答對 20 題', icon: '💫' },
  { id: 'streak_30', name: '三十連斬', description: '連續答對 30 題', icon: '🗡️' },
  { id: 'streak_50', name: '五十無敵', description: '連續答對 50 題', icon: '🛡️' },
  { id: 'streak_100', name: '百連傳說', description: '連續答對 100 題', icon: '🐉' },
  
  // ===== 正確率成就 (6) =====
  { id: 'accuracy_70', name: '穩定輸出', description: '正確率達到 70%（至少 50 題）', icon: '📊' },
  { id: 'accuracy_80', name: '精準射手', description: '正確率達到 80%（至少 50 題）', icon: '🎯' },
  { id: 'accuracy_90', name: '神準無比', description: '正確率達到 90%（至少 100 題）', icon: '💎' },
  { id: 'accuracy_95', name: '近乎完美', description: '正確率達到 95%（至少 100 題）', icon: '✨' },
  { id: 'accuracy_99', name: '人形計算機', description: '正確率達到 99%（至少 200 題）', icon: '🤖' },
  { id: 'perfect_10', name: '完美十題', description: '單次練習 10 題全對', icon: '💯' },
  
  // ===== 連續天數成就 (7) =====
  { id: 'daily_3', name: '三日不輟', description: '連續練習 3 天', icon: '📅' },
  { id: 'daily_7', name: '週週努力', description: '連續練習 7 天', icon: '🗓️' },
  { id: 'daily_14', name: '兩週達人', description: '連續練習 14 天', icon: '📆' },
  { id: 'daily_30', name: '月度堅持', description: '連續練習 30 天', icon: '🌙' },
  { id: 'daily_60', name: '雙月戰士', description: '連續練習 60 天', icon: '⭐' },
  { id: 'daily_100', name: '百日傳奇', description: '連續練習 100 天', icon: '🌈' },
  { id: 'daily_365', name: '全年無休', description: '連續練習 365 天', icon: '🎖️' },
  
  // ===== 速度成就 (5) =====
  { id: 'speed_15', name: '快手', description: '平均答題時間低於 15 秒', icon: '⏰' },
  { id: 'speed_10', name: '速算達人', description: '平均答題時間低於 10 秒', icon: '⏱️' },
  { id: 'speed_5', name: '閃電俠', description: '平均答題時間低於 5 秒', icon: '⚡' },
  { id: 'speed_3', name: '光速腦', description: '平均答題時間低於 3 秒', icon: '💨' },
  { id: 'instant_correct', name: '秒殺', description: '2 秒內答對一題', icon: '🎯' },
  
  // ===== 特殊挑戰成就 (6) =====
  { id: 'comeback', name: '逆風翻盤', description: '錯 3 題後連對 5 題', icon: '🔄' },
  { id: 'perfectionist', name: '完美主義', description: '單次練習 20 題全對', icon: '💫' },
  { id: 'marathon', name: '馬拉松', description: '單次練習 50 題', icon: '🏃' },
  { id: 'iron_will', name: '鋼鐵意志', description: '答錯後立刻答對同類型題', icon: '💪' },
  { id: 'early_bird', name: '早起鳥兒', description: '早上 6 點前練習', icon: '🐦' },
  { id: 'weekend_warrior', name: '週末戰士', description: '週六日都有練習', icon: '⚔️' },
  
  // ===== 節慶成就 (6) =====
  { id: 'new_year', name: '新年快樂', description: '在元旦（1/1）練習', icon: '🎊' },
  { id: 'lunar_new_year', name: '龍年大吉', description: '在農曆新年期間練習', icon: '🧧' },
  { id: 'valentines', name: '數學情人', description: '在情人節（2/14）練習', icon: '💝' },
  { id: 'childrens_day', name: '兒童節快樂', description: '在兒童節（4/4）練習', icon: '🎈' },
  { id: 'teacher_day', name: '師恩難忘', description: '在教師節（9/28）練習', icon: '🍎' },
  { id: 'christmas', name: '聖誕快樂', description: '在聖誕節（12/25）練習', icon: '🎄' },
];

export function getUserAchievements(userId: string): Achievement[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`math_quiz_achievements_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function saveUserAchievements(userId: string, achievements: Achievement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`math_quiz_achievements_${userId}`, JSON.stringify(achievements));
}

export function unlockAchievement(userId: string, achievementId: string): Achievement | null {
  const userAchievements = getUserAchievements(userId);
  
  // 已經解鎖過了
  if (userAchievements.find(a => a.id === achievementId)) {
    return null;
  }
  
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;
  
  const unlockedAchievement = {
    ...achievement,
    unlockedAt: new Date().toISOString()
  };
  
  userAchievements.push(unlockedAchievement);
  saveUserAchievements(userId, userAchievements);
  
  return unlockedAchievement;
}

export function checkAndUnlockAchievements(userId: string, stats: {
  totalAnswered: number;
  correctCount: number;
  streak: number;
  maxCombo: number;
  avgTime?: number;
  isPerfect?: boolean;
  sessionCorrect?: number;
  sessionTotal?: number;
  todayCount?: number;
  isFirstCorrect?: boolean;
  fastestTime?: number;
  hasGrade5?: boolean;
  hasGrade6?: boolean;
}): Achievement[] {
  const newAchievements: Achievement[] = [];
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfWeek = now.getDay();
  
  // ===== 入門成就 =====
  if (stats.totalAnswered >= 1) {
    const a = unlockAchievement(userId, 'first_quiz');
    if (a) newAchievements.push(a);
  }
  if (stats.isFirstCorrect) {
    const a = unlockAchievement(userId, 'first_correct');
    if (a) newAchievements.push(a);
  }
  if (stats.totalAnswered >= 10) {
    const a = unlockAchievement(userId, 'first_10');
    if (a) newAchievements.push(a);
  }
  if (stats.hasGrade5 && stats.hasGrade6) {
    const a = unlockAchievement(userId, 'both_grades');
    if (a) newAchievements.push(a);
  }
  if (hour >= 22 || hour < 6) {
    const a = unlockAchievement(userId, 'night_owl');
    if (a) newAchievements.push(a);
  }
  
  // ===== 練習量成就 =====
  const practiceThresholds = [
    { count: 50, id: 'practice_50' },
    { count: 100, id: 'practice_100' },
    { count: 200, id: 'practice_200' },
    { count: 500, id: 'practice_500' },
    { count: 1000, id: 'practice_1000' },
    { count: 2000, id: 'practice_2000' },
  ];
  for (const t of practiceThresholds) {
    if (stats.totalAnswered >= t.count) {
      const a = unlockAchievement(userId, t.id);
      if (a) newAchievements.push(a);
    }
  }
  if (stats.todayCount && stats.todayCount >= 30) {
    const a = unlockAchievement(userId, 'daily_30_questions');
    if (a) newAchievements.push(a);
  }
  if (stats.todayCount && stats.todayCount >= 50) {
    const a = unlockAchievement(userId, 'daily_50_questions');
    if (a) newAchievements.push(a);
  }
  
  // ===== 連擊成就 =====
  const streakThresholds = [
    { count: 3, id: 'streak_3' },
    { count: 5, id: 'streak_5' },
    { count: 10, id: 'streak_10' },
    { count: 20, id: 'streak_20' },
    { count: 30, id: 'streak_30' },
    { count: 50, id: 'streak_50' },
    { count: 100, id: 'streak_100' },
  ];
  for (const t of streakThresholds) {
    if (stats.maxCombo >= t.count) {
      const a = unlockAchievement(userId, t.id);
      if (a) newAchievements.push(a);
    }
  }
  
  // ===== 正確率成就 =====
  const accuracy = stats.totalAnswered > 0 ? (stats.correctCount / stats.totalAnswered * 100) : 0;
  if (accuracy >= 70 && stats.totalAnswered >= 50) {
    const a = unlockAchievement(userId, 'accuracy_70');
    if (a) newAchievements.push(a);
  }
  if (accuracy >= 80 && stats.totalAnswered >= 50) {
    const a = unlockAchievement(userId, 'accuracy_80');
    if (a) newAchievements.push(a);
  }
  if (accuracy >= 90 && stats.totalAnswered >= 100) {
    const a = unlockAchievement(userId, 'accuracy_90');
    if (a) newAchievements.push(a);
  }
  if (accuracy >= 95 && stats.totalAnswered >= 100) {
    const a = unlockAchievement(userId, 'accuracy_95');
    if (a) newAchievements.push(a);
  }
  if (accuracy >= 99 && stats.totalAnswered >= 200) {
    const a = unlockAchievement(userId, 'accuracy_99');
    if (a) newAchievements.push(a);
  }
  if (stats.isPerfect && stats.sessionTotal && stats.sessionTotal >= 10) {
    const a = unlockAchievement(userId, 'perfect_10');
    if (a) newAchievements.push(a);
  }
  
  // ===== 連續天數成就 =====
  const dailyThresholds = [
    { count: 3, id: 'daily_3' },
    { count: 7, id: 'daily_7' },
    { count: 14, id: 'daily_14' },
    { count: 30, id: 'daily_30' },
    { count: 60, id: 'daily_60' },
    { count: 100, id: 'daily_100' },
    { count: 365, id: 'daily_365' },
  ];
  for (const t of dailyThresholds) {
    if (stats.streak >= t.count) {
      const a = unlockAchievement(userId, t.id);
      if (a) newAchievements.push(a);
    }
  }
  
  // ===== 速度成就 =====
  if (stats.avgTime && stats.avgTime < 15) {
    const a = unlockAchievement(userId, 'speed_15');
    if (a) newAchievements.push(a);
  }
  if (stats.avgTime && stats.avgTime < 10) {
    const a = unlockAchievement(userId, 'speed_10');
    if (a) newAchievements.push(a);
  }
  if (stats.avgTime && stats.avgTime < 5) {
    const a = unlockAchievement(userId, 'speed_5');
    if (a) newAchievements.push(a);
  }
  if (stats.avgTime && stats.avgTime < 3) {
    const a = unlockAchievement(userId, 'speed_3');
    if (a) newAchievements.push(a);
  }
  if (stats.fastestTime && stats.fastestTime <= 2) {
    const a = unlockAchievement(userId, 'instant_correct');
    if (a) newAchievements.push(a);
  }
  
  // ===== 特殊挑戰成就 =====
  if (stats.sessionTotal && stats.sessionTotal >= 50) {
    const a = unlockAchievement(userId, 'marathon');
    if (a) newAchievements.push(a);
  }
  if (stats.isPerfect && stats.sessionTotal && stats.sessionTotal >= 20) {
    const a = unlockAchievement(userId, 'perfectionist');
    if (a) newAchievements.push(a);
  }
  if (hour < 6) {
    const a = unlockAchievement(userId, 'early_bird');
    if (a) newAchievements.push(a);
  }
  // 週末戰士：在週六或週日練習
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const a = unlockAchievement(userId, 'weekend_warrior');
    if (a) newAchievements.push(a);
  }
  
  // ===== 節慶成就 =====
  // 元旦
  if (month === 1 && day === 1) {
    const a = unlockAchievement(userId, 'new_year');
    if (a) newAchievements.push(a);
  }
  // 農曆新年（約 1/21 - 2/20 期間，簡化判斷）
  if ((month === 1 && day >= 21) || (month === 2 && day <= 15)) {
    const a = unlockAchievement(userId, 'lunar_new_year');
    if (a) newAchievements.push(a);
  }
  // 情人節
  if (month === 2 && day === 14) {
    const a = unlockAchievement(userId, 'valentines');
    if (a) newAchievements.push(a);
  }
  // 兒童節
  if (month === 4 && day === 4) {
    const a = unlockAchievement(userId, 'childrens_day');
    if (a) newAchievements.push(a);
  }
  // 教師節
  if (month === 9 && day === 28) {
    const a = unlockAchievement(userId, 'teacher_day');
    if (a) newAchievements.push(a);
  }
  // 聖誕節
  if (month === 12 && day === 25) {
    const a = unlockAchievement(userId, 'christmas');
    if (a) newAchievements.push(a);
  }
  
  return newAchievements;
}

// ==================== 收藏功能 ====================

export interface BookmarkedQuestion {
  questionId: string;
  addedAt: string;
  note?: string;
}

export function getBookmarks(userId: string): BookmarkedQuestion[] {
  if (typeof window === 'undefined') return [];
  const key = `bookmarks_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function addBookmark(userId: string, questionId: string, note?: string): boolean {
  if (typeof window === 'undefined') return false;
  const bookmarks = getBookmarks(userId);
  
  // 檢查是否已收藏
  if (bookmarks.some(b => b.questionId === questionId)) {
    return false;
  }
  
  bookmarks.push({
    questionId,
    addedAt: new Date().toISOString(),
    note
  });
  
  localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));
  return true;
}

export function removeBookmark(userId: string, questionId: string): boolean {
  if (typeof window === 'undefined') return false;
  const bookmarks = getBookmarks(userId);
  const filtered = bookmarks.filter(b => b.questionId !== questionId);
  
  if (filtered.length === bookmarks.length) {
    return false; // 沒有找到要刪除的
  }
  
  localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(filtered));
  return true;
}

export function isBookmarked(userId: string, questionId: string): boolean {
  if (typeof window === 'undefined') return false;
  const bookmarks = getBookmarks(userId);
  return bookmarks.some(b => b.questionId === questionId);
}

export function toggleBookmark(userId: string, questionId: string): boolean {
  if (isBookmarked(userId, questionId)) {
    removeBookmark(userId, questionId);
    return false;
  } else {
    addBookmark(userId, questionId);
    return true;
  }
}

// ==================== 徽章展示功能 ====================

export function getDisplayedBadges(userId: string): string[] {
  if (typeof window === 'undefined') return [];
  const key = `math_quiz_displayed_badges_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function setDisplayedBadges(userId: string, badgeIds: string[]): void {
  if (typeof window === 'undefined') return;
  // 最多 3 個
  const limited = badgeIds.slice(0, 3);
  const key = `math_quiz_displayed_badges_${userId}`;
  localStorage.setItem(key, JSON.stringify(limited));
  
  // 同步到雲端
  syncProgressToCloud(userId);
}

export function toggleDisplayedBadge(userId: string, badgeId: string): { success: boolean; isDisplayed: boolean; message?: string } {
  const current = getDisplayedBadges(userId);
  const userAchievements = getUserAchievements(userId);
  
  // 檢查是否已解鎖
  if (!userAchievements.some(a => a.id === badgeId)) {
    return { success: false, isDisplayed: false, message: '尚未解鎖此成就' };
  }
  
  const index = current.indexOf(badgeId);
  if (index > -1) {
    // 已裝備，卸除
    current.splice(index, 1);
    setDisplayedBadges(userId, current);
    return { success: true, isDisplayed: false };
  } else {
    // 未裝備，嘗試裝備
    if (current.length >= 3) {
      return { success: false, isDisplayed: false, message: '最多只能展示 3 個徽章' };
    }
    current.push(badgeId);
    setDisplayedBadges(userId, current);
    return { success: true, isDisplayed: true };
  }
}

export function getDisplayedBadgeIcons(userId: string): string[] {
  const badgeIds = getDisplayedBadges(userId);
  return badgeIds.map(id => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    return achievement?.icon || '';
  }).filter(Boolean);
}

export function getDisplayedBadgesWithNames(userId: string): { icon: string; name: string }[] {
  const badgeIds = getDisplayedBadges(userId);
  return badgeIds.map(id => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    return achievement ? { icon: achievement.icon, name: achievement.name } : null;
  }).filter((b): b is { icon: string; name: string } => b !== null);
}
