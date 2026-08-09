// FFPlayerThreadStateManager — Flexo.framework helper that tracks the player thread's
// lifecycle state as an int32 stored at (this+0x90). This file transcribes the single
// predicate method `hasShutdownBeenRequested()`, which reports whether the recorded state
// has reached the "shutdown requested" threshold (state >= 0x64 = 100).
//
// A sibling method of this same class, `playerThreadOnly()` @0x57c860 (an empty 5-byte
// body), is documented in FFPlayerLockable.ts where it happens to be ICF-folded onto that
// class' hook stubs — see that file. Only hasShutdownBeenRequested() is decoded here.
//
// Provenance framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly: raw-port/re/disasm/Flexo.__ZN26FFPlayerThreadStateManager24hasShutdownBeenRequestedEv.s
//
// hasShutdownBeenRequested() body (9 lines):
//   0xdbb520 pushq %rbp
//   0xdbb521 movq  %rsp,%rbp
//   0xdbb524 movl  0x90(%rdi),%eax   ; eax = *(int32*)(this + 0x90)   — the thread state
//   0xdbb52a cmpl  $0x64,%eax        ; flags = eax - 0x64             (AT&T: dst - src = state - 100)
//   0xdbb52d setge %al              ; al = (state >= 100) ? 1 : 0     (signed SF==OF)
//   0xdbb530 popq  %rbp
//   0xdbb531 retq
//
// FAITHFUL PORT — the @0x90 field is modelled as a typed struct field; the compare is
// transcribed with the AT&T dst-src ordering (setge => signed state >= 0x64).

/**
 * FFPlayerThreadStateManager — only the fields touched by the decoded method(s) are modelled.
 *   +0x90  int32  state   — the player-thread lifecycle state. hasShutdownBeenRequested()
 *                           treats state >= 0x64 (100) as "shutdown has been requested".
 */
export interface FFPlayerThreadStateManager {
  /** +0x90 int32 lifecycle state (read at @0xdbb524). */
  state: number;
}

/**
 * Threshold at/above which the player thread is considered to have been asked to shut down.
 * Read directly from the `cmpl $0x64,%eax` immediate @0xdbb52a.
 */
export const FF_PLAYER_THREAD_SHUTDOWN_REQUESTED_STATE = 0x64; // @Flexo 0xdbb52a  (== 100)

/**
 * FFPlayerThreadStateManager::hasShutdownBeenRequested()
 * @Flexo 0xdbb520  __ZN26FFPlayerThreadStateManager24hasShutdownBeenRequestedEv
 *
 * Reads the int32 state at this+0x90 and returns whether it is >= 0x64 (signed compare, `setge`).
 */
export function FFPlayerThreadStateManager_hasShutdownBeenRequested(
  self: FFPlayerThreadStateManager,
): boolean {
  // @0xdbb524 movl 0x90(%rdi),%eax — load the int32 state (respect signed 32-bit width).
  const state = self.state | 0;
  // @0xdbb52a cmpl $0x64,%eax ; @0xdbb52d setge %al — flags on (state - 0x64); setge => state >= 0x64
  // (signed). Return the boolean the low byte of %al carries.
  return state >= FF_PLAYER_THREAD_SHUTDOWN_REQUESTED_STATE;
}
