// OZChannelUint16 — Ozone OZChannel subclass for a uint16-valued animatable
// parameter. Only ONE symbol is exported from Ozone for this class:
//
//   @Ozone 0x00000000005ae620  OZChannelUint16::OZChannelUint16(
//                                 int defaultValue, PCString const& name,
//                                 OZChannelFolder* folder,
//                                 unsigned int u1, unsigned int u2,
//                                 OZChannelImpl* impl,
//                                 OZChannelInfo* info)                          [C2 ctor]
//
// (The dtor, clone, copy, setValue*/getValue*, getObjCWrapperName etc. are
// all `U` undefined imports in Ozone — they live in ProChannel or are
// inlined at call sites. Any real dispatch through them lands as a
// frontier throw citing @0x5ae620.)
//
// FRAMEWORK: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone). Disasm captured via
// `bash raw-port/tools/disasm.sh OZChannelUint16 OZChannelUint16 Ozone`
// (95 lines in raw-port/re/disasm/OZChannelUint16.OZChannelUint16.s).
//
// STRUCT LAYOUT (recovered directly from the ctor body; inherits from
// OZChannel — see raw-port/src/channels/OZChannel.ts for the base layout):
//
//   +0x00  void*                 vtable_primary    (installed = vt+0x10)   @0x5ae67d
//   +0x10  void*                 vtable_secondary  (installed = vt+0x380)   @0x5ae686
//                                                   (=  0x10 + 0x370, per
//                                                   `addq $0x370, %rax`)
//   +0x18..0x6F   inherited from OZChannel / OZChannelBase (base ctor at
//                                                  @0x5ae66d fills these)
//   +0x70  OZChannelImpl*        implPrimary        (base wrote from
//                                                    arg6=impl at C2 time;
//                                                    THIS ctor overrides it
//                                                    to _OZChannelUint16Impl
//                                                    if arg6 was null)
//   +0x78  OZChannelImpl*        implSecondary      (same source)
//   +0x80  OZChannelInfo*        infoPrimary        (base wrote from
//                                                    arg7=info; THIS ctor
//                                                    overrides to
//                                                    _OZChannelUint16Info
//                                                    if arg7 was null)
//   +0x88  OZChannelInfo*        infoSecondary      (same source)
//
// The two per-class singleton globals resolved by literal-pool pointers in
// the ctor:
//   __ZN15OZChannelUint1620_OZChannelUint16InfoE  (RIP-rel @0x5ae6e2, delta 0x273617)
//   __ZN15OZChannelUint1620_OZChannelUint16ImplE  (RIP-rel @0x5ae73b, delta 0x2735b6)
// each initialized exactly once via `std::__1::call_once` in a small helper
// (OZChannelUint16::createOZChannelUint16Info() / ...Impl()) — those two
// helper methods and the two singletons are frontier / not yet transcribed.
//
// FULL LINE-BY-LINE DECODE of C2 @0x5ae620..0x5ae77c (branches + fallthrough):
//
//   prologue (0x5ae620..0x5ae630):
//     push rbp; mov rsp,rbp; push r15/r14/r13/r12/rbx; sub $0x38,%rsp
//   argument shuffle (0x5ae631..0x5ae644):
//     -0x38(rbp) = r9d (u2)              @0x5ae631
//     r12d      = r8d (u1)               @0x5ae635
//     r13       = rcx (folder)           @0x5ae638
//     r14       = rdx (&name)            @0x5ae63b
//     -0x4c(rbp)= esi (defaultValue)     @0x5ae63e
//     rbx       = rdi (this)             @0x5ae641
//     r15       = 0x10(rbp) (impl arg)   @0x5ae644
//   factory fetch + base ctor (0x5ae648..0x5ae66d):
//     rax = getOZChannelUint16_FactoryBase()                              @0x5ae648
//     8(rsp) = 0x18(rbp)     ; info (arg 8 for base ctor)                 @0x5ae651
//     (rsp)  = r15           ; impl (arg 7 for base ctor)                 @0x5ae656
//     call OZChannel::OZChannel(this=rbx, factory=rax, name=r14,
//                               folder=r13, u1=r12d, u2=r9d[reloaded],
//                               impl (rsp), info (rsp+8))                  @0x5ae66d
//   vtable install (0x5ae672..0x5ae686):
//     rax = &vtable_for_OZChannelUint16                                    @0x5ae672
//     this[0x00] = rax + 0x10                                              @0x5ae67d
//     this[0x10] = rax + 0x380  (0x10 + 0x370)                             @0x5ae686
//   InfoOnce init (0x5ae68a..0x5ae6b9):
//     if (_OZChannelUint16Info_once != -1)
//       std::call_once(_OZChannelUint16Info_once,
//                      OZChannelUint16::createOZChannelUint16Info() lambda) @0x5ae6b9
//   Info-arg branch (0x5ae6be..0x5ae6f3):
//     if (arg7 info != 0):                          ; base already wrote
//       this[0x80] = this[0x88]                     ;   both slots; this
//                                                   ;   reads-back the base's
//                                                   ;   0x88 write (r15) and
//                                                   ;   re-writes 0x80 — a
//                                                   ;   deliberate re-copy in
//                                                   ;   case a subclass ctor
//                                                   ;   between-writes 0x88.
//       goto impl-once check
//     else (info == 0):
//       ptr = *_OZChannelUint16Info    ; deref global               @0x5ae6e9
//       this[0x88] = ptr                                             @0x5ae6ec
//       this[0x80] = ptr                                             @0x5ae6f3
//       fall through to impl-once check
//   ImplOnce init (0x5ae6d3..0x5ae729):
//     if (_OZChannelUint16Impl_once != -1)
//       std::call_once(_OZChannelUint16Impl_once,
//                      OZChannelUint16::createOZChannelUint16Impl() lambda) @0x5ae729
//   Impl-arg branch (0x5ae72e..0x5ae749):
//     if (arg6 impl != 0):
//       rax = this[0x78]                                             @0x5ae735
//       goto write-0x70
//     else (impl == 0):
//       rax = *_OZChannelUint16Impl                                  @0x5ae742
//       this[0x78] = rax                                             @0x5ae745
//     this[0x70] = rax                                               @0x5ae749
//   Default+initial value (0x5ae74d..0x5ae76d):
//     xmm0  = (double)(int)defaultValue    ; cvtsi2sdl -0x4c(rbp)    @0x5ae74d
//     spill xmm0 -> -0x38(rbp)                                       @0x5ae755
//     OZChannel::setDefaultValue(this, xmm0)                         @0x5ae75a
//     xmm0  = -0x38(rbp)     ; reload                                @0x5ae762
//     esi   = 0              ; second arg `propagate` = false        @0x5ae767
//     OZChannel::setInitialValue(this, xmm0, false)                  @0x5ae769
//   Epilogue (0x5ae76e..0x5ae77c):
//     add $0x38,%rsp; pop rbx/r12/r13/r14/r15/rbp; ret
//   Cleanup landing pad (0x5ae77d..0x5ae78e):
//     r14 = rax (exception); ~OZChannel(this); _Unwind_Resume(r14)
//     — unwinds a base sub-object that was partially constructed if the
//     Info/Impl call_once or the setDefaultValue/setInitialValue throws.
//
// ---------------------------------------------------------------------------
// Frontier surface: everything the ctor calls into (base ctor, factory
// getter, call_once, setDefaultValue, setInitialValue) is un-ported. Each
// helper below throws with a message citing its address so any real dispatch
// surfaces a decode gap rather than a silent no-op (rule 3 of PORTING_SPEC).
// ---------------------------------------------------------------------------

import type { OZChannel } from "./OZChannel";
// A VALUE import, not a type import: the Info singleton's initializer really constructs one
// (operator new(0x58) @ProChannel 0xf5a1 + OZChannelUint16Info::C2 @0xf5cc).
import { OZChannelUint16Info } from "./OZChannelUint16Info";
import type { OZCompoundChannel } from "./OZCompoundChannel";

/** OZChannelInfo forward-type — layout not needed inside this file. */
export type OZChannelInfoPtr = object | null;
/** OZChannelImpl forward-type — layout not needed inside this file. */
export type OZChannelImplPtr = object | null;
/** PCString forward-type — treated opaquely; content isn't dereferenced here. */
export type PCString = { readonly __pcstring: true } | string;
/** OZChannelFolder pointer (nullable) — passed through to the base ctor. */
export type OZChannelFolderPtr = object | null;

/**
 * OZChannelUint16 instance shape — the fields THIS ctor writes into. The
 * OZChannel/OZChannelBase base sub-object owns 0x18..0x6F (see OZChannel.ts).
 */
export interface OZChannelUint16Layout {
  /** +0x00: primary vtable (installed = vtable_for_OZChannelUint16 + 0x10, @Ozone 0x5ae67d). */
  _vtable_primary: unknown;
  /** +0x10: secondary vtable (installed = vtable_for_OZChannelUint16 + 0x380, @Ozone 0x5ae686). */
  _vtable_secondary: unknown;
  /** Inherited OZChannel base sub-object (0x18..0x6F). */
  _base: OZChannel;
  /** +0x70: OZChannelImpl* implPrimary (@Ozone 0x5ae749). */
  implPrimary: OZChannelImplPtr;
  /** +0x78: OZChannelImpl* implSecondary (@Ozone 0x5ae745 / 0x5ae735). */
  implSecondary: OZChannelImplPtr;
  /** +0x80: OZChannelInfo* infoPrimary (@Ozone 0x5ae6cc / 0x5ae6f3). */
  infoPrimary: OZChannelInfoPtr;
  /** +0x88: OZChannelInfo* infoSecondary (@Ozone 0x5ae6c5 read; 0x5ae6ec written). */
  infoSecondary: OZChannelInfoPtr;
}

// ---------------------------------------------------------------------------
// Frontier stubs — each throws citing the callee's stub address in Ozone.
// ---------------------------------------------------------------------------

/**
 * getOZChannelUint16_FactoryBase() — @Ozone stub 0x6dd2b4 (symbol
 * __Z30getOZChannelUint16_FactoryBasev). Called at @0x5ae648 to obtain the
 * factory pointer passed as arg2 to OZChannel::OZChannel base ctor.
 * The helper's own body is a free function elsewhere in Ozone and is not
 * yet transcribed — see the free-function ledger.
 */
function getOZChannelUint16_FactoryBase(): unknown {
  throw new Error(
    "getOZChannelUint16_FactoryBase @Ozone stub 0x6dd2b4 not yet transcribed " +
    "(called from OZChannelUint16::OZChannelUint16 @0x5ae648)"
  );
}

/**
 * OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*,
 *                      unsigned int, unsigned int, OZChannelImpl*,
 *                      OZChannelInfo*) — @Ozone stub 0x6df474 (symbol
 * __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo).
 * Undefined import in Ozone — implemented in ProChannel; the body is
 * decoded in raw-port/src/channels/OZChannel.ts (@ProChannel 0x13cfc) but
 * we call through the stub-shape declared here rather than importing a
 * function that isn't exported yet as an initializer.
 */
function OZChannel__C2(
  _this: OZChannelUint16Layout, _factory: unknown, _name: PCString,
  _folder: OZChannelFolderPtr, _u1: number, _u2: number,
  _impl: OZChannelImplPtr, _info: OZChannelInfoPtr,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZFactory*,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*,OZChannelInfo*) " +
    "@ProChannel 0x13cfc (Ozone stub 0x6df474) not yet exported as a callable initializer " +
    "(called from OZChannelUint16::OZChannelUint16 @0x5ae66d)"
  );
}

/**
 * OZChannel::setDefaultValue(double) — @Ozone stub 0x6df306 (symbol
 * __ZN9OZChannel15setDefaultValueEd). ProChannel-side body; frontier here.
 */
function OZChannel__setDefaultValue(_this: OZChannelUint16Layout, _v: number): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @Ozone stub 0x6df306 (ProChannel) not yet transcribed " +
    "(called from OZChannelUint16::OZChannelUint16 @0x5ae75a)"
  );
}

/**
 * OZChannel::setInitialValue(double, bool) — @Ozone stub 0x6df30c (symbol
 * __ZN9OZChannel15setInitialValueEdb). ProChannel-side body; frontier.
 */
function OZChannel__setInitialValue(_this: OZChannelUint16Layout, _v: number, _propagate: boolean): void {
  throw new Error(
    "OZChannel::setInitialValue(double,bool) @Ozone stub 0x6df30c (ProChannel) not yet transcribed " +
    "(called from OZChannelUint16::OZChannelUint16 @0x5ae769)"
  );
}

/**
 * std::__1::call_once implementation of the per-class Info singleton init.
 * The `_OZChannelUint16Info_once` flag is a std::once_flag located in Ozone
 * data; its `-1` sentinel means "already initialized". The lambda called
 * on first use is `OZChannelUint16::createOZChannelUint16Info()` — a
 * separate method not enumerated in the swarm ledger because it's a
 * lambda-emitted proxy (see std::__1::__call_once_proxy @0x5ae6b9). Both
 * this and the singleton dereferencer are frontier; body throws.
 *
 * When ported, this must:
 *   - read `_OZChannelUint16Info_once`; if == -1, return
 *   - otherwise call std::__1::__call_once(flag, proxy, tuple{lambda&&})
 *     which drops into `createOZChannelUint16Info()` on the first thread
 *     and marks the flag done.
 */
function ensureOZChannelUint16InfoOnce(): void {
  throw new Error(
    "OZChannelUint16::createOZChannelUint16Info() std::call_once wrapper " +
    "@Ozone 0x5ae68a..0x5ae6b9 (call_once stub 0x6dfb2e, proxy at " +
    "__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelUint1625createOZChannelUint16InfoEvEUlvE_EEEEEvPv) " +
    "not yet transcribed"
  );
}

/** Same for the Impl singleton — @Ozone 0x5ae6d3..0x5ae729 (stub 0x6dfb2e). */
function ensureOZChannelUint16ImplOnce(): void {
  throw new Error(
    "OZChannelUint16::createOZChannelUint16Impl() std::call_once wrapper " +
    "@Ozone 0x5ae6d3..0x5ae729 (call_once stub 0x6dfb2e) not yet transcribed"
  );
}

/**
 * `*_OZChannelUint16Info` global pointer — @Ozone 0x5ae6e2 loads it via
 * `movq 0x273617(%rip), %rax` and then `movq (%rax), %rax` dereferences to
 * an OZChannelInfo*. Frontier: needs the createOZChannelUint16Info() body
 * to know the singleton's actual OZChannelInfo shape (name string, min/max,
 * value serializer, etc.).
 */
function loadOZChannelUint16Info(): OZChannelInfoPtr {
  throw new Error(
    "*_OZChannelUint16Info singleton @Ozone 0x5ae6e2 not yet transcribed " +
    "(needs createOZChannelUint16Info() body)"
  );
}

/**
 * `*_OZChannelUint16Impl` global pointer — @Ozone 0x5ae73b, mirror of
 * loadOZChannelUint16Info() but for the Impl side.
 */
function loadOZChannelUint16Impl(): OZChannelImplPtr {
  throw new Error(
    "*_OZChannelUint16Impl singleton @Ozone 0x5ae73b not yet transcribed " +
    "(needs createOZChannelUint16Impl() body)"
  );
}

// ---------------------------------------------------------------------------
// OZChannelUint16
// ---------------------------------------------------------------------------

export class OZChannelUint16 {
  /** Vtable-installed offsets from the ctor (@Ozone 0x5ae67d, 0x5ae686). */
  static readonly VTABLE_PRIMARY_OFFSET   = 0x10;   // `leaq 0x10(%rax), %rcx`
  static readonly VTABLE_SECONDARY_OFFSET = 0x380;  // `addq $0x370, %rax`  (0x10 + 0x370)

  /**
   * Byte offsets of the per-class extension fields @0x5ae620 writes:
   *   implPrimary   +0x70   (@0x5ae749)
   *   implSecondary +0x78   (@0x5ae745 / 0x5ae735)
   *   infoPrimary   +0x80   (@0x5ae6cc / 0x5ae6f3)
   *   infoSecondary +0x88   (@0x5ae6c5 read / 0x5ae6ec written)
   * All four inherit from OZChannel — but the ctor re-writes them
   * unconditionally, so recording them here keeps the layout mechanical.
   */
  static readonly OFF_IMPL_PRIMARY   = 0x70;
  static readonly OFF_IMPL_SECONDARY = 0x78;
  static readonly OFF_INFO_PRIMARY   = 0x80;
  static readonly OFF_INFO_SECONDARY = 0x88;

  /**
   * OZChannelUint16::OZChannelUint16(int, PCString const&, OZChannelFolder*,
   *                                  unsigned int, unsigned int,
   *                                  OZChannelImpl*, OZChannelInfo*)
   * — @Ozone 0x00000000005ae620 (C2 body; also the C1 entry per Itanium
   * ABI, since no virtual-base construction).
   *
   * The body is transcribed step-for-step below. Every call flows into a
   * frontier stub that throws citing @0x5ae620, so this constructor throws
   * loudly the moment ANY step is reached — matching PORTING_SPEC rule 3:
   * loud gaps, no plausible-looking silent no-ops.
   *
   * Signature matches the demangled ledger entry exactly:
   *   __ZN15OZChannelUint16C2EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
   *
   * @param this_        rdi — this pointer (populated as an OZChannelUint16Layout)
   * @param defaultValue esi (int) — used as the initial/default value
   * @param name         rdx — const PCString&
   * @param folder       rcx — OZChannelFolder* (nullable)
   * @param u1           r8d — u32 (opaque; passed through to base ctor)
   * @param u2           r9d — u32 (opaque; passed through to base ctor)
   * @param impl         (rsp+0x10) — OZChannelImpl* (nullable; overrides singleton)
   * @param info         (rsp+0x18) — OZChannelInfo* (nullable; overrides singleton)
   */
  static C2(
    this_: OZChannelUint16Layout,
    defaultValue: number,
    name: PCString,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
    info: OZChannelInfoPtr,
  ): void {
    // ---- 1) factory = getOZChannelUint16_FactoryBase()   @0x5ae648 ----
    const factory = getOZChannelUint16_FactoryBase();
    // ---- 2) OZChannel::OZChannel(this, factory, name, folder, u1, u2, impl, info)  @0x5ae66d
    OZChannel__C2(this_, factory, name, folder, u1, u2, impl, info);
    // ---- 3) install vtables                              @0x5ae672..0x5ae686 ----
    // this[0x00] = vtable_for_OZChannelUint16 + 0x10       @0x5ae67d
    this_._vtable_primary = "OZChannelUint16::vtable+0x10";
    // this[0x10] = vtable_for_OZChannelUint16 + 0x380      @0x5ae686
    this_._vtable_secondary = "OZChannelUint16::vtable+0x380";
    // ---- 4) init Info singleton via std::call_once       @0x5ae68a..0x5ae6b9 ----
    ensureOZChannelUint16InfoOnce();
    // ---- 5) Info-arg branch                              @0x5ae6be..0x5ae6f3 ----
    if (info !== null && info !== undefined) {
      // info != 0 (arg7): re-copy this[0x88] into this[0x80]. Base ctor
      // already wrote r15 (info) into BOTH 0x80 and 0x88, so this is
      // effectively a re-emission of the same value; the branch survives
      // in codegen because subclass hooks between the base ctor and here
      // may have mutated 0x88. Verbatim from @0x5ae6c5/0x5ae6cc.
      this_.infoPrimary = this_.infoSecondary;
    } else {
      // info == 0: override with the process-wide singleton.
      const ptr = loadOZChannelUint16Info();                    // @0x5ae6e2/0x5ae6e9
      this_.infoSecondary = ptr;                                 // this[0x88] @0x5ae6ec
      this_.infoPrimary   = ptr;                                 // this[0x80] @0x5ae6f3
    }
    // ---- 6) init Impl singleton via std::call_once        @0x5ae6d3..0x5ae729 ----
    ensureOZChannelUint16ImplOnce();
    // ---- 7) Impl-arg branch                              @0x5ae72e..0x5ae749 ----
    let raxImpl: OZChannelImplPtr;
    if (impl !== null && impl !== undefined) {
      // impl != 0 (arg6): rax = this[0x78] (base already wrote both slots
      // to r15 = impl). @0x5ae735
      raxImpl = this_.implSecondary;
    } else {
      // impl == 0: rax = *_OZChannelUint16Impl; this[0x78] = rax. @0x5ae742/0x5ae745
      raxImpl = loadOZChannelUint16Impl();
      this_.implSecondary = raxImpl;
    }
    // this[0x70] = rax   @0x5ae749  (unconditional final write from raxImpl)
    this_.implPrimary = raxImpl;
    // ---- 8) default + initial value                       @0x5ae74d..0x5ae769 ----
    // xmm0 = (double)(int32)defaultValue via `cvtsi2sdl -0x4c(%rbp), %xmm0`.
    // Signed conversion from int32 — exact integer -> double (uint16 fits
    // in mantissa without rounding).
    const dv = (defaultValue | 0);        // enforce int32 signedness (matches cvtsi2sdl)
    const xmm0 = dv;                      // implicit int->double (JS Number is already f64)
    OZChannel__setDefaultValue(this_, xmm0);      // @0x5ae75a
    OZChannel__setInitialValue(this_, xmm0, false); // @0x5ae769  (esi = 0 -> propagate=false)
    // ---- 9) epilogue (register restore + ret)             @0x5ae76e..0x5ae77c ----
    // Nothing to write; the object is now fully constructed by the sequence
    // above. Any throw between step 2 and step 8 unwinds via the landing
    // pad at @0x5ae77d which tail-calls ~OZChannel(this) then _Unwind_Resume.
  }

  /**
   * `new OZChannelUint16(...)`-style factory. Because every step of the
   * ctor throws (all frontier), this method throws too; the shape exists
   * so callers get a class name in the error and NOT a silent success.
   */
  private constructor() {
    throw new Error(
      "OZChannelUint16 has no direct-callable TS constructor: every step " +
      "of the C2 body @Ozone 0x5ae620 depends on ProChannel frontier " +
      "symbols (OZChannel::OZChannel, setDefaultValue, setInitialValue, " +
      "call_once + create*Info/*Impl singletons). Call OZChannelUint16.C2 " +
      "with a pre-allocated Layout to surface the exact frontier that " +
      "blocks construction."
    );
  }

  /**
   * @ProChannel BSS 0xeb7d8
   * `__ZZN15OZChannelUint1625createOZChannelUint16ImplEvE25_OZChannelUint16Impl_once` — the libc++
   * `std::once_flag` word read @0xf536 and address-taken @0xf555 (both displacements resolve to
   * 0xeb7d8). 0n = not started, -1n (~0UL) = completed, which is the only value the fast path
   * @0xf53d tests for. BSS is zero-filled at load; measured 0 before the first live call and
   * 0xffffffffffffffff after it.
   */
  static _OZChannelUint16Impl_once: bigint = 0n; // @ProChannel 0xf536 read-site

  /**
   * @ProChannel BSS 0xec260 `__ZN15OZChannelUint1620_OZChannelUint16ImplE` — the singleton pointer,
   * address-taken @0xf568 and dereferenced @0xf56f as the accessor's return value, and written by
   * the once-init lambda. Zero-filled at load, i.e. nullptr.
   */
  static _OZChannelUint16Impl: OZChannelImplPtr = null; // @ProChannel 0xf568

  /**
   * `OZChannelUint16::createOZChannelUint16Impl()` — @ProChannel 0xf52e
   * (`__ZN15OZChannelUint1625createOZChannelUint16ImplEv`).
   *
   * The standard libc++ `std::call_once`-guarded singleton accessor, transcribed line-for-line from
   * the disassembly quoted above: take the fast path when the once-flag reads ~0UL, otherwise cross
   * the `std::__call_once` boundary, then return the global the initializer published.
   *
   * Distinct from the two Ozone-side frontier stubs above (`ensureOZChannelUint16ImplOnce`,
   * `loadOZChannelUint16Impl`), which describe the copy of this logic that Ozone INLINES into the
   * ctor at 0x5ae6d3..0x5ae73b. Those are left untouched; when the Ozone ctor path is transcribed it
   * can route here instead.
   */
  static createOZChannelUint16Impl(): OZChannelImplPtr {
    // @0xf536-0xf541 — the libc++ fast path: once == ~0UL means init already completed.
    if (OZChannelUint16._OZChannelUint16Impl_once !== -1n) {
      // @0xf543-0xf563 — marshal the tuple and call std::__1::__call_once(&once, arg, proxy)
      //   through ProChannel stub 0xacdc8 (libc++, a TRUE out-of-scope extern).
      std_call_once_OZChannelUint16Impl();
    }
    // @0xf568-0xf56f — leaq &global then movq (%rax),%rax: return the pointer stored there, NULL
    // included. The machine performs no null check, so neither does this.
    return OZChannelUint16._OZChannelUint16Impl;
  }

  /**
   * @ProChannel BSS 0xeb7d0
   * `__ZZN15OZChannelUint1625createOZChannelUint16InfoEvE25_OZChannelUint16Info_once` — the libc++
   * `std::once_flag` word read @0xf4ec and address-taken @0xf50b (both displacements resolve to
   * 0xeb7d0; note it is 8 bytes BELOW the Impl flag at 0xeb7d8, i.e. the two function-local statics
   * are adjacent). 0n = not started, -1n (~0UL) = completed. Measured 0 before the first live call
   * and 0xffffffffffffffff after it.
   */
  static _OZChannelUint16Info_once: bigint = 0n; // @ProChannel 0xf4ec read-site

  /**
   * @ProChannel BSS 0xec258 `__ZN15OZChannelUint1620_OZChannelUint16InfoE` — the singleton pointer,
   * address-taken @0xf51e and dereferenced @0xf525 as the accessor's return value, and written by
   * the initializer @0xf5b1. Zero-filled at load, i.e. nullptr.
   */
  static _OZChannelUint16Info: OZChannelInfoPtr = null; // @ProChannel 0xf51e

  /**
   * `OZChannelUint16::createOZChannelUint16Info()` — @ProChannel 0xf4e4
   * (`__ZN15OZChannelUint1625createOZChannelUint16InfoEv`).
   *
   * The Info twin of `createOZChannelUint16Impl` above: byte-for-byte the same libc++
   * `std::call_once` accessor shape, differing only in which three symbols it names (once flag
   * 0xeb7d0, proxy @0xf578, singleton 0xec258). All three re-derived from the raw bytes of the
   * thin x86_64 slice:
   *
   *   0xf4e4  55                    pushq %rbp
   *   0xf4e5  48 89 e5              movq  %rsp, %rbp
   *   0xf4e8  48 83 ec 20           subq  $0x20, %rsp          ; libc++ tuple<lambda&&> frame
   *   0xf4ec  48 8b 05 dd c2 0d 00  movq  0xdc2dd(%rip), %rax  ; 0xf4f3+0xdc2dd = BSS 0xeb7d0
   *   0xf4f3  48 83 f8 ff           cmpq  $-0x1, %rax
   *   0xf4f7  74 25                 je    0xf51e               ; fast path
   *   0xf4f9..0xf508                the tuple<T&&> marshalling (ABI artefact, no TS effect)
   *   0xf50b  48 8d 3d be c2 0d 00  leaq  0xdc2be(%rip), %rdi  ; 0xf512+0xdc2be = BSS 0xeb7d0
   *   0xf512  48 8d 15 5f 00 00 00  leaq  0x5f(%rip), %rdx     ; 0xf519+0x5f = 0xf578 (the proxy)
   *   0xf519  e8 aa d8 09 00        callq 0xacdc8              ; std::__call_once stub
   *   0xf51e  48 8d 05 33 cd 0d 00  leaq  0xdcd33(%rip), %rax  ; 0xf525+0xdcd33 = BSS 0xec258
   *   0xf525  48 8b 00              movq  (%rax), %rax         ; return the singleton pointer
   *   0xf528  48 83 c4 20 / 5d / c3
   *
   * MEASURED AGAINST THE LIVE BINARY
   * (raw-port/re/oracle/OZChannelUint16_createInfo_probe.py, `arch -x86_64`, called by address at
   * slide+0xf4e4 after an opcode self-check, 10/10 checks PASS):
   *   before   once @0xeb7d0 = 0            singleton @0xec258 = NULL
   *   call #1  returns 0x600000fd4180      once -> 0xffffffffffffffff, singleton == the return value
   *   call #2  returns 0x600000fd4180      once unchanged (the fast path at 0xf4f7 is taken)
   *   built    the object at that pointer carries vtable 0xcfac8+slide at +0x00 and the
   *            PCSingleton sub-object vtable 0xcfae8+slide at +0x50 — the two words
   *            `OZChannelUint16Info::C2` @0xf5cc writes @0xf610/@0xf61a. That is what
   *            corroborates the INITIALIZER transcribed below (`operator new(0x58)` @0xf5a1 +
   *            C2 @0xf5ac + publish @0xf5b1), rather than merely "a stable pointer came back",
   *            which is true of any call_once accessor. Control in the same run: the sibling
   *            OZChannelAspectRatioFootageInfo vtables (0xccaa8/0xccac8) would FAIL both.
   */
  static createOZChannelUint16Info(): OZChannelInfoPtr {
    // @0xf4ec-0xf4f7 — the libc++ fast path: once == ~0UL means init already completed.
    if (OZChannelUint16._OZChannelUint16Info_once !== -1n) {
      // @0xf4f9-0xf519 — marshal the tuple and call std::__1::__call_once(&once, arg, proxy)
      //   through ProChannel stub 0xacdc8 (libc++, a TRUE out-of-scope extern).
      std_call_once_OZChannelUint16Info();
    }
    // @0xf51e-0xf525 — leaq &global then movq (%rax),%rax: the pointer stored there, NULL included.
    return OZChannelUint16._OZChannelUint16Info;
  }
}

// Re-export the base type placeholder so consumers don't need to know it lives
// in another file (matches the pattern used by other landed OZChannel* ports).
export type { OZCompoundChannel };

// ═════════════════════════════════════════════════════════════════════════════════════════════
// ADDITIVE EXTENSION — a LATER ledger unit; nothing above was changed.
//
//   __ZN15OZChannelUint1625createOZChannelUint16ImplEv
//     — OZChannelUint16::createOZChannelUint16Impl()   @ProChannel 0xf52e
//
// WHICH BINARY, because everything above cites Ozone: the class is emitted into BOTH frameworks.
// Ozone INLINES the once-guard into its ctor (@0x5ae6d3..0x5ae729, which is what the frontier
// stubs `ensureOZChannelUint16ImplOnce` / `loadOZChannelUint16Impl` above describe and which stay
// exactly as they were); ProChannel emits the accessor out of line @0xf52e, and that is the only
// copy that can be transcribed. Both builds share the same C++ function-local statics.
//
// FULL DISASM (20 lines). Every RIP target below was re-derived from the raw bytes of the thin
// x86_64 slice (instruction, length, disp32) rather than trusted from otool's symbolized column:
//
//   0xf52e  55                    pushq %rbp
//   0xf52f  48 89 e5              movq  %rsp, %rbp
//   0xf532  48 83 ec 20           subq  $0x20, %rsp          ; 32-byte frame: libc++ tuple<lambda&&>
//   0xf536  48 8b 05 9b c2 0d 00  movq  0xdc29b(%rip), %rax  ; 0xf53d+0xdc29b = BSS 0xeb7d8 (once)
//   0xf53d  48 83 f8 ff           cmpq  $-0x1, %rax          ; libc++ writes ~0UL on completion
//   0xf541  74 25                 je    0xf568               ; fast path: skip __call_once
//   0xf543  48 8d 45 ff           leaq  -0x1(%rbp), %rax     ; captureless-lambda slot (1 byte)
//   0xf547  48 8d 4d e8           leaq  -0x18(%rbp), %rcx    ; tuple<T&&> slot
//   0xf54b  48 89 01              movq  %rax, (%rcx)         ; tuple.head = &lambda-slot
//   0xf54e  48 8d 75 f0           leaq  -0x10(%rbp), %rsi    ; __call_once's `void* arg`
//   0xf552  48 89 0e              movq  %rcx, (%rsi)         ; *arg = &tuple
//   0xf555  48 8d 3d 7c c2 0d 00  leaq  0xdc27c(%rip), %rdi  ; 0xf55c+0xdc27c = BSS 0xeb7d8 (&once)
//   0xf55c  48 8d 15 5e 01 00 00  leaq  0x15e(%rip), %rdx    ; 0xf563+0x15e = 0xf6c1 (the proxy)
//   0xf563  e8 60 d8 09 00        callq 0xacdc8              ; 0xf568+0x9d860 = std::__call_once stub
//   0xf568  48 8d 05 f1 cc 0d 00  leaq  0xdccf1(%rip), %rax  ; 0xf56f+0xdccf1 = BSS 0xec260 (&global)
//   0xf56f  48 8b 00              movq  (%rax), %rax         ; the return value: the singleton ptr
//   0xf572  48 83 c4 20           addq  $0x20, %rsp
//   0xf576  5d                    popq  %rbp
//   0xf577  c3                    retq
//
// The stack tuple at 0xf543..0xf552 is an ABI artefact of libc++'s `__call_once` instantiation —
// two levels of indirection so the proxy can find a captureless lambda that has no state to find.
// It has no observable effect; the model below calls the proxy boundary directly, as the landed
// OZChannelAspectRatioFootage / OZChannelAspectRatio accessors do.
//
// MEASURED AGAINST THE LIVE BINARY
// (raw-port/re/oracle/OZChannelUint16_createImpl_probe.py, `arch -x86_64 /usr/bin/python3`,
// ProChannel slide 0x10a781000, 8/8 checks PASS). The symbol is a LOCAL (`t`), so it was called by
// address at slide+0xf52e, and the probe first asserts the 19 opcode bytes above are the ones
// mapped:
//   before   once @0xeb7d8 = 0             singleton @0xec260 = NULL
//   call #1  returns 0x6000015a0000       once -> 0xffffffffffffffff, singleton == the return value
//   call #2  returns 0x6000015a0000       once unchanged (the fast path at 0xf541 is taken)
// What the trace REFUTES is the `=== 1` sentinel of the 2026-07-29 call_once cheat; what it cannot
// separate is `!== -1n` from `!== 0n`, so the `-1` in the port comes from the `cmpq $-0x1` encoding
// at 0xf53d (bytes `48 83 f8 ff`), not from the trace.
// Those 8 checks cover the ACCESSOR and nothing else, which is all this unit claims: the probe
// carries no check on the object the live initializer built, because the initializer here is the
// out-of-line lambda @0xf6d2 — a separate ledger unit, deferred to a frontier throw below.
// ═════════════════════════════════════════════════════════════════════════════════════════════

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++, reached through ProChannel stub
 * 0xacdc8 @0xf563. A TRUE out-of-scope extern; there is no libc++ runtime here, so the contract the
 * accessor depends on is modelled: run the initializer once, and write ~0UL into the flag ONLY on
 * success. If the initializer raises, the flag stays 0 and a later call retries — which is what the
 * real runtime does, and why the fast-path test @0xf53d is against -1 rather than "non-zero".
 *
 * The initializer is NOT transcribed here and that is not a shortcut: unlike the sibling
 * `createOZChannelUint16Info`, whose lambda the compiler inlined into an STL template
 * instantiation, this one is its own out-of-line symbol —
 * `__ZZN15OZChannelUint1625createOZChannelUint16ImplEvENKUlvE_clEv` @ProChannel 0xf6d2, reached
 * through the proxy @0xf6c1 — i.e. a SEPARATE ledger unit. Its first instructions
 * (`leaq` the global @0xf6d7, `cmpq $0x0,(%r15)` @0xf6de, `movl $0x30,%edi` + `__Znwm` @0xf6e7,
 * then `movl $0xb0,%edi` + `__Znwm` @0xf6f3 and a ctor call @0xf706) show it allocates a 0x30-byte
 * OZChannelUint16Impl plus a 0xb0-byte sub-object, so it is real work with its own callees rather
 * than something to fold in here.
 */
function std_call_once_OZChannelUint16Impl(): void {
  if (OZChannelUint16._OZChannelUint16Impl_once === -1n) return; // libc++ fast path (mirrors 0xf53d/0xf541)
  throw new Error(
    "OZChannelUint16::createOZChannelUint16Impl()'s once-init lambda is a separate ledger unit " +
      "and is not transcribed yet: __ZZN15OZChannelUint1625createOZChannelUint16ImplEvENKUlvE_clEv " +
      "@ProChannel 0xf6d2, reached through the libc++ proxy @ProChannel 0xf6c1 from " +
      "std::__1::__call_once @ProChannel 0xf563 (stub 0xacdc8). It allocates 0x30 bytes @0xf6e7 and " +
      "0xb0 bytes @0xf6f3 via operator new, constructs the sub-object @0xf706, and stores the " +
      "OZChannelUint16Impl singleton into __ZN15OZChannelUint1620_OZChannelUint16ImplE (BSS " +
      "0xec260), which this accessor then loads @0xf56f.",
  );
}

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` for the INFO singleton — libc++, reached
 * through ProChannel stub 0xacdc8 @0xf519. A TRUE out-of-scope extern, modelled the same way as the
 * Impl one above: run the initializer once, and write ~0UL into the flag ONLY on success.
 *
 * THE INITIALIZER IS TRANSCRIBED HERE rather than deferred, and that is the one way this differs
 * from its Impl sibling. For the Impl the lambda is its own out-of-line symbol @0xf6d2 — a separate
 * ledger unit. For the Info the compiler INLINED the lambda into the libc++ template instantiation
 *   __ZNSt3__18__invokeB9nqe210106IJZN15OZChannelUint1625createOZChannelUint16InfoEvEUlvE_EEE...
 * @ProChannel 0xf588; there is no `...NKUlvE_clEv` symbol for the Info side at all (the inventory
 * runs 0xf578 proxy, 0xf588 __invoke, then 0xf5cc is already the Info ctor). STL template
 * instantiations are filtered out of the port queue, so deferring would defer to a unit nobody can
 * claim, and its only in-scope callee — `OZChannelUint16Info::OZChannelUint16Info()` @ProChannel
 * 0xf5cc — is ALREADY PORTED in raw-port/src/channels/OZChannelUint16Info.ts, so a throw here would
 * be a throw-stub for a ported in-scope callee.
 *
 *   0xf578  proxy: pushq %rbp / movq %rsp,%rbp / movq (%rdi),%rax / movq (%rax),%rdi /
 *                  popq %rbp / jmp 0xf588            ; unpacks tuple<lambda&&> -> __invoke
 *   0xf588  55 48 89 e5           pushq %rbp / movq %rsp,%rbp
 *   0xf58c  41 56 53              pushq %r14 / pushq %rbx
 *   0xf58f  4c 8d 35 c2 cc 0d 00  leaq  0xdccc2(%rip),%r14   ; 0xf596+0xdccc2 = BSS 0xec258
 *   0xf596  49 83 3e 00           cmpq  $0x0, (%r14)         ; already published?
 *   0xf59a  75 18                 jne   0xf5b4               ; yes -> return, allocate nothing
 *   0xf59c  bf 58 00 00 00        movl  $0x58, %edi          ; sizeof(OZChannelUint16Info)
 *   0xf5a1  e8 a6 d8 09 00        callq 0xace4c              ; operator new (__Znwm)
 *   0xf5a6  48 89 c3 / 48 89 c7   movq  %rax,%rbx / movq %rax,%rdi
 *   0xf5ac  e8 1b 00 00 00        callq 0xf5cc               ; OZChannelUint16Info::C2
 *   0xf5b1  49 89 1e              movq  %rbx, (%r14)         ; publish the singleton
 *   0xf5b4  5b 41 5e 5d c3        popq %rbx / popq %r14 / popq %rbp / retq
 *   unwind pad @0xf5b9: movq %rax,%r14 / movq %rbx,%rdi / callq 0xace04 (operator delete) /
 *                       movq %r14,%rdi / callq 0xacaf2 (_Unwind_Resume) — if C2 throws, the
 *                       0x58-byte allocation is freed and the exception propagates WITHOUT the
 *                       store @0xf5b1, so the global stays NULL and the flag stays 0.
 */
function std_call_once_OZChannelUint16Info(): void {
  if (OZChannelUint16._OZChannelUint16Info_once === -1n) return; // libc++ fast path
  // @0xf58f-0xf59a — r14 = &global; if it is already non-null, allocate nothing and return.
  if (OZChannelUint16._OZChannelUint16Info === null) {
    // @0xf59c-0xf5ac — operator new(0x58) (stub 0xace4c) then OZChannelUint16Info::C2 @0xf5cc.
    //   The ported ctor raises while its own base (OZChannelInfo) is a frontier class; that raise
    //   is that class's gap, not this one's, and it correctly leaves the flag at 0 by skipping the
    //   write below — exactly what the unwind pad @0xf5b9 does in the machine.
    const created = new OZChannelUint16Info();
    // @0xf5b1 — publish: *(&global) = the new object.
    OZChannelUint16._OZChannelUint16Info = created;
  }
  // libc++ writes ~0UL into the flag only after the initializer returns normally (@0xf4f3's
  // sentinel). A throw above skips this line, exactly like the real runtime.
  OZChannelUint16._OZChannelUint16Info_once = -1n;
}
