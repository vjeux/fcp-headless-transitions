// OZFootageLayer.ts — Ozone's `OZFootageLayer`.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone   (x86_64 thin slice; VA == file offset).
//
// This file ports ONLY the method listed below. Every other OZFootageLayer method is its own
// ledger entry and is ADDED to this file when claimed — never a rewrite or a drop of a landed
// sibling.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED HERE
// -----------------------------------------------------------------------------
//   * OZFootageLayer::getDescendantAtIndex(unsigned int)   @Ozone 0x150bb0
//       __ZN14OZFootageLayer20getDescendantAtIndexEj   (exported `T`)
//
// re/disasm: raw-port/re/disasm/__ZN14OZFootageLayer20getDescendantAtIndexEj.s   (56 lines)
// Differential: raw-port/re/oracle/OZFootageLayer_getDescendantAtIndex_probe.py
//               raw-port/re/oracle/OZFootageLayer_getDescendantAtIndex_driver.mts
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (only what THIS method dereferences — Rule 5)
// -----------------------------------------------------------------------------
// OZFootageLayer {
//   ...                            // +0x000..+0x437 not decoded by this unit
//   +0x438  link  descendants;     // the EMBEDDED sentinel node of an intrusive doubly-linked
//                                  //   list. Its ADDRESS is the list's end marker: the walk stops
//                                  //   when the cursor equals `this+0x438`
//                                  //   (`addq $0x438,%r14` @0x150bc8, `cmpq %r14,%r13` @0x150bcf
//                                  //    and @0x150c16).
//   +0x440  ptr   descendants.link;// the sentinel's +0x08 link word — where the walk STARTS
//                                  //   (`movq 0x440(%rdi),%r13` @0x150bc1). The body follows the
//                                  //   SAME +0x08 word on every node (@0x150c12), so the two are
//                                  //   one field of one node type, read at +0x08 of the sentinel
//                                  //   and of each element.
//   ...
// }
//
// list node (the elements the walk visits) {
//   +0x00  ...                     // not read by this method
//   +0x08  ptr  link;              // the link the walk follows      (movq 0x8(%r13),%r13 @0x150c12)
//   +0x10  ptr  payload;           // an `OZSceneNode*`, or null     (movq 0x10(%r13),%rdi @0x150bf0,
//                                  //                                 movq 0x10(%r13),%rcx @0x150c27)
// }
//
// -----------------------------------------------------------------------------
// WHAT THE METHOD DOES (transcribed, then MEASURED — see "evidence" below)
// -----------------------------------------------------------------------------
// Walk the descendant list, counting the payloads that are `OZSceneNodeFile`s, and return the
// element the walk is standing on when the count reaches `index`. Two details are worth stating
// because a paraphrase gets them wrong:
//
//   * `index == 0` (and the empty list) SKIP THE LOOP ENTIRELY (`testl %esi,%esi` / `sete %dl` /
//     `orb %cl,%dl` / `jne 0x150c23` @0x150bd8..0x150bdf). So index 0 returns the FIRST element's
//     payload with no `dynamic_cast` performed at all — the type filter does not apply to it.
//   * the element returned for `index == N > 0` is the one AFTER the N-th matching payload: the
//     count is incremented, the cursor is advanced, and only THEN is `count == index` tested
//     (@0x150c0f, @0x150c12, @0x150c1e). The returned element's own payload is never classified.
//
// If the walk reaches the sentinel first, the answer is null (`testb %al,%al` @0x150c23 with
// `al` = "the cursor is not the sentinel", recomputed at @0x150c16).
//
// THE RETURN VALUE IS A BASE-SUBOBJECT POINTER, not the node: `leaq 0x10(%rcx),%rax` @0x150c2b
// with the null-preserving `cmoveq %rcx,%rax` @0x150c32 — the Itanium upcast idiom. The base that
// lives at +0x10 of an `OZSceneNode` is `OZObjectManipulator`, CONFIRMED against the live RTTI
// rather than assumed: `__ZTI11OZSceneNode` is a `__vmi_class_type_info` whose base table reads
//     base 0: offset 0x00  OZFactoryBase
//     base 1: offset 0x10  OZObjectManipulator      <- the +0x10 this method returns
//     base 2: offset 0x28  PCSerializer
// (read out of the loaded image by the probe, section B). TypeScript has neither multiple
// inheritance nor pointer arithmetic, so the port returns the owning node together with the byte
// adjustment the machine applied, following the modelling precedent in `OZImageNode.ts` (the
// `getObjectManipulator` @0xbfc80 family, whose header records the same MI-adjust problem).
//
// -----------------------------------------------------------------------------
// EVIDENCE — the live binary, not reading alone
// -----------------------------------------------------------------------------
// `OZFootageLayer_getDescendantAtIndex_probe.py` loads Ozone outside the app bundle (recursive
// @rpath preload; 44 images, 0 failed), asserts the 14 prologue bytes at the dlsym'd address
// against the ones transcribed here, and calls the REAL function over a fabricated arena — the
// method dereferences nothing but the list nodes and the payload's vptr, so an arena is a complete
// environment for it. Payloads carry a fake vtable holding a REAL typeinfo pointer, which makes
// `___dynamic_cast` run its real algorithm over the real RTTI graph and answer honestly for both
// `OZSceneNode` (cast fails, not counted) and `OZSceneNodeFile` (cast succeeds, counted).
// 12 cases, 14 checks, all PASS; the poisoned arena is byte-identical after every call, which is
// how the "performs no stores" claim above is established rather than asserted.
// The driver replays the SAME 12 cases through the TypeScript below and the probe compares the two
// answer-for-answer, so this is a TS-vs-binary differential and not a Python restatement of the
// port agreeing with itself.

import type { OZSceneNode } from "./OZSceneNode.js";

/**
 * The payload word at list-node +0x10: an `OZSceneNode*`, plus the one fact about it that this
 * method asks the C++ runtime for and TypeScript cannot derive.
 *
 * `isOZSceneNodeFile` is the answer of
 * `___dynamic_cast(payload, &__ZTI11OZSceneNode, &__ZTI15OZSceneNodeFile, 0)` @0x150c05 (Ozone
 * stub 0x6dfd0e) — "is the most-derived object an OZSceneNodeFile?". `OZGroup::isAtRootLevel`
 * @0xf17d0 models the same helper as `parent instanceof OZGroup`; that is not available here
 * because `OZSceneNodeFile` has no class in this port yet (nodes/OZSceneNodeFile.ts models it as a
 * field interface — only `setIsFileMissing` @0x3b2180 has landed). Carrying the runtime answer on
 * the payload keeps the counting loop — which is the whole of this method, and whose behaviour is
 * measured by the probe — expressed rather than deferred. When OZSceneNodeFile lands as a class
 * this field collapses to `payload instanceof OZSceneNodeFile`.
 */
export interface OZFootageLayerDescendantPayload {
  /** the `OZSceneNode*` itself (%rdi @0x150bf0, %rcx @0x150c27) */
  readonly node: OZSceneNode;
  /** the `___dynamic_cast` @0x150c05 answer: non-null iff the payload is-an OZSceneNodeFile */
  readonly isOZSceneNodeFile: boolean;
}

/**
 * A node of the intrusive doubly-linked descendant list. Only the two words this method reads are
 * modelled: the link at +0x08 and the payload at +0x10. The list's END is the layer's embedded
 * sentinel node at +0x438, compared BY ADDRESS (`cmpq %r14,%r13`), which the port expresses as
 * object identity against `OZFootageLayer.descendants_at_0x438`.
 */
export interface OZFootageLayerDescendantLink {
  /** +0x08 — the link the walk follows (`movq 0x8(%r13),%r13` @0x150c12; the start is the
   *  sentinel's own +0x08 word, read as `movq 0x440(%rdi),%r13` @0x150bc1). */
  link_at_0x08: OZFootageLayerDescendantLink;
  /** +0x10 — the `OZSceneNode*` payload, or null. Never read on the sentinel. */
  payload_at_0x10: OZFootageLayerDescendantPayload | null;
}

/**
 * What the method returns: the `OZObjectManipulator` base subobject of the payload
 * (`payload + 0x10` @0x150c2b, RTTI-confirmed — see the file header), null-preserving
 * (`cmoveq` @0x150c32). Modelled as the owning node plus the adjustment, because TypeScript has
 * no pointer arithmetic; the byte offset is kept in the value so a caller that needs the real
 * pointer has it, and so the adjustment cannot be silently dropped by a later edit.
 */
export interface OZObjectManipulatorSubobject {
  /** the `OZSceneNode` the pointer was derived from (%rcx @0x150c27) */
  readonly owner: OZSceneNode;
  /** the byte adjustment the machine applies (`leaq 0x10(%rcx),%rax` @0x150c2b) */
  readonly byteOffset: number;
}

export class OZFootageLayer {
  /**
   * @Ozone +0x438 — the embedded sentinel of the intrusive descendant list. Its ADDRESS is the
   * list terminator (@0x150bc8) and its +0x08 word is where the walk starts (@0x150bc1). A list
   * with no elements is the sentinel linked to itself, which is what
   * `descendants_at_0x438.link_at_0x08 === descendants_at_0x438` expresses.
   */
  descendants_at_0x438: OZFootageLayerDescendantLink;

  constructor() {
    // An empty list: the sentinel's +0x08 link points at the sentinel itself, so the very first
    // comparison @0x150bcf reports "cursor === sentinel" and every index answers null.
    const sentinel = { payload_at_0x10: null } as unknown as OZFootageLayerDescendantLink;
    sentinel.link_at_0x08 = sentinel;
    this.descendants_at_0x438 = sentinel;
  }

  /**
   * `OZFootageLayer::getDescendantAtIndex(unsigned int)` — @Ozone 0x150bb0
   *   (`__ZN14OZFootageLayer20getDescendantAtIndexEj`)
   *
   * ABI: %rdi = this, %esi = index (unsigned int, 32-bit). Returns %rax = an
   * `OZObjectManipulator*` (the payload's +0x10 base subobject) or null.
   *
   * FULL transcription of the 47-instruction body:
   *
   *   0x150bb0  55 / 48 89 e5 / 41 57 / 41 56 / 41 55 / 41 54 / 53 / 50   prologue
   *   0x150bbe  movq  %rdi, %r14
   *   0x150bc1  movq  0x440(%rdi), %r13     ; cursor = the sentinel's +0x08 link word
   *   0x150bc8  addq  $0x438, %r14          ; r14 = &this->descendants (the list terminator)
   *   0x150bcf  cmpq  %r14, %r13            ; flags on cursor - sentinel
   *   0x150bd2  setne %al                   ; al = (cursor != sentinel)   <- survives to 0x150c23
   *   0x150bd5  sete  %cl                   ; cl = (cursor == sentinel)   (the list is empty)
   *   0x150bd8  testl %esi, %esi
   *   0x150bda  sete  %dl                   ; dl = (index == 0)
   *   0x150bdd  orb   %cl, %dl
   *   0x150bdf  jne   0x150c23              ; empty list OR index 0 -> skip the walk entirely
   *   0x150be1  movl  %esi, %ebx            ; ebx = index
   *   0x150be3  xorl  %r15d, %r15d          ; count = 0
   *   0x150be6  leaq  __ZTI15OZSceneNodeFile(%rip), %r12   ; the dynamic_cast DESTINATION type
   *   0x150bf0  movq  0x10(%r13), %rdi      ; payload = cursor->payload (+0x10)
   *   0x150bf4  testq %rdi, %rdi
   *   0x150bf7  je    0x150c12              ; a null payload is skipped, uncounted
   *   0x150bf9  leaq  __ZTI11OZSceneNode(%rip), %rsi       ; the SOURCE type
   *   0x150c00  movq  %r12, %rdx
   *   0x150c03  xorl  %ecx, %ecx            ; hint = 0 (the fully general ABI search)
   *   0x150c05  callq 0x6dfd0e              ; ## symbol stub for: ___dynamic_cast
   *   0x150c0a  testq %rax, %rax
   *   0x150c0d  je    0x150c12              ; not an OZSceneNodeFile -> not counted
   *   0x150c0f  incl  %r15d                 ; count++ (32-bit)
   *   0x150c12  movq  0x8(%r13), %r13       ; cursor = cursor->link (+0x08)
   *   0x150c16  cmpq  %r14, %r13
   *   0x150c19  setne %al                   ; al = (cursor != sentinel)
   *   0x150c1c  je    0x150c23              ; wrapped to the sentinel -> stop, al = 0
   *   0x150c1e  cmpl  %ebx, %r15d           ; flags on count - index
   *   0x150c21  jne   0x150bf0              ; keep walking while count != index
   *   0x150c23  testb %al, %al
   *   0x150c25  je    0x150c38              ; stopped ON the sentinel -> null
   *   0x150c27  movq  0x10(%r13), %rcx      ; payload of the element we stopped on
   *   0x150c2b  leaq  0x10(%rcx), %rax      ; the +0x10 base subobject (OZObjectManipulator)
   *   0x150c2f  testq %rcx, %rcx
   *   0x150c32  cmoveq %rcx, %rax           ; a null payload stays null (no 0x10 on null)
   *   0x150c36  jmp   0x150c3a
   *   0x150c38  xorl  %eax, %eax            ; null
   *   0x150c3a  addq $0x8,%rsp / popq %rbx,%r12,%r13,%r14,%r15,%rbp / retq
   *
   * FRONTIER CALLEE
   *   * `___dynamic_cast` @Ozone symbol stub 0x6dfd0e (@0x150c05) — the libc++abi RTTI helper, a
   *     TRUE out-of-scope extern. Modelled by the payload's own `isOZSceneNodeFile` answer (see
   *     `OZFootageLayerDescendantPayload`), the same policy as `OZGroup::isAtRootLevel` @0xf17d0
   *     spelled for a target type that has no class here yet.
   *
   * MEASURED AGAINST THE LIVE BINARY (probe: 12 cases, 14 checks, 0 failed; the same 12 cases
   * replayed through THIS code by the driver and compared answer-for-answer):
   *   empty list, index 0 / index 3                                 -> null
   *   index 0, one null payload                                     -> null
   *   index 0, one payload                                          -> payload[0] + 0x10
   *   index 0, payload that is NOT an OZSceneNodeFile               -> payload[0] + 0x10
   *   index 1, two null payloads                                    -> null
   *   index 1, two payloads whose casts both fail                   -> null
   *   index 1, [file, file]                                         -> payload[1] + 0x10
   *   index 2, [file, file, file]                                   -> payload[2] + 0x10
   *   index 1, [non-file, file, file]                               -> payload[2] + 0x10
   *   index 1, [null, file, file]                                   -> payload[2] + 0x10
   *   index 2, [file, file] (the count never reaches 2)             -> null
   * and the poisoned arena is byte-identical after every call: the accessor performs no stores.
   */
  getDescendantAtIndex(index: number): OZObjectManipulatorSubobject | null {
    // @0x150bbe / @0x150bc8 — r14 = this + 0x438, the list's end marker.
    const sentinel = this.descendants_at_0x438;
    // @0x150bc1 movq 0x440(%rdi),%r13 — the cursor starts at the sentinel's +0x08 link.
    let cursor: OZFootageLayerDescendantLink = sentinel.link_at_0x08;
    // @0x150bcf..0x150bd5 cmpq %r14,%r13 / setne %al / sete %cl.
    let cursorIsNotSentinel = cursor !== sentinel;
    // @0x150bd8..0x150bda testl %esi,%esi / sete %dl — the index is an unsigned 32-bit compare.
    const wantedIndex = index >>> 0;
    // @0x150bdd..0x150bdf orb %cl,%dl / jne 0x150c23 — an empty list or index 0 skips the walk.
    if (cursorIsNotSentinel && wantedIndex !== 0) {
      // @0x150be3 xorl %r15d,%r15d — the count of payloads that ARE OZSceneNodeFiles.
      let count = 0;
      for (;;) {
        // @0x150bf0 movq 0x10(%r13),%rdi — the cursor's payload.
        const payload = cursor.payload_at_0x10;
        // @0x150bf4..0x150bf7 testq %rdi,%rdi / je 0x150c12 — a null payload is skipped.
        if (payload !== null) {
          // @0x150bf9..0x150c0d ___dynamic_cast(payload, OZSceneNode, OZSceneNodeFile, 0) through
          // stub 0x6dfd0e, then testq %rax,%rax / je 0x150c12.
          if (payload.isOZSceneNodeFile) {
            // @0x150c0f incl %r15d — a 32-bit increment.
            count = (count + 1) >>> 0;
          }
        }
        // @0x150c12 movq 0x8(%r13),%r13 — advance along the +0x08 link.
        cursor = cursor.link_at_0x08;
        // @0x150c16..0x150c19 cmpq %r14,%r13 / setne %al.
        cursorIsNotSentinel = cursor !== sentinel;
        // @0x150c1c je 0x150c23 — the walk wrapped; leave with al = 0.
        if (!cursorIsNotSentinel) break;
        // @0x150c1e..0x150c21 cmpl %ebx,%r15d / jne 0x150bf0 — keep walking while count != index.
        if (count === wantedIndex) break;
      }
    }
    // @0x150c23..0x150c25 testb %al,%al / je 0x150c38 — stopped on the sentinel -> null.
    if (!cursorIsNotSentinel) {
      // @0x150c38 xorl %eax,%eax.
      return null;
    }
    // @0x150c27 movq 0x10(%r13),%rcx — the payload of the element we stopped on.
    const payload = cursor.payload_at_0x10;
    // @0x150c2f..0x150c32 testq %rcx,%rcx / cmoveq %rcx,%rax — null in, null out.
    if (payload === null) {
      return null;
    }
    // @0x150c2b leaq 0x10(%rcx),%rax — the OZObjectManipulator base subobject of the payload.
    return { owner: payload.node, byteOffset: 0x10 };
  }
}
