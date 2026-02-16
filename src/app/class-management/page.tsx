'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  createClass,
  getTeacherClasses,
  getClassMembers,
  User,
  ClassInfo,
  UserProgress,
  applyFontSize
} from '@/lib/storage';
import { initTheme } from '@/lib/theme';

interface ClassMember {
  username: string;
  progress: UserProgress | null;
}

export default function ClassManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  // 建立班級表單
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(5);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    initTheme();
    applyFontSize();
    
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'teacher') {
      router.push('/');
      return;
    }
    
    setCurrentUserState(user);
    loadClasses(user.username);
  }, [router]);

  const loadClasses = async (teacherUsername: string) => {
    setLoading(true);
    try {
      const classList = await getTeacherClasses(teacherUsername);
      setClasses(classList);
    } catch (err) {
      console.error('Load classes error:', err);
    }
    setLoading(false);
  };

  const handleCreateClass = async () => {
    if (!currentUser || !newClassName.trim()) return;
    
    setCreateLoading(true);
    setCreateMessage(null);
    
    const result = await createClass(
      currentUser.username,
      newClassName.trim(),
      newClassDesc.trim(),
      newClassGrade
    );
    
    if (result.success) {
      setCreateMessage({ type: 'success', text: `班級建立成功！邀請碼：${result.classInfo?.inviteCode}` });
      setNewClassName('');
      setNewClassDesc('');
      setShowCreateForm(false);
      await loadClasses(currentUser.username);
    } else {
      setCreateMessage({ type: 'error', text: result.message });
    }
    
    setCreateLoading(false);
  };

  const handleSelectClass = async (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setMembersLoading(true);
    
    try {
      const members = await getClassMembers(classInfo.id);
      setClassMembers(members);
    } catch (err) {
      console.error('Load members error:', err);
    }
    
    setMembersLoading(false);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`邀請碼已複製：${code}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 頂部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-green-200 transition"
          >
            ← 返回首頁
          </button>
          <h1 className="text-white font-bold text-xl">👨‍🏫 班級管理</h1>
          <div className="text-white text-sm">
            {currentUser?.username}
          </div>
        </div>

        {/* 建立班級按鈕 */}
        {!showCreateForm && !selectedClass && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-white rounded-2xl shadow-xl p-4 mb-6 text-center hover:shadow-2xl transition"
          >
            <span className="text-2xl">➕</span>
            <span className="ml-2 font-bold text-gray-800">建立新班級</span>
          </button>
        )}

        {/* 建立班級表單 */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">建立新班級</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  班級名稱
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="例：五年一班、暑期數學班"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  班級說明（選填）
                </label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="例：週三晚上 7:00 上課"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年級
                </label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value={5}>五年級</option>
                  <option value={6}>六年級</option>
                </select>
              </div>
              
              {createMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm ${
                  createMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                  {createMessage.text}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim() || createLoading}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                >
                  {createLoading ? '建立中...' : '建立班級'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 班級詳情 */}
        {selectedClass && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedClass(null);
                setClassMembers([]);
              }}
              className="text-white hover:text-green-200 transition mb-2"
            >
              ← 返回班級列表
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedClass.name}</h2>
                  {selectedClass.description && (
                    <p className="text-gray-500 text-sm">{selectedClass.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">邀請碼</div>
                  <button
                    onClick={() => copyInviteCode(selectedClass.inviteCode)}
                    className="text-xl font-bold text-green-600 hover:text-green-700"
                  >
                    {selectedClass.inviteCode} 📋
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 text-sm text-gray-500">
                <span>👥 {selectedClass.memberCount || classMembers.length} 位學生</span>
                <span>📚 {selectedClass.grade}年級</span>
                <span>📅 {new Date(selectedClass.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* 學生列表 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">學生列表</h3>
              
              {membersLoading ? (
                <p className="text-gray-500">載入中...</p>
              ) : classMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-gray-500">還沒有學生加入</p>
                  <p className="text-sm text-gray-400 mt-2">
                    請將邀請碼 <strong>{selectedClass.inviteCode}</strong> 分享給學生
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classMembers.map((member, index) => {
                    const accuracy = member.progress && member.progress.totalAnswered > 0
                      ? Math.round(member.progress.correctCount / member.progress.totalAnswered * 100)
                      : 0;
                    
                    return (
                      <div key={member.username} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{member.username}</div>
                          {member.progress && (
                            <div className="text-sm text-gray-500">
                              {member.progress.totalAnswered} 題 · {accuracy}% 正確率
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {member.progress ? (
                            <>
                              <div className="text-lg font-bold text-green-600">{accuracy}%</div>
                              <div className="text-xs text-gray-400">🔥 {member.progress.streak || 1}</div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">尚無資料</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* 出卷功能 */}
            <button
              onClick={() => router.push(`/create-quiz?classId=${selectedClass.id}`)}
              className="w-full bg-white rounded-2xl shadow-xl p-4 text-center hover:shadow-2xl transition"
            >
              <span className="text-2xl">📝</span>
              <span className="ml-2 font-bold text-gray-800">為班級出卷</span>
            </button>
          </div>
        )}

        {/* 班級列表 */}
        {!selectedClass && !showCreateForm && (
          <div className="space-y-4">
            {classes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">🏫</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">還沒有班級</h2>
                <p className="text-gray-500">點擊上方「建立新班級」開始</p>
              </div>
            ) : (
              <>
                <h2 className="text-white font-bold text-lg">我的班級 ({classes.length})</h2>
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
                        {cls.description && (
                          <p className="text-gray-500 text-sm">{cls.description}</p>
                        )}
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>👥 {cls.memberCount || 0} 人</span>
                      <span>📚 {cls.grade}年級</span>
                      <span>🔑 {cls.inviteCode}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
