// raw-port/src/render/HGMetalTexture.ts
//
// FCP `HGMetalTexture` — Helium's Metal-backed texture object. It owns an `id<MTLTexture>`
// plus the synchronization state that lets a caller block until an in-flight asynchronous
// blit/copy into the texture has completed.
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//                   Versions/A/Helium (macOS FCP, x86_64 slice; VA == offset in the thin slice).
//
// THIS FILE PORTS ONE METHOD (one C++ method = one exported function citing its @0xADDR):
//
//   @Helium 0x182fe0  HGMetalTexture::WaitForCopy()
//                     mangled: __ZN14HGMetalTexture11WaitForCopyEv
//                     DECODE:  raw-port/re/disasm/Helium.__ZN14HGMetalTexture11WaitForCopyEv.s
//
// The class's other members — the ctors @0x182b90 / @0x182c90 (HGMTLDeviceType, HGRect,
// HGFormat) and @0x182db0 (HGRect, HGMetalTexture*), the dtors @0x182ec0 / …,
// MarkForCopy(bool) @0x1830e0, IsReady() @0x183130,
// ReplaceManagedTextureData(HGBitmap*, HGRect, bool) @0x183560 and its completion block
// @0x183820 — are NOT ported here. This file is ADD-ONLY: each lands as its own exported
// function when its unit is claimed.
//
// ── FIELD-LAYOUT EVIDENCE ───────────────────────────────────────────────────────────────
//   +0xb3  bool  copyPending  — "an asynchronous copy into this texture is outstanding".
//          Evidence, exhaustive over the whole Helium slice (every `0xb3(<this>)` access on an
//          HGMetalTexture):
//            MarkForCopy(bool)              @0x1830fe  `movb %bl, 0xb3(%r14)`     (writer)
//            ReplaceManagedTextureData      @0x1835ba  `movb $0x1, 0xb3(%r14)`    (set on submit)
//            …_block_invoke (its completion
//             handler)                      @0x18384a  `movb $0x0, 0xb3(%rbx)`    (clear on done)
//            IsReady()                      @0x183149  `movzbl 0xb3(%rbx), %ebx`  (reader)
//            ~HGMetalTexture (D2)           @0x182ef3  `cmpb $0x1, 0xb3(%rbx)`
//                                           @0x182f1b  `cmpb $0x0, 0xb3(%rbx)`    (same wait
//                                                                                  shape as here)
//            WaitForCopy()                  @0x183004 / @0x18302b                 (this method)
//          Initial value 0: the ctor's `movl $0x1, 0xb0(%rbx)` @0x182bce is a 4-byte store
//          covering +0xb0..+0xb3, leaving 1 at +0xb0 and 0 at +0xb3; the next slot the ctor
//          initializes is the mutex at +0xb8.
//   +0xb8  std::__1::mutex               — inline sub-object. The ctor stores libc++'s
//          initializer `movq $0x32aaaba7, 0xb8(%rbx)` @0x182bd8 and the dtor destroys it
//          through `leaq 0xb8(%rbx), %r15` @0x182c33 → `std::__1::mutex::~mutex()` @0x182c68.
//   +0xf8  std::__1::condition_variable  — inline sub-object. Ctor
//          `movq $0x3cb0b1bb, 0xf8(%rbx)` @0x182c03; dtor `leaq 0xf8(%rbx), %r12` @0x182c3a →
//          `std::__1::condition_variable::~condition_variable()` @0x182c60.
//
// ── OUT-OF-SCOPE EXTERNS (libc++ — NOT in-scope FCP symbols) ────────────────────────────
//   std::__1::mutex::lock()                                        @0x182fff (stub 0x3c4f16)
//   std::__1::condition_variable::wait(std::unique_lock<std::mutex>&)
//                                                                  @0x183026 (stub 0x3c4ef2)
//   std::__1::mutex::unlock()                                      @0x18303e (stub 0x3c4f1c)
// They are injected through {@link StdSyncOps} rather than transcribed — identical treatment
// to the landed HGMetalHandler chunk m4 (`_waitForCommandBuffers` @0x15e500), which crosses the
// same libc++ boundary. Nothing in this method is an in-scope FCP callee, and there is no
// indirect/virtual call anywhere in the body.
//
// NUMERICS: none — the method is pure control flow over one byte-wide flag.

/**
 * Opaque `HGMetalTexture` receiver. Field access is routed through
 * {@link HGMetalTextureWaitFields} so this unit type-checks without a full struct-layout port
 * of the class (the object is ≥ 0x100 bytes and most of it is undecoded here).
 */
export type HGMetalTexture = { readonly __brand: "HGMetalTexture" };

/** Opaque `std::__1::mutex` living inline at `this+0xb8`. */
export type StdMutex = { readonly __brand: "StdMutex" };

/** Opaque `std::__1::condition_variable` living inline at `this+0xf8`. */
export type StdConditionVariable = { readonly __brand: "StdConditionVariable" };

/**
 * The on-stack `std::unique_lock<std::mutex>` the method builds at -0x28(%rbp)..-0x20(%rbp):
 *   -0x28(%rbp)  `mutex*` = this+0xb8   (`addq $0xb8,%rdi` @0x182ff0, parked @0x182ff7)
 *   -0x20(%rbp)  `bool owns` = true     (`movb $0x1,-0x20(%rbp)` @0x182ffb)
 * `%r15 = &(-0x28(%rbp))` @0x183014 is the `unique_lock&` argument handed to
 * `condition_variable::wait`.
 */
export interface StdUniqueLock {
  /** -0x28(%rbp) — the owned mutex (= this+0xb8). */
  mutex: StdMutex;
  /** -0x20(%rbp) — the ownership flag, re-tested by the inlined ~unique_lock @0x183034. */
  owns: boolean;
}

/**
 * Field-access surface for the slots this method touches.
 */
export interface HGMetalTextureWaitFields {
  /**
   * +0xb3 (bool) — `copyPending`. Loaded @0x183004 (`cmpb $0x1, 0xb3(%rbx)`) and again after
   * every wake @0x18302b (`cmpb $0x0, 0xb3(%rbx)`). Returned as the raw byte so the two
   * DIFFERENT comparisons the machine performs (== 1 on entry, != 0 in the loop) can be
   * transcribed literally rather than collapsed into one boolean test.
   */
  get_copyPending(self: HGMetalTexture): number;
  /** +0xb8 — the inline std::mutex (`addq $0xb8, %rdi` @0x182ff0). */
  get_mutex(self: HGMetalTexture): StdMutex;
  /** +0xf8 — the inline std::condition_variable (`leaq 0xf8(%rbx), %r14` @0x18300d). */
  get_condition_variable(self: HGMetalTexture): StdConditionVariable;
}

/**
 * The libc++ threading boundary used by this method. Each member is one `symbol stub for:`
 * line in the disassembly, cited to the call site that enters it.
 */
export interface StdSyncOps {
  /** `std::__1::mutex::lock()` — called @Helium 0x182fff (stub 0x3c4f16). */
  mutex_lock(m: StdMutex): void;
  /** `std::__1::mutex::unlock()` — called @Helium 0x18303e (stub 0x3c4f1c). */
  mutex_unlock(m: StdMutex): void;
  /**
   * `std::__1::condition_variable::wait(std::unique_lock<std::mutex>&)` — called
   * @Helium 0x183026 (stub 0x3c4ef2). Returns having re-acquired `lock`'s mutex; an
   * un-predicated (spurious-wakeup-prone) wait, which is exactly why the caller re-tests the
   * flag afterwards.
   */
  condition_variable_wait(cv: StdConditionVariable, lock: StdUniqueLock): void;
}

/**
 * `HGMetalTexture::WaitForCopy()` @Helium 0x182fe0
 * (mangled `__ZN14HGMetalTexture11WaitForCopyEv`).
 *
 * Blocks the calling thread until the texture's outstanding asynchronous copy has completed,
 * i.e. until the `copyPending` byte at +0xb3 reads 0.
 *
 * Full body — every instruction of the function, in order
 * (raw-port/re/disasm/Helium.__ZN14HGMetalTexture11WaitForCopyEv.s):
 *
 *   0x182fe0  pushq %rbp                    ; prologue (no TS counterpart)
 *   0x182fe1  movq  %rsp, %rbp
 *   0x182fe4  pushq %r15
 *   0x182fe6  pushq %r14
 *   0x182fe8  pushq %rbx
 *   0x182fe9  subq  $0x18, %rsp             ; stack for the unique_lock
 *   0x182fed  movq  %rdi, %rbx              ; rbx = this
 *   0x182ff0  addq  $0xb8, %rdi             ; rdi = &this->mutex
 *   0x182ff7  movq  %rdi, -0x28(%rbp)       ; unique_lock.mutex = &this->mutex
 *   0x182ffb  movb  $0x1, -0x20(%rbp)       ; unique_lock.owns  = true
 *   0x182fff  callq std::__1::mutex::lock() ; LOCK (stub 0x3c4f16)
 *   0x183004  cmpb  $0x1, 0xb3(%rbx)        ; copyPending == 1 ?
 *   0x18300b  jne   0x18303a                ; NO  -> straight to the unlock, skipping the loop
 *   0x18300d  leaq  0xf8(%rbx), %r14        ; r14 = &this->cv
 *   0x183014  leaq  -0x28(%rbp), %r15       ; r15 = &unique_lock
 *   0x183018  nopl  (%rax,%rax)             ; loop-head alignment padding, not executed
 *   0x183020  movq  %r14, %rdi              ; \  loop body:
 *   0x183023  movq  %r15, %rsi              ;  |
 *   0x183026  callq condition_variable::wait(unique_lock&)   ; WAIT (stub 0x3c4ef2)
 *   0x18302b  cmpb  $0x0, 0xb3(%rbx)        ;  | copyPending == 0 ?
 *   0x183032  jne   0x183020                ; /  NO -> wait again
 *   0x183034  cmpb  $0x1, -0x20(%rbp)       ; ~unique_lock: owns == 1 ?
 *   0x183038  jne   0x183043                ; no -> skip the unlock
 *   0x18303a  movq  -0x28(%rbp), %rdi       ; rdi = unique_lock.mutex
 *   0x18303e  callq std::__1::mutex::unlock() ; UNLOCK (stub 0x3c4f1c)
 *   0x183043  addq  $0x18, %rsp             ; epilogue
 *   0x183047  popq %rbx ; popq %r14 ; popq %r15 ; popq %rbp ; retq   (void)
 *   0x18304e  nop                           ; alignment padding, not executed
 *
 * Two details that a paraphrase would lose, and that are transcribed literally below:
 *
 *  1. **The entry test and the loop test are DIFFERENT comparisons.** Entry is
 *     `cmpb $0x1` / `jne` @0x183004 — the loop is entered only when the byte is EXACTLY 1.
 *     The loop's re-test is `cmpb $0x0` / `jne` @0x18302b — it keeps waiting while the byte is
 *     ANYTHING NON-ZERO. For the 0/1 values MarkForCopy @0x1830fe and the copy-completion
 *     block @0x18384a actually store these agree, but they are not the same predicate and the
 *     port does not merge them.
 *  2. **The `jne` at @0x18300b jumps PAST the `owns` check**, straight to the unlock at
 *     @0x18303a. So on the no-wait path the mutex is unlocked unconditionally, whereas the
 *     post-loop path first re-tests `unique_lock.owns` @0x183034 (the inlined
 *     `~unique_lock`). Nothing in this frame ever clears `owns`, so both paths unlock in
 *     practice — but the two code paths are distinct and are written out as such.
 *
 * @param ops   the libc++ mutex/condition_variable boundary (see {@link StdSyncOps}).
 * @param f     field accessors for the receiver (see {@link HGMetalTextureWaitFields}).
 * @param self  the receiver (`%rdi`).
 */
export function hgMetalTexture_WaitForCopy(
  ops: StdSyncOps,
  f: HGMetalTextureWaitFields,
  self: HGMetalTexture,
): void {
  // @0x182ff0/@0x182ff7/@0x182ffb: build the on-stack unique_lock over this->mutex.
  const lock: StdUniqueLock = { mutex: f.get_mutex(self), owns: true };
  // @0x182fff: std::mutex::lock()
  ops.mutex_lock(lock.mutex);

  // @0x183004-0x18300b: cmpb $0x1, 0xb3(%rbx) ; jne 0x18303a
  if (f.get_copyPending(self) === 1) {
    // @0x18300d: r14 = &this->cv   (loaded once, outside the loop, as the machine does)
    const cv = f.get_condition_variable(self);
    // @0x183014: r15 = &unique_lock
    for (;;) {
      // @0x183020-0x183026: condition_variable::wait(cv, unique_lock&)
      ops.condition_variable_wait(cv, lock);
      // @0x18302b-0x183032: cmpb $0x0, 0xb3(%rbx) ; jne 0x183020 (loop while != 0)
      if (f.get_copyPending(self) === 0) {
        break;
      }
    }
    // @0x183034-0x183038: ~unique_lock — cmpb $0x1,-0x20(%rbp) ; jne 0x183043
    if (lock.owns) {
      // @0x18303a-0x18303e: std::mutex::unlock()
      ops.mutex_unlock(lock.mutex);
    }
    // @0x183043: epilogue, void return.
    return;
  }

  // @0x18303a-0x18303e: the `jne` target — unlock WITHOUT re-testing `owns`.
  ops.mutex_unlock(lock.mutex);
  // @0x183043: epilogue, void return.
}
