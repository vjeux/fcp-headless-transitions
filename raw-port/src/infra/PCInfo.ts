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
  /** @ProCore 0x15ad34 — `s_workingGamma`, the file-static single-precision working
   *  gamma value read verbatim by getWorkingGamma() (`movss s_workingGamma(%rip),%xmm0`
   *  @0x15424). Initialised to 1.0f in the binary's __data (bytes 00 00 80 3f). Kept as a
   *  fround'd f32 per PORTING_SPEC Rule 4 (the read is a single-precision `movss`). */
  private static s_workingGamma = Math.fround(1.0);

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

  /** @ProCore __ZZN6PCInfo12getActiveCPUEvE9predicate — dispatch_once_t guard for
   *  getActiveCPU's static (BSS). 0 = not yet initialised; -1 = block has run
   *  (the fast-path sentinel compared at @0x14adc `cmpq $-0x1, predicate`). */
  private static getActiveCPU_predicate: { value: bigint } = { value: 0n };

  /** @ProCore __ZZN6PCInfo12getActiveCPUEvE9activecpu — cached active-CPU count
   *  (a signed int; the getter reads it with `movl` @0x14ae6). Written by the
   *  dispatch_once block; defaults to 1 on any query failure. */
  private static getActiveCPU_activecpu = 0;

  /**
   * The dispatch_once block `____ZN6PCInfo12getActiveCPUEv_block_invoke`
   * @ProCore 0x14af9. Disassembly
   * (raw-port/re/disasm/ProCore.____ZN6PCInfo12getActiveCPUEv_block_invoke.s):
   *
   *   0x14af9  pushq %rbp ; movq %rsp,%rbp ; subq $0x10,%rsp     ; frame
   *   0x14b01  leaq -0x8(%rbp),%rdx ; movq $0x4,(%rdx)           ; size_t oldlenp = 4
   *   0x14b0c  leaq "hw.activecpu"(%rip),%rdi                    ; name (@0x131b96)
   *   0x14b13  leaq activecpu(%rip),%rsi                         ; oldp = &activecpu
   *   0x14b1a  xorl %ecx,%ecx ; xorl %r8d,%r8d                   ; newp = NULL, newlen = 0
   *   0x14b1f  callq _sysctlbyname                               ; stub 0xdebbe
   *   0x14b24  testl %eax,%eax ; jne 0x14b38                     ; if r != 0 -> force 1
   *   0x14b28  cmpq $0x4,-0x8(%rbp) ; jne 0x14b38                ; if returned size != 4 -> force 1
   *   0x14b2f  cmpl $0x0, activecpu(%rip) ; jg 0x14b42           ; if activecpu > 0 keep, else...
   *   0x14b38  movl $0x1, activecpu(%rip)                        ; activecpu = 1
   *   0x14b42  addq $0x10,%rsp ; popq %rbp ; retq
   *
   * i.e. `size_t n = 4; if (sysctlbyname("hw.activecpu", &activecpu, &n, NULL, 0)
   * != 0 || n != 4 || activecpu <= 0) activecpu = 1;` — query the kernel for the
   * number of active CPUs; on any failure, unexpected width, or non-positive
   * value, clamp to 1 (there is always at least one CPU). The `jg` at @0x14b36 is
   * a SIGNED compare against 0 (`cmpl $0x0,activecpu; jg` = taken iff activecpu > 0).
   */
  private static getActiveCPU_block(): void {
    // @0x14b01..0x14b05 — size_t oldlenp = 4 (sizeof(int)).
    const oldlen = {
      _v: 4n,
      get(): bigint {
        return this._v;
      },
      set(v: bigint) {
        this._v = v;
      },
    };
    // @0x14b13 — oldp = &activecpu (4-byte int result buffer; sysctlbyname writes
    //   straight into the static in the binary).
    const result = new Uint8Array(4);
    // @0x14b0c..0x14b1f — r = sysctlbyname("hw.activecpu", &result, &oldlen, NULL, 0).
    //   name string @ProCore 0x131b96 = "hw.activecpu".
    const r = sysctlbyname("hw.activecpu", result, oldlen, null, 0);
    // The kernel writes a little-endian int32 into `result`; mirror the static read.
    const dv = new DataView(result.buffer, result.byteOffset, result.byteLength);
    const value = dv.getInt32(0, true); // native x86-64 little-endian int

    // @0x14b24..0x14b36 — keep only if (r == 0 && returned size == 4 && value > 0).
    if (r !== 0 || oldlen.get() !== 4n || value <= 0) {
      // @0x14b38 — activecpu = 1 on any failure / unexpected width / non-positive.
      PCInfo.getActiveCPU_activecpu = 1;
      return;
    }
    // @0x14b2f jg 0x14b42 (value > 0) — keep the queried value.
    PCInfo.getActiveCPU_activecpu = value | 0;
  }

  /**
   * `PCInfo::getActiveCPU() -> int` @ProCore 0x14adc
   * (__ZN6PCInfo12getActiveCPUEv).
   *
   * Returns the number of active CPUs, computed once and cached via dispatch_once.
   * Faithful transcription of the fast/slow split
   * (raw-port/re/disasm/ProCore.__ZN6PCInfo12getActiveCPUEv.s):
   *
   *   0x14adc  cmpq $-0x1, predicate(%rip)   ; already initialised?
   *   0x14ae4  jne  0x14aed                   ; no -> slow path (.cold.1)
   *   0x14ae6  movl activecpu(%rip),%eax      ; yes -> return cached int
   *   0x14aec  retq
   *   ; --- 0x14aed pushq %rbp ; movq %rsp,%rbp ---
   *   0x14af1  callq getActiveCPU.cold.1      ; .cold.1: dispatch_once(&predicate, block)
   *   0x14af6  popq %rbp ; jmp 0x14ae6         ; re-read the now-cached value
   *   ; --- .cold.1 @0xdd396 ---
   *   0xdd39a  leaq predicate(%rip),%rdi
   *   0xdd3a1  leaq ___block_literal_global.3(%rip),%rsi
   *   0xdd3a9  jmp  _dispatch_once            ; dispatch_once(&predicate, block)
   *
   * @returns The active-CPU count (int -> JS number). Always >= 1. The one-time
   *   init reaches the out-of-scope _sysctlbyname boundary (same policy as
   *   getCPUFrequency); a host that wires the probe fills the static, else the
   *   first call surfaces that boundary throw.
   */
  static getActiveCPU(): number {
    // @0x14adc..0x14ae4 — fast path: if predicate == -1 (initialised) skip init.
    if (PCInfo.getActiveCPU_predicate.value !== -1n) {
      // @0x14aed..0x14af6 — .cold.1: dispatch_once(&predicate, block), then re-read.
      dispatch_once(PCInfo.getActiveCPU_predicate, PCInfo.getActiveCPU_block);
    }
    // @0x14ae6..0x14aec — movl activecpu(%rip),%eax : return the cached int.
    return PCInfo.getActiveCPU_activecpu | 0;
  }

  /**
   * PCInfo::getWorkingGamma()
   * @0xADDR ProCore 0x0000000000015420  (__ZN6PCInfo15getWorkingGammaEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN6PCInfo15getWorkingGammaEv.s):
   *   0x015420  pushq %rbp ; movq %rsp,%rbp                    ; frame
   *   0x015424  movss __ZL14s_workingGamma(%rip),%xmm0         ; xmm0 = s_workingGamma (f32)
   *                                                            ;   @0x15ad34 (disp 0x145908)
   *   0x01542c  popq %rbp ; retq                               ; return the float
   *
   * A plain single-precision static accessor: returns the file-static `s_workingGamma`
   * (a `float`, value 1.0f — see the field above). Zero callees, no externs. The `movss`
   * is a 32-bit load, so the value is fround'd (Rule 4).
   */
  static getWorkingGamma(): number {
    // @0x015424 — movss s_workingGamma(%rip),%xmm0 : load the f32 static and return it.
    return Math.fround(PCInfo.s_workingGamma);
  }
}
