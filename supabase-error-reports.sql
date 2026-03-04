-- 錯題回報表
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  question_content TEXT,
  current_answer TEXT,
  error_type TEXT NOT NULL,
  correct_answer TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_question_id ON error_reports(question_id);

-- RLS 政策
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- 允許匿名用戶新增回報
CREATE POLICY "Anyone can create error reports" ON error_reports
  FOR INSERT TO anon
  WITH CHECK (true);

-- 允許匿名用戶讀取（後台用）
CREATE POLICY "Anyone can read error reports" ON error_reports
  FOR SELECT TO anon
  USING (true);

-- 允許更新（後台用）
CREATE POLICY "Anyone can update error reports" ON error_reports
  FOR UPDATE TO anon
  USING (true);
