// PCMediaPlugInsRegisterMediaExtensionFormatReaders.ts — ProCore free function
// PCMediaPlugInsRegisterMediaExtensionFormatReaders(). Transcribed from the disassembly at
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.__Z49PCMediaPlugInsRegisterMediaExtensionFormatReadersv.s.
//
// ROLE. A one-line registration shim: it forwards, verbatim, to the MediaToolbox C API
// `MTRegisterProfessionalVideoWorkflowFormatReaders()`, which registers FCP's professional
// video-workflow format readers with the OS media stack. There is no ProCore-internal logic
// here — the whole body is a standard-prologue-then-tail-jump into the extern.
//
// DISASSEMBLY (@ProCore 0x94323, 5 instructions):
//   0x94323  pushq %rbp
//   0x94324  movq  %rsp, %rbp
//   0x94327  popq  %rbp
//   0x94328  jmp   0xde47a          ## symbol stub for: _MTRegisterProfessionalVideoWorkflowFormatReaders
//
// The prologue/epilogue is a no-op frame; the function is purely a tail-call. `_MTRegister…` is a
// MediaToolbox (out-of-scope OS media framework) C extern — it is NOT any in-scope
// ProCore/ProChannel/Helium/Ozone/Flexo symbol (grep of the symbol map + depgraph deps return
// nothing in scope). Per PORTING_SPEC Rule 3, an undecoded out-of-scope OS extern is surfaced as
// a loud throw citing its @0xADDR, not approximated. Nothing downstream in the port depends on the
// OS-side registration side effect, which cannot occur in a TS environment anyway.

/**
 * PCMediaPlugInsRegisterMediaExtensionFormatReaders()  @ProCore 0x94323.
 *
 * Tail-calls the MediaToolbox extern
 *   _MTRegisterProfessionalVideoWorkflowFormatReaders  (symbol stub @ProCore 0xde47a)
 * which is an out-of-scope OS media-framework registration entry point (MediaToolbox). It has no
 * in-scope callees and no return value to model; the sole effect is an OS-side reader registration.
 */
export function PCMediaPlugInsRegisterMediaExtensionFormatReaders(): void {
  // @0x94328  jmp _MTRegisterProfessionalVideoWorkflowFormatReaders  (## stub @ProCore 0xde47a)
  throw new Error(
    "MTRegisterProfessionalVideoWorkflowFormatReaders @ProCore 0xde47a not yet transcribed " +
      "(out-of-scope MediaToolbox OS extern)",
  );
}
