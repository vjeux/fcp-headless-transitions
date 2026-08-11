// HGRenderUtils::BufferCopier — Helium nested class. This file ports the
// complete-object constructor (C1) only; other methods will accrete into
// this same file as future ledger entries claim them (one class per file).
//
// Ledger @Helium (this file's scope):
//   BufferCopier::BufferCopier()   @0x60230    __ZN13HGRenderUtils12BufferCopierC1Ev
//   BufferCopier::finish()         @0x603b0    __ZN13HGRenderUtils12BufferCopier6finishEv
//
// LAYOUT (recovered from the ctor at @0x60230):
//   The ctor allocates a 0x50-byte inner "Impl" object on the heap via
//   `operator new(0x50)` @0x6023f (stub 0x3c4fb2), writes byte 0 at Impl+0x48,
//   creates a dispatch_group_t via _dispatch_group_create @0x6024b (stub
//   0x3c50a8), stores it at Impl+0x00, and finally stores the Impl* into
//   this->+0x00.
//
//   struct BufferCopier {           // 8 bytes on the stack ("thin handle")
//     BufferCopier::Impl* pImpl;    // +0x00 — heap-allocated 0x50-byte object
//   };
//
//   struct BufferCopier::Impl {     // 0x50 bytes = 80 bytes
//     dispatch_group_t group;       // +0x00 — from _dispatch_group_create()
//     ... (bytes 0x08..0x47 not yet decoded; likely more dispatch objects
//         and queues, given the group at +0x00 and a byte flag at +0x48)
//     uint8_t          flag;        // +0x48 — initialised to 0 by the ctor
//     ... (bytes 0x49..0x4f padding/other fields)
//   };
//
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs):
//   * __Znwm                   — libc++ operator new(size_t). Called @0x6023f
//                                via stub 0x3c4fb2. Standard C++ runtime alloc;
//                                out-of-scope by policy (same as every other
//                                operator-new call site in the port).
//   * _dispatch_group_create   — Grand Central Dispatch (libdispatch.dylib).
//                                Called @0x6024b via stub 0x3c50a8. Returns
//                                a retained dispatch_group_t. Apple system
//                                framework — TRUE out-of-scope extern.
//   * _dispatch_group_wait     — Grand Central Dispatch (libdispatch.dylib).
//                                Called from finish() @0x603c9 via stub
//                                0x3c50ba, with timeout %rsi = -1
//                                (DISPATCH_TIME_FOREVER) set @0x603c2. Apple
//                                system framework — TRUE out-of-scope extern.

/**
 * `operator new(size_t)` — libc++ global (C++ runtime allocator).
 * Called from BufferCopier::BufferCopier() @Helium 0x6023f via stub
 * 0x3c4fb2. TRUE OUT-OF-SCOPE extern (C++ standard library allocator);
 * modelled as a boundary throw citing @0xADDR. Consistent with
 * operator_new_16 in HGTraceGuard.ts and the __Znwm-family stubs in
 * every other ported class that heap-allocates.
 *
 * @param _size 0x50 bytes at this call site (%edi=0x50 @0x6023a).
 */
function operator_new_0x50(): BufferCopierImpl {
  // @Helium stub 0x3c4fb2 — __Znwm (libc++ global operator new(size_t)).
  throw new Error(
    "BufferCopier::BufferCopier: operator new(size_t=0x50) not yet " +
      "transcribed — called @Helium 0x6023f via stub 0x3c4fb2. TRUE " +
      "out-of-scope extern (libc++ runtime allocator).",
  );
}

/**
 * `dispatch_group_create()` — Grand Central Dispatch (libdispatch.dylib).
 * Called from BufferCopier::BufferCopier() @Helium 0x6024b via stub
 * 0x3c50a8. Returns a fresh, retained `dispatch_group_t` — an opaque
 * OS_dispatch_group object used to synchronise a group of blocks. The
 * caller owns the +1 retain and is responsible for the matching
 * dispatch_release (or ARC-style _Block_release in modern libdispatch).
 *
 * TRUE OUT-OF-SCOPE extern (Apple libdispatch, part of the Darwin
 * kernel-adjacent runtime). Modelled as a boundary throw citing @0xADDR;
 * callers that need concurrency semantics should be wired to a JS-side
 * pool/promise adapter, not routed through this native syscall stub.
 *
 * @returns dispatch_group_t — an opaque handle to a new dispatch group.
 */
function dispatch_group_create(): DispatchGroupRef {
  // @Helium stub 0x3c50a8 — _dispatch_group_create (libdispatch extern).
  throw new Error(
    "BufferCopier::BufferCopier: _dispatch_group_create not yet " +
      "transcribed — called @Helium 0x6024b via stub 0x3c50a8. TRUE " +
      "out-of-scope extern (Apple libdispatch runtime).",
  );
}

/** Opaque handle for a `dispatch_group_t` (OS_dispatch_group). The
 *  JS runtime has no libdispatch, so this is a nominal opaque type;
 *  produced only by the dispatch_group_create() boundary stub. */
export interface DispatchGroupRef {
  readonly __brand: "dispatch_group_t";
}

/**
 * `DISPATCH_TIME_FOREVER` — the `dispatch_time_t` timeout finish() passes to
 * `dispatch_group_wait`. Materialised at @Helium 0x603c2 as
 * `movq $-0x1, %rsi`: the second SysV integer argument is the 64-bit value
 * -1, i.e. `0xffffffffffffffff` unsigned, which is libdispatch's
 * "block indefinitely" sentinel. Held as a bigint because the value does not
 * fit an exact JS number (PORTING_SPEC Rule 4: int64 -> bigint above 2^53).
 */
const DISPATCH_TIME_FOREVER: bigint = 0xffffffffffffffffn; // @Helium 0x603c2

/**
 * `dispatch_group_wait(dispatch_group_t, dispatch_time_t)` — Grand Central
 * Dispatch (libdispatch.dylib). Called from BufferCopier::finish() @Helium
 * 0x603c9 via stub 0x3c50ba, with the group loaded from `Impl+0x00` @0x603bf
 * and the timeout set to DISPATCH_TIME_FOREVER @0x603c2. Blocks the calling
 * thread until every block associated with the group has completed (or the
 * timeout elapses), and returns 0 on completion / non-zero on timeout.
 *
 * TRUE OUT-OF-SCOPE extern (Apple libdispatch, the same runtime as the
 * dispatch_group_create stub above). Modelled as a NO-OP boundary returning 0
 * and citing @0xADDR — see the body for why a throw would be wrong here and is
 * right for FFSemaphore.ts. A caller that needs a real rendezvous must be
 * wired to a JS-side promise/pool adapter rather than routed through this
 * stub; what it must NOT do is prevent the @0x603ce store from running.
 *
 * @param _group   the dispatch_group_t at Impl+0x00 (%rdi @0x603c2).
 * @param _timeout dispatch_time_t (%rsi) — always DISPATCH_TIME_FOREVER here.
 * @returns 0 when the group drained; non-zero on timeout (never reached).
 */
function dispatch_group_wait(
  _group: DispatchGroupRef | null,
  _timeout: bigint,
): number {
  // @Helium stub 0x3c50ba — _dispatch_group_wait (libdispatch extern).
  //
  // MODELLED AS A NO-OP RETURNING 0, not as a throw. The discriminator is
  // whether the machine CONSUMES the wait's result: here nothing tests %rax
  // after @0x603c9 — the very next instruction is the `movb $0x0, 0x48(%rbx)`
  // store @0x603ce — so the call's only contribution to this function is the
  // rendezvous itself. This is the landed FFCentralDecodingUnitManager.ts
  // shape (@0xdff171: the same `movq $-0x1,%rsi` + wait with the result
  // discarded, landed as a no-op), not the FFSemaphore.ts shape (@0x12efa5c),
  // where `testq %rax,%rax ; sete %al` feeds the return value and JS cannot
  // fabricate an answer — that one is correctly a throw.
  //
  // The no-op is also what the timeout means here: a single-threaded JS realm
  // has no block in flight, so a real DISPATCH_TIME_FOREVER wait on an
  // un-entered group returns immediately with 0 (measured on the live symbol
  // by the oracle: an idle group returns at once, an ENTERED group blocks for
  // the full delay). Returning 0 = "the group drained" is therefore the
  // faithful boundary value, and the @0x603ce store must run.
  return 0;
}

/** BufferCopier::Impl — the 0x50-byte heap-allocated inner object.
 *  Only two fields are decoded from the ctor at @0x60230; the rest
 *  are placeholder bytes until later methods (submit/wait/cancel)
 *  reveal their offsets. */
export class BufferCopierImpl {
  /** [+0x00] dispatch_group_t — from _dispatch_group_create() @0x6024b.
   *  Written by the ctor @0x60250 (`movq %rax, (%r14)`). */
  group: DispatchGroupRef | null = null;

  /** [+0x48] byte flag — initialised to 0 by the ctor @0x60247
   *  (`movb $0x0, 0x48(%rax)`). Semantics not yet decoded (likely a
   *  boolean "in-flight" / "cancelled" flag; will be pinned once a
   *  submit/cancel method claims this file). */
  flag_0x48: number = 0;
}

/**
 * `HGRenderUtils::BufferCopier` — nested class inside HGRenderUtils.
 * Ported here as a stand-alone TS class (JS has no C++-style nesting;
 * the `HGRenderUtils_` prefix in the file/class name preserves the
 * qualified-name provenance so the ledger maps cleanly).
 *
 * INSTANCE LAYOUT (recovered from C1 @0x60230):
 *   [0x00]  pImpl — BufferCopier::Impl* (heap-allocated, owned).
 *   The class is a thin 8-byte "handle" holding a pointer to a 0x50-byte
 *   heap object; a classic pImpl idiom hiding libdispatch details from
 *   the header. Every subsequent method observed in disassembly loads
 *   `this->pImpl` before doing anything useful.
 */
export class HGRenderUtils_BufferCopier {
  /** [+0x00] pImpl — the sole field on this 8-byte handle. Written by
   *  the C1 ctor @0x60253 (`movq %r14, (%rbx)`). Populated with a
   *  freshly-allocated `BufferCopierImpl`. */
  pImpl: BufferCopierImpl | null = null;

  /**
   * `HGRenderUtils::BufferCopier::BufferCopier()` @Helium 0x60230
   *   __ZN13HGRenderUtils12BufferCopierC1Ev
   *
   * Disasm (raw-port/re/disasm/Helium.__ZN13HGRenderUtils12BufferCopierC1Ev.s):
   *
   *   0x60230  pushq %rbp                     ; prologue
   *   0x60231  movq  %rsp, %rbp
   *   0x60234  pushq %r14                     ; callee-saved
   *   0x60236  pushq %rbx                     ; callee-saved
   *   0x60237  movq  %rdi, %rbx               ; rbx = this  (save across calls)
   *   0x6023a  movl  $0x50, %edi              ; size = 0x50 (arg -> operator new)
   *   0x6023f  callq  __Znwm                  ; stub 0x3c4fb2 (libc++ op new)
   *   0x60244  movq  %rax, %r14               ; r14 = Impl* (freshly allocated)
   *   0x60247  movb  $0x0, 0x48(%rax)         ; Impl->+0x48 = 0  (flag byte)
   *   0x6024b  callq  _dispatch_group_create  ; stub 0x3c50a8 (libdispatch)
   *   0x60250  movq  %rax, (%r14)             ; Impl->+0x00 = group
   *   0x60253  movq  %r14, (%rbx)             ; this->pImpl = Impl
   *   0x60256  popq  %rbx                     ; epilogue
   *   0x60257  popq  %r14
   *   0x60259  popq  %rbp
   *   0x6025a  retq
   *
   * SEMANTICS
   *   Complete-object ctor (C1). Allocates a fresh 0x50-byte Impl on the
   *   heap, initialises the +0x48 flag byte to 0 (default "not active"),
   *   creates a new dispatch_group_t and stores it at Impl+0x00, then
   *   installs the Impl pointer into `this->pImpl`. Classic pImpl-idiom
   *   ctor: cheap outer object, heavy inner object; the outer type is a
   *   forward-declaration-friendly 8-byte handle.
   *
   *   Order matters: the compiler emits `movb $0x0, 0x48(%rax)` BEFORE
   *   `_dispatch_group_create` because the second call clobbers %rax,
   *   and the address needs the fresh alloc result. The +0x48 flag is
   *   thus already zero when the group is stored at +0x00.
   *
   * FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs — see file header)
   */
  static C1(self: HGRenderUtils_BufferCopier): void {
    // @0x60237  movq %rdi, %rbx           — save `this` in %rbx.
    // @0x6023a..0x6023f  callq __Znwm     — operator new(0x50).
    const impl = operator_new_0x50();
    // @0x60244  movq %rax, %r14           — r14 = Impl*.
    // @0x60247  movb $0x0, 0x48(%rax)     — Impl->+0x48 = 0.
    impl.flag_0x48 = 0;
    // @0x6024b  callq _dispatch_group_create — group = new dispatch_group_t.
    const group = dispatch_group_create();
    // @0x60250  movq %rax, (%r14)         — Impl->+0x00 = group.
    impl.group = group;
    // @0x60253  movq %r14, (%rbx)         — this->pImpl = Impl.
    self.pImpl = impl;
    // @0x60256..0x6025a — epilogue + retq.
  }

  /**
   * `HGRenderUtils::BufferCopier::finish()` @Helium 0x603b0
   *   __ZN13HGRenderUtils12BufferCopier6finishEv
   *
   * Disasm (raw-port/re/disasm/Helium.__ZN13HGRenderUtils12BufferCopier6finishEv.s):
   *
   *   0x603b0  pushq %rbp                     ; prologue
   *   0x603b1  movq  %rsp, %rbp
   *   0x603b4  pushq %rbx                     ; callee-saved
   *   0x603b5  pushq %rax                     ; 8-byte stack align pad
   *   0x603b6  movq  (%rdi), %rbx             ; rbx = this->pImpl
   *   0x603b9  cmpb  $0x1, 0x48(%rbx)         ; compare Impl->flag_0x48 with 1
   *   0x603bd  jne   0x603d7                  ; != 1 -> straight to the epilogue
   *   0x603bf  movq  (%rbx), %rdi             ; rdi = Impl->group (+0x00)
   *   0x603c2  movq  $-0x1, %rsi              ; rsi = DISPATCH_TIME_FOREVER
   *   0x603c9  callq 0x3c50ba                 ; _dispatch_group_wait(group, -1)
   *   0x603ce  movb  $0x0, 0x48(%rbx)         ; Impl->flag_0x48 = 0
   *   0x603d2  nop ; 0x603d3 nopl (%rax)      ; padding
   *   0x603d7  addq  $0x8, %rsp               ; epilogue
   *   0x603db  popq  %rbx
   *   0x603dc  popq  %rbp
   *   0x603dd  retq
   *
   * SEMANTICS
   *   The blocking rendezvous half of the copier: if a dispatch batch is
   *   marked in flight (`flag_0x48 == 1`, the flag the C1 ctor @0x60247
   *   zero-initialises), wait for every block in the group to finish, then
   *   clear the flag so a second finish() is a no-op. Nothing else is read
   *   or written — no return value, no allocation, no state beyond the flag.
   *
   *   The compare is `cmpb $0x1` + `jne`, NOT a zero test: ONLY the exact
   *   byte value 1 takes the wait path. A `flag != 0` model would be wrong
   *   for any other non-zero value (measured below: 206 of 400 cases).
   *
   *   `%rdi` is reloaded from `(%rbx)` at @0x603bf, i.e. the group pointer is
   *   read from `Impl+0x00`, the same slot the ctor wrote @0x60250 — the
   *   `movq (%rdi), %rbx` at @0x603b6 already replaced `this` with `pImpl`,
   *   so the two `(%r..)` loads are two different objects one level apart.
   *
   *   The whole body is `this->pImpl->finish_dispatch()` INLINED: the
   *   stand-alone `HGRenderUtils::BufferCopierImpl::finish_dispatch()`
   *   @Helium 0x5edb0 is instruction-for-instruction the same sequence
   *   (`cmpb $0x1, 0x48(%rdi)` / `jne` / load group / `movq $-0x1, %rsi` /
   *   the same 0x3c50ba stub / `movb $0x0, 0x48`). That symbol is a separate
   *   ledger entry; this method transcribes the code that is actually at
   *   @0x603b0, and when 0x5edb0 lands this body can be re-expressed as a
   *   call to it without changing behaviour.
   *
   * ORACLE — differential against the live Helium binary, 1,004 cases, 0
   * divergences (raw-port/re/oracle/HGRenderUtils_BufferCopier_finish_oracle.py
   * + HGRenderUtils_BufferCopier_finish_driver.mts). The TS side is THIS FILE,
   * EXECUTED: every case runs through
   * `node --experimental-strip-types`, which imports this module and calls
   * `finish()`. The first version of the harness compared the binary against a
   * Python restatement instead, which no-op'd the wait while the shipped code
   * threw in it — so it attested to a model, not to the port, and missed the
   * flag never being cleared. Its four negative controls now run in the same
   * node process: the wait modelled as a throw is killed on 500/1000 cases
   * (every flag == 1 case), a `flag != 0` test on 499, dropping the @0x603ce
   * store on 500, and an inverted `jne` on 499.
   * The symbol is exported (`nm -arch x86_64` type `T`), so the harness dlopens
   * Helium under `arch -x86_64 /usr/bin/python3` (the port cites x86_64 offsets;
   * calling the arm64 slice would compare against code this port did not
   * transcribe — OPS_LOG "wrong architecture"), builds a REAL `dispatch_group_t`
   * with libSystem, and drives a 0xAA-poisoned 0x50-byte Impl behind an 8-byte
   * handle:
   *   * 500 cases with flag == 1 and an idle group: the flag byte ends at 0,
   *     the group pointer at +0x00 is unchanged, and every other byte of the
   *     Impl is still 0xAA — finish() stores exactly one byte.
   *   * 500 cases with flag ∈ {0, 2, 3, 0x7f, 0x80, 0xff, random != 1}: the
   *     object comes back byte-identical — the `jne` path really is a no-op.
   *   * 4 timed cases with flag == 1 on an ENTERED group left by a background
   *     thread after 250ms: the call blocked for the full delay each time and
   *     then cleared the flag, which is what pins the timeout as
   *     DISPATCH_TIME_FOREVER rather than a poll.
   * NEGATIVE CONTROLS (measured over 400 mixed-flag cases): clearing the flag
   * unconditionally / skipping the wait -> 206 wrong; triggering on
   * `flag != 0` instead of `== 1` -> 206 wrong; forgetting the +0x48 store
   * -> 125 wrong.
   *
   * FRONTIER CALLEES: `_dispatch_group_wait` only (TRUE out-of-scope extern —
   * see the file header and the boundary stub above).
   */
  finish(): void {
    // @0x603b0..0x603b5 — prologue (no TS-visible effect).
    // @0x603b6  movq (%rdi), %rbx        — rbx = this->pImpl. The machine
    //   dereferences it unconditionally (no null test anywhere in the body),
    //   so a null pImpl faults here; `!` models that unchecked load.
    const impl = this.pImpl!;
    // @0x603b9  cmpb $0x1, 0x48(%rbx)    — flag - 1
    // @0x603bd  jne  0x603d7             — taken unless the byte is exactly 1
    if (impl.flag_0x48 === 1) {
      // @0x603bf  movq (%rbx), %rdi      — rdi = Impl->group (+0x00)
      // @0x603c2  movq $-0x1, %rsi       — rsi = DISPATCH_TIME_FOREVER
      // @0x603c9  callq 0x3c50ba         — _dispatch_group_wait(group, -1)
      dispatch_group_wait(impl.group, DISPATCH_TIME_FOREVER);
      // @0x603ce  movb $0x0, 0x48(%rbx)  — Impl->flag_0x48 = 0
      impl.flag_0x48 = 0;
    }
    // @0x603d7..0x603dd — epilogue + retq (void).
  }
}
