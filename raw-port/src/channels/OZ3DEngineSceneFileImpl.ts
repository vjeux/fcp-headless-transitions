// OZ3DEngineSceneFileImpl.ts — raw transcription of Ozone `OZ3DEngineSceneFileImpl`.
//
// The base implementation behind `OZ3DEngineSceneFile` (the 3D-scene file object Ozone reads a
// scene asset through). One symbol is transcribed in this file: the virtual hook
// `postReadMedia()`. Every OTHER member of the class — the two constructors @0x3bc0c0/@0x3bc250,
// the destructor @0x3bc430, `readFile(bool)` @0x3bae40, `getFileState()` @0x3baf10,
// `get3DScene()` @0x3bb200, `setURL(PCURL const&)` @0x3bc550, `setFileState(...)` @0x3bc5f0,
// `getOriginalFileDurationInSeconds()` @0x3bc620, `dirty()` @0x3bc540 and the rest of the 23
// symbols the inventory lists — is a SEPARATE ledger unit and is deliberately ABSENT rather than
// stubbed; each gets ADDED to this file when its own unit is claimed (one class = one file, G6
// add-only). Two of them are quoted below AS EVIDENCE; neither is transcribed here.
//
// Provenance (Ozone framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone):
//
//   @0x3c0950  OZ3DEngineSceneFileImpl::postReadMedia()
//                __ZN23OZ3DEngineSceneFileImpl13postReadMediaEv   (inventory: `t`, local)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN23OZ3DEngineSceneFileImpl13postReadMediaEv Ozone`):
//   raw-port/re/disasm/__ZN23OZ3DEngineSceneFileImpl13postReadMediaEv.s (7 lines)
//
// ---------------------------------------------------------------------------------------------
// FULL DISASM — the entire function, with the raw bytes
// ---------------------------------------------------------------------------------------------
//
//   0x3c0950  55                    pushq %rbp                ; prologue
//   0x3c0951  48 89 e5              movq  %rsp,%rbp
//   0x3c0954  b0 01                 movb  $0x1,%al            ; the return value: true
//   0x3c0956  5d                    popq  %rbp                ; epilogue
//   0x3c0957  c3                    retq
//   0x3c0958  0f 1f 44 00 00        nopl  (%rax,%rax)         ; alignment padding, not executed
//
// Six instructions, one of which does anything: the function returns the constant `true` in %al and
// touches nothing. No field is read, no field is written, there is no branch, no call, no indirect
// or virtual dispatch (`depgraph.py deps` lists nothing for this symbol). `movb $0x1,%al` writes
// only the low byte, which is how a `bool` return is passed — hence `boolean` and `true`, not `1`.
//
// ---------------------------------------------------------------------------------------------
// WHY A FUNCTION THAT RETURNS A CONSTANT IS STILL A REAL PORT: IT IS A VIRTUAL DEFAULT
// ---------------------------------------------------------------------------------------------
// This is **slot 15 of the class's vtable**, and a sibling class overrides it with a real body. Both
// halves of that are read out of __DATA_CONST rather than inferred from the names:
//
//   * the constructor `OZ3DEngineSceneFileImpl(OZ3DEngineSceneFile&, PCURL const&)` @0x3bc0c0
//     installs `leaq 0x49c0ea(%rip),%rax ; movq %rax,(%rdi)` @0x3bc0d7/@0x3bc0de, i.e. the pointer
//     0x3bc0de + 0x49c0ea = **0x8581c8**. Slot 15 of that table (chained-fixup words, low bits) is
//     **0x3c0950** — this function.
//   * the constructor `OZ3DEngineSceneFileImplUSDZ(OZ3DEngineSceneFile&, PCURL const&)` @0x3bd7f0
//     installs `leaq 0x49aaaa(%rip),%rax` @0x3bd7ff, i.e. 0x3bd806 + 0x49aaaa = **0x8582b0**, whose
//     slot 15 is **0x3c0870** — `OZ3DEngineSceneFileImplUSDZ::postReadMedia()`, a 60-instruction
//     body that allocates an `MDLAsset` from the object's +0x80, sends it a chain of ObjC messages,
//     records the result at +0x128, sets the flag at +0x124, and — this is the part that matters
//     here — returns **0** (`xorl %eax,%eax` @0x3c091e) when any link of that chain is nil.
//
// So the contract of the virtual is "the media was read successfully", the USDZ subclass computes
// it and can answer false, and THIS class is the base whose answer is unconditionally true. The two
// neighbouring slots are the same shape: slot 13 `willDoCollectOperation(NSString*)` @0x3c0930 and
// slot 14 `didDoCollectOperation(OZCopyFootageInfo*)` @0x3c0940 are both empty bodies
// (`pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq`) — a row of do-nothing defaults. Transcribing
// the constant is therefore the whole of this unit, and "returns true" is the behaviour, not a gap:
// nothing here is deferred and nothing is stubbed.
//
// ---------------------------------------------------------------------------------------------
// ORACLE — EXECUTED against live Final Cut Pro, and against THIS FILE, not read:
//   raw-port/re/oracle/OZ3DEngineSceneFileImpl_postReadMedia_oracle.py
//   raw-port/re/oracle/OZ3DEngineSceneFileImpl_postReadMedia_driver.mts
//
// A constant-returning body needs its INSTRUMENT proved before its answer means anything — a
// harness that cannot see any other value would report PASS on a function that returns nothing at
// all. Following the recipe this project already recorded for exactly this case, the harness runs
// two controls through the IDENTICAL `CFUNCTYPE` and the identical (empty) argument tuple:
//
//   1. A SAME-CLASS SIBLING WHOSE ANSWER THE HARNESS CHOOSES: `getFileState()` @0x3baf10 is
//      `movl 0xc0(%rdi),%eax ; retq`, so planting a value at +0xc0 of the arena makes the call
//      return whatever the harness wants — 0, 1, 7, 0xff, 0x2a — through the same call path. A
//      harness that can only ever produce 1 fails this.
//   2. THE REAL OVERRIDE OF THE SAME VIRTUAL: `OZ3DEngineSceneFileImplUSDZ::postReadMedia()`
//      @0x3c0870, called on a zeroed arena so its ObjC chain takes the nil path and returns 0. It
//      runs in a SEPARATE PROCESS (the oracle re-executes itself with `--usdz-control`, again under
//      `arch -x86_64`), because it messages the ObjC runtime and a crash there must not take the
//      harness with it; if that child dies, the control reports INCONCLUSIVE and the run's verdict
//      says so rather than quietly dropping it. A `fork()` is NOT sufficient and was measured to be
//      wrong here: the parent has already initialised the ObjC runtime by loading Ozone, so the
//      forked child aborts with `+[NSUnitLength initialize] may have been in progress in another
//      thread when fork() was called`. That is filed as its own ops entry.
//
// The symbol is LOCAL (`t`), so it is called BY ADDRESS at
// `_dyld_get_image_vmaddr_slide(Ozone) + 0x3c0950` under `arch -x86_64` — the port is transcribed
// from the x86_64 slice and a natively loaded image is arm64 (the slice trap) — after asserting the
// 8 opcode bytes `554889e5b0015dc3` above. The `0f1f840000000000` padding that follows is asserted
// separately and labelled not-executed, because the first draft of the harness TYPED those padding
// bytes from the listing instead of reading them, guessed the wrong `nopl` encoding, and the
// assertion refused the live image — which is the check doing its job, and the reason the numbers
// in this file are read from the slice rather than transcribed by eye. Ozone needs its `@rpath`
// chain preloaded recursively (44 images), which the harness does with a depth-first `otool -L`
// walk.
//
// MEASURED 2026-08-11 at Ozone slide 0x124d9f000 — VERIFIED, 0 checks failed:
//   * the port returns `true` and live Ozone returns 1 on every one of 8 arenas (0x00-, 0xCD- and
//     0xFF-poisoned, plus arenas with +0xc0 planted at 0/1/7/0xff/0x2a) — the answer does not
//     depend on the object, which is the claim;
//   * every arena is byte-identical after the call: the function writes nothing;
//   * CONTROL 1 returned 0, 1, 7, 255 and 42 — the instrument can see values other than 1;
//   * CONTROL 2 (the USDZ override, separate process) returned **0** — the instrument can see a
//     DIFFERENT ANSWER coming out of this very virtual;
//   * the `alwaysFalse` mutant of the port diverges on all 8 cases.

/**
 * `OZ3DEngineSceneFileImpl` — the base implementation behind `OZ3DEngineSceneFile`.
 *
 * Only the virtual at @Ozone 0x3c0950 is transcribed in this file, and it reads no field, so this
 * class deliberately models NO state. Fields arrive with the units that ground them (the
 * constructors and `getFileState`, which is the only reason +0xc0 is named in the file header at
 * all — as the oracle's control, not as a field of this port).
 */
export class OZ3DEngineSceneFileImpl {
  /**
   * `OZ3DEngineSceneFileImpl::postReadMedia()` — @Ozone 0x3c0950
   * (`__ZN23OZ3DEngineSceneFileImpl13postReadMediaEv`), **vtable slot 15**.
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x3c0950  pushq %rbp             ; frame setup (no TS counterpart)
   *   0x3c0951  movq  %rsp,%rbp        ; frame setup (no TS counterpart)
   *   0x3c0954  movb  $0x1,%al         ; the whole body: the return value is the constant true
   *   0x3c0956  popq  %rbp             ; frame teardown (no TS counterpart)
   *   0x3c0957  retq
   *   0x3c0958  nopl  (%rax,%rax)      ; alignment padding, not executed
   *
   * The base class's answer to "did the media read finish successfully?" is unconditionally yes.
   * `OZ3DEngineSceneFileImplUSDZ` overrides the same slot @0x3c0870 with a body that can answer
   * false; the file header derives both slot numbers from the vtables the two constructors install.
   *
   * `movb $0x1,%al` writes the low byte only — the SysV ABI's `bool` return — so the port returns
   * `true` rather than the number 1.
   *
   * NO STATE IS TOUCHED: no load, no store, no branch, no call. The oracle checks that by
   * byte-comparing a poisoned arena after the call rather than trusting the listing.
   *
   * @returns `true`, always.
   */
  postReadMedia(): boolean {
    // @0x3c0954  movb $0x1,%al — the entire body.
    return true;
  }
}
