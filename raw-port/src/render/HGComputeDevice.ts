// HGComputeDevice.ts — Helium base class for compute devices (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium (macOS FCP, x86_64 slice).
//
// Symbols ported (from raw-port/re/disasm/Helium.HGComputeDevice.*.s and
// /tmp/Helium_tV.txt):
//   * HGComputeDevice::HGComputeDevice(HGComputeDevice::Type)  [C2]  @0x116e20
//   * HGComputeDevice::HGComputeDevice(HGComputeDevice::Type)  [C1]  @0x116ff0
//                                                                     (thunk → C2)
//   * HGComputeDevice::~HGComputeDevice()                       [D2] @0x117220
//   * HGComputeDevice::~HGComputeDevice()                       [D1] @0x118050
//   * HGComputeDevice::~HGComputeDevice()                       [D0] @0x1180a0
//
// Also referenced:
//   * vtable for HGComputeDevice: `__ZTV15HGComputeDevice` (installed with a
//     +0x10 offset — standard Itanium ABI, skips the RTTI/OFFSET slots).
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (decoded from C2 and dtors)
// -----------------------------------------------------------------------------
//   0x00  vptr           — HGComputeDevice's vtable (base+0x10) @0x116e54
//   0x08  u32 type       — the `HGComputeDevice::Type` enum, stashed from
//                          %esi @0x116e57
//   0x10  std::string    — SSO libc++ small-string: [size|flag] byte @+0x10,
//                          heap-ptr at +0x20, capacity at +0x18 when in
//                          long-mode.  This is the HOSTNAME string, populated
//                          from `gethostname(2)`.  Zeroed via `xorps xmm0`
//                          @0x116e65.
//   0x28  std::string    — Same SSO layout at +0x28/+0x30/+0x38.  This is the
//                          UNAME COMBINED string built from struct utsname
//                          fields (sysname + " " + nodename + " " + release +
//                          " " + version + " " + machine).  Zeroed at
//                          @0x116e69/@0x116e6d.
//
// -----------------------------------------------------------------------------
// C2 CTOR — HUGE UNDECODED FRONTIER (@0x116e20)
// -----------------------------------------------------------------------------
// The body (~450 bytes ending @0x116fed) is a complex sequence of:
//   1. Stack-check prologue (chkstk_darwin, 0x1010-byte frame, stack guard).
//   2. Install vtable + copy `type` arg to this+0x8.
//   3. Zero the two std::string members with SSE xorps writes.
//   4. Call `gethostname(&stackBuf, 0x1000)` @0x116e7d.
//      - Success path (@0x116ea4): copy the stackBuf into this+0x10 via
//        `basic_string::assign(char const*)` @0x116eb2, then call `uname(&
//        stackBuf)` @0x116ebe.
//      - Failure path (@0x116e86..0x116ea2): reset this+0x10 to empty (bit0
//        of size byte tests SSO/long mode; if long-mode, free heap first),
//        then still call `uname(&stackBuf)` @0x116e99.
//   5. Assemble this+0x28 as
//         utsname.sysname + " " + utsname.nodename + " " +
//         utsname.release + " " + utsname.version + " " + utsname.machine
//      via a sequence of `basic_string::assign(char const*)` /
//      `push_back(' ')` / `append(char const*)` calls @0x116f0f..0x116f6d.
//      The utsname offsets used are: 0 (sysname), -0xe30 (relative to rbp,
//      which is +0x200 in struct utsname → nodename), -0xc30 (+0x400 →
//      release), -0xd30 (+0x300 → version — wait, struct utsname order is
//      sysname/nodename/release/version/machine at 0/256/512/768/1024;
//      but the FCP build offsets differ, so we cite verbatim: the compile
//      pass uses stack offsets -0x1030 (base), -0xe30, -0xc30, -0xd30, and
//      one more we haven't inspected @0x116f6d/onward).
//   6. Stack-guard check + return.
//   7. Exception unwind paths @0x116fb6..0x116fe8: free either string's
//      heap buf then `__Unwind_Resume`.
//
// Every OS call is unported: gethostname, uname, __ZNSt3__1... string ops,
// __stack_chk_guard/__stack_chk_fail.  The full transcription would require
// porting libc++'s basic_string subsystem, which is out of scope for this
// unit.  We surface the ctor as an unavoidable failure with the citation
// so downstream consumers get a decoded frontier signal.
//
// -----------------------------------------------------------------------------
// C1 CTOR — @0x116ff0
// -----------------------------------------------------------------------------
// Body verbatim (3 insns + tail-jump):
//   pushq %rbp
//   movq  %rsp, %rbp
//   popq  %rbp
//   jmp   __ZN15HGComputeDeviceC2ENS_4TypeE   @0x116ff5
// i.e. C1 is a no-op thunk that tail-calls C2.
//
// -----------------------------------------------------------------------------
// D1 / D2 DESTRUCTORS — @0x118050 / @0x117220 (identical bodies)
// -----------------------------------------------------------------------------
//   pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax   — prologue
//   this[0] = __ZTV15HGComputeDevice + 0x10                @0x118064
//   if (bit0 of this[+0x28] set) __ZdlPv(this[+0x38])      @0x118071
//     — free the long-mode heap of the utsname-combined string
//   if (bit0 of this[+0x10] set) tail-call __ZdlPv(this[+0x20]) @0x11808d
//     — free the long-mode heap of the hostname string; else return
//
// D2 (@0x117220) is byte-for-byte identical.  The compiler emits both because
// Itanium ABI mandates separate D1 (complete-object) and D2 (base-object)
// dtor symbols even when they're equivalent.
//
// -----------------------------------------------------------------------------
// D0 DESTRUCTOR — @0x1180a0 (deleting dtor)
// -----------------------------------------------------------------------------
// Same as D1/D2, plus a final `__ZdlPv(this)` tail call to free the object
// itself:
//   ...same body as D1...
//   this[0] = __ZTV15HGComputeDevice + 0x10                @0x1180b4
//   if (bit0 of this[+0x28] set) __ZdlPv(this[+0x38])      @0x1180c1
//   if (bit0 of this[+0x10] set) __ZdlPv(this[+0x20])      @0x1180d0
//   __ZdlPv(this)                                          @0x1180de  (tail)
//
// The vtable-slot @+0x10 that gets installed on entry to every dtor is the
// standard "dtor is running" marker — during destruction virtual calls
// should resolve to HGComputeDevice's own vtable rather than the derived
// class's.  We record the store here but leave it as an opaque nominal
// operation.

/**
 * `HGComputeDevice::Type` — nested enum for the device type.  The full enum
 * isn't decoded here; the C2 ctor treats it as an opaque 32-bit value stored
 * at this+0x8.  Nominal `HGCPUComputeDevice::HGCPUComputeDevice()` at
 * @0x117000 constructs with `type=0` (`xorl %esi, %esi` @0x117021), so at
 * least value `0` is the CPU-device tag.
 */
export type HGComputeDeviceType = number;

/** Standard libc++ SSO small-string, modeled as an opaque object here — the
 *  real class isn't yet transcribed.  Both fields at +0x10 and +0x28 use this
 *  representation. */
export type StdString = string;

export class HGComputeDevice {
  /** @+0x00 — vtable pointer.  Installed at @0x116e54 (C2) and reset at
   *  @0x118064 / @0x117234 / @0x1180b4 (each dtor entry) to
   *  `__ZTV15HGComputeDevice + 0x10`. */
  vptr: unknown = null;

  /** @+0x08 — u32 device type.  Stashed from the ctor's `type` arg
   *  @0x116e57. */
  type: HGComputeDeviceType = 0;

  /** @+0x10 — hostname string from `gethostname(2)`.  Empty on hostname
   *  failure. */
  hostname: StdString = "";

  /** @+0x28 — combined uname string:
   *  `sysname + " " + nodename + " " + release + " " + version + " " + machine`
   *  from `uname(2)`. */
  unameCombined: StdString = "";

  /**
   * `HGComputeDevice::HGComputeDevice(HGComputeDevice::Type)`  — C2 @0x116e20.
   *
   * Complete body summary (see file-level comment for the address-by-address
   * walk).  Requires: gethostname(2), uname(2), libc++ basic_string::assign /
   * push_back / append.  None are ported at this layer, so we raise.
   */
  constructor(_type: HGComputeDeviceType) {
    // @0x116e20 — full ctor body requires gethostname + uname + libc++ string:
    //   @0x116e30 chkstk_darwin(0x1010)
    //   @0x116e49 install vtable (base+0x10)
    //   @0x116e57 this+0x8 = type
    //   @0x116e62-0x116e6d zero both std::string members
    //   @0x116e7d gethostname(&stackBuf, 0x1000)
    //   @0x116eb2 basic_string::assign(&hostname, stackBuf)   [if success]
    //   @0x116ebe uname(&utsname)
    //   @0x116f0f..0x116f6d assemble unameCombined = sysname + " " + …
    //   @0x116ee1 __stack_chk_guard compare
    // Requires libc + libc++ that isn't ported. @0x116e20
    throw new Error(
      "HGComputeDevice::HGComputeDevice(Type): requires gethostname(2) + " +
        "uname(2) + libc++ basic_string::assign/push_back/append — none " +
        "ported. @0x116e20",
    );
  }

  /**
   * `HGComputeDevice::HGComputeDevice(HGComputeDevice::Type)`  — C1 @0x116ff0.
   *
   * The C1 (complete-object) constructor is a thin tail-call thunk to C2:
   *   @0x116ff0-0x116ff4 pushq/popq %rbp
   *   @0x116ff5 jmp __ZN15HGComputeDeviceC2ENS_4TypeE
   *
   * In TS we can't tail-call a constructor across a different function
   * without recursing.  We forward to `new HGComputeDevice(type)` — which
   * itself dispatches to the same body — mirroring the ABI-level thunk.
   */
  static C1(type: HGComputeDeviceType): HGComputeDevice {
    // @0x116ff5: jmp __ZN15HGComputeDeviceC2ENS_4TypeE
    return new HGComputeDevice(type);
  }

  /**
   * `HGComputeDevice::~HGComputeDevice()` — D2 @0x117220 / D1 @0x118050
   * (identical bodies).
   *
   * @0x118064 (or @0x117234): install vtable (base+0x10) — the "dtor
   *          running" vtable install.
   * @0x11806b: if (this[+0x28] & 1) __ZdlPv(this[+0x38])  — free the
   *          long-mode heap of `unameCombined`.
   * @0x11807a: if (this[+0x10] & 1) tail __ZdlPv(this[+0x20]) — free the
   *          long-mode heap of `hostname`; else return.
   *
   * `__ZdlPv` is `operator delete(void*)` — not ported.  In TS we surface
   * the cleanup as the two conditional freed slots below; the actual heap
   * release is a no-op in a GC'd runtime.
   *
   * The vtable-slot install (@0x118064) is a nominal shape edit; we record
   * that it happens but leave the vptr field alone since it's opaque in
   * this port.
   */
  static destroy_D1(self: HGComputeDevice): void {
    // @0x118064: this[0] = __ZTV15HGComputeDevice + 0x10   (dtor-vtable slot)
    self.vptr = null; // nominal; the real store is symbolic here
    // @0x11806b: if `unameCombined` is long-mode, free its heap buf.
    //   In TS the string is GC'd, so we drop the reference to model the
    //   "no more heap owner" state.
    self.unameCombined = "";
    // @0x11807a: if `hostname` is long-mode, free its heap buf.
    self.hostname = "";
  }

  /**
   * `HGComputeDevice::~HGComputeDevice()` — D0 @0x1180a0 (deleting dtor).
   *
   * Identical to D1/D2 through @0x1180d0, then adds a `__ZdlPv(this)` tail
   * call @0x1180de to deallocate the object itself.  In a GC'd runtime the
   * object-delete is a no-op — we just delegate to destroy_D1.
   */
  static destroy_D0(self: HGComputeDevice): void {
    // @0x1180a0..0x1180d0: same body as D1.
    HGComputeDevice.destroy_D1(self);
    // @0x1180de: tail-call __ZdlPv(this)  — object-delete; GC in TS makes
    // this a no-op.
  }
}
