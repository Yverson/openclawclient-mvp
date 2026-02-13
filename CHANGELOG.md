# Changelog

Format inspiré de Keep a Changelog.

## [Unreleased]
### Added
- `apiClient` initialise désormais automatiquement son `baseURL` depuis `localStorage.api_url` au chargement (`apps/desktop/src/services/api.ts`).

### Changed
- Flux login frontend: après authentification réussie, l’app applique explicitement `apiClient.setBaseUrl(apiUrl)` (`apps/desktop/src/screens/LoginScreen.tsx`).

### Fixed
- Bug `Failed to fetch status` (`/api/status`): correction d’un défaut d’initialisation de l’URL API côté frontend juste après login.
- Validation technique effectuée:
  - backend: `POST /auth/login` OK, `GET /api/status` OK (authentifié)
  - frontend: tests Vitest OK (**343/343**), build web OK

### Removed
- N/A

## Historique notable (analyse Git)
### 2026-02-13
- `850eb37` feat: intégration React Router v6
- `05f2cfc` docs: guide d’intégration React Router

### 2026-02-11
- `6cbe840` feat: backend API Express + JWT + WebSocket
- `2adc8be` feat: endpoint auth/token + mise à jour port backend
- `e1692f3` feat: chat Matrix intégré côté client
- `8d4142a` feat: persistance JSON users/conversations/history
- `695f338` + fixes suivants: refonte login email/password + correction auth state/localStorage
