// raw-port/src/render/HgcBT2390_Gain_Sat_ToneAdj.ts
//
// FCP `HgcBT2390_Gain_Sat_ToneAdj` — a Helium HGNode compositor node that
// applies a BT.2390-family HDR gain/saturation/tone adjustment. It takes an
// RGB(A) input, computes a BT.2020 luminance-like weighted-power sum, then
// scales the RGB by the ratio (normalized-weight / full-weight) and multiplies
// by 12.0. All constants are HARDCODED in the fragment shader — this class
// exposes NO Set/GetParameter interface (both return -1 unconditionally).
//
// The authoritative computational specification is embedded verbatim in the
// binary as a Metal fragment source string, loaded by
//   GetProgram(HGRenderer*)  @Helium 0x35e050
// The source is quoted in raw-port/re/disasm/Helium.HgcBT2390_Gain_Sat_ToneAdj.GetProgram.s
// and reproduced verbatim below in HGC_BT2390_METAL_FRAGMENT.
//
// Symbols decoded (Helium.framework, x86_64 slice — all 17 exports):
//   0x35e050  GetProgram(HGRenderer*)
//   0x35e2a0  shaderDescription() const
//   0x35e2f0  BindTexture(HGHandler*, int)
//   0x35e360  Bind(HGHandler*)
//   0x35f5e0  GetDOD(HGRenderer*, int, HGRect)
//   0x35f600  GetROI(HGRenderer*, int, HGRect)
//   0x35f9b0  HgcBT2390_Gain_Sat_ToneAdj()      (C1; tail-jumps to C2)
//   0x35fac0  GetParameter(int, float*)         (unconditional return -1)
//   0x35fab0  SetParameter(int, f, f, f, f)     (unconditional return -1)
//   0x35fad0  GetOutput(HGRenderer*)            (returns this)
//   0x35????  RenderTile(HGTile*)               [530-line SSE body; deferred]
//   0x35????  RenderTile_AVX(HGTile*)           [435-line AVX body; deferred]
//   0x35????  InitProgramDescriptor(descPtr)    [127-line binding setup; deferred]
//   ~HgcBT2390_Gain_Sat_ToneAdj (D0/D1/D2)      [HGNode dtor chain + operator delete]
//
// ── LAYOUT ───────────────────────────────────────────────────────────────
// No own fields. Extends HGNode. All shader constants are literal float4s
// in the compiled Metal source; nothing to store per-instance.
//
// ── SHADER SPEC (verbatim from GetProgram literal-pool string @0x35e068) ──
//   const float4 c0 = float4(0.0000000000, 0.2649999857, 1.100000024, 0.6779980063);
//   const float4 c1 = float4(0.05930199847, 1.000000000, 12.00000000, 0.2626999915);
//     ↳ c1.xw = (0.0593, 0.2627)  and c0.wy = (0.678, 0.265) are the BT.2020
//       luminance coefficients (Y = 0.2627·R + 0.6780·G + 0.0593·B) — the
//       three fixed BT.2020 primary weights. c0.z = 1.1 is the tone-adjust
//       exponent (BT.2390 gamma-lift). c1.z = 12.0 is the output brightness
//       multiplier. c0.x = 0.0 is the max()-floor.
//
//   r0 = sample(hg_Texture0, texCoord0);
//   r0 = fmax(r0, 0);                          // clamp negative to zero (c0.x=0)
//   r1.xyz = r0.xyz * 0.265;                   // c0.yyy
//   r0.xy = pow(r1.xy, 1.1);                   // c0.zz  — gamma-lift R,G
//   r0.z = r0.y * 0.678;                       // c0.w   — weighted G
//   r1.w = r0.x * 0.2627 + r0.z;               // c1.w = 0.2627, sum1 = 0.2627·R^p + 0.678·G^p
//   r1.y = r1.y * 0.678;                       // r1.y (=0.265·r0.y) becomes 0.265·G·0.678
//   r1.x = r1.x * 0.2627 + r1.y;               // r1.x (=0.265·r0.x) → 0.2627·(0.265·R) + 0.678·(0.265·G)
//   r0.z = pow(r1.z, 1.1);                     // gamma-lift B
//   r1.w = r0.z * 0.0593 + r1.w;               // c1.x = 0.0593, sum1 += 0.0593·B^p
//   r1.x = r1.z * 0.0593 + r1.x;               // sum2 += 0.0593·(0.265·B)
//   r1.x = r1.x / r1.w;                        // ratio = sum2 / sum1
//   r1.x = select(1.0, r1.x, -r1.w < 0);       // c1.y = 1.0; if r1.w > 0 keep r1.x else 1.0
//   r0.xyz = r0.xyz * r1.xxx;                  // NOTE: r0.x, r0.y are pow(0.265R,1.1)/pow(0.265G,1.1)
//                                              //        but r0.z was overwritten to pow(0.265B,1.1)
//                                              //        so all three lanes are the gamma-lifted primaries
//   output.color0.xyz = r0.xyz * 12.0;         // c1.zzz
//   output.color0.w   = r0.w;                  // alpha pass-through
//
// The core mapping is:
//   Y_low  = 0.2627·(0.265·R)     + 0.678·(0.265·G)     + 0.0593·(0.265·B)
//   Y_high = 0.2627·(0.265·R)^1.1 + 0.678·(0.265·G)^1.1 + 0.0593·(0.265·B)^1.1
//   gain   = (Y_high > 0) ? Y_low / Y_high : 1.0
//   rgb    = pow(0.265 · rgb, 1.1) · gain · 12.0     // per-channel
// i.e. a per-pixel BT.2020-weighted gamma normalization ("BT.2390 tone adjust
// with saturation preservation").

import type { HGRect } from "./HGRect.js";

// ── HGRenderer target-kind sentinels (@0x35e057 / @0x35e063) ────────────────
/** HGRenderer::GetTarget kind requested by GetProgram. @Helium 0x35e057. */
const HG_TARGET_KIND = 0x60000;
/** Expected GetTarget result gating Metal shader source. @Helium 0x35e063. */
const HG_TARGET_KIND_METAL = 0x60b10;

/**
 * The exact null-terminated char* returned by GetProgram(HGRenderer*) @0x35e050
 * when HGRenderer::GetTarget(0x60000) == 0x60b10. Copied verbatim from the
 * literal-pool comment emitted by `otool -tV` at
 *   `leaq 0x6551c7(%rip),%rax`  @Helium 0x35e068.
 * See raw-port/re/disasm/Helium.HgcBT2390_Gain_Sat_ToneAdj.GetProgram.s.
 */
export const HGC_BT2390_METAL_FRAGMENT: string =
  "//Metal1.0     \n//LEN=0000000469\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n" +
  "    const float4 c0 = float4(0.000000000, 0.2649999857, 1.100000024, 0.6779980063);\n" +
  "    const float4 c1 = float4(0.05930199847, 1.000000000, 12.00000000, 0.2626999915);\n" +
  "    float4 r0, r1;\n    FragmentOut output;\n\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    r0 = fmax(r0, c0.xxxx);\n" +
  "    r1.xyz = r0.xyz*c0.yyy;\n    r0.xy = pow(r1.xy, c0.zz);\n    r0.z = r0.y*c0.w;\n" +
  "    r1.w = r0.x*c1.w + r0.z;\n    r1.y = r1.y*c0.w;\n    r1.x = r1.x*c1.w + r1.y;\n" +
  "    r0.z = pow(r1.z, c0.z);\n    r1.w = r0.z*c1.x + r1.w;\n" +
  "    r1.x = r1.z*c1.x + r1.x;\n    r1.x = r1.x/r1.w;\n" +
  "    r1.x = select(c1.y, r1.x, -r1.w < 0.00000f);\n" +
  "    r0.xyz = r0.xyz*r1.xxx;\n    output.color0.xyz = r0.xyz*c1.zzz;\n" +
  "    output.color0.w = r0.w;\n    return output;\n}\n" +
  "//MD5=2c714e19:97ce859d:2d1a1eb0:61cf40b1\n" +
  "//SIG=00000000:00000001:00000001:00000000:0002:0000:0002:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

// ── Opaque peer types ──────────────────────────────────────────────────────
export interface HGRendererOpaque {
  /** HGRenderer::GetTarget(unsigned int) — external stub. @0x35e05c. */
  GetTarget?: (kind: number) => number;
}
export interface HGHandlerOpaque {
  /** *0xc0(vtable) — the sole slot invoked by Bind @0x35e367. */
  vslot_0xc0?: () => unknown;
  /** *0x48(vtable) — invoked by BindTexture @0x35e30f (idx==0 path). */
  vslot_0x48?: (...args: unknown[]) => unknown;
  /** *0x30(vtable) — invoked by BindTexture @0x35e31c. */
  vslot_0x30?: (...args: unknown[]) => unknown;
  /** *0x80(vtable) — invoked by BindTexture @0x35e33f, queried with sentinel 0x2e. */
  vslot_0x80?: (sentinel: number) => number;
  /** *0xa8(vtable) — invoked by BindTexture @0x35e34f (bind commit). */
  vslot_0xa8?: (...args: unknown[]) => unknown;
}

/**
 * HgcBT2390_Gain_Sat_ToneAdj — BT.2390 gain/saturation/tone adjustment node.
 * See file header for the full 17-symbol decode table and shader-derived math.
 */
export class HgcBT2390_Gain_Sat_ToneAdj {
  /**
   * HgcBT2390_Gain_Sat_ToneAdj::HgcBT2390_Gain_Sat_ToneAdj()  @Helium 0x35f9b0.
   * Body (5 insns): `pushq rbp; movq rsp, rbp; popq rbp; jmp C2`. C2 chains to
   * HGNode base ctor. No RIP-relative constants, no per-instance fields to init.
   */
  constructor() {
    // @0x35f9b0 → C2 → HGNode::HGNode(). No-op in TS.
  }

  /**
   * ~HgcBT2390_Gain_Sat_ToneAdj()  (D0/D1/D2). HGNode dtor chain; D0 additionally
   * calls operator delete. No owned resources — TS no-op.
   */
  destroy(): void {
    // HGNode dtor chain + (D0) operator delete. No-op in TS.
  }

  /**
   * GetOutput(HGRenderer*)  @Helium 0x35fad0.
   * Body (verbatim): `pushq rbp; movq rsp, rbp; movq rdi, rax; popq rbp; ret`.
   * Returns `this`. Standard leaf-node pattern.
   */
  GetOutput(_renderer: HGRendererOpaque): this {
    // @0x35fad4  movq %rdi, %rax  →  return this
    return this;
  }

  /**
   * GetParameter(int, float*)  @Helium 0x35fac0.
   * Body (verbatim): `pushq rbp; movq rsp, rbp; movl $-1, %eax; popq rbp; ret`.
   * Unconditionally returns -1. This class exposes NO tunable parameters; all
   * numerics are baked into the fragment shader (see file header).
   */
  GetParameter(_idx: number, _out: Float32Array): number {
    return -1; // @0x35fac4  movl $0xffffffff, %eax
  }

  /**
   * SetParameter(int, float, float, float, float)  @Helium 0x35fab0.
   * Body (verbatim): same shape as GetParameter — unconditional -1 return.
   * No-op setter; all constants are shader-baked.
   */
  SetParameter(_idx: number, _x: number, _y: number, _z: number, _w: number): number {
    return -1; // @0x35fab4  movl $0xffffffff, %eax
  }

  /**
   * GetProgram(HGRenderer*)  @Helium 0x35e050.
   * Body (14 insns, verbatim structure):
   *   movq  rsi, rdi                       ; @0x35e054  renderer -> arg0
   *   movl  $0x60000, esi                  ; @0x35e057  target-kind
   *   callq HGRenderer::GetTarget          ; @0x35e05c
   *   xorl  ecx, ecx                       ; @0x35e061  default = null
   *   cmpl  $0x60b10, eax                  ; @0x35e063
   *   leaq  0x6551c7(%rip), rax            ; @0x35e068  → Metal source ptr
   *   cmoveq rax, rcx                      ; @0x35e06f  select on eq
   *   movq  rcx, rax ; ret
   */
  GetProgram(renderer: HGRendererOpaque): string | null {
    // @0x35e05c  HGRenderer::GetTarget(renderer, 0x60000)
    const t = renderer.GetTarget?.(HG_TARGET_KIND);
    // @0x35e063/6f  return metal source iff equal to 0x60b10, else null
    return t === HG_TARGET_KIND_METAL ? HGC_BT2390_METAL_FRAGMENT : null;
  }

  /**
   * GetDOD(HGRenderer*, int inputIdx, HGRect box)  @Helium 0x35f5e0.
   * Body (verbatim, 13 insns):
   *   movq  rcx, rax                       ; @0x35f5e0  rax = box.lo
   *   testl edx, edx ; je 0x35f5fa         ; @0x35f5e3  if idx == 0, skip
   *   leaq  _HGRectNull(%rip), rcx         ; @0x35f5eb
   *   movq  (rcx), rax ; movq 0x8(rcx), r8 ; @0x35f5f2  return HGRectNull
   *   movq  r8, rdx ; ret                  ; idx==0 falls through: return box unchanged
   *
   * Semantics: idx==0 → return input box verbatim (this node's DOD = input DOD).
   *            idx!=0 → HGRectNull (no other inputs).
   */
  GetDOD(
    _renderer: HGRendererOpaque,
    inputIdx: number,
    box: HGRect,
    HGRectNull: HGRect,
  ): HGRect {
    // @0x35f5e3  testl %edx, %edx ; je fall-through
    if (inputIdx === 0) return box;
    // @0x35f5eb  return HGRectNull
    return HGRectNull;
  }

  /**
   * GetROI(HGRenderer*, int inputIdx, HGRect box)  @Helium 0x35f600.
   * Body (verbatim, 13 insns) — identical shape to GetDOD:
   *   idx==0 → return box unchanged (point-sample compositor; ROI == box).
   *   idx!=0 → HGRectNull.
   */
  GetROI(
    _renderer: HGRendererOpaque,
    inputIdx: number,
    box: HGRect,
    HGRectNull: HGRect,
  ): HGRect {
    // @0x35f603  testl %edx, %edx ; je fall-through
    if (inputIdx === 0) return box;
    // @0x35f60b  return HGRectNull
    return HGRectNull;
  }

  /**
   * Bind(HGHandler*)  @Helium 0x35e360.
   * Body (verbatim, 9 insns): a single virtual dispatch —
   *   movq  (%rdi), %rax                   ; @0x35e364  vtable
   *   callq *0xc0(%rax)                    ; @0x35e367  → HGHandler *0xc0
   *   xorl  %eax, %eax ; ret               ; returns 0
   *
   * Only one vtable slot exercised. The peer type is un-decoded; per Rule 3 we
   * throw with the citation rather than fake the dispatch.
   */
  Bind(_handler: HGHandlerOpaque): number {
    throw new Error(
      "HgcBT2390_Gain_Sat_ToneAdj::Bind @Helium 0x35e360 not yet transcribed: " +
        "dispatches HGHandler vtable *0xc0 @0x35e367 — HGHandler peer type undecoded.",
    );
  }

  /**
   * BindTexture(HGHandler*, int idx)  @Helium 0x35e2f0.
   * Body (41 insns) — two branches:
   *   idx != 0: return -1  (@0x35e2f7 default ebx=-1; @0x35e2fe testl/jne → return)
   *   idx == 0: chained vtable dispatches on HGHandler and this->subnode@0x90 —
   *             *0x48 (@0x35e30f), *0x30 (@0x35e31c), HGHandler::TexCoord
   *             @0x35e32b, subnode *0x80 query with sentinel 0x2e (@0x35e33f),
   *             finally *0xa8 (@0x35e34f). Returns 0 on success.
   *
   * All vtable slots + HGHandler::TexCoord are external; deferred per Rule 3.
   */
  BindTexture(_handler: HGHandlerOpaque, idx: number): number {
    // @0x35e2fc  testl %edx, %edx ; jne 0x35e355 (return -1 fall-through)
    if (idx !== 0) return -1;
    throw new Error(
      "HgcBT2390_Gain_Sat_ToneAdj::BindTexture(idx=0) @Helium 0x35e2f0 not yet " +
        "transcribed: requires HGHandler vtable *0x48 (@0x35e30f), *0x30 " +
        "(@0x35e31c), *0x80 (@0x35e33f), *0xa8 (@0x35e34f) and " +
        "HGHandler::TexCoord @Helium 0x35e32b — HGHandler peer type undecoded.",
    );
  }

  /**
   * shaderDescription() const  @Helium 0x35e2a0.
   *
   * Disasm (22 insns) — allocates a 0x28-byte buffer via `operator new`
   * (@0x35e2ae __Znwm) and copies the 33-char literal
   * "HgcBT2390_Gain_Sat_ToneAdj [hgc1]" plus a null terminator, wrapped in a
   * std::string SSO/heap struct (this[0]=0x29 size|1 marker, this[+0x8]=0x21 length=33,
   * this[+0x10]=heap ptr; heap[0..15]="HgcBT2390_Gain_S", heap[16..31]="at_ToneAdj [hgc1]",
   * heap[32]=']' terminator... actually `movw $0x5d, 0x20(%rax)` writes 0x5d ']' + 0x00 nul).
   *
   * TS returns the string directly.
   */
  shaderDescription(): string {
    // @0x35e2d1  literal @Helium 0x655400+RIP = "HgcBT2390_Gain_Sat_ToneAdj [hgc1]"
    // (first 16 chars from @0x35e2d1, next 16 from @0x35e2c6, "]" nul from @0x35e2db)
    return "HgcBT2390_Gain_Sat_ToneAdj [hgc1]";
  }

  /**
   * RenderTile(HGTile*)  @Helium 0x35????.
   * Body: 530 disasm lines of scalar-then-SSE pixel math implementing the
   * shader-spec above in software. Deferred (Rule 3) — the shader source is
   * the authoritative computational spec.
   */
  RenderTile(_tile: unknown): void {
    throw new Error(
      "HgcBT2390_Gain_Sat_ToneAdj::RenderTile @Helium (530-line SSE body) not " +
        "yet transcribed. Computational spec: HGC_BT2390_METAL_FRAGMENT " +
        "(see re/disasm/Helium.HgcBT2390_Gain_Sat_ToneAdj.RenderTile.s).",
    );
  }

  /**
   * RenderTile_AVX(HGTile*)  @Helium 0x35????.
   * Body: 435 disasm lines of AVX pixel math (8-lane variant of RenderTile).
   * Deferred with same shader-source spec citation.
   */
  RenderTile_AVX(_tile: unknown): void {
    throw new Error(
      "HgcBT2390_Gain_Sat_ToneAdj::RenderTile_AVX @Helium (435-line AVX body) " +
        "not yet transcribed. Computational spec: HGC_BT2390_METAL_FRAGMENT " +
        "(see re/disasm/Helium.HgcBT2390_Gain_Sat_ToneAdj.RenderTile_AVX.s).",
    );
  }

  /**
   * InitProgramDescriptor(HGProgramDescriptor*) const  @Helium 0x35????.
   * Body: 127 disasm lines. Calls
   *   HGProgramDescriptor::SetVisibleShaderWithSource(name, source),
   *   SetFragmentFunctionName(name),
   *   SetReturnBinding(HGBinding{...}),
   * and pushes HGBinding entries for the two texture uniforms hg_Texture0/hg_Sampler0.
   * No hg_Params bindings (this class exposes no tunable params). Deferred (Rule 3).
   */
  InitProgramDescriptor(_descriptor: unknown): void {
    throw new Error(
      "HgcBT2390_Gain_Sat_ToneAdj::InitProgramDescriptor @Helium (127-line body) " +
        "not yet transcribed: requires HGProgramDescriptor::SetVisibleShaderWithSource, " +
        "SetFragmentFunctionName, SetReturnBinding, and vector<HGBinding> emplaces — " +
        "HGProgramDescriptor peer type undecoded.",
    );
  }
}
