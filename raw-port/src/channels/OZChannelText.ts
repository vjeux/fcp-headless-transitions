// raw-port/src/channels/OZChannelText.ts
//
// FCP `OZChannelText` — a ProChannel concrete OZChannel subclass (the
// animatable "text" channel). This unit ports EXACTLY ONE member of it:
// the `std::call_once`-guarded default-impl singleton accessor
// `OZChannelText::createOZChannelTextImpl()` @ProChannel 0x87bf8.
//
// Everything else in OZChannelText (ctors, dtors, clone, the vtable pair,
// createOZChannelTextInfo, the *_Factory, …) is a SEPARATE ledger entry and
// is OUT OF SCOPE here — per the one-class-per-file rule, later worker(s)
// EXTEND this file with those methods. In particular this file does NOT
// model OZChannelText's inheritance from OZChannel: no instruction in this
// unit's body observes the base subobject, so nothing about it is asserted.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64 slice).
// Disassembly saved at:
//   raw-port/re/disasm/ProChannel.__ZN13OZChannelText23createOZChannelTextImplEv.s
//     (@0x87bf8, 20 lines)
//   raw-port/re/disasm/ProChannel.__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN13OZChannelText23createOZChannelTextImplEvEUlvE_EEEEEvPv.s
//     (@0x88665, 7 lines — the proxy)
//   raw-port/re/disasm/ProChannel.__ZNSt3__18__invokeB9nqe210106IJZN13OZChannelText23createOZChannelTextImplEvEUlvE_EEENS_20__invoke_result_implIvJDpT_EE4typeEDpOS4_.s
//     (@0x88675, 40 lines — the lambda body)
//
// SYMBOLS PORTED HERE (mangled → address)
//   * __ZN13OZChannelText23createOZChannelTextImplEv
//       — OZChannelText::createOZChannelTextImpl() @ProChannel 0x87bf8
//
// DATA SYMBOLS this unit reads/writes (nm -arch x86_64 ProChannel):
//   0xec078  (__DATA) __ZZN13OZChannelText23createOZChannelTextImplEvE23_OZChannelTextImpl_once
//              — the libc++ `std::once_flag` word.
//   0xec790  (__DATA) __ZN13OZChannelText18_OZChannelTextImplE
//              — the `OZChannelImpl*` singleton slot the accessor returns.
//
// ── FULL DISASM — createOZChannelTextImpl() @0x87bf8 ──────────────────────
//   0x87bf8  movq  [_OZChannelTextImpl_once @0xec078](%rip), %rax
//   0x87bff  cmpq  $-0x1, %rax           ; already-run sentinel (uintptr_t)-1
//   0x87c03  je    0x87c37               ; done -> skip straight to the load
//   0x87c05  pushq %rbp                  ; frame prologue (slow path only)
//   0x87c06  movq  %rsp, %rbp
//   0x87c09  subq  $0x20, %rsp           ; 32-byte frame for the lambda tuple
//   0x87c0d  leaq  -0x1(%rbp),  %rax     ; rax = &<the empty lambda object>
//   0x87c11  leaq  -0x18(%rbp), %rcx     ; rcx = &tuple<lambda&&>
//   0x87c15  movq  %rax, (%rcx)          ; tuple[0] = &lambda
//   0x87c18  leaq  -0x10(%rbp), %rsi     ; rsi = &<ptr-to-tuple> (the void* arg)
//   0x87c1c  movq  %rcx, (%rsi)          ; *rsi = &tuple
//   0x87c1f  leaq  [_OZChannelTextImpl_once @0xec078](%rip), %rdi
//   0x87c26  leaq  __call_once_proxy<...>(%rip), %rdx      ; @0x88665
//   0x87c2d  callq __ZNSt3__111__call_onceERVmPvPFvS2_E    ; libc++ extern (stub 0xacdc8)
//   0x87c32  addq  $0x20, %rsp
//   0x87c36  popq  %rbp                  ; frame epilogue
//   0x87c37  movq  [_OZChannelTextImpl @0xec790](%rip), %rax   ; return the singleton
//   0x87c3e  retq
//   0x87c3f  nop                         ; alignment padding
//
// The three `leaq`/`movq` pairs @0x87c0d..0x87c1c are pure libc++ call_once
// plumbing: they build a `tuple<lambda&&>` on the stack and hand its address
// to `__call_once` along with the type-erased `__call_once_proxy`. The lambda
// itself is EMPTY (captureless — `leaq -0x1(%rbp)` is just a unique address
// for a zero-size object), so there is nothing to transcribe from the setup;
// all the real work is inside the proxy.
//
// ── THE LAMBDA (a SEPARATE, UNPORTED ledger unit) ─────────────────────────
// `__call_once_proxy<tuple<createOZChannelTextImpl()::'lambda'()&&>>` @0x88665
// is a 5-instruction thunk (`rax = *rdi ; rdi = *rax ; jmp __invoke`) into
// `__invoke<...'lambda'()>` @0x88675, which is where the singleton is built:
//   0x8867f  cmpq  $0x0, [_OZChannelTextImpl @0xec790](%rip)
//   0x88687  jne   0x886cd                 ; already non-null -> nothing to do
//   0x88689  movl  $0xb0, %edi             ; sizeof(OZCurveBool) = 0xb0 = 176
//   0x8868e  callq __Znwm                  ; operator new(176)
//   0x88696  xorps %xmm0, %xmm0            ; arg = 0.0
//   0x8869c  callq __ZN11OZCurveBoolC2Ed   ; OZCurveBool::OZCurveBool(0.0)
//   0x886a1  movl  $0x28, %edi             ; sizeof(OZChannelImpl) = 0x28 = 40
//   0x886a6  callq __Znwm                  ; operator new(40)
//   0x886ae  xorps %xmm0, %xmm0            ; arg2 = 0.0
//   0x886b7  movl  $0x1, %edx              ; arg3 = 1u
//   0x886bc  movl  $0x1, %ecx              ; arg4 = true
//   0x886c1  callq __ZN13OZChannelImplC1EP7OZCurvedjb
//                                          ; OZChannelImpl(curve, 0.0, 1u, true)
//   0x886c6  movq  %r14, [_OZChannelTextImpl @0xec790](%rip)   ; publish
//   (0x886d8..0x886ee is the unwind tail: operator delete + _Unwind_Resume.)
// Both `__call_once_proxy…` and `__invoke…` are their OWN ledger classes
// (raw-port/army/ledger/CLASSES.tsv rows 8268/8269, `1 method, 0 ported`),
// so they are NOT this unit's to port. Per PORTING_SPEC Rule 3 the lambda is
// a throw citing the exact allocation/ctor addresses above — NOT a fabricated
// `new OZChannelImpl(...)` in this frame. Note the real disasm has NO
// `__Znwm` inside `createOZChannelTextImpl` itself: every allocation lives in
// the proxy.
//
// ── EXTERNS (all TRUE out-of-scope, each cited) ───────────────────────────
//   __ZNSt3__111__call_onceERVmPvPFvS2_E  @0x87c2d (stub 0xacdc8) — libc++
//
// @provenance ProChannel @0x87bf8 (createOZChannelTextImpl), @0x88665 (proxy),
//             @0x88675 (lambda body), @0xec078 (once flag), @0xec790 (singleton)

import type { OZChannelImpl } from "./OZChannelImpl";

/**
 * @ProChannel data symbol `__ZN13OZChannelText18_OZChannelTextImplE` @0xec790.
 *
 * The `OZChannelImpl*` slot that `createOZChannelTextImpl()` returns
 * verbatim @0x87c37 (`movq [0xec790](%rip), %rax`). NULL until the
 * call_once lambda publishes into it @0x886c6 — the lambda's own first
 * instruction @0x8867f is a `cmpq $0x0` against this very slot, which is
 * what pins its initial value as a null pointer.
 */
let _OZChannelTextImpl: OZChannelImpl | null = null;

/**
 * @ProChannel data symbol
 * `__ZZN13OZChannelText23createOZChannelTextImplEvE23_OZChannelTextImpl_once`
 * @0xec078.
 *
 * The libc++ `std::once_flag`: a pointer-width word that starts at 0 and is
 * atomically set to `(uintptr_t)-1` by `std::__1::__call_once` once the
 * lambda has completed. The accessor's fast path is exactly that test —
 * `cmpq $-0x1, %rax` @0x87bff — so the sentinel here is `-1n`, matching the
 * 64-bit compare the machine performs (bigint keeps the full uintptr_t
 * domain rather than truncating to a JS int32).
 */
let _OZChannelTextImpl_once: bigint = 0n;

/**
 * `OZChannelText::createOZChannelTextImpl()::'lambda'()` — the call_once
 * initializer, reached through
 * `__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN13OZChannelText23createOZChannelTextImplEvEUlvE_EEEEEvPv`
 * @ProChannel 0x88665 → `__invoke<…>` @ProChannel 0x88675.
 *
 * NOT PORTED HERE — the proxy and the invoke thunk are their own ledger
 * units (CLASSES.tsv rows 8268/8269, both `0 ported`). Rule 3: throw citing
 * the exact addresses of the work it would have to do, so `depgraph.py` can
 * see the gap, rather than fabricating the object in this frame.
 */
function createOZChannelTextImpl_lambda(): OZChannelImpl {
  throw new Error(
    "OZChannelText::createOZChannelTextImpl()::'lambda'() @ProChannel 0x88675 " +
      "(entered via __call_once_proxy @ProChannel 0x88665) not yet transcribed — " +
      "it null-checks _OZChannelTextImpl @0xec790 (cmpq $0x0 @0x8867f), then " +
      "operator new(0xb0) @0x8868e + OZCurveBool::OZCurveBool(0.0) @0x8869c, " +
      "operator new(0x28) @0x886a6 + " +
      "OZChannelImpl::OZChannelImpl(OZCurve*, 0.0, 1u, true) @0x886c1, and " +
      "publishes the result to _OZChannelTextImpl @0x886c6. Separate ledger " +
      "unit (__call_once_proxy / __invoke for this lambda).",
  );
}

/**
 * `OZChannelText` — ProChannel animatable text channel (PARTIAL port).
 *
 * This file currently holds exactly one member: the call_once-guarded
 * default-impl accessor below. No fields, no base class and no vtable are
 * modelled, because no instruction in this unit observes any of them.
 */
export class OZChannelText {
  /**
   * `OZChannelText::createOZChannelTextImpl()`
   *   — @ProChannel 0x87bf8
   *   — __ZN13OZChannelText23createOZChannelTextImplEv
   *
   * Return the process-wide default `OZChannelImpl*` for text channels,
   * constructing it exactly once under `std::call_once`.
   *
   * Faithful transcription of the 19-instruction body (full listing in the
   * file header):
   *   - @0x87bf8/@0x87bff/@0x87c03 — load the once-flag and compare it to
   *     `$-0x1`; if it already equals the sentinel, `je 0x87c37` skips the
   *     whole slow path. (AT&T `cmpq $-0x1, %rax` computes `rax - (-1)`;
   *     `je` takes iff `rax == -1`.)
   *   - @0x87c05..0x87c26 — slow path: build the captureless lambda's
   *     `tuple<lambda&&>` on the stack and take the addresses of the once
   *     flag and of `__call_once_proxy` @0x88665.
   *   - @0x87c2d — `callq std::__1::__call_once(flag, &tuple, proxy)`; the
   *     libc++ runtime runs the lambda and, on success, stores the
   *     `(uintptr_t)-1` sentinel into the flag.
   *   - @0x87c37 — load and return `_OZChannelTextImpl` @0xec790. Note this
   *     load is on BOTH paths (it is the `je` target), so the value returned
   *     is always whatever the slot holds, never a locally built object.
   *
   * There is NO allocation in this frame: the real disassembly contains no
   * `__Znwm`/ctor call here — every one of them is inside the proxy lambda
   * @0x88675, which is a separate, unported ledger unit and therefore a
   * throw (see `createOZChannelTextImpl_lambda` above).
   *
   * Externs: `__ZNSt3__111__call_onceERVmPvPFvS2_E` @0x87c2d (libc++ stub
   * 0xacdc8). No in-scope callees; no indirect or virtual calls. Confirmed
   * via `depgraph.py deps __ZN13OZChannelText23createOZChannelTextImplEv`
   * (no dependency rows).
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelText23createOZChannelTextImplEv.s
   *   (20 lines)
   */
  static createOZChannelTextImpl(): OZChannelImpl {
    // @0x87bf8  movq [_OZChannelTextImpl_once @0xec078](%rip), %rax
    // @0x87bff  cmpq $-0x1, %rax
    // @0x87c03  je   0x87c37     ; flag == (uintptr_t)-1 -> already initialized
    if (_OZChannelTextImpl_once !== -1n) {
      // @0x87c05..0x87c26 — stack tuple + proxy setup (pure libc++ plumbing
      //   for a CAPTURELESS lambda: nothing observable to transcribe).
      // @0x87c2d  callq std::__1::__call_once(flag, &tuple, proxy @0x88665)
      //   The runtime invokes the lambda exactly once; that lambda is the
      //   unported unit above, so this is where the gap surfaces.
      _OZChannelTextImpl = createOZChannelTextImpl_lambda();
      // std::__1::__call_once writes the (uintptr_t)-1 sentinel into the flag
      // after the lambda returns normally — that store is what the fast-path
      // `cmpq $-0x1` @0x87bff reads on every subsequent call.
      _OZChannelTextImpl_once = -1n;
      // @0x87c32..0x87c36  addq $0x20,%rsp ; popq %rbp   (frame teardown)
    }
    // @0x87c37  movq [_OZChannelTextImpl @0xec790](%rip), %rax
    // @0x87c3e  retq
    return _OZChannelTextImpl as OZChannelImpl;
  }
}

/**
 * Alias export: mangled symbol name.
 * @0x87bf8 ProChannel  __ZN13OZChannelText23createOZChannelTextImplEv
 */
export function __ZN13OZChannelText23createOZChannelTextImplEv(): OZChannelImpl {
  return OZChannelText.createOZChannelTextImpl();
}
