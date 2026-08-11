#!/bin/bash
# wt_pool.sh — WARM worktree pool for the FCP raw-port swarm.
#
# WHY: the OLD flow did `git worktree add` (materialize ~2,579 files = 79MB) + `worktree remove`
# PER UNIT / PER PR. git itself is fast (~0.4s) but the file-write VOLUME is what corp Microsoft
# Defender (MDM-locked — CANNOT be excluded, verified) scans on every write; that scan storm is what
# pegged the box to load 52 with ~20 agents. This pool keeps a FIXED set of long-lived worktrees and,
# per unit, only `git reset --hard <ref>` + writes the ONE changed file. Reuses the checked-out tree
# AND a warm tsgo .gate.tsbuildinfo (typecheck ~1.2s -> ~0.2s). Net: ~1 file-write per unit instead of
# ~2,579, and NO per-unit add/remove churn — so Defender has ~2,500x fewer writes to scan.
#
# USAGE:
#   wt_pool.sh init [N]            -> pre-create N warm worktrees (default WT_POOL_SIZE or 16).
#   wt_pool.sh acquire <Class>     -> lease a warm wt, reset to origin/main, cut branch port/<Class>.
#                                     Prints the wt path on stdout (all logs go to stderr). WORKERS.
#   wt_pool.sh acquire-at <SHA>    -> lease a warm wt, detached-checkout at <SHA> (a PR head).
#                                     Prints the wt path. REVIEWERS (pr_gate).
#   wt_pool.sh release <path>      -> reset to origin/main, drop branch, free the lease. Reuses the checkout.
#   wt_pool.sh gc                  -> reset all IDLE pool worktrees to origin/main (refresh warm cache).
#   wt_pool.sh status              -> show slots, lease holder, age.
#
# Pool under ~/.fct-pool/wt/NN (Spotlight-excluded via .metadata_never_index; Defender is MDM-locked so
# we cannot exclude it — the whole point is to minimize writes, not to exclude the dir). Leases are
# atomic mkdir locks in ~/.fct-pool/leases/NN (mkdir is atomic, so two concurrent agents can't grab the
# same slot). acquire BLOCK-WAITS up to WT_POOL_WAIT sec (default 120) for a free slot.
set -uo pipefail
CANON="$HOME/random/final-cut-pro-transitions"
POOL="$HOME/.fct-pool"; WTDIR="$POOL/wt"; LEASES="$POOL/leases"
# Pool sized ABOVE the agent count on purpose. HARNESS_LOOP invariant 4 caps concurrency at the pool
# size, and running N agents against exactly N slots means every reviewer gate run competes with a
# worker for the last slot — the POOL_FULL stall that halted gating in OPS_LOG #12. Reviewers hold a
# lease per pr_gate AND per oracle differential, so the real demand is above one slot per agent.
# 24 slots for 16 agents costs ~440MB of disk (160GB free) and removes the contention entirely.
NPOOL="${WT_POOL_SIZE:-24}"; WAIT="${WT_POOL_WAIT:-120}"
mkdir -p "$WTDIR" "$LEASES"
touch "$POOL/.metadata_never_index" 2>/dev/null

log () { echo "$@" >&2; }   # never pollute stdout (callers read the wt path from stdout)

link_deps () {
  local wt="$1"
  for d in raw-port/node_modules venv; do
    [ -e "$CANON/$d" ] && ln -sfn "$CANON/$d" "$wt/$d" 2>/dev/null
  done
  # The symbol inventory (army/inventory/<FW>.syms.txt) is gitignored regenerable state, so a
  # worktree gets an EMPTY inventory dir — and the mandated fast path ("grep the cache, never nm the
  # 78MB framework binary", OPS_LOG #22) then dies with FileNotFoundError right where every agent
  # works. Agents that hit that fall back to nm, which is the multi-minute core-hog the cache exists
  # to avoid: the guidance and the filesystem disagreed, and the filesystem won. Symlink the canonical
  # copies in, per file rather than by directory: a per-directory `ln -sfn` onto an existing real dir
  # silently nests the link INSIDE it, which is the trap this avoids. Note `ln -sfn` DOES replace a
  # real file a worktree generated for itself — verified, not assumed — and that is the behaviour we
  # want: the canonical inventory is the complete 5-framework set, while an ad-hoc local slice is
  # whatever one agent happened to need.
  if [ -d "$CANON/raw-port/army/inventory" ]; then
    mkdir -p "$wt/raw-port/army/inventory" 2>/dev/null
    for f in "$CANON"/raw-port/army/inventory/*.syms.txt; do
      [ -e "$f" ] && ln -sfn "$f" "$wt/raw-port/army/inventory/$(basename "$f")" 2>/dev/null
    done
  fi
}

make_wt () { # create pool worktree #N if missing; echo its path
  local n="$1"; local wt="$WTDIR/$n"
  [ -e "$wt/.git" ] || git -C "$CANON" worktree add -q --detach "$wt" origin/main 2>/dev/null
  link_deps "$wt"
  echo "$wt"
}

# Does this worktree hold work that would be LOST if we reset it?
#   * uncommitted changes, or
#   * commits that exist on NO remote branch (unpushed)
# Commits that are already pushed (the normal state right after pr_submit.sh — the branch is ahead of
# main because that IS the PR) are safe to reset and must NOT count, or every worker's release jams.
wt_has_work () {
  local wt="$1"
  [ -e "$wt/.git" ] || return 1
  # Scope the dirty check to real port artifacts. A bare `status --porcelain` also reports the warm
  # tsgo cache (raw-port/.gate.tsbuildinfo) whenever the leased branch predates the .gitignore entry
  # for it — so release saw "live work", refused, and the slot LEAKED FOREVER (worker-02 had to
  # reset --hard by hand). A build cache is not work; src and re/ are.
  # EXCLUDE the regenerable disasm cache. raw-port/re/disasm/*.s is a gitignored, sub-second-
  # regenerable artifact — and running an oracle differential (exactly what the reviewer brief asks
  # for) deletes and rewrites those files. Counting them as "live work" made release refuse, so every
  # hand-leased reviewer worktree LEAKED its slot: the more reviewers did the highest-value work, the
  # faster the pool drifted back toward the POOL_FULL deadlock of #12. #258 force-released pr_gate's
  # lease but not a reviewer's. Real work is source; a cache is not.
  [ -n "$(git -C "$wt" status --porcelain -- raw-port/src 2>/dev/null)" ] && return 0
  [ -n "$(git -C "$wt" status --porcelain -- raw-port/re 2>/dev/null | grep -v ' raw-port/re/disasm/')" ] && return 0
  # HEAD reachable from some origin/* ref => pushed => nothing to lose.
  # ONLY MEANINGFUL ON A BRANCH. A reviewer's `acquire-at <SHA>` leaves a DETACHED HEAD at a PR head;
  # once that PR squash-merges and its branch is deleted, the commit stops being contained in any
  # remote branch — so this test called it "unpushed work" on a tree whose `git status` is empty, and
  # `release` refused. The slot then leaked, and it leaked HARDER THE BETTER REVIEWERS DID: every
  # successful merge stranded the worktree that verified it (three times in one shift, reported as
  # OPS_LOG #401; the same POOL_FULL endgame as #12). A detached HEAD holds no work by construction —
  # it is a checkout of a commit that already exists on the server. Only an unpushed BRANCH can.
  if git -C "$wt" symbolic-ref -q HEAD >/dev/null 2>&1; then
    if [ -n "$(git -C "$wt" rev-list -n1 origin/main..HEAD 2>/dev/null)" ]; then
      [ -z "$(git -C "$wt" branch -r --contains HEAD 2>/dev/null)" ] && return 0
    fi
  fi
  return 1
}

# atomically claim a free slot (mkdir lock). reclaims a lease older than WT_POOL_STALE min (agent died).
claim_slot () {
  local tag="$1"; local deadline=$(( $(date +%s) + WAIT )); local stale="${WT_POOL_STALE:-120}"
  # Disposable gate leases expire FAST. A pr_gate run takes ~1-2 min; if its lease is still held
  # after GATE_STALE_MIN the holder died before its cleanup trap ran (killed, crashed, context-cut).
  # #258 made those reclaimable-when-dirty, but only after the 120-min worker timeout — and a leak
  # fills all 16 slots in ~10 minutes, so the self-heal arrived two hours after the deadlock. A
  # worker's port/<Class> lease keeps the long timeout; only throwaway checkouts get the short one.
  local gate_stale="${GATE_STALE_MIN:-15}"
  while :; do
    for i in $(seq 1 "$NPOOL"); do
      local lk="$LEASES/$i"
      if mkdir "$lk" 2>/dev/null; then echo "$tag $(date +%s)" > "$lk/holder"; echo "$i"; return 0; fi
      # FAST PATH: a disposable gate lease older than gate_stale is a dead holder — take it.
      case "$(cat "$lk/holder" 2>/dev/null)" in
        gate/*)
          if [ -n "$(find "$lk/holder" -mmin +$gate_stale 2>/dev/null)" ]; then
            echo "$tag $(date +%s)" > "$lk/holder"
            log "wt_pool: reclaimed abandoned gate slot $i (>${gate_stale}min)"
            echo "$i"; return 0
          fi;;
      esac
      # reclaim stale lease — but NEVER steal a worktree that still holds live work. The stale
      # timeout (default 120min) is a guess about a dead agent, and it guessed wrong in production:
      # a reviewer reclaimed slot 2 while worker-04 was mid-edit and its in-progress file was wiped
      # ("Slot 2 was re-leased to a reviewer while I held it"). A long-running unit is not a dead
      # agent. If the tree is dirty or ahead of main, skip it and take a genuinely idle slot.
      if [ -n "$(find "$lk/holder" -mmin +$stale 2>/dev/null)" ]; then
        # A `gate/<sha>` lease is DISPOSABLE — pr_gate detaches at a PR head and deliberately dirties
        # the tree with trusted tools, so it has nothing to protect. Reclaim it even when dirty.
        # Without this, one leaking caller can fill all 16 slots and deadlock the whole swarm (it did:
        # every pr_gate run leaked until the pool was exhausted and gating/merging stopped dead).
        # A `port/<Class>` lease still gets the full protection — that is a worker's real work.
        case "$(cat "$lk/holder" 2>/dev/null)" in
          gate/*) echo "$tag $(date +%s)" > "$lk/holder"; log "wt_pool: reclaimed stale disposable gate slot $i"; echo "$i"; return 0;;
        esac
        if wt_has_work "$WTDIR/$i"; then
          # A DEAD AGENT'S WORK MUST NOT HOLD A SLOT FOREVER. This used to `continue`
          # unconditionally, so a lease whose holder died mid-unit — leaving a half-written .ts —
          # was NEVER reclaimed. Not "reclaimed late": never. Agents die routinely (context
          # exhaustion every 30-60 min; one executor restart killed all 16 at once and left four
          # such leases), so the pool bled slots permanently, and adding worktrees does not fix it —
          # they fill too, just more slowly.
          #
          # The protection is right: #240 added it after a reviewer's reclaim wiped a worker's
          # in-progress file. So do not choose between losing work and leaking the slot — RESCUE the
          # work, then take the slot. After ABANDON_MIN (default 3h, far past any real unit) the
          # diff and any unpushed commits are written to $POOL/rescue/ and the slot returns.
          abandon="${WT_POOL_ABANDON_MIN:-180}"
          if [ -z "$(find "$lk/holder" -mmin +$abandon 2>/dev/null)" ]; then
            log "wt_pool: slot $i lease is stale but the worktree has UNCOMMITTED/UNPUSHED work — not stealing it"
            continue
          fi
          mkdir -p "$POOL/rescue" 2>/dev/null
          rescue="$POOL/rescue/slot${i}-$(date +%Y%m%d-%H%M%S)"
          # `git add -N` FIRST: wt_has_work fires on an untracked file (`?? path`), but `git diff
          # HEAD` and `format-patch` both IGNORE untracked paths — so for the dominant case, a worker
          # that died having written a brand-new class .ts, the rescue wrote an EMPTY patch, logged
          # "rescued", and the caller's `git clean -fdq -- raw-port/src raw-port/re` then DELETED the
          # file. Strictly worse than the leak it replaced: before, the file survived on disk in the
          # pinned slot. `add -N` records the intent-to-add so the diff includes new files.
          # Caught by reviewer-01 (issue #379) — after I self-approved and merged #378 in 33 seconds.
          git -C "$WTDIR/$i" add -N -- raw-port/src raw-port/re 2>/dev/null
          git -C "$WTDIR/$i" diff HEAD > "$rescue.uncommitted.patch" 2>/dev/null
          git -C "$WTDIR/$i" format-patch origin/main --stdout > "$rescue.commits.patch" 2>/dev/null
          # Never claim a rescue that captured nothing — that is how the empty-patch lie happened.
          if [ ! -s "$rescue.uncommitted.patch" ] && [ ! -s "$rescue.commits.patch" ]; then
            rm -f "$rescue.uncommitted.patch" "$rescue.commits.patch" 2>/dev/null
            log "wt_pool: slot $i has work I could NOT capture — refusing to reclaim (nothing rescued)"
            continue
          fi
          log "wt_pool: slot $i ABANDONED >${abandon}min — rescued $(wc -c < "$rescue.uncommitted.patch" | tr -d ' ') bytes to $rescue.*.patch, reclaiming"
        fi
        echo "$tag $(date +%s)" > "$lk/holder"; log "wt_pool: reclaimed stale slot $i (clean)"; echo "$i"; return 0
      fi
    done
    [ "$(date +%s)" -ge "$deadline" ] && { log "POOL_FULL: no free slot after ${WAIT}s"; return 3; }
    sleep 3
  done
}

reset_clean () { # bring a worktree back to a pristine origin/main
  local wt="$1"
  # ABORT ANY IN-PROGRESS SEQUENCE FIRST. An interrupted `git rebase` / `merge` / `cherry-pick`
  # leaves .git/rebase-merge (etc.) behind, and `reset --hard` does NOT clear it: the next holder
  # acquires a slot that git still considers mid-rebase, and their commit lands on the stale state
  # the rebase had checked out. Reported live — a worker was handed back its own interrupted rebase
  # and committed onto it; the only tell was an empty `origin/main...HEAD` diff. Aborting is safe
  # here because release has already established the tree holds no work (or --force was given).
  for seq in rebase merge cherry-pick revert; do
    git -C "$wt" "$seq" --abort >/dev/null 2>&1 || true
  done
  # ...AND REMOVE WHAT --abort CANNOT. `--abort` fails on a PARTIAL sequence dir — the state left by
  # a rebase that was itself killed mid-write, which is exactly the accident being defended against:
  #     $ mkdir -p .git/rebase-merge && git rebase --abort
  #     warning: could not read '.git/rebase-merge/head-name': No such file or directory
  #     rebase-merge still present? YES
  # `wt_sequence_in_progress` then still says "mid-rebase", `cmd_acquire` refuses the slot with the
  # same exit code as POOL_FULL, nothing removes the directory and nothing says how — so the slot is
  # wedged for good and the next caller fails identically. Pool slots are the scarcest thing the
  # swarm has (#12 stopped gating by leaking them), and #240's standing rule is to prefer a
  # self-healing fallback over a refusal. Scoped to the four state paths git itself uses.
  local gitdir; gitdir="$(git -C "$wt" rev-parse --git-dir 2>/dev/null)" || gitdir=""
  if [ -n "$gitdir" ]; then
    case "$gitdir" in /*) ;; *) gitdir="$wt/$gitdir" ;; esac
    rm -rf "$gitdir/rebase-merge" "$gitdir/rebase-apply" 2>/dev/null || true
    rm -f  "$gitdir/MERGE_HEAD" "$gitdir/CHERRY_PICK_HEAD" "$gitdir/REVERT_HEAD" 2>/dev/null || true
  fi
  git -C "$wt" checkout -q --detach 2>/dev/null || true
  git -C "$wt" reset -q --hard origin/main 2>/dev/null || true
  git -C "$wt" clean -fdq -- raw-port/src raw-port/re 2>/dev/null || true
  # PURGE THE DISASM SCRATCH. re/disasm/*.s is gitignored, per-worktree, and never cleared — so a
  # leftover .s from the PREVIOUS holder decides the next PR's G5 verdict in this slot. Measured:
  # one PR gated `0 flags / SUCCESS` in a slot holding a stale .s for its symbol and
  # `1 flag / FAILURE` in a clean slot, same body. The blind-spot flag exists to say "no disassembly
  # here, a reviewer must re-derive"; residue silently switches it off, and the likeliest author of
  # that residue is the PR's own author. It regenerates in ~0.1s, so there is nothing to save.
  rm -f "$wt"/raw-port/re/disasm/*.s 2>/dev/null || true
}

wt_sequence_in_progress () { # <wt> : 0 if git considers this tree mid-rebase/merge/cherry-pick
  local g; g="$(git -C "$1" rev-parse --git-dir 2>/dev/null)" || return 1
  [ -d "$g/rebase-merge" ] || [ -d "$g/rebase-apply" ] || [ -f "$g/MERGE_HEAD" ] \
    || [ -f "$g/CHERRY_PICK_HEAD" ] || [ -f "$g/REVERT_HEAD" ]
}

cmd_init () {
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  local n="${1:-$NPOOL}"
  for i in $(seq 1 "$n"); do make_wt "$i" >/dev/null; log "  pool wt-$i ready"; done
  log "wt_pool: $n warm worktrees under $WTDIR"
}

cmd_acquire () { # <Class> — worker: cut/extend branch port/<Class>
  local cls="${1:?usage: wt_pool.sh acquire <Class>}"
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  local slot; slot="$(claim_slot "port/$cls")" || return 3
  local wt; wt="$(make_wt "$slot")"
  reset_clean "$wt"
  # Belt and braces: reset_clean aborts any interrupted sequence, but if one somehow survives we must
  # NOT hand the slot over — a tree git considers mid-rebase makes the next commit land on the state
  # the rebase checked out, not on the base the caller asked for.
  if wt_sequence_in_progress "$wt"; then
    log "wt_pool: slot $slot is STILL mid-rebase/merge after reset — refusing to hand it out"
    rm -rf "$LEASES/$slot" 2>/dev/null; return 3
  fi
  # SAME-CLASS STACKING: if origin/port/<Class> already exists AND is ahead of origin/main (an open
  # PR for this class that hasn't merged yet), base the new work ON THAT BRANCH so a second method for
  # the same class STACKS additively instead of a fresh main-based branch that force-push would clobber
  # (the FFPlayerHealthMeter collision, 2026-08-10). Otherwise cut fresh from origin/main.
  git -C "$CANON" fetch -q origin "refs/heads/port/$cls:refs/remotes/origin/port/$cls" 2>/dev/null || true
  local base="origin/main"
  if git -C "$wt" rev-parse --verify -q "origin/port/$cls" >/dev/null 2>&1; then
    # only reuse it if it's strictly ahead of main (has un-merged commits) — else a stale merged branch
    if [ -n "$(git -C "$wt" rev-list -n1 "origin/main..origin/port/$cls" 2>/dev/null)" ]; then
      # ...AND only if it still has an OPEN PR. A PR-less branch that is ahead of main is ABANDONED,
      # and its file can predate methods that have since landed on main — stacking on it silently
      # DELETES them. worker-01 hit exactly this (port/HGCVPixelBuffer, no PR, file older than the
      # landed ptr()/lock()) and dodged it by hand. 40 of 62 port/* branches were in that state.
      # If gh is unavailable/slow, the safe default is NOT to stack.
      if gh pr list --repo "${FCT_REPO:-vjeux/fcp-headless-transitions}" --head "port/$cls" \
           --state open --json number --jq '.[0].number' 2>/dev/null | grep -q '[0-9]'; then
        base="origin/port/$cls"
        log "wt_pool: port/$cls has an OPEN PR + is ahead of main -> STACKING on it (base=$base)"
      else
        log "wt_pool: port/$cls is ahead of main but has NO OPEN PR (abandoned) -> basing on origin/main"
        log "         (stacking on it could delete landed methods; use a distinct branch name to submit)"
      fi
    fi
  fi
  log "wt_pool: leased slot $slot -> $wt (port/$cls, base ${base#origin/})"
  # CHECKOUT MUST NOT FAIL SILENTLY. This used to be `checkout -q -B ... 2>/dev/null`, so when the
  # branch was already checked out in ANOTHER pool worktree git refused, the error was swallowed, and
  # the caller got a DETACHED HEAD while the log still claimed the branch. pr_submit.sh then died with
  # "Head ref must be a branch" (hit ~5x in one session across several workers).
  if ! co_err=$(git -C "$wt" checkout -q -B "port/$cls" "$base" 2>&1); then
    log "wt_pool: WARN checkout -B port/$cls failed: ${co_err:-unknown}"
    # Almost always: that branch is checked out in another slot. Give this caller its own branch so
    # it can still commit and push, instead of silently handing back a detached HEAD.
    local alt="port/${cls}__slot${slot}"
    if git -C "$wt" checkout -q -B "$alt" "$base" 2>/dev/null; then
      log "wt_pool: using distinct branch $alt for this slot (submit with: pr_submit.sh from this worktree)"
    else
      log "wt_pool: ERROR could not create a branch in $wt — releasing the lease"
      rm -rf "$LEASES/$slot" 2>/dev/null
      return 4
    fi
  fi
  # Verify we really are on a branch; never hand back a detached HEAD.
  local head; head="$(git -C "$wt" rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [ "$head" = "HEAD" ] || [ -z "$head" ]; then
    log "wt_pool: ERROR $wt is on a DETACHED HEAD after checkout — releasing the lease"
    rm -rf "$LEASES/$slot" 2>/dev/null
    return 4
  fi
  link_deps "$wt"
  echo "$wt"
}

cmd_acquire_at () { # <SHA> — reviewer: detached checkout at a PR head for gating
  local sha="${1:?usage: wt_pool.sh acquire-at <SHA>}"
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  local slot; slot="$(claim_slot "gate/$sha")" || return 3
  local wt; wt="$(make_wt "$slot")"
  log "wt_pool: leased slot $slot -> $wt (gate/${sha:0:12})"
  reset_clean "$wt"
  # ensure the sha is present, then detached-checkout it
  git -C "$wt" fetch -q "$CANON" "$sha" 2>/dev/null || git -C "$CANON" fetch -q origin 2>/dev/null || true
  git -C "$wt" checkout -q --detach "$sha" 2>/dev/null || { log "acquire-at: sha $sha not found"; cmd_release "$wt" >/dev/null 2>&1; return 4; }
  link_deps "$wt"
  echo "$wt"
}

cmd_release () {
  local wt="${1:?usage: wt_pool.sh release <path> [--force] [expected-tag]}"
  local force="${2:-}"
  local expect="${3:-}"
  local slot; slot="$(basename "$wt")"
  # OWNERSHIP GUARD. release used to reset_clean() unconditionally, so a caller releasing a path it
  # no longer owned would wipe the CURRENT holder's in-progress work. If the lease is gone, the slot
  # has already been freed/reclaimed and someone else may be using it — do not touch the tree.
  if [ ! -d "$LEASES/$slot" ]; then
    log "wt_pool: slot $slot has no active lease — NOT resetting $wt (another holder may own it now)"
    return 0
  fi
  # ...AND THE LEASE MUST STILL BE *YOURS*. "A lease exists" is not ownership: the slot may have been
  # released and RE-LEASED to someone else since you took it, and then this call resets THEIR tree.
  # That is #3 coming back through the --force door #258 opened. Observed 2026-08-11: worker 1 held
  # slot 2 as port/ROIStatIO__ROITestSet for ~80s when a reviewer's pr_gate cleanup trap — firing
  # late for a slot it no longer held — ran `release <wt> --force`. --force skips the has-work check,
  # so reset_clean() wiped the worker's just-written .ts (the gitignored re/disasm files survived,
  # which is the tell: this is a git reset, not an rm), and the rm -rf freed the lease, after which
  # the next gate immediately re-leased the slot. The worker saw its file vanish with a clean
  # `git status` and no error anywhere.
  # A caller that knows which tag it leased passes it here and gets refused when it no longer holds
  # it. Callers that pass nothing behave exactly as before, so this is additive.
  if [ -n "$expect" ]; then
    local holder_tag; holder_tag="$(cut -d" " -f1 "$LEASES/$slot/holder" 2>/dev/null)"
    if [ "$holder_tag" != "$expect" ]; then
      log "wt_pool: slot $slot is held by '$holder_tag', not '$expect' — NOT resetting $wt"
      log "         (a stale release from a previous holder; the current holder keeps its work)"
      return 0
    fi
  fi
  # Refuse to discard live work unless explicitly forced. A worker that abandons a unit should say so:
  #   wt_pool.sh release <path> --force [expected-tag]
  if [ "$force" != "--force" ] && wt_has_work "$wt"; then
    log "wt_pool: $wt has UNCOMMITTED or UNPUSHED work — not discarding it."
    log "         commit+push it (pr_submit.sh), or re-run with --force to abandon it deliberately."
    return 5
  fi
  reset_clean "$wt"
  rm -rf "$LEASES/$slot" 2>/dev/null
  log "released $wt"
}

cmd_gc () {
  for i in $(seq 1 "$NPOOL"); do
    local wt="$WTDIR/$i"; [ -e "$wt/.git" ] || continue
    [ -e "$LEASES/$i" ] && continue
    reset_clean "$wt"
  done
  log "wt_pool: idle worktrees refreshed to origin/main"
}

cmd_status () {
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  log "wt_pool: $NPOOL slots under $WTDIR (origin/main $(git -C "$CANON" rev-parse --short origin/main 2>/dev/null))"
  for i in $(seq 1 "$NPOOL"); do
    local wt="$WTDIR/$i"; local present="no"; [ -e "$wt/.git" ] && present="yes"
    if [ -e "$LEASES/$i/holder" ]; then
      log "  slot $i: LEASED  $(cat "$LEASES/$i/holder" 2>/dev/null)  (wt=$present)"
    else log "  slot $i: free  (wt=$present)"; fi
  done
}

case "${1:-}" in
  init)       shift; cmd_init "$@";;
  acquire)    shift; cmd_acquire "$@";;
  acquire-at) shift; cmd_acquire_at "$@";;
  release)    shift; cmd_release "$@";;
  gc)         cmd_gc;;
  status)     cmd_status;;
  *) echo "usage: wt_pool.sh {init [N]|acquire <Class>|acquire-at <SHA>|release <path>|gc|status}" >&2; exit 1;;
esac
