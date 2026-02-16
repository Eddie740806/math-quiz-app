# 數學題庫系統測試日誌

**最後更新：** 2026-02-16 18:45
**測試網址：** https://math-quiz-app-hazel.vercel.app
**專案位置：** ~/clawd/projects/math-quiz-app

---

## 7 大改進完成狀態

| # | 功能 | 狀態 | 說明 |
|---|------|------|------|
| 1 | 排行榜跨設備同步 | ✅ 完成 | 使用 Supabase leaderboard 表 |
| 2 | 家長專屬帳號 | ✅ 完成 | 新增 /parent-dashboard 頁面 |
| 3 | 字體大小調整 | ✅ 完成 | 在 /settings 可選 小/中/大/特大 |
| 4 | 班級管理功能 | ✅ 完成 | 新增 /class-management 頁面 |
| 5 | 新手引導 tour | ✅ 完成 | Tour 組件，首次使用顯示 |
| 6 | 雲端同步功能 | ✅ 完成 | 進度同步到 user_progress 表 |
| 7 | 密碼加密存儲 | ✅ 完成 | SHA-256 hash，舊用戶自動遷移 |

---

## ⚠️ 重要：需要執行 Supabase SQL

**新增的功能需要以下資料表，請在 Supabase Dashboard > SQL Editor 執行：**

檔案位置：`supabase-schema-v2.sql`

```sql
-- 1. 排行榜表
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

-- 2. 更新用戶表
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. 家長-孩子綁定表
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- 4. 班級表
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

-- 5. 班級成員表
CREATE TABLE IF NOT EXISTS class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

-- 6. 用戶進度表
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

-- 7. RLS 策略
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for leaderboard" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for parent_children" ON parent_children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for class_members" ON class_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for user_progress" ON user_progress FOR ALL USING (true) WITH CHECK (true);
```

---

## 新增頁面

### /settings - 設定頁面
- 字體大小選擇（小/中/大/特大）
- 主題切換（淺色/深色）
- 加入班級（輸入邀請碼）
- 重置新手引導
- 帳號資訊

### /parent-dashboard - 家長專區
- 綁定孩子帳號
- 查看所有孩子的學習進度
- 弱點分析
- 成就徽章
- 錯題本統計

### /class-management - 班級管理
- 建立班級
- 生成邀請碼
- 查看學生列表
- 查看學生進度
- 為班級出卷

---

## 新增檔案

| 檔案 | 說明 |
|------|------|
| `src/lib/crypto.ts` | 密碼加密工具（SHA-256） |
| `src/components/Tour.tsx` | 新手引導組件 |
| `src/app/settings/page.tsx` | 設定頁面 |
| `src/app/parent-dashboard/page.tsx` | 家長專區 |
| `src/app/class-management/page.tsx` | 班級管理 |
| `supabase-schema-v2.sql` | 新增資料表 SQL |

---

## 功能詳細說明

### 1. 排行榜跨設備同步
- 排行榜數據同時存儲在 localStorage 和 Supabase
- 讀取時優先使用雲端數據
- 顯示「☁️ 雲端排行榜」或「💾 本地排行榜」標記

### 2. 家長專屬帳號
- 註冊時可選擇身份：學生/家長/老師
- 家長登入後自動導向 /parent-dashboard
- 可綁定多個孩子帳號
- 綁定後可查看孩子的詳細學習數據

### 3. 字體大小調整
- 四種大小：小(14px)、中(16px)、大(18px)、特大(22px)
- 存儲在 localStorage
- 全站生效

### 4. 班級管理功能
- 老師可建立班級，自動生成 6 位邀請碼
- 學生在設定頁面輸入邀請碼加入班級
- 老師可查看班級所有學生的進度
- 可針對班級出卷

### 5. 新手引導 tour
- 6 個步驟的引導教學
- 使用 tooltip 指引主要功能
- 可跳過或完成
- 完成後記錄到 localStorage
- 可在設定中重置

### 6. 雲端同步功能
- 用戶進度（答題數、正確數、連續天數等）同步到 Supabase
- 登入時自動從雲端拉取數據
- 每 10 題自動同步一次
- 換設備也能繼續

### 7. 密碼加密存儲
- 新用戶密碼使用 SHA-256 hash
- 舊用戶下次登入時自動遷移到 hash
- 本地和雲端都存儲 hash

---

## 部署記錄

- **2026-02-16 18:50** - 部署 7 大改進到 Vercel
- **Commit:** feat: 完成 7 大改進

---

## 測試清單

### 基本功能 ✅
- [x] 學生註冊/登入
- [x] 家長註冊/登入
- [x] 老師註冊/登入
- [x] 快速開始練習
- [x] 自訂出卷

### 新功能測試（需要執行 SQL 後）
- [ ] 排行榜雲端同步
- [ ] 家長綁定孩子
- [ ] 建立班級
- [ ] 學生加入班級
- [ ] 查看班級進度
- [ ] 字體大小調整
- [ ] 新手引導 tour
- [ ] 密碼遷移

---

## 下一步

1. **執行 SQL** - 在 Supabase Dashboard 執行 `supabase-schema-v2.sql`
2. **功能測試** - 測試所有新功能
3. **Bug 修復** - 發現問題立即修復
