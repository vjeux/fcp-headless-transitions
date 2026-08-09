// OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample2Impl —
// ProChannel static singleton accessor for the "blueSample2" sampler impl
// of OZChannelColorNoAlpha.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEv.s
//
// This unit ports ONLY the `getInstance()` static accessor at
// @0x580c2. Its shape is the standard libc++ std::call_once-guarded
// singleton — identical to the sibling OZChannelColorNoAlpha_redSample1Impl
// @0x575d6 and every *_Factory::getInstance in ProChannel. The
// returned/backing global is a *plain static pointer symbol*
// `_OZChannelColorNoAlpha_blueSample2` (an
// OZChannelColorNoAlpha_blueSample2Impl*), loaded @0x58101 as the return
// value. Every other method on this impl is a separate ledger entry and
// OUT OF SCOPE for this file (per the "one class per file" rule — extend
// this file later, never create a sibling).
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
// -----------------------------------------------------------------------------
//   __ZZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEvE42OZChannelColorNoAlpha_blueSample2Impl_once
//     — the libc++ std::once_flag word (an `unsigned long`). 0 = "not
//       started"; intermediate = "another thread running init"; -1 =
//       "init complete" (libc++ writes ~0UL on success). The
//       `cmpq $-0x1, %rax` @0x580c9 is the standard libc++ fast-path
//       "init done?" check.
//
//   __ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl34_OZChannelColorNoAlpha_blueSample2E
//     — an `OZChannelColorNoAlpha_blueSample2Impl*` (the singleton
//       pointer). Written by the lambda that std::__call_once invokes on
//       first call; read @0x58101 as getInstance's return value.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs / SEPARATE ledger units)
// -----------------------------------------------------------------------------
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*))
//       — libc++ (libc++.dylib) — TRUE out-of-scope extern. Called
//         @0x580f7 via ProChannel stub 0xacdc8 (same stub as every other
//         *_Factory::getInstance in ProChannel).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<...getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation. NOT called directly — it is
//         PASSED AS A DATA REFERENCE (leaq @0x580f0, function-pointer
//         arg in %rdx) to __call_once, which dispatches through it. The
//         proxy body (a SEPARATE ledger entry) allocates the singleton
//         via `operator new` and invokes the impl's ctor, storing the
//         result into `_OZChannelColorNoAlpha_blueSample2`. It is a
//         TRANSITIVE dependency of getInstance, not a direct callee.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEv
//       — OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample2Impl::getInstance()
//         @ProChannel 0x580c2
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEv.s)
// -----------------------------------------------------------------------------
//   0x580c2  movq   _..._once(%rip), %rax             ; rax = _once
//   0x580c9  cmpq   $-0x1, %rax                       ; already-init check
//                                                     ; (libc++ writes ~0UL)
//   0x580cd  je     0x58101                           ; fast path: skip call_once
//   0x580cf  pushq  %rbp                              ; frame prologue
//   0x580d0  movq   %rsp, %rbp
//   0x580d3  subq   $0x20, %rsp                       ; 32-byte local frame
//   0x580d7  leaq   -0x1(%rbp), %rax                  ; &frame[-1] (empty
//                                                     ; captureless lambda slot)
//   0x580db  leaq   -0x18(%rbp), %rcx                 ; &tuple<T&&> slot
//   0x580df  movq   %rax, (%rcx)                      ; tuple.head = &lambda-slot
//   0x580e2  leaq   -0x10(%rbp), %rsi                 ; &call_once arg (void*)
//   0x580e6  movq   %rcx, (%rsi)                      ; *arg = &tuple
//   0x580e9  leaq   _..._once(%rip), %rdi             ; rdi = &_once
//   0x580f0  leaq   __call_once_proxy<...>(%rip), %rdx; rdx = &proxy_func
//   0x580f7  callq  std::__call_once                   ; libc++ stub @0xacdc8
//   0x580fc  addq   $0x20, %rsp                       ; epilogue (of once-block)
//   0x58100  popq   %rbp
//   0x58101  movq   _OZChannelColorNoAlpha_blueSample2(%rip), %rax
//                                                     ; rax = the singleton ptr
//                                                     ; (return value; NULL if
//                                                     ; init raised)
//   0x58108  retq
//
// NOTE ON FRAME SHAPE: the fast-path check @0x580c9 runs BEFORE the
// prologue, and the epilogue @0x580fc-0x58100 sits inside the once-block;
// the fast path (je 0x58101) reaches the `movq _OZChannelColorNoAlpha_blueSample2`
// / `retq` tail directly without a frame. Observable behaviour: run
// call_once at most once, then return the backing pointer.

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each at fixed linker-assigned
// addresses. Modelled as module-scope `let`s (TS has no linker). Initial
// state mirrors zero-filled BSS at load:
//   _once        = 0n   (libc++ once_flag zero — "not yet initialised")
//   _blueSample2 = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS `__ZZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEvE42OZChannelColorNoAlpha_blueSample2Impl_once`.
 *  libc++ std::once_flag word. 0n = not started; 2n/3n = another thread
 *  running init; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed. getInstance
 *  compares this to $-1 @0x580c9 as its fast-path check. */
let _once: bigint = 0n; // @ProChannel BSS, read-site 0x580c2

/** @ProChannel BSS `__ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl34_OZChannelColorNoAlpha_blueSample2E`.
 *  The singleton pointer. Read @0x58101 (the return value). Written by
 *  the __call_once_proxy lambda (a SEPARATE ledger unit). */
let _blueSample2: OZChannelColorNoAlpha_blueSample2Impl | null = null; // @ProChannel BSS 0x58101

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x580f7 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). No libc++ runtime
 * in this port, so we model the "run the initializer exactly once,
 * atomically" contract at the JS single-threaded level: on first call
 * with a zero once_flag, invoke proxy(arg) and — IF it completes without
 * throwing — write $-1 into the flag; on subsequent calls no-op. If the
 * proxy throws, the flag stays 0 (libc++'s ~0UL-on-success write is
 * skipped) and future calls retry, exactly like the real runtime. This
 * is the minimum behaviour getInstance's fast-path @0x580c9 `cmp $-1`
 * relies on. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0x580c9)
  proxy(arg); // single-threaded: run initializer directly
  once.set(-1n); // mark ~0UL on success
}

/**
 * `__ZNSt3__117__call_once_proxy<...>` — libc++ template instantiation
 * for this getInstance's captureless lambda. Body (a SEPARATE ledger
 * unit) allocates a fresh OZChannelColorNoAlpha_blueSample2Impl via
 * `operator new` and invokes its ctor, then stores the pointer into
 * `_OZChannelColorNoAlpha_blueSample2`. That allocation lives INSIDE the
 * proxy — NOT here — so getInstance never does an in-frame `new`. Until
 * the proxy/ctor units are claimed, this raises with the exact frontier
 * call-sites documented. Invoked from std::__call_once @0x580f7. */
function __call_once_proxy_blueSample2_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelColorNoAlpha_blueSample2Impl::getInstance() __call_once " +
      "init lambda not yet transcribed — the lambda body allocates via " +
      "operator new (libc++ extern) then invokes the " +
      "OZChannelColorNoAlpha_blueSample2Impl ctor (separate ledger unit — " +
      "not yet ported) and stores the result into " +
      "_OZChannelColorNoAlpha_blueSample2. This proxy lambda is a SEPARATE " +
      "ledger unit and will be filled in when it is next claimed. The " +
      "proxy is invoked from std::__call_once at ProChannel 0x580f7.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelColorNoAlpha::OZChannelColorNoAlpha_blueSample2Impl` — the
 * "blueSample2" sampler impl nested in OZChannelColorNoAlpha. Only its
 * getInstance() static accessor is ported here; every other method is a
 * separate ledger entry.
 */
export class OZChannelColorNoAlpha_blueSample2Impl {
  /**
   * `OZChannelColorNoAlpha_blueSample2Impl::getInstance()` —
   * @ProChannel 0x580c2
   * (__ZN21OZChannelColorNoAlpha37OZChannelColorNoAlpha_blueSample2Impl11getInstanceEv).
   *
   * Faithful transcription of the disassembly in the file header.
   * Standard libc++ std::call_once-guarded singleton accessor:
   *
   *   1. @0x580c2-0x580c9 — read the once_flag; if it equals $-1 (~0UL,
   *      libc++'s "init complete" sentinel) @0x580cd jump straight to the
   *      return tail (0x58101).
   *   2. @0x580cf-0x580f7 — (in the not-yet-init branch) set up the
   *      libc++ tuple<lambda&&> on the stack and call
   *      std::__call_once(&_once, arg, &proxy). The proxy unpacks the
   *      tuple, invokes the lambda, which allocates + constructs the
   *      singleton and writes it to _OZChannelColorNoAlpha_blueSample2.
   *   3. @0x58101-0x58108 — return _OZChannelColorNoAlpha_blueSample2
   *      (whatever the initializer wrote — or NULL if it threw).
   *
   * The stack tuple + captureless-lambda dance @0x580d7-0x580e6 is an
   * ABI artefact of libc++'s __call_once template; the caller doesn't
   * observe the intermediate slots, so std_call_once (above) invokes the
   * proxy directly (single-threaded, no ABI marshaling). Documented for
   * provenance; no observable effect.
   */
  static getInstance(): OZChannelColorNoAlpha_blueSample2Impl | null {
    // @0x580c2-0x580cd — if (_once == -1) goto return-tail (0x58101).
    if (_once !== -1n) {
      // @0x580cf-0x580e6 — prologue + set up libc++ tuple<lambda&&>
      // (ABI-level, no TS-visible effect; the proxy just needs a stable
      // void* to dispatch through — we pass a null placeholder).
      // @0x580e9 — rdi = &_once.
      // @0x580f0 — rdx = &__call_once_proxy<...lambda...>.
      // @0x580f7 — callq std::__call_once (libc++ stub @0xacdc8).
      // @0x580fc-0x58100 — epilogue of the once-block.
      std_call_once(
        {
          get: (): bigint => _once, // mirrors `movq (%rax),%rax` @0x580c2 read
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_blueSample2_lambda,
      );
    }
    // @0x58101-0x58108 — rax = _OZChannelColorNoAlpha_blueSample2; retq.
    return _blueSample2;
  }
}
