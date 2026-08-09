// OZChannelGradient::OZChannelGradient_colorSpaceIDImpl — the process-wide
// "colorSpaceID" default instance holder for the gradient channel scope.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 fat sub-slice).
//
// Source disassembly:
//   raw-port/re/disasm/ProChannel.__ZN17OZChannelGradient34OZChannelGradient_colorSpaceIDImpl11getInstanceEv.s
//     -> OZChannelGradient::OZChannelGradient_colorSpaceIDImpl::getInstance()  @ProChannel 0x6a412
//
// This unit ports ONLY the `getInstance()` static singleton accessor
// (@ProChannel 0x6a412). It is the canonical libc++ std::call_once-guarded
// Meyers-singleton accessor — byte-for-byte the same shape as
// OZChannel_Factory::getInstance() (@ProChannel 0x17d4) and
// OZChannelColorNoAlpha_whiteImpl::getInstance() (@ProChannel 0x57404), both
// already ported in this tree. The only differences are the two
// process-global symbol addresses it reads/writes.
//
// PROCESS-GLOBAL STORAGE (the two symbols getInstance reads/writes)
//
//   * __ZZN17OZChannelGradient34OZChannelGradient_colorSpaceIDImpl11getInstanceEvE39OZChannelGradient_colorSpaceIDImpl_once
//       — the function-local-static libc++ once_flag guard word. Read
//       @0x6a412 (`movq …_once(%rip),%rax`); compared to $-1 @0x6a419.
//       Semantics: 0 = "not yet initialised" (BSS zero-fill); -1 (~0UL) =
//       "initialisation complete" (written by libc++ __call_once on
//       success). Passed BY ADDRESS to std::__call_once @0x6a439.
//
//   * __ZN17OZChannelGradient34OZChannelGradient_colorSpaceIDImpl31_OZChannelGradient_colorSpaceIDE
//       — the singleton instance pointer. Read @0x6a451
//       (`movq …_OZChannelGradient_colorSpaceID(%rip),%rax`) and returned in
//       %rax @0x6a458. Written by the __call_once_proxy → __invoke thunk on
//       first call (a SEPARATE function / ledger unit, NOT reachable from
//       this frame — see below).
//
// TRUE OUT-OF-SCOPE EXTERNS referenced by this frame
//
//   * __ZNSt3__111__call_onceERVmPvPFvS2_E
//       — std::__1::__call_once(flag&, void*, void(*)(void*)), libc++
//       (libc++.dylib). Called @0x6a447 via ProChannel stub 0xacdc8. Same
//       libc++ runtime primitive modelled by OZChannel_Factory and HGMemory's
//       call_once. Out-of-scope extern (libc++ runtime).
//
//   * __ZNSt3__117__call_once_proxyB9nqe210106<
//         tuple<OZChannelGradient::OZChannelGradient_colorSpaceIDImpl::getInstance()::'lambda'()&&>>(void*)
//       — libc++ template instantiation (the proxy trampoline). Its ADDRESS
//       is loaded into %rdx @0x6a440 (`leaq __call_once_proxy(%rip),%rdx`)
//       and handed to std::__call_once, which dispatches through it on first
//       call. It is NOT a direct callee of getInstance (getInstance's only
//       `callq` target is std::__call_once @0x6a447). The proxy body unpacks
//       the tuple, invokes the captureless init lambda (which allocates the
//       singleton via `operator new` and constructs it, then stores it into
//       `_OZChannelGradient_colorSpaceID`), and is a SEPARATE ledger unit —
//       the allocation happens INSIDE __call_once_proxy, never in this frame,
//       so this file fabricates NO `new OZChannelGradient(...)`.
//
// FULL DISASM (raw-port/re/disasm/ProChannel.…colorSpaceIDImpl11getInstanceEv.s)
//   0x6a412  movq   _once(%rip),%rax                  ; rax = _once flag
//   0x6a419  cmpq   $-0x1,%rax                        ; flag == -1 (init done)?
//   0x6a41d  je     0x6a451                           ; fast path: skip call_once
//   0x6a41f  pushq  %rbp                              ; prologue
//   0x6a420  movq   %rsp,%rbp
//   0x6a423  subq   $0x20,%rsp                        ; 0x20-byte local frame
//   0x6a427  leaq   -0x1(%rbp),%rax                   ; &(captureless-lambda 1-byte slot)
//   0x6a42b  leaq   -0x18(%rbp),%rcx                  ; &tuple.head
//   0x6a42f  movq   %rax,(%rcx)                       ; tuple.head = &lambda-slot
//   0x6a432  leaq   -0x10(%rbp),%rsi                  ; &arg (void* for call_once)
//   0x6a436  movq   %rcx,(%rsi)                       ; arg = &tuple.head
//   0x6a439  leaq   _once(%rip),%rdi                  ; rdi = &_once flag
//   0x6a440  leaq   __call_once_proxy<…>(%rip),%rdx   ; rdx = &proxy_func
//   0x6a447  callq  std::__call_once                  ; libc++ stub @0xacdc8
//   0x6a44c  addq   $0x20,%rsp                        ; epilogue
//   0x6a450  popq   %rbp
//   0x6a451  movq   _OZChannelGradient_colorSpaceID(%rip),%rax ; rax = singleton ptr
//   0x6a458  retq                                     ; return rax

// ═════════════════════════════════════════════════════════════════════════
// Process-global BSS slots — one 8-byte word each, sitting at fixed
// linker-assigned addresses in ProChannel's __bss. TS has no linker, so we
// model them as module-scope `let`s. BSS is zero-filled at load:
//   _once           = 0n   (libc++ once_flag: "not yet initialised")
//   _colorSpaceID   = null (nullptr — no singleton allocated yet)
// ═════════════════════════════════════════════════════════════════════════

/** @ProChannel BSS
 *  `__ZZN17OZChannelGradient34OZChannelGradient_colorSpaceIDImpl11getInstanceEvE39OZChannelGradient_colorSpaceIDImpl_once`.
 *  libc++ std::once_flag word. 0n = not started; -1n (0xFFFF_FFFF_FFFF_FFFF)
 *  = completed. getInstance compares this to $-1 @0x6a419 as its fast-path
 *  check. Read-site @0x6a412; passed by address to __call_once @0x6a439. */
let _once: bigint = 0n; // @ProChannel BSS 0x6a412 read-site

/** @ProChannel BSS
 *  `__ZN17OZChannelGradient34OZChannelGradient_colorSpaceIDImpl31_OZChannelGradient_colorSpaceIDE`.
 *  The singleton instance pointer. Read @0x6a451 (the return value). Written
 *  by the __call_once_proxy → __invoke thunk (a separate function / ledger
 *  unit — allocation happens there, NOT in this frame). */
let _colorSpaceID: unknown = null; // @ProChannel BSS 0x6a451

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from getInstance @0x6a447 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). In this port there is
 * no libc++ runtime, so we model the "run the initializer exactly once,
 * atomically" contract at the JS single-threaded level: on first call with a
 * zero once_flag, we invoke the proxy(arg) and — IF it completes without
 * throwing — write $-1 into the flag; on subsequent calls we no-op. If the
 * proxy throws, the flag stays 0 (libc++'s ~0UL-on-success write is skipped)
 * and future calls retry, exactly like the real runtime. This is the minimum
 * behaviour getInstance's disasm relies on (the fast-path @0x6a419 `cmp $-1`
 * check). Identical model to OZChannel_Factory::getInstance()'s std_call_once. */
function std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x6a419 fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed in
  // JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<…tuple<…colorSpaceIDImpl::getInstance()::'lambda'()&&>>`
 * — libc++ template instantiation (proxy trampoline whose ADDRESS is taken
 * @0x6a440). It unpacks the stack tuple and invokes the captureless init
 * lambda; the lambda allocates a fresh OZChannelGradient (via `operator new`)
 * + constructs it and stores the pointer into `_OZChannelGradient_colorSpaceID`.
 * That allocation + ctor lives ENTIRELY INSIDE the proxy/__invoke thunk — a
 * SEPARATE ledger unit — never in getInstance's frame. Since neither the
 * proxy body nor the init lambda / ctor is ported yet, this stub raises
 * loudly with the exact @0xADDR of the dispatch site (per PORTING_SPEC Rule
 * 3). It will be filled in when the proxy/lambda unit is next claimed. We do
 * NOT fabricate `new OZChannelGradient()` here — the anti-cheat forbids
 * modelling the boundary that way. */
function __call_once_proxy_getInstance_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelGradient::OZChannelGradient_colorSpaceIDImpl::getInstance() " +
      "__call_once init lambda not yet transcribed — the proxy trampoline " +
      "(__ZNSt3__117__call_once_proxy<…colorSpaceIDImpl…lambda…>, address " +
      "taken @ProChannel 0x6a440) unpacks the tuple, allocates + constructs " +
      "the singleton OZChannelGradient and stores it into " +
      "_OZChannelGradient_colorSpaceID. That allocation + ctor is a SEPARATE " +
      "ledger unit living inside the proxy/__invoke thunk — not in this " +
      "frame. It will be filled in when that unit is claimed. The proxy is " +
      "dispatched by std::__call_once from getInstance @ProChannel 0x6a447.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelGradient::OZChannelGradient_colorSpaceIDImpl` — the holder for
 * the process-wide "colorSpaceID" default OZChannelGradient instance. Only
 * its getInstance() accessor is ported in this file; the init lambda / ctor
 * is a separate ledger entry (see __call_once_proxy_getInstance_lambda).
 */
export class OZChannelGradient_colorSpaceIDImpl {
  /**
   * `OZChannelGradient::OZChannelGradient_colorSpaceIDImpl::getInstance()`
   * — @ProChannel 0x6a412
   * (__ZN17OZChannelGradient34OZChannelGradient_colorSpaceIDImpl11getInstanceEv).
   *
   * Faithful line-for-line transcription of the disassembly quoted in the
   * file header. Standard libc++ std::call_once-guarded singleton accessor:
   *
   *   1. Read the once_flag @0x6a412; if it equals $-1 (~0UL, libc++'s "init
   *      complete" sentinel), branch @0x6a41d straight to the return
   *      (0x6a451) — skipping the call_once slow path entirely.
   *
   *   2. Otherwise set up the stack tuple<lambda&&> that libc++'s
   *      __call_once ABI expects (@0x6a427..0x6a436), load &_once into %rdi
   *      @0x6a439 and &proxy into %rdx @0x6a440, then call std::__call_once
   *      @0x6a447. The proxy allocates + constructs the singleton and writes
   *      it to `_OZChannelGradient_colorSpaceID`.
   *
   *   3. Return `_OZChannelGradient_colorSpaceID` (@0x6a451 — whatever the
   *      initializer wrote, or NULL if it threw and never got to write).
   *
   * The stack tuple + captureless-lambda dance @0x6a427..0x6a436 is an
   * ABI-level artefact of libc++'s __call_once template instantiation — the
   * caller side just does "call call_once with the proxy pointer" and does
   * not observe the intermediate slots. In this port std_call_once invokes
   * the proxy directly (single-threaded, no ABI marshaling needed), so the
   * two stack slots need not be modelled; they are documented for provenance.
   */
  static getInstance(): unknown {
    // ------------------------------------------------------------
    // @0x6a412 — rax = _once.
    // @0x6a419..0x6a41d — if (_once == -1) goto fast_path (0x6a451).
    // ------------------------------------------------------------
    if (_once !== -1n) {
      // ------------------------------------------------------------
      // @0x6a41f..0x6a423 — prologue + 0x20-byte local frame.
      // @0x6a427..0x6a436 — set up libc++ tuple<lambda&&> on the stack.
      //   (ABI-level, no TS-visible effect — the proxy just needs a stable
      //   void* to dispatch through; we pass a null placeholder.)
      // @0x6a439 — rdi = &_once.
      // @0x6a440 — rdx = &__call_once_proxy<…lambda…> (address taken).
      // @0x6a447 — callq std::__call_once (libc++ stub @0xacdc8).
      // @0x6a44c..0x6a450 — epilogue.
      // ------------------------------------------------------------
      std_call_once(
        {
          get: (): bigint => _once, // (mirrors `movq …_once(%rip),%rax` @0x6a412 read-side)
          set: (v: bigint): void => {
            _once = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_getInstance_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x6a451 — rax = _OZChannelGradient_colorSpaceID.
    // @0x6a458 — retq (return rax).
    // ------------------------------------------------------------
    return _colorSpaceID;
  }
}
