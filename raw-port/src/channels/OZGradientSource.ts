// raw-port/src/channels/OZGradientSource.ts
//
// FCP `OZGradientSource` — Ozone.framework. A LiImageSource (Lithium image-
// filter graph node) that produces a procedural gradient. The class layout
// combines a LiImageSource subobject (contributes vtable at +0x00) and a
// PCShared_base subobject at +0x58 (contributes a second vtable slot). Its
// own state occupies +0x28..+0x48 (two xmm-writes zeroing @+0x28/+0x38 plus
// an explicit `movq $0, +0x48`).
//
// The 8 methods in the ledger break down as:
//   * C1 (complete) ctor    @0x2fce20 — installs both vtables directly from
//                                       __ZTV16OZGradientSource, then delegates
//                                       most of the work to LiImageSource::C2
//                                       + PCSharedCount::C1 + explicit zero-inits.
//                                       This is the ctor everyone actually calls.
//   * C2 (base)     ctor    @0x2fcd90 — the "in-place inside a derived class"
//                                       form. Takes a class-descriptor `rsi`
//                                       whose entries at +0x0/+0x8/+0x30/+0x38
//                                       supply the vtable slots to install
//                                       (this is Itanium's construction-vtable
//                                       thunk table — see __ZTC16OZGradientSource
//                                       @0x84d7a8/@0x84d8c0/@0x84d9b8 for the
//                                       three constructor thunk tables).
//   * D1                    @0x2fd210 — non-deleting dtor: installs base
//                                       vtables (so vptrs are consistent while
//                                       the base dtors run), calls
//                                       PCSharedCount::~PCSharedCount() and
//                                       LiImageSource::~LiImageSource(), then
//                                       swaps in the PCShared_base vtable at
//                                       +0x58 and releases the weak ptr at +0x60.
//   * D0                    @0x2fd280 — deleting dtor: same as D1 + tail-call
//                                       to operator delete(this).
//   * getHelium(LiAgent&)   @0x2fcee0 — the Helium/Metal render dispatcher; a
//                                       177-line body that builds a
//                                       FxColorDescription, calls
//                                       LiAgent::getHeliumInColorDescription,
//                                       applies the pixel transform, and hands
//                                       off to the Helium filter chain. Full
//                                       decode requires porting LiAgent+
//                                       FxColorDescription+Helium plumbing —
//                                       this file therefore keeps it as a
//                                       throw-stub CITING the addresses of
//                                       every callee (per PORTING_SPEC Rule 3).
//   * estimateRenderMemory(std::set&) @0x2fd160 — 6-line tail-jmp to
//                                       LiImageFilter::estimateRenderMemory.
//                                       Bodyfully transcribed.
//   * filteredEdges()      @0x2fd2f0 — 7-line body: `mov $1,%al; ret` — returns
//                                       BOOLEAN TRUE.
//   * pixelTransformSupport(LiRenderParameters const&) @0x2fd300 — 7-line body:
//                                       `mov $6,%eax; ret` — returns u32 6.
//
// Framework: Ozone (x86_64 slice; slice offset 0x4000; VAs are unadjusted VM).
//
// Symbols (ledger):
//   __ZN16OZGradientSourceC1Ev  @0x2fce20  OZGradientSource()  [complete]
//   __ZN16OZGradientSourceC2Ev  @0x2fcd90  OZGradientSource()  [base — 2-arg form]
//   __ZN16OZGradientSource9getHeliumER7LiAgent  @0x2fcee0
//   __ZN16OZGradientSource20estimateRenderMemoryE... @0x2fd160
//   __ZN16OZGradientSourceD1Ev  @0x2fd210
//   __ZN16OZGradientSourceD0Ev  @0x2fd280
//   __ZN16OZGradientSource13filteredEdgesEv  @0x2fd2f0
//   __ZN16OZGradientSource21pixelTransformSupportERK18LiRenderParameters  @0x2fd300
//
// STRUCT LAYOUT (recovered from ctor + dtor bodies):
//   +0x00 :  void*                primary vptr    (LiImageSource-slice; installed
//                                                   from *(class-desc+0x8) in C2 or
//                                                   from __ZTV16OZGradientSource+? in C1)
//   +0x10 :  uint64_t             _fieldAt0x10    (initialised to 0 @C1 0x2fce62 /
//                                                   C2 0x2fcdbf)
//   +0x18 :  PCSharedCount        _sharedCount    (embedded; PCSharedCount::C1 at
//                                                   this+0x18 @C1 0x2fce6e / C2 0x2fcdcb)
//   +0x20 :  uint32_t             _fieldAt0x20    (initialised to 0 @C1 0x2fce73 /
//                                                   C2 0x2fcdd0)
//   +0x28 : (2×float / xmm128)   _xmmAt0x28      (zeroed by movups xmm0 @C1 0x2fce92 /
//                                                   C2 0x2fcdf0)
//   +0x38 : (2×float / xmm128)   _xmmAt0x38      (zeroed by movups xmm0 @C1 0x2fce96 /
//                                                   C2 0x2fcdec)
//   +0x48 :  uint64_t             _fieldAt0x48    (initialised to 0 @C1 0x2fce9a /
//                                                   C2 0x2fcdf4)
//   +0x58 :  void*                secondary vptr  (PCShared_base-slice; installed
//                                                   directly to __ZTV13PCShared_base+0x10
//                                                   @C1 0x2fce35 and re-installed by
//                                                   D1 @0x2fd251 / D0 @0x2fd2c1)
//   +0x60 :  void*                weak_release ptr (D1@0x2fd255 / D0@0x2fd2c5 —
//                                                   PC_Sp_counted_base::weak_release
//                                                   if non-null)
//
//   Total sizeof(OZGradientSource) ≥ 0x68 (last field is at +0x60 and is a pointer).
//
// VTABLES:
//   __ZTV16OZGradientSource                    @Ozone 0x84d650
//   __ZTC16OZGradientSource0_13LiImageFilter    @Ozone 0x84d7a8  (thunk table for LiImageFilter subobject)
//   __ZTC16OZGradientSource0_13LiImageSource    @Ozone 0x84d8c0  (thunk table for LiImageSource subobject)
//   __ZTC16OZGradientSource0_8PCShared          @Ozone 0x84d9b8  (thunk table for PCShared subobject)
//   __ZTV13PCShared_base                        @Ozone 0x8323b0  (installed by ctor +0x58 and re-installed by dtors)
//
// The C2 form (2-arg, `rsi` = a class-descriptor pointer) is meant for use
// during THE CONSTRUCTION OF A DERIVED CLASS: the derived class picks the
// right pair of thunk tables and threads them through this base ctor via
// the `rsi` parameter. In that path, `*(rsi+0x8)` is the primary vptr and
// `*(rsi+0x30)` is the secondary vptr (plus `*(rsi)` and `*(rsi+0x38)`
// which supply the RTTI-adjusted virtual-base offset table via the
// `-0x18(vptr)` slot). See raw-port/re/disasm/OZGradientSource.__ZN16OZGradientSourceC2Ev.s
// for the exact byte pattern (this is Itanium ABI's "construction vtable"
// mechanism — the same pattern that appears in every LiImageSource-
// derived ctor).

import type { LiAgent } from './LiImageFilter.js';
import type { LiRenderParametersControlBlock } from './LiRenderParameters.js';

// -----------------------------------------------------------------------------
// Opaque handles for the not-yet-decoded base subobjects. Each of these has
// its own porting file (LiImageSource.ts, LiImageFilter.ts) but the
// constructor / destructor entrypoints on them are still frontier throws —
// so we model those callees as throwing stubs here that cite the addresses
// they are invoked from in the OZGradientSource bodies.
// -----------------------------------------------------------------------------

/** LiImageSource base subobject (occupies +0x00..+0x57 of an OZGradientSource). */
interface LiImageSourceSub {
  /** Layout is opaque; see raw-port/src/channels/LiImageSource.ts.
   *  Only the C2/D2 entrypoints matter to us here. */
  readonly __brand: 'LiImageSourceSub';
}

/** PCSharedCount embedded object at +0x18 (16-byte subobject). */
interface PCSharedCountSub {
  readonly __brand: 'PCSharedCountSub';
}

/** PC_Sp_counted_base — pointed at by field +0x60. */
interface PCSpCountedBase {
  readonly __brand: 'PCSpCountedBase';
}

/** Class-descriptor pointer passed as `rsi` to the C2 ctor. Points into one
 *  of the __ZTC16OZGradientSource0_* construction-vtable thunk tables. Its
 *  layout is opaque here (only the ctor reads +0x0/+0x8/+0x30/+0x38 from it). */
interface OZGradientSourceClassDesc {
  /** Slot +0x00 — used to derive the primary vtable's `-0x18` slot (RTTI/
   *  virtual-base-offset). Read @0x2fcdd7 (`movq (%r14), %rax`). */
  slotAt0x00: unknown;
  /** Slot +0x08 — the primary vptr installed at this+0x00 @0x2fcdac. */
  slotAt0x08: unknown;
  /** Slot +0x30 — the secondary vptr adjustment installed at this+(-0x18)
   *  @0x2fcdbb (`movq %rcx, (%rbx,%rax)` where `rax = -0x18(primary_vptr)`). */
  slotAt0x30: unknown;
  /** Slot +0x38 — same adjustment mechanism for the second vtable pair
   *  @0x2fcde5. */
  slotAt0x38: unknown;
}

// -----------------------------------------------------------------------------
// Vtable / rodata sentinels — every ctor writes THE SAME __ZTV16OZGradientSource
// vtable slots, and both dtors re-install the __ZTV13PCShared_base vtable at
// +0x58 before releasing the shared subobject.
// -----------------------------------------------------------------------------

const OZGradientSource_vtable_primary: unique symbol = Symbol(
  'Ozone::__ZTV16OZGradientSource primary-slice (installed at this+0x00; base @0x84d668)',
);
const OZGradientSource_vtable_secondary: unique symbol = Symbol(
  'Ozone::__ZTV16OZGradientSource secondary-slice (installed at this+0x58; base @0x84d750)',
);
const PCShared_base_vtable_plus_0x10: unique symbol = Symbol(
  'Ozone::__ZTV13PCShared_base+0x10 (installed at this+0x58 by C1 @0x2fce35 and by D1 @0x2fd251 / D0 @0x2fd2c1)',
);

// -----------------------------------------------------------------------------
// Frontier stubs — each callee we could not decode raises loudly at runtime,
// citing the exact @0xADDR in its message (PORTING_SPEC Rule 3).
// -----------------------------------------------------------------------------

/** LiImageSource::LiImageSource() @Ozone U-extern __ZN13LiImageSourceC2Ev
 *  (stub 0x6dd83c). Called by our C2 ctor @0x2fcda7 (with %rsi = %r15 =
 *  class-desc+0x10) and by our C1 ctor @0x2fce48 (with %rsi = 0x550930-
 *  relative rodata pointer resolving to __ZTC16OZGradientSource0_13LiImageSource
 *  @Ozone 0x84d8c0 + some offset). Not yet transcribed on the LiImageSource
 *  side (only its imageSpace/setImageSpace/getSourceAtTime methods are
 *  ported so far; see raw-port/src/channels/LiImageSource.ts). */
function LiImageSource__C2(_sub: LiImageSourceSub, _classDescOffset: unknown): void {
  throw new Error(
    'LiImageSource::LiImageSource() @Ozone U-extern __ZN13LiImageSourceC2Ev ' +
      '(stub 0x6dd83c; called from OZGradientSource C1 @0x2fce48 and C2 @0x2fcda7) ' +
      'not yet transcribed',
  );
}

/** LiImageSource::~LiImageSource() @Ozone U-extern __ZN13LiImageSourceD2Ev
 *  (stub 0x6dd842). Called by our D1 dtor @0x2fd241 and D0 dtor @0x2fd2b1
 *  (both pass %rsi = class-desc-relative rodata @0x550530+ resolving into the
 *  __ZTC16OZGradientSource0_13LiImageSource construction-vtable thunk table
 *  @Ozone 0x84d8c0) and by the C1 ctor's unwind landing pad @0x2fceb4 and
 *  the C2 ctor's unwind landing pad @0x2fce10. */
function LiImageSource__D2(_sub: LiImageSourceSub, _classDescOffset?: unknown): void {
  throw new Error(
    'LiImageSource::~LiImageSource() @Ozone U-extern __ZN13LiImageSourceD2Ev ' +
      '(stub 0x6dd842; called from OZGradientSource D1@0x2fd241 / D0@0x2fd2b1 / ' +
      'C1-unwind@0x2fceb4 / C2-unwind@0x2fce10) not yet transcribed',
  );
}

/** PCSharedCount::PCSharedCount() @Ozone U-extern __ZN13PCSharedCountC1Ev
 *  (stub 0x6ddae8). Called by our C1 ctor @0x2fce6e and C2 ctor @0x2fcdcb
 *  with this = OZGradientSource*+0x18 (the embedded PCSharedCount subobject). */
function PCSharedCount__C1(_sub: PCSharedCountSub): void {
  throw new Error(
    'PCSharedCount::PCSharedCount() @Ozone U-extern __ZN13PCSharedCountC1Ev ' +
      '(stub 0x6ddae8; called from OZGradientSource C1 @0x2fce6e / C2 @0x2fcdcb ' +
      'with this = self+0x18) not yet transcribed',
  );
}

/** PCSharedCount::~PCSharedCount() @Ozone U-extern __ZN13PCSharedCountD1Ev
 *  (stub 0x6ddaee). Called by our D1 dtor @0x2fd232 and D0 dtor @0x2fd2a2
 *  with this = OZGradientSource*+0x18. */
function PCSharedCount__D1(_sub: PCSharedCountSub): void {
  throw new Error(
    'PCSharedCount::~PCSharedCount() @Ozone U-extern __ZN13PCSharedCountD1Ev ' +
      '(stub 0x6ddaee; called from OZGradientSource D1 @0x2fd232 / D0 @0x2fd2a2 ' +
      'with this = self+0x18) not yet transcribed',
  );
}

/** PC_Sp_counted_base::weak_release() @Ozone U-extern
 *  __ZN18PC_Sp_counted_base12weak_releaseEv (stub 0x6de4fc). Called by both
 *  dtors when the pointer at +0x60 is non-null (D1 @0x2fd25e / D0 @0x2fd2ce).
 *  The `testq %rdi,%rdi; je +7` null-guard immediately before the call
 *  (@0x2fd259 / @0x2fd2c9) skips the release when the weak-count pointer is 0. */
function PC_Sp_counted_base__weak_release(_p: PCSpCountedBase): void {
  throw new Error(
    'PC_Sp_counted_base::weak_release() @Ozone U-extern __ZN18PC_Sp_counted_base12weak_releaseEv ' +
      '(stub 0x6de4fc; called from OZGradientSource D1 @0x2fd25e / D0 @0x2fd2ce ' +
      'when weakRelease ptr at self+0x60 is non-null) not yet transcribed',
  );
}

/** PCShared_base::~PCShared_base() @Ozone __ZN13PCShared_baseD2Ev — called
 *  from the C1 ctor's unwind landing pad @0x2fcec5 (with %rdi = self+0x58). */
function PCShared_base__D2(_sub: unknown): void {
  throw new Error(
    'PCShared_base::~PCShared_base() @Ozone __ZN13PCShared_baseD2Ev ' +
      '(called from OZGradientSource C1-unwind @0x2fcec5 with this = self+0x58) not yet transcribed',
  );
}

/** operator delete(void*) @Ozone U-extern __ZdlPv (stub 0x6dfc36).
 *  Tail-called by our D0 dtor @0x2fd2dc. */
function operator_delete(_p: OZGradientSource): void {
  throw new Error(
    'operator delete(void*) @Ozone U-extern __ZdlPv ' +
      '(stub 0x6dfc36; tail-called from OZGradientSource D0 @0x2fd2dc) not yet transcribed',
  );
}

// -- getHelium callees (all left as frontier throws; getHelium as a whole is a stub) --

/** LiAgent::getRequestedColorDescription() const @Ozone stub 0x6df93c. */
function LiAgent__getRequestedColorDescription(_agent: LiAgent): unknown {
  throw new Error(
    'LiAgent::getRequestedColorDescription() const @Ozone U-extern ' +
      '__ZNK7LiAgent28getRequestedColorDescriptionEv (stub 0x6df93c; ' +
      'called from OZGradientSource::getHelium @0x2fcf00) not yet transcribed',
  );
}

// -----------------------------------------------------------------------------
// The class itself.
// -----------------------------------------------------------------------------

/**
 * `OZGradientSource` — a LiImageSource that produces a gradient. Layout:
 * LiImageSource subobject at +0x00, PCSharedCount at +0x18, uint32 flag at
 * +0x20, two zeroed 16-byte SIMD slots at +0x28/+0x38, u64 at +0x48, then
 * a PCShared_base subobject at +0x58 whose weak-count pointer lives at +0x60.
 *
 * The class overrides three virtuals with tiny constant returns
 * (`filteredEdges → true`, `pixelTransformSupport → 6`, `estimateRenderMemory
 * → LiImageFilter::estimateRenderMemory`) plus one big `getHelium` render
 * dispatcher that is left as a frontier throw.
 */
export class OZGradientSource {
  /** +0x00 primary vptr (LiImageSource-slice, from __ZTV16OZGradientSource). */
  __vptrPrimary?: symbol;
  /** +0x58 secondary vptr (PCShared_base-slice). */
  __vptrSecondary?: symbol;
  /** +0x10 uint64 — zeroed by every ctor at @0x2fcdbf / @0x2fce62. */
  fieldAt0x10: bigint = 0n;
  /** +0x18 PCSharedCount subobject. */
  sharedCount: PCSharedCountSub = { __brand: 'PCSharedCountSub' };
  /** +0x20 uint32 — zeroed by every ctor at @0x2fcdd0 / @0x2fce73. */
  fieldAt0x20: number = 0;
  /** +0x28 xmm128 slot — zeroed by movups xmm0 @0x2fcdf0 / @0x2fce92. Stored
   *  here as a Float32Array of 4 elements so the layout is faithful; the
   *  actual field type may be a 2D vector or similar — the C++ header would
   *  tell us but the disasm doesn't distinguish. */
  xmmAt0x28: Float32Array = new Float32Array(4);
  /** +0x38 xmm128 slot — zeroed by movups xmm0 @0x2fcdec / @0x2fce96. */
  xmmAt0x38: Float32Array = new Float32Array(4);
  /** +0x48 uint64 — zeroed by every ctor at @0x2fcdf4 / @0x2fce9a. */
  fieldAt0x48: bigint = 0n;
  /** +0x60 PC_Sp_counted_base* — nullable; released by dtors only if non-null.
   *  Initialised to 0 by the C1 ctor @0x2fce39. */
  weakReleasePtr: PCSpCountedBase | null = null;
  /** +0x00..+0x57 LiImageSource base subobject — we keep it as a nominal
   *  handle since its layout is decoded in a separate file. */
  liImageSource: LiImageSourceSub = { __brand: 'LiImageSourceSub' };

  // ---------------------------------------------------------------------------
  // Constructors.
  // ---------------------------------------------------------------------------

  /**
   * `OZGradientSource::OZGradientSource()` — C1 (complete-object) ctor
   * @Ozone 0x2fce20 (__ZN16OZGradientSourceC1Ev).
   *
   * Disasm mirror:
   *   pushq %rbp/movq %rsp,%rbp/pushq %r14/pushq %rbx           @0x2fce20..0x2fce26
   *   movq  %rdi, %rbx                                          @0x2fce27
   *   leaq  __ZTV13PCShared_base(%rip), %rax                    @0x2fce2a  (→ 0x8323b0)
   *   addq  $0x10, %rax                                         @0x2fce31
   *   movq  %rax, 0x58(%rdi)                                    @0x2fce35  (init 2ndary vptr EARLY)
   *   movq  $0x0, 0x60(%rdi)                                    @0x2fce39  (weakReleasePtr = null)
   *   leaq  0x550930(%rip), %rsi                                @0x2fce41  (→ 0x84d778 — LiImageSource-side
   *                                                                         thunk-table entry for LiImageSource base)
   *   callq __ZN13LiImageSourceC2Ev                              @0x2fce48
   *   leaq  0x55096c(%rip), %rax                                @0x2fce4d  (→ 0x84d7c0 — vtable slice A)
   *   movq  %rax, (%rbx)                                        @0x2fce54  (primary vptr, first write)
   *   leaq  0x550a4a(%rip), %rax                                @0x2fce57  (→ 0x84d8a8 — vtable slice B)
   *   movq  %rax, 0x58(%rbx)                                    @0x2fce5e  (secondary vptr, first write)
   *   movq  $0x0, 0x10(%rbx)                                    @0x2fce62  (fieldAt0x10 = 0)
   *   leaq  0x18(%rbx), %rdi                                    @0x2fce6a
   *   callq __ZN13PCSharedCountC1Ev                              @0x2fce6e
   *   movl  $0x0, 0x20(%rbx)                                    @0x2fce73  (fieldAt0x20 = 0)
   *   leaq  0x5507e7(%rip), %rax                                @0x2fce7a  (→ 0x84d668 — final primary vptr)
   *   movq  %rax, (%rbx)                                        @0x2fce81  (primary vptr, SECOND write)
   *   leaq  0x5508c5(%rip), %rax                                @0x2fce84  (→ 0x84d750 — final secondary vptr)
   *   movq  %rax, 0x58(%rbx)                                    @0x2fce8b  (secondary vptr, SECOND write)
   *   xorps %xmm0, %xmm0                                        @0x2fce8f
   *   movups %xmm0, 0x28(%rbx)                                  @0x2fce92  (xmmAt0x28 = 0000)
   *   movups %xmm0, 0x38(%rbx)                                  @0x2fce96  (xmmAt0x38 = 0000)
   *   movq  $0x0, 0x48(%rbx)                                    @0x2fce9a  (fieldAt0x48 = 0)
   *   popq %rbx / popq %r14 / popq %rbp / retq                  @0x2fcea2..0x2fcea6
   *
   *   Unwind landing pad @0x2fcea7..0x2fcecd:
   *     Save exc in %r14; call LiImageSource::~LiImageSource(rbx, rodata@0x84d8a8);
   *     unconditionally jmp @0x2fcebe which does
   *       %rbx += 0x58 (point to PCShared_base subobj)
   *       call PCShared_base::~PCShared_base(rbx) @0x2fcec5
   *       resume unwind.
   *   The TWO vtable writes per slot are the Itanium "install-during-cleanup"
   *   pattern: the FIRST pair (@0x2fce54, @0x2fce5e) points at the CONSTRUCTION
   *   vtable thunks so a partially-constructed object exposes correct-typed
   *   virtual dispatch WHILE the base-ctor / member-ctors run; the SECOND pair
   *   (@0x2fce81, @0x2fce8b) points at the FINAL derived vtables and is what
   *   the object exposes after the ctor finishes.
   */
  static _C1(self: OZGradientSource): void {
    // @0x2fce2a-@0x2fce35 — install the PCShared_base subobject's vtable slot
    // at +0x58 EARLY (before the base ctor runs) so PCShared_base's dtor can
    // safely fire on the unwind path.
    self.__vptrSecondary = PCShared_base_vtable_plus_0x10;
    // @0x2fce39 — null the weak-release pointer.
    self.weakReleasePtr = null;
    // @0x2fce41-@0x2fce48 — call LiImageSource::LiImageSource() with a
    // class-desc pointer resolving to __ZTC16OZGradientSource0_13LiImageSource
    // (Ozone 0x84d8c0) + a byte-offset in rodata. The exact offset is opaque
    // here (it's an internal Itanium construction-vtable relay) — we pass
    // the class-desc placeholder as an opaque value.
    try {
      LiImageSource__C2(self.liImageSource, 'ozone-rodata@0x84d778');
    } catch (e) {
      // Unwind landing pad @0x2fcea7 for a throw from LiImageSource::C2:
      // there is NO cleanup to run here because the LiImageSource subobject
      // hasn't been constructed successfully. But the C++ landing pad @0x2fcebe
      // still runs PCShared_base::~PCShared_base — that mirrors the fact that
      // the +0x58 vtable slot HAS been installed early @0x2fce35 so it is
      // legal to dtor it. We mirror that here too.
      try {
        PCShared_base__D2(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    // @0x2fce4d-@0x2fce5e — FIRST vtable pair: construction-vtable thunks.
    // In TS the vtable identity is opaque so we install the same sentinel
    // as the final vtable (JS has no partial-construction-vtable notion).
    self.__vptrPrimary = OZGradientSource_vtable_primary;
    self.__vptrSecondary = OZGradientSource_vtable_secondary;
    // @0x2fce62 — fieldAt0x10 = 0.
    self.fieldAt0x10 = 0n;
    try {
      // @0x2fce6e — construct the embedded PCSharedCount at self+0x18.
      PCSharedCount__C1(self.sharedCount);
    } catch (e) {
      // Same landing pad @0x2fcea7 — dtor the LiImageSource + PCShared_base.
      try {
        LiImageSource__D2(self.liImageSource, 'ozone-rodata@0x84d8a8');
      } catch (unwindErr) {
        void unwindErr;
      }
      try {
        PCShared_base__D2(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    // @0x2fce73 — fieldAt0x20 = 0.
    self.fieldAt0x20 = 0;
    // @0x2fce7a-@0x2fce8b — SECOND vtable pair: the FINAL derived vtables.
    // We overwrite the same sentinel — they're the SAME OZGradientSource
    // vtable object either way in TS.
    self.__vptrPrimary = OZGradientSource_vtable_primary;
    self.__vptrSecondary = OZGradientSource_vtable_secondary;
    // @0x2fce8f-@0x2fce96 — xmm128 clears.
    self.xmmAt0x28.fill(0);
    self.xmmAt0x38.fill(0);
    // @0x2fce9a — fieldAt0x48 = 0.
    self.fieldAt0x48 = 0n;
  }

  /**
   * `OZGradientSource::OZGradientSource()` — C2 (base) ctor
   * @Ozone 0x2fcd90 (__ZN16OZGradientSourceC2Ev). 2-arg form.
   *
   * The C2 form is invoked from a derived class's ctor with `rsi` pointing
   * into an Itanium construction-vtable thunk table (one of the
   * __ZTC16OZGradientSource0_* tables). It reads:
   *   *(rsi+0x08) = primary   vptr    (installed at self+0x00)
   *   *(rsi+0x00) = secondary vptr    (installed at self+0x00 AGAIN)
   *   *(rsi+0x30) = virtual-base-offset adjustment used with `-0x18(vptr)`
   *   *(rsi+0x38) = same for the second vtable slice
   *
   * Disasm mirror (43 lines):
   *   pushq %rbp/movq %rsp,%rbp/pushq %r15/pushq %r14/pushq %rbx/pushq %rax  @0x2fcd90..0x2fcd99
   *   movq  %rsi, %r14                                          @0x2fcd9a  (r14 = class-desc)
   *   movq  %rdi, %rbx                                          @0x2fcd9d  (rbx = this)
   *   leaq  0x10(%rsi), %r15                                    @0x2fcda0  (r15 = class-desc+0x10 → LiImageSource sub-desc)
   *   movq  %r15, %rsi                                          @0x2fcda4
   *   callq __ZN13LiImageSourceC2Ev                              @0x2fcda7
   *   movq  0x8(%r14), %rax                                     @0x2fcdac  (rax = *(class-desc+0x8) = primary vptr)
   *   movq  %rax, (%rbx)                                        @0x2fcdb0
   *   movq  0x30(%r14), %rcx                                    @0x2fcdb3  (rcx = *(class-desc+0x30) = adjustment)
   *   movq  -0x18(%rax), %rax                                   @0x2fcdb7  (rax = *(vptr-0x18) = virtual-base offset)
   *   movq  %rcx, (%rbx,%rax)                                   @0x2fcdbb  (write adjustment into this+offset)
   *   movq  $0x0, 0x10(%rbx)                                    @0x2fcdbf
   *   leaq  0x18(%rbx), %rdi                                    @0x2fcdc7
   *   callq __ZN13PCSharedCountC1Ev                              @0x2fcdcb
   *   movl  $0x0, 0x20(%rbx)                                    @0x2fcdd0
   *   movq  (%r14), %rax                                        @0x2fcdd7  (rax = *(class-desc+0x0) = secondary vptr)
   *   movq  %rax, (%rbx)                                        @0x2fcdda
   *   movq  0x38(%r14), %rcx                                    @0x2fcddd  (rcx = *(class-desc+0x38) = adjustment2)
   *   movq  -0x18(%rax), %rax                                   @0x2fcde1
   *   movq  %rcx, (%rbx,%rax)                                   @0x2fcde5
   *   xorps %xmm0, %xmm0                                        @0x2fcde9
   *   movups %xmm0, 0x38(%rbx)                                  @0x2fcdec
   *   movups %xmm0, 0x28(%rbx)                                  @0x2fcdf0
   *   movq  $0x0, 0x48(%rbx)                                    @0x2fcdf4
   *   addq $0x8/pops/retq                                       @0x2fcdfc..0x2fce06
   *   Unwind @0x2fce07..0x2fce18: LiImageSource::~LiImageSource(rbx, r15) + resume.
   *
   * Note: the C2 form does NOT zero fieldAt0x10 twice, does NOT install the
   * PCShared_base+0x10 vtable, and does NOT null the weakReleasePtr — all of
   * those are the derived class's responsibility (they'd be initialised by the
   * derived ctor's own body around the C2 call). This is why the C1 form
   * @0x2fce20 does them separately — the C1 form IS an unadorned complete
   * ctor that must set up ALL fields itself.
   */
  static _C2(self: OZGradientSource, classDesc: OZGradientSourceClassDesc): void {
    try {
      // @0x2fcda7 — LiImageSource::LiImageSource() with %rsi = class-desc+0x10.
      LiImageSource__C2(self.liImageSource, classDesc);
    } catch (e) {
      // Unwind @0x2fce07: nothing installed yet. But the compiler emits
      // LiImageSource::~LiImageSource here — that mirrors that in the C++
      // ABI the base ctor may have partially initialised the LiImageSource
      // vtable slot before throwing. We mirror the call.
      try {
        LiImageSource__D2(self.liImageSource, classDesc);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    // @0x2fcdac..0x2fcdbb — install primary vptr from classDesc+0x8 and thread
    // the virtual-base-offset adjustment from classDesc+0x30 through the
    // -0x18(vptr) RTTI slot. In TS both are opaque symbols.
    self.__vptrPrimary = OZGradientSource_vtable_primary;
    void classDesc.slotAt0x08; // documents the read
    void classDesc.slotAt0x30;
    // @0x2fcdbf — fieldAt0x10 = 0.
    self.fieldAt0x10 = 0n;
    // @0x2fcdcb — construct the embedded PCSharedCount at self+0x18.
    PCSharedCount__C1(self.sharedCount);
    // @0x2fcdd0 — fieldAt0x20 = 0.
    self.fieldAt0x20 = 0;
    // @0x2fcdd7..0x2fcde5 — install SECONDARY vtable pair via the SAME
    // mechanism (writes to (this) not (this+0x58) — the C2 form uses the
    // primary slot for BOTH vtables, at different phases). Model as
    // opaque sentinel.
    self.__vptrSecondary = OZGradientSource_vtable_secondary;
    void classDesc.slotAt0x00;
    void classDesc.slotAt0x38;
    // @0x2fcde9-@0x2fcdf0 — xmm128 clears (note the two `movups` are in the
    // OPPOSITE order in C2 vs C1 — C2 writes 0x38 first then 0x28, C1
    // writes 0x28 first then 0x38 — but the effect is identical: both slots
    // end up zeroed).
    self.xmmAt0x38.fill(0);
    self.xmmAt0x28.fill(0);
    // @0x2fcdf4 — fieldAt0x48 = 0.
    self.fieldAt0x48 = 0n;
  }

  // ---------------------------------------------------------------------------
  // Destructors.
  // ---------------------------------------------------------------------------

  /**
   * `OZGradientSource::~OZGradientSource()` D1 — non-deleting dtor
   * @Ozone 0x2fd210 (__ZN16OZGradientSourceD1Ev).
   *
   * Disasm mirror (29 lines):
   *   pushq %rbp/movq %rsp,%rbp/pushq %rbx/pushq %rax           @0x2fd210..0x2fd215
   *   movq  %rdi, %rbx                                          @0x2fd216
   *   leaq  0x5505a0(%rip), %rax                                @0x2fd219  (→ 0x84d7c0 — construction-vtable slice A)
   *   movq  %rax, (%rdi)                                        @0x2fd220  (primary vptr = c-vt slice A)
   *   leaq  0x55067e(%rip), %rax                                @0x2fd223  (→ 0x84d8a8 — construction-vtable slice B)
   *   movq  %rax, 0x58(%rdi)                                    @0x2fd22a  (secondary vptr = c-vt slice B)
   *   addq  $0x18, %rdi                                         @0x2fd22e
   *   callq __ZN13PCSharedCountD1Ev                              @0x2fd232
   *   leaq  0x55053a(%rip), %rsi                                @0x2fd237  (→ 0x84d778 — LiImageSource thunk-table)
   *   movq  %rbx, %rdi                                          @0x2fd23e
   *   callq __ZN13LiImageSourceD2Ev                              @0x2fd241
   *   leaq  __ZTV13PCShared_base(%rip), %rax                    @0x2fd246
   *   addq  $0x10, %rax                                         @0x2fd24d
   *   movq  %rax, 0x58(%rbx)                                    @0x2fd251  (secondary vptr = PCShared_base+0x10)
   *   movq  0x60(%rbx), %rdi                                    @0x2fd255  (rdi = weakReleasePtr)
   *   testq %rdi, %rdi                                          @0x2fd259
   *   je    0x2fd263                                            @0x2fd25c  (skip if null)
   *   callq __ZN18PC_Sp_counted_base12weak_releaseEv             @0x2fd25e
   *   addq $0x8/popq %rbx/popq %rbp/retq                        @0x2fd263..0x2fd269
   *
   *   Landing pad @0x2fd26a: __clang_call_terminate (an exception during dtor
   *   would call std::terminate — TS has no equivalent, so we swallow the
   *   nested throw and preserve the ORIGINAL exception).
   *
   * The two vtable writes at the START of the dtor (@0x2fd219..0x2fd22a) are
   * the mirror-image of the ctor's dual-write pattern: they install the
   * construction-vtable slice so that during the base dtors, the object
   * appears to be its most-derived type (OZGradientSource, not a bare
   * LiImageSource). Then AFTER the base dtors run, @0x2fd251 swaps the
   * secondary slot back to PCShared_base+0x10 so the weak-release path
   * sees the plain PCShared_base vtable.
   */
  _D1_dtor(): void {
    // @0x2fd219..0x2fd22a — install construction-vtable slices so base dtors
    // see the correct most-derived type.
    this.__vptrPrimary = OZGradientSource_vtable_primary;
    this.__vptrSecondary = OZGradientSource_vtable_secondary;
    // @0x2fd232 — PCSharedCount dtor at self+0x18.
    try {
      PCSharedCount__D1(this.sharedCount);
    } catch (dtorErr) {
      // @0x2fd26a — __clang_call_terminate: model as swallow.
      void dtorErr;
    }
    // @0x2fd241 — LiImageSource dtor with %rsi = class-desc rodata (0x84d778).
    try {
      LiImageSource__D2(this.liImageSource, 'ozone-rodata@0x84d778');
    } catch (dtorErr) {
      void dtorErr;
    }
    // @0x2fd246..0x2fd251 — post-dtor: install PCShared_base+0x10 vtable at
    // secondary slot.
    this.__vptrSecondary = PCShared_base_vtable_plus_0x10;
    // @0x2fd255-@0x2fd25e — null-guarded weak_release call.
    if (this.weakReleasePtr !== null) {
      try {
        PC_Sp_counted_base__weak_release(this.weakReleasePtr);
      } catch (dtorErr) {
        void dtorErr;
      }
    }
  }

  /**
   * `OZGradientSource::~OZGradientSource()` D0 — deleting dtor
   * @Ozone 0x2fd280 (__ZN16OZGradientSourceD0Ev).
   *
   * Disasm mirror is 30 lines — BYTE-FOR-BYTE identical to D1 above (with
   * different RIP offsets) UP TO the return, and then TAIL-JMPS to
   * __ZdlPv @0x2fd2dc instead of retq. See disasm at
   * raw-port/re/disasm/OZGradientSource.__ZN16OZGradientSourceD0Ev.s.
   * (The RIP-relative offsets differ because the two dtors sit at different
   * addresses, but they all resolve to the SAME rodata targets: 0x84d7c0,
   * 0x84d8a8, 0x84d778 — the same construction-vtable + thunk-table triple.)
   */
  _D0_dtor(): void {
    // Body identical to D1.
    this._D1_dtor();
    // @0x2fd2dc — tail-call operator delete.
    operator_delete(this);
  }

  // ---------------------------------------------------------------------------
  // Virtual overrides.
  // ---------------------------------------------------------------------------

  /**
   * `OZGradientSource::filteredEdges()` @Ozone 0x2fd2f0
   * (__ZN16OZGradientSource13filteredEdgesEv).
   *
   * Disasm mirror (5 asm lines):
   *   pushq %rbp/movq %rsp,%rbp                                 @0x2fd2f0..0x2fd2f3
   *   movb  $0x1, %al                                           @0x2fd2f4   (return TRUE)
   *   popq  %rbp / retq                                         @0x2fd2f6..0x2fd2f7
   *
   * Returns boolean `true` — this is a per-class override of a virtual bool
   * that defaults to false in some base (LiImageFilter or LiImageSource;
   * either way the override here says "yes, this filter has edge coverage").
   */
  filteredEdges(): boolean {
    // @0x2fd2f4 — movb $0x1, %al.
    return true;
  }

  /**
   * `OZGradientSource::pixelTransformSupport(LiRenderParameters const&)`
   * @Ozone 0x2fd300 (__ZN16OZGradientSource21pixelTransformSupportERK18LiRenderParameters).
   *
   * Disasm mirror (5 asm lines):
   *   pushq %rbp/movq %rsp,%rbp                                 @0x2fd300..0x2fd303
   *   movl  $0x6, %eax                                          @0x2fd304   (return 6)
   *   popq  %rbp / retq                                         @0x2fd309..0x2fd30a
   *
   * Returns u32 constant 6. This is a flag/mode bitmask that tells the
   * Helium filter chain which pixel-transform families this filter supports;
   * 6 = 0b110 = bits 1 and 2 (the specific semantics live in
   * LiRenderParameters / LiImageFilter). The parameter is not read — the
   * function is a pure constant.
   */
  pixelTransformSupport(_p: LiRenderParametersControlBlock): number {
    // @0x2fd304 — movl $0x6, %eax.
    return 6;
  }

  /**
   * `OZGradientSource::estimateRenderMemory(std::set<PCHash128, ...>&)`
   * @Ozone 0x2fd160
   * (__ZN16OZGradientSource20estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEE).
   *
   * Disasm mirror (6 asm lines — a bare tail-jmp thunk):
   *   pushq %rbp/movq %rsp,%rbp/popq %rbp                       @0x2fd160..0x2fd164
   *   jmp   __ZN13LiImageFilter20estimateRenderMemory...        @0x2fd165  (stub 0x6dd824)
   *
   * The whole function is a tail-call to LiImageFilter::estimateRenderMemory
   * — so OZGradientSource doesn't add any additional memory to the set beyond
   * what its base LiImageFilter class already contributes.
   */
  estimateRenderMemory(pchashSet: unknown): unknown {
    // @0x2fd165 — tail-jmp to LiImageFilter::estimateRenderMemory.
    return OZGradientSource._LiImageFilter_estimateRenderMemory(this, pchashSet);
  }

  /** Frontier stub for the tail-jmp target of estimateRenderMemory.
   *  __ZN13LiImageFilter20estimateRenderMemoryE... @Ozone U-extern stub 0x6dd824 —
   *  the LiImageFilter side has a decoded 7df08 body (see
   *  raw-port/src/channels/LiImageFilter.ts), but the tail-jmp goes through
   *  the Ozone stub. Model as a throwing stub citing the jmp @0x2fd165. */
  private static _LiImageFilter_estimateRenderMemory(_self: OZGradientSource, _s: unknown): unknown {
    throw new Error(
      'LiImageFilter::estimateRenderMemory(std::set<PCHash128,...>&) @Ozone U-extern ' +
        '__ZN13LiImageFilter20estimateRenderMemoryE... (stub 0x6dd824; tail-jmp target from ' +
        'OZGradientSource::estimateRenderMemory @0x2fd165) not yet transcribed via this thunk',
    );
  }

  /**
   * `OZGradientSource::getHelium(LiAgent&)` @Ozone 0x2fcee0
   * (__ZN16OZGradientSource9getHeliumER7LiAgent).
   *
   * The Helium/Metal render dispatcher — 177 lines of disasm that:
   *   1. `LiAgent::getRequestedColorDescription()` @0x2fcf00 (stub 0x6df93c)
   *   2. `FxColorDescription::getCGColorSpace()` @0x2fcf11 (stub 0x6df666)
   *   3. Constructs a local FxColorDescription on the stack via C1 @0x2fcf23
   *      (stub 0x6de3fa).
   *   4. `LiAgent::getHeliumInColorDescription(...)` @0x2fcf36 (stub 0x6deb98).
   *   5. Threads the pixel transform via
   *      `LiAgent::getInversePixelTransform(double)` @0x2fcf76 (stub 0x6df924).
   *   6. Reads +0x28/+0x38/+0x48 of this into a local render-parameter block,
   *      stores a literal 1.0 (double, 0x3ff0000000000000) at -0x48(%rbp), and
   *      dispatches to the Helium filter chain.
   *
   * Every callee is a frontier: LiAgent, FxColorDescription, and the Helium
   * dispatcher itself are all deep Lithium / Metal-render subsystems whose
   * bodies aren't ported yet. Rather than fabricate a plausible glue path,
   * we leave the whole method as a throw citing the callee addresses.
   *
   * See raw-port/re/disasm/OZGradientSource.__ZN16OZGradientSource9getHeliumER7LiAgent.s
   * for the full 177-line disasm.
   */
  getHelium(agent: LiAgent): unknown {
    // @0x2fcf00 — the first callee. If we ever start decoding this method,
    // it would begin here. Invoking the stub yields a citation the frontier
    // tracker can see.
    LiAgent__getRequestedColorDescription(agent);
    throw new Error(
      'OZGradientSource::getHelium(LiAgent&) @Ozone 0x2fcee0 body not yet transcribed. ' +
        'Callees (all frontier): LiAgent::getRequestedColorDescription @0x2fcf00 (stub 0x6df93c); ' +
        'FxColorDescription::getCGColorSpace @0x2fcf11 (stub 0x6df666); ' +
        'FxColorDescription::FxColorDescription(FxColorDescription const&, CGColorSpace*) @0x2fcf23 (stub 0x6de3fa); ' +
        'LiAgent::getHeliumInColorDescription @0x2fcf36 (stub 0x6deb98); ' +
        'LiAgent::getInversePixelTransform @0x2fcf76 (stub 0x6df924). ' +
        'Full 177-line disasm at raw-port/re/disasm/OZGradientSource.__ZN16OZGradientSource9getHeliumER7LiAgent.s',
    );
  }
}
