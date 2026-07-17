# Faithful oracle — hardening audit + design (2026-07-17)

vjeux mandate: "harden this approach, we're going to use it to drive the work for the next
few months — invest in ways it's going to fail NOW." This is the record of that hardening.

## The harness was NON-FUNCTIONAL and would have driven months of garbage. Fixed.
Root-caused defects (all fixed, commits 76d9112 / 4d6b56d / b0f398c):

- **re-exec never fired** — driver gated on `realpath(sys.executable)`, but venv-python and
  base Homebrew-python share ONE realpath, and dyld STRIPS DYLD_* when bash launches the
  adhoc-signed python directly (yet `os.environ` still SHOWS the value). So it ran under base
  python -> `No module named objc` on EVERY render -> PAEColorize falsely DIVERGED
  worst_db=-1.0 with a filed todo. Fix: unconditional single bootstrap gated only by the
  private sentinel `_FCT_FAITHFUL_REEXEC`.
- **schema.extract crashed** — called `mutate.find_filter_elem` / `mutate.leaf_scalar_params`
  which didn't exist. Promoted to canonical public helpers.
- **locator was filter-only** — PAEColorSolid / PAENoise / PAECloudsV2 are generator
  `<scenenode>`s, silently missed. New `find_primitive_elem` handles filter AND generator;
  byte-span uses the actual enclosing tag, not a hardcoded `</filter>`.
- **catalog wrong** — `PAECloudsV` (real plugin is `PAECloudsV2`); dead `engine_module`
  paths. Rebuilt from ground truth (real plugin_name, node_type, all hosts) for all 20.

## The metric: DELTA RESPONSE (not absolute PSNR)
`ddb = PSNR(oracle(θ)-oracle(θ0), engine(θ)-engine(θ0))`. Constant background pipeline error
(masks/retime/compositor/JPEG-vs-PNG source offset) CANCELS in the delta, so ddb isolates the
FILTER's parameter response even inside a full transition. Ungameable: no-op params, overfit-
to-θ0, and wrong math all score LOW; only faithful P(θ) scores HIGH. CALIBRATED, not guessed:
both engines are perfectly deterministic (99 dB), identity-delta noise floor = 99 dB
(measured), so pass_db=40 flags only real divergence.

## Two orthogonal anti-overfitting levers
1. DELTA metric (above) — catches params the engine ignores / gets wrong.
2. STRUCTURAL VARIATION — sweep each primitive across ALL its hosts (Colorize=7, Levels=5,…).
   A scene-signature discriminator won't fire on the other hosts, so a faithful engine passes
   everywhere while an overfit one diverges on the others. Proven: PAEColorize's worst (9.0)
   came from finding divergence a SINGLE host hid (single-host authored was 14.9 dB).

## Trust discipline — the selftest GATES every verdict (T1..T5)
sweep_one runs selftest FIRST; records NOTHING if the harness is broken (HARNESS_BROKEN).
- T1 round-trip identity (mutator+mirror don't perturb the scene)
- T2 mutation is real (FCP receives the mutation)
- T3 determinism (>=90 dB; every delta is real signal)
- T4 delta-self sanity (oracle response has signal AND delta-vs-itself ~99 dB)
- T5 NEGATIVE CONTROL (a deliberately-biased engine drops below pass_db — PROVES the gate can
  actually catch divergence, not just pass everything).

## Throughput
Persistent stdin-loop engine worker (`engine/test/_fct_render_motr_worker.ts`) replaces ~2s
tsx cold-start per render (~640 renders/primitive on the 7-host Colorize) with ONE boot ->
~10x faster; crash-isolated with transparent respawn (observed mid-run, no churn). Verified
identical results to the one-shot path.

## TIME COVERAGE — the false-negative that was hiding real divergence
A sparse 2-time default (0.35, 0.65) produced FALSE NO_SIGNAL verdicts. A filter's effect is
often TIME-LOCALIZED:
  PAEBloom : inert at 0.35/0.65 but max_oracle_signal=114 at 0.1/0.9 -> HID ddb 7.0 divergence
  PAEGlow  : same -> HID ddb 13.5 divergence
Fixed: default times -> (0.1, 0.25, 0.5, 0.75, 0.9). The report now carries
`max_oracle_signal` so NO_SIGNAL is actionable (>floor = widen times; ~0 everywhere = occluded
-> synthetic scene).

## First full 20-primitive worklist (5-time sweep supersedes the 2-time run 4d6b56d)
15 DIVERGED, mostly the color/level filters worst (Levels 7.2, HSV 7.3, ChannelMixer 8.1,
ColorSolid 8.8, Brightness 9.0, Colorize 9.0), blurs closer to faithful (Gaussian 31.5,
Directional 26.6, Radial 21.5). PAEColorize's worst is intensity=0 / mix=0 (low-intensity
blend). Auto-filed one swarm todo per DIVERGED primitive with exact (host,param,θ->ddb)
evidence. `python3 -m fct.faithful.driver status` is the live worklist.

## KNOWN REMAINING GAP -> next hardening task: SYNTHETIC SINGLE-FILTER SCENES
PAETint / PAENoise / PAEBadTV have `max_oracle_signal==0` at ALL times in their ONLY host —
the filter is present but its output never reaches the composited frame (occluded layer /
masked media / discarded branch). They CANNOT be verified through the embedded host. The
README's original design is the fix: generate a minimal .motr with ONE image + the ONE target
filter, so its response always drives the output. Grafting a filter block into another host's
scene did NOT work (position/layer-dependent), so the synthetic scene must be built from a
known-good minimal scaffold (a 1-image, 1-filter template the oracle accepts), with the
resource-relative-path + byte-preserving-DOCTYPE constraints the mirror-dir render already
handles. This is tracked; until then those 3 primitives are honestly UNVERIFIABLE, not
falsely VERIFIED — which is the correct, non-overfitting behavior.
