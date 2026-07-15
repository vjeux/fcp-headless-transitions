# ROADMAP — full-engine reverse-engineering plan (rebuilt 2026-07-15)

This is the living plan and the ONLY tracking file. The previous ROADMAP grew to 3,841
lines and — critically — was ORDERED by filter-completeness, so "work the next TODO
top-down" kept steering every tick into low-leverage filter documentation while the
engine mean sat FLAT at 14.59 dB for many ticks. That was a local optimum. This rebuild
re-orders the work by **measured dB leverage across the WHOLE engine** (parser →
evaluator → compositor → timemap), not by which filter is next in a list.

The full prior plan (all decoded-constant history, 171 progress entries, per-filter RE
notes) is preserved verbatim in `docs/notes/ROADMAP_ARCHIVE_2026-07-15.md`. Nothing was
lost; this file is the lean forward plan.

Every work item has a **Definition of Done (DoD)**, a **Verify** command, and a
**Status**. Update Status in the same commit that does the work.

---

## The rules (non-negotiable — these are why the last effort drifted)

1. **One truth.** Score ONLY against the GUI GT (`~/fct-gui-gt`, via `fct score`).
   NEVER compare a render to another render ("headless-vs-headless" was circular and
   produced false "at ceiling" verdicts — see `docs/notes/CEILING_DIAGNOSTIC_FAILURE.md`).
2. **The gate.** Every change must pass `fct regress <source>` (no slug drops >0.30 dB
   below the committed baseline) BEFORE it is committed. Re-render affected slugs with
   `fct gen engine <slug>` (or `--all`) first — the gate reads frames off disk. If a
   change you believe is behavior-neutral trips the gate, STOP and investigate (usually a
   stale-baseline/JPEG-encode mismatch — re-render + re-freeze; NEVER chase it as real,
   NEVER commit red).
3. **One change per commit**, small blast radius, independently revertible.
4. **Focused sub-agents OK, gate-verified before merge.** A well-scoped, gate-verifiable
   mechanical chunk may go to a sub-agent (own worktree `~/fct-swarm/worktrees/<id>`, own
   `FCT_FRAMES_DIR`+`FCT_LOCK`, symlinked node_modules/venv). The ORCHESTRATOR always
   re-verifies with the full GUI-GT gate on main before the change is trusted. No
   sub-agent's self-generated metric ("my repro hit 40 dB") authorizes a merge — the full
   `fct regress engine` (0 regressions) does. Do NOT spawn a pool that declares success
   against a self-generated score.
5. **Everything in the repo.** No `~/`-level scripts, notes, or scoreboards. `fct/` is the
   one toolkit; `docs/notes/` is the one knowledge store; this file is the one plan.
6. **Commit == push.** Work on `main`. A change is not "done" until it is committed, the
   gate is green, AND pushed to `origin/main` in the same step. No stray branches.
7. **Decode the scene graph BEFORE writing code (`fct census <slug>`).** Algorithm facts
   come from the FCP binary / `.motr` (use `tools/re/read_const.py`, fat-binary aware) —
   never from prose in this file, never from black-box render-diffing. GUI GT only ever
   CONFIRMS or REFUTES a decode; a refutation means "re-read the source," not "nudge a
   constant." Decode-don't-fit. If census contradicts a ROADMAP item, FIX THE ITEM first.
8. **BUILD THE SUBSYSTEM. Do not hide behind gate-neutral no-ops.** The unit of work is a
   WHOLE WORKING SUBSYSTEM built end-to-end until a TARGET SLUG MEASURABLY IMPROVES vs GUI
   GT. A documentation-only / byte-identical tick is progress ONLY when it is (a) a genuine
   premise-correcting decode that retires/rescopes a task, or (b) an explicitly-labelled
   intermediate step of a subsystem you WILL finish next tick. It is NOT acceptable as the
   habitual outcome. **Per-tick honesty check before committing:** "Does this move a real
   pixel toward GT on a real slug, or am I committing a no-op because it feels safe?"

9. **⚠️ ANTI-LOOP (added 2026-07-15, the reason for this rebuild).** Do NOT spend a tick
   on filter-parameter-space documentation while the low tail (geometry/panels/3D-fold)
   is untouched. The remaining dB is NOT in the filters — they are decoded and the sweep
   is 46/46. Work the **LEVERAGE TABLE** below top-down: pick the highest-deficit
   subsystem that is workable and BUILD until a target slug's dB goes up. If three
   consecutive ticks end gate-neutral, that is the drift alarm — switch to the single
   worst slug and force a minimizer repro (`fct minimize <slug>`) to find a concrete pixel
   bug rather than re-documenting a known ceiling.

## The gate, concretely

```
fct gen engine   --all        # populate ~/fct-frames/engine/ (after any engine change)
fct baseline engine           # freeze fct/baseline_engine.json (ONLY when an improvement is verified)
fct regress  engine           # after ANY change: exit 0 = safe, exit 1 = regression, DO NOT COMMIT
fct score <slug> --full       # true dB for a single slug (full-res); the gate itself uses 480×270
fct census <slug>             # decode the scene graph (node types / filters / links / generators)
fct minimize <slug>           # delta-debug to a node-level engine-vs-FCP repro in fct/minimized/<slug>/
```

Gate is fast (~0.34s/slug warm, ~22s for all 65) at 480×270 with an mtime-thumbnail cache;
downscaling preserves regression ranking. TOL = 0.30 dB absolute. Re-baseline ONLY
intentionally, when an improvement is verified and you want it protected.

---

## ⭐⭐ CAPABILITY CATALOG — unit-test every FCP primitive (NEW methodology, 2026-07-15)

**The problem this solves.** The 65 built-in transitions are 100+-node integration scenes;
a low score can't be attributed to one cause, so fixing a slug means getting many subsystems
right at once — the exact trap that produced the flat-14.6 local optimum. `fct minimize`
shrinks a FAILING slug REACTIVELY. This is the inverse and PROACTIVE: enumerate every atomic
thing FCP does, and for each build a MINIMAL synthetic scene that isolates exactly ONE feature,
verified against headless FCP. Engine UNIT TESTS, with real FCP as the per-primitive oracle.

**How it works (built this tick):**
- `tools/re/probe_scene.py` — builds a minimal synthetic `.motr` that injects ONE primitive
  (a Transform / Opacity / Blend Mode / Time-Remap / behavior / filter) onto Transition A of the
  clean Blurs/Directional skeleton (scene filter stripped), renders it through BOTH the real
  headless FCP engine (`ozengine`) AND the full TS pipeline (`_scene_render.ts`: parse→evaluate→
  composite), and compares. Generalises `filter_probe.py` from filters to ALL primitives.
- `engine/test/_scene_render.ts` — renders one frame of an ARBITRARY `.motr` path through the TS
  engine at an absolute scene time (the same `createBenchTransition` path the 65 slugs use, so a
  capability probe exercises the parser + evaluator + compositor, not just the filter registry).
- `tools/re/capabilities.json` — the CATALOG: one entry per capability {cap, family, inject, time,
  min_psnr, note}. Grows as primitives are enumerated.
- `fct caps [ids…] [--list]` — run the catalog; PASS/FAIL per capability. This is a DEV ORACLE
  (headless FCP is truth for a synthetic scene), NOT the GUI-GT gate — the 65 shipped slugs are
  still scored ONLY against `~/fct-gui-gt`.

**The build order (do these top-down; each closes ONE capability to PASS, then add the next):**
1. **baseline.identity** — A with identity transform must render == imageA in BOTH engines.
   FINDING this tick: headless matches A (mae 1.09) but TS diverges (mae 16.5), worst at the TOP
   rows (~140) — the TS **drop-zone conform/fit** differs from FCP on the bare skeleton (centre
   pixel is identical → it's edge/framing, not colour). CLOSE THIS FIRST; it is the harness floor
   and likely a hidden baseline error under many slugs.
2. **transform.position.x / .y** — WORKING (both engines apply; ~19 dB residual = the same
   conform floor from #1, not a translate bug). Re-verify once #1 is closed.
3. **transform.scale / .rotation** — SCHEMA TODO: injected Scale id=103 / Rotation id=102 under
   Properties>Transform did NOT apply in headless (hvi~0.9). Decode a real Movements/Scale (uses
   Scale id=105) + Movements/Rotate encoding, fix the injector, then close.
4. Then enumerate the rest: opacity, blend modes, crop, anchor, shear, time-remap/speed/reverse,
   masks (rect/circle/bezier), behaviors (Fade/Ramp/Throw/Spin/Oscillate/Sequence-Replicator),
   replicator layout, camera/3D projection, generators. Each = one catalog entry + make it PASS.

**Why this breaks the loop:** a capability PASS is a small, attributable, gate-safe win. When a
primitive is verified in isolation, every transition that uses it improves for free, and a slug's
remaining error is now a COMPOSITION of known-good parts — debuggable. Prefer closing capabilities
over grinding whole slugs. (This complements the leverage table: capabilities are the *unit* of
engine correctness; the leverage table says which SLUGS the wins should target first.)

## Status snapshot (2026-07-15, rebuilt)

- **Engine mean: 14.59 dB** across 65 slugs (median 14.30). Distribution: 5 broken (<11),
  12 weak (11–13), 23 ok (13–15), 23 good (15–20), 2 great (≥20).
- **Phase 1 (reverse-engineer + document every filter): COMPLETE.** All 24 transition-filter
  UUIDs implemented + documented from the real FCP binaries; `tools/re/filter_sweep.py` =
  46 PASS / 0 FAIL across the param space. Structural subsystems (parser, evaluator, curves,
  behaviours, masks S8) are mature and gate-protected.
- **Phase 2 (match + verify): the frontier is now STRUCTURAL, not filters.** The dB deficit
  lives in geometry + compositing (see leverage table). The filter color gaps (Colorize=1,
  Tint, Brightness>1, Bloom) are real but small and all fold into S2 (linear chain).

## 🧪 CAPABILITY CATALOG — unit-test every FCP primitive one-by-one (new 2026-07-15)

The 65 transitions are 100+-node INTEGRATION scenes: a low score can't be blamed on one
cause, which is the exact trap that produced the filter-grind local optimum. The catalog
inverts `fct minimize` (which REACTIVELY shrinks a failing slug): it PROACTIVELY builds a
MINIMAL synthetic scene that isolates exactly ONE primitive, renders it through BOTH the
real headless FCP engine AND the full TS pipeline (parse->evaluate->composite), and compares.
Unit tests for the engine, with headless FCP as the per-primitive oracle.

- `tools/re/capabilities.json` — the catalog. One entry per atomic FCP capability:
  `{cap, family, inject:{kind,...}, time, min_psnr, note}`.
- `tools/re/probe_scene.py` — builds the synthetic .motr (skeleton + ONE injected primitive
  on Transition A, scene filter stripped), renders headless + TS, reports psnr/mae/hvi
  (headless-vs-input, so hvi~0 => FCP IGNORED the injection = a schema bug, not an engine bug).
- `engine/test/_scene_render.ts` — renders an arbitrary .motr through the TS engine at time t.
- `fct caps [ids...] [--list] [--keep]` — run the catalog (a DEV ORACLE; the GUI-GT gate is
  still the only merge bar for the 65 slugs).

**FIRST FINDINGS (2026-07-15, this is the harness working as designed):**
1. **Harness FLOOR bug** — even an IDENTITY scene (show image A) diverges: headless matches A
   (mae 1.09) but the TS engine diverges (mae 16.5), worst at the TOP rows (~140 mae; centre
   pixel is byte-identical). So the TS **drop-zone conform/fit** differs from FCP on the bare
   skeleton — a real engine gap under every transition, previously masked inside the integration
   scenes. **This is the first capability to close** (before per-primitive deltas are trustworthy).
2. **Schema TODOs** — transform Position X/Y DO apply in both engines (hvi 45/71); Scale/Rotation/
   Opacity injections were IGNORED by headless (hvi~0.9) => the drop-zone transform/opacity
   encoding needs decoding from a real slug (Scale appears as id=105 in Movements/Scale, Rotation
   id=109 in Flip — the ids/nesting vary). Marked `schema_todo` in the catalog.

**How to extend:** add a capability to capabilities.json, add its injector `kind` to
probe_scene.py (transform + opacity exist), decode the exact .motr schema from a real slug that
uses it (Rule 8 — `fct census`), then `fct caps <cap>` until it PASSES. Families to build out:
transform (position✓/scale/rotation/anchor/shear/crop), blend modes, opacity, time-remap/speed,
behaviours (Fade/Ramp/Throw/Oscillate/Spin/Link), masks, replicator layout, camera/3D, generators.

## ⭐ LEVERAGE TABLE — the work, ordered by measured dB deficit (do top-down)

Deficit = Σ max(0, 17 − score) over the slugs each subsystem OWNS (how much total dB sits
below a "good" 17 dB bar). This is the anti-loop ordering: **highest deficit first.**

| # | Subsystem (task) | slugs | mean | worst | deficit | status |
|---|---|---|---|---|---|---|
| **L1** | **S6-geom — replicator / clone-grid / framing-camera** | 8 | 13.00 | 10.24 | **32.0** | TODO |
| **L2** | **kinetic-panel coverage** (Lower/Close_and_Open/Up-Over/Panels/Loop) | 7 | 12.73 | 10.19 | **30.1** | TODO |
| **L3** | **3D-fold Movements** (Switch/Swing/Pinwheel/Reflection/Rotate/Flip/Fall/...) | 12 | 14.65 | 11.96 | **28.7** | TODO |
| **L4** | **S2/S4 — linear working-space chain + colour** (Bloom/Flash/LensFlare/Static) | 6 | 14.13 | 11.58 | **17.3** | TODO |
| **L5** | **S5 — gradient generator** (Slide_In/Center_Reveal/Light_Sweep) | 3 | 12.17 | 10.25 | **14.5** | TODO |
| **L6** | **group Image-Mask reveal** (Center/Heart/Squares) | 3 | 12.98 | 12.35 | **12.1** | TODO |
| **L7** | **S6-360 — equirect push/slide geometry** | 7 | 17.58 | 14.12 | **10.2** | TODO |
| **L8** | **S8 — procedural shape-mask write-on** (Diagonal pair, Wipes/Mask) | 3 | 13.75 | 13.47 | 9.8 | mostly SHIPPED |
| — | colour/xfade/blur/timemap residuals | 16 | — | — | <9 each | opportunistic (S7) |

**Rule-9 note:** L4's isolated filter math is DONE (decoded, sweep-verified). What remains
in L4 is the ENGINE-LEVEL linear chain (composite whole frame in float, encode once), NOT
more per-filter work — a per-filter linear encode is a proven dead-end (regresses stacked
transitions). Bloom-float is decoded but its temporal onset over-blooms (regresses both Bloom
slugs on the current tree, re-measured 2026-07-15) — gated OFF until the onset is decoded.

---

## Work items (detail)

### L1 — S6 replicator / clone-grid / framing-camera geometry  [TODO · HIGHEST LEVERAGE]
**Slugs:** Video_Wall (10.24), Clone_Spin (10.32), Combo_Spin (11.21), Multi (11.95),
Concentric (12.62), Vertigo (15.24), Duplicate (15.51), 3D_Rectangle (16.95).
**What it is:** these compose off-canvas tiles/clones through a framing camera (look-at pose)
and/or a replicator grid. Census: Video_Wall = 14 Replicators + Camera + framing; Clone_Spin =
11 Images + Camera; Multi = 6 Images + Rig; Concentric = 44 Clone Layers + 26 Image Masks.
The wall dolly currently frames ~1 tile where GT reveals the full grid; the framing-camera
pose (`compositor/geometry.ts` + `evaluator/framing.ts`, `FRAMING_VIEW_ENABLED`) is partial.
**DoD:** Video_Wall + Clone_Spin measurably up (target ≥13), 0 regressions.
**Verify:** `fct score Replicator-Clones__Video_Wall Replicator-Clones__Clone_Spin --full`.
**Start:** `fct census` + `fct minimize Replicator-Clones__Video_Wall` → fix the framed-wall pose.

### L2 — kinetic-panel coverage  [TODO]
**Slugs:** Lower (10.19 — already had a +1.15 fix, still worst), Close_and_Open (10.95),
Up-Over (11.75), Panels_Random (12.99), Panels_Across (13.11), Loop (12.92), Color_Panels (17.23).
**What it is:** replicator-driven panels that slide/close to COVER photo A then reveal B.
Close_and_Open = 107 Shapes + 107 Replicators + Image Mask + Clouds generator; at mid-transition
the engine shows full photo A where GT shows the closed panels occluding it. This is a
replicator-panel z-coverage + reveal-timing subsystem (`compositor/replicator.ts` + timemap).
**DoD:** Close_and_Open + Up-Over up (target ≥13), 0 regressions.
**Start:** `fct minimize Stylized__Close_and_Open` → find why panels don't occlude.

### L3 — 3D-fold Movements family  [TODO · shared subsystem, 12 slugs]
**Slugs:** Switch (11.96), Swing (12.89), Pinwheel (13.27), Reflection (13.67), Rotate (13.81),
Multi-flip (15.66), Flip (16.65), Fall (14.63), Drop_In (14.73), Scale (15.77), Push (17.59),
Clothesline (15.22). **Shared root (decoded, T-N3 archive):** a Rig-Behavior→Link swing-out
curve advances the photo's 3D fold too fast in the interpolation-timing subsystem. A correct
fix to the shared Rig/Link timing lifts the whole family — but MUST be gated against all 12 so
one doesn't regress another. **DoD:** ≥3 of the family up, 0 regressions across all 12.
**Start:** re-open `fct/minimized/Movements__Switch/` (repro already committed) → fix Rig/Link timing.

### L4 — S2 linear working-space chain + colour pipeline  [TODO · BIG, highest ceiling]
**Slugs:** 360°_Bloom (11.58), Lights_Bloom (13.04), Flash (13.94), Lens_Flare (13.83),
Static (15.32), Light_Noise (17.07). **What it is:** FCP keeps the WHOLE filter+blend chain in
`kCGColorSpaceLinearSRGB` and encodes to sRGB ONCE at readback; the engine encodes per-filter.
Infra exists (`compositor/linear.ts`, flag-gated). **DoD:** engine-level linear buffer through
every blit/blend/composite, encode once; flip ON family-by-family, gate all 65 after each.
**Risk:** HIGH — do incrementally, gate-green after each family, never commit red. A per-filter
linear encode is a PROVEN DEAD-END (regresses stacked transitions); build the whole-chain pass.
**Bloom-float sub-item:** decoded + register-verified but the threshold temporal onset over-blooms
(re-measured 2026-07-15: FCT_BLOOM_FLOAT ON regresses Lights_Bloom −1.0, 360°_Bloom −1.1). Stays
OFF until the onset curve is decoded — do NOT re-ship the flag without fixing onset.

### L5 — gradient generator  [TODO · coupled to masks]
**Slugs:** Slide_In (10.25), Center_Reveal (12.10), Light_Sweep (14.15). All 3 have a
`<mask>` sibling clipping the gradient — not a standalone generator. Census: Slide_In gradient
is a PAINT-STROKE emitter (NOT a fill); Center_Reveal has two Gradient fills + Gaussian + 2 Image
Masks + 6 colour Links. **DoD:** Slide_In up (target ≥12), 0 regressions. **Start:** `fct census`
to confirm the gradient TYPE per slug before writing a generator (Rule 7 — prior premise was wrong).

### L6 — group Image-Mask reveal  [TODO]  Center (12.35), Heart (13.49), Squares (13.11).
Group-level image mask on comp groups; 3D-rotated groups can't use screen-space mask
rasterization (guard skips them → unmasked). **Start:** `fct minimize Stylized__Center`.

### L7 — S6-360 equirect push/slide geometry  [TODO]  Push (14.28), Slide (14.97), Divide
(14.47), Wipe (14.12). The 360° "band" family shares an equirect push/crossfade geometry; the
low members show a smooth mid-transition U-dip (two panorama halves positioned differently than
GT — confirmed f12). Circle_Wipe (22.9) + Gaussian_Blur (23.6) are the good members.
**Start:** decode the equirect push offset in `compositor/transition360.ts` vs GT.

### S7 — residual per-slug bugs  [ONGOING · opportunistic]
Smear tail (11.75), Black_Hole, Color_Planes, Glide/Slide colour, Dissolves_Divide. Pick up
between big-subsystem ticks. My-notes heuristic: scan mid-band per-frame scores for a TAIL/HEAD
collapse — those are isolated time-authority (timemap wrap/clamp) bugs with clean structural fixes.

### FILTER-P2 leftovers  [LOW PRIORITY — do NOT let these dominate ticks (see Rule 9)]
T-M1 Tint hard-light G/B (CEILING — colour-space unpinned), T-M2 Levels two-stage (load-bearing,
deferred), T-M5 Colorize Intensity=1 (decoded mad 2.80, blocked on L4 linear chain), T-M8 Bevel
angle / Underwater black-render. All decoded + documented; they move only when L4 lands or a
specific slug needs them. NOT a source of tick work on their own.


---

## Reference — implemented subsystems (DONE; documented so nothing is undocumented)

These parts of the engine are complete and gate-protected. Listed so the ROADMAP is a full map
of what EXISTS, not only what's left.

**Filters (all reverse-engineered + registered in `compositor/filters/`, dispatched by UUID):**
Gaussian Blur, Directional Blur, Radial Blur, Zoom Blur (log-polar), Channel Mixer, Colorize,
Tint, Levels, Brightness, HSV Adjust / Hue-Saturation, Glow, Bloom, Fill, Luma Keyer (trapezoid
alpha), MinMax (separable erode/dilate morphology), Flop, Bevel, Bad TV, Black Hole, Earthquake,
Underwater, Scrape, Smear, PAENoise (Lights/Static), 360° Reorient. Each has a decoded-constant
comment citing the FCP binary it came from; verified via `tools/re/filter_sweep.py`
(`tools/re/filter_sweeps.json`, 46 PASS / 0 FAIL param-space cases).

**Behaviours evaluated (`evaluator/`):** Rig Behavior (widget snapshot select), Fade In/Fade Out,
Ramp, Align To, Oscillate, Spin, Throw, Sequence Replicator, Link (position/rotation/scale/anchor/
opacity — NOT colour, see S1).

**Compositing/geometry:** blend modes (normal/screen/add/overlay/lighten/multiply), Image Mask
reveal (rasterized shapes + replicator matte + mask-source-group filters e.g. Divide MinMax
dilation), replicator instance layout + sequence build, Clone Layer resolution, drop-zone
conform + native-then-resample for upscaled scenes, page-flip (PAEFlop), 360° full-frame panorama
model, framing camera pose (partial — see S6).

**Time authority (`timemap.ts` + `api.ts`):** single scene-time remap; retime-wrap (extrapolation
mode 1) with structural cancels (filled-shape / blended-media / replicator-matte / kinetic-panel /
filtered-mask reveals) and stroked-mask clamp; animationEndSec local-frame re-anchors
(camera/generator/panel negative-offset); media playback FORWARD by default.

**Parser (`parser/`):** `<enabled>0>` skips disabled filters; drop-zone Width/Height curve parse;
A/B binding by name with document-order override + both-masked suppression (Divide) + replicator-
mask-reveal binding (Squares/Duplicate); fade-direction A/B; footage clip media resolution.

**Toolkit (`fct/`) + CI:** `fct gen|score|regress|baseline|probe|gate`; GUI-GT one-truth gate at
480×270 with mtime-thumbnail cache; `tools/re/read_const.py` fat-binary constant reader;
`fit_color.py` derives the GAM constants; `test/no-hardcode.test.ts` fails any detector firing on
< 2 built-ins.

**Delta-debug minimizer (`fct minimize` + `fct min-*`):** shrinks a transition's `.motr` to the
MINIMAL node subtree where the TS engine still DIVERGES from the real FCP engine (headless), so a
fix targets the exact responsible nodes instead of a 17k-element scene. ddmin over structural nodes
(scenenode/layer/group/filter/behavior/mask), oracle = engine-vs-headless-FCP PSNR on the SAME
reduced `.motr` (headless IS the real Motion algorithm — this isolates where our CODE differs from
FCP's CODE; it does NOT replace the GUI-GT gate on the 65 shipped transitions). Two correctness
invariants: (1) trial motrs are written in a work dir that SYMLINKS the source's siblings so FCP +
the TS engine resolve bundled `Media/` textures relative to the `.motr` dir (a bare /tmp copy loses
them → false divergence); (2) headless renders go through a PERSISTENT worker (`fct
_headless-worker`) that boots the FCP Ozone engine ONCE and is reused across all trials, only
RESPAWNING when a malformed reduced doc SIGSEGVs it — so crash-isolation is preserved but the
~3.5s engine boot is paid ~once-per-crash instead of once-per-trial (measured ~1.7s first render
incl boot, then ~0.35s reused; the whole finalize dropped from ">12 min stuck" to ~30s). The
per-call isolated `fct _headless-frame` path is kept as a fallback.
Reduced cases live in `fct/minimized/<case>/` (case.motr + headless/ truth frames + manifest); the
`min-gen|min-score|min-baseline|min-regress` gate tracks engine-vs-FCP PSNR per case (99 dB = the
underlying engine bug is fixed). This is the new forcing function for the hard subsystems (S2/S3/S8):
minimize a low slug → fix its minimal repro → verify on the GUI-GT gate.

---

## Progress log  (newest first — one line per completed chunk)
- 2026-07-15t  🧪 CAPABILITY CATALOG harness built (answer to "implement FCP features one-by-one,
              like minimize in spirit"). New: tools/re/probe_scene.py (builds a minimal synthetic
              .motr isolating ONE primitive, renders headless-FCP + full TS pipeline, compares),
              engine/test/_scene_render.ts (render any .motr through the TS engine at time t),
              tools/re/capabilities.json (the catalog), and `fct caps`. Proven end-to-end: transform
              Position X/Y apply in BOTH engines. TWO real findings the harness surfaced immediately:
              (1) HARNESS FLOOR — an identity "show image A" scene diverges (headless mae 1.09 vs A,
              TS mae 16.5, worst at top rows ~140; centre pixel byte-identical) => TS drop-zone
              conform/fit differs from FCP under EVERY transition, previously masked in the 100-node
              integration scenes; this is the first capability to close. (2) SCHEMA TODOs — Scale/
              Rotation/Opacity injections were ignored by headless (hvi~0.9), the drop-zone transform/
              opacity encoding needs decoding from a real slug. Harness is a DEV ORACLE; GUI-GT gate
              unchanged (0 regressions, tools/test only). tsc clean.
- 2026-07-15t  ⭐ NEW METHODOLOGY: capability catalog (unit-test every FCP primitive vs headless FCP).
              Answering "build a listing of everything FCP does + a small testable implementation for
              each" — the inverse of `fct minimize`. Built `tools/re/probe_scene.py` (injects ONE
              primitive into a minimal synthetic .motr, renders headless-FCP vs the full TS pipeline,
              compares), `engine/test/_scene_render.ts` (render an arbitrary .motr through parse→eval→
              composite), `tools/re/capabilities.json` (the catalog), and wired `fct caps`. Proven
              end-to-end: transform.position.x/y APPLY in both engines. FINDING it immediately surfaced:
              the HARNESS FLOOR is only ~17.6 dB — an IDENTITY scene (show A) already diverges (headless
              mae 1.09 vs A, TS mae 16.5), worst at the TOP rows (~140), centre pixel identical ⇒ the TS
              DROP-ZONE CONFORM/fit differs from FCP on a bare skeleton. That is a hidden baseline error
              under many slugs and is now capability #1 to close. Scale/rotation injectors need the real
              id schema decoded (documented as schema_todo). Tools+test only; tsc clean; gate 0 regressions.
## Full pre-rebuild log (171 entries) archived in docs/notes/ROADMAP_ARCHIVE_2026-07-15.md

- 2026-07-15s  ⚙️ ROADMAP REBUILT to break the filter-grind local optimum. The old plan was ORDERED
              by filter-completeness, so "work the next TODO top-down" kept steering ticks into
              low-leverage FILTER-P2 documentation while the engine mean sat FLAT at 14.59 dB for
              ~15 ticks. Rebuilt around a MEASURED dB-leverage table (deficit-to-17 per owning
              subsystem): L1 replicator/clone geometry (deficit 32.0) > L2 kinetic panels (30.1) >
              L3 3D-fold Movements (28.7) > L4 linear-chain/colour (17.3) > … filters LAST (they own
              <9 deficit each and the sweep is 46/46). Added Rule 9 ANTI-LOOP: do not spend ticks on
              filter param-space docs while the geometry tail is untouched; three gate-neutral ticks
              in a row = drift alarm, switch to the worst slug + force a minimizer repro. Full prior
              plan (all decoded-constant history, 171 progress entries) preserved verbatim in
              docs/notes/ROADMAP_ARCHIVE_2026-07-15.md. No engine code changed — plan/docs only.
