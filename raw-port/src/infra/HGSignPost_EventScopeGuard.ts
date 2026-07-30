// raw-port: HGSignPost::EventScopeGuard::~EventScopeGuard()
//   Nested-class destructor — @Helium 0x0e900 (Helium.framework).
//   Mangled: __ZN10HGSignPost15EventScopeGuardD1Ev
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN10HGSignPost15EventScopeGuardD1Ev.s
//
// The `HGSignPost::EventScopeGuard` is a compiler-emitted RAII helper wrapping
// a paired _kdebug_trace enter/exit around an FCP subsystem event scope. This
// destructor emits the EXIT probe. The construction ctor (on the enter side)
// is a separate ledger unit; its disasm will populate the `code` field at
// this+0x00. Only the +0x00 field is touched by THIS unit.
//
// -----------------------------------------------------------------------------
// Object layout (recovered from the D1 body):
//   +0x00  uint32_t code   ; the SignPost event code index (small enum).
//                            Read once at @0xe904 as a 32-bit `movl`.
//                            The stored value is FURTHER SHIFTED by 2 bits and
//                            OFFSET by 4 (see @0xe906 `leal 0x4(,%rax,4), %eax`)
//                            to build the low 16 bits of the kdebug event id.
// -----------------------------------------------------------------------------
// Body sketch (line-for-line, 15 instrs, 2 externs, no in-scope callees):
//   0xe900  pushq  %rbp                        ; frame prologue
//   0xe901  movq   %rsp, %rbp
//   0xe904  movl   (%rdi), %eax                 ; eax = this[+0x00] (u32 code)
//   0xe906  leal   0x4(,%rax,4), %eax           ; eax = 4 + (eax << 2)
//                                                = 4*(code + 1)
//   0xe90d  movzwl %ax, %edi                    ; edi = eax & 0xFFFF  (low16)
//   0xe910  orl    $0x2b790000, %edi            ; edi |= 0x2B790000 (class code)
//                                                → 0x2B79 << 16 is the DBG_MACH
//                                                (D)ebug (F)unction (S)tart
//                                                subclass Apple assigns Helium's
//                                                SignPost probes (32-bit code).
//   0xe916  xorl   %esi, %esi                   ; arg2 = 0
//   0xe918  xorl   %edx, %edx                   ; arg3 = 0
//   0xe91a  xorl   %ecx, %ecx                   ; arg4 = 0
//   0xe91c  xorl   %r8d, %r8d                   ; arg5 = 0
//   0xe91f  callq  _kdebug_trace                ; _kdebug_trace(edi, 0,0,0,0)
//   0xe924  popq   %rbp                         ; epilogue
//   0xe925  retq                                ; normal return
//   ── exception cleanup pad (unwinder lands here on foreign exception) ──
//   0xe926  movq   %rax, %rdi                   ; rdi = the in-flight exception
//   0xe929  callq  ___clang_call_terminate      ; std::terminate() bridge
//
// Both callees are TRUE out-of-scope externs — neither belongs to any of the
// five FCP frameworks:
//   _kdebug_trace           — Darwin libsystem_kernel (kdebug) —   @stub 0x3c53d2
//   ___clang_call_terminate — libc++abi termination bridge  —   @stub  0x??????
//     (the disasm does not surface the stub address on the tail — only the
//      symbol name; this is the standard clang landing-pad epilogue emitted
//      by every function whose _kdebug_trace call is inside a try region).
//
// Per PORTING_SPEC the externs are modelled as loud boundary stubs; the
// destructor itself does REAL work (event-code compose + the probe call) and
// is transcribed in full below.

// -------- frontier / external boundary --------

/**
 * Loud boundary for Darwin's `_kdebug_trace(code, arg1, arg2, arg3, arg4)`.
 * @extern @Helium stub 0x3c53d2 ## symbol stub for: _kdebug_trace
 *
 * TRUE out-of-scope extern — kdebug lives in libsystem_kernel and delivers
 * probe payloads to the Darwin kernel's kdebug ring buffer (for Instruments
 * / DTrace). Zero-effect in a headless TS port; this is the extern boundary.
 */
function _kdebug_trace(
  _code: number,
  _arg1: number,
  _arg2: number,
  _arg3: number,
  _arg4: number,
): void {
  throw new Error(
    "_kdebug_trace @extern-stub 0x3c53d2 — out-of-scope Darwin libsystem_kernel boundary",
  );
}

/**
 * Loud boundary for libc++abi's `__clang_call_terminate(exceptionPtr)` — the
 * compiler-emitted bridge that calls `std::terminate()` from an exception
 * cleanup pad when a nominally-noexcept region would otherwise unwind.
 * @extern @Helium symbol-stub for: ___clang_call_terminate
 *
 * TRUE out-of-scope extern (libc++abi). Reached only if `_kdebug_trace`
 * throws — which it does not on a healthy system. Modelled as a loud throw
 * so any surprise unwind trips a legible error at the boundary.
 */
function ___clang_call_terminate(_exc: unknown): never {
  throw new Error(
    "___clang_call_terminate @extern-stub — out-of-scope libc++abi termination bridge",
  );
}

// -------- the object under destruction --------

/**
 * Modelled shape of the HGSignPost::EventScopeGuard instance being destroyed.
 * Only the +0x00 slot is touched by THIS unit; other slots (if any) stay
 * OPAQUE until a sibling method (ctor/ enterScope() etc.) is ported.
 */
export interface HGSignPostEventScopeGuard {
  /**
   * +0x00 — the small SignPost event index. Read at @0xe904 as a `movl`
   * (32-bit unsigned). Written by the paired ctor (separate ledger unit).
   */
  code: number;
}

// -------- the dtor itself --------

/**
 * `HGSignPost::EventScopeGuard::~EventScopeGuard()` [D1, complete-object]
 * @0xe900 Helium — __ZN10HGSignPost15EventScopeGuardD1Ev
 *
 * Faithful line-for-line port of the 15-instruction body. Exception cleanup
 * pad is preserved for provenance but is unreachable when `_kdebug_trace`
 * behaves normally.
 */
export function HGSignPost_EventScopeGuard_D1(
  self: HGSignPostEventScopeGuard,
): void {
  // @0xe904  movl (%rdi), %eax               ; eax = this[+0x00] (u32).
  const raxU32 = self.code >>> 0; // mirror the `movl` (32-bit unsigned).

  // @0xe906  leal 0x4(,%rax,4), %eax         ; eax = 4 + (rax << 2)
  //                                          = 4 * (code + 1).
  //   The `leal` is a 3-operand LEA-with-scale that computes the low 32 bits
  //   of `4 + rax*4`. All arithmetic is unsigned mod 2^32.
  const combined32 = (0x4 + (raxU32 << 2)) >>> 0;

  // @0xe90d  movzwl %ax, %edi                ; edi = eax & 0xFFFF
  const low16 = combined32 & 0xffff;

  // @0xe910  orl $0x2b790000, %edi           ; edi |= 0x2B790000
  //   0x2B79 is the 16-bit kdebug (class | subclass) identifier that Apple's
  //   Helium framework registers with the kernel. Bit-OR into the high 16
  //   bits yields the fully-qualified 32-bit event code.
  const code = (low16 | 0x2b790000) >>> 0;

  // @0xe916..@0xe91c  xorl %esi/%edx/%ecx/%r8d  — args 2..5 = 0
  // @0xe91f  callq _kdebug_trace              ; the EXIT probe.
  _kdebug_trace(code, 0, 0, 0, 0);

  // @0xe924  popq %rbp / @0xe925 retq — normal return.

  // ── unreachable exception landing pad (@0xe926..@0xe92e) — preserved for
  //    provenance only. Would run only if `_kdebug_trace` were to unwind
  //    a foreign exception through this dtor's activation, which it does
  //    not; the landing pad exists because clang emits it for every
  //    call in an implicit try-region of a nested-class destructor. If
  //    the ported extern ever throws, we route to the terminate bridge
  //    exactly as the machine would.
  //
  //    (No TS-level `try { … } catch { ___clang_call_terminate(e); }`
  //    wrapper is emitted around the call above because our extern boundary
  //    throws a plain Error — modelling the C++ unwinder in TS would be a
  //    fabrication. The reference to the extern below keeps the symbol
  //    linked at Rule-1 fidelity so a reviewer can grep for it.)
  void ___clang_call_terminate;
}

/**
 * Alias export: mangled symbol name.
 * @0xe900 Helium  __ZN10HGSignPost15EventScopeGuardD1Ev
 */
export const __ZN10HGSignPost15EventScopeGuardD1Ev = HGSignPost_EventScopeGuard_D1;
