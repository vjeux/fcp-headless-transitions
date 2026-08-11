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
| 22 | Load hit 73 on a 10-core box with 16 agents; `nm` processes pinned a core each for 60-120s | Agents answered one-off symbol questions with `nm -arch x86_64 "/Applications/Final Cut Pro.app/.../Flexo"` — a **78 MB fat** binary, rescanned by Defender/Cyberhaven on every open. The same answer was already cached in `army/inventory/<FW>.syms.txt` (144,642 defined symbols, all 5 frameworks). Measured: **nm on fat Flexo >120s vs `grep` on the cache 0.078s (~1000x)**. Same shape as #10 | **Use the cached inventory.** `grep <pattern> raw-port/army/inventory/<FW>.syms.txt` -> `<addr> <T|t> <mangled>`. Only for UNDEFINED symbols or a flag the cache cannot answer, run nm against the THIN slice `/tmp/<FW>.x86_64` (regenerate with `lipo -thin x86_64`) and capture it ONCE into a variable instead of piping nm twice in one command. **Measured follow-up: thinning barely helps** — under swarm load the same nm took 4m24s fat vs 3m54s thin, so the cost is the symbol-table walk + the security stack, not the fat header. The cache is the only real fix; if it is stale, ONE agent should regenerate it for everyone with `dump_syms.sh` |
| 23 | 9 concurrent identical `mark_ported.py` runs, ~4 min each at 176% CPU | It is a GLOBAL, idempotent, whole-repo reconciliation, but every agent runs it after every merge, so N agents produce N identical answers and N full scans of `src/` | `pgrep -f mark_ported` first and **skip if one is already running** — that run's result covers your commit too. A coalescing lock inside the tool is the stronger fix and is still open |
| 24 | **G4 — the only un-fakeable gate — could not run AT ALL, and its way of failing is a REJECT, so every file mapped to an oracle node was unmergeable no matter what it contained** (OZInterpolator, OZBezierInterpolator, PCMath, OZSpline, OZLinearInterpolator, OZSCurveInterpolator, CMTime). Diagnosed as open by worker 1 earlier the same day; hit again by worker 6 on an oracle-VERIFIED port, where the gate REJECTED the file *unmodified on main* too | The engine parity worker was replaced by the module-addressed `generic_worker.ts` and FOUR callers were never migrated, each failing one layer deeper. (a) `selftest.py` S2 sent the deleted name-keyed request `{"fn": ...}`, so the worker got `modulePath: undefined` → Node's *The "path" argument must be of type string* → S2 FAIL → `HARNESS_BROKEN` → REJECT before any port was called. (b) `bridge.eval`'s positional marshalling kept only `kind == "in"` args and silently DROPPED every `in_array`, so `OZBezierEval(ctrl[4], u)` was invoked as `OZBezierEval(u)`, returned undefined, and the driver died on `float - NoneType`. (c) Nothing mapped `{ok, ret, outArgs}` into the ORACLE's output names → `KeyError: 'outVal'`. (d) A port that returns an object because the C function used out-pointers (`easeInOut -> {out, speed}`) has no derivable mapping to `outVal`/`outDeriv`. Note the shape: RED for a harness reason on exactly the files it can actually measure — the mirror image of #6 | #438 — S2 speaks the module-addressed protocol; `bridge.eval` includes `in_array` inputs and sends `argKinds`; new `bridge._normalize_outputs` maps the reply into oracle names via an explicit `ts_outputs` contract in registry.json (worker 1's recommendation; added to `curve.interp.ease`). PROVEN BOTH WAYS: three previously-dark nodes now sweep GREEN against the live binary — `curve.interp.bezier.eval` 166 cases 0.0e+00, `curve.interp.bezier.findparam` 135 cases 5.0e-16, `curve.interp.ease` 201 cases 0.0e+00 (state.json shows they last swept 2026-07-29/30, i.e. the migration is when they went dark) — AND the gate still REJECTS a deliberately sabotaged `OZBezierEval` (DIVERGED, max_abs_err 4.5e+01), a sabotaged `easeInOut` (S2 FAIL, 0.123), and a bogus `ts_module` (S2 FAIL). **Reviewers: `sweeping <node> ... -> VERIFIED` in G4 output is NEW — before this, G4 printing nothing but a stack trace was the normal state.** |

---

## Open — reported 2026-08-11 by worker 1 (Ozone oracle — CONFIRMED, and a contradicted note)

- **CONFIRMED, second independent run: Ozone loads outside the app bundle, with ZERO failed
  dependencies, and a NON-leaf Ozone method was differentially oracled through it.** The
  recursive-`@rpath`-preload recipe below works exactly as described: depth-first `otool -L` walk,
  `ctypes.CDLL(<abs path>, RTLD_GLOBAL)` each dependency, then the target — **44 images preloaded,
  0 failures**, under `arch -x86_64 /usr/bin/python3`, and `dlsym` then resolved
  `_ZN7OZScene30clearTemporaryFilesPersistenceEv` (a `T` symbol; pass it WITHOUT the leading
  underscore) first try. The `@rpath` roots that resolved everything:
  `Contents/Frameworks`, `Contents/Frameworks/Flexo.framework/Versions/A/Frameworks`,
  `Contents/PlugIns`, `Contents/Frameworks/ProApps`.

- **So the drop reason on `HgcRetimeBlend::GetDOD` is WRONG and should not be repeated.** It states
  "Ozone CANNOT be dlopen'd even under Rosetta with a recursive @rpath preloader - the chain
  Ozone->ProGraphics->ProAppsFxSupport dies on 'Symbol not found: __ZN4HGPQ10kDefaultC1E'". That did
  not reproduce: the same recipe reported 0 failed images. Whatever bit that, it is not a property
  of loading Ozone, and "static transcription only" is not the right conclusion for an Ozone unit.
  Before signing an Ozone port on reading alone, TRY the loader.

- **You do not need a value->value function to get a real differential.** `clearTemporaryFilesPersistence`
  walks a `std::map` and mutates a byte per entry — no return value, no scalar inputs. It was still
  oracled by building the real structure in `ctypes` memory (libc++ `__tree_node`: `__left_` +0x00,
  `__right_` +0x08, `__parent_` +0x10, value at +0x20), poisoning the whole arena, calling live FCP,
  and diffing the arena BYTE FOR BYTE afterwards — which proves both "the intended bytes changed"
  and, far more valuable, "nothing else did". Six tree shapes (1..31 nodes) plus the empty map, then
  the identical structures replayed through the TS port via `tsx`: 7/7 agree. Cost: a few minutes.
  The lesson worth generalising — **a memory-mutating method is oracle-able by snapshot-diffing an
  arena you control**, and that check catches an over-write a return-value comparison never would.

## Open — reported 2026-08-11 by worker 1 (G5 resolution; FIXED in #404)

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

> **FIXED 2026-08-11 by worker 6 — see row 24 of the Fixed table.** The diagnosis below is exactly
> right and its recommended contract (`ts_outputs` in registry.json, plumbed through
> `bridge.eval`) is what was implemented, deliberately and in its own PR rather than as a drive-by,
> with negative controls in both directions. TWO MORE layers sat behind the two below: `bridge.eval`
> dropped every `in_array` argument, and nothing mapped the worker's `{ok, ret, outArgs}` reply into
> the oracle's output names. Three previously-dark nodes now sweep GREEN against the live binary.

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



## Open — reported 2026-08-11 by reviewer 5 (three reviewer-side traps; NEW)

Independently hit while reviewing #385/#389/#394/#402/#403/#406/#421/#428/#431/#443. The first one
cost a WRONG REJECT on a correct PR, which is the expensive direction for a reviewer.

- **`git diff origin/main <branchHead>` IS NOT A MERGE PREVIEW, and reading it as one makes every
  stale-base PR look like it deletes landed work.** Reviewing #403 I checked "does this branch drop
  content main already has" with a two-ref diff. It showed 40 lines of worker 2's
  differential-harness-traps section (landed minutes earlier as #417) on the `-` side, so I filed a
  blocking REQUEST_CHANGES for a regression that does not exist: a two-ref diff renders *the branch
  is behind* as deletions. The real three-way result keeps everything —

      git merge-tree --write-tree origin/main <branchHead>   # prints the merged TREE sha
      git show <tree>:<path>                                 # inspect the ACTUAL merge result

  354 lines = main's 324 + the PR's 30, with all 6 keyword hits of the "deleted" section intact. I
  dismissed my own review with the reason and landed the PR. Stale-base is the NORMAL state in this
  swarm, so this false-rejects almost everything if a reviewer adopts it as a habit. Note
  `regression_check` already gets this right with a 3-dot `-`-side check; the briefs never say out
  loud that the two-ref form is the wrong tool.
  **RULE: `git diff origin/main...<branchHead>` (three dots, against the merge base) or
  `git merge-tree --write-tree`. NEVER `git diff origin/main <branchHead>`.**
  (Smaller, related, and NOT what bit me: `pr_gate.sh` skips regression_check entirely when a PR
  touches no `raw-port/src` file — it prints "no raw-port/src ports to gate (infra/tooling PR)" and
  posts SUCCESS. Harmless for a non-conflicting doc edit because git unions it; it would only
  matter for an infra PR that rewrites a shared file wholesale, the #9 shape.)

- **Backticks inside the double-quoted evidence string of `ghapp/pr_review.sh` are
  command-substituted, silently deleting text from the durable review body.** Approving #389 with
  ``... so `?? ''` models the cmov ...`` posted an APPROVED review reading "so  models the cmov",
  and printed `/bin/sh: ??: command not found` AFTER the success line where it is easy to miss.
  Reviewer evidence is quoted CODE (`movl 0x44(%rdi),%eax`, `!== -1n`, `?? ''`), so backticks are
  the natural way to write it, and in a double-quoted shell argument they are substitution — which
  also EXECUTES whatever is inside them. The verdict still posts, so nothing fails loudly; the
  evidence of record just quietly loses a token.
  FIX: give `pr_review.sh` a `--body-file`/stdin path. WORKAROUND: single-quote the evidence
  string (or heredoc it); never double quotes.

- **A reviewer's own `wt_pool.sh acquire-at` lease cannot be released without `--force`, so manual
  oracle work still leaks pool slots (the #12/#372 family, through a third door).** `acquire-at`
  leaves the worktree detached at the PR head, which is BY DEFINITION a commit not on origin/main,
  so `release` reads it as unfinished work and refuses with "commit+push it (pr_submit.sh), or
  re-run with --force to abandon it deliberately". #258/#372 fixed exactly this for `pr_gate.sh`
  (it releases `--force`); a reviewer who leases a worktree by hand to drive a TS differential —
  which REVIEWER_BRIEF asks for — hits it every time, and one who does not read the refusal leaks
  the slot. That is the failure that stopped the swarm in #12.
  FIX: `release` should treat a detached `acquire-at` lease as disposable, the same self-healing
  rule as the `gate/<sha>` leases, since it can never hold authored work.

## Open — reported 2026-08-11 by reviewer 7 (rebase_helper false-BAILs on a COMMENT; NEW)

- **`rebase_helper.py`'s overlap check counts a `.s` FILENAME in a comment as an added symbol, so the
  mechanical union rebase it exists to perform BAILs on rebases that are provably disjoint.** This is a
  second, independent defect from reviewer 8's branch-name entry above (which I also hit and confirm:
  `rebase_helper.py HGRenderJob` handed me a `_rebased` branch built from #396's content while I held
  #388; I deleted it and left the PR for the worker queue).
  Measured on PR #392 (`HGMetalDeviceInfo`): the branch adds exactly ONE method, `isExternal`; main
  (via #393, landed mid-review) added exactly ONE, `isBuiltin`. Disjoint — precisely PR_FLOW case 2,
  "shared file, DISJOINT top-level exports", which the reviewer is told to union mechanically. Instead:

      $ python3 raw-port/army/tools/rebase_helper.py HGMetalDeviceInfo
      BAIL: raw-port/src/render/HGMetalDeviceInfo.ts — branch AND main both add
        ['__ZNK17HGMetalDeviceInfo10isExternalEv.s', '__ZNK17HGMetalDeviceInfo9isBuiltinEv.s']
        (needs human semantic merge)                                                    # exit 4

  Note the `.s` on both tokens. Those are not symbols — they are the `re/disasm/*.s` FILENAMES each
  file cites in its header comment to pin the shared `+0x28` slot (line 23 of each version). The cause
  is `MANGLED = re.compile(r'__Z[A-Za-z0-9_\$.]+')` at rebase_helper.py:36: the character class
  includes `.`, so the regex runs past the mangled name and swallows the `.s` suffix, and a
  DOCUMENTATION CROSS-REFERENCE to a sibling's disassembly is then counted as a symbol that side adds.
  Both sides cite each other, so the "overlap" is guaranteed whenever two branches document the same
  field from opposite ends — which is exactly what PORTING_SPEC asks workers to do.
  HARM: the union path is reviewer-safe and fast; the fallback is a WORKER rebase, which is slower,
  needs judgment, and is capped at 3 attempts before the PR is auto-closed and the symbol re-handed —
  so a verified port can be thrown away and re-done because of a comment. It is also PROGRESSIVE, the
  same way OPS_LOG #6 was: the better the sibling-offset documentation gets, the more often it fires.
  Same family as #20/#21/#404 — a regex matching text it was never meant to see.
  FIX: anchor the mangled-name match so it cannot absorb a file extension (e.g. require the token to
  end at a non-identifier character and strip a trailing `.s`), or — better — take the symbol set from
  CODE lines only, ignoring `//` and `/* */` comment text, in both `rebase_helper.py` and
  `regression_check.py`. `regression_check` has the same swallowing: on PR #391 it reported
  `DROPS 2 symbol(s): __ZN11HGRenderJob12GetTypeLabelEv` and `__ZN11HGRenderJob12GetTypeLabelEv.s`,
  i.e. one real symbol double-counted as two. That one is currently harmless (the symbol really was
  dropped) but it inflates every regression report and would fire on its own if only the comment moved.

- **A G6/add-only rejection posts a status description the rebase queue cannot see, so the PR sits
  forever.** The general mismatch is already listed under "Open — known, not yet fixed"; this is the
  specific, reproducible half. `regression_check`'s failure posts `regression (rebase needed)`, which
  matches `rebase_claim.sh`'s `grep -qiE 'regression|rebase'` filter — but when the SAME stale-base
  condition is caught by **G6 add-only** first, `pr_gate` posts the generic `G0-G5 gate reject`, which
  does not match, so no worker will ever claim it. Measured on PR #392: G6 rejected it for dropping the
  landed `isBuiltin`, status read `G0-G5 gate reject`, and the PR was invisible to `rebase_claim.sh`
  despite being a pure rebase. WORKAROUND (what I did): after a G6-only rejection, hand-write the
  status so the queue can see it —

      bash raw-port/army/tools/ghapp/gh_as.sh reviewer api -X POST \
        repos/vjeux/fcp-headless-transitions/statuses/<headSHA> \
        -f state=failure -f context=faithfulness-gate \
        -f description="regression (rebase needed): G6 add-only, main landed <symbol> under it"

  FIX: `pr_gate.sh` should classify a G6 add-only failure as a rebase reason, not a generic gate
  reject — the two are the same condition detected by different checks.

- **A BIT-PATTERN differential reports false divergences wherever the machine produces a NaN, and no
  TypeScript port can ever fix them.** Harnesses in this repo increasingly compare f32 results as raw
  u32 bit patterns — correctly, because that is the only way to be exact about signed zero. But x86's
  default "indefinite" QNaN, produced by `inf - inf`, `0 * inf`, `0/0` and friends in SSE, is
  **0xffc00000 — the SIGN BIT IS SET**. JavaScript has no way to store that: every NaN written into a
  `Float32Array` is canonicalised to **0x7fc00000**. So a bit-exact comparison shows a divergence on
  every lane where the kernel produced a NaN, forever, no matter how correct the transcription is.
  Measured on PR #441 (`hg_read_span_4s_m0_gqt_m0_premul`) while reviewing it: with a fabricated
  `[+inf, -inf, 0, 1]` bias the span kernel computes `inf - inf`, and my adversarial re-run reported
  **2,128 diverging lanes out of 29,760 — every one of them NaN-vs-NaN, sign-bit only, and ZERO
  non-NaN divergences**. The port was right; the comparison was over-strict.
  WHY IT MATTERS BOTH WAYS: a reviewer who does not classify these will REJECT an honest port (I nearly
  had to), and a worker who "fixes" them will start writing NaN special-cases that are pure fiction.
  RULE for anyone writing or reading one of these harnesses: when the two sides differ, test
  `(u & 0x7f800000) == 0x7f800000 && (u & 0x007fffff) != 0` on BOTH; if both are NaN, count it
  separately as `NAN_PAYLOAD` and keep it out of the verdict, exactly as PR #454's harness keeps its
  run-dependent address-reuse signal out of its verdict. Report it — do not hide it — because a
  NaN appearing where the machine produces a finite number is still a real defect, and that is
  precisely the distinction the classification preserves.
  (Same family as the f64 case OPS_LOG already notes for `json.dump` emitting bare `NaN`: NaN does not
  survive a round trip between these two languages, in either direction.)

## Open — reported 2026-08-11 by reviewer 8 (rebase_helper targets the wrong branch; NEW)

- **`rebase_helper.py <Class>` REBASES A DIFFERENT AGENT'S BRANCH AND REPORTS SUCCESS, and both
  briefs tell the reviewer to merge that result.** `rebase_helper.py` line 64 hardcodes
  `BR = f"origin/port/{cls}"`, but a class no longer has one branch. OPS_LOG #1's fix (#240) made
  `wt_pool acquire` fall back to `port/<Class>__slot<N>` on contention, and `pr_submit.sh` explicitly
  allows the `__slot<N>` / `_<suffix>` variants — so at the time of writing **HGRenderJob had six open
  PRs on six branches**: #387 `__slot4`, #388 `__slot5`, #389 `__slot7`, #390 `__slot9`, #391
  `__slot8`, and #396 on the bare `port/HGRenderJob`. A reviewer holding ANY of the five `__slotN`
  PRs who follows REVIEWER_BRIEF's documented regression step (`rebase_helper.py <Class>`, "exit 0 →
  it pushed a rebased branch, gate+merge that") gets exit 0 and
  `PUSHED origin/port/HGRenderJob_rebased … GATE PASS … Ready for reviewer` — for **#396's content**,
  which they never reviewed. Measured on PR #390: that PR adds `UsesOnlyCPUResource` (+284 lines); the
  branch `rebase_helper` handed back adds only `GetType()` (+61 lines).
  Two harms, both silent: (a) a reviewer merges another agent's unverified port under their own
  APPROVE — the gate cannot catch it, because the wrong content is itself gate-clean; and (b) the PR
  the reviewer actually holds is never rebased, so it keeps failing regression forever while the tool
  keeps reporting success. Same shape as #20/#21/#404 (a bare key resolving to the wrong thing), now
  through the branch NAME, and it is the "a fix can be the next outage" pattern again: #240's
  `__slot<N>` fallback created names its sibling tool cannot address.
  FIX: `rebase_helper.py` must take the **PR number** (resolve the head branch via
  `gh pr view <PR#> --json headRefName`), or at minimum refuse to run when more than one
  `origin/port/<Class>*` branch has an open PR, instead of silently choosing the bare name. The
  reviewer-facing line in `REVIEWER_BRIEF.md` / `PR_FLOW.md` / `HARNESS_LOOP.md` should name
  `rebase_pr.sh <PR#>` semantics, never a class-keyed guess.
  WORKAROUND until then: before trusting an exit 0, `git diff origin/main...origin/port/<Class>_rebased`
  and confirm the added symbols are **your PR's** claimed symbols. If they are not, delete the pushed
  `_rebased` branch and leave the PR's FAILURE status for the worker rebase queue (`rebase_pr.sh <PR#>`
  is PR-keyed and does the right thing).

## Open — reported 2026-08-11 by worker 4 (new)

- **G5 now flags an HONEST port as NO-DISASM purely because of what the EXPORT IS NAMED, and the
  rule is written nowhere a worker reads.** The new `_sym_names_method` guard (landed 2026-08-11 by worker 1,
  and correct — it closes the sibling-symbol door that #307/#322 left open) requires the cited
  mangled symbol to name the export's OWN method: `method = name.split("_", 1)[1]`, matched
  against the symbol's LAST Itanium component or an entry in `_METHOD_ALIASES`
  (ctor/copyctor/c1/c2/dtor/dtor_d0/dtor_d1/dtor_d2/assign/equals/notequals/lessthan/greaterthan/
  index/call/deref). So the disasm can be present, correct, generated by the worker in that very
  worktree, and STILL discarded — the export name is the join key.
  Measured live: `export function OZCurveNodeParam_dtorOzoneD1` (Ozone D1 dtor, `.s` sitting right
  there) -> `NO-DISASM for @Ozone 0x208d20`, and the address in the message is not even the ported
  one — it is the first `@FW 0xADDR` in the preceding 4,000 characters, so the flag misidentifies
  the function it is complaining about. Renaming the export to `OZCurveNodeParam_dtor_d1` (method
  `dtor_d1` -> alias `D1E` -> the symbol's last component `D1`) cleared it with no code change.
  A flag holds `pr_gate` red until a reviewer signs, so this is reviewer time spent on nothing.
  ACTION FOR WORKERS TODAY: name the export `<Class>_<method>` where `<method>` is the C++ method
  name, or one of the alias spellings above for a special member. Prefer `_dtor_d1` / `_ctor_c2` /
  `_equals` over prose names like `_dtorOzoneD1`, `_operatorEquals`, `_copyEquals`.
  ACTION FOR THE TOOL: the flag text should print the address it actually resolved the export to
  (or say "no cited symbol names this method"), and the alias table should accept the plain
  `D0/D1/D2/C1/C2` spellings a worker naturally reaches for. A single-export file is already
  rescued by the `len(fns) == 1` fallback; a file with two or more exports is not, so this fires
  exactly on the ADD-only extensions the brief tells everyone to write.

- **Backticks inside a `depclaim.py drop` reason are executed by the shell.** The reason string is
  passed through `sh -c`, so a perfectly ordinary handoff note that quotes an instruction —
  ``the tail uses `vcmpnleps %xmm2,%xmm3,%xmm3` where the ymm path uses `vcmpltps` `` — reaches
  `blocked.jsonl` with those spans EMPTY (and prints `sh: vcmpnleps: command not found` in the
  middle of a successful drop, which is easy to skim past). The next worker then reads a decode
  handoff with its most precise details silently deleted. Single-quote the whole reason, or avoid
  backticks in it; `depclaim.py drop` should also reject/escape a reason containing a backtick.

- **The per-PR rebase attempt cap punishes CONTENDED CLASS FILES, not failing rebases.** Five open
  PRs extended `render/HGRenderJob.ts` at once (#387, #389, #390, #395, #396). Every time one of
  them merges, the other four go stale and each burns one of its 3 attempts on a rebase that
  SUCCEEDS — I ran #390 twice inside four minutes, both clean union-merges, and it came back at
  attempt 3/3 both times because a sibling landed in between. At the cap the PR is auto-closed and
  its symbol re-queued, so the class with the most parallel work is the one whose finished,
  reviewed work is thrown away first. The attempt counter should reset when a rebase attempt
  produces a green gate (or when the FAILURE is a NEW head SHA caused by main moving rather than
  by this branch failing), and `rebase_claim` should prefer to hand out one PR per class file at a
  time.

---

## Open — reported 2026-08-11 by the swarm parent (a replacement was dispatched into a LIVE slot; new)

- **A replacement agent was dispatched into a slot whose incumbent was still working, on the strength
  of the dispatcher's own misreading — and the slot lock cannot catch this.** I received a settled
  report from the agent holding **reviewer 1**, misattributed it to **reviewer 3**, and spawned a
  replacement addressed to slot 3. Slot 3's incumbent was mid-tick. The replacement got `BUSY` from
  `slot_lock.sh acquire reviewer 3`, and — rather than believing its prompt's story that its
  predecessor had stopped — it established liveness EXTERNALLY, from GitHub: verdicts posted by
  `reviewer-3` at 14:14, 14:16, 14:22, 14:35 and 14:38Z, the newest 2m45s before it looked. A verdict
  every 3–6 minutes is a live agent, so it stopped, held nothing, and reported. That was the correct
  call and it is the behaviour to preserve.
  WHY THE LOCK CANNOT SAVE YOU HERE: `slots/<role>-<N>/held` records only `<epoch> pid-agent` — no
  pid, no heartbeat — and the epoch is the moment the slot was FIRST acquired, not the moment it was
  last active. So the file cannot distinguish "died mid-tick two hours ago" from "working right now",
  and the 90-minute stale-reclaim measures TICK AGE rather than idleness: a healthy long-running
  reviewer looks exactly like a corpse to it. Two agents in one slot is the duplicate-review race
  (#7 / #224): two reviewers approving and merging the same PR out from under each other.
  RULES, today: (1) **Never resolve a `BUSY` from the dispatch prompt's narrative.** A prompt saying
  "your predecessor completed and stopped" is a claim about the past made by someone who was not
  there; the lock is evidence about the present. (2) Attribute liveness externally before concluding
  anything — recent `reviewer-<N>` / `worker-<N>` PR comments and verdicts are the cheapest signal.
  (3) On `BUSY`, **do not release the lock**: releasing it is worse than breaking it, because it
  invites a THIRD run alongside the live one. Stop and report instead.
  FIX: have each agent touch `slots/<role>-<N>/held` after every verdict / every unit, turning the
  lock's mtime into a real heartbeat, so stale-reclaim measures IDLENESS instead of tick age; and
  write the pid into the file so a dead holder is detectable directly. For dispatchers: the settled
  report names its own slot — quote it from the report, never from memory of who was spawned where.

---

## Open — reported 2026-08-11 by reviewer 6 (a G5 FLAG is not reproducible; a plain re-run can clear it; new)

- **The same PR head gates to a DIFFERENT verdict run to run, because whether G5 can see a symbol's
  disassembly depends on WHICH POOL SLOT `pr_gate` happened to lease.** `raw-port/re/disasm/` is
  gitignored (`.gitignore` line 51) and each warm worktree accumulates its own partial cache, so the
  slots hold DIFFERENT subsets — measured just now: wt/1 17 files, wt/2 21, wt/3 7, wt/4 13, wt/5 19,
  wt/9 18, wt/11 27, wt/13 no `re/disasm` directory at all, against 110 in the canonical checkout.
  When the leased slot lacks the symbol's `.s`, G5 cannot resolve it and raises the NO-DISASM FLAG;
  when the leased slot happens to have it, G5 judges normally and the PR gates clean.
  OBSERVED on PR #482 (`HgcBT2446_Method_A_TMO::GetDOD`), four runs on ONE unchanged head:
  `pr_gate` -> `failure — 1 G5 flag`; `pr_gate` again minutes later -> `success — 0 flags`;
  `pr_land`'s internal re-gate -> `1 G5 flag` again (it correctly refused to merge);
  `pr_gate --reviewed` -> pass. Nothing about the PR changed between any of them.
  **THE DANGEROUS DIRECTION IS THE LAUNDERING ONE.** REVIEWER_BRIEF is explicit that "the mechanical
  gate does NOT clear flags; only your adversarial re-derivation does" — but in practice a reviewer
  who simply runs `pr_gate` a second time has a good chance of watching the flag disappear and a
  green `faithfulness-gate` get posted, with no re-derivation performed and nothing recording that a
  blind spot was ever raised. `review_claim` will then hand that green-but-unreviewed PR to a
  reviewer as an ordinary clean-gate PR. The flag exists precisely to force a human look at the case
  where the gate is blind (the fabricated-constant hole — on #482 the flag was hiding whether the
  data symbol `_HGRectNull` really is 16 zero bytes; it is, at 0x3d2284 in `__TEXT,__const`, but the
  gate could not know that either way).
  Same root shape as #16 (gitignored Layer-3 fixtures absent in a fresh worktree) and as the
  inventory gap fixed by #473 — a gitignored artifact that the tooling assumes is present.
  FIX: make the disasm cache uniformly visible to every gate run the way #473 did for
  `inventory/*.syms.txt` — symlink `raw-port/re/disasm/` from the canonical checkout into each pool
  worktree (it is a pure, regenerable, content-addressed cache, so sharing it is safe and also kills
  the repeated regeneration cost). Failing that, `pr_gate` should REGENERATE the `.s` for any symbol
  it cannot resolve before deciding to flag, so the verdict is a property of the PR and not of the
  slot. Until then: never treat a flag that vanished on a re-run as cleared — only your own
  re-derivation clears it, and say so in the approval.

---

## Open — reported 2026-08-11 by reviewer 6 (review bodies silently lose evidence; new)

- **`pr_review.sh` takes the verdict body ONLY as shell argv, so any markdown backtick in a
  reviewer's evidence is executed as command substitution and its contents are DELETED from the
  permanent review record — silently, leaving a fluent sentence with a hole in it.** `pr_review.sh`
  line 33 is `BODY="${*:-}"`; there is no `--body-file`. The corruption happens in the CALLER's shell
  before the script ever sees the text, so nothing downstream can detect or warn about it.
  This bites precisely because of what the brief asks for: REVIEWER_BRIEF tells every reviewer to
  sign with substantive prose evidence, and evidence in this project is dense with backticked
  identifiers (`cmovneq`, `std::string`, `origin/port/<Class>`) and expressions.
  HIT LIVE on PR #445: a CHANGES_REQUESTED body lost two clauses — the expression naming the exact
  defect (`(a - b)` vs `-(b - a)`) and the formula quoted from the PR under review — turning the
  decisive sentence into "the classic  vs  / negate-then-multiply swap". The verdict, the minimal
  reproducer and the measured rates survived, so the review was still actionable and I posted an
  errata comment; a shorter review could have lost its entire point. The author sees no error. The
  reviewer only sees it if they happen to read their own shell's stderr, where the failed
  substitutions appear as `/bin/sh: a: command not found` — which looks like unrelated noise.
  WHY IT IS NOT JUST "quote it properly": single-quoting works until the evidence contains an
  apostrophe (it usually does — "author's", "doesn't"), at which point the agent switches back to
  double quotes and re-arms the trap. Asking every agent to hand-escape prose is the kind of advice
  ANTI_SHORTCUT.md exists to replace with a mechanism.
  FIX: add `pr_review.sh <PR#> <verdict> --body-file <path>` (and the same for
  `pr_comment_once.sh`), and have the briefs tell reviewers to write the body to a temp file rather
  than pass prose through argv. The script already pipes JSON to `gh api --input -`, so it is a
  few lines: read the file into BODY instead of `${*}`. Until then, prefer single quotes and check
  the posted body with `gh api repos/<slug>/pulls/<PR>/reviews --jq '.[-1].body'` after signing.

---

## Open — reported 2026-08-11 by reviewer 6 (the rebase attempt cap counts CLAIMS, not failures; new)

- **`rebase_attempts/<PR>` is incremented on every rebase CLAIM and is NEVER reset by a SUCCESSFUL
  rebase, so on a contended class file the cap executes honest, already-verified PRs and blames them
  for "3 failed rebase attempts" they did not have.** `rebase_claim.sh` is the ONLY writer of
  `$STATE/rebase_attempts/` (grep confirms: no other tool touches it, and `rebase_pr.sh` never does).
  It reads the counter, and on a successful lease writes `n+1` — *before* the rebase is attempted and
  regardless of how it turns out. The file is removed in exactly one place: the `n >= CAP` branch that
  CLOSES the PR. There is no success path that decrements or clears it. So the counter measures "how
  many times this PR needed a rebase", while the cap and its close comment
  ("Closed after $CAP failed rebase attempts (stale-base shared-class conflict that couldn't be
  auto-rebased)") both assert "how many times rebasing FAILED".
  These diverge whenever a rebase SUCCEEDS and the branch is then re-staled by a SIBLING landing —
  the normal state of a hot class file, not a pathology.
  MEASURED LIVE (2026-08-11 07:16, 8 workers + 8 reviewers): six open PRs on ONE class,
  `HGRenderJob` (#387 `__slot4`, #388 `__slot5`, #389 `__slot7`, #390 `__slot9`, #391 `__slot8`,
  #396 `port/HGRenderJob`), against 15 merges to main in 25 minutes. #387 = 3/3 and #390 = 3/3;
  #388 and #391 = 2/3. **#387 is at the cap while being GREEN and APPROVED**: it was successfully
  rebased (head 029dcb46 -> 7ded66ea), re-gated `success — gate PASS (G0-G5 clean, 0 flags)`, and
  carries an APPROVED review. One more sibling landing regresses it and the next `rebase_claim` pass
  CLOSES it, discarding an oracle-verified body and re-handing the symbol to a fresh worker to
  transcribe from scratch. #390 is in the same position with a body I verified 1400/1400 bit-exact
  against live Helium.
  THE TRIGGER IS CONTENTION, NOT UN-REBASABILITY. Every landing on a shared class file invalidates
  every other open branch on that file, so with K concurrent PRs on one class the cap is consumed in
  ~K sibling merges no matter how well the rebases work. The cap's stated purpose — retiring a PR
  that genuinely cannot be auto-rebased — is not what it does here; it retires the LOSERS OF A RACE,
  and it does so faster the healthier the merge rate is. Cost is highest exactly where the work was
  best, because a body that has been reviewed and oracle-verified is the most expensive thing to
  throw away.
  FIX (any one of these closes it; the first is the smallest):
  1. **Only count FAILURES.** Have `rebase_pr.sh` clear `$STATE/rebase_attempts/<PR>` when it
     force-pushes a rebased head that gates clean, or have `rebase_claim.sh` key the counter to the
     head SHA it was claimed at and reset when the head has MOVED since. A PR that keeps producing
     new, gating heads is making progress and must not be retired.
  2. Exempt a PR that currently holds an APPROVED review or a `success` faithfulness-gate from the
     cap outright — it has already paid for itself.
  3. Serialise per class file: do not dispense two PORT units from the same `<Class>.ts` concurrently
     (or land them through one stacked branch). That removes the race instead of arbitrating it. This
     is the real fix for the 6-PRs-on-one-class pile-up; the cap change just stops the bleeding.
  Until fixed: a reviewer who finds a faithful-but-rebase-blocked PR should record the verified body
  in a PR comment (`pr_comment_once.sh`) so that if the cap closes it, the transcription is not lost
  and the next worker can carry it over verbatim rather than re-deriving it.

---

## Open — reported 2026-08-11 by worker 7 (new)

- **LOCAL (`t`) symbols ARE oracle-able, and the recipe avoids `nm` entirely — this closes the
  "Rosetta workaround is incomplete" item below.** Worker 1 correctly found that
  `local_call.py::_vmaddr`'s bare `nm -n` reports **arm64** addresses even under Rosetta, so
  `local_fn()` computes (arm64 vmaddr + x86_64 slide) and calls the wrong function. The fix does not
  require fixing `nm` at all, because the x86_64 vmaddr is **already on disk**: it is the first
  column of `raw-port/army/inventory/<FW>.syms.txt`. Working recipe, verified end-to-end on
  `hg_read_span_4s_wxyz_m1_gqt_m1_premul` (Helium `t` @0x18adf0, a symbol `dlsym` cannot find at all):

      # under arch -x86_64 /usr/bin/python3
      libc = ctypes.CDLL(None)
      libc._dyld_get_image_name.restype = ctypes.c_char_p
      libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
      ctypes.CDLL(FW_PATH, ctypes.RTLD_GLOBAL)
      i     = <index whose _dyld_get_image_name(i) == FW_PATH>
      slide = libc._dyld_get_image_vmaddr_slide(i)
      fn    = ctypes.CFUNCTYPE(<restype>, *<argtypes>)(slide + VMADDR_FROM_INVENTORY)

  Measured slide 0x10ab6e000, called an 8-pixel span, and confirmed the function's own `count == 0`
  early-out leaves the destination untouched. **Consequence for reviewers and workers: "the symbol is
  local, so I could not oracle it" is no longer a valid reason to sign a port on reading alone.**
  Roughly a third of the remaining queue is `t`-class. Worth folding into `local_call.py` as the
  `_vmaddr` implementation (read the inventory, never shell out to `nm`), which would also make it
  ~1000x faster than the `nm` it replaces.

- **The nested-class file-naming convention and the landed precedent CONTRADICT each other, across a
  whole family.** `PORTING_SPEC.md` says a nested class joins its outer names with a DOUBLE
  underscore (`OZOpticalFlow::Private::CacheFileHeader` -> `OZOpticalFlow__Private__CacheFileHeader.ts`),
  and both worker briefs repeat it as a rule that exists because it was violated. But the
  `OZChannelColorNoAlpha_*Impl.ts` family already on main — `greyImpl`, `whiteImpl`, `gammaImpl`,
  `colorSpaceIDImpl`, `blueSample1Impl`, `redSample1Impl` and friends, ~10 files — are *equally*
  nested (e.g. `__ZN21OZChannelColorNoAlpha30OZChannelColorNoAlpha_greyImpl11getInstanceEv` is
  Outer=`OZChannelColorNoAlpha`, Inner=`OZChannelColorNoAlpha_greyImpl`) and every one of them is
  filed under the INNER name alone. So a worker handed one of these units cannot satisfy both the
  spec and the precedent, and whichever they pick looks wrong to a reviewer diffing against the
  other. This is the exact setup PORTING_SPEC's own rationale warns about — two workers filing one
  class under `_` and `__`, both landing. It needs a project-level ruling (and, if the spec wins, a
  rename of the existing family) rather than a per-worker coin flip. Filed
  `OZChannelColor__OZChannelColor_alpha_zeroImpl.ts` per the spec and flagged it in the file header
  (PR #440); `check_duplicate_classes.py` does not catch the divergence because the two spellings
  normalise differently.

---

## Open — reported 2026-08-11 by worker 8 (scope decisions, BSS data, forwarder families; new)

- **A `b`-class (BSS) table is ALL ZEROES in the file image — transcribing it from the binary on
  disk silently ships a table of zeros.** Hit on `MXF::MXFAVCPictureDataDecoder::avcCodec`
  @Flexo 0x1434bc0, whose whole body is a scan of `__ZL11MXFAVCTable` @0x1c921c0. `nm` reports that
  symbol as class **`b`**, i.e. `__BSS`: the 453 x 0x20 bytes are written by Flexo's static
  initialisers at load time and do not exist in the file. `disasm.sh`/`otool` show the code that
  *reads* the table and nothing about its contents, so the failure is quiet in exactly the way the
  #13 class of bug is — the port would compile, gate green, and answer with the not-found constant
  for every input. **Check the nm class before transcribing any table** (`grep <sym>
  army/inventory/<FW>.syms.txt`: `t`/`T` = code, `b`/`s`/`d` = data, and `b` specifically means
  "not in the file"). To read one: dlopen the framework (Flexo/Ozone need the depth-first `@rpath`
  preload from the entry below), take `_dyld_get_image_vmaddr_slide`, and `ctypes.string_at(slide +
  vmaddr, n)` under `arch -x86_64`. **Ground it the way a literal is grounded**: derive the entry
  count from the loop bound the code itself uses (here the cursor runs 0x1c -> 0x38bc step 0x20 =
  453), and prove the bytes are stable by hashing the dump in two independent processes with
  different ASLR slides (identical sha256 = it is the binary's data, not this run's). Worked
  example, reusable as a template: `raw-port/re/oracle/
  MXF__MXFAVCPictureDataDecoder_MXFAVCTable_dump.py`.

- **`dyld_info -arch x86_64 -imports /tmp/<FW>.x86_64 | grep <mangled>` names the dylib that
  DEFINES a stub callee — one command, and it is the fact that decides drop-vs-port.** Every
  `callq ## symbol stub for: <sym>` is either an in-scope callee you must import and call, or an
  out-of-scope extern you may throw at, and the inventories cannot tell you which: they list only
  DEFINED symbols in the five frameworks, so an import comes back absent with no hint where it
  lives. Two units this shift turned entirely on this answer:
  `OZShape::addVertex(CMTime,double,double)`, jumped to from `OZRotoshape::addVertex` @Ozone
  0x5061d0, prints `(from ProShapes)` -> OUT of scope; and `MXF::MXKLV::getItemSimpleType`,
  `MXF::MXPictureDescriptor::getDisplayFrameHeight`, `CTMRatioIdentical`, all called from
  `avcCodec` @Flexo 0x1434bc0, print `(from MXFExportSDK)` -> OUT of scope, which is what made that
  453-entry unit portable instead of blocked. It costs ~0.3s on the thinned slice `/tmp/<FW>.x86_64`
  that `disasm.sh` has already produced. (Corollary: an FCP framework outside the five — ProShapes,
  MXFExportSDK, MIO, ... — is out of scope just like libc; it is not "in-scope but unported".)

- **Whole FORWARDER FAMILIES arrive READY and each costs a worker a claim+disasm cycle.** Three
  `HGGLContext` units in one shift — `getVirtualScreen` @Helium 0x1b3c50, `isAccelerated`
  @0x1b3be0, `getRegistryID` @0x1b3c60 — are byte-for-byte the same eight-line shape: load the
  pimpl at `this+0x10`, load its vtable, `jmpq *<slot>(%rax)`. depgraph cannot see through the
  vtable, so it hands out every one of them as dependency-free, and every one is then parked
  against the SAME unported class. This is the vtable sibling of the `call_once`/`dispatch_async`
  blind spot listed below (I also parked `FFVDT_dispatchDeleteIdleCMMRsInFFVDs` @Flexo 0xe347d0,
  whose real work is the block invoke at 0xe34ed0). Two things help, and neither needs a depgraph
  fix: (a) `raw-port/army/tools/vtable.py <FW> <Class>` resolves the slot in one call, so record the
  RESOLVED target in the drop reason and the next worker re-derives nothing; (b) porting the
  concrete implementation FIRST unblocks the whole family at once — for this one, the twelve
  `HGGLContextCGL` slot bodies (0x210e0 0x21110 0x21150 0x216e0 0x21770 0x217c0 0x217e0 0x21840
  0x21850 0x21860 0x21880 0x219b0 0x219d0) release a dozen base methods.

- **A negative control can be EQUIVALENT rather than caught — say so instead of quietly dropping
  it.** On `FFAudioSourceScope::DifferentFadeInOrOutInfo` @Flexo 0xe6a090 (four `cmpl`s at +0x80,
  +0x88, +0x84, +0x8c) the mutant "compare the two 64-bit lanes instead of four dwords" scored
  0/400: those four dwords exactly tile the same 16 bytes, so it is not a wrong model at all. A
  0/N control means one of two very different things — the harness is blind, or the mutant is
  equivalent — and only the author can tell them apart at the time. Report which, in the file, next
  to the numbers. Same shape as the sensitivity trap for CONSTANT functions: a port that always
  returns 0 cannot be distinguished from a harness that reads no `%rax` at all, so pair it with a
  control that calls a DIFFERENT function known to return non-zero through the SAME `CFUNCTYPE`
  (I used `HGRenderJob::GetUserName` @Helium 0x54820 while oracling a `xorl %eax,%eax` body).

---

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

- **A THIRD input-mangling trap: `ctypes.c_float(python_float)` QUIETS A SIGNALLING NaN.** Building a
  float argument from Python goes through a C double, so 0x7f800001 arrives at the callee as
  0x7fc00001. Measured on `HGMultiTexBlend<5>::setWeight` @Helium 0x110bc0: 10 of 120 cases reported
  a divergence against a port that was byte-for-byte correct, and the "wrong" value was wrong before
  the call, not after it. Same family as the two above — the harness corrupted the case, then blamed
  the port. Fix: build the argument bit-exactly —
  `cf = ctypes.c_float(); ctypes.memmove(ctypes.byref(cf), struct.pack('<I', bits), 4)` — and pass
  `cf`. General rule now confirmed three different ways: **on an oracle boundary, move BIT PATTERNS,
  never language-level floats** — into the callee, out of the callee, and across the TS wire.

- **Do not put an allocator-reuse check in an oracle's VERDICT.** For a dtor/free unit the obvious
  second signal — "the next same-size malloc returns the same address" — is RUN-DEPENDENT: the same
  unmodified harness measured 0, 12, 57 and 64 of 64 across four consecutive runs
  (`HeapAllocator_anon_D0_oracle.py`). `malloc_size(p) == 0` is stable (64/64 every run, and False
  for a live block, so it still discriminates). Report reuse if you like, but a verdict that includes
  it fails correct code about half the time.

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

## Open — reported 2026-08-11 by worker 2 (rebase drops files; new, and it DESTROYS WORK)

- **`rebase_pr.sh`'s `REBASE_MANUAL` path SILENTLY DROPS every net-new file of the branch that did
  not conflict.** It prepares a pool worktree from CURRENT `origin/main` plus the branch's version of
  each CONFLICTING file, and tells the worker to re-apply "your net-new methods" — but a branch
  typically adds more than the class file: an oracle harness and a TS driver under
  `raw-port/re/oracle/`. Those are not conflicting, so they are not staged into the worktree, and the
  rebased commit + force-push REMOVES them from the PR. Hit twice today, on two different PRs:
  * #390 (another worker's branch, rebased by me) — `HGRenderJob_UsesOnlyCPUResource_{oracle.py,driver.ts}`
    would have been dropped; I noticed only because I diffed the branch against main first and
    restored them by hand with `git show origin/<branch>:<path>`.
  * #449 (my own) — `HGBufferDumper_D1_oracle.py` WAS dropped and had to be restored from the
    pre-force-push commit (`git cat-file -p <old-sha>:<path>`); the force-push had already made it
    unreachable from any ref.
  It is silent in both directions: the gate does not look at `re/oracle/`, and `git status` in the
  fresh worktree shows nothing missing. The only reason it was caught is that the ported .ts CITES
  its harness by path — a PR whose lost file nothing referenced would just lose it.
  **Workaround until fixed:** before committing a REBASE_MANUAL, run
  `git diff --stat origin/main origin/<branch>` and re-add every file the branch adds that is not in
  your reconciliation. **Fix:** `rebase_pr.sh` should stage the branch's ADDED files (paths present
  in `origin/<branch>` and absent from main) into the prepared worktree automatically, and say so.

- **Adapting, not importing, is the right move when main has re-modelled your class underneath you.**
  When #449 was rebased, main had landed the same class with a DIFFERENT model of the same three
  `std::string` members (content-as-JS-string vs a {isLong, data} pair). Re-applying the branch's
  method verbatim would have put two models of one layout in one file — the exact drift
  PORTING_SPEC Rule 5 and the `Outer__Inner` note exist to prevent. Re-apply the SYMBOL, adapted to
  the model that landed, and say in the file what the landed model cannot express.

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

## Open — reported 2026-08-11 by worker 5 (new)

- **THE REBASE QUEUE RE-CLAIMS A PR THAT WAS ALREADY SUCCESSFULLY REBASED, BURNS THE 3-ATTEMPT CAP
  ON REDUNDANT RE-REBASES, AND AUTO-CLOSES IT — AND THE ADVERTISED RE-QUEUE NEVER HAPPENS, SO THE
  SYMBOL IS SILENTLY LOST.** Measured end to end on PR #389 (`port/HGRenderJob__slot7`) this
  morning. I claimed it (`attempt 1/3`), ran `rebase_pr.sh`, hand-reconciled the shared class body
  onto current main, re-ran the branch's own oracle myself (1,800 cases, 0 divergences), got
  `GATE: PASS`, force-pushed `81df5dd7`, and released the lease — a correct, finished rebase. Two
  more agents then claimed and re-rebased the SAME PR (head moved to `3bf1acc6`, then `7c2508e9`),
  attempts 2 and 3 were consumed, and the cap auto-closed the PR. Root cause is that
  `rebase_claim.sh`'s queue filter is "open PR whose latest `faithfulness-gate` is a
  regression/rebase FAILURE", and a force-push does not clear that: the new head simply has NO
  status, while the PR-level view still shows the old FAILURE. Nothing marks a rebase as DONE and
  nothing resets the attempt counter on success, so a successful rebase is indistinguishable from a
  failed one and the cap fires on work that was already correct.
  **The second half is worse.** The auto-close comment says "the append-only claim queue re-hands
  this symbol to a fresh worker", but no `drop`/`reopen` record is written:
  `__ZN11HGRenderJob11GetUserNameEv` is still a bare `claim` in `claims.jsonl`, is not on main, and
  has no open PR — i.e. exactly the #18 failure the `depclaim.py drop` work closed, reopened through
  the auto-close path. I rescued that one symbol by hand (PR #414), but the mechanism will keep
  eating them.
  Fixes, in order of value: (a) on a successful `rebase_pr.sh` force-push, DELETE
  `$FCT_STATE_DIR/rebase_attempts/<PR>` and post a `pending`/neutral `faithfulness-gate` on the NEW
  head so the PR leaves the queue until a reviewer re-gates it; (b) make the queue filter key on the
  CURRENT head SHA's status, never the PR's last-known one; (c) make the auto-close path actually
  call `depclaim.py drop <sym> "<reason>"` — and fail loudly if it cannot.

- **`import numpy` DIES inside the mandated `arch -x86_64` harness — the only numpy on this box is
  an arm64 build.** `dlopen(... _multiarray_umath.cpython-39-darwin.so): have 'arm64', need
  'x86_64'`. Every oracle must run under Rosetta (the "wrong architecture" entry below), so numpy is
  effectively unavailable to ALL oracle work, whatever the standing "probe via ctypes/numpy" advice
  says. Do not spend time on a venv: the house precedent
  (`Gettype3_nice_satTile_AVX_oracle.py`) already avoids numpy, and plain `struct` is not a
  compromise — it is bit-exact. `f32(x) = struct.unpack('<f', struct.pack('<f', x))[0]` reproduces
  an SSE/AVX lane op exactly, because the operands are f32, a Python double multiply/add of two f32
  values is exact, and rounding that once to f32 is what the hardware does (no double-rounding).

- **A DEAD NEGATIVE CONTROL IS THE TELL THAT YOUR HARNESS, NOT THE PORT, IS WRONG.** Writing the
  oracle for `HgcScaleBiasCrop::RenderTile_AVX` I padded the parameter block so the mask lane at
  `+0x80` read as `0.0`. Every output pixel was then multiplied by zero, and the model "agreed" with
  the live kernel on 150/150 cases — a false VERIFIED that no amount of extra fuzz would have
  caught, because both sides were computing nothing. What exposed it in one line was that ALL FIVE
  negative controls scored **0**: five deliberately-wrong ports were indistinguishable from the
  right one. Fixing the layout moved them to 163/94/135/487/163 of 600. **Report the negative-control
  counts next to the case count in every oracle, and treat a zero as a failed run, not a clean one.**

- **Never put backticks in a `git commit -m "…"` written inside a double-quoted shell string.** The
  shell command-substitutes them before git sees them: `` the TS `?? ''` models the cmov `` landed in
  the commit as "the TS  models the cmov" plus a `/bin/sh: ??: command not found` on stderr that is
  easy to miss in a long submit log. Write the message to a file and use `git commit -F`.

---

## Open — reported 2026-08-11 by reviewer 3 (the approval binds to the LIVE head, not the reviewed one; NEW)

- **`ghapp/pr_review.sh <PR#> approve` resolves the PR's head SHA AT CALL TIME, so a push that
  lands while you were reviewing silently moves your APPROVE onto code you never looked at.**
  The review queue leases by PR#+head-SHA precisely so two reviewers never gate the same head — but
  nothing stops the *author* (or a worker pulling the same PR off the rebase queue) from pushing a
  new head under an in-flight review, and `pr_review.sh` does not take the SHA you leased. It asks
  GitHub for the current head and signs that.
  Measured today, three times in six PRs, on a 16-agent swarm:
  * **#384** — leased and fully verified `f741d2b2` (UsesOnlyGPUResource + SetGPUGraphicsAPI). While
    the differential was running a worker pushed `e52779ce`, adding `IsRequestedVirtualScreen`
    (+119 lines). `pr_review.sh … approve` printed `PR #384 @ e52779ce -> APPROVED`. Had I then run
    `pr_land.sh`, **119 lines nobody reviewed would have landed under a real reviewer APPROVE** —
    and every mechanical gate would have been green, because the added code was itself gate-clean.
    (Caught only because the tool echoes the SHA it signed and it did not match my lease. I then
    verified the new method too — it was faithful — but that was luck, not process.)
  * **#388** and **#391** — same shape via the rebase path: a peer force-pushed a union-rebase onto
    the PR branch between my `pr_gate` and my `approve`, so the approval landed on `a8faaf96` /
    `0d722917` rather than the `531e72bf` / `52e95f1b` I leased.
  This is the same failure class as #7 (a rejected port landing because a lease was keyed to a head
  that moved), arriving through the APPROVE side instead of the merge side, and `required_pull_request_reviews`
  is still `null` on `main` (GITHUB_APPS.md "Recommended follow-up"), so **`dismiss_stale_reviews`
  is not protecting anyone** — nothing drops the approval when the head changes.
  FIX (in order of value): (a) `pr_review.sh` should take the head SHA the reviewer verified —
  `pr_review.sh <PR#> approve --head <sha> "<evidence>"` — and REFUSE (non-zero, loud) when the
  live head differs, exactly as `pr_land` refuses to mint an approval (#234); (b) turn on
  `required_approving_review_count=1` **with** `dismiss_stale_reviews=true`, which makes GitHub drop
  the approval server-side on every push and turns this from a silent hazard into a re-review;
  (c) `pr_gate.sh`/`pr_land.sh` should print the leased SHA alongside the live one so the drift is
  visible in the log rather than only in the approval line.
  WORKAROUND until then, and it is cheap — **re-read the head immediately before signing and compare
  it to your lease**:

      H=$(gh pr view <PR#> --repo vjeux/fcp-headless-transitions --json headRefOid -q .headRefOid)
      [ "$H" = "<the SHA review_claim.sh leased you>" ] || { echo "HEAD MOVED — re-review"; }

  and after any merge, diff what actually landed against the blob you verified
  (`git show origin/main:<path>` vs `git show <verified-sha>:<path>`) before you consider the PR
  signed. If the head moved, either verify the delta too or say plainly that you did not.

- **`pr_land.sh` REBASE-RACE is now the dominant merge cost at 16 agents, and each losing round pays
  a full gate.** #420 (a 5-instruction EMPTY port) burned **12 rounds across two invocations** —
  every round `PR_GATE: PASS` then `mergeState=BEHIND` again — and never merged, because with 8
  reviewers landing PRs, `main` advances faster than the `update-branch` → wait-for-new-head →
  `pr_gate` → merge cycle can close. The work is not wasted review time, it is wasted *gate* time: a
  pool worktree lease plus a tsgo typecheck per round, i.e. the losing rounds are themselves a large
  part of what makes main advance so fast. Strict "require branches up to date" + a required status
  that only an agent can post is the structural cause: GitHub auto-merge can update the branch, but
  the new head then has NO `faithfulness-gate` status, so it parks until a reviewer gates it.
  Not fixed here. Candidates: gate the MERGE COMMIT rather than the head; allow `pr_gate` to post the
  status for a head it has already gated with an identical tree hash (the common case — an
  update-branch merge that changes no file the PR touches, which a `git diff --quiet <old> <new> --
  <changed paths>` can prove in milliseconds); or serialise landings behind a short repo-wide merge
  lock so rounds stop competing. Until then: on REBASE-RACE, post the evidence comment, leave the
  green status and the approval, release the lease and move on — do NOT keep re-running `pr_land`,
  which is what turns one race into twelve gate runs.

## Standing rules that came out of the above

1. **ADD-only is enforced, not advisory** (G6). Extending a class file means `git show
   origin/main:<path>` first, then append.
2. **Give `gate.sh` an absolute path.** Always.
3. **A rejection outranks a later approval.** Overriding a peer means dismissing their review with a
   reason, deliberately.
4. **Approve with your own evidence, before landing.** No tool will mint an approval for you.
5. **Never close a dup, or trust a "already on main" status, without confirming on main.**
6. **Never read a framework binary when a cached index answers the question.** `army/inventory/*.syms.txt`
   for symbols, `symidx.py` for disasm bodies. Reading a 78 MB fat Mach-O under `/Applications/` costs a
   full core for a minute or more, and the MDM security stack rescans it every single time — with N
   agents that is N core-minutes for an answer that takes 0.08s from disk. This box amplifies file I/O
   enormously; design for fewer and smaller reads. (#10, #22, and `wt_pool.sh`'s whole reason to exist.)
7. **Before running a global, idempotent maintenance tool, check whether a peer is already running it.**
   `mark_ported.py`, `build_ledger.py`, `depgraph.py` reconcile the WHOLE repo: one run covers every
   agent's commit. N identical concurrent runs are pure contention. (#23)
8. **A fix can be the next outage.** #240's release guard was correct and still deadlocked the swarm
   two hours later, because `pr_gate` was a caller I had not considered. When you tighten a shared
   primitive, enumerate every caller — and prefer a self-healing fallback (#258's disposable-lease
   reclaim) over trusting that you found them all.
