#!/bin/bash
# rebase_pr.sh <PR#> — WORKER-side conflict-rebase of a regression-failed PR, IN PLACE.
#
# OWNERSHIP (2026-08-10): rebasing splits by kind of work —
#   - "up-to-date"/BEHIND (fast-forwardable)   -> pr_land.sh update-branch      [reviewer, mechanical]
#   - shared file, DISJOINT top-level exports  -> rebase_helper.py (union)      [reviewer, automatic]
#   - shared CLASS BODY / real conflict        -> THIS TOOL, run by a WORKER    [author work]
# A conflict rebase requires deciding which code to keep = AUTHORING, so the WORKER (author) owns it,
# NOT the reviewer (adversary — must not gate its own edits). This tool sets up the rebase in a warm
# pool worktree, auto-resolves what it safely can, and for a shared-class-body conflict PREPARES the
# worktree (main's current file + the branch's net-new methods extracted) so the worker re-applies
# them with the edit tool, then re-gates and force-pushes the SAME branch (the PR updates in place;
# NO new PR). Never touches main.
#
# USAGE: rebase_pr.sh <PR#>
#   Prints one of:
#     REBASE_CLEAN   — git rebase onto origin/main applied with no conflict; force-pushed. Done.
#     REBASE_UNION   — rebase_helper unioned disjoint top-level exports; pushed. Done.
#     REBASE_MANUAL  — shared-class-body conflict. The worktree is prepared at $WT with:
#                        raw-port/src/<file>  = main's CURRENT version (findFirstChild/etc intact)
#                        /tmp/rebase_pr_<PR>_theirs/<file> = the branch's version (your net-new methods)
#                      RE-APPLY your net-new methods into main's class body with the edit tool, then:
#                        bash raw-port/army/gate/gate.sh <file>   # must PASS
#                        git -C "$WT" add -A && git -C "$WT" commit -m "rebase port/<Class> onto main"
#                        git -C "$WT" push -f origin HEAD:<branch>
#                        bash raw-port/army/tools/wt_pool.sh release "$WT"
#                      The worker AGENT completes this step (it needs judgment); the PR then re-gates.
set -uo pipefail
PR="${1:?usage: rebase_pr.sh <PR#>}"
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
git fetch -q origin main 2>/dev/null || true

# A TRANSPORT FAILURE IS NOT A VERDICT, and this lookup used to report one as the other. The corp
# TLS proxy fails intermittently on this box — `Post "https://api.github.com/graphql": tls: failed
# to verify certificate: x509: certificate signed by unknown authority`, measured 3 times in 25
# minutes by one reviewer and twice in one minute here — and with stderr swallowed by 2>/dev/null
# an empty answer printed `rebase_pr: PR #656 not found` about a PR that was open, conflicted and
# had just been handed to me by rebase_claim. Two costs, both real: the worker is told the wrong
# thing (I went looking for a deleted PR), and the rebase LEASE is already charged, so the queue
# has spent one of the PR's three attempts on a blip. Retry, and when the query still cannot be
# answered say THAT instead of inventing a fact about the PR.
BR=""; LOOKUP_ERR=""
for _try in 1 2 3; do
  BR=$(gh pr view "$PR" --repo "$SLUG" --json headRefName --jq .headRefName 2>/tmp/rebase_pr_${PR}_lookup.err)
  [ -n "$BR" ] && break
  LOOKUP_ERR=$(tr -d '\r' < /tmp/rebase_pr_${PR}_lookup.err | tail -1)
  sleep $((_try * 2))
done
if [ -z "$BR" ]; then
  # GitHub ANSWERING "there is no such PR" is a verdict; anything else is the transport. Told apart
  # by the error text, because both arrive as an empty stdout and a non-zero exit:
  #   verdict    GraphQL: Could not resolve to a PullRequest with the number of 999999.
  #   transport  Post "https://api.github.com/graphql": tls: failed to verify certificate: ...
  if printf '%s' "$LOOKUP_ERR" | grep -qiE 'could not resolve to a (pullrequest|repository)|no pull requests found'; then
    echo "rebase_pr: PR #$PR not found (GitHub answered: $LOOKUP_ERR)"; exit 1
  fi
  if [ -n "$LOOKUP_ERR" ]; then
    echo "rebase_pr: could not READ PR #$PR after 3 tries — this is a transport failure, not a"
    echo "           verdict about the PR. Last error: $LOOKUP_ERR"
    echo "           Re-run; if it persists, check \`gh auth status\`. The PR has NOT been examined."
    exit 7
  fi
  echo "rebase_pr: PR #$PR not found (gh answered, and it has no head branch)"; exit 1
fi
CLS="${BR#port/}"; CLS="${CLS%_rebased}"
echo "rebase_pr: PR #$PR  branch=$BR  class=$CLS"

# ---- Attempt 1: rebase_helper (handles up-to-date + disjoint-top-level-export union) ----
# --pr, not "$CLS": a class can have several open PRs on `port/<Class>__slot<N>` branches, and the
# class-keyed form resolved to whichever one held the bare name — handing back a DIFFERENT agent's
# content with exit 0. We know the PR number here, so there is no reason to guess.
python3 raw-port/army/tools/rebase_helper.py --pr "$PR" > /tmp/rebase_pr_${PR}_rh.log 2>&1; rc=$?
if [ "$rc" = 0 ]; then
  # rebase_helper pushed the union result. ASK IT WHICH BRANCH — do not re-derive the name here.
  # It strips BOTH `__slot<N>` and `_rebased` to get the CLASS (rebase_helper.py:134) and pushes
  # `port/<Class>_rebased`; this file used to strip only `_rebased` from the BRANCH, so for the
  # normal contention shape `port/<Class>__slot<N>` it looked for `port/<Class>__slot<N>_rebased`,
  # a ref that does not exist. `git diff` then fataled, the empty side made `comm` report EVERY file
  # as missing, and the last-guard refused a push whose union was sitting on the remote, gate-green.
  # The PR went back to the queue unchanged, and at 3/3 attempts that queue CLOSES it (#28's shape).
  # Measured on #660 (`port/OZChannelBase__slot3`), 2026-08-11. The `port/<Class>` PRs everyone
  # tested with are exactly the ones where the two spellings coincide.
  RB=$(sed -n 's|^PUSHED origin/\(port/[^ ]*_rebased\).*|\1|p' "/tmp/rebase_pr_${PR}_rh.log" | tail -1)
  [ -z "$RB" ] && RB="port/$(printf '%s' "$CLS" | sed -E 's/__slot[0-9]+$//')_rebased"
  git fetch -q origin "+refs/heads/${RB}:refs/remotes/origin/${RB}" 2>/dev/null
  # A MISSING REF IS A TOOL FAULT, NOT A DROPPED FILE, and the two must never print the same
  # sentence: the file-list guard below is only meaningful once both sides of it exist.
  if ! git rev-parse --verify -q "refs/remotes/origin/${RB}^{commit}" >/dev/null; then
    echo "rebase_pr: rebase_helper reported success but its branch ($RB) is not on the remote —"
    echo "rebase_pr: NOT force-pushing, and this is a tooling fault rather than a missing file."
    echo "REBASE_MANUAL"; exit 6
  fi
  # LAST GUARD BEFORE AN IRREVERSIBLE FORCE-PUSH: compare the FILE LIST, not just the gate. A green
  # gate says nothing about a file the rebase dropped, because the gate only inspects the .ts files
  # handed to it (that is how #449 lost an oracle harness). rebase_helper now carries non-src files
  # and asserts they survived; this repeats the check at the push, where the damage would be done.
  git diff --name-only "origin/main...origin/$BR"   | sort > "/tmp/rebase_pr_${PR}_pr.files"
  git diff --name-only "origin/main...origin/${RB}" | sort > "/tmp/rebase_pr_${PR}_rb.files"
  MISSING=$(comm -23 "/tmp/rebase_pr_${PR}_pr.files" "/tmp/rebase_pr_${PR}_rb.files" | tr '\n' ' ')
  if [ -n "${MISSING// /}" ]; then
    echo "rebase_pr: REFUSING to force-push — the rebased branch is missing files the PR has: $MISSING"
    echo "REBASE_MANUAL"; exit 6
  fi
  git push -f origin "refs/remotes/origin/${RB}:refs/heads/$BR" 2>/dev/null \
    && { echo "REBASE_UNION: force-pushed union result onto $BR (PR #$PR updates in place)"; \
         git push -q origin --delete "${RB}" 2>/dev/null || true; exit 0; }
  echo "REBASE_UNION: pushed ${RB} (reviewer merges that)"; exit 0
fi
# ---- rebase_helper exit 3 = "this branch changes no .ts files" --------------------------------
# THAT IS NOT "nothing to rebase", and printing it as one turned the REBASE QUEUE into a no-op loop
# that ends by CLOSING the PR. Measured 2026-08-11 on #400 — APPROVED, +153 lines of OPS_LOG, its
# own gate saying `regression (rebase needed): DIRTY on OPS_LOG.md` — where this line printed
# "not stale / nothing to rebase" and exited 0-ish while `rebase_claim.sh` kept re-offering the PR;
# at 3/3 attempts that queue closes it, with a comment about a shared-class conflict and a promise
# to re-hand "the symbol" that means nothing for a docs/tooling PR. EVERY ops PR is in this class,
# because rebase_helper only ever looks at `raw-port/src/**/*.ts`.
# So ask the question the caller actually has — does this PR merge? — of the only thing that knows.
if [ "$rc" = 3 ]; then
  MRG=""
  for _ in 1 2 3 4; do
    MRG=$(gh pr view "$PR" --repo "$SLUG" --json mergeable --jq .mergeable 2>/dev/null)
    # UNKNOWN means GitHub has not finished computing the merge yet. Asking again IS the handling;
    # a guess in either direction is an answer we would then act on (declare a conflicted PR clean,
    # or churn a clean one).
    [ "$MRG" = "UNKNOWN" ] || [ -z "$MRG" ] || break
    sleep 3
  done
  if [ "$MRG" = "MERGEABLE" ]; then
    echo "rebase_pr: PR #$PR changes no .ts files and merges cleanly — nothing to rebase (rebase_helper exit 3)"; exit 3
  fi
  if [ -z "$MRG" ] || [ "$MRG" = "UNKNOWN" ]; then
    echo "rebase_pr: PR #$PR changes no .ts files and GitHub will not say whether it merges (${MRG:-no answer}) — NOT claiming it is clean"; exit 3
  fi
  echo "rebase_pr: PR #$PR changes no .ts files and is $MRG — rebase_helper cannot see it; merging origin/main in place"
  WT="$(bash raw-port/army/tools/wt_pool.sh acquire "${CLS//\//_}")"
  [ -z "$WT" ] && { echo "rebase_pr: pool busy, retry"; exit 3; }
  git -C "$WT" fetch -q origin "$BR" 2>/dev/null; git -C "$WT" fetch -q origin main 2>/dev/null
  git -C "$WT" checkout -q -B "$BR" "origin/$BR" 2>/dev/null || {
    echo "rebase_pr: cannot check out $BR"; bash raw-port/army/tools/wt_pool.sh release "$WT" >/dev/null 2>&1; exit 1; }
  # A MERGE, and pushed WITHOUT -f. The result is a descendant of the PR head, so the branch can
  # only GAIN commits: this path cannot drop a file, which is the property the .ts paths need a
  # name-list guard to recover (#25/#449) and the reason not to reuse `rebase` here.
  if git -C "$WT" merge --no-edit origin/main >/tmp/rebase_pr_${PR}_merge.log 2>&1; then
    if git -C "$WT" push origin "HEAD:$BR" >/dev/null 2>&1; then
      echo "REBASE_CLEAN: merged current origin/main into $BR and pushed (PR #$PR updates in place)"
      bash raw-port/army/tools/wt_pool.sh release "$WT" >/dev/null 2>&1; exit 0
    fi
    echo "rebase_pr: merge was clean but the push failed — worktree left at $WT"; exit 1
  fi
  CONF=$(git -C "$WT" diff --name-only --diff-filter=U | tr '\n' ' ')
  cat <<NONSRC
REBASE_MANUAL: PR #$PR ($BR) changes no .ts files and CONFLICTS with main — WORKER AGENT finishes it.
  Pool worktree, on $BR at the PR head, with the merge IN PROGRESS:  $WT
  Conflicted:  $CONF
  STEPS:
    1. Resolve each conflicted file. For OPS_LOG.md the collision is almost always two sections
       APPENDED AT THE TAIL by two PRs: keep BOTH, in either order — never choose between them, and
       never take one side wholesale. A hunk with a NON-EMPTY base is a real edit collision and
       needs reading.
    2. git -C "$WT" diff --unified=0 origin/main -- <file> | grep '^-[^-]'    # must print NOTHING:
       publishing this branch must not delete a line that is on main.
    3. git -C "$WT" add <files> && git -C "$WT" commit -q -m "merge origin/main into $BR"
    4. git -C "$WT" push origin "HEAD:$BR"      # NO -f: this is a descendant of the PR head
    5. bash raw-port/army/tools/wt_pool.sh release "$WT"
  To abandon instead: git -C "$WT" merge --abort, then release the worktree.
NONSRC
  exit 6
fi

# ---- Attempt 2: plain git rebase in a pool worktree (clean fast-forward / non-conflicting) ----
WT="$(bash raw-port/army/tools/wt_pool.sh acquire "$CLS")"
[ -z "$WT" ] && { echo "rebase_pr: pool busy, retry"; exit 3; }
cleanup_release () { bash raw-port/army/tools/wt_pool.sh release "$WT" >/dev/null 2>&1; }
# Fetch BOTH refs. Fetching only the branch left `origin/main` at whatever the last fetch of that
# ref had made it, so `rebase -q origin/main` below rebased onto a STALE main and force-pushed a
# head that was BEHIND main by every file landed since. Seen on PR #504: the clean path pushed a
# head whose `git diff origin/main --stat` showed 16 unrelated files missing (three ports, their
# oracles, a tools test and an OPS_LOG section). regression_check caught it — the PR went red with
# "regression (rebase needed)", which is how it came BACK to the rebase queue on attempt 2 of 3 —
# but nothing had actually gone wrong with the PR: the rebase tool had made the staleness worse.
# Rebasing onto a stale ref is never right; fetch first.
git -C "$WT" fetch -q origin main 2>/dev/null
git -C "$WT" fetch -q origin "$BR" 2>/dev/null
git -C "$WT" checkout -q -B "$BR" "origin/$BR" 2>/dev/null
if git -C "$WT" rebase -q origin/main >/tmp/rebase_pr_${PR}_reb.log 2>&1; then
  CHANGED=$(git -C "$WT" diff --name-only origin/main...HEAD -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
  if [ -n "$CHANGED" ] && ! (cd "$WT" && bash raw-port/army/gate/gate.sh $CHANGED >/tmp/rebase_pr_${PR}_gate.log 2>&1); then
    echo "rebase_pr: clean rebase but gate FAILED — needs worker fix; worktree at $WT"; echo "REBASE_MANUAL"; exit 6
  fi
  # LAST GUARD before a force-push: refuse when the head we are about to publish is STALE — i.e.
  # main has files this head does not. TWO dots, deliberately (reviewer-8 caught the first draft
  # using three): a three-dot diff compares against the MERGE BASE, so anything that landed after
  # that base is on neither side and can never appear, which makes it blind to exactly the
  # staleness this guard exists for. Measured both ways on the reported scenario — the two-dot form
  # lists the files that landed, the three-dot form returns empty.
  #
  # WHAT A HIT MEANS, precisely (see the CORRECTION at the top of OPS_LOG): it is NOT a deletion the
  # merge would perform — GitHub applies the three-dot delta, so files landed after the base
  # survive. It means this head is BEHIND main. Refusing is still right, for two reasons: branch
  # protection requires an up-to-date head, so pushing a stale one only burns one of the three
  # rebase attempts; and if main moved between our fetch and this push, our copies of the files we
  # DID touch may be stale too — which is the case that actually loses work, and one no file list
  # can detect.
  STALE=$(git -C "$WT" diff --name-only --diff-filter=D origin/main HEAD | tr '\n' ' ')
  if [ -n "${STALE// /}" ]; then
    echo "rebase_pr: REFUSING to force-push — this head is BEHIND main (missing: $STALE)"
    echo "  main moved after we fetched it. Re-run rebase_pr.sh; it fetches and rebases again."
    echo "  (Those files are not being deleted — a merge applies the three-dot delta — but a stale"
    echo "   head cannot merge under branch protection, and the copies of the files you DID touch"
    echo "   may be stale as well, which is the case that loses work.)"
    cleanup_release; exit 6
  fi
  git -C "$WT" push -f origin "HEAD:$BR" 2>/dev/null && { echo "REBASE_CLEAN: rebased $BR onto origin/main + gate PASS, force-pushed (PR #$PR in place)"; cleanup_release; exit 0; }
  echo "rebase_pr: push failed"; cleanup_release; exit 1
fi
# ---- Conflict: prepare the worktree for the WORKER AGENT to re-apply net-new methods ----
git -C "$WT" rebase --abort 2>/dev/null || true
CONFLICT_FILES=$(git -C "$WT" diff --name-only origin/main...origin/$BR -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
THEIRS="/tmp/rebase_pr_${PR}_theirs"; rm -rf "$THEIRS"; mkdir -p "$THEIRS"
# Re-fetch first: on a busy swarm main moves between the START of this script (rebase_helper +
# a full rebase attempt + a gate run, minutes) and here, and "CURRENT main" that is minutes stale
# is how a hand-merge ends up force-pushing a DELETION of everything that landed in between
# (seen on PR #478: three ports, their oracles and an OPS_LOG section). This narrows the window;
# the worker still has to re-check before committing, which step 3 below now says explicitly.
git -C "$WT" fetch -q origin main 2>/dev/null || true
git -C "$WT" checkout -q --detach origin/main 2>/dev/null
git -C "$WT" checkout -q -B "$BR" origin/main 2>/dev/null      # start from CURRENT main
for f in $CONFLICT_FILES; do
  mkdir -p "$THEIRS/$(dirname "$f")"
  git show "origin/$BR:$f" > "$THEIRS/$f" 2>/dev/null || true   # the branch's version (net-new methods)
done
cat <<MANUAL
REBASE_MANUAL: PR #$PR ($BR) has a shared-class-body / true conflict — WORKER AGENT must finish.
  Pool worktree (started from CURRENT origin/main):  $WT
  Files to reconcile:  $CONFLICT_FILES
  The branch's version of each (your net-new methods to RE-APPLY):  $THEIRS/<file>
  STEPS (in the worktree at \$WT):
    1. For each file: open $WT/<file> (= main's current class) and $THEIRS/<file> (= your branch).
       Add ONLY your net-new methods (the ones NOT already on main) into main's class body with the
       edit tool. Do NOT drop main's methods. Keep @0xADDR provenance.
    2. bash raw-port/army/gate/gate.sh $CONFLICT_FILES      # must print GATE: PASS
    3. git -C "$WT" diff --name-only origin/main...HEAD     # THREE dots: what a merge applies.
       Only files you edited may appear. (A two-dot `diff origin/main` in a worktree whose main has
       moved lists later-landed files as D and looks like mass deletion — it is not; measured, see
       the CORRECTION at the top of OPS_LOG.) The real risk is per-FILE: your copy of a file you DID
       touch may predate main's, so your push reverts what landed in it, and gate.sh/G6 cannot see
       that either. If anything is unexpected, or your base is stale:
         git -C "$WT" fetch origin main && git -C "$WT" reset --hard origin/main
       then re-apply your merge on top (copy your edited files aside first) and re-gate.
    4. git -C "$WT" add -A && git -C "$WT" commit -q -m "rebase $BR onto origin/main (re-apply net-new methods)"
    5. git -C "$WT" fetch origin main && git -C "$WT" rebase origin/main   # <- pr_submit.sh does
       this for a PORT commit, which is exactly why the port path never publishes a stale base;
       this path force-pushes what you wrote, so do it here by hand.
       git -C "$WT" push -f origin "HEAD:$BR"               # updates PR #$PR in place
    6. bash raw-port/army/tools/wt_pool.sh release "$WT"
MANUAL
exit 6
