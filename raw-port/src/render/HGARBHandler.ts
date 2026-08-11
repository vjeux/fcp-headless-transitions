// raw-port: HGARBHandler (Helium.framework) — the ARB-program unbind path.
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this commit)
// -----------------------------------------------------------------------------
//   * HGARBHandler::UnBind()   @Helium 0x152e90
//     __ZN12HGARBHandler6UnBindEv
//     re/disasm: raw-port/re/disasm/Helium.__ZN12HGARBHandler6UnBindEv.s (10 lines)
//
// Sibling symbols of the same class (`nm -n -arch x86_64 Helium`) are SEPARATE
// ledger units and are deliberately NOT written here:
//   0x152320 D2      0x152bd0 D1      0x152be0 D0
//   0x152c00 Reset(HGRenderer*)               0x152c30 LocalParameter(int,f,f,f,f)
//   0x152cc0 LocalParameters(int,const float*,int)
//   0x152d80 LocalParametersBuffer(void*,unsigned long,unsigned long)
//   0x152db0 EnvParameters(int,const float*,int)
//   0x152e70 ActiveStage(bool)
//
// CLASS CONTEXT (read off the siblings above, not ported here):
//   HGARBHandler derives from HGGLHandler (raw-port/src/render/HGGLHandler.ts):
//   Reset @0x152c09 calls `__ZN11HGGLHandler5ResetEP10HGRenderer` on the same
//   `this`, and D2 @0x152325 tail-jumps `__ZN9HGHandlerD2Ev` (the grandparent
//   base dtor the two derived dtors ICF-fold onto). The class adds one ivar at
//   +0xfc — the ARB program target — which Reset initialises to 0x8804
//   (@0x152c0e) and ActiveStage flips between 0x8620 (GL_VERTEX_PROGRAM_ARB,
//   @0x152e76) and 0x8804 (GL_FRAGMENT_PROGRAM_ARB, @0x152e7b) via `cmovnel`
//   (@0x152e80, stored @0x152e83). That ivar is state owned by those two units;
//   it is documented here only to explain the quirk below and is NOT modelled
//   as a field by this commit, which ports exactly one method.
//
// THE QUIRK THIS PORT MUST PRESERVE: UnBind does NOT read +0xfc. It ignores
// `this` entirely — the first instruction after the frame setup (@0x152e94)
// overwrites %rdi, the incoming `this` pointer, with the immediate 0x8804. So
// even when ActiveStage(true) has switched the handler to the VERTEX program
// target, UnBind unbinds and disables the FRAGMENT program target. The faithful
// port therefore hard-codes 0x8804 twice and takes no state. Do not "fix" this
// into `this.programTarget`; that would be a different function.
//
// -----------------------------------------------------------------------------
// FULL DISASM (10 lines, @0x152e90..@0x152eab) — every instruction accounted for
// -----------------------------------------------------------------------------
//   __ZN12HGARBHandler6UnBindEv:
//     0x152e90  pushq %rbp                    ; frame setup (no TS counterpart)
//     0x152e91  movq  %rsp, %rbp              ; frame setup (no TS counterpart)
//     0x152e94  movl  $0x8804, %edi           ; arg0 = GL_FRAGMENT_PROGRAM_ARB
//                                             ;   (clobbers `this` in %rdi)
//     0x152e99  xorl  %esi, %esi              ; arg1 = 0  (program id 0 = none)
//     0x152e9b  callq 0x3c519e                ; __stubs _glBindProgramARB
//     0x152ea0  movl  $0x8804, %edi           ; arg0 = GL_FRAGMENT_PROGRAM_ARB
//     0x152ea5  popq  %rbp                    ; frame teardown (no TS counterpart)
//     0x152ea6  jmp   0x3c5228                ; TAIL CALL __stubs _glDisable
//     0x152eab  nopl  (%rax,%rax)             ; alignment padding, not code
//
// Both callees are TRUE OUT-OF-SCOPE externs, not in-scope Helium code:
//   `nm -m -arch x86_64 Helium` reports
//     (undefined) external _glBindProgramARB (from OpenGL)
//     (undefined) external _glDisable        (from OpenGL)
// so per the porting spec (Rule 3) they are surfaced as throwing frontier stubs
// carrying the __stubs address they are reached through — the same shape the
// landed base-class file raw-port/src/render/HGGLHandler.ts uses for its
// thirteen GL entry points. A downstream binding provides real implementations.

/**
 * `GL_FRAGMENT_PROGRAM_ARB` — the ARB_fragment_program target enum.
 *
 * Read verbatim off the two `movl $0x8804, %edi` immediates in this function
 * (@0x152e94 and @0x152ea0). The same immediate appears in the sibling units as
 * the +0xfc default (Reset @0x152c0e) and as the `cmovnel` false-arm
 * (ActiveStage @0x152e7b).
 *
 * @0xADDR Helium 0x152e94
 */
export const GL_FRAGMENT_PROGRAM_ARB = 0x8804 as const;

/**
 * `_glBindProgramARB(GLenum target, GLuint program)` — OpenGL.framework extern,
 * reached through the Helium __TEXT symbol stub at 0x3c519e (`callq 0x3c519e`
 * @0x152e9b).
 *
 * @0xADDR Helium __stubs 0x3c519e
 */
function _glBindProgramARB(_target: number, _program: number): void {
  throw new Error("_glBindProgramARB @Helium __stubs 0x3c519e not yet transcribed");
}

/**
 * `_glDisable(GLenum cap)` — OpenGL.framework extern, reached through the
 * Helium __TEXT symbol stub at 0x3c5228 (`jmp 0x3c5228` @0x152ea6, a tail call).
 *
 * @0xADDR Helium __stubs 0x3c5228
 */
function _glDisable(_cap: number): void {
  throw new Error("_glDisable @Helium __stubs 0x3c5228 not yet transcribed");
}

/**
 * `HGARBHandler` — Helium's ARB assembly-program (ARB_fragment_program /
 * ARB_vertex_program) handler, a concrete subclass of HGGLHandler.
 *
 * Only `UnBind()` is ported in this commit; the class carries no TS fields yet
 * because `UnBind` reads none (see the header note on the +0xfc ivar, which
 * belongs to the Reset/ActiveStage units).
 *
 * @0xADDR Helium 0x152e90
 */
export class HGARBHandler {
  /**
   * `HGARBHandler::UnBind()` @Helium 0x152e90 — `__ZN12HGARBHandler6UnBindEv`.
   *
   * Two instructions of real work, in this order:
   *   @0x152e94/@0x152e99/@0x152e9b
   *       glBindProgramARB(GL_FRAGMENT_PROGRAM_ARB, 0)
   *       — `xorl %esi,%esi` is the literal 0 second argument: binding program
   *         object 0 detaches whatever ARB program is current on that target.
   *   @0x152ea0/@0x152ea6
   *       glDisable(GL_FRAGMENT_PROGRAM_ARB)
   *       — a tail `jmp`, so this call's (void) result is the function's result
   *         and nothing runs after it.
   *
   * `this` is never dereferenced: %rdi is overwritten with the target immediate
   * at @0x152e94 before any load. The method is therefore state-free, and the
   * FRAGMENT target is used unconditionally even in the vertex-stage
   * configuration ActiveStage(true) can leave behind (@0x152e76..@0x152e83).
   *
   * @0xADDR Helium 0x152e90
   */
  UnBind(): void {
    // @0x152e94 movl $0x8804,%edi ; @0x152e99 xorl %esi,%esi ; @0x152e9b callq __stubs _glBindProgramARB
    _glBindProgramARB(GL_FRAGMENT_PROGRAM_ARB, 0);
    // @0x152ea0 movl $0x8804,%edi ; @0x152ea6 jmp __stubs _glDisable  (tail call)
    _glDisable(GL_FRAGMENT_PROGRAM_ARB);
  }
}
