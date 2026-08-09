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
  /** +0x90 int32 lifecycle state (read at @0xdbb524; swapped at @0xdbb4fa). */
  state: number;
  /**
   * +0x40 — embedded pthread_cond_t broadcast on every state change.
   * setStateInternal() (@0xdbb4b0) hands its address (self+0x40) to
   * `_pthread_cond_broadcast` at @0xdbb50c. Opaque bytes from this port's POV;
   * OPTIONAL because hasShutdownBeenRequested() does not touch it. Recovered
   * from the `addq $0x40,%rdi` @0xdbb500.
   */
  cond?: unknown;
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

// =============================================================================
// setStateInternal — the state-transition mutator.
//   0x0000000000dbb4b0  FFPlayerThreadStateManager::setStateInternal(
//                          FFPlayerThreadStateValue state, bool, void*,
//                          unsigned long long, NSString*)
//   Mangled:
//     __ZN26FFPlayerThreadStateManager16setStateInternalE24FFPlayerThreadStateValuebPvyP8NSString
//   Source disasm:
//     raw-port/re/disasm/Flexo.__ZN26FFPlayerThreadStateManager16setStateInternalE24FFPlayerThreadStateValuebPvyP8NSString.s
//
// FUNCTION SIGNATURE (SysV x86-64, from the arg registers actually used):
//   %rdi = self, %esi = state (new FFPlayerThreadStateValue),
//   %dl  = arg2 (bool)               — UNUSED by the body
//   %rcx = arg3 (void*)              — forwarded to _kdebug_trace as its arg1
//   %r8  = arg4 (unsigned long long) — forwarded to _kdebug_trace as its arg2
//   %r9  = arg5 (NSString*)          — UNUSED by the body
//
// CONTROL FLOW (line-for-line, 32 instrs, 3 externs, NO in-scope callees —
// `depgraph.py deps` for this symbol is EMPTY):
//   0xdbb4b0  movl 0x90(%rdi),%eax          ; eax = self->state (u32)
//   0xdbb4b6  cmpl %eax,%esi                ; (esi - eax) = state - cur
//   0xdbb4b8  jne  0xdbb4bb                 ; if state != cur → proceed
//   0xdbb4ba  retq                          ; else no change → return
//   -- prologue saves rbp,r15,r14,r12,rbx --
//   0xdbb4c6  movl %esi,%ebx                ; ebx = state (preserved for xchg)
//   0xdbb4c8  cmpl $0x2,%esi                ; (state - 2)
//   0xdbb4cb  jne  0xdbb4fa                 ; if state != 2 → skip SignPost
//   0xdbb4cd  movq %rdi,%r14                ; r14 = self
//   0xdbb4d0  movq %r8,%r12                 ; r12 = arg4
//   0xdbb4d3  movq %rcx,%r15                ; r15 = arg3
//   0xdbb4d6  callq _FFGetFlexoSignPostEnableMask   ; al = mask byte
//   0xdbb4db  movq %r14,%rdi                ; restore self
//   0xdbb4de  testb $0x60,%al               ; (mask & 0x60)
//   0xdbb4e0  je   0xdbb4fa                 ; if zero → skip trace
//   0xdbb4e2  movq %r15,%rsi                ; arg1 = arg3 (void*)
//   0xdbb4e5  movq %r12,%rdx                ; arg2 = arg4 (u64)
//   0xdbb4e8  movl $0x2b7d003c,%edi         ; kdebug code = 0x2B7D003C
//   0xdbb4ed  xorl %ecx,%ecx                ; arg3 = 0
//   0xdbb4ef  xorl %r8d,%r8d                ; arg4 = 0
//   0xdbb4f2  callq _kdebug_trace
//   0xdbb4f7  movq %r14,%rdi                ; restore self
//   0xdbb4fa  xchgl %ebx,0x90(%rdi)         ; ATOMIC swap self->state = state
//   0xdbb500  addq $0x40,%rdi               ; rdi = &self->cond (self+0x40)
//   -- epilogue restores rbx,r12,r14,r15,rbp --
//   0xdbb50c  jmp  _pthread_cond_broadcast  ; tail-call broadcast(&self->cond)
//
// All THREE callees are TRUE out-of-scope externs (modelled as loud boundary
// stubs per PORTING_SPEC Rule 3; same family as the HGSignPost/_kdebug_trace
// externs already in-tree):
//   _FFGetFlexoSignPostEnableMask — Flexo SignPost enable-mask accessor (a free
//     function reading a process-global diagnostics gate byte; not in any class
//     ledger, does no FCP render work).
//   _kdebug_trace                 — Darwin libsystem_kernel (kdebug ring buffer).
//   _pthread_cond_broadcast       — libpthread condition-variable wake-all.
// =============================================================================

/**
 * `FFPlayerThreadStateValue` — 32-bit lifecycle enum. Only the numeric identity
 * matters to setStateInternal (it does an equality early-out and a `== 2` test),
 * so it is kept as a plain number to mirror the `movl`/`cmpl`/`xchgl` widths.
 */
export type FFPlayerThreadStateValue = number;

/**
 * Loud boundary for Flexo's `_FFGetFlexoSignPostEnableMask()`.
 * @extern @Flexo call @0xdbb4d6 — out-of-scope diagnostics gate (free function).
 *
 * Returns a byte-wide bitmask of which SignPost probe classes are enabled for
 * this process (bit 0x60 gates the state-change probe). Not part of any FCP
 * render class and not in a ledger, so modelled as a loud boundary stub.
 */
function _FFGetFlexoSignPostEnableMask(): number {
  throw new Error(
    "FFPlayerThreadStateManager::setStateInternal: _FFGetFlexoSignPostEnableMask " +
      "@extern @Flexo 0xdbb4d6 — out-of-scope diagnostics gate, not yet transcribed",
  );
}

/**
 * Loud boundary for Darwin's `_kdebug_trace(code, arg1, arg2, arg3, arg4)`.
 * @extern @Flexo symbol stub @0xdbb4f2 (stub 0x1497812) ## _kdebug_trace
 *
 * TRUE out-of-scope extern — kdebug lives in libsystem_kernel and delivers
 * probe payloads to the Darwin kernel's kdebug ring buffer (Instruments/DTrace).
 * Zero-effect in a headless TS port; this is the extern boundary.
 */
function _kdebug_trace(
  _code: number,
  _arg1: unknown,
  _arg2: bigint,
  _arg3: number,
  _arg4: number,
): void {
  throw new Error(
    "FFPlayerThreadStateManager::setStateInternal: _kdebug_trace @extern-stub " +
      "@Flexo 0xdbb4f2 (stub 0x1497812) — out-of-scope Darwin libsystem_kernel boundary",
  );
}

/**
 * Loud boundary for pthread's `_pthread_cond_broadcast(cond)`.
 * @extern @Flexo symbol stub @0xdbb50c (stub 0x1497a70) ## _pthread_cond_broadcast
 *
 * TRUE out-of-scope extern (libpthread). Wakes all threads waiting on the
 * condition variable at self+0x40. No effect in a single-threaded TS port.
 */
function _pthread_cond_broadcast(_cond: unknown): number {
  throw new Error(
    "FFPlayerThreadStateManager::setStateInternal: _pthread_cond_broadcast " +
      "@extern-stub @Flexo 0xdbb50c (stub 0x1497a70) — out-of-scope libpthread boundary",
  );
}

/**
 * `FFPlayerThreadStateManager::setStateInternal(FFPlayerThreadStateValue state,
 *   bool, void* arg3, unsigned long long arg4, NSString*)`
 * @Flexo 0xdbb4b0 —
 *   __ZN26FFPlayerThreadStateManager16setStateInternalE24FFPlayerThreadStateValuebPvyP8NSString
 *
 * Faithful line-for-line port of the 32-instruction body. Sets the manager's
 * thread state (this+0x90) to `state` and broadcasts the embedded condition
 * variable (this+0x40) so any waiter observes the transition — but ONLY when
 * the state actually changes (early-out @0xdbb4b8 when `state == self.state`).
 * When transitioning INTO state 2, fires a kdebug SignPost probe (code
 * 0x2B7D003C) iff the Flexo SignPost mask has bit 0x60 set.
 *
 * The `bool` arg2 (%dl) and the `NSString*` arg5 (%r9) are consumed by the ABI
 * but NEVER read in the decoded body — accepted and ignored here.
 *
 * @param self   FFPlayerThreadStateManager* (%rdi)
 * @param state  new FFPlayerThreadStateValue (%esi)
 * @param _flag  bool (%dl) — unused by the decoded body
 * @param arg3   void* (%rcx) — forwarded to _kdebug_trace as arg1
 * @param arg4   unsigned long long (%r8) — forwarded to _kdebug_trace as arg2
 * @param _label NSString* (%r9) — unused by the decoded body
 */
export function FFPlayerThreadStateManager_setStateInternal(
  self: FFPlayerThreadStateManager,
  state: FFPlayerThreadStateValue,
  _flag: boolean,
  arg3: unknown,
  arg4: bigint,
  _label: unknown,
): void {
  // @0xdbb4b0  movl 0x90(%rdi),%eax          ; eax = self->state (u32)
  const cur = self.state | 0;

  // @0xdbb4b6  cmpl %eax,%esi ; @0xdbb4b8 jne / 0xdbb4ba retq
  //   AT&T `cmpl %eax,%esi` → flags on (esi - eax) = state - cur. `jne` proceeds
  //   iff state != cur, so the fall-through `retq` fires iff state == cur.
  if ((state | 0) === cur) {
    // @0xdbb4ba retq — state unchanged, nothing to broadcast.
    return;
  }

  // @0xdbb4c8 cmpl $0x2,%esi ; @0xdbb4cb jne 0xdbb4fa — SignPost only for state 2.
  if ((state | 0) === 0x2) {
    // @0xdbb4d6 callq _FFGetFlexoSignPostEnableMask — al = enable-mask byte.
    const mask = _FFGetFlexoSignPostEnableMask() & 0xff;

    // @0xdbb4de testb $0x60,%al ; @0xdbb4e0 je 0xdbb4fa — fire iff (mask & 0x60)!=0.
    if ((mask & 0x60) !== 0) {
      // @0xdbb4e8 movl $0x2b7d003c,%edi — the fully-qualified 32-bit kdebug event
      //   id Apple's Flexo registers for the "player thread entered state 2"
      //   SignPost. arg1 = arg3 (%rsi @0xdbb4e2), arg2 = arg4 (%rdx @0xdbb4e5),
      //   arg3 = 0 (@0xdbb4ed), arg4 = 0 (@0xdbb4ef).
      _kdebug_trace(0x2b7d003c, arg3, arg4, 0, 0);
    }
  }

  // @0xdbb4fa xchgl %ebx,0x90(%rdi) — ATOMIC swap self->state = state. The x86
  //   `xchg` on a memory operand carries an implicit LOCK (full atomic RMW); the
  //   loaded old value (→ %ebx) is never read again, so this is an atomic store.
  self.state = state | 0;

  // @0xdbb500 addq $0x40,%rdi ; @0xdbb50c jmp _pthread_cond_broadcast — tail-call
  //   broadcast on the condition variable at self+0x40.
  _pthread_cond_broadcast(self.cond);
}
