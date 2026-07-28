// HGComicLookupFilterLUTBitmapResource — Helium HGNode-lineage resource that
// owns a lazily-cached HGBitmap for one of the six built-in "comic" lookup
// tables (see ./HGComicLUT.ts for the LUT data + LUTIndex enum), and hands
// that bitmap out through GetOutput() as an HGBitmapLoader-wrapped node.
//
// Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework
// (x86_64 slice at fat-binary file offset 0x4000).
//
// Faithful transcription of exactly SIX exported symbols. Each address is a
// verbatim otool -tV read from the Helium x86_64 slice (raw dump saved to
// raw-port/re/disasm/Helium.HGComicLookupFilterLUTBitmapResource.all.s):
//
//   0x3c520  HGComicLookupFilterLUTBitmapResource::HGComicLookupFilterLUTBitmapResource(HGComicLUT::LUTIndex)  [C2]
//   0x3c5b0  HGComicLookupFilterLUTBitmapResource::HGComicLookupFilterLUTBitmapResource(HGComicLUT::LUTIndex)  [C1]
//   0x3c640  HGComicLookupFilterLUTBitmapResource::~HGComicLookupFilterLUTBitmapResource()                     [D2]
//   0x3c6a0  HGComicLookupFilterLUTBitmapResource::~HGComicLookupFilterLUTBitmapResource()                     [D1]
//   0x3c700  HGComicLookupFilterLUTBitmapResource::~HGComicLookupFilterLUTBitmapResource()                     [D0]
//   0x3c760  HGComicLookupFilterLUTBitmapResource::GetOutput(HGRenderer*)
//
// VTABLE — resolved via `resolve.py Helium vtable HGComicLookupFilterLUTBitmapResource`
// (`# HGComicLookupFilterLUTBitmapResource vtable @0xa06258; installed ptr 0xa06268`):
//   *0x00 -> 0x3c6a0  ~HGComicLookupFilterLUTBitmapResource() [D1]
//   *0x08 -> 0x3c700  ~HGComicLookupFilterLUTBitmapResource() [D0]
//   *0x10 -> 0x1a0f20  HGObject::Retain()
//   *0x18 -> 0x1a0f30  HGObject::Release()
//   *0x20..*0xf8       ALL INHERITED from HGNode (debugDescription, dotLabel,
//                      label_A, label_B, info, shaderDescription, GetParameterCount,
//                      GetParameterName, SetParameter, GetParameter, GetNumInputs,
//                      SetInput, GetInput, SetFlags, ClearFlags, GetFlags,
//                      SetFilter, GetProperty, RenderTile, GetProgram,
//                      BindParamBufferDesc, Bind, BindTexture, UnBind,
//                      GetSWAIRProgram, SupportsInplaceHardwareBlending,
//                      EnableInplaceHardwareBlending, SetInPlaceHardwareBlendingInfo).
// The class overrides ONLY the two vdtor slots (D1/D0) — every other virtual
// slot inherits its HGNode implementation unchanged.
//
// The C2 ctor loads `leaq 0x9c9d2c(%rip), %rax` @0x3c535 (next-insn 0x3c53c
// + 0x9c9d2c = 0xa06268), matching the "installed vptr" from resolve.py.
// The C1 ctor loads `leaq 0x9c9c9c(%rip), %rax` @0x3c5c5 (next-insn 0x3c5cc
// + 0x9c9c9c = 0xa06268 — identical vptr).  D2 loads 0x9c9c18@0x3c649
// (next 0x3c650 + 0x9c9c18 = 0xa06268), D1 0x9c9bb8@0x3c6a9 (0x3c6b0 +
// 0x9c9bb8 = 0xa06268), D0 0x9c9b58@0x3c709 (0x3c710 + 0x9c9b58 = 0xa06268)
// — all five entry points install the SAME vptr = 0xa06268 (the installed
// pointer sits `+0x10` past the ABI two-slot header at &vtable_0xa06258).
//
// STRUCT LAYOUT (decoded from field references in this class's own slice):
//   +0x000 vptr                     — installed HGComicLookupFilterLUTBitmapResource vptr
//                                     (set by C2/C1 @0x3c53c/0x3c5cc, D2/D1/D0 slam it
//                                     back to the same address on entry).
//   +0x008..+0x197  ...            — HGNode base subobject (opaque — HGNode
//                                     is not yet on this port's decoded surface).
//   +0x198 pointer                  — a ref-counted HGObject-lineage pointer slot
//                                     ("current output cache"). Zero-initialized by
//                                     C2/C1 @0x3c53f/0x3c5cf (movq $0x0, 0x198(%rbx)).
//                                     GetOutput() @0x3c7aa..0x3c7c1 assigns a freshly-
//                                     `new`d HGBitmapLoader here (with proper release
//                                     of the previous occupant via vtable slot *0x18
//                                     — HGObject::Release). Dtors D0/D1/D2 @0x3c665
//                                     /0x3c6c5/0x3c725 call `*0x18(%rax)` = Release
//                                     on it.
//   +0x1a0 HGComicLookupFilterLUTBitmapResourceImplementation*  — owned Implementation
//                                     handle. C2/C1 @0x3c562/0x3c5f2 store a freshly-
//                                     `new`d 16-byte Implementation into this slot.
//                                     Dtors @0x3c653/0x3c6b3/0x3c713 call Release
//                                     on it (`*0x18(%rax)`). GetOutput() @0x3c76d/
//                                     0x3c774 reads `*(this+0x1a0)` and then loads the
//                                     LUTIndex enum from Implementation offset +0x0C
//                                     (`movl 0xc(%rax), %esi`).
//   sizeof(HGComicLookupFilterLUTBitmapResource) >= 0x1a8 (last observed +0x1a0
//     is an 8-byte pointer).
//
// FRONTIER CALLEES (each surfaced as a throwing stub with its call site cited):
//   HGNode::HGNode()                    [C2]  @Helium call 0x3c530, 0x3c5c0
//   HGNode::~HGNode()                   [D2]  @Helium call 0x3c599, 0x3c629, 0x3c73a
//                                              tail-jmp 0x3c680, 0x3c6e0
//   HGObject::operator new(unsigned long)     @Helium call 0x3c54f, 0x3c5df, 0x3c789
//   HGObject::operator delete(void*)          @Helium call 0x3c57a, 0x3c60a, 0x3c748,
//                                              0x3c82a
//   HGComicLookupFilterLUTBitmapResourceImplementation::HGComicLookupFilterLUTBitmapResourceImplementation(HGComicLUT::LUTIndex)
//                                              @Helium call 0x3c55d, 0x3c5ed
//                                              (nested-class ctor — allocates 16 bytes;
//                                              stores LUTIndex at Impl+0x0C).
//   HGComicLookupFilterLUTBitmapResourceImplementation::getCachedLUT(int)
//                                              @Helium call 0x3c77b (invoked with sret
//                                              ptr in %rdi = -0x20(%rbp) → returns an
//                                              HGRef<HGBitmap> by value at that slot).
//   HGBitmapLoader::HGBitmapLoader(HGBitmap*)  @Helium call 0x3c797 (constructs a new
//                                              0x1F0-byte HGBitmapLoader wrapping the
//                                              raw HGBitmap* from the HGRef).
//   HGObject::Retain() / HGObject::Release()   invoked indirectly through vtable slot
//                                              *0x10 / *0x18 of the HGRef payload
//                                              (`callq *0x10(%rax)` @0x3c7d3 = Retain
//                                              on the new HGBitmapLoader ptr; `callq
//                                              *0x18(%rax)` @0x3c7a7/0x3c7be/0x3c7e3/
//                                              0x3c662/0x3c674/0x3c6c2/0x3c6d4/
//                                              0x3c722/0x3c734 = Release on prior/
//                                              expiring payloads).
//   __Unwind_Resume                            @Helium call 0x3c5a1, 0x3c631, 0x3c845
//                                              (exception unwind trampolines).
//   __clang_call_terminate                     @Helium call 0x3c5a9, 0x3c639, 0x3c688,
//                                              0x3c690, 0x3c6e8, 0x3c6f0, 0x3c750,
//                                              0x3c758, 0x3c80f, 0x3c817, 0x3c81f,
//                                              0x3c84d (`terminate()` on double-fault).
//
// The GetOutput() exception-cleanup tail (0x3c7f4..0x3c852) is a compiler-
// synthesized landing pad for the two throwing operations in the body
// (HGObject::operator new @0x3c789 and HGBitmapLoader::HGBitmapLoader
// @0x3c797) — it does NOT introduce any new decoded semantics, only the
// Release-on-unwind sequences already covered by the frontier list above.
//
// REUSED PORTS: none.  HGComicLUT (from ./HGComicLUT.ts) is *related* to
// this class (the LUTIndex enum flows in through the ctor and the LUT data
// is what the Implementation eventually vends back), but there is NO direct
// cross-call between the two on this class's own decoded surface — the
// Implementation nested class mediates.  We therefore do not import from
// HGComicLUT.ts here (the coupling is exact-by-address, not by shared TS
// symbols).
//
// Source disassembly saved verbatim to:
//   raw-port/re/disasm/Helium.HGComicLookupFilterLUTBitmapResource.all.s

/**
 * Opaque handle for `HGNode` — Helium's base class for every renderable
 * node.  `HGComicLookupFilterLUTBitmapResource` IS-A HGNode.  HGNode's
 * own instance layout occupies bytes +0x08..+0x197 of every instance and
 * is not on this class's decoded surface.
 */
export type HGNode = object;

/**
 * Opaque handle for `HGRenderer` — Helium's per-frame render context,
 * passed by pointer to `GetOutput`. Not dereferenced by this class's
 * own decoded surface (GetOutput ignores the parameter — see @0x3c760;
 * `%rsi` is never read).
 */
export type HGRenderer = object;

/**
 * Opaque handle for `HGBitmap` — Helium's raw pixel-container object.
 * The Implementation's `getCachedLUT(int)` @Helium 0x3c34a returns an
 * `HGRef<HGBitmap>` (a 1-slot ref-counted pointer) by value; GetOutput
 * pulls the raw `HGBitmap*` out of that HGRef slot @0x3c780 and hands
 * it to the `HGBitmapLoader` ctor @0x3c797.
 */
export type HGBitmap = object;

/**
 * Opaque handle for `HGBitmapLoader` — a 0x1F0-byte (496-byte) HGObject-
 * lineage node that wraps a single `HGBitmap*` and exposes it as an
 * HGNode-shaped output. GetOutput @0x3c789 sizes it exactly (`movl
 * $0x1f0, %edi`); its ctor is called @0x3c797 with (this, HGBitmap*).
 */
export type HGBitmapLoader = object;

/**
 * Opaque handle for the nested Implementation class
 * `HGComicLookupFilterLUTBitmapResourceImplementation`. Its ctor is
 * called @0x3c55d/0x3c5ed with sizeof=0x10 (16 bytes). Layout partially
 * decoded here — LUTIndex enum lives at Impl+0x0C
 * (`movl 0xc(%rax), %esi` @0x3c774 loads it back for `getCachedLUT`).
 */
export type HGComicLookupFilterLUTBitmapResourceImplementation = object;

/**
 * `HGComicLUT::LUTIndex` — nested enum passed to the ctor.  See
 * ./HGComicLUT.ts for the recovered value set (a 1-based enum with
 * values [1..5], plus `0` / out-of-range falling into the LUT0 default).
 * Kept as `number` here because on THIS class's decoded surface the
 * enum is merely a pass-through argument stored raw into
 * Implementation+0x0C — the dispatch is done in `HGComicLUT::GetData`.
 */
export type HGComicLUT_LUTIndex = number;

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees — each surfaces its Helium call site.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `HGNode::HGNode()` [C2 — base-object ctor] — frontier method.
 * Called from this class's C2 ctor @Helium 0x3c530 and C1 ctor @0x3c5c0
 * with (`this`).  Constructs the HGNode base subobject (+0x08..+0x197
 * of the parent object).  Not on this class's decoded surface.
 */
function HGNode_C2_ctor(_self: HGComicLookupFilterLUTBitmapResource): void {
  throw new Error(
    "HGNode::HGNode() [C2] not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource C2 @Helium 0x3c530, C1 @0x3c5c0)",
  );
}

/**
 * `HGNode::~HGNode()` [D2 — base-object dtor] — frontier method.
 * Called from this class's D2 dtor @Helium 0x3c680 (tail-jmp), D1 dtor
 * @0x3c6e0 (tail-jmp), and D0 dtor @0x3c73a (call) with (`this`).
 */
function HGNode_D2_dtor(_self: HGComicLookupFilterLUTBitmapResource): void {
  throw new Error(
    "HGNode::~HGNode() [D2] not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource D2 tail-jmp @Helium 0x3c680, D1 tail-jmp @0x3c6e0, D0 call @0x3c73a)",
  );
}

/**
 * `HGObject::operator new(unsigned long)` — frontier method. Allocates
 * `size` bytes of raw HGObject-lineage memory.
 * Call sites in this class: @0x3c54f (16 bytes for Implementation),
 * @0x3c5df (16 bytes for Implementation), @0x3c789 (0x1f0=496 bytes for
 * HGBitmapLoader).  Returns a raw pointer.
 */
function HGObject_operator_new(size: number): object {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource C2 @Helium 0x3c54f, C1 @0x3c5df, GetOutput @0x3c789; requested size=" +
      String(size) +
      ")",
  );
}

/**
 * `HGObject::operator delete(void*)` — frontier method. Frees raw
 * HGObject-lineage memory returned by `HGObject::operator new`.
 * Call sites in this class: @0x3c57a (C2 exception-unwind), @0x3c60a
 * (C1 exception-unwind), @0x3c748 (D0 body), @0x3c82a (GetOutput
 * exception-unwind).
 */
function HGObject_operator_delete(_p: object): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource C2-unwind @Helium 0x3c57a, C1-unwind @0x3c60a, D0 @0x3c748, GetOutput-unwind @0x3c82a)",
  );
}

/**
 * `HGComicLookupFilterLUTBitmapResourceImplementation::HGComicLookupFilterLUTBitmapResourceImplementation(HGComicLUT::LUTIndex)`
 * — frontier method (nested-class ctor).  Called @Helium 0x3c55d and
 * @0x3c5ed with (`this = freshly-new'd 16-byte block`, `lutIndex`).
 * Stores the LUTIndex enum at Impl+0x0C (later read back by
 * `getCachedLUT(int)` via `movl 0xc(%rax), %esi` @0x3c774).
 */
function HGComicLookupFilterLUTBitmapResourceImplementation_C2_ctor(
  _self: HGComicLookupFilterLUTBitmapResourceImplementation,
  _lutIndex: HGComicLUT_LUTIndex,
): void {
  throw new Error(
    "HGComicLookupFilterLUTBitmapResourceImplementation::HGComicLookupFilterLUTBitmapResourceImplementation(HGComicLUT::LUTIndex) not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource C2 @Helium 0x3c55d, C1 @0x3c5ed)",
  );
}

/**
 * `HGComicLookupFilterLUTBitmapResourceImplementation::getCachedLUT(int)`
 * — frontier method. Called @Helium 0x3c77b from GetOutput with
 *   %rdi = sret slot (-0x20(%rbp) in the caller frame),
 *   %rsi = the LUTIndex enum loaded from Impl+0x0C (%esi = 0xc(%rax)).
 * Returns an `HGRef<HGBitmap>` (a 1-slot ref-counted pointer) at the
 * sret slot; the raw `HGBitmap*` is then loaded from `-0x20(%rbp)`
 * @0x3c780 (`movq -0x20(%rbp), %r15`).  Reference count is Release'd
 * on the returned HGRef @0x3c7a7 (via vtable slot *0x18) once the
 * bitmap has been handed off to the newly-constructed HGBitmapLoader.
 */
function HGComicLookupFilterLUTBitmapResourceImplementation_getCachedLUT(
  _self: HGComicLookupFilterLUTBitmapResourceImplementation,
  _lutIndex: number,
): { bitmap: HGBitmap | null } {
  throw new Error(
    "HGComicLookupFilterLUTBitmapResourceImplementation::getCachedLUT(int) not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource::GetOutput @Helium 0x3c77b)",
  );
}

/**
 * `HGBitmapLoader::HGBitmapLoader(HGBitmap*)` — frontier method. Called
 * @Helium 0x3c797 with (`this = freshly-new'd 0x1f0-byte block`,
 * `bitmap = the raw HGBitmap* pulled from the HGRef sret slot`).
 * Constructs a wrapper HGNode-lineage node around the given HGBitmap.
 */
function HGBitmapLoader_C1_ctor(
  _self: HGBitmapLoader,
  _bitmap: HGBitmap | null,
): void {
  throw new Error(
    "HGBitmapLoader::HGBitmapLoader(HGBitmap*) not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource::GetOutput @Helium 0x3c797)",
  );
}

/**
 * `HGObject::Retain()` — vtable-invoked frontier method (vtable slot
 * *0x10). Bumps the payload's refcount by 1.
 * Site in this class: @Helium 0x3c7d3 in GetOutput
 * (`callq *0x10(%rax)` on the newly-constructed HGBitmapLoader,
 * matching the "assign new payload, retain new, release old" idiom).
 */
function HGObject_Retain_vslot(_p: object): void {
  throw new Error(
    "HGObject::Retain() [vtable slot *0x10] not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource::GetOutput @Helium 0x3c7d3)",
  );
}

/**
 * `HGObject::Release()` — vtable-invoked frontier method (vtable slot
 * *0x18). Decrements the payload's refcount by 1; deletes on zero.
 * Sites in this class:
 *   Dtors: @0x3c662 (D2 on +0x1a0 Impl),  @0x3c674 (D2 on +0x198),
 *          @0x3c6c2 (D1 on +0x1a0),        @0x3c6d4 (D1 on +0x198),
 *          @0x3c722 (D0 on +0x1a0),        @0x3c734 (D0 on +0x198).
 *   GetOutput body: @0x3c7a7 (on the sret HGRef payload after handoff),
 *                   @0x3c7be (on the prior +0x198 payload before assign),
 *                   @0x3c7e3 (on the ref-adjust tail — see below).
 *   GetOutput unwind: @0x3c807, @0x3c83f.
 */
function HGObject_Release_vslot(_p: object): void {
  throw new Error(
    "HGObject::Release() [vtable slot *0x18] not yet transcribed " +
      "(referenced from HGComicLookupFilterLUTBitmapResource dtors D2/D1/D0 @Helium 0x3c662/0x3c674/0x3c6c2/0x3c6d4/0x3c722/0x3c734 and GetOutput @0x3c7a7/0x3c7be/0x3c7e3/0x3c807/0x3c83f)",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `HGComicLookupFilterLUTBitmapResource` — Helium HGNode-lineage resource
 * that lazily produces the "comic" lookup-table bitmap for a single
 * `HGComicLUT::LUTIndex`.  Instances hold a single 16-byte Implementation
 * object (`+0x1a0`) that owns the LUTIndex + the getCachedLUT/cacheLUT
 * cache, plus a single cached "current output" HGObject-lineage pointer
 * (`+0x198`, freshly refreshed each `GetOutput()` call).
 *
 * The vtable at Helium 0xa06258 (installed vptr 0xa06268) overrides ONLY
 * the two virtual-dtor slots (D1/D0) — every other slot is inherited
 * unchanged from HGNode.
 */
export class HGComicLookupFilterLUTBitmapResource {
  // +0x198 — cached "current output" HGObject-lineage pointer.  Zero-
  // initialized by both ctors; refreshed by GetOutput() to point at a
  // freshly-constructed HGBitmapLoader wrapping the current-frame's
  // cached LUT HGBitmap.  Released on dtor + on each GetOutput re-assign.
  private field_0x198: HGBitmapLoader | null = null;

  // +0x1a0 — owned Implementation handle.  Non-null immediately after
  // ctor, released on dtor.
  private field_0x1a0: HGComicLookupFilterLUTBitmapResourceImplementation | null =
    null;

  /**
   * `HGComicLookupFilterLUTBitmapResource::HGComicLookupFilterLUTBitmapResource(HGComicLUT::LUTIndex)`
   * — @Helium 0x3c520 [C2 — base-object ctor] and @0x3c5b0 [C1 —
   * complete-object ctor].  Both bodies are byte-for-byte identical
   * (only the vtable-`leaq` displacement differs by two, because the
   * `leaq` is at a different address; the RESOLVED vptr is the same
   * 0xa06268 in both).  We therefore expose a single TypeScript
   * constructor that mirrors both.
   *
   * DISASM (C2 @0x3c520):
   *   0x3c520..0x3c52d  frame setup + spill %rdi(this)->%rbx, %esi(idx)->%r14d
   *   0x3c530 callq HGNode::HGNode()             ; HGNode base subobject ctor
   *   0x3c535 leaq  0x9c9d2c(%rip), %rax         ; rax = 0xa06268 = installed vptr
   *   0x3c53c movq  %rax, (%rbx)                 ; this->vptr = &vtable+0x10
   *   0x3c53f movq  $0x0, 0x198(%rbx)            ; this->+0x198 = nullptr
   *   0x3c54a movl  $0x10, %edi                  ; size = 16 bytes for Implementation
   *   0x3c54f callq HGObject::operator new(unsigned long)
   *   0x3c554 movq  %rax, %r15                   ; r15 = fresh Impl ptr
   *   0x3c557 movq  %rax, %rdi                   ; &Impl
   *   0x3c55a movl  %r14d, %esi                  ; lutIndex
   *   0x3c55d callq HGComicLookupFilterLUTBitmapResourceImplementation::C2(LUTIndex)
   *   0x3c562 movq  %r15, 0x1a0(%rbx)            ; this->+0x1a0 = Impl
   *   0x3c569..0x3c573  frame teardown + retq
   *   [0x3c574..0x3c5ae : exception-unwind pad — release +0x198 (if any),
   *    tear down HGNode base subobject, delete the raw Impl allocation,
   *    __Unwind_Resume / __clang_call_terminate on double-fault.]
   *
   * DISASM (C1 @0x3c5b0): identical except for the `leaq` displacement
   * (0x9c9c9c vs 0x9c9d2c — same resolved vptr 0xa06268) and the unwind
   * pad addresses.
   */
  constructor(lutIndex: HGComicLUT_LUTIndex) {
    // @0x3c530 (C2) / @0x3c5c0 (C1) — construct HGNode base subobject.
    HGNode_C2_ctor(this);

    // @0x3c53c (C2) / @0x3c5cc (C1) — install the HGComicLookupFilterLUTBitmapResource
    // vptr = 0xa06268.  In TypeScript the "vptr install" is expressed
    // implicitly by the fact that `this` is a JS object whose prototype
    // is `HGComicLookupFilterLUTBitmapResource.prototype`.

    // @0x3c53f (C2) / @0x3c5cf (C1) — this->+0x198 = nullptr.
    this.field_0x198 = null;

    // @0x3c54f (C2) / @0x3c5df (C1) — allocate 16 bytes for the Impl.
    // @0x3c55d (C2) / @0x3c5ed (C1) — invoke the Impl C2 ctor with
    //   (freshly-allocated 16-byte block, lutIndex).
    const impl = HGObject_operator_new(0x10) as HGComicLookupFilterLUTBitmapResourceImplementation;
    HGComicLookupFilterLUTBitmapResourceImplementation_C2_ctor(impl, lutIndex);

    // @0x3c562 (C2) / @0x3c5f2 (C1) — this->+0x1a0 = impl.
    this.field_0x1a0 = impl;
  }

  /**
   * `HGComicLookupFilterLUTBitmapResource::~HGComicLookupFilterLUTBitmapResource()`
   * — @Helium 0x3c640 [D2 base-object dtor], @0x3c6a0 [D1 complete-
   * object dtor], @0x3c700 [D0 deleting dtor].  All three bodies share
   * the same "reset vptr → release +0x1a0 → release +0x198 → chain
   * HGNode::~HGNode()" spine; D0 additionally tail-calls
   * `HGObject::operator delete(this)` after the HGNode base dtor.
   *
   * DISASM (D2 @0x3c640):
   *   0x3c640..0x3c646  frame setup + spill %rdi(this)->%rbx
   *   0x3c649 leaq  0x9c9c18(%rip), %rax         ; rax = 0xa06268 = installed vptr
   *   0x3c650 movq  %rax, (%rdi)                 ; this->vptr = same vtable
   *                                                (defensive re-install; standard
   *                                                Itanium ABI pattern in D2).
   *   0x3c653 movq  0x1a0(%rdi), %rdi            ; rdi = this->+0x1a0
   *   0x3c65a testq %rdi, %rdi
   *   0x3c65d je    0x3c665                      ; skip Release if null
   *   0x3c65f movq  (%rdi), %rax                 ; rax = payload vtable
   *   0x3c662 callq *0x18(%rax)                  ; HGObject::Release() on Impl
   *   0x3c665 movq  0x198(%rbx), %rdi            ; rdi = this->+0x198
   *   0x3c66c testq %rdi, %rdi
   *   0x3c66f je    0x3c677                      ; skip Release if null
   *   0x3c671 movq  (%rdi), %rax
   *   0x3c674 callq *0x18(%rax)                  ; HGObject::Release() on cached output
   *   0x3c677 movq  %rbx, %rdi
   *   0x3c67a..0x3c67f  frame teardown
   *   0x3c680 jmp   HGNode::~HGNode()            ; tail-jmp base dtor
   *
   * DISASM (D1 @0x3c6a0): byte-identical spine (different `leaq`
   * displacement 0x9c9bb8, same resolved vptr 0xa06268; tail-jmp to
   * HGNode::~HGNode() @0x3c6e0).
   *
   * DISASM (D0 @0x3c700): identical to D1 except the ending is a CALL
   * to HGNode::~HGNode() @0x3c73a rather than a tail-jmp, followed by
   * `jmp HGObject::operator delete(void*)` @0x3c748 — the standard
   * deleting-dtor pattern (`~T(); operator delete(this);`).
   */
  destructor(): void {
    // @0x3c650 (D2) / @0x3c6b0 (D1) / @0x3c710 (D0) — defensively re-install
    // vptr = 0xa06268.  No-op in TypeScript (prototype identity).

    // @0x3c653/0x3c6b3/0x3c713 — Release the Implementation (if non-null).
    if (this.field_0x1a0 !== null) {
      HGObject_Release_vslot(this.field_0x1a0);
      this.field_0x1a0 = null;
    }

    // @0x3c665/0x3c6c5/0x3c725 — Release the cached output (if non-null).
    if (this.field_0x198 !== null) {
      HGObject_Release_vslot(this.field_0x198);
      this.field_0x198 = null;
    }

    // @0x3c680 (D2 tail-jmp) / @0x3c6e0 (D1 tail-jmp) / @0x3c73a (D0 call)
    // — chain into the HGNode base-object dtor.
    HGNode_D2_dtor(this);

    // @0x3c748 (D0 only) — `HGObject::operator delete(this)`.  We express
    // the deleting-dtor tail by simply not distinguishing D0 from D1/D2
    // in TypeScript: the JS GC reclaims the object once no live refs
    // remain, so there is no distinct "delete this" step to mirror.
    // The frontier stub is still cited above for provenance.
  }

  /**
   * `HGComicLookupFilterLUTBitmapResource::GetOutput(HGRenderer*)` —
   * @Helium 0x3c760.  Returns an HGNode-lineage output (an
   * HGBitmapLoader wrapping the current-frame's cached LUT HGBitmap).
   *
   * The `HGRenderer*` argument is IGNORED by the body (never read) —
   * it is present only to satisfy the vtable slot signature inherited
   * from HGNode.
   *
   * DISASM (@0x3c760):
   *   0x3c760..0x3c76a  frame setup + spill %rdi(this)->%r14
   *   0x3c76d movq  0x1a0(%rdi), %rax             ; rax = this->+0x1a0 (Impl)
   *   0x3c774 movl  0xc(%rax), %esi               ; esi = Impl->+0x0c = LUTIndex
   *   0x3c777 leaq  -0x20(%rbp), %rdi             ; rdi = sret slot (HGRef<HGBitmap>)
   *   0x3c77b callq Impl::getCachedLUT(int)       ; -> HGRef<HGBitmap> at sret slot
   *   0x3c780 movq  -0x20(%rbp), %r15             ; r15 = raw HGBitmap* from HGRef.ptr
   *   0x3c784 movl  $0x1f0, %edi                  ; size = 496 bytes for HGBitmapLoader
   *   0x3c789 callq HGObject::operator new(unsigned long)
   *   0x3c78e movq  %rax, %rbx                    ; rbx = fresh HGBitmapLoader
   *   0x3c791 movq  %rax, %rdi                    ; &loader
   *   0x3c794 movq  %r15, %rsi                    ; raw HGBitmap*
   *   0x3c797 callq HGBitmapLoader::HGBitmapLoader(HGBitmap*)
   *   0x3c79c testq %r15, %r15
   *   0x3c79f je    0x3c7aa                       ; skip Release on null HGRef
   *   0x3c7a1 movq  (%r15), %rax
   *   0x3c7a4 movq  %r15, %rdi
   *   0x3c7a7 callq *0x18(%rax)                   ; Release on the HGRef sret payload
   *   0x3c7aa movq  0x198(%r14), %rdi             ; rdi = this->+0x198 (prior output)
   *   0x3c7b1 cmpq  %rbx, %rdi                    ; new == old ?
   *   0x3c7b4 je    0x3c7d8                       ; if same → skip release+assign
   *   0x3c7b6 testq %rdi, %rdi
   *   0x3c7b9 je    0x3c7c1                       ; skip Release on null prior
   *   0x3c7bb movq  (%rdi), %rax
   *   0x3c7be callq *0x18(%rax)                   ; Release prior +0x198 payload
   *   0x3c7c1 movq  %rbx, 0x198(%r14)             ; this->+0x198 = new loader
   *   0x3c7c8 testq %rbx, %rbx
   *   0x3c7cb je    0x3c7e6                       ; skip Retain if null new
   *   0x3c7cd movq  (%rbx), %rax
   *   0x3c7d0 movq  %rbx, %rdi
   *   0x3c7d3 callq *0x10(%rax)                   ; Retain new loader (+1 ref)
   *   0x3c7d6 jmp   0x3c7dd                       ; skip the "same-ptr" branch's Release
   *   0x3c7d8 testq %rbx, %rbx                    ; same-ptr branch: r15==new (already
   *   0x3c7db je    0x3c7e6                       ;   held), so we only Release the extra
   *   0x3c7dd movq  (%rbx), %rax                  ;   ref that our C++ caller expects the
   *   0x3c7e0 movq  %rbx, %rdi                    ;   returned pointer to already carry —
   *   0x3c7e3 callq *0x18(%rax)                   ;   which the "new != old" arm produces
   *                                                ;   via Retain, and this arm reproduces
   *                                                ;   via *nothing* (Release balances the
   *                                                ;   caller's expected +1).  Net effect:
   *                                                ;   returned ptr has refcount matching
   *                                                ;   the caller's C++ HGRef contract.
   *   0x3c7e6 movq  %rbx, %rax                    ; return the loader
   *   0x3c7e9..0x3c7f3  frame teardown + retq
   *   [0x3c7f4..0x3c852 : exception-unwind trampolines.]
   *
   * Note on the "same-ptr" branch at 0x3c7d8..0x3c7e3: the compiler emits
   * this to preserve the callee-returns-with-+1-refcount ABI contract in
   * the corner case where the new payload happens to compare-equal to
   * the old payload (which would happen if `operator new` returned the
   * exact same freed block that +0x198 previously held).  In practice
   * for a freshly-`new`'d 0x1f0-byte HGBitmapLoader this branch is
   * effectively unreachable, but we mirror it here for byte-for-byte
   * fidelity.
   */
  GetOutput(_renderer: HGRenderer | null): HGBitmapLoader {
    // @0x3c76d — rax = this->+0x1a0 (Impl).
    const impl = this.field_0x1a0;
    if (impl === null) {
      // Not a possible ctor postcondition (both C1/C2 always assign +0x1a0),
      // but preserved as a defensive early-signal so that a bug elsewhere
      // surfaces here rather than as a wild pointer deref.
      throw new Error(
        "HGComicLookupFilterLUTBitmapResource::GetOutput @Helium 0x3c76d — this->+0x1a0 is null (Impl was never constructed or has already been released)",
      );
    }

    // @0x3c774 — %esi = Impl->+0x0c = LUTIndex enum.  Not decoded on this
    // class's own surface (Impl's field layout is a frontier); we pass a
    // sentinel through the frontier stub and rely on the stub to raise.
    // The literal "load LUTIndex from +0x0c" is preserved here as an
    // explicit cite so the demand for Impl's transcription is auditable.
    // In a fully-transcribed port this would be `impl.lutIndex` @+0x0C.
    const lutIndex_from_impl_0x0c = ((): number => {
      // Reading Impl->+0x0c is not on this class's decoded surface — the
      // Impl struct layout is a frontier. Route through the getter that
      // getCachedLUT itself uses (the frontier stub will raise, matching
      // the "not yet transcribed" contract). @Helium 0x3c774.
      throw new Error(
        "HGComicLookupFilterLUTBitmapResource::GetOutput @Helium 0x3c774 — Impl->+0x0c (LUTIndex) not yet transcribed (Implementation struct layout is a frontier)",
      );
    })();

    // @0x3c77b — HGRef<HGBitmap> hgref = Impl::getCachedLUT(lutIndex).
    // The C++ ABI passes an sret slot in %rdi; the returned HGRef occupies
    // that slot and holds a single 8-byte HGBitmap* (retained by the
    // getCachedLUT implementation).
    const hgref = HGComicLookupFilterLUTBitmapResourceImplementation_getCachedLUT(
      impl as HGComicLookupFilterLUTBitmapResourceImplementation,
      lutIndex_from_impl_0x0c,
    );

    // @0x3c780 — extract raw HGBitmap* from the HGRef's first slot.
    const bitmap = hgref.bitmap;

    // @0x3c789 — allocate 0x1f0 (496) bytes for the HGBitmapLoader.
    const loader = HGObject_operator_new(0x1f0) as HGBitmapLoader;

    // @0x3c797 — HGBitmapLoader::HGBitmapLoader(loader, bitmap).
    HGBitmapLoader_C1_ctor(loader, bitmap);

    // @0x3c79f/0x3c7a7 — Release the HGRef payload (bitmap has been
    // "moved" into the loader; the sret HGRef held a +1 ref that we
    // now let go).  `if (bitmap != null) Release(bitmap)`.
    if (bitmap !== null) {
      HGObject_Release_vslot(bitmap as object);
    }

    // @0x3c7aa..0x3c7c1 — refresh the this->+0x198 cached-output slot:
    //   prior = this->+0x198
    //   if (prior != loader) { if (prior) Release(prior); this->+0x198 = loader; }
    //   (The "same-ptr" branch at 0x3c7d8..0x3c7e3 leaves +0x198 unchanged.)
    const prior = this.field_0x198;
    if (prior !== loader) {
      if (prior !== null) {
        // @0x3c7be — Release the prior cached output.
        HGObject_Release_vslot(prior as object);
      }
      // @0x3c7c1 — this->+0x198 = new loader.
      this.field_0x198 = loader as HGBitmapLoader;

      // @0x3c7cd..0x3c7d3 — Retain the new loader (+1 ref) so that the
      // caller receives a ptr with the expected +1 refcount AND +0x198
      // also holds a live ref.  `if (loader != null) Retain(loader)`.
      if (loader !== null) {
        HGObject_Retain_vslot(loader as object);
      }
    } else {
      // @0x3c7d8..0x3c7e3 — same-ptr branch: `if (loader != null)
      // Release(loader)`.  See the DISASM comment above for the ABI-
      // balance rationale.  In practice unreachable for a freshly
      // `new`'d loader, mirrored for byte-fidelity.
      if (loader !== null) {
        HGObject_Release_vslot(loader as object);
      }
    }

    // @0x3c7e6 — return the loader.
    return loader;
  }
}
