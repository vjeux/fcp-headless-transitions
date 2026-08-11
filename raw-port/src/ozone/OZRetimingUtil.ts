// OZRetimingUtil — Ozone retiming helpers (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/__ZN14OZRetimingUtil15GetMaxTimeScaleEP19OZChannelObjectRoot.s
//
// This file ports ONLY the symbol listed under "Symbols ported here" below.
// OZRetimingUtil's other members — the RetimingExaminerTemplate<T>
// instantiations (@0xc2220, @0xc7730, @0xc7750, ...) and the RootInfo map
// machinery (@0x86330) — are each a separate ledger entry and will be ADDED to
// THIS file (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14OZRetimingUtil15GetMaxTimeScaleEP19OZChannelObjectRoot
//       — OZRetimingUtil::GetMaxTimeScale(OZChannelObjectRoot*) @Ozone 0x45a020
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   GetMaxTimeScale — none. Four instructions, one literal load; no callq, no
//     symbol stub, no indirect call, and — the point worth stating — no
//     dereference of its `OZChannelObjectRoot*` parameter at all.
//     `depgraph.py deps __ZN14OZRetimingUtil15GetMaxTimeScaleEP19OZChannelObjectRoot`
//     reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM — GetMaxTimeScale @0x45a020 (6 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN14OZRetimingUtil15GetMaxTimeScaleEP19OZChannelObjectRoot:
//     0x45a020  pushq %rbp                     ; frame prologue
//     0x45a021  movq  %rsp, %rbp
//     0x45a024  movsd 0x2adb04(%rip), %xmm0    ; xmm0 = *(double*)0x707b30
//                                              ;   rip after this 8-byte insn is
//                                              ;   0x45a02c, and
//                                              ;   0x45a02c + 0x2adb04 = 0x707b30
//     0x45a02c  popq  %rbp                     ; epilogue
//     0x45a02d  retq                           ; return xmm0 (SysV double return)
//     0x45a02e  nop                            ; padding — not executed
//
// THE PARAMETER IS NEVER READ. `%rdi` (the `OZChannelObjectRoot*`) is not
// touched by any of the four executed instructions — no load, no compare, no
// branch. The function is a constant. That is a strong enough claim to be worth
// proving rather than asserting, so the differential below calls the real
// symbol with a NULL pointer: a body that dereferenced its argument would fault,
// and instead it returns the same value it returns for a valid object.
//
// -----------------------------------------------------------------------------
// THE CONSTANT
// -----------------------------------------------------------------------------
// The literal at @Ozone 0x707b30 is the 8 bytes `00 00 00 00 00 00 69 40`,
// i.e. IEEE-754 double 0x4069000000000000 = exactly 200.0 — an exact binary
// value, so there is no rounding to worry about. Read directly out of the
// x86_64 slice at that address AND confirmed by executing the real function
// (see ORACLE). `movsd` is a 64-bit (double) load, not `movss`, so this is a
// double and no `Math.fround` narrowing applies.

/**
 * @Ozone 0x707b30 — the `double` literal that `GetMaxTimeScale` returns.
 *
 * Bytes `00 00 00 00 00 00 69 40` = 0x4069000000000000 = 200.0 exactly. Loaded
 * by `movsd 0x2adb04(%rip), %xmm0` @0x45a024. Named as a module constant rather
 * than inlined so the address it came from travels with the value.
 */
const OZ_RETIMING_MAX_TIME_SCALE = 200.0; // @Ozone 0x707b30

/**
 * `OZRetimingUtil` — Ozone's retiming helper namespace-class. This file
 * currently holds only `GetMaxTimeScale`; see the header for the rest of the
 * class's symbols, each of which is its own ledger entry.
 */
export class OZRetimingUtil {
  /**
   * `OZRetimingUtil::GetMaxTimeScale(OZChannelObjectRoot*)` -> `double`
   *   @Ozone 0x45a020
   *   (__ZN14OZRetimingUtil15GetMaxTimeScaleEP19OZChannelObjectRoot)
   *
   * Faithful transcription of the entire 6-line function: load the `double`
   * literal at @Ozone 0x707b30 into `%xmm0` and return it. The
   * `OZChannelObjectRoot*` parameter is accepted and completely ignored — no
   * instruction in the body touches `%rdi` — so this is a constant function
   * whose signature merely keeps a call-site convention. The full disassembly
   * is quoted in the file header.
   *
   * `static` because the mangling encodes no `this`: the sole parameter is the
   * `OZChannelObjectRoot*`, which arrives in `%rdi` as the first argument.
   *
   * The parameter is kept in the TS signature rather than dropped, so call
   * sites transcribed later match the binary's arity one-for-one; it is marked
   * unused below in the way the file's own tsconfig accepts.
   *
   * ORACLE — verified by calling the live Ozone binary. The symbol is exported
   * (the cached inventory lists `000000000045a020 T
   * __ZN14OZRetimingUtil15GetMaxTimeScaleEP19OZChannelObjectRoot`). Ozone does
   * not dlopen directly because of its `@rpath` chain, and `DYLD_*` cannot fix
   * that for a hardened `/usr/bin/python3`; per OPS_LOG the working approach is
   * to walk `otool -L`'s `@rpath/...` entries and `CDLL(..., RTLD_GLOBAL)` each
   * dependency DEPTH-FIRST before loading the target. That is what the harness
   * does — 44 images preloaded — running under `arch -x86_64 /usr/bin/python3`
   * so dlopen maps the x86_64 slice this port was transcribed from (a native
   * arm64 process would be checking the port against code it never read; see
   * OPS_LOG). Results:
   *   - the real function returns exactly 200.0, whose bit pattern
   *     `00 00 00 00 00 00 69 40` is byte-identical to the literal read
   *     statically from @0x707b30 — so the static decode and the running code
   *     agree;
   *   - it returns that same value for a NULL pointer, for 0, for a real
   *     64-byte buffer, and for the garbage pointer 0xdeadbeef — 4 of 4
   *     identical. The NULL case is the load-bearing one: it proves the
   *     parameter is never dereferenced, which is exactly what makes ignoring
   *     it in the port faithful rather than lazy.
   *
   * @param _root — the `OZChannelObjectRoot*`; accepted and ignored, as the
   *                machine does.
   * @returns the maximum time scale, always 200.0.
   */
  static GetMaxTimeScale(_root: unknown): number {
    // ------------------------------------------------------------
    // @0x45a020..0x45a021 — prologue (no TS-visible effect).
    // @0x45a024 — movsd 0x2adb04(%rip), %xmm0 : load the double at @0x707b30.
    //   A 64-bit load, so the value stays a JS double with no narrowing.
    //   `%rdi` (the parameter) is not read here or anywhere else in the body.
    // @0x45a02c..0x45a02d — epilogue + retq, returning %xmm0.
    // ------------------------------------------------------------
    void _root; // the machine never touches %rdi; keep the arity, ignore the value
    return OZ_RETIMING_MAX_TIME_SCALE;
  }
}
