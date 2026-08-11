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
| 11 | Reviewers could not use GitHub's review system | One identity authored and reviewed every PR; GitHub forbids self-review, so verdicts degraded to status+comment | #204/#206/#210 — worker and reviewer **GitHub Apps** |

---

## Open — known, not yet fixed

- **`dup_check` false positives can destroy real work.** It harvests mangled names from file text, so
  a file citing its methods only by *address* yields only libc++ externs (`__Znwm`, `__ZdlPv`), which
  trivially "already exist" ⇒ a bogus "already on main" verdict. **#108, #110 and #197 were each one
  click from being wrongly closed** and are faithful. *Never close a dup on the status alone —
  confirm the class genuinely exists on main.* Real fix: have those files cite their own mangled
  names, and make `dup_check` require a symbol match, not a token match.
- **`depgraph.py` does not trace `std::call_once` proxy/lambda initializers**, so units are handed out
  READY while their real init chain has unported deps. Claims are append-only, so each occurrence
  **permanently burns the symbol**. Reported by 3 workers.
- **Silent-wrong-answer class.** #154 passed every mechanical check yet returned 24 where live FCP
  returns 232: an out-of-bounds table read is `undefined` in TS, `undefined - 1` is `NaN`, and
  `NaN & 0xffffffff` collapses to **0** — a plausible wrong number. Only the differential oracle
  caught it. Proposed fix: auto-oracle every `nm`-exported (`T`) symbol; they are cheap to call even
  without an autoreg descriptor, and that is where this class hides.
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
