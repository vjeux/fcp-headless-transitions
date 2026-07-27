// OZCurveEnum — enum-valued OZCurve subclass. Flexo framework.
//
// Symbols exposed by nm on Flexo (x86_64):
//   __ZN11OZCurveEnumD1Ev                     @0x220160  OZCurveEnum::~OZCurveEnum() (base, non-deleting)
//   __ZN11OZCurveEnumD0Ev                     @0x220170  OZCurveEnum::~OZCurveEnum() (deleting)
//   __ZN11OZCurveEnum19getCurveWorkingCopyEv  @0x2201a0  OZCurveEnum::getCurveWorkingCopy()
//   __ZN11OZCurveEnum10cloneCurveEv           @0x2201f0  OZCurveEnum::cloneCurve()
//
// No ctor symbol is emitted for OZCurveEnum in Flexo — instances are produced solely by the
// `operator new(0xB0)` + base copy-ctor path used in cloneCurve/getCurveWorkingCopy. The
// class adds NO fields: sizeof(OZCurveEnum) = 0xB0 bytes, identical to sizeof(OZCurve).
//
// Struct layout (recovered from the two allocation sites `movl $0xb0,%edi ; callq __Znwm`
// @0x2201aa/0x2201fa and the `movq %rax,(%rbx)` vtable-install stores @0x2201d2/0x22021f):
//   sizeof(OZCurveEnum) = 0xB0 bytes.
//   this+0x00 = vtable slot (installed as &__ZTV11OZCurveEnum + 0x10)
//   this+0x08.. = OZCurve base subobject (all other fields).
// OZCurveEnum adds no additional data members; it overrides only the virtual methods below.
//
// Vtable: __ZTV11OZCurveEnum @Flexo — referenced via `leaq __ZTV11OZCurveEnum(%rip),%rax ;
// addq $0x10,%rax` @0x2201c7/0x2201ce and @0x220214/0x22021b. The installed vptr is
// `&vtable + 0x10` (skips the Itanium ABI offset-to-top + typeinfo* header, points at the
// first virtual slot). Vtable body itself is not decoded.
//
// Base callees (frontier — not yet transcribed elsewhere in the port):
//   __ZN7OZCurveC2ERKS_b    OZCurve::OZCurve(OZCurve const&, bool)  @Flexo stub 0x1496c84
//   __ZN7OZCurveD2Ev        OZCurve::~OZCurve()                      @Flexo stub 0x1496c90
//   __Znwm                  operator new(size_t)                     @Flexo stub 0x1497452
//   __ZdlPv                 operator delete(void*)                   @Flexo stub 0x1497404
//   __Unwind_Resume                                                   @Flexo stub 0x1495d30

/**
 * OZCurve base copy-constructor with a "working-copy" bool flag.
 *
 * FRONTIER: __ZN7OZCurveC2ERKS_b @Flexo — not yet transcribed. Both OZCurveEnum
 * `getCurveWorkingCopy` (@0x2201c2) and `cloneCurve` (@0x22020f) delegate here after
 * allocating a fresh 0xB0-byte instance via `operator new`. The bool argument (edx)
 * selects working-copy semantics (edx=1) vs plain-clone semantics (edx=0); the
 * difference is encoded in the base ctor, not in OZCurveEnum.
 */
function ozCurveCopyCtor(_dest: OZCurveEnum, _src: OZCurveEnum, _workingCopy: boolean): void {
  throw new Error(
    "OZCurve::OZCurve(OZCurve const&, bool) @Flexo 0x1496c84 (stub __ZN7OZCurveC2ERKS_b; call sites @0x2201c2 @0x22020f) not yet transcribed",
  );
}

/**
 * OZCurve base destructor.
 *
 * FRONTIER: __ZN7OZCurveD2Ev @Flexo — not yet transcribed. Both OZCurveEnum destructor
 * variants delegate here: `~D1` @0x220160 tail-jumps to it; `~D0` @0x220170 calls it and
 * then tail-jumps to `operator delete`.
 */
function ozCurveDtor(_self: OZCurveEnum): void {
  throw new Error(
    "OZCurve::~OZCurve() @Flexo 0x1496c90 (stub __ZN7OZCurveD2Ev; call sites @0x220165 @0x220179) not yet transcribed",
  );
}

/**
 * OZCurveEnum — enum-valued keyframe curve. Pure-vtable subclass of OZCurve; adds no
 * data members. Overrides `cloneCurve` and `getCurveWorkingCopy` to produce a copy that
 * is itself an OZCurveEnum (so the returned vtable is __ZTV11OZCurveEnum + 0x10 rather
 * than the base's vtable).
 */
export class OZCurveEnum {
  // (deliberately empty: 0xB0-byte OZCurve base subobject is the entire storage.)

  /**
   * Base-object destructor.  @Flexo 0x220160  (__ZN11OZCurveEnumD1Ev)
   *
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp   0x1496c90    ## symbol stub for: __ZN7OZCurveD2Ev
   *
   * Tail-call to the base destructor — nothing else. No OZCurveEnum-specific cleanup
   * because OZCurveEnum owns no additional resources.
   */
  destroyBase(): void {
    // @0x220165: jmp __ZN7OZCurveD2Ev
    ozCurveDtor(this);
  }

  /**
   * Deleting destructor.  @Flexo 0x220170  (__ZN11OZCurveEnumD0Ev)
   *
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi,%rbx                        ; rbx = this
   *   callq 0x1496c90    ## symbol stub for: __ZN7OZCurveD2Ev
   *   movq  %rbx,%rdi
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp
   *   jmp   0x1497404    ## symbol stub for: __ZdlPv          (operator delete)
   *
   * Base destructor then `operator delete(this)`. In TS this is degenerate: we call
   * the base dtor and rely on the GC for storage reclamation.
   */
  destroyAndDelete(): void {
    // @0x220179: callq __ZN7OZCurveD2Ev
    ozCurveDtor(this);
    // @0x220187: jmp __ZdlPv (operator delete) — no TS equivalent; the GC reclaims.
  }

  /**
   * getCurveWorkingCopy — return a copy with the "working copy" flag set.
   *  @Flexo 0x2201a0  (__ZN11OZCurveEnum19getCurveWorkingCopyEv)
   *
   *   00 pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   07 movq  %rdi,%r14                        ; r14 = this
   *   0a movl  $0xb0,%edi                       ; edi = sizeof(OZCurveEnum) = 176
   *   0f callq __Znwm                           ; rax = operator new(0xB0)
   *   14 movq  %rax,%rbx                        ; rbx = new object
   *   17 movq  %rax,%rdi                        ; arg0 = new object
   *   1a movq  %r14,%rsi                        ; arg1 = this  (source)
   *   1d movl  $0x1,%edx                        ; arg2 = true  (working-copy)
   *   22 callq __ZN7OZCurveC2ERKS_b             ; OZCurve::OZCurve(new,*this,true)
   *   27 leaq  __ZTV11OZCurveEnum(%rip),%rax    ; install OZCurveEnum vtable
   *   2e addq  $0x10,%rax                       ; skip typeinfo slots (Itanium ABI)
   *   32 movq  %rax,(%rbx)                      ; new->vptr = &vtable[2]
   *   35 movq  %rbx,%rax                        ; return rbx
   *   38..3c epilogue ; retq
   *   3d..4b landing pad @0x2201dd..0x2201eb:
   *          operator delete(new) then _Unwind_Resume(exc)
   */
  getCurveWorkingCopy(): OZCurveEnum {
    // movl $0xb0,%edi ; callq __Znwm @0x2201aa..0x2201af  -> new object with OZCurveEnum layout.
    const copy = new OZCurveEnum();
    try {
      // callq __ZN7OZCurveC2ERKS_b(copy, this, /*workingCopy=*/true) @0x2201c2 (edx=1 @0x2201bd)
      ozCurveCopyCtor(copy, this, true);
    } catch (e) {
      // landing pad @0x2201dd..0x2201eb: operator delete(copy); _Unwind_Resume(exc)
      // (no-op in GC; propagate the exception)
      throw e;
    }
    // leaq __ZTV11OZCurveEnum(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rbx)
    // @0x2201c7..0x2201d2. In TS the class identity IS the vtable install — `new
    // OZCurveEnum()` already produces an object whose runtime type is OZCurveEnum.
    return copy;
  }

  /**
   * cloneCurve — return a plain copy (not a working copy).
   *  @Flexo 0x2201f0  (__ZN11OZCurveEnum10cloneCurveEv)
   *
   *   Identical body to getCurveWorkingCopy EXCEPT `xorl %edx,%edx` @0x22020d — i.e.
   *   the bool argument to __ZN7OZCurveC2ERKS_b is FALSE instead of TRUE.
   *
   *   00 pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   07 movq  %rdi,%r14                        ; r14 = this
   *   0a movl  $0xb0,%edi
   *   0f callq __Znwm                           ; rax = operator new(0xB0)
   *   14 movq  %rax,%rbx
   *   17 movq  %rax,%rdi                        ; arg0 = new
   *   1a movq  %r14,%rsi                        ; arg1 = this
   *   1d xorl  %edx,%edx                        ; arg2 = false
   *   1f callq __ZN7OZCurveC2ERKS_b             ; OZCurve::OZCurve(new,*this,false)
   *   24 leaq  __ZTV11OZCurveEnum(%rip),%rax
   *   2b addq  $0x10,%rax
   *   2f movq  %rax,(%rbx)                      ; install vtable
   *   32 movq  %rbx,%rax                        ; return
   *   35..39 epilogue ; retq
   *   3a..48 landing pad @0x22022a..0x220238: operator delete + _Unwind_Resume
   */
  cloneCurve(): OZCurveEnum {
    // movl $0xb0,%edi ; callq __Znwm @0x2201fa..0x2201ff
    const copy = new OZCurveEnum();
    try {
      // xorl %edx,%edx @0x22020d ; callq __ZN7OZCurveC2ERKS_b @0x22020f
      ozCurveCopyCtor(copy, this, false);
    } catch (e) {
      // landing pad @0x22022a..0x220238: operator delete(copy); _Unwind_Resume(exc)
      throw e;
    }
    // leaq __ZTV11OZCurveEnum(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rbx)
    // @0x220214..0x22021f.
    return copy;
  }
}
