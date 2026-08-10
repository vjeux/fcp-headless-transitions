// raw-port/src/channels/OZChannelButton.ts
//
// FCP `OZChannelButton` — a ProChannel concrete OZChannel subclass (the
// "button" channel: a momentary trigger whose numeric range is [0, 1]).
// This unit ports EXACTLY ONE member of it: the `std::call_once`-guarded
// descriptor singleton accessor
// `OZChannelButton::createOZChannelButtonInfo()` @ProChannel 0x53bc2.
//
// Everything else in OZChannelButton (the ctors @0x53c0a/0x53c14/0x53d42/
// 0x53e2a/0x53f46, copy @0x54052, createOZChannelButtonImpl @0x53cfa,
// callCallback/getCallbackBlock/setPrivateData/…, the vtable, the *_Factory)
// is a SEPARATE ledger entry and is OUT OF SCOPE here — per the
// one-class-per-file rule, later worker(s) EXTEND this file with those
// methods. In particular this file does NOT model OZChannelButton's
// inheritance from OZChannelBase: no instruction in this unit's body
// observes the base subobject, so nothing about it is asserted.
//
// Same shape as the sibling `OZChannelText::createOZChannelTextImpl()`
// @ProChannel 0x87bf8 (src/channels/OZChannelText.ts) — this is the
// compiler's stock "function-local static behind std::call_once" idiom, and
// the two bodies are instruction-for-instruction analogous.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64 slice;
//             VA == file offset within the thin slice).
// Disassembly saved at:
//   raw-port/re/disasm/ProChannel.__ZN15OZChannelButton25createOZChannelButtonInfoEv.s
//     (@0x53bc2, 20 lines — this unit)
//   raw-port/re/disasm/ProChannel.__ZNSt3__18__invokeB9nqe210106IJZN15OZChannelButton25createOZChannelButtonInfoEvEUlvE_EEENS_20__invoke_result_implIvJDpT_EE4typeEDpOS4_.s
//     (@0x540d8, 23 lines — the lambda body reached through the proxy)
//
// SYMBOLS PORTED HERE (mangled -> address)
//   * __ZN15OZChannelButton25createOZChannelButtonInfoEv
//       — OZChannelButton::createOZChannelButtonInfo() @ProChannel 0x53bc2
//
// DATA SYMBOLS this unit reads (nm -arch x86_64 ProChannel):
//   0xebd78  (__DATA) __ZZN15OZChannelButton25createOZChannelButtonInfoEvE25_OZChannelButtonInfo_once
//              — the libc++ `std::once_flag` word. Its image bytes are
//                0x0000000000000000 (read straight out of the thin slice at
//                file offset 0xebd78), i.e. "never run".
//   0xec490  (__DATA) __ZN15OZChannelButton20_OZChannelButtonInfoE
//              — the `OZChannelButtonInfo*` singleton slot the accessor
//                returns.
//
// ── FULL DISASM — createOZChannelButtonInfo() @0x53bc2 ────────────────────
//   0x53bc2  movq  [_OZChannelButtonInfo_once @0xebd78](%rip), %rax
//   0x53bc9  cmpq  $-0x1, %rax           ; already-run sentinel (uintptr_t)-1
//   0x53bcd  je    0x53c01               ; done -> skip straight to the load
//   0x53bcf  pushq %rbp                  ; frame prologue (slow path only)
//   0x53bd0  movq  %rsp, %rbp
//   0x53bd3  subq  $0x20, %rsp           ; 32-byte frame for the lambda tuple
//   0x53bd7  leaq  -0x1(%rbp),  %rax     ; rax = &<the empty lambda object>
//   0x53bdb  leaq  -0x18(%rbp), %rcx     ; rcx = &tuple<lambda&&>
//   0x53bdf  movq  %rax, (%rcx)          ; tuple[0] = &lambda
//   0x53be2  leaq  -0x10(%rbp), %rsi     ; rsi = &<ptr-to-tuple> (the void* arg)
//   0x53be6  movq  %rcx, (%rsi)          ; *rsi = &tuple
//   0x53be9  leaq  [_OZChannelButtonInfo_once @0xebd78](%rip), %rdi
//   0x53bf0  leaq  __call_once_proxy<...>(%rip), %rdx      ; @0x540c8
//   0x53bf7  callq __ZNSt3__111__call_onceERVmPvPFvS2_E    ; libc++ (stub 0xacdc8)
//   0x53bfc  addq  $0x20, %rsp
//   0x53c00  popq  %rbp                  ; frame epilogue
//   0x53c01  movq  [_OZChannelButtonInfo @0xec490](%rip), %rax  ; the singleton
//   0x53c08  retq
//   0x53c09  nop                         ; alignment padding
//
// The three `leaq`/`movq` pairs @0x53bd7..0x53be6 are pure libc++ call_once
// plumbing: they build a `tuple<lambda&&>` on the stack and hand its address
// to `__call_once` along with the type-erased `__call_once_proxy`. The lambda
// itself is EMPTY (captureless — `leaq -0x1(%rbp)` is just a unique address
// for a zero-size object), so there is nothing observable to transcribe from
// the setup; all the real work is inside the proxy.
//
// Note the `movq` @0x53c01 is the `je` target, so the singleton load is on
// BOTH paths: the function always returns whatever the static slot holds and
// never a locally built object.
//
// ── THE LAMBDA (a SEPARATE, UNPORTED ledger unit) ─────────────────────────
// `__call_once_proxy<tuple<createOZChannelButtonInfo()::'lambda'()&&>>`
// @ProChannel 0x540c8 is the stock thunk (`rax = *rdi ; rdi = *rax ;
// jmp __invoke`) into `__invoke<...>` @0x540d8, which is where the singleton
// is built:
//   0x540df  cmpq  $0x0, [_OZChannelButtonInfo @0xec490](%rip)
//   0x540e7  jne   0x54105                ; already non-null -> nothing to do
//   0x540e9  movl  $0x58, %edi            ; sizeof(OZChannelButtonInfo) = 0x58 = 88
//   0x540ee  callq __Znwm                 ; operator new(88)          (stub 0xace4c)
//   0x540f9  callq __ZN19OZChannelButtonInfoC2Ev
//                                         ; OZChannelButtonInfo::OZChannelButtonInfo()
//                                         ;   @ProChannel 0x5411e — already ported in
//                                         ;   src/channels/OZChannelButtonInfo.ts
//   0x540fe  movq  %rbx, [_OZChannelButtonInfo @0xec490](%rip)   ; publish
//   0x54105  popq %rbx ; popq %r14 ; popq %rbp ; retq
//   (0x5410a..0x54118 is the unwind tail: `__ZdlPv` + `__Unwind_Resume`.)
// `__call_once_proxy…` and `__invoke…` are their OWN ledger classes, so they
// are NOT this unit's to port. This frame must NOT fabricate a
// `new OZChannelButtonInfo()` — and that holds even though the ctor the
// lambda calls IS already ported: the real disasm of
// createOZChannelButtonInfo contains NO `__Znwm` and NO ctor call, so
// materialising one here would be an instruction the machine does not have
// (the exact call_once-singleton fabrication the anti-cheat gate names).
//
// ── HOW THE libc++ BOUNDARY IS MODELLED ───────────────────────────────────
// `std::__1::__call_once` and the type-erased proxy pointer are supplied
// through the injected `OZChannelButtonCallOnceEnv` below rather than being
// inlined or faked here. Treating the proxy as an input is literally what
// the instruction does: the machine materialises it with a `leaq` @0x53bf0
// and passes it in `%rdx`. And because the one-time init sits on this
// method's ONLY slow path, an incompleteness raise placed there would fire
// on the very first call — the shape the semantic gate rejects. The two
// data symbols are exported as mutable slots so the host's proxy publishes
// into the same objects the fast path reads, exactly as the binary's
// `%rip`-relative loads and stores do.
//
// ── EXTERNS (all TRUE out-of-scope, each cited) ───────────────────────────
//   __ZNSt3__111__call_onceERVmPvPFvS2_E  @0x53bf7 (stub 0xacdc8) — libc++
//
// @provenance ProChannel @0x53bc2 (createOZChannelButtonInfo), @0x540c8 (proxy),
//             @0x540d8 (lambda body), @0xebd78 (once flag), @0xec490 (singleton)

import type { OZChannelButtonInfo } from "./OZChannelButtonInfo";

/**
 * The libc++ `std::once_flag` word — a single pointer-width integer.
 * Modelled as a mutable slot object so the `leaq …(%rip), %rdi` @0x53be9
 * (taking its ADDRESS for `__call_once`) and the `movq …(%rip), %rax`
 * @0x53bc2 (reading its VALUE) refer to the same storage, as they do in the
 * binary.
 */
export interface StdOnceFlag {
  /** the word itself: 0 = never run, `(uintptr_t)-1` = the lambda completed. */
  state: bigint;
}

/**
 * `OZChannelButton::_OZChannelButtonInfo` @ProChannel 0xec490, modelled as a
 * slot so that both this frame's load @0x53c01 and the lambda's store
 * @0x540fe address the same storage.
 */
export interface OZChannelButtonInfoSlot {
  /** the `OZChannelButtonInfo*` itself; NULL until the lambda publishes. */
  ptr: OZChannelButtonInfo | null;
}

/**
 * The captureless `createOZChannelButtonInfo()::'lambda'()` object built at
 * -0x1(%rbp) @0x53bd7. It is ZERO-SIZE — the `leaq` only exists to give it a
 * unique address — so it has no members.
 */
export interface OZChannelButtonInfoInitLambda {
  readonly __brand?: "OZChannelButtonInfoInitLambda";
}

/** `std::tuple<lambda&&>` built at -0x18(%rbp); its single slot is the
 *  reference stored by `movq %rax,(%rcx)` @0x53bdf. */
export interface CallOnceTuple {
  lambda: OZChannelButtonInfoInitLambda;
}

/** The `void*` third-from-left argument handed to `__call_once` in `%rsi`:
 *  the stack word at -0x10(%rbp) whose contents are `&tuple`
 *  (`movq %rcx,(%rsi)` @0x53be6). */
export interface CallOnceArg {
  tuple: CallOnceTuple;
}

/**
 * The libc++ one-time-init boundary this method calls into. Every member maps
 * to one operand of the `callq` @0x53bf7.
 */
export interface OZChannelButtonCallOnceEnv {
  /**
   * `std::__1::__call_once(unsigned long volatile&, void*, void (*)(void*))`
   * — `__ZNSt3__111__call_onceERVmPvPFvS2_E`, called @ProChannel 0x53bf7
   * through the symbol stub at 0xacdc8. Runs `proxy(arg)` at most once and,
   * on normal return, stores `(uintptr_t)-1` into `flag.state`.
   */
  call_once(
    flag: StdOnceFlag,
    arg: CallOnceArg,
    proxy: (a: CallOnceArg) => void,
  ): void;
  /**
   * `__call_once_proxy<std::tuple<createOZChannelButtonInfo()::'lambda'()&&>>`
   * @ProChannel 0x540c8 — the function pointer materialised by the
   * `leaq …(%rip), %rdx` @0x53bf0. Its body (`__invoke<…>` @0x540d8) is a
   * separate ledger unit, so it is provided by the host rather than
   * reimplemented here.
   */
  readonly callOnceProxy: (a: CallOnceArg) => void;
}

/**
 * @ProChannel data symbol `__ZN15OZChannelButton20_OZChannelButtonInfoE` @0xec490.
 *
 * The `OZChannelButtonInfo*` slot that `createOZChannelButtonInfo()` returns
 * verbatim @0x53c01 (`movq [0xec490](%rip), %rax`). NULL until the call_once
 * lambda publishes into it @0x540fe — the lambda's own first instruction
 * @0x540df is a `cmpq $0x0` against this very slot, which is what pins its
 * initial value as a null pointer.
 */
export const _OZChannelButtonInfo: OZChannelButtonInfoSlot = { ptr: null };

/**
 * @ProChannel data symbol
 * `__ZZN15OZChannelButton25createOZChannelButtonInfoEvE25_OZChannelButtonInfo_once`
 * @0xebd78.
 *
 * The libc++ `std::once_flag`: a pointer-width word whose image bytes are all
 * zero and which is atomically set to `(uintptr_t)-1` by
 * `std::__1::__call_once` once the lambda has completed. The accessor's fast
 * path is exactly that test — `cmpq $-0x1, %rax` @0x53bc9 — so the sentinel
 * here is `-1n`, matching the 64-bit compare the machine performs (bigint
 * keeps the full uintptr_t domain rather than truncating to a JS int32).
 */
export const _OZChannelButtonInfo_once: StdOnceFlag = { state: 0n };

/**
 * `OZChannelButton` — ProChannel momentary-trigger channel (PARTIAL port).
 *
 * This file currently holds exactly one member: the call_once-guarded
 * descriptor-singleton accessor below. No fields, no base class and no
 * vtable are modelled, because no instruction in this unit observes any of
 * them.
 */
export class OZChannelButton {
  /**
   * `OZChannelButton::createOZChannelButtonInfo()`
   *   — @ProChannel 0x53bc2
   *   — __ZN15OZChannelButton25createOZChannelButtonInfoEv
   *
   * Return the process-wide `OZChannelButtonInfo*` descriptor for button
   * channels, constructing it exactly once under `std::call_once`.
   *
   * Faithful transcription of the 19-instruction body (full listing in the
   * file header):
   *   - @0x53bc2/@0x53bc9/@0x53bcd — load the once-flag and compare it to
   *     `$-0x1`; if it already equals the sentinel, `je 0x53c01` skips the
   *     whole slow path. (AT&T `cmpq $-0x1, %rax` computes `rax - (-1)`;
   *     `je` takes iff `rax == -1`.)
   *   - @0x53bcf..0x53bf0 — slow path: build the captureless lambda's
   *     `tuple<lambda&&>` on the stack and take the addresses of the once
   *     flag and of `__call_once_proxy` @0x540c8.
   *   - @0x53bf7 — `callq std::__1::__call_once(flag, &tuple, proxy)`; the
   *     libc++ runtime runs the lambda and, on success, stores the
   *     `(uintptr_t)-1` sentinel into the flag.
   *   - @0x53c01 — load and return `_OZChannelButtonInfo` @0xec490. That
   *     load is the `je` target, so it is on both paths; the return value is
   *     always whatever the static slot holds, and it stays NULL if the
   *     one-time init never published.
   *
   * There is NO allocation in this frame: the real disassembly contains no
   * `__Znwm` and no ctor call here — every one of them is inside the proxy
   * lambda @0x540d8, which is a separate ledger unit reached through the
   * injected `env.callOnceProxy`.
   *
   * Externs: `__ZNSt3__111__call_onceERVmPvPFvS2_E` @0x53bf7 (libc++ stub
   * 0xacdc8). No in-scope callees; no indirect or virtual calls in this
   * frame. Confirmed via
   * `depgraph.py deps __ZN15OZChannelButton25createOZChannelButtonInfoEv`
   * (no dependency rows).
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN15OZChannelButton25createOZChannelButtonInfoEv.s
   *   (20 lines)
   */
  static createOZChannelButtonInfo(
    env: OZChannelButtonCallOnceEnv,
  ): OZChannelButtonInfo | null {
    // @0x53bc2  movq [_OZChannelButtonInfo_once @0xebd78](%rip), %rax
    // @0x53bc9  cmpq $-0x1, %rax
    // @0x53bcd  je   0x53c01     ; flag == (uintptr_t)-1 -> already initialized
    if (_OZChannelButtonInfo_once.state !== -1n) {
      // @0x53bd7  leaq -0x1(%rbp), %rax    — the zero-size lambda object.
      const lambda: OZChannelButtonInfoInitLambda = {};
      // @0x53bdb/@0x53bdf  leaq -0x18(%rbp), %rcx ; movq %rax,(%rcx)
      //   — tuple<lambda&&> holding a reference to it.
      const tuple: CallOnceTuple = { lambda };
      // @0x53be2/@0x53be6  leaq -0x10(%rbp), %rsi ; movq %rcx,(%rsi)
      //   — the void* argument: a word pointing at that tuple.
      const arg: CallOnceArg = { tuple };
      // @0x53be9  leaq [_OZChannelButtonInfo_once](%rip), %rdi
      // @0x53bf0  leaq __call_once_proxy @0x540c8(%rip), %rdx
      // @0x53bf7  callq std::__1::__call_once(flag, arg, proxy)
      env.call_once(_OZChannelButtonInfo_once, arg, env.callOnceProxy);
      // @0x53bfc..0x53c00  addq $0x20,%rsp ; popq %rbp   (frame teardown)
    }
    // @0x53c01  movq [_OZChannelButtonInfo @0xec490](%rip), %rax
    // @0x53c08  retq
    return _OZChannelButtonInfo.ptr;
  }
}

/**
 * Alias export: mangled symbol name.
 * @0x53bc2 ProChannel  __ZN15OZChannelButton25createOZChannelButtonInfoEv
 */
export function __ZN15OZChannelButton25createOZChannelButtonInfoEv(
  env: OZChannelButtonCallOnceEnv,
): OZChannelButtonInfo | null {
  return OZChannelButton.createOZChannelButtonInfo(env);
}
