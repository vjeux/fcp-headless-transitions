// computePhysicalRAM — ProCore file-local free function that returns the
// host's installed physical RAM in bytes (fallback 4 GiB on failure).
//
// Ledger @ProCore:
//   computePhysicalRAM  @0x14c43   __ZL18computePhysicalRAMv   (internal linkage)
//
// FULL DISASM (raw-port/re/disasm/ProCore.__ZL18computePhysicalRAMv.s, 30 lines):
//
//   0x14c43  pushq %rbp
//   0x14c44  movq  %rsp, %rbp
//   0x14c47  subq  $0x20, %rsp                     ; 32-byte local frame
//   0x14c4b  movq  ___stack_chk_guard(%rip), %rax  ; stack canary load
//   0x14c52  movq  (%rax), %rax
//   0x14c55  movq  %rax, -0x8(%rbp)                ; frame canary slot
//   0x14c59  movabsq $0x1800000006, %rax           ; 64-bit immediate: two int32s packed as
//                                                    ; { 6, 24 } (little-endian: low dword=6=CTL_HW,
//                                                    ; high dword=24=HW_MEMSIZE). This IS the
//                                                    ; sysctl name-vector `int name[2] = {CTL_HW,HW_MEMSIZE}`.
//   0x14c63  leaq  -0x10(%rbp), %rdi               ; rdi = &name (arg1 -> sysctl)
//   0x14c67  movq  %rax, (%rdi)                    ; *name = {6, 24}
//   0x14c6a  leaq  -0x20(%rbp), %rcx               ; rcx = &oldlenp buffer
//   0x14c6e  movq  $0x8, (%rcx)                    ; *oldlenp = 8 (sizeof(uint64_t))
//   0x14c75  leaq  -0x18(%rbp), %rdx               ; rdx = &oldp   (result buffer, 8 bytes)
//   0x14c79  movl  $0x2, %esi                      ; esi = 2 (namelen)
//   0x14c7e  xorl  %r8d, %r8d                      ; r8  = 0 (newp = NULL)
//   0x14c81  xorl  %r9d, %r9d                      ; r9  = 0 (newlen = 0)
//   0x14c84  callq  _sysctl                        ; stub 0xdebb8
//                                                    ; sysctl(name, 2, &result, &size, NULL, 0)
//   0x14c89  testl %eax, %eax                      ; r = %eax; sysctl returns 0 on success
//   0x14c8b  jne   0x14c93                         ; if r != 0 -> fallback path
//   0x14c8d  movq  -0x18(%rbp), %rax               ; %rax = result buffer (the uint64_t RAM size)
//   0x14c91  jmp   0x14c9d                         ; -> canary-check + return
//   0x14c93  movabsq $0x100000000, %rax            ; fallback: 0x1_00000000 == 4 GiB
//   0x14c9d  movq  ___stack_chk_guard(%rip), %rcx  ; canary re-load
//   0x14ca4  movq  (%rcx), %rcx
//   0x14ca7  cmpq  -0x8(%rbp), %rcx                ; compare against saved canary
//   0x14cab  jne   0x14cb3                         ; if tampered -> __stack_chk_fail
//   0x14cad  addq  $0x20, %rsp                     ; epilogue
//   0x14cb1  popq  %rbp
//   0x14cb2  retq
//   0x14cb3  callq ___stack_chk_fail               ; stub 0xde744 (noreturn)
//
// SEMANTICS
//   `mib[2] = { CTL_HW, HW_MEMSIZE }; size_t sz = 8; uint64_t r;
//    if (sysctl(mib, 2, &r, &sz, NULL, 0) == 0) return r; else return 4 GiB;`
//   Standard Darwin idiom for "how much RAM does this box have". The result is
//   `hw.memsize` — the installed physical RAM in bytes, including memory reserved
//   by the OS/firmware. Uses the classic BSD sysctl(3) name-vector interface,
//   not the newer sysctlbyname("hw.memsize", …) form (which would have shown
//   `_sysctlbyname` instead of `_sysctl` in the stub — proof this is the older
//   MIB-style call).
//
// FRONTIER CALLEES
//   * _sysctl                — libc (POSIX). TRUE out-of-scope extern. Called @0x14c84
//                              via stub 0xdebb8. Signature:
//                                int sysctl(int *name, u_int namelen, void *oldp,
//                                           size_t *oldlenp, void *newp, size_t newlen)
//   * ___stack_chk_guard     — libc TLS/BSS symbol. Boilerplate stack canary — TRUE
//                              out-of-scope extern (SSP runtime; @0x14c4b + @0x14c9d).
//   * ___stack_chk_fail      — libc SSP fail path. TRUE out-of-scope extern (noreturn;
//                              stub 0xde744; only reached if the canary check trips,
//                              never in a well-behaved run).

/**
 * `sysctl(int *name, u_int namelen, void *oldp, size_t *oldlenp,
 *         void *newp, size_t newlen) -> int` — POSIX BSD sysctl(3) extern
 * (libc / Darwin kernel). Called from computePhysicalRAM @ProCore 0x14c84
 * via stub 0xdebb8. TRUE OUT-OF-SCOPE extern (Apple/BSD kernel syscall):
 * a JS runtime cannot query `hw.memsize` — there is no kernel to ask.
 * The extern is modelled as a boundary throw citing @0xADDR; callers that
 * need the RAM figure are expected to route through a higher-level host-
 * environment probe wired to the JS runtime's own memory API.
 *
 * @returns 0 on success (result written to `oldp`), non-zero on failure.
 *   The disasm branches on `testl %eax, %eax; jne fallback` — see @0x14c8b.
 */
function _sysctl(
  _name: Int32Array,
  _namelen: number,
  _oldp: BigInt64Array | Uint8Array,
  _oldlenp: { get(): bigint; set(v: bigint): void } | { size: bigint },
  _newp: null,
  _newlen: number,
): number {
  // @ProCore stub 0xdebb8 — sysctl (libc/Darwin kernel extern).
  throw new Error(
    "_sysctl (libc/Darwin kernel extern) not modelled in this port — called " +
      "from computePhysicalRAM @ProCore 0x14c84 via stub 0xdebb8. TRUE " +
      "out-of-scope extern (Darwin kernel syscall). Route physical-RAM queries " +
      "through a host-environment probe wired to the JS runtime instead.",
  );
}

/**
 * `computePhysicalRAM() -> uint64_t` @ProCore 0x14c43
 *   __ZL18computePhysicalRAMv  (file-local; internal linkage in the binary).
 *
 * Returns the host's installed physical RAM in bytes, via the classic BSD
 * sysctl(2) name-vector `{ CTL_HW, HW_MEMSIZE }`. On any sysctl failure,
 * returns 4 GiB (0x1_0000_0000) as a fixed fallback — a conservative floor
 * so callers dividing by this value never see zero.
 *
 * @returns The installed physical RAM in bytes (uint64_t → JS bigint), or
 *   4 GiB (0x1_0000_0000n) if the sysctl(2) call fails.
 *
 * Line-for-line correspondence to the disasm quoted in the file header:
 *
 *   - @0x14c47..0x14c55 : local frame + stack canary — no JS effect (SSP is
 *     a compile-time protection against C stack smashing; JS has no raw stack).
 *   - @0x14c59..0x14c67 : construct `int name[2] = { 6, 24 }` (CTL_HW=6,
 *     HW_MEMSIZE=24). The 0x1800000006 movabsq packs both int32s as one qword.
 *   - @0x14c6a..0x14c6e : `size_t oldlenp = 8` (result buffer capacity).
 *   - @0x14c75          : oldp = &result   (uninitialised 8-byte slot).
 *   - @0x14c79..0x14c81 : namelen=2, newp=NULL, newlen=0.
 *   - @0x14c84          : call sysctl(name,2,&result,&oldlenp,NULL,0).
 *   - @0x14c89..0x14c8b : `if (r != 0) goto fallback`.
 *   - @0x14c8d..0x14c91 : success — %rax = *(u64*)&result   -> return path.
 *   - @0x14c93          : fallback — %rax = 0x100000000 (4 GiB)  -> return path.
 *   - @0x14c9d..0x14cb2 : canary check + epilogue + retq (no JS effect).
 *   - @0x14cb3          : __stack_chk_fail (unreachable on canary intact).
 */
export function computePhysicalRAM(): bigint {
  // @0x14c47..0x14c55 — local frame + stack canary load (no JS effect).

  // @0x14c59..0x14c67 — `int name[2] = { CTL_HW=6, HW_MEMSIZE=24 };`
  //   The disasm packs both ints into one 64-bit immediate 0x1800000006:
  //     low  dword = 0x00000006 = CTL_HW
  //     high dword = 0x00000018 = HW_MEMSIZE (24)
  const name = new Int32Array(2);
  name[0] = 6; // CTL_HW      @0x14c59 low  dword of 0x1800000006
  name[1] = 24; // HW_MEMSIZE  @0x14c59 high dword of 0x1800000006

  // @0x14c6a..0x14c6e — `size_t oldlenp = 8;`
  const oldlenp = { size: 8n };

  // @0x14c75 — `uint64_t result;` (uninitialised 8-byte slot; sysctl writes it on success).
  const result = new BigInt64Array(1);

  // @0x14c79..0x14c84 — `int r = sysctl(name, 2, &result, &oldlenp, NULL, 0);`
  //                     (namelen=2 @esi, newp=NULL @r8, newlen=0 @r9)
  const r = _sysctl(name, 2, result, oldlenp, null, 0);

  // @0x14c89..0x14c8b — `if (r != 0) goto fallback;`
  if (r !== 0) {
    // @0x14c93 — fallback: return 0x100000000 (4 GiB).
    //   The exact fallback constant is `movabsq $0x100000000, %rax` — a
    //   full 64-bit value; JS bigint literal preserves it exactly.
    return 0x100000000n;
  }
  // @0x14c8d..0x14c91 — success: return the value sysctl wrote into `result`.
  return result[0]!;
}
