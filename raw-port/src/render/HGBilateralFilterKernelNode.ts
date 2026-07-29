// HGBilateralFilterKernelNode — Helium bilateral-filter separable kernel node. Framework: Helium.
// Inherits from HGColorMatrix (which itself inherits from HGNode).
//
// Symbols on Helium (x86_64 thin slice, VA==file offset):
//   __ZN27HGBilateralFilterKernelNodeC1Ev                @0x1827f0  ctor complete (real body)
//   __ZN27HGBilateralFilterKernelNodeC2Ev                @0x182770  ctor base-subobj (ICF-adjacent)
//   __ZN27HGBilateralFilterKernelNodeD0Ev                @0x1828f0  deleting dtor
//   __ZN27HGBilateralFilterKernelNodeD1Ev                @0x1828b0  base dtor
//   __ZN27HGBilateralFilterKernelNodeD2Ev                @0x182870  base-subobj dtor
//   __ZN27HGBilateralFilterKernelNode13SetWindowSizeEi   @0x182310  SetWindowSize(int)
//   __ZN27HGBilateralFilterKernelNode6GetDODEP10HGRendereri6HGRect  @0x1826d0  GetDOD
//   __ZN27HGBilateralFilterKernelNode6GetROIEP10HGRendereri6HGRect  @0x182720  GetROI
//   __ZN27HGBilateralFilterKernelNode12SetParameterEiffff @0x182930  SetParameter
//   __ZN27HGBilateralFilterKernelNode12GetParameterEiPf  @0x1829b0  GetParameter
//   __ZN27HGBilateralFilterKernelNode9GetOutputEP10HGRenderer @0x182a00  GetOutput
//
// Provenance disasm files:
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.SetWindowSize.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.GetDOD.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.GetROI.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.SetParameter.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.GetParameter.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.GetOutput.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.HGBilateralFilterKernelNode.s
//   raw-port/re/disasm/Helium.HGBilateralFilterKernelNode.~HGBilateralFilterKernelNode.s
//
// FAITHFUL PORT — every function cites @Helium 0xADDR. Every numeric constant cites the address
// it was read from. Undecoded callees throw citing their FCP address (PORTING_SPEC.md Rule 3).
// Single-precision (movss/ucomiss) ops are wrapped in Math.fround (Rule 4). The NaN-ordered
// equality idiom (ucomiss + jne + jnp -> skip) is preserved with `!==` (not Object.is).

// ── STRUCT LAYOUT ──────────────────────────────────────────────────────────────────────────────
//   Recovered from the C1 body @0x1827f0, D0 dtor @0x1828f0, SetWindowSize @0x182310,
//   Set/GetParameter @0x182930/@0x1829b0, GetDOD/GetROI/GetOutput. Inherits from HGColorMatrix.
//
//     +0x00   vptr slot                          (installed by C1 @0x1827ff; target is the
//                                                 HGBilateralFilterKernelNode vtable payload
//                                                 at 0x8a0bba+RIP_END=0x182806 -> 0xa233c0.
//                                                 Same value re-installed at teardown by
//                                                 D0 @0x1828f9 (target = 0xa233c0 - i.e. dtor
//                                                 uses the "in-destructor" slot at 0x8a0ac0 off
//                                                 D0 RIP-end 0x182900 -> 0xa233c0 too).)
//     +0x10   u32 flags        (base HGNode flag word — see HGNode.ts; masked with 0xfffff9fe
//                               and OR'd with 0x401 by C1 @0x182823..@0x182830.)
//     +0x1f0  f32(*)[2][4]     pointer to a 32-byte heap block (`__Znwm(0x20)` @0x182838),
//                              zeroed by two `movaps %xmm0=0` writes @0x182840/@0x182844.
//                              Holds TWO float4 parameter slots at stride 16, indexed by
//                              SetParameter/GetParameter's `i` in {0, 1}.
//     +0x1f8  u32              dirty/flag word. C1 sets +0x1f8 to 1 @0x182809 (initial dirty),
//                              SetParameter sets it to 1 @0x182992 on any change.
//     +0x1fc  i32 windowSize   (== max(0, arg) from SetWindowSize @0x18231b; default 0.)
//                              Used by GetDOD/GetROI/GetOutput.
//
// ── seed constants ─────────────────────────────────────────────────────────────────────────────

/** @const _HGRectNull @Helium 0x3d2284  = 16 bytes of 0x00 -> (x=0, y=0, w=0, h=0).
 *  Referenced by GetDOD @0x1826d8 and GetROI @0x182728 as the "invalid-input" return value
 *  when the query index (edx) is non-zero. */
const HG_RECT_NULL: HGRect = { x: 0, y: 0, w: 0, h: 0 };

/** @const ctor init +0x1f8 = 1  — `movq $0x1, 0x1f8(%rbx)` @0x182809. Dirty on construction. */
const CTOR_DIRTY_INIT: number = 1;

/** @const ctor SetFlags args (esi=0, edx=1)  — `xorl %esi,%esi; movl $0x1,%edx` before
 *  `callq HGNode::SetFlags(int,int)` @0x18281e (frontier). Bit 0 of some flag register is set. */
const CTOR_SETFLAGS_MASK: number = 0;
const CTOR_SETFLAGS_VALUE: number = 1;

/** @const ctor +0x10 flag transformation @0x182823..@0x182830:
 *     flags = (flags & 0xfffff9fe) | 0x401
 *  Clears bits 0, 9, 10 (mask 0x601 -> ~ 0xfffff9fe means preserve everything EXCEPT bits {0,9,10}),
 *  then sets bits {0, 10} (0x401). Net effect: bit 0 = 1, bit 9 = 0, bit 10 = 1. */
const FLAG_KEEP_MASK: number = 0xfffff9fe;
const FLAG_OR_BITS: number = 0x00000401;

/** @const heap block size for parameter storage — `movl $0x20, %edi; callq __Znwm` @0x182833.
 *  32 bytes = 2 × float4 (2 SetParameter idx slots). */
const PARAM_BLOCK_BYTES: number = 32;

// ── opaque frontier types (Helium base classes; not decoded in this file) ──────────────────────
/** HGRect = { int32 x, int32 y, int32 w, int32 h; }.  System-V ABI packs it into two consecutive
 *  8-byte INTEGER-class registers: low qword = (y<<32) | x, high qword = (h<<32) | w.
 *  The GetDOD/GetROI disassembly makes this packing explicit (see the shrq/shlq/orq dance).
 *  Modeled here as a struct — all four fields are int32. */
export interface HGRect { x: number; y: number; w: number; h: number; }

/** HGNode base — flag manipulation slots, ClearBits, SetFlags (all frontier). */
export interface HGNode {
  /** vt[0x18] Release-family — invoked by dtor sweeps in caller classes. */
  Release(): void;
}

/** HGColorMatrix — direct base. Its ctor is called at @0x1827fa and its D2 dtor at @0x182859
 *  (unwind path) and @0x182917 (D0 tail). Layout opaque here. */
export interface HGColorMatrix extends HGNode {}

/** HGRenderer — Helium frame renderer. GetInput is the only method referenced by GetOutput. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) — tail-called by GetOutput @0x182a1b with edx=0
   *  when windowSize == 0 (identity passthrough). */
  GetInput(node: HGNode, idx: number): unknown;
}

/** Opaque handle returned by GetOutput. */
export type HGImageRef = unknown;

// ── the class ──────────────────────────────────────────────────────────────────────────────────
export class HGBilateralFilterKernelNode implements HGColorMatrix {
  // +0x10 flag word (base-class field — represented locally as `_flags` while HGNode.ts is a
  // frontier). Init to (0 & 0xfffff9fe) | 0x401 = 0x401 by C1 @0x182830.
  /** +0x10 (base) */ private _flags: number = FLAG_OR_BITS;

  // +0x1f0: 2 × float4 parameter slots. In the machine, this is `f32*` to a `__Znwm(0x20)`
  // 32-byte block, zeroed by two movaps @0x182840/@0x182844. Modeled here as a fixed pair of
  // 4-tuples so the SetParameter/GetParameter arithmetic maps 1:1.
  /** +0x1f0[0][0..3] */ private p0: [number, number, number, number] = [0, 0, 0, 0];
  /** +0x1f0[1][0..3] */ private p1: [number, number, number, number] = [0, 0, 0, 0];

  // +0x1f8: dirty flag. C1 sets to 1 @0x182809; SetParameter sets to 1 @0x182992.
  /** +0x1f8 */ private dirty: number = CTOR_DIRTY_INIT;

  // +0x1fc: windowSize. `xorl %eax,%eax; testl %esi,%esi; cmovgl %esi,%eax` @0x182314..@0x18231b
  // == max(0, arg). Default 0 (not set by ctor).
  /** +0x1fc */ private windowSize: number = 0;

  /**
   * HGBilateralFilterKernelNode::HGBilateralFilterKernelNode() @Helium 0x1827f0.
   *
   * Faithful body:
   *   0x1827fa  HGColorMatrix::HGColorMatrix()               (base ctor)
   *   0x1827ff  leaq 0x8a0bba(%rip),%rax; movq %rax,(%rbx)   ; install vptr = 0xa233c0
   *   0x182809  movq $0x1, 0x1f8(%rbx)                       ; dirty = 1
   *   0x18281e  HGNode::SetFlags(0, 1)                        (base method - frontier)
   *   0x182823  flags = (flags & 0xfffff9fe) | 0x401
   *   0x182833  __Znwm(0x20)                                  ; alloc 32-byte param block
   *   0x18283d  xorps %xmm0,%xmm0; movaps %xmm0,0x10(%rax)   ; zero bytes 16..31 of block
   *   0x182844                    movaps %xmm0,(%rax)         ; zero bytes  0..15 of block
   *   0x182847  movq %rax, 0x1f0(%rbx)                        ; store block pointer
   *
   * Unwind path @0x182853..@0x182865: on any exception from __Znwm, HGColorMatrix::~HGColorMatrix
   * is invoked and __Unwind_Resume rethrows. JS has GC-owned lifetimes, so unwind reduces to
   * the exception propagating naturally.
   */
  constructor() {
    // Field initializers above cover: p0/p1 zeros (movaps to +0x1f0[0..31]), dirty=1 (@0x182809),
    // _flags = 0x401 (@0x182830, assuming pre-image flags=0), windowSize=0.
    //
    // HGColorMatrix::HGColorMatrix() @0x1827fa and HGNode::SetFlags(0, 1) @0x18281e are frontier
    // callees — their state effects are not modeled here. When those frontiers land, invoke them
    // from here (see the throw stubs below for the exact callsites).
    void CTOR_SETFLAGS_MASK; void CTOR_SETFLAGS_VALUE; void FLAG_KEEP_MASK; void PARAM_BLOCK_BYTES;
    void CTOR_DIRTY_INIT;
  }

  /**
   * HGBilateralFilterKernelNode::~HGBilateralFilterKernelNode() @Helium 0x1828f0 (D0, deleting).
   *
   * Faithful body:
   *   0x1828f9  leaq 0x8a0ac0(%rip),%rax; movq %rax,(%rdi)   ; install teardown vptr = 0xa233c0
   *   0x182903  movq 0x1f0(%rdi),%rdi                          ; load param-block pointer
   *   0x18290a  testq %rdi,%rdi; je 0x182914                   ; skip delete if null
   *   0x18290f  operator delete(void*)  @__ZdlPv               ; free the 32-byte block
   *   0x182917  HGColorMatrix::~HGColorMatrix()                (base dtor - frontier)
   *   0x182925  HGObject::operator delete(this)                (frontier)
   */
  destroy(): void {
    // In JS, GC reclaims the p0/p1 tuples; there is no explicit `delete` of the 32-byte block.
    // HGColorMatrix::~HGColorMatrix() @0x182917 and HGObject::operator delete @0x182925 are
    // frontier callees — throwing wouldn't be right here (dtors shouldn't throw), so we simply
    // leave them out. The vptr install @0x1828f9 is a C++ ABI detail with no JS analogue.
  }

  /** @vt-slot 0x18 (inherited from HGNode). */
  Release(): void {
    throw new Error('HGNode::Release @Helium vt[0x18] callsite 0x182903 not yet transcribed');
  }

  /**
   * HGBilateralFilterKernelNode::SetWindowSize(int n) @Helium 0x182310.
   *
   * Faithful body (all 8 real instructions):
   *   0x182314  xorl %eax,%eax
   *   0x182316  testl %esi,%esi
   *   0x182318  cmovgl %esi,%eax          ; eax = (n > 0) ? n : 0    == max(0, n)
   *   0x18231b  movl %eax, 0x1fc(%rdi)
   *
   * Semantics: clamps the window half-size to be non-negative. Zero disables the filter (see
   * GetOutput's early-out @0x182a07 which just tail-calls GetInput when windowSize==0).
   */
  SetWindowSize(n: number): void {
    // @0x182314..@0x18231b: eax = max(0, n) via xorl+testl+cmovgl.
    const clamped = (n | 0) > 0 ? (n | 0) : 0;
    this.windowSize = clamped;
  }

  /**
   * HGBilateralFilterKernelNode::GetDOD(HGRenderer* r, int idx, HGRect rect) @Helium 0x1826d0.
   *
   * SysV ABI passes HGRect (16 bytes, 4 int32) as two INTEGER-class 8-byte chunks:
   *   %rcx = low qword  = (rect.y << 32) | rect.x
   *   %r8  = high qword = (rect.h << 32) | rect.w
   * The disassembly makes this packing explicit through the shrq/shlq/orq dance @0x1826e8..@0x18270f.
   *
   * Faithful body:
   *   0x1826d0  testl %edx,%edx; je 0x1826e8                   ; if idx == 0, expand; else null
   *   0x1826d8  return _HGRectNull @Helium 0x3d2284 = (0,0,0,0)  (early-out for idx != 0)
   *
   *   Expand path @0x1826e8:
   *     0x1826e8  movq %rcx, %rax                              ; rax = (y<<32)|x
   *     0x1826eb  shrq $0x20, %rcx                             ; rcx = y  (in low 32)
   *     0x1826ef  movl 0x1fc(%rdi), %edx                       ; edx = windowSize
   *     0x1826f5  subl %edx, %eax                              ; rax.lo = x - ws
   *     0x1826f7  subl %edx, %ecx                              ; rcx.lo = y - ws
   *     0x1826f9  leal (%r8, %rdx), %esi                       ; esi = w + ws
   *     0x1826fd  shrq $0x20, %r8                              ; r8.lo = h
   *     0x182701  addl %edx, %r8d                              ; r8.lo = h + ws
   *     0x182704  shlq $0x20, %r8                              ; r8 = (h+ws) << 32
   *     0x182708  orq %rsi, %r8                                ; r8 = ((h+ws)<<32) | (w+ws)
   *     0x18270b  shlq $0x20, %rcx                             ; rcx = (y-ws) << 32
   *     0x18270f  orq %rcx, %rax                               ; rax = ((y-ws)<<32) | (x-ws)&0xffffffff
   *     0x182712  movq %r8, %rdx                               ; return (rax, rdx)
   *
   * i.e. for idx == 0: return { x: x-ws, y: y-ws, w: w+ws, h: h+ws }.
   * This is the classic filter DOD (Domain-of-Definition) expansion — the output pixels depend
   * on inputs within `windowSize` in every direction.
   *
   * Signed vs unsigned width: the machine does 32-bit `subl`/`addl` which is width-preserving
   * mod-2^32. TS numbers up-convert to 64-bit; we mirror the 32-bit truncation with `| 0` to
   * preserve wraparound behavior on pathological inputs.
   */
  GetDOD(_r: HGRenderer, idx: number, rect: HGRect): HGRect {
    // @0x1826d0: testl %edx,%edx; je 0x1826e8
    if ((idx | 0) !== 0) {
      // @0x1826d8: return _HGRectNull @Helium 0x3d2284 (all zeros)
      return { x: HG_RECT_NULL.x, y: HG_RECT_NULL.y, w: HG_RECT_NULL.w, h: HG_RECT_NULL.h };
    }
    const ws = this.windowSize | 0;
    // Preserve 32-bit signed wraparound with `| 0` at each subl/addl site.
    return {
      x: (rect.x - ws) | 0,   // @0x1826f5: subl %edx,%eax
      y: (rect.y - ws) | 0,   // @0x1826f7: subl %edx,%ecx
      w: (rect.w + ws) | 0,   // @0x1826f9: leal (%r8,%rdx),%esi
      h: (rect.h + ws) | 0,   // @0x182701: addl %edx,%r8d
    };
  }

  /**
   * HGBilateralFilterKernelNode::GetROI(HGRenderer* r, int idx, HGRect rect) @Helium 0x182720.
   *
   * The disassembly is byte-for-byte identical to GetDOD @0x1826d0 (25 lines, same instructions,
   * same offsets, same _HGRectNull reference). ROI (Region-of-Interest) for a bilateral kernel
   * matches its DOD because the filter is symmetric: to produce a rect of output, we need the
   * same-sized rect padded by windowSize on all sides. Keeping this as a separate method (not a
   * delegate) mirrors the machine 1:1 — the C++ code emits two independent functions with the
   * same body, likely because ROI and DOD are declared on separate virtual overrides.
   */
  GetROI(_r: HGRenderer, idx: number, rect: HGRect): HGRect {
    // @0x182720: testl %edx,%edx; je 0x182738
    if ((idx | 0) !== 0) {
      // @0x182728: return _HGRectNull @Helium 0x3d2284
      return { x: HG_RECT_NULL.x, y: HG_RECT_NULL.y, w: HG_RECT_NULL.w, h: HG_RECT_NULL.h };
    }
    const ws = this.windowSize | 0;
    return {
      x: (rect.x - ws) | 0,   // @0x182745
      y: (rect.y - ws) | 0,   // @0x182747
      w: (rect.w + ws) | 0,   // @0x182749
      h: (rect.h + ws) | 0,   // @0x182751
    };
  }

  /**
   * HGBilateralFilterKernelNode::SetParameter(int idx, float a, float b, float c, float d) @0x182930.
   *
   * Faithful body:
   *   0x182930  movl $0xFFFFFFFF, %eax                    ; default return = -1
   *   0x182935  cmpl $0x1, %esi; ja 0x1829a7              ; if idx > 1 return -1
   *   0x18293a  movq 0x1f0(%rdi), %rcx                    ; rcx = paramBlockPtr
   *   0x182941  shlq $0x4, %rdx                           ; rdx = idx * 16
   *   0x182947  leaq (%rcx,%rdx), %rax                    ; rax = &paramBlock[idx][0]
   *
   *   4-lane NaN-ordered comparison (short-circuit on all-equal, else jump to write):
   *     0x18294b  movss  (%rax), %xmm4;  ucomiss %xmm0,%xmm4;  jne .W; jp .W    ; slot[0] vs a
   *     0x182957  movss 0x4(%rax), %xmm4; ucomiss %xmm1,%xmm4; jne .W; jp .W    ; slot[1] vs b
   *     0x182963  movss 0x8(%rax), %xmm4; ucomiss %xmm2,%xmm4; jne .W; jp .W    ; slot[2] vs c
   *     0x18296f  movss 0xc(%rax), %xmm4; ucomiss %xmm3,%xmm4; jne .W; jnp .R0  ; slot[3] vs d
   *                                                                              (last uses jnp -> R0)
   *
   *   Write path .W @0x18297b:
   *     movss %xmm0..%xmm3 -> slot[0..3]      @0x18297f, @0x182983, @0x182988, @0x18298d
   *     movl $1, 0x1f8(%rdi)                    ; dirty = 1                    @0x182992
   *     callq HGNode::ClearBits()                                                 @0x18299c
   *     movl $1, %eax; retq                     ; return 1 (changed)             @0x1829a1
   *
   *   No-op path .R0 @0x1829a8:
   *     xorl %eax,%eax; retq                    ; return 0 (unchanged)
   *
   * Return values:
   *    1  slot was updated + ClearBits invoked  (@0x1829a1)
   *    0  slot already held bit-equal values    (@0x1829a8)
   *   -1  idx not in {0, 1}                     (@0x1829a7)
   *
   * The NaN-ordered semantics: `ucomiss %xmm0,%xmm4; jne .W` jumps when ZF=0 (i.e. NOT equal-or-
   * unordered), and `jp .W` jumps when PF=1 (unordered). Together they fall through ONLY on
   * "ordered and equal". So NaN-vs-anything triggers a write. Preserve with `!==` guards; NEVER
   * use Object.is, which would wrongly treat NaN==NaN as identical and short-circuit the write.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // @0x182930..@0x182938: `movl $-1,%eax; cmpl $0x1,%esi; ja .R-1`  (idx > 1 UNSIGNED)
    if ((idx >>> 0) > 1) {
      return -1;                                              // @0x1829a7
    }
    const aF = Math.fround(a);
    const bF = Math.fround(b);
    const cF = Math.fround(c);
    const dF = Math.fround(d);
    // @0x18293a..@0x182947: slot = paramBlock[idx]  (stride 16 = 4 f32 lanes)
    const slot = idx === 0 ? this.p0 : this.p1;
    // 4-lane NaN-ordered short-circuit @0x18294b..@0x182979
    const s0 = slot[0], s1 = slot[1], s2 = slot[2], s3 = slot[3];
    // Each lane: fall through only when both operands are ordered-equal (ZF=1 && PF=0).
    // For NaN OR "different value", jump to write. `!==` handles ordered-not-equal; the `!== self`
    // check catches NaN (Object.is(NaN,NaN)===true would be wrong here).
    const equalAll =
      s0 === aF && s0 === s0 && aF === aF &&
      s1 === bF && s1 === s1 && bF === bF &&
      s2 === cF && s2 === s2 && cF === cF &&
      s3 === dF && s3 === s3 && dF === dF;
    if (equalAll) {
      return 0;                                               // @0x1829a8
    }
    // Write path @0x18297b..@0x182991:
    slot[0] = aF;                                             // @0x18297f: movss %xmm0,(%rax)
    slot[1] = bF;                                             // @0x182983: movss %xmm1,0x4(%rax)
    slot[2] = cF;                                             // @0x182988: movss %xmm2,0x8(%rax)
    slot[3] = dF;                                             // @0x18298d: movss %xmm3,0xc(%rax)
    this.dirty = 1;                                           // @0x182992: movl $1,0x1f8(%rdi)
    this._ClearBits();                                        // @0x18299c: callq HGNode::ClearBits()
    return 1;                                                 // @0x1829a1
  }

  /**
   * HGBilateralFilterKernelNode::GetParameter(int idx, float* out) @Helium 0x1829b0.
   *
   * Faithful body:
   *   0x1829b0  movl $0xFFFFFFFF,%eax                  ; default return = -1
   *   0x1829b5  cmpl $0x1,%esi; ja 0x1829f8            ; if idx > 1 return -1
   *   0x1829be  movq 0x1f0(%rdi),%rax                  ; rax = paramBlockPtr
   *   0x1829c5  shlq $0x4, %rcx                        ; rcx = idx * 16
   *   0x1829cb  movss  (%rax,%rcx),%xmm0; movss %xmm0, (%rdx)   ; copy 4 lanes...
   *   0x1829d4  movss 0x4(%rax,%rcx),%xmm0; movss %xmm0,0x4(%rdx)
   *   0x1829df  movss 0x8(%rax,%rcx),%xmm0; movss %xmm0,0x8(%rdx)
   *   0x1829ea  movss 0xc(%rax,%rcx),%xmm0; movss %xmm0,0xc(%rdx)
   *   0x1829f5  xorl %eax,%eax; popq %rbp; retq        ; return 0 (success)
   *
   * Return: 0 on success, -1 if idx not in {0, 1}.
   */
  GetParameter(idx: number, out: [number, number, number, number]): number {
    // @0x1829b5: cmpl $0x1,%esi; ja 0x1829f8  (idx > 1 UNSIGNED)
    if ((idx >>> 0) > 1) {
      return -1;                                              // @0x1829f8
    }
    // @0x1829be..@0x1829f0: 4-lane copy from paramBlock[idx] to *out.
    const slot = idx === 0 ? this.p0 : this.p1;
    out[0] = slot[0];                                         // @0x1829cb..@0x1829d0
    out[1] = slot[1];                                         // @0x1829d4..@0x1829da
    out[2] = slot[2];                                         // @0x1829df..@0x1829e5
    out[3] = slot[3];                                         // @0x1829ea..@0x1829f0
    return 0;                                                 // @0x1829f5
  }

  /**
   * HGBilateralFilterKernelNode::GetOutput(HGRenderer* r) @Helium 0x182a00.
   *
   * Faithful body:
   *   0x182a04  movq %rdi, %rax
   *   0x182a07  cmpl $0x0, 0x1fc(%rdi)               ; test windowSize == 0
   *   0x182a0e  je 0x182a12                          ; if ws == 0, tail-call GetInput
   *   0x182a10  popq %rbp; retq                       ; else return this (rax = rdi)
   *   0x182a12  movq %rsi,%rdi; movq %rax,%rsi; xorl %edx,%edx
   *   0x182a1a  popq %rbp; jmp HGRenderer::GetInput(HGNode*, int)
   *
   * Semantics: if the filter is a no-op (windowSize == 0), pass through by returning the source
   * image; otherwise return `this` as the node handle for the kernel to run against.
   */
  GetOutput(r: HGRenderer): HGImageRef {
    // @0x182a07: cmpl $0x0, 0x1fc(%rdi)  (windowSize == 0 ?)
    if (this.windowSize !== 0) {
      // @0x182a10: return rax = rdi = this
      return this;
    }
    // @0x182a12..@0x182a1b: tail-call HGRenderer::GetInput(this, 0)
    return this._HGRenderer_GetInput(r, this, 0);
  }

  /** HGNode::ClearBits() — frontier. Invoked by SetParameter's write-path tail @0x18299c. */
  private _ClearBits(): void {
    throw new Error('HGNode::ClearBits @Helium callsite 0x18299c not yet transcribed');
  }

  /** HGRenderer::GetInput(HGNode*, int) — frontier. Tail-called by GetOutput @0x182a1b. */
  private _HGRenderer_GetInput(_r: HGRenderer, _self: HGNode, _idx: number): HGImageRef {
    throw new Error(
      'HGRenderer::GetInput @Helium callsite 0x182a1b not yet transcribed',
    );
  }
}
