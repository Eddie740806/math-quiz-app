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
}

export interface UserProgress {
  odiserId: string;
  totalAnswered: number;
  correctCount: number;
  wrongRecords: WrongRecord[];
  lastActiveAt: string;
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

export function recordAnswer(odiserId: string, questionId: string, userAnswer: number, correctAnswer: number) {
  const progress = getUserProgress(odiserId);
  const isCorrect = userAnswer === correctAnswer;
  
  progress.totalAnswered++;
  progress.lastActiveAt = new Date().toISOString();
  
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
    } else {
      progress.wrongRecords.push({
        questionId,
        wrongCount: 1,
        lastWrongAt: new Date().toISOString(),
        userAnswer
      });
    }
  }
  
  saveUserProgress(progress);
  return isCorrect;
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
