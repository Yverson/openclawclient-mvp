# BACKLOG — openclawclient-mvp

## Épics
- E1: Stabilisation v0.1.0
- E2: Project Ops v1.5 (agents/state/cron/Taiga/reporting)

## Stories / Items

### E2 — Project Ops v1.5
- US-OPS-001: Bootstrap fichiers (README/STATUS/MEMORY/DECISIONS/RITUALS/GLOSSARY/BACKLOG/ROADMAP/PLAN/RELEASES/RISKS/QA/SECURITY) + `.state/` + `deploy/`.
- US-OPS-002: Config routage modèles (`model_routing.json`) + logging fallback.
- US-OPS-003: Reporting Telegram global (bot + channel) + anti-spam.
- US-OPS-004: Cron 10min + auto-exécution safe (auto-ok/safe), locks TTL, anti-boucle/quarantine.
- US-OPS-005: Taiga sync temps réel (webhook + reconcile/debounce) + idempotence/dédoublonnage + conflits champ-par-champ.
- US-OPS-006: Observabilité (health endpoints, logs corrélés run_id/task_id) + dead-man switch.
- US-OPS-007: Docker quotas/cleanup/stop idle env.

<!-- SYNCED:TAIGA:BEGIN -->
<!-- TaigaSyncAgent réécrit cette section (IDs, URLs, statuts, etc.) -->
<!-- SYNCED:TAIGA:END -->
