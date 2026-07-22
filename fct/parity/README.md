# fct/parity — FUNCTION-LEVEL subsystem parity (call the REAL FCP function directly)

## What this is

The single most exacting way to prove our from-scratch TypeScript engine is a **faithful
port of FCP's Motion engine**: for one function at a time, call **Apple's actual compiled
function** out of FCP's own frameworks — via `dlsym` into `ProCore` / `ProChannel` /
`Helium` / `Lithium` — feed it and our TypeScript port the **same input vectors**, and
compare their **exact numeric output**.

A function is `VERIFIED` only when our port matches Apple's across its whole meaningful
input domain (default tolerance 1e-6 abs *or* rel). This is **not** PSNR on a rendered
frame — it is `f_ours(x) == f_apple(x)` for the real `f`.

```
$ ./fct.sh parity status
PARITY — 3 functions | VERIFIED 3  DIVERGED 0  NO_SYMBOL 0  UNTESTED 0 | tol_abs=1e-06 tol_rel=1e-06
  ID                       SUBSYS     STATUS    max_abs_err  n
  PCMath_easeInOut         curves     VERIFIED  0.00e+00     201
  OZBezierEval             curves     VERIFIED  3.20e-14     166
  OZBezierFindParameter    curves     VERIFIED  4.29e-10     135
```

## Why this is the right foundation (vs. what already exists)

The repo already has two oracles, both of which measure **whole frames**:
- **`fct score`** — engine vs the GUI ground-truth capture (the acceptance test).
- **`fct/faithful/`** — per-primitive **delta-response PSNR**: render a whole primitive
  through the full pipeline, fuzz its params, compare how the rendered frame *moves*.

Both are integration tests. When a full transition scores low, the cause could be *any* of
parser → evaluator → compositor → timemap → color, and a single bug anywhere pins the
score. That is exactly the "flat 14.6 dB local optimum" the ROADMAP warns about.

`fct parity` is the **inverse**: it isolates ONE function and asks *"is our port of this
exact function bit-for-bit Apple's?"* — with **Apple's own binary as the oracle**, no
rendering, no color space, no capture artifacts, no pipeline coupling. If every function a
subsystem is built from is `VERIFIED` at the numeric level, then any residual whole-frame
gap is provably NOT in that subsystem's math — it's in wiring/order/state, which is a
different (and far smaller) search.

This is what "faithful port with every subsystem decompiled and tested against the real
subsystem" means, taken literally.

## The breakthrough that makes it possible (proven 2026-07-22)

FCP's pure-math frameworks **export their C++ symbols** (`nm` shows `T`, not `t`) and
**dlopen cleanly on their own** — no Ozone engine boot, no GL context, no
`DYLD_FRAMEWORK_PATH`, no venv/pyobjc. So calling one function is *cheap* (milliseconds,
not the ~1.3s engine cold-boot). Verified end-to-end that:

| Real FCP function | Framework | Our port | Result |
|---|---|---|---|
| `PCMath::easeInOut` | ProCore | `curves.ts:easeInOut` | **0.0 error** (exact) |
| `OZBezierEval` | ProChannel | `curves.ts:cubicBezier` | 3.2e-14 |
| `OZBezierFindParameter` | ProChannel | `curves.ts:solveBezierParam` | 4.3e-10 |
| `HGLinearFilter::gaussian` | Helium | (blur kernel) | exact PDF |
| `HGDefinition::CIToHGBlurRadius` | Helium | (blur radius map) | exact (×3) |
| `PCMath::cubic` | ProCore | (cubic root solver) | exact roots |

Constraint: only **exported** symbols are callable. A local symbol (`nm` lowercase `t`,
e.g. `PCMath::erf`) is inlined/hidden and can't be `dlsym`'d — for those, verify the
callers that *are* exported, or fall back to `fct/faithful/` frame-level.

## How it works

```
registry.json ── declares each function: framework + mangled symbol + typed signature
      │                                    + the TS `fn` id its port is exposed under
      ▼
cases.py ─────── deterministic input-vector generators per function (whole domain:
      │          endpoints, interior, edge/degenerate — seeded, reproducible)
      ▼
driver.py ────── for each function: selftest gate → call oracle.py (REAL FCP) and
      │          bridge.py (TS port) on every case → record max abs/rel error →
      │          VERIFIED / DIVERGED / NO_SYMBOL → state.json + reports/<id>.json
      ├── oracle.py .... ctypes dlsym into FCP frameworks; marshals the typed ABI
      │                  (arm64: doubles in d-regs, out-params by pointer, arrays by
      │                  pointer). Resolves inter-framework @rpath deps automatically so
      │                  load order never matters.
      └── bridge.py .... boots ONE persistent `tsx test/_parity_worker.ts` and serves
                         many function evals over stdin (amortizes node cold-start).
                         The worker's FUNCTIONS table maps each `fn` id to a THIN wrapper
                         around the ACTUAL engine source (imported from ../src) — never a
                         re-implementation. That's the whole point: we test the real port.
```

**Everything is on disk** (`registry.json` + `state.json` + `reports/`). A fresh agent
with zero context runs `./fct.sh parity status` and sees exactly what's verified, diverged,
and next. Idempotent and resumable across compaction — same design as `fct/faithful/`.

## The trust gate (a broken harness must never drive a verdict)

`driver sweep` runs `selftest.py` (S1..S4) FIRST and refuses to record any verdict if it
fails (`HARNESS_BROKEN`):
- **S1 ORACLE LOADS** — an FCP framework dlopens and a known symbol returns a known value.
- **S2 TS WORKER LIVE** — the tsx worker boots and answers a known call.
- **S3 NEGATIVE CONTROL** — a deliberately wrong value IS flagged as divergence (proves the
  gate can actually fail, not just pass everything).
- **S4 DETERMINISM** — the oracle returns identical values on a repeat call (premise of an
  exact-equality gate).

## Usage

```bash
./fct.sh parity status              # verdict table + what's next
./fct.sh parity selftest            # run the S1..S4 trust gate
./fct.sh parity sweep --all         # (re)sweep every function
./fct.sh parity sweep OZBezierEval  # re-verify one (e.g. after a fix)
./fct.sh parity step                # sweep the next non-VERIFIED function
./fct.sh parity reset [ID]          # mark UNTESTED (all if no id)
```

## Adding a function (the loop for the long journey)

The journey is: **enumerate every function each subsystem is built from, port it, and
`VERIFY` it here.** To add one:

1. **Find the real symbol.** `nm -arch arm64 "<FCP.framework>/.../<Bin>" | grep -i <name>`.
   It must be exported (`T`). The mangled name is the `symbol` field (leading `__Z...`).
   The RE docs already name most of them: `docs/types/CONSTRUCTS.md`,
   `docs/filters/*`, `tools/re/*_binding.json`, and the disasm embedded in the engine
   source comments.
2. **Decode the signature** from the disasm / itanium demangling. Fill `signature.args`
   (`in` scalar / `in_array` / `out` / `out_array`, each with its `ctype`) and `ret`.
3. **Expose the TS port** in `engine/test/_parity_worker.ts` `FUNCTIONS` as a THIN wrapper
   that calls the real `../src` function (export it from its module if needed — that's a
   behavior-neutral change). Return the same named outputs `compare_outputs` lists.
4. **Write a case generator** in `cases.py` covering the whole faithful input domain, and
   point the registry entry's `cases` at `grid:<name>`.
5. `./fct.sh parity sweep <ID>`. Iterate until VERIFIED — and when it DIVERGES, first ask
   whether the *wrapper's contract model* is wrong (that's what caught the easeInOut
   `t∈[v0,v1]` remap) before touching engine code. Decode-don't-fit (ROADMAP Rule 7).

## Rules (inherited from the ROADMAP, specialized here)

- **The oracle is Apple's binary, not prose.** A registry signature must come from the
  disasm/demangle, never a guess. A wrong signature marshals garbage and reads a false
  DIVERGED — suspect the signature before the engine.
- **Test the FAITHFUL input domain.** Don't fit the engine to an FCP artifact on an input
  Motion never produces (see the `OZBezierFindParameter` degenerate `[0,0,1,1]` finding in
  `reports/`). Characterize such quirks in the report; revisit only if a decode proves the
  input is real.
- **The TS wrapper calls the real source.** Never re-implement the function inside the
  worker — import and call `../src`. Otherwise you verify a copy, not the engine.
- **Only exported symbols.** Local/inlined symbols aren't callable; verify an exported
  caller or use `fct/faithful/` frame-level for those.

## Files

| file | role |
|---|---|
| `registry.json` | durable brain: every function, framework, mangled symbol, typed signature, TS `fn` id, status |
| `oracle.py`     | dlsym into FCP frameworks; marshal the arm64 ABI; call the real function |
| `bridge.py`     | persistent tsx worker client — evaluate the TS port |
| `cases.py`      | per-function input-vector generators (whole faithful domain, seeded) |
| `driver.py`     | resumable state machine (status / step / sweep / reset); trust-gated |
| `selftest.py`   | S1..S4 harness trust gate (oracle live / worker live / neg-control / determinism) |
| `state.json`    | append-only progress ledger (source of truth for "where are we") |
| `reports/`      | per-function divergence reports + characterized findings |
| `engine/test/_parity_worker.ts` | the TS half: `FUNCTIONS` table of thin wrappers over `../src` |
