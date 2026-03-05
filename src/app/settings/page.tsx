'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  getFontSize, 
  setFontSize, 
  FontSize,
  resetTour,
  joinClass,
  applyFontSize,
  User
} from '@/lib/storage';
import { initTheme, getTheme, setTheme } from '@/lib/theme';
import { isSoundEnabled, setSoundEnabled, playCorrectSound } from '@/lib/sounds';

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [classCode, setClassCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    initTheme();
    applyFontSize();
    setCurrentUserState(getCurrentUser());
    setFontSizeState(getFontSize());
    setThemeState(getTheme() as 'light' | 'dark');
    setSoundEnabledState(isSoundEnabled());
  }, []);
  
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    setSoundEnabled(enabled);
    if (enabled) {
      // 播放測試音效
      playCorrectSound();
    }
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSizeState(size);
    setFontSize(size);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  const handleResetTour = () => {
    resetTour();
    // 直接跳轉到首頁並觸發 Tour
    router.push('/');
  };

  const handleJoinClass = async () => {
    if (!currentUser || !classCode.trim()) return;
    
    setJoinLoading(true);
    setJoinMessage(null);
    
    const result = await joinClass(currentUser.username, classCode.trim());
    
    if (result.success) {
      setJoinMessage({ type: 'success', text: result.message });
      setClassCode('');
    } else {
      setJoinMessage({ type: 'error', text: result.message });
    }
    
    setJoinLoading(false);
  };

  const fontSizeOptions: { value: FontSize; label: string; desc: string }[] = [
    { value: 'small', label: '小', desc: '14px' },
    { value: 'medium', label: '中', desc: '16px' },
    { value: 'large', label: '大', desc: '18px' },
    { value: 'xlarge', label: '特大', desc: '22px' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-700 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-gray-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">⚙️ 設定</h1>
          <div className="w-20"></div>
        </div>

        <div className="space-y-4">
          {/* 字體大小 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🔤 字體大小</h2>
            <p className="text-sm text-gray-500 mb-4">調整全站字體大小，方便閱讀</p>
            <div className="grid grid-cols-4 gap-2">
              {fontSizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFontSizeChange(opt.value)}
                  className={`p-3 rounded-lg border-2 transition text-center ${
                    fontSize === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-800" style={{ fontSize: opt.desc }}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              👴 老花眼家長推薦使用「大」或「特大」
            </p>
          </div>

          {/* 主題 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🎨 主題</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-lg border-2 transition ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">☀️</div>
                <div className="font-medium text-gray-800">淺色模式</div>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-lg border-2 transition ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🌙</div>
                <div className="font-medium text-gray-800">深色模式</div>
              </button>
            </div>
          </div>

          {/* 音效 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🔊 音效</h2>
            <p className="text-sm text-gray-500 mb-4">答對答錯時播放音效提示</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSoundToggle(true)}
                className={`p-4 rounded-lg border-2 transition ${
                  soundEnabled
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔔</div>
                <div className="font-medium text-gray-800">開啟音效</div>
              </button>
              <button
                onClick={() => handleSoundToggle(false)}
                className={`p-4 rounded-lg border-2 transition ${
                  !soundEnabled
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔇</div>
                <div className="font-medium text-gray-800">關閉音效</div>
              </button>
            </div>
          </div>

          {/* 加入班級 */}
          {currentUser?.role === 'student' && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🏫 加入班級</h2>
              <p className="text-sm text-gray-500 mb-4">輸入老師提供的邀請碼加入班級</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinClass()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition uppercase"
                  placeholder="輸入邀請碼"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinClass}
                  disabled={!classCode.trim() || joinLoading}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                >
                  {joinLoading ? '...' : '加入'}
                </button>
              </div>
              {joinMessage && (
                <p className={`text-sm mt-2 ${joinMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {joinMessage.text}
                </p>
              )}
            </div>
          )}

          {/* 新手引導 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📚 新手引導</h2>
            <p className="text-sm text-gray-500 mb-4">重新觀看新手引導教學</p>
            <button
              onClick={handleResetTour}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
            >
              重新顯示新手引導
            </button>
          </div>

          {/* 帳號資訊 */}
          {currentUser && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">👤 帳號資訊</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">用戶名</span>
                  <span className="font-medium text-gray-800">{currentUser.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">身份</span>
                  <span className="font-medium text-gray-800">
                    {currentUser.role === 'student' ? '學生 👨‍🎓' : 
                     currentUser.role === 'parent' ? '家長 👨‍👩‍👧' : '老師 👨‍🏫'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">註冊時間</span>
                  <span className="font-medium text-gray-800">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 關於 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">ℹ️ 關於</h2>
            <div className="text-sm text-gray-500 space-y-1">
              <p>國小數學練習平台 ｜ 張可享 林弘恩 湯千儀 楊凱麟 聯合製作</p>
              <p>版本 2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
