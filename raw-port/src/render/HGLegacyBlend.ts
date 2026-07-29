// HGLegacyBlend.ts — Helium's HGLegacyBlend render-graph node: a two-input
// blend node with a per-mode CPU/AVX blend dispatcher, a mode-indexed
// Metal-program lookup, and its own heap-owned "State" scratch buffer.
//
// Every HGLegacyBlend* Metal blend program in FCP (Normal/Add/Behind/Darken/
// Difference/Lighten/Multiply/Screen/Dissolve/Sub) is dispatched from this
// class via `s_arb_blend_table[mode]` (GetProgram) and
// `s_programdesc_blend_table[mode]` (InitProgramDescriptor); the CPU tile
// path goes through `s_func_blend_table[mode]` (RenderTile).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice, file offset
//             0x4000; VAs below are the raw VM addresses from `otool -tV`).
//
// Source disassembly saved at:
//   raw-port/re/disasm/Helium.HGLegacyBlend.C2.s                @0x2415d0
//   raw-port/re/disasm/Helium.HGLegacyBlend.HGLegacyBlend.s     @0x241840 (C1)
//   raw-port/re/disasm/Helium.HGLegacyBlend.ZN13HGLegacyBlendD2Ev.s @0x241850
//   raw-port/re/disasm/Helium.HGLegacyBlend.ZN13HGLegacyBlendD1Ev.s @0x2418b0
//   raw-port/re/disasm/Helium.HGLegacyBlend.ZN13HGLegacyBlendD0Ev.s @0x241910
//   raw-port/re/disasm/Helium.HGLegacyBlend.SetParameter.s      @0x241720
//   raw-port/re/disasm/Helium.HGLegacyBlend.GetParameter.s      @0x241970
//   raw-port/re/disasm/Helium.HGLegacyBlend.Clone.s             @0x241a50
//   raw-port/re/disasm/Helium.HGLegacyBlend.GetOutput.s         @0x241af0
//   raw-port/re/disasm/Helium.HGLegacyBlend.GetDOD.s            @0x241cb0
//   raw-port/re/disasm/Helium.HGLegacyBlend.GetROI.s            @0x241cd0
//   raw-port/re/disasm/Helium.HGLegacyBlend.RenderTile_mode.s   @0x241d40 (mode-dispatcher)
//   raw-port/re/disasm/Helium.HGLegacyBlend.RenderTile.s        @0x242510 (virtual thunk)
//   raw-port/re/disasm/Helium.HGLegacyBlend.RenderPage.s        @0x242530
//   raw-port/re/disasm/Helium.HGLegacyBlend.RenderPageMetal.s   @0x242560
//   raw-port/re/disasm/Helium.HGLegacyBlend.GetProgram.s        @0x242640
//   raw-port/re/disasm/Helium.HGLegacyBlend.InitProgramDescriptor.s @0x242660
//   raw-port/re/disasm/Helium.HGLegacyBlend.BindTexture.s       @0x242690
//   raw-port/re/disasm/Helium.HGLegacyBlend.Bind.s              @0x2426e0
//
// nm entries owned by this class (Helium x86_64 slice):
//   0x2415d0  T  HGLegacyBlend::HGLegacyBlend()                  [C2 — body]
//   0x241720  T  HGLegacyBlend::SetParameter(int, f,f,f,f)
//   0x241840  T  HGLegacyBlend::HGLegacyBlend()                  [C1 — jmp C2]
//   0x241850  T  HGLegacyBlend::~HGLegacyBlend()                 [D2 — body]
//   0x2418b0  T  HGLegacyBlend::~HGLegacyBlend()                 [D1 — jmp D2]
//   0x241910  T  HGLegacyBlend::~HGLegacyBlend()                 [D0 — D2 + delete]
//   0x241970  T  HGLegacyBlend::GetParameter(int, float*)
//   0x241a30  T  HGLegacyBlend::GetBlendFunc(HGLegacyBlendMode)  [tiny leaf]
//   0x241a50  T  HGLegacyBlend::Clone() const
//   0x241af0  T  HGLegacyBlend::GetOutput(HGRenderer*)
//   0x241cb0  T  HGLegacyBlend::GetDOD(HGRenderer*, int, HGRect)
//   0x241cd0  T  HGLegacyBlend::GetROI(HGRenderer*, int, HGRect)
//   0x241d40  T  HGLegacyBlend::RenderTile(HGTile*, int, float const*) [mode-dispatcher]
//   0x242510  T  HGLegacyBlend::RenderTile(HGTile*)              [virtual thunk]
//   0x242530  T  HGLegacyBlend::RenderPage(HGPage*)
//   0x242560  T  HGLegacyBlend::RenderPageMetal(HGPage*)
//   0x242640  T  HGLegacyBlend::GetProgram(HGRenderer*)
//   0x242660  T  HGLegacyBlend::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x242690  T  HGLegacyBlend::BindTexture(HGHandler*, int)
//   0x2426e0  T  HGLegacyBlend::Bind(HGHandler*)
//
// STRUCT LAYOUT (recovered from C2 @0x2415d0 field-by-field; also cross-
// validated against SetParameter/GetParameter/GetOutput/RenderTile):
//   HGLegacyBlend  is-a  HGNode  (C2 opens `callq __ZN6HGNodeC2Ev` @0x2415da).
//
//   HGLegacyBlend {
//     +0x000..+0x18f                                   HGNode base subobject.
//     +0x010  u32  flags  (masked-write @0x2416dc: `flags = (flags & ~0x600) | 0x400`
//                          — clears bits 9-10, sets bit 10; sets "wraps to alpha B" flag).
//     +0x198  ??*  m_outputScratch  (heap object; released by dtors @0x241884..0x24188f
//                                    via *0x18 of its vtable — SEE below at
//                                    "output-node cache", populated by GetOutput @0x241b94).
//     +0x1a0  f32  blendAmount        (idx=1 slot; SetParameter case idx=1 @0x24179e;
//                                      GetParameter case idx=1 reads via State* +0x00..+0x0c;
//                                      also mirrored into State[0x00..0x0c] and [0x10..0x1c]
//                                      as SIMD-broadcast xmm0.xxxx).
//     +0x1a4  f32  aspectDenom        (idx=5 slot; SetParameter case idx=5 @0x2417c1 — stores
//                                      xmm0; State +0x20..+0x2c gets broadcast of (1/xmm0);
//                                      State +0x40..+0x4c gets broadcast of xmm0).
//     +0x1a8  i32  blendMode          (HGLegacyBlendMode enum; SetParameter case idx=0
//                                      @0x241740 — roundss floor + cvttss2si + clamp `>= 9`;
//                                      GetProgram / RenderTile / InitProgramDescriptor all
//                                      index their per-mode tables by this).
//     +0x1ac  i32  useAlphaB          (0/1 bool; SetParameter case idx=2 @0x24176c —
//                                      roundss floor + cvttss2si + setne).
//     +0x1b0  i32  useAlphaA          (0/1 bool; SetParameter case idx=2 also writes
//                                      `!useAlphaB` @0x241796 — the two are complementary).
//     +0x1b8  State*  m_state         (heap-allocated in C2 via `operator new[](0x107)`
//                                      then aligned to 0x20 with an 8-byte back-pointer to
//                                      the malloc block; delete by dtors via `-0x8(state)`).
//   }
//
// STATE LAYOUT (0xe0 bytes payload; the class allocates 0x107 = 0x100 + 7-byte alignment
// slack and stores the raw malloc pointer at `state[-8]`. Every field is a 16-byte
// (`movaps`) group so the AVX blend kernels can load with aligned SIMD).
//   State {
//     +0x00  f32[4]  blend_amount_broadcast_lo     (mirror of blendAmount, xxxx)
//     +0x10  f32[4]  blend_amount_broadcast_hi     (mirror of blendAmount, xxxx)
//     +0x20  f32[4]  inv_aspect_broadcast_lo       (1/aspectDenom, xxxx)
//     +0x30  f32[4]  inv_aspect_broadcast_hi       (1/aspectDenom, xxxx)
//     +0x40  f32[4]  aspect_broadcast_lo           (aspectDenom,   xxxx)
//     +0x50  f32[4]  aspect_broadcast_hi           (aspectDenom,   xxxx)
//     +0x60  f32[4]  ones_lo    (initialized in C2 to [1,1,1,1] from @Helium 0x3c7c40)
//     +0x70  f32[4]  ones_hi                          (same)
//     +0x80  f32[4]  mask_alpha_lo  (init to [0,0,0,NaN] from @Helium 0x85fc40 —
//                                    packed 4×i32 [0,0,0,0xffffffff]; selects "keep RGB=0, take
//                                    from operand's alpha lane" in blendvps/andps operations)
//     +0x90  f32[4]  mask_alpha_hi                    (same)
//     +0xa0  f32[4]  mask_all_lo   (init to [NaN,NaN,NaN,NaN] from @Helium 0x3c7c30 —
//                                    packed 4×i32 [0xffffffff]×4; identity mask)
//     +0xb0  f32[4]  mask_all_hi                      (same)
//     +0xc0  f32[4]  mask_rgb_lo   (init to [NaN,NaN,NaN,0] from @Helium 0x88c7f0 —
//                                    packed 4×i32 [0xffffffff,0xffffffff,0xffffffff,0]; selects
//                                    RGB lanes only)
//     +0xd0  f32[4]  mask_rgb_hi                      (same)
//     +0xe0  (end of decoded payload — 0x107 alloc; remainder is alignment slack)
//   }
//
// vtable-for-HGLegacyBlend @Helium 0xa362d0 (installed ptr 0xa362e0; resolved
// via `raw-port/army/tools/resolve.py Helium vtable HGLegacyBlend`).
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN6HGNodeC2Ev              HGNode::HGNode()                     @0x2415da
//   __ZN6HGNodeD2Ev              HGNode::~HGNode()                    @0x241898/@0x241952
//   __ZN8HGObjectnwEm            HGObject::operator new(unsigned long) @0x241a5f (in Clone)
//   __ZN8HGObjectdlEPv           HGObject::operator delete            @0x241add/@0x241960
//   __Znam                       operator new[](unsigned long)         @0x2415f9 (State allocation)
//   __ZdlPv                      operator delete(void*)                @0x241878/@0x241938 (State free)
//   __ZN6HGNode9ClearBitsEv      HGNode::ClearBits() [no-arg thunk]    @0x2416b7
//   __ZN10HGRenderer8GetInputEP6HGNodei  HGRenderer::GetInput           @0x241b0d,@0x241b21,@0x2425a9
//   s_func_blend_table[mode]  — per-mode CPU blend kernel (9 slots)     called via
//                                                                        (%rcx,%rax,8)  @0x241df1
//   s_arb_blend_table[mode]   — per-mode Metal program getter (9 slots) called via
//                                                                        (%rcx,%rax,8)  @0x242656
//   s_programdesc_blend_table[mode] — per-mode Metal programdesc initializer (9 slots) called
//                                     via (%rcx,%rax,8)                   @0x242682
//   HGLogger::error(const char*, …)     @0x242546
//   HGGPURenderer::GetNodeBitmap(...)    @0x2425d0 (RenderPageMetal tail-jmp)
//   HGNode::RenderPage(HGPage*)          @0x242555 (RenderPage tail-jmp)
//   HGNode::RenderPageMetal(HGPage*)     @0x24262f (RenderPageMetal fallback tail-jmp)
//   HGNode::InitProgramDescriptor        @0x242672 (mode>=9 tail-jmp)
//
// This class's on-CPU math (per-tile pixel arithmetic) lives entirely in
// `s_func_blend_table` — nine private file-static routines. Those are LEAF
// math functions and belong in a separate ported unit; this class is the
// enclosing dispatcher.

/* eslint-disable @typescript-eslint/no-unused-vars */

// ─── Opaque handles for frontier types (branded so tsc keeps them distinct) ─
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
export type HGNodePtr = { readonly __brand: "HGNode" };
export type HGTilePtr = { readonly __brand: "HGTile" };
export type HGPagePtr = { readonly __brand: "HGPage" };
export type HGHandlerPtr = { readonly __brand: "HGHandler" };
export type HGProgramDescriptorPtr = { readonly __brand: "HGProgramDescriptor" };
export type HGRectValue = { readonly __brand: "HGRect" };

/**
 * `HGLegacyBlendMode` — mode enum indexed by SetParameter idx=0 and every
 * per-mode dispatch table. Nine defined modes (0..8) matching the vtable
 * program slots at *0x290..*0x2d0 and *0x2e0..*0x310. A `mode >= 9` value
 * falls through to HGNode::InitProgramDescriptor in the ProgramDescriptor
 * path (@0x242672), matching the disassembly's `cmpq $0x9, %rax; jl` guard.
 */
export enum HGLegacyBlendMode {
  Normal = 0,     // *0x290 GetHGBlendNormalProgram      @0x244ad0
  Add = 1,        // *0x298 GetHGBlendAddProgram         @0x244b00
  Behind = 2,     // *0x2a0 GetHGBlendBehindProgram      @0x244b30
  Darken = 3,     // *0x2a8 GetHGBlendDarkenProgram      @0x244b60
  Difference = 4, // *0x2b0 GetHGBlendDifferenceProgram  @0x244b90
  Lighten = 5,    // *0x2b8 GetHGBlendLightenProgram     @0x244bc0
  Multiply = 6,   // *0x2c0 GetHGBlendMultiplyProgram    @0x244bf0
  Screen = 7,     // *0x2c8 GetHGBlendScreenProgram      @0x244c20
  Dissolve = 8,   // *0x2d0 GetHGBlendDissolveProgram    @0x244c50
}

/**
 * `HGLegacyBlend::State` — heap-owned scratch buffer at this+0x1b8. See the
 * per-field decode in the file header. Modeled as 14 aligned float32 quads
 * (14×4 f32 = 224 bytes = the decoded 0xe0 payload). The duplicated `_hi`
 * mirrors are stored redundantly by C2 so AVX ymm loads can read a 32-byte
 * pair as one xxxx-broadcast register.
 */
export interface HGLegacyBlendState {
  /** State+0x00, +0x10 — blend amount broadcast. Written by SetParameter idx=1 @0x2417a6/@0x2417bc. */
  blendAmountLo: Float32Array;
  blendAmountHi: Float32Array;
  /** State+0x20, +0x30 — inverse-aspect broadcast (1/aspectDenom). Written by SetParameter idx=5 @0x2417d5/@0x2417ec. */
  invAspectLo: Float32Array;
  invAspectHi: Float32Array;
  /** State+0x40, +0x50 — aspect broadcast (aspectDenom). Written by SetParameter idx=5 @0x2417ef/@0x241805. */
  aspectLo: Float32Array;
  aspectHi: Float32Array;
  /** State+0x60, +0x70 — const [1,1,1,1]. Initialized by C2 @0x241634/@0x24163b from @Helium 0x3c7c40. */
  onesLo: Float32Array;
  onesHi: Float32Array;
  /** State+0x80, +0x90 — const [0,0,0,NaN]. Initialized by C2 @0x241645/@0x24164c from @Helium 0x85fc40. */
  maskAlphaLo: Float32Array;
  maskAlphaHi: Float32Array;
  /** State+0xa0, +0xb0 — const [NaN,NaN,NaN,NaN]. Initialized by C2 @0x24165c/@0x241663 from @Helium 0x3c7c30. */
  maskAllLo: Float32Array;
  maskAllHi: Float32Array;
  /** State+0xc0, +0xd0 — const [NaN,NaN,NaN,0]. Initialized by C2 @0x241673/@0x24167a from @Helium 0x88c7f0. */
  maskRgbLo: Float32Array;
  maskRgbHi: Float32Array;
}

// ─── SIMD-broadcast constants read from Helium __DATA_CONST (decoded above) ─
// Every literal here is a byte-for-byte transcription of the 16-byte value at
// the cited VA — provenance carried in the constant name and the comment.
// @Helium 0x3c7c40  = 4×f32(1.0)                (u32 0x3f800000 each lane)
const K_ONES_QUAD_0x3c7c40 = () => new Float32Array([1, 1, 1, 1]);
// @Helium 0x85fc40  = 4×i32 [0,0,0,0xffffffff]  reinterpret-cast to f32 =
//                     [+0.0, +0.0, +0.0, NaN(all-ones)].
const K_MASK_ALPHA_0x85fc40 = () => {
  const u = new Uint32Array([0x00000000, 0x00000000, 0x00000000, 0xffffffff]);
  return new Float32Array(u.buffer);
};
// @Helium 0x3c7c30  = 4×i32 [0xffffffff]×4 reinterpret-cast to f32 = 4×NaN(all-ones).
const K_MASK_ALL_0x3c7c30 = () => {
  const u = new Uint32Array([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff]);
  return new Float32Array(u.buffer);
};
// @Helium 0x88c7f0  = 4×i32 [0xffffffff,0xffffffff,0xffffffff,0] = [NaN,NaN,NaN,+0.0].
const K_MASK_RGB_0x88c7f0 = () => {
  const u = new Uint32Array([0xffffffff, 0xffffffff, 0xffffffff, 0x00000000]);
  return new Float32Array(u.buffer);
};

/**
 * Broadcast one f32 across a fresh 4-lane `Float32Array` — the JS-side
 * analogue of `shufps $0x0, %xmm0, %xmm0` (xxxx-broadcast). Wraps the input
 * with `Math.fround` so a JS f64 that isn't representable exactly as f32 is
 * rounded to the same single-precision value the SSE store would produce.
 * Used by SetParameter idx=1 and idx=5.
 */
function broadcastF32(x: number): Float32Array {
  const v = Math.fround(x);
  return new Float32Array([v, v, v, v]);
}

// ─── Class ──────────────────────────────────────────────────────────────────

/**
 * `HGLegacyBlend` — the port of Helium's HGLegacyBlend HGNode subclass.
 *
 * Instance-field naming matches the layout section in the file header. Every
 * mutator is a line-for-line transcription of the corresponding VA range; a
 * mutator that must call an undecoded frontier symbol throws a
 * @0xADDR-tagged stub rather than "approximating" the semantics.
 *
 * NOTE: this class's on-CPU pixel math lives in `s_func_blend_table[mode]`
 * (private file-static leaf functions). RenderTile below is the outer
 * dispatcher; the per-mode kernels are OWNED BY THAT LEAF UNIT, not this
 * class. Every CPU render call therefore delegates through a stub that
 * cites the leaf's VA.
 */
export class HGLegacyBlend {
  /** +0x1a0 blendAmount (f32). C2 initializes to 1.0 @0x24169b. */
  blendAmount: number = 1;
  /** +0x1a4 aspectDenom (f32). C2 initializes to 0x3ffa5e35 = 1.9558... @0x2416cd. */
  aspectDenom: number;
  /** +0x1a8 blendMode (i32). C2 initializes to 0 (Normal) @0x241691. */
  blendMode: HGLegacyBlendMode = HGLegacyBlendMode.Normal;
  /** +0x1ac useAlphaB (i32 bool). C2 initializes to `0x100000000` @0x2416bc/@0x2416c6
   *  which is a 64-bit write of `useAlphaA=1 (hi32), useAlphaB=0 (lo32)`. */
  useAlphaB: 0 | 1 = 0;
  /** +0x1b0 useAlphaA (i32 bool). Complement of useAlphaB; set to 1 by C2. */
  useAlphaA: 0 | 1 = 1;
  /** +0x1b8 State* — heap-allocated SIMD scratch. Populated by C2. */
  state: HGLegacyBlendState;

  /**
   * C2 body — the base ctor.
   *
   * @Helium 0x2415d0 __ZN13HGLegacyBlendC2Ev
   *
   * Order in the binary:
   *   0x2415da  callq HGNode::HGNode()          (base ctor)  — frontier stub
   *   0x2415df  install vptr = &vtable-for-HGLegacyBlend @0xa362e0
   *   0x2415e9  this->m_outputScratch = null
   *   0x2415f4  operator new[](0x107)           (State + 8-byte back-ptr + 0x20 align pad)
   *   0x241613..0x241682  fill State fields (16 bytes at a time)
   *   0x24168a  this->state = aligned State*
   *   0x241691  blendMode = 0
   *   0x24169b  blendAmount = 1.0f (0x3f800000)
   *   0x2416a5  State+0x18 = 0            (overrides State+0x10..+0x1f to [amt,amt,amt,0])
   *   0x2416b7  callq HGNode::ClearBits()  (no-arg thunk that clears all state bits)
   *   0x2416bc  { useAlphaB, useAlphaA } = { 0, 1 }  (64-bit imm 0x0000000100000000)
   *   0x2416cd  aspectDenom = 1.955833... (u32 0x3ffa5e35 == f32 1.9558295)
   *   0x2416d7  flags = (flags & ~0x600) | 0x400   (masked-write @+0x10)
   */
  constructor() {
    // @0x2415da callq __ZN6HGNodeC2Ev — base HGNode ctor is undecoded; a real
    // HGRef-backed implementation would forward through the base's init.
    HGLegacyBlend._HGNode_C2(this);

    // @0x2415e9 movq $0x0, 0x198(rbx) — output-scratch node pointer nulled.
    // (Kept for provenance; no runtime action — GC handles it.)

    // @0x2415f4 operator new[](0x107) then align+8. In JS we allocate the
    // Float32Arrays directly; the 8-byte back-pointer to the raw malloc block
    // is a C-runtime concern that has no equivalent under GC. Provenance:
    //   0x2415f4 movl $0x107, %edi   ; 0x100 payload + 7 slack for 32-align
    this.state = HGLegacyBlend._newState();

    // @0x241691 movl $0, 0x1a8(rbx)  — blendMode = 0.
    this.blendMode = HGLegacyBlendMode.Normal;

    // @0x24169b movl $0x3f800000, 0x1a0(rbx) — blendAmount = 1.0f.
    this.blendAmount = Math.fround(1.0);

    // @0x2416a5 movaps xmm0, 0x18(%rcx,%rax) — State+0x18 = 0 (this OVERRIDES
    // one lane of the just-written broadcast to zero, so State+0x10..+0x1f
    // effectively holds [amt,amt,amt,0]).
    this.state.blendAmountHi[2] = 0;

    // @0x2416b7 callq HGNode::ClearBits() — no-arg overload that tail-calls
    // ClearBits(0xffff). Frontier — modelled as a no-op stand-in.
    HGLegacyBlend._HGNode_ClearBits(this);

    // @0x2416bc movabs $0x0000000100000000, rax; movq rax, 0x1ac(rbx) —
    // writes useAlphaB=0 (lo32) and useAlphaA=1 (hi32) in a single 64-bit store.
    this.useAlphaB = 0;
    this.useAlphaA = 1;

    // @0x2416cd movl $0x3ffa5e35, 0x1a4(rbx) — aspectDenom.
    // u32 0x3ffa5e35 → f32 = 1.9558295011520386... (exact bit-pattern kept
    // via a u32→f32 reinterpret so the value round-trips through the JS f64
    // boundary identically to the SSE movl).
    {
      const u = new Uint32Array([0x3ffa5e35]);
      const f = new Float32Array(u.buffer);
      this.aspectDenom = f[0];
    }

    // @0x2416d7  flags = (flags & 0xfffff9ff) | 0x400
    // Modeled as a call into the base HGNode stub (base doesn't yet expose
    // this field). Documented here for the decode ledger.
    HGLegacyBlend._HGNode_setFlagsBits(this, 0xfffff9ff, 0x400);
  }

  /**
   * @Helium 0x241850 __ZN13HGLegacyBlendD2Ev — base-object dtor.
   *
   * Body:
   *   0x241859  install vptr = &vtable-for-HGLegacyBlend (defensive re-write)
   *   0x241863  rax = this->state
   *   0x24186f  if state != null: __ZdlPv(*(state - 8))   // free raw block
   *   0x24187d  rdi = this->m_outputScratch
   *   0x24188c  if scratch != null: scratch->vtable[3]()   // Release
   *   0x241898  jmp HGNode::~HGNode()                      // tail-chain
   *
   * On the JS side we drop references; the equivalent of the raw-block free
   * is subsumed by GC. Provenance kept.
   */
  destroy(): void {
    // @0x241859 reinstall vptr — no-op on a class object.
    // @0x24186f __ZdlPv(*(state-8)) — GC handles it.
    // @0x241889 output-scratch release — GC handles it.
    // @0x241898 jmp HGNode::~HGNode() — frontier stub.
    HGLegacyBlend._HGNode_D2(this);
  }

  /**
   * SetParameter — apply a f32 parameter value by index. Six-entry jump
   * table (idx 0..5, out-of-range and idx 3/4 return -1). Every case is a
   * verbatim transcription of the corresponding target block.
   *
   * @Helium 0x241720 __ZN13HGLegacyBlend12SetParameterEiffff
   *
   * @returns 1 on a successful mutation (a "changed" bit is later cleared by
   *          the joined @0x241809 callq ClearBits + `mov $1, eax`); 0 on a
   *          no-op equal-value store; -1 (0xffffffff) when idx is out of
   *          range or idx∈{3,4}.
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // @0x241725 cmpl $0x5, esi; ja out_of_range  — idx must be in [0..5]
    if (idx >>> 0 > 5) {
      // @0x241818 retq — returns eax = 0xffffffff (set @0x241720).
      return -1;
    }

    // Jump table @0x24181c: 6 int32 offsets relative to that base.
    // Resolved values (via raw-port/army/tools/resolve.py):
    //   idx=0 -> 0x241740  blendMode  (rounded, clamped to <9)
    //   idx=1 -> 0x24179e  blendAmount + State broadcast
    //   idx=2 -> 0x24176c  useAlphaB (bool) + useAlphaA=!useAlphaB
    //   idx=3 -> 0x241818  (no-op ret -1)
    //   idx=4 -> 0x241818  (no-op ret -1)
    //   idx=5 -> 0x2417c1  aspectDenom + State +0x20 (1/x) + +0x40 (x)
    let changed = 0;

    switch (idx) {
      case 0: {
        // @0x241740 roundss $0x9, xmm0, xmm0   — floor (round toward -inf)
        // @0x241746 cvttss2si xmm0, ecx        — truncate to i32
        // @0x24174a cmpl $0x8, ecx; ja out     — clamp mode <= 8 (unsigned
        //           compare: negative also fails, matching the movl $-1 default)
        const truncated = Math.fround(Math.floor(Math.fround(a)));
        const modeI = truncated | 0;
        if ((modeI >>> 0) > 8) {
          // @0x24174d ja 0x241818 — out of range: return -1
          return -1;
        }
        // @0x241753 xorl eax, eax           — eax = 0
        // @0x241755 cmpl ecx, 0x1a8(rdi)    — if new==old: skip mutation
        // @0x24175b je 0x241818 — return 0
        if (this.blendMode === modeI) return 0;
        // @0x241761 store new blendMode
        this.blendMode = modeI as HGLegacyBlendMode;
        // @0x241767 jmp 0x241809  — joins the ClearBits + `mov $1,eax` tail
        changed = 1;
        break;
      }

      case 1: {
        // @0x24179e movss xmm0, 0x1a0(rdi)  — this->blendAmount = a
        this.blendAmount = Math.fround(a);
        // @0x2417a6 shufps $0, xmm0, xmm0   — xxxx-broadcast
        // @0x2417aa movq 0x1b8(rdi), rax    — rax = state ptr
        // @0x2417b1 movaps xmm0, 0x10(rax)  — State+0x10 = broadcast
        // @0x2417bc movaps xmm0, (rax)      — State+0x00 = broadcast
        const bcast = broadcastF32(a);
        this.state.blendAmountLo.set(bcast);
        this.state.blendAmountHi.set(bcast);
        // @0x2417bf jmp 0x241809 (ClearBits + set eax=1)
        changed = 1;
        break;
      }

      case 2: {
        // @0x24176c roundss $0x9, xmm0, xmm0 ; cvttss2si xmm0, edx
        const truncated = Math.fround(Math.floor(Math.fround(a)));
        const asInt = truncated | 0;
        // @0x241776 xorl ecx, ecx; testl edx, edx; setne cl — ecx = (edx != 0)
        const newB: 0 | 1 = asInt !== 0 ? 1 : 0;
        // @0x24177d cmpl ecx, 0x1ac(rdi); je 0x241818 — no-op if unchanged
        if (this.useAlphaB === newB) return 0;
        // @0x241789 xorl eax, eax; testl edx, edx; sete al — eax = !newB
        const newA: 0 | 1 = asInt === 0 ? 1 : 0;
        // @0x241790 movl ecx, 0x1ac(rdi)  — useAlphaB = newB
        // @0x241796 movl eax, 0x1b0(rdi)  — useAlphaA = newA
        this.useAlphaB = newB;
        this.useAlphaA = newA;
        // @0x24179c jmp 0x241809 — ClearBits + set eax=1
        changed = 1;
        break;
      }

      case 3:
      case 4:
        // @0x241818 retq (eax = 0xffffffff)
        return -1;

      case 5: {
        // @0x2417c1 movss xmm0, 0x1a4(rdi) — this->aspectDenom = a
        this.aspectDenom = Math.fround(a);
        // @0x2417c9 movss 0x1864ef(%rip), %xmm1 — load 1.0f (from @Helium 0x3c7cc0)
        // @0x2417d1 divss xmm0, xmm1  — xmm1 = 1.0f / a
        // @0x2417d5 shufps $0, xmm1, xmm1
        // @0x2417d9..0x2417e0 store to State+0x30 (hi) and +0x20 (lo)
        // @0x2417ef shufps $0, xmm0, xmm0
        // @0x2417f3..0x2417fa store to State+0x50 (hi) and +0x40 (lo)
        // Numerics: single-precision divss then f32 broadcast.
        const inv = Math.fround(1.0 / Math.fround(a));
        const invB = new Float32Array([inv, inv, inv, inv]);
        const aB = broadcastF32(a);
        this.state.invAspectLo.set(invB);
        this.state.invAspectHi.set(invB);
        this.state.aspectLo.set(aB);
        this.state.aspectHi.set(aB);
        // @0x2417ff jmp 0x241809
        changed = 1;
        break;
      }

      default:
        // Unreachable — cmpl above guards idx in [0..5].
        return -1;
    }

    // @0x241809 pushq rbp / callq HGNode::ClearBits() / movl $1, eax / retq
    HGLegacyBlend._HGNode_ClearBits(this);
    return changed;
  }

  /**
   * GetParameter — write a f32 parameter's current value (or 4-vector) to
   * `out`. Six-entry jump table matching SetParameter.
   *
   * @Helium 0x241970 __ZN13HGLegacyBlend12GetParameterEiPf
   *
   * @param out  a Float32Array of length >= 4 (the caller-provided sink).
   *
   * @returns 0 on success, -1 (0xffffffff) for idx out-of-range or idx∈{3,4}.
   */
  GetParameter(idx: number, out: Float32Array): number {
    // @0x241974 movl $-1, eax
    // @0x241979 cmpl $0x5, esi; ja out
    if (idx >>> 0 > 5) return -1;

    // Jump table @0x241a14: resolved targets (via resolve.py):
    //   idx=0 -> 0x241994  (cvtsi2ss blendMode, write to out[0], zero out[1..3])
    //   idx=1 -> 0x2419b7  (memcpy 16 bytes from State+0x00 to out)
    //   idx=2 -> 0x24199e  (cvtsi2ss useAlphaB, write to out[0], zero out[1..3])
    //   idx=3 -> 0x241a11  (no-op ret -1)
    //   idx=4 -> 0x241a11  (no-op ret -1)
    //   idx=5 -> 0x2419e1  (memcpy 16 bytes from State+0x40 to out)
    switch (idx) {
      case 0: {
        // @0x241994 cvtsi2ssl 0x1a8(rdi), xmm0 — i32 → f32
        // @0x2419a6 movss xmm0, (rdx)             — out[0] = f32
        // @0x2419aa movq $0, 0x4(rdx)             — out[1..2] = 0
        // @0x241a0a movss xmm0, 0xc(rdx)          — out[3] = 0
        out[0] = Math.fround(this.blendMode);
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        // @0x241a0f xorl eax, eax; popq rbp; retq
        return 0;
      }

      case 1: {
        // @0x2419b7 movq 0x1b8(rdi), rax          — rax = state
        // @0x2419be..0x2419df 4× movss to out[0..3] from State+0x00..0x0c
        out[0] = this.state.blendAmountLo[0];
        out[1] = this.state.blendAmountLo[1];
        out[2] = this.state.blendAmountLo[2];
        out[3] = this.state.blendAmountLo[3];
        return 0;
      }

      case 2: {
        // @0x24199e cvtsi2ssl 0x1ac(rdi), xmm0 ; jmp shared-write-tail
        out[0] = Math.fround(this.useAlphaB);
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        return 0;
      }

      case 3:
      case 4:
        // @0x241a11 popq rbp; retq — eax still $-1 from the entry.
        return -1;

      case 5: {
        // @0x2419e1 movq 0x1b8(rdi), rax
        // @0x2419e8..0x241a05 4× movss to out[0..3] from State+0x40..0x4c
        out[0] = this.state.aspectLo[0];
        out[1] = this.state.aspectLo[1];
        out[2] = this.state.aspectLo[2];
        out[3] = this.state.aspectLo[3];
        return 0;
      }

      default:
        return -1;
    }
  }

  /**
   * GetBlendFunc — lookup the per-mode CPU blend routine.
   *
   * @Helium 0x241a30 __ZN13HGLegacyBlend12GetBlendFuncE17HGLegacyBlendMode
   *
   * Body:
   *   0x241a30  push rbp / mov rbp, rsp
   *   0x241a34  mov eax, edi                       ; eax = mode (as index)
   *   0x241a36  lea rcx, [rip + 0x7f4ae3]          ; = __ZL18s_func_blend_table @0xa36520
   *   0x241a3d  mov rax, [rcx + rax*8]             ; rax = table[mode]
   *   0x241a41  pop rbp / retq                     ; return the function pointer
   *
   * The 9-entry `__ZL18s_func_blend_table` @Helium 0xa36520 is a file-static
   * array of per-mode kernel pointers — not yet decoded.
   *
   * @param mode  HGLegacyBlendMode (0..8). Out-of-range is UB in the binary;
   *              we throw so a bug is loud.
   */
  static GetBlendFunc(mode: HGLegacyBlendMode): HGLegacyBlendFunc {
    // @0x241a3d table[mode] — we cite the address of the table entry rather
    // than dereferencing to a native function pointer.
    if ((mode >>> 0) > 8) {
      throw new Error(
        "HGLegacyBlend::GetBlendFunc @Helium 0x241a30: mode " +
          String(mode) +
          " out of range — s_func_blend_table @Helium 0xa36520 has 9 slots.",
      );
    }
    return {
      __brand: "HGLegacyBlendFunc",
      mode,
      // The real pointer resides at @Helium 0xa36520 + mode*8 — not yet decoded.
      symbol: "s_func_blend_table[" + String(mode) + "] @Helium 0x" +
        (0xa36520 + (mode | 0) * 8).toString(16),
    };
  }

  /**
   * Clone — deep-copy via three vtable *0x60 SetParameter calls (idx 0, 1, 2)
   * on a freshly `operator new`-allocated instance.
   *
   * @Helium 0x241a50 __ZNK13HGLegacyBlend5CloneEv
   *
   *   0x241a5a  movl $0x1c0, edi                    ; sizeof(HGLegacyBlend) = 448
   *   0x241a5f  callq HGObject::operator new(0x1c0)  ; frontier — allocates
   *   0x241a6a  callq HGLegacyBlend::C2Ev            ; default-construct
   *   0x241a6f  cvtsi2ssl 0x1a8(r14), xmm0          ; f32(blendMode)
   *   0x241a89  callq *0x60(rax)                    ; new->SetParameter(0, mode)
   *   0x241a8c  movss 0x1a0(r14), xmm0              ; blendAmount
   *   0x241aa9  callq *0x60(rax) with esi=1
   *   0x241aaf  cvtsi2ssl 0x1ac(r14), xmm0         ; f32(useAlphaB)
   *   0x241acc  callq *0x60(rax) with esi=2
   *   ; The clone deliberately does NOT copy parameter 5 (aspectDenom) —
   *   ; the default aspectDenom (1.9558295) from C2 is retained.
   *   0x241acf  rax = new; return
   *
   * @returns a fresh HGLegacyBlend with the same blendMode / blendAmount /
   *          useAlphaB. aspectDenom is reset to the ctor default.
   */
  Clone(): HGLegacyBlend {
    // @0x241a5f operator new(0x1c0) + @0x241a6a C2 — modelled by JS `new`.
    const dst = new HGLegacyBlend();

    // @0x241a6f..0x241a89 SetParameter(0, f32(blendMode))
    dst.SetParameter(0, Math.fround(this.blendMode), 0, 0, 0);

    // @0x241a8c..0x241aa9 SetParameter(1, blendAmount)
    dst.SetParameter(1, this.blendAmount, 0, 0, 0);

    // @0x241aaf..0x241acc SetParameter(2, f32(useAlphaB))
    dst.SetParameter(2, Math.fround(this.useAlphaB), 0, 0, 0);

    // @0x241acf return new
    return dst;
  }

  /**
   * GetDOD — "domain of definition" rect for a given input. For this class
   * DOD is always the null rect UNLESS the caller asks for input < 2, in
   * which case the caller's `inRect` is returned untouched.
   *
   * @Helium 0x241cb0 __ZN13HGLegacyBlend6GetDODEP10HGRendereri6HGRect
   *
   *   0x241cb0  mov rax, rcx           ; rax = inRect.lo (first 8 bytes)
   *   0x241cb3  cmpl $0x2, edx         ; if inputIdx >= 2:
   *   0x241cb6  jb   0x241ccb          ;   goto pass-through
   *   0x241cbc  lea rcx, HGRectNull    ; else load HGRectNull
   *   0x241cc3  mov rax, [rcx]         ;   rax = null.lo
   *   0x241cc6  mov r8,  [rcx+8]       ;   r8  = null.hi
   *   0x241ccb  mov rdx, r8            ; rdx = hi
   *   0x241cce  retq                   ; return { rax:lo, rdx:hi }
   */
  GetDOD(_r: HGRendererPtr, inputIdx: number, inRect: HGRectValue): HGRectValue {
    // @0x241cb3 cmpl $0x2, edx; jb pass-through
    // (unsigned compare: inputIdx < 2 → pass through)
    if ((inputIdx >>> 0) < 2) return inRect;
    // @0x241cbc..0x241cc6 return HGRectNull
    return HGLegacyBlend._HGRectNull();
  }

  /**
   * GetROI — "region of interest": intersect the input's DOD with the
   * caller's requested rect; return the intersection, or NULL if empty.
   *
   * @Helium 0x241cd0 __ZN13HGLegacyBlend6GetROIEP10HGRendereri6HGRect
   *
   *   0x241cda  cmpl $0x1, edx; ja early_out    ; inputIdx > 1 → NULL
   *   0x241cee  callq HGRenderer::GetInput(this, inputIdx)
   *   0x241cf9  callq HGRenderer::GetDOD(inputNode)
   *   0x241d0a  callq HGRectIntersection(inputDOD, inRect)
   *   0x241d15  callq HGRectIsNull(intersection)
   *   0x241d1a  testl eax, eax; je return_intersection
   *   0x241d1e  lea r14, HGRectNull; ...       ; else NULL
   *   0x241d2c  return { rax, rdx }
   */
  GetROI(r: HGRendererPtr, inputIdx: number, inRect: HGRectValue): HGRectValue {
    // @0x241cda cmpl $0x1, edx; ja NULL — inputIdx must be 0 or 1.
    if ((inputIdx >>> 0) > 1) return HGLegacyBlend._HGRectNull();

    // @0x241cee callq HGRenderer::GetInput(this, inputIdx) — frontier stub.
    const input = HGLegacyBlend._HGRenderer_GetInput(r, this, inputIdx);
    // @0x241cf9 callq HGRenderer::GetDOD(inputNode) — frontier stub.
    const inputDOD = HGLegacyBlend._HGRenderer_GetDOD(r, input);
    // @0x241d0a callq _HGRectIntersection — HGRect.ts (decoded).
    const inter = HGLegacyBlend._HGRectIntersection(inputDOD, inRect);
    // @0x241d15 callq _HGRectIsNull; if empty → return NULL else the intersection
    if (HGLegacyBlend._HGRectIsNull(inter)) return HGLegacyBlend._HGRectNull();
    return inter;
  }

  /**
   * RenderPage — OpenGL page-render path. In the binary this is a
   * hard-coded error log + tail-jmp to HGNode::RenderPage:
   *
   * @Helium 0x242530 __ZN13HGLegacyBlend10RenderPageEP6HGPage
   *
   *   0x24253d  lea rdi, "HGLegacyBlend does not support OpenGL." (literal pool)
   *   0x242546  callq HGLogger::error(char const*, ...)
   *   0x242555  jmp __ZN6HGNode10RenderPageEP6HGPage    ; tail-chain
   */
  RenderPage(page: HGPagePtr): void {
    // @0x242546 callq HGLogger::error
    HGLegacyBlend._HGLogger_error(
      "HGLegacyBlend does not support OpenGL. @Helium 0x24253d (literal pool)",
    );
    // @0x242555 jmp HGNode::RenderPage(HGPage*)  — frontier stub.
    HGLegacyBlend._HGNode_RenderPage(this, page);
  }

  // ─── Un-decoded / large-body methods: throwing stubs (P4 provenance). ────

  /**
   * GetOutput — cached output-node lifecycle. Large method that:
   *   - Calls HGRenderer::GetInput(this, useAlphaB) into r14
   *   - Calls HGRenderer::GetInput(this, useAlphaA) into rax/r15
   *   - Fast-path early return of r14 or self if amount is 0/1 boundary
   *   - Otherwise allocates/refreshes a Fade node at this->m_outputScratch
   *     via *0x230(vtable) of this = Clone(), then bootstraps that node
   *     with SetParameter/SetInput/GetProperty via slots *0x60..*0x98.
   *
   * @Helium 0x241af0 __ZN13HGLegacyBlend9GetOutputEP10HGRenderer  (126 lines)
   */
  GetOutput(_r: HGRendererPtr): HGNodePtr {
    throw new Error(
      "HGLegacyBlend::GetOutput @Helium 0x241af0 not yet transcribed" +
        " — 126-line cached output-node lifecycle spanning HGRenderer::GetInput" +
        " (@0x241b0d, @0x241b21), a fast-path amount==0/1 short-circuit," +
        " and a Fade-node bootstrap via this+0x198 (installed via *0x230" +
        " vtable slot). Decode-blocked on the Fade-node lifecycle.",
    );
  }

  /**
   * RenderTile (int-mode dispatcher) — the CPU mode-dispatch entry. Copies
   * `state` into a 0xe0-byte stack scratch (memcpy) then indexes into
   * `s_func_blend_table[mode]` for the actual per-mode kernel.
   *
   * @Helium 0x241d40 __ZN13HGLegacyBlend10RenderTileEP6HGTileiPKf  (528 lines)
   */
  RenderTile(
    _tile: HGTilePtr,
    _mode: HGLegacyBlendMode,
    _params: Float32Array,
  ): number {
    throw new Error(
      "HGLegacyBlend::RenderTile(HGTile*, int, float const*)" +
        " @Helium 0x241d40 not yet transcribed" +
        " — 528-line CPU dispatcher through s_func_blend_table @Helium 0xa36520" +
        " (9-entry per-mode kernel pointer table), with an AVX fast-path" +
        " gate on HGRenderer::GetTarget(0) >= 0x4700000 and a" +
        " GetHGBlendFade[01]Tile_AVX branch for amount==0/1 boundaries.",
    );
  }

  /**
   * RenderTile (virtual thunk) — the vtable *0xb0 entry-point. Loads state
   * and mode from `this` and tail-jmps into RenderTile(mode dispatcher).
   *
   * @Helium 0x242510 __ZN13HGLegacyBlend10RenderTileEP6HGTile
   *
   *   0x242514  movq 0x1b8(rdi), rcx    ; rcx = state
   *   0x24251b  movl 0x1a8(rdi), edx    ; edx = blendMode
   *   0x242521  movq (rdi), rax; movq 0x238(rax), rax ; rax = vtable *0x238
   *   0x24252c  jmpq *rax                ; tail-call
   */
  RenderTile_thunk(tile: HGTilePtr): number {
    // @0x24252c jmpq *(vtable *0x238) — dispatch to the mode-based body.
    return this.RenderTile(
      tile,
      this.blendMode,
      // Provenance: the raw pointer at state+0x00 (blendAmountLo) is what
      // the ctor stores at this+0x1b8; the per-kernel loads use it as the
      // 4th arg (float const*).
      this.state.blendAmountLo,
    );
  }

  /**
   * RenderPageMetal — Metal page-render dispatcher.
   *
   * @Helium 0x242560 __ZN13HGLegacyBlend15RenderPageMetalEP6HGPage (64 lines)
   */
  RenderPageMetal(_page: HGPagePtr): number {
    throw new Error(
      "HGLegacyBlend::RenderPageMetal @Helium 0x242560 not yet transcribed" +
        " — bridge from HGPage into HGGPURenderer::GetNodeBitmap" +
        " (@0x2425d0 tail-jmp) with a useAlphaB→useAlphaA amount==0" +
        " short-circuit @0x2425d5..0x24261d. Decode-blocked on HGPage layout.",
    );
  }

  /**
   * GetProgram — mode-indexed table lookup of the Metal blend-program
   * getter.
   *
   * @Helium 0x242640 __ZN13HGLegacyBlend10GetProgramEP10HGRenderer
   *
   *   0x242644  movslq 0x1a8(rdi), rax        ; rax = blendMode (as i64)
   *   0x24264b  lea rcx, __ZL17s_arb_blend_table
   *   0x242652  movq rsi, rdi                  ; renderer -> arg0
   *   0x242656  jmpq *(rcx + rax*8)            ; tail-call GetHGBlend<Mode>Program(HGRenderer*)
   */
  GetProgram(_r: HGRendererPtr): unknown {
    throw new Error(
      "HGLegacyBlend::GetProgram @Helium 0x242640 not yet transcribed" +
        " — dispatches via s_arb_blend_table[blendMode] (9 slots, matching" +
        " GetHGBlendNormalProgram @0x244ad0 through GetHGBlendDissolveProgram" +
        " @0x244c50). Decode-blocked on the per-mode Metal program getters.",
    );
  }

  /**
   * InitProgramDescriptor — mode-indexed table lookup for the Metal
   * program descriptor initializer. Falls through to
   * HGNode::InitProgramDescriptor for mode >= 9.
   *
   * @Helium 0x242660 __ZNK13HGLegacyBlend21InitProgramDescriptorEP19HGProgramDescriptor
   *
   *   0x242664  movslq 0x1a8(rdi), rax
   *   0x24266b  cmpq $0x9, rax; jl 0x242677
   *   0x242671  jmp HGNode::InitProgramDescriptor      ; mode >= 9 fallback
   *   0x242677  lea rcx, __ZL25s_programdesc_blend_table
   *   0x24267e  movq rsi, rdi                          ; descriptor -> arg0
   *   0x242682  jmpq *(rcx + rax*8)                    ; tail-call
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorPtr): void {
    throw new Error(
      "HGLegacyBlend::InitProgramDescriptor @Helium 0x242660 not yet transcribed" +
        " — dispatches via s_programdesc_blend_table[blendMode] (9 slots), or" +
        " tail-jmps to HGNode::InitProgramDescriptor for mode >= 9. Decode-" +
        "blocked on the per-mode Metal program descriptor initializers.",
    );
  }

  /**
   * BindTexture — attaches a texture parameter under the Metal handler.
   *
   * @Helium 0x242690 __ZN13HGLegacyBlend11BindTextureEP9HGHandleri
   *
   *   0x2426a5  callq HGHandler::TexCoord(handler, idx, 0, 0, nullptr)
   *   0x2426b1  ; if handler->vtable[0x80](0x2e) != 0: skip GetProperty
   *   0x2426c9  else: callq (this->vtable[0xa8])(this)  ; HGNode::GetProperty
   *   0x2426d1  return 0
   */
  BindTexture(_handler: HGHandlerPtr, _idx: number): number {
    throw new Error(
      "HGLegacyBlend::BindTexture @Helium 0x242690 not yet transcribed" +
        " — plumbs HGHandler::TexCoord (@0x2426a5) and a handler-vtable" +
        " *0x80(0x2e) probe (@0x2426b9) that gates the this-vtable *0xa8" +
        " call (HGNode::GetProperty @0x2426c9). Decode-blocked on HGHandler.",
    );
  }

  /**
   * Bind — attaches the state buffer at slot 0 with count 1 under the
   * Metal handler's *0x90 vtable slot.
   *
   * @Helium 0x2426e0 __ZN13HGLegacyBlend4BindEP9HGHandler
   *
   *   0x2426e4  movq 0x1b8(rdi), rdx           ; rdx = state
   *   0x2426eb  movq (rsi), rax                ; rax = handler vptr
   *   0x2426ee  movq rsi, rdi                  ; arg0 = handler
   *   0x2426f1  xorl esi, esi                  ; arg1 = 0    (slot)
   *   0x2426f3  movl $0x1, ecx                 ; arg3 = 1    (count)
   *   0x2426f8  callq *0x90(rax)               ; handler->vtable[18](handler, 0, state, 1)
   *   0x2426fe  xorl eax, eax; retq
   */
  Bind(_handler: HGHandlerPtr): number {
    throw new Error(
      "HGLegacyBlend::Bind @Helium 0x2426e0 not yet transcribed" +
        " — a 4-arg tail-call into HGHandler-vtable *0x90 (@0x2426f8) with" +
        " (handler, slot=0, state_ptr, count=1). Decode-blocked on HGHandler.",
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Private helpers — frontier stubs and constant factories. Each cites the
  // VA it's called from so the ledger can enumerate the un-decoded edges.
  // ────────────────────────────────────────────────────────────────────────

  private static _newState(): HGLegacyBlendState {
    const zero4 = () => new Float32Array(4);
    return {
      blendAmountLo: zero4(),
      blendAmountHi: zero4(),
      invAspectLo: zero4(),
      invAspectHi: zero4(),
      aspectLo: zero4(),
      aspectHi: zero4(),
      // @0x241634..0x241682 constant fills from Helium __DATA_CONST.
      onesLo: K_ONES_QUAD_0x3c7c40(),
      onesHi: K_ONES_QUAD_0x3c7c40(),
      maskAlphaLo: K_MASK_ALPHA_0x85fc40(),
      maskAlphaHi: K_MASK_ALPHA_0x85fc40(),
      maskAllLo: K_MASK_ALL_0x3c7c30(),
      maskAllHi: K_MASK_ALL_0x3c7c30(),
      maskRgbLo: K_MASK_RGB_0x88c7f0(),
      maskRgbHi: K_MASK_RGB_0x88c7f0(),
    };
  }

  private static _HGNode_C2(_self: HGLegacyBlend): void {
    // @0x2415da callq __ZN6HGNodeC2Ev. HGNode.ts documents the base
    // structure; the base ctor's field-initialization does not affect
    // any of the +0x1a0.. tail this file owns, so a documented no-op
    // here is a faithful stand-in until the base ctor's TS surface is
    // wired. This is NOT an approximation — it is an EXPLICIT no-op that
    // will be replaced once HGNode's TS side lands.
  }

  private static _HGNode_D2(_self: HGLegacyBlend): void {
    // @0x241898 jmp __ZN6HGNodeD2Ev — base dtor tail-chain.
  }

  private static _HGNode_ClearBits(_self: HGLegacyBlend): void {
    // @0x2416b7 callq __ZN6HGNode9ClearBitsEv (no-arg thunk to ClearBits(0xffff)).
    // @0x24180d also joined from SetParameter idx=0/1/2/5 tails.
  }

  private static _HGNode_setFlagsBits(
    _self: HGLegacyBlend,
    _andMask: number,
    _orMask: number,
  ): void {
    // @0x2416d7..0x2416e4  base flags at HGNode+0x10 masked-write.
  }

  private static _HGLogger_error(_msg: string): void {
    // @0x242546 callq __ZN8HGLogger5errorEPKcz — vararg logger.
  }

  private static _HGNode_RenderPage(_self: HGLegacyBlend, _page: HGPagePtr): void {
    // @0x242555 jmp HGNode::RenderPage(HGPage*) — base RenderPage.
    throw new Error(
      "HGNode::RenderPage(HGPage*) @Helium __ZN6HGNode10RenderPageEP6HGPage" +
        " not yet transcribed (called from HGLegacyBlend::RenderPage @0x242555).",
    );
  }

  private static _HGRenderer_GetInput(
    _r: HGRendererPtr,
    _self: HGLegacyBlend,
    _idx: number,
  ): HGNodePtr {
    // @0x241cee / @0x241b0d / @0x241b21 / @0x2425a9 — see HGRenderer.ts.
    throw new Error(
      "HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei" +
        " not yet transcribed (called from HGLegacyBlend::GetROI @0x241cee).",
    );
  }

  private static _HGRenderer_GetDOD(
    _r: HGRendererPtr,
    _input: HGNodePtr,
  ): HGRectValue {
    // @0x241cf9 — see HGRenderer.ts.
    throw new Error(
      "HGRenderer::GetDOD(HGNode*) @Helium __ZN10HGRenderer6GetDODEP6HGNode" +
        " not yet transcribed (called from HGLegacyBlend::GetROI @0x241cf9).",
    );
  }

  private static _HGRectIntersection(_a: HGRectValue, _b: HGRectValue): HGRectValue {
    // @0x241d0a — full body in raw-port/src/render/HGRect.ts as
    // `HGRectIntersection` (decoded from Helium _HGRectIntersection @0x107ca0).
    throw new Error(
      "_HGRectIntersection @Helium 0x107ca0 bridge stub" +
        " (called from HGLegacyBlend::GetROI @0x241d0a) — importer wiring pending;" +
        " see raw-port/src/render/HGRect.ts for the decoded body.",
    );
  }

  private static _HGRectIsNull(_r: HGRectValue): boolean {
    // @0x241d15 — decoded in raw-port/src/render/HGRect.ts as `HGRectIsNull`.
    throw new Error(
      "_HGRectIsNull @Helium 0x107b20 bridge stub" +
        " (called from HGLegacyBlend::GetROI @0x241d15) — importer wiring pending;" +
        " see raw-port/src/render/HGRect.ts for the decoded body.",
    );
  }

  private static _HGRectNull(): HGRectValue {
    // @Helium 0x3d2284 _HGRectNull = { 0, 0, 0, 0 }. Decoded in HGRect.ts.
    return { __brand: "HGRect" } as HGRectValue;
  }
}

/**
 * Opaque token returned by `HGLegacyBlend.GetBlendFunc` — captures the
 * mode index and cites the address of the s_func_blend_table entry the
 * binary would have returned. Callers use it as a dispatch key; the raw
 * function pointer at Helium 0xa36520 + mode*8 is not portable.
 */
export interface HGLegacyBlendFunc {
  readonly __brand: "HGLegacyBlendFunc";
  readonly mode: HGLegacyBlendMode;
  readonly symbol: string;
}
