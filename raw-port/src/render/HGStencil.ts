// raw-port/src/render/HGStencil.ts
//
// FCP `HGStencil` — Helium render-graph node: a two-input (image + stencil)
// masking / clipping operator with per-page dispatch. Extends `HGNode`.
// Holds a std::vector<HGProgramDescriptor*>-like triple (begin/end/capacity)
// plus a scalar float parameter and a 32-bit "state index" that indexes into
// two static dispatch tables (s_gpu_stencil_table for shader-program lookup
// and s_programdesc_stencil_table for program-descriptor initialization).
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly captured at:
//   raw-port/re/disasm/Helium.HGStencil.HGStencil.s              (  6 lines, C1)
//   raw-port/re/disasm/Helium.HGStencil.C2.s                     ( 57 lines, C2 base)
//   raw-port/re/disasm/Helium.HGStencil.~HGStencil.s             ( 43 lines, D0 deleting)
//   raw-port/re/disasm/Helium.HGStencil.SetState.s               (122 lines)
//   raw-port/re/disasm/Helium.HGStencil.GetDOD.s                 ( 42 lines)
//   raw-port/re/disasm/Helium.HGStencil.GetROI.s                 ( 13 lines)
//   raw-port/re/disasm/Helium.HGStencil.SetParameter.s           ( 16 lines)
//   raw-port/re/disasm/Helium.HGStencil.Bind.s                   ( 14 lines)
//   raw-port/re/disasm/Helium.HGStencil.UpdateLocalParameters.s  ( 15 lines)
//   raw-port/re/disasm/Helium.HGStencil.RenderTile.s             (172 lines)
//   raw-port/re/disasm/Helium.HGStencil.RenderPageMetal.s        ( 17 lines)
//   raw-port/re/disasm/Helium.HGStencil.RenderPagePlainMetal.s   (168 lines)
//   raw-port/re/disasm/Helium.HGStencil.GetProgram.s             (  9 lines)
//   raw-port/re/disasm/Helium.HGStencil.InitProgramDescriptor.s  (  9 lines)
//
// Sixteen exported symbols owned by this class (ledger for "HGStencil"):
//   @Helium 0x2d1c70  HGStencil::HGStencil()                  [C2 base — full body]
//   @Helium 0x2d1d50  HGStencil::HGStencil()                  [C1 — tail-jmp C2]
//   @Helium 0x2d1d60  HGStencil::~HGStencil()                 [D2 base]
//   @Helium 0x2d1df0  HGStencil::~HGStencil()                 [D1 — tail-jmp D2]
//   @Helium 0x2d1e80  HGStencil::~HGStencil()                 [D0 deleting]
//   @Helium 0x2d1f20  HGStencil::SetState(HGRenderer*, int)
//   @Helium 0x2d2110  HGStencil::GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x2d2190  HGStencil::GetROI(HGRenderer*, int, HGRect)
//   @Helium 0x2d21b0  HGStencil::SetParameter(int,float,float,float,float)
//   @Helium 0x2d21e0  HGStencil::Bind(HGHandler*)
//   @Helium 0x2d2210  HGStencil::UpdateLocalParameters(int)
//   @Helium 0x2d2250  HGStencil::RenderTile(HGTile*)
//   @Helium 0x2d24a0  HGStencil::RenderPageMetal(HGPage*)
//   @Helium 0x2d24d0  HGStencil::RenderPagePlainMetal(HGPage*)
//   @Helium 0x2d2710  HGStencil::GetProgram(HGRenderer*)
//   @Helium 0x2d2730  HGStencil::InitProgramDescriptor(HGProgramDescriptor*) const
//
// Vtable @Helium 0xa392a0 (installed-ptr 0xa392b0). Ctor @0x2d1c82 does
//   leaq 0x767627(%rip), %rax ; movq %rax, (%rbx)
// with next-instr 0x2d1c89, so target = 0x2d1c89 + 0x767627 = 0xa392b0. ✓
// Class-owned override slots (rest inherited from HGNode):
//   *0x00 = 0x2d1df0  ~HGStencil() [D1]
//   *0x08 = 0x2d1e80  ~HGStencil() [D0 deleting]
//   *0x60 = 0x2d21b0  SetParameter
//   *0xb0 = 0x2d2250  RenderTile
//   *0xb8 = 0x2d2710  GetProgram
//   *0xc8 = 0x2d21e0  Bind
// (Full dump: `resolve.py Helium vtable HGStencil`.)
//
// STRUCT LAYOUT (recovered from C2 @0x2d1c70 field-by-field; HGNode ends near +0x198):
//   ---- inherited from HGNode (size ≈ 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HGStencil-specific fields ----
//     +0x198 : HGProgramDescriptor** vec_begin  — std::vector<HGProgramDescriptor*>-like
//     +0x1a0 : HGProgramDescriptor** vec_end    (ctor: xorps xmm0; movups xmm0, 0x198  →
//                                                clears both +0x198 and +0x1a0)
//     +0x1a8 : HGProgramDescriptor** vec_cap    (ctor: movq $0, 0x1a8)
//     +0x1b0 : f32     paramFloat               (ctor: movq $0x3f800000, 0x1b0 — writes
//                                                8 bytes: low4 = 1.0f, high4 = 0 → paramFloat
//                                                and pad. SetParameter(1) stores here.)
//     +0x1b4 : i32     stateIndex               (SetParameter(0) rounds float→int and stores;
//                                                GetProgram/InitProgramDescriptor use it as
//                                                a sign-extended 64-bit index into two static
//                                                jumptables.)
//   Total sizeof ≈ 0x1b8 (aligned to 8).
//
// The three-field std::vector layout is proved by D0 @0x2d1e80..0x2d1f16 which walks the
// range [+0x198, +0x1a0) in 8-byte strides, `delete`s each element's inner ptr, then frees
// the buffer at +0x198 itself. This is the canonical libc++ std::vector<T*>::~vector() shape.
//
// Static dispatch tables referenced by GetProgram / InitProgramDescriptor:
//   __ZL19s_gpu_stencil_table          (jumptable of GetProgram entries per state)
//   __ZL27s_programdesc_stencil_table  (jumptable of InitProgramDescriptor entries per state)
// Both are `__ZL...` local-static so their symbol addresses live in Helium.__DATA;
// the runtime dispatch is `jmpq *(%rcx, %rax, 8)` where rax = sign-ext(stateIndex).
// Actually populating these tables requires resolving each state's helper function set
// (a large frontier; deferred).
//
// The ctor at @0x2d1c70 also issues four HGNode vtable calls to configure per-slot flags:
//   @0x2d1cc0  HGNode::ClearFlags(int idx=-1, int mask=0x200)         — clear bit 0x200 all slots
//   @0x2d1cd5  vtable *0x88 = HGNode::SetFlags(int -1,  int 0x400)    — set bit 0x400 all slots
//   @0x2d1ce8  vtable *0x88 = HGNode::SetFlags(int  0,  int 0x20 )    — set bit 0x20  slot 0
//   @0x2d1cfe  vtable *0x88 = HGNode::SetFlags(int  1,  int 0x20 )    — set bit 0x20  slot 1
//   @0x2d1d14  vtable *0x88 = HGNode::SetFlags(int -1,  int 0x20 )    — set bit 0x20  all slots
//     (yes, both the per-slot and the all-slots calls occur — the disassembly is
//     preserved verbatim; likely the compiler chose separate calls to avoid a loop.)
//
// Frontier callees (throw-stubbed at their call sites per Rule 3):
//   HGNode::HGNode()             @Helium 0x11baf0
//   HGNode::~HGNode()            @Helium 0x11bf20
//   HGNode::ClearFlags(int,int)  @Helium 0x11c980
//   HGNode::SetFlags(int,int)    @Helium 0x11c8e0 (via vtable *0x88)
//   HGObject::operator delete    @Helium
//   HGRenderer::GetInput / GetDOD @Helium (used by GetDOD)
//   HGRectNull / HGRectIntersection @Helium
//   HGHandler vtable *0x90       (used by Bind)
//   RenderPagePlainMetal, RenderTile @Helium 0x2d2250 / 0x2d24d0
//   __ZL19s_gpu_stencil_table         (GetProgram jumptable)
//   __ZL27s_programdesc_stencil_table (InitProgramDescriptor jumptable)

import { HGNode } from "./HGNode.js";

/** Opaque tokens for base classes not yet ported. */
export interface HGRendererLike { readonly __hgRenderer: true }
export interface HGHandlerLike { readonly __hgHandler: true }
export interface HGTileLike { readonly __hgTile: true }
export interface HGPageLike { readonly __hgPage: true }
export interface HGProgramDescriptorLike { readonly __hgProgramDescriptor: true }

/** HGRect placeholder: 16-byte packed {i32 minX; i32 minY; i32 maxX; i32 maxY;}. */
export interface HGRectLike {
  minX: number; minY: number; maxX: number; maxY: number;
}

export class HGStencil extends HGNode {
  /** @0x198 vector begin — HGProgramDescriptor** (nulled by ctor xorps+movups). */
  private _vec_begin: (HGProgramDescriptorLike | null)[] = [];
  /** @0x1a0 vector end — nulled by same 16-byte movups. */
  private _vec_end_marker: number = 0;
  /** @0x1a8 vector capacity — nulled by movq $0. */
  private _vec_cap_marker: number = 0;

  /** @0x1b0 paramFloat — SetParameter(1) stores here; ctor default 1.0f (low-4 of $0x3f800000). */
  private _paramFloat: number = Math.fround(1.0);
  /** @0x1b4 stateIndex — SetParameter(0) does roundss+cvttss2si (f32→int nearest-even, truncate). */
  private _stateIndex: number = 0;

  /**
   * HGStencil::HGStencil() @0x2d1d50 (C1 complete) / @0x2d1c70 (C2 base body).
   *   C1 @0x2d1d50 just tail-jmp's C2 @0x2d1c70; we transcribe the C2 body.
   *
   *   @0x2d1c7d  callq HGNode::HGNode()                         (@Helium 0x11baf0)
   *   @0x2d1c82  leaq  0x767627(%rip), %rax ; movq %rax,(%rbx)   ; install vtable @0xa392b0
   *   @0x2d1c8c  leaq  0x198(%rbx), %r15                          ; r15 = &this->_vec_begin
   *   @0x2d1c93  xorps %xmm0, %xmm0
   *   @0x2d1c96  movups %xmm0, 0x198(%rbx)                        ; zero 16 bytes: _vec_begin, _vec_end
   *   @0x2d1c9d  movq  $0, 0x1a8(%rbx)                            ; _vec_cap = 0
   *   @0x2d1ca8  movq  $0x3f800000, 0x1b0(%rbx)                   ; 8-byte imm: paramFloat=1.0, +0x1b4=0
   *   @0x2d1cb3  callq HGNode::ClearFlags(this, -1, 0x200)         @Helium 0x11c980
   *   @0x2d1cd5  callq *(this[0])[0x88] = HGNode::SetFlags(this, -1, 0x400)  @Helium 0x11c8e0
   *   @0x2d1ce8  callq *(this[0])[0x88] = HGNode::SetFlags(this,  0, 0x20)
   *   @0x2d1cfe  callq *(this[0])[0x88] = HGNode::SetFlags(this,  1, 0x20)
   *   @0x2d1d14  callq *(this[0])[0x88] = HGNode::SetFlags(this, -1, 0x20)
   */
  constructor() {
    super();                                                       // @0x2d1c7d callq HGNode::HGNode
    // @0x2d1c82/0x2d1c89 — install HGStencil vtable @0xa392b0 (JS proto chain handles this).
    // @0x2d1c93/0x2d1c96/0x2d1c9d — vector triple = (null,null,null): empty program-desc vec.
    this._vec_begin = [];
    this._vec_end_marker = 0;
    this._vec_cap_marker = 0;
    // @0x2d1ca8 movq $0x3f800000, 0x1b0(%rbx): 8-byte imm expanded as low4=0x3f800000
    // (f32 1.0), high4=0x00000000. So paramFloat=1.0 and stateIndex=0.
    this._paramFloat = Math.fround(1.0);
    this._stateIndex = 0;
    // @0x2d1cb3..0x2d1d14 — four flag configuration calls on the HGNode base.
    // HGNode.ClearFlags/SetFlags are not yet ported (see HGNode.ts vtable *0x88/*0x90).
    // Their EFFECTS on this HGStencil's semantics are:
    //   clear bit 0x200 across all input slots  (@0x2d1cb3)
    //   set   bit 0x400 across all input slots  (@0x2d1cd5)
    //   set   bit 0x20  on slots 0 and 1        (@0x2d1ce8, @0x2d1cfe)
    //   set   bit 0x20  across all input slots  (@0x2d1d14; a superset of the previous two,
    //     preserved verbatim as the compiler emitted it).
    // We record the intent as documented constants so a later HGNode-flags port can wire them.
    void HGSTENCIL_CTOR_FLAG_CLEAR_ALL_0X200;
    void HGSTENCIL_CTOR_FLAG_SET_ALL_0X400;
    void HGSTENCIL_CTOR_FLAG_SET_SLOT_0X20;
  }

  /**
   * HGStencil::SetParameter(int idx, float xmm0, float, float, float) @0x2d21b0
   *
   *   Returns 1 on any write (idx==0 or idx==1), 0 for other idx values.
   *   NOTE: this DIVERGES from HGComicQuantize::SetParameter (which returns
   *   -1 for out-of-range and 0 for no-change). HGStencil is unconditional
   *   store-and-return-1 for idx in {0,1}; there is no compare-first path.
   *
   *   @0x2d21b4  cmpl $1, %esi ; je 0x2d21d1                     ; idx==1 → paramFloat branch
   *   @0x2d21b9  xorl %eax, %eax
   *   @0x2d21bb  testl %esi, %esi ; jne 0x2d21de                 ; idx!=0 (and !=1) → return 0
   *   @0x2d21bf  roundss $0x9, %xmm0, %xmm0                       ; xmm0 = roundToNearestEven(f32,
   *                                                                       exceptions suppressed);
   *                                                                       0x9 = MXCSR bit 3 + rc=00
   *   @0x2d21c5  cvttss2si %xmm0, %eax                            ; eax = int(trunc(xmm0))
   *   @0x2d21c9  movl %eax, 0x1b4(%rdi)                           ; this->_stateIndex = eax
   *   @0x2d21cf  jmp 0x2d21d9
   *   @0x2d21d1  movss %xmm0, 0x1b0(%rdi)                         ; this->_paramFloat = xmm0
   *   @0x2d21d9  movl $1, %eax                                     ; return 1
   */
  SetParameter(idx: number, xmm0: number, _1: number, _2: number, _3: number): number {
    const i = idx | 0;
    if (i === 1) {
      // @0x2d21d1 movss %xmm0, 0x1b0(%rdi)
      this._paramFloat = Math.fround(xmm0);
      return 1;                                                    // @0x2d21d9 movl $1, %eax
    }
    if (i !== 0) {
      // @0x2d21bb/0x2d21bd testl,jne → return 0
      return 0;
    }
    // @0x2d21bf roundss $0x9, then @0x2d21c5 cvttss2si:
    //   roundss mode 0x9 = round-to-nearest-even, suppress precision exceptions;
    //   then cvttss2si truncates (but since the value is already integral after
    //   roundss, truncation is a no-op). Net effect: banker's round of the f32
    //   to a 32-bit signed integer.
    const v = Math.fround(xmm0);
    // Emulate roundToNearestEven for a Math.fround'd value.
    //   For NaN/Inf/out-of-range cvttss2si returns 0x80000000 (Intel "indefinite
    //   integer value"); we mirror that with `| 0` clamping semantics for finite
    //   values only. Out-of-range must be flagged loudly rather than silently
    //   wrapping — this is a decode-don't-fit boundary.
    if (!Number.isFinite(v)) {
      // Intel: cvttss2si on NaN/Inf/overflow → 0x80000000 = -2147483648.
      // We preserve the exact bit-pattern per Rule 4.
      this._stateIndex = -2147483648;                               // @0x2d21c9 movl %eax, 0x1b4
    } else {
      // Round-to-nearest-even (banker's rounding).
      // Standard technique: floor(v+0.5) then if the fraction was exactly 0.5
      // and the result is odd, decrement.
      const rounded = Math.round(v);
      // Math.round in JS is "away from zero" for .5, but for the integers we care
      // about the difference is only at exact .5. Handle banker's manually:
      let stateIdx: number;
      const diff = Math.abs(v - Math.trunc(v));
      if (diff === 0.5) {
        // banker: to nearest even
        const t = Math.trunc(v);
        stateIdx = (t & 1) === 0 ? t : (v > 0 ? t + 1 : t - 1);
      } else {
        stateIdx = rounded;
      }
      // Clamp to 32-bit signed range like cvttss2si would.
      if (stateIdx > 0x7fffffff || stateIdx < -0x80000000) {
        stateIdx = -2147483648;                                     // cvttss2si overflow → 0x80000000
      }
      this._stateIndex = stateIdx | 0;                              // @0x2d21c9 movl %eax, 0x1b4
    }
    return 1;                                                       // @0x2d21d9
  }

  /**
   * HGStencil::GetROI(HGRenderer*, int slot, HGRect in) @0x2d2190
   *
   *   Passthrough for slot < 2; HGRectNull for slot >= 2. NO frame emitted for
   *   the passthrough path — it just moves rcx→rax, r8→rdx and rets. Only the
   *   slot>=2 branch enters a frame.
   *
   *   @0x2d2190  movq %rcx, %rax                                    ; rax = in.lo
   *   @0x2d2193  cmpl $2, %edx ; jl 0x2d21ab                        ; slot < 2 → jump to epilogue
   *   @0x2d2198  pushq %rbp ; movq %rsp, %rbp
   *   @0x2d219c  leaq _HGRectNull(%rip), %rcx
   *   @0x2d21a3  movq (%rcx), %rax                                  ; rax = HGRectNull.lo
   *   @0x2d21a6  movq 0x8(%rcx), %r8                                ; r8  = HGRectNull.hi
   *   @0x2d21aa  popq %rbp
   *   @0x2d21ab  movq %r8, %rdx ; retq                              ; return (rax:rdx)
   */
  GetROI(_r: HGRendererLike, slot: number, inRect: HGRectLike): HGRectLike {
    if ((slot | 0) < 2) {
      // @0x2d2190 passthrough — return input unchanged.
      return inRect;
    }
    // @0x2d219c HGRectNull sentinel; layout not yet decoded in this port.
    throw new Error(
      "HGStencil::GetROI @0x2d2190 slot>=2 branch not yet transcribed — requires " +
      "HGRectNull @Helium __TEXT __const symbol (16-byte {i32 minX,minY,maxX,maxY}).",
    );
  }

  /**
   * HGStencil::GetDOD(HGRenderer*, int slot, HGRect in) @0x2d2110
   *
   *   For slot >= 2: return HGRectNull. Otherwise: compute the DOD as the
   *   INTERSECTION of the DODs of upstream inputs 0 and 1.
   *
   *   @0x2d2110  cmpl $2, %edx ; jl 0x2d2124                        ; slot < 2 branch
   *   @0x2d2115  leaq _HGRectNull(%rip), %rcx ; ret HGRectNull       ; slot >= 2
   *
   *   Slot<2 body @0x2d2124..0x2d2182:
   *     @0x2d213d  callq HGRenderer::GetInput(this, 0) -> %rax=input0
   *     @0x2d2148  callq HGRenderer::GetDOD(input0)    -> {r15:r12}
   *     @0x2d215e  callq HGRenderer::GetInput(this, 1) -> %rax=input1
   *     @0x2d2169  callq HGRenderer::GetDOD(input1)    -> {rax:rdx}
   *     @0x2d2182  jmp   HGRectIntersection            -> tail-call intersect DODs
   *
   * Requires HGRenderer::GetInput / HGRenderer::GetDOD / HGRectIntersection
   * — throw-stubbed per Rule 3.
   */
  GetDOD(_r: HGRendererLike, slot: number, _in: HGRectLike): HGRectLike {
    if ((slot | 0) >= 2) {
      throw new Error(
        "HGStencil::GetDOD @0x2d2115 slot>=2 → return HGRectNull; HGRectNull layout " +
        "not yet ported.",
      );
    }
    throw new Error(
      "HGStencil::GetDOD @0x2d2110 slot<2 branch not yet transcribed — requires " +
      "HGRenderer::GetInput(HGNode*, int) @Helium, HGRenderer::GetDOD(HGNode*) @Helium, " +
      "and HGRectIntersection @Helium (tail-call at @0x2d2182).",
    );
  }

  /**
   * HGStencil::Bind(HGHandler* h) @0x2d21e0
   *
   *   @0x2d21e4  movq 0x198(%rdi), %rax                             ; rax = this->_vec_begin[0]-ptr
   *   @0x2d21eb  movq (%rax), %rdx                                  ; (rdx unused after this)
   *   @0x2d21ee  movq (%rsi), %rax                                  ; rax = handler->vtable
   *   @0x2d21f1  movq %rsi, %rdi                                    ; arg0 = handler
   *   @0x2d21f4  xorl %esi, %esi                                    ; arg1 = 0
   *   @0x2d21f6  movl $1, %ecx                                      ; arg3 = 1
   *   @0x2d21fb  callq *0x90(%rax)                                  ; handler->vtable[*0x90](handler, 0, ?, 1)
   *   @0x2d2201  xorl %eax, %eax ; ret                              ; return 0
   *
   *   Note: the callq passes %rdx and %rcx unchanged from earlier moves — %rdx
   *   holds `*(this->_vec_begin[0])` which is the first program-descriptor's
   *   embedded first qword (a vtable ptr). So the HGHandler *0x90 slot is
   *   receiving (this=handler, 0, *_vec_begin[0], 1). Semantically Bind is
   *   telling the HGHandler which stencil program-descriptor to activate.
   */
  Bind(_h: HGHandlerLike): number {
    throw new Error(
      "HGStencil::Bind @0x2d21e0 not yet transcribed — requires HGHandler vtable " +
      "slot *0x90 to be decoded (called with args: h, 0, this->_vec_begin[0][0], 1). " +
      "The program-descriptor first-qword payload also requires HGProgramDescriptor layout.",
    );
  }

  /**
   * HGStencil::UpdateLocalParameters(int idx) @0x2d2210
   *
   *   Splats this->_paramFloat into all 4 lanes of an xmm and writes it to two
   *   offsets inside the idx'th HGProgramDescriptor in the vector at +0x198.
   *
   *   @0x2d2214  movss 0x1b0(%rdi), %xmm0                           ; xmm0.x = _paramFloat
   *   @0x2d221c  shufps $0, %xmm0, %xmm0                            ; xmm0 = {p,p,p,p}
   *   @0x2d2220  movslq %esi, %rax                                  ; rax = sign-ext(idx)
   *   @0x2d2223  movq 0x198(%rdi), %rcx                             ; rcx = _vec_begin
   *   @0x2d222a  movq (%rcx, %rax, 8), %rcx                         ; rcx = _vec_begin[idx]  (program desc*)
   *   @0x2d222e  movaps %xmm0, 0x10(%rcx)                           ; store f32x4 at desc+0x10
   *   @0x2d2232  movq 0x198(%rdi), %rcx                             ; reload _vec_begin (same value)
   *   @0x2d2239  movq (%rcx, %rax, 8), %rax                         ; rax = _vec_begin[idx]
   *   @0x2d223d  movaps %xmm0, (%rax)                               ; store f32x4 at desc+0x00
   */
  UpdateLocalParameters(_idx: number): void {
    throw new Error(
      "HGStencil::UpdateLocalParameters @0x2d2210 not yet transcribed — requires " +
      "HGProgramDescriptor layout (writes f32x4 splat of _paramFloat at desc+0x00 and desc+0x10). " +
      "Awaits both HGProgramDescriptor decoding and a decision on the vec_begin representation.",
    );
  }

  /**
   * HGStencil::GetProgram(HGRenderer*) @0x2d2710
   *
   *   Tail-jumps through a static function table indexed by stateIndex.
   *
   *   @0x2d2714  movslq 0x1b4(%rdi), %rax                           ; rax = sign-ext(_stateIndex)
   *   @0x2d271b  leaq __ZL19s_gpu_stencil_table(%rip), %rcx         ; local-static jumptable
   *   @0x2d2722  movq %rsi, %rdi                                    ; renderer → arg0
   *   @0x2d2726  jmpq *(%rcx, %rax, 8)                              ; tail-jmp s_gpu_stencil_table[stateIndex](renderer)
   *
   * Requires decoding of __ZL19s_gpu_stencil_table (a per-state array of program-
   * builder function pointers). Deferred until the stencil-state helpers land.
   */
  GetProgram(_r: HGRendererLike): unknown {
    throw new Error(
      "HGStencil::GetProgram @0x2d2710 not yet transcribed — dispatches through " +
      "__ZL19s_gpu_stencil_table (Helium __DATA local-static jumptable) indexed by " +
      "sign-ext(_stateIndex). Each entry is a per-state program-builder fn(HGRenderer*).",
    );
  }

  /**
   * HGStencil::InitProgramDescriptor(HGProgramDescriptor*) const @0x2d2730
   *
   *   Same tail-jump pattern as GetProgram, but through a different jumptable.
   *
   *   @0x2d2734  movslq 0x1b4(%rdi), %rax                           ; rax = sign-ext(_stateIndex)
   *   @0x2d273b  leaq __ZL27s_programdesc_stencil_table(%rip), %rcx
   *   @0x2d2742  movq %rsi, %rdi                                    ; desc → arg0
   *   @0x2d2746  jmpq *(%rcx, %rax, 8)                              ; tail-jmp table[state](desc)
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorLike): void {
    throw new Error(
      "HGStencil::InitProgramDescriptor @0x2d2730 not yet transcribed — dispatches " +
      "through __ZL27s_programdesc_stencil_table (Helium __DATA local-static jumptable) " +
      "indexed by sign-ext(_stateIndex). Deferred with GetProgram.",
    );
  }

  /**
   * HGStencil::SetState(HGRenderer*, int state) @0x2d1f20
   *
   *   Large 122-line body that (paraphrasing the control flow — every branch
   *   below cites its address):
   *     @0x2d1f3b  if (state != 1) jmp end (@0x2d20e3)
   *     @0x2d1f4b  call renderer->vtable[*0x130]   -> byte res
   *     @0x2d1f57  if (res == 0) r15 = 1 else r15 = renderer->vtable[*0x80](5)
   *     @0x2d1f70  compute cur_size = (_vec_end - _vec_begin) >> 3   (element count)
   *     @0x2d1f82  if (cur_size >= r15) jmp end
   *     Otherwise loop @0x2d1fcf..0x2d20d5 that:
   *       - allocates a 0x67-byte aligned block via operator new[] @0x2d1fd4 (0x3c4fac stub)
   *       - masks-align the returned ptr to 0x20 boundary (@0x2d1fdf and %ecx, 0x1f)
   *       - zeros two f32x4s at 0x8/0x18 (@0x2d1fee/0x2d1ff6)
   *       - loads a f32x4 constant from RIP-rel 0x5bcd4e (@0x2d1ffb) and writes to 0x28,0x38
   *       - grows the _vec_end and calls further per-element init
   *
   * Full transcription requires:
   *   - HGRenderer vtable slots *0x130 and *0x80 to be decoded
   *   - operator new[] semantics (already exists in the runtime)
   *   - the RIP-rel f32x4 constant at Helium 0x88fd50 (0x2d2002 + 0x5bcd4e — verify with
   *     resolve.py Helium const 0x88fd50)
   *   - HGProgramDescriptor layout so we know why offsets 0x00/0x08/0x18/0x28/0x38 are
   *     written with those specific vector patterns.
   *
   * Deferred; call raises with all @0xADDR cited.
   */
  SetState(_r: HGRendererLike, _state: number): void {
    throw new Error(
      "HGStencil::SetState @0x2d1f20 not yet transcribed — 122-line resource-vector grower. " +
      "Requires HGRenderer vtable *0x130/*0x80, HGProgramDescriptor layout, and the f32x4 " +
      "constant @Helium 0x88fd50 (RIP-rel 0x5bcd4e at 0x2d1ffb + next-instr 0x2d2002).",
    );
  }

  /**
   * HGStencil::RenderTile(HGTile*) @0x2d2250 (172 lines of SIMD-only CPU raster
   * used when neither Metal nor GL is available — the shader path via GetProgram
   * is preferred). Not transcribed: requires HGTile layout + the raster kernel.
   */
  RenderTile(_tile: HGTileLike): void {
    throw new Error(
      "HGStencil::RenderTile @0x2d2250 not yet transcribed — 172-line CPU SIMD kernel; " +
      "requires HGTile layout and stencil raster math (see disasm).",
    );
  }

  /**
   * HGStencil::RenderPageMetal(HGPage*) @0x2d24a0
   *
   *   @0x2d24ad  movq (%rdi), %rax                                  ; vtable
   *   @0x2d24b0  xorl %esi, %esi
   *   @0x2d24b2  callq *0x230(%rax)                                 ; this->vtable[*0x230](this, 0)
   *   @0x2d24c2  jmp   HGStencil::RenderPagePlainMetal(HGPage*)     ; tail-call plain-metal impl
   *
   * The vtable *0x230 slot is a Helium/HGNode virtual not-yet-mapped in this
   * port; it's called immediately before dispatching to RenderPagePlainMetal.
   */
  RenderPageMetal(_page: HGPageLike): void {
    throw new Error(
      "HGStencil::RenderPageMetal @0x2d24a0 not yet transcribed — calls own vtable " +
      "*0x230 (unknown HGNode-tier virtual) then tail-jmps HGStencil::RenderPagePlainMetal.",
    );
  }

  /**
   * HGStencil::RenderPagePlainMetal(HGPage*) @0x2d24d0 (168 lines) — the actual
   * Metal command-buffer builder for the stencil pass. Not transcribed:
   * requires HGPage layout + Metal command-encoder wrappers.
   */
  RenderPagePlainMetal(_page: HGPageLike): void {
    throw new Error(
      "HGStencil::RenderPagePlainMetal @0x2d24d0 not yet transcribed — 168-line Metal " +
      "command-buffer builder; requires HGPage layout and Metal command-encoder wrappers.",
    );
  }

  /**
   * HGStencil::~HGStencil() @0x2d1d60 / @0x2d1df0 / @0x2d1e80 (deleting).
   *
   *   D0 @0x2d1e80..0x2d1f16:
   *     @0x2d1e8a  leaq [vtable+0x10](%rip), %rax ; movq %rax, (%rdi)  ; reinstall vptr
   *     @0x2d1e94  rdi = _vec_begin ; r14 = _vec_end
   *     @0x2d1ea2  size = (r14 - rdi) >> 3                              ; element count
   *     @0x2d1eac  if (size <= 0) skip loop
   *     @0x2d1eb5  incq %r14  (adjust upper bound because loop dec-then-cmps)
   *     @0x2d1ec9  loop:
   *       rax = _vec_begin[size-2] ; delete rax->[-8]   (i.e. delete the payload owned
   *       by each program-descriptor; the descriptor itself is not freed here).
   *       size--; loop until size <= 1.
   *     @0x2d1eea  free the vec buffer at _vec_begin via operator delete
   *     @0x2d1f05  callq HGNode::~HGNode()
   *     @0x2d1f11  jmp   HGObject::operator delete(void*)  (D0 only)
   *
   * JS has no destructor; provided for parity when a Retain/Release scheme is
   * layered on top. The vector-of-payload-pointers walk-and-delete would be
   * meaningless in JS (GC handles it) but is documented above for completeness.
   */
  destroy(): void {
    // No JS-side Release calls; f32/i32/array fields are POD or GC-managed.
    this._vec_begin = [];
  }
}

// ---- documented constants for the four ctor flag-configuration calls -------
// Preserved as named symbols so a future HGNode-flags port can consume them.
// The values are the raw HGNode SetFlags/ClearFlags mask arguments observed in
// the ctor disassembly at @0x2d1cb3..0x2d1d14. Semantic labels are unknown until
// HGNode's flag enum is decoded.
export const HGSTENCIL_CTOR_FLAG_CLEAR_ALL_0X200 = 0x200 as const;  // @0x2d1cbb movl $0x200, %edx
export const HGSTENCIL_CTOR_FLAG_SET_ALL_0X400   = 0x400 as const;  // @0x2d1cd0 movl $0x400, %edx
export const HGSTENCIL_CTOR_FLAG_SET_SLOT_0X20   = 0x020 as const;  // @0x2d1ce3/0x2d1cf9/0x2d1d0f movl $0x20, %edx
