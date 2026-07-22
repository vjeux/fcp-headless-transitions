# fct/parity — NODE-BOUNDARY subsystem parity

## The boundary: one XML node → one computation

The unit of truth is **the `.motr` XML node**. One node + its params triggers exactly one
computation; we ISOLATE that computation and verify our TypeScript port is **faithful to
what REAL FCP computes** for the same node+params, across the node's parameter space.

```
   ONE .motr node + its params   →   ONE isolated computation
   verify:  TS_port(node, params)  ==  REAL_FCP(node, params)   ∀ params
```

This is deliberately **not**:
- a hand-picked C++ symbol (too low-level, detached from what the XML actually triggers), nor
- a whole-frame PSNR through the full pipeline (too coupled — a bug anywhere pins the score;
  the flat-14.6 dB local optimum the ROADMAP warns about).

It is the finest boundary at which "is this faithful?" is a well-posed, attributable question.

```
$ ./fct.sh parity status
PARITY (node-boundary) — 4 nodes | VERIFIED 3  DIVERGED 1  NO_SIGNAL 0  NO_ORACLE 0  UNTESTED 0
  NODE                             SUBSYS    KIND    STATUS     metric
  curve.interp.ease                curves    curve   VERIFIED   abs=0.0e+00
  curve.interp.bezier.eval         curves    curve   VERIFIED   abs=3.2e-14
  curve.interp.bezier.findparam    curves    curve   VERIFIED   abs=4.3e-10
  filter.PAEBrightness             filters   filter  DIVERGED   psnr=13.3
```

## Node kinds and how each computation is isolated

A node's computation has a type-specific signature. Each kind isolates it in REAL FCP (the
oracle) and in the TS engine (the port), then sweeps the node's params:

| Node kind (XML) | Computation | REAL FCP isolation | TS isolation | Metric |
|---|---|---|---|---|
| `curve` — a `<curve interp=N>` segment | (keyframes, t) → value | the exact FCP fn that segment triggers, called via **dlsym** (`easeInOut`, `OZBezierEval`, `OZBezierFindParameter`) | the engine's `curves.ts` port (via a tsx worker) | max abs/rel error — **exact** (value domain) |
| `filter` — `<filter pluginName=X>` | image, params → image | FAITHFUL delta-response in the node's REAL host — `delta_o=oracle(θ)−oracle(θ0)`, `delta_e=engine(θ)−engine(θ0)`, `ddb=PSNR(delta_o,delta_e)` (delegated to `fct/faithful`) | the registered filter's `.apply` | worst-case ddb over the sweep (signal-gated) |
| `generator` — a generator `<scenenode>` | params → image | inject + render | generator `.render` | PSNR (future) |
| `transform` — a layer `<transform>` | params → 4×4 matrix / placement | inject + render placement | `buildTransformMatrix` / `mat4*` | error — exact (future) |

The `curve` kind reuses the **dlsym oracle** (`oracle.py`): the value a keyframe segment
produces for a given interp type IS a single exported FCP function, so we verify it
bit-for-bit — parity's unique contribution. The `filter`/`generator` kinds **delegate to the
FAITHFUL delta-response** in `fct/faithful/` (the node's real-host param response), because a
static-source injection is UNFAITHFUL (a filter's response depends on its real input pipeline
— see `fct/faithful/synth.py`). So parity is the single NODE registry across all kinds, each
using the correct oracle; it does not re-implement a static image oracle.

## Why it's faithful AND ungameable
- The oracle is REAL FCP computing the SAME node the `.motr` declares — not a symbol we
  guessed maps to it. Match across the param space ⇒ faithful **by construction** at the
  boundary the engine actually consumes.
- We fuzz the node's OWN params, with no surrounding scene, so a scene-signature
  discriminator (`is*Curve`/`has*Family`/`matches*Stack`, ROADMAP Rule 13) can't help — there
  is no scene to key off.
- Isolation removes pipeline coupling: a divergence is attributable to THIS node's math.

## Signal gating
For `filter`/`generator` (image kinds), only score a param setting where FCP's output
actually **responded** (`headless_vs_input` above the identity floor). If the node was inert
at that setting (e.g. Brightness=1.0 is identity), there's nothing to verify — skip it
(`gated`). `NO_SIGNAL` = no param setting produced a scorable response.

## The `oracle_truth` caveat (color family)
Some nodes are COLOR-family (Brightness/Levels/Colorize/HSV…). For these, headless FCP has a
**measured 13–19 dB headless-vs-GUI-export gap** (GUI colour management on export), so a
headless-vs-TS divergence is NOT automatically an engine bug — the linear-working-space form
that matches HEADLESS can regress the GUI gate (the one truth, ROADMAP Rule 1). Such nodes
carry `oracle_truth: gui`; before "fixing" TS to match headless, confirm the change is
net-positive against the **GUI GT** (`fct score`). Geometric/kernel nodes (blur family) have
headless≈GUI, so their headless parity IS a faithful gate proxy (`oracle_truth: headless`).
See the per-node `reports/*.json` findings, and the same lesson in `fct/faithful/`.

## The trust gate
`driver sweep` runs `selftest.py` (S1..S4) before recording any `curve` verdict; a broken
harness never drives the work (`HARNESS_BROKEN`):
- S1 ORACLE LOADS · S2 TS WORKER LIVE · S3 NEGATIVE CONTROL (a wrong value IS flagged) ·
  S4 DETERMINISM. The `filter` kind additionally self-guards via the `identity_warning`
  (a node the host silently ignored is never trusted as a match).

Everything is on disk (`registry.json` + `state.json` + `reports/`) — a fresh
post-compaction agent runs `./fct.sh parity status` and resumes.

## Usage

```bash
./fct.sh parity status                       # verdict table + next
./fct.sh parity sweep --all                  # (re)sweep every node
./fct.sh parity sweep filter.PAEBrightness   # one node (e.g. after a fix)
./fct.sh parity step                         # sweep the next non-VERIFIED node
./fct.sh parity selftest                     # S1..S4 trust gate
./fct.sh parity reset [ID]                   # mark UNTESTED
```

## Adding a node (the long journey)

Enumerate every node kind each subsystem uses, port it, `VERIFY` it here.

**A curve/value node** (exact): the interp type maps to an exported FCP fn.
1. `nm -arch arm64 <ProCore|ProChannel>/… | grep -i <name>` — must be exported (`T`).
2. Add a registry `node` with `kind:"curve"`, its `oracle` (framework+symbol+signature) and
   `ts_fn` (exposed in `engine/test/_parity_worker.ts` as a thin wrapper over `../src`).
3. Add a case generator in `cases.py`. `./fct.sh parity sweep <id>`.

**A filter/generator node** (image→image, delegated):
1. Ensure the primitive exists in `fct/faithful/catalog.json` (real `plugin_name` + host
   slugs). If not, add it there first (that program already extracts its param schema from
   real hosts).
2. Add a registry `node` with `kind:"filter"` (or `"generator"`),
   `oracle:{type:"faithful_delta","faithful_id":"PAEX"}`, `faithful_id:"PAEX"`, and set
   `oracle_truth` (`gui` for color, `headless` for geometric/kernel).
3. `./fct.sh parity sweep <id>` runs the faithful delta-response and surfaces the ddb verdict.
   When it DIVERGES: first check the `oracle_truth` caveat; decode-don't-fit (ROADMAP Rule 7)
   — read the node's real math from the binary before touching engine code.

## Rules (from the ROADMAP, specialized)
- The oracle is REAL FCP computing the DECLARED node, not a guess.
- Behavior depends ONLY on node type + params (Rule 13) — no scene-signature dispatch.
- For color nodes, the GUI GT overrides the headless oracle (Rule 1); headless is a
  secondary signal.
- Everything on disk; commit each verified batch (Rule 6).

## Files

| file | role |
|---|---|
| `registry.json` | durable brain: every NODE (id, subsystem, kind, isolation, params, status) |
| `oracle.py`     | dlsym into FCP frameworks (the `curve`-kind oracle); marshals the arm64 ABI |
| `bridge.py`     | persistent `tsx _parity_worker.ts` — evaluate the TS curve/value port |
| `filter_node.py`| isolate one `filter` node vs REAL FCP (wraps `tools/re/filter_verify`) |
| `cases.py`      | per-node input generators (curve arg grids + filter param sweeps) |
| `driver.py`     | resumable state machine; dispatches by node kind; trust-gated |
| `selftest.py`   | S1..S4 harness trust gate |
| `state.json` + `reports/` | ledger + per-node reports & characterized findings |
| `DESIGN.md`     | the node-boundary design rationale |
| `engine/test/_parity_worker.ts` | TS curve/value ports (thin wrappers over `../src`) |
