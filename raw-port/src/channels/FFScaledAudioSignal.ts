// FFScaledAudioSignal.ts — FCP Flexo FFScaledAudioSignal. A "scaled" wrapper
// audio signal: holds ONE inner FFAudioSignal* input and multiplies its
// rendered samples by a constant scalar `scale` (double, converted to
// float32 at processSamples time).
//
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFScaledAudioSignal.FFScaledAudioSignal.s   (@0x1258da0, ctor C1)
//   raw-port/re/disasm/Flexo.FFScaledAudioSignal.copySignal.s            (@0x1258e40, copySignal() const)
//   raw-port/re/disasm/Flexo.FFScaledAudioSignal.processSamples.s        (@0x1258df0, processSamples(float*,u64,u64) const)
//   raw-port/re/disasm/Flexo.FFScaledAudioSignal.isIndefiniteSignal.s    (@0x1259450, isIndefiniteSignal() const)
//   raw-port/re/disasm/Flexo.FFScaledAudioSignal.~FFScaledAudioSignal.s  (@0x1259410, D0 deleting dtor;
//                                                                        D1 base dtor immediately
//                                                                        precedes at @0x12593e0)
//
// SYMBOLS (nm on Flexo, /tmp/Flexo_symmap.tsv — 7 total, matches the ledger):
//   T __ZN19FFScaledAudioSignalC1EP13FFAudioSignald27FFAudioSignalInputOwnership @0x1258da0  (ctor C1)
//   T __ZN19FFScaledAudioSignalC2EP13FFAudioSignald27FFAudioSignalInputOwnership @0x1258da0  (ctor C2 = C1
//                                                                                              — same body,
//                                                                                              flat inheritance)
//   T __ZN19FFScaledAudioSignalD0Ev                                              @0x1259410  (deleting dtor)
//   T __ZN19FFScaledAudioSignalD1Ev                                              @0x12593e0  (base dtor)
//   T __ZNK19FFScaledAudioSignal10copySignalEv                                   @0x1258e40  (clone)
//   T __ZNK19FFScaledAudioSignal14processSamplesEPfyy                            @0x1258df0  (render)
//   T __ZNK19FFScaledAudioSignal18isIndefiniteSignalEv                           @0x1259450  (const-delegate)
//
// STRUCT LAYOUT (recovered from ctor+copySignal+processSamples+D0/D1 field accesses):
//   +0x00  vtable*                    vtbl        // installed at:
//                                                  //   @0x1258db4 (ctor):     leaq 0x6c8bed(%rip) -> 0x19219a8
//                                                  //   @0x1258e75 (copySignal):leaq 0x6c8b2c(%rip) -> 0x19219a8
//                                                  //   @0x1259410 (D0):        leaq 0x6c8591(%rip) -> 0x19219a8
//                                                  //   @0x12593e7 (D1):        leaq 0x6c85ba(%rip) -> 0x19219a8
//                                                  // All four cite the SAME
//                                                  // effective address 0x19219a8 — the vtable body
//                                                  // start (typeinfo+offset-to-top skipped: 0x19219a8
//                                                  // = __ZTV19FFScaledAudioSignal + 0x10).
//   +0x08  uint64                     period      // written zero at @0x1258dac (`xorps %xmm1,%xmm1;
//                                                 //   movups %xmm1,0x8(%rdi)`) then set to
//                                                 //   `input->period` (loaded from input+0x08 via the
//                                                 //   movq at @0x1258de1 `movq 0x8(%rsi),%rax`) as
//                                                 //   part of the same movups pair (%rax is placed
//                                                 //   into 0x8(%rbx) at @0x1258de5). Same shape in
//                                                 //   copySignal (@0x1258e6d zeroes, then
//                                                 //   @0x1258e93/@0x1258e97 write input->period).
//   +0x10  uint64                     __padding   // The 16-byte movups at @0x1258dac writes 8 bytes
//                                                 // of zero at +0x8 AND 8 bytes of zero at +0x10.
//                                                 // The rest of the ported methods never read this
//                                                 // slot; it is either unused or a base-class field
//                                                 // (see FFAudioSignal phase-tracking at +0x10 in the
//                                                 // ported base). Keep as an opaque zero for ABI.
//   +0x18  uint8                      __repeat0   // written zero at @0x1258db0 (`movb $0x0,0x18(%rdi)`).
//                                                 // Same in copySignal @0x1258e71. FFAudioSignal base's
//                                                 // +0x18 "repeat" flag; unused by the four scaled-signal
//                                                 // methods, kept as 0 for parity.
//   +0x20  FFAudioSignal*             input       // written at @0x1258dd8 (`movq %rsi,0x20(%rbx)`)
//                                                 //   from either the raw ctor arg (`own == 0`
//                                                 //   branch, @0x1258dbe/@0x1258dc0) or from the
//                                                 //   result of `input->vtable[+0x10]()` clone
//                                                 //   (`own != 0` branch: @0x1258dc2/@0x1258dcd
//                                                 //   `callq *0x10(%rax)` where %rax = input->vtbl;
//                                                 //   the returned pointer is captured in %rsi at
//                                                 //   @0x1258dd5 and stored at +0x20). Same clone
//                                                 //   pattern in copySignal @0x1258e82 (`callq
//                                                 //   *0x10(%rax)`) with the result stored at
//                                                 //   +0x20 of the new object @0x1258e85.
//                                                 //   Nulled by D1 (`movq $0,0x20(%rax)` @0x12593f5)
//                                                 //   and D0 (`movq $0,0x20(%rdi)` @0x125941e) after
//                                                 //   the input's virtual dtor is dispatched via
//                                                 //   vtable slot +0x08.
//   +0x28  double                     scale       // written at @0x1258ddc (`movsd %xmm0,0x28(%rbx)`)
//                                                 //   from the ctor's second-double-arg (xmm0), and
//                                                 //   copied at @0x1258e8e (`movsd %xmm0,0x28(%rbx)`)
//                                                 //   from the src's +0x28 into the clone. Read at
//                                                 //   @0x1258e0d (processSamples) via
//                                                 //   `movsd 0x28(%r15),%xmm0; cvtsd2ss %xmm0,%xmm0`
//                                                 //   — DOUBLE storage, downcast to FLOAT at use time.
// NOTE: at @0x1258de1/@0x1258de5 and @0x1258e93/@0x1258e97 the code writes an
// 8-byte quad from `input+0x8` into `this+0x8`. In FFSerialAudioSignal that
// slot at +0x8 is `period` (a u64). Consistent shape → +0x8 = period.
//
// PARENT class (frontier — this port does NOT re-decode it):
//   FFAudioSignal — already ported at raw-port/src/channels/FFAudioSignal.ts.
//   The ctor at @0x1258da0 does NOT chain to a base ctor (unlike
//   FFSerialAudioSignal @0x1258580 which calls FFContainerAudioSignal's C2);
//   the entire object is initialized by the four `mov` instructions
//   @0x1258dac..@0x1258dbb (zero +0x8/+0x10/+0x18, install vtbl at +0x0).
//   The parent's fields exist but are all zero-initialized: this is
//   consistent with FFAudioSignal being an abstract base whose only state
//   is vtbl/period/phase/repeat, and FFScaledAudioSignal not needing any
//   of those but +0x08 (which it repurposes as its own period=input->period).
//
// VTABLE (recovered from indirect calls in these methods):
//   +0x08  void ()(FFAudioSignal*)               — virtual dtor. Invoked at:
//                                                    @0x125943e (D0) `callq *0x8(%rcx)` — where
//                                                      %rcx = input->vtbl (@0x1259435
//                                                      `movq (%rax),%rcx`).
//                                                    @0x1259406 (D1) `jmpq *0x8(%rax)` — tail-call
//                                                      after loading %rax = input->vtbl at
//                                                      @0x1259402 `movq (%rdi),%rax`.
//   +0x10  FFAudioSignal* ()(FFAudioSignal*)     — "copy" slot. Invoked at:
//                                                    @0x1258dcd (ctor, own!=0 clone path)
//                                                      `callq *0x10(%rax)` — %rax = input->vtbl.
//                                                    @0x1258e82 (copySignal)
//                                                      `callq *0x10(%rax)` — same slot on the src's
//                                                      inner input to clone it into the new object.
//                                                    (This matches FFAudioSignal's base spec:
//                                                    slot +0x10 = clone/copySignal.)
//   +0x18  bool ()(FFAudioSignal*)               — "isIndefiniteSignal" slot. Tail-jumped at
//                                                    @0x125945c (isIndefiniteSignal)
//                                                      `jmpq *0x18(%rax)` — %rax = input->vtbl
//                                                      (@0x1259458 `movq (%rdi),%rax` where
//                                                      %rdi has already been re-set to input at
//                                                      @0x1259454 `movq 0x20(%rdi),%rdi`).
//                                                    Result: FFScaledAudioSignal delegates its
//                                                      indefinite-signal probe to its input.
//   +0x20  void ()(FFAudioSignal*, float*, u64, u64) — "processSamples" slot. Tail-jumped at
//                                                    @0x1258e33 `jmpq *%rax` (from vtbl slot 0 of
//                                                    sMixerVectorFunctions — see below). NOTE: the
//                                                    call to the INPUT's processSamples happens
//                                                    FIRST via `callq *0x20(%rax)` at @0x1258e0a
//                                                    (%rax = input->vtbl loaded at @0x1258e07
//                                                    `movq (%rdi),%rax`; %rdi had been set to input
//                                                    at @0x1258e03 `movq 0x20(%rdi),%rdi`); this
//                                                    populates the caller's buffer with the raw
//                                                    unscaled samples, and THEN the code jumps to
//                                                    sMixerVectorFunctions[0](buf, (u32)count,
//                                                    (float)scale) to multiply the buffer in-place.
//
// SINGLETON REFERENCE (frontier — resolved by name, not yet transcribed):
//   S __ZN20MixerVectorFunctions21sMixerVectorFunctionsE @0x1c96740 (Flexo, /tmp/Flexo_nm_full.txt).
//   In processSamples this is accessed by the pair @0x1258e17..@0x1258e21:
//     leaq __ZN20MixerVectorFunctions21sMixerVectorFunctionsE(%rip), %rax  ; &sMixerVectorFunctions
//     movq (%rax), %rax     ; deref: %rax = sMixerVectorFunctions (a pointer stored in that global)
//     movq (%rax), %rax     ; deref: %rax = *sMixerVectorFunctions = pointer to a function table
//                            ; (equivalently the vtable of a MixerVectorFunctions object). Slot 0.
//   The tail `jmpq *%rax` @0x1258e33 with args
//     %rdi = float* buf     (@0x1258e24 `movq %r14,%rdi`)
//     %esi = uint32 count   (@0x1258e27 `movl %ebx,%esi` — LOW 32 bits of the u64 count arg;
//                            the native code drops the top half here, consistent with the
//                            MixerVectorFunctions signature taking a `unsigned int`)
//     %xmm0 = float scale   (@0x1258e13 `cvtsd2ss %xmm0,%xmm0` from the double @+0x28)
//   is the "scale-buffer-in-place-by-float" primitive. Its concrete
//   implementation lives in the sMixerVectorFunctions dispatch table and is
//   NOT part of this port unit; represented here as a throwing frontier
//   stub cited by its symbol + address.
//
// CONSTANT PROVENANCE (RIP-relative reads — effective addr = next-insn + disp):
//   @0x1258db4 leaq 0x6c8bed(%rip),%rax -> 0x19219a8   __ZTV19FFScaledAudioSignal+0x10
//   @0x1258e75 leaq 0x6c8b2c(%rip),%rax -> 0x19219a8   (same, from copySignal)
//   @0x1258e7c stores %rax at (%rbx)+0x0 — vtbl slot on the new object.
//   @0x1259410 leaq 0x6c8591(%rip),%rax -> 0x19219a8   (D0)
//   @0x12593e7 leaq 0x6c85ba(%rip),%rax -> 0x19219a8   (D1)
//   @0x1258e17 leaq __ZN20MixerVectorFunctions21sMixerVectorFunctionsE(%rip),%rax
//                                       -> 0x1c96740  (Flexo global — see SINGLETON above)
// No numeric literal constants outside those addresses (period is `input->period`, scale is
// a run-time double from the ctor arg).
//
// FRONTIER CALLEES (each surfaces its cite via a throw-stub or an interface method):
//   * FFAudioSignal input's vtable slot +0x10 (clone)         @0x1258dcd, @0x1258e82
//   * FFAudioSignal input's vtable slot +0x08 (virtual dtor)  @0x125943e (D0), @0x1259406 (D1)
//   * FFAudioSignal input's vtable slot +0x18 (isIndefinite)  @0x125945c
//   * FFAudioSignal input's vtable slot +0x20 (processSamples)@0x1258e0a
//   * MixerVectorFunctions::sMixerVectorFunctions vtable[0]   @0x1258e17/@0x1258e33
//   * operator new(size_t=0x30) — __Znwm @0x1497452           (copySignal alloc)
//   * operator delete(void*)   — __ZdlPv @0x1497404           (D0 tail)
//   * __Unwind_Resume          @0x1495d30                     (copySignal cleanup landing pad)

import { FFAudioSignal, FFAudioSignalVTable } from "./FFAudioSignal";

/**
 * Ownership enum passed to the FFScaledAudioSignal ctor. In the native binary
 * it is a 32-bit integer compared strictly against 0:
 *   `testl %edx,%edx; jne clone_path` @0x1258dbe/@0x1258dc0
 * — so any nonzero value routes through the input's clone slot, and 0 stores
 * the raw input pointer verbatim. The enum's concrete tag values are opaque
 * to this class (the base ctor which normally consumes them isn't even
 * called by this class). We keep the type as a `number` for ABI parity.
 */
export type FFAudioSignalInputOwnership = number;

/**
 * Frontier stub for the sMixerVectorFunctions[0] scale-buffer primitive.
 *
 * @Flexo 0x1c96740 — __ZN20MixerVectorFunctions21sMixerVectorFunctionsE
 *   (a global storing a pointer to a MixerVectorFunctions instance; slot 0
 *   of its function table is the in-place buffer-scale primitive).
 *
 * Invoked from FFScaledAudioSignal::processSamples @0x1258e33 via
 *   jmpq *%rax   ; %rax = *(*(sMixerVectorFunctions)) = table_base[0]
 * with signature `void (float* buf, uint32_t count, float scale)` — the buffer
 * of `count` floats at `buf` is multiplied in-place by `scale`.
 *
 * Not yet transcribed here (its concrete implementation isn't reachable from
 * only these 7 FFScaledAudioSignal methods' disasm; it needs the
 * MixerVectorFunctions vtable/impl to be brought in as a separate port unit).
 */
function sMixerVectorFunctions_slot0_scaleBuffer(
  _buf: Float32Array,
  _count: number,
  _scale: number,
): void {
  throw new Error(
    "MixerVectorFunctions::sMixerVectorFunctions vtable slot 0 (in-place buffer scale by float) @Flexo 0x1c96740 not yet transcribed — invoked from FFScaledAudioSignal::processSamples @0x1258e33 as jmpq *%rax with (float* buf, uint32 count, float scale)",
  );
}

/**
 * FFScaledAudioSignal — inner FFAudioSignal* + scalar multiplier.
 *
 * Extends the ported FFAudioSignal base for structural fidelity (the vtable
 * at +0x00 is a FFScaledAudioSignal-specific table, but the object shares
 * the FFAudioSignal in-memory prefix — the ctor writes zero into +0x08 /
 * +0x10 / +0x18 exactly as the base ctor would). We do NOT re-stub the
 * base: PORTING_SPEC rule "if a class subclasses an ALREADY-LANDED base
 * IMPORT the real base".
 */
export class FFScaledAudioSignal extends FFAudioSignal {
  /**
   * Struct @+0x20 — pointer to the wrapped FFAudioSignal. Either the raw
   * ctor arg (own == 0) or a clone produced via input.vtbl[+0x10] (own != 0).
   */
  input!: FFAudioSignal;

  /**
   * Struct @+0x28 — double-precision scale. Downcast to float32 at
   * processSamples time via `cvtsd2ss` @0x1258e13.
   */
  scale: number = 0;

  /**
   * @Flexo 0x1258da0 FFScaledAudioSignal::FFScaledAudioSignal(
   *   FFAudioSignal* input, double scale, FFAudioSignalInputOwnership own)
   *
   * C1 and C2 are byte-identical (`__ZN...C1EP13FFAudioSignald27FFAudioSignal
   * InputOwnership` and `__ZN...C2EP...` both map to @0x1258da0 in the
   * symbol map). Body (27 instructions):
   *   @0x1258da0..a5   push rbp/rbx/rax                    ; prologue
   *   @0x1258da6      mov  rbx, rdi                        ; this -> rbx
   *   @0x1258da9..b3  xorps xmm1,xmm1; movups xmm1,8(rdi); mov b(0)@0x18(rdi)
   *                                                       ; zero this+0x08/+0x10 (16B) and this+0x18 (1B)
   *   @0x1258db4..bb  lea rax,[rip+0x6c8bed] -> 0x19219a8; mov rax,(rdi)
   *                                                       ; install vtbl at this+0x00
   *   @0x1258dbe..c0  test edx,edx; jne 0x1258dd8         ; if (own != 0) goto clone
   *   ;; own == 0 path (fallthrough) — no clone, no call
   *   @0x1258dc2      mov  rax,(rsi)                       ; rax = input->vtbl
   *                                                       ; (loaded but unused on this path —
   *                                                        the mov gets overwritten by the
   *                                                        clone path's return; compiler emitted
   *                                                        this speculatively as part of setup for
   *                                                        the potential clone call.)
   *   @0x1258dc5      mov  rdi,rsi                         ; rdi = input
   *   @0x1258dc8      movsd xmm0,-0x10(rbp)                ; spill&reload of scale
   *                                                       ; (rbp-0x10 was written earlier by the
   *                                                        clone-path prologue that hasn't run —
   *                                                        this instruction is on a merged path
   *                                                        that HAS run the pre-call spill, i.e.
   *                                                        only reachable from the clone branch.
   *                                                        See branch analysis below.)
   *   @0x1258dcd      call *0x10(rax)                      ; rax = input's clone (via slot +0x10)
   *   @0x1258dd0      movsd xmm0,-0x10(rbp)                ; reload scale after the call
   *   @0x1258dd5      mov  rsi,rax                         ; rsi = cloned input
   *   ;; merge
   *   @0x1258dd8      mov  0x20(rbx),rsi                   ; this->input = rsi
   *   @0x1258ddc      movsd 0x28(rbx),xmm0                 ; this->scale = xmm0 (the double arg)
   *   @0x1258de1      mov  rax,0x8(rsi)                    ; rax = rsi->period (u64 at +0x8)
   *   @0x1258de5      mov  0x8(rbx),rax                    ; this->period = rax
   *   @0x1258de9..ef  epilogue+ret
   *
   * BRANCH-ANALYSIS NOTE: LLVM emitted this ctor with the `own != 0` branch
   * FLOWING THROUGH the merge point, not fanning to two returns. Both paths
   * end up executing @0x1258dd8..@0x1258de5 unconditionally. What differs:
   *   own == 0: `mov rsi,rsi` is a no-op (rsi already = input) — @0x1258dc0
   *             jne is NOT taken, so we fall THROUGH @0x1258dc2..dd5 which
   *             at that point ISN'T the clone path — but LLVM has arranged
   *             the layout so those 5 instructions ARE the clone-call
   *             sequence, only reached via the taken branch. Re-reading the
   *             disasm: `jne 0x1258dd8` @0x1258dc0 SKIPS @0x1258dc2..dd5
   *             (the clone-call block) and jumps DIRECTLY to the merge.
   *             So own == 0 -> rsi stays = input arg. own != 0 -> the block
   *             clones it and rsi := cloned input.
   *
   * (The confusing bit above was a misread of the branch target polarity.
   * Correcting: `jne 0x1258dd8` = jump-if-nonzero-DEDX, which on this
   * layout SKIPS the clone. Wait — LLVM's own-enum semantics say
   * `own == 0` == "take ownership as-is" and `own != 0` == "clone". The
   * skip-clone-on-nonzero polarity contradicts that. Re-examining:
   *   testl %edx,%edx  ; ZF = (edx == 0)
   *   jne label        ; jump if ZF = 0 i.e. edx != 0
   * So `jne 0x1258dd8` = "if own != 0, skip the block" = "if own != 0, DON'T
   * clone, just install the raw pointer." That means `own == 0` is the CLONE
   * path here, i.e. the enum tag 0 is the "make a copy" case and any
   * nonzero tag is "take the pointer verbatim." We faithfully preserve
   * this native polarity — see the ternary branch below.)
   */
  constructor(input: FFAudioSignal, scale: number, own: FFAudioSignalInputOwnership) {
    // @0x1258db4/bb — install vtbl @0x19219a8. In TS, our class identity IS
    // the vtable; the FFAudioSignal base ctor sets `this.vtbl` to the base
    // shape and we override the polymorphic entrypoints below. We do NOT
    // set `this.vtbl` here because the FFScaledAudioSignal-specific vtable
    // is materialized by the concrete method overrides in this class
    // (copySignal / isIndefiniteSignal / processSamples), not by a runtime
    // pointer field. See the FFScaledAudioSignalVTable adapter at the end
    // of this file which supplies FFAudioSignalVTable-shaped delegation for
    // callers that dispatch via the base's interface.
    super();

    // @0x1258da9..b3 — zero this+0x08 / this+0x10 / this+0x18 (base's
    // period / phase / repeat). Faithful:
    this.period = 0n;         // +0x08
    this.phase = 0n;          // +0x10
    this.repeat = 0;          // +0x18

    // @0x1258dbe/c0 branch — see BRANCH-ANALYSIS above.
    //   own != 0 -> take raw input                (native: skips the clone block)
    //   own == 0 -> clone input via vtbl slot +0x10 (native: falls through into it)
    let stored: FFAudioSignal;
    if (own !== 0) {
      // @0x1258dc0 jne taken — clone block skipped.
      stored = input;
    } else {
      // @0x1258dc2..dd5 clone-call block:
      //   rax = input->vtbl (@0x1258dc2)
      //   rdi = input       (@0x1258dc5)
      //   call *0x10(rax)   (@0x1258dcd)  — vtable slot +0x10
      //   rsi = returned clone (@0x1258dd5)
      // FFAudioSignal exposes slot +0x10 as `copySignal` (per the ported
      // base's VTABLE docblock: "slot +0x10 = clone"). Dispatch through
      // the base's clone entry, which throws if the concrete subclass
      // hasn't ported it — the correct frontier signal.
      // We downcast the return to FFAudioSignal to mirror the C++ dispatch;
      // the copySignal() contract on the concrete subclass returns the
      // same type.
      const cloned = (input as unknown as { copySignal(): FFAudioSignal }).copySignal();
      stored = cloned;
    }

    // @0x1258dd8      mov 0x20(rbx),rsi
    this.input = stored;
    // @0x1258ddc      movsd 0x28(rbx),xmm0 — scale is stored as double.
    this.scale = scale;
    // @0x1258de1/e5   this->period = stored->period (u64 copy at +0x8).
    this.period = stored.period;
  }

  /**
   * @Flexo 0x1258e40 FFScaledAudioSignal::copySignal() const
   *   (__ZNK19FFScaledAudioSignal10copySignalEv)
   *
   * Body (37 instructions):
   *   @0x1258e40..47 prologue+alloca(0x10)
   *   @0x1258e4b     mov  r14,rdi                          ; r14 = this (source)
   *   @0x1258e4e..53 mov  edi,0x30; call __Znwm            ; operator new(48) -> rax
   *   @0x1258e58     mov  rbx,rax                          ; rbx = new object
   *   @0x1258e5b     mov  rdi,0x20(r14)                    ; rdi = this->input
   *   @0x1258e5f     movsd xmm0,0x28(r14)                  ; xmm0 = this->scale (double)
   *   @0x1258e65     movsd -0x18(rbp),xmm0                 ; spill scale across the potential-throw call
   *   @0x1258e6a..71 xorps xmm0,xmm0; movups xmm0,0x8(rax); movb 0,0x18(rax)
   *                                                       ; zero new+0x08/+0x10/+0x18 (mirrors ctor init)
   *   @0x1258e75..7c lea rax,[rip+0x6c8b2c]->0x19219a8; mov (rbx),rax
   *                                                       ; install vtbl on new object
   *   @0x1258e7f     mov  rax,(rdi)                        ; rax = this->input->vtbl
   *   @0x1258e82     call *0x10(rax)                       ; input->copySignal() slot +0x10
   *   @0x1258e85     mov  0x20(rbx),rax                    ; new->input = clone
   *   @0x1258e89..8e movsd xmm0,-0x18(rbp); movsd 0x28(rbx),xmm0
   *                                                       ; new->scale = this->scale
   *   @0x1258e93     mov  rax,0x8(rax)                     ; rax = clone->period (at +0x08)
   *   @0x1258e97     mov  0x8(rbx),rax                     ; new->period = clone->period
   *   @0x1258e9b..a6 mov rax,rbx; epilogue+ret             ; return new object
   *   ;; exception cleanup landing pad @0x1258ea7..b5:
   *   ;;   if __Znwm succeeded but the input clone threw, delete(new) via __ZdlPv
   *   ;;   then __Unwind_Resume — faithful to native but not needed in TS (JS throws
   *   ;;   simply propagate; the new object is garbage-collectible).
   *
   * NOTE: `mov rax,0x8(rax)` @0x1258e93 dereferences the CLONE (whose
   * pointer was just returned at @0x1258e82 into rax) — not `this`. That
   * matches C++ semantics: after cloning the child, the parent's period
   * caches the CLONE's period. In our port we read `clone.period` for
   * exactly the same reason.
   */
  copySignal(): FFScaledAudioSignal {
    // @0x1258e82 — call input's clone (vtable slot +0x10). Uses the base's
    // exposed `copySignal()` entrypoint, which throws if the concrete
    // subclass has not been ported — the correct frontier signal.
    const clone = (this.input as unknown as { copySignal(): FFAudioSignal }).copySignal();

    // Materialize the new FFScaledAudioSignal. We reuse the ctor with
    // `own != 0` to install the ALREADY-CLONED pointer verbatim (avoiding
    // a double-clone), then overwrite `.scale` and `.period` per the native
    // sequence. This mirrors the effect of the 37-line native body
    // (which builds the object field-by-field rather than via a ctor call).
    const out = new FFScaledAudioSignal(clone, this.scale, /* own= */ 1);

    // @0x1258e93/@0x1258e97 — the native code re-reads the clone's period
    // AFTER the clone call and copies it. Our ctor already did the same
    // (this.period = stored.period), so the two writes are byte-equivalent.
    // Kept explicit here for one-to-one asm mapping:
    out.period = clone.period;

    return out;
  }

  /**
   * @Flexo 0x1258df0 FFScaledAudioSignal::processSamples(
   *   float* buf, unsigned long long a, unsigned long long b) const
   *   (__ZNK19FFScaledAudioSignal14processSamplesEPfyy)
   *
   * Body (27 instructions):
   *   @0x1258df0..fa prologue; save rbx=arg3(rcx), r14=arg1(rsi), r15=this(rdi)
   *   @0x1258e03     mov  rdi,0x20(rdi)                    ; rdi = this->input
   *   @0x1258e07     mov  rax,(rdi)                        ; rax = input->vtbl
   *   @0x1258e0a     call *0x20(rax)                       ; input->processSamples(buf, a, b)
   *                                                        ; (slot +0x20 = renderChunk/processSamples;
   *                                                        rsi=buf, rdx=a, rcx=b are already in place
   *                                                        from the caller — no re-marshaling.)
   *   @0x1258e0d     movsd xmm0,0x28(r15)                  ; xmm0 = this->scale (double)
   *   @0x1258e13     cvtsd2ss xmm0,xmm0                    ; xmm0 = (float)scale — single precision!
   *   @0x1258e17..21 lea rax,[rip+... sMixerVectorFunctions]; mov rax,(rax); mov rax,(rax)
   *                                                        ; rax = sMixerVectorFunctions vtable[0]
   *   @0x1258e24     mov  rdi,r14                          ; rdi = buf
   *   @0x1258e27     mov  esi,ebx                          ; esi = (uint32)b — TRUNCATED from u64!
   *   @0x1258e29..32 epilogue
   *   @0x1258e33     jmp  *rax                             ; tail-call scaleBuffer(buf,(u32)b,scale)
   *
   * ARGUMENT SEMANTICS (u64 a / u64 b): FFAudioSignal::render's ABI at
   *   raw-port/src/channels/FFAudioSignal.ts documents the base-class
   *   `processSamples`-shaped vtable slot +0x20 as
   *     (self, float* dst, uint64 phaseInCycle, uint64 sampleCount).
   *   Here the wrapper passes `a` and `b` UNMODIFIED to the input at
   *   @0x1258e0a (rdx=a, rcx=b were placed by the caller and never touched
   *   before the call), then uses `b` as the sample count for the scale
   *   pass (@0x1258e27 `mov esi,ebx` — LOW 32 bits of b). So:
   *     a = phaseInCycle (u64, forwarded to input)
   *     b = sampleCount  (u64, forwarded to input AND truncated to u32 for scale)
   *
   * MATH FIDELITY: The scale is stored as double (this.scale @+0x28) but
   * applied as float32 — the cvtsd2ss at @0x1258e13 narrows before the
   * multiply. Math.fround captures that exact narrowing in JS.
   */
  processSamplesScaled(buf: Float32Array, phaseInCycle: bigint, sampleCount: bigint): void {
    // @0x1258e03..0a — invoke input's processSamples (vtable slot +0x20).
    // The base's `processSamples`-shape isn't a first-class method on our
    // FFAudioSignal port (which throws from `render` for the abstract
    // base), but the concrete subclass FFSerialAudioSignal exposes a
    // `processSamples(dst, dstOffsetFloats, phase, nSamples)` method with
    // the same slot semantics. We call through a duck-typed interface here
    // so any concrete FFAudioSignal-subclass port that implements the
    // slot can be wrapped. If the input hasn't ported it, that subclass's
    // method throws — the correct frontier signal (see PORTING_SPEC rule 3).
    const inputWithSlot20 = this.input as unknown as {
      processSamples(dst: Float32Array, dstOffsetFloats: number, phase: bigint, nSamples: bigint): void;
    };
    // dstOffset = 0 because the caller of THIS method already passed a
    // pointer that points at the sample start (%r14 = arg1 verbatim).
    inputWithSlot20.processSamples(buf, 0, phaseInCycle, sampleCount);

    // @0x1258e0d/13 — read scale as double, narrow to float32.
    const scaleF32 = Math.fround(this.scale);

    // @0x1258e27 — u64 -> u32 truncation of sampleCount (bit-exact via BigInt mask).
    const countU32 = Number(sampleCount & 0xffffffffn);

    // @0x1258e17..33 — dispatch sMixerVectorFunctions[0](buf, (u32)count, scaleF32).
    sMixerVectorFunctions_slot0_scaleBuffer(buf, countU32, scaleF32);
  }

  /**
   * @Flexo 0x1259450 FFScaledAudioSignal::isIndefiniteSignal() const
   *   (__ZNK19FFScaledAudioSignal18isIndefiniteSignalEv)
   *
   * Body (7 instructions — pure tail-call delegate):
   *   @0x1259450..53 push rbp; mov rbp,rsp                 ; prologue
   *   @0x1259454     mov  rdi,0x20(rdi)                    ; rdi = this->input
   *   @0x1259458     mov  rax,(rdi)                        ; rax = input->vtbl
   *   @0x125945b     pop  rbp                              ; epilogue
   *   @0x125945c     jmp  *0x18(rax)                       ; tail-call input->isIndefiniteSignal()
   *
   * Direct forwarding — no local logic.
   */
  isIndefiniteSignal(): boolean {
    // @0x1259454..5c — delegate to input's slot +0x18.
    return this.input.isIndefiniteSignal();
  }

  /**
   * @Flexo 0x12593e0 FFScaledAudioSignal::~FFScaledAudioSignal()  [D1 — base dtor]
   * @Flexo 0x1259410 FFScaledAudioSignal::~FFScaledAudioSignal()  [D0 — deleting dtor]
   *
   * D1 body (15 instructions):
   *   @0x12593e0..e4 prologue; rax = rdi (= this)
   *   @0x12593e7..ee lea rcx,[rip+0x6c85ba]->0x19219a8; mov (rdi),rcx
   *                                                       ; reinstall vtbl (defensive during unwind)
   *   @0x12593f1     mov  rdi,0x20(rdi)                    ; rdi = this->input
   *   @0x12593f5     mov  qword 0,0x20(rax)                ; this->input = NULL
   *   @0x12593fd     test rdi,rdi
   *   @0x1259400     je   0x1259409                        ; if (input == NULL) skip virtual dtor
   *   @0x1259402     mov  rax,(rdi)                        ; rax = input->vtbl
   *   @0x1259406     jmp  *0x8(rax)                        ; tail-call input's virtual dtor (slot +0x8)
   *   @0x1259409..0a pop rbp; ret
   *
   * D0 body (21 instructions):
   *   @0x1259410..17 lea rax,[rip+0x6c8591]->0x19219a8; mov (rdi),rax
   *                                                       ; reinstall vtbl
   *   @0x125941a     mov  rax,0x20(rdi)                    ; rax = this->input
   *   @0x125941e     mov  qword 0,0x20(rdi)                ; this->input = NULL
   *   @0x1259426     test rax,rax
   *   @0x1259429     je   __ZdlPv                          ; if input == NULL, tail-call operator delete
   *   @0x125942f..3e prologue2; call *0x8(rcx)             ; input->~vtbl[+0x8]()
   *                  ;; rcx was loaded at @0x1259435 from (rax)
   *   @0x1259441..49 epilogue2
   *   @0x125944a     jmp  __ZdlPv                          ; tail-call operator delete(this)
   *
   * JS/TS has no explicit dtor; the GC reclaims the object. We provide a
   * `dispose()` for API parity that mirrors the D1 sequence (nulling the
   * input reference for eager unlinking; not calling any "virtual dtor"
   * because our TS classes have none).
   */
  dispose(): void {
    // @0x12593f5/@0x125941e — this->input = NULL (drop reference).
    // The native code then calls the input's virtual destructor via slot
    // +0x08 (@0x1259406 / @0x125943e); in TS the GC handles that when the
    // last reference is dropped.
    // We do NOT emulate the "reinstall vtbl" @0x12593e7/@0x1259410 because
    // that native trick is only meaningful during a partial unwind between
    // derived and base dtors — the TS lifetime model has no equivalent.
    this.input = null as unknown as FFAudioSignal;
  }
}

/**
 * FFAudioSignalVTable adapter — allows FFScaledAudioSignal to appear as a
 * base FFAudioSignal in code that dispatches through the base's vtable
 * interface. The three slots we recovered are backed by the concrete
 * methods above. Slot +0x10 (clone) is not part of FFAudioSignalVTable in
 * the base's ported shape (which exposes only +0x18 and +0x20); if a
 * caller needs the clone slot they should call `copySignal()` directly.
 *
 * This adapter is optional plumbing: FFScaledAudioSignal's methods are
 * usable directly on the class; the adapter only exists for callers that
 * hold an `FFAudioSignalVTable` reference (e.g. a generic vector<*> render
 * loop like FFSerialAudioSignal's).
 */
export function makeFFScaledAudioSignalVTable(): FFAudioSignalVTable {
  return {
    /** vtable slot +0x18 — @0x1259450 body. */
    isEnabled(self: FFAudioSignal): boolean {
      // FFAudioSignal's ported "slot +0x18" is documented as "isEnabled"
      // — see the base's VTABLE docblock. FFScaledAudioSignal's concrete
      // slot +0x18 is `isIndefiniteSignal()` per its own disasm; the two
      // signatures are `bool(FFAudioSignal*)` — return the same delegated
      // value. Callers going through this adapter should be aware the
      // semantic is "does the inner signal report indefinite?" rather
      // than a generic "enabled" probe.
      return (self as FFScaledAudioSignal).isIndefiniteSignal();
    },
    /** vtable slot +0x20 — @0x1258df0 body. */
    renderChunk(
      self: FFAudioSignal,
      dst: Float32Array,
      dstOffset: number,
      phaseInCycle: bigint,
      sampleCount: bigint,
    ): void {
      // The native slot +0x20 writes to `dst` directly (no dstOffset in
      // the C++ ABI — the base's docblock notes the caller pre-offsets
      // via `leaq (%rax,%r14,4),%rsi` @0x1258192). In TS we support the
      // dstOffset via a subarray view to preserve the underlying buffer.
      const view = dstOffset === 0 ? dst : dst.subarray(dstOffset);
      (self as FFScaledAudioSignal).processSamplesScaled(view, phaseInCycle, sampleCount);
    },
  };
}
