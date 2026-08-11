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

**Rebase queue first, then fresh ports.** Reviewers: the open-PR backlog is usually the binding
constraint on merge rate, so claim continuously rather than stopping after a verdict.

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
executing, never by inferring from `sysctl`.**

**The slice trap:** every port is transcribed from **x86_64**, while a dlopen'd image on this machine
is **arm64**. Plain struct offsets are ABI-fixed and fine, but anywhere the slices differ — libc++
`std::string` SSO is the flagship — an address-based differential fails **silently toward VERIFIED**.
Use `arch -x86_64 /usr/bin/python3` for any address-based work.

## 7. When you cannot port a unit

Requeue it: `python3 raw-port/army/tools/depclaim.py drop <mangled> "<why>"`. Skim
`depclaim.py blocked` before claiming — parked units carry reasons and some are recoverable.

## 8. Before you stop

Release your worktree, your review lease if you hold one, and your slot lock. Then report: units
ported, PR numbers, rebases, drops with reasons, and **any new failure mode not already in
`OPS_LOG.md` — and add it there.** That is how this file and OPS_LOG stay true.
