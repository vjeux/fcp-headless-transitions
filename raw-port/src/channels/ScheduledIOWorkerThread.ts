// ScheduledIOWorkerThread — Flexo's function-local Meyers-style singleton that
// owns the single background FFWorkerQueue that drains scheduled audio read
// I/O (the queue is tagged "com.apple.flexo.audio-scheduled-io-worker-thread").
//
// The "class" is actually just a namespace holding a `static instance()` free
// function that lazily constructs an FFWorkerQueue via GCD's `_dispatch_once`
// and caches the pointer in a function-local static. Two symbols are exported:
//   - the fast/slow entry point at Flexo 0xd23ab0
//   - the `_dispatch_once` fallback (`.cold.1`) at Flexo 0x1487710 (ICF-coalesced
//     with FFScheduledReadAudioFile's cold.1 stub — see nm output below).
// Plus one hidden helper the linker exposes as `_block_invoke`:
//   - `____ZN23ScheduledIOWorkerThread8instanceEv_block_invoke` at Flexo 0xd23ae0,
//     the dispatch_once block body that actually allocates + constructs the
//     FFWorkerQueue and stores it into `s_instance`.
//
// nm evidence (`nm -arch x86_64 -n Flexo | grep ScheduledIOWorkerThread`):
//   0000000000d23ab0 t __ZN23ScheduledIOWorkerThread8instanceEv
//   0000000000d23ae0 t ____ZN23ScheduledIOWorkerThread8instanceEv_block_invoke
//   0000000001487710 t __ZN23ScheduledIOWorkerThread8instanceEv.cold.1
//   0000000001487710 t __ZN24FFScheduledReadAudioFileD2Ev.cold.1  <- ICF-coalesced
//   0000000001c7f500 b __ZZN23ScheduledIOWorkerThread8instanceEvE10s_instance
//   0000000001c7f508 b __ZZN23ScheduledIOWorkerThread8instanceEvE11s_predicate
//
// Static bss layout (recovered from the nm dump above):
//   __ZZN23ScheduledIOWorkerThread8instanceEvE10s_instance   @ Flexo bss 0x1c7f500
//   __ZZN23ScheduledIOWorkerThread8instanceEvE11s_predicate  @ Flexo bss 0x1c7f508
// The two are laid out as an 8B pointer followed by an 8B predicate — this is
// EXACTLY the layout of a stand-alone dispatch_once_t predicate + pointer pair
// used by the compiler's dispatch_once inliner for a function-local static
// (`static FFWorkerQueue* s_instance;` + `static dispatch_once_t s_predicate;`).
//
// Faithful transcription of the two exported symbols on this class's slice.
// The block_invoke helper is INSIDE the surface (it defines s_instance) so we
// also transcribe it — it is not a frontier callee — its Flexo `nm` symbol is
// `____ZN23ScheduledIOWorkerThread8instanceEv_block_invoke` at 0xd23ae0.
//
// Source disassembly (extracted from /tmp/Flexo_tV.txt via awk on the
// `__ZN23ScheduledIOWorkerThread8instanceEv:` label and via a positional read
// of the block_invoke and cold.1 addresses via grep + sed):
//
// (fast entry)
//   __ZN23ScheduledIOWorkerThread8instanceEv:
//     0xd23ab0  cmpq  $-0x1, s_predicate(%rip)
//     0xd23ab8  jne   0xd23ac2                       ; not-yet-initialised path
//     0xd23aba  movq  s_instance(%rip), %rax         ; fast path
//     0xd23ac1  retq
//     0xd23ac2  pushq %rbp
//     0xd23ac3  movq  %rsp, %rbp
//     0xd23ac6  callq __ZN24FFScheduledReadAudioFileD2Ev.cold.1 ; ICF-coalesced
//                                                     ; actually runs
//                                                     ; ScheduledIOWorkerThread::instance().cold.1
//     0xd23acb  popq  %rbp
//     0xd23acc  movq  s_instance(%rip), %rax         ; load after init
//     0xd23ad3  retq
//     0xd23ad4  nopw  %cs:(%rax,%rax)
//
// (cold slow-path — aliased to FFScheduledReadAudioFile's cold.1 by ICF)
//   __ZN23ScheduledIOWorkerThread8instanceEv.cold.1:  ; == __ZN24FFScheduledReadAudioFileD2Ev.cold.1
//     0x1487710 pushq %rbp
//     0x1487711 movq  %rsp, %rbp
//     0x1487714 leaq  s_predicate(%rip), %rdi         ; &s_predicate
//     0x148771b leaq  ___block_literal_global(%rip), %rsi ; the block descriptor
//     0x1487722 popq  %rbp
//     0x1487723 jmp   0x1497674                       ; symbol stub for _dispatch_once
//
// (the block body — what dispatch_once actually runs once)
//   ____ZN23ScheduledIOWorkerThread8instanceEv_block_invoke:
//     0xd23ae0  pushq %rbp
//     0xd23ae1  movq  %rsp, %rbp
//     0xd23ae4  pushq %r14
//     0xd23ae6  pushq %rbx
//     0xd23ae7  movl  $0x88, %edi                    ; sizeof(FFWorkerQueue) = 0x88 = 136
//     0xd23aec  callq _Znwm                           ; operator new(size_t)
//     0xd23af1  movq  %rax, %rbx                     ; save allocation
//     0xd23af4  leaq  0x93707b(%rip), %rsi            ; C-string literal
//                                                     ; "com.apple.flexo.audio-scheduled-io-worker-thread"
//     0xd23afb  movq  %rax, %rdi                     ; this = allocation
//     0xd23afe  callq __ZN13FFWorkerQueueC1EPKc       ; FFWorkerQueue::FFWorkerQueue(char const*)
//     0xd23b03  movq  %rbx, s_instance(%rip)         ; publish the pointer
//     0xd23b0a  popq  %rbx
//     0xd23b0b  popq  %r14
//     0xd23b0d  popq  %rbp
//     0xd23b0e  retq
//   ; landing pad (C++ noexcept ctor guard):
//     0xd23b0f  movq  %rax, %r14
//     0xd23b12  movq  %rbx, %rdi
//     0xd23b15  callq 0x1497404                       ; __ZdlPv (operator delete)
//     0xd23b1a  movq  %r14, %rdi
//     0xd23b1d  callq 0x1495d30                       ; __Unwind_Resume
//
// Framework: Final Cut Pro / Flexo.framework.
//
// Frontier callees (all become throwing stubs):
//   FFWorkerQueue::FFWorkerQueue(char const*)   @Flexo call 0xd23afe (block_invoke)
//   operator new(size_t) via stub `_Znwm`       @Flexo call 0xd23aec (block_invoke) — stub 0x1497452
//   _dispatch_once (GCD) via symbol stub        @Flexo tail-jmp 0x1487723 (cold.1) — stub 0x1497674
//   operator delete(void*) via stub `_ZdlPv`    @Flexo call 0xd23b15 (landing pad) — stub 0x1497404
//   __Unwind_Resume via symbol stub             @Flexo call 0xd23b1d (landing pad) — stub 0x1495d30

/**
 * Opaque handle for `FFWorkerQueue`. Its own symbol slice is not on this class's
 * decoded surface — only its ctor (`FFWorkerQueue::FFWorkerQueue(char const*)`
 * at the call site @0xd23afe) is referenced by name here. Its layout is 0x88
 * bytes as pinned by the `movl $0x88, %edi` immediate passed to
 * `operator new(size_t)` in the block_invoke body.
 */
export type FFWorkerQueue = object;

/**
 * `FFWorkerQueue::FFWorkerQueue(char const*)` — frontier ctor callee. Called
 * from the block_invoke body @0xd23afe with %rdi = a freshly-allocated 136-byte
 * region and %rsi = the C-string "com.apple.flexo.audio-scheduled-io-worker-thread".
 * Not on this class's decoded surface.
 */
function FFWorkerQueue_ctor_charStar(_this: FFWorkerQueue, _label: string): void {
  throw new Error(
    "ScheduledIOWorkerThread: FFWorkerQueue::FFWorkerQueue(char const*) not " +
      "yet transcribed @Flexo call site 0xd23afe (block_invoke)"
  );
}

/**
 * `operator new(size_t)` — the C++ global allocation function reached through
 * the symbol stub `_Znwm` @Flexo 0x1497452. Called by the block_invoke body
 * @0xd23aec with %edi = 0x88 (136B, the sizeof FFWorkerQueue). Standard C++
 * runtime; not modelled in the raw-port surface.
 */
function cxx_operator_new(_size: number): FFWorkerQueue {
  throw new Error(
    "ScheduledIOWorkerThread: operator new(size_t) not modelled in the " +
      "raw-port runtime @Flexo call site 0xd23aec (stub 0x1497452)"
  );
}

/**
 * `_dispatch_once` — the GCD lazy-initialisation primitive reached through
 * the symbol stub @Flexo 0x1497674. The cold.1 slow-path tail-jmps to it with
 * %rdi = `&s_predicate` and %rsi = `___block_literal_global` (the C-block
 * descriptor whose invoke pointer is `instance_block_invoke`). Standard GCD
 * runtime; not modelled in the raw-port surface.
 */
function gcd_dispatch_once(
  _predicate: { value: bigint },
  _block: () => void
): void {
  throw new Error(
    "ScheduledIOWorkerThread: _dispatch_once not modelled in the raw-port " +
      "runtime @Flexo tail-jmp 0x1487723 (cold.1, stub 0x1497674)"
  );
}

/**
 * The C++ ctor-guard landing pad's role is to `operator delete` the freshly
 * allocated FFWorkerQueue if `FFWorkerQueue::FFWorkerQueue(char const*)` throws
 * — modelled here for completeness with a note that in our TS mirror the
 * frontier ctor throws unconditionally (raw-port stub), so this path would
 * never be exercised in a JS runtime that catches the ctor's error.
 * @Flexo call site 0xd23b15 (stub 0x1497404).
 */
function cxx_operator_delete(_this: FFWorkerQueue): void {
  throw new Error(
    "ScheduledIOWorkerThread: operator delete(void*) not modelled in the " +
      "raw-port runtime @Flexo call site 0xd23b15 (stub 0x1497404)"
  );
}

/**
 * `__Unwind_Resume` — the Itanium C++ ABI exception-unwinder used by the
 * landing pad at @0xd23b1d after `operator delete` returns. Not on this
 * class's decoded surface.
 */
function unwind_Resume(_exc: unknown): void {
  throw new Error(
    "ScheduledIOWorkerThread: __Unwind_Resume not modelled in the raw-port " +
      "runtime @Flexo call site 0xd23b1d (stub 0x1495d30)"
  );
}

/**
 * Function-local static bss for `ScheduledIOWorkerThread::instance()`.
 *   +0x1c7f500  s_instance   FFWorkerQueue*  — cached lazy-init pointer.
 *   +0x1c7f508  s_predicate  dispatch_once_t (== `long`, 8B) — GCD one-shot
 *                            guard. Compared against `-0x1` in the fast path
 *                            (`cmpq $-0x1, s_predicate(%rip)` @0xd23ab0);
 *                            `dispatch_once` sets it to that value once the
 *                            block has finished running.
 * Modelled as a module-level singleton object; the "address of the predicate"
 * that would be passed to _dispatch_once is `bss.predicate` as a boxed field.
 */
const bss = {
  s_instance: null as FFWorkerQueue | null,
  s_predicate: { value: 0n }, // dispatch_once_t; 0 = not yet run, -1 = done (per GCD's ABI)
};

/**
 * `____ZN23ScheduledIOWorkerThread8instanceEv_block_invoke` — the block body
 * that `_dispatch_once` invokes exactly once. Not exported under
 * ScheduledIOWorkerThread's demangled surface but IS a private helper the
 * linker exposes as its own symbol at Flexo 0xd23ae0.
 *
 * Address-by-address:
 *   @0xd23ae0..0xd23ae6  prologue: `pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx`.
 *   @0xd23ae7            movl $0x88, %edi — size = sizeof(FFWorkerQueue) = 136.
 *   @0xd23aec            callq _Znwm — allocation returned in %rax.
 *   @0xd23af1            movq %rax, %rbx — spill allocation.
 *   @0xd23af4            leaq (rip-relative), %rsi — string literal address
 *                        "com.apple.flexo.audio-scheduled-io-worker-thread"
 *                        (identified by the `## literal pool for:` comment on
 *                        the disasm line at @0xd23af4).
 *   @0xd23afb            movq %rax, %rdi — this = allocation.
 *   @0xd23afe            callq FFWorkerQueue::FFWorkerQueue(char const*).
 *   @0xd23b03            movq %rbx, s_instance(%rip) — publish the pointer.
 *   @0xd23b0a..0xd23b0e  epilogue: `popq %rbx; popq %r14; popq %rbp; retq`.
 *
 * On the exception path (the ctor throws):
 *   @0xd23b0f  movq %rax, %r14 — spill the exception object.
 *   @0xd23b12  movq %rbx, %rdi — allocation as arg.
 *   @0xd23b15  callq operator delete(void*).
 *   @0xd23b1a  movq %r14, %rdi — restore exception object.
 *   @0xd23b1d  callq __Unwind_Resume.
 */
function instance_block_invoke(): void {
  try {
    // @0xd23ae7..0xd23aec — allocation.
    const allocation = cxx_operator_new(0x88);

    // @0xd23af4..0xd23afe — construct the FFWorkerQueue with the C-string label.
    // The literal at @0xd23af4 is
    //   "com.apple.flexo.audio-scheduled-io-worker-thread"
    // as pinned by the `## literal pool for: …` comment on the disasm line.
    FFWorkerQueue_ctor_charStar(
      allocation,
      "com.apple.flexo.audio-scheduled-io-worker-thread"
    );

    // @0xd23b03 — publish the pointer into s_instance.
    bss.s_instance = allocation;
    // @0xd23b0a..0xd23b0e — epilogue: return.
  } catch (exc) {
    // Landing pad @0xd23b0f..0xd23b1d — delete the storage and unwind.
    // NOTE: in the raw-port surface `FFWorkerQueue_ctor_charStar` throws
    // unconditionally, so this branch WILL fire on any live call. That's the
    // decoded behaviour of the C++ landing pad if the ctor were to actually
    // throw — the raw-port stub happens to always throw, so the two
    // coincide. `cxx_operator_delete` is itself a stub in raw-port, so it
    // will re-throw and short-circuit `unwind_Resume`; both citations are
    // preserved for provenance.
    cxx_operator_delete(bss.s_instance as FFWorkerQueue);
    unwind_Resume(exc);
    throw exc;
  }
}

/**
 * `ScheduledIOWorkerThread::instance()` — the fast/slow-path entry point.
 * Mangled `__ZN23ScheduledIOWorkerThread8instanceEv` at @Flexo 0xd23ab0.
 *
 * Address-by-address:
 *   @0xd23ab0  cmpq $-0x1, s_predicate(%rip) — GCD "done" sentinel is -1.
 *   @0xd23ab8  jne  0xd23ac2                — not done: slow path.
 *   @0xd23aba  movq s_instance(%rip), %rax  — done: return cached pointer.
 *   @0xd23ac1  retq
 *   @0xd23ac2..0xd23ac5  prologue (align stack for the cold call).
 *   @0xd23ac6  callq instance().cold.1     — dispatch_once slow path
 *                                            (ICF-aliased to
 *                                             FFScheduledReadAudioFileD2.cold.1).
 *   @0xd23acb  popq %rbp                   — epilogue.
 *   @0xd23acc  movq s_instance(%rip), %rax — reload pointer after init.
 *   @0xd23ad3  retq
 *
 * The cold.1 body at Flexo 0x1487710 is a bare tail-jmp `_dispatch_once` with
 * (&s_predicate, &block_literal_global). We inline the equivalent logic here:
 * call `gcd_dispatch_once(&s_predicate, instance_block_invoke)`, which is the
 * only decoded semantics available for the cold-path.
 */
export function instance(): FFWorkerQueue {
  // @0xd23ab0..0xd23ab8 — fast path: if s_predicate == -1, return s_instance.
  // GCD's convention (from libdispatch source): dispatch_once_t is 0 before
  // the block runs and set to `~0L` (== -1) after the block completes.
  if (bss.s_predicate.value === -1n) {
    // @0xd23aba..0xd23ac1 — return s_instance.
    // In the C++ decode, s_instance may be null at this point in principle
    // but the fast path's `cmpq $-0x1, s_predicate` guarantees the block has
    // run so it's non-null. We preserve the raw load as-is.
    return bss.s_instance as FFWorkerQueue;
  }

  // @0xd23ac2..0xd23acb — cold slow path: run dispatch_once. This is a call
  // (not a tail-call in the outer function; the outer function reloads
  // s_instance after the call at @0xd23acc). We inline the cold.1 semantics
  // (`_dispatch_once(&s_predicate, block)`) rather than modelling the ICF-
  // shared cold stub separately.
  //
  // The cold stub `__ZN23ScheduledIOWorkerThread8instanceEv.cold.1` at
  // Flexo 0x1487710 loads &s_predicate (@0x1487714) + &___block_literal_global
  // (@0x148771b) and tail-jmps _dispatch_once (@0x1487723, stub 0x1497674).
  gcd_dispatch_once(bss.s_predicate, instance_block_invoke);

  // @0xd23acc..0xd23ad3 — reload s_instance and return.
  return bss.s_instance as FFWorkerQueue;
}
