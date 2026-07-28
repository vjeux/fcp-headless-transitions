// PCICCTransferFunction.ts — ProCore ICC transfer-function abstract base class.
//
// PCICCTransferFunction is the abstract polymorphic base of a family of ICC
// (International Color Consortium) profile transfer-function types in ProCore:
//   - PCICCTransferFunctionLUT
//   - PCICCTransferFunctionGamma
//   - PCICCTransferFunctionLinear
//   - PCICCTransferFunctionParametric0..4
// (all of which appear in the ProCore symbol table with matching PrintVisitor,
// MakeTagVisitor, and DescriptionVisitor overloads — see e.g.
// __ZN12_GLOBAL__N_112PrintVisitor5visitERK24PCICCTransferFunctionLUT
// through …PCICCTransferFunctionParametric4).
//
// The three exported destructor symbols are:
//   @0x0000000000013790  PCICCTransferFunction::~PCICCTransferFunction()  D2  [__ZN21PCICCTransferFunctionD2Ev]
//   @0x00000000000dd372  PCICCTransferFunction::~PCICCTransferFunction()  D1  [__ZN21PCICCTransferFunctionD1Ev]
//   @0x00000000000dd378  PCICCTransferFunction::~PCICCTransferFunction()  D0  [__ZN21PCICCTransferFunctionD0Ev]
//
// (Assignment of the three exported dtor addresses to D0/D1/D2 is direct from
// `nm -m` output — see nm dump of ProCore.framework: `00000000000dd378 ... D0`,
// `00000000000dd372 ... D1`, `0000000000013790 ... D2`.)
//
// STRUCT LAYOUT — undetermined from these three methods alone:
//   D2 @0x13790 is a 6-byte trivial-empty dtor (`push rbp ; mov rsp,rbp ; pop rbp ; ret`
//    — raw bytes `55 48 89 e5 5d c3` per `otool -arch x86_64 -x -j`).
//    It touches no fields, so we cannot infer PCICCTransferFunction's field
//    layout from it. The abstract base likely holds ONLY the vptr at +0x00
//    (subclasses like PCICCTransferFunctionGamma add their own fields).
//
//   D0 @0xdd378 and D1 @0xdd372 are BOTH 6-byte abort stubs
//    (`push rbp ; mov rsp,rbp ; ud2` — raw bytes `55 48 89 e5 0f 0b` for each
//    per the same otool dump). The `ud2` instruction ("Undefined Instruction")
//    is x86_64's canonical "trap this if reached — the program is malformed"
//    marker. The compiler emits this pattern for a pure-virtual destructor
//    (or for a destructor that must never be invoked on the base type
//    directly) so that any accidental direct call generates SIGILL and the
//    process traps at that exact address for a debugger.
//
//    In C++ terms, this means:
//      - The abstract base's D0/D1 dtor bodies are never legitimately reached
//        because the ABSTRACT PCICCTransferFunction cannot be instantiated
//        — its subclasses (PCICCTransferFunctionLUT etc.) have their own
//        D0/D1/D2 implementations that override these vtable slots.
//      - The base D2 IS trivially callable, because subclass D0/D1
//        dtors call into it as part of "run base subobject dtor after own
//        cleanup" (Itanium ABI).
//
// UD2 SEMANTICS: In TS we model both D0 and D1 as functions that immediately
// throw. The `ud2` trap raises SIGILL in native code; the closest TS analogue
// is an unconditional Error throw citing the trap address per Rule 3.
//
// UNDECODED CALLEES: NONE at any of the three method bodies. D2 has no calls
// (trivial return); D0/D1 have no calls (immediate ud2 trap).
//
// FRONTIER FAMILY (subclasses whose ports would decode more of this hierarchy;
// each appears in the symbol table with __ZTV<subclass> vtables):
//   PCICCTransferFunctionLUT, PCICCTransferFunctionGamma, PCICCTransferFunctionLinear,
//   PCICCTransferFunctionParametric0..4 — plus the anonymous-namespace
//   PrintVisitor / MakeTagVisitor / DescriptionVisitor that dispatch over them.
//   (See ProCore/ProCore symbol table for the full family listing.)

// ─────────────────────────────────────────────────────────────────────────────
// PCICCTransferFunction — abstract polymorphic base of ICC transfer functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PCICCTransferFunction — abstract base class. Cannot be instantiated directly;
 * only subclasses (PCICCTransferFunctionGamma, ...LUT, ...Linear,
 * ...Parametric0..4) have observable ctors and non-trap D0/D1 dtors.
 *
 * The three destructor entry points at @0x13790 (D2), @0xdd372 (D1), and
 * @0xdd378 (D0) reveal the abstract-base shape:
 *   - D2 is trivially empty (base-subobject dtor called by subclass dtors).
 *   - D0 and D1 are `ud2` traps ("this dtor must never be reached directly").
 *
 * In TS we expose the base class solely as an abstract-brand marker (subclasses
 * mint concrete instances) plus the three faithful method transcriptions.
 */
export abstract class PCICCTransferFunction {
  /** Brand marker so subclass types can be distinguished at the type level.
   *  No runtime storage or observable behaviour — the abstract base has no
   *  fields we can prove from the three destructor bodies alone. */
  readonly __pcICCTransferFunctionBrand: "PCICCTransferFunction" =
    "PCICCTransferFunction";

  /**
   * PCICCTransferFunction::~PCICCTransferFunction()  D2 — @0x0000000000013790
   * [__ZN21PCICCTransferFunctionD2Ev]
   *
   * Raw bytes @0x13790..@0x13795 (per `otool -arch x86_64 -x -j` on
   * ProCore.framework): `55 48 89 e5 5d c3`.
   *
   * Full disassembly:
   *   @0x00013790  55           pushq %rbp
   *   @0x00013791  48 89 e5     movq  %rsp, %rbp
   *   @0x00013794  5d           popq  %rbp
   *   @0x00013795  c3           retq
   *
   * A trivial-empty destructor body: standard prologue + immediate epilogue.
   * The compiler emitted this D2 slot for symmetry/ABI (subclass D0/D1 dtors
   * invoke PCICCTransferFunction::~D2 as their last step to destroy the base
   * subobject). PCICCTransferFunction itself has NO fields whose destruction
   * this body needs to run — otherwise the compiler would have emitted the
   * destruction inline here.
   *
   * TS model: a no-op method. No fields to release; JS GC handles the abstract
   * base's own memory (which is only the brand marker in TS).
   */
  __dtor_D2(): void {
    // @0x00013790..@0x00013795 — trivial-empty dtor. No fields to destroy.
    // (The x86 body is exactly `push rbp ; mov rsp,rbp ; pop rbp ; ret`,
    //  produced by the compiler for an abstract-base dtor with no members.)
  }

  /**
   * PCICCTransferFunction::~PCICCTransferFunction()  D1 — @0x00000000000dd372
   * [__ZN21PCICCTransferFunctionD1Ev]
   *
   * Raw bytes @0xdd372..@0xdd377 (per `otool -arch x86_64 -x -j` on
   * ProCore.framework): `55 48 89 e5 0f 0b`.
   *
   * Full disassembly:
   *   @0x000dd372  55           pushq %rbp
   *   @0x000dd373  48 89 e5     movq  %rsp, %rbp
   *   @0x000dd376  0f 0b        ud2                  ; "Undefined Instruction"
   *                                                    — traps with SIGILL
   *
   * `ud2` is the canonical x86_64 "unreachable" trap. The compiler emits this
   * body for an abstract base class's D1 destructor slot because the D1 slot
   * (non-deleting, complete-object) must never be invoked on the abstract
   * base type directly — subclasses override the vtable slot and their own
   * D1 handles actual field destruction.
   *
   * TS model: throw an Error citing the trap. Any code path that reaches this
   * method has (in the C++ world) hit a SIGILL — the same-severity TS analogue
   * is an unconditional Error throw.
   */
  __dtor_D1(): void {
    // @0x000dd372..@0x000dd377 — abstract-base D1 trap. Never legitimately reached.
    // The `ud2` at @0x000dd376 is a SIGILL trap in native code; in TS we throw.
    throw new Error(
      "PCICCTransferFunction::~PCICCTransferFunction() D1 @0x000dd372 executes `ud2` (SIGILL trap); this abstract-base destructor must never be invoked directly. If reached, a subclass override is missing or vtable dispatch is corrupt.",
    );
  }

  /**
   * PCICCTransferFunction::~PCICCTransferFunction()  D0 — @0x00000000000dd378
   * [__ZN21PCICCTransferFunctionD0Ev]
   *
   * Raw bytes @0xdd378..@0xdd37d (per `otool -arch x86_64 -x -j` on
   * ProCore.framework): `55 48 89 e5 0f 0b`.
   *
   * Full disassembly:
   *   @0x000dd378  55           pushq %rbp
   *   @0x000dd379  48 89 e5     movq  %rsp, %rbp
   *   @0x000dd37c  0f 0b        ud2                  ; "Undefined Instruction"
   *
   * Same pattern as D1: abstract-base deleting-dtor trap. The D0 slot in the
   * vtable is reserved for the "delete this;" dispatch path (Itanium ABI); if
   * a subclass fails to override it, `ud2` catches the misuse.
   *
   * TS model: identical to D1 — throw an Error citing the trap.
   */
  __dtor_D0(): void {
    // @0x000dd378..@0x000dd37d — abstract-base D0 trap. Never legitimately reached.
    throw new Error(
      "PCICCTransferFunction::~PCICCTransferFunction() D0 @0x000dd378 executes `ud2` (SIGILL trap); this abstract-base deleting destructor must never be invoked directly. If reached, a subclass override is missing or vtable dispatch is corrupt.",
    );
  }
}
