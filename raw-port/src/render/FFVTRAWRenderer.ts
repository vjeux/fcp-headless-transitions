// FFVTRAWRenderer.ts — thin C++ wrapper around a pair of Objective-C rendering objects that
// convert a CVPixelBuffer (RAW camera frame) into a processed frame via VideoToolbox. Transcribed
// from FCP Flexo framework (Final Cut Pro.app/.../Flexo). All three exported methods drive
// Objective-C `objc_msgSend`/`objc_release` calls — the class holds no non-ObjC state besides
// its vtable pointer and two `id` fields.
//
// DECODE: raw-port/re/disasm/Flexo.FFVTRAWRenderer.newProcessedFrame.s
//         raw-port/re/disasm/Flexo.FFVTRAWRenderer.dtorD0.s
//         raw-port/re/disasm/Flexo.FFVTRAWRenderer.dtorD1.s
//
// Struct layout (recovered from field reads in all three methods):
//   +0x00  vtable*             (movq $vtable, (%rdi) at dtor entry — both D0/D1 write the same
//                               vtable to reset the vptr after base-subobject dtors run).
//   +0x08  id     objc_field_08  (objc_release'd in both dtors; @0x764553/@0x764593)
//   +0x10  id     objc_field_10  (objc_release'd in both dtors; @0x76455d/@0x76459d; also the
//                               receiver of the FIRST selector call in newProcessedFrame at
//                               0x7644c9 and the pivot receiver for the 3 chained sends at
//                               0x7644f2/0x764503/0x764507/0x764515)
// No other member offsets are read anywhere in the three disasms; sizeof ≥ 0x18 is all that's
// observable.
//
// Frontier — un-decoded ObjC message chain in newProcessedFrame:
//   - First send: receiver = self->objc_field_10, selref located at RIP+0x14749ec (a
//     __objc_selrefs table entry). The disassembler's SEL-name annotation on that instruction
//     (`requestedSizeForAssetSize:...`) is not verified — reading __objc_selrefs → __objc_methname
//     to recover the SEL bytes is a separate task and NOT done here.
//   - r12 = objc_msgSend loaded via GOT at 0x7644e5 (`movq 0x11891d4(%rip),%r12`).
//   - Then four calls through r12 with selrefs at RIPs 0x146f60b, 0x14749cb, 0x14749be, 0x14749b8
//     — the arguments are threaded via %rdx from previous return values (`movq %rax,%rdx`), so
//     this is a chained-message pipeline. Without the selref bytes decoded, we can only surface
//     the structure, not the semantic — throw-stub.
//
// No vtable methods appear in these three functions — all dispatch is either direct (dtor)
// or through ObjC selectors. The class DOES have a vtable (written at 0x764549 and 0x764589)
// but no method resolved through it here.

/**
 * Opaque handle to an Objective-C object that this class owns (retain/release semantics).
 * Modelled as an unknown-shape placeholder; the actual concrete class comes from the FCP
 * VideoToolbox/CoreMedia bridge and would need __objc_selrefs decoding to identify.
 */
export type ObjCId = unknown;

/**
 * Opaque handle to a CVPixelBuffer (CoreVideo). newProcessedFrame accepts one and passes it as
 * the last %rdx arg into the final chained msgSend at 0x764520.
 * @frontier CoreVideo public API type __CVBuffer — modelled as opaque.
 */
export type CVBufferRef = unknown;

/**
 * HGMTLDeviceType — Helium's Metal-device-selection enum. Passed as arg2 (%rsi = %r15) into
 * newProcessedFrame but never read as a scalar within the method itself; it's forwarded verbatim
 * as the first non-self, non-SEL arg to the FIRST msgSend at 0x7644ec (`movq %r15,%rdi`) — which
 * looks wrong (rdi = receiver, not arg) — actually %r15 is the receiver of that call, so the
 * first call is `[<HGMTLDeviceType-object>  <selref@0x146f60b>]`. HGMTLDeviceType here is thus
 * an ObjC-typed reference, not a raw enum. Modelled as ObjCId.
 * @frontier Helium HGMTLDeviceType — un-decoded, boxed as ObjCId in this method's ABI use.
 */
export type HGMTLDeviceType = ObjCId;

export class FFVTRAWRenderer {
  /** +0x08 — an owned ObjC `id` (released in dtor). Concrete class un-decoded. */
  objc_field_08: ObjCId | null = null;
  /** +0x10 — an owned ObjC `id` (released in dtor); also the receiver of the ObjC pipeline in
   *  newProcessedFrame. Concrete class un-decoded. */
  objc_field_10: ObjCId | null = null;

  /**
   * FFVTRAWRenderer::newProcessedFrame(HGMTLDeviceType, __CVBuffer*) const
   * @Flexo 0x00000000007644b0  (__ZNK15FFVTRAWRenderer17newProcessedFrameE15HGMTLDeviceTypeP10__CVBuffer)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFVTRAWRenderer.newProcessedFrame.s):
   *   0x7644bb-0x7644be  testq %rdx,%rdx ; je 0x764530 — if buffer == NULL, jump to return-zero.
   *   0x7644c0-0x7644c6  save args: rbx=buffer, r15=HGMTLDeviceType, r14=this.
   *   0x7644c9           rdi = *(this+0x10)  — receiver = objc_field_10.
   *   0x7644cd           rsi = selref@RIP+0x14749ec  — un-decoded SEL.
   *   0x7644d4           callq *(RIP+0x11891e6) — indirect through GOT slot for _objc_msgSend
   *                      (disassembler comment tags the receiver's selector name as
   *                      `requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:`
   *                      but does not verify — the same objc_msgSend GOT slot serves every
   *                      selector, so the SEL bytes must be read from __objc_selrefs at
   *                      RIP+0x14749ec to confirm the name).
   *   0x7644da-0x7644dc  testb %al,%al ; je 0x764530 — if it returned false/nil, return NULL.
   *   0x7644de-0x7644e5  load r12 = _objc_msgSend (indirect via GOT); rsi = selref@RIP+0x146f60b.
   *   0x7644ec-0x7644ef  callq *r12 with rdi=r15 (HGMTLDeviceType) — one-arg send on the type.
   *                      Result -> rax.
   *   0x7644f2-0x764500  rdi = *(this+0x10), rsi = selref@RIP+0x14749cb, rdx = rax (previous
   *                      result). Two-arg send. Result -> rax.
   *   0x764503-0x764512  rdx = *(this+0x08) (objc_field_08), rdi = *(this+0x10),
   *                      rsi = selref@RIP+0x14749be. Two-arg send. Result -> rax.
   *   0x764515-0x76452e  rdi = *(this+0x10), rsi = selref@RIP+0x14749b8, rdx = buffer (rbx).
   *                      Tail-jmp *r12 (jmpq *%rax at 0x76452e — where rax was set to r12 at
   *                      0x764523). Tail-call to objc_msgSend — return value of that send is
   *                      the return value of newProcessedFrame.
   *   0x764530-0x76453a  return NULL (xor eax,eax; epilogue).
   *
   * The four selrefs at __objc_selrefs offsets 0x14749ec, 0x146f60b, 0x14749cb, 0x14749be, 0x14749b8
   * are NOT DECODED here (reading __objc_selrefs requires a separate pass over Flexo's
   * __TEXT.__objc_methname → __DATA.__objc_selrefs mapping). Any implementation of the ObjC
   * pipeline without those SEL bytes would not be a faithful decode of the receiver behavior.
   *
   * @frontier __objc_msgSend chain (5 sends, un-decoded selectors) at 0x7644d4/0x7644ef/0x764500/
   *           0x764512/tail-0x76452e (via jmpq *%rax).
   */
  newProcessedFrame(_hgmtlDeviceType: HGMTLDeviceType, buffer: CVBufferRef | null): ObjCId | null {
    // 0x7644bb-0x7644be — early-out on NULL buffer. This is decidable and correct to transcribe.
    if (buffer === null || buffer === undefined) {
      // 0x764530 — return NULL (xor eax,eax).
      return null;
    }

    // 0x7644c9-0x7644dc — first probe msgSend on objc_field_10; if false-y, return NULL.
    // The selector is un-decoded (selref@0x14749ec). Surface as a throw so callers cannot
    // silently get a wrong answer.
    throw new Error(
      "FFVTRAWRenderer::newProcessedFrame @0x7644b0 drives an un-decoded ObjC message chain " +
      "(5 objc_msgSend calls with selrefs at __objc_selrefs offsets 0x14749ec, 0x146f60b, " +
      "0x14749cb, 0x14749be, 0x14749b8; see raw-port/re/disasm/Flexo.FFVTRAWRenderer." +
      "newProcessedFrame.s). Decoding requires reading Flexo's __objc_selrefs → __objc_methname " +
      "mapping to recover the SEL bytes.",
    );
  }

  /**
   * FFVTRAWRenderer::~FFVTRAWRenderer()   [complete-object destructor, D1]
   * @Flexo 0x0000000000764540  (__ZN15FFVTRAWRendererD1Ev)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFVTRAWRenderer.dtorD1.s):
   *   0x764549-0x764550  Reset vptr: `leaq 0x11a11c0(%rip),%rax ; movq %rax,(%rdi)`. The RIP
   *                      target lands at Flexo's __DATA_CONST for FFVTRAWRenderer's vtable
   *                      (offset from D1 = 0x764549 → address 0x1905710; the vtable's second
   *                      slot i.e. offset +0x10 from the vtable base). This is the standard
   *                      "restore this base class vtable so any virtual call in the tail of the
   *                      dtor doesn't dispatch to a derived override" pattern; in this class
   *                      there ARE no derived overrides read after the vptr write in either
   *                      dtor, so functionally the write is inert. Preserved verbatim.
   *   0x764553-0x764557  rdi = *(this+0x08) ; call *_objc_release  (releases objc_field_08).
   *   0x76455d-0x764561  rdi = *(this+0x10) ; call *_objc_release  (releases objc_field_10).
   *   0x76456e-0x764571  Landing pad: on exception during release, jmp to
   *                      ___clang_call_terminate (per Itanium ABI). No user-visible behavior in
   *                      a well-formed run.
   */
  destroy_D1(): void {
    // 0x764549-0x764550 — vptr reset (no-op in TS; there is no dispatch-through-vptr here).

    // 0x764553-0x764557 — objc_release(objc_field_08). In TS/JS GC there is no manual retain
    // count; document the intent and null the field so any subsequent access is caught.
    this.objc_field_08 = null;

    // 0x76455d-0x764561 — objc_release(objc_field_10).
    this.objc_field_10 = null;
  }

  /**
   * FFVTRAWRenderer::~FFVTRAWRenderer()   [deleting destructor, D0]
   * @Flexo 0x0000000000764580  (__ZN15FFVTRAWRendererD0Ev)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFVTRAWRenderer.dtorD0.s):
   *   Identical body to D1 (same two objc_release calls, same vptr write) EXCEPT the tail:
   *   0x7645a7-0x7645b0  `movq %rbx,%rdi ; jmp __ZdlPv`  — tail-call `operator delete(void*)`
   *                      on `this`. This is the standard C++ deleting-dtor pattern: D0 runs
   *                      D1's body then frees the object's memory.
   *   The vtable base RIP-immediate here (0x11a1180 vs D1's 0x11a11c0 — differs by exactly the
   *   RIP-relative shift between the two dtor entry addresses; both point to the SAME vtable
   *   base in memory — verified by 0x764589+7+0x11a1180 == 0x764549+7+0x11a11c0 == 0x1905710).
   */
  destroy_D0(): void {
    // D0 = D1's body + operator delete(this). In TS the "delete this" step is a GC no-op; we
    // simply call the D1 equivalent.
    this.destroy_D1();
    // 0x7645b0 — jmp __ZdlPv (operator delete) — no analogue in TS/JS runtime.
  }
}
