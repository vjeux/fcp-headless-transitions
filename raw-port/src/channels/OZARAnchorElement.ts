// OZARAnchorElement — faithful transcription of the Ozone OZARAnchorElement
// scene-element class. This is a thin subclass of OZ3DEngineSceneElement (which
// itself inherits from OZSceneNode / OZFactoryBase multi-inheritance chain, per
// the class vtable at Ozone 0x886650). Only OZARAnchorElement's own methods are
// ported here — every parent-class hop tail-calls into an un-ported class and
// therefore lands on a throwing stub that cites its @0xADDR.
//
// Source disasm (all in raw-port/re/disasm/):
//   OZARAnchorElement.OZARAnchorElement.s      C2 ctor            @Ozone 0x62c720
//   OZARAnchorElement.operator==.s             operator==         @Ozone 0x62c7e0
//   OZARAnchorElement.operator=.s              operator= (thunk)  @Ozone 0x62c7f0
//   OZARAnchorElement.getIconName.s            getIconName (thunk)@Ozone 0x62c800
//   OZARAnchorElement.getIconNameBW.s          getIconNameBW      @Ozone 0x62c820
//   OZARAnchorElement.getIconID.s              getIconID          @Ozone 0x62c840
//   OZARAnchorElement.description.s            description        @Ozone 0x62c850
//   OZARAnchorElement.unlocalizedDescription.s unlocalizedDesc    @Ozone 0x62c880
//   OZARAnchorElement.calcStaticHash.s         calcStaticHash     @Ozone 0x62c8a0
//   OZARAnchorElement.calcHashForState.s       calcHashForState   @Ozone 0x62c8c0
//
// Vtable (from raw-port/army/tools/resolve.py Ozone vtable, base @0x886650,
// installed-ptr @0x886660):
//   *0x00 -> 0x6dc4f0  ~OZARAnchorElement (D1)      // ICF-folded, not transcribed
//   *0x08 -> 0x6dc530  ~OZARAnchorElement (D0)      // body = ud2 (never called)
//   *0x10 -> 0x62c800  getIconName() const
//   *0x18 -> 0x62c820  getIconNameBW() const
//   *0x20 -> 0x62c840  getIconID() const
//   *0x28 -> 0x1fb00   OZFactoryBase::getLibraryIconName() const   (parent)
//   *0x30 -> 0x62c850  description()
//   ... (parent-class slots below, see vtable.py output)
//
// CFConstantString targets (bytes from raw fat-slice, x86_64 slice at file
// offset 0x4000; struct layout isa/flags/ptr/length):
//   @Ozone 0x8AF6D0  cfstring for description:            key = "3D Scene Element Short Desc" (len 27)
//   @Ozone 0x8AF6B0  cfstring for getIconNameBW:          value = "M_LayersList_ObjectIconGrey-3DObject" (len 36)
//   @Ozone 0x7C6DEF  C-string literal for unlocalizedDescription: "3D Scene Element Short Desc"
//
// DECODE evidence for every hex/immediate below is documented alongside the
// method that reads it — this file is grounded per gate P2.

// ---------------------------------------------------------------------------
// Frontier classes referenced by tail-calls / vtable installs. Each throws
// citing the exact @0xADDR the disasm hands off to, so frontier.py sees the
// gap and no faithful body is silently paraphrased here.
// ---------------------------------------------------------------------------

/** PCString — Ozone's CoW string wrapper. Constructors used:
 *   __ZN8PCStringC1EPKc                @Ozone stub 0x6df09c  (from C-string)
 *   __ZN8PCStringC1EPK10__CFString     @Ozone stub 0x6df084  (from CFString)
 *   __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_ @Ozone stub 0x6df08a
 *       (localized: key, bundle, table-name)
 * Not yet transcribed. */
export class PCString {
  constructor(_arg?: unknown, _bundle?: unknown, _table?: unknown) {
    throw new Error("PCString ctor @Ozone stub 0x6df084/0x6df08a/0x6df09c not yet transcribed");
  }
}

/** OZ3DEngineSceneElement — direct base class. Its C2 constructor
 *  (`__ZN22OZ3DEngineSceneElementC2EP9OZFactoryRK8PCStringj`) is called first
 *  thing in OZARAnchorElement::C2 at @Ozone 0x62c729, and its operator=,
 *  calcStaticHash, calcHashForState are the tail-call targets of the
 *  OZARAnchorElement thunks at 0x62c7f5, 0x62c8a5, 0x62c8c5 respectively. */
export class OZ3DEngineSceneElement {
  constructor(_factory: unknown, _name: PCString, _flags: number) {
    throw new Error("OZ3DEngineSceneElement::OZ3DEngineSceneElement(OZFactory*, PCString const&, unsigned int) @Ozone 0x62c729 (tail-call target) not yet transcribed");
  }
  assign(_rhs: unknown): void {
    // tail-call target of OZARAnchorElement::operator= @Ozone 0x62c7f5
    throw new Error("OZ3DEngineSceneElement::operator=(OZSceneNode const&) @Ozone 0x62c7f5 (tail-call target) not yet transcribed");
  }
  calcStaticHash(_stream: unknown, _list: unknown): void {
    // tail-call target of OZARAnchorElement::calcStaticHash @Ozone 0x62c8a5
    throw new Error("OZ3DEngineSceneElement::calcStaticHash(PCSerializerWriteStream&, list<OZObjectManipulator*>&) @Ozone 0x62c8a5 (tail-call target) not yet transcribed");
  }
  calcHashForState(_stream: unknown, _params: unknown, _list: unknown, _flag: boolean): void {
    // tail-call target of OZARAnchorElement::calcHashForState @Ozone 0x62c8c5
    throw new Error("OZ3DEngineSceneElement::calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, list<OZObjectManipulator*>&, bool) @Ozone 0x62c8c5 (tail-call target) not yet transcribed");
  }
}

/** OZFactory pointer — opaque. Passed through the ctor untouched. */
export type OZFactoryPtr = unknown;

// ---------------------------------------------------------------------------
// OZARAnchorElement itself.
// ---------------------------------------------------------------------------

export class OZARAnchorElement extends OZ3DEngineSceneElement {
  // vptr slots installed at the tail of the C2 ctor (see decode below).
  // These names match the multi-inheritance layout implied by the vtable at
  // Ozone 0x886650 — we don't invent field semantics beyond storing the raw
  // installed pointer addresses.
  //   vptr_main   installed at (this+0x0000)  = &Ozone_vtable[+0x10] = 0x886660
  //   vptr_10     installed at (this+0x0010)  = 0x886f80
  //   vptr_28     installed at (this+0x0028)  = 0x8871d8
  //   vptr_1978   installed at (this+0x1978)  = 0x887230
  // Provenance for each address:
  //   0x886660 = 0x62c735 + 0x259f2b   (leaq 0x259f2b(%rip),%rax at 0x62c72e)
  //   0x886f80 = 0x62c73f + 0x25a841   (leaq 0x25a841(%rip),%rax at 0x62c738)
  //   0x8871d8 = 0x62c74a + 0x25aa8e   (leaq 0x25aa8e(%rip),%rax at 0x62c743)
  //   0x887230 = 0x62c755 + 0x25aadb   (leaq 0x25aadb(%rip),%rax at 0x62c74e)
  vptr_main: number = 0x886660;
  vptr_10:   number = 0x886f80;
  vptr_28:   number = 0x8871d8;
  vptr_1978: number = 0x887230;
  // Zeroed 16-byte cleared region at (this+0x56c0) — `xorps %xmm0,%xmm0; movups %xmm0,0x56c0(%rbx)`
  // at 0x62c75c/0x62c75f. Purpose un-decoded (parent-class field); we mirror the zero-init.
  field_56c0_lo: bigint = 0n;
  field_56c0_hi: bigint = 0n;

  /**
   * OZARAnchorElement::OZARAnchorElement(OZFactory*, PCString const&, unsigned int)
   * @Ozone 0x62c720  (mangled __ZN17OZARAnchorElementC2EP9OZFactoryRK8PCStringj)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.OZARAnchorElement.s):
   *   0x62c729 callq  OZ3DEngineSceneElement::C2(OZFactory*, PCString const&, unsigned int)
   *   0x62c72e leaq   0x259f2b(%rip), %rax        ; %rax = &vtable+0x10 = 0x886660
   *   0x62c735 movq   %rax, (%rbx)                ; this->vptr_main   <- 0x886660
   *   0x62c738 leaq   0x25a841(%rip), %rax        ; %rax = 0x886f80
   *   0x62c73f movq   %rax, 0x10(%rbx)            ; this->vptr_10     <- 0x886f80
   *   0x62c743 leaq   0x25aa8e(%rip), %rax        ; %rax = 0x8871d8
   *   0x62c74a movq   %rax, 0x28(%rbx)            ; this->vptr_28     <- 0x8871d8
   *   0x62c74e leaq   0x25aadb(%rip), %rax        ; %rax = 0x887230
   *   0x62c755 movq   %rax, 0x1978(%rbx)          ; this->vptr_1978   <- 0x887230
   *   0x62c75c xorps  %xmm0,%xmm0                 ; 128-bit zero
   *   0x62c75f movups %xmm0, 0x56c0(%rbx)         ; clear 16 bytes at +0x56c0
   *   0x62c766 ret
   *
   * Note: the ctor RETURNS %rbx (this) in %rax — standard C2 convention;
   * TS constructor return is implicit `this`.
   */
  constructor(factory: OZFactoryPtr, name: PCString, flags: number) {
    // Base OZ3DEngineSceneElement ctor (tail-called through a throwing stub —
    // that class is a frontier). This means the CTOR itself will throw once
    // invoked. That is the correct faithful state per PORTING_SPEC Rule 3:
    // silence is a defect; a loud gap is correct.
    super(factory, name, flags);
    // The four vtable-pointer installs and the +0x56c0 clear happen after
    // super() returns. Under the current frontier state they are unreachable
    // in practice, but we model them so the layout is transcribed:
    this.vptr_main = 0x886660;
    this.vptr_10   = 0x886f80;
    this.vptr_28   = 0x8871d8;
    this.vptr_1978 = 0x887230;
    this.field_56c0_lo = 0n;
    this.field_56c0_hi = 0n;
  }

  /**
   * OZARAnchorElement::operator==(OZARAnchorElement const&)
   * @Ozone 0x62c7e0  (mangled __ZN17OZARAnchorElementeqERKS_)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.operator==.s):
   *   0x62c7e0 push %rbp / mov %rsp,%rbp
   *   0x62c7e4 movb   $0x1, %al           ; %al <- 1
   *   0x62c7e6 pop %rbp / ret
   *
   * The comparison unconditionally returns true. Any two OZARAnchorElement
   * instances compare equal by design (the anchor is a singleton-role marker;
   * no per-instance state participates in equality).
   */
  static readonly EQ_ALWAYS_TRUE = 1; // sourced from the movb $0x1 immediate @0x62c7e4
  equals(_rhs: OZARAnchorElement): boolean {
    return OZARAnchorElement.EQ_ALWAYS_TRUE === 1;
  }

  /**
   * OZARAnchorElement::operator=(OZSceneNode const&)
   * @Ozone 0x62c7f0  (mangled __ZN17OZARAnchorElementaSERK11OZSceneNode)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.operator=.s):
   *   0x62c7f0 push %rbp / mov %rsp,%rbp / pop %rbp
   *   0x62c7f5 jmp OZ3DEngineSceneElement::operator=(OZSceneNode const&)
   *
   * Pure tail-jump into the parent — no own-class work. The parent is a
   * frontier class; we route through its throwing stub.
   */
  assign(rhs: unknown): void {
    // tail-call: jmp OZ3DEngineSceneElement::operator= @Ozone 0x62c7f5
    super.assign(rhs);
  }

  /**
   * OZARAnchorElement::getIconName() const
   * @Ozone 0x62c800  (mangled __ZNK17OZARAnchorElement11getIconNameEv)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.getIconName.s):
   *   0x62c800 push %rbp / mov %rsp,%rbp / push %rbx / push %rax
   *   0x62c806 movq %rdi, %rbx                ; %rbx = &return-slot (PCString*)
   *   0x62c809 movq (%rsi), %rax              ; %rax = *(this->vptr_main)
   *   0x62c80c callq *0x18(%rax)              ; virtual dispatch: vtable[3] = getIconNameBW
   *   0x62c80f movq %rbx, %rax                ; return the return-slot pointer
   *
   * Because vtable slot *0x18 on this class resolves to
   * OZARAnchorElement::getIconNameBW (see the vtable dump in the file header),
   * getIconName is a virtual redirect to getIconNameBW. Under normal FCP
   * behavior a subclass could override *0x18 and get a different icon here —
   * that's the point of the virtual call — but for OZARAnchorElement itself
   * the dispatch lands on our own getIconNameBW.
   */
  getIconName(): PCString {
    // callq *0x18(%rax) — virtual through vtable[3]. For this exact class the
    // resolved target is getIconNameBW @Ozone 0x62c820 (see vtable @0x886650).
    return this.getIconNameBW();
  }

  /**
   * OZARAnchorElement::getIconNameBW() const
   * @Ozone 0x62c820  (mangled __ZNK17OZARAnchorElement13getIconNameBWEv)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.getIconNameBW.s):
   *   0x62c820 push %rbp / mov %rsp,%rbp / push %rbx / push %rax
   *   0x62c826 movq %rdi, %rbx                ; %rbx = &return-slot (PCString*)
   *   0x62c829 leaq 0x282e80(%rip), %rsi      ; %rsi = 0x8AF6B0 (CFConstantString)
   *   0x62c830 callq PCString::PCString(CFStringRef const*)   @Ozone stub 0x6df084
   *   0x62c835 movq %rbx, %rax                ; return the return-slot
   *
   * The CFConstantString at 0x8AF6B0 wraps the C-string
   *   "M_LayersList_ObjectIconGrey-3DObject"   (length 0x24 = 36)
   * — this is the FCP resource id for the anchor's black-and-white icon.
   */
  static readonly ICON_NAME_BW = "M_LayersList_ObjectIconGrey-3DObject"; // @Ozone CFString 0x8AF6B0 (C-string body at 0x7F1E70)
  getIconNameBW(): PCString {
    // callq PCString::PCString(__CFString const*) @Ozone stub 0x6df084
    return new PCString(OZARAnchorElement.ICON_NAME_BW);
  }

  /**
   * OZARAnchorElement::getIconID() const
   * @Ozone 0x62c840  (mangled __ZNK17OZARAnchorElement9getIconIDEv)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.getIconID.s):
   *   0x62c840 push %rbp / mov %rsp,%rbp
   *   0x62c844 movl $0xe, %eax                ; %eax <- 14
   *   0x62c849 pop %rbp / ret
   *
   * Returns the immediate integer 0xe (14). This is the icon-id enum value
   * for the AR-anchor scene element in Ozone's icon registry.
   */
  static readonly ICON_ID = 0x0e; // sourced from the movl $0xe imm @0x62c844
  getIconID(): number {
    return OZARAnchorElement.ICON_ID;
  }

  /**
   * OZARAnchorElement::description()
   * @Ozone 0x62c850  (mangled __ZN17OZARAnchorElement11descriptionEv)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.description.s):
   *   0x62c850 push %rbp / mov %rsp,%rbp / push %rbx / push %rax
   *   0x62c856 movq %rdi, %rbx                    ; %rbx = &return-slot
   *   0x62c859 leaq _theApp(%rip), %rax           ; %rax = &_theApp global
   *   0x62c860 movq (%rax), %rax                  ; %rax = _theApp
   *   0x62c863 movq 0x48(%rax), %rdx              ; %rdx = _theApp->[+0x48]  (the CFBundle*)
   *   0x62c867 leaq 0x282e62(%rip), %rsi          ; %rsi = 0x8AF6D0 (CFConstantString key)
   *   0x62c86e xorl %ecx, %ecx                    ; %rcx = 0 (table-name arg = null)
   *   0x62c870 callq PCString::PCString(CFStringRef, CFBundleRef, CFStringRef)   @Ozone stub 0x6df08a
   *   0x62c875 movq %rbx, %rax                    ; return &return-slot
   *
   * This is the LOCALIZED description: the ctor signature is
   *   PCString(__CFString const* key, __CFBundle* bundle, __CFString const* table)
   * and the key CFString at 0x8AF6D0 wraps
   *   "3D Scene Element Short Desc"   (length 0x1b = 27, body at Ozone 0x7C6DEF).
   * The bundle argument is the global `_theApp`'s member at offset +0x48
   * (Ozone's app singleton exposes its main bundle there — un-decoded but the
   * offset is transcribed). Table-name is nil, meaning the default
   * `Localizable.strings` is used.
   */
  static readonly DESCRIPTION_KEY = "3D Scene Element Short Desc"; // @Ozone CFString 0x8AF6D0 (body @0x7C6DEF)
  description(): PCString {
    // The bundle is _theApp->[+0x48]. `_theApp` and its layout are un-decoded
    // frontier state; we route the localization lookup through a throwing
    // frontier stub so we don't fabricate a bundle.
    const bundle = this._theApp_bundle_at_0x48();
    // callq PCString::PCString(__CFString*, __CFBundle*, __CFString*) @Ozone stub 0x6df08a
    return new PCString(OZARAnchorElement.DESCRIPTION_KEY, bundle, null);
  }
  private _theApp_bundle_at_0x48(): unknown {
    // Reads _theApp->[+0x48]; _theApp is the Ozone global singleton loaded via
    // `leaq _theApp(%rip),%rax; movq (%rax),%rax; movq 0x48(%rax),%rdx` in the
    // description() disasm at @Ozone 0x62c859..0x62c863. Not yet transcribed —
    // no faithful decode of _theApp's layout has been done.
    throw new Error("OZARAnchorElement.description reads _theApp->[+0x48] as CFBundle at @Ozone 0x62c863 — _theApp global not yet transcribed");
  }

  /**
   * OZARAnchorElement::unlocalizedDescription()
   * @Ozone 0x62c880  (mangled __ZN17OZARAnchorElement22unlocalizedDescriptionEv)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.unlocalizedDescription.s):
   *   0x62c880 push %rbp / mov %rsp,%rbp / push %rbx / push %rax
   *   0x62c886 movq %rdi, %rbx                    ; %rbx = &return-slot
   *   0x62c889 leaq 0x19a55f(%rip), %rsi          ; %rsi = 0x7C6DEF  (C-string)
   *   0x62c890 callq PCString::PCString(char const*)   @Ozone stub 0x6df09c
   *   0x62c895 movq %rbx, %rax                    ; return &return-slot
   *
   * Uses the C-string ctor (no CFString, no bundle). The literal at 0x7C6DEF
   * is the same 27-byte "3D Scene Element Short Desc" that description()'s
   * localization key wraps — so the unlocalized form is literally the key
   * text.
   */
  static readonly UNLOCALIZED_DESCRIPTION = "3D Scene Element Short Desc"; // @Ozone C-string 0x7C6DEF
  unlocalizedDescription(): PCString {
    // callq PCString::PCString(char const*) @Ozone stub 0x6df09c
    return new PCString(OZARAnchorElement.UNLOCALIZED_DESCRIPTION);
  }

  /**
   * OZARAnchorElement::calcStaticHash(PCSerializerWriteStream&, list<OZObjectManipulator*>&)
   * @Ozone 0x62c8a0  (mangled __ZN17OZARAnchorElement14calcStaticHashER23PCSerializerWriteStreamR...)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.calcStaticHash.s):
   *   0x62c8a0 push %rbp / mov %rsp,%rbp / pop %rbp
   *   0x62c8a5 jmp  OZ3DEngineSceneElement::calcStaticHash(...)
   *
   * Pure tail-jump into the parent; frontier class -> throwing stub.
   */
  calcStaticHash(stream: unknown, list: unknown): void {
    // tail-call: jmp OZ3DEngineSceneElement::calcStaticHash @Ozone 0x62c8a5
    super.calcStaticHash(stream, list);
  }

  /**
   * OZARAnchorElement::calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, list<OZObjectManipulator*>&, bool)
   * @Ozone 0x62c8c0  (mangled __ZN17OZARAnchorElement16calcHashForStateER23PCSerializerWriteStreamRK14OZRenderParams...)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.calcHashForState.s):
   *   0x62c8c0 push %rbp / mov %rsp,%rbp / pop %rbp
   *   0x62c8c5 jmp OZ3DEngineSceneElement::calcHashForState(...)
   *
   * Pure tail-jump into the parent; frontier class -> throwing stub.
   */
  calcHashForState(stream: unknown, params: unknown, list: unknown, flag: boolean): void {
    // tail-call: jmp OZ3DEngineSceneElement::calcHashForState @Ozone 0x62c8c5
    super.calcHashForState(stream, params, list, flag);
  }

  /**
   * OZARAnchorElement::~OZARAnchorElement (D0 deleting-dtor variant)
   * @Ozone 0x6dc530  (mangled __ZN17OZARAnchorElementD0Ev)
   *
   * Disasm decode (raw-port/re/disasm/OZARAnchorElement.~OZARAnchorElement.s):
   *   0x6dc530 push %rbp / mov %rsp,%rbp
   *   0x6dc534 ud2                                  ; TRAP — unreachable
   *
   * Apple emits D0 as `ud2` when the class must never be deleted through this
   * variant (typically because the object is factory-managed / never heap-
   * owned in a way that goes through the deleting dtor). Faithful mirror:
   * throw citing the address.
   *
   * The D1 (complete-object dtor) at @Ozone 0x6dc4f0 and the D2 (base-subobj
   * dtor) at @Ozone 0x62c7d0 are ICF-folded with unrelated ObjC bodies in the
   * stripped release binary — otool -tV attributes their bytes to the folded-
   * winner symbol so no independent decode is possible. They remain frontier.
   */
  destroy_D0(): never {
    throw new Error("OZARAnchorElement::~OZARAnchorElement (D0) @Ozone 0x6dc534 is ud2 (unreachable)");
  }
  destroy_D1(): void {
    // D1 (complete-object dtor) @Ozone 0x6dc4f0 — ICF-folded, body not yet transcribed
    throw new Error("OZARAnchorElement::~OZARAnchorElement (D1) @Ozone 0x6dc4f0 not yet transcribed (ICF-folded)");
  }
  destroy_D2(): void {
    // D2 (base-subobject dtor) @Ozone 0x62c7d0 — ICF-folded, body not yet transcribed
    throw new Error("OZARAnchorElement::~OZARAnchorElement (D2) @Ozone 0x62c7d0 not yet transcribed (ICF-folded)");
  }
}
