// ozSelectAllValidator — Ozone predicate functor used by
// OZScene::begin_v<OZSceneNode, false, true, ozSelectAllValidator>()
// (@Ozone 0x134817 / 0x13484a) to gate which scene-graph nodes are
// yielded by the "select all" iterator. Semantically: a node is
// SELECTED (isValidType returns true) iff it is NOT one of five specific
// concrete scene-node subclasses — the on-disk scene-file container and
// the four audio/footage leaves. Groups, shape layers, generators, and
// visual media layers pass through as selectable.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
//   Ozone.framework/Versions/A/Ozone  (x86_64 slice).
//
// SYMBOL (nm -a Ozone):
//   __ZN20ozSelectAllValidator11isValidTypeER11OZSceneNode
//     -> ozSelectAllValidator::isValidType(OZSceneNode&)   @0x146590
//
// Source disassembly:
//   raw-port/re/disasm/ozSelectAllValidator.isValidType.s
//
// The method is a stateless predicate — it performs FIVE ___dynamic_cast
// calls (Itanium ABI RTTI helper, hint = 0) against the FCP typeinfo
// records for the excluded scene-node subclasses. As soon as any cast
// returns non-null the method returns false (r14 stays 0). If all five
// return null, the trailing `sete %r14b` on the LAST cast's result sets
// r14 to 1 (the last cast returned NULL) and the method returns true.
//
// Excluded types (in the order the C++ checks them, per disasm):
//   OZSceneNodeFile       typeinfo __ZTI15OZSceneNodeFile   (leaq @0x1465a1)
//   OZFootageLayer        typeinfo __ZTI14OZFootageLayer    (leaq @0x1465be)
//   OZAudioLayer          typeinfo __ZTI12OZAudioLayer      (leaq @0x1465de)
//   OZAudioTrack          typeinfo __ZTI12OZAudioTrack      (leaq @0x1465fe)
//   OZAudioMasterTrack    typeinfo __ZTI18OZAudioMasterTrack (leaq @0x14661e)
// The source typeinfo is __ZTI11OZSceneNode for every check — the
// well-known polymorphic base — with hint = 0 and dst-void = null per
// the Itanium calling convention.
//
// STRUCT LAYOUT — none. This method takes no `this`-state; it is a
// stateless classifier over the argument. (In C++ the class is a
// stateless functor used as the Validator template parameter of
// OZObject::iterator_t; its instances carry no fields relevant to
// isValidType.)

// ── Frontier stub — undecoded external callee ────────────────────────────

/**
 * ___dynamic_cast(void* src, std::type_info const* srcType,
 *                 std::type_info const* dstType, ptrdiff_t hint)
 * — the Itanium C++ ABI dynamic_cast runtime helper. Called via @Ozone
 * symbol stub 0x6dfd0e FIVE times from ozSelectAllValidator::isValidType
 * @0x1465ad / 0x1465cd / 0x1465ed / 0x14660d / 0x14662a.
 *
 * Every call passes:
 *   %rdi = &sceneNode     (the OZSceneNode reference argument,
 *                          spilled to %rbx at 0x146597; restored to
 *                          %rdi at 0x1465c8/0x1465e8/0x146608/0x146625
 *                          before the 2nd..5th calls)
 *   %rsi = &__ZTI11OZSceneNode      (typeinfo for the polymorphic base)
 *   %rdx = &__ZTI<TargetSubclass>   (typeinfo for the tested subclass)
 *   %rcx = 0                        (the fully-general "hint" — ptrdiff_t 0
 *                                    means the ABI helper searches from
 *                                    scratch, no compiler shortcut applied)
 *
 * Returns a non-null pointer iff sceneNode is-a <TargetSubclass>; NULL
 * otherwise. This runtime helper is provided by libc++abi and is NOT
 * transcribed here — a faithful TS port must delegate to whatever RTTI
 * mechanism the port stands up (typically a class-lineage / instanceof
 * check on the JS side). Until that lands, this stub throws with the
 * exact call sites cited so the frontier gap is visible to frontier.py.
 */
function cxx_dynamic_cast_stub(
  _src: OZSceneNode,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): OZSceneNode | null {
  throw new Error(
    "___dynamic_cast @Ozone stub 0x6dfd0e (libc++abi RTTI helper, not " +
      "yet transcribed) — invoked by ozSelectAllValidator::isValidType " +
      "@Ozone 0x1465ad (-> OZSceneNodeFile), 0x1465cd (-> OZFootageLayer), " +
      "0x1465ed (-> OZAudioLayer), 0x14660d (-> OZAudioTrack), 0x14662a " +
      "(-> OZAudioMasterTrack)",
  );
}

// ── Opaque handle for the argument type ──────────────────────────────────

/**
 * Opaque handle for OZSceneNode (the polymorphic scene-graph base —
 * Ozone typeinfo __ZTI11OZSceneNode). We only need to be able to pass a
 * reference through to the dynamic_cast helper; no fields are read here.
 */
export type OZSceneNode = object;

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * ozSelectAllValidator — stateless functor exposing one predicate,
 * isValidType. Used as the Validator template parameter of
 * OZObject::iterator_t<OZSceneNode, false, true, ozSelectAllValidator>
 * (Ozone OZScene::begin_v<...> calls it at each iteration step to decide
 * whether the current node should be yielded). A node is selectable iff
 * it is NOT the scene-file container and NOT one of the four audio /
 * footage leaves.
 */
export class ozSelectAllValidator {
  /**
   * ozSelectAllValidator::isValidType(OZSceneNode&) @Ozone 0x146590.
   *
   * DISASM (raw-port/re/disasm/ozSelectAllValidator.isValidType.s):
   *
   *   0x146590  pushq %rbp
   *   0x146591  movq  %rsp, %rbp
   *   0x146594  pushq %r14
   *   0x146596  pushq %rbx
   *   0x146597  movq  %rdi, %rbx                    ; rbx = &sceneNode
   *
   *   ;; Check #1 — is-a OZSceneNodeFile?
   *   0x14659a  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x1465a1  leaq  __ZTI15OZSceneNodeFile(%rip), %rdx
   *   0x1465a8  xorl  %r14d, %r14d                  ; r14 = 0 (default return)
   *   0x1465ab  xorl  %ecx, %ecx                    ; hint = 0
   *   0x1465ad  callq ___dynamic_cast                ; %rdi still = &sceneNode
   *   0x1465b2  testq %rax, %rax
   *   0x1465b5  jne   0x146636                      ; if non-null (is-a) -> return 0
   *
   *   ;; Check #2 — is-a OZFootageLayer?
   *   0x1465b7  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x1465be  leaq  __ZTI14OZFootageLayer(%rip), %rdx
   *   0x1465c5  xorl  %r14d, %r14d
   *   0x1465c8  movq  %rbx, %rdi                    ; rdi = &sceneNode (restored)
   *   0x1465cb  xorl  %ecx, %ecx
   *   0x1465cd  callq ___dynamic_cast
   *   0x1465d2  testq %rax, %rax
   *   0x1465d5  jne   0x146636
   *
   *   ;; Check #3 — is-a OZAudioLayer?
   *   0x1465d7  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x1465de  leaq  __ZTI12OZAudioLayer(%rip), %rdx
   *   0x1465e5  xorl  %r14d, %r14d
   *   0x1465e8  movq  %rbx, %rdi
   *   0x1465eb  xorl  %ecx, %ecx
   *   0x1465ed  callq ___dynamic_cast
   *   0x1465f2  testq %rax, %rax
   *   0x1465f5  jne   0x146636
   *
   *   ;; Check #4 — is-a OZAudioTrack?
   *   0x1465f7  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x1465fe  leaq  __ZTI12OZAudioTrack(%rip), %rdx
   *   0x146605  xorl  %r14d, %r14d
   *   0x146608  movq  %rbx, %rdi
   *   0x14660b  xorl  %ecx, %ecx
   *   0x14660d  callq ___dynamic_cast
   *   0x146612  testq %rax, %rax
   *   0x146615  jne   0x146636
   *
   *   ;; Check #5 — is-a OZAudioMasterTrack?  (final; result feeds `sete`)
   *   0x146617  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x14661e  leaq  __ZTI18OZAudioMasterTrack(%rip), %rdx
   *   0x146625  movq  %rbx, %rdi                    ; note: NO `xorl %r14d,%r14d` here
   *   0x146628  xorl  %ecx, %ecx
   *   0x14662a  callq ___dynamic_cast
   *   0x14662f  testq %rax, %rax
   *   0x146632  sete  %r14b                          ; r14b = (rax == 0) ? 1 : 0
   *
   *   ;; Return r14 (zero-extended from r14b).
   *   0x146636  movl  %r14d, %eax
   *   0x146639  popq  %rbx
   *   0x14663a  popq  %r14
   *   0x14663c  popq  %rbp
   *   0x14663d  retq
   *
   * Semantic mirror: returns true iff sceneNode is NOT any of the five
   * excluded subclasses (i.e., iff every dynamic_cast returned null).
   *
   * The TS transcription mirrors the branch structure exactly — one
   * dynamic_cast per check, early-out on the first success. The two
   * exit paths (early-out at jne, and sete on the last cast) collapse
   * to the same observable: "return false immediately on any success,
   * otherwise return true".
   *
   * The dispatch to ___dynamic_cast is a frontier stub because the FCP
   * RTTI machinery is not yet ported (the base OZSceneNode typeinfo
   * tree itself is undecoded). The stub throws with the exact call
   * sites cited so frontier.py sees the gap.
   */
  static isValidType(sceneNode: OZSceneNode): boolean {
    // @0x1465ab/@0x1465ad — check #1 — is-a OZSceneNodeFile?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZSceneNodeFile") !==
      null
    ) {
      // @0x1465b5 jne -> 0x146636 returning r14=0.
      return false;
    }
    // @0x1465cb/@0x1465cd — check #2 — is-a OZFootageLayer?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZFootageLayer") !==
      null
    ) {
      // @0x1465d5 jne -> 0x146636 returning r14=0.
      return false;
    }
    // @0x1465eb/@0x1465ed — check #3 — is-a OZAudioLayer?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioLayer") !== null
    ) {
      // @0x1465f5 jne -> 0x146636 returning r14=0.
      return false;
    }
    // @0x14660b/@0x14660d — check #4 — is-a OZAudioTrack?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioTrack") !== null
    ) {
      // @0x146615 jne -> 0x146636 returning r14=0.
      return false;
    }
    // @0x146628/@0x14662a — check #5 — is-a OZAudioMasterTrack?  (sete on this result)
    const isAudioMasterTrack =
      cxx_dynamic_cast_stub(
        sceneNode,
        "OZSceneNode",
        "OZAudioMasterTrack",
      ) !== null;
    // @0x146632 — sete %r14b sets r14 = (dyncast-result == null) ? 1 : 0.
    return !isAudioMasterTrack;
  }
}
