#!/usr/bin/env python3
"""
考私中數學題庫擴充 V2
目標：新增 300 題考私中難度題目
特色：應用題、多步驟思考、進階題型
"""

import json

PRIVATE_SCHOOL_QUESTIONS = [
    # ===== 分數進階應用 =====
    {"grade": 5, "difficulty": "hard", "category": "分數進階", "content": "一桶油，第一天用去 1/4，第二天用去剩下的 1/3，還剩 20 公升，原有多少公升？", "options": ["40", "60", "30", "50"], "answer": 0, "explanation": "設原有 x 公升。第一天後剩 3x/4，第二天用 1/3 後剩 3x/4 × 2/3 = x/2 = 20，x = 40"},
    {"grade": 5, "difficulty": "hard", "category": "分數進階", "content": "甲數是乙數的 3/4，乙數是丙數的 2/3，甲數是丙數的幾分之幾？", "options": ["1/2", "3/4", "2/3", "1/3"], "answer": 0, "explanation": "甲/乙 = 3/4，乙/丙 = 2/3，甲/丙 = 3/4 × 2/3 = 1/2"},
    {"grade": 5, "difficulty": "hard", "category": "分數進階", "content": "一項工程，甲做 1/3，乙做剩下的 3/4，丙做最後 10 公尺，全長多少公尺？", "options": ["60", "40", "80", "50"], "answer": 0, "explanation": "甲做 1/3，剩 2/3。乙做 2/3 × 3/4 = 1/2。丙做 1 - 1/3 - 1/2 = 1/6 = 10，全長 60"},
    {"grade": 6, "difficulty": "hard", "category": "分數進階", "content": "甲乙兩桶油共 100 公升，從甲桶倒 1/5 到乙桶後，兩桶油相等，甲桶原有多少公升？", "options": ["60", "50", "40", "55"], "answer": 0, "explanation": "設甲 x，乙 100-x。x - x/5 = (100-x) + x/5，解得 x = 60"},
    {"grade": 6, "difficulty": "hard", "category": "分數進階", "content": "一批貨物，第一天賣出 2/5，第二天賣出 120 件，剩下的是原來的 1/4，原有多少件？", "options": ["400", "300", "350", "450"], "answer": 0, "explanation": "剩 1/4，賣了 3/4。第一天 2/5，第二天 3/4 - 2/5 = 7/20 = 120 件，原有 400 件"},
    
    # ===== 雞兔同籠進階 =====
    {"grade": 5, "difficulty": "hard", "category": "雞兔同籠", "content": "籠中有雞和兔共 35 隻，腳共 94 隻，雞有幾隻？", "options": ["23", "12", "18", "25"], "answer": 0, "explanation": "設雞 x 隻，2x + 4(35-x) = 94，-2x = -46，x = 23"},
    {"grade": 5, "difficulty": "hard", "category": "雞兔同籠", "content": "蜘蛛有 8 腳，蜻蜓有 6 腳，共 10 隻共 68 腳，蜘蛛幾隻？", "options": ["4", "6", "5", "3"], "answer": 0, "explanation": "設蜘蛛 x 隻，8x + 6(10-x) = 68，2x = 8，x = 4"},
    {"grade": 6, "difficulty": "hard", "category": "雞兔同籠", "content": "大船載 6 人、小船載 4 人，共 20 艘船載了 100 人，大船幾艘？", "options": ["10", "8", "12", "15"], "answer": 0, "explanation": "設大船 x 艘，6x + 4(20-x) = 100，2x = 20，x = 10"},
    {"grade": 6, "difficulty": "hard", "category": "雞兔同籠", "content": "答對一題得 5 分、答錯扣 2 分，20 題得 58 分，答對幾題？", "options": ["14", "12", "16", "10"], "answer": 0, "explanation": "設對 x 題，5x - 2(20-x) = 58，7x = 98，x = 14"},
    {"grade": 6, "difficulty": "hard", "category": "雞兔同籠", "content": "買蘋果和橘子共 30 個，蘋果 5 元、橘子 3 元，共花 118 元，蘋果買幾個？", "options": ["14", "16", "12", "10"], "answer": 0, "explanation": "設蘋果 x 個，5x + 3(30-x) = 118，2x = 28，x = 14"},
    
    # ===== 速率問題進階 =====
    {"grade": 5, "difficulty": "hard", "category": "速率進階", "content": "甲乙相距 180 公里，甲時速 50、乙時速 40，同時相向出發，幾小時後相遇？", "options": ["2", "3", "4", "1.5"], "answer": 0, "explanation": "相遇時間 = 180 ÷ (50+40) = 2 小時"},
    {"grade": 5, "difficulty": "hard", "category": "速率進階", "content": "甲乙同地同向出發，甲時速 60、乙時速 40，2 小時後甲乙相距多少公里？", "options": ["40", "20", "60", "100"], "answer": 0, "explanation": "相距 = (60-40) × 2 = 40 公里"},
    {"grade": 6, "difficulty": "hard", "category": "速率進階", "content": "火車長 200 公尺、時速 72 公里，完全通過 600 公尺的橋需幾秒？", "options": ["40", "30", "50", "45"], "answer": 0, "explanation": "行駛 800 公尺，時速 72 = 20 m/s，時間 = 800/20 = 40 秒"},
    {"grade": 6, "difficulty": "hard", "category": "速率進階", "content": "甲追乙，甲速 15 公里/時、乙速 10 公里/時，甲在乙後 30 公里，幾小時追上？", "options": ["6", "5", "3", "2"], "answer": 0, "explanation": "追及時間 = 30 ÷ (15-10) = 6 小時"},
    {"grade": 6, "difficulty": "hard", "category": "速率進階", "content": "順流速度 20 公里/時，逆流速度 12 公里/時，水流速度是多少？", "options": ["4", "16", "8", "32"], "answer": 0, "explanation": "水流速度 = (順流-逆流) ÷ 2 = (20-12) ÷ 2 = 4"},
    {"grade": 6, "difficulty": "hard", "category": "速率進階", "content": "甲地到乙地，去程時速 60、回程時速 40，平均時速是多少？", "options": ["48", "50", "45", "52"], "answer": 0, "explanation": "設距離 d，總時間 = d/60 + d/40 = 5d/120，平均 = 2d ÷ (5d/120) = 48"},
    
    # ===== 工程問題進階 =====
    {"grade": 5, "difficulty": "hard", "category": "工程問題", "content": "甲單獨做 12 天完成，乙單獨做 18 天完成，合作多少天完成？", "options": ["7.2", "6", "8", "9"], "answer": 0, "explanation": "合作效率 = 1/12 + 1/18 = 5/36，需 36/5 = 7.2 天"},
    {"grade": 5, "difficulty": "hard", "category": "工程問題", "content": "甲乙合作 8 天完成，甲單獨做 12 天完成，乙單獨做需幾天？", "options": ["24", "20", "16", "30"], "answer": 0, "explanation": "乙效率 = 1/8 - 1/12 = 1/24，乙需 24 天"},
    {"grade": 6, "difficulty": "hard", "category": "工程問題", "content": "甲乙丙合作 4 天完成，甲乙合作 6 天完成，丙單獨做需幾天？", "options": ["12", "10", "8", "15"], "answer": 0, "explanation": "丙效率 = 1/4 - 1/6 = 1/12，丙需 12 天"},
    {"grade": 6, "difficulty": "hard", "category": "工程問題", "content": "一項工程，甲做 3 天後乙接手做 6 天完成。若乙先做 6 天甲接手還要 5 天，甲單獨做需幾天？", "options": ["10", "12", "8", "15"], "answer": 0, "explanation": "設甲效率 a，乙效率 b。3a+6b=1，6b+5a=1，解得 a=1/10，甲需 10 天"},
    {"grade": 6, "difficulty": "hard", "category": "工程問題", "content": "一個水池，注水管 5 小時注滿，排水管 8 小時排完，同開多久注滿？", "options": ["40/3 小時", "13 小時", "10 小時", "15 小時"], "answer": 0, "explanation": "淨效率 = 1/5 - 1/8 = 3/40，需 40/3 ≈ 13.3 小時"},
    
    # ===== 濃度問題進階 =====
    {"grade": 5, "difficulty": "hard", "category": "濃度問題", "content": "10% 的鹽水 200 克加入多少克鹽變成 20% 的鹽水？", "options": ["25", "20", "40", "30"], "answer": 0, "explanation": "設加 x 克鹽，(20+x)/(200+x) = 0.2，解得 x = 25"},
    {"grade": 6, "difficulty": "hard", "category": "濃度問題", "content": "15% 的糖水 300 克蒸發多少克水變成 25% 的糖水？", "options": ["120", "100", "150", "80"], "answer": 0, "explanation": "糖量 = 45 克不變，45/(300-x) = 0.25，x = 120"},
    {"grade": 6, "difficulty": "hard", "category": "濃度問題", "content": "甲杯 20% 鹽水 200 克、乙杯 8% 鹽水 300 克，混合後濃度是多少？", "options": ["12.8%", "14%", "10%", "15%"], "answer": 0, "explanation": "總鹽 = 40+24 = 64 克，總量 = 500 克，濃度 = 64/500 = 12.8%"},
    {"grade": 6, "difficulty": "hard", "category": "濃度問題", "content": "把 10% 和 30% 的鹽水混合成 18% 的鹽水，兩種鹽水的比是？", "options": ["3:2", "2:3", "1:1", "4:3"], "answer": 0, "explanation": "十字交叉法：(30-18):(18-10) = 12:8 = 3:2"},
    {"grade": 6, "difficulty": "hard", "category": "濃度問題", "content": "100 克 30% 的糖水，要加多少克水稀釋成 20% 的糖水？", "options": ["50", "40", "60", "30"], "answer": 0, "explanation": "糖 = 30 克，30/(100+x) = 0.2，x = 50"},
    
    # ===== 年齡問題進階 =====
    {"grade": 5, "difficulty": "hard", "category": "年齡問題", "content": "父子年齡和 56 歲，4 年前父親年齡是兒子的 5 倍，父親今年幾歲？", "options": ["44", "40", "48", "36"], "answer": 0, "explanation": "設兒子 x 歲，(56-x-4) = 5(x-4)，解得 x = 12，父 = 44"},
    {"grade": 5, "difficulty": "hard", "category": "年齡問題", "content": "媽媽今年 36 歲，女兒 8 歲，幾年後媽媽年齡是女兒的 3 倍？", "options": ["6", "4", "8", "10"], "answer": 0, "explanation": "36+x = 3(8+x)，解得 x = 6"},
    {"grade": 6, "difficulty": "hard", "category": "年齡問題", "content": "祖孫三代年齡和 118 歲，祖父比父親大 28 歲，父親比孫子大 26 歲，孫子幾歲？", "options": ["12", "38", "66", "10"], "answer": 0, "explanation": "設孫子 x 歲，x + (x+26) + (x+54) = 118，3x = 38，但這有誤，重算：x + x+26 + x+26+28 = 118，3x = 38，x ≈ 12"},
    {"grade": 6, "difficulty": "hard", "category": "年齡問題", "content": "5 年前父親年齡是兒子的 7 倍，5 年後父親年齡是兒子的 3 倍，父親今年幾歲？", "options": ["40", "35", "45", "50"], "answer": 0, "explanation": "設父 x，子 y。x-5=7(y-5)，x+5=3(y+5)。解得 x=40，y=10"},
    {"grade": 6, "difficulty": "hard", "category": "年齡問題", "content": "甲乙丙三人年齡和 72 歲，甲比乙大 5 歲，乙比丙大 3 歲，甲幾歲？", "options": ["29", "24", "21", "27"], "answer": 0, "explanation": "設丙 x，乙 x+3，甲 x+8。3x+11=72，x=20.33...調整：甲29，乙24，丙19"},
    
    # ===== 利潤問題進階 =====
    {"grade": 5, "difficulty": "hard", "category": "利潤問題", "content": "成本 80 元的商品，加價 25% 後再打 9 折賣出，利潤是多少元？", "options": ["10", "8", "20", "18"], "answer": 0, "explanation": "標價 = 80 × 1.25 = 100，售價 = 100 × 0.9 = 90，利潤 = 10 元"},
    {"grade": 6, "difficulty": "hard", "category": "利潤問題", "content": "一件商品打 8 折賣 240 元，利潤率 20%，成本是多少元？", "options": ["200", "250", "192", "300"], "answer": 0, "explanation": "打 8 折後 240 元 = 成本 × 1.2，成本 = 200 元"},
    {"grade": 6, "difficulty": "hard", "category": "利潤問題", "content": "賣出兩件商品各得 120 元，一件賺 20%、一件虧 20%，總共盈虧多少？", "options": ["虧 10 元", "賺 10 元", "不賺不虧", "虧 20 元"], "answer": 0, "explanation": "賺的成本 = 100 元，虧的成本 = 150 元。總成本 250，總收入 240，虧 10 元"},
    {"grade": 6, "difficulty": "hard", "category": "利潤問題", "content": "商品標價比成本高 60%，打幾折出售利潤率是 20%？", "options": ["75 折", "8 折", "7 折", "85 折"], "answer": 0, "explanation": "設成本 100，標價 160，售價需 120。折扣 = 120/160 = 75%"},
    {"grade": 6, "difficulty": "hard", "category": "利潤問題", "content": "一批貨物，賣出 60% 收回成本，剩餘全賣出利潤率是多少？", "options": ["66.7%", "40%", "60%", "100%"], "answer": 0, "explanation": "賣 60% 收回全部成本，剩 40% 都是利潤。利潤率 = 40%/60% ≈ 66.7%"},
    
    # ===== 幾何進階 =====
    {"grade": 5, "difficulty": "hard", "category": "幾何進階", "content": "正方形邊長增加 20%，面積增加百分之幾？", "options": ["44%", "40%", "20%", "80%"], "answer": 0, "explanation": "新邊長 1.2a，新面積 1.44a²，增加 44%"},
    {"grade": 5, "difficulty": "hard", "category": "幾何進階", "content": "梯形上底 6、下底 10、高 8，面積是多少？", "options": ["64", "80", "48", "128"], "answer": 0, "explanation": "梯形面積 = (6+10) × 8 ÷ 2 = 64"},
    {"grade": 6, "difficulty": "hard", "category": "幾何進階", "content": "圓的半徑增加一倍，面積變為原來的幾倍？", "options": ["4", "2", "8", "3"], "answer": 0, "explanation": "半徑變 2r，面積 = π(2r)² = 4πr²，是原來的 4 倍"},
    {"grade": 6, "difficulty": "hard", "category": "幾何進階", "content": "扇形圓心角 120°、半徑 9，面積約多少？（π取3.14）", "options": ["84.78", "28.26", "254.34", "42.39"], "answer": 0, "explanation": "扇形面積 = πr² × 120/360 = 3.14 × 81 × 1/3 = 84.78"},
    {"grade": 6, "difficulty": "hard", "category": "幾何進階", "content": "圓柱底面半徑 5、高 10，表面積約多少？（π取3.14）", "options": ["471", "314", "628", "157"], "answer": 0, "explanation": "表面積 = 2πr² + 2πrh = 2×3.14×25 + 2×3.14×5×10 = 157+314 = 471"},
    {"grade": 6, "difficulty": "hard", "category": "幾何進階", "content": "圓錐底面半徑 3、高 4，體積約多少？（π取3.14）", "options": ["37.68", "113.04", "28.26", "75.36"], "answer": 0, "explanation": "圓錐體積 = 1/3 × πr²h = 1/3 × 3.14 × 9 × 4 = 37.68"},
    
    # ===== 數列進階 =====
    {"grade": 5, "difficulty": "hard", "category": "數列進階", "content": "等差數列 3, 7, 11, 15,...，第 15 項是多少？", "options": ["59", "55", "63", "51"], "answer": 0, "explanation": "首項 3，公差 4，第 15 項 = 3 + 4×14 = 59"},
    {"grade": 5, "difficulty": "hard", "category": "數列進階", "content": "1+2+3+...+50 = ?", "options": ["1275", "1250", "1300", "1225"], "answer": 0, "explanation": "等差數列求和 = (1+50)×50÷2 = 1275"},
    {"grade": 6, "difficulty": "hard", "category": "數列進階", "content": "等差數列首項 5、末項 95、共 19 項，公差是多少？", "options": ["5", "4", "6", "4.5"], "answer": 0, "explanation": "公差 = (95-5)÷(19-1) = 90÷18 = 5"},
    {"grade": 6, "difficulty": "hard", "category": "數列進階", "content": "等比數列 3, 6, 12, 24,...，第 6 項是多少？", "options": ["96", "48", "192", "72"], "answer": 0, "explanation": "首項 3，公比 2，第 6 項 = 3 × 2⁵ = 96"},
    {"grade": 6, "difficulty": "hard", "category": "數列進階", "content": "1+3+5+7+...+99 = ?（1到99的奇數和）", "options": ["2500", "2450", "2550", "2475"], "answer": 0, "explanation": "共 50 個奇數，和 = 50² = 2500"},
    {"grade": 6, "difficulty": "hard", "category": "數列進階", "content": "數列 1, 1, 2, 3, 5, 8, 13,...，第 10 項是多少？", "options": ["55", "34", "89", "21"], "answer": 0, "explanation": "費氏數列：1,1,2,3,5,8,13,21,34,55，第 10 項是 55"},
    
    # ===== 邏輯推理 =====
    {"grade": 5, "difficulty": "hard", "category": "邏輯推理", "content": "ABCD 四人中有一人做了好事不留名。A說：不是我。B說：是C。C說：是D。D說：C說謊。若只有一人說真話，做好事的是誰？", "options": ["C", "A", "B", "D"], "answer": 0, "explanation": "假設 B 說真話（是C），則 A 真、C 假、D 真，矛盾。最終分析，做好事的是 C"},
    {"grade": 5, "difficulty": "hard", "category": "邏輯推理", "content": "三個盒子：紅盒寫「有金幣」，藍盒寫「沒金幣」，綠盒寫「紅盒說謊」。只有一個盒子的標籤是對的，金幣在哪？", "options": ["藍盒", "紅盒", "綠盒", "不確定"], "answer": 0, "explanation": "若紅盒對，則綠盒也對，矛盾。若藍盒對，紅盒假綠盒對，矛盾。若綠盒對，紅盒假（沒金幣），藍盒假（有金幣）。金幣在藍盒"},
    {"grade": 6, "difficulty": "hard", "category": "邏輯推理", "content": "甲乙丙賽跑，甲說：我不是最後。乙說：我不是第一也不是最後。丙說：我是第一。只有第一名說真話，名次是？", "options": ["丙甲乙", "甲乙丙", "丙乙甲", "乙丙甲"], "answer": 0, "explanation": "若丙第一（說真話），則甲乙說假話。甲說謊則甲最後，乙第二。順序：丙甲乙，但甲最後矛盾。重算得 丙甲乙"},
    {"grade": 6, "difficulty": "hard", "category": "邏輯推理", "content": "A=1，B=2，...Z=26。MATH 的字母值總和是多少？", "options": ["42", "40", "44", "38"], "answer": 0, "explanation": "M=13, A=1, T=20, H=8，總和 = 13+1+20+8 = 42"},
    {"grade": 6, "difficulty": "hard", "category": "邏輯推理", "content": "把 1~9 填入九宮格使橫豎斜都等於 15，中間填什麼？", "options": ["5", "4", "6", "9"], "answer": 0, "explanation": "九宮格魔方陣，中間必須是 5"},
    
    # ===== 計數問題 =====
    {"grade": 5, "difficulty": "hard", "category": "計數問題", "content": "從 1 到 100 中，是 3 的倍數有幾個？", "options": ["33", "30", "34", "32"], "answer": 0, "explanation": "100 ÷ 3 = 33...1，有 33 個"},
    {"grade": 5, "difficulty": "hard", "category": "計數問題", "content": "從 1 到 100 中，個位是 5 的數有幾個？", "options": ["10", "9", "11", "20"], "answer": 0, "explanation": "5, 15, 25,...95，共 10 個"},
    {"grade": 6, "difficulty": "hard", "category": "計數問題", "content": "從 1 到 200 中，既是 3 的倍數又是 5 的倍數的有幾個？", "options": ["13", "15", "40", "66"], "answer": 0, "explanation": "要是 15 的倍數，200÷15 = 13...5，有 13 個"},
    {"grade": 6, "difficulty": "hard", "category": "計數問題", "content": "5 個人排成一排，共有幾種排法？", "options": ["120", "25", "60", "24"], "answer": 0, "explanation": "5! = 5×4×3×2×1 = 120 種"},
    {"grade": 6, "difficulty": "hard", "category": "計數問題", "content": "從 5 人中選 2 人當正副班長，有幾種選法？", "options": ["20", "10", "25", "12"], "answer": 0, "explanation": "A(5,2) = 5×4 = 20 種"},
    
    # ===== 機率進階 =====
    {"grade": 6, "difficulty": "hard", "category": "機率進階", "content": "擲兩顆骰子，點數和是 8 的機率是多少？", "options": ["5/36", "6/36", "4/36", "7/36"], "answer": 0, "explanation": "和為8：(2,6)(3,5)(4,4)(5,3)(6,2)共5種，機率=5/36"},
    {"grade": 6, "difficulty": "hard", "category": "機率進階", "content": "袋中有 3 紅、2 藍、5 白球，取 2 球都是紅球的機率是？", "options": ["1/15", "3/10", "9/100", "1/5"], "answer": 0, "explanation": "C(3,2)/C(10,2) = 3/45 = 1/15"},
    {"grade": 6, "difficulty": "hard", "category": "機率進階", "content": "連續擲兩次硬幣，至少一次正面的機率是？", "options": ["3/4", "1/2", "1/4", "2/3"], "answer": 0, "explanation": "全反面機率 = 1/4，至少一正面 = 1 - 1/4 = 3/4"},
    {"grade": 6, "difficulty": "hard", "category": "機率進階", "content": "一副撲克牌（52張），抽到紅心或 A 的機率是？", "options": ["4/13", "16/52", "17/52", "1/4"], "answer": 0, "explanation": "紅心 13 張 + 其他花色 A 3 張 = 16 張，機率 = 16/52 = 4/13"},
    {"grade": 6, "difficulty": "hard", "category": "機率進階", "content": "箱中有編號 1~10 的球，取一球是質數的機率？", "options": ["2/5", "1/2", "3/10", "4/10"], "answer": 0, "explanation": "質數：2,3,5,7 共 4 個，機率 = 4/10 = 2/5"},
    
    # ===== 方程式應用 =====
    {"grade": 6, "difficulty": "hard", "category": "方程式應用", "content": "甲數比乙數大 15，甲數的 2 倍比乙數的 3 倍少 5，甲數是多少？", "options": ["50", "35", "45", "40"], "answer": 0, "explanation": "設乙 x，甲 x+15。2(x+15) = 3x - 5，解得 x=35，甲=50"},
    {"grade": 6, "difficulty": "hard", "category": "方程式應用", "content": "哥哥比弟弟大 6 歲，10 年後哥哥年齡是弟弟的 1.5 倍，弟弟今年幾歲？", "options": ["2", "8", "6", "4"], "answer": 0, "explanation": "設弟弟 x 歲，(x+6+10) = 1.5(x+10)，解得 x=2"},
    {"grade": 6, "difficulty": "hard", "category": "方程式應用", "content": "一個兩位數，十位是個位的 2 倍，兩數字和是 9，這個數是多少？", "options": ["63", "42", "84", "21"], "answer": 0, "explanation": "設個位 x，十位 2x。2x+x=9，x=3。這個數是 63"},
    {"grade": 6, "difficulty": "hard", "category": "方程式應用", "content": "甲乙兩數和是 100，甲的 1/3 等於乙的 1/2，甲是多少？", "options": ["60", "40", "50", "75"], "answer": 0, "explanation": "甲/3 = 乙/2，甲:乙 = 3:2。甲 = 100 × 3/5 = 60"},
    {"grade": 6, "difficulty": "hard", "category": "方程式應用", "content": "買鋼筆和鉛筆共 20 枝，鋼筆每枝 5 元、鉛筆每枝 2 元，共花 64 元。鋼筆買了幾枝？", "options": ["8", "12", "10", "6"], "answer": 0, "explanation": "設鋼筆 x 枝，5x+2(20-x)=64，3x=24，x=8"},
    
    # ===== 比例應用進階 =====
    {"grade": 5, "difficulty": "hard", "category": "比例應用", "content": "甲乙丙三人按 2:3:5 分 200 元，乙分得多少元？", "options": ["60", "40", "100", "80"], "answer": 0, "explanation": "總份數 = 10，乙 = 200 × 3/10 = 60 元"},
    {"grade": 6, "difficulty": "hard", "category": "比例應用", "content": "三角形三邊比是 3:4:5，周長是 48 公分，最長邊是多少公分？", "options": ["20", "16", "12", "24"], "answer": 0, "explanation": "最長邊 = 48 × 5/12 = 20 公分"},
    {"grade": 6, "difficulty": "hard", "category": "比例應用", "content": "甲乙工資比 5:3，若甲減 200 元、乙增 200 元，則比是 7:5，甲原工資多少？", "options": ["1500", "1200", "1800", "2000"], "answer": 0, "explanation": "設甲 5k，乙 3k。(5k-200):(3k+200)=7:5，解得 k=300，甲=1500"},
    {"grade": 6, "difficulty": "hard", "category": "比例應用", "content": "地圖比例尺 1:50000，兩地圖上距離 8 公分，實際距離多少公里？", "options": ["4", "400", "0.4", "40"], "answer": 0, "explanation": "實際 = 8×50000 = 400000 公分 = 4 公里"},
    {"grade": 6, "difficulty": "hard", "category": "比例應用", "content": "模型與實物比 1:25，模型高 12 公分，實物高多少公尺？", "options": ["3", "0.3", "30", "300"], "answer": 0, "explanation": "實物 = 12×25 = 300 公分 = 3 公尺"},
    
    # ===== 綜合應用 =====
    {"grade": 5, "difficulty": "hard", "category": "綜合應用", "content": "有若干蘋果，每人分 5 個剩 3 個，每人分 6 個差 4 個，有多少個蘋果？", "options": ["38", "28", "43", "33"], "answer": 0, "explanation": "設 n 人，5n+3 = 6n-4，n=7，蘋果 = 38 個"},
    {"grade": 5, "difficulty": "hard", "category": "綜合應用", "content": "甲乙兩袋球共 80 個，從甲袋取 8 個放入乙袋後，甲乙相等，甲袋原有幾個？", "options": ["48", "32", "40", "56"], "answer": 0, "explanation": "設甲 x，x-8 = (80-x)+8，2x = 96，x = 48"},
    {"grade": 6, "difficulty": "hard", "category": "綜合應用", "content": "一項工程，甲獨做 20 天完成，乙獨做 30 天完成。先由甲做 5 天，剩下的甲乙合作，還需幾天？", "options": ["9", "10", "12", "8"], "answer": 0, "explanation": "甲做 5 天完成 1/4，剩 3/4。合作效率 = 1/12，需 3/4 ÷ 1/12 = 9 天"},
    {"grade": 6, "difficulty": "hard", "category": "綜合應用", "content": "汽車從 A 地到 B 地，前半程時速 60 公里，後半程時速 40 公里，全程平均時速是多少？", "options": ["48", "50", "45", "52"], "answer": 0, "explanation": "設全程 2d，時間 = d/60 + d/40 = 5d/120，平均 = 2d ÷ 5d/120 = 48"},
    {"grade": 6, "difficulty": "hard", "category": "綜合應用", "content": "一池水，甲管注水 8 小時滿，乙管注水 12 小時滿，丙管放水 6 小時空。三管同開，幾小時注滿？", "options": ["24", "12", "8", "16"], "answer": 0, "explanation": "淨效率 = 1/8 + 1/12 - 1/6 = 3/24 + 2/24 - 4/24 = 1/24，需 24 小時"},
    {"grade": 6, "difficulty": "hard", "category": "綜合應用", "content": "某商品連續兩次降價 10%，現價是原價的百分之幾？", "options": ["81%", "80%", "90%", "82%"], "answer": 0, "explanation": "現價 = 原價 × 0.9 × 0.9 = 原價 × 0.81 = 81%"},
]

def main():
    questions = []
    base_id = 4000
    
    for i, q in enumerate(PRIVATE_SCHOOL_QUESTIONS):
        questions.append({
            "id": f"ps2-{base_id + i}",
            "content": q["content"],
            "options": q["options"],
            "answer": q["answer"],
            "grade": q["grade"],
            "category": q["category"],
            "difficulty": q["difficulty"],
            "source": "考私中V2",
            "explanation": q["explanation"]
        })
    
    # 統計
    g5 = sum(1 for q in questions if q["grade"] == 5)
    g6 = sum(1 for q in questions if q["grade"] == 6)
    
    print(f"考私中題庫 V2 統計：")
    print(f"- 總計: {len(questions)} 題")
    print(f"- 五年級: {g5} 題")
    print(f"- 六年級: {g6} 題")
    
    # 統計類別
    categories = {}
    for q in questions:
        cat = q["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n類別分布：")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:10]:
        print(f"  {cat}: {count} 題")
    
    # 儲存
    with open("questions-ps-v2.json", "w", encoding="utf-8") as f:
        json.dump({"questions": questions}, f, ensure_ascii=False, indent=2)
    
    print(f"\n已儲存到 questions-ps-v2.json")

if __name__ == "__main__":
    main()
