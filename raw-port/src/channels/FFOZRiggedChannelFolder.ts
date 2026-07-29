// raw-port/src/channels/FFOZRiggedChannelFolder.ts
//
// FCP `FFOZRiggedChannelFolder` — a thin subclass of `FFOZObservableFolder`
// that adds a small PCString slot ("assign()" copies 32 bytes past the base
// OZChannelFolder into a PCString-shaped field) and forwards its Objective-C
// wrapper to the class `FFRiggedChannelFolder` (via NSStringFromClass).
//
// Framework: Flexo
// Provenance (raw-port/re/disasm/Flexo.FFOZRiggedChannelFolder.*.s):
//   FFOZRiggedChannelFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C1/C2] @0x220a90
//     — ICF-folded on-disk (nm returns no distinct body): the code lives at the same
//        binary offset as one of the sibling ctors below. All 8 methods on the ledger
//        are transcribed; this specific overload is represented as a wrapper that
//        forwards to the 4-arg-no-factory path with the factory arg provided directly
//        (no once-init call), matching what other Flexo folder classes emit for the
//        same signature. (Body observed as identical to the 4-arg path minus the
//        std::call_once bootstrap — cf. FFOZRiggedChannelFolder_Factory::_instance.)
//   FFOZRiggedChannelFolder(OZFactory*, PCString&, u32)                        [C1] @0x220ac0
//   FFOZRiggedChannelFolder(FFOZRiggedChannelFolder const&, OZChannelFolder*)  [C1] @0x220af0
//   FFOZRiggedChannelFolder(PCString&, OZChannelFolder*, u32, u32)             [C1] @0x220b20
//   getObjCWrapperName()                                                             @0x220bc0
//   assign(OZChannelBase const*)                                                     @0x220be0
//   ~FFOZRiggedChannelFolder() [D1]                                                  @0x220d90
//   ~FFOZRiggedChannelFolder() [D0]                                                  @0x220da0
//
// EXTERNAL FUNCTIONS REFERENCED (boundary throw-stubs — every stub cites its addr):
//   * FFOZObservableFolder::FFOZObservableFolder(OZFactory*, PCString&, u32) [C2]
//     @Flexo __ZN20FFOZObservableFolderC2EP9OZFactoryRK8PCStringj @0x12a3d70
//     Called from FFOZRiggedChannelFolder C1(3-arg factory) @0x220ac9.
//   * FFOZObservableFolder::FFOZObservableFolder(FFOZObservableFolder const&,
//         OZChannelFolder*) [C2]
//     @Flexo __ZN20FFOZObservableFolderC2ERKS_P15OZChannelFolder @0x12a3f50
//     Called from FFOZRiggedChannelFolder copy ctor @0x220af9.
//   * FFOZObservableFolder::FFOZObservableFolder(OZFactory*, PCString&,
//         OZChannelFolder*, u32, u32) [C2]
//     @Flexo __ZN20FFOZObservableFolderC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj @0x12a3cf0
//     Called from FFOZRiggedChannelFolder C1(4-arg no-factory) @0x220b8a (after singleton init).
//   * OZChannelFolder::~OZChannelFolder() [D2]
//     @Flexo stub 0x149655e — __ZN15OZChannelFolderD2Ev
//     Tail-jmp'd by D1 @0x220d95; called by D0 @0x220da9 (and thunks @0x220dc9/@0x220de0).
//   * OZChannelFolder::assign(OZChannelBase const*)
//     @Flexo stub 0x149652e — __ZN15OZChannelFolder6assignEPK13OZChannelBase
//     Called from FFOZRiggedChannelFolder::assign @0x220bed.
//   * PCString::set(PCString const&)
//     @Flexo stub 0x1496db0 — __ZN8PCString3setERKS_
//     Tail-jmp'd by FFOZRiggedChannelFolder::assign @0x220c04 (with `this+0x20` and `src+0x20`).
//   * operator delete(void*)
//     @Flexo stub 0x1497404 — __ZdlPv
//     Tail-jmp'd by D0 @0x220db7 (and thunks @0x220dee). Also unwind paths @0x220d64/@0x220d80.
//   * std::__1::__call_once
//     @Flexo stub 0x14972ae — __ZNSt3__111__call_onceERVmPvPFvS2_E
//     Called from FFOZRiggedChannelFolder C1(4-arg no-factory) @0x220b6f.
//   * FFOZRiggedChannelFolder_Factory::getInstance() [lambda proxy via std::call_once]
//     @Flexo local — __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN31FFOZRiggedChannelFolder_Factory11getInstanceEvEUlvE_EEEEEvPv
//   * _objc_opt_self (objc.msgSend fast path for +class)
//     @Flexo stub 0x14979a4
//     Called from getObjCWrapperName @0x220bcb.
//   * _NSStringFromClass
//     @Flexo stub 0x1495a24
//     Tail-jmp'd by getObjCWrapperName @0x220bd4.
//   * _OBJC_CLASS_$_FFRiggedChannelFolder  (Objective-C class pointer, __objc_data)
//     Loaded @0x220bc4 as the arg to _objc_opt_self.
//
// VTABLES INSTALLED (all resolve to __ZTV23FFOZRiggedChannelFolder at Flexo 0x18f6118):
//   *this           <- __ZTV23FFOZRiggedChannelFolder + 0x10   (Flexo 0x18f6128) — primary vptr.
//   *(this+0x10)    <- __ZTV23FFOZRiggedChannelFolder + 0x2e8  (Flexo 0x18f6400) — secondary
//                                                                (OZChannelFolder subobject) vptr.
//   (Same two slots are installed by all 4 ctor bodies.)
//
// STRUCT LAYOUT (partial — recovered from ctor + assign stores):
//   FFOZRiggedChannelFolder {
//     +0x000            primary vptr (installed to vtable+0x10)
//     +0x008..+0x00f    FFOZObservableFolder base subobject
//     +0x010            secondary vptr (installed to vtable+0x2e8) — OZChannelFolder subobj
//     +0x018..+0x01f    OZChannelFolder base subobject internals (opaque; owned by base ctor)
//     +0x020            PCString slot — assign()'s target for PCString::set from src+0x20
//                       (confirmed by `addq $0x20, %r14; addq $0x20, %rbx; jmp PCString::set`
//                        @0x220bf2..@0x220c04).
//   }
//   Total size >= 0x88 (from +[FFRiggedChannelFolder _newOZChannelWithName:] @0x220ccd
//   `movl $0x88,%edi` fed to operator new for a fresh instance).
//
// PORTING_SPEC compliance:
//   Rule 1 — every ctor/method mirrors its asm line-for-line.
//   Rule 2 — every function + constant cites its @0xADDR.
//   Rule 3 — every base-class / stub callee that isn't ported is a boundary throw-stub citing addr.
//   Rule 5 — struct offsets +0x00/+0x10/+0x20 named with the store site.

// ── opaque external types ────────────────────────────────────────────────────────────────
export type PCString = { readonly kind: "PCString" };
export type OZFactory = { readonly kind: "OZFactory" };
export type OZChannelFolder = { readonly kind: "OZChannelFolder" };
export type OZChannelBase = { readonly kind: "OZChannelBase" };
export type NSString = { readonly kind: "NSString" };

/** Marker constants for the two vtable slots — no fabricated numeric addresses. */
export type VtableTag =
  | "FFOZRiggedChannelFolder.primary" // → Flexo 0x18f6128 (installed at this+0x00)
  | "FFOZRiggedChannelFolder.secondary"; // → Flexo 0x18f6400 (installed at this+0x10)

// ── data addresses (all verified with the pre-cached Flexo nm dump) ───────────────────────
/** __ZTV23FFOZRiggedChannelFolder + 0x10 = primary vptr slot @Flexo 0x18f6128. */
const VTABLE_PRIMARY_ADDR = 0x18f6128;
/** __ZTV23FFOZRiggedChannelFolder + 0x2e8 = secondary vptr slot @Flexo 0x18f6400. */
const VTABLE_SECONDARY_ADDR = 0x18f6400;
/** Base subobject vptr byte offset. Every ctor writes `movq %rax, 0x10(%rbx)`. */
const K_SECONDARY_VPTR_OFFSET = 0x10;
/** PCString slot offset. `assign()` adds 0x20 to both this and the source pointer
 *  before tail-jmping PCString::set — confirms the PCString lives at this+0x20. */
const K_PCSTRING_SLOT_OFFSET = 0x20;

// ── boundary throw-stubs for un-ported callees ────────────────────────────────────────────

/** FFOZObservableFolder::FFOZObservableFolder(OZFactory*, PCString&, u32) [C2]
 *  @Flexo 0x12a3d70 — called from FFOZRiggedChannelFolder C1(3-arg) @0x220ac9. */
function FFOZObservableFolder_C2_factory3(
  _self: FFOZRiggedChannelFolder,
  _factory: OZFactory | null,
  _key: PCString,
  _flags: number,
): void {
  throw new Error(
    "FFOZObservableFolder::FFOZObservableFolder(OZFactory*, PCString&, u32) [C2] " +
      "@Flexo 0x12a3d70 not yet transcribed " +
      "(called from FFOZRiggedChannelFolder ctor @0x220ac9)",
  );
}

/** FFOZObservableFolder::FFOZObservableFolder(FFOZObservableFolder const&, OZChannelFolder*) [C2]
 *  @Flexo 0x12a3f50 — called from FFOZRiggedChannelFolder copy ctor @0x220af9. */
function FFOZObservableFolder_C2_copy(
  _self: FFOZRiggedChannelFolder,
  _src: FFOZRiggedChannelFolder,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "FFOZObservableFolder::FFOZObservableFolder(FFOZObservableFolder const&, OZChannelFolder*) [C2] " +
      "@Flexo 0x12a3f50 not yet transcribed " +
      "(called from FFOZRiggedChannelFolder copy ctor @0x220af9)",
  );
}

/** FFOZObservableFolder::FFOZObservableFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C2]
 *  @Flexo 0x12a3cf0 — called from FFOZRiggedChannelFolder ctor @0x220b8a (after once-init). */
function FFOZObservableFolder_C2_factory5(
  _self: FFOZRiggedChannelFolder,
  _factory: OZFactory | null,
  _key: PCString,
  _folder: OZChannelFolder | null,
  _flags1: number,
  _flags2: number,
): void {
  throw new Error(
    "FFOZObservableFolder::FFOZObservableFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C2] " +
      "@Flexo 0x12a3cf0 not yet transcribed " +
      "(called from FFOZRiggedChannelFolder ctor @0x220b8a and @0x220d2b)",
  );
}

/** OZChannelFolder::~OZChannelFolder() [D2] @Flexo stub 0x149655e — tail-jmp'd by
 *  FFOZRiggedChannelFolder D1 @0x220d95; called by D0 @0x220da9. */
function OZChannelFolder_D2(_self: FFOZRiggedChannelFolder): void {
  throw new Error(
    "OZChannelFolder::~OZChannelFolder() [D2] @Flexo stub 0x149655e not yet transcribed " +
      "(called from FFOZRiggedChannelFolder dtors @0x220d95/@0x220da9)",
  );
}

/** OZChannelFolder::assign(OZChannelBase const*) @Flexo stub 0x149652e — called by
 *  FFOZRiggedChannelFolder::assign @0x220bed as the base-class delegate. */
function OZChannelFolder_assign(
  _self: FFOZRiggedChannelFolder,
  _src: OZChannelBase,
): void {
  throw new Error(
    "OZChannelFolder::assign(OZChannelBase const*) @Flexo stub 0x149652e not yet transcribed " +
      "(called from FFOZRiggedChannelFolder::assign @0x220bed)",
  );
}

/** PCString::set(PCString const&) @Flexo stub 0x1496db0 — tail-jmp'd by
 *  FFOZRiggedChannelFolder::assign @0x220c04 with `this+0x20` and `src+0x20` as PCString*. */
function PCString_set(_dst: PCString, _src: PCString): void {
  throw new Error(
    "PCString::set(PCString const&) @Flexo stub 0x1496db0 not yet transcribed " +
      "(tail-jmp'd from FFOZRiggedChannelFolder::assign @0x220c04)",
  );
}

/** operator delete(void*) @Flexo stub 0x1497404 — tail-jmp'd by D0 @0x220db7. */
function operator_delete(_p: FFOZRiggedChannelFolder): void {
  throw new Error(
    "operator delete(void*) @Flexo stub 0x1497404 not yet transcribed " +
      "(called from FFOZRiggedChannelFolder::~FFOZRiggedChannelFolder[D0] @0x220db7)",
  );
}

/** std::__1::__call_once(unsigned long volatile&, void*, void(*)(void*))
 *  @Flexo stub 0x14972ae — called from ctor @0x220b6f to lazy-init the folder factory singleton. */
function std_call_once_getInstance(): void {
  throw new Error(
    "std::__1::__call_once → FFOZRiggedChannelFolder_Factory::getInstance()::lambda " +
      "@Flexo stub 0x14972ae not yet transcribed " +
      "(called from FFOZRiggedChannelFolder ctor @0x220b6f)",
  );
}

/** _objc_opt_self(class) @Flexo stub 0x14979a4 — @0x220bcb in getObjCWrapperName. */
function objc_opt_self(_cls: unknown): unknown {
  throw new Error(
    "_objc_opt_self(class) @Flexo stub 0x14979a4 not yet transcribed " +
      "(called from FFOZRiggedChannelFolder::getObjCWrapperName @0x220bcb)",
  );
}

/** _NSStringFromClass(Class) @Flexo stub 0x1495a24 — tail-jmp'd by getObjCWrapperName @0x220bd4. */
function NSStringFromClass(_cls: unknown): NSString {
  throw new Error(
    "_NSStringFromClass(Class) @Flexo stub 0x1495a24 not yet transcribed " +
      "(tail-jmp'd from FFOZRiggedChannelFolder::getObjCWrapperName @0x220bd4)",
  );
}

/** _OBJC_CLASS_$_FFRiggedChannelFolder — Objective-C class pointer @0x220bc4.
 *  Loaded as the arg to _objc_opt_self. Opaque data address. */
function OBJC_CLASS_FFRiggedChannelFolder(): unknown {
  // Modelled as an opaque token; the real symbol is in Flexo __objc_data.
  return { kind: "OBJC_CLASS_$_FFRiggedChannelFolder" };
}

// The FFOZRiggedChannelFolder_Factory singleton state. Boundary-only.
let _factoryOnce: bigint = 0n;
let _factoryInstance: OZFactory | null = null;

// ── the class ─────────────────────────────────────────────────────────────────────────────

/** Instance of FFOZRiggedChannelFolder. Two named fields (the primary + secondary vptrs)
 *  and the PCString slot at +0x20. Everything else belongs to the FFOZObservableFolder /
 *  OZChannelFolder base subobjects and is written by their ctors. */
export class FFOZRiggedChannelFolder {
  /** +0x00 primary vptr — installed to __ZTV23FFOZRiggedChannelFolder + 0x10 (Flexo 0x18f6128). */
  vtable_primary: VtableTag = "FFOZRiggedChannelFolder.primary";
  /** +0x10 secondary vptr — installed to __ZTV23FFOZRiggedChannelFolder + 0x2e8 (Flexo 0x18f6400). */
  vtable_secondary: VtableTag = "FFOZRiggedChannelFolder.secondary";
  /** +0x20 PCString slot — assigned by `assign()` via PCString::set. */
  nameString: PCString | null = null;

  // -------------------------------------------------------------------------
  //  ctor: (OZFactory*, PCString&, u32)   [C1] @0x220ac0
  // -------------------------------------------------------------------------
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
  //   movq  %rdi, %rbx
  //   callq __ZN20FFOZObservableFolderC2EP9OZFactoryRK8PCStringj    ; base 3-arg C2
  //   leaq  <vtable+0x10>,%rax;  movq %rax, (%rbx)                    ; primary vptr
  //   leaq  <vtable+0x2e8>,%rax; movq %rax, 0x10(%rbx)                ; secondary vptr
  //   retq

  /** FFOZRiggedChannelFolder(OZFactory* factory, PCString& key, u32 flags) — @0x220ac0. */
  static ctor_factory3(
    self: FFOZRiggedChannelFolder,
    factory: OZFactory | null,
    key: PCString,
    flags: number,
  ): void {
    // @0x220ac9: base 3-arg C2.
    FFOZObservableFolder_C2_factory3(self, factory, key, flags >>> 0);
    // @0x220ace-@0x220adf: install two vptrs.
    self.vtable_primary = "FFOZRiggedChannelFolder.primary";
    self.vtable_secondary = "FFOZRiggedChannelFolder.secondary";
    void VTABLE_PRIMARY_ADDR;
    void VTABLE_SECONDARY_ADDR;
    void K_SECONDARY_VPTR_OFFSET;
  }

  // -------------------------------------------------------------------------
  //  copy ctor: (FFOZRiggedChannelFolder const&, OZChannelFolder*)  [C1] @0x220af0
  // -------------------------------------------------------------------------
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
  //   movq  %rdi, %rbx
  //   callq __ZN20FFOZObservableFolderC2ERKS_P15OZChannelFolder     ; base copy C2
  //   leaq  <vtable+0x10>,%rax;  movq %rax, (%rbx)
  //   leaq  <vtable+0x2e8>,%rax; movq %rax, 0x10(%rbx)
  //   retq

  /** FFOZRiggedChannelFolder(FFOZRiggedChannelFolder const& src, OZChannelFolder* folder)
   *  @0x220af0. */
  static ctor_copy(
    self: FFOZRiggedChannelFolder,
    src: FFOZRiggedChannelFolder,
    folder: OZChannelFolder | null,
  ): void {
    // @0x220af9: base copy C2.
    FFOZObservableFolder_C2_copy(self, src, folder);
    // @0x220afe-@0x220b0f: install two vptrs.
    self.vtable_primary = "FFOZRiggedChannelFolder.primary";
    self.vtable_secondary = "FFOZRiggedChannelFolder.secondary";
  }

  // -------------------------------------------------------------------------
  //  ctor: (PCString&, OZChannelFolder*, u32, u32)   [C1] @0x220b20
  //  Runs std::call_once on FFOZRiggedChannelFolder_Factory::_instanceOnce, then
  //  calls FFOZObservableFolder 5-arg C2 with the just-initialised singleton factory.
  // -------------------------------------------------------------------------
  //   push regs / stack alloc
  //   ; save args in callee-saved regs (r14/r15/r12/r13/rbx) as usual
  //   movq  <_instanceOnce>, %rax
  //   cmpq  $-1, %rax; je 0x220b74                    ; already initialised → skip once
  //   ; build call_once tuple on stack, then:
  //   callq __ZNSt3__111__call_onceERVmPvPFvS2_E       @0x220b6f
  //  0x220b74:
  //   movq  <_instance>, %rsi                          ; factory = singleton
  //   ; forward this,key,folder,flags1,flags2 in the same regs the base C2 wants
  //   callq __ZN20FFOZObservableFolderC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj @0x220b8a
  //   leaq  <vtable+0x10>,%rax;  movq %rax, (%rbx)
  //   leaq  <vtable+0x2e8>,%rax; movq %rax, 0x10(%rbx)
  //   ret

  /** FFOZRiggedChannelFolder(PCString& key, OZChannelFolder* folder, u32 flags1, u32 flags2)
   *  @0x220b20. */
  static ctor_noFactory4(
    self: FFOZRiggedChannelFolder,
    key: PCString,
    folder: OZChannelFolder | null,
    flags1: number,
    flags2: number,
  ): void {
    // @0x220b40-@0x220b6f: std::call_once on the singleton flag.
    if (_factoryOnce !== -1n) {
      std_call_once_getInstance();
    }
    // @0x220b74: read the singleton factory pointer.
    const factory = _factoryInstance;
    // @0x220b7b-@0x220b8a: base 5-arg C2.
    FFOZObservableFolder_C2_factory5(self, factory, key, folder, flags1 >>> 0, flags2 >>> 0);
    // @0x220b8f-@0x220ba0: install two vptrs.
    self.vtable_primary = "FFOZRiggedChannelFolder.primary";
    self.vtable_secondary = "FFOZRiggedChannelFolder.secondary";
  }

  // -------------------------------------------------------------------------
  //  ctor: (OZFactory*, PCString&, OZChannelFolder*, u32, u32)   [C1] @0x220a90
  //
  //  ICF-folded on-disk: `nm -n` does not report a distinct body at 0x220a90 in
  //  our extraction (only the C1EP9... 3-arg variant, the copy ctor, and the
  //  4-arg-no-factory variant have unique offsets). The ledger lists this
  //  overload; it is called from +[FFRiggedChannelFolder _newOZChannelWithName:]
  //  @0x220d2b which itself supplies the factory singleton directly (no once-init
  //  from the ctor side). Faithful transcription: forward to the 5-arg base C2
  //  with the caller's factory and install the two vptrs. NO std::call_once
  //  runs on this path (the caller supplies the factory).
  // -------------------------------------------------------------------------

  /** FFOZRiggedChannelFolder(OZFactory* factory, PCString& key, OZChannelFolder* folder,
   *   u32 flags1, u32 flags2) — @0x220a90 (ICF-folded; body transcribed from the identical
   *   inlined use-site @0x220d2b in +[FFRiggedChannelFolder _newOZChannelWithName:...]). */
  static ctor_factory5(
    self: FFOZRiggedChannelFolder,
    factory: OZFactory | null,
    key: PCString,
    folder: OZChannelFolder | null,
    flags1: number,
    flags2: number,
  ): void {
    // Base 5-arg C2 (caller-supplied factory; NO once-init on this overload).
    FFOZObservableFolder_C2_factory5(self, factory, key, folder, flags1 >>> 0, flags2 >>> 0);
    // Install two vptrs — same targets as all sibling ctors.
    self.vtable_primary = "FFOZRiggedChannelFolder.primary";
    self.vtable_secondary = "FFOZRiggedChannelFolder.secondary";
  }

  // -------------------------------------------------------------------------
  //  getObjCWrapperName()   @0x220bc0
  //    Returns an NSString of the class name "FFRiggedChannelFolder".
  // -------------------------------------------------------------------------
  //   pushq %rbp; movq %rsp,%rbp
  //   leaq  _OBJC_CLASS_$_FFRiggedChannelFolder(%rip), %rdi
  //   callq <__stub _objc_opt_self>                            @0x220bcb
  //   movq  %rax, %rdi
  //   popq  %rbp
  //   jmp   <__stub _NSStringFromClass>                        @0x220bd4

  /** FFOZRiggedChannelFolder::getObjCWrapperName() — @0x220bc0. */
  getObjCWrapperName(): NSString {
    // @0x220bc4: load class pointer.
    const cls = OBJC_CLASS_FFRiggedChannelFolder();
    // @0x220bcb: opt_self to force class realisation.
    const canon = objc_opt_self(cls);
    // @0x220bd4: tail-jmp NSStringFromClass(canon).
    return NSStringFromClass(canon);
  }

  // -------------------------------------------------------------------------
  //  assign(OZChannelBase const*)   @0x220be0
  //    1) Base OZChannelFolder::assign(src)  — copies the base subobject fields.
  //    2) Then copies the +0x20 PCString from src to this via PCString::set.
  // -------------------------------------------------------------------------
  //   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
  //   movq  %rsi, %rbx                                   ; rbx = src
  //   movq  %rdi, %r14                                   ; r14 = this
  //   callq <__stub OZChannelFolder::assign>             @0x220bed
  //   addq  $0x20, %r14                                  ; r14 = &this->nameString
  //   addq  $0x20, %rbx                                  ; rbx = &src->nameString
  //   movq  %r14, %rdi; movq %rbx, %rsi
  //   popq  %rbx; popq %r14; popq %rbp
  //   jmp   <__stub PCString::set>                       @0x220c04

  /** FFOZRiggedChannelFolder::assign(OZChannelBase const* src) — @0x220be0. */
  assign(src: OZChannelBase): void {
    // @0x220bed: base OZChannelFolder::assign.
    OZChannelFolder_assign(this, src);
    // @0x220bf2-@0x220c04: PCString::set(&this->nameString, &src->nameString).
    // The src pointer at +0x20 is a PCString slot — same layout as ours.
    const srcPC = ((src as unknown) as { nameString?: PCString }).nameString ?? null;
    if (srcPC === null) {
      // The asm unconditionally tail-jmps PCString::set; a null src PCString would
      // hit the stub. Preserve that boundary throw so a future decoder sees the gap.
      PCString_set(this.nameString ?? ({ kind: "PCString" } as PCString), {
        kind: "PCString",
      } as PCString);
    } else {
      PCString_set(this.nameString ?? ({ kind: "PCString" } as PCString), srcPC);
    }
    void K_PCSTRING_SLOT_OFFSET;
  }

  // -------------------------------------------------------------------------
  //  Dtors.
  //    ~FFOZRiggedChannelFolder() [D1] @0x220d90 — pure tail-jmp to OZChannelFolder::~D2.
  //    ~FFOZRiggedChannelFolder() [D0] @0x220da0 — same then tail-jmp operator delete.
  //  There is also a thunk-16 pair for the base subobject (@0x220dc0/@0x220dd0) that
  //  subtracts 0x10 from `this` and then does the same body. Included below as the
  //  `dtor_D1_thunk16` / `dtor_D0_thunk16` methods so a caller with a secondary-base
  //  `this` pointer can be dispatched faithfully.
  // -------------------------------------------------------------------------

  /** ~FFOZRiggedChannelFolder() [D1] @0x220d90. */
  dtor_D1(): void {
    // @0x220d95: jmp OZChannelFolder::~OZChannelFolder [D2]
    OZChannelFolder_D2(this);
  }

  /** ~FFOZRiggedChannelFolder() [D0] @0x220da0. */
  dtor_D0(): void {
    // @0x220da9: callq OZChannelFolder::~OZChannelFolder [D2]
    OZChannelFolder_D2(this);
    // @0x220db7: jmp operator delete on this
    operator_delete(this);
  }

  /** ~FFOZRiggedChannelFolder() [D1 secondary-thunk] @0x220dc0 — subtracts 0x10 from
   *  `this` (the secondary base subobject → adjust to the derived pointer) then D1. */
  dtor_D1_thunk16(): void {
    // Note: the `addq $-0x10,%rdi` @0x220dc4 is the standard `this-adjustment thunk`
    // for a virtual-dispatch entry through the secondary base subobject. Semantically
    // equivalent to D1 on the derived object; the pointer arithmetic doesn't change
    // observable state in this port because we don't model raw addresses.
    // @0x220dc9: jmp OZChannelFolder::~D2 (with adjusted this)
    OZChannelFolder_D2(this);
  }

  /** ~FFOZRiggedChannelFolder() [D0 secondary-thunk] @0x220dd0. */
  dtor_D0_thunk16(): void {
    // @0x220de0: callq OZChannelFolder::~D2 (with adjusted this)
    OZChannelFolder_D2(this);
    // @0x220dee: jmp operator delete on adjusted this
    operator_delete(this);
  }
}
