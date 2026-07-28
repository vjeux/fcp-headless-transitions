// raw-port/src/render/OZRotoMask.ts
//
// FCP `OZRotoMask` (Ozone framework) — thin subclass of `OZRotoshape`.
// The class body decoded here is entirely made of forwarders / thunks to
// `OZRotoshape` (its primary base) plus a small amount of local logic in
// `isActiveAtTime` / `isActiveInTimeRange` that short-circuits to `false`
// when a masked-object flag is set.
//
// Source binary:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone
//
// Decoded symbols (all bodies fully transcribed below):
//   0x36aff0  OZRotoMask::OZRotoMask(OZFactory*, PCString const&, unsigned int)   [C2 base ctor]
//   0x36b050  OZRotoMask::OZRotoMask(OZFactory*, PCString const&, unsigned int)   [C1 complete ctor — identical to C2, different vtable RIPs]
//   0x36b0b0  OZRotoMask::OZRotoMask(OZRotoMask const&, unsigned int)             [C2 copy-like ctor]
//   0x36b110  OZRotoMask::OZRotoMask(OZRotoMask const&, unsigned int)             [C1 copy-like ctor — identical to C2, different vtable RIPs]
//   0x36b170  OZRotoMask::operator=(OZSceneNode const&)                            [primary: tail-jmp OZRotoshape::operator=]
//   0x36b180  non-virtual thunk to OZRotoMask::operator=(OZSceneNode const&)      [thisadj -0xc8; then tail-jmp]
//   0x36b1a0  OZRotoMask::isActiveAtTime(CMTime, bool, bool, bool) const           [primary body: masked-obj check + tail-jmp base]
//   0x36b1d0  non-virtual thunk to OZRotoMask::isActiveAtTime(...)                 [reads field via +0x3a8, thisadj -0xd8; then tail-jmp base]
//   0x36b210  OZRotoMask::isActiveInTimeRange(PCTimeRange const&, bool, bool, bool) const  [primary body: masked-obj check + tail-jmp base]
//   0x36b2d0  OZRotoMask::~OZRotoMask()                                            [D1 complete dtor — tail-jmp OZRotoshape::~OZRotoshape D2]
//   0x36b2e0  OZRotoMask::~OZRotoMask()                                            [D0 deleting dtor — OZRotoshape::~OZRotoshape D2; then tail-jmp ::operator delete]
//
// (The brief lists 9 methods; the two non-virtual thunks at 0x36b180 and
//  0x36b1d0 are separate decoded bodies emitted immediately after their
//  primary functions in the framework's `otool -tV` layout, and are
//  therefore included here for completeness — the base class has bases
//  at offsets +0xc8 and +0xd8 relative to primary `this`, so C++ needs
//  distinct thunk entries at those secondary vtable slots.)
//
// Primary vtable @ 0x8536e0 (installed-pointer 0x8536f0). Slots relevant here
// (from `raw-port/army/tools/vtable.py Ozone OZRotoMask`):
//   *0x38 -> 0x36b2d0  OZRotoMask::~OZRotoMask()               [D1 complete dtor]
//   *0x40 -> 0x36b2e0  OZRotoMask::~OZRotoMask()               [D0 deleting dtor]
//   *0x48 -> 0x36b170  OZRotoMask::operator=(OZSceneNode const&)
// (Other slots inherit unmodified OZRotoshape methods; OZRotoMask overrides
//  only these three at the primary-base sub-vtable.)
//
// The four ctors ALL install FIVE vtable pointers on the object; the RIP
// offsets differ per-ctor but every one resolves to the same set of five
// secondary vtable-payload addresses on the OZRotoMask vtable object:
//   this->vtable       @ +0x0    <- 0x8536f0 (main vtable payload; +0x10 into vtable object 0x8536e0)
//   this->vtable_c8    @ +0xc8   <- 0x853988 (== vtable object + 0x2a8; secondary base sub-vtable)
//   this->vtable_d8    @ +0xd8   <- 0x854280 (== vtable object + 0xba0)
//   this->vtable_f0    @ +0xf0   <- 0x8544d8 (== vtable object + 0xdf8)
//   this->vtable_1a40  @ +0x1a40 <- 0x854530 (== vtable object + 0xe50)
// Each RIP disp was verified: leaq instruction end + disp = target addr.
// (These four secondary vtables correspond to the OZRotoMask class's
//  multiple-inheritance secondary bases; identifying WHICH bases requires
//  decoding OZRotoshape / OZLockingElement / OZLocking / ... — still frontier.)
//
// Ctor bodies:
//   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
//   movq %rdi, %rbx                                    # this
//   callq __ZN11OZRotoshapeC2E<...args...>              # base ctor OZRotoshape::OZRotoshape(...)
//   leaq <disp1>(%rip), %rax; movq %rax, (%rbx)         # install main vtable @0x8536f0
//   leaq <disp2>(%rip), %rax; movq %rax, 0xc8(%rbx)     # install secondary vtable @0x853988
//   leaq <disp3>(%rip), %rax; movq %rax, 0xd8(%rbx)     # install secondary vtable @0x854280
//   leaq <disp4>(%rip), %rax; movq %rax, 0xf0(%rbx)     # install secondary vtable @0x8544d8
//   leaq <disp5>(%rip), %rax; movq %rax, 0x1a40(%rbx)   # install secondary vtable @0x854530
//   addq $0x8,%rsp; popq %rbx; popq %rbp; retq
//
// isActiveAtTime primary @0x36b1a0 (byte-for-byte):
//   pushq %rbp; movq %rsp,%rbp
//   movq   0x480(%rdi), %rax                            # p = this->field_0x480 (an OZ* / OZSceneObject*)
//   testq  %rax, %rax
//   je     0x36b1b9                                     # if p == null -> forward to base
//   testb  $0x4, 0x3f8(%rax)                            # else if (p->field_0x3f8 & 4)
//   jne    0x36b1c9                                     #      -> return false
//   0x36b1b9: movzbl %sil,%esi; movzbl %dl,%edx; movzbl %cl,%ecx  # zero-extend bool args
//            popq %rbp
//            jmp   OZRotoshape::isActiveAtTime(CMTime,bool,bool,bool) const
//   0x36b1c9: xorl %eax,%eax; popq %rbp; retq            # return false
//
// isActiveInTimeRange primary @0x36b210 (byte-for-byte identical shape;
// takes a PCTimeRange& (%rsi) and three bool args in %rdx/%rcx/%r8):
//   pushq %rbp; movq %rsp,%rbp
//   movq   0x480(%rdi), %rax
//   testq  %rax, %rax
//   je     0x36b229
//   testb  $0x4, 0x3f8(%rax)
//   jne    0x36b239
//   0x36b229: movzbl %dl,%edx; movzbl %cl,%ecx; movzbl %r8b,%r8d
//             popq %rbp
//             jmp OZRotoshape::isActiveInTimeRange(PCTimeRange const&, bool,bool,bool) const
//   0x36b239: xorl %eax,%eax; popq %rbp; retq
//
// operator= primary @0x36b170:
//   pushq %rbp; movq %rsp,%rbp; popq %rbp
//   jmp   OZRotoshape::operator=(OZSceneNode const&)
// operator= thunk @0x36b180 (non-virtual thunk for secondary base at +0xc8):
//   pushq %rbp; movq %rsp,%rbp
//   addq $-0xc8, %rdi                                   # this -= 0xc8 (back to primary this)
//   popq %rbp
//   jmp OZRotoshape::operator=(OZSceneNode const&)
//
// D1 complete dtor @0x36b2d0:
//   pushq %rbp; movq %rsp,%rbp; popq %rbp
//   jmp __ZN11OZRotoshapeD2Ev                           # tail-jmp base D2
// D0 deleting dtor @0x36b2e0:
//   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
//   movq %rdi, %rbx
//   callq __ZN11OZRotoshapeD2Ev                         # destroy base subobject
//   movq %rbx, %rdi
//   addq $0x8,%rsp; popq %rbx; popq %rbp
//   jmp 0x6dfc36                                        # symbol stub for ::operator delete (__ZdlPv)
//
// FRONTIER CALLEES (each surfaced as a throwing stub citing @0xADDR):
//   __ZN11OZRotoshapeC2EP9OZFactoryRK8PCStringj   OZRotoshape::OZRotoshape(OZFactory*, PCString const&, unsigned int)  @Ozone (not yet transcribed)
//   __ZN11OZRotoshapeC2ERKS_j                     OZRotoshape::OZRotoshape(OZRotoshape const&, unsigned int)           @Ozone (not yet transcribed)
//   __ZN11OZRotoshapeaSERK11OZSceneNode           OZRotoshape::operator=(OZSceneNode const&)                            @Ozone (not yet transcribed)
//   __ZNK11OZRotoshape14isActiveAtTimeE6CMTimebbb OZRotoshape::isActiveAtTime(CMTime, bool, bool, bool) const           @Ozone (not yet transcribed)
//   __ZNK11OZRotoshape19isActiveInTimeRangeERK11PCTimeRangebbb  OZRotoshape::isActiveInTimeRange(PCTimeRange const&, bool, bool, bool) const  @Ozone (not yet transcribed)
//   __ZN11OZRotoshapeD2Ev                         OZRotoshape::~OZRotoshape()                                           @Ozone (not yet transcribed)
//   __ZdlPv                                       ::operator delete(void*) [symbol stub @Ozone 0x6dfc36]                — no-op in GC'd TS.
//
// DECODE-DON'T-FIT: every hex literal here is either the address of a
// decoded symbol, an @DATA_CONST vtable payload address computed from a
// leaq disp, or a struct-field offset read directly from a mov displacement
// in the disassembled body.  No numeric constant is invented.

import type { CMTime } from "../infra/CMTime";
import type { PCTimeRange } from "../infra/PCTimeRange";

// ── Frontier types (not yet ported) ────────────────────────────────────────

/**
 * Opaque handle to Ozone's PCString (referenced by OZRotoMask's factory-
 * argument ctor). The struct layout for PCString is decoded elsewhere; here
 * we only need a nominal brand because OZRotoMask's ctor body doesn't touch
 * the string bytes — it forwards it to OZRotoshape::OZRotoshape.
 */
export interface PCString {
  readonly __brand_PCString: unique symbol;
}

/**
 * Opaque handle to Ozone's OZFactory (see OZChannel.ts note — a factory
 * pointer is passed but not dereferenced by OZRotoMask's own body).
 */
export interface OZFactory {
  readonly __brand_OZFactory: unique symbol;
}

/** Opaque handle to OZSceneNode (used only as `const&` in operator=). */
export interface OZSceneNode {
  readonly __brand_OZSceneNode: unique symbol;
}

/**
 * Opaque handle to OZRotoshape — OZRotoMask's primary base. Not yet ported.
 * Every OZRotoMask ctor calls one of OZRotoshape's C2 base ctors; every
 * OZRotoMask dtor tail-jmps into OZRotoshape::~OZRotoshape. The vtable
 * overrides (isActiveAtTime/isActiveInTimeRange/operator=/dtors) are
 * secondary layers on top of the same base subobject.
 */
export interface OZRotoshape {
  readonly __brand_OZRotoshape: unique symbol;
}

// ── Frontier stubs — undecoded OZRotoshape entry points ────────────────────

/**
 * `OZRotoshape::OZRotoshape(OZFactory*, PCString const&, unsigned int)`
 * — Ozone `__ZN11OZRotoshapeC2EP9OZFactoryRK8PCStringj`. Not yet transcribed.
 * Called from OZRotoMask's `(OZFactory*, PCString const&, unsigned int)`
 * ctors at Ozone @0x36aff9 (C2) and @0x36b059 (C1).
 */
function OZRotoshape_ctor_factoryStringUint_stub(
  _self: OZRotoMask,
  _factory: OZFactory | null,
  _name: PCString,
  _flags: number,
): void {
  throw new Error(
    "OZRotoshape::OZRotoshape(OZFactory*, PCString const&, unsigned int) @Ozone (__ZN11OZRotoshapeC2EP9OZFactoryRK8PCStringj) is not yet transcribed.",
  );
}

/**
 * `OZRotoshape::OZRotoshape(OZRotoshape const&, unsigned int)`
 * — Ozone `__ZN11OZRotoshapeC2ERKS_j`. Not yet transcribed.
 * Called from OZRotoMask's `(OZRotoMask const&, unsigned int)` ctors at
 * Ozone @0x36b0b9 (C2) and @0x36b119 (C1). (The subclass-const-ref arg
 * decays to a base-const-ref for the base ctor because OZRotoMask *is-a*
 * OZRotoshape.)
 */
function OZRotoshape_ctor_copyUint_stub(
  _self: OZRotoMask,
  _src: OZRotoMask,
  _flags: number,
): void {
  throw new Error(
    "OZRotoshape::OZRotoshape(OZRotoshape const&, unsigned int) @Ozone (__ZN11OZRotoshapeC2ERKS_j) is not yet transcribed.",
  );
}

/**
 * `OZRotoshape::operator=(OZSceneNode const&)` — Ozone
 * `__ZN11OZRotoshapeaSERK11OZSceneNode`. Not yet transcribed. Called from
 * OZRotoMask::operator= (primary @0x36b175 tail-jmp) and its non-virtual
 * thunk (@0x36b18c tail-jmp).
 */
function OZRotoshape_operatorEq_stub(_self: OZRotoMask, _rhs: OZSceneNode): OZRotoMask {
  throw new Error(
    "OZRotoshape::operator=(OZSceneNode const&) @Ozone (__ZN11OZRotoshapeaSERK11OZSceneNode) is not yet transcribed.",
  );
}

/**
 * `OZRotoshape::isActiveAtTime(CMTime, bool, bool, bool) const` — Ozone
 * `__ZNK11OZRotoshape14isActiveAtTimeE6CMTimebbb`. Not yet transcribed.
 * Called from OZRotoMask::isActiveAtTime primary (tail-jmp @0x36b1c4) and
 * from its non-virtual thunk (tail-jmp @0x36b1fb).
 */
function OZRotoshape_isActiveAtTime_stub(
  _self: OZRotoMask,
  _t: CMTime,
  _a: boolean,
  _b: boolean,
  _c: boolean,
): boolean {
  throw new Error(
    "OZRotoshape::isActiveAtTime(CMTime, bool, bool, bool) const @Ozone (__ZNK11OZRotoshape14isActiveAtTimeE6CMTimebbb) is not yet transcribed.",
  );
}

/**
 * `OZRotoshape::isActiveInTimeRange(PCTimeRange const&, bool, bool, bool) const`
 * — Ozone `__ZNK11OZRotoshape19isActiveInTimeRangeERK11PCTimeRangebbb`.
 * Not yet transcribed. Called from OZRotoMask::isActiveInTimeRange primary
 * (tail-jmp @0x36b234).
 */
function OZRotoshape_isActiveInTimeRange_stub(
  _self: OZRotoMask,
  _range: PCTimeRange,
  _a: boolean,
  _b: boolean,
  _c: boolean,
): boolean {
  throw new Error(
    "OZRotoshape::isActiveInTimeRange(PCTimeRange const&, bool, bool, bool) const @Ozone (__ZNK11OZRotoshape19isActiveInTimeRangeERK11PCTimeRangebbb) is not yet transcribed.",
  );
}

/**
 * `OZRotoshape::~OZRotoshape()` — Ozone `__ZN11OZRotoshapeD2Ev`. Not yet
 * transcribed. Called from OZRotoMask's dtors: D1 @0x36b2d5 (tail-jmp),
 * D0 @0x36b2e9 (call).
 */
function OZRotoshape_dtor_stub(_self: OZRotoMask): void {
  throw new Error(
    "OZRotoshape::~OZRotoshape() @Ozone (__ZN11OZRotoshapeD2Ev) is not yet transcribed.",
  );
}

/**
 * `::operator delete(void*)` — libc++abi via symbol-stub @Ozone 0x6dfc36
 * (tail-target of OZRotoMask::~OZRotoMask D0). In a GC'd runtime this is
 * a no-op; documented here so the D0 call-site retains full provenance.
 */
function libcxx_operator_delete_stub(_p: OZRotoMask | null): void {
  // @Ozone 0x36b2f7  jmp 0x6dfc36 (__stubs entry for __ZdlPv). No-op in TS.
}

// ── OZRotoMask — the class itself ─────────────────────────────────────────

/**
 * `OZRotoMask` — Ozone framework scene node representing a roto-mask.
 * Extends `OZRotoshape` in the C++ ABI. The class body decoded so far is
 * (a) five vtable installs per ctor identifying the primary + four
 * secondary-base sub-vtables, (b) a small "is-my-masked-object-marked-
 * bit-2?" short-circuit in the two isActive queries, (c) forwarders for
 * operator= and dtors.
 *
 * IMPORTANT — decoded struct layout so far (partial):
 *   ---- inherited from OZRotoshape (opaque, size >= 0x1a40 + slot) ----
 *     +0x00    void*   vtable                (main; overwritten by ctor to 0x8536f0)
 *     +0xc8    void*   vtable_secondary_c8   (overwritten to 0x853988)
 *     +0xd8    void*   vtable_secondary_d8   (overwritten to 0x854280)
 *     +0xf0    void*   vtable_secondary_f0   (overwritten to 0x8544d8)
 *     +0x480   void*   maskedObject_ptr      (read by isActiveAtTime  @0x36b1a4)
 *     +0x3a8   void*   maskedObject_ptr_sec  (read by isActiveAtTime thunk @0x36b1d4;
 *                                             = +0x480 relative to primary this,
 *                                             seen from the thunk's secondary-base view
 *                                             at this + 0xd8: 0x3a8 + 0xd8 = 0x480 ✓)
 *     +0x1a40  void*   vtable_secondary_1a40 (overwritten to 0x854530)
 *   ---- The pointed-to "masked object" (whatever OZ* base it is) ----
 *     +0x3f8   u32     flags                 (bit 2 = "masked object is inactive")
 *
 * Sub-classes have not been decoded, so we model OZRotoshape as an opaque
 * brand and mirror the ctor / dtor / method call-sites as throwing stubs.
 */
export class OZRotoMask {
  // Vtable payload addresses installed by every ctor.
  // @Ozone 0x8536f0 = OZRotoMask primary vtable payload (typeinfo header at 0x8536e0).
  static readonly VTABLE_PRIMARY = 0x8536f0;
  // @Ozone 0x853988 = secondary sub-vtable installed at object offset +0xc8.
  static readonly VTABLE_SECONDARY_C8 = 0x853988;
  // @Ozone 0x854280 = secondary sub-vtable installed at object offset +0xd8.
  static readonly VTABLE_SECONDARY_D8 = 0x854280;
  // @Ozone 0x8544d8 = secondary sub-vtable installed at object offset +0xf0.
  static readonly VTABLE_SECONDARY_F0 = 0x8544d8;
  // @Ozone 0x854530 = secondary sub-vtable installed at object offset +0x1a40.
  static readonly VTABLE_SECONDARY_1A40 = 0x854530;

  // Field-offset constants (documented above; used by isActive queries).
  static readonly OFFSET_MASKED_OBJECT_PRIMARY = 0x480;   // from primary this
  static readonly OFFSET_MASKED_OBJECT_SECONDARY = 0x3a8; // from +0xd8 secondary this
  static readonly OFFSET_MASKED_FLAGS = 0x3f8;            // inside pointed-to object
  static readonly MASKED_INACTIVE_BIT = 0x4;              // bit 2 tested by `testb $0x4, ...`

  /**
   * Object fields modelled as a bag; the C++ ABI stores these at the
   * offsets documented above.  The TS port keeps them as named properties
   * — offsets are cited in the docstring of each accessing method.
   */
  vtable: number = 0;
  vtable_c8: number = 0;
  vtable_d8: number = 0;
  vtable_f0: number = 0;
  vtable_1a40: number = 0;
  /**
   * Pointer to the "masked object" whose activity flag we short-circuit
   * against. C++ field @+0x480 (primary) / @+0x3a8 (secondary +0xd8 view).
   * The pointed-to object's flag word is read at its own offset +0x3f8.
   */
  maskedObject: { field_0x3f8: number } | null = null;

  /**
   * Ctor: `OZRotoMask::OZRotoMask(OZFactory*, PCString const&, unsigned int)`.
   * C1 @0x36b050 / C2 @0x36aff0.
   *   0x36aff9 (C2) / 0x36b059 (C1)  callq OZRotoshape::OZRotoshape(OZFactory*, PCString const&, unsigned int)
   *   Then five leaq/movq pairs installing the five sub-vtables at
   *   offsets 0x0 / 0xc8 / 0xd8 / 0xf0 / 0x1a40 (see file header for full disp table).
   */
  static ctorFactoryStringUint(
    factory: OZFactory | null,
    name: PCString,
    flags: number,
  ): OZRotoMask {
    const self = new OZRotoMask();
    // @Ozone 0x36aff9 (C2) / 0x36b059 (C1): base ctor.
    OZRotoshape_ctor_factoryStringUint_stub(self, factory, name, flags);
    // @Ozone 0x36affe (C2) / 0x36b05e (C1): install main vtable.
    self.vtable = OZRotoMask.VTABLE_PRIMARY;
    // @Ozone 0x36b008 (C2) / 0x36b068 (C1): install secondary +0xc8 vtable.
    self.vtable_c8 = OZRotoMask.VTABLE_SECONDARY_C8;
    // @Ozone 0x36b016 (C2) / 0x36b076 (C1): install secondary +0xd8 vtable.
    self.vtable_d8 = OZRotoMask.VTABLE_SECONDARY_D8;
    // @Ozone 0x36b024 (C2) / 0x36b084 (C1): install secondary +0xf0 vtable.
    self.vtable_f0 = OZRotoMask.VTABLE_SECONDARY_F0;
    // @Ozone 0x36b032 (C2) / 0x36b092 (C1): install secondary +0x1a40 vtable.
    self.vtable_1a40 = OZRotoMask.VTABLE_SECONDARY_1A40;
    return self;
  }

  /**
   * Ctor: `OZRotoMask::OZRotoMask(OZRotoMask const&, unsigned int)`.
   * C1 @0x36b110 / C2 @0x36b0b0.
   *   0x36b0b9 (C2) / 0x36b119 (C1)  callq OZRotoshape::OZRotoshape(OZRotoshape const&, unsigned int)
   *   Then the same five vtable installs (SAME payload addrs — the RIP
   *   disps differ per-ctor location, but resolve to the same targets).
   */
  static ctorCopyUint(src: OZRotoMask, flags: number): OZRotoMask {
    const self = new OZRotoMask();
    // @Ozone 0x36b0b9 (C2) / 0x36b119 (C1): base ctor (subclass-ref decays to base-ref).
    OZRotoshape_ctor_copyUint_stub(self, src, flags);
    // @Ozone 0x36b0be (C2) / 0x36b11e (C1): install main vtable.
    self.vtable = OZRotoMask.VTABLE_PRIMARY;
    // @Ozone 0x36b0c8 (C2) / 0x36b128 (C1): install secondary +0xc8 vtable.
    self.vtable_c8 = OZRotoMask.VTABLE_SECONDARY_C8;
    // @Ozone 0x36b0d6 (C2) / 0x36b136 (C1): install secondary +0xd8 vtable.
    self.vtable_d8 = OZRotoMask.VTABLE_SECONDARY_D8;
    // @Ozone 0x36b0e4 (C2) / 0x36b144 (C1): install secondary +0xf0 vtable.
    self.vtable_f0 = OZRotoMask.VTABLE_SECONDARY_F0;
    // @Ozone 0x36b0f2 (C2) / 0x36b152 (C1): install secondary +0x1a40 vtable.
    self.vtable_1a40 = OZRotoMask.VTABLE_SECONDARY_1A40;
    return self;
  }

  /**
   * `OZRotoMask::operator=(OZSceneNode const&)` — Ozone @0x36b170.
   * Pure tail-jmp to the base's operator=. The class adds no fields at the
   * OZRotoMask level that need custom copy-assign; the base handles all
   * scene-node bookkeeping.
   *   0x36b175  jmp __ZN11OZRotoshapeaSERK11OZSceneNode
   *
   * Additionally emitted by the compiler at @0x36b180: a non-virtual
   * thunk `addq $-0xc8, %rdi; jmp OZRotoshape::operator=`. That thunk is
   * placed in the secondary +0xc8 sub-vtable's operator= slot to convert
   * a secondary-base `this` back to the primary before entering the base
   * body.  Modelled in TS as `operatorEqualsThunkC8`.
   */
  operatorEquals(rhs: OZSceneNode): OZRotoMask {
    // @Ozone 0x36b175: tail-jmp OZRotoshape::operator=(OZSceneNode const&).
    return OZRotoshape_operatorEq_stub(this, rhs);
  }

  /**
   * Non-virtual thunk for operator= at secondary base +0xc8 — Ozone @0x36b180.
   *   0x36b184  addq $-0xc8, %rdi   ; adjust from secondary-view to primary
   *   0x36b18c  jmp OZRotoshape::operator=(OZSceneNode const&)
   * In TS both entries collapse to the primary body because we do not
   * emit distinct object-pointer identities for secondary base views.
   */
  operatorEqualsThunkC8(rhs: OZSceneNode): OZRotoMask {
    // @Ozone 0x36b184: this -= 0xc8 (no-op in TS — same object identity).
    // @Ozone 0x36b18c: tail-jmp OZRotoshape::operator=(OZSceneNode const&).
    return OZRotoshape_operatorEq_stub(this, rhs);
  }

  /**
   * `OZRotoMask::isActiveAtTime(CMTime, bool, bool, bool) const` @0x36b1a0.
   * Faithful transcription:
   *   p = this->maskedObject_@+0x480
   *   if (p != null && (p->field_@+0x3f8 & 4) != 0)  return false;
   *   else  return OZRotoshape::isActiveAtTime(this, t, a, b, c);   // tail-jmp
   *
   * NOTE on control flow: the `je 0x36b1b9` at 0x36b1ae falls into the same
   * block that the `testb`-not-set path also falls into (0x36b1b9), so the
   * asm reads: "if p is null OR (flag bit 2 clear) -> tail-call base; else
   * return 0".  That is exactly the boolean expression above.
   */
  isActiveAtTime(t: CMTime, a: boolean, b: boolean, c: boolean): boolean {
    // @Ozone 0x36b1a4  movq 0x480(%rdi), %rax
    const p = this.maskedObject;
    // @Ozone 0x36b1ab  testq %rax, %rax ;  0x36b1ae  je 0x36b1b9
    // @Ozone 0x36b1b0  testb $0x4, 0x3f8(%rax)   ;  0x36b1b7  jne 0x36b1c9
    if (p !== null && (p.field_0x3f8 & OZRotoMask.MASKED_INACTIVE_BIT) !== 0) {
      // @Ozone 0x36b1c9  xorl %eax, %eax ;  ret  (return 0 / false)
      return false;
    }
    // @Ozone 0x36b1b9..0x36b1c0  movzbl of bool args (no-op in TS — booleans already 0/1).
    // @Ozone 0x36b1c4  jmp OZRotoshape::isActiveAtTime(CMTime, bool, bool, bool) const.
    return OZRotoshape_isActiveAtTime_stub(this, t, a, b, c);
  }

  /**
   * Non-virtual thunk for isActiveAtTime at secondary base +0xd8 — Ozone
   * @0x36b1d0.
   *   0x36b1d4  movq 0x3a8(%rdi), %rax           ; reads the SAME field
   *                                                (0x3a8 + 0xd8 = 0x480)
   *   0x36b1db  testq %rax, %rax
   *   0x36b1de  je 0x36b1e9
   *   0x36b1e0  testb $0x4, 0x3f8(%rax)
   *   0x36b1e7  jne 0x36b200
   *   0x36b1e9  addq $-0xd8, %rdi                ; convert secondary->primary
   *   0x36b1f0..0x36b1f7  movzbl of bool args
   *   0x36b1fb  jmp OZRotoshape::isActiveAtTime  ; tail-call
   *   0x36b200  xorl %eax, %eax; ret
   * Semantically identical to the primary; only the field access uses the
   * secondary-view offset before the this-adjust.
   */
  isActiveAtTimeThunkD8(t: CMTime, a: boolean, b: boolean, c: boolean): boolean {
    // @Ozone 0x36b1d4: read field via secondary view — same field in TS
    // (single object identity; no per-view pointer arithmetic needed).
    const p = this.maskedObject;
    // @Ozone 0x36b1db..0x36b1e7: same test/branch as primary.
    if (p !== null && (p.field_0x3f8 & OZRotoMask.MASKED_INACTIVE_BIT) !== 0) {
      // @Ozone 0x36b200: return 0.
      return false;
    }
    // @Ozone 0x36b1e9: this -= 0xd8 (no-op in TS).
    // @Ozone 0x36b1fb: tail-jmp base.
    return OZRotoshape_isActiveAtTime_stub(this, t, a, b, c);
  }

  /**
   * `OZRotoMask::isActiveInTimeRange(PCTimeRange const&, bool, bool, bool) const`
   * @0x36b210. Same shape as isActiveAtTime; only the base tail-target and
   * arg registers differ (PCTimeRange& in %rsi; three bools in %rdx/%rcx/%r8).
   *   0x36b214  movq 0x480(%rdi), %rax
   *   0x36b21b  testq %rax, %rax
   *   0x36b21e  je 0x36b229
   *   0x36b220  testb $0x4, 0x3f8(%rax)
   *   0x36b227  jne 0x36b239
   *   0x36b229  movzbl bool args
   *   0x36b234  jmp OZRotoshape::isActiveInTimeRange
   *   0x36b239  xorl %eax,%eax; ret
   */
  isActiveInTimeRange(range: PCTimeRange, a: boolean, b: boolean, c: boolean): boolean {
    // @Ozone 0x36b214  movq 0x480(%rdi), %rax
    const p = this.maskedObject;
    // @Ozone 0x36b21b..0x36b227  same masked-out short-circuit.
    if (p !== null && (p.field_0x3f8 & OZRotoMask.MASKED_INACTIVE_BIT) !== 0) {
      // @Ozone 0x36b239  xorl %eax, %eax; ret  ->  false.
      return false;
    }
    // @Ozone 0x36b229..0x36b22f: zero-extend bool args (no-op in TS).
    // @Ozone 0x36b234: tail-jmp OZRotoshape::isActiveInTimeRange.
    return OZRotoshape_isActiveInTimeRange_stub(this, range, a, b, c);
  }

  /**
   * `OZRotoMask::~OZRotoMask()` — D1 complete dtor @0x36b2d0.
   *   0x36b2d5  jmp __ZN11OZRotoshapeD2Ev
   * Pure tail-jmp to OZRotoshape base D2.
   */
  destructorD1(): void {
    // @Ozone 0x36b2d5: tail-jmp OZRotoshape::~OZRotoshape().
    OZRotoshape_dtor_stub(this);
  }

  /**
   * `OZRotoMask::~OZRotoMask()` — D0 deleting dtor @0x36b2e0.
   *   0x36b2e9  callq __ZN11OZRotoshapeD2Ev
   *   0x36b2f7  jmp 0x6dfc36                  ; __stubs entry -> __ZdlPv
   * D0 is invoked by the RTTI-driven Release path when refcount hits zero.
   */
  destructorD0(): void {
    // @Ozone 0x36b2e9: destroy OZRotoshape base subobject.
    OZRotoshape_dtor_stub(this);
    // @Ozone 0x36b2f7: tail-jmp ::operator delete(this) via stub 0x6dfc36.
    libcxx_operator_delete_stub(this);
  }
}
