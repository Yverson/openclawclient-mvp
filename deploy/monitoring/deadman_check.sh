#!/usr/bin/env bash
set -euo pipefail

# Dead-man switch: verify Taiga + core endpoints and notify via Telegram if down.
# NOTE: Token is not stored here; this script is a template.

URL="${1:-https://taiga.openclaw.gaddielcloud.online}"

code=$(curl -sS -o /dev/null -w "%{http_code}" "$URL/") || code="000"
if [[ "$code" != "200" ]]; then
  echo "CRON_DOWN: $URL returned $code" >&2
  exit 2
fi

exit 0
