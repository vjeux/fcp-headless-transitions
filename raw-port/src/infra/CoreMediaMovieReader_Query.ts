// CoreMediaMovieReader_Query.ts — raw transcription of the Flexo class
// `CoreMediaMovieReader_Query`.
//
// ONE symbol is transcribed in this file —
// `newMutableDecompressionSessionForCapabilityTesting() const`. Every other member of the class is
// a SEPARATE ledger unit and is NOT ported here; each gets ADDED to this file when its own unit is
// claimed (one class = one file; G6 add-only). The siblings, for orientation only
// (`grep 26CoreMediaMovieReader_Query raw-port/army/inventory/Flexo.syms.txt`, 18 entries):
//   0xdec7a0  create(CMFormatDescription const*, int, CFDictionary const*)
//   0xdec850  C1     0xdec860  C2   (CMFormatDescription const*, CFDictionary const*, int)
//   0xdecb70  isRAWExtension() const            0xdecb90  hasValidDecompressionSession() const
//   0xdecba0  decoderIsAvailable() const        0xdecbe0  decoderIsMissingDueToRosetta() const
//   0xdecc20  decoderIsDisabledExtension() const 0xdecc60 decoderIsConflictingExtension() const
//   0xdecca0  copySupportedPixelFormatsOrderedByQuality()
//   0xded950  copyPixelFormatsWithReducedResolutionSupport()
//   0xdedfb0  getPixelBufferFormat(CMVideoDimensions*) const
//   0xdedfe0  getFormatMustBeIFrameOnly() const
//   0xdee040  newMutableDecompressionSessionForCapabilityTesting() const   <-- ported here
//   0xdee0b0  queryReducedResolutionDimensionsForRAWDecoder(...)
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0xdee040  CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting() const
//                __ZNK26CoreMediaMovieReader_Query50newMutableDecompressionSessionForCapabilityTestingEv
//
// Disassembly (regenerate with `bash raw-port/tools/disasm.sh --sym
//   __ZNK26CoreMediaMovieReader_Query50newMutableDecompressionSessionForCapabilityTestingEv Flexo`):
//   raw-port/re/disasm/
//     Flexo.__ZNK26CoreMediaMovieReader_Query50newMutableDecompressionSessionForCapabilityTestingEv.s
//
// LAYOUT recovered from THIS function (plus one sibling used as a control, below):
//   this+0x08   CMFormatDescription const*  — passed to VTDecompressionSessionCreate @0xdee061
//   this+0x58   the existing decompression session pointer — tested for null @0xdee040, and
//               NOTHING else about it is read here. `hasValidDecompressionSession()` @0xdecb90 is
//               `cmpq $0x0, 0x58(%rdi) ; setne %al` — an independent function reading the SAME
//               offset, which is what the oracle below uses to confirm the offset rather than
//               asserting it.
//
// FRONTIER CALLEES — all three are out-of-scope externs (VideoToolbox and CoreFoundation are not
// among the five ported frameworks), and the RESOLVED extern-boundary ruling in REVIEWER_BRIEF.md
// puts the two CALLS on opposite sides of its line:
//   * _VTDecompressionSessionCreate   @Flexo stub 0x1495c76, called @0xdee073 — VALUE-PRODUCING (it
//     writes the session through %r9), so a raising boundary stub citing its address, exactly as
//     the pthread callees are in src/infra/PCConditionVariable.ts.
//   * _CFRelease                      @Flexo stub 0x149484e, called @0xdee091 — a LIFETIME/
//     OWNERSHIP primitive, so a documented JS NO-OP, matching OZChannelBase.ts, OZChannelInfo.ts,
//     FFMediaReaderService.ts and the PCCFRef_CF* family on main. The machine releases and returns
//     NULL on that path; a throw would raise where the binary returns. (This was a THROW in the
//     first revision of this PR and reviewer 5 rejected it — see the stub's own doc block.)
//   * _kCFAllocatorDefault            CoreFoundation global, loaded @0xdee057 via the literal pool
//     (`movq 0xb015aa(%rip), %rax ; movq (%rax), %rax`). Its VALUE is never inspected by this
//     function — it is loaded and handed straight to VTDecompressionSessionCreate — so it is
//     represented below by an opaque marker rather than invented, and the marker is only ever
//     passed to the raising stub.

/** `OpaqueVTDecompressionSession*` — the VideoToolbox session handle. Opaque: this function only
 *  ever null-tests it and passes it to CFRelease. */
export type VTDecompressionSessionRef = object;
/** `opaqueCMFormatDescription const*` — read from this+0x8 and passed through untouched. */
export type CMFormatDescriptionRef = object;

/**
 * `kCFAllocatorDefault` — the CoreFoundation global loaded at @0xdee057 and dereferenced at
 * @0xdee05e. CoreFoundation is a TRUE out-of-scope extern, and this function never inspects the
 * allocator: it loads it and passes it as argument 1. Modelled as an opaque marker so the
 * argument list of the (raising) stub below is faithful in shape without inventing a value.
 */
const kCFAllocatorDefault_at_0xdee057: unique symbol = Symbol("kCFAllocatorDefault @Flexo 0xdee057");

/**
 * `VTDecompressionSessionCreate(CFAllocatorRef, CMVideoFormatDescriptionRef,
 * CFDictionaryRef videoDecoderSpecification, CFDictionaryRef destinationImageBufferAttributes,
 * const VTDecompressionOutputCallbackRecord*, VTDecompressionSessionRef* out)` — imported stub in
 * Flexo @0x1495c76, called @0xdee073. VideoToolbox: a TRUE out-of-scope extern (not one of the
 * five FCP frameworks we port), so this raises rather than papering over the boundary.
 */
function VTDecompressionSessionCreate_stub(
  _allocator: typeof kCFAllocatorDefault_at_0xdee057,
  _formatDescription: CMFormatDescriptionRef | null,
  _videoDecoderSpecification: null,
  _destinationImageBufferAttributes: null,
  _outputCallback: null,
  _out: { session: VTDecompressionSessionRef | null },
): number {
  throw new Error(
    "VTDecompressionSessionCreate @Flexo imported stub 0x1495c76 (called @0xdee073) — " +
      "VideoToolbox is a true out-of-scope extern; not yet transcribed. " +
      "@0xdee040",
  );
}

/**
 * `CFRelease(CFTypeRef)` — imported stub in Flexo @0x149484e, called @0xdee091.
 *
 * A CoreFoundation LIFETIME/OWNERSHIP primitive, so it is a JS **NO-OP**, not a throw. That is the
 * RESOLVED extern-boundary ruling in `REVIEWER_BRIEF.md` ("LIFETIME / OWNERSHIP primitives → JS
 * NO-OP … VALUE-PRODUCING externs → THROW with @0xADDR"), and it is what every landed instance
 * does: `raw-port/src/channels/OZChannelBase.ts`, `OZChannelInfo.ts`, `FFMediaReaderService.ts` and
 * the `PCCFRef_CFArray/CFData/CFDictionary.ts` family all model `_CFRelease` as a documented
 * no-op. All the call decrements is a retain count this port does not maintain — the JS garbage
 * collector owns the `VTDecompressionSessionRef` surrogate — so "do nothing" is the faithful model
 * of the boundary.
 *
 * The sibling `VTDecompressionSessionCreate_stub` above stays a THROW, and the two are not
 * inconsistent: that one is VALUE-PRODUCING (it writes a session through `%r9`) and JS cannot
 * fabricate what it would return. The ruling splits on exactly that line.
 *
 * NOT COSMETIC, even though nothing reaches this today. The transcription of
 * @0xdee08e..@0xdee096 is "release the leaked session, then return NULL"; with a no-op this port
 * does that, and with a throw it raises where the machine returns NULL. The statement is dead only
 * because the create-stub above throws first and dominates every path to it — so the divergence
 * would appear the moment VideoToolbox is modelled or a test injects a status, which is precisely
 * the latent-wrong-answer-behind-a-green-gate shape. Caught in review by reviewer 5 on #741.
 */
function CFRelease_stub(_cf: VTDecompressionSessionRef): void {
  // NO-OP. @Flexo imported stub 0x149484e, called @0xdee091 (function @0xdee040) — a refcount
  // decrement with no JS-visible effect.
}

/**
 * `CoreMediaMovieReader_Query` — Flexo's decoder-capability query object.
 *
 * Only the two offsets this unit's disassembly proves are modelled. Everything else about the
 * object belongs to whichever unit first decodes it.
 */
export class CoreMediaMovieReader_Query {
  /** (this+0x08) — the format description, read @0xdee061 and passed straight to VideoToolbox. */
  formatDescriptionAt0x8: CMFormatDescriptionRef | null = null;

  /**
   * (this+0x58) — the existing decompression session. Null-tested @0xdee040, and confirmed to be
   * the same field the sibling `hasValidDecompressionSession()` @0xdecb90 tests.
   */
  sessionAt0x58: VTDecompressionSessionRef | null = null;

  /**
   * `CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting() const`
   * — @Flexo 0xdee040
   * (`__ZNK26CoreMediaMovieReader_Query50newMutableDecompressionSessionForCapabilityTestingEv`).
   *
   * FULL transcription — every instruction, in order:
   *
   *   0xdee040  cmpq  $0x0, 0x58(%rdi)   ; is there already a session?
   *   0xdee045  je    0xdee09e           ; NO -> the tail at the bottom: xorl %eax,%eax ; retq
   *   0xdee047  pushq %rbp               ; frame setup (only on the create path)
   *   0xdee048  movq  %rsp, %rbp
   *   0xdee04b  subq  $0x10, %rsp
   *   0xdee04f  movq  $0x0, -0x8(%rbp)   ; the out-parameter is zeroed before the call
   *   0xdee057  movq  0xb015aa(%rip), %rax  ; &kCFAllocatorDefault (literal pool)
   *   0xdee05e  movq  (%rax), %rax          ; the allocator itself
   *   0xdee061  movq  0x8(%rdi), %rsi    ; arg2 = this+0x8, the format description
   *   0xdee065  leaq  -0x8(%rbp), %r9    ; arg6 = &out
   *   0xdee069  movq  %rax, %rdi         ; arg1 = the allocator
   *   0xdee06c  xorl  %edx, %edx         ; arg3 = NULL (decoder specification)
   *   0xdee06e  xorl  %ecx, %ecx         ; arg4 = NULL (destination buffer attributes)
   *   0xdee070  xorl  %r8d, %r8d         ; arg5 = NULL (output callback record)
   *   0xdee073  callq _VTDecompressionSessionCreate   ; OSStatus -> %eax
   *   0xdee078  testl %eax, %eax
   *   0xdee07a  setne %cl                ; cl = (status != 0)
   *   0xdee07d  movq  -0x8(%rbp), %rax   ; rax = the session the call wrote out — AND the return
   *   0xdee081  testq %rax, %rax
   *   0xdee084  setne %dl                ; dl = (session != NULL)
   *   0xdee087  andb  %cl, %dl           ; both: it failed AND it still produced a session
   *   0xdee089  cmpb  $0x1, %dl
   *   0xdee08c  jne   0xdee098           ; not both -> return %rax unchanged (the session, or NULL)
   *   0xdee08e  movq  %rax, %rdi
   *   0xdee091  callq _CFRelease         ; release the session the failed call leaked
   *   0xdee096  xorl  %eax, %eax         ; ...and return NULL
   *   0xdee098  addq  $0x10, %rsp
   *   0xdee09c  popq  %rbp
   *   0xdee09d  retq
   *   0xdee09e  xorl  %eax, %eax         ; the early exit: no frame was ever built
   *   0xdee09f  retq
   *
   * THE RETURN REGISTER IS THE OUT-PARAMETER. `%eax` holds the OSStatus only between @0xdee073 and
   * @0xdee07d; the `movq -0x8(%rbp), %rax` overwrites it with the session pointer, which is what
   * the two `retq`s at @0xdee09d actually return. So the status is consumed entirely by the
   * `setne %cl` and never reaches the caller — the caller learns of a failure as a NULL.
   *
   * THE EARLY EXIT BELONGS TO THE OBJECT WITH **NO** SESSION — the reverse of what the name
   * suggests, and the one thing in this function that is easy to get backwards from the prose.
   * `je` is taken when the compared value IS ZERO, so `cmpq $0x0, 0x58(%rdi) ; je 0xdee09e` sends
   * an object whose +0x58 is NULL straight to `xorl %eax,%eax ; retq`, and lets an object that
   * ALREADY HOLDS a session build the frame and ask VideoToolbox for another one:
   *
   *   +0x58 NULL      -> returns NULL immediately, frameless, nothing written
   *   +0x58 non-NULL  -> VTDecompressionSessionCreate(kCFAllocatorDefault, this+0x8, …)
   *
   * The sibling `hasValidDecompressionSession()` @0xdecb90 is the same test read the same way
   * (`cmpq $0x0, 0x58(%rdi) ; setne %al` — non-NULL means a session is present), which is what
   * makes the sense of this branch checkable against a second function instead of an intuition.
   * Revisions 1 and 2 of this port had the predicate the other way round (`!== null`), which is
   * wrong on both of the only two inputs that exist; reviewers 3 and 4 caught it on #741 by
   * re-deriving the branch, and the oracle below is now shaped so that it fails on it too.
   *
   * THE RELEASE IS CONDITIONAL ON BOTH FACTS, which is the one place a paraphrase would drift:
   * `andb %cl, %dl` releases only when the call FAILED *and* still handed back a non-NULL session.
   * A successful call's session is returned to the caller un-released, and a failed call that left
   * the out-parameter NULL falls through to `retq` with %rax already NULL — no release, no crash.
   *
   * ORACLE — `raw-port/re/oracle/CoreMediaMovieReader_Query_newMutableDecompressionSession_oracle.py`
   * under `arch -x86_64 /usr/bin/python3`, calling the LOCAL (`nm` type `t`) symbol at
   * `_dyld_get_image_vmaddr_slide(Flexo) + 0xdee040`. Since revision 3 it drives BOTH SIDES FROM
   * ONE CASE LIST — the two inputs the branch admits, +0x58 NULL and +0x58 non-NULL — so
   * `live(case) vs port(case)` for the same case is the only comparison it can express:
   *   * case "no session" (+0x58 NULL) is MEASURED on both sides, value for value: the live
   *     function returns NULL on a 0xCD-poisoned receiver that is byte-identical afterwards, and
   *     the port returns null. This is the case that fails on an inverted guard;
   *   * case "has session" (+0x58 non-NULL) is executed LIVE in a FORKED CHILD (it calls into
   *     VideoToolbox and a harness must not risk the parent): with the format description NULL,
   *     VideoToolbox refuses, the out-parameter stays NULL and the function returns NULL — the
   *     `andb` fall-through, run rather than reasoned about. The port CANNOT be compared to that
   *     value, because it raises at the out-of-scope boundary by policy, so the harness reports
   *     the comparison as DECLARED NOT COMPARABLE (never as agreement) and requires instead that
   *     the port throws citing @0xdee073;
   *   * FIELD-OFFSET CONTROL: the sibling `hasValidDecompressionSession()` @0xdecb90 is called on
   *     the SAME arenas through an identical CFUNCTYPE and answers 0 / 1 in step with +0x58, so
   *     the offset this port cites is confirmed by a second function rather than by reading;
   *   * MUTANT CONTROL: a copy of this file with the guard flipped back to `!== null` is run
   *     through the identical case list, and the oracle FAILS unless that mutant disagrees with
   *     the live function. Revision 2's harness reported nine green checks over exactly that
   *     defect, because its two sides were built from separately constructed inputs; this control
   *     is what makes the new shape's claim checkable instead of asserted;
   *   * the branch that releases a leaked session cannot be reached without a real decoder, and
   *     is NOT claimed as verified. It is transcribed from the instructions and left to a
   *     reviewer's re-derivation. Since revision 2 that branch RETURNS NULL, as the machine does,
   *     rather than raising: `CFRelease_stub` is a no-op per the lifetime/ownership ruling, so the
   *     only thing standing between a caller and that path is the create stub above it.
   *
   * @returns the newly created `VTDecompressionSessionRef`, or `null` — either because the object
   *          had NO session at +0x58 (the frameless early exit @0xdee09e), or because the create
   *          failed, in which case a session it nevertheless produced is released first.
   */
  newMutableDecompressionSessionForCapabilityTesting(): VTDecompressionSessionRef | null {
    // @0xdee040..0xdee045  cmpq $0x0, 0x58(%rdi) ; je 0xdee09e — `je` is taken when +0x58 IS
    // zero, so the early exit belongs to the object with NO session (see the note above).
    if (this.sessionAt0x58 === null) {
      // @0xdee09e  xorl %eax, %eax ; @0xdee0a0 retq — no frame is built on this path.
      return null;
    }
    // @0xdee04f  movq $0x0, -0x8(%rbp) — the out-parameter, zeroed before the call.
    const out: { session: VTDecompressionSessionRef | null } = { session: null };
    // @0xdee057..0xdee073 — (allocator, this+0x8, NULL, NULL, NULL, &out) then the call.
    // VideoToolbox is a TRUE out-of-scope extern: this raises. Everything below is the
    // transcription of the code that would run on its return.
    const status = VTDecompressionSessionCreate_stub(
      kCFAllocatorDefault_at_0xdee057,
      this.formatDescriptionAt0x8,
      null,
      null,
      null,
      out,
    );
    // @0xdee078..0xdee07a  testl %eax,%eax ; setne %cl
    const createFailed = status !== 0;
    // @0xdee07d..0xdee084  movq -0x8(%rbp), %rax ; testq %rax,%rax ; setne %dl
    const session = out.session;
    const gotSession = session !== null;
    // @0xdee087..0xdee08c  andb %cl,%dl ; cmpb $0x1,%dl ; jne 0xdee098
    if (createFailed && gotSession) {
      // @0xdee08e..0xdee091  movq %rax,%rdi ; callq _CFRelease
      CFRelease_stub(session!);
      // @0xdee096  xorl %eax, %eax
      return null;
    }
    // @0xdee098..0xdee09d — the epilogue returns %rax, which is the out-parameter: the session on
    // success, and NULL when a failed call left it NULL.
    return session;
  }
}
