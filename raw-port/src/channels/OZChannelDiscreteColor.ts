// OZChannelDiscreteColor.ts — ProChannel OZChannelDiscreteColor (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//         Versions/A/ProChannel (x86_64 slice; unadjusted VAs, exactly as `otool -tV -arch x86_64`
//         prints them, cross-checked against the raw bytes of the thin slice).
//
// This is a FRESH class file. It ports ONE ledger unit:
//
//   __ZN22OZChannelDiscreteColor13setColorIndexEj
//     — OZChannelDiscreteColor::setColorIndex(unsigned int)   @ProChannel 0x8f1c0
//
// Every OTHER OZChannelDiscreteColor method (the ctors/dtors, getColorIndex, the factory's
// create* family, and the rest of the 54 symbols the inventory lists for this class) is a
// SEPARATE ledger unit and is deliberately absent. Per the one-class-one-file rule they get
// ADDED to THIS file when their units are claimed — do not create a sibling file, and do not
// delete what is already here (G6 add-only). The class's factory already lives next door in
// raw-port/src/channels/OZChannelDiscreteColor_Factory.ts and is a different C++ class.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN22OZChannelDiscreteColor13setColorIndexEj.s),
// with the raw bytes, because this body is nothing BUT operands and otool symbolizes those:
// ─────────────────────────────────────────────────────────────────────────────────────────────
//   0x8f1c0  55                    pushq     %rbp                  ; prologue
//   0x8f1c1  48 89 e5              movq      %rsp, %rbp
//   0x8f1c4  89 f0                 movl      %esi, %eax            ; eax = colorIndex (u32).
//                                                                  ; a 32-bit move ZERO-EXTENDS
//                                                                  ; into the full rax.
//   0x8f1c6  f2 48 0f 2a c0        cvtsi2sd  %rax, %xmm0           ; xmm0 = (double)(int64)rax —
//                                                                  ; the conversion is SIGNED but
//                                                                  ; reads the 64-bit rax, whose
//                                                                  ; top half the movl cleared, so
//                                                                  ; the result is the UNSIGNED
//                                                                  ; value of the argument.
//   0x8f1cb  48 8b 07              movq      (%rdi), %rax          ; rax = this->vptr
//   0x8f1ce  48 8b 80 c8 02 00 00  movq      0x2c8(%rax), %rax     ; rax = vtable[+0x2c8]
//   0x8f1d5  48 8b 35 e4 b2 03 00  movq      0x3b2e4(%rip), %rsi   ; 0x8f1dc + 0x3b2e4 = 0xca4c0,
//                                                                  ; the literal-pool slot holding
//                                                                  ; &kCMTimeZero -> rsi = arg2
//   0x8f1dc  31 d2                 xorl      %edx, %edx            ; edx = 0 = the `bool` arg3
//   0x8f1de  5d                    popq      %rbp                  ; epilogue BEFORE the jump —
//   0x8f1df  ff e0                 jmpq      *%rax                 ; TAIL-CALL, so setValue returns
//                                                                  ; directly to setColorIndex's
//                                                                  ; caller and this method has no
//                                                                  ; return value of its own.
//   0x8f1e1  90                    nop                             ; alignment pad, never executed
//
// THE VTABLE SLOT IS RESOLVED, not guessed (PORTING_SPEC Rule 2 — a vtable call must cite the
// resolved target symbol + address):
//
//   army/tools/resolve.py ProChannel vtable OZChannelDiscreteColor 0x2c8
//     # OZChannelDiscreteColor vtable @0xe1ff0; installed ptr 0xe2000
//       *0x2c8 -> 0x1663c  OZChannel::setValue(CMTime const&, double, bool)
//
// So the whole method is:  this->setValue(kCMTimeZero, (double)colorIndex, false)  — i.e. "set the
// channel's value, at time zero, to the color index as a double, without the flag". The virtual
// dispatch matters: a SUBCLASS of OZChannelDiscreteColor could override slot +0x2c8, and the
// machine would call the override. This port models the slot as it is populated for
// OZChannelDiscreteColor itself (the entry above) and says so, rather than pretending the call is
// direct.
//
// FRONTIER CALLEE — OZChannel::setValue @ProChannel 0x1663c is NOT yet transcribed (it is its own
// ledger unit; the landed OZChannelBool3D.ts carries the same frontier stub for it). The stub
// below therefore throws and cites the address, which is what keeps the gap visible to depgraph.
// Note that `depgraph.py deps` reports NO dependency for this unit at all: the target is reached
// through a vtable, i.e. through DATA, so no call edge exists to see.
//
// STRUCT LAYOUT recoverable from this method — exactly one slot:
//   OZChannelDiscreteColor {
//     +0x00  void** vptr   ; loaded @0x8f1cb; only its +0x2c8 entry is used here
//     ...                  ; everything else OPAQUE and deliberately NOT modelled
//   }
//
// ORACLE (executed, not read — raw-port/re/oracle/OZChannelDiscreteColor_setColorIndex_probe.py).
// The method is pure argument marshalling ending in a tail-jump, so the differential is over the
// marshalling: a FAKE vtable whose +0x2c8 slot is a ctypes callback records what the live code
// passes. Local (`t`) symbol -> called BY ADDRESS at slide+0x8f1c0 under `arch -x86_64`, after
// checking the 33 opcode bytes above against BOTH the mapped image and the on-disk thin slice.
// Live ProChannel passed, for every index tried:
//     arg0 %rdi   = the same `this` pointer
//     arg1 %rsi   = the pointer in literal-pool slot 0xca4c0, whose target reads
//                   {value=0, timescale=1, flags=1, epoch=0} — kCMTimeZero
//     arg2 %xmm0  = 0->0.0, 1->1.0, 7->7.0, 0x7fffffff->2147483647.0,
//                   0x80000000->2147483648.0, 0xffffffff->4294967295.0
//     arg3 %edx   = 0
// The last two rows are the ones that matter: they are where a `(int32)colorIndex` model would
// pass -2147483648.0 and -1.0. That is the observable consequence of the `movl` zero-extension
// feeding a signed 64-bit `cvtsi2sd`, and it is why this port converts the UNSIGNED value.
//
// (An aside recorded because it cost a cross-check: `dlsym(RTLD_DEFAULT, "kCMTimeZero")` in that
// process answers 0x7ff825ba8020, which `dladdr` places inside **ImageIO**, while the slot this
// binary actually loads is 0x7ff825302980. Both hold {0,1,1,0}. The constant is re-exported in
// several images, so identifying it by ADDRESS via RTLD_DEFAULT can name the wrong image —
// compare the CONTENT, or read the literal-pool slot the code itself uses, as the probe does.)

import { kCMTimeZero, type CMTime } from "../infra/CMTime";

/**
 * `OZChannel::setValue(CMTime const&, double, bool)` — @ProChannel 0x1663c
 * (`__ZN9OZChannel8setValueERK6CMTimedb`), the resolved target of
 * `OZChannelDiscreteColor` vtable slot +0x2c8 (vtable @0xe1ff0, installed ptr 0xe2000).
 *
 * A separate, NOT-yet-transcribed ledger unit — the same frontier the landed
 * `OZChannelBool3D.ts` declares for its six call sites. It throws citing the address so the gap
 * stays visible instead of silently doing nothing.
 */
function OZChannel_setValue(
  _self: OZChannelDiscreteColor,
  _time: CMTime,
  _value: number,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannel::setValue(CMTime const&, double, bool) @ProChannel 0x1663c " +
      "(__ZN9OZChannel8setValueERK6CMTimedb) is a separate ledger unit and is not transcribed " +
      "yet — reached from OZChannelDiscreteColor::setColorIndex @ProChannel 0x8f1c0 as the " +
      "tail-jump @0x8f1df through vtable slot +0x2c8 (vtable @0xe1ff0).",
  );
}

/**
 * `OZChannelDiscreteColor` — the ProChannel channel whose value is a discrete color INDEX rather
 * than a color. Only the +0x00 vptr slot is decoded here (see the file header); every other field
 * is opaque and intentionally not modelled, and will be added as sibling methods are ported.
 */
export class OZChannelDiscreteColor {
  /**
   * `OZChannelDiscreteColor::setColorIndex(unsigned int colorIndex)` — @ProChannel 0x8f1c0
   * (`__ZN22OZChannelDiscreteColor13setColorIndexEj`).
   *
   * Line-for-line transcription of the 10-instruction body quoted in the file header:
   * convert the index to a double, load the class's `setValue` through vtable slot +0x2c8, and
   * TAIL-JUMP to it with (this, &kCMTimeZero, (double)colorIndex, false).
   *
   * THE CONVERSION IS UNSIGNED even though `cvtsi2sd` is the signed instruction: `movl %esi, %eax`
   * @0x8f1c4 zero-extends the 32-bit argument into the whole of %rax, and @0x8f1c6 converts the
   * 64-bit %rax, so 0xffffffff becomes 4294967295.0 and not -1.0. Measured both ways against the
   * live binary (file header). `>>> 0` is what reproduces that in TS.
   *
   * NO RETURN VALUE: the epilogue @0x8f1de runs BEFORE the `jmpq *%rax` @0x8f1df, so whatever
   * setValue returns goes straight to setColorIndex's caller. The C++ signature returns void and
   * the tail-call preserves that; nothing here inspects the result.
   */
  setColorIndex(colorIndex: number): void {
    // @0x8f1c4-0x8f1c6 — movl %esi,%eax (zero-extend) then cvtsi2sd %rax,%xmm0.
    const value: number = (colorIndex >>> 0);
    // @0x8f1cb-0x8f1ce — rax = this->vptr[+0x2c8] = OZChannel::setValue for this class.
    // @0x8f1d5 — rsi = &kCMTimeZero (literal-pool slot 0xca4c0).
    // @0x8f1dc — edx = 0, i.e. the `bool` argument is false.
    // @0x8f1df — jmpq *%rax: tail-call, no return value of our own.
    OZChannel_setValue(this, kCMTimeZero, value, false);
  }
}
