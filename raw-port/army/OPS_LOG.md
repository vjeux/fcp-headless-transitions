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

---

## Open — known, not yet fixed

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
