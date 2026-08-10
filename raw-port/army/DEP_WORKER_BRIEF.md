# DEP WORKER — port ONE ready unit from the strict dependency queue

You are handed a function (or a small cycle) whose EVERY in-scope callee is ALREADY PORTED. This is
the whole point of the dependency queue: there is NO unresolved internal dependency, so you have NO
excuse to write a throw for one. If your disasm shows a call to another FCP function, that function
is already ported — you IMPORT it and CALL it. A throw-stub for an in-scope callee is a REJECTED cheat.

## Claim
    cd <repo> && python3 raw-port/army/tools/depclaim.py next
Prints `CLAIMED_UNIT` then one or more TSV rows `<FW>\t<Class>\t<mangled>\t<demangled>`. Usually ONE
function. If MULTIPLE rows, it's a dependency CYCLE (mutual recursion) — port them together in one
branch (they call each other; neither can be done alone).

The queue is APPEND-ONLY: the instant `next` hands you a unit it is recorded as claimed forever and
will NEVER be handed to anyone else — so you can never collide with another worker, and you never
need to release, defer, or mark-done a claim. If you cannot complete a claimed unit, just STOP and
claim the next one; the abandoned unit is simply skipped (a coordinator can `depclaim.py reopen
<sym>` in the rare case it must be retried). libc++ template instantiations (`std::__1::…`) and
already-built symbols are filtered out automatically — every unit you get is real, fresh FCP work.

## The only legitimate throw
A throw is allowed ONLY for a TRUE OUT-OF-SCOPE extern — libc (`operator new`/`delete`,
`_Unwind_Resume`), ObjC runtime (`_objc_*`), CoreFoundation/Foundation, pthread, Metal/CoreVideo/
CoreGraphics/AVFoundation. These are outside the 5-framework port scope and are modelled as boundary
stubs by policy (like the CGColorSpace externs already in-tree). Each such throw cites its @0xADDR.
  - An in-scope callee (any `__ZN...` that is in ProCore/ProChannel/Helium/Ozone/Flexo and thus in a
    ledger) is NOT allowed to be a throw. `depclaim` only gave you this function because every one of
    those is already ported. Run `python3 raw-port/army/tools/depgraph.py deps <mangled>` to see them
    all with status `ported` — import and call them.
  - Indirect/virtual calls (`callq *off(reg)`): you will NOT be handed a function that still has
    unresolved indirect calls (those are held in the `virtual-blocked` tier until tools/vtable.py
    pins the slot to a concrete method, which then becomes a normal dependency). If your disasm has
    one anyway, just STOP on that unit and claim the next — do not stub it (the queue won't re-hand it).

## Port (PR FLOW — 2026-08-10; the old local wt_merge/wt_setup tools were DELETED)
Read `raw-port/army/PR_FLOW.md` once. Merging happens through GitHub Pull Requests. The old local
merge tools (`wt_merge.sh`, `wt_setup.sh`) no longer exist. You OPEN A PR and STOP — a reviewer runs
the gate (as GitHub CI) and merges.

1. `python3 raw-port/army/tools/depgraph.py deps <mangled>` — confirm every dep is `ported`.
2. `bash raw-port/tools/disasm.sh --sym <mangled> <FW>` — get the exact body.
3. Work in an ISOLATED checkout, NEVER the canonical tree (the shared `.git` contention is what
   wedged worktree-add under load). Prefer a private clone or a /tmp worktree:
       git -C ~/random/final-cut-pro-transitions worktree add -b port/<Class> /tmp/port_<Class> origin/main
       cd /tmp/port_<Class>
   Symlink the node_modules so the gate's tsgo works:
       for d in engine/node_modules raw-port/node_modules venv; do ln -sfn ~/random/final-cut-pro-transitions/$d $d; done
4. Write the REAL body into raw-port/src/<layer>/<Class>.ts (edit tool). Import the ported callees
   from their real files and CALL them. Transcribe every instruction; @0xADDR on the fn + each const.
   ADD-ONLY when extending an existing class file: `git show origin/main:<path>` first and EXTEND it —
   never delete/replace a landed sibling method (a file-level regression is rejected by the PR gate).
5. `bash raw-port/army/gate/gate.sh raw-port/src/<layer>/<Class>.ts` MUST print GATE: PASS. This is a
   fast local pre-check to save a review round-trip; the reviewer re-runs the authoritative gate.
   G5 re-derives your disasm and REJECTS a throw where the machine does real work.
6. Commit to your branch, then open the PR and STOP:
       bash raw-port/army/tools/pr_submit.sh <Class>
   `pr_submit.sh` rebases onto origin/main, pushes `port/<Class>` (force-with-lease), and opens a PR
   titled `port: <Class>`. That's it — DO NOT merge, DO NOT set any skip-review flag. The reviewer
   runs `pr_gate.sh <PR#>` (posts the required `faithfulness-gate` commit status) and, if faithful,
   merges the PR server-side via GitHub. Branch protection (strict/up-to-date, linear, enforce_admins)
   guarantees nothing lands without a green gate. `mark_ported.py` is run post-merge by the reviewer.
7. If a dep turns out unported, or an indirect/virtual call is unresolved, STOP that unit and claim
   the next (do NOT stub it; the append-only queue won't re-hand it).

Do 4-8 units, then STOP. Report per unit: FW, class, mangled, addr, deps (proof they were ported),
branch + PR number/URL, local GATE result.
