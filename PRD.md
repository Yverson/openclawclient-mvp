# OpenClaw Client App — MVP PRD

**Version:** 1.0 (MVP)  
**Status:** In Development  
**Timeline:** 3-4 weeks  
**Last Updated:** 2026-02-11

---

## 📋 Executive Summary

**OpenClaw Client** is a native desktop application that bridges **local PC tasks** with **remote OpenClaw deployments**. Users can manage emails, search files locally, while admins can monitor servers and manage deployments. All powered by Matrix (Claude AI).

**Target:** Enterprises using OpenClaw who need a branded alternative to Telegram/WhatsApp.

---

## 🎯 Goals & Objectives

### Primary Goals
1. ✅ **Local AI Assistant** — Filter mails, search files, manage tasks on user PC
2. ✅ **Remote Connection** — Talk to OpenClaw servers + Matrix
3. ✅ **Two-tier Access** — Admins see everything, users see allowed tasks
4. ✅ **Real-time Notifications** — Server alerts + task status

### Success Metrics
- MVP launched in 4 weeks
- Intuitive UI (3-5 min onboarding)
- 0-latency local operations (<1s)
- 100% uptime on connection fallback

---

## 👥 User Personas

### Persona 1: Admin (IT/DevOps)
- **Goals:**
  - Monitor servers 24/7
  - Execute commands remotely
  - Manage containers + deployments
  - See detailed logs + alerts
- **Pain Points:**
  - Scattered tools (Telegram, SSH, Dokploy UI)
  - Need mobile-like experience on desktop
  - Complex alert filtering
- **Needs:** Full power + easy UI

### Persona 2: User Lambda (Commercial/Marketing)
- **Goals:**
  - Keep work organized (mails, files)
  - Understand server status ("Is the site down?")
  - Quick answers via Matrix
  - Execute pre-approved tasks
- **Pain Points:**
  - Too many tools (Outlook, File Explorer, Slack)
  - Doesn't understand technical jargon
  - Needs help from support
- **Needs:** Simple, beautiful, fast

---

## 🎨 Core Features (MVP)

### Feature 1: Local Task Suite
**Description:** AI-powered local PC utilities

**Sub-features:**
- 📧 **Mail Filter**
  - Parse Outlook/Gmail/Himalaya
  - Filter by: sender, keyword, date, unread
  - Quick actions: delete, archive, flag
  - Example: "Show me important emails from last 3 days"

- 🔍 **File Search**
  - Search disk by name, type, date modified
  - Preview files (PDF, images, docs)
  - Quick open in app or explorer
  - Example: "Find all Excel files modified today"

- 📝 **Quick Notes**
  - Jot down ideas
  - Save locally
  - Searchable
  
**User Access:** Both admins & users  
**Implementation:** Local filesystem + email APIs  
**API Calls:** 0 (all local)

---

### Feature 2: Server Dashboard (Read-Only)
**Description:** Status of remote OpenClaw deployments

**Sub-features:**
- 🖥️ **Server Status**
  - Status: UP/DOWN
  - Uptime
  - CPU, RAM, Disk % (gauges)
  - Last checked: X seconds ago

- 📊 **Containers Overview**
  - Count: running/stopped/failed
  - Recent restarts
  - High-CPU alerts

- 🚀 **Recent Deployments**
  - Status: SUCCESS/FAILED
  - Timestamp
  - Logs (truncated)

**User Access:** Admins (full), Users (restricted view)  
**API Calls:** OpenClaw `/api/status`, Dokploy `/api/health`  
**Update Frequency:** Every 30 seconds (background)

---

### Feature 3: Matrix Chat Integration
**Description:** Direct communication with Matrix (Claude)

**Sub-features:**
- 💬 **Chat Widget**
  - Text input
  - Message history (last 50)
  - Typing indicators
  - Read/unread state

- 🔒 **Authentication**
  - Login with OpenClaw token
  - Remember session
  - Auto-reconnect on network change

- 📨 **Message Types**
  - Text
  - File attachments (for admins)
  - Code blocks (syntax highlight)
  - Notifications (system messages)

**User Access:** Both admins & users  
**API Calls:** WebSocket to OpenClaw gateway  
**Latency:** <100ms (local network)

---

### Feature 4: Role-Based Access Control (RBAC)
**Description:** Different UIs for different users

**Roles:**

| Role | Mail | Files | Dashboard | Chat | Commands |
|------|------|-------|-----------|------|----------|
| **User** | ✅ | ✅ | 📊 Readonly | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ Full | ✅ | ✅ SSH |

**Implementation:**
- Token-based auth (OpenClaw JWT)
- Role extracted from token.role
- UI conditional rendering

---

### Feature 5: Notifications
**Description:** System alerts (server issues, deployment status)

**Types:**
- 🔴 **Critical:** Server DOWN, deployment FAILED
- ⚠️ **Warning:** RAM >85%, Disk >80%
- ✅ **Info:** Deployment SUCCESS, scheduled task complete

**Delivery:**
- Native OS notifications (Windows/Mac/Linux)
- In-app toast
- Badge on app icon (count)

**User Access:** Admins (all), Users (only critical)

---

## 🏗️ Technical Architecture

### Frontend Stack
```
Framework: Electron or Tauri
  ├── React 18+ (UI)
  ├── TailwindCSS (styling)
  └── WebSocket (real-time)

Local Libraries:
  ├── nodemailer (mail parsing)
  ├── fs + glob (file search)
  └── electron-store (session storage)
```

### Backend Integration
```
OpenClaw Gateway
  ├── Auth: POST /auth/token (login)
  ├── Status: GET /api/status (dashboard)
  ├── Chat: WebSocket /ws/matrix
  └── Dokploy: GET /api/health
```

### Data Flow
```
User Action (Filter mails)
  ↓
Local operation (parse Outlook DB)
  ↓
Return results in-app
  ↓
No network needed (except for avatar loading)

User Action (Check server status)
  ↓
API call to OpenClaw
  ↓
Render dashboard
  ↓
Background refresh every 30s
```

---

## 📱 UI/UX Wireframe

### Layout (Desktop)
```
┌─────────────────────────────────────────┐
│  OpenClaw Client          [−][◻][×]    │
├─────────────────────────────────────────┤
│ ┌──────────────┐ ┌─────────────────────┐│
│ │ SIDEBAR      │ │ MAIN CONTENT        ││
│ ├──────────────┤ ├─────────────────────┤│
│ │ • Dashboard  │ │ [Dashboard view]    ││
│ │ • Mail       │ │ - Server status     ││
│ │ • Files      │ │ - Containers        ││
│ │ • Chat       │ │ - Recent deploys    ││
│ │ • Settings   │ │                     ││
│ │              │ │ [Notifications area]││
│ │ [User Info]  │ │                     ││
│ └──────────────┘ └─────────────────────┘│
│                                          │
│ [Chat widget at bottom] ◀─────────────▶ │
│ "Type a message..."                      │
└─────────────────────────────────────────┘
```

### Screens (MVP)

**1. Login Screen**
- OpenClaw API URL input
- Token input (paste from browser)
- "Login" button
- Error handling

**2. Dashboard (Default)**
- Server cards (status + gauge charts)
- Deployment history
- Notification bell (unread count)

**3. Mail Filter**
- Search box
- Filters: sender, date, keyword
- Results list (preview on hover)
- Quick actions

**4. File Search**
- Search box
- Results list (icon + name + path)
- Open / Show in explorer buttons

**5. Chat**
- Message history
- Input box
- Typing indicator

---

## 🔐 Security

### Authentication
- ✅ OpenClaw JWT tokens (user management)
- ✅ Token stored in encrypted localStorage
- ✅ Auto-logout after 30 min inactivity
- ✅ Refresh token on startup

### Permissions
- ✅ Admin tasks require role="admin"
- ✅ File operations isolated to user's home dir
- ✅ No root access / shell injection prevention

### Data
- ✅ HTTPS only (for API calls)
- ✅ Local data never sent without user consent
- ✅ No telemetry (unless opted in)

---

## 📊 Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| **Onboarding time** | <5 min | User testing |
| **Dashboard load** | <2s | Network profiling |
| **Mail filter** | <500ms | Benchmark tests |
| **File search** | <1s (1000 files) | Benchmark tests |
| **Chat latency** | <100ms | WebSocket metrics |
| **Uptime** | 99.9% | Error tracking |
| **User satisfaction** | 4.5/5 stars | User feedback |

---

## 📅 Timeline (4 weeks)

### Week 1: Setup + Design
- Project skeleton (Electron/Tauri)
- UI kit (Figma mockups)
- API integration setup
- Database schema (SQLite for local storage)

### Week 2: Core Features
- Dashboard (server status)
- Mail filter (basic)
- File search
- Chat widget (basic)

### Week 3: Polish + Testing
- RBAC implementation
- Notifications
- Error handling
- Dark mode

### Week 4: Launch Prep
- Performance optimization
- Security audit
- Documentation
- Beta release

---

## 🚀 Rollout Strategy

### Phase 1: Alpha (Week 4)
- Internal testing (Mathieu + 1 employee)
- Desktop only (Windows/Mac)
- Feedback collection

### Phase 2: Beta (Week 6-8)
- 5-10 pilot customers
- Real-world testing
- Feature requests
- Bug fixes

### Phase 3: GA (Week 10+)
- Public launch
- Marketing
- Pricing announcement
- Expansion planning

---

## 💰 Pricing (Future)

```
MVP: FREE (alpha/beta)

Post-MVP:
├── Freemium
│   ├── Free: Basic local tasks
│   └── Pro: $20/user/month (server access + integrations)
├── Enterprise: Custom pricing
└── White-label: $500+/month
```

---

## 📚 Appendix

### Glossary
- **MVP:** Minimum Viable Product
- **RBAC:** Role-Based Access Control
- **Dokploy:** Deployment & container management platform
- **Matrix:** Claude AI via OpenClaw
- **OpenClaw:** The underlying AI agent framework

### Related Docs
- Technical Spec: TBD
- Design System: TBD
- API Reference: Existing OpenClaw docs

### Sign-off
- Product Owner: Mathieu
- Engineering Lead: TBD
- Design Lead: TBD

---

**Generated:** 2026-02-11  
**Status:** Ready for Review & Engineering Kickoff
