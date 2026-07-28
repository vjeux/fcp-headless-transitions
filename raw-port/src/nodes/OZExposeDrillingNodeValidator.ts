// OZExposeDrillingNodeValidator — Ozone helper that decides whether a given
// `OZSceneNode` is eligible to be "drilled into" by the Expose parameter
// picker.  Semantically: a node is a valid drilling target IFF it is NOT
// one of six specific concrete scene-node subclasses (media/camera/light
// leaves for which drilling would be meaningless).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (x86_64 fat sub-slice; sub-arch file offset 0x4000).
//
// SYMBOL EXPOSED (nm -a Ozone):
//   __ZN29OZExposeDrillingNodeValidator11isValidTypeER11OZSceneNode
//     -> OZExposeDrillingNodeValidator::isValidType(OZSceneNode&)   @0x3d8870
//
// Source disassembly:
//   raw-port/re/disasm/OZExposeDrillingNodeValidator.isValidType.s
//
// The method is a pure predicate — it does exactly SIX `__dynamic_cast` calls
// (all with `cxx-hint = 0`, i.e. the fully-general Itanium ABI dynamic_cast
// runtime helper — mangled `___dynamic_cast`) against the FCP typeinfo
// records for the excluded scene-node subclasses.  As soon as one cast
// succeeds (returns non-null), the method returns `false` (r14 stays 0).
// If ALL SIX fail, the trailing `sete %r14b` sets r14 to 1 (last-cast
// result was NULL) and the method returns `true`.
//
// Excluded types (in the order the C++ checks them):
//   OZFootageLayer          typeinfo __ZTI14OZFootageLayer
//   OZAudioLayer            typeinfo __ZTI12OZAudioLayer
//   OZAudioTrack            typeinfo __ZTI12OZAudioTrack
//   OZAudioMasterTrack      typeinfo __ZTI18OZAudioMasterTrack
//   OZCamera                typeinfo __ZTI8OZCamera
//   OZLight                 typeinfo __ZTI7OZLight
// (source typeinfo is __ZTI11OZSceneNode for every check — the well-known
// polymorphic base — with `hint = 0` and `dst-void = null` per the calling
// convention.)
//
// STRUCT LAYOUT — none. This method takes no `this`-state; it's effectively
// a static classifier over the argument.  (In C++ the method IS on an
// instance because the class is a stateless functor, but there is no field
// access in isValidType's body.)

// ── Frontier stubs — undecoded external callees ──────────────────────────

/**
 * `__dynamic_cast(void* src, std::type_info const* srcType, std::type_info const* dstType, ptrdiff_t hint)`
 * — the Itanium C++ ABI dynamic_cast runtime helper, mangled
 * `___dynamic_cast`.  Called via @Ozone symbol stub 0x6dfd0e SIX times
 * from `isValidType` @0x3d888d/0x3d88b1/0x3d88d1/0x3d88f1/0x3d8911/0x3d892e.
 *
 * Every call passes:
 *   %rdi = &sceneNode      (the OZSceneNode reference argument, spilled to %rbx)
 *   %rsi = &__ZTI11OZSceneNode      (typeinfo for the polymorphic source base)
 *   %rdx = &__ZTI<TargetSubclass>   (typeinfo for the tested subclass)
 *   %rcx = 0                        (the fully-general "hint" — ptrdiff_t 0
 *                                    means the ABI helper searches from
 *                                    scratch, no compiler shortcut applied)
 *
 * Returns a non-null pointer iff `sceneNode` is-a `<TargetSubclass>`; NULL
 * otherwise.  This runtime helper is provided by libc++abi and is NOT
 * transcribed here — a faithful TS port must delegate to whatever RTTI
 * mechanism the port stands up (typically a class-lineage / instanceof
 * check on the JS side).  Until that lands, this stub throws with the
 * exact call site cited so the frontier gap is visible to `frontier.py`.
 */
function cxx_dynamic_cast_stub(
  _src: OZSceneNode,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): OZSceneNode | null {
  throw new Error(
    "__dynamic_cast @Ozone stub 0x6dfd0e (___dynamic_cast — libc++abi RTTI " +
      "helper, not yet transcribed) — invoked by " +
      "OZExposeDrillingNodeValidator::isValidType @Ozone 0x3d888d " +
      "(-> OZFootageLayer), 0x3d88b1 (-> OZAudioLayer), 0x3d88d1 " +
      "(-> OZAudioTrack), 0x3d88f1 (-> OZAudioMasterTrack), 0x3d8911 " +
      "(-> OZCamera), 0x3d892e (-> OZLight)",
  );
}

// ── Opaque handle for the argument type ──────────────────────────────────

/**
 * Opaque handle for `OZSceneNode` (the polymorphic scene-graph base
 * — Ozone typeinfo `__ZTI11OZSceneNode`).  We only need to be able to
 * pass a reference through to the dynamic_cast helper; no fields are read.
 */
export type OZSceneNode = object;

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZExposeDrillingNodeValidator` — stateless functor exposing one
 * predicate, `isValidType`. Documented per FCP's naming, this classifier
 * gates which scene-graph nodes the Expose parameter picker is allowed to
 * "drill into".  Media/camera/light leaves are excluded; anything else
 * (groups, shape layers, generators, etc.) is drillable.
 */
export class OZExposeDrillingNodeValidator {
  /**
   * `OZExposeDrillingNodeValidator::isValidType(OZSceneNode&)` @Ozone 0x3d8870.
   *
   * DISASM (raw-port/re/disasm/OZExposeDrillingNodeValidator.isValidType.s):
   *
   *   0x3d8870  pushq %rbp
   *   0x3d8871  movq  %rsp, %rbp
   *   0x3d8874  pushq %r14
   *   0x3d8876  pushq %rbx
   *   0x3d8877  movq  %rdi, %rbx                    ; rbx = &sceneNode  (rdi drops when we call helper)
   *
   *   ;; Check #1 — is-a OZFootageLayer?
   *   0x3d887a  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x3d8881  leaq  __ZTI14OZFootageLayer(%rip), %rdx
   *   0x3d8888  xorl  %r14d, %r14d                  ; r14 = 0 (default return)
   *   0x3d888b  xorl  %ecx, %ecx                    ; hint = 0
   *   0x3d888d  callq ___dynamic_cast
   *   0x3d8892  testq %rax, %rax
   *   0x3d8895  jne   0x3d893a                      ; if non-null (is-a) -> return 0
   *
   *   ;; Check #2 — is-a OZAudioLayer?
   *   0x3d889b  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x3d88a2  leaq  __ZTI12OZAudioLayer(%rip), %rdx
   *   0x3d88a9  xorl  %r14d, %r14d
   *   0x3d88ac  movq  %rbx, %rdi                    ; rdi = &sceneNode (restored)
   *   0x3d88af  xorl  %ecx, %ecx
   *   0x3d88b1  callq ___dynamic_cast
   *   0x3d88b6  testq %rax, %rax
   *   0x3d88b9  jne   0x3d893a
   *
   *   ;; Check #3 — is-a OZAudioTrack?
   *   0x3d88bb  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x3d88c2  leaq  __ZTI12OZAudioTrack(%rip), %rdx
   *   0x3d88c9  xorl  %r14d, %r14d
   *   0x3d88cc  movq  %rbx, %rdi
   *   0x3d88cf  xorl  %ecx, %ecx
   *   0x3d88d1  callq ___dynamic_cast
   *   0x3d88d6  testq %rax, %rax
   *   0x3d88d9  jne   0x3d893a
   *
   *   ;; Check #4 — is-a OZAudioMasterTrack?
   *   0x3d88db  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x3d88e2  leaq  __ZTI18OZAudioMasterTrack(%rip), %rdx
   *   0x3d88e9  xorl  %r14d, %r14d
   *   0x3d88ec  movq  %rbx, %rdi
   *   0x3d88ef  xorl  %ecx, %ecx
   *   0x3d88f1  callq ___dynamic_cast
   *   0x3d88f6  testq %rax, %rax
   *   0x3d88f9  jne   0x3d893a
   *
   *   ;; Check #5 — is-a OZCamera?
   *   0x3d88fb  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x3d8902  leaq  __ZTI8OZCamera(%rip), %rdx
   *   0x3d8909  xorl  %r14d, %r14d
   *   0x3d890c  movq  %rbx, %rdi
   *   0x3d890f  xorl  %ecx, %ecx
   *   0x3d8911  callq ___dynamic_cast
   *   0x3d8916  testq %rax, %rax
   *   0x3d8919  jne   0x3d893a
   *
   *   ;; Check #6 — is-a OZLight?  (final; result feeds `sete`)
   *   0x3d891b  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x3d8922  leaq  __ZTI7OZLight(%rip), %rdx
   *   0x3d8929  movq  %rbx, %rdi
   *   0x3d892c  xorl  %ecx, %ecx
   *   0x3d892e  callq ___dynamic_cast
   *   0x3d8933  testq %rax, %rax
   *   0x3d8936  sete  %r14b                          ; r14b = (rax == 0) ? 1 : 0
   *
   *   ;; Return r14 (zero-extended from r14b).
   *   0x3d893a  movl  %r14d, %eax
   *   0x3d893d  popq  %rbx
   *   0x3d893e  popq  %r14
   *   0x3d8940  popq  %rbp
   *   0x3d8941  retq
   *
   * Semantic mirror: returns `true` iff `sceneNode` is NOT one of the six
   * excluded subclasses (i.e., iff EVERY dynamic_cast returned null).
   *
   * The TS transcription mirrors the branch structure exactly — one
   * dynamic_cast per check, early-out on the first success.  Note that the
   * two branches (early-out vs sete) collapse to the same TS observable:
   * "return false immediately on any success, otherwise return true".
   *
   * The dispatch to `__dynamic_cast` is a frontier stub because the FCP
   * RTTI machinery is not yet ported (the base OZSceneNode typeinfo tree
   * itself is undecoded).  The stub throws with the exact call site cited.
   */
  static isValidType(sceneNode: OZSceneNode): boolean {
    // @0x3d888b/@0x3d888d — check #1 — is-a OZFootageLayer?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZFootageLayer") !==
      null
    ) {
      // @0x3d8895 jne -> 0x3d893a returning r14=0.
      return false;
    }
    // @0x3d88af/@0x3d88b1 — check #2 — is-a OZAudioLayer?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioLayer") !== null
    ) {
      // @0x3d88b9 jne -> 0x3d893a returning r14=0.
      return false;
    }
    // @0x3d88cf/@0x3d88d1 — check #3 — is-a OZAudioTrack?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioTrack") !== null
    ) {
      // @0x3d88d9 jne -> 0x3d893a returning r14=0.
      return false;
    }
    // @0x3d88ef/@0x3d88f1 — check #4 — is-a OZAudioMasterTrack?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioMasterTrack") !==
      null
    ) {
      // @0x3d88f9 jne -> 0x3d893a returning r14=0.
      return false;
    }
    // @0x3d890f/@0x3d8911 — check #5 — is-a OZCamera?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZCamera") !== null
    ) {
      // @0x3d8919 jne -> 0x3d893a returning r14=0.
      return false;
    }
    // @0x3d892c/@0x3d892e — check #6 — is-a OZLight?  (sete on this result)
    const isLight =
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZLight") !== null;
    // @0x3d8936 — sete %r14b sets r14 = (dyncast-result == null) ? 1 : 0.
    return !isLight;
  }
}
