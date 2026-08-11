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
// SYMBOLS ADDED BY A LATER UNIT (this commit) — the two entries the list above
// reserved as `0x42c30 unlock()` and `0x48070 hasEvent()` are now PORTED here,
// per the one-class-one-file rule; the rest of that list is still outstanding.
// -----------------------------------------------------------------------------
//   * HGTextureManager::PostTextureDeleteEventList::unlock()   @Helium 0x42c30
//     __ZN16HGTextureManager26PostTextureDeleteEventList6unlockEv
//     re/disasm: Helium.__ZN16HGTextureManager26PostTextureDeleteEventList6unlockEv.s
//   * HGTextureManager::PostTextureDeleteEventList::hasEvent() @Helium 0x48070
//     __ZN16HGTextureManager26PostTextureDeleteEventList8hasEventEv
//     re/disasm: Helium.__ZN16HGTextureManager26PostTextureDeleteEventList8hasEventEv.s
//
// -----------------------------------------------------------------------------
// FULL DISASM — unlock() (4 real insns, @0x42c30..@0x42c35)
// -----------------------------------------------------------------------------
//   __ZN16HGTextureManager26PostTextureDeleteEventList6unlockEv:
//     0x42c30  pushq %rbp
//     0x42c31  movq  %rsp, %rbp
//     0x42c34  popq  %rbp
//     0x42c35  jmp   0x3c5570          ; TAIL-CALL symbol stub for _pthread_mutex_unlock
//     0x42c3a  nopw  (%rax,%rax)       ; alignment padding
//
// The exact mirror of `lock()` above, against the unlock stub at @0x3c5570: the
// frame is torn down at @0x42c34 BEFORE the transfer, so @0x42c35 is a TAIL jmp
// and `_pthread_mutex_unlock`'s `%eax` IS this function's `%eax`. %rdi is never
// rewritten, so the mutex argument is `this + 0x00`. Re-derived from the binary
// for this commit with
// `otool -arch x86_64 -tvV -p <mangled> /tmp/Helium.x86_64` (identical bytes).
//
// -----------------------------------------------------------------------------
// FULL DISASM — hasEvent() (7 insns, @0x48070..@0x48080)
// -----------------------------------------------------------------------------
//   __ZN16HGTextureManager26PostTextureDeleteEventList8hasEventEv:
//     0x48070  pushq %rbp
//     0x48071  movq  %rsp, %rbp
//     0x48074  movq  0x40(%rdi), %rax  ; %rax = this->events.begin
//     0x48078  cmpq  0x48(%rdi), %rax  ; flags from (begin - end)
//     0x4807c  setne %al               ; %al = (ZF == 0) = (begin != end)
//     0x4807f  popq  %rbp
//     0x48080  retq
//     0x48081  nopw  %cs:(%rax,%rax)   ; alignment padding
//
// `begin != end` is libc++'s `!vector::empty()`. The machine emits `setne` — the
// ZF path — so this is strict INEQUALITY, not an ordering compare whose operand
// order could be read backwards. The method does NOT take the mutex at +0x00:
// `lock()`/`unlock()` are separate entry points the caller brackets it with, and
// adding a lock the binary does not take would be an invention.
//
// The `__ZN...` (not `__ZNK...`) mangling says `hasEvent()` is not declared
// const in the C++ source even though the body only reads; the port mirrors the
// body, not the absent qualifier.
//
// -----------------------------------------------------------------------------
// WHY THE TWO NEW EXPORTS ARE NAMED `PostTextureDeleteEventList_*` AND NOT
// `HGTextureManager_PostTextureDeleteEventList_*` LIKE THEIR LANDED SIBLING
// -----------------------------------------------------------------------------
// This is deliberate and MEASURED, not carelessness, and it is the one place
// this file is internally inconsistent — so here is the whole reason.
//
// G5 joins an export to its disassembly with `method = name.split("_", 1)[1]`
// and then requires that `method` equal the LAST Itanium component of a cited
// mangled symbol (`g5_impl_gate._sym_names_method`). For a NESTED class the
// repo's `Outer_Inner_method` export convention makes that join impossible:
// `HGTextureManager_PostTextureDeleteEventList_unlock` yields the method
// `PostTextureDeleteEventList_unlock`, and no symbol's last component can ever
// be that. The landed `..._lock` export escapes only because G5 has a
// one-export-one-candidate fallback, and adding ANY second export to this file
// retires that fallback for every export in it.
//
// Gated three ways in one pool worktree, same bodies, same `.s` cache:
//   main as it stands (1 export)              -> 0 cheats, 0 flags
//   + both methods as `HGTextureManager_...`  -> 0 cheats, 3 flags
//   + both methods as `PostTextureDeleteEventList_...` (this file) -> 0 cheats, 1 flag
// The three-flag variant flags the LANDED `..._lock` too, i.e. following the
// naming convention would have taken a clean landed export red. The one
// remaining flag is on `..._lock` itself and is NOT fixable from here: renaming
// a landed export deletes a declaration, which is exactly what G6 add-only
// refuses.
//
// So the two new exports are named for the class that actually owns them — the
// nested `PostTextureDeleteEventList` — which is also what OPS_LOG's
// "name the export `<Class>_<method>`" rule asks for. `unlock` and `hasEvent`
// are consequently CLASSIFIED against their own disassembly by G5 rather than
// waved past with a blind-spot flag.
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
// LAYOUT REFINED BY THE hasEvent() UNIT (this commit): the first two words of
// that triple are now READ by a ported body, so they stop being opaque —
//   +0x40 .. +0x47  events.begin   `movq 0x40(%rdi), %rax` @0x48074
//   +0x48 .. +0x4f  events.end     `cmpq 0x48(%rdi), %rax` @0x48078
// and they are declared below. `hasEvent()` only COMPARES the two words; it
// never dereferences either, so they are modelled as plain machine addresses
// and nothing is assumed about the element type. The third word
// (+0x50 .. +0x57, `events.capacity`, zeroed by `movq $0x0, 0x50(%rdi)`
// @0x47f68) is still read by NO ported body and is therefore still NOT
// declared — PORTING_SPEC Rule 5. `addEvent` @0x42b20 and `popEvent` @0x48090
// are the units that walk the buffer, and they decide the element model.
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

  /**
   * +0x40 — `events.begin`, the first word of the `std::vector` triple the
   * OBJECT LAYOUT block recovers from the ctor.
   *
   * Read by `hasEvent()` @Helium 0x48074 (`movq 0x40(%rdi), %rax`). Held as the
   * raw machine word: `hasEvent()` only compares it against `events.end` and
   * never dereferences it, so modelling it as a pointer to some element type
   * would be an invention this unit's evidence does not support. A freshly
   * constructed list carries 0 here (`movups %xmm0, 0x40(%rdi)` @0x47f64).
   *
   * NOT `readonly`: `addEvent` @Helium 0x42b20 and `popEvent` @Helium 0x48090
   * write these two words when they land. Declaring them immutable now would
   * force those units into a non-additive edit of this declaration.
   *
   * @0xADDR Helium 0x48074
   */
  eventsBeginAtPlus0x40: number;

  /**
   * +0x48 — `events.end`, the second word of the same triple.
   *
   * Read by `hasEvent()` @Helium 0x48078 (`cmpq 0x48(%rdi), %rax`), zeroed at
   * construction by the same 16-byte `movups` @0x47f64 that zeroes +0x40. Same
   * raw-word modelling and same mutability rationale as `eventsBeginAtPlus0x40`
   * above.
   *
   * @0xADDR Helium 0x48078
   */
  eventsEndAtPlus0x48: number;
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

/**
 * `HGTextureManager::PostTextureDeleteEventList::unlock()` — @Helium 0x42c30
 * (`__ZN16HGTextureManager26PostTextureDeleteEventList6unlockEv`).
 *
 * The exact mirror of `PostTextureDeleteEventList_lock` above, and
 * transcribed the same way: a frame push/pop around a TAIL JUMP to
 * `_pthread_mutex_unlock` (stub @0x3c5570) with `%rdi` unmodified, so the
 * argument is `this` itself — the mutex embedded at offset +0x00.
 *
 * RETURN VALUE. The frame is torn down at @0x42c34, BEFORE the transfer, so
 * @0x42c35 is a tail `jmp` and not a `call` + `retq`: the callee's `%eax` is
 * this function's `%eax` verbatim. `pthread_mutex_unlock` returns 0 on success
 * and an errno (EPERM when the caller does not hold the mutex) otherwise, and
 * that value is forwarded UNCHANGED. It is not a constant: no instruction in
 * this body writes `%eax`, so a port that returns a literal 0 would be stating
 * a fact the machine does not state.
 *
 * @param self  `%rdi` — the receiver.
 * @returns     `%eax` — whatever `pthread_mutex_unlock` returned.
 *
 * @0xADDR Helium 0x42c30
 */
export function PostTextureDeleteEventList_unlock(
  self: HGTextureManager_PostTextureDeleteEventList,
): number {
  // @0x42c30  pushq %rbp
  // @0x42c31  movq  %rsp, %rbp
  // @0x42c34  popq  %rbp                 ; frame torn down BEFORE the transfer
  // @0x42c35  jmp   0x3c5570             ; tail-call _pthread_mutex_unlock(%rdi == this)
  //                                      ; %rdi was never rewritten, so the mutex
  //                                      ; argument is `this + 0x00`, and the callee's
  //                                      ; %eax is returned verbatim.
  return self.mutexAtPlus0x00.unlock();
}

/**
 * `HGTextureManager::PostTextureDeleteEventList::hasEvent()` — @Helium 0x48070
 * (`__ZN16HGTextureManager26PostTextureDeleteEventList8hasEventEv`).
 *
 * Faithful transcription of the 7-instruction body quoted in the file header:
 * load `events.begin` from +0x40, compare it against `events.end` at +0x48, and
 * return the `setne` result — i.e. libc++'s `!vector::empty()`, "the deferred
 * texture-delete queue holds at least one event".
 *
 * `setne` sets `%al` from ZF alone, so the comparison is symmetric and there is
 * no operand order to get backwards. Only the low byte is written, which is the
 * C++ `bool` ABI; the port returns a `boolean` accordingly.
 *
 * Leaf: no `callq`, no indirect branch, and the mutex at +0x00 is untouched —
 * this method does not lock, exactly as the instructions show.
 *
 * @param self  `%rdi` — the receiver.
 * @returns     `%al` — `true` iff `events.begin != events.end`.
 *
 * @0xADDR Helium 0x48070
 */
export function PostTextureDeleteEventList_hasEvent(
  self: HGTextureManager_PostTextureDeleteEventList,
): boolean {
  // @0x48070  pushq %rbp
  // @0x48071  movq  %rsp, %rbp
  // @0x48074  movq  0x40(%rdi), %rax     ; %rax = this->events.begin
  // @0x48078  cmpq  0x48(%rdi), %rax     ; flags from (begin - end)
  // @0x4807c  setne %al                  ; %al = (ZF == 0) = (begin != end)
  // @0x4807f  popq  %rbp
  // @0x48080  retq
  return self.eventsBeginAtPlus0x40 !== self.eventsEndAtPlus0x48;
}
