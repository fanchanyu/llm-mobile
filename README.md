# LLM-Mobile

> LLM-ERP V2 手機端應用 — React Native Expo · 桌機一體即時同步
> Mobile Client for LLM-ERP V2 — React Native Expo · Desktop-Mobile Real-Time Sync

---

## Overview / 概覽

LLM-Mobile is the mobile extension of **LLM-ERP V2**, providing real-time ERP operations on your phone with full desktop parity.

LLM-Mobile 是 LLM-ERP V2 的手機端延伸，手機上即時操作 ERP，與桌機完全同步。

### Key Features / 核心功能

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | KPI cards + Quick Actions + Live event stream |
| 📦 **Inventory** | Stock query + Low stock alerts |
| ✅ **Approvals** | One-click approve/reject + RBAC |
| 🤖 **AI Chat** | Voice input + Text conversation |
| 🔔 **Notifications** | SSE real-time push |
| 🔐 **Unified Auth** | JWT + RBAC (7 roles, 65 permissions) |

---

## Architecture / 架構

```
📱 Mobile (Expo RN)              💻 Desktop (React)
     │                                 │
     │    Same API + Same JWT Token     │
     └──────────┬──────────────────────┘
                │
        ┌───────▼──────────┐
        │  API Gateway     │
        │  Port 8000       │
        │  REST + SSE      │
        └───────┬──────────┘
                │
        ┌───────▼──────────┐
        │  LLM-ERP Backend │
        │  EventBus → SSE  │
        │  7 Domain Modules│
        └──────────────────┘
```

**View topology diagrams / 查看拓樸圖：**
- [System Architecture / 系統架構](docs/llm-mobile-architecture.html) — bilingual CN/EN
- [Database Relationships / 資料表關聯](docs/form-topology.html) — bilingual CN/EN

---

## Quick Start / 快速開始

```bash
# 1. Clone
git clone https://github.com/fanchanyu/llm-mobile.git
cd llm-mobile

# 2. Install
npm install

# 3. Configure backend in src/api/client.ts
#    Edit BASE_URL to your LLM-ERP backend IP

# 4. Start backend (separate terminal)
cd /path/to/LLM_ERP/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 5. Start mobile app
npx expo start
```

---

## Documentation / 文件

| File | Description |
|------|-------------|
| [Installation Guide (CN)](docs/LLM-Mobile-Installation-Guide-CN.pdf) | 中文安裝操作手冊 |
| [Installation Guide (EN)](docs/LLM-Mobile-Installation-Guide-EN.pdf) | English installation guide |
| [Architecture Topology](docs/LLM-Mobile-Architecture-Topology.pdf) | System architecture diagram |
| [Form Topology](docs/LLM-Mobile-Form-Topology.pdf) | Database table relationship diagram |
| [Architecture Topology (HTML)](docs/llm-mobile-architecture.html) | Interactive bilingual architecture |
| [Form Topology (HTML)](docs/form-topology.html) | Interactive bilingual form topology |

---

## Tech Stack / 技術棧

- **Mobile**: React Native Expo + Expo Router + Zustand + React Query
- **Backend**: Python FastAPI + SQLAlchemy Async
- **Auth**: JWT + RBAC (7 roles · 65 permissions)
- **Real-time**: SSE Event Stream (12 event types)
- **Database**: 43 tables · 11 domains · 57 FK

---

## License / 授權

MIT © 2026 Chang-Yu Fan
