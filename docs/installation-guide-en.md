# LLM-Mobile Installation & Operation Guide

> LLM-ERP V2 Mobile Client — React Native Expo · Desktop-Mobile Real-Time Sync

---

## 📋 System Overview

LLM-Mobile is the mobile extension of LLM-ERP V2, providing **6 main screens**:

| Screen | Function |
|--------|----------|
| Login | JWT authentication + Server IP config |
| Dashboard | KPI cards + Quick Actions + Live event stream |
| Inventory | Stock query + Low stock warnings |
| Approvals | One-click approve/reject + RBAC permission check |
| AI Chat | Voice input + Text conversation |
| Notifications | SSE real-time push notification center |

### Core Features

- **Desktop-Mobile Unified**: Mobile and desktop share the same REST API + SSE push
- **Unified RBAC**: Same JWT token, same role permissions, backend is the gatekeeper
- **SSE Real-Time Sync**: EventBus → Broadcaster → Mobile/Desktop receive events simultaneously
- **Light Theme**: Background #F0F4F8 · White cards · Domain-colored borders

---

## 📁 Project Structure

```
D:\Project\LLM-Mobile\
├── app/                     # Expo Router pages
│   ├── _layout.tsx          # Root layout (Auth Guard + Global SSE)
│   ├── login.tsx            # Login page
│   ├── inventory.tsx        # Inventory query
│   ├── approvals.tsx        # Pending approvals
│   └── (tabs)/              # Bottom tab pages
│       ├── _layout.tsx      # Tab navigation
│       ├── dashboard.tsx    # Dashboard
│       ├── chat.tsx         # AI Chat
│       ├── notifications.tsx# Notification center
│       └── profile.tsx      # Profile settings
├── src/
│   ├── api/                 # API clients
│   │   ├── client.ts        # HTTP client (auto JWT)
│   │   ├── auth.ts          # Login API
│   │   ├── sse.ts           # SSE engine
│   │   └── ...
│   ├── stores/              # Zustand state management
│   │   ├── authStore.ts     # Auth + RBAC
│   │   └── appStore.ts      # Global app state
│   └── constants/
│       └── theme.ts         # Theme constants
├── docs/
│   ├── llm-mobile-architecture.html  # System architecture topology (CN/EN toggle)
│   └── form-topology.html            # Table relationship topology (CN/EN toggle)
├── app.json                 # Expo config
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## 🔧 Installation

### Prerequisites

| Tool | Version | Description |
|------|---------|-------------|
| Node.js | ≥ 18.x | JavaScript runtime |
| npm or yarn | ≥ 8.x | Package manager |
| Expo CLI | ≥ 50.x | React Native dev tools |
| Python | ≥ 3.10 | Backend (LLM-ERP) |
| LLM-ERP Backend | V2 | See LLM-ERP installation guide |

### 1️⃣ Download Project

```bash
git clone https://github.com/fanchanyu/llm-mobile.git
cd llm-mobile
```

Or copy from Windows directly:

```bash
cd /mnt/d/Project/LLM-Mobile
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Backend Connection

Edit `BASE_URL` in `src/api/client.ts`:

```typescript
const BASE_URL = 'http://<your_backend_IP>:8000';
```

If backend is on your local machine (phone and dev machine on same network):

```typescript
const BASE_URL = 'http://192.168.x.x:8000';  // Replace with your LAN IP
```

### 4️⃣ Start Backend

```bash
cd /mnt/d/Project/LLM_ERP/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5️⃣ Start Mobile App

```bash
cd /mnt/d/Project/LLM-Mobile
npx expo start
```

Scan the QR code with your phone (requires **Expo Go** App), or press `a` for Android emulator.

---

## 🎯 User Guide

### Login

1. Open the app → Login screen appears
2. Enter username and password (default: `admin` / `123456`)
3. Tap "Login" → JWT Token stored automatically

### Dashboard

- **Top**: KPI cards (Active Orders / Items / AR Balance)
- **Middle**: Quick Actions (4 entry points)
- **Bottom**: Live event stream (SSE real-time updates)
- Preview mode shows orange Demo banner

### Inventory Query

1. Tap "Inventory" from Dashboard
2. Use search bar to find parts
3. Low stock items shown in red

### Approvals

1. Tap "Approvals" from Dashboard
2. View pending purchase orders / quality issues
3. Tap "Approve" or "Reject"

### AI Chat

1. Tap "Chat" from bottom navigation
2. Type text or tap microphone for voice input
3. AI responds with ERP data query results

### Notification Center

- All events display in real-time
- Unread notifications highlighted with light purple
- Tap to view details

### Settings

- Language toggle (CN/EN)
- Server configuration
- Logout

---

## 🏗️ Topology Diagrams

### System Architecture Topology

**File**: `docs/llm-mobile-architecture.html`

- 6 layers (Mobile → API → Frontend → Backend → Data → Mesh)
- Top-right **中文 / EN** button to toggle language
- Mobile screen previews (6 mockup phones)
- SSE sync verification section

### Database Relationship Topology

**File**: `docs/form-topology.html`

- 43 tables · 11 domains · 57 FK relationships
- Top-right **EN / 中文** button to toggle language
- Solid lines = Foreign Key (database constraint)
- Dashed lines = Logical FK (cross-domain)
- Each domain color-coded

---

## 🔄 Sync Flow

```
Desktop War Room clicks "Simulate Event"
     ↓
REST API → EventBus.publish()
     ↓
Broadcaster role-based filter
     ↓
SSE Push → Mobile appStore.liveEvents updates
          → Desktop War Room event count increments
```

Verified event types:
- `purchase_order.created` — Purchase order created
- `non_conformance.created` — Quality non-conformance

---

## 📝 Notes

1. **Phone and backend must be on the same network** (or backend has public IP)
2. Install Expo Go from App Store / Google Play
3. First login: `admin` / `123456`
4. Backend does not support HTTPS; allow HTTP connections on phone
5. Preview mode uses mock data, does not affect real DB

---

## 🐛 Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Cannot connect to backend | Wrong IP | Check `BASE_URL` in `src/api/client.ts` |
| Expo fails to start | Node version mismatch | `nvm use 18` or `nvm use 20` |
| No SSE events received | EventBus not started | Verify uvicorn is running correctly |
| Login failed | JWT expired | Re-login |

---

## 📄 Version Info

- **Version**: v2.0+mobile
- **Backend**: LLM-ERP V2 (FastAPI + SQLAlchemy Async)
- **Frontend**: React Native Expo + React TS
- **Auth**: JWT + RBAC (7 roles · 65 permissions)
- **Real-time**: SSE Event Stream (12 event types)
- **Database**: 43 tables · 11 domains · 57 FK
- **Last Updated**: 2026-05-12
