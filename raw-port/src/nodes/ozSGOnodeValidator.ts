// ozSGOnodeValidator — Ozone helper that decides whether a given
// `OZSceneNode` is a valid "scene-graph object" for whatever downstream
// iteration site consumes this predicate (referenced by
// `OZScene::begin_v<OZElement, false, true, ozSGOnodeValidator>()` @Ozone
// 0x2d04a0 and by `OZObject::iterator_t<OZElement,false,true,ozSGOnodeValidator>`
// symbols at @Ozone 0x03c470 (dtor) / 0x085490 (increment)).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (x86_64 fat sub-slice).
//
// SYMBOL EXPOSED (nm -a Ozone):
//   __ZN18ozSGOnodeValidator11isValidTypeER11OZSceneNode
//     -> ozSGOnodeValidator::isValidType(OZSceneNode&)   @0x2d0ad0
//
// Source disassembly:
//   raw-port/re/disasm/ozSGOnodeValidator.isValidType.s
//
// The method is a pure predicate — it does exactly FIVE `__dynamic_cast`
// calls (all with `cxx-hint = 0`, i.e. the fully-general Itanium ABI
// dynamic_cast runtime helper — mangled `___dynamic_cast`) against the FCP
// typeinfo records for the excluded scene-node subclasses.  As soon as one
// cast succeeds (returns non-null), the method returns `false` (r14 stays
// 0). If ALL FIVE fail, the trailing `sete %r14b` sets r14 to 1 (last-cast
// result was NULL) and the method returns `true`.
//
// Excluded types (in the order the C++ checks them):
//   OZFootageLayer          typeinfo __ZTI14OZFootageLayer     @0x2d0ae1
//   OZAudioLayer            typeinfo __ZTI12OZAudioLayer       @0x2d0afe
//   OZAudioTrack            typeinfo __ZTI12OZAudioTrack       @0x2d0b1e
//   OZGroup                 typeinfo __ZTI7OZGroup             @0x2d0b3e
//   OZAudioMasterTrack      typeinfo __ZTI18OZAudioMasterTrack @0x2d0b5e
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
 * `___dynamic_cast`.  Called via @Ozone symbol stub 0x6dfd0e FIVE times
 * from `isValidType` @0x2d0aed / 0x2d0b0d / 0x2d0b2d / 0x2d0b4d / 0x2d0b6a.
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
      "ozSGOnodeValidator::isValidType @Ozone 0x2d0aed " +
      "(-> OZFootageLayer), 0x2d0b0d (-> OZAudioLayer), 0x2d0b2d " +
      "(-> OZAudioTrack), 0x2d0b4d (-> OZGroup), 0x2d0b6a " +
      "(-> OZAudioMasterTrack)",
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
 * `ozSGOnodeValidator` — stateless functor exposing one predicate,
 * `isValidType`. Used as a template parameter to
 * `OZScene::begin_v<OZElement, false, true, ozSGOnodeValidator>()` @Ozone
 * 0x2d04a0 and `OZObject::iterator_t<OZElement, false, true,
 * ozSGOnodeValidator>::increment()` @Ozone 0x085490 to filter scene-graph
 * iteration to only "SGO" (scene-graph object) nodes — i.e., nodes that
 * are NOT footage/audio-layers/audio-tracks/groups/audio-master-tracks.
 */
export class ozSGOnodeValidator {
  /**
   * `ozSGOnodeValidator::isValidType(OZSceneNode&)` @Ozone 0x2d0ad0.
   *
   * DISASM (raw-port/re/disasm/ozSGOnodeValidator.isValidType.s):
   *
   *   0x2d0ad0  pushq %rbp
   *   0x2d0ad1  movq  %rsp, %rbp
   *   0x2d0ad4  pushq %r14
   *   0x2d0ad6  pushq %rbx
   *   0x2d0ad7  movq  %rdi, %rbx                    ; rbx = &sceneNode
   *
   *   ;; Check #1 — is-a OZFootageLayer?
   *   0x2d0ada  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x2d0ae1  leaq  __ZTI14OZFootageLayer(%rip), %rdx
   *   0x2d0ae8  xorl  %r14d, %r14d                  ; r14 = 0 (default return)
   *   0x2d0aeb  xorl  %ecx, %ecx                    ; hint = 0
   *   0x2d0aed  callq ___dynamic_cast
   *   0x2d0af2  testq %rax, %rax
   *   0x2d0af5  jne   0x2d0b76                      ; if non-null (is-a) -> return 0
   *
   *   ;; Check #2 — is-a OZAudioLayer?
   *   0x2d0af7  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x2d0afe  leaq  __ZTI12OZAudioLayer(%rip), %rdx
   *   0x2d0b05  xorl  %r14d, %r14d
   *   0x2d0b08  movq  %rbx, %rdi                    ; rdi = &sceneNode (restored)
   *   0x2d0b0b  xorl  %ecx, %ecx
   *   0x2d0b0d  callq ___dynamic_cast
   *   0x2d0b12  testq %rax, %rax
   *   0x2d0b15  jne   0x2d0b76
   *
   *   ;; Check #3 — is-a OZAudioTrack?
   *   0x2d0b17  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x2d0b1e  leaq  __ZTI12OZAudioTrack(%rip), %rdx
   *   0x2d0b25  xorl  %r14d, %r14d
   *   0x2d0b28  movq  %rbx, %rdi
   *   0x2d0b2b  xorl  %ecx, %ecx
   *   0x2d0b2d  callq ___dynamic_cast
   *   0x2d0b32  testq %rax, %rax
   *   0x2d0b35  jne   0x2d0b76
   *
   *   ;; Check #4 — is-a OZGroup?
   *   0x2d0b37  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x2d0b3e  leaq  __ZTI7OZGroup(%rip), %rdx
   *   0x2d0b45  xorl  %r14d, %r14d
   *   0x2d0b48  movq  %rbx, %rdi
   *   0x2d0b4b  xorl  %ecx, %ecx
   *   0x2d0b4d  callq ___dynamic_cast
   *   0x2d0b52  testq %rax, %rax
   *   0x2d0b55  jne   0x2d0b76
   *
   *   ;; Check #5 — is-a OZAudioMasterTrack?  (final; result feeds `sete`)
   *   0x2d0b57  leaq  __ZTI11OZSceneNode(%rip), %rsi
   *   0x2d0b5e  leaq  __ZTI18OZAudioMasterTrack(%rip), %rdx
   *   0x2d0b65  movq  %rbx, %rdi
   *   0x2d0b68  xorl  %ecx, %ecx
   *   0x2d0b6a  callq ___dynamic_cast
   *   0x2d0b6f  testq %rax, %rax
   *   0x2d0b72  sete  %r14b                          ; r14b = (rax == 0) ? 1 : 0
   *
   *   ;; Return r14 (zero-extended from r14b).
   *   0x2d0b76  movl  %r14d, %eax
   *   0x2d0b79  popq  %rbx
   *   0x2d0b7a  popq  %r14
   *   0x2d0b7c  popq  %rbp
   *   0x2d0b7d  retq
   *
   * Semantic mirror: returns `true` iff `sceneNode` is NOT one of the five
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
    // @0x2d0aeb/@0x2d0aed — check #1 — is-a OZFootageLayer?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZFootageLayer") !==
      null
    ) {
      // @0x2d0af5 jne -> 0x2d0b76 returning r14=0.
      return false;
    }
    // @0x2d0b0b/@0x2d0b0d — check #2 — is-a OZAudioLayer?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioLayer") !== null
    ) {
      // @0x2d0b15 jne -> 0x2d0b76 returning r14=0.
      return false;
    }
    // @0x2d0b2b/@0x2d0b2d — check #3 — is-a OZAudioTrack?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioTrack") !== null
    ) {
      // @0x2d0b35 jne -> 0x2d0b76 returning r14=0.
      return false;
    }
    // @0x2d0b4b/@0x2d0b4d — check #4 — is-a OZGroup?
    if (
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZGroup") !== null
    ) {
      // @0x2d0b55 jne -> 0x2d0b76 returning r14=0.
      return false;
    }
    // @0x2d0b68/@0x2d0b6a — check #5 — is-a OZAudioMasterTrack?  (sete on this result)
    const isMasterTrack =
      cxx_dynamic_cast_stub(sceneNode, "OZSceneNode", "OZAudioMasterTrack") !==
      null;
    // @0x2d0b72 — sete %r14b sets r14 = (dyncast-result == null) ? 1 : 0.
    return !isMasterTrack;
  }
}
