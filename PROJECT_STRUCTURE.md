# OpenClaw Client — Project Structure & Setup

---

## 📁 Complete Directory Layout

```
openclawclient/
│
├── README.md                           # Project overview
├── ARCHITECTURE.md                     # Technical architecture
├── PROJECT_STRUCTURE.md                # This file
├── DEVELOPMENT.md                      # Dev guide
│
├── package.json                        # Root package (monorepo)
├── turbo.json                          # Turborepo config (optional)
├── tsconfig.json                       # TypeScript base config
├── .eslintrc.json                      # Linting rules
├── .prettierrc                         # Code formatting
│
├── .github/
│   └── workflows/
│       ├── build.yml                   # CI/CD build
│       ├── test.yml                    # Run tests
│       └── release.yml                 # Release to app stores
│
├── apps/
│   │
│   ├── desktop/                        # Electron/Tauri main process
│   │   ├── src/
│   │   │   ├── main.rs / main.js       # Entry point
│   │   │   ├── handlers/               # IPC handlers
│   │   │   │   ├── mail.rs
│   │   │   │   ├── files.rs
│   │   │   │   ├── system.rs
│   │   │   │   └── auth.rs
│   │   │   ├── services/
│   │   │   │   ├── mail_service.rs
│   │   │   │   ├── file_service.rs
│   │   │   │   ├── notification_service.rs
│   │   │   │   └── auth_service.rs
│   │   │   ├── db/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── models.rs
│   │   │   │   └── migrations/
│   │   │   │       ├── 001_init.sql
│   │   │   │       ├── 002_cache.sql
│   │   │   │       └── 003_settings.sql
│   │   │   └── config/
│   │   │       └── config.rs
│   │   ├── Cargo.toml                 # Rust dependencies
│   │   ├── src-tauri/
│   │   │   └── tauri.conf.json        # Tauri config
│   │   └── package.json
│   │
│   └── web/                            # React frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── MainLayout.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   └── Sidebar.tsx
│       │   │   ├── screens/
│       │   │   │   ├── DashboardScreen.tsx
│       │   │   │   ├── MailScreen.tsx
│       │   │   │   ├── FileSearchScreen.tsx
│       │   │   │   ├── ChatScreen.tsx
│       │   │   │   └── SettingsScreen.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── ServerCard.tsx
│       │   │   │   ├── ContainersList.tsx
│       │   │   │   ├── DeploymentHistory.tsx
│       │   │   │   └── AlertBell.tsx
│       │   │   ├── mail/
│       │   │   │   ├── MailFilter.tsx
│       │   │   │   ├── MailList.tsx
│       │   │   │   └── MailPreview.tsx
│       │   │   ├── files/
│       │   │   │   ├── FileSearch.tsx
│       │   │   │   ├── FileResults.tsx
│       │   │   │   └── FilePreview.tsx
│       │   │   ├── chat/
│       │   │   │   ├── ChatWidget.tsx
│       │   │   │   ├── MessageList.tsx
│       │   │   │   └── MessageInput.tsx
│       │   │   └── common/
│       │   │       ├── Button.tsx
│       │   │       ├── Input.tsx
│       │   │       ├── Card.tsx
│       │   │       ├── Spinner.tsx
│       │   │       ├── Modal.tsx
│       │   │       └── NotificationToast.tsx
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── AppPage.tsx
│       │   │   └── ErrorPage.tsx
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useDashboard.ts
│       │   │   ├── useMail.ts
│       │   │   ├── useFileSearch.ts
│       │   │   ├── useChat.ts
│       │   │   └── useNotifications.ts
│       │   ├── services/
│       │   │   ├── api.ts              # Axios instance + base config
│       │   │   ├── websocket.ts        # WebSocket connection
│       │   │   ├── auth.ts             # Auth logic
│       │   │   ├── mail.ts             # Mail operations
│       │   │   ├── files.ts            # File operations
│       │   │   └── notifications.ts    # Notification system
│       │   ├── store/
│       │   │   ├── authStore.ts        # Zustand auth state
│       │   │   ├── appStore.ts         # Global app state
│       │   │   ├── uiStore.ts          # UI state (modals, etc)
│       │   │   └── cacheStore.ts       # Cache state
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   ├── server.ts
│       │   │   ├── mail.ts
│       │   │   ├── file.ts
│       │   │   ├── chat.ts
│       │   │   ├── api.ts
│       │   │   └── index.ts
│       │   ├── utils/
│       │   │   ├── formatting.ts
│       │   │   ├── validation.ts
│       │   │   ├── errors.ts
│       │   │   ├── constants.ts
│       │   │   └── classNames.ts
│       │   ├── styles/
│       │   │   ├── globals.css
│       │   │   ├── tailwind.css
│       │   │   └── theme.css
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.html
│       │
│       ├── public/
│       │   ├── favicon.ico
│       │   ├── logo.png
│       │   └── images/
│       │
│       ├── vite.config.ts              # Vite config
│       ├── tsconfig.json
│       ├── package.json
│       └── tailwind.config.ts
│
├── packages/                           # Shared libraries
│   └── types/
│       ├── src/
│       │   └── index.ts                # Exported types
│       └── package.json
│
├── docs/
│   ├── API.md                          # API documentation
│   ├── DATABASE.md                     # Database design
│   ├── DEVELOPMENT.md                  # Dev guide
│   ├── TESTING.md                      # Testing strategy
│   ├── DEPLOYMENT.md                   # Deployment guide
│   └── CONTRIBUTING.md                 # Contribution guidelines
│
├── tests/
│   ├── unit/
│   │   ├── components.test.tsx
│   │   ├── services.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── api.test.ts
│   │   └── websocket.test.ts
│   └── e2e/
│       ├── login.test.ts
│       ├── dashboard.test.ts
│       ├── mail.test.ts
│       └── chat.test.ts
│
├── .env.example                        # Template environment variables
├── .gitignore
├── .github/workflows/                  # CI/CD
└── LICENSE

```

---

## 📋 File Naming Conventions

### React Components
```typescript
// PascalCase, one component per file
components/Button.tsx          // Functional component
components/dashboard/
  ├── ServerCard.tsx           // Sub-component
  ├── DeploymentHistory.tsx
  └── index.ts                 // Barrel export

// Inside: use named exports
export function Button() { ... }
export type ButtonProps = { ... }
```

### Services & Utilities
```typescript
// camelCase, utility modules
services/api.ts                // API client
services/auth.ts               // Auth service
utils/formatting.ts            // Utility functions
hooks/useAuth.ts               // Custom hooks
```

### Types & Interfaces
```typescript
// PascalCase with suffix
types/auth.ts
  export type User = { ... }
  export interface AuthState { ... }
  export type LoginRequest = { ... }
```

### Tests
```typescript
// Same name as source + .test or .spec
Button.tsx           →   Button.test.tsx
useAuth.ts          →   useAuth.test.ts
api.ts              →   api.test.ts
```

---

## 🔧 Configuration Files

### `.env.example`
```bash
# OpenClaw
VITE_OPENCLAWS_URL=http://localhost:18789
VITE_API_TIMEOUT=10000

# Electron/Tauri
TAURI_PRIVATE_KEY=
TAURI_KEY_PASSWORD=

# Email
MAIL_CLIENT=outlook          # or 'gmail'

# Feature flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_OFFLINE=true
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@components/*": ["components/*"],
      "@services/*": ["services/*"],
      "@hooks/*": ["hooks/*"],
      "@types/*": ["types/*"],
      "@utils/*": ["utils/*"],
      "@store/*": ["store/*"]
    },
    "strict": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

### `vite.config.ts` (Web)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
```

### `tauri.conf.json` (Desktop)
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "frontendDist": "../web/dist"
  },
  "app": {
    "windows": [
      {
        "title": "OpenClaw Client",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "decorations": true
      }
    ]
  }
}
```

---

## 🚀 Getting Started

### 1. Setup Monorepo
```bash
# Clone repository
git clone <repo>
cd openclawclient

# Install dependencies
npm install

# Or with Turborepo
npm run install --workspace
```

### 2. Environment Variables
```bash
cp .env.example .env
# Edit .env with your OpenClaw URL + settings
```

### 3. Run Development
```bash
# Terminal 1: Start frontend (Vite)
npm run dev --workspace=web

# Terminal 2: Start desktop app (Tauri/Electron)
npm run dev --workspace=desktop

# Hot reload enabled for both
```

### 4. Build Production
```bash
# Build all
npm run build

# Or specific
npm run build --workspace=web      # React bundle
npm run build --workspace=desktop  # .dmg / .exe / .deb
```

---

## 📦 Import Paths (Examples)

```typescript
// ✅ Good (using aliases)
import { ServerCard } from '@components/dashboard/ServerCard'
import { useDashboard } from '@hooks/useDashboard'
import { User } from '@types/auth'
import { formatDate } from '@utils/formatting'

// ❌ Avoid (relative imports)
import { ServerCard } from '../../../../components/dashboard/ServerCard'
```

---

## 🔄 Build & Deploy Artifacts

```
dist/
├── web/
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js
│   │   └── index-*.css
│   └── favicon.ico
│
└── desktop/
    ├── OpenClawClient-0.1.0.dmg       # macOS
    ├── OpenClawClient-0.1.0.exe       # Windows
    ├── openclawclient-0.1.0.AppImage  # Linux
    └── openclawclient_0.1.0_amd64.deb # Linux (Debian)
```

---

## 📝 Code Organization Principles

1. **Co-locate Related Code**
   - Component + its hook + its type in same folder

2. **Single Responsibility**
   - One component per file
   - One service per file

3. **Barrel Exports**
   - Use index.ts for folder exports
   - Makes imports cleaner

4. **Type Safety**
   - All props are typed
   - Avoid `any` type
   - Use strict TypeScript

5. **Reusability**
   - Extract common patterns
   - Create shared components
   - Use hooks for logic sharing

---

**Status:** Ready for Development  
**Updated:** 2026-02-11
