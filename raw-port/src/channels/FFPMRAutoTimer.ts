// FFPMRAutoTimer — Flexo.framework RAII (scope-lifetime) wrapper around the
// FFPMR (Flexo Performance Measurement / Reporting) subsystem. Constructing one
// starts a stopwatch bound to a set of report labels; destroying one prints the
// elapsed interval. Widely used across Flexo (grep in /tmp/Flexo_tV.txt shows
// 83 direct `callq _FFPMRSimpleTimerStopAndReportElapsedTime` sites).
//
// Faithful transcription of the two symbols in this class:
//   @Flexo 0x12b5bd0  FFPMRAutoTimer::~FFPMRAutoTimer()            (D1 base dtor)
//   @Flexo 0x12e6140  FFPMRAutoTimer::mainThreadOnly()             (assertion no-op)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFPMRAutoTimer.D1.s
//   raw-port/re/disasm/Flexo.FFPMRAutoTimer.mainThreadOnly.s
//
// Struct layout (recovered from D1):
//   +0x000..+0x00f     (unread — presumed vptr + padding; not touched by D1/MTO)
//   +0x010  qword    label0        // 1st arg to Stop&Report  (in %rsi)  — decoded @0x12b5bd9
//   +0x018  qword    label1        // 2nd arg (%rdx)                      — @0x12b5bdd
//   +0x020  qword    label2        // 3rd arg (%rcx)                      — @0x12b5be1
//   +0x028  qword    label3        // 4th arg (%r8)                       — @0x12b5be5
//   +0x030  double   startTime     // 5th arg (%xmm0)                     — @0x12b5bd4
// The four label qwords are CFStringRef/const char* triplets identifying the
// timer's category/subcategory/label/subsystem — the exact string types would
// come from FFPMRSimpleTimer's own decode, which we don't need here to faithfully
// transcribe the destructor. They travel unchanged from ivar into call arguments.
//
// Flexo referenced symbols:
//   _FFPMRSimpleTimerStopAndReportElapsedTime  — C-linkage import (not defined in
//     Flexo; imported into the __stubs at fixup time). Called directly at
//     @0x12b5be9 with the System V ABI:
//       %rsi=label0  %rdx=label1  %rcx=label2  %r8=label3  %xmm0=startTime
//     Signature (recovered from the register usage — 4 pointer args + 1 double):
//       void FFPMRSimpleTimerStopAndReportElapsedTime(
//              void *label0, void *label1, void *label2, void *label3, double startTime);
//   ___clang_call_terminate — clang's unwind personality handler at @0x12b5bf3.
//     Reached only along the exception-unwind edge out of the callq (unwind not
//     modelled in this TS mirror).

// ─── Frontier callee (undecoded — throw per PORTING_SPEC Rule 3) ──────────────────────

/**
 * _FFPMRSimpleTimerStopAndReportElapsedTime — external Flexo timer sink.
 * Called at @Flexo 0x12b5be9. Not defined in this binary; symbol not in
 * /tmp/Flexo_symmap.tsv (mangled/demangled lists both empty) → it's a __stubs
 * import satisfied by the dynamic linker.
 */
function FFPMRSimpleTimerStopAndReportElapsedTime(
  _label0: unknown, _label1: unknown, _label2: unknown, _label3: unknown, _startTime: number,
): void {
  throw new Error(
    "_FFPMRSimpleTimerStopAndReportElapsedTime not yet transcribed — called @Flexo 0x12b5be9 " +
    "(external import; not defined in Flexo binary)"
  );
}

// ─── The class ────────────────────────────────────────────────────────────────────────

/**
 * FFPMRAutoTimer — RAII stop-and-report timer. Only the destructor and the empty
 * `mainThreadOnly` assertion are exposed by nm on this class in Flexo; the ctor
 * lives inline in every caller (Flexo's release build inlines it away, so there
 * is no symbol to transcribe here). All ivars are populated by that inlined
 * ctor — the destructor is the only exit point.
 */
export class FFPMRAutoTimer {
  /** @+0x010 — label0; first ptr arg to Stop&Report. */
  label0: unknown = null;
  /** @+0x018 — label1; second ptr arg. */
  label1: unknown = null;
  /** @+0x020 — label2; third ptr arg. */
  label2: unknown = null;
  /** @+0x028 — label3; fourth ptr arg. */
  label3: unknown = null;
  /** @+0x030 — startTime (double, seconds); passed in %xmm0. */
  startTime: number = 0;

  /**
   * FFPMRAutoTimer::~FFPMRAutoTimer() — D1 base destructor.
   * @Flexo 0x12b5bd0 (raw-port/re/disasm/Flexo.FFPMRAutoTimer.D1.s)
   *
   * Line-for-line:
   *   0x12b5bd0  push rbp; mov rbp, rsp                                    prologue
   *   0x12b5bd4  movsd  xmm0, [rdi+0x30]        ## xmm0 = this->startTime  (double)
   *   0x12b5bd9  mov    rsi,  [rdi+0x10]        ## label0
   *   0x12b5bdd  mov    rdx,  [rdi+0x18]        ## label1
   *   0x12b5be1  mov    rcx,  [rdi+0x20]        ## label2
   *   0x12b5be5  mov    r8,   [rdi+0x28]        ## label3
   *   0x12b5be9  call   _FFPMRSimpleTimerStopAndReportElapsedTime
   *   0x12b5bee  pop    rbp; ret                                           epilogue
   *   0x12b5bf0..0x12b5bf3  __clang_call_terminate unwind edge (not modelled)
   *
   * Note: %rdi is discarded before the callq (it holds `this` on entry and is
   * simply not passed on — the outer sink is a C function that reports based on
   * the 4 label pointers and elapsed time only; there's no chain-into-base-dtor
   * because FFPMRAutoTimer has no C++ base class (no vptr load, no base-dtor
   * jmp/call — the plain `pop rbp; ret` after the sink confirms this).
   */
  dtor_D1_at_0x12b5bd0(): void {
    // @0x12b5bd4..0x12b5be5 — hoist the five ivars into the call arguments.
    const startTime = this.startTime;
    const label0 = this.label0;
    const label1 = this.label1;
    const label2 = this.label2;
    const label3 = this.label3;
    // @0x12b5be9 — sink.
    FFPMRSimpleTimerStopAndReportElapsedTime(label0, label1, label2, label3, startTime);
    // @0x12b5bee — return.
  }

  /**
   * FFPMRAutoTimer::mainThreadOnly() — thread assertion probe.
   * @Flexo 0x12e6140 (raw-port/re/disasm/Flexo.FFPMRAutoTimer.mainThreadOnly.s)
   *
   *   0x12e6140  push rbp; mov rbp, rsp; pop rbp; ret
   *
   * A three-instruction no-op: the whole body is an empty frame. In release
   * builds Apple elides the actual [NSThread isMainThread] assertion; the
   * symbol is retained as a hook so debug builds can reach in and replace it
   * (a common pattern in Flexo). Faithfully: this function does nothing.
   */
  mainThreadOnly_at_0x12e6140(): void {
    // @0x12e6140..0x12e6145 — empty body.
  }
}
