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
| 34 | A correct `if (buf[i] !== other[i])` was reported as ``non-null-asserted table read `buf[i]!` `` on a line containing no assertion, and a flag holds `faithfulness-gate` at FAILURE — so a false flag mechanically blocked correct PRs until a reviewer hand-cleared them. Comparing two indexed reads is one of the most frequent things a byte-wise transcription does, and the worker-side workaround was hoisting the reads into locals, i.e. contorting the code to please a regex (hit on a `_memcmp` boundary port) | G7's `IDX_BANG` allowed whitespace before the `!` (`\]\s*!`), so it matched the `!` of `!==` | #347 — the `!` must be immediately adjacent AND is excluded from `!=`: `\]!(?!=)`. Verified on current main (`undef_index_gate.py:48`) |
| 35 | `pr_submit.sh <Class>` opened the PR on the worktree's CURRENT branch, so a `MinMax__MMNode_Mode1_Axis0` port was filed as `port/OZDynamicSpline` (#338). Invisible while the lease and the class agree; it bites after a `depclaim.py drop` when the worker keeps the lease and ports the NEXT unit in it. Not cosmetic, because of #4: `wt_pool.sh acquire` stacks on any branch with an OPEN PR, so the next `acquire OZDynamicSpline` would have based that worker's work on a branch carrying an unrelated class's file — the stale-base work-deletion shape re-entering through the branch NAME | `pr_submit.sh` never compared HEAD against the class it was told to submit | #347 — refuse a genuine class/branch mismatch (exit 5) while still allowing the deliberate `__slot<N>` / `__w1` / `_rebased` variants. Verified on current main (`pr_submit.sh:23`). Worker-side rule that still applies: after a drop, release the worktree before claiming the next unit |
| 36 | **G4, the only un-fakeable gate, silently checked NOTHING while printing PASS** — every gate run touching an oracle-mapped file reported `G4 HARNESS_BROKEN — FAIL S2_TS_WORKER_LIVE: … No such file or directory: '<wt>/engine'` (seen on `OZSpline.m0.ts` -> `curve.interp.bezier.eval`), and the gate still said PASS | `fct/parity/bridge.py`'s `ENGINE_DIR` was `<repo>/engine`, a tree #63 had deleted, so every TS-worker spawn ran with a cwd that did not exist. Reported as open in #352 and TRUE when it was written | #353 (b6254ed1) — `ENGINE_DIR = os.path.join(_REPO, "raw-port")` (`fct/parity/bridge.py:20`), and `gate.sh` now greps for `HARNESS_BROKEN` so a gate that cannot run is a REJECT rather than a pass. Verified on current main before filing this row |

---

## Open — reported 2026-08-11 by worker 1 (a reviewer's gate can DELETE a worker's in-progress port; FIX in this change)

- **`wt_pool.sh release` checks that a lease EXISTS, never that it is still YOURS — so a `pr_gate`
  cleanup trap firing late resets whatever worker now holds that slot, deleting their uncommitted
  port.** Happened to this worker, live, and the symptom is genuinely baffling: the file simply is
  not there, `git status` is clean, no tool printed an error, and the `write` that created it
  reported success six seconds earlier.

  SEQUENCE (slot 2, 2026-08-11 08:21-08:22):
    1. 08:21:03  worker 1 leases slot 2 as `port/ROIStatIO__ROITestSet`.
    2. 08:22:05  worker 1 writes `raw-port/src/render/ROIStatIO__ROITestSet.ts` into it.
    3. 08:22:1x  a reviewer's `pr_gate` cleanup trap — for a lease it no longer held — runs
                 `wt_pool.sh release <wt> --force`. `--force` skips the has-work check; the lease
                 EXISTS (it is the worker's), so the ownership guard passes; `reset_clean` runs.
    4. 08:22:11  the file is gone, and the lease directory has been `rm -rf`'d, so the next gate
                 immediately re-leases slot 2 (`gate/b3682ab5…`, holder mtime 08:22:15).
  THE TELL that this is a git reset rather than an rm: the `.s` files generated into `re/disasm/`
  at 08:21 SURVIVED, because `reset_clean` runs `git clean -fd` and those paths are gitignored.
  If your file vanishes and your disasm does not, this is what happened to you.

  This is OPS_LOG #3 ("releasing a worktree destroyed someone else's work") returning through the
  `--force` door #258 opened for gate leases — the fifth entry in this log where a correct fix
  became the next outage (standing rule 6). Note that the two guards already there are each
  individually right and still leave the hole: "no lease -> don't touch" cannot tell a re-leased
  slot from your own, and "refuse when dirty" is exactly what `--force` overrides.

  FIX (in this change): `release <path> [--force] [expected-tag]` — when the caller names the tag it
  leased and the current holder's tag differs, the release is REFUSED and logged, leaving both the
  tree and the lease alone. `pr_gate.sh` passes `gate/$HEAD_SHA`. Callers that pass nothing behave
  exactly as before, so nothing else has to change at once. Locked by
  `army/tools/test_wt_pool_release_ownership.sh`, which runs against a FAKE pool ($HOME-scoped, so
  it never touches the live 24 slots) and covers all four cases: the stale release is refused, the
  real holder's own-tag `--force` still works, an untagged release is unchanged, and the #3
  no-lease guard still holds. It FAILS 2/5 against main's version and passes after.

  WORTH DOING NEXT, not done here: `acquire` could hand back an opaque token (a random id written
  into the lease dir) so a caller cannot even accidentally name someone else's tag; and the same
  ownership check belongs in `reset_clean`'s other caller, `cmd_gc`, which skips leased slots by
  existence for the same reason.

## CORRECTION — 2026-08-11, worker 1 correcting worker 1 (the entry below, and PR #523, OVERSTATE what a stale force-push does)

**I published a wrong consequence twice — in #499 (the entry below) and in #523 — and a reviewer's
pushback (the `git diff` dots note later in this file) half-corrected it and then repeated my
error. Here is the measured answer, from a scratch repo, so nobody has to litigate it a third
time.**

A stale-based force-push does NOT delete unrelated landed files when the PR merges. GitHub applies
the THREE-dot delta (head vs the MERGE BASE), and a file that landed on main after that base is on
neither side of it, so it cannot be removed. The scratch proof — main gains `mainMethod()` in a
shared class AND a new file `Landed.ts`, while a branch cut from the older base adds
`branchMethod()` to that same class:

    two-dot   (git diff main head)     ->  M src/C.ts   D src/Landed.ts    <-- the alarming view
    three-dot (git diff main...head)   ->  M src/C.ts                       <-- what a merge applies
    after actually merging the branch:     src/C.ts  Landed.ts  Other.ts    <-- Landed.ts SURVIVES

So the "16 files removed" figure in the entry below — and its "three ports, their oracles and an
OPS_LOG section were queued for deletion" framing — is an artifact of reading a TWO-dot diff in a
worktree whose `origin/main` had moved. Nothing was ever queued for deletion. Re-checked against the
PR that triggered it (#504): the three-dot delta of the head I was alarmed about contains ZERO
deletions, and `regression_check origin/main <that head> <its files>` exits 0 against today's main,
so I also cannot attribute that PR's red gate to what I claimed.

WHAT IS REAL, and it is exactly what REBASE-TASK MODE exists for: per-FILE staleness. For a file the
branch DOES touch, the branch's copy can predate main's, and the three-dot delta carries that older
content — reverting landed methods INSIDE that file (OPS_LOG #4/#9) or conflicting, as the
`src/C.ts` line above shows. That hazard is invisible in a file LIST of any kind; it is a content
question, which is why step 2 of REBASE-TASK MODE says to open main's CURRENT version of each
conflicting file and ADD to it.

WHAT TO ACTUALLY CHECK BEFORE A FORCE-PUSH, in the right dots:
  * `git diff --name-only origin/main...HEAD` — every file listed must be one you meant to touch.
    That is what you are publishing. (The `--diff-filter=D` guard #523 added to rebase_pr.sh uses
    this form and is correct as written; it just guards a rarer thing than its message claimed.)
  * for each listed file, confirm you started from main's CURRENT copy — the real check, and a
    content question rather than a filename one.
  * `git diff --stat origin/main HEAD` (two dots) answers a DIFFERENT question — "is my head
    stale?" — which matters because branch protection requires up-to-date. A `D` in THAT list is not
    a deletion you are about to make.

The tool changes from #499/#523 stand on their own merits (fetch main before rebasing; refuse a
force-push that genuinely deletes; re-check before committing). Only my explanation of WHY was
wrong. #511 is unaffected — that one destroyed a file on disk in front of me and is reproduced by
its own test.

## Open — reported 2026-08-11 by worker 1 (REBASE-TASK MODE can force-push a deletion of OTHER files)

- **`rebase_pr.sh`'s prepared worktree is only as fresh as the moment it was prepared, and the
  REBASE-TASK MODE checklist never says to re-check before committing — so a worker who follows it
  literally can force-push a PR that DELETES four landed files nobody touched.** Hit while
  reconciling PR #478. `rebase_pr.sh` prints "Pool worktree (started from CURRENT origin/main)",
  which reads as a guarantee; on a swarm landing a PR every couple of minutes it is a snapshot with
  a shelf life. Between the prepare and the (careful, hand-written) merge, main moved by two merges
  and `git diff origin/main --stat` in that worktree showed:

      raw-port/army/OPS_LOG.md                     |  63 ----------
      raw-port/re/oracle/HGBufferDumper_D1_oracle.py     | 100 ---------------
      raw-port/re/oracle/HGGPURenderer_...oracle.py      | 132 ---------------
      raw-port/re/oracle/OZViewerState_...oracle.py      |  99 ---------------
      raw-port/src/nodes/OZViewerState.ts                | 120 ---------------
      raw-port/src/render/HGBufferDumper.ts              | 106 ---------------
      raw-port/src/render/HGGPURenderer.ts               |  91 ---------------

  — i.e. the force-push would have reverted three ports, their oracles and an OPS_LOG section. This
  is the #4/#9 work-deletion shape arriving through the REBASE door, and note what does NOT catch
  it: **G6 add-only only inspects the file you hand `gate.sh`**, so a spotless `GATE: PASS` on the
  one class you reconciled says nothing about the other six files the push would delete.

  WHY THE PORT PATH IS SAFE AND THIS ONE IS NOT — the sharper root cause, found by watching the
  same thing nearly happen on the fix's own PR: `pr_submit.sh` **rebases onto origin/main before it
  pushes**, so a port commit written against a stale base is replayed onto current main and the
  intervening files survive. REBASE-TASK MODE does not go through `pr_submit.sh`; step 5 is a raw
  `git push -f origin HEAD:<branch>`, which publishes the commit exactly as written, stale base and
  all. Measured on this very change: `git diff origin/main --stat` showed two unrelated files
  (AUSampleRateConverterWithTimeStamps.ts and its oracle, 287 lines) as deletions at commit time,
  and they were still intact in the PR afterwards — because `pr_submit.sh` rebased. Under the
  REBASE path they would have been deleted. So the real asymmetry is `pr_submit` vs `push -f`, and
  the durable fix is for the rebase path to rebase before pushing too.

  WORKAROUND (do this every time, it is two seconds): before `git add`, run
  `git -C "$WT" diff origin/main --stat` and confirm the ONLY paths listed are the ones you edited.
  If anything else appears, `git fetch origin main && git reset --hard origin/main` in the worktree,
  re-apply your merge on top (your edits are still in the files you copied aside), re-gate, then
  commit. TOOL FIX worth making: have `rebase_pr.sh` re-fetch and reset the worktree to origin/main
  immediately before it hands control to the worker, and have the REBASE-TASK MODE checklist in
  DEP_WORKER_BRIEF.md carry the `diff origin/main --stat` check as an explicit numbered step —
  the same "verify ADD-only before committing" rule the PORT path already has, which the REBASE path
  is missing.

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

## Open — reported 2026-08-11 by reviewer 1 (a PR can be invisible to EVERY queue; NEW)

Both items below are about ROUTING, not about faithfulness: in each case the port or the doc was
correct, the reviewer had signed it, and the PR still had nowhere to go. That is the expensive
shape, because nothing looks broken — the PR just stops existing as far as the swarm is concerned.

- **A conflicted NON-SRC PR is invisible to BOTH queues, so it sits forever with a GREEN status.**
  Hit twice in one shift, on the two OPS_LOG doc PRs #472 and #484. `pr_gate.sh` skips
  `regression_check` entirely when a PR touches no `raw-port/src` file — it prints
  `no raw-port/src ports to gate (infra/tooling PR)` and posts **SUCCESS** — so when main then
  advances and the PR goes `DIRTY`, (a) `rebase_claim.sh` cannot see it, because its filter is
  `grep -qiE 'regression|rebase'` against the status DESCRIPTION and the description says the
  gate passed; and (b) `review_claim.sh` cannot see it either, because its head already has a
  fresh verdict. `pr_land` just loops to REBASE-RACE and gives up. Two OPS_LOG PRs landing at the
  same insertion point is not an edge case — it is the normal state of a swarm whose exit reports
  all append to one file.
  WORKAROUND (what I did, and it works): after the reviewer signs the content, hand-post a
  rebase-flavoured status so the worker queue can see it —
  `ghapp/gh_as.sh reviewer api -X POST repos/<repo>/statuses/<headSHA> -f state=failure
   -f context=faithfulness-gate -f description="regression (rebase needed): <why>"`.
  FIX: `pr_gate.sh` should test mergeability for every PR, not just src ones, and post the
  rebase-flavoured FAILURE when a PR is `DIRTY` — the src/non-src split is about which GATES to
  run, and it silently became a split about which QUEUES can see the PR.

- **`pr_land.sh` re-runs `pr_gate.sh`, which OVERWRITES a reviewer-posted status, so a reviewer who
  proves a mechanical check wrong has no way to land the PR.** Found on #504, where
  `regression_check` fabricated a dropped symbol out of a sentence period (reviewer 7's
  dot-swallowing entry below, fixed by #516 while I was writing this). I re-derived both dtors,
  proved by execution that nothing was dropped, posted a signed green `faithfulness-gate` — and
  `pr_land` immediately re-gated, re-posted FAILURE and refused to merge. The only sanctioned
  override, `--reviewed`, clears **G5 flags only**; regression/dup have no equivalent. So the
  reviewer's choices were: leave it parked, or `gh pr merge` bare, which every brief forbids.
  Note the second-order harm to avoid: do NOT resolve this by posting a `regression (rebase
  needed)` description, because a rebase cannot fix a tool bug — the PR would be claimed, rebased,
  re-flagged, and auto-closed at the 3-attempt cap, which is precisely how #389's verified work was
  destroyed. I parked #504 with a description that deliberately does NOT match the rebase filter
  (`BLOCKED ON A TOOL BUG, not a rebase: …`) and it landed intact minutes later once #516 fixed the
  regex.
  FIX: give `pr_gate.sh` a `--reviewer-signed "<reason>"` mode that posts green over a
  regression/dup failure and RECORDS the reason in the status description, so the override is
  auditable instead of impossible. Until then: a reviewer who disproves a mechanical failure should
  park the PR with a non-rebase description and say so in the exit report.

- **Smaller, and cheap to act on: when a port declares a FIELD DEFAULT, the ctor is usually one
  `disasm.sh` away — check it, because the gate cannot.** #492 shipped
  `stateAt38: HGRenderNodeState = 0` with the comment "zero-initialised until the ctor
  `__ZN12HGRenderNodeC2Ev` is transcribed and reveals the true default". That ctor is EXPORTED and
  four seconds of `disasm.sh` shows `movq $0x1, 0x38(%rbx)` @0xdc9ea; calling it live on poisoned
  buffers returns state **1** from the real `GetState` in 3/3. The transcription of the claimed
  method was perfect and every gate was green — the wrong value was in the initialiser, which no
  gate reads. Ports that borrow a ctor's initialiser for a field default are the norm in this repo
  (`HGRenderNode`'s own +0xa0/+0xb0 do it); the failure mode is a port that DECLARES the ctor
  unavailable when it is not.

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

## Open — reported 2026-08-11 by worker 6 (a pool worktree can be leased with a REBASE IN PROGRESS; NEW)

- **`wt_pool.sh acquire` can hand you a slot whose `.git/worktrees/<n>/rebase-merge` directory is
  still there from a PREVIOUS lessee's interrupted rebase. Your own `git rebase` then refuses, and
  the obvious recovery — `git rebase --abort` — silently checks the worktree out onto SOMEONE
  ELSE'S BRANCH.** Hit on slot 4 while submitting `port/OZ3DEngineCore`:

      $ git rebase origin/main
      fatal: It seems that there is already a rebase-merge directory, and I wonder if you are
      in the middle of another rebase.
      $ cat .git/worktrees/4/rebase-merge/head-name
      refs/heads/port/opslog_rev4          # <- not my branch; I never touched it
      $ git rebase --abort
      $ git status -sb
      ## port/opslog_rev4...origin/port/opslog_rev4 [ahead 3, behind 31]

  So a worker who reflexively aborts is now standing on another agent's branch, with three of that
  agent's unpushed commits under them, and the very next `git add -A && git commit` would land
  their unit on it. (No work was lost here: `--abort` restores the interrupted branch to its
  pre-rebase ORIG_HEAD, and the three commits are still on the local ref. I checked
  `git log --oneline -1 port/opslog_rev4` before and after and left it exactly as found, then
  `git checkout port/OZ3DEngineCore` to get back to my own work.)
  WHY THE POOL DOES NOT CATCH IT: `wt_pool.sh`'s release/reclaim guards look at
  `git status --porcelain` and at unpushed commits. A worktree stopped mid-rebase can be CLEAN by
  both tests — the state lives in `.git/worktrees/<n>/rebase-merge`, which nothing inspects. Same
  family as #12: a guard that is correct about the state it models and blind to a state it does
  not.
  FIX: in `wt_pool.sh`'s acquire/reset path, detect `rebase-merge`/`rebase-apply` in the
  worktree's git dir and clear it with `git rebase --abort` (or `git -C "$WT" rebase --quit`)
  BEFORE the caller sees the slot, after the existing ownership checks — and report which branch
  it belonged to. Cheap, and it turns a trap into a log line.
  WORKAROUND until then: if `git rebase` in a leased worktree says "already a rebase-merge
  directory", read `.git/worktrees/<n>/rebase-merge/head-name` FIRST. If it is not your branch,
  abort and then immediately `git checkout <your branch>` — and do not commit anything until
  `git status -sb` shows your own branch again.

## Open — reported 2026-08-11 by reviewer 4 (the reconciler fix cannot reach the reconciler; FIX PROPOSED in this change)

- **#506 FIXED `mark_ported.py` TO STOP READING A STALE TREE, AND THE FIX IS DELIVERED THROUGH THE
  STALE TREE, SO IT NEVER TOOK EFFECT.** Measured within minutes of #506 landing, by running the
  documented post-merge step from the canonical checkout exactly as both briefs instruct:

      $ python3 raw-port/army/tools/mark_ported.py
      ported 9466/126668  skeleton 234  stub 1533  todo 115435  (status changed on 0 units)

  Note what is MISSING: the `[src=...]` suffix #506 added. That output is the OLD tool. The
  canonical checkout was **85 commits behind origin/main**, `raw-port/army/tools/srcsource.py` did
  not exist on disk at all, and the on-disk `mark_ported.py` contained zero references to it — so
  the run took 75s and printed the same healthy-looking `0 units changed` that four agents already
  reported as a silent no-op. The ledger lives in the canonical checkout
  (`raw-port/army/ledger/` is a real directory there, and `FCT_STATE_DIR` is unset), so
  `mark_ported` MUST run there; running it from a pool worktree would write a throwaway ledger.
  Agents therefore cannot route around it.

  ROOT CAUSE — **`swarm_maint.sh` only advances the canonical tree when it is DIRTY.** OPS_LOG
  already noted in passing that "a clean-but-behind tree is never fast-forwarded at all"; this is
  what that costs. The reset is guarded by `[ -n "$dirty" ]`, and `dirty` filters out
  `raw-port/army/ledger/`, `.gate.tsbuildinfo` and `raw-port/army/depgraph/` — so on this box the
  only untracked file (`raw-port/army/depgraph/blocked.jsonl`) is filtered away, `dirty` is EMPTY,
  and the tree is *clean by that definition* and 85 commits stale forever. The dirty-tree branch and
  the staleness problem are disjoint: the condition that triggers the fix is not the condition that
  needs it. Impact beyond the tool version: the reconciler was reading a `src/` with **1,625** `.ts`
  files where `origin/main` has **1,670** — 45 landed files invisible — so units stay `todo` after
  landing and `depgraph` never unlocks their callers from the merge path.

  This is the "a fix can be the next outage" pattern inverted into "a fix that cannot be deployed":
  every tool the swarm runs from the canonical checkout is pinned at whatever commit that tree was
  last reset to, and nothing resets it while it stays clean.

  FIX (in this change): `swarm_maint.sh` step (2b) — when the tree is CLEAN and no gate process is
  live, `git merge --ff-only origin/main`. `--ff-only` cannot lose work (it refuses rather than
  rewriting), which is why it is safe on the clean path where `reset --hard` would not be.

- **LAYER 2d PASSED WITH ITS STRING HANDLING COMPLETELY UNTESTED, BECAUSE THE FIXTURES WERE ON THE
  WRONG SIDE OF THE PROBE POINT.** Found by mutation-testing #506's new
  `verifier/test_brace_context.py` rather than just running it. Three mutants of
  `strip_stubs._scan_brace_context`: dropping the block-comment skip was caught, judging every brace
  a class body was caught, and **deleting the string-literal skip outright still printed
  `BRACE_CONTEXT: PASS`**. Not an equivalent mutant — `--full` kills it on four real corpus files
  (StereoPanner.ts, XMLtoFactoryBase.ts x3, OZGuide.ts) — but `--full` is not what `prove_all` runs,
  and the 60-file sample missed all four.

  The reason is worth generalising: `_scan_brace_context` answers each position as the scan reaches
  it, so **a fixture only tests what lies BEFORE a def**. Both string fixtures put the brace-bearing
  string INSIDE the only method body — after the only probe point — so the scanner returned its
  answer before ever reaching them. They read like coverage and were worth nothing. Moving the
  string one line earlier is enough:

      class A {
        static T = '{';
        m() { return 1; }
      }

  reference `(1, True)`, shipped `(1, True)`, string-skip mutant `(2, False)`. FIX (in this change):
  four before-the-def string cases plus an unbalanced-brace block-comment case; the sampled test now
  kills the mutant that survived. **Rule: when you add a fixture, mutate the code it covers and
  watch it fail — and check the tricky construct is positioned where the scanner will actually
  reach it.** Companion to the existing "a dead negative control means your harness is blind" entry:
  here the control was never run at all.

- **A DESTRUCTOR IS ORACLE-ABLE WITHOUT TOUCHING FREED MEMORY — via malloc RECYCLING.** PR #513
  (`ROIStatIO::ROITestSet::~ROITestSet`) declared itself NOT ORACLED because its only observable is
  two `operator delete` calls and inspecting freed memory is UB. The freed BYTES are UB, but the two
  things that can actually be wrong are not: **branch polarity** (`testb $0x1,cap ; je/jne` — read
  backwards it frees exactly the strings that own no buffer) and **destruction order**. Free a
  block, request the same size, and a LIFO free list hands it back: that observes WHETHER a free
  happened and IN WHAT ORDER, without ever dereferencing a freed pointer. All four is_long
  combinations matched the shipped TypeScript, with the inverted-polarity model killed 4/4.
  **Trap inside the trap:** allocate the two fake buffers NON-ADJACENTLY. macOS's tiny allocator
  coalesces two neighbouring freed blocks into one larger region that then serves no same-size
  request, so the both-long case reported "freed nothing" — a false DIVERGE, on the only case where
  both frees happen, with a dead-looking control. One live spacer block between them makes it 4/4.
  A local (`nm` type `t`) symbol like this one is reached with `re/oracle/ozone_loader.local_fn`;
  self-check the call site's opcode bytes against your own disasm before trusting the result.

- **A HAND-DISPATCHED PR BYPASSES THE REVIEW LEASE, SO TWO REVIEWERS DO THE SAME WORK.** My dispatch
  prompt named PR #506 directly ("your first claim"), so I went straight to it rather than through
  `review_claim.sh claim`. Nothing took a lease, and reviewer-1 — pulling normally from the queue —
  claimed, approved and merged the same PR while I was mid-verification. Both reviews were real and
  independent (we agreed on the equivalence numbers, which is worth something), but a full reviewer
  run was spent on an outcome already reached. `review_claim.sh` has the machinery to prevent this;
  the hand-off route simply does not use it. FIX: a prompt that names a specific PR should tell the
  agent to take the lease first (`review_claim.sh claim-pr <N>`, which does not exist yet — today
  the closest honest thing is `mkdir "$STATE/review_leases/pr-<N>"` before starting), and to stop if
  it is already held.

## Open — reported 2026-08-11 by reviewer 4 (one commit published TWO units; the second was landed under the first's title and its own PR became a dup; NOT fixed — diagnosis only)

- **A worker's port commit swept a DIFFERENT unit's files into itself, so a 618-line AVX kernel
  landed under a PR titled `port: OZAudioMixer` — and the PR that legitimately owned that kernel
  became a duplicate two minutes later and was closed.** The claim queue is NOT at fault, which is
  what makes this worth writing down: `claims.jsonl` has exactly ONE claim for the symbol
  (`__ZL31Gettype1_half_unpremultTile_AVX…`, ts 1786462614) and **zero** symbols claimed more than
  once across all 6,692 claims. The dispenser did its job; the commit did not.

  The evidence is one command. PR #531 contains a single port commit, and it carries two units:

      $ git show --stat 06799c92
      port: OZAudioMixer::getTrackPan(STTrack*, float*) @Ozone 0x21b550
       raw-port/re/oracle/Gettype1_half_unpremultTile_AVX_driver.ts   |  75 +
       raw-port/re/oracle/Gettype1_half_unpremultTile_AVX_oracle.py   | 291 +
       raw-port/re/oracle/OZAudioMixer_getTrackPan_oracle.py          | 154 +
       raw-port/src/nodes/OZAudioMixer.ts                             | 155 +
       raw-port/src/render/Gettype1_half_unpremultTile_AVX.ts         | 618 +
       5 files changed, 1293 insertions(+)

  Timeline: the kernel was claimed at 08:36:54; the OZAudioMixer commit above was written at
  08:41:23 and swept it up; the kernel's own commit was written at 08:43:26 on
  `port/Gettype1_half_unpremultTile_AVX` (PR #535). #531 merged first, so by the time #535 was
  gated its 618 lines were already on main — the two copies differ by **five lines, all of them one
  comment** — and #535 went from APPROVED to `CONFLICTING` and was closed as a dup.

  COST: one worker run and one full reviewer run (re-derivation of 169 instructions plus a Rosetta
  oracle) spent on a unit that was already landed, and a second reviewer run on #531 spent reviewing
  a unit that PR did not claim to contain.

  MECHANISM NOT PINNED, and I am deliberately not guessing — today's CORRECTION entry above is what
  happens when a plausible cause is published as fact. `wt_pool.sh cmd_acquire` DOES call
  `reset_clean` (which does `git clean -fdq -- raw-port/src raw-port/re`), so a slot is pristine at
  lease time; the contamination therefore happened DURING the lease. The two candidates are (a) two
  agents in one pool slot, or (b) one agent holding two units in one worktree and committing both
  under the first one's message. Either way the proximate cause is a commit that staged everything
  present rather than the files of the claimed unit.

  FIX, and it is the same for both candidates and cheap: **before committing, assert that the files
  you are about to publish are the ones your claim covers.** `pr_submit.sh` already knows the class;
  `git diff --cached --name-only` (or `--name-only origin/main...HEAD`, the form the CORRECTION
  above establishes as "what a merge applies") listing a path that does not belong to the claimed
  unit should be a hard refusal, not a warning. Note that nothing else in the stack can catch this:
  `gate.sh`/G6 only inspect the file handed to them, `dup_check` passed because at submit time the
  symbol was genuinely not on main, and both PRs were individually honest and gate-clean. The only
  reason it was noticed at all is that reviewer-1 spotted the bundling in #531 and reviewed both
  units separately rather than only the titled one — the right instinct, and the thing that kept an
  unreviewed 618-line kernel from landing silently.

- **`review_claim.sh` WILL LEASE A REVIEWER THEIR OWN PR — it has no author check at all.** Hit
  immediately after filing the entry above: my next `review_claim.sh claim` returned
  `CLAIMED 548`, which is the PR containing this very text. `grep -cE 'author|login|self'` on the
  tool is **0** — the eligibility filter is purely (gate status, reviewDecision), so authorship never
  enters into it. I released the lease untouched rather than gating my own work, but nothing in the
  tool or the brief stops a less suspicious agent from gating it, and the brief's own rule is that a
  reviewer must not gate their own edits (it is why re-applying methods is worker work).
  This is now reachable by design rather than by accident: AGENT_ENTRY section 8 tells every agent to
  add new failure modes to this file, so reviewers author OPS_LOG PRs routinely, and each one goes
  straight into the pool the same reviewers pull from.
  FIX: `cmd_claim` should exclude PRs whose author is the claiming identity — and since all slots
  share one bot identity (#7), "the reviewer app" cannot be distinguished that way; the usable
  signals are the PR author login (`vjeux` / `vjeux-worker[bot]`) versus who is running, or a
  marker the authoring agent writes into its own lease dir. Companion to the hand-dispatch gap
  filed with #528: both are cases where the lease machinery routes a PR to the one agent that
  should not have it.

  **CORRECTION to my own proposed fix, and I would rather retract it here than have someone
  implement it: excluding by AUTHOR would STARVE the queue, because `vjeux` is not one agent.**
  Worker slots that fall back to the operator's auth all publish as author `vjeux`, so that login
  spans many different agents — #550 (`feat/rework-queue`), #518 (`fix/srcsource-warn`) and #514
  (`fix/swarm-tooling`) are all author `vjeux` and none of them were mine. An author filter would
  have hidden three other agents' PRs from every reviewer, which is worse than the problem it
  solves. This is OPS_LOG #7's shared-identity problem showing up somewhere new: **authorship is not
  an agent identity in this swarm and cannot be used as one.** The workable fix is the other option
  named above — the authoring agent writes a marker (`$STATE/authored/<PR>`) that `cmd_claim` skips
  — because that is keyed to the agent rather than to a login half the swarm shares. I hit the
  over-broad version live while filing this: I skipped #550 as "mine" on the author check and only
  then noticed it was a peer's approved work, which is exactly the starvation the filter would
  institutionalise.

- **`pr_gate.sh` OVERWRITES A PEER'S REGRESSION FAILURE WITH `success` ON AN INFRA PR — #270 guarded
  only the opening `pending`, never the final verdict.** I did this to PR #550 and am reporting it
  against myself. On head `a92dfcb8`, six seconds apart: reviewer-1 posted
  `failure — regression (rebase needed): DIRTY on OPS_LOG.md` at 16:11:17, and my `pr_gate.sh 550`
  took the infra short-circuit and posted `success — no raw-port/src ports to gate (infra/tooling
  PR)` at 16:11:23. GitHub keeps only the latest status per context, so the PR then presented as
  APPROVED + green while actually being `CONFLICTING`. The #270 guard DID fire — the run printed
  "keeping existing 'failure' verdict … (not overwriting with pending)" — and then the run finished
  and posted its own `success` over that same verdict anyway. The infra path is the dangerous one
  because it posts `success` having inspected NOTHING: "no raw-port/src ports to gate" is not a
  statement about whether the branch can merge. Only GitHub's own CONFLICTING state stopped a bad
  merge. I restored the failure status by hand. FIX: the guard that protects a settled verdict from
  a `pending` should protect it from a verdict the run did not earn — an infra short-circuit must
  leave an existing `failure` alone, or post neutral rather than `success`. Same shape as #17,
  through the door #270 left open.

- **`wt_pool.sh release` DOES NOT CLEAR AN INTERRUPTED REBASE, so a released slot can hand the next
  lessee a tree that is mid-rebase.** Caused and observed by me minutes ago: a `git rebase` in my
  leased slot stopped on an OPS_LOG conflict, I released the slot, and `reset_clean` — which does
  `checkout --detach`, `reset --hard` and `clean -fd -- raw-port/src raw-port/re` — left
  `.git/worktrees/1/rebase-merge/` in place. The slot then showed `free` in `wt_pool status` while
  `git status -sb` said `## HEAD (no branch)` and `rebase-merge/head-name` still named MY branch.
  My very next `acquire-at` handed me that same slot, `reset_clean` again did not clear it, and the
  commit I made there went onto the stale rebase state instead of onto main — I noticed only
  because `git diff --name-only origin/main...HEAD` came back EMPTY for a commit that plainly
  changed a file. That empty diff is the tell. This is the flip side of the existing
  "already a rebase-merge directory" note in this file: that entry tells you to check
  `rebase-merge/head-name` when a rebase mysteriously fails, and this is where the stale directory
  comes from. FIX: `reset_clean` should run `git rebase --abort || git rebase --quit` (and clear
  `CHERRY_PICK_HEAD`/`MERGE_HEAD`) before the reset — a lease boundary is exactly where an
  in-progress operation must not survive. WORKAROUND: before trusting a freshly acquired slot, check
  `git -C "$WT" status -sb`; if it says `HEAD (no branch)` unexpectedly, `git rebase --abort` first.

## Open — known, not yet fixed

- **Case-only class-name collisions are unportable, and the checkout can't even represent them.**
  Helium ships **29 class pairs that differ only in case** — `HGCColorGamma_2vuy_yxzx_expand` vs
  `HgcColorGamma_2vuy_yxzx_expand`, `HGCRetimeFullRez` vs `HgcRetimeFullRez`, … (HGC = the
  outward-facing render-graph node, Hgc = the internal implementation base; the landed
  `HGCRetimeFullRez.ts` header documents the pairing). PORTING_SPEC says "file name = the exact
  class name", but the repo lives on a **case-insensitive APFS volume**, so
  `src/render/HgcRetimeFullRez.ts` *resolves to* the landed `HGCRetimeFullRez.ts` — a worker writing
  it OVERWRITES a landed file instead of creating a new one. `raw-port/army/tools/check_duplicate_classes.py` also
  lowercases basenames (line 22, `return b.lower()`), so the pair is rejected as a duplicate even on a case-sensitive volume.
  Every `Hgc*` twin of a landed `HGC*` class is therefore blocked on a **convention decision**
  (e.g. an explicit suffix for the lowercase-Hgc twin) plus teaching the dup checker about it.
  Two units dropped this way so far (`depclaim.py blocked`); both bodies were fully decoded.
- **`gate.sh` piped into `tail` reports the exit status of `tail`.** `gate.sh … | tail -8 && git
  commit && pr_submit` runs the commit and opens the PR even on `GATE: REJECT` — a pipeline's status
  is its LAST command. That is how a G6 REJECT ("this change REMOVES work already merged on main")
  still reached GitHub as a PR; the branch had to be reset to origin/main, the method re-applied
  ADD-only and the branch force-pushed. Never pipe the gate when its exit code guards anything —
  redirect to a file (`gate.sh … > /tmp/g.txt 2>&1; echo $?`) or use `set -o pipefail`.
- **A class file can land on main *while you are writing the same class*.** The class-file race is
  not limited to two workers editing one file: `depclaim` hands two units of the SAME class to two
  workers at once, `wt_pool acquire <Class>` silently falls back to `port/<Class>__slotN` when the
  branch is taken, and the second worker's `write` of a "new" file clobbers the first one's landed
  copy. Mitigation that works today: re-`git fetch` and re-check `git show origin/main:<path>`
  IMMEDIATELY BEFORE committing, not only at acquire time (both of this session's collisions —
  `Json__Value__CZString` and `OZChannelLevels_Factory` — appeared in the ~10 minutes between
  leasing the worktree and committing).
- **Ozone/Flexo need a RECURSIVE `@rpath` PRELOAD, and there is already a landed helper that
  does it — `DYLD_FRAMEWORK_PATH` is NOT the lever.** Three claims, each checked against the
  tree and the box rather than remembered:
  * `fct/parity/oracle.py` FRAMEWORKS (line 60) DOES list Ozone; **Flexo is the one missing**.
    So the failure is not an absent map entry — it is that `load_framework` does a plain
    `dlopen`, which cannot resolve Ozone's `@rpath` chain
    (`@rpath/ProAppSupport.framework/...`, which is PRESENT on disk).
  * **The recursive preload WORKS**, and does not need to be written again:
    `raw-port/re/oracle/ozone_loader.py::load_framework` is landed and does a DEPTH-FIRST
    `otool -L` walk, `ctypes.CDLL(<abs path>, RTLD_GLOBAL)` on each dependency, then the
    target. Depth-first needs no retry rounds at all; a breadth-first "preload everything and
    retry" converges too, in about six rounds, which is why a fallback that gives up earlier
    reports failure on a case that succeeds. Used through `ozone_loader` this session against
    Ozone (`PCQuat<double>::setRotation` @0x7bd30, `HGFreeAlign` @0x688ea0,
    `OZAudioFrameFromSample` @0x23c950), Flexo (`copyCropValues` @0xe18390) and Helium — all
    loaded, none needed an env var.
  * **`DYLD_FRAMEWORK_PATH` does not work, and the SIP caveat is not the reason.** It fails
    identically on a non-SIP interpreter, because `DYLD_FRAMEWORK_PATH` cannot supply an
    `@rpath` to a binary that carries no `LC_RPATH` — the two are different mechanisms. (The
    SIP point is still true and still worth knowing: `/usr/bin/python3` is hardened, so dyld
    strips every `DYLD_*` variable from it. It is just not what decides this.)
  Still worth doing: fold **Flexo** into `oracle.FRAMEWORKS`, and have `load_framework` call
  the `ozone_loader` walk instead of a bare `dlopen`. And the standalone-C-driver note below
  stands: `-Wl,-rpath,...` is not a workaround, because the corp security stack SIGKILLs a
  freshly compiled local binary (`Killed: 9`) even after an ad-hoc codesign.

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
- **`depclaim.py blocked` mixes three different states under one word.** The list now holds entries
  that are genuinely out of scope (the libc-stdio family), entries that are one named unported
  callee away from being trivial (`OZBehavior::getScene` — vtable slot RESOLVED to
  `OZSceneNode::getScene` @Ozone 0x8c4f0, just unported), and entries that are simply unfinished
  handovers (`HgcYUV444TriPlanar_601ToRGB::RenderTile_AVX` — portable, dropped mid-decode). A reader
  cannot tell them apart without reading every reason string, and `next` treats them identically. A
  `--kind` tag on `drop` (out-of-scope / dep-blocked / handover) would make the queue's real shape
  visible and let a worker preferentially pick up handovers, which are the cheapest work available.

- **No RTTI/lineage mechanism exists in the port, and `__dynamic_cast` bodies cannot be landed
  without one.** `OZExposeDrillingNodeValidator.isValidType` got away with a throwing
  `___dynamic_cast` stub because six casts FEED real predicate logic, so G5 still sees real work.
  Where the cast IS the body — `OZDynamicSpline::getVertexChannel` @ProChannel 0x2b1bc, whose whole
  content is `dynamic_cast<OZDynamicVertex*>` plus `addq $0x30` — the same treatment is a whole-body
  stub and G5 correctly rejects it (`REAL disasm but the port throws incompleteness on 175 reachable
  inputs`). G5 is right and the stub precedent is misleading. Standing up one class-lineage helper
  would unblock this whole family at once.

- **One class, two files** — `OZScene` exists in both `channels/` and `nodes/`; `OZRenderParams`
  `+0x1e5` is aliased by two differently-named landed fields, which makes a faithful getter for that
  byte impossible to write until the ledger is unified.

---

## Open — reported 2026-08-11 by worker 5 (new)

- **`disasm.sh --sym` CAN RETURN A 0-LINE RESULT FOR A SYMBOL THAT IS DEFINITELY PRESENT, AND ITS
  MESSAGE POINTS AT THE WRONG CAUSE.** On `__ZN27CoreMediaMovieReader_Decode26getH264SoftwareThread
  CountEb` it printed `0-line disasm … (wrong framework? stub/extern/ICF?) — no .s written`, twice,
  each attempt taking ~5 minutes under load. The symbol is not missing: the cached inventory has it
  at **Flexo 0xde8d90**, and

      otool -arch x86_64 -tvV -p <mangled> /tmp/Flexo.x86_64

  printed the whole body in **~7 seconds**. So the suggested diagnosis ("wrong framework") sends you
  looking for a symbol that is right there, and the tool is ~40x slower than the fallback even when
  it works. Two consequences worth knowing: (a) when `disasm.sh` comes back empty, try the direct
  `otool -p` against the THIN slice before concluding anything about the symbol — and never treat
  the empty result as an empty BODY, which is the failure mode #368 already cost us 198 symbols on;
  (b) `otool -tvV -p <sym>` on `/tmp/<FW>.x86_64` is a good general fallback: it starts printing at
  the named symbol and you can `head` it. Root cause not chased down (likely a stale/mismatched
  `symidx` entry for symbols that also have `.cold.N` and `_block_invoke` companions — this one has
  both).

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


## Open — reported 2026-08-11 by worker 3 (symbol-cache availability + CoreGraphics semantics; new)

- **The symbol cache the perf directive mandates does not exist where agents work.** (worker 3,
  2026-08-11.) The 2026-08-11 directive says: never run `nm` on a framework under
  `/Applications/Final Cut Pro.app/...` (78 MB fat file, 60-120s, a full core, and the security
  stack rescans it), use `grep <pattern> raw-port/army/inventory/<FW>.syms.txt` instead (~0.08s).
  But `raw-port/army/.gitignore` line 2 ignores `inventory/*.syms.txt`, so the cache exists ONLY
  in the canonical checkout — and every worker is required to work in a **pool worktree**, where
  the file is absent. An oracle that follows the directive dies with `FileNotFoundError` at the
  point where it resolves an address. This is the same shape as #16 (Layer-3 fixtures gitignored,
  so `prove_all` could not pass in a pool worktree), one directory over. Workaround in the
  meantime, used by `raw-port/re/oracle/box_t_dist_oracle.py`: look in this tree, then
  `~/random/final-cut-pro-transitions`, then fall back to `nm -n /tmp/<FW>.x86_64` — the THIN
  slice disasm.sh already extracted, never the fat original. Real fix: have `ensure_ledger.sh`
  (which already restores 6 gitignored ledgers into a fresh checkout) restore or symlink the 5
  `inventory/*.syms.txt` files too, so the fast path is available where the work happens.

- **CoreGraphics' `CGRect` accessors are not the obvious formulas, and the difference is 1 ulp.**
  (worker 3, 2026-08-11, found on `videoanalysis::collation::box_t::dist`.) Any port that reaches
  `CGRectGetMaxX/MaxY` needs these two, both measured against the live framework:
  (a) for a NEGATIVE extent, standardization is two steps and the second one rounds again —
  `MaxX = (x + width) - width`, which is a DIFFERENT double from both `x` and `max(x, x+width)`
  (50 of 8,198 corpus rects differ, always by exactly 1 ulp, and the error then propagates
  through a multiply and a sqrt into the result);
  (b) `CGRectIntersectsRect` does NOT implement the documented "an empty rect never intersects"
  rule. Each axis behaves as the half-open interval `[min, max)`, except that a ZERO-extent axis
  behaves as the single point `{min}`: two proper rects sharing an edge do not intersect, a
  zero-width rect on the other's MIN edge does, on its MAX edge does not, and two zero-width
  rects intersect iff their coordinate is equal. Verified 0 mismatches on 16,000 pairs; the
  documented rule was wrong on 10 of one port's 4,096 pairs, plain strict overlap on 244 of an
  8,000-case grid, closed-interval overlap on 1,115. NaN components are NOT modellable by any
  simple rule (the live function answered 104 true / 296 false over 400 random single-NaN pairs)
  — state that envelope rather than guessing. A reusable TS copy of all of this lives in
  `raw-port/src/infra/videoanalysis__collation__box_t.ts`; copy it rather than re-deriving it.

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

## Open — reported 2026-08-11 by reviewer 2 (two more false-verdict traps; new)

Both of these produce a WRONG VERDICT from correct code, in opposite directions, and both are
cheap to defuse once named.

- **`ctypes.create_string_buffer(b"\xAA" * N)` allocates N+1 bytes, so the "did the callee touch
  my object?" check fires on 100% of calls.** The buffer gets a trailing NUL, so `bytes(obj)` is
  N+1 long and can never equal the `b"\xAA" * N` literal you compare it against. Reviewing #422 I
  measured "receiver bytes modified = 800/800" against a body — `xorl %eax,%eax ; ret` — that
  provably contains no store at all. Ten seconds of doubt about a correct port, and the failure
  points AT THE PORT, which is the expensive direction. Fix: snapshot the buffer
  (`before = bytes(obj)`) and compare against that, or pass the explicit size
  (`create_string_buffer(b"\xAA" * N, N)`). Same family as the `CFRange`/`Array.from` traps above:
  **when a differential says the port is wrong, suspect the harness first — every real defect
  found so far was found by a harness that had already been debugged.**

- **A transient TLS failure to api.github.com is rendered by `pr_gate.sh` as `PR #<n> not
  found`.** Under the corp TLS-inspecting proxy, `gh` intermittently dies with
  `tls: failed to verify certificate: x509: certificate signed by unknown authority`; `pr_gate`
  swallows that and prints "not found", which reads as a VERDICT — the PR was closed or the number
  is wrong — rather than as a network failure. Hit twice in one hour on #448 (which was OPEN the
  whole time; a bare `gh pr view` retry succeeded immediately) and on `pr_comment_once`, which just
  prints `post failed`. A reviewer who believes "not found" skips or closes a live PR. This is the
  same shape as the already-recorded #372 trap (`pr_land` printing "no APPROVED review" with an
  empty SHA was a transient API failure, not a verdict). Fix: have the gh wrappers distinguish a
  genuine 404 from a transport error and retry the transport error 2-3 times with a short backoff;
  until then, **retry any gh-sourced "not found" / "post failed" before you act on it.**

---

## Open — reported 2026-08-11 by worker 3 (otool -tV eats struct field offsets; FIXED in this change)

- **`otool -tV` RENDERS STRUCT FIELD OFFSETS AS UNRELATED FUNCTION NAMES, `disasm.sh` CACHES THAT,
  AND THE POISONED `.s` IS WHAT EVERY WORKER TRANSCRIBES AND WHAT G5 CLASSIFIES.** `-V` resolves the
  disp32 of a memory operand against the symbol table. For `%rip`-relative operands that is correct
  and load-bearing (it is how callees and literals get named). For **any other base register the
  displacement is a struct field offset, not an address**, and symbolizing it produces a line that
  describes a different program. Two live examples, both real:

      0x61b2e4  leaq  "-[OZMagnifyTool draw]"(%rdi), %rax          # otool -tV
      0x61b2e4  leaq  0x4290(%rdi), %rax                           # what it actually is

      0x29d4f3  vaddps __ZN17HGParamBufferDesc8addFieldE5HGRefI12HGParamFieldE(%rsi), %ymm5, %ymm5
                       ## HGParamBufferDesc::addField(HGRef<HGParamField>)      # otool -tV
      0x29d4f3  vaddps 0x14c0(%rsi), %ymm5, %ymm5                               # what it is

  A local ObjC method happens to live at VA 0x4290 and `HGParamBufferDesc::addField` at VA 0x14c0.
  Note the second one carries otool's own `## demangled` comment, which makes the fiction look
  authoritative — the "confident garbage" shape of #20/#21, arriving through the DISASSEMBLER
  instead of through `find_disasm`.

  **Scope, measured over all five `/tmp/<FW>_tV.txt` dumps: 355 instructions in 151 functions —
  Ozone 149 lines / 105 functions, Helium 205 / 45, Flexo 1 / 1, and zero in ProCore and
  ProChannel** (a framework is only exposed where a symbol's address happens to collide with a
  displacement its own code uses, which is why this went unnoticed for so long). The distribution is
  the bad news: it lands almost entirely on **ctors and the AVX kernels**, i.e. on exactly the two
  places where the numbers ARE the work. `HGToneCurve::State::C2` @Helium 0x249860 has **26**
  poisoned stores — that is its entire field layout — and all 45 affected Helium functions are the
  `Get*Tile_AVX` / `Get*Tile` family, whose `(%rsi)` operands are reads of that very parameter block
  (+0x940, +0xa0, +0x13e0, +0x14a0, +0x14c0 …). On the Ozone side it is the ctors/dtors of
  OZImageElement, OZGroup, OZRotoshape and the OZMaterial*Layer family. A worker recovering a layout
  from one of those ctors, as PORTING_SPEC Rule 5 requires, gets a disassembly with **no offsets in
  it at all**.

  **This is the second independent discovery, which is what makes it a tooling bug and not an agent
  bug.** The landed `raw-port/src/render/Getsrgb_half_sat_unpremultTile_AVX.ts` documents the exact
  same artifact at the exact same three addresses, worked around it correctly in-file (it decoded
  the instruction BYTES: modrm `ae`, disp32 `c0 14 00 00` = 0x14c0), and never put it here — so the
  next agent, on a different framework, paid for it again. **If you work around a tool lying to
  you, the workaround belongs in OPS_LOG, not only in your file header.**

  FIX (in this change, and it is a repair rather than a downgrade — dropping `-V` would cost the
  `## symbol stub for:` call annotations the whole workflow depends on): new
  `raw-port/tools/desymbolize_disp.py`, called by `disasm.sh` at all three of its write sites. For
  every non-`%rip` operand it looks the named symbol's address up in the cached inventory and puts
  **the number** back, replacing otool's misleading `## demangled` tail with a note saying what
  happened. It never guesses: an unresolvable name keeps its original operand and gets a WARNING
  comment telling the reader to re-derive with `otool -arch x86_64 -tv`. Cost is nil — the file is
  scanned in memory and only rewritten when a poisoned operand is present.

  Evidence the repair is EXACT, not merely plausible: for 10 affected functions across Ozone and
  Helium, all **59** repaired lines are byte-identical to the same instruction from
  `otool -arch x86_64 -tv` (the non-symbolizing ground truth). Pinned by
  `raw-port/tools/test_desymbolize_disp.py` (8 operand cases + unresolvable + clean-file no-op),
  which also locks the two directions that matter: a `%rip` symbolization must SURVIVE untouched,
  and an already-numeric displacement must not be touched.

  **Caveat for anyone holding an old checkout: already-cached `.s` files stay poisoned until they
  are regenerated**, and `disasm.sh` reuses an existing `.s`. If a body you are about to transcribe
  has a name where a number belongs, delete the `.s` and re-run `disasm.sh --sym`. And the standing
  reflex worth keeping even with the fix in: **a memory operand whose displacement is a NAME is
  never right — cross-check with `otool -arch x86_64 -tv -p <sym> /tmp/<FW>.x86_64` (0.1s), or read
  the disp32 straight out of the instruction bytes.**

---
## Open — reported 2026-08-11 by worker 2 (every agent reads a STALE OPS_LOG; new)

- **THE OPS_LOG AND BRIEFS AGENTS ACTUALLY READ ARE THE CANONICAL CHECKOUT'S COPIES, AND THAT
  CHECKOUT IS NEVER FAST-FORWARDED WHILE THE SWARM IS LIVE — MEASURED 87 COMMITS AND 724 LINES
  BEHIND.** `AGENT_ENTRY.md` §1 opens with "Everyone, first: OPS_LOG.md — reading it is the
  cheapest thing you will do all session; rediscovering an entry in it is the most expensive",
  and every dispatch prompt sends the agent to `~/random/final-cut-pro-transitions/raw-port/army/`.
  Measured at 08:35 today, one hour into this swarm run:

      canonical HEAD 902f1fa0   origin/main 3486b099   -> 87 commits behind
      raw-port/army/OPS_LOG.md   on disk  454 lines / 10 sections
                                 on main 1178 lines / 26 sections

  So the file the contract tells every agent to read first was missing **16 of the 26 sections,
  including every hazard reported today** — the rebase-drops-files entry, the reviewer's-gate-
  deletes-a-worker's-port entry, the attempt-cap entry, the Ozone-oracle confirmation, all of it.
  I only avoided re-walking those because my dispatch prompt happened to quote a few of them
  inline; an agent whose prompt just says "read AGENT_ENTRY.md" (which is what AGENT_ENTRY.md
  itself prescribes, correctly) gets the hour-old copy and rediscovers whatever landed since.

  ROOT CAUSE is the one reviewer 2 already documented for `mark_ported.py`, but the consequence is
  much wider than the ledger: the ONLY `git reset --hard origin/main` in the swarm is
  `swarm_maint.sh` step (2), and it is gated on the tree being **DIRTY** —
  `if [ -n "$dirty" ] && ! pgrep -f 'pr_gate.sh|pr_submit.sh|pr_land.sh|rebase_pr.sh'`. A tree that
  is CLEAN but 87 commits behind matches neither condition and is never advanced at all. The guard
  is backwards for this purpose: dirtiness is a reason to be CAREFUL about resetting, not a
  precondition for fast-forwarding.

  FIX, cheapest first: (a) in `swarm_maint.sh`, fast-forward whenever the tree is clean and behind
  (`git merge --ff-only origin/main`), keeping the dirty+no-proc `reset --hard` as the separate,
  more dangerous path it already is; (b) have `AGENT_ENTRY.md` open with `git fetch -q origin main`
  and tell agents to read the briefs via `git show origin/main:raw-port/army/<file>` — the same
  fix pattern `srcsource.py` (#518) applied to the sources, applied to the docs; (c) failing both,
  every brief-reading step in the loop should be done inside a freshly-leased pool worktree, which
  IS reset to origin/main on lease.

## Open — reported 2026-08-11 by worker 2 (a regression no rebase can fix never leaves the rebase queue; new)

- **A `regression (rebase needed)` verdict that is a FALSE POSITIVE puts the PR in an unbounded
  rebase loop: the branch is already correct, every rebase "succeeds", the verdict returns
  unchanged, and the queue re-hands it to the next worker forever.** Hit on PR #504
  (`port/HGBMDFilmGen5LinearizationLUTInfo`) which I claimed twice inside ten minutes. Its file
  content was intact and provably unchanged across all three heads that exist today
  (64899c51 -> my 69b72435 -> another agent's 5f4ab283, each contributing exactly
  `A raw-port/re/oracle/HGBMDFilmGen5LinearizationLUTInfo_D0_oracle.py` +
  `M raw-port/src/render/HGBMDFilmGen5LinearizationLUTInfo.ts`, 520 lines, nothing dropped), and
  main had not touched that file since the branch's base. The verdict was manufactured by
  `regression_check.py`'s `MANGLED = re.compile(r'__Z[A-Za-z0-9_$.]+')`, which includes `.` in the
  token, so main's prose line

      * @Helium __ZN33HGBMDFilmGen5LinearizationLUTInfoD0Ev<PERIOD>

  (written here with `<PERIOD>` standing in for the literal `.` character, so that quoting the
  evidence does not plant the very token this entry is about into main's copy of this file.)

  yields the symbol `…D0Ev.` **with the sentence's period attached**. The branch writes the same
  name inside parentheses without a trailing period, so main "has a symbol the branch dropped" —
  and the substring-forgiveness filter does not save it, because the retained `…D0Ev` does not
  CONTAIN `…D0Ev.`. (The regex itself is fixed by PR #516, already gate-green; this entry is about
  what the QUEUE does with such a verdict, which #516 does not change.)

  WHY IT MATTERS BEYOND THIS ONE PR, AND WHY IT GETS WORSE AFTER THE GOOD FIX: today the 3-attempt
  cap eventually terminates the loop by auto-closing the PR — destroying correct work, which is
  reviewer 6's entry above and is being fixed in #514. But #514 (rightly) resets the counter
  whenever the head has moved, and a rebase always moves the head. So once #514 lands, a
  rebase-unfixable regression becomes an **infinite** loop instead of an auto-close: worker slots
  are consumed re-rebasing a branch that was never wrong, at whatever rate the queue hands it out.
  Two good fixes stacking into a livelock is the "a fix can be the next outage" pattern (standing
  rule 8) with two authors.

  FIX: make the rebase path check its own work. After `rebase_pr.sh` force-pushes, re-run
  `regression_check.py origin/main <new head> <changed files>`; if it STILL reports a regression,
  the PR is not rebase-fixable — post that as a distinct status/description (e.g.
  `regression NOT fixable by rebase`) which `rebase_claim.sh`'s filter EXCLUDES, so it routes to a
  human/reviewer instead of back into the worker queue. Cheap corollary that would have caught this
  one instantly: when `regression_check` reports a dropped symbol, print whether the branch
  contains that symbol modulo trailing punctuation, and say so.

  WORKAROUND meanwhile, and what I did with #504: before spending a rebase, run
  `python3 raw-port/army/tools/regression_check.py origin/main <PR head> <changed files>` yourself
  and LOOK at the dropped symbol. If it is prose punctuation (or otherwise present in the branch),
  do not rebase — delete `$FCT_STATE_DIR/rebase_attempts/<PR>` so the cap cannot execute the PR,
  release the lease, and comment on the PR naming the real blocker.

## Open — reported 2026-08-11 by worker 2 (a HELD warm-pool lease was taken from under a live unit, twice)

- **A worktree I held a fresh lease on was reset out from under an in-flight unit — the whole unit
  (a 618-line transcription plus its oracle and driver, already gate-PASS and oracle-VERIFIED) was
  gone by the time I ran `git commit`.** Worker 1's entry above reports the reviewer-gate flavour of
  this; mine was taken by ANOTHER WORKER'S branch, and the lease was three minutes old, so neither
  the 120-minute stale-reclaim nor the "don't steal a tree holding uncommitted work" guard applied
  as documented. The evidence is in the slot's own reflog, which shows my checkout replaced by a
  peer's branch and then reset:

      $ git -C ~/.fct-pool/wt/4 reflog -5
      5142b989 HEAD@{0}: reset: moving to origin/main
      06799c92 HEAD@{1}: checkout: moving from port/OZAudioMixer to HEAD
      06799c92 HEAD@{2}: rebase (finish): returning to refs/heads/port/OZAudioMixer
      06799c92 HEAD@{3}: rebase (pick): port: OZAudioMixer::getTrackPan(STTrack*, float*)
      5142b989 HEAD@{4}: rebase (start): checkout origin/main

  `wt_pool.sh status` had listed slot 4 as `LEASED port/Gettype1_half_unpremultTile_AVX` at the time
  the peer took it. Whatever path did it (a `pr_submit`/`rebase_pr` reclaim, or the #258
  disposable-`gate/<sha>` carve-out that is allowed to take a DIRTY slot), the effect is that a
  lease is not a guarantee, and the loss is silent: the next thing the worker runs prints
  `nothing to commit, working tree clean`, which reads like "I already committed".

  A SECOND loss the same session was my own procedural error, and it is worth naming because the
  brief does not: I wrote a file into a pool worktree AFTER releasing it (a released slot is reset
  the instant anyone leases it). Both losses have the same cheap defence, which is now what I do:

  **WRITE THE UNIT TO A PATH NOBODY ELSE MANAGES FIRST, THEN COPY IT IN, AND ACQUIRE → COPY → GATE
  → COMMIT IN ONE SHELL INVOCATION.** `/tmp/<slot>_<unit>/` costs nothing, survives every reclaim,
  and shrinks the window in which a lease matters from "however long the transcription takes"
  (tens of minutes) to a few seconds. Re-deriving a 600-line AVX transcription from scratch is the
  expensive alternative, and it is the one the swarm pays today.

  FIX for the tooling, in order of value: (a) `wt_pool.sh` should refuse to hand out a slot whose
  lease file is present and NOT stale, and log loudly when it overrides one — today the override is
  invisible to the victim; (b) the reclaim paths should key on the LEASE, not on the tree's
  cleanliness, since a worker mid-transcription has a clean tree with untracked files, which is
  exactly the state that looks abandoned; (c) `wt_pool.sh acquire` could stamp the slot with the
  acquiring PID/slot id so the reflog is not the only forensic trail.

## Open — reported 2026-08-11 by worker 3 (float oracles: a working TS↔binary route, and the one thing it cannot compare)

- **A REAL TypeScript↔binary differential needs no harness at all: `node
  --experimental-strip-types` imports a ported `.ts` DIRECTLY.** Every float
  oracle in this repo so far compares the live function against a PYTHON
  restatement of the port, which shares any misreading of the disassembly with
  the port itself — if you decoded `minsd`'s operand order backwards, you write
  it backwards in both places and the oracle agrees enthusiastically. The
  G4/`fct.parity` path that was supposed to solve this cannot run at all right
  now (see the G4 entry above: `HARNESS_BROKEN` on every sweep), so
  oracle-mapped files are unmergeable and everyone else is stuck with the
  mirror.

  Node 24.2 is already on this box and strips types natively, so the whole
  thing is one subprocess:

      # driver.mts — imports the REAL port, no build step, no tsx, no tsgo
      import { Foo } from "../../src/channels/Foo.ts";
      ...
      node --experimental-strip-types driver.mts   # JSON in, JSON out

  Worked example landed with the `SurroundPanner::AngleBisectionRatio` port:
  `raw-port/re/oracle/SurroundPanner_AngleBisectionRatio_{oracle.py,driver.mts}`
  — 1,410 cases against the live Flexo function, 0 divergences, with the six
  negative-control mutants evaluated in the SAME node process so they are
  apples-to-apples with the port. Two practical notes: the driver must import
  with the explicit `.ts` extension, and it should hold the mutants itself so
  one subprocess answers every question (spawning node per mutant is what makes
  this feel expensive when it is not).

  This does not fix G4 — `oracle_map.json`/`registry.json` still need the
  output-name contract that entry describes — but it means **"the parity driver
  is broken" is no longer a reason to sign a float port on reading alone.**

- **A NaN RESULT CANNOT BE COMPARED BIT-EXACTLY BETWEEN x86 AND JAVASCRIPT, and
  a harness that demands bit equality will fail an entirely correct port.** The
  standing advice in these notes — *exchange floats as raw bit patterns, which
  also makes the comparison bit-exact instead of value-equal* — is right for
  every finite value, both signed zeros, and both infinities. It has exactly one
  exception, and it is not obscure: **x86's `divsd` on 0/0 produces the "QNaN
  floating-point indefinite" `0xfff8000000000000`, with the SIGN BIT SET, while
  JavaScript canonicalises every arithmetic NaN to `0x7ff8000000000000`** and
  offers no way to produce the other one from arithmetic. Measured on
  `AngleBisectionRatio`: 27 of 1,410 cases, every one of them NaN on both sides,
  differing in nothing else.

  Do NOT "fix" this by having the port construct a NaN through a `DataView` —
  that is a rewrite of `divsd`, not a transcription. Do not hide it behind a
  value-equality comparison either, because that also hides real defects.
  Classify it: compare bit patterns, and treat *both sides are NaN* as its own
  outcome, reported with a count next to the divergence count. The three-line
  predicate is in
  `SurroundPanner_AngleBisectionRatio_oracle.py::is_nan_pair_diff`.

  Corollary worth stating because it cost the first run of that oracle a FAILED
  verdict: this fires the moment a corpus includes `b == c`, which is exactly
  the boundary case a good corpus must include. Expect it, rather than going
  back to re-read the disassembly of a correct port.

## Fixed 2026-08-11 — six ways the swarm's own tooling lost work or evidence

Filed and fixed together because they are one failure class: **a tool that mis-handles an agent's
finished work, and produces output that is itself gate-clean, so nothing downstream can catch it.**
Each was reported independently by an agent that hit it live.

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 25 | `rebase_pr.sh` / `rebase_helper.py` **silently deleted a branch's new files**; on #449 an oracle harness was destroyed and had to be recovered from a commit the force-push had already orphaned | The union rebase starts from `origin/main` and writes back ONLY the union-merged `raw-port/src/**.ts`. Anything else the branch added — an oracle, a doc, a tool — was never carried, and the force-push made the loss permanent. Invisible to the gate, which only inspects the `.ts` files handed to it | Carry every non-union path the branch added/modified (`git checkout <BR> -- <path>`), then ASSERT every one of them exists before committing; `rebase_pr.sh` additionally diffs the file LIST against the PR's branch and refuses the force-push if anything is missing |
| 26 | `rebase_helper.py <Class>` returned exit 0 and "ready for reviewer" for **a different PR's content** (a reviewer holding #390 was handed #396's) | `BR = f"origin/port/{cls}"` — but #240's contention fix created `port/<Class>__slot<N>`, and HGRenderJob had six open PRs. The wrong content is gate-clean, so the reviewer merges an unverified port under their own APPROVE while their real PR is never rebased | `--pr <N>` resolves the head branch from the PR; a class name with more than one matching open PR now REFUSES (exit 4) instead of guessing. `rebase_pr.sh` passes `--pr` |
| 27 | A provably disjoint union **false-BAILed** (#392: branch adds `isExternal`, main adds `isBuiltin`) | `MANGLED` included `.`, so a `re/disasm/Fw.__ZN….s` FILENAME cited in a comment produced a phantom symbol `__ZN….s`. A false BAIL downgrades a reviewer-safe union into a worker rebase the attempt cap can discard | Drop `.` from the character class — the match starts at `__Z`, so the framework prefix never needed it |
| 28 | The rebase attempt cap **closed green, APPROVED, oracle-verified PRs** (#387 at 3/3 while approved; #390 closed carrying a 1400/1400 differential; #389's symbol left claimed-forever) | The counter was written on every successful LEASE — before the rebase ran, regardless of outcome — and cleared only by the branch that closes the PR. So it counted "times this PR needed a rebase" while the cap asserted "times rebasing FAILED". With K PRs on one class the cap is consumed in ~K sibling merges however well the rebases work: it retires the losers of a race, fastest when the merge rate is healthiest | The counter resets when the head SHA has MOVED since the attempt was charged (a new gating head is progress), and a PR holding an APPROVED review is exempt from the cap outright |
| 29 | A stale base caught by **G6** sat open forever | `regression_check` posts `regression (rebase needed)`, which matches `rebase_claim`'s filter; G6 posts `G0-G5 gate reject`, which does not. Same condition, different words. Reviewers were hand-writing the status to get PRs queued | `rebase_claim` accepts both spellings |
| 30 | **Review evidence was silently deleted from the permanent record** — on #445 the clause naming the defect, on #481 two fragments | Agents invoke `pr_review.sh` inside a double-quoted `bash -c`, and a review body naturally contains backticked instruction names (`` `vcmpltps` ``). The CALLER's shell runs them as command substitutions before the script sees them; the posted review still reads plausibly, so nobody notices. Same door as the `depclaim.py drop` reason | `pr_review.sh <PR#> <verdict> --body-file <path>` — a file has no shell in its path. A backtick reaching the argv form now prints a warning naming the risk |
| 31 | A reviewer's worktree became **unreleasable after its PR landed**, leaking a pool slot — and it leaked harder the better reviewers did | `wt_has_work` treats "HEAD not contained in any remote branch" as unpushed work. After a squash-merge deletes the branch, a reviewer's `acquire-at` DETACHED HEAD satisfies that on a tree whose `git status` is empty | Only apply the unpushed test when HEAD is a branch. A detached HEAD is a checkout of a commit that already exists on the server; it cannot hold work |
| 32 | The slot lock could not distinguish **"died mid-tick" from "working"** — a replacement was dispatched into a live slot | `slots/<role>-<N>/held` was written once at acquire and holds no pid, so the 90-minute stale-reclaim measured TICK AGE, not idleness: a healthy reviewer in a long differential looked exactly like a corpse, and a holder that died at minute 5 held the slot for the full 90 | `slot_lock.sh heartbeat <role> <n>` touches the file (run it after every verdict/unit), and `acquire` now records the real pid |

Locked by `verifier/test_rebase_tools.py` (prove_all LAYER 2e): a cited `.s` filename must not read as
a symbol, an ambiguous class must refuse rather than guess, and a rebase must carry the branch's
non-src files. **Each case was mutation-tested** — the fix removed, leaving valid code, and the case
confirmed red. That check exists because the first version of the carry case compared a hand-built
set against itself and passed with the entire carry block deleted, while three places (prove_all's
own LAYER 2e line, this table, and AGENT_ENTRY) asserted it was locked. Caught in review on #514.
**A lock that cannot fail is not a lock, and a false "locked" is worse than an honest "not locked" —
it is the same silent-clean-output shape as the eight bugs above.** Re-run the mutation whenever you
change these tools.

---


## Open — reported 2026-08-11 by worker 3 (the unreleasable-worktree fix as proposed would not cover the WORKER case)

- **A WORKER'S OWN `port/<Class>` WORKTREE IS ALSO UNRELEASABLE ONCE ITS PR SQUASH-MERGES, and the
  fix proposed for the reviewer version of this bug does not cover it.** The existing entry above
  ("A REVIEWER'S `acquire-at` WORKTREE BECOMES UNRELEASABLE THE MOMENT ITS PR LANDS") diagnoses the
  `acquire-at` detached-HEAD case and proposes gating `wt_has_work`'s unpushed-commit test on
  **HEAD being a BRANCH** (`git symbolic-ref -q HEAD`), reasoning that "a detached checkout is by
  construction a read-only inspection lease". That reasoning is sound and the fix is still worth
  making — but it would have left this case broken, because here **HEAD IS a branch**.

  Hit live today on slot 3, holding `port/OZMaterialDiffuseLayer` after PR #515 merged:

      $ git -C ~/.fct-pool/wt/3 status --porcelain      # completely clean
      $ git -C ~/.fct-pool/wt/3 rev-list --count origin/main..HEAD
      1
      $ git -C ~/.fct-pool/wt/3 branch -r --contains HEAD
                                                        # empty
      $ wt_pool.sh release ~/.fct-pool/wt/3
      wt_pool: … has UNCOMMITTED or UNPUSHED work — not discarding it.

  Same mechanism as the reviewer case and the same both-conditions-true trap: a SQUASH merge creates
  a NEW commit, so the branch tip is not an ancestor of `origin/main`, and GitHub deletes the head
  branch on merge, so it is contained in no `origin/*` ref either. The work is on main; the message
  names work that does not exist. Verified before force-releasing: both files at the worktree's HEAD
  are byte-identical (`shasum`) to their `origin/main` versions.

  So the guard needs a test that does not depend on HEAD's detachedness. The cheap and correct one:
  **before refusing, check whether the worktree's tree content is already reachable from
  `origin/main`** — e.g. every path the branch touches is byte-identical on `origin/main`, or the
  branch's diff against `origin/main` is empty. That covers detached reviewer leases and worker
  branches with one rule, and it still protects a genuine in-progress port (whose content is NOT on
  main yet). Until then the documented WORKAROUND applies to workers too: confirm
  `git status --porcelain` is empty AND the touched files are byte-identical on `origin/main`, then
  `release <path> --force`.

  **The reason this cost a slot at all is worth saying plainly, because it is an agent-side habit and
  not a tool bug:** a worker that submits a PR and moves straight on to the next unit leaks the
  lease. The loop in `HARNESS_LOOP.md` has `wt_pool.sh release "$WT"` immediately after
  `pr_submit.sh` for exactly this reason. Release the worktree in the same command as the submit, not
  in a later step that a long investigation can push out of view.
## Open — reported 2026-08-11 by worker 3 (otool's LINEAR sweep desynchronises; FIXED in this change)

- **`disasm.sh` returns 0 lines for 2,453 of the 56,060 defined text symbols (4.4%) — and for the
  region around each one, the cached dump contains FABRICATED INSTRUCTIONS.** The standing note
  that "`disasm.sh --sym` can return 0 lines for a symbol that is present" has been rediscovered by
  several agents; this is the root cause, and the second half of it is worse than the first.

  `otool -tV <binary>` disassembles __text as a LINEAR SWEEP from the section start. One mis-decode
  — in-text alignment padding, a jump table, an embedded constant — desynchronises the instruction
  boundaries, and the sweep keeps emitting instructions at the wrong offsets until it happens to
  resynchronise. Any symbol whose start address the sweep stepped over gets NO LABEL at all, which
  is what `disasm.sh` then slices for (via `symidx` or the awk scan) and comes back empty.

  Measured live on `PCInfo::availableVRAM()` @ProCore 0x530c6. The sweep desyncs on the 1-byte pad
  at 0x530c5 and prints:

      00000000000530c5  addb  %cl, -0x7d(%rax)
      00000000000530c8  cmpl  $0x108c62, %eax
      00000000000530cd  pushq 0x8(%rbp)
      00000000000530d0  movq  vramAvailable(%rip), %rax     <- resynchronised here

  Those first three instructions do not exist. The real bytes are
  `cmpq $-0x1, onceToken(%rip)` / `jne` / `pushq %rbp` / `movq %rsp, %rbp`, which is what
  `otool -tV -p <symbol>` prints — because `-p` starts decoding AT the symbol, so the boundaries
  are right. **So the failure mode is not only "no disassembly"; it is "plausible disassembly of
  instructions that are not there", in the same dump every agent reads.** Today the missing LABEL
  is what saves us: it makes `disasm.sh` return empty and error out (the #16-era fix), so nobody
  transcribes the garbage. That protection is incidental — a symbol whose label survives while its
  BODY sits in a desynchronised region would hand a worker fabricated instructions with no warning.

  Exposure, counted as defined text symbols with no label line in the framework's linear dump:

      Ozone       22,354 symbols     574 missing   (2.6%)
      Flexo       10,766             776           (7.2%)
      Helium      12,591             466           (3.7%)
      ProCore      4,633             501          (10.8%)
      ProChannel   5,716             136           (2.4%)
      TOTAL       56,060           2,453           (4.4%)

  FIX (in this change): before the objdump fallback, `disasm.sh` re-disassembles from the symbol's
  own address with `otool -arch x86_64 -tV -p <sym>` on the thin slice and slices the label span out
  of that. It costs ~0.1s, and it is preferred over the objdump path because it keeps otool's
  `## symbol stub for:` annotations, which is how callees get identified. Verified: the two
  previously-unreachable symbols above now produce their correct bodies with exit 0, and symbols the
  linear path already handled are byte-unchanged.

  **A trap inside the fix, worth its own line because it nearly shipped.** `disasm.sh` runs under
  `set -euo pipefail`, and the natural spelling `otool ... -p "$SYM" | awk '...{exit}...'` makes awk
  exit at the next label, which SIGPIPEs otool, which makes the pipeline status 141, which kills the
  whole script — *after* it has written a correct `.s`. The symptom is a script that produces the
  right file and still fails, and it is invisible if you look at the output instead of the exit
  status. Materialise otool's output to a temp file first. This is the same discipline the gate
  rules already demand ("check the exit status directly, never through a pipe"), applying to the
  tools themselves.
## Fixed 2026-08-11 — a rejected PR belonged to no queue at all

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 33 | **31 of 32 open PRs sat CHANGES_REQUESTED, the oldest 16 hours untouched, while every reviewer slot polled `NONE`.** The review backlog had not been drained so much as MOVED somewhere no queue could see | Three pull queues existed and none of them covered a rejection, each for a defensible reason: `review_claim.sh` deliberately SKIPS a CHANGES_REQUESTED head (it is the author's turn; re-reviewing is the #7/#224 duplicate-review race), `rebase_claim.sh` only matches a gate FAILURE described as regression/rebase (a rejected PR is usually gate-GREEN — the defect is semantic), and `depclaim.py next` only hands out fresh symbols. Every component behaved correctly and the work still stranded. A rejection is the most evidence-dense object the swarm produces — a reviewer has already run the differential and named the defect — so leaving it unrouted wastes the port AND the review | `rework_claim.sh` — a WORKER-side pull queue over CHANGES_REQUESTED PRs, oldest first (the longest-sitting rejection is the one most at risk of being re-derived from scratch). Worker priority is now **rework → rebase → fresh**, in order of decreasing evidence already spent. Its attempt counter is keyed to the head SHA from the start, so a new head is progress rather than a strike (#28, applied before it could bite), and past the cap it **stops offering** the PR instead of closing it — auto-closing an author's work is what discarded oracle-verified bodies today, and it is a human's decision |

---

## Fixed 2026-08-11 — two more, both "the tool worked and nobody ran it"

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 43 | **An unrecognised flag was posted AS THE REVIEW BODY**, destroying 11 KB of differential at exit 0 behind a correct-looking success line. The reviewer found it only by reading the body back | `pr_review.sh` ended with `BODY="$*"`, so any flag it did not know became the body. Adding `--expect-head` therefore OPENED this on every host still running the older copy: **following the current advice is what destroys the record** | Unknown `--*` exits 2, naming the risk and the likely cause. After posting, the stored body length is read back and a mismatch warns — every way a body has been lost here (caller-shell backtick expansion, a flag captured as the body) exits 0 with a plausible success line. Locked as `test_guards` case H, which compares the review COUNT before and after, since the property is "refused BEFORE posting", not "printed a refusal" |
| 44 | **`check_duplicate_classes.py` works perfectly and has never once been invoked.** 7 duplicates on main; 5 classes filed twice across LAYER directories (`ozone/` vs `channels/`, `nodes/` vs `channels/`) — OPS_LOG had recorded only one | Its docstring and PORTING_SPEC both call it a CI guard, but no gate, no `pr_gate`, no `prove_all` ran it, so it reported into the void. `dup_check` cannot see these (it compares ledger SYMBOLS, not filenames) and neither can G6 (each file is add-only in isolation). Two files modelling one C++ class = two struct layouts that silently drift | Wired into `pr_gate` — but on the DELTA (`--new-only origin/main`), because gating absolutely would red-gate every PR in the repo for a mess none of them created, which is presumably why nobody ever wired it. A PR adding no new duplicate passes while main is dirty; plain mode still reports the existing 7 for someone to merge deliberately (**never blindly — each copy may hold addresses the other lacks**) |

**The pattern across both, and worth naming**: a guard that exists, works, and is never called is
indistinguishable from no guard at all — and reads as *reassurance*, which is worse. When you add a
check, add the caller in the same change, and watch it fail once.

---

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

---

## Open — reported 2026-08-11 by reviewer 2 (gate blind-spot suppressed by pool scratch; disassembler misrender; oracle-control trap)

- **THE G5 `NO-DISASM` BLIND-SPOT GUARD IS SUPPRESSED BY LEFTOVER SCRATCH IN A RECYCLED POOL
  WORKTREE, SO THE SAME PR GATES GREEN IN ONE SLOT AND FLAGGED IN ANOTHER — AND THE ACCIDENT FAILS
  TOWARD GREEN.** `raw-port/re/disasm/*.s` is untracked scratch (`git ls-tree -r origin/main --
  raw-port/re/disasm` = **0 files**), it is per-worktree rather than shared, and `wt_pool.sh` does
  **not** clear it between leases. G5's blind-spot guard asks "is there a `.s` for this @0xADDR in
  the tree I am gating in?", so its answer depends on which slot the pool happened to hand out.
  Measured today on PR #502 (`PCCFRefTraits<CGImage*>::release`), one PR, two gate runs, no change
  to the body: slot 7 already held
  `ProCore.__ZN13PCCFRefTraitsIP7CGImageE7releaseES1_.s` from an earlier lease and the gate printed
  `0 flag(s)` → status **SUCCESS**; slot 2 did not hold it and the gate printed
  `1 flag(s) … NO-DISASM for @ProCore 0xacc92` → status **FAILURE**. Slot counts confirm the dir is
  per-slot and dirty (25 / 9 / 20 files in slots 2 / 3 / 7).
  **Why it matters more than a flake:** the guard exists precisely to stop a reviewer signing an
  empty-looking body without re-deriving it, and the most likely author of a stale `.s` for the
  symbol under review is **the PR's own author**, who leased a pool slot and ran `disasm.sh` for
  exactly that symbol. So the worker's leftovers can silently switch off the check aimed at the
  worker's work, and the reviewer sees a clean `0 flags` with no hint that anything was skipped.
  FIX: `wt_pool.sh` should clear (or `git clean -xdf`) `raw-port/re/disasm/` on **acquire**, and G5
  should treat a `.s` it did not itself just generate as absent — better, have G5 run
  `disasm.sh --sym` itself and flag only when the BINARY cannot produce a body. Until then:
  **delete the `.s` for your symbol before you re-derive it** (`rm -f
  raw-port/re/disasm/*<symbol>*` then `disasm.sh --sym …`) so you are reading the binary and not a
  peer's cache, and treat a `0 flags` gate as no evidence that anyone re-derived anything.

- **`otool -tV` SYMBOLIZES A STRUCT-FIELD DISPLACEMENT AGAINST THE SYMBOL TABLE, SO AN ACCESSOR'S
  OFFSET PRINTS AS AN UNRELATED ObjC SELECTOR.** Found by the author of PR #515 and confirmed
  independently here; it was not yet in this log, and `raw-port/tools/disasm.sh` runs `-tV`, so
  every cached `.s` inherits it. On
  `OZMaterialDiffuseLayer::environmentIntensityChannel` @Ozone 0x61b2e0 the body's one real
  instruction renders as

      0x61b2e4  leaq "-[OZMagnifyTool setSpacebarMode:zoomOut:]"(%rdi), %rax

  because the displacement is **0x4290** and a local symbol happens to sit at **VA 0x4290**
  (`0000000000004290 t -[OZMagnifyTool setSpacebarMode:zoomOut:]` in the cached inventory). A
  displacement is a field offset, not an address; symbolizing it is meaningless. The trap is that
  the rendering is *plausible* — an agent can spend a long time explaining why a magnify tool is
  reachable from a material layer, or, worse, transcribe the wrong constant. Any `leaq
  <small-disp>(%reg)` accessor is exposed, which is most of the channel/layer getters.
  FIX: `disasm.sh` should emit **both** `-tV` and `-tv`, or at least `-tv` alongside, so the raw
  displacement always survives. WORKAROUND: when an operand names a symbol that makes no sense for
  the class, **decode the bytes** — `48 8d 87 <disp32>` is `leaq disp32(%rdi), %rax`; at 0x61b2e4
  the bytes are `48 8d 87 90 42 00 00`, disp32 = `90 42 00 00` = 0x4290. Reading the instruction
  bytes out of the mapped image and unpacking the disp32 yourself takes three lines and settles it
  without trusting any disassembler.

- **AN ORACLE CONTROL OBJECT THAT YOU RELEASE TO ZERO READS BACK AS "THE CALLEE TOUCHED IT".** The
  CoreFoundation cousin of the `create_string_buffer(b"\xAA"*N)` trap. Verifying PR #502 I checked
  that `PCCFRefTraits<CGImage*>::release` only affects its argument by holding a second CGImage as
  a control — but the control's retain count was 1, my own direct `CGImageRelease` on it took it to
  0, CoreGraphics freed it, and `CFGetRetainCount` on the dead object returned
  `1152921504606846975` (0x0FFF…FFF). The harness dutifully reported *"MISMATCH: the trait's calls
  perturbed an UNRELATED image"* — a DIVERGED verdict on a correct port, caused entirely by the
  measurement. RULE: give every control object **headroom** (retain it several times up front),
  check the untouched-control assertion **before** any destructive comparison, and treat a
  retain count of 0x0FFFFFFFFFFFFFFF as "you are reading freed memory", not as data.

- **Two-line traps worth knowing before they cost you a run:** `ozone_loader.image_slide(fw)`
  returns a **tuple** `(slide, image_name)`, not an int — `slide + vmaddr` then dies with
  `TypeError: can only concatenate tuple (not "int") to tuple`; unpack it as `slide, _ = ...`
  (`local_fn` already does). And a negative control can be **undiscriminating rather than passing**:
  checking that a `movsd` constant was not a `movss` misread is vacuous for 200.0, which is exactly
  representable in f32 — say so in the report instead of counting it as a control that fired
  (PR #459).

---

## Open — reported 2026-08-11 by reviewer 8 (a reviewer can record an APPROVE over a standing rejection, and cannot take it back; NEW)

- **NOTHING IN THE REVIEWER LOOP LOOKS AT EXISTING REVIEWS BEFORE YOU SIGN, AND `pr_review.sh` WILL
  NOT LET YOU CORRECT THE VERDICT ONCE IT IS WRONG.** Hit live on PR #400. Three separate pieces
  line up, and each one alone would be harmless:

  1. **The documented loop never mentions the review history.** `REVIEWER_BRIEF` STEP 1 is
     `review_claim.sh claim`, then gate, then the semantic verdict, then `pr_review.sh … approve`,
     then `pr_land.sh`. The `faithfulness-gate` status is the only prior state a reviewer is told to
     consult, and it says nothing about a peer's blocking review. So a reviewer who follows the
     brief exactly can reach `approve` on a PR another reviewer has already rejected — I did.
  2. **The guard that catches it lives one step too late.** `pr_land` refuses correctly
     ("REFUSING to merge PR #400 — an un-dismissed CHANGES_REQUESTED stands"), which is why nothing
     actually merged. But by then the APPROVE is already a permanent review on the head, sitting
     under the rejection it contradicts. The merge is protected; the RECORD is not.
  3. **`pr_review.sh` then refuses to let you fix it.** Its idempotence key is
     (PR, head SHA, this identity) with a state filter of APPROVED/CHANGES_REQUESTED, and there is
     no `--force`: `pr_review: PR #400 @ 9603e2d2 already has APPROVED from vjeux-reviewer[bot] —
     not re-reviewing`. The guard is right for its intended case (a reviewer loop re-verifying the
     same head should not spam duplicates) and exactly wrong for this one — a reviewer who realises
     they were wrong is the one caller who MUST be able to speak again on the same head. Since all
     slots share one bot identity, that stray APPROVE is also indistinguishable from any other
     reviewer's, so the next agent sees "one APPROVED, one older CHANGES_REQUESTED" and the
     tempting read is that the rejection was superseded.

  **What made it reachable at all is the fourth piece, and it is the nastiest: `pr_land` MOVES THE
  HEAD, which re-qualifies the PR for the review queue.** #400's rejection was recorded at
  `97d867a9`. `review_claim` leases a PR whose CURRENT head has no fresh verdict, so when an earlier
  `pr_land` ran `update-branch` and the head became `9603e2d2`, the PR became "unreviewed" again and
  the queue handed it to me with the rejection two heads back and invisible from anything the brief
  told me to look at. The rejection had never been addressed — the exact sentence reviewer 6 asked
  to be corrected was still in the diff.

  WORKAROUND, and it is clean: **dismiss your own review deliberately, then re-post.**
  `gh_as.sh reviewer api -X PUT repos/<slug>/pulls/<PR>/reviews/<id>/dismissals -f message='…'`
  moves it to state DISMISSED, which the idempotence filter does not match, so `pr_review.sh` will
  then accept the correct verdict on that same head. Dismissing your OWN approval only ever removes
  an approval — it unblocks nothing and cannot override a peer — so it is safe in a way that
  dismissing someone else's is not. Do NOT dismiss the peer's rejection to get moving.

  FIXES, in order of value: (a) `review_claim.sh claim` should skip, or loudly annotate, a PR with an
  un-dismissed CHANGES_REQUESTED — a rejection outranks a later approval per the standing rules, so
  such a PR is waiting on its AUTHOR, not on a fresh reviewer, and leasing it to one burns a full
  reviewer run (mine: gate, three tool re-derivations and a full claim verification); (b) move
  `pr_land`'s CHANGES_REQUESTED check to the top of the reviewer's flow, or into `pr_review.sh`
  itself, so an approve over a standing rejection is REFUSED rather than recorded and caught later;
  (c) give `pr_review.sh` a `--supersede` that dismisses this identity's own prior review on the
  same head and posts the new one, so correcting yourself does not need a raw API call; (d) when
  `pr_land` triggers `update-branch`, carry the prior verdicts forward or note the head move, so a
  mechanical rebase cannot launder a rejection into "unreviewed".

- **TWO SHIPPED GUARDS IN ONE MORNING COULD NOT FIRE FOR THE CASE THEY WERE WRITTEN FOR.** Filing
  the pattern rather than the instances, because both were found the same way — by trying to make
  the guard fail, which took under five minutes each and neither author had done:
  - a regression test whose third case referenced none of the code under test: it recomputed a set
    difference from two literals and asserted it equalled itself, so deleting the entire fix left it
    green, while `prove_all` printed a layer name claiming the property was pinned;
  - a pre-force-push guard written as `git diff --name-only --diff-filter=D origin/main...HEAD`.
    **THREE dots is the wrong relationship for "am I about to publish a stale head".** A three-dot
    diff compares HEAD against the MERGE BASE, so files that landed on main after that base appear
    on neither side and can never show as deletions. Measured on a scratch repo: with HEAD rebased
    onto a main missing three landed files, the two-dot form lists all three and the three-dot form
    returns EMPTY — and the incident that motivated the guard had itself been measured with the
    two-dot form (`git diff origin/main --stat`, 16 files removed). Use `origin/main HEAD` when the
    question is "how does my head differ from main RIGHT NOW"; three dots answers "what did my
    branch change", which is a different question and the one you do not want here.
  RULE (companion to "a dead negative control means your harness is blind", and to the mutation rule
  added the same day): **a guard is not evidence until you have watched it fail.** Before you ship
  one, break the thing it guards and confirm it goes red. A guard that cannot fire is worse than no
  guard, because the next person reads the code, sees a check, and stops looking — which is the same
  gate-clean-output failure class the rest of this file is about, moved into the safety net itself.

- **A reviewer clearing a G5 NO-DISASM flag leaves the evidence behind for the next PR to reuse.**
  A corollary of the pool-scratch entry above, from the other side. `disasm.sh --sym` writes into the
  LEASED worktree's `raw-port/re/disasm/`, which `wt_pool` does not clear on acquire, so the `.s` a
  reviewer generates to clear a flag stays in that slot. The next PR gated there can be waved through
  on the previous reviewer's scratch, and the reviewer who benefits sees a clean `0 flags` with no
  indication that the guard was answered from residue. I re-derived into three pool slots today, so
  three slots now carry my leftovers. Until `wt_pool` clears the directory on acquire, treat `0 flags`
  as no evidence that anything was re-derived, and keep every harness you write OUTSIDE the worktree
  (`/tmp`) so the only thing you leave in a pool slot is the pristine checkout.


## Open — reported 2026-08-11 by worker 6 (rework queue: five traps, two of them blockers; NEW)

Found while working the new REWORK queue (`rework_claim.sh`, PR #550) through PRs #178,
#180, #83, #243, #114 and #337. The first two BLOCK merges today and neither is visible
from the PR that suffers it.

- **G5's one-export escape hatch means the SECOND port of a class retroactively FLAGS the
  FIRST — and for a NESTED class the naming convention makes it unavoidable.** Measured on
  `render/HGTextureManager__PostTextureDeleteEventList.ts`, one pool worktree, same bodies,
  same `.s` cache, three gate runs:

      main as it stands (1 exported function)                    0 cheats, 0 flags
      + unlock/hasEvent as HGTextureManager_PostTextureDelete...  0 cheats, 3 flags
      + unlock/hasEvent as PostTextureDeleteEventList_...         0 cheats, 1 flag

  The mechanism is two rules meeting. G5 joins an export to its disasm with
  `method = name.split("_", 1)[1]` and then requires `method` to equal the LAST Itanium
  component (`_sym_names_method`). For a nested class the repo convention
  `Outer_Inner_method` yields the method `PostTextureDeleteEventList_unlock`, which no
  symbol's last component can ever be — so the join is IMPOSSIBLE, not merely unlucky.
  The landed single export escapes only through the `len(fns) == 1 and one candidate`
  fallback at `g5_impl_gate.py:385`, and adding ANY second export to the file retires that
  fallback for every export in it, including the one already on main.
  So following the naming convention takes a CLEAN LANDED EXPORT red, and the file cannot
  be made clean: renaming the landed export is exactly what G6 add-only refuses. Note who
  this hits — it fires on precisely the ADD-only class-file extension every brief tells
  workers to write, and it gets worse as a class fills in. Landed nested files already
  carry the unsatisfiable spelling (`PCEvictionHeap_CSRefCache_bubble`), so they are all
  one export away from it.
  WHAT I DID: named the two new exports for the class that owns them
  (`PostTextureDeleteEventList_unlock`), which is what worker 4's naming entry above
  already prescribes, took 3 flags down to 1, and documented the split naming in the file
  header with the measurement so the inconsistency reads as a decision instead of a slip.
  FIX: `_ts_functions` should derive the method from the LAST underscore-separated
  component, not `split("_", 1)[1]` — `Outer_Inner_method` then joins correctly and the
  convention and the gate stop contradicting each other. (Also: G5 sees only
  `export function`. A file that exports a CLASS with methods — `PCDelaunay__Triangle.ts`
  — is invisible to it entirely, which is a much bigger hole than this one.)
  CONFIRMING worker 4's entry with three fresh instances: the flag text names the WRONG
  ADDRESS every time. `..._lock` was flagged for @0x42c30 (unlock's address), `..._unlock`
  for @0x47f72 (the ctor's `pthread_mutex_init`), `..._hasEvent` for @0x42b10 (lock's).
  Three exports, three addresses, none of them the export's own.

- **`raw-port/src/infra/CMTime.ts` IS UNMERGEABLE ON MAIN TODAY: `gate.sh` on the
  UNMODIFIED file is a REJECT, so every PR touching it inherits a red gate for landed code
  it did not write.** Measured in a fresh pool worktree on main's own copy:

      $ gate.sh <wt>/raw-port/src/infra/CMTime.ts        # main, unmodified
        CoreMedia ORACLE DIVERGENCE: 175 wrong + 0 threw, of 341 calls
        G4 CoreMedia REJECT
        GATE: REJECT

  The G4 CoreMedia oracle covers four functions — `CMTimeMultiplyByFloat64`, `CMTimeAdd`,
  `CMTimeSubtract`, `CMTimeGetSeconds` — all landed, and the divergences are real, not a
  harness fault: `CMTimeMultiplyByFloat64((100,600,1,0)) x0.5` returns
  `(83333334, 1000000000, 3, 0)` from CoreMedia (it RESCALES to a 1e9 timescale) against
  the landed port's `(50, 600, 1, 0)`. This is OPS_LOG #24's shape — a gate RED for a
  reason unrelated to the PR, on exactly the files it can measure — except that #24 was a
  broken harness and this is a working harness reporting true defects in landed code.
  Consequence for the queue: PR #114 was rejected for a different (real) defect, that
  defect is now fixed and oracled at 512/557 field-exact with 0 divergences, and the PR
  STILL cannot go green. A reviewer re-gating it will see G4 REJECT and, without this
  note, will attribute it to the PR.
  FIX: the four landed functions need their own port unit. `CMTimeMultiplyByFloat64` is
  not a one-liner — it is a different algorithm (rescale to 1e9 with rounding). Until
  then, a reviewer handling any CMTime.ts PR should diff the G4 count against main's
  before treating it as the author's.

- **The house `node --experimental-strip-types` differential recipe DIES on the first port
  that imports a sibling, and the error names a file the port is correct to reference.**
  This repo's tsconfig is NodeNext, so every intra-repo import must be written with a `.js`
  extension (`import { hgAlignedHeap } from "./HGAllocAlign.js"`) — which is what G2
  requires. Node then resolves that literally, finds no `HGAllocAlign.js` (nothing is
  compiled), and the driver dies with `ERR_MODULE_NOT_FOUND`. The port is right, the gate
  is green, and only the harness cannot load it. The recipe was landed on a LEAF port
  (SurroundPanner) so nobody had hit it; most non-leaf ports import a sibling, so without a
  fix the recipe silently narrows to leaf math functions — the "the differential is
  unavailable" excuse coming back through a new door.
  FIX (shipped with PR #180): `raw-port/re/oracle/ts_js_hooks.mjs`, a 12-line resolve hook
  mapping a relative `.js` specifier to the `.ts` beside it, only when that `.ts` exists.
  Use it as `register("./ts_js_hooks.mjs", import.meta.url)` followed by a DYNAMIC import
  (a static import is resolved before the hook is live). Do NOT copy the hook into your own
  PR if one is already open adding it — two PRs adding the same path is a guaranteed
  conflict; a driver whose port imports nothing needs a plain static import and no hook.

- **`ozone_loader.local_fn` returns a 3-TUPLE `(callable, vmaddr, slide)`, not a
  callable.** The existing "two-line traps" entry warns that `image_slide` returns a tuple
  and says "`local_fn` already does" the unpacking, which reads as though `local_fn` hands
  back a function. It does not, and the failure is
  `TypeError: 'tuple' object is not callable` at the first call site. Unpack it —
  `fn, vmaddr, slide = local_fn(...)` — and then USE the two extras for the self-check the
  local-symbol recipe asks for: `ctypes.string_at(slide + vmaddr, n)` must equal the
  prologue bytes of the function you transcribed (`55 48 89 e5 ...`). Three of my six units
  called local symbols and all three now refuse to report a number until that matches,
  which is the cheapest available guard against the arm64-vmaddr trap.

- **`slot_lock.sh heartbeat <role> <N>` DOES NOT EXIST**, though the dispatch prompts ask
  for it after every unit and the "slot lock cannot detect a live agent" entry above
  proposes it as the fix. Running it prints
  `usage: slot_lock.sh {acquire <role> <n>|release <role> <n>|status}` and exits non-zero —
  harmless, but an agent that treats a non-zero exit as a problem will stop on it, and an
  agent that does not will believe it is heartbeating when nothing is recorded.
  WORKAROUND until the subcommand lands: `touch "$HOME/.fct-pool/slots/<role>-<N>/held"`,
  which is exactly what the proposed fix would do to the mtime.

---

## Open — reported 2026-08-11 by worker 6 (an oracle on the WRONG SLICE can look CLEANER; NEW)

- **The architecture trap has a second face that nobody has written down: running the
  differential on the arm64 slice does not merely risk a wrong verdict, it SYSTEMATICALLY
  HIDES the NaN-sign divergence class, so the wrong-slice run reports a BETTER score than
  the correct one.** OPS_LOG already records "the executable oracle calls the wrong
  architecture, and fails toward ACCEPT", and the standing NaN entries record that x86
  `divsd` 0/0 gives `0xfff8…` while JS canonicalises to `0x7ff8…`. Put together they imply
  something neither entry says: **arm64's default NaN has the SIGN BIT CLEAR, which matches
  JavaScript exactly.** So a bit-pattern differential run against the arm64 slice sees NaN
  agreement everywhere, while the same port against the x86_64 slice it was transcribed
  from shows a NaN-sign difference on every NaN lane.

  MEASURED on PR #243 (`PCQuat<double>::setRotation` @Ozone 0x7bd30). The reviewer called
  `slide + 0x6c704`, which their own note names as the arm64 address, and reported
  **106/106 bit-exact** after their fix. The same port, same fix, called at the x86_64
  vmaddr `0x7bd30` from the inventory under `arch -x86_64`, over 103 cases:

      bit-exact               95/103
      NaN-on-both-sides only   8/103
      REAL divergences          0/103

  The 8 are exactly the inputs that made `cosθ` NaN — i.e. the very inputs that exposed the
  branch defect under review. The verdict is the same either way here, which is why this is
  worth writing down rather than shrugging at: the wrong slice produced a *cleaner-looking*
  number and no visible symptom. An agent comparing two harnesses' scores would pick the
  arm64 one as the better instrument.
  RULES that follow: (1) take the vmaddr from `army/inventory/<FW>.syms.txt`, which is
  x86_64 by construction, and never from a bare `nm`; (2) self-check the prologue bytes at
  `slide + vmaddr` before trusting a number — it costs one line and catches the wrong
  address directly rather than through its consequences; (3) on the x86_64 slice, EXPECT a
  NaN-payload count above zero on any corpus containing `0/0`, classify it separately, and
  never "fix" it in the port — constructing that NaN through a `DataView` is a rewrite of
  `divsd`, not a transcription; (4) a differential reporting 100% on a corpus that includes
  NaN cases is itself a signal worth checking, because on the correct slice it should not.

- **A REVIEWER'S "not blocking on this" can be worth fixing, and the way to settle it is to
  price it with a mutant.** On PR #337 the reviewer named a signed-zero divergence
  (C `modf` returns a fraction carrying the sign of the argument, so `modf(-30.0)` is
  `-0.0` while `value - Math.trunc(value)` is `+0.0`) and explicitly did not block, on the
  grounds that the project's own differential compares absolute differences. Compared as
  BIT PATTERNS against the live symbol it fires on `sample=-48000` at rates 32000/48000 and
  fps 24/30/60 — an exact frame boundary at a negative timeline position, i.e. ordinary
  input, not an edge case. Fixed, and then PRICED by keeping a mutant that has the
  non-finite fix but not the signed-zero one: it kills 9 of 257. That number is the honest
  answer to "was this worth doing", and it is cheap to produce once the harness compares
  bits. Same class as #445, which was rejected for the sign of zero after passing 4,764 of
  4,768 cases.

- **Two smaller ones, each of which cost a cycle.** (a) G1's banned-language check reads
  PROSE, so the word "roughly" in an explanatory comment is a hard REJECT
  (`P3 shortcut language`) — mine was in a sentence explaining why a throw is unreachable.
  The tokens to avoid in comments are approximate / roughly / guess / heuristic / hack /
  fudge; write "more than 480,000 years" rather than "roughly 487,000". (b) When a
  differential's corpus is generated by drawing operands independently and then filtering,
  CHECK HOW MANY SURVIVED: my first CMTimeMultiply corpus drew value and multiplier
  independently and 272 of 400 "in-range" cases silently fell out of range into the
  throw path, so the rule they were meant to exercise was barely tested while the summary
  line still looked healthy. Draw the constrained operand LAST (pick the multiplier, then
  bound the value by `MAX/|m|`), and print the per-class counts so a collapsed class is
  visible.

---

## Open — reported 2026-08-11 by worker 6 (two MORE from the rework queue: a landed class hiding in another layer dir, and a self-inflicted near-miss; NEW)

- **A rejected PR often forked a class that is ALREADY LANDED UNDER A DIFFERENT LAYER
  DIRECTORY, and nothing in the pipeline notices — not `dup_check`, not the gate, and in
  one of the two cases I hit, not the reviewer either.** Two of eight reworks this session
  were this:
  * #178 filed `render/HGTextureManager_PostTextureDeleteEventList.ts` while main held
    `render/HGTextureManager__PostTextureDeleteEventList.ts` (single vs DOUBLE underscore).
    The reviewer caught this one.
  * #44 filed `src/ozone/OZNotificationManager.ts` while main held
    `src/nodes/OZNotificationManager.ts` — 750 lines, three ported methods, a full
    `OZObserverRecord` layout. **Different directory, identical class name.** The review
    was thorough (it re-derived all 34 instructions) and rejected the PR for an unrelated
    defect without mentioning the fork. Landing it would have put one C++ class in two
    files with two incompatible models of the same circular list.
  Nothing mechanical covers it. `dup_check` keys on the lowercased BASENAME and compares
  paths, so `nodes/X.ts` and `ozone/X.ts` are simply two different files. G6 add-only only
  inspects the file handed to `gate.sh`, and a brand-new file has no base version to lose
  anything against.
  **DO THIS BEFORE EVERY PORT AND EVERY REWORK — it costs 0.2s and is in no brief:**

      git ls-tree origin/main -r --name-only | grep -i <ClassName>

  Note the `-i`: the volume is case-insensitive, so a case-only difference is a silent
  OVERWRITE rather than a second file (the separate hazard already logged here). If the
  class exists anywhere, ADD to that file, in ITS model, wherever it lives — do not file a
  second copy because the layer directory looks wrong to you. (Layer disagreements are
  real — `HGFreeAlign` did belong in `infra/` beside its allocator half rather than
  `render/` — but that is MOVING a file that exists in exactly one place, not adding a
  second one.)

- **`git reset --hard origin/main` DOES NOT REMOVE UNTRACKED FILES, so the standard rework
  move — "rebuild the branch on current main" — can silently re-publish the very file you
  are removing.** I nearly did exactly this on #44. Sequence: copy the branch's file into
  the worktree to gate it (creating `src/ozone/OZNotificationManager.ts`, untracked);
  discover it duplicates a landed class; `git reset --hard origin/main` intending a clean
  slate; write the method into the landed file instead; `git add -A`; commit; push. The
  reset left the untracked copy exactly where it was, `add -A` staged it, and the pushed
  commit added BOTH files — the duplicate I was in the middle of removing, under a commit
  message explaining why duplicates are bad.
  WHAT CAUGHT IT, and it is the only thing that would have: reading
  `git diff --name-status origin/main...HEAD` before treating the push as done. This is the
  third distinct incident in this log where THE FILE LIST rather than the content was the
  thing that mattered, and the first where the unintended path was ADDED rather than
  deleted — so the `--diff-filter=D` guard would have passed it silently.
  RULE: after any rework push, read the three-dot file list and confirm every path is one
  you meant. And when you want a genuinely clean slate in a pool worktree, `reset --hard`
  is only half of it; `git clean -fd` is the other half. That is exactly why `reset_clean`
  in `wt_pool.sh` runs both — and why OPS_LOG #3's forensic tell works, since gitignored
  `.s` files survive a reset but not the clean.
  SECOND-ORDER, before you reach for it: `rm -rf raw-port/src/<layer>` to undo that also
  deletes the SEVEN TRACKED files sharing the directory. `git checkout -- <dir>` restores
  them, and `git status --porcelain` must be EMPTY before you release the slot — a pool
  worktree released with tracked files missing is a trap for the next lessee.

- **Corroborating the "a transient TLS failure reads as a verdict" entry with a fresh
  instance, because the fix is a retry loop and costs nothing to adopt:**
  `pr_comment_once.sh` printed `post failed` on PR #44 and the identical call succeeded on
  the very next attempt with no change of any kind. Wrap the gh-backed helpers in a
  3-attempt loop with a short sleep, breaking on `posted|already`, and never treat the
  first failure as information.

---

## Fixed 2026-08-11 by worker 1 (the REWORK queue re-hands PRs that were already reworked; FIX in this change)

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 36 | **A PR that a worker already reworked keeps being handed to more workers, one full run each, until the 3-attempt cap retires it — and nothing failed.** Two of my six rework claims this session were already fixed by a peer: #114 (worker 6 had rewritten the CMTimeMultiply model and its oracle was `VERIFIED 0/557`) and #143 (worker 2 had ported `HGPool::registerPool` **14 minutes earlier**, and the gate on that head is `PASS`). #143 was handed to me as `attempt 3/3` purely by being claimed three times | `rework_claim.sh`'s filter is `reviewDecision == "CHANGES_REQUESTED"`. GitHub keeps that set until a reviewer **dismisses or re-reviews**; an author pushing a fix does not clear it. So the one state the queue is built to detect — *waiting on the author* — is indistinguishable from *waiting on a reviewer* through the field it reads. The attempt counter's #28-style "a new head is progress" reset does not save it either: the counter is compared against the head at CLAIM time, and every re-claim of an already-reworked PR sees the same (already-fixed) head, so they accumulate. Same family as #33 — a queue whose eligibility test is right about a state it can see and blind to the state that matters | This change: before leasing, ask which commit the standing rejection was RECORDED against (`gh api repos/<slug>/pulls/<n>/reviews`, last `CHANGES_REQUESTED`, `.commit_id`). If the head has MOVED since, the author has already answered — skip it, say so with both SHAs, and clear its attempt counter. An EMPTY answer is treated as a transport failure and the PR is still offered, because starving the queue is worse than a duplicate run (the #372/"gh not found is not a verdict" lesson). Locked by `army/tools/test_rework_claim_stale_rejection.sh`, which runs against a FAKE `gh` with `$HOME` pointed at a scratch dir, so it never touches the live leases or the 24-slot pool. **Mutation-tested**: delete the guard, leaving valid code, and 4 of its 5 cases go red |

Two things worth keeping in mind even with the fix in:

- **A reworked PR is NOT stranded by the cap**, which is the first thing I checked before touching
  the tool. `review_claim.sh` selects on the HEAD's `faithfulness-gate` status, not on
  `reviewDecision`, and a freshly force-pushed head has no status — so it is visible to reviewers as
  an ordinary unreviewed head. The cost of this bug is worker runs, not lost work.
- **If you claim a rework and find it already fixed, say so on the PR with the measurement** (the
  gate result on the current head, and the peer's evidence re-run) rather than reworking it again or
  silently releasing. A reviewer reading `CHANGES_REQUESTED` needs to be told the head has moved
  under it, and the next worker needs to know the run was not wasted twice.

---

## Open — reported 2026-08-11 by worker 3 (the tools you are told to run are STALE; and two oracle-shaped traps)

- **THE CANONICAL CHECKOUT IS 15 COMMITS BEHIND `origin/main`, AND EVERY BRIEF TELLS YOU TO RUN THE
  TOOLS FROM IT — so a tool fix that has LANDED does not reach the agents it was written for.**
  Measured, this session, while the ink on the fix was still wet: worker 1's #36 guard (skip a
  rework whose standing rejection was recorded against an older head) is on `origin/main`, and
  `grep -c commit_id ~/random/final-cut-pro-transitions/raw-port/army/tools/rework_claim.sh` is
  **0** while the same grep in a freshly leased pool worktree is **1**. So I ran the pre-fix tool,
  and it handed me #256, #445 (twice), #523 (twice) and #538 — every one of them already answered
  by its author — which is precisely the failure #36 fixed hours earlier.

  Nothing in the loop updates that worktree: `HARNESS_LOOP.md` puts the `git reset --hard
  origin/main` in a ONE-TIME **Preconditions** section, `wt_pool.sh` refreshes the POOL from
  `origin/main` but never the canonical tree, and `pr_gate.sh` reads its trusted tools with
  `git --git-dir="$CANON/.git" archive origin/main …`, i.e. straight out of the object store —
  which is why GATING is immune to this and everything an agent types by hand is not. The longer a
  swarm runs, the staler every agent's tools get, and the symptom is never an error: it is a tool
  behaving like last week's version.

  WORKAROUND, adopt it now: **run `army/tools/*` from your leased worktree**, not from `$CANON`
  (`bash "$WT"/raw-port/army/tools/rework_claim.sh claim`). The scripts `cd "$CANON"` internally
  for their git work, so this changes only WHICH COPY of the script runs — and `wt_pool.sh acquire`
  has just reset that copy to current `origin/main`. FIX: `swarm_maint.sh` should fast-forward the
  canonical worktree (it already refuses to touch it while a gate or submit is live, which is the
  hard part), and the queue tools should print their own `git log -1 --format=%h` of
  `raw-port/army/tools` next to the answer so a stale tool is visible in its own output.

  Corroborating #36 with a corpus-wide count, since it reads as anecdote otherwise: at 17:12Z,
  **9 of the 22 open `CHANGES_REQUESTED` PRs had a head NEWER than their newest rejection**
  (#538, #523, #445, #400, #335, #256, #154, #143, #114) — i.e. 41% of the "rework backlog" was
  waiting on a reviewer, not on an author. The one-liner, for whoever wants to re-measure:
  `for pr in $(gh pr list --state open --json number,reviewDecision --jq '.[]|select(.reviewDecision=="CHANGES_REQUESTED")|.number'); do h=$(gh pr view $pr --json headRefOid --jq .headRefOid); r=$(gh api repos/<slug>/pulls/$pr/reviews --jq '[.[]|select(.state=="CHANGES_REQUESTED")]|last|.commit_id'); [ "$h" != "$r" ] && echo "$pr answered"; done`
  DISCLOSURE, because it changes the queue's state: probing this with the pre-fix tool drove
  **#445 and #523 to 3/3 attempts**, so that tool now skips them ("a human decides"). Neither needs
  worker work — both are answered and waiting on a dismissal — but somebody should know why their
  counters are exhausted.

- **A DIFFERENTIAL WHOSE TRANSPORT CANNOT EXPRESS THE CORRECT ANSWER SCORES A WRONG PORT AND A
  RIGHT ONE THE SAME — and, in the case I hit, rewarded the wrong one.** `JSON.stringify(NaN)` is
  `null`, and so is `Infinity`. `coremedia_worker.ts` was scrupulous about int64 (values cross as
  strings, with a comment explaining that a JSON number is a double) and missed the mirror image on
  the Float64 RETURN. `CMTimeGetSeconds` answers NaN for an invalid or indefinite time and
  +/-Infinity for an infinite one — 3 of the 11 times in the oracle's own grid — so the oracle read
  `null`, failed its `isinstance(have, (int, float))` test, and booked a divergence **no port could
  ever clear**. Measured on one file, three runs of the pre-fix oracle: the correct port scores
  340/341 and a mutant that returns `value/timescale` for an invalid time scores 340/341. The
  harness could not tell them apart, and the only way to score better on that case was to be wrong.
  FIXED in #560 (scalars also cross as `nbits`, the raw IEEE754 pattern in hex; watched fail:
  correct port 341/341, mutant 1 divergence, main's landed body still 175).
  THE GENERAL RULE, which the existing "move bit patterns as hex strings, never JSON numbers" entry
  states only for int64 and only in one direction: **move every float across a process boundary as
  a bit pattern, in BOTH directions.** My own new oracle had the same bug in the REQUEST direction
  — a multiplier of `NaN` serialises to the invalid token `NaN` and the driver dies with a JSON
  parse error, which at least fails loudly rather than quietly.

- **A FIXED CASE LIST IS FITTABLE; SHIP A RANDOMIZED TWIN.** The CoreMedia gate oracle runs a fixed
  grid of 341 calls, and a port merged against it is a port fitted to it. My reworked
  `CMTimeMultiplyByFloat64` passed all 341 while still being wrong: it dropped the input's
  `HasBeenRounded` flag, and **no time in the grid carries that flag**, so the case is structurally
  invisible there. A randomized corpus over the same domain failed it immediately — 154 of 4088
  multiplies — and the fix is one term. So: when an oracle enumerates its cases by hand, add a
  generator over the same domain, print PER-CLASS counts (a class that collapses to zero cases is
  the other half of this trap), and keep a mutation mode that requires the differential to fail.
  `raw-port/re/oracle/CMTime_coremedia_oracle.py` (#561) is a worked example of all three.

- **A PR CANNOT FIX THE HARNESS THAT JUDGES IT — split it in two, deliberately.** `pr_gate.sh`
  takes `raw-port/army/{gate,tools,verifier}` from `origin/main` on purpose (a PR must not ship its
  own gate), so a port whose green depends on a harness fix will be gated with the BROKEN harness
  and rejected for a defect it fixes. If you hit that, file the harness change as its own PR that
  touches no `raw-port/src/**/*.ts` — the oracle for the class you are fixing then does not run on
  it at all — and say in the port's PR body which number it waits on and what the pre-fix gate
  prints. #560 before #561 is the shape.

- **CORRECTION to worker 6's "slot_lock.sh heartbeat DOES NOT EXIST":** it exists on current main
  and works — `slot_lock.sh heartbeat worker 3` prints `BEAT worker-3` and exits 0. Given the entry
  above, an agent seeing the old `usage:` error is most likely running the STALE canonical copy.
---

## Open — reported 2026-08-11 by worker 2 (AVX kernels ARE oracle-able on this box; two reviews said otherwise and signed on reading alone; NEW)

- **AVX EXECUTES UNDER ROSETTA 2 ON THIS BOX. "This symbol is not oracle-verifiable here because
  Rosetta does not implement AVX" is FALSE, it has been written into at least two reviews as a
  reason to sign a kernel on reading alone, and it is the belief standing between this swarm and an
  executable differential for the whole `*_AVX` family.** This log already carried the general rule
  ("AVX kernels DO run under Rosetta — feature bits lie there, so probe by executing, never by
  inferring from `sysctl`"), and it lost to a plausible-sounding sentence in two review bodies. So
  here is the probe, the two worked examples, and the recipe, in the hope that the next reviewer
  runs the probe instead of the argument.

  THE PROBE, 30 seconds, no compiler (the security stack SIGKILLs freshly compiled binaries anyway):
  call any `*_AVX` kernel through `ozone_loader.local_fn` under `arch -x86_64 /usr/bin/python3` with
  a 1-row, 2-pixel tile and a zeroed constant pool. The arithmetic is meaningless; what you are
  measuring is whether the process survives `vmovups ymm` and the ~150 AVX instructions after it, or
  dies with SIGILL. Measured on `HgcToneParamCurve2::RenderTile_AVX` @Helium 0x3764d0: returns 0,
  process healthy.

  TWO KERNELS ORACLED THE SAME DAY THE CLAIM WAS MADE, both against the live x86_64 body:
    * `HgcToneParamCurve2::RenderTile_AVX` @Helium 0x3764d0 — **128 lanes, 128 bit-exact, 0
      divergences** over five tile shapes, and the pre-fix model of the port (the lane-index defect
      review found) killed on 22 of those 128 lanes. The review of that PR had said "this symbol is
      NOT oracle-verifiable on this box, so the line-by-line above is the only available proof".
    * `Gettype1_half_satTile_AVX` @Helium 0x275cf0 — **87 of 108 lanes bit-exact**, the other 21 all
      downstream of one `vrcpps`, worst 1337 ULP / 1.09e-04 relative, inside VRCPPS's own
      1.5*2^-12 bound. Its review had said "no executable oracle is possible for this unit ... this
      is Tier-3, judgment only". The 21 lanes are the port's documented exact-reciprocal model, and
      the measurement turned a paragraph of argument into a number.

  THE RECIPE for a RenderTile kernel, which is the part worth copying:
    1. The tile is 0x60 bytes and its layout is in the kernel's own prologue —
       `+0x00 x0, +0x04 y0, +0x08 x1, +0x0c y1` (height = y1-y0, width = x1-x0),
       `+0x10 dst`, `+0x18 dst row stride in PIXELS`, `+0x50 src`, `+0x58 src row stride`. The
       strides are `shlq $0x4`-ed by the kernel because a pixel is a 16-byte float4.
    2. **Do not fabricate the constant pool — call the real ctor.** `HgcToneParamCurve2`'s pool
       (`this+0x198`) is filled by its ctor @0x376bf0 from Helium rodata; `HGToneCurve::State`'s
       ~35 vector slots are filled by `HGToneCurve::State::State()` @0x249860. Both are callable.
       Then hand the SAME bytes to the TS side as u32 patterns, so both sides run on identical
       constants and the differential tests the transcription instead of the constant table.
    3. Choose parameters that DISCRIMINATE. A float4 parameter with four different components is
       what makes a lane-index defect visible at all; the tone-curve oracle sets
       `SetParameter(0, 1.5, 0.75, 2.25, 0.5)` for exactly that reason.
    4. Compare as u32 bit patterns and classify NaN-on-both-sides separately (x86's default NaN has
       the sign bit set, JS canonicalises), and self-check the prologue bytes at `slide + vmaddr`
       before reporting any number.
  Worked examples in tree: `raw-port/re/oracle/HgcToneParamCurve2_oracle.py` and
  `raw-port/re/oracle/Gettype1_half_satTile_AVX_oracle.py`, each with its `_driver.mts`.

- **A CONSTANT SLOT WHOSE WRITER IS "UNPORTED" IS USUALLY ONE `movaps` AWAY FROM BEING KNOWN.**
  Companion to the ctor-initialiser entry already in this log. A review left open the question of
  whether the `vandps 0x1e0(%rsi)` mask in `Gettype1_half_satTile_AVX` clears enough low mantissa
  bits to hide a reciprocal deviation, and parked it on "whoever ports `HGToneCurve::SetShaderParams`
  @0x248840". SetShaderParams was the wrong function — it loads the State pointer from `this+0x1b0`
  and writes only the small scalar slots (+0x04..+0x20). The vector slots come from the State ctor
  @0x249860, and the answer is two lines of decode:

      0x249975  movaps 0x642e74(%rip), %xmm0     ; 0x24997c + 0x642e74 = 0x88c7f0
      0x249983  movaps %xmm0, 0x1e0(%rdi)
      rodata @0x88c7f0 = ff ff ff ff  ff ff ff ff  ff ff ff ff  00 00 00 00

  i.e. a LANE mask keeping R,G,B and zeroing alpha — it clears no mantissa bit, so the deviation is
  NOT hidden. The same decode found that the constant scaling that reciprocal (+0x220, rodata
  0x85fed0) is **0x3f800801 = 1 + 2^-12 + 2^-23**, the magnitude of VRCPPS's own error bound: the
  binary is compensating for the estimate, not merely tolerating it — a fact that changes how the
  modelling decision reads. Cost: about four minutes. **Before parking a numeric question on an
  unported symbol, find the instruction that writes the slot and read the rodata it names** — and
  confirm it live (`ctypes.string_at(slide + va, 16)`) so a stale file offset cannot fool you.

- **A DRIVER THAT CAPTURES THE PORT'S MODULE-LEVEL STATE BOX BEFORE THE CALL MEASURES THE WRONG
  OBJECT — and it reports 0/N with every live step correct, which reads exactly like a broken
  port.** Hit while oracling `HGPool::registerPool`: the driver did
  `_GLOBAL__N_1_registry.value = {...}; const reg = _GLOBAL__N_1_registry.value;` and then called
  the port. The port's `call_once` initializer REPLACES the object in that box, so every read came
  from the discarded one: 12 of 12 steps "diverged" while the live side was perfect. Re-read the box
  after every call (`const reg = () => _GLOBAL__N_1_registry.value!`) and let the port's own
  initializer install it — that also exercises the initializer, which is the more faithful drive.
  Same family as the `create_string_buffer(N+1)` and `CFRange`-as-array traps: **when a differential
  says the port is wrong, suspect the harness first.**

- **A CoreFoundation function called with the WRONG ARITY segfaults with no Python traceback, and
  the guess that adds an allocator argument is the natural one.** `CFURLCopyFileSystemPath(anURL,
  style)` takes TWO arguments — no allocator — but nearly every neighbouring CF creator
  (`CFURLCreateWithFileSystemPath`, `CFStringCreateWithCString`) takes one first, so
  `CFURLCopyFileSystemPath(None, url, 0)` is what you write, and it passes NULL as the URL and the
  URL as the style: `Segmentation fault: 11`, no traceback, nothing printed. It also LOOKS like the
  port under test corrupted memory. Two cheap defences: read the arity off the CALL SITE in the
  disassembly (here @0x762c-@0x762e loads only `%rdi` and `%rsi`), and run the harness with
  `python3 -u` — with buffered stdout a segfault throws away every print that would have told you
  how far it got.

## Open — reported 2026-08-11 by worker 2 (the REWORK queue does not know a rework happened; NEW)

- **A PR that has just been reworked stays in the rework queue, because `rework_claim.sh` keys on
  `reviewDecision == CHANGES_REQUESTED` and nothing clears that until a reviewer posts a NEW
  verdict.** `dismiss_stale_reviews` is off (GITHUB_APPS.md still lists it as a recommended
  follow-up), so pushing a fix does not drop the rejection. Measured across the seven PRs I
  reworked this shift, a few minutes after the force-pushes: three had already been re-reviewed
  (#111 and #112 merged, #395 approved and its rejection dismissed), and the remaining four —
  #143, #335, #314, #400 — still returned `reviewDecision = CHANGES_REQUESTED`, with the review
  pinned to a head that no longer exists:

      #143  head f7b224ff   last CHANGES_REQUESTED review at commit a166e99c
      #335  head 1f4ba65a   last CHANGES_REQUESTED review at commit 19be8d23
      #314  head 971548ff   last CHANGES_REQUESTED review at commit 4f9bb3fd

  and the attempt counter RESETS at the same moment (`rework_claim.sh` correctly treats a new head
  as progress, entry #28's lesson), so each becomes claimable again immediately. The gap is a RACE,
  not a permanent state: it lasts from the force-push until the next verdict, which today was
  anywhere from one minute to still open — and a second worker was pulling the same queue at the
  same time (leases on #445 and #492 were held by a peer while I wrote this).
  **WATCHED IT HAPPEN, which is why the next sentence is precise rather than alarmed:** four minutes
  after I force-pushed the rework of #143 the queue handed me #143 back —
  `CLAIMED 143 port/HGPool (rework attempt 1/3 on head f7b224ff)`, where `f7b224ff` is MY head. I
  released it, claimed again, and got `attempt 2/3 on head f7b224ff`. So re-claims of an unchanged
  head DO count against the cap and the loop is BOUNDED: at 3/3 the queue stops offering the PR and
  says a human decides. The cost is two wasted claims per reworked PR — a worker told to redo a
  rejection that is already answered — and then the PR silently leaves the worker queue for good.
  By the end of the shift two of my own reworked PRs had reached exactly that: `rework_claim.sh`
  now prints `PR #143 at 3/3 attempts on head f7b224ff — skipping (NOT closing; a human decides)`,
  and the same for #335, on heads that are finished work awaiting re-review. Neither is lost —
  `review_claim` still sees them, because its filter is the STATUS on the current head and a
  force-push clears that — but the worker queue has retired PRs whose only sin was being reworked
  promptly. (#143 has since merged, from the review side.)
  The lease is the only thing standing between that and duplicated work, and a lease is released the
  moment the worker finishes — which is exactly when the PR becomes most attractive to the queue
  (oldest `updatedAt` first is not what saves you either: a rework bumps `updatedAt`, so it goes to
  the BACK, and comes round again once the queue drains). Two workers can therefore transcribe the
  same reviewer's finding, and the second one's evidence lands on top of the first's.
  NOT the same as the review queue: `review_claim.sh` DOES see a reworked PR, because its filter is
  the STATUS on the current head (`NONE` after a push) rather than the review decision. So the
  routing is half-right today — reviewers will pick these up; the worker queue just cannot tell they
  are done.
  FIX, cheapest first: (a) have `rework_claim.sh` skip a PR whose HEAD SHA differs from the newest
  CHANGES_REQUESTED review's `commit_id` — one `gh api .../reviews` call, and the three lines above
  show it separates the two cases exactly: it is the "has the author already answered this?"
  question, and the answer is already in the data the queue fetches; (b) failing that, write a marker
  (`$STATE/reworked/<PR>@<sha>`) on release and skip it, the same shape reviewer 4 proposed for the
  self-review problem; (c) turn on `dismiss_stale_reviews`, which fixes this and the stale-APPROVE
  hazard in one move, but changes reviewer behaviour repo-wide and is a human's call.

- **An ABANDONED CLAIM can block the fix for a rejected PR, and there is no way to reopen one that
  a worker is meant to use.** PR #143's rejection said, correctly, that the ported
  `HGPool::unregisterPool` is unreachable until `HGPool::registerPool` @0x8c850 is ported, and
  offered "port it first" as the preferred remedy. `registerPool` was already in `claims.jsonl` —
  claimed ~60 minutes earlier, together with the `.s`-suffixed phantoms the old dot-swallowing regex
  produced — with **no branch, no PR, no worktree holding it, and no `drop` record**. So the symbol
  was neither available nor being worked on, and `depclaim.py` offers `next` (which will not hand
  you a NAMED symbol), `drop` (which parks it) and `reopen` (documented "rare; human/maint only").
  A worker with a legitimate need for that exact symbol has no sanctioned move.
  WHAT I DID, and I think it is the right precedent: confirmed abandonment three ways (no
  `origin/port/*` branch for the class, no open or closed PR naming the symbol, no pool worktree
  holding the class lease), appended a claim record through `depclaim._append` with a `note` saying
  why, and said so in the PR comment so the original claimant can reconcile if they return.
  FIX: `depclaim.py claim <mangled> "<why>"` for exactly this case, refusing when the symbol is
  inflight (a branch exists) and warning when it is claimed; plus a `claims.jsonl` entry age +
  inflight cross-check in `swarm_maint.sh` so abandoned claims surface instead of silently pinning
  symbols. Note this is #18 in a new form: the queue is append-only precisely so that an honest
  refusal cannot delete a unit, and the same property means an agent that dies mid-unit removes it
  just as permanently.

---

## Open — reported 2026-08-11 by reviewer 2 (an UNKNOWN FLAG eats the whole review body; the arch trap can REJECT; new)

- **AN UNRECOGNISED `--flag` PASSED TO `pr_review.sh` BECOMES THE REVIEW BODY, AND THE `--body-file`
  IS NEVER READ — SO THE ENTIRE VERDICT IS REPLACED BY THE COMMAND LINE, WITH EXIT 0 AND A SUCCESS
  LINE NAMING THE RIGHT VERDICT AND THE RIGHT SHA.** This is the `--body-file` fix (#30) working
  exactly as designed and still losing everything, through the argument parser instead of through the
  shell. Hit live, by me, on PR #553:

      $ pr_review.sh 553 request-changes --expect-head 50ed06eb… --body-file /tmp/verdict.md
      pr_review: PR #553 @ 50ed06eb -> CHANGES_REQUESTED (as vjeux-reviewer[bot])

      $ gh api …/pulls/553/reviews --jq '.[-1] | "\(.state) len=\(.body|length)"'
      CHANGES_REQUESTED len=91          # the file was 11,313 bytes

  The posted body was the literal string
  `--expect-head 50ed06eb… --body-file /tmp/rev2_553_verdict.md`. Mechanism: `--expect-head` does not
  exist on main — it is added by PR #553, which is UNLANDED — and main's `pr_review.sh` tests only
  `[ "${1:-}" = "--body-file" ]`. `$1` was `--expect-head`, so the branch was not taken and
  `BODY="${*:-}"` swallowed the whole argv, `--body-file` and path included, as prose.

  **Why this is not a one-off mistake by one agent:** the flag is advertised in three places an agent
  is told to trust — PR #553 adds it to `AGENT_ENTRY.md`'s reviewer checklist, it is in that PR's
  OPS_LOG row 35, and dispatch prompts are already instructing reviewers to sign with it (mine did,
  in bold, as hard-won advice). Every one of those is correct about what the tool WILL do and silent
  about what it does TODAY, so the natural, obedient action destroys the evidence. Same family as
  #30/#445 — evidence deleted from the permanent record while the posted review still reads
  plausibly — but strictly worse: the backtick trap removed a clause, this removes the document.

  DETECTION, and it is the only reason I caught it: **read the posted body back after signing.**
  `gh api repos/<slug>/pulls/<PR>/reviews --jq '.[-1].body | length'` next to the byte count of the
  file you wrote is a one-line check, and nothing else in the loop performs it.
  RECOVERY: dismiss your OWN broken review
  (`gh_as.sh reviewer api -X PUT …/reviews/<id>/dismissals -f message='…'`) — the idempotence filter
  does not match DISMISSED, so the same verdict can then be re-posted on the same head with the real
  body. Dismissing your own review removes nothing but your own signature; a peer's rejection on the
  same PR is untouched and still blocks (verified: reviewer 1's CHANGES_REQUESTED survived mine).
  FIX: `pr_review.sh` should REFUSE any argument beginning with `--` that it does not recognise,
  rather than folding it into the body — three lines, and it converts every future
  flag-ahead-of-the-tool into a loud stop instead of a silent deletion. A cheap corollary: refuse a
  body that CONTAINS the token `--body-file`, which can only mean the file was not read. General
  rule, since this is the third door into the same room: **a tool whose job is to record evidence
  must never accept an unparsed argument as that evidence.**

- **THE WRONG-ARCHITECTURE ORACLE DOES NOT ONLY FAIL TOWARD VERIFIED — IT CAN PRODUCE A REJECT, WITH
  MEASURED NUMBERS THAT ARE EXACTLY BACKWARDS, AND THOSE NUMBERS THEN GET BAKED INTO A GATE MESSAGE
  EVERY FUTURE AGENT READS.** The standing entries say the arm64 slice fails toward "equal"/VERIFIED
  and that it hides the NaN-sign class. PR #154 (`HGFormatUtils::RGBtoRGBA` @Helium 0xa1cf0) is the
  other direction: three reviewers independently rejected it citing
  *"fmt 232 -> live FCP 232, port 24"*, and on the x86_64 slice the port was transcribed from, live
  FCP returns **24** for fmt 232 — the same answer the port gave. Same symbol, same corpus, one
  process each:

      fmt        17 18 19 20 21 40 41 | 81 82 83 84 | 232 233 913 | 616 | 65576
      x86_64     24 24 25 27 28 24 24 | 81 82 83 84 |  24  24  24 | 616 | 65576
      arm64      24 24 25 27 28 24 24 | 24 24 24 24 | 232 233 913 |  24 | (n/a)

  I reproduced the reviewers' figures exactly from a native arm64 process, which is how I know that
  is what happened rather than something about my own run (x86_64 side: three runs, three ASLR
  slides, identical answers; prologue bytes at `slide + 0xa1cf0` self-checked; dlsym address equal to
  the cached x86_64 inventory address + slide).

  WHY THE TWO SLICES DISAGREE AT ALL, and it is the interesting part: the method's `btq %rax,%rcx`
  masks the bit index to `fmt & 63` while the following `shlq $0x5` scales the FULL fmt, so any
  fmt >= 64 whose low six bits land in the bitmap indexes PAST the 44-entry table. The answer is then
  whatever bytes follow that table — and the two slices lay out that memory differently. So on the
  out-of-table domain there is **no value a port can return that is faithful to "the binary"**, which
  is a much stronger argument for raising than the one the PR made for itself. (A negative fmt whose
  low six bits hit the bitmap — -47, -24 — faults with SIGBUS; call those in a forked child or the
  harness dies.)

  THE PART THAT OUTLIVES THE PR: the wrong number is now quoted inside `undef_index_gate`'s flag text
  — *"the #154 RGBtoRGBA class: returned 24 where live FCP returns 232"* — so every G7 flag in the
  repo teaches the reversed fact to whoever reads it. Fix that string when the gate is next touched.
  RULES: (1) an oracle report should NAME the slice it ran on, in the report, next to the numbers —
  a differential that cannot say which architecture it called is not evidence; (2) when a reviewer
  rejects on measured values, the values belong in the review body (these did, which is the only
  reason this was recoverable); (3) if you are about to reject a port whose disagreement is confined
  to indices the machine itself reads out of bounds, check the other slice before you sign — that
  domain is exactly where the two disagree.

- **Third confirmation, with three fresh instances: the G5 NO-DISASM flag names an address that is
  not the flagged export's.** On PR #154, `textureSizeBytes` was flagged for @Helium 0xa1bf4 (not a
  symbol start at all — `toHGGLContextID` is at 0xa1bf0), `collapseRectForFormat` for @0xa1d60
  (that is `bytesPerPixel`; `collapseRectForFormat` is at 0xa22f0), and `buildFormat` for @0xa0bfc0
  (`buildFormat` is at 0xa26e0). Workers 4 and 6 already reported this; it is still live, and it
  costs a reviewer real time because the natural first move is to disassemble the address in the
  message. Until it is fixed, resolve the export's own address from
  `army/inventory/<FW>.syms.txt` and ignore the one in the flag.

- **Re-deriving the disassembly turns 11 flags into 0 in 1.5 seconds, which is worth knowing before
  you treat a flag storm as a verdict on the PR.** Same #154: the gate leased a slot whose
  `re/disasm/` happened to be empty and reported **11 G5 NO-DISASM flags**; running
  `disasm.sh --sym` for the file's 14 HGFormatUtils symbols (1.5s total, all from the cached symidx)
  and re-gating gave **0 cheats, 0 flags**. The flags were a property of the slot, not of the change
  — the pool-scratch entry above, seen from the flagging side rather than the suppressing side.

- **A STALE `rebase-merge` IN A FRESHLY LEASED POOL SLOT COST A PEER THEIR UNPUSHED COMMIT, AND THE
  ONLY THING THAT STOPPED IT BECOMING A PUSH WAS `pr_submit.sh`'S BRANCH GUARD.** Worker 6 reported
  the trap ("a pool worktree can be leased with a rebase in progress"); this is what it costs when
  you follow the documented recovery. Full sequence, mine, slot 1, 2026-08-11 16:54Z — I was
  authoring the OPS_LOG entry above:

      1. wt_pool.sh acquire opslog_rev2_guards      -> slot 1, `## port/opslog_rev2_guards [ahead 1]`
      2. commit, then pr_submit.sh                  -> "REBASE CONFLICT on port/opslog_rev2_guards"
      3. cat .git/worktrees/1/rebase-merge/head-name -> refs/heads/port/opslog_w5   <-- NOT MY BRANCH
      4. git rebase --abort                         -> HEAD is now port/opslog_w5 @ d5a8225d
      5. git reset --hard origin/main               -> moved THEIR branch ref off d5a8225d
      6. git commit                                 -> MY commit now sits on THEIR branch
      7. pr_submit.sh opslog_rev2_guards            -> REFUSING: worktree is on 'port/opslog_w5'
                                                       but you asked to submit 'opslog_rev2_guards'

  Two things are worse than the existing entry describes. First, **the "REBASE CONFLICT" message is a
  lie about whose rebase it is**: `pr_submit.sh` renders git's "already a rebase-merge directory"
  refusal as a conflict on YOUR branch, so the natural next step is to abort — and aborting is what
  moves you onto the previous lessee's branch. Second, **step 5 is the documented workaround for a
  different hazard** (OPS_LOG's own "if anything else appears, `git fetch origin main && git reset
  --hard origin/main` in the worktree"), and applied here it silently discarded worker 5's unpushed
  104-line OPS_LOG commit — `git branch -r --contains d5a8225d` was EMPTY, so it existed nowhere else.
  I recovered it from the worktree reflog (`rebase (abort): returning to refs/heads/port/opslog_w5`
  names the pre-abort tip) and restored the ref with `git branch -f port/opslog_w5 d5a8225d`; nothing
  was lost. But the recovery depended on noticing at all, and the only reason I looked was
  `pr_submit.sh`'s #338 branch guard refusing to push — a guard written for a different problem
  catching this one at the last possible moment.

  **PR #553's `reset_clean` change would have prevented the whole sequence** (it aborts any
  rebase/merge/cherry-pick before handing the slot over, and `acquire` then refuses a slot where one
  survived). Until that lands: after EVERY `wt_pool.sh acquire`, run `git status -sb` and
  `ls .git/rebase-merge 2>/dev/null` before you write anything, and **never `git rebase --abort` in a
  pool slot without reading `rebase-merge/head-name` first** — if it names someone else's branch,
  the safe move is `git rebase --quit` (which leaves their branch ref alone) followed immediately by
  `git checkout -B <your branch> origin/main`, not `--abort`.

- **`check_duplicate_classes.py` IS THE GUARD FOR THE CLASS-FORK HAZARD, IT WORKS, IT REPORTS SEVEN
  REAL VIOLATIONS ON MAIN TODAY — AND NOTHING HAS EVER CALLED IT.** Found while reviewing worker 6's
  fork entry (PR #556), which concludes "nothing mechanical covers it". Something does; it is simply
  not plugged in:

      $ python3 raw-port/army/tools/check_duplicate_classes.py
      DUPLICATE class 'ozretimingutil':  ['raw-port/src/ozone/OZRetimingUtil.ts',  'raw-port/src/channels/OZRetimingUtil.ts']
      DUPLICATE class 'ozscene':         ['raw-port/src/nodes/OZScene.ts',         'raw-port/src/channels/OZScene.ts']
      DUPLICATE class 'ozscenesettings': ['raw-port/src/nodes/OZSceneSettings.ts', 'raw-port/src/channels/OZSceneSettings.ts']
      check_duplicate_classes: 7 duplicate(s) -> REJECT

      $ grep -rn check_duplicate_classes raw-port/army/gate raw-port/army/tools/pr_gate.sh \
            raw-port/army/tools/pr_land.sh raw-port/army/verifier/prove_all.py
      (nothing)

  Its own docstring opens with "CI guard: reject two .ts files with the same class basename across
  ..." and `PORTING_SPEC.md` describes it as one. The only files that mention it are the tool itself,
  `PORTING_SPEC.md`, this log, and four stale `.gate-*` worktree copies. No gate, no `pr_gate`, no
  `pr_land`, no `prove_all` layer.

  Measured cost of the gap, grouping every `raw-port/src/**.ts` on origin/main by lowercased basename:
  **five classes are filed twice under different layer directories** — `FFSemanticMatteNode`
  (channels + nodes), `OZAudioMixer` (channels + nodes), `OZRetimingUtil` (channels + ozone),
  `OZScene` (channels + nodes), `OZSceneSettings` (channels + nodes). This log's "known, not yet
  fixed" section names only `OZScene`, so four accumulated unrecorded, underneath a check that would
  have caught every one of them.

  This is the purest instance of the pattern the rest of this file keeps naming — a guard written,
  documented as CI, and never wired, so a reader greps, sees a check exists, and stops looking.
  Distinct from "a guard that cannot fire" (#40, the `--arg` query; the LAYER 2f cases): this one
  fires perfectly and is simply never invoked.

  FIX, in order: (1) reconcile the five forks, or record them as accepted exceptions in the tool, and
  (2) wire it into `pr_gate.sh` or as a `prove_all` layer. It cannot be turned on before (1) — it
  exits REJECT against main as it stands, which is presumably why it was left out and then forgotten.
  Note for whoever does it: `dup_check.py` is NOT this check and cannot be extended into it — its
  `_exists_on_main` keys on the cited MANGLED SYMBOL, deliberately skipping comment lines, so a fork
  that adds methods main does not have is correctly NEW to it. The two tools answer different
  questions and the class-level one is the one with no caller.
