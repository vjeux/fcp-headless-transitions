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
