// FFMXFMediaReader.ts — Flexo `FFMXFMediaReader`, the MXF-container
// implementation of the FFMediaReader interface. This file ports ONE method of
// that class:
//
//   @0xe0b740  FFMXFMediaReader::closedCaptions(CMTimeRange) const
//                __ZNK16FFMXFMediaReader14closedCaptionsE11CMTimeRange
//
// FRAMEWORK: Flexo.framework (Final Cut Pro), x86_64 slice.
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.__ZNK16FFMXFMediaReader14closedCaptionsE11CMTimeRange.s
//            (re-derive with `raw-port/tools/disasm.sh --sym
//             __ZNK16FFMXFMediaReader14closedCaptionsE11CMTimeRange Flexo`)
//
// Every OTHER member of FFMXFMediaReader is a SEPARATE ledger unit and is NOT
// ported here — among them init @0xe09340, decodeSource @0xe098e0, decodeTC
// @0xe09740, initMetadata @0xe0a070, decodeMetadata @0xe0a0b0, trackDuration
// @0xe0af80, hasVideoTrack @0xe0b840, audioTrackID @0xe0b890, copySidecarURL
// @0xe0b8c0, isDirectorFile @0xe0b750, isUpToDate @0xe0a7f0, the cursor
// factories @0xe0a820/@0xe0a880/@0xe0a910/@0xe0a9d0, copyMovieLevelMetadataForKey
// @0xe0abb0, fileSupportsCinematic @0xe0abc0,
// LoadCinematicSessionAttributesIfAvailable @0xe0abd0, the ctors
// @0xe090b0/@0xe09110 and the dtors @0xe09170/@0xe09310/@0xe09320.
//
// ── DISASSEMBLY (verbatim, the WHOLE function) ──────────────────────────────
//   0000000000e0b740  pushq  %rbp                  ; frame setup
//   0000000000e0b741  movq   %rsp, %rbp            ; frame setup
//   0000000000e0b744  xorl   %eax, %eax            ; return value = 0
//   0000000000e0b746  popq   %rbp                  ; frame teardown
//   0000000000e0b747  retq                         ; return
//   0000000000e0b748  nopl   (%rax,%rax)           ; alignment padding, not code
//
// Six instructions, of which exactly one has value semantics: `xorl %eax,%eax`
// @0xe0b744 zeroes the full 64-bit RAX (a 32-bit write clears the upper half),
// i.e. the function returns a NULL pointer. It reads NO field of `this`, reads
// NO byte of its CMTimeRange argument, calls NOTHING, and allocates NOTHING —
// so there is no struct layout to recover and no dependency to import
// (`depgraph.py deps` lists none).
//
// ── WHY "RETURNS NULL" IS THE WHOLE TRUTH, NOT A MISSING PIECE ──────────────
// This is a real, deliberate implementation, not an undecoded gap: the MXF
// reader simply exposes no closed captions. Three independent pieces of
// evidence pin that down.
//
// 1. It is a VIRTUAL OVERRIDE, at vtable slot +0x140. The ObjC entry point
//    `-[FFProviderFig closedCaptionsInRange:]` @0xe14100 leases a reader,
//    copies the 48-byte CMTimeRange argument onto the stack with three 16-byte
//    moves (@0xe14127..@0xe1413c — 48 bytes = two 24-byte CMTimes, which fixes
//    the argument's size and its by-value, memory-class ABI), calls
//    `*0x140(%rcx)` @0xe14143, releases the reader via
//    FFMediaReaderService::releaseMediaReader @0xe1414f, and returns the
//    call's %rax straight out as the ObjC method's object result
//    (@0xe14149/@0xe14154). So the return value IS an object pointer, and
//    returning 0 means "no closed captions" — the same answer the caller
//    synthesizes for "no reader" at @0xe14159 (`xorl %eax,%eax`).
// 2. The SIBLING overrides are byte-identical stubs, so this is the family's
//    normal "unsupported" answer rather than one unfinished class:
//      @0xdfaf30  FFAVFMediaReader::closedCaptions(CMTimeRange) const
//      @0xdfdeb0  FFAVFQTMediaReader::closedCaptions(CMTimeRange) const
//    (@0xdfaf30 disassembles to the identical `pushq/movq/xorl/popq/retq`.)
// 3. Flexo's real caption extraction lives on the ObjC side entirely —
//    `-[FFAsset closedCaptionsInRange:]` @0x3591f0, `-[FFMedia
//    closedCaptionsInRange:]` @0x3ac8d0, `-[FFProvider closedCaptionsInRange:]`
//    @0xf9a420 — none of which is this unit.
//
// A `throw` here would therefore be WRONG: there is nothing deferred. The
// faithful port of `xorl %eax,%eax ; retq` is `return null`.

import type { CMTime } from "../infra/CMTime.js";

/**
 * Opaque handle to CoreMedia's `CMTimeRange` — a 48-byte by-value struct of two
 * 24-byte CMTimes. The size is proven by the caller's argument copy: three
 * 16-byte `movups` (@0xe14127/@0xe1412a/@0xe1412e, stored @0xe14132/@0xe14137/
 * @0xe1413c) move exactly 0x30 bytes from the ObjC frame into the outgoing
 * argument area.
 *
 * `closedCaptions` never reads it — the parameter exists so the signature
 * matches the vtable slot it overrides.
 */
export interface CMTimeRange {
  readonly start: CMTime;
  readonly duration: CMTime;
}

/**
 * The closed-caption collection the virtual returns — an object pointer in
 * %rax. Modelled as an opaque handle because this override never constructs
 * one: it only ever returns the null pointer.
 */
export interface FFClosedCaptionList {
  readonly __brand_FFClosedCaptionList: "FFClosedCaptionList";
}

/**
 * Model of the FFMXFMediaReader instance state THIS method touches.
 *
 * It touches nothing: the body never dereferences `%rdi`. The interface exists
 * so the ported method keeps the C++ signature (a const member function) and
 * so later units of this class have something to extend with the fields their
 * own disassembly proves.
 */
export interface FFMXFMediaReaderState {
  /** No field is read or written by `closedCaptions` (@0xe0b740..@0xe0b747). */
  readonly _noFieldsTouchedByClosedCaptions?: never;
}

/**
 * `FFMXFMediaReader::closedCaptions(CMTimeRange) const` — @Flexo 0xe0b740
 *   __ZNK16FFMXFMediaReader14closedCaptionsE11CMTimeRange
 *
 * Full transcription — every instruction, in order:
 *
 *   0xe0b740  pushq %rbp          ; frame setup (no TS counterpart)
 *   0xe0b741  movq  %rsp,%rbp     ; frame setup (no TS counterpart)
 *   0xe0b744  xorl  %eax,%eax     ; RAX = 0 — the returned pointer is NULL
 *                                 ;   (a 32-bit write zeroes all 64 bits)
 *   0xe0b746  popq  %rbp          ; frame teardown (no TS counterpart)
 *   0xe0b747  retq                ; return
 *   0xe0b748  nopl  (%rax,%rax)   ; alignment padding, not executed
 *
 * Decode notes:
 *   * `%rdi` (this) is never dereferenced and the CMTimeRange argument is never
 *     read — no load or store instruction exists in the body at all.
 *   * there is no `callq`, so no in-scope callee, no extern, no allocation and
 *     no indirect or virtual dispatch to resolve.
 *   * the MXF reader overriding the caption virtual with a constant null is the
 *     implementation, not a gap — see the file header for the three-way
 *     evidence (caller @0xe14143 uses the result as an object pointer; the
 *     FFAVF/FFAVFQT siblings @0xdfaf30/@0xdfdeb0 are identical).
 *
 * @param _self  %rdi — unread.
 * @param _range the by-value CMTimeRange — unread.
 * @returns the pointer in %rax: always `null` (@0xe0b744).
 */
export function FFMXFMediaReader_closedCaptions(
  _self: FFMXFMediaReaderState,
  _range: CMTimeRange,
): FFClosedCaptionList | null {
  // @0xe0b744  xorl %eax,%eax ; @0xe0b747 retq
  return null;
}
