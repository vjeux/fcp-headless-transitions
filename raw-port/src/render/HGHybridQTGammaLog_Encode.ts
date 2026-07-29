// raw-port/src/render/HGHybridQTGammaLog_Encode.ts
//
// FCP `HGHybridQTGammaLog::Encode` — nested Helium HGNode subclass. Wraps
// an owned `HgcHybridQTGammaLog_encode` compositor and configures it,
// via two SetParameter calls, to implement a QuickTime "Hybrid Gamma
// Log" forward transfer function (linear → hybrid-QT-gamma-log encoded
// video) parameterised by an enum `CurveParams` (0..6). The per-curve
// coefficients live in the static table `HGHybridQTGammaLog::calcParams`
// (@Helium 0x3d1320) — a 7-row array of 4 doubles per row.
//
// Structural cousin of `HGACEScct::Encode`
// (raw-port/src/render/HGACEScct_Encode.ts) and `HGARRILogC::Encode`
// (raw-port/src/render/HGARRILogC_Encode.ts). Same nested-class facade
// (HGNode subclass owning a segmented log-video compositor + a small
// packed coefficient block), no HGColorMatrix stage, no `.cold.*`
// static-local initialisers — the per-curve numbers are indexed from a
// module-level constant table, not lazily computed statics.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY (source of every citation below):
//   raw-port/re/disasm/Helium.HGHybridQTGammaLog::Encode.all.s
//   (single file containing C2/C1/D2/D1/D0/GetOutput).
//
// SYMBOLS:
//   @Helium 0x101de0  HGHybridQTGammaLog::Encode::Encode(CurveParams)      [C2]  __ZN18HGHybridQTGammaLog6EncodeC2ENS_11CurveParamsE
//   @Helium 0x101e90  HGHybridQTGammaLog::Encode::Encode(CurveParams)      [C1]  __ZN18HGHybridQTGammaLog6EncodeC1ENS_11CurveParamsE
//   @Helium 0x101f40  HGHybridQTGammaLog::Encode::~Encode()                 [D2]  __ZN18HGHybridQTGammaLog6EncodeD2Ev
//   @Helium 0x101f80  HGHybridQTGammaLog::Encode::~Encode()                 [D1]  __ZN18HGHybridQTGammaLog6EncodeD1Ev
//   @Helium 0x101fc0  HGHybridQTGammaLog::Encode::~Encode()                 [D0]  __ZN18HGHybridQTGammaLog6EncodeD0Ev
//   @Helium 0x102010  HGHybridQTGammaLog::Encode::GetOutput(HGRenderer*)   __ZN18HGHybridQTGammaLog6Encode9GetOutputEP10HGRenderer
//   @Helium 0x3d1320  HGHybridQTGammaLog::calcParams                       __ZN18HGHybridQTGammaLog10calcParamsE  [static data, 7×32 bytes]
//   @Helium 0xa180f0  vtable for HGHybridQTGammaLog::Encode                __ZTVN18HGHybridQTGammaLog6EncodeE
//   @Helium 0xa1add0  typeinfo for HGHybridQTGammaLog::Encode              __ZTIN18HGHybridQTGammaLog6EncodeE
//
// VTABLE installed-ptr = vtable-base + 0x10 = 0xa180f0 + 0x10 = 0xa18100.
// C2 @0x101df5 emits `leaq 0x916304(%rip), %rax` → 0x101dfc + 0x916304 = 0xa18100.
// C1 @0x101ea5 leaq 0x916254(%rip) → 0x101eac + 0x916254 = 0xa18100.
// D2 @0x101f46 leaq 0x9161b3(%rip) → 0x101f4d + 0x9161b3 = 0xa18100.
// D1 @0x101f86 leaq 0x916173(%rip) → 0x101f8d + 0x916173 = 0xa18100.
// D0 @0x101fc9 leaq 0x916130(%rip) → 0x101fd0 + 0x916130 = 0xa18100. ✓
//
// CTOR ARG ORDER (from `movl %esi, %r14d` @0x101dea):
//   rdi = this
//   esi = curveParams (u32 enum index into HGHybridQTGammaLog::calcParams; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 @0x101de0 + GetOutput @0x102010):
//   HGHybridQTGammaLog::Encode extends HGNode (base ctor called @0x101df0,
//   so HGNode occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts).
//   This subclass adds a compositor pointer + 4 packed float32 coefficients
//   stored via a single 16-byte `movapd`:
//     0x198 : HgcHybridQTGammaLog_encode* compositor
//                (allocated 0x1a0 bytes @0x101dff/0x101e04, ctor'd @0x101e0f, stored @0x101e14)
//     0x1a0 : float  coeff_a_f32   (= f32(row[0]) i.e. row.d0)
//     0x1a4 : float  coeff_b_f32   (= f32(row[1] * ln(2)) i.e. row.d1 * ln(2), narrowed to float32)
//     0x1a8 : float  coeff_c_f32   (= f32(row[2]) i.e. row.d2)
//     0x1ac : float  coeff_d_f32   (= f32(row[3]) i.e. row.d3)
//   Total sizeof = 0x1b0 (aligned). No further fields touched by any
//   ported entry point. Names `coeff_a..d` are STRUCTURAL (offset-based),
//   not spec-derived — this class's exact QT-hybrid-gamma-log curve
//   parametrisation is decoded inside HgcHybridQTGammaLog_encode
//   (undecoded); we deliberately do NOT invent spec names for these four
//   fields.
//
// CTOR TAIL MATH (@0x101e1b..0x101e56) — pack 4 float32 coefficients from
// the selected calcParams row into a single 16-byte store at this+0x1a0:
//   shlq $5 on esi → row offset = curveParams * 0x20             (rows are 32 bytes = 4 doubles)
//   leaq HGHybridQTGammaLog::calcParams(%rip), rcx               (@Helium 0x3d1320)
//   xmm0 = row[1] (double @ +0x08) * const_ln2                   (const_ln2 from RIP-rel)
//   xmm1 = row[0] (double @ +0x00)
//   xmm1 = unpcklpd(xmm1, xmm0)                                  packed doubles [row[0], row[1]*ln2]
//   xmm0 = cvtpd2ps(row[2..3] as 16-byte packed doubles @ +0x10)  → [f2_f32, f3_f32, 0, 0]
//   xmm1 = cvtpd2ps(xmm1)                                        → [f0_f32, (f1*ln2)_f32, 0, 0]
//   xmm1 = unpcklpd(xmm1, xmm0)                                  → [f0_f32, (f1*ln2)_f32, f2_f32, f3_f32]
//   movapd xmm1, 0x1a0(rbx)                                      store 4 float32s at 0x1a0..0x1af
//
// RIP-RELATIVE CONSTANTS (bit-exact, verified via resolve.py):
//   @Helium 0x3d0e38  double  0.6931471805599453 = ln(2)
//                     Loaded @0x101e2f (C2) / @0x101edf (C1) — multiplied into row[1].
//   @Helium 0x3d0fb8  float32 0.511247456073761  (u32 0x3f02e11d)
//                     Loaded @0x10207e in GetOutput — passed as xmm0 to
//                     compositor.SetParameter for segment 1. This is the
//                     literal 32-bit value baked into Helium; we do NOT
//                     attribute a closed-form (it is not 1/log(2), log10(e),
//                     etc.) — see per-const comment below.
//
// SEMANTICS — WHY these numbers wire the curve:
//   Deferred by design. This class's job is a facade: it packs 4 f32
//   coefficients from the selected curve-index row into fixed slots and
//   hands them to `HgcHybridQTGammaLog_encode` (undecoded here) via the
//   vtable slot 0x60 SetParameter interface, once per segment. The
//   actual QT-hybrid-gamma-log math (piecewise gamma/log/exponential,
//   whichever form Apple's private QT curve family uses) is implemented
//   inside that compositor — attributing spec names ("gain" / "slope" /
//   "intercept") to coeff_a..d without decoding the compositor would be
//   Rule-3 fitting. We ship the byte-exact wiring only.
//
// GETOUTPUT (@0x102010..0x102099) — rendering-graph wiring:
//   1) input = HGRenderer::GetInput(this, 0)                        @0x102029
//   2) compositor.vtable[0x78] (esi=0, rdx=input)                   @0x102039
//   3) compositor.vtable[0x60] (esi=0,  xmm0=coeff_a_f32,
//                                       xmm1=0.0f, xmm2=0.0f, xmm3=0.0f) @0x102059
//        (xmm0 read from this.0x1a0 @0x102043; xmm1/xmm2/xmm3 xored zero.)
//   4) compositor.vtable[0x60] (esi=1,  xmm0=0.511247456073761f,
//                                       xmm1=coeff_b_f32,
//                                       xmm2=coeff_c_f32,
//                                       xmm3=coeff_d_f32)          @0x10208b
//        (xmm1..xmm3 read from this.0x1a4/0x1a8/0x1ac @0x102063/0x10206b/0x102073;
//         xmm0 from RIP-rel @0x10207e = @Helium 0x3d0fb8.)
//   5) return this.compositor                                       @0x102099
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcHybridQTGammaLog_encode::HgcHybridQTGammaLog_encode()  @Helium __ZN26HgcHybridQTGammaLog_encodeC1Ev — invoked @0x101e0f (C2) / @0x101ebf (C1)
//   HgcHybridQTGammaLog_encode vtable slot *0x60 (SetParameter-like) — invoked twice from GetOutput
//   HgcHybridQTGammaLog_encode vtable slot *0x78 (SetInput-like)     — invoked once from GetOutput
//   HgcHybridQTGammaLog_encode vtable slot *0x18 (Release)           — invoked from dtors
//   HGObject::operator new(unsigned long)     @Helium __ZN8HGObjectnwEm  — invoked @0x101e04 (C2) / @0x101eb4 (C1)
//   HGObject::operator delete(void*)          @Helium __ZN8HGObjectdlEPv — invoked @0x101ff6 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)        @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x102029
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * The `GetInput` method is invoked at @Helium 0x102029 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x102029 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.field_198`. Not
 * yet transcribed — see raw-port/army/ledger for HgcHybridQTGammaLog_encode.
 * Only the three vtable slots vcalled from HGHybridQTGammaLog::Encode
 * are exposed here; each throws until the class is ported.
 */
export interface HgcHybridQTGammaLog_encode {
  /** vtable *0x18 @Helium — invoked from ~HGHybridQTGammaLog::Encode (D2 @0x101f65, D1 @0x101fa5, D0 @0x101fe2). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x102059, @0x10208b). Argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x102039). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHgcHybridQTGammaLog_encode()` — placeholder for the compositor
 * allocation + ctor sequence at @Helium 0x101dff..0x101e0f (C2) /
 * 0x101eaf..0x101ebf (C1). Both C2 and C1 emit the same 4-instruction
 * sequence:
 *   movl  $0x1a0, %edi                            ; alloc size = 0x1A0 = 416 bytes
 *   callq __ZN8HGObjectnwEm                       ; HGObject::operator new(unsigned long)
 *   ...                                           ; %rax → %r15 → %rdi
 *   callq __ZN26HgcHybridQTGammaLog_encodeC1Ev    ; placement-ctor
 * — i.e. `new HgcHybridQTGammaLog_encode()`. Both callees are
 * undecoded, so this stub throws (rule 3: loud gap, not silent
 * substitute).
 */
function newHgcHybridQTGammaLog_encode(): HgcHybridQTGammaLog_encode {
  throw new Error(
    "HGHybridQTGammaLog::Encode: HgcHybridQTGammaLog_encode ctor + HGObject::operator new @Helium 0x101e04/0x101e0f (C2) not yet transcribed",
  );
}

// ---------------------------------------------------------------------------
// Static coefficient table `HGHybridQTGammaLog::calcParams` @Helium 0x3d1320.
// Layout: 7 rows × 32 bytes; each row is 4 IEEE-754 doubles at offsets
// 0x00 / 0x08 / 0x10 / 0x18. Row-index selection is by ctor arg
// `curveParams` (u32 enum, 0..6). Bit-exact against the Helium x86_64
// slice — dumped with `struct.unpack_from('<d', data, base + i*0x20 + off)`.
// Row 7 (offset 0x3d1400) already breaks the pattern (mixed near-zero
// and tiny denormal-scale values that read as symbol boilerplate), so
// the table is 7 rows wide.
//
// NAMING: `d0..d3` are STRUCTURAL (index-by-offset) — decoding the
// QT-hybrid-gamma-log spec these correspond to is the job of
// HgcHybridQTGammaLog_encode, not this facade. See CTOR TAIL MATH above.
// ---------------------------------------------------------------------------

/** @Helium 0x3d1320 — one row of HGHybridQTGammaLog::calcParams. */
interface HGHybridQTGammaLog_calcParams_Row {
  /** double @ row+0x00. Narrowed to float32 and stored at this.0x1a0. */
  d0: number;
  /** double @ row+0x08. Multiplied by ln(2) then narrowed to float32 and stored at this.0x1a4. */
  d1: number;
  /** double @ row+0x10. Narrowed to float32 and stored at this.0x1a8. */
  d2: number;
  /** double @ row+0x18. Narrowed to float32 and stored at this.0x1ac. */
  d3: number;
}

/**
 * `HGHybridQTGammaLog::calcParams` @Helium 0x3d1320 — 7 rows × 4 doubles.
 * Bit-exact against /tmp/Helium.x86_64 at each row offset:
 *   row 0 @0x3d1320  {0.45, 0.156988586799704, 0.242153048019952, 0.911444349863366}
 *   row 1 @0x3d1340  {0.65, 0.039413394636874, 0.58754407898788,  0.91163383271243 }
 *   row 2 @0x3d1360  {0.70, 0.032213844371303, 0.647069904476356, 0.927979840798557}
 *   row 3 @0x3d1380  {0.75, 0.025473992510207, 0.706708589068692, 0.943211012261694}
 *   row 4 @0x3d13a0  {0.80, 0.019206207568828, 0.766314309661166, 0.957307322378127}
 *   row 5 @0x3d13c0  {0.85, 0.013433967356171, 0.825729626565662, 0.970224916230858}
 *   row 6 @0x3d13e0  {0.90, 0.008201507308713, 0.884763036183495, 0.98187510020643 }
 */
const HGHybridQTGammaLog_calcParams: readonly HGHybridQTGammaLog_calcParams_Row[] = [
  { d0: 0.45, d1: 0.156988586799704, d2: 0.242153048019952, d3: 0.911444349863366 },
  { d0: 0.65, d1: 0.039413394636874, d2: 0.58754407898788,  d3: 0.91163383271243  },
  { d0: 0.70, d1: 0.032213844371303, d2: 0.647069904476356, d3: 0.927979840798557 },
  { d0: 0.75, d1: 0.025473992510207, d2: 0.706708589068692, d3: 0.943211012261694 },
  { d0: 0.80, d1: 0.019206207568828, d2: 0.766314309661166, d3: 0.957307322378127 },
  { d0: 0.85, d1: 0.013433967356171, d2: 0.825729626565662, d3: 0.970224916230858 },
  { d0: 0.90, d1: 0.008201507308713, d2: 0.884763036183495, d3: 0.98187510020643  },
];

// ---------------------------------------------------------------------------
// RIP-relative constants read at CTOR / GetOutput.
// ---------------------------------------------------------------------------

/**
 * `ln(2)` used to scale `row.d1` in the ctor. RIP-relative load:
 *   @Helium `mulsd 0x2cf001(%rip), %xmm0` @0x101e2f (C2) → data @0x3d0e38.
 *   @Helium `mulsd 0x2cef51(%rip), %xmm0` @0x101edf (C1) → data @0x3d0e38.
 * Bit-pattern 0x3fe62e42fefa39ef decodes to 0.6931471805599453 (ln 2).
 */
const HGHybridQTGammaLog_Encode_ln2: number = 0.6931471805599453;

/**
 * Literal float32 baked into Helium at @0x3d0fb8, loaded as xmm0 for
 * the SECOND SetParameter call (segment 1) in GetOutput:
 *   @Helium `movss 0x2cef32(%rip), %xmm0` @0x10207e → data @0x3d0fb8.
 * Bit-pattern u32 = 0x3f02e11d ⇒ float32 = 0.511247456073761.
 *
 * We do NOT attribute a closed form here. It is not 1/log(2)
 * (1.4426950), not log10(e) (0.4342944), not 1/log2(10) (0.3010299).
 * The nearest simple-fraction fit (1/1.955 ≈ 0.5115) is close but off
 * by ~2.6e-4 — clearly not the intent. Whatever this number means, it
 * is the compositor's private business (Rule 3: cite the bytes; don't
 * invent semantics).
 */
const HGHybridQTGammaLog_Encode_getOutput_seg1_xmm0_f32: number = Math.fround(0.511247456073761);

/**
 * `HGHybridQTGammaLog::Encode` — Helium HGNode subclass. Wraps an owned
 * `HgcHybridQTGammaLog_encode` compositor configured (via two
 * SetParameter calls) for QuickTime hybrid-gamma-log forward encoding
 * on curve index `curveParams` ∈ {0..6}.
 *
 * @Helium ctors  @0x101de0 (C2) / @0x101e90 (C1);
 *         dtors  @0x101f40 (D2) / @0x101f80 (D1) / @0x101fc0 (D0);
 *         GetOutput @0x102010.
 */
export class HGHybridQTGammaLogEncode extends HGNode {
  /**
   * Owned `HgcHybridQTGammaLog_encode` compositor. Field @0x198.
   * Assigned once in the ctor @0x101e14 (C2) / @0x101ec4 (C1):
   *   movq %r15, 0x198(%rbx)
   * No pre-existing-pointer check — this is a fresh HGNode subclass
   * whose base ctor leaves 0x198 uninitialized.
   */
  compositor: HgcHybridQTGammaLog_encode | null;

  /**
   * Packed coefficient a. Field @0x1a0. Written in ctor via a single
   * `movapd %xmm1, 0x1a0(%rbx)` @0x101e4e/0x101efe as the first f32 of
   * the packed 4-lane store. Value = float32(row.d0).
   */
  coeff_a_f32: number;

  /**
   * Packed coefficient b. Field @0x1a4. Second f32 of the packed
   * `movapd` store. Value = float32(row.d1 * ln(2)).
   */
  coeff_b_f32: number;

  /**
   * Packed coefficient c. Field @0x1a8. Third f32 of the packed
   * `movapd` store. Value = float32(row.d2).
   */
  coeff_c_f32: number;

  /**
   * Packed coefficient d. Field @0x1ac. Fourth f32 of the packed
   * `movapd` store. Value = float32(row.d3).
   */
  coeff_d_f32: number;

  /**
   * `HGHybridQTGammaLog::Encode::Encode(CurveParams)` — Helium @0x101de0
   * (C2 base-object ctor). C1 @0x101e90 is a byte-for-byte duplicate of
   * C2's body (differs only in the vtable `leaq` displacement chosen so
   * that RIP+disp lands on 0xa18100); its emission of the same 4-lane
   * `movapd` store makes it the C1 complete-object ctor rather than a
   * tail-`jmp` to C2 (as in HGACEScct::Encode). Only C2's body is
   * modelled — C1 is semantically identical.
   *
   * Verbatim asm (@0x101de0..0x101e60, prologue/epilogue elided):
   *   0x101dea  movl  %esi, %r14d                            ; r14d = curveParams (u32)
   *   0x101ded  movq  %rdi, %rbx                             ; rbx  = this
   *   0x101df0  callq __ZN6HGNodeC2Ev                        ; base ctor
   *   0x101df5  leaq  0x916304(%rip), %rax                   ; = 0xa18100
   *   0x101dfc  movq  %rax, (%rbx)                           ; *this = installed vtable ptr
   *   0x101dff  movl  $0x1a0, %edi                           ; alloc size 0x1A0 (416)
   *   0x101e04  callq __ZN8HGObjectnwEm                      ; HGObject::operator new
   *   0x101e09  movq  %rax, %r15                             ; r15 = compositor ptr
   *   0x101e0c  movq  %rax, %rdi
   *   0x101e0f  callq __ZN26HgcHybridQTGammaLog_encodeC1Ev   ; placement ctor
   *   0x101e14  movq  %r15, 0x198(%rbx)                      ; this.compositor = r15
   *   0x101e1b  movl  %r14d, %eax                            ; rax = curveParams (zero-extended)
   *   0x101e1e  shlq  $0x5, %rax                             ; rax = curveParams * 0x20 (row offset)
   *   0x101e22  leaq  __ZN18HGHybridQTGammaLog10calcParamsE(%rip), %rcx  ; rcx = calcParams
   *   0x101e29  movsd 0x8(%rax,%rcx), %xmm0                  ; xmm0 = row.d1 (double @ +0x08)
   *   0x101e2f  mulsd 0x2cf001(%rip), %xmm0                  ; xmm0 *= ln(2)  @ Helium 0x3d0e38
   *   0x101e37  movsd (%rax,%rcx), %xmm1                     ; xmm1 = row.d0 (double @ +0x00)
   *   0x101e3c  unpcklpd %xmm0, %xmm1                        ; xmm1 = [row.d0, row.d1*ln2] (2 doubles)
   *   0x101e40  cvtpd2ps 0x10(%rax,%rcx), %xmm0              ; xmm0 = [f32(d2), f32(d3), 0, 0]
   *   0x101e46  cvtpd2ps %xmm1, %xmm1                        ; xmm1 = [f32(d0), f32(d1*ln2), 0, 0]
   *   0x101e4a  unpcklpd %xmm0, %xmm1                        ; xmm1 = [f32(d0), f32(d1*ln2), f32(d2), f32(d3)]
   *   0x101e4e  movapd %xmm1, 0x1a0(%rbx)                    ; store 4 f32s at 0x1a0..0x1af
   *   0x101e60  retq
   *
   * The exception-cleanup path @0x101e61..0x101e8a (compositor delete +
   * HGNode dtor + __Unwind_Resume, twice — one per throwing callee)
   * exists only to unwind if `HGObject::operator new` or the compositor
   * ctor throws; it never executes on a successful construction and is
   * not modelled explicitly (TS exceptions unwind naturally through the
   * stack).
   *
   * @param curveParams  enum index into HGHybridQTGammaLog::calcParams
   *                     (valid range 0..6, matching the 7 rows of the
   *                     static table). Out-of-range values would read
   *                     off the end of the table in the binary; here we
   *                     bounds-check and throw with the address of the
   *                     `shlq`+`leaq` load so a caller sees the exact
   *                     failure site rather than a silent NaN chain.
   */
  constructor(curveParams: number) {
    // @Helium 0x101df0: HGNode base ctor.
    super();
    // @Helium 0x101dfc: install this class's vtable (installed ptr = 0xa18100).
    this.vtable = 0xa18100;
    // @Helium 0x101dff..0x101e0f: alloc 0x1a0 bytes + HgcHybridQTGammaLog_encode ctor.
    // Throws until HgcHybridQTGammaLog_encode is transcribed (see stub above).
    const newComp = newHgcHybridQTGammaLog_encode();
    // @Helium 0x101e14: store compositor.  (No release-old path: the field
    // is uninitialized until this write — see comment on the field.)
    this.compositor = newComp;
    // @Helium 0x101e1b..0x101e22: rax = curveParams * 0x20; rcx = &calcParams.
    // In the binary this is unchecked pointer arithmetic; a bad enum value
    // reads garbage. We surface it as a loud error here (rule 3: prefer a
    // throw citing @0xADDR to a silent bad value).
    if (
      !Number.isInteger(curveParams) ||
      curveParams < 0 ||
      curveParams >= HGHybridQTGammaLog_calcParams.length
    ) {
      throw new Error(
        `HGHybridQTGammaLog::Encode @Helium 0x101e1b — curveParams=${curveParams} out of range [0, ${HGHybridQTGammaLog_calcParams.length - 1}] for calcParams table @Helium 0x3d1320`,
      );
    }
    const row = HGHybridQTGammaLog_calcParams[curveParams];
    // @Helium 0x101e29..0x101e4e: pack 4 float32s from row×coefficients into
    // 0x1a0..0x1ac. `movapd` is a single 16-byte store; we model it as 4
    // ordinary field assignments (order irrelevant — the packed store
    // races nothing).
    this.coeff_a_f32 = Math.fround(row.d0);
    this.coeff_b_f32 = Math.fround(row.d1 * HGHybridQTGammaLog_Encode_ln2);
    this.coeff_c_f32 = Math.fround(row.d2);
    this.coeff_d_f32 = Math.fround(row.d3);
  }

  /**
   * `HGHybridQTGammaLog::Encode::~Encode()` — Helium @0x101f40 (D2,
   * base-object) / @0x101f80 (D1, complete-object) / @0x101fc0 (D0,
   * deleting). All three share the same body up through the base-dtor
   * call; D0 additionally tail-jmps to `HGObject::operator delete`.
   *
   * D2 @0x101f40..0x101f71 (verbatim, ex-handler elided):
   *   0x101f46  leaq  0x9161b3(%rip), %rax     ; = 0xa18100 (own installed vtable ptr)
   *   0x101f4d  movq  %rax, (%rdi)             ; *this = vtable (reinstall)
   *   0x101f50  movq  0x198(%rdi), %rax        ; rax = compositor
   *   0x101f57  testq %rax, %rax
   *   0x101f5a  je    0x101f6b                 ; skip if null
   *   0x101f5c  movq  (%rax), %rcx             ; rcx = compositor.vtable
   *   0x101f5f  movq  %rdi, %rbx               ; save this
   *   0x101f62  movq  %rax, %rdi               ; rdi = compositor
   *   0x101f65  callq *0x18(%rcx)              ; compositor.Release()  (vtable slot 0x18)
   *   0x101f68  movq  %rbx, %rdi               ; restore this
   *   0x101f71  jmp   __ZN6HGNodeD2Ev          ; tail-call HGNode base dtor
   *
   * D1 @0x101f80..0x101fb1 is byte-identical except the vtable-reload
   * leaq offset (@0x101f86 leaq 0x916173(%rip),%rax — same target
   * 0xa18100 with a different displacement because the leaq PC is
   * different).
   *
   * D0 @0x101fc0..0x101ff6 differs only in that after the HGNode dtor
   * call the epilogue `jmp __ZN8HGObjectdlEPv` frees `this` via
   * HGObject::operator delete; we model D0's operator-delete step at
   * the JS caller (dropping the reference).
   */
  destruct(): void {
    // @Helium 0x101f4d: vtable reinstall — modeled by assignment.
    this.vtable = 0xa18100;
    // @Helium 0x101f50..0x101f65: release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x101f71: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGHybridQTGammaLog::Encode::GetOutput(HGRenderer*)` — Helium @0x102010.
   *
   * Wires the owned `HgcHybridQTGammaLog_encode` compositor into the
   * render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the compositor as its input at slot 0 (vtable *0x78)
   *   3) call SetParameter for segment 0 (esi=0) with
   *        (xmm0=coeff_a_f32, xmm1=0.0f, xmm2=0.0f, xmm3=0.0f)
   *   4) call SetParameter for segment 1 (esi=1) with
   *        (xmm0=0.511247456073761f, xmm1=coeff_b_f32,
   *         xmm2=coeff_c_f32, xmm3=coeff_d_f32)
   *   5) return the compositor as this node's output.
   *
   * Verbatim asm (@0x102010..0x102099, prologue/epilogue elided):
   *   0x10201a  movq  0x198(%rdi), %r14                       ; r14 = this.compositor
   *   0x102021  movq  %rsi, %rdi                              ; rdi = renderer
   *   0x102024  movq  %rbx, %rsi                              ; rsi = this
   *   0x102027  xorl  %edx, %edx                              ; edx = 0
   *   0x102029  callq __ZN10HGRenderer8GetInputEP6HGNodei     ; input = renderer.GetInput(this, 0)
   *   0x10202e  movq  (%r14), %rcx                            ; rcx = compositor.vtable
   *   0x102031  movq  %r14, %rdi                              ; rdi = compositor
   *   0x102034  xorl  %esi, %esi                              ; esi = 0
   *   0x102036  movq  %rax, %rdx                              ; rdx = input
   *   0x102039  callq *0x78(%rcx)                             ; compositor.SetInput(0, input)
   *   0x10203c  movq  0x198(%rbx), %rdi                       ; rdi = this.compositor
   *   0x102043  movss 0x1a0(%rbx), %xmm0                      ; xmm0 = this.coeff_a_f32
   *   0x10204b  movq  (%rdi), %rax                            ; rax = compositor.vtable
   *   0x10204e  xorps %xmm1, %xmm1                            ; xmm1 = 0.0f
   *   0x102051  xorps %xmm2, %xmm2                            ; xmm2 = 0.0f
   *   0x102054  xorps %xmm3, %xmm3                            ; xmm3 = 0.0f
   *   0x102057  xorl  %esi, %esi                              ; esi = 0
   *   0x102059  callq *0x60(%rax)                             ; compositor.SetParameter(0, coeff_a, 0, 0, 0)
   *   0x10205c  movq  0x198(%rbx), %rdi                       ; rdi = this.compositor
   *   0x102063  movss 0x1a4(%rbx), %xmm1                      ; xmm1 = this.coeff_b_f32
   *   0x10206b  movss 0x1a8(%rbx), %xmm2                      ; xmm2 = this.coeff_c_f32
   *   0x102073  movss 0x1ac(%rbx), %xmm3                      ; xmm3 = this.coeff_d_f32
   *   0x10207b  movq  (%rdi), %rax                            ; rax = compositor.vtable
   *   0x10207e  movss 0x2cef32(%rip), %xmm0                   ; xmm0 = 0.511247456f  @Helium 0x3d0fb8
   *   0x102086  movl  $0x1, %esi                              ; esi = 1
   *   0x10208b  callq *0x60(%rax)                             ; compositor.SetParameter(1, K, coeff_b, coeff_c, coeff_d)
   *   0x10208e  movq  0x198(%rbx), %rax                       ; rax = this.compositor
   *   0x102099  retq                                          ; return rax
   *
   * @param renderer  the containing HGRenderer (undecoded; only its
   *                  `GetInput` method is touched).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of the node graph for this filter).
   *
   * Throws if the compositor field is null (should be impossible after
   * a successful ctor) or if the compositor's vtable slots aren't yet
   * transcribed (they aren't — see HgcHybridQTGammaLog_encode stub above).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x10201a: r14 = this.compositor. Invariant: non-null after ctor.
    const comp = this.compositor;
    if (comp == null) {
      throw new Error(
        "HGHybridQTGammaLog::Encode::GetOutput @Helium 0x10201a — compositor null (should be unreachable after ctor)",
      );
    }
    // @Helium 0x102029: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x102039: compositor.SetInput(0, input) via vtable *0x78
    comp.SetInput(0, input);
    // @Helium 0x102059: compositor.SetParameter(0, coeff_a_f32, 0.0f, 0.0f, 0.0f) via vtable *0x60
    comp.SetParameter(
      0,
      this.coeff_a_f32,
      Math.fround(0.0),
      Math.fround(0.0),
      Math.fround(0.0),
    );
    // @Helium 0x10208b: compositor.SetParameter(1, K, coeff_b_f32, coeff_c_f32, coeff_d_f32) via vtable *0x60
    comp.SetParameter(
      1,
      HGHybridQTGammaLog_Encode_getOutput_seg1_xmm0_f32,
      this.coeff_b_f32,
      this.coeff_c_f32,
      this.coeff_d_f32,
    );
    // @Helium 0x10208e..0x102099: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
