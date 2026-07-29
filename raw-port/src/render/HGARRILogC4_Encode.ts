// raw-port/src/render/HGARRILogC4_Encode.ts
//
// FCP `HGARRILogC4::Encode` — nested Helium HGNode subclass implementing
// the newer ARRI LogC4 (LogC gen-2) camera-log OETF (scene-linear →
// LogC4 encoded video). Structural twin of `HGARRILogC::Encode`
// (see raw-port/src/render/HGARRILogC_Encode.ts) — a source-gamut
// HGColorMatrix stage feeding a HgcLogVideo_encode compositor
// configured with two SetParameter calls. LogC4 is significantly
// SIMPLER than LogC3:
//   • ctor takes ONE arg (colorimetry) — NO Exposure-Index parameter,
//     and NO logCurveParameters lookup ladder. LogC4 is a single fixed
//     transfer function.
//   • coefficient PRECOMPUTE lives in FUNCTION-STATIC MEYERS SINGLETONS
//     inside GetOutput (five of them: `s`, `t`, `ep`, `fp`, `tp`), lazily
//     initialised on the first call via .cold.1..cold.5 helpers, rather
//     than in per-instance fields at 0x1b0..0x1c8 like the LogC3 sibling.
//   • the four LOG-segment SetParameter(0,...) constants come from a
//     4-float BLOCK in __const at 0x3d0fc0..0x3d0fcf (RIP-relative
//     loads), NOT from per-instance fields.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY (source of every citation below):
//   /tmp/Helium_tV.txt: the full `otool -tV -arch x86_64` of Helium.
//   Method boundaries:
//     C2       @0x102c00..0x102ca9
//     C1       @0x102cb0..0x102cba (tail-jmp to C2)
//     D2       @0x102cc0..0x102d0d
//     D1       @0x102d10..0x102d5d
//     D0       @0x102d60..0x102db5
//     GetOutput@0x102dc0..0x102f27
//     cold.1   @0x3c39d0..0x3c3a04  (init `s`)
//     cold.2   @0x3c3a10..0x3c3a44  (init `t`)
//     cold.3   @0x3c3a50..0x3c3a97  (init `ep`)
//     cold.4   @0x3c3aa0..0x3c3ae7  (init `fp`)
//     cold.5   @0x3c3af0..0x3c3b2f  (init `tp`)
//
// SYMBOLS:
//   @Helium 0x102c00  HGARRILogC4::Encode::Encode(SceneColorimetry)  [C2]  __ZN11HGARRILogC46EncodeC2ENS_16SceneColorimetryE
//   @Helium 0x102cb0  HGARRILogC4::Encode::Encode(SceneColorimetry)  [C1]  __ZN11HGARRILogC46EncodeC1ENS_16SceneColorimetryE — tail-jmp to C2
//   @Helium 0x102cc0  HGARRILogC4::Encode::~Encode()                   [D2] __ZN11HGARRILogC46EncodeD2Ev
//   @Helium 0x102d10  HGARRILogC4::Encode::~Encode()                   [D1] __ZN11HGARRILogC46EncodeD1Ev
//   @Helium 0x102d60  HGARRILogC4::Encode::~Encode()                   [D0] __ZN11HGARRILogC46EncodeD0Ev
//   @Helium 0x102dc0  HGARRILogC4::Encode::GetOutput(HGRenderer*)     __ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer
//   @Helium 0x3d1700  HGARRILogC4::Encode::sourceToARRIWideGamut4     [static data]
//
// VTABLE:
//   Ctor C2 @0x102c15 emits `leaq 0x915de4(%rip), %rax` →
//     resolves to 0x102c1c + 0x915de4 = 0xa18a00 — the installed pointer
//     for `HGARRILogC4::Encode` (vtable-base + 0x10 per Itanium ABI).
//   D2 @0x102cc9 reinstalls at 0x102cd0 + 0x915d30 = 0xa18a00 (verified).
//   D1 @0x102d19 reinstalls at 0x102d20 + 0x915ce0 = 0xa18a00 (verified).
//   D0 @0x102d69 reinstalls at 0x102d70 + 0x915c90 = 0xa18a00 (verified).
//
// CTOR ARG ORDER (from `movl %esi,%r14d` @0x102c0a):
//   rdi = this
//   esi = colorimetry (SceneColorimetry enum, u32; captured into r14d)
//
// STRUCT LAYOUT (recovered from C2 + GetOutput — the ONLY subclass fields
// ever touched by any ported entry point):
//   HGARRILogC4::Encode extends HGNode (base ctor @0x102c10). Subclass
//   fields:
//     0x198 : HGColorMatrix*      matrix           (allocated @0x102c1f-0x102c34, 0x1F0 bytes)
//     0x1a0 : HgcLogVideo_encode* compositor        (allocated @0x102c3b-0x102c50, 0x1A0 bytes)
//     0x1a8 : const void*         matrixSrcRow     (pointer into sourceToARRIWideGamut4,
//                                                    offset = colorimetry * 0x40)
//   NOTHING at 0x1b0..0x1c8 (unlike LogC3::Encode). Verified: the ctor
//   body @0x102c00..0x102c79 has NO stores past 0x1a8. The compositor
//   receives its coefficients directly in GetOutput at runtime, sourced
//   from module-level constants + first-call-computed Meyers singletons.
//
// STATIC DATA:
//   `sourceToARRIWideGamut4` @0x3d1700 (2 × 0x40 = 128 bytes, 2 × 4×4
//   row-major float32 matrices, indexed by `colorimetry` ∈ {0,1}).
//   Values verified byte-exact against the Helium x86_64 slice below.
//
// GETOUTPUT (@0x102dc0..0x102f27) — rendering-graph wiring:
//   1) input = renderer.GetInput(this, 0)                              @0x102dd9
//   2) matrix.vtable[0x78](0, input)      // SetInput slot 0            @0x102de9
//   3) matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)         @0x102dff
//   4) [check guards for s,t,ep,fp,tp — call cold.N if not yet inited]
//   5) compositor.vtable[0x78](0, matrix)  // SetInput slot 0           @0x102e62
//   6) compositor.vtable[0x60](0, LOG4_A, LOG4_B, LOG4_C, LOG4_D)       @0x102e91
//        LOG4_A/B/C/D read from f32 __const block at 0x3d0fc0..0x3d0fcf
//                                            LOG segment (log-region)
//   7) compositor.vtable[0x60](1, ep, fp, tp, 0.0f)                     @0x102ebe
//                                            LINEAR segment (near-zero)
//   8) return this.compositor                                           @0x102ec1
//
// LOG-SEGMENT CONSTANTS (@0x3d0fc0..0x3d0fcf — 4 × f32, RIP-relative):
//   @0x3d0fc0 = 2008.6436767578125  (0x44FB1499)    LogC4 log-denom "a"
//   @0x3d0fc4 = 64.0                (0x42800000)    LogC4 log-add   "b"
//   @0x3d0fc8 = 0.06479541957378387 (0x3D84B376)    LogC4 log-scale "c"
//   @0x3d0fcc = -0.2959083914756775 (0xBE97814E)    LogC4 log-off   "d"
// These are the published ARRI LogC4 v1.0 forward-transfer LOG-region
// coefficients: for lin > t, encoded = c*log2(a*lin + b) + d. The
// compositor consumes them in the (A, B, C, D) order captured above via
// four consecutive `movss` loads with adjacent 4-byte displacements.
//
// LINEAR-SEGMENT MEYERS SINGLETONS (init once at first GetOutput call):
//   s  (f64, cold.1) = 0x3FBD14B4E7E63D19 = 0.1135972086105891
//        Published LogC4 linear-region SLOPE 's'. Same value as
//        HGArriLogC4LinearizationLUTInfo's `s` — the two ARE the same
//        published constant.
//   t  (f64, cold.2) = 0xBF927D887F3231C4 = -0.01805699611991131
//        Published LogC4 linear-region OFFSET 't'. Same value as
//        HGArriLogC4LinearizationLUTInfo's `t`.
//   ep (f32, cold.3) = f32( (1.0 / s) * 0.9 )
//        The compositor's LINEAR-segment "encoded-per-linear" slope
//        (baked with the 0.9 normalisation used throughout LogC).
//        Cold.3 body: xmm0 = 1.0; xmm0 /= s; xmm0 *= 0.9; cvtsd2ss → ep.
//   fp (f32, cold.4) = f32( -t / s )
//        The zero-crossing offset for the linear segment.
//        Cold.4 body: xmm0 = t; xmm0 ^= -0.0 (sign-flip); xmm0 /= s;
//        cvtsd2ss → fp.
//   tp (f32, cold.5) = f32( t / 0.9 )
//        The linear-region threshold offset in the compositor's shader
//        space.
//        Cold.5 body: xmm0 = t; xmm0 /= 0.9; cvtsd2ss → tp.
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcLogVideo_encode::HgcLogVideo_encode()  __ZN18HgcLogVideo_encodeC1Ev — invoked @0x102c4b
//   HGColorMatrix::HGColorMatrix()            __ZN13HGColorMatrixC1Ev      — invoked @0x102c2f
//   HGColorMatrix::LoadMatrix(...)            __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x102dff
//   HGObject::operator new(unsigned long)     __ZN8HGObjectnwEm            — invoked @0x102c24 / @0x102c40
//   HGObject::operator delete(void*)          __ZN8HGObjectdlEPv           — invoked @0x102da8 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)        __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x102dd9
//   HgcLogVideo_encode/HGColorMatrix vtable slots *0x18 (Release),
//                                             *0x60 (SetParameter),
//                                             *0x78 (SetInput).
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Placeholders for helper classes touched by this node but not yet ported.
// Each interface exposes only the vtable slots we actually invoke, and each
// helper raises loudly (rule 3: no silent fill-in) — see the per-function
// citations for the exact @0xADDR each one is deferring.
// ---------------------------------------------------------------------------

/**
 * Placeholder for `HGRenderer` used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for HGRenderer.
 * The only method invoked here is `GetInput(HGNode*, int) -> HGNode*`
 * at @Helium 0x102dd9.
 */
export interface HGRendererStub {
  /** @Helium 0x102dd9 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the color-matrix node owned at `this.matrix`
 * (`+0x198`). Undecoded — exposes only the vtable slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x102de9 with (0, input).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x102dff with (this.matrixSrcRow, true).
 *      Mangled __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — the second arg
 *      is a bool (edx=1) and the first is a pointer to a 4-float vector
 *      array (a 4×4 row-major float32 matrix in this call site).
 *   - `Release()` via slot *0x18 — invoked from all three dtors.
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x102de9. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x102dff with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2 (@0x102ce2, 0x102d32, 0x102d82). */
  Release(): void;
}

/**
 * Placeholder for the segmented log-video encoder owned at
 * `this.compositor` (`+0x1a0`). Undecoded — exposes only the vtable
 * slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x102e62 with (0, matrix).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x102e91 with (0, LOG4_A, LOG4_B, LOG4_C, LOG4_D) // LOG segment
 *          — invoked @0x102ebe with (1, ep, fp, tp, 0.0f)               // LINEAR segment
 *   - `Release()` via slot *0x18 — invoked from all three dtors
 *          (@0x102cf4, 0x102d44, 0x102d94).
 */
export interface HgcLogVideo_encode {
  /** vtable *0x78 @Helium — @0x102e62. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x102c3b..0x102c4b:
 *   0x102c3b  movl  $0x1a0,%edi                     ; alloc size = 0x1A0 = 416
 *   0x102c40  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x102c4b  callq __ZN18HgcLogVideo_encodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGARRILogC4::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x102c40/0x102c4b not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x102c1f..0x102c2f:
 *   0x102c1f  movl  $0x1f0,%edi                     ; alloc size = 0x1F0 = 496
 *   0x102c24  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x102c2f  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGARRILogC4::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x102c24/0x102c2f not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static data: `HGARRILogC4::Encode::sourceToARRIWideGamut4` @Helium 0x3d1700.
//
// 2 entries × 0x40 = 128 bytes; each entry is a 4×4 row-major float32
// matrix (source RGB → ARRI Wide Gamut 4). Indexed by the
// SceneColorimetry enum (0 or 1). Ctor addressing @0x102c57..0x102c68
// stores `sourceToARRIWideGamut4 + (colorimetry << 6)` into
// `this.matrixSrcRow (+0x1a8)`; GetOutput then hands that pointer to
// `HGColorMatrix::LoadMatrix` with transpose=true (edx=1).
//
// Values below are byte-exact reads from the Helium x86_64 slice at
// file offset 0x3d1700 (VA == file-offset in the thin slice).
// ---------------------------------------------------------------------------

/**
 * `HGARRILogC4::Encode::sourceToARRIWideGamut4` @Helium 0x3d1700.
 * `sourceToARRIWideGamut4[colorimetry]` is a 16-float row-major 4×4
 * matrix (float32). Each row's last column is 0 (rows 0..2) or 1
 * (row 3) — the standard homogeneous affine form.
 *
 * The specific colorimetry semantics (Rec.709 vs Rec.2020 vs …) are
 * declared in the `SceneColorimetry` enum, which is NOT yet decoded —
 * the port carries the raw table data and leaves interpretation to
 * the caller.
 */
export const HGARRILogC4Encode_sourceToARRIWideGamut4: readonly (readonly number[])[] = [
  // @Helium 0x3d1700  entry[0] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.5658365488052368), Math.fround( 0.3403309881687164), Math.fround( 0.0938324630260468), Math.fround(0.0),
    Math.fround( 0.0886256396770477), Math.fround( 0.8093468546867371), Math.fround( 0.1020275205373764), Math.fround(0.0),
    Math.fround( 0.0177500396966934), Math.fround( 0.1094476208090782), Math.fround( 0.8728023171424866), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
  // @Helium 0x3d1740  entry[1] — 16 floats (row-major 4×4)
  [
    Math.fround( 0.8954749703407288), Math.fround( 0.0436145588755608), Math.fround( 0.0609104745090008), Math.fround(0.0),
    Math.fround( 0.0445056632161140), Math.fround( 0.8545670509338379), Math.fround( 0.1009272709488869), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0257770474255085), Math.fround( 0.9742229580879211), Math.fround(0.0),
    Math.fround( 0.0),                Math.fround( 0.0),                Math.fround( 0.0),                Math.fround(1.0),
  ],
] as const;

// ---------------------------------------------------------------------------
// LOG-segment SetParameter(0,...) constants — read via 4 consecutive
// `movss` RIP-relative loads @0x102e6f..0x102e87 targeting the __const
// f32 block at 0x3d0fc0..0x3d0fcf. Each value verified by direct
// byte-read at file offset VA of the Helium x86_64 slice.
// ---------------------------------------------------------------------------

/** @Helium 0x3d0fc0  f32 = 2008.6436767578125 (0x44FB1499).
 *  LogC4 forward-transfer LOG-region denominator constant "a"
 *  (published ARRI value = 2 * 4^6 - 64 = 8128... actually the compositor
 *  consumes this as the numerator scale). RIP-relative operand:
 *  `movss 0x2ce149(%rip), %xmm0` @0x102e6f → (0x102e77) + 0x2ce149 = 0x3d0fc0. */
export const HGARRILogC4_Encode_LOG_A: number = Math.fround(2008.6436767578125);

/** @Helium 0x3d0fc4  f32 = 64.0 (0x42800000).
 *  LogC4 forward-transfer LOG-region additive constant "b". Same as
 *  the |K4|-magnitude from HGArriLogC4LinearizationLUTInfo (which uses
 *  it as -64.0 f64 in the INVERSE direction). Here it enters as +64.0
 *  in the FORWARD direction. Loaded by `movss 0x2ce145(%rip), %xmm1`
 *  @0x102e77 → (0x102e7f) + 0x2ce145 = 0x3d0fc4. */
export const HGARRILogC4_Encode_LOG_B: number = Math.fround(64.0);

/** @Helium 0x3d0fc8  f32 = 0.06479541957378387 (0x3D84B376).
 *  LogC4 forward-transfer LOG-region scale coefficient "c" — the
 *  reciprocal of the inverse's K5/K1/K6 chain (2^14 / (2231.826... *
 *  0.9) in the linearizer). Loaded by `movss 0x2ce141(%rip), %xmm2`
 *  @0x102e7f → (0x102e87) + 0x2ce141 = 0x3d0fc8. */
export const HGARRILogC4_Encode_LOG_C: number = Math.fround(0.06479541957378387);

/** @Helium 0x3d0fcc  f32 = -0.2959083914756775 (0xBE97814E).
 *  LogC4 forward-transfer LOG-region offset coefficient "d" — the
 *  constant added to c*log2(a*lin + b). Loaded by
 *  `movss 0x2ce13d(%rip), %xmm3` @0x102e87 → (0x102e8f) + 0x2ce13d = 0x3d0fcc. */
export const HGARRILogC4_Encode_LOG_D: number = Math.fround(-0.2959083914756775);

// ---------------------------------------------------------------------------
// LINEAR-segment SetParameter(1,...) Meyers singletons — computed on
// first call to GetOutput via cold.1..cold.5 helpers. In the shipped
// binary these are function-static variables guarded by ___cxa_guard_*.
// In TS the module-load order + `const` initialisation trivially replaces
// the guard-acquire/release dance; the values here are BIT-EXACT to
// what cold.N deposits at the first call.
// ---------------------------------------------------------------------------

/**
 * LogC4 linear-region slope `s` — Meyers singleton `s` in the shipped
 * binary, guard-protected first-call init at @Helium 0x3c39d0 (cold.1).
 *
 * Cold.1 body @0x3c39e4..0x3c39ee: `movabsq $0x3fbd14b4e7e63d19, %rax;
 * movq %rax, ::s(%rip)`. Value: 0x3FBD14B4E7E63D19 = 0.1135972086105891
 * (f64). Same published constant as HGArriLogC4LinearizationLUTInfo's
 * `HGArriLogC4_S`.
 *
 * @Helium 0x3c39e4
 */
const HGARRILogC4_Encode_s: number = 0.1135972086105891;

/**
 * LogC4 linear-region offset `t` — Meyers singleton `t`, guarded
 * first-call init at @Helium 0x3c3a10 (cold.2).
 *
 * Cold.2 body @0x3c3a24..0x3c3a2e: `movabsq $-0x406d827780cdce3c, %rax;
 * movq %rax, ::t(%rip)` where -0x406d827780cdce3c = 0xBF927D887F3231C4
 * = -0.01805699611991131 (f64). Same published constant as
 * HGArriLogC4LinearizationLUTInfo's `HGArriLogC4_T`.
 *
 * @Helium 0x3c3a24
 */
const HGARRILogC4_Encode_t: number = -0.01805699611991131;

/**
 * LogC4 compositor LINEAR-segment slope `ep` (f32) — Meyers singleton
 * `ep`, guarded first-call init at @Helium 0x3c3a50 (cold.3).
 *
 * Cold.3 body @0x3c3a64..0x3c3a80:
 *   0x3c3a64  movsd  0x67f4(%rip), %xmm0   ; xmm0 = 1.0   (@0x3ca260)
 *   0x3c3a6c  divsd  s(%rip), %xmm0        ; xmm0 = 1.0 / s
 *   0x3c3a74  mulsd  0xd3d4(%rip), %xmm0   ; xmm0 *= 0.9  (@0x3d0e50)
 *   0x3c3a7c  cvtsd2ss %xmm0, %xmm0        ; xmm0 = f32(xmm0)
 *   0x3c3a80  movss  %xmm0, ::ep(%rip)
 *
 * RIP-relative constant addresses (verified by resolve.py):
 *   @0x3ca260 = 1.0
 *   @0x3d0e50 = 0.9
 *
 * Formula: ep = f32( (1.0 / s) * 0.9 ) = f32( 0.9 / 0.1135972086105891 )
 *             = f32( 7.922729889298578 ) = 7.922729969024658
 *
 * @Helium 0x3c3a64
 */
const HGARRILogC4_Encode_ep: number =
  Math.fround((1.0 / HGARRILogC4_Encode_s) * 0.9);

/**
 * LogC4 compositor LINEAR-segment zero-crossing offset `fp` (f32) —
 * Meyers singleton `fp`, guarded first-call init at @Helium 0x3c3aa0
 * (cold.4).
 *
 * Cold.4 body @0x3c3ab4..0x3c3ad0:
 *   0x3c3ab4  movsd  t(%rip), %xmm0        ; xmm0 = t (= -0.01805...)
 *   0x3c3abc  xorpd  0x701c(%rip), %xmm0   ; xmm0 ^= -0.0 (@0x3caae0) → sign-flip
 *   0x3c3ac4  divsd  s(%rip), %xmm0        ; xmm0 = (-t) / s
 *   0x3c3acc  cvtsd2ss %xmm0, %xmm0
 *   0x3c3ad0  movss  %xmm0, ::fp(%rip)
 *
 * RIP-relative constant address (verified by resolve.py):
 *   @0x3caae0 = -0.0 (0x8000000000000000)   ; sign-flip mask (xorpd)
 *
 * Formula: fp = f32( -t / s ) = f32( 0.01805699611991131 / 0.1135972086105891 )
 *             = f32( 0.15895633652241087 ) = 0.15895633399486542
 *
 * @Helium 0x3c3ab4
 */
const HGARRILogC4_Encode_fp: number =
  Math.fround(-HGARRILogC4_Encode_t / HGARRILogC4_Encode_s);

/**
 * LogC4 compositor LINEAR-segment threshold offset `tp` (f32) — Meyers
 * singleton `tp`, guarded first-call init at @Helium 0x3c3af0 (cold.5).
 *
 * Cold.5 body @0x3c3b04..0x3c3b18:
 *   0x3c3b04  movsd  t(%rip), %xmm0        ; xmm0 = t (= -0.01805...)
 *   0x3c3b0c  divsd  0xd33c(%rip), %xmm0   ; xmm0 /= 0.9 (@0x3d0e50)
 *   0x3c3b14  cvtsd2ss %xmm0, %xmm0
 *   0x3c3b18  movss  %xmm0, ::tp(%rip)
 *
 * RIP-relative constant address (verified by resolve.py):
 *   @0x3d0e50 = 0.9 (same shared 0.9 constant used by cold.3 and by
 *                    HGARRILogC::Encode's coefficient precompute)
 *
 * Formula: tp = f32( t / 0.9 ) = f32( -0.01805699611991131 / 0.9 )
 *             = f32( -0.020063329022123676 ) = -0.020063329488039017
 *
 * @Helium 0x3c3b04
 */
const HGARRILogC4_Encode_tp: number =
  Math.fround(HGARRILogC4_Encode_t / 0.9);

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * SceneColorimetry enum placeholder — the underlying enum's meanings
 * (Rec.709 vs Rec.2020 vs …) are not yet decoded. Ctor accepts a
 * `number` here (u32 in the C++ signature); we DO NOT bound-check or
 * remap it — the disasm doesn't either, and the raw value indexes
 * `sourceToARRIWideGamut4` directly (as `<< 6`, i.e. 0x40 stride).
 */
export type HGARRILogC4Encode_SceneColorimetry = number;

/**
 * `HGARRILogC4::Encode` — Helium HGNode subclass. Wraps a color-matrix
 * stage (source-gamut → ARRI Wide Gamut 4) followed by an
 * HgcLogVideo_encode compositor configured for the ARRI ALEXA LogC4
 * forward transfer function. LogC4 has NO Exposure-Index parameter (a
 * single fixed transfer function), so this ctor takes ONE arg only.
 *
 * @Helium ctors     @0x102c00 (C2) / @0x102cb0 (C1);
 *         dtors     @0x102cc0 (D2) / @0x102d10 (D1) / @0x102d60 (D0);
 *         GetOutput @0x102dc0.
 */
export class HGARRILogC4Encode extends HGNode {
  /**
   * Owned `HGColorMatrix`. Field @0x198.
   * Assigned in ctor @0x102c34: `movq %r15, 0x198(%rbx)`.
   */
  matrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode` compositor. Field @0x1a0.
   * Assigned in ctor @0x102c50: `movq %r15, 0x1a0(%rbx)`.
   */
  compositor: HgcLogVideo_encode | null;

  /**
   * Pointer into `HGARRILogC4Encode_sourceToARRIWideGamut4` at
   * `[colorimetry]`. Field @0x1a8.
   * Assigned in ctor @0x102c68: `movq %rcx, 0x1a8(%rbx)`, where rcx
   * was set to `sourceToARRIWideGamut4 + (colorimetry<<6)` at
   * @0x102c57..0x102c65.
   */
  matrixSrcRow: readonly number[];

  /**
   * `HGARRILogC4::Encode::Encode(SceneColorimetry colorimetry)` —
   * Helium @0x102c00 (C2 base-object ctor). C1 @0x102cb0 tail-jmps to
   * C2 so only C2's body needs modelling.
   *
   * Verbatim asm (@0x102c00..0x102c79, prologue/epilogue elided):
   *   0x102c0a  movl  %esi, %r14d                     ; r14d = colorimetry
   *   0x102c0d  movq  %rdi, %rbx                      ; rbx  = this
   *   0x102c10  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x102c15  leaq  0x915de4(%rip), %rax            ; = 0xa18a00 (own vtable installed ptr)
   *   0x102c1c  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x102c1f  movl  $0x1f0, %edi                    ; alloc 0x1F0 for HGColorMatrix
   *   0x102c24  callq __ZN8HGObjectnwEm
   *   0x102c2f  callq __ZN13HGColorMatrixC1Ev
   *   0x102c34  movq  %r15, 0x198(%rbx)               ; this.matrix = new HGColorMatrix
   *   0x102c3b  movl  $0x1a0, %edi                    ; alloc 0x1A0 for HgcLogVideo_encode
   *   0x102c40  callq __ZN8HGObjectnwEm
   *   0x102c4b  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x102c50  movq  %r15, 0x1a0(%rbx)               ; this.compositor = new HgcLogVideo_encode
   *   0x102c57  movl  %r14d, %eax                     ; eax = colorimetry
   *   0x102c5a  shlq  $0x6, %rax                      ; rax = colorimetry * 0x40
   *   0x102c5e  leaq  sourceToARRIWideGamut4(%rip),%rcx
   *   0x102c65  addq  %rax, %rcx
   *   0x102c68  movq  %rcx, 0x1a8(%rbx)               ; this.matrixSrcRow = &table[colorimetry]
   *   0x102c6f..0x102c79  epilogue, retq.
   *
   * The exception-cleanup path @0x102c7a..0x102ca9 handles a throwing
   * HgcLogVideo_encode ctor or HGObject::operator new: it deletes the
   * partially-constructed compositor pointer (r15) via
   * `HGObject::operator delete`, calls `HGNode::~HGNode()`, and
   * resumes the unwind. It never executes on a successful construction
   * and is not modelled explicitly (TS exceptions unwind through the
   * stack naturally).
   *
   * @param colorimetry  SceneColorimetry (u32; NOT bounds-checked; indexes
   *                     `sourceToARRIWideGamut4`; the disasm doesn't check
   *                     either, so neither do we).
   */
  constructor(colorimetry: HGARRILogC4Encode_SceneColorimetry) {
    // @Helium 0x102c10: HGNode base ctor.
    super();
    // @Helium 0x102c1c: install this class's vtable (installed ptr = 0xa18a00).
    this.vtable = 0xa18a00;
    // @Helium 0x102c1f..0x102c34: alloc + ctor HGColorMatrix, store @0x198.
    // Throws until HGColorMatrix is transcribed.
    this.matrix = newHGColorMatrix();
    // @Helium 0x102c3b..0x102c50: alloc + ctor HgcLogVideo_encode, store @0x1a0.
    // Throws until HgcLogVideo_encode is transcribed.
    this.compositor = newHgcLogVideo_encode();
    // @Helium 0x102c57..0x102c68: matrixSrcRow = &sourceToARRIWideGamut4[colorimetry]
    // (the << 6 is a 64-byte stride pointing at the head of each 4×4 f32 matrix).
    this.matrixSrcRow = HGARRILogC4Encode_sourceToARRIWideGamut4[colorimetry];
    // NB: NO tail math. LogC4 has no per-EI table and no per-instance
    // coefficient fields — all compositor coefficients come from the
    // module-level constants + Meyers singletons at GetOutput time.
  }

  /**
   * `HGARRILogC4::Encode::~Encode()` — Helium @0x102cc0 (D2, base-object)
   * / @0x102d10 (D1, complete-object) / @0x102d60 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. D0's body
   * (@0x102d60..0x102da8):
   *   leaq  0x915c90(%rip), %rax         ; = 0xa18a00 (reinstall own vtable)
   *   movq  %rax, (%rdi)
   *   movq  0x198(%rdi), %rdi            ; matrix
   *   testq %rdi, %rdi ; je  ...         ; skip if null
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; matrix.Release()
   *   movq  0x1a0(%rbx), %rdi            ; compositor
   *   testq %rdi, %rdi ; je  ...
   *   movq  (%rdi), %rax ; callq *0x18(%rax) ; compositor.Release()
   *   movq  %rbx, %rdi ; callq __ZN6HGNodeD2Ev  ; HGNode::~HGNode()
   *   movq  %rbx, %rdi ; jmp   __ZN8HGObjectdlEPv ; delete this
   *
   * D2 @0x102cc0 and D1 @0x102d10 have byte-identical bodies except:
   *   - the vtable-reinstall leaq displacement is different (RIP differs)
   *   - the HGNode dtor is called via `jmp` (tail-call) instead of `call`
   *   - no operator-delete after the HGNode dtor.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   */
  destruct(): void {
    // @Helium 0x102cd0/0x102d20/0x102d70: vtable reinstall — modeled by assignment.
    this.vtable = 0xa18a00;
    // @Helium 0x102cd3..0x102ce2 (D2): release matrix if present.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x102ce5..0x102cf4 (D2): release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x102d00 (D2) / 0x102d50 (D1): jmp HGNode::~HGNode(). D0 uses callq
    // and then tail-jmps to HGObject::operator delete (handled by the caller
    // dropping the reference in TS).
    super.destruct();
  }

  /**
   * `HGARRILogC4::Encode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x102dc0.
   *
   * Wires the owned matrix + compositor into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the matrix as input slot 0    (matrix.SetInput slot *0x78)
   *   3) load the source→ARRI4 matrix (transposed) (matrix.LoadMatrix)
   *   4) [Meyers-singleton guards for s,t,ep,fp,tp — one-time init dance]
   *   5) hand the matrix into the compositor      (compositor.SetInput slot *0x78)
   *   6) SetParameter(0, LOG4_A, LOG4_B, LOG4_C, LOG4_D)  (LOG segment,    slot *0x60)
   *   7) SetParameter(1, ep, fp, tp, 0.0f)                (LINEAR segment, slot *0x60)
   *   8) return the compositor.
   *
   * Verbatim asm (@0x102dc0..0x102f27, prologue/epilogue elided):
   *   0x102dca  movq  0x198(%rdi), %r14           ; r14 = this.matrix
   *   0x102dd1  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x102dd4  movq  %rbx, %rsi                  ; rsi = this
   *   0x102dd7  xorl  %edx, %edx
   *   0x102dd9  callq __ZN10HGRenderer8GetInputEP6HGNodei ; input = renderer.GetInput(this, 0)
   *   0x102dde  movq  (%r14), %rcx                ; rcx = matrix.vtable
   *   0x102de1  movq  %r14, %rdi                  ; rdi = matrix
   *   0x102de4  xorl  %esi, %esi
   *   0x102de6  movq  %rax, %rdx                  ; rdx = input
   *   0x102de9  callq *0x78(%rcx)                 ; matrix.SetInput(0, input)
   *   0x102dec  movq  0x198(%rbx), %rdi           ; rdi = this.matrix
   *   0x102df3  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixSrcRow
   *   0x102dfa  movl  $0x1, %edx                  ; edx = 1 (transpose)
   *   0x102dff  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                ; matrix.LoadMatrix(matrixSrcRow, true)
   *   0x102e04..0x102e4f  Meyers-singleton guard checks for s,t,ep,fp,tp.
   *                       Each `movzbl guard_var(%rip),%eax; testb %al,%al;
   *                       je cold.N` checks the low byte of the guard; the
   *                       shipped binary uses gcc's 2-byte guard-variable
   *                       convention (byte 0 = "initialized" flag, byte 1 =
   *                       "in-flight" flag). Cold.N does ___cxa_guard_acquire
   *                       + init-body + ___cxa_guard_release then RETs; on
   *                       return the outer function RE-READS the guard and
   *                       jumps forward. In TS the module-level `const`
   *                       initialisations are eagerly-evaluated so the
   *                       guard dance is a no-op — the values are ready
   *                       before any GetOutput() call.
   *   0x102e4f  movq  0x198(%rbx), %rdx           ; rdx = this.matrix (input for next stage)
   *   0x102e56  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x102e5d  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x102e60  xorl  %esi, %esi
   *   0x102e62  callq *0x78(%rax)                 ; compositor.SetInput(0, matrix)
   *   0x102e65  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x102e6f  movss 0x2ce149(%rip), %xmm0       ; xmm0 = LOG4_A = 2008.6437f (@0x3d0fc0)
   *   0x102e77  movss 0x2ce145(%rip), %xmm1       ; xmm1 = LOG4_B = 64.0f     (@0x3d0fc4)
   *   0x102e7f  movss 0x2ce141(%rip), %xmm2       ; xmm2 = LOG4_C = 0.06479f  (@0x3d0fc8)
   *   0x102e87  movss 0x2ce13d(%rip), %xmm3       ; xmm3 = LOG4_D = -0.29591f (@0x3d0fcc)
   *   0x102e8f  xorl  %esi, %esi
   *   0x102e91  callq *0x60(%rax)                 ; compositor.SetParameter(0, LOG4_A..LOG4_D)
   *   0x102e94  movq  0x1a0(%rbx), %rdi           ; rdi = this.compositor
   *   0x102e9b  movss ::ep(%rip), %xmm0           ; xmm0 = ep (Meyers f32)
   *   0x102ea3  movss ::fp(%rip), %xmm1           ; xmm1 = fp (Meyers f32)
   *   0x102eab  movss ::tp(%rip), %xmm2           ; xmm2 = tp (Meyers f32)
   *   0x102eb3  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x102eb6  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x102eb9  movl  $0x1, %esi
   *   0x102ebe  callq *0x60(%rax)                 ; compositor.SetParameter(1, ep, fp, tp, 0.0)
   *   0x102ec1  movq  0x1a0(%rbx), %rax           ; rax = this.compositor
   *   0x102ec8..0x102ecc  epilogue, retq.
   *
   * The tail (@0x102ecd..0x102f27) contains the cold.N dispatch stubs
   * for the guard-miss paths — each `callq cold.N` then re-reads the
   * next guard and branches forward. In TS we skip this whole slow
   * path (guards are pre-initialised).
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of this filter in the graph).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x102dca: r14 = this.matrix. Invariant: non-null after ctor.
    const matrix = this.matrix;
    const comp = this.compositor;
    if (matrix == null || comp == null) {
      // C++ path where this is unreachable — but TS type-narrowing
      // wants the null guard, and a loud fault is preferable to `!`
      // (rule 3).
      throw new Error(
        "HGARRILogC4::Encode::GetOutput @Helium 0x102dca — matrix or compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x102dd9: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x102de9: matrix.SetInput(0, input) via vtable *0x78
    matrix.SetInput(0, input);
    // @Helium 0x102dff: matrix.LoadMatrix(this.matrixSrcRow, /*transpose=*/true)
    matrix.LoadMatrix(this.matrixSrcRow, true);
    // @Helium 0x102e04..0x102e4f: five Meyers-singleton guard checks —
    // no-op in TS (see method doc). All five constants are already
    // module-initialised by the time we get here.
    // @Helium 0x102e62: compositor.SetInput(0, matrix) via vtable *0x78
    comp.SetInput(0, matrix as unknown as HGNode);
    // @Helium 0x102e91: compositor.SetParameter(0, LOG4_A, LOG4_B, LOG4_C, LOG4_D)
    //                    — LOG segment coefficients (fixed for LogC4).
    comp.SetParameter(
      0,
      HGARRILogC4_Encode_LOG_A,
      HGARRILogC4_Encode_LOG_B,
      HGARRILogC4_Encode_LOG_C,
      HGARRILogC4_Encode_LOG_D,
    );
    // @Helium 0x102ebe: compositor.SetParameter(1, ep, fp, tp, 0.0f)
    //                    — LINEAR segment (near-zero) coefficients.
    comp.SetParameter(
      1,
      HGARRILogC4_Encode_ep,
      HGARRILogC4_Encode_fp,
      HGARRILogC4_Encode_tp,
      Math.fround(0.0),
    );
    // @Helium 0x102ec1: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
