// HGCinematic — Helium "Cinematic mode" render node (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN11HGCinematic11setApertureEf.s      (setAperture — PORTED here)
//   raw-port/re/disasm/Helium.__ZN11HGCinematicC2Ev.s                 (the C2 ctor — read ONLY to
//                                                                     pin the two touched slots'
//                                                                     defaults and widths; the
//                                                                     ctor is a separate ledger
//                                                                     entry and is NOT ported here)
//   raw-port/re/disasm/Helium.__ZN11HGCinematic16setFocusDistanceEf.s (setFocusDistance — read ONLY
//                                                                     to pin the +0x198/+0x19c pair
//                                                                     as one instance of a repeated
//                                                                     {flag, value} layout; also a
//                                                                     separate ledger entry and NOT
//                                                                     ported here)
//
// This file ports ONLY the symbol listed under "Symbols ported here" below.
// HGCinematic is a large HGNode subclass (its C2 ctor @0x1ebe90 chains to
// HGNode::HGNode @0x1ebe9a and initialises slots out to +0x1d0); every other
// method — RenderTile @0x1eccc0, RenderPageMetal @0x1ec140, GetDOD @0x1ec0d0,
// GetROI @0x1ec100, SetCinematicInfo @0x1ed720, setFocusDistance @0x1ec930,
// setTransferFunction @0x1ec950, SetRenderQuality @0x1ed710,
// ClearCachePipelines @0x1ed700, the ctors/dtors — is a separate ledger entry
// and will be ADDED to THIS file (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the touched offsets)
// -----------------------------------------------------------------------------
// HGCinematic : HGNode {
//   ...                       // +0x00 vptr (`movq %rax, (%rbx)` @0x1ebea6) and the
//                             // inherited HGNode fields; not decoded here.
//   bool  apertureSet;        // +0x198 — a ONE-BYTE flag. setAperture @0x1ec91c sets it
//                             // to 1 with `movb $0x1, 0x198(%rdi)`; the ctor clears it
//                             // to 0 with `movb $0x0, 0x198(%rbx)` @0x1ebea9. The `movb`
//                             // width is confirmed by execution, not just by reading:
//                             // after a real call on a 0xEE-poisoned object the bytes at
//                             // +0x198..+0x19c read `01 ee ee ee`, so +0x199..+0x19b are
//                             // padding this function never touches.
//   // +0x199..+0x19b         // padding (never written by any decoded instruction).
//   float aperture;           // +0x19c — the f32 written by setAperture @0x1ec914 via
//                             // `movss %xmm0, 0x19c(%rdi)`. NOTE: the ctor does NOT write
//                             // this slot (there is no store to +0x19c anywhere in
//                             // __ZN11HGCinematicC2Ev) — the flag at +0x198 is what makes
//                             // the value meaningful. See the field doc below for how the
//                             // TS side has to model that.
//   bool  focusDistanceSet;   // +0x1a0 — the identical flag one pair over, cleared by the
//                             // ctor @0x1ebeb0 and set by setFocusDistance @0x1ec93c.
//   float focusDistance;      // +0x1a4 — written by setFocusDistance @0x1ec934 via
//                             // `movss %xmm0, 0x1a4(%rdi)`. Neither +0x1a0 nor +0x1a4 is
//                             // modelled as a TS field here: setFocusDistance is its own
//                             // ledger entry, and inventing members for a method this file
//                             // does not port is the magic-offset guesswork Rule 5 forbids.
//                             // They are recorded here ONLY as the evidence that +0x198/
//                             // +0x19c is a {flag, value} pair rather than two unrelated
//                             // slots (see below).
//   int32_t slot1a8;          // +0x1a8 — ctor sets 2 (`movl $0x2, 0x1a8(%rbx)` @0x1ebeb7).
//   void*   slot1b0;          // +0x1b0 — ctor nulls it (@0x1ebec1). Not touched here.
//   // +0x1c0..+0x1d0         // ctor zeroes 16 bytes (`movaps %xmm0, 0x1c0(%rbx)` @0x1ebecf).
// }
//
// WHY +0x198 IS A FLAG AND NOT PART OF THE VALUE. Two independent pieces of
// decoded evidence, neither of which is an inference from the name:
//  1. `setFocusDistance` @0x1ec930 is byte-for-byte the same four-instruction
//     body 0x20 later in the text section, with both offsets shifted by exactly
//     8: value at +0x1a4, flag at +0x1a0. A repeated {byte flag, f32 value}
//     stride-8 pair is a layout, not a coincidence.
//  2. The ctor @0x1ebe90 clears BOTH flag bytes (+0x198 @0x1ebea9, +0x1a0
//     @0x1ebeb0) and initialises +0x1a8, +0x1b0 and +0x1c0 — but writes NEITHER
//     float. A field the constructor deliberately leaves alone while zeroing its
//     companion byte is a "has-value" guard; that is exactly the C++
//     `bool set; float v;` shape the compiler emits for a lazily-assigned
//     parameter.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   setAperture — none. Four instructions, two stores, no callq, no external
//                 symbol stub, no indirect call.
//                 `depgraph.py deps __ZN11HGCinematic11setApertureEf` reports
//                 nothing at all: 0 in-scope callees, 0 externs, 0 indirect.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11HGCinematic11setApertureEf
//       — HGCinematic::setAperture(float) @Helium 0x1ec910
//
// -----------------------------------------------------------------------------
// FULL DISASM — setAperture @0x1ec910 (8 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN11HGCinematic11setApertureEf:
//     0x1ec910  pushq  %rbp                     ; frame prologue
//     0x1ec911  movq   %rsp, %rbp
//     0x1ec914  movss  %xmm0, 0x19c(%rdi)       ; this->aperture = (float)arg
//                                               ;   %xmm0 = the SysV float arg;
//                                               ;   `movss` is a 32-bit store.
//     0x1ec91c  movb   $0x1, 0x198(%rdi)        ; this->apertureSet = true
//                                               ;   `movb` — ONE byte, immediate 1.
//     0x1ec923  popq   %rbp                     ; epilogue
//     0x1ec924  retq
//     0x1ec925  nopw   %cs:(%rax,%rax)          ; padding — not executed
//
// Store ORDER is value-then-flag, and it is preserved in the TS below. It has
// no observable effect in single-threaded JS, but reordering it would be an
// edit to the instruction structure for no reason, and the order is the half of
// a publish pattern that a concurrent reader would depend on.
//
// There is no getter to cross-check against: the cached Helium symbol inventory
// has no `getAperture` (nor any other HGCinematic accessor for +0x19c), so the
// only in-binary readers are the render paths (RenderTile @0x1eccc0 /
// RenderPageMetal @0x1ec140), which are separate, unported ledger entries. The
// slots are therefore pinned by the ctor + twin-setter evidence above and by
// the differential below, not by a round-trip through a matching getter.

/**
 * `HGCinematic` — Helium Cinematic-mode render node (an `HGNode` subclass; the
 * C2 ctor @0x1ebe90 chains to `HGNode::HGNode`). This file models ONLY the two
 * slots `setAperture` touches; see the header for the full symbol inventory and
 * for why the other decoded offsets are deliberately not declared as members.
 */
export class HGCinematic {
  /**
   * @Helium HGCinematic@0x198 — the one-byte "an aperture has been set" flag.
   *
   * Cleared to 0 by the ctor (`movb $0x0, 0x198(%rbx)` @0x1ebea9) and set to 1
   * by `setAperture` (`movb $0x1, 0x198(%rdi)` @0x1ec91c). Both writes are
   * `movb`, and a real call on a poisoned object leaves +0x199..+0x19b
   * untouched, so this is one byte and not a dword. Modelled as a JS boolean
   * because every decoded write is the immediate 0 or 1 — no decoded
   * instruction ever stores another value into it, so the wider byte range is
   * unreachable through this file's surface.
   *
   * `false` here is the ctor's decoded default, not a guess.
   */
  apertureSet: boolean = false; // @Helium HGCinematic@0x198

  /**
   * @Helium HGCinematic@0x19c — the f32 aperture value, written by
   * `setAperture` @0x1ec914 (`movss %xmm0, 0x19c(%rdi)`).
   *
   * CAVEAT ON THE INITIALISER, stated rather than hidden: the constructor does
   * NOT write this slot — `__ZN11HGCinematicC2Ev` contains no store to +0x19c —
   * so in the binary this dword holds whatever the allocation left there until
   * the first `setAperture` call, and the `apertureSet` flag above is what
   * distinguishes "set" from "never set". TypeScript has no way to spell an
   * uninitialised field, so `0` is a TS-side placeholder chosen to be inert; it
   * is NOT a decoded default and must not be read as one. Any future port of a
   * reader for this slot (RenderTile @0x1eccc0 / RenderPageMetal @0x1ec140)
   * must gate on `apertureSet` exactly as the machine does, not on a sentinel
   * value of this field.
   *
   * Held as a JS number restricted to f32 precision by `Math.fround` at the
   * single write site below.
   */
  aperture: number = 0; // @Helium HGCinematic@0x19c

  /**
   * `HGCinematic::setAperture(float)` @Helium 0x1ec910
   *   (__ZN11HGCinematic11setApertureEf)
   *
   * Faithful line-for-line transcription of the entire 8-line function: store
   * the f32 argument into the `aperture` slot at `this+0x19c`, then raise the
   * one-byte `apertureSet` flag at `this+0x198`. No callees, no branches, no
   * validation, no clamping — an out-of-range or NaN aperture is stored exactly
   * as given. The full disassembly is quoted in the file header.
   *
   *   0x1ec914  movss %xmm0, 0x19c(%rdi)   ; this->aperture = (float)arg
   *   0x1ec91c  movb  $0x1, 0x198(%rdi)    ; this->apertureSet = true
   *
   * `movss` is a 32-bit store of the SysV float argument, so the value is
   * rounded to single precision on the way in — PORTING_SPEC Rule 4. That is
   * modelled with `Math.fround`, and it is not cosmetic: on the corpus below
   * the rounded and unrounded values differ on 414 of 827 cases, so omitting it
   * would be a real numeric defect rather than a style point.
   *
   * ORACLE — verified by calling the live Helium binary. The symbol is exported
   * (the cached inventory lists `00000000001ec910 T
   * __ZN11HGCinematic11setApertureEf`), and the body only touches two fixed
   * offsets — it never reads the vptr — so it can be called on a synthetic
   * object. The harness dlopens Helium under `arch -x86_64 /usr/bin/python3`
   * (every address here is an x86_64 offset; a native arm64 process would be
   * checking this port against code it did not transcribe — see OPS_LOG) and
   * calls the real method on a 0x400-byte buffer poisoned with 0xEE, over 827
   * values: 0, -0, 1, -1, the real f-stop ladder (1.4, 1.8, 2.8, 4, 5.6, 8, 11,
   * 16, 22), 0.1, 1/3, pi, 1e-45 (denormal), 1e-38, FLT_MAX, 1e39 (overflows to
   * +inf), ±inf, NaN, 16777217 (the first integer f32 cannot represent),
   * doubles that need rounding, 400 random reals and 400 random u32 bit
   * patterns reinterpreted as floats. Results:
   *   - the 4 bytes at +0x19c are bit-identical to `Math.fround(v)` on 827/827
   *     (NaN compared as "is NaN", so the payload is not over-claimed);
   *   - the byte at +0x198 is 1 on 827/827;
   *   - EVERY other byte of the 0x400-byte object is still 0xEE on 827/827, so
   *     the function writes exactly these 5 bytes and consults nothing else.
   * NEGATIVE CONTROLS (measured on that same corpus): storing the unrounded
   * double instead of `Math.fround` diverges on 414/827; and the width probe
   * `01 ee ee ee` at +0x198..+0x19c rules out a 32-bit flag store, which would
   * have clobbered the padding.
   *
   * @param aperture — the lens aperture, SysV `%xmm0`, a 32-bit float.
   */
  setAperture(aperture: number): void {
    // ------------------------------------------------------------
    // @0x1ec910..0x1ec911 — prologue (no TS-visible effect).
    // @0x1ec914 — movss %xmm0, 0x19c(%rdi) : 32-bit store of the float arg.
    //   `Math.fround` reproduces the double->float narrowing the `movss`
    //   performs, so a caller passing a value f32 cannot represent stores the
    //   same bit pattern the machine would (round-to-nearest-even, and 1e39
    //   overflows to +Infinity exactly as the hardware does).
    // ------------------------------------------------------------
    this.aperture = Math.fround(aperture);

    // ------------------------------------------------------------
    // @0x1ec91c — movb $0x1, 0x198(%rdi) : raise the has-value flag.
    //   Written AFTER the value, matching the instruction order; one byte,
    //   immediate 1 (the ctor's `movb $0x0` @0x1ebea9 is the matching clear).
    // @0x1ec923..0x1ec924 — epilogue + retq.
    // ------------------------------------------------------------
    this.apertureSet = true;
  }
}
