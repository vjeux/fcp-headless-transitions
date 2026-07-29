// raw-port/src/render/HGACEScct_Decode.ts
//
// FCP `HGACEScct::Decode` — nested Helium HGNode subclass. Inverse of
// HGACEScct::Encode (see ./HGACEScct_Encode.ts). Wraps an owned
// `HgcLogVideo_decode` compositor and configures it, via two SetParameter
// calls, to implement the ACEScct inverse transfer function (ACEScct
// log-encoded video → linear scene-linear).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGACEScct.Decode.s            (C2 ctor + D2/D1/D0 dtors)
//   raw-port/re/disasm/Helium.HGACEScct.Decode_GetOutput.s  (GetOutput)
//   raw-port/re/disasm/Helium.HGACEScct.Decode_cold.s       (.cold.1..5 static-local init)
//
// SYMBOLS:
//   @Helium 0x101b40  HGACEScct::Decode::Decode()            [C2 base-object ctor]  __ZN9HGACEScct6DecodeC2Ev
//   @Helium 0x101c70  HGACEScct::Decode::Decode()            [C1 complete-object ctor — tail-jmp to C2]  __ZN9HGACEScct6DecodeC1Ev
//   @Helium 0x101c80  HGACEScct::Decode::~Decode()           [D2]  __ZN9HGACEScct6DecodeD2Ev
//   @Helium 0x101cc0  HGACEScct::Decode::~Decode()           [D1]  __ZN9HGACEScct6DecodeD1Ev
//   @Helium 0x101d00  HGACEScct::Decode::~Decode()           [D0 — deleting]  __ZN9HGACEScct6DecodeD0Ev
//   @Helium 0x101d50  HGACEScct::Decode::GetOutput(HGRenderer*)   __ZN9HGACEScct6Decode9GetOutputEP10HGRenderer
//   @Helium 0x3c3870  HGACEScct::Decode::Decode().cold.1     [static-local init for `c`]
//   @Helium 0x3c38b0  HGACEScct::Decode::Decode().cold.2     [static-local init for `d`]
//   @Helium 0x3c3900  HGACEScct::Decode::Decode().cold.3     [static-local init for `bb`]
//   @Helium 0x3c3930  HGACEScct::Decode::Decode().cold.4     [static-local init for `cc`]
//   @Helium 0x3c3980  HGACEScct::Decode::Decode().cold.5     [static-local init for `dd`]  (Decode-only, no counterpart in Encode)
//
// VTABLE:
//   @Helium leaq 0x916367(%rip),%rax @0x101b52 → 0xa17ec0 = "vtable for
//   HGACEScct::Decode + 0x10"  (installed-ptr = vtable base 0xa17eb0 + 0x10 per
//   Itanium ABI). Reinstalled at 0x101d09 (D0), 0x101cc6 (D1), 0x101c86 (D2).
//
// STRUCT LAYOUT (recovered from C2 @0x101b40 + GetOutput @0x101d50):
//   HGACEScct::Decode extends HGNode (base ctor called @0x101b4d, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HgcLogVideo_decode*  compositor  (allocated + ctor'd @0x101b61/0x101b6c)
//     0x1a0 : float                bb_f32      (ACEScct log-segment output shift, DECODE polarity; store @0x101bb7)
//     0x1a4 : float                cc_f32      (ACEScct linear-region slope reciprocal, DECODE polarity; store @0x101bc7)
//     0x1a8 : float                dd_f32      (ACEScct linear-region intercept-over-slope, DECODE polarity; store @0x101bd7)
//   Total sizeof = 0x1ac (or 0x1b0 with padding). No further fields
//   touched by any ported entry point.
//
//   NOTE ON FIELD ORDERING (differs from Encode!):
//     Encode packs {d_f32@0x1a0, bb_f32@0x1a4, cc_f32@0x1a8} — three of its four
//     static locals reach the object at those offsets.
//     Decode packs {bb_f32@0x1a0, cc_f32@0x1a4, dd_f32@0x1a8} — its `c` and `d`
//     static doubles are NOT stored on the object (they exist only to feed the
//     .cold.4 and .cold.5 initializers of cc and dd). The three stored floats
//     are bb, cc, dd (in that offset order) — see the writes @0x101bb7/bf/c7
//     in the ctor. The letter-name reuse between Encode and Decode is
//     coincidental: `bb` here holds a different numeric value with a different
//     spec role (see SEMANTICS below).
//
// STATIC LOCALS (Itanium ABI guard-protected, initialised on first call):
//   __ZZN9HGACEScct6DecodeC1EvE1c    double `c`   @Helium BSS
//                                    init @cold.1 @0x3c3884: movabsq $0x4025149a0a90f133
//                                    → 10.540237741654527d  (ACEScct linear-region slope A — same numeric
//                                    value as Encode's `c`; not stored on the object, only used to
//                                    initialise cc and dd below).
//   __ZZN9HGACEScct6DecodeC1EvE1d    double `d`   @Helium BSS
//                                    init @cold.2 @0x3c38c4..0x3c38dc:
//                                      d = c * K1 + K2
//                                      K1 = [rip+0xd664]@0x3d0f38 = -0.0078125d
//                                      K2 = [rip+0xd664]@0x3d0f40 = 0.15525114155251146d
//                                    → d = 0.07290553419583547d
//                                    (Same numeric value as Encode's `d` — the ACEScct 1.0.3
//                                    linear-region intercept B. Not stored on the object; only used
//                                    to initialise dd below.)
//   __ZZN9HGACEScct6DecodeC1EvE2bb   float  `bb`  @Helium BSS
//                                    init @cold.3 @0x3c3914: movl $0xc1191684, bb(%rip)
//                                    → -9.567996978759766f  (IEEE 754 f32 bit-exact from 0xc1191684).
//                                    SEMANTICS: this is Encode's log-segment output shift
//                                    (0.5461185574531555) pre-multiplied by -17.52. In the log
//                                    segment, Encode does y = log2(x)*(1/17.52) + 0.5461185; Decode
//                                    inverts as x = 2^(y*17.52 + bb) with bb = -0.5461185*17.52 ≈
//                                    -9.567996979. Passed as xmm3 to the log-segment SetParameter.
//   __ZZN9HGACEScct6DecodeC1EvE2cc   float  `cc`  @Helium BSS
//                                    init @cold.4 @0x3c3944..0x3c3964:
//                                      xmm0 = c;                                    (double 10.540237741654527)
//                                      xmm0 *= K3                                   K3 = [rip+0xd4fc]@0x3d0e50 = 0.9d
//                                      xmm1 = 1.0d                                  = [rip+0x6904]@0x3ca260
//                                      xmm1 /= xmm0                                 (double divide: 1 / (c*0.9))
//                                      cc_f32 = cvtsd2ss(xmm1)
//                                    → cc_f32 = fround(1.0 / (10.540237741654527 * 0.9)) = fround(0.10541613371015834) = 0.10541613399982452f
//                                    SEMANTICS: this is 1 / Encode's `cc` (= 1 / (c*0.9)). In the linear
//                                    segment, Encode does y = c*x + d and stores cc = c*0.9 as the
//                                    log-segment gain. Decode's cc = 1/(c*0.9) is the reciprocal used
//                                    in the compositor's decode arithmetic. Passed as xmm0 to the
//                                    linear-segment SetParameter.
//   __ZZN9HGACEScct6DecodeC1EvE2dd   float  `dd`  @Helium BSS
//                                    init @cold.5 @0x3c3994..0x3c39b4:
//                                      xmm0 = c;                                    (double 10.540237741654527)
//                                      xmm0 *= K4                                   K4 = [rip+0xd5a4]@0x3d0f48 = -0.9d
//                                      xmm1 = d;                                    (double 0.07290553419583547)
//                                      xmm1 /= xmm0                                 (double divide: d / (c*-0.9))
//                                      dd_f32 = cvtsd2ss(xmm1)
//                                    → dd_f32 = fround(0.07290553419583547 / (10.540237741654527 * -0.9))
//                                             = fround(-0.0076854195409987135)
//                                             = -0.007685419637709856f
//                                    SEMANTICS: dd = d / (c*-0.9) = -(d / (c*0.9)) — the negated
//                                    intercept-over-slope, i.e. the value the compositor uses to
//                                    subtract off the intercept in the inverse linear-region
//                                    computation. Passed as xmm1 to the linear-segment SetParameter.
//
// SEMANTICS — HOW these numbers wire ACEScct DECODE (inverse of Encode):
//   The ACEScct 1.0.3 forward encoding (linear → log) is piecewise:
//     if lin <= 0.0078125:            out = A * lin + B
//                                     with A = 10.5402377416545 , B = 0.0729055341958355
//     else:                           out = (log2(lin) + 9.72) / 17.52
//   The inverse (DECODE, log → linear) is:
//     if enc <= 0.15525114...:        lin = (enc - B) / A
//                                        = enc/A - B/A
//                                        = enc * (1/A) + (-B/A)
//     else:                           lin = 2^(enc * 17.52 - 9.72)
//   The four `SetParameter` args in GetOutput are exactly the coefficients
//   this piecewise inverse needs. Reading the two calls (see GETOUTPUT below):
//     LOG segment    (esi=0): (xmm0=1.0f, xmm1=0.0f, xmm2=17.52f, xmm3=bb_f32=-9.568)
//                     — the compositor uses these as `x*17.52 + bb`, then 2^() (see the encoder-
//                     side, and the compositor 0x60 vtable slot decodes its own semantics; we do
//                     NOT reverse-derive the shader's exact expression here — see rule PORTING_SPEC
//                     rule "Transcribe, don't reimplement". We record the coefficients the binary
//                     hands the shader, byte-for-byte.).
//     LINEAR segment (esi=1): (xmm0=cc_f32=0.10541613, xmm1=dd_f32=-0.0076854, xmm2=0.15525114f, xmm3=0.0f)
//                     — this hands cc = 1/A and dd = -B/A, plus the segment threshold 0.15525114 as
//                     f32 (@Helium 0x3d0fb4 = 0x3e1efa28 = fround(K2)) and 0.0.
//
//   The subtle point: `bb` in Encode is 0.5461185574531555 (the log-region output offset added
//   AFTER dividing log2 by 17.52), while `bb` in Decode is -9.567996978759766 (the same offset
//   pre-multiplied by -17.52 so the compositor can just do `x*17.52 + bb` in the log branch and
//   have the ACEScct spec's `-9.72`-ish shift baked in). Numerically:
//     encode_bb * -17.52 = 0.5461185574531555 * -17.52 = -9.56799792617528... ≈ -9.567996978759766
//   The ~1e-8 delta is the round-trip through f32→double→f32 for encode_bb; the value stored in
//   the binary was hand-baked at compile time from a double literal, so we take the byte-exact f32
//   -9.567996978759766f as authoritative.
//
// GETOUTPUT (@0x101d50..0x101dde) — rendering-graph wiring:
//   1) input   = HGRenderer::GetInput(this, 0)                          @0x101d69
//   2) compositor.vtable[0x78] (segment 0, in=input)                    @0x101d79
//        args: esi=0, rdx=input.
//   3) compositor.vtable[0x60] (esi=0, xmm0=1.0f, xmm1=0.0f, xmm2=17.52f,
//                                     xmm3=bb_f32)                      @0x101da3
//      (constants from RIP-relative loads @0x101d8e/0x101d96.)
//   4) compositor.vtable[0x60] (esi=1, xmm0=cc_f32, xmm1=dd_f32, xmm2=0.15525114f,
//                                     xmm3=0.0f)                        @0x101dd0
//      (xmm0/xmm1 loaded from `this.field_1a4`/`this.field_1a8`;
//       xmm2 from RIP-relative @0x101dc0.)
//   5) return this.compositor                                           @0x101dd3
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcLogVideo_decode::HgcLogVideo_decode()  @Helium __ZN18HgcLogVideo_decodeC1Ev  — invoked @0x101b6c
//   HgcLogVideo_decode vtable slot *0x60      (SetParameter-like) — invoked twice from GetOutput
//   HgcLogVideo_decode vtable slot *0x78      (SetInput-like)     — invoked once from GetOutput
//   HgcLogVideo_decode vtable slot *0x18      (Release)           — invoked from dtors
//   HGObject::operator new(unsigned long)     @Helium __ZN8HGObjectnwEm  — invoked @0x101b61
//   HGObject::operator delete(void*)          @Helium __ZN8HGObjectdlEPv — invoked @0x101d36 (D0)
//   HGRenderer::GetInput(HGNode*, int)        @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x101d69
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * The `GetInput` method is invoked at @Helium 0x101d69 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x101d69 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.field_198`. Not
 * yet transcribed — see raw-port/army/ledger for HgcLogVideo_decode.
 * Only the three vtable slots vcalled from HGACEScct::Decode are
 * exposed here; each throws until the class is ported.
 */
export interface HgcLogVideo_decode {
  /** vtable *0x18 @Helium — invoked from ~HGACEScct::Decode (D2 @0x101ca5, D1 @0x101ce5, D0 @0x101d22). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x101da3, @0x101dd0). Argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x101d79). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHgcLogVideo_decode()` — placeholder for the compositor
 * allocation + ctor sequence at @Helium 0x101b5c..0x101b6c.
 *
 * The binary emits:
 *   0x101b5c  movl  $0x1a0, %edi                     ; alloc size = 0x1A0 = 416 bytes
 *   0x101b61  callq __ZN8HGObjectnwEm                ; HGObject::operator new(unsigned long)
 *   0x101b6c  callq __ZN18HgcLogVideo_decodeC1Ev     ; placement-ctor
 * — i.e. `new HgcLogVideo_decode()`. Both callees are undecoded, so this
 * stub throws (rule 3: loud gap, not silent approximation).
 */
function newHgcLogVideo_decode(): HgcLogVideo_decode {
  throw new Error(
    "HGACEScct::Decode: HgcLogVideo_decode ctor + HGObject::operator new @Helium 0x101b61/0x101b6c not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static-local initializers (Itanium ABI __cxa_guard_acquire/release semantics).
// In the C++ source these are function-scope `static const` declarations inside
// HGACEScct::Decode::Decode; the compiler emits them once at first call and
// then reads them from BSS on every subsequent construction. In TS we compute
// them eagerly at module load — same observable result (the guard bits are a
// thread-safe first-write mechanism, not a runtime feature).
//
// NB: Decode has FIVE static locals (c, d, bb, cc, dd); Encode had four. The
// extra one is `dd`, which the Decode compositor consumes to invert the
// linear-region math. See the SEMANTICS section in the file header for the
// full mapping to the ACEScct 1.0.3 spec.
// ---------------------------------------------------------------------------

/**
 * `c` — HGACEScct::Decode static local double. @Helium BSS.
 * Initialized @cold.1 @0x3c3884: `movabsq $0x4025149a0a90f133, %rax; movq %rax, c(%rip)`.
 * Bit-pattern 0x4025149a0a90f133 decodes to 10.540237741654527 as IEEE 754 double.
 * Semantically: the ACEScct 1.0.3 linear-region slope A = 10.5402377416545.
 * Same numeric value as HGACEScct_Encode_c; used here only to derive cc and dd.
 */
const HGACEScct_Decode_c: number = 10.540237741654527;

/**
 * `d` — HGACEScct::Decode static local double. @Helium BSS.
 * Initialized @cold.2 @0x3c38c4..0x3c38dc:
 *   xmm0 = c;
 *   xmm0 *= -0.0078125          (double at @Helium 0x3d0f38, RIP-relative +0xd664 from 0x3c38d4)
 *   xmm0 +=  0.15525114155251146 (double at @Helium 0x3d0f40, RIP-relative +0xd664 from 0x3c38dc)
 *   movsd xmm0, d(%rip)
 * → d = 10.540237741654527 * -0.0078125 + 0.15525114155251146
 *     = 0.07290553419583547
 * Same numeric value as HGACEScct_Encode_d (the ACEScct 1.0.3 linear-region
 * intercept B); used here only to derive dd.
 */
const HGACEScct_Decode_d: number =
  HGACEScct_Decode_c * -0.0078125 + 0.15525114155251146;

/**
 * `bb` — HGACEScct::Decode static local float. @Helium BSS.
 * Initialized @cold.3 @0x3c3914: `movl $0xc1191684, bb(%rip)`.
 * Bit-pattern 0xc1191684 decodes to -9.567996978759766 as IEEE 754 float32.
 * Passed as xmm3 to the log-segment SetParameter call in GetOutput.
 * SEMANTICS: Encode's log-segment output offset (0.5461185574531555) pre-
 * multiplied by -17.52, so the compositor can do `x*17.52 + bb` in the log
 * branch — see the file header SEMANTICS section.
 */
const HGACEScct_Decode_bb_f32: number = Math.fround(-9.567996978759766);

/**
 * `cc` — HGACEScct::Decode static local float. @Helium BSS.
 * Initialized @cold.4 @0x3c3944..0x3c3964:
 *   xmm0 = c;                                   (double 10.540237741654527)
 *   xmm0 *= 0.9                                 (double at @Helium 0x3d0e50, RIP-relative +0xd4fc from 0x3c3954)
 *   xmm1 = 1.0                                  (double at @Helium 0x3ca260, RIP-relative +0x6904 from 0x3c395c)
 *   xmm1 /= xmm0                                (double divide)
 *   xmm0 = cvtsd2ss(xmm1)                       (double → float32 narrowing)
 *   movss xmm0, cc(%rip)
 * → cc_f32 = fround(1.0 / (10.540237741654527 * 0.9)) = fround(0.10541613371015834) = 0.10541613399982452
 * Passed as xmm0 to the linear-segment SetParameter call in GetOutput.
 * SEMANTICS: reciprocal of Encode's cc = c*0.9 (the linear-region slope × 0.9); i.e. 1/(A*0.9).
 * See the file header for how this feeds the linear-region inverse.
 */
const HGACEScct_Decode_cc_f32: number = Math.fround(1.0 / (HGACEScct_Decode_c * 0.9));

/**
 * `dd` — HGACEScct::Decode static local float. @Helium BSS. (Decode-only; no
 * counterpart in Encode.)
 * Initialized @cold.5 @0x3c3994..0x3c39b4:
 *   xmm0 = c;                                   (double 10.540237741654527)
 *   xmm0 *= -0.9                                (double at @Helium 0x3d0f48, RIP-relative +0xd5a4 from 0x3c39a4)
 *   xmm1 = d;                                   (double 0.07290553419583547)
 *   xmm1 /= xmm0                                (double divide)
 *   xmm0 = cvtsd2ss(xmm1)
 *   movss xmm0, dd(%rip)
 * → dd_f32 = fround(0.07290553419583547 / (10.540237741654527 * -0.9))
 *          = fround(-0.0076854195409987135)
 *          = -0.007685419637709856
 * Passed as xmm1 to the linear-segment SetParameter call in GetOutput.
 * SEMANTICS: -d/(c*0.9) = -B/(A*0.9); the negated intercept-over-slope that
 * the compositor uses to subtract off the intercept in the inverse linear-
 * region computation.
 */
const HGACEScct_Decode_dd_f32: number = Math.fround(
  HGACEScct_Decode_d / (HGACEScct_Decode_c * -0.9),
);

// ---------------------------------------------------------------------------
// RIP-relative constants read at GetOutput @0x101d50.
// ---------------------------------------------------------------------------

/**
 * xmm0 argument in the first SetParameter call (esi=0 log segment).
 * @Helium `movss 0x2c5f2a(%rip), %xmm0` @0x101d8e → data @0x3c7cc0 = 1.0f.
 */
const HGACEScct_Decode_getOutput_arg1_xmm0_f32: number = Math.fround(1.0);

/**
 * xmm2 argument in the first SetParameter call (esi=0 log segment).
 * @Helium `movss 0x2cf212(%rip), %xmm2` @0x101d96 → data @0x3d0fb0 = 17.520000457763672f.
 * Numerically = fround(17.52); the ACEScct log-region multiplier applied
 * to the encoded value before the 2^() step (i.e. the reciprocal of the
 * Encode side's 0.05707762 = 1/17.52).
 */
const HGACEScct_Decode_getOutput_arg1_xmm2_f32: number = Math.fround(17.520000457763672);

/**
 * xmm2 argument in the second SetParameter call (esi=1 linear segment).
 * @Helium `movss 0x2cf1ec(%rip), %xmm2` @0x101dc0 → data @0x3d0fb4 = 0.155251145362854f.
 * Numerically = fround(K2) where K2 = 0.15525114155251146 (the ACEScct spec's log/linear
 * segment threshold on the ENCODED axis, i.e. the value of `out` at the seam
 * lin = 0.0078125). Used by the compositor to select which segment to invert.
 */
const HGACEScct_Decode_getOutput_arg2_xmm2_f32: number = Math.fround(0.155251145362854);

/**
 * `HGACEScct::Decode` — Helium HGNode subclass. Wraps an owned
 * `HgcLogVideo_decode` compositor configured for ACEScct inverse
 * decoding (log → linear).
 *
 * @Helium ctors  @0x101b40 (C2) / @0x101c70 (C1);
 *         dtors  @0x101c80 (D2) / @0x101cc0 (D1) / @0x101d00 (D0);
 *         GetOutput @0x101d50.
 */
export class HGACEScctDecode extends HGNode {
  /**
   * Owned `HgcLogVideo_decode` compositor. Field @0x198 in the C++ layout.
   * Assigned once in the ctor @0x101b71: `movq %r14, 0x198(%rbx)`. No
   * pre-existing-pointer check — this is a fresh HGNode subclass whose
   * base ctor leaves 0x198 uninitialized.
   */
  compositor: HgcLogVideo_decode | null;

  /**
   * ACEScct log-segment output shift, DECODE polarity, as float32. Field @0x1a0.
   * Written in ctor @0x101bb7 from HGACEScct_Decode_bb_f32.
   */
  bb_f32: number;

  /**
   * ACEScct linear-region slope reciprocal (1/(A*0.9)), as float32. Field @0x1a4.
   * Written in ctor @0x101bc7 from HGACEScct_Decode_cc_f32.
   */
  cc_f32: number;

  /**
   * ACEScct linear-region negated intercept-over-slope (-B/(A*0.9)), as float32. Field @0x1a8.
   * Written in ctor @0x101bd7 from HGACEScct_Decode_dd_f32.
   */
  dd_f32: number;

  /**
   * `HGACEScct::Decode::Decode()` — Helium @0x101b40 (C2 base-object ctor).
   * C1 @0x101c70 is a byte-for-byte `jmp` tail-call to C2, so only C2's
   * body needs modelling.
   *
   * Verbatim asm (@0x101b40..0x101b49 prologue elided; @0x101be9 epilogue elided):
   *   0x101b4d  callq __ZN6HGNodeC2Ev                       ; base ctor
   *   0x101b52  leaq  0x916367(%rip), %rax  ; = 0xa17ec0    (own vtable installed ptr)
   *   0x101b59  movq  %rax, (%rbx)                          ; *this = vtable
   *   0x101b5c  movl  $0x1a0, %edi                          ; alloc size 0x1A0
   *   0x101b61  callq __ZN8HGObjectnwEm                     ; HGObject::operator new
   *   0x101b66  movq  %rax, %r14                            ; r14 = compositor ptr
   *   0x101b6c  callq __ZN18HgcLogVideo_decodeC1Ev          ; placement ctor
   *   0x101b71  movq  %r14, 0x198(%rbx)                     ; this.compositor = r14
   *   0x101b78..0x101bad  guard-acquire chain for statics c/d/bb/cc/dd
   *                       (jumps into .cold.1..5 if a guard is 0).
   *                       Note: c and d are computed but NOT stored on the
   *                       object — only bb, cc, dd are (they hold the values
   *                       the compositor actually consumes).
   *   0x101baf  movss bb[static-float](%rip), %xmm0
   *   0x101bb7  movss %xmm0, 0x1a0(%rbx)                    ; this.bb_f32  = bb
   *   0x101bbf  movss cc[static-float](%rip), %xmm0
   *   0x101bc7  movss %xmm0, 0x1a4(%rbx)                    ; this.cc_f32  = cc
   *   0x101bcf  movss dd[static-float](%rip), %xmm0
   *   0x101bd7  movss %xmm0, 0x1a8(%rbx)                    ; this.dd_f32  = dd
   *   0x101be9  retq
   *
   * The exception-cleanup path @0x101c34..0x101c62 (compositor delete +
   * HGNode dtor + __Unwind_Resume) exists only to handle allocation
   * failure or a throwing HgcLogVideo_decode ctor; it never executes on
   * a successful construction and is not modelled explicitly (TS
   * exceptions unwind through the stack naturally).
   */
  constructor() {
    // @Helium 0x101b4d: HGNode base ctor
    super();
    // @Helium 0x101b59: install this class's vtable (installed ptr = 0xa17ec0).
    this.vtable = 0xa17ec0;
    // @Helium 0x101b5c..0x101b6c: alloc 0x1a0 bytes + HgcLogVideo_decode ctor.
    // Throws until HgcLogVideo_decode is transcribed (see stub above).
    const newComp = newHgcLogVideo_decode();
    // @Helium 0x101b71: store compositor. (No release-old path: the field
    // is uninitialized until this write — see comment on the field.)
    this.compositor = newComp;
    // @Helium 0x101baf..0x101bb7: this.bb_f32  = bb
    this.bb_f32 = HGACEScct_Decode_bb_f32;
    // @Helium 0x101bbf..0x101bc7: this.cc_f32  = cc
    this.cc_f32 = HGACEScct_Decode_cc_f32;
    // @Helium 0x101bcf..0x101bd7: this.dd_f32  = dd
    this.dd_f32 = HGACEScct_Decode_dd_f32;
  }

  /**
   * `HGACEScct::Decode::~Decode()` — Helium @0x101c80 (D2, base-object)
   * / @0x101cc0 (D1, complete-object) / @0x101d00 (D0, deleting).
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. Bodies verbatim:
   *
   * D2 @0x101c80..0x101cb1 (verbatim, ex-handler elided):
   *   0x101c86  leaq  0x916233(%rip), %rax   ; = 0xa17ec0 (own installed vtable ptr)
   *   0x101c8d  movq  %rax, (%rdi)           ; *this = vtable (reinstall)
   *   0x101c90  movq  0x198(%rdi), %rax      ; rax = compositor
   *   0x101c97  testq %rax, %rax
   *   0x101c9a  je    0x101cab               ; skip if null
   *   0x101c9c  movq  (%rax), %rcx           ; rcx = compositor.vtable
   *   0x101c9f  movq  %rdi, %rbx             ; save this
   *   0x101ca2  movq  %rax, %rdi             ; rdi = compositor
   *   0x101ca5  callq *0x18(%rcx)            ; compositor.Release()  (vtable slot 0x18)
   *   0x101ca8  movq  %rbx, %rdi             ; restore this
   *   0x101cb1  jmp   __ZN6HGNodeD2Ev        ; tail-call HGNode base dtor
   *
   * D1 @0x101cc0 is byte-identical except the vtable-reload leaq offset
   * (@0x101cc6 leaq 0x9161f3(%rip), %rax — same target 0xa17ec0 with a
   * different displacement because the leaq PC is different). D0 @0x101d00
   * differs only in that after the HGNode dtor tail-call the epilogue
   * `jmp __ZN8HGObjectdlEPv` frees `this` via HGObject::operator delete;
   * we model D0's operator-delete step at the JS caller (see the `delete`
   * verb, i.e. dropping the reference).
   */
  destruct(): void {
    // @Helium 0x101c8d: vtable reinstall — modeled by assignment.
    this.vtable = 0xa17ec0;
    // @Helium 0x101c90..0x101ca5: release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x101cb1: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGACEScct::Decode::GetOutput(HGRenderer*)` — Helium @0x101d50.
   *
   * Wires the owned `HgcLogVideo_decode` compositor into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the compositor as its input at slot 0 (vtable *0x78)
   *   3) call SetParameter for the LOG segment (esi=0) with
   *        (xmm0=1.0f, xmm1=0.0f, xmm2=17.52f, xmm3=bb_f32)
   *   4) call SetParameter for the LINEAR segment (esi=1) with
   *        (xmm0=cc_f32, xmm1=dd_f32, xmm2=0.15525114f, xmm3=0.0f)
   *   5) return the compositor as this node's output.
   *
   * Verbatim asm (@0x101d50..0x101dde, prologue/epilogue elided):
   *   0x101d5a  movq  0x198(%rdi), %r14           ; r14 = this.compositor
   *   0x101d61  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x101d64  movq  %rbx, %rsi                  ; rsi = this
   *   0x101d67  xorl  %edx, %edx                  ; edx = 0
   *   0x101d69  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x101d6e  movq  (%r14), %rcx                ; rcx = compositor.vtable
   *   0x101d71  movq  %r14, %rdi                  ; rdi = compositor
   *   0x101d74  xorl  %esi, %esi                  ; esi = 0
   *   0x101d76  movq  %rax, %rdx                  ; rdx = input
   *   0x101d79  callq *0x78(%rcx)                 ; compositor.SetInput(0, input)
   *   0x101d7c  movq  0x198(%rbx), %rdi           ; rdi = this.compositor
   *   0x101d83  movss 0x1a0(%rbx), %xmm3          ; xmm3 = this.bb_f32
   *   0x101d8b  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x101d8e  movss 0x2c5f2a(%rip), %xmm0       ; xmm0 = 1.0f  @Helium 0x3c7cc0
   *   0x101d96  movss 0x2cf212(%rip), %xmm2       ; xmm2 = 17.52f       @Helium 0x3d0fb0
   *   0x101d9e  xorps %xmm1, %xmm1                ; xmm1 = 0.0f
   *   0x101da1  xorl  %esi, %esi                  ; esi = 0
   *   0x101da3  callq *0x60(%rax)                 ; compositor.SetParameter(0, 1.0f, 0.0f, 17.52f, bb_f32)
   *   0x101da6  movq  0x198(%rbx), %rdi           ; rdi = this.compositor
   *   0x101dad  movss 0x1a4(%rbx), %xmm0          ; xmm0 = this.cc_f32
   *   0x101db5  movss 0x1a8(%rbx), %xmm1          ; xmm1 = this.dd_f32
   *   0x101dbd  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x101dc0  movss 0x2cf1ec(%rip), %xmm2       ; xmm2 = 0.15525114f  @Helium 0x3d0fb4
   *   0x101dc8  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x101dcb  movl  $0x1, %esi                  ; esi = 1
   *   0x101dd0  callq *0x60(%rax)                 ; compositor.SetParameter(1, cc_f32, dd_f32, 0.15525114f, 0.0f)
   *   0x101dd3  movq  0x198(%rbx), %rax           ; rax = this.compositor
   *   0x101dde  retq                              ; return rax
   *
   * @param renderer  the containing HGRenderer (undecoded; only its
   *                  `GetInput` method is touched).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of the node graph for this filter).
   *
   * Throws if the compositor field is null (should be impossible after a
   * successful ctor) or if the compositor's vtable slots aren't yet
   * transcribed (they aren't — see HgcLogVideo_decode stub above).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x101d5a: rax = this.compositor. Invariant: non-null after ctor.
    const comp = this.compositor;
    if (comp == null) {
      // Not modelling the C++ path where this is unreachable — but
      // TypeScript's type-narrowing wants it, and a loud fault here
      // is preferable to `!` shorthand (rule 3).
      throw new Error(
        "HGACEScct::Decode::GetOutput @Helium 0x101d5a — compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x101d69: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x101d79: compositor.SetInput(0, input) via vtable *0x78
    comp.SetInput(0, input);
    // @Helium 0x101da3: compositor.SetParameter(0, 1.0f, 0.0f, 17.52f, bb_f32) via vtable *0x60
    comp.SetParameter(
      0,
      HGACEScct_Decode_getOutput_arg1_xmm0_f32,
      Math.fround(0.0),
      HGACEScct_Decode_getOutput_arg1_xmm2_f32,
      this.bb_f32,
    );
    // @Helium 0x101dd0: compositor.SetParameter(1, cc_f32, dd_f32, 0.15525114f, 0.0f) via vtable *0x60
    comp.SetParameter(
      1,
      this.cc_f32,
      this.dd_f32,
      HGACEScct_Decode_getOutput_arg2_xmm2_f32,
      Math.fround(0.0),
    );
    // @Helium 0x101dd3..0x101dde: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
