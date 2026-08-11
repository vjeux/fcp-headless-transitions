// GLPBO — Helium OpenGL Pixel-Buffer-Object wrapper (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN5GLPBO25forcePostReadPixelsFinishEi.s
//                                                            (forcePostReadPixelsFinish — PORTED)
//   raw-port/re/disasm/Helium.__ZN5GLPBO24forcePostReadPixelsFenceEi.s
//                                                            (forcePostReadPixelsFence — read ONLY
//                                                             as the structural twin that shows
//                                                             this is a family of static toggles;
//                                                             a separate ledger entry, NOT ported)
//
// This file ports ONLY the symbol listed under "Symbols ported here" below.
// The ctors @0x115e10 / @0x115eb0, dtors @0x115ec0 / @0x116010, _delete
// @0x115f30, _setup @0x116080, ReleaseDataPtr @0x116180, _map @0x1161b0,
// _unmap @0x116370, Resize @0x116460, ReadPixels @0x1164d0, GetDataPtr
// @0x116680 and forcePostReadPixelsFence @0x1166c0 are each a separate ledger
// entry and will be ADDED to THIS file (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// THIS IS A STATIC MEMBER FUNCTION — no `this`
// -----------------------------------------------------------------------------
// The argument arrives in %edi, the FIRST SysV integer register. For a
// non-static member function %edi would hold `this` and the argument would be
// in %esi (compare `HGMetalSharedEvent::setEventID` @0x1d55f4, which stores
// %esi). So `forcePostReadPixelsFinish` takes no implicit `this`: it is a
// static member function that writes a class-level static variable, and it is
// modelled below as a TS `static` method over a module-scope global rather than
// as an instance method over a field. The mangling agrees — there is no `K`
// qualifier and no `this` parameter encoded.
//
// -----------------------------------------------------------------------------
// CLASS-STATIC STORAGE
// -----------------------------------------------------------------------------
//   __ZN5GLPBO27m_ForcePostReadPixelsFinishE — @Helium 0xade4ec, an `int`.
//     There are exactly TWO references to it in the whole framework:
//       * the store in this function            @0x1166b4  `movl %edi, ...(%rip)`
//       * a read inside `GLPBO::_map()`         @0x116218  `cmpl $0x0, ...(%rip)`
//     So it is a write-here / test-there toggle: `_map` branches on whether it
//     is non-zero. `_map` is a separate ledger entry, so nothing in this file
//     consumes the value; it is stored and that is the whole observable effect.
//     Its load-time value is 0, confirmed by reading the symbol out of the live
//     image (see ORACLE).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   forcePostReadPixelsFinish — none. Four instructions, one store; no callq,
//     no symbol stub, no indirect call. `depgraph.py deps
//     __ZN5GLPBO25forcePostReadPixelsFinishEi` reports nothing at all.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN5GLPBO25forcePostReadPixelsFinishEi
//       — GLPBO::forcePostReadPixelsFinish(int) @Helium 0x1166b0
//
// -----------------------------------------------------------------------------
// FULL DISASM — forcePostReadPixelsFinish @0x1166b0 (6 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN5GLPBO25forcePostReadPixelsFinishEi:
//     0x1166b0  pushq %rbp                                   ; frame prologue
//     0x1166b1  movq  %rsp, %rbp
//     0x1166b4  movl  %edi, m_ForcePostReadPixelsFinish(%rip) ; the static = arg
//     0x1166ba  popq  %rbp                                   ; epilogue
//     0x1166bb  retq
//     0x1166bc  nopl  (%rax)                                 ; padding — not executed
//
// The structural twin one function later confirms the pattern rather than
// leaving it a single data point — `forcePostReadPixelsFence(int)` @0x1166c0 is
// byte-for-byte the same four instructions with one different global:
//     0x1166c4  movl %edi, m_ForcePostReadPixelsFence(%rip)
// Two adjacent static toggles, same shape, different destination. A real call
// to the FINISH setter leaves the FENCE global untouched (measured — see
// ORACLE), which is how the two are proven to be distinct storage and not one
// slot under two names.

/**
 * @Helium 0xade4ec — `GLPBO::m_ForcePostReadPixelsFinish`, the class-level
 * static `int` toggle.
 *
 * Written only by `GLPBO.forcePostReadPixelsFinish` @0x1166b4 and read only by
 * `GLPBO::_map()` @0x116218 (`cmpl $0x0`), which is a separate ledger entry.
 * TS has no linker, so the class-static is modelled as a module-scope `let`.
 *
 * `0` is the value the symbol actually holds in the freshly loaded image, read
 * out of the live binary rather than assumed from "statics are zero" (see the
 * setter's ORACLE note).
 *
 * Typed as a SIGNED 32-bit value: the parameter is `int` (`i` in the mangling),
 * and the live global reads back negative for negative arguments.
 */
let m_ForcePostReadPixelsFinish = 0; // @Helium 0xade4ec

/**
 * `GLPBO` — Helium's OpenGL Pixel Buffer Object wrapper. This file currently
 * holds only the static toggle setter; see the header for the rest of the
 * class's symbols, each of which is its own ledger entry.
 */
export class GLPBO {
  /**
   * `GLPBO::forcePostReadPixelsFinish(int)` @Helium 0x1166b0
   *   (__ZN5GLPBO25forcePostReadPixelsFinishEi)
   *
   * Faithful transcription of the entire 6-line function: one 32-bit store of
   * the argument into the class-static `m_ForcePostReadPixelsFinish`. No
   * callees, no branches, no validation, no clamping — and, being static, no
   * `this`. The full disassembly is quoted in the file header.
   *
   * `static` in TS for the same reason it is static in C++: the argument
   * arrives in %edi (the first integer register), so there is no implicit
   * receiver, and the destination is a class-level global rather than a field
   * at some `this+offset`.
   *
   * ORACLE — verified by calling the live Helium binary. The symbol is exported
   * (the cached inventory lists `00000000001166b0 T
   * __ZN5GLPBO25forcePostReadPixelsFinishEi`) and so is the global it writes,
   * so the harness can dlsym BOTH: it dlopens Helium under `arch -x86_64
   * /usr/bin/python3` (every address here is an x86_64 offset — a native arm64
   * process would be checking this port against code it did not transcribe, see
   * OPS_LOG), binds `m_ForcePostReadPixelsFinish` as a live `c_int32`, and then
   * calls the real setter and reads the real global back. Results over 1,028
   * values (exhaustive -8..16, plus INT_MAX, INT_MIN, -1, 1000000, and 1,000
   * random signed 32-bit ints):
   *   - the global equals the argument on 1028/1028;
   *   - the global's value BEFORE any call is 0, so the initialiser above is
   *     measured rather than assumed;
   *   - a call to this setter leaves the sibling `m_ForcePostReadPixelsFence`
   *     global unchanged, proving the two adjacent toggles are distinct storage.
   * NEGATIVE CONTROL (measured on the same corpus): modelling the store as
   * UNSIGNED with `>>> 0` — which is the right model for the u32 setters
   * elsewhere in this port, e.g. HGMetalSharedEvent::setEventID — would be
   * wrong on 500/1028 cases, i.e. every negative int, because the parameter
   * here is a signed `int` and the live global reads back negative. Hence
   * `| 0`, deliberately, and not by copying the neighbouring convention.
   *
   * @param value — the toggle value, SysV `%edi`, a signed `int`.
   */
  static forcePostReadPixelsFinish(value: number): void {
    // ------------------------------------------------------------
    // @0x1166b0..0x1166b1 — prologue (no TS-visible effect).
    // @0x1166b4 — movl %edi, m_ForcePostReadPixelsFinish(%rip) : 32-bit store
    //   of the first integer argument into the class-static.
    //   `| 0` models the SIGNED 32-bit width: the C++ parameter is `int`, and
    //   the live global reads back -1 (not 4294967295) after a call with -1.
    // @0x1166ba..0x1166bb — epilogue + retq.
    // ------------------------------------------------------------
    m_ForcePostReadPixelsFinish = value | 0;
  }
}
