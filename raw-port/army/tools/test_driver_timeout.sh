#!/bin/bash
# test_driver_timeout.sh — LOCKED test for "a driver that does not terminate is a mutant that was
# killed".
#
# THE INCIDENT (2026-08-11). Two `tsx` driver processes were found at ~98% CPU, one of them 2h31m
# old — 66 CPU-minutes. Both were mutants of `OZChannelBase::isDescendantOf`:
#
#     for (;;) {
#       // MUTANT: compare before the load
#       if (false) cur = cur.__parent_folder_at_0x30 as OZChannelBase | null;
#       if ((cur as unknown) === (folder as unknown)) break;
#       if (cur === null) break;
#     }
#
# Disabling the pointer advance makes the loop compare the same `cur` forever, so neither `break`
# can fire. That is CORRECT for a mutant — a mutant is supposed to fail. The harness was wrong:
# "fail" had been read as *returns a wrong answer*, never as *never returns*. Measured across the
# repo at the time: **69 of 69** driver-spawning subprocess calls passed no timeout. The parent
# blocked forever, the agent that started it finished its shift, and the orphan outlived it.
#
# At the peak these two, plus two wedged crash reporters, were four cores of pure waste on a
# ten-core box — and the load was first blamed on the swarm doing real work.
#
# Offline: a real `node` on a two-line fixture, no network, nothing from the repo's own corpus.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
# ABSOLUTE. The probes below `cd` into a tempdir, so a relative path handed in on argv resolves to
# nothing there and `import oracle_driver` fails — which the first run of this suite scored as three
# ordinary FAILs plus two spurious PASSes (the process-group and mutation cases "passed" because
# nothing had run). A harness that cannot load its subject has not measured it.
_abs () { # <path> -> absolute, or the input unchanged when it does not exist
  ( cd "$1" 2>/dev/null && pwd ) || printf '%s' "$1"
}
ORACLE_DIR="$(_abs "${1:-$HERE/../../re/oracle}")"
ROOT="$(_abs "${2:-$HERE/../..}")"
R="$(mktemp -d)"; trap 'rm -rf "$R"' EXIT
fails=0
ok ()  { echo "  OK    $1"; }
bad () { echo "  FAIL  $1"; [ -n "${2:-}" ] && echo "        $2"; fails=$((fails+1)); }

if ! command -v node >/dev/null 2>&1; then
  echo "test_driver_timeout: INCOMPLETE — node is not on PATH, so the bound cannot be exercised."
  echo "  (A skip that prints like a pass is the failure this suite's siblings were rejected for.)"
  exit 1
fi

printf 'for (;;) { /* the mutant that never terminates */ }\n' > "$R/hang.ts"
printf 'console.log(JSON.stringify({ok:true}));\n'             > "$R/quick.mts"

# ── 1-4. The helper bounds a hang, reaps it, and calls it a kill ────────────────────────────────
HELPER="$ORACLE_DIR/oracle_driver.py"
if [ ! -f "$HELPER" ]; then
  bad "oracle_driver.py not found at $HELPER"
else
  out="$(cd "$R" && python3 - "$ORACLE_DIR" <<'PY' 2>&1
import sys, time
sys.path.insert(0, sys.argv[1])
from oracle_driver import run_driver, score_mutant
t0 = time.time()
r = run_driver(["node", "--experimental-strip-types", "hang.ts"], timeout=5)
print("HANG", r.timed_out, r.returncode, round(time.time() - t0, 1), score_mutant(r, "M3: ")[0])
r2 = run_driver(["node", "--experimental-strip-types", "quick.mts"], timeout=30)
print("GOOD", r2.timed_out, r2.returncode, r2.stdout.strip(), score_mutant(r2)[0])
PY
)"
  hang="$(printf '%s' "$out" | grep '^HANG' || true)"
  good="$(printf '%s' "$out" | grep '^GOOD' || true)"

  # DID THE PROBE RUN AT ALL? An import error produces no HANG/GOOD line, and every case below then
  # reports on nothing — three FAILs that name the wrong cause, and two PASSes for work that never
  # happened. Stop here instead: "could not run" is a different answer from "ran and was wrong".
  if [ -z "$hang" ] || [ -z "$good" ]; then
    bad "the probe did not run — oracle_driver could not be imported from $ORACLE_DIR" \
        "$(printf '%s' "$out" | tail -2)"
    echo; echo "test_driver_timeout: FAIL ($fails)  — INCOMPLETE, cases 1-6 did not execute"
    exit 1
  fi

  case "$hang" in
    "HANG True 124 "*) ok "a non-terminating driver is bounded and reported, not waited on";;
    *) bad "a non-terminating driver was not bounded" "$out";;
  esac
  # It must return at the bound, not at some multiple of it — a bound that overshoots by minutes is
  # most of the original problem.
  secs="$(printf '%s' "$hang" | awk '{print $4}')"
  if [ -n "$secs" ] && [ "$(printf '%.0f' "$secs" 2>/dev/null || echo 99)" -le 8 ]; then
    ok "...and it returns AT the bound (${secs}s for a 5s timeout)"
  else
    bad "...and it returns AT the bound" "took ${secs:-?}s for a 5s timeout"
  fi
  printf '%s' "$hang" | grep -q "True$" \
    && ok "...and a hang SCORES AS A KILL (the rule this encodes)" \
    || bad "...and a hang SCORES AS A KILL" "$hang"

  # 2. TEETH: a healthy driver must still run and must NOT be scored as a kill. Cases that only
  #    assert refusals pass just as well against a helper that kills everything.
  case "$good" in
    'GOOD False 0 {"ok":true} False') ok "a healthy driver still runs, and is not scored as a kill";;
    *) bad "a healthy driver was broken by the bound" "$out";;
  esac

  # 3. THE GRANDCHILD. `subprocess.run(timeout=)` kills only the direct child, and tsx runs the real
  #    work in a grandchild — so a naive bound returns while the thing burning the CPU keeps going:
  #    the very orphan this fixes, arriving through the fix. Assert nothing survives.
  sleep 1
  if pgrep -f "$R/hang.ts" >/dev/null 2>&1; then
    bad "the bounded driver left a process behind — killpg is not reaching the whole group"
  else
    ok "the whole process group is reaped, no orphan survives"
  fi
fi

# ── 5. No checked-in harness may spawn a driver without a bound ─────────────────────────────────
unbounded="$(python3 - "$ROOT" <<'PY'
import glob, os, re, sys
root = sys.argv[1]
pat = re.compile(r'subprocess\.(run|check_output)\s*\(')
bad = []
files = set(glob.glob(os.path.join(root, "re/oracle/*.py")))
files |= set(glob.glob(os.path.join(root, "army/**/*.py"), recursive=True))
for f in sorted(files):
    s = open(f, errors="replace").read()
    for m in pat.finditer(s):
        d, k = 1, m.end()
        while k < len(s) and d:
            if s[k] == '(': d += 1
            elif s[k] == ')': d -= 1
            k += 1
        call = s[m.start():k]
        if re.search(r'node|tsx|npx|\.mts|driver', call) and 'timeout' not in call:
            bad.append(os.path.relpath(f, root))
print("\n".join(sorted(set(bad))))
PY
)"
if [ -n "$unbounded" ]; then
  bad "$(printf '%s' "$unbounded" | wc -l | tr -d ' ') harness(es) spawn a driver with no timeout" \
      "$(printf '%s' "$unbounded" | head -3 | tr '\n' ' ')"
else
  ok "every checked-in harness that spawns a driver passes a timeout"
fi

# ── 6. MUTATION. Drop the timeout from the helper's Popen path and case 1 must go red; otherwise
#      every assertion above could be passing because `node` happens to be fast today.
if [ -f "$HELPER" ]; then
  mkdir -p "$R/mut"; sed 's/timeout=t)/timeout=None)/' "$HELPER" > "$R/mut/oracle_driver.py"
  if ! grep -q "timeout=t)" "$HELPER"; then
    bad "could not build the mutant — case 6 proves nothing"
  else
    out="$(cd "$R" && timeout 20 python3 - "$R/mut" <<'PY' 2>&1
import sys
sys.path.insert(0, sys.argv[1])
from oracle_driver import run_driver
r = run_driver(["node", "--experimental-strip-types", "hang.ts"], timeout=5)
print("MUT", r.timed_out)
PY
)"; rc=$?
    pkill -f "$R/hang.ts" 2>/dev/null || true
    if [ "$rc" = 124 ] || ! printf '%s' "$out" | grep -q "MUT True"; then
      ok "mutation: without the bound the harness hangs (case 1 has teeth)"
    else
      bad "mutation: the unbounded helper still returned — case 1 pins nothing" "$out"
    fi
  fi
fi

echo
if [ "$fails" = 0 ]; then echo "test_driver_timeout: PASS"; else echo "test_driver_timeout: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
