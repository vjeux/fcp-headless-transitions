// FFVTDecompressionSession.ts — raw transcription of the Flexo class `FFVTDecompressionSession`.
//
// ONE symbol is transcribed in this file — `getFormatDescriptionDimensions() const`. Every other
// member of the class is a SEPARATE ledger unit and is NOT ported here; each gets ADDED to this
// file when its own unit is claimed (one class = one file; G6 add-only). The siblings, for
// orientation only (`grep 24FFVTDecompressionSession raw-port/army/inventory/Flexo.syms.txt`):
//   0xe36a70  C2  0xe37310  C1   (opaqueCMFormatDescription const*, FFVTComputeResourceRequest, …)
//   0xe36c70  replaceVTDecompressionSession()   0xe37320/0xe374e0/0xe374f0  D2/D1/D0
//   0xe373c0  deleteDecompressionSessionAsynchronously(OpaqueVTDecompressionSession*, …)
//   0xe37510  canAcceptFormatDescription(opaqueCMFormatDescription const*) const
//   0xe37530  copyBlackPixelBuffer(__CVBuffer**)   0xe37700  copyProperty(__CFString const*, void*)
//   0xe37840  usesHardware() const                 0xe37880  isRAWExtension() const
//   0xe378c0  decodeFrame(opaqueCMSampleBuffer*, unsigned, void*, unsigned*)
//   0xe37c70  outputCallback(…)                    0xe38210  waitForAsynchronousFrames()
//   0xe38230  deleteVTDecompressionSession()
//   0xe38290  getFormatDescriptionDimensions() const   <-- ported here
//   0xe382a0  getOutputDimensions() const
//   0xe382e0  createDecompressionSession(…)        0xe399a0  waitForDecompressionSessionsToClose()
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0xe38290  FFVTDecompressionSession::getFormatDescriptionDimensions() const
//                __ZNK24FFVTDecompressionSession30getFormatDescriptionDimensionsEv
//
// Disassembly (regenerate with `bash raw-port/tools/disasm.sh --sym
//   __ZNK24FFVTDecompressionSession30getFormatDescriptionDimensionsEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZNK24FFVTDecompressionSession30getFormatDescriptionDimensionsEv.s
//
// LAYOUT — one field is read by this unit, and its identity is proven by two OTHER functions
// rather than assumed from the name:
//   this+0x08   opaqueCMFormatDescription const*  — the format description the session was built
//               for. The constructor stores its FIRST argument there
//               (`movq %rsi, 0x8(%rdi)` @0xe36a8b, the `opaqueCMFormatDescription const*`
//               parameter) and retains it as a CoreFoundation object
//               (`movq 0x8(%rbx), %rdi ; callq _CFRetain` @0xe36bed..0xe36bf1); and
//               `replaceVTDecompressionSession()` reloads it (`movq 0x8(%r15), %rsi` @0xe36cf0)
//               to pass as the format-description argument of
//               `createDecompressionSession(opaqueCMFormatDescription const*, …)` @0xe36d52.
//               Not to be confused with this+0x58, which `canAcceptFormatDescription()` @0xe37510
//               reads as the live `OpaqueVTDecompressionSession*`.
//
// FRONTIER CALLEE — one, and it is on the THROWING side of the RESOLVED extern-boundary ruling in
// REVIEWER_BRIEF.md:
//   * _CMVideoFormatDescriptionGetDimensions  @Flexo imported stub 0x1495232, TAIL-CALLED
//     @0xe38299 — CoreMedia is not one of the five ported frameworks, and this extern is
//     VALUE-PRODUCING: the `CMVideoDimensions` it returns (packed width/height in %rax) IS this
//     function's return value, and JS cannot fabricate the dimensions CoreMedia parses out of a
//     real format description. So it is a raising boundary stub citing its address, exactly like
//     `VTDecompressionSessionCreate` in src/infra/CoreMediaMovieReader_Query.ts. It is NOT a
//     lifetime/ownership primitive, so the CFRelease-style JS no-op would be wrong here.

/**
 * `CMVideoDimensions` — CoreMedia's `{ int32_t width; int32_t height; }`, 8 bytes, returned whole
 * in `%rax` by the tail call at @0xe38299 and therefore the return value of this function.
 */
export interface CMVideoDimensions {
  /** `int32_t width` — the low 32 bits of the returned `%rax`. */
  width: number;
  /** `int32_t height` — the high 32 bits of the returned `%rax`. */
  height: number;
}

/** `opaqueCMFormatDescription const*` — read from this+0x8 and handed straight to CoreMedia. */
export type CMFormatDescriptionRef = object;

/**
 * `CMVideoFormatDescriptionGetDimensions(CMVideoFormatDescriptionRef)` — imported stub in Flexo
 * @0x1495232, tail-called @0xe38299 (function @0xe38290).
 *
 * CoreMedia is a TRUE out-of-scope extern, and this one is VALUE-PRODUCING: it parses the
 * dimensions out of a real `CMFormatDescription` and returns them, so there is nothing for JS to
 * stand in with. It therefore RAISES, citing the address, rather than inventing a size. (Contrast
 * the lifetime/ownership primitives — `CFRelease` and friends — which the RESOLVED ruling models
 * as no-ops; that rule does not reach this callee, which produces the answer.)
 */
function CMVideoFormatDescriptionGetDimensions_stub(
  _formatDescription: CMFormatDescriptionRef | null,
): CMVideoDimensions {
  throw new Error(
    "CMVideoFormatDescriptionGetDimensions @Flexo imported stub 0x1495232 (tail-called " +
      "@0xe38299) — CoreMedia is a true out-of-scope extern that PRODUCES the dimensions; " +
      "not yet transcribed. @0xe38290",
  );
}

/**
 * `FFVTDecompressionSession` — Flexo's wrapper around a VideoToolbox decompression session.
 *
 * Only the field this unit's disassembly reads is modelled. Everything else about the object
 * belongs to whichever unit first decodes it.
 */
export class FFVTDecompressionSession {
  /**
   * (this+0x08) — the `opaqueCMFormatDescription const*` the session was constructed for; stored
   * by the ctor @0xe36a8b, retained @0xe36bf1, and re-read by `replaceVTDecompressionSession()`
   * @0xe36cf0. This is the only field @0xe38290 touches.
   */
  formatDescriptionAt0x8: CMFormatDescriptionRef | null = null;

  /**
   * `FFVTDecompressionSession::getFormatDescriptionDimensions() const` — @Flexo 0xe38290
   * (`__ZNK24FFVTDecompressionSession30getFormatDescriptionDimensionsEv`).
   *
   * FULL transcription — every instruction, in order:
   *
   *   0xe38290  pushq %rbp                          ; frame
   *   0xe38291  movq  %rsp, %rbp
   *   0xe38294  movq  0x8(%rdi), %rdi               ; arg1 = this+0x8, the format description
   *   0xe38298  popq  %rbp                          ; frame torn down BEFORE the transfer
   *   0xe38299  jmp   _CMVideoFormatDescriptionGetDimensions   ; TAIL CALL (stub @0x1495232)
   *
   * IT IS A TAIL CALL, NOT A CALL — `jmp`, with the frame already popped, so CoreMedia returns
   * DIRECTLY to this function's caller and nothing runs afterwards. Two consequences the port
   * reproduces exactly: the callee's `CMVideoDimensions` IS the return value (no adjustment, no
   * repacking), and there is NO null check — a NULL at +0x8 is passed straight through to
   * CoreMedia, which is the callee's business and not this function's.
   *
   * THE WHOLE BODY IS A FIELD READ AND A FORWARD. There is no arithmetic to get backwards here;
   * the two things that could be wrong are the OFFSET and the CALLEE, so both are grounded in
   * other functions rather than in this one: the ctor stores its format-description argument at
   * +0x8 (@0xe36a8b) and retains it (@0xe36bf1), `replaceVTDecompressionSession()` reloads +0x8
   * as the format-description argument of `createDecompressionSession` (@0xe36cf0 → @0xe36d52),
   * and the stub target is named by the linker annotation on the `jmp` itself.
   *
   * ORACLE — `raw-port/re/oracle/FFVTDecompressionSession_getFormatDescriptionDimensions_oracle.py`
   * under `arch -x86_64 /usr/bin/python3`, calling the LOCAL (`nm` type `t`) symbol at
   * `_dyld_get_image_vmaddr_slide(Flexo) + 0xe38290`. ONE case list drives both sides; each case
   * is a REAL `CMFormatDescription` built by CoreMedia (`CMVideoFormatDescriptionCreate`) and
   * planted at +0x8 of a 0xCD-poisoned receiver:
   *   * MEASURED, live: for every case the live thunk returns exactly the dimensions CoreMedia
   *     reports for that format description (`CMVideoFormatDescriptionGetDimensions` called
   *     directly on the same object) — so the field read at +0x8 and the tail call are both
   *     executed, and the answers track the input rather than being constant;
   *   * FIELD CONTROL: the same arenas are re-read with +0x8 pointing at a DIFFERENT description,
   *     and the answer follows +0x8. A harness whose answer does not move with the field it
   *     claims to read is measuring something else;
   *   * DECLARED NOT COMPARABLE: the TS side cannot be compared value-for-value, because the port
   *     raises at the CoreMedia boundary by policy. What is required of it instead — and checked —
   *     is that it throws citing @0xe38299 rather than inventing dimensions;
   *   * NEGATIVE CONTROL: the live answer for a case is compared against ANOTHER case's expected
   *     dimensions and must disagree, so the comparison is known to be capable of failing.
   *
   * @returns the `CMVideoDimensions` CoreMedia reports for the format description at this+0x8,
   *          returned unchanged from the tail call.
   */
  getFormatDescriptionDimensions(): CMVideoDimensions {
    // @0xe38290..0xe38291  pushq %rbp ; movq %rsp,%rbp
    // @0xe38294  movq 0x8(%rdi), %rdi — the ONLY field this function reads, moved into arg1.
    const formatDescription = this.formatDescriptionAt0x8;
    // @0xe38298  popq %rbp — the frame is gone before the transfer.
    // @0xe38299  jmp _CMVideoFormatDescriptionGetDimensions — a TAIL call: CoreMedia's return
    // value is this function's, with nothing executed after it. CoreMedia is out of scope and
    // value-producing, so the stub raises rather than inventing a size.
    return CMVideoFormatDescriptionGetDimensions_stub(formatDescription);
  }
}
