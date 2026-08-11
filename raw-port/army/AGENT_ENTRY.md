# AGENT_ENTRY.md — the one file a swarm dispatch prompt points at

**Why this file exists.** Dispatch prompts used to carry the startup contract inline, or point at a
scratch file written to `/tmp` when the swarm was launched. Both go stale the moment anything in this
repo changes, and a `/tmp` copy is invisible to `git log`, survives no reboot, and cannot be fixed by
the PR that fixes the thing it describes. **A dispatch prompt should say only: your role, your slot
number, and "read `raw-port/army/AGENT_ENTRY.md`".** Everything else lives here, versioned, and every
future agent picks up edits automatically.

If you are reading this because a prompt sent you here: you are ONE slot in a self-continuing loop.
Your prompt names your **role** (worker or reviewer) and your **slot number `<N>`**. Nothing else
about you is special.

---

## 1. Read these, in this order, before you claim anything

**Everyone, first:** [`OPS_LOG.md`](OPS_LOG.md) — the failures agents keep rediscovering, and the
fixes that closed them. Reading it is the cheapest thing you will do all session; rediscovering an
entry in it is the most expensive.

Then [`HARNESS_LOOP.md`](HARNESS_LOOP.md) (the loop spec), and:

| Role | Then read |
|---|---|
| **worker** | [`DEP_WORKER_BRIEF.md`](DEP_WORKER_BRIEF.md), [`PR_FLOW.md`](PR_FLOW.md), [`PORTING_SPEC.md`](PORTING_SPEC.md), [`ANTI_SHORTCUT.md`](ANTI_SHORTCUT.md) |
| **reviewer** | [`REVIEWER_BRIEF.md`](REVIEWER_BRIEF.md), [`PR_FLOW.md`](PR_FLOW.md), [`CHEATING_REVIEW.md`](CHEATING_REVIEW.md), [`ANTI_SHORTCUT.md`](ANTI_SHORTCUT.md), [`GITHUB_APPS.md`](GITHUB_APPS.md) |

Reviewers additionally run `python3 raw-port/army/verifier/prove_all.py` once at start; it must print
`PROVE_ALL: PASS`.

## 2. Hard invariants (violating one of these is worse than doing nothing)

1. **Never spawn another agent.** Nothing in this swarm spawns. Concurrency is a human decision
   expressed as a slot count.
2. **Never edit the canonical checkout** (`~/random/final-cut-pro-transitions`). Lease a warm
   worktree — workers `wt_pool.sh acquire <Class>`, reviewers `wt_pool.sh acquire-at <SHA>` — work
   there, release it. `git worktree add` is forbidden. Release every lease you take, oracle work
   included.
3. **Take your slot lock first, release it last:** `slot_lock.sh acquire <role> <N>`. `BUSY` means a
   previous run of your slot is still alive — stop immediately.
4. **Workers never merge. Reviewers never merge a PR whose `faithfulness-gate` is not success**, and
   never a REJECT/CHEAT/SKELETON. Never a bare `gh pr merge`.
5. **No stubs, throw-stubs, or skeletons for in-scope symbols.** Every in-scope callee you are handed
   is already ported.

## 3. Priority

**Workers: rework queue, then rebase queue, then fresh ports.** In that order, because it is the
order of decreasing evidence already spent. A rejected PR carries a reviewer's completed differential
naming exactly what is wrong; a stale base carries a finished, verified body; a fresh unit carries
nothing yet.

    bash raw-port/army/tools/rework_claim.sh claim    # a PR a reviewer REJECTED — fix what they named
    bash raw-port/army/tools/rebase_claim.sh claim    # a stale base
    python3 raw-port/army/tools/depclaim.py next      # a fresh symbol

Each prints `NONE` when empty; fall through to the next. **Release every lease when you stop**
(`rework_claim.sh release <PR>`), and read the reviewer's REQUEST_CHANGES in full before you touch
anything — they usually give a minimal reproducer, and the fix is often one line.

**Reviewers:** claim continuously rather than stopping after a verdict. If `review_claim` keeps
returning `NONE` while open PRs exist, they are almost certainly CHANGES_REQUESTED and therefore
correctly invisible to you — that is the WORKERS' queue, not a bug, and not yours to take back.

## 4. Performance — this box amplifies file I/O enormously

The corp security stack (Defender, Cyberhaven, DLP, uberAgent) is MDM-locked and rescans on every
file open. It cannot be excluded. With N agents, every wasteful read is multiplied by N. Three rules
carry almost all of the benefit:

- **Never read a framework binary when a cached index answers the question.** For symbols:
  `grep <pattern> raw-port/army/inventory/<FW>.syms.txt` (the files are gitignored regenerable state,
  symlinked into every pool worktree by `wt_pool.sh link_deps`; if one is genuinely missing, restore
  it ONCE for everyone with `dump_syms.sh` in the canonical checkout rather than nm-ing per agent) (`<addr> <T|t> <mangled>`, all 5
  frameworks, ~145k defined symbols, **0.08s**). Running `nm` on
  `/Applications/Final Cut Pro.app/.../Flexo` instead is a 78 MB fat Mach-O read that costs a full
  core for **over two minutes** under contention — measured ~1000x worse for the same answer
  (OPS_LOG #22). For disasm bodies, use `symidx.py`, never a linear scan of the otool dump
  (OPS_LOG #10). If you genuinely need something the cache cannot answer (UNDEFINED symbols, say),
  know that **thinning does not save you**: under swarm load the same `nm` measured 4m24s on the fat
  binary and 3m54s on the thin `/tmp/<FW>.x86_64` slice — the cost is the symbol-table walk plus the
  security stack, not the fat header. Prefer the thin slice anyway, budget minutes for it, capture it
  ONCE into a variable rather than piping `nm` twice in one command, and consider whether one agent
  should regenerate the cache for everyone instead (`dump_syms.sh`).
- **Before a global maintenance tool, check for a peer already running it.** `mark_ported.py`,
  `build_ledger.py` and `depgraph.py` reconcile the WHOLE repo and are idempotent: one run covers
  every agent's commit. `pgrep -f mark_ported` and skip if one is live (OPS_LOG #23).
- **Write few files.** The warm pool exists so a unit costs ~1 file write instead of ~2,579; keep it
  that way. Prefer one combined command over a chain of small ones that each re-stat the tree.

## 5. Gate discipline (the rules that exist because they were violated)

- Run the gate from **inside your leased worktree**, using **that worktree's own `gate.sh`**, at an
  **absolute path**, and **check the exit status directly — never pipe a gate into `tail`**, because
  a pipeline returns `tail`'s status and a REJECT then looks like success.
- Run `disasm.sh --sym` inside the worktree first, or G5 only flags instead of classifying.
- **Re-check `git show origin/main:<path>` immediately before committing** — a class file can land
  while you are writing it — and confirm your change is purely ADD-only with
  `git diff origin/main -- <file>`.
- Nested classes are `Outer__Inner` (double underscore). APFS is case-insensitive, so `HgcFoo.ts`
  resolves to a landed `HGCFoo.ts` and would silently overwrite it — drop such units with that reason.

## 6. The oracle, and the trap under it

Oracle your port whenever the symbol is callable: every recent real defect was throw-free and passed
every static gate. Exported (`nm` `T`) symbols are dlsym-able; Ozone needs its `@rpath` chain
preloaded recursively. **AVX kernels DO run under Rosetta — feature bits lie there, so probe by
executing, never by inferring from `sysctl`.** This note has been here a while and reviewers kept
signing 150-instruction VEX.256 kernels on reading alone anyway, because `sysctl hw.optional.avx1_0`
returns 0 and that reads like an answer. So do not take it on trust either — settle it in two
seconds, on the box, before you decide a kernel is un-oracle-able:

    arch -x86_64 /usr/bin/python3 raw-port/army/tools/probe_avx.py

It runs the landed VEX.256 kernel `Gettype1_half_unpremultTile_AVX` @Helium 0x2945e0 out of the live
image over a fixed tile and compares the whole destination plane byte-for-byte, so a PASS means the
thing you are about to rely on: VEX.256 executes in THIS process, at the addresses your port cites,
AND computes the right bytes. It has three outcomes and each can fire: PASS (0), FAIL (1) if the
kernel computes the wrong bytes or the symbol it was pointed at contains no VEX prefix at all, and
INCONCLUSIVE (2) if it could not run — "could not run" never reads as "answered".
(Today: `sysctl hw.optional.avx1_0` says 0, and the kernel executes and matches.)

**The slice trap:** every port is transcribed from **x86_64**, while a dlopen'd image on this machine
is **arm64**. Plain struct offsets are ABI-fixed and fine, but anywhere the slices differ — libc++
`std::string` SSO is the flagship — an address-based differential fails **silently toward VERIFIED**.
Use `arch -x86_64 /usr/bin/python3` for any address-based work.

## 6b. Rebase and evidence hygiene (fixed today — use the fixed forms)

- **`rebase_helper.py --pr <N>`**, never the bare class name. A class can have several open PRs on
  `port/<Class>__slot<N>` branches; the class-keyed form used to hand back a DIFFERENT PR's content
  with exit 0, and the wrong content is itself gate-clean (OPS_LOG #26). It now refuses an ambiguous
  class rather than guessing, but pass the PR number and the question never arises.
- **Before any force-push of a rebase, diff the FILE LIST**, not just the gate:
  `git diff --name-status <pre-rebase-sha> HEAD`. A rebase used to drop the branch's non-src files
  and a green gate said nothing, because the gate only inspects the `.ts` files you hand it — that is
  how an oracle harness was destroyed (#25). The tools now carry those files and assert they survived;
  check anyway, because the failure is silent and irreversible.
- **Write a review body to a file: `ghapp/pr_review.sh <PR#> approve --body-file <path>`.** Backticks
  inside a double-quoted `bash -c` are expanded by YOUR shell before the tool sees them, which
  silently deleted the clause naming a defect from two permanent records (#30). Same door as a
  `depclaim.py drop` reason — single-quote those.
- **`slot_lock.sh heartbeat <role> <n>` after every verdict or unit.** The stale-reclaim measures the
  lock file's mtime; without a beat it measures tick age, so a healthy long run looks abandoned and a
  dead one looks busy (#32).
- **A worktree that refuses to release after its PR merged** is the known detached-HEAD leak (#31),
  now fixed; `release --force` remains correct if you meet it on an older tool.

## 7. When you cannot port a unit

Requeue it: `python3 raw-port/army/tools/depclaim.py drop <mangled> "<why>"`. Skim
`depclaim.py blocked` before claiming — parked units carry reasons and some are recoverable.

## 7b. If something in the swarm itself looks wrong

Run the doctor before you theorise:

    python3 raw-port/army/tools/swarm_doctor.py

It asserts the standing invariants that OPS_LOG's 35 fixed entries taught us — is every open PR
claimable by some queue, is every guard actually invoked, is the canonical tree current, is work
stranded at an attempt cap, are leases and slot heartbeats healthy, can the guard suite still fail,
does the symbol inventory exist where you work. It reports what is broken NOW, where OPS_LOG records
what broke once. `UNKNOWN` means a check could not run — never that it passed. It is READ-ONLY by
design: no lease, no post, no write, so it is safe to run against a live swarm from any slot.

Two things it does deliberately, because the first version of it got them wrong and reported two
live PRs backwards in one run: it **asks each queue's own selector** (the `rows=`/`cand=` query
lifted out of `review_claim.sh` / `rework_claim.sh` / `rebase_claim.sh`, plus the status-DESCRIPTION
grep that rebase_claim applies after its prefilter) instead of re-implementing the filters, and it
reads every tool it inspects **from `origin/main`** rather than from the canonical checkout, which
is routinely tens of commits behind. A re-implemented filter is a second source of truth, and a
check that reads a stale tree reports a fix that landed an hour ago as missing.

**If you find a swarm-level fault it does not check for, add the check in the same PR as the fix.**
Nearly every entry in OPS_LOG was found by an agent tripping over it, at the cost of a unit of real
work; a check turns that one-off collision into something the next agent never has to pay for.

## 8. Before you stop

Release your worktree, your review lease if you hold one, and your slot lock. Then report: units
ported, PR numbers, rebases, drops with reasons, and **any new failure mode not already in
`OPS_LOG.md` — and add it there.** That is how this file and OPS_LOG stay true.
