// HGTextureManager__PostTextureDeleteEventList.ts — FCP Helium's nested class
// `HGTextureManager::PostTextureDeleteEventList` (render layer).
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// The file is named `Outer__Nested` per the repo's nested-class convention
// (cf. PCEvictionHeap__ColorSpaceRefCache.ts, PCDelaunay__Triangle.ts). It holds
// exactly ONE FCP class — the nested `PostTextureDeleteEventList` — and NOT
// `HGTextureManager::TextureUsage`, which owns raw-port/src/render/HGTextureManager.ts.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this commit)
// -----------------------------------------------------------------------------
//   * HGTextureManager::PostTextureDeleteEventList::lock()   @Helium 0x42b10
//     __ZN16HGTextureManager26PostTextureDeleteEventList4lockEv
//     re/disasm: Helium.__ZN16HGTextureManager26PostTextureDeleteEventList4lockEv.s
//
// Sibling methods of the same class (from `nm -arch x86_64 -n Helium`) are
// SEPARATE ledger units and are deliberately NOT written here:
//   0x42b20 addEvent(void*)   0x42c30 unlock()    0x47f50 C2   0x47fa0 C1
//   0x47ff0 D2                0x48030 D1          0x48070 hasEvent()  0x48090 popEvent()
//
// -----------------------------------------------------------------------------
// FULL DISASM — lock() (6 lines, @0x42b10..@0x42b1a)
// -----------------------------------------------------------------------------
//   __ZN16HGTextureManager26PostTextureDeleteEventList4lockEv:
//     0x42b10  pushq %rbp
//     0x42b11  movq  %rsp, %rbp
//     0x42b14  popq  %rbp
//     0x42b15  jmp   0x3c556a          ; TAIL-CALL symbol stub for _pthread_mutex_lock
//     0x42b1a  nopw  (%rax,%rax)       ; alignment padding
//
// The whole body is a frame push/pop around a TAIL JUMP. %rdi is never touched,
// so `pthread_mutex_lock` receives `this` UNCHANGED — i.e. the mutex sits at
// offset +0x00 of PostTextureDeleteEventList, with no `leaq <disp>(%rdi)` fixup
// (contrast the sibling TextureDeleteQueueLock @0x43da7, whose mutex is at +0x80
// and which therefore DOES emit a leaq — see src/channels/TextureDeleteQueueLock.ts).
//
// RETURN VALUE: the Itanium mangling `...4lockEv` does not encode a return type,
// and this body has exactly one exit — the tail `jmp`. A tail jump makes the
// callee's %eax the caller's %eax verbatim, so whatever `pthread_mutex_lock`
// returns (0 on success, an errno on failure) IS what `lock()` returns. That is
// the machine fact, so it is what this port surfaces; a C++ declaration of
// `void lock()` would produce the identical instruction stream and simply leave
// callers ignoring the value. Nothing is invented either way.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT — mutex at +0x00 (grounded on the ctor, not assumed)
// -----------------------------------------------------------------------------
// The base-object constructor
// `HGTextureManager::PostTextureDeleteEventList::PostTextureDeleteEventList()`
// @Helium 0x47f50 (__ZN16HGTextureManager26PostTextureDeleteEventListC2Ev) pins
// both the mutex offset and the mutex's extent:
//
//     0x47f5a  movq   %rdi, %rbx              ; rbx = this
//     0x47f5d  leaq   0x40(%rdi), %r15        ; r15 = &this[+0x40]
//     0x47f61  xorps  %xmm0, %xmm0
//     0x47f64  movups %xmm0, 0x40(%rdi)       ; zero this[+0x40 .. +0x4f]
//     0x47f68  movq   $0x0, 0x50(%rdi)        ; zero this[+0x50 .. +0x57]
//     0x47f70  xorl   %esi, %esi              ; arg1 = attr = NULL
//     0x47f72  callq  0x3c5564                ; _pthread_mutex_init(this, NULL)
//                                             ;   %rdi STILL == this  =>  mutex @ +0x00
//     ... unwind path:
//     0x47f85  movq   (%r15), %rdi            ; load this[+0x40]
//     0x47f88  testq  %rdi, %rdi
//     0x47f8b  je     0x47f96
//     0x47f8d  movq   %rdi, 0x48(%rbx)
//     0x47f91  callq  0x3c4fa0                ; operator delete(void*)  (__ZdlPv)
//
// So:
//   +0x00 .. +0x3f  pthread_mutex_t mutex   — `pthread_mutex_init(this, NULL)`
//                     @0x47f72 proves the offset; the next initialised member
//                     starting at +0x40 pins the extent at 0x40 bytes, which is
//                     exactly sizeof(pthread_mutex_t) on macOS x86_64.
//   +0x40 .. +0x57  the event list itself — a three-word begin/end/capacity
//                     triple zeroed by the ctor (16 bytes @0x47f64 + 8 @0x47f68)
//                     and freed through `operator delete` on the +0x40 word in
//                     the ctor's unwind path @0x47f85..0x47f91: the standard
//                     std::vector<void*> shape (addEvent takes a `void*`).
//                     Left OPAQUE here — `lock()` never touches it, and its
//                     field semantics belong to the addEvent/popEvent/hasEvent
//                     ledger units.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// One, and it is a TRUE OUT-OF-SCOPE extern: `_pthread_mutex_lock`, reached
// through the __TEXT symbol stub at @Helium 0x3c556a (tail-jmp @0x42b15). It is
// a `U` undefined symbol in Helium's symbol table (libSystem/pthread), not
// Helium/ProCore/ProChannel/Ozone/Flexo code. Following the landed precedent in
// src/channels/TextureDeleteQueueLock.ts, the mutex is modelled as an opaque
// handle exposing `lock()`/`unlock()` rather than being thrown — a throw would
// make this function's only effect unreachable.
//
// No in-scope callee. No indirect/virtual call: the single control transfer is
// the direct `jmp` to the pthread stub, and the class has no vtable slot load in
// any of its nine bodies.

/**
 * The `pthread_mutex_t` embedded at offset +0x00 of
 * `HGTextureManager::PostTextureDeleteEventList`, modelled as an opaque handle
 * (the same shape src/channels/TextureDeleteQueueLock.ts uses for the mutex it
 * locks). Its native 0x40-byte layout is never read field-wise by any body in
 * this class — only its ADDRESS is passed to the pthread entry points — so no
 * byte-level layout is invented here.
 *
 * @0xADDR Helium 0x47f72  (`_pthread_mutex_init(this, NULL)` — pins it to +0x00)
 */
export interface PthreadMutex {
  /**
   * Native `pthread_mutex_lock(mutex)`. Returns 0 on success or an errno.
   * @0xADDR Helium 0x3c556a  (__TEXT symbol stub for _pthread_mutex_lock)
   */
  lock(): number;
  /**
   * Native `pthread_mutex_unlock(mutex)`. Present because the class's
   * `unlock()` @Helium 0x42c30 is the exact mirror of `lock()` and reaches the
   * stub at 0x3c5570; that method is its own ledger unit and is not ported here.
   * @0xADDR Helium 0x3c5570  (__TEXT symbol stub for _pthread_mutex_unlock)
   */
  unlock(): number;
}

/**
 * `HGTextureManager::PostTextureDeleteEventList` — the receiver of `lock()`.
 *
 * Only the members this file's transcribed body actually reaches are declared.
 * The event-list storage at +0x40..+0x57 (see the OBJECT LAYOUT block in the
 * file header) is intentionally absent: `lock()` never touches it, and inventing
 * fields for bytes no ported body reads would be ungrounded.
 *
 * @0xADDR Helium 0x47f50  (C2 ctor — the layout evidence)
 */
export interface HGTextureManager_PostTextureDeleteEventList {
  /**
   * +0x00 — the `pthread_mutex_t` guarding the event list.
   *
   * Offset proven by the ctor @Helium 0x47f72: `pthread_mutex_init` is called
   * with `%rdi` still holding `this` (no `leaq` fixup between 0x47f5a and the
   * call), and by `lock()` itself @Helium 0x42b15, which tail-jumps to
   * `_pthread_mutex_lock` with `%rdi` likewise untouched.
   *
   * @0xADDR Helium 0x42b15
   */
  readonly mutexAtPlus0x00: PthreadMutex;
}

/**
 * `HGTextureManager::PostTextureDeleteEventList::lock()` — @Helium 0x42b10
 * (`__ZN16HGTextureManager26PostTextureDeleteEventList4lockEv`).
 *
 * Faithful line-for-line transcription of the 6-line body quoted in the file
 * header: a frame push/pop around a TAIL JUMP to `_pthread_mutex_lock` with
 * `%rdi` unmodified, so the argument is `this` itself — the mutex embedded at
 * offset +0x00.
 *
 * Because the transfer is a tail `jmp` (not a `call` + `retq`), the callee's
 * `%eax` is this function's `%eax`; the pthread result is therefore returned
 * verbatim. See the RETURN VALUE note in the file header.
 *
 * @param self  `%rdi` — the receiver.
 * @returns     `%eax` — whatever `pthread_mutex_lock` returned (0 on success).
 *
 * @0xADDR Helium 0x42b10
 */
export function HGTextureManager_PostTextureDeleteEventList_lock(
  self: HGTextureManager_PostTextureDeleteEventList,
): number {
  // @0x42b10  pushq %rbp
  // @0x42b11  movq  %rsp, %rbp
  // @0x42b14  popq  %rbp                 ; frame torn down BEFORE the transfer
  // @0x42b15  jmp   0x3c556a             ; tail-call _pthread_mutex_lock(%rdi == this)
  //                                      ; %rdi was never rewritten, so the mutex
  //                                      ; argument is `this + 0x00`.
  return self.mutexAtPlus0x00.lock();
}
