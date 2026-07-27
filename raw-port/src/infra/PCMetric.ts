// PCMetric — ProCore's tiny mach-timebase-backed host-time-to-seconds converter.
//
// A namespace-scoped `static convertHostTimeToSeconds(unsigned long long)`
// function that returns `mach_absolute_time`-style host ticks as seconds, using
// GCD's `_dispatch_once` to cache the `mach_timebase_info` result exactly once.
//
// The single exported entry point at ProCore 0x5f0d0 is a fast path over a
// dispatch_once guard: when initialised, it converts hostTime with a plain
// (double)u64 × conversionRate; when not, it detours through the .cold.1
// slow-path that invokes _dispatch_once with a block that queries
// `mach_timebase_info` and populates `conversionRate`.
//
// nm evidence (`nm -arch x86_64 -n ProCore | grep PCMetric`):
//   000000000005f0d0 T __ZN8PCMetric24convertHostTimeToSecondsEy
//   000000000005f112 t ____ZN8PCMetric24convertHostTimeToSecondsEy_block_invoke
//   00000000000ddba5 t __ZN8PCMetric24convertHostTimeToSecondsEy.cold.1
//   000000000015c2a8 b __ZZN8PCMetric24convertHostTimeToSecondsEyE14conversionRate
//   000000000015c2b0 b __ZZN8PCMetric24convertHostTimeToSecondsEyE4once
//
// Static bss layout (recovered from the nm dump above):
//   __ZZN…E14conversionRate  @ ProCore bss 0x15c2a8   double, 8B
//   __ZZN…E4once             @ ProCore bss 0x15c2b0   dispatch_once_t, 8B
//
// Faithful transcription of exactly two exported symbols — the fast/slow entry
// point at ProCore 0x5f0d0 and its .cold.1 slow-path stub at ProCore 0xddba5
// (identified via nm; the .cold.1 label does NOT appear in the tV listing
// because it sits inside a run of ICF-coalesced dispatch_once stubs). We also
// transcribe the block_invoke helper at ProCore 0x5f112 — it defines the value
// of `conversionRate` so it IS on the decoded surface, not a frontier callee.
//
// Source disassembly:
//
// (fast entry — from raw-port/re/disasm/ProCore.PCMetric.convertHostTimeToSeconds.s)
//   __ZN8PCMetric24convertHostTimeToSecondsEy:
//     0x5f0d0  pushq  %rbp
//     0x5f0d1  movq   %rsp, %rbp
//     0x5f0d4  pushq  %rbx
//     0x5f0d5  pushq  %rax
//     0x5f0d6  movq   %rdi, %rbx                     ; spill hostTime (arg0)
//     0x5f0d9  cmpq   $-0x1, once(%rip)              ; dispatch_once done sentinel
//     0x5f0e1  jne    0x5f10b                         ; not done: slow path
//     0x5f0e3  movq   %rbx, %xmm0                    ; xmm0 = hostTime as int64
//     0x5f0e8  punpckldq K1(%rip), %xmm0             ; K1 @0x123870
//                                                     ; = {0x43300000, 0x45300000,
//                                                     ;    0x43300000, 0x45300000}
//                                                     ; interleaves lo/hi 32b of
//                                                     ; hostTime with the two magic
//                                                     ; biased-exp dwords.
//                                                     ; Result lanes (as doubles):
//                                                     ;   lane0 = lo32 + 2^52
//                                                     ;   lane1 = hi32 * 2^32 + 2^84
//     0x5f0f0  subpd  K2(%rip), %xmm0                ; K2 @0x123880
//                                                     ; = {2^52, 2^84}
//                                                     ; -> lanes = {lo32, hi32*2^32}
//     0x5f0f8  haddpd %xmm0, %xmm0                    ; lane0 = lo32 + hi32*2^32
//                                                     ;       = (double)hostTime
//     0x5f0fc  mulsd  conversionRate(%rip), %xmm0    ; seconds = hostTime * rate
//     0x5f104  addq   $0x8, %rsp
//     0x5f108  popq   %rbx
//     0x5f109  popq   %rbp
//     0x5f10a  retq
//     0x5f10b  callq  .cold.1                         ; run dispatch_once slow path
//     0x5f110  jmp    0x5f0e3                         ; retry the fast path
//
// (block body — from tV listing at position 107506)
//   ____ZN8PCMetric24convertHostTimeToSecondsEy_block_invoke:
//     0x5f112  pushq  %rbp
//     0x5f113  movq   %rsp, %rbp
//     0x5f116  subq   $0x10, %rsp                    ; reserve mach_timebase_info_data_t
//     0x5f11a  leaq   -0x8(%rbp), %rdi                ; &info
//     0x5f11e  callq  _mach_timebase_info             ; kern_return_t = mach_timebase_info(&info)
//     0x5f123  testl  %eax, %eax
//     0x5f125  jne    0x5f14b                         ; nonzero KERN_* -> skip populate
//     0x5f127  movl   -0x8(%rbp), %eax                ; info.numer (uint32)
//     0x5f12a  movl   -0x4(%rbp), %ecx                ; info.denom (uint32)
//     0x5f12d  cvtsi2sd %rax, %xmm0                  ; (double)numer (via rax = zero-extended eax)
//     0x5f132  mulsd  0xc66fe(%rip), %xmm0           ; * K3 @0x125838 = 1e-9
//     0x5f13a  cvtsi2sd %rcx, %xmm1                  ; (double)denom
//     0x5f13f  divsd  %xmm1, %xmm0                   ; / (double)denom
//     0x5f143  movsd  %xmm0, conversionRate(%rip)     ; publish
//     0x5f14b  addq   $0x10, %rsp
//     0x5f14f  popq   %rbp
//     0x5f150  retq
//
// (cold slow-path — from tV listing near line 254353)
//   __ZN8PCMetric24convertHostTimeToSecondsEy.cold.1:
//     0xddba5  pushq  %rbp
//     0xddba6  movq   %rsp, %rbp
//     0xddba9  leaq   once(%rip), %rdi
//     0xddbb0  leaq   ___block_literal_global(%rip), %rsi
//     0xddbb7  popq   %rbp
//     0xddbb8  jmp    _dispatch_once
//
// Framework: Final Cut Pro / ProCore.framework.
//
// Constant citations (verified via raw-port/army/tools/resolve.py):
//   K1 @0x123870  u64 lo=0x4530000043300000              — punpckldq mem operand
//                 (in ordered dword lanes: 0x43300000, 0x45300000,
//                                          0x43300000, 0x45300000).
//                 0x43300000_00000000 is the double 2^52 = 4503599627370496.
//                 0x45300000_00000000 is the double 2^84 = 1.9342813113834067e+25.
//   K1+8 @0x123878  u64 = 0                              — punpckldq needs 16B,
//                                                          the trailing 8B is
//                                                          also part of the pair.
//   K2 @0x123880  u64 = 0x4330000000000000 = 2^52         — subpd lane 0.
//   K2+8 @0x123888 u64 = 0x4530000000000000 = 2^84       — subpd lane 1.
//   K3 @0x125838  u64 = 0x3e112e0be826d695 = 1e-9         — mulsd factor in block_invoke.
// (These are the well-known LLVM/Apple `x86-uint-to-fp` magic constants; the
// combined effect is a bit-exact u64→double conversion.)
//
// Frontier callees (all become throwing stubs):
//   _mach_timebase_info via symbol stub                @ProCore call 0x5f11e (block_invoke) — stub 0xde948
//   _dispatch_once via symbol stub                      @ProCore tail-jmp 0xddbb8 (cold.1)   — stub 0xde810

/**
 * Mirror of `mach_timebase_info_data_t` — the two-uint32 struct filled in by
 * `mach_timebase_info`. Stored in the block_invoke's stack frame at
 * `-0x8(%rbp)..-0x1(%rbp)` and read as:
 *   numer = *(uint32_t*)(&info + 0)  ; @0x5f127
 *   denom = *(uint32_t*)(&info + 4)  ; @0x5f12a
 */
type mach_timebase_info_data_t = { numer: number; denom: number };

/**
 * `_mach_timebase_info(mach_timebase_info_t)` — Darwin kernel call that
 * populates a `{numer, denom}` pair such that
 *   host_ticks_to_ns = ticks * numer / denom.
 * Frontier callee — its body is in the mach kernel, not Flexo/ProCore. We
 * model it as a throwing stub; a real runtime would provide the numbers via
 * `process.hrtime.bigint()` or an equivalent JS-side host-time source.
 * @ProCore call site 0x5f11e (stub 0xde948).
 */
function mach_timebase_info(_out: mach_timebase_info_data_t): number {
  throw new Error(
    "PCMetric: mach_timebase_info() not modelled in the raw-port runtime " +
      "@ProCore call site 0x5f11e (stub 0xde948)"
  );
}

/**
 * `_dispatch_once(&once, block)` — GCD lazy-init primitive. Frontier callee.
 * The .cold.1 slow-path tail-jmps to it with %rdi = &once and %rsi =
 * &___block_literal_global (a compiler-emitted block descriptor whose
 * `invoke` slot points at `___ZN8PCMetric24convertHostTimeToSecondsEy_block_invoke`).
 * @ProCore tail-jmp 0xddbb8 (stub 0xde810).
 */
function gcd_dispatch_once(
  _predicate: { value: bigint },
  _block: () => void
): void {
  throw new Error(
    "PCMetric: _dispatch_once not modelled in the raw-port runtime " +
      "@ProCore tail-jmp 0xddbb8 (stub 0xde810)"
  );
}

/**
 * Function-local static bss for `PCMetric::convertHostTimeToSeconds`.
 *   +0x15c2a8  conversionRate  double   — cached ((numer * 1e-9) / denom).
 *                                        Read by the fast path
 *                                        `mulsd conversionRate(%rip), %xmm0`
 *                                        @0x5f0fc; written by the block_invoke
 *                                        @0x5f143.
 *   +0x15c2b0  once            dispatch_once_t (== `long`, 8B) — GCD one-shot
 *                                        guard. Compared against `-0x1` in the
 *                                        fast path (`cmpq $-0x1, once(%rip)`
 *                                        @0x5f0d9); GCD writes `~0L` == -1
 *                                        once the block finishes.
 */
const bss = {
  conversionRate: 0, // double
  once: { value: 0n }, // dispatch_once_t; 0 = not run, -1 = done (GCD's ABI)
};

/**
 * `____ZN8PCMetric24convertHostTimeToSecondsEy_block_invoke` — the block body
 * that `_dispatch_once` runs exactly once. On success, publishes
 *   conversionRate = (numer * 1e-9) / denom
 * where {numer, denom} come from `mach_timebase_info`. On nonzero kern_return
 * from `mach_timebase_info` (i.e. the syscall failed), the block SILENTLY
 * skips the store — leaving `conversionRate == 0.0`, which the fast path would
 * then multiply against every hostTime to produce 0.0. This is the decoded
 * behaviour; we do not add error handling that isn't in the asm.
 *
 * Address-by-address:
 *   @0x5f112..0x5f116  prologue + reserve 16B for the `info` struct.
 *   @0x5f11a           %rdi = &info (stack slot at -8(%rbp)).
 *   @0x5f11e           kern_return_t rv = mach_timebase_info(&info).
 *   @0x5f123..0x5f125  if (rv != 0) skip the store.
 *   @0x5f127..0x5f12a  load numer/denom as u32s from the stack struct.
 *   @0x5f12d           numer_double = (double)numer via `cvtsi2sd %rax,%xmm0`
 *                        — note the `%rax` (64-bit source) is used; the prior
 *                        `movl -0x8(%rbp), %eax` zero-extends the u32 into the
 *                        full 64-bit %rax, so the `cvtsi2sd` treats it as a
 *                        NON-NEGATIVE int64, which for a u32 numer is exact.
 *   @0x5f132           numer_double *= K3 == 1e-9.
 *   @0x5f13a           denom_double = (double)denom via `cvtsi2sd %rcx,%xmm1`
 *                        (same zero-extended trick).
 *   @0x5f13f           numer_double /= denom_double.
 *   @0x5f143           publish into conversionRate.
 *   @0x5f14b..0x5f150  epilogue.
 */
function convertHostTimeToSeconds_block_invoke(): void {
  // @0x5f11a..0x5f11e — mach_timebase_info(&info).
  const info: mach_timebase_info_data_t = { numer: 0, denom: 0 };
  const rv = mach_timebase_info(info);

  // @0x5f123..0x5f125 — if nonzero return, DO NOT populate.
  if (rv !== 0) {
    return;
  }

  // @0x5f127..0x5f13f — conversionRate = (numer * 1e-9) / denom.
  // The C++ compiler used two SSE cvtsi2sd off zero-extended u32-in-u64
  // registers, which is equivalent to converting the unsigned integer to
  // double exactly (u32 is well within double's 53-bit exact-integer range).
  // In JS the coercion `(x >>> 0)` guarantees the same non-negative
  // interpretation of a nominal u32 field.
  const numer_double = (info.numer >>> 0);
  const denom_double = (info.denom >>> 0);
  const scaled = numer_double * 1e-9;

  // @0x5f143 — publish.
  bss.conversionRate = scaled / denom_double;
}

/**
 * `PCMetric::convertHostTimeToSeconds(unsigned long long)` — the exported
 * fast/slow entry point. Mangled `__ZN8PCMetric24convertHostTimeToSecondsEy`
 * at @ProCore 0x5f0d0.
 *
 * On the fast path, converts hostTime to seconds via the standard
 * LLVM `x86-uint-to-fp` magic-constant trick + a single mulsd by the cached
 * conversionRate. On the slow path, detours through the .cold.1 stub which
 * kicks the dispatch_once block, then retries the fast path.
 *
 * Address-by-address:
 *   @0x5f0d0..0x5f0d6  prologue + spill hostTime into %rbx.
 *   @0x5f0d9..0x5f0e1  fast/slow branch on `once == -1`.
 *   @0x5f0e3..0x5f0f8  u64 hostTime -> double via the two-magic-constant trick:
 *                       xmm0 = movq(u64 hostTime as bits)
 *                       xmm0 = punpckldq(xmm0, K1)  ; interleaves dwords
 *                       xmm0 = subpd(xmm0, K2)      ; drops the biases
 *                       xmm0 = haddpd(xmm0, xmm0)   ; lane0 := lo + hi*2^32
 *                     Bit-exact for every u64 (including values > 2^53, where
 *                     the double rounds — but the rounding is IEEE-round-to-
 *                     nearest-even, matching cvtsi2sd on the same value.)
 *   @0x5f0fc           xmm0 *= conversionRate.
 *   @0x5f104..0x5f10a  epilogue + retq (seconds in %xmm0).
 *   @0x5f10b..0x5f110  slow-path call + `jmp 0x5f0e3` to retry the fast body
 *                     (the retry SKIPS the cmpq check — see the note below).
 *
 * The retry-skip is intentional: after .cold.1 returns, `once == -1` is
 * guaranteed by GCD's contract, so re-checking would just refute; the compiler
 * elided the second cmpq. We faithfully mirror by unconditionally computing
 * the fast body after the slow-path call.
 */
export function convertHostTimeToSeconds(hostTime: bigint): number {
  // @0x5f0d9..0x5f0e1 — dispatch_once fast check.
  // GCD's convention: dispatch_once_t is 0 before the block runs and ~0L
  // (== -1) after it completes.
  if (bss.once.value !== -1n) {
    // @0x5f10b — call the cold slow path.
    //
    // The cold.1 body at ProCore 0xddba5 just tail-jmps
    //   _dispatch_once(&once, &___block_literal_global)
    // where the block descriptor's invoke slot points at
    //   convertHostTimeToSeconds_block_invoke.
    // We inline the equivalent call site here.
    gcd_dispatch_once(bss.once, convertHostTimeToSeconds_block_invoke);

    // Fall through to the fast body — @0x5f110 unconditionally jumps back to
    // @0x5f0e3.
  }

  // @0x5f0e3..0x5f0f8 — u64 -> double via SSE magic constants.
  // The bit-exact equivalent in TS uses BigInt for the u64 arithmetic:
  //   lo32 = (hostTime & 0xFFFFFFFF), hi32 = (hostTime >>> 32)
  //   (double)hostTime = lo32 + hi32 * 2^32
  // For hostTime <= 2^53, this is exact; for larger values, the addition
  // rounds to nearest-even, matching IEEE-754 semantics — which is exactly
  // what the SSE sequence produces (each half is an exact double; their sum
  // is one IEEE add).
  const lo32 = Number(hostTime & 0xFFFFFFFFn); // exact — <= 2^32-1
  const hi32 = Number((hostTime >> 32n) & 0xFFFFFFFFn); // exact — <= 2^32-1
  const hostTimeAsDouble = lo32 + hi32 * 4294967296.0; // = 2^32

  // @0x5f0fc — mulsd conversionRate.
  return hostTimeAsDouble * bss.conversionRate;
}
