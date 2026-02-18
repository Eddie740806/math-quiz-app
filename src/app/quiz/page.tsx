'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, recordAnswer, addToLeaderboard, checkAndUnlockAchievements, getUserProgress, Achievement, User, heartbeat, applyFontSize, isBookmarked, toggleBookmark } from '@/lib/storage';
import { initTheme } from '@/lib/theme';
import { playCorrectSound, playWrongSound, playStreakSound, playAchievementSound, playCompleteSound } from '@/lib/sounds';
import { QuestionImage, hasImage } from '@/components/QuestionImage';
import questionsData from '@/data/questions.json';

interface Question {
  id: string;
  grade: number;
  content: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: string;
  source: string;
  explanation?: string;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grade = parseInt(searchParams.get('grade') || '5');
  const countParam = parseInt(searchParams.get('count') || '0');
  const difficultyParam = searchParams.get('difficulty') || '';
  const quizName = searchParams.get('name') || '';
  const categoriesParam = searchParams.get('categories') || '';
  
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionCount, setQuestionCount] = useState(countParam || 0);
  const [difficulty, setDifficulty] = useState(difficultyParam || '');
  const [showCountSelector, setShowCountSelector] = useState(countParam === 0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showComboEffect, setShowComboEffect] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [bookmarked, setBookmarked] = useState(false);

  // 計時器
  useEffect(() => {
    if (showCountSelector || quizFinished) return;
    
    const timer = setInterval(() => {
      setCurrentQuestionTime(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [questionStartTime, showCountSelector, quizFinished]);

  // Heartbeat for online tracking (every 60 seconds)
  useEffect(() => {
    if (!user) return;
    
    // Initial heartbeat
    heartbeat();
    
    const interval = setInterval(() => {
      heartbeat();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    initTheme();
    applyFontSize();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    if (questionCount > 0) {
      // 篩選題目並隨機排序
      let filtered = questionsData.questions.filter((q: Question) => q.grade === grade);
      
      // 難度篩選
      if (difficulty === 'easy') {
        filtered = filtered.filter((q: Question) => q.difficulty === 'medium' || q.difficulty === 'easy');
      } else if (difficulty === 'hard') {
        filtered = filtered.filter((q: Question) => q.difficulty === 'hard');
      }
      
      // 題型篩選
      if (categoriesParam) {
        const allowedCategories = categoriesParam.split(',');
        filtered = filtered.filter((q: Question) => allowedCategories.includes(q.category));
      }
      
      const gradeQuestions = filtered
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
      
      setQuestions(gradeQuestions);
      setShowCountSelector(false);
      
      // 檢查第一題的收藏狀態
      if (currentUser && gradeQuestions[0]) {
        setBookmarked(isBookmarked(currentUser.id, gradeQuestions[0].id));
      }
    }
  }, [grade, router, questionCount, difficulty, categoriesParam]);

  // 儲存排行榜 & 檢查成就（必須在所有條件式 return 之前）
  useEffect(() => {
    const saveResults = async () => {
      if (quizFinished && user && answeredCount > 0) {
        const accuracy = Math.round((score / (answeredCount * 10)) * 100);
        
        // 儲存排行榜（雲端同步）
        await addToLeaderboard({
          username: user.username,
          score,
          accuracy,
          maxCombo,
          totalQuestions: questions.length,
          date: new Date().toISOString(),
          grade
        });
        
        // 檢查成就
        const progress = getUserProgress(user.id);
        const avgTime = answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;
        const isPerfect = accuracy === 100 && answeredCount >= 10;
        
        const achievements = checkAndUnlockAchievements(user.id, {
          totalAnswered: progress.totalAnswered,
          correctCount: progress.correctCount,
          streak: progress.streak || 0,
          maxCombo,
          avgTime,
          isPerfect
        });
        
        if (achievements.length > 0) {
          setNewAchievements(achievements);
          playAchievementSound();
        } else if (quizFinished) {
          playCompleteSound();
        }
      }
    };
    
    saveResults();
  }, [quizFinished, user, score, answeredCount, maxCombo, questions.length, grade, totalTime]);

  const startWithCount = (count: number) => {
    setQuestionCount(count);
    setShowCountSelector(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !user || !currentQuestion) return;
    
    // 記錄這題花的時間
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000);
    setTotalTime(prev => prev + questionTime);
    
    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);
    setAnsweredCount(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 10);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }
      // 連擊特效與音效
      if (newCombo >= 3) {
        setShowComboEffect(true);
        playStreakSound(newCombo);
        setTimeout(() => setShowComboEffect(false), 1000);
      } else {
        playCorrectSound();
      }
    } else {
      setCombo(0);
      playWrongSound();
      // 記錄錯題
      setWrongQuestions(prev => [...prev, currentQuestion]);
    }
    
    // 記錄答案（含分類和時間）
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    recordAnswer(user.id, currentQuestion.id, selectedAnswer, currentQuestion.answer, currentQuestion.category, timeSpent);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setQuizFinished(true);
      return;
    }
    
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionStartTime(Date.now());
    setCurrentQuestionTime(0);
    
    // 檢查下一題的收藏狀態
    if (user && questions[nextIndex]) {
      setBookmarked(isBookmarked(user.id, questions[nextIndex].id));
    }
  };
  
  const handleToggleBookmark = () => {
    if (!user || !currentQuestion) return;
    const newState = toggleBookmark(user.id, currentQuestion.id);
    setBookmarked(newState);
  };

  const handleSkip = () => {
    setTotalTime(prev => prev + Math.floor((Date.now() - questionStartTime) / 1000));
    setSkippedCount(prev => prev + 1);
    setCombo(0);
    handleNext();
  };

  const handleExit = () => {
    if (answeredCount > 0) {
      if (confirm(`已完成 ${answeredCount} 題，確定要離開嗎？\n進度會保留在錯題本中。`)) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  const handleRestart = () => {
    // 重新隨機排序題目
    const gradeQuestions = questionsData.questions
      .filter((q: Question) => q.grade === grade)
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    
    setQuestions(gradeQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredCount(0);
    setQuizFinished(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  // 選擇題數和難度
  if (showCountSelector) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{grade === 5 ? '5️⃣' : '6️⃣'}</div>
            <h1 className="text-2xl font-bold text-gray-800">{grade} 年級數學</h1>
            <p className="text-gray-500">選擇難度和題數</p>
          </div>

          {/* 難度選擇 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">難度</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDifficulty('easy')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                  difficulty === 'easy' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                🌱 基礎
              </button>
              <button
                onClick={() => setDifficulty('')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                  difficulty === '' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                📚 綜合
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                  difficulty === 'hard' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔥 挑戰
              </button>
            </div>
          </div>

          {/* 題數選擇 */}
          <div className="space-y-3">
            {[10, 20, 30, 50].map((count) => (
              <button
                key={count}
                onClick={() => startWithCount(count)}
                className="w-full py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 text-blue-700 rounded-xl font-medium text-lg transition"
              >
                {count} 題 {count === 10 ? '（快速）' : count === 50 ? '（馬拉松）' : ''}
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 transition"
          >
            ← 返回首頁
          </button>
        </div>
      </main>
    );
  }

  if (quizFinished) {
    const accuracy = answeredCount > 0 ? Math.round((score / (answeredCount * 10)) * 100) : 0;
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {accuracy >= 80 ? '太棒了！' : accuracy >= 60 ? '做得不錯！' : '繼續加油！'}
          </h1>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-500">{score}</div>
                <div className="text-gray-500 text-sm">得分</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500">{accuracy}%</div>
                <div className="text-gray-500 text-sm">正確率</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-500">{maxCombo}</div>
                <div className="text-gray-500 text-sm">最高連擊</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
              <div className="mb-2">
                ⏱️ 總用時：{Math.floor(totalTime / 60)}分{totalTime % 60}秒
                {answeredCount > 0 && (
                  <span className="ml-2">（平均 {Math.round(totalTime / answeredCount)} 秒/題）</span>
                )}
              </div>
              {(wrongQuestions.length > 0 || skippedCount > 0) && (
                <div>
                  {wrongQuestions.length > 0 && <span className="mr-3">❌ 錯 {wrongQuestions.length} 題</span>}
                  {skippedCount > 0 && <span>⏭️ 跳過 {skippedCount} 題</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={handleRestart}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
            >
              再練一次
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              返回首頁
            </button>
          </div>
          
          {/* 新成就通知 */}
          {newAchievements.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
              <div className="text-center mb-2">
                <span className="text-purple-600 font-bold">🎉 解鎖新成就！</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {newAchievements.map((a) => (
                  <div key={a.id} className="bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                    <div className="text-2xl">{a.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{a.name}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/achievements')}
                className="w-full mt-3 py-2 text-purple-600 hover:text-purple-800 text-sm font-medium transition"
              >
                查看全部成就 →
              </button>
            </div>
          )}

          {/* 錯題複習 */}
          {wrongQuestions.length > 0 && (
            <button
              onClick={() => router.push('/wrong-answers')}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition mb-3"
            >
              📝 查看錯題（{wrongQuestions.length} 題）
            </button>
          )}
          
          {/* 分享按鈕 */}
          <button
            onClick={() => {
              const timeStr = `${Math.floor(totalTime / 60)}分${totalTime % 60}秒`;
              const text = `📐 國小數學題庫\n${grade}年級 ${questions.length}題\n✅ 得分：${score}\n📊 正確率：${accuracy}%\n🔥 最高連擊：${maxCombo}\n⏱️ 用時：${timeStr}`;
              navigator.clipboard.writeText(text);
              alert('成績已複製！可以貼給爸媽看 📋');
            }}
            className="w-full py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition"
          >
            📤 分享成績
          </button>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">載入題目中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頂部狀態 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleExit}
            className="text-white hover:text-blue-200 transition"
          >
            ← 返回
          </button>
          <div className="text-white text-center">
            <div className="font-bold">{grade} 年級數學</div>
            <div className="text-sm opacity-80">⏱️ {currentQuestionTime}秒</div>
          </div>
          <div className="text-white font-bold flex items-center gap-3">
            {combo >= 3 && (
              <span className={`bg-orange-500 px-2 py-1 rounded-full text-sm ${showComboEffect ? 'animate-bounce' : ''}`}>
                🔥 {combo} 連擊
              </span>
            )}
            <span>得分: {score}</span>
          </div>
        </div>

        {/* 進度條 */}
        <div className="bg-white/20 rounded-full h-2 mb-6">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* 題目卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                {currentQuestion.category}
              </span>
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-full transition ${
                  bookmarked 
                    ? 'bg-yellow-100 text-yellow-500' 
                    : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'
                }`}
                title={bookmarked ? '取消收藏' : '收藏題目'}
              >
                {bookmarked ? '⭐' : '☆'}
              </button>
            </div>
            <span className="text-gray-400 text-sm">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <h2 className="text-xl font-medium text-gray-800 mb-4 leading-relaxed">
            {currentQuestion.content}
          </h2>
          
          {/* 如果題目需要圖形，顯示 SVG 圖 */}
          {hasImage(currentQuestion.id) && (
            <QuestionImage questionId={currentQuestion.id} />
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition ";
              
              if (showResult) {
                if (index === currentQuestion.answer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700";
                } else if (index === selectedAnswer && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += "border-gray-200 text-gray-400";
                }
              } else {
                if (index === selectedAnswer) {
                  buttonClass += "border-blue-500 bg-blue-50 text-blue-700";
                } else {
                  buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* 提交/下一題按鈕 */}
        {!showResult ? (
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-lg transition"
            >
              確認答案
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl font-medium transition"
            >
              跳過此題 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl text-center transform transition-all duration-300 ${isCorrect ? 'bg-green-100 text-green-700 scale-105' : 'bg-red-100 text-red-700'}`}>
              <div className="text-2xl mb-1">{isCorrect ? '🎉' : '💪'}</div>
              <div className="font-medium">
                {isCorrect ? '回答正確！' : `答錯了！正確答案是 ${String.fromCharCode(65 + currentQuestion.answer)}`}
              </div>
              {isCorrect && combo >= 3 && (
                <div className="text-orange-500 text-sm mt-1 font-bold animate-bounce">🔥 {combo} 連擊！太強了！</div>
              )}
              {!isCorrect && (
                <div className="text-red-400 text-sm mt-1">
                  {wrongQuestions.length === 0 
                    ? '沒關係，錯誤是學習的機會！' 
                    : wrongQuestions.length < 3
                    ? '加油！看看解題思路，下次一定會！'
                    : '別灰心！練習越多，進步越快！'}
                </div>
              )}
            </div>
            
            {/* 詳解區塊 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">💡</span>
                <span className="font-medium text-yellow-800">解題思路</span>
              </div>
              {currentQuestion.explanation ? (
                <p className="text-yellow-900 leading-relaxed">{currentQuestion.explanation}</p>
              ) : (
                <p className="text-yellow-700 text-sm">
                  正確答案是 <strong>{currentQuestion.options[currentQuestion.answer]}</strong>
                  <br />
                  <span className="text-yellow-600">（此題暫無詳細解析，可請老師或家長協助說明）</span>
                </p>
              )}
            </div>
            
            <button
              onClick={handleNext}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-lg transition"
            >
              {currentIndex >= questions.length - 1 ? '完成練習' : '下一題'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">載入中...</div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
