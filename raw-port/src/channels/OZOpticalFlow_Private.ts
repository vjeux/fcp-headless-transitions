// raw-port/src/channels/OZOpticalFlow_Private.ts
//
// FCP namespace `OZOpticalFlow::Private` (Ozone.framework, x86_64) — the
// free-function half of the optical-flow analyzer's private implementation.
// The ledger lists this namespace as its own unit (`OZOpticalFlow::Private`),
// separate from the `OZOpticalFlow` class file, from the `AnalyzerImpl` class
// and from the small predicate FUNCTORS (JobIDPred / ContainingPred /
// ElementMatchesPred / FootageMatchesPred), each of which is its own class in
// the ledger and therefore its own future file.
//
// Symbols transcribed here (Ozone.framework, x86_64):
//   0x4ecac0  OZOpticalFlow::Private::ActiveJobPred(JobImpl const&)
//             __ZN13OZOpticalFlow7Private13ActiveJobPredERKNS0_7JobImplE
//
// Source disassembly (dumped via raw-port/tools/disasm.sh --sym … Ozone):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private13ActiveJobPredERKNS0_7JobImplE.s
//
// ── STRUCT LAYOUT: OZOpticalFlow::Private::JobImpl (partial) ────────────────
// Only ONE field of JobImpl is touched by the function ported in this file, so
// only that field is modelled here; the rest of the record is recovered when
// the JobImpl class itself is ported (its ctor is at @Ozone 0x4e9c60).
//
//   +0xc0 : state : u32   — the job's lifecycle state.
//
// The offset is read as a 32-bit quantity (`cmpl`/`movl`, never `cmpq`) by
// every accessor below, which is what fixes its width at u32.
//
// The four state VALUES are each grounded in an instruction that writes or
// tests the byte at +0xc0 — no value below is inferred from naming:
//
//   0 = ACTIVE
//       @Ozone 0x4ecac4  ActiveJobPred:            cmpl $0x0, 0xc0(%rdi)
//       @Ozone 0x4e0a84  AnalyzerImpl::resume:     movl $0x0, 0xc0(%r14)
//   1 = PAUSED
//       @Ozone 0x4e0944  AnalyzerImpl::pause:      cmpl $0x1, 0xc0(%r15)
//       @Ozone 0x4e094e  AnalyzerImpl::pause:      movl $0x1, 0xc0(%r15)
//   2 = CANCELED
//       @Ozone 0x4ecad4  CanceledJobPred:          cmpl $0x2, 0xc0(%rdi)
//       @Ozone 0x4de6af  AnalyzerImpl::markJobAsCanceled: movl $0x2, 0xc0(%r14)
//   3 = ERROR
//       @Ozone 0x4dd014  AnalyzerImpl::markJobAsError:    movl $0x3, 0xc0(%rsi)
//
// (`resume` writing 0 and `pause` writing 1 is what pairs 0 with the "running"
// state that ActiveJobPred selects for; the pair of writes is a state machine,
// not a boolean.)

/**
 * OZOpticalFlow::Private::JobImpl — partial record.
 *
 * Fields are added as the methods that touch them are transcribed. Every field
 * carries its byte offset, per PORTING_SPEC Rule 5.
 */
export interface OZOpticalFlow_Private_JobImpl {
  /**
   * JobImpl.state — u32 at +0xc0. Lifecycle state of one analysis job; see the
   * value table in this file's header for the address grounding each value.
   */
  state: number;
}

/**
 * Values of `JobImpl.state` (u32 @ +0xc0).
 *
 * Each constant cites the instruction it was read from — see the header table.
 */
export const OZOpticalFlow_Private_JobState = {
  /** Running. Written by AnalyzerImpl::resume @Ozone 0x4e0a84 (`movl $0x0`). */
  ACTIVE: 0,
  /** Paused. Written by AnalyzerImpl::pause @Ozone 0x4e094e (`movl $0x1`). */
  PAUSED: 1,
  /** Canceled. Written by AnalyzerImpl::markJobAsCanceled @Ozone 0x4de6af (`movl $0x2`). */
  CANCELED: 2,
  /** Errored. Written by AnalyzerImpl::markJobAsError @Ozone 0x4dd014 (`movl $0x3`). */
  ERROR: 3,
} as const;

/**
 * OZOpticalFlow::Private::ActiveJobPred(JobImpl const&) @Ozone 0x4ecac0.
 * Mangled: __ZN13OZOpticalFlow7Private13ActiveJobPredERKNS0_7JobImplE
 *
 * A std::find_if-style predicate over the analyzer's `vector<JobImpl>`: it
 * selects the job that is currently RUNNING. Used by
 * AnalyzerImpl::findActiveJob @Ozone 0x4dcf20 (its sibling
 * `CanceledJobPred` @Ozone 0x4ecad0 backs findCanceledJob @Ozone 0x4dcf60).
 *
 * Faithful transcription — the whole body is six instructions:
 *
 *   0x4ecac0  pushq %rbp                  ; frame setup, no semantic effect
 *   0x4ecac1  movq  %rsp, %rbp            ; frame setup, no semantic effect
 *   0x4ecac4  cmpl  $0x0, 0xc0(%rdi)      ; flags on  job.state - 0   (AT&T: dst - src)
 *   0x4ecacb  sete  %al                   ; al = ZF   -> job.state == 0
 *   0x4ecace  popq  %rbp
 *   0x4ecacf  retq                        ; return al (bool)
 *
 * AT&T decode note (PORTING_SPEC Rule 4 cheat-sheet): `cmpl $0x0, 0xc0(%rdi)`
 * computes dst - src = job.state - 0, and `sete` fires on ZF=1, i.e. exactly
 * `job.state == 0`. There is no signed/unsigned subtlety here — the only
 * condition consumed is equality with zero.
 *
 * @param job  the JobImpl to test (passed by const& in %rdi)
 * @returns    true iff job.state (u32 @ +0xc0) is 0 (= JobState.ACTIVE)
 */
export function ozOpticalFlowPrivateActiveJobPred(
  job: OZOpticalFlow_Private_JobImpl,
): boolean {
  // `cmpl` is a 32-bit compare: mask the field to u32 to match the load width
  // at 0x4ecac4 before testing ZF.
  const state = job.state >>> 0;
  // sete %al @0x4ecacb — ZF from (state - 0).
  return state === OZOpticalFlow_Private_JobState.ACTIVE;
}
