# Taiga (self-host) — Deploy sur 37.60.228.219

Domaine: `taiga.openclaw.gaddielcloud.online`

## Services
- postgres
- redis
- taiga-back
- taiga-front
- taiga-events
- caddy (TLS + reverse proxy)

## Secrets
Créer un fichier secrets hors repo (chmod 600) sur le serveur, par ex:
- `/root/.openclaw/secrets/taiga.env`

Contenu attendu (exemples de clés, valeurs à générer):
- `TAIGA_DB_PASSWORD=...`
- `TAIGA_SECRET_KEY=...`
- `TAIGA_ADMIN_EMAIL=...`
- `TAIGA_ADMIN_PASSWORD=...`
- `TAIGA_ACME_EMAIL=...` (pour Let's Encrypt)

⚠️ Ne jamais commiter ce fichier.

## Démarrage
1) Copier `deploy/taiga/` sur le serveur
2) Créer `/root/.openclaw/secrets/taiga.env` (chmod 600)
3) Lancer:
```bash
docker compose -f docker-compose.yml --env-file /root/.openclaw/secrets/taiga.env up -d
```

## Ports
- Nécessite ports 80/443 libres sur 37.60.228.219.
