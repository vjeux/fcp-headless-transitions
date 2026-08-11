// OZOpticalFlow__Private__CanceledJobPred.ts — raw transcription of the Ozone
// free function `OZOpticalFlow::Private::CanceledJobPred(JobImpl const&)`.
//
// A one-line predicate the optical-flow analyzer passes to the STL algorithms
// that sweep its job vector ("is this job cancelled?"). It is a FREE FUNCTION
// in the `OZOpticalFlow::Private` namespace — not a member of a class and not a
// functor — so per PORTING_SPEC's naming rule the file is named after the
// function itself, in the `Outer__Inner` form the landed nested-type files use
// (OZOpticalFlow__Private__JobIDPred.ts,
// OZOpticalFlow__Private__CacheFileHeader.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4ecad0  OZOpticalFlow::Private::CanceledJobPred(OZOpticalFlow::Private::JobImpl const&)
//                __ZN13OZOpticalFlow7Private15CanceledJobPredERKNS0_7JobImplE
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN13OZOpticalFlow7Private15CanceledJobPredERKNS0_7JobImplE Ozone`):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private15CanceledJobPredERKNS0_7JobImplE.s (6 lines)
//
// ---------------------------------------------------------------------------
// THE FIELD AT JobImpl +0xc0
// ---------------------------------------------------------------------------
// A 32-bit job-state word. This body compares it against the literal 2; the
// value 2 is pinned to "cancelled" by the sibling that WRITES it (evidence,
// NOT transcribed — its own ledger unit):
//
//   OZOpticalFlow::Private::AnalyzerImpl::markJobAsCanceled(__wrap_iter<JobImpl*>)
//   @0x4de690 contains `movl $0x2, 0xc0(%r14)` @0x4de6af — the same offset, the
//   same width, storing exactly the constant this predicate tests for.
//
// Only that one field is modelled here; JobImpl is a large record (the analyzer
// also keeps footage/element/cache-file state in it) whose other offsets this
// body never touches.
//
// CALLEES: none. No in-scope call, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).

/**
 * The single `OZOpticalFlow::Private::JobImpl` field this predicate reads.
 *
 * @Ozone 0x4ecad0 (`cmpl $0x2,0xc0(%rdi)` — 32-bit read at +0xc0)
 */
export interface OZOpticalFlowPrivateJobImplState {
  /**
   * +0xc0 — the i32 job-state word. 2 means CANCELLED, per
   * `AnalyzerImpl::markJobAsCanceled` @0x4de690's `movl $0x2,0xc0(%r14)`
   * @0x4de6af.
   */
  stateAtC0: number;
}

/**
 * `OZOpticalFlow::Private::CanceledJobPred(JobImpl const& job)`
 *   — @Ozone 0x4ecad0
 *   — __ZN13OZOpticalFlow7Private15CanceledJobPredERKNS0_7JobImplE
 *
 * Returns whether the job's state word equals 2 ("cancelled").
 *
 * Full transcription — every instruction, in order:
 *
 *   0x4ecad0  pushq %rbp                 ; frame setup (no TS counterpart)
 *   0x4ecad1  movq  %rsp,%rbp            ; frame setup (no TS counterpart)
 *   0x4ecad4  cmpl  $0x2,0xc0(%rdi)      ; flags on (job.state - 2), 32-bit
 *   0x4ecadb  sete  %al                  ; return (job.state == 2)
 *   0x4ecade  popq  %rbp                 ; frame teardown (no TS counterpart)
 *   0x4ecadf  retq
 *
 * Decode notes:
 *   * `cmpl` is a 32-bit compare against an immediate and `sete` keys on ZF
 *     alone, so the result is EQUALITY — not a "cancelled-or-later" ordering
 *     test. Any other state value returns false.
 *   * the argument is a `JobImpl const&`, i.e. a pointer in %rdi; the body
 *     dereferences exactly one field and writes nothing.
 *   * only %al is set; the caller reads the boolean from the low byte.
 *   * ZERO callees of any kind.
 *
 * @param job the job record (`%rdi`, by const reference).
 * @returns true iff `job.stateAtC0 === 2`.
 */
export function OZOpticalFlow_Private_CanceledJobPred(
  job: OZOpticalFlowPrivateJobImplState,
): boolean {
  // @0x4ecad4/@0x4ecadb  cmpl $0x2,0xc0(%rdi) ; sete %al
  return (job.stateAtC0 | 0) === 2;
}
