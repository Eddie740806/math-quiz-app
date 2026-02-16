'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, setCurrentUser, UserRole, applyFontSize } from '@/lib/storage';
import { initTheme } from '@/lib/theme';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState(5);
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initTheme();
    applyFontSize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 驗證
    if (!username || !password || !confirmPassword) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('密碼至少需要 4 個字元');
      setLoading(false);
      return;
    }

    if (username.length < 2) {
      setError('用戶名至少需要 2 個字元');
      setLoading(false);
      return;
    }

    const result = await registerUser(username, password, grade, role);
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
      // 儲存年級到 localStorage
      localStorage.setItem('math_quiz_grade', grade.toString());
      
      // 根據角色導向不同頁面
      if (role === 'parent') {
        router.push('/parent-dashboard');
      } else if (role === 'teacher') {
        router.push('/class-management');
      } else {
        router.push('/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const roleOptions: { value: UserRole; label: string; icon: string; desc: string }[] = [
    { value: 'student', label: '我是學生', icon: '👨‍🎓', desc: '練習數學、查看成績' },
    { value: 'parent', label: '我是家長', icon: '👨‍👩‍👧', desc: '查看孩子學習進度' },
    { value: 'teacher', label: '我是老師', icon: '👨‍🏫', desc: '管理班級、出卷' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📐</div>
          <h1 className="text-2xl font-bold text-gray-800">註冊帳號</h1>
          <p className="text-gray-500">建立帳號開始你的數學練習之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 角色選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              我的身份
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-lg border-2 transition text-center ${
                    role === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {roleOptions.find(r => r.value === role)?.desc}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用戶名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="請輸入用戶名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="請輸入密碼（至少 4 個字元）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              確認密碼
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="請再次輸入密碼"
            />
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年級
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value={5}>五年級</option>
                <option value={6}>六年級</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          已經有帳號？{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            立即登入
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← 返回首頁
          </Link>
        </div>
      </div>
    </main>
  );
}
