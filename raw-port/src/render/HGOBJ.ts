// raw-port: HGOBJ — Helium framework (render layer)
//
// Static predicate helpers gating four HGObject-tracker diagnostic tiers.
// Every method simply compares the module-scoped `HGOBJ::__verboseLevel` i32
// against a fixed threshold and returns `level >= threshold` (or, for
// _dumpStatus, `level != 0`). No side effects, no I/O — these are just
// "should the tracker emit this tier?" gates that callers check before doing
// any actual dumping work.
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x1a0e10  HGOBJ::_dumpStatus()      -> bool   ( __verboseLevel != 0 )
//   @Helium 0x1a0e20  HGOBJ::_dumpCounts()      -> bool   ( __verboseLevel >= 2 )
//   @Helium 0x1a0e30  HGOBJ::_dumpObjects()     -> bool   ( __verboseLevel >= 3 )
//   @Helium 0x1a0e40  HGOBJ::_dumpAllObjects()  -> bool   ( __verboseLevel >= 4 )
//
// re/disasm:
//   raw-port/re/disasm/Helium.HGOBJ._dumpStatus.s
//   raw-port/re/disasm/Helium.HGOBJ._dumpCounts.s
//   raw-port/re/disasm/Helium.HGOBJ._dumpObjects.s
//   raw-port/re/disasm/Helium.HGOBJ._dumpAllObjects.s
//
// EXTERNAL GLOBAL:
//   __ZN5HGOBJ14__verboseLevelE  — HGOBJ::__verboseLevel (int32).
//   Loaded RIP-relative in all four bodies (cmpl $N, __verboseLevel(%rip)).
//   The four thresholds imply the natural tier ordering:
//     0 = silent, 1 = status only, 2 = +counts, 3 = +objects, 4 = +all-objects.
//   We expose it here as a mutable module-scope i32 so callers can set the
//   verbosity level; the C++ side lets it be set by an env / debugger poke.
//
// Each function mirrors its asm exactly:
//   pushq %rbp; movq %rsp,%rbp;
//   cmpl $K, __verboseLevel(%rip);
//   setae %al        (or setne %al for _dumpStatus)
//   popq %rbp; retq
//
// `setae` = set if unsigned above-or-equal after cmp — matches `level >= K`
// for the non-negative levels expected here. We reproduce with `>=` on a
// masked i32; the setae/setne distinction is preserved verbatim per method.

/** HGOBJ::__verboseLevel — module-scoped i32 flag consulted by all four gates.
 *  @Helium symbol __ZN5HGOBJ14__verboseLevelE — RIP-const load site addresses:
 *    @0x1a0e14 (_dumpStatus), @0x1a0e24 (_dumpCounts),
 *    @0x1a0e34 (_dumpObjects), @0x1a0e44 (_dumpAllObjects).
 */
let __verboseLevel = 0;

/** Test helper: read the current tier. Not present in the C++ side (there the
 *  global is a public data member); provided here so callers/tests can inspect
 *  without reaching into module internals. */
export function getVerboseLevel(): number {
  return __verboseLevel | 0;
}

/** Test helper: set the current tier. Mirrors external write-access to
 *  __verboseLevel (e.g. via a symbol lookup from a debugger or launcher). */
export function setVerboseLevel(level: number): void {
  __verboseLevel = level | 0;
}

export class HGOBJ {
  /**
   * HGOBJ::_dumpStatus() -> bool
   * @Helium 0x1a0e10
   *
   *   pushq %rbp; movq %rsp,%rbp                              @0x1a0e10
   *   cmpl $0x0, HGOBJ::__verboseLevel(%rip)                  @0x1a0e14
   *   setne %al                                               @0x1a0e1b
   *   popq %rbp; retq                                         @0x1a0e1e
   */
  static _dumpStatus(): boolean {
    // @0x1a0e14: cmpl $0, __verboseLevel; @0x1a0e1b: setne %al
    return (__verboseLevel | 0) !== 0;
  }

  /**
   * HGOBJ::_dumpCounts() -> bool
   * @Helium 0x1a0e20
   *
   *   pushq %rbp; movq %rsp,%rbp                              @0x1a0e20
   *   cmpl $0x2, HGOBJ::__verboseLevel(%rip)                  @0x1a0e24
   *   setae %al                                               @0x1a0e2b
   *   popq %rbp; retq                                         @0x1a0e2e
   */
  static _dumpCounts(): boolean {
    // @0x1a0e24: cmpl $2; @0x1a0e2b: setae %al -> level >= 2 (unsigned)
    return (__verboseLevel | 0) >= 2;
  }

  /**
   * HGOBJ::_dumpObjects() -> bool
   * @Helium 0x1a0e30
   *
   *   pushq %rbp; movq %rsp,%rbp                              @0x1a0e30
   *   cmpl $0x3, HGOBJ::__verboseLevel(%rip)                  @0x1a0e34
   *   setae %al                                               @0x1a0e3b
   *   popq %rbp; retq                                         @0x1a0e3e
   */
  static _dumpObjects(): boolean {
    // @0x1a0e34: cmpl $3; @0x1a0e3b: setae %al -> level >= 3 (unsigned)
    return (__verboseLevel | 0) >= 3;
  }

  /**
   * HGOBJ::_dumpAllObjects() -> bool
   * @Helium 0x1a0e40
   *
   *   pushq %rbp; movq %rsp,%rbp                              @0x1a0e40
   *   cmpl $0x4, HGOBJ::__verboseLevel(%rip)                  @0x1a0e44
   *   setae %al                                               @0x1a0e4b
   *   popq %rbp; retq                                         @0x1a0e4e
   */
  static _dumpAllObjects(): boolean {
    // @0x1a0e44: cmpl $4; @0x1a0e4b: setae %al -> level >= 4 (unsigned)
    return (__verboseLevel | 0) >= 4;
  }
}
