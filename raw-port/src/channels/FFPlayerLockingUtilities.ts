// FFPlayerLockingUtilities.ts — namespace of static "lock-order check" callbacks. All three
// functions are compiled as ***empty no-op stubs*** in the shipping Flexo binary. Verbatim from:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Full disasm of the three symbols (each is 4-6 bytes of function body then padding):
//
//   @Flexo 0x0000000000d76770  FFPlayerLockingUtilities::checkLockOrderForPlayerThreadStateLock(bool, void const*)
//     0xd76770 pushq %rbp
//     0xd76771 movq  %rsp, %rbp
//     0xd76774 popq  %rbp
//     0xd76775 retq
//     0xd76776 nopw  %cs:(%rax,%rax)          ; alignment padding
//
//   @Flexo 0x0000000000da8100  FFPlayerLockingUtilities::FlushPushLockCheckFunc(bool, void const*)
//     0xda8100 pushq %rbp
//     0xda8101 movq  %rsp, %rbp
//     0xda8104 popq  %rbp
//     0xda8105 retq
//     0xda8106 nopw  %cs:(%rax,%rax)          ; alignment padding
//
//   @Flexo 0x0000000000da8110  FFPlayerLockingUtilities::CachedPropsLockCheckFunc(bool, void const*)
//     0xda8110 pushq %rbp
//     0xda8111 movq  %rsp, %rbp
//     0xda8114 popq  %rbp
//     0xda8115 retq
//     ... (padding follows)
//
// Every one of them is a canonical Itanium-ABI empty function body: prologue that establishes the
// frame pointer, no work, epilogue, return. There is NO branching, NO memory access, NO callq.
// The `bool` (%dil / %sil) and `void const*` (%rsi / %rdx) arguments are simply IGNORED — they
// are never read after the frame is set up.
//
// SEMANTIC CONTEXT (recovered from callers):
//   - FFSynchronizable::FFSynchronizable(void (*checker)(bool, void const*), void const* userdata)
//     stores a "lock-order checker" function pointer + userdata into an FFSynchronizable so that
//     future lock/unlock operations can call back to validate the caller's lock-acquisition order.
//   - -[FFPlayer initWithMode:] (@Flexo 0xd76780) constructs one FFSynchronizable for the
//     "flush-push" lock with `FlushPushLockCheckFunc` as its checker (@0xd76911..0xd7691e), and
//     another for the "cached-props" lock with `CachedPropsLockCheckFunc` (@0xd76937..0xd76944).
//     Both pass `%rbx = FFPlayer*` as userdata.
//   - checkLockOrderForPlayerThreadStateLock is called from unseen code paths that hold the
//     player-thread-state lock; its `bool` arg is almost certainly "acquiring" (true) vs
//     "releasing" (false), matching the FFSynchronizable checker signature.
//
// Since the SHIPPED binary compiles all three to no-ops, this is a DEBUG-BUILD ONLY facility that
// was stripped. Faithful port: the three functions must be present with the exact `(bool, void
// const*) -> void` signature, and must do nothing.  Any lock-order validation logic that once
// lived here is NOT recoverable from the binary — it's not there. Attempting to write "what the
// check probably did" would be a Rule-3 violation (invention).

/**
 * Namespace class matching FCP's `class FFPlayerLockingUtilities` — the class exists only as a
 * scoping shell for these three static methods; it has no instance state, no vtable, no ctor,
 * no dtor. All members are static.
 */
export class FFPlayerLockingUtilities {
  /**
   * @Flexo 0xd76770  FFPlayerLockingUtilities::checkLockOrderForPlayerThreadStateLock(bool, void const*)
   *
   * Empty no-op. See file header for full disasm and rationale.
   * Signature preserved so callers (unseen — none in Flexo's exported call graph) get the
   * correct static-linker fixup shape.
   */
  static checkLockOrderForPlayerThreadStateLock(_acquiring: boolean, _userdata: unknown): void {
    // @0xd76770 pushq %rbp
    // @0xd76771 movq  %rsp, %rbp
    // @0xd76774 popq  %rbp
    // @0xd76775 retq   — return, nothing to do.
    return;
  }

  /**
   * @Flexo 0xda8100  FFPlayerLockingUtilities::FlushPushLockCheckFunc(bool, void const*)
   *
   * Empty no-op.  Registered as an FFSynchronizable checker for FFPlayer's flush-push lock
   * (installed by -[FFPlayer initWithMode:] @0xd76911..0xd7691e via
   *   FFSynchronizable::FFSynchronizable(&FFPlayerLockingUtilities::FlushPushLockCheckFunc, player)
   * ). The shipped binary compiles this to a no-op — no invention permitted.
   */
  static FlushPushLockCheckFunc(_acquiring: boolean, _userdata: unknown): void {
    // @0xda8100 pushq %rbp
    // @0xda8101 movq  %rsp, %rbp
    // @0xda8104 popq  %rbp
    // @0xda8105 retq
    return;
  }

  /**
   * @Flexo 0xda8110  FFPlayerLockingUtilities::CachedPropsLockCheckFunc(bool, void const*)
   *
   * Empty no-op.  Registered as an FFSynchronizable checker for FFPlayer's cached-props lock
   * (installed by -[FFPlayer initWithMode:] @0xd76937..0xd76944).  The shipped binary compiles
   * this to a no-op — no invention permitted.
   */
  static CachedPropsLockCheckFunc(_acquiring: boolean, _userdata: unknown): void {
    // @0xda8110 pushq %rbp
    // @0xda8111 movq  %rsp, %rbp
    // @0xda8114 popq  %rbp
    // @0xda8115 retq
    return;
  }
}
