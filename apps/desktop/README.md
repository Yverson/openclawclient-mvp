# OpenClaw Client — Desktop Application

A production-ready React 18 + Electron desktop application for managing OpenClaw deployments, local tasks (email, file search), and Matrix chat integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev:electron

# Build for production
npm run build
```

## 📋 Features

### ✅ Implemented Screens (MVP)

1. **Login Screen** — OpenClaw API URL + Token authentication
2. **Dashboard** — Server status, containers, deployments overview
3. **Mail Filter** — Search and manage emails locally
4. **File Search** — Find files on disk with filters
5. **Chat** — Real-time Matrix chat with Claude
6. **Settings** — User account, preferences, about

### ✅ Tech Stack

- **Framework:** React 18 + TypeScript
- **Desktop:** Electron 27
- **Styling:** TailwindCSS 3 + Shadcn/ui components
- **State:** Zustand (lightweight state management)
- **API Client:** Axios + WebSocket
- **Validation:** Zod
- **Build Tool:** Vite

### ✅ Architecture

```
src/
├── components/          # Reusable UI components
├── screens/             # 6 main application screens
├── hooks/               # Custom React hooks (useAuth, useChat, useDashboard)
├── services/            # API, WebSocket, mail, file services
├── store/               # Zustand stores (auth, dashboard, mail, chat, ui)
├── types/               # TypeScript type definitions
├── utils/               # Formatting, validation helpers
├── styles/              # TailwindCSS global styles
├── App.tsx              # Main application component
└── main.tsx             # React entry point
```

## 📊 State Management (Zustand)

### Stores
- **authStore** — User authentication & session
- **dashboardStore** — Server & container status
- **mailStore** — Email filtering & search
- **fileStore** — File search results
- **chatStore** — Chat messages & connection
- **uiStore** — Navigation & preferences

## 🎨 UI Components

### Shadcn/ui + Custom
- Button (primary, secondary, ghost, danger)
- Card (with header, content, footer)
- Input (text fields)
- Badge (status indicators)
- Spinner (loading)
- Sidebar (navigation)

## 🔐 Security

- ✅ JWT token authentication
- ✅ Encrypted localStorage
- ✅ HTTPS/WSS only
- ✅ Token auto-refresh
- ✅ Auto-logout on 401

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui
```

## 📦 Build

```bash
# Web build
npm run build:web

# Electron build (all platforms)
npm run build

# Output:
# - macOS: OpenClaw Client.dmg
# - Windows: OpenClaw Client Setup.exe
# - Linux: openclawclient-0.1.0.AppImage
```

## 🔧 Configuration

### Environment Variables
Create `.env.local`:

```
VITE_API_URL=http://localhost:18789
VITE_WS_URL=ws://localhost:18789
```

### Tailwind Customization
Edit `tailwind.config.js` to customize:
- Colors (primary, slate, success, warning, danger)
- Spacing
- Typography
- Breakpoints

## 📝 Code Quality

### ESLint + Prettier
```bash
npm run lint
npm run format
```

### TypeScript Strict Mode
All files use strict TypeScript checking.

## 🎯 Next Steps (Phase 3c+)

- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Docker containerization
- [ ] GitHub Actions CI/CD
- [ ] Dokploy deployment
- [ ] Performance optimization
- [ ] Dark mode animations
- [ ] Accessibility improvements

## 📚 Documentation

- [PRD.md](../../PRD.md) — Product Requirements
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — Technical Architecture
- [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md) — File organization

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Electron won't start
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run type-check
```

## 📄 License

Proprietary — OpenClaw Client

## 👥 Support

For issues or questions, contact: support@openclaw.dev

---

**Status:** Alpha v0.1.0  
**Last Updated:** 2026-02-11  
**Built with ❤️ for OpenClaw**
