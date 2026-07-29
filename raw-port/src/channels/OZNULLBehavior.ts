// OZNULLBehavior.ts — raw transcription of Ozone `OZNULLBehavior`.
//
// A minimal OZBehavior-derived "null / no-op" behavior class. Every method is a
// thin ctor/dtor/operator= glue; the only real work is one vcall in the 5-arg
// C2 that appends the passed-in name to a sub-object description via a virtual
// setter on the secondary sub-vtable slot +0x70.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbols ported (Itanium C1/C2 share bodies, D0/D1/D2 collapse to two forms):
//   @0x354030  OZNULLBehavior(OZFactory*, PCString const&, uint)          [C2]
//                __ZN14OZNULLBehaviorC2EP9OZFactoryRK8PCStringj
//   @0x3540f0  OZNULLBehavior(OZFactory*, PCString const&, uint)          [C1]
//                __ZN14OZNULLBehaviorC1EP9OZFactoryRK8PCStringj (jmp shim to C2)
//   @0x354100  OZNULLBehavior(OZNULLBehavior const&, uint)                [C2 copy]
//                __ZN14OZNULLBehaviorC2ERKS_j
//   @0x354140  OZNULLBehavior(OZNULLBehavior const&, uint)                [C1 copy]
//                __ZN14OZNULLBehaviorC1ERKS_j (== C2 copy body — separate emitted body,
//                same instruction sequence with different RIP-rel targets)
//   @0x354180  ~OZNULLBehavior()                                          [D2]
//                __ZN14OZNULLBehaviorD2Ev (jmp OZBehavior::~OZBehavior)
//   @0x354190  ~OZNULLBehavior()                                          [D1]
//                __ZN14OZNULLBehaviorD1Ev (jmp OZBehavior::~OZBehavior)
//   @0x3541c0  ~OZNULLBehavior()                                          [D0 deleting]
//                __ZN14OZNULLBehaviorD0Ev  (calls OZBehavior::~OZBehavior then tail-jmp
//                                            __ZdlPv operator delete)
//   @0x354240  operator=(OZBehavior const&)
//                __ZN14OZNULLBehavioraSERK10OZBehavior (jmp OZBehavior::operator=)
//
// Source disassembly:
//   raw-port/re/disasm/OZNULLBehavior.__ZN14OZNULLBehavior*.s
//
// VTABLE (`resolve.py Ozone vtable OZNULLBehavior`):
//   __ZTV14OZNULLBehavior @0x852350; installed primary ptr = table+0x10 = 0x852360.
//   Sub-vtable slice at (installed +0x10) = 0x852370-ish covers the OZBehavior
//   virtual override family. Every non-override slot inherits OZBehavior /
//   OZFactoryBase methods. Selected slots:
//     *0x00 -> 0x354190  ~OZNULLBehavior [D1]
//     *0x08 -> 0x3541c0  ~OZNULLBehavior [D0 deleting]
//     *0x50 -> 0x354240  OZNULLBehavior::operator=(OZBehavior const&)
//     *0x70 -> 0x10c6f0  OZBehavior::didReorder(OZBehavior*)  (inherited)
//   (No non-inherited method other than the three destructor slots + operator=.)
//
// SECONDARY VPTR INSTALLED (5-arg C2 body @0x354046..0x354062):
//   +0x000 vptr primary   = 0x852360   (leaq 0x4fe313(%rip) @0x354046; target = 0x852360)
//   +0x010 vptr secondary = 0x8525f0   (leaq 0x4fe591(%rip) @0x354050; target = 0x8525f0)
//   +0x028 vptr tertiary  = 0x852840   (leaq 0x4fe7de(%rip) @0x35405b; target = 0x852840)
//   (Numeric targets recovered via RIP arithmetic on the leaq bytes; `resolve.py sym`
//    confirms 0x8525f0 = "vtable for OZNULLBehavior (+0x10)".)
//
// COPY-CTOR VPTR INSTALLED (C2 copy body @0x35414e..0x35416a):
//   +0x000 = 0x852360   (leaq 0x4fe20b(%rip) @0x35414e; target = 0x852360)
//   +0x010 = 0x8525f0   (leaq 0x4fe489(%rip) @0x354158; target = 0x8525f0)
//   +0x028 = 0x852840   (leaq 0x4fe6d6(%rip) @0x354163; target = 0x852840)
//   Same three constants — verifies the copy-ctor lands on the same vtable slice.
//
// STRUCT LAYOUT (recovered from ctor + vcall):
//   +0x000  vptr  primary   OZNULLBehavior vptr = 0x852360
//   +0x010  vptr  secondary sub-object vptr    = 0x8525f0
//                            (its slot +0x70 is invoked with args
//                             (thisSub, PCString&, 0) — see 5-arg C2 @0x35409f)
//   +0x028  vptr  tertiary sub-object vptr     = 0x852840
//   (No non-vptr writable state in the 5-arg C2. The base OZBehavior owns any
//    other fields; those land in OZBehavior.ts.)
//
// CONSTANTS (via `resolve.py Ozone`):
//   Objc CFString ref @0x354074 RIP-rel (target = 0x35407b + 0x548395 = 0x89c410
//                                        — a __cfstring literal, opaque to us).
//
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */

// ── Frontier types ─────────────────────────────────────────────────────────

/** OZFactory* — opaque frontier. */
export interface OZFactoryLike {
  readonly __OZFactory_opaque: unique symbol;
}
/** PCString — opaque frontier. */
export interface PCStringLike {
  readonly __PCString_opaque: unique symbol;
}
/** OZBehavior — opaque base frontier. */
export interface OZBehavior {
  readonly __OZBehavior_opaque: unique symbol;
}
/** CFStringRef — opaque frontier. */
export interface CFStringRefLike {
  readonly __CFStringRef_opaque: unique symbol;
}

// ── Frontier stubs — every undecoded external callee gets a throw citing addr.

/** `_theApp` global — `movq (_theApp),%rax; movq 0x48(%rax),%rdx` @0x354066.
 *  Loads a CFBundleRef used as the PCString ctor's bundle arg. */
function theApp_getBundle_stub(): CFStringRefLike {
  throw new Error("_theApp.field@0x48 (CFBundle for PCString) @Ozone 0x354066 not yet transcribed");
}

/** `__ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_` — PCString(CFStringRef, CFBundleRef, CFBundleRef)
 *  [C1], @Ozone 0x6df08a stub target. */
function PCString_ctor_cfstring_stub(_out: PCStringLike, _cfstr: CFStringRefLike, _b1: unknown, _b2: unknown): void {
  throw new Error("PCString(CFStringRef, CFBundleRef, CFBundleRef) [C1] @Ozone 0x6df08a not yet transcribed");
}

/** `__ZN8PCString6appendERKS_` — PCString::append(PCString const&), @Ozone 0x6df060 stub target. */
function PCString_append_stub(_dst: PCStringLike, _src: PCStringLike): void {
  throw new Error("PCString::append(PCString const&) @Ozone 0x6df060 not yet transcribed");
}

/** `__ZN8PCStringD1Ev` — PCString::~PCString() [D1], @Ozone 0x6df0c6 stub target. */
function PCString_dtor_stub(_p: PCStringLike): void {
  throw new Error("PCString::~PCString() [D1] @Ozone 0x6df0c6 not yet transcribed");
}

/** OZBehavior C2 (5-arg factory), C2 copy, D2, operator= — direct-call frontiers. */
function OZBehavior_C2_full_stub(_self: OZNULLBehavior, _factory: OZFactoryLike, _name: PCStringLike, _uu: number): void {
  throw new Error("OZBehavior(OZFactory*, PCString&, uint) [C2] @Ozone direct-call (@0x354041) not yet transcribed");
}
function OZBehavior_C2_copy_stub(_self: OZNULLBehavior, _src: OZNULLBehavior, _uu: number): void {
  throw new Error("OZBehavior(OZBehavior const&, uint) [C2] @Ozone direct-call (@0x354109) not yet transcribed");
}
function OZBehavior_D2_stub(_self: OZNULLBehavior | OZBehavior): void {
  throw new Error("OZBehavior::~OZBehavior() [D2] @Ozone direct-call (@0x3541c9) not yet transcribed");
}
function OZBehavior_operatorAssign_stub(_self: OZNULLBehavior, _other: OZBehavior): OZNULLBehavior {
  throw new Error("OZBehavior::operator=(OZBehavior const&) @Ozone direct-call (@0x354245) not yet transcribed");
}

/** Secondary-vptr sub-object vcall @0x35409f — `callq *0x70(%rax)` where
 *  `%rax = *(this+0x10)` (the secondary sub-vtable). The invocation is
 *  `vcall(subObject, PCString&, 0)`.
 *  Semantically: sets/records the behavior-info's user-visible name by
 *  appending the passed-in `name` to a bundle-localized prefix built into
 *  a scratch PCString. The specific override target is a slot on the
 *  OZNULLBehavior secondary-sub-object vtable (0x8525f0), and the sub-object
 *  vtable's slot +0x70 is not resolved by `resolve.py` here (the tool lists
 *  the FLAT vtable @0x852350 which — at combined-slot 0x70 — is
 *  OZBehavior::didReorder; but the vcall goes through the *sub-object slice*
 *  starting at 0x8525f0, whose slot +0x70 sits INSIDE that sub-vtable, not
 *  in the primary). Kept as a throwing stub citing the call site. */
function secondaryVptr_slot_0x70_vcall_stub(
  _subObject: unknown,
  _arg: PCStringLike,
  _flag: number,
): unknown {
  throw new Error(
    "OZNULLBehavior secondary sub-vtable slot +0x70 vcall @Ozone 0x35409f " +
      "(this+0x10 vptr = 0x8525f0) not yet transcribed",
  );
}

/** `__ZdlPv` — operator delete(void*), @Ozone 0x6dfc36 stub target. */
function operator_delete_stub(_p: unknown): void {
  throw new Error("operator delete(void*) @Ozone 0x6dfc36 not yet transcribed");
}

// ── Constants (RIP-relative literal cites) ─────────────────────────────────

/** VTABLE addresses installed by ctors. All three cited symbolically. */
export const VTBL_OZNULLBehavior_primary_VA_0x852360 = 0x852360;
export const VTBL_OZNULLBehavior_secondary_VA_0x8525f0 = 0x8525f0;
export const VTBL_OZNULLBehavior_tertiary_VA_0x852840 = 0x852840;

// ── The class shape ────────────────────────────────────────────────────────

/**
 * `OZNULLBehavior` — layout as recovered from the ctors. The class extends
 * OZBehavior, so all non-vptr state is inherited (and lives in OZBehavior.ts).
 */
export interface OZNULLBehavior {
  /** +0x000 primary vptr. */
  vptrPrimary_at_0x000: number;
  /** +0x010 secondary sub-object vptr. */
  vptrSecondary_at_0x010: number;
  /** +0x028 tertiary sub-object vptr. */
  vptrTertiary_at_0x028: number;
}

// ── Ctors ──────────────────────────────────────────────────────────────────

/**
 * `OZNULLBehavior::OZNULLBehavior(OZFactory*, PCString const&, unsigned int)` [C2]
 * @Ozone 0x354030.
 *
 * Line-for-line:
 *   1. callq OZBehavior::OZBehavior(factory, name, uu)                  @0x354041
 *   2. install primary/secondary/tertiary vptrs (0x852360 / 0x8525f0 / 0x852840)
 *                                                                        @0x354046..0x354062
 *   3. Build scratch PCString from Objc-cfstring @0x354074 using bundle = _theApp.field@0x48
 *      (PCString ctor at @0x354081; stub target @Ozone 0x6df08a).
 *   4. `scratch.append(*name)`                                            @0x35408d
 *   5. Load `this+0x10` (secondary sub-object) into %rdi; call its vtable
 *      slot +0x70 with args (thisSub, &scratch, 0)                        @0x35409f
 *   6. scratch.~PCString()                                                @0x3540a6
 *
 * The un-decoded piece is the exact virtual function that slot +0x70 of the
 * secondary sub-vtable dispatches to. It is emitted from OZNULLBehavior's own
 * vtable, so this is a self-call into a class-owned override; keeping it as a
 * throwing stub preserves the frontier signal.
 */
export function OZNULLBehavior_C2_at_VA_0x354030(
  self: OZNULLBehavior,
  factory: OZFactoryLike,
  name: PCStringLike,
  uu: number,
): void {
  // (1)
  OZBehavior_C2_full_stub(self, factory, name, uu);
  // (2)
  self.vptrPrimary_at_0x000 = VTBL_OZNULLBehavior_primary_VA_0x852360;
  self.vptrSecondary_at_0x010 = VTBL_OZNULLBehavior_secondary_VA_0x8525f0;
  self.vptrTertiary_at_0x028 = VTBL_OZNULLBehavior_tertiary_VA_0x852840;
  // (3) scratch PCString from bundle-relative cfstring literal
  const scratch: PCStringLike = {} as PCStringLike;
  const bundle = theApp_getBundle_stub(); // @0x354066
  PCString_ctor_cfstring_stub(scratch, {} as CFStringRefLike /* @0x354074 objc cfstring ref */, bundle, bundle);
  // (4) scratch.append(name)
  PCString_append_stub(scratch, name);
  // (5) secondary-vptr slot +0x70 vcall — sets the behavior-info name.
  //     rdi = this+0x10 (the secondary sub-object pointer), rax = *(rdi),
  //     rsi = &scratch, rdx = 0.
  const subObject = { __this_plus_0x10: self } as const;
  secondaryVptr_slot_0x70_vcall_stub(subObject, scratch, 0);
  // (6)
  PCString_dtor_stub(scratch);
}

/** C1 alias — shares C2 body via `jmp` shim @0x3540f5. @Ozone 0x3540f0. */
export const OZNULLBehavior_C1_at_VA_0x3540f0 = OZNULLBehavior_C2_at_VA_0x354030;

/**
 * `OZNULLBehavior::OZNULLBehavior(OZNULLBehavior const&, unsigned int)` [C2 copy]
 * @Ozone 0x354100.
 *
 * Line-for-line:
 *   1. callq OZBehavior::OZBehavior(other, uu)                            @0x354109
 *   2. install primary/secondary/tertiary vptrs (same three addresses)    @0x35410e..0x35412a
 */
export function OZNULLBehavior_C2_copy_at_VA_0x354100(
  self: OZNULLBehavior,
  other: OZNULLBehavior,
  uu: number,
): void {
  OZBehavior_C2_copy_stub(self, other as unknown as OZNULLBehavior, uu);
  self.vptrPrimary_at_0x000 = VTBL_OZNULLBehavior_primary_VA_0x852360;
  self.vptrSecondary_at_0x010 = VTBL_OZNULLBehavior_secondary_VA_0x8525f0;
  self.vptrTertiary_at_0x028 = VTBL_OZNULLBehavior_tertiary_VA_0x852840;
}

/** C1 alias — @Ozone 0x354140. Same-shaped body (separate emitted copy). */
export const OZNULLBehavior_C1_copy_at_VA_0x354140 = OZNULLBehavior_C2_copy_at_VA_0x354100;

// ── Destructors ────────────────────────────────────────────────────────────

/**
 * `~OZNULLBehavior()` [D2] @Ozone 0x354180 — trivial: `jmp OZBehavior::~OZBehavior()`.
 * Faithful port: forward to the base D2.
 */
export function OZNULLBehavior_D2_at_VA_0x354180(self: OZNULLBehavior): void {
  OZBehavior_D2_stub(self);
}

/** D1 — @Ozone 0x354190. Same body as D2 (both are jmp shims). */
export const OZNULLBehavior_D1_at_VA_0x354190 = OZNULLBehavior_D2_at_VA_0x354180;

/**
 * `~OZNULLBehavior()` [D0 deleting] @Ozone 0x3541c0.
 *
 * Body @0x3541c0..0x3541d7:
 *   callq OZBehavior::~OZBehavior()      @0x3541c9
 *   jmp   __ZdlPv (operator delete)      @0x3541d7 (with %rdi = this — set @0x3541ce)
 */
export function OZNULLBehavior_D0_deleting_at_VA_0x3541c0(self: OZNULLBehavior): void {
  OZBehavior_D2_stub(self);
  operator_delete_stub(self);
}

// ── operator= ──────────────────────────────────────────────────────────────

/**
 * `OZNULLBehavior::operator=(OZBehavior const&)` @Ozone 0x354240.
 * Trivial `jmp OZBehavior::operator=(OZBehavior const&)`.
 */
export function OZNULLBehavior_operatorAssign_at_VA_0x354240(
  self: OZNULLBehavior,
  other: OZBehavior,
): OZNULLBehavior {
  return OZBehavior_operatorAssign_stub(self, other);
}
