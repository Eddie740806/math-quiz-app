// 題目類型
export interface Question {
  id: string;
  grade: number; // 5 或 6
  content: string; // 題目文字
  imageUrl?: string; // 題目圖片（如果有）
  options: string[]; // 選項 A B C D
  answer: number; // 正確答案 index (0-3)
  category: string; // 單元類別
  difficulty: 'easy' | 'medium' | 'hard';
  source: string; // 來源（學校/出版社）
}

// 用戶類型
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// 答題記錄
export interface AnswerRecord {
  id: string;
  odiserId: string;
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  answeredAt: string;
}

// 錯題記錄
export interface WrongAnswer {
  questionId: string;
  wrongCount: number;
  lastWrongAt: string;
  reviewed: boolean;
}

// 用戶進度
export interface UserProgress {
  odiserId: string;
  totalAnswered: number;
  correctCount: number;
  wrongAnswers: WrongAnswer[];
  lastActiveAt: string;
}
