#!/bin/bash

echo "🚀 啟動國小數學題庫系統..."

cd "$(dirname "$0")"

# 殺掉現有進程
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 啟動開發伺服器
npm run dev

echo "✅ 系統已啟動，請訪問 http://localhost:3000"
