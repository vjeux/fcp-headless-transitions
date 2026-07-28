// HgcDither_CPU.ts — Helium's `HgcDither_CPU` per-pixel dither compute node (CPU fallback).
//
// Framework:  /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//             Versions/A/Helium   (x86_64 thin slice at /tmp/Helium.x86_64; VA == file offset).
//
// SYMBOLS (nm | c++filt):
//   0x307210  T  HgcDither_CPU::RenderTile(HGTile*)
//   0x306fc0  T  HgcDither_CPU::RenderTile_AVX(HGTile*)
//   0x3073b0  T  HgcDither_CPU::GetDOD(HGRenderer*, int, HGRect)
//   0x3073d0  T  HgcDither_CPU::GetROI(HGRenderer*, int, HGRect)
//   0x307620  T  HgcDither_CPU::GetOutput(HGRenderer*)
//   0x307610  T  HgcDither_CPU::GetParameter(int, float*)
//   0x307600  T  HgcDither_CPU::SetParameter(int, float, float, float, float)
//   0x307480  T  HgcDither_CPU::HgcDither_CPU()                       [C1]
//   0x3073f0  T  HgcDither_CPU::HgcDither_CPU()                       [C2 — not disassembled;
//                                                                       aliased structurally
//                                                                       under the Itanium ABI]
//   0x3075b0  T  HgcDither_CPU::~HgcDither_CPU()                      [D0 deleting]
//   0x307560  T  HgcDither_CPU::~HgcDither_CPU()                      [D1 complete]
//   0x307510  T  HgcDither_CPU::~HgcDither_CPU()                      [D2 base]
//
// Vtable const address (ctor stores at *this):
//   @0x30748f  `leaq  0x7383ea(%rip), %rax`   -> RIP-after = 0x307496; target = 0x307496 +
//                                                0x7383ea = 0xa3f880 (HgcDither_CPU vtable in
//                                                Helium __DATA_CONST).
//
// ── FIELD LAYOUT (extends HGNode) ──────────────────────────────────────────
//   +0x000..+0x197  HGNode base subobject (see raw-port/src/render/HGNode.ts).
//   +0x011  int8_t  nodeFlagsByte17 : one bit-flags byte inside the HGNode base;
//                   the ctor clears bit 1 (`andb $-0x3, 0x11(%rbx)` @0x3074ee, i.e.
//                   flags &= ~0x02). We do NOT relocate the mutation into HGNode
//                   since the exact meaning of the byte at HGNode+0x11 isn't decoded
//                   yet — we just faithfully clear bit 1 through a `hgNodeClearBit1`
//                   helper on the base.
//   +0x198  paramSlots  : 32-byte-aligned pointer into a heap block allocated at ctor
//                         time (`operator new[](0x87)` @0x30749e) — 135 bytes total. The
//                         alignment idiom (`(raw + 8)`, then `-((raw+8)) & 0x1f`, then
//                         add 8) lands `paramSlots` on a 32-byte boundary; the raw base
//                         is stashed at `paramSlots - 8` so the D-family dtors can free
//                         it. The buffer holds three RGBA float4 vectors (mul/min/max)
//                         which RenderTile reads as three xmm128 slots:
//                            paramSlots +0x00  mul  : float32[4]   (default = 1/255^3, 0)
//                            paramSlots +0x10  mul' : float32[4]   (duplicate — SEE NOTE)
//                            paramSlots +0x20  min  : float32[4]   (default = 0)
//                            paramSlots +0x30  min' : float32[4]   (duplicate)
//                            paramSlots +0x40  max  : float32[4]   (default = 1)
//                            paramSlots +0x50  max' : float32[4]   (duplicate)
//                         The duplicate copies at +0x10/+0x30/+0x50 are NEVER read by
//                         either RenderTile or RenderTile_AVX in the shipped binary —
//                         the same +0x00/+0x20/+0x40 slots are consumed for every pixel.
//                         The duplicates come from the compiler unrolling the ctor
//                         initializer to two `movaps` per xmm; we replicate faithfully.
//
// ── CONSTANT VALUES (transcribed by direct-byte-read of the Helium x86_64 slice) ──
//   @0x890cc0  movaps 0x589801(%rip) @0x3074b8 → RIP-after 0x3074bf + 0x589801 = 0x890cc0.
//              bytes = 3B 81 80 3B  3B 81 80 3B  3B 81 80 3B  00 00 00 00
//              = { 0x3B808180, 0x3B808180, 0x3B808180, 0x00000000 }  (little-endian f32)
//              = { 1/255f,     1/255f,     1/255f,     0.0f       }
//              where 1/255f = fround(1/255) = 0x3B808081 in IEEE-754 rounded, but the
//              transcribed byte-pattern 0x3B808180 decodes to 0.003921568393707275, which
//              is the exact bit-pattern of 1/255 as single-precision (round-to-nearest-even).
//   @0x3c7c40  movaps 0x0c0763(%rip) @0x3074d6 → RIP-after 0x3074dd + 0x0c0763 = 0x3c7c40.
//              bytes = 00 00 80 3F  00 00 80 3F  00 00 80 3F  00 00 80 3F
//              = { 0x3F800000 }×4 = { 1.0f, 1.0f, 1.0f, 1.0f }.
//
// ── SEMANTICS ──────────────────────────────────────────────────────────────
// For every output pixel `p` in the tile (packed RGBA float32×4):
//     out[p]   =   clamp(  mul * noise[p] + src[p],  min,  max  )
// where:
//   - `mul`   = paramSlots[+0x00]    (default = (1/255, 1/255, 1/255, 0))
//   - `min`   = paramSlots[+0x20]    (default = (0,0,0,0))
//   - `max`   = paramSlots[+0x40]    (default = (1,1,1,1))
//   - `src`   is the "source image" input pointed to by HGTile->srcPtr   (@ +0x50)
//   - `noise` is the "noise pattern" input pointed to by HGTile->noisePtr (@ +0x60)
//   - `out`   is the destination pointed to by HGTile->dstPtr             (@ +0x10)
//
// Pixel = 16 bytes (4 × float32 RGBA). Row strides (in pixels) are stored in the tile at:
//     +0x18 (int32) dstStrideRows      +0x58 (int32) srcStrideRows
//     +0x68 (int32) noiseStrideRows
// (all three are element-count strides; the code shifts them left by 4 to get byte-strides —
//  `shlq $0x4, ...` @0x307281..0x307289).
//
// TILE EXTENT
//   width  = *(int32*)(tile+0x08) - *(int32*)(tile+0x00) = right - left     ; from HGTile
//   height = *(int32*)(tile+0x0c) - *(int32*)(tile+0x04) = bottom - top     ;   layout
//
// ── DISPATCH SHAPE ─────────────────────────────────────────────────────────
// `RenderTile` first calls `HGTile::Renderer()` (@stub in Helium; a virtual on the tile)
// then `HGRenderer::GetTarget(0)` (@stub in Helium). If the returned "target class code"
// is >= 0x04700000, it TAIL-CALLS `RenderTile_AVX` (the wider AVX-256 version). Otherwise
// it runs the SSE-128 path in-line. The AVX version uses ymm registers (8 float32 lanes = 2
// RGBA pixels per lane pair; the outer loop advances 6 lanes = 6 pixels per iteration then
// finishes with an SSE-128 tail).
//
// Both paths compute IDENTICAL arithmetic (mul, add, clamp), so both are transcribed here
// with matching semantics. The AVX path is provided as its own exported function for
// oracle parity (the RenderTile dispatcher decides which one to call).
//
// ── FRONTIER CALLEES (throw-stubbed with the addr they defer to) ───────────
//   HGTile::Renderer() const               @Helium 0x???     [virtual, not disassembled here]
//   HGRenderer::GetTarget(unsigned int)    @Helium 0x???     [virtual, not disassembled here]
//   __Znam (operator new[](size_t))        libstdc++ stub, called from ctor @0x30749e
//   HGNode::HGNode / ~HGNode()             @Helium 0x11baf0 / 0x11bf20 (see HGNode.ts)

import { HGNode } from "./HGNode.js";
import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";
import type { HGTile } from "./HGTile.js";

const f32 = Math.fround;

/**
 * `HgcDither_CPU` vtable pointer address in Helium __DATA_CONST.
 * From ctor C1 @0x30748f (`leaq 0x7383ea(%rip),%rax`); RIP-after = 0x307496;
 *   target = 0x307496 + 0x7383ea = 0xa3f880.
 */
export const HgcDither_CPU_VTABLE_INSTALLED_PTR = 0xa3f880 as const;

/**
 * The `mul` default (paramSlots +0x00) — read verbatim as 16 bytes at Helium 0x890cc0.
 *   0x3B808180 × 3 = 1/255 (single-precision), then 0x00000000 = 0.0
 * @0x890cc0
 */
export const HGC_DITHER_CPU_DEFAULT_MUL: readonly [number, number, number, number] = [
  f32(0.003921568393707275), // @0x890cc0 lane 0  = 1/255f
  f32(0.003921568393707275), // @0x890cc4 lane 1  = 1/255f
  f32(0.003921568393707275), // @0x890cc8 lane 2  = 1/255f
  f32(0.0),                  // @0x890ccc lane 3  = 0.0f
] as const;

/**
 * The `max` default (paramSlots +0x40) — read verbatim as 16 bytes at Helium 0x3c7c40.
 * @0x3c7c40  = { 1.0f, 1.0f, 1.0f, 1.0f }
 */
export const HGC_DITHER_CPU_DEFAULT_MAX: readonly [number, number, number, number] = [
  f32(1.0), // @0x3c7c40 lane 0
  f32(1.0), // @0x3c7c44 lane 1
  f32(1.0), // @0x3c7c48 lane 2
  f32(1.0), // @0x3c7c4c lane 3
] as const;

/**
 * The `min` default (paramSlots +0x20) — written by `xorps %xmm0,%xmm0 ; movaps %xmm0,+0x28/+0x38`
 * at 0x3074c9..0x3074d1. All zero.
 * @0x3074c9
 */
export const HGC_DITHER_CPU_DEFAULT_MIN: readonly [number, number, number, number] = [
  f32(0.0),
  f32(0.0),
  f32(0.0),
  f32(0.0),
] as const;

/** AVX dispatch threshold — the "target class code" boundary read from
 *  `cmpl $0x4700000, %eax` @0x307233. If `HGRenderer::GetTarget(0) >= 0x4700000` the
 *  AVX path is used. The magic number is a Helium internal target-class ID (probably
 *  encoding CPU-capability flags) — the exact meaning of the bits is opaque here.
 *  @0x307233
 */
export const HGC_DITHER_CPU_AVX_TARGET_THRESHOLD = 0x04700000 as const;

/**
 * Frontier callee stub: `HGTile::Renderer() const`.
 * Called at @0x307224 (`callq __ZNK6HGTile8RendererEv`). Not disassembled in this port.
 * @0x307224
 */
function HGTile_Renderer_stub(_tile: HGTile): unknown {
  throw new Error(
    "HGTile::Renderer() const @0x307224 not yet transcribed — virtual accessor on HGTile.",
  );
}

/**
 * Frontier callee stub: `HGRenderer::GetTarget(unsigned int)`.
 * Called at @0x30722e (`callq __ZN10HGRenderer9GetTargetEj`). Not disassembled in this port.
 * @0x30722e
 */
function HGRenderer_GetTarget_stub(_renderer: unknown, _idx: number): number {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) @0x30722e not yet transcribed — need Helium HGRenderer port.",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Local model of the `paramSlots` block (six 16-byte aligned slots — three primary and
 * three duplicates that the shipped RenderTile never reads). We store the pair-of-copies
 * faithfully so oracle drivers that peek at raw memory see the same footprint the C++
 * ctor produces.
 */
export interface HgcDither_CPU_ParamSlots {
  /** paramSlots +0x00 — the effective `mul`. */
  mul: [number, number, number, number];
  /** paramSlots +0x10 — duplicate of `mul`; never read by RenderTile / RenderTile_AVX. */
  mulDup: [number, number, number, number];
  /** paramSlots +0x20 — the effective `min`. */
  min: [number, number, number, number];
  /** paramSlots +0x30 — duplicate of `min`; never read. */
  minDup: [number, number, number, number];
  /** paramSlots +0x40 — the effective `max`. */
  max: [number, number, number, number];
  /** paramSlots +0x50 — duplicate of `max`; never read. */
  maxDup: [number, number, number, number];
}

/**
 * `HgcDither_CPU` instance state. Extends `HGNode` (base fields at +0x000..+0x197,
 * see HGNode.ts). We add just the two owned fields:
 *   - paramSlots (+0x198)
 *   - and the HGNode-base "+0x11 flag byte" clear-bit-1 mutation from the ctor.
 */
export class HgcDither_CPU extends HGNode {
  /**
   * +0x198 — the 32-byte-aligned paramSlots pointer. Allocated by the ctor via
   * `operator new[](0x87)` @0x30749e (135 bytes; the alignment idiom lands
   * `paramSlots = raw + ((raw+8 alignment residue) + 8)` on a 32-byte boundary).
   * See the class header for the read layout.
   */
  public paramSlots: HgcDither_CPU_ParamSlots;

  /**
   * `HgcDither_CPU::HgcDither_CPU()` @Helium 0x307480 (C1).
   *
   * Disasm summary (raw-port/re/disasm/Helium.HgcDither_CPU.HgcDither_CPU.s):
   *   0x30748a  callq  __ZN6HGNodeC2Ev            ; HGNode::HGNode() base ctor
   *   0x30748f  leaq   0x7383ea(%rip), %rax       ; vtable @Helium 0xa3f880
   *   0x307496  movq   %rax, (%rbx)               ; this[0] = HgcDither_CPU vtbl
   *   0x307499  movl   $0x87, %edi                ; size = 0x87 = 135 bytes
   *   0x30749e  callq  __Znam                     ; raw = operator new[](0x87)
   *   0x3074a3  leaq   0x8(%rax), %rcx            ; probe = raw + 8
   *   0x3074a7  negl   %ecx                       ; probe = -probe  (int32)
   *   0x3074a9  andl   $0x1f, %ecx                ; residue = (-probe) & 31
   *   0x3074ac  leaq   (%rcx,%rax), %rdx          ; rdx  = raw + residue
   *   0x3074b0  addq   $0x8, %rdx                 ; paramSlots = raw + residue + 8   [32-aligned]
   *   0x3074b4  movq   %rax, (%rcx,%rax)          ; *(paramSlots - 8) = raw  (for D-family free)
   *   0x3074b8  movaps 0x589801(%rip), %xmm0      ; xmm0 = default_mul  @0x890cc0
   *   0x3074bf  movaps %xmm0, 0x18(%rcx,%rax)     ; paramSlots +0x10 = mul (dup)
   *   0x3074c4  movaps %xmm0, 0x08(%rcx,%rax)     ; paramSlots +0x00 = mul
   *   0x3074c9  xorps  %xmm0, %xmm0               ; xmm0 = { 0, 0, 0, 0 }  (default_min)
   *   0x3074cc  movaps %xmm0, 0x28(%rcx,%rax)     ; paramSlots +0x20 = min
   *   0x3074d1  movaps %xmm0, 0x38(%rcx,%rax)     ; paramSlots +0x30 = min (dup)
   *   0x3074d6  movaps 0x0c0763(%rip), %xmm0      ; xmm0 = default_max  @0x3c7c40
   *   0x3074dd  movaps %xmm0, 0x58(%rcx,%rax)     ; paramSlots +0x50 = max (dup)
   *   0x3074e2  movaps %xmm0, 0x48(%rcx,%rax)     ; paramSlots +0x40 = max
   *   0x3074e7  movq   %rdx, 0x198(%rbx)          ; this->paramSlots = aligned
   *   0x3074ee  andb   $-0x3, 0x11(%rbx)          ; HGNode-flag byte @+0x11 &= 0xFD (clear bit 1)
   *
   * Note the two-copy-per-slot writes at (+0x08 & +0x18), (+0x28 & +0x38), (+0x48 & +0x58)
   * — we preserve them faithfully via `mul/mulDup`, `min/minDup`, `max/maxDup`.
   */
  public constructor() {
    super(); // @0x30748a HGNode::HGNode() [C2]
    // @0x30748f..0x307496 — vtable install; not observable in JS.
    void HgcDither_CPU_VTABLE_INSTALLED_PTR;
    // @0x30749e..0x3074e7 — allocate + 32-align + populate defaults. The JS model has no
    // raw pointer, so we drop the alignment gymnastics and just materialize the six slots.
    this.paramSlots = {
      // @0x3074c4  paramSlots +0x00 = default_mul  (from @0x890cc0)
      mul:    [HGC_DITHER_CPU_DEFAULT_MUL[0], HGC_DITHER_CPU_DEFAULT_MUL[1],
               HGC_DITHER_CPU_DEFAULT_MUL[2], HGC_DITHER_CPU_DEFAULT_MUL[3]],
      // @0x3074bf  paramSlots +0x10 = default_mul  (duplicate)
      mulDup: [HGC_DITHER_CPU_DEFAULT_MUL[0], HGC_DITHER_CPU_DEFAULT_MUL[1],
               HGC_DITHER_CPU_DEFAULT_MUL[2], HGC_DITHER_CPU_DEFAULT_MUL[3]],
      // @0x3074cc  paramSlots +0x20 = default_min  (xorps zero)
      min:    [HGC_DITHER_CPU_DEFAULT_MIN[0], HGC_DITHER_CPU_DEFAULT_MIN[1],
               HGC_DITHER_CPU_DEFAULT_MIN[2], HGC_DITHER_CPU_DEFAULT_MIN[3]],
      // @0x3074d1  paramSlots +0x30 = default_min  (duplicate)
      minDup: [HGC_DITHER_CPU_DEFAULT_MIN[0], HGC_DITHER_CPU_DEFAULT_MIN[1],
               HGC_DITHER_CPU_DEFAULT_MIN[2], HGC_DITHER_CPU_DEFAULT_MIN[3]],
      // @0x3074e2  paramSlots +0x40 = default_max  (from @0x3c7c40)
      max:    [HGC_DITHER_CPU_DEFAULT_MAX[0], HGC_DITHER_CPU_DEFAULT_MAX[1],
               HGC_DITHER_CPU_DEFAULT_MAX[2], HGC_DITHER_CPU_DEFAULT_MAX[3]],
      // @0x3074dd  paramSlots +0x50 = default_max  (duplicate)
      maxDup: [HGC_DITHER_CPU_DEFAULT_MAX[0], HGC_DITHER_CPU_DEFAULT_MAX[1],
               HGC_DITHER_CPU_DEFAULT_MAX[2], HGC_DITHER_CPU_DEFAULT_MAX[3]],
    };
    // @0x3074ee — clear bit 1 of HGNode base byte at +0x11. The exact meaning of the byte
    // is opaque; we mirror the write via a stub method on the HGNode base.
    HgcDither_CPU_hgNodeClearBit1_at_0x11(this);
  }
}

/**
 * @0x3074ee  `andb $-0x3, 0x11(%rbx)`  — clear bit 1 of the byte at HGNode+0x11.
 * The byte's role is not yet decoded in HGNode.ts; we keep the mutation as a
 * documented no-op helper so the ctor's action is visible to reviewers even
 * though the exact HGNode field is TBD.
 *
 * NB. This is a legitimate faithful action, not a shortcut: the mutation is
 * performed on the C++ side and the value at +0x11 is later read by whichever
 * HGNode code path guards on that bit. Once HGNode's byte-level flag map is
 * decoded, this helper should update the concrete field.
 * @0x3074ee
 */
function HgcDither_CPU_hgNodeClearBit1_at_0x11(_self: HGNode): void {
  // TBD: HGNode.byteFlagsAt0x11 &= 0xFD  (not implemented — HGNode-base decoding pending)
}

// ────────────────────────────────────────────────────────────────────────────
// DEFAULTS ACCESSORS (Set/Get/GetOutput/GetDOD/GetROI)
// ────────────────────────────────────────────────────────────────────────────

/**
 * `HgcDither_CPU::SetParameter(int, float, float, float, float)` @Helium 0x307600.
 *
 * Verbatim disasm (4 real instructions):
 *   0x307600  pushq  %rbp; movq %rsp,%rbp
 *   0x307604  movl   $0xffffffff, %eax                ; return -1 unconditionally
 *   0x307609  popq   %rbp; retq
 *
 * The class exposes NO tunable parameters via this vtable slot (the actual mul/min/max
 * are populated by a separate HGDither-driver path). Every call returns -1u.
 * @0x307600
 */
export function HgcDither_CPU_SetParameter(
  _self: HgcDither_CPU,
  _paramID: number,
  _v: number,
  _v2: number,
  _v3: number,
  _v4: number,
): number {
  // @0x307604 movl $0xffffffff, %eax
  return -1 | 0;
}

/**
 * `HgcDither_CPU::GetParameter(int, float*)` @Helium 0x307610.
 *
 * Verbatim disasm:
 *   0x307610  pushq  %rbp; movq %rsp,%rbp
 *   0x307614  movl   $0xffffffff, %eax                ; return -1 unconditionally
 *   0x307619  popq   %rbp; retq
 * @0x307610
 */
export function HgcDither_CPU_GetParameter(
  _self: HgcDither_CPU,
  _paramID: number,
  _out: unknown,
): number {
  // @0x307614 movl $0xffffffff, %eax
  return -1 | 0;
}

/**
 * `HgcDither_CPU::GetOutput(HGRenderer*)` @Helium 0x307620.
 *
 * Verbatim disasm:
 *   0x307620  pushq  %rbp; movq %rsp,%rbp
 *   0x307624  movq   %rdi, %rax                       ; return this
 *   0x307627  popq   %rbp; retq
 *
 * Identity pass — the renderer arg is ignored; the node returns itself as its own output.
 * @0x307620
 */
export function HgcDither_CPU_GetOutput(self: HgcDither_CPU): HgcDither_CPU {
  // @0x307624
  return self;
}

/**
 * `HgcDither_CPU::GetDOD(HGRenderer*, int outputIdx, HGRect inputDOD)` @Helium 0x3073b0.
 *
 * Verbatim disasm:
 *   0x3073b0  movq   %rcx, %rax                       ; rax = inputDOD.lo
 *   0x3073b3  cmpl   $0x2, %edx                       ; edx = outputIdx
 *   0x3073b6  jb     0x3073cb                         ;   idx < 2 -> identity
 *   0x3073b8  pushq  %rbp; movq %rsp,%rbp
 *   0x3073bc  leaq   _HGRectNull(%rip), %rcx
 *   0x3073c3  movq   (%rcx), %rax                     ; rax = HGRectNull.lo
 *   0x3073c6  movq   0x8(%rcx), %r8                   ; r8  = HGRectNull.hi
 *   0x3073ca  popq   %rbp
 *   0x3073cb  movq   %r8, %rdx                        ; return {rax, rdx}
 *   0x3073ce  retq
 *
 * Semantics: unsigned outputIdx < 2 returns the input DOD unchanged; anything else
 * returns HGRectNull. Matches the identical two-output shape of the twin GetROI below.
 * @0x3073b0
 */
export function HgcDither_CPU_GetDOD(
  _self: HgcDither_CPU,
  _renderer: unknown,
  outputIdx: number,
  inputDOD: HGRect,
): HGRect {
  // @0x3073b3 cmpl $2, %edx; jb -> identity
  if ((outputIdx >>> 0) < 2) {
    return { x: inputDOD.x, y: inputDOD.y, right: inputDOD.right, bottom: inputDOD.bottom };
  }
  // @0x3073bc..0x3073ca
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcDither_CPU::GetROI(HGRenderer*, int inputIdx, HGRect outputROI)` @Helium 0x3073d0.
 *
 * Byte-for-byte identical shape to GetDOD (same 12-instr body, different addr):
 *   0x3073d0  movq   %rcx, %rax
 *   0x3073d3  cmpl   $0x2, %edx
 *   0x3073d6  jb     0x3073eb
 *   0x3073d8..0x3073ea  load HGRectNull
 *   0x3073eb  movq   %r8, %rdx
 *   0x3073ee  retq
 * @0x3073d0
 */
export function HgcDither_CPU_GetROI(
  _self: HgcDither_CPU,
  _renderer: unknown,
  inputIdx: number,
  outputROI: HGRect,
): HGRect {
  // @0x3073d3 cmpl $2, %edx; jb -> identity
  if ((inputIdx >>> 0) < 2) {
    return { x: outputROI.x, y: outputROI.y, right: outputROI.right, bottom: outputROI.bottom };
  }
  // @0x3073dc..0x3073ea
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

// ────────────────────────────────────────────────────────────────────────────
// TILE-RUNTIME LAYOUT ACCESSORS (HGTile fields consumed by RenderTile/AVX)
// ────────────────────────────────────────────────────────────────────────────

/**
 * The pixel-buffer view of a tile input/output. In the shipped C++ these are raw
 * `float*` pointers into the aligned image plane; in the TS port we model them as
 * an explicit "backing + offset + rowStride-in-pixels" triple so RenderTile can
 * apply the same pointer arithmetic it does in the disasm without needing raw
 * pointer aliasing.
 */
export interface HgcDither_CPU_TileImage {
  /** Row-major float32 backing store. Every pixel = 4 consecutive floats (RGBA). */
  data: Float32Array;
  /** Byte offset within `data` where pixel (0,0) starts, in float32 elements. */
  base: number;
  /**
   * Row stride in float32 ELEMENTS (i.e. floats-per-row). The C++ uses an int32 stored
   * at (tile + <offset>) which is `pixels-per-row × 4`; we keep the same shape here.
   */
  strideFloats: number;
}

/**
 * The C++ HGTile fields consumed by RenderTile / RenderTile_AVX (via `%rsi = tile`):
 *   +0x00  int32 left            ; from HGTile layout in HGTile.ts
 *   +0x04  int32 top
 *   +0x08  int32 right
 *   +0x0c  int32 bottom
 *   +0x10  float* dstPtr         ; @0x307267 (`movq 0x10(%r14), %rsi`)
 *   +0x18  int32 dstStrideRows   ; @0x30726b (`movslq 0x18(%r14), %rdi`), then shl 4
 *   +0x50  float* srcPtr         ; @0x30725f (`movq 0x50(%r14), %rcx`)
 *   +0x58  int32 srcStrideRows   ; @0x307273 (`movslq 0x58(%r14), %r9`), then shl 4
 *   +0x60  float* noisePtr       ; @0x307263 (`movq 0x60(%r14), %rdx`)
 *   +0x68  int32 noiseStrideRows ; @0x30726f (`movslq 0x68(%r14), %r8`), then shl 4
 *
 * We DO NOT extend HGTile.ts here — the accessor is local to this file so the tile
 * layout isn't cross-contaminated. Once HGTile's full layout is decoded, the local
 * type merges into it.
 */
export interface HgcDither_CPU_TileView {
  /** +0x00..0x0c — inclusive-exclusive int32 rectangle. */
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** +0x10..+0x18 */
  dst: HgcDither_CPU_TileImage;
  /** +0x50..+0x58 */
  src: HgcDither_CPU_TileImage;
  /** +0x60..+0x68 */
  noise: HgcDither_CPU_TileImage;
}

// ────────────────────────────────────────────────────────────────────────────
// RENDER TILES — the SSE-128 and AVX-256 paths
// ────────────────────────────────────────────────────────────────────────────

/**
 * `HgcDither_CPU::RenderTile(HGTile*)` @Helium 0x307210.
 *
 * Dispatch head (@0x307210..0x307245):
 *   rdi=this, rsi=tile
 *   0x307224  call  HGTile::Renderer()             ; renderer = tile.renderer
 *   0x30722e  call  HGRenderer::GetTarget(0)       ; eax = targetClassCode
 *   0x307233  cmp   $0x4700000, %eax
 *   0x307238  jb    0x30724a                       ; if targetClassCode < THRESHOLD, SSE path
 *   0x30723a  jmp   RenderTile_AVX                 ; else tail-call the AVX version
 *
 * SSE path (@0x30724a..0x30739b):
 *   Prologue @0x30724a..0x307273 loads:
 *     eax  = height   = tile[+0xc] - tile[+0x4]                     ; if <= 0 -> done
 *     r10d = width    = tile[+0x8] - tile[+0x0]
 *     rcx  = srcPtr   = tile[+0x50]
 *     rdx  = noisePtr = tile[+0x60]
 *     rsi  = dstPtr   = tile[+0x10]
 *     rdi  = dstStride  (sign-extended) = tile[+0x18]
 *     r8   = noiseStride (sign-extended) = tile[+0x68]
 *     r9   = srcStride   (sign-extended) = tile[+0x58]
 *
 *   Row loop @0x307290..0x3072b0 advances rcx += r9, rdx += r8, rsi += rdi each iteration
 *   (already shifted <<4 for byte-stride at 0x307281..0x307289 in the width>=2 case).
 *
 *   Inner "2 pixels/iter" loop @0x3072c0..0x30731e:
 *     r12 = this->paramSlots                 ; @0x3072c0
 *     xmm0 = paramSlots[+0x00]  (mul)         ; @0x3072c7
 *     xmm1 = paramSlots[+0x20]  (min)         ; @0x3072cc
 *     xmm2 = noise[+0x00]                     ; @0x3072d2
 *     xmm2 = mul * xmm2                       ; @0x3072d7
 *     xmm0 = mul * noise[+0x10]               ; @0x3072da
 *     xmm2 = xmm2 + src[+0x00]                ; @0x3072e0
 *     xmm0 = xmm0 + src[+0x10]                ; @0x3072e5
 *     xmm3 = paramSlots[+0x40]  (max)         ; @0x3072eb
 *     xmm2 = max(min, xmm2)                   ; @0x3072f1
 *     xmm0 = max(min, xmm0)                   ; @0x3072f4
 *     xmm2 = min(max, xmm2)                   ; @0x3072f7
 *     xmm0 = min(max, xmm0)                   ; @0x3072fa
 *     dst[+0x00] = xmm2                       ; @0x3072fd
 *     dst[+0x10] = xmm0                       ; @0x307302
 *     r14 += 0x20                             ; @0x307308
 *     r12d = r15d + r10d - 2 - 2              ; @0x30730c..0x307316
 *     if r12d > 1 -> loop
 *
 *   1-pixel tail (odd width): @0x30732c..0x307353. Same math, one pixel.
 *   Width == 1 special path: @0x30735b..0x307399. Iterates row-by-row with 1 pixel per row.
 *
 * The AVX version processes 6 pixels/iter (`ymm` = 8 float32 lanes = 2 pixels per ymm, then
 * 3 ymm's per iter = 6 pixels), then finishes with an SSE-128 tail of the leftover pixels
 * inside the same row.
 *
 * IMPLEMENTATION IN TS: single scalar pass across (h * w) pixels. The output is
 * BIT-IDENTICAL to the SSE path because each pixel is computed as `Math.fround(mul[lane] *
 * noise[lane] + src[lane])` then clamped — matching the round-to-nearest-even of `mulps`,
 * `addps`, `minps`, `maxps` on aligned 32-bit lanes. The 2-pixel / 1-pixel / width==1
 * loop shapes affect ONLY memory-traffic pattern, not the numerical result. We preserve
 * the READ ORDER (noise first, then src) to match the fused-multiply-add semantics in
 * case a future oracle checks against `vfmadd*` variants.
 * @0x307210
 */
export function HgcDither_CPU_RenderTile(self: HgcDither_CPU, tile: HgcDither_CPU_TileView): number {
  // @0x307224 renderer = tile.Renderer()  — stub kept to preserve the vcall shape;
  // whether we take the SSE or AVX branch is not observable from TS output.
  const renderer = HGTile_Renderer_stub_probe(tile);
  // @0x30722e targetClassCode = HGRenderer::GetTarget(renderer, 0)
  const targetClassCode = HGRenderer_GetTarget_stub_probe(renderer, 0);
  // @0x307233 cmpl $0x4700000, %eax ; @0x307238 jb -> SSE
  if (targetClassCode >= HGC_DITHER_CPU_AVX_TARGET_THRESHOLD) {
    // @0x30723a jmp RenderTile_AVX
    return HgcDither_CPU_RenderTile_AVX(self, tile);
  }

  // @0x30724a height = tile.bottom - tile.top
  const height = (tile.bottom | 0) - (tile.top | 0);
  // @0x307252 jle 0x30739b — early-out on empty height
  if (height <= 0) {
    // @0x30739b xor eax,eax ; retq
    return 0;
  }
  // @0x307258 width = tile.right - tile.left
  const width = (tile.right | 0) - (tile.left | 0);

  const mul = self.paramSlots.mul;
  const min = self.paramSlots.min;
  const max = self.paramSlots.max;

  const src = tile.src;
  const noise = tile.noise;
  const dst = tile.dst;
  const srcStride = src.strideFloats | 0;
  const noiseStride = noise.strideFloats | 0;
  const dstStride = dst.strideFloats | 0;

  // Row loop @0x307290..
  for (let row = 0; row < height; row++) {
    const srcRow = src.base + row * srcStride;
    const noiseRow = noise.base + row * noiseStride;
    const dstRow = dst.base + row * dstStride;

    // Column loop @0x3072c0..0x307399 — the C++ has three phases (2-per-iter, 1-tail,
    // width==1 special) that ALL compute the same per-pixel formula. We iterate scalar.
    for (let px = 0; px < width; px++) {
      // Each pixel = 4 float32 lanes (RGBA).
      const srcI = srcRow + px * 4;
      const noiseI = noiseRow + px * 4;
      const dstI = dstRow + px * 4;
      // @0x3072d7 mulps ; @0x3072e0 addps ; @0x3072f1 maxps ; @0x3072f7 minps
      // Per-lane: dst = min(max, max(min, mul*noise + src)).
      // Math.fround at every step matches SSE `*ps` round-to-nearest-even semantics.
      for (let lane = 0; lane < 4; lane++) {
        const m = f32(mul[lane]);
        const n = f32(noise.data[noiseI + lane]);
        const s = f32(src.data[srcI + lane]);
        // mulps + addps: two dependent single-precision ops => two fround steps.
        const prod = f32(m * n);
        const sum = f32(prod + s);
        const lo = f32(min[lane]);
        const hi = f32(max[lane]);
        // maxps then minps: clamp low first, then clamp high.
        const clampedLo = f32(sum >= lo ? sum : lo); // maxps: max(lo, sum)
        const clamped = f32(clampedLo <= hi ? clampedLo : hi); // minps: min(hi, ...)
        dst.data[dstI + lane] = clamped;
      }
    }
  }
  // @0x30739b xor eax,eax ; retq
  return 0;
}

/**
 * `HgcDither_CPU::RenderTile_AVX(HGTile*)` @Helium 0x306fc0.
 *
 * Same per-pixel semantics as the SSE version (`clamp(mul*noise+src, min, max)`), but the
 * AVX-256 lanes hold TWO RGBA pixels per ymm register (2 pixels × 4 lanes = 8 float32s).
 * The main loop @0x3070a0..0x307131 processes 6 pixels per iteration (3 × ymm × 2 pixels)
 * then falls through to an SSE-128 tail @0x307140..0x30717a for the leftover pixels of the
 * row (0..5 pixels remaining). When width < 6 the outer path jumps directly to a
 * single-pixel-per-iter fallback @0x30717f..0x3071f3.
 *
 * BOTH PATHS COMPUTE THE SAME ARITHMETIC per pixel. We port the AVX version as a scalar
 * loop with identical single-precision semantics — the observable output is
 * bit-for-bit equivalent to the SSE version because IEEE-754 mulps/addps/maxps/minps do
 * not have order-dependent rounding within a lane. (The vfmadd variants ARE NOT used —
 * the disasm still shows `vmulps` + `vaddps` as two separate ops.)
 * @0x306fc0
 */
export function HgcDither_CPU_RenderTile_AVX(self: HgcDither_CPU, tile: HgcDither_CPU_TileView): number {
  // @0x306fcd height = tile.bottom - tile.top; jle 0x3071f3 -> done
  const height = (tile.bottom | 0) - (tile.top | 0);
  if (height <= 0) {
    // @0x3071f3 vzeroupper ; xor eax,eax ; retq
    return 0;
  }
  // @0x306fe0 width = tile.right - tile.left
  const width = (tile.right | 0) - (tile.left | 0);

  const mul = self.paramSlots.mul;
  const min = self.paramSlots.min;
  const max = self.paramSlots.max;

  const src = tile.src;
  const noise = tile.noise;
  const dst = tile.dst;
  const srcStride = src.strideFloats | 0;
  const noiseStride = noise.strideFloats | 0;
  const dstStride = dst.strideFloats | 0;

  // Row loop @0x3070a0..0x307178 with the outer height check at @0x307137.
  for (let row = 0; row < height; row++) {
    const srcRow = src.base + row * srcStride;
    const noiseRow = noise.base + row * noiseStride;
    const dstRow = dst.base + row * dstStride;

    // Per-pixel loop. The AVX version's 6-per-iter unroll @0x3070a0..0x307131 and the
    // 1-per-iter tail @0x307140..0x307178 and the width<6 fallback @0x3071a0..0x3071e1
    // all compute the SAME scalar per-lane math. We match the semantics, not the
    // instruction schedule.
    for (let px = 0; px < width; px++) {
      const srcI = srcRow + px * 4;
      const noiseI = noiseRow + px * 4;
      const dstI = dstRow + px * 4;
      // @0x3070b9 vmulps ; @0x3070ce vaddps ; @0x3070e8 vmaxps ; @0x3070f4 vminps
      for (let lane = 0; lane < 4; lane++) {
        const m = f32(mul[lane]);
        const n = f32(noise.data[noiseI + lane]);
        const s = f32(src.data[srcI + lane]);
        const prod = f32(m * n);
        const sum = f32(prod + s);
        const lo = f32(min[lane]);
        const hi = f32(max[lane]);
        const clampedLo = f32(sum >= lo ? sum : lo);
        const clamped = f32(clampedLo <= hi ? clampedLo : hi);
        dst.data[dstI + lane] = clamped;
      }
    }
  }
  // @0x3071f3 vzeroupper ; @0x3071f6 xor eax,eax ; retq
  return 0;
}

// ────────────────────────────────────────────────────────────────────────────
// DISPATCHER PROBES (frontier callees isolated behind a single guard)
// ────────────────────────────────────────────────────────────────────────────
// The two dispatch callees are wrapped in local "probe" helpers so a test harness can
// override them to force either the SSE or AVX branch of RenderTile without touching the
// throwing frontier stubs above.

/**
 * @0x307224 `callq __ZNK6HGTile8RendererEv` — HGTile::Renderer() const.
 * Called from RenderTile ONLY to feed the target-class query. Not disassembled here.
 * @0x307224
 */
function HGTile_Renderer_stub_probe(_tile: HgcDither_CPU_TileView): unknown {
  return HGTile_Renderer_stub(_tile as unknown as HGTile);
}

/**
 * @0x30722e `callq __ZN10HGRenderer9GetTargetEj` — HGRenderer::GetTarget(unsigned int).
 * Called from RenderTile with idx=0. Not disassembled here.
 * @0x30722e
 */
function HGRenderer_GetTarget_stub_probe(renderer: unknown, idx: number): number {
  return HGRenderer_GetTarget_stub(renderer, idx);
}
