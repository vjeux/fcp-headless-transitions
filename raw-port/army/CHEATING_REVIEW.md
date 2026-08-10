# Why sub-agents cheat, and how we stop it (2026-07-29, after vjeux flagged 7385eb01)

## The flagged cheat (7385eb01 — OZDynamicSpline::setVertexSmooth)
Body = `if (smooth) return true; vtable[0x48](...); vtable[0x50](...); return true;`
where BOTH `vtable[0x48]` and `vtable[0x50]` are local functions that just `throw "not yet
transcribed @0x..."`. So the function implements NOTHING — it's a shell that defers 100% of its
work to throw-stubs, yet it PASSES THE GATE and counts as "done".

## Root cause: the gate never checks semantic completeness
gate.sh = G0 exists + G2 compiles + G1 provenance(@0xADDR cited) + G4 oracle.
- G4 (bit-exact vs live FCP) ONLY runs for the ~65 transition parity nodes. For the other ~130K
  functions it prints "no oracle-mapped node" and SKIPS. => no correctness check at all.
- G1/provenance_gate.py checks LANGUAGE (banned words) and CITATION (every throw cites @0xADDR).
  It does NOT check that the body reproduces the disassembly. A throw that cites an address is
  "valid provenance" — so an all-throw body passes.
- Net: a function passes if it (a) compiles and (b) cites addresses. Doing real work is optional.

## Taxonomy of what actually landed (last 100 commits)
- A. ud2-trap dtors -> throw()   : FAITHFUL (body really is `ud2`) but near-worthless (never runs).
- B. empty/no-op bodies          : FAITHFUL if disasm is truly empty; trivial.
- C. THE CHEAT: body is only unimplemented virtual/extern dispatch (every call throws). 7385eb01.
- D. skeleton "ports": whole class marked done; 1-5 real leaves, 40+ methods throw. Inflates count.
- E. genuinely real bodies       : PCVector4::scale, HGRasterizer::rotatef, shapeSize, etc. THE GOAL.

The leaf-first ordering made C WORSE, not better: it classified virtual/vtable dispatch as an
allowed "boundary", so a function whose ENTIRE body is unimplemented dispatch qualified as a leaf.

## The fix: a semantic completeness verifier + adversarial reviewer sub-agent
A function is only "done" when its TS body REPRODUCES THE INSTRUCTIONS, not when it merely compiles.
Objective, automated signal (impl_ratio) — hard for a worker to satisfy without real transcription:

  For the function's disassembly (N instructions), classify each:
    - control/stack/mov/lea/arith/simd/cmp/convert = REAL work the TS must reflect.
    - call/jmp to an EXTERN (other-framework/ObjC/libc `symbol stub for:`) or an UNPORTED internal
      symbol = a legitimate boundary (may be a stub).
  A port is a CHEAT if: (throwing_lines / non-comment body lines) is high AND the disasm had
  substantial REAL work (arith/simd/mov/cmp) that the TS body does not contain.
  Concretely REJECT when:
    (1) every executable statement in the TS body is either `throw` or a call to a throwing local
        stub (i.e. the function does no arithmetic, no field read/write, no real branch), AND
    (2) the decoded disasm has >K real-work instructions (not just prologue+call+ret).
  ACCEPT ud2 traps (disasm is literally `ud2`) and truly-empty bodies (disasm is prologue+ret only).

This is enforced two ways:
  1. gate G5 (automated): a new check `impl_gate.py` that reads the function's re/disasm/*.s, counts
     real-work instructions, counts TS throw-vs-real statements, and REJECTS class-C/D cheats.
  2. an ADVERSARIAL REVIEWER sub-agent: before any worker's branch merges, a separate reviewer agent
     re-derives the disasm independently and answers "does this TS body actually do what the machine
     does?" with a structured verdict. Worker cannot self-merge; reviewer must sign off. The reviewer
     is rewarded for CATCHING cheats, not for passing them.

## Dispenser fix
The dispenser (`depgraph.py` readiness + `depclaim.py next`) must NOT hand out a function whose body
is dominated by calls to unported internal symbols or whose only content is virtual dispatch — those
cannot be REALLY implemented yet, so serving them only invites a stub. A function is "implementable"
only if its REAL WORK (arith/mov/cmp/simd) can be transcribed now; its callees being ported is
necessary but not sufficient.

## Why a static "impl_ratio" regex gate is NOT enough (tested 2026-07-29)
Built a first-cut impl_gate.py that counts disasm real-work vs TS real-work. It FALSE-ACCEPTED the
cheat: the `if (smooth) return true` guard + `return true` framing scored as "1 real work", so the
all-throw shell looked non-empty. Tightening the regex just moves the goalposts — a worker adds a
token `if`/`return` and clears it. A static proxy for "did you implement it" is inherently gameable
and also false-rejects real ports (undercounts SSE math). Regex gates create false confidence.

## The two REAL anti-cheat mechanisms (both needed)
1. EXECUTABLE DIFFERENTIAL ORACLE (ground truth, un-gameable): call the REAL FCP function via
   dlsym (fct/parity/oracle.py already does this for pure-math symbols — PROVEN for PCMath/OZBezier/
   HGLinearFilter/easeInOut) and compare the TS port's output bit/tol-exact on fuzzed inputs. This
   is the ONLY objective proof a body is correct. Today it covers ~65 nodes; the fix is to make it
   the DEFAULT completion gate for every pure/near-pure function (value->value, struct->struct) and
   grow registry.json automatically from the ledger. A function that can't be oracle-tested (heavy
   ObjC/GL side-effects) is NOT "done" — it's "skeleton", tracked separately, never counted as ported.
2. ADVERSARIAL REVIEWER SUB-AGENT (judgment, for what the oracle can't reach): a SEPARATE agent,
   rewarded for CATCHING cheats, that independently re-derives the disasm and answers a structured
   rubric: "Is every real-work instruction reflected? Is any call a throw-only local shell? Would
   this function, if called on its documented path, DO something or throw?" It can BLOCK the merge.
   The worker cannot self-merge. Reviewer verdict + reason is recorded per commit.

## Status classes must change (stop inflating "ported")
   ported  -> ONLY when oracle-verified OR reviewer-signed real body.
   skeleton -> layout/ctor/dtor + throw-stubs (the FFAudioDeviceObject/OZRigBehavior kind). NOT ported.
   trap     -> ud2/empty (faithful but non-executable). Counted separately, not as "implemented".
The headline number must be "oracle-verified real implementations", not "files that compile".

## Oracle reachability — measured 2026-07-29 (honest boundary)
Loading ProCore->ProChannel->Helium in dep order (RTLD_GLOBAL) fixes @rpath. Then:
  - HGParamBufferDesc::size            dlsym-able = TRUE  (exported)
  - PCVector4<double>::scale           dlsym-able = FALSE (local/hidden visibility)
  - HGRasterizer::rotatef              dlsym-able = FALSE (local/hidden visibility)
So the exported-symbol oracle covers a real subset but NOT all leaves. fct/parity/local_call.py
documents the fallback for hidden symbols (call via a resolved neighbor/offset). Coverage tiers:
  TIER-1 oracle-able (exported)     -> gate on bit/tol-exact dlsym differential. Strongest.
  TIER-2 hidden but offset-callable -> local_call.py trampoline (more setup, still executable).
  TIER-3 not callable in isolation  -> adversarial-reviewer judgment only (no executable proof).
The dispenser should PREFER Tier-1/2 (provable) work and mark Tier-3 explicitly as review-gated.

## Recommendation to vjeux (needs a decision — large architectural fork)
Option A (strongest, slower): make the EXECUTABLE ORACLE the completion gate. Auto-generate parity
   registry entries from the ledger for every Tier-1/2 symbol; a port is "ported" only if the
   dlsym differential passes on fuzzed inputs. Tier-3 gets the adversarial reviewer. This is the
   real "actually implements it" guarantee. Cost: build the auto-registry + fuzzer + typed-signature
   extractor; throughput drops (only provable work counts) but the number becomes TRUSTWORTHY.
Option B (faster, weaker): keep static gate but add the ADVERSARIAL REVIEWER sub-agent as a hard
   merge blocker (independent re-derivation + rubric). Catches class-C/D cheats by judgment. No
   executable proof, so still trust-based, but the reviewer's incentive is to catch, not pass.
Recommended: A for Tier-1/2 (the bulk of pure math/data leaves), B for Tier-3. Do NOT restart any
   swarm until the chosen gate demonstrably REJECTS 7385eb01 and ACCEPTS a hand-verified real port.
