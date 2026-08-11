#!/bin/bash
# new_ops_entry.sh "<short title>" — start an ops report as its OWN file, so it cannot conflict.
#
# WHY THIS EXISTS.
# `OPS_LOG.md` is 4,600 lines and every agent appends its findings to it, so every pair of ops
# reports conflicts by construction. Measured on the last 259 merges: 73 of them — 28% — touch that
# one file. Two agents measured it independently. The costs are not hypothetical:
#   * six of one worker's ten units were the same hand-merge, on changes nobody disagreed about;
#   * five ops PRs were mutually conflicting at once, and three reviewer-APPROVED ones sat
#     unmergeable for over an hour;
#   * the hand resolution is itself dangerous — concatenating two hunks tore a paragraph in half and
#     silently dropped another agent's finding (caught only by a deletion check).
# `merge=union` (#626) helps the local rebase, but GitHub still reports the PR CONFLICTING, so the
# PR is still blocked. Union merge also keeps BOTH sides of a same-line edit, which turns a
# correction into a contradiction.
#
# One file per entry removes the class instead of automating it: two reports touch two files, so they
# merge cleanly and land independently, and nothing needs to be hand-resolved at all.
#
#   bash raw-port/army/tools/new_ops_entry.sh "rebase queue re-offers finished work"
#     -> creates raw-port/army/ops/2026-08-11-rebase-queue-re-offers-finished-work.md
#        pre-filled with the shape every good entry in OPS_LOG already has, and prints the path.
#
# OPS_LOG.md stays exactly where it is: it is the historical record and the reading list, and
# nothing about it moves. New entries simply go beside it.
set -euo pipefail
TITLE="${1:?usage: new_ops_entry.sh \"<short title>\"}"
# Resolve the repo from GIT, not from $0. Deriving a root from the script's own location is the bug
# that has bitten this repo three times today — a tool copied to /tmp then reports an empty queue, or
# writes to /. Ask git where we are; fall back to the script's location only if that fails.
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then ROOT="$(cd "$(dirname "$0")/../../.." 2>/dev/null && pwd || true)"; fi
[ -d "$ROOT/raw-port/army" ] || { echo "new_ops_entry: not inside the fct checkout (ROOT=${ROOT:-unset})" >&2; exit 1; }
DIR="$ROOT/raw-port/army/ops"
mkdir -p "$DIR"

# BSD sed (macOS) has no \+ ; use [[:alnum:]] classes and tr -s, which behave the same everywhere.
SLUG=$(printf '%s' "$TITLE" | tr '[:upper:]' '[:lower:]' \
        | tr -c '[:alnum:]' '-' | tr -s '-' | sed 's/^-//; s/-$//' | cut -c1-60)
SLUG="${SLUG:-entry}"

# Attribution is how a reader knows whose measurement it was and who to ask, and every entry in
# OPS_LOG is signed "by worker N / reviewer N". With FCT_AGENT_ID unset the fallback is the HOSTNAME,
# which is identical for all 8 slots on this box — i.e. a byline that identifies nobody. Say so out
# loud (as pr_submit.sh and review_claim.sh already do for the same variable) and still write the
# file: a slightly anonymous entry beats a refused one.
BYLINE="${FCT_AGENT_ID:-}"
if [ -z "$BYLINE" ]; then
  BYLINE="$(hostname -s)"
  echo "new_ops_entry: FCT_AGENT_ID is unset — signing this entry '$BYLINE', which is the same for" >&2
  echo "               every slot on this box. export FCT_AGENT_ID=<role>-<N> so the byline names you." >&2
fi
FILE="$DIR/$(date +%Y-%m-%d)-$SLUG.md"
if [ -e "$FILE" ]; then FILE="${FILE%.md}-$(date +%H%M%S).md"; fi

cat > "$FILE" <<EOF
# $TITLE

- **reported** $(date -u +%Y-%m-%dT%H:%M:%SZ) by ${BYLINE}
- **status** OPEN

## Symptom

<what you SAW — the command, the output, the number. Not what you concluded.>

## Root cause

<why it happens. If you did not determine it, say so; a symptom with an honest "cause unknown"
is worth more than a guess that reads as fact.>

## Fix / workaround

<what closes it, or what to do until something does. If you fixed it, name the PR.>

## Evidence

\`\`\`
<the measurement, pasted. A claim nobody can re-run is a rumour.>
\`\`\`
EOF

echo "$FILE"
echo "  (edit it, then commit just this file — it cannot conflict with another agent's entry)" >&2
