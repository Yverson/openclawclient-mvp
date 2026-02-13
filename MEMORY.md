# MEMORY — openclawclient-mvp (stable)

## Contexte stable
- Produit: OpenClaw Client (MVP web).
- Déploiement: Dokploy SECONDARY (voir PROJECT_MEMORY.md).

## Conventions Project Ops v1.5
- `.state/` = non versionné (locks, quarantine, budgets, circuit breakers, mapping Taiga)
- Zones synchronisées Taiga : `<!-- SYNCED:TAIGA:BEGIN -->...` (écrasées au sync)
