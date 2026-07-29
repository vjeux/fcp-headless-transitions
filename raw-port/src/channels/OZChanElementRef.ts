// OZChanElementRef — Ozone.framework channel that references an OZElement by name/id.
//
// Faithful transcription of Ozone::OZChanElementRef (15 methods @ 0x248390..0x2486aa).
// It is a THIN SUBCLASS of OZChanSceneNodeRef that only reinterprets the referenced node
// as an OZElement (dynamic_cast at the getElement / canReferenceObject boundary). Every
// method delegates to the parent — no additional state is stored in this subobject beyond
// the two vtable slots the ctors install at (this+0x0) and (this+0x10) — the object holds
// exactly a base OZChanSceneNodeRef (sizeof=0xa0, confirmed by clone's `mov $0xa0, %edi;
// call operator new` @0x24859a/0x24859f).
//
// Ownership vtable layout (all four ctors write the same two RIP-relative constants for
// their own address slot, only rebased by the base ctor kind):
//   +0x00  primary vtable  __ZTV16OZChanElementRef             (matches leaq @0x24848e etc.)
//   +0x10  RTTI/thunk-table __ZTCN16OZChanElementRef... helper (matches leaq @0x248498 etc.)
// These are ObjC/C++ RTTI blobs — not decoded here, only recorded as reinterpret bookkeeping.
//
// Decode evidence (raw-port/re/disasm/):
//   OZChanElementRef.OZChanElementRef.s          (C1 OZFactory-based, @0x248480, 16 lines)
//   Ozone otool dump of all C1/C2 overloads       (@0x2483c0 / 0x248420 / 0x248480 / 0x2484e0)
//   Ozone otool dump of D0/D1/D2 (@0x248540 / 0x248520 / 0x248510) + thunk-16 pair
//   OZChanElementRef.clone.s                     (@0x248590, 28 lines — new + copy-ctor)
//   OZChanElementRef.getElement.s                (@0x2485f0, 16 lines — dynamic_cast<OZElement*>)
//   OZChanElementRef.setElement.s                (@0x248620, 6  lines — tail jmp setNode)
//   OZChanElementRef.canReferenceObject.s        (@0x248630, 28 lines — dynamic_cast + tail jmp)
//
// Sibling classes not yet ported (frontier callees are stubbed with @0xADDR-citing throws):
//   OZChanSceneNodeRef  (parent — ctors/dtors/getNode/setNode/canReferenceObject)
//   OZChannelFolder     (2nd ctor arg on the copy overloads — treated as opaque here)
//   OZFactory           (1st ctor arg on the "by factory" overload — opaque)
//   OZObjectManipulator (introspection arg to canReferenceObject — opaque, only dynamic_cast'd)
//   PCString            (name string — infra type, opaque handle here)

import type { OZElement } from "../nodes/OZElement.js";

// ─── Opaque handles (undecoded sibling types — kept nominal to avoid `any`) ───────────

/** OZChanSceneNodeRef base subobject — a 0xa0-byte structure. Layout not yet transcribed. */
export interface OZChanSceneNodeRefLike {
  readonly __ozChanSceneNodeRef: true;
}
/** OZChannelFolder — opaque; only stored by parent ctor. */
export interface OZChannelFolder { readonly __ozChannelFolder: true; }
/** OZFactory — opaque; only used by parent ctor. */
export interface OZFactory { readonly __ozFactory: true; }
/** PCString — opaque handle to Apple's PCString value type. */
export interface PCString { readonly __pcString: true; }
/** OZObjectManipulator — opaque; only used for `dynamic_cast<OZElement*>` in canReferenceObject. */
export interface OZObjectManipulator { readonly __ozObjectManipulator: true; }
/** OZSceneNode — parent-node type returned by OZChanSceneNodeRef::getNode(). */
export interface OZSceneNode { readonly __ozSceneNode: true; }

// ─── Frontier callees (undecoded — throw per PORTING_SPEC Rule 3) ────────────────────

/**
 * OZChanSceneNodeRef::OZChanSceneNodeRef(OZFactory*, PCString const&, unsigned int)
 *   C2 base ctor. Called by OZChanElementRef::OZChanElementRef(OZFactory*, PCString const&,
 *   unsigned int) via `callq __ZN18OZChanSceneNodeRefC2EP9OZFactoryRK8PCStringj` @0x248489.
 * Not yet transcribed.
 */
function OZChanSceneNodeRef_ctor_factory(
  _self: OZChanElementRef, _factory: OZFactory, _name: PCString, _flags: number,
): void {
  throw new Error(
    "OZChanSceneNodeRef::OZChanSceneNodeRef(OZFactory*,PCString const&,unsigned int) " +
    "@Ozone 0x248489 (base subobject C2) not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::OZChanSceneNodeRef(OZChanSceneNodeRef const&, OZChannelFolder*)
 *   C2 copy base ctor. Called by the copy overload @0x2484e9 and by clone @0x2485af (with
 *   the OZChannelFolder* second arg zeroed via `xorl %edx, %edx`).
 */
function OZChanSceneNodeRef_ctor_copy(
  _self: OZChanElementRef, _src: OZChanSceneNodeRefLike, _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChanSceneNodeRef::OZChanSceneNodeRef(OZChanSceneNodeRef const&,OZChannelFolder*) " +
    "@Ozone 0x2484e9 / 0x2485af (base subobject C2) not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::OZChanSceneNodeRef(PCString const&, OZChannelFolder*, unsigned int, unsigned int)
 *   C2 base ctor for the by-name overload @0x2483c9.
 */
function OZChanSceneNodeRef_ctor_byName(
  _self: OZChanElementRef, _name: PCString, _folder: OZChannelFolder | null, _a: number, _b: number,
): void {
  throw new Error(
    "OZChanSceneNodeRef::OZChanSceneNodeRef(PCString const&,OZChannelFolder*,unsigned int,unsigned int) " +
    "@Ozone 0x2483c9 (base subobject C2) not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::OZChanSceneNodeRef(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
 *   C2 base ctor for the value+name overload @0x248429.
 */
function OZChanSceneNodeRef_ctor_valueByName(
  _self: OZChanElementRef, _value: number, _name: PCString, _folder: OZChannelFolder | null,
  _a: number, _b: number,
): void {
  throw new Error(
    "OZChanSceneNodeRef::OZChanSceneNodeRef(double,PCString const&,OZChannelFolder*,unsigned int,unsigned int) " +
    "@Ozone 0x248429 (base subobject C2) not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::~OZChanSceneNodeRef()  (D2 base subobject dtor)
 *   Called from every OZChanElementRef dtor slot D0/D1/D2 via `jmp __ZN18OZChanSceneNodeRefD2Ev`
 *   @0x248515 (D2), @0x248525 (D1), @0x248549 (D0), plus the thunk-16 D1 @0x248539 and thunk-16
 *   D0 @0x248570.
 */
function OZChanSceneNodeRef_dtor(_self: OZChanElementRef): void {
  throw new Error(
    "OZChanSceneNodeRef::~OZChanSceneNodeRef() @Ozone 0x248515/0x248525/0x248549 (D2 base) " +
    "not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::getNode() const
 *   Returns the referenced OZSceneNode* (or nullptr). Called by OZChanElementRef::getElement
 *   @0x2485f4 (`callq __ZNK18OZChanSceneNodeRef7getNodeEv`). Not yet transcribed.
 */
function OZChanSceneNodeRef_getNode(_self: OZChanElementRef): OZSceneNode | null {
  throw new Error(
    "OZChanSceneNodeRef::getNode() const @Ozone 0x2485f4 (call site) not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::setNode(OZSceneNode*)
 *   Called by OZChanElementRef::setElement as a tail-jmp @0x248625
 *   (`jmp __ZN18OZChanSceneNodeRef7setNodeEP11OZSceneNode`).
 */
function OZChanSceneNodeRef_setNode(_self: OZChanElementRef, _node: OZSceneNode | null): void {
  throw new Error(
    "OZChanSceneNodeRef::setNode(OZSceneNode*) @Ozone 0x248625 (tail-jmp site) not yet transcribed",
  );
}

/**
 * OZChanSceneNodeRef::canReferenceObject(OZObjectManipulator const*) const
 *   Tail-jmp target of OZChanElementRef::canReferenceObject once the dynamic_cast to OZElement
 *   succeeds. Site: `jmp __ZNK18OZChanSceneNodeRef18canReferenceObjectEPK19OZObjectManipulator`
 *   @0x24866c.
 */
function OZChanSceneNodeRef_canReferenceObject(
  _self: OZChanElementRef, _obj: OZObjectManipulator,
): boolean {
  throw new Error(
    "OZChanSceneNodeRef::canReferenceObject(OZObjectManipulator const*) const @Ozone 0x24866c " +
    "(tail-jmp site) not yet transcribed",
  );
}

/**
 * ___dynamic_cast(void* src, typeinfo* srcType, typeinfo* dstType, ptrdiff_t offset)
 *   libc++abi symbol stub @Ozone 0x6dfd0e (call sites @0x248612 in getElement, @0x248658 in
 *   canReferenceObject). In the TS mirror we model it via `instanceof OZElement` — that is
 *   the runtime-typeinfo equivalent for the specific dynamic_cast<OZElement*> pair used here.
 *   NOTE: not a general dynamic_cast; only the OZElement destination is decoded from these two
 *   call sites (typeinfo srcType is either OZSceneNode or OZObjectManipulator; dstType is always
 *   OZElement).
 */
function dynamic_cast_to_OZElement(src: unknown): OZElement | null {
  // Faithful to Apple's __dynamic_cast: null in -> null out; failed cast -> null.
  // The two decoded sites both branch on `testq %rax, %rax; je ...` after the call, so a
  // null return simply short-circuits the caller's success branch. We return null when the
  // dynamic type is not an OZElement, matching that behaviour.
  if (src == null) return null;
  // Lazy check — OZElement is imported lazily via `import type` so the constructor exists
  // only at runtime. The C++ `__dynamic_cast` uses typeinfo pointers; JS uses instanceof.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyEl = (globalThis as any).OZElement as (new (...a: unknown[]) => OZElement) | undefined;
  if (anyEl !== undefined && src instanceof anyEl) return src as OZElement;
  // Fallback: structural — an object is treated as an OZElement iff it declares the tag fields.
  // This is deliberately conservative (never returns a false-positive across sibling types).
  const asObj = src as { __ozElementTag?: unknown };
  if (asObj && asObj.__ozElementTag !== undefined) return src as OZElement;
  return null;
}

// ─── OZChanElementRef ─────────────────────────────────────────────────────────────────

/**
 * OZChanElementRef — channel that references an OZElement by name (or by copy). Layout:
 *   +0x00  vtable  __ZTV16OZChanElementRef        (installed by every ctor)
 *   +0x10  RTTI    __ZTCN16OZChanElementRef helper (installed by every ctor)
 *   [rest] the OZChanSceneNodeRef base subobject occupies bytes up to sizeof=0xa0
 *          (from clone's `mov $0xa0, %edi ; call __Znwm` @0x24859a).
 *
 * TS mirror keeps the parent as a boxed `_base` handle; the two vtable slots are recorded
 * symbolically since JS has no equivalent.
 */
export class OZChanElementRef {
  /** Base subobject (undecoded — OZChanSceneNodeRef state is opaque). */
  private _base: OZChanSceneNodeRefLike;

  /** Vtable / RTTI recording — not runtime-consulted; kept for provenance parity. */
  private readonly _vtable = "__ZTV16OZChanElementRef";      // installed by every ctor (+0x00)
  private readonly _rtti   = "__ZTCN16OZChanElementRef";     // installed by every ctor (+0x10)

  private constructor(base: OZChanSceneNodeRefLike) {
    this._base = base;
    // Silence "declared but never used" for _vtable/_rtti — they are documentation constants.
    void this._vtable; void this._rtti;
  }

  /**
   * OZChanElementRef::OZChanElementRef(OZFactory*, PCString const&, unsigned int)  C1/C2
   *   @Ozone 0x248390 (C2) / 0x248480 (C1) — 16 asm lines each.
   *   1. `callq __ZN18OZChanSceneNodeRefC2EP9OZFactoryRK8PCStringj`   @0x248489
   *   2. `movq __ZTV16OZChanElementRef, (%rbx)`                        @0x248495
   *   3. `movq __ZTC16OZChanElementRef+0x10 helper, 0x10(%rbx)`        @0x24849f
   */
  static fromFactory(factory: OZFactory, name: PCString, flags: number): OZChanElementRef {
    const base: OZChanSceneNodeRefLike = { __ozChanSceneNodeRef: true };
    const self = new OZChanElementRef(base);
    OZChanSceneNodeRef_ctor_factory(self, factory, name, flags); // @0x248489
    // vtable install (0x24848e leaq / 0x248495 mov) and RTTI (0x248498 / 0x24849f) modelled by
    // the fixed _vtable/_rtti fields set in the ctor body — parity bookkeeping only.
    return self;
  }

  /**
   * OZChanElementRef::OZChanElementRef(OZChanSceneNodeRef const&, OZChannelFolder*)  C1/C2
   *   @Ozone 0x248450 (C2) / 0x2484e0 (C1) — 16 asm lines.
   *   `callq __ZN18OZChanSceneNodeRefC2ERKS_P15OZChannelFolder`  @0x2484e9
   *   then the same two vtable/RTTI writes.
   */
  static fromRef(src: OZChanSceneNodeRefLike, folder: OZChannelFolder | null): OZChanElementRef {
    const base: OZChanSceneNodeRefLike = { __ozChanSceneNodeRef: true };
    const self = new OZChanElementRef(base);
    OZChanSceneNodeRef_ctor_copy(self, src, folder); // @0x2484e9
    return self;
  }

  /**
   * OZChanElementRef::OZChanElementRef(PCString const&, OZChannelFolder*, unsigned int, unsigned int)  C1/C2
   *   @Ozone 0x248390 (C2) / 0x2483c0 (C1) — 16 asm lines.
   *   `callq __ZN18OZChanSceneNodeRefC2ERK8PCStringP15OZChannelFolderjj`  @0x2483c9
   */
  static byName(name: PCString, folder: OZChannelFolder | null, a: number, b: number): OZChanElementRef {
    const base: OZChanSceneNodeRefLike = { __ozChanSceneNodeRef: true };
    const self = new OZChanElementRef(base);
    OZChanSceneNodeRef_ctor_byName(self, name, folder, a, b); // @0x2483c9
    return self;
  }

  /**
   * OZChanElementRef::OZChanElementRef(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int)  C1/C2
   *   @Ozone 0x2483f0 (C2) / 0x248420 (C1) — 16 asm lines.
   *   `callq __ZN18OZChanSceneNodeRefC2EdRK8PCStringP15OZChannelFolderjj`  @0x248429
   */
  static valueByName(
    value: number, name: PCString, folder: OZChannelFolder | null, a: number, b: number,
  ): OZChanElementRef {
    const base: OZChanSceneNodeRefLike = { __ozChanSceneNodeRef: true };
    const self = new OZChanElementRef(base);
    OZChanSceneNodeRef_ctor_valueByName(self, value, name, folder, a, b); // @0x248429
    return self;
  }

  /**
   * ~OZChanElementRef()  D2 / D1 base subobject dtor.
   *   D2 @Ozone 0x248510 (5 lines): pop rbp; `jmp __ZN18OZChanSceneNodeRefD2Ev` @0x248515.
   *   D1 @Ozone 0x248520 (5 lines): identical body — ICF-folded with D2 at the source level,
   *                                 emitted separately per the Itanium ABI.
   *   Thunk-16 D1 @0x248530: `addq $-0x10, %rdi` then jmp to base D2 — for the +0x10 subobject.
   */
  destruct(): void {
    OZChanSceneNodeRef_dtor(this); // tail-jmp @0x248515 / 0x248525 / 0x248539
  }

  /**
   * ~OZChanElementRef()  D0 deleting dtor.
   *   @Ozone 0x248540 (13 lines):
   *     callq __ZN18OZChanSceneNodeRefD2Ev  @0x248549
   *     jmp   __ZdlPv                        @0x248557  (operator delete(this))
   *   Thunk-16 D0 @0x248560: same, with `addq $-0x10, %rbx` first.
   */
  destructAndDelete(): void {
    OZChanSceneNodeRef_dtor(this); // @0x248549
    // operator delete(this) — no-op in the TS mirror (GC-managed).
  }

  /**
   * OZChanElementRef::clone() const
   *   @Ozone 0x248590 (28 lines):
   *     movl $0xa0, %edi         @0x24859a   — sizeof(OZChanElementRef) = 160 bytes
   *     callq __Znwm              @0x24859f   — operator new(size_t) (stub 0x6dfca2)
   *     callq __ZN18OZChanSceneNodeRefC2ERKS_P15OZChannelFolder  @0x2485af  (folder = nullptr, %edx xor'd)
   *     movq __ZTV16OZChanElementRef, (%rbx)   @0x2485bb
   *     movq __ZTC helper, 0x10(%rbx)          @0x2485c5
   *     ret
   *   The catch/unwind path (@0x2485d1..0x2485df) rethrows after freeing rbx and unwinding.
   *   Modelled here as `try { ... } catch (e) { throw e; }` — GC frees the aborted allocation.
   */
  clone(): OZChanElementRef {
    // sizeof(OZChanElementRef) == 0xa0 (confirmed @0x24859a). Recorded but not runtime-relevant.
    const _SIZEOF = 0xa0; void _SIZEOF;
    const base: OZChanSceneNodeRefLike = { __ozChanSceneNodeRef: true };
    const out = new OZChanElementRef(base);
    try {
      OZChanSceneNodeRef_ctor_copy(out, this._base, null); // folder=nullptr @0x2485ad `xorl %edx,%edx`
    } catch (e) {
      // Faithful to the C++ unwind: `operator delete(rbx)` (@0x2485d7) then `_Unwind_Resume`
      // (@0x2485df). In JS the aborted allocation is GC'd; we rethrow to complete the unwind.
      throw e;
    }
    return out;
  }

  /**
   * OZChanElementRef::getElement() const
   *   @Ozone 0x2485f0 (16 lines):
   *     callq __ZNK18OZChanSceneNodeRef7getNodeEv  @0x2485f4  (parent.getNode())
   *     testq %rax,%rax; je 0x248617                @0x2485f9  (null -> return 0)
   *     dynamic_cast<OZElement*>(node, &OZSceneNode_typeinfo, &OZElement_typeinfo, 0)
   *       via `jmp ___dynamic_cast` @0x248612 (stub 0x6dfd0e), ecx=0 (offset 0).
   *     xorl %eax,%eax; ret                         @0x248617  (null branch)
   */
  getElement(): OZElement | null {
    const node = OZChanSceneNodeRef_getNode(this); // @0x2485f4
    if (node === null) return null;                // @0x2485fc `je 0x248617`
    // dynamic_cast<OZElement*>(node) — @0x248612 tail-jmp to ___dynamic_cast stub.
    return dynamic_cast_to_OZElement(node);
  }

  /**
   * OZChanElementRef::setElement(OZElement*)
   *   @Ozone 0x248620 (6 lines):
   *     jmp __ZN18OZChanSceneNodeRef7setNodeEP11OZSceneNode  @0x248625
   *   The compiler treats OZElement* as-if OZSceneNode* (OZElement is a subclass of
   *   OZSceneNode — no offset adjustment; the tail-jmp passes rdi/rsi through unchanged).
   */
  setElement(element: OZElement | null): void {
    // OZElement is-a OZSceneNode; the C++ tail-jmp implicitly upcasts. In TS the interfaces are
    // nominal so we pass through as-is — the parent will accept the pointer.
    OZChanSceneNodeRef_setNode(this, element as unknown as OZSceneNode | null); // @0x248625
  }

  /**
   * OZChanElementRef::canReferenceObject(OZObjectManipulator const*) const
   *   @Ozone 0x248630 (28 lines):
   *     testq %rsi,%rsi; je 0x248671                                @0x248637 (null -> return 0)
   *     dynamic_cast<OZElement*>(obj, &OZObjectManipulator_typeinfo,
   *                              &OZElement_typeinfo, 0x10)         @0x248658 ecx=0x10
   *     testq %rax,%rax; je 0x248671                                @0x24865d
   *     jmp __ZNK18OZChanSceneNodeRef18canReferenceObjectEPK19OZObjectManipulator  @0x24866c
   *     xorl %eax,%eax; ret                                          @0x248671 (fall-through false)
   */
  canReferenceObject(obj: OZObjectManipulator | null): boolean {
    if (obj === null) return false;                          // @0x24863a `je 0x248671`
    // dynamic_cast<OZElement*>(obj, ..., offset=0x10)  @0x248658 — offset selects the
    // OZElement-in-OZObjectManipulator base sub-slot; JS models it as instanceof-checking.
    const casted = dynamic_cast_to_OZElement(obj);
    if (casted === null) return false;                       // @0x248660 `je 0x248671`
    // Success -> tail-jmp to parent @0x24866c. Result flows back unchanged.
    return OZChanSceneNodeRef_canReferenceObject(this, obj);
  }
}
