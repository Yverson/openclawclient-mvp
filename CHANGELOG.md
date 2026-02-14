# Changelog

Format inspiré de Keep a Changelog.

## [Unreleased]

### Added
- Login: redirection automatique vers `/dashboard` après authentification réussie.
- Login: l’URL API est désormais fixée côté déploiement (champ UI masqué) et affiche simplement l’endpoint actif.
- Backend: durcissement WebSocket — seules les connexions sur `/ws/matrix` sont acceptées.
- Backend: suppression du message intermédiaire “⏳ Message envoyé…” (désactivable via `SEND_BRIDGE_STATUS_MESSAGES=1`).
- Infra: service systemd `openclawclient-backend.service` (auto-restart + logs via journalctl).

### Changed
- Archi déploiement: séparation domaines
  - Frontend: `https://chat.gaddielcloud.online`
  - API: `https://openclawsapi.dockploydatabase.gaddielcloud.online`
- Frontend: URL API par défaut → `https://openclawsapi.dockploydatabase.gaddielcloud.online`.

### Fixed
- Frontend: correction du flux login (state/hydrate) pour éviter “login OK mais pas de redirection”.
- Backend: relay des réponses agent — ne dépend plus uniquement de `payload.state === "final"` (fallback + anti-dup), ce qui rétablit les réponses en production.

### Security
- CORS: origines autorisées mises à jour pour `chat.gaddielcloud.online` et `chatapi.gaddielcloud.online`.

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
