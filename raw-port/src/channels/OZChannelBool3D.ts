// OZChannelBool3D — three-boolean-per-component channel (ProChannel.framework).
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @ProChannel 0xADDR read
// from the disassembly under re/disasm/ProChannel.OZChannelBool3D.*.s.  Struct layout recovered
// from ctor bodies:
//
//   size = 0x250   (heap: `new 0x250` in clone() @0x5352c)
//   +0x00  vtable slot0 (OZCompoundChannel primary)              // set @0x52e1e / 0x52fda / 0x5318f / 0x5348f / 0x539f5
//   +0x10  vtable slot1 (OZCompoundChannel secondary sub-object) // set @0x52e28 / 0x52fe4 / 0x53199 / 0x53492 / 0x539ff
//                                                                //   (multiple-inheritance thunk table)
//   +0x18..0x87   OZCompoundChannel base (opaque here — un-ported)
//   +0x88  OZChannelBool  X (sizeof = 0x98 = 0x120-0x88)
//   +0x120 OZChannelBool  Y
//   +0x1B8 OZChannelBool  Z
//
// The three members are BASE-CLASS-called via OZChannel:: methods (setValue, setDefaultValue,
// getValueAsInt, copy) — OZChannelBool derives from OZChannel.  OZChannelBool and OZCompoundChannel
// themselves are UN-PORTED (frontier); the stubs below throw citing the FCP addresses so any real
// call surfaces a loud gap instead of silently mis-behaving.
//
// DECODE references: see re/disasm/ProChannel.OZChannelBool3D.*.s   (ctor_bbbnjjj, ctor_bbbrnjjj,
// ctor_snjjj, ctor_fsjj, ctor_copy, dtor, clone, copy, getX/Y/Z, setX/Y/Z, getValueBool,
// getValueVec3, setValueBool, setValueVec3, setDefaultValue, getObjCWrapperName).

// ---------------------------------------------------------------------------------------------
// Frontier stub for the embedded per-axis channel.  OZChannelBool : OZChannel : OZChannelBase in
// FCP; here we only need the runtime shape the OZChannelBool3D methods touch: a slot for a
// (u8) default-value bit and a (u8) current-value bit, plus a "vtable +0x2c8" virtual dispatch
// used by setX/setY/setZ.  Every method throws citing the FCP source address that would need
// transcription before this channel becomes real.
// ---------------------------------------------------------------------------------------------
export class OZChannelBool {
  /** Marker that this instance is an embedded (non-heap) OZChannelBool sub-object. */
  readonly __isOZChannelBool = true;
  // Layout is opaque until OZChannelBool/OZChannel are ported.  The 3D wrapper only ever calls
  // OZChannel::{getValueAsInt,setValue,setDefaultValue,copy} on the base sub-object.

  /** OZChannel::getValueAsInt(CMTime const&, double) — @ProChannel 0x?? (frontier: OZChannel). */
  getValueAsInt(_time: unknown, _tolerance: number): number {
    throw new Error("OZChannel::getValueAsInt @ProChannel not yet transcribed (called from OZChannelBool3D @0x535f9/0x53611/0x53629/0x5365f/0x53679/0x53696/0x536db/0x53708/0x53733)");
  }
  /** OZChannel::setValue(CMTime const&, double, bool) — @ProChannel 0x?? (frontier: OZChannel). */
  setValue(_time: unknown, _v: number, _propagate: boolean): void {
    throw new Error("OZChannel::setValue @ProChannel not yet transcribed (called from OZChannelBool3D @0x53869/0x5389d/0x538de/0x537ea/0x53804/0x53827)");
  }
  /** OZChannel::setDefaultValue(double) — @ProChannel 0x?? (frontier: OZChannel). */
  setDefaultValue(_v: number): void {
    throw new Error("OZChannel::setDefaultValue @ProChannel not yet transcribed (called from OZChannelBool3D::setDefaultValue @0x53901/0x53915/0x53935)");
  }
  /** OZChannel::copy(OZChannelBase const*, bool) — @ProChannel 0x?? (frontier: OZChannel). */
  copy(_src: unknown, _b: boolean): void {
    throw new Error("OZChannel::copy @ProChannel not yet transcribed (called from OZChannelBool3D::copy @0x535b2/0x535c6/0x535e9)");
  }
  /**
   * Virtual slot +0x2c8 in OZChannelBool's vtable — called via `movq 0x2c8(%rax), %rax; jmpq *%rax`
   * from setX/setY/setZ (@0x5377e / 0x5379c / 0x537ba).  In FCP this dispatches to a base override
   * of setValue(CMTime, double, bool=false).  Frontier: cannot decode vtable slot without porting
   * OZChannelBool + its vtable extractor.
   */
  vslot_0x2c8_setValue(_time: unknown, _v: number, _propagate: boolean): void {
    throw new Error("OZChannelBool::vtable[+0x2c8] @ProChannel not yet transcribed (dispatched from OZChannelBool3D::setX/setY/setZ @0x5377e/0x5379c/0x537ba)");
  }
}

// ---------------------------------------------------------------------------------------------
// Opaque OZFactory / OZChannelFolder / PCString / CMTime types (kept structural — the 3D class
// never dereferences them itself; it passes them through to base/member ctors that are frontier).
// ---------------------------------------------------------------------------------------------
export type OZFactoryPtr = object | null | undefined;
export type OZChannelFolderPtr = object | null | undefined;
export type PCString = { readonly __pcstring: true } | string;   // opaque marker; content unused here
export type CMTime = unknown;                                    // struct { value: i64; timescale: i32; flags: u32; epoch: i64 }

// PCVector3<double> layout: three consecutive doubles at +0x00 / +0x08 / +0x10.  Confirmed by
// setValue(Vec3) @0x53846/0x53875/0x538a9 and getValue(Vec3) @0x53749/0x53752/0x5375c.
export interface PCVector3d { x: number; y: number; z: number; }

// ---------------------------------------------------------------------------------------------
// OZChannelBool3D
// ---------------------------------------------------------------------------------------------
export class OZChannelBool3D {
  /** Embedded per-axis channel at +0x88 (X).  Set by every ctor variant. */
  readonly x: OZChannelBool = new OZChannelBool();
  /** Embedded per-axis channel at +0x120 (Y).  Set by every ctor variant. */
  readonly y: OZChannelBool = new OZChannelBool();
  /** Embedded per-axis channel at +0x1B8 (Z).  Set by every ctor variant. */
  readonly z: OZChannelBool = new OZChannelBool();

  /**
   * OZChannelBool3D(OZFactory*, PCString const&, OZChannelFolder*, u32, u32, u32) — @ProChannel
   * 0x52dcc (C1 thunk -> C2).  BODY IS NOT DEFINED as a distinct symbol in the framework binary
   * (only the C1 exists at 0x52dcc, jumping to a C2 that isn't emitted separately).  In practice
   * this overload is unused / inlined at all call sites.  Faithful path: delegate to the (bool,
   * bool, bool, OZFactory*, ...) variant with the default triple (false,false,false) — but we
   * cannot invent that fallback; must throw citing @ProChannel 0x52dcc.
   */
  static make_from_factory_folder(_factory: OZFactoryPtr, _name: PCString, _folder: OZChannelFolderPtr,
                                  _u1: number, _u2: number, _u3: number): OZChannelBool3D {
    throw new Error("OZChannelBool3D::OZChannelBool3D(OZFactory*, PCString&, OZChannelFolder*, u32,u32,u32) @ProChannel 0x52dcc — C2 body absent from binary; not yet transcribed");
  }

  /**
   * OZChannelBool3D(bool xDef, bool yDef, bool zDef, OZFactory*, PCString const&,
   *                 OZChannelFolder*, u32, u32, u32) — @ProChannel 0x52dd6 (C2 body).
   * Body @0x52dd6..0x52f24: OZCompoundChannel::OZCompoundChannel(factory, name, folder, u1, u2,
   * false, u3) [@0x52e19], install two vptrs at +0x00/+0x10 [@0x52e1e/0x52e28], then for each
   * axis (X,Y,Z) fetch the localized display name via getProChannelBundle()+PCString(cfstring)
   * [@0x52e33/0x52e7f/0x52ecc], construct the embedded OZChannelBool at +0x88/+0x120/+0x1B8 with
   * (defaultBit, name, this, axisIndex=1|2|3, 0, nullptr, nullptr) [@0x52e71 / 0x52ebe / 0x52f08],
   * and destroy the temporary PCString [@0x52e7a / 0x52ec7 / 0x52f11].  Cleanup landing pads
   * unwind partially-constructed sub-objects (@0x52f25..0x52f77) via OZChannelBool::~OZChannelBool
   * and OZCompoundChannel::~OZCompoundChannel — both frontier.
   *
   * OZCompoundChannel + OZChannelBool + PCString + getProChannelBundle are all un-ported; a
   * faithful ctor cannot run without them, so we throw citing the address.  The TS-visible axis
   * fields (x/y/z) still exist as OZChannelBool stubs above so callers can hold references.
   */
  constructor();  // no-args synthesis (for TS type shape only — no FCP counterpart)
  constructor(xDef: boolean, yDef: boolean, zDef: boolean,
              factory: OZFactoryPtr, name: PCString, folder: OZChannelFolderPtr,
              u1: number, u2: number, u3: number);
  constructor(_xDef?: boolean, _yDef?: boolean, _zDef?: boolean,
              _factory?: OZFactoryPtr, _name?: PCString, _folder?: OZChannelFolderPtr,
              _u1?: number, _u2?: number, _u3?: number) {
    // The 6-arg (no-bool) and other ctor variants delegate through OZChannelBool3D_Factory::
    // getInstance() (@0x52fb1 / 0x53166) + OZCompoundChannel::OZCompoundChannel; all frontier.
    // Any real construction is intercepted below.
    if (arguments.length !== 0) {
      throw new Error("OZChannelBool3D::OZChannelBool3D(bool,bool,bool,OZFactory*,PCString&,OZChannelFolder*,u32,u32,u32) @ProChannel 0x52dd6 not yet transcribed (needs OZCompoundChannel + OZChannelBool + PCString + getProChannelBundle)");
    }
    // arguments.length === 0: no-op default construction (used by TS clone/copy helpers below).
    // OZChannelBool sub-objects were already default-constructed via the field initializers.
  }

  /**
   * OZChannelBool3D(bool xDef, bool yDef, bool zDef, PCString const&, OZChannelFolder*, u32,u32,u32)
   * — @ProChannel 0x52f86 (C2 body).
   * Body @0x52f86..0x530e0: fetch the singleton factory via OZChannelBool3D_Factory::getInstance()
   * [@0x52fb1], call OZCompoundChannel::OZCompoundChannel(factory, name, folder, u1, u2, false, u3)
   * [@0x52fd5], install vptrs [@0x52fda/0x52fe4], then per-axis mirror of the 0x52dd6 ctor
   * (bundle→PCString→OZChannelBool @+0x88/+0x120/+0x1B8).  Frontier deps: same as 0x52dd6.
   */
  static make_bbbnfjjj(_xDef: boolean, _yDef: boolean, _zDef: boolean,
                       _name: PCString, _folder: OZChannelFolderPtr,
                       _u1: number, _u2: number, _u3: number): OZChannelBool3D {
    throw new Error("OZChannelBool3D::OZChannelBool3D(bool,bool,bool,PCString&,OZChannelFolder*,u32,u32,u32) @ProChannel 0x52f86 not yet transcribed (needs OZChannelBool3D_Factory::getInstance + OZCompoundChannel)");
  }

  /**
   * OZChannelBool3D(PCString const&, OZChannelFolder*, u32, u32, u32) — @ProChannel 0x53142
   * (C2 body).  Body @0x53142..0x53293: identical shape to 0x52f86 but each axis uses
   * OZChannelBool::OZChannelBool(PCString&, OZChannelFolder*, u32,u32, OZChannelImpl*,
   * OZChannelInfo*) [@0x531e2 / 0x5322e / 0x53277] — the "no default bit" overload.  Frontier.
   */
  static make_snfjjj(_name: PCString, _folder: OZChannelFolderPtr,
                     _u1: number, _u2: number, _u3: number): OZChannelBool3D {
    throw new Error("OZChannelBool3D::OZChannelBool3D(PCString&,OZChannelFolder*,u32,u32,u32) @ProChannel 0x53142 not yet transcribed (needs OZChannelBool3D_Factory::getInstance + OZCompoundChannel + OZChannelBool)");
  }

  /**
   * OZChannelBool3D(OZFactory*, PCString const&, u32, u32) — @ProChannel 0x532f6 (C2 body).
   * Body @0x532f6..0x5340f: OZCompoundChannel::OZCompoundChannel(factory, name, u1, u2) [@0x53308]
   * — the "no folder / no bool" overload; then vptrs [@0x5330d/0x53317], and three
   * OZChannelBool(PCString&, this-as-folder, axisIndex, 0, nullptr, nullptr) constructions at
   * +0x88 / +0x120 / +0x1B8 [@0x53360 / 0x533ac / 0x533f5].  Frontier.
   */
  static make_fnjj(_factory: OZFactoryPtr, _name: PCString, _u1: number, _u2: number): OZChannelBool3D {
    throw new Error("OZChannelBool3D::OZChannelBool3D(OZFactory*,PCString&,u32,u32) @ProChannel 0x532f6 not yet transcribed (needs OZCompoundChannel + OZChannelBool)");
  }

  /**
   * OZChannelBool3D(OZChannelBool3D const& src, OZChannelFolder*) — @ProChannel 0x53472 (C2 body).
   * Body @0x53472..0x534ea:
   *   OZCompoundChannel::OZCompoundChannel(src, folder)                  [@0x53483]
   *   install vptrs                                                      [@0x53488 / 0x53492]
   *   OZChannelBool::OZChannelBool(src.x @+0x88,  this  as folder-owner) [@0x534af]
   *   OZChannelBool::OZChannelBool(src.y @+0x120, this)                  [@0x534c6]
   *   OZChannelBool::OZChannelBool(src.z @+0x1B8, this)                  [@0x534dd]
   * The `this` passed as third argument to each OZChannelBool copy-ctor is the FOLDER pointer
   * (an OZChannelBool3D IS-A OZChannelFolder via OZCompoundChannel).  Frontier deps still block
   * a real body.
   */
  static copy_ctor(_src: OZChannelBool3D, _folder: OZChannelFolderPtr): OZChannelBool3D {
    throw new Error("OZChannelBool3D::OZChannelBool3D(OZChannelBool3D const&, OZChannelFolder*) @ProChannel 0x53472 not yet transcribed (needs OZCompoundChannel + OZChannelBool copy-ctors)");
  }

  /**
   * clone() — @ProChannel 0x53522.  Body @0x53522..0x5354d:
   *   operator new(0x250)                              [@0x5352c call __Znwm]
   *   OZChannelBool3D::OZChannelBool3D(*this, nullptr) [@0x53541  C2 copy-ctor with folder=null]
   *   return the new pointer.
   * Unwind pad @0x5354e..0x53559 calls operator delete + _Unwind_Resume if the copy-ctor throws.
   */
  clone(): OZChannelBool3D {
    // operator new(0x250) then OZChannelBool3D::OZChannelBool3D(*this, nullptr).
    return OZChannelBool3D.copy_ctor(this, null);  // will throw citing 0x53472 until transcribed
  }

  /**
   * copy(OZChannelBase const* src, bool b) — @ProChannel 0x53562.  Body @0x53562..0x535e9:
   *   OZCompoundChannel::copy(src, b)                                                  [@0x53575]
   *   if (src != null) src = dynamic_cast<OZChannelBool3D*>(src) else src = null       [@0x5357f..0x535a1]
   *   OZChannel::copy(this+0x88 , src?src+0x88 :null, b)                                [@0x535b2]
   *   OZChannel::copy(this+0x120, src?src+0x120:null, b)                                [@0x535c6]
   *   tail-call OZChannel::copy(this+0x1B8, src?src+0x1B8:null, b)                     [@0x535e9]
   * (The tail-call adds 0x1B8 to both this and src via a single-register add.)
   * The dynamic_cast uses `typeinfo for OZChannelBase` [@0x5357f] as the source-type and
   * `typeinfo for OZChannelBool3D` [@0x53586] as the target-type; hint=0 [@0x53590].
   */
  copy(src: object | null, b: boolean): void {
    // OZCompoundChannel::copy(src, b) — frontier.
    this.__ozCompoundChannel_copy_stub(src, b);   // will throw citing OZCompoundChannel addr
    // dynamic_cast<OZChannelBool3D*>(src) via __dynamic_cast (@__cxxabiv1) @0xacea0 stub.
    let src3: OZChannelBool3D | null;
    if (src !== null && src !== undefined) {
      // In C++: __dynamic_cast(src, &typeinfo(OZChannelBase), &typeinfo(OZChannelBool3D), 0).
      src3 = (src instanceof OZChannelBool3D) ? src : null;
    } else {
      src3 = null;
    }
    // Then three OZChannel::copy calls on the embedded per-axis members.
    this.x.copy(src3 ? src3.x : null, b);
    this.y.copy(src3 ? src3.y : null, b);
    this.z.copy(src3 ? src3.z : null, b);
  }

  /** OZCompoundChannel::copy stub — frontier, cited by 0x53575. */
  private __ozCompoundChannel_copy_stub(_src: object | null, _b: boolean): void {
    throw new Error("OZCompoundChannel::copy @ProChannel not yet transcribed (called from OZChannelBool3D::copy @0x53575)");
  }

  /**
   * getX(CMTime const&, double) — @ProChannel 0x535ee.  Body @0x535ee..0x53604:
   *   this += 0x88                                                          [@0x535f2]
   *   eax = OZChannel::getValueAsInt(this, CMTime, tolerance) const         [@0x535f9]
   *   return (eax != 0)                                                     [@0x535fe setne %al]
   */
  getX(time: CMTime, tolerance: number): boolean {
    return this.x.getValueAsInt(time, tolerance) !== 0;
  }

  /** getY(CMTime const&, double) — @ProChannel 0x53606.  Same shape as getX with base+0x120. */
  getY(time: CMTime, tolerance: number): boolean {
    return this.y.getValueAsInt(time, tolerance) !== 0;
  }

  /** getZ(CMTime const&, double) — @ProChannel 0x5361e.  Same shape as getX with base+0x1B8. */
  getZ(time: CMTime, tolerance: number): boolean {
    return this.z.getValueAsInt(time, tolerance) !== 0;
  }

  /**
   * getValue(CMTime const&, bool*, bool*, bool*, double) — @ProChannel 0x53636.
   * Body @0x53636..0x536ae:
   *   getValueAsInt(this+0x88 , time, tol)  ; *outX = (eax != 0)   [@0x5365f setne (%r15)]
   *   getValueAsInt(this+0x120, time, tol)  ; *outY = (eax != 0)   [@0x53679 setne (%r14)]
   *   getValueAsInt(this+0x1B8, time, tol)  ; *outZ = (eax != 0)   [@0x53696 setne (%rbx)]
   * The double `tol` is spilled to -0x30(%rbp) between calls (@0x53644 / 0x53674 / 0x53691) —
   * just parameter preservation, no numeric transform.
   */
  getValueBool(time: CMTime, out: { x: boolean; y: boolean; z: boolean }, tolerance: number): void {
    out.x = this.x.getValueAsInt(time, tolerance) !== 0;
    out.y = this.y.getValueAsInt(time, tolerance) !== 0;
    out.z = this.z.getValueAsInt(time, tolerance) !== 0;
  }

  /**
   * getValue(CMTime const&, PCVector3<double>*, double) — @ProChannel 0x536b0.
   * Body @0x536b0..0x5376b:
   *   if (out == null) return                                             [@0x536b0 testq %rdx,%rdx / je 0x5376b]
   *   xmm0 = getValueAsInt(this+0x88 , time, tol)                         [@0x536db]
   *   xmm0 = (eax != 0) ? xmm0 : 0.0                                      [@0x536ef jne / xorps xmm0]
   *   stack[-0x38] = xmm0                                                 [@0x536f4 movsd]        // = X result
   *   pre-load 1.0 into xmm0 (Z default) from 0x5be40(%rip)              [@0x536e0 movsd]  const 1.0 @0xaf528
   *   stack[-0x20] = xmm0                                                 [@0x536e8 movsd]        // Z = 1.0 tentatively
   *   xmm0 = getValueAsInt(this+0x120, time, tol)                         [@0x53708]
   *   xmm0 = (eax != 0) ? 1.0 : 0.0                                       [@0x53715/0x53717]     const 1.0 reload
   *   stack[-0x30] = xmm0                                                 [@0x5371c]              // = Y result
   *   xmm0 = getValueAsInt(this+0x1B8, time, tol)                         [@0x53733]
   *   xmm0 = (eax != 0) ? xmm0 : 0.0                                      [@0x5373a jne / xorps]
   *   stack[-0x20] = xmm0 IF eax==0 (else keep pre-loaded 1.0)            [@0x5373c/0x5373f]     // = Z result
   *   *(double*)(out+0x00) = stack[-0x38]   (X)                           [@0x53749]
   *   *(double*)(out+0x08) = stack[-0x30]   (Y)                           [@0x53752]
   *   *(double*)(out+0x10) = stack[-0x20]   (Z)                           [@0x5375c]
   * Net effect: each component is 1.0 when the underlying int is non-zero, else 0.0.
   * (The 1.0 constant is the same @0xaf528 double = 0x3ff0000000000000 used to build the mask.)
   */
  getValueVec3(time: CMTime, out: PCVector3d | null, tolerance: number): void {
    // Guard: null-out is a silent no-op (@0x536b0 testq / je).
    if (out === null || out === undefined) return;
    // 1.0 constant: RIP-relative to instructions @0x536e8 and @0x5370d — both read the double at
    // 0xaf528 (value 1.0 = 0x3ff0000000000000).  Verified via army/tools/resolve.py const 0xaf528.
    const ONE = 1.0;
    const rx = this.x.getValueAsInt(time, tolerance);
    const xv = rx !== 0 ? ONE : 0.0;
    const ry = this.y.getValueAsInt(time, tolerance);
    const yv = ry !== 0 ? ONE : 0.0;
    const rz = this.z.getValueAsInt(time, tolerance);
    const zv = rz !== 0 ? ONE : 0.0;
    out.x = xv;
    out.y = yv;
    out.z = zv;
  }

  /**
   * setX(CMTime const&, double) — @ProChannel 0x5376c.  Body @0x5376c..0x53788:
   *   rax = *(void**)(this+0x88)              ; load vptr of embedded OZChannelBool.X   [@0x53770]
   *   this += 0x88                            ; shift `this` to the sub-object          [@0x53777]
   *   rax = *(void**)(rax + 0x2c8)            ; slot +0x2c8 (a virtual override)        [@0x5377e]
   *   edx = 0                                 ; propagate=false                         [@0x53785]
   *   jmpq *rax                               ; tail-call the resolved method           [@0x53788]
   * The virtual target overrides OZChannel::setValue with a boolean-clamping wrapper (in FCP);
   * without OZChannelBool's vtable this cannot be resolved.  Faithful shape: dispatch through
   * the frontier stub `vslot_0x2c8_setValue`, which throws citing this address.
   */
  setX(time: CMTime, v: number): void {
    this.x.vslot_0x2c8_setValue(time, v, false);
  }

  /** setY — @ProChannel 0x5378a.  Same shape as setX; base+0x120.  Vtable slot +0x2c8 [@0x5379c]. */
  setY(time: CMTime, v: number): void {
    this.y.vslot_0x2c8_setValue(time, v, false);
  }

  /** setZ — @ProChannel 0x537a8.  Same shape as setX; base+0x1B8.  Vtable slot +0x2c8 [@0x537ba]. */
  setZ(time: CMTime, v: number): void {
    this.z.vslot_0x2c8_setValue(time, v, false);
  }

  /**
   * setValue(CMTime const&, bool, bool, bool) — @ProChannel 0x537c6.  Body @0x537c6..0x53827:
   *   OZChannel::setValue(this+0x88 , time, (double)(int)xBool, false)   [@0x537ea]
   *   OZChannel::setValue(this+0x120, time, (double)(int)yBool, false)   [@0x53804]
   *   tail-call OZChannel::setValue(this+0x1B8, time, (double)(int)zBool, false) [@0x53827]
   * The bool→double conversion is a plain `cvtsi2sd` after the register-holding bool (edx/r14d/ebx)
   * is already 0 or 1 — no fabs mask, no epsilon compare (that's the Vec3 overload).
   */
  setValueBool(time: CMTime, xB: boolean, yB: boolean, zB: boolean): void {
    // cvtsi2sd on a 0/1 int -> exact 0.0 / 1.0.  No epsilon here.
    this.x.setValue(time, xB ? 1.0 : 0.0, false);
    this.y.setValue(time, yB ? 1.0 : 0.0, false);
    this.z.setValue(time, zB ? 1.0 : 0.0, false);
  }

  /**
   * setValue(CMTime const&, PCVector3<double> const&) — @ProChannel 0x5382c.
   * Body @0x5382c..0x538de:
   *   For each of vec.x @+0x00 / vec.y @+0x08 / vec.z @+0x10:
   *     xmm0 = load double at that offset                                 [@0x53846 / 0x53875 / 0x538a9]
   *     xmm0 &= 0x7fffffffffffffff              ; |v|  (mask @0xb0390)   [@0x5384a / 0x5387b / 0x538af]
   *     xmm0 = (xmm0 >= 1e-07) ? all-1s : all-0s ; cmpnltsd (mask @0xb03b0=1e-07) [@0x53852 / 0x53883 / 0x538b7]
   *     xmm1 = 1.0                              ; movsd from @0xaf528     [@0x5385b / 0x5388c / 0x538c0]
   *     xmm0 &= xmm1                            ; -> 1.0 or 0.0           [@0x53863 / 0x53894 / 0x538c8]
   *     OZChannel::setValue(this+0x88/+0x120/+0x1B8, time, xmm0, false)
   * Constants verified via army/tools/resolve.py const:
   *   @0xb0390  = 0x7fffffffffffffff  (abs-value mask)
   *   @0xb03b0  = 1e-07                (double epsilon threshold)
   *   @0xaf528  = 1.0                  (result magnitude)
   * A double IS truthy when |v| >= 1e-07; otherwise 0.  (Not v!=0 — an explicit epsilon.)
   */
  setValueVec3(time: CMTime, v: PCVector3d): void {
    // The per-lane transform: v -> (|v| >= 1e-07) ? 1.0 : 0.0.
    // NOT `v !== 0`: FCP uses a 1e-07 epsilon window centered on 0 in setValueVec3.
    const EPS = 1e-07;   // @ProChannel 0xb03b0 (movsd const, cited above)
    const boolify = (d: number): number => (Math.abs(d) >= EPS ? 1.0 : 0.0);
    this.x.setValue(time, boolify(v.x), false);
    this.y.setValue(time, boolify(v.y), false);
    this.z.setValue(time, boolify(v.z), false);
  }

  /**
   * setDefaultValue(bool xD, bool yD, bool zD) — @ProChannel 0x538e4.  Body @0x538e4..0x53935:
   *   OZChannel::setDefaultValue(this+0x88 , (double)(int)xD)   [cvtsi2sd esi -> xmm0, @0x538fd/0x53901]
   *   OZChannel::setDefaultValue(this+0x120, (double)(int)yD)   [cvtsi2sd r14d -> xmm0, @0x53910/0x53915]
   *   tail-call OZChannel::setDefaultValue(this+0x1B8, (double)(int)zD) [cvtsi2sd ebx -> xmm0, @0x53924/0x53935]
   * (Register-transfer form of the bool: preserved as int in ebx/r14d/edx before cvt.)
   */
  setDefaultValue(xD: boolean, yD: boolean, zD: boolean): void {
    this.x.setDefaultValue(xD ? 1.0 : 0.0);
    this.y.setDefaultValue(yD ? 1.0 : 0.0);
    this.z.setDefaultValue(zD ? 1.0 : 0.0);
  }

  /**
   * getObjCWrapperName() — @ProChannel 0x5393a.  Body @0x5393a..0x53946:
   *   rax = <cfstring literal @rip + 0x9182b>   [@0x5393e]
   *   return rax
   * The CFString literal is the Objective-C wrapper class name FCP uses to bridge this channel to
   * NSKeyedArchiver / IB. otool's inline comment says `@"bad cfstring ref"` — the tool couldn't
   * resolve the literal contents.  Faithful port: return an OPAQUE reference (do NOT invent a
   * string — that would be an anti-shortcut P5 violation).  Callers who need the actual bridge
   * name must port the CFString extractor.
   */
  getObjCWrapperName(): unknown {
    throw new Error("OZChannelBool3D::getObjCWrapperName @ProChannel 0x5393a returns a CFString literal (rip+0x9182b) whose bytes are not yet extracted from the binary (otool prints 'bad cfstring ref')");
  }

  /**
   * ~OZChannelBool3D() — @ProChannel 0x53948 (D1 thunk), 0x53952 (D0), 0x539ec (D2 body).
   * D2 body @0x539ec..0x53a37:
   *   install vptrs +0x00/+0x10                                  [@0x539f5 / 0x539ff]
   *     (this is the standard "reset vptr to my own class before running my own dtor" step)
   *   OZChannelBool::~OZChannelBool(this+0x1B8)                  [@0x53a11]
   *   OZChannelBool::~OZChannelBool(this+0x120)                  [@0x53a1d]
   *   OZChannelBool::~OZChannelBool(this+0x88)                   [@0x53a29]
   *   tail-call OZCompoundChannel::~OZCompoundChannel(this)      [@0x53a37]
   * (Reverse of ctor order — Z, Y, X, then base.)  D1 (0x53948) tail-jumps D2.  D0 (0x53952) runs
   * D2 then operator delete.  Both frontier dependents (OZChannelBool + OZCompoundChannel dtors).
   */
  destroy(): void {
    // Faithful reverse order.  Both dtor stubs are frontier — this method exists for shape only.
    throw new Error("OZChannelBool3D::~OZChannelBool3D @ProChannel 0x539ec not yet transcribed (needs OZChannelBool + OZCompoundChannel destructors)");
  }
}
