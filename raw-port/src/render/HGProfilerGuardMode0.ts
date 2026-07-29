// HGProfilerGuard<HGProfilerGuardMode::Mode0> — Helium's RAII stopwatch
// guard: on destruction, if the guarded `HGProfiler*` is non-null,
// accumulate `(mach_absolute_time() - profiler->_startTicks)` into
// `profiler->_accumTicks` (i.e. the inlined body of HGProfiler::stop).
//
// Only the D1 (complete) destructor is ported here — the ledger entry
// this file satisfies is __ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev
// @Helium 0x1c3eb0. The Mode1 twin and D2/D0/ctors live in their own
// ledger units and will be added when claimed.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/Helium.__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev.s
//
// -----------------------------------------------------------------------------
// LAYOUT
// -----------------------------------------------------------------------------
//   +0x00  HGProfiler*  m_profiler   — nullable pointer to the guarded
//                                       profiler; loaded @0x1c3eb6.
//   sizeof = 8 bytes (no other field is ever touched in this frame).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   * _mach_absolute_time — libSystem.B.dylib. Called @0x1c3ebe via
//       stub 0x3c540e. TRUE out-of-scope extern (mach/xnu timer).
//       Already modeled in raw-port/src/render/HGProfiler.m0.ts as
//       `_mach_absolute_time_bridge()` and reused via HGProfiler_stop.
//   * ___clang_call_terminate — libc++abi terminate handler @0x1c3ed4.
//       Landing-pad only (unwind on the mach_absolute_time frame, which
//       can never actually throw in real execution). Not modeled — same
//       policy as every other dtor in this port.
//   * HGProfiler_stop  — IN-SCOPE, ALREADY PORTED
//       @raw-port/src/render/HGProfiler.m0.ts:202 (HGProfiler::stop
//       @Helium 0x1c3db0). The dtor body is instruction-for-instruction
//       the same three-liner: `callq _mach_absolute_time; subq (rbx),rax;
//       addq rax,0x8(rbx)`. We dispatch to the ported implementation
//       rather than re-transcribing it here — this is the correct
//       "import + call the ported callee" pattern the DEP_WORKER_BRIEF
//       demands.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev.s)
// -----------------------------------------------------------------------------
//   0x1c3eb0  pushq  %rbp
//   0x1c3eb1  movq   %rsp, %rbp
//   0x1c3eb4  pushq  %rbx
//   0x1c3eb5  pushq  %rax                       ; 16-byte align pad
//   0x1c3eb6  movq   (%rdi), %rbx               ; rbx = this->m_profiler
//   0x1c3eb9  testq  %rbx, %rbx                 ; if (m_profiler == NULL) skip
//   0x1c3ebc  je     0x1c3eca
//   0x1c3ebe  callq  _mach_absolute_time        ; stub @Helium 0x3c540e
//   0x1c3ec3  subq   (%rbx), %rax               ; rax -= m_profiler->_startTicks
//   0x1c3ec6  addq   %rax, 0x8(%rbx)            ; m_profiler->_accumTicks += rax
//   0x1c3eca  addq   $0x8, %rsp
//   0x1c3ece  popq   %rbx
//   0x1c3ecf  popq   %rbp
//   0x1c3ed0  retq
//   0x1c3ed1  movq   %rax, %rdi                 ; landing pad (unwind)
//   0x1c3ed4  callq  ___clang_call_terminate    ; libc++abi terminate
//   0x1c3ed9  nopl   (%rax)                     ; padding
//
// Note the compare `testq %rbx,%rbx; je 0x1c3eca` at @0x1c3eb9/0x1c3ebc:
// the guard's null-check is on `m_profiler` (this[+0x00]) — a Mode0 guard
// constructed with a null profiler is a no-op destructor.

import { HGProfiler, HGProfiler_stop } from "./HGProfiler.m0";

/**
 * `HGProfilerGuard<HGProfilerGuardMode::Mode0>` — RAII stopwatch guard.
 *
 * The template's `Mode0` instantiation is the "plain elapsed time"
 * mode: the destructor unconditionally adds the elapsed ticks into
 * `m_profiler->_accumTicks` (no branching on a flag). The other mode
 * (Mode1 — likely "only when active"/"only when enabled") lives in a
 * separate ledger unit at __ZN15HGProfilerGuardIL19HGProfilerGuardMode1EED1Ev
 * and is not modeled here.
 */
export class HGProfilerGuard_Mode0 {
  /** +0x00 — nullable pointer to the guarded profiler. Set by the ctor
   *  (separate ledger unit); read @0x1c3eb6 by the D1 dtor. */
  m_profiler: HGProfiler | null = null;

  /**
   * `HGProfilerGuard<HGProfilerGuardMode::Mode0>::~HGProfilerGuard()` [D1]
   *   — @Helium 0x1c3eb0 (__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev).
   *
   * Faithful line-for-line port of the 14-instruction body. The D1
   * complete destructor for a template class with a trivial base has
   * NO vtable reinstall and NO base-class dtor call: it goes straight
   * into the RAII "stop the timer" body.
   */
  destruct(): void {
    // @0x1c3eb0..0x1c3eb5 — frame prologue (rbp/rbx save + 8-byte
    //   pad-to-16 via `pushq %rax`). Not observable in TS.
    // @0x1c3eb6: rbx = this->m_profiler.
    const profiler = this.m_profiler;
    // @0x1c3eb9..0x1c3ebc: if (m_profiler == NULL) je 0x1c3eca (skip body).
    if (profiler !== null) {
      // @0x1c3ebe..0x1c3ec6 — the three-instruction body IS the exact
      //   inlined `HGProfiler::stop(m_profiler)`:
      //     callq _mach_absolute_time
      //     subq  (rbx), rax                ; rax = now - m_profiler->_startTicks
      //     addq  rax,   0x8(rbx)            ; m_profiler->_accumTicks += rax
      //   HGProfiler::stop @Helium 0x1c3db0 is already ported in
      //   raw-port/src/render/HGProfiler.m0.ts — dispatch to it. Same
      //   `_mach_absolute_time_bridge` boundary, same 64-bit two's-
      //   complement wrap-mask on the delta and accumulator (the
      //   `subq` / `addq` are unsigned wrap-around at the machine
      //   level; HGProfiler_stop masks to 64 bits accordingly).
      HGProfiler_stop(profiler); // @Helium 0x1c3db0 (in-scope, ported callee)
    }
    // @0x1c3eca..0x1c3ed0 — epilogue (pop pad, pop rbx, pop rbp, ret).
    //   Nothing to model.
    // @0x1c3ed1..0x1c3ed4 landing pad: `movq %rax, %rdi; callq
    //   ___clang_call_terminate` — libc++abi terminate handler for the
    //   (unreachable in practice) unwind path where _mach_absolute_time
    //   throws. Not modeled — same policy as every other dtor's
    //   __clang_call_terminate landing pad in this port.
  }
}
