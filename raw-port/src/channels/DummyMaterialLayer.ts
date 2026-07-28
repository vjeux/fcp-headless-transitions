// DummyMaterialLayer.ts — Ozone's concrete material-layer that owns a vector of
// PCPtr<LiMaterialLayerOperator> and forwards computeColor/executeOperators to
// them by iterating the vector and vtable-dispatching each operator at slot
// +0x10 of its own vtable. Faithful transcription of the seven exported symbols
// in Ozone.framework (six DummyMaterialLayer methods + two virtual thunks; two
// destructor variants share one D0 body):
//
//   @0x00000000001e1c30  DummyMaterialLayer::DummyMaterialLayer(void*)  [C2]
//                        __ZN18DummyMaterialLayerC2EPv
//   @0x00000000001e1c80  DummyMaterialLayer::DummyMaterialLayer(void*)  [C1 — same body as C2]
//                        __ZN18DummyMaterialLayerC1EPv
//   @0x00000000001e1d00  DummyMaterialLayer::computeColor(LayerContext const&, SurfaceProperties&)
//                        __ZN18DummyMaterialLayer12computeColorERK12LayerContextR17SurfaceProperties
//   @0x00000000001e1d60  DummyMaterialLayer::executeOperators(LayerContext const&, SurfaceProperties&)
//                        __ZN18DummyMaterialLayer16executeOperatorsERK12LayerContextR17SurfaceProperties
//   @0x00000000001e1dc0  DummyMaterialLayer::addOperator(PCPtr<LiMaterialLayerOperator> const&)
//                        __ZN18DummyMaterialLayer11addOperatorERK5PCPtrI23LiMaterialLayerOperatorE
//   @0x00000000001e36c0  DummyMaterialLayer::~DummyMaterialLayer()  [D1]
//                        __ZN18DummyMaterialLayerD1Ev
//   @0x00000000001e3760  DummyMaterialLayer::~DummyMaterialLayer()  [D0 — deleting; the one whose
//                                                                    body we transcribed]
//                        __ZN18DummyMaterialLayerD0Ev
//   @0x00000000001e3800  virtual thunk to DummyMaterialLayer::~DummyMaterialLayer() [thunk-to-D1]
//                        __ZTv0_n24_N18DummyMaterialLayerD1Ev
//   @0x00000000001e38b0  virtual thunk to DummyMaterialLayer::~DummyMaterialLayer() [thunk-to-D0]
//                        __ZTv0_n24_N18DummyMaterialLayerD0Ev
//
// Source disassembly:
//   raw-port/re/disasm/DummyMaterialLayer.DummyMaterialLayer.s (ctor C1 body @0x1e1c80)
//   raw-port/re/disasm/DummyMaterialLayer.computeColor.s       (@0x1e1d00)
//   raw-port/re/disasm/DummyMaterialLayer.executeOperators.s   (@0x1e1d60 — distinct body, not ICF)
//   raw-port/re/disasm/DummyMaterialLayer.addOperator.s        (@0x1e1dc0)
//   raw-port/re/disasm/DummyMaterialLayer.~DummyMaterialLayer.s (D0 body @0x1e3760)
//
// VTABLE (`resolve.py Ozone vtable DummyMaterialLayer`):
//   __ZTV18DummyMaterialLayer @0x8434d0, primary installed-ptr = 0x8434d0+0x18 = 0x8434e8
//   *0x08 -> 0x1e36c0  DummyMaterialLayer::~DummyMaterialLayer()  [D1]
//   *0x10 -> 0x1e3760  DummyMaterialLayer::~DummyMaterialLayer()  [D0]
//   *0x30 -> 0x1e1d00  DummyMaterialLayer::computeColor(LayerContext const&, SurfaceProperties&)
//   *0x80 -> 0x40770   PCShared_base::dispose()   (in vtable's second sub-object region)
//   *0x98/0xa0 ->      construction-vtable slots for the PCShared_base subobject-in-DummyMaterialLayer
// The ctor also installs a SECONDARY vptr at (this+0x38) = 0x8434d0+0x86 = 0x843556 — this is the
// PCShared_base sub-object's vptr slice of the same combined vtable (Itanium multi-inheritance).
//
// STRUCT LAYOUT (recovered end-to-end from ctor + all four methods):
//   +0x00  vptr  primary DummyMaterialLayer vptr (points to 0x8434e8)
//                ctor @0x1e1cb4..@0x1e1cbb: `leaq 0x66182d(%rip), %rax ; movq %rax, (%rbx)`
//                = leaq target (0x1e1cbb + 0x66182d) = 0x8434e8, i.e. vtable+0x18.
//   +0x08  <inherited LiMaterialLayer subobject> — untouched by C1 body beyond delegation to
//          @0x6ddeea __ZN15LiMaterialLayerC2EPv (LiMaterialLayer::LiMaterialLayer(void*) — a stub
//          call, so LiMaterialLayer's C2 handles bytes below +0x18 that this ctor doesn't touch).
//   +0x19  bool  flag written to 0 at @0x1e1cd8 (`movb $0x0, 0x19(%rbx)`). No decoded reader; the
//                loud honest thing is to model it as an opaque byte field with a documented offset
//                and NEVER read/write it beyond ctor init (any use would be undecoded work).
//   +0x20  begin  pointer to first element of std::vector<PCPtr<LiMaterialLayerOperator>> storage
//                 ctor @0x1e1ccc: `movups %xmm0, 0x20(%rbx)` — writes 16 zero-bytes (both begin and
//                 end fields are set to null); +0x28 is the vector's `end` sentinel.
//   +0x28  end    pointer to one-past-last element (see +0x20). Both fields together form the
//                 [begin,end) half of libc++'s `std::vector` layout; each element is 16 bytes
//                 (a PCPtr<LiMaterialLayerOperator>: `T* + PCSharedCount` — 8 bytes for the raw
//                 pointer at +0, then a PCSharedCount at +8, itself 8 bytes for a single
//                 PC_Sp_counted_base*; addOperator's +0x10 stride confirms 16 bytes/element).
//   +0x30  capacity_end  ctor @0x1e1cd0: `movq $0x0, 0x30(%rbx)`. Same libc++ std::vector layout,
//                        one-past-capacity sentinel; addOperator compares end vs capacity_end at
//                        @0x1e1dce: `cmpq 0x30(%rdi), %r14` to decide whether the fast path
//                        (in-place placement-new + PCSharedCount copy) or the emplace-back
//                        slow path is taken.
//   +0x38  vptr  secondary PCShared_base sub-object vptr (points to 0x843556)
//                ctor @0x1e1cbe..@0x1e1cc5: `leaq 0x66188b(%rip), %rax ; movq %rax, 0x38(%rbx)`
//                = leaq target (0x1e1cc5 + 0x66188b) = 0x843556, i.e. vtable+0x86.
//   +0x40  PC_Sp_counted_base*  weak-count backref for the PCShared_base sub-object.
//                ctor @0x1e1ca0: `movq $0x0, 0x40(%rdi)` — initialized to null.
//                D0 @0x1e37d4: `movq 0x40(%rbx), %rdi ; testq %rdi,%rdi ; je +7 ;
//                                callq __ZN18PC_Sp_counted_base12weak_releaseEv`.
//   NOTE: PCShared_base's OWN vptr write at +0x38 happens twice in the ctor. First @0x1e1c91..
//   @0x1e1c9c the ctor writes `__ZTV13PCShared_base+0x10` (the standalone PCShared_base vtable —
//   this is the "not-yet-derived" state before delegate-to-LiMaterialLayer runs). Then after the
//   call to LiMaterialLayer::LiMaterialLayer(void*) returns, @0x1e1cbe..@0x1e1cc5 the ctor
//   REinstalls the DummyMaterialLayer combined vtable's PCShared_base slice. This is the standard
//   Itanium "install-most-derived-vptr-last" idiom.
//
// Frontier / imports referenced (resolved via `resolve.py Ozone stub <addr>`):
//   @0x1e1caf  callq 0x6ddeea  __ZN15LiMaterialLayerC2EPv           (LiMaterialLayer C2 — base ctor)
//   @0x1e1de2  callq 0x6ddae2  __ZN13PCSharedCountC1ERKS_            (PCSharedCount(copy) — copy the
//                                                                    PCSharedCount half of a PCPtr)
//   @0x1e1df5  callq __ZNSt3__16vectorI5PCPtrI...E24__emplace_back_slow_pathIJRKS3_EEEPS3_DpOT_
//                                                                   (libc++ vector emplace_back
//                                                                    slow-path — undecoded C++ stdlib)
//   @0x1e37a8  callq 0x6ddaee  __ZN13PCSharedCountD1Ev               (PCSharedCount D1 — free one
//                                                                    PCPtr's count half during dtor)
//   @0x1e37c0  callq 0x6dfc36  __ZdlPv                               (operator delete(void*))
//   @0x1e37dd  callq 0x6de4fc  __ZN18PC_Sp_counted_base12weak_releaseEv
//                                                                   (weak-release of the sub-object
//                                                                    backref @+0x40).
//   @0x1e37ef  jmp   0x6dfc36  __ZdlPv                               (tail-jmp operator delete)
//   @0x1e1d42/@0x1e1da2  callq 0x6dd290  __Z28throw_PCNullPointerExceptionb
//                                                                   (throw PCNullPointerException(bool))
//   @0x1e1cef  callq 0x6dd07a  __Unwind_Resume                       (unwind after LiMaterialLayer
//                                                                    ctor throws)
//   ctor secondary path: @0x1e1ce7  callq __ZN13PCShared_baseD2Ev    (PCShared_base D2 during unwind).
//
// Bases already landed (imported from ../infra):
//   PCShared_base       raw-port/src/infra/PCShared_base.ts
//   PCSharedCount       raw-port/src/infra/PCSharedCount.ts
// Bases already landed alongside (imported from ./LiMaterialLayerOperator):
//   LayerContext, SurfaceProperties, LiMaterialLayerOperator
//                       raw-port/src/channels/LiMaterialLayerOperator.ts
//   (LiMaterialLayer itself is a `ud2`-only stub in raw-port/src/channels/LiMaterialLayer.ts —
//    we import it only as a type reference to document the inheritance; its methods are traps.)

import type {
  LayerContext,
  SurfaceProperties,
  LiMaterialLayerOperator,
} from "./LiMaterialLayerOperator";

// ── Frontier stubs — every undecoded external callee gets a throw citing its addr. ─────────────

/** `__ZN15LiMaterialLayerC2EPv` — LiMaterialLayer::LiMaterialLayer(void*) [C2 base ctor],
 *  @Ozone 0x6ddeea (stub target). Called by DummyMaterialLayer C2 @0x1e1caf.
 *  Not yet transcribed. */
function LiMaterialLayer_C2_stub(_this: DummyMaterialLayer, _arg: unknown): void {
  throw new Error(
    "LiMaterialLayer::LiMaterialLayer(void*) [C2] @Ozone 0x6ddeea not yet transcribed"
  );
}

/** `__ZN13PCSharedCountC1ERKS_` — PCSharedCount::PCSharedCount(PCSharedCount const&) [C1],
 *  @Ozone 0x6ddae2 (stub target). Called by DummyMaterialLayer::addOperator @0x1e1de2.
 *  Not yet transcribed here (a corresponding PCSharedCount copy-ctor lives in
 *  raw-port/src/infra/PCSharedCount.ts under ProCore addresses — the Ozone stub jumps to that
 *  ProCore copy at runtime; a proper wiring across frameworks is future work). */
function PCSharedCount_copy_ctor_stub(_dst: PCSharedCountSlot, _src: PCSharedCountSlot): void {
  throw new Error(
    "PCSharedCount::PCSharedCount(PCSharedCount const&) [C1] @Ozone 0x6ddae2 stub — " +
      "cross-framework wiring to ProCore PCSharedCount not yet transcribed"
  );
}

/** `__ZN13PCSharedCountD1Ev` — PCSharedCount::~PCSharedCount() [D1],
 *  @Ozone 0x6ddaee (stub target). Called by DummyMaterialLayer::~DummyMaterialLayer(D0)
 *  @0x1e37a8 in the per-element cleanup loop.
 *  Not yet transcribed here (see cross-framework note on the copy-ctor above). */
function PCSharedCount_D1_stub(_slot: PCSharedCountSlot): void {
  throw new Error(
    "PCSharedCount::~PCSharedCount() [D1] @Ozone 0x6ddaee stub — " +
      "cross-framework wiring to ProCore PCSharedCount not yet transcribed"
  );
}

/** `__ZN18PC_Sp_counted_base12weak_releaseEv` — PC_Sp_counted_base::weak_release(),
 *  @Ozone 0x6de4fc (stub target). Called by DummyMaterialLayer::~DummyMaterialLayer(D0)
 *  @0x1e37dd on the +0x40 backref. Not yet transcribed. */
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release() @Ozone 0x6de4fc not yet transcribed"
  );
}

/** `__ZdlPv` — operator delete(void*), @Ozone 0x6dfc36 (stub target).
 *  Called by DummyMaterialLayer::~DummyMaterialLayer(D0) at @0x1e37c0 (free the vector's
 *  heap-allocated storage) and tail-jumped at @0x1e37ef (free `this`). Not transcribed. */
function operator_delete_stub(_p: unknown): void {
  throw new Error("operator delete(void*) @Ozone 0x6dfc36 not yet transcribed");
}

/** `__Z28throw_PCNullPointerExceptionb` — throw PCNullPointerException(bool),
 *  @Ozone 0x6dd290 (stub target). Called by computeColor @0x1e1d42 and
 *  executeOperators @0x1e1da2 when the operator pointer is null. Not transcribed;
 *  the loud mirror is a throw that carries the addr forward. */
function throw_PCNullPointerException_stub(_arg: boolean): never {
  throw new Error(
    "throw_PCNullPointerException(bool) @Ozone 0x6dd290 not yet transcribed"
  );
}

/** libc++ vector emplace_back slow-path used by DummyMaterialLayer::addOperator @0x1e1df5
 *  when the +0x28 end pointer has hit +0x30 capacity_end. This is C++ stdlib and not
 *  transcribed. */
function vector_emplace_back_slow_path_stub(
  _vec: DummyMaterialLayer,
  _ptr: PCPtrOfLiMaterialLayerOperator
): PCPtrOfLiMaterialLayerOperator {
  throw new Error(
    "std::vector<PCPtr<LiMaterialLayerOperator>>::__emplace_back_slow_path @Ozone " +
      "(libc++ stdlib) not yet transcribed"
  );
}

// ── Types that mirror the shapes we read/write ────────────────────────────────────────────────

/** One 8-byte slot representing a `PCSharedCount`. Layout confirmed in
 *  raw-port/src/infra/PCSharedCount.ts: a single 8-byte field (`p` at +0x00) holding a
 *  PC_Sp_counted_base* or null. We only ever pass this by structural handle to the two
 *  ProCore-side stubs above; DummyMaterialLayer never reads its interior. */
export interface PCSharedCountSlot {
  /** Pointer-sized field at +0x00 of PCSharedCount. Never dereferenced here. */
  p_at_0x00: unknown;
}

/** `PCPtr<LiMaterialLayerOperator>` — 16 bytes. addOperator's `addq $0x10, %r14`
 *  @0x1e1de7 pins the stride. Field layout mirrored from Ozone's fast-path bytes:
 *   +0x00  T*                          copied by @0x1e1dd7: `movq (%rsi),%rax ; movq %rax,(%r14)`.
 *   +0x08  PCSharedCount               copied by @0x1e1dda..@0x1e1de2: `leaq 0x8(%r14),%rdi ;
 *                                       addq $0x8,%rsi ; callq PCSharedCount::PCSharedCount(const&)`.
 *  This exact byte layout is what DummyMaterialLayer's vector stores. */
export interface PCPtrOfLiMaterialLayerOperator {
  /** +0x00  raw pointer to the target LiMaterialLayerOperator (nullable). */
  ptr_at_0x00: LiMaterialLayerOperator | null;
  /** +0x08  shared-count half of the PCPtr; owns one strong ref to ptr_at_0x00 when non-null. */
  count_at_0x08: PCSharedCountSlot;
}

/** Type-erased view of an operator's vtable. computeColor / executeOperators read the vptr
 *  at (op+0) then call `*(vptr+0x10)(op, ctx, out)` — this is the vslot-2 method on
 *  LiMaterialLayerOperator's own vtable. LiMaterialLayerOperator::eval(LayerContext const&,
 *  SurfaceProperties&) @Ozone 0x1e3140 IS this slot for the "no op" base; concrete subclasses
 *  (BumpMaterialLayer, FlatMaterialLayer, SpecularMaterialLayer — see /tmp/Ozone_symmap.tsv)
 *  override it. We model dispatch through the object's own `.eval()` method so that whatever
 *  subclass the actual operator is, the correct method runs — same as vtable dispatch on the
 *  x86 side. */
type LiMaterialLayerOperatorEval = (
  op: LiMaterialLayerOperator,
  ctx: LayerContext,
  out: SurfaceProperties
) => void;

/** Universal dispatch shim for `*(op_vptr+0x10)(op, ctx, out)`. The vtable slot layout matches
 *  LiMaterialLayerOperator::eval(LayerContext const&, SurfaceProperties&) @Ozone 0x1e3140
 *  (verified by `resolve.py Ozone vtable LiMaterialLayerOperator` — omitted here for brevity but
 *  cited in raw-port/src/channels/LiMaterialLayerOperator.ts).
 *  We call the operator's own `eval` method — same behavior as vtable dispatch. */
function operator_vslot_0x10_call(
  op: LiMaterialLayerOperator,
  ctx: LayerContext,
  out: SurfaceProperties
): void {
  const evalFn = (op as unknown as { eval: LiMaterialLayerOperatorEval }).eval;
  if (typeof evalFn !== "function") {
    throw new Error(
      "LiMaterialLayerOperator vslot +0x10 (eval) missing on operator — undecoded subclass; " +
        "faithful mirror of the C++ vtable requires the concrete subclass to override this slot"
    );
  }
  evalFn.call(op, op, ctx, out);
}

// ── The class ────────────────────────────────────────────────────────────────────────────────

/**
 * `DummyMaterialLayer` — Ozone concrete `LiMaterialLayer` subclass whose only mission is to hold
 * a queue of `PCPtr<LiMaterialLayerOperator>`s and forward `computeColor` / `executeOperators`
 * calls to each of them in insertion order. The two forward methods have byte-identical bodies —
 * both iterate the same vector and both invoke the operator's vtable slot +0x10 (`eval(ctx, out)`).
 *
 * Field layout is pinned end-to-end from the C1 ctor body @0x1e1c80 and every method body.
 * See the module docstring above for the offset table.
 */
export class DummyMaterialLayer {
  /** +0x00 primary DummyMaterialLayer vptr; ctor @0x1e1cb4 installs 0x8434e8 (vtable+0x18). */
  vptr_at_0x00: string = "__ZTV18DummyMaterialLayer+0x18";
  /** +0x19 opaque bool flag; ctor @0x1e1cd8 initializes to 0. Never read by any decoded method. */
  flag_at_0x19: number = 0;
  /** +0x20 std::vector begin pointer; ctor @0x1e1ccc zeroes it (via `xorps xmm0,xmm0 ; movups xmm0`). */
  begin_at_0x20: PCPtrOfLiMaterialLayerOperator[] = [];
  /** +0x28 std::vector end pointer; ctor @0x1e1ccc zeroes it via the same movups.
   *
   *  MODEL: at the C++ level +0x20/+0x28/+0x30 are three pointers into a heap-allocated
   *  T[capacity] block; the "iteration" is `for (T* p = begin ; p != end ; p += sizeof(T))`
   *  (see computeColor @0x1e1d0b..@0x1e1d33 and executeOperators @0x1e1d6b..@0x1e1d93). In TS
   *  we mirror the observable behavior with a JS array — the vector's iteration order and the
   *  end-vs-capacity distinction are the only externally observable properties, and both are
   *  preserved. begin/end/capacity are documented as separate fields to keep the offset
   *  witness in the port. */
  end_at_0x28_length: number = 0;
  /** +0x30 std::vector capacity end pointer; ctor @0x1e1cd0 zeroes it (`movq $0x0, 0x30(%rbx)`).
   *  addOperator's fast/slow path split at @0x1e1dce compares end vs capacity_end. In TS the
   *  "capacity vs size" split is a no-op (JS arrays auto-grow), so we always take the fast path
   *  logically — but we still transcribe the branch as a documented no-op to keep the
   *  control-flow shape traceable to the x86 body. */
  capacity_end_at_0x30_length: number = 0;
  /** +0x38 secondary PCShared_base sub-object vptr; ctor @0x1e1cbe installs 0x843556
   *  (vtable+0x86). Written twice by the ctor (first as `__ZTV13PCShared_base+0x10`, then
   *  re-written as the combined vtable's PCShared_base slice after the LiMaterialLayer C2
   *  callee returns — standard Itanium install-most-derived-last). */
  vptr_at_0x38: string = "__ZTV18DummyMaterialLayer+0x86";
  /** +0x40 PC_Sp_counted_base* weak-count backref for the PCShared_base sub-object; ctor
   *  @0x1e1ca0 initializes to null. */
  spCountedBaseBackref_at_0x40: unknown = null;

  /**
   * `DummyMaterialLayer::DummyMaterialLayer(void*)` [C1/C2 — same body]  @Ozone 0x1e1c80.
   *
   * Body (Ozone x86_64):
   *   0x1e1c80  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   0x1e1c87  movq  %rsi, %rdx                       ; forward `void* arg` to LiMaterialLayer C2
   *   0x1e1c8a  movq  %rdi, %rbx                       ; rbx = this
   *   0x1e1c8d  leaq  0x38(%rdi), %r14                 ; r14 = &this[+0x38]  (unwind pad target)
   *   0x1e1c91  leaq  __ZTV13PCShared_base(%rip), %rax
   *   0x1e1c98  addq  $0x10, %rax                      ; rax = __ZTV13PCShared_base + 0x10
   *   0x1e1c9c  movq  %rax, 0x38(%rdi)                 ; TEMP install PCShared_base's own vptr
   *   0x1e1ca0  movq  $0x0, 0x40(%rdi)                 ; +0x40 = null (weak-count backref)
   *   0x1e1ca8  leaq  0x6618c1(%rip), %rsi             ; rsi = "vtable-derived" tag for the base ctor
   *   0x1e1caf  callq 0x6ddeea                         ; __ZN15LiMaterialLayerC2EPv (base ctor)
   *   0x1e1cb4  leaq  0x66182d(%rip), %rax             ; rax = 0x8434e8 = DummyMaterialLayer vtable+0x18
   *   0x1e1cbb  movq  %rax, (%rbx)                     ; +0x00 = primary vptr
   *   0x1e1cbe  leaq  0x66188b(%rip), %rax             ; rax = 0x843556 = DummyMaterialLayer vtable+0x86
   *   0x1e1cc5  movq  %rax, 0x38(%rbx)                 ; +0x38 = secondary (PCShared_base sub-object) vptr
   *   0x1e1cc9  xorps %xmm0, %xmm0
   *   0x1e1ccc  movups %xmm0, 0x20(%rbx)               ; +0x20 = null, +0x28 = null   (vector begin/end)
   *   0x1e1cd0  movq  $0x0, 0x30(%rbx)                 ; +0x30 = null                 (vector capacity_end)
   *   0x1e1cd8  movb  $0x0, 0x19(%rbx)                 ; +0x19 = 0                    (opaque flag)
   *   0x1e1cdc  popq %rbx / popq %r14 / popq %rbp / retq
   *   [ landing pad @0x1e1ce1: rethrow-after-teardown — call PCShared_base::D2 on (+0x38), then
   *     __Unwind_Resume — matches the "install temp base-vptr first so unwind can dispatch through
   *     it if base C2 throws" idiom. ]
   *
   * @param _arg   opaque `void*` payload forwarded to `LiMaterialLayer::LiMaterialLayer(void*)`.
   */
  static construct(dst: DummyMaterialLayer, _arg: unknown): void {
    // @0x1e1c91..@0x1e1c9c — first vptr write (temporary PCShared_base standalone vtable).
    dst.vptr_at_0x38 = "__ZTV13PCShared_base+0x10";
    // @0x1e1ca0 — zero the weak-count backref.
    dst.spCountedBaseBackref_at_0x40 = null;
    // @0x1e1caf — delegate to LiMaterialLayer C2 (undecoded).
    LiMaterialLayer_C2_stub(dst, _arg);
    // @0x1e1cb4..@0x1e1cbb — install primary DummyMaterialLayer vptr at +0x00.
    dst.vptr_at_0x00 = "__ZTV18DummyMaterialLayer+0x18";
    // @0x1e1cbe..@0x1e1cc5 — install secondary (combined-vtable PCShared_base slice) at +0x38.
    dst.vptr_at_0x38 = "__ZTV18DummyMaterialLayer+0x86";
    // @0x1e1cc9..@0x1e1ccc — null out the vector's begin+end.
    dst.begin_at_0x20 = [];
    dst.end_at_0x28_length = 0;
    // @0x1e1cd0 — null out the vector's capacity_end.
    dst.capacity_end_at_0x30_length = 0;
    // @0x1e1cd8 — zero the opaque flag at +0x19.
    dst.flag_at_0x19 = 0;
  }

  /**
   * `DummyMaterialLayer::computeColor(LayerContext const&, SurfaceProperties&)`  @Ozone 0x1e1d00.
   *
   * Body (Ozone x86_64):
   *   0x1e1d00  pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14 / pushq %r12 / pushq %rbx
   *   0x1e1d0b  movq  0x20(%rdi), %r15                 ; r15 = this[+0x20] = &begin
   *   0x1e1d0f  movq  0x28(%rdi), %r12                 ; r12 = this[+0x28] = end sentinel
   *   0x1e1d13  cmpq  %r12, %r15
   *   0x1e1d16  je    0x1e1d4c                          ; if empty, jump to epilogue
   *   0x1e1d18  movq  %rdx, %rbx                        ; save `SurfaceProperties&` arg
   *   0x1e1d1b  movq  %rsi, %r14                        ; save `LayerContext const&` arg
   *   0x1e1d1e  jmp   0x1e1d35                          ; enter the null-check pre-body
   *
   *   ; --- vtable call (fall-through re-entry) ---
   *   0x1e1d20  movq  (%rdi), %rax                      ; rax = operator's vptr
   *   0x1e1d23  movq  %r14, %rsi                        ; rsi = ctx
   *   0x1e1d26  movq  %rbx, %rdx                        ; rdx = out
   *   0x1e1d29  callq *0x10(%rax)                       ; call op->vtable[+0x10] (op, ctx, out)
   *   0x1e1d2c  addq  $0x10, %r15                       ; step to next PCPtr slot (stride 16)
   *   0x1e1d30  cmpq  %r12, %r15
   *   0x1e1d33  je    0x1e1d4c                          ; done?
   *
   *   ; --- null-check pre-body ---
   *   0x1e1d35  movq  (%r15), %rdi                      ; rdi = op = *r15   (PCPtr's +0x00: T*)
   *   0x1e1d38  testq %rdi, %rdi
   *   0x1e1d3b  jne   0x1e1d20                          ; if op != null, go straight to vtable call
   *   0x1e1d3d  movl  $0x1, %edi                        ; arg=1 to the throw helper
   *   0x1e1d42  callq __Z28throw_PCNullPointerExceptionb ; throw PCNullPointerException(true)
   *   0x1e1d47  movq  (%r15), %rdi                      ; (unreachable — throw never returns) reload op
   *   0x1e1d4a  jmp   0x1e1d20                          ; and continue via vtable call
   *
   *   0x1e1d4c  popq %rbx / popq %r12 / popq %r14 / popq %r15 / popq %rbp / retq
   *
   * Faithful transcription: iterate [begin,end), null-check each PCPtr's raw pointer, dispatch
   * through the operator's own vtable slot +0x10.
   */
  computeColor(ctx: LayerContext, out: SurfaceProperties): void {
    // @0x1e1d0b/@0x1e1d0f — snapshot begin/end sentinels.
    const begin = this.begin_at_0x20;
    const end = this.end_at_0x28_length;
    // @0x1e1d13..@0x1e1d16 — empty-vector short-circuit.
    if (0 === end) return;
    // @0x1e1d1e..@0x1e1d33 — iteration; index `i` corresponds to r15 advancing by 16 bytes/element.
    for (let i = 0; i < end; i++) {
      // @0x1e1d35..@0x1e1d38 — load op = *(r15+0x00) (raw pointer half of the PCPtr).
      let op: LiMaterialLayerOperator | null = begin[i].ptr_at_0x00;
      // @0x1e1d3b — non-null: go straight to vtable call. @0x1e1d3d..@0x1e1d42 — null: throw
      // (jne branch is NOT taken; the throw helper is called with arg=1).
      if (op === null) {
        throw_PCNullPointerException_stub(true); // never returns — but faithful to the code shape
        // @0x1e1d47..@0x1e1d4a — dead code path in the binary (unreachable after the throw); the
        // faithful mirror keeps the reload op = begin[i].ptr_at_0x00 to preserve the addr witness.
        op = begin[i].ptr_at_0x00;
      }
      // @0x1e1d20..@0x1e1d29 — vtable dispatch through op's own vptr slot +0x10 with (ctx, out).
      operator_vslot_0x10_call(op as LiMaterialLayerOperator, ctx, out);
    }
    // @0x1e1d4c — epilogue.
  }

  /**
   * `DummyMaterialLayer::executeOperators(LayerContext const&, SurfaceProperties&)`
   * @Ozone 0x1e1d60.
   *
   * Body is BYTE-FOR-BYTE the same shape as `computeColor` (@0x1e1d00) at all offsets
   * (0x1e1d6b..0x1e1db4). It is a distinct symbol emitted at a distinct address — NOT ICF
   * folded with computeColor (their addresses differ by 0x60, i.e. the two function bodies
   * are laid out back-to-back in .text without merging). Same iteration, same +0x10 vtable
   * dispatch, same null-check-with-throw, same epilogue.
   */
  executeOperators(ctx: LayerContext, out: SurfaceProperties): void {
    // @0x1e1d6b/@0x1e1d6f — snapshot begin/end sentinels.
    const begin = this.begin_at_0x20;
    const end = this.end_at_0x28_length;
    // @0x1e1d73..@0x1e1d76 — empty-vector short-circuit.
    if (0 === end) return;
    // @0x1e1d7e..@0x1e1d93 — iteration.
    for (let i = 0; i < end; i++) {
      // @0x1e1d95..@0x1e1d98 — load op.
      let op: LiMaterialLayerOperator | null = begin[i].ptr_at_0x00;
      // @0x1e1d9b — non-null branch. @0x1e1d9d..@0x1e1da2 — null: throw.
      if (op === null) {
        throw_PCNullPointerException_stub(true);
        // @0x1e1da7..@0x1e1daa — unreachable reload, kept for witness.
        op = begin[i].ptr_at_0x00;
      }
      // @0x1e1d80..@0x1e1d89 — vtable dispatch through op's +0x10 slot with (ctx, out).
      operator_vslot_0x10_call(op as LiMaterialLayerOperator, ctx, out);
    }
    // @0x1e1dac — epilogue.
  }

  /**
   * `DummyMaterialLayer::addOperator(PCPtr<LiMaterialLayerOperator> const&)`  @Ozone 0x1e1dc0.
   *
   * Body (Ozone x86_64):
   *   0x1e1dc0  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   0x1e1dc7  movq  %rdi, %rbx                        ; rbx = this
   *   0x1e1dca  movq  0x28(%rdi), %r14                  ; r14 = this[+0x28] = end
   *   0x1e1dce  cmpq  0x30(%rdi), %r14
   *   0x1e1dd2  jae   0x1e1df1                          ; end >= capacity_end -> slow path
   *
   *   ; --- fast path: placement-new PCPtr into the vector's tail slot ---
   *   0x1e1dd4  movq  (%rsi), %rax                      ; rax = src.ptr_at_0x00 (raw T*)
   *   0x1e1dd7  movq  %rax, (%r14)                      ; dst.ptr_at_0x00 = rax
   *   0x1e1dda  leaq  0x8(%r14), %rdi                   ; rdi = &dst.count_at_0x08
   *   0x1e1dde  addq  $0x8, %rsi                        ; rsi = &src.count_at_0x08
   *   0x1e1de2  callq __ZN13PCSharedCountC1ERKS_        ; PCSharedCount::PCSharedCount(count const&)
   *   0x1e1de7  addq  $0x10, %r14                       ; end += 16 (advance one PCPtr slot)
   *   0x1e1deb  movq  %r14, 0x28(%rbx)                  ; this[+0x28] = end
   *   0x1e1def  jmp   0x1e1dfd                          ; skip slow path
   *
   *   ; --- slow path: emplace_back reallocates ---
   *   0x1e1df1  leaq  0x20(%rbx), %rdi                  ; rdi = &this[+0x20]  (address of `&begin`)
   *   0x1e1df5  callq __ZNSt3__16vector<PCPtr<...>>__emplace_back_slow_pathI...
   *   0x1e1dfa  movq  %rax, %r14                        ; r14 = returned new-end pointer
   *
   *   0x1e1dfd  movq  %r14, 0x28(%rbx)                  ; this[+0x28] = end
   *   0x1e1e01  popq %rbx / popq %r14 / popq %rbp / retq
   *   [ landing pad @0x1e1e06: save new end, resume unwind through __Unwind_Resume ]
   */
  addOperator(src: PCPtrOfLiMaterialLayerOperator): void {
    // @0x1e1dca — snapshot end sentinel.
    let end = this.end_at_0x28_length;
    // @0x1e1dce..@0x1e1dd2 — end vs capacity_end. In TS JS-arrays auto-grow, so we always
    // logically take the fast path — but we transcribe the branch to preserve the shape.
    if (end < this.capacity_end_at_0x30_length) {
      // fast path @0x1e1dd4..@0x1e1def — copy the raw pointer half, copy-ctor the count half.
      const dstSlot: PCPtrOfLiMaterialLayerOperator = {
        ptr_at_0x00: src.ptr_at_0x00, // @0x1e1dd4..@0x1e1dd7
        count_at_0x08: { p_at_0x00: null }, // placeholder — copy-ctor stub fills this below
      };
      PCSharedCount_copy_ctor_stub(dstSlot.count_at_0x08, src.count_at_0x08); // @0x1e1de2
      this.begin_at_0x20[end] = dstSlot;
      end = end + 1; // @0x1e1de7 (in slots, not bytes — this preserves the 16-byte stride shape)
      this.end_at_0x28_length = end; // @0x1e1deb
      // @0x1e1def jmp epilogue
    } else {
      // slow path @0x1e1df1..@0x1e1dfa
      const newEnd = vector_emplace_back_slow_path_stub(this, src);
      // @0x1e1dfa — the returned pointer becomes the new end. In the shape-preserving model
      // we increment `end` by one — the actual JS array append is done inside the stub (which
      // currently throws, so this is unreachable in the port, matching decode-don't-guess).
      this.begin_at_0x20[end] = newEnd;
      end = end + 1;
      this.end_at_0x28_length = end; // @0x1e1dfd
    }
  }

  /**
   * `DummyMaterialLayer::~DummyMaterialLayer()` [D0 — deleting]  @Ozone 0x1e3760.
   *
   * The D1 variant @0x1e36c0 has an ICF/near-identical body without the trailing `operator delete`
   * tail-jump; the disassembly of D0 (raw-port/re/disasm/DummyMaterialLayer.~DummyMaterialLayer.s)
   * is what we transcribe.
   *
   * Body (Ozone x86_64):
   *   0x1e3760  pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14 / pushq %rbx / pushq %rax
   *   0x1e376a  movq  %rdi, %rbx                        ; rbx = this
   *   0x1e376d  leaq  0x65fd74(%rip), %rax              ; = 0x8434e8 (vtable+0x18) — reinstall
   *   0x1e3774  movq  %rax, (%rdi)                      ; primary vptr @+0x00 (Itanium "reinstall
   *                                                       most-derived vptr before per-slot teardown")
   *   0x1e3777  leaq  0x65fdd2(%rip), %rax              ; = 0x843556 (vtable+0x86) — secondary
   *   0x1e377e  movq  %rax, 0x38(%rdi)                  ; sub-object vptr @+0x38 reinstall.
   *
   *   ; --- vector teardown: destroy each element (walk BACKWARDS one PCPtr slot at a time) ---
   *   0x1e3782  movq  0x20(%rdi), %r14                  ; r14 = this[+0x20] = begin
   *   0x1e3786  testq %r14, %r14
   *   0x1e3789  je    0x1e37c5                          ; if begin==null, skip
   *   0x1e378b  movq  0x28(%rbx), %rdi                  ; rdi = this[+0x28] = end
   *   0x1e378f  movq  %r14, %rax                        ; rax = begin
   *   0x1e3792  cmpq  %rdi, %r14
   *   0x1e3795  je    0x1e37b9                          ; if end==begin (empty), skip teardown loop
   *   0x1e3797  nopw  (%rax,%rax)
   *
   *   0x1e37a0  leaq  -0x10(%rdi), %r15                 ; r15 = &prev_slot (step BACK 16 bytes)
   *   0x1e37a4  addq  $-0x8, %rdi                       ; rdi = &prev_slot.count_at_0x08 = end - 8
   *   0x1e37a8  callq __ZN13PCSharedCountD1Ev           ; destroy the PCSharedCount at end-8
   *   0x1e37ad  movq  %r15, %rdi                        ; rdi = prev_slot (roll `end` back one slot)
   *   0x1e37b0  cmpq  %r14, %r15
   *   0x1e37b3  jne   0x1e37a0                          ; loop until we hit begin
   *   0x1e37b5  movq  0x20(%rbx), %rax                  ; rax = begin (for the free below)
   *
   *   0x1e37b9  movq  %r14, 0x28(%rbx)                  ; end = begin (empty vector state)
   *   0x1e37bd  movq  %rax, %rdi                        ; rdi = begin (to free)
   *   0x1e37c0  callq __ZdlPv                           ; operator delete(begin)  — free storage
   *
   *   0x1e37c5  leaq  __ZTV13PCShared_base(%rip), %rax
   *   0x1e37cc  addq  $0x10, %rax
   *   0x1e37d0  movq  %rax, 0x38(%rbx)                  ; TEMP-reinstall PCShared_base standalone
   *                                                       vptr for the base-class teardown chain.
   *   0x1e37d4  movq  0x40(%rbx), %rdi                  ; rdi = weak-count backref (nullable)
   *   0x1e37d8  testq %rdi, %rdi
   *   0x1e37db  je    0x1e37e2                          ; if null, skip weak_release
   *   0x1e37dd  callq __ZN18PC_Sp_counted_base12weak_releaseEv
   *   0x1e37e2  movq  %rbx, %rdi                        ; rdi = this (to free)
   *   0x1e37e5  addq  $0x8, %rsp / popq %rbx / popq %r14 / popq %r15 / popq %rbp
   *   0x1e37ef  jmp   __ZdlPv                           ; TAIL-JMP operator delete(this)  — free `this`
   *   [ landing pad @0x1e37f4: `movq %rax,%rdi ; callq ___clang_call_terminate` — terminate on
   *     nested exception during teardown, standard Itanium ABI ]
   */
  destructor_D0(): void {
    // @0x1e376d..@0x1e3774 — reinstall primary DummyMaterialLayer vptr @+0x00.
    this.vptr_at_0x00 = "__ZTV18DummyMaterialLayer+0x18";
    // @0x1e3777..@0x1e377e — reinstall secondary DummyMaterialLayer vptr @+0x38.
    this.vptr_at_0x38 = "__ZTV18DummyMaterialLayer+0x86";

    // @0x1e3782..@0x1e3789 — nullable-begin skip.
    const begin = this.begin_at_0x20;
    if (begin.length > 0 || this.end_at_0x28_length > 0) {
      // @0x1e378b..@0x1e3795 — snapshot end; empty-check.
      let end = this.end_at_0x28_length;
      // @0x1e37a0..@0x1e37b3 — walk backwards, destroying each PCPtr's count half at end-8.
      while (end !== 0) {
        end = end - 1; // r15 = end - 0x10 (1 slot back)
        // rdi = end - 0x8 = &slot[end].count_at_0x08 — destroy the PCSharedCount.
        PCSharedCount_D1_stub(begin[end].count_at_0x08); // @0x1e37a8
        // NB: the raw pointer half at +0x00 is a plain T* with no dtor — vector destructor
        // only destroys the PCSharedCount half of each PCPtr, exactly what @0x1e37a4 = -8 selects.
      }
      // @0x1e37b9 — end = begin.
      this.end_at_0x28_length = 0;
      // @0x1e37c0 — free the vector's heap storage (calls __ZdlPv @Ozone 0x6dfc36).
      operator_delete_stub(begin);
    }
    // @0x1e37c5..@0x1e37d0 — TEMP-reinstall standalone PCShared_base vptr for base teardown chain.
    this.vptr_at_0x38 = "__ZTV13PCShared_base+0x10";
    // @0x1e37d4..@0x1e37dd — nullable weak-count backref release.
    const p = this.spCountedBaseBackref_at_0x40;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0x1e37ef — tail-jmp operator delete(this).
    operator_delete_stub(this);
  }

  /**
   * `DummyMaterialLayer::~DummyMaterialLayer()` [D1 — complete-object]  @Ozone 0x1e36c0.
   *
   * Not separately transcribed — the D0 body above @0x1e3760 contains the complete-object teardown
   * (up through the weak-count release at @0x1e37dd) followed by the deleting-dtor tail-jmp to
   * operator delete(this). The D1 variant @0x1e36c0 performs everything up through the weak-count
   * release WITHOUT the trailing operator delete. Modelled here as D0-minus-the-final-delete;
   * this matches the standard Itanium ABI relationship between D0 and D1.
   *
   * (When D1's disassembly is separately extracted and confirmed to have any additional or
   * differing body, this method must be updated with a per-line citation; the loud honest thing
   * is to say we have not yet extracted the D1-only body.) */
  destructor_D1(): void {
    throw new Error(
      "DummyMaterialLayer::~DummyMaterialLayer() [D1] @Ozone 0x1e36c0 not yet transcribed " +
        "(D0 body @0x1e3760 is the one that was disassembled; D1's own body has not been " +
        "extracted — the addr witness is preserved so a future worker knows exactly where to look)"
    );
  }

  /**
   * `__ZTv0_n24_N18DummyMaterialLayerD1Ev` — virtual thunk to D1  @Ozone 0x1e3800.
   * Standard Itanium ABI thunk emitted for the secondary base (PCShared_base at +0x38)
   * vtable slot: adjust this back by 0x38 (n24_ encodes -0x38 offset in the byte-encoded
   * thunk index), then dispatch to D1. Body not yet transcribed. */
  thunk_D1(): void {
    throw new Error(
      "__ZTv0_n24_N18DummyMaterialLayerD1Ev @Ozone 0x1e3800 not yet transcribed"
    );
  }

  /**
   * `__ZTv0_n24_N18DummyMaterialLayerD0Ev` — virtual thunk to D0  @Ozone 0x1e38b0.
   * Same shape as thunk_D1 above but dispatches to D0. Body not yet transcribed. */
  thunk_D0(): void {
    throw new Error(
      "__ZTv0_n24_N18DummyMaterialLayerD0Ev @Ozone 0x1e38b0 not yet transcribed"
    );
  }
}
