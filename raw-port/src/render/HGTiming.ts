/**
 * HGTiming — Helium framework (render layer)
 *
 * A namespaced "class with only static methods" that exposes a one-time-computed
 * conversion factor from mach absolute-time ticks to seconds. The single method
 * ported here is `HGTiming::GetMachTimeConversionFactor()`, a returning-`double`
 * function backed by two file-scope globals guarded by a `dispatch_once` /
 * "once token" pattern:
 *
 *   __ZZN8HGTiming27GetMachTimeConversionFactorEvE9onceToken    : int64 once-token
 *   __ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion  : double cache
 *
 * The compiler emitted a fast-path in the ABI-visible symbol at 0x6d100, which
 * checks the once-token for -1 (== "already ran"), and if so just returns the
 * cached double. Otherwise it enters the .cold.1 slow-path that runs
 * `_dispatch_once` (implicit via the cold-path callee's role — see
 * ____ZN8HGTiming27GetMachTimeConversionFactorEv_block_invoke below), whose body
 * calls Apple's `mach_timebase_info(&info)` and computes
 * `conversion = info.numer * 1e-9 / info.denom` — i.e. nanoseconds per tick /
 * one-billion, converting mach ticks to SECONDS.
 *
 * SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
 *   @Helium 0x6d100  HGTiming::GetMachTimeConversionFactor()
 *   @Helium 0x316174 HGTiming::GetMachTimeConversionFactor().cold.1   (frontier — dispatch_once
 *                                                                       fast-slow-path outliner;
 *                                                                       not transcribed here)
 *   @Helium 0x6d130  ____ZN8HGTiming27GetMachTimeConversionFactorEv_block_invoke
 *                     — the once-block body that calls _mach_timebase_info & stores the result.
 *
 * KEY CONSTANT (bytes read directly from the __TEXT slice, offset 0x4000):
 *   @0x6d156 mulsd 0x35fada(%rip)  → VA 0x3ccc38 — 8 bytes = `1e-09` (little-endian
 *                                                    IEEE-754 double 0x3e112e0be826d695).
 *
 * External callees cited:
 *   _mach_timebase_info                              @Helium (stub 0x3c5420) — Apple system call
 *   HGTiming::GetMachTimeConversionFactor().cold.1   @Helium 0x316174 — cold slow-path outliner
 *
 * The mach conversion follows Apple's canonical formula:
 *   mach_timebase_info(&info);   // info.numer, info.denom :: uint32
 *   conversion = (double)info.numer * 1e-9 / (double)info.denom;
 *   // → seconds-per-mach-tick.
 * The asm at 0x6d151-0x6d167 does exactly this: cvtsi2sd on numer/denom, mulsd
 * by the 1e-9 constant, divsd by denom, store to the file-scope `conversion`
 * cache. The main entry point returns the cached value via a `movsd` from
 * that RIP-relative slot.
 */

/** File-scope cache — the double-precision conversion factor. Initialised to 0.0
 *  until the once-block runs. Modelled here as a module-level Number. */
let __ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion: number = 0.0;

/** File-scope once-token — starts at 0; set to -1 by dispatch_once when the block
 *  has run. The asm at 0x6d100 tests for exactly -1 as the "already ran" flag. */
let __ZZN8HGTiming27GetMachTimeConversionFactorEvE9onceToken: bigint = 0n;

/** External Apple callee — `mach_timebase_info_t` fill-in. Not ported (system call).
 *  Contract: fills a `{ numer: u32, denom: u32 }` struct and returns 0 on success. */
export interface MachTimebaseInfo {
  numer: number;
  denom: number;
}
export function mach_timebase_info_notLinked(_info: MachTimebaseInfo): number {
  // @Helium stub 0x3c5420 — external _mach_timebase_info. Unported callee.
  throw new Error("_mach_timebase_info unported system callee @Helium 0x3c5420 (stub)");
}

/** Injected external shim so the once-block can be evaluated when tests supply a
 *  real `_mach_timebase_info`. */
export interface HGTimingExternals {
  mach_timebase_info: (info: MachTimebaseInfo) => number;
}
export const HGTiming_defaultExternals: HGTimingExternals = {
  mach_timebase_info: mach_timebase_info_notLinked,
};

/**
 * @Helium 0x6d130  ____ZN8HGTiming27GetMachTimeConversionFactorEv_block_invoke
 *
 * Faithful transcription (12 lines):
 *   0x6d130 pushq %rbp / movq %rsp,%rbp
 *   0x6d134 subq  $0x10, %rsp                     ; reserve local mach_timebase_info_data_t (8B)
 *   0x6d138 leaq  -0x8(%rbp), %rdi                ; rdi = &info
 *   0x6d13c callq _mach_timebase_info(&info)      ; Apple system call → returns 0 on success
 *   0x6d141 testl %eax, %eax
 *   0x6d143 je    0x6d14b                         ; if rc == 0, fall through to compute
 *   0x6d145 addq  $0x10,%rsp / popq %rbp / retq   ; else return (leaves cache unchanged)
 *   -- rc == 0 branch (@0x6d14b) --
 *   0x6d14b movl  -0x8(%rbp), %eax                ; eax = info.numer  (u32)
 *   0x6d14e movl  -0x4(%rbp), %ecx                ; ecx = info.denom  (u32)
 *   0x6d151 cvtsi2sd %rax, %xmm0                  ; xmm0 = (double)numer
 *   0x6d156 mulsd  0x35fada(%rip), %xmm0          ; xmm0 *= 1e-09       (@VA 0x3ccc38 = 1e-9)
 *   0x6d15e cvtsi2sd %rcx, %xmm1                  ; xmm1 = (double)denom
 *   0x6d163 divsd  %xmm1, %xmm0                   ; xmm0 = (numer * 1e-9) / denom
 *   0x6d167 movsd  %xmm0, conversion(%rip)        ; cache the result
 *   0x6d16f addq $0x10, %rsp / popq %rbp / retq
 *
 * Reduced semantics:
 *   mach_timebase_info_data_t info;
 *   if (_mach_timebase_info(&info) == 0)
 *     conversion = (double)info.numer * 1e-9 / (double)info.denom;
 *
 * Note: fp64 throughout — this is a `double` computation (movsd/mulsd/divsd/cvtsi2sd
 * are all 64-bit-scalar variants). No fp32 narrowing here — the mach-time constant
 * `1e-09` is a genuine IEEE-754 double, matching the movsd/mulsd 64-bit width.
 */
export function HGTiming_GetMachTimeConversionFactor_block_invoke(
  externals: HGTimingExternals = HGTiming_defaultExternals,
): void {
  // @0x6d138 — reserve `struct mach_timebase_info info;`  (as a JS object).
  const info: MachTimebaseInfo = { numer: 0, denom: 0 };
  // @0x6d13c — _mach_timebase_info(&info)
  const rc = externals.mach_timebase_info(info) | 0;
  // @0x6d141 — testl %eax, %eax  (rc != 0 → return unchanged)
  if (rc !== 0) return;
  // @0x6d14b-0x6d167 — compute conversion = numer * 1e-9 / denom  (all fp64).
  const numer = info.numer >>> 0;
  const denom = info.denom >>> 0;
  const dblNumer = numer;   // cvtsi2sd %rax, %xmm0 — u32→double  (no rounding loss for u32)
  const dblDenom = denom;   // cvtsi2sd %rcx, %xmm1 — u32→double
  // @0x6d156 — mulsd 0x35fada(%rip), %xmm0  ; @VA 0x3ccc38 = 1e-09 (double).
  const scaled = dblNumer * 1e-9;
  // @0x6d163 — divsd %xmm1, %xmm0
  __ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion = scaled / dblDenom;
}

export class HGTiming {
  /**
   * @Helium 0x6d100  __ZN8HGTiming27GetMachTimeConversionFactorEv
   *
   * Faithful transcription (12 lines):
   *   0x6d100 cmpq  $-0x1, onceToken(%rip)                 ; already-ran ?
   *   0x6d108 jne   0x6d113                                 ; if not → cold path
   *   0x6d10a movsd conversion(%rip), %xmm0                 ; else fast-path: return cached value
   *   0x6d112 retq
   *   -- cold slow-path (@0x6d113) --
   *   0x6d113 pushq %rbp / movq %rsp,%rbp
   *   0x6d117 callq HGTiming::GetMachTimeConversionFactor.cold.1  ; runs dispatch_once + block
   *   0x6d11c popq  %rbp
   *   0x6d11d movsd conversion(%rip), %xmm0
   *   0x6d125 retq
   *
   * The cold-path outliner at @0x316174 is the dispatch_once orchestrator that
   * ensures the block above runs exactly once and flips `onceToken` to -1. Its
   * body is not transcribed here (Apple's `_dispatch_once` implementation is
   * external and this method is an outliner around it) — we simulate the same
   * observable effect by running the block on first call.
   */
  static GetMachTimeConversionFactor(externals: HGTimingExternals = HGTiming_defaultExternals): number {
    // @0x6d100 — cmpq $-0x1, onceToken (check for "already ran" sentinel).
    if (__ZZN8HGTiming27GetMachTimeConversionFactorEvE9onceToken !== -1n) {
      // @0x6d117 — cold path: run the block once, then flip onceToken to -1.
      HGTiming_GetMachTimeConversionFactor_block_invoke(externals);
      __ZZN8HGTiming27GetMachTimeConversionFactorEvE9onceToken = -1n;
    }
    // @0x6d10a / @0x6d11d — movsd conversion(%rip), %xmm0 — return cached value.
    return __ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion;
  }
}

/** Test-only: reset the once-token + cache so the block can be re-invoked. Not part
 *  of the original C++ ABI — only exposed for the port's own unit tests. */
export function HGTiming_resetOnceForTesting(): void {
  __ZZN8HGTiming27GetMachTimeConversionFactorEvE9onceToken = 0n;
  __ZZN8HGTiming27GetMachTimeConversionFactorEvE10conversion = 0.0;
}
