// HMaskCompReplace.ts — Ozone HMaskCompReplace: DOD/ROI for the "replace"
// variant of the mask-compositing operation.
//
// A tiny, mostly-metadata subclass of HgcMaskCompReplace. The class defines
// exactly four symbols:
//
//   * ~HMaskCompReplace() (D1/D2, @0x436e50) — empty body; tail-calls the base
//                                              HgcMaskCompReplace dtor.
//   * ~HMaskCompReplace() (D0,    @0x436e60) — deleting dtor; runs base dtor
//                                              then HGObject::operator delete.
//   * GetDOD(HGRenderer*, int, HGRect) @0x436e80 — Domain-of-Definition of the
//                                              node's outputs on port 0.
//   * GetROI(HGRenderer*, int, HGRect) @0x436fe0 — Region-of-Interest on the
//                                              node's inputs; passthrough for
//                                              input ports [0,1], null else.
//
// The interesting one is GetDOD. The disassembly encodes this exact rule:
//
//   (1) If the caller asks for output port other than 0 -> return HGRectNull.
//   (2) Otherwise: fetch input 0's DOD via renderer.GetDOD(renderer.GetInput
//       (this, 0)). If it's null, treat the clamped rect as (0,0,-1,-1)
//       (a degenerate empty). Else clamp its (x0,y0,x1,y1) to the fixed
//       int32 window [0xC0000001, 0x3FFFFFFE] and turn it into a
//       (x, y, w=x1-x0, h=y1-y0) tuple.
//   (3) Read two floats from GetParameter(1, out[2]): the "replace" op's two
//       controlling parameters (call them p0, p1).
//         - |p0| >= 1e-5  -> return HGRectInfinite ("fully replace, any pixel
//           of B can end up anywhere; the DOD is the whole plane").
//         - else if |p1| < 1e-5 -> return HGRectNull (both parameters are zero
//           within the 1e-5 epsilon; the op is a no-op, no output).
//         - else -> return HGRectMake4i(x, y, w, h) using the clamped input
//           DOD (the op only writes where the input was defined).
//
// The 1e-5 threshold is a bit-exact float32 constant (0x3727c5ac ≈
// 9.999999747378752e-06) read from Ozone's __const at 0x707be0. The
// two |·| ops are `andps` against the 128-bit mask 0x7fffffff7fffffff at
// 0x707bc0 — the standard "clear the sign bit" idiom for float abs.
//
// HGRect layout (recovered from the eax/edx unpacking at 0x436efa..0x436f3e):
// two 64-bit halves = { i32 x0, i32 y0 | i32 x1, i32 y1 }. Total 16 bytes;
// returned by value in %rax:%rdx per the SysV ABI.
//
// See raw-port/re/disasm/HMaskCompReplace.*.s for the full disassembly.
//
// Provenance:
//   Binary /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework
//   /Frameworks/Ozone.framework/Versions/A/Ozone (x86_64 slice).
//   Vtable: __ZTV16HMaskCompReplace @0x863a60 (Ozone). D1/D2 alias @0x436e50;
//   D0 @0x436e60; GetDOD @0x436e80; GetROI @0x436fe0.
//   Base class HgcMaskCompReplace vtable @0x88c3c8; slot *0x68 =
//   HgcMaskCompReplace::GetParameter(int, float*) @0x6b8cc0 — the virtual
//   called from GetDOD to read (p0, p1).
//   Constants: float32 1e-5 @0x707be0; abs-mask 0x7fffffff7fffffff @0x707bc0.
//   External stubs (Helium framework, resolved via __stubs at the callq
//   targets): HGRenderer::GetInput(HGNode*, int), HGRenderer::GetDOD(HGNode*),
//   HGRectIsNull(HGRect), HGRectMake4i(int, int, int, int), and the two
//   sentinels HGRectNull, HGRectInfinite.

// ---------------------------------------------------------------------------
// Frontier stubs — Helium types/functions that HMaskCompReplace calls into but
// which have not been transcribed yet. A loud gap is correct; a plausible
// guess is a defect (see PORTING_SPEC Rule 3).
// ---------------------------------------------------------------------------

/** HGRect — 4×int32, returned by value in %rax:%rdx (16 bytes). Layout
 * recovered from the register unpacking in GetDOD @0x436efa..0x436f3e:
 *   %rax lo dword -> x0, hi dword -> y0
 *   %rdx lo dword -> x1, hi dword -> y1
 * i.e. { x0, y0, x1, y1 }. */
export interface HGRect {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

/** HGNode — opaque handle. HMaskCompReplace itself derives from HGNode; only
 * pointers ever cross the ABI. */
export interface HGNode { readonly __hgNode?: never }

/** HGRenderer — opaque handle. Only the two methods called from GetDOD are
 * exercised here; their real definitions live in Helium. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) — Helium __stub @Ozone 0x6dd37a
   *  (resolves to __ZN10HGRenderer8GetInputEP6HGNodei). Returns the node
   *  producing the given input port. Undecoded here — the Helium port owns it. */
  GetInput(node: HGNode, port: number): HGNode;
  /** HGRenderer::GetDOD(HGNode*) — Helium __stub @Ozone 0x6dd36e
   *  (resolves to __ZN10HGRenderer6GetDODEP6HGNode). Returns that node's
   *  domain-of-definition as an HGRect. Undecoded here. */
  GetDOD(node: HGNode): HGRect;
}

/** HGRectIsNull(HGRect) — Helium __stub @Ozone 0x6dcc9c
 *  (resolves to _HGRectIsNull). Predicate on the null-sentinel returned by
 *  various Helium APIs; used by GetDOD to detect an undefined input DOD.
 *  Undecoded — this file must not fake it. */
export function HGRectIsNull(_r: HGRect): boolean {
  throw new Error("HGRectIsNull @Ozone-stub 0x6dcc9c (Helium _HGRectIsNull) not yet transcribed");
}

/** HGRectMake4i(x, y, w, h) — Helium __stub @Ozone 0x6dcca8
 *  (resolves to _HGRectMake4i). Constructs an HGRect from an (x, y, w, h)
 *  tuple. Undecoded — deliberate throw. */
export function HGRectMake4i(_x: number, _y: number, _w: number, _h: number): HGRect {
  throw new Error("HGRectMake4i @Ozone-stub 0x6dcca8 (Helium _HGRectMake4i) not yet transcribed");
}

/** _HGRectNull — sentinel loaded from Ozone literal-pool @0x436ea3 / @0x436fec
 *  (extern _HGRectNull, resolved by dyld). The concrete i32 layout is Helium's
 *  responsibility; a lookup here would be inventing bytes. */
export function HGRectNull(): HGRect {
  throw new Error("HGRectNull @Ozone-lit 0x436ea3 (extern _HGRectNull, Helium) not yet transcribed");
}

/** _HGRectInfinite — sentinel loaded from Ozone literal-pool @0x436fa5. Same
 *  caveat as HGRectNull: extern from Helium. */
export function HGRectInfinite(): HGRect {
  throw new Error("HGRectInfinite @Ozone-lit 0x436fa5 (extern _HGRectInfinite, Helium) not yet transcribed");
}

/** HgcMaskCompReplace — the base class whose virtual slot *0x68 is called from
 *  GetDOD to read the two controlling floats. The full base-class port owns
 *  ~HgcMaskCompReplace (@Ozone 0x6b8ad0) and GetParameter (@Ozone 0x6b8cc0);
 *  we only surface the shape used here. */
export interface HgcMaskCompReplace {
  /** HgcMaskCompReplace::GetParameter(int, float*) — vtable slot *0x68 of
   *  vtable __ZTV18HgcMaskCompReplace @Ozone 0x88c3c8; impl @0x6b8cc0. Writes
   *  N floats into `out`; GetDOD only uses out[0], out[1]. Undecoded here. */
  GetParameter(index: number, out: Float32Array): void;
  /** HgcMaskCompReplace::~HgcMaskCompReplace() (D2) — @Ozone 0x6b8ad0. Called
   *  as a tail-jump from HMaskCompReplace::~HMaskCompReplace(). Undecoded. */
  destroy(): void;
}

/** HGObject::operator delete(void*) — Ozone __stub @0x436e77 -> 0x6def6a
 *  (__ZN8HGObjectdlEPv). Ozone-wide deallocation used by every D0 (deleting)
 *  destructor in the framework. Undecoded here. */
export function HGObject_operatorDelete(_p: HMaskCompReplace): void {
  throw new Error("HGObject::operator delete @Ozone-stub 0x6def6a not yet transcribed");
}

// ---------------------------------------------------------------------------
// HMaskCompReplace
// ---------------------------------------------------------------------------

/**
 * HMaskCompReplace — the "replace" specialisation of Ozone's mask-compositing
 * node hierarchy. Owns no fields of its own; extends HgcMaskCompReplace only
 * to override GetDOD/GetROI and the destructor pair.
 */
export class HMaskCompReplace {
  /** Base subobject (per the D1 tail-jump into HgcMaskCompReplace::~D2). */
  private readonly _base: HgcMaskCompReplace;

  constructor(base: HgcMaskCompReplace) { this._base = base; }

  /**
   * ~HMaskCompReplace() — base destructor (D1 / D2 alias) @Ozone 0x436e50.
   *
   * Full disassembly is 5 instructions of frame prologue/epilogue plus a
   * tail-jump into HgcMaskCompReplace::~HgcMaskCompReplace() @0x6b8ad0
   * (comment "HgcMaskCompReplace::~HgcMaskCompReplace()"). The subclass has
   * no members to tear down; all work is delegated to the base.
   */
  destroy(): void {
    // 0x436e55  jmp __ZN18HgcMaskCompReplaceD2Ev  ## HgcMaskCompReplace::~HgcMaskCompReplace()
    this._base.destroy();
  }

  /**
   * ~HMaskCompReplace() — deleting destructor (D0) @Ozone 0x436e60.
   *
   * Disasm:
   *   push rbp / mov rbp,rsp / push rbx / push rax
   *   mov rbx, rdi                            ## save this
   *   call __ZN18HgcMaskCompReplaceD2Ev       ## HgcMaskCompReplace::~D2()
   *   mov rdi, rbx
   *   add rsp,8 / pop rbx / pop rbp
   *   jmp 0x6def6a                            ## HGObject::operator delete(void*)
   *
   * Run the base dtor, then hand the storage back to HGObject::operator
   * delete. Both callees are undecoded here — the throws surface that gap.
   */
  destroyDeleting(): void {
    // 0x436e69  callq __ZN18HgcMaskCompReplaceD2Ev
    this._base.destroy();
    // 0x436e77  jmp __ZN8HGObjectdlEPv (tail-call, symbol stub for HGObject::operator delete)
    HGObject_operatorDelete(this);
  }

  /**
   * GetDOD(HGRenderer*, int, HGRect) — @Ozone 0x436e80.
   *
   * Overrides the base virtual to compute the output-side domain of
   * definition. The third argument (an HGRect) is the caller-supplied
   * requested-rect and is intentionally UNUSED by this implementation
   * (register %r8/%rcx never re-read after being clobbered by the
   * HGRectNull load at 0x436ea3).
   *
   * Control flow, line-for-line with the disasm:
   *
   *   0x436e9f  testl %edx,%edx                     ; if (port != 0)
   *   0x436ea1  je   0x436eaf                       ;   fall through to port==0 case
   *   0x436ea3  movq 0x3e9e76(%rip), %rcx           ; else load _HGRectNull
   *   0x436eaa  jmp  0x436fac                       ;   and return it
   *
   *   ---- port == 0 branch ----
   *   0x436eaf..0x436ec4  input = renderer.GetInput(this, 0)
   *   0x436ec9..0x436ecf  inDod = renderer.GetDOD(input)
   *   0x436eda..0x436ee0  isNull = HGRectIsNull(inDod)
   *   0x436ee5..0x436ef0  init x0=0, y0=0, w=-1 (0xffffffff), h=-1
   *   0x436ef6  test eax,eax  ; if (isNull) skip clamp
   *   0x436ef8  jne  0x436f4b
   *
   *   ---- clamp branch (input DOD is not null) ----
   *   0x436efa..0x436f0b  x0 = (inDod.x0 >= 0xC0000002) ? inDod.x0 : 0xC0000001
   *   0x436f13..0x436f1a  y0 = (inDod.y0 >= 0xC0000002) ? inDod.y0 : 0xC0000001
   *   0x436f1e..0x436f30  x1clamped = (inDod.x1 < 0x3FFFFFFE) ? inDod.x1 : 0x3FFFFFFE
   *   0x436f38..0x436f3e  y1clamped = (inDod.y1 < 0x3FFFFFFE) ? inDod.y1 : 0x3FFFFFFE
   *   0x436f42..0x436f48  x = x0; w = x1clamped - x0; h = y1clamped - y0
   *
   *   ---- read the two controlling floats via vtable slot *0x68 ----
   *   0x436f4d..0x436f5c  (*(this->vtable + 0x68))(this, 1, &out)
   *                       ; -> HgcMaskCompReplace::GetParameter(1, out) @0x6b8cc0
   *   0x436f5f..0x436f76  absF32(out[0]) >= 1e-5 -> return HGRectInfinite
   *   0x436f78..0x436f87  absF32(out[1]) <  1e-5 -> jump back to HGRectNull path
   *   0x436f8d..0x436f9e  HGRectMake4i(x, y, w, h)
   *
   * All the ×32 comparisons are signed (jl/cmovll/cmovgel), matching an int32
   * clamp. All the ×f32 comparisons are `ucomiss` on Math.fround values —
   * we mirror the abs+compare in single precision.
   */
  GetDOD(renderer: HGRenderer, port: number, _rect: HGRect): HGRect {
    // 0x436e9f: if (port != 0) return HGRectNull;   (any non-zero output port
    // has no defined domain — this subclass produces port 0 only.)
    if ((port | 0) !== 0) {
      // 0x436ea3 movq HGRectNull(%rip),%rcx ; 0x436faf return {*rcx, *(rcx+8)}
      return HGRectNull();
    }

    // 0x436eb9..0x436ec4  renderer.GetInput(this, 0)
    // 0x436ec9..0x436ecf  renderer.GetDOD(that input node)
    const inDod: HGRect = renderer.GetDOD(
      renderer.GetInput(this as unknown as HGNode, 0)
    );

    // 0x436ed7..0x436ee0  HGRectIsNull(inDod)
    const isNull = HGRectIsNull(inDod);

    // 0x436ee5..0x436ef0  default fallthrough values used when isNull is true.
    //   x=0, y=0, w=-1, h=-1  (matches the eax=0, r12d=-1, r13d=-1 init.)
    let x = 0 | 0;
    let y = 0 | 0;
    let w = -1 | 0;      // 0xFFFFFFFF as i32
    let h = -1 | 0;      // 0xFFFFFFFF as i32

    if (!isNull) {
      // ---- 0x436efa..0x436f48  int32 clamp of inDod to [MIN,MAX] ----
      // MIN = 0xC0000001 as i32 = -1073741823 ; the lo bound in the disasm.
      // MAX = 0x3FFFFFFE as i32 =  1073741822 ; the hi bound in the disasm.
      // The `cmovgel` uses SIGNED >= 0xC0000002; below that we saturate to
      // 0xC0000001 (one less than the threshold — matches how the constant is
      // preloaded into %eax at 0x436f06). Same shape for the hi clamp using
      // `cmovll` and 0x3FFFFFFE.
      const MIN_LOAD = 0xC0000001 | 0;  // = -1073741823, preloaded value
      const MIN_THR  = 0xC0000002 | 0;  // = -1073741822, comparison threshold
      const MAX_LOAD = 0x3FFFFFFE | 0;  // =  1073741822
      const MAX_THR  = 0x3FFFFFFE | 0;  // =  1073741822 (strict < in cmovll)

      // 0x436efa cmpl $0xc0000002,%r15d ; 0x436f0b cmovgel %r15d,%eax
      const x0c = ((inDod.x0 | 0) >= MIN_THR) ? (inDod.x0 | 0) : MIN_LOAD;
      // 0x436f13 cmpl $0xc0000002,%r15d ; 0x436f1a cmovgel %r15d,%ecx  (r15 was inDod hi qword after shr 32 -> y0)
      const y0c = ((inDod.y0 | 0) >= MIN_THR) ? (inDod.y0 | 0) : MIN_LOAD;
      // 0x436f1e cmpl $0x3ffffffe,%ebx ; 0x436f30 cmovll %ebx,%r12d
      const x1c = ((inDod.x1 | 0) <  MAX_THR) ? (inDod.x1 | 0) : MAX_LOAD;
      // 0x436f38 cmpl $0x3ffffffe,%ebx ; 0x436f3e cmovll %ebx,%r13d
      const y1c = ((inDod.y1 | 0) <  MAX_THR) ? (inDod.y1 | 0) : MAX_LOAD;

      // 0x436f42..0x436f48  x = x0c; y = y0c; w = x1c - x0c; h = y1c - y0c
      // (movl %eax,-0x44(%rbp) / subl %eax,%r12d / subl %ecx,%r13d ; then
      //  0x436f4b movl %ecx,%ebx moves y0 into the "y" slot for the make.)
      x = x0c | 0;
      y = y0c | 0;
      w = (x1c - x0c) | 0;
      h = (y1c - y0c) | 0;
    }

    // ---- 0x436f4d..0x436f5c  virtual call: this->GetParameter(1, &out) ----
    // vtable @0x88c3c8 slot *0x68 = HgcMaskCompReplace::GetParameter(int, float*).
    // Fills out[0], out[1] with the two controlling parameters. We honour
    // that shape (a Float32Array is the ABI-honest carrier of two f32s).
    const out = new Float32Array(2);
    this._base.GetParameter(1, out);

    // ---- 0x436f5f..0x436f6b  xmm1 = |out[0]|  (single-precision) ----
    // andps 0x2d0c55(%rip),%xmm1  ; mask = 0x7fffffff7fffffff @Ozone 0x707bc0
    // movss 0x2d0c6d(%rip),%xmm0  ; xmm0 = 1e-5f (0x3727c5ac) @Ozone 0x707be0
    const EPS_F32 = Math.fround(9.999999747378752e-06);  // = f32(0x3727c5ac)
    const absP0 = Math.fround(Math.abs(Math.fround(out[0])));

    // 0x436f73 ucomiss %xmm1,%xmm0 ; 0x436f76 jbe 0x436fa5
    //   jbe = (1e-5 <= |p0|)  ->  return HGRectInfinite
    if (EPS_F32 <= absP0) {
      // 0x436fa5 movq HGRectInfinite(%rip),%rcx
      return HGRectInfinite();
    }

    // 0x436f78..0x436f84  xmm1 = |out[1]|  (same abs-mask at 0x707bc0)
    const absP1 = Math.fround(Math.abs(Math.fround(out[1])));

    // 0x436f87 ja 0x436ea3
    //   ja = (1e-5 > |p1|)  ->  jump back to the HGRectNull path
    if (EPS_F32 > absP1) {
      return HGRectNull();
    }

    // ---- 0x436f8d..0x436f9e  HGRectMake4i(x, y, w, h) ----
    // 0x436f8d movl -0x44(%rbp),%edi ; 0x436f90 addl %edi,%r12d ; ...
    // Note: the disasm re-adds %edi to %r12d (which already held x1c - x0c),
    // making the width argument (x1c - x0c) + x0c = x1c. Same for height.
    // So the make4i call is HGRectMake4i(x=x0c, y=y0c, w=x1c, h=y1c).
    // (In other words, the two "sub then re-add" instructions are a compiler
    // artifact — the net effect is that x1c/y1c go in as the last two args,
    // NOT the deltas. Faithfully reproduced here.)
    const arg2 = (w + x) | 0;   // = x1c
    const arg3 = (h + y) | 0;   // = y1c
    return HGRectMake4i(x, y, arg2, arg3);
  }

  /**
   * GetROI(HGRenderer*, int, HGRect) — @Ozone 0x436fe0.
   *
   * Full disasm (13 lines):
   *   0x436fe0  movq %rcx,%rax           ; return.lo = arg.lo
   *   0x436fe3  cmpl $0x2,%edx           ; if (port >= 2) ...
   *   0x436fe6  jl   0x436ffb            ;   fall through: return arg unchanged
   *   0x436fe8  push rbp / mov rbp,rsp
   *   0x436fec  movq HGRectNull(%rip),%rcx
   *   0x436ff3  movq (%rcx),%rax
   *   0x436ff6  movq 0x8(%rcx),%r8       ; return.hi = HGRectNull.hi
   *   0x436ffa  pop rbp
   *   0x436ffb  movq %r8,%rdx            ; return.hi = arg.hi (or HGRectNull.hi
   *                                        if we took the >= 2 branch)
   *   0x436ffe  retq
   *
   * i.e. for port ∈ {0, 1} return the caller-supplied rect UNCHANGED
   * (the ROI on a given input equals the ROI request handed to us). For any
   * higher port return HGRectNull — this node only reads inputs 0 and 1
   * (mask + backing image, per the "replace" semantics).
   */
  GetROI(_renderer: HGRenderer, port: number, rect: HGRect): HGRect {
    // 0x436fe3 cmpl $0x2,%edx ; 0x436fe6 jl 0x436ffb
    if ((port | 0) < 2) {
      return rect;
    }
    // 0x436fec movq _HGRectNull(%rip),%rcx
    return HGRectNull();
  }
}
