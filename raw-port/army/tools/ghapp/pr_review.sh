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
# --expect-head may appear before or after the body form; pull it out first.
#
# A FLAG'S VALUE IS AS DANGEROUS AS ITS NAME. The refusal below covers an unknown flag NAME, but the
# same evidence-destroying shapes come from a flag whose VALUE is missing or empty — which is what an
# unquoted or unset variable produces, and that is exactly the slip this whole change is about:
#   * `--body-file "$EVIDENCE"` with EVIDENCE unset consumed the empty value, re-emitted the flag,
#     failed the post-loop `-n "$2"` test and fell through to the `BODY="$*"` this change exists to
#     kill — posting a 12-character review reading "--body-file ". Exit 0, success line, evidence
#     gone, and the readback check cannot see it because the mangling happened BEFORE the send.
#   * `--expect-head $SHA` with SHA empty left one positional, so `shift 2` shifted NOTHING (a failed
#     shift is not fatal under `set -uo pipefail`) and the loop SPUN FOREVER — wedging a reviewer
#     slot with its review lease and slot lock both held, silently.
#   * `--expect-head ""` turned the binding OFF while the caller believed it was on, announced only
#     by a stderr line that reads as though the flag was never passed. A guard that appears to be on
#     and is off is the failure class this PR is about.
# So each arm demands its value and refuses an empty one, before anything else runs.
EXPECT_HEAD=""
BODY_FILE=""
NPOS=0
_args=(); while [ $# -gt 0 ]; do
  case "$1" in
    --expect-head)
      [ $# -ge 2 ] || { echo "pr_review: --expect-head requires a SHA" >&2; exit 2; }
      [ -n "$2" ]  || { echo "pr_review: --expect-head was given an EMPTY sha (unset variable?)" >&2; exit 2; }
      EXPECT_HEAD="$2"; shift 2 ;;
    --body-file)
      [ $# -ge 2 ] || { echo "pr_review: --body-file requires a path" >&2; exit 2; }
      [ -n "$2" ]  || { echo "pr_review: --body-file was given an EMPTY path (unset variable?)" >&2; exit 2; }
      BODY_FILE="$2"; shift 2 ;;
    --)            shift; while [ $# -gt 0 ]; do _args+=("$1"); NPOS=$((NPOS+1)); shift; done ;;
    --*)
      # AN UNRECOGNISED FLAG MUST NOT BECOME THE REVIEW BODY.
      # It did: `pr_review.sh <PR> request-changes --expect-head <sha> --body-file <path>`, run
      # against a copy of this script WITHOUT --expect-head, fell through to `BODY="$*"` and posted a
      # 91-character review reading "--expect-head … --body-file …". Eleven KB of differential — the
      # evidence the verdict rested on — was destroyed, at exit 0, behind a success line that looked
      # correct. The reviewer found it only by reading the posted body back.
      # It is the cruellest shape of this class: following the CURRENT advice ("always pass
      # --expect-head") is what destroys the record, on any host still running the older tool. I
      # reproduced it by accident one minute after reading the report.
      # A verdict body is evidence. Refuse rather than guess.
      cat >&2 <<EOM
pr_review: unknown option "$1".
  Refusing, because an unrecognised flag would otherwise be posted AS THE REVIEW BODY and your
  evidence silently discarded (that happened; 11KB of a differential was lost this way, at exit 0).
  Supported: --expect-head <sha>, --body-file <path>, or a literal body as the final argument.
  If this flag is real but unknown here, you are running an OLDER pr_review.sh than your brief
  describes: git log -1 --format=%h -- raw-port/army/tools/ghapp/pr_review.sh
EOM
      exit 2 ;;
    *) _args+=("$1"); NPOS=$((NPOS+1)); shift ;;
  esac
done

# A LITERAL BODY AND A --body-file ARE TWO ANSWERS TO ONE QUESTION, so pick neither. Before this,
# whichever came FIRST in argv won and the other was silently discarded — and when the literal came
# first the discarded one was the file, so the review body became
# "real evidence text --body-file /tmp/body.md": the flag itself entered the permanent record and
# the 11KB of differential behind the path did not. That is the headline bug of this change arriving
# through argv ORDER rather than through an unknown flag, and it exits 0 with a plausible success
# line like every other member of the family.
if [ -n "$BODY_FILE" ] && [ "$NPOS" -gt 0 ]; then
  cat >&2 <<EOM
pr_review: refusing — you passed BOTH --body-file "$BODY_FILE" and a literal body.
  One of them would be silently discarded, and which one depends on the order they appear in.
  Pass the evidence one way: --body-file <path> (preferred; no shell touches the text), or a single
  literal body as the final argument.
EOM
  exit 2
fi
# --body-file is re-emitted FIRST, so the reader below sees it wherever the caller put it.
if [ -n "$BODY_FILE" ]; then
  set -- --body-file "$BODY_FILE"
else
  set -- ${_args[@]+"${_args[@]}"}
fi

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

# --expect-head <sha>: BIND THE VERDICT TO THE CODE THAT WAS ACTUALLY REVIEWED.
# This script resolves the head at CALL time, so a push landing between "I finished verifying" and
# "I signed" moves the signature onto code nobody read. Measured by one reviewer at 3 occurrences in
# 6 PRs; on #384 an APPROVE bound to a head carrying +119 unreviewed lines, with every gate green.
# The reviewer knows which SHA they verified — they leased it. Pass it, and a moved head becomes a
# refusal instead of a signature. Omitting it still works (and warns), because a hard requirement
# would break every existing caller mid-swarm.
#
# WHAT THIS FLAG DOES **NOT** PROMISE, stated here because the first attempt to fix it (#619) was a
# no-op built on the wrong mechanism, and because the help text implied the stronger guarantee.
# It closes exactly one window: a head that moved BEFORE the POST, which becomes an exit 5 refusal.
# It cannot keep a verdict pinned afterwards. A review's `commit_id` is NOT a durable record of what
# was read:
#
#     PR    review submitted_at   bound commit (a `Merge branch 'main' into <branch>`)   delta
#     #585  18:41:58Z             7280342e   committed 18:42:37Z                         +39s
#     #610  18:45:35Z             99e5acd2   committed 18:45:43Z                          +8s
#     #599  18:50:18Z             46ddcf82   committed 18:50:21Z                          +3s
#
# All three were signed WITH --expect-head, matching, and this script has always sent an explicit
# `commit_id` (the POST below). No POST can bind to a commit created 39 seconds after it: GitHub
# re-points a review forward along the FIRST-PARENT chain of the server-side merges that
# `pr_land.sh`'s `PUT /pulls/<N>/update-branch` produces — 46ddcf82's first parent is 581e29c7, the
# head that was signed; on #585 it moved two hops. Same review id, same body, same submitted_at,
# only commit_id changed. So `pr_land` re-points the very signature it demanded.
# THE FIX IS IN pr_land, NOT HERE: do not `update-branch` a PR that holds a live review lease
# (expose it from review_claim.sh), or re-verify the approval against the head update-branch created.
# Until then the only available check is to re-read the binding AFTER the PR lands and report a move
# rather than refuse it — see the note printed after a successful APPROVE below.
if [ -n "${EXPECT_HEAD:-}" ]; then
  if [ "$EXPECT_HEAD" != "$HEAD_SHA" ]; then
    cat >&2 <<EOM
pr_review: REFUSING — PR #$PR moved while you were verifying it.
  you verified : ${EXPECT_HEAD:0:12}
  current head : ${HEAD_SHA:0:12}
  Your evidence describes the first; signing would attach it to the second. Re-verify the new head
  (the diff between them is what you have not read), then sign with --expect-head <new sha>.
EOM
    exit 5
  fi
else
  echo "pr_review: note — no --expect-head given, so this verdict binds to whatever the head is NOW" >&2
  echo "  (${HEAD_SHA:0:12}). If a push landed while you were verifying, you are signing unread code." >&2
fi

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
  # READ THE BODY BACK. Every way a body has been lost here — the caller's shell expanding
  # backticks, an unknown flag captured as the body — exits 0 with a plausible success line, so
  # comparing what GitHub stored against what we sent is the only reliable signal.
  sent=${#BODY}
  got=$(printf '%s' "$resp" | python3 -c "import json,sys;print(len(json.load(sys.stdin).get('body') or ''))" 2>/dev/null || echo "")
  if [ -n "$got" ] && [ "$got" != "$sent" ]; then
    echo "pr_review: WARNING — GitHub stored $got chars but $sent were sent; your evidence may have" >&2
    echo "  been mangled in transit. Read it back: gh pr view $PR --json reviews --jq '.reviews[-1].body'" >&2
  fi
  # READ THE BINDING BACK TOO. The body-length check above catches a destroyed BODY; this catches a
  # binding the API did not honour at write time. It cannot catch the retroactive re-pointing
  # documented at --expect-head above — nothing sent from here can — so the note below says so
  # instead of implying a guarantee this script cannot give.
  bound=$(printf '%s' "$resp" | python3 -c "import json,sys;print(json.load(sys.stdin).get('commit_id') or '')" 2>/dev/null || echo "")
  if [ -n "$bound" ] && [ "$bound" != "$HEAD_SHA" ]; then
    echo "pr_review: WARNING — signed ${HEAD_SHA:0:12} but GitHub recorded this review against ${bound:0:12}." >&2
    echo "  Your evidence describes the first. Say so on the PR before anyone lands it." >&2
  fi
  echo "pr_review: PR #$PR @ ${HEAD_SHA:0:8} -> $state (as ${ME:-app}, body ${sent} chars, recorded against ${bound:0:8})"
  if [ "$EVENT" = "APPROVE" ]; then
    echo "pr_review: note — this binding is not durable. pr_land's update-branch makes a merge commit" >&2
    echo "  whose first parent is this head, and GitHub moves the review onto it (measured +3s to +39s" >&2
    echo "  after signing, on #599/#610/#585). Re-read it AFTER the PR lands, and report a move:" >&2
    echo "    gh api repos/$SLUG/pulls/$PR/reviews --jq '.[]|[.state,.commit_id[0:8],(.body[0:40])]|@tsv'" >&2
  fi
  exit 0
fi

# A PR AUTHORED BY THE REVIEWER APP CAN NEVER BE APPROVED BY ANY REVIEWER, so say so plainly rather
# than letting each slot rediscover it by burning a lease. GitHub refuses a self-review, and every
# reviewer slot shares this one app identity — so such a PR is structurally unmergeable: no queue can
# claim it (swarm_doctor reports it as an orphan), and it sits open forever. Two are open right now,
# both OPS_LOG reports a reviewer filed with raw `gh pr create` instead of pr_submit.sh, which pushes
# as the WORKER app precisely so that author != reviewer.
if printf '%s' "$resp" | grep -qiE 'own pull request|not approve your own'; then
  # ONE PRINCIPAL, TWO NAMES — this is the whole reason the first version of this block was dead
  # code. `pulls/<n>/reviews` calls the reviewer `vjeux-reviewer[bot]`, which is what $ME is built
  # from and is correct for the idempotence check above; `pulls/<n>` reports the same principal as
  # the AUTHOR `app/vjeux-reviewer`. Comparing the second against the first is false on exactly the
  # PRs this message exists for (#601, #604), so the reader got the generic "apps not configured"
  # message — the one this block replaces. Accept every spelling instead of picking one.
  ME_SLUG="${ME%\[bot\]}"
  AUTHOR=$("$ROOT/gh_as.sh" reviewer pr view "$PR" --repo "$SLUG" --json author --jq .author.login 2>/dev/null)
  # THREE STATES, NOT TWO. "the author is someone else" and "I could not read the author" are
  # different facts, and folding the second into the first is this file's recurring bug. GitHub has
  # already told us that whoever we are acting as authored this PR, so the dead end is certain even
  # when the lookup fails; what an unreadable author costs us is only the app-vs-operator
  # distinction, and the message says so rather than guessing.
  MINE=other
  case "${AUTHOR:-}" in
    "app/$ME_SLUG"|"$ME_SLUG[bot]"|"$ME_SLUG") MINE=yes ;;
    "")                                        MINE=unknown ;;
  esac
  if [ "$MINE" = unknown ]; then
    echo "pr_review: could not read PR #$PR's author (gh did not answer), so the remedy below is the" >&2
    echo "  likely one rather than the confirmed one: GitHub's refusal proves that whoever this" >&2
    echo "  script is acting as authored the PR. If the apps are NOT configured you are acting as the" >&2
    echo "  operator and the fix is setup_apps.py, not a re-file." >&2
  fi
  if [ "$MINE" = yes ] || [ "$MINE" = unknown ]; then
    cat >&2 <<EOM
pr_review: PR #$PR was authored by the REVIEWER app (${AUTHOR:-could not read the author}), so NO reviewer can ever approve it —
  every reviewer slot shares this identity and GitHub refuses a self-review. It is structurally
  unmergeable and invisible to every queue.
  This happens when a reviewer files a PR with raw \`gh pr create\`. Use pr_submit.sh, which pushes
  as the WORKER app for exactly this reason (author != reviewer).
  To rescue THIS one: re-push the branch as the worker app and open a fresh PR —
      bash raw-port/army/tools/ghapp/git_push_as.sh worker -q -u origin <branch> --force-with-lease
      bash raw-port/army/tools/ghapp/gh_as.sh worker pr create --base main --head <branch> ...
  then close #$PR with a pointer to the replacement.
EOM
    exit 3
  fi
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
