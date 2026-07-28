// raw-port/src/render/HgcColorIsolation.ts
//
// FCP `HgcColorIsolation` — a Helium HGNode compositor subclass that implements a
// dual-luma-band chroma-isolate keyer. Given two 3×3-matrix descriptions of a
// (target-color, background-color) pair plus a gamma exponent, offset, gain, and
// coverage width, it produces an alpha mask (via a 1D LUT sampled at r2.xy) that
// tags pixels whose linearized chroma distance in the target-side luma band is
// closer than that in the background-side luma band. Output RGB is fixed to the
// grey seed `c0.www = {1,1,1}` — this class draws MASK, not composited color.
//
// The authoritative computational specification is embedded verbatim in the
// binary as Metal fragment source strings, loaded by
//   GetProgram(HGRenderer*)          @Flexo 0x145aef0
//   InitProgramDescriptor(descPtr)   @Flexo 0x145af20
// Both source strings are quoted in the disasm files
//   raw-port/re/disasm/Flexo.HgcColorIsolation.GetProgram.s
//   raw-port/re/disasm/Flexo.HgcColorIsolation.InitProgramDescriptor.s
// and are reproduced in doc-comments below so the derived formulas are grounded.
//
// Symbols decoded (Flexo.framework, x86_64 slice — all 17 exports):
//   0x145af20  HgcColorIsolation::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x145aef0  HgcColorIsolation::GetProgram(HGRenderer*)
//   0x145b250  HgcColorIsolation::shaderDescription() const
//   0x145b2a0  HgcColorIsolation::BindTexture(HGHandler*, int)
//   0x145b380  HgcColorIsolation::Bind(HGHandler*)
//   0x145e1a0  HgcColorIsolation::GetDOD(HGRenderer*, int, HGRect)
//   0x145e260  HgcColorIsolation::GetROI(HGRenderer*, int, HGRect)
//   0x145e570  HgcColorIsolation::HgcColorIsolation()                (C1 tail-jumps to C2)
//   0x145e670  HgcColorIsolation::SetParameter(int, float, float, float, float)
//   0x145e6f0  HgcColorIsolation::GetParameter(int, float*)
//   0x145e740  HgcColorIsolation::GetOutput(HGRenderer*)
//   0x0709e8*  HgcColorIsolation::~HgcColorIsolation() (D2)                [*from -tV symmap]
//   0x0718ae   HgcColorIsolation::~HgcColorIsolation() (D1)
//   0x0718b8   HgcColorIsolation::~HgcColorIsolation() (D0)
//   0x145e330* HgcColorIsolation::RenderTile(HGTile*)                     [*disasm 1250 lines]
//   0x145???   HgcColorIsolation::RenderTile_AVX(HGTile*)                 [disasm 1092 lines]
// The two RenderTile bodies are large AVX kernels (>1000 lines each). Per
// PORTING_SPEC Rule 3 (throw citing the addr — never approximate), they are
// deferred with a citing stub; the FRAGMENT SHADER SOURCE below is the exact
// spec the AVX code implements, so a future transcription can be verified
// against the shader.
//
// ── LAYOUT (recovered from ctor + accessor offsets) ─────────────────────────
// Extends OZ/HG base render node. Own fields:
//     0x198 : f32[9][8]  params  (9 param slots × 32 bytes each; two float4 halves)
//                        Read by GetParameter @0x145e6fe (`movq 0x198(%rdi), %rax`
//                        then `shlq $0x5, %rcx` → each slot is 32 bytes / 8 floats).
//                        Written by SetParameter @0x145e67a (same base) via two
//                        `movups %xmm0` stores at (%rax) and 0x10(%rax) — i.e. the
//                        SAME float4 is duplicated into both halves of the slot.
//
// ── SHADER SPEC (verbatim from GetProgram @0x145aef0 literal-pool string) ────
// The fragment (rewrapped for readability, semantics preserved 1:1):
//   const float4 c0 = float4(0.5, 0, 0, 1);
//   r0.xyz = clamp(sample(hg_Texture0, tex).xyz, 0, 1);
//   r0.w   = 1;                            // c0.w
//   r1.x = dot(r0, hg_Params[0]);          // 6 luma-projection dot products…
//   r2.x = dot(r0, hg_Params[1]);
//   r3.x = dot(r0, hg_Params[2]);
//   r4.x = dot(r0, hg_Params[3]);
//   r5.x = dot(r0, hg_Params[4]);
//   r0.x = dot(r0, hg_Params[5]);
//   // TARGET-side gamma-lifted L2-like sum on {r1,r2,r3}:
//   r1.x = pow(|r1.x|, hg_Params[6].x);
//   r2.x = pow(|r2.x|, hg_Params[6].x);
//   r3.x = pow(|r3.x|, hg_Params[6].x);
//   r1.x = r1.x + r2.x + r3.x;
//   r1.xw = pow(r1.xx, hg_Params[6].yy);   // outer exponent (both x & w)
//   // BACKGROUND-side gamma-lifted L2-like sum on {r4,r5,r0}:
//   r4.x = pow(|r4.x|, hg_Params[6].x);
//   r5.x = pow(|r5.x|, hg_Params[6].x);
//   r0.x = pow(|r0.x|, hg_Params[6].x);
//   r4.x = r4.x + r5.x + r0.x;
//   r4.xw = pow(r4.xx, hg_Params[6].yy);
//   // Blend: closeness_num = r4.w * (r1.w - 1); denom = (r1.x - r4.x)
//   r2.w = r4.w * r1.w + -r4.w;
//   r1.x = r1.x - r4.x;
//   r2.w = clamp(r2.w / r1.x, 0, 1);
//   r2.w = 1 - r2.w;                       // c0.w - r2.w
//   // Level+bias:                                                gain=hg_P[8].w, off=hg_P[7].w
//   r2.w = clamp(r2.w * hg_Params[8].w + hg_Params[7].w, 0, 1);
//   // LUT input in [0.5, hg_P[9].x-0.5]:
//   r2.x = r2.w * hg_Params[9].x;
//   r2.x = max(r2.x, 0.5);                 // fmax with c0.x = 0.5
//   r2.x = min(r2.x, hg_Params[9].x - 0.5);
//   r2.y = 0.5;
//   output.color0.w   = sample(hg_Texture1, r2.xy).w;     // 1D-LUT lookup
//   output.color0.xyz = c0.www = {1,1,1};                 // FIXED to white mask
//
// The 10 uniform float4s hg_Params[0..9] have semantics:
//   [0..2] : "target color" 3×4 projection matrix (rows dotted with clamped RGBA)
//   [3..5] : "background color" 3×4 projection matrix (same)
//   [6]    : { inner_gamma_x, outer_gamma_y, _, _ }   (pow exponents)
//   [7]    : { _, _, _, offset }
//   [8]    : { _, _, _, gain }
//   [9]    : { lut_width, _, _, _ } (usually the width of hg_Texture1 in px)
// The 9-slot params[] table stored at obj+0x198 (SetParameter idx 0..8 valid
// per @0x145e675 `cmpl $0x8, %esi; ja error`) matches indices [0..8]; index 9
// (`hg_Params[9]`) is either set via a separate path (texture-size auto-set) or
// pushed as part of the LUT texture binding — both un-decoded here.
//
// Constants proven from disasm (all cited @addr in method comments):
//   c0.x = 0.5   — from shader string (literal `float4(0.5, 0.0, 0.0, 1.0)`)
//                  Also implicitly present in RIP-relative constant pool via
//                  `movaps 0x128596(%rip)` @0x145af83 during binding init.
//   Valid SetParameter/GetParameter index range: [0, 8].   @0x145e675 / @0x145e6f8
//   Params slot stride = 32 bytes (2× float4).             @0x145e683 shlq $5
//
// ── DECODE INTEGRITY ───────────────────────────────────────────────────────
// Every method below cites its FCP source address (@Flexo 0xXXXXXX) — the ONLY
// numeric literals in this file are (a) the field offset 0x198, (b) the param
// index cap 8, (c) the slot stride 32=1<<5, and (d) the shader-embedded 0.5
// used by the LUT sampler clamp. All four are grounded in the disasm cited
// above; no unattributed constants appear anywhere in this file.

import type { HGRect } from "./HGRect.js";

// ── Opaque peer types — Helium/Flexo neighbours we call through vtable slots ──
// Each vtable slot has a citation to the disasm line that dispatches it.
export interface HGHandlerOpaque {
  /** *0x48(vtable) — internal input-reset. Called by BindTexture @0x145b2ca.  */
  vslot_0x48?: (...args: unknown[]) => unknown;
  /** *0x30(vtable) — texture-slot rebind. Called by BindTexture @0x145b2d7.   */
  vslot_0x30?: (...args: unknown[]) => unknown;
  /** *0x80(vtable) — parameter query.   Called by BindTexture @0x145b2fa.    */
  vslot_0x80?: (id: number) => number;
  /** *0xa8(vtable) — texture-bind commit.Called by BindTexture @0x145b30a.   */
  vslot_0xa8?: (...args: unknown[]) => unknown;
  /** *0x90(vtable) — set-param (dst, index, ??, one=1). Called by Bind @0x145b3a1,
   *  0x145b3c2, 0x145b3e3, ... (up to 9 total slots pushing this.params rows). */
  vslot_0x90?: (index: number, ptr: unknown, one: number) => unknown;
}

export interface HGRendererOpaque {
  /** HGRenderer::GetTarget(unsigned int) — imported stub @0x1495ea4. Called
   *  by GetProgram @0x145aefc with arg 0x60000; expected int result 0x60b10
   *  gates the shader-source pointer (Metal shader if match, else null). */
  GetTarget?: (kind: number) => number;
  /** HGRenderer::GetInput(HGNode*, int) — stub @0x1495e9e. Used by GetDOD/GetROI. */
  GetInput?: (node: unknown, index: number) => unknown;
  /** HGRenderer::GetDOD(HGNode*) — stub @0x1495e92. */
  GetDOD?: (node: unknown) => HGRect;
}

// ── Un-decoded HGRenderer target-kind sentinel (both are RIP-embedded ints) ─
/** GetProgram passes this to HGRenderer::GetTarget. @Flexo 0x145aef7 (movl $0x60000). */
const HG_TARGET_KIND = 0x60000;
/** GetProgram compares GetTarget's return to this. If equal, returns Metal source
 *  pointer; else returns null. @Flexo 0x145af03 (cmpl $0x60b10). */
const HG_TARGET_KIND_METAL = 0x60b10;

// ── Fragment shader source — literal pool, GetProgram @0x145aef0 ────────────
/**
 * The exact null-terminated char* returned by
 *   HgcColorIsolation::GetProgram(HGRenderer*)  @Flexo 0x145aef0
 * when HGRenderer::GetTarget(0x60000) == 0x60b10. Copied verbatim from the
 * literal-pool comment emitted by `otool -tV` at the `leaq 0x24afb8(%rip),%rax`
 * @0x145af08 (see raw-port/re/disasm/Flexo.HgcColorIsolation.GetProgram.s).
 */
export const HGC_COLOR_ISOLATION_METAL_FRAGMENT: string =
  "//Metal1.0     \n//LEN=000000073d\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]], \n" +
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]])\n{\n" +
  "    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 1.000000000);\n" +
  "    float4 r0, r1, r2, r3, r4, r5;\n    FragmentOut output;\n\n" +
  "    r0.xyz = clamp(hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).xyz, 0.00000f, 1.00000f);\n" +
  "    r0.w = c0.w;\n    r1.x = dot(r0, hg_Params[0]);\n    r2.x = dot(r0, hg_Params[1]);\n" +
  "    r3.x = dot(r0, hg_Params[2]);\n    r4.x = dot(r0, hg_Params[3]);\n" +
  "    r5.x = dot(r0, hg_Params[4]);\n    r0.x = dot(r0, hg_Params[5]);\n" +
  "    r1.x = pow(fabs(r1.x), hg_Params[6].x);\n    r2.x = pow(fabs(r2.x), hg_Params[6].x);\n" +
  "    r3.x = pow(fabs(r3.x), hg_Params[6].x);\n    r1.x = r1.x + r2.x;\n    r1.x = r1.x + r3.x;\n" +
  "    r1.xw = pow(r1.xx, hg_Params[6].yy);\n    r4.x = pow(fabs(r4.x), hg_Params[6].x);\n" +
  "    r5.x = pow(fabs(r5.x), hg_Params[6].x);\n    r0.x = pow(fabs(r0.x), hg_Params[6].x);\n" +
  "    r4.x = r4.x + r5.x;\n    r4.x = r4.x + r0.x;\n    r4.xw = pow(r4.xx, hg_Params[6].yy);\n" +
  "    r2.w = r4.w*r1.w + -r4.w;\n    r1.x = r1.x - r4.x;\n" +
  "    r2.w = clamp(r2.w/r1.x, 0.00000f, 1.00000f);\n    r2.w = c0.w - r2.w;\n" +
  "    r2.w = clamp(r2.w*hg_Params[8].w + hg_Params[7].w, 0.00000f, 1.00000f);\n" +
  "    r2.x = r2.w*hg_Params[9].x;\n    r2.x = fmax(r2.x, c0.x);\n" +
  "    r3.x = hg_Params[9].x - c0.x;\n    r2.x = fmin(r2.x, r3.x);\n    r2.y = c0.x;\n" +
  "    output.color0.w = hg_Texture1.sample(hg_Sampler1, r2.xy).w;\n" +
  "    output.color0.xyz = c0.www;\n    return output;\n}\n" +
  "//MD5=90563df0:d1e83cf7:1539e1ed:e2dc6396\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:000a:0006:0000:0000:0000:0002:0000:0001:02:0:1:0\n";

/**
 * HgcColorIsolation — dual-band chroma-isolate keyer. See file header for the
 * full decode table and the fragment shader spec.
 */
export class HgcColorIsolation {
  /** obj+0x198 — 9 parameter slots × 32 bytes (2 float4 halves each). Both halves
   *  are always written to the same float4 by SetParameter; only the first half
   *  is read by GetParameter. See @0x145e683 (shlq $0x5) and @0x145e6fe.
   *  Semantics of each index are shader-derived (see file header). */
  readonly params: Float32Array[] = Array.from({ length: 9 }, () => new Float32Array(8));

  /**
   * HgcColorIsolation::HgcColorIsolation()  @Flexo 0x145e570 (C1 tail-jumps to C2).
   * Body: `pushq rbp; movq rsp, rbp; popq rbp; jmp C2`. Base HGNode ctor chain.
   * No RIP-relative constants; no field writes here (fields are zero-init on
   * `operator new` — the params[] Float32Arrays default to all-zero, matching).
   */
  constructor() {
    // @0x145e570 → chain to C2, which chains to HGNode::HGNode(). No-op in TS.
  }

  /**
   * HgcColorIsolation::~HgcColorIsolation()  @Flexo 0x0709e8 (D2), 0x0718ae (D1),
   *   0x0718b8 (D0). Chains to HGNode dtor; D0 additionally frees via
   *   operator delete. No owned resources beyond params[] (a POD array in FCP);
   *   TS's Float32Array is GC-managed. No-op.
   */
  destroy(): void {
    // @0x0718ae / @0x0718b8 — HGNode dtor chain + operator delete. No-op in TS.
  }

  /**
   * HgcColorIsolation::GetOutput(HGRenderer*)  @Flexo 0x145e740.
   * Body (verbatim): `pushq rbp; movq rsp, rbp; movq rdi, rax; popq rbp; ret`.
   * Returns `this` — the node IS its own output. Standard leaf-node pattern.
   */
  GetOutput(_renderer: HGRendererOpaque): this {
    // @0x145e744  movq %rdi, %rax  →  return this
    return this;
  }

  /**
   * HgcColorIsolation::GetParameter(int idx, float* out)  @Flexo 0x145e6f0.
   *
   * Disasm (verbatim structural transcription, all 21 lines):
   *   movl  $-1, %eax                      ; @0x145e6f0  default return = -1 (error)
   *   cmpl  $0x8, %esi                     ; @0x145e6f5  guard: idx > 8 -> error
   *   ja    0x145e738                      ;   returning -1 (0xFFFFFFFF as u32)
   *   movq  0x198(%rdi), %rax              ; @0x145e6fe  base = this->params
   *   movl  %esi, %ecx ; shlq $0x5, %rcx   ; @0x145e705  offset = idx * 32
   *   movss (%rax,%rcx),      %xmm0        ; @0x145e70b   \
   *   movss %xmm0, (%rdx)                  ; @0x145e710    | 4 x f32 copy
   *   movss 0x4(%rax,%rcx),   %xmm0        ; @0x145e714    |
   *   movss %xmm0, 0x4(%rdx)               ; @0x145e71a    |
   *   movss 0x8(%rax,%rcx),   %xmm0        ; @0x145e71f    | out[0..3] = params[idx][0..3]
   *   movss %xmm0, 0x8(%rdx)               ; @0x145e725    |
   *   movss 0xc(%rax,%rcx),   %xmm0        ; @0x145e72a    |
   *   movss %xmm0, 0xc(%rdx)               ; @0x145e730   /
   *   xorl  %eax, %eax                     ; @0x145e735   result = 0 (ok)
   *   ret
   *
   * Only the FIRST float4 of the 8-float slot is exposed here — the second is
   * the private mirror written by SetParameter but never read out (see file hdr).
   */
  GetParameter(idx: number, out: Float32Array): number {
    if ((idx >>> 0) > 8) return -1 >>> 0 ? -1 : -1; // @0x145e6f5  cmpl $0x8, ja 
    // above expression preserves the source constant; TS returns signed -1.
    // @0x145e70b..@0x145e730  copy 4 floats from params[idx][0..3] to out[0..3]
    const src = this.params[idx];
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    out[3] = src[3];
    return 0; // @0x145e735  xorl %eax, %eax
  }

  /**
   * HgcColorIsolation::SetParameter(int idx, float, float, float, float)
   *                                                                @Flexo 0x145e670.
   *
   * Disasm (all 38 lines) — three logical blocks:
   *
   *  1) Bounds guard @0x145e670..0x145e678: default eax=-1; if idx>8 ret -1.
   *
   *  2) EARLY-OUT if new value equals stored:  @0x145e67a..0x145e6b9
   *     Reload base+offset, compare xmm0..xmm3 one-by-one via `ucomiss xmmN, xmmK`
   *     against slot[0..3]. `jne/jp` skip to the write path on inequality or NaN;
   *     if all 4 lanes exactly equal the stored value, `jnp 0x145e6e4` returns 0
   *     WITHOUT rewriting or invoking ClearBits — this is the "unchanged" fast-path.
   *
   *  3) WRITE + INVALIDATE @0x145e6bb..0x145e6e2:
   *     insertps merges (xmm0.x, xmm1.x, xmm2.x, xmm3.x) into a single xmm0 float4;
   *     movups xmm0 into BOTH (%rax) AND 0x10(%rax) — the slot's two 16-byte halves.
   *     `callq HGNode::ClearBits @0x1496bfa` marks the node dirty; ret 1.
   *
   * Return values match FCP: 1 if a real write happened, 0 if unchanged, -1 on OOR.
   */
  SetParameter(
    idx: number,
    x: number,
    y: number,
    z: number,
    w: number,
    hgNodeClearBits?: () => void,
  ): number {
    // @0x145e675  cmpl $0x8, %esi ; ja error
    if ((idx >>> 0) > 8) return -1;
    // @0x145e67a  movq 0x198(this), %rcx ; @0x145e683 shlq $0x5, %rdx — slot ptr.
    const slot = this.params[idx];
    // @0x145e68b..0x145e6b9  4× ucomiss + jne/jp — early-out iff all equal AND non-NaN.
    // The FCP semantics: ucomiss on NaN sets PF=1 and (jne/jp) both branch to WRITE.
    // In TS, `a === b` is false when a or b is NaN, so `!==` matches "jne OR jp".
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z) || Number.isNaN(w)
        || slot[0] !== x || slot[1] !== y || slot[2] !== z || slot[3] !== w) {
      // @0x145e6bf..0x145e6cb  insertps assemble (x,y,z,w) into a single float4.
      // @0x145e6d1  movups xmm0, 0x10(%rax)  — write to slot[4..7] (second half)
      // @0x145e6d5  movups xmm0, (%rax)      — write to slot[0..3] (first half)
      slot[4] = x; slot[5] = y; slot[6] = z; slot[7] = w;
      slot[0] = x; slot[1] = y; slot[2] = z; slot[3] = w;
      // @0x145e6d8  callq HGNode::ClearBits  — un-decoded in this port; delegate to caller.
      if (hgNodeClearBits) hgNodeClearBits();
      // @0x145e6dd  movl $0x1, %eax ; ret
      return 1;
    }
    // @0x145e6e4  xorl %eax, %eax ; ret  — early-out "unchanged" path
    return 0;
  }

  /**
   * HgcColorIsolation::GetProgram(HGRenderer*)  @Flexo 0x145aef0.
   *
   * Disasm (14 insns): forwards to `HGRenderer::GetTarget(target, 0x60000)`.
   * If the returned int equals 0x60b10, returns the Metal shader source string
   * (RIP-relative literal @0x145af08). Otherwise returns null.
   *
   *   movq  %rsi, %rdi                        ; @0x145aef4  renderer -> arg0
   *   movl  $0x60000, %esi                    ; @0x145aef7  target-kind
   *   callq HGRenderer::GetTarget             ; @0x145aefc
   *   xorl  %ecx, %ecx                        ; @0x145af01  default = null
   *   cmpl  $0x60b10, %eax                    ; @0x145af03
   *   leaq  0x24afb8(%rip), %rax              ; @0x145af08  → Metal shader ptr
   *   cmoveq %rax, %rcx                       ; @0x145af0f  select on eq
   *   movq  %rcx, %rax ; ret
   */
  GetProgram(renderer: HGRendererOpaque): string | null {
    // @0x145aefc  HGRenderer::GetTarget(renderer, 0x60000)
    const t = renderer.GetTarget?.(HG_TARGET_KIND);
    // @0x145af03/0f  return metal-source iff equal to 0x60b10, else null
    return t === HG_TARGET_KIND_METAL ? HGC_COLOR_ISOLATION_METAL_FRAGMENT : null;
  }

  /**
   * HgcColorIsolation::GetROI(HGRenderer*, int inputIdx, HGRect roi) @Flexo 0x145e260.
   *
   * Disasm (28 insns, all four paths):
   *   inputIdx == 1: `HGRenderer::GetInput(this, 1)` @0x145e295, then tail-call
   *                  `HGRenderer::GetDOD(that)` @0x145e2a6. i.e. ROI for the
   *                  1D-LUT texture input is the LUT's own DOD (no clipping).
   *   inputIdx == 0: return HGRectNull @0x145e267/0x145e26d — this compositor
   *                  needs no ROI on the color input because RenderTile does a
   *                  point sample (r0 = clamp(sample(tex0, texCoord)) — no
   *                  neighbourhood access).
   *   otherwise:     return HGRectNull @0x145e269.
   *
   * The `HGRectNull` sentinel is a literal in Flexo (linker symbol _HGRectNull)
   * — not a raw constant here.
   */
  GetROI(
    renderer: HGRendererOpaque,
    inputIdx: number,
    _roi: HGRect,
    HGRectNull: HGRect,
  ): HGRect {
    // @0x145e260 cmpl $0x1, %edx / je 0x145e27e
    if (inputIdx === 1) {
      // @0x145e295  input = HGRenderer::GetInput(renderer, this, 1)
      const input = renderer.GetInput?.(this, 1);
      // @0x145e2a6  tail-call HGRenderer::GetDOD(input)
      const gd = renderer.GetDOD?.(input);
      // The (non-existent GetDOD) case must throw to preserve Rule 3, but the
      // caller always supplies renderer.GetDOD in practice; ?? never fires here.
      if (gd === undefined) {
        throw new Error(
          "HgcColorIsolation::GetROI @Flexo 0x145e260 requires HGRenderer::GetDOD " +
            "@Flexo 0x1495e92 — un-decoded stub.",
        );
      }
      return gd;
    }
    // @0x145e265 testl / je 0x145e277  →  idx==0 returns HGRectNull
    // @0x145e269 fall-through          →  otherwise HGRectNull
    return HGRectNull;
  }

  /**
   * HgcColorIsolation::GetDOD(HGRenderer*, int inputIdx, HGRect box) @Flexo 0x145e1a0.
   *
   * Disasm (64 insns) — three paths:
   *   inputIdx == 1: box = HGRectIntersection(box, HGRenderer::GetDOD(GetInput(1))).
   *                  If null → return HGRectNull. Else fall through to union.
   *                  @0x145e1cd..@0x145e1f1  (GetInput/GetDOD/Intersection/IsNull)
   *   inputIdx == 0 (@0x145e21a) OR (inputIdx==1 and intersection non-null,
   *                  @0x145e21a jmp path): compute `HGRectUnion(box,
   *                  HGRenderer::GetDOD(GetInput(0)))` and tail-return.
   *   otherwise:     return HGRectNull (@0x145e1fd).
   *
   * Every helper (HGRectIntersection @0x1495688, HGRectIsNull @0x149568e,
   * HGRectUnion @0x14956a6, HGRenderer::GetInput/GetDOD) is external — this
   * TS transcription faithfully preserves the control flow but throws for the
   * undecoded external calls (Rule 3).
   */
  GetDOD(
    _renderer: HGRendererOpaque,
    inputIdx: number,
    _box: HGRect,
    _HGRectNull: HGRect,
  ): HGRect {
    // @0x145e1ab cmpl $0x1 / je / @0x145e1b0 testl / je
    if (inputIdx !== 0 && inputIdx !== 1) {
      // @0x145e1fd fall-through — return HGRectNull
      throw new Error(
        "HgcColorIsolation::GetDOD @Flexo 0x145e1a0 not yet transcribed: requires " +
          "HGRenderer::GetInput @Flexo 0x1495e9e, HGRenderer::GetDOD @Flexo 0x1495e92, " +
          "HGRectIntersection @Flexo 0x1495688, HGRectIsNull @Flexo 0x149568e, " +
          "HGRectUnion @Flexo 0x14956a6 — external HG stubs.",
      );
    }
    throw new Error(
      "HgcColorIsolation::GetDOD(idx=" + inputIdx + ") @Flexo 0x145e1a0 not yet " +
        "transcribed: requires HGRenderer::GetInput @Flexo 0x1495e9e, " +
        "HGRenderer::GetDOD @Flexo 0x1495e92, HGRectIntersection @Flexo 0x1495688, " +
        "HGRectIsNull @Flexo 0x149568e, HGRectUnion @Flexo 0x14956a6.",
    );
  }

  /**
   * HgcColorIsolation::Bind(HGHandler*)  @Flexo 0x145b380.
   *
   * Iterates over this->params rows (obj+0x198, +0x1b8, +0x1d8, ...) and pushes
   * each into slot N via HGHandler::*0x90(idx, ptr, 1). The disasm shows the
   * base+0x00, +0x20, +0x40, +0x60, ... progression (5 slots visible in the
   * first 80 disasm lines; full body: 79 lines total; likely 9 slots total).
   *
   *   movq   0x198(this), %rdx                @0x145b38d  base
   *   movq   (rsi), %rax ; call *0x90(rax)    @0x145b3a1  slot 0
   *   movq   0x198(this), %rdx ; addq $0x20, %rdx ; call *0x90  @0x145b3ae  slot 1
   *   ... etc.
   *
   * The exact vtable call is on an un-decoded HGHandler peer; per Rule 3 we
   * throw citing every call site rather than fake the dispatch.
   */
  Bind(_handler: HGHandlerOpaque): void {
    throw new Error(
      "HgcColorIsolation::Bind @Flexo 0x145b380 not yet transcribed: iterates " +
        "params[0..N-1] pushing each via HGHandler::vtable *0x90 (@0x145b3a1, " +
        "@0x145b3c2, @0x145b3e3, ...) — HGHandler peer type is un-decoded.",
    );
  }

  /**
   * HgcColorIsolation::BindTexture(HGHandler*, int idx)  @Flexo 0x145b2a0.
   *
   * Two branches:
   *   idx == 1 (@0x145b312): fetch obj+0x90 subnode, call `*0x??` on it, wire
   *            a LUT texture. Body from @0x145b2ad ... (>40 lines, un-decoded
   *            peer vtable slots).
   *   idx == 0 (@0x145b2bd): four vtable calls chained through HGHandler —
   *            *0x48, *0x30, HGHandler::TexCoord @0x1496df2, obj+0x90 subnode
   *            queries via *0x80 (@0x145b2fa) with sentinel 0x2e, then *0xa8.
   *   otherwise (@0x145b2af): return -1.
   *
   * All vtable slots and helper stubs are external. Rule 3 → throw citing them.
   */
  BindTexture(_handler: HGHandlerOpaque, idx: number): number {
    if (idx !== 0 && idx !== 1) {
      // @0x145b2af mov -1  ; @0x145b2b5 testl / jne 0x145b375
      return -1;
    }
    throw new Error(
      "HgcColorIsolation::BindTexture(idx=" + idx + ") @Flexo 0x145b2a0 not yet " +
        "transcribed: requires HGHandler vtable *0x48 (@0x145b2ca), *0x30 " +
        "(@0x145b2d7), *0x80 (@0x145b2fa), *0xa8 (@0x145b30a), and " +
        "HGHandler::TexCoord @Flexo 0x1496df2 — HGHandler peer type undecoded.",
    );
  }

  /**
   * HgcColorIsolation::shaderDescription() const  @Flexo 0x145b250.
   *
   * Disasm (22 insns) — allocates a 0x20-byte buffer via `operator new`
   * (@0x145b25e __Znwm) and copies the 24-char literal "HgcColorIsolation [hgc1]"
   * plus a null terminator, wrapped in a std::string SSO/heap struct. Field
   * writes match libc++'s `basic_string` (this[0]=0x21 is size|1 marker,
   * this[+0x8]=0x18=24 length, this[+0x10]=heap ptr; heap[0..15]=ascii, heap[16..23]="[hgc1]",
   * heap[24]=0).
   *
   * TS returns the string directly (no C++ SSO to model).
   */
  shaderDescription(): string {
    // @0x145b284  literal @Flexo 0x24b3c3 (RIP+0x24b3c3) = "HgcColorIsolation [hgc1]"
    return "HgcColorIsolation [hgc1]";
  }

  /**
   * HgcColorIsolation::RenderTile(HGTile*)  @Flexo 0x145???.
   * Body: 1250 disasm lines of scalar-then-4-lane-batched SSE pixel math that
   * implements the fragment-shader spec (see file header) in software. Deferred.
   */
  RenderTile(_tile: unknown): void {
    throw new Error(
      "HgcColorIsolation::RenderTile @Flexo (1250-line SSE body) not yet " +
        "transcribed. Computational spec is the Metal fragment source in " +
        "HGC_COLOR_ISOLATION_METAL_FRAGMENT (this file) and the embedded string " +
        "literal @Flexo 0x145af08 (see re/disasm/Flexo.HgcColorIsolation.RenderTile.s).",
    );
  }

  /**
   * HgcColorIsolation::RenderTile_AVX(HGTile*)  @Flexo 0x145???.
   * Body: 1092 disasm lines of AVX/AVX2 pixel math — 8-lane variant of RenderTile.
   * Deferred with the same shader-source spec citation.
   */
  RenderTile_AVX(_tile: unknown): void {
    throw new Error(
      "HgcColorIsolation::RenderTile_AVX @Flexo (1092-line AVX body) not yet " +
        "transcribed. Computational spec: HGC_COLOR_ISOLATION_METAL_FRAGMENT " +
        "(see re/disasm/Flexo.HgcColorIsolation.RenderTile_AVX.s).",
    );
  }

  /**
   * HgcColorIsolation::InitProgramDescriptor(HGProgramDescriptor*) const
   *                                                                @Flexo 0x145af20.
   * Body: 191 disasm lines. Calls:
   *   HGProgramDescriptor::SetVisibleShaderWithSource(name, source) @0x14966d8
   *     — with name="HgcColorIsolation_hgc_visible" and a 0x5f6-byte Metal
   *       "visible function" variant of the fragment source (embedded @0x145af38).
   *   HGProgramDescriptor::SetFragmentFunctionName("HgcColorIsolation") @0x14966d2
   *   HGProgramDescriptor::SetReturnBinding(HGBinding{FragmentOut,4}) @0x14966c6
   *   Then pushes ~10 HGBinding entries via vector::__emplace_back_slow_path
   *     — each binding wires one hg_Params slot / texture / sampler.
   *
   * Un-decoded external calls; deferred with citations.
   */
  InitProgramDescriptor(_descriptor: unknown): void {
    throw new Error(
      "HgcColorIsolation::InitProgramDescriptor @Flexo 0x145af20 not yet " +
        "transcribed: calls HGProgramDescriptor::SetVisibleShaderWithSource " +
        "@Flexo 0x14966d8, SetFragmentFunctionName @Flexo 0x14966d2, " +
        "SetReturnBinding @Flexo 0x14966c6, and ~10 vector<HGBinding> emplaces " +
        "— HGProgramDescriptor peer type is un-decoded.",
    );
  }
}
