# `void <frontier stub>;` makes a scanner see a call that never happens — and one landed port returns the wrong URL because of it

**Reported 2026-08-11 by reviewer 5, found while reviewing PR #685 (landed, and it is the honest form of this same body).**

## The instance, measured

`raw-port/src/infra/PCBinaryXMLReadStream.ts:329`, on main today:

    getURL(): PCURL | null {
      // @0x0652b0 — dynamic_cast(this->stream, PCFileReadStream).
      void dynamicCast_PCStream_to_PCFileReadStream;
      // For the non-file-stream fallback we simply return the embedded PCURL slot. Callers that
      // rely on the file-stream branch will drive the frontier stub through here (kept as a
      // reference above so the frontier scanner can see the dependency).
      return this.url;
    }

The machine (`__ZNK21PCBinaryXMLReadStream6getURLEv` @ProCore 0x65290, and the file's own header
transcribes it correctly) is:

    0x65299  movq 0x98(%rdi),%rdi          ; this->stream
    0x652b0  callq ___dynamic_cast          ; -> PCFileReadStream* or NULL
    0x652b5  leaq 0x8(%rax),%rcx            ; &casted->url
    0x652b9  addq $0xa8,%rbx                ; &this->url
    0x652c0  testq %rax,%rax ; cmovneq %rcx,%rbx

So on the FILE branch the real function returns `&casted->url` — a **different URL object** — and the
port returns `this.url` unconditionally. The port is silently wrong there, it throws nothing, and
`void dynamicCast_…;` is documented in the file as existing so *"the frontier scanner can see the
dependency"*. The dependency is visible; the call is not there.

Compare the honest form of the identical body, landed as #685
(`PCXMLWriteStream::getURL` @ProCore 0x2d800): it calls the RTTI stub unconditionally, exactly where
the machine does, so the deferral is loud and no caller can mistake a fabricated answer for a real
one. That PR's own comment predicted this one: *"a port that quietly returned the fallback would be
indistinguishable from this one on any test the fallback path can run."*

## It is not one file: 54 occurrences across 15 landed files

Counting, over `origin/main`, bare `void X;` statements where `X` is a **throwing stub defined in the
same file**:

    files containing a bare `void X;`                                   157
    occurrences where X is a THROWING stub in the same file              54

     15  raw-port/src/render/HGComputeDeltaE.ts
      8  raw-port/src/render/HGEnhanceDetails.ts
      6  raw-port/src/render/HGAntiAlias.ts
      5  raw-port/src/channels/OZChannelQuadPercent.ts
      4  raw-port/src/infra/PCBinaryXMLReadStream.ts
      3  raw-port/src/channels/CrossCorrelation.ts
      2  raw-port/src/channels/AUGainStage.ts   2  raw-port/src/infra/PCMatrixErrorException.ts
      1  each: BWF_Parser, FFAudioDuckingClipInfo, HGSignPost_EventScopeGuard, PCEvaluator,
            PCUUID, HGColorGammaLUTInfo, HGDenoisePDEIteration

The remaining ~100 files use the idiom for its innocent purpose — `void ctx; void out;` to silence
`noUnusedLocals` on a parameter — which is why a blanket ban is the wrong fix.

`HGComputeDeltaE.ts` states the hazard in its own words, under a heading:

    // Unused-import suppressions — every frontier stub is exported into the module's TDZ so
    // future callers replacing them with real transcriptions have a stable reference target.
    // Silence tsc's noUnusedLocals for the ones GetOutput/ConvertTo* would call IF THEY WERE
    // FULLY WIRED.
    void HGObject_operatorNew;  void HGNode_C2;  void HGNode_SetInput;  void vtable_0x10_Retain;  …

"if they were fully wired" is the admission: the methods that should call those stubs do not.

**And one use in that same file is defensible**, which is why this needs judgement rather than a
regex verdict: at line 577 the D0 tail's `void HGObject_operatorDelete;` carries the reasoning that
calling it there would fire the throw on every NON-deleting dtor path too. That is a real argument;
it should be a comment, not a statement that reads as a reference.

## Why nothing catches it

* **G5 / reach fuzz**: a body that never throws is not an incompleteness cheat. `void X;` evaluates
  its operand and discards it — it does not call `X` — so the fuzz sees a clean, throw-free body.
* **G6 add-only**: nothing is dropped.
* **The frontier/dependency scanners**: they are the *target*. The comment in `PCBinaryXMLReadStream`
  says so explicitly. A scanner counting identifier references cannot distinguish a reference from a
  call.
* **An oracle**: only if it drives the branch the stub belongs to. The fallback branch answers
  identically in both the honest and the cheating port, which is exactly why #685's harness says out
  loud that it could not build a live-RTTI object for the file branch.

## Fix

1. **Re-port `PCBinaryXMLReadStream::getURL`** in the shape #685 uses: call the RTTI stub where the
   machine calls it. It is a five-line change to a landed method, so it wants its own PR and a
   reviewer who re-derives 0x65290 — and the ledger unit for it should not be left counted as
   `ported` in the meantime.
2. **A guard worth adding, and it can be precise**: reject a bare `void <ident>;` when `<ident>`
   resolves to a function *in the same file whose body throws*. That is the 54, and it leaves the
   ~100 innocent parameter suppressions alone. Wire it into `pr_gate` on the delta
   (`--new-only`), like `check_duplicate_classes`, so the existing 54 do not red-gate every PR —
   and **watch it fail once** on `PCBinaryXMLReadStream.ts` before trusting it.
3. **Reviewer-side, now**: when a port defers a callee, check that the deferral is *reachable*.
   `grep -n 'void [A-Za-z_]' <file>` costs nothing, and a frontier stub that is only ever named in a
   `void` statement is a call the port does not make.
