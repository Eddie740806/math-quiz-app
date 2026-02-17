#!/usr/bin/env python3
"""
用戶體驗深度測試 - 檢查所有頁面和功能
"""
import os
import re

print("=" * 50)
print("🧪 用戶體驗深度測試")
print("=" * 50)

bugs = []
warnings = []

# 檢查所有頁面文件
pages = [
    "src/app/page.tsx",           # 首頁
    "src/app/login/page.tsx",      # 登入
    "src/app/register/page.tsx",   # 註冊
    "src/app/quiz/page.tsx",       # 答題
    "src/app/wrong-answers/page.tsx", # 錯題本
    "src/app/achievements/page.tsx",  # 成就
    "src/app/leaderboard/page.tsx",   # 排行榜
    "src/app/settings/page.tsx",      # 設定
    "src/app/create-quiz/page.tsx",   # 出卷
    "src/app/parent-view/page.tsx",   # 家長查看
    "src/app/bookmarks/page.tsx",     # 收藏
]

print("\n## 1. 頁面完整性檢查")
for page in pages:
    if os.path.exists(page):
        with open(page, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 檢查基本結構
        has_export = "export default" in content
        has_use_client = "'use client'" in content
        has_router = "useRouter" in content
        
        if not has_export:
            bugs.append(f"{page}: 缺少 export default")
        if not has_use_client:
            bugs.append(f"{page}: 缺少 'use client'")
        
        print(f"  ✅ {page.split('/')[-2]}")
    else:
        bugs.append(f"頁面不存在: {page}")
        print(f"  ❌ {page} 不存在!")

# 檢查 storage.ts 功能完整性
print("\n## 2. 核心功能檢查 (storage.ts)")
with open("src/lib/storage.ts", "r", encoding="utf-8") as f:
    storage = f.read()

required_functions = [
    "getCurrentUser",
    "getUserProgress",
    "recordAnswer",
    "getWrongRecords",
    "addToLeaderboard",
    "getLeaderboard",
    "checkAndUnlockAchievements",
    "getWeakCategories",
    "getTodayAnsweredCount",
    "getBookmarks",
    "toggleBookmark",
]

for func in required_functions:
    if f"export function {func}" in storage:
        print(f"  ✅ {func}")
    else:
        bugs.append(f"缺少函數: {func}")
        print(f"  ❌ {func} 缺失!")

# 檢查音效功能
print("\n## 3. 音效系統檢查")
if os.path.exists("src/lib/sounds.ts"):
    with open("src/lib/sounds.ts", "r", encoding="utf-8") as f:
        sounds = f.read()
    
    sound_functions = ["playCorrectSound", "playWrongSound", "playStreakSound", "playAchievementSound"]
    for func in sound_functions:
        if f"export function {func}" in sounds:
            print(f"  ✅ {func}")
        else:
            warnings.append(f"音效函數缺失: {func}")
            print(f"  ⚠️ {func} 缺失")
else:
    bugs.append("sounds.ts 不存在")
    print("  ❌ sounds.ts 不存在!")

# 檢查主題系統
print("\n## 4. 主題系統檢查")
if os.path.exists("src/lib/theme.ts"):
    with open("src/lib/theme.ts", "r", encoding="utf-8") as f:
        theme = f.read()
    
    if "initTheme" in theme and "toggleTheme" in theme:
        print("  ✅ 深色/淺色模式支援")
    else:
        warnings.append("主題切換功能不完整")
else:
    warnings.append("theme.ts 不存在")

# 檢查 quiz 頁面關鍵功能
print("\n## 5. 答題頁面功能檢查")
with open("src/app/quiz/page.tsx", "r", encoding="utf-8") as f:
    quiz = f.read()

quiz_features = {
    "連擊系統": "combo" in quiz,
    "計時器": "currentQuestionTime" in quiz or "questionStartTime" in quiz,
    "詳解顯示": "explanation" in quiz,
    "跳過功能": "handleSkip" in quiz,
    "收藏功能": "toggleBookmark" in quiz or "handleToggleBookmark" in quiz,
    "音效播放": "playCorrectSound" in quiz or "playWrongSound" in quiz,
    "成就解鎖": "checkAndUnlockAchievements" in quiz,
    "錯題記錄": "wrongQuestions" in quiz,
}

for feature, exists in quiz_features.items():
    if exists:
        print(f"  ✅ {feature}")
    else:
        bugs.append(f"答題頁缺少: {feature}")
        print(f"  ❌ {feature}")

# 檢查首頁關鍵功能
print("\n## 6. 首頁功能檢查")
with open("src/app/page.tsx", "r", encoding="utf-8") as f:
    home = f.read()

home_features = {
    "今日目標": "todayCount" in home or "今日目標" in home,
    "連續天數": "streak" in home,
    "弱點分析": "weakCategories" in home,
    "成就計數": "achievementCount" in home,
    "收藏入口": "bookmarks" in home or "bookmarkCount" in home,
    "快速開始": "快速開始" in home or "今日 10 題" in home,
    "深色模式": "isDark" in home or "toggleTheme" in home,
}

for feature, exists in home_features.items():
    if exists:
        print(f"  ✅ {feature}")
    else:
        warnings.append(f"首頁建議添加: {feature}")
        print(f"  ⚠️ {feature}")

# 總結
print("\n" + "=" * 50)
print("📋 測試總結")
print("=" * 50)

print(f"\n🐛 Bug 數量: {len(bugs)}")
if bugs:
    for b in bugs:
        print(f"  ❌ {b}")

print(f"\n⚠️ 警告數量: {len(warnings)}")
if warnings:
    for w in warnings:
        print(f"  ⚠️ {w}")

if not bugs and not warnings:
    print("\n🎉 完美通過！0 bug, 0 warning")
elif not bugs:
    print(f"\n✅ 通過！{len(warnings)} 個小建議")
else:
    print(f"\n❌ 需修復 {len(bugs)} 個 bug")
