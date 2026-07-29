// OZChannelEnumInterpMode — the "interpolation-mode enum" channel in ProChannel.framework.
// Extends OZChannelEnum (Ozone) and cooperates with an OZChannelRotation3D-typed folder to
// notify the folder when the interp mode is modified. Faithful port from disassembly at
// raw-port/re/disasm/ProChannel.OZChannelEnumInterpMode/ (one .s per symbol).
//
// Framework: ProChannel (thin x86_64 slice; addresses are the same VA==file-offset because
// the framework's __TEXT starts at 0x0 in the thin slice, matching the disasm here).
//
// VTABLE (ProChannel):
//   __ZTV23OZChannelEnumInterpMode                @ 0x000de7d0
//   installed at (this + 0x00) = vtable + 0x10   = 0x000de7e0
//   installed at (this + 0x10) = vtable + 0x380  = 0x000deb50   (multiple-inheritance secondary
//                                                                sub-object vptr — same layout
//                                                                as sibling OZChannelEnumRetime)
//   Both installations were VERIFIED for every ctor body (10 of them, addr-independent RIP-
//   relative arithmetic — see raw-port/re/disasm/ProChannel.OZChannelEnumInterpMode/*.s).
//
// STRUCT LAYOUT (recovered from ctor bodies + willBeModified/assign/addToUndo dereferences):
//   +0x000  vtable[0]  primary vptr   (assigned = vtable+0x10)
//   +0x008  _factory   OZChannelEnumInterpMode_Factory*    ; set by base ctor from getInstance()
//                                                            (indirectly — the base OZChannelEnum
//                                                            ctor takes the OZFactory* arg and
//                                                            stores it; InterpMode's ctors
//                                                            override the incoming factory with
//                                                            _instance for the 5-arg and 3-arg
//                                                            variants).
//   +0x010  vtable[1]  secondary vptr (assigned = vtable+0x380)
//   +0x018 …          OZChannelEnum base subobject (opaque, frontier)
//   +0x030  folder    OZChannelFolder* base pointer   ; loaded by willBeModified @0x82ce3
//                                                       and assign @0x82d8c and addToUndo @0x82d2d.
//                                                       (This is the same OZChannelBase::_folder
//                                                       slot documented on sibling channel classes.)
//
// STATIC GLOBALS (ProChannel):
//   __ZN31OZChannelEnumInterpMode_Factory11getInstanceEv     — factory singleton getter (frontier
//                                                              class OZChannelEnumInterpMode_Factory;
//                                                              body @0x82976, not ported here).
//   __ZTI15OZChannelFolder      / __ZTI19OZChannelRotation3D — typeinfos used by ___dynamic_cast in
//                                                              willBeModified (@0x82cec/@0x82cf3)
//                                                              and assign (@0x82d95/@0x82d9c).
//
// The 16 methods covered here (all @ProChannel):
//   0x00080c9c  C1(PCString&, PCString&, OZChannelFolder*, u32, u32)             [5-arg no-factory]
//   0x00080de4  D1()                     [pure tail-jmp to OZChannelEnum::~OZChannelEnum]
//   0x000814d8  C1(OZChannelEnumInterpMode const&, OZChannelFolder*)             [copy 2-arg]
//   0x000829be  getObjCWrapperName()     [returns @"CHChannelEnum" CFString @0xe53f0]
//   0x000829cc  C2(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32) [6-arg with factory]
//   0x00082a3c  C1(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32) [6-arg with factory]
//   0x00082aac  C2(OZFactory*, PCString&, u32)                                    [3-arg factory]
//   0x00082afa  C1(OZFactory*, PCString&, u32)                                    [3-arg factory]
//   0x00082b48  C2(PCString&, PCString&, OZChannelFolder*, u32, u32)             [5-arg no-factory]
//   0x00082bb8  C2(u32, PCString&, PCString&, OZChannelFolder*, u32, u32)        [6-arg u32-leading]
//   0x00082c30  C1(u32, PCString&, PCString&, OZChannelFolder*, u32, u32)        [6-arg u32-leading]
//   0x00082ca8  C2(OZChannelEnumInterpMode const&, OZChannelFolder*)             [copy 2-arg]
//   0x00082cd2  willBeModified(u32)
//   0x00082d20  addToUndo(PCString&) const
//   0x00082d7e  assign(OZChannelBase const*)
//   0x000846ca  D0()                     [base D2 then tail-jmp to operator delete]
//
// FAITHFUL PORT — every function cites @ProChannel <addr>. Every numeric constant cites the
// address it was read from. Un-decoded callees throw citing their FCP addresses (PORTING_SPEC.md
// Rule 3). No approximations, no invented helpers, no shortcuts.
//
// LAYOUT NOTE: every C1 and C2 in this class is a FULL BODY at its own address (no C1 thunks
// jumping to C2). Verified: all 10 ctor .s files disassemble to 29..41 instructions each with
// their own RIP-relative vtable-address arithmetic that folds to identical 0xde7e0 / 0xdeb50
// installation targets. This matches Clang's behavior when C1 and C2 are IDENTICAL BODIES with
// only RIP-relative literal displacements differing (ICF didn't fold them because those
// displacements differ). The TS port therefore models each ctor's body directly rather than
// pretending one is a thunk.

// ── opaque parameter types the ctors pass through to the (frontier) base ctor ─────────────
export type PCStringRef = { readonly __pcstring: true } | string;
export type OZChannelFolderPtr = object | null | undefined;
export type OZChannelImplPtr   = object | null | undefined;
export type OZChannelInfoPtr   = object | null | undefined;
export type OZFactoryPtr       = object | null | undefined;
export type OZChannelBasePtr   = object | null | undefined;
/** Concrete-class factory pointer type (opaque here; the factory itself is a separate ProChannel
 *  class, __ZN31OZChannelEnumInterpMode_Factory..., ported elsewhere). */
export type OZChannelEnumInterpMode_FactoryPtr = object | null;
/** The dynamic_cast target's slot-101 (@0x328) virtual invoked from willBeModified. Opaque. */
export type OZChannelRotation3DPtr = object | null;

// ── constants read from ProChannel __DATA_CONST (verified with the __cfstring struct) ─────
/** @const 0xe53f0  CFStringRef → __TEXT __cstring @0xbca9d = "CHChannelEnum" (len 13).
 *  Loaded @0x829c2 as `leaq 0x62a27(%rip),%rax` (next-instr RIP = 0x829c9 -> 0x829c9 + 0x62a27
 *  = 0xe53f0). __cfstring struct dumped bit-for-bit from the x86_64 slice: length=13, cstr
 *  pointer's low bits = 0xbca9d, ASCII bytes at that offset spell "CHChannelEnum\0". */
const K_OBJC_WRAPPER_NAME: "CHChannelEnum" = "CHChannelEnum";

/** @const 0xde7e0  vtable + 0x10 — installed at (this+0x00) by every ctor. */
const K_VTABLE_PLUS_0x10_ADDR: number = 0x000de7e0;
/** @const 0xdeb50  vtable + 0x380 — installed at (this+0x10) by every ctor (multiple-inheritance
 *  secondary sub-object vptr). */
const K_VTABLE_PLUS_0x380_ADDR: number = 0x000deb50;
/** OZChannelBase::_folder byte offset within this — read at (this+0x30) from willBeModified,
 *  assign, and addToUndo. Documented here to keep the raw `0x30` from appearing as a naked magic
 *  number in the ports below (PORTING_SPEC Rule 5). */
const OFFSET_FOLDER: number = 0x30;
/** Virtual-table slot invoked on the dynamic_cast<OZChannelRotation3D> result inside
 *  willBeModified — `movq 0x328(%rcx),%rcx / jmpq *%rcx` @0x82d09/@0x82d19. Slot index = 0x328/8. */
const OZROTATION3D_VSLOT_WILLBEMODIFIED_OFFSET: number = 0x328;
/** Virtual-table slot invoked on the OZChannelBase folder inside addToUndo — `movq 0x78(%rax),%rax
 *  / callq *0x78(%rax)` @0x82d3e/@0x82d44 → this is the folder's `bool <virt78>()` predicate. */
const OZCHANNELFOLDER_VSLOT_78: number = 0x78;
/** Virtual-table slot invoked on the ChannelRootBase inside addToUndo — `movq 0x2f8(%rax),%rax
 *  / jmpq *%rax` @0x82d57/@0x82d71 → the root's undo-taker method. */
const OZCHANNELROOTBASE_VSLOT_2F8: number = 0x2f8;


// ── frontier stubs for un-ported callees ────────────────────────────────────────────────────

/** OZChannelEnumInterpMode_Factory::getInstance() — @ProChannel 0x82976. NOT YET TRANSCRIBED.
 *  The C1/C2 bodies here inline the call_once at their own addresses (each ctor body has its
 *  own `callq OZChannelEnumInterpMode_Factory::getInstance()` — @0x80cc0/@0x829ec/@0x82abe/etc.).
 *  Frontier — throws citing the singleton getter's own address. */
export function OZChannelEnumInterpMode_Factory_getInstance(): OZChannelEnumInterpMode_FactoryPtr {
  throw new Error(
    "OZChannelEnumInterpMode_Factory::getInstance @ProChannel 0x82976 not yet transcribed",
  );
}

/** OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32,
 *                               OZChannelImpl*, OZChannelInfo*) — @Ozone imported symbol
 *  __ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo.
 *  NOT YET TRANSCRIBED. Called from:
 *    C2@0x80c9c (5-arg no-factory)                    @0x80ce3
 *    C2@0x829cc (6-arg with factory)                  @0x82a11
 *    C2@0x82b48 (5-arg no-factory alt vtable owner)   @0x82b8f
 */
function OZChannelEnum_C2_from_PCString_full(
  _self: OZChannelEnumInterpMode,
  _name: PCStringRef,
  _factory: OZFactoryPtr,
  _name2: PCStringRef,
  _folder: OZChannelFolderPtr,
  _u1: number,
  _u2: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32, " +
    "OZChannelImpl*, OZChannelInfo*) @Ozone stub not yet transcribed (called from " +
    "OZChannelEnumInterpMode C2 @0x80ce3 / @0x82a11 / @0x82b8f)",
  );
}

/** OZChannelEnum::OZChannelEnum(OZFactory*, PCString&, u32, OZChannelImpl*, OZChannelInfo*) —
 *  @Ozone imported symbol __ZN13OZChannelEnumC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo.
 *  NOT YET TRANSCRIBED. Called from C2@0x82aac @0x82ad4 (and identical body C1@0x82afa @0x82b22). */
function OZChannelEnum_C2_from_OZFactory(
  _self: OZChannelEnumInterpMode,
  _factory: OZFactoryPtr,
  _name: PCStringRef,
  _u: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(OZFactory*, PCString&, u32, OZChannelImpl*, OZChannelInfo*) " +
    "@Ozone stub not yet transcribed (called from OZChannelEnumInterpMode C2 @0x82ad4)",
  );
}

/** OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZFactory*, OZChannelFolder*, u32, u32,
 *                               OZChannelImpl*, OZChannelInfo*) — @Ozone imported symbol
 *  __ZN13OZChannelEnumC2EjRK8PCStringS2_P9OZFactoryP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo.
 *  NOT YET TRANSCRIBED. Called from C2@0x82bb8 (u32-leading) @0x82c06. */
function OZChannelEnum_C2_from_u32(
  _self: OZChannelEnumInterpMode,
  _id: number,
  _name: PCStringRef,
  _name2: PCStringRef,
  _factory: OZFactoryPtr,
  _folder: OZChannelFolderPtr,
  _u1: number,
  _u2: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZFactory*, OZChannelFolder*, u32, " +
    "u32, OZChannelImpl*, OZChannelInfo*) @Ozone stub not yet transcribed (called from " +
    "OZChannelEnumInterpMode C2 @0x82c06)",
  );
}

/** OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) — @Ozone imported
 *  symbol __ZN13OZChannelEnumC2ERKS_P15OZChannelFolder. NOT YET TRANSCRIBED. Called from the
 *  copy ctors: C2@0x82ca8 @0x82cb1 and C1@0x814d8 @0x814e1. */
function OZChannelEnum_C2_copy(
  _self: OZChannelEnumInterpMode,
  _other: OZChannelEnumInterpMode,
  _folder: OZChannelFolderPtr,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) @Ozone stub not yet " +
    "transcribed (called from OZChannelEnumInterpMode copy C2 @0x82cb1 / C1 @0x814e1)",
  );
}

/** OZChannelEnum::~OZChannelEnum() — @Ozone imported symbol __ZN13OZChannelEnumD2Ev. NOT YET
 *  TRANSCRIBED. Called from:
 *    D1 @0x80de4 — pure tail-jmp (0x80de9 `jmp __ZN13OZChannelEnumD2Ev`).
 *    D0 @0x846ca — direct callq @0x846d3, then jmp operator delete @0x846e1.
 */
function OZChannelEnum_D2(_self: OZChannelEnumInterpMode): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum @Ozone stub not yet transcribed (tail-called from " +
    "OZChannelEnumInterpMode D1 @0x80de9 and D0 @0x846d3)",
  );
}

/** OZChannel::willBeModified(u32) — @Ozone imported symbol __ZN9OZChannel14willBeModifiedEj.
 *  NOT YET TRANSCRIBED. Called first thing from OZChannelEnumInterpMode::willBeModified @0x82cde. */
function OZChannel_willBeModified(_self: OZChannelEnumInterpMode, _flags: number): void {
  throw new Error(
    "OZChannel::willBeModified(u32) @Ozone stub not yet transcribed (called from " +
    "OZChannelEnumInterpMode::willBeModified @0x82cde)",
  );
}

/** OZChannelBase::getChannelRootBase() const — @Ozone imported symbol
 *  __ZNK13OZChannelBase18getChannelRootBaseEv. NOT YET TRANSCRIBED. Called first thing from
 *  OZChannelEnumInterpMode::addToUndo @0x82d31. */
function OZChannelBase_getChannelRootBase(_self: OZChannelEnumInterpMode): unknown {
  throw new Error(
    "OZChannelBase::getChannelRootBase() const @Ozone stub not yet transcribed (called from " +
    "OZChannelEnumInterpMode::addToUndo @0x82d31)",
  );
}

/** OZChannelEnum::assign(OZChannelBase const*) — @Ozone imported symbol
 *  __ZN13OZChannelEnum6assignEPK13OZChannelBase. NOT YET TRANSCRIBED. Called first thing from
 *  OZChannelEnumInterpMode::assign @0x82d87. */
function OZChannelEnum_assign(_self: OZChannelEnumInterpMode, _other: OZChannelBasePtr): void {
  throw new Error(
    "OZChannelEnum::assign(OZChannelBase const*) @Ozone stub not yet transcribed (called from " +
    "OZChannelEnumInterpMode::assign @0x82d87)",
  );
}

/** OZChannelRotation3D::interpolationModeWasSet() — @Ozone imported symbol
 *  __ZN19OZChannelRotation3D23interpolationModeWasSetEv. NOT YET TRANSCRIBED (frontier).
 *  Tail-called from OZChannelEnumInterpMode::assign @0x82db7. */
function OZChannelRotation3D_interpolationModeWasSet(_target: OZChannelRotation3DPtr | null): void {
  throw new Error(
    "OZChannelRotation3D::interpolationModeWasSet() @Ozone stub not yet transcribed (tail-called " +
    "from OZChannelEnumInterpMode::assign @0x82db7)",
  );
}

/** ___dynamic_cast(void*, __class_type_info const*, __class_type_info const*, ptrdiff_t) —
 *  libc++abi runtime. NOT PORTED (external runtime). Called from:
 *    willBeModified @0x82cfc — cast (folder, OZChannelFolder, OZChannelRotation3D, 0)
 *    assign         @0x82da5 — cast (folder, OZChannelFolder, OZChannelRotation3D, 0)
 */
function __dynamic_cast_stub(
  _obj: unknown,
  _srcTypeinfoAddr: number,
  _dstTypeinfoAddr: number,
  _hint: number,
): OZChannelRotation3DPtr | null {
  throw new Error(
    "___dynamic_cast(obj, __ZTI15OZChannelFolder, __ZTI19OZChannelRotation3D, 0) @libc++abi " +
    "runtime — not yet modeled (called from OZChannelEnumInterpMode::willBeModified @0x82cfc " +
    "and OZChannelEnumInterpMode::assign @0x82da5)",
  );
}

/** operator delete(void*) — @ProChannel __stubs 0xace04 (__ZdlPv). NOT YET TRANSCRIBED.
 *  Tail-called from OZChannelEnumInterpMode::D0 @0x846e1. */
function operator_delete_stub(_p: OZChannelEnumInterpMode): void {
  throw new Error(
    "operator delete(void*) @ProChannel __stubs 0xace04 not yet transcribed (tail-called from " +
    "OZChannelEnumInterpMode::D0 @0x846e1)",
  );
}

/** OZChannelRootBase vtable slot @+0x2f8 (undo taker) — tail-called from
 *  OZChannelEnumInterpMode::addToUndo @0x82d71 as `jmpq *rax` where rax = *(root_vtable+0x2f8).
 *  Frontier. */
function OZChannelRootBase_vslot2F8_stub(
  _root: unknown,
  _folder: unknown,
  _name: PCStringRef,
): void {
  throw new Error(
    "OZChannelRootBase vtable slot @+0x2f8 (undo taker) not yet transcribed — tail-called from " +
    "OZChannelEnumInterpMode::addToUndo @0x82d71",
  );
}

/** OZChannelBase folder vtable slot @+0x78 — bool-returning predicate; called from
 *  OZChannelEnumInterpMode::addToUndo @0x82d44 as `callq *(rax+0x78)`. Frontier. */
function OZChannelBase_vslot78_stub(_folder: unknown): boolean {
  throw new Error(
    "OZChannelBase folder vtable slot @+0x78 (bool predicate) not yet transcribed — called from " +
    "OZChannelEnumInterpMode::addToUndo @0x82d44",
  );
}

/** OZChannelRotation3D vtable slot @+0x328 — tail-called from
 *  OZChannelEnumInterpMode::willBeModified @0x82d19 with arg=flags (u32). Frontier. */
function OZChannelRotation3D_vslot328_stub(_target: unknown, _flags: number): void {
  throw new Error(
    "OZChannelRotation3D vtable slot @+0x328 not yet transcribed — tail-called from " +
    "OZChannelEnumInterpMode::willBeModified @0x82d19 with arg=flags (u32)",
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────
// OZChannelEnumInterpMode — see doc comment at top of file for full struct layout + provenance.
// ────────────────────────────────────────────────────────────────────────────────────────────

/** Structural TS model of the instance. The full byte layout is initialized by the (frontier)
 *  base ctor plus this class's own two vptr writes; TS reflects the two vptr slots and the
 *  folder pointer at +0x30 explicitly. */
export class OZChannelEnumInterpMode {
  /** vtable[0] slot — installed as vtable+0x10 (= @ProChannel 0xde7e0) at (this+0x00) by every
   *  ctor. Verified across all 10 ctor .s files. */
  readonly __vptr0: number = K_VTABLE_PLUS_0x10_ADDR;
  /** vtable[1] slot — installed as vtable+0x380 (= @ProChannel 0xdeb50) at (this+0x10) by every
   *  ctor (multiple-inheritance secondary sub-object vptr). Verified across all 10 ctor .s files. */
  readonly __vptr1: number = K_VTABLE_PLUS_0x380_ADDR;
  /** _folder at (this+0x30). Read by willBeModified @0x82ce3, assign @0x82d8c, and addToUndo
   *  @0x82d2d. Written by the base ctor (frontier) — not touched directly by this class. */
  _folder: OZChannelFolderPtr = null;

  // ── ctor "shape" dispatchers — one static factory per C++ ctor overload.
  // A TS class body cannot host 10 overloaded constructors, so we mirror each C++ ctor body
  // as its own static factory named after the ctor's kind (C1/C2 collapse together — see the
  // per-address body helpers below).

  /** OZChannelEnumInterpMode(PCString&, PCString&, OZChannelFolder*, u32, u32) — C1@0x80c9c and
   *  C2@0x82b48 (both are full bodies at their own addresses, semantically identical). Calls the
   *  factory singleton getter, then base OZChannelEnum::C2 with `_instance` as OZFactory*, then
   *  writes the two vptr slots. */
  static make_from_PCString_PCString_Folder_u32_u32(
    name: PCStringRef, name2: PCStringRef, folder: OZChannelFolderPtr, u1: number, u2: number,
  ): OZChannelEnumInterpMode {
    return OZChannelEnumInterpMode_C2_5arg_body(name, name2, folder, u1, u2);
  }

  /** OZChannelEnumInterpMode(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32) —
   *  C1@0x82a3c and C2@0x829cc (both full bodies at own addr). Calls the factory singleton
   *  getter (return REPLACES the incoming OZFactory* — the compiler discards it) then base ctor. */
  static make_from_PCString_OZFactory_PCString_Folder_u32_u32(
    name: PCStringRef,
    _factoryIgnored: OZFactoryPtr,
    name2: PCStringRef,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
  ): OZChannelEnumInterpMode {
    return OZChannelEnumInterpMode_C2_6arg_factory_body(name, _factoryIgnored, name2, folder, u1, u2);
  }

  /** OZChannelEnumInterpMode(OZFactory*, PCString&, u32) — C1@0x82afa and C2@0x82aac. */
  static make_from_OZFactory_PCString_u32(
    _factoryIgnored: OZFactoryPtr, name: PCStringRef, u: number,
  ): OZChannelEnumInterpMode {
    return OZChannelEnumInterpMode_C2_3arg_body(_factoryIgnored, name, u);
  }

  /** OZChannelEnumInterpMode(u32, PCString&, PCString&, OZChannelFolder*, u32, u32) — C1@0x82c30
   *  and C2@0x82bb8 (both full bodies at own addr). Uses the u32-leading base ctor overload. */
  static make_from_u32_PCString_PCString_Folder_u32_u32(
    id: number, name: PCStringRef, name2: PCStringRef, folder: OZChannelFolderPtr,
    u1: number, u2: number,
  ): OZChannelEnumInterpMode {
    return OZChannelEnumInterpMode_C2_u32lead_body(id, name, name2, folder, u1, u2);
  }

  /** OZChannelEnumInterpMode(OZChannelEnumInterpMode const&, OZChannelFolder*) — C1@0x814d8 and
   *  C2@0x82ca8. Pure delegation to OZChannelEnum::C2_copy then the two vptr installs. */
  static make_copy(
    other: OZChannelEnumInterpMode, folder: OZChannelFolderPtr,
  ): OZChannelEnumInterpMode {
    return OZChannelEnumInterpMode_C2_copy_body(other, folder);
  }

  /**
   * getObjCWrapperName() — @ProChannel 0x829be. Returns a static CFStringRef that lives in the
   * framework's __DATA_CONST __cfstring section at 0xe53f0 whose backing UTF-8 is
   * "CHChannelEnum" (13 bytes at __TEXT __cstring 0xbca9d, verified by dumping the raw
   * `__cfstring` struct bytes from the x86_64 slice).
   *
   * Disasm (verbatim):
   *   @0x829be  pushq %rbp / movq %rsp,%rbp
   *   @0x829c2  leaq  0x62a27(%rip), %rax        ; RIP=0x829c9; addr=0x829c9+0x62a27=0xe53f0
   *   @0x829c9  popq  %rbp
   *   @0x829ca  retq
   *
   * The TS port returns the exact ASCII payload of that CFString — modeled as the string
   * literal type so downstream consumers can key on it structurally.
   */
  getObjCWrapperName(): "CHChannelEnum" {
    return K_OBJC_WRAPPER_NAME;
  }

  /**
   * willBeModified(u32 flags) — @ProChannel 0x82cd2.
   *
   * Disasm control flow (verbatim, line-for-line):
   *   @0x82cd2..@0x82cdb  prologue; save r14=this, ebx=flags
   *   @0x82cde  callq OZChannel::willBeModified(u32)                    ; base override
   *   @0x82ce3  rdi = *(this+0x30)                                       ; _folder
   *   @0x82ce7  if _folder == 0 -> ret (jump to @0x82d1b)
   *   @0x82cec  rsi = &__ZTI15OZChannelFolder
   *   @0x82cf3  rdx = &__ZTI19OZChannelRotation3D
   *   @0x82cfa  ecx = 0
   *   @0x82cfc  callq ___dynamic_cast                                    ; -> rax
   *   @0x82d01  if rax == 0 -> ret (jump to @0x82d1b)
   *   @0x82d06  rcx = *(rax)                                             ; vtable ptr
   *   @0x82d09  rcx = *(rcx + 0x328)                                     ; slot 0x328
   *   @0x82d10  rdi = rax                                                ; arg1 = casted object
   *   @0x82d13  esi = ebx                                                ; arg2 = flags (u32)
   *   @0x82d19  jmpq *rcx                                                ; tail-call
   *
   * Faithful port: call the base predicate first (throws stub), then read the folder pointer,
   * then dynamic_cast, then dispatch to the vtable-slot stub on success. Every un-decoded edge
   * throws citing its @0xADDR.
   */
  willBeModified(flags: number): void {
    const F = flags >>> 0; // u32 narrow — arg was ebx (32-bit)
    // @0x82cde
    OZChannel_willBeModified(this, F);
    // @0x82ce3
    const folder = this._folder;
    // @0x82ce7 — early return on null folder
    if (folder === null || folder === undefined) return;
    // @0x82cec..@0x82cfc
    const casted = __dynamic_cast_stub(
      folder,
      /* __ZTI15OZChannelFolder      */ 0,
      /* __ZTI19OZChannelRotation3D  */ 0,
      /* hint                        */ 0,
    );
    // @0x82d01 — early return on failed cast
    if (casted === null || casted === undefined) return;
    // @0x82d06..@0x82d19 — vtable dispatch (tail-call semantics)
    OZChannelRotation3D_vslot328_stub(casted, F);
  }

  /**
   * addToUndo(PCString const& name) — @ProChannel 0x82d20. `const` method (ZNK... in mangled name).
   *
   * Disasm control flow (verbatim, line-for-line):
   *   @0x82d20..@0x82d29  prologue; rbx=name arg
   *   @0x82d2a  rbx = rsi = name
   *   @0x82d2d  r14 = *(this + 0x30)                                     ; folder
   *   @0x82d31  callq OZChannelBase::getChannelRootBase() const         ; rax = rootBase
   *   @0x82d36  if r14 == 0 -> ret (jump @0x82d73)
   *   @0x82d3b  r15 = rax (rootBase)
   *   @0x82d3e  rax = *(r14)                                             ; folder vtable
   *   @0x82d41  rdi = r14 (folder)
   *   @0x82d44  callq *(rax + 0x78)                                      ; folder vtable slot 0x78
   *   @0x82d47  cl = (r15 != 0)
   *   @0x82d4a  cl &= al                                                 ; AND with slot-78 result
   *   @0x82d4f  if cl != 1 -> ret (jump @0x82d73)
   *   @0x82d54  rax = *(r15)                                             ; rootBase vtable
   *   @0x82d57  rax = *(rax + 0x2f8)                                     ; rootBase vtable slot 0x2f8
   *   @0x82d5e  rdi = r15 (rootBase) / rsi = r14 (folder) / rdx = rbx (name)
   *   @0x82d71  jmpq *rax                                                ; tail-call
   *
   * NOTE the "call rootBase() BEFORE the null-folder check" quirk — the C++ compiler eagerly
   * evaluated `getChannelRootBase()` for its return value regardless of folder-nullness. We
   * transcribe that literally.
   */
  addToUndo(name: PCStringRef): void {
    // @0x82d2d
    const folder = this._folder;
    // @0x82d31 — always invoked, even if folder is null
    const rootBase = OZChannelBase_getChannelRootBase(this);
    // @0x82d36 — early return on null folder (still after the getChannelRootBase call)
    if (folder === null || folder === undefined) return;
    // @0x82d3e..@0x82d44 — folder vtable slot 0x78 (bool predicate)
    const p78 = OZChannelBase_vslot78_stub(folder);
    // @0x82d47..@0x82d4f — combine: `(rootBase != 0) && p78`
    const rootBaseNonNull = rootBase !== null && rootBase !== undefined;
    if (!(rootBaseNonNull && p78)) return;
    // @0x82d54..@0x82d71 — dispatch rootBase vtable slot 0x2f8(rootBase, folder, name)
    OZChannelRootBase_vslot2F8_stub(rootBase, folder, name);
  }

  /**
   * assign(OZChannelBase const* other) — @ProChannel 0x82d7e.
   *
   * Disasm control flow (verbatim):
   *   @0x82d7e..@0x82d84  prologue; rbx = this
   *   @0x82d87  callq OZChannelEnum::assign(OZChannelBase const*)        ; base override
   *   @0x82d8c  rdi = *(this + 0x30)                                     ; folder
   *   @0x82d93  if folder == 0 -> rdi = 0, jump @0x82db1
   *   @0x82d95  rsi = &__ZTI15OZChannelFolder
   *   @0x82d9c  rdx = &__ZTI19OZChannelRotation3D
   *   @0x82da3  ecx = 0
   *   @0x82da5  callq ___dynamic_cast                                    ; -> rax
   *   @0x82daa  rdi = rax
   *   @0x82dad  jmp @0x82db1
   *   @0x82daf  xorl edi,edi
   *   @0x82db1  epilogue
   *   @0x82db7  jmp OZChannelRotation3D::interpolationModeWasSet(rdi)    ; tail-call
   *
   * Note that the tail-call to `interpolationModeWasSet` runs UNCONDITIONALLY — but rdi is
   * either the dynamic_cast result (folder cast to OZChannelRotation3D) or NULL. The callee is
   * an ObjC-ish method-call semantically; a null receiver is legal in Objective-C but this
   * function is a C++ method — meaning either the callee handles a null this, or the folder is
   * KNOWN to be an OZChannelRotation3D at every call site. We transcribe the branch literally.
   */
  assign(other: OZChannelBasePtr): void {
    // @0x82d87
    OZChannelEnum_assign(this, other);
    // @0x82d8c
    const folder = this._folder;
    // @0x82d93 — folder-null path: rdi = 0
    let target: OZChannelRotation3DPtr | null = null;
    if (folder !== null && folder !== undefined) {
      // @0x82d95..@0x82da5 — dynamic_cast to OZChannelRotation3D
      target = __dynamic_cast_stub(
        folder,
        /* __ZTI15OZChannelFolder     */ 0,
        /* __ZTI19OZChannelRotation3D */ 0,
        /* hint                       */ 0,
      );
    }
    // @0x82db7 — unconditional tail-call
    OZChannelRotation3D_interpolationModeWasSet(target);
  }

  /**
   * D1 body — @ProChannel 0x80de4 (5 instrs). Pure tail-jmp to OZChannelEnum::~OZChannelEnum:
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZN13OZChannelEnumD2Ev
   * TS models this as calling the base D2 stub (frontier). */
  destroy(): void {
    OZChannelEnum_D2(this);
  }

  /**
   * D0 body — @ProChannel 0x846ca (12 instrs):
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   movq  %rdi,%rbx
   *   callq __ZN13OZChannelEnumD2Ev@stub
   *   movq  %rbx,%rdi
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp
   *   jmp   __ZdlPv@stub
   * = base D2 then operator delete (tail-call). Both are frontier. */
  destroy_deleting(): void {
    OZChannelEnum_D2(this);
    operator_delete_stub(this);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────
// Per-address ctor body helpers. One helper per DISTINCT C++ ctor body (not per C1/C2 pair —
// C1 and C2 have identical semantics; only their RIP-relative literal displacements differ).
// Each helper builds a fresh OZChannelEnumInterpMode instance and walks the disassembled ctor
// body line-for-line. Every un-decoded callee throws.
// ────────────────────────────────────────────────────────────────────────────────────────────

/** C2 body for the 5-arg no-factory ctor — @ProChannel 0x80c9c (C1) and 0x82b48 (C2).
 *
 * Disasm (verbatim, using @0x82b48; @0x80c9c has an identical instruction sequence with
 * different RIP-relative literals that fold to the SAME 0xde7e0 / 0xdeb50 vptr targets):
 *   @0x82b48..@0x82b69  prologue; save regs r14=this, r13=name, r12=name2, r15=folder,
 *                       -0x2c(%rbp)=u1, ebx=u2
 *   @0x82b6c  callq OZChannelEnumInterpMode_Factory::getInstance()      ; rax = factory
 *   @0x82b71  xorps xmm0,xmm0
 *   @0x82b74  movups xmm0, 0x8(%rsp)                                     ; [rsp+8]=impl=0, [rsp+16]=info=0
 *   @0x82b79  movl  %ebx, (%rsp)                                         ; [rsp+0]=u2
 *   @0x82b7c..@0x82b8b  set base-ctor args: rdi=this, rsi=name, rdx=factory (from getInstance),
 *                       rcx=name2, r8=folder, r9d=u1 (loaded from -0x2c(%rbp))
 *   @0x82b8f  callq OZChannelEnum::C2(name, factory, name2, folder, u1, u2, impl=0, info=0)
 *   @0x82b94..@0x82ba5  install vptrs (target addrs 0xde7e0 / 0xdeb50 — verified)
 *   @0x82ba9..@0x82bb7  epilogue + retq
 */
function OZChannelEnumInterpMode_C2_5arg_body(
  name: PCStringRef, name2: PCStringRef, folder: OZChannelFolderPtr, u1: number, u2: number,
): OZChannelEnumInterpMode {
  const U1 = u1 >>> 0; // uint32 (r9d)
  const U2 = u2 >>> 0; // uint32 ([rsp+0])
  // @0x82b6c — factory singleton
  const factory = OZChannelEnumInterpMode_Factory_getInstance();
  // @0x82b71..@0x82b8f — base ctor with factory=getInstance(), impl=0, info=0
  const self = Object.create(OZChannelEnumInterpMode.prototype) as OZChannelEnumInterpMode;
  OZChannelEnum_C2_from_PCString_full(self, name, factory, name2, folder, U1, U2, null, null);
  // @0x82b94..@0x82ba5 — vptrs already modeled as readonly __vptr0/__vptr1 on the prototype
  // (the class defaults install both to the correct addresses).
  // Explicitly re-assign to prove the semantic (even though it's a no-op on the prototype's
  // readonly initializer, this preserves the "write to this+0x00" and "write to this+0x10"
  // ordering visible in the disasm; using Reflect to bypass the readonly check is unnecessary
  // because class instance-field initializers already ran at Object.create time is FALSE —
  // Object.create does NOT run field initializers. So we must set them here.):
  (self as unknown as { __vptr0: number }).__vptr0 = K_VTABLE_PLUS_0x10_ADDR;
  (self as unknown as { __vptr1: number }).__vptr1 = K_VTABLE_PLUS_0x380_ADDR;
  return self;
}

/** C2 body for the 6-arg (name, OZFactory*, name2, folder, u1, u2) ctor —
 *  @ProChannel 0x829cc (C2) and 0x82a3c (C1); identical bodies at own addresses.
 *
 * Disasm (using @0x829cc):
 *   @0x829cc..@0x829e9  prologue; r13=this, r12=name, r15=name2, r14=folder, ebx=u2, u1 on stack@0x10(%rbp)
 *   @0x829ec  callq OZChannelEnumInterpMode_Factory::getInstance()        ; rax = _instance
 *   @0x829f1..@0x829fc  build stack args: xmm0=0, movups xmm0,0x8(%rsp)   ; impl=0, info=0
 *                        movl 0x10(%rbp),%ecx ; movl %ecx,(%rsp)          ; [rsp]=u1
 *   @0x829ff..@0x82a0e  set regs: rdi=this, rsi=name, rdx=factory (from getInstance — DISCARDS
 *                        the incoming OZFactory* arg), rcx=name2, r8=folder, r9d=u2 (WAIT: r9d=ebx)
 *
 *   ↑ Careful re-reading: rsi arrives as `name` (arg0 is this in rdi, arg1 is name in rsi,
 *     arg2=factory in rdx, arg3=name2 in rcx, arg4=folder in r8, arg5=u1 in r9d, arg6=u2 on stack).
 *     The compiler moves `%r9d,%ebx` (@0x829dd) to save u1, spills u2 (0x10(%rbp)) to stack@0
 *     via ecx. So the final call is
 *         OZChannelEnum::C2(this, name, factoryFromSingleton, name2, folder, u2_from_ebx, u1_from_stack, 0, 0)?
 *     But actually: `movl %ebx,(%rsp)` at @0x829fc? No — the disasm shows
 *         @0x829f9 movl 0x10(%rbp),%ecx
 *         @0x829fc movl %ecx,(%rsp)
 *     which stores u1 (arrived on stack) into [rsp+0]. And `movl %r9d,%ebx` at @0x829dd
 *     saves u1's REGISTER-side value... wait no. Let me re-read: r9d IS arg5. Depending on the
 *     C++ signature `C2(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32 u1, u32 u2)`,
 *     args: rdi=this, rsi=name, rdx=factory, rcx=name2, r8=folder, r9d=u1, stack[0x10(%rbp)]=u2.
 *     So @0x829dd `movl %r9d,%ebx` saves u1 into ebx. @0x829f9 loads u2 from stack. @0x82a0e
 *     `movl %ebx,%r9d` restores u1 into r9d — the arg for the base ctor's u1 parameter. And the
 *     base ctor's u2 is on stack at (%rsp) via the earlier movl. So the base ctor call is
 *     `C2(this, name, factory, name2, folder, u1, u2, impl=0, info=0)` — the natural ordering.
 *
 *   @0x82a11  callq OZChannelEnum::C2(...)
 *   @0x82a16..@0x82a28  install vptrs (targets 0xde7e0 / 0xdeb50)
 *   @0x82a2c..@0x82a3b  epilogue + retq
 */
function OZChannelEnumInterpMode_C2_6arg_factory_body(
  name: PCStringRef,
  _factoryIgnored: OZFactoryPtr, // arg is loaded into rdx but IMMEDIATELY overwritten by
                                  // rax = getInstance() — the incoming factory is discarded.
  name2: PCStringRef,
  folder: OZChannelFolderPtr,
  u1: number,
  u2: number,
): OZChannelEnumInterpMode {
  const U1 = u1 >>> 0;
  const U2 = u2 >>> 0;
  // @0x829ec — factory singleton REPLACES incoming _factoryIgnored (see disasm)
  const factory = OZChannelEnumInterpMode_Factory_getInstance();
  // @0x829f1..@0x82a11 — base ctor with impl=0, info=0
  const self = Object.create(OZChannelEnumInterpMode.prototype) as OZChannelEnumInterpMode;
  OZChannelEnum_C2_from_PCString_full(self, name, factory, name2, folder, U1, U2, null, null);
  // @0x82a16..@0x82a28 — vptrs
  (self as unknown as { __vptr0: number }).__vptr0 = K_VTABLE_PLUS_0x10_ADDR;
  (self as unknown as { __vptr1: number }).__vptr1 = K_VTABLE_PLUS_0x380_ADDR;
  return self;
}

/** C2 body for the 3-arg (OZFactory*, PCString&, u32) ctor —
 *  @ProChannel 0x82aac (C2) and 0x82afa (C1); identical bodies at own addresses.
 *
 * Disasm (using @0x82aac):
 *   @0x82aac..@0x82ab5  prologue; ebx=u32 arg (ecx-original), r14=name (rdx-original),
 *                        r15=this (rdi-original); the incoming rsi=OZFactory* is NOT saved.
 *   @0x82abe  callq OZChannelEnumInterpMode_Factory::getInstance()        ; rax = _instance
 *   @0x82ac3..@0x82ad1  set base-ctor args:
 *                        rdi = r15 = this
 *                        rsi = rax = factory (from getInstance — DISCARDS incoming rsi arg)
 *                        rdx = r14 = name
 *                        ecx = ebx = u
 *                        r8  = 0    (impl = nullptr)
 *                        r9  = 0    (info = nullptr)
 *   @0x82ad4  callq OZChannelEnum::C2(factory, name, u, impl=0, info=0)   ; the 3-arg-form base
 *                                                                          ctor overload
 *   @0x82ad9..@0x82aea  install vptrs (targets 0xde7e0 / 0xdeb50)
 *   @0x82aee..@0x82af8  epilogue + retq
 */
function OZChannelEnumInterpMode_C2_3arg_body(
  _factoryIgnored: OZFactoryPtr, name: PCStringRef, u: number,
): OZChannelEnumInterpMode {
  const U = u >>> 0;
  const factory = OZChannelEnumInterpMode_Factory_getInstance();
  const self = Object.create(OZChannelEnumInterpMode.prototype) as OZChannelEnumInterpMode;
  OZChannelEnum_C2_from_OZFactory(self, factory, name, U, null, null);
  (self as unknown as { __vptr0: number }).__vptr0 = K_VTABLE_PLUS_0x10_ADDR;
  (self as unknown as { __vptr1: number }).__vptr1 = K_VTABLE_PLUS_0x380_ADDR;
  return self;
}

/** C2 body for the 6-arg u32-leading (u32, PCString&, PCString&, OZChannelFolder*, u32, u32) ctor
 *  — @ProChannel 0x82bb8 (C2) and 0x82c30 (C1); identical bodies at own addresses.
 *
 * Disasm (using @0x82bb8):
 *   @0x82bb8..@0x82bd9  prologue; save ebx=u2, -0x30(%rbp)=folder (r8), r15=name2 (rcx),
 *                        r12=name (rdx), r13d=id (esi), r14=this (rdi); u1 on stack@0x10(%rbp)
 *   @0x82bdc  callq OZChannelEnumInterpMode_Factory::getInstance()        ; rax = _instance
 *   @0x82be1..@0x82c02  build 3 stack slots:
 *                        [rsp+0x10] = 0                                     ; info
 *                        [rsp+0x08] = u1 (from 0x10(%rbp))                  ; u1 param
 *                        [rsp+0x00] = u2 (from ebx)                         ; u2 param
 *                        rdi=this, esi=id, rdx=name, rcx=name2, r8=factory (from getInstance),
 *                        r9=folder (from -0x30(%rbp))
 *   @0x82c06  callq OZChannelEnum::C2(id, name, name2, factory, folder, u1, u2, impl=0, info=0)
 *   @0x82c0b..@0x82c1c  install vptrs (targets 0xde7e0 / 0xdeb50)
 *   @0x82c20..@0x82c2e  epilogue + retq
 *
 * IMPORTANT: the base overload here takes (u32, PCString&, PCString&, OZFactory*,
 * OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*) — verified from the mangled name
 * on the imported symbol. The stack layout above places u1/u2 in the correct slots for that
 * signature; the factory is threaded through as the 4th arg.
 */
function OZChannelEnumInterpMode_C2_u32lead_body(
  id: number, name: PCStringRef, name2: PCStringRef, folder: OZChannelFolderPtr,
  u1: number, u2: number,
): OZChannelEnumInterpMode {
  const ID = id >>> 0;
  const U1 = u1 >>> 0;
  const U2 = u2 >>> 0;
  const factory = OZChannelEnumInterpMode_Factory_getInstance();
  const self = Object.create(OZChannelEnumInterpMode.prototype) as OZChannelEnumInterpMode;
  OZChannelEnum_C2_from_u32(self, ID, name, name2, factory, folder, U1, U2, null, null);
  (self as unknown as { __vptr0: number }).__vptr0 = K_VTABLE_PLUS_0x10_ADDR;
  (self as unknown as { __vptr1: number }).__vptr1 = K_VTABLE_PLUS_0x380_ADDR;
  return self;
}

/** C2 body for the copy ctor (OZChannelEnumInterpMode const&, OZChannelFolder*) —
 *  @ProChannel 0x82ca8 (C2) and 0x814d8 (C1); identical bodies at own addresses.
 *
 * Disasm (using @0x82ca8; @0x814d8 is byte-identical modulo the RIP-relative literals):
 *   @0x82ca8..@0x82cae  prologue; rbx = this
 *   @0x82cb1  callq OZChannelEnum::C2(OZChannelEnum const&, OZChannelFolder*) ; rdi/rsi/rdx pass through
 *   @0x82cb6..@0x82cc7  install vptrs (targets 0xde7e0 / 0xdeb50)
 *   @0x82ccb..@0x82cd1  epilogue + retq
 *
 * The base copy ctor receives THIS class's incoming (other, folder) unchanged — no factory
 * arg. That means the copy path does NOT use the singleton and does NOT overwrite the incoming
 * factory field; the base copies whatever OZChannelEnum's copy semantics dictate.
 */
function OZChannelEnumInterpMode_C2_copy_body(
  other: OZChannelEnumInterpMode, folder: OZChannelFolderPtr,
): OZChannelEnumInterpMode {
  const self = Object.create(OZChannelEnumInterpMode.prototype) as OZChannelEnumInterpMode;
  OZChannelEnum_C2_copy(self, other, folder);
  (self as unknown as { __vptr0: number }).__vptr0 = K_VTABLE_PLUS_0x10_ADDR;
  (self as unknown as { __vptr1: number }).__vptr1 = K_VTABLE_PLUS_0x380_ADDR;
  return self;
}
