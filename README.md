# 📐 國小數學題庫系統

支點教育 K12 團隊專屬練習平台

## 功能特色

- ✅ 用戶註冊/登入系統
- ✅ 五年級數學練習（25題段考難題）
- ✅ 六年級數學練習（25題段考難題）
- ✅ 即時答題與批改
- ✅ 錯題本記錄
- ✅ 學習進度追蹤

## 🚀 一鍵部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Eddie740806/math-quiz-app)

或手動部署：
1. 登入 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 選擇 "Import Git Repository"
4. 貼上 `https://github.com/Eddie740806/math-quiz-app`
5. 點擊 "Deploy"

部署完成後會得到一個 `xxx.vercel.app` 的網址。

## 技術架構

- **前端**: Next.js 16 + React + TypeScript
- **樣式**: Tailwind CSS
- **資料儲存**: localStorage（瀏覽器本地存儲）
- **部署**: Vercel（免費）

## 本地開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置生產版本
npm run build

# 啟動生產版本
npm start
```

## 頁面結構

| 路徑 | 功能 |
|------|------|
| `/` | 首頁（年級選擇） |
| `/register` | 用戶註冊 |
| `/login` | 用戶登入 |
| `/quiz?grade=5` | 五年級刷題 |
| `/quiz?grade=6` | 六年級刷題 |
| `/wrong-answers` | 錯題本 |

## 📚 題庫內容（50題段考難題）

### 五年級（25題）
參考 tcool.cc 台灣段考題型設計：
- 分數逆推問題（買蘋果、剪緞帶）
- 時間間隔計算（火車發車、學校待留時間）
- 百分比應用（糖果比例、及格率）
- 分數小數混合運算
- 最大公因數/最小公倍數應用
- 周長面積計算
- 速率問題
- 和差問題

### 六年級（25題）
- 分數連續計算（竹竿問題）
- 正負數運算（溫度計算）
- 一元一次方程式
- 圓環面積（步道問題）
- 圓柱體積換算
- 比與比值應用
- 連續折扣計算
- 速率追及問題
- 年齡問題
- 工作問題
- 等差數列求和

## 後續擴展

1. [ ] 接入 Supabase 資料庫（跨裝置同步）
2. [ ] 新增更多題目（目標 200 題）
3. [ ] 從 tcool.cc 自動抓取題目
4. [ ] 新增圖形題支援
5. [ ] 家長報表功能
6. [ ] 難度分級（簡單/中等/困難）

## 開發者

由 AI 助理開發，支點教育 K12 團隊專用

---

**版本**: 1.0.0  
**建立日期**: 2026-02-16  
**GitHub**: https://github.com/Eddie740806/math-quiz-app
