/**
 * LiMatrixStack — ProGL matrix-stack RAII wrapper used by Ozone's rendering
 * layer. Ports Ozone.framework symbol __ZN13LiMatrixStackD1Ev @0x236560.
 *
 * Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
 *         Ozone.framework/Versions/A/Ozone  (x86_64 slice).
 *
 * Only ONE symbol for this class is present in the Ozone binary: the D1
 * destructor. The ctors and every public method are external to Ozone
 * (they live in ProGL); the ledger tracks LiMatrixStack as an
 * infra-layer scaffold, and this file transcribes what Ozone itself
 * defines. The ctors and pushMatrix/loadMatrix/etc. are NOT undecoded
 * gaps in this class — they're symbols owned by a different framework.
 *
 * STRUCT LAYOUT (recovered from the dtor body):
 *   +0x00  int32  mode           // OpenGL matrix mode enum. Compared
 *                                //   against 0x1702 = GL_PROJECTION at
 *                                //   0x236583 to decide whether to
 *                                //   invoke the "restore modelview"
 *                                //   vtable slot *0xab8. Passed as arg
 *                                //   #2 (esi) to ProGL::GL_Wrap::popMatrix.
 *   +0x04  int32  extraArg       // Passed as arg #3 (edx) to popMatrix
 *                                //   AND added to a __call_once_proxy
 *                                //   address at 0x236590. Purpose is
 *                                //   the "which stack index" selector
 *                                //   ProGL uses inside popMatrix.
 *   +0x08  int32  depth          // Non-negative push count. Each pop
 *                                //   decrements by one; the loop at
 *                                //   0x2365c0 pops until depth <= 0.
 *   +0x0c            (padding to 8-byte align the next field)
 *   +0x10  ProGL::GL*  gl        // Owned ProGL::GL instance. First eight
 *                                //   bytes of this sub-object are the
 *                                //   vtable pointer used by *0x578 /
 *                                //   *0xab8. The tail-jump at 0x2365ee
 *                                //   destroys it via ProGL::GL::~GL().
 *                                //   Its base address `(this)+0x10` is
 *                                //   what popMatrix is handed as `this`
 *                                //   (rdi) inside the pop loop.
 *
 * VTABLE SLOTS ON `gl` (the object at +0x10):
 *   *0x578  ProGL::GL::??? — invoked once, unconditionally, when
 *           `mode != 0` and `depth != 0` (path taken at 0x23657d).
 *           The exact target is undecoded; the disasm only tells us
 *           the offset. This is a bind-only-once "prepare-for-teardown"
 *           virtual method on ProGL::GL. Stubbed and throws.
 *   *0xab8  ProGL::GL::??? — invoked only when `mode == 0x1702`
 *           (GL_PROJECTION) at 0x2365a0. This is the extra
 *           "leave projection mode" virtual method on ProGL::GL.
 *           Stubbed and throws.
 *
 * FREE FUNCTION CALLEES:
 *   ProGL::GL_Wrap::popMatrix(unsigned int, int) @ external stub 0x6de9d0.
 *     Called once per push in the drain loop at 0x2365c8, until depth
 *     reaches zero. Not defined in Ozone; not yet transcribed. Stubbed.
 *   ProGL::GL::~GL() @ external stub 0x6de9b2. The final tail-jump at
 *     0x2365ee, destroying the owned `gl` sub-object.
 *
 * OPENGL ENUM:
 *   0x1702 = GL_PROJECTION  (see OpenGL header GL/gl.h). The dtor
 *   special-cases the projection matrix stack: on top of the ordinary
 *   *0x578 teardown, it also invokes *0xab8 before draining pushes.
 *
 * CONTROL FLOW (branch-for-branch mirror of the disasm):
 *
 *   0x236560  push rbp / mov rsp,rbp / push r14 / push rbx
 *   0x236567  mov  rbx, rdi                 ; rbx = this
 *   0x23656a  mov  esi, [rbx+0x0]           ; esi = this->mode
 *   0x23656c  test esi, esi
 *   0x23656e  je   0x2365dc                 ; if mode == 0, skip GL work
 *   0x236570  cmp  dword [rbx+0x8], 0
 *   0x236574  je   0x2365e3                 ; if depth == 0, tail-destroy
 *   0x236576  mov  rax, [rbx+0x10]          ; rax = this->gl
 *   0x23657a  mov  rdi, [rax]               ; rdi = *(gl) = gl->vptr
 *                                             ; ABI: rdi is "this",
 *                                             ; which for a virtual
 *                                             ; call is the object
 *                                             ; itself. Note the odd
 *                                             ; `mov rdi,[rax]` — the
 *                                             ; caller is loading `rdi`
 *                                             ; = *(gl) = the first
 *                                             ; word of the gl sub-
 *                                             ; object, which for a
 *                                             ; standard C++ object is
 *                                             ; the vtable pointer.
 *                                             ; However `callq *0x578(%rax)`
 *                                             ; uses %rax (the vtable
 *                                             ; base) + 0x578 as the
 *                                             ; slot, so it's a real
 *                                             ; virtual dispatch on the
 *                                             ; gl sub-object.
 *   0x23657d  call [rax+0x578]              ; gl->vtbl[0x578/8]()
 *   0x236583  cmp  dword [rbx+0x0], 0x1702  ; mode == GL_PROJECTION ?
 *   0x236589  jne  0x2365a0
 *   0x23658b  mov  esi, __ZNSt3__117__call_once_proxy...  ; symbol addr
 *   0x236590  add  esi, [rbx+0x4]           ; esi = call_once_proxy_addr
 *                                             ;         + this->extraArg
 *                                             ;  (the arg #2 that *0xab8
 *                                             ;   takes; this is
 *                                             ;   ProGL-specific).
 *   0x236593  mov  rax, [rbx+0x10]          ; rax = this->gl
 *   0x236597  mov  rdi, [rax]               ; rdi = same "load vptr" idiom
 *   0x23659a  call [rax+0xab8]              ; gl->vtbl[0xab8/8](esi)
 *   0x2365a0  mov  eax, [rbx+0x8]           ; eax = depth
 *   0x2365a3  lea  ecx, [rax-1]
 *   0x2365a6  mov  [rbx+0x8], ecx           ; --depth (via pre-op copy)
 *   0x2365a9  test eax, eax
 *   0x2365ab  jle  0x2365e3                 ; if depth was <=0, tail-destroy
 *   0x2365ad  lea  r14, [rbx+0x10]          ; r14 = &this->gl (arg to popMatrix)
 *   0x2365b1  (align nop)
 *   0x2365c0  mov  esi, [rbx+0x0]           ; esi = mode
 *   0x2365c2  mov  edx, [rbx+0x4]           ; edx = extraArg
 *   0x2365c5  mov  rdi, r14                 ; rdi = &gl (the pop target)
 *   0x2365c8  call ProGL::GL_Wrap::popMatrix(mode, extraArg)
 *   0x2365cd  mov  eax, [rbx+0x8]
 *   0x2365d0  lea  ecx, [rax-1]
 *   0x2365d3  mov  [rbx+0x8], ecx           ; --depth
 *   0x2365d6  test eax, eax
 *   0x2365d8  jg   0x2365c0                 ; loop while depth-pre > 0
 *   0x2365da  jmp  0x2365e3                 ; fallthrough to tail-destroy
 *   0x2365dc  mov  dword [rbx+0x8], 0       ; mode==0: force depth to 0
 *                                             ;   (no GL calls at all).
 *   0x2365e3  add  rbx, 0x10                ; rbx = &this->gl
 *   0x2365e7  mov  rdi, rbx
 *   0x2365ea  pop  rbx / pop r14 / pop rbp
 *   0x2365ee  jmp  ProGL::GL::~GL()         ; tail-destroy the sub-object
 *
 *   (0x2365f3 .. 0x236603 is the Itanium unwind cleanup landing pad
 *    — it forwards to ___clang_call_terminate. In this TS runtime any
 *    exception escapes naturally and cleanup is implicit; no
 *    unreachable code is transcribed.)
 */

// ── Frontier stubs for undecoded ProGL callees ─────────────────────────
// LiMatrixStack calls into three ProGL entry points. Each is undecoded
// (defined in a different framework) — every stub throws citing its
// stub address so frontier.py can enumerate the gap.

/** Opaque handle for the ProGL::GL instance owned at (this)+0x10.
 *  The real class layout, ctors, dtor, and vtable live in ProGL and
 *  are not yet transcribed. We model it as a brand plus the two
 *  vtable slot indices that LiMatrixStack::~LiMatrixStack dispatches. */
export interface ProGL_GL {
  /** Virtual method at vtable offset 0x578. Called once per teardown
   *  when `mode != 0` and `depth != 0` (at asm 0x23657d). Undecoded. */
  vtbl_0x578(this: ProGL_GL): void;
  /** Virtual method at vtable offset 0xab8. Called only when
   *  `mode == 0x1702` (GL_PROJECTION), at asm 0x23659a. Takes one
   *  argument (a call_once_proxy_addr + extraArg composite). Undecoded. */
  vtbl_0xab8(this: ProGL_GL, arg: number): void;
}

/** ProGL::GL_Wrap::popMatrix(unsigned int mode, int extraArg) — stub for
 *  the free function jumped to at asm 0x2365c8 (`callq 0x6de9d0` — symbol
 *  stub for `__ZN5ProGL7GL_Wrap9popMatrixEji`). Not yet transcribed. */
function ProGL_GL_Wrap_popMatrix_stub(
  _gl: ProGL_GL,
  _mode: number,
  _extraArg: number,
): void {
  throw new Error(
    "ProGL::GL_Wrap::popMatrix(unsigned int, int) @ProGL stub 0x6de9d0 not yet transcribed",
  );
}

/** ProGL::GL::~GL() — stub for the tail-destroy jumped to at asm
 *  0x2365ee (`jmp 0x6de9b2` — symbol stub for `__ZN5ProGL2GLD1Ev`).
 *  Not yet transcribed. */
function ProGL_GL_dtor_stub(_gl: ProGL_GL): void {
  throw new Error(
    "ProGL::GL::~GL() @ProGL stub 0x6de9b2 not yet transcribed",
  );
}

/** Address of the __call_once_proxy for OZElement_Factory::getInstance()
 *  loaded at asm 0x23658b:
 *    `movl $__ZNSt3__117__call_once_proxyB9nqe210106...OZElement_Factory..., %esi`
 *  The dtor adds `this->extraArg` to this address at 0x236590 and passes
 *  the composite as the sole argument to `gl->vtbl[0xab8]`. This is
 *  emphatically NOT semantic addition of a numeric quantity — it's ProGL
 *  packing a proxy-relative offset. We keep the arithmetic mirror-exact
 *  and cite the source symbol; the effective address value is only
 *  meaningful inside the real ProGL::GL virtual method that consumes it.
 *
 *  The actual VA of the proxy symbol in Ozone is not read from the disasm
 *  above (the assembler emits a symbol reference, not a numeric literal),
 *  so we do not fabricate a hex value here. The mirror expresses the
 *  computation as a symbolic reference; the concrete number only exists
 *  at link time in the Ozone binary. */
declare const OZElement_Factory_getInstance_call_once_proxy_addr: number;

// ── OpenGL enum constants used directly by the disasm ─────────────────

/** GL_PROJECTION = 0x1702, from OpenGL's glMatrixMode() enum. Compared
 *  against `this->mode` at asm 0x236583 to gate the *0xab8 vtable call. */
const GL_PROJECTION = 0x1702;

// ── The class ─────────────────────────────────────────────────────────

/** LiMatrixStack — RAII wrapper that pops N pushes off a ProGL matrix
 *  stack when it goes out of scope. The ctor and push methods live in
 *  ProGL (external symbols); this file only transcribes what Ozone
 *  itself defines, which is the destructor. */
export class LiMatrixStack {
  /** +0x00 — OpenGL matrix mode enum (0 = "no work to do"; 0x1702 =
   *   GL_PROJECTION triggers the extra *0xab8 vtable call). */
  mode: number = 0;
  /** +0x04 — auxiliary index/selector passed to popMatrix and folded
   *   into the *0xab8 argument at asm 0x236590. */
  extraArg: number = 0;
  /** +0x08 — non-negative number of pushes still to pop. */
  depth: number = 0;
  /** +0x10 — owned ProGL::GL sub-object. Its vtbl handles both the
   *   *0x578 and *0xab8 calls. Destroyed via ProGL::GL::~GL() as the
   *   final act of the dtor. Nullable because the ctor is external and
   *   we don't decode initialization here. */
  gl: ProGL_GL | null = null;

  /** LiMatrixStack::~LiMatrixStack() @Ozone 0x236560 — the D1 (non-
   *  deleting) destructor. Faithful branch-for-branch transcription of
   *  the disasm block documented in the file header above.
   *
   *  The tail-call at 0x2365ee — `jmp ProGL::GL::~GL()` — means the
   *  outer object's destructor completes by finalizing its owned
   *  `gl` sub-object. Modeled here as a call to `ProGL_GL_dtor_stub`
   *  followed by clearing the field, so the control-flow shape matches
   *  the asm and the frontier stub is visible to the ledger. */
  destroy_D1(): void {
    // 0x23656a — esi = this->mode
    // 0x23656c/0x23656e — testl esi,esi ; je 0x2365dc
    if (this.mode !== 0) {
      // 0x236570 — cmp dword [rbx+0x8], 0
      // 0x236574 — je 0x2365e3
      if (this.depth !== 0) {
        // 0x236576 — rax = this->gl
        // 0x23657a — load gl vptr (implicit as C++ virtual dispatch)
        const gl = this.gl;
        if (gl === null) {
          // Defensive: the asm dereferences unconditionally. In the
          // real binary, `mode != 0 && depth != 0` implies `gl` is
          // non-null by construction (invariant maintained by the
          // external ctor and pushMatrix). If we reach here with
          // gl==null, that's a port-side bug, not a decode gap.
          throw new Error(
            "LiMatrixStack::~LiMatrixStack @0x236576: this->gl is null with mode!=0 && depth!=0 — invariant violation",
          );
        }
        // 0x23657d — gl->vtbl[0x578/8]() (undecoded virtual). Stub
        //           throws citing @ProGL 0x578-slot.
        gl.vtbl_0x578();

        // 0x236583 — cmpl dword [rbx+0x0], 0x1702
        // 0x236589 — jne 0x2365a0
        if (this.mode === GL_PROJECTION) {
          // 0x23658b/0x236590 — esi = &OZElement_Factory_getInstance
          //                     __call_once_proxy + this->extraArg
          // We mirror the arithmetic symbolically; the concrete VA is
          // only meaningful inside the ProGL::GL vtbl[0xab8] callee,
          // which is not yet transcribed.
          const proxyPlusExtra =
            OZElement_Factory_getInstance_call_once_proxy_addr +
            this.extraArg;
          // 0x236593 — reload this->gl (rax = this->gl; the compiler
          //            re-emits the load because it doesn't trust the
          //            prior virtual call not to clobber rax).
          const gl2 = this.gl;
          if (gl2 === null) {
            throw new Error(
              "LiMatrixStack::~LiMatrixStack @0x236593: this->gl is null after *0x578 dispatch — invariant violation",
            );
          }
          // 0x23659a — gl->vtbl[0xab8/8](proxyPlusExtra). Stub throws.
          gl2.vtbl_0xab8(proxyPlusExtra);
        }

        // 0x2365a0 — eax = depth
        // 0x2365a3/0x2365a6 — ecx = depth - 1 ; store back
        // 0x2365a9/0x2365ab — testl eax,eax ; jle 0x2365e3
        // (This is the classic "post-decrement, test old value" idiom —
        //  the loop body runs once here, then falls into the tight
        //  pop-loop below if depth-pre > 1.)
        let depthPre = this.depth;
        this.depth = depthPre - 1;

        if (depthPre > 0) {
          // 0x2365ad — r14 = &this->gl (arg to popMatrix)
          // 0x2365c0..0x2365d8 — pop loop.
          //
          // NOTE: 0x2365a0's decrement is really the first iteration
          // of the same loop; after decrementing, if `depthPre > 0`
          // we enter the loop at 0x2365c0 to run more iterations. The
          // first popMatrix call still needs to fire — the store at
          // 0x2365a6 already happened before the first pop happens
          // (see the loop pre-decrement pattern below), but the pop
          // itself only starts at 0x2365c0 with the reloaded `mode`
          // and `extraArg`.
          //
          // So iteration 0's decrement runs at 0x2365a3..0x2365a6, and
          // iteration 0's pop call runs at 0x2365c8. Every subsequent
          // iteration repeats the (--depth, popMatrix) pair.
          //
          // We express this as a do/while that mirrors the layout:
          //   loop {
          //     popMatrix(this.gl, this.mode, this.extraArg);
          //     let pre = this.depth; this.depth = pre - 1;
          //     if (pre <= 0) break;
          //   }
          // …with the "0x2365a0" decrement having already happened
          // once above (that's iteration 0's decrement).
          while (true) {
            // 0x2365c0 — esi = this->mode
            const modeReload = this.mode;
            // 0x2365c2 — edx = this->extraArg
            const extraReload = this.extraArg;
            // 0x2365c5 — rdi = &this->gl (we pass gl directly here;
            //             the compiler's "&this->gl" is the object
            //             pointer for popMatrix's non-static this).
            const glReload = this.gl;
            if (glReload === null) {
              throw new Error(
                "LiMatrixStack::~LiMatrixStack @0x2365c5: this->gl is null inside pop loop — invariant violation",
              );
            }
            // 0x2365c8 — ProGL::GL_Wrap::popMatrix(mode, extraArg)
            //           on &this->gl. Undecoded stub.
            ProGL_GL_Wrap_popMatrix_stub(glReload, modeReload, extraReload);
            // 0x2365cd/0x2365d0/0x2365d3 — --depth (post-test).
            depthPre = this.depth;
            this.depth = depthPre - 1;
            // 0x2365d6/0x2365d8 — testl eax,eax ; jg 0x2365c0
            if (!(depthPre > 0)) {
              // 0x2365da — jmp 0x2365e3 (fallthrough to tail-destroy)
              break;
            }
          }
        }
        // else: 0x2365ab jle 0x2365e3 — first-iteration store already
        //       set depth to (0 - 1) = -1 or (depthPre - 1). No pop
        //       call fires. Fall through to tail-destroy.
      }
      // else: 0x236574 je 0x2365e3 — depth was already 0. Fall
      //       through to tail-destroy without touching gl at all.
    } else {
      // 0x2365dc — mode == 0: force depth to 0 (defensive scrub) and
      //            skip ALL GL work.
      this.depth = 0;
    }

    // 0x2365e3..0x2365ee — tail-jmp ProGL::GL::~GL() on &this->gl.
    // Modeled: destroy the owned gl and clear the field. When ProGL's
    // real dtor lands the throw-stub goes away; the observable
    // behavior (subsequent access is illegal) is preserved by the
    // gl=null clear.
    const glFinal = this.gl;
    if (glFinal !== null) {
      ProGL_GL_dtor_stub(glFinal);
    }
    this.gl = null;
  }
}
