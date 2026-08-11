// raw-port/src/channels/OZRetimingUtil.ts
//
// FCP `OZRetimingUtil` — Ozone's retiming helper class (the RetimingExaminerTemplate<> family
// and the RootInfo map live on it; all of those are separate ledger units).
//
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (unadjusted VAs, exactly as `otool -tV -arch x86_64` prints them).
//
// ONE symbol is ported in this file:
//   @0x45a010  __ZN14OZRetimingUtil15GetMinTimeScaleEP19OZChannelObjectRoot
//              OZRetimingUtil::GetMinTimeScale(OZChannelObjectRoot*)
// Disassembly (regenerate with `bash raw-port/tools/disasm.sh --sym
//   __ZN14OZRetimingUtil15GetMinTimeScaleEP19OZChannelObjectRoot Ozone`):
//   raw-port/re/disasm/__ZN14OZRetimingUtil15GetMinTimeScaleEP19OZChannelObjectRoot.s (7 lines)
//
// No struct layout is observable from this unit: the body dereferences no pointer at all.

/**
 * `OZChannelObjectRoot*` — the channel-tree root the caller passes. Declared as an opaque handle
 * because this body never reads it (see the method doc); the real class is ported elsewhere.
 */
export type OZChannelObjectRootPtr = unknown;

/**
 * `OZRetimingUtil` — retiming helper. Only `GetMinTimeScale` is ported here; every other member
 * (the `RetimingExaminerTemplate<T>` instantiations @0xc2220/@0xc7730/@0xc7750…, the
 * `map<OZChannelObjectRoot*, RootInfo>` tree helpers @0x86330, …) is a separate ledger unit and
 * gets ADDED to this file when claimed (one class = one file; G6 add-only).
 */
export class OZRetimingUtil {
  /**
   * `OZRetimingUtil::GetMinTimeScale(OZChannelObjectRoot*)` — @Ozone 0x45a010
   *   `__ZN14OZRetimingUtil15GetMinTimeScaleEP19OZChannelObjectRoot`
   *
   * FULL transcription — the body is 3 executed instructions and nothing else:
   *
   *   0x45a010  pushq  %rbp                   ; frame setup (no TS counterpart)
   *   0x45a011  movq   %rsp, %rbp             ; frame setup (no TS counterpart)
   *   0x45a014  movsd  0x2adb34(%rip), %xmm0  ; xmm0 = *(double*)0x707b50   <-- the whole body
   *   0x45a01c  popq   %rbp                   ; frame teardown (no TS counterpart)
   *   0x45a01d  retq                          ; returns the double in %xmm0
   *   0x45a01e  nop                           ; alignment padding, never executed
   *
   * THE CONSTANT. %rip after the `movsd` is 0x45a01c, so the operand address is
   * 0x45a01c + 0x2adb34 = @Ozone 0x707b50, and the 8 bytes there are
   * 0x3f50624dd2f1a9fc = 0.001 exactly as IEEE-754 stores it — the nearest double to 1/1000,
   * i.e. a millisecond floor expressed in seconds. Resolved with
   * `python3 raw-port/army/tools/resolve.py Ozone const 0x707b50`.
   *
   * THE ARGUMENT IS NOT READ. There is no memory operand other than the RIP-relative constant:
   * the pointer argument is never dereferenced and never compared, so the result does not depend
   * on the channel tree in any way. (That also makes the static-vs-instance question
   * unobservable here — whether %rdi is `this` or the root, neither register is touched.) The
   * parameter is kept because it is part of the ABI signature this unit ports.
   *
   * There is no callee, no allocation, and no indirect or virtual dispatch; `depgraph.py deps`
   * lists no dependency.
   *
   * ORACLE (executed, not read): the symbol is exported (nm `T`), so it was dlsym'd in a Rosetta
   * x86_64 process (Ozone loaded by walking its @rpath chain) and called with four different
   * pointer arguments (0x0, 0x1, 0xdeadbeef and a live 0x200-byte buffer). Live FCP returned the
   * identical double every time, bit pattern 0x3f50624dd2f1a9fc = 0.001 — which both pins the
   * constant and confirms the argument is ignored.
   *
   * @param _root the `OZChannelObjectRoot*` argument — never dereferenced by this body.
   * @returns %xmm0 — always 0.001 (@Ozone 0x707b50).
   */
  static GetMinTimeScale(_root: OZChannelObjectRootPtr): number {
    // @0x45a014  movsd 0x2adb34(%rip),%xmm0  ->  *(double*)0x707b50 = 0.001
    return 0.001;
  }
}
