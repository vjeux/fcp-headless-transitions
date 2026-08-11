#!/bin/bash
# pr_review.sh <PR#> <approve|request-changes|comment> "<body>" — submit a REAL GitHub review verdict
# as the REVIEWER app.
#
#   pr_review.sh <PR#> approve --body-file /tmp/my_evidence.md    <- PREFERRED for anything long or
#   containing backticks/quotes: the body never passes through a shell, so nothing can be eaten.
#
# WHY THIS REPLACES THE COMMENT WORKAROUND
# ----------------------------------------
# When the swarm ran as a single identity, reviewers physically could not use GitHub's review system:
# GitHub rejects a review on your own PR ("Can not approve your own pull request"), and every PR was
# authored by the same account doing the reviewing. So an ACCEPT was "merge it and leave a comment",
# and a REJECT was a red `faithfulness-gate` status plus a comment — reviewer-06 hit exactly this on
# PR #154, where a genuine oracle-proven divergence could only be recorded as a status + prose.
#
# Consequences of that workaround, all fixed here:
#   * REQUEST_CHANGES never blocked anything; a rejected PR looked mergeable to the next actor.
#   * "reviewed" was not machine-readable — no way to require review in branch protection.
#   * The GitHub UI showed no reviewer, so a human auditing the repo saw unreviewed merges.
#
# With the worker app authoring PRs and the reviewer app judging them, author != reviewer, so the
# real verdicts work and `required_pull_request_reviews` can enforce them SERVER-SIDE.
#
# IDEMPOTENT: a reviewer loop may re-verify the same head. This refuses to submit a second review of
# the same (PR, head SHA, verdict) — the head SHA is the key, so a NEW push does get a fresh verdict.
#
# EXIT: 0 submitted (or already present), 2 usage, 3 self-review refused (apps not set up — the
# caller should fall back to the status+comment path), 4 API error.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SLUG="${FCT_REPO:-vjeux/fcp-headless-transitions}"

PR="${1:?usage: pr_review.sh <PR#> <approve|request-changes|comment> \"<body>\"}"
VERDICT="${2:?usage: pr_review.sh <PR#> <approve|request-changes|comment> \"<body>\"}"
shift 2
# --body-file <path> — read the verdict body from a FILE.
#
# WHY THIS EXISTS: the body is evidence, and evidence was being silently deleted. Agents invoke this
# through `bash -c "... pr_review.sh 445 approve \"...\""`, and a review body naturally contains
# backticked instruction names (`vcmpltps`, `movl 0x48(%rdi),%eax`). The CALLER's shell runs those as
# command substitutions before this script is reached, so the clause naming the defect vanishes from
# the permanent record — and the reviewer cannot see it happen, because the posted review still looks
# plausible. Hit at least three times today (#445, #481, and a depclaim drop reason).
# A file has no shell in its path: write the body with the file tool, pass the path.
if [ "${1:-}" = "--body-file" ] && [ -n "${2:-}" ]; then
  [ -r "$2" ] || { echo "pr_review: cannot read body file $2" >&2; exit 2; }
  BODY="$(cat "$2")"
else
  BODY="${*:-}"
  # Best-effort tripwire for the case above. A backtick pair that survived to here is harmless (we
  # pass BODY as argv to python, never through a shell); the danger is the one that did NOT survive.
  # We cannot see what was already eaten, so warn on the shape and point at the safe path.
  case "$BODY" in
    *'`'*) echo "pr_review: WARNING — body contains a backtick. If you invoked this from a" >&2
           echo "  double-quoted shell command, any OTHER backticked span was already expanded away" >&2
           echo "  by your shell and is missing from the evidence. Prefer --body-file <path>." >&2 ;;
  esac
fi

case "$VERDICT" in
  approve)          EVENT="APPROVE" ;;
  request-changes)  EVENT="REQUEST_CHANGES" ;;
  comment)          EVENT="COMMENT" ;;
  *) echo "pr_review: verdict must be approve|request-changes|comment" >&2; exit 2 ;;
esac
[ "$EVENT" = "APPROVE" ] || [ -n "$BODY" ] || {
  echo "pr_review: a $EVENT verdict REQUIRES a body naming exactly what is wrong" >&2; exit 2; }

HEAD_SHA=$("$ROOT/gh_as.sh" reviewer pr view "$PR" --repo "$SLUG" --json headRefOid --jq .headRefOid 2>/dev/null)
[ -n "$HEAD_SHA" ] || { echo "pr_review: cannot read head SHA for PR #$PR" >&2; exit 4; }

# --- idempotence: has THIS reviewer identity already ruled on THIS head? ----------------------
# NOTE: a GitHub App installation token CANNOT call /user — apps are not users, and that request
# 403s with "Resource not accessible by integration". The reviewer's identity in the reviews list is
# the app's bot login, which is "<app-slug>[bot]" (e.g. "vjeux-reviewer[bot]"). Read the slug from
# the role config rather than asking the API who we are.
CFG="${FCT_STATE_DIR:-$HOME/.fct-pool}/ghapp/reviewer.json"
ME=""
if [ -f "$CFG" ]; then
  SLUG_APP=$(python3 -c "import json;print(json.load(open('$CFG')).get('slug',''))" 2>/dev/null)
  [ -n "$SLUG_APP" ] && ME="${SLUG_APP}[bot]"
fi
# Fall back to the operator login when the app is not configured (pre-setup behavior).
[ -n "$ME" ] || ME=$(gh api user --jq '.login' 2>/dev/null || echo "")
if [ -n "$ME" ]; then
  PRIOR=$("$ROOT/gh_as.sh" reviewer api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null \
    | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
for r in rs:
    if (r.get('user') or {}).get('login')=='$ME' and r.get('commit_id')=='$HEAD_SHA' \
       and r.get('state') in ('APPROVED','CHANGES_REQUESTED'):
        print(r['state']); break
" 2>/dev/null)
  if [ -n "$PRIOR" ]; then
    echo "pr_review: PR #$PR @ ${HEAD_SHA:0:8} already has $PRIOR from $ME — not re-reviewing"
    exit 0
  fi
fi

# --- submit -----------------------------------------------------------------------------------
resp=$(python3 -c "
import json,sys
print(json.dumps({'commit_id':'$HEAD_SHA','event':'$EVENT','body':sys.argv[1]}))
" "$BODY" | "$ROOT/gh_as.sh" reviewer api -X POST "repos/$SLUG/pulls/$PR/reviews" --input - 2>&1)

if printf '%s' "$resp" | grep -q '"state"'; then
  state=$(printf '%s' "$resp" | python3 -c "import json,sys;print(json.load(sys.stdin).get('state',''))" 2>/dev/null)
  echo "pr_review: PR #$PR @ ${HEAD_SHA:0:8} -> $state (as ${ME:-app})"
  exit 0
fi

if printf '%s' "$resp" | grep -qiE 'own pull request|not approve your own'; then
  cat >&2 <<EOF
pr_review: REFUSED — GitHub says this identity authored PR #$PR, so it cannot review it.
  This is the exact limitation the two GitHub Apps exist to remove. Either the reviewer app is not
  configured (run: python3 raw-port/army/tools/ghapp/setup_apps.py) or this PR was authored by the
  reviewer identity rather than the worker app. Falling back to status+comment is the caller's job.
EOF
  exit 3
fi

echo "pr_review: API error on PR #$PR: $(printf '%s' "$resp" | head -c 400)" >&2
exit 4
