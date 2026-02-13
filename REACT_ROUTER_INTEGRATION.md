# React Router v6 Integration Guide

## Overview
OpenClaw Client now uses React Router v6 for declarative, client-side routing. This replaces the previous screen state management approach.

## What Changed

### 1. New Files Created
- `src/router.tsx` - Route definitions for all pages
- `src/layouts/ProtectedLayout.tsx` - Layout wrapper for authenticated pages
- `src/components/ProtectedRoute.tsx` - Route guard component

### 2. Modified Files
- `package.json` - Added `react-router-dom: ^6.20.1`
- `src/main.tsx` - Changed to use `RouterProvider` instead of rendering App directly
- `src/App.tsx` - Now a placeholder (legacy, not used)
- `src/components/Sidebar.tsx` - Updated to use `useNavigate` and `useLocation` hooks

### 3. Removed Dependencies
- `uiStore.setCurrentScreen()` calls (replaced with `navigate()`)
- Manual screen state management

## Route Structure

```
/ (root)
├── /login - LoginScreen (public)
└── / (protected)
    ├── /dashboard - DashboardScreen
    ├── /mail - MailFilterScreen
    ├── /files - FileSearchScreen
    ├── /chat - ChatScreen
    ├── /settings - SettingsScreen
    └── * (catch-all) → /dashboard
```

## How It Works

### 1. Authentication Check
- `ProtectedLayout` checks `useAuth()` hook
- If not authenticated: redirects to `/login`
- If authenticated: renders `Outlet` (child routes)

### 2. Navigation
All navigation now uses React Router:
```tsx
// Old way (removed)
const { setCurrentScreen } = useUIStore()
setCurrentScreen("dashboard")

// New way
const navigate = useNavigate()
navigate("/dashboard")
```

### 3. Active Route Detection
```tsx
// Old way (removed)
const { currentScreen } = useUIStore()
isActive = currentScreen === "dashboard"

// New way
const { pathname } = useLocation()
isActive = pathname === "/dashboard"
```

## Development

### Start Development Server
```bash
cd apps/desktop
npm run dev
```

### Type Check
```bash
npm run type-check
```

### Build
```bash
npm run build
```

## Migration Notes

### For Existing Code
If you have components that use `useUIStore().setCurrentScreen()`:
1. Import `useNavigate` from `react-router-dom`
2. Replace `setCurrentScreen(screen)` with `navigate(`/${screen}`)`
3. Delete the uiStore import

### Testing Routes
Routes are fully typed with TypeScript. The router configuration is in `src/router.tsx`.

## Future Enhancements

- [ ] Add route-specific query parameters
- [ ] Implement lazy loading for screens
- [ ] Add transition animations between routes
- [ ] Create route history tracking for "back" navigation
- [ ] Add breadcrumb navigation component

## Common Issues

### Issue: Page doesn't update when navigating
**Solution**: Ensure you're using `useNavigate()` hook and calling `navigate()`, not updating store state.

### Issue: useLocation returns undefined
**Solution**: Component must be rendered inside RouterProvider (via ProtectedLayout or within routes).

### Issue: Authentication check doesn't redirect
**Solution**: Verify `useAuth()` hook is returning the correct `isAuthenticated` value.

## Support

For questions or issues with React Router integration, check:
- [React Router Documentation](https://reactrouter.com)
- Official [Migration Guide](https://reactrouter.com/en/main/guides/philosophy)
