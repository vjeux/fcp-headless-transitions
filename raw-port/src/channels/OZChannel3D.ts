// OZChannel3D — three-double-per-component keyframable channel (ProChannel.framework).
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @ProChannel 0xADDR read
// from the disassembly under re/disasm/ProChannel.OZChannel3D.*.s. Struct layout recovered from
// ctor bodies + getValue + setValue:
//
//   size = 0x250   (heap: `new 0x250` in clone() @0x49173)
//   +0x000  vtable slot0  — OZChannel3D primary vptr  = vt@0xd6b30 + 0x10 = 0xd6b40
//                           (installed by every ctor: leaq 0x8df4c(%rip),%rax; movq %rax,(%rbx)
//                           @0x48bed / 0x48cb0 / 0x48db9 / 0x48edb / 0x48f9b / 0x49054 / 0x490f6)
//   +0x010  vtable slot1  — OZChannel3D secondary vptr  = vt@0xd6b30 + 0x367 = 0xd6e97
//                           (installed by every ctor: leaq 0x8e292(%rip),%rax; movq %rax,0x10(%rbx))
//   +0x018..0x087   OZChannel2D base sub-object (opaque here — the OZChannel2D-specific fields
//                   between the vtable pointers and +0x088 are not touched by OZChannel3D's own
//                   methods; the 2D class is a frontier stub below).
//   +0x088  OZChannel  X sub-channel  (0x98 bytes wide — stride confirmed by 0x120-0x088 == 0x098)
//   +0x120  OZChannel  Y sub-channel  (0x98 bytes wide — stride 0x1b8-0x120 == 0x098)
//   +0x1B8  OZChannelDouble Z sub-channel  (added by OZChannel3D; every ctor calls
//                   OZChannelDouble::OZChannelDouble(...) at this+0x1B8, or in the copy-ctor
//                   OZChannel::OZChannel(...) + vptr override — see per-ctor comments below)
//
// The three sub-channels are BASE-CLASS-dispatched via OZChannel:: methods (getValueAsDouble,
// getCurveValue, vtable *0x2c8 = OZChannel::setValue(CMTime, double, bool)@0x1663c). OZChannel2D,
// OZChannel, OZChannelDouble, and OZChannelBase are UN-PORTED (frontier); the stubs below throw
// citing the FCP addresses so any real call surfaces a loud gap instead of silently mis-behaving.
//
// DECODE references: raw-port/re/disasm/ProChannel.OZChannel3D.*.s   (C2_factory_folder,
// C2_ddd_factory_folder, C2_ddd_folder, C2_ddd_names_folder, C2_name_folder, C2_factory_only,
// C2_copy, clone, copy, deriveChannel, setValue, setValueOffsetByBehaviors, simplify,
// getObjCWrapperName, D1_dtor, D0_dtor, getValue).
//
// VTABLE FACT (used by setValue and setValueOffsetByBehaviors):
//   Resolved via raw-port/army/tools/vtable.py ProChannel OZChannel — installed-ptr 0xd1408:
//     *0x2c8 → OZChannel::setValue(CMTime const&, double, bool)      @ProChannel 0x1663c
//   Every writeback in this file goes through that slot with the bool argument = false (edx=0).
//
// CONSTANT PROVENANCE (read directly from the framework's __cfstring section):
//   "Channel Z"    — cfstring @ProChannel 0xe4fd0 (cstr @0xbc780, length 9). Passed by every
//                    non-copy ctor as the z sub-channel display name @0x48c07 / 0x48cca /
//                    0x48dd3 / 0x48fb5 / 0x4906e.
//   "CHChannel3D"  — cfstring @ProChannel 0xe4ff0 (cstr @0xbc78a, length 11). Returned by
//                    getObjCWrapperName @0x494c8.
//   `int index = 3` (movl $0x3, %ecx @0x48c2e / 0x48cf6 / 0x48e03 / 0x48fe0 / 0x49095) — the
//                    z-axis sub-channel index (3rd axis, 1-based).

// ---------------------------------------------------------------------------------------------
// Frontier stub for the embedded per-axis channel.  In FCP:  OZChannel : OZChannelBase, and
// OZChannelDouble : OZChannel.  The 3D wrapper touches only the base OZChannel API on these
// members (getValueAsDouble / getCurveValue / getTimeOffset / virtual slot *0x2c8).  Every
// method throws citing the FCP source address that would need transcription first.
// ---------------------------------------------------------------------------------------------
export class OZChannelSub {
  readonly __isOZChannelSub = true;

  /** OZChannel::getValueAsDouble(CMTime const&, double) const @ProChannel 0x?? — frontier stub. */
  getValueAsDouble(_time: CMTime, _defaultValue: number): number {
    throw new Error("OZChannel::getValueAsDouble @ProChannel not yet transcribed (called from OZChannel3D::getValue @0x9ed86/0x9edaa/0x9edcc and OZChannel3D::setValueOffsetByBehaviors @0x492ab/0x492d0/0x492f4)");
  }

  /** OZChannel::getCurveValue(CMTime const&, bool) @ProChannel 0x?? — frontier stub. */
  getCurveValue(_time: CMTime, _includeBehaviors: boolean): number {
    throw new Error("OZChannel::getCurveValue @ProChannel not yet transcribed (called from OZChannel3D::setValueOffsetByBehaviors @0x49366/0x493cf/0x49436)");
  }

  /** OZChannelBase::getTimeOffset() const @ProChannel 0x4a868 — frontier stub. */
  getTimeOffset(): CMTime {
    throw new Error("OZChannelBase::getTimeOffset @ProChannel 0x4a868 not yet transcribed (called from OZChannel3D::setValueOffsetByBehaviors @0x49318/0x49381/0x493e6)");
  }

  /**
   * Virtual slot +0x2c8 in OZChannel's vtable — call site: `movq 0x2c8(%rax), %rax; ... call *rax`.
   * Resolved to OZChannel::setValue(CMTime const&, double, bool) @ProChannel 0x1663c via
   * raw-port/army/tools/vtable.py ProChannel OZChannel (installed-ptr 0xd1408, slot 0x2c8).
   */
  vslot_0x2c8_setValue(_time: CMTime, _value: number, _addToUndo: boolean): void {
    throw new Error("OZChannel::vtable[+0x2c8] = OZChannel::setValue(CMTime,double,bool) @ProChannel 0x1663c not yet transcribed (dispatched from OZChannel3D::setValue @0x49223/0x49241/0x49271 and OZChannel3D::setValueOffsetByBehaviors @0x49472/0x4948c/0x494a6)");
  }

  /** OZChannel::copy(OZChannelBase const*, bool) @ProChannel 0x?? — frontier stub. */
  copy(_src: object | null, _addToUndo: boolean): void {
    throw new Error("OZChannel::copy @ProChannel not yet transcribed (tail-called from OZChannel3D::copy @0x491ed)");
  }
}

// ---------------------------------------------------------------------------------------------
// Frontier stubs for the OZChannel2D base sub-object.  OZChannel3D inherits from OZChannel2D
// (its `x` @+0x088 and `y` @+0x120 live inside this base).  All OZChannel2D methods invoked from
// OZChannel3D throw citing @0xADDR until OZChannel2D itself is transcribed.
// ---------------------------------------------------------------------------------------------
export class OZChannel2DBase {
  readonly __isOZChannel2DBase = true;

  /** OZChannel2D::x accessor — x sub-channel at struct offset +0x088 inside OZChannel2D. */
  get x(): OZChannelSub {
    throw new Error("OZChannel2D::x accessor @ProChannel not yet transcribed (x is at struct offset +0x088; required by OZChannel3D::setValue @0x491f8, setValueOffsetByBehaviors @0x49274, getValue @0x9ed50)");
  }

  /** OZChannel2D::y accessor — y sub-channel at struct offset +0x120 inside OZChannel2D. */
  get y(): OZChannelSub {
    throw new Error("OZChannel2D::y accessor @ProChannel not yet transcribed (y is at struct offset +0x120; required by OZChannel3D::setValue @0x491f8, setValueOffsetByBehaviors @0x49274, getValue @0x9ed50)");
  }

  /** OZChannel2D::copy(OZChannelBase const*, bool) @ProChannel 0x?? — frontier stub. */
  copy(_src: object | null, _addToUndo: boolean): void {
    throw new Error("OZChannel2D::copy @ProChannel not yet transcribed (called from OZChannel3D::copy @0x491b6)");
  }

  /** OZChannel2D::~OZChannel2D() @ProChannel 0x?? — frontier stub. */
  destroy(): void {
    throw new Error("OZChannel2D::~OZChannel2D @ProChannel not yet transcribed (tail-jmp from OZChannel3D::~OZChannel3D D1 @0x49505 and D0 @0x49537)");
  }
}

// ---------------------------------------------------------------------------------------------
// Opaque handle types — OZChannel3D passes these through to base/member ctors that are frontier.
// The 3D class never dereferences them itself.
// ---------------------------------------------------------------------------------------------
export type OZFactoryPtr = object | null | undefined;
export type OZChannelFolderPtr = object | null | undefined;
export type OZChannelImplPtr = object | null | undefined;
export type OZChannelInfoPtr = object | null | undefined;
export type PCString = { readonly __pcstring: true } | string;
export type OZChannelBasePtr = object | null | undefined;

/** CMTime — CoreMedia rational time struct { value: i64; timescale: i32; flags: u32; epoch: i64 }.
 *  Provided by raw-port/src/infra/CMTime.ts; we import both the type alias and the free-fn
 *  PC_CMTimeSaferSubtract @ProCore 0x8f9f1 used by setValueOffsetByBehaviors. */
import type { CMTime } from "../infra/CMTime.js";
import { PC_CMTimeSaferSubtract } from "../infra/CMTime.js";

// ---------------------------------------------------------------------------------------------
// OZChannel3D
// ---------------------------------------------------------------------------------------------
export class OZChannel3D {
  /** Struct size @ProChannel 0x250 — from clone @0x49173 `movl $0x250, %edi; call __Znwm`. */
  static readonly kSizeof = 0x250;
  /** Byte offset of the z sub-channel inside the struct. */
  static readonly kZOffset = 0x1b8;
  /** Byte stride between axis sub-channels (0x120-0x088 == 0x1b8-0x120 == 0x098). */
  static readonly kSubchannelStride = 0x98;

  /**
   * The OZChannel2D primary base sub-object at struct offset 0. Holds x (@+0x088) and y (@+0x120).
   * All access to x / y in OZChannel3D goes through this base — see the 2D::x / 2D::y accessors
   * which are frontier stubs above.
   */
  readonly base2D: OZChannel2DBase = new OZChannel2DBase();

  /** OZChannelDouble z sub-channel at struct offset +0x1B8. Wired by every ctor to a fresh
   *  OZChannelDouble; the copy-ctor uses OZChannel::OZChannel(const&,folder) + vptr override
   *  (see C2_copy comment below). */
  readonly z: OZChannelSub = new OZChannelSub();

  /**
   * OZChannel3D::OZChannel3D(OZFactory*, PCString const&, OZChannelFolder*, u32, u32, u32,
   *                          OZChannelImpl*, OZChannelInfo*)
   *   C1 (thunk)  @ProChannel 0x48c74  →  jmp C2 @0x48bc0
   *   C2 (body)   @ProChannel 0x48bc0
   *
   * Body @0x48bc0..0x48c73 (44 lines):
   *   1. OZChannel2D::OZChannel2D(factory, name, folder, u1, u2, u3, impl, info)     [@0x48be8]
   *      (the shared stack layout at rsp+0..0x10 forwards {u3, impl, info} into the base ctor)
   *   2. Install OZChannel3D primary vptr:  (this)      ← 0x48bed+7+0x8df4c = 0xd6b40 (vt+0x10)
   *   3. Install OZChannel3D secondary vptr: (this+0x10) ← 0x48bfe+7+0x8e292 = 0xd6e97 (vt+0x367)
   *   4. getProChannelBundle()                                                        [@0x48c02]
   *   5. PCString::PCString(cfstring @0xe4fd0 = "Channel Z", bundle, nullptr)        [@0x48c17 stub 0xacd02]
   *   6. OZChannelDouble::OZChannelDouble("Channel Z", folder, index=3, 0, impl, info) [@0x48c39]
   *       — placement-constructed at (this + 0x1b8) = &this->z
   *   7. PCString::~PCString(temp)                                                    [@0x48c42 stub 0xacd20]
   *   Landing pad @0x48c52..0x48c73: on OZChannelDouble ctor throw, destroy the temp PCString and
   *   run OZChannel2D::~OZChannel2D on the partially-constructed 2D base, then _Unwind_Resume.
   *
   * OZChannel2D::OZChannel2D and OZChannelDouble::OZChannelDouble are UN-PORTED (frontier). Real
   * construction cannot run; we throw citing @0x48bc0.
   */
  static ctor_factory_folder(_factory: OZFactoryPtr, _name: PCString, _folder: OZChannelFolderPtr,
                             _u1: number, _u2: number, _u3: number,
                             _impl: OZChannelImplPtr, _info: OZChannelInfoPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(OZFactory*,PCString&,OZChannelFolder*,u32,u32,u32,OZChannelImpl*,OZChannelInfo*) @ProChannel 0x48bc0 not yet transcribed (needs OZChannel2D::OZChannel2D + OZChannelDouble::OZChannelDouble + getProChannelBundle + PCString + \"Channel Z\" cfstring @0xe4fd0)");
  }

  /**
   * OZChannel3D::OZChannel3D(double xDef, double yDef, double zDef, OZFactory*, PCString&,
   *                          OZChannelFolder*, u32, u32, u32, OZChannelImpl*, OZChannelInfo*)
   *   C1 @0x48d3c  →  C2 @0x48c7e
   *
   * Body @0x48c7e..0x48d3b (46 lines): same shape as ctor_factory_folder but the base ctor
   * receives the two leading doubles as x/y defaults and the z default is forwarded into the
   * OZChannelDouble ctor:
   *   1. OZChannel2D::OZChannel2D(xDef, yDef, factory, name, folder, ...)             [@0x48cab]
   *   2. Install vptrs 0xd6b40 / 0xd6e97                                              [@0x48cb0 / 0x48cba]
   *   3. getProChannelBundle → PCString("Channel Z", bundle, nullptr)                 [@0x48cc5 / 0x48cda]
   *   4. OZChannelDouble::OZChannelDouble(zDef, "Channel Z", folder, 3, 0, impl, info)[@0x48d01]
   *      (xmm0 loaded from rbp-0x28 = the third double zDef @0x48cee)
   *   5. PCString::~PCString                                                          [@0x48d0a]
   *
   * Frontier deps identical to ctor_factory_folder. Throws citing @0x48c7e.
   */
  static ctor_ddd_factory_folder(_xDef: number, _yDef: number, _zDef: number,
                                 _factory: OZFactoryPtr, _name: PCString, _folder: OZChannelFolderPtr,
                                 _u1: number, _u2: number, _u3: number,
                                 _impl: OZChannelImplPtr, _info: OZChannelInfoPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(double,double,double,OZFactory*,PCString&,OZChannelFolder*,u32,u32,u32,OZChannelImpl*,OZChannelInfo*) @ProChannel 0x48c7e not yet transcribed (needs OZChannel2D::OZChannel2D(dd,...) + OZChannelDouble::OZChannelDouble(d,...) + getProChannelBundle + PCString + \"Channel Z\" cfstring @0xe4fd0)");
  }

  /**
   * OZChannel3D::OZChannel3D(double xDef, double yDef, double zDef, PCString&,
   *                          OZChannelFolder*, u32, u32, u32, OZChannelImpl*, OZChannelInfo*)
   *   C1 @0x48e4e  →  C2 @0x48d46
   *
   * Body @0x48d46..0x48e4d (60 lines): factory pointer is fetched via the singleton getter
   * OZChannel3D_Factory::getInstance() @ProChannel 0x1d50 [@0x48d82] and forwarded to
   * OZChannel2D::OZChannel2D(dd, factory=&instance, name, folder, ...) [@0x48db4]; the rest
   * mirrors ctor_ddd_factory_folder.
   */
  static ctor_ddd_folder(_xDef: number, _yDef: number, _zDef: number,
                         _name: PCString, _folder: OZChannelFolderPtr,
                         _u1: number, _u2: number, _u3: number,
                         _impl: OZChannelImplPtr, _info: OZChannelInfoPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(double,double,double,PCString&,OZChannelFolder*,u32,u32,u32,OZChannelImpl*,OZChannelInfo*) @ProChannel 0x48d46 not yet transcribed (needs OZChannel3D_Factory::getInstance @0x1d50 + OZChannel2D::OZChannel2D + OZChannelDouble::OZChannelDouble + PCString)");
  }

  /**
   * OZChannel3D::OZChannel3D(double xDef, double yDef, double zDef, PCString& name,
   *                          PCString& nameX, PCString& nameY, PCString& nameZ,
   *                          OZChannelFolder*, u32, u32, u32, OZChannelImpl*, OZChannelInfo*)
   *   C1 @0x48f3a  →  C2 @0x48e58
   *
   * Body @0x48e58..0x48f39 (55 lines): factory via getInstance [@0x48e95], OZChannel2D base ctor
   * with (xDef, yDef, factory, name, nameX, nameY, folder, u1, u2, u3, impl, info) [@0x48ed6],
   * vptrs [@0x48edb / 0x48ee5], then OZChannelDouble(zDef, nameZ, folder, 3, 0, impl, info)
   * placement-ctor at (this+0x1b8) [@0x48f12]. Note this variant does NOT construct the temporary
   * "Channel Z" PCString — the caller supplies nameZ directly.
   */
  static ctor_ddd_names_folder(_xDef: number, _yDef: number, _zDef: number,
                               _name: PCString, _nameX: PCString, _nameY: PCString, _nameZ: PCString,
                               _folder: OZChannelFolderPtr,
                               _u1: number, _u2: number, _u3: number,
                               _impl: OZChannelImplPtr, _info: OZChannelInfoPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(double,double,double,PCString&,PCString&,PCString&,PCString&,OZChannelFolder*,u32,u32,u32,OZChannelImpl*,OZChannelInfo*) @ProChannel 0x48e58 not yet transcribed (needs OZChannel3D_Factory::getInstance @0x1d50 + OZChannel2D::OZChannel2D(dd,names,...) + OZChannelDouble::OZChannelDouble(d,...))");
  }

  /**
   * OZChannel3D::OZChannel3D(PCString& name, OZChannelFolder*, u32, u32, u32,
   *                          OZChannelImpl*, OZChannelInfo*)
   *   C1 @0x4902a  →  C2 @0x48f44
   *
   * Body @0x48f44..0x49029 (56 lines): factory via getInstance [@0x48f68], OZChannel2D base ctor
   * (factory, name, folder, u1, u2, u3, impl, info) [@0x48f96], vptrs [@0x48f9b / 0x48fa5],
   * getProChannelBundle + PCString("Channel Z") [@0x48fb0 / 0x48fc5], OZChannelDouble("Channel Z",
   * folder, 3, 0, impl, info) at (this+0x1b8) [@0x48fec], PCString::~PCString [@0x48ff5].
   */
  static ctor_name_folder(_name: PCString, _folder: OZChannelFolderPtr,
                          _u1: number, _u2: number, _u3: number,
                          _impl: OZChannelImplPtr, _info: OZChannelInfoPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(PCString&,OZChannelFolder*,u32,u32,u32,OZChannelImpl*,OZChannelInfo*) @ProChannel 0x48f44 not yet transcribed (needs OZChannel3D_Factory::getInstance @0x1d50 + OZChannel2D::OZChannel2D + OZChannelDouble::OZChannelDouble + PCString + \"Channel Z\" cfstring @0xe4fd0)");
  }

  /**
   * OZChannel3D::OZChannel3D(OZFactory*, PCString& name, u32, u32, OZChannelImpl*, OZChannelInfo*)
   *   C1 @0x490da  →  C2 @0x49034
   *
   * Body @0x49034..0x490d9 (43 lines): the "no folder / no third u32" overload.
   *   1. OZChannel2D::OZChannel2D(factory, name, u1, u2, impl, info)                    [@0x4904f]
   *   2. Install vptrs 0xd6b40 / 0xd6e97                                                [@0x49054 / 0x4905e]
   *   3. getProChannelBundle → PCString("Channel Z", bundle, nullptr)                   [@0x49069 / 0x4907e]
   *   4. OZChannelDouble::OZChannelDouble("Channel Z", folder=this, 3, 0, impl, info)   [@0x490a0]
   *      (note: the folder passed here is `this` — an OZChannel3D IS-A OZChannelFolder via 2D base)
   *   5. PCString::~PCString                                                            [@0x490a9]
   */
  static ctor_factory_only(_factory: OZFactoryPtr, _name: PCString,
                           _u1: number, _u2: number,
                           _impl: OZChannelImplPtr, _info: OZChannelInfoPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(OZFactory*,PCString&,u32,u32,OZChannelImpl*,OZChannelInfo*) @ProChannel 0x49034 not yet transcribed (needs OZChannel2D::OZChannel2D(factory,name,u32,u32,...) + OZChannelDouble::OZChannelDouble + PCString + \"Channel Z\" cfstring @0xe4fd0)");
  }

  /**
   * OZChannel3D::OZChannel3D(OZChannel3D const& src, OZChannelFolder*)
   *   C1 @0x4915a  →  C2 @0x490e4
   *
   * Body @0x490e4..0x49159 (30 lines) — the COPY constructor. It does NOT re-use the OZChannelDouble
   * ctor for z; instead it calls OZChannel's copy-ctor and then explicitly overwrites the copied
   * sub-object's vptrs to point at OZChannelDouble's vtable:
   *   1. OZChannel2D::OZChannel2D(OZChannel2D const& src, OZChannelFolder* folder)   [@0x490f1]
   *   2. Install OZChannel3D primary vptr: (this)      ← 0x490f6+7+0x8da43 = 0xd6b40 (vt+0x10)
   *   3. Install OZChannel3D secondary vptr: (this+0x10) ← 0x49100+7+0x8dd89 = 0xd6e90 (vt+0x360)
   *   4. rax = 0x1b8;  rdi = this+0x1b8 (&this->z);  rsi = &src+0x1b8 (&src.z);  rdx = this
   *      OZChannel::OZChannel(OZChannel const& src.z, OZChannelFolder* this)          [@0x4911d]
   *   5. Override the just-copied OZChannel vptr slots so `this->z` is polymorphically a
   *      OZChannelDouble:  vtable for OZChannelDouble = @0xd17f0.
   *        (this+0x1b8) ← 0x49122+7+leaq imm(rax=0xd17f0)+0x10  = 0xd1800  [@0x4912d]
   *        (this+0x1c8) ← 0xd17f0 + 0x370                       = 0xd1b60  [@0x4913a]
   *      This is a standard C++ multiple-inheritance vptr rewrite: the copied z was constructed
   *      as-if it were a bare OZChannel, and the copy-ctor then "upgrades" its runtime type back
   *      to OZChannelDouble by rewriting both vptrs.
   *   Landing pad @0x49146..0x49158: OZChannel2D::~OZChannel2D + _Unwind_Resume on throw.
   */
  static ctor_copy(_src: OZChannel3D, _folder: OZChannelFolderPtr): OZChannel3D {
    throw new Error("OZChannel3D::OZChannel3D(OZChannel3D const&, OZChannelFolder*) @ProChannel 0x490e4 not yet transcribed (needs OZChannel2D::OZChannel2D copy-ctor + OZChannel::OZChannel copy-ctor + OZChannelDouble vtable @0xd17f0 override)");
  }

  /** No-arg ctor — for TS default construction used by the frontier stubs. Not a FCP counterpart. */
  constructor() {
    // Field initializers above have already constructed the OZChannel2DBase and OZChannelSub
    // frontier stubs. No FCP-side work; any real construction MUST go through one of the
    // static ctor_* factories above (all of which throw citing their @0xADDR until the frontier
    // classes are transcribed).
  }

  /**
   * OZChannel3D::clone() const  @ProChannel 0x49164
   *
   * Body @0x49164..0x4919f (20 code lines + unwind pad):
   *   pushq rbp; movq rsp,rbp; pushq r14; pushq rbx
   *   movq  rdi, r14                    ; r14 = this
   *   movl  $0x250, edi                 ; sizeof(OZChannel3D) = 0x250
   *   callq __Znwm                      ; operator new (stub @0xace4c)
   *   movq  rax, rbx; movq rax, rdi
   *   movq  r14, rsi                    ; source = this
   *   xorl  edx, edx                    ; folder = nullptr
   *   callq OZChannel3D::OZChannel3D(OZChannel3D const&, OZChannelFolder*) @0x490e4  (== ctor_copy)
   *   movq  rbx, rax                    ; return the new object
   *   pop rbx; pop r14; pop rbp; ret
   *   (unwind pad @0x49190..0x4919e: operator delete + _Unwind_Resume on copy-ctor throw.)
   *
   * ctor_copy is frontier — clone therefore throws through it citing @0x49164 + @0x490e4.
   */
  clone(): OZChannel3D {
    // operator new(0x250) @0x49173; OZChannel3D::OZChannel3D(*this, nullptr) @0x49183 (== ctor_copy).
    return OZChannel3D.ctor_copy(this, null); // throws citing @0x490e4 until transcribed (clone entry @0x49164)
  }

  /**
   * OZChannel3D::copy(OZChannelBase const* src, bool addToUndo)  @ProChannel 0x491a4
   *
   * Body @0x491a4..0x491f1 (17 code lines, tail-call at the end):
   *   pushq rbp; movq rsp,rbp; pushq r15; pushq r14; pushq rbx; pushq rax
   *   movl  edx, ebx                    ; ebx = addToUndo
   *   movq  rsi, r14                    ; r14 = src (OZChannelBase*)
   *   movq  rdi, r15                    ; r15 = this
   *   callq OZChannel2D::copy(OZChannelBase const*, bool)                              [@0x491b6]
   *   leaq  __ZTI13OZChannelBase(%rip), rsi                                            ; source-type
   *   leaq  __ZTI11OZChannel3D (%rip), rdx                                             ; target-type
   *   movq  r14, rdi; xorl ecx, ecx
   *   callq ___dynamic_cast                                                            [@0x491ce stub 0xacea0]
   *   movl  $0x1b8, esi
   *   addq  rsi, r15                    ; r15 = &this->z    (this + 0x1b8)
   *   addq  rax, rsi                    ; rsi = &src ->z    (dyncast(src) + 0x1b8)
   *   movq  r15, rdi; movl ebx, edx
   *   [pop epilogue]
   *   jmp   OZChannel::copy(OZChannelBase const*, bool)                                [@0x491ed tail]
   *
   * i.e.  base2D.copy(src, addToUndo);  this.z.copy(dynamic_cast<OZChannel3D*>(src)?.z ?? null, addToUndo).
   * The dynamic_cast returns nullptr when src is not an OZChannel3D; the &src->z addition then
   * safely wraps to a null-ish pointer that OZChannel::copy is expected to handle.
   */
  copy(src: OZChannelBasePtr, addToUndo: boolean): void {
    // Step 1 @0x491b6 — OZChannel2D::copy is frontier and throws citing 0x491b6.
    this.base2D.copy(src ?? null, addToUndo);
    // Step 2 (unreachable while step 1 throws — documented for completion):
    // dynamic_cast<OZChannel3D*>(src) — via C++ ABI (@stub 0xacea0). In TS we mirror it with an
    // instanceof check; a non-null src that isn't an OZChannel3D becomes null.
    const src3: OZChannel3D | null = src instanceof OZChannel3D ? src : null;
    // Step 3 @0x491ed — tail-call OZChannel::copy on the z sub-channel.
    this.z.copy(src3 ? src3.z : null, addToUndo);
  }

  /**
   * OZChannel3D::deriveChannel(CMTime const&)  @ProChannel 0x491f2
   *
   * Body @0x491f2..0x491f7 (exactly 4 lines):  pushq rbp; movq rsp,rbp; popq rbp; retq
   *
   * A **no-op** virtual override. Faithful transcription: empty body, no throw. The vtable slot
   * exists at this class layer so a subclass can override, but OZChannel3D itself contributes
   * nothing; the parent OZChannel2D or the base vtable owner supplies real semantics if any.
   */
  deriveChannel(_time: CMTime): void {
    // Empty body — matches @0x491f2 (push/mov/pop/ret only).
  }

  /**
   * OZChannel3D::setValue(CMTime const& t, double x, double y, double z)  @ProChannel 0x491f8
   *
   * Body @0x491f8..0x49272 (28 lines, no branches):
   *   Save z, y on stack; rbx = &t, r14 = this.
   *   For each axis (x @+0x88, y @+0x120, z @+0x1b8):
   *      rdi = this + off                              ; &this->axis
   *      rax = *(this + off) = *(axis)                 ; axis's vtable pointer (subch->vptr[0])
   *      xmm0 = the axis's double value
   *      edx = 0                                       ; bool addToUndo = false
   *      call *0x2c8(rax)                              ; OZChannel::setValue(CMTime, double, bool) @0x1663c
   *   The z branch is a tail-jmp *rax @0x49271.
   *
   * i.e.  this.x.vslot_0x2c8_setValue(t, x, false);
   *       this.y.vslot_0x2c8_setValue(t, y, false);
   *       this.z.vslot_0x2c8_setValue(t, z, false);
   */
  setValue(t: CMTime, x: number, y: number, z: number): void {
    this.base2D.x.vslot_0x2c8_setValue(t, x, false); // @0x49223  call *0x2c8(rax), edx=0
    this.base2D.y.vslot_0x2c8_setValue(t, y, false); // @0x49241  call *0x2c8(rax), edx=0
    this.z.vslot_0x2c8_setValue(t, z, false);        // @0x49271  jmpq *rax           , edx=0
  }

  /**
   * OZChannel3D::setValueOffsetByBehaviors(CMTime const& t, double x, double y, double z)
   *                                                                     @ProChannel 0x49274
   *
   * Body @0x49274..0x494bd (143 lines).  The method rewrites each axis's underlying CURVE value
   * so that after applying behaviors the SAMPLED value at time t equals the caller's argument.
   *
   *   For each axis A ∈ {x @+0x88, y @+0x120, z @+0x1b8}:
   *     (a) rawA   = OZChannel::getValueAsDouble(subA, t, 0.0)          [x @0x492ab; y @0x492d0; z @0x492f4]
   *         deltaA = argA - rawA                                         [x @0x492b5; y @0x492da; z @0x492fe]
   *         (deltaA saved on stack:  x@-0x60(rbp),  y@-0x68(rbp),  z@-0x30(rbp))
   *     (b) offA   = OZChannelBase::getTimeOffset(subA)                 [x @0x49318; y @0x49381; z @0x493e6]
   *         tLocA  = PC_CMTimeSaferSubtract(t, offA)                    [x @0x49359; y @0x493c2; z @0x49429]  (ProCore 0x8f9f1)
   *         curveA = OZChannel::getCurveValue(subA, tLocA, false)       [x @0x49366; y @0x493cf; z @0x49436]  (edx=0)
   *         (curveX saved @-0x78(rbp); curveY saved @-0x58(rbp); curveZ stays in xmm0/xmm2)
   *     (c) newA   = curveA + deltaA
   *              x:  xmm0=curveX; addsd -0x60(rbp) → newX             [@0x4943f/@0x49444]
   *              y:  xmm1=curveY; addsd -0x68(rbp) → newY (spilled)   [@0x49449/@0x4944e/@0x49453]
   *              z:  xmm2=curveZ; addsd -0x30(rbp) → newZ (spilled)   [@0x4945d]
   *         Then virtual writeback through vtable *0x2c8:
   *              x:  call *0x2c8(rax) with xmm0=newX,   edx=0         [@0x49472]
   *              y:  call *0x2c8(rax) with xmm0=newY,   edx=0         [@0x4948c]
   *              z:  call *0x2c8(rax) with xmm0=newZ,   edx=0         [@0x494a6]
   */
  setValueOffsetByBehaviors(t: CMTime, x: number, y: number, z: number): void {
    const xs = this.base2D.x;
    const ys = this.base2D.y;
    const zs = this.z;

    // (a) delta_i = arg_i − raw_i    (raw is the currently-sampled behavior-inclusive value)
    const rawX = xs.getValueAsDouble(t, 0.0); // @0x492ab  callq getValueAsDouble; xmm0=0.0
    const deltaX = x - rawX;                  // @0x492b5  subsd xmm0, saved-argX  → deltaX
    const rawY = ys.getValueAsDouble(t, 0.0); // @0x492d0
    const deltaY = y - rawY;                  // @0x492da
    const rawZ = zs.getValueAsDouble(t, 0.0); // @0x492f4
    const deltaZ = z - rawZ;                  // @0x492fe

    // (b) tLoc_i = PC_CMTimeSaferSubtract(t, getTimeOffset(sub_i));  curve_i = getCurveValue(sub_i, tLoc_i, false)
    const tLocX = PC_CMTimeSaferSubtract(t, xs.getTimeOffset()); // @0x49318 → @0x49359 (ProCore 0x8f9f1)
    const curveX = xs.getCurveValue(tLocX, false);                // @0x49366  (edx=0)
    const tLocY = PC_CMTimeSaferSubtract(t, ys.getTimeOffset()); // @0x49381 → @0x493c2
    const curveY = ys.getCurveValue(tLocY, false);                // @0x493cf
    const tLocZ = PC_CMTimeSaferSubtract(t, zs.getTimeOffset()); // @0x493e6 → @0x49429
    const curveZ = zs.getCurveValue(tLocZ, false);                // @0x49436

    // (c) new_i = curve_i + delta_i  ; then virtual setValue(*0x2c8) with addToUndo=false
    const newX = curveX + deltaX;      // @0x49444  addsd xmm0, -0x60(rbp)
    const newY = curveY + deltaY;      // @0x4944e  addsd xmm1, -0x68(rbp)
    const newZ = curveZ + deltaZ;      // @0x4945d  addsd xmm2, -0x30(rbp)
    xs.vslot_0x2c8_setValue(t, newX, false);  // @0x49472  call *0x2c8(rax), edx=0
    ys.vslot_0x2c8_setValue(t, newY, false);  // @0x4948c  call *0x2c8(rax), edx=0
    zs.vslot_0x2c8_setValue(t, newZ, false);  // @0x494a6  call *0x2c8(rax), edx=0
  }

  /**
   * OZChannel3D::simplify(double, double, double, unsigned int, bool)  @ProChannel 0x494be
   *
   * Body @0x494be..0x494c3 (exactly 4 lines): pushq rbp; movq rsp,rbp; popq rbp; retq
   *
   * A **no-op** override — matches @0x491f2 shape. The vtable slot exists at this class layer,
   * but no simplification work is done at the 3D layer; the parent's virtual (or the OZChannel-
   * level per-axis simplify) supplies the real behaviour.
   */
  simplify(_curveDefault: number, _rangeDefault: number, _tolerance: number,
           _maxKeypoints: number, _preserveTangents: boolean): void {
    // Empty body — matches @0x494be (push/mov/pop/ret only).
  }

  /**
   * OZChannel3D::getObjCWrapperName()  @ProChannel 0x494c4
   *
   * Body @0x494c4..0x494d0 (7 lines):
   *   pushq rbp; movq rsp,rbp
   *   leaq  0x9bb21(%rip), %rax    ; target = 0x494c8+7+0x9bb21 = 0xe4ff0  (__cfstring entry)
   *   popq  rbp; retq
   *
   * The cfstring at @ProChannel 0xe4ff0 points to cstr @ProChannel 0xbc78a with length 11 — the
   * raw UTF-8 bytes spell "CHChannel3D". This is the Objective-C wrapper class used by CoreHost
   * when exposing an OZChannel3D to the FCP UI layer. Note: OZChannelScale3D's getValue @0x9ed50
   * is code-folded with OZChannel3D::getValue because both walk the same three sub-channels.
   */
  getObjCWrapperName(): string {
    // Literal read from @ProChannel __cfstring section: cfstring @0xe4ff0 → cstr @0xbc78a (len 11).
    return "CHChannel3D";
  }

  /**
   * OZChannel3D::getValue(CMTime const& t, double* xOut, double* yOut, double* zOut,
   *                        double defaultValue) const               @ProChannel 0x9ed50
   *
   * IMPORTANT: nm(1) reports 0x9ed50 for BOTH OZChannel3D::getValue AND OZChannelScale3D::getValue
   * — the linker folded the two identical bodies (ICF). The T-V dump labels only the first
   * (Scale3D); the code applies verbatim to OZChannel3D.
   *
   * Body @0x9ed50..0x9ede3 (46 lines) — three parallel branches, each guarded by a null-check on
   * the output pointer:
   *
   *   if (xOut != nullptr) *xOut = OZChannel::getValueAsDouble(this+0x088, t, defaultValue)  [@0x9ed86]
   *   if (yOut != nullptr) *yOut = OZChannel::getValueAsDouble(this+0x120, t, defaultValue)  [@0x9edaa]
   *   if (zOut != nullptr) *zOut = OZChannel::getValueAsDouble(this+0x1B8, t, defaultValue)  [@0x9edcc]
   *
   * `defaultValue` is spilled to -0x30(%rbp) at entry and reloaded before each getValueAsDouble
   * call — pure parameter preservation across the calls, no numeric transform.
   *
   * In this TS port we return the three components in a struct rather than write through three
   * output pointers; the C++ null-checks map to "the caller chooses whether to request that axis".
   * We always compute all three because getValueAsDouble is pure (idempotent) and the C++
   * null-checks are just a calling-convention accommodation.
   */
  getValue(t: CMTime, defaultValue: number): { x: number; y: number; z: number } {
    // Three shape-identical reads. getValueAsDouble is a frontier stub; each call throws citing
    // its FCP call site until OZChannel::getValueAsDouble is transcribed (@0x9ed86/0x9edaa/0x9edcc).
    const x = this.base2D.x.getValueAsDouble(t, defaultValue); // @0x9ed86
    const y = this.base2D.y.getValueAsDouble(t, defaultValue); // @0x9edaa
    const z = this.z.getValueAsDouble(t, defaultValue);         // @0x9edcc
    return { x, y, z };
  }

  /**
   * OZChannel3D::~OZChannel3D()  D1 (complete-object) @ProChannel 0x494d2
   *                              D0 (deleting)        @ProChannel 0x4950a
   *
   * D1 body @0x494d2..0x49509 (15 lines):
   *   pushq rbp; movq rsp,rbp; pushq rbx; pushq rax
   *   movq  rdi, rbx
   *   ; Reset own vptrs during destruction (RAII):
   *   ;   (this)      ← 0x494db+7+0x8d65e = 0xd6b40  (OZChannel3D vt+0x10)
   *   ;   (this+0x10) ← 0x494e5+7+0x8d9a4 = 0xd6e90  (OZChannel3D vt+0x360)
   *   addq  $0x1b8, rdi                  ; rdi = &this->z
   *   callq OZChannel::~OZChannel()      [@0x494f7]
   *   movq  rbx, rdi
   *   [pop epilogue]
   *   jmp   OZChannel2D::~OZChannel2D()  [@0x49505 tail-jmp]
   *
   * D0 body @0x4950a..0x49549 (17 lines): identical to D1 through the OZChannel::~OZChannel and
   * OZChannel2D::~OZChannel2D calls, then tail-calls operator delete (@stub 0xace04) on `this`.
   * In this TS port operator delete is not modeled; `destroy()` exposes the D1 sequence.
   */
  destroy(): void {
    // D1 @0x494d2 — reset own vptrs (no observable side-effect in TS), then dispose z, then 2D.
    // Any real invocation throws through the frontier deps first (OZChannel::~OZChannel @0x494f7).
    this.__oz_channel_dtor_on_z();
    this.base2D.destroy(); // OZChannel2D::~OZChannel2D — frontier stub, throws citing 0x49505
  }

  /** OZChannel::~OZChannel() @ProChannel 0x?? called on the z sub-object — frontier stub. */
  private __oz_channel_dtor_on_z(): void {
    throw new Error("OZChannel::~OZChannel @ProChannel not yet transcribed (called from OZChannel3D::~OZChannel3D D1 @0x494f7 and D0 @0x4952f)");
  }
}
