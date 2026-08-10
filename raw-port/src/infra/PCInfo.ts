// PCInfo — ProCore host-information helpers. This file ports ONLY
//   PCInfo::getCPUFrequency()  @ProCore 0x14b48  (__ZN6PCInfo15getCPUFrequencyEv)
// plus its dispatch_once init block. Sibling PCInfo statics
// (texturesShouldUseQuarterRes, getPhysicalRAM, availableVRAM, …) are separate
// ledger units and will be ADDED here when their units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted
//             VAs from `otool -tV` / `llvm-objdump`).
//
// Disassembly sources:
//   raw-port/re/disasm/ProCore.__ZN6PCInfo15getCPUFrequencyEv.s        (10 lines)
//   raw-port/re/disasm/ProCore.__ZN6PCInfo15getCPUFrequencyEvcold1.s   (7 lines, the .cold.1)
//   the dispatch_once block invoke @ProCore 0x14b66 (____ZN6PCInfo15getCPUFrequencyEv_block_invoke,
//     re-derived with llvm-objdump — see the getCPUFrequency doc comment).
//
// -----------------------------------------------------------------------------
// STATIC STATE (function-local statics; Meyers-singleton / dispatch_once style)
// -----------------------------------------------------------------------------
//   __ZZN6PCInfo15getCPUFrequencyEvE9predicate    @ProCore 0x15b240 (BSS, dispatch_once_t)
//   __ZZN6PCInfo15getCPUFrequencyEvE12cpufrequency @ProCore 0x15b248 (BSS, uint64_t Hz)
//
// The getter is the classic clang lowering of a function-local static
// initialised via `dispatch_once`:
//   - fast path: if predicate == -1 (already run), return the cached cpufrequency;
//   - slow path (.cold.1): dispatch_once(&predicate, ^block), then re-read the
//     cached value. The block queries hw.cpufrequency via sysctlbyname.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _dispatch_once   — libdispatch (GCD). TRUE out-of-scope extern. Tail-called
//                        from .cold.1 @ProCore 0xdd3c1 via stub 0xde810. Runs the
//                        block exactly once and flips predicate to -1.
//   * _sysctlbyname    — libSystem (Darwin). TRUE out-of-scope extern. Called from
//                        the block @ProCore 0x14b8c via stub 0xdebbe. A JS runtime
//                        has no kernel to answer "hw.cpufrequency", so it is a
//                        boundary throw (same policy as computePhysicalRAM._sysctl
//                        and HGCPUComputeDevice.sysctlbyname).

/**
 * `sysctlbyname(const char *name, void *oldp, size_t *oldlenp, void *newp,
 *  size_t newlen) -> int` — libSystem / Darwin BSD system-info extern. Called
 * from the getCPUFrequency dispatch_once block @ProCore 0x14b8c via stub
 * 0xdebbe. TRUE OUT-OF-SCOPE extern: a JS runtime cannot query the kernel's
 * `hw.cpufrequency`. Modelled as a boundary throw citing @0xADDR (identical
 * policy to computePhysicalRAM._sysctl and HGCPUComputeDevice.sysctlbyname).
 *
 * @returns 0 on success (result written to `oldp`, actual size to `*oldlenp`),
 *   non-zero on failure. The block branches on `testl %eax,%eax` @0x14b91.
 */
function sysctlbyname(
  _name: string,
  _oldp: BigInt64Array | Uint8Array,
  _oldlenp: { get(): bigint; set(v: bigint): void },
  _newp: null,
  _newlen: number,
): number {
  // @ProCore stub 0xdebbe — sysctlbyname (libSystem/Darwin kernel extern).
  throw new Error(
    "sysctlbyname (libSystem/Darwin kernel extern) not modelled in this port — " +
      "called from PCInfo::getCPUFrequency dispatch_once block @ProCore 0x14b8c " +
      "via stub 0xdebbe. TRUE out-of-scope extern (Darwin kernel syscall). " +
      'Route "hw.cpufrequency" queries through a host-environment probe wired ' +
      "to the JS runtime instead.",
  );
}

/**
 * `dispatch_once(dispatch_once_t *predicate, dispatch_block_t block)` —
 * libdispatch (GCD) extern. Tail-called from PCInfo::getCPUFrequency.cold.1
 * @ProCore 0xdd3c1 via stub 0xde810. TRUE OUT-OF-SCOPE extern. Semantics:
 * runs `block` exactly once across the process (the first caller to observe
 * `*predicate == 0` runs it; others block until it completes), then leaves
 * `*predicate == -1` (the "done" sentinel the fast path compares against).
 *
 * The faithful surrogate below implements the observable once-semantics in JS
 * (single-threaded, so no locking is needed): if the predicate is not yet the
 * -1 sentinel, run the block and set it to -1; otherwise do nothing. This
 * mirrors exactly what the fast path @0x14b48 depends on.
 */
function dispatch_once(
  predicate: { value: bigint },
  block: () => void,
): void {
  // @ProCore stub 0xde810 — dispatch_once (GCD). The getter's fast path
  // compares predicate against -1 (`cmpq $-0x1, predicate`), so the "done"
  // sentinel is -1n; run the block exactly once and flip to -1n.
  if (predicate.value !== -1n) {
    block();
    predicate.value = -1n;
  }
}

/**
 * `PCInfo` — ProCore host-information namespace class. Only the CPU-frequency
 * getter (and its dispatch_once init state) is ported in this file.
 */
export class PCInfo {
  /** @ProCore 0x15b240 — dispatch_once_t guard for getCPUFrequency's static.
   *  0 = not yet initialised; -1 = block has run (fast-path sentinel). */
  private static getCPUFrequency_predicate: { value: bigint } = { value: 0n };

  /** @ProCore 0x15b248 — cached CPU frequency in Hz (uint64_t). Written by the
   *  dispatch_once block; read by the fast path. 0 if sysctlbyname failed. */
  private static getCPUFrequency_cpufrequency = 0n;

  /**
   * The dispatch_once block `____ZN6PCInfo15getCPUFrequencyEv_block_invoke`
   * @ProCore 0x14b66. Re-derived (llvm-objdump):
   *
   *   0x14b66  pushq %rbp ; movq %rsp,%rbp ; subq $0x10,%rsp    ; frame
   *   0x14b6e  leaq -0x8(%rbp),%rdx ; movq $0x8,(%rdx)          ; size_t oldlenp = 8
   *   0x14b79  leaq "hw.cpufrequency"(%rip),%rdi                ; name  (@0x1315a3)
   *   0x14b80  leaq cpufrequency(%rip),%rsi                     ; oldp = &cpufrequency (@0x15b248)
   *   0x14b87  xorl %ecx,%ecx ; xorl %r8d,%r8d                  ; newp = NULL, newlen = 0
   *   0x14b8c  callq _sysctlbyname                              ; stub 0xdebbe
   *   0x14b91  testl %eax,%eax ; jne 0x14b9c                    ; if r != 0 -> zero out
   *   0x14b95  cmpq $0x8,-0x8(%rbp) ; je 0x14ba7                ; if returned size == 8 -> keep
   *   0x14b9c  movq $0x0, cpufrequency(%rip)                    ; else cpufrequency = 0
   *   0x14ba7  addq $0x10,%rsp ; popq %rbp ; retq
   *
   * i.e. `size_t n = 8; if (sysctlbyname("hw.cpufrequency", &cpufrequency, &n,
   * NULL, 0) != 0 || n != 8) cpufrequency = 0;` — query the kernel for the CPU
   * clock; on any failure or unexpected width, leave it zero.
   */
  private static getCPUFrequency_block(): void {
    // @0x14b6e..0x14b72 — size_t oldlenp = 8 (sizeof(uint64_t)).
    const oldlen = { _v: 8n, get(): bigint { return this._v; }, set(v: bigint) { this._v = v; } };
    // @0x14b80 — oldp = &cpufrequency (8-byte result buffer).
    const result = new BigInt64Array(1);
    // @0x14b79..0x14b8c — r = sysctlbyname("hw.cpufrequency", &result, &oldlen, NULL, 0).
    //   name string @ProCore 0x1315a3 = "hw.cpufrequency".
    const r = sysctlbyname("hw.cpufrequency", result, oldlen, null, 0);
    // @0x14b91..0x14b9a — success iff (r == 0 && returned size == 8).
    if (r !== 0 || oldlen.get() !== 8n) {
      // @0x14b9c — cpufrequency = 0 on any failure / unexpected width.
      PCInfo.getCPUFrequency_cpufrequency = 0n;
      return;
    }
    // otherwise the value sysctlbyname wrote into `result` IS the cached freq
    // (in the binary sysctlbyname writes straight into the static @0x15b248).
    PCInfo.getCPUFrequency_cpufrequency = BigInt.asUintN(64, result[0]!);
  }

  /**
   * `PCInfo::getCPUFrequency() -> uint64_t` @ProCore 0x14b48
   * (__ZN6PCInfo15getCPUFrequencyEv).
   *
   * Returns the host CPU clock frequency in Hz, computed once and cached via
   * dispatch_once. Faithful transcription of the fast/slow split:
   *
   *   0x14b48  cmpq $-0x1, predicate(%rip)   ; already initialised?
   *   0x14b50  jne  0x14b5a                   ; no -> slow path (.cold.1)
   *   0x14b52  movq cpufrequency(%rip),%rax   ; yes -> return cached value
   *   0x14b59  retq
   *   ; --- .cold.1 @0xdd3ae ---
   *   0xdd3b2  leaq predicate(%rip),%rdi
   *   0xdd3b9  leaq ___block_literal_global.6(%rip),%rsi
   *   0xdd3c1  jmp  _dispatch_once            ; dispatch_once(&predicate, block)
   *   ; then falls back to 0x14b52 to re-read the now-cached value.
   *
   * @returns The CPU frequency in Hz (uint64_t -> JS bigint). 0 if the
   *   underlying sysctlbyname query failed. (In this port sysctlbyname is an
   *   out-of-scope boundary throw, so on a host without the probe wired the
   *   first call surfaces that boundary — exactly as computePhysicalRAM does.)
   */
  static getCPUFrequency(): bigint {
    // @0x14b48..0x14b50 — fast path: if predicate == -1 (initialised) skip init.
    if (PCInfo.getCPUFrequency_predicate.value !== -1n) {
      // @0x14b5a..0x14b63 — .cold.1: dispatch_once(&predicate, block).
      dispatch_once(PCInfo.getCPUFrequency_predicate, PCInfo.getCPUFrequency_block);
      // @0x14b64 — jmp 0x14b52 : fall through to the cached-value read.
    }
    // @0x14b52..0x14b59 — return the cached cpufrequency.
    return PCInfo.getCPUFrequency_cpufrequency;
  }
}
