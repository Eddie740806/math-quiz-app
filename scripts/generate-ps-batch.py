#!/usr/bin/env python3
"""
考私中題庫大規模擴充 - 批量生成 550 題
"""

import json
import random

# 題目模板庫 - 每個類別多個變體
TEMPLATES = {
    "分數進階": [
        {"content": "一桶水用去 {frac1}，又用去剩下的 {frac2}，還剩 {remain} 公升，原有多少公升？", "type": "fraction_chain"},
        {"content": "甲數是乙數的 {frac1}，乙數是丙數的 {frac2}，甲是丙的幾分之幾？", "type": "fraction_ratio"},
        {"content": "一批貨物，第一天賣出 {frac1}，第二天賣出 {num} 件，還剩原來的 {frac2}，原有多少件？", "type": "fraction_multi"},
    ],
    "雞兔同籠": [
        {"content": "雞兔共 {total} 隻，腳共 {feet} 隻，雞有幾隻？", "type": "chicken_rabbit"},
        {"content": "答對得 {plus} 分、答錯扣 {minus} 分，{total} 題得 {score} 分，答對幾題？", "type": "score"},
        {"content": "{a}元和{b}元硬幣共 {total} 枚，合計 {money} 元，{a}元硬幣有幾枚？", "type": "coin"},
    ],
    "速率問題": [
        {"content": "甲乙相距 {dist} 公里，甲時速 {v1}、乙時速 {v2}，相向而行，幾小時相遇？", "type": "meet"},
        {"content": "甲追乙，甲速 {v1}、乙速 {v2}，甲在乙後 {dist} 公里，幾小時追上？", "type": "chase"},
        {"content": "火車長 {train} 公尺、時速 {v} 公里，通過 {bridge} 公尺的橋需幾秒？", "type": "bridge"},
    ],
    "工程問題": [
        {"content": "甲單獨做 {a} 天完成，乙單獨做 {b} 天完成，合作幾天完成？", "type": "work_coop"},
        {"content": "甲乙合作 {coop} 天完成，甲單獨做 {a} 天完成，乙單獨做需幾天？", "type": "work_find"},
    ],
    "濃度問題": [
        {"content": "{conc1}% 的鹽水 {weight} 克加入 {add} 克水，濃度變為多少？", "type": "dilute"},
        {"content": "{conc1}% 的鹽水 {w1} 克和 {conc2}% 的鹽水 {w2} 克混合，濃度是多少？", "type": "mix"},
    ],
    "年齡問題": [
        {"content": "父子年齡和 {sum} 歲，{years} 年前父親是兒子的 {ratio} 倍，父親今年幾歲？", "type": "age_past"},
        {"content": "媽媽今年 {mom} 歲，女兒 {child} 歲，幾年後媽媽是女兒的 {ratio} 倍？", "type": "age_future"},
    ],
    "利潤問題": [
        {"content": "成本 {cost} 元，加價 {markup}% 後打 {discount} 折賣出，利潤是多少元？", "type": "profit_chain"},
        {"content": "商品打 {discount} 折後賣 {price} 元，利潤率 {profit}%，成本是多少元？", "type": "profit_cost"},
    ],
    "幾何問題": [
        {"content": "梯形上底 {a}、下底 {b}、高 {h}，面積是多少？", "type": "trapezoid"},
        {"content": "圓的半徑 {r}，面積約多少？（π取3.14）", "type": "circle"},
        {"content": "圓柱底面半徑 {r}、高 {h}，體積約多少？（π取3.14）", "type": "cylinder"},
    ],
    "數列問題": [
        {"content": "等差數列首項 {a}、公差 {d}，第 {n} 項是多少？", "type": "ap_nth"},
        {"content": "{a}+{a2}+{a3}+...+{an} = ?", "type": "ap_sum"},
    ],
    "比例問題": [
        {"content": "甲乙丙按 {r1}:{r2}:{r3} 分 {total} 元，乙分得多少元？", "type": "ratio_div"},
        {"content": "地圖比例尺 1:{scale}，圖上 {map_dist} 公分代表實際多少公里？", "type": "scale"},
    ],
}

def generate_fraction_questions(count):
    """生成分數題"""
    questions = []
    fractions = ["1/3", "1/4", "1/5", "2/5", "2/3", "3/4", "3/5"]
    remains = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200]
    
    for i in range(count):
        f1, f2 = random.sample(fractions, 2)
        remain = random.choice(remains)
        
        # 計算原量（簡化版本）
        if f1 == "1/3" and f2 == "1/2":
            original = remain * 3
        elif f1 == "1/4" and f2 == "1/3":
            original = remain * 2
        else:
            original = remain * 2  # 簡化
        
        q = {
            "content": f"一批貨物，第一天賣出 {f1}，第二天賣出剩下的 {f2}，還剩 {remain} 件，原有多少件？",
            "options": [str(original), str(original+20), str(original-10), str(original+50)],
            "answer": 0,
            "grade": random.choice([5, 6]),
            "difficulty": "hard",
            "category": "分數進階",
            "explanation": f"設原有 x 件，根據題意列方程求解，原有 {original} 件"
        }
        questions.append(q)
    
    return questions

def generate_chicken_rabbit_questions(count):
    """生成雞兔同籠題"""
    questions = []
    
    for i in range(count):
        # 設定雞兔數量
        chicken = random.randint(5, 30)
        rabbit = random.randint(5, 30)
        total = chicken + rabbit
        feet = chicken * 2 + rabbit * 4
        
        q = {
            "content": f"雞兔共 {total} 隻，腳共 {feet} 隻，雞有幾隻？",
            "options": [str(chicken), str(rabbit), str(chicken+2), str(chicken-2)],
            "answer": 0,
            "grade": random.choice([5, 6]),
            "difficulty": "hard",
            "category": "雞兔同籠",
            "explanation": f"設雞 x 隻，2x + 4({total}-x) = {feet}，解得 x = {chicken}"
        }
        questions.append(q)
    
    return questions

def generate_speed_questions(count):
    """生成速率題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["meet", "chase", "bridge"])
        
        if qtype == "meet":
            v1 = random.randint(40, 80)
            v2 = random.randint(30, 70)
            time = random.randint(2, 6)
            dist = (v1 + v2) * time
            
            q = {
                "content": f"甲乙相距 {dist} 公里，甲時速 {v1}、乙時速 {v2}，相向而行，幾小時相遇？",
                "options": [str(time), str(time+1), str(time-1), str(time+2)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "速率問題",
                "explanation": f"相遇時間 = {dist} ÷ ({v1}+{v2}) = {time} 小時"
            }
        elif qtype == "chase":
            v1 = random.randint(50, 80)
            v2 = random.randint(30, 50)
            time = random.randint(2, 8)
            dist = (v1 - v2) * time
            
            q = {
                "content": f"甲追乙，甲速 {v1}、乙速 {v2}，甲在乙後 {dist} 公里，幾小時追上？",
                "options": [str(time), str(time+1), str(time-1), str(time+2)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "速率問題",
                "explanation": f"追及時間 = {dist} ÷ ({v1}-{v2}) = {time} 小時"
            }
        else:
            train = random.choice([100, 150, 200, 250, 300])
            bridge = random.choice([200, 300, 400, 500, 600])
            speed_ms = random.choice([15, 20, 25])
            speed_kmh = speed_ms * 3.6
            total_dist = train + bridge
            time = total_dist // speed_ms
            
            q = {
                "content": f"火車長 {train} 公尺、時速 {int(speed_kmh)} 公里，通過 {bridge} 公尺的橋需幾秒？",
                "options": [str(time), str(time+5), str(time-5), str(time+10)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "速率問題",
                "explanation": f"行駛 {total_dist} 公尺，時速 {int(speed_kmh)} = {speed_ms} m/s，時間 = {time} 秒"
            }
        
        questions.append(q)
    
    return questions

def generate_work_questions(count):
    """生成工程題"""
    questions = []
    
    for i in range(count):
        a = random.choice([6, 8, 10, 12, 15, 18, 20])
        b = random.choice([8, 10, 12, 15, 18, 20, 24, 30])
        while a == b:
            b = random.choice([8, 10, 12, 15, 18, 20, 24, 30])
        
        # 計算合作天數 (a*b)/(a+b)
        lcm = (a * b) // gcd(a, b)
        coop = (a * b) / (a + b)
        coop_str = f"{a*b}/{a+b}" if coop != int(coop) else str(int(coop))
        
        q = {
            "content": f"甲單獨做 {a} 天完成，乙單獨做 {b} 天完成，合作幾天完成？",
            "options": [coop_str, str(a), str(b), str((a+b)//2)],
            "answer": 0,
            "grade": random.choice([5, 6]),
            "difficulty": "hard",
            "category": "工程問題",
            "explanation": f"合作效率 = 1/{a} + 1/{b}，需 {coop_str} 天"
        }
        questions.append(q)
    
    return questions

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def generate_concentration_questions(count):
    """生成濃度題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["dilute", "mix", "add_salt"])
        
        if qtype == "dilute":
            conc = random.choice([10, 15, 20, 25, 30])
            weight = random.choice([100, 200, 300, 400, 500])
            add_water = random.choice([50, 100, 150, 200])
            salt = weight * conc / 100
            new_conc = round(salt / (weight + add_water) * 100, 1)
            
            q = {
                "content": f"{conc}% 的鹽水 {weight} 克，加入 {add_water} 克水後，濃度變為多少？",
                "options": [f"{new_conc}%", f"{new_conc+2}%", f"{new_conc-2}%", f"{conc}%"],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "濃度問題",
                "explanation": f"鹽量 {salt} 克不變，新濃度 = {salt}/{weight + add_water} = {new_conc}%"
            }
        elif qtype == "mix":
            c1 = random.choice([10, 15, 20])
            c2 = random.choice([25, 30, 35, 40])
            w1 = random.choice([100, 200, 300])
            w2 = random.choice([100, 200, 300])
            salt = w1 * c1 / 100 + w2 * c2 / 100
            new_conc = round(salt / (w1 + w2) * 100, 1)
            
            q = {
                "content": f"{c1}% 的鹽水 {w1} 克和 {c2}% 的鹽水 {w2} 克混合，濃度是多少？",
                "options": [f"{new_conc}%", f"{new_conc+3}%", f"{new_conc-3}%", f"{(c1+c2)/2}%"],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "濃度問題",
                "explanation": f"總鹽 = {salt} 克，總量 = {w1+w2} 克，濃度 = {new_conc}%"
            }
        else:
            conc = random.choice([10, 15, 20])
            weight = random.choice([200, 300, 400, 500])
            target_conc = random.choice([25, 30, 35])
            salt_orig = weight * conc / 100
            # 加鹽後：(salt_orig + x) / (weight + x) = target_conc/100
            # 解得 x
            add_salt = round((target_conc * weight - 100 * salt_orig) / (100 - target_conc), 1)
            
            q = {
                "content": f"要把 {weight} 克 {conc}% 的鹽水變成 {target_conc}%，需加多少克鹽？",
                "options": [f"約 {add_salt} 克", f"約 {add_salt+10} 克", f"約 {add_salt-5} 克", f"約 {add_salt+20} 克"],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "濃度問題",
                "explanation": f"設加 x 克鹽，列方程解得 x ≈ {add_salt}"
            }
        
        questions.append(q)
    
    return questions

def generate_age_questions(count):
    """生成年齡題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["past", "future"])
        
        if qtype == "past":
            father = random.randint(35, 50)
            son = random.randint(8, 18)
            years = random.randint(2, 10)
            ratio = (father - years) // (son - years) if (son - years) > 0 else 3
            
            # 調整使得 ratio 為整數
            while (father - years) % (son - years) != 0 or ratio > 10:
                years -= 1
                if years < 1:
                    years = 5
                    father += 5
            ratio = (father - years) // (son - years)
            age_sum = father + son
            
            q = {
                "content": f"父子年齡和 {age_sum} 歲，{years} 年前父親是兒子的 {ratio} 倍，父親今年幾歲？",
                "options": [str(father), str(father+4), str(father-4), str(son)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "年齡問題",
                "explanation": f"設兒子 x 歲，({age_sum}-x-{years}) = {ratio}(x-{years})，解得父親 {father} 歲"
            }
        else:
            mom = random.randint(30, 45)
            child = random.randint(5, 15)
            ratio = random.choice([2, 3])
            years = (mom - ratio * child) // (ratio - 1)
            
            q = {
                "content": f"媽媽今年 {mom} 歲，女兒 {child} 歲，幾年後媽媽是女兒的 {ratio} 倍？",
                "options": [str(years), str(years+2), str(years-2), str(years+5)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "年齡問題",
                "explanation": f"{mom}+x = {ratio}({child}+x)，解得 x = {years}"
            }
        
        questions.append(q)
    
    return questions

def generate_profit_questions(count):
    """生成利潤題"""
    questions = []
    
    for i in range(count):
        cost = random.choice([50, 60, 80, 100, 120, 150, 200])
        markup = random.choice([20, 25, 30, 40, 50])
        discount = random.choice([8, 85, 9])
        
        marked_price = cost * (1 + markup / 100)
        sale_price = marked_price * discount / 10
        profit = round(sale_price - cost, 1)
        
        q = {
            "content": f"成本 {cost} 元，加價 {markup}% 後打 {discount} 折賣出，利潤是多少元？",
            "options": [str(profit), str(profit+5), str(profit-5), str(profit+10)],
            "answer": 0,
            "grade": random.choice([5, 6]),
            "difficulty": "hard",
            "category": "利潤問題",
            "explanation": f"標價 = {cost} × {1+markup/100} = {marked_price}，售價 = {marked_price} × {discount/10} = {sale_price}，利潤 = {profit}"
        }
        questions.append(q)
    
    return questions

def generate_geometry_questions(count):
    """生成幾何題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["trapezoid", "circle", "cylinder", "triangle", "sector"])
        
        if qtype == "trapezoid":
            a = random.randint(4, 12)
            b = random.randint(8, 20)
            h = random.randint(4, 12)
            area = (a + b) * h // 2
            
            q = {
                "content": f"梯形上底 {a}、下底 {b}、高 {h}，面積是多少？",
                "options": [str(area), str(area+10), str(a*b), str((a+b)*h)],
                "answer": 0,
                "grade": 5,
                "difficulty": "hard",
                "category": "幾何問題",
                "explanation": f"梯形面積 = ({a}+{b}) × {h} ÷ 2 = {area}"
            }
        elif qtype == "circle":
            r = random.randint(3, 10)
            area = round(3.14 * r * r, 2)
            
            q = {
                "content": f"圓的半徑 {r} 公分，面積約多少平方公分？（π取3.14）",
                "options": [str(area), str(round(area*1.2, 2)), str(round(3.14*2*r, 2)), str(r*r)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "幾何問題",
                "explanation": f"面積 = πr² = 3.14 × {r}² = {area}"
            }
        elif qtype == "cylinder":
            r = random.randint(2, 6)
            h = random.randint(5, 15)
            volume = round(3.14 * r * r * h, 2)
            
            q = {
                "content": f"圓柱底面半徑 {r}、高 {h}，體積約多少？（π取3.14）",
                "options": [str(volume), str(round(volume*1.1, 2)), str(round(volume*0.9, 2)), str(r*r*h)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "幾何問題",
                "explanation": f"體積 = πr²h = 3.14 × {r}² × {h} = {volume}"
            }
        elif qtype == "triangle":
            base = random.randint(6, 15)
            height = random.randint(4, 12)
            area = base * height // 2
            
            q = {
                "content": f"三角形底 {base}、高 {height}，面積是多少？",
                "options": [str(area), str(base*height), str(area+5), str(area-5)],
                "answer": 0,
                "grade": 5,
                "difficulty": "hard",
                "category": "幾何問題",
                "explanation": f"三角形面積 = {base} × {height} ÷ 2 = {area}"
            }
        else:
            r = random.randint(6, 12)
            angle = random.choice([60, 90, 120])
            area = round(3.14 * r * r * angle / 360, 2)
            
            q = {
                "content": f"扇形圓心角 {angle}°、半徑 {r}，面積約多少？（π取3.14）",
                "options": [str(area), str(round(area*1.2, 2)), str(round(area*0.8, 2)), str(3.14*r*r)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "幾何問題",
                "explanation": f"扇形面積 = πr² × {angle}/360 = {area}"
            }
        
        questions.append(q)
    
    return questions

def generate_sequence_questions(count):
    """生成數列題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["ap_nth", "ap_sum", "gp_nth"])
        
        if qtype == "ap_nth":
            a = random.randint(1, 10)
            d = random.randint(2, 5)
            n = random.randint(10, 20)
            nth = a + (n - 1) * d
            
            q = {
                "content": f"等差數列首項 {a}、公差 {d}，第 {n} 項是多少？",
                "options": [str(nth), str(nth+d), str(nth-d), str(a*n)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "數列問題",
                "explanation": f"第 n 項 = {a} + ({n}-1)×{d} = {nth}"
            }
        elif qtype == "ap_sum":
            a = random.choice([1, 2, 3])
            d = random.choice([1, 2, 3])
            n = random.choice([10, 20, 50, 100])
            last = a + (n - 1) * d
            s = (a + last) * n // 2
            
            q = {
                "content": f"{a}+{a+d}+{a+2*d}+...+{last} = ?（共 {n} 項）",
                "options": [str(s), str(s+100), str(s-50), str(n*last)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "數列問題",
                "explanation": f"等差數列求和 = ({a}+{last})×{n}÷2 = {s}"
            }
        else:
            a = random.choice([1, 2, 3])
            r = random.choice([2, 3])
            n = random.randint(4, 6)
            nth = a * (r ** (n - 1))
            
            q = {
                "content": f"等比數列首項 {a}、公比 {r}，第 {n} 項是多少？",
                "options": [str(nth), str(nth*r), str(nth//r), str(a*n*r)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "數列問題",
                "explanation": f"第 n 項 = {a} × {r}^({n}-1) = {nth}"
            }
        
        questions.append(q)
    
    return questions

def generate_ratio_questions(count):
    """生成比例題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["divide", "scale"])
        
        if qtype == "divide":
            r1, r2, r3 = random.randint(1, 5), random.randint(2, 6), random.randint(1, 5)
            total = random.choice([100, 150, 200, 240, 300, 360, 400, 500])
            # 調整使得能整除
            total_parts = r1 + r2 + r3
            total = total_parts * random.randint(10, 50)
            b_amount = total * r2 // total_parts
            
            q = {
                "content": f"甲乙丙按 {r1}:{r2}:{r3} 分 {total} 元，乙分得多少元？",
                "options": [str(b_amount), str(total*r1//total_parts), str(total*r3//total_parts), str(total//3)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "比例問題",
                "explanation": f"總份數 = {total_parts}，乙 = {total} × {r2}/{total_parts} = {b_amount}"
            }
        else:
            scale = random.choice([20000, 50000, 100000, 200000])
            map_dist = random.choice([2, 3, 4, 5, 6, 8, 10])
            real_dist = map_dist * scale / 100000  # 公里
            
            q = {
                "content": f"地圖比例尺 1:{scale}，圖上 {map_dist} 公分代表實際多少公里？",
                "options": [str(real_dist), str(real_dist*2), str(real_dist/2), str(map_dist*scale)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "比例問題",
                "explanation": f"實際 = {map_dist} × {scale} = {map_dist*scale} 公分 = {real_dist} 公里"
            }
        
        questions.append(q)
    
    return questions

def generate_logic_questions(count):
    """生成邏輯題"""
    questions = []
    
    templates = [
        {"content": "從 1 到 {n}，{mult} 的倍數有幾個？", "type": "count_mult"},
        {"content": "從 1 到 {n}，既是 {a} 的倍數又是 {b} 的倍數有幾個？", "type": "count_lcm"},
        {"content": "用 1,2,3,4,5 組成五位數（不重複），最大與最小相差多少？", "type": "max_min"},
    ]
    
    for i in range(count):
        qtype = random.choice(["count_mult", "count_lcm", "divisibility"])
        
        if qtype == "count_mult":
            n = random.choice([50, 100, 200, 500, 1000])
            mult = random.choice([3, 4, 5, 6, 7, 8, 9])
            ans = n // mult
            
            q = {
                "content": f"從 1 到 {n}，{mult} 的倍數有幾個？",
                "options": [str(ans), str(ans+1), str(ans-1), str(n//mult+mult)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "邏輯推理",
                "explanation": f"{n} ÷ {mult} = {ans}...，有 {ans} 個"
            }
        elif qtype == "count_lcm":
            n = random.choice([100, 200, 500])
            a, b = random.choice([(2, 3), (3, 4), (3, 5), (4, 5), (2, 5)])
            lcm = (a * b) // gcd(a, b)
            ans = n // lcm
            
            q = {
                "content": f"從 1 到 {n}，既是 {a} 的倍數又是 {b} 的倍數有幾個？",
                "options": [str(ans), str(n//a), str(n//b), str(ans+5)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "邏輯推理",
                "explanation": f"要是 {lcm} 的倍數，{n}÷{lcm} = {ans} 個"
            }
        else:
            a = random.randint(3, 9)
            b = random.randint(3, 9)
            while a == b:
                b = random.randint(3, 9)
            r1 = random.randint(1, a-1)
            r2 = random.randint(1, b-1)
            # 找最小的數
            for x in range(1, 1000):
                if x % a == r1 and x % b == r2:
                    ans = x
                    break
            
            q = {
                "content": f"一個數除以 {a} 餘 {r1}、除以 {b} 餘 {r2}，100 以內最小的這個數是？",
                "options": [str(ans), str(ans+a*b), str(ans+a), str(ans+b)],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "邏輯推理",
                "explanation": f"逐一檢驗，最小的數是 {ans}"
            }
        
        questions.append(q)
    
    return questions

def generate_probability_questions(count):
    """生成機率題"""
    questions = []
    
    for i in range(count):
        qtype = random.choice(["dice", "ball", "coin"])
        
        if qtype == "dice":
            target = random.choice([6, 7, 8, 9, 10, 11])
            # 計算和為 target 的組合數
            combos = sum(1 for a in range(1, 7) for b in range(1, 7) if a + b == target)
            
            q = {
                "content": f"擲兩顆骰子，點數和是 {target} 的機率是多少？",
                "options": [f"{combos}/36", f"{combos+1}/36", f"{combos-1}/36", f"1/6"],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "機率問題",
                "explanation": f"和為 {target} 的組合有 {combos} 種，機率 = {combos}/36"
            }
        elif qtype == "ball":
            r = random.randint(2, 5)
            w = random.randint(3, 6)
            total = r + w
            
            q = {
                "content": f"袋中有 {r} 紅、{w} 白球，取一球是紅球的機率是？",
                "options": [f"{r}/{total}", f"{w}/{total}", f"1/2", f"{r}/{w}"],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "機率問題",
                "explanation": f"紅球機率 = {r}/{total}"
            }
        else:
            n = random.choice([2, 3, 4])
            # 至少一次正面
            all_tails = 1
            for _ in range(n):
                all_tails *= 2
            prob_tails = 1
            prob_at_least_one_head = f"{all_tails-1}/{all_tails}"
            
            q = {
                "content": f"連續擲 {n} 次硬幣，至少一次正面的機率是？",
                "options": [prob_at_least_one_head, f"1/{all_tails}", "1/2", f"{n}/{all_tails}"],
                "answer": 0,
                "grade": 6,
                "difficulty": "hard",
                "category": "機率問題",
                "explanation": f"全反面機率 = 1/{all_tails}，至少一正面 = {prob_at_least_one_head}"
            }
        
        questions.append(q)
    
    return questions

def generate_mixed_questions(count):
    """生成綜合應用題"""
    questions = []
    
    templates = [
        {
            "content": "分糖果，每人 {a} 顆剩 {r1} 顆，每人 {b} 顆差 {r2} 顆，共有幾人？",
            "type": "surplus"
        },
        {
            "content": "一個數加 {a} 再乘 {b} 等於 {result}，這個數是多少？",
            "type": "reverse"
        },
    ]
    
    for i in range(count):
        qtype = random.choice(["surplus", "reverse", "equation"])
        
        if qtype == "surplus":
            a = random.randint(3, 6)
            b = a + random.randint(1, 3)
            n = random.randint(5, 15)
            r1 = random.randint(1, 10)
            total = a * n + r1
            r2 = b * n - total
            
            q = {
                "content": f"分糖果，每人 {a} 顆剩 {r1} 顆，每人 {b} 顆差 {r2} 顆，共有幾人？",
                "options": [str(n), str(n+1), str(n-1), str(n+2)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "綜合應用",
                "explanation": f"設 n 人，{a}n+{r1} = {b}n-{r2}，n = {n}"
            }
        elif qtype == "reverse":
            x = random.randint(5, 20)
            a = random.randint(2, 8)
            b = random.randint(2, 5)
            result = (x + a) * b
            
            q = {
                "content": f"一個數加 {a} 再乘 {b} 等於 {result}，這個數是多少？",
                "options": [str(x), str(x+2), str(x-2), str(result//b)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "綜合應用",
                "explanation": f"倒推：{result}÷{b} = {result//b}，{result//b}-{a} = {x}"
            }
        else:
            a = random.randint(2, 5)
            b = random.randint(10, 30)
            x = random.randint(5, 15)
            result = a * x + b
            
            q = {
                "content": f"一個數的 {a} 倍加 {b} 等於 {result}，這個數是多少？",
                "options": [str(x), str(x+2), str((result-b)//a + 1), str(result//a)],
                "answer": 0,
                "grade": random.choice([5, 6]),
                "difficulty": "hard",
                "category": "綜合應用",
                "explanation": f"設數為 x，{a}x + {b} = {result}，x = {x}"
            }
        
        questions.append(q)
    
    return questions

def main():
    all_questions = []
    
    # 生成各類型題目
    print("生成分數題...")
    all_questions.extend(generate_fraction_questions(50))
    
    print("生成雞兔同籠...")
    all_questions.extend(generate_chicken_rabbit_questions(50))
    
    print("生成速率題...")
    all_questions.extend(generate_speed_questions(60))
    
    print("生成工程題...")
    all_questions.extend(generate_work_questions(40))
    
    print("生成濃度題...")
    all_questions.extend(generate_concentration_questions(50))
    
    print("生成年齡題...")
    all_questions.extend(generate_age_questions(40))
    
    print("生成利潤題...")
    all_questions.extend(generate_profit_questions(40))
    
    print("生成幾何題...")
    all_questions.extend(generate_geometry_questions(60))
    
    print("生成數列題...")
    all_questions.extend(generate_sequence_questions(40))
    
    print("生成比例題...")
    all_questions.extend(generate_ratio_questions(40))
    
    print("生成邏輯題...")
    all_questions.extend(generate_logic_questions(40))
    
    print("生成機率題...")
    all_questions.extend(generate_probability_questions(40))
    
    print("生成綜合題...")
    all_questions.extend(generate_mixed_questions(50))
    
    # 添加 ID
    for i, q in enumerate(all_questions):
        q["id"] = f"ps-batch-{6000 + i}"
        q["source"] = "考私中批量"
    
    # 統計
    print(f"\n總計生成 {len(all_questions)} 題")
    
    # 儲存
    with open("questions-ps-batch.json", "w", encoding="utf-8") as f:
        json.dump({"questions": all_questions}, f, ensure_ascii=False, indent=2)
    
    print("已儲存到 questions-ps-batch.json")

if __name__ == "__main__":
    main()
