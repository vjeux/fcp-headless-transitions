// raw-port/src/render/HGNikonNLog_Encode.ts
//
// FCP `HGNikonNLog::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HgcNikonLog_encode` compositor and, when the source
// colorimetry is 0 (i.e. the incoming scene-linear is Rec.709-primaried),
// an owned `HGColorMatrix` configured with the static
// `HGColorGamma::rec709RGBToRec2020RGB` matrix (source Rec.709 → Rec.2020).
// The compositor implements the Nikon N-Log forward transfer function
// (linear scene-linear → N-Log encoded video), which is a piecewise
// cube-root (small signal) / natural-log (large signal) OETF.
//
// STRUCTURAL SIBLING of `HGACEScct::Encode`
// (raw-port/src/render/HGACEScct_Encode.ts): same nested-facade shape
// (owned compositor + two `SetParameter` calls in GetOutput), with a
// conditionally-owned color-matrix stage on the input side (only when
// colorimetry == 0). Coefficients are a mix of five inline
// __literal4/8 constants (four for segment 0; one for segment 1) and
// one Meyers-singleton static (`dd`, initialised on first call via
// `.cold.1`).
//
// TWIN OF the Nikon N-Log DECODE-side descriptor
// `HGNikonNLogLinearizationLUTInfo` (raw-port/src/render/HGNikonNLogLinearizationLUTInfo.ts):
// that class's static a/b/c/d + branch threshold recover LINEAR from
// LOG; this class's five constants (segment 0: mult, add, 1/3, gain +
// segment 1: log-scale, `dd` shift) go the OTHER way, ENCODING LOG
// from LINEAR through the compositor's shader. We do NOT re-derive the
// N-Log spec here — we ship byte-exact the six coefficients the binary
// loads at run time.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   /tmp/Helium_tV.txt: full `otool -tV -arch x86_64` of Helium.
//   Method boundaries:
//     C2       @0x1041e0..0x1042bd
//     C1       @0x1042c0..0x1042c5 (tail-jmp to C2)
//     D2       @0x1042d0..0x10431d
//     D1       @0x104320..0x10436d
//     D0       @0x104370..0x1043c5
//     GetOutput@0x1043d0..0x104491
//     .cold.1  @0x3c3b60..0x3c3b8d (Itanium-ABI guard-protected init
//                                    of the static-local `dd`)
//
// SYMBOLS:
//   @Helium 0x1041e0  HGNikonNLog::Encode::Encode(SceneColorimetry)      [C2]  __ZN11HGNikonNLog6EncodeC2ENS_16SceneColorimetryE
//   @Helium 0x1042c0  HGNikonNLog::Encode::Encode(SceneColorimetry)      [C1]  __ZN11HGNikonNLog6EncodeC1ENS_16SceneColorimetryE — tail-jmp to C2
//   @Helium 0x1042d0  HGNikonNLog::Encode::~Encode()                     [D2]  __ZN11HGNikonNLog6EncodeD2Ev
//   @Helium 0x104320  HGNikonNLog::Encode::~Encode()                     [D1]  __ZN11HGNikonNLog6EncodeD1Ev
//   @Helium 0x104370  HGNikonNLog::Encode::~Encode()                     [D0 — deleting]  __ZN11HGNikonNLog6EncodeD0Ev
//   @Helium 0x1043d0  HGNikonNLog::Encode::GetOutput(HGRenderer*)        __ZN11HGNikonNLog6Encode9GetOutputEP10HGRenderer
//   @Helium 0x3c3b60  HGNikonNLog::Encode::Encode(SceneColorimetry).cold.1
//                       [Itanium-ABI-guarded init for the static-local
//                        `dd` (float, 0x3F16F247 = 0.589634358882904f)]
//
// VTABLE:
//   @Helium ctor C2 @0x1041f5 emits `leaq 0x9157c4(%rip),%rax` which
//   resolves to 0x1041fc + 0x9157c4 = 0xa199c0 — the installed pointer
//   for `HGNikonNLog::Encode` (vtable base + 0x10 per Itanium ABI).
//   The three dtors reinstall it: D2 @0x1042d9 (leaq 0x9156e0 →
//   0x1042e0+0x9156e0=0xa199c0), D1 @0x104329 (leaq 0x915690 →
//   0x104330+0x915690=0xa199c0), D0 @0x104379 (leaq 0x915640 →
//   0x104380+0x915640=0xa199c0) — all identical.
//
// CTOR ARG ORDER (@0x1041ea..0x1041ed):
//   rdi = this
//   esi = colorimetry (SceneColorimetry enum, u32; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 + D2/D1/D0 + GetOutput):
//   HGNikonNLog::Encode extends HGNode (base ctor @0x1041f0 per
//   raw-port/src/render/HGNode.ts). Subclass fields:
//     0x198 : HGColorMatrix*        matrix       (null unless colorimetry==0;
//                                                  when non-null, allocated
//                                                  @0x10423b, 0x1F0 bytes,
//                                                  ctor @0x104246. Assigned
//                                                  either to null @0x1041ff
//                                                  or to a real pointer
//                                                  @0x10424b.)
//     0x1a0 : HgcNikonLog_encode*   compositor    (always allocated, 0x1A0
//                                                  bytes; alloc @0x10420f,
//                                                  ctor @0x10421a, assigned
//                                                  @0x10421f.)
//     0x1a8 : const void*           matrixSrcRow  (null unless colorimetry==0;
//                                                  when non-null, points to
//                                                  the static
//                                                  `HGColorGamma::rec709RGBToRec2020RGB`
//                                                  matrix, assigned
//                                                  @0x104259; else assigned
//                                                  null @0x104226.)
//     0x1b0 : float                 dd_f32        (= 0.589634358882904f;
//                                                  loaded from the
//                                                  Meyers-singleton `dd`
//                                                  static @0x10426b, stored
//                                                  @0x104273; = f32 payload
//                                                  0x3F16F247 initialised
//                                                  by .cold.1 @0x3c3b74.)
//   sizeof extends to 0x1b4 (aligned to 0x1b8 or 0x1c0). No further
//   fields touched by any ported entry point.
//
// STATIC-LOCAL Meyers singleton (Itanium-ABI guard-protected;
//   initialised by .cold.1 on first ctor call):
//   __ZZN11HGNikonNLog6EncodeC1ENS_16SceneColorimetryEE2dd  float `dd`
//        init @0x3c3b74: `movl $0x3f16f247, dd(%rip)`
//        → 0.589634358882904f (IEEE 754 f32 payload 0x3F16F247).
//   In this TS port `dd` is a module-level `const` (the JS runtime
//   handles module-init ordering, obsoleting the guard mechanism).
//
// RIP-relative __literal4 constants used by GetOutput (all reads
// computed as next-insn + disp; single-precision cvtss2ss-ready values):
//
//   @0x104439  movss 0x2ccbef(%rip), %xmm0  →  0x3d1030 = f32 0.23086372017860413
//   @0x104441  movss 0x2ccbeb(%rip), %xmm1  →  0x3d1034 = f32 0.0019238642416894436
//   @0x104449  movss 0x2c5e37(%rip), %xmm2  →  0x3ca288 = f32 0.3333333432674408
//                                                        (= f32(1/3); shared __literal4)
//   @0x104451  movss 0x2ccbdf(%rip), %xmm3  →  0x3d1038 = f32 0.36444443464279175
//   @0x104470  movss 0x2ccbc4(%rip), %xmm0  →  0x3d103c = f32 0.10163448750972748
//
// SEMANTICS — WHY these coefficients wire Nikon N-Log encode:
//   Nikon N-Log OETF (linear→log, piecewise, spec published by Nikon
//   Technical Guide):
//     if lin >  0.328:    V = 0.14663 * ln(lin) + 0.6051
//     else:               V = 0.6355 * (lin + 0.0075)^(1/3)
//   The compositor here is `HgcNikonLog_encode`, a Nikon-specific
//   segmented encoder — its shader is not yet decoded but has the same
//   plug-shape as ARRI/ACES: two `SetParameter(esi, xmm0..xmm3)` calls
//   pack per-segment coefficients into a 4-float uniform slot.
//     • Call 1 (esi=0, cube-root segment):
//         xmm0 = 0.23086     (segment slope pre-multiplier)
//         xmm1 = 0.001924    (offset added under the cube root)
//         xmm2 = 1/3         (cube-root exponent)
//         xmm3 = 0.36444     (post-cube-root shift)
//     • Call 2 (esi=1, natural-log segment):
//         xmm0 = 0.10163     (log-region scale)
//         xmm1 = dd = 0.58963 (log-region offset — the Meyers-singleton)
//         xmm2 = 0.0f, xmm3 = 0.0f (unused / padding)
//   These are byte-exact against the Helium x86_64 slice; we DO NOT
//   attempt to re-derive them from the Nikon spec numbers here — that
//   is the compositor's/shader's job.  The specific numeric mapping
//   between spec constants and shader inputs is decoded (or will be)
//   inside HgcNikonLog_encode itself, per PORTING_SPEC rule 3.
//
// GETOUTPUT (@0x1043d0..0x104491) — rendering-graph wiring:
//   1) r14 = this.matrix                                            @0x1043da
//   2) input = renderer.GetInput(this, 0)                           @0x1043e9
//   3) IF matrix != null:
//        matrix.vtable[0x78](0, input)      // SetInput slot 0      @0x1043fe
//        matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)   @0x104414
//        rdx = this.matrix   (input to compositor)                  @0x104419
//      ELSE rdx = input (unchanged from the GetInput result)        @0x1043ee
//   4) compositor.vtable[0x78](0, rdx)      // SetInput slot 0      @0x10442c
//   5) compositor.vtable[0x60](0,                                    @0x10445b
//                              0.23086, 0.001924, 1/3, 0.36444)     (cube-root segment)
//   6) compositor.vtable[0x60](1,                                    @0x104483
//                              0.10163, dd_f32=0.58963, 0.0f, 0.0f)  (log segment)
//   7) return this.compositor                                        @0x104486
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcNikonLog_encode::HgcNikonLog_encode()   __ZN18HgcNikonLog_encodeC1Ev — invoked @0x10421a
//   HGColorMatrix::HGColorMatrix()             __ZN13HGColorMatrixC1Ev      — invoked @0x104246
//   HGColorMatrix::LoadMatrix(...)             __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x104414
//   HGColorGamma::rec709RGBToRec2020RGB        __ZN12HGColorGamma21rec709RGBToRec2020RGBE — leaq'd @0x104252 (static data)
//   HGObject::operator new(unsigned long)      __ZN8HGObjectnwEm             — invoked @0x10420f / @0x10423b
//   HGObject::operator delete(void*)           __ZN8HGObjectdlEPv            — invoked from D0 tail-jmp @0x1043b8
//   HGRenderer::GetInput(HGNode*, int)         __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x1043e9
//   HgcNikonLog_encode / HGColorMatrix vtable slots
//                                              *0x18 (Release),
//                                              *0x60 (SetParameter),
//                                              *0x78 (SetInput).
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Placeholders for helper classes touched by this node but not yet ported.
// Each interface exposes only the vtable slots we actually invoke, and each
// helper raises loudly (PORTING_SPEC.md rule 3: no silent fill-in) — see
// the per-function citations for the exact @0xADDR each one is deferring.
// ---------------------------------------------------------------------------

/**
 * Placeholder for `HGRenderer` used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for HGRenderer. The only
 * method invoked here is `GetInput(HGNode*, int) -> HGNode*`
 * at @Helium 0x1043e9.
 */
export interface HGRendererStub {
  /** @Helium 0x1043e9 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the color-matrix node conditionally owned at
 * `this.matrix` (`+0x198`). Undecoded — exposes only the vtable slots
 * we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x1043fe with (0, input).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x104414 with (this.matrixSrcRow, true).
 *      Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — the second arg
 *      is a bool (edx=1) and the first is a pointer to a 4-float vector
 *      array (a 4×4 row-major float32 matrix in this call site).
 *   - `Release()` via slot *0x18 — invoked from all three dtors.
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x1043fe. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x104414 with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2 (@0x1042f2, 0x104342, 0x104392). */
  Release(): void;
}

/**
 * Placeholder for the Nikon-specific segmented log encoder owned at
 * `this.compositor` (`+0x1a0`). Undecoded — exposes only the vtable
 * slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x10442c with (0, rdx).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x10445b with (0, 0.23086, 0.001924, 1/3, 0.36444)  (cube-root segment)
 *          — invoked @0x104483 with (1, 0.10163, dd_f32, 0.0f, 0.0f)      (log segment)
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (@0x104304, 0x104354, 0x1043a4).
 */
export interface HgcNikonLog_encode {
  /** vtable *0x78 @Helium — @0x10442c. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x10420a..0x10421f:
 *   0x10420a  movl  $0x1a0,%edi                     ; alloc size = 0x1A0 = 416
 *   0x10420f  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x10421a  callq __ZN18HgcNikonLog_encodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (PORTING_SPEC.md rule 3).
 */
function newHgcNikonLog_encode(): HgcNikonLog_encode {
  throw new Error(
    "HGNikonNLog::Encode: HgcNikonLog_encode ctor + HGObject::operator new @Helium 0x10420f/0x10421a not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x104236..0x10424b (only executed when colorimetry == 0):
 *   0x104236  movl  $0x1f0,%edi                     ; alloc size = 0x1F0 = 496
 *   0x10423b  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x104246  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (PORTING_SPEC.md rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGNikonNLog::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x10423b/0x104246 not yet transcribed"
  );
}

/**
 * Placeholder for the extern static data
 * `HGColorGamma::rec709RGBToRec2020RGB` (mangled
 * `__ZN12HGColorGamma21rec709RGBToRec2020RGBE`) referenced by
 * `leaq __ZN12HGColorGamma21rec709RGBToRec2020RGBE(%rip),%rax` @0x104252.
 * The address of this static is assigned into `this.matrixSrcRow` at
 * @0x104259 when colorimetry == 0. `HGColorMatrix::LoadMatrix` then
 * reads a 4×4 row-major float32 matrix through this pointer with
 * transpose=true.
 *
 * The BYTES of that static ARE decodable (they live in
 * Helium.framework's __const), but the enclosing `HGColorGamma` class
 * is NOT yet ported to the raw-port tree — so we surface the pointer
 * through a throwing accessor rather than invent a table on this side.
 * This keeps the frontier honest: touch HGColorGamma to unblock this
 * class.
 */
function rec709RGBToRec2020RGB(): readonly number[] {
  throw new Error(
    "HGNikonNLog::Encode: HGColorGamma::rec709RGBToRec2020RGB @Helium 0x104252 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// RIP-relative __literal4 constants used by GetOutput @0x1043d0..0x104491.
// All effective addresses computed as next-insn + disp32. Values read
// bit-exact from /tmp/Helium.x86_64 (thin slice; VA == file offset).
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3d1030 = f32 0.23086372017860413 (IEEE 754 payload 0x3e6c678a).
 * Loaded into xmm0 as the cube-root-segment slope pre-multiplier via
 * `movss 0x2ccbef(%rip),%xmm0` @0x104439 — effective addr
 * (0x104439 + 8) + 0x2ccbef = 0x3d1030.
 */
const HGNikonNLog_Encode_seg0_xmm0: number = Math.fround(0.23086372017860413);

/**
 * @Helium 0x3d1034 = f32 0.0019238642416894436 (IEEE 754 payload 0x3afc2a2c).
 * Loaded into xmm1 as the cube-root-segment additive offset via
 * `movss 0x2ccbeb(%rip),%xmm1` @0x104441 — effective addr
 * (0x104441 + 8) + 0x2ccbeb = 0x3d1034.
 */
const HGNikonNLog_Encode_seg0_xmm1: number = Math.fround(0.0019238642416894436);

/**
 * @Helium 0x3ca288 = f32 0.3333333432674408 (IEEE 754 payload 0x3eaaaaab
 * = f32(1/3); shared __literal4). Loaded into xmm2 as the cube-root
 * exponent via `movss 0x2c5e37(%rip),%xmm2` @0x104449 — effective addr
 * (0x104449 + 8) + 0x2c5e37 = 0x3ca288.
 */
const HGNikonNLog_Encode_seg0_xmm2_one_third: number = Math.fround(0.3333333432674408);

/**
 * @Helium 0x3d1038 = f32 0.36444443464279175 (IEEE 754 payload 0x3ed02598
 * — reads verbatim as `98 25 d0 3e` from the thin slice at file offset
 * 0x3d1038). Loaded into xmm3 as the cube-root-segment post-shift via
 * `movss 0x2ccbdf(%rip),%xmm3` @0x104451 — effective addr
 * (0x104451 + 8) + 0x2ccbdf = 0x3d1038.
 */
const HGNikonNLog_Encode_seg0_xmm3: number = Math.fround(0.36444443464279175);

/**
 * @Helium 0x3d103c = f32 0.10163448750972748 (IEEE 754 payload 0x3c0f0846).
 * Loaded into xmm0 as the log-segment scale via
 * `movss 0x2ccbc4(%rip),%xmm0` @0x104470 — effective addr
 * (0x104470 + 8) + 0x2ccbc4 = 0x3d103c.
 */
const HGNikonNLog_Encode_seg1_xmm0: number = Math.fround(0.10163448750972748);

/**
 * @Helium 0xade???  (BSS) — the Meyers-singleton static-local
 * `HGNikonNLog::Encode::Encode(SceneColorimetry)::dd` (float, f32).
 * Initialised by .cold.1 @0x3c3b74 via
 * `movl $0x3f16f247, dd(%rip)` — f32 payload 0x3F16F247, i.e.
 * 0.589634358882904f. The ctor reads it at @0x10426b (`movss dd(%rip),%xmm0`)
 * and stores it into `this.dd_f32` (`+0x1b0`) @0x104273.
 *
 * In the C++ this is a function-scope static — the first call
 * acquires an Itanium-ABI guard byte at
 * @0xade1b8 (approx; the neighbour to `dd`), the guard code runs
 * .cold.1, and every subsequent call sees the guard already set and
 * short-circuits to just `movss dd,%xmm0`. Because JS module init
 * runs to completion before any user code, we hoist `dd` to a
 * module-level `const` and drop the guard mechanism (see also the
 * same hoist in HGNikonNLogLinearizationLUTInfo.ts for `tl`).
 */
const HGNikonNLog_Encode_dd: number = Math.fround(0.589634358882904);

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * `HGNikonNLog::Encode::SceneColorimetry` enum. Not decoded to named
 * variants; disasm treats it as a plain u32. The only observed
 * semantic is `== 0` vs `!= 0` (branch @0x104234): value 0 gates in
 * the Rec.709 → Rec.2020 matrix stage; any non-zero value skips the
 * matrix entirely. We do NOT bounds-check or remap — the disasm
 * doesn't either.
 */
export type HGNikonNLogEncode_SceneColorimetry = number;

/**
 * `HGNikonNLog::Encode` — Helium HGNode subclass. Wraps an owned
 * `HgcNikonLog_encode` compositor (always) and an owned `HGColorMatrix`
 * (only when colorimetry == 0) configured with the static
 * `HGColorGamma::rec709RGBToRec2020RGB` matrix, then routes them into
 * a two-segment (cube-root + natural-log) Nikon N-Log forward
 * transfer function.
 *
 * @Helium ctors     @0x1041e0 (C2) / @0x1042c0 (C1);
 *         dtors     @0x1042d0 (D2) / @0x104320 (D1) / @0x104370 (D0);
 *         GetOutput @0x1043d0.
 */
export class HGNikonNLogEncode extends HGNode {
  /**
   * Optionally-owned `HGColorMatrix`. Field @0x198.
   * Assigned null @0x1041ff (unconditional init); overwritten with a
   * heap allocation @0x10424b iff colorimetry == 0.
   */
  matrix: HGColorMatrix | null;

  /**
   * Owned `HgcNikonLog_encode` compositor. Field @0x1a0.
   * Always allocated. Assigned @0x10421f: `movq %r15, 0x1a0(%rbx)`.
   */
  compositor: HgcNikonLog_encode | null;

  /**
   * Pointer to `HGColorGamma::rec709RGBToRec2020RGB` (static extern in
   * Helium) — only non-null when `matrix` is non-null. Field @0x1a8.
   * Assigned null @0x104226 (unconditional init); overwritten
   * @0x104259 iff colorimetry == 0.
   */
  matrixSrcRow: readonly number[] | null;

  /**
   * Field @0x1b0 (float). = f32 payload 0x3F16F247 = 0.589634358882904f,
   * copied from the Meyers-singleton `dd` static @0x10426b/@0x104273.
   * Consumed as xmm1 of the log-segment SetParameter call in GetOutput.
   */
  dd_f32: number;

  /**
   * `HGNikonNLog::Encode::Encode(SceneColorimetry colorimetry)` —
   * Helium @0x1041e0 (C2 base-object ctor). C1 @0x1042c0 tail-jmps to
   * C2 so only C2's body needs modelling.
   *
   * Verbatim asm (@0x1041e0..0x10428b, prologue/epilogue elided):
   *   0x1041ea  movl  %esi, %r14d                      ; r14d = colorimetry
   *   0x1041ed  movq  %rdi, %rbx                       ; rbx  = this
   *   0x1041f0  callq __ZN6HGNodeC2Ev                  ; base ctor
   *   0x1041f5  leaq  0x9157c4(%rip), %rax             ; = 0xa199c0 (own vtable installed ptr)
   *   0x1041fc  movq  %rax, (%rbx)                     ; *this = vtable
   *   0x1041ff  movq  $0x0, 0x198(%rbx)                ; this.matrix = null
   *   0x10420a  movl  $0x1a0, %edi                     ; alloc 0x1A0 for HgcNikonLog_encode
   *   0x10420f  callq __ZN8HGObjectnwEm
   *   0x104217  movq  %rax, %rdi
   *   0x10421a  callq __ZN18HgcNikonLog_encodeC1Ev
   *   0x10421f  movq  %r15, 0x1a0(%rbx)                ; this.compositor = new HgcNikonLog_encode
   *   0x104226  movq  $0x0, 0x1a8(%rbx)                ; this.matrixSrcRow = null
   *   0x104231  testl %r14d, %r14d
   *   0x104234  jne   0x104260                         ; if (colorimetry != 0) skip matrix
   *   0x104236  movl  $0x1f0, %edi                     ; alloc 0x1F0 for HGColorMatrix
   *   0x10423b  callq __ZN8HGObjectnwEm
   *   0x104243  movq  %rax, %rdi
   *   0x104246  callq __ZN13HGColorMatrixC1Ev
   *   0x10424b  movq  %r15, 0x198(%rbx)                ; this.matrix = new HGColorMatrix
   *   0x104252  leaq  __ZN12HGColorGamma21rec709RGBToRec2020RGBE(%rip),%rax
   *   0x104259  movq  %rax, 0x1a8(%rbx)                ; this.matrixSrcRow = &rec709RGBToRec2020RGB
   *   0x104260  movzbl guard_dd(%rip), %eax            ; static-local `dd` guard byte
   *   0x104267  testb %al, %al
   *   0x104269  je    0x104286                         ; if unset, call cold.1 to init
   *   0x10426b  movss dd(%rip), %xmm0                  ; xmm0 = dd (float, 0.5896344)
   *   0x104273  movss %xmm0, 0x1b0(%rbx)               ; this.dd_f32 = dd
   *   0x10427b..0x104285  epilogue, retq.
   *   0x104286  callq __ZN11HGNikonNLog6EncodeC2ENS_16SceneColorimetryE.cold.1
   *                                                     ; guard-acquire+init+release
   *   0x10428b  jmp   0x10426b                         ; re-take the load
   *
   * The exception-cleanup path @0x10428d..0x1042bd handles a throwing
   * HgcNikonLog_encode ctor or a throwing HGColorMatrix ctor: it
   * deletes the partially-constructed pointer via
   * `HGObject::operator delete`, calls `HGNode::~HGNode()`, and
   * resumes the unwind. It never executes on a successful construction
   * and is not modelled explicitly (TS exceptions unwind through the
   * stack naturally).
   *
   * @param colorimetry  SceneColorimetry (u32). Value 0 gates in the
   *                     Rec.709 → Rec.2020 matrix stage; any non-zero
   *                     value skips it. Not bounds-checked (the disasm
   *                     doesn't check either).
   */
  constructor(colorimetry: HGNikonNLogEncode_SceneColorimetry) {
    // @Helium 0x1041f0: HGNode base ctor.
    super();
    // @Helium 0x1041fc: install this class's vtable (installed ptr = 0xa199c0).
    this.vtable = 0xa199c0;
    // @Helium 0x1041ff: this.matrix = null (unconditional init).
    this.matrix = null;
    // @Helium 0x10420a..0x10421f: alloc + ctor HgcNikonLog_encode, store @0x1a0.
    // Throws until HgcNikonLog_encode is transcribed.
    this.compositor = newHgcNikonLog_encode();
    // @Helium 0x104226: this.matrixSrcRow = null (unconditional init).
    this.matrixSrcRow = null;
    // @Helium 0x104231..0x104259: if colorimetry == 0, allocate the
    // Rec.709 → Rec.2020 matrix stage and wire in the static matrix data.
    // (@0x104234 `jne 0x104260` — non-zero SKIPS the matrix creation.)
    if (colorimetry === 0) {
      // @Helium 0x104236..0x10424b: alloc + ctor HGColorMatrix, store @0x198.
      // Throws until HGColorMatrix is transcribed.
      this.matrix = newHGColorMatrix();
      // @Helium 0x104252..0x104259: this.matrixSrcRow = &HGColorGamma::rec709RGBToRec2020RGB.
      // Throws until HGColorGamma is transcribed.
      this.matrixSrcRow = rec709RGBToRec2020RGB();
    }
    // @Helium 0x104260..0x10428b: read the Meyers-singleton `dd` static
    // (float, 0.589634358882904f) into this.dd_f32 (@0x1b0). The guard
    // dance is elided — JS module init has already run by the time this
    // ctor is entered, so `HGNikonNLog_Encode_dd` is a plain const.
    this.dd_f32 = HGNikonNLog_Encode_dd;
  }

  /**
   * `HGNikonNLog::Encode::~Encode()` — Helium @0x1042d0 (D2, base-object)
   * / @0x104320 (D1, complete-object) / @0x104370 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. D0's body
   * (@0x104370..0x1043b8):
   *   leaq  0x915640(%rip), %rax         ; = 0xa199c0 (reinstall own vtable)
   *   movq  %rax, (%rdi)
   *   movq  0x198(%rdi), %rdi            ; matrix (may be null)
   *   testq %rdi, %rdi ; je  ...         ; skip if null
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; matrix.Release()
   *   movq  0x1a0(%rbx), %rdi            ; compositor
   *   testq %rdi, %rdi ; je  ...
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; compositor.Release()
   *   movq  %rbx, %rdi ; callq __ZN6HGNodeD2Ev  ; HGNode::~HGNode()
   *   movq  %rbx, %rdi ; jmp   __ZN8HGObjectdlEPv ; delete this
   *
   * D2 @0x1042d0 and D1 @0x104320 have byte-identical bodies except:
   *   - the vtable-reinstall leaq displacement differs (RIP differs)
   *   - the HGNode dtor is called via `jmp` (tail-call) instead of `call`
   *   - no operator-delete after the HGNode dtor.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   */
  destruct(): void {
    // @Helium 0x1042e0/0x104330/0x104380: vtable reinstall — modeled by assignment.
    this.vtable = 0xa199c0;
    // @Helium 0x1042e3..0x1042f5 (D2): release matrix if present. Matrix
    // is null when the ctor received colorimetry != 0, so the null
    // guard here is not a paranoia stub — the machine really does test
    // 0x198 for null before dereffing.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x1042f5..0x104307 (D2): release compositor if present.
    // The compositor is always allocated by the ctor, but D2/D1/D0 all
    // still test it for null (partial-construction paths can leave 0x1a0
    // pointing at a zombie, e.g. if this dtor runs from the ctor's
    // exception-cleanup landing pad).
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x104310 (D2) / 0x104360 (D1): jmp HGNode::~HGNode(). D0
    // uses callq and then tail-jmps to HGObject::operator delete
    // (handled by the caller dropping the reference in TS).
    super.destruct();
  }

  /**
   * `HGNikonNLog::Encode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x1043d0.
   *
   * Wires the (optional) matrix + compositor into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) IF matrix != null:
   *        hand input to matrix as slot 0     (matrix.SetInput slot *0x78)
   *        load rec709→rec2020 (transposed)   (matrix.LoadMatrix)
   *        compositor input = this.matrix
   *      ELSE compositor input = the raw GetInput result
   *   3) SetParameter(0, 0.23086, 0.001924, 1/3, 0.36444)  (cube-root segment)
   *   4) SetParameter(1, 0.10163, dd_f32, 0.0f, 0.0f)      (log segment)
   *   5) return the compositor.
   *
   * Verbatim asm (@0x1043d0..0x104491, prologue/epilogue elided):
   *   0x1043da  movq  0x198(%rdi), %r14           ; r14 = this.matrix (may be null)
   *   0x1043e1  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x1043e4  movq  %rbx, %rsi                  ; rsi = this
   *   0x1043e7  xorl  %edx, %edx
   *   0x1043e9  callq __ZN10HGRenderer8GetInputEP6HGNodei ; input = renderer.GetInput(this, 0)
   *   0x1043ee  movq  %rax, %rdx                  ; rdx = input (default compositor input)
   *   0x1043f1  testq %r14, %r14
   *   0x1043f4  je    0x104420                    ; if matrix == null, skip matrix stage
   *   0x1043f6  movq  (%r14), %rax                ; rax = matrix.vtable
   *   0x1043f9  movq  %r14, %rdi                  ; rdi = matrix
   *   0x1043fc  xorl  %esi, %esi                  ; esi = 0
   *   0x1043fe  callq *0x78(%rax)                 ; matrix.SetInput(0, input)
   *   0x104401  movq  0x198(%rbx), %rdi           ; rdi = this.matrix
   *   0x104408  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixSrcRow
   *   0x10440f  movl  $0x1, %edx                  ; edx = 1 (transpose)
   *   0x104414  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                ; matrix.LoadMatrix(matrixSrcRow, true)
   *   0x104419  movq  0x198(%rbx), %rdx           ; rdx = this.matrix (compositor input)
   *   0x104420  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x104427  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x10442a  xorl  %esi, %esi                  ; esi = 0
   *   0x10442c  callq *0x78(%rax)                 ; compositor.SetInput(0, rdx)
   *   0x10442f  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x104436  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x104439  movss 0x2ccbef(%rip), %xmm0       ; xmm0 = f32 0.23086372017860413
   *   0x104441  movss 0x2ccbeb(%rip), %xmm1       ; xmm1 = f32 0.0019238642416894436
   *   0x104449  movss 0x2c5e37(%rip), %xmm2       ; xmm2 = f32 0.3333333432674408 (1/3)
   *   0x104451  movss 0x2ccbdf(%rip), %xmm3       ; xmm3 = f32 0.36444443464279175
   *   0x104459  xorl  %esi, %esi                  ; esi = 0 (segment index)
   *   0x10445b  callq *0x60(%rax)                 ; compositor.SetParameter(0, ...)
   *   0x10445e  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x104465  movss 0x1b0(%rbx), %xmm1          ; xmm1 = this.dd_f32 (0.5896344)
   *   0x10446d  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x104470  movss 0x2ccbc4(%rip), %xmm0       ; xmm0 = f32 0.10163448750972748
   *   0x104478  xorps %xmm2, %xmm2                ; xmm2 = 0.0f
   *   0x10447b  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x10447e  movl  $0x1, %esi                  ; esi = 1 (segment index)
   *   0x104483  callq *0x60(%rax)                 ; compositor.SetParameter(1, ...)
   *   0x104486  movq  0x1a0(%rbx), %rax           ; rax = this.compositor (return value)
   *   0x10448d..0x104491  epilogue, retq.
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of this filter in the graph).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x1043da: r14 = this.matrix. May be null (colorimetry != 0 path).
    const matrix = this.matrix;
    const comp = this.compositor;
    if (comp == null) {
      // Would only happen if the ctor threw between the compositor
      // allocation and its store — unreachable on any successful
      // construction, but a loud fault is preferable to `!` (rule 3).
      throw new Error(
        "HGNikonNLog::Encode::GetOutput @Helium 0x104420 — compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x1043e9: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x1043ee..0x104419: default compositor input = the raw
    // GetInput result. If matrix is present, we route the input through
    // the matrix stage first and use `this.matrix` as the compositor
    // input instead.
    let compositorInput: HGNode = input;
    if (matrix != null) {
      // @Helium 0x1043fe: matrix.SetInput(0, input) via vtable *0x78
      matrix.SetInput(0, input);
      // @Helium 0x104414: matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)
      // matrixSrcRow is invariant-paired with matrix: both null or both
      // non-null (see ctor @0x104226 + @0x104259). Assert-and-throw the
      // pair invariant rather than the `!` (rule 3).
      if (this.matrixSrcRow == null) {
        throw new Error(
          "HGNikonNLog::Encode::GetOutput @Helium 0x104408 — matrixSrcRow null while matrix non-null (ctor invariant violation)"
        );
      }
      matrix.LoadMatrix(this.matrixSrcRow, true);
      // @Helium 0x104419: compositorInput = this.matrix
      compositorInput = matrix as unknown as HGNode;
    }
    // @Helium 0x10442c: compositor.SetInput(0, compositorInput) via vtable *0x78
    comp.SetInput(0, compositorInput);
    // @Helium 0x10445b: compositor.SetParameter(0, 0.23086, 0.001924, 1/3, 0.36444) — cube-root segment.
    comp.SetParameter(
      0,
      HGNikonNLog_Encode_seg0_xmm0,
      HGNikonNLog_Encode_seg0_xmm1,
      HGNikonNLog_Encode_seg0_xmm2_one_third,
      HGNikonNLog_Encode_seg0_xmm3,
    );
    // @Helium 0x104483: compositor.SetParameter(1, 0.10163, dd_f32, 0.0f, 0.0f) — log segment.
    comp.SetParameter(
      1,
      HGNikonNLog_Encode_seg1_xmm0,
      this.dd_f32,
      Math.fround(0.0),
      Math.fround(0.0),
    );
    // @Helium 0x104486: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
