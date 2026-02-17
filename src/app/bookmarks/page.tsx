'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getBookmarks, removeBookmark, applyFontSize, BookmarkedQuestion, User } from '@/lib/storage';
import { initTheme } from '@/lib/theme';
import questionsData from '@/data/questions.json';

interface Question {
  id: string;
  grade: number;
  content: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: string;
  explanation?: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<(BookmarkedQuestion & { question: Question })[]>([]);
  const [showAnswer, setShowAnswer] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initTheme();
    applyFontSize();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    loadBookmarks(currentUser.id);
  }, [router]);

  const loadBookmarks = (userId: string) => {
    const bookmarks = getBookmarks(userId);
    const questionsMap = new Map(questionsData.questions.map((q: Question) => [q.id, q]));
    
    const enrichedBookmarks = bookmarks
      .map(b => {
        const question = questionsMap.get(b.questionId);
        return question ? { ...b, question } : null;
      })
      .filter((b): b is (BookmarkedQuestion & { question: Question }) => b !== null)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    
    setBookmarkedQuestions(enrichedBookmarks);
    setLoading(false);
  };

  const handleRemoveBookmark = (questionId: string) => {
    if (!user) return;
    removeBookmark(user.id, questionId);
    setBookmarkedQuestions(prev => prev.filter(b => b.questionId !== questionId));
  };

  const toggleAnswer = (questionId: string) => {
    setShowAnswer(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const startPractice = () => {
    if (bookmarkedQuestions.length === 0) return;
    // 將收藏題目的 ID 傳給練習頁面
    const ids = bookmarkedQuestions.map(b => b.questionId).join(',');
    router.push(`/quiz?grade=5&count=${bookmarkedQuestions.length}&ids=${ids}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-600">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-yellow-100 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">⭐ 我的收藏</h1>
          <div className="w-20"></div>
        </div>

        {/* 統計 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已收藏</p>
              <p className="text-3xl font-bold text-yellow-600">{bookmarkedQuestions.length} 題</p>
            </div>
            {bookmarkedQuestions.length > 0 && (
              <button
                onClick={startPractice}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition"
              >
                📝 開始複習
              </button>
            )}
          </div>
        </div>

        {/* 收藏列表 */}
        {bookmarkedQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">還沒有收藏任何題目</h2>
            <p className="text-gray-500 mb-4">
              在練習時點擊 ☆ 可以收藏題目，方便之後複習
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
            >
              去做題
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedQuestions.map((item) => (
              <div key={item.questionId} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                      {item.question.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.question.difficulty === 'hard' 
                        ? 'bg-red-100 text-red-600' 
                        : item.question.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {item.question.difficulty === 'hard' ? '難' : item.question.difficulty === 'medium' ? '中' : '易'}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {item.question.grade}年級
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(item.questionId)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="取消收藏"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-800 mb-4 leading-relaxed">
                  {item.question.content}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {item.question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-sm ${
                        showAnswer[item.questionId] && idx === item.question.answer
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleAnswer(item.questionId)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium transition"
                  >
                    {showAnswer[item.questionId] ? '🙈 隱藏答案' : '👀 查看答案'}
                  </button>
                  <span className="text-gray-400 text-xs">
                    收藏於 {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </div>

                {showAnswer[item.questionId] && item.question.explanation && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <span className="text-yellow-600 text-sm font-medium">💡 解題思路：</span>
                      <p className="text-yellow-800 text-sm mt-1">{item.question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
