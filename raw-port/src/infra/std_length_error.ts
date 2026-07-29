// std::length_error — libc++'s standard "length exceeded" exception, ported
// because FCP's frameworks embed it directly (see e.g. bounds checks in
// std::vector::reserve and std::__throw_length_error call sites). This
// unit ports ONLY the C1 unified/complete-object constructor from a
// `char const*` at @Flexo 0x4e4f0. Its base ctor
// `std::logic_error::logic_error(char const*)` @ __ZNSt11logic_errorC2EPKc
// is a TRUE OUT-OF-SCOPE libc++ extern (not in any framework ledger).
// D1/D2 dtors, copy-ctor, what() accessor, etc. are separate ledger
// entries and OUT OF SCOPE for this file.
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Flexo.framework/Versions/A/Flexo (x86_64 slice; unadjusted
//           VAs from `otool -tV`). The identical body also appears in
//           ProCore.framework @0x21494; we transcribe the Flexo copy
//           because that is the framework listed on the ledger claim.
//   Disasm: raw-port/re/disasm/Flexo.__ZNSt12length_errorC1B9nqe210106EPKc.s
//
// ─────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT
// ─────────────────────────────────────────────────────────────────────────
// libc++'s `std::length_error` derives from `std::logic_error`. Its
// binary layout (from THIS ctor's writes + the standard libc++ layout) is:
//
//   +0x00  vptr              ; installed as (&__ZTVSt12length_error + 0x10)
//                             ; by @0x4e4fe..@0x4e509 — pattern
//                             ;   movq __ZTVSt12length_error(%rip), %rax
//                             ;   addq $0x10, %rax
//                             ;   movq %rax, (%rbx)
//                             ; This overwrites the vptr just installed
//                             ; by the logic_error base ctor (Itanium C++
//                             ; ABI: derived ctors patch the vptr after
//                             ; the base has finished).
//   +0x08  std::logic_error  ; base subobject — allocated + initialised
//                             ; by the base ctor. Its own layout
//                             ; includes a std::string message field.
//                             ; We do NOT decode logic_error's layout in
//                             ; this file (out-of-scope libc++).
//
// ─────────────────────────────────────────────────────────────────────────
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// ─────────────────────────────────────────────────────────────────────────
//   * __ZNSt11logic_errorC2EPKc
//       — std::logic_error::logic_error(char const*)
//       — TRUE out-of-scope extern (libc++ base ctor — NOT in any FCP
//         framework ledger; verified via
//         `python3 raw-port/army/tools/depgraph.py why …`).
//       — Called @0x4e4f9 via the Flexo stub @0x1497290.
//
//   * __ZTVSt12length_error  (data symbol, not a call)
//       — libc++'s vtable for std::length_error. Referenced @0x4e4fe as a
//         RIP-relative load into %rax, then offset by 0x10 (Itanium C++
//         ABI: the primary vptr points to vtable + 0x10, skipping past
//         the two offset-to-top / typeinfo slots at vtable+0..0xf).
//       — TRUE out-of-scope data extern.
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOLS PORTED HERE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZNSt12length_errorC1B9nqe210106EPKc
//       — std::length_error::length_error(char const*)  @Flexo 0x4e4f0
//         (C1 — the unified/complete-object ctor variant; the abi tag
//          B9nqe210106 marks it as libc++'s post-C++20 [[abi:nqe210106]]
//          instantiation).
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM
//   raw-port/re/disasm/Flexo.__ZNSt12length_errorC1B9nqe210106EPKc.s
// ─────────────────────────────────────────────────────────────────────────
//   0x4e4f0  pushq %rbp
//   0x4e4f1  movq  %rsp, %rbp
//   0x4e4f4  pushq %rbx                    ; callee-saved — need to hold
//                                          ; `this` across the base ctor
//                                          ; call (base ctor clobbers rdi).
//   0x4e4f5  pushq %rax                    ; 16-byte stack alignment.
//   0x4e4f6  movq  %rdi, %rbx              ; rbx = this  (save before call)
//   0x4e4f9  callq __ZNSt11logic_errorC2EPKc
//                                          ; base ctor: builds the
//                                          ; std::logic_error subobject
//                                          ; with the same char const*
//                                          ; arg (rsi is preserved by
//                                          ; the ABI — the disasm never
//                                          ; touches it, so it's passed
//                                          ; straight through).
//   0x4e4fe  movq  __ZTVSt12length_error(%rip), %rax
//                                          ; rax = &__ZTVSt12length_error
//   0x4e505  addq  $0x10, %rax             ; rax += 0x10  (skip past the
//                                          ; two Itanium-ABI header slots
//                                          ; at vtable +0 (offset-to-top)
//                                          ; and +8 (typeinfo pointer)).
//   0x4e509  movq  %rax, (%rbx)            ; this->vptr = rax  (override
//                                          ; the vptr the base ctor just
//                                          ; installed — derived class
//                                          ; wins).
//   0x4e50c  addq  $0x8, %rsp              ; undo alignment pad
//   0x4e510  popq  %rbx
//   0x4e511  popq  %rbp
//   0x4e512  retq
//   0x4e513  nopw  %cs:(%rax,%rax)         ; 6-byte alignment nop
// ─────────────────────────────────────────────────────────────────────────

// ── Frontier stubs — TRUE out-of-scope libc++ externs ────────────────────

/**
 * `__ZTVSt12length_error` — libc++'s vtable for std::length_error. Data
 * symbol referenced @0x4e4fe as a RIP-relative load. In this port we
 * model it as an opaque marker object; the derived-class vptr write
 * @0x4e509 stores a pointer to `vtable + 0x10` into `this->vptr` so
 * that later virtual dispatch (e.g. to what()) picks up the
 * length_error override. Since virtual dispatch is not exercised by
 * this ctor and the callees are separate ledger units, the exact
 * contents of the vtable don't matter here — we just need a distinct
 * sentinel object so downstream tests can observe that
 * `length_error.vptr` differs from `logic_error.vptr`.
 */
const __ZTVSt12length_error: { readonly _kind: "std::length_error vtable" } =
  { _kind: "std::length_error vtable" };
/** The `vtable + 0x10` slot that ends up in every length_error instance's
 *  vptr field. Computed @0x4e505 (`addq $0x10, %rax`). */
const __ZTVSt12length_error_plus_0x10 = {
  vtable: __ZTVSt12length_error,
  /** @Flexo 0x4e505 — the +0x10 Itanium-ABI primary-vptr offset. */
  offset: 0x10,
};

/**
 * `std::logic_error::logic_error(char const*)` @Flexo stub 0x1497290 —
 * libc++ base ctor. Called @0x4e4f9. TRUE out-of-scope extern (libc++
 * runtime). We model its observable effect (allocate + initialise the
 * base subobject's message field) via an injectable slot on the derived
 * class — a caller wiring the real libc++ can supply the actual body.
 * Raises until wired, per Rule 3 (throw on undecoded, never approximate).
 */
function std_logic_error_C2_stub(_self: length_error, _msg: string): void {
  throw new Error(
    "std::logic_error::logic_error(char const*) @Flexo 0x1497290 (libc++ " +
      "stub) — not yet transcribed. Called from " +
      "std::length_error::length_error(char const*) @Flexo 0x4e4f9. Wire a " +
      "real impl via length_error.setLogicErrorBaseCtor(fn) if you need it.",
  );
}

let _logic_error_C2_impl: (self: length_error, msg: string) => void =
  std_logic_error_C2_stub;

/**
 * `std::length_error` — libc++'s "length exceeded" exception. Only its
 * C1 ctor is transcribed in this file.
 *
 * NOTE ON NAMING: TypeScript class names conventionally are PascalCase
 * (`LengthError`), but the raw-port rule is that a file/class name
 * mirrors the exact FCP class name so reviewers can diff the port
 * against `otool` output. `std::length_error` cannot be a JS identifier
 * (colons aren't allowed), so the class is `length_error` (matching the
 * bare STL name) and lives in a file named `std_length_error.ts` (the
 * `std_` prefix disambiguates the namespace and is a valid filename).
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class length_error {
  /**
   * @Flexo 0x00 — the vptr. Installed twice during construction:
   *   1. by the logic_error base ctor (base class's vtable);
   *   2. overridden @0x4e509 by this ctor with length_error's own
   *      `vtable + 0x10`.
   * Modelled here as an opaque descriptor so tests can observe which
   * derived class's vtable is currently installed.
   */
  vptr: { vtable: unknown; offset: number } = {
    vtable: __ZTVSt12length_error,
    offset: 0x10,
  };

  /** Inject a real libc++ `std::logic_error::logic_error(char const*)`.
   *  See file header (frontier callees). Not part of the FCP disasm —
   *  this is the raw-port harness surface for the libc++ frontier. */
  static setLogicErrorBaseCtor(
    fn: (self: length_error, msg: string) => void,
  ): void {
    _logic_error_C2_impl = fn;
  }

  /**
   * `std::length_error::length_error(char const*)` — @Flexo 0x4e4f0
   * (__ZNSt12length_errorC1B9nqe210106EPKc, C1 unified ctor).
   *
   * Faithful line-for-line transcription: invoke the base ctor to
   * initialise the logic_error subobject with the message, then
   * override the primary vptr so virtual dispatch resolves through
   * length_error's vtable (with the Itanium-ABI +0x10 offset).
   */
  constructor(msg: string) {
    // ------------------------------------------------------------
    // @0x4e4f0..0x4e4f6 — prologue + save `this` in %rbx across the
    //                     imminent call.  (No TS-visible effect.)
    // @0x4e4f9           — callq std::logic_error::logic_error(char const*)
    //                     with `this` (=%rdi) and `msg` (=%rsi passed
    //                     straight through). This installs the base
    //                     subobject including its own vptr; we override
    //                     the vptr below.
    // ------------------------------------------------------------
    _logic_error_C2_impl(this, msg);
    // ------------------------------------------------------------
    // @0x4e4fe..0x4e505 — rax = &__ZTVSt12length_error + 0x10.
    // @0x4e509           — this->vptr = rax  (override base's vptr).
    // ------------------------------------------------------------
    this.vptr = __ZTVSt12length_error_plus_0x10;
    // ------------------------------------------------------------
    // @0x4e50c..0x4e512 — epilogue (undo pad + restore %rbx + retq).
    //                     (No TS-visible effect.)
    // ------------------------------------------------------------
  }
}
