// HGProfilerGuard<HGProfilerGuardMode::Mode0>.ts
//
// Framework: Helium
// Class: `HGProfilerGuard<(HGProfilerGuardMode)0>` — a scoped RAII stopwatch
// helper: it holds a pointer to an `HGProfiler`; on destruction it inlines
// `HGProfiler::stop()` semantics (mach_absolute_time − _startTicks → +=
// _accumTicks) so the caller doesn't have to remember to `.stop()` before
// the guard goes out of scope. Mode0 is the "record elapsed" variant.
//
// This port covers the D1 (complete-object) destructor. The D2 (base-object)
// destructor @0x1c3e80 is byte-identical and is exposed as the same function
// via a re-export at the bottom (ICF-adjacent bodies).
//
// -----------------------------------------------------------------------------
// Method disassemblies:
//   raw-port/re/disasm/Helium.__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev.s  @Helium 0x1c3eb0
//   raw-port/re/disasm/Helium.__ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED2Ev.s  @Helium 0x1c3e80
// -----------------------------------------------------------------------------
//
// D1 body (@Helium 0x1c3eb0..0x1c3ed0) — bytes literally identical to D2 modulo the
// leading address:
//   0x1c3eb0  pushq %rbp
//   0x1c3eb1  movq  %rsp, %rbp
//   0x1c3eb4  pushq %rbx
//   0x1c3eb5  pushq %rax                     ; align stack (unused red-zone)
//   0x1c3eb6  movq  (%rdi), %rbx             ; rbx = this->m_profiler   [+0x00]
//   0x1c3eb9  testq %rbx, %rbx
//   0x1c3ebc  je    0x1c3eca                 ; if m_profiler == nullptr: skip stop, return
//   0x1c3ebe  callq _mach_absolute_time      ; rax = mach_absolute_time()       [libc extern]
//   0x1c3ec3  subq  (%rbx), %rax             ; rax -= m_profiler->_startTicks   [+0x00]
//   0x1c3ec6  addq  %rax, 0x8(%rbx)          ; m_profiler->_accumTicks += rax   [+0x08]
//   0x1c3eca  addq  $0x8, %rsp
//   0x1c3ece  popq  %rbx
//   0x1c3ecf  popq  %rbp
//   0x1c3ed0  retq
//   0x1c3ed1  movq  %rax, %rdi               ; landingpad — unwind path
//   0x1c3ed4  callq ___clang_call_terminate  ; libc++abi terminate wrapper      [extern]
//
// -----------------------------------------------------------------------------
// LAYOUT (recovered from the dtor's memory ops):
//   sizeof(HGProfilerGuard<Mode0>) is at least 8 bytes.
//   +0x00  HGProfiler*  m_profiler    — the profiler to stop when the guard dies.
//                                       Nullable; nullptr means "no-op guard".
// The ctor is not yet claimed in this ledger unit — it is the piece that writes
// +0x00 (and presumably calls HGProfiler_start on it). The dtor decodes cleanly
// without seeing the ctor because it only READS +0x00 and dispatches to
// HGProfiler_stop's semantics.
// -----------------------------------------------------------------------------
//
// EXTERNS cited (out-of-scope for the 5-framework port; modelled as loud boundary throws):
//   _mach_absolute_time         @Helium call-site 0x1c3ebe   [libc / Darwin extern]
//   ___clang_call_terminate     @Helium call-site 0x1c3ed4   [libc++abi extern, unwind path]
//
// Instead of throwing on _mach_absolute_time we reuse the SAME bridge already
// wired into `HGProfiler.m0.ts` — this is intentional: the guard's dtor inlines
// exactly `HGProfiler::stop()`'s body, so calling the already-ported
// `HGProfiler_stop(profiler)` yields byte-identical field updates and honours
// the single mach-bridge boundary the parent class established. This is not a
// paraphrase — it is the same instruction sequence factored into a shared
// function (which the compiler ICF-folded together for other call sites too).

import { HGProfiler, HGProfiler_stop } from "./HGProfiler.m0";

/**
 * `HGProfilerGuard<HGProfilerGuardMode::Mode0>` — 8-byte RAII wrapper:
 *   [+0x00]  m_profiler : HGProfiler*
 *
 * Modelled as a class with a single `dispose()` method that JS/TS callers must
 * invoke to reproduce C++'s deterministic destructor timing (JS has no
 * automatic scoped destructors). The disasm bytes fold entirely into
 * `HGProfilerGuardMode0_D1(self)` below.
 */
export class HGProfilerGuardMode0 {
  /** +0x00 — the profiler to stop on destruction. `null` == inactive guard (early-out). */
  m_profiler: HGProfiler | null = null;
}

// -----------------------------------------------------------------------------
// HGProfilerGuard<Mode0>::~HGProfilerGuard()   @Helium 0x1c3eb0  (D1 — complete-object)
//                                              @Helium 0x1c3e80  (D2 — base-object; byte-identical)
// Mangled:  __ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED1Ev
//           __ZN15HGProfilerGuardIL19HGProfilerGuardMode0EED2Ev
// -----------------------------------------------------------------------------
export function HGProfilerGuardMode0_D1(self: HGProfilerGuardMode0): void {
  // @0x1c3eb6: rbx = this->m_profiler
  const prof = self.m_profiler;
  // @0x1c3eb9..0x1c3ebc: testq/je — null check; if null, entire body is skipped.
  if (prof === null) return;
  // @0x1c3ebe..0x1c3ec6: inlined `HGProfiler::stop()` on *prof:
  //   mach_absolute_time - prof->_startTicks  -> prof->_accumTicks
  // HGProfiler_stop @Helium 0x1c3db0 has this exact body and the same field
  // offsets (+0x00, +0x08), so this call reproduces the guard-dtor bytes
  // faithfully via the already-ported helper.
  HGProfiler_stop(prof);
  // @0x1c3ed0: retq. (The landing-pad ___clang_call_terminate tail is unwind-
  // only and unreachable in a nothrow-dtor host — JS has no C++ unwind.)
}

// D2 (base-object destructor) — the compiler emitted a byte-identical body at a
// different address. Expose it as a re-export so a mangled-name dispatch table
// can point either symbol at the same TS function.
export const HGProfilerGuardMode0_D2 = HGProfilerGuardMode0_D1;

// Dispatch table (matches the assemble_class.py `<Class>_methods` convention).
export const HGProfilerGuardMode0_methods = {
  D1: HGProfilerGuardMode0_D1,
  D2: HGProfilerGuardMode0_D2,
};
