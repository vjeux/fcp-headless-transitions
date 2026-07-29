// raw-port/src/channels/FFOZVideoTrackerFolder.ts
//
// FCP `FFOZVideoTrackerFolder` — a thin subclass of `FFOZRiggedChannelFolder`
// that installs its OWN pair of vtable pointers on top of the base ctor's two
// slots, and forwards its Objective-C wrapper to the class
// `FFVideoTrackerFolder` (via NSStringFromClass), exactly mirroring the
// FFOZRiggedChannelFolder->FFRiggedChannelFolder pattern one level up.
//
// Framework: Flexo
//
// Provenance (all ctors ICF-fold C1==C2 per Flexo nm; both stable addrs listed):
//   FFOZVideoTrackerFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C1/C2] @0x221290
//   FFOZVideoTrackerFolder(OZFactory*, PCString&, u32)                        [C1/C2] @0x2212c0
//   FFOZVideoTrackerFolder(FFOZVideoTrackerFolder const&, OZChannelFolder*)   [C1/C2] @0x2212f0
//   FFOZVideoTrackerFolder(PCString&, OZChannelFolder*, u32, u32)             [C1/C2] @0x221320
//   clone() const                                                                      @0x2213c0
//   copy(OZChannelBase const*, bool)                                                   @0x221420
//   assign(OZChannelBase const*)                                                       @0x221430
//   getObjCWrapperName()                                                               @0x221440
//   ~FFOZVideoTrackerFolder() [D1]                                                     @0x2215e0
//   ~FFOZVideoTrackerFolder() [D0]                                                     @0x2215f0
//
// EXTERNAL FUNCTIONS REFERENCED (boundary throw-stubs — every stub cites its addr):
//   * FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C1]
//       @Flexo __ZN23FFOZRiggedChannelFolderC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj (called at 0x221299 & 0x22138a)
//   * FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(OZFactory*, PCString&, u32) [C1]
//       @Flexo __ZN23FFOZRiggedChannelFolderC1EP9OZFactoryRK8PCStringj (called at 0x2212c9)
//   * FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(FFOZRiggedChannelFolder const&, OZChannelFolder*) [C1]
//       @Flexo __ZN23FFOZRiggedChannelFolderC1ERKS_P15OZChannelFolder (called at 0x2212f9 and 0x2213df)
//   * OZChannelFolder::~OZChannelFolder() [D2]  @Flexo stub 0x149655e
//   * OZChannelFolder::copy(OZChannelBase const*, bool)  @Flexo stub 0x1496528
//   * FFOZRiggedChannelFolder::assign(OZChannelBase const*)  @Flexo __ZN23FFOZRiggedChannelFolder6assignEPK13OZChannelBase
//   * operator new(unsigned long)  @Flexo stub 0x1497452 (__Znwm; called by clone @0x2213cf with size=0x88)
//   * operator delete(void*)       @Flexo stub 0x1497404 (__ZdlPv)
//   * __Unwind_Resume              @Flexo stub 0x1495d30 (unwind @0x22140f in clone)
//   * std::__1::__call_once        @Flexo stub 0x14972ae (called by 4-arg ctor @0x22136f)
//   * FFOZVideoTrackerFolder_Factory::_instance      (data) — @Flexo global (read @0x221374)
//   * FFOZVideoTrackerFolder_Factory::_instanceOnce  (data) — @Flexo global (read @0x221340, @0x22135d)
//   * FFOZVideoTrackerFolder_Factory::getInstance()::'lambda'() [__call_once proxy]
//       @Flexo __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN30FFOZVideoTrackerFolder_Factory11getInstanceEvEUlvE_EEEEEvPv
//   * _objc_opt_self         @Flexo stub 0x14979a4
//   * _NSStringFromClass     @Flexo stub 0x1495a24
//   * _OBJC_CLASS_$_FFVideoTrackerFolder — Obj-C class pointer (__objc_data)
//
// VTABLES INSTALLED (all 4 ctors + clone install the SAME two slots):
//   *this            <- __ZTV22FFOZVideoTrackerFolder + 0x10   (primary vptr)
//                        RIP disp @0x22129e leaq 0x16d52f3(%rip) -> 0x18f65a8
//   *(this+0x10)     <- __ZTV22FFOZVideoTrackerFolder + 0x2d8  (secondary vptr; OZChannelFolder subobj)
//                        RIP disp @0x2212a8 leaq 0x16d55c1(%rip) -> 0x18f6870
//
// STRUCT LAYOUT — inherited unchanged from FFOZRiggedChannelFolder (see that file); this class
//   adds NO new data members — only the two vtable slot rewrites. `clone()` allocates 0x88 bytes,
//   matching the parent's total size (`__Znwm` with $0x88 @0x2213cf).

// -- Boundary throw-stubs for undecoded externs / base-class ctors ----------------------------

/**
 * FFOZRiggedChannelFolder(OZFactory*, PCString const&, OZChannelFolder*, u32, u32) — base ctor.
 * @Flexo __ZN23FFOZRiggedChannelFolderC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj @0x220a90.
 */
function FFOZRiggedChannelFolder_C1_factory_folder_uu(
  _this: FFOZVideoTrackerFolder,
  _factory: unknown,
  _name: unknown,
  _folder: unknown,
  _flagsA: number,
  _flagsB: number,
): void {
  throw new Error(
    "FFOZRiggedChannelFolder base-ctor @Flexo 0x220a90 not yet decoded here",
  );
}

/** FFOZRiggedChannelFolder(OZFactory*, PCString const&, u32) @Flexo 0x220ac0. */
function FFOZRiggedChannelFolder_C1_factory_u(
  _this: FFOZVideoTrackerFolder,
  _factory: unknown,
  _name: unknown,
  _flags: number,
): void {
  throw new Error(
    "FFOZRiggedChannelFolder base-ctor 3-arg @Flexo 0x220ac0 not yet decoded here",
  );
}

/** FFOZRiggedChannelFolder(FFOZRiggedChannelFolder const&, OZChannelFolder*) @Flexo 0x220af0. */
function FFOZRiggedChannelFolder_C1_copy_folder(
  _this: FFOZVideoTrackerFolder,
  _src: FFOZVideoTrackerFolder,
  _folder: unknown,
): void {
  throw new Error(
    "FFOZRiggedChannelFolder base-copy-ctor @Flexo 0x220af0 not yet decoded here",
  );
}

/** OZChannelFolder::~OZChannelFolder() (D2 base dtor) @Flexo stub 0x149655e. */
function OZChannelFolder_D2(_this: FFOZVideoTrackerFolder): void {
  throw new Error(
    "OZChannelFolder::~OZChannelFolder() @Flexo stub 0x149655e not yet decoded",
  );
}

/** OZChannelFolder::copy(OZChannelBase*, bool) @Flexo stub 0x1496528. */
function OZChannelFolder_copy(
  _this: FFOZVideoTrackerFolder,
  _src: unknown,
  _flag: boolean,
): unknown {
  throw new Error(
    "OZChannelFolder::copy(OZChannelBase*, bool) @Flexo stub 0x1496528 not yet decoded",
  );
}

/** FFOZRiggedChannelFolder::assign(OZChannelBase*) @Flexo 0x220be0. */
function FFOZRiggedChannelFolder_assign(
  _this: FFOZVideoTrackerFolder,
  _src: unknown,
): unknown {
  throw new Error(
    "FFOZRiggedChannelFolder::assign @Flexo 0x220be0 not yet decoded here",
  );
}

/** operator new(size_t) @Flexo stub 0x1497452 (__Znwm). */
function operator_new(_size: number): FFOZVideoTrackerFolder {
  throw new Error(
    "operator new(size_t) @Flexo stub 0x1497452 not yet decoded",
  );
}

/** operator delete(void*) @Flexo stub 0x1497404 (__ZdlPv). */
function operator_delete(_p: FFOZVideoTrackerFolder): void {
  throw new Error(
    "operator delete(void*) @Flexo stub 0x1497404 not yet decoded",
  );
}

/** std::__1::__call_once @Flexo stub 0x14972ae. */
function std_call_once(
  _once: FFOZVideoTrackerFolder_FactoryOnceHandle,
  _arg: unknown,
  _proxy: (arg: unknown) => void,
): void {
  throw new Error(
    "std::__1::__call_once @Flexo stub 0x14972ae not yet decoded",
  );
}

/** FFOZVideoTrackerFolder_Factory::getInstance()::'lambda'() [__call_once proxy] @Flexo. */
function FFOZVideoTrackerFolder_Factory_getInstance_proxy(_arg: unknown): void {
  throw new Error(
    "FFOZVideoTrackerFolder_Factory::getInstance proxy lambda @Flexo not yet decoded",
  );
}

/** _objc_opt_self(Class) @Flexo stub 0x14979a4 (Obj-C runtime boundary). */
function objc_opt_self(_cls: unknown): unknown {
  throw new Error(
    "_objc_opt_self @Flexo stub 0x14979a4 not yet decoded (Objective-C runtime)",
  );
}

/** NSStringFromClass(Class) @Flexo stub 0x1495a24 (Foundation boundary). */
function NSStringFromClass(_cls: unknown): string {
  throw new Error(
    "NSStringFromClass @Flexo stub 0x1495a24 not yet decoded (Foundation)",
  );
}

/**
 * `_OBJC_CLASS_$_FFVideoTrackerFolder` — the Obj-C class pointer for `FFVideoTrackerFolder`.
 * Loaded @0x221444 as the first arg to _objc_opt_self.
 */
export const OBJC_CLASS_FFVideoTrackerFolder: unknown = Symbol(
  "_OBJC_CLASS_$_FFVideoTrackerFolder @Flexo __objc_data (Obj-C class pointer, opaque)",
);

/** Opaque handle for the Factory-once std::once_flag (Flexo global `_instanceOnce`). */
export interface FFOZVideoTrackerFolder_FactoryOnceHandle {
  readonly __opaque_onceflag: unique symbol;
}

// -- Vtable pointer constants (installed by every ctor + clone) --------------------------------
//
// RIP-relative disps observed in the disasm all resolve to two vtable-body offsets under
// __ZTV22FFOZVideoTrackerFolder. Precise targets from the 5-arg ctor path:
//   @0x22129e leaq 0x16d52f3(%rip) -> primary   vptr @ vtable + 0x10
//   @0x2212a8 leaq 0x16d55c1(%rip) -> secondary vptr @ vtable + 0x2d8
// The other three ctor bodies use different disps (16d52c3/16d5293/16d5202/16d51ad) all
// pointing at THE SAME two vtable targets (via different instruction PCs).

/** Primary vptr installed by every ctor and by clone. Target = __ZTV22FFOZVideoTrackerFolder + 0x10. */
export const FFOZVideoTrackerFolder_vtable_primary: unknown = Symbol(
  "__ZTV22FFOZVideoTrackerFolder + 0x10  (primary vptr; @0x22129e leaq 0x16d52f3(%rip) -> 0x18f65a8)",
);

/** Secondary vptr installed by every ctor and by clone. Target = __ZTV22FFOZVideoTrackerFolder + 0x2d8. */
export const FFOZVideoTrackerFolder_vtable_secondary: unknown = Symbol(
  "__ZTV22FFOZVideoTrackerFolder + 0x2d8 (secondary/OZChannelFolder subobj vptr; @0x2212a8 leaq 0x16d55c1(%rip) -> 0x18f6870)",
);

// -- Struct handle ----------------------------------------------------------------------------

/**
 * FFOZVideoTrackerFolder instance. Inherits FFOZRiggedChannelFolder's layout verbatim
 * (see raw-port/src/channels/FFOZRiggedChannelFolder.ts) — this class adds no data
 * members and total size stays at 0x88 (confirmed by clone's __Znwm size @0x2213cf).
 * The two vtable slots at +0x00 and +0x10 are overwritten by every ctor of this class.
 */
export interface FFOZVideoTrackerFolder {
  /** +0x00 primary vptr. */
  vptr_primary_at00: unknown;
  /** +0x10 secondary vptr. */
  vptr_secondary_at10: unknown;
  /** Bytes 0x18..0x87 = inherited base state — opaque here. See parent class files. */
  base_state_after_0x18: unknown;
}

// =============================================================================================
//  Constructors
// =============================================================================================

// -- 0/4: FFOZVideoTrackerFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32)  @0x221290 (C1==C2 ICF)
// Body:
//   1. call FFOZRiggedChannelFolder::C1(factory, name, folder, flagsA, flagsB) — base ctor @0x221299.
//   2. *this          = vtable+0x10   (leaq 0x16d52f3(%rip) @0x22129e; movq %rax,(%rbx))
//   3. *(this+0x10)   = vtable+0x2d8  (leaq 0x16d55c1(%rip) @0x2212a8; movq %rax,0x10(%rbx))
export function FFOZVideoTrackerFolder_ctor_factory_folder_uu(
  self: FFOZVideoTrackerFolder,
  factory: unknown,
  name: unknown,
  folder: unknown,
  flagsA: number,
  flagsB: number,
): void {
  FFOZRiggedChannelFolder_C1_factory_folder_uu(self, factory, name, folder, flagsA, flagsB);
  self.vptr_primary_at00 = FFOZVideoTrackerFolder_vtable_primary;
  self.vptr_secondary_at10 = FFOZVideoTrackerFolder_vtable_secondary;
}

// -- 5/6: FFOZVideoTrackerFolder(OZFactory*, PCString&, u32)  @0x2212c0 (C1==C2 ICF)
// Body:
//   1. call FFOZRiggedChannelFolder::C1(factory, name, flags) — base 3-arg ctor @0x2212c9.
//   2. install both vtable slots (@0x2212ce/@0x2212d8; disp 0x16d52c3/0x16d5591).
export function FFOZVideoTrackerFolder_ctor_factory_u(
  self: FFOZVideoTrackerFolder,
  factory: unknown,
  name: unknown,
  flags: number,
): void {
  FFOZRiggedChannelFolder_C1_factory_u(self, factory, name, flags);
  self.vptr_primary_at00 = FFOZVideoTrackerFolder_vtable_primary;
  self.vptr_secondary_at10 = FFOZVideoTrackerFolder_vtable_secondary;
}

// -- 7/8: FFOZVideoTrackerFolder(FFOZVideoTrackerFolder const&, OZChannelFolder*)  @0x2212f0 (C1==C2 ICF)
// Body:
//   1. call FFOZRiggedChannelFolder::C1(src(as base), folder) — base copy-ctor @0x2212f9.
//   2. install both vtable slots (@0x2212fe/@0x221308; disp 0x16d5293/0x16d5561).
export function FFOZVideoTrackerFolder_ctor_copy_folder(
  self: FFOZVideoTrackerFolder,
  src: FFOZVideoTrackerFolder,
  folder: unknown,
): void {
  FFOZRiggedChannelFolder_C1_copy_folder(self, src, folder);
  self.vptr_primary_at00 = FFOZVideoTrackerFolder_vtable_primary;
  self.vptr_secondary_at10 = FFOZVideoTrackerFolder_vtable_secondary;
}

// -- 2/3: FFOZVideoTrackerFolder(PCString const&, OZChannelFolder*, u32, u32)  @0x221320 (C1==C2 ICF)
// Body (call_once bootstrap for the singleton Factory, then call the 5-arg base ctor):
//   1. `if (_instanceOnce != -1)` (cmpq $-0x1,rax @0x221347; je 0x221374 skips the bootstrap):
//        std::__1::__call_once(_instanceOnce, &scratch, FFOZVideoTrackerFolder_Factory_getInstance_proxy)
//        @0x22136f — call @0x221364 sets up the proxy fn+arg.
//   2. reload _instance singleton (@0x221374; movq _instance(%rip),%rsi).
//   3. call FFOZRiggedChannelFolder::C1(singleton_factory, name, folder, flags1, flags2) @0x22138a.
//   4. install both vtable slots (@0x22138f/@0x221399; disp 0x16d5202/0x16d54d0).
export function FFOZVideoTrackerFolder_ctor_name_folder_uu(
  self: FFOZVideoTrackerFolder,
  name: unknown,
  folder: unknown,
  flags1: number,
  flags2: number,
): void {
  const instanceOnce = FFOZVideoTrackerFolder_Factory_instanceOnce();
  if (!FFOZVideoTrackerFolder_Factory_onceIsSentinelMinusOne(instanceOnce)) {
    // Frame scratch (rbp-0x29) used as the __call_once arg pointer.
    const scratch: unknown = { __scratch: true };
    std_call_once(instanceOnce, scratch, FFOZVideoTrackerFolder_Factory_getInstance_proxy);
  }
  const instance = FFOZVideoTrackerFolder_Factory_instance();
  FFOZRiggedChannelFolder_C1_factory_folder_uu(self, instance, name, folder, flags1, flags2);
  self.vptr_primary_at00 = FFOZVideoTrackerFolder_vtable_primary;
  self.vptr_secondary_at10 = FFOZVideoTrackerFolder_vtable_secondary;
}

/** Read the FFOZVideoTrackerFolder_Factory::_instanceOnce global @Flexo (read @0x221340). */
function FFOZVideoTrackerFolder_Factory_instanceOnce(): FFOZVideoTrackerFolder_FactoryOnceHandle {
  throw new Error(
    "FFOZVideoTrackerFolder_Factory::_instanceOnce global read @Flexo 0x221340 not yet decoded",
  );
}

/** Compare a once-flag against the -1 sentinel that means "already initialized". */
function FFOZVideoTrackerFolder_Factory_onceIsSentinelMinusOne(
  _once: FFOZVideoTrackerFolder_FactoryOnceHandle,
): boolean {
  throw new Error(
    "FFOZVideoTrackerFolder_Factory::_instanceOnce vs -1 compare @Flexo 0x221347 not yet decoded",
  );
}

/** Read the FFOZVideoTrackerFolder_Factory::_instance global @Flexo (read @0x221374). */
function FFOZVideoTrackerFolder_Factory_instance(): unknown {
  throw new Error(
    "FFOZVideoTrackerFolder_Factory::_instance global read @Flexo 0x221374 not yet decoded",
  );
}

// =============================================================================================
//  Destructors
// =============================================================================================

// -- 11: ~FFOZVideoTrackerFolder() [D1]  @0x2215e0
// Body: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp 0x149655e (OZChannelFolder::~D2).
// Effect: tail-call the OZChannelFolder base D2 — no per-class cleanup.
export function FFOZVideoTrackerFolder_D1(self: FFOZVideoTrackerFolder): void {
  OZChannelFolder_D2(self);
}

// -- 12: ~FFOZVideoTrackerFolder() [D0]  @0x2215f0  (D0 = D1 + operator delete)
// Body: callq 0x149655e (OZChannelFolder::~D2) ; jmp 0x1497404 (operator delete on `this`).
export function FFOZVideoTrackerFolder_D0(self: FFOZVideoTrackerFolder): void {
  OZChannelFolder_D2(self);
  operator_delete(self);
}

// =============================================================================================
//  14: getObjCWrapperName()  @0x221440
//  Body:
//    leaq  _OBJC_CLASS_$_FFVideoTrackerFolder(%rip), %rdi
//    callq _objc_opt_self       ; %rax = Class (fast-path +class)
//    movq  %rax, %rdi
//    jmp   _NSStringFromClass   ; return NSStringFromClass(Class)
// =============================================================================================
export function FFOZVideoTrackerFolder_getObjCWrapperName(
  _self: FFOZVideoTrackerFolder,
): string {
  const cls = objc_opt_self(OBJC_CLASS_FFVideoTrackerFolder);
  return NSStringFromClass(cls);
}

// =============================================================================================
//  15: clone() const  @0x2213c0
//  Body:
//    %rdi = 0x88 ; callq __Znwm                                            ; p = operator new(0x88)
//    %rdi = p ; %rsi = this ; %rdx = 0
//    callq FFOZRiggedChannelFolder::C1(src, nullptr)                       ; base copy-ctor with folder=null
//    *(p+0x00) = vtable+0x10  ; *(p+0x10) = vtable+0x2d8                    ; install both vptrs
//    return p
//  Unwind path (@0x221401..@0x22140f): on exception, `operator delete(p)` then __Unwind_Resume.
// =============================================================================================
export function FFOZVideoTrackerFolder_clone(
  self: FFOZVideoTrackerFolder,
): FFOZVideoTrackerFolder {
  const p = operator_new(0x88);
  try {
    FFOZRiggedChannelFolder_C1_copy_folder(p, self, null);
  } catch (e) {
    operator_delete(p);
    throw e;
  }
  p.vptr_primary_at00 = FFOZVideoTrackerFolder_vtable_primary;
  p.vptr_secondary_at10 = FFOZVideoTrackerFolder_vtable_secondary;
  return p;
}

// =============================================================================================
//  16: copy(OZChannelBase const*, bool)  @0x221420
//  Body: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp 0x1496528 (OZChannelFolder::copy).
//  Effect: tail-call OZChannelFolder::copy — pure forwarder.
// =============================================================================================
export function FFOZVideoTrackerFolder_copy(
  self: FFOZVideoTrackerFolder,
  src: unknown,
  flag: boolean,
): unknown {
  return OZChannelFolder_copy(self, src, flag);
}

// =============================================================================================
//  17: assign(OZChannelBase const*)  @0x221430
//  Body: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp FFOZRiggedChannelFolder::assign.
//  Effect: tail-call FFOZRiggedChannelFolder::assign — pure forwarder to the parent.
// =============================================================================================
export function FFOZVideoTrackerFolder_assign(
  self: FFOZVideoTrackerFolder,
  src: unknown,
): unknown {
  return FFOZRiggedChannelFolder_assign(self, src);
}
