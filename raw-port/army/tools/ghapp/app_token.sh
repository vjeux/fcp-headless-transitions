#!/bin/bash
# app_token.sh <role> — mint (and cache) a GitHub App installation access token.
#
# WHY THIS EXISTS
# ---------------
# The whole swarm used to act as ONE GitHub identity (vjeux's OAuth token): workers pushed and
# opened PRs as vjeux, and reviewers posted statuses and merged as vjeux. GitHub refuses to let an
# account review its own pull request, so reviewers could not use the real review system at all —
# they degraded to a commit status plus a comment, and an explicit REJECT could only be expressed
# as a red `faithfulness-gate` status (see reviewer-06's #154 write-up). Verdicts were therefore
# advisory: nothing server-side stopped a REJECTed PR from being merged by the next actor.
#
# With two GitHub Apps — one for WORKERS (PR authors), one for REVIEWERS (verdict authority) —
# author and reviewer are genuinely different principals, so `APPROVE` / `REQUEST_CHANGES` work,
# and branch protection can be tightened to REQUIRE a reviewer-app approval. That makes the
# "workers never merge" invariant enforced by GitHub instead of by convention.
#
# App auth is a two-step dance: sign a short-lived RS256 JWT with the app's private key, then trade
# it for an installation token (valid 1h, scoped to the repo). This box has neither PyJWT nor
# `cryptography`, so the JWT is signed with openssl(1), which is always present on macOS.
#
# USAGE
#   app_token.sh worker            -> prints an installation token on stdout
#   app_token.sh reviewer          -> ditto
#   app_token.sh <role> --check    -> prints identity/permission diagnostics (no token on stdout)
#
# Credentials live in $FCT_STATE_DIR/ghapp/<role>.json (written by setup_apps.py):
#   { "app_id": 123456, "installation_id": 7890, "slug": "fcp-port-worker",
#     "private_key": "<path to .pem>" }
#
# Tokens are cached at $FCT_STATE_DIR/ghapp/<role>.token and reused until 5 minutes before expiry,
# so a 16-slot swarm does not mint a token per git call (and cannot trip the app auth rate limit).
#
# EXIT 0 = token on stdout. EXIT 7 = role not configured (caller MUST fall back to plain `gh` auth,
# which is what keeps this whole change backward-compatible before the apps exist).
set -uo pipefail

ROLE="${1:?usage: app_token.sh <worker|reviewer> [--check]}"
MODE="${2:-}"
POOL="${FCT_STATE_DIR:-$HOME/.fct-pool}"
DIR="$POOL/ghapp"
CFG="$DIR/$ROLE.json"
CACHE="$DIR/$ROLE.token"
API="${GITHUB_API:-https://api.github.com}"

log () { echo "$@" >&2; }

# Not configured -> exit 7 so every caller can degrade to the existing single-identity behavior.
[ -f "$CFG" ] || { log "app_token: no config at $CFG (role '$ROLE' not set up)"; exit 7; }

read_cfg () { python3 -c "
import json,sys
d=json.load(open('$CFG'))
print(d.get('$1',''))
"; }

APP_ID="$(read_cfg app_id)"
INST_ID="$(read_cfg installation_id)"
PEM="$(read_cfg private_key)"

[ -n "$APP_ID" ] && [ -n "$PEM" ] || { log "app_token: $CFG missing app_id/private_key"; exit 7; }
[ -f "$PEM" ] || { log "app_token: private key not found at $PEM"; exit 7; }

# ---- cached token still good? (5 min safety margin before the 1h expiry) --------------------
if [ "$MODE" != "--check" ] && [ -f "$CACHE" ]; then
  exp=$(python3 -c "
import json,sys
try: print(json.load(open('$CACHE')).get('expires_epoch',0))
except Exception: print(0)
")
  now=$(date +%s)
  if [ "$((exp - now))" -gt 300 ]; then
    python3 -c "import json;print(json.load(open('$CACHE'))['token'])"
    exit 0
  fi
fi

b64url () { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

# ---- sign the app JWT (RS256) ---------------------------------------------------------------
# iat is backdated 60s: GitHub rejects a JWT whose iat is in the future, and laptop clocks drift.
now=$(date +%s)
hdr=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
pay=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$((now - 60))" "$((now + 540))" "$APP_ID" | b64url)
sig=$(printf '%s' "$hdr.$pay" | openssl dgst -sha256 -sign "$PEM" -binary 2>/dev/null | b64url)
[ -n "$sig" ] || { log "app_token: openssl failed to sign with $PEM"; exit 1; }
JWT="$hdr.$pay.$sig"

if [ "$MODE" = "--check" ]; then
  log "== app_token --check ($ROLE) =="
  curl -sS -H "Authorization: Bearer $JWT" -H "Accept: application/vnd.github+json" "$API/app" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'message' in d: print('  APP AUTH FAILED:', d['message']); raise SystemExit(1)
print('  app      :', d.get('name'), '(slug', d.get('slug'), ', id', d.get('id'), ')')
print('  owner    :', (d.get('owner') or {}).get('login'))
print('  perms    :', json.dumps(d.get('permissions', {})))
" >&2
  curl -sS -H "Authorization: Bearer $JWT" -H "Accept: application/vnd.github+json" \
    "$API/app/installations" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
if isinstance(d,dict): print('  installations: ERROR', d.get('message')); raise SystemExit(1)
for i in d:
    print('  installation:', i['id'], '->', (i.get('account') or {}).get('login'),
          '| repos:', i.get('repository_selection'))
" >&2
  exit 0
fi

[ -n "$INST_ID" ] || { log "app_token: $CFG missing installation_id (is the app installed on the repo?)"; exit 7; }

# ---- trade the JWT for an installation token -------------------------------------------------
resp=$(curl -sS -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Accept: application/vnd.github+json" \
  "$API/app/installations/$INST_ID/access_tokens")

tok=$(printf '%s' "$resp" | python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: print(''); raise SystemExit
print(d.get('token',''))
")

if [ -z "$tok" ]; then
  log "app_token: could not mint token for '$ROLE': $(printf '%s' "$resp" | head -c 300)"
  exit 1
fi

# Cache with the real expiry so concurrent slots share one token per hour.
printf '%s' "$resp" | python3 -c "
import json,sys,calendar,time,os
d=json.load(sys.stdin)
exp=calendar.timegm(time.strptime(d['expires_at'], '%Y-%m-%dT%H:%M:%SZ'))
p='$CACHE'
fd=os.open(p+'.tmp', os.O_WRONLY|os.O_CREAT|os.O_TRUNC, 0o600)
os.write(fd, json.dumps({'token': d['token'], 'expires_epoch': exp}).encode()); os.close(fd)
os.replace(p+'.tmp', p)
"
chmod 600 "$CACHE" 2>/dev/null
printf '%s\n' "$tok"
