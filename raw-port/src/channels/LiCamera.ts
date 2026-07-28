// LiCamera.ts - Ozone's abstract "camera" channel-node interface.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone.
//
// Source disassembly:
//   raw-port/re/disasm/LiCamera.getCropFraction.s     @0x40740
//   raw-port/re/disasm/LiCamera.setAnimTime.s         @0x40760
//   raw-port/re/disasm/LiCamera.~LiCamera.s           @0x6dae20  (D0)
//   (D1 @0x6dae10 shares the mangled D1Ev symbol - typical
//    complete-object destructor pair.)
//
// nm -arch x86_64 (relevant symbols):
//   0000000000040740 T __ZNK8LiCamera15getCropFractionEv
//   0000000000040760 T __ZN8LiCamera11setAnimTimeEd
//   00000000006dae10 T __ZN8LiCameraD1Ev
//   00000000006dae20 T __ZN8LiCameraD0Ev
//                    U __ZTI8LiCamera            <- typeinfo declared extern
//   (no __ZTV8LiCamera in this binary)
//
// CLASS ROLE: LiCamera is an ABSTRACT camera interface for the Ozone
// channel graph (used by e.g. OZImageMask::getPointInMaskSourceCoordinates,
// OZRotoshape::hitCheck, OZSceneNode::hitCheck - all of which take a
// `const LiCamera*` parameter). The vtable itself does not live in
// Ozone (`__ZTV8LiCamera` is not defined here); concrete cameras
// provide the vtable slots. The four methods ported here are:
//
//   getCropFraction() const  - a thin dispatcher that consults a
//                              vtable slot (probably "shouldCrop")
//                              and returns either 1.0 or 0.0.
//   setAnimTime(double t)    - a hollow base implementation (no-op).
//                              Overridden by subclasses with actual
//                              time-dependent state.
//   ~LiCamera() D0           - a UD2 trap (see below).
//
// getCropFraction @0x40740 - const, no side effects:
//
//   pushq  %rbp
//   movq   %rsp,%rbp
//   movq   (%rdi),%rax            ; @0x40744  rax = *this = vtable ptr
//   callq  *0x298(%rax)           ; @0x40747  vtable slot +0x298 (=slot 83)
//   testb  %al,%al                ; @0x4074d  the vfn returned bool
//   jne    0x40756                ; @0x4074f  if true -> non-zero return
//   xorps  %xmm0,%xmm0            ; @0x40751  else return 0.0 (double)
//   popq   %rbp
//   retq
// 0x40756:
//   movsd  0x6c4c82(%rip),%xmm0   ; @0x40756  return the double at VA 0x7053e0
//   popq   %rbp                   ;           bytes = 00 00 00 00 00 00 f0 3f
//   retq                          ;           IEEE-754 double = 1.0 exactly
//
// The RIP-relative constant at VA 0x7053e0 sits in the Ozone __TEXT/__const
// section and equals 1.0 (bit pattern 0x3ff0000000000000). So this fn
// dispatches ONCE through the vtable to a bool-returning predicate and
// then maps false -> 0.0, true -> 1.0. That's not "get a fraction"; it's
// "get an on/off crop flag as a double". The naming ("Fraction") likely
// hints at future subclasses returning fractional values via a
// different vtable slot, but as-shipped this base thunk is boolean.
//
// The vtable slot at offset 0x298 (byte offset = index 83 for an 8-byte
// slot table) is a virtual const bool method. The concrete callee is
// not in this binary: not yet transcribed vfn @LiCamera 0x298 (belongs
// to a subclass in another framework, likely LiOZCamera or
// LiRealCamera).
//
// setAnimTime @0x40760 - a hollow-body member:
//
//   pushq  %rbp
//   movq   %rsp,%rbp
//   popq   %rbp
//   retq
//
// Ignores its `double t` argument entirely - the caller's %xmm0 is
// never read. This is the base-class hook that concrete cameras
// override to update their time-parameterized state (position curves,
// FOV animation, etc.); the base implementation is intentionally
// empty so a scene-graph traversal can call setAnimTime on any
// LiCamera* without a null check.
//
// ~LiCamera D0 @0x6dae20 - a hard trap:
//
//   pushq  %rbp
//   movq   %rsp,%rbp
//   ud2                                ; @0x6dae24  invalid opcode -> SIGILL
//
// The `ud2` instruction is emitted by the compiler for a
// "should-never-be-called" path. Since LiCamera has a `U __ZTI8LiCamera`
// (typeinfo referenced externally) and NO __ZTV8LiCamera in this binary,
// LiCamera is an abstract interface that CANNOT be instantiated
// directly - so its deleting-destructor (D0) has nothing legitimate to
// delete. If a caller ever reaches this via a mismatched vtable, the
// process traps immediately. We surface this as a throwing method
// (JS's closest analogue to SIGILL is an unrecoverable Error) - the
// symbol is exposed for parity but any live call is a program error.
//
// D1 @0x6dae10 (the base-object destructor) is sibling to D0; we do
// not extract its body separately because in an abstract class it's
// typically also trivial or ud2 - which either way is not observable
// under GC. Its address is documented for provenance.
//
// FRONTIER (not ported):
//   * The vfn at LiCamera vtable slot +0x298 - subclass-supplied
//     "shouldCrop" predicate. Not yet transcribed @LiCamera 0x298.
//   * `__ZTI8LiCamera` typeinfo - lives outside Ozone.

/**
 * LiCamera - abstract camera interface for the Ozone channel graph.
 *
 * This class is INTENTIONALLY unimplementable directly (its vtable
 * is not in Ozone). Concrete subclasses provide the vtable and thus
 * the meaningful behavior of `getCropFraction`. The base-class methods
 * here match the Ozone binary's thunks exactly.
 */
export abstract class LiCamera {
  /**
   * Virtual predicate consulted by getCropFraction - abstract in the
   * base class; concrete cameras override. Corresponds to vtable slot
   * +0x298 in LiCamera's vtable (byte offset 0x298 / 8 = slot 83).
   * Not yet transcribed vfn @LiCamera 0x298 (the concrete
   * implementation lives in a subclass in another framework and
   * returns `bool` via the SysV ABI's %al register).
   */
  protected abstract _vfn_0x298_shouldCrop(): boolean;

  /**
   * getCropFraction() const - @Ozone 0x40740.
   *
   *   movq   (%rdi),%rax            ; rax = vtable
   *   callq  *0x298(%rax)           ; vfn slot +0x298 : bool()
   *   testb  %al,%al ; jne 0x40756
   *   xorps  %xmm0,%xmm0 ; ret      ; false -> 0.0 (double)
   *  0x40756:
   *   movsd  [rip+0x6c4c82],%xmm0   ; @0x40756 -> VA 0x7053e0 in __TEXT/__const
   *                                 ;   bytes 00 00 00 00 00 00 f0 3f = 1.0
   *   ret                            ; true  -> 1.0
   *
   * @returns 1.0 if the vfn returned true, else 0.0. IEEE-754 double.
   */
  getCropFraction(): number {
    // @0x40744 - 0x40747  vtable dispatch to the bool predicate.
    const shouldCrop: boolean = this._vfn_0x298_shouldCrop();
    // @0x4074d - 0x4074f  testb %al,%al  ;  jne 0x40756
    if (shouldCrop) {
      // @0x40756  movsd [rip+0x6c4c82],%xmm0  ; the double literal at
      // Ozone VA 0x7053e0, verified bytes 00 00 00 00 00 00 f0 3f = 1.0
      return 1.0;
    }
    // @0x40751  xorps %xmm0,%xmm0  ; return 0.0 (both single and double
    // interpretations of an all-zero xmm are 0.0; the caller uses %xmm0
    // as a double per the -Ev return convention on this const member).
    return 0.0;
  }

  /**
   * setAnimTime(double t) - @Ozone 0x40760.
   *
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * The base implementation is a hollow no-op: the `t` argument (in
   * %xmm0 per the SysV ABI) is never inspected. Subclasses that
   * actually depend on animation time override this to update their
   * time-parameterized state.
   *
   * @param t double animation time in seconds. Ignored by base impl.
   */
  setAnimTime(t: number): void {
    // Ignored - faithful mirror of the empty asm body.
    void t;
  }

  /**
   * Destructor - @Ozone 0x6dae20 (D0) / 0x6dae10 (D1).
   *
   *   pushq %rbp ; movq %rsp,%rbp ; ud2      ; D0 @0x6dae24
   *
   * `ud2` is the x86 "undefined instruction" opcode. It's emitted for
   * a code path the compiler considers unreachable - here, "delete an
   * abstract LiCamera*" is a bug (no vtable exists), so the compiler
   * planted an outright trap. We reflect that as an unrecoverable
   * throw. Any legitimate teardown goes through a concrete subclass's
   * override, never through this base thunk.
   */
  protected _dtor(): never {
    // Mirrors the `ud2` at @0x6dae24. Reaching here would crash the
    // native process with SIGILL; in JS we throw an equivalently
    // unrecoverable error.
    throw new Error("LiCamera::~LiCamera D0 is a `ud2` trap in Ozone @0x6dae24 - abstract class, must be overridden by concrete camera. Not yet transcribed vfn @LiCamera 0x298 either.");
  }
}
