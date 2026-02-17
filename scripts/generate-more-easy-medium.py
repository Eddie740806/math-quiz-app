#!/usr/bin/env python3
"""
補充更多 easy 和 medium 難度題目
目標：120 題（easy 60 + medium 60）
"""

import json
import random

ADDITIONAL_QUESTIONS = [
    # ===== 更多 EASY 五年級 =====
    {"grade": 5, "difficulty": "easy", "category": "分數加減", "content": "計算：2/5 + 1/5 = ?", "options": ["3/5", "3/10", "1/5", "2/10"], "answer": 0, "explanation": "分母相同直接加分子：2/5 + 1/5 = 3/5"},
    {"grade": 5, "difficulty": "easy", "category": "分數加減", "content": "計算：4/7 - 2/7 = ?", "options": ["2/7", "2/14", "6/7", "6/14"], "answer": 0, "explanation": "分母相同直接減分子：4/7 - 2/7 = 2/7"},
    {"grade": 5, "difficulty": "easy", "category": "小數運算", "content": "計算：1.2 + 2.3 = ?", "options": ["3.5", "3.23", "12.23", "0.35"], "answer": 0, "explanation": "小數加法：1.2 + 2.3 = 3.5"},
    {"grade": 5, "difficulty": "easy", "category": "小數運算", "content": "計算：5.0 - 2.5 = ?", "options": ["2.5", "7.5", "3.5", "25"], "answer": 0, "explanation": "小數減法：5.0 - 2.5 = 2.5"},
    {"grade": 5, "difficulty": "easy", "category": "面積計算", "content": "正方形邊長 4 公分，面積是多少？", "options": ["16 平方公分", "8 平方公分", "12 平方公分", "20 平方公分"], "answer": 0, "explanation": "正方形面積 = 4 × 4 = 16 平方公分"},
    {"grade": 5, "difficulty": "easy", "category": "面積計算", "content": "長方形長 6、寬 4，面積是？", "options": ["24", "20", "10", "12"], "answer": 0, "explanation": "長方形面積 = 6 × 4 = 24"},
    {"grade": 5, "difficulty": "easy", "category": "周長計算", "content": "正方形邊長 5，周長是？", "options": ["20", "25", "10", "15"], "answer": 0, "explanation": "正方形周長 = 5 × 4 = 20"},
    {"grade": 5, "difficulty": "easy", "category": "周長計算", "content": "長方形長 8、寬 3，周長是？", "options": ["22", "24", "11", "16"], "answer": 0, "explanation": "長方形周長 = (8+3) × 2 = 22"},
    {"grade": 5, "difficulty": "easy", "category": "因數與倍數", "content": "18 的因數有幾個？", "options": ["6", "4", "5", "8"], "answer": 0, "explanation": "18 的因數：1,2,3,6,9,18，共 6 個"},
    {"grade": 5, "difficulty": "easy", "category": "因數與倍數", "content": "下列哪個是 9 的倍數？", "options": ["27", "26", "25", "28"], "answer": 0, "explanation": "27 = 9 × 3，是 9 的倍數"},
    {"grade": 5, "difficulty": "easy", "category": "體積計算", "content": "正方體邊長 2，體積是？", "options": ["8", "6", "4", "12"], "answer": 0, "explanation": "正方體體積 = 2³ = 8"},
    {"grade": 5, "difficulty": "easy", "category": "百分比基礎", "content": "75% 等於多少分數？", "options": ["3/4", "7/5", "3/5", "7/4"], "answer": 0, "explanation": "75% = 75/100 = 3/4"},
    {"grade": 5, "difficulty": "easy", "category": "百分比基礎", "content": "20% 等於多少小數？", "options": ["0.2", "2.0", "0.02", "20"], "answer": 0, "explanation": "20% = 20 ÷ 100 = 0.2"},
    {"grade": 5, "difficulty": "easy", "category": "時間計算", "content": "2 小時 = 幾分鐘？", "options": ["120", "200", "100", "60"], "answer": 0, "explanation": "2 小時 = 2 × 60 = 120 分鐘"},
    {"grade": 5, "difficulty": "easy", "category": "時間計算", "content": "180 秒 = 幾分鐘？", "options": ["3", "18", "1.8", "30"], "answer": 0, "explanation": "180 ÷ 60 = 3 分鐘"},
    {"grade": 5, "difficulty": "easy", "category": "統計圖表", "content": "3, 5, 7 的平均是？", "options": ["5", "15", "3", "7"], "answer": 0, "explanation": "(3+5+7) ÷ 3 = 5"},
    {"grade": 5, "difficulty": "easy", "category": "統計圖表", "content": "10, 20, 30, 40 的平均是？", "options": ["25", "100", "20", "30"], "answer": 0, "explanation": "(10+20+30+40) ÷ 4 = 25"},
    {"grade": 5, "difficulty": "easy", "category": "質數與合數", "content": "11 是質數還是合數？", "options": ["質數", "合數", "都不是", "不確定"], "answer": 0, "explanation": "11 只能被 1 和 11 整除，是質數"},
    {"grade": 5, "difficulty": "easy", "category": "質數與合數", "content": "15 是質數還是合數？", "options": ["合數", "質數", "都不是", "不確定"], "answer": 0, "explanation": "15 = 3 × 5，有其他因數，是合數"},
    {"grade": 5, "difficulty": "easy", "category": "比與比值", "content": "3:6 化簡後是？", "options": ["1:2", "3:6", "6:3", "2:1"], "answer": 0, "explanation": "3:6 = 1:2（同除以 3）"},
    {"grade": 5, "difficulty": "easy", "category": "比與比值", "content": "8:12 化簡後是？", "options": ["2:3", "4:6", "8:12", "3:2"], "answer": 0, "explanation": "8:12 = 2:3（同除以 4）"},
    {"grade": 5, "difficulty": "easy", "category": "角度", "content": "直角是幾度？", "options": ["90°", "180°", "45°", "360°"], "answer": 0, "explanation": "直角 = 90°"},
    {"grade": 5, "difficulty": "easy", "category": "角度", "content": "平角是幾度？", "options": ["180°", "90°", "360°", "45°"], "answer": 0, "explanation": "平角 = 180°"},
    {"grade": 5, "difficulty": "easy", "category": "植樹問題", "content": "一排 10 棵樹，每兩棵相隔 3 公尺，這排樹長幾公尺？", "options": ["27", "30", "33", "24"], "answer": 0, "explanation": "間隔數 = 10-1 = 9，長度 = 9 × 3 = 27 公尺"},
    {"grade": 5, "difficulty": "easy", "category": "購物應用", "content": "一枝筆 10 元，買 5 枝要多少元？", "options": ["50", "15", "5", "100"], "answer": 0, "explanation": "10 × 5 = 50 元"},
    {"grade": 5, "difficulty": "easy", "category": "購物應用", "content": "100 元買 4 枝筆，每枝幾元？", "options": ["25", "400", "96", "104"], "answer": 0, "explanation": "100 ÷ 4 = 25 元"},
    {"grade": 5, "difficulty": "easy", "category": "倍數問題", "content": "5 的第 4 個倍數是？", "options": ["20", "9", "15", "25"], "answer": 0, "explanation": "5 的倍數：5, 10, 15, 20...，第 4 個是 20"},
    {"grade": 5, "difficulty": "easy", "category": "規律問題", "content": "2, 4, 6, 8, ?，下一個是？", "options": ["10", "9", "12", "16"], "answer": 0, "explanation": "等差數列，公差 2，下一個是 10"},
    {"grade": 5, "difficulty": "easy", "category": "規律問題", "content": "1, 3, 5, 7, 9, ?，下一個是？", "options": ["11", "10", "13", "15"], "answer": 0, "explanation": "奇數列，下一個是 11"},
    {"grade": 5, "difficulty": "easy", "category": "混合應用題", "content": "小明有 50 元，買了一本 35 元的書，剩多少元？", "options": ["15", "85", "35", "50"], "answer": 0, "explanation": "50 - 35 = 15 元"},
    
    # ===== 更多 MEDIUM 五年級 =====
    {"grade": 5, "difficulty": "medium", "category": "分數應用", "content": "一瓶水 600 毫升，喝了 2/5，喝了多少毫升？", "options": ["240", "360", "200", "400"], "answer": 0, "explanation": "600 × 2/5 = 240 毫升"},
    {"grade": 5, "difficulty": "medium", "category": "分數應用", "content": "一塊地 3/4 種菜，1/4 種花，種菜比種花多幾分之幾？", "options": ["1/2", "1/4", "2/4", "3/4"], "answer": 0, "explanation": "3/4 - 1/4 = 2/4 = 1/2"},
    {"grade": 5, "difficulty": "medium", "category": "小數運算", "content": "計算：4.8 ÷ 1.2 = ?", "options": ["4", "5.76", "3.6", "6"], "answer": 0, "explanation": "4.8 ÷ 1.2 = 48 ÷ 12 = 4"},
    {"grade": 5, "difficulty": "medium", "category": "小數運算", "content": "計算：1.5 × 2.4 = ?", "options": ["3.6", "3.9", "36", "0.36"], "answer": 0, "explanation": "1.5 × 2.4 = 3.6"},
    {"grade": 5, "difficulty": "medium", "category": "面積計算", "content": "三角形底 12、高 8，面積是？", "options": ["48", "96", "20", "32"], "answer": 0, "explanation": "三角形面積 = 12 × 8 ÷ 2 = 48"},
    {"grade": 5, "difficulty": "medium", "category": "面積計算", "content": "菱形對角線 6 和 8，面積是？", "options": ["24", "48", "14", "28"], "answer": 0, "explanation": "菱形面積 = 對角線乘積 ÷ 2 = 6 × 8 ÷ 2 = 24"},
    {"grade": 5, "difficulty": "medium", "category": "體積計算", "content": "長方體長 4、寬 3、高 5，體積是？", "options": ["60", "12", "35", "20"], "answer": 0, "explanation": "長方體體積 = 4 × 3 × 5 = 60"},
    {"grade": 5, "difficulty": "medium", "category": "百分比", "content": "原價 200 元，降價 15%，現價多少？", "options": ["170", "185", "30", "215"], "answer": 0, "explanation": "降價後 = 200 × (1-15%) = 200 × 0.85 = 170 元"},
    {"grade": 5, "difficulty": "medium", "category": "百分比", "content": "班上 50 人，出席率 80%，出席幾人？", "options": ["40", "10", "30", "45"], "answer": 0, "explanation": "出席人數 = 50 × 80% = 40 人"},
    {"grade": 5, "difficulty": "medium", "category": "速率問題", "content": "時速 45 公里，3 小時走多遠？", "options": ["135 公里", "48 公里", "15 公里", "90 公里"], "answer": 0, "explanation": "距離 = 45 × 3 = 135 公里"},
    {"grade": 5, "difficulty": "medium", "category": "速率問題", "content": "240 公里路程，時速 60 公里，需幾小時？", "options": ["4", "180", "300", "14400"], "answer": 0, "explanation": "時間 = 240 ÷ 60 = 4 小時"},
    {"grade": 5, "difficulty": "medium", "category": "和差問題", "content": "兩數和 80，差 20，大數是？", "options": ["50", "30", "60", "40"], "answer": 0, "explanation": "大數 = (80+20) ÷ 2 = 50"},
    {"grade": 5, "difficulty": "medium", "category": "年齡問題", "content": "媽媽今年 36 歲，女兒 12 歲，幾年前媽媽年齡是女兒的 5 倍？", "options": ["6", "4", "8", "12"], "answer": 0, "explanation": "設 x 年前，36-x = 5(12-x)，解得 x = 6"},
    {"grade": 5, "difficulty": "medium", "category": "工作問題", "content": "一項工作，甲 6 天完成，乙 12 天完成，合作幾天完成？", "options": ["4", "9", "3", "18"], "answer": 0, "explanation": "合作效率 = 1/6 + 1/12 = 3/12 = 1/4，需 4 天"},
    {"grade": 5, "difficulty": "medium", "category": "濃度", "content": "100 克水加 20 克糖，糖的濃度是多少？", "options": ["約 16.7%", "20%", "25%", "80%"], "answer": 0, "explanation": "濃度 = 20 ÷ (100+20) = 20/120 ≈ 16.7%"},
    {"grade": 5, "difficulty": "medium", "category": "比與比值", "content": "甲乙比 3:5，乙有 25 個，甲有幾個？", "options": ["15", "20", "40", "8"], "answer": 0, "explanation": "甲 = 25 × 3/5 = 15 個"},
    {"grade": 5, "difficulty": "medium", "category": "倍數問題", "content": "一個數是 4 的倍數也是 6 的倍數，最小是？", "options": ["12", "24", "10", "2"], "answer": 0, "explanation": "4 和 6 的最小公倍數是 12"},
    {"grade": 5, "difficulty": "medium", "category": "植樹問題", "content": "圓形花圃周長 60 公尺，每隔 5 公尺種一棵樹，需幾棵？", "options": ["12", "13", "11", "60"], "answer": 0, "explanation": "圓形首尾相連，棵數 = 段數 = 60 ÷ 5 = 12 棵"},
    {"grade": 5, "difficulty": "medium", "category": "邏輯推理", "content": "A 比 B 高，B 比 C 矮，C 比 D 高。最矮的是？", "options": ["B", "D", "C", "A"], "answer": 0, "explanation": "A>B，B<C，C>D，所以 B 最矮"},
    {"grade": 5, "difficulty": "medium", "category": "統計圖表", "content": "5 個數平均 20，其中 4 個是 15,18,22,25，第 5 個是？", "options": ["20", "15", "25", "100"], "answer": 0, "explanation": "總和 = 20×5 = 100，第5個 = 100-15-18-22-25 = 20"},
    
    # ===== 更多 EASY 六年級 =====
    {"grade": 6, "difficulty": "easy", "category": "正負數運算", "content": "計算：5 + (-3) = ?", "options": ["2", "8", "-2", "-8"], "answer": 0, "explanation": "5 + (-3) = 5 - 3 = 2"},
    {"grade": 6, "difficulty": "easy", "category": "正負數運算", "content": "計算：(-7) + (-2) = ?", "options": ["-9", "9", "-5", "5"], "answer": 0, "explanation": "(-7) + (-2) = -9"},
    {"grade": 6, "difficulty": "easy", "category": "正負數運算", "content": "計算：(-8) × 2 = ?", "options": ["-16", "16", "-6", "6"], "answer": 0, "explanation": "(-8) × 2 = -16"},
    {"grade": 6, "difficulty": "easy", "category": "一元一次方程式", "content": "解方程式：x - 3 = 7", "options": ["10", "4", "-10", "-4"], "answer": 0, "explanation": "x = 7 + 3 = 10"},
    {"grade": 6, "difficulty": "easy", "category": "一元一次方程式", "content": "解方程式：3x = 15", "options": ["5", "45", "12", "18"], "answer": 0, "explanation": "x = 15 ÷ 3 = 5"},
    {"grade": 6, "difficulty": "easy", "category": "一元一次方程式", "content": "解方程式：x/4 = 5", "options": ["20", "1.25", "9", "1"], "answer": 0, "explanation": "x = 5 × 4 = 20"},
    {"grade": 6, "difficulty": "easy", "category": "圓的周長與面積", "content": "圓直徑 10 公分，周長約多少？（π取3.14）", "options": ["31.4", "314", "78.5", "15.7"], "answer": 0, "explanation": "周長 = πd = 3.14 × 10 = 31.4 公分"},
    {"grade": 6, "difficulty": "easy", "category": "圓的周長與面積", "content": "圓半徑 5 公分，面積約多少？（π取3.14）", "options": ["78.5", "31.4", "15.7", "157"], "answer": 0, "explanation": "面積 = πr² = 3.14 × 25 = 78.5 平方公分"},
    {"grade": 6, "difficulty": "easy", "category": "比例", "content": "地圖比例尺 1:50000，圖上 2 公分代表實際多少？", "options": ["1 公里", "100 公尺", "10 公里", "2 公里"], "answer": 0, "explanation": "實際 = 2 × 50000 = 100000 公分 = 1 公里"},
    {"grade": 6, "difficulty": "easy", "category": "等差數列", "content": "等差數列首項 5、公差 3，第 4 項是？", "options": ["14", "17", "11", "20"], "answer": 0, "explanation": "第4項 = 5 + 3×3 = 14"},
    {"grade": 6, "difficulty": "easy", "category": "統計", "content": "1,2,3,4,5 的中位數是？", "options": ["3", "2.5", "15", "2"], "answer": 0, "explanation": "排序後中間的數是 3"},
    {"grade": 6, "difficulty": "easy", "category": "統計", "content": "2,2,3,5,8 的眾數是？", "options": ["2", "3", "4", "5"], "answer": 0, "explanation": "出現最多次的是 2"},
    {"grade": 6, "difficulty": "easy", "category": "機率", "content": "擲一顆骰子，出現偶數的機率是？", "options": ["1/2", "1/3", "1/6", "2/3"], "answer": 0, "explanation": "偶數有 2,4,6 三個，機率 = 3/6 = 1/2"},
    {"grade": 6, "difficulty": "easy", "category": "機率", "content": "袋中有 5 個球（2紅3白），摸到紅球的機率？", "options": ["2/5", "3/5", "1/2", "2/3"], "answer": 0, "explanation": "紅球機率 = 2/5"},
    {"grade": 6, "difficulty": "easy", "category": "圓柱體積", "content": "圓柱底面半徑 2、高 5，體積約多少？（π取3.14）", "options": ["62.8", "31.4", "125.6", "20"], "answer": 0, "explanation": "體積 = πr²h = 3.14 × 4 × 5 = 62.8"},
    
    # ===== 更多 MEDIUM 六年級 =====
    {"grade": 6, "difficulty": "medium", "category": "正負數運算", "content": "計算：(-3)² = ?", "options": ["9", "-9", "6", "-6"], "answer": 0, "explanation": "(-3)² = (-3) × (-3) = 9"},
    {"grade": 6, "difficulty": "medium", "category": "正負數運算", "content": "計算：-3² = ?", "options": ["-9", "9", "-6", "6"], "answer": 0, "explanation": "-3² = -(3²) = -9"},
    {"grade": 6, "difficulty": "medium", "category": "一元一次方程式", "content": "解方程式：2x + 5 = 17", "options": ["6", "11", "22", "7"], "answer": 0, "explanation": "2x = 12，x = 6"},
    {"grade": 6, "difficulty": "medium", "category": "一元一次方程式", "content": "解方程式：4x - 3 = 2x + 9", "options": ["6", "3", "12", "-6"], "answer": 0, "explanation": "2x = 12，x = 6"},
    {"grade": 6, "difficulty": "medium", "category": "方程式應用", "content": "連續三個整數和為 27，最大的是？", "options": ["10", "9", "8", "11"], "answer": 0, "explanation": "設中間是 x，(x-1)+x+(x+1)=27，x=9，最大是 10"},
    {"grade": 6, "difficulty": "medium", "category": "圓的周長與面積", "content": "扇形圓心角 90°、半徑 4，弧長約多少？（π取3.14）", "options": ["6.28", "12.56", "3.14", "25.12"], "answer": 0, "explanation": "弧長 = 2πr × 90/360 = 6.28"},
    {"grade": 6, "difficulty": "medium", "category": "圓柱體積", "content": "圓柱底面周長 12.56 公分、高 10，體積約多少？（π取3.14）", "options": ["125.6", "62.8", "251.2", "31.4"], "answer": 0, "explanation": "半徑 = 12.56÷2÷3.14 = 2，體積 = 3.14×4×10 = 125.6"},
    {"grade": 6, "difficulty": "medium", "category": "比例應用", "content": "A、B 按 3:7 分 500 元，B 得多少元？", "options": ["350", "150", "500", "300"], "answer": 0, "explanation": "B = 500 × 7/10 = 350 元"},
    {"grade": 6, "difficulty": "medium", "category": "百分率應用", "content": "一本書打 75 折後 150 元，原價多少元？", "options": ["200", "112.5", "225", "180"], "answer": 0, "explanation": "原價 = 150 ÷ 0.75 = 200 元"},
    {"grade": 6, "difficulty": "medium", "category": "速率問題進階", "content": "甲時速 50 公里、乙時速 30 公里，同向而行，相距 40 公里，甲追上乙需幾小時？", "options": ["2", "4", "1", "0.8"], "answer": 0, "explanation": "追及時間 = 40 ÷ (50-30) = 2 小時"},
    {"grade": 6, "difficulty": "medium", "category": "等差數列", "content": "等差數列 2,5,8,11,...，第 20 項是？", "options": ["59", "56", "62", "65"], "answer": 0, "explanation": "第n項 = 2 + 3×(n-1)，第20項 = 2 + 3×19 = 59"},
    {"grade": 6, "difficulty": "medium", "category": "等差數列", "content": "等差數列首項 1、末項 49、共 25 項，公差是？", "options": ["2", "1.92", "3", "2.5"], "answer": 0, "explanation": "公差 = (49-1)÷(25-1) = 48÷24 = 2"},
    {"grade": 6, "difficulty": "medium", "category": "機率", "content": "袋中有 4 紅、3 藍、3 白球，取一球是藍或白的機率？", "options": ["3/5", "2/5", "3/10", "1/2"], "answer": 0, "explanation": "藍或白 = (3+3)/10 = 6/10 = 3/5"},
    {"grade": 6, "difficulty": "medium", "category": "統計", "content": "一組數據 3,5,7,9,11，全距是？", "options": ["8", "7", "35", "11"], "answer": 0, "explanation": "全距 = 最大值 - 最小值 = 11 - 3 = 8"},
    {"grade": 6, "difficulty": "medium", "category": "幾何綜合", "content": "圓內接正六邊形邊長 6，圓的半徑是？", "options": ["6", "12", "3", "9"], "answer": 0, "explanation": "圓內接正六邊形的邊長等於半徑，所以半徑 = 6"},
]

def main():
    questions = []
    base_id = 3000
    
    for i, q in enumerate(ADDITIONAL_QUESTIONS):
        questions.append({
            "id": f"add-{base_id + i}",
            "content": q["content"],
            "options": q["options"],
            "answer": q["answer"],
            "grade": q["grade"],
            "category": q["category"],
            "difficulty": q["difficulty"],
            "source": "均衡補充2",
            "explanation": q["explanation"]
        })
    
    # 統計
    easy_count = sum(1 for q in questions if q["difficulty"] == "easy")
    medium_count = sum(1 for q in questions if q["difficulty"] == "medium")
    
    print(f"額外生成題目統計：")
    print(f"- Easy: {easy_count} 題")
    print(f"- Medium: {medium_count} 題")
    print(f"- 總計: {len(questions)} 題")
    
    # 儲存
    with open("questions-additional.json", "w", encoding="utf-8") as f:
        json.dump({"questions": questions}, f, ensure_ascii=False, indent=2)
    
    print(f"\n已儲存到 questions-additional.json")

if __name__ == "__main__":
    main()
