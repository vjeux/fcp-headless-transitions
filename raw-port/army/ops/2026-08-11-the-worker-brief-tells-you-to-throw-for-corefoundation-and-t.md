# the worker brief tells you to throw for CoreFoundation, and the reviewer brief rejects exactly that

- **reported** 2026-08-11 by worker 4
- **status** OPEN for the general problem; the specific contradiction is FIXED in this change
  (`DEP_WORKER_BRIEF.md` now carries the ruling)

## Symptom

PR #741 (`CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting()`
@Flexo 0xdee040) was REJECTED by reviewer 5 for modelling `_CFRelease` as a throw. The rejection is
right, well-argued, and cites a RESOLVED ruling. I had never seen that ruling, and I did not skip
it — **it is in a file the worker reading list does not contain.**

The contradiction, both halves quoted from `origin/main`:

`DEP_WORKER_BRIEF.md` — read by every worker, section titled "The only legitimate throw":

> A throw is allowed ONLY for a TRUE OUT-OF-SCOPE extern — libc (`operator new`/`delete`,
> `_Unwind_Resume`), ObjC runtime (`_objc_*`), **CoreFoundation/Foundation**, pthread,
> Metal/CoreVideo/CoreGraphics/AVFoundation — each citing @0xADDR.

`REVIEWER_BRIEF.md` — not in the worker reading list, section titled "RESOLVED: extern boundary
model — no-op vs throw (RESOLVED ruling)", marked *DECISIVE — stop re-litigating per-branch*:

> **LIFETIME / OWNERSHIP primitives → JS NO-OP (or return-arg).** CFRelease/CGColorSpaceRelease/
> objc_release/CFRelease-family = do nothing … **reach_check hitting a CFRelease-throw on non-null
> input = REJECT (fix to no-op).**

So the document workers are pointed at names CoreFoundation as a legitimate throw target, and the
document reviewers are pointed at rejects that exact port. A worker who follows their brief
correctly produces a REJECT, and the round trip costs a reviewer's full differential plus a rework
lease. `AGENT_ENTRY.md` §1's table is where the split is made: workers get DEP_WORKER_BRIEF,
PR_FLOW, PORTING_SPEC, ANTI_SHORTCUT; REVIEWER_BRIEF is reviewers-only.

## Root cause

The ruling was written where it was ENFORCED rather than where it is OBEYED. That is a natural
place to put it — it settles reviewer-side disagreements, and it says so ("stop re-litigating") —
but the decision it settles is an AUTHORING decision. Two of them are in that file, both marked
RESOLVED, both phrased as instructions to the reviewer.

Nothing mechanical closes the gap either, and this case shows why it cannot: the gate is green.
`reach_check` never reaches the CFRelease throw, because the *correct* throw
(`VTDecompressionSessionCreate`, a value-producing extern) dominates every path to it. A latent
wrong answer behind a green gate is the exact shape this log keeps recording — the defect only
wakes up when someone models VideoToolbox.

## Fix

* **In this change:** `DEP_WORKER_BRIEF.md`'s "The only legitimate throw" section now carries the
  split — lifetime/ownership primitives are a NO-OP, value-producing externs throw — with the
  landed instances named (`OZChannelBase.ts`, `OZChannelInfo.ts`, `FFMediaReaderService.ts`, the
  `PCCFRef_*` family) and #741 as the worked example of both in one function.
* **The general problem is the placement rule, not this paragraph.** A RESOLVED ruling that decides
  what a PORT should contain belongs in the worker path — DEP_WORKER_BRIEF or PORTING_SPEC — with
  the reviewer brief citing it, not the other way round. Worth a sweep: `REVIEWER_BRIEF.md`
  currently holds several `## RESOLVED:` sections, and at least the per-method-ledger one
  ("honest partial class files are NOT skeletons") is likewise an authoring rule that workers are
  judged by and never handed.

## Check worth adding to `swarm_doctor.py`

Cheap and mechanical, in the spirit of its existing "is every guard actually invoked" assertions:
**for each `## RESOLVED:` heading in `REVIEWER_BRIEF.md`, require that its title (or an explicit
pointer to it) appears somewhere in the worker reading list.** A ruling that binds authors and is
invisible to them is a defect in the documentation graph, and the doctor is the thing that reads
that graph from `origin/main` already.

## Evidence

    $ grep -n -A6 'only legitimate throw' raw-port/army/DEP_WORKER_BRIEF.md   # lists CoreFoundation
    $ grep -n 'LIFETIME / OWNERSHIP' raw-port/army/REVIEWER_BRIEF.md          # says NO-OP, REJECT a throw
    $ grep -n 'REVIEWER_BRIEF' raw-port/army/AGENT_ENTRY.md                   # reviewer row only

    PR #741, reviewer 5: "a CoreFoundation LIFETIME/OWNERSHIP primitive is modelled as a JS NO-OP,
    not a throw … VTDecompressionSessionCreate throwing is CORRECT and should stay … The two
    callees fall on opposite sides of the same ruling, and this PR puts both on the throwing side."
