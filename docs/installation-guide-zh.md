# LLM-Mobile 安裝與操作手冊

> LLM-ERP V2 的手機端應用 — React Native Expo · 桌機一體即時同步

---

## 📋 系統概覽

LLM-Mobile 是 LLM-ERP V2 的手機端延伸，提供 **6 個主要功能畫面**：

| 畫面 | 功能 |
|------|------|
| Login | JWT 登入 + 伺服器 IP 設定 |
| Dashboard | KPI 卡片 + Quick Actions + 即時事件流 |
| Inventory | 庫存查詢 + 低庫存警告 |
| Approvals | 一鍵核准/駁回 + RBAC 權限檢查 |
| AI Chat | 語音輸入 + 文字對話 |
| Notifications | SSE 即時推播通知中心 |

### 核心特性

- **桌機一體**：手機與桌機共用同一組 REST API + SSE 即時推播
- **統一 RBAC**：同一組 JWT Token、同一套角色權限，後端為守門員
- **SSE 即時同步**：EventBus → Broadcaster → 手機/桌機同時收到事件
- **淺色主題**：背景 #F0F4F8 · 白色卡片 · 領域分色邊框

---

## 📁 專案結構

```
D:\Project\LLM-Mobile\
├── app/                     # Expo Router 頁面
│   ├── _layout.tsx          # 根佈局（Auth Guard + 全域 SSE）
│   ├── login.tsx            # 登入頁
│   ├── inventory.tsx        # 庫存查詢
│   ├── approvals.tsx        # 待核准
│   └── (tabs)/              # 底部 Tab 頁面
│       ├── _layout.tsx      # Tab 導航
│       ├── dashboard.tsx    # 看板
│       ├── chat.tsx         # AI 對話
│       ├── notifications.tsx# 通知中心
│       └── profile.tsx      # 個人設定
├── src/
│   ├── api/                 # API 客戶端
│   │   ├── client.ts        # HTTP 客戶端（自動 JWT）
│   │   ├── auth.ts          # 登入 API
│   │   ├── sse.ts           # SSE 引擎
│   │   └── ...
│   ├── stores/              # Zustand 狀態管理
│   │   ├── authStore.ts     # 認證 + RBAC
│   │   └── appStore.ts      # 全域 App 狀態
│   └── constants/
│       └── theme.ts         # 主題常數
├── docs/
│   ├── llm-mobile-architecture.html  # 系統架構拓樸圖（中英切換）
│   └── form-topology.html            # 資料表關聯拓樸圖（中英切換）
├── app.json                 # Expo 設定
├── package.json             # 依賴管理
└── tsconfig.json            # TypeScript 設定
```

---

## 🔧 安裝步驟

### 前置需求

| 工具 | 版本要求 | 說明 |
|------|---------|------|
| Node.js | ≥ 18.x | JavaScript 執行環境 |
| npm 或 yarn | ≥ 8.x | 套件管理 |
| Expo CLI | ≥ 50.x | React Native 開發工具 |
| Python | ≥ 3.10 | 後端（LLM-ERP） |
| LLM-ERP Backend | V2 | 請參考 LLM-ERP 安裝說明 |

### 1️⃣ 下載專案

```bash
git clone https://github.com/fanchanyu/llm-mobile.git
cd llm-mobile
```

或直接從 Windows 複製：

```bash
cd /mnt/d/Project/LLM-Mobile
```

### 2️⃣ 安裝相依套件

```bash
npm install
```

### 3️⃣ 設定後端連線

編輯 `src/api/client.ts` 中的 `BASE_URL`：

```typescript
const BASE_URL = 'http://<你的後端IP>:8000';
```

若後端在本機（手機與開發機同網路）：

```typescript
const BASE_URL = 'http://192.168.x.x:8000';  // 填入你電腦的區域網路 IP
```

### 4️⃣ 啟動後端

```bash
cd /mnt/d/Project/LLM_ERP/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5️⃣ 啟動手機 App

```bash
cd /mnt/d/Project/LLM-Mobile
npx expo start
```

用手機掃描 QR Code（需安裝 **Expo Go** App），或按 `a` 用 Android 模擬器。

---

## 🎯 操作說明

### 登入

1. 開啟 App → 顯示登入畫面
2. 輸入使用者名稱和密碼（預設：`admin` / `123456`）
3. 點擊「登入」→ JWT Token 自動儲存

### 看板 (Dashboard)

- 頂部：**KPI 卡片**（在線工單 / 庫存品項 / 應收帳款）
- 中間：**Quick Actions** 四個快速入口
- 底部：**即時事件流**（SSE 即時更新）
- 預覽模式下顯示橘色 Demo 標示

### 庫存查詢

1. 從 Dashboard 點擊「庫存查詢」
2. 使用搜尋欄搜尋物料
3. 低庫存物料以紅色標示

### 待核准

1. 從 Dashboard 點擊「待核准」
2. 查看待核准的採購單 / 品質異常
3. 點擊「核准」或「駁回」

### AI 對話

1. 從底部導航點擊「對話」
2. 輸入文字或點擊麥克風輸入語音
3. AI 回覆包含 ERP 資料查詢結果

### 通知中心

- 所有事件即時顯示在通知列表
- 未讀通知以淺紫底色標示
- 點擊可查看詳情

### 設定

- 語言切換（中/英）
- 伺服器設定
- 登出

---

## 🏗️ 架構圖操作

### 系統架構拓樸圖

**檔案**：`docs/llm-mobile-architecture.html`

- 6 層架構（Mobile → API → Frontend → Backend → Data → Mesh）
- 右上角 **中文 / EN** 按鈕切換語言
- 手機畫面預覽（6 支模擬手機）
- SSE 同步流程驗證區塊

### 表單關連拓樸圖

**檔案**：`docs/form-topology.html`

- 43 張資料表 · 11 個領域 · 57 條 FK 關聯
- 右上角 **EN / 中文** 按鈕切換語言
- 實線 = Foreign Key（資料庫約束）
- 虛線 = Logical FK（跨領域關聯）
- 每個領域以不同顏色標示

---

## 🔄 同步流程

```
桌機 War Room 點擊「模擬事件」
     ↓
REST API → EventBus.publish()
     ↓
Broadcaster 依角色過濾
     ↓
SSE 推播 → 手機 appStore.liveEvents 更新
          → 桌機 War Room 事件計數增加
```

已驗證事件類型：
- `purchase_order.created` — 採購單建立
- `non_conformance.created` — 品質異常

---

## 📝 注意事項

1. **手機與後端需在同一網路**（或後端有公網 IP）
2. Expo Go 需從 App Store / Google Play 安裝
3. 首次登入使用 `admin` / `123456`
4. 後端不支援 HTTPS，手機需允許 HTTP 連線
5. 預覽模式下資料為模擬資料，不影響實際 DB

---

## 🐛 疑難排解

| 問題 | 可能原因 | 解決方法 |
|------|---------|---------|
| 無法連線後端 | IP 設定錯誤 | 檢查 `src/api/client.ts` 的 BASE_URL |
| Expo 無法啟動 | Node 版本不相容 | `nvm use 18` 或 `nvm use 20` |
| SSE 沒收到事件 | 後端未啟動 EventBus | 確認後端 uvicorn 正確運行 |
| 登入失敗 | JWT 過期 | 重新登入 |

---

## 📄 版本資訊

- **版本**：v2.0+mobile
- **後端**：LLM-ERP V2（FastAPI + SQLAlchemy Async）
- **前端**：React Native Expo + React TS
- **認證**：JWT + RBAC（7 角色 · 65 權限）
- **即時通訊**：SSE Event Stream（12 事件類型）
- **資料庫**：43 張表 · 11 領域 · 57 個外鍵
- **最後更新**：2026-05-12
