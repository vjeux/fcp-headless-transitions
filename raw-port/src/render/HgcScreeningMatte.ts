// raw-port/src/render/HgcScreeningMatte.ts
//
// FCP `HgcScreeningMatte` — Flexo compositor node that produces a "screening
// matte": a chroma-key-adjacent operator that suppresses spill by pulling one
// of two linear chroma gains based on the sign of the per-channel screening
// parameters, then mixes the RGB result with the original by the alpha of a
// second input texture. Subclass of Helium `HGNode`.
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// The class holds all of its state in a single 0x127-byte block allocated by
// operator new[] (@0x146d1fe) then aligned to a 32-byte boundary via a
// negative-address trick (@0x146d203..0x146d214) that stashes the raw pointer
// at buf[-8] for later `delete[]`. The aligned pointer is stored at
// this+0x198. The buffer layout below is proved by ctor movaps writes and
// the SetParameter/GetParameter accessors.
//
// Symbols owned by this class (17 total; ledger for "HgcScreeningMatte"):
//   @Flexo 0x146d1e0  HgcScreeningMatte::HgcScreeningMatte()             [C1]
//   @Flexo 0x146d0f0  HgcScreeningMatte::HgcScreeningMatte()             [C2 — same body]
//   @Flexo 0x146d2d0  HgcScreeningMatte::~HgcScreeningMatte()            [D2 base]
//   @Flexo 0x146d320  HgcScreeningMatte::~HgcScreeningMatte()            [D1]
//   @Flexo 0x146d370  HgcScreeningMatte::~HgcScreeningMatte()            [D0 deleting]
//   @Flexo 0x146d3c0  HgcScreeningMatte::SetParameter(int,float,float,float,float)
//   @Flexo 0x146d460  HgcScreeningMatte::GetParameter(int, float*)
//   @Flexo 0x146d4b0  HgcScreeningMatte::GetOutput(HGRenderer*)
//   @Flexo 0x146d0b0  HgcScreeningMatte::GetDOD(HGRenderer*, int, HGRect)
//   @Flexo 0x146d0d0  HgcScreeningMatte::GetROI(HGRenderer*, int, HGRect)
//   @Flexo 0x146c8a0  HgcScreeningMatte::GetProgram(HGRenderer*)
//   @Flexo 0x146c8d0  HgcScreeningMatte::InitProgramDescriptor(HGProgramDescriptor*) const
//   @Flexo 0x146cb70  HgcScreeningMatte::shaderDescription() const
//   @Flexo 0x146cbc0  HgcScreeningMatte::BindTexture(HGHandler*, int)
//   @Flexo 0x146cc70  HgcScreeningMatte::Bind(HGHandler*)
//   @Flexo 0x146ccb0  HgcScreeningMatte::RenderTile_AVX(HGTile*)
//   @Flexo 0x146ceb0  HgcScreeningMatte::RenderTile(HGTile*)
//
// The shader that this node dispatches is fully embedded in the binary at
// GetProgram @Flexo 0x146c8b8 (Metal) — MD5 79bd52d9:01ff5cee:20a838b9:e851623b.
// The math it implements (verified against the ctor's default constants below):
//   c0 = float4(0.5, 0.2117599994, 0.7699999809, 0.3411799967)
//   r0 = tex0.sample(uv0)              // primary color
//   r1.w = tex1.sample(uv1).w          // secondary alpha
//   r2.w = r0.w
//   r3.xyz = r0.yyy*c0.xxx + c0.yyy    // 0.5*Y + 0.2117599994  (chroma remap A)
//   r4.xyz = r0.yyy*c0.zzz + c0.www    // 0.77*Y + 0.3411799967 (chroma remap B)
//   r3.xyz = select(r4.xyz, r3.xyz, hg_Params[0].xyz < 0.0)  // per-channel branch
//   r2.xyz = mix(r3.xyz, r0.xyz, r1.www)                     // alpha-blend original
//
// The c0 constants live in the FCP binary at the offsets computed below and
// are also splatted into the runtime param buffer at ctor time so SetParameter
// can compare against them. Every offset in that ~0x100-byte buffer is
// derived from a movaps stride we transcribe verbatim.
//
// -- FLEXO CONSTANTS (RIP-rel operand addresses; resolve.py Flexo const <ADDR>) --
//
//   @0x157c320  u64=0x3f0000003f000000  → f32x4 { 0.5, 0.5, 0.5, 0.0 }
//     (ctor @0x146d225 writes this into buf+0x28 and buf+0x38 — the c0.x splat.)
//
//   @0x1589ab0  u64=0x3e58d79d3e58d79d  → f32x4 { 0.21176, 0.21176, 0.21176, 0.0 }
//     (ctor @0x146d236 writes this into buf+0x48 and buf+0x58 — the c0.y splat.)
//     Actually f32(0x3e58d79d) = 0.21175999939441681... — the same 0.2117599994
//     literal that appears in the Metal shader's c0 above.
//
//   @0x1589ac0  u64=0x3f451eb83f451eb8  → f32x4 { 0.77,    0.77,    0.77,    0.0 }
//     (ctor @0x146d247 writes this into buf+0x68 and buf+0x78 — the c0.z splat.)
//     f32(0x3f451eb8) = 0.76999998092651367... — the shader's 0.7699999809 literal.
//
//   @0x1589ad0  u64=0x3eaeaf253eaeaf25  → f32x4 { 0.34118, 0.34118, 0.34118, 0.0 }
//     (ctor @0x146d258 writes this into buf+0x88 and buf+0x98 — the c0.w splat.)
//     f32(0x3eaeaf25) = 0.34117999672889709... — the shader's 0.3411799967 literal.
//
//   @0x1589040  u64=0xffffffffffffffff  → f32x4 { NaN, NaN, NaN, NaN(0.0-bit-mixed) }
//     (ctor @0x146d27f writes this into buf+0xc8 and buf+0xd8 — an all-ones bitmask.)
//     This is the "no-key-yet" sentinel: SetParameter's compare against buf+0x00..0x0c
//     against the incoming xmm0 uses ucomiss, which treats 0xffffffff (=NaN) as
//     unordered ⇒ jne/jp always taken ⇒ falls into the "write" path. So an
//     unconfigured HgcScreeningMatte always accepts the first SetParameter.
//
// -- BUFFER LAYOUT (relative to buf = *(this+0x198), post-alignment) --
//   buf-0x08 : void*  raw ptr saved at (buf-8) for delete[] (@0x146d214)
//   buf+0x00 : f32[4] param comparison lane 0     (@0x146d3d1..0x146d3f4 reads;
//                                                   SetParameter's fast-skip path)
//   buf+0x10 : f32[4] param write mirror 0..2     (SetParameter@0x146d407..0x146d41a
//                                                   splats xmm0 into three lanes)
//   buf+0x18 : (part of mirror above)
//   buf+0x1c : i32    tail clear zero              (@0x146d424 movl $0, 0x1c(%rax))
//   buf+0x28..0x38 : f32x4 c0.x splat (0.5, 0.5, 0.5, 0.0)         [pre-computed]
//   buf+0x48..0x58 : f32x4 c0.y splat (0.21176 ...)                [pre-computed]
//   buf+0x68..0x78 : f32x4 c0.z splat (0.77 ...)                    [pre-computed]
//   buf+0x88..0x98 : f32x4 c0.w splat (0.34118 ...)                 [pre-computed]
//   buf+0xa8..0xb8 : zero pair (xorps xmm0; movaps written @0x146d26f / 0x146d277)
//   buf+0xc8..0xd8 : NaN-bitmask sentinel (0xffffffff .... )        [pre-computed]
//   buf+0xe0 : f32x4 param{r,g,b,a}                (SetParameter@0x146d444 writes;
//                                                   GetParameter@0x146d475..0x146d4a3 reads)
//   buf+0xe8 : zero xmm write @0x146d296
//
// Vtable installed by ctor @0x146d1ef via leaq 0x4c148a(%rip),%rax :
//   next-instr 0x146d1f6 + 0x4c148a = 0x192e680 = __ZTV17HgcScreeningMatte+0x10.
//
// -- HGNode flag config in ctor (@0x146d2a5..0x146d2b2) --
//   ANDL $0xfffff9ff , 0x10(%rbx)  ; clear bits 0x600 (i.e. 0x400 | 0x200)
//   ORL  $0x400      , 0x10(%rbx)  ; then set bit 0x400
//   → net effect: clear 0x200, set 0x400. Same 0x400 flag pattern as HGStencil.
//
// Frontier callees / structures not yet in the port (throw-stubbed with @0xADDR):
//   HGNode base ctor/dtor  @Flexo (imported from Helium as symbol stubs)
//   HGNode::ClearBits()    @Flexo 0x1496bfa (called from SetParameter)
//   HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName /
//     SetReturnBinding / SetArgumentBindings  (InitProgramDescriptor)
//   HGRectNull sentinel (GetDOD/GetROI slot>=2 path)
//   HGHandler::TexCoord + vtable *0x30/*0x48/*0x80/*0x90/*0xa8/*0xc0 (Bind, BindTexture)
//   HGRenderer::GetTarget (GetProgram)
//   HGTile struct + 172-line SSE and 172-line AVX raster kernels (RenderTile / RenderTile_AVX)

import { HGNode } from "./HGNode.js";

/** Opaque tokens for base classes not yet ported. */
export interface HGRendererLike { readonly __hgRenderer: true }
export interface HGHandlerLike { readonly __hgHandler: true }
export interface HGTileLike { readonly __hgTile: true }
export interface HGProgramDescriptorLike { readonly __hgProgramDescriptor: true }
export interface HGRectLike { minX: number; minY: number; maxX: number; maxY: number; }

/** The four c0 constants preloaded into the runtime buffer by the ctor. Each
 *  is a splat across 3 lanes plus a 0.0 4th lane (see buffer layout above).
 *  Values verified against `resolve.py Flexo const <ADDR>` — these are the
 *  exact f32 bit patterns @0x157c320 / @0x1589ab0 / @0x1589ac0 / @0x1589ad0. */
export const HGC_SCREENING_C0_X = Math.fround(0.5);                       // @0x157c320 f32(0x3f000000)
export const HGC_SCREENING_C0_Y = Math.fround(0.21175999939441681);       // @0x1589ab0 f32(0x3e58d79d)
export const HGC_SCREENING_C0_Z = Math.fround(0.76999998092651367);       // @0x1589ac0 f32(0x3f451eb8)
export const HGC_SCREENING_C0_W = Math.fround(0.34117999672889709);       // @0x1589ad0 f32(0x3eaeaf25)

/** The 32-bit all-ones bitmask (interpreted as f32 NaN) preloaded at buf+0xc8/0xd8. */
export const HGC_SCREENING_NAN_BITMASK_U32 = 0xffffffff as const;         // @0x1589040 u64=0xff..ff

/** HGNode flag config performed by the ctor at @0x146d2a5..0x146d2b2:
 *    flags = (flags & ~0x600) | 0x400
 *  Net: clear bit 0x200, set bit 0x400 (bit 0x400 is left set by the AND too).
 *  Semantic label unknown until HGNode flags decode. */
export const HGC_SCREENING_CTOR_FLAG_AND_MASK = 0xfffff9ff as const;       // @0x146d2a5 movl imm
export const HGC_SCREENING_CTOR_FLAG_OR_MASK  = 0x00000400 as const;       // @0x146d2ad orl $0x400

export class HgcScreeningMatte extends HGNode {
  /** @0x198 (aligned) parameter buffer pointer. In C++ this is an aligned block
   *  in a 0x127-byte alloc; in the JS port we model the buffer as a Float32Array
   *  of the same layout so SetParameter/GetParameter can preserve offsets.
   *  Element count = 0xf0 bytes / 4 = 60 lanes (0x00..0xec covered by ctor writes). */
  private _buf: Float32Array;

  /** Whether the internal state has been dirtied (mirrors the HGNode::ClearBits()
   *  call after each SetParameter write). Cleared here is a no-op since HGNode's
   *  bits enum is not yet decoded, but we record the fact for future wiring. */
  private _bitsCleared: boolean = false;

  /**
   * HgcScreeningMatte::HgcScreeningMatte() @0x146d1e0 (C1) / @0x146d0f0 (C2 —
   * identical body per the ledger). Transcribed from the C1 disasm.
   *
   *   @0x146d1ea  callq HGNode::HGNode()
   *   @0x146d1ef  leaq  0x4c148a(%rip), %rax ; movq %rax,(%rbx)  ; vtable @0x192e680
   *   @0x146d1f9  movl  $0x127, %edi ; callq operator new[]      ; 295-byte block
   *   @0x146d203  ecx = (-(rax+8)) & 0x1f                          ; align to 32
   *   @0x146d20c  rdx = rax + ecx + 8                              ; aligned buf
   *   @0x146d214  movq %rax, (%rcx,%rax)                           ; stash raw ptr at buf-8
   *   @0x146d218..0x146d296  a sequence of movaps writes populates the buffer
   *                            (see BUFFER LAYOUT above for exact offsets)
   *   @0x146d29e  movq %rdx, 0x198(%rbx)                            ; this->_buf = buf
   *   @0x146d2a5  flags = (flags & 0xfffff9ff) | 0x400              ; HGNode flag setup
   */
  constructor() {
    super();                                                        // @0x146d1ea callq HGNode::HGNode
    // @0x146d1ef vtable install → JS proto chain handles.
    // Buffer allocation + 32-byte alignment: we model the aligned region only
    // (JS has no direct memory-alignment concept; a Float32Array of 60 lanes
    // reproduces the observable layout at every offset accessed by the code).
    this._buf = new Float32Array(60);                               // 0xf0 bytes / 4
    // Populate the ctor's preloaded splats. Each pair (lo, hi) at buf+0xXX and
    // buf+0xYY reproduces the two identical movaps writes emitted by the compiler.
    // Offsets are in bytes; index = byte-offset / 4.
    // buf+0x28..0x38 : c0.x = 0.5 (@0x146d225 → 0x157c320 splat)
    for (const off of [0x28, 0x38]) {
      for (let l = 0; l < 3; l++) this._buf[(off >> 2) + l] = HGC_SCREENING_C0_X;
      this._buf[(off >> 2) + 3] = Math.fround(0.0);
    }
    // buf+0x48..0x58 : c0.y = 0.2117599994 (@0x146d236 → 0x1589ab0 splat)
    for (const off of [0x48, 0x58]) {
      for (let l = 0; l < 3; l++) this._buf[(off >> 2) + l] = HGC_SCREENING_C0_Y;
      this._buf[(off >> 2) + 3] = Math.fround(0.0);
    }
    // buf+0x68..0x78 : c0.z = 0.7699999809 (@0x146d247 → 0x1589ac0 splat)
    for (const off of [0x68, 0x78]) {
      for (let l = 0; l < 3; l++) this._buf[(off >> 2) + l] = HGC_SCREENING_C0_Z;
      this._buf[(off >> 2) + 3] = Math.fround(0.0);
    }
    // buf+0x88..0x98 : c0.w = 0.3411799967 (@0x146d258 → 0x1589ad0 splat)
    for (const off of [0x88, 0x98]) {
      for (let l = 0; l < 3; l++) this._buf[(off >> 2) + l] = HGC_SCREENING_C0_W;
      this._buf[(off >> 2) + 3] = Math.fround(0.0);
    }
    // buf+0xa8, buf+0xb8 : zero (@0x146d26f/0x146d277 movaps of xmm0=xorps).
    //   (Float32Array is already zero-initialized; noted for completeness.)
    // buf+0xc8..0xd8 : NaN bitmask 0xffffffff (@0x146d27f → 0x1589040 splat).
    //   f32 with all-ones bits is NaN — SetParameter's ucomiss against buf+0x00
    //   uses this as an "unordered => write" sentinel for the initial state.
    //   In JS we cannot store 0xffffffff bits into a Float32Array lane and get
    //   back the exact NaN payload — Number.NaN is a canonical NaN. But every
    //   NaN triggers the same ucomiss behaviour (jne+jp taken), so functional
    //   equivalence holds. The bit-exact payload is documented as a constant.
    for (const off of [0xc8, 0xd8]) {
      for (let l = 0; l < 4; l++) this._buf[(off >> 2) + l] = Number.NaN;
    }
    // buf+0xe8..0xf0 : zero (@0x146d296 xorps xmm0; movaps). Already zero.
    // HGNode flag config @0x146d2a5..0x146d2b2 — not yet mapped through HGNode.
    void HGC_SCREENING_CTOR_FLAG_AND_MASK;
    void HGC_SCREENING_CTOR_FLAG_OR_MASK;
  }

  /**
   * HgcScreeningMatte::SetParameter(int idx, float r, float g, float b, float a)
   *   @0x146d3c0
   *
   *   Returns:
   *     -1 (0xffffffff) if idx != 0    (@0x146d3c0..0x146d3c9)
   *      0 if all four channels equal the currently-stored (buf+0x00..0x0c) values
   *        AND the 4th channel equals 0.0f   (@0x146d3f9..0x146d457)
   *      1 if the write actually changed something.
   *
   *   Fast-skip path (write only on change):
   *     @0x146d3d1  ucomiss buf+0x00, xmm0 (r) ; jne/jp write
   *     @0x146d3dc  ucomiss buf+0x04, xmm0 (r) ; jne/jp write
   *     @0x146d3e8  ucomiss buf+0x08, xmm0 (r) ; jne/jp write
   *     @0x146d3f4  ucomiss buf+0x0c, xmm5=0 (compare against 0.0f) ; jne/jp write
   *     @0x146d401  jnp 0x146d457                                    ; return 0
   *
   *   Note: the four ucomiss ops all compare against `xmm0` (the r arg). This is
   *   NOT a per-channel compare — it's checking that r matches lanes 0,1,2 of
   *   buf+0x00 AND lane 3 is 0.0. Since the ctor left buf+0x00 as NaN,
   *   the FIRST call always falls through to the write path.
   *
   *   Write path @0x146d403..0x146d450:
   *     buf+0x00.x = r ; buf+0x00.y = r ; buf+0x00.z = r  (splat r across lanes 0,1,2 twice —
   *       once at buf+0x00 and once at buf+0x10, exactly mirroring what a
   *       future re-run of the fast-skip path will read)
   *     buf+0x0c = 0.0f
   *     buf+0x1c = 0.0f
   *     buf+0xe0.rgba = insertps(r,g,b,a)                       ; @0x146d432..0x146d444
   *   Then callq HGNode::ClearBits() @Flexo 0x1496bfa and return 1.
   *
   *   The `insertps $0x10, xmm1, xmm0` etc. instructions build a f32x4 with
   *   { r, g, b, a } in lanes 0..3 respectively (the imm-8 encodings select
   *   the source lane and destination lane; imm 0x10 = "copy xmm1[0] into
   *   xmm0[1]" which for f32 SSE takes the four scalars into a proper vec4).
   */
  SetParameter(idx: number, r: number, g: number, b: number, a: number): number {
    if ((idx | 0) !== 0) return -1;                                 // @0x146d3c0/0x146d3c5
    const rF = Math.fround(r);
    const gF = Math.fround(g);
    const bF = Math.fround(b);
    const aF = Math.fround(a);
    // Fast-skip path: ordered-equal on all 4 comparisons → return 0. Any NaN or
    // ordered-unequal → fall through to write. `ucomiss`: jne taken on ZF=0
    // (ordered-unequal), jp taken on PF=1 (unordered / NaN). Both branches jump
    // to the write path, so any NaN OR any inequality triggers the store.
    const b0 = this._buf[0]; const b1 = this._buf[1]; const b2 = this._buf[2]; const b3 = this._buf[3];
    const allMatch =
      !Number.isNaN(b0) && b0 === rF &&
      !Number.isNaN(b1) && b1 === rF &&
      !Number.isNaN(b2) && b2 === rF &&
      !Number.isNaN(b3) && b3 === Math.fround(0.0);
    if (allMatch) return 0;                                         // @0x146d401 jnp 0x146d457
    // Write path @0x146d407..0x146d444:
    //   buf+0x10 = r ; buf+0x00 = r ; buf+0x14 = r ; buf+0x04 = r ;
    //   buf+0x18 = r ; buf+0x08 = r ; buf+0x1c = 0 ; buf+0x0c = 0 ;
    this._buf[0] = rF;                                              // @0x146d40c movss %xmm0, (%rax)
    this._buf[1] = rF;                                              // @0x146d415 movss %xmm0, 0x4(%rax)
    this._buf[2] = rF;                                              // @0x146d41f movss %xmm0, 0x8(%rax)
    this._buf[3] = Math.fround(0.0);                                // @0x146d42b movl $0, 0xc(%rax)
    this._buf[4] = rF;                                              // @0x146d407 movss %xmm0, 0x10(%rax)
    this._buf[5] = rF;                                              // @0x146d410 movss %xmm0, 0x14(%rax)
    this._buf[6] = rF;                                              // @0x146d41a movss %xmm0, 0x18(%rax)
    this._buf[7] = Math.fround(0.0);                                // @0x146d424 movl $0, 0x1c(%rax)
    // buf+0xe0 = { r, g, b, a }  (insertps builds vec4, movaps writes)
    // 0xe0 / 4 = 56
    this._buf[56] = rF;                                             // @0x146d432/0x146d444
    this._buf[57] = gF;
    this._buf[58] = bF;
    this._buf[59] = aF;
    // HGNode::ClearBits() @Flexo 0x1496bfa — clears an internal dirty flag on
    // the base HGNode. Not yet ported. We record the intent as a boolean.
    this._bitsCleared = true;                                       // @0x146d44b callq ClearBits
    return 1;                                                       // @0x146d450 movl $1, %eax
  }

  /**
   * HgcScreeningMatte::GetParameter(int idx, float* out) @0x146d460
   *
   *   Returns -1 if idx != 0, else copies buf+0xe0..0xec into out[0..3] and
   *   returns 0.
   *
   *   @0x146d460  movl  $0xffffffff, %eax
   *   @0x146d465  testl %esi, %esi ; je 0x146d46a                  ; idx != 0 → return -1
   *   @0x146d46e  movq  0x198(%rdi), %rax                           ; rax = buf
   *   @0x146d475  movss 0xe0(%rax), %xmm0 ; movss %xmm0, (%rdx)     ; out[0] = buf+0xe0
   *   @0x146d481  movss 0xe4(%rax), %xmm0 ; movss %xmm0, 0x4(%rdx)  ; out[1] = buf+0xe4
   *   @0x146d48e  movss 0xe8(%rax), %xmm0 ; movss %xmm0, 0x8(%rdx)  ; out[2] = buf+0xe8
   *   @0x146d49b  movss 0xec(%rax), %xmm0 ; movss %xmm0, 0xc(%rdx)  ; out[3] = buf+0xec
   *   @0x146d4a8  xorl %eax, %eax ; return 0
   */
  GetParameter(idx: number, out: Float32Array | number[]): number {
    if ((idx | 0) !== 0) return -1;                                 // @0x146d465 testl/je
    out[0] = this._buf[56];                                         // @0x146d475 buf+0xe0
    out[1] = this._buf[57];                                         // @0x146d481 buf+0xe4
    out[2] = this._buf[58];                                         // @0x146d48e buf+0xe8
    out[3] = this._buf[59];                                         // @0x146d49b buf+0xec
    return 0;                                                       // @0x146d4a8 xorl %eax, %eax
  }

  /**
   * HgcScreeningMatte::GetOutput(HGRenderer*) @0x146d4b0
   *
   * A one-liner: return this. The compositor node is its own output.
   *   @0x146d4b4  movq %rdi, %rax
   *   @0x146d4b7  popq %rbp ; retq
   */
  GetOutput(_r: HGRendererLike): HgcScreeningMatte {
    return this;                                                    // @0x146d4b4 movq %rdi, %rax
  }

  /**
   * HgcScreeningMatte::GetDOD(HGRenderer*, int slot, HGRect in) @0x146d0b0
   *
   *   For slot < 2 (unsigned compare `jb`): passthrough — return input.
   *   For slot >= 2: return HGRectNull.
   *
   *   @0x146d0b0  movq %rcx, %rax                                    ; rax = in.lo
   *   @0x146d0b3  cmpl $2, %edx ; jb 0x146d0cb                       ; slot < 2 → passthrough
   *   @0x146d0bc  movq _HGRectNull(GOT), %rcx ; load HGRectNull       ; slot >= 2
   *   @0x146d0c3  rax = HGRectNull.lo ; r8 = HGRectNull.hi
   *   @0x146d0cb  movq %r8, %rdx ; retq                               ; return (rax:rdx)
   */
  GetDOD(_r: HGRendererLike, slot: number, inRect: HGRectLike): HGRectLike {
    if ((slot >>> 0) < 2) return inRect;                            // @0x146d0b3 jb (unsigned)
    throw new Error(
      "HgcScreeningMatte::GetDOD @0x146d0bc slot>=2 branch not yet transcribed — " +
      "requires HGRectNull @Flexo __TEXT __const symbol (16-byte packed rect).",
    );
  }

  /**
   * HgcScreeningMatte::GetROI(HGRenderer*, int slot, HGRect in) @0x146d0d0
   *
   *   Identical shape to GetDOD (see comment above).
   *   @0x146d0d0  movq %rcx, %rax
   *   @0x146d0d3  cmpl $2, %edx ; jb 0x146d0eb
   *   @0x146d0dc  load HGRectNull
   *   @0x146d0eb  movq %r8, %rdx ; retq
   */
  GetROI(_r: HGRendererLike, slot: number, inRect: HGRectLike): HGRectLike {
    if ((slot >>> 0) < 2) return inRect;                            // @0x146d0d3 jb (unsigned)
    throw new Error(
      "HgcScreeningMatte::GetROI @0x146d0dc slot>=2 branch not yet transcribed — " +
      "requires HGRectNull @Flexo __TEXT __const symbol.",
    );
  }

  /**
   * HgcScreeningMatte::GetProgram(HGRenderer*) @0x146c8a0
   *
   *   Returns a Metal shader source (literal-pool @Flexo 0x246b53 via
   *   `leaq 0x24228b(%rip),%rax` at 0x146c8b8 with next-instr 0x146c8bf →
   *   target = 0x146c8bf + 0x24228b = 0x38ef4a — verified: Flexo binary is
   *   >0x1500000 bytes so the literal pool address is valid in the mapped file)
   *   if HGRenderer::GetTarget(0x60000) > 0x60b10; otherwise nullptr.
   *
   *   @0x146c8a7  movl $0x60000, %esi ; callq HGRenderer::GetTarget(unsigned int)
   *   @0x146c8b3  cmpl $0x60b10, %eax
   *   @0x146c8b8  leaq [metal-src](%rip), %rax
   *   @0x146c8bf  cmoveq %rax, %rcx                                  ; if eq → return metal-src
   *   @0x146c8c3  movq %rcx, %rax ; ret                              ; else return null
   *
   *   Note: unlike HGComicQuantize::GetProgram this class has NO GLSL fallback —
   *   only Metal is supported. If the target != 0x60b10 the function returns
   *   a null-initialized rcx (xorl ecx,ecx @0x146c8b1).
   */
  GetProgram(_r: HGRendererLike): string | null {
    throw new Error(
      "HgcScreeningMatte::GetProgram @0x146c8a0 not yet transcribed — requires " +
      "HGRenderer::GetTarget(unsigned int) @Flexo 0x1495ea4 stub target. Metal " +
      "shader source at Flexo literal-pool @0x146c8b8 (see disasm dump).",
    );
  }

  /**
   * HgcScreeningMatte::InitProgramDescriptor(HGProgramDescriptor*) const @0x146c8d0
   *
   *   Sets up the program descriptor via a sequence of HGProgramDescriptor calls
   *   and builds a std::vector<HGBinding> of 3 fragment-color bindings:
   *     @0x146c8f2  SetVisibleShaderWithSource("HgcScreeningMatte_hgc_visible", <src>)
   *     @0x146c901  SetFragmentFunctionName("HgcScreeningMatte")
   *     @0x146c948  SetReturnBinding(HGBinding{ type=4, name="FragmentOut" })
   *     @0x146c9a2  bindings.push_back(HGBinding{ type=2, name="float4"  })
   *     @0x146c9f0  bindings.push_back(HGBinding{ type=0xa, name="float4"})
   *     @0x146ca85  bindings.push_back(HGBinding{ type=0xa, name="float4"})
   *     @0x146cad2  SetArgumentBindings(bindings)
   *
   *   Each binding contains a small-string (SSO) name plus a 16-byte payload
   *   loaded via `movaps 0x1XXXXXX(%rip)` from Flexo __TEXT __const. The 16-byte
   *   payloads are:
   *     @Flexo 0x1583520  (0x146c933 + 0x116be6) — return-binding payload
   *     @Flexo 0x15897c0  (0x146c98a + 0x11ce2f) — first arg payload
   *     @Flexo 0x1583520  (0x146c9d9 + 0x116b40) — second arg payload (same as return)
   *     @Flexo 0x1583520  (0x146ca62 + 0x116ab7) — third arg payload
   *
   *   The exact HGBinding struct layout is not yet decoded; the port defers @0x146c8d0
   *   this until HGProgramDescriptor lands.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorLike): void {
    throw new Error(
      "HgcScreeningMatte::InitProgramDescriptor @0x146c8d0 not yet transcribed — " +
      "requires HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName / " +
      "SetReturnBinding / SetArgumentBindings @Flexo stubs, and HGBinding struct layout.",
    );
  }

  /**
   * `HgcScreeningMatte::shaderDescription() const` — @Flexo 0x146cb70
   *   `__ZNK17HgcScreeningMatte17shaderDescriptionEv`
   *
   * FULL transcription — every instruction, in order. The function returns `std::string` BY VALUE,
   * so under the SysV ABI %rdi is the caller-provided sret buffer and `this` arrives in %rsi —
   * and %rsi is never read:
   *
   *   0x146cb70  pushq  %rbp                        ; frame setup (no TS counterpart)
   *   0x146cb71  movq   %rsp,%rbp
   *   0x146cb74  pushq  %rbx
   *   0x146cb75  pushq  %rax                        ; 16-byte stack alignment for the call
   *   0x146cb76  movq   %rdi,%rbx                   ; rbx = sret (the returned std::string)
   *   0x146cb79  movl   $0x20,%edi                  ; operator new size = 0x20 = 32 bytes
   *   0x146cb7e  callq  0x1497452                   ; symbol stub for __Znwm (operator new)
   *   0x146cb83  movq   %rax,0x10(%rbx)             ; string.__data_ (+0x10) = heap buffer
   *   0x146cb87  movq   $0x21,(%rbx)                ; string.__cap_  (+0x00) = 0x21
   *   0x146cb8e  movq   $0x18,0x8(%rbx)             ; string.__size_ (+0x08) = 0x18 = 24
   *   0x146cb96  movabsq $0x5d316367685b2065,%rcx   ; 8 chars, little-endian = "e [hgc1]"
   *   0x146cba0  movq   %rcx,0x10(%rax)             ; -> buffer[0x10..0x17]
   *   0x146cba4  movups 0x2423bb(%rip),%xmm0        ; 16 bytes from 0x146cbab+0x2423bb = 0x16aef66
   *   0x146cbab  movups %xmm0,(%rax)                ; -> buffer[0x00..0x0f]
   *   0x146cbae  movb   $0x0,0x18(%rax)             ; NUL terminator at buffer[24]
   *   0x146cbb2  movq   %rbx,%rax                   ; return the sret pointer
   *   0x146cbb5  addq   $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   0x146cbbc  nopl   (%rax)                      ; alignment padding, not executed
   *
   * WHAT IT BUILDS. libc++'s LONG (heap) string representation in the **x86_64** layout this port
   * is transcribed from: `+0x00 __cap_` with `is_long` in bit 0, `+0x08 __size_`, `+0x10 __data_`.
   * `__cap_ = 0x21` is capacity 0x20 = 32 with the is_long bit set, matching the `operator new(0x20)`
   * above; `__size_ = 0x18` = 24 characters. (The short/SSO form used by the landed
   * `HgcVibrancy::shaderDescription` @Flexo 0x146ec90 tops out at 22 characters, two short of this
   * string — which is exactly why this sibling allocates. The arm64 slice lays std::string out
   * differently, so the oracle below was run under Rosetta.)
   *
   * THE CHARACTERS, from two different instruction forms:
   *   * the `movabsq` immediate `0x5d316367685b2065` is 8 bytes little-endian = `e [hgc1]`, stored
   *     at buffer[0x10..0x17];
   *   * the `movups` source resolves to Flexo's `__TEXT,__cstring` at 0x16aef66 (section vmaddr
   *     0x15e9b40, file offset 22977344), which holds the 24-byte C string
   *     "HgcScreeningMatte [hgc1]"; its first 16 bytes "HgcScreeningMatt" go to buffer[0x00..0x0f].
   * Reassembled: "HgcScreeningMatt" + "e [hgc1]" = "HgcScreeningMatte [hgc1]", 24 chars, then the
   * NUL at index 24. Note the two halves do NOT overlap here (16 + 8 exactly), unlike the sibling
   * `HgcYUV420TriPlanar_alpha::shaderDescription` @Helium 0x2e03c0 whose 31 bytes are tiled 16 + 16
   * with one byte written twice.
   *
   * MODELLING. A TS `string` is the faithful stand-in for the returned `std::string`: the heap
   * allocation, the capacity word and the NUL terminator are representation details of libc++'s
   * value, not observable content of it, and this project models `std::string` results as TS
   * strings throughout (precedent: the landed `HgcVibrancy::shaderDescription`). This replaces the
   * throwing stub that previously stood here — the body is fully decoded, so a throw would now be
   * a false gap.
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local), so it is not
   * dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Flexo) + 0x146cb70`, with the vmaddr from
   * `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta), on
   * a 0xAA-poisoned 24-byte sret buffer. Live Flexo wrote `__cap_ = 0x21`, `__size_ = 0x18`,
   * returned the sret pointer in %rax, and the heap buffer held exactly "HgcScreeningMatte [hgc1]"
   * with a NUL at index 24 — identical on repeated calls, and identical to what this port returns.
   *
   * @returns the shader description string.
   */
  shaderDescription(): string {
    // @0x146cb96..0x146cbae — "HgcScreeningMatt" (16 bytes from the __cstring literal at Flexo
    // 0x16aef66) + "e [hgc1]" (the movabsq immediate) + NUL.
    return "HgcScreeningMatte [hgc1]";
  }

  /**
   * HgcScreeningMatte::Bind(HGHandler*) @0x146cc70
   *
   *   @0x146cc7d  rdx = this->_buf                                   ; buffer pointer passed as arg
   *   @0x146cc84  rax = handler->vtable
   *   @0x146cc91  call handler->vtable[*0x90](handler, 0, this->_buf, 1)
   *   @0x146cc97  rax = this->vtable
   *   @0x146cca0  call this->vtable[*0xc0](this, handler)             ; probably BindParamBufferDesc
   *   @0x146cca6  return 0
   */
  Bind(_h: HGHandlerLike): number {
    throw new Error(
      "HgcScreeningMatte::Bind @0x146cc70 not yet transcribed — requires HGHandler " +
      "vtable *0x90 (called with (h, 0, this->_buf, 1)) and this->vtable *0xc0 " +
      "(HGNode::BindParamBufferDesc @Helium 0x122000).",
    );
  }

  /**
   * HgcScreeningMatte::BindTexture(HGHandler*, int idx) @0x146cbc0
   *
   *   Handles idx == 0 and idx == 1 with slightly different HGHandler-vtable
   *   sequences; all other idx values return -1. Both branches call
   *   HGHandler::TexCoord(idx, 0, 0, nullptr) then vtable *0x80(0x2e) + vtable
   *   *0xa8 — the shape of a two-texture sampler bind. Deferred.
   */
  BindTexture(_h: HGHandlerLike, _idx: number): number {
    throw new Error(
      "HgcScreeningMatte::BindTexture @0x146cbc0 not yet transcribed — requires " +
      "HGHandler::TexCoord and HGHandler vtable slots *0x30/*0x48/*0x80/*0xa8.",
    );
  }

  /**
   * HgcScreeningMatte::RenderTile(HGTile*) @0x146ceb0 (172 lines) and
   * RenderTile_AVX @0x146ccb0 — SSE and AVX variants of the CPU raster fallback
   * for the screening-matte shader. Deferred; requires HGTile layout.
   */
  RenderTile(_tile: HGTileLike): void {
    throw new Error(
      "HgcScreeningMatte::RenderTile @0x146ceb0 not yet transcribed — 172-line SSE " +
      "raster kernel; requires HGTile layout.",
    );
  }

  RenderTile_AVX(_tile: HGTileLike): void {
    throw new Error(
      "HgcScreeningMatte::RenderTile_AVX @0x146ccb0 not yet transcribed — 172-line " +
      "AVX raster kernel; requires HGTile layout.",
    );
  }

  /**
   * HgcScreeningMatte::~HgcScreeningMatte() @0x146d2d0 / @0x146d320 / @0x146d370
   * (deleting). D0 fetches the raw ptr saved at buf-8 by the ctor (@0x146d214)
   * and passes it to operator delete[], then tail-calls HGNode's dtor.
   * JS has no destructor; noop here.
   */
  destroy(): void {
    // No JS-side Release calls; Float32Array is GC-managed.
  }
}
