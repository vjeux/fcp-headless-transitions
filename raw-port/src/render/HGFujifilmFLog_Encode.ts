// raw-port/src/render/HGFujifilmFLog_Encode.ts
//
// FCP `HGFujifilmFLog::Encode` — nested Helium HGNode subclass. Wraps an
// owned `HgcLogVideo_encode` compositor (and, only when
// `colorimetry != 0`, a preceding `HGColorMatrix` node driven by the
// `HGColorGamma::rec709RGBToRec2020RGB` matrix table) and configures the
// compositor, via two SetParameter calls, to implement the Fujifilm
// F-Log forward transfer function (scene-linear light → F-Log encoded
// video). The four coefficients per SetParameter call are read at
// GetOutput time from two RIP-relative float32 arrays selected by the
// `LogEncoding` enum (0 → F-Log v1; !=0 → F-Log2).
//
// Structurally this is the nested-class facade pattern shared with
// HGACEScct::Encode and HGARRILogC::Encode — see
// raw-port/src/render/HGACEScct_Encode.ts and
// raw-port/src/render/HGARRILogC_Encode.ts for the template. The key
// difference is that F-Log stores NO precomputed float fields on the
// object: the coefficients live in the const data section and the
// LogEncoding index (`this.logEncoding == 0 ? 4 : 0`) is applied as a
// stride-adjustment into the two-slot float arrays at GetOutput time.
// The inverse direction (F-Log v1 encoded → linear) is decoded in
// raw-port/src/render/HGFujifilmFLogLinearizationLUTInfo.ts — read that
// file for the spec parameter names (a,b,c,d,e,f + cut) each of the
// float32 values below correspond to; we DO NOT re-derive the shader
// semantics here.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA ==
// file offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…` and by
// bytewise-reading /tmp/Helium.x86_64 (see comments per constant).
//
// DISASSEMBLY (source of every citation below):
//   /tmp/Helium_tV.txt: the full `otool -tV -arch x86_64` of Helium.
//   Method boundaries:
//     C2       @0x103ec0..0x103f8a
//     C1       @0x103f90..0x103f9a (tail-jmp to C2 through a trivial frame)
//     D2       @0x103fa0..0x103fed
//     D1       @0x103ff0..0x10403d
//     D0       @0x104040..0x104095
//     GetOutput@0x1040a0..0x1041d1
//   No `.cold.*` initializers — this class holds NO function-scope
//   statics; every RIP-relative constant is a plain data-section
//   const the ctor and GetOutput reload on every call.
//
// SYMBOLS:
//   @Helium 0x103ec0  HGFujifilmFLog::Encode::Encode(SceneColorimetry, LogEncoding)   [C2]
//                     __ZN14HGFujifilmFLog6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingE
//   @Helium 0x103f90  HGFujifilmFLog::Encode::Encode(SceneColorimetry, LogEncoding)   [C1]
//                     __ZN14HGFujifilmFLog6EncodeC1ENS_16SceneColorimetryENS_11LogEncodingE
//                     — trivial `push rbp / mov rsp / pop rbp / jmp C2` thunk.
//   @Helium 0x103fa0  HGFujifilmFLog::Encode::~Encode()                               [D2]
//                     __ZN14HGFujifilmFLog6EncodeD2Ev
//   @Helium 0x103ff0  HGFujifilmFLog::Encode::~Encode()                               [D1]
//                     __ZN14HGFujifilmFLog6EncodeD1Ev
//   @Helium 0x104040  HGFujifilmFLog::Encode::~Encode()                               [D0 deleting]
//                     __ZN14HGFujifilmFLog6EncodeD0Ev
//   @Helium 0x1040a0  HGFujifilmFLog::Encode::GetOutput(HGRenderer*)
//                     __ZN14HGFujifilmFLog6Encode9GetOutputEP10HGRenderer
//   @Helium 0x3cfc30  HGColorGamma::rec709RGBToRec2020RGB [static data — LoadMatrix source]
//                     __ZN12HGColorGamma21rec709RGBToRec2020RGBE
//
// VTABLE INSTALLED-PTR:
//   Ctor C2 @0x103ed9 emits `leaq 0x9158a0(%rip), %rax` → next-PC 0x103ee0
//   + 0x9158a0 = 0xa19780. Reinstalled at D2 @0x103fa9 (`leaq 0x9157d0`),
//   D1 @0x103ff9 (`leaq 0x915780`), D0 @0x104049 (`leaq 0x915730`) —
//   each displacement chosen so that RIP-next + disp == 0xa19780.
//
// CTOR ARG ORDER (from `movl %edx,%r15d ; movl %esi,%r14d` @0x103ecb):
//   rdi = this
//   esi = colorimetry (HGFujifilmFLog::SceneColorimetry enum, u32; captured into r14d)
//   edx = logEncoding (HGFujifilmFLog::LogEncoding    enum, u32; captured into r15d)
//
// STRUCT LAYOUT (recovered from C2 + GetOutput; sizeof ≥ 0x1b4):
//   HGFujifilmFLog::Encode extends HGNode (base ctor called @0x103ed4). Subclass
//   fields:
//     0x198 : HGColorMatrix*      matrix        (default-null via
//                                                `movq $0x0, 0x198(%rbx)` @0x103ee3;
//                                                allocated only when
//                                                colorimetry == 0, in the
//                                                `testl %r14d,%r14d ; jne` guard
//                                                @0x103f1c..0x103f4b.)
//     0x1a0 : HgcLogVideo_encode* compositor    (allocated + ctor'd unconditionally
//                                                @0x103eee/0x103ef3/0x103efe; stored
//                                                @0x103f03.)
//     0x1a8 : const void*         gammaTable    (default-null via
//                                                `movq $0x0, 0x1a8(%rbx)` @0x103f0a;
//                                                set to `&HGColorGamma::rec709RGBToRec2020RGB`
//                                                only when colorimetry == 0, at
//                                                @0x103f3d..0x103f44 — this address is
//                                                the pointer LoadMatrix consumes.)
//     0x1b0 : u32                 logEncoding   (raw LogEncoding enum value; stored
//                                                @0x103f15 via `movl %r15d, 0x1b0(%rbx)`.
//                                                Consumed by GetOutput's index-branch at
//                                                @0x1040f6..0x104100 — see below.)
//   Total sizeof (from the field-write pattern) ≥ 0x1b4, likely rounded
//   up to 0x1b8 for 8-byte alignment; no `movl $0xN, %edi ; new` size is
//   emitted for THIS class (the parent allocates it).
//
// GETOUTPUT (@0x1040a0..0x1041d1) — rendering-graph wiring:
//   1) input = renderer.GetInput(this, 0)                              @0x1040bd
//   2) IF this.matrix != null (colorimetry==0 path):
//        matrix.vtable[0x78](0, input)   // SetInput slot 0             @0x1040d2
//        HGColorMatrix::LoadMatrix(&this.gammaTable, /*transpose=*/true) @0x1040e8
//                          (`movl $0x1, %edx` — the bool arg is TRUE
//                           for transpose; symbol
//                           __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb;
//                           rdx == this.matrix, rsi == this.gammaTable.)
//      ELSE (matrix null): fall through to step 3 with input still the raw
//                           HGRenderer output — a `movq %rax, %rdx`
//                           @0x1040c2 preserves it across the null-check
//                           and re-emits it as the compositor's SetInput
//                           source at @0x104175 via `movq 0x1a0(%rbx),%rdi`
//                           then `xorl %esi,%esi ; callq *0x78(%rax)`.
//                           BUT: the `movq %rax,%rdx` at 0x1040c2 happens
//                           BEFORE the je jump at 0x1040c8, so `rdx` holds
//                           the input for BOTH branches. When matrix is
//                           non-null, `movq 0x198(%rbx),%rdx` @0x1040ed
//                           OVERWRITES rdx with the matrix pointer so the
//                           compositor's SetInput sees `matrix` instead of
//                           `input`. The compositor's SetInput at
//                           @0x104175 is a `xorl %esi,%esi` + `callq
//                           *0x78(%rax)` — but WAIT: the value in rdx at
//                           the call site is never re-loaded between the
//                           two branches, so the compositor.SetInput sees
//                           either `input` (matrix-null) or `matrix`
//                           (matrix-nonnull). This means the compositor
//                           always gets whatever the matrix stage passed
//                           through.
//   3) compositor.vtable[0x78](0, X)      // SetInput slot 0            @0x104175
//                          where X = matrix (if matrix nonnull) OR input.
//   4) INDEX BRANCH:
//        %eax = 0
//        cmpl $0x0, 0x1b0(%rbx)                                          @0x1040f6
//        sete %al                                                        @0x1040fd
//        shll $0x2, %eax                                                 @0x104100
//        i.e. eax = (this.logEncoding == 0) ? 4 : 0
//      Then read 6 float32 values from two RIP-relative float[2] arrays,
//      each indexed by eax as a byte offset:
//        base @0x3d0ee0..0x3d0f08 (six 8-byte slots, each = float[2]):
//          slot[0] = @0x3d0ee0 → GetOutput_arr_a[LE]  (log seg xmm0 — stack -0x20)
//          slot[1] = @0x3d0ee8 → GetOutput_arr_b[LE]  (log seg xmm1 — stack -0x1c)
//          slot[2] = @0x3d0ef0 → GetOutput_arr_c[LE]  (log seg xmm2 — stack -0x18)
//          slot[3] = @0x3d0ef8 → GetOutput_arr_d[LE]  (log seg xmm3 — stack -0x14)
//          slot[4] = @0x3d0f00 → GetOutput_arr_e[LE]  (lin seg xmm0 — stack -0x28)
//          slot[5] = @0x3d0f08 → GetOutput_arr_g[LE]  (lin seg xmm2 — stack -0x24)
//      Each slot is `float pair[2]`; `pair[LE==0]` is at byte-offset 4,
//      `pair[LE!=0]` is at byte-offset 0. Values (byte-exact reads from
//      /tmp/Helium.x86_64 at file-offset == VA):
//        (@0x3d0ee0)  {LE!=0: 5.0000004768f (0x40a00001), LE==0: 0.5000004172f (0x3f000007)}
//        (@0x3d0ee8)  {LE!=0: 0.0648289993f (0x3d8484c5) i.e. F-Log2 spec b,
//                      LE==0: 0.0094680003f (0x3c1b1fac) i.e. F-Log v1 spec b}
//        (@0x3d0ef0)  {LE!=0: 0.0738369375f (0x3d9737d2), LE==0: 0.1037578136f (0x3dd47efa)}
//        (@0x3d0ef8)  {LE!=0: 0.3843159974f (0x3ec4c511) i.e. F-Log2 spec d,
//                      LE==0: 0.7904530168f (0x3f4a5b21) i.e. F-Log v1 spec d}
//        (@0x3d0f00)  {LE!=0: 7.9195151329f (0x40fd6cab), LE==0: 7.8620676994f (0x40fb960f)}
//                          — spec-e * 0.9 for F-Log2 (8.799461*0.9=7.919515) and
//                             spec-e * 0.9 for F-Log v1 (8.735631*0.9=7.862068).
//        (@0x3d0f08)  {LE!=0: 0.0009877778f (0x3a817853), LE==0: 0.0009888889f (0x3a819d9b)}
//        (@0x3d102c)  0.0928639993f  (0x3dbe2f7b)  — matches F-Log spec f
//                          (linear-region offset) with the sign flipped to +.
//                          NOTE (verbatim disasm): this single constant is
//                          NOT indexed; the same value is used for BOTH
//                          LogEncoding paths. That means only the F-Log v1
//                          `f` is stored here; if the shader uses `f` for
//                          both formats, the two formats happen to share this
//                          coefficient (or the F-Log2 spec-f value is 0.092864
//                          coincident). We ship the disasm bytes and DO NOT
//                          re-derive the shader semantics (rule 3).
//   5) compositor.vtable[0x60](0, arr_a[LE], arr_b[LE], arr_c[LE], arr_d[LE])  @0x104198
//      (LOG segment)
//   6) compositor.vtable[0x60](1, arr_e[LE], 0.0928639993, arr_g[LE], 0.0f)    @0x1041bf
//      (LINEAR segment — xmm3 zeroed via `xorps %xmm3,%xmm3` @0x1041ad)
//   7) return this.compositor                                              @0x1041c2
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HgcLogVideo_encode::HgcLogVideo_encode()  __ZN18HgcLogVideo_encodeC1Ev — invoked @0x103efe
//   HGColorMatrix::HGColorMatrix()            __ZN13HGColorMatrixC1Ev      — invoked @0x103f31
//   HGColorMatrix::LoadMatrix(...)            __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — invoked @0x1040e8
//   HGObject::operator new(unsigned long)     __ZN8HGObjectnwEm            — invoked @0x103ef3 / @0x103f26
//   HGObject::operator delete(void*)          __ZN8HGObjectdlEPv           — invoked @0x104088 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)        __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x1040bd
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
 * transcribed — see raw-port/src/render/HGRenderer.ts for the base class
 * (this is the same GetInput surface HGACEScct::Encode uses).
 * The only method invoked here is `GetInput(HGNode*, int) -> HGNode*`
 * at @Helium 0x1040bd.
 */
export interface HGRendererStub {
  /** @Helium 0x1040bd — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the color-matrix node owned at `this.matrix`
 * (`+0x198`), only used when `colorimetry == 0`. Undecoded — exposes
 * only the vtable slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x1040d2 with (0, input).
 *   - `LoadMatrix(mat, transpose)`         — invoked @0x1040e8 with
 *          (this.gammaTable, true). Mangled
 *          __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb (float vector[4] const*, bool).
 *   - `Release()` via slot *0x18 — invoked from D0/D1/D2 dtors
 *          (@0x103fc2, 0x104012, 0x104062).
 */
export interface HGColorMatrix {
  /** vtable *0x78 @Helium — @0x1040d2. Argument order (esi=idx, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * Non-vtable direct call to `HGColorMatrix::LoadMatrix(...)`.
   * @Helium 0x1040e8 with edx=1 (transpose).
   */
  LoadMatrix(matrix: readonly number[], transpose: boolean): void;
  /** vtable *0x18 @Helium — invoked from D0/D1/D2. */
  Release(): void;
}

/**
 * Placeholder for the segmented log-video encoder owned at
 * `this.compositor` (`+0x1a0`). Undecoded — exposes only the vtable
 * slots we call.
 *
 *   - `SetInput(idx, input)` via slot *0x78 — invoked @0x104175 with (0, X)
 *          where X is either `this.matrix` (if colorimetry==0) or the
 *          raw renderer-input (if colorimetry!=0).
 *   - `SetParameter(idx, xmm0, xmm1, xmm2, xmm3)` via slot *0x60
 *          — invoked @0x104198 with (0, a[LE], b[LE], c[LE], d[LE])  // LOG segment
 *          — invoked @0x1041bf with (1, e[LE], f, g[LE], 0.0)        // LINEAR segment
 *   - `Release()` via slot *0x18 — invoked from D0/D1/D2 dtors
 *          (@0x103fd4, 0x104024, 0x104074).
 */
export interface HgcLogVideo_encode {
  /** vtable *0x78 @Helium — @0x104175. */
  SetInput(idx: number, input: HGNode): void;
  /** vtable *0x60 @Helium — argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x18 @Helium — invoked from dtors. */
  Release(): void;
}

/**
 * Placeholder for the compositor allocation + ctor sequence @Helium
 * 0x103eee..0x103efe:
 *   0x103eee  movl  $0x1a0, %edi                    ; alloc size = 0x1A0 = 416
 *   0x103ef3  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x103efe  callq __ZN18HgcLogVideo_encodeC1Ev    ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGFujifilmFLog::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x103ef3/0x103efe not yet transcribed"
  );
}

/**
 * Placeholder for the color-matrix allocation + ctor sequence @Helium
 * 0x103f21..0x103f31 (only invoked when colorimetry == 0):
 *   0x103f21  movl  $0x1f0, %edi                    ; alloc size = 0x1F0 = 496
 *   0x103f26  callq __ZN8HGObjectnwEm               ; HGObject::operator new
 *   0x103f31  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
 * Throws until the class is transcribed (rule 3).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGFujifilmFLog::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x103f26/0x103f31 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static data reference: HGColorGamma::rec709RGBToRec2020RGB @Helium 0x3cfc30.
//
// This is a data symbol in Helium's __DATA_CONST section. The ctor loads its
// address (`leaq __ZN12HGColorGamma21rec709RGBToRec2020RGBE(%rip),%rax`
// @0x103f3d) and stores it into `this.gammaTable (+0x1a8)`. GetOutput
// then hands that pointer to HGColorMatrix::LoadMatrix (transposed) —
// the matrix is a 4-float-wide vector array (`float vector[4] const*`)
// per the LoadMatrix demangled signature; the exact byte contents live
// in the FCP binary and are not decoded here (the port MUST NOT invent
// them — HGColorGamma's static-data class is scheduled separately in
// the ledger and will supply the bytes when transcribed). We carry the
// symbolic reference only.
// ---------------------------------------------------------------------------

/**
 * `HGColorGamma::rec709RGBToRec2020RGB` @Helium 0x3cfc30.
 * Pointer-only reference — the underlying `float vector[4] const*`
 * table is not yet transcribed. When the ctor's colorimetry-branch
 * fires (colorimetry == 0), the ctor stores THIS symbol's address
 * into `this.gammaTable`, and GetOutput later hands it to
 * `matrix.LoadMatrix(gammaTable, true)`. Accessing the property
 * throws @Helium 0x3cfc30 until HGColorGamma's static-data class is transcribed.
 *
 * @Helium 0x103f3d (`leaq HGColorGamma::rec709RGBToRec2020RGB(%rip),%rax`)
 * @Helium 0x103f44 (`movq %rax, 0x1a8(%rbx)`)
 */
export const HGColorGamma_rec709RGBToRec2020RGB: readonly number[] = new Proxy([] as number[], {
  get(_target, prop): never {
    throw new Error(
      "HGColorGamma::rec709RGBToRec2020RGB @Helium 0x3cfc30 (referenced by " +
      "HGFujifilmFLog::Encode ctor @Helium 0x103f3d) not yet transcribed — " +
      `field access '${String(prop)}' would leak invented data`
    );
  },
});

// ---------------------------------------------------------------------------
// RIP-relative float32 constants used by GetOutput @0x1040a0.
//
// Six two-element float arrays live at contiguous 8-byte slots
// starting at @Helium 0x3d0ee0, plus one standalone float at
// @Helium 0x3d102c. Each two-element array is indexed by the
// `LogEncoding == 0 ? 4 : 0` byte offset:
//     pair[0] (offset 0) — used when logEncoding != 0  (F-Log2)
//     pair[1] (offset 4) — used when logEncoding == 0  (F-Log v1)
//
// Every value below is a byte-exact read from /tmp/Helium.x86_64
// (VA == file offset in the thin slice) at the addresses cited. See
// the block comment above for the semantic role each pair plays.
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3d0ee0 — leaq @0x104103 (next-PC 0x10410a + 0x2ccdd6 = 0x3d0ee0).
 * Consumed as xmm0 argument of the LOG-segment SetParameter call
 * (@0x104184 movss -0x20(%rbp), %xmm0). Byte contents:
 *   +0: 0x40a00001 = 5.0000004768f  (used when logEncoding != 0)
 *   +4: 0x3f000007 = 0.5000004172f  (used when logEncoding == 0)
 */
const HGFujifilmFLog_Encode_getOutput_arr_a: readonly [number, number] = [
  Math.fround(5.0000004768371582),   // f32 bit-pattern 0x40a00001 @0x3d0ee0+0
  Math.fround(0.5000004172325134),   // f32 bit-pattern 0x3f000007 @0x3d0ee0+4
];

/**
 * @Helium 0x3d0ee8 — leaq @0x104114 (next-PC 0x10411b + 0x2ccdcd = 0x3d0ee8).
 * Consumed as xmm1 argument of the LOG-segment SetParameter call
 * (@0x104189 movss -0x1c(%rbp), %xmm1). Byte contents:
 *   +0: 0x3d84c511 = 0.0648289993f  (F-Log2 spec-b; used when logEncoding != 0)
 *   +4: 0x3c1b1fac = 0.0094680003f  (F-Log v1 spec-b; used when logEncoding == 0)
 * Matches the F-Log v1 `b` = 0.009468 from
 * HGFujifilmFLogLinearizationLUTInfo (the inverse-direction LUT).
 */
const HGFujifilmFLog_Encode_getOutput_arr_b: readonly [number, number] = [
  Math.fround(0.06482899934053421),  // f32 bit-pattern 0x3d84c511 @0x3d0ee8+0
  Math.fround(0.009468000382184982), // f32 bit-pattern 0x3c1b1fac @0x3d0ee8+4
];

/**
 * @Helium 0x3d0ef0 — leaq @0x104125 (next-PC 0x10412c + 0x2ccdc4 = 0x3d0ef0).
 * Consumed as xmm2 argument of the LOG-segment SetParameter call
 * (@0x10418e movss -0x18(%rbp), %xmm2). Byte contents:
 *   +0: 0x3d9737d2 = 0.0738369375f  (used when logEncoding != 0)
 *   +4: 0x3dd47efa = 0.1037578136f  (used when logEncoding == 0)
 */
const HGFujifilmFLog_Encode_getOutput_arr_c: readonly [number, number] = [
  Math.fround(0.0738369375467300),   // f32 bit-pattern 0x3d9737d2 @0x3d0ef0+0
  Math.fround(0.1037578135728836),   // f32 bit-pattern 0x3dd47efa @0x3d0ef0+4
];

/**
 * @Helium 0x3d0ef8 — leaq @0x104136 (next-PC 0x10413d + 0x2ccdbb = 0x3d0ef8).
 * Consumed as xmm3 argument of the LOG-segment SetParameter call
 * (@0x104193 movss -0x14(%rbp), %xmm3). Byte contents:
 *   +0: 0x3ec4c511 = 0.3843159974f  (F-Log2 spec-d; used when logEncoding != 0)
 *   +4: 0x3f4a5b21 = 0.7904530168f  (F-Log v1 spec-d; used when logEncoding == 0)
 * Matches the F-Log v1 `d` = 0.790453 from
 * HGFujifilmFLogLinearizationLUTInfo (with sign flipped for forward
 * direction).
 */
const HGFujifilmFLog_Encode_getOutput_arr_d: readonly [number, number] = [
  Math.fround(0.3843159973621368),   // f32 bit-pattern 0x3ec4c511 @0x3d0ef8+0
  Math.fround(0.7904530167579651),   // f32 bit-pattern 0x3f4a5b21 @0x3d0ef8+4
];

/**
 * @Helium 0x3d0f00 — leaq @0x104147 (next-PC 0x10414e + 0x2ccdb2 = 0x3d0f00).
 * Consumed as xmm0 argument of the LINEAR-segment SetParameter call
 * (@0x1041b5 movss -0x28(%rbp), %xmm0). Byte contents:
 *   +0: 0x40fd6cab = 7.9195151329f  (F-Log2 spec-e × 0.9 = 8.799461·0.9;
 *                                    used when logEncoding != 0)
 *   +4: 0x40fb960f = 7.8620676994f  (F-Log v1 spec-e × 0.9 = 8.735631·0.9;
 *                                    used when logEncoding == 0)
 * The `× 0.9` is the same forward-direction final-scale factor the
 * inverse-direction LUT divides by (see HGFujifilmFLogLinearizationLUTInfo
 * for the `/0.9` in the linear-branch tail).
 */
const HGFujifilmFLog_Encode_getOutput_arr_e: readonly [number, number] = [
  Math.fround(7.9195151329040527),   // f32 bit-pattern 0x40fd6cab @0x3d0f00+0
  Math.fround(7.8620676994323730),   // f32 bit-pattern 0x40fb960f @0x3d0f00+4
];

/**
 * @Helium 0x3d0f08 — leaq @0x104158 (next-PC 0x10415f + 0x2ccda9 = 0x3d0f08).
 * Consumed as xmm2 argument of the LINEAR-segment SetParameter call
 * (@0x1041ba movss -0x24(%rbp), %xmm2). Byte contents:
 *   +0: 0x3a817853 = 0.0009877778f  (used when logEncoding != 0)
 *   +4: 0x3a819d9b = 0.0009888889f  (used when logEncoding == 0)
 */
const HGFujifilmFLog_Encode_getOutput_arr_g: readonly [number, number] = [
  Math.fround(0.0009877778357826173), // f32 bit-pattern 0x3a817853 @0x3d0f08+0
  Math.fround(0.0009888889035210013), // f32 bit-pattern 0x3a819d9b @0x3d0f08+4
];

/**
 * @Helium 0x3d102c — movss @0x1041a5 (next-PC 0x1041ad + 0x2cce7f = 0x3d102c).
 * Consumed unindexed (same value for both LogEncoding paths) as xmm1
 * argument of the LINEAR-segment SetParameter call. Byte contents:
 *   0x3dbe2f7b = 0.0928639993f
 * Matches the F-Log v1 `f` (linear-region offset) = 0.092864 from
 * HGFujifilmFLogLinearizationLUTInfo (sign flipped for the forward
 * direction). See the CTOR comment block for why the F-Log2 path
 * shares this single float.
 */
const HGFujifilmFLog_Encode_getOutput_lin_f: number = Math.fround(0.0928639993071556);

// ---------------------------------------------------------------------------
// Enum placeholders.
// ---------------------------------------------------------------------------

/**
 * `HGFujifilmFLog::SceneColorimetry` — u32 enum. The underlying enum's
 * value-to-meaning mapping isn't decoded, but ctor branches on
 * `esi != 0` (`testl %r14d,%r14d ; jne 0x103f4b` @0x103f1c). We keep
 * the raw u32 value; the disasm doesn't validate it either.
 */
export type HGFujifilmFLog_SceneColorimetry = number;

/**
 * `HGFujifilmFLog::LogEncoding` — u32 enum. Stored raw at
 * `this.logEncoding (+0x1b0)` and consumed by GetOutput's
 * `sete %al ; shll $0x2, %eax` index-branch (@0x1040f6..0x104100).
 * 0 → F-Log v1 (index 4 into the float pairs); anything else →
 * F-Log2 (index 0). We keep the raw u32; the disasm doesn't
 * validate it either.
 */
export type HGFujifilmFLog_LogEncoding = number;

// ---------------------------------------------------------------------------
// The class.
// ---------------------------------------------------------------------------

/**
 * `HGFujifilmFLog::Encode` — Helium HGNode subclass. Wraps an
 * `HgcLogVideo_encode` compositor configured for Fujifilm F-Log (v1 or
 * v2) forward encoding, optionally preceded by an HGColorMatrix stage
 * driven by the `HGColorGamma::rec709RGBToRec2020RGB` matrix (only
 * when `colorimetry == 0`).
 *
 * @Helium ctors     @0x103ec0 (C2) / @0x103f90 (C1);
 *         dtors     @0x103fa0 (D2) / @0x103ff0 (D1) / @0x104040 (D0);
 *         GetOutput @0x1040a0.
 */
export class HGFujifilmFLogEncode extends HGNode {
  /**
   * Optional `HGColorMatrix` stage. Field @0x198.
   * Assigned `null` by ctor @0x103ee3 (`movq $0x0, 0x198(%rbx)`), then
   * replaced by a fresh `HGColorMatrix` only if `colorimetry == 0`
   * (@0x103f21..0x103f36). GetOutput uses this to gate the matrix stage:
   * `testq %r14, %r14 ; je 0x1040f4` @0x1040c5.
   */
  matrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode` compositor. Field @0x1a0.
   * Assigned unconditionally by ctor @0x103f03 (`movq %r12, 0x1a0(%rbx)`).
   */
  compositor: HgcLogVideo_encode | null;

  /**
   * Optional pointer to the source-gamut → target-gamut matrix table.
   * Field @0x1a8.
   * Assigned `null` by ctor @0x103f0a (`movq $0x0, 0x1a8(%rbx)`), then
   * replaced by `&HGColorGamma::rec709RGBToRec2020RGB` only if
   * `colorimetry == 0` (@0x103f3d..0x103f44). GetOutput's LoadMatrix
   * call at @0x1040e8 reads this pointer via
   * `movq 0x1a8(%rbx),%rsi`. When matrix is null this field is
   * likewise null and is never touched.
   */
  gammaTable: readonly number[] | null;

  /**
   * Raw `LogEncoding` enum value. Field @0x1b0 (u32).
   * Assigned by ctor @0x103f15 (`movl %r15d, 0x1b0(%rbx)`) with the
   * caller-provided enum value. GetOutput reads this via
   * `cmpl $0x0, 0x1b0(%rbx)` @0x1040f6 to select which slot of each
   * float pair to load (`sete %al ; shll $0x2, %eax` @0x1040fd/0x104100
   * — eax becomes 4 when logEncoding==0, else 0).
   */
  logEncoding: HGFujifilmFLog_LogEncoding;

  /**
   * `HGFujifilmFLog::Encode::Encode(SceneColorimetry, LogEncoding)`
   * — Helium @0x103ec0 (C2 base-object ctor). C1 @0x103f90 is a
   * trivial `push rbp / mov / pop / jmp C2` thunk, so only C2's body
   * needs modelling.
   *
   * Verbatim asm (@0x103ec0..0x103f53, prologue/epilogue elided):
   *   0x103ecb  movl  %edx, %r15d                     ; r15d = logEncoding
   *   0x103ece  movl  %esi, %r14d                     ; r14d = colorimetry
   *   0x103ed1  movq  %rdi, %rbx                      ; rbx  = this
   *   0x103ed4  callq __ZN6HGNodeC2Ev                 ; base ctor
   *   0x103ed9  leaq  0x9158a0(%rip), %rax            ; = 0xa19780 (own vtable installed ptr)
   *   0x103ee0  movq  %rax, (%rbx)                    ; *this = vtable
   *   0x103ee3  movq  $0x0, 0x198(%rbx)               ; this.matrix = null
   *   0x103eee  movl  $0x1a0, %edi                    ; alloc 0x1A0 for HgcLogVideo_encode
   *   0x103ef3  callq __ZN8HGObjectnwEm               ; HGObject::operator new
   *   0x103ef8  movq  %rax, %r12                      ; r12 = raw compositor ptr
   *   0x103efb  movq  %rax, %rdi
   *   0x103efe  callq __ZN18HgcLogVideo_encodeC1Ev    ; placement ctor
   *   0x103f03  movq  %r12, 0x1a0(%rbx)               ; this.compositor = new HgcLogVideo_encode
   *   0x103f0a  movq  $0x0, 0x1a8(%rbx)               ; this.gammaTable = null
   *   0x103f15  movl  %r15d, 0x1b0(%rbx)              ; this.logEncoding = logEncoding
   *   0x103f1c  testl %r14d, %r14d                    ; if colorimetry == 0 ...
   *   0x103f1f  jne   0x103f4b                        ; ... else skip matrix stage
   *   0x103f21  movl  $0x1f0, %edi                    ; alloc 0x1F0 for HGColorMatrix
   *   0x103f26  callq __ZN8HGObjectnwEm
   *   0x103f2b  movq  %rax, %r15                      ; r15 = raw matrix ptr
   *   0x103f2e  movq  %rax, %rdi
   *   0x103f31  callq __ZN13HGColorMatrixC1Ev         ; placement ctor
   *   0x103f36  movq  %r15, 0x198(%rbx)               ; this.matrix = new HGColorMatrix
   *   0x103f3d  leaq  __ZN12HGColorGamma21rec709RGBToRec2020RGBE(%rip), %rax
   *                                                    ; rax = &rec709RGBToRec2020RGB
   *   0x103f44  movq  %rax, 0x1a8(%rbx)               ; this.gammaTable = &table
   *   0x103f4b..0x103f53  epilogue, retq.
   *
   * The exception-cleanup path @0x103f54..0x103f8a handles a throwing
   * inner allocation/ctor via `HGObject::operator delete` on the
   * partially-constructed pointer (r12 = compositor, or r15 = matrix
   * depending on which branch faults), followed by `HGNode::~HGNode()`
   * and `__Unwind_Resume`. It never executes on a successful
   * construction and is not modelled explicitly (TS exceptions unwind
   * through the stack naturally).
   *
   * @param colorimetry  HGFujifilmFLog::SceneColorimetry (u32; NOT
   *                     bounds-checked; only `!= 0` is tested — the
   *                     zero value adds a Rec.709→Rec.2020 matrix
   *                     pre-stage, any other value skips it).
   * @param logEncoding  HGFujifilmFLog::LogEncoding (u32; 0 → F-Log v1,
   *                     any other value → F-Log2. Stored raw and used
   *                     as a zero-vs-nonzero flag at GetOutput time).
   */
  constructor(colorimetry: HGFujifilmFLog_SceneColorimetry, logEncoding: HGFujifilmFLog_LogEncoding) {
    // @Helium 0x103ed4: HGNode base ctor.
    super();
    // @Helium 0x103ee0: install this class's vtable (installed ptr = 0xa19780).
    this.vtable = 0xa19780;
    // @Helium 0x103ee3: this.matrix = null (default; overridden below if colorimetry==0).
    this.matrix = null;
    // @Helium 0x103eee..0x103f03: alloc + ctor HgcLogVideo_encode, store @0x1a0.
    // Throws until HgcLogVideo_encode is transcribed.
    this.compositor = newHgcLogVideo_encode();
    // @Helium 0x103f0a: this.gammaTable = null (default; overridden below if colorimetry==0).
    this.gammaTable = null;
    // @Helium 0x103f15: this.logEncoding = logEncoding
    this.logEncoding = logEncoding;
    // @Helium 0x103f1c..0x103f44: colorimetry-branch — only zero enables the matrix stage.
    if (colorimetry === 0) {
      // @Helium 0x103f21..0x103f36: alloc + ctor HGColorMatrix, store @0x198.
      // Throws until HGColorMatrix is transcribed.
      this.matrix = newHGColorMatrix();
      // @Helium 0x103f3d..0x103f44: this.gammaTable = &HGColorGamma::rec709RGBToRec2020RGB
      this.gammaTable = HGColorGamma_rec709RGBToRec2020RGB;
    }
  }

  /**
   * `HGFujifilmFLog::Encode::~Encode()` — Helium @0x103fa0 (D2) /
   * @0x103ff0 (D1) / @0x104040 (D0, deleting).
   *
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. D0's body
   * (@0x104040..0x104088):
   *   leaq  0x915730(%rip), %rax         ; = 0xa19780 (reinstall own vtable)
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
   * D2 @0x103fa0 and D1 @0x103ff0 have byte-identical bodies except:
   *   - the vtable-reinstall leaq displacement is different (RIP differs;
   *     D2 @0x103fa9 disp 0x9157d0, D1 @0x103ff9 disp 0x915780 — both
   *     resolve to 0xa19780).
   *   - the HGNode dtor is called via `jmp` (tail-call) instead of `call`.
   *   - no operator-delete after the HGNode dtor.
   *
   * We model D0's operator-delete step at the JS caller (dropping the
   * reference) — TS has no explicit `delete this`.
   */
  destruct(): void {
    // @Helium 0x103fb0 (D2) / 0x104000 (D1) / 0x104050 (D0):
    // vtable reinstall — modeled by assignment.
    this.vtable = 0xa19780;
    // @Helium 0x103fb3..0x103fc2 (D2): release matrix if present.
    if (this.matrix != null) {
      this.matrix.Release();
      this.matrix = null;
    }
    // @Helium 0x103fc5..0x103fd4 (D2): release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x103fe0 (D2) / 0x104030 (D1): jmp HGNode::~HGNode(). D0 uses
    // callq @0x10407a and then tail-jmps to HGObject::operator delete
    // @0x104088 (handled by the caller dropping the reference in TS).
    super.destruct();
  }

  /**
   * `HGFujifilmFLog::Encode::GetOutput(HGRenderer* renderer)` — Helium
   * @0x1040a0.
   *
   * Wires the (optional) matrix stage and the compositor into the
   * render graph:
   *   1) fetch this node's input at slot 0
   *   2) IF matrix != null:
   *        matrix.SetInput(0, input)                (slot *0x78)
   *        matrix.LoadMatrix(this.gammaTable, true) (direct call)
   *        stageOutput = matrix
   *      ELSE:
   *        stageOutput = input
   *   3) INDEX = (this.logEncoding == 0) ? 4 : 0
   *   4) read 6 float32 values from the RIP-relative float[2] arrays
   *      at INDEX, plus the un-indexed constant at 0x3d102c
   *   5) compositor.SetInput(0, stageOutput)        (slot *0x78)
   *   6) compositor.SetParameter(0, arr_a[LE], arr_b[LE], arr_c[LE], arr_d[LE])  (LOG)
   *   7) compositor.SetParameter(1, arr_e[LE], 0.0928639993, arr_g[LE], 0.0f)    (LINEAR)
   *   8) return the compositor.
   *
   * Verbatim asm (@0x1040a0..0x1041d1, prologue/epilogue elided):
   *   0x1040ae  movq  0x198(%rdi), %r14             ; r14 = this.matrix
   *   0x1040b5  movq  %rsi, %rdi                    ; rdi = renderer
   *   0x1040b8  movq  %rbx, %rsi                    ; rsi = this
   *   0x1040bb  xorl  %edx, %edx
   *   0x1040bd  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x1040c2  movq  %rax, %rdx                    ; rdx = input (survives to compositor.SetInput)
   *   0x1040c5  testq %r14, %r14
   *   0x1040c8  je    0x1040f4                      ; if matrix == null, skip matrix stage
   *   ; ---- matrix-nonnull branch ----
   *   0x1040ca  movq  (%r14), %rax                  ; rax = matrix.vtable
   *   0x1040cd  movq  %r14, %rdi                    ; rdi = matrix
   *   0x1040d0  xorl  %esi, %esi
   *   0x1040d2  callq *0x78(%rax)                   ; matrix.SetInput(0, input)
   *   0x1040d5  movq  0x198(%rbx), %rdi             ; rdi = this.matrix
   *   0x1040dc  movq  0x1a8(%rbx), %rsi             ; rsi = this.gammaTable
   *   0x1040e3  movl  $0x1, %edx                    ; edx = 1 (transpose)
   *   0x1040e8  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb
   *                                                  ; matrix.LoadMatrix(gammaTable, true)
   *   0x1040ed  movq  0x198(%rbx), %rdx             ; rdx = this.matrix (overwrites input)
   *   ; ---- rejoin (LE-index computation) ----
   *   0x1040f4  xorl  %eax, %eax                    ; eax = 0
   *   0x1040f6  cmpl  $0x0, 0x1b0(%rbx)
   *   0x1040fd  sete  %al
   *   0x104100  shll  $0x2, %eax                    ; eax = (logEncoding==0) ? 4 : 0
   *   0x104103..0x104164  load 6 floats into stack -0x20..-0x14, -0x28, -0x24
   *                       (see the block-comment above and the per-const
   *                        annotations on the arr_* declarations).
   *   0x104169  movq  0x1a0(%rbx), %rdi             ; rdi = this.compositor
   *   0x104170  movq  (%rdi), %rax                  ; rax = compositor.vtable
   *   0x104173  xorl  %esi, %esi
   *   0x104175  callq *0x78(%rax)                   ; compositor.SetInput(0, stageOutput)
   *                                                    ; stageOutput = matrix (if nonnull)
   *                                                    ;            or input  (if null)
   *                                                    ; both pass via rdx as set above.
   *   0x104178  movq  0x1a0(%rbx), %rdi             ; rdi = this.compositor
   *   0x10417f  movq  (%rdi), %rax                  ; rax = compositor.vtable
   *   0x104182  xorl  %esi, %esi
   *   0x104184  movss -0x20(%rbp), %xmm0            ; xmm0 = arr_a[LE]
   *   0x104189  movss -0x1c(%rbp), %xmm1            ; xmm1 = arr_b[LE]
   *   0x10418e  movss -0x18(%rbp), %xmm2            ; xmm2 = arr_c[LE]
   *   0x104193  movss -0x14(%rbp), %xmm3            ; xmm3 = arr_d[LE]
   *   0x104198  callq *0x60(%rax)                   ; compositor.SetParameter(0, ...)
   *   0x10419b  movq  0x1a0(%rbx), %rdi             ; rdi = this.compositor
   *   0x1041a2  movq  (%rdi), %rax                  ; rax = compositor.vtable
   *   0x1041a5  movss 0x2cce7f(%rip), %xmm1         ; xmm1 = 0.0928639993f  @0x3d102c
   *   0x1041ad  xorps %xmm3, %xmm3                  ; xmm3 = 0.0f
   *   0x1041b0  movl  $0x1, %esi
   *   0x1041b5  movss -0x28(%rbp), %xmm0            ; xmm0 = arr_e[LE]
   *   0x1041ba  movss -0x24(%rbp), %xmm2            ; xmm2 = arr_g[LE]
   *   0x1041bf  callq *0x60(%rax)                   ; compositor.SetParameter(1, ...)
   *   0x1041c2  movq  0x1a0(%rbx), %rax             ; rax = this.compositor
   *   0x1041c9..0x1041d1  epilogue, retq.
   *
   * @param renderer  the containing HGRenderer (undecoded — only
   *                  `GetInput` is invoked here).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of this filter in the graph).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x1040ae: r14 = this.matrix (may be null when colorimetry != 0).
    const matrix = this.matrix;
    const comp = this.compositor;
    if (comp == null) {
      // C++ path where this is unreachable — but TS type-narrowing
      // wants the null guard, and a loud fault is preferable to `!`
      // (rule 3).
      throw new Error(
        "HGFujifilmFLog::Encode::GetOutput @Helium 0x1040ae — compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x1040bd: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x1040c2..0x1040ed: matrix-branch selector for the compositor's SetInput source.
    // In the asm this is expressed via rdx: initially rdx=input, and (in the matrix-nonnull
    // branch) rdx is reloaded from `this.matrix` at @0x1040ed. In TS we materialize the
    // final value explicitly as `stageOutput`.
    let stageOutput: HGNode;
    if (matrix != null) {
      // @Helium 0x1040d2: matrix.SetInput(0, input) via vtable *0x78
      matrix.SetInput(0, input);
      // @Helium 0x1040e8: matrix.LoadMatrix(this.gammaTable, /*transpose=*/true).
      // gammaTable is guaranteed non-null here by the ctor's paired write
      // (matrix != null ⇔ gammaTable != null via the colorimetry==0 branch).
      if (this.gammaTable == null) {
        throw new Error(
          "HGFujifilmFLog::Encode::GetOutput @Helium 0x1040e8 — gammaTable null while matrix non-null (violates ctor invariant)"
        );
      }
      matrix.LoadMatrix(this.gammaTable, true);
      // @Helium 0x1040ed: rdx = this.matrix (overwrites input for the compositor.SetInput call).
      stageOutput = matrix as unknown as HGNode;
    } else {
      // @Helium 0x1040c2 (rdx never overwritten): compositor.SetInput sees the raw input.
      stageOutput = input;
    }
    // @Helium 0x1040f4..0x104100: LE-index — 4 when logEncoding==0, else 0.
    // In the asm this is a byte offset into two-element float arrays; in TS
    // we treat it as a JS array index (0 or 1) — the .LE!=0 slot maps to
    // index 0 (byte offset 0) and .LE==0 maps to index 1 (byte offset 4).
    const leIdx: 0 | 1 = this.logEncoding === 0 ? 1 : 0;
    // @Helium 0x104103..0x104164: load the 6 indexed floats.
    const arr_a = HGFujifilmFLog_Encode_getOutput_arr_a[leIdx];
    const arr_b = HGFujifilmFLog_Encode_getOutput_arr_b[leIdx];
    const arr_c = HGFujifilmFLog_Encode_getOutput_arr_c[leIdx];
    const arr_d = HGFujifilmFLog_Encode_getOutput_arr_d[leIdx];
    const arr_e = HGFujifilmFLog_Encode_getOutput_arr_e[leIdx];
    const arr_g = HGFujifilmFLog_Encode_getOutput_arr_g[leIdx];
    // @Helium 0x104175: compositor.SetInput(0, stageOutput) via vtable *0x78.
    comp.SetInput(0, stageOutput);
    // @Helium 0x104198: compositor.SetParameter(0, arr_a, arr_b, arr_c, arr_d) — LOG segment.
    comp.SetParameter(0, arr_a, arr_b, arr_c, arr_d);
    // @Helium 0x1041bf: compositor.SetParameter(1, arr_e, 0.0928639993, arr_g, 0.0f) — LINEAR segment.
    comp.SetParameter(
      1,
      arr_e,
      HGFujifilmFLog_Encode_getOutput_lin_f,
      arr_g,
      Math.fround(0.0),
    );
    // @Helium 0x1041c2: return this.compositor.
    return comp as unknown as HGNode;
  }
}
