-- 支點教育數學題庫 - Supabase Schema v2
-- 新增：排行榜、家長帳號、班級管理、雲端同步
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本

-- ========================================
-- 1. 排行榜表
-- ========================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  max_combo INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  grade INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_grade ON leaderboard(grade);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- ========================================
-- 2. 更新用戶表 - 增加角色和密碼 hash
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- ========================================
-- 3. 家長-孩子綁定表
-- ========================================
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_id);

-- ========================================
-- 4. 班級表
-- ========================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  grade INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_invite_code ON classes(invite_code);

-- ========================================
-- 5. 班級成員表
-- ========================================
CREATE TABLE IF NOT EXISTS class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_class ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON class_members(user_id);

-- ========================================
-- 6. 用戶進度表（雲端同步）
-- ========================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_answered INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  category_stats JSONB DEFAULT '[]'::jsonb,
  wrong_records JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);

-- ========================================
-- 7. RLS 策略
-- ========================================
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 允許匿名用戶讀寫（因為我們用 anon key）
CREATE POLICY "Allow all for leaderboard" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for parent_children" ON parent_children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for class_members" ON class_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for user_progress" ON user_progress FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 8. Realtime 訂閱
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE classes;
ALTER PUBLICATION supabase_realtime ADD TABLE class_members;
