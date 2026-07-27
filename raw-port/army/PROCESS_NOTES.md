
## Audit 2026-07-27 (~16:40 PDT) — process gaps found (agents fine, infra broken)

WHAT WORKED (keep):
- Faithfulness discipline held under the gate. Standout finds proving no shortcuts:
  * OZCatmullRom = Cardinal-computes-tangents -> Bezier-evaluates (NOT textbook basis); agent THREW
    citing both upstream addrs rather than substitute the textbook formula.
  * PCMath::inverseEaseInOut is NOT the algebraic inverse; agent probed the live dlsym symbol
    (y=0.5 -> 0.625) and transcribed Apple's actual math.
  * PCColor::mix() intentionally does NOT mix alpha (decl %eax -> loop n-1).
- Landed clean + gate-verified: PCColor, PCMath, OZCatmullRom, CMTime free-fns.

WHAT BROKE (fix before scaling past ~3 concurrent):
1. SHARED WORKING TREE = the killer. All agents share ONE checkout on cli:vjeux-mac. One agent's
   `git reset`/`git checkout`/`git pull` resets EVERYONE's index and clobbers peers' unstaged files.
   Observed: OZChannel2D/3D/Position .ts written then WIPED; index cross-contaminated (Bool3D.ts +
   PCBlend.claim + PCColorUtil.claim all staged together -> next commit sweeps up wrong files).
   FIX: git worktree per agent (git worktree add ../wt/<agent> -b port/<class>), agent works+commits
   in its OWN worktree+branch, a serialized merge-queue reaper merges green branches to main. No
   shared index, no push races.
2. CLAIMS staged into git (should be local-only or in the worktree) — they collide like any file.
3. Agents that finished a FILE but never COMMITTED (2D/3D/Position) — likely stalled on push
   contention or died mid-gate. With worktrees each commit is independent -> no contention.
4. disasm.sh writes /tmp/<FW>_tV.txt shared cache — fine (read-only), but re/disasm/*.s writes to the
   shared tree collide too; move under the worktree.

DECISION: do NOT hand-rescue in-flight agent files. Rebuild the harness with worktree isolation +
merge queue, then re-dispatch the lost classes cleanly. That's the scaling unlock (10 -> many).
