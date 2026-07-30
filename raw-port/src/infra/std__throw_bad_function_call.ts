// std::__throw_bad_function_call[abi:nqe210106]() — libc++'s helper that
// raises `std::bad_function_call` when a null `std::function<>` is called.
// FCP's Flexo framework embeds an instantiation of this helper at
// @0xc1b860 (called from a null-check in `std::function::operator()` — the
// `__throw_bad_function_call` slot that libc++'s __value_func<>/__policy_
// invoker points at when the target is empty).
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Flexo.framework/Versions/A/Flexo (x86_64 slice; unadjusted
//           VAs from `otool -tV`).
//   Disasm: raw-port/re/disasm/Flexo.__ZNSt3__125__throw_bad_function_callB9nqe210106Ev.s
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOL PORTED HERE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZNSt3__125__throw_bad_function_callB9nqe210106Ev
//       — std::__1::__throw_bad_function_call[abi:nqe210106]()  @Flexo 0xc1b860
//         (the [[abi:nqe210106]] tag marks it as libc++'s post-C++20
//          instantiation.)
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM (13 lines from otool -tV)
//   raw-port/re/disasm/Flexo.__ZNSt3__125__throw_bad_function_callB9nqe210106Ev.s
// ─────────────────────────────────────────────────────────────────────────
//   0xc1b860  pushq %rbp
//   0xc1b861  movq  %rsp, %rbp
//   0xc1b864  movl  $0x8, %edi                       ; edi = 8 (bytes)
//   0xc1b869  callq ___cxa_allocate_exception        ; rax = exception buf
//   0xc1b86e  movq  __ZTVNSt3__117bad_function_callE(%rip), %rcx
//                                                    ; rcx = &vtable
//   0xc1b875  addq  $0x10, %rcx                      ; rcx += 0x10  (skip
//                                                    ;   Itanium-ABI header
//                                                    ;   slots at vtable+0
//                                                    ;   and +8)
//   0xc1b879  movq  %rcx, (%rax)                     ; buf->vptr = rcx
//                                                    ;   -> initialises the
//                                                    ;   bad_function_call
//                                                    ;   object in-place
//                                                    ;   (its base
//                                                    ;   `std::exception`
//                                                    ;   subobject has no
//                                                    ;   fields beyond the
//                                                    ;   vptr — libc++
//                                                    ;   layout).
//   0xc1b87c  movq  __ZTINSt3__117bad_function_callE(%rip), %rsi
//                                                    ; rsi = &typeinfo
//   0xc1b883  movq  __ZNSt3__117bad_function_callD1Ev(%rip), %rdx
//                                                    ; rdx = &dtor
//   0xc1b88a  movq  %rax, %rdi                       ; rdi = exception buf
//   0xc1b88d  callq ___cxa_throw                     ; noreturn
//   0xc1b892  nopw  %cs:(%rax,%rax)                  ; unreachable pad
// ─────────────────────────────────────────────────────────────────────────
//
// ─────────────────────────────────────────────────────────────────────────
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs — libc++ runtime /
//                   Itanium C++ ABI. NOT in any FCP framework ledger;
//                   verified via `depgraph.py why` and by matching the
//                   __ZNSt3__1... / ___cxa_... prefixes used by libc++.)
// ─────────────────────────────────────────────────────────────────────────
//   * ___cxa_allocate_exception          @Flexo stub 0x149747c
//       — Itanium C++ ABI: allocates a raw buffer big enough to hold the
//         thrown object (arg: byte size). Returns a pointer to the buf.
//   * ___cxa_throw                       @Flexo stub 0x14974b2
//       — Itanium C++ ABI: initiates the throw with (obj_ptr, typeinfo_
//         ptr, dtor_ptr). Noreturn.
//   * __ZTVNSt3__117bad_function_callE   (data symbol, RIP-relative load
//                                         at @0xc1b86e; not a call)
//       — libc++'s vtable for std::__1::bad_function_call. The primary
//         vptr is `vtable + 0x10` (Itanium C++ ABI: skip the two header
//         slots at +0 (offset-to-top) and +8 (typeinfo pointer)).
//   * __ZTINSt3__117bad_function_callE   (data symbol, RIP-relative load
//                                         at @0xc1b87c; not a call)
//       — libc++'s typeinfo (`std::type_info` for bad_function_call).
//         Passed as the second argument to `__cxa_throw`.
//   * __ZNSt3__117bad_function_callD1Ev  (function symbol, RIP-relative
//                                         load at @0xc1b883; loaded as a
//                                         pointer, NOT called from here)
//       — std::__1::bad_function_call::~bad_function_call() (D1). Passed
//         as the destructor pointer to `__cxa_throw`; the runtime calls
//         it later when the exception is destroyed.
// ─────────────────────────────────────────────────────────────────────────

// ── Frontier stubs — TRUE out-of-scope libc++ / Itanium C++ ABI externs ──

/**
 * `__ZTVNSt3__117bad_function_callE` — libc++'s vtable for
 * `std::__1::bad_function_call`. Data symbol referenced @0xc1b86e as a
 * RIP-relative load. Modelled as an opaque sentinel object so downstream
 * checks can observe that a thrown exception's vptr points here (rather
 * than at, say, `std::exception`'s vtable).
 */
const __ZTVNSt3__117bad_function_callE: {
  readonly _kind: "std::bad_function_call vtable";
} = { _kind: "std::bad_function_call vtable" };

/** The `vtable + 0x10` slot stored into `this->vptr` by @0xc1b879.
 *  Computed by the pair @0xc1b86e (`movq …(rip), %rcx`) + @0xc1b875
 *  (`addq $0x10, %rcx`). The +0x10 skips past the Itanium-ABI header
 *  slots (offset-to-top at +0, typeinfo pointer at +8). */
const __ZTVNSt3__117bad_function_callE_plus_0x10 = {
  vtable: __ZTVNSt3__117bad_function_callE,
  /** @Flexo 0xc1b875 — the +0x10 Itanium-ABI primary-vptr offset. */
  offset: 0x10,
};

/**
 * `__ZTINSt3__117bad_function_callE` — libc++'s
 * `std::type_info` for `std::__1::bad_function_call`. Data symbol
 * referenced @0xc1b87c and passed to `___cxa_throw` as the typeinfo
 * argument. Modelled as an opaque sentinel — the runtime uses it to
 * match `catch` handlers.
 */
const __ZTINSt3__117bad_function_callE: {
  readonly _kind: "std::bad_function_call typeinfo";
} = { _kind: "std::bad_function_call typeinfo" };

/**
 * `__ZNSt3__117bad_function_callD1Ev` — libc++'s D1 destructor for
 * `std::__1::bad_function_call`. Not called from this function; only
 * loaded @0xc1b883 as a pointer that is passed to `___cxa_throw` for
 * the runtime to invoke later. Modelled here as a stub that would raise
 * if the runtime ever picked it up — the raw-port itself never runs it.
 */
function bad_function_call_D1_stub(_this: unknown): void {
  throw new Error(
    "std::bad_function_call::~bad_function_call() @Flexo 0xc1b883 (libc++ D1 stub, pointer loaded but not called from this fn) — not yet transcribed @Flexo 0xc1b883. Only ever invoked by ___cxa_throw's cleanup path; this raw-port never calls it directly.",
  );
}

/**
 * The exception object built in-place at @0xc1b879. Its libc++ layout
 * (from this ctor + the standard std::exception base): one field, the
 * vptr at +0x00. We model it as a JS object with the `vptr` field so
 * consumers can observe the derived class's vtable pointer.
 */
interface bad_function_call_object {
  vptr: typeof __ZTVNSt3__117bad_function_callE_plus_0x10;
}

/**
 * `___cxa_allocate_exception` — Itanium C++ ABI runtime helper called
 * @0xc1b869. Allocates a raw buffer of `size` bytes suitable for holding
 * the thrown object (in the real runtime this comes from a per-thread
 * exception pool). Modelled here as an object construction: the JS port
 * never inspects the raw byte layout, only the vptr field written to it
 * @0xc1b879. Signature matches the ABI: `void* __cxa_allocate_exception(size_t)`.
 * @Flexo stub 0x149747c.
 */
function ___cxa_allocate_exception(size: number): bad_function_call_object {
  // @0xc1b864 — the caller passed 8 bytes. That matches libc++'s
  // `sizeof(std::bad_function_call)` on x86_64 (single vptr, no data).
  // We assert the size so a wrong call from another future port is
  // caught immediately rather than silently mismatching layouts.
  if (size !== 8) {
    throw new Error(
      "___cxa_allocate_exception(size=" +
        size +
        ") — this raw-port only models the size=8 path used by " +
        "std::__throw_bad_function_call @Flexo 0xc1b869.",
    );
  }
  // Return an object we can install a vptr on. The vptr is overwritten
  // immediately by the caller @0xc1b879, so its initial value is a
  // placeholder that would signal "uninitialised" if ever observed
  // (which the disasm proves it never is).
  return {
    vptr: __ZTVNSt3__117bad_function_callE_plus_0x10,
  };
}

/**
 * `___cxa_throw` — Itanium C++ ABI runtime helper called @0xc1b88d.
 * Signature: `void __cxa_throw(void* thrown_object, std::type_info* tinfo,
 * void (*dest)(void*))`. Noreturn. Modelled by translating the raw C++
 * `throw` into a JS `throw`: we build an Error whose payload preserves
 * (a) the exception object with its installed vptr, (b) the typeinfo
 * pointer used for `catch` matching, and (c) the destructor pointer the
 * runtime would call to reclaim the object. This is the faithful
 * boundary crossing — a real value-producing extern that raises, per
 * Rule 3 (throw on undecoded, never approximate). @Flexo stub 0x14974b2.
 */
function ___cxa_throw(
  thrown: bad_function_call_object,
  tinfo: typeof __ZTINSt3__117bad_function_callE,
  dtor: (self: unknown) => void,
): never {
  // The payload is attached to the thrown Error so a hosting harness
  // that models Itanium exception unwinding can inspect it. We do NOT
  // pretend to run the ABI's stack-unwind + type-match logic here —
  // that is far out of scope for the FCP port.
  const err = new Error(
    "___cxa_throw @Flexo 0x14974b2 — libc++ runtime extern, raised as JS " +
      "throw. Thrown object: std::__1::bad_function_call " +
      "(typeinfo=__ZTINSt3__117bad_function_callE, dtor=" +
      "__ZNSt3__117bad_function_callD1Ev). This is the faithful boundary " +
      "crossing for a call to a null std::function<>.",
  ) as Error & {
    _cxaThrown?: bad_function_call_object;
    _cxaTypeinfo?: typeof __ZTINSt3__117bad_function_callE;
    _cxaDtor?: (self: unknown) => void;
  };
  err._cxaThrown = thrown;
  err._cxaTypeinfo = tinfo;
  err._cxaDtor = dtor;
  throw err;
}

/**
 * `std::__1::__throw_bad_function_call[abi:nqe210106]()` — @Flexo 0xc1b860
 * (`__ZNSt3__125__throw_bad_function_callB9nqe210106Ev`).
 *
 * Faithful line-for-line transcription of the 13-instruction body. The
 * function is `noreturn`: it always ends by calling `___cxa_throw`,
 * which never returns to its caller.
 */
export function std__throw_bad_function_call(): never {
  // ------------------------------------------------------------------
  // @0xc1b860..0xc1b861 — pushq %rbp / movq %rsp, %rbp
  //                        Frame-pointer prologue. No TS-visible effect.
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // @0xc1b864..0xc1b869 — movl $0x8, %edi ; callq ___cxa_allocate_exception
  //                        rax = ___cxa_allocate_exception(8).
  // ------------------------------------------------------------------
  const buf = ___cxa_allocate_exception(0x8);

  // ------------------------------------------------------------------
  // @0xc1b86e..0xc1b875 — movq __ZTVNSt3__117bad_function_callE(%rip), %rcx
  //                        addq $0x10, %rcx
  //                        rcx = &__ZTVNSt3__117bad_function_callE + 0x10
  //                        (the Itanium-ABI primary-vptr slot).
  //
  // @0xc1b879           — movq %rcx, (%rax)
  //                        buf->vptr = rcx.
  // ------------------------------------------------------------------
  buf.vptr = __ZTVNSt3__117bad_function_callE_plus_0x10;

  // ------------------------------------------------------------------
  // @0xc1b87c..0xc1b883 — movq __ZTINSt3__117bad_function_callE(%rip), %rsi
  //                        movq __ZNSt3__117bad_function_callD1Ev(%rip), %rdx
  //                        rsi = &typeinfo, rdx = &dtor. These are the
  //                        2nd and 3rd args to ___cxa_throw.
  //
  // @0xc1b88a..0xc1b88d — movq %rax, %rdi ; callq ___cxa_throw
  //                        Noreturn call: ___cxa_throw(buf, typeinfo, dtor).
  //
  // @0xc1b892           — nopw %cs:(%rax,%rax)
  //                        Unreachable alignment pad; not executed.
  // ------------------------------------------------------------------
  ___cxa_throw(
    buf,
    __ZTINSt3__117bad_function_callE,
    bad_function_call_D1_stub,
  );
}
