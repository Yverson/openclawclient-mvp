# OpenClaw Client MVP — Development Roadmap

**Timeline:** 4 weeks (Feb 11 — Mar 10, 2026)  
**Team:** 1-2 developers  
**Status:** Starting Phase 1

---

## 📅 Week-by-Week Breakdown

### 🔵 WEEK 1: Setup & Architecture (Feb 11-17)

**Goals:**
- Project skeleton complete
- CI/CD pipeline ready
- Design/API contracts finalized
- Team alignment

**Tasks:**

#### Day 1-2: Monorepo Setup
- [ ] Initialize Turborepo or Nx
- [ ] Create `apps/web` (Vite + React)
- [ ] Create `apps/desktop` (Tauri or Electron)
- [ ] Setup shared `packages/types`
- [ ] Configure TypeScript paths
- [ ] Setup linting (ESLint + Prettier)

```bash
# Commands
npm create vite@latest apps/web -- --template react-ts
cargo create-tauri-app --project-name apps/desktop
npm install -w apps/web -w apps/desktop -D @types/react
```

#### Day 3: Environment Setup
- [ ] Configure `.env.example`
- [ ] Setup GitHub secrets (TAURI_PRIVATE_KEY, etc.)
- [ ] Create CI/CD workflows (GitHub Actions)
- [ ] Setup code signing (certificates for macOS/Windows)

#### Day 4: Design Handoff
- [ ] Receive Figma designs (login, dashboard, mail, etc.)
- [ ] Extract design tokens (colors, spacing, typography)
- [ ] Setup Shadcn/ui + Tailwind
- [ ] Create component storybook

#### Day 5: API Integration Planning
- [ ] Finalize API endpoints with OpenClaw team
- [ ] Create axios instance + interceptors
- [ ] Define TypeScript types for API responses
- [ ] Setup React Query configuration

**Deliverables:**
- ✅ Monorepo with both apps running
- ✅ CI/CD pipeline (tests + build passes)
- ✅ Design tokens in code
- ✅ API types documented

**Risks:** 
- Tauri vs Electron decision (choose by Day 3)
- Design delays (request early)

---

### 🟢 WEEK 2: Core Features Build (Feb 18-24)

**Goals:**
- MVP features functional
- Basic UI complete
- Authentication working
- Dashboard rendering

**Tasks:**

#### Feature 1: Authentication (Days 1-2)
- [ ] LoginPage component
- [ ] JWT token management (localStorage + electron-store)
- [ ] API login call
- [ ] Error handling (invalid token, timeout)
- [ ] Session persistence

```typescript
// authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: async (url, token) => { ... },
  logout: () => { ... },
}))
```

#### Feature 2: Dashboard (Days 2-4)
- [ ] MainLayout component (sidebar + main area)
- [ ] ServerCard component (status display)
- [ ] Fetch server status from OpenClaw API
- [ ] Setup React Query for caching
- [ ] Error states + loading spinners

```typescript
// useDashboard.ts
export function useDashboard() {
  const { data, isLoading } = useQuery(
    ['servers'],
    () => api.get('/api/status'),
    { refetchInterval: 30000 }
  )
  return { servers: data, isLoading }
}
```

#### Feature 3: Chat Widget (Days 4-5)
- [ ] ChatScreen component
- [ ] WebSocket connection setup
- [ ] Message list rendering
- [ ] Input field + send button
- [ ] Message history

```typescript
// useChat.ts
export function useChat() {
  const ws = useRef(null)
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    ws.current = new WebSocket(`wss://...`)
    ws.current.onmessage = (e) => setMessages([...messages, e.data])
  }, [])
  
  const sendMessage = (text) => ws.current.send(text)
  return { messages, sendMessage }
}
```

#### Setup Testing
- [ ] Create test structure
- [ ] Setup Jest + React Testing Library
- [ ] Write tests for auth service
- [ ] CI/CD runs tests on push

**Deliverables:**
- ✅ Login works + token stored
- ✅ Dashboard shows 3 servers + live status
- ✅ Chat connects and sends messages
- ✅ All tests passing

**Risks:**
- WebSocket auth issues (test early)
- Slow API responses (need timeout handling)

---

### 🟡 WEEK 3: Local Tasks + Polish (Feb 25 - Mar 2)

**Goals:**
- Mail & file search working
- Notifications setup
- Dark mode + settings
- Performance optimization

**Tasks:**

#### Feature 4: Mail Filter (Days 1-3)
- [ ] IPC handler for mail parsing (Main process)
- [ ] MailFilter component (React)
- [ ] Mail parsing logic (Outlook/Gmail)
- [ ] Filter by sender, keyword, date
- [ ] Cache results (SQLite)

```rust
// src/handlers/mail.rs
#[tauri::command]
pub fn list_mails(filter: String) -> Vec<Mail> {
  // Parse email client
  // Apply filters
  // Return results
}
```

#### Feature 5: File Search (Days 3-4)
- [ ] IPC handler for file globbing
- [ ] FileSearch component
- [ ] Real-time search (debounced 300ms)
- [ ] File preview (images, PDFs)
- [ ] Open file / Show in explorer

```typescript
// services/ipc.ts
export async function searchFiles(pattern: string) {
  return await window.__TAURI__?.invoke('search_files', { pattern })
}
```

#### Polish & Settings (Day 5)
- [ ] Settings screen (API URL, token, preferences)
- [ ] Dark mode toggle
- [ ] Notification preferences
- [ ] Language selection (i18n)
- [ ] Logout functionality

**Deliverables:**
- ✅ Mail filtering works
- ✅ File search <1s for 1000 files
- ✅ Settings persisted (SQLite)
- ✅ Dark mode working

**Risks:**
- Mail parsing API complexities (test with multiple clients)
- File search performance (use glob instead of fs.walk)

---

### 🔴 WEEK 4: Testing & Release Prep (Mar 3-10)

**Goals:**
- All features tested
- Security audit
- Performance benchmarked
- Alpha release ready

**Tasks:**

#### Testing (Days 1-2)
- [ ] Unit tests (components, services, utils)
- [ ] Integration tests (auth → API → state)
- [ ] E2E tests (Playwright or Cypress)
- [ ] Security audit (OWASP checklist)
- [ ] Performance profiling

```bash
# Commands
npm run test                    # Unit + integration
npm run test:e2e              # End-to-end
npm run lint                  # Code quality
npm run security-audit        # Dependencies
```

#### Build & Sign (Day 3)
- [ ] Build macOS .dmg (code signing)
- [ ] Build Windows .exe (signing)
- [ ] Build Linux .AppImage + .deb
- [ ] Test installers
- [ ] Create installer signing certs

#### Documentation (Day 4)
- [ ] README.md (features, install)
- [ ] CONTRIBUTING.md (dev guide)
- [ ] API.md (complete reference)
- [ ] TROUBLESHOOTING.md
- [ ] Release notes (v0.1.0-alpha)

#### Alpha Release (Day 5)
- [ ] Tag version (v0.1.0-alpha)
- [ ] Create release on GitHub
- [ ] Upload binaries (.dmg, .exe, .deb)
- [ ] Announce to internal team
- [ ] Collect feedback

**Deliverables:**
- ✅ All tests passing (>80% coverage)
- ✅ Signed installers for all platforms
- ✅ Complete documentation
- ✅ v0.1.0-alpha released

**Risks:**
- Code signing certs (start early)
- Cross-platform testing (needs Mac + Windows machines)

---

## 👥 Team Roles

| Role | Responsibilities |
|------|------------------|
| **Frontend Dev** | React components, hooks, styling |
| **Desktop Dev** | Electron/Tauri setup, IPC handlers, mail/file parsing |
| **DevOps/QA** | CI/CD, testing, security audit, build/release |

**For 1 developer:** Do everything sequentially (weeks may extend to 5-6)  
**For 2 developers:** Frontend dev focuses on React, desktop dev on Tauri + main process

---

## 📊 Sprint Milestones

| Sprint | Key Deliverable | Status |
|--------|-----------------|--------|
| **Week 1** | ✅ Skeleton + Design tokens | 🔵 To Start |
| **Week 2** | ✅ Login + Dashboard + Chat | 🔵 To Start |
| **Week 3** | ✅ Mail + Files + Settings | 🔵 To Start |
| **Week 4** | ✅ Testing + v0.1.0-alpha | 🔵 To Start |

---

## 🎯 Daily Standup Checklist

```
Every morning:

1. Yesterday's accomplishments
2. Today's plan
3. Blockers / help needed
4. Build status (green/red)
5. Test coverage (%)

Example:
- ✅ Completed: LoginPage component
- 🎯 Today: Dashboard API integration
- ⚠️ Blocker: API timeout need clarification
- 🟢 Build: Passing
- 📊 Coverage: 65%
```

---

## 🚀 Post-MVP (Future Phases)

### Phase 2 (Week 6-8): Beta
- [ ] Real customer testing (5-10 pilot)
- [ ] Performance optimization
- [ ] Additional integrations (Notion, Google Calendar)
- [ ] Mobile app (React Native)
- [ ] Analytics + crash reporting

### Phase 3 (Week 10+): GA
- [ ] Public launch
- [ ] Marketing website
- [ ] Pricing announcement
- [ ] Enterprise features (SSO, audit logs)
- [ ] White-label version

---

## 📈 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Development Speed** | On schedule | vs timeline |
| **Code Quality** | >80% coverage | Jest coverage report |
| **Performance** | <2s dashboard load | Lighthouse + custom benchmarks |
| **Stability** | 0 critical bugs | Bug tracking system |
| **Security** | 0 vulnerabilities | OWASP audit |

---

## 🔄 Dependency Management

### External Services
- ✅ OpenClaw Gateway (must be running)
- ✅ Dokploy API (for deployments)
- ✅ Ollama/Claude (for chat)

### NPM Dependencies (Watch)
- React 18+ (stable)
- Tauri / Electron (match version)
- TailwindCSS (latest 3.x)
- Zustand (lightweight, no complex state)

**Action:** Weekly dependency audit + security updates

---

## 📝 Definition of Done

### For each feature:
- [ ] Code written + reviewed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] No console errors
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Documented (JSDoc + README)
- [ ] Merged to main

---

## 🎬 Kick-off Checklist

Before starting Week 1:

- [ ] Repository created + GitHub Actions enabled
- [ ] Team access granted (GitHub + npm)
- [ ] Development machines ready (Node 18+, Rust toolchain)
- [ ] Tauri/Electron chosen
- [ ] OpenClaw test instance available
- [ ] Figma designs finalized
- [ ] API contracts signed off
- [ ] Database schema approved
- [ ] Architecture reviewed

**Ready to start:** Feb 11, 2026 ✅

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-11  
**Owner:** Product Manager (Mathieu)
