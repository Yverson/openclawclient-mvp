# PROJECT_MEMORY.md

> Voir archives: `memory-summaries/` (créer des résumés datés quand ce fichier grossit)

## Projet
- Nom: OpenClaw Client v0.1.0
- Owner: Mathieu
- Repo: https://github.com/Yverson/openclawclient-mvp
- Environnement: Dokploy (SECONDARY)

## Dernière mise à jour
- Date: 2026-02-13
- Par: OpenAI Subagent (reprise urgence incident)
- Sprint / Milestone: Stabilisation post-MVP (fix `/api/status`)
- Source: Diagnostic code + tests backend/frontend locaux

## État actuel (source de vérité)
- Statut global: MVP fonctionnel, backend Express/WebSocket actif, frontend React Router actif.
- Branche active: `main`
- Incident traité: erreur UI `Failed to fetch status` sur appel `/api/status`.

## Diagnostic incident `/api/status` (2026-02-13)
- Cause racine identifiée: après login (flux `LoginScreen`), l’URL API était stockée en localStorage mais **non injectée dans `apiClient`**.
- Conséquence: `apiClient.getStatus()` partait sur une URL relative (`/api/status`) au lieu du backend configuré, provoquant l’échec côté dashboard.
- Facteur aggravant: `apiClient` n’initialisait pas son `baseURL` depuis `localStorage` au démarrage.

## Correctifs appliqués
- `apps/desktop/src/screens/LoginScreen.tsx`
  - Ajout de `apiClient.setBaseUrl(apiUrl)` juste après login réussi.
- `apps/desktop/src/services/api.ts`
  - Initialisation de `baseURL` depuis `localStorage.api_url` dans le constructeur.

## Validation réalisée
- Backend smoke test OK
  - `npm start` (apps/backend) démarre correctement.
  - `POST /auth/login` -> 200 + JWT.
  - `GET /api/status` avec Bearer token -> 200 (`status: ok`).
- Frontend OK
  - `npm run -w apps/desktop test -- --run` -> **343 tests passés**.
  - `npm run -w apps/desktop build:web` -> build Vite OK.

## Problèmes ouverts
- Validation E2E en environnement déployé à re-faire (login UI réel + dashboard + chat agent binding).

## Prochaine action prioritaire
- Déployer ce patch puis valider la recette complète production: login -> dashboard -> status refresh -> chat.

## Handoff pour le prochain agent
- Lire:
  1. `PROJECT_MEMORY.md`
  2. `CHANGELOG.md`
  3. `apps/desktop/src/screens/LoginScreen.tsx`
  4. `apps/desktop/src/services/api.ts`
