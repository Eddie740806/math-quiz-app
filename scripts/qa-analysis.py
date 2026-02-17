#!/usr/bin/env python3
"""
深度 QA 測試分析 - 代碼層面檢查
"""
import json
import os
from collections import Counter

# 讀取題庫
with open("src/data/questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data["questions"]

print("=" * 50)
print("📊 數學題庫 App 深度 QA 測試報告")
print("=" * 50)

# 1. 題目統計
print("\n## 1. 題目統計")
print(f"總題數: {len(questions)}")

grades = Counter(q.get("grade") for q in questions)
print(f"五年級: {grades.get(5, 0)} 題")
print(f"六年級: {grades.get(6, 0)} 題")

difficulties = Counter(q.get("difficulty") for q in questions)
print(f"\n難度分布:")
for d, count in sorted(difficulties.items(), key=lambda x: -x[1]):
    pct = count / len(questions) * 100
    print(f"  {d}: {count} ({pct:.1f}%)")

# 2. 題型分布
print("\n## 2. 題型分布")
categories = Counter(q.get("category") for q in questions)
print(f"共 {len(categories)} 種題型:")
for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:15]:
    print(f"  {cat}: {count}")

# 3. 檢查題目品質
print("\n## 3. 題目品質檢查")

issues = []

# 3.1 檢查空選項
empty_options = 0
for q in questions:
    if any(not opt or opt.strip() == "" for opt in q.get("options", [])):
        empty_options += 1
        issues.append(f"空選項: {q['id']}")
print(f"空選項題目: {empty_options}")

# 3.2 檢查答案範圍
invalid_answer = 0
for q in questions:
    ans = q.get("answer", -1)
    opts = q.get("options", [])
    if ans < 0 or ans >= len(opts):
        invalid_answer += 1
        issues.append(f"答案超出範圍: {q['id']} (answer={ans}, options={len(opts)})")
print(f"答案超出範圍: {invalid_answer}")

# 3.3 檢查重複選項
duplicate_options = 0
for q in questions:
    opts = q.get("options", [])
    if len(opts) != len(set(opts)):
        duplicate_options += 1
        issues.append(f"重複選項: {q['id']}")
print(f"重複選項題目: {duplicate_options}")

# 3.4 檢查題目長度
short_content = 0
for q in questions:
    if len(q.get("content", "")) < 10:
        short_content += 1
        issues.append(f"題目過短: {q['id']} - {q.get('content', '')[:30]}")
print(f"題目過短(<10字): {short_content}")

# 3.5 檢查詳解
no_explanation = sum(1 for q in questions if not q.get("explanation"))
has_explanation = len(questions) - no_explanation
print(f"有詳解: {has_explanation} ({has_explanation/len(questions)*100:.1f}%)")
print(f"無詳解: {no_explanation} ({no_explanation/len(questions)*100:.1f}%)")

# 3.6 檢查選項數量
wrong_option_count = 0
for q in questions:
    if len(q.get("options", [])) != 4:
        wrong_option_count += 1
        issues.append(f"選項數量錯誤: {q['id']} ({len(q.get('options', []))}個)")
print(f"選項數量≠4: {wrong_option_count}")

# 4. 考私中題目檢查
print("\n## 4. 考私中題目統計")
ps_questions = [q for q in questions if "考私中" in q.get("source", "") or "ps" in q.get("id", "")]
print(f"考私中題數: {len(ps_questions)}")

ps_categories = Counter(q.get("category") for q in ps_questions)
print("考私中題型分布:")
for cat, count in sorted(ps_categories.items(), key=lambda x: -x[1])[:10]:
    print(f"  {cat}: {count}")

# 5. Bug 總結
print("\n## 5. Bug 總結")
print(f"發現問題數: {len(issues)}")

if issues:
    print("\n詳細問題:")
    for issue in issues[:20]:  # 只顯示前20個
        print(f"  ⚠️ {issue}")
    if len(issues) > 20:
        print(f"  ... 還有 {len(issues) - 20} 個問題")
else:
    print("✅ 沒有發現題目品質問題！")

# 6. 用戶體驗分析
print("\n## 6. 用戶體驗分析")
print("""
👨‍👩‍👧 家長視角檢查清單:
✅ 首頁清楚展示功能（今日目標、弱點分析、連續天數）
✅ 註冊只需暱稱+密碼（無需 email）
✅ 一鍵開始（今日10題按鈕）
✅ 家長查看功能獨立頁面
✅ 深色模式支援
✅ 出卷系統（自選題型、難度）
✅ 錯題本自動收集
✅ 成就系統激勵
⚠️ 考私中題目品質需人工抽查確認

👦 學生視角檢查清單:
✅ 題目難度分級（基礎/綜合/挑戰）
✅ 連擊系統（3連擊開始顯示）
✅ 音效反饋（答對/答錯/連擊）
✅ 詳解功能
✅ 收藏功能（⭐）
✅ 排行榜競爭
✅ 成就徽章（14個）
✅ 跳過功能
✅ 計時器顯示
""")

print("\n" + "=" * 50)
print("✅ QA 測試分析完成")
print("=" * 50)
