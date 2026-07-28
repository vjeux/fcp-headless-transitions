// FFRenderVAMLMatte.ts — faithful transcription of the Flexo class
// FFRenderVAMLMatte (a thin HGNode-derived "render node" wrapper around
// the Objective-C VAMLBackgroundMatting matting engine and its underlying
// FFVAMLMatte worker).
//
// Binary source (x86_64 slice of the FAT Flexo framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// Disassembly (recovered from otool -tV; C2 body was ICF-forwarded from C1):
//   raw-port/re/disasm/Flexo.FFRenderVAMLMatte.FFRenderVAMLMatte.s  @0x687fd0  (C1 — tail-jmp C2)
//   raw-port/re/disasm/Flexo.FFRenderVAMLMatte.C2.s                 @0x687eb0  (C2 — real body)
//   raw-port/re/disasm/Flexo.FFRenderVAMLMatte.GetOutput.s          @0x6880e0  (GetOutput)
//                          (D0 @0x688080, D1 @0x688030, D2 @0x687fe0 dumped inline below.)
//
// nm -arch x86_64 Flexo (six methods, all real symbols — no ICF collision):
//   0000000000687eb0 T __ZN17FFRenderVAMLMatteC2EP21VAMLBackgroundMatting
//   0000000000687fd0 T __ZN17FFRenderVAMLMatteC1EP21VAMLBackgroundMatting  // tail-jmp C2
//   0000000000687fe0 T __ZN17FFRenderVAMLMatteD2Ev
//   0000000000688030 T __ZN17FFRenderVAMLMatteD1Ev
//   0000000000688080 T __ZN17FFRenderVAMLMatteD0Ev
//   00000000006880e0 T __ZN17FFRenderVAMLMatte9GetOutputEP10HGRenderer
//
// VTABLE ADDRESS (identical in all four ctor/dtor slots — Itanium ABI: dtors
// re-install this-class vtable before running any subclass-specific teardown):
//   C2 @0x687ec5: leaq 0x1279bcc(%rip), %rax  ; rip = 0x687ecc → 0x1901a98
//   D0 @0x688089: leaq 0x1279a08(%rip), %rax  ; rip = 0x688090 → 0x1901a98
//   D1 @0x688039: leaq 0x1279a58(%rip), %rax  ; rip = 0x688040 → 0x1901a98
//   D2 @0x687fe9: leaq 0x1279aa8(%rip), %rax  ; rip = 0x687ff0 → 0x1901a98
//   All four point to the same 16-byte-in vtable slot (typeinfo* +
//   first virtual method pointer — the vtable object itself begins 16
//   bytes earlier at 0x1901a88, but this class stores the "start of
//   virtuals" pointer per standard ABI).
//
// STRUCT LAYOUT (recovered from C2 initializer stores + GetOutput reads):
//   +0x000       vptr (HGNode base subobject's vtable slot; overwritten to
//                &vtable_FFRenderVAMLMatte @0x1901a98 by C2 @0x687ecc/0x687ecf)
//   +0x000..+0x1af  (HGNode base subobject — 0x1b0 bytes; layout owned by
//                HGNode which is not yet transcribed)
//   +0x1b0       HGRect  outputBounds (16 bytes; initialized to (0,0,0,0)
//                via HGRect::Init(&outputBounds,0,0,0,0) @0x687f06;
//                subsequently GetOutput copies +0x198..+0x1af (input bounds
//                on HGNode base) into the FFVAMLMatte's own rect at
//                +0x198..+0x1af, and then calls HGRect::Init on the
//                FFVAMLMatte's +0x1b0 with (0,0,w,h) where w,h are the
//                deltas of the caller-side +0x1b0..+0x1bc rect. See below.)
//   +0x1c0       id       vamlBackgroundMatting  (Objective-C
//                VAMLBackgroundMatting* — retained by C2 @0x687ee9
//                via objc_retain; released by D0/D1/D2 via objc_release.)
//   +0x1c8       FFVAMLMatte*  matte  (owned; allocated with sizeof=0x1d0
//                via HGObject::operator new @0x687f10, constructed via
//                FFVAMLMatte::FFVAMLMatte(VAMLBackgroundMatting*)
//                @0x687f25 with the retained id (fetched from +0x1c0)
//                as ctor arg. Released on destruction via *vtable[0x18/8]
//                — i.e. vslot 3 — which is FFVAMLMatte's deleting dtor.)
//   sizeof(FFRenderVAMLMatte) is not observed here (no `new` site inside
//   this class — callers allocate the object). Two facts pin the tail
//   layout: (a) C2 zeros exactly 16 bytes at +0x1c0..+0x1cf with
//   `xorps %xmm0,%xmm0 ; movaps %xmm0, 0x1c0(%rbx)` @0x687ecf/0x687ed2,
//   and (b) both members immediately following (+0x1c0 id, +0x1c8 ptr)
//   are exactly 8 bytes each and fully cover that xmm store.
//
// FRONTIER (undecoded callees / opaque types cited by @0xADDR):
//   HGNode                                       — base class (not yet transcribed)
//     C2:  HGNode::HGNode()                       @Flexo 0x687ec0 (stub 0x1496c06)
//     D0:  HGNode::~HGNode()                      @Flexo 0x6880b5 (stub 0x1496c0c)
//   HGRect::Init(int,int,int,int)                 @Flexo 0x687f06 (stub 0x1496c12)
//                                                 @Flexo 0x68811b (stub 0x1496c12)
//   HGNode::SetSupportedFormatPrecisions(uint32)  @Flexo 0x687ee1 (stub 0x1496be2)
//                                                 @Flexo 0x6881a1, 0x6881ec
//   HGObject::operator new(size_t)                @Flexo 0x687f10 (stub 0x1496d92)
//   HGObject::operator delete(void*)              @Flexo 0x687f8c (stub 0x1496d8c)
//   FFVAMLMatte::FFVAMLMatte(VAMLBackgroundMatting*) @Flexo 0x687f25 (direct call)
//   FFVAMLMatte deleting dtor (vslot 3, offset 0x18) @Flexo 0x687f3e/0x687f55/
//                                                       0x6880af/0x68805f/0x68800f
//                                                       (also GetOutput @0x688162,
//                                                       @0x68818a — but there vslot
//                                                       0x78 = another virtual)
//   HGRenderer::GetInput(HGNode*, int)            @Flexo 0x688152/0x688177/0x6881da
//                                                 (stub 0x1495e9e)
//   FFVAMLMatte's vtable slot 0x78 (SetInput?)    @Flexo 0x688162, 0x68818a
//   FFVAMLMatte's vtable slot 0x70 (GetInputCount?) @Flexo 0x6881ac, 0x6881c9
//   objc_retain / objc_release (Foundation)       @Flexo 0x687ee9, 0x68809a, 0x68804a, 0x687ffa
//   __clang_call_terminate                        (unwind landing pad)
//   __Unwind_Resume                               (stub 0x1495d30)
//
// -------------------------------------------------------------------

import { HGRect } from "../render/HGRect";

/** Address of the vtable slot written at +0x000 by all four ctors/dtors.
 *  @Flexo C2 @0x687ec5/0x687ecc → 0x1901a98
 *  @Flexo D0 @0x688089/0x688090 → 0x1901a98
 *  @Flexo D1 @0x688039/0x688040 → 0x1901a98
 *  @Flexo D2 @0x687fe9/0x687ff0 → 0x1901a98
 */
export const FFRenderVAMLMatte_VTABLE_ADDR = 0x1901a98;

/** Size of the FFVAMLMatte worker object allocated by C2 (imm operand of
 *  `movl $0x1d0, %edi` @0x687f0b immediately before the HGObject::operator
 *  new call at 0x687f10).  Pinning it here so the FFVAMLMatte port can
 *  reference the same magic without a fresh disasm. */
export const FFVAMLMatte_SIZEOF = 0x1d0;

// ---- Frontier stubs (all raise with the exact @0xADDR of the call site) ----

/** HGNode base ctor — called by FFRenderVAMLMatte C2 @0x687ec0.
 *  Not yet transcribed @Flexo (base class HGNode). */
function HGNode_ctor(_self: object): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed (base ctor, called from " +
    "FFRenderVAMLMatte::FFRenderVAMLMatte @Flexo 0x687ec0)"
  );
}

/** HGNode base dtor — tail-jmp target from FFRenderVAMLMatte D1/D2
 *  and inline call from D0 @0x6880b5.
 *  Not yet transcribed @Flexo (base class HGNode). */
function HGNode_dtor(_self: object): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (base dtor, called from " +
    "FFRenderVAMLMatte::~FFRenderVAMLMatte @Flexo 0x6880b5 [D0] / " +
    "0x68806b [D1 tail-jmp] / 0x68801b [D2 tail-jmp])"
  );
}

/** HGNode::SetSupportedFormatPrecisions(uint32) — called by C2 with
 *  argument 1 @0x687ee1, and by GetOutput with argument 1 @0x6881a1 and
 *  @0x6881ec.  Not yet transcribed @Flexo (base class HGNode). */
function HGNode_SetSupportedFormatPrecisions(_self: object, _mask: number): void {
  throw new Error(
    "HGNode::SetSupportedFormatPrecisions(uint32) not yet transcribed " +
    "(called from FFRenderVAMLMatte::FFRenderVAMLMatte @Flexo 0x687ee1 and " +
    "FFRenderVAMLMatte::GetOutput @Flexo 0x6881a1, 0x6881ec)"
  );
}

/** HGRect::Init(HGRect*,int,int,int,int) — called by C2 with (0,0,0,0)
 *  @0x687f06 to zero this->outputBounds, and by GetOutput with (0,0,w,h)
 *  @0x68811b to write the FFVAMLMatte's own +0x1b0 rect.
 *  Not yet transcribed @Flexo (Helium HGRect::Init).
 *
 *  Returns a fresh HGRect because the ported HGRect interface is
 *  declared `readonly` (see raw-port/src/render/HGRect.ts).  The C++
 *  signature writes in-place at %rdi; TS callers assign the return
 *  value into the target field, which is byte-for-byte equivalent. */
function HGRect_Init(x0: number, y0: number, x1: number, y1: number): HGRect {
  // Faithful behavior — HGRect::Init writes (x,y,right,bottom) directly.
  // (Verified by inspection of Helium HGRect free-function family in
  //  raw-port/src/render/HGRect.ts; the member Init overload is a
  //  1:1 wrapper.  We do NOT rely on transcribing HGRect::Init's asm
  //  here — instead we assign the four fields the same way HGRect
  //  free-functions do.)
  return { x: x0 | 0, y: y0 | 0, right: x1 | 0, bottom: y1 | 0 };
}

/** HGObject::operator new — called by C2 @0x687f10 with size=0x1d0 to
 *  allocate the FFVAMLMatte worker.
 *  Not yet transcribed @Flexo (Helium HGObject pool allocator). */
function HGObject_operator_new(_size: number): FFVAMLMatte {
  throw new Error(
    "HGObject::operator new(size_t) not yet transcribed " +
    "(called from FFRenderVAMLMatte::FFRenderVAMLMatte @Flexo 0x687f10 " +
    "with size=0x1d0)"
  );
}

/** FFVAMLMatte ctor — called by C2 @0x687f25 with the retained
 *  VAMLBackgroundMatting id as ctor arg.
 *  Not yet transcribed @Flexo (class FFVAMLMatte, symbol
 *  __ZN11FFVAMLMatteC1EP21VAMLBackgroundMatting). */
function FFVAMLMatte_ctor(_self: FFVAMLMatte, _matting: unknown): void {
  throw new Error(
    "FFVAMLMatte::FFVAMLMatte(VAMLBackgroundMatting*) not yet transcribed " +
    "(called from FFRenderVAMLMatte::FFRenderVAMLMatte @Flexo 0x687f25)"
  );
}

/** FFVAMLMatte deleting dtor — reached via *vtable[3] i.e. *(0x18)(vptr).
 *  Cited from C2 landing pad @0x687f3e/0x687f55 and from D0/D1/D2
 *  @0x6880af/0x68805f/0x68800f.  Not yet transcribed @Flexo. */
function FFVAMLMatte_deleting_dtor(_self: FFVAMLMatte): void {
  throw new Error(
    "FFVAMLMatte::~FFVAMLMatte (deleting, vslot 3 @+0x18) not yet transcribed " +
    "(called from FFRenderVAMLMatte::FFRenderVAMLMatte landing pad " +
    "@Flexo 0x687f3e/0x687f55, and D0/D1/D2 @0x6880af/0x68805f/0x68800f)"
  );
}

/** HGRenderer::GetInput(HGNode*, int) — called by GetOutput three times:
 *  @0x688152 (index 0), @0x688177 (index 1), and @0x6881da (index r12d loop).
 *  Returns an opaque input handle. Not yet transcribed @Flexo. */
function HGRenderer_GetInput(_renderer: HGRenderer, _node: object, _index: number): unknown {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
    "(called from FFRenderVAMLMatte::GetOutput @Flexo 0x688152, 0x688177, 0x6881da)"
  );
}

/** FFVAMLMatte vslot 0x78 — the "attach input" virtual method.  Called
 *  twice by GetOutput @0x688162 (index 0) and @0x68818a (index 1) with
 *  the result of HGRenderer::GetInput as the third argument.
 *  Not yet transcribed @Flexo. */
function FFVAMLMatte_vslot78_setInput(
  _matte: FFVAMLMatte,
  _index: number,
  _input: unknown,
): void {
  throw new Error(
    "FFVAMLMatte::vslot[0x78/8] (setInput?) not yet transcribed " +
    "(called from FFRenderVAMLMatte::GetOutput @Flexo 0x688162, 0x68818a)"
  );
}

/** FFVAMLMatte vslot 0x70 — the "get input count" virtual method (returns
 *  int32; loop bound compares %r12d against it).  Called by GetOutput
 *  @0x6881ac and @0x6881c9.  Not yet transcribed @Flexo. */
function FFVAMLMatte_vslot70_getInputCount(_matte: FFVAMLMatte): number {
  throw new Error(
    "FFVAMLMatte::vslot[0x70/8] (getInputCount?) not yet transcribed " +
    "(called from FFRenderVAMLMatte::GetOutput @Flexo 0x6881ac, 0x6881c9)"
  );
}

/** objc_retain — Foundation. Called by C2 @0x687ee9 on the VAMLBackgroundMatting
 *  ctor argument.  Not modeled beyond identity (TS has no ARC). */
function objc_retain<T>(x: T): T {
  // In FCP's actual runtime this increments the retain count; in the
  // transcribed TS runtime we do not model reference counting for
  // Objective-C ids. The identity semantics are exactly what the asm
  // performs at the abstract level: `movq %rax, 0x1c0(%rbx)` uses the
  // return value of objc_retain, which for retainable pointers is the
  // same address as the input.  @Flexo 0x687ee9.
  return x;
}

/** objc_release — Foundation. Called by all three dtors on the
 *  VAMLBackgroundMatting id at +0x1c0. */
function objc_release(_x: unknown): void {
  // See objc_retain — TS does not model ARC.  @Flexo 0x68809a (D0),
  // 0x68804a (D1), 0x687ffa (D2).
}

// ---- Forward-referenced opaque types ----

/** FFVAMLMatte — the worker matting engine.  Full class not yet
 *  transcribed @Flexo (0x1d0 bytes, allocated by C2 @0x687f10). */
export type FFVAMLMatte = {
  /** vptr — vtable of the concrete FFVAMLMatte class (used by GetOutput
   *  to dispatch vslot 0x70 and 0x78, and by dtors to dispatch vslot 3
   *  = deleting-dtor).  Layout not yet transcribed @Flexo. */
  vptr: number;
  /** HGRect at +0x198..+0x1af — GetOutput copies the caller-side
   *  +0x198..+0x1af block into it @0x688127..0x68813c.  Layout not yet
   *  transcribed @Flexo. */
  rect198: HGRect;
  /** HGRect at +0x1b0..+0x1bf — GetOutput calls HGRect::Init with
   *  (0,0,w,h) on it @0x68811b.  Layout not yet transcribed @Flexo. */
  rect1b0: HGRect;
};

/** VAMLBackgroundMatting — Objective-C class, opaque.  Not yet
 *  transcribed @Flexo (Foundation-managed). */
export type VAMLBackgroundMatting = unknown;

/** HGRenderer — Helium's per-frame renderer context passed to GetOutput.
 *  Not yet transcribed @Flexo. */
export type HGRenderer = unknown;

/**
 * FFRenderVAMLMatte — a Helium HGNode-derived render node whose sole
 * job is to (a) own a retained reference to an Objective-C
 * VAMLBackgroundMatting engine and (b) forward Helium's render pipeline
 * calls to an internally-owned FFVAMLMatte worker.
 *
 * @Flexo class FFRenderVAMLMatte : public HGNode.
 *
 * Field layout mirrors the C++ object byte-for-byte from +0x1b0
 * upward — earlier fields belong to HGNode and are handled through
 * the base subobject's own ctor/dtor.
 */
export class FFRenderVAMLMatte {
  /** +0x000 — vptr (installed by C2 @0x687ecc/0x687ecf).  All four
   *  ctors/dtors write &vtable_FFRenderVAMLMatte here. */
  vptr: number = FFRenderVAMLMatte_VTABLE_ADDR;

  /** +0x1b0 — HGRect outputBounds. C2 zeros it via
   *  `HGRect::Init(this+0x1b0, 0, 0, 0, 0)` @0x687f06.  GetOutput
   *  later reads (this+0x1b8, this+0x1bc) minus (this+0x1b0, this+0x1b4)
   *  to compute (w, h) — see the arithmetic @0x6880ee..0x688101.
   *  So this rect stores (originX, originY, endX, endY) in int32. */
  outputBounds: HGRect = { x: 0, y: 0, right: 0, bottom: 0 };

  /** +0x1c0 — id vamlBackgroundMatting.  C2 retains the ctor argument
   *  via objc_retain @0x687ee9 and stores the (retained) pointer here.
   *  D0/D1/D2 release it via objc_release. */
  vamlBackgroundMatting: VAMLBackgroundMatting = null;

  /** +0x1c8 — FFVAMLMatte* matte.  C2 allocates it with
   *  `HGObject::operator new(0x1d0)` @0x687f10, constructs it via
   *  FFVAMLMatte::FFVAMLMatte(VAMLBackgroundMatting*) @0x687f25 with
   *  the (already-retained) id at +0x1c0 as ctor arg, and stores the
   *  resulting pointer here @0x687f41.  D0/D1/D2 dispatch the
   *  deleting dtor through *vtable[3] (offset 0x18). */
  matte: FFVAMLMatte | null = null;

  /**
   * FFRenderVAMLMatte::FFRenderVAMLMatte(VAMLBackgroundMatting*).
   * Both C1 (@0x687fd0 — pure tail-jmp to C2) and C2 (@0x687eb0 —
   * real body) construct the object identically; C1's tail-jmp is
   * elided in TS.
   *
   * @Flexo __ZN17FFRenderVAMLMatteC2EP21VAMLBackgroundMatting @0x687eb0..0x687f62.
   *
   * Faithful asm mirror:
   *   pushq  %rbp / movq %rsp,%rbp / push r15/r14/rbx/rax   ; frame + save
   *   movq   %rsi, %r14                                     ; %r14 = matting arg
   *   movq   %rdi, %rbx                                     ; %rbx = this
   *   callq  HGNode::HGNode()                               ; @0x687ec0
   *   leaq   0x1279bcc(%rip), %rax                          ; @0x687ec5 -> 0x1901a98
   *   movq   %rax, (%rbx)                                   ; @0x687ecc  this->vptr = 0x1901a98
   *   xorps  %xmm0, %xmm0
   *   movaps %xmm0, 0x1c0(%rbx)                             ; @0x687ed2  zero +0x1c0..+0x1cf
   *   movq   %rbx, %rdi / movl $0x1,%esi
   *   callq  HGNode::SetSupportedFormatPrecisions           ; @0x687ee1  mask=1
   *   movq   %r14, %rdi
   *   callq  *objc_retain(%rip)                             ; @0x687ee9  retain(matting)
   *   movq   %rax, 0x1c0(%rbx)                              ; @0x687eef  this->vamlBackgroundMatting = retained
   *   leaq   0x1b0(%rbx), %rdi
   *   xorl   %esi/%edx/%ecx/%r8d, ...                       ; args (0,0,0,0)
   *   callq  HGRect::Init                                   ; @0x687f06  outputBounds = (0,0,0,0)
   *   movl   $0x1d0, %edi
   *   callq  HGObject::operator new                         ; @0x687f10  size = 0x1d0
   *   movq   %rax, %r14                                     ;            %r14 = fresh FFVAMLMatte*
   *   leaq   0x1c0(%rbx), %rax
   *   movq   (%rax), %rsi                                   ; %rsi = this->vamlBackgroundMatting
   *   movq   %r14, %rdi
   *   callq  FFVAMLMatte::FFVAMLMatte(VAMLBackgroundMatting*) ; @0x687f25
   *   movq   0x1c8(%rbx), %rdi                              ; old this->matte (nullptr on first call)
   *   cmpq   %r14, %rdi
   *   je     .same                                          ; @0x687f34
   *     testq  %rdi, %rdi
   *     je     .install                                     ; @0x687f39
   *     movq   (%rdi), %rax / callq *0x18(%rax)             ; @0x687f3e   old->vslot[3]() -> delete old
   *   .install:
   *     movq   %r14, 0x1c8(%rbx)                            ; @0x687f41   this->matte = new one
   *     jmp    .done                                        ; @0x687f48
   *   .same:
   *     testq  %r14, %r14
   *     je     .done
   *     movq   (%r14), %rax / callq *0x18(%rax)             ; @0x687f55   symmetric delete of new
   *   .done: (epilogue)
   *
   * The `cmpq %r14, %rdi ; je` branch is a standard C++ "swap-then-
   * delete" idiom emitted for `std::unique_ptr::reset` or an inlined
   * hand-written equivalent.  In C2's first invocation the "old"
   * pointer at +0x1c8 has just been zeroed by the xorps store, so
   * the compare always misses and we execute the "install new" path.
   * We mirror the full branch so the transcription is faithful even
   * for future callers that may re-enter through C1 on a live object.
   */
  constructor(matting: VAMLBackgroundMatting) {
    // @0x687ec0 — base HGNode subobject construction.
    HGNode_ctor(this);
    // @0x687ecc/0x687ecf — vptr install (also handled by the field default
    // for the "new object" path; kept explicit to mirror the asm store).
    this.vptr = FFRenderVAMLMatte_VTABLE_ADDR;
    // @0x687ed2 — zero the 16 bytes at +0x1c0..+0x1cf (vamlBackgroundMatting
    // and matte).  In TS this corresponds to setting both fields to null.
    this.vamlBackgroundMatting = null;
    this.matte = null;
    // @0x687ee1 — HGNode::SetSupportedFormatPrecisions(1).
    HGNode_SetSupportedFormatPrecisions(this, 1);
    // @0x687ee9 — retain the matting id and store it at +0x1c0.
    this.vamlBackgroundMatting = objc_retain(matting);
    // @0x687f06 — HGRect::Init(&this->outputBounds, 0, 0, 0, 0).
    this.outputBounds = HGRect_Init(0, 0, 0, 0);
    // @0x687f10 — allocate 0x1d0 bytes for a new FFVAMLMatte worker.
    const freshMatte = HGObject_operator_new(FFVAMLMatte_SIZEOF);
    // @0x687f25 — construct the FFVAMLMatte in-place with the retained id.
    FFVAMLMatte_ctor(freshMatte, this.vamlBackgroundMatting);
    // @0x687f2a..0x687f58 — "swap-then-delete" install of the new matte.
    const oldMatte = this.matte;
    if (oldMatte !== freshMatte) {
      if (oldMatte !== null) {
        // @0x687f3e — old->vslot[3]()  (deleting dtor of the previous matte).
        FFVAMLMatte_deleting_dtor(oldMatte);
      }
      // @0x687f41 — this->matte = freshMatte.
      this.matte = freshMatte;
    } else {
      // Symmetric branch @0x687f4a — if the "new" pointer already
      // equals the "old" one (impossible on first C2 invocation
      // because +0x1c8 was zeroed at 0x687ed2, but faithfully mirrored),
      // delete the freshly-constructed object via its own vtable slot 3.
      if (freshMatte !== null) {
        // @0x687f55 — fresh->vslot[3]().
        FFVAMLMatte_deleting_dtor(freshMatte);
      }
    }
  }

  /**
   * FFRenderVAMLMatte::~FFRenderVAMLMatte  (D2 — base dtor).
   * @Flexo __ZN17FFRenderVAMLMatteD2Ev @0x687fe0..0x68801b.
   *
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   movq  %rdi, %rbx                              ; this
   *   leaq  0x1279aa8(%rip), %rax                   ; @0x687fe9 -> 0x1901a98
   *   movq  %rax, (%rdi)                            ; @0x687ff0   this->vptr = vtable
   *   movq  0x1c0(%rdi), %rdi                       ; @0x687ff3   arg = vamlBackgroundMatting
   *   callq *objc_release(%rip)                     ; @0x687ffa
   *   movq  0x1c8(%rbx), %rdi                       ; @0x688000   arg = this->matte
   *   testq %rdi, %rdi
   *   je    .skip                                   ; @0x68800a
   *     movq  (%rdi), %rax
   *     callq *0x18(%rax)                           ; @0x68800f   matte->vslot[3]()
   *   .skip:
   *     movq  %rbx, %rdi
   *     jmp   HGNode::~HGNode()                     ; @0x68801b   tail-call base dtor
   */
  destroy_D2(): void {
    // @0x687ff0 — re-install this-class vtable (Itanium ABI).
    this.vptr = FFRenderVAMLMatte_VTABLE_ADDR;
    // @0x687ffa — release the ObjC matting id.
    objc_release(this.vamlBackgroundMatting);
    // @0x688000..0x688012 — nullable-delete the owned FFVAMLMatte via
    // its own vtable slot 3 (the deleting dtor).
    if (this.matte !== null) {
      FFVAMLMatte_deleting_dtor(this.matte);
    }
    // @0x68801b — tail-call HGNode::~HGNode().
    HGNode_dtor(this);
  }

  /**
   * FFRenderVAMLMatte::~FFRenderVAMLMatte  (D1 — complete-object dtor).
   * @Flexo __ZN17FFRenderVAMLMatteD1Ev @0x688030..0x68806b.
   *
   * Byte-for-byte identical to D2 except the vtable-adjust RIP-relative
   * offset differs (compiler emits a fresh leaq per copy):
   *   leaq 0x1279a58(%rip), %rax   ; @0x688039 -> 0x1901a98 (same value)
   * Tail-jmp target is also HGNode::~HGNode() @0x68806b.
   *
   * Under standard Itanium ABI D1 and D2 share their observable
   * semantics; the compiler kept them as distinct symbols but the body
   * is a direct clone.  We therefore transcribe D1 as an exact call
   * into D2.
   */
  destroy_D1(): void {
    this.destroy_D2();
  }

  /**
   * FFRenderVAMLMatte::~FFRenderVAMLMatte  (D0 — deleting dtor).
   * @Flexo __ZN17FFRenderVAMLMatteD0Ev @0x688080..0x6880c3.
   *
   * Same as D1/D2 up to the vtable-adjust
   *   leaq 0x1279a08(%rip), %rax   ; @0x688089 -> 0x1901a98
   * then calls HGNode::~HGNode() DIRECTLY (not tail-jmp — inline call @0x6880b5)
   * and finally tail-jmps HGObject::operator delete(this) @0x6880c3.
   *
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   movq  %rdi, %rbx                              ; @0x688086  this
   *   leaq  0x1279a08(%rip), %rax                   ; @0x688089
   *   movq  %rax, (%rdi)                            ; @0x688090
   *   movq  0x1c0(%rdi), %rdi
   *   callq *objc_release(%rip)                     ; @0x68809a
   *   movq  0x1c8(%rbx), %rdi
   *   testq %rdi, %rdi
   *   je    .skip
   *     movq (%rdi), %rax
   *     callq *0x18(%rax)                           ; @0x6880af  matte->vslot[3]()
   *   .skip:
   *     movq  %rbx, %rdi
   *     callq HGNode::~HGNode()                     ; @0x6880b5  NON-tail
   *     movq  %rbx, %rdi
   *     addq  $0x8, %rsp / popq %rbx / popq %rbp
   *     jmp   HGObject::operator delete             ; @0x6880c3  tail-call
   */
  destroy_D0(): void {
    // @0x688090 — vptr install.
    this.vptr = FFRenderVAMLMatte_VTABLE_ADDR;
    // @0x68809a — release ObjC id.
    objc_release(this.vamlBackgroundMatting);
    // @0x6880af — matte->vslot[3]().
    if (this.matte !== null) {
      FFVAMLMatte_deleting_dtor(this.matte);
    }
    // @0x6880b5 — HGNode::~HGNode() (non-tail call in D0).
    HGNode_dtor(this);
    // @0x6880c3 — HGObject::operator delete(this) — final tail-call.
    // In the transcribed runtime this maps to letting the GC reclaim
    // the object; we cite the address for provenance.
    // (No explicit free — the transcription does not model
    //  HGObject::operator delete; the citation is the point.)
  }

  /**
   * FFRenderVAMLMatte::GetOutput(HGRenderer*).
   * @Flexo __ZN17FFRenderVAMLMatte9GetOutputEP10HGRenderer @0x6880e0..0x688202.
   *
   * Returns FFVAMLMatte* (the owned worker at +0x1c8) after wiring the
   * caller-side renderer state into it and connecting all its inputs.
   *
   * Faithful asm mirror:
   *   pushq %rbp / movq %rsp,%rbp / push r15/r14/r12/rbx  ; frame + save
   *   movq  %rdi, %rbx                              ; %rbx = this
   *   movl  0x1b8(%rdi), %ecx                       ; @0x6880ee  outputBounds.right
   *   movl  0x1bc(%rdi), %r8d                       ; @0x6880f4  outputBounds.bottom
   *   subl  0x1b0(%rdi), %ecx                       ; @0x6880fb  ecx = right - x
   *   subl  0x1b4(%rdi), %r8d                       ; @0x688101  r8d = bottom - y
   *   movq  %rsi, %r14                              ; %r14 = renderer
   *   movl  $0x1b0, %edi
   *   addq  0x1c8(%rbx), %rdi                       ; @0x688110  rdi = this->matte + 0x1b0
   *   xorl  %esi, %esi / xorl %edx, %edx
   *   callq HGRect::Init                            ; @0x68811b  matte->rect1b0 = (0,0,w,h)
   *   movq  0x1c8(%rbx), %rax                       ; %rax = this->matte
   *   movups 0x198(%rbx), %xmm0                     ; @0x688127  load 16 bytes
   *   movq  0x1a8(%rbx), %rcx                       ; @0x68812e  load 8 more bytes
   *   movq  %rcx, 0x1a8(%rax)                       ; @0x688135  store to matte+0x1a8
   *   movups %xmm0, 0x198(%rax)                     ; @0x68813c  store to matte+0x198
   *   movq  0x1c8(%rbx), %r15                       ;            %r15 = matte
   *   movq  %r14, %rdi / movq %rbx, %rsi / xorl %edx, %edx
   *   callq HGRenderer::GetInput(this, 0)           ; @0x688152
   *   movq  (%r15), %rcx                            ;            rcx = matte->vptr
   *   movq  %r15, %rdi / xorl %esi, %esi / movq %rax, %rdx
   *   callq *0x78(%rcx)                             ; @0x688162  matte->vslot[0x78/8](0, input0)
   *   movq  0x1c8(%rbx), %r15
   *   movq  %r14, %rdi / movq %rbx, %rsi / movl $0x1, %edx
   *   callq HGRenderer::GetInput(this, 1)           ; @0x688177
   *   movq  (%r15), %rcx
   *   movq  %r15, %rdi / movl $0x1, %esi / movq %rax, %rdx
   *   callq *0x78(%rcx)                             ; @0x68818a  matte->vslot[0x78/8](1, input1)
   *   movq  0x1c8(%rbx), %r15
   *   testq %r15, %r15
   *   je    .ret                                    ; @0x688197
   *     movq  %r15, %rdi / movl $0x1, %esi
   *     callq HGNode::SetSupportedFormatPrecisions  ; @0x6881a1  matte.SSFP(1)
   *     movq  (%r15), %rax / movq %r15, %rdi
   *     callq *0x70(%rax)                           ; @0x6881ac  N = matte->vslot[0x70/8]()
   *     testl %eax, %eax
   *     jle   .ret                                  ; @0x6881b1
   *     xorl  %r12d, %r12d
   *     jmp   .headTest                             ; @0x6881b6  (skip incl on first iter)
   *   .body: incl %r12d                             ; @0x6881c0
   *          movq (%r15), %rax / movq %r15, %rdi
   *          callq *0x70(%rax)                      ; @0x6881c9  N (re-fetched each iter!)
   *          cmpl  %eax, %r12d
   *          jge   .ret                             ; @0x6881cf
   *   .headTest:
   *          movq  %r14, %rdi / movq %r15, %rsi / movl %r12d, %edx
   *          callq HGRenderer::GetInput(matte, i)   ; @0x6881da
   *          testq %rax, %rax
   *          je    .body                            ; @0x6881e2  input==null -> next
   *          movq  %rax, %rdi / movl $0x1, %esi
   *          callq HGNode::SetSupportedFormatPrecisions  ; @0x6881ec  input.SSFP(1)
   *          jmp   .body                            ; @0x6881f1
   *   .ret:
   *          movq  0x1c8(%rbx), %rax                ;            return this->matte
   *          pop rbx/r12/r14/r15 / pop rbp / retq
   *
   * The inner loop is a classic "for (i=0; i<matte->getInputCount(); i++)"
   * with the *count re-fetched every iteration* — a faithful
   * transcription must NOT hoist it (the getter is a virtual call
   * whose observable result can, in principle, change).  We mirror
   * that behavior below.
   */
  GetOutput(renderer: HGRenderer): FFVAMLMatte | null {
    // @0x6880ee..0x688101 — compute (w, h) as (right-x, bottom-y).
    // The subs are int32 subtracts; JavaScript integer arithmetic on
    // small ints is exact.  We keep the `|0` idiom to make the width
    // and height explicitly 32-bit for future oracle comparisons.
    const w = ((this.outputBounds.right | 0) - (this.outputBounds.x | 0)) | 0;
    const h = ((this.outputBounds.bottom | 0) - (this.outputBounds.y | 0)) | 0;
    // @0x688110..0x68811b — HGRect::Init(matte+0x1b0, 0, 0, w, h).
    const matte = this.matte;
    if (matte === null) {
      // The asm dereferences this->matte unconditionally at 0x688110;
      // in C++ that path is never reached with a null matte because
      // C2 always installs a fresh one.  Faithful behavior on null:
      // raise (mirrors a segfault) with the citation.
      throw new Error(
        "FFRenderVAMLMatte::GetOutput: this->matte is null " +
        "(@Flexo 0x688110 unconditional deref)"
      );
    }
    matte.rect1b0 = HGRect_Init(0, 0, w, h);
    // @0x688127..0x68813c — copy 24 bytes from this+0x198..+0x1af
    // into matte+0x198..+0x1af.  In this port, the two subregions
    // (matte.rect198 and the 8-byte tail) are opaque; we cite the
    // copy but cannot faithfully perform it without HGNode's own
    // +0x198..+0x1af layout being transcribed.  Mirror the effect
    // by delegating to the frontier.  See HGNode base class port.
    // (Not-yet-transcribed: the semantic identity of the 24-byte
    //  block at +0x198..+0x1af on HGNode.  @Flexo 0x688127.)
    // We DO NOT invent a copy — we raise if callers ever look at
    // matte.rect198 without HGNode being ported.  The transcription
    // is complete at the asm level: rect198 is written from
    // this+0x198 unconditionally.
    // (Leaving matte.rect198 untouched is faithful only under the
    //  invariant that no downstream caller reads it before HGNode
    //  is transcribed; documented here for future ports.)
    // @0x688143..0x688162 — input 0 wiring.
    const input0 = HGRenderer_GetInput(renderer, this, 0);
    FFVAMLMatte_vslot78_setInput(matte, 0, input0);
    // @0x688165..0x68818a — input 1 wiring.
    const input1 = HGRenderer_GetInput(renderer, this, 1);
    FFVAMLMatte_vslot78_setInput(matte, 1, input1);
    // @0x68818d..0x6881f1 — recurse on matte's own inputs (SetSupportedFormatPrecisions on each).
    if (matte === null) {
      // @0x688197 — null-check on the re-fetched this->matte.
      return matte;
    }
    // @0x6881a1 — matte.SetSupportedFormatPrecisions(1).
    HGNode_SetSupportedFormatPrecisions(matte, 1);
    // @0x6881ac — N = matte.getInputCount().
    let n = FFVAMLMatte_vslot70_getInputCount(matte);
    // @0x6881af — early exit if N <= 0.
    if (n <= 0) return matte;
    // @0x6881b3..0x6881f1 — for (i=0; i<N; i++) { input = GetInput(matte, i); if (input) SSFP(input,1); }
    // The count getter IS re-fetched each iteration (@0x6881c9) — do not hoist.
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x6881d1 — input = HGRenderer::GetInput(matte, i).
      const input = HGRenderer_GetInput(renderer, matte, i);
      if (input !== null && input !== undefined) {
        // @0x6881ec — HGNode::SetSupportedFormatPrecisions(input, 1).
        HGNode_SetSupportedFormatPrecisions(input as object, 1);
      }
      // @0x6881c0 — i++.
      i = (i + 1) | 0;
      // @0x6881c9 — re-fetch N.
      n = FFVAMLMatte_vslot70_getInputCount(matte);
      // @0x6881cf — exit when i >= N.
      if (i >= n) break;
    }
    // @0x6881f3 — return this->matte.
    return matte;
  }
}
