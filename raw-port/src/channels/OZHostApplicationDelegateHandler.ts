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

  /**
   * `OZHostApplicationDelegateHandler::wantsToAssertThatLoadedSceneHasAnimateFlagDisabled() const`
   *   — @Ozone 0x5d3f80
   *   — `__ZNK32OZHostApplicationDelegateHandler50wantsToAssertThatLoadedSceneHasAnimateFlagDisabledEv`
   *
   * The first of this class's `wantsTo*` host-policy queries to be transcribed. Every one of them
   * has the same shape: ask the host application's delegate whether it implements the matching
   * selector, and if it does, forward the question to it; if it does not, the answer is NO.
   *
   * FULL transcription — every instruction, in order (22 lines, 0x37 bytes):
   *
   *   0x5d3f80  55                    pushq %rbp                 ; frame (no TS counterpart)
   *   0x5d3f81  48 89 e5              movq  %rsp, %rbp
   *   0x5d3f84  41 56                 pushq %r14                 ; callee-saved (no TS counterpart)
   *   0x5d3f86  53                    pushq %rbx
   *   0x5d3f87  48 8b 1f              movq  (%rdi), %rbx         ; rbx = this->payload (+0x00),
   *                                                              ;   the host delegate `id`
   *   0x5d3f8a  4c 8b 35 17 27 34 00  movq  0x342717(%rip), %r14 ; 0x5d3f91 + 0x342717 = 0x9166a8,
   *                                                              ;   an __objc_selrefs slot; the
   *                                                              ;   SEL it holds resolves to
   *                                                              ;   "wantsToAssertThatLoadedScene
   *                                                              ;    HasAnimateFlagDisabled"
   *   0x5d3f91  48 89 df              movq  %rbx, %rdi           ; arg1 = delegate
   *   0x5d3f94  4c 89 f6              movq  %r14, %rsi           ; arg2 = SEL
   *   0x5d3f97  e8 8a c0 10 00        callq 0x6e0026             ; 0x5d3f9c + 0x10c08a — the
   *                                                              ;   symbol stub for
   *                                                              ;   _objc_opt_respondsToSelector
   *   0x5d3f9c  84 c0                 testb %al, %al             ; BOOL result
   *   0x5d3f9e  74 10                 je    0x5d3fb0             ;   NO -> the zero tail
   *   0x5d3fa0  48 89 df              movq  %rbx, %rdi           ; arg1 = delegate (again)
   *   0x5d3fa3  4c 89 f6              movq  %r14, %rsi           ; arg2 = the same SEL
   *   0x5d3fa6  5b / 41 5e / 5d       epilogue BEFORE the jump
   *   0x5d3faa  ff 25 78 20 25 00     jmpq  *0x252078(%rip)      ; 0x5d3fb0 + 0x252078 = 0x826028,
   *                                                              ;   the GOT slot holding
   *                                                              ;   _objc_msgSend — a TAIL CALL,
   *                                                              ;   so the delegate's answer IS
   *                                                              ;   this function's return value
   *   0x5d3fb0  31 c0                 xorl  %eax, %eax           ; the "delegate does not
   *   0x5d3fb2  5b / 41 5e / 5d       epilogue                   ;   implement it" answer: false
   *   0x5d3fb6  c3                    retq
   *
   * TWO THINGS HERE WERE MEASURED RATHER THAN READ, because otool's comment column is wrong about
   * one of them (see the probe):
   *
   *   1. The selector at `__objc_selrefs` 0x9166a8 is `wantsToAssertThatLoadedSceneHasAnimate
   *      FlagDisabled` — resolved live with `sel_getName`, not inferred from the method's name.
   *   2. The indirect jump target at 0x826028 is `_objc_msgSend`. otool renders this line as
   *      `## Objc message: -[%rdi identifiersForShortIdentifiers:]`, which names a DIFFERENT
   *      selector entirely; the GOT slot was compared for POINTER IDENTITY against
   *      `dlsym("objc_msgSend")` in the live process instead, and they are the same address.
   *
   * FRONTIER CALLEES: both are TRUE out-of-scope ObjC-runtime externs, each cited at its address —
   * `_objc_opt_respondsToSelector` (stub 0x6e0026, called @0x5d3f97) and `_objc_msgSend` (GOT
   * 0x826028, tail-jumped @0x5d3faa). There is no in-scope callee, no virtual dispatch through this
   * class's own vtable, and nothing else to decode.
   *
   * THE NIL PATH IS NOT A BOUNDARY — IT IS THE MEASURED ANSWER. When `this->payload` is nil, the
   * ObjC runtime's `objc_opt_respondsToSelector(nil, sel)` returns NO without dispatching anything,
   * so `je 0x5d3fb0` is taken and the function returns false. That is transcribable without an ObjC
   * runtime, and the port returns false there rather than raising — verified by calling the real
   * function with a nil payload (see below). Only the non-nil path needs a live delegate, and only
   * that path raises.
   *
   * MEASURED AGAINST THE LIVE BINARY
   * (raw-port/re/oracle/OZHostApplicationDelegateHandler_wantsToAssert_probe.py, under
   * `arch -x86_64 /usr/bin/python3`, Ozone loaded through the recursive @rpath preload). The symbol
   * is exported (`T`), and the probe additionally calls it by address after an opcode self-check:
   *   - the 0x37 mapped bytes are the ones transcribed above
   *   - `sel_getName(*(0x9166a8))` == "wantsToAssertThatLoadedSceneHasAnimateFlagDisabled"
   *   - `*(0x826028)` == `dlsym(objc_msgSend)`, pointer-identical
   *   - a `this` whose +0x00 is nil returns **0**, over a 0xCD-poisoned arena that is unchanged
   *     afterwards, and `objc_opt_respondsToSelector(nil, sel)` independently returns NO
   *   - CONTROL: a `this` whose +0x00 is a REAL ObjC object that does NOT implement the selector
   *     (an `NSObject` instance) also returns 0 — so the false answer is not an artefact of nil,
   *     and the respondsToSelector guard is doing the work the port says it does
   * 11/11 PASS at Ozone slide 0x124856000 (44 images preloaded, 0 failed).
   *
   * WHERE THIS PORT IS DELIBERATELY LESS COMPLETE THAN THE BINARY, stated because the control
   * above makes it visible: for a NON-NIL delegate that does not implement the selector, the
   * binary answers false, and this port RAISES. It raises because without an ObjC runtime it
   * cannot tell that case from a delegate that does implement it — `payload` here is an opaque
   * `unknown`, and there is no `respondsToSelector` to ask. Answering either way would be
   * inventing the delegate's class. The raise names the gap; the nil case, which needs no runtime
   * to decide, is transcribed.
   *
   * Source disassembly (Ozone .s files carry no framework prefix, by disasm.sh's own convention):
   *   raw-port/re/disasm/__ZNK32OZHostApplicationDelegateHandler50wantsToAssertThatLoadedSceneHasAnimateFlagDisabledEv.s
   *   (24 lines: the label, the 22 instruction lines above and the trailing `nopw` pad)
   */
  wantsToAssertThatLoadedSceneHasAnimateFlagDisabled(
    this: OZHostApplicationDelegateHandler,
  ): boolean {
    // @0x5d3f87 — movq (%rdi),%rbx: the delegate stored at +0x00 by the C1 ctor @0x5d3a54.
    const delegate = this.payload;
    // @0x5d3f8a/@0x5d3f97 — load the SEL from __objc_selrefs 0x9166a8 and ask the runtime.
    // @0x5d3f9e/@0x5d3fb0 — je -> xorl %eax,%eax: a delegate that does not implement it answers no.
    if (!objc_opt_respondsToSelector(delegate, SEL_wantsToAssertThatLoadedSceneHasAnimateFlagDisabled)) {
      return false;
    }
    // @0x5d3faa — jmpq *_objc_msgSend: a TAIL CALL, so the delegate's BOOL is returned as-is.
    return objc_msgSend_BOOL(delegate, SEL_wantsToAssertThatLoadedSceneHasAnimateFlagDisabled);
  }

  /**
   * `OZHostApplicationDelegateHandler::wantsToCacheTopLevelGroupRender() const`
   * — @Ozone 0x5d3f40
   * — `__ZNK32OZHostApplicationDelegateHandler31wantsToCacheTopLevelGroupRenderEv`
   *
   *   0x5d3f40  pushq %rbp
   *   0x5d3f41  movq  %rsp, %rbp
   *   0x5d3f44  pushq %r14
   *   0x5d3f46  pushq %rbx
   *   0x5d3f47  movq  (%rdi), %rbx        ; delegate = this->payload (+0x00)
   *   0x5d3f4a  movq  0x34274f(%rip),%r14 ; SEL slot @Ozone 0x9166a0
   *   0x5d3f51  movq  %rbx, %rdi
   *   0x5d3f54  movq  %r14, %rsi
   *   0x5d3f57  callq 0x6e0026            ; _objc_opt_respondsToSelector
   *   0x5d3f5c  testb %al, %al
   *   0x5d3f5e  je    0x5d3f70            ; unsupported selector -> false
   *   0x5d3f60  movq  %rbx, %rdi
   *   0x5d3f63  movq  %r14, %rsi
   *   0x5d3f66  popq  %rbx
   *   0x5d3f67  popq  %r14
   *   0x5d3f69  popq  %rbp
   *   0x5d3f6a  jmpq  *0x2520b8(%rip)     ; GOT @Ozone 0x826028 -> _objc_msgSend
   *   0x5d3f70  xorl  %eax, %eax
   *   0x5d3f72  popq  %rbx
   *   0x5d3f73  popq  %r14
   *   0x5d3f75  popq  %rbp
   *   0x5d3f76  retq
   *
   * The selector slot was resolved in the live x86_64 image with `sel_getName` as
   * `wantsToCacheTopLevelGroupRender`; the indirect jump target was verified by pointer identity
   * with `objc_msgSend`. The same live probe verified that nil and a real NSObject lacking the
   * selector both return false without modifying the receiver arena.
   */
  wantsToCacheTopLevelGroupRender(
    this: OZHostApplicationDelegateHandler,
  ): boolean {
    // @0x5d3f47 — movq (%rdi),%rbx: load the delegate from this+0x00.
    const delegate = this.payload;
    // @0x5d3f4a/@0x5d3f57 — load the selector and ask whether the delegate implements it.
    // @0x5d3f5e/@0x5d3f70 — the unsupported-selector path returns zero.
    if (!objc_opt_respondsToSelector(delegate, SEL_wantsToCacheTopLevelGroupRender)) {
      return false;
    }
    // @0x5d3f6a — tail-call _objc_msgSend and return the delegate's BOOL answer.
    return objc_msgSend_BOOL(delegate, SEL_wantsToCacheTopLevelGroupRender);
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════
// ADDITIVE EXTENSION — the ObjC boundary used by the accessor above (a LATER ledger unit than the
// ctor; nothing above the accessor was changed). These two helpers are deliberately NOT exported:
// they are not FCP functions, they are the named boundary this file's transcription stops at, and
// exporting them would put a raising stub in front of G5's reach fuzz for no gain.
// ═════════════════════════════════════════════════════════════════════════════════════════════

/**
 * The selector held in `__objc_selrefs` @Ozone 0x9166a8 — the slot loaded by
 * `movq 0x342717(%rip), %r14` @0x5d3f8a (0x5d3f91 + 0x342717).
 *
 * Resolved from the LIVE image with `sel_getName`, not assumed from the C++ method's name:
 * `b'wantsToAssertThatLoadedSceneHasAnimateFlagDisabled'`. (They coincide here. They need not: the
 * same function's `jmpq` line is annotated by otool with an unrelated selector, which is exactly
 * why this one was measured.)
 */
const SEL_wantsToAssertThatLoadedSceneHasAnimateFlagDisabled =
  "wantsToAssertThatLoadedSceneHasAnimateFlagDisabled";

/**
 * The selector held in `__objc_selrefs` @Ozone 0x9166a0 — loaded by
 * `movq 0x34274f(%rip), %r14` @0x5d3f4a (0x5d3f51 + 0x34274f).
 * Resolved from the live x86_64 image with `sel_getName`.
 */
const SEL_wantsToCacheTopLevelGroupRender = "wantsToCacheTopLevelGroupRender";

/**
 * `_objc_opt_respondsToSelector(id, SEL)` — the ObjC runtime, reached through Ozone symbol stub
 * 0x6e0026, called @0x5d3f97. A TRUE out-of-scope extern.
 *
 * The nil case is not a gap and is not modelled by guesswork: messaging nil is defined to answer
 * NO, and this was confirmed in the live process both directly
 * (`objc_opt_respondsToSelector(nil, sel)` -> False) and through the FCP function itself (a `this`
 * with a nil payload returns 0). A non-nil delegate requires the real runtime and a real host
 * application object, neither of which exists in this port, so that path raises citing the
 * address it is deferring.
 */
function objc_opt_respondsToSelector(obj: unknown, sel: string): boolean {
  // @0x5d3f97 — the nil answer, measured, not assumed.
  if (obj === null || obj === undefined) {
    return false;
  }
  throw new Error(
    "_objc_opt_respondsToSelector(delegate, " + sel + ") @Ozone 0x5d3f97 (stub 0x6e0026) " +
      "requires the live ObjC runtime and a real host-application delegate — a TRUE out-of-scope " +
      "extern for this port, same boundary policy as the other ObjC/Metal/CoreFoundation externs. " +
      "The nil delegate case IS transcribed above and returns false. @0x5d3f80",
  );
}

/**
 * `_objc_msgSend(id, SEL) -> BOOL` — the ObjC runtime, reached through the GOT slot @Ozone
 * 0x826028, TAIL-jumped @0x5d3faa (0x5d3fb0 + 0x252078). A TRUE out-of-scope extern.
 *
 * Only reachable when the delegate answered YES to `respondsToSelector`, i.e. only with a real
 * host delegate in the process. The slot's contents were confirmed to be `_objc_msgSend` by
 * pointer identity against `dlsym` in the live image, because otool's comment column names a
 * different selector on this line.
 */
function objc_msgSend_BOOL(_obj: unknown, sel: string): boolean {
  throw new Error(
    "_objc_msgSend(delegate, " + sel + ") @Ozone 0x5d3faa (GOT 0x826028, verified pointer-identical " +
      "to dlsym objc_msgSend) requires the live ObjC runtime and a host-application delegate that " +
      "implements the selector — a TRUE out-of-scope extern. Reached only when " +
      "_objc_opt_respondsToSelector @0x5d3f97 answered YES. @0x5d3f80",
  );
}
