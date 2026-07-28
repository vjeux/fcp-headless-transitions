// raw-port: LiAttributeStack — Ozone framework (channels layer)
//
// RAII wrapper around ProGL::GL::pushAttrib / popAttrib. Constructor
// optionally pushes an attribute mask and increments a depth counter;
// destructor pops until the counter is zero.
//
// Object layout (proven by field offsets in the ctor and dtor):
//   +0x00 (i32)   depth        — pushAttrib call count still active
//                                  (@0x23a9d5 ctor writes 0; @0x23aa99
//                                  increments after successful push;
//                                  @0x23aba6 dtor decrements per pop)
//   +0x04 (u8)    debug        — debug-log flag; @0x23a9db ctor writes 0.
//                                  When 1, ctor/dtor stream a log line
//                                  to std::cerr. Since the ctor
//                                  UNCONDITIONALLY sets this to 0 at
//                                  @0x23a9db BEFORE any conditional
//                                  branch that would use it, the debug
//                                  path @0x23aa03..0x23aa94 is always
//                                  skipped by construction (see below).
//   +0x08 ProGL::GL sub-object — 0x?? bytes, opaque to this port.
//                                  Constructed by ProGL::GL::D1() @0x6de9ac,
//                                  destroyed by ProGL::GL::~D1 @0x6de9b2.
//                                  Its vtable exposes:
//                                    +0x688  pushAttrib(mask)  — @0x23a9fd
//                                    +0x660  popAttrib()       — @0x23abd2
//
// Published entry points (both decoded here):
//   0x0023a9c0  LiAttributeStack::LiAttributeStack(int)   (C2)
//   0x0023ab90  LiAttributeStack::~LiAttributeStack()     (D2)
//
// External frontier (undecoded here — throwing stubs):
//   __ZN5ProGL2GLC1Ev   @0x6de9ac  ProGL::GL::GL()  (base ctor)
//   __ZN5ProGL2GLD1Ev   @0x6de9b2  ProGL::GL::~GL() (base dtor)
//   vtable[+0x688]                 pushAttrib(int)  — virtual on GL
//   vtable[+0x660]                 popAttrib()       — virtual on GL
//   __ZNSt3__14cerrE               std::cerr        — debug-log target
//   ... various libc++ i/o helpers (all dead code — see debug=0 note)

/**
 * Opaque handle to a ProGL::GL sub-object. The class is not decoded
 * here; we surface it as a brand + injection callbacks so callers can
 * plug in the concrete backend without us fabricating one.
 */
export type ProGL_GL = { readonly __brand: "ProGL_GL" };

/** Signature of `ProGL::GL::GL()` @0x6de9ac. Undecoded frontier. */
export type ProGL_GL_Ctor = () => ProGL_GL;
/** Signature of `ProGL::GL::~GL()` D1 @0x6de9b2. Undecoded frontier. */
export type ProGL_GL_Dtor = (self: ProGL_GL) => void;
/** Signature of the GL vtable slot +0x688 (pushAttrib). Undecoded frontier. */
export type ProGL_GL_PushAttrib = (self: ProGL_GL, mask: number) => void;
/** Signature of the GL vtable slot +0x660 (popAttrib). Undecoded frontier. */
export type ProGL_GL_PopAttrib = (self: ProGL_GL) => void;

/**
 * LiAttributeStack — depth-counted RAII wrapper around
 * ProGL::GL::pushAttrib/popAttrib.
 */
export class LiAttributeStack {
  /**
   * Field +0x00 — pushAttrib depth still active.
   *   @0x23a9d5  ctor: `movl $0x0, (%rdi)`
   *   @0x23aa99  ctor: `incl (%r14)` (after successful pushAttrib)
   *   @0x23aba6  dtor: decrement each iteration
   */
  private _depth: number = 0;

  /**
   * Field +0x04 — debug flag. The ctor @0x23a9db writes 0 to it. The
   * ctor's own debug-print branch @0x23aa03 tests `cmpb $0x1, 0x4(%r14)`
   * — which can NEVER be true here since we just wrote 0 five lines
   * earlier and the intervening call `ProGL::GL::GL()` @0x6de9ac takes
   * `%rbx = &this[+0x08]` as its target (never writes to +0x04). So
   * the debug-print block is dead code AT THIS ADDRESS. We faithfully
   * mirror the store, but never take the branch. Same argument applies
   * to the dtor's debug block @0x23abd8..0x23ac43: `_debug` remains 0
   * for the lifetime of the object (nothing in this class writes 1 to
   * it), so the dtor's `cmpb $0x1, 0x4(%rbx)` is always false.
   *
   * We DO surface it as a settable field for callers who patch the
   * object directly (mirroring the C++ behaviour if someone external
   * writes to `+0x04`), but we mark this as a decode-preserved knob
   * rather than a public API.
   */
  _debug: number = 0;

  /**
   * Field +0x08 — the GL sub-object. Constructed by the injected ctor,
   * destroyed by the injected dtor.
   */
  private _gl: ProGL_GL | null = null;

  /** Injected frontier bindings. All are undecoded external symbols. */
  private _glCtor: ProGL_GL_Ctor | null;
  private _glDtor: ProGL_GL_Dtor | null;
  private _pushAttrib_v: ProGL_GL_PushAttrib | null;
  private _popAttrib_v: ProGL_GL_PopAttrib | null;

  /**
   * LiAttributeStack::LiAttributeStack(int)   @0x0023a9c0   (C2)
   *
   * Faithful asm mirror:
   *   @0x23a9c0..0x23a9cb  prologue: save %r15/%r14/%r12/%rbx; sub $0x10, %rsp
   *   @0x23a9cf  %r15d = %esi (arg `mask`)
   *   @0x23a9d2  %r14  = %rdi (this)
   *   @0x23a9d5  movl $0x0, (%rdi)                       ; this->_depth = 0
   *   @0x23a9db  movb $0x0, 0x4(%rdi)                    ; this->_debug = 0
   *   @0x23a9df  leaq 0x8(%rdi), %rbx                    ; %rbx = &this->_gl
   *   @0x23a9e3  movq %rbx, %rdi
   *   @0x23a9e6  call __ZN5ProGL2GLC1Ev                  ; ProGL::GL::GL() sub-object ctor
   *   @0x23a9eb  testl %r15d, %r15d                      ; if (mask == 0) skip
   *   @0x23a9ee  je   0x23aa9c                           ;   → epilogue
   *   @0x23a9f4  movq (%rbx), %rax                       ; %rax = _gl->vptr
   *   @0x23a9f7  movq (%rax), %rdi                       ; %rdi = *_gl->vptr[0]
   *                                                       ;   NOTE: this is the
   *                                                       ;   first vtable slot,
   *                                                       ;   likely the same
   *                                                       ;   ptr as _gl itself;
   *                                                       ;   we forward `_gl`
   *                                                       ;   as the `this`
   *                                                       ;   arg to the vfunc.
   *   @0x23a9fa  movl %r15d, %esi                        ; %esi = mask
   *   @0x23a9fd  callq *0x688(%rax)                      ; GL vtable[+0x688](mask)
   *                                                       ;   = pushAttrib(mask)
   *   @0x23aa03  cmpb $0x1, 0x4(%r14)                    ; if (debug == 1) log
   *   @0x23aa08  jne  0x23aa99                           ;   (DEAD BRANCH — see
   *                                                       ;    field-note above)
   *   [debug block @0x23aa0e..0x23aa94 — writes "gl.pushAttrib(<n>)\n"
   *    to std::cerr; unreachable because _debug is always 0 here]
   *   @0x23aa99  incl (%r14)                             ; this->_depth++
   *   @0x23aa9c..0x23aaa8  epilogue ; retq
   *
   * The two EH landing pads @0x23aaa9..0x23aad3 handle:
   *   - libc++ locale::~D1 (unwind) + ProGL::GL::~D1 + Unwind_Resume
   *     if the debug std::ostream chain throws
   *   - ProGL::GL::~D1 + Unwind_Resume if the pushAttrib callq throws
   * These are OFF the happy path and mirrored as JS exception propagation.
   */
  constructor(
    mask: number,
    bindings: {
      glCtor?: ProGL_GL_Ctor | null;
      glDtor?: ProGL_GL_Dtor | null;
      pushAttrib?: ProGL_GL_PushAttrib | null;
      popAttrib?: ProGL_GL_PopAttrib | null;
    } = {},
  ) {
    // @0x23a9d5 ; @0x23a9db — initialize scalar fields.
    this._depth = 0;
    this._debug = 0;

    this._glCtor = bindings.glCtor ?? null;
    this._glDtor = bindings.glDtor ?? null;
    this._pushAttrib_v = bindings.pushAttrib ?? null;
    this._popAttrib_v = bindings.popAttrib ?? null;

    // @0x23a9e6 — construct the GL sub-object at +0x08.
    if (this._glCtor === null) {
      throw new Error(
        "LiAttributeStack.ctor: no ProGL::GL::GL() backend injected — undecoded frontier @0x23a9e6 (symbol stub _ZN5ProGL2GLC1Ev @0x6de9ac)",
      );
    }
    this._gl = this._glCtor();

    // @0x23a9eb..0x23a9ee — early-exit if mask == 0.
    const maskI32 = mask | 0;
    if (maskI32 === 0) {
      return;
    }

    // @0x23a9f4..0x23a9fd — virtual pushAttrib(mask). The asm passes
    // `%rax = _gl->vptr` and then `*0x688(%rax)`, i.e. vtable slot 0xd1
    // (0x688 / 8). The `this` argument in %rdi is `*_gl->vptr[0]` —
    // which for a typical vtable layout is the ProGL::GL object itself
    // (the vtable's first slot after the type-info blocks is usually
    // the object's own address). We forward `_gl` directly.
    if (this._pushAttrib_v === null) {
      throw new Error(
        "LiAttributeStack.ctor: no ProGL::GL vtable[+0x688]=pushAttrib backend injected — undecoded frontier @0x23a9fd (virtual dispatch on ProGL::GL sub-object)",
      );
    }
    this._pushAttrib_v(this._gl, maskI32);

    // @0x23aa03..0x23aa94 — debug-log block; dead here because _debug=0.

    // @0x23aa99 — successful push increments depth.
    this._depth = (this._depth + 1) | 0;
  }

  /**
   * LiAttributeStack::~LiAttributeStack()   @0x0023ab90   (D2, base)
   *
   * Faithful asm mirror. Pops attribs in a loop until depth == 0, then
   * destroys the GL sub-object. Debug branch is dead (same reason as
   * the ctor's).
   *
   *   @0x23ab90..0x23ab9d  prologue: save regs; sub $8, %rsp
   *   @0x23ab9e  %rbx = %rdi = this
   *   @0x23aba1  %eax = (%rdi)                            ; old_depth
   *   @0x23aba3  %ecx = %eax - 1
   *   @0x23aba6  movl %ecx, (%rdi)                        ; this->_depth = old_depth - 1
   *   @0x23aba8  testl %eax, %eax                         ; if (old_depth <= 0) skip loop
   *   @0x23abaa  jle 0x23ac48
   *   ─── loop body starts @0x23abcb ───────────────────
   *   @0x23abcb  movq 0x8(%rbx), %rax                     ; %rax = _gl->vptr (via _gl base)
   *   @0x23abcf  movq (%rax), %rdi                        ; %rdi = *_gl->vptr[0] (= _gl)
   *   @0x23abd2  callq *0x660(%rax)                       ; vtable[+0x660]() = popAttrib()
   *   @0x23abd8  cmpb $0x1, 0x4(%rbx)                     ; DEAD debug branch
   *   @0x23abdc  jne  0x23abc0                            ;   → back-edge (skip debug)
   *   [debug block @0x23abde..0x23ac43 — writes "gl.popAttrib()\n" to cerr,
   *    unreachable because _debug is always 0]
   *   ─── back-edge @0x23abc0 ─────────────────────────
   *   @0x23abc0  movl (%rbx), %eax                        ; %eax = current depth
   *   @0x23abc2  %ecx = %eax - 1
   *   @0x23abc5  movl %ecx, (%rbx)                        ; depth--
   *   @0x23abc7  testl %eax, %eax
   *   @0x23abc9  jle  0x23ac48                            ; loop exit
   *   [fall-through to @0x23abcb — next iteration]
   *   ─── loop exit @0x23ac48 ─────────────────────────
   *   @0x23ac48  addq $0x8, %rbx                          ; %rbx = &_gl
   *   @0x23ac4c  movq %rbx, %rdi
   *   @0x23ac4f  callq ProGL::GL::~D1                     ; destroy sub-object
   *   @0x23ac54..0x23ac62  epilogue ; retq
   *
   * IMPORTANT semantic detail: the loop uses `test/jle` on the PRE-
   * decrement counter (`%eax`, holding the value BEFORE the store). So
   * with depth=1 at entry: eax=1 → decrement store makes it 0 → jle(1)
   * is FALSE → enter loop, call popAttrib → back-edge tests eax=0 →
   * jle(0) is TRUE → exit. Net: one popAttrib call. Matches the ctor
   * which increments once per push.
   *
   * With depth=0 at entry: eax=0 → jle(0) is TRUE → skip loop entirely
   * → straight to ~GL. Matches the "mask=0" ctor path (no push, no pop).
   */
  dispose(): void {
    // @0x23aba1..0x23abaa — pre-loop check on entry depth.
    // @0x23abc0..0x23abc9 — mid-loop check on updated depth.
    // Both perform: pre = _depth; _depth = pre - 1; if (pre <= 0) exit.
    let pre = this._depth | 0;
    this._depth = (pre - 1) | 0;
    while (pre > 0) {
      // @0x23abcb..0x23abd2 — virtual popAttrib().
      if (this._popAttrib_v === null) {
        throw new Error(
          "LiAttributeStack.dispose: no ProGL::GL vtable[+0x660]=popAttrib backend injected — undecoded frontier @0x23abd2 (virtual dispatch on ProGL::GL sub-object)",
        );
      }
      if (this._gl === null) {
        // Cannot happen if the ctor completed — but if a caller
        // destroys before construction finished, mirror the C++
        // undefined behaviour by throwing rather than silently
        // dereferencing null.
        throw new Error(
          "LiAttributeStack.dispose: GL sub-object was not constructed (@0x23abcb dereferences 0x8(%rbx))",
        );
      }
      this._popAttrib_v(this._gl);
      // @0x23abd8..0x23ac43 — debug block; dead (see field note).

      // Back-edge @0x23abc0..0x23abc9 — decrement + retest.
      pre = this._depth | 0;
      this._depth = (pre - 1) | 0;
    }

    // @0x23ac48..0x23ac4f — destroy the GL sub-object at +0x08.
    if (this._gl !== null) {
      if (this._glDtor === null) {
        throw new Error(
          "LiAttributeStack.dispose: no ProGL::GL::~GL() backend injected — undecoded frontier @0x23ac4f (symbol stub _ZN5ProGL2GLD1Ev @0x6de9b2)",
        );
      }
      this._glDtor(this._gl);
      this._gl = null;
    }
  }
}
