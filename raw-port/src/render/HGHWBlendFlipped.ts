// HGHWBlendFlipped.ts — Helium HGHWBlendFlipped: the "hardware-accelerated
// legacy blend with FLIPPED-input" variant. Derives from HGHWBlend which in
// turn derives from HGLegacyBlend (both undecoded here). This TS file
// transcribes only the four exported CTor/dtor symbols on THIS class.
//
// The ctor's behavior is a straightforward derived-class initialiser:
//   1. Call base HGLegacyBlend::HGLegacyBlend() (delegates into HGHWBlend
//      via subobject layout — HGHWBlend has no explicit base ctor emitted
//      at this symbol; only HGLegacyBlend's C2 is called directly).
//   2. Temporarily install HGHWBlend's vtable (+0x10) into `this` so the
//      subsequent SetParameter virtual dispatches route through HGHWBlend.
//   3. Zero-initialise the class's own fields at offsets 0x1c0..0x220:
//        +0x1c0  16-byte block (unaligned via movups xmm0) — probably a
//                 std::string / small-buffer pair {data, size} both zeroed.
//        +0x1c8  written later in dtor: `movq %rdi, 0x1c8(%rbx)` before
//                 the ::operator delete of the +0x1c0 pointer → confirms
//                 +0x1c0 is a heap pointer and +0x1c8 is its capacity/end.
//        +0x1d0  int64 = 0
//        +0x1d8  int64 = 1  (a defaulted count / stride of 1)
//        +0x1e0  int16 = 0
//        +0x1f0  four float32 = {1.0f, 1.0f, 1.0f, 1.0f}  (from
//                 __TEXT __const @0x3c7c40 → normalized RGBA-1 default)
//        +0x200  self-pointer (`movq %rbx, 0x200(%rbx)`) — this field
//                 holds a "linked parent" that defaults to `this`, and
//                 the dtor's `cmpq %rbx, %rdi ; je …` at 0x1ab4ca checks
//                 whether an EXTERNAL owner was set; if still self, skip.
//        +0x208  int8 = 0    (bool flag)
//        +0x20c  int32 = 9   (enum / mode selector, value 9)
//        +0x210  double = 0.0078125 (= 1/128, from __const @0x3c7cb0)
//        +0x21c  int32 = 0x3F800000 (= 1.0f bit-pattern stored as raw int)
//   4. Call HGLegacyBlend::SetParameter(5,
//        HGLegacyBlend::GAMMA_DEFAULT, 0.0f, 0.0f, 0.0f).
//   5. Install FINAL vtable = HGHWBlendFlipped's (+0x10 from vtable base).
//   6. Call HGLegacyBlend::SetParameter(2, 1.0f, 0.0f, 0.0f, 0.0f).
//
// The two SetParameter calls both dispatch statically to
// __ZN13HGLegacyBlend12SetParameterEiffff (non-virtual base member).
//
// D1 (@0x1ab4b0) and D0 (@0x1ab520) share the same core sequence:
//   1. Install a `leaq 0x87aXXX(%rip)` vtable pointer at this[0]. Both
//      D1 and D0 install the SAME target (0xa25e20 = vtable for HGHWBlend
//      +0x10) — this is the vtable of the base subobject; virtual dtor
//      call chains reset back to base tables as they run.
//   2. If (+0x200 != this): call vtable slot +0x18 on that external owner
//      pointer (a virtual "detach" hook), then reset +0x200 = this.
//   3. Call HGHWBlend::DeleteStates() (member of the base, non-virtual).
//   4. If (+0x1c0 != nullptr):
//        write it into +0x1c8 (bookkeeping) then ::operator delete it.
//   5. Tail-call HGLegacyBlend::~HGLegacyBlend() (base D2). D0 additionally
//      then tail-calls HGObject::operator delete(this).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Helium.HGHWBlendFlipped.HGHWBlendFlipped.s.
//
// Undecoded frontier (each is a THROWing stub citing its callee addr):
//   HGLegacyBlend::HGLegacyBlend()   @Helium __ZN13HGLegacyBlendC2Ev
//                                    (called from ctor @0x1ab38d)
//   HGLegacyBlend::SetParameter(i,f,f,f,f) @Helium
//                                    __ZN13HGLegacyBlend12SetParameterEiffff
//                                    (called from ctor @0x1ab428 and @0x1ab454)
//   HGLegacyBlend::GAMMA_DEFAULT     @Helium __ZN13HGLegacyBlend13GAMMA_DEFAULTE
//                                    S-symbol @0x7dfd00 (float32; value
//                                    intentionally NOT decoded here — the
//                                    ctor reads it live via movss (%rax))
//   HGLegacyBlend::~HGLegacyBlend()  @Helium __ZN13HGLegacyBlendD2Ev
//                                    (tail-called from D1 @0x1ab505 and
//                                    directly from D0 @0x1ab56f)
//   HGHWBlend::DeleteStates()        @Helium __ZN9HGHWBlend12DeleteStatesEv
//                                    (called from D1 @0x1ab4df and D0 @0x1ab54f)
//   ::operator delete(void*)         @Helium __ZdlPv stub @0x3c4fa0
//                                    (called from D1 @0x1ab4f7 and D0 @0x1ab567)
//   HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv
//                                    (tail-called from D0 @0x1ab57d)
//   virtual detach slot +0x18 on the object at +0x200 — called from D1
//                                    @0x1ab4d2 and D0 @0x1ab542. Its class
//                                    is undecoded (any HGObject descendant).
//   vtable for HGHWBlend             @Helium __ZTV9HGHWBlend (base +0x10 =
//                                    0xa25e30) — used by the ctor's first
//                                    vtable install @0x1ab399 and both
//                                    dtor first-instruction installs.
//   vtable for HGHWBlendFlipped      @Helium __ZTV16HGHWBlendFlipped
//                                    (base +0x10) — used by ctor's second
//                                    vtable install @0x1ab438.
//
// Numerics: fields at +0x1f0..+0x1fc are four float32 held as an
// Int32Array(4) of raw f32 bit-patterns. +0x210 is a JS `number` (IEEE
// double) — the disasm uses movsd, so the field genuinely IS 8 bytes.
// +0x21c is stored as an INT (movl $0x3f800000) but the bit pattern is
// 1.0f — kept as an integer field to mirror the asm's integer-store.

/** HGLegacyBlend — undecoded base class. Layout not modeled here. */
interface HGLegacyBlend {}

/** HGHWBlend — undecoded intermediate base class. */
interface HGHWBlend extends HGLegacyBlend {}

/** HGLegacyBlend::HGLegacyBlend() — base ctor @Helium __ZN13HGLegacyBlendC2Ev,
 *  called from HGHWBlendFlipped's C2 @0x1ab38d. Not yet transcribed. */
function HGLegacyBlend_ctor(_self: HGHWBlendFlipped): void {
  throw new Error(
    "HGLegacyBlend::HGLegacyBlend @Helium __ZN13HGLegacyBlendC2Ev @0x1ab38d not yet transcribed",
  );
}

/** HGLegacyBlend::SetParameter(int, float, float, float, float) — base member
 *  called by C2 twice: @0x1ab428 (idx=5, f0=GAMMA_DEFAULT, f1=f2=f3=0) and
 *  @0x1ab454 (idx=2, f0=1.0f, f1=f2=f3=0). Not yet transcribed. */
function HGLegacyBlend_SetParameter(
  _self: HGHWBlendFlipped, _idx: number, _a: number, _b: number, _c: number, _d: number,
): void {
  throw new Error(
    "HGLegacyBlend::SetParameter @Helium __ZN13HGLegacyBlend12SetParameterEiffff @0x1ab428/0x1ab454 not yet transcribed",
  );
}

/** HGLegacyBlend::GAMMA_DEFAULT — float32 data-symbol @Helium
 *  __ZN13HGLegacyBlend13GAMMA_DEFAULTE (nm S @0x7dfd00). Loaded via
 *  `movss (%rax), %xmm0` in C2 @0x1ab413. Its concrete value is set by
 *  HGLegacyBlend's static initialiser (not decoded here). */
function HGLegacyBlend_GAMMA_DEFAULT(): number {
  throw new Error(
    "HGLegacyBlend::GAMMA_DEFAULT @Helium __ZN13HGLegacyBlend13GAMMA_DEFAULTE static (nm S @0x7dfd00) not yet transcribed",
  );
}

/** HGLegacyBlend::~HGLegacyBlend() — base dtor @Helium
 *  __ZN13HGLegacyBlendD2Ev, tail-called from D1 @0x1ab505 / D0 @0x1ab56f. */
function HGLegacyBlend_dtor(_self: HGHWBlendFlipped): void {
  throw new Error(
    "HGLegacyBlend::~HGLegacyBlend @Helium __ZN13HGLegacyBlendD2Ev @0x1ab505/@0x1ab56f not yet transcribed",
  );
}

/** HGHWBlend::DeleteStates() — non-virtual base member @Helium
 *  __ZN9HGHWBlend12DeleteStatesEv, called from D1 @0x1ab4df and D0 @0x1ab54f. */
function HGHWBlend_DeleteStates(_self: HGHWBlendFlipped): void {
  throw new Error(
    "HGHWBlend::DeleteStates @Helium __ZN9HGHWBlend12DeleteStatesEv @0x1ab4df/@0x1ab54f not yet transcribed",
  );
}

/** ::operator delete(void*) — Helium __ZdlPv stub @0x3c4fa0.
 *  Called from D1 @0x1ab4f7 / D0 @0x1ab567. */
function HGHWBlendFlipped_operatorDelete(_p: unknown): void {
  throw new Error(
    "::operator delete(void*) @Helium __ZdlPv stub @0x3c4fa0 (from HGHWBlendFlipped::~D1 @0x1ab4f7 / D0 @0x1ab567) not yet transcribed",
  );
}

/** HGObject::operator delete(void*) — Helium __ZN8HGObjectdlEPv, tail-called
 *  from D0 @0x1ab57d (the deleting-dtor tail). Not yet transcribed. */
function HGObject_operatorDelete(_p: HGHWBlendFlipped): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x1ab57d not yet transcribed",
  );
}

/** Virtual detach at vtable slot +0x18 on the object stored at +0x200.
 *  Called from D1 @0x1ab4d2 and D0 @0x1ab542, ONLY when +0x200 != this. */
function HGHWBlendFlipped_ownerDetachSlot18(_owner: unknown): void {
  throw new Error(
    "HGHWBlendFlipped owner (+0x200) virtual slot +0x18 @Helium (D1 @0x1ab4d2 / D0 @0x1ab542) not yet transcribed",
  );
}

/**
 * HGHWBlendFlipped — legacy-blend HW node with FLIPPED input order.
 *
 * The concrete instance state carried by THIS class layer (above whatever
 * HGLegacyBlend/HGHWBlend contribute at lower offsets):
 */
export class HGHWBlendFlipped {
  /** +0x00 vtable slot (installed twice by C2). Modeled as an opaque tag. */
  vtable: "HGHWBlend+0x10" | "HGHWBlendFlipped+0x10" = "HGHWBlend+0x10";
  /** +0x1c0 heap-owned buffer pointer (unknown element type; std::string-
   *  style small-buffer pair). Zero-inited by C2's `movups xmm0, 0x1c0`. */
  f_1c0: unknown = null;
  /** +0x1c8 length/capacity of +0x1c0 — dtor writes the ptr into this slot
   *  right before the free (looks like a `size = data` trick). Zero-inited. */
  f_1c8: bigint = 0n;
  /** +0x1d0 int64 = 0 (movq $0). */
  f_1d0: bigint = 0n;
  /** +0x1d8 int64 = 1 (movq $1). */
  f_1d8: bigint = 1n;
  /** +0x1e0 int16 = 0 (movw $0). */
  f_1e0: number = 0;
  /** +0x1f0 four f32 = {1.0, 1.0, 1.0, 1.0}. movaps loads 16B from
   *  __TEXT __const @0x3c7c40 (raw u64 pair 0x3f8000003f800000 = two 1.0f
   *  per half). Held as an Int32Array of raw f32 bit-patterns. */
  f_1f0: Int32Array = (() => {
    const a = new Int32Array(4);
    a[0] = 0x3f800000 | 0;
    a[1] = 0x3f800000 | 0;
    a[2] = 0x3f800000 | 0;
    a[3] = 0x3f800000 | 0;
    return a;
  })();
  /** +0x200 owner/parent pointer (initialised to `this` by C2's
   *  `movq %rbx, 0x200(%rbx)`). Dtors compare against `this` and skip
   *  the virtual-detach call if unchanged. */
  f_200: unknown = null;
  /** +0x208 int8 flag = 0. */
  f_208: number = 0;
  /** +0x20c int32 = 9. */
  f_20c: number = 9;
  /** +0x210 double = 0.0078125 (movsd loads 8B from @0x3c7cb0 which is
   *  raw u64 0x3f8000000000000000 → IEEE-754 double = 2^-7 = 1/128). */
  f_210: number = 0.0078125;
  /** +0x21c int32 = 0x3F800000 stored as INT (movl of an f32 bit-pattern).
   *  Kept as an int to mirror the exact asm semantics. */
  f_21c: number = 0x3F800000 | 0;

  /**
   * HGHWBlendFlipped::HGHWBlendFlipped() [C2 base-object ctor] @0x1ab380.
   *
   * The C1 complete-object variant @0x1ab4a0 is a `pushq %rbp ; movq
   * %rsp,%rbp ; popq %rbp ; jmp C2` thunk — collapsed here.
   *
   *   @0x1ab380 pushq %rbp ; movq %rsp, %rbp ; pushq %r15, %r14, %rbx, %rax
   *   @0x1ab38a movq  %rdi, %rbx                          ; rbx = this
   *   @0x1ab38d callq HGLegacyBlend::HGLegacyBlend()      ; base ctor
   *   @0x1ab392 leaq  0x87aa87(%rip), %rax                ; → vtable HGHWBlend +0x10 (=0xa25e30)
   *   @0x1ab399 movq  %rax, (%rbx)                        ; install intermediate vtable
   *   @0x1ab39c leaq  0x1c0(%rbx), %r15                   ; r15 = &this->f_1c0
   *   @0x1ab3a3 xorps %xmm0, %xmm0
   *   @0x1ab3a6 movups %xmm0, 0x1c0(%rbx)                 ; clear f_1c0..f_1c8 (16B)
   *   @0x1ab3ad movq  $0x0, 0x1d0(%rbx)                   ; f_1d0 = 0
   *   @0x1ab3b8 movq  $0x1, 0x1d8(%rbx)                   ; f_1d8 = 1
   *   @0x1ab3c3 movw  $0x0, 0x1e0(%rbx)                   ; f_1e0 = 0
   *   @0x1ab3cc movaps 0x21c86d(%rip), %xmm0              ; xmm0 = 16B from @0x3c7c40 = {1.0f,1.0f,1.0f,1.0f}
   *   @0x1ab3d3 movaps %xmm0, 0x1f0(%rbx)                 ; f_1f0[0..4] = 1.0f each
   *   @0x1ab3da movq  %rbx, 0x200(%rbx)                   ; f_200 = this  (self-parent)
   *   @0x1ab3e1 movb  $0x0, 0x208(%rbx)                   ; f_208 = 0
   *   @0x1ab3e8 movl  $0x9, 0x20c(%rbx)                   ; f_20c = 9
   *   @0x1ab3f2 movsd 0x21c8b6(%rip), %xmm0               ; xmm0 = 8B double from @0x3c7cb0 = 0.0078125
   *   @0x1ab3fa movsd %xmm0, 0x210(%rbx)                  ; f_210 = 0.0078125
   *   @0x1ab402 movl  $0x3f800000, 0x21c(%rbx)            ; f_21c = 0x3F800000 (=1.0f bits)
   *   @0x1ab40c leaq  HGLegacyBlend::GAMMA_DEFAULT(%rip), %rax
   *   @0x1ab413 movss (%rax), %xmm0                       ; xmm0 = f32 GAMMA_DEFAULT
   *   @0x1ab417 xorps %xmm1, %xmm1 / xmm2 / xmm3          ; = 0.0f each
   *   @0x1ab420 movq  %rbx, %rdi                          ; rdi = this
   *   @0x1ab423 movl  $0x5, %esi                          ; idx = 5
   *   @0x1ab428 callq HGLegacyBlend::SetParameter(this,5,GAMMA_DEFAULT,0,0,0)
   *   @0x1ab42d leaq  __ZTV16HGHWBlendFlipped(%rip), %rax ; final vtable
   *   @0x1ab434 addq  $0x10, %rax
   *   @0x1ab438 movq  %rax, (%rbx)                        ; install final vtable
   *   @0x1ab43b movss 0x21c87d(%rip), %xmm0               ; xmm0 = f32 from @0x3c7cc0 = 1.0f
   *   @0x1ab443 xorps %xmm1, %xmm1 / xmm2 / xmm3
   *   @0x1ab44c movq  %rbx, %rdi
   *   @0x1ab44f movl  $0x2, %esi                          ; idx = 2
   *   @0x1ab454 callq HGLegacyBlend::SetParameter(this,2,1.0f,0,0,0)
   *   @0x1ab459 addq  $0x8, %rsp ; popq %rbx,r14,r15,rbp ; retq
   *
   * The tail at @0x1ab464 is a landing-pad that runs ~HGHWBlend and
   * ~HGLegacyBlend before rethrowing (via __Unwind_Resume) — not part
   * of the normal-return control flow, so not modeled in JS.
   */
  constructor() {
    // @0x1ab38d  base ctor (HGLegacyBlend chains up into HGHWBlend / HGObject).
    HGLegacyBlend_ctor(this);
    // @0x1ab399  install intermediate vtable = vtable for HGHWBlend +0x10.
    this.vtable = "HGHWBlend+0x10";
    // Field zero-init sequence (already handled by class-field initialisers
    // above, but written explicitly here to mirror asm order + provenance).
    this.f_1c0 = null;                 // @0x1ab3a6 movups xmm0, 0x1c0
    this.f_1c8 = 0n;                   // @0x1ab3a6 same 16B store
    this.f_1d0 = 0n;                   // @0x1ab3ad movq $0, 0x1d0
    this.f_1d8 = 1n;                   // @0x1ab3b8 movq $1, 0x1d8
    this.f_1e0 = 0;                    // @0x1ab3c3 movw $0, 0x1e0
    // @0x1ab3cc/@0x1ab3d3  four f32 = 1.0f (raw bits 0x3f800000) from @0x3c7c40
    const ones = new Int32Array(4);
    ones[0] = 0x3f800000 | 0;
    ones[1] = 0x3f800000 | 0;
    ones[2] = 0x3f800000 | 0;
    ones[3] = 0x3f800000 | 0;
    this.f_1f0 = ones;
    // @0x1ab3da  f_200 = this (self-owner sentinel)
    this.f_200 = this;
    this.f_208 = 0;                    // @0x1ab3e1
    this.f_20c = 9 | 0;                // @0x1ab3e8
    this.f_210 = 0.0078125;            // @0x1ab3f2/@0x1ab3fa (from @0x3c7cb0)
    this.f_21c = 0x3F800000 | 0;       // @0x1ab402
    // @0x1ab40c..@0x1ab428  SetParameter(this, 5, GAMMA_DEFAULT, 0, 0, 0)
    const gammaDefault = Math.fround(HGLegacyBlend_GAMMA_DEFAULT());
    HGLegacyBlend_SetParameter(this, 5 | 0, gammaDefault, Math.fround(0.0), Math.fround(0.0), Math.fround(0.0));
    // @0x1ab42d..@0x1ab438  install FINAL vtable = HGHWBlendFlipped +0x10
    this.vtable = "HGHWBlendFlipped+0x10";
    // @0x1ab43b..@0x1ab454  SetParameter(this, 2, 1.0f, 0, 0, 0)
    HGLegacyBlend_SetParameter(this, 2 | 0, Math.fround(1.0), Math.fround(0.0), Math.fround(0.0), Math.fround(0.0));
  }

  /**
   * HGHWBlendFlipped::~HGHWBlendFlipped() [D1] @0x1ab4b0.
   *
   *   @0x1ab4b0 push rbp ; mov rsp,rbp ; push rbx ; push rax
   *   @0x1ab4b6 movq  %rdi, %rbx
   *   @0x1ab4b9 leaq  0x87a960(%rip), %rax     ; → 0xa25e20 = vtable HGHWBlend +0x10
   *   @0x1ab4c0 movq  %rax, (%rdi)             ; reinstall base vtable
   *   @0x1ab4c3 movq  0x200(%rdi), %rdi        ; rdi = this->f_200
   *   @0x1ab4ca cmpq  %rbx, %rdi
   *   @0x1ab4cd je    0x1ab4dc                 ; if (f_200 == this) skip detach
   *   @0x1ab4cf movq  (%rdi), %rax             ; rax = *f_200 vtable
   *   @0x1ab4d2 callq *0x18(%rax)              ; f_200->virtualSlot18(f_200)
   *   @0x1ab4d5 movq  %rbx, 0x200(%rbx)        ; f_200 = this  (reset)
   *   @0x1ab4dc movq  %rbx, %rdi
   *   @0x1ab4df callq HGHWBlend::DeleteStates()
   *   @0x1ab4e4 movq  0x1c0(%rbx), %rdi        ; rdi = this->f_1c0
   *   @0x1ab4eb testq %rdi, %rdi
   *   @0x1ab4ee je    0x1ab4fc                 ; skip if null
   *   @0x1ab4f0 movq  %rdi, 0x1c8(%rbx)        ; f_1c8 = f_1c0  (pre-free bookkeeping)
   *   @0x1ab4f7 callq ::operator delete(f_1c0)
   *   @0x1ab4fc movq  %rbx, %rdi
   *   @0x1ab4ff addq  $0x8, %rsp ; popq %rbx ; popq %rbp
   *   @0x1ab505 jmp   HGLegacyBlend::~HGLegacyBlend()   ; tail
   */
  destroy(): void {
    // @0x1ab4c0  reinstall base vtable.
    this.vtable = "HGHWBlend+0x10";
    // @0x1ab4c3..@0x1ab4d5  detach external owner if any.
    if (this.f_200 !== this) {
      HGHWBlendFlipped_ownerDetachSlot18(this.f_200);
      this.f_200 = this;
    }
    // @0x1ab4df
    HGHWBlend_DeleteStates(this);
    // @0x1ab4e4..@0x1ab4f7
    if (this.f_1c0 !== null) {
      // @0x1ab4f0  f_1c8 = (bit-pattern-of-ptr) — no JS-visible effect.
      HGHWBlendFlipped_operatorDelete(this.f_1c0);
      this.f_1c0 = null;
    }
    // @0x1ab505  tail: base D2.
    HGLegacyBlend_dtor(this);
  }

  /**
   * HGHWBlendFlipped::~HGHWBlendFlipped() [D0 deleting-dtor] @0x1ab520.
   * Body is bit-identical to D1 (same field cleanup sequence, same vtable
   * reinstall), differing only in the tail: instead of `jmp base D2`, D0
   * does a direct `callq base D2` followed by a tail-`jmp HGObject::operator
   * delete`.
   *
   *   @0x1ab520 push rbp ; mov rsp,rbp ; push rbx ; push rax
   *   @0x1ab526 movq %rdi, %rbx
   *   @0x1ab529 leaq 0x87a8f0(%rip), %rax  ; → 0xa25e20 (same base vtable)
   *   @0x1ab530 movq %rax, (%rdi)
   *   @0x1ab533..@0x1ab545  same owner-detach block
   *   @0x1ab54c..@0x1ab567  same DeleteStates + ::operator delete(f_1c0)
   *   @0x1ab56c movq %rbx, %rdi
   *   @0x1ab56f callq HGLegacyBlend::~HGLegacyBlend()
   *   @0x1ab574 movq %rbx, %rdi
   *   @0x1ab577 addq $0x8, %rsp ; popq %rbx ; popq %rbp
   *   @0x1ab57d jmp  HGObject::operator delete(this)
   */
  destroyAndDelete(): void {
    // @0x1ab530  reinstall base vtable.
    this.vtable = "HGHWBlend+0x10";
    // @0x1ab533..@0x1ab545  detach external owner if any.
    if (this.f_200 !== this) {
      HGHWBlendFlipped_ownerDetachSlot18(this.f_200);
      this.f_200 = this;
    }
    // @0x1ab54f
    HGHWBlend_DeleteStates(this);
    // @0x1ab554..@0x1ab567
    if (this.f_1c0 !== null) {
      HGHWBlendFlipped_operatorDelete(this.f_1c0);
      this.f_1c0 = null;
    }
    // @0x1ab56f  base D2 (call, not tail-jmp).
    HGLegacyBlend_dtor(this);
    // @0x1ab57d  tail-jmp HGObject::operator delete(this).
    HGObject_operatorDelete(this);
  }
}
