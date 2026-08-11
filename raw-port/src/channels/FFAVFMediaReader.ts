// FFAVFMediaReader.ts — raw transcription of Flexo `FFAVFMediaReader`.
//
// Flexo's AVFoundation-backed media reader. This file ports ONE method; each of
// the other 67 symbols on this class is a separate ledger entry and will be
// ADDED to this same file when claimed — never a rewrite.
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file — ONE method:
//   @0xdf61d0  FFAVFMediaReader::copyMediaExtensionInfo() const
//              __ZNK16FFAVFMediaReader22copyMediaExtensionInfoEv
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZNK16FFAVFMediaReader22copyMediaExtensionInfoEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZNK16FFAVFMediaReader22copyMediaExtensionInfoEv.s  (7 lines)
//
// NOT ported here (the sibling copy-accessors, each its own ledger entry):
// copySidecarURL @0xdf61f0, copyRelatedFileURLs @0xdf6210,
// copyMovieLevelMetadataForKey @0xdf95b0, copyFormatDescriptionsForTrackIndex
// @0xdf96f0, copyFormatDescriptionForTrackIndex @0xdf97c0,
// copyFormatDescriptionForTrackID @0xdf9950.
//
// ---------------------------------------------------------------------------
// LAYOUT — the single field this method reads
// ---------------------------------------------------------------------------
// FFAVFMediaReader {
//   ...                              // +0x000..+0x1d7 not touched here
//   id  mediaExtensionInfo;          // +0x1d8 — an ObjC object reference,
//                                    //   loaded @0xdf61d4 by `movq 0x1d8(%rdi),
//                                    //   %rdi` and handed straight to
//                                    //   objc_retain. Nothing decoded here says
//                                    //   which ObjC class it is, so it stays an
//                                    //   opaque reference (Rule 5).
//   ...
// }
//
// ---------------------------------------------------------------------------
// FULL DISASM — copyMediaExtensionInfo @0xdf61d0
// ---------------------------------------------------------------------------
//   0xdf61d0  pushq %rbp                       ; frame prologue
//   0xdf61d1  movq  %rsp, %rbp
//   0xdf61d4  movq  0x1d8(%rdi), %rdi          ; rdi = this->mediaExtensionInfo
//   0xdf61db  popq  %rbp                       ; epilogue BEFORE the jump —
//                                              ;   this is a tail call, so the
//                                              ;   callee's return value IS this
//                                              ;   function's return value.
//   0xdf61dc  jmpq  *0xaf752e(%rip)            ; -> _objc_retain (the ObjC
//                                              ;   runtime's lazy pointer)
//   0xdf61e2  nopw  %cs:(%rax,%rax)            ; padding — not executed
//
// So the whole method is `return objc_retain(this->mediaExtensionInfo);` — the
// classic Core Foundation / ObjC "copy" accessor that hands back a +1 retained
// reference the caller owns. There is no null check because none is needed:
// objc_retain(nil) is defined to return nil, which the oracle below confirms on
// the live binary (300 nil cases).
//
// FRONTIER CALLEES
//   * `_objc_retain` — the ObjC runtime, reached through the lazy pointer at
//     @Flexo 0xaf752e (rip-relative from @0xdf61dc). A TRUE OUT-OF-SCOPE extern
//     and one of the categories DEP_WORKER_BRIEF names explicitly (`_objc_*`).
//     Modelled below as a boundary helper that returns its argument rather than
//     a throw — the same treatment `_strdup` gets in HGRenderJob.ts — because
//     JS object references are garbage-collected: the entire observable effect
//     of a retain (the object stays alive and the SAME pointer comes back) is
//     what a JS reference already guarantees. The reference-count side effect is
//     real on the machine and unobservable in JS; the oracle measures it there
//     instead, so the fact is recorded rather than lost.
//
// ---------------------------------------------------------------------------
// ORACLE — differential against the live Flexo binary: 600 cases, 0 divergences
//   raw-port/re/oracle/FFAVFMediaReader_copyMediaExtensionInfo_oracle.py
// The symbol is LOCAL (`t`), so the harness calls it BY ADDRESS at
// slide+0xdf61d0 under `arch -x86_64 /usr/bin/python3` after preloading Flexo's
// @rpath chain, refusing to run unless the process is x86_64 and the bytes at
// the target are the transcribed prologue (OPS_LOG "wrong architecture").
// The receiver is a 0x400-byte object filled with random poison, with only
// +0x1d8 set. Cases: 300 with a NIL field — every one answered nil, which is
// what makes the missing null check correct; and 300 with REAL ObjC objects
// (`[NSObject new]`) — every one returned the SAME pointer AND bumped
// `retainCount` by exactly 1, with the field itself unchanged (it is a const
// getter). The harness releases each +1 it takes, so the counts stay balanced.
// NEGATIVE CONTROLS (200 cases each): reading the neighbouring slot +0x1d0
// instead of +0x1d8 -> 200/200 wrong; returning nil regardless of the field ->
// 200/200 wrong; reading the field but skipping the retain -> 200/200 wrong
// (the live count moved every time).

/**
 * An opaque ObjC object reference. Nothing decoded in this method names the
 * class of the object at +0x1d8 — it is only loaded and retained — so it is
 * modelled as an opaque reference rather than an invented interface
 * (PORTING_SPEC Rule 5).
 */
export interface ObjCRef {
  readonly __brand: "id";
}

/**
 * `objc_retain(id)` — the ObjC runtime, reached through the lazy pointer at
 * @Flexo 0xaf752e from the tail jump @0xdf61dc.
 *
 * TRUE OUT-OF-SCOPE extern (the ObjC runtime is one of the categories
 * DEP_WORKER_BRIEF lists as legitimately extern). Its contract is "increment
 * the object's retain count and return the SAME pointer; nil in, nil out". In a
 * garbage-collected JS model the caller-visible half of that contract — same
 * identity back, object kept alive — is exactly what returning the reference
 * does, so this is modelled as an identity boundary rather than a throw (the
 * `_strdup` precedent in HGRenderJob.ts). The count itself is not observable
 * here; the oracle measures it on the live binary instead.
 *
 * @param obj the object to retain (%rdi @0xdf61d4), or null for nil.
 * @returns the same reference, +1 retained on the machine.
 */
function objc_retain(obj: ObjCRef | null): ObjCRef | null {
  // @Flexo 0xaf752e (lazy pointer for: _objc_retain) — ObjC runtime extern.
  // nil in, nil out — the reason the caller needs no null check.
  return obj;
}

/**
 * `FFAVFMediaReader` — Flexo's AVFoundation-backed media reader. This file
 * ports `copyMediaExtensionInfo` only; see the file header for the siblings.
 */
export class FFAVFMediaReader {
  /** @Flexo FFAVFMediaReader@0x1d8 — an ObjC object reference loaded @0xdf61d4
   *  and handed to objc_retain. Null models the nil the accessor happily
   *  returns. The writer for this slot is a different (not-yet-ported) method,
   *  and the ctor is a separate ledger entry, so the default is not grounded
   *  beyond "nullable". */
  mediaExtensionInfo_at_0x1d8: ObjCRef | null = null; // @Flexo FFAVFMediaReader@0x1d8

  /**
   * `FFAVFMediaReader::copyMediaExtensionInfo() const` @Flexo 0xdf61d0
   *   (__ZNK16FFAVFMediaReader22copyMediaExtensionInfoEv)
   *
   * Faithful transcription of the 7-line body reproduced in the file header:
   * load the ObjC reference at `this+0x1d8` and TAIL-JUMP to objc_retain, so
   * the retained reference is this function's return value. A `copy`-named
   * accessor, i.e. the caller owns the +1.
   *
   * There is no null check, and none is needed — objc_retain(nil) is nil, which
   * the oracle confirmed on 300 live nil calls.
   *
   * @returns the media-extension-info object, +1 retained (null when the slot
   *          is nil).
   */
  copyMediaExtensionInfo(): ObjCRef | null {
    // ------------------------------------------------------------
    // @0xdf61d0..0xdf61d1 — prologue (no TS-visible effect).
    // @0xdf61d4 — movq 0x1d8(%rdi), %rdi : load the ObjC reference.
    // @0xdf61db — popq %rbp : the frame is torn down BEFORE the jump...
    // @0xdf61dc — jmpq *0xaf752e(%rip) : ...because this is a TAIL CALL to
    //   objc_retain; its return value is returned unchanged to our caller.
    // ------------------------------------------------------------
    return objc_retain(this.mediaExtensionInfo_at_0x1d8);
  }
}
