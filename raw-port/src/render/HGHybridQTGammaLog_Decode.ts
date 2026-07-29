// raw-port/src/render/HGHybridQTGammaLog_Decode.ts
//
// FCP `HGHybridQTGammaLog::Decode` — nested Helium HGNode subclass.
// Inverse of HGHybridQTGammaLog::Encode. Wraps an owned
// `HgcHybridQTGammaLog_decode` compositor and configures it, via two
// SetParameter calls, to implement the HybridQTGammaLog inverse transfer
// function (a piecewise gamma+log curve) for a selected `CurveParams`
// enum value chosen from the class-static `calcParams` table (7 rows).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_C2.s         (C2 ctor)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_C1.s         (C1 — tail-jmp to C2)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_D2.s         (D2)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_D1.s         (D1)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_D0.s         (D0)
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog.Decode_GetOutput.s  (GetOutput)
//
// SYMBOLS:
//   @Helium 0x1020a0  HGHybridQTGammaLog::Decode::Decode(CurveParams)  [C2]  __ZN18HGHybridQTGammaLog6DecodeC2ENS_11CurveParamsE
//   @Helium 0x1021a0  HGHybridQTGammaLog::Decode::Decode(CurveParams)  [C1] — tail-jmp to C2
//   @Helium 0x1021b0  HGHybridQTGammaLog::Decode::~Decode()            [D2]  __ZN18HGHybridQTGammaLog6DecodeD2Ev
//   @Helium 0x1021f0  HGHybridQTGammaLog::Decode::~Decode()            [D1]  __ZN18HGHybridQTGammaLog6DecodeD1Ev
//   @Helium 0x102230  HGHybridQTGammaLog::Decode::~Decode()            [D0]  __ZN18HGHybridQTGammaLog6DecodeD0Ev
//   @Helium 0x102280  HGHybridQTGammaLog::Decode::GetOutput(HGRenderer*)  __ZN18HGHybridQTGammaLog6Decode9GetOutputEP10HGRenderer
//
// EXTERNAL DATA:
//   @Helium 0x3d1320  HGHybridQTGammaLog::calcParams  __ZN18HGHybridQTGammaLog10calcParamsE
//                     — 7 × 4-double entries (32 B stride, 224 B total, extends to 0x3d1400).
//                     Indexed in the ctor by `%esi` (the CurveParams argument) via
//                     `shl $5,%r14 ; lea calcParams(%rip),%r15 ; movsd (%r14,%r15,1),xmm0` etc.
//                     Rows (byte-exact from thin binary; see PARAM ROWS below):
//                       [0] @0x3d1320  (0.45, 0.156988586799704, 0.242153048019952, 0.911444349863366)
//                       [1] @0x3d1340  (0.65, 0.039413394636874, 0.58754407898788,  0.91163383271243)
//                       [2] @0x3d1360  (0.7,  0.032213844371303, 0.647069904476356, 0.927979840798557)
//                       [3] @0x3d1380  (0.75, 0.025473992510207, 0.706708589068692, 0.943211012261694)
//                       [4] @0x3d13a0  (0.8,  0.019206207568828, 0.766314309661166, 0.957307322378127)
//                       [5] @0x3d13c0  (0.85, 0.013433967356171, 0.825729626565662, 0.970224916230858)
//                       [6] @0x3d13e0  (0.9,  0.008201507308713, 0.884763036183495, 0.98187510020643)
//
//   @Helium 0x3d1400  HGHybridQTGammaLog::kDefaultCurveParams (u32 = 0).
//                     Not referenced from Decode's own code — captured for provenance only.
//
// VTABLE:
//   Installed pointer = 0xa18340. Recovered from ctor @0x1020b5
//     `leaq 0x916284(%rip), %rax` → (0x1020bc + 0x916284) = 0xa18340.
//   All three dtors reinstall the same target via different `leaq`
//   displacements (D2 @0x1021b6 → 0x1021bd + 0x916183 = 0xa18340;
//   D1 @0x1021f6 → 0x1021fd + 0x916143 = 0xa18340;
//   D0 @0x102239 → 0x102240 + 0x916100 = 0xa18340).
//
// CTOR ARG ORDER (@0x1020a0):
//   rdi = this
//   esi = curveParams  (CurveParams enum, u32 index into calcParams; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 @0x1020a0 + GetOutput @0x102280):
//   HGHybridQTGammaLog::Decode extends HGNode (base ctor @0x1020b0, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HgcHybridQTGammaLog_decode*  compositor  (alloc'd + ctor'd @0x1020c4/0x1020cf)
//     0x1a0 : float                        pow_field   (log-segment SetParameter arg #0)
//     0x1a4 : float                        invClnL     (linear-segment SetParameter arg #1)
//     0x1a8 : float                        cLo         (linear-segment SetParameter arg #2)
//     0x1ac : float                        negDivClnL  (linear-segment SetParameter arg #3)
//   Total = 0x1b0. All four floats written together via a single
//   `movapd %xmm0, 0x1a0(%rbx)` @0x102153.
//
// CTOR TAIL MATH (@0x1020db..0x102153) — verbatim decode of the packed math:
//   r14 = curveParams (u32, zero-extended)
//   r14 <<= 5                             ; ×32-byte stride
//   r15 = &calcParams                     @0x1020e2
//   xmm0 = calcParams[i].d0                @0x1020e9  (movsd (r14+r15))    ; = p.d0
//   xmm1 = calcParams[i].d1                @0x1020ef  (movsd 0x08(r14+r15)); = p.d1
//   -0x20(%rbp) = xmm1                     @0x1020f6  (save p.d1)
//   xmm1 = 0.5112474437627812              @0x1020fb  (movsd 0x2ced3d(%rip); mem @0x3d0e40)
//   callq _pow                             @0x102103   ; xmm0 = pow(p.d0, 0.5112474437627812)
//   xmm2 = p.d1  (reloaded)                @0x102108
//   xmm2 *= 0.6931471805599453             @0x10210d  (mulsd 0x2ced23(%rip); mem @0x3d0e38 = ln 2)
//     ⟹ xmm2 = p.d1 * ln2
//   xmm1 = 1.0                             @0x102115  (movsd 0x2c8143(%rip); mem @0x3ca260)
//   xmm1 /= xmm2                           @0x10211d
//     ⟹ xmm1 = 1.0 / (p.d1 * ln2)
//   xmm3 = xmm2   (= p.d1 * ln2, save)     @0x102121
//   xmm2 = p.d3                            @0x102125  (movsd 0x18(r14+r15))
//   xmm2 xor= -0.0                         @0x10212c  (xorpd 0x2c89ac(%rip); mem @0x3caae0 = -0.0)
//     ⟹ xmm2 = -p.d3            (sign-flip via xor with 0x8000000000000000 in low lane)
//   xmm2 /= xmm3                           @0x102134
//     ⟹ xmm2 = -p.d3 / (p.d1 * ln2)
//   xmm3 = p.d2                            @0x102138  (movsd 0x10(r14+r15))
//   unpcklpd xmm2, xmm3                    @0x10213f
//     ⟹ xmm3 (packed doubles) = [p.d2, -p.d3/(p.d1*ln2)]
//   unpcklpd xmm1, xmm0                    @0x102143
//     ⟹ xmm0 (packed doubles) = [pow(p.d0, 0.5112474437627812), 1.0/(p.d1*ln2)]
//   cvtpd2ps xmm0, xmm0                    @0x102147  ; two low f32 lanes
//   cvtpd2ps xmm3, xmm1                    @0x10214b  ; two low f32 lanes
//   unpcklpd xmm1, xmm0                    @0x10214f  ; xmm0 (packed) = [xmm0_lo, xmm1_lo]
//     ⟹ xmm0 as 4 f32s = [pow_field, invClnL, cLo, negDivClnL]
//   movapd xmm0, 0x1a0(%rbx)               @0x102153  ; store all four f32 fields at once
//
//   Equivalently, the four f32 subclass fields evaluate to:
//     pow_field  = f32( pow(p.d0, 0.5112474437627812) )     // stored @0x1a0
//     invClnL    = f32( 1.0 / (p.d1 * ln2) )                // stored @0x1a4
//     cLo        = f32( p.d2 )                              // stored @0x1a8
//     negDivClnL = f32( -p.d3 / (p.d1 * ln2) )              // stored @0x1ac
//   All four are packed by the C compiler via CVTPD2PS + UNPCKLPD; we compute
//   them scalar-wise in TS and pass through Math.fround to match the SIMD
//   `cvtpd2ps` narrowing (f32 rounding on each lane independently).
//
// GETOUTPUT (@0x102280..0x102309) — rendering-graph wiring:
//   1) input   = HGRenderer::GetInput(this, 0)                    @0x102299
//   2) compositor.vtable[0x78] (segment 0, input=input)           @0x1022a9
//        args: esi=0, rdx=input.
//   3) compositor.vtable[0x60] (esi=0, xmm0=pow_field,
//                                     xmm1=0.0f, xmm2=0.0f, xmm3=0.0f)   @0x1022c9
//   4) compositor.vtable[0x60] (esi=1, xmm0=1.9559999704360962f,
//                                     xmm1=invClnL, xmm2=cLo, xmm3=negDivClnL) @0x1022fb
//      (xmm0 loaded from RIP-relative constant @Helium 0x3d0fbc = 0x3ffa5e35 f32.)
//   5) return this.compositor                                     @0x1022fe
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcHybridQTGammaLog_decode::HgcHybridQTGammaLog_decode()  @Helium __ZN26HgcHybridQTGammaLog_decodeC1Ev — invoked @0x1020cf
//   HgcHybridQTGammaLog_decode vtable slot *0x60             (SetParameter-like) — invoked twice from GetOutput
//   HgcHybridQTGammaLog_decode vtable slot *0x78             (SetInput-like)     — invoked once from GetOutput
//   HgcHybridQTGammaLog_decode vtable slot *0x18             (Release)           — invoked from dtors
//   HGObject::operator new(unsigned long)     @Helium __ZN8HGObjectnwEm  — invoked @0x1020c4
//   HGObject::operator delete(void*)          @Helium __ZN8HGObjectdlEPv — invoked @0x102266 (D0) / @0x10216c (C2 unwind)
//   HGRenderer::GetInput(HGNode*, int)        @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x102299
//   pow (libm)                                @Helium __stub 0x3c54ec — invoked @0x102103 in C2 (base←xmm0, exp←xmm1)
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * The `GetInput` method is invoked at @Helium 0x102299 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x102299 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.field_198`.
 * Not yet transcribed — see raw-port/army/ledger for
 * HgcHybridQTGammaLog_decode. Only the three vtable slots vcalled from
 * HGHybridQTGammaLog::Decode are exposed here; each throws until the
 * class is ported.
 */
export interface HgcHybridQTGammaLog_decode {
  /** vtable *0x18 @Helium — invoked from ~Decode (D2 @0x1021d5, D1 @0x102215, D0 @0x102252). */
  Release(): void;
  /**
   * vtable *0x60 @Helium — invoked twice from GetOutput (@0x1022c9, @0x1022fb).
   * Argument order (esi, xmm0, xmm1, xmm2, xmm3) as f32 values.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /**
   * vtable *0x78 @Helium — invoked once from GetOutput (@0x1022a9).
   * Argument order (esi, rdx) — the second arg is the upstream input node.
   */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHgcHybridQTGammaLog_decode()` — placeholder for the compositor
 * allocation + ctor sequence at @Helium 0x1020bf..0x1020cf.
 *
 * The binary emits:
 *   0x1020bf  movl  $0x1a0, %edi                          ; alloc size = 0x1A0 = 416 bytes
 *   0x1020c4  callq __ZN8HGObjectnwEm                     ; HGObject::operator new(unsigned long)
 *   0x1020cf  callq __ZN26HgcHybridQTGammaLog_decodeC1Ev  ; placement-ctor
 * — i.e. `new HgcHybridQTGammaLog_decode()`. Both callees are undecoded, so this
 * stub throws (rule 3: loud gap, not silent approximation).
 */
function newHgcHybridQTGammaLog_decode(): HgcHybridQTGammaLog_decode {
  throw new Error(
    'HGHybridQTGammaLog::Decode: HgcHybridQTGammaLog_decode ctor + HGObject::operator new @Helium 0x1020c4/0x1020cf not yet transcribed',
  );
}

// ---------------------------------------------------------------------------
// HGHybridQTGammaLog::CurveParams — enum indexing into the class-static
// `calcParams` table (@Helium 0x3d1320). Seven rows, 32-byte stride, so the
// enum is a u32 in [0..6]. The ctor asm shifts `%esi` left by 5 to form the
// byte offset (`shl $5,%r14 ; movsd (%r14,%r15)`), so any out-of-range value
// would silently read adjacent memory in the binary. We keep the enum
// contract as a numeric integer to match the C++ ABI verbatim.
// ---------------------------------------------------------------------------

/**
 * CurveParams — the enum value passed as `%esi` at @Helium 0x1020a0. Indexes
 * into `HGHybridQTGammaLog::calcParams` (7 rows). Values recovered from the
 * table @Helium 0x3d1320..0x3d1400 and matching the u32 `kDefaultCurveParams`
 * (= 0) @Helium 0x3d1400.
 */
export type CurveParams = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * `HGHybridQTGammaLog::calcParams` — class-static array of 7 rows of 4
 * doubles each, at @Helium 0x3d1320..0x3d1400 (mangled
 * `__ZN18HGHybridQTGammaLog10calcParamsE`).
 *
 * Each row `p = (p.d0, p.d1, p.d2, p.d3)` feeds the ctor's tail math to
 * derive the four f32 subclass fields (see file header CTOR TAIL MATH).
 *
 * Values are the exact IEEE 754 double bit-patterns from the thin binary
 * (verified via `resolve.py Helium const 0x…`); the u64 raw hex for each
 * cell is repeated in a comment on its line to keep the byte-for-byte
 * provenance next to the value (rule 2).
 */
const HGHybridQTGammaLog_calcParams: readonly (readonly [number, number, number, number])[] = [
  // @Helium 0x3d1320  raw u64: (0x3fdccccccccccccd, 0x3fc41833b71332be, 0x3fcefedefeefab2d, 0x3fed2a8d5759303e)
  [0.45, 0.156988586799704, 0.242153048019952, 0.911444349863366],
  // @Helium 0x3d1340  raw u64: (0x3fe4cccccccccccd, 0x3fa42dfe11fabc02, 0x3fe2cd293d86c3ab, 0x3fed2c1ab72daa2a)
  [0.65, 0.039413394636874, 0.58754407898788, 0.91163383271243],
  // @Helium 0x3d1360  raw u64: (0x3fe6666666666666, 0x3fa07e55401b3a6b, 0x3fe4b4cbf1be7517, 0x3fedb202c7727783)
  [0.7, 0.032213844371303, 0.647069904476356, 0.927979840798557],
  // @Helium 0x3d1380  raw u64: (0x3fe8000000000000, 0x3f9a15dab2eb67c3, 0x3fe69d5b54bb4655, 0x3fee2ec8dc5c8353)
  [0.75, 0.025473992510207, 0.706708589068692, 0.943211012261694],
  // @Helium 0x3d13a0  raw u64: (0x3fe999999999999a, 0x3f93aacac58d9f8c, 0x3fe885a5964e72e4, 0x3feea242f73abb78)
  [0.8, 0.019206207568828, 0.766314309661166, 0.957307322378127],
  // @Helium 0x3d13c0  raw u64: (0x3feb333333333333, 0x3f8b8344939a2f90, 0x3fea6c6089ae028c, 0x3fef0c151f9f3a5e)
  [0.85, 0.013433967356171, 0.825729626565662, 0.970224916230858],
  // @Helium 0x3d13e0  raw u64: (0x3feccccccccccccd, 0x3f80cbf3ad59c222, 0x3fec4ffa9223c4d2, 0x3fef6b855484963d)
  [0.9, 0.008201507308713, 0.884763036183495, 0.98187510020643],
] as const;

// ---------------------------------------------------------------------------
// RIP-relative double-precision constants read in the ctor (@0x1020a0).
// All four are verified via `resolve.py Helium const 0x…`; the resulting
// double values (byte-exact from the thin binary) drive the tail math.
// ---------------------------------------------------------------------------

/**
 * Exponent for the `pow` call in the ctor. Loaded as a double @Helium 0x3d0e40.
 * @Helium `movsd 0x2ced3d(%rip), %xmm1` @0x1020fb → data @0x3d0e40 = 0x3fe05c239963fde8 = 0.5112474437627812.
 * Numerically = 1/1.9559999704360962 ≈ 1/gamma where the reciprocal `gamma`
 * (1.956f) reappears as the linear-segment SetParameter arg 0 in GetOutput
 * (@0x1022ee) — this is the inverse-gamma coupling between the two halves.
 */
const HGHybridQTGammaLog_Decode_pow_exponent: number = 0.5112474437627812;

/**
 * Natural log of 2 (double), loaded to scale the second calcParams column.
 * @Helium `mulsd 0x2ced23(%rip), %xmm2` @0x10210d → data @0x3d0e38 = 0x3fe62e42fefa39ef = 0.6931471805599453.
 * = Math.LN2 to double-precision. Used as `xmm2 = p.d1 * ln2` before the
 * reciprocal that produces the `invClnL` and `negDivClnL` fields.
 */
const HGHybridQTGammaLog_Decode_ln2: number = 0.6931471805599453;

/**
 * 1.0 as an IEEE 754 double. Loaded as the numerator of `1.0 / (p.d1*ln2)`.
 * @Helium `movsd 0x2c8143(%rip), %xmm1` @0x102115 → data @0x3ca260 = 0x3ff0000000000000 = 1.0.
 */
const HGHybridQTGammaLog_Decode_one: number = 1.0;

/**
 * IEEE 754 double sign-mask constant, used as `xorpd` operand to flip the
 * sign of `p.d3`.
 * @Helium `xorpd 0x2c89ac(%rip), %xmm2` @0x10212c → data @0x3caae0 = 0x8000000000000000 = -0.0.
 * In the low 8-byte lane, `xorpd -0.0, p.d3` is exactly `-p.d3` (the high
 * lane is unused — `xmm2` holds a scalar double here). We model this as
 * an ordinary negation; the sign-bit-flip is bit-exact for finite inputs.
 */
const HGHybridQTGammaLog_Decode_negZero: number = -0.0;
void HGHybridQTGammaLog_Decode_negZero; // referenced for provenance; the negation is performed by unary `-`.

/**
 * f32 immediate loaded into `%xmm0` for the second (linear-segment)
 * SetParameter call in GetOutput.
 * @Helium `movss 0x2cecc6(%rip), %xmm0` @0x1022ee → data @0x3d0fbc = 0x3ffa5e35 f32 = 1.9559999704360962.
 * Numerically ≈ 1 / HGHybridQTGammaLog_Decode_pow_exponent (0.5112474437627812).
 * This is the DECODE gamma the compositor applies in its linear-segment
 * branch: given an encoded value `y`, the linear branch computes
 * `pow_field * pow(y, 1.956)` (or similar — the exact expression lives in
 * the undecoded HgcHybridQTGammaLog_decode compositor; we transcribe only
 * the coefficients the binary hands the shader, per PORTING_SPEC rule 1).
 */
const HGHybridQTGammaLog_Decode_getOutput_arg2_xmm0_f32: number = Math.fround(1.9559999704360962);

/**
 * `HGHybridQTGammaLog::Decode` — Helium HGNode subclass. Wraps an owned
 * `HgcHybridQTGammaLog_decode` compositor configured for HybridQTGammaLog
 * inverse decoding, using a `CurveParams` enum to pick one of 7 static
 * parameter rows.
 *
 * @Helium ctors  @0x1020a0 (C2) / @0x1021a0 (C1);
 *         dtors  @0x1021b0 (D2) / @0x1021f0 (D1) / @0x102230 (D0);
 *         GetOutput @0x102280.
 */
export class HGHybridQTGammaLogDecode extends HGNode {
  /**
   * Owned `HgcHybridQTGammaLog_decode` compositor. Field @0x198 in the C++
   * layout. Assigned once in the ctor @0x1020d4:
   * `movq %r15, 0x198(%rbx)`. No pre-existing-pointer check — this is a
   * fresh HGNode subclass whose base ctor leaves 0x198 uninitialized.
   */
  compositor: HgcHybridQTGammaLog_decode | null;

  /**
   * Log-segment SetParameter arg #0 (xmm0), as float32. Field @0x1a0.
   * Written by the packed `movapd %xmm0, 0x1a0(%rbx)` @0x102153 (low f32 lane).
   * Value = f32(pow(p.d0, 0.5112474437627812)) where `p = calcParams[curveParams]`.
   */
  pow_field: number;

  /**
   * Linear-segment SetParameter arg #1 (xmm1), as float32. Field @0x1a4.
   * Written by the packed `movapd` @0x102153 (second f32 lane).
   * Value = f32(1.0 / (p.d1 * ln2)).
   */
  invClnL: number;

  /**
   * Linear-segment SetParameter arg #2 (xmm2), as float32. Field @0x1a8.
   * Written by the packed `movapd` @0x102153 (third f32 lane).
   * Value = f32(p.d2).
   */
  cLo: number;

  /**
   * Linear-segment SetParameter arg #3 (xmm3), as float32. Field @0x1ac.
   * Written by the packed `movapd` @0x102153 (fourth f32 lane).
   * Value = f32(-p.d3 / (p.d1 * ln2)).
   */
  negDivClnL: number;

  /**
   * `HGHybridQTGammaLog::Decode::Decode(CurveParams)` — Helium @0x1020a0
   * (C2 base-object ctor). C1 @0x1021a0 is a byte-for-byte `jmp` tail-call
   * to C2, so only C2's body needs modelling.
   *
   * Verbatim asm (@0x1020a0..0x102165 body; @0x102166..0x102190 unwind
   * cleanup elided — exception path only, never executes on a successful
   * construction):
   *   0x1020aa  movl  %esi, %r14d                     ; r14d = curveParams
   *   0x1020ad  movq  %rdi, %rbx                      ; rbx = this
   *   0x1020b0  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x1020b5  leaq  0x916284(%rip), %rax  ; = 0xa18340 (own vtable installed ptr)
   *   0x1020bc  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x1020bf  movl  $0x1a0, %edi                    ; alloc size 0x1A0
   *   0x1020c4  callq __ZN8HGObjectnwEm               ; HGObject::operator new
   *   0x1020c9  movq  %rax, %r15                      ; r15 = compositor ptr
   *   0x1020cc  movq  %rax, %rdi
   *   0x1020cf  callq __ZN26HgcHybridQTGammaLog_decodeC1Ev  ; placement-ctor
   *   0x1020d4  movq  %r15, 0x198(%rbx)               ; this.compositor = r15
   *   0x1020db  movl  %r14d, %r14d                    ; zero-extend curveParams to r14
   *   0x1020de  shlq  $0x5, %r14                      ; byte offset = curveParams * 32
   *   0x1020e2  leaq  __ZN18HGHybridQTGammaLog10calcParamsE(%rip), %r15
   *                                                    ; r15 = &calcParams
   *   0x1020e9  movsd (%r14,%r15), %xmm0              ; xmm0 = p.d0
   *   0x1020ef  movsd 0x8(%r14,%r15), %xmm1           ; xmm1 = p.d1
   *   0x1020f6  movsd %xmm1, -0x20(%rbp)              ; spill p.d1
   *   0x1020fb  movsd 0x2ced3d(%rip), %xmm1           ; xmm1 = 0.5112474437627812  (@0x3d0e40)
   *   0x102103  callq _pow                            ; xmm0 = pow(p.d0, 0.5112474437627812)
   *   0x102108  movsd -0x20(%rbp), %xmm2              ; xmm2 = p.d1
   *   0x10210d  mulsd 0x2ced23(%rip), %xmm2           ; xmm2 = p.d1 * ln2         (@0x3d0e38)
   *   0x102115  movsd 0x2c8143(%rip), %xmm1           ; xmm1 = 1.0                (@0x3ca260)
   *   0x10211d  divsd %xmm2, %xmm1                    ; xmm1 = 1.0 / (p.d1*ln2)
   *   0x102121  movapd %xmm2, %xmm3                   ; xmm3 = p.d1*ln2
   *   0x102125  movsd 0x18(%r14,%r15), %xmm2          ; xmm2 = p.d3
   *   0x10212c  xorpd 0x2c89ac(%rip), %xmm2           ; xmm2 = -p.d3              (@0x3caae0 = -0.0)
   *   0x102134  divsd %xmm3, %xmm2                    ; xmm2 = -p.d3/(p.d1*ln2)
   *   0x102138  movsd 0x10(%r14,%r15), %xmm3          ; xmm3 = p.d2
   *   0x10213f  unpcklpd %xmm2, %xmm3                 ; xmm3 = [p.d2, -p.d3/(p.d1*ln2)]
   *   0x102143  unpcklpd %xmm1, %xmm0                 ; xmm0 = [pow_field_d, 1.0/(p.d1*ln2)]
   *   0x102147  cvtpd2ps %xmm0, %xmm0                 ; low 2 f32s = [pow_field, invClnL]
   *   0x10214b  cvtpd2ps %xmm3, %xmm1                 ; low 2 f32s = [cLo, negDivClnL]
   *   0x10214f  unpcklpd %xmm1, %xmm0                 ; xmm0 (4 f32) = [pow_field, invClnL, cLo, negDivClnL]
   *   0x102153  movapd %xmm0, 0x1a0(%rbx)             ; store 4 f32 fields
   *   0x10215b..0x102165  epilogue
   *
   * @param curveParams  the `CurveParams` enum selecting one of 7 rows
   *                     of `HGHybridQTGammaLog::calcParams`. Must be
   *                     in [0..6]; out-of-range values would read
   *                     adjacent binary memory in the C++ ABI.
   */
  constructor(curveParams: CurveParams) {
    // @Helium 0x1020b0: HGNode base ctor
    super();
    // @Helium 0x1020bc: install this class's vtable (installed ptr = 0xa18340).
    this.vtable = 0xa18340;
    // @Helium 0x1020bf..0x1020cf: alloc 0x1a0 bytes + HgcHybridQTGammaLog_decode ctor.
    // Throws until HgcHybridQTGammaLog_decode is transcribed (see stub above).
    const newComp = newHgcHybridQTGammaLog_decode();
    // @Helium 0x1020d4: store compositor. (No release-old path: the field
    // is uninitialized until this write — see comment on the field.)
    this.compositor = newComp;

    // @Helium 0x1020db..0x1020e9: r14 = curveParams * 32; load row `p`.
    // Modelled as a direct array lookup — the C compiler emitted an indexed
    // scaled memory access, but the observable effect is identical.
    const p = HGHybridQTGammaLog_calcParams[curveParams];
    if (p === undefined) {
      // The C++ ABI would silently over-read here; a loud throw is safer
      // (rule 3: never approximate on undefined inputs).
      throw new Error(
        `HGHybridQTGammaLog::Decode: curveParams=${curveParams} out of range [0..6] @Helium 0x1020de`,
      );
    }
    const pd0 = p[0];
    const pd1 = p[1];
    const pd2 = p[2];
    const pd3 = p[3];

    // @Helium 0x1020fb..0x102103: xmm0 = pow(p.d0, 0.5112474437627812).
    // libm `pow` is invoked via a symbol stub @0x3c54ec — we use
    // JS `Math.pow`, which is IEEE 754 compliant for double inputs. Both
    // arguments are doubles here; the narrowing to f32 happens later at
    // the cvtpd2ps step (@0x102147).
    const powDbl = Math.pow(pd0, HGHybridQTGammaLog_Decode_pow_exponent);

    // @Helium 0x102108..0x10210d: xmm2 = p.d1 * ln2 (double).
    const pd1_ln2 = pd1 * HGHybridQTGammaLog_Decode_ln2;

    // @Helium 0x102115..0x10211d: xmm1 = 1.0 / (p.d1 * ln2) (double).
    const invClnL_dbl = HGHybridQTGammaLog_Decode_one / pd1_ln2;

    // @Helium 0x102125..0x102134: xmm2 = -p.d3 / (p.d1 * ln2).
    // The binary does the sign-flip via `xorpd -0.0, p.d3` (bit-flip of the
    // IEEE 754 sign bit) before dividing; unary `-` on a finite double is
    // bit-equivalent. On NaN inputs the sign-flip vs `-` differ in the NaN
    // payload's sign bit but not in orderedness; calcParams rows are all
    // finite positives so no observable difference.
    const negDivClnL_dbl = -pd3 / pd1_ln2;

    // @Helium 0x102147..0x10214f: pack four doubles into four f32 lanes.
    // Each cvtpd2ps lane narrows independently; Math.fround per scalar is
    // the standard TS mirror of x86 f32 rounding (PORTING_SPEC rule 4).
    // @Helium 0x102153 writes them all at once to +0x1a0..+0x1ac.
    this.pow_field  = Math.fround(powDbl);          // +0x1a0
    this.invClnL    = Math.fround(invClnL_dbl);     // +0x1a4
    this.cLo        = Math.fround(pd2);             // +0x1a8
    this.negDivClnL = Math.fround(negDivClnL_dbl);  // +0x1ac
  }

  /**
   * `HGHybridQTGammaLog::Decode::~Decode()` — Helium @0x1021b0 (D2,
   * base-object) / @0x1021f0 (D1, complete-object) / @0x102230 (D0,
   * deleting). All three share the same body up through the base-dtor
   * call; D0 additionally tail-calls `HGObject::operator delete`. Bodies
   * verbatim:
   *
   * D2 @0x1021b0..0x1021e1 (verbatim, ex-handler @0x1021e6..0x1021ee elided):
   *   0x1021b6  leaq  0x916183(%rip), %rax   ; = 0xa18340 (own installed vtable ptr)
   *   0x1021bd  movq  %rax, (%rdi)           ; *this = vtable (reinstall)
   *   0x1021c0  movq  0x198(%rdi), %rax      ; rax = compositor
   *   0x1021c7  testq %rax, %rax
   *   0x1021ca  je    0x1021db               ; skip if null
   *   0x1021cc  movq  (%rax), %rcx           ; rcx = compositor.vtable
   *   0x1021cf  movq  %rdi, %rbx             ; save this
   *   0x1021d2  movq  %rax, %rdi             ; rdi = compositor
   *   0x1021d5  callq *0x18(%rcx)            ; compositor.Release()  (vtable slot 0x18)
   *   0x1021d8  movq  %rbx, %rdi             ; restore this
   *   0x1021e1  jmp   __ZN6HGNodeD2Ev        ; tail-call HGNode base dtor
   *
   * D1 @0x1021f0 is byte-identical to D2 (only the leaq PC and displacement
   * differ, resolving to the same 0xa18340 vtable installed ptr). D0
   * @0x102230 differs only in that after the HGNode dtor call, the epilogue
   * `jmp __ZN8HGObjectdlEPv` frees `this` via HGObject::operator delete; we
   * model D0's operator-delete step at the JS caller (i.e. dropping the
   * reference — no explicit call needed).
   */
  destruct(): void {
    // @Helium 0x1021bd: vtable reinstall — modeled by assignment.
    this.vtable = 0xa18340;
    // @Helium 0x1021c0..0x1021d5: release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x1021e1: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGHybridQTGammaLog::Decode::GetOutput(HGRenderer*)` — Helium @0x102280.
   *
   * Wires the owned `HgcHybridQTGammaLog_decode` compositor into the render
   * graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the compositor as its input at slot 0 (vtable *0x78)
   *   3) call SetParameter for segment 0 (esi=0) with
   *        (xmm0=pow_field, xmm1=0.0f, xmm2=0.0f, xmm3=0.0f)
   *   4) call SetParameter for segment 1 (esi=1) with
   *        (xmm0=1.9559999704360962f, xmm1=invClnL, xmm2=cLo, xmm3=negDivClnL)
   *   5) return the compositor as this node's output.
   *
   * Verbatim asm (@0x102280..0x102309, prologue/epilogue elided):
   *   0x10228a  movq  0x198(%rdi), %r14                ; r14 = this.compositor
   *   0x102291  movq  %rsi, %rdi                       ; rdi = renderer
   *   0x102294  movq  %rbx, %rsi                       ; rsi = this
   *   0x102297  xorl  %edx, %edx                       ; edx = 0
   *   0x102299  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x10229e  movq  (%r14), %rcx                     ; rcx = compositor.vtable
   *   0x1022a1  movq  %r14, %rdi                       ; rdi = compositor
   *   0x1022a4  xorl  %esi, %esi                       ; esi = 0
   *   0x1022a6  movq  %rax, %rdx                       ; rdx = input
   *   0x1022a9  callq *0x78(%rcx)                      ; compositor.SetInput(0, input)
   *   0x1022ac  movq  0x198(%rbx), %rdi                ; rdi = this.compositor
   *   0x1022b3  movss 0x1a0(%rbx), %xmm0               ; xmm0 = this.pow_field
   *   0x1022bb  movq  (%rdi), %rax                     ; rax = compositor.vtable
   *   0x1022be  xorps %xmm1, %xmm1                     ; xmm1 = 0.0f
   *   0x1022c1  xorps %xmm2, %xmm2                     ; xmm2 = 0.0f
   *   0x1022c4  xorps %xmm3, %xmm3                     ; xmm3 = 0.0f
   *   0x1022c7  xorl  %esi, %esi                       ; esi = 0
   *   0x1022c9  callq *0x60(%rax)                      ; compositor.SetParameter(0, pow_field, 0, 0, 0)
   *   0x1022cc  movq  0x198(%rbx), %rdi                ; rdi = this.compositor
   *   0x1022d3  movss 0x1a4(%rbx), %xmm1               ; xmm1 = this.invClnL
   *   0x1022db  movss 0x1a8(%rbx), %xmm2               ; xmm2 = this.cLo
   *   0x1022e3  movss 0x1ac(%rbx), %xmm3               ; xmm3 = this.negDivClnL
   *   0x1022eb  movq  (%rdi), %rax                     ; rax = compositor.vtable
   *   0x1022ee  movss 0x2cecc6(%rip), %xmm0            ; xmm0 = 1.9559999704360962f  (@0x3d0fbc)
   *   0x1022f6  movl  $0x1, %esi                       ; esi = 1
   *   0x1022fb  callq *0x60(%rax)                      ; compositor.SetParameter(1, 1.956f, invClnL, cLo, negDivClnL)
   *   0x1022fe  movq  0x198(%rbx), %rax                ; rax = this.compositor
   *   0x102309  retq                                   ; return rax
   *
   * @param renderer  the containing HGRenderer (undecoded; only its
   *                  `GetInput` method is touched).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of the node graph for this filter).
   *
   * Throws if the compositor field is null (should be impossible after a
   * successful ctor) or if the compositor's vtable slots aren't yet
   * transcribed (they aren't — see HgcHybridQTGammaLog_decode stub above).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x10228a: rax = this.compositor. Invariant: non-null after ctor.
    const comp = this.compositor;
    if (comp == null) {
      // Not modelling the C++ path where this is unreachable — but
      // TypeScript's type-narrowing wants it, and a loud fault here
      // is preferable to `!` shorthand (rule 3).
      throw new Error(
        'HGHybridQTGammaLog::Decode::GetOutput @Helium 0x10228a — compositor null (should be unreachable after ctor)',
      );
    }
    // @Helium 0x102299: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x1022a9: compositor.SetInput(0, input) via vtable *0x78
    comp.SetInput(0, input);
    // @Helium 0x1022c9: compositor.SetParameter(0, pow_field, 0.0f, 0.0f, 0.0f) via vtable *0x60
    comp.SetParameter(
      0,
      this.pow_field,
      Math.fround(0.0),
      Math.fround(0.0),
      Math.fround(0.0),
    );
    // @Helium 0x1022fb: compositor.SetParameter(1, 1.956f, invClnL, cLo, negDivClnL) via vtable *0x60
    comp.SetParameter(
      1,
      HGHybridQTGammaLog_Decode_getOutput_arg2_xmm0_f32,
      this.invClnL,
      this.cLo,
      this.negDivClnL,
    );
    // @Helium 0x1022fe..0x102309: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}

