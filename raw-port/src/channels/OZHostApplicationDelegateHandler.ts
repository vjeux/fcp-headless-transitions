// OZHostApplicationDelegateHandler — raw transcription of a two-word Ozone helper
// object holding a single `void*` payload. This unit ports ONLY the C1 unified
// constructor at @0x5d3a50; the remaining methods (C2 base ctor @0x5d3a40, dtors
// D1/D2 @0x5d3a70/@0x5d3a60, and the many wantsToUse*/wantsExtraLineSpacing*
// query accessors starting @0x5d3a80) are separate ledger entries and are OUT
// OF SCOPE for this file (they will be added to this same class file when
// their own ledger entries are claimed by future depclaim rounds — per the
// "one class per file" rule).
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs
//           from `otool -tV`).
//   Disasm: raw-port/re/disasm/__ZN32OZHostApplicationDelegateHandlerC1EPv.s
//
// ─────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT
// ─────────────────────────────────────────────────────────────────────────
// Recovered from the C1/C2 ctor bodies (both are the same 4-instruction
// trivial-store, byte-for-byte identical — no vtable install, no member
// initializations beyond the single stored pointer). No dtor body has been
// decoded in this pass, but the ctor's only writable field decides the
// layout:
//
//   size ≥ 0x08                 (only offset 0 is touched)
//   +0x00   payload : void*     ; `movq %rsi, (%rdi)` @0x5d3a54 stores the
//                                 ctor's second argument here. Purpose of
//                                 the void* is not decoded from this ctor
//                                 alone — the wantsTo* accessors (separate
//                                 ledger entries) will dereference it and
//                                 reveal what it points to (likely an
//                                 Objective-C delegate id — the class name
//                                 "HostApplicationDelegateHandler" strongly
//                                 hints at a Cocoa delegate object, and the
//                                 setHostApplicationDelegate/getHostApplicationDelegate
//                                 accessors on OZApplication also traffic in
//                                 a void* delegate handle — but the ctor
//                                 disasm itself does not identify the type).
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOLS PORTED IN THIS FILE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZN32OZHostApplicationDelegateHandlerC1EPv
//       — OZHostApplicationDelegateHandler::OZHostApplicationDelegateHandler(void*)
//         @Ozone 0x5d3a50  (the C1 "unified/complete-object" constructor
//         variant — Itanium C++ ABI section 5.1.4).
//
// The C2 base-object constructor @0x5d3a40 is a SEPARATE ledger entry (its
// body is byte-for-byte identical to C1's — Clang emitted the same 4
// instructions twice rather than aliasing — but its ABI role is distinct
// and it will be its own ported symbol when claimed).
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM
//   raw-port/re/disasm/__ZN32OZHostApplicationDelegateHandlerC1EPv.s
// ─────────────────────────────────────────────────────────────────────────
//   0x5d3a50  pushq %rbp                 ; frame prologue
//   0x5d3a51  movq  %rsp, %rbp
//   0x5d3a54  movq  %rsi, (%rdi)          ; *this = delegate
//                                         ; (rdi = `this`, rsi = 2nd arg;
//                                         ;  System-V AMD64 ABI: first two
//                                         ;  integer/pointer args in rdi,rsi).
//   0x5d3a57  popq  %rbp                  ; frame epilogue
//   0x5d3a58  retq
//   0x5d3a59  nopl  (%rax)                ; 4-byte alignment pad (linker
//                                         ;  padding to the next 8-byte
//                                         ;  boundary before the D2 dtor
//                                         ;  @0x5d3a60).
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZHostApplicationDelegateHandler` — an Ozone helper that wraps a single
 * `void*` (in the FCP process this is understood to be an Objective-C
 * delegate object handle, though the ctor disasm alone doesn't prove
 * that; the wantsTo* accessor bodies — separate ledger entries — will
 * confirm). Only its C1 constructor is ported in this file; every other
 * method (C2 base ctor, dtors, and the many wantsTo* query accessors)
 * is a separate ledger entry.
 *
 * Struct layout (see file header):
 *   +0x00 payload : void*  — set by C1/C2, read by wantsTo* accessors.
 */
export class OZHostApplicationDelegateHandler {
  /**
   * @Ozone 0x00 — `+0x00 payload : void*`. Set by the C1 ctor
   * (@Ozone 0x5d3a54 `movq %rsi, (%rdi)`). Reads by the wantsTo*
   * accessors are separate ledger entries and will annotate this
   * field's role when they are ported. `unknown` is the faithful type
   * here — the ctor's disasm signature is `(void*)` and we do not
   * decode further ambient type information from this instruction alone.
   */
  payload: unknown = null;

  /**
   * `OZHostApplicationDelegateHandler::OZHostApplicationDelegateHandler(void*)`
   * — @Ozone 0x5d3a50 (__ZN32OZHostApplicationDelegateHandlerC1EPv,
   * the C1 unified/complete-object ctor variant).
   *
   * Faithful line-for-line transcription of the 4-instruction disasm
   * body — this ctor's only side effect is storing its `void*`
   * argument into the object's first field.
   *
   *   0x5d3a50  pushq %rbp
   *   0x5d3a51  movq  %rsp, %rbp
   *   0x5d3a54  movq  %rsi, (%rdi)      ; this->payload = delegate
   *   0x5d3a57  popq  %rbp
   *   0x5d3a58  retq
   *
   * Note: no base-class ctor is invoked (this class has no base per
   * the ctor's absence of any prior `call` or vtable install), and no
   * additional member initialisation is performed. If a future revision
   * adds more fields, the ctor disasm would have to grow first — the
   * port would then be updated to match.
   */
  constructor(delegate: unknown) {
    // ------------------------------------------------------------
    // @0x5d3a50..0x5d3a51 — prologue (no TS-visible effect).
    // @0x5d3a54           — `movq %rsi, (%rdi)`: store the ctor's
    //                       second argument (System-V ABI: `%rsi` is
    //                       the second integer/pointer arg) into
    //                       this+0x00.
    // @0x5d3a57..0x5d3a58 — epilogue + retq.
    // ------------------------------------------------------------
    this.payload = delegate;
  }
}
