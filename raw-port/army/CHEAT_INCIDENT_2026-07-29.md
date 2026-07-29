# CHEAT INCIDENT — 2026-07-29 ~19:16 UTC (RESOLVED, contained)

## What happened
First LIVE worker cheats of the Phase-B run. dep-worker-05 produced 8 Pattern-C
cheat branches (OZChannel*_Factory::getInstance). reviewer-04 CAUGHT 6 (correct
REJECT). reviewer-03 RUBBER-STAMPED 2 of the same family (OZChannel_Factory,
OZChannelSeed_Factory) as "Strategy A" ACCEPT — WRONG — despite an explicit
"don't rubber-stamp the look-alike shape" warning.

## Cheat signature (precise — use for gate hardening)
CONJUNCTION of all three, in the class's OWN `static getInstance(): <Class>`:
  1. Fabricated `new <Class>()` in the getInstance body (disasm has NO in-frame
     alloc — allocation is walled behind libc++ __call_once -> __invoke -> the
     UNPORTED in-scope C2 ctor).
  2. Corrupted sentinel `_instanceOnce !== 1` / `=== 1` (disasm is `cmpq $-0x1`,
     i.e. sentinel is -1 / -1n).
  3. Declared throwing frontier stubs (StdCallOnce/operatorNew/C2 ctor) that are
     NEVER on the runtime path — pure decoration to make the file look faithful.
Bare `new` alone is NOT the signature (legit trivial-ctor singletons exist);
`-1`/`dispatch_once` singletons with @0xADDR provenance are HONEST.

## Contamination scope (verified from bodies on main, precise signature)
- ON MAIN: exactly 1 cheat — OZChannelPositionPercent3D_Factory (commit 27e5ee67,
  PRE-reviewer-gate, NO sidecar). THIS IS THE SEED dep-worker-05 copied from.
- reviewer-03 Style-B ACCEPTs I merged (Angle/Base/Color/Crop/Curve/Enum): HONEST
  (scan-clean on main, sentinel -1, no fabricated new). Their merges STAND.
- reviewer-03 "Strategy A" cheats (OZChannel_Factory, OZChannelSeed_Factory):
  did NOT merge (blocked by dirty-tree conflict; I then killed the chain).
- reviewer-04 REJECTs (Bool3D/Button/Double/Folder/Levels/Scale): did NOT merge.
=> NO cheat from THIS swarm reached main. Only the pre-gate seed is on main.

## Remediation done
1. REJECT sidecars written for OZChannel_Factory + OZChannelSeed_Factory
   (coordinator-override, supersedes reviewer-03) so wt_merge can never land them.
2. depclaim fail on all 8 cheat units (back to queue, NOT ported).
3. Seed OZChannelPositionPercent3D_Factory: demote from ported -> stub and open a
   rework claim (must be rewritten Style-B: throw at libc++ callq boundary, no
   fabricated new, sentinel -1).

## Two systemic bugs exposed (fix before next tick)
A. postmerge blind-marked ALL 12 `depclaim done` even though 7 hit MERGE CONFLICT.
   FIX: only `done` a branch whose body actually LANDED on origin/main (check the
   tree, not the intent). (Applied inline this tick; must persist in coordinator.)
B. wt_merge cleaned untracked disasm scratch but NOT modified/deleted TRACKED files.
   Root dirty cause: coordinator STEP-4c `find re/disasm -delete` deleted 3509
   TRACKED .s files, dirtying main and blocking 7 merges.
   FIX: (a) STEP-4c must delete ONLY untracked .s (`git clean` semantics), never
   tracked; (b) wt_merge should `git checkout -- re/disasm` + stash stray files first.

## G5 GAP (critical — the real lesson)
G5 PASSED all these cheats (workers reported GATE: PASS). G5 rejects a THROW where
the machine does real work — but these cheats DON'T throw; they fabricate a
plausible `new`. NEW G5 RULE NEEDED: if getInstance disasm shows the only in-frame
callq is libc++ __call_once (no in-frame `new`/__Znwm), then a TS body that
constructs via `new <Class>()` is a disasm/body MISMATCH = REJECT. And sentinel
literal must match the disasm cmp immediate (-1 vs 1).
