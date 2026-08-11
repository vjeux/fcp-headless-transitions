# OPS_LOG.md — recurring swarm failures and the fixes that closed them

Harvested from agent exit reports. The rule this file exists to enforce: **when two agents hit the
same problem, it stops being an agent problem and becomes a tooling problem.** Every entry below was
independently rediscovered by multiple agents before anyone fixed it — that rediscovery is pure waste
and, in three cases, it destroyed merged work.

If you are an agent and you hit something not listed here, **say so in your exit report** with enough
detail to reproduce. That is how this list grows.

---

## Fixed

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | `pr_submit` dies: `Head ref must be a branch` (hit ~5x by one worker, reported by 3) | `wt_pool acquire` ran `checkout -B … 2>/dev/null`; when the branch was checked out in another slot git refused, the error was swallowed, and the caller got a **detached HEAD** while the log still claimed the branch | #240 — surface the failure, fall back to `port/<Class>__slot<N>`, and verify HEAD is a branch before returning |
| 2 | In-progress file silently wiped mid-edit | `claim_slot` reclaimed any lease older than 120 min assuming a dead agent. A long-running unit is not a dead agent | #240 — never steal a worktree holding uncommitted/unpushed work |
| 3 | Releasing a worktree destroyed **someone else's** work | `cmd_release` reset unconditionally, no ownership check | #240 — no lease ⇒ don't touch the tree; live work needs an explicit `--force` |
| 4 | Stacking deleted landed methods | `acquire` stacked on any `port/<Class>` ahead of main. A **PR-less** branch ahead of main is abandoned and its file can predate landed work. 40 of 62 `port/*` branches were in that state | #240 — stacking also requires an **open PR** |
| 5 | `! [rejected] (stale info)` on push (3 workers each debugged it) | remote-tracking ref survived a server-side branch delete on merge | #240 — `git remote prune origin` in `pr_submit` |
| 6 | Spurious `REVIEW_NEEDED` → counted as a **cheat** | `pr_gate` passed **relative** paths to `gate.sh`; G5's reach fuzz then hit a macOS `file://` error and returned no result. Self-inflicted and permanent (performing the *required* re-derivation is what broke the gate), and progressive (as disasm coverage grew, mergeable files became unmergeable) | #234 — absolutize paths. Corollary worth remembering: *the gate was passing PRs largely when it could not see the disassembly* |
| 7 | A **rejected** port landed on main | Review lease was keyed by PR#+head-SHA, so when main advanced a second slot leased the new head and merged over a pending `CHANGES_REQUESTED`. All slots share one bot identity, so GitHub's per-user "latest review wins" gave no protection | #242 — lease by PR# alone; **any un-dismissed `CHANGES_REQUESTED` blocks the merge** |
| 8 | A merged PR carried an APPROVE nobody performed | `pr_land` minted its own approval on any green head (#197 was approved while being a duplicate) | #234 — `pr_land` now *requires* an approval on the current head and refuses to mint one |
| 9 | Landed method deleted by another worker's commit | Class files regenerated instead of extended; nothing enforced ADD-only | #232 — **G6 add-only** gate rejects any change that drops a landed `@0xADDR` or declaration |
| 10 | Disasm lookups took 42s and pinned the box | Every lookup linear-scanned a 220MB `otool` dump, several times per unit | #148 — `symidx.py` byte-offset index (0.17s), verified byte-identical across all 45,785 symbol bodies |
| 12 | Every `pr_gate` leaked its worktree lease → all 16 slots held → `POOL_FULL` → **gating and merging stopped dead** (reviewer-03 quit over it; #114 lost a verdict) | #240's dirty-tree release guard vs `pr_gate` deliberately dirtying its checkout with trusted tools. A regression introduced by a fix | #258 — `pr_gate` releases `--force`; stale-reclaim takes disposable `gate/<sha>` leases even when dirty (self-healing) |
| 13 | A port passed every gate and still returned 24 where FCP returns 232 | out-of-range index → `undefined` → `undefined-1` = NaN → `NaN & mask` = **0**, a plausible wrong number with no throw | #255 — **G7** flags new non-null-asserted computed table reads |
| 14 | Real ports condemned as duplicates (#108/#110/#197, one click from being closed) | `dup_check` matched `__Z*` text tokens; address-only files yielded zero units, which v2 read as "duplicate" | #252 — v3: externs excluded, no-units is INCONCLUSIVE not DUP |
| 11 | Reviewers could not use GitHub's review system | One identity authored and reviewed every PR; GitHub forbids self-review, so verdicts degraded to status+comment | #204/#206/#210 — worker and reviewer **GitHub Apps** |
| 15 | The gate told reviewers to "rerun --reviewed" — an instruction that could never work | `REVIEW_NEEDED` was filed as a hard error but `--reviewed` only cleared *flags*; silently blocked correct PRs (#228, #231, much of the reject backlog) | #265 — REVIEW_NEEDED is a flag (real cheats stay hard errors) |
| 16 | `prove_all` could not pass inside a pool worktree, yet every reviewer is told to run it at startup and sign nothing without it | `raw-port/re/disasm/` is gitignored, so Layer-3 fixtures are absent in a fresh worktree → `UNKNOWN` | #265 — layer3 regenerates its fixtures (cheap since #148) |
| 17 | A concurrent gate run erased another agent's verdict (reviewer-03's REJECT on #82 vanished) | GitHub keeps only the latest status per context; an opening `pending` overwrote a settled `failure` | #270 — pending is posted only when no verdict exists |
| 18 | **Every honest refusal to fake a port permanently deleted that symbol from the queue** — 5,799 claims, 0 reopens | `depclaim next` skips claimed symbols and nothing removed claims; `reopen` was documented as human-only and named in no brief | #280 — `depclaim.py drop <sym> "<reason>"` requeues + records; documented in both worker briefs |
| 19 | Units handed out as READY whose real callee was unported | `depgraph`'s DIRECT regex only matched `__Z*`, so a `jmp _PCPrint` (defined in ProCore 0x64e7, unported) produced no edge at all | #280 — plain-C callees defined in the 5 frameworks now count as in-scope deps (READY 15,958 → 15,701) |
| 20 | G5 judged a port against **another class's** disassembly — a false REJECT on an honest port (#253), and a false ACCEPT wherever the wrong body was EMPTY | `find_disasm`'s last-resort key is the bare CLASS name, globbed as an unanchored substring: `*HGRenderNode*.s` matched `__ZN18OZHGRenderNodeBase8finishedEv.s` (DISPATCH_ONLY). 84 of 916 class-key lookups resolved to a DIFFERENT class (62 REAL, 19 EMPTY, 3 DISPATCH_ONLY). It only fires when the exact symbol's `.s` is missing — the NORMAL state in a pool worktree (#16), i.e. where the gate actually runs. Same shape as the 2026-07-29 parseElement cheat, through a second door | #302 — a bare identifier must match a WHOLE name component (Itanium `<len><Class>`, or a whole dotted component), never a substring; ties resolve deterministically; `sorted(set(...))` in G5's symbol ranking (PYTHONHASHSEED-dependent, so the verdict changed run to run) fully sorted. Locked by `verifier/test_find_disasm.py`, wired into prove_all as LAYER 2b |
| 21 | G5 computed **476 of its 1,745 verdicts from a different class's function** — `AUPassThrough_D1` judged against `LiMaterialLayer::D1` (TRAP), `AdvanceScopingWindowTask_performTask` against `UpdateScrubRateTask::performTask` (EMPTY), every `*_ctor` export in the repo against one arbitrary framework's ctor | #307 anchored the CLASS key but left the BARE METHOD key: when no cited mangled symbol and no `<Class>.<method>` resolves, G5 falls back to `find_disasm(method)` / `find_disasm(class)`, and a method name alone is shared by hundreds of unrelated classes. Same both-ways harm: a wrong EMPTY/TRAP waves an empty-body-for-REAL-work port through, a wrong REAL condemns an honest @0xADDR-cited sibling stub as class-C | #317 — a bare-key hit must still NAME the class being ported (export-name prefix, else the file's class), via the shared `names_class` rule; otherwise it is discarded and the existing NO-DISASM FLAG asks the reviewer to re-derive. 476 fabricated verdicts -> 0, at the cost of flags on 106 landed files |

---

## Open — reported 2026-08-11 by worker 1 (G5 resolution; FIX PROPOSED in this same change)

- **G5 judged 63% of the corpus's exports against SOME OTHER METHOD OF THE SAME CLASS — and the
  trigger was obeying the worker brief.** #302/#317 made a resolved disasm prove it NAMES THE CLASS.
  Nothing made it name the METHOD, and the cited-symbol loop took the first cited symbol that
  resolved to any `.s` at all (the method-name ranking was only a *preference*). So one arbitrary
  body — whichever of the class's methods happened to be warm in `re/disasm/` — became the verdict
  for **every export in the file**.

  Measured live on the landed `channels/OZ3DEngineScenePlacementBehavior.ts`: derive that class's
  disassembly, as the brief instructs (`disasm.sh --sym` inside the leased worktree, "else G5 only
  flags instead of classifying"), and the file goes from **`0 cheats, 12 flags -> PASS`** to
  **`11 cheats -> REJECT`**. All eleven were fabricated: every export was judged against
  `__ZNK32OZ3DEngineScenePlacementBehavior12getLockingIDEv.s`, a 6-instruction trivial getter that
  classifies EMPTY (0 stores, 0 compute, 1 load), so each honest `@0xADDR`-citing deferral stub read
  as "EMPTY disasm but port throws incompleteness". Scope of exposure, counted over `raw-port/src`:
  **1,453 of 2,317 exported functions (63%) have no cited symbol that relates to their own method**,
  so each takes a sibling's body the moment any of the file's symbols is cached. It is masked right
  now only because #368 purged the `.s` cache — it re-arms itself as workers regenerate disasm.

  Both directions of harm, as with every earlier instance: a borrowed EMPTY waves through an
  empty-bodied port of a REAL method in the same class, and a borrowed REAL condemns an honest
  deferral stub as a class-C cheat. Note the shape — **deriving the evidence you were told to derive
  manufactured the cheat verdicts**, which is why nobody hit it while the cache was cold.

- **It is not even confined to the class: #317's class guard was never applied to the CITED-SYMBOL
  path, so the two-letter token `__ZN` written in a prose comment condemned 34 exports of two
  unrelated classes.** `SYM_RE` (`_{1,2}Z[NK]?[0-9A-Za-z_]+`) happily matches the bare `__ZN` /
  `__ZNK` / `__ZThn328_` fragments that files write when *describing* mangling, and for a full
  "mangled" key `find_disasm` uses an unanchored `*<san>*.s` glob — so `__ZN` matched the one
  OZ3DEngineScenePlacementBehavior getter sitting in the cache. Result, measured:
  `channels/OZ3DEngineApplyForceBehavior.ts` (cites `__ZN`, `__ZNK`) took **20** fabricated cheat
  verdicts and `channels/OZCollisionBehavior.ts` (cites `__ZThn328_`) took **14** — from a class
  neither file mentions. The class anchor exists; it was simply never on this door. Note what this
  means operationally: one worker deriving one class's disassembly poisons the verdicts of OTHER
  agents' unrelated files, through the shared `re/disasm` cache in a warm-pool worktree.

- **...and a PARAMETER TYPE could impersonate the method, which is how one unrelated class's body
  judged all twelve exports of `src/infra/CMTime.ts`.** Found while measuring the fix above.
  `find_disasm("CMTime")` returns `ProChannel.__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime.s`
  — a DIFFERENT class — because the parameter type `RK6CMTime` contains the Itanium component
  `6CMTime`, and the whole-component anchoring rule from #302/#317 cannot tell a NAME position from
  a TYPE position. That body is DISPATCH_ONLY, so every export in CMTime.ts came back
  `G5 SKELETON — DISPATCH_ONLY, a pure dispatch shell`: **12 hard rejects on a file whose own
  disassembly was never in the cache at all**. This one is live on main TODAY with the post-#368
  18-file cache — no disasm regeneration needed to trigger it. The method test is therefore
  POSITIONAL (`_itanium_components` parses the nested-name sequence and compares only its LAST
  component, with `_ZThn…_` thunk prefixes normalised and `_ZL` internal-linkage handled), not a
  substring or even a whole-component test. A fourth door, same shape: when an export name has no
  underscore, `method == name`, and the `find_disasm(name)` key was assigned with NO class check —
  `channels/OZBSplineInterpolator.ts: interpolate` was rejected as a CHEAT against
  `ProChannel.OZBezierInterpolator.interpolate.s`, a different interpolator class.

  **Corpus measurement, all 1,607 files in `raw-port/src`, absolute paths (relative paths hide
  half of it — OPS_LOG #6), same 18-file cache: 61 cheats -> 2.** The two survivors are the only
  two judged against their OWN disassembly, and both are true positives:
  `OZDynamicSpline_setVertexSmooth` (the DISPATCH_ONLY body `prove_all` LAYER 3 already pins) and
  `OZ3DEngineScenePlacementBehavior_getLockingID` (a 5-instruction getter landed as a throw-stub —
  fixed by the port PR that came out of this investigation). The other **59 were fabricated**,
  spread over 6 files and 4 distinct classes that the cached body did not belong to.

  FIX (all four doors, in this change): a candidate must name the class AND the method, the method
  test being POSITIONAL (`_sym_names_method` + `_itanium_components`), with the Itanium
  special-member spellings `C[123]`/`D[012]`/`aS`/`eq` a TS `_ctor`/`_dtor`/`_assign`/`_equals`
  export can never contain literally. One deliberate escape hatch keeps the teeth where
  they matter most: a file with exactly one export and exactly one cached candidate that names the
  class is unambiguous, and that is the shape of nearly every fresh port unit. Anything else falls
  through to the existing NO-DISASM FLAG — "the reviewer must re-derive this one from the binary" —
  which is exactly what the gate already does when nothing resolves, and is the only honest answer.
  Locked by `verifier/test_g5_bare_key.py` (10 positional unit cases + 5 end-to-end G5 fixtures, wired into `prove_all` as LAYER 2c): it
  fails on the pre-fix code and passes after.

  Sanity check that the fix keeps its teeth rather than just going quiet: on the **pristine main**
  version of that same file the fixed gate reports **1 cheat, not 0** — `getLockingID` resolved to
  its OWN `.s` (EMPTY, a 5-instruction getter) while the landed TS throws "not yet transcribed".
  That one is a TRUE positive, and porting it is what PR "port: OZ3DEngineScenePlacementBehavior::
  getLockingID" does. 11 fabricated verdicts -> 1 real one.

---

## Open — reported 2026-08-11 by worker 1 (G4 oracle; NOT fixed — diagnosis only)

- **G4, the only un-fakeable gate, cannot run AT ALL right now, so every oracle-mapped file on main
  is unmergeable.** Reproduced in a fresh pool worktree AND in the canonical checkout, so it is not
  a worktree artifact:

      $ python3 -m fct.parity.driver sweep curve.interp.bezier.eval
        HARNESS_BROKEN — refusing to record:
          FAIL S2_TS_WORKER_LIVE: worker raised: TS parity error for PCMath_easeInOut:
               The "path" argument must be of type string. Received undefined

  `gate.sh` correctly turns that into `ORACLE HARNESS BROKEN — G4 could not run (this is a REJECT,
  not a pass)` (the #63/worker-02 fix doing its job — a gate that cannot run must not look like one
  that ran), so `gate.sh <file>` REJECTS unconditionally for every class in
  `army/gate/oracle_map.json`: OZInterpolator, OZBezierInterpolator, PCMath, OZSpline,
  OZLinearInterpolator, OZSCurveInterpolator, CMTime. Confirmed end-to-end: a gate run on the
  UNMODIFIED landed `src/channels/OZBezierInterpolator.ts` returns REJECT with G1/G2/G5/G6/G7 all
  clean and only G4 failing.

  ROOT CAUSE, two layers deep, neither of them the oracle itself:
  1. `fct/parity/selftest.py` S2 calls `worker.eval("PCMath_easeInOut", {...})` with **no `node`**.
     `bridge.TSWorker.eval` only emits the module-addressed request `{modulePath, exportName, args}`
     when a node supplies `ts_module`; with none it falls back to the LEGACY `{fn, args}` shape,
     which `army/verifier/generic_worker.ts` no longer speaks — the worker reads `req.modulePath`
     as `undefined` and `pathToFileURL(undefined)` throws the "path" TypeError. The selftest is the
     harness's own trust gate, so this one failure aborts every sweep before it starts.
  2. Fixing S2 alone is NOT enough, and this is the part to be careful with. `driver._sweep_curve`
     reads `e_out["outVal"]`, but `generic_worker.ts` answers `{ok, ret, outArgs:{arg5, arg6}}` and
     the TS port itself returns `{out, speed}` — three different names for one value, with no
     mapping anywhere. Making G4 green needs an explicit output-name contract in `registry.json`
     (e.g. `ts_outputs: {"outVal": "out", "outDeriv": "speed"}`) plumbed through `bridge.eval`.
     Guessing that mapping is exactly the "wrong ctypes marshalling produces confident garbage
     verdicts" hazard already flagged under the autoreg/autosig item, so it wants doing
     deliberately, not as a drive-by inside a port PR. Left unfixed and reported instead.



## Open — reported 2026-08-10 by worker 1 (oracle reachability; new)

- **THE ROSETTA WORKAROUND FOR THE ARCHITECTURE BUG IS INCOMPLETE, AND THE INCOMPLETE HALF IS
  SILENT.** The "wrong architecture" entry below says to run the harness under
  `arch -x86_64 /usr/bin/python3`. That fixes **dlopen** (the process maps the x86_64 slice) but
  **not `nm`**: a bare `nm -n <binary>` still reports the **ARM64** slice even from a Rosetta
  process, because `nm` without `-arch` defaults to the host's native architecture regardless of the
  caller's translation. `fct/parity/local_call.py::_vmaddr` uses exactly a bare `nm -n`, so
  `local_fn()` under Rosetta computes **(arm64 vmaddr + x86_64 slide)** — an address that is inside
  the mapped x86_64 image but points at *some other function*. Measured on
  `HgcToneParamCurve4AntiSymmetric`: the C2 ctor is at `0x2ce5f8` in the arm64 slice and `0x350ce0`
  in x86_64. It only failed LOUDLY here because the arm64 slice contains **no `RenderTile_AVX`
  symbol at all** (AVX is x86-only, so those methods do not exist in that slice) — the ctor and
  `SetParameter` lookups silently succeeded at arm64 addresses and would have been called at the
  wrong offset. Fix in `_vmaddr`: pass `-arch x86_64` to `nm` (and, ideally, refuse to run when the
  process is not x86_64, as the file's own comment already argues).
  Workaround until then: resolve with `nm -n -arch x86_64` yourself and add `_image_slide(fw)`.

- **Ozone AND Flexo *are* dlopen-able outside the app bundle — the standing "they can't be" note is
  wrong, and it has been suppressing oracles on two of the five frameworks.** The blocker is only
  `@rpath` resolution, and `DYLD_FRAMEWORK_PATH` genuinely cannot fix it — `/usr/bin/python3` is
  hardened, so dyld strips every `DYLD_*` variable from it. What DOES work, with no env vars: walk
  the `@rpath/...` entries of `otool -L`, `ctypes.CDLL(<absolute path>, RTLD_GLOBAL)` each dependency
  **depth-first**, then load the target — once an image with the right install name is already in
  the process, dyld satisfies the `@rpath` reference from it. Flexo loads after 36 preloaded images,
  Ozone after 43 (a few dependencies fail or are missing on disk; it still loads, and lazily-bound
  symbols are irrelevant to a leaf math call). Verified end-to-end by calling four real functions
  this way — `FFAudioPlaybackScrubBuffer::calculateBufferPosFrame` (4096/4096 bit-exact),
  `FFMXFTimecodeCursor::presentationTimeStamp` (2048/2048), `OZRig::begin_descendants` (4096/4096),
  and `tile_hoist` (3000/3000). **All five in-scope frameworks are oracle-able as of now**, so
  "the framework won't load" is no longer a reason to sign a port on reading alone.
  A ~30-line reusable loader is worth adding next to `fct/parity/oracle.load_framework`.

- **Two traps when writing one of these differential harnesses.** (a) `dlsym` wants the symbol
  WITHOUT the Mach-O leading underscore: `nm` prints `__ZN11HGRenderJob23Set...`, and you pass
  `_ZN11HGRenderJob23Set...`. (b) Python's `json.dump` emits bare `NaN` / `Infinity`, which
  **`JSON.parse` rejects** — a float-valued fuzz corpus handed to the TS side dies with a syntax
  error at line 1. Serialise floats as their raw bit patterns (or hex) and rebuild them with a
  `DataView` on the TS side; that also makes the comparison bit-exact instead of value-equal, which
  is what you wanted anyway for signed zero and NaN payloads.

- **`Hgc*RenderTile_AVX` has landed precedent files, but the precedent is a THROW-STUB.**
  `HgcBT2100_HLG_OETF.ts` is 1071 lines and looks like a fully ported AVX node; its
  `RenderTile_AVX` is `throw new Error("… not yet transcribed — 227-line …")`. Do not read "this
  class already landed" as "the AVX body is ported" when sizing one of these units. The
  constant-pool/ctor documentation in those files IS reusable and is the fastest way into the
  layout; the pixel loop still has to be transcribed.

---

## Open — reported 2026-08-11 by worker 2 (differential-harness traps; new)

These are HARNESS bugs, not port bugs, and both of them present as "the port is wrong". That is
what makes them expensive: the natural reaction is to go re-read the disassembly of a correct
transcription. Cost me ~10 minutes each; they are trivial once named.

- **A ctypes `CFRange` declared as `c_long * 2` SEGFAULTS the oracle process.** CoreFoundation
  takes `CFRange` BY VALUE (two `CFIndex` fields); an array type marshals as a POINTER, so
  `CFStringGetCharacters(ref, (c_long*2)(0, n), buf)` hands CF a pointer where it expects 16 bytes
  of struct and the process dies with SIGSEGV — no Python traceback, just `Segmentation fault: 11`.
  A segfaulting oracle is indistinguishable from a port that corrupts memory until you look. Fix:
  `class CFRange(ctypes.Structure): _fields_ = [("location", c_long), ("length", c_long)]` and pass
  it by value. Same hazard for any by-value CF/CG struct (`CGRect`, `CFArrayCallBacks`, …).

- **`Array.from(str, ch => ch.charCodeAt(0))` in a TS oracle driver SILENTLY TRUNCATES every
  surrogate pair.** `Array.from` over a string iterates CODE POINTS, so a pair collapses to one
  element and only its HIGH half survives the read-back. My first run of the PCString char16
  differential reported 2/315 divergences (an emoji and a random buffer) against a port that was
  correct — the bug was in the harness's read-back, and it only fires on non-BMP data, i.e. exactly
  the interesting cases a good corpus adds. Index by code unit instead:
  `for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i))`. Related to the existing JSON/NaN
  note above: **exchange code units, never JS strings, on an oracle wire.**

- **The two OPEN Ozone/`nm` items above now have a drop-in fix: `raw-port/re/oracle/ozone_loader.py`**
  (landed with the OZLightingFolder_Factory port). `load_framework(fw)` preloads the `@rpath` chain
  depth-first so Ozone/Flexo load outside the app bundle with no env vars; `nm_addr(fw, sym)` uses
  `nm -n -arch x86_64`; `image_slide(fw)` asks dyld for the real slide; and `local_fn(...)` composes
  them into a callable for symbols dlsym CANNOT reach — `nm` type `t` LOCALS, which is most of the
  Ozone factory bodies. It also refuses to run unless `platform.machine() == 'x86_64'`, which is the
  guard the OPS_LOG entry above asks for. Verified end-to-end by calling
  `OZLightingFolder_Factory::getBundleID` @0x4b2820 (a local symbol) and checking the returned
  pointer against the literal VA its `leaq` computes. **"The symbol is local, so I can't oracle it"
  is no longer true.**

## Open — reported 2026-08-11 by reviewer 2 (post-merge bookkeeping + rebase routing; new)

- **`mark_ported.py` IS A SILENT NO-OP FOR EVERY REVIEWER DURING A SWARM RUN, AND IT PRINTS A
  HEALTHY-LOOKING LINE WHILE DOING NOTHING.** Both briefs end the merge step with "then
  `mark_ported.py` — unlocks the callers". It cannot work as invoked. `mark_ported` classifies from
  `scan_src(ROOT)`, i.e. the `raw-port/src/*.ts` files **on disk in the canonical checkout**, and
  nothing ever advances that checkout while agents are live: the ONLY `git reset --hard origin/main`
  in the swarm is `swarm_maint.sh` line 29, and it is gated behind *the tree is DIRTY* **and** *no
  `pr_gate.sh|pr_submit.sh|pr_land.sh|rebase_pr.sh` is running*. A clean-but-behind tree is never
  fast-forwarded at all, and with 16 agents the second condition is almost never true either.
  Measured today: after landing #382 and #396 the canonical tree was **9 commits behind
  origin/main**, `raw-port/src/render/Gettype3_nice_satTile_AVX.ts` did not exist on disk, and both
  runs printed `ported 9249/126668 … (status changed on 0 units)` — the same 9249 before and after.
  The reviewer has no honest way to fix this locally, because the other standing invariant is
  **never edit the canonical checkout**. Consequence: units stay `todo` after landing, so
  `depgraph`'s readiness never unlocks their callers from the merge path; the ledger only moves
  when the maint cron's `depgraph.py reconcile` happens to run. FIX: make `mark_ported.py` read the
  sources from **`origin/main`** (`git ls-tree -r origin/main -- raw-port/src` + `git show`) or run
  it inside a pool worktree, instead of the working tree; then it is correct no matter what state
  the canonical checkout is in. Until then, treat a "0 units changed" from `mark_ported` as *no
  information*, not as *already up to date*.

- **`rebase_helper.py <Class>` cannot see the `port/<Class>__slot<N>` branches that entry #1's fix
  created, and it fails with an exit code the reviewer brief does not cover.** It hardcodes
  `BR = f"origin/port/{cls}"`, so for PR #389 (head `port/HGRenderJob__slot7`) it printed
  `no branch origin/port/HGRenderJob` and exited **1** — not 0 (pushed a rebase) and not 6
  (NEEDS_WORKER_REBASE), the only two outcomes REVIEWER_BRIEF documents. So the reviewer's
  mechanical union-rebase (rebase-ownership case 2) is silently unavailable for every slot-suffixed
  branch, even when the exports really are disjoint; the PR can only fall through to the worker
  rebase queue and burn attempts against the cap-3 auto-close. #389 was auto-closed that way today
  after I had already verified its body faithful (oracle, 1806 cases) — the port was correct and the
  work was thrown away on branch bookkeeping. FIX: resolve the branch from the PR's head ref
  (`gh pr view <PR#> --json headRefName`) rather than deriving it from the class name, and give the
  "no such branch" case its own exit code so the brief can route it.

---

## Open — known, not yet fixed

- **THE EXECUTABLE ORACLE CALLS THE WRONG ARCHITECTURE, AND FAILS TOWARD ACCEPT.** (reviewer-2,
  2026-08-10, found on PR #330.) Every port in this repo is transcribed from the **x86_64** slice —
  `disasm.sh` thins to `/tmp/<FW>.x86_64` and every `@0xADDR` citation is an x86_64 offset. But the
  oracle runs in the box's native **arm64** process: `fct.parity.oracle.resolve` dlsym's the arm64
  image, and `local_call._vmaddr` reads a bare `nm -n`, which on Apple silicon reports arm64
  addresses. So the differential compares the TS port against *code the port did not transcribe*.

  Usually harmless — a plain struct offset is fixed by the C++ declaration, so it is the same in both
  slices (the HGRenderNode +0xb0/+0xa0, Json::Value::swapPayload and CZString oracles all cross-checked
  clean). It is **not** harmless wherever the two slices disagree, and the flagship case is libc++'s
  `std::string`: the x86_64 slice uses `is_long` = **bit 0 of byte +0x00**, short size = `byte0 >> 1`,
  long data at **+0x10**; the arm64 slice uses `is_long` = **sign bit of byte +0x17**, short size = that
  byte unshifted, long data at **+0x00**. Feed x86_64-layout objects to the arm64 body and every string
  reads as EMPTY — on `OZChannelRef::operator!=` the oracle answered "equal" to all 900 cases, i.e. it
  reported the port and the binary agreeing when it was comparing nothing. **A silent false VERIFIED is
  worse than no oracle**, because a reviewer signs on it. (Same hazard class for FMA contraction in the
  pure-math parity nodes: arm64 may fuse a multiply-add that x86_64 does not, moving the last ulp.)

  WORKAROUND — proven, use it whenever layout or codegen could differ: run the harness under Rosetta so
  dlopen maps the x86_64 slice the port was transcribed from.

      arch -x86_64 /usr/bin/python3 my_oracle.py     # then dlsym normally for `nm` type T symbols

  With that one change the same 900-case OZChannelRef differential went from 877 bogus "divergences"
  to 0 real ones. The real fix is for `oracle.py`/`local_call.py` to either re-exec themselves under
  `arch -x86_64` or refuse to run when `platform.machine() != 'x86_64'`, so nobody can get a confident
  verdict out of the wrong slice by accident.

- **A REVIEWER'S `acquire-at` WORKTREE BECOMES UNRELEASABLE THE MOMENT ITS PR LANDS — the SUCCESS
  path leaks a pool slot.** (reviewer-1, 2026-08-11, found on #381.) `wt_pool.sh acquire-at <SHA>`
  leaves the slot on a **detached HEAD** at the PR head. When that PR then squash-merges, GitHub
  deletes the branch, so the commit is (a) not an ancestor of `origin/main` — squash makes a NEW
  commit — and (b) contained in no `origin/*` ref. That is exactly `wt_has_work`'s unpushed-commit
  test (`rev-list origin/main..HEAD` non-empty AND `branch -r --contains HEAD` empty), so `release`
  refuses with "UNCOMMITTED or UNPUSHED work" on a tree whose `git status --porcelain` is COMPLETELY
  CLEAN, and the slot leaks. Same POOL_FULL endgame as #12, but inverted and worse: it fires on
  every SUCCESSFULLY LANDED review, so the harder reviewers work the faster the pool drains, and the
  refusal message names work that does not exist. #258 force-released `pr_gate`'s own lease and the
  #16/disasm-cache carve-out covers the cache — neither covers the hand-taken `acquire-at` lease the
  reviewer brief explicitly tells every reviewer to take.
  FIX: in `wt_has_work`, gate the unpushed-commit test on HEAD being a BRANCH
  (`git symbolic-ref -q HEAD`). A detached checkout is by construction a read-only inspection lease —
  `acquire-at` is the only thing that creates one, and its commit came from a remote PR head, so
  there is nothing there to lose. That keeps the guard's real purpose intact: a slot on a genuine
  `port/<Class>` branch with an unpushed commit is still protected (verified against a live peer
  slot in exactly that state while diagnosing this).
  WORKAROUND until then: `wt_pool.sh release <path> --force` after confirming
  `git -C <wt> status --porcelain` is empty AND the file you gated is byte-identical on
  `origin/main` (`git show origin/main:<path> | shasum`). Do NOT reflexively `--force`: on a slot
  whose HEAD is a real branch that message is TRUE and forcing it destroys a peer's work.

- **`depgraph.py` does not trace `std::call_once` proxy/lambda initializers**, nor function pointers
  handed to `pthread_create`/`dispatch_group_async_f`, so units are still handed out READY while their
  real call chain has unported deps. No longer *destructive* — #280 makes the unit requeueable with
  `depclaim.py drop` — but still wasted worker time. Reported by 5 workers.
- **Silent-wrong-answer class — partly closed.** #255 added G7, which FLAGS new non-null-asserted
  computed table reads so a reviewer must clear them. The stronger fix is still open: `autoreg.py` /
  `autosig.py` already implement "auto-oracle every exported `T` symbol", but **the gate never
  invokes them**, and `autosig` rejects enum args (`HGFormat`) — the two reasons #154 escaped.
  Wiring them in needs care: wrong ctypes marshalling would produce confident garbage verdicts.
- **`pr_gate` status descriptions don't match `rebase_claim.sh`'s `regression|rebase` filter**, so
  PRs needing a rebase can sit forever unless a reviewer hand-writes the status text.
- **One class, two files** — `OZScene` exists in both `channels/` and `nodes/`; `OZRenderParams`
  `+0x1e5` is aliased by two differently-named landed fields, which makes a faithful getter for that
  byte impossible to write until the ledger is unified.

---

## Standing rules that came out of the above

1. **ADD-only is enforced, not advisory** (G6). Extending a class file means `git show
   origin/main:<path>` first, then append.
2. **Give `gate.sh` an absolute path.** Always.
3. **A rejection outranks a later approval.** Overriding a peer means dismissing their review with a
   reason, deliberately.
4. **Approve with your own evidence, before landing.** No tool will mint an approval for you.
5. **Never close a dup, or trust a "already on main" status, without confirming on main.**
6. **A fix can be the next outage.** #240's release guard was correct and still deadlocked the swarm
   two hours later, because `pr_gate` was a caller I had not considered. When you tighten a shared
   primitive, enumerate every caller — and prefer a self-healing fallback (#258's disposable-lease
   reclaim) over trusting that you found them all.
