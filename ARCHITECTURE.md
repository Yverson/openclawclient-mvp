# OpenClaw Client App — Architecture Technique

**Version:** 1.0  
**Status:** Design Phase  
**Updated:** 2026-02-11

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER MACHINE (Desktop)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         OpenClaw Client App (Electron/Tauri)        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │   React UI   │  │  State Mgmt  │  │ Services │  │   │
│  │  │              │  │  (Redux/Zustand) │          │  │   │
│  │  ├──────────────┤  ├──────────────┤  └──────────┘  │   │
│  │  │ Dashboard    │  │ App State    │  • Auth Svc    │   │
│  │  │ Mail Filter  │  │ UI State     │  • API Client  │   │
│  │  │ File Search  │  │ Cache        │  • Local Svcs  │   │
│  │  │ Chat         │  │              │                │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  │         ▲                  ▲               ▲          │   │
│  │         └──────────────────┴───────────────┘          │   │
│  │                    IPC Bridge                         │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │         Electron/Tauri Main Process            │ │   │
│  │  ├─────────────────────────────────────────────────┤ │   │
│  │  │                                                 │ │   │
│  │  │  • Window Management                           │ │   │
│  │  │  • File System Access                          │ │   │
│  │  │  • Email Client Integration (Himalaya)        │ │   │
│  │  │  • Native Notifications                        │ │   │
│  │  │  • Session Persistence (SQLite)               │ │   │
│  │  │                                                 │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │         ▲                                              │   │
│  └─────────┼──────────────────────────────────────────────┘   │
│            │ HTTP/WebSocket                                   │
└────────────┼───────────────────────────────────────────────────┘
             │
             │ INTERNET
             │
┌────────────┼───────────────────────────────────────────────────┐
│            ▼                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           OpenClaw Gateway (Remote)                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ • Auth API (/auth/token)                               │  │
│  │ • Status API (/api/status)                             │  │
│  │ • WebSocket (/ws/matrix) ← Chat with Claude            │  │
│  │ • Dokploy API Gateway                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│            ▲                ▲                                  │
│            │                │                                  │
│       ┌────┴────┐      ┌────┴────┐                            │
│       │          │      │         │                           │
│  ┌────▼──┐  ┌───▼──┐ ┌─▼──┐ ┌────▼──┐                        │
│  │PROD   │  │SEC.  │ │Dok │ │Ollama │                        │
│  │161.97 │  │213.1 │ │ploy│ │(12000)│                        │
│  │178.66 │  │36.87 │ │API │ │      │                        │
│  └───────┘  └──────┘ └────┘ └───────┘                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Frontend (Renderer Process)

```typescript
Framework & UI:
  ├── React 18.2+
  ├── TailwindCSS 3.x
  ├── Shadcn/ui (component library)
  └── Lucide React (icons)

State Management:
  ├── Zustand (lightweight state)
  ├── React Query (API caching)
  └── Electron Store (persistent settings)

Utilities:
  ├── axios (HTTP client)
  ├── ws (WebSocket)
  ├── date-fns (date formatting)
  └── zod (schema validation)
```

### Main Process (Electron/Tauri)

```typescript
Platform:
  ├── Electron 27+  OR  Tauri 2.x
  ├── Node.js (for native modules)
  └── SQLite3 (local database)

Core Libraries:
  ├── nodemailer (mail parsing)
  ├── glob (file search)
  ├── better-sqlite3 (local DB)
  └── dotenv (env config)

System Integration:
  ├── OS notifications (cross-platform)
  ├── File system watchers
  └── Process management
```

### Backend API (OpenClaw Gateway)

```typescript
Existing Services:
  ├── OpenClaw Gateway (main)
  ├── Dokploy (deployments)
  ├── Ollama (AI inference)
  └── Matrix/Claude (chat)

Protocols:
  ├── REST API (GET /api/status, POST /auth/token)
  └── WebSocket (/ws/matrix for real-time chat)
```

---

## 📦 Component Architecture

### Layer 1: Renderer (React Components)

```
src/
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx       (sidebar + content)
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── MailScreen.tsx
│   │   ├── FileSearchScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── dashboard/
│   │   ├── ServerCard.tsx
│   │   ├── ContainersList.tsx
│   │   ├── DeploymentHistory.tsx
│   │   └── AlertBell.tsx
│   ├── mail/
│   │   ├── MailFilter.tsx
│   │   ├── MailList.tsx
│   │   └── MailPreview.tsx
│   ├── files/
│   │   ├── FileSearch.tsx
│   │   ├── FileResults.tsx
│   │   └── FilePreview.tsx
│   ├── chat/
│   │   ├── ChatWidget.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Spinner.tsx
│       └── NotificationToast.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── AppPage.tsx
│   └── ErrorPage.tsx
├── hooks/
│   ├── useAuth.ts              (auth state)
│   ├── useDashboard.ts         (server status)
│   ├── useMail.ts              (mail filtering)
│   ├── useFileSearch.ts        (file search)
│   ├── useChat.ts              (Matrix connection)
│   └── useNotifications.ts     (alerts)
├── services/
│   ├── api.ts                  (Axios instance)
│   ├── websocket.ts            (Matrix WS)
│   ├── auth.ts                 (JWT management)
│   ├── mail.ts                 (mail operations)
│   ├── files.ts                (file operations)
│   └── notifications.ts        (system alerts)
├── store/
│   ├── authStore.ts
│   ├── appStore.ts
│   ├── uiStore.ts
│   └── cacheStore.ts
├── types/
│   ├── auth.ts
│   ├── server.ts
│   ├── mail.ts
│   ├── file.ts
│   ├── chat.ts
│   └── api.ts
├── utils/
│   ├── formatting.ts           (date, size)
│   ├── validation.ts           (forms)
│   ├── errors.ts               (error handling)
│   └── constants.ts            (config)
├── App.tsx
└── index.tsx
```

### Layer 2: Main Process (Electron/Tauri)

```
src-tauri/  (or electron/)
├── src/
│   ├── main.rs / main.js       (entry point)
│   ├── handlers/
│   │   ├── mail.rs / mail.js   (mail parsing)
│   │   ├── files.rs / files.js (file search)
│   │   ├── system.rs / system.js (notifications)
│   │   └── auth.rs / auth.js   (token storage)
│   ├── db/
│   │   ├── init.rs / init.js   (SQLite setup)
│   │   ├── migrations/
│   │   │   ├── 001_create_sessions.sql
│   │   │   ├── 002_create_cache.sql
│   │   │   └── 003_create_settings.sql
│   │   └── models.rs / models.js
│   ├── services/
│   │   ├── mail_service.rs
│   │   ├── file_service.rs
│   │   ├── notification_service.rs
│   │   └── auth_service.rs
│   └── config/
│       └── config.rs / config.js
├── Cargo.toml / package.json
└── tauri.conf.json / electron.json
```

---

## 🔄 Data Flow

### 1. Login Flow
```
User enters token
        ↓
[LoginPage component]
        ↓
POST /auth/token (OpenClaw API)
        ↓
Validate response
        ↓
Store JWT in localStorage + SQLite
        ↓
authStore.setUser(user)
        ↓
Redirect to Dashboard
```

### 2. Dashboard Update Flow (30s interval)
```
App mounted
        ↓
useEffect → setInterval
        ↓
GET /api/status (OpenClaw)
        ↓
dashboardStore.setServers(data)
        ↓
React re-renders ServerCard components
        ↓
Every 30s: repeat
```

### 3. Mail Filter Flow
```
User clicks "Mail"
        ↓
MailFilterComponent mounts
        ↓
IPC call: ipcRenderer.invoke('mail:list')
        ↓
[Main Process]
  • Parse email client (Outlook / Gmail)
  • Filter by: sender, keyword, date
  • Return results
        ↓
React Query caches results
        ↓
Render MailList component
```

### 4. Chat Flow (WebSocket)
```
User types message
        ↓
MessageInput component
        ↓
WebSocket send → OpenClaw /ws/matrix
        ↓
[Remote]
  • Matrix receives message
  • Claude processes
  • Returns response
        ↓
WebSocket recv
        ↓
chatStore.addMessage(response)
        ↓
MessageList re-renders
```

---

## 📊 API Contracts

### Authentication

```typescript
// Login
POST /auth/token
{
  "openclawUrl": "http://localhost:18789",
  "token": "sk_..."
}
→ {
  "user": {
    "id": "user-123",
    "name": "Mathieu",
    "role": "admin"
  },
  "token": "jwt_..."
}
```

### Server Status

```typescript
// Get servers + containers
GET /api/status?format=json
→ {
  "servers": [
    {
      "id": "prod",
      "name": "PROD (161.97.178.66)",
      "status": "up",
      "uptime": "1d 12h",
      "cpu": 45,
      "ram": { "used": 9.8, "total": 11 },
      "disk": { "used": 68, "total": 387 }
    }
  ],
  "containers": [
    {
      "id": "sevene-seveneclient",
      "status": "running",
      "cpu": 0.5,
      "memory": 256,
      "uptime": "9h"
    }
  ],
  "deployments": [
    {
      "id": "deploy-123",
      "status": "success",
      "timestamp": "2026-02-11T15:30:00Z",
      "logs": "..."
    }
  ]
}
```

### Matrix Chat (WebSocket)

```typescript
// Connect
WebSocket: ws://localhost:18789/ws/matrix?token=jwt_...

// Send message
{
  "type": "message",
  "content": "Filter my mails from last 3 days"
}

// Receive message
{
  "type": "message",
  "from": "Matrix/Claude",
  "content": "Here are your emails from last 3 days...",
  "timestamp": "2026-02-11T16:00:00Z"
}
```

---

## 💾 Database Schema (SQLite)

```sql
-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  role TEXT,
  api_url TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Cache (API responses)
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT,
  expires_at TIMESTAMP
);

-- Settings (user preferences)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  user_id TEXT
);

-- Chat messages (local history)
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  content TEXT,
  from_user TEXT,
  to_user TEXT,
  timestamp TIMESTAMP,
  read INTEGER DEFAULT 0
);

-- Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT,  -- 'critical', 'warning', 'info'
  title TEXT,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at TIMESTAMP
);
```

---

## 🔐 Security Architecture

### Authentication
- ✅ JWT tokens from OpenClaw
- ✅ Token stored in encrypted Electron/Tauri store
- ✅ Auto-refresh tokens on expiry
- ✅ Clear tokens on logout

### Network Security
- ✅ HTTPS only (client → OpenClaw)
- ✅ WSS for WebSocket (secure)
- ✅ Certificate pinning (optional for prod)

### Local Security
- ✅ SQLite encrypted with PRAGMA key
- ✅ File access isolated to user homedir
- ✅ No sensitive data in logs
- ✅ IPC validation (main ↔ renderer)

### RBAC
- ✅ Role extracted from JWT
- ✅ UI conditional on role
- ✅ API calls respect server-side permissions
- ✅ Admin endpoints protected

---

## 🚀 Performance Optimization

### Frontend
- ✅ Code splitting per screen (lazy loading)
- ✅ React Query caching (5 min TTL)
- ✅ Virtual scrolling for long lists
- ✅ Memoization (React.memo, useMemo)

### Backend Communication
- ✅ Batch requests where possible
- ✅ Pagination for large datasets
- ✅ Debounced file search (300ms)
- ✅ WebSocket for real-time (vs polling)

### Local Operations
- ✅ Background workers for heavy tasks
- ✅ Limit file search to relevant folders
- ✅ Cache email parsing results (SQLite)

### Database
- ✅ Indexes on frequently queried columns
- ✅ Automatic cleanup (delete old cache)
- ✅ WAL mode for concurrent access

---

## 📦 Dependencies (Complete List)

### Renderer
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "ws": "^8.14.0",
  "tailwindcss": "^3.3.0",
  "shadcn/ui": "latest",
  "lucide-react": "^0.292.0",
  "date-fns": "^2.30.0",
  "zod": "^3.22.0"
}
```

### Main Process (Tauri/Electron)
```
Tauri:
  - serde (serialization)
  - serde_json
  - sqlx (database)
  - tokio (async runtime)
  - reqwest (HTTP)
  - tungstenite (WebSocket)

OR Electron:
  - "electron": "^27.0.0"
  - "better-sqlite3": "^9.2.0"
  - "nodemailer": "^6.9.0"
  - "glob": "^10.3.0"
  - "dotenv": "^16.3.0"
```

---

## 🔄 Build & Deployment

### Development
```bash
# Start dev server (hot reload)
npm run dev

# Runs both React dev server + Electron/Tauri
# Browser DevTools accessible

# Tests
npm run test
npm run test:e2e
```

### Production Build
```bash
# Build for macOS/Windows/Linux
npm run build

# Creates:
# - macOS: .dmg installer
# - Windows: .exe installer
# - Linux: .deb / .AppImage
```

### CI/CD (GitHub Actions)
```yaml
on: [push, pull_request]
jobs:
  build:
    - Check linting
    - Run tests
    - Build for all platforms
    - Upload artifacts
```

---

## 📝 Next Steps

1. **Finalize Design** (Figma mockups)
2. **Setup Monorepo** (Turborepo or Nx)
3. **Initialize Frontend** (React + Vite)
4. **Initialize Backend** (Tauri or Electron)
5. **API Integration** (axios + WebSocket)
6. **Local Tasks** (mail + file search)
7. **Testing & QA**
8. **Release** (v0.1.0-alpha)

---

**Architecture approved by:** Mathieu  
**Generated:** 2026-02-11  
**Status:** Ready for Development
