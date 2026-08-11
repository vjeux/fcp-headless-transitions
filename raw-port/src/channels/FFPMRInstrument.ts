// raw-port/src/channels/FFPMRInstrument.ts
//
// FCP `FFPMRInstrument` — the BASE class of Flexo's Performance Measurement / Reporting (FFPMR)
// instrument family. Its null-object subclass `FFPMRNoOpInstrument` is already landed
// (raw-port/src/channels/FFPMRNoOpInstrument.ts) and tail-calls this class's D2 dtor; this file is
// the base class itself.
//
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (unadjusted VAs, exactly as `otool -tV -arch x86_64` prints them).
//
// ONE symbol is ported in this file:
//   @0xd019e0  __ZN15FFPMRInstrumentC2EPK10__CFString
//              FFPMRInstrument::FFPMRInstrument(__CFString const*)      [C2 base ctor]
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN15FFPMRInstrumentC2EPK10__CFString Flexo`):
//   raw-port/re/disasm/Flexo.__ZN15FFPMRInstrumentC2EPK10__CFString.s   (16 lines)
//
// The class's other symbols are SEPARATE ledger units and are deliberately not ported here; each
// gets ADDED to this same file when its own unit is claimed (one class = one file; G6 add-only):
//   D2 @0xd01a10, D1 @0x14874f0, D0 @0x1487500, createPool @0xd01a40, deletePool @0xd01a60,
//   doLog(__CFString const*, FFPMRSimpleTimer*, double, __CFString const*) @0xd01a80.
// (There is NO C1 symbol in the framework — the complete-object ctor is not separately emitted.)
//
// ── Struct layout, recovered from this ctor's own instruction stream ────────────────────────
//   +0x00  vtable ptr   — `leaq 0xc0f190(%rip),%rax ; movq %rax,(%rdi)` @0xd019e9/0xd019f0.
//                         %rip at that point is 0xd019f0, so the installed pointer is
//                         0xd019f0 + 0xc0f190 = 0x1910b80, which is the class vtable symbol
//                         `__ZTV15FFPMRInstrument` (0x1910b70) + 0x10 — i.e. the standard Itanium
//                         install point, just past the offset-to-top and typeinfo words. Which
//                         concrete methods sit in which slot belongs to the units that dispatch
//                         through them, so no slot is claimed here.
//   +0x08  CFStringRef  name — `movq %rax,0x8(%rbx)` @0xd019fb, storing the RESULT of
//                         `CFRetain(name)` (the retained reference, which CoreFoundation
//                         documents as the same pointer that was passed in).
// No other field is written: the object is exactly a vptr plus one retained CFStringRef as far as
// this constructor shows, and nothing else may be inferred from it.

/**
 * `__CFString const*` (CFStringRef) — the CoreFoundation string handle the instrument is named
 * with. CoreFoundation is a TRUE out-of-scope extern for this project, so the handle is modelled
 * as an opaque branded value rather than reconstructed.
 */
export type CFStringRef = { readonly __cfString: unique symbol } | string | null;

/**
 * `_CFRetain` — CoreFoundation, called through the Flexo symbol stub at 0x1494854 from
 * @Flexo 0xd019f6. TRUE out-of-scope extern (not one of the five in-scope frameworks).
 *
 * CFRetain increments the retain count and RETURNS THE SAME POINTER it was given, which is the
 * only part of its behaviour this constructor consumes: the returned value in %rax is what gets
 * stored into +0x08. JS has no manual retain/release, so the reference-count side effect has no
 * counterpart and the identity return is modelled directly. This is the same treatment the landed
 * `OZChannelInfo.ts` gives `_CFRetain` (ProChannel stub 0xaca56).
 */
function CFRetain(cf: CFStringRef): CFStringRef {
  // @Flexo 0xd019f6 — callq 0x1494854 (symbol stub for _CFRetain); %rax = the same handle.
  return cf;
}

/**
 * `FFPMRInstrument` — base instrument of the FFPMR family.
 *
 * Only the C2 base constructor is transcribed in this file; see the header for the layout
 * (+0x00 vptr, +0x08 retained name) and for the sibling units not ported here.
 */
export class FFPMRInstrument {
  /**
   * +0x08 — the retained `CFStringRef` name, written by the constructor @Flexo 0xd019fb.
   * Initialised only by the constructor below; the ctor writes this field unconditionally.
   */
  name: CFStringRef;

  /**
   * `FFPMRInstrument::FFPMRInstrument(__CFString const* name)` — @Flexo 0xd019e0
   *   `__ZN15FFPMRInstrumentC2EPK10__CFString` (C2 base-object constructor)
   *
   * FULL transcription — every instruction, in order:
   *
   *   0xd019e0  pushq %rbp                     ; frame setup (no TS counterpart)
   *   0xd019e1  movq  %rsp,%rbp
   *   0xd019e4  pushq %rbx
   *   0xd019e5  pushq %rax                     ; stack alignment
   *   0xd019e6  movq  %rdi,%rbx                ; rbx = this   (saved across the call)
   *   0xd019e9  leaq  0xc0f190(%rip),%rax      ; rax = 0xd019f0 + 0xc0f190 = 0x1910b80
   *                                            ;     = __ZTV15FFPMRInstrument (0x1910b70) + 0x10
   *   0xd019f0  movq  %rax,(%rdi)              ; this->vptr (+0x00) = that vtable slot address
   *   0xd019f3  movq  %rsi,%rdi                ; arg1 = name (the __CFString const* parameter)
   *   0xd019f6  callq 0x1494854                ; symbol stub for _CFRetain  -> %rax = name
   *   0xd019fb  movq  %rax,0x8(%rbx)           ; this->name (+0x08) = the retained handle
   *   0xd019ff  addq  $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   0xd01a06  nopw  %cs:(%rax,%rax)          ; alignment padding, never executed
   *
   * That is the whole constructor: install the vtable, retain the name, store it. There is no
   * base-class constructor call (this IS the base), no allocation, no other field write, and no
   * indirect or virtual dispatch. Its only callee is the CoreFoundation extern `_CFRetain`.
   *
   * The vptr install has no TS counterpart — JS objects carry their own dispatch — so it is
   * documented above and in the file header rather than modelled as a field; the retained name is
   * the one piece of observable state the constructor produces.
   *
   * @param name the `__CFString const*` in %rsi — retained and stored at +0x08.
   */
  constructor(name: CFStringRef) {
    // @0xd019e9..0xd019f0 — install vtable pointer 0x1910b80 at +0x00 (no TS counterpart).
    // @0xd019f6..0xd019fb — this->name = CFRetain(name).
    this.name = CFRetain(name);
  }
}
