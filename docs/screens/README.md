# OpenClaw Client MVP — UI/UX Design Specifications

**Phase:** 2 - DESIGN GENERATION (Stitch)  
**Version:** 1.0  
**Updated:** 2026-02-11  
**Status:** ✅ COMPLETE

---

## 📋 Overview

This directory contains comprehensive design specifications for all 6 screens of the OpenClaw Client MVP desktop application. Each screen is documented in JSON format with detailed component specs, interactions, and styling guidelines.

### Deliverables

- ✅ **6 UI Screen Specifications** (JSON format)
- ✅ **Design System** (colors, typography, spacing, components)
- ✅ **Component Library** (Shadcn/ui + custom components)
- ✅ **Responsive Specifications** (1920x1080, 1366x768, 1024x768)
- ✅ **Interaction & Animation Guide**
- ✅ **Accessibility Compliance** (WCAG 2.1 AA)

---

## 🎨 Screen Inventory

### 1. LoginScreen (`screen-1-login.json`)
**Purpose:** Initial authentication with OpenClaw API credentials

**Key Components:**
- OpenClaw API URL input
- Token input (password-protected with visibility toggle)
- Remember device checkbox
- Error handling and validation
- Success redirect animation

**States:** Idle, Loading, Error, Success

**Responsive:** 400px card (1920px) → 340px (1024px)

---

### 2. DashboardScreen (`screen-2-dashboard.json`)
**Purpose:** Real-time server status, metrics, and deployment monitoring

**Key Sections:**
- **Status Summary Cards**
  - Active Servers (2 of 2)
  - Running Containers (12)
  - Active Alerts (3)

- **Server Status Cards**
  - Uptime indicator
  - CPU, RAM, Disk gauges (color-coded)
  - Status badge (UP/DOWN)

- **Containers Table**
  - Name, Status, CPU, Memory, Uptime
  - Scrollable, sortable

- **Recent Deployments**
  - Deployment name, timestamp
  - Success/Failure status badge

**Updates:** Auto-refresh every 30 seconds

**States:** Loading, Loaded, Updating, Error

**Admin vs User:** Admins see full dashboard; users see restricted view

---

### 3. MailFilterScreen (`screen-3-mail.json`)
**Purpose:** Local email search and filtering with quick actions

**Key Features:**
- **Search Box** (debounced, <500ms)
- **Advanced Filters**
  - Sender (email)
  - Date range
  - Keywords
  - Quick filters (Unread, Starred, Today)

- **Email List**
  - Avatar + sender name
  - Subject line
  - Preview text
  - Timestamp + badge (NEW/Unread)
  - Hover effects for selection

- **Email Preview Panel**
  - Full email content
  - Archive/Delete quick actions
  - Scrollable for long emails

**Performance:** All local, no network required

**Search:** Instant for <1000 emails

---

### 4. FileSearchScreen (`screen-4-files.json`)
**Purpose:** Search and preview files on local disk

**Key Features:**
- **Search Input** (debounced 300ms)
- **Type Filters**
  - All Files
  - Documents (PDF, DOC, TXT)
  - Images (PNG, JPG, GIF)
  - Code (JS, PY, RS)
  - Archives (ZIP, TAR)

- **Date & Size Filters**
  - Modified: Today, Week, Month, Year
  - Size: <10MB, 10-100MB, >100MB

- **File List**
  - File icon (color-coded by type)
  - Name + path
  - Size + modified date
  - Open & Show in Explorer buttons

- **Preview Panel**
  - Thumbnail (PDF, images)
  - File metadata
  - Open/Explorer buttons

**Performance:** Indexed local search <1s for 10,000 files

**Scope:** User home dir + Documents

---

### 5. ChatScreen (`screen-5-chat.json`)
**Purpose:** Real-time chat with Claude via Matrix integration

**Key Features:**
- **Message History**
  - Last 50 messages
  - User (blue) vs Claude (gray) bubbles
  - Timestamps

- **Message Input**
  - TextArea with auto-expand
  - Send button
  - Attach file button (admin only)
  - Keyboard shortcuts (Enter=send, Shift+Enter=newline)

- **Real-time Features**
  - WebSocket connection status
  - Typing indicators
  - Auto-scroll to latest message

- **Support Elements**
  - Connection status indicator (UP/Reconnecting/DOWN)
  - Toast notifications for errors
  - Clear History & Export buttons

**Protocol:** WebSocket with Matrix  
**Update Frequency:** Real-time  
**Connection:** Auto-reconnect on network changes

---

### 6. SettingsScreen (`screen-6-settings.json`)
**Purpose:** User preferences, token management, and app configuration

**Tab 1: Account**
- User profile (avatar, name, role)
- API URL display + copy button
- Token management
  - Masked token display
  - Refresh token button
  - Revoke token button
  - Expiry date
- Logout button

**Tab 2: Security**
- Active sessions list
- Sign out individual sessions
- Two-factor authentication toggle
- Security alerts

**Tab 3: Appearance**
- Theme selector (Light, Dark, Auto)
- Font size slider (12-18px)
- Live preview

**Tab 4: Notifications**
- Critical alerts toggle
- Warning alerts toggle
- Info alerts toggle
- Customize by type

**Tab 5: About**
- App version
- Technology stack
- External links (GitHub, Docs)

---

## 🎨 Design System

### Colors (Dark Mode)

```
Primary Blue: #0ea5e9
  - Lighter: #3b82f6
  - Darker: #0284c7

Background:
  - App: #0f172a (very dark blue)
  - Surface: #1e293b (dark blue)
  - Hover: #293548 (slightly lighter)
  - Border: #334155

Text:
  - Primary: #f1f5f9 (white)
  - Secondary: #cbd5e1 (light gray)
  - Tertiary: #64748b (medium gray)

Status:
  - Success (UP): #10b981 (green)
  - Warning: #f59e0b (amber)
  - Error (DOWN): #ef4444 (red)
  - Info: #3b82f6 (blue)
```

### Typography

```
Font Family: Inter (system fallback)
Code Font: Menlo

Sizes:
  xs (12px) - hints, metadata
  sm (14px) - labels, secondary text
  base (16px) - body text
  lg (18px) - subheadings
  xl (20px) - section headings
  2xl (24px) - page titles
  3xl (30px) - main headings

Weights:
  300 - Light (hints)
  400 - Regular (body)
  500 - Medium (labels)
  600 - Semibold (headings)
  700 - Bold (emphasis)
```

### Spacing (8px Grid)

```
px: 0
1: 4px
2: 8px (base)
3: 12px
4: 16px (standard)
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
```

### Components (Shadcn/ui)

- Button (primary, secondary, danger, ghost)
- Input (text, password, email, search)
- Card (standard container)
- Badge (colored status)
- Alert/Toast (notifications)
- Spinner/Loader (async states)
- Modal/Dialog (overlays)
- Tabs (navigation)
- Dropdown/Menu (selections)
- Avatar (user icons)
- Divider (separators)
- Table (data display)
- TextArea (long text input)
- Toggle (binary switches)
- Slider (range selection)

---

## 🔄 Responsive Design

### Breakpoints

```
Desktop (1920x1080): 100% width
  - Sidebar: 240px fixed
  - Content: responsive grid

Tablet (1366x768): ~71% scale
  - Sidebar: 200px fixed
  - Cards: 2-column grid → 1-column

Small (1024x768): ~53% scale
  - Sidebar: 160px or collapsible
  - Cards: Full width
  - Font: -5% reduction
```

### Responsive Components

- **DashboardScreen:** 3-column summary → 2-col → 1-col
- **MailFilterScreen:** 2-column (filters + list) → vertical stack on <1024px
- **FileSearchScreen:** 2-column (list + preview) → vertical stack
- **ChatScreen:** Full width always
- **SettingsScreen:** 2-column sidebar → collapsed on <1024px

---

## 🎬 Animation & Interactions

### Transitions

```
Standard: 200ms ease-in-out
Modal open: 150ms fade scale
Button hover: 100ms background
Input focus: 150ms border + shadow
Toast appear: 250ms slide
Spinner: 1s continuous rotation
```

### Keyboard Shortcuts

```
Global:
  Ctrl+K (Cmd+K): Focus search
  Ctrl+, (Cmd+,): Settings
  Ctrl+Q (Cmd+Q): Quit

Chat:
  Enter: Send message
  Shift+Enter: New line
  Ctrl+Up/Down: Message history

Navigation:
  Tab: Focus next
  Shift+Tab: Focus previous
  Arrow keys: Menu nav
  Escape: Close modal
```

### User Flows

**Login → Dashboard:**
```
1. User launches app
2. Check token in storage
3. If missing/expired → LoginScreen
4. On login success → Save token + redirect to Dashboard
5. If valid token → Skip login, show Dashboard
```

**Real-time Updates:**
```
1. Dashboard polls API every 30s
2. WebSocket listens for chat messages
3. Notifications appear as toast + system alert
4. Mail/File searches happen locally
5. All updates trigger UI re-render (Zustand)
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast:** 4.5:1 (text), 3:1 (interactive)
- **Focus Indicators:** 2px blue outline, visible on all interactive elements
- **Keyboard Navigation:** All features accessible via Tab + Arrow keys + Enter
- **Screen Reader:** Semantic HTML + ARIA labels
- **Reduced Motion:** Respects `prefers-reduced-motion` media query

### Semantic HTML

- Use `<button>` for buttons, not `<div>`
- Use `<label>` for form inputs
- Use `<nav>` for navigation
- Use `role="main"`, `role="complementary"`, etc.
- Use `aria-label` for icon-only buttons
- Use `aria-live` for status messages

---

## 📦 Component JSON Structure

Each screen JSON includes:

```json
{
  "screen": "ScreenName",
  "version": "1.0",
  "title": "Human-readable title",
  "description": "What this screen does",
  
  "layout": { /* Grid or Flexbox */ },
  "components": [ /* Detailed component specs */ ],
  "states": { /* Interactive states */ },
  "interactions": { /* Event handlers */ },
  "accessibility": { /* WCAG compliance */ },
  "responsive": { /* Breakpoint overrides */ },
  "theme": { /* Colors + fonts */ },
  "notes": [ /* Implementation tips */ ]
}
```

---

## 🚀 Implementation Guide

### Phase 3b: Coding (Pixel)

**Frontend Architecture:**

```
src/
├── components/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── MailFilterScreen.tsx
│   │   ├── FileSearchScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   └── layout/
│       ├── MainLayout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useDashboard.ts
│   ├── useChat.ts
│   └── ...
├── store/ (Zustand)
│   ├── authStore.ts
│   ├── dashboardStore.ts
│   └── ...
└── types/
    ├── auth.ts
    ├── server.ts
    ├── mail.ts
    └── ...
```

**Tech Stack:**
- React 18 (UI framework)
- TailwindCSS (styling)
- Shadcn/ui (component library)
- Lucide React (icons)
- Zustand (state management)
- Axios (HTTP client)
- ws (WebSocket)

---

## 📋 Checklist for Developers

Before implementation:

- [ ] Review all JSON specifications
- [ ] Read DESIGN_SYSTEM.md
- [ ] Setup Electron/Tauri project
- [ ] Install React + TailwindCSS
- [ ] Create component folder structure
- [ ] Implement MainLayout + Sidebar
- [ ] Create common components (Button, Input, Card, etc.)
- [ ] Implement each screen in order:
  1. LoginScreen
  2. DashboardScreen
  3. MailFilterScreen
  4. FileSearchScreen
  5. ChatScreen
  6. SettingsScreen

---

## 📝 Notes for Design Review

### Key Design Decisions

1. **Dark Mode First:** Professional enterprise aesthetic, reduces eye strain
2. **Sidebar Navigation:** Clear, persistent navigation with active state
3. **Card-based Layout:** Modular, scannable interface
4. **Real-time Updates:** WebSocket for chat, polling for dashboard
5. **Local-first Operations:** Mail and file search happen locally, no network latency
6. **Gauges for Metrics:** Visual representation of server health (CPU, RAM, Disk)
7. **Color-coded Status:** Green=healthy, Amber=warning, Red=critical
8. **Responsive Layout:** Desktop-first, collapse to single column on smaller screens

### Future Enhancements (Post-MVP)

- [ ] Mobile PWA version
- [ ] Dark/Light theme toggle
- [ ] Custom accent color
- [ ] Dashboard widget customization
- [ ] Advanced mail filtering rules
- [ ] File tagging and favorites
- [ ] Chat message search
- [ ] Notification sound customization

---

## 🔗 Related Documents

- `/root/.openclaw/workspace/projects/openclawclient-mvp/PRD.md` — Product requirements
- `/root/.openclaw/workspace/projects/openclawclient-mvp/ARCHITECTURE.md` — Technical architecture
- `/root/.openclaw/workspace/projects/openclawclient-mvp/docs/screens/DESIGN_SYSTEM.md` — Design tokens & system

---

## ✅ Completion Status

**Phase 2: DESIGN GENERATION — COMPLETE ✅**

- ✅ Design System documented
- ✅ 6 UI screens specified (JSON + detailed specs)
- ✅ Component library defined (Shadcn/ui)
- ✅ Responsive design patterns established
- ✅ Accessibility compliance documented
- ✅ Interaction patterns defined
- ✅ Animation/transition guide created

**Ready for Phase 3b: CODE GENERATION (Pixel)**

---

**Generated:** 2026-02-11  
**Version:** 1.0  
**Status:** Ready for Engineering Handoff
