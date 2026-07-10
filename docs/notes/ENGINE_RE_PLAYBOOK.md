# FCP Transition Agent Playbook
# Distilled from prior agents' transcripts by the retro loop. READ THIS FIRST — it exists
# so you don't waste time rediscovering what earlier agents already learned the hard way.
# The retro agent appends new entries; keep it tight and high-signal. Newest insights on top.

## ⚠️ TWO DIFFERENT POOLS — KNOW WHICH ONE YOU ARE (read this first)
# There are TWO codebases in play; most of this playbook below (tsc/engine/src/createBenchTransition/
# scoreboard.ts/node_modules-symlink/~/fct-gt-cache) is the OLD **TS-ENGINE PSNR pool**.
# The CURRENT g1..g8 pool is the **HEADLESS / GUI-MATCH pool** — a DIFFERENT target:
#   • Goal: make the HEADLESS renderer (oz_render.mm -> oz_render.dylib, driven by tools/ozengine.py +
#     tools/render_gt.py) pixel-match FCP's GUI reference frames in ~/fct-gui-gt/<slug>/frame_0000..0023.png.
#   • NO tsc, NO engine/src, NO node_modules, NO createBenchTransition. Build with `./build.sh` (rebuilds
#     the per-worktree oz_render.dylib; must exit 0). Guard = a 65-slug no-crash render stays 65/65.
#   • Score ONE slug (run FROM your worktree dir):
#       DYLD_FRAMEWORK_PATH="/Applications/Final Cut Pro.app/Contents/Frameworks" \
#         ~/random/final-cut-pro-transitions/venv/bin/python3 ~/fct-notes/score_slug.py <slug> [--frames]
#     (reads /tmp/slug_map.json for slug->motr; applies conform+A-return+sRGB->bt709 color; prints MEAN dB.)
#   • Color model applied IN SCORING (per channel: out=255*gain*(H/255)**gamma): R 1.102/0.978,
#     G 0.991/0.898, B 0.958/0.835. Don't bake color into the render.
#   • Files you edit (headless only): oz_render.mm, tools/ozengine.py, tools/render_gt.py. oz_render.mm is
#     ONE shared file — coordinator gives ≤1 .mm-touching mechanism at a time; others do render_gt.py
#     time-domain or pure diagnosis. Rebase with pool_worker_rebase.sh wN. Integration branch: agent/fix-pae-gt.
#   • .motr templates live in TWO places: the read-only FCP app bundle AND a writable copy at
#     `~/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/` — glob there, don't `find ~`.
# When your spawn text mentions ~/fct-gui-gt / oz_render / ozengine / score_slug.py you are in the HEADLESS pool;
# ignore the TS-engine-specific gotchas below and use the HEADLESS gotchas section.

## SPAWN-TEMPLATE IMPROVEMENTS (fold these into the watchdog's spawn text)
# ⏸️ RETRO 2026-07-07 (last checked 22:15) — POOL STILL PAUSED, NO NEW TRANSCRIPTS. pool.tsv is a worktree/branch/state
#   table (w1–w8, all at/behind integration 18fe152, 0 procs) — the old session_id column is gone; no
#   live/queued workers exist. Newest genuine worker sessions ended 2026-07-06 (g*/h* families: h3-ozrender
#   -abswap 11:31, h5-blur-rig-proto); every session after that is a retro-cron run. Those two were already
#   mined in the 13:35 retro with "no new friction." NOTHING NEW TO MINE this cycle. Only maintenance done:
#   collapsed the two redundant wave-h "no-new-friction" narrative blocks into this line. When the pool
#   RESTARTS (per user directive: fix GT [done] → make transitions pixel-perfect), re-run this retro against
#   the new worker sessions. The single highest-value spawn edit REMAINS unchanged & UNAPPLIED: paste
#   H0-PRIME + the H21 worst-first backlog as the literal FIRST lines of every headless spawn (agents read
#   the task, not the playbook — proven 3 waves running by h3 re-burning ~8 calls on nohup&/sleep;cat).
# 🟢 H21-SPAWN (RETRO 2026-07-07 12:56 — post-corrected-scoreboard state; supersedes stale bits of H19/H20):
#   • 360 ENDPOINTS ARE NOW PARTLY FIXED. Commit 47e9f2c landed the cheap defensible ENDPOINT fix (fixed
#     CANVAS-CENTER readback for equirect canvases, not the moving-DOD center) → 360 Push 7.11→10.89,
#     360 Slide 9.29→13.58, overall 16.26→16.38, ZERO regressions. So do NOT tell a 360 worker "endpoints
#     are black/blocked" (that was pre-47e9f2c). What REMAINS for 360 is ONLY the MID-FRAME equirect→
#     rectilinear projection (f6-f18 front view is empty because the .motr does a flat clone-layer translate
#     with no wraparound). The mid-frame entry is `OZImageNodeRender360 → HGEquirectProject` (getHelium
#     builds it) — MORE CONCRETE than the LiCamera/setCamera path in H19; still a real disasm dig.
#   • DEAD-END for 360 workers (saves a probe): 360ProjectMode (OZScene+0x90+0x10c) is ALREADY 0 for the
#     transition templates — it is NOT the equirect/rectilinear switch. Don't flip it.
#   • CURRENT worst-first backlog (gui_scoreboard_corrected.tsv, top of file): Dissolves__Divide 9.03,
#     Objects__Veil 9.76, Stylized__Heart 9.89, Wipes__Mask 10.77, 360 Push 10.89, Stylized__Up-Over 10.94,
#     Objects__Leaves 10.94. (360 Push/Slide dropped OFF the very bottom after 47e9f2c.)
#   • BLACK-FRAME slugs are REAL engine content gaps, NOT measurement/timing noise (confirmed by clean
#     isolated re-render): Movements__Smear (5 black), Movements__Multi-flip (2), Movements__Flip (1),
#     Replicator__Multi (1). These are per-transition template-produces-nothing-at-certain-scene-times gaps;
#     route them to the mechanism-owner, do NOT waste a re-render trying to "fix" them by re-sampling.
#   • APPLICATION-GAP persists: h3 (last wave) STILL burned ~8 calls on nohup&/sleep;cat despite H0-PRIME
#     being in this doc for 2+ waves. The single highest-value spawn edit is STILL just pasting H0-PRIME +
#     H21 backlog as the literal first lines of every headless spawn. Agents read the task, not the playbook.

# 🔴🔴 H20-SPAWN — ⚠️ ALL PER-SLUG PSNR NUMBERS BEFORE 2026-07-07 01:34 ARE INVALID (SCOREBOARD_CORRECTED_NOTE.md).
#     A shared OFF-BY-ONE TIME-DOMAIN BUG shifted the GT slice AND the headless render THE SAME WAY, so they matched
#     each OTHER (not FCP) — inflating every score (Scale "29.48"→real 13.14, Duplicate "22.71"→11.65, etc.). After the
#     fix (sample_time = i/N * scene_duration + corrected integer-frame slice_gui_gt.py + GL-context-poisoning fix +
#     isolated re-render) the HONEST full-65 board is OVERALL MEAN 16.26 dB (>30:1, 20-30:14, <20:50). PUT IN EVERY
#     SPAWN: "IGNORE all dB in pool.tsv / *_FINDINGS.md / this task line — they were measured on the broken domain and
#     are ~5-15dB too high. The ONLY valid baseline is ~/fct-notes/gui_scoreboard_corrected.tsv (worst-first backlog);
#     measure your OWN corrected baseline first." Worst-first now: 360 Push 7.11, Dissolves Divide 9.03, 360 Slide 9.29,
#     Veil 9.76, Heart 9.89, Mask 10.77. NOTE this SUPERSEDES/contradicts H18-SPAWN's "trust FINDINGS.md rescore" —
#     the FINDINGS rescores were ALSO on the broken domain. Trust ONLY the corrected tsv.
# ⭐ H19-SPAWN — For ANY 360°/equirect worker, TELL THEM UP FRONT (HIGHLEVEL_API_FINDING.md, 2026-07-07):
#     "The 360 .motr is an Object3DEnvironment SPHERE (<Object3DEnvironments>100</…>, 4096×2048), NOT a flat
#     1080p scene. GUI-GT = the sphere rendered through the HOST timeline's rectilinear perspective camera at
#     1920×1080. The fix is the OZX EXPORT-CAMERA stage, NOT the readback ROI (wrong abstraction) and NOT a numpy
#     reproject. Two PROVEN dead-ends you must NOT repeat: (1) GLRenderer::render(scene,params) directly → renders
#     native 4096×2048 with no camera + crashes f6 (missing the mutex/autorelease wrap _OZXGetFrame provides);
#     (2) hand-computed readback ROI → DOD is the moving union of 2 clone layers so it chases empty canvas.
#     Correct entry (MAPPED FROM DISASM, HIGHLEVEL_API_FINDING.md 01:20): the ONLY thing that produces the
#     rectilinear front view is an actual PERSPECTIVE CAMERA on the render — `OZRenderParams::setCamera(PCPtr<LiCamera>)`
#     (a LOCAL symbol 't', call by file-offset+dyld slide). With a camera set, the Object3DEnvironment sphere projects
#     THROUGH it (rectilinear + horizontal wraparound, no black center gap); with none it renders the flat 4096×2048
#     equirect. Build an LiCamera via the `Li3DGroupForEquirect(PCPtr<LiCamera const>,LiLightSet,int,int)`+`LiEquirectProject`
#     path at FCP's default 360-in-2D FOV/orientation, setCamera before render, render 1920×1080. FOUR proven dead-ends
#     do NOT repeat: (1) GLRenderer::render(scene,params) directly → raw 4096×2048 grey, no camera, crashes f6 (missing
#     _OZXGetFrame's mutex/autorelease/process-control wrap); (2) hand-computed readback ROI → DOD is the moving union of
#     2 clone layers, chases empty canvas; (3) OZRenderParams::setResolution(1920×1080) ALONE → output IS 1080p but ALL
#     BLACK (resolution alone does not invoke the environment→camera projection); (4) any by-value struct-return extern
#     (OZRenderParams::getResolution() → PCVector2<double>) → ABI stack smash, crashes in fprintf. It's a substantial
#     disasm-guided build (construct LiCamera, match FOV/orient to GUI) — ship the honest diagnosis if you can't land it;
#     ⚠️ PARTLY STALE — see H21-SPAWN: 47e9f2c landed a canvas-center-readback ENDPOINT fix (Push 10.89, Slide
#     13.58); only the MID-FRAME projection (OZImageNodeRender360→HGEquirectProject) still needs the camera dig.
#     Originally: only the 2 pure-360 endpoints (Push, Slide) + 6 family mid-frames depend on it. oz_render.mm reverted to 9fddfa1
#     (63/65 correct) — do NOT leave a half-camera experiment in the shared file.
# 🔴 RETRO 2026-07-06→07-07 (waves-h/s1 re-reviewed, h1..h5+s1): NO new friction across the whole wave —
#     every h-family lesson (A/B identity #11, blur rig-eval clamp H8, 3D-not-time H17, DYLD-strip H5/H9,
#     long-lived scorer H14) was already captured; h1 shipped both oz_render.mm fixes cleanly (Squares GetDOD
#     + media-ref call-through), h5 confirmed rig transfer lives in the Ozone framework not oz_render.mm
#     (folded into H8). The ONLY persistent gap is APPLICATION not mining: h3 re-burned ~8 calls on
#     nohup&/sleep;cat despite H0-PRIME existing for 3 waves → fix is pasting H0-PRIME into the spawn TASK.
# ⭐ H17-SPAWN — For ANY 3D-motion Movements worker (Rotate/Pinwheel/Fall/Clothesline/Swing/Reflection), TELL THEM
#     UP FRONT: "these are GEOMETRY/3D-compositing gaps in oz_render.mm, NOT time-remap. h4 PROVED it with the
#     best-fit-scene-time test (see gotcha 'IS-IT-TIME?') — the correct-geometry frame does NOT exist at ANY
#     scene-time (best-fit curves non-monotonic, peak PSNR stays mid-teens). Do NOT ship a render_gt.py time hack;
#     it can only overfit. Diagnose the 3D transform (perspective phase at t=0, A/B card depth ordering) and defer
#     to the oz_render.mm owner." Saves a full re-derivation of the time-vs-geometry question every wave.
# ⭐ H18-SPAWN — ⚠️ SUPERSEDED BY H20-SPAWN: do NOT tell agents to trust the FINDINGS.md rescore either — those
#     were ALSO measured on the broken (off-by-one) time domain. The ONLY valid numbers are gui_scoreboard_corrected.tsv.
#     (Kept for history: the ORIGINAL point was that flat spawn numbers go stale a wave — still true, but the fix is
#     "trust the corrected tsv + measure your own", NOT "trust FINDINGS.md".)
# ⭐⭐ H0-PRIME — PUT THIS AS LITERALLY THE FIRST LINE OF EVERY HEADLESS SPAWN (it keeps recurring even though H0/H9
#     are already in this playbook — h3 STILL burned ~8 calls on `nohup … &`, `sleep 25; cat`, and `for i in seq;
#     do sleep 4; done` on its first render, all tripping the 5s wall; agents read the task before the playbook, so
#     the fix has to be IN THE TASK): "To wait for a render/build, use `background:true` ON THE COMMAND ITSELF or one
#     `navi.background('while kill -0 <pid> 2>/dev/null; do sleep 30; done; echo DONE','wait')` and STOP. NEVER
#     `nohup&`, NEVER `sleep N; cat log`, NEVER `for i in $(seq); do sleep`. Poll the log ONCE with a plain `grep`
#     when you get the completion notice. While waiting, do analysis that doesn't need the render." Also state the
#     render mutex is `/tmp/oz_render_global.lock` (auto-acquired by init_engine; a hung 0%-CPU render means another
#     worker holds it — report, don't kill).
# ⭐ H16-SPAWN — For ANY oz_render.mm / media-ref-hook worker, TELL THEM UP FRONT: "the A/B drop-zone binding is
#     already SHIPPED by h3 — bind by runtime IDENTITY `isTransitionSourceA(self)?g_nodeA:g_nodeB`, NOT discovery order
#     (which does not match .motr file order). Do not re-derive it; see gotcha #11. Wipes__Mask will score LOWER
#     under the correct fix because its GUI-GT is A/B-inverted — that is expected, do not special-case Mask." This
#     fight has now recurred across p21, g7, and h3 (~15+ calls each time); it belongs in the task, not just here.
# H0. (HEADLESS POOL) NEVER busy-poll a slow render/slice with `sleep N; cat log` loops — the runtime
#     KILLS the agent with `repeated_tool_loop` after ~12 near-identical steps (gui-gt-validate AND
#     videos-all-65 were BOTH auto-terminated this way, ~140 wasted tool calls). If a render/slice is
#     already running and you're just waiting: do a SINGLE `navi.background("bash -c 'while kill -0 <pid>
#     2>/dev/null; do sleep 30; done; echo DONE'", "wait-render")` and STOP — you get a completion
#     notification. Prepare analysis scripts while you wait; do NOT loop-poll. Better: don't wait at all —
#     work a diagnosis slice that doesn't depend on the in-flight render.
# H1. (HEADLESS POOL) `find ~` TIMES OUT (huge home dir) — fix-areturn-gt lost ~10 calls to this. Never
#     `find ~`; glob known roots: `~/random/final-cut-pro-transitions`, `~/random/motion-renderer/examples/
#     PETemplates.localized`, `~/fct-gui-gt`, `~/fct-notes`. slug->motr map is ALREADY at /tmp/slug_map.json.
# H2. (HEADLESS POOL) lldb breakpoints on Ozone C++ symbols show "no locations (pending)" until the dylib
#     is dlopen'd — set the breakpoint but the process must reach engine-init first (rig-direction-eval
#     burned ~15 calls). Use `command script import` + a Python breakpoint callback that returns False
#     (auto-continue) and reads regs/memory; do NOT use inline `breakpoint command add` with `$d0`/`bt`
#     (those printed nothing). Run lldb with `background:true`, then read the log ONCE (not in a poll loop).
# H3. (HEADLESS POOL) render_frame is ~1s each; a 24-frame slug ≈25-40s (360°/4K-equirect ≈30-60s/frame!).
#     Score in BACKGROUND. To parallelize, launch per-slug workers with an `ONLY=<slug>` env filter rather
#     than one alphabetical single-thread pass (360° are first AND slowest → they block everything).
#     .rgba sidecars auto-invalidate on PNG mtime; re-rendering the PNG is enough (delete sidecars only to be safe).
# H4. (HEADLESS POOL) The GUI-GT SLICER (tools/slice_gui_gt.py) does a full ffmpeg seek+decode PER FRAME
#     (~1560 invocations, ~2min/dir, 80+min total) — DON'T re-slice. ~/fct-gui-gt is CANONICAL; treat it
#     read-only. If frames are missing, the coordinator re-slices, not you.
# H5. (HEADLESS POOL) TWO things every headless agent must know at turn 1 or they lose ~10 calls:
#     (a) DYLD_FRAMEWORK_PATH is STRIPPED by SIP from any child spawned via nohup/setsid/timeout/sudo/subprocess
#         → "Library not loaded @rpath/ProAppSupport". Background with a BARE `&`(+disown) OR self-reexec via
#         `os.execv(sys.executable,…)` after setting os.environ['DYLD_FRAMEWORK_PATH']. score_slug.py works only
#         because DYLD is inline on a DIRECT invocation. (see Known gotchas "DYLD…STRIPPED".)
#     (b) There is ONE global render mutex — the ACTUAL file is `/tmp/oz_render_global.lock` (NOT the stale
#         `/tmp/fct_gl_render.lock` this doc once claimed). ozengine._acquire_global_render_lock uses an O_CREAT|O_EXCL
#         PID-file (writes getpid; NOT fcntl.flock) with dead-PID stale-reclaim + 3600s timeout. Concurrent unlocked
#         renders crash FFCreateSharedCGLContextObj and poison the GL master context BOX-WIDE. init_engine() acquires
#         it automatically, so any script that imports ozengine + init_engine is covered. ⚠️ STALE-RECLAIM ONLY FIRES
#         WHEN THE OWNER PID IS DEAD — a wedged-but-ALIVE holder (e.g. a hung render in another worker) blocks the
#         WHOLE pool for up to 3600s and your render will sit at 0% CPU forever. If your render hangs: `cat
#         /tmp/oz_render_global.lock` for the owner PID, `ps -p <pid>` — if it's another worker's hung render, that's
#         your wedge, not your code (report it; don't kill another worker's proc).
#         If EVERY worker's render is failing at init, it's contention — not your code.
# H6. (HEADLESS POOL) The bt709 COLOR MODEL is SOLVED & near-universal (g8) — don't re-derive it. It's applied
#     in scoring already (GAM curve). Do NOT special-case Lights (Flash/Lens_Flare) color. (see Known gotchas.)
# H7. (HEADLESS POOL) READ your family's `~/fct-notes/<FAMILY>_FINDINGS.md` BEFORE diagnosing — a prior wave
#     already decoded most families (360_/MOVEMENTS_/OBJECTS_/REPLICATOR_/STYLIZED_/TIMEREMAP_/BLURS_/COLOR_).
#     They carry the .motr anchors (ids/factoryIDs/UUIDs), the scoreboard, and the exact root-cause CLASS so you
#     start ahead instead of re-rendering to rediscover the same gap.
# H8. (HEADLESS POOL) If your transition uses `factoryID 11 "Rig Behavior"` to drive a filter Amount/Angle or a
#     Position (rig-DIRECTION, blur-AMOUNT, 360° reorient-pan, A/B swap), the fix is NOT in render_gt.py or the
#     .motr — editing/scaling those curves is PROVEN INERT (g8b). It's the shared engine rig-eval bug g1 owns in
#     oz_render.mm. Diagnose + document + defer to g1's serial slot; don't burn renders trying .motr param edits.
#     ⭐ WHERE TO INSTRUMENT (h5, 2026-07-07 — saves the "is it in oz_render.mm?" rediscovery): the rig transfer is
#     NOT in oz_render.mm's own code (that file is only the media-ref resolver hook `oz_mediaref_pick`). Rig eval
#     runs INSIDE FCP's Ozone framework during `OZXGetRenderGraph` + `OZX_prepareForRender`. So lldb-break the
#     framework's rig-behavior apply / the filter's setParameter (Gaussian filter node id 989373857; its two
#     `channelBehavior affectingChannel="./10001"` rig behaviors ids 989373863/…) — don't grep oz_render.mm for it.
#     Corollary: SCORE REVERSED-TIME (headless f[23−i] vs GUI f[i]) and CHECK f0/f23 identity (mean-RGB vs A/B)
#     on turn 1 — a big reversed score or f0≈B means an A/B-swap (rig class), not a content mechanism to build.
# H9. ⭐ (HEADLESS POOL — FIX THE SPAWN TEXT ITSELF) The g1 spawn template literally said "batch in background with
#     nohup, poll" — that is WRONG and burned ~15 calls on the very first render: `nohup`/`timeout`/`setsid`/subprocess
#     ALL strip DYLD_FRAMEWORK_PATH (→ "Library not loaded @rpath/ProAppSupport") AND poll-loops trip the 5s wall +
#     the repeated_tool_loop auto-kill (H0/H5a). REPLACE that line in every spawn template with: "background renders
#     with a BARE `&`(+disown) OR self-reexec (os.execv after setting os.environ['DYLD_FRAMEWORK_PATH']); end render
#     procs with os._exit(0); then do ONE `navi.background('while kill -0 <pid>; do sleep 30; done; echo DONE','wait')`
#     — never nohup, never `sleep N; cat` poll." Also drop the stale "cli:vjeux-mac" bench-image lines from headless
#     spawns. Same fix for the "nohup, poll" wording anywhere it still appears.
# H10. ⭐ (HEADLESS POOL) DON'T pre-commit a mechanism NAME in the spawn text — it misdirects. The timeremap spawn said
#     "FCP maps timeline-progress → motr-time via the template's RETIME VALUE curve"; g6b spent turns proving that's
#     FALSE (Retime Value curves are per-drop-zone scene-time→source-media-frame maps, slope ~30fps — NOT a timeline
#     remap). The real mechanism was a cold-B-anchored REVERSE-RAMP (see gotcha + snippet). Frame future mechanism
#     hypotheses as "candidate — VERIFY in the .motr first" (H8 corollary), not as fact.
# H11. (HEADLESS POOL) VERIFY EARLY, not last. Under 8-way pool load the FINAL verification render frequently WEDGES
#     at engine init (g8b's ship-score never landed → "still queued", baseline 26.40 unchanged; render mutex serializes
#     but the shared GL master context still crashes under contention). Get your ONE critical before/after score in the
#     FIRST third of the run while you still have call budget, or reserve a quiet-pool window (`while [ $(pgrep -fc
#     score_slug) -gt 1 ]; do sleep 20; done`). A render_gt.py-only fix (no ./build.sh) can be verified anytime; if the
#     pool is hot and your fix needs a render you can't get, ship the DIAGNOSIS + exact patch spec rather than nothing.
# H12. ⭐ (HEADLESS POOL) If your render_gt.py fix changes WHICH TIMES are sampled (reverse-ramp / non-linear schedule,
#      not just the `end` scalar), the SHARED scorers WON'T SEE IT: `score_slug.py`/`gui_scoreboard.py` sample linear
#      `t=i/23*end` and will report NO gain — you'll think your fix broke. h2 exposed `render_gt.sample_time(i,24,end)`
#      (reads `_LAST_SCHEDULE`, linear fallback) as the single hook; the scorers need a one-line swap the coordinator
#      applies pool-wide. Until then, VERIFY schedule-based fixes with a PRIVATE scorer copy calling sample_time, and
#      say so in your report — do NOT conclude "no improvement" from an unpatched score_slug.py.
# H13. (HEADLESS POOL) Where to put a render_gt.py span/end fix so BOTH paths pick it up: `score_slug.py` calls
#      `render_gt.animation_end_seconds(mp)` then `_areturn_end_seconds` DIRECTLY (no FCT_ATRIM gate) — same as
#      `_render_one` — so a SCALAR `end` clamp placed INSIDE `animation_end_seconds` is seen by both the scorer and
#      the batch GT path immediately (no ./build.sh, Python takes effect at once). (Contrast H12: a change to WHICH
#      TIMES are sampled — a non-linear SCHEDULE — is NOT seen by the scorers; that needs the `sample_time` swap.)
#      Confirmed g5b: Smear playRange-clamp is RETRACTED/inert (unclamped 1.13s is best); only Drop_In clamps cleanly.
# H14. (HEADLESS POOL — measurement/scoreboard workers, s1) Score in ONE long-lived process: reexec-for-DYLD,
#      `init_engine()` ONCE, then loop load_doc+render_frame+psnr over all slugs, appending to the OUT tsv after
#      EACH slug. Init can take ~4 MIN just to acquire the render mutex when another worker (h3) holds it — that
#      wait is EXPECTED, not a hang. The process WILL sometimes die mid-batch (CGL "Context leak"/init flake): on
#      restart, RE-LOAD the existing OUT tsv into your results dict and only render the REMAINING slugs (s1 lost
#      one batch at slug 11/20 and cleanly resumed with a score2.py that appended the last 9). Template pattern:
#      /tmp/s1_score2.py (reexec+FCT_ATRIM=1+GAM color+sample_time+per-slug tsv append+3× retry). ~50s/slug at 24f.
# H15. (HEADLESS POOL) BASELINE FILES USE A DIFFERENT SLUG NAMING than the GT dirs / slug_map: the old board
#      `gui_scoreboard_partial_28.tsv` keys are `360°__360°_Push` while GT dirs + /tmp/slug_map.json use
#      `Movements__Push`, `Objects__Squares`, etc. Don't join before/after by exact key — map by transition, and
#      note the baseline SOURCE per row (28-board vs FINDINGS.md quote vs h2/h3 commit). See s1_before_after.tsv
#      for the reconciled table (20 slugs, before/after/delta/status/baseline_source).
#
# --- The items below (1..22) are TS-ENGINE-pool history; skim only if you are on that pool ---
# These recur in EVERY transcript and cost 10-20 tool calls each if unknown up front:
# 1. FOREGROUND 5s TIMEOUT: `npx tsx` scorer runs ~15-30s and ALWAYS trips the 5s (30s cap)
#    foreground limit. Tell agents up front: use the bash tool's `background: true` flag —
#    NOT `nohup ... &`, NOT `(...) &`, NOT `sleep 22; cat` (p11 tried all three, EVERY ONE trips
#    the 5s wall because the shell blocks until the child detaches). `background:true` is the ONLY
#    thing that works. Even a bare `sleep 25` foreground times out. Once backgrounded, DON'T poll
#    with `sleep N; cat log` (also times out) — just `cat /tmp/pN.log` and wait for the completion
#    steering message. Prototype-optimizer grid searches (per-pixel JS over N tiles × 24 frames × 100s
#    of configs) run for MINUTES and are near-un-pollable; prefer iterating in the REAL engine scorer
#    (compiled/optimized, ~10-15s) over a pure-JS scratch optimizer (p11 burned ~15 calls on a stuck one).
# 2. SCORER IMAGES: score with `test/start.png` + `test/end.png` (NOT images/start.jpg, NOT ../images/*)
#    — that is exactly what scoreboard.ts/bench uses to match the GT cache. Agents keep hitting
#    `[Tool result: error]` guessing image paths (p3, p7). Give them the ready-made scratch-scorer
#    snippet (see Reusable snippets) so they stop re-deriving loadPNG/psnr/paths.
# 3. Give the parse export names up front: parseMotr / createTransition / createBenchTransition /
#    loadGT (NOT parseScene). Saves a failed import round-trip.
# 4. PIL/montage: system python has no PIL and pip is PEP668-blocked. Use
#    `~/random/final-cut-pro-transitions/venv/bin/python` for PIL, RUN FROM `~` (a stray /tmp/dis.py
#    shadows stdlib if cwd=/tmp), no imagemagick `convert`; downscale with `sips -Z 480`.
# 5. MAIN MOVES WHILE YOU WORK — plan for a mid-task rebase from turn 1. Nearly every long agent
#    (p7, p2) got a REOPEN/rebase steering message and burned ~10+ turns re-deriving what was
#    "theirs vs main". Up front: (a) after committing, `~/fct-notes/pool_worker_rebase.sh wN`;
#    (b) the #1 recurring conflicts are call-site arity errors in shared files — `parseShape` now takes
#    3 args `parseShape(node, factories, linkSourceIds)` (grep `parseShape(`), AND `rasterizeShape` in
#    compositor/shapes.ts grew params from multiple agents (p18b added `cameraZ?/cameraPosZ?` for 3D-fill
#    perspective projection; p22 added `strokeOverride?` as the LAST param for stroked-arc arrow masks).
#    When both merge, keep ALL params in order and make the dispatch pick the stroked-arc path for stroked
#    shapes then fall through to the fill/perspective path — fix every rasterizeShape call site's arg order;
#    (c) resolve APPEND-STYLE keeping BOTH features; (d) SHARED-FILE SIBLINGS: any parser/compositor
#    fill/mask/gate change can silently regress a sibling that merged in parallel — re-score the
#    named siblings that touch your files, not just the guard set.
# 6. factoryID definitions in a .motr's <factory> table are NOT what the runtime scene uses. A motr
#    can DEFINE Replicator(19)/Cell(20) yet its scene nodes use entirely different factoryIDs and it
#    is NOT a runtime replicator (Multi, p3). ALWAYS enumerate the actual scenenode factoryIDs before
#    assuming a code path. Framing camera = factory 3; only ONE transition per family usually uses it.
# 7. GT BACKGROUND ISN'T ALWAYS BLACK. Switch mid-transition GT is WHITE. Kinetic/panel scenes vary.
#    Open 3-4 GT frames (f0,f6,f12,f23) with `read` BEFORE hypothesizing — don't assume black. And
#    endpoints aren't always A→B: a retime-wrap transition (Switch) LOOPS BACK to A, so GT f23 == A.
# 8. TASK BASELINE NUMBERS ARE STALE — every agent (p14: task said 13.85, real 11.27) confirms it.
#    Measure your OWN baseline first; ignore the number in the spawn text.
# 9. WRITE SCRATCH FILES ON cli:vjeux-mac, NOT the workspace node. `/tmp/x.ts` via ipython lands on
#    the workspace sandbox, not the CLI (p12 lost time on this). Use `cat > ~/fct-worktrees/wN/...`
#    via bash node="cli:vjeux-mac", or write into engine/test/ (delete before commit).
# 10. BESPOKE per-transition DETECTORS (detectLightSweep, detectPageFlip) WILL be bounced for an
#    inertness proof: the coordinator re-runs your detector against ALL 65 .motr and requires it fires
#    ONLY on your target. Build that 65-transition proof harness UP FRONT and report the TRUE/FALSE list.
# 11. A/B IS NOT ALWAYS DOCUMENT-ORDER (p21). Some templates author the 'Transition B' drop-zone
#    BEFORE 'Transition A', so doc-order A/B SWAPS the images (engine shows B at t=0 → every frame
#    ~10dB). If f0 looks like the WRONG source, check A/B binding first — bind by Fade In/Fade Out
#    direction (fade-OUT=A/outgoing, fade-IN=B). Known B-before-A: Lights/Lens_Flare, Dissolves/Divide,
#    Lights/Static (Drop Zones: Transition B authored before Transition A).
#    ⭐ FAST DECODE (h3, headless pool): the authored drop-zone order is the `<pathURL>Drop Zone Transition [AB].tiff`
#    order in the .motr — grep it in 1 call: `grep -oE '<pathURL>[^<]*Drop Zone Transition [AB][^<]*</pathURL>' <motr>
#    | sed -E 's/.*Transition ([AB]).*/\1/'`. Decoded so far (headless slugs): Push `A B`, Wipes__Mask `A B`,
#    Movements__Scale `A B` (normal order); Movements__Flip `B A`, Replicator-Clones__Duplicate `B A`, Concentric
#    `B A` (SWAPPED — these are the ones that score higher time-reversed / need the identity-based A/B rule, NOT
#    discovery order). NOTE: `isTransitionSourceA/B` are RUNTIME OZImageElement accessors (C++), NOT motr attributes —
#    grepping the .motr for them returns 0; you must read them at render time via the oz_render.mm hook.
#    ⭐⭐ RESOLVED (h3, oz_render.mm A/B-swap — DON'T re-derive): discovery-order (which drop-zone the compositor
#    visits first) is FUNDAMENTALLY UNRELIABLE and does NOT match .motr file order (Flip is `B A` in file yet
#    visits A first; Mask is `A B` in file yet visits B first). The FIX is a generic one-liner in the media-ref
#    hook: assign by IDENTITY not order — `raw = isTransitionSourceA(self) ? g_nodeA : g_nodeB;` (an element is
#    A xor B). Delete the g_seenA/g_seenB discovery state; oz_reset_hook becomes a no-op (keep for ABI). Disasm of
#    the role accessor: Ozone flag@self+0x5820 nonzero AND role@self+0x5b80 ==1 for A / ==2 for B. Verified gains
#    (FCT_ATRIM=1, GUI GT): Scale 18.95→29.48, Duplicate 12.03→22.71, Flip 19.01→23.03, Leaves 10.89→16.72,
#    Veil 9.77→14.88, Curtains 16.26→17.98, Concentric 14.03→16.49; guards Push/Rotate/Blurs__Directional/Arrows
#    byte-identical (A-first, identity==discovery). NET +40dB over 7 slugs.
#    ⚠️ Wipes__Mask REGRESSES under the correct fix (17.68→13.90) because its GUI-GT is itself A/B-INVERTED (a
#    rig-direction export artifact). The identity render is MORE correct than the reference; do NOT special-case
#    Mask to preserve the wrong-GT match (that's optimizing to a broken reference — banned, gotcha #17). Mask's
#    GT needs re-export with correct A/B (coordinator/GT-regen scope, not a worker).
# 12. CHECK ENDPOINTS BEFORE BUILDING THE FANCY MECHANISM (p21). Lens Flare's +30dB came from A/B-swap +
#    retime-wrap plumbing, NOT its LensFlareGenerator. Verify f0/f23 source identity + A/B binding first;
#    the "obvious" named mechanism is often a red herring and the real gap is base compositing/timing.

# 13. rasterizeShape() SIGNATURE KEEPS GROWING — the #1 rebase tsc break after parseShape. Current
#     order (p19b, p22, p18b): `rasterizeShape(shape, W, H, transform?, cameraZ?, cameraPosZ?, strokeOverride?, flipY=false)`.
#     When you rebase, grep `rasterizeShape(` and fix EVERY call site's positional args (append-style, keep all).
# 14. "TARGET FROZEN ON FULL-A AT EVERY FRAME" is almost always the retime-wrap gate mis-firing on a
#     SPURIOUS layer (p19b): an always-invisible bundled decorative asset (source.type==='media', opacity 0)
#     with a tiny timing.out gated retimeWrapSec to ~0.03s → every frame wrapped to time 0. Diagnose FIRST
#     with the retimeWrapSec probe (dump each layer's retimeExtrap + timing.out); if the min comes from a
#     non-transitionA/B layer, that's your bug. (See Known gotchas retime-wrap-media-gate.)
# 15. "CUT/EFFECT HAPPENS ONE FRAME LATE" or a Lights/analog scene sampled on the wrong time domain: the
#     animationEndSec keyframe scan counts curves keyed PAST their owner's lifetime. FOUR known variants now
#     (Video_Wall framing X/Y, Drop_In "Preview Position", blur "Amount"/"Angle", and p24 <filter> curves past
#     the filter's timing.out). Compare parser animationEndSec vs GT's animation_end_seconds FIRST; if inflated,
#     find which curve family overshoots and clamp/exclude it (filter curves clamp to the enclosing <filter>'s out).
# 16. A GROUP-level <filter> (e.g. PAEBadTV on Lights/Static's "Static B" group) just needs registering by UUID —
#     the compositor already runs group filters on the composited buffer. But timed filters MUST be gated to their
#     [in,out] (Filter.timing) or held endpoint curve values corrupt the endpoints. See Known gotchas.
# 17. STATIC/DEGENERATE GT (p25): some targets' GT is byte-identical A across all 24 frames (Slide_In, Black_Hole,
#     Bloom, 360°_Bloom — see GT_INTEGRITY_AUDIT.md) → engine gets 50.2dB for doing NOTHING. If your target is on
#     that list, run the static-GT probe (Reusable snippets) FIRST; if delta==0, the GT is degenerate/inert and
#     chasing motion optimizes to a broken reference (banned). Report the honest negative — do NOT fake motion.
# 18. retime-wrap fires ONE FRAME EARLY on A→B reveals whose end state is B (p29): if per-frame f0..f22 are fine
#     but f23 collapses to ~10dB, it's the wrap snapping the last frame B→A. Fixed generically by
#     detectRevealEndWrapCancel (Fall/Rotate/Reflection/Scale/Push/Drop In). Always CHECK f23 identity vs GT first.
# 19. VERIFY A/B ORIENTATION BY AVG-COLOR IN 3 LINES, TURN 1 (p27 lost ~40 calls to a silent swap). The scorer
#     maps start.png→A, end.png→B. But some templates play B→A, OR bind the incoming media to the node NAMED
#     "Transition A". Symptom: engine f0 shows the wrong source, ~10dB flat, and you chase the "mechanism" for ages.
#     FAST CHECK: compare mean RGB of GT f0 vs start.png vs end.png (see Reusable snippets "A/B avg-color probe").
#     If GT f0 matches end.png, the GT plays B→A → the unmasked base layer must render imageB and the masked reveal
#     imageA. This is a SUPERSET of gotcha #11 — it also fires on MASK-REVEALS with NO fade behaviors (Duplicate:
#     node "Transition A" has drop-zone Type=1 but holds the incoming/blue media; GT f0=blue=end.png). Do this
#     BEFORE building any reveal mechanism.
# 20. A REPLICATOR CAN BE AN IMAGE-MASK SOURCE (p27 Duplicate, SHIPPED 849c486→30.53). A layer's `imageMaskSourceId`
#     may point at a grid Replicator (not a shape/group). resolveImageMaskAlpha handles it: generate instances,
#     resolve the rig-selected cell SHAPE, apply the Sequence Replicator per-instance scale/opacity, union → the
#     growing-dots reveal matte. Also (a) SKIP the standalone replicator render when it is an imageMaskSource (hidden
#     geometry, like the group-mask-source skip) and (b) DISABLE retime-wrap for a replicator-matte reveal (the many
#     hidden cell-candidate shapes carry early ~0.7s drop-zone timeouts that would snap the tail to A). REUSE this
#     replicator-geometry-as-mask pattern for any grid/dot/spiral replicator reveal (Vertigo is a sibling).
# 21. DON'T TRUST THE LITERAL motr PATH IN THE SPAWN TEXT — glob for it turn 1 (p17 lost a call). The family dir
#     for Replicator/Clones is `Replicator:Clones.localized` (a COLON, not slash) and templates nest under
#     `.localized/<Name>.localized/<Name>.motr`; the spawn path can look wrong or point one level off. Resolve it once:
#     `find "/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized" -iname "<Name>.motr"`.
# 22. YOUR WORKTREE BASE ≠ THE TASK'S QUOTED BASELINE (p28: task said 10.42, fresh w1 measured 5.67). The number in
#     the spawn text was measured on a LATER main than your `based on origin/main <sha>`. Trust ONLY your own scratch-scorer
#     baseline on YOUR checkout; the quoted dB is context, not a target to reproduce. (Superset of the stale-BASELINE.txt rule.)

## ⚑ CORE MANDATE (do not misread this)
# You exist to DO THE WORK, however large. If your transition needs a new filter, generator,
# behavior, simulation, or compositor pass — BUILD IT. Decompile the Metal kernel / PA filter /
# behavior from the Motion frameworks (otool -tvV, class-dump, lldb, .metallib extraction) and
# implement the real mechanism in engine/src. Multi-file, multi-hour, many-iteration changes are
# EXPECTED and fine. NEVER stop and hand work back as "needs a dedicated multi-day pass" — YOU are
# that pass. The ONLY hard limits: (1) don't regress the must-stay guard set — if a shared-code
# change regresses one, FIX it, don't abandon; (2) no fake/hardcoded values — real decoded
# mechanism only; (3) tsc clean (TS pool) / `./build.sh` exit 0 + 65/65 no-crash render (HEADLESS pool).
# A "rigorous negative result" that ships no code is NOT success.
# Commit real progress even if the target isn't fully solved yet — partial real gains compound.

## ⛔ NO PER-TRANSITION HARDCODING (policy, non-negotiable — see GENERIC_ENGINE_POLICY.md)
# The engine must render ARBITRARY .motr files from PRIMITIVES. NEVER special-case a named/single transition.
# BANNED: a detect*()/render*() pair that fires on exactly ONE transition; any renderer that outputs values
#   TRACED from a transition's ground truth (hardcoded colors/onset-times/"draw A centered"/fixed rects/offsets);
#   english-name or file-path matching. A per-transition "structural signature" that selects 1 transition and
#   replays its decoded GT storyboard is STILL a hardcode (this is exactly how the removed Light Sweep path snuck in).
# RED FLAG: "my detector fires on exactly 1/65" is NOT a safety proof — it is the DEFINITION of the violation.
# ALLOWED: node/behavior/filter/generator/replicator/mask/blend primitives driven by the .motr's OWN params (by ID),
#   evaluated generically. A FAMILY detector that fires on a structural class (e.g. detect360Band = 7 equirect scenes)
#   is acceptable if its renderer is param-driven. If you cannot reach the target with primitives yet, ship the honest
#   lower PSNR from the generic path and BUILD THE MISSING PRIMITIVE — do NOT script the specific transition's output.
# ENFORCEMENT: `cd engine && npx tsx test/no-hardcode.test.ts` must pass (fails if any registered detector fires on <2).
#   If you add a new scene detector, register it there; it must fire on >=2 transitions.

## Fast-start checklist (do these before touching code)
1. cd YOUR worktree. Confirm branch with `git branch --show-current`.
2. Read your target .motr XML fully before hypothesizing. `wc -l` it, then grep -n for
   `scenenode name|behavior name|Source Object|affectingChannel|Affecting Object|factoryID`.
3. Score the CURRENT engine output vs GT first (baseline) — know your starting number. RUN IT IN
   BACKGROUND (5s foreground limit; scorers take ~15-30s). Copy the scorer snippet below verbatim.
4. Change ONE thing, re-score, repeat. Don't batch speculative changes.
5. For geometry/visual bugs: dump 6 frames (engine top / GT bottom) into a montage PNG and `read` it
   inline — a black engine frame vs a populated GT frame tells you instantly if content is off-screen
   vs mis-timed. Faster than staring at PSNR.
6. Sweep params with env-flag hooks (temporary `if (process.env.PN_X) ...` in the evaluator) to find
   the winning constant EMPIRICALLY, then bake the winner in principled form and REMOVE the hooks.

## Known gotchas (populated by retro loop)

### HEADLESS / GUI-MATCH pool gotchas (g1..g8 — read these, skip the TS ones below)
- **⚠️⚠️ THE TIME DOMAIN WAS OFF-BY-ONE UNTIL 2026-07-07 — every per-slug dB in pool.tsv / *_FINDINGS.md / older
  spawns is INFLATED ~5-15dB and INVALID (SCOREBOARD_CORRECTED_NOTE.md).** Both the GT slice (slice_gui_gt.py) and
  the headless render carried the SAME frame shift, so they matched each OTHER better than either matched FCP → the
  scoreboard looked good while the real FCP gap stayed wide. FIX (landed): `sample_time = i/N * scene_duration`
  (linear over N=24 frames) + corrected integer-frame slice + GL-context-poisoning fix + isolated re-render. HONEST
  full-65: OVERALL MEAN 16.26 dB. Consequences for you: (a) TRUST ONLY `~/fct-notes/gui_scoreboard_corrected.tsv`
  (worst-first backlog); (b) any headline win you read ("A/B swap gave Scale 29.48") is on the BROKEN domain —
  Scale is really 13.14, Duplicate 11.65; the A/B fix is still correct, just the dB was fantasy; (c) re-baseline
  before AND after your change on the corrected scorer or you'll chase a phantom regression/gain. Residual pure-black
  frames still needing isolated re-render: Multi-flip(2), Smear(5), Replicator Multi(1), Flip(1).
- **RIG-DIRECTION mechanism DECODED (rig-direction-eval).** Push (& ~17 directional transitions:
  Slide/Flip/Swing/Smear/Scale/Clothesline/Switch/Color_Planes/Mask/Diagonal/360°_Divide) render the
  WRONG Direction snapshot headless. `getSnapshotIDsForValue(double,uint*,uint*,double*)` is the resolver;
  it's called TWICE per render: once value=1.7778 widgetType=4 (the 16:9 ASPECT-RATIO rig, snapIDs [2,1,4,3])
  and once value=2 widgetType=2 (the Direction POPUP/enum rig, snapIDs [1,2,3,4]). The Direction popup
  (Widget id=100) actually stores `default="1.7777777777777777"`. Empirical anchor: editing Push.motr popup
  line ~221 `value="2"`->`value="1"` and re-rendering scores 23.22dB vs 14.48 (the native value) — so GUI
  renders Direction=1 geometry. The mapping is via LinkX/LinkY "Custom Mix" (./207) [1,0,0,1]/[0,1,1,0] +
  "Scale" (./204) sign — **already documented in docs/DEBUGGING.md "Rig-driven Link parameters"** (read it
  FIRST, don't re-decode). Snapshot Position X_end per dir: {2:-1440, 1:-1920, 4:-1967, 3:-2160} (all Y=-1080).
  The generic fix belongs in the rig-eval / snapshot-selection path in oz_render.mm, NOT a per-transition hack.
- **⭐ RIG-BEHAVIOR PARAMETER-PUSH is CLAMPED/BROKEN headless — this ONE engine bug drives rig-DIRECTION *and*
  blur-AMOUNT *and* 360° reorient-pan (g1/g8b/g2 all converged).** `factoryID 11 "Rig Behavior"` interpolates a
  Snapshot value and writes it into a target node's parameter (a Direction Position, a PAE filter Amount/Angle, a
  Reorient Pan). Headless DOES run the behaviors (deleting them removes the effect) and DOES resolve the popup to the
  right snapshot — but the VALUE it transfers to the target is wrong/near-zero-clamped: g8b proved a rig-pushed
  Gaussian Amount stays ~8× too weak no matter how large the authored snapshot value (×1/×4/×10 all inert), while
  Directional (NO rig, direct live Amount curve) tracks GUI perfectly. So the fix is in the Ozone rig-eval /
  snapshot-interpolation → target-parameter WRITE in oz_render.mm — the SAME path g1 fixes for Direction. If your
  transition uses `factoryID 11` behaviors driving a filter/position and renders weak/wrong, DON'T touch .motr
  curves or render_gt.py (proven inert) — it's this shared engine bug; document + defer to g1's serial integration.
- **⭐ THE oz_render.mm MEDIA-REF HOOK IS A DESTRUCTIVE PROLOGUE OVERWRITE — only feeds A/B/nullptr, breaks on >2
  media elements (g4 Objects, g7 Replicator).** `oz_mediaref_pick` (oz_render.mm ~line 91) overwrites
  `OZImageElement::getHeliumGraphFromMediaRef`'s prologue with a trampoline that destroys the original resolver (no
  call-through). It hands source A to the 1st distinct element, B to the 2nd, **nullptr to every element after**.
  Correct ONLY for pure 2-drop-zone templates. Breaks when a template has embedded `Media/*.mov` footage (Objects
  Curtains/Leaves/Veil) or per-CELL replicator drop-zones (Replicator Clone_Spin/Combo_Spin/Video_Wall): the real
  drop zones grab A/B by discovery order and the rest get nullptr → wrong content, green/red placeholder swatches,
  or gray "Pin" placeholders. WORSE: Leaves/Veil HANG (0% CPU, never return) because resolving a real `.mov`
  element routes into the headless-unavailable PMClip/AVAsset decode path the hook was meant to bypass. FIX (serial,
  oz_render.mm): make the hook DISTINGUISH `.tiff` "Drop Zone Transition A|B" placeholders (inject A/B) from real
  `relativeURL Media/*.mov` elements (CALL THROUGH to the original resolver — save original prologue, proper
  detour). Pin A/B to the specific drop-zone element pointers, not discovery order. Full spec in OBJECTS_FINDINGS.md.
- **⭐ A/B SWAP ROOT CAUSE SOLVED & SHIPPED (h3, oz_render.mm) — the media-ref hook now binds drop zones by
  runtime IDENTITY, NOT discovery order. DO NOT re-derive this (recurred p21/g7/h3, ~15 calls each).** Old bug:
  `oz_mediaref_pick` fed source A to the 1st drop-zone the compositor VISITED, but visitation order ≠ authored A/B
  role (and ≠ .motr file order — Flip is `B A` in file yet visits A first; Mask is `A B` yet visits B first).
  Mask/Scale/Duplicate visit their B-role zone FIRST → got swapped. FIX (one line): `raw = isTransitionSourceA(self)
  ? g_nodeA : g_nodeB;` (element is A xor B; `isTransitionSourceA/B()` read the authored role: flag@self+0x5820≠0
  AND role@self+0x5b80 ==1 for A / ==2 for B). Removed g_seenA/g_seenB discovery state. RESULTS (discovery→identity,
  FCT_ATRIM=1, GUI GT): Scale 18.95→29.48, Duplicate 12.03→22.71, Flip 19.01→23.03, Concentric 14.03→16.49,
  Leaves 10.89→16.72, Veil 9.77→14.88, Curtains 16.26→17.98; guards Push 23.22/Rotate 13.04/Directional 27.76
  byte-identical; 56-slug sweep held-or-improved. MASK DECISION (final): Wipes__Mask DROPS 17.68→13.90 because its
  GUI-GT was exported A/B-INVERTED — the OLD swapped render accidentally matched the broken GT. Render Mask
  CORRECTLY; do NOT special-case it (optimizing to a wrong GT is banned, gotcha #17). Re-export Mask's GUI-GT with
  correct A/B (GT-regen, out of scope). Full data: H3_ABSWAP_FINDINGS.md. NEVER ship a render_gt `t→end−t` reversal
  hack (breaks non-reversed slugs). Turn-1 NEW-swap check: OZ_HOOK_DEBUG render @t=0.5 read isA/isB of visited
  order, or mean-RGB GT f0 vs A/B (f0≈B & f23≈A ⇒ GT itself inverted).
- **A "DEFECTIVE" GUI-GT can cap your score — the GT itself can have UNFILLED drop zones (g7 Replicator__Multi).**
  Multi's GUI reference shows GRAY placeholder panels with arrows (FCP didn't fill all Multi's many drop zones
  during GT export) while headless renders MORE real content. A chunk of Multi's low PSNR is an unreliable GT, not a
  headless bug — its true achievable dB is GT-capped. If headless looks BETTER than GT in a montage, suspect the GT.
- **Some templates HANG the headless engine at init under load — it's template-specific, not just contention
  (g7 Concentric, Video_Wall).** Concentric wedges at doc/engine init (empty log, ~0.3s CPU, status S) even with
  only 2 pool procs — a Concentric-TEMPLATE init stall (likely its large-clone-count concentric-ring
  emitter/replicator), NOT pure GPU contention (siblings render fine at equal load). It CAN complete once (scored
  14.73). If a heavy replicator slug repeatedly hangs at init, request an isolated/quiet-pool render slot; a
  "wait-until-≤1-other-pool-proc" wrapper recovered Video_Wall (10.19). Don't assume your code — check the log for
  the pre-CGL empty-init stall signature.
- **⭐ IS-IT-TIME-OR-GEOMETRY? — run this test BEFORE building any render_gt.py time hack (h4).** For a slug that
  looks "mid-motion offset" (GUI f0 already rotated/partway), you must PROVE whether a time-remap can fix it. Method
  (one long-lived process, init once): render a FINE grid of scene-times (~41 pts over [0, max(anim_end,playRange)]),
  then for EACH GUI frame find the scene-time that MAXIMIZES gamma-corrected PSNR. If it's a real time-remap: the
  per-frame best-fit scene-time curve is MONOTONIC-increasing AND peak PSNR is HIGH (30+dB) — the right frame exists,
  you just sampled wrong. If best-fit is NON-MONOTONIC / physically impossible AND peak stays mid-teens: the correct
  geometry does NOT exist at any scene-time → it's a GEOMETRY/3D bug, NOT time. Shipping a schedule then is pure
  GT-overfit (banned). ⚠️ A HIGH single-frame peak (Fall 37.7dB, Pinwheel 33.7dB in h4's scan) is a TRAP — it's a
  coincidental A-only or B-only endpoint frame matching, NOT proof of a time-remap; judge on the MID-transition
  peak (which stayed mid-teens) + monotonicity, not the max. h4 verdict for Rotate/Pinwheel/Fall/Clothesline: all
  GEOMETRY (non-monotonic best-fit, e.g. Rotate peak 16.1dB, Pinwheel curve jumps past anim_end) → NO render_gt change; the fix is oz_render.mm 3D transform
  (perspective phase at t=0: GUI Rotate/Clothesline f0 is already mid-rotation w/ black corners while headless is flat
  full-A → the 3D rig's initial rotation/perspective is not applied at scene t=0) + A/B card depth-ordering (Rotate
  f12 shows a double-exposure X-cross of both cards headless vs single clean card in GUI). Probe template: /tmp/h4_probe.py.
- **Where the rig-behavior parameter-push bug actually LIVES (h5, saves lldb time).** The rig→filter transfer bug
  (blur Amount / rig-Direction, gotcha above) is NOT in oz_render.mm's current code — that file is only a media-ref
  resolver hook. The rig-behavior (factoryID 11) evaluation + snapshot→target-param WRITE happens INSIDE FCP's own
  Ozone framework, reached via `OZXGetRenderGraph` / `OZX_prepareForRender`. So a fix needs a NEW oz_render.mm
  detour on the framework's rig-eval / setParameter path (breakpoint the filter's setParameter to confirm the
  clamped value), not an edit to the existing media-ref hook. Do NOT expect to find the rig eval by grepping
  oz_render.mm — it isn't there.
- **Squares (Objects) renders into ONLY the bottom-right quadrant → 78% black, uniform ~8dB. ✅ FIXED & MERGED (h1
  83d6d17, integration 4138847): 7.56→13.16.** Root cause was an output-region mismatch (Squares' scene aperture ≠
  the 1920×1080 readback ROI). The SHIPPED generic fix reads the scene's **DOD (domain-of-definition) via GetDOD**
  and centers the 1920×1080 readback window on it, GATED to only re-center when the DOD center is off by **>32px**
  (so the other 56 slugs stay BYTE-IDENTICAL — this is why the watchdog trusted h1's self-verify). Do NOT chase the
  earlier "New Fixed Res Behavior=0" theory — the GetDOD ROI-center is the landed mechanism; mirror it if you hit a
  similar aperture/quadrant gap.
- **DEGENERATE / static GUI-GT — do NOT chase motion (GT_INTEGRITY_AUDIT.md).** Still-inert GT sets:
  Movements__Black_Hole, Stylized__Slide_In, 360°__360°_Bloom are all-static-A (score ~50dB for doing nothing =
  false pass). If your target is on this list, verify frame-diffs FIRST; report the honest degenerate finding —
  don't optimize toward a broken reference. (The other ~23 "end-on-A" sets are animation_end OVERSHOOT, not static.)
  ⚠️ REFINED (g8): the GUI-GT Blurs are NOT degenerate anymore — with Filters.bundle loaded the PAE blur RENDERS.
  GUI blur is sharp@f0 → DEEP wide blur plateau through the middle (sharpness ~0.1) → snaps sharp@f23=pure B.
  Current headless: Directional 27.8dB (amount+dir CORRECT, use as template); Gaussian 26.4 (mid blur ~4-9× TOO
  WEAK); Radial 23.7 (peaks too EARLY f4 then RE-SHARPENS mid); Zoom 21.8 (mid/late underblur + back-half drift).
  Dissolves__Divide 9dB is NOT a blur — both H&G stay sharp; rig-direction/geometry class (defer to g1).
  ⛔ CORRECTION (g8b — the old "widen the blur-amount keyframe plateau" advice above is WRONG & inert; see
  "RIG-BEHAVIOR PARAMETER-PUSH is clamped" gotcha below). Editing the .motr Amount curve, forcing a static Amount,
  scaling the rig-pushed Amount ×10, and forcing the popup selection were ALL PROVEN INERT by controlled renders.
  Directional works ONLY because it has NO rig (direct live Amount curve). Gaussian/Radial/Zoom's real Amount lives
  in a Rig-Behavior Snapshots subtree (live filter Amount is a dead 0→0 stub) and the rig transfers a value the
  filter never applies as blur radius. NOT fixable in render_gt.py/.motr — it's the same engine rig-eval bug as g1.
- **A-RETURN is already handled** by render_gt._areturn_end_seconds (final frame settles on B) and is the scorer
  default. CONFORM (loadRGBA fills 1920x1080) is FIXED & committed — pure-source frames now hit 33-37dB.
- **PAE FxPlug filters must be registered in-process** (fix-pae-gt, committed 1d51882: "register Filters.bundle
  in-process"). The media-ref hook only swaps image nodes; PAE* filter nodes (PAERadialBlur/PAEBadTV/etc) need the
  Filters.bundle loaded or they render inert. A filter's Angle/Amount curve in the .motr is real & keyed even when
  it "looks" rig-driven — check the actual filter node's curve, not just the Snapshots copy.
- **DYLD_FRAMEWORK_PATH IS STRIPPED by SIP from any child the navi-node CLI re-spawns (g5,g6 — cost real time).**
  `nohup`/`setsid`/`timeout`/`sudo`/subprocess ALL strip it → `ozengine.init_engine()` dies with "Library not
  loaded @rpath/ProAppSupport". `echo $DYLD…` shows it set but the CHILD's `printenv DYLD…` is empty. TWO fixes:
  (a) background with a BARE `&` (+ `disown`) which preserves the env (do NOT use nohup/setsid — setsid isn't even
  installed here); (b) inside python, `os.environ['DYLD_FRAMEWORK_PATH']=…; os.execv(sys.executable, …)` to
  self-reexec (homebrew python is not SIP-protected so dyld honors DYLD on the re-exec). score_slug.py works only
  because it's invoked DIRECTLY with DYLD inline. Any batch/loop scorer you write must do (a) or (b).
- **GLOBAL RENDER MUTEX IS MANDATORY — one ozengine render on the box at a time (g2/g5/g6/g8 all wedged; FIXED in
  HEAD commit 1adda2d).** Concurrent unlocked GL renders crash `NSInternalInconsistency … FFCreateSharedCGLContextObj
  failed (masterShareGroup=0)` and POISON the shared GL master context SYSTEM-WIDE — even solo renders then fail until
  load clears. A per-worker lock does NOT help (other workers ignore it). The pool uses ONE shared lockfile
  `/tmp/oz_render_global.lock` (O_CREAT|O_EXCL PID-file with dead-PID stale-reclaim, acquired automatically by
  ozengine.init_engine — NOT the old `/tmp/fct_gl_render.lock`/fcntl.flock this doc once said). If you import
  ozengine you already hold it. If EVERY worker's render is failing at init, it's contention — not your code; wait
  for load to drop. If YOUR render sits at 0% CPU forever, the lock is held by another (possibly wedged-but-alive)
  worker: `cat /tmp/oz_render_global.lock` → `ps -p <pid>`. Don't kill another worker's proc — report the wedge.
- **animation_end_seconds is WRONG for Stylized & several Movements — the authoritative span is scene `<playRange
  duration>` (g5,g6).** render_gt's keyframe-max heuristic over/under-shoots badly: Stylized__Center 0.596 vs
  playRange 5.305 (too SHORT), Center_Reveal 3.0 vs 0.634 / Heart 5.94 vs 2.50 / Loop 5.54 vs 1.97 / Up-Over 9.98
  vs 3.14 (too LONG → black/dark tail); Movements__Drop_In 3.17 vs 1.50 (2.11× overshoot), Smear 1.13 vs 0.40
  (2.83×). Parse `<playRange offset=… duration="V S 1 0"/>` (7680000 timebase → V + S/timebase seconds) as the span
  base, keep A-return trim on top. ✅ SHIPPED (g5b, render_gt.py `_clamp_to_playrange`): clamps a MOVEMENTS-family
  animation_end down to playRange when it overshoots >1.5×, EXCEPT when the template carries an effect filter
  (DirectionalBlur/Smear). Fires on **Drop_In ALONE** across all 65 (7.74→9.23, +1.49). ⚠️ Smear's clamp was
  RETRACTED — empirically it REGRESSES (−0.17dB): swept end {0.40..1.13}s, unclamped 1.13 is BEST. Smear's residual
  is g1 rig-direction (headless never composites the GUI B-face), not timing — shrinking the window resamples the
  same wrong content. The separating signal for "safe to clamp" is the EFFECT-FILTER presence (Drop_In=pure spatial
  settle-keyframe leak; Smear=Flash-class effect overshoot), NOT the tail. So: clamp bare spatial-motion overshoots;
  do NOT clamp effect-filter overshoots. BUT playRange alone is NOT a full fix for the long Stylized scenes (Center
  still oscillates & ends-on-A under linear `t=i/23*end`) — those need a REVERSE-RAMP remap (see snippet below; the
  earlier "retime-curve" theory was WRONG). For overshoot-to-BLACK tails, also wire `render_gt._visible_end_seconds`
  (black-trim) into the scorer — it's implemented but score_slug.py only calls `_areturn_end_seconds`; adding it is
  +4-6dB on Heart/Center_Reveal for free (non-monotonic slugs like Heart/Loop need care — a single binary search
  lands on the wrong plateau).
- **THE COLOR MODEL IS CORRECT & NEAR-UNIVERSAL — don't re-derive it (g8, definitive).** GAM per-channel
  `out=255*gain*(v/255)^gamma` {R:1.102/0.978, G:0.991/0.898, B:0.958/0.835} hits the ProRes noise ceiling
  (~37dB) on 38 clean pure-source-A f0 frames; a fresh log-log refit reproduces it to <0.01, and it BEATS both the
  textbook sRGB→709 OETF (30.8dB) and a linear diagonal-gain model (35.3dB) by ~1.7dB. Headless raw f0 is
  BYTE-IDENTICAL across all transitions (= conformed source A), so any per-transition GUI-f0 difference is FCP
  COMPOSITING, not color. The "Flash/Lens_Flare f0 = no darkening" anomaly is a CONTENT effect (the flare already
  brightens f0) — do NOT special-case Lights color; it costs one frame. Currently applied in scoring (option b,
  zero-risk); the drop-in oz_render.mm writeback LUT patch (option a) is in COLOR_FINDINGS.md — if you land it,
  REMOVE `color()` from score_slug.py/gui_scoreboard.py in the SAME commit (else double-applied) and serialize
  with g1/g2's oz_render.mm work.
- **360° family: the readback ROI is hardcoded `{0,0,1920,1080}` but 360° scene aperture is 4096×2048 with content
  CENTERED (g2).** So headless grabs the TOP-LEFT CORNER → content jammed bottom-right, ~7dB. FIX (STEP A, ~5 lines,
  orthogonal to rig): query scene bounds via `OZScene::getSceneBounds` (mangled
  `__ZN7OZScene14getSceneBoundsEP6PCRectIdE`) and, if `w>=3072`, center a 1920×1080 window: roi.x=(w-1920)/2,
  roi.y=(h-1080)/2 (empirically {1088,484,1920,1080}); keep {0,0,1920,1080} when aperture==1920×1080 (no regression).
  Recovers all 8 endpoints 7→17-19dB. STEP B (mid-frames, the real win, DO AFTER g1's rig fix): the push is a FLAT
  2D translate across the equirect canvas with NO wraparound — mid-transition the front view goes WHITE-empty. The
  mechanism is `PAEEquirectReorient` (uuid E61FE95E, "360° Reorient"/"360° Reorient Start" Pan(Y)=π) driven by the
  SAME rig/snapshot machinery g1 fixes; the pan resolves to zero headless → sphere never pans. It's rig-coupled, not
  a filter-registration gap (the reorient class IS registered). Full decode in 360_FINDINGS.md.
- **DON'T TRUST TASK-HINT MECHANISM NAMES — verify in the .motr (g5, g8).** Recurring: spawn text said "Smear=PAEScrape"
  but Smear uses built-in Motion filters `pluginName="Smear"`+`"DirectionalBlur"` (factoryID 13), NO PAEScrape exists;
  "Flash GUI f0 = no darkening → color exception" is actually a content artifact, not a color-model exception. grep
  the .motr `pluginName`/`pluginUUID`/factoryID before building for a named effect.
- **cliclick coords on FCP dialogs are UNRELIABLE** (retina/focus). Drive FCP GUI via AppleScript System Events
  `click button "X" of window/group` + key code 36 (Return)/53 (Esc); File>Import>XML imports into current library
  (avoids the library-picker). (GUI-GT capture only — most g-agents won't need this.)

- **⭐ SCOREBOARD WORKERS: score the worktree that HAS the fix, and `./build.sh` FIRST (s1 tripped this).** Each
  worktree has its OWN oz_render.dylib. s1 measured on w6 (h2's branch, discovery-order dylib) and reported Scale
  18.95 / Mask 17.68 / Duplicate flat — but h3's IDENTITY dylib lives on w4 and gives Scale 29.48 / Duplicate 22.71.
  A measurement worker on the wrong worktree reports STALE numbers and false "flat" verdicts for in-flight fixes.
  Before scoring: `cd <the-worktree-with-the-fix> && ./build.sh` (must exit 0), state WHICH branch/dylib you scored,
  and if an oz_render.mm fix is mid-flight in another worktree, either check out that branch or explicitly caveat
  that your board pre-dates it. Do NOT report a fix as "didn't land" without confirming you built its dylib.
- **⭐ FALSE REGRESSIONS under contention — re-verify any suspected regression in a QUIET single-process run before
  trusting it (h3).** A 56-slug no-regression sweep run while another worker monopolized the global render lock
  reported Reflection 12.23 / Clothesline 6.95 (looked like a regression) — those were PREEMPTED/black renders (CGL
  init instability). A clean single-process re-render confirmed BOTH byte-identical (21.08 / 17.60), NO regression.
  Rule: a sudden multi-dB drop on an UNRELATED slug is almost always a black/contended render, not your code. Re-run
  it alone (init_engine once, ideally when `ps` shows ≤1 other pool proc) before flagging a regression or reverting.

### TS-ENGINE pool gotchas (old pool; skip if you're headless)
- **CRITICAL harness setup (every agent hits this):** worktree engine dirs have NO node_modules. Before running any tsx/scorer: `ln -sfn ~/random/final-cut-pro-transitions/engine/node_modules ~/fct-worktrees/wN/engine/node_modules` (NODE_PATH does NOT work with tsx/ESM). REMOVE the symlink before committing (`rm ~/fct-worktrees/wN/engine/node_modules`) and `git status` clean.
- Scorer harness: use `start.png`/`end.png` (NOT .jpg) + pngjs, exactly like `test/push-directions.test.ts`. Copy its ImageData polyfill + loadPNG.
- **GT background is USUALLY BLACK (0,0,0) but NOT always** (Movements/Switch mid-transition is WHITE; verify per-target by opening f6/f12). An all-black frame can score HIGHER than mislocated content (Smear: black=12.44 vs engine 9.95) — don't be fooled; check content bbox placement vs GT, not just PSNR. Also confirm f0/f23 identities — a retime-wrap transition loops back so f23==A.
  ⚠️ Some slugs emit GENUINELY BLACK frames from the ENGINE (not GT, not a scoring artifact) — confirmed via clean
  isolated re-render, so do NOT try to "fix" them by re-sampling scene-time: Movements__Smear (5 black frames; e.g.
  f0-4 content, f6-16 FROZEN identical, f17-21 BLACK, f22-23 content), Movements__Multi-flip (2), Movements__Flip (1),
  Replicator-Clones__Multi (1). These are per-transition template-produces-nothing gaps for the mechanism owner.
- BASELINE.txt in test/ is STALE — do NOT trust it; always measure your own baseline with a scratch scorer against ~/fct-gt-cache. (Seen again: it showed Color_Planes 36.7dB when the real score was 10.42dB.)
- Engine & GT share the time domain: render_gt.py animation_end_seconds == engine animationEndSec. If your per-frame PSNR is fine early then collapses late, suspect the retime-wrap heuristic in api.ts (retimeWrapSec), not the transform.
- **retime-wrap needs a HALF-FRAME tolerance (p21).** api.ts wraps timeSec→0 once `timeSec > retimeWrapSec` (min drop-zone out). FCP samples each frame at its CENTRE time and shows wrapped-A once the drop zone has effectively timed out — a frame landing WITHIN half a frame of `out` (e.g. Lens Flare f13 @0.5658s vs A.out 0.5673s) should already wrap. Strict `>` leaves ONE stale crossfade frame at ~10dB. Now `timeSec >= retimeWrapSec - (1/fps)/2`.
- **A/B binding is NOT always document order (p21) — bind by fade direction.** `parseFootageClipAB` used to set referenced[0]=A, referenced[1]=B. Some templates author 'Transition B' BEFORE 'Transition A' → swap → image B at f0 → ~10dB everywhere. Fix: if BOTH drop-zone image nodes carry a `Fade In/Fade Out` behavior (factoryID 17) with opposite-signed net direction (Fade-In id 200 − Fade-Out id 201), assign the fade-OUT clip = A (outgoing), fade-IN = B (incoming). Applied ONLY to plain both-fades crossfades (mask-reveals like Center Reveal have no fades → keep doc order). Affects Lens_Flare, Divide.
- **Clone-Layer STATIC 3D pre-rotation must be an OVERRIDE channel, not retime-ramped (p20).** buildTransformMatrix's Retime static-position heuristic (resolveWithRetime) ramps a static channel from 0 → a Clone's fixed back-face fold (rotationX = −π/2) sits ~face-on mid-transition instead of edge-on (back face bleeds through full-frame too early). Fix in evaluator/index.ts: for `layer.type==='clone'` with a static (number, non-zero) rotationX/rotationY, add `rotX`/`rotY` to `__overrideChannels`. Scoped to clones so Reflection's non-clone driver pre-rotations keep behavior.
- **Parser export is `parseMotr` (NOT parseScene).** Other exports: `createTransition`, `createBenchTransition`, `loadGT` (from test/gt-cache.js). An evaluated layer exposes `localTransform`/`worldTransform` Float64Array matrices + `layer` (not a flat `.transform`) — read world matrix element [12] for net X translation to spot off-screen content.
- **PIL/montage env:** system python3 has no PIL and `pip install` is PEP668-blocked. Use `~/random/final-cut-pro-transitions/venv/bin/python` (has PIL+numpy). RUN IT FROM `~` — a stray `/tmp/dis.py` shadows stdlib `dis` if cwd is /tmp and crashes imports. No imagemagick `convert`; downscale frames with `sips -Z 480 in.png --out out.png`.
- **`driverChannelValue` reads the driver's RAW authored transform** — it does NOT apply the driver's own rig behaviors or self-links. Correct for Push (slide baked into driver's position curve) but WRONG for pivot rigs whose driver is itself rigged/self-linked (Switch). Use/extend `resolveDriverChannel` (applies driver rig + self-links, non-recursive) when a Link source is itself driven.
- **Direction/discrete widgets are 0-BASED index** (`value` IS the array index); the "Pop-up" widget is 1-based (`value-1`). Snapshot arrays are read in DOCUMENT order, and Push relies on doc-order==widget-value even though its snapshot `id`s are scrambled (2,1,4,3) — do NOT switch to id-based indexing, it breaks Push.
- **Rig-Behavior `/204` snapshots drive a Link's SCALE per direction** ([1,-1] etc.), matched by `Affecting Object == linkId`. Beware this scale polluting position/anchor links you didn't intend (it flipped Switch's position to -2363 → off-screen black).
- **SHARED FILL/MASK GATES REGRESS SIBLINGS (bounced p2 AND p7).** The relaxed solid-fill acceptance
  (needed for Center's decorative cards) OVER-PAINTS other scenes' stray Fill-Mode-0 shapes that must
  stay transparent (Panels_Across 'White line' 810702, 'Rectangle 8' 808468 → 14.60→13.46). FIX =
  make the gate SCENE-AWARE: a scene with ANY `isSolidPanel` shape (offset-authored panel) is a panel
  scene → do NOT relax-fill its non-panel Fill-Mode-0 shapes. Center has 0 isSolidPanel, Panels has 7 —
  verify that discriminator empirically. `isSolidPanel` is set per-LAYER AFTER parseShape, so a
  scene-level flag needs a two-pass (parse all → if any isSolidPanel, strip relaxed fill from non-panels).
- **`parseShape` NOW TAKES 3 ARGS**: `parseShape(node, factories, linkSourceIds)`. p7's clone-mask work
  added the extra params; a stale 1-arg call at parser/index.ts:1426 (inside the `type==='clone'` block)
  is the single most common rebase tsc break. `grep -n 'parseShape(' src/parser/index.ts` and fix ALL sites.
- **factoryID `<factory>` table ≠ runtime path.** A motr can define Replicator(19)/Cell(20) yet use none
  of them at runtime (Multi p3 is a rig-driven multi-drop-zone, not a replicator). Framing camera=factory 3;
  Camera=factory 24; Clone Layer=factory 8/9/15/16 (varies). Enumerate ACTUAL scenenode factoryIDs first.
- **`& ; sleep 22; cat` STILL trips the 5s wall (p16, p24 hit it repeatedly).** A shell `(...) &` does NOT
  detach fast enough — the tool blocks until the child forks and the 5s timer fires anyway. Use the bash tool's
  `background: true` FLAG (own arg), then in a SEPARATE later call just `cat /tmp/pN.log` (no `sleep`). Every
  scorer/dump/tsc run must be `background:true`. (The old `& ; sleep` snippet below is deprecated — ignore it.)
- **GROUP-OPACITY GATE HIDES CHILDREN (p16 burned ~8 turns).** A rig Opacity behavior gates a whole GROUP's
  opacity to 0; its child image layers still report their OWN opacity=1/visible=true. A naive walk that lists
  `type==='image' && opacity>0` will FALSELY show hidden cards. To know what actually renders, check the PARENT
  group's `.opacity`/`.visible` (renderGroup skips op=0 groups). Multi-variant templates (Slide: 6 card sets;
  one per Pop-up index) rely on exactly-one-group-visible gating — verify at MULTIPLE frames, not just one.
- **Offset-authored panels apply to IMAGE/media layers too, not just solid shapes (p16 Slide).** A factory-5
  Image layer (bundled PNG via `relativeURL`) can carry `timing offset=T` + a Position X curve keyed at NEGATIVE
  local times; local_time = scene_time − offset. The engine already handles this; verify card X against the motr
  before assuming a positioning bug. Bundled tile PNGs live in the template's `Media/` dir (RGBA, real alpha).
- **Rig-driven COMPOUND (color) filter overrides silently NO-OP (p16).** `computeFilterOverrides` only resolves
  SCALAR snapshot values; a Colorize accent snapshot is a compound Red/Green/Blue param → the loop `continue`s and
  the filter falls back to its STATIC default (e.g. Aqua teal) — NOT the rig-selected accent. If a filter looks
  un-rigged, this is why. (Fix pattern: detect the rig widget by name and set a sentinel override.)
- **PSNR-vs-visual TRAP (p16, big time sink).** A visually-CORRECT fix can score LOWER because a co-located
  geometry/coverage error is being masked by the wrong-but-darker old output (e.g. teal cards beat correct
  grayscale cards because teal≈image-dark in mis-covered regions). Don't abandon a fix the montage confirms is
  right — hunt the coverage/scale/motion-blur error that's eating the gain. Dump a montage EARLY, trust it over PSNR.
- **A GT-frame `read` can trigger a provider_internal error (p28) and derail the turn.** If `read` on a GT PNG
  fails with "model provider returned an error", DON'T re-read the same image — sample its pixels via the venv PIL
  path (avg/center RGB) instead of loading it into vision. Numeric color sampling is often all you need anyway.
- **Motion Path is a `<behavior>`, NOT a `<scenenode>` (p25).** The parser:1507 skip-list only skips SCENENODES
  of those factory types; Motion Path parsed as a `<behavior>` is a different code path. Confirm how your target's
  behavior is actually represented before "removing it from the skip-list". Some Motion-Path scenes drive Emitters
  (particles), and the real A→B is elsewhere (Clone Layers) — find the transition-carrying layer first.
- **Direction/discrete widget value is NOT always the array index (p13).** Push's Direction snapshots declare
  Values [0,1,2,3] (value==index) but Movements/Switch's Direction declares Values [1,2] with node ids [2,3]
  (value 1 = "From Left" = ORDINAL index 0). Resolve the widget value → ordinal by matching the widget's
  `<Snapshots id=101>` child `Value` entries (NOT `snapId-1` — Switch ids start at 2). p13 added
  `resolveDiscreteWidgetOrdinal(sn,num)` in parser (returns ordinal position of matching Value, undefined→fall
  back to value-as-index so Push stays 4/4). Getting this wrong flips a Link's rigScale sign (Switch: +1↔-1)
  → pivot lands at -2512 instead of +2512 → content off-screen.
- **CHAINED Link pivots need RECURSIVE cross-link resolution (p13).** `resolveDriverChannel` originally read a
  link source's rig+SELF-links only. Switch's Transition A copies anchor/pos from a chain A→CloneB→B→driver;
  reading CloneB naively returned its raw (identity) transform → A rotated about scene origin. Fix: thread
  `layerById`+`linksByTarget`+`visited` into resolveDriverChannel and recursively apply the source's CROSS-links
  (sourceObjectId≠self) targeting the same channel/prop (mix-blend + range clamp), visited-guarded against cycles.
- **retime-wrap MUST be disabled when a continuation Clone Layer spans past the wrap point (p13).** api.ts's
  retimeWrapSec = min drop-zone `timing.out`. Switch's Transition B times out at 0.90s but a `type:'clone'`
  Clone B (in=0.934s, out=1.735s=animEnd) continues the fan animation — freezing to frame-0 collapsed frames
  12-23 to full-frame A. Added a `hasContinuationClone` check (any clone whose `timing.out > retimeWrapSec+frameSec`)
  that disables the wrap, alongside the existing filled-shape-overlay disable. This is the retime-wrap gotcha in a
  new guise: fine early, collapses at the exact frame progress×endSec crosses the min drop-zone out.
- **Flat coplanar image/clone groups: Motion draw order is LAST-listed = TOP (p13, unsolved lever).** The
  compositor renders group children in REVERSE (`i=len-1→0`, so FIRST child blits last = on top) — correct for
  3D/depth hinge groups (Rotate/Reflection) but INVERTED for a flat 2D multi-image group. Switch's [Clone B, A, B]
  needs last=top (GT: B-on-top early when all visible, A-on-top late after B times out). p13 left this unfixed
  (needs a scoped forward-order path for camera-less all-image/clone/generator coplanar groups; don't flip globally
  — guards depend on the reverse loop).

- **animationEndSec can be WILDLY wrong for replicator/framing scenes — parser reports 17.4s, GT
  renders at 1.0s (p11 Video_Wall).** render_gt's `animation_end_seconds` recursively scans keypoints
  and picks up the Framing behavior's Offset-Path X/Y curves keyed at NORMALIZED time 1.0 → end=1.0s.
  The engine's @xmldom curve walk MISSES those X/Y curves (maxT=0) and falls back to the raw scene
  `duration` (17.4s). Symptom: framing behaviors expire (out<2s) but you sample scene-time 0..17.4 →
  camera pose is post-window for every frame → engine renders a FROZEN full-A. Diagnose FIRST via
  `python3 -c "import render_gt; print(render_gt.animation_end_seconds(motr))"` (run from tools/, it
  can't dlopen Ozone standalone but animation_end_seconds is pure-XML and works). If it disagrees with
  the engine's animationEndSec, that's your bug — the transition is on the wrong time domain.
- **A FILTER/behavior curve keyed PAST its owner's `<timing out>` inflates animationEndSec (p24 Static, +0.4dB
  + fixed the whole time domain).** The parser's animEndSec keyframe scan walks ALL <curve>s including <filter>
  intensity curves. Lights/Static's PAEBadTV Waviness/Roll/Static/Saturate curves are keyed to 0.8008s but the
  filter times OUT at 0.6673s (=playRange) → animEndSec inflated to 0.8008 → every frame sampled ~1 frame late,
  the A→B cut + static stall. FIX (principled, generic): in the ancestor walk, capture the nearest enclosing
  `<filter>`'s `timing.out` (filterOutSec) and CLAMP each filter-owned keyframe to it — a filter can't affect the
  frame after it times out. Same class as the Amount/Angle exclusion but works for any filter. This is the #1
  diagnostic when a Lights/analog-effect scene renders its cut one frame late.
- **A GROUP's `<filter>` is applied to the COMPOSITED group buffer (p24).** parseLayerElement puts `<filter>`
  children of a `<layer>`/`<group>` into `layer.filters`; the compositor renders the group's children to a temp
  buffer then runs `applyFilter(buffer, filter, ...)` at scene time (curves evaluated at scene time). So to make a
  group-level effect (PAEBadTV desaturate/roll on the A→B drop zones) just register the filter by UUID — no special
  wiring. BUT gate it: `Filter` now carries `timing` (parsed from `<filter><timing>`); applyFilter returns identity
  when scene time is outside [in,out]. WITHOUT the gate, Motion holds a param curve's endpoint value past the
  first/last key (Static's Saturate holds 100 → satScale 2 → over-saturates the clean f0/f23) and corrupts the
  endpoints. Any new timed filter needs this gate.
- **retime-wrap min must EXCLUDE invisible bundled-media layers (p19b, +7dB Wipes/Diagonal).** api.ts computes
  retimeWrapSec = min `timing.out` across drop zones with retimingExtrapolation===1. A decorative always-invisible
  asset (source.type==='media' — e.g. Wipes/Diagonal's "Flash Shape" shape.png, opacity 0, out=0.033s) was gating
  the min → every frame past prog≈0.12 wrapped to time 0 (full A). FIX: in the scan loop, `if (l.type==='image' &&
  l.source?.type==='media') { scan(l.children); continue; }` — only transitionA/transitionB drop zones express "the
  A→B footage timed out". Also: fire the wrap at `timeSec >= retimeWrapSec` (NOT strict `>`) so the final +1 GT frame,
  whose wrap coincides with animationEndSec (Diagonal: TransA out == animEnd == 0.267s), wraps back to A (f23 10.3→41.5).
  Guards unaffected (their wrap is strictly < animEnd so they already wrapped under `>`).
- **STENCIL/SILHOUETTE (blend 25–28) mask groups need a Y-FLIP on their lifted shapes (p19b).** When a "Masks" group
  with blend mode stencilAlpha/Luma/silhouette* is lifted (isMaskGroup) to clip sibling content, its Bezier/shape
  edges rasterize into their OWN stencil frame — passing them through the normal Y-up→Y-down flip double-inverts and
  produces a VERTICALLY-MIRRORED band (slant flipped top↔bottom, verified pixel-exact). `rasterizeShape` now takes a
  trailing `flipY=false` param; set it TRUE **only** for masks lifted from a stencil/silhouette group. Scoped: image-mask
  reveals, clone self-masks, panel/flash fills all pass flipY=false → no other transition changes. Diagnose a mirrored
  wipe by measuring the B-band top/bot y at x=100 vs x=1800 in engine vs GT — opposite slope = need the flip.
- **Channel Mixer filter params are NESTED, not flat (p28).** Motion nests per-channel weights under output-group
  params: "Red Output" has children "Red - Red"/"Red - Green"/"Red - Blue" (likewise Green/Blue Output). The
  channel-mixer branch in compositor/index.ts::applyFilter read them at TOP level → matrix stayed IDENTITY → channel
  isolation (Color Planes keep-only-R/G/B) NEVER applied. FIX: flatten top-level params + one level of children
  before matching "Red - Red" etc. Same trap for any Motion filter whose weights live under an output-group parameter.
- **retime-wrap fires ONE FRAME EARLY on A→B reveals whose end is B (p29, +Fall/Rotate/Reflection).** When the
  outgoing "A" drop zone (carrying the moving transform) times out ~1 frame BEFORE animEnd while a distinct
  later-incoming B drop zone outlives it and reaches animEnd, the generic wrap-to-A snaps the final frame B→A (f23
  collapses ~10dB). FIX = `detectRevealEndWrapCancel(scene)` in api.ts: cancel the wrap when it sits within ~1.5
  frames of animEnd AND a later-incoming drop zone outlives the earliest-timing-out one. Structural (drop-zone timing
  only, no name/GT constant); fires on 11 transitions; excludes co-timed loop-backs (Swing/3D Rectangle/Vertigo have
  wrap==animEnd but no distinct later-incoming outliving DZ). Registered in no-hardcode.test.ts.
- **Scratch .ts in /tmp CANNOT import `../src/` (p25, p28).** `npx tsx /tmp/x.ts` → MODULE_NOT_FOUND on the engine
  source. Write probes into `engine/test/_pN_*.ts` (import `../src/parser/index.js`) and delete before commit.
- **`declare -A` (bash assoc arrays) FAILS on the Mac's /bin/bash 3.2 (p29):** `declare: -A: invalid option`. Use a
  plain `run(){ ...; }` function + positional calls for multi-target scorer loops, not associative arrays.
- **MEASURE A CHANGE'S SIBLING IMPACT WITH `git stash`, don't guess (p20).** To get a clean before/after on the guard
  set: `git stash` (leaves your untracked `test/_pN_*.ts` scorers in place — only tracked src is stashed), score the
  siblings on the pre-change base, `git stash pop`, score again. Diffing pinpoints exactly which sibling regressed
  (p20's static-rotation fix quietly cost Reflection −0.23 — invisible without the A/B diff). Far faster than eyeballing.
- **A `process.env.PN_X` sweep hook can change a code path merely by BEING SET (p20 burned ~4 calls).** p20's
  `P20_CAMZ` hook returned a DIFFERENT score at its identity value (2000) than the clean baseline, because a SECOND
  branch (the PAEFlop `FLIP_CAMERA_Z` path) also read the env. When a sweep's "no-op" value disagrees with baseline,
  your hook is leaking into another branch — trust the git-stash before/after, not the hook's baseline row. Keep each
  env hook to ONE read site.
- **DON'T launch a new `background:true` job while a prior stuck one still writes NEAR the same log (p20).** Two
  concurrent `... > /tmp/pN.log &` writers (esp. after a timed-out foreground `(...) &` that keeps running) interleave
  and produce garbled output (stray `\0`, half-lines) → you re-run several times. Give each background run a UNIQUE
  log path (`/tmp/pN_<tag>.log`) and confirm the previous job finished (`DONE` marker) before starting the next.
- **Transient provider 400 on `read` of a GT image can nuke the turn (p28).** Prefer the PIL montage path (dump →
  sips → paste all frames → `read` ONE montage) over many single-image `read`s; if a lone image read 400s, retry via
  montage rather than re-reading the same image. ALSO: after re-rendering, `read` of a montage that overwrote the same
  path can show a STALE cached image (p26 chased a "no-change" ghost for ~4 turns) — re-`read` the SINGLE frame file to
  confirm, or write montages to a fresh path per iteration.
- **The `<group>` handler parses ONLY Links — NOT group-level `<behavior>`s or a group `<mask name="Image Mask">` (p17).**
  parseLayerElement/parseSceneNode's group branch historically dropped a group's Spin/Fade behaviors and its Image Mask
  (only `parseLinkBehaviors` ran). Combo/Clone Spin's C1–C6 groups carry a group-level Spin (the ring rotation) AND an
  `<mask>` whose Mask Source is a concentric-circle shape — both silently ignored → rings never spin/clip → full-frame A.
  FIX: run `parseLayerBehaviors(el,factories)` on groups too, and add a `parseGroupImageMask` (mirror the scenenode
  `<mask>`→imageMaskSourceId/Invert logic). Any group-level effect (Spin/Fade/Image-Mask) needs this.
- **DISABLED nodes (`<enabled>0</enabled>`) with a PADDED `out` inflate the animationEndSec fallback ~10× (p17).** When a
  scene has no real content keyframes the parser falls back to `max <timing out>`; Motion authors hidden driver /
  mask-source shapes (Combo Spin's "Shape Masks" C1–C6, enabled=0) with out=9.977s while the visible content ends at
  0.9676s → progress≈time/9.977 stays ~0 → every layer sampled before it enters → plain-A render. FIX (generic): in the
  fallback maxOut scan, SKIP timings whose owning node is `<enabled>0` AND skip container `<layer>`/`<group>` elements
  (count only leaf `<scenenode>`/`<behavior>` timings — a container's padded out mirrors its disabled child). Same
  time-domain class as the filter-curve-overshoot gotcha, new cause. Combo→0.9676s, Clone→1.969s after.
- **Spin behavior (factory 22) is RAD/SEC and accumulates over ITS window, in RADIANS (p17, decompiled OZTransformNode::computeSpin).**
  `angleZ(t)=rate*(clamp(t,in,out)-in)`, held after `out`. Combo Spin rate 3.2468 rad/s over 0.9676s = exactly π (the
  A↔B card flip). The old evaluateSpin used degrees + `rate*t` (no window) — wrong. Compose as a Z-rotation about the
  layer's own origin (local space) so it pivots with the group. Scope to layers that actually carry a Spin.
- **A stroke's half-width SCALES with the instance transform — a big-scale replicated arc covers the frame even at ~0%
  write-on (p26).** A 52px stroke at cell scale ~9× → halfW≈229px disc; a 0.2%-drawn arc of a huge ring still stamps a
  frame-spanning blob (coverage 79% at f1 when it should be ~2%). A single global write-on offset on ALL instances makes
  the reveal near-instant. FIX: PHASE-STAGGER the write-on across the pattern — instance at normalized pattern position
  `p` uses `lastOffset=clamp((globalFront - p)/band, 0,1)`. WARNING: tuning `band` to peak PSNR is a HARDCODE trap (p26
  correctly resisted band=6 for +0.2dB); keep band=1/N (sequential build, param-free).
- **A REPLICATOR can be the geometry source for an Image Mask, but `resolveImageMaskAlpha`'s `walk` only handled
  shape+clone (p26).** Add a `replicator` branch: generate the instances, resolve the cell's shape (`cellSourceId`),
  and push one mask entry per instance at its composed transform (worldTransform · T(x,y)·Rz(angle)·S(scale)). This is
  the same replicator-geometry-as-mask pattern as Duplicate/Vertigo — reuse it for any grid/dot/spiral replicator reveal.

## Reusable snippets / how-tos (populated by retro loop)
- Scoring: use createBenchTransition(motrPath,{outputWidth:1920,outputHeight:1080}) from test/gt-cache.ts.
  It injects the media resolver. GT frames at ~/fct-gt-cache/<SLUG>/frame_%04d.png.
- PSNR = 10*log10(65025/mse) over RGB channels only, averaged over 24 frames.
- **Ready-made scratch scorer** (write to engine/test/_pN_score.ts, DELETE before commit; score with test/start.png+test/end.png):
  ```ts
  if(typeof globalThis.ImageData==="undefined"){(globalThis as any).ImageData=class{data;width;height;constructor(d,w,h?){this.data=d;this.width=w;this.height=h??d.length/4/w;}}}
  import {createBenchTransition,loadGT} from './gt-cache.js';import {PNG} from 'pngjs';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
  const loadPNG=(fp)=>{const p=PNG.sync.read(fs.readFileSync(fp));return new ImageData(new Uint8ClampedArray(p.data),p.width,p.height);};
  const psnr=(a,b)=>{const n=Math.min(a.data.length,b.data.length);let m=0;for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];m+=d*d;}m/=(n*3/4);return m===0?99:10*Math.log10(65025/m);};
  const MOTR=process.argv[2], SLUG=process.argv[3], GT=path.join(os.homedir(),'fct-gt-cache',SLUG);
  const A=loadPNG(path.resolve(import.meta.dirname,'start.png')),B=loadPNG(path.resolve(import.meta.dirname,'end.png'));
  const tr=createBenchTransition(MOTR,{outputWidth:1920,outputHeight:1080});
  const f=fs.readdirSync(GT).filter(x=>x.endsWith('.png')).sort();let s=0,c=0;const per=[];
  for(let i=0;i<f.length;i++){const g=loadGT(path.join(GT,f[i]));const r=tr.render(A,B,i/(f.length-1));const v=psnr(r,g);per.push(v);if(isFinite(v)){s+=v;c++;}}
  console.log(SLUG,'mean',(s/c).toFixed(2)+'dB');console.log(per.map(x=>x.toFixed(1)).join(' '));
  ```
  Run via the bash tool with `background: true`: `cd engine && npx tsx test/_pN_score.ts "<motr>" "<SLUG>" > /tmp/pN.log 2>&1` — then `cat /tmp/pN.log` after the completion steering msg (do NOT `(...) &`/`nohup`/`sleep N;cat` — all trip the 5s foreground wall).
- **Visual montage** (engine-top / GT-bottom, then `read` the PNG inline): dump 6 engine+GT frames to /tmp,
  `for i in 0 6 11 12 17 23; do sips -Z 480 p_eng_$i.png --out p_eng_${i}_s.png; done`, then from `~`:
  `~/random/final-cut-pro-transitions/venv/bin/python` a PIL script that pastes eng row over gt row → /tmp/montage.png → `read` it.
- **A/B avg-color probe (run TURN 1 — see spawn-template #19; catches silent A/B swaps):** if GT f0's mean RGB
  matches end.png (not start.png), the GT plays B→A → base=imageB, reveal=imageA.
  `~/random/final-cut-pro-transitions/venv/bin/python -c "from PIL import Image;import numpy as np,os;E='<engine>/test';G=os.path.expanduser('~/fct-gt-cache/<SLUG>');m=lambda p:np.asarray(Image.open(p).convert('RGB')).reshape(-1,3).mean(0).astype(int);fs=sorted(f for f in os.listdir(G) if f.endswith('.png'));print('start.png(A)',m(E+'/start.png'),'end.png(B)',m(E+'/end.png'),'GTf0',m(os.path.join(G,fs[0])),'GTf23',m(os.path.join(G,fs[-1])))"`
- **Static-GT probe (run FIRST if your target may be degenerate — see spawn-template #17):** delta 0 = frozen A.
  `~/random/final-cut-pro-transitions/venv/bin/python -c "from PIL import Image;import numpy as np,os;GT=os.path.expanduser('~/fct-gt-cache/<SLUG>');fs=sorted(f for f in os.listdir(GT) if f.endswith('.png'));f0=np.asarray(Image.open(os.path.join(GT,fs[0])).convert('RGB')).astype(int);print('maxdelta',max(np.abs(np.asarray(Image.open(os.path.join(GT,f)).convert('RGB')).astype(int)-f0).max() for f in fs))"`

## Per-transition mechanism notes (from merged agents)
- BLURS (Blurs__*, h5/g8b — structural signature so you don't re-decode): Directional (27.76, reference bar)
  has behaviors = {factoryID 5 'Fade In/Out'} ONLY, NO rig, and a DIRECT animated Amount curve on the LIVE
  PAEDirectionalBlur (0→300@0.3s→0) → headless evaluates it → tracks GUI. Gaussian/Radial/Zoom (26.4/23.7/21.8,
  ~8× too weak) each carry {factory-5 fade + 9× factoryID-11 'Rig Behavior'} driven by a "Pop-up" widget
  scenenode (Gaussian id 989373854, 4 snapshot states); their LIVE filter Amount is a DEAD 0→0 stub (Radial has
  NO Amount at all, driven by Angle 0→3.316→0; Zoom Amount is a static 100). Real animated Amount lives in the
  Rig-Behavior Snapshots subtree. Rig Behavior N `channelBehavior affectingChannel="./10001"` = the filter Amount
  target. Fix = the shared rig-eval CLAMP bug (see gotcha "RIG-BEHAVIOR PARAMETER-PUSH is CLAMPED"), NOT a blur- or
  render_gt-specific change; defer to g1's serial slot. Directional is the untouched control/quality bar.
- WIPES/DIAGONAL (Wipes__Diagonal, p19b 15.22→38.46 committed f117303): a growing diagonal BAND of B revealed
  over full-frame A. Structure = "Main" group holds [Flash Shape (invisible bundled asset, IGNORE), "Masks" group
  (blend 25 stencilAlpha, 2 Bezier shapes), Transition A]; Transition B is a separate root layer below. The two
  Beziers (Top rotZ=-π @posY 294→947 up, Bot rotZ=0 @posY -200→-942 down) are wide quads whose UNION covers 99.9%
  at f0 and separates to 0% by prog=1 → the GAP between them is the B-band. animationEndSec=0.267s (mask keyframe
  end); f23 is a retime-wrap-to-A frame. NOT a new mechanism — two compositing bugs (see Known gotchas: retime-wrap
  invisible-media gate + stencil-group Y-flip). Guards all held. REMAINING: mid-band width slightly off (engine band
  wider than GT near center) caps it ~38 vs Wipes/Mask's 42.
- STATIC (Lights__Static, p24/w6 21.14→21.67 committed 069b213): analog-TV static over an A→B cut. Structure:
  "Static A" = a bundled grayscale `Media/static.mov` overlay (image layer, opacity envelope 0→1→0.5→…→0, ON TOP);
  "Static B" GROUP carries a **PAEBadTV** filter (UUID 32AB5EE1-…) over its children [Noise (PAENoise generator,
  factory 5, no A/B source — largely inert here), Drop Zones (Transition B authored BEFORE A — swap gotcha)].
  factory 5 = Generator, factory 7 = footage clip / drop zone. media resolver reverse-maps clipTime = dur − sceneT
  by default (static.mov 0.884s resolves fine at all times). Three real fixes: (1) filter-curve-clamps-animEndSec
  (0.8008→0.6673, biggest lever); (2) filter-timing gate (restore f0/f23=50dB); (3) generic PAEBadTV primitive
  (badtv.ts) driven by the .motr's Saturate/Roll/Waviness/Static curves (Saturate scale=1+Saturate/100, Rec.601 luma;
  Roll=vertical scroll; Waviness=per-row sine dx; Static=additive hash-noise). REMAINING (caps ~21.7): engine still
  recovers to full-COLOR A around f14–19 where GT is still grayscale static — the static.mov overlay + BadTV
  desaturation aren't dominating the drop-zone content there (z-order / overlay-opacity coverage in the mid window is
  the next lever). The GPU HgcBadTVNoise composite kernel (chroma-shift + scanline, in Filters.bundle) is only
  partially reproduced — full decode would tighten the mid frames.
- SWITCH (Movements__Switch): rotating-hinge rig. Hidden DISABLED Color Solid (id 1999871259) is the driver:
  master rotationZ curve + per-aspect Position rig (Widget 1999871176) + a SELF-LinkPos copying its own
  positionX→anchorX (driver stays centred while rotating about a far-right pivot ≈2363/2512). A/B copy
  position+anchor+rotationZ via LinkPos/LinkAnchor/LinkRot. p6 fixes: LinkAnchor X/Y→'anchor' not 'position';
  resolve driver's own rig+self-links before a Link reads it (`resolveDriverChannel`); absolute links win over relative.
- SWITCH mid-transition SOLVED to ~12.2 (p13, from 10.33). It is 2D (not 3D): two full-frame drop zones + a
  Clone B, all reading rotation `109/3` from the hidden Color Solid driver — Transition A scale=+1, Transition B
  scale=-1 (fan open). Pivot: driver anchorX self-links to positionX≈2512 (rig-selected via aspect Widget). Three
  fixes landed +1.9dB: (1) resolveDiscreteWidgetOrdinal (Direction value 1→ordinal 0, un-flips the -2512 pivot);
  (2) recursive cross-link chain resolution (A's pivot chains through Clone B→B→driver); (3) hasContinuationClone
  disables the retime-wrap so frames 12-23 keep animating instead of freezing to A. Guards all held (Push 4/4,
  Rotate 33.26, Wipes/Mask 42.32, Blurs 48.33, 360°Push 45.95, Flash 24.98, Reflection 13.41). REMAINING: z-order
  (flat-group last=top, above) + rotation-magnitude/timing of frames 4-6 still ~9-10dB.
- LIGHT_NOISE (Lights, p12 ~9.4): `light-effect-02(screen).mov` overlay, Blend Mode id=203 value=**10=Screen**.
  The engine ALREADY has: parser value-10→'screen', blend.ts screen math (1-(1-a)(1-b)), media-resolver ffmpeg
  extraction. Infra is present — the gap is wiring the resolved overlay-clip frames through the screen blend at the
  right opacity/timing over the A→B base. Don't re-decode Screen; check why the overlay layer isn't composited.
- LIGHT_SWEEP (Stylized/Cinema, p9 8.66→44.05): bespoke `detectLightSweep` compositor path. GT f0=A with navy
  border, f11/f23≈solid dark navy (NOT image B — the sweep fades to a dark cinematic frame). Detector was bounced
  for a 65-transition inertness proof (must fire ONLY on Light_Sweep) — required a self-rebase onto p7/p2/p3/p6
  main (parseShape now 3-arg; keep both swatchColor AND isSolidPanel/panelFill/linkSourceIds append-style).
- LOWER (Stylized/Kinetic, p14 ~11.27, sibling of Center): ~61 shapes — decorative cyan/white sliding panels +
  a Mini Drop Zone (top-right thumbnail of A) + panel-wipe masks. Shares Center's Fill-Mode-0 solid-card gate.
  Engine bugs: background stays on A too long (B should cross in by ~f4), white panels too opaque, mini drop-zone
  renders white boxes instead of the A thumbnail. Kinetic family shares a drop-zone letterbox-conform bug (base A
  renders as a band not full-frame at f0) — shared with Push/Rotate/Blurs/360° so guard those if you touch conform.
- MULTI (Replicator-Clones__Multi): despite factory defs for Replicator(19)/Cell(20), it is NOT a runtime replicator —
  it's a rig-driven multi-DROP-ZONE clone transition (Transition A, Transition B, 4 Drop Zones id 5-8, a Rectangle),
  drop-zone crops+positions driven by Rig Behaviors. Don't chase the replicator code path. (Multi-flip = Movements is a
  DIFFERENT transition — don't touch.) Drop-zone Crop is in FRAME space (1920x1920) not source-pixel space — convert
  frame->source (aspect-fill by width). Widget snapshot resolves to id-1 but snapshots stored in DOCUMENT order
  (aspect ids 5,4,2,1,3,7) — store snapshotIds[], match by id. Square framed drop zones (w==h) need scale as OVERRIDE
  channel so retime heuristic doesn't inflate. parseDropZone must not require Type param id=321.
- COLOR_PLANES (Movements__Color_Planes, p28 baseline 5.67 REAL — task said 10.42, STALE): RGB channel-split additive
  3D fold. Visible Group is <enabled>0</enabled> (motr ~line 1410); output = 6 Clone Layers (factoryID 9) in "Group 2".
  Camera factory 11 (AoV rig ~19.6/31.6°); Direction rig default 0=Left→Right. AR/AG/AB clone Transition A, Channel
  Mixer isolating R/G/B, BLEND MODE 8=Add; AR.Z animates 0→-306→-532→0, AB.Z = -AR.Z (LinkZ scale −1), AG.Z=0. BR/BG/BB
  clone Transition B (in=0.801s, out=1.835s), RotationY=π back-face + Rig page-fold. animationEndSec=2.369. CORE BUG =
  Channel Mixer nested-param bug (see Known gotchas — matrix was identity, no channel split). p28 was /stop'd mid-fix
  (flatten applied, unverified). NEXT: verify the flatten fix scores, then additive 3D-plane recombine via
  renderPerspectiveQuad + drop retime-wrap for this template. Touches shared perspective/blend → guard Push/Rotate/360°.
- PANELS_ACROSS / COLOR_PANELS (Stylized): isSolidPanel = non-mask solid-fill shape iff timing.offset re-anchored past timing.in AND Position curve keyed at NEGATIVE local-frame time (Panels signature: offset~3.67s re-anchoring a PosX key at -3.67s). Compositor paints panelFill on a SEPARATE path from strict fillColor. Clone self-masks: a <mask> sibling of a Clone Layer clips the clone (scope to type==clone). WARNING: a relaxed bit-clear Fill-Color gate (needed for Center's cards) OVER-PAINTS Panels' stray Fill-Mode-0 shapes ('White line' 810702, 'Rectangle 8' 808468) — must be scene-aware (a scene containing any isSolidPanel is a panel scene; don't relax-fill its other shapes).
- MULTI-FLIP (Movements__Multi-flip, p23/w4 13.92→13.98 committed ca1f799): staggered multi-panel card-flip.
  Fix = LOCAL-TIME RE-ANCHOR for the flip clones/drop-zones (each panel's flip curve is authored in its own local
  time, offset-staggered). Only +0.06 landed (true geometry ~20.81 if fully solved); the residual is the per-panel
  3D flip compositing + z-order. This is Movements/Multi-flip — DISTINCT from Replicator-Clones/Multi (p3, a
  rig-driven multi-drop-zone, NOT a replicator) — don't conflate.
- MOTION PATH / SLIDE-IN (Stylized__Slide_In, factory 24): generic Motion Path is a position-DRIVER behavior
  primitive (a node's position is driven along an authored path), reusable for any factory-24 path-driven position.
  ⚠️ BUT Slide_In's GT is DEGENERATE/STATIC (p25, session 2b9bff24: byte-identical A, delta 0, engine 50.2dB flat).
  Its "boxes" are masks made of particle Emitters with Birth Rate=0/Initial Number=0 (Is Mask=1, paint-stroke) →
  zero particles → nothing renders; the "Gradient" plugin (UUID 40091D89) returns no ImageSource. Headless FCP
  re-render is ALSO static → the GT is the true (inert) reference. Center Reveal (40.59) uses the SAME
  Gradient+Rounded-rect-mask+Motion-Path architecture but its reveal is mask-GEOMETRY driven and scores well WITHOUT
  any Motion Path eval — so implementing Motion Path does NOT unlock Slide In. DON'T assign Slide_In as a PSNR target
  until the emitter/paint-stroke primitive exists (see spawn-template #17 / GT_INTEGRITY_AUDIT.md).
- FALL (Movements__Fall, p29/w7 19.69→20.61 committed): 3D tumble — Transition A hinged at TOP edge (Anchor.Y=−540)
  rotates about X (Rotation.X curve 0→1.357 rad) tumbling backward, revealing static Transition B (in=0.90s) beneath.
  The 3D geometry was ALREADY correct; the only bug was f23 (10.3dB): retime-wrap (A.out=1.668s) fired 1 frame before
  animEnd (1.702s) → last frame snapped B→A. FIX = detectRevealEndWrapCancel (see Known gotchas), which ALSO fixed
  Rotate 33.25→34.19 and Reflection 13.41→14.30 (same f23 bug). REMAINING lever: mid-frames f10–f22 ~14-15dB — tumble
  perspective camera-Z slightly off vs GT; chasing it risks a GT-tuned camera-Z constant (banned), so left.
- DUPLICATE (Replicator-Clones__Duplicate, p27/w7 19.80→30.53 committed 849c486 — BIG win): a grid of circle dots
  (Emitter/Cell replicator, "Circle" shape) grows to reveal B under A, wavefront sweeping diagonally. Fix = a
  REPLICATOR-MATTE reveal (the replicator geometry drives a mask that reveals B) + masked-reveal A/B binding (bind by
  the reveal, not doc order). Reuse the replicator-matte-as-mask pattern for any grid/dot replicator reveal.
- VERTIGO (Replicator-Clones__Vertigo, p26 17.51→20.80 committed e8ad83d): a spiral of replicated shapes writes on
  as a mask. Fix = SHAPE-BASED SPIRAL REPLICATOR + a write-on sweep used as MASK GEOMETRY (the replicated spiral
  shapes are the mask that reveals B progressively). Sibling of Duplicate — both are replicator-geometry-as-mask
  reveals. NOTE: the combo-spin family's 4 global fixes REGRESS Vertigo (−3.09) if unscoped — scope spin fixes.
- COMBO_SPIN / CLONE_SPIN (Replicator-Clones, p8→w8 11.47→11.75 committed d353466): 6 groups C1-C6, each = a
  CONCENTRIC CIRCLE MASK (shape scale 1→8.51, radii ~123→1046px) holding 2 clones (front=B pre-rotated π, back=A)
  + group-level Spin + a Fade; C5/C6 wrap clones in an ARC/along-shape REPLICATOR (Shape=1, Points=13, Angle End=π)
  = the radial spinning-wedge pinwheel, B revealed outside-in as rings. FULL BUILD SPEC + 4 scoped bug fixes +
  decompiled OZTransformNode::computeSpin (Spin Rate is RAD/SEC) in ~/fct-notes/combo_spin_diagnosis.md — READ IT
  before touching this family. KEY ORDER: build the arc replicator FIRST (parser maps Shape→arrangement, Points→count,
  Angle End) so outer rings render; THEN masks+spin compose to a NET gain. The 4 fixes (group behavior/mask parse,
  evaluateSpin wiring, animationEndSec driver-node clamp, resolveWithRetime empty-keyframe value) each regress a
  sibling if applied GLOBALLY (Vertigo -3.09, Leaves -2.82, Multi -0.28) — SCOPE them to spin scenes.
- LINKANCHOR: only Reflection + Switch use it. Reflection's driver anchor X/Y = 0 (rerouting anchor is a no-op there). Verify any Link/anchor change against BOTH.
- CENTER (Stylized/Kinetic/Center ~4.01→8.53, p2): NOT a plain replicator — a kinetic multi-panel
  montage of image A/B panels PLUS decorative solid cards (white, navy, light-blue rectangles) that
  scale/slide. Its cards are Fill-Mode-0 shapes with solidFillActive=0 → need the RELAXED solid-fill
  gate to paint. Guards to protect while touching this path: Heart 20.78, Center_Reveal 40.59, and the
  panel-sibling set (see shared-gate gotcha) — Center's fix regressed Panels_Across; fix is scene-aware.
- SMEAR (Movements__Smear ~9.95, p4): stack of THREE effects on the outgoing "A" layer: (1) Push
  translation PosX −2048→2048; (2) Directional Blur (Amount ramps 0.6→300→122, angle 0 — engine has
  directionalBlur already); (3) a CUSTOM "Smear"/"Scrape" ProPlugin PA filter (factory 13) that must be
  decompiled — it is the missing mechanism, not the blur. (GT-black caveat applies, see Known gotchas.)
- VIDEO_WALL (Replicator-Clones, p11 10.17→12.91 committed fce8f01): SOLVED via real moving
  Framing-camera dolly + gray Pin placeholders. Scene = 37 tiles from 14 replicators in a huge
  off-canvas world (X −5542..9904, Y −1200..7211), + standalone Transition A tile @(2051,−2390,0)
  and Transition B @(2055,3596,0). Camera static pos == A's XY (that's the f0 full-A anchor).
  KEY DECODES: (1) endSec must be 1.0 not 17.4 (see time-domain gotcha above). (2) unfilled `Pin`
  drop zones (dropZone.type===3, "Pin 1"/"Pin 2") render GRAY (79,79,79) placeholders in headless GT,
  NOT transitionA — even though determineImageSource resolves their clip ref to A. Gray is the
  dominant visual element; rendering them gray was the biggest lever (init jumped past baseline the
  moment gray tiles were in). (3) f23 final = clean 3×3: A dead-center, B at 4 corners, GRAY at 4
  edges, slight perspective tilt. (4) center pixel cycles A→B→gap→gray→B→gray→A over 24f = camera
  PANS+dollies diagonally from A's tile toward B's, not a straight dolly. Scope the framing view to
  framing-camera scenes only (only Video_Wall has factory-3). REMAINING: exact oblique quaternion
  path + arrow icons cap a flat model ~13-14.
- ARROWS (Objects__Arrows, p22 16.47→24.16 committed c329cec): NOT solid arrow sprites. The arrows are
  8 stroked bezier arc shapes C1-C8 (factoryID 11 = shape/stroke) with "Start Cap"/"End Cap" params set to
  ARROWHEAD values — chevron/spiral bands that act as MASKS revealing image B (blue) over A (sepia), sweeping
  so B grows and A recedes into shrinking arrow shapes; plus a Circle Mask + Radial Blur + Rig behaviors. Mech
  = rasterizeStrokedArc (stroked bezier + arrowhead caps + arc-trim), gated width>20 + arrow-cap, dispatched
  BEFORE the fill path in rasterizeShape. Its `strokeOverride?` param and p18b's `cameraZ?/cameraPosZ?` both
  live in rasterizeShape (shapes.ts) — see the shared-file arity note in SPAWN-TEMPLATE #5.
- CLOSE_AND_OPEN (Stylized, p18b ~10.92): shares compositor/shapes.ts — added perspective-projection for 3D
  fill shapes in rasterizeShape (finite cameraZ → project each vertex by depth via `toPixel`), threaded
  cameraPosZ through RenderContext in compositor/index.ts. Coexists with Arrows' stroked-arc path (different
  dispatch branches in the same fn). If you touch shapes.ts, re-score BOTH Arrows and Close_and_Open.
- SCALE (Movements__Scale, p15 15.96→17.09 committed 20f4c17): scale/zoom transition. Baseline was
  ALREADY 15.96 (m8 present), task said 13.98 (STALE). Mechanism: hidden disabled Color Solid driver
  (id 1999870285) carries master Scale-X curve 1→0.943→0.70→0.362→0 and Opacity 1→0; default
  Direction=0 ("Up"). Fix = factory-12 Direction "degenerate-column advancement" (the active snapshot
  column for a direction advances through the degenerate/zero columns). Frame 0 great (50dB), mid
  frames 1-17 were the weak spot.
- DROP_IN (Movements__Drop_In, p10 9.83→12.75 committed f33cd8b): B drops in from above with a damped
  bounce; A static. The drop is a Position-Y curve on Transition B (Type=2): values 719,−416,282,−99,
  89,−41,0 (classic decaying overshoot, +Y=down, 720-tall scene). A "Group" holds two particle
  Emitters ("Drop Impact" splash) — decorative. Fix = card letterbox-conform + a BOUNCE TIME-DOMAIN
  fix (same animationEndSec-vs-GT class of bug — the bounce curve's time domain must match GT). p10's
  parser change: exclude "Preview Position" (editor metadata, like Page Number) from the
  animationEndSec keyframe scan; must COMPOSE with p14's Flash-overlay offset-shift gate (append-style).
- SWING (Movements__Swing, p20 15.83→16.13 committed 98bd13f): hinge/pendulum swing. A Rig (factory 3) with
  an Anchor widget (Right/Left/Top/Bottom, default Top=2) + Direction widget (Towards/Away, default Away=1)
  selects ONE of 8 layer variants — here "Top away" (group Top id 987619301). That layer: Position Y≈728,
  Anchor Y=540 (hinge at TOP edge in local space), a Ramp behavior drives Rotation X 0→π/2 (Curvature=1 ease).
  It holds TWO clone children: Clone A (front, flat) + Clone B (back face, static Rotation X=−π/2). FIX = the
  clone static-rotation override gotcha above (B was retime-ramped face-on too early). Only +0.3 landed — the
  mid-swing 3D back-face compositing is the remaining lever (f0=50dB, sags mid, f23≈20.7dB).
- LENS_FLARE (Lights__Lens_Flare, p21 16.12→46.19 committed ccae908): the mechanism is a procedural
  `LensFlareGenerator` plugin (factory 8, pluginUUID 4933D9F1, Blend Mode 10=Screen), center LinkX/Y'd to a
  "Circle Source" shape +offset 960/540, off a disabled Color-Solid driver — NOT a .mov overlay. BUT the +30dB
  did NOT come from the flare: it came from two compositing bugs — (1) A/B were SWAPPED (drop zones authored
  B-before-A → fixed by fade-direction binding) and (2) retime-wrap missed f13 by 1.5ms (fixed by half-frame
  tolerance). Both endpoints are wrapped-A, so once A/B + wrap were right the plain base carried it to 46.
  LESSON: verify A/B binding + f0/f23 identity BEFORE building the "obvious" fancy mechanism — the flare was a
  red herring; the real gap was plumbing. (This is the recurring "check endpoints first" theme.)
- FRAMING FAMILY (Video_Wall / 3D_Rectangle / Concentric): see `~/fct-notes/framing-family-findings.md`
  (p1) BEFORE starting. Key: only Video_Wall uses the Framing camera (factory 3) + FRAMING_VIEW_ENABLED;
  3D_Rectangle (Camera fac 24 + 9 masked Clone Layers fac 16, nested receding rects) and Concentric
  (Clone Layers fac 15 + Rectangle shapes fac 12, NO camera) are NOT framing-driven — don't chase the
  framing view. Video_Wall needs the full 14-replicator off-canvas wall + oblique look-at view·proj
  (framer proxy and visible tiles are in DIFFERENT coord spaces — full-A@f0 comes from the central WALL
  tile, not from framing image A). 3D_Rectangle f0 white-rectangle bug = shape-as-clone-mask-source not
  hidden by the group-only guard at renderLayer (shared with Wipes/Mask ~42, Color Planes — verify before enabling).
- SLIDE (Stylized/Documentary/Slide ~13.3, p16 — NOT solved, hard): decorative-tile cascade, NOT solid panels.
  Tree: Rig1(Pop-up widget) + Rig(Color accent widget) + group "Animations"{6 card-set layers, each a Rig-Opacity-
  gated set of 3 factory-5 IMAGE layers loading bundled grayscale PNGs from Media/, + a group-level Colorize filter}
  + "Transition Drop Zones"{B before A}. Pop-up=0 → only "Rectangles across" set visible (group-opacity gate; the
  other 5 sets' groups go op=0). Cards slide via Position-X curves w/ offset re-anchoring (see offset-panel gotcha).
  A/B source images arrive ALREADY tinted (start/end.png are sepia/blue) — the Colorize is scoped to the CARDS only.
  GT renders cards NEUTRAL GRAYSCALE (rig "Color" accent does NOT tint tiles in FCP's DRT); Curtains/Veil use a
  STATIC (non-rig) Colorize w/ real tint — don't break them. Remaining gap: mid-transition (f10-18 ~7-8dB) card
  COVERAGE too aggressive (big 3390px "middle copy" over-covers left) + NO motion blur (scene motionBlurSamples=8;
  GT cards are heavily motion-blurred, letting image show through). Grayscale fix is correct but nets −0.3 alone —
  the motion-blur + coverage error dominates and must be built for a net gain.

### HEADLESS/GUI-MATCH family diagnoses (g2/g5/g6, 2026-07-06 — start here for these families)
- STYLIZED family (g6, full findings ~/fct-notes/STYLIZED_FINDINGS.md). Dominant bug (10/10): animation_end wrong
  → use scene playRange (table in findings). Verified playRange (s): Center 5.305, Center_Reveal 0.634, Close&Open
  0.701, Glide 2.503, Heart 2.503, Loop 1.969, Lower 6.807, Panels_Across 1.668, Panels_Random 1.435, Up-Over 3.137.
  Long Stylized scenes (Center/Loop/Heart/Glide) STILL need a GUI-frame→motr-time REMAP after span fix (they
  oscillate/end-on-A under linear sampling). Black-trim (_visible_end_seconds) is a free +4-6dB on Heart/Center_Reveal.
  Two oz_render.mm content bugs (serial): B drop-zone never composited BEHIND panels in the "open" half
  (Close_and_Open, Panels_Across → f23 ends white/A not clean B), and a SPURIOUS A-thumbnail picture-in-picture card
  (Center, Lower, Panels_Random) — same drop-zone-feed hook. Panels_Random 19.32 is best/content-correct (mid dips =
  random panel-order seed differs from GUI; probably unfixable).
- ⭐ STYLIZED time-remap = REVERSE-RAMP, not a "retime curve" (g6b — the pool's retime-curve theory was WRONG).
  The .motr Retime Value curves are per-drop-zone scene-time→source-MEDIA-frame maps (slope ~30fps = frameRate),
  NOT a timeline remap. The REAL cause of the Stylized oscillation: the scene animates source A → SNAPS to a B
  climax → smoothly RETURNS to A over playRange; FCP's transition shows only the smooth B→A decay PLAYED IN REVERSE
  (reads as clean A→B). Linear forward sampling renders A-hold+snap+return-to-A → ends on A & oscillates. FIX
  (render_gt.py, prototyped, see Reusable snippet "reverse-ramp"): tB=scene-time of the COLDEST non-black frame in
  (0,playRange]; tA=playRange; schedule scene_t(i)=tA−(i/(N−1))·(tA−tB) so f0→A, f_{N−1}→cold-B. PSNR: Loop
  13.88→18.94, Heart 13.02→19.82, Center 11.34→12.58. ⚠️ GATE on "scan reaches cold-B" (same cold-B anchor as
  `_areturn_end_seconds`) — Glide REGRESSES (−1.0) because it never resolves to cold-B headless (that's a g1
  content/direction bug, not time). Residual mid-frames ~13-16dB = the SNAP geometry (content), not time. Ship
  serially AFTER g3/g5b render_gt timing land; full patch (function + playRange parser + loop change) in
  TIMEREMAP_FINDINGS.md.
  ⭐ REFINED (h2 — reverse-ramp IMPLEMENTED in render_gt._render_one; verified Loop 13.88→18.86, Heart →19.82,
  Center →12.53; guards Push/Rotate/Flash/Mask/Glide held byte-identical). TWO things a future agent MUST know:
  (1) The REVRAMP-vs-LINEAR selector is a ROUND-TRIP GATE on the cold-B frame INDEX: revramp fires only when the
  coldest-B frame lands in the FIRST ≤75% of the fine scan (Center f2, Loop f16, Heart f25 of 48 = round-trips →
  REVRAMP); stays LINEAR when cold-B is late (Push f45, Rotate f44 ≈94% = directional slides). Clean 75% split —
  the generic discriminator, don't per-slug it.
  (2) ⚠️ THE SHARED SCORERS DON'T SEE THE SCHEDULE. `render_gt._render_one` (the `--batch` GT path) samples via the
  reverse-ramp schedule, but `score_slug.py`/`gui_scoreboard.py` sample LINEARLY (`t=i/23*end`) → they show NO
  revramp gain and you'll think it broke. `_areturn_end_seconds` stashes the schedule in `render_gt._LAST_SCHEDULE`
  and exposes `render_gt.sample_time(i,24,end)` (linear fallback if no schedule). ONE-LINE scorer fix (both, inside
  `for i in range(24)`, replacing `t=i/23.0*end`): `t = render_gt.sample_time(i,24,end)` — byte-identical for every
  non-round-trip slug so SAFE pool-wide, but DEFERRED (shared-file risk mid-run); coordinator applies once. Until
  then verify revramp with a PRIVATE scorer copy calling sample_time (h2 used /tmp/h2_batch.py), NOT score_slug.py.
- MOVEMENTS family (g5, full findings ~/fct-notes/MOVEMENTS_FINDINGS.md). Separable timing overshoots to clamp to
  playRange (render_gt.py): Drop_In 3.17→1.50s (2.11×), Smear 1.13→0.40s (2.83×), Earthquake 2.25→1.77s (1.27×). PAE
  content filters to VERIFY register: Earthquake=PAEEarthquake(factoryID 18, "Twist"), Flashback=PAEUnderwater
  (factoryID 6, "Size" 2.0→2.35) — if headless f12 == plain conform, the PAE isn't applying. Rig-direction (defer to
  g1): Clothesline, Reflection, Smear (all popup value=0, re-score after g1). Time-remap/3D content (GUI f0 already
  mid-motion, not motr t=0): Rotate (±90° 3D rotate, black corners@f0), Clothesline (mid-swing@f0), Pinwheel, Fall
  (3D tumble mid-frames). Smear is NOT PAEScrape (built-in Motion "Smear"+"DirectionalBlur").
  ⭐ PROVEN CEILING (h4 per-frame best-t sweep, don't re-probe): for Rotate/Pinwheel/Fall/Clothesline the BEST
  achievable PSNR even when you pick the OPTIMAL scene-time per GT frame is only ~14-20dB mean (Rotate peak
  12-16dB, Pinwheel 10-33 but 10-13 in the mid, Fall 12-38, Clothesline 12-29) AND the best-t curve is
  NON-MONOTONIC / wobbly (Rotate best-t oscillates 1.3→0.3→1.27; Pinwheel/Fall jump around). => a render_gt.py
  time-remap CANNOT close these — the residual is 3D GEOMETRY (card hinge/rotation/perspective in the middle
  frames), which lives in oz_render.mm's motion primitive, NOT timing. Endpoints (f0/f23) already match; only
  mid-frames sag. Do a quick corner/center-brightness profile (GUI black corners = card rotated out of frame) to
  confirm f0 is mid-motion, then stop chasing timing and defer to the oz_render.mm 3D path.
- 360° family (g2, full findings ~/fct-notes/360_FINDINGS.md). Scene aperture 4096×2048 (equirect 2:1), content placed
  FLAT+centered. Bug 1 (endpoints, ~5-line fix): readback ROI hardcoded {0,0,1920,1080} grabs a corner → center-crop
  via OZScene::getSceneBounds when w≥3072 (7→17-19dB, all 8). Bug 2 (mid-frames, rig-coupled, do after g1): push is a
  flat 2D translate with NO equirect wraparound → front view goes white-empty mid-transition; mechanism is
  PAEEquirectReorient (uuid E61FE95E) Pan(Y) driven by g1's rig machinery, resolving to zero headless. See Known gotchas.
  ⭐ REFINED (g2b): the Reorient Pan(Y) is STATIC (0 and π, NO rig targets it) — the ONLY rig-driven channel is the
  clone-layer Position X (linear 0→±4096 = one full 2π longitude wrap) + the 360°-aware blur Amount. Mechanism:
  Reorient parks A@lon0/B@lonπ, the rig SLIDES each clone X across the equirect canvas, then FCP renders a FORWARD
  rectilinear CAMERA (fixed, lon≈0, FOV≈115°/2.0rad) into 1920×1080 as the panorama slides through. STEP B fix =
  read back the FULL 4096×2048 canvas then reproject (per output px: ray→lon,lat→bilinear-sample-with-wrap). numpy
  proto lifts f12 7.15→14.79 (MEAN 13.43). Prefer reprojecting the engine's REAL canvas after g1's rig slide is
  correct (beats the synthetic-source proto). Scripts /tmp/reproj2.py; full spec TIMEREMAP-adjacent in 360_FINDINGS.md.
  ⭐⭐ ROOT CAUSE NAILED (HIGHLEVEL_API_FINDING.md, 2026-07-07) — READ BEFORE ANY 360 WORK: 360 Push.motr
  sceneSettings has `<Object3DEnvironments>100</Object3DEnvironments>`, width=4096 height=2048. The .motr is a
  360 ENVIRONMENT SPHERE, not a flat 1080p scene. FCP's GUI-GT was made by dropping this clip into a STANDARD
  1080p timeline where FCP renders the sphere THROUGH THE HOST PROJECT'S RECTILINEAR PERSPECTIVE CAMERA at
  1920×1080 (forward-facing). Our headless harness renders the .motr's OWN 4096×2048 equirect canvas with no
  output camera → flat equirect ("flat translate, black/white center" artifact). So the fix is NEITHER the
  readback ROI (that's the WRONG abstraction — it re-implements badly what the engine already does; for 360 the
  DOD is the moving union of 2 translating clone layers so the ROI chases empty canvas → black) NOR a numpy
  reproject workaround alone. The CORRECT fix: render the scene as an Object3DEnvironment viewed by a perspective
  camera at 1920×1080 (reproduce "360 clip in a 2D project"). Entry point = drive FCP's export path
  `_OZXGetFrame` (handle: [+8]=scene, [+0x10]=GLRenderer, [+0x18]=progress) / `OZXGetFrameAsCGImageWithInput`,
  which wires the OZViewer/perspective-camera stage. Symbols to chase: OZXEquirectProjectFilterSetFrontFacing,
  Li3DGroupForEquirect, OZViewer(shareEquirectRenderWithHMD), OZExportScene*.
  ⚠️ PROVEN DEAD-END — DO NOT REPEAT (HIGHLEVEL_API_FINDING.md): calling `OZRenderManager::getGLRenderer()` +
  `GLRenderer::render(scene,params)` directly (reading the shared_ptr<PCImage> at params+0x4f8) BUILDS + runs +
  the A/B hook fires, BUT renders 360 at its NATIVE 4096×2048 aperture WITHOUT the front-facing camera projection
  (f0 = uniform grey), then CRASHES on f6 (GLRenderer::render lacks the mutex/autoreleasepool/process-control
  setup that _OZXGetFrame wraps around it). The equirect projection is a distinct VIEWER/EXPORT stage ABOVE
  GLRenderer::render — not a param on it. Both OZXGetRenderGraph (current) and GLRenderer::render reach
  getFrameNode→OZImageElement::getHeliumGraphFromMediaRef, so identity-based A/B injection is preserved on either
  path. This is a real dig (needs the OZX export-handle wiring), NOT a 5-line swap; ship the honest diagnosis if
  you can't land it.
  ✅ UPDATE (47e9f2c, 2026-07-07) — the 360 ENDPOINTS were partially recovered WITHOUT the camera dig: the
  committed DOD-centered readback was CHASING the moving DOD union (f0 DOD centered @0, f12 @2073, f23 @3974 on
  the 4096-wide equirect canvas) → landed on empty canvas → black even at endpoints (a regression vs a fixed
  readback). FIX = for equirect canvases (DOD width ≫ frame, e.g. >3072) read a FIXED 1920×1080 window centered
  on the CANVAS/scene-aperture CENTER (2048,1024), NOT the moving DOD center. Result: 360 Push 7.11→10.89,
  Slide 9.29→13.58, overall 16.26→16.38, zero regressions. REMAINING 360 work is ONLY the MID-FRAME projection.
  ⭐ MID-FRAME entry (more concrete than LiCamera): `OZImageNodeRender360 → HGEquirectProject` (getHelium builds
  it) does the equirect→rectilinear front view WITH wraparound; without it f12's front view is empty (flat clone
  translate). DEAD-END: 360ProjectMode (OZScene+0x90+0x10c) is ALREADY 0 for these templates — NOT the switch.
- OBJECTS family (g4, full findings ~/fct-notes/OBJECTS_FINDINGS.md). Scores: Arrows 19.16, Curtains 16.26, Squares
  7.56, Leaves/Veil HANG. THREE root causes: (#1 oz_render.mm, serial) media-ref hook can't feed >2 media elements
  — Curtains' 2 curtain .movs + Leaves/Veil's .mov+matte steal A/B slots, real drop zones get nullptr; Leaves/Veil
  HANG decoding real .mov (see "media-ref hook is a destructive prologue overwrite" gotcha). (#2 oz_render.mm,
  serial) Squares renders into bottom-right quadrant only (Fixed-Res-Behavior=0 group). (#3 render_gt.py, separable
  but unverifiable until #1) `_scene_duration_seconds` counts the embedded `.mov` out-point as the transition
  lifetime → Curtains end=3.10s vs true 1.0s; skip `<clip>/<footage>` subtrees whose media is a real Media/*.mov.
  VERIFIED separable win handed to g3: Objects__Arrows f23 collapses 6.4dB because end=1.0344 overshoots the 1.001s
  window and the final frame WRAPS (neutral-warmth loop, so `_areturn_end_seconds` B_WARM gate misses it); clamp
  Arrows end ≤1.001 → f23 29.6, MEAN 19.16→20.07. The mid arrow-shape geometry (f8-16 ~13-15) is an in-engine
  procedural gap, no code fix identified.
- REPLICATOR-CLONES family (g7, full findings ~/fct-notes/REPLICATOR_FINDINGS.md). Scores: Vertigo 20.54,
  3D_Rectangle 18.61, Multi 16.99, Concentric 14.73, Combo_Spin 12.60, Duplicate 12.03, Clone_Spin 11.61,
  Video_Wall 10.19. THREE classes: (A) A/B SWAP ✅ FIXED by h3 identity binding (Duplicate 12.03→22.71, Concentric 14.03→16.49 — do NOT reverse in render_gt); (B) UNFILLED replicator-CELL drop-zones (Clone_Spin/Combo_Spin/Video_Wall
  render green/red/gray placeholder swatches instead of source photos — the media feed fills top-level Transition
  A/B layers but NOT the per-CELL `Image Source`/`Source Media` params; needs oz_render.mm to enumerate ALL
  drop-zone/Image-Source params, serial); (C) mid-transition geometry/phase + time overshoot (Vertigo/3D_Rectangle/
  Multi — content correct, endpoints 30-45dB, mid-sag from clone zoom/rotation phase; Multi also over-samples
  end=2.24s and its GUI-GT is DEFECTIVE). Concentric+Video_Wall HANG at init under load (template-specific — see
  gotcha). Only cleanly-separable render_gt.py candidate = Multi end-clamp, but held (defective GT = weak verify).

## ⚑ SELF-INTEGRATION (mandatory before you report DONE)
# HEADLESS POOL variant: re-verify = `./build.sh` (exit 0, only if you touched oz_render.mm — render_gt.py
#   is pure Python, no build) + a 65-slug no-crash render stays 65/65 + re-score YOUR target & guards. There is
#   NO tsc / push-directions.test.ts on this pool (that's TS-engine). If you only diagnosed (no code shipped),
#   leave the worktree CLEAN (`git status --short` empty) and skip rebase — that IS a valid DONE (g4/g7/g8b/g2b
#   all shipped nothing, correctly, because their fix was a shared-oz_render.mm serial slot). Reporting a precise
#   verified diagnosis + patch spec beats shipping an unverifiable/conflicting render_gt.py edit.
# --- TS-ENGINE POOL variant below ---
# main moves while you work (other agents merge). YOU own integrating your change, not the coordinator.
# After committing ALL your work, BEFORE reporting:
#   1. run `~/fct-notes/pool_worker_rebase.sh wN`  (rebases your branch onto latest origin/main)
#   2. if REBASE-CONFLICT: resolve it yourself APPEND-STYLE (keep BOTH your feature and the incoming
#      one), fix any call-site arity errors the incoming change introduced (e.g. parseShape now takes
#      3 args), `git add <files> && git rebase --continue` until done.
#   3. RE-VERIFY on the new base: `cd engine && npx tsc --noEmit` (0), `npx tsx test/push-directions.test.ts`
#      (4/4), and re-score YOUR target + the must-stay guards + ANY sibling that shares a file you touched.
#   4. if a guard/sibling regressed on the new base, FIX the interaction before reporting.
# Report only after a CLEAN rebase onto current origin/main with all checks green. The coordinator then
# does a trivial fast-forward-ish merge and re-scores; it will NOT resolve conflicts for you — a branch
# that doesn't merge cleanly gets bounced straight back to you.

## Hardcode examples that were REJECTED (learn from these)
- Light Sweep (removed): detect fired on 1/65 + replayed navy(0,17,43)+flare+tail storyboard. RED FLAG "fires on 1/65".
- Video Wall (rejected): grayPlaceholderCell = RGB(79,79,79) TRACED FROM GT ("measured RGB≈(79,79,79)"); FRAMED_TILE_SCALE=1.9 / DOLLY_SPAN=2.35 GT-calibrated magic constants; "ctx.framed ⇒ Video Wall only" single-transition scope. Correct fix: read the well's fill from its generator param in the .motr; derive camera dolly/scale from the factory-3 Framing behavior params (computeFraming/calcFramingRotation), NOT tuned to GT frames.
- PATTERN TO AVOID: measuring a value from GT pixels/frames and baking it as a constant. If you find yourself writing a number you read off a GT frame (a color, an offset, an onset time, a scale), STOP — that value must come from a .motr parameter evaluated generically.
