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

# ── The tag guard above is OPT-IN, and no caller opts in ────────────────────────────────────────
# Measured on origin/main: rebase_pr.sh calls release in four places, pr_gate's cleanup trap calls
# it, DEP_WORKER_BRIEF and HARNESS_LOOP tell agents to call it — none of them passes an expect-tag.
# So cases 1-2 above pin a guard that, in production, could never fire: the pr_gate trap that wiped
# worker 1's slot passed no tag and would pass none today. Cases 5-9 pin the same protection keyed
# on FCT_AGENT_ID, which is stamped at claim time and needs nothing from the caller.

setup_owned () { # <owner> [holder-age-min]
  setup
  echo "$1" > "$R/.fct-pool/leases/7/owner"
  [ -n "${2:-}" ] && touch -t "$(date -v-"$2"M +%Y%m%d%H%M 2>/dev/null || date -d "$2 minutes ago" +%Y%m%d%H%M)" \
      "$R/.fct-pool/leases/7/holder"
  return 0
}

# 5. THE INCIDENT, WITH NO TAG PASSED: a peer's live slot must survive another agent's --force.
setup_owned worker-01
HOME="$R" FCT_AGENT_ID=reviewer-03 bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force >/dev/null 2>&1
check survive "another agent's --force release is refused with no tag passed"
[ -d "$R/.fct-pool/leases/7" ] && echo "  OK    the peer keeps its lease as well" \
  || { echo "  FAIL  the peer's lease was freed"; fails=$((fails+1)); }

# 6. TEETH: the owning agent can still abandon its own slot.
setup_owned worker-01
HOME="$R" FCT_AGENT_ID=worker-01 bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force >/dev/null 2>&1
check gone "the owning agent's own --force release still resets the tree"

# 7. NOT A ONE-WAY DOOR: a lease stale enough for claim_slot to reclaim is free for anyone to
#    release. Otherwise a dead agent's slot could never be recovered by hand and the pool walks into
#    the POOL_FULL deadlock of #12 — the failure this guard must not cause while preventing another.
setup_owned worker-01 300
HOME="$R" FCT_AGENT_ID=reviewer-03 bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force >/dev/null 2>&1
check gone "a stale (dead-holder) lease is releasable by anyone"

# 8. FAIL OPEN when the releaser has no identity — a cleanup path that cannot name itself must still
#    be able to free a slot, exactly as review_claim's self-review skip fails open.
setup_owned worker-01
HOME="$R" FCT_AGENT_ID= bash "$POOL_SH" release "$R/.fct-pool/wt/7" --force >/dev/null 2>&1
check gone "with FCT_AGENT_ID unset the release still works"

# 9. MUTATION. Cases 5-8 would pass just as happily against a release that never looks at the owner
#    file (5 is the only one that goes the other way), so strip the guard and require 5 to go red.
#    A guard nobody has watched fail is not evidence — the rule this suite exists to enforce.
MUT="$R/wt_pool_mutated.sh"
rm -f "$MUT"
python3 - "$POOL_SH" "$MUT" 2>/dev/null <<'EOF'
import re, sys
src = open(sys.argv[1]).read()
out = re.sub(r'  local owner; owner=.*?\n  fi\n', '', src, flags=re.S)
assert out != src, "mutation matched nothing"
open(sys.argv[2], "w").write(out)
EOF
if ! bash -n "$MUT" 2>/dev/null; then
  echo "  FAIL  mutation produced an unparseable script — case 9 proves nothing"; fails=$((fails+1))
else
  setup_owned worker-01
  HOME="$R" FCT_AGENT_ID=reviewer-03 bash "$MUT" release "$R/.fct-pool/wt/7" --force >/dev/null 2>&1
  if [ -f "$R/.fct-pool/wt/7/raw-port/src/render/InProgress.ts" ]; then
    echo "  FAIL  with the ownership guard REMOVED the peer's work still survived — cases 5-8 are"
    echo "        passing for some other reason and pin nothing"; fails=$((fails+1))
  else
    echo "  OK    mutation: removing the guard destroys the peer's work (case 5 has teeth)"
  fi
fi

# 10. Every lease write must go through stamp_holder, or a future claim path silently stops
#     recording an owner and the guard goes dormant one slot at a time. Code only, comments stripped
#     (a check that greps a file's own explanatory prose passes against the deleted line).
POOL_CODE="$(grep -v '^[[:space:]]*#' "$POOL_SH")"
if printf '%s' "$POOL_CODE" | grep -q '> "\$lk/holder"'; then
  echo "  FAIL  a lease is stamped without stamp_holder — that slot will record no owner"; fails=$((fails+1))
else
  echo "  OK    all lease stamps go through stamp_holder ($(printf '%s' "$POOL_CODE" | grep -c 'stamp_holder "\$lk"') site(s))"
fi

echo
if [ "$fails" = 0 ]; then echo "test_wt_pool_release_ownership: PASS"; else
  echo "test_wt_pool_release_ownership: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
