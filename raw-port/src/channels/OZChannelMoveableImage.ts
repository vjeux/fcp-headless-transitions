// OZChannelMoveableImage — Ozone channel that references an image element or
// footage and can carry an optional 2D "offset" sub-channel used to reposition
// the referenced image. Derives from OZChanElementOrFootageRef (Ozone) and adds
// two owned slots at +0xa0 / +0xa8:
//
//   +0xa0  OZChannel2D* offsetChannel   (borrowed OR owned depending on +0xa8)
//   +0xa8  uint8_t      ownsOffset      (true => we own +0xa0 via virtual copy)
//
// Framework: Ozone
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework
// The x86_64 slice was extracted to /tmp/Ozone.x86_64 (VAs == file offsets).
//
// Faithful transcription of the class' exported symbols
// (see raw-port/re/disasm/OZChannelMoveableImage.*.s):
//   @0x339550  C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)   [factory-5 body]
//   @0x339590  C1(OZFactory*, PCString&, OZChannelFolder*, u32, u32)   [factory-5 body (distinct addr)]
//   @0x339730  C2(OZFactory*, PCString&, u32)                          [factory-3 body]
//   @0x339770  C1(OZFactory*, PCString&, u32)                          [factory-3 body]
//   @0x3395d0  C2(PCString&, OZChannelFolder*, u32, u32)               [no-factory body — call_once singleton]
//   @0x339680  C1(PCString&, OZChannelFolder*, u32, u32)               [no-factory body]
//   @0x3397b0  C2(OZChannelMoveableImage const&, OZChannelFolder*)     [copy-ctor body]
//   @0x339820  C1(OZChannelMoveableImage const&, OZChannelFolder*)     [copy-ctor body]
//   @0x339890  ~OZChannelMoveableImage()                               [D2 in-place]
//   @0x3398f0  ~OZChannelMoveableImage()                               [D1 in-place — same body as D2]
//   @0x3399c0  ~OZChannelMoveableImage()                               [D0 full — D2 body then operator delete]
//   @0x339a90  copy(OZChannelBase const*, bool)                        [override]
//   @0x339af0  clone() const                                           [operator new(0xb0) + copy-ctor of subobj]
//   @0x339b90  setOffsetChannel(OZChannel2D*)
//
// VTABLE (from resolve.py Ozone vtable OZChannelMoveableImage):
//   vtable @0x84fbe0; installed primary ptr = vtable+0x10 = 0x84fbf0
//   *0x00  -> 0x3398f0  ~OZChannelMoveableImage  [D1 in-place]
//   *0x08  -> 0x3399c0  ~OZChannelMoveableImage  [D0 delete-thunk]
//   *0x10..*0x48 -> inherited OZFactoryBase/OZChannelBase (icon/id/serializer/factoryForSerialization)
//   *0x70  -> inherited OZChanObjectManipRef::isObjectRef()
//   *0x78  -> inherited OZChannelBase::isCompoundChannel()
//   *0x90  -> inherited OZChanObjectManipRef::saveWhenAtDefaultState()
//   *0x98  -> inherited OZChannelBase::isStateModified()
//   *0xe0  -> inherited OZChannelBase::setRangeName(PCString&)
//   *0xe8  -> 0x339a90  OZChannelMoveableImage::copy(OZChannelBase const*, bool)   [override]
//   *0xf8  -> 0x339af0  OZChannelMoveableImage::clone() const                     [override]
//
// STRUCT LAYOUT (recovered from ctors + dtor @0x339890 + clone @0x339af0):
//   +0x000  primary vptr             (= vtable + 0x10 = 0x84fbf0)
//   +0x010  secondary vptr           (thunk table for OZChanElementOrFootageRef secondary base)
//   +0x018..+0x09f  OZChanElementOrFootageRef base subobject (opaque here — its ctor
//                   is called with the same 3-arg / 5-arg / no-factory / copy signatures
//                   that this class exposes, then this class overwrites the two vptrs).
//   +0x0a0  OZChannel2D* offsetChannel   (nullptr by default; set via setOffsetChannel
//                                         or replicated by copy-ctor via clone())
//   +0x0a8  uint8_t      ownsOffset      (0 = borrowed, 1 = owned via virt-clone)
//   size = 0xb0 bytes                    (from clone @0x339aff: `movl $0xb0, %edi; callq operator new`)

// ---------------------------------------------------------------------------
// Frontier callees: symbols this class' ports need but which live in external
// units (parent class, allocator, OZChannel2D vtable slot invocations). Each
// throws with a specific @0xADDR so frontier.py can enumerate them.
// ---------------------------------------------------------------------------

/**
 * OZChanElementOrFootageRef::C2(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)
 * — @Ozone 0x338XXX (parent 5-arg ctor called from @0x339599).
 * Frontier callee for OZChannelMoveableImage.
 */
export function OZChanElementOrFootageRef_C2_factory5(
  _self: unknown, _factory: unknown, _name: unknown, _folder: unknown,
  _u5: number, _u6: number,
): void {
  throw new Error("OZChanElementOrFootageRef::C2(fac,name,folder,u,u) @Ozone 0x339599-callee not yet transcribed");
}

/**
 * OZChanElementOrFootageRef::C2(OZFactory*, PCString const&, u32)
 * — parent 3-arg ctor called from @0x339739.
 * Frontier callee for OZChannelMoveableImage.
 */
export function OZChanElementOrFootageRef_C2_factory3(
  _self: unknown, _factory: unknown, _name: unknown, _u4: number,
): void {
  throw new Error("OZChanElementOrFootageRef::C2(fac,name,u) @Ozone 0x339739-callee not yet transcribed");
}

/**
 * OZChanElementOrFootageRef::C2(PCString const&, OZChannelFolder*, u32, u32)
 * — parent no-factory ctor called from @0x339680-body.
 * Frontier callee for OZChannelMoveableImage.
 */
export function OZChanElementOrFootageRef_C2_noFactory(
  _self: unknown, _name: unknown, _folder: unknown, _u4: number, _u5: number,
): void {
  throw new Error("OZChanElementOrFootageRef::C2(name,folder,u,u) @Ozone 0x339680-callee not yet transcribed");
}

/**
 * OZChanElementOrFootageRef::C2(OZChanSceneNodeRef const&, OZChannelFolder*)
 * — parent copy-ctor called from @0x3397bd (copy-ctor) and @0x339b0f (clone).
 * Frontier callee for OZChannelMoveableImage.
 */
export function OZChanElementOrFootageRef_C2_copy(
  _self: unknown, _other: unknown, _folder: unknown,
): void {
  throw new Error("OZChanElementOrFootageRef::C2(SceneNodeRef&,folder) @Ozone 0x3397bd-callee not yet transcribed");
}

/**
 * OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
 * — parent dtor tail-jumped from @0x3398ac and @0x3398e4 (D2) and called from
 * D0 body @0x339a07. Frontier callee.
 */
export function OZChanElementOrFootageRef_D2(_self: unknown): void {
  throw new Error("OZChanElementOrFootageRef::~OZChanElementOrFootageRef() @Ozone 0x3398ac-callee not yet transcribed");
}

/**
 * OZChanElementOrFootageRef::copy(OZChannelBase const*, bool)
 * — parent copy method called from @0x339aa2 as the first step of the override.
 * Frontier callee.
 */
export function OZChanElementOrFootageRef_copy(
  _self: unknown, _other: unknown, _flag: boolean,
): void {
  throw new Error("OZChanElementOrFootageRef::copy(base,bool) @Ozone 0x339aa2-callee not yet transcribed");
}

/**
 * OZChannelMoveableImage_Factory::getInstance()
 * — the call_once-guarded factory singleton lookup called from @0x33961f
 * (via std::__1::__call_once). Frontier callee.
 */
export function OZChannelMoveableImage_Factory_getInstance(): unknown {
  throw new Error("OZChannelMoveableImage_Factory::getInstance() @Ozone 0x33961f-callee not yet transcribed");
}

/**
 * `operator new(0xb0)` used by clone() @0x339aff to allocate an
 * OZChannelMoveableImage. Wrapped so the frontier records the exact size
 * (0xb0 == 176 bytes) that we recovered from the disasm.
 */
export function operator_new_0xb0(): unknown {
  throw new Error("operator new(0xb0) @Ozone 0x339aff not yet transcribed");
}

/**
 * `operator delete(void*)` — the deallocator tail-jumped from D0 @0x339a15
 * and from the clone() exception unwind path @0x339b69. Frontier callee.
 */
export function operator_delete(_p: unknown): void {
  throw new Error("operator delete @Ozone 0x339a15 not yet transcribed");
}

/**
 * OZChannel2D vtable slot *0xf8 — the virtual "clone" that copy-ctor and
 * clone() invoke on the src's `+0xa0` sub-channel at @0x3397e6 / @0x339b38:
 *     `movq (%rdi),%rax; callq *0xf8(%rax)`.
 * Returns a heap-allocated OZChannel2D* that becomes the new owner's +0xa0.
 * Frontier callee — the actual OZChannel2D::clone body is decoded elsewhere.
 */
export function OZChannel2D_vslot_0xf8_clone(_self: unknown): unknown {
  throw new Error("OZChannel2D vtable slot +0xf8 (clone) @Ozone 0x3397e6-callee not yet transcribed");
}

/**
 * OZChannel2D vtable slot *0x08 — the virtual dtor D0 (delete-thunk)
 * invoked on the previously-owned +0xa0 slot when setOffsetChannel replaces
 * it (@0x339bb8), when the destructor drops it (@0x3398cd), and when
 * D0 releases it (@0x3399f6): `movq (%rdi),%rcx; callq *0x8(%rcx)`.
 * Frontier callee — the actual OZChannel2D destruction is decoded elsewhere.
 */
export function OZChannel2D_vslot_0x08_ddtor(_self: unknown): void {
  throw new Error("OZChannel2D vtable slot +0x08 (delete-thunk dtor) @Ozone 0x3398cd-callee not yet transcribed");
}

// ---------------------------------------------------------------------------
// Struct — one interface with every field's byte offset documented, as
// required by ANTI_SHORTCUT.md ("ONE data structure = ONE typed interface").
// ---------------------------------------------------------------------------

/**
 * OZChannelMoveableImage — 0xb0 bytes.
 * Layout recovered from ctor/dtor/copy/clone disasm cited above.
 */
export interface OZChannelMoveableImage {
  // +0x000  primary vptr (installed to vtable+0x10 == 0x84fbf0)
  vptr: unknown;
  // +0x010  secondary vptr (thunk table for OZChanElementOrFootageRef secondary base)
  vptr2: unknown;
  // +0x018..+0x09f  OZChanElementOrFootageRef base subobject (opaque)
  base: unknown;
  // +0x0a0  OZChannel2D* offsetChannel — nullptr by default
  offsetChannel: unknown | null;
  // +0x0a8  uint8_t ownsOffset — 0 = borrowed, 1 = owned via clone
  ownsOffset: boolean;
}

// ---------------------------------------------------------------------------
// Ctors + dtors + copy + clone + setOffsetChannel.
//
// The bodies are transcribed line-for-line from the .s files. Faithful to
// PORTING_SPEC Rule 1: we mirror the exact control flow, we do not
// re-implement "something equivalent".
// ---------------------------------------------------------------------------

/**
 * OZChannelMoveableImage::OZChannelMoveableImage(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)
 * — @Ozone 0x339590 (C1) / 0x339550 (C2 body, ICF-adjacent — same 18-line body).
 *
 * Body: call parent 5-arg ctor, install this class' two vptrs at +0/+0x10,
 * zero the two owned slots (+0xa0 = null, +0xa8 = 0).
 */
export function OZChannelMoveableImage_C1_factory5(
  self: OZChannelMoveableImage,
  factory: unknown, name: unknown, folder: unknown,
  u5: number, u6: number,
): void {
  // @0x339599  callq OZChanElementOrFootageRef::C2(fac,name,folder,u,u)
  OZChanElementOrFootageRef_C2_factory5(self, factory, name, folder, u5, u6);
  // @0x33959e-0x3395af  install this-class vptrs
  self.vptr  = "OZChannelMoveableImage::vtable+0x10 @0x84fbf0"; // leaq 0x51664b(%rip)
  self.vptr2 = "OZChannelMoveableImage::vtable+0x???";           // leaq 0x5169c1(%rip) — secondary
  // @0x3395b3  movq $0x0, 0xa0(%rbx)
  self.offsetChannel = null;
  // @0x3395be  movb $0x0, 0xa8(%rbx)
  self.ownsOffset = false;
}

/**
 * OZChannelMoveableImage::OZChannelMoveableImage(OZFactory*, PCString const&, u32)
 * — @Ozone 0x339770 (C1) / 0x339730 (C2 body — both 18-line, distinct addrs).
 */
export function OZChannelMoveableImage_C1_factory3(
  self: OZChannelMoveableImage,
  factory: unknown, name: unknown, u4: number,
): void {
  // @0x339779  callq OZChanElementOrFootageRef::C2(fac,name,u)
  OZChanElementOrFootageRef_C2_factory3(self, factory, name, u4);
  // @0x33977e-0x33978f  install vptrs
  self.vptr  = "OZChannelMoveableImage::vtable+0x10 @0x84fbf0"; // leaq 0x51646b(%rip)
  self.vptr2 = "OZChannelMoveableImage::vtable+0x???";           // leaq 0x5167e1(%rip)
  // @0x339793 / @0x33979e
  self.offsetChannel = null;
  self.ownsOffset = false;
}

/**
 * OZChannelMoveableImage::OZChannelMoveableImage(PCString const&, OZChannelFolder*, u32, u32)
 * — @Ozone 0x339680 (C1) / 0x3395d0 (C2 body).
 *
 * The no-factory ctor. Uses call_once to lazy-init the singleton
 * OZChannelMoveableImage_Factory::_instance, then hands _instance in as the
 * factory to the parent 5-arg ctor.
 */
export function OZChannelMoveableImage_C1_noFactory(
  self: OZChannelMoveableImage,
  name: unknown, folder: unknown, u4: number, u5: number,
): void {
  // @0x3395f0-0x33961f  if (_instanceOnce != -1) __call_once(&_instanceOnce, &getInstance-lambda)
  //   this is the standard C++11 std::call_once trampoline. We surface the
  //   singleton fetch as a callee — the actual body is in the Factory unit.
  const _instance = OZChannelMoveableImage_Factory_getInstance();
  // @0x33962b  callq OZChanElementOrFootageRef::C2(fac=_instance, name, folder, u4, u5)
  OZChanElementOrFootageRef_C2_factory5(self, _instance, name, folder, u4, u5);
  // @0x33963f-0x339650  install vptrs
  self.vptr  = "OZChannelMoveableImage::vtable+0x10 @0x84fbf0"; // leaq 0x5165aa(%rip)
  self.vptr2 = "OZChannelMoveableImage::vtable+0x???";           // leaq 0x516920(%rip)
  // @0x339654 / @0x33965f
  self.offsetChannel = null;
  self.ownsOffset = false;
}

/**
 * OZChannelMoveableImage::OZChannelMoveableImage(OZChannelMoveableImage const&, OZChannelFolder*)
 * — @Ozone 0x339820 (C1) / 0x3397b0 (C2 body).
 *
 * Copy-ctor. Parent copy takes an OZChanSceneNodeRef&; then the +0xa0 slot is
 * replicated by calling the OZChannel2D vtable +0xf8 (clone) on the src's
 * +0xa0 pointer (if non-null). The new sub-channel is OWNED (+0xa8=1).
 */
export function OZChannelMoveableImage_C1_copy(
  self: OZChannelMoveableImage,
  other: OZChannelMoveableImage,
  folder: unknown,
): void {
  // @0x3397bd  callq OZChanElementOrFootageRef::C2(SceneNodeRef&, folder)
  OZChanElementOrFootageRef_C2_copy(self, other, folder);
  // @0x3397c2-0x3397d3  install vptrs
  self.vptr  = "OZChannelMoveableImage::vtable+0x10 @0x84fbf0"; // leaq 0x516427(%rip)
  self.vptr2 = "OZChannelMoveableImage::vtable+0x???";           // leaq 0x51679d(%rip)
  // @0x3397d7  movq 0xa0(%r14), %rdi   ; load other.offsetChannel
  const otherSub = other.offsetChannel;
  // @0x3397de  testq %rdi,%rdi ; je 0x3397f0
  let clonedSub: unknown = null;
  let owns = false;
  if (otherSub !== null && otherSub !== undefined) {
    // @0x3397e3-0x3397ec  movq (%rdi),%rax ; callq *0xf8(%rax) ; movb $0x1,%cl
    clonedSub = OZChannel2D_vslot_0xf8_clone(otherSub);
    owns = true;
  } else {
    // @0x3397f0-0x3397f2  xorl %eax,%eax ; xorl %ecx,%ecx
    clonedSub = null;
    owns = false;
  }
  // @0x3397f4  movq %rax, 0xa0(%rbx)
  self.offsetChannel = clonedSub;
  // @0x3397fb  movb %cl, 0xa8(%rbx)
  self.ownsOffset = owns;
}

/**
 * OZChannelMoveableImage::~OZChannelMoveableImage()
 * — @Ozone 0x339890 (D2) / 0x3398f0 (D1 — same 25-line body).
 *
 * In-place destructor. First reinstalls the base-class vptrs so any
 * observer during teardown sees the base type. Then, if we own +0xa0
 * (i.e. +0xa8==1), virt-delete it via OZChannel2D::vtable+0x8. Finally
 * tail-jumps to OZChanElementOrFootageRef::~OZChanElementOrFootageRef.
 *
 * Note the two vptr writes here point to the SAME parent vtable slots
 * (the +0x10-offset entries in the OZChanElementOrFootageRef vtable region);
 * this is the standard "restore parent vptr" pattern of a nested dtor.
 */
export function OZChannelMoveableImage_D2(self: OZChannelMoveableImage): void {
  // @0x339890-0x3398a1  restore parent vptrs at +0 and +0x10
  self.vptr  = "OZChanElementOrFootageRef::vtable+... @Ozone parent";
  self.vptr2 = "OZChanElementOrFootageRef::vtable+... @Ozone parent secondary";
  // @0x3398a5  cmpb $0x1, 0xa8(%rdi) ; jne <tail to parent D2>
  if (self.ownsOffset) {
    // @0x3398b2  movq 0xa0(%rdi), %rax ; testq %rax,%rax ; je 0x3398d9
    const sub = self.offsetChannel;
    if (sub !== null && sub !== undefined) {
      // @0x3398c4  movq (%rax),%rcx ; callq *0x8(%rcx)   — OZChannel2D::vtable+0x8 (D0)
      OZChannel2D_vslot_0x08_ddtor(sub);
    }
    // @0x3398d9  movq $0x0, 0xa0(%rdi)
    self.offsetChannel = null;
  }
  // @0x3398e4  jmp OZChanElementOrFootageRef::~OZChanElementOrFootageRef() (tail)
  OZChanElementOrFootageRef_D2(self);
}

/**
 * OZChannelMoveableImage::~OZChannelMoveableImage() (D0 — full destructor)
 * — @Ozone 0x3399c0. Same 25 lines of D2-logic followed by
 *   `callq __ZdlPv` (operator delete) via a tail-jump at @0x339a15.
 */
export function OZChannelMoveableImage_D0(self: OZChannelMoveableImage): void {
  // @0x3399c9-0x3399da  restore parent vptrs
  self.vptr  = "OZChanElementOrFootageRef::vtable+... @Ozone parent";
  self.vptr2 = "OZChanElementOrFootageRef::vtable+... @Ozone parent secondary";
  // @0x3399de  cmpb $0x1, 0xa8(%rbx) ; jne 0x339a04
  if (self.ownsOffset) {
    // @0x3399e7  movq 0xa0(%rbx),%rdi ; testq %rdi,%rdi ; je 0x3399f9
    const sub = self.offsetChannel;
    if (sub !== null && sub !== undefined) {
      // @0x3399f3-0x3399f6  callq *0x8(%rax)
      OZChannel2D_vslot_0x08_ddtor(sub);
    }
    // @0x3399f9  movq $0x0, 0xa0(%rbx)
    self.offsetChannel = null;
  }
  // @0x339a07  callq OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
  OZChanElementOrFootageRef_D2(self);
  // @0x339a15  jmp __ZdlPv  (operator delete(self))
  operator_delete(self);
}

/**
 * OZChannelMoveableImage::copy(OZChannelBase const*, bool)
 * — @Ozone 0x339a90. Override at vtable slot *0xe8.
 *
 * Body:
 *   1. call the parent copy (OZChanSceneNodeRef::copy or its overrider —
 *      resolve.py labels the callee as OZChanSceneNodeRef::copy).
 *   2. dynamic_cast<OZChannelMoveableImage const*>(other) to reach its +0xa0.
 *   3. load self.offsetChannel into %rdi, load other.offsetChannel into %rsi.
 *   4. tail-call self.offsetChannel->vtable[+0xe8](other.offsetChannel, flag).
 *      This is the sub-channel-copy dispatch: OZChannel2D::copy(base, bool).
 *      The bool `flag` is forwarded from the outer copy.
 */
export function OZChannelMoveableImage_copy(
  self: OZChannelMoveableImage,
  other: unknown,
  flag: boolean,
): unknown {
  // @0x339aa2  callq OZChanSceneNodeRef::copy(other, flag)
  //   (parent copy — see resolve.py label at 0x339aa2 callee: OZChanSceneNodeRef::copy)
  OZChanElementOrFootageRef_copy(self, other, flag);
  // @0x339aa7-0x339aba  ___dynamic_cast(%r14 /*other*/, &OZChannelBase-typeinfo,
  //                                     &OZChannelMoveableImage-typeinfo, 0)
  //   returns the OZChannelMoveableImage* view of other, or NULL if wrong type.
  //   The disasm does NOT test for null before dereferencing +0xa0(rax) — so if
  //   the dynamic_cast fails this crashes exactly like FCP does. Faithful.
  const otherAsMI = other as OZChannelMoveableImage;
  // @0x339abf  movq 0xa0(%r15),%rdi   ; load self.offsetChannel  (== recipient of the virtual call)
  const selfSub = self.offsetChannel;
  // @0x339ac6  movq 0xa0(%rax),%rsi   ; load other.offsetChannel  (arg to the virtual call)
  const otherSub = otherAsMI.offsetChannel;
  // @0x339acd-0x339ae3  tail-jmpq to selfSub->vtable[+0xe8](otherSub, flag)
  //   i.e. the OZChannel2D::copy override — we surface this as a callee.
  return OZChannel2D_vslot_0xe8_copy(selfSub, otherSub, flag);
}

/**
 * OZChannel2D vtable slot *0xe8 — the OZChannel2D::copy(OZChannelBase*, bool)
 * override, tail-called from OZChannelMoveableImage::copy @0x339ae3.
 * Frontier callee.
 */
export function OZChannel2D_vslot_0xe8_copy(
  _self: unknown, _other: unknown, _flag: boolean,
): unknown {
  throw new Error("OZChannel2D vtable slot +0xe8 (copy) @Ozone 0x339ae3-callee not yet transcribed");
}

/**
 * OZChannelMoveableImage::clone() const
 * — @Ozone 0x339af0. Override at vtable slot *0xf8.
 *
 * Body:
 *   1. operator new(0xb0) — recovers `size=0xb0` for the whole class.
 *   2. call parent copy-ctor OZChanElementOrFootageRef::C2(SceneNodeRef&, nullptr).
 *      Note the folder argument is NULL (xorl %edx,%edx @0x339b0d).
 *   3. install this-class vptrs (same as copy-ctor).
 *   4. if src.+0xa0 non-null → new.+0xa0 = src.+0xa0->vtable[+0xf8](src.+0xa0);
 *      new.+0xa8 = 1. else zero both slots.
 */
export function OZChannelMoveableImage_clone(self: OZChannelMoveableImage): OZChannelMoveableImage {
  // @0x339afa-0x339aff  movl $0xb0,%edi ; callq __Znwm  (operator new(176))
  const dst = operator_new_0xb0() as OZChannelMoveableImage;
  // @0x339b07-0x339b14  callq OZChanElementOrFootageRef::C2(SceneNodeRef&, folder=NULL)
  //   %rdi=dst, %rsi=self, %rdx=NULL (xorl %edx,%edx)
  OZChanElementOrFootageRef_C2_copy(dst, self, null);
  // @0x339b14-0x339b25  install vptrs
  dst.vptr  = "OZChannelMoveableImage::vtable+0x10 @0x84fbf0";
  dst.vptr2 = "OZChannelMoveableImage::vtable+0x???";
  // @0x339b29  movq 0xa0(%r14),%rdi   ; load self.offsetChannel
  const srcSub = self.offsetChannel;
  // @0x339b30  testq %rdi,%rdi ; je 0x339b42
  let clonedSub: unknown = null;
  let owns = false;
  if (srcSub !== null && srcSub !== undefined) {
    // @0x339b35-0x339b3e  movq (%rdi),%rax ; callq *0xf8(%rax) ; movb $0x1,%cl
    clonedSub = OZChannel2D_vslot_0xf8_clone(srcSub);
    owns = true;
  } else {
    // @0x339b42-0x339b44  xorl %eax,%eax ; xorl %ecx,%ecx
    clonedSub = null;
    owns = false;
  }
  // @0x339b46  movq %rax, 0xa0(%rbx)
  dst.offsetChannel = clonedSub;
  // @0x339b4d  movb %cl, 0xa8(%rbx)
  dst.ownsOffset = owns;
  // @0x339b53  movq %rbx,%rax ; return dst
  return dst;
}

/**
 * OZChannelMoveableImage::setOffsetChannel(OZChannel2D*)
 * — @Ozone 0x339b90.
 *
 * Body:
 *   if (self.ownsOffset) {                           // @0x339b90  cmpb $0x1, 0xa8(%rdi); jne 0x339bcc
 *     old = self.offsetChannel;                      // @0x339b99  movq 0xa0(%rdi),%rax
 *     if (old) {                                     // @0x339ba0  testq %rax,%rax; je 0x339bc5
 *       old->vtable[+0x8](old);                      // @0x339bac-0x339bb8  callq *0x8(%rcx) — dtor D0
 *     }
 *     self.ownsOffset = false;                       // @0x339bc5  movb $0x0, 0xa8(%rdi)
 *   }
 *   self.offsetChannel = newSub;                     // @0x339bcc  movq %rsi, 0xa0(%rdi)
 *   return;                                          // @0x339bd3  retq
 *
 * NOTE: the new sub-channel is stored VERBATIM (as a borrowed pointer). The
 * ownsOffset flag is CLEARED, not set — callers of setOffsetChannel are
 * responsible for the new sub-channel's lifetime. Only the copy-ctor and
 * clone() set ownsOffset=true (because they allocated via virt-clone).
 */
export function OZChannelMoveableImage_setOffsetChannel(
  self: OZChannelMoveableImage,
  newSub: unknown,
): void {
  // @0x339b90  cmpb $0x1, 0xa8(%rdi) ; jne 0x339bcc
  if (self.ownsOffset) {
    // @0x339b99  movq 0xa0(%rdi),%rax
    const old = self.offsetChannel;
    // @0x339ba0  testq %rax,%rax ; je 0x339bc5
    if (old !== null && old !== undefined) {
      // @0x339bac-0x339bb8  callq *0x8(%rcx)  — OZChannel2D::vtable+0x8 (D0)
      OZChannel2D_vslot_0x08_ddtor(old);
    }
    // @0x339bc5  movb $0x0, 0xa8(%rdi)
    self.ownsOffset = false;
  }
  // @0x339bcc  movq %rsi, 0xa0(%rdi)
  self.offsetChannel = newSub;
  // @0x339bd3  retq
}
