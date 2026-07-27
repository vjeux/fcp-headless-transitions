// OZCurveAngle — angle-valued OZCurve subclass. Ozone.framework.
//
// Symbols exposed by nm on Ozone (x86_64):
//   __ZN12OZCurveAngle19getCurveWorkingCopyEv  @0xac2b0  OZCurveAngle::getCurveWorkingCopy()
//   __ZN12OZCurveAngleD0Ev                     @0xac290  OZCurveAngle::~OZCurveAngle() (deleting)
//   __ZN12OZCurveAngleD1Ev                     @0xac280  OZCurveAngle::~OZCurveAngle() (base)
//   __ZN12OZCurveAngle10cloneCurveEv           @0xac300  OZCurveAngle::cloneCurve()
//
// Struct layout (recovered from cloneCurve/getCurveWorkingCopy allocation size & the base
// __ZN7OZCurveC2ERKS_b copy-ctor call, plus the OZChannelAngle::createOZChannelAngleCurve(double)
// factory @0xac100 which allocates the same 0xB0 bytes and calls __ZN7OZCurveC2Edddd):
//   sizeof(OZCurveAngle) = 0xB0 bytes  — identical to sizeof(OZCurve).
//   Layout:                             this+0x00 = vtable slot (installed as &OZCurveAngle::vtable+0x10)
//                                       this+0x08.. = OZCurve base subobject (all other fields).
//   OZCurveAngle adds NO additional data members; it overrides only the virtual methods below.
//
// Vtable (__ZTV12OZCurveAngle @Ozone) — the two methods that appear as symbols are the
// per-class overrides installed on top of OZCurve's vtable.
//
// Base callees (currently frontier — not yet transcribed elsewhere in the port):
//   __ZN7OZCurveC2ERKS_b    OZCurve::OZCurve(OZCurve const&, bool)
//   __ZN7OZCurveD2Ev        OZCurve::~OZCurve()
//   __Znwm                  operator new(size_t)
//   __ZdlPv                 operator delete(void*)

/**
 * OZCurve base copy-constructor with a "working-copy" bool flag.
 *
 * FRONTIER: __ZN7OZCurveC2ERKS_b @Ozone — not yet transcribed. Both OZCurveAngle
 * `cloneCurve` (@0xac31f) and `getCurveWorkingCopy` (@0xac2d2) delegate here after
 * allocating a fresh 0xB0-byte instance via `operator new`. The bool argument (edx)
 * selects clone semantics (edx=0) vs working-copy semantics (edx=1); the difference
 * is encoded in the base ctor, not in OZCurveAngle.
 */
function ozCurveCopyCtor(_dest: OZCurveAngle, _src: OZCurveAngle, _workingCopy: boolean): void {
  throw new Error(
    "OZCurve::OZCurve(OZCurve const&, bool) @Ozone 0x6dec10 (stub __ZN7OZCurveC2ERKS_b) not yet transcribed",
  );
}

/**
 * OZCurve base destructor.
 *
 * FRONTIER: __ZN7OZCurveD2Ev @Ozone — not yet transcribed. Both OZCurveAngle
 * destructor variants delegate here: `~D1` @0xac280 tail-jumps to it; `~D0` @0xac290
 * calls it then tail-jumps to `operator delete`.
 */
function ozCurveDtor(_self: OZCurveAngle): void {
  throw new Error("OZCurve::~OZCurve() @Ozone 0x6dec1c (stub __ZN7OZCurveD2Ev) not yet transcribed");
}

/**
 * OZCurveAngle — angle-valued keyframe curve. Pure-vtable subclass of OZCurve; adds
 * no data members. Overrides `cloneCurve` and `getCurveWorkingCopy` to produce a
 * copy that is itself an OZCurveAngle (so the returned vtable is
 * __ZTV12OZCurveAngle + 0x10 rather than the base's vtable).
 */
export class OZCurveAngle {
  // (deliberately empty: 0xB0-byte OZCurve base subobject is the entire storage.)

  /**
   * Base-object destructor.  @Ozone 0xac280  (__ZN12OZCurveAngleD1Ev)
   *
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp   0x6dec1c    ## symbol stub for: __ZN7OZCurveD2Ev
   *
   * Tail-call to the base destructor — nothing else. No OZCurveAngle-specific
   * cleanup because OZCurveAngle owns no additional resources.
   */
  destroyBase(): void {
    ozCurveDtor(this);
  }

  /**
   * Deleting destructor.  @Ozone 0xac290  (__ZN12OZCurveAngleD0Ev)
   *
   *   callq 0x6dec1c    ## symbol stub for: __ZN7OZCurveD2Ev
   *   jmp   0x6dfc36    ## symbol stub for: __ZdlPv          (operator delete)
   *
   * Base destructor then `operator delete(this)`. In TS this is degenerate:
   * we call the base dtor and rely on the GC for storage reclamation.
   */
  destroyAndDelete(): void {
    ozCurveDtor(this);
    // operator delete(this) — no-op under GC.
  }

  /**
   * getCurveWorkingCopy — return a copy with the "working copy" flag set.
   *  @Ozone 0xac2b0  (__ZN12OZCurveAngle19getCurveWorkingCopyEv)
   *
   *   00 pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   07 movq  %rdi,%r14                        ; r14 = this
   *   0a movl  $0xb0,%edi                       ; edi = sizeof(OZCurveAngle) = 176
   *   0f callq __Znwm                           ; rax = operator new(0xB0)
   *   14 movq  %rax,%rbx                        ; rbx = new object
   *   17 movq  %rax,%rdi                        ; arg0 = new object
   *   1a movq  %r14,%rsi                        ; arg1 = this  (source)
   *   1d movl  $0x1,%edx                        ; arg2 = true  (working-copy)
   *   22 callq __ZN7OZCurveC2ERKS_b             ; OZCurve::OZCurve(new,*this,true)
   *   27 leaq  __ZTV12OZCurveAngle(%rip),%rax   ; install OZCurveAngle vtable
   *   2e addq  $0x10,%rax                       ; skip typeinfo slots (Itanium ABI)
   *   32 movq  %rax,(%rbx)                      ; new->vptr = &vtable[2]
   *   35 movq  %rbx,%rax                        ; return rbx
   *   38..3d epilogue ; retq
   *   3a..48 landing pad: operator delete(new) then Unwind_Resume
   */
  getCurveWorkingCopy(): OZCurveAngle {
    // movl $0xb0,%edi ; callq __Znwm  -> new object with OZCurveAngle layout.
    const copy = new OZCurveAngle();
    try {
      // callq __ZN7OZCurveC2ERKS_b(copy, this, /*workingCopy=*/true)
      ozCurveCopyCtor(copy, this, true);
    } catch (e) {
      // landing pad @0xac2ed..0xac2fb: operator delete(copy); _Unwind_Resume(exc)
      // (no-op in GC; propagate the exception)
      throw e;
    }
    // leaq __ZTV12OZCurveAngle(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rbx)
    // In TS the class identity IS the vtable install — `new OZCurveAngle()` already
    // produces an object whose runtime type is OZCurveAngle.
    return copy;
  }

  /**
   * cloneCurve — return a plain copy (not a working copy).
   *  @Ozone 0xac300  (__ZN12OZCurveAngle10cloneCurveEv)
   *
   *   Identical body to getCurveWorkingCopy EXCEPT `xorl %edx,%edx` — i.e. the
   *   bool argument to __ZN7OZCurveC2ERKS_b is FALSE instead of TRUE.
   */
  cloneCurve(): OZCurveAngle {
    // movl $0xb0,%edi ; callq __Znwm
    const copy = new OZCurveAngle();
    try {
      // xorl %edx,%edx ; callq __ZN7OZCurveC2ERKS_b(copy, this, /*workingCopy=*/false)
      ozCurveCopyCtor(copy, this, false);
    } catch (e) {
      // landing pad @0xac33a..0xac348: operator delete(copy); _Unwind_Resume(exc)
      throw e;
    }
    // leaq __ZTV12OZCurveAngle(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rbx)
    return copy;
  }
}
