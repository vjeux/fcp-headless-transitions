// HgcRasterizerGenerator.ts — Helium's `HgcRasterizerGenerator` procedural solid-color
// tile generator. Fills each output pixel with the constant  `color * gain`  computed
// from its two tunable parameter slots.
//
// Framework:  /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//             Versions/A/Helium   (x86_64 thin slice at /tmp/Helium.x86_64; VA == file offset).
//
// SYMBOLS (nm | c++filt):
//   0x389c50  T  HgcRasterizerGenerator::RenderTile(HGTile*)
//   0x389b70  T  HgcRasterizerGenerator::RenderTile_AVX(HGTile*)
//   0x389b30  T  HgcRasterizerGenerator::RenderFragment(HGFragment*, HGTile*)
//   0x389b00  T  HgcRasterizerGenerator::RenderFragment_AVX(HGFragment*, HGTile*)
//   0x389f90  T  HgcRasterizerGenerator::SetParameter(int, float, float, float, float)
//   0x38a010  T  HgcRasterizerGenerator::GetParameter(int, float*)
//   0x389dd0  T  HgcRasterizerGenerator::GetProperty(int, unsigned int)
//   0x38a060  T  HgcRasterizerGenerator::GetOutput(HGRenderer*)
//   0x389d80  T  HgcRasterizerGenerator::GetDOD(HGRenderer*, int, HGRect)
//   0x389db0  T  HgcRasterizerGenerator::GetROI(HGRenderer*, int, HGRect)
//   0x389e60  T  HgcRasterizerGenerator::HgcRasterizerGenerator()               [C1]
//
// Vtable install (from ctor C1):
//   @0x389e6f  `leaq 0x6c617a(%rip), %rax`  -> RIP-after = 0x389e76;
//              vtable @Helium 0x389e76 + 0x6c617a = 0xa4fff0.
//
// ── CLASS ROLE ─────────────────────────────────────────────────────────────
// A **solid-color procedural generator** — every output pixel of the tile is written to
// `paramSlots[+0x00] * paramSlots[+0x10]` (RGBA lane-wise product). No source input, no
// noise, no per-pixel variation. RenderFragment writes a single pixel using the incoming
// fragment's color at (HGFragment +0x90) times paramSlots[+0x00]. This is the "flat
// color fill" node — likely used as an input for compositor pipelines that need a solid
// plane at a given intensity (e.g. a mask fill or a per-tile constant).
//
// ── FIELD LAYOUT (extends HGNode3D — see raw-port/src/render/HGNode3D.ts) ──
//   +0x000..+0x197  HGNode3D base subobject (HGNode3D : HGNode : HGObject).
//   +0x010  int32 nodeFlags10 : HGNode-base flag word. Ctor mutates:
//                                nodeFlags10 = (nodeFlags10 & ~0x600) | 0x400.
//              Same idiom as HgcMultiplyAlpha's ctor — clears bits 9..10, sets bit 10.
//   +0x198  paramSlots       : pointer to a 32-byte block (`operator new(0x20)`) holding
//                              TWO 16-byte float4 slots:
//                                paramSlots[+0x00]  = "color"   (default {0, 0, 0, 0})
//                                paramSlots[+0x10]  = "gain"    (default {1, 1, 1, 1})
//                              SetParameter/GetParameter accept idx ∈ {0, 1}; writes to
//                              the 16-byte slot at (paramSlots + idx*16).
//
// ── CONSTANT VALUE (transcribed by direct byte-read of the Helium x86_64 slice) ──
//   @0x3c7c40  movaps 0x03ddb0(%rip)  @ ctor 0x389e89  -> RIP-after 0x389e90 + 0x3ddb0
//              = 0x3c7c40.  bytes = 00 00 80 3F  × 4  = { 1.0f, 1.0f, 1.0f, 1.0f }
//              (the same constant slot used by HgcDither_CPU's default_max).
//
// ── FRONTIER CALLEES (throw-stubbed) ───────────────────────────────────────
//   HGTile::Renderer() const              @0x389c63
//   HGRenderer::GetTarget(unsigned int)   @0x389c6d
//   HGNode::ClearBits()                   @0x389ff2  (used by SetParameter after mutation)
//   HGNode::GetProperty(int, unsigned int) @0x389de1 (tail-called by GetProperty)
//   HGNode3D::HGNode3D()                  @0x389e6a
//   HGNode3D::~HGNode3D()                 @0x389eb6
//   operator new(size_t)                  @0x389e7e (called by ctor)

import { HGNode3D } from "./HGNode3D.js";
import type { HGNode3D_VTable } from "./HGNode3D.js";
import type { HGRect } from "./HGRect.js";
import { HGRectNull, HGRectInfinite } from "./HGRect.js";

const f32 = Math.fround;

/**
 * `HgcRasterizerGenerator` vtable pointer in Helium __DATA_CONST.
 * @0x389e6f  `leaq 0x6c617a(%rip),%rax` → 0x389e76 + 0x6c617a = 0xa4fff0.
 */
export const HgcRasterizerGenerator_VTABLE_INSTALLED_PTR = 0xa4fff0 as const;

/**
 * The HgcRasterizerGenerator vtable object (models the vtable at Helium 0xa4fff0). Only
 * the HGNode3D-defined slot 0x230 is exposed by the base — we throw-stub it here since
 * the shipped binary uses a per-subclass slot0x230 implementation that we haven't
 * disassembled yet (it's referenced by HGNode3D::RenderTile's inner-loop dispatch, not
 * by HgcRasterizerGenerator's own overrides of RenderTile/RenderFragment).
 * @0xa4fff0
 */
export const HgcRasterizerGenerator_VTABLE: HGNode3D_VTable = {
  slot0x230(..._args: unknown[]): unknown {
    throw new Error(
      "HgcRasterizerGenerator vtable slot 0x230 @Helium 0xa4fff0 not yet transcribed" +
      " — subclass fragment-shader dispatch entry.",
    );
  },
};

/**
 * The AVX dispatch threshold — `cmpl $0x4700000, %eax` @0x389c72 (RenderTile),
 * also read directly out of the tile at @0x389b30 (RenderFragment's compare
 * against `tile[+0xe4]`).
 *   RenderTile uses `HGRenderer::GetTarget(0)`;
 *   RenderFragment reads a pre-computed target-class code at tile[+0xe4].
 * The two share the same threshold constant.
 * @0x389c72
 */
export const HGC_RASTERIZER_AVX_TARGET_THRESHOLD = 0x04700000 as const;

/**
 * The `gain` default (paramSlots +0x10) — read verbatim as 16 bytes at Helium 0x3c7c40.
 * All lanes = 1.0f.
 * @0x3c7c40
 */
export const HGC_RASTERIZER_DEFAULT_GAIN: readonly [number, number, number, number] = [
  f32(1.0), // @0x3c7c40 lane 0
  f32(1.0), // @0x3c7c44 lane 1
  f32(1.0), // @0x3c7c48 lane 2
  f32(1.0), // @0x3c7c4c lane 3
] as const;

/**
 * The `color` default (paramSlots +0x00) — written by `xorps %xmm0,%xmm0 ; movaps %xmm0,(%rax)`
 * at ctor 0x389e83..0x389e86.  All lanes = 0.0f.
 * @0x389e83
 */
export const HGC_RASTERIZER_DEFAULT_COLOR: readonly [number, number, number, number] = [
  f32(0.0),
  f32(0.0),
  f32(0.0),
  f32(0.0),
] as const;

/**
 * Property-ID probed by `GetProperty(id, u32)` @0x389dd0:
 *   0x389dd4  cmpl $0x14, %esi     ; id == 0x14?
 *   0x389dd7  jne 0x389de0         ;   no  -> tail-jmp HGNode::GetProperty
 *   0x389dd9  movl $0x1, %eax      ;   yes -> return 1
 * The class's ONE self-answered property is id=0x14; the value 1 signals "yes, I own it".
 * All other property IDs delegate to the HGNode base.
 * @0x389dd4
 */
export const HGC_RASTERIZER_OWNED_PROPERTY_ID = 0x14 as const;

// ────────────────────────────────────────────────────────────────────────────
// FRONTIER STUBS
// ────────────────────────────────────────────────────────────────────────────

/** @0x389c63  HGTile::Renderer() const — not yet transcribed. */
function HGTile_Renderer_stub(_tile: unknown): unknown {
  throw new Error(
    "HGTile::Renderer() const @0x389c63 not yet transcribed — virtual accessor on HGTile.",
  );
}

/** @0x389c6d  HGRenderer::GetTarget(unsigned int) — not yet transcribed. */
function HGRenderer_GetTarget_stub(_renderer: unknown, _idx: number): number {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) @0x389c6d not yet transcribed — need Helium HGRenderer port.",
  );
}

/** @0x389ff2  HGNode::ClearBits() — not yet transcribed. Invalidation hook. */
function HGNode_ClearBits_stub(_self: HgcRasterizerGenerator): void {
  throw new Error(
    "HGNode::ClearBits() @0x389ff2 not yet transcribed — HGNode invalidation base call.",
  );
}

/** @0x389de1  HGNode::GetProperty(int, unsigned int) — not yet transcribed. */
function HGNode_GetProperty_stub(_self: HgcRasterizerGenerator, _id: number, _v: number): number {
  throw new Error(
    "HGNode::GetProperty(int, unsigned int) @0x389de1 not yet transcribed — tail-jmp target from GetProperty.",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// STATE + STRUCT LAYOUT
// ────────────────────────────────────────────────────────────────────────────

/**
 * The 32-byte block pointed to by `paramSlots` at (+0x198). Two 16-byte float4 slots:
 *   paramSlots[+0x00]  = "color"   (SetParameter idx=0, GetParameter idx=0)
 *   paramSlots[+0x10]  = "gain"    (SetParameter idx=1, GetParameter idx=1)
 */
export interface HgcRasterizerGenerator_ParamSlots {
  /** paramSlots +0x00 — the "color" float4 (default {0,0,0,0} from xorps @0x389e83). */
  color: [number, number, number, number];
  /** paramSlots +0x10 — the "gain"  float4 (default {1,1,1,1} from @0x3c7c40 via @0x389e89). */
  gain: [number, number, number, number];
}

/**
 * The `HgcRasterizerGenerator` instance. Extends `HGNode3D`.
 */
export class HgcRasterizerGenerator extends HGNode3D {
  /** +0x010 — HGNode-base int32 flag word (bit-mask). Ctor sets it to (old & ~0x600) | 0x400. */
  public nodeFlags10: number;

  /** +0x198 — the 32-byte paramSlots block. */
  public paramSlots: HgcRasterizerGenerator_ParamSlots;

  /**
   * `HgcRasterizerGenerator::HgcRasterizerGenerator()` @Helium 0x389e60 (C1).
   *
   * Disasm summary:
   *   0x389e6a  callq  __ZN8HGNode3DC2Ev            ; HGNode3D::HGNode3D()
   *   0x389e6f  leaq   0x6c617a(%rip), %rax         ; vtable @Helium 0xa4fff0
   *   0x389e76  movq   %rax, (%rbx)                 ; *this = vtable
   *   0x389e79  movl   $0x20, %edi                  ; size = 0x20 = 32 bytes
   *   0x389e7e  callq  __Znwm                       ; raw = operator new(0x20)
   *   0x389e83  xorps  %xmm0, %xmm0                 ; xmm0 = {0, 0, 0, 0}
   *   0x389e86  movaps %xmm0, (%rax)                ; paramSlots[+0x00] = {0,0,0,0} (color)
   *   0x389e89  movaps 0x3ddb0(%rip), %xmm0         ; xmm0 = {1,1,1,1}  @Helium 0x3c7c40
   *   0x389e90  movaps %xmm0, 0x10(%rax)            ; paramSlots[+0x10] = {1,1,1,1} (gain)
   *   0x389e94  movq   %rax, 0x198(%rbx)            ; this->paramSlots = raw
   *   0x389e9b  movl   $0xfffff9ff, %eax
   *   0x389ea0  andl   0x10(%rbx), %eax             ; eax = nodeFlags10 & ~0x600
   *   0x389ea3  orl    $0x400, %eax                 ; eax |= 0x400
   *   0x389ea8  movl   %eax, 0x10(%rbx)             ; nodeFlags10 = (nodeFlags10 & ~0x600) | 0x400
   */
  public constructor() {
    // @0x389e6a HGNode3D::HGNode3D()  — passes the HgcRasterizerGenerator-specific
    // vtable object (models the vtable installed at *this by the leaq @0x389e6f).
    super(HgcRasterizerGenerator_VTABLE);
    void HgcRasterizerGenerator_VTABLE_INSTALLED_PTR; // @0x389e6f..0x389e76
    // @0x389e83..0x389e90 — populate default color/gain slots.
    this.paramSlots = {
      color: [
        HGC_RASTERIZER_DEFAULT_COLOR[0],
        HGC_RASTERIZER_DEFAULT_COLOR[1],
        HGC_RASTERIZER_DEFAULT_COLOR[2],
        HGC_RASTERIZER_DEFAULT_COLOR[3],
      ],
      gain: [
        HGC_RASTERIZER_DEFAULT_GAIN[0],
        HGC_RASTERIZER_DEFAULT_GAIN[1],
        HGC_RASTERIZER_DEFAULT_GAIN[2],
        HGC_RASTERIZER_DEFAULT_GAIN[3],
      ],
    };
    // @0x389e9b..0x389ea8 nodeFlags10 = (nodeFlags10 & ~0x600) | 0x400
    // The base HGNode3D ctor leaves +0x10 at whatever HGNode::Init/etc set it to; we start
    // from 0 here (the JS model doesn't yet track the exact HGNode-base initializer for +0x10).
    this.nodeFlags10 = 0;
    this.nodeFlags10 = ((this.nodeFlags10 & ~0x600) | 0x400) >>> 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SET / GET / GET-OUTPUT / GET-DOD / GET-ROI / GET-PROPERTY
// ────────────────────────────────────────────────────────────────────────────

/**
 * `HgcRasterizerGenerator::SetParameter(int idx, float x, float y, float z, float w)`
 *   @Helium 0x389f90.
 *
 * Disasm (37 lines):
 *   0x389f90  movl   $0xffffffff, %eax               ; default return = -1u
 *   0x389f95  cmpl   $0x1, %esi                      ; if idx > 1 (unsigned) -> retq (-1u)
 *   0x389f98  ja     0x389ffd
 *   0x389f9a  movq   0x198(%rdi), %rcx               ; rcx = this->paramSlots
 *   0x389fa1  movl   %esi, %edx                      ; edx = idx (as u32 via zero-ext)
 *   0x389fa3  shlq   $0x4, %rdx                      ; edx = idx * 16 (byte offset)
 *   0x389fa7  leaq   (%rcx,%rdx), %rax               ; rax = &paramSlots[idx*16]
 *   0x389fab..0x389fd9  ucomiss-equality chain:
 *               if (*(float*)(rax+0)  == xmm0
 *                && *(float*)(rax+4)  == xmm1
 *                && *(float*)(rax+8)  == xmm2
 *                && *(float*)(rax+12) == xmm3) return 0;         // all equal -> unchanged
 *               else fall through
 *               (Each ucomiss+setp+jne is the standard IEEE-754 "==" test; jne AND jp both
 *                jump on inequality-or-unordered, so the "no-change" path is taken only when
 *                the four lanes are all pairwise-equal and neither is NaN.)
 *   0x389fdb  pushq  %rbp; movq %rsp,%rbp
 *   0x389fdf..0x389fed  movss %xmm{0..3}, {0,4,8,12}(%rax)       ; write four new lanes
 *   0x389ff2  callq  HGNode::ClearBits()                          ; invalidate
 *   0x389ff7  movl   $0x1, %eax                                   ; return 1 (changed)
 *   0x389ffc  popq %rbp; retq
 *   0x389ffe  xorl %eax,%eax; retq                                ; the "unchanged" tail
 *
 * NB. `ucomiss` treats NaN as unordered → PF=1 → jp taken → jump to write path. That means
 * a NaN incoming value ALWAYS gets written (never treated as "equal to stored"). Matches
 * C++ semantics.
 * @0x389f90
 */
export function HgcRasterizerGenerator_SetParameter(
  self: HgcRasterizerGenerator,
  idx: number,
  x: number,
  y: number,
  z: number,
  w: number,
): number {
  // @0x389f90 movl $-1u,%eax ; @0x389f95 cmp $1,%esi ; @0x389f98 ja -> return -1u
  if ((idx >>> 0) > 1) return -1 | 0;

  // @0x389f9a rcx = paramSlots ; @0x389fa3 rdx = idx*16 ; @0x389fa7 rax = &slot
  const slot: [number, number, number, number] =
    (idx | 0) === 0 ? self.paramSlots.color : self.paramSlots.gain;

  // @0x389fab..0x389fd9 four-lane equality check (with NaN treated as unequal — see docstring).
  const nx = f32(x); const ny = f32(y); const nz = f32(z); const nw = f32(w);
  const s0 = f32(slot[0]); const s1 = f32(slot[1]);
  const s2 = f32(slot[2]); const s3 = f32(slot[3]);
  const allEqual =
    (s0 === nx) && !Number.isNaN(s0) && !Number.isNaN(nx) &&
    (s1 === ny) && !Number.isNaN(s1) && !Number.isNaN(ny) &&
    (s2 === nz) && !Number.isNaN(s2) && !Number.isNaN(nz) &&
    (s3 === nw) && !Number.isNaN(s3) && !Number.isNaN(nw);
  if (allEqual) return 0; // @0x389fd9 jnp -> tail return 0

  // @0x389fdf..0x389fed movss %xmm{0..3}, offsets
  slot[0] = nx; slot[1] = ny; slot[2] = nz; slot[3] = nw;
  // @0x389ff2 HGNode::ClearBits()
  HGNode_ClearBits_stub(self);
  // @0x389ff7 movl $1,%eax
  return 1;
}

/**
 * `HgcRasterizerGenerator::GetParameter(int idx, float* out)` @Helium 0x38a010.
 *
 * Disasm:
 *   0x38a010  movl   $0xffffffff, %eax
 *   0x38a015  cmpl   $0x1, %esi
 *   0x38a018  ja     0x38a058                        ; idx > 1 (unsigned) -> return -1u
 *   0x38a01e  movq   0x198(%rdi), %rax               ; rax = paramSlots
 *   0x38a025  movl   %esi, %ecx
 *   0x38a027  shlq   $0x4, %rcx                      ; rcx = idx*16
 *   0x38a02b..0x38a050  four `movss` reads: out[0..3] = paramSlots[idx*16 + 0,4,8,12]
 *   0x38a055  xorl   %eax, %eax                      ; return 0
 * @0x38a010
 */
export function HgcRasterizerGenerator_GetParameter(
  self: HgcRasterizerGenerator,
  idx: number,
  out: [number, number, number, number],
): number {
  // @0x38a015 cmp $1 ; @0x38a018 ja -> return -1u
  if ((idx >>> 0) > 1) return -1 | 0;
  const slot = (idx | 0) === 0 ? self.paramSlots.color : self.paramSlots.gain;
  // @0x38a02b..0x38a050
  out[0] = f32(slot[0]);
  out[1] = f32(slot[1]);
  out[2] = f32(slot[2]);
  out[3] = f32(slot[3]);
  // @0x38a055 xorl %eax,%eax
  return 0;
}

/**
 * `HgcRasterizerGenerator::GetOutput(HGRenderer*)` @Helium 0x38a060.
 *
 * Verbatim: `movq %rdi, %rax ; retq` — identity pass, returns this.
 * @0x38a064
 */
export function HgcRasterizerGenerator_GetOutput(self: HgcRasterizerGenerator): HgcRasterizerGenerator {
  return self;
}

/**
 * `HgcRasterizerGenerator::GetDOD(HGRenderer*, int outputIdx, HGRect inputDOD)` @Helium 0x389d80.
 *
 * Verbatim disasm:
 *   0x389d84  leaq _HGRectInfinite(%rip), %rax        ; rax = &HGRectInfinite (lo half addr)
 *   0x389d8b  leaq 0x8(%rax), %rcx                    ; rcx = &HGRectInfinite.hi
 *   0x389d8f  leaq _HGRectNull(%rip), %rsi            ; rsi = &HGRectNull.lo
 *   0x389d96  leaq 0x8(%rsi), %rdi                    ; rdi = &HGRectNull.hi
 *   0x389d9a  testl %edx, %edx                        ; edx = outputIdx (compared to 0)
 *   0x389d9c  cmoveq %rcx, %rdi                       ; if idx==0: rdi = &HGRectInfinite.hi
 *   0x389da0  cmoveq %rax, %rsi                       ; if idx==0: rsi = &HGRectInfinite.lo
 *   0x389da4  movq (%rdi), %rdx                       ; return.hi = *rdi
 *   0x389da7  movq (%rsi), %rax                       ; return.lo = *rsi
 *   0x389daa  popq %rbp; retq
 *
 * Semantics: `outputIdx == 0` → HGRectInfinite (this generator can fill any tile — infinite
 * DOD); any other idx → HGRectNull. Note NO dependence on the input DOD at all.
 * @0x389d80
 */
export function HgcRasterizerGenerator_GetDOD(
  _self: HgcRasterizerGenerator,
  _renderer: unknown,
  outputIdx: number,
  _inputDOD: HGRect,
): HGRect {
  // @0x389d9a testl ; @0x389d9c cmoveq -> idx==0 => Infinite else Null
  if ((outputIdx | 0) === 0) {
    return {
      x: HGRectInfinite.x,
      y: HGRectInfinite.y,
      right: HGRectInfinite.right,
      bottom: HGRectInfinite.bottom,
    };
  }
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcRasterizerGenerator::GetROI(HGRenderer*, int inputIdx, HGRect outputROI)`
 *   @Helium 0x389db0.
 *
 * Verbatim disasm (9 lines — the shortest possible):
 *   0x389db4  leaq _HGRectNull(%rip), %rcx
 *   0x389dbb  movq (%rcx), %rax                       ; rax = HGRectNull.lo
 *   0x389dbe  movq 0x8(%rcx), %rdx                    ; rdx = HGRectNull.hi
 *   0x389dc2  popq %rbp; retq
 *
 * ALWAYS returns HGRectNull — the generator has NO inputs, so its ROI for any input is
 * the empty rectangle. Matches "procedural source" semantics.
 * @0x389db0
 */
export function HgcRasterizerGenerator_GetROI(
  _self: HgcRasterizerGenerator,
  _renderer: unknown,
  _inputIdx: number,
  _outputROI: HGRect,
): HGRect {
  // @0x389dbb / 0x389dbe
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcRasterizerGenerator::GetProperty(int id, unsigned int arg)` @Helium 0x389dd0.
 *
 * Verbatim disasm:
 *   0x389dd4  cmpl $0x14, %esi              ; id == 0x14?
 *   0x389dd7  jne 0x389de0                  ;   no  -> tail-jmp HGNode::GetProperty
 *   0x389dd9  movl $0x1, %eax               ;   yes -> return 1
 *   0x389dde  popq %rbp; retq
 *   0x389de0  popq %rbp; jmp HGNode::GetProperty
 * @0x389dd0
 */
export function HgcRasterizerGenerator_GetProperty(
  self: HgcRasterizerGenerator,
  id: number,
  arg: number,
): number {
  // @0x389dd4 cmpl $0x14 ; @0x389dd7 jne -> delegate
  if ((id | 0) === HGC_RASTERIZER_OWNED_PROPERTY_ID) {
    // @0x389dd9 movl $1,%eax
    return 1;
  }
  // @0x389de0 tail-jmp HGNode::GetProperty
  return HGNode_GetProperty_stub(self, id, arg);
}

// ────────────────────────────────────────────────────────────────────────────
// TILE / FRAGMENT VIEWS (local models of consumed HGTile / HGFragment fields)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Local model of the HGTile fields consumed by RenderTile / RenderTile_AVX / RenderFragment:
 *   +0x00..+0x0c  int32 left / top / right / bottom
 *   +0x10  float* dstPtr        ; @0x389cb5 (`movq 0x10(%r14), %rsi`)
 *   +0x18  int32  dstStrideRows ; @0x389cb1 (`movslq 0x18(%r14), %rdx`), then shl 4
 *   +0xe4  int32  targetClassCode (pre-computed) ; @0x389b30 (`cmpl $0x4700000, 0xe4(%rsi)`)
 * NO src pointer is read — the generator is procedural.
 */
export interface HgcRasterizerGenerator_TileView {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** row-major float32 tile buffer + start offset + row-stride (in float32 lanes). */
  dst: {
    data: Float32Array;
    base: number;
    strideFloats: number;
  };
  /** @0x389b30 tile[+0xe4]: pre-computed CPU-target class code (used by RenderFragment's dispatch). */
  targetClassCode: number;
}

/**
 * Local model of the HGFragment fields consumed by RenderFragment_(AVX):
 *   +0x10  float* dstPtr        ; @0x389b49 (`movq 0x10(%rdx), %rax` — rdx == tile? actually rdx here is HGTile)
 *   +0x90  float4 srcColor      ; @0x389b4d (`movaps 0x90(%rsi), %xmm0` — rsi = HGFragment*)
 *
 * NB. RenderFragment's arg convention is `(HGFragment* frag, HGTile* tile)`, and the disasm at
 * 0x389b49 reads `0x10(%rdx)` — where `%rdx` is the *tile* (the caller's %rdx = 3rd arg).
 * Trace:
 *   Entry:  rdi = this, rsi = HGFragment*, rdx = HGTile*
 *   0x389b49  movq 0x10(%rdx), %rax       ; rax = tile[+0x10] = tile.dstPtr (the fragment's target)
 *   0x389b4d  movaps 0x90(%rsi), %xmm0    ; xmm0 = fragment[+0x90]
 *   0x389b54  movq 0x198(%rdi), %rcx      ; rcx = this->paramSlots
 *   0x389b5b  mulps (%rcx), %xmm0         ; xmm0 = fragment.srcColor * paramSlots[+0x00]
 *   0x389b5e  movaps %xmm0, (%rax)        ; *tile.dstPtr = xmm0
 * So the FRAGMENT writes to TILE.dst (a single pixel — the fragment's own target pixel).
 */
export interface HgcRasterizerGenerator_FragmentView {
  /** +0x90 — the fragment's source color float4 (RGBA). */
  srcColor: readonly [number, number, number, number];
}

// ────────────────────────────────────────────────────────────────────────────
// RENDER — the pure math: dst[i] = color * gain (per RGBA lane)
// ────────────────────────────────────────────────────────────────────────────

/**
 * `HgcRasterizerGenerator::RenderTile(HGTile*)` @Helium 0x389c50.
 *
 * Dispatch head (@0x389c50..0x389c84):
 *   0x389c63  call HGTile::Renderer()
 *   0x389c6d  call HGRenderer::GetTarget(0)          ; eax = targetClassCode
 *   0x389c72  cmpl $0x4700000, %eax
 *   0x389c77  jb 0x389c89                            ; SSE path
 *   0x389c7f  call RenderTile_AVX ; jmp 0x389d64     ; else AVX + return 0
 *
 * SSE path (@0x389c89..0x389d63):
 *   height = tile[+0xc] - tile[+0x4]        ; @0x389c89/8d
 *   if height <= 0: return 0                 ; @0x389c91
 *   width  = tile[+0x8] - tile[+0x0]         ; @0x389c97/9b
 *   if width  <= 0: return 0                 ; @0x389c9e (testl+jle)
 *   xmm0 = paramSlots[+0x10]                 ; @0x389cad  (gain — LOADED ONCE)
 *   rsi  = tile.dstPtr                       ; @0x389cb5
 *   rdx  = tile.dstStrideRows << 4           ; @0x389cb1 + 0x389cc9 (byte-stride)
 *   r8d  = width & 0x7ffffffe                ; @0x389cbe  (rounded-down-even width)
 *
 *   For each row (r10d from 0..height, advancing rsi += rdx / r9 += rdx):
 *     if width == 1 -> skip 2-per-iter loop and go directly to the odd-tail
 *     else:
 *       Two-pixel-per-iter loop @0x389d10..0x389d40:
 *          xmm1 = paramSlots[+0x00]                  ; RELOADED every iter
 *          xmm1 = xmm1 * xmm0                        ; color * gain
 *          dst[+0x00] = xmm1
 *          xmm1 = paramSlots[+0x00]                  ; RELOADED again
 *          xmm1 = xmm1 * xmm0
 *          dst[+0x10] = xmm1
 *          advance dst += 0x20 ; r11 += 2
 *          while r11 < (width & ~1) -> loop
 *     Odd-tail if width & 1:
 *          xmm1 = paramSlots[+0x00]
 *          xmm1 = xmm1 * xmm0
 *          dst[(width-1)*16] = xmm1
 *
 * Note the reload of `paramSlots[+0x00]` inside the loop is a compiler artifact (no
 * aliasing proof for `mulps %xmm0,%xmm1` writing back through the same buffer). The
 * FUNCTIONAL result is `dst[px] = paramSlots[+0x00] * paramSlots[+0x10]` for every pixel.
 * @0x389c50
 */
export function HgcRasterizerGenerator_RenderTile(
  self: HgcRasterizerGenerator,
  tile: HgcRasterizerGenerator_TileView,
): number {
  // @0x389c63 tile.Renderer(); @0x389c6d GetTarget(0)  — kept as a probe (see stubs above).
  const renderer = HgcRasterizerGenerator_RenderTile_dispatchProbe(tile);
  const targetClassCode = HgcRasterizerGenerator_RenderTile_getTargetProbe(renderer, 0);
  // @0x389c72 cmpl $0x4700000 ; @0x389c77 jb -> SSE
  if (targetClassCode >= HGC_RASTERIZER_AVX_TARGET_THRESHOLD) {
    // @0x389c7f jmp -> AVX tail-call
    return HgcRasterizerGenerator_RenderTile_AVX(self, tile);
  }

  // @0x389c89 height = bottom - top
  const height = (tile.bottom | 0) - (tile.top | 0);
  if (height <= 0) return 0; // @0x389c91 jle -> return 0

  // @0x389c97 width = right - left
  const width = (tile.right | 0) - (tile.left | 0);
  if (width <= 0) return 0; // @0x389c9e testl+jle -> return 0

  // @0x389cad xmm0 = paramSlots[+0x10]  (gain, LOADED ONCE)
  const gain = self.paramSlots.gain;
  const color = self.paramSlots.color; // reloaded inside loop in asm — functionally constant
  const g0 = f32(gain[0]); const g1 = f32(gain[1]);
  const g2 = f32(gain[2]); const g3 = f32(gain[3]);
  const c0 = f32(color[0]); const c1 = f32(color[1]);
  const c2 = f32(color[2]); const c3 = f32(color[3]);
  // @0x389d17..0x389d1e mulps ; dst = color * gain, per lane.
  const p0 = f32(c0 * g0);
  const p1 = f32(c1 * g1);
  const p2 = f32(c2 * g2);
  const p3 = f32(c3 * g3);

  const dst = tile.dst;
  const strideFloats = dst.strideFloats | 0;

  // Row loop @0x389ce0..0x389cec
  for (let row = 0; row < height; row++) {
    const rowBase = dst.base + row * strideFloats;
    // Per-pixel fill — the 2-per-iter unroll + odd-tail + width==1 special path all
    // write the same 4-lane product to every pixel.
    for (let px = 0; px < width; px++) {
      const i = rowBase + px * 4;
      dst.data[i    ] = p0;
      dst.data[i + 1] = p1;
      dst.data[i + 2] = p2;
      dst.data[i + 3] = p3;
    }
  }
  // @0x389d64 xor eax,eax ; retq
  return 0;
}

/**
 * `HgcRasterizerGenerator::RenderTile_AVX(HGTile*)` @Helium 0x389b70.
 *
 * Same per-pixel math as the SSE version. The AVX path uses `vmulps` on xmm registers (not
 * ymm — the disasm shows only xmm-shaped movaps/vmulps, so lane width is 4 floats). The
 * outer loop has the same 2-per-iter + odd-tail shape @0x389bf0..0x389c1e.
 *
 * Prologue @0x389b70..0x389b83:
 *   height = tile[+0xc] - tile[+0x4]     ; if <= 0 -> vzeroupper; return 0
 *   width  = tile[+0x8] - tile[+0x0]     ; if <= 0 -> vzeroupper; return 0
 *   xmm0   = paramSlots[+0x10]           ; @0x389b99 (gain — LOADED ONCE)
 * Inner (same as SSE with vmulps): xmm1 = paramSlots[+0x00] * xmm0 ; dst = xmm1.
 * @0x389b70
 */
export function HgcRasterizerGenerator_RenderTile_AVX(
  self: HgcRasterizerGenerator,
  tile: HgcRasterizerGenerator_TileView,
): number {
  // @0x389b70 height = bottom - top ; @0x389b76 jle -> return 0
  const height = (tile.bottom | 0) - (tile.top | 0);
  if (height <= 0) return 0;
  // @0x389b7c width = right - left ; @0x389b83 jle -> return 0
  const width = (tile.right | 0) - (tile.left | 0);
  if (width <= 0) return 0;

  const gain = self.paramSlots.gain;
  const color = self.paramSlots.color;
  // @0x389bf7 vmulps (paramSlots), xmm0 -> xmm1 (per-lane color*gain)
  const p0 = f32(f32(color[0]) * f32(gain[0]));
  const p1 = f32(f32(color[1]) * f32(gain[1]));
  const p2 = f32(f32(color[2]) * f32(gain[2]));
  const p3 = f32(f32(color[3]) * f32(gain[3]));

  const dst = tile.dst;
  const strideFloats = dst.strideFloats | 0;

  // Row loop @0x389bc0..0x389bcc
  for (let row = 0; row < height; row++) {
    const rowBase = dst.base + row * strideFloats;
    for (let px = 0; px < width; px++) {
      const i = rowBase + px * 4;
      dst.data[i    ] = p0;
      dst.data[i + 1] = p1;
      dst.data[i + 2] = p2;
      dst.data[i + 3] = p3;
    }
  }
  // @0x389c43 vzeroupper ; xor eax,eax ; retq
  return 0;
}

/**
 * `HgcRasterizerGenerator::RenderFragment(HGFragment*, HGTile*)` @Helium 0x389b30.
 *
 * Disasm:
 *   0x389b30  cmpl $0x4700000, 0xe4(%rsi)             ; note: rsi = HGFragment, rdx = HGTile.
 *                                                       Wait — see NB below.
 *   0x389b3a  jb   0x389b49                            ; if targetCode < THRESHOLD -> SSE path
 *   0x389b40  callq RenderFragment_AVX                 ; else AVX
 *   0x389b46  xor  eax,eax ; retq
 *   0x389b49  movq   0x10(%rdx), %rax                  ; rax = tile.dstPtr
 *   0x389b4d  movaps 0x90(%rsi), %xmm0                 ; xmm0 = fragment.srcColor (@+0x90)
 *   0x389b54  movq   0x198(%rdi), %rcx                 ; rcx = paramSlots
 *   0x389b5b  mulps  (%rcx), %xmm0                     ; xmm0 = fragment.srcColor * color
 *   0x389b5e  movaps %xmm0, (%rax)                     ; *tile.dstPtr = xmm0
 *   0x389b61  xor    eax,eax ; retq
 *
 * NB. The threshold read at 0x389b30 uses `0xe4(%rsi)`, where the SysV ABI here is:
 *   rdi = this, rsi = HGFragment*, rdx = HGTile*.
 * That means `0xe4(HGFragment*)` — the target-class code is CACHED IN THE FRAGMENT itself
 * (not the tile), at offset +0xe4. This is different from RenderTile which fetches it via
 * `HGTile::Renderer()` + `HGRenderer::GetTarget(0)`. We model this local read as a
 * `fragment.targetClassCode` field.
 *
 * NOTE ON WRITE TARGET. The SSE body writes to `tile[+0x10]`, but the caller passes the
 * fragment separately — so this really is "compute fragment's output into the tile's dst
 * slot". The gain slot is NOT used; only color * fragment.srcColor.
 * @0x389b30
 */
export function HgcRasterizerGenerator_RenderFragment(
  self: HgcRasterizerGenerator,
  fragment: HgcRasterizerGenerator_FragmentView & { targetClassCode: number },
  tile: HgcRasterizerGenerator_TileView,
): number {
  // @0x389b30 cmpl $0x4700000, 0xe4(HGFragment) ; @0x389b3a jb -> SSE
  if ((fragment.targetClassCode | 0) >= HGC_RASTERIZER_AVX_TARGET_THRESHOLD) {
    // @0x389b40 callq RenderFragment_AVX
    return HgcRasterizerGenerator_RenderFragment_AVX(self, fragment, tile);
  }
  // @0x389b49..0x389b5e
  const color = self.paramSlots.color;
  const src = fragment.srcColor;
  const p0 = f32(f32(src[0]) * f32(color[0]));
  const p1 = f32(f32(src[1]) * f32(color[1]));
  const p2 = f32(f32(src[2]) * f32(color[2]));
  const p3 = f32(f32(src[3]) * f32(color[3]));
  const d = tile.dst;
  const i = d.base;
  d.data[i    ] = p0;
  d.data[i + 1] = p1;
  d.data[i + 2] = p2;
  d.data[i + 3] = p3;
  // @0x389b61 xor eax,eax ; retq
  return 0;
}

/**
 * `HgcRasterizerGenerator::RenderFragment_AVX(HGFragment*, HGTile*)` @Helium 0x389b00.
 *
 * Same math as SSE RenderFragment, but with `vmovaps` + `vmulps` and a `vzeroupper`
 * before returning:
 *   0x389b04  movq   0x10(%rdx), %rax               ; rax = tile.dstPtr
 *   0x389b08  vmovaps 0x90(%rsi), %xmm0             ; xmm0 = fragment.srcColor
 *   0x389b10  movq   0x198(%rdi), %rcx              ; rcx = paramSlots
 *   0x389b17  vmulps (%rcx), %xmm0, %xmm0           ; xmm0 = fragment.srcColor * color
 *   0x389b1b  vmovaps %xmm0, (%rax)                 ; *dst = xmm0
 *   0x389b1f  vzeroupper ; xor eax,eax ; retq
 * @0x389b00
 */
export function HgcRasterizerGenerator_RenderFragment_AVX(
  self: HgcRasterizerGenerator,
  fragment: HgcRasterizerGenerator_FragmentView,
  tile: HgcRasterizerGenerator_TileView,
): number {
  // @0x389b04..0x389b1b
  const color = self.paramSlots.color;
  const src = fragment.srcColor;
  const p0 = f32(f32(src[0]) * f32(color[0]));
  const p1 = f32(f32(src[1]) * f32(color[1]));
  const p2 = f32(f32(src[2]) * f32(color[2]));
  const p3 = f32(f32(src[3]) * f32(color[3]));
  const d = tile.dst;
  const i = d.base;
  d.data[i    ] = p0;
  d.data[i + 1] = p1;
  d.data[i + 2] = p2;
  d.data[i + 3] = p3;
  // @0x389b1f vzeroupper ; xor eax,eax ; retq
  return 0;
}

// ────────────────────────────────────────────────────────────────────────────
// DISPATCH PROBES — isolate the two virtual-callee frontier calls
// ────────────────────────────────────────────────────────────────────────────

/** @0x389c63 HGTile::Renderer() const — probe (throws until decoded). */
function HgcRasterizerGenerator_RenderTile_dispatchProbe(_tile: HgcRasterizerGenerator_TileView): unknown {
  return HGTile_Renderer_stub(_tile);
}

/** @0x389c6d HGRenderer::GetTarget(unsigned int) — probe (throws until decoded). */
function HgcRasterizerGenerator_RenderTile_getTargetProbe(renderer: unknown, idx: number): number {
  return HGRenderer_GetTarget_stub(renderer, idx);
}
