// ozFootageNodeValidator — Ozone stateless functor exposing one predicate,
// `isValidType(OZSceneNode&)`, which decides whether a given scene-graph
// node is a valid FOOTAGE-selection target.
//
// FRAMEWORK: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone). Analyzed via
// `bash raw-port/tools/disasm.sh ozFootageNodeValidator isValidType Ozone`
// (61 lines in raw-port/re/disasm/ozFootageNodeValidator.isValidType.s).
//
// SYMBOL EXPOSED (nm -a Ozone):
//   __ZN22ozFootageNodeValidator11isValidTypeER11OZSceneNode
//     -> ozFootageNodeValidator::isValidType(OZSceneNode&)   @0x5dcbe0
//
// SEMANTIC (recovered from the 61-line disasm):
//
//   isValidType(node) :=
//     let file = dynamic_cast<OZSceneNodeFile*>(&node);       // @0x5dcbfd
//     if (file == null) return false;                         // @0x5dcc02..0x5dcc05  jz -> return
//
//     // one-shot initialization of the module-static PCString `_searchString`
//     // via the Itanium ABI `___cxa_guard_acquire/release` protocol; the
//     // ctor `PCString::PCString()` runs once on first call (@0x5dcc90) and
//     // is registered for atexit destruction via `___cxa_atexit`  (@0x5dccaa).
//     ensureSearchStringInitialized();                        // @0x5dcc07..0x5dccbb
//
//     if (_searchString.empty()) return true;                 // @0x5dcc19..0x5dcc23
//                                                              // (r14 preset to 1 @0x5dcc1e)
//
//     let nodeNameNS  = file->OZObjectManipulator::getName().ns_str();  // @0x5dcc25..0x5dcc39
//     let searchNS    = _searchString.ns_str();                          // @0x5dcc43
//     let sel_IFSI    = @selector(identifiersForShortIdentifiers:);      // @0x5dcc48
//     let arg_flag    = 1;                                                // @0x5dcc4f  (ecx = 1)
//     let r           = objc_msgSend(nodeNameNS, sel_IFSI, searchNS, arg_flag);  // @0x5dcc5a
//     return (r != 0x7FFFFFFFFFFFFFFF);                                   // @0x5dcc60..0x5dcc6d
//
//   (0x7FFFFFFFFFFFFFFF is `INT64_MAX`, used here as an "identifier not
//   found" sentinel — the NSString category `identifiersForShortIdentifiers:`
//   returns INT64_MAX to mean "no match".)
//
// The `+0x10` offset applied to `&node` at @0x5dcc25 (`addq $0x10, %rbx`)
// before calling `OZObjectManipulator::getName()` proves that the
// OZObjectManipulator sub-object begins at BYTE OFFSET 0x10 inside every
// OZSceneNode / OZSceneNodeFile (i.e. Manipulator is the class's second
// virtual base — sitting just after the primary vtable at +0x00 and the
// secondary vtable at +0x10 for classes with multiple inheritance). This
// layout fact is recorded on OZSceneNodeFile.MANIPULATOR_OFFSET below so
// later ports of OZObjectManipulator can cross-check.
//
// FULL LINE-BY-LINE DECODE of isValidType @0x5dcbe0..0x5dccd7 (branches
// + fallthrough + guard-init helper + exception landing pad):
//
//   prologue (0x5dcbe0..0x5dcbe7):
//     push rbp; mov rsp,rbp; push r14/rbx
//     rbx = rdi (= &node)                                     @0x5dcbe7
//
//   dynamic_cast (0x5dcbea..0x5dcbfd):
//     rsi = &__ZTI11OZSceneNode      (source typeinfo)         @0x5dcbea
//     rdx = &__ZTI15OZSceneNodeFile  (target typeinfo)         @0x5dcbf1
//     r14d = 0                       (default return = false)  @0x5dcbf8
//     ecx  = 0                       (dynamic_cast hint = 0)   @0x5dcbfb
//     rax  = ___dynamic_cast(rdi, rsi, rdx, rcx)               @0x5dcbfd
//
//   test the cast (0x5dcc02..0x5dcc05):
//     if (rax == 0) goto 0x5dcc71  (return r14 = 0 -> false)
//
//   guard-check for _searchString (0x5dcc07..0x5dcc10):
//     al = guard._initialized (the low byte of __cxa_guard variable)
//     if (al == 0) goto 0x5dcc79  (slow-path: acquire+init+release)
//
//   fast-path: string already exists (0x5dcc12..0x5dcc23):
//     rdi = &_searchString                                      @0x5dcc12
//     eax = PCString::empty()                                   @0x5dcc19
//     r14b = 1                    (pre-set return = true)       @0x5dcc1e
//     if (eax != 0) goto 0x5dcc71  (empty string -> return true)@0x5dcc23
//
//   compute nodeName's NSString (0x5dcc25..0x5dcc39):
//     rbx += 0x10                 (point at Manipulator sub-obj)@0x5dcc25
//     rdi = rbx
//     rax = OZObjectManipulator::getName() const               @0x5dcc2c
//                                  (returns const PCString*)
//     rdi = rax                                                 @0x5dcc31
//     rax = PCString::ns_str() const   -> NSString* nodeName    @0x5dcc34
//     rbx = rax                        (spill for objc_msgSend) @0x5dcc39
//
//   compute _searchString's NSString (0x5dcc3c..0x5dcc45):
//     rdi = &_searchString                                      @0x5dcc3c
//     rax = PCString::ns_str() const   -> NSString* searchStr   @0x5dcc43
//
//   Objective-C dispatch (0x5dcc48..0x5dcc5a):
//     rsi = *0x3305a9(%rip)        ; __sel: identifiersForShortIdentifiers:  @0x5dcc48
//     ecx = 1                                                                 @0x5dcc4f
//     rdi = rbx                    ; receiver = nodeName NSString*            @0x5dcc54
//     rdx = rax                    ; arg1 = _searchString NSString*           @0x5dcc57
//     rax = objc_msgSend(rdi, rsi, rdx, rcx)   via *0x2493c8(%rip)             @0x5dcc5a
//         Note: the two-arg selector is 'identifiersForShortIdentifiers:'
//         with an integer flag `1` in ecx (Apple's foundation category
//         returns INT64_MAX to indicate "no match").
//
//   sentinel test (0x5dcc60..0x5dcc6d):
//     rcx  = 0x7FFFFFFFFFFFFFFF                                                @0x5dcc60
//     r14b = (rax != rcx) ? 1 : 0     (setne)                                  @0x5dcc6d
//
//   epilogue (0x5dcc71..0x5dcc78):
//     eax = r14d ; pop rbx/r14/rbp ; ret
//
//   guard slow-path (0x5dcc79..0x5dccbb):
//     rdi = &guard                                              @0x5dcc79
//     eax = ___cxa_guard_acquire(&guard)                        @0x5dcc80
//     if (eax == 0) goto 0x5dcc12   (another thread beat us)    @0x5dcc87
//     rdi = &_searchString                                       @0x5dcc89
//     PCString::PCString()          (default ctor of PCString)   @0x5dcc90
//     ___cxa_atexit(~PCString, &_searchString, dso)              @0x5dccaa
//     ___cxa_guard_release(&guard)                               @0x5dccb6
//     goto 0x5dcc12                 (rejoin fast-path)           @0x5dccbb
//
//   exception unwind landing pad (0x5dccc0..0x5dccd2):
//     rbx = rax           (exception ptr saved)                  @0x5dccc0
//     ___cxa_guard_abort(&guard)                                 @0x5dccca
//     _Unwind_Resume(rbx)                                        @0x5dccd2
//     — runs if PCString::PCString() throws inside the guard
//       critical section; releases the guard in "abort" state so
//       later callers retry the init.
//
// This class is a STATELESS FUNCTOR (no `this` fields; the ctor is not
// even emitted as a symbol in Ozone). The one item of module state it
// touches is the local static `PCString _searchString` — decoded above.
//
// Because every callee (`___dynamic_cast`, `PCString::empty`,
// `OZObjectManipulator::getName`, `PCString::ns_str`, `objc_msgSend`
// through the `identifiersForShortIdentifiers:` selector, `PCString`
// ctor/dtor) is FRONTIER, `isValidType` throws through those stubs.
// Rule 3: loud gap, no plausible-looking silent no-op.

import type { OZSceneNode } from "./OZSceneNode";

// ---------------------------------------------------------------------------
// Frontier stubs — each throws citing the callee's stub address in Ozone.
// ---------------------------------------------------------------------------

/**
 * `__dynamic_cast(void* src, std::type_info const* srcType,
 *                 std::type_info const* dstType, ptrdiff_t hint)`
 * — Itanium C++ ABI dynamic_cast helper (mangled `___dynamic_cast`).
 * Called via @Ozone symbol stub 0x6dfd0e once from isValidType @0x5dcbfd
 * with:
 *   %rdi = &sceneNode
 *   %rsi = &__ZTI11OZSceneNode       (source typeinfo)
 *   %rdx = &__ZTI15OZSceneNodeFile   (target typeinfo)
 *   %rcx = 0                         (hint)
 * Returns a non-null pointer iff `sceneNode` is-a OZSceneNodeFile.
 */
function cxx_dynamic_cast_to_OZSceneNodeFile(_node: OZSceneNode): OZSceneNode | null {
  throw new Error(
    "__dynamic_cast @Ozone stub 0x6dfd0e (___dynamic_cast — libc++abi RTTI helper, " +
    "not yet transcribed) — invoked by ozFootageNodeValidator::isValidType @Ozone 0x5dcbfd " +
    "(-> OZSceneNodeFile)"
  );
}

/**
 * `PCString::PCString()` default ctor — @Ozone stub 0x6df0c0
 * (symbol __ZN8PCStringC1Ev). Called exactly once inside the guarded
 * initialization of `_searchString` @0x5dcc90. Frontier — the PCString
 * class ctor body is un-ported.
 */
function PCString__default_ctor(_dst: unknown): void {
  throw new Error(
    "PCString::PCString() @Ozone stub 0x6df0c0 not yet transcribed " +
    "(called from ozFootageNodeValidator::isValidType @0x5dcc90 during " +
    "one-shot init of ozFootageNodeValidator::getSearchString()::_searchString)"
  );
}

/**
 * `PCString::~PCString()` — @Ozone data pointer `__ZN8PCStringD1Ev`
 * loaded @0x5dcc95 and passed to ___cxa_atexit @0x5dccaa. Frontier.
 * (Not called directly here; only registered for atexit.)
 */
function PCString__dtor_symbol_ref(): unknown {
  throw new Error(
    "PCString::~PCString() @Ozone symbol __ZN8PCStringD1Ev not yet transcribed " +
    "(registered via ___cxa_atexit @0x5dccaa from ozFootageNodeValidator::isValidType)"
  );
}

/**
 * `PCString::empty() const` — @Ozone stub 0x6dfa32 (symbol
 * __ZNK8PCString5emptyEv). Returns true iff the PCString has no chars.
 * Frontier: the PCString layout is not yet decoded.
 */
function PCString__empty(_s: unknown): boolean {
  throw new Error(
    "PCString::empty() const @Ozone stub 0x6dfa32 not yet transcribed " +
    "(called from ozFootageNodeValidator::isValidType @0x5dcc19)"
  );
}

/**
 * `PCString::ns_str() const` — @Ozone stub 0x6dfa44 (symbol
 * __ZNK8PCString6ns_strEv). Returns a bridged NSString* for the PCString.
 * Frontier.
 */
function PCString__ns_str(_s: unknown): unknown {
  throw new Error(
    "PCString::ns_str() const @Ozone stub 0x6dfa44 not yet transcribed " +
    "(called from ozFootageNodeValidator::isValidType @0x5dcc34 and 0x5dcc43)"
  );
}

/**
 * `OZObjectManipulator::getName() const` — @Ozone direct symbol
 * __ZNK19OZObjectManipulator7getNameEv (NOT a stub; the body lives in
 * Ozone but is un-ported). Called at @0x5dcc2c on a pointer that is
 * `&sceneNode + 0x10` — meaning OZObjectManipulator is a sub-object
 * embedded at offset 0x10 inside every OZSceneNodeFile. Returns a
 * `const PCString*` (or `const PCString&`; the return in rax is passed
 * to `PCString::ns_str` next).
 */
function OZObjectManipulator__getName(_manipulator: unknown): unknown {
  throw new Error(
    "OZObjectManipulator::getName() const @Ozone (symbol __ZNK19OZObjectManipulator7getNameEv) " +
    "not yet transcribed (called from ozFootageNodeValidator::isValidType @0x5dcc2c on " +
    "&node+0x10)"
  );
}

/**
 * ObjC dispatch through `-[NSString identifiersForShortIdentifiers:]`
 * (with an integer flag arg = 1). Called @0x5dcc5a via
 * `callq *0x2493c8(%rip)` (indirect through the __objc_msgSend function
 * pointer table); the selector reference itself is loaded @0x5dcc48
 * from RIP-rel 0x3305a9 (a __objc_selrefs cell — the selector's runtime
 * SEL identifier).
 *
 * Returns an int64 that equals `INT64_MAX` (0x7FFFFFFFFFFFFFFF) iff no
 * match was found — otherwise the returned identifier value.
 *
 * Frontier: the ObjC category `identifiersForShortIdentifiers:` is not
 * yet decoded; its body lives in an unrelated framework (likely
 * FCPXML / Foundation category loaded by FCP) and is not in the Ozone
 * disassembly.
 */
function objc_identifiersForShortIdentifiers(
  _receiver_nsstring: unknown,
  _arg_search_nsstring: unknown,
  _int_flag: number,
): bigint {
  throw new Error(
    "-[NSString identifiersForShortIdentifiers:] (ObjC ext) @Ozone objc_msgSend " +
    "table +0x2493c8, selref +0x3305a9 — not yet transcribed " +
    "(called from ozFootageNodeValidator::isValidType @0x5dcc5a)"
  );
}

/**
 * One-shot init of the module-static `_searchString: PCString`.
 * Emulates the ___cxa_guard_acquire / PCString ctor / ___cxa_atexit /
 * ___cxa_guard_release protocol at @0x5dcc79..0x5dccbb. Frontier —
 * throws because PCString itself is un-ported.
 */
function ensureSearchStringInitialized(): void {
  // Faithful shape: read the guard byte, acquire if 0, run PCString ctor,
  // register PCString dtor via ___cxa_atexit, release. All frontier.
  PCString__default_ctor(searchStringSlot);                  // @0x5dcc90
  // ___cxa_atexit(~PCString, &_searchString, dso) — @0x5dccaa (frontier).
  PCString__dtor_symbol_ref();
  // ___cxa_guard_release @0x5dccb6 (frontier).
  throw new Error(
    "___cxa_guard_acquire/release + PCString ctor + ___cxa_atexit " +
    "(one-shot init of ozFootageNodeValidator::getSearchString()::_searchString) " +
    "@Ozone 0x5dcc79..0x5dccbb not yet transcribed"
  );
}

/**
 * The module-static `PCString ozFootageNodeValidator::getSearchString()::_searchString`.
 * In C++ this is a Meyers-singleton style local static inside the class-
 * private accessor `getSearchString()`. Address referenced by RIP-rel
 * @0x5dcc12 / @0x5dcc3c inside isValidType.
 *
 * Held as `unknown` because PCString's layout is un-ported. Any real
 * dereference goes through `PCString__empty` / `PCString__ns_str`, which
 * both throw citing their stubs.
 */
const searchStringSlot: unknown = Object.freeze({
  __opaque: "ozFootageNodeValidator::getSearchString()::_searchString @Ozone (uninitialized)",
});

// ---------------------------------------------------------------------------
// The class itself.
// ---------------------------------------------------------------------------

/**
 * `ozFootageNodeValidator` — stateless functor exposing one predicate,
 * `isValidType`, which decides whether a scene-graph node is a valid
 * FOOTAGE-selection target for FCP's picker.
 *
 * Naming note: this class starts with a lowercase `oz` (as spelled in the
 * FCP binary — see __ZN22ozFootageNodeValidator...). Other validators in
 * the same subsystem (OZExposeDrillingNodeValidator, ...) use the
 * standard "OZ" capitalization. The lowercase is preserved verbatim.
 */
export class ozFootageNodeValidator {
  /**
   * Byte offset of the embedded OZObjectManipulator sub-object inside an
   * OZSceneNodeFile — read directly from `addq $0x10, %rbx` @0x5dcbe0's
   * body @0x5dcc25. Recorded so later ports (OZSceneNode.ts,
   * OZObjectManipulator.ts) can cross-check.
   */
  static readonly OZ_SCENENODEFILE_MANIPULATOR_OFFSET = 0x10;

  /**
   * The "not found" sentinel returned by
   * `-[NSString identifiersForShortIdentifiers:]` — @Ozone 0x5dcc60
   * `movabsq $0x7fffffffffffffff, %rcx`. Equals `INT64_MAX`.
   */
  static readonly NOT_FOUND_SENTINEL = 0x7fffffffffffffffn;

  /**
   * `ozFootageNodeValidator::isValidType(OZSceneNode&)` — @Ozone 0x5dcbe0.
   *
   * Faithful transcription of the disasm in the header. Returns `true`
   * iff `node` IS-A `OZSceneNodeFile` AND (the module-static search
   * string is empty OR its NSString matches the node's name via
   * `-[NSString identifiersForShortIdentifiers:]` returning a value
   * other than INT64_MAX).
   *
   * Because every callee is a frontier stub, this method throws on any
   * real input — the throw always cites @0x5dcbe0 plus the specific stub
   * that couldn't be resolved.
   */
  static isValidType(node: OZSceneNode): boolean {
    // ---- 1) dynamic_cast<OZSceneNodeFile*>(&node)      @0x5dcbfd ----
    let r14 = false; // r14d = 0 preset @0x5dcbf8 (default false)
    const file = cxx_dynamic_cast_to_OZSceneNodeFile(node);
    // ---- 2) if cast failed, return false               @0x5dcc02/0x5dcc05 ----
    if (file === null) {
      return r14; // false
    }
    // ---- 3) ensure _searchString exists                @0x5dcc07..0x5dccbb ----
    //     (guard byte check is elided here; the frontier throws either way)
    ensureSearchStringInitialized();
    // ---- 4) if _searchString.empty(), return true      @0x5dcc19..0x5dcc23 ----
    //     (r14b was preset to 1 before the empty check @0x5dcc1e)
    r14 = true; // pre-set for the "empty -> true" outcome
    if (PCString__empty(searchStringSlot)) {
      return r14; // true
    }
    // ---- 5) getName() on the manipulator sub-object + NSString bridge ----
    //     @0x5dcc25 rbx += 0x10; then getName() @0x5dcc2c; ns_str() @0x5dcc34.
    const manipulator = { __at: "&node + 0x10 (OZObjectManipulator)" };
    const nodeNamePC = OZObjectManipulator__getName(manipulator);
    const nodeNameNS = PCString__ns_str(nodeNamePC);
    // ---- 6) NSString for _searchString                  @0x5dcc43 ----
    const searchNS = PCString__ns_str(searchStringSlot);
    // ---- 7) [nodeNameNS identifiersForShortIdentifiers:searchNS :1]  @0x5dcc5a
    const result = objc_identifiersForShortIdentifiers(nodeNameNS, searchNS, 1);
    // ---- 8) return (result != INT64_MAX)               @0x5dcc6d setne ----
    r14 = result !== ozFootageNodeValidator.NOT_FOUND_SENTINEL;
    return r14;
  }
}
