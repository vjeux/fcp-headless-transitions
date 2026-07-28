/**
 * HGGLSetCurrentContextGuard — Helium framework (render layer)
 *
 * A stack-scope RAII guard that temporarily makes an HGGLContextPtr the
 * current OpenGL context: the constructor saves the previously-current
 * context and switches to the caller-supplied one; the destructor restores
 * the previous context — but only if the switch actually happened. This is
 * the classic "scoped current-context" pattern seen in every GL codebase.
 *
 * FOUR SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
 *   @Helium 0x1b4050  HGGLSetCurrentContextGuard::HGGLSetCurrentContextGuard(HGGLContextPtr)  [C2]
 *   @Helium 0x1b40a0  HGGLSetCurrentContextGuard::HGGLSetCurrentContextGuard(HGGLContextPtr)  [C1]
 *                      (C1 and C2 are bit-identical in the binary — Itanium ABI base+complete
 *                       ctors coincide for a class with no vbases, and the compiler emitted
 *                       both copies verbatim: 0x1b4050 body == 0x1b40a0 body byte-for-byte.)
 *   @Helium 0x1b40f0  HGGLSetCurrentContextGuard::~HGGLSetCurrentContextGuard()              [D2]
 *   @Helium 0x1b4130  HGGLSetCurrentContextGuard::~HGGLSetCurrentContextGuard()              [D1]
 *                      (D1 and D2 are also byte-identical — matches C1/C2 case above.)
 *
 * STRUCT LAYOUT (recovered from the load/store offsets in the four methods):
 *   struct HGGLSetCurrentContextGuard {
 *     +0x00  savedContext   HGGLContextPtr  (opaque handle; treated as a single pointer/u64)
 *     +0x08  didSwitch      bool            (u8: 1 iff we called setCurrent in the ctor and
 *                                             therefore owe a restore in the dtor)
 *   };
 *
 * External callees cited:
 *   __ZN14HGGLContextCGL10getCurrentEv               HGGLContextCGL::getCurrent()             @0x1b4061 / @0x1b40b1
 *   __ZN14HGGLContextCGL10setCurrentE14HGGLContextPtr HGGLContextCGL::setCurrent(HGGLContextPtr) @0x1b407a / @0x1b40ca / @0x1b410a / @0x1b414a
 *   ___clang_call_terminate                           Clang exception-termination trampoline    @0x1b4120 / @0x1b4160 (cold path)
 *   __Unwind_Resume (via 0x3c4e02 stub)              Itanium exception unwinder               @0x1b4096 / @0x1b40e6 (cold path)
 *
 * HGGLContextPtr — passed by value in %rsi (a pointer-sized handle). The ABI treats it as a
 * struct-of-single-pointer; the ctors load `*rsi` into %rax to read the raw pointer inside
 * (canonical for `struct HGGLContextPtr { void* p; }` semantics). We mirror this as a
 * one-field boxed handle to keep the load/store pattern visible.
 */

/**
 * Opaque HGGLContextPtr handle. In the binary it's a struct with a single pointer field
 * (`(%rsi)` load at @0x1b406a picks up the inner pointer). We model it as a boxed object
 * whose identity is the raw handle — comparison in the ctor (@0x1b406d cmpq) is by that
 * raw handle. */
export interface HGGLContextPtr {
  /** Raw context handle — canonical inner field of the C++ struct. */
  readonly handle: bigint;
}

/**
 * The CGL-backed static current-context API used by this guard. Not yet ported —
 * every entry point is a throwing stub citing its Helium @0xADDR. */
export interface HGGLContextCGLStatic {
  /** @Helium __ZN14HGGLContextCGL10getCurrentEv — returns the currently-current CGL
   *  context by value (in %rax). Contract only; unported callee. */
  getCurrent(): HGGLContextPtr;
  /** @Helium __ZN14HGGLContextCGL10setCurrentE14HGGLContextPtr — sets the given context
   *  as current. Contract only; unported callee. */
  setCurrent(ctx: HGGLContextPtr): void;
}

/**
 * Contract-only reference to the sibling CGL context class. Constructing/using this
 * guard requires a concrete implementation to be supplied at runtime (dependency-
 * inject the two static methods). Throwing default keeps unported call sites honest.
 */
export function HGGLContextCGL_notLinked_getCurrent(): HGGLContextPtr {
  // External Helium callee @0x1b4061 / @0x1b40b1 — HGGLContextCGL::getCurrent()
  throw new Error("HGGLContextCGL::getCurrent() unported callee @Helium 0x1b4061");
}
export function HGGLContextCGL_notLinked_setCurrent(_ctx: HGGLContextPtr): void {
  // External Helium callee @0x1b407a / @0x1b40ca / @0x1b410a / @0x1b414a — HGGLContextCGL::setCurrent
  throw new Error("HGGLContextCGL::setCurrent(HGGLContextPtr) unported callee @Helium 0x1b407a");
}

export class HGGLSetCurrentContextGuard {
  /** +0x00 in the C++ struct — the previously-current context we captured on entry. */
  savedContext: HGGLContextPtr = { handle: 0n };
  /** +0x08 in the C++ struct — u8 flag; true iff the ctor actually issued a setCurrent
   *  and therefore owes a restore call in the dtor. */
  didSwitch: boolean = false;

  /**
   * @Helium 0x1b4050  __ZN26HGGLSetCurrentContextGuardC2E14HGGLContextPtr
   * @Helium 0x1b40a0  __ZN26HGGLSetCurrentContextGuardC1E14HGGLContextPtr  (byte-identical)
   *
   * Faithful transcription of C2 (C1 is identical modulo the trailing 5-byte cold-path
   * unwind block, which is functionally the same):
   *   0x1b4050 pushq %rbp / movq %rsp,%rbp
   *   0x1b4054 pushq %r14 / pushq %rbx / subq $0x10,%rsp   ; frame + spill slot for tmp
   *   0x1b405b movq  %rsi, %r14                   ; r14 = ctxByRef  (arg2 = HGGLContextPtr)
   *   0x1b405e movq  %rdi, %rbx                   ; rbx = this      (arg1)
   *   0x1b4061 callq HGGLContextCGL::getCurrent() ; rax = raw handle of current context
   *   0x1b4066 movb  $0x0, 0x8(%rbx)              ; this->didSwitch = false
   *   0x1b406a movq  (%r14), %rax                 ; rax = *ctxByRef  (the requested raw handle)
   *                                               ;   -- WAIT: overwrite of rax indicates the
   *                                               ;   compiler kept the prev-current handle in a
   *                                               ;   different slot: getCurrent returned it in
   *                                               ;   rax then stored `*this = rax` implicitly
   *                                               ;   via the sink at (%rbx) (see cmpq below,
   *                                               ;   which references (%rbx)). Faithful reading:
   *                                               ;   the `movq %rax,(%rbx)` store lives in the
   *                                               ;   getCurrent return convention (it writes
   *                                               ;   its result through the sret-style rdi
   *                                               ;   argument that clang set up), so by the
   *                                               ;   time we reach 0x1b406a, (%rbx) already
   *                                               ;   holds the prev-current context; rax gets
   *                                               ;   reloaded with the requested handle from
   *                                               ;   *r14 for the equality test below.
   *   0x1b406d cmpq  %rax, (%rbx)                 ; compare prev-current  vs  requested
   *   0x1b4070 je    0x1b4083                     ; if equal → skip the setCurrent (no switch)
   *   0x1b4072 movq  %rax, -0x18(%rbp)            ; spill requested handle into local slot
   *   0x1b4076 leaq  -0x18(%rbp), %rdi            ; rdi = &tmp   (setCurrent takes it by-ref)
   *   0x1b407a callq HGGLContextCGL::setCurrent(&tmp)
   *   0x1b407f movb  $0x1, 0x8(%rbx)              ; this->didSwitch = true
   *   0x1b4083 addq  $0x10,%rsp / popq %rbx / popq %r14 / popq %rbp / retq
   *
   * Reduced semantics:
   *   this->savedContext = HGGLContextCGL::getCurrent();
   *   this->didSwitch    = false;
   *   if (this->savedContext.handle != ctx.handle) {
   *     HGGLContextCGL::setCurrent(ctx);
   *     this->didSwitch = true;
   *   }
   *
   * The exception-unwind tail (@0x1b408c..0x1b4096) writes 0 to this->savedContext and
   * calls __Unwind_Resume — that path is only taken if setCurrent throws, so we don't
   * mirror it in the happy-path TS body; JS-level exceptions from setCurrent bubble
   * naturally without needing a manual resume trampoline.
   *
   * Note on injected static: the class in the binary depends on `HGGLContextCGL` as a
   * hard external. We accept a small `cgl` shim so the port stays honest — the fp32-
   * narrowed default injects the throwing stubs above.
   */
  constructor(
    ctx: HGGLContextPtr,
    cgl: HGGLContextCGLStatic = {
      getCurrent: HGGLContextCGL_notLinked_getCurrent,
      setCurrent: HGGLContextCGL_notLinked_setCurrent,
    },
  ) {
    // @0x1b4061 — HGGLContextCGL::getCurrent()
    this.savedContext = cgl.getCurrent();
    // @0x1b4066 — this->didSwitch = false
    this.didSwitch = false;
    // @0x1b406d — cmpq %rax, (%rbx)  (raw-handle equality against saved)
    if (this.savedContext.handle !== ctx.handle) {
      // @0x1b407a — HGGLContextCGL::setCurrent(ctx)
      cgl.setCurrent(ctx);
      // @0x1b407f — this->didSwitch = true
      this.didSwitch = true;
    }
    // @0x1b4083 — return
  }

  /**
   * @Helium 0x1b40f0  __ZN26HGGLSetCurrentContextGuardD2Ev
   * @Helium 0x1b4130  __ZN26HGGLSetCurrentContextGuardD1Ev  (byte-identical)
   *
   * Faithful transcription of D2:
   *   0x1b40f0 pushq %rbp / movq %rsp,%rbp
   *   0x1b40f4 pushq %rbx / pushq %rax                ; frame + align
   *   0x1b40f6 movq  %rdi, %rbx                       ; rbx = this
   *   0x1b40f9 cmpb  $0x1, 0x8(%rdi)                  ; this->didSwitch == 1 ?
   *   0x1b40fd jne   0x1b410f                         ; if not switched → skip restore
   *   0x1b40ff movq  (%rbx), %rax                     ; rax = this->savedContext.handle
   *   0x1b4102 movq  %rax, -0x10(%rbp)                ; spill to local slot
   *   0x1b4106 leaq  -0x10(%rbp), %rdi                ; rdi = &tmp
   *   0x1b410a callq HGGLContextCGL::setCurrent(&tmp) ; restore prev-current
   *   0x1b410f movq  $0x0, (%rbx)                     ; this->savedContext = 0 (defensive clear)
   *   0x1b4116 addq  $0x8,%rsp / popq %rbx / popq %rbp / retq
   *
   * Cold path (@0x1b411d..0x1b4120) is `___clang_call_terminate` — invoked only if the
   * setCurrent call above throws during stack unwinding (`terminate()` per C++ ABI). We
   * do not model this in TS; unhandled exceptions in JS reach the top level naturally.
   *
   * Reduced semantics:
   *   if (this->didSwitch) HGGLContextCGL::setCurrent(this->savedContext);
   *   this->savedContext.handle = 0;   // defensive clear on exit
   */
  destroy(
    cgl: HGGLContextCGLStatic = {
      getCurrent: HGGLContextCGL_notLinked_getCurrent,
      setCurrent: HGGLContextCGL_notLinked_setCurrent,
    },
  ): void {
    // @0x1b40f9 — cmpb $0x1, 0x8(%rdi)
    if (this.didSwitch === true) {
      // @0x1b410a — HGGLContextCGL::setCurrent(savedContext)
      cgl.setCurrent(this.savedContext);
    }
    // @0x1b410f — this->savedContext = 0 (raw handle cleared)
    this.savedContext = { handle: 0n };
  }
}
