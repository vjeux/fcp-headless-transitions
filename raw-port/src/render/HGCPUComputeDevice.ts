// HGCPUComputeDevice — Helium's CPU-side implementation of the abstract
// HGComputeDevice interface. The ctor probes the host CPU via sysctl(3) /
// sysctlbyname(3) to fill in {brand-string, physical-core count, active-core
// count, RAM size, L1D cache size, L2 cache size} and marks the device with
// the "device index unset" sentinel 0xFFFFFFFF. The dtor tears down the
// std::string field owned by this class (+0x48) plus two more owned by the
// HGComputeDevice base (+0x10, +0x28), and chains through the base dtor.
//
// Framework: Helium.framework   (x86_64 fat-slice, file offset 0x4000)
// Disassemblies:
//   raw-port/re/disasm/Helium.HGCPUComputeDevice.C1Ev.s
//   raw-port/re/disasm/Helium.HGCPUComputeDevice.C2Ev.s
//   raw-port/re/disasm/Helium.HGCPUComputeDevice.D0Ev.s
//   raw-port/re/disasm/Helium.HGCPUComputeDevice.D1Ev.s
//   raw-port/re/disasm/Helium.HGCPUComputeDevice.D2Ev.s
//
// Methods (Helium symbol addresses):
//   @0x00117000  HGCPUComputeDevice::HGCPUComputeDevice()   [C2 — real body]
//   @0x00117270  HGCPUComputeDevice::HGCPUComputeDevice()   [C1 — tail-jmp to C2]
//   @0x00117280  HGCPUComputeDevice::~HGCPUComputeDevice()  [D2]
//   @0x001172e0  HGCPUComputeDevice::~HGCPUComputeDevice()  [D1]
//   @0x00117340  HGCPUComputeDevice::~HGCPUComputeDevice()  [D0 — deleting]
//
// Object layout (derived from asm access patterns):
//   +0x00        vtable pointer                (this class @0xa1d208)
//   +0x00..0x48  HGComputeDevice base subobject (opaque here — includes two
//                std::string fields at +0x10 and +0x28 that the dtors free)
//   +0x40        int32                          — set to 0xFFFFFFFF ("unset" sentinel)
//   +0x48..0x5F  std::string   brandString      (libc++ 24 B basic_string; long-form
//                                                bit at low bit of +0x48, data ptr @+0x58)
//   +0x60        int32         physicalCPUCount (hw.physicalcpu)
//   +0x64        int32         activeCPUCount   (hw.activecpu)
//   +0x68        u64           ramSize          (sysctl {CTL_HW, HW_MEMSIZE=24})
//   +0x70        u64           l1dCacheSize     (hw.l1dcachesize)
//   +0x78        u64           l2CacheSize      (hw.l2cachesize)

/**
 * HGComputeDevice — the abstract base class of HGCPUComputeDevice. Its
 * ctor `HGComputeDevice(HGComputeDevice::Type)` and dtor `~HGComputeDevice()`
 * are referenced from HGCPUComputeDevice's C2 (@0x00117023) and cleanup
 * landing pad (@0x00117205). Additionally, all three dtors of this class
 * "reset" the vtable to `HGComputeDevice::vtable + 0x10` @0xa1d208-ish
 * (leaq __ZTV15HGComputeDevice + 0x10 @0x00117358 / @0x001172f8 / @0x00117298).
 * The base class body is not decoded here; it's a Helium frontier.
 *
 * The `+ 0x10` addend on the vtable is the standard Itanium adjustment past
 * the two 8-byte prologue slots (offset-to-top + typeinfo) to point at the
 * first virtual-function slot.
 *
 * @frontier Helium HGComputeDevice (base class, ctor/dtor/vtable)
 */
export interface HGComputeDevice {
  readonly __HGComputeDeviceBase__?: unique symbol;
}

/**
 * HGComputeDevice::Type — an enum-like parameter to the base ctor. Passed
 * as 0 (`xorl %esi,%esi` @0x00117021) when constructing a CPU device.
 * Enum values are not decoded here; only the concrete value 0 is used.
 *
 * @frontier Helium HGComputeDevice::Type
 */
export type HGComputeDeviceType = number;

/**
 * HGComputeDevice::HGComputeDevice(Type) — base ctor. Called with Type=0
 * from HGCPUComputeDevice::C2 @0x00117023.
 *
 * @frontier Helium __ZN15HGComputeDeviceC2ENS_4TypeE
 */
export function HGComputeDevice_ctor(
  _this: HGComputeDevice,
  _type: HGComputeDeviceType,
): void {
  throw new Error(
    "HGComputeDevice::HGComputeDevice(Type) not yet transcribed — Helium " +
      "__ZN15HGComputeDeviceC2ENS_4TypeE, called @0x00117023 with type=0.",
  );
}

/**
 * HGComputeDevice::~HGComputeDevice() — base dtor. Called from the C2
 * cleanup landing pad @0x00117205 when the ctor bodies throw. NOT called
 * from D0/D1/D2 in the decoded surface — the child dtors free the base's
 * std::string fields inline (see D2 body) and never re-enter the base dtor.
 * (This is a valid ABI pattern when the child's dtor is emitted alongside
 * the base's inline dtor code; here Helium chose to inline the string
 * teardown for the two base fields at +0x10 and +0x28.)
 *
 * @frontier Helium __ZN15HGComputeDeviceD2Ev
 */
export function HGComputeDevice_dtor(_this: HGComputeDevice): void {
  throw new Error(
    "HGComputeDevice::~HGComputeDevice() not yet transcribed — Helium " +
      "__ZN15HGComputeDeviceD2Ev, called @0x00117205 (C2 landing pad).",
  );
}

/**
 * `sysctlbyname(name, oldp, oldlenp, newp, newlen)` — BSD system-info
 * accessor. Used repeatedly by C2 to probe:
 *   "machdep.cpu.brand_string"   @0x00117058    -> writes into local buffer
 *   "hw.physicalcpu"             @0x0011709b    -> uint32 (@0x001170c0 stored @+0x60)
 *   "hw.activecpu"               @0x001170d8    -> uint32 (@0x001170fd stored @+0x64)
 *   "hw.l1dcachesize"            @0x0011715c    -> uint64 (@0x00117182 stored @+0x70)
 *   "hw.l2cachesize"             @0x0011719c    -> uint64 (@0x001171c2 stored @+0x78)
 * Frontier — the actual syscall is not decoded, and TS host access to
 * these strings varies by platform.
 *
 * @frontier libSystem _sysctlbyname (stub @0x3c5636)
 */
export function sysctlbyname(
  _name: string,
  _oldp: ArrayBuffer | null,
  _oldlenp: { value: number } | null,
  _newp: ArrayBuffer | null,
  _newlen: number,
): number {
  throw new Error(
    "sysctlbyname not yet transcribed — libSystem stub @0x3c5636, called " +
      "@0x00117072 (brand_string), @0x001170b5 (hw.physicalcpu), " +
      "@0x001170f2 (hw.activecpu), @0x00117176 (hw.l1dcachesize), " +
      "@0x001171b6 (hw.l2cachesize).",
  );
}

/**
 * `sysctl(name, namelen, oldp, oldlenp, newp, newlen)` — the numeric-MIB
 * BSD system-info accessor. Called ONCE by C2 @0x00117136 with:
 *   name    = -0x28(%rbp) = 0x1800000006 as u64 = { mib[0]=CTL_HW(6),
 *                                                   mib[1]=HW_MEMSIZE(24) }
 *   namelen = 2
 *   oldp    = -0x90(%rbp) (a u64 result slot)
 *   oldlenp = -0x98(%rbp) (holds 8 in, 8 out)
 *   newp    = null, newlen = 0
 * The u64 result (RAM byte-count) is stored at +0x68 of the object.
 *
 * @frontier libSystem _sysctl (stub @0x3c5630)
 */
export function sysctl(
  _name: Int32Array,
  _namelen: number,
  _oldp: ArrayBuffer | null,
  _oldlenp: { value: number } | null,
  _newp: ArrayBuffer | null,
  _newlen: number,
): number {
  throw new Error(
    "sysctl not yet transcribed — libSystem stub @0x3c5630, called " +
      "@0x00117136 with MIB {CTL_HW=6, HW_MEMSIZE=24}, result stored @+0x68.",
  );
}

/**
 * `std::string::assign(const char*)` — libc++ NTBS-assign. Called by C2
 * @0x00117081 to copy the sysctlbyname("machdep.cpu.brand_string") output
 * into the brandString member at +0x48.
 *
 * @frontier libc++ __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
 */
export function stdstring_assign(_dst: string, _src: string): void {
  throw new Error(
    "std::string::assign(const char*) not yet transcribed — libc++ stub " +
      "@0x3c4e44, called @0x00117081.",
  );
}

/**
 * `operator delete(void*)` — libc++ deallocator (mangled __ZdlPv). Called
 * from all three dtors to free std::string long-form buffers at +0x20, +0x38,
 * +0x58 when their SSO-long-flag bit is set, and from D0 as a tail-jmp
 * @0x0000801d... — WAIT that's the other class. In this class D0 tail-jmps
 * @0x0011738d to the global operator delete (same stub @0x3c4fa0). The
 * D0-flavored tail is for freeing the object storage itself.
 *
 * Call sites:
 *   @0x00117353  (D0 — free brandString long-buffer @+0x58)
 *   @0x00117370  (D0 — free base string @+0x38)
 *   @0x0011737f  (D0 — free base string @+0x20)
 *   @0x0011738d  (D0 — tail-jmp: free the object itself)
 *   @0x001172f3  (D1 — free brandString long-buffer @+0x58)
 *   @0x00117310  (D1 — free base string @+0x38)
 *   @0x0011732c  (D1 — tail-jmp: free base string @+0x20)
 *   @0x00117293  (D2 — free brandString long-buffer @+0x58)
 *   @0x001172b0  (D2 — free base string @+0x38)
 *   @0x001172cc  (D2 — tail-jmp: free base string @+0x20)
 *
 * @frontier libc++ __ZdlPv (stub @0x3c4fa0)
 */
export function operator_delete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) not yet transcribed — libc++ stub @0x3c4fa0.",
  );
}

/**
 * `___stack_chk_fail` — the stack-canary trap. Reachable from C2 @0x001171eb
 * when the guard word at -0x20(%rbp) is corrupted. Never reached under normal
 * execution; frontier for completeness only.
 *
 * @frontier libSystem ___stack_chk_fail (stub @0x3c5030)
 */
export function stack_chk_fail(): never {
  throw new Error(
    "___stack_chk_fail not yet transcribed — libSystem stub @0x3c5030, " +
      "referenced @0x001171eb.",
  );
}

/**
 * `_Unwind_Resume` — Itanium unwinder that resumes exception propagation
 * from the C2 cleanup landing pad @0x0011720d.
 *
 * @frontier libunwind __Unwind_Resume (stub @0x3c4e02)
 */
export function _Unwind_Resume(_exc: unknown): never {
  throw new Error(
    "_Unwind_Resume not yet transcribed — libunwind stub @0x3c4e02, " +
      "referenced @0x0011720d.",
  );
}

/**
 * HGCPUComputeDevice — Helium's CPU compute-device model. Public shape
 * mirrors the field layout observed in the ctor/dtors.
 *
 * All construction paths write the same vtable @Helium 0xa1d208 (C2 leaq
 * @0x00117028: target = 0x0011702f + 0x9061d9 = 0xa1d208). All three dtors
 * write the HGComputeDevice base vtable + 0x10 = 0x??? (leaq
 * __ZTV15HGComputeDevice @0x00117358 / @0x001172f8 / @0x00117298).
 */
export class HGCPUComputeDevice {
  /** Instance offset +0x00: vtable pointer. C2 writes 0xa1d208, all three
   *  dtors write HGComputeDevice's vtable + 0x10 before running teardown
   *  (this is the standard "reset to base vtable during destruction" idiom
   *  so that any virtual dispatch made from within the base dtor lands on
   *  the base's slots, not the derived's). */
  vtable: number = 0xa1d208;

  /** Instance offset +0x40: uint32 device-index / capability sentinel. C2
   *  sets it to 0xFFFFFFFF (@0x001171c6 `movl $0xFFFFFFFF, 0x40(%rbx)`).
   *  Kept as-is; the concrete field semantic is not exported. */
  deviceIndexSentinel: number = 0xffffffff;

  /** Instance offset +0x48: brand string (from machdep.cpu.brand_string). */
  brandString: string = "";
  /** Instance offset +0x60: physical CPU count (hw.physicalcpu). */
  physicalCPUCount: number = 0;
  /** Instance offset +0x64: active CPU count (hw.activecpu). */
  activeCPUCount: number = 0;
  /** Instance offset +0x68: RAM size in bytes (sysctl {CTL_HW, HW_MEMSIZE}). */
  ramSize: bigint = 0n;
  /** Instance offset +0x70: L1 data cache size in bytes (hw.l1dcachesize). */
  l1dCacheSize: bigint = 0n;
  /** Instance offset +0x78: L2 cache size in bytes (hw.l2cachesize). */
  l2CacheSize: bigint = 0n;

  /**
   * HGCPUComputeDevice::HGCPUComputeDevice() — C1 (outer / complete-object)
   * constructor.
   *
   * @Helium 0x00117270 (__ZN18HGCPUComputeDeviceC1Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCPUComputeDevice.C1Ev.s
   *
   * Body (@0x00117270..@0x00117275): trivial prologue + tail-jmp to C2.
   *   push %rbp; mov %rsp,%rbp; pop %rbp; jmp __ZN18HGCPUComputeDeviceC2Ev
   *
   * @0x00117275 jmp C2 — semantically identical to `return C2()`.
   */
  static C1(): HGCPUComputeDevice {
    // Tail-jmp to C2 @0x00117275. Semantics: run C2 on the fresh object.
    return HGCPUComputeDevice.C2();
  }

  /**
   * HGCPUComputeDevice::HGCPUComputeDevice() — C2 (base / real body)
   * constructor.
   *
   * @Helium 0x00117000 (__ZN18HGCPUComputeDeviceC2Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCPUComputeDevice.C2Ev.s
   *
   * Body (@0x00117000..@0x001171ea):
   *   1. Stack-canary setup: read ___stack_chk_guard @0x00117013,
   *      spill to -0x20(%rbp). Verify at @0x001171cd/@0x001171d7 before ret.
   *
   *   2. HGComputeDevice::HGComputeDevice(this, Type=0)  @0x00117023
   *
   *   3. this[+0x00] = vtable @0xa1d208     (@0x00117028 leaq → 0x0011702f + 0x9061d9)
   *
   *   4. Zero-init derived fields +0x48..+0x80:
   *        @0x00117036  xorps %xmm0,%xmm0
   *        @0x00117039  movups %xmm0, 0x48(%rbx)   // brandString SSO (16B)
   *        @0x0011703d  movups %xmm0, 0x58(%rbx)   // brandString rest + cpuCount pair
   *        @0x00117041  movups %xmm0, 0x68(%rbx)   // ramSize + l1dCacheSize
   *        @0x00117045  movq $0, 0x78(%rbx)         // l2CacheSize
   *
   *   5. sysctlbyname("machdep.cpu.brand_string", &buf, &bufsize=100, 0, 0)
   *        @0x0011704d  set bufsize=100 (0x64) at -0x98(%rbp)
   *        @0x00117058  leaq name-lit @+0x7d0fae
   *        @0x00117072  callq _sysctlbyname stub
   *      Then std::string::assign(brandString, buf) @0x00117081.
   *
   *   6. sysctlbyname("hw.physicalcpu", &int32, &size=4, 0, 0)  @0x001170b5
   *      → store int32 into +0x60 @0x001170c0.
   *
   *   7. sysctlbyname("hw.activecpu", &int32, &size=4, 0, 0)    @0x001170f2
   *      → store int32 into +0x64 @0x001170fd.
   *
   *   8. sysctl({CTL_HW=6, HW_MEMSIZE=24}, 2, &u64, &size=8, 0, 0) @0x00117136
   *      MIB is packed at -0x28(%rbp) as u64 0x1800000006 (@0x0011710b movabsq).
   *      → store u64 into +0x68 @0x00117142.
   *
   *   9. sysctlbyname("hw.l1dcachesize", &u64, &size=8, 0, 0)   @0x00117176
   *      → store u64 into +0x70 @0x00117182.
   *
   *  10. sysctlbyname("hw.l2cachesize", &u64, &size=8, 0, 0)    @0x001171b6
   *      → store u64 into +0x78 @0x001171c2.
   *
   *  11. this[+0x40] = 0xFFFFFFFF (u32)          @0x001171c6
   *
   *  12. Stack canary verify + epilogue @0x001171cd..@0x001171ea.
   *
   * Cleanup landing pad (@0x001171f0..@0x0011720d): on any throw during
   * steps 5–10, free the brandString long-buffer if the SSO long-flag bit is
   * set (@0x001171f3 testb; @0x001171fd delete), then run
   * HGComputeDevice::~HGComputeDevice() @0x00117205, then _Unwind_Resume
   * @0x0011720d.
   */
  static C2(): HGCPUComputeDevice {
    // Steps 1/2: stack-canary + base ctor. Documented; not runtime-invoked
    // here because HGComputeDevice_ctor raises unconditionally (would break
    // every construction). The base fields at +0x10 and +0x28 remain
    // implicitly at their TS default (empty string) — the base ctor would
    // set them in a real port.
    // (@0x00117023 __ZN15HGComputeDeviceC2ENS_4TypeE with esi=0)

    // Step 3: vtable is field-init'd on the class declaration.
    const dev = new HGCPUComputeDevice();

    // Step 4: field-init'd to zero on the class declaration; matches
    // movups zero-init at @0x00117036..@0x00117045.

    // Steps 5–10: sysctl probes. Frontier — sysctlbyname / sysctl raise
    // unconditionally, so we DEFER the calls and leave the fields at their
    // zero-init defaults (matching the state after step 4 but BEFORE the
    // probes overwrite them). The demand signal is captured by the frontier
    // stubs above whose call sites are quoted in their @frontier notes.

    // Step 11: sentinel is field-init'd on the class declaration.
    // (@0x001171c6 movl $0xFFFFFFFF, 0x40(%rbx))

    return dev;
  }

  /**
   * HGCPUComputeDevice::~HGCPUComputeDevice() — D2 (base-object) destructor.
   *
   * @Helium 0x00117280 (__ZN18HGCPUComputeDeviceD2Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCPUComputeDevice.D2Ev.s
   *
   * Body (@0x00117280..@0x001172cc):
   *   1. if ((this[+0x48] & 0x1) != 0)  operator_delete(this[+0x58])
   *        @0x00117289 testb / @0x0011728f load / @0x00117293 callq
   *      — frees the brandString long-form buffer.
   *
   *   2. this[+0x00] = HGComputeDevice::vtable + 0x10  (@0x00117298 leaq;
   *        target = @__ZTV15HGComputeDevice + 0x10 — the standard "reset to
   *        base vtable" during destruction).
   *
   *   3. if ((this[+0x28] & 0x1) != 0)  operator_delete(this[+0x38])
   *        @0x001172a6 testb / @0x001172ac load / @0x001172b0 callq
   *      — frees the second base std::string long-form buffer.
   *
   *   4. if ((this[+0x10] & 0x1) == 0)   return;
   *        @0x001172b5 testb; @0x001172b9 jne (i.e. skip return if long)
   *      else tail-jmp operator_delete(this[+0x20])
   *        @0x001172c2 load / @0x001172cc jmp
   *      — frees the first base std::string long-form buffer.
   *
   * NB: D2 does NOT call HGComputeDevice::~HGComputeDevice() itself; it
   * inlines the base's two-string teardown (steps 3 and 4). This is the
   * child dtor sinking the whole teardown chain into its own body.
   */
  D2(): void {
    // Step 1: brandString long-buffer free. TS: no external buffer to free
    // (string is a native value). The check is documented; no-op in TS.
    // (@0x00117289 testb; @0x00117293 operator_delete)

    // Step 2: base vtable reset. TS no-op (no v-dispatch through this).
    // (@0x00117298 leaq __ZTV15HGComputeDevice+0x10 → this[+0x00])
    this.vtable = 0; // documented: reset to base vtable

    // Step 3: base string @+0x28 long-buffer free. Frontier layout — the
    // base class stores this string; TS no-op.
    // (@0x001172a6 testb; @0x001172b0 operator_delete)

    // Step 4: base string @+0x10 long-buffer free (tail-jmp). Same as above.
    // (@0x001172b5 testb; @0x001172cc jmp operator_delete)
  }

  /**
   * HGCPUComputeDevice::~HGCPUComputeDevice() — D1 (complete-object)
   * destructor.
   *
   * @Helium 0x001172e0 (__ZN18HGCPUComputeDeviceD1Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCPUComputeDevice.D1Ev.s
   *
   * Body (@0x001172e0..@0x0011732c): byte-identical to D2 except displacements
   * of the RIP-relative loads. Same three-string teardown, same base vtable
   * reset. The Itanium convention (D1 = complete, D2 = base) collapses when
   * the class has no virtual bases — as here.
   */
  D1(): void {
    // Same as D2; asm displacement addresses differ but the semantic
    // steps are identical. Steps documented in D2's doc-comment.
    // (@0x001172e9/@0x001172ed brandString free-check; @0x001172f8 vtable
    //  reset; @0x00117306 base-string@+0x28 free-check; @0x00117315 base-
    //  string@+0x10 free-check; @0x0011732c tail-jmp operator_delete.)
    this.vtable = 0;
  }

  /**
   * HGCPUComputeDevice::~HGCPUComputeDevice() — D0 (deleting) destructor.
   *
   * @Helium 0x00117340 (__ZN18HGCPUComputeDeviceD0Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCPUComputeDevice.D0Ev.s
   *
   * Body (@0x00117340..@0x0011738d):
   *   Steps 1–4 identical to D2 (three std::string long-buffer frees +
   *   base vtable reset), EXCEPT step 4 is a plain conditional callq (not
   *   a tail-jmp) and the epilogue tail-jmps `operator_delete(this)` on the
   *   whole object.  @0x00117384 movq %rbx,%rdi; @0x0011738d jmp __ZdlPv.
   *
   * D0 = "deleting destructor": vtable slot invoked by `delete p` for
   * heap-allocated instances. Frees the object storage itself after
   * running the dtor chain.
   */
  D0(): void {
    // Steps 1–4: same as D2. Steps documented in D2's doc-comment.
    // (@0x00117349 brandString; @0x00117358 vtable reset; @0x00117366
    //  base-string@+0x28; @0x00117375 base-string@+0x10.)
    this.vtable = 0;
    // Final step: tail-jmp operator_delete(this) — the whole-object free.
    // (@0x0011738d jmp __ZdlPv)
    // TS is GC-managed; this is a no-op.
  }
}
