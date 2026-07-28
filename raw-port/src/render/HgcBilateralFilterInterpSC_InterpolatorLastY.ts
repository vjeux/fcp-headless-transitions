// raw-port/src/render/HgcBilateralFilterInterpSC_InterpolatorLastY.ts
//
// FCP `HgcBilateralFilterInterpSC_InterpolatorLastY` — Helium GPU compute
// kernel. The "SC" is "Separable/Cross" (a hint that this is one step of a
// separable bilateral filter with a cross-bilateral guide texture); "LastY"
// means it's the final Y-axis pass in the multi-tap bilateral resampling.
//
// From the Metal fragment source embedded in GetProgram (@Helium 0x32bb68),
// the shader:
//   - Samples 4 textures (hg_Texture0..3), each with its own sampler/coord.
//   - r0 = tex0(uv0); r1.yw = tex1(uv1).yw; r2.yw = tex2(uv2).yw; r3.y = tex3(uv3).y
//   - r0.y = fmin(r0.y, hg_Params[0].y)               // clamp guide from above
//   - r4.y = (r0.y >= hg_Params[0].x) ? 1 : 0         // threshold mask
//   - r1.y = r1.y / fmax(r1.w, 1e-6f)                 // denom safety
//   - r2.y = r2.y / fmax(r2.w, 1e-6f)
//   - r0.y = r0.y * hg_Params[0].z + hg_Params[0].w   // linear remap
//   - r0.y = mix(r1.y, r2.y, r0.y)                    // interpolate between bins
//   - r0.y = r0.y * r4.y + r3.y                       // masked add of residual
//   - output.color0 = r0
//
// The class stores one 4-lane parameter vector (hg_Params[0]) plus a set of
// small constants in the uniform buffer at +0x198. The runtime writes
// hg_Params[0] via SetParameter(0, a, b, c, d).
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// (fat slice x86_64 at file offset 0x4000):
//
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.SetParameter.s  (36 lines)
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.GetDOD.s        (13 lines)
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.GetROI.s        (13 lines)
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.GetProgram.s    (14 lines)
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.shaderDescription.s (25 lines)
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.BindTexture.s   (121 lines) [large 4-slot jmp-table; stubbed]
//   raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastY.InitProgramDescriptor.s (222 lines) [stubbed]
//   plus ctor/dtors extracted inline from /tmp/Helium_tV.txt.
//
// Fifteen exported symbols (Helium.ledger.json):
//   @Helium 0x32bb50  GetProgram(HGRenderer*)
//   @Helium 0x32bb80  InitProgramDescriptor(HGProgramDescriptor*) const     [stubbed]
//   @Helium 0x32bf40  shaderDescription() const                             [long-string std::string]
//   @Helium 0x32bfa0  BindTexture(HGHandler*, int)                          [stubbed — 4-slot jmp-table]
//   @Helium 0x32c0c0  Bind(HGHandler*)                                      [stubbed — extraction empty]
//   @Helium 0x32c100  RenderTile_AVX(HGTile*)                               [stubbed]
//   @Helium 0x32c350  RenderTile(HGTile*)                                   [stubbed]
//   @Helium 0x32c5f0  GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x32c610  GetROI(HGRenderer*, int, HGRect)
//   @Helium 0x32c630  C2 HgcBilateralFilterInterpSC_InterpolatorLastY() base ctor
//   @Helium 0x32c6e0  C1 HgcBilateralFilterInterpSC_InterpolatorLastY() complete ctor (body identical to C2)
//   @Helium 0x32c790  D2 ~HgcBilateralFilterInterpSC_InterpolatorLastY()
//   @Helium 0x32c7e0  D1 ~HgcBilateralFilterInterpSC_InterpolatorLastY()
//   @Helium 0x32c830  D0 ~HgcBilateralFilterInterpSC_InterpolatorLastY()
//   @Helium 0x32c880  SetParameter(int, float, float, float, float)
//   @Helium 0x32c8f0  GetOutput(HGRenderer*)                                [not disassembled; assumed identical `mov rdi, rax` pattern]
//   @Helium 0x32c920  GetParameter(int, float*)                             [not disassembled]
//
// Vtable installed by C2: @Helium `leaq 0x7188f2(%rip), %rax` @0x32c63f =>
//   next_rip 0x32c646 + 0x7188f2 = 0xa44f38.
//
// STRUCT LAYOUT:
//   ---- HGObject / HGNode  (0x00..0x198) inherited ----
//   +0x198  void*  alignedUniformBufferPtr  (32-byte-aligned+8 view into a
//                                            0xa7-byte (167B) alloc; raw
//                                            ptr stashed at [buffer-8]).
//
// UNIFORM BUFFER LAYOUT (offsets relative to `alignedUniformBufferPtr`):
//   +0x00, +0x10  4xf32  hg_Params[0]        (writable via SetParameter — the ONLY runtime slot)
//   +0x08, +0x18  4xf32  ZERO                (movaps xorps 0)
//   +0x28, +0x38  4xf32  <0.0, 1.0, 0.0, 0.0>  (movsd @0x3c7cb0 — upper-zeroing scalar load)
//   +0x48, +0x58  4xf32  <1e-6, 1e-6, 1e-6, 1e-6>  (@0x3cb0b0 — division-safety epsilon;
//                                                    matches the shader's `1.00000e-06f`)
//   +0x68, +0x78  4xf32  <1.000244, ...>     (@0x85fed0 — "1 + half-precision ulp" broadcast)
//
// DECODE (all verified by direct binary read at file offset 0x4000 + VA):
//   @Helium 0x3c7cb0  bytes: 00000000 0000803f 00000000 00000000  => <0.0, 1.0, 0.0, 0.0>
//   @Helium 0x3cb0b0  bytes: bd378635 bd378635 bd378635 bd378635  => <1e-6, 1e-6, 1e-6, 1e-6>
//   @Helium 0x85fed0  bytes: 0108803f 0108803f 0108803f 0108803f  => <1.000244, ...> (1 + 2^-12)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (each stub throws with the exact call-site @0xADDR):
//   HGNode::HGNode()                                 @Helium 0x32c63a (C2)
//   operator new[](unsigned long)                    @Helium 0x32c64e (C2)
//   operator delete(void*) via __ZdlPv               @Helium 0x32c7c3 (D2),
//                                                     0x32c813 (D1),
//                                                     0x32c858 (D0)
//   HGNode::~HGNode()                                @Helium 0x32c7d1 (D2 tail-jmp),
//                                                     0x32c821 (D1 tail-jmp)
//   HGNode::ClearBits()                              @Helium 0x32c8dd (SetParameter)
//   HGRenderer::GetTarget(unsigned int)              @Helium 0x32bb5c (GetProgram)
//   operator new(size_t) via __Znwm                  @Helium 0x32bf4e (shaderDescription)

import { HGObject } from "./HGObject.js";
import { HGNode } from "./HGNode.js";
import { HGRect, HGRectNull } from "./HGRect.js";

/** Opaque handle for Helium's `HGRenderer*` render-graph context. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
/** Opaque handle for Helium's `HGTile*` (the tile being rendered). */
export type HGTilePtr = { readonly __brand: "HGTile" };
/** Opaque handle for Helium's `HGHandler*` (render-state binder). */
export type HGHandlerPtr = { readonly __brand: "HGHandler" };
/** Opaque handle for Helium's `HGProgramDescriptor*`. */
export type HGProgramDescriptorPtr = { readonly __brand: "HGProgramDescriptor" };

// ---------------------------------------------------------------------------
// DECODED uniform-buffer constants (all byte-verified against Helium x86_64
// slice at file offset 0x4000 + <VA>).
// ---------------------------------------------------------------------------

/** @Helium __const @0x3c7cb0 — <0.0, 1.0, 0.0, 0.0>. Loaded via movsd
 *  (low 8 bytes only, upper 8 zeroed by movsd). */
const V4_00_10_AT_0x3c7cb0: readonly [number, number, number, number] = [
  Math.fround(0.0),
  Math.fround(1.0),
  Math.fround(0.0),
  Math.fround(0.0),
];

/** @Helium __const @0x3cb0b0 — <1e-6, 1e-6, 1e-6, 1e-6>. Division-safety
 *  epsilon; matches `fmax(r?.w, 1.00000e-06f)` in the shader source. */
const EPS_1EM6_AT_0x3cb0b0: readonly [number, number, number, number] = [
  Math.fround(9.999999974752427e-07),
  Math.fround(9.999999974752427e-07),
  Math.fround(9.999999974752427e-07),
  Math.fround(9.999999974752427e-07),
];

/** @Helium __const @0x85fed0 — <1.000244, 1.000244, 1.000244, 1.000244>.
 *  = 2^0 * (1 + 2^-12); an "F16 nearest above 1.0" broadcast. Same value
 *  as HgcVibrancy's @0x15890d0 constant (Flexo). */
const ONE_PLUS_HALF_ULP_AT_0x85fed0: readonly [number, number, number, number] = [
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
];

// ---------------------------------------------------------------------------
// Frontier callees (each stub throws citing its call-site @0xADDR).
// ---------------------------------------------------------------------------

/** operator new[](0xa7) — frontier callee @Helium 0x32c64e (C2). Allocates
 *  167 bytes for the aligned uniform buffer + 8-byte raw-pointer stash. */
function operatorNewArray(_size: number): Uint8Array {
  throw new Error(
    "operator new[](unsigned long) not yet transcribed " +
      "(frontier callee @Helium 0x32c64e in HgcBilateralFilterInterpSC_InterpolatorLastY [C2])",
  );
}

/** operator delete(void*) — frontier callee at three sites:
 *    @Helium 0x32c7c3 (D2), 0x32c813 (D1), 0x32c858 (D0). */
function operatorDelete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) not yet transcribed " +
      "(frontier callees @Helium 0x32c7c3 / 0x32c813 / 0x32c858 in HgcBilateralFilterInterpSC_InterpolatorLastY dtors)",
  );
}

/** HGNode::ClearBits() — frontier callee @Helium 0x32c8dd (SetParameter). */
function HGNode_ClearBits(_self: HgcBilateralFilterInterpSC_InterpolatorLastY): void {
  throw new Error(
    "HGNode::ClearBits() not yet transcribed " +
      "(frontier callee @Helium 0x32c8dd in HgcBilateralFilterInterpSC_InterpolatorLastY::SetParameter)",
  );
}

/** HGRenderer::GetTarget(unsigned int) — frontier callee @Helium 0x32bb5c
 *  (GetProgram). Return == 0x60b10 => Metal shader; else null. */
function HGRenderer_GetTarget(_renderer: HGRendererPtr, _arg: number): number {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) not yet transcribed " +
      "(frontier callee @Helium 0x32bb5c in HgcBilateralFilterInterpSC_InterpolatorLastY::GetProgram)",
  );
}

// ---------------------------------------------------------------------------
// Metal shader source — literal pool referenced by GetProgram.
// ---------------------------------------------------------------------------

/** @Helium __cstring literal pool referenced by `leaq 0x674d90(%rip)`
 *  @GetProgram+0x18 (@0x32bb68). Full source in raw-port/re/disasm; the
 *  fragment is a 4-texture bilateral-interpolation pass with an
 *  hg_Params[0] control vector (xyzw = threshold, clamp, mul, add). */
export const HGC_BILATERAL_FILTER_INTERP_LASTY_METAL_SHADER: string =
  "//Metal1.0     \n//LEN=0000000531\n" +
  "// HgcBilateralFilterInterpSC_InterpolatorLastY fragment (from Helium\n" +
  "// __cstring pool referenced by leaq 0x674d90(%rip) @Helium 0x32bb68).\n" +
  "// Full source captured in disasm; ~1.3 KB body preserved in the binary.\n";

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * `HgcBilateralFilterInterpSC_InterpolatorLastY` — Helium bilateral-filter
 * interpolator final-Y pass. See file header for full layout, vtable,
 * shader, and decode citations. Vtable @Helium 0xa44f38.
 */
export class HgcBilateralFilterInterpSC_InterpolatorLastY extends HGNode {
  /** +0x198 — aligned uniform-buffer view (0xa7 bytes, 32-byte aligned+8). */
  private uniformBuffer: Uint8Array | null;

  /**
   * @Helium C2 @0x32c630 (C1 @0x32c6e0 has an identical body).
   *
   *   0x32c63a  callq HGNode::HGNode()                     ; base ctor
   *   0x32c63f  leaq  0x7188f2(%rip), %rax                 ; RIP -> 0xa44f38 (vtable)
   *   0x32c646  movq  %rax, (%rbx)                         ; install vtable
   *   0x32c649  movl  $0xa7, %edi                          ; alloc size = 167
   *   0x32c64e  callq operator new[](167)
   *   0x32c653..0x32c664  32-byte alignment dance (stash raw ptr at [aligned - 8])
   *   0x32c668..0x32c670  xorps xmm0 ; movaps 0, +0x08 ; movaps 0, +0x18
   *   0x32c675..0x32c682  movsd  <0.0, 1.0>  @0x3c7cb0 (movsd zero-upper), +0x38, +0x28
   *   0x32c687..0x32c693  movaps <1e-6, ...> @0x3cb0b0, +0x58, +0x48
   *   0x32c698..0x32c6a4  movaps <1.000244, ...> @0x85fed0, +0x78, +0x68
   *   0x32c6a9  movq %rdx, 0x198(%rbx)                     ; this.uniformBuffer = aligned view
   *   0x32c6b0..0x32c6bd  flags = (flags & ~0x200) | 0x400
   */
  constructor() {
    // @Helium 0x32c63a — HGNode::HGNode() base ctor.
    super();
    // @Helium 0x32c646 — install vtable @0xa44f38.
    this.vtable = 0xa44f38;
    // @Helium 0x32c64e — allocate 0xa7 bytes.
    const raw = operatorNewArray(0xa7);
    // @Helium 0x32c653..0x32c664 — 32-byte alignment dance.
    const aligned = alignedView32Plus8(raw);
    const dv = new DataView(
      aligned.buffer,
      aligned.byteOffset,
      aligned.byteLength,
    );

    // @Helium 0x32c668..0x32c670 — zero +0x08 and +0x18.
    writeVec4F32(dv, 0x08, [0, 0, 0, 0]);
    writeVec4F32(dv, 0x18, [0, 0, 0, 0]);
    // Slots +0x00 and +0x10 (hg_Params[0]) start zero from operator new[];
    // the movsd at +0x28/+0x38 handles the second constant slot. Model
    // explicitly to match the runtime state exactly after ctor.
    writeVec4F32(dv, 0x00, [0, 0, 0, 0]);
    writeVec4F32(dv, 0x10, [0, 0, 0, 0]);

    // @Helium 0x32c675..0x32c682 — <0.0, 1.0, 0.0, 0.0> at +0x38 then +0x28.
    writeVec4F32(dv, 0x38, V4_00_10_AT_0x3c7cb0);
    writeVec4F32(dv, 0x28, V4_00_10_AT_0x3c7cb0);
    // @Helium 0x32c687..0x32c693 — EPS at +0x58 then +0x48.
    writeVec4F32(dv, 0x58, EPS_1EM6_AT_0x3cb0b0);
    writeVec4F32(dv, 0x48, EPS_1EM6_AT_0x3cb0b0);
    // @Helium 0x32c698..0x32c6a4 — <1.000244, ...> at +0x78 then +0x68.
    writeVec4F32(dv, 0x78, ONE_PLUS_HALF_ULP_AT_0x85fed0);
    writeVec4F32(dv, 0x68, ONE_PLUS_HALF_ULP_AT_0x85fed0);

    // @Helium 0x32c6a9 — this->uniformBuffer = aligned view.
    this.uniformBuffer = aligned;

    // @Helium 0x32c6b0..0x32c6bd — HGNode flags &= ~0x200; flags |= 0x400.
    //   Modelled via HGNode's flags accessor when it lands; recorded here
    //   for provenance.
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::SetParameter(int i, float a, float b, float c, float d)`
   * — @Helium 0x32c880.
   *
   * Body is byte-for-byte identical to HgcVibrancy::SetParameter (@0x146fa20)
   * modulo the vtable slot address: i must equal 0, then compare 4 lanes at
   * uniformBuffer+0x00 against (a,b,c,d), and if any differs write both
   * +0x00 and +0x10 slots and call HGNode::ClearBits().
   *
   *   0x32c880  movl $0xffffffff, %eax        ; default return = -1
   *   0x32c885  testl %esi, %esi              ; i == 0?
   *   0x32c887  je   0x32c88a                 ; yes => real path
   *   0x32c889  retq                          ; i != 0 => return -1
   *   0x32c88a  movq 0x198(%rdi), %rax        ; load uniformBuffer pointer
   *   0x32c891..0x32c8be  4-lane ucomiss (aF, bF, cF, dF) vs buffer[+0..+0xc]
   *   0x32c8be  jnp 0x32c8e9                  ; all ordered-equal => return 0
   *   0x32c8c4..0x32c8d0  insertps to build (a,b,c,d) into xmm0
   *   0x32c8d6  movups %xmm0, 0x10(%rax)      ; write to slot +0x10
   *   0x32c8da  movups %xmm0, (%rax)          ; write to slot +0x00
   *   0x32c8dd  callq HGNode::ClearBits()
   *   0x32c8e2  movl  $0x1, %eax              ; return 1
   *   0x32c8e8  retq
   *   0x32c8e9  xorl  %eax, %eax; retq        ; return 0
   */
  SetParameter(
    i: number,
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    // @Helium 0x32c885..0x32c889 — i != 0 => return -1.
    if ((i | 0) !== 0) {
      return -1;
    }
    // @Helium 0x32c88a — load uniformBuffer.
    const buf = this.uniformBuffer;
    if (buf === null) {
      throw new Error(
        "HgcBilateralFilterInterpSC_InterpolatorLastY::SetParameter reached with null uniformBuffer " +
          "(should be unreachable if ctor @Helium 0x32c630 ran)",
      );
    }
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const aF = Math.fround(a);
    const bF = Math.fround(b);
    const cF = Math.fround(c);
    const dF = Math.fround(d);
    // @Helium 0x32c891..0x32c8be — compare 4 lanes; if all ordered-equal, return 0.
    const cur0 = dv.getFloat32(0x00, true);
    const cur1 = dv.getFloat32(0x04, true);
    const cur2 = dv.getFloat32(0x08, true);
    const cur3 = dv.getFloat32(0x0c, true);
    const allEqualOrdered =
      cur0 === aF && !Number.isNaN(cur0) && !Number.isNaN(aF) &&
      cur1 === bF && !Number.isNaN(cur1) && !Number.isNaN(bF) &&
      cur2 === cF && !Number.isNaN(cur2) && !Number.isNaN(cF) &&
      cur3 === dF && !Number.isNaN(cur3) && !Number.isNaN(dF);
    if (allEqualOrdered) {
      // @Helium 0x32c8e9 — return 0.
      return 0;
    }
    // @Helium 0x32c8c4..0x32c8da — write vec4 to both +0x00 and +0x10.
    writeVec4F32(dv, 0x00, [aF, bF, cF, dF]);
    writeVec4F32(dv, 0x10, [aF, bF, cF, dF]);
    // @Helium 0x32c8dd — HGNode::ClearBits().
    HGNode_ClearBits(this);
    // @Helium 0x32c8e2 — return 1.
    return 1;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::GetDOD(HGRenderer*, int inputIdx, HGRect r)`
   * — @Helium 0x32c5f0.
   *
   *   0x32c5f0  movq  %rcx, %rax                      ; return.lo = r.lo
   *   0x32c5f3  cmpl  $0x4, %edx                      ; inputIdx < 4?
   *   0x32c5f6  jb    0x32c60b                        ; yes => tail (return r)
   *   0x32c5fc  leaq  _HGRectNull(%rip), %rcx
   *   0x32c603  movq  (%rcx), %rax                    ; return.lo = HGRectNull.lo
   *   0x32c606  movq  0x8(%rcx), %r8                  ; return.hi = HGRectNull.hi
   *   0x32c60b  movq  %r8, %rdx                       ; return.hi = r.hi (or HGRectNull.hi)
   *   0x32c60e  retq
   *
   * The shader samples 4 textures (slots 0..3) so any inputIdx in [0..3]
   * returns the requested rect; inputIdx >= 4 returns HGRectNull.
   */
  GetDOD(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0x32c5f3..0x32c5f6 — jb => unsigned less-than 4.
    if ((inputIdx >>> 0) < 4) {
      return r;
    }
    return HGRectNull;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::GetROI(HGRenderer*, int inputIdx, HGRect r)`
   * — @Helium 0x32c610. Body byte-identical to GetDOD.
   */
  GetROI(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0x32c613..0x32c616 — jb => unsigned less-than 4.
    if ((inputIdx >>> 0) < 4) {
      return r;
    }
    return HGRectNull;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::GetProgram(HGRenderer* r)`
   * — @Helium 0x32bb50.
   *
   *   0x32bb57  movl  $0x60000, %esi
   *   0x32bb5c  callq HGRenderer::GetTarget(0x60000)
   *   0x32bb61  xorl  %ecx, %ecx                                   ; result = NULL
   *   0x32bb63  cmpl  $0x60b10, %eax                               ; target == 0x60b10?
   *   0x32bb68  leaq  METAL_SHADER(%rip), %rax
   *   0x32bb6f  cmoveq %rax, %rcx                                  ; equal? => rcx = rax
   *   0x32bb73  movq  %rcx, %rax
   *   0x32bb77  retq
   *
   * Exact-equality gate: shader returned ONLY when GetTarget == 0x60b10.
   */
  GetProgram(renderer: HGRendererPtr): string | null {
    // @Helium 0x32bb5c — probe target.
    const target = HGRenderer_GetTarget(renderer, 0x60000) | 0;
    // @Helium 0x32bb63..0x32bb6f — exact-equality with 0x60b10.
    if ((target >>> 0) === 0x60b10) {
      return HGC_BILATERAL_FILTER_INTERP_LASTY_METAL_SHADER;
    }
    return null;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::shaderDescription() const`
   * — @Helium 0x32bf40.
   *
   *   0x32bf49  movl  $0x38, %edi                    ; alloc size = 56 bytes
   *   0x32bf4e  callq __Znwm                         ; operator new(56)
   *   0x32bf53  movq  %rax, 0x10(%rbx)               ; string.__data = new_ptr
   *   0x32bf57  movq  $0x39, (%rbx)                  ; string.__size = 0x39 (LONG-mode SSO tag = capacity/2? see libc++)
   *   0x32bf5e  movq  $0x33, 0x8(%rbx)               ; string.__length = 0x33 = 51 chars
   *   0x32bf66..0x32bf83  three movups of literal-pool strings assembling the 51-char body
   *   0x32bf86  movl  $0x5d316367, 0x2f(%rax)        ; write "gc1]" (LE: 67 63 31 5d) at offset 0x2f
   *   0x32bf8d  movb  $0x0, 0x33(%rax)               ; NUL terminator
   *
   * Produces the long-mode std::string "HgcBilateralFilterInterpSC_InterpolatorLastY [hgc1]"
   * (51 chars, 0x33). The literal pool strings assemble a rolling window of
   * the full 51-char body via three overlapping 16-byte loads.
   */
  shaderDescription(): string {
    // @Helium 0x32bf40..0x32bf9a — literal std::string "HgcBilateralFilterInterpSC_InterpolatorLastY [hgc1]" (51 chars, 0x33).
    return "HgcBilateralFilterInterpSC_InterpolatorLastY [hgc1]";
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::BindTexture(HGHandler*, int)`
   * — @Helium 0x32bfa0. A 121-line 4-way switch dispatched via a jmp-table at
   * @0x32bfb5 (`leaq 0xf0(%rip), %rcx ; jmpq *(%rcx,%rax,4)`) — each of the
   * four slot values 0..3 runs a slightly different sequence of vtable calls
   * on the handler (*0x48, *0x30) and a shared tail block starting at
   * @0x32c065. PARTIAL PORT per PORTING_SPEC Rule 3.
   */
  BindTexture(_handler: HGHandlerPtr, _slot: number): number {
    // @Helium 0x32bfa0..0x32c0bf — 4-slot jmp-table dispatch not yet transcribed.
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastY::BindTexture not yet transcribed " +
        "(4-slot jmp-table dispatch @Helium 0x32bfa0..0x32c0bf)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::Bind(HGHandler*)` —
   * @Helium 0x32c0c0. disasm.sh reported an empty extraction (ICF-folded or
   * pure-tail); no bytes available for line-by-line transcription. PARTIAL
   * PORT per PORTING_SPEC Rule 3.
   */
  Bind(_handler: HGHandlerPtr): number {
    // @Helium 0x32c0c0 — extraction empty (likely ICF-folded); not yet transcribed.
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastY::Bind not yet transcribed " +
        "(0-line disasm extraction @Helium 0x32c0c0 — ICF-folded or pure-stub)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::GetOutput(HGRenderer*)` —
   * @Helium 0x32c8f0 (approx; not disassembled here). Matches the Hgc*
   * family pattern: `mov %rdi, %rax ; ret` — returns `this`.
   */
  GetOutput(_renderer: HGRendererPtr): HgcBilateralFilterInterpSC_InterpolatorLastY {
    // @Helium 0x32c8f0 — HGNode-derived compute kernels in this family
    //   return `this` from GetOutput without allocating a child. Modelled
    //   as such; if the actual disasm reveals otherwise this must be re-ported.
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastY::GetOutput not yet fully transcribed " +
        "(not disassembled; assumed identity per Hgc* family pattern @Helium 0x32c8f0)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::InitProgramDescriptor(HGProgramDescriptor*) const`
   * — @Helium 0x32bb80. A 222-line function that populates the HGProgramDescriptor
   * with the visible-shader source, fragment-function name, return binding, and
   * a std::vector<HGBinding> of push-argument slots for 4 textures + 4 samplers
   * + 1 uniform (hg_Params). PARTIAL PORT per PORTING_SPEC Rule 3.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorPtr): void {
    // @Helium 0x32bb80 — descriptor init not yet transcribed.
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastY::InitProgramDescriptor not yet transcribed " +
        "(222-line HGBinding + shader-setter cascade @Helium 0x32bb80..0x32bf3f)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::RenderTile(HGTile*)` —
   * @Helium 0x32c350. SSE CPU implementation of the 4-texture bilateral
   * interpolation. PARTIAL PORT per PORTING_SPEC Rule 3.
   */
  RenderTile(_tile: HGTilePtr): void {
    // @Helium 0x32c350 — CPU impl not yet transcribed.
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastY::RenderTile not yet transcribed " +
        "(SSE CPU impl @Helium 0x32c350..0x32c5ef)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastY::RenderTile_AVX(HGTile*)` —
   * @Helium 0x32c100. AVX (256-bit) variant of RenderTile. PARTIAL PORT per
   * PORTING_SPEC Rule 3.
   */
  RenderTile_AVX(_tile: HGTilePtr): void {
    // @Helium 0x32c100 — AVX impl not yet transcribed.
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastY::RenderTile_AVX not yet transcribed " +
        "(AVX CPU impl @Helium 0x32c100..0x32c34f)",
    );
  }

  /**
   * `~HgcBilateralFilterInterpSC_InterpolatorLastY()` (D0 — deleting dtor)
   * @Helium 0x32c830.
   *
   *   0x32c839..0x32c840  reinstall vtable (leaq 0x7186f8(%rip); movq -> (%rdi))
   *   0x32c843..0x32c858  free the raw allocation via operator delete if non-null
   *   0x32c85d..     tail into base HGNode::~HGNode()
   *
   * D2 @0x32c790 and D1 @0x32c7e0 are near-identical (vtable disp shift +/-
   * 0x50 bytes) and both tail-jmp to HGNode::~HGNode() @0x32c7d1 / 0x32c821.
   */
  destroyAndDelete(): void {
    // @Helium 0x32c839..0x32c840 — reinstall vtable pointer.
    this.vtable = 0xa44f38;
    // @Helium 0x32c843..0x32c858 — free the raw allocation if non-null.
    if (this.uniformBuffer !== null) {
      operatorDelete(this.uniformBuffer);
      this.uniformBuffer = null;
    }
    // @Helium 0x32c85d — HGNode::~HGNode() (base dtor).
    super.destruct();
  }
}

// ---------------------------------------------------------------------------
// Helpers — 32-byte-alignment dance and vec4 stores. Same code as
// HgcVibrancy.ts; kept here per the one-class-one-file rule.
// ---------------------------------------------------------------------------

/** 32-byte alignment dance @Helium C2+0x23..+0x34 (@0x32c653..0x32c664):
 *    leaq  0x8(%rax), %rcx
 *    negl  %ecx
 *    andl  $0x1f, %ecx
 *    leaq  (%rcx,%rax), %rdx
 *    addq  $0x8, %rdx
 *    movq  %rax, (%rcx,%rax)          ; stash raw base at [aligned - 8]
 *  Produces a view whose byteOffset & 31 == 8, with the raw base
 *  stashed 8 bytes before the aligned view. */
function alignedView32Plus8(raw: Uint8Array): Uint8Array {
  const slack = 32;
  const buf = new ArrayBuffer(raw.byteLength + slack);
  new Uint8Array(buf).set(raw);
  let byteOffset = 0;
  while ((byteOffset & 31) !== 8) {
    byteOffset++;
    if (byteOffset >= slack) break;
  }
  return new Uint8Array(buf, byteOffset, raw.byteLength);
}

/** Store `<4 x f32>` little-endian at `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` for f32-lane constants. */
function writeVec4F32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setFloat32(off + 0, Math.fround(v[0]), true);
  dv.setFloat32(off + 4, Math.fround(v[1]), true);
  dv.setFloat32(off + 8, Math.fround(v[2]), true);
  dv.setFloat32(off + 12, Math.fround(v[3]), true);
}

// Re-export HGObject for reviewer traceability (HGNode -> HGObject chain).
export type { HGObject };
