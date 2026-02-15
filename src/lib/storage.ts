// 本地存儲工具函數

export interface User {
  id: string;
  username: string;
  password: string; // 實際應該加密
  createdAt: string;
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

// 用戶相關
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('math_quiz_users');
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('math_quiz_users', JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('math_quiz_current_user');
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('math_quiz_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('math_quiz_current_user');
  }
}

export function registerUser(username: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  
  // 檢查用戶名是否已存在
  if (users.find(u => u.username === username)) {
    return { success: false, message: '用戶名已存在' };
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    username,
    password, // 實際應該加密
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // 初始化用戶進度
  initUserProgress(newUser.id);
  
  return { success: true, message: '註冊成功', user: newUser };
}

export function loginUser(username: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    return { success: true, message: '登入成功', user };
  }
  
  return { success: false, message: '用戶名或密碼錯誤' };
}

export function logoutUser() {
  setCurrentUser(null);
}

// 進度相關
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

export function recordAnswer(odiserId: string, questionId: string, userAnswer: number, correctAnswer: number, category?: string) {
  const progress = getUserProgress(odiserId);
  const isCorrect = userAnswer === correctAnswer;
  
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
  return isCorrect;
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

// 排行榜
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

export function addToLeaderboard(entry: LeaderboardEntry) {
  if (typeof window === 'undefined') return;
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);
  // 按分數排序，保留前 50 名
  leaderboard.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
  const top50 = leaderboard.slice(0, 50);
  localStorage.setItem('math_quiz_leaderboard', JSON.stringify(top50));
}

export function clearLeaderboard() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('math_quiz_leaderboard');
}

// 成就系統
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quiz', name: '初試身手', description: '完成第一次練習', icon: '🎯' },
  { id: 'streak_3', name: '三連勝', description: '連續答對 3 題', icon: '🔥' },
  { id: 'streak_5', name: '五連霸', description: '連續答對 5 題', icon: '⚡' },
  { id: 'streak_10', name: '十連神', description: '連續答對 10 題', icon: '🌟' },
  { id: 'perfect_10', name: '完美十題', description: '10 題全對', icon: '💯' },
  { id: 'speed_demon', name: '速算達人', description: '平均答題時間低於 10 秒', icon: '⏱️' },
  { id: 'practice_50', name: '勤學者', description: '累計練習 50 題', icon: '📚' },
  { id: 'practice_100', name: '百題達人', description: '累計練習 100 題', icon: '🏅' },
  { id: 'practice_500', name: '數學高手', description: '累計練習 500 題', icon: '🏆' },
  { id: 'accuracy_80', name: '精準射手', description: '正確率達到 80%', icon: '🎯' },
  { id: 'accuracy_90', name: '神準無比', description: '正確率達到 90%', icon: '💎' },
  { id: 'daily_3', name: '三日不輟', description: '連續練習 3 天', icon: '📅' },
  { id: 'daily_7', name: '週週努力', description: '連續練習 7 天', icon: '🗓️' },
  { id: 'daily_30', name: '月度堅持', description: '連續練習 30 天', icon: '🌙' },
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
}): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  // 第一次練習
  if (stats.totalAnswered >= 1) {
    const a = unlockAchievement(userId, 'first_quiz');
    if (a) newAchievements.push(a);
  }
  
  // 連擊成就
  if (stats.maxCombo >= 3) {
    const a = unlockAchievement(userId, 'streak_3');
    if (a) newAchievements.push(a);
  }
  if (stats.maxCombo >= 5) {
    const a = unlockAchievement(userId, 'streak_5');
    if (a) newAchievements.push(a);
  }
  if (stats.maxCombo >= 10) {
    const a = unlockAchievement(userId, 'streak_10');
    if (a) newAchievements.push(a);
  }
  
  // 累計練習
  if (stats.totalAnswered >= 50) {
    const a = unlockAchievement(userId, 'practice_50');
    if (a) newAchievements.push(a);
  }
  if (stats.totalAnswered >= 100) {
    const a = unlockAchievement(userId, 'practice_100');
    if (a) newAchievements.push(a);
  }
  if (stats.totalAnswered >= 500) {
    const a = unlockAchievement(userId, 'practice_500');
    if (a) newAchievements.push(a);
  }
  
  // 正確率成就
  const accuracy = stats.totalAnswered > 0 ? (stats.correctCount / stats.totalAnswered * 100) : 0;
  if (accuracy >= 80 && stats.totalAnswered >= 10) {
    const a = unlockAchievement(userId, 'accuracy_80');
    if (a) newAchievements.push(a);
  }
  if (accuracy >= 90 && stats.totalAnswered >= 10) {
    const a = unlockAchievement(userId, 'accuracy_90');
    if (a) newAchievements.push(a);
  }
  
  // 連續天數
  if (stats.streak >= 3) {
    const a = unlockAchievement(userId, 'daily_3');
    if (a) newAchievements.push(a);
  }
  if (stats.streak >= 7) {
    const a = unlockAchievement(userId, 'daily_7');
    if (a) newAchievements.push(a);
  }
  if (stats.streak >= 30) {
    const a = unlockAchievement(userId, 'daily_30');
    if (a) newAchievements.push(a);
  }
  
  // 速度成就
  if (stats.avgTime && stats.avgTime < 10) {
    const a = unlockAchievement(userId, 'speed_demon');
    if (a) newAchievements.push(a);
  }
  
  // 完美成就
  if (stats.isPerfect) {
    const a = unlockAchievement(userId, 'perfect_10');
    if (a) newAchievements.push(a);
  }
  
  return newAchievements;
}
