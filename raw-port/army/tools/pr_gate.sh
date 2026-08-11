#!/bin/bash
# pr_gate.sh <PR#> [--reviewed] — PR-flow faithfulness gate, run by the ADVERSARIAL REVIEWER on
# vjeux-mac (has Final Cut Pro; the dlsym oracle needs it). It IS the CI for main.
#
# TWO-PHASE (mechanical gate, then semantic reviewer sign-off):
#   PHASE 1 (default): run gate.sh G0-G5 + regression_check + dup_check in an ISOLATED worktree
#     (gate TOOLS taken from origin/main so a PR can't ship its own gate). Post commit status:
#       - hard fail (G0-G5 reject / regression exit2 / dup exit5) -> status FAILURE.
#       - PASS but G5 raised FLAGs (NO-DISASM blind spots — the class where PCTimer_getSeconds's
#         fabricated steady_clock hides) -> status FAILURE with 'needs reviewer re-derivation'.
#         The mechanical gate does NOT clear flags; only a human/LLM adversarial reviewer does.
#       - clean PASS, 0 flags -> status SUCCESS (mergeable).
#   PHASE 2: after the reviewer INDEPENDENTLY re-derives disasm and confirms faithful, they re-run
#     `pr_gate.sh <PR#> --reviewed` which (only if phase-1 was PASS-modulo-flags) posts SUCCESS.
#
# A green 'faithfulness-gate' status therefore means: mechanical gate clean AND (no flags OR a
# reviewer explicitly signed off). Branch protection requires this status; reviewer then merges.
set -uo pipefail
PR="${1:?usage: pr_gate.sh <PR#> [--reviewed]}"
REVIEWED=0; [ "${2:-}" = "--reviewed" ] && REVIEWED=1
REPO_SLUG="vjeux/fcp-headless-transitions"
CANON="$HOME/random/final-cut-pro-transitions"
cd "$CANON"

HEAD_SHA=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefOid  --jq .headRefOid)
HEAD_REF=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefName --jq .headRefName)
[ -z "$HEAD_SHA" ] && { echo "PR #$PR not found"; exit 3; }
echo "PR #$PR  head=$HEAD_REF @ ${HEAD_SHA:0:12}  reviewed=$REVIEWED"
# Post the required `faithfulness-gate` status as the REVIEWER app (falls back to operator auth if
# the app is not configured). Having the gate come from the reviewer identity — not from whoever's
# token happened to be handy — is what lets branch protection treat it as an independent check.
GHAPP_G="$(cd "$(dirname "$0")" && pwd)/ghapp"
post_status () { bash "$GHAPP_G/gh_as.sh" reviewer api -X POST "repos/$REPO_SLUG/statuses/$HEAD_SHA" -f state="$1" -f context="faithfulness-gate" -f description="$2" >/dev/null 2>&1 && echo "  status: $1 — $2" || echo "  WARN status post failed"; }

# A MECHANICAL `success` MUST NOT PAPER OVER A REVIEWER'S REJECTION.
# The pending guard below stopped a concurrent run from erasing a verdict with `pending`, but left
# the worse door open: a `success`. Observed live on PR #550 — a reviewer posted a regression
# `failure`, and six seconds later another agent's gate run posted `success` over it. GitHub keeps
# only the LATEST status per context, so the required check went green and the rejection vanished
# from everything branch protection can see.
#
# The distinction that matters is not failure-vs-success, it is MECHANICAL vs JUDGED. A same-head
# failure→success flip is legitimate when it is mechanical: `regression_check` compares against
# main, and main moves, so a genuine regression really can clear with no push. But when a REVIEWER
# holds an un-dismissed CHANGES_REQUESTED on this head, a green mechanical gate is not new
# information about the port — the defect they named is semantic and still there. Refuse, and say so.
reviewer_rejected_this_head () {
  bash "$GHAPP_G/gh_as.sh" reviewer api "repos/$REPO_SLUG/pulls/$PR/reviews" --paginate 2>/dev/null \
  | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit(1)
latest={}
for r in rs:
    st=r.get('state')
    if st in ('APPROVED','CHANGES_REQUESTED','DISMISSED'):
        latest[((r.get('user') or {}).get('login'), r.get('commit_id'))]=st
who=[u for (u,sha),st in latest.items() if st=='CHANGES_REQUESTED' and sha=='$HEAD_SHA']
print(','.join(x for x in who if x))
raise SystemExit(0 if who else 1)
" 2>/dev/null
}
# A REVIEWER'S PARKED FAILURE IS ALSO A JUDGEMENT, and for one whole class of PR it is the ONLY
# form of rejection available. The incident this guard was written for — #550, where a reviewer's
# regression `failure` was overwritten by another agent's `success` six seconds later, twice —
# could NOT be caught by the CHANGES_REQUESTED check above, because #550 never had a
# CHANGES_REQUESTED: it was a DIRTY non-src PR whose content the reviewer had already APPROVED, so
# there was nothing to reject semantically and the documented move for that class is to hand-post a
# rebase-flavoured failure status. Measured on that PR: 1 review, APPROVED, and two erasures.
# The second-order harm is worse than a lost verdict — `rebase_claim` finds work by grepping the
# status DESCRIPTION for regression|rebase, so posting success over the park also strands the PR.
# So: before overwriting, read the CURRENT status on this head and refuse if it is a failure whose
# description carries a park marker. Mechanical failures (this script's own G0-G5 reasons) are not
# in that set, so a genuine re-gate of a fixed tree still goes green.
PARK_MARKERS='regression|rebase needed|BLOCKED ON A TOOL BUG|JUDGED:|content APPROVED'
parked_failure_on_this_head () {
  local cur desc
  cur=$(bash "$GHAPP_G/gh_as.sh" reviewer api "repos/$REPO_SLUG/commits/$HEAD_SHA/status" \
          --jq '[.statuses[]?|select(.context=="faithfulness-gate")]|last|"\(.state)\t\(.description)"' 2>/dev/null)
  [ "${cur%%	*}" = "failure" ] || return 1
  desc="${cur#*	}"
  printf '%s' "$desc" | grep -qiE "$PARK_MARKERS" || return 1
  printf '%s' "$desc"
}

# Returns 0 when a success status was actually posted, 1 when it was WITHHELD. The distinction
# matters to the caller: printing `PR_GATE: PASS ✅` after withholding tells a reader that a green
# status exists when none does.
post_success_unless_rejected () {
  local rejectors parked
  if rejectors="$(reviewer_rejected_this_head)"; then
    echo "  status: REFUSING to post success on ${HEAD_SHA:0:8} — un-dismissed CHANGES_REQUESTED stands (${rejectors})"
    echo "  a green mechanical gate is not an answer to a semantic rejection; the author must fix it,"
    echo "  or the reviewer must dismiss their own review deliberately."
    return 1
  fi
  if parked="$(parked_failure_on_this_head)"; then
    echo "  status: REFUSING to post success on ${HEAD_SHA:0:8} — a reviewer PARKED this head:"
    echo "    \"$parked\""
    echo "  that park is the only rejection a green-but-conflicted non-src PR can carry, and"
    echo "  overwriting it also hides the PR from rebase_claim, which greps the description."
    return 1
  fi
  post_status success "$1"
}

# A PENDING must never overwrite a settled verdict. GitHub keeps only the LATEST status per context,
# so a second agent starting a gate run on a PR that already has a red REJECT posts `pending` over
# it and the rejection vanishes from the required check — reviewer-03 watched another agent's
# POOL_BUSY pending erase its REJECT on #82 and had to restore it by hand. A concurrent gate run is
# not new information about the port; a verdict is. Success/failure still overwrite freely (they ARE
# new information), and a pending on a head with no verdict yet is posted normally.
post_pending_if_undecided () {
  local cur
  cur=$(bash "$GHAPP_G/gh_as.sh" reviewer api "repos/$REPO_SLUG/commits/$HEAD_SHA/status" \
          --jq '[.statuses[]?|select(.context=="faithfulness-gate")]|last|.state // ""' 2>/dev/null)
  case "$cur" in
    success|failure|error)
      echo "  status: keeping existing '$cur' verdict on ${HEAD_SHA:0:8} (not overwriting with pending)";;
    *) post_status pending "$1";;
  esac
}
post_pending_if_undecided "gate running on vjeux-mac"

git fetch -q origin main "+refs/pull/$PR/head:refs/prgate/$PR" 2>/dev/null || git fetch -q origin main "$HEAD_REF" 2>/dev/null
# WARM POOL (2026-08-10): lease a pre-materialized worktree and detached-checkout the PR head into it,
# instead of `git worktree add`/`remove` per PR (which wrote ~2,579 files -> corp Defender scan storm).
# The pool reuses the checkout + a warm tsgo cache; release resets it to origin/main for the next PR.
WT="$(bash "$CANON/raw-port/army/tools/wt_pool.sh" acquire-at "$HEAD_SHA")"
[ -z "$WT" ] && { post_pending_if_undecided "pool busy — retry"; echo "PR_GATE: POOL_BUSY (#$PR) — no free worktree, retry"; exit 3; }
# A gate worktree is DISPOSABLE by construction: we detach it at the PR head and then deliberately
# overwrite raw-port/army/{gate,tools} with the TRUSTED copies from origin/main, which leaves the tree
# dirty on purpose. So it must be released with --force.
#
# This is not a detail. wt_pool's release guard (added to stop a reviewer's stale-lease reclaim from
# wiping a WORKER's in-progress port) refuses to reset a dirty tree — so without --force every single
# pr_gate run LEAKED its lease. All 16 pool slots filled with `gate/<sha>` leases, `acquire` then
# blocked 120s and returned POOL_FULL, and the swarm deadlocked: reviewer-03 stopped entirely
# ("all 16 warm-pool worktrees were leased by other agents for ~10 minutes straight, which makes
# gating and therefore merging impossible"). The protection is right for a worker's port; a gate
# checkout has nothing to protect.
# Pass the tag we leased. This trap can fire LATE — after a slow gate, a kill, or a context cut —
# by which time the slot may already belong to a worker, and a bare --force release would reset
# THEIR tree and delete their uncommitted port (seen 2026-08-11 on slot 2). With the tag, wt_pool
# refuses the release when the lease is no longer ours.
cleanup () { bash "$CANON/raw-port/army/tools/wt_pool.sh" release "$WT" --force "gate/$HEAD_SHA" >/dev/null 2>&1; }
trap cleanup EXIT
cd "$WT"
for d in raw-port/node_modules venv; do ln -sfn "$CANON/$d" "$d" 2>/dev/null || true; done
# TRUSTED gate tools from origin/main (never trust the PR's own gate)
T="/tmp/prgate_tools_$$"; rm -rf "$T"; mkdir -p "$T"
# raw-port/army/verifier IS part of the gate: g5_impl_gate.py imports classify_disasm/reach_check
# from it. Copying only gate/ and tools/ left TWO holes. (1) A PR could ship its OWN
# verifier/classify_disasm.py — the very thing "a PR can't ship its own gate" is supposed to
# prevent, since classify() is what decides TRAP/EMPTY/REAL. (2) Version skew: gate/ from current
# main against verifier/ from a stale branch, which is how #322's new `names_class` import raised
# ImportError on PR #341 and (before the gate.sh fix in this commit) skipped G5 entirely.
git --git-dir="$CANON/.git" archive origin/main raw-port/army/gate raw-port/army/tools raw-port/army/verifier | tar -x -C "$T" 2>/dev/null
cp -R "$T/raw-port/army/gate" raw-port/army/ 2>/dev/null; cp -R "$T/raw-port/army/tools" raw-port/army/ 2>/dev/null; cp -R "$T/raw-port/army/verifier" raw-port/army/ 2>/dev/null; rm -rf "$T"

git fetch -q origin main 2>&1 | tail -1
CHANGED=$(git diff --name-only origin/main...HEAD -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
if [ -z "$CHANGED" ]; then
  if post_success_unless_rejected "no raw-port/src ports to gate (infra/tooling PR)"; then
    echo "PR_GATE: PASS (no src changes) (#$PR)"
  else
    echo "PR_GATE: PASS-WITHHELD (no src changes) (#$PR) — the mechanical gate is clean but NO green status was posted (see above)"
  fi
  exit 0
fi
echo "changed: $CHANGED"

# ABSOLUTIZE before handing paths to gate.sh. `git diff --name-only` emits repo-RELATIVE paths, and
# with a relative path G5's reach_check builds a file:// URL that node rejects on macOS
# ("File URL host must be 'localhost' or empty"), so the fuzz returns hits=None -> REVIEW_NEEDED,
# which pr_gate counts as a CHEAT. Reviewer-01 proved it in a controlled test: same worktree, same
# content, same disasm — relative = REJECT, absolute = PASS with 0 cheats / 0 flags.
#
# This was not a nuisance, it was corrosive in two ways:
#   * SELF-INFLICTED AND PERMANENT — the verdict flips only once the symbol's .s exists in the leased
#     worktree, so performing the REQUIRED reviewer re-derivation is exactly what broke the gate for
#     that PR, and wt_pool cleans without -x so it never cleared. #181 gated PASS and REJECT
#     alternately within minutes.
#   * PROGRESSIVE — #214 was rejected for 3 "cheats", two of them methods ALREADY LANDED on main. As
#     disasm coverage grows, previously-mergeable files become unmergeable.
# Corollary worth remembering: the gate was passing PRs largely when it could NOT see the disassembly.
CHANGED_ABS=""
for f in $CHANGED; do
  case "$f" in /*) CHANGED_ABS="$CHANGED_ABS $f" ;; *) CHANGED_ABS="$CHANGED_ABS $PWD/$f" ;; esac
done
CHANGED_ABS="${CHANGED_ABS# }"

FAIL=0; REASON=""
GLOG=/tmp/prgate_gatelog_$$
bash raw-port/army/gate/gate.sh $CHANGED_ABS 2>&1 | tee "$GLOG"
grep -q "GATE: PASS" "$GLOG" || { FAIL=1; REASON="G0-G5 gate reject"; }
# G5 flags (blind-spot: NO-DISASM / dispatch-only) — a green status is NOT allowed while flags stand,
# unless a reviewer has re-derived and passes --reviewed.
FLAGS=$(grep -cE '^  FLAG:' "$GLOG" 2>/dev/null || true); FLAGS=$(printf '%s' "${FLAGS:-0}" | tr -dc '0-9'); FLAGS=${FLAGS:-0}
rm -f "$GLOG"

python3 raw-port/army/tools/regression_check.py origin/main HEAD $CHANGED; rc=$?
if [ "$rc" = "2" ]; then FAIL=1; REASON="regression (rebase needed)"; elif [ "$rc" != "0" ]; then FAIL=1; REASON="regression_check errored rc=$rc"; fi
python3 raw-port/army/tools/dup_check.py origin/main HEAD $CHANGED; rc=$?
if [ "$rc" = "5" ]; then FAIL=1; REASON="dup-ledger (already on main)"; elif [ "$rc" != "0" ]; then FAIL=1; REASON="dup_check errored rc=$rc"; fi
# ONE C++ CLASS = ONE .ts. check_duplicate_classes.py has always worked and was never invoked —
# its docstring and PORTING_SPEC both call it a CI guard, yet no gate ran it, so it reported into
# the void while 7 duplicates accumulated on main (5 classes filed twice across LAYER DIRECTORIES:
# ozone/ vs channels/, nodes/ vs channels/). dup_check above cannot see these — it compares ledger
# symbols, not filenames — and G6 cannot either, because each file is add-only in isolation. Two
# files modelling one class means two struct layouts that silently drift.
# --new-only judges the DELTA: a PR that adds no new duplicate passes even while main carries the
# existing 7, which is what makes wiring this in possible today rather than after a cleanup.
python3 raw-port/army/tools/check_duplicate_classes.py --new-only origin/main; rc=$?
if [ "$rc" = "2" ]; then FAIL=1; REASON="introduces a duplicate class file (one C++ class = one .ts)";
elif [ "$rc" != "0" ]; then FAIL=1; REASON="check_duplicate_classes errored rc=$rc"; fi

if [ "$FAIL" != 0 ]; then post_status failure "$REASON"; echo "PR_GATE: FAIL ❌ (#$PR) — $REASON"; exit 1; fi
if [ "$FLAGS" -gt 0 ] && [ "$REVIEWED" != 1 ]; then
  post_status failure "$FLAGS G5 flag(s): reviewer must re-derive disasm, then rerun --reviewed"
  echo "PR_GATE: NEEDS-REVIEW ⚠️ (#$PR) — $FLAGS G5 flag(s); mechanical gate clean but blind-spots need semantic review"
  exit 2
fi
WITHHELD=0
if [ "$FLAGS" -gt 0 ]; then
  post_success_unless_rejected "reviewer-signed (had $FLAGS flag(s), re-derived OK)" || WITHHELD=1
else
  post_success_unless_rejected "gate PASS (G0-G5 clean, 0 flags)" || WITHHELD=1
fi
if [ "$WITHHELD" = "1" ]; then
  echo "PR_GATE: PASS-WITHHELD ⚠️ (#$PR) — the mechanical gate is clean but NO green status was posted (see above)"
else
  echo "PR_GATE: PASS ✅ (#$PR)"
fi
