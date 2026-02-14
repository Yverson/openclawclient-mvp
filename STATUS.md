# STATUS — openclawclient-mvp

## Objectif actuel
- Stabiliser OpenClaw Client v0.1.0 + mettre en place Project Ops v1.5 (agents, state, cron, reporting).
- **Taiga désactivé pour l’instant** : on passe en mode fichiers + sync externe future (nouvelle app de gestion).

## Avancement
- Repo existant + déploiement prod en place.
- Mémoire projet existante: PROJECT_MEMORY.md / CHANGELOG.md / ADR.

## Next actions (max 3)
1. Bootstrap Project Ops v1.5 (fichiers + `.state/` + `deploy/`).
2. Activer reporting Telegram global + garde-fous (budgets/circuit breakers/quarantine).
3. Mettre en place cron: auto-tâches safe (tag auto-ok) + dead-man switch.

## Bloquants
- Aucun bloquant PM externe : **Taiga retiré**. (On synchronisera plus tard avec la nouvelle app de gestion.)

## Top 3 risques
1. Sync externe (future app PM) sans idempotence → duplications.
2. Auto-run sans allowlist → actions dangereuses.
3. Fuite de secrets (tokens) → compromission.

## DEV URLs + dernier déploiement
- Prod: https://openclawclient.luxiscloud.com
- DEV: (à définir)

## État sync PM externe + dernier webhook
- Sync: **désactivée** (mode fichiers uniquement).
- Webhook: n/a

## Health Ops v1.5
- cron last-run: n/a
- dead-man: n/a
- circuit breakers: `.state/circuit_breakers.json`
