# OpenClaw Client MVP — Design System

**Version:** 1.0  
**Status:** Design Phase  
**Updated:** 2026-02-11

---

## 📐 Design Tokens

### Color Palette (Dark Mode)

```
Primary:
  - Primary-50: #f0f9ff (lightest blue)
  - Primary-100: #e0f2fe
  - Primary-500: #0ea5e9 (main blue - links, highlights)
  - Primary-600: #0284c7 (darker blue - hover)
  - Primary-900: #0c2340 (darkest blue)

Neutral:
  - Neutral-50: #f9fafb (almost white)
  - Neutral-100: #f3f4f6 (light gray)
  - Neutral-200: #e5e7eb (borders)
  - Neutral-400: #9ca3af (secondary text)
  - Neutral-600: #4b5563 (text)
  - Neutral-700: #374151 (dark text)
  - Neutral-800: #1f2937 (darker bg)
  - Neutral-900: #111827 (darkest bg - main)

Status Colors:
  - Success: #10b981 (green - running)
  - Warning: #f59e0b (amber - warning)
  - Error: #ef4444 (red - critical/down)
  - Info: #3b82f6 (blue - info)

Semantic:
  - bg-primary: #0f172a (darker than neutral-900, main app bg)
  - bg-secondary: #1e293b (card bg)
  - text-primary: #f1f5f9 (main text)
  - text-secondary: #cbd5e1 (secondary text)
  - border-color: #334155
```

### Typography

```
Font Family:
  - Primary: Inter (system font fallback: -apple-system, BlinkMacSystemFont, Segoe UI)
  - Code: Menlo, Courier New, monospace

Font Sizes:
  - xs: 12px (0.75rem)
  - sm: 14px (0.875rem)
  - base: 16px (1rem)
  - lg: 18px (1.125rem)
  - xl: 20px (1.25rem)
  - 2xl: 24px (1.5rem)
  - 3xl: 30px (1.875rem)

Font Weights:
  - Light: 300 (metadata, hints)
  - Regular: 400 (body text)
  - Medium: 500 (labels, buttons)
  - Semibold: 600 (headings, emphasis)
  - Bold: 700 (page titles, important data)

Line Heights:
  - tight: 1.25 (headings)
  - normal: 1.5 (body)
  - relaxed: 1.75 (lists)
```

### Spacing (8px Grid)

```
Space Units:
  - 0: 0
  - 1: 4px
  - 2: 8px (base unit)
  - 3: 12px
  - 4: 16px (standard padding)
  - 5: 20px
  - 6: 24px
  - 8: 32px
  - 10: 40px
  - 12: 48px
  - 16: 64px
  - 20: 80px

Component Padding:
  - Button: 8px (vertical) × 16px (horizontal)
  - Card: 24px (all sides)
  - Input: 10px (vertical) × 12px (horizontal)
  - Alert: 16px (all sides)
```

### Border Radius

```
Sizes:
  - none: 0
  - sm: 4px (inputs, small components)
  - base: 8px (cards, standard)
  - lg: 12px (larger sections)
  - full: 9999px (pills, badges)

Shadows:
  - sm: 0 1px 2px 0 rgba(0,0,0,0.05)
  - base: 0 1px 3px 0 rgba(0,0,0,0.1)
  - lg: 0 10px 15px -3px rgba(0,0,0,0.1)
  - xl: 0 20px 25px -5px rgba(0,0,0,0.1)
```

### Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: 1024px - 1920px
Wide: > 1920px

Target Resolutions (Desktop-first):
  - 1920×1080 (100%)
  - 1366×768 (71.4%)
  - 1024×768 (53.3%)
```

---

## 🧩 Component Library (Shadcn/ui)

### Common Components Used

1. **Button**
   - Variant: primary (blue), secondary (gray), ghost (transparent), danger (red)
   - Size: sm, md (default), lg
   - State: default, hover, active, disabled

2. **Input**
   - Type: text, password, email, number, search
   - State: empty, filled, focused, error, disabled
   - Icons: prefix icon, suffix icon (search, clear)

3. **Card**
   - Padding: 24px default
   - Border: 1px #334155
   - Background: #1e293b
   - Shadow: base (subtle depth)

4. **Badge**
   - Variant: success, warning, error, info
   - Size: sm, md
   - Shape: rounded (normal), pill (full)

5. **Alert/Toast**
   - Position: top-right, bottom-right
   - Variant: success, warning, error, info
   - Auto-dismiss: 4-6 seconds

6. **Spinner/Loader**
   - Color: primary blue
   - Size: sm (16px), md (24px), lg (32px)

7. **Modal/Dialog**
   - Background: semi-transparent dark overlay
   - Animation: fade in, 200ms
   - Close: X button, ESC key, backdrop click

8. **Tabs**
   - Indicator: blue underline on active tab
   - Transition: 200ms
   - Keyboard: Arrow keys navigate

9. **Dropdown/Menu**
   - Alignment: left, right, center
   - Animation: slide fade, 150ms
   - Close: escape, click outside

10. **Divider**
    - Color: #334155
    - Height: 1px

---

## 📱 Layout System

### Main Application Layout

```
┌─────────────────────────────────────────────────────────┐
│ OpenClaw Client               [—] [□] [×]              │  Header: 56px
├─────────────────┬───────────────────────────────────────┤
│                 │                                        │
│   SIDEBAR       │        MAIN CONTENT                    │
│   240px         │        (responsive)                    │
│   Fixed         │                                        │
│                 │                                        │
│                 │                                        │
│                 │         (chat widget at bottom)        │
│                 │                                        │
│                 ├────────────────────────────────────────┤  Chat: ~120px
│                 │ Type a message...  [send] [attach]    │
└─────────────────┴────────────────────────────────────────┘

Sidebar width responsive:
  - Desktop (1920px): 240px fixed
  - Tablet (1366px): 200px fixed
  - Small (1024px): 160px or collapsible
```

### Sidebar Navigation

```
┌──────────────┐
│ OpenClaw  ◌  │  Logo/Brand (32px × 32px + text)
├──────────────┤
│              │
│ 🏠 Dashboard │  Nav item (40px height, full width)
│              │
│ 📧 Mail      │  Icons: 20px (Lucide)
│              │  Text: 14px medium
│ 🔍 Files    │  Active: blue bg (#0284c7), text white
│              │  Hover: slight highlight
│ 💬 Chat      │
│              │
│ ⚙️  Settings │
│              │
├──────────────┤
│              │
│ User Info    │  User section (avatar + name/role)
│ Mathieu      │  Avatar: 32px circle
│ Admin        │  Name: 14px semi-bold
│              │  Role: 12px secondary
│              │
│ [Logout]     │  Button: danger variant
│              │
└──────────────┘
```

---

## 🎨 Screen Specifications

See individual screen JSON files for detailed mockups:
- `screen-1-login.json`
- `screen-2-dashboard.json`
- `screen-3-mail.json`
- `screen-4-files.json`
- `screen-5-chat.json`
- `screen-6-settings.json`

---

## 🔄 Animation & Interaction

### Transitions

```
General:
  - Page navigation: 200ms fade
  - Modal open: 150ms fade scale
  - Button hover: 100ms background color
  - Input focus: 150ms border color + shadow

Specific:
  - Toast appear: 250ms slide from top
  - Spinner: continuous 1s rotation
  - Pulse (notifications): 2s opacity cycle
  - Loading skeleton: 1.5s shimmer
```

### Keyboard Shortcuts

```
Global:
  - Ctrl+K / Cmd+K: Focus search
  - Ctrl+, / Cmd+,: Open settings
  - Ctrl+Q / Cmd+Q: Quit app
  - Ctrl+R / Cmd+R: Refresh (dashboard)

Chat:
  - Enter: Send message
  - Shift+Enter: New line
  - Ctrl+Up/Down: Navigate history

Navigation:
  - Tab: Focus next element
  - Shift+Tab: Focus previous
  - Arrow keys: Menu navigation
  - Escape: Close modal/menu
```

### Accessibility

```
- WCAG 2.1 AA compliant
- Color contrast: 4.5:1 (text), 3:1 (interactive)
- Focus indicators: 2px blue outline
- Keyboard navigation: all interactive elements
- Screen reader: semantic HTML, ARIA labels
- Reduced motion: respects prefers-reduced-motion
```

---

## 🎯 Mobile Responsive (Future)

Current MVP: Desktop-only  
Future: Mobile web/PWA support

```
Mobile breakpoint: < 640px
  - Single column layout
  - Sidebar → Bottom navigation bar
  - Full-width cards
  - Larger touch targets (44px min)
```

---

## 📋 Component States

### Common States

```
Default:
  - Background, text, border at rest

Hover:
  - Slightly lighter/darker background
  - Cursor change
  - No change on mobile

Active/Selected:
  - Blue highlight
  - Bold text
  - Icon color change

Disabled:
  - Opacity: 50%
  - Cursor: not-allowed
  - Gray text

Loading:
  - Spinner visible
  - Button text: "Loading..."
  - Interaction: disabled

Error:
  - Red border/background
  - Error icon
  - Error message below
  - Clear/retry button

Success:
  - Green checkmark
  - Success toast notification
  - Brief flash of color
```

---

## 🎬 User Flows

### Authentication Flow

```
1. User launches app
2. Check token in storage
3. If expired/missing → LoginScreen
4. If valid → Dashboard (default)
5. On login success → Save token + redirect
6. On logout → Clear token + show LoginScreen
```

### Real-time Updates

```
1. Dashboard polls API every 30s
2. WebSocket listens for chat messages
3. Notifications appear as toast + system alert
4. Email/File searches happen locally (instant)
5. All updates trigger UI re-render (Zustand)
```

---

**Design System Complete**  
**Ready for Component Development**
