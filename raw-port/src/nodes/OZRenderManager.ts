// raw-port: OZRenderManager (Ozone.framework)
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// `OZRenderManager` is the per-scene owner of the OpenGL renderer and of the
// render-job tag used to cancel that scene's queued work. It is a small,
// non-polymorphic object: the ctor writes exactly three slots and there is no
// vptr.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * OZRenderManager::getGLRenderer()   @Ozone 0x117d80
//     __ZN15OZRenderManager13getGLRendererEv
//     re/disasm: raw-port/re/disasm/__ZN15OZRenderManager13getGLRendererEv.s
//
// The rest of the class is NOT ported here — this file is ADD-ONLY and each
// member lands as its own unit: the ctors @0x117be0 / @0x117c40, the dtors
// @0x117ca0 / @0x117ce0, abort(bool) @0x117d20 and
// setRenderClient(id<OZRenderClient> const&) @0x117d90.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — recovered from the ctor and from abort()
// -----------------------------------------------------------------------------
// `OZRenderManager::OZRenderManager(OZScene*)` @Ozone 0x117be0
// (raw-port/re/disasm/__ZN15OZRenderManagerC2EP7OZScene.s):
//
//   0x117bed  movups %xmm0, (%rdi)          ; zero the 16 bytes at +0x00..+0x0f
//   0x117bf0  movl   _nextUniqueID(%rip), %eax   ; the class-static counter
//   0x117bf6  leal   0x1(%rax), %ecx
//   0x117bf9  movl   %ecx, _nextUniqueID(%rip)   ; post-increment it
//   0x117bff  movl   %eax, 0x10(%rdi)      ; +0x10 = the pre-increment value
//   0x117c02  movl   $0x1, %edi
//   0x117c07  callq  __Znwm                ; operator new(1)
//   0x117c16  callq  GLRenderer::GLRenderer(int, int)   ; with (0, 0)
//   0x117c1b  movq   %r14, (%rbx)          ; +0x00 = the new GLRenderer*
//
//   OZRenderManager {
//     +0x00  GLRenderer*        glRenderer   [ctor @0x117c1b; returned by
//                                             getGLRenderer @0x117d84]
//     +0x08  id<OZRenderClient> renderClient [zeroed by the ctor's 16-byte
//                                             store @0x117bed; read by
//                                             abort() @0x117d2c/@0x117d46 as
//                                             the receiver of an ObjC message;
//                                             written by setRenderClient
//                                             @0x117d90]
//     +0x10  uint32             uniqueID     [ctor @0x117bff; used by abort()
//                                             @0x117d57 as the render-job TAG
//                                             passed to
//                                             PGHGRenderQueue::CancelRenderJobsWithTag
//                                             @0x117d64 /
//                                             ::CancelQueuedRenderJobsWithTag
//                                             @0x117d6b]
//   }
//
// No vptr: the ctor's first write is the 16-byte zero at +0x00, immediately
// overwritten at +0x00 by the GLRenderer pointer, and nothing ever stores a
// vtable address.
//
// FRONTIER CALLEES — none for this unit. `getGLRenderer` is a leaf: no calls,
// no externs, no indirect or virtual dispatch.
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6.

/**
 * Opaque handle to `GLRenderer` — the OpenGL renderer object
 * `OZRenderManager`'s ctor allocates (`operator new(1)` @Ozone 0x117c07 then
 * `GLRenderer::GLRenderer(int, int)` @0x117c16 with both arguments zero,
 * @0x117c12/@0x117c14 `xorl %esi,%esi ; xorl %edx,%edx`).
 *
 * `GLRenderer` is an in-scope Ozone class (the ctor is a DIRECT call, not a
 * symbol stub) but it is not ported yet, and this unit never dereferences the
 * pointer — `getGLRenderer` only hands it back — so it is carried opaquely
 * rather than given invented fields.
 */
export interface GLRendererPtr {
  readonly __glRenderer: unique symbol;
}

export class OZRenderManager {
  /**
   * `+0x00  GLRenderer* glRenderer` — the scene's OpenGL renderer.
   *
   * Zeroed with the rest of +0x00..+0x0f by the ctor's
   * `movups %xmm0, (%rdi)` @Ozone 0x117bed, then immediately overwritten with
   * the freshly constructed renderer by `movq %r14, (%rbx)` @0x117c1b. `null`
   * models the pre-construction state; a real port of the ctor will install a
   * `GLRenderer` here.
   */
  glRendererAt0: GLRendererPtr | null = null;

  /**
   * `OZRenderManager::getGLRenderer()` — Ozone @0x00117d80
   * (mangled `__ZN15OZRenderManager13getGLRendererEv`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/__ZN15OZRenderManager13getGLRendererEv.s):
   *
   *   0x117d80  pushq %rbp               ; frame setup (no TS counterpart)
   *   0x117d81  movq  %rsp, %rbp         ; frame setup (no TS counterpart)
   *   0x117d84  movq  (%rdi), %rax       ; return *(GLRenderer**)(this + 0x00)
   *   0x117d87  popq  %rbp               ; frame teardown (no TS counterpart)
   *   0x117d88  retq                     ; return that pointer
   *   0x117d89  nopl  (%rax)             ; alignment padding, not executed
   *
   * `movq (%rdi), %rax` DEREFERENCES the object's first slot: it returns the
   * stored `GLRenderer*`, NOT the address of the field. (Contrast the
   * address-taking accessors elsewhere in this port, e.g.
   * `OZSceneList::getIterationMutex()` @0x81824 `leaq 0x8(%rdi), %rax` — an
   * embedded sub-object handed back by reference. Here the object is
   * heap-allocated by the ctor and only its pointer lives in the field.)
   *
   * There is no null check and no refcount/retain: the raw pointer is returned
   * exactly as stored, so a caller invoked before the ctor ran would observe
   * whatever the field holds (modelled as `null` here).
   *
   * Zero callees, zero externs, zero indirect calls.
   *
   * @returns the `GLRenderer*` stored at `this + 0x00`.
   */
  getGLRenderer(): GLRendererPtr | null {
    // @Ozone 0x117d84: movq (%rdi), %rax
    return this.glRendererAt0;
  }
}
