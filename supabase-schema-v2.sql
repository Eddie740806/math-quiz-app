-- 支點教育數學題庫 - Supabase Schema V2
-- 完整版：含雲端同步、排行榜、家長/班級功能

-- ========================================
-- 1. 用戶表（擴充 role 和 password_hash）
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ========================================
-- 2. 用戶進度表（雲端同步核心）
-- ========================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_answered INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  category_stats JSONB DEFAULT '[]',
  wrong_records JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON user_progress(updated_at);

-- ========================================
-- 3. 排行榜表
-- ========================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  grade INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_grade ON leaderboard(grade);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at);

-- ========================================
-- 4. 家長-孩子綁定表
-- ========================================
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_id);

-- ========================================
-- 5. 班級表
-- ========================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  grade INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_invite_code ON classes(invite_code);

-- ========================================
-- 6. 班級成員表
-- ========================================
CREATE TABLE IF NOT EXISTS class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_class ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON class_members(user_id);

-- ========================================
-- 啟用 RLS 並設定政策
-- ========================================
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

-- 允許匿名用戶讀寫（因為我們用 anon key）
CREATE POLICY "Allow all for user_progress" ON user_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for leaderboard" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for parent_children" ON parent_children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for class_members" ON class_members FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 啟用 Realtime
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard;
