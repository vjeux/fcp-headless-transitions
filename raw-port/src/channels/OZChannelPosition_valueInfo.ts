// raw-port/src/channels/OZChannelPosition_valueInfo.ts
//
// FCP `OZChannelPosition::OZChannelPosition_valueInfo` — the NESTED class
// inside `OZChannelPosition` (ProChannel.framework) that owns the shared
// default `OZChannelInfo` used by every position channel's X and Y sub-
// channels. It is its own ledger class
// (`ProChannel  OZChannelPosition::OZChannelPosition_valueInfo`), so per
// PORTING_SPEC Rule 6 it lives in its own file, named `Outer_Nested` after
// the precedent set by e.g. raw-port/src/infra/Json_StreamWriter_Factory.ts
// and raw-port/src/render/HGRenderUtils_BufferCopier.ts.
//
// This unit ports EXACTLY ONE member: the `std::call_once`-guarded singleton
// accessor `getInstance()` @ProChannel 0x7e68c. The nested class's ctor
// (C2 @0x76c4e), dtors (D1 @0x76cfe, D0 @0x76d1e), vtable (@0xdd448) and
// every field are SEPARATE ledger entries and remain OUT OF SCOPE — no
// instruction in this unit observes any of them, so none is modelled.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64 slice).
// Disassembly saved at:
//   raw-port/re/disasm/ProChannel.__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv.s
//     (@0x7e68c, 20 lines)
//   raw-port/re/disasm/ProChannel.__ZNSt3__18__invokeB9nqe210106IJZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEvEUlvE_EEENS_20__invoke_result_implIvJDpT_EE4typeEDpOS5_.s
//     (@0x7e6e6, 24 lines — the lambda body)
//
// SYMBOLS PORTED HERE (mangled → address)
//   * __ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv
//       — OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
//         @ProChannel 0x7e68c
//
// DATA SYMBOLS this unit reads/writes (nm -arch x86_64 ProChannel):
//   0xec028  (__DATA) __ZZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEvE32OZChannelPosition_valueInfo_once
//              — the libc++ `std::once_flag` word.
//   0xec6c0  (__DATA) __ZN17OZChannelPosition27OZChannelPosition_valueInfo28_OZChannelPosition_valueInfoE
//              — the singleton pointer slot the accessor returns.
//
// RELATED (not this unit): 0x7e6d6 __call_once_proxy<…>, 0x7e6e6 __invoke<…>,
//   0x76c4e C2 ctor, 0xdd448 vtable, 0xdd488 typeinfo.
//
// ── FULL DISASM — getInstance() @0x7e68c ──────────────────────────────────
//   0x7e68c  pushq %rbp                     ; frame prologue
//   0x7e68d  movq  %rsp, %rbp
//   0x7e690  subq  $0x20, %rsp              ; 32-byte frame for the lambda tuple
//   0x7e694  movq  [_..._valueInfo_once @0xec028](%rip), %rax
//   0x7e69b  cmpq  $-0x1, %rax              ; already-run sentinel (uintptr_t)-1
//   0x7e69f  je    0x7e6c6                  ; done -> skip to the load
//   0x7e6a1  leaq  -0x1(%rbp),  %rax        ; rax = &<the empty lambda object>
//   0x7e6a5  leaq  -0x18(%rbp), %rcx        ; rcx = &tuple<lambda&&>
//   0x7e6a9  movq  %rax, (%rcx)             ; tuple[0] = &lambda
//   0x7e6ac  leaq  -0x10(%rbp), %rsi        ; rsi = &<ptr-to-tuple> (the void* arg)
//   0x7e6b0  movq  %rcx, (%rsi)             ; *rsi = &tuple
//   0x7e6b3  leaq  [_..._valueInfo_once @0xec028](%rip), %rdi
//   0x7e6ba  leaq  __call_once_proxy<…>(%rip), %rdx        ; @0x7e6d6
//   0x7e6c1  callq __ZNSt3__111__call_onceERVmPvPFvS2_E    ; libc++ (stub 0xacdc8)
//   0x7e6c6  leaq  [_OZChannelPosition_valueInfo @0xec6c0](%rip), %rax
//   0x7e6cd  movq  (%rax), %rax             ; rax = the stored pointer
//   0x7e6d0  addq  $0x20, %rsp
//   0x7e6d4  popq  %rbp                     ; frame epilogue
//   0x7e6d5  retq
//
// The `leaq`/`movq` pairs @0x7e6a1..0x7e6b0 are pure libc++ call_once
// plumbing: they build a `tuple<lambda&&>` on the stack and hand its address
// to `__call_once` with the type-erased `__call_once_proxy`. The lambda is
// CAPTURELESS (`leaq -0x1(%rbp)` merely manufactures a unique address for a
// zero-size object), so the setup has nothing observable to transcribe; all
// the real work is inside the proxy. Note the two-step return @0x7e6c6/
// @0x7e6cd — `leaq` the slot's address, then `movq` through it — which is
// the same "return the stored pointer" as a single rip-relative load.
//
// ── THE LAMBDA (a SEPARATE, UNPORTED ledger unit) ─────────────────────────
// `__call_once_proxy<tuple<…getInstance()::'lambda'()&&>>` @0x7e6d6 thunks
// into `__invoke<…>` @0x7e6e6, which is where the singleton is built:
//   0x7e6ed  leaq  [_OZChannelPosition_valueInfo @0xec6c0](%rip), %r14
//   0x7e6f4  cmpq  $0x0, (%r14)            ; already non-null?
//   0x7e6f8  jne   0x7e712                 ; -> nothing to do
//   0x7e6fa  movl  $0x58, %edi             ; sizeof(OZChannelPosition_valueInfo) = 0x58 = 88
//   0x7e6ff  callq __Znwm                  ; operator new(88)
//   0x7e70a  callq __ZN17OZChannelPosition27OZChannelPosition_valueInfoC2Ev  ; @0x76c4e
//   0x7e70f  movq  %rbx, (%r14)            ; publish the instance
//   (0x7e717..0x7e725 is the unwind tail: operator delete + _Unwind_Resume.)
// Per PORTING_SPEC Rule 3 the lambda is a throw citing those exact addresses
// — NOT a fabricated `new OZChannelPosition_valueInfo()` in this frame. The
// real disasm has NO `__Znwm` inside `getInstance` itself: every allocation
// lives in the proxy.
//
// ── EXTERNS (all TRUE out-of-scope, each cited) ───────────────────────────
//   __ZNSt3__111__call_onceERVmPvPFvS2_E  @0x7e6c1 (stub 0xacdc8) — libc++
//
// @provenance ProChannel @0x7e68c (getInstance), @0x7e6d6 (proxy),
//             @0x7e6e6 (lambda body), @0x76c4e (nested-class C2 ctor),
//             @0xec028 (once flag), @0xec6c0 (singleton slot)

/**
 * `OZChannelPosition::OZChannelPosition_valueInfo` — the nested value-info
 * class (PARTIAL port: one static member).
 *
 * Its instances are heap-allocated at 0x58 bytes and built by the ctor
 * @ProChannel 0x76c4e (a separate ledger unit); callers hand the singleton
 * to `OZChannel::replaceInfo` (see OZChannelPosition.ts @0x73727), which
 * means the class derives from `OZChannelInfo` — but NO instruction in THIS
 * unit observes the base subobject, a field, or a vtable slot, so none is
 * declared here. Later units EXTEND this file as they decode them.
 */
export class OZChannelPosition_valueInfo {
  /**
   * `OZChannelPosition::OZChannelPosition_valueInfo::getInstance()`
   *   — @ProChannel 0x7e68c
   *   — __ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv
   *
   * Return the process-wide `OZChannelPosition_valueInfo*` singleton,
   * constructing it exactly once under `std::call_once`.
   *
   * Faithful transcription of the 19-instruction body (full listing in the
   * file header):
   *   - @0x7e694/@0x7e69b/@0x7e69f — load the once-flag and compare it to
   *     `$-0x1`; if it already equals the sentinel, `je 0x7e6c6` skips the
   *     whole slow path. (AT&T `cmpq $-0x1, %rax` computes `rax - (-1)`;
   *     `je` takes iff `rax == -1`.)
   *   - @0x7e6a1..0x7e6ba — slow path: build the captureless lambda's
   *     `tuple<lambda&&>` on the stack and take the addresses of the once
   *     flag and of `__call_once_proxy` @0x7e6d6.
   *   - @0x7e6c1 — `callq std::__1::__call_once(flag, &tuple, proxy)`; the
   *     libc++ runtime runs the lambda and, on success, stores the
   *     `(uintptr_t)-1` sentinel into the flag.
   *   - @0x7e6c6/@0x7e6cd — `leaq` the singleton slot @0xec6c0 and `movq`
   *     through it; return that pointer. This load is the `je` target, so
   *     it runs on BOTH paths: the value returned is always whatever the
   *     slot holds, never a locally built object.
   *
   * There is NO allocation in this frame: the real disassembly contains no
   * `__Znwm` and no ctor call here — both live inside the proxy lambda
   * @0x7e6e6, which is a separate, unported ledger unit and therefore a
   * throw (see `getInstance_lambda` below).
   *
   * Externs: `__ZNSt3__111__call_onceERVmPvPFvS2_E` @0x7e6c1 (libc++ stub
   * 0xacdc8). No in-scope callees; no indirect or virtual calls. Confirmed
   * via `depgraph.py deps
   * __ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv`
   * (no dependency rows).
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv.s
   *   (20 lines)
   */
  static getInstance(): OZChannelPosition_valueInfo {
    // @0x7e694  movq [_..._valueInfo_once @0xec028](%rip), %rax
    // @0x7e69b  cmpq $-0x1, %rax
    // @0x7e69f  je   0x7e6c6     ; flag == (uintptr_t)-1 -> already initialized
    if (_OZChannelPosition_valueInfo_once !== -1n) {
      // @0x7e6a1..0x7e6ba — stack tuple + proxy setup (pure libc++ plumbing
      //   for a CAPTURELESS lambda: nothing observable to transcribe).
      // @0x7e6c1  callq std::__1::__call_once(flag, &tuple, proxy @0x7e6d6)
      //   The runtime invokes the lambda exactly once; that lambda is the
      //   unported unit below, so this is where the gap surfaces.
      _OZChannelPosition_valueInfo = getInstance_lambda();
      // std::__1::__call_once writes the (uintptr_t)-1 sentinel into the flag
      // after the lambda returns normally — that store is what the fast-path
      // `cmpq $-0x1` @0x7e69b reads on every subsequent call.
      _OZChannelPosition_valueInfo_once = -1n;
      // @0x7e6d0..0x7e6d4  addq $0x20,%rsp ; popq %rbp   (frame teardown)
    }
    // @0x7e6c6  leaq [_OZChannelPosition_valueInfo @0xec6c0](%rip), %rax
    // @0x7e6cd  movq (%rax), %rax
    // @0x7e6d5  retq
    return _OZChannelPosition_valueInfo as OZChannelPosition_valueInfo;
  }
}

/**
 * @ProChannel data symbol
 * `__ZN17OZChannelPosition27OZChannelPosition_valueInfo28_OZChannelPosition_valueInfoE`
 * @0xec6c0.
 *
 * The pointer slot `getInstance()` dereferences and returns @0x7e6c6/
 * @0x7e6cd. NULL until the call_once lambda publishes into it @0x7e70f —
 * the lambda's own guard @0x7e6f4 is a `cmpq $0x0` against this very slot,
 * which is what pins its initial value as a null pointer.
 */
let _OZChannelPosition_valueInfo: OZChannelPosition_valueInfo | null = null;

/**
 * @ProChannel data symbol
 * `__ZZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEvE32OZChannelPosition_valueInfo_once`
 * @0xec028.
 *
 * The libc++ `std::once_flag`: a pointer-width word that starts at 0 and is
 * atomically set to `(uintptr_t)-1` by `std::__1::__call_once` once the
 * lambda has completed. The accessor's fast path is exactly that test —
 * `cmpq $-0x1, %rax` @0x7e69b — so the sentinel here is `-1n`, matching the
 * 64-bit compare the machine performs (bigint keeps the full uintptr_t
 * domain rather than truncating to a JS int32).
 */
let _OZChannelPosition_valueInfo_once: bigint = 0n;

/**
 * `OZChannelPosition::OZChannelPosition_valueInfo::getInstance()::'lambda'()`
 * — the call_once initializer, reached through
 * `__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEvEUlvE_EEEEEvPv`
 * @ProChannel 0x7e6d6 → `__invoke<…>` @ProChannel 0x7e6e6.
 *
 * NOT PORTED HERE — the proxy and the invoke thunk are their own ledger
 * units. Rule 3: throw citing the exact addresses of the work it would have
 * to do, so `depgraph.py` can see the gap, rather than fabricating the
 * object in this frame.
 */
function getInstance_lambda(): OZChannelPosition_valueInfo {
  throw new Error(
    "OZChannelPosition::OZChannelPosition_valueInfo::getInstance()::'lambda'() " +
      "@ProChannel 0x7e6e6 (entered via __call_once_proxy @ProChannel 0x7e6d6) " +
      "not yet transcribed — it null-checks _OZChannelPosition_valueInfo " +
      "@0xec6c0 (cmpq $0x0 @0x7e6f4), then operator new(0x58) @0x7e6ff + " +
      "OZChannelPosition::OZChannelPosition_valueInfo::OZChannelPosition_valueInfo() " +
      "@0x7e70a (target @ProChannel 0x76c4e), and publishes the result to " +
      "_OZChannelPosition_valueInfo @0x7e70f. Separate ledger unit " +
      "(__call_once_proxy / __invoke for this lambda).",
  );
}

/**
 * Alias export: mangled symbol name.
 * @0x7e68c ProChannel
 * __ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv
 */
export function __ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv(): OZChannelPosition_valueInfo {
  return OZChannelPosition_valueInfo.getInstance();
}
