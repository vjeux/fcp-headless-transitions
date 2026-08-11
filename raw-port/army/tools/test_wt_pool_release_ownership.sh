#!/bin/bash
# test_wt_pool_release_ownership.sh — LOCKED test for wt_pool release's OWNERSHIP guard.
#
# THE BUG THIS LOCKS OUT (worker 1, 2026-08-11): `cmd_release` checked only that a lease EXISTS,
# never that it is still YOURS. A `pr_gate` cleanup trap firing late — after a slow gate, a kill, or
# a context cut — called `release <wt> --force` on a slot that had since been re-leased to a WORKER,
# and `--force` skips the has-work check, so `reset_clean` deleted that worker's just-written port.
# The worker saw its file vanish with a clean `git status` and no error anywhere; the gitignored
# `re/disasm` files survived, which is the tell that this is a git reset rather than an rm.
# That is OPS_LOG #3 ("releasing a worktree destroyed someone else's work") returning through the
# `--force` door #258 opened for gate leases.
#
# The test runs against a FAKE pool: wt_pool derives its paths from $HOME, so pointing HOME at a
# temp dir keeps this away from the live 24-slot pool. (Do not test this by leasing real slots —
# the first draft of this test did, and briefly held two of them away from the running swarm.)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
POOL_SH="${1:-$HERE/wt_pool.sh}"
R="$(mktemp -d)"
trap 'rm -rf "$R"' EXIT
fails=0

setup () {                       # a fake pool: one lease held by port/TestOwner, one git worktree
  rm -rf "$R/.fct-pool"
  mkdir -p "$R/.fct-pool/leases/7" "$R/.fct-pool/wt/7/raw-port/src/render"
  (
    cd "$R/.fct-pool/wt/7"
    git init -q .
    git config user.email t@t; git config user.name t
    echo base > raw-port/src/render/Base.ts
    git add -A; git commit -qm base
    git update-ref refs/remotes/origin/main HEAD
  ) >/dev/null 2>&1
  echo "port/TestOwner $(date +%s)" > "$R/.fct-pool/leases/7/holder"
  echo "// the CURRENT holder's uncommitted work" > "$R/.fct-pool/wt/7/raw-port/src/render/InProgress.ts"
}

check () {                       # check <want-survive|want-gone> <label>
  local want="$1" label="$2" got
  if [ -f "$R/.fct-pool/wt/7/raw-port/src/render/InProgress.ts" ]; then got="survive"; else got="gone"; fi
  if [ "$got" = "$want" ]; then
    echo "  OK    $label (work $got)"
  else
    echo "  FAIL  $label (work $got, wanted $want)"; fails=$((fails+1))
  fi
}

# 1. THE REGRESSION: a stale --force release naming a tag the slot no longer holds must be REFUSED.
setup
HOME="$R" bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force "gate/deadbeefdeadbeef" >/dev/null 2>&1
check survive "stale --force release from a previous holder is refused"
[ -d "$R/.fct-pool/leases/7" ] && echo "  OK    the current holder's lease is left in place" \
  || { echo "  FAIL  the stale release freed someone else's lease"; fails=$((fails+1)); }

# 2. TEETH: the real holder can still force-release its own slot (a worker abandoning a unit).
setup
HOME="$R" bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force "port/TestOwner" >/dev/null 2>&1
check gone "the real holder's own-tag --force release still resets the tree"

# 3. BACKWARD COMPATIBILITY: callers that pass no tag behave exactly as before.
setup
HOME="$R" bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force >/dev/null 2>&1
check gone "an untagged --force release is unchanged"

# 4. The pre-existing guard must still hold: no lease at all -> do not touch the tree.
setup
rm -rf "$R/.fct-pool/leases/7"
HOME="$R" bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force "port/TestOwner" >/dev/null 2>&1
check survive "an unleased slot is never reset (the #3 guard)"

echo
if [ "$fails" = 0 ]; then echo "test_wt_pool_release_ownership: PASS"; else
  echo "test_wt_pool_release_ownership: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
