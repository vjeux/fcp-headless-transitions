// OZChannelPositionPercent3D_Factory — ProChannel factory singleton that
// mints OZChannelPositionPercent3D channel instances (and their copies).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly sources under
// raw-port/re/disasm/ProChannel.OZChannelPositionPercent3D_Factory.*.s.
//
// This is a classic OZFactoryBase-tree singleton: the factory is a
// process-global (lazy `std::call_once`-guarded) whose responsibility is
// (1) advertising static metadata (name/category/vendor/icon)
// (2) minting fresh `OZChannelPositionPercent3D` heap instances (size
//     0x378 bytes) — either from scratch (name+flags) or by copy-
//     constructing from an existing instance.
//
// Every "create" flavor allocates one 0x378-byte block via `operator new`,
// invokes the correct OZChannelPositionPercent3D constructor (which
// inherits from OZChannelPosition3D — proven by the copy-ctor call in
// createCopy/createChannelCopy), and returns the raw pointer. On ctor
// throw, the block is `operator delete`-freed and the exception is
// re-raised. `createInstance` and `createChannelInstance` are pure
// `return nullptr` — they aren't wired.
//
// STRUCT LAYOUT (from the C2 ctor @0xa6826):
//   +0x000  primary vptr    (= vtable + 0x10 @0xa6881 — writes ptr into +0)
//   +0x080  PCSingleton     (constructed by PCSingleton::PCSingleton(u32=0)
//                            @0xa686f-0xa6871 with %rdi = this+0x80)
//   +0x080  secondary vptr  (= vtable + 0xe0 @0xa688a — writes ptr into +0x80,
//                            OVERWRITING the PCSingleton slot start;
//                            factory secondary-table pattern).
//
// The factory C2 also invokes `OZFactory::OZFactory(PCUUID, PCUUID, u32=1)`
// with the two hard-coded PCUUID literals recovered from the framework
// __const section. See UUID constants below.

// ═════════════════════════════════════════════════════════════════════════
// Frontier callees — every base-class / imported symbol used by this
// factory, surfaced as a throwing stub with its @0xADDR / mangled symbol.
// ═════════════════════════════════════════════════════════════════════════

/** `operator new(unsigned long)` — imported __Znwm. Called with size
 *  0x378 by every `create*` method. Not yet transcribed. */
function OperatorNew_stub(_size: number): unknown {
  throw new Error(
    "operator new(unsigned long) __Znwm @ProChannel imported stub 0xace4c — not yet transcribed",
  );
}

/** `operator delete(void*)` — imported __ZdlPv. Called on the exception-
 *  unwind path after `operator new` succeeded but the ctor threw. Not yet
 *  transcribed. */
function OperatorDelete_stub(_p: unknown): void {
  throw new Error(
    "operator delete(void*) __ZdlPv @ProChannel imported stub 0xace04 — not yet transcribed",
  );
}

/** `__Unwind_Resume` — Itanium ABI exception continuation. Reached from
 *  every `create*` method's landing pad after `operator delete` on ctor
 *  raise. Not yet transcribed (imported stub @ProChannel 0xacaf2). */
function UnwindResume_stub(_ex: unknown): never {
  throw new Error(
    "__Unwind_Resume @ProChannel imported stub 0xacaf2 — not yet transcribed",
  );
}

/** `__dynamic_cast(void*, typeinfo const*, typeinfo const*, ptrdiff_t)` —
 *  Itanium C++ RTTI. Called by `createCopy` @ProChannel 0xa697a and
 *  `createChannelCopy` @ProChannel 0xa6b40 to downcast the incoming
 *  source pointer (which is typed as `OZFactoryBase*` / `OZChannelBase*`
 *  respectively) to `OZChannelPositionPercent3D*` before feeding it to the
 *  copy ctor. Not yet transcribed. */
function DynamicCast_stub(
  _src: unknown, _srcTI: unknown, _dstTI: unknown, _off: number,
): unknown {
  throw new Error(
    "__dynamic_cast @ProChannel imported stub 0xacea0 — not yet transcribed",
  );
}

/** `OZChannelPositionPercent3D::OZChannelPositionPercent3D(OZFactory*, PCString const&, unsigned int)`
 *  @ProChannel C2 body (mangled __ZN26OZChannelPositionPercent3DC2EP9OZFactoryRK8PCStringj).
 *  Called by both `create` @0xa692b and `createChannel` @0xa6af1. Not yet
 *  transcribed. */
function OZChannelPositionPercent3D_ctor_fs_stub(
  _dst: unknown, _factory: unknown, _name: unknown, _flags: number,
): void {
  throw new Error(
    "OZChannelPositionPercent3D::OZChannelPositionPercent3D(OZFactory*, PCString const&, unsigned int) " +
      "@ProChannel __ZN26OZChannelPositionPercent3DC2EP9OZFactoryRK8PCStringj (C2 body) — not yet transcribed",
  );
}

/** `OZChannelPosition3D::OZChannelPosition3D(OZChannelPosition3D const&, OZChannelFolder*)` —
 *  the parent-class copy ctor. Called by `createCopy` @ProChannel 0xa6987
 *  and `createChannelCopy` @0xa6b4d with `%rdx = 0` (folder=nullptr).
 *  This is the SAME copy ctor for the parent, not for the subclass — so
 *  the freshly-`new`'d 0x378 block is initialized by SLICING (copying only
 *  the parent portion), then the two-vptr install in the factory rewrites
 *  the vptrs to `OZChannelPositionPercent3D`'s vtable to complete the
 *  subclass identity. Not yet transcribed. */
function OZChannelPosition3D_copyCtor_stub(
  _dst: unknown, _src: unknown, _folder: unknown,
): void {
  throw new Error(
    "OZChannelPosition3D::OZChannelPosition3D(OZChannelPosition3D const&, OZChannelFolder*) " +
      "@ProChannel __ZN19OZChannelPosition3DC2ERKS_P15OZChannelFolder — not yet transcribed",
  );
}

/** `OZFactory::OZFactory(PCUUID, PCUUID, unsigned int)` — parent-class
 *  ctor invoked from THIS factory's ctor with the two hardcoded PCUUIDs
 *  and u32=1 (see UUID/version constants below). @ProChannel 0xa6855.
 *  Not yet transcribed. */
function OZFactory_ctor_uuu_stub(
  _dst: unknown, _uuid1: Uint8Array, _uuid2: Uint8Array, _flag: number,
): void {
  throw new Error(
    "OZFactory::OZFactory(PCUUID, PCUUID, unsigned int) " +
      "@ProChannel __ZN9OZFactoryC2E6PCUUIDS0_j — not yet transcribed",
  );
}

/** `OZFactory::~OZFactory()` — parent-class dtor. Reached from the C2
 *  ctor's landing pad @0xa68a0 (if OZChannelFactory or PCSingleton
 *  installation throws), and from the D0 dtor @0xa68ea. Not yet
 *  transcribed. */
function OZFactory_dtor_stub(_this: unknown): void {
  throw new Error(
    "OZFactory::~OZFactory() @ProChannel __ZN9OZFactoryD2Ev — not yet transcribed",
  );
}

/** `PCSingleton::PCSingleton(unsigned int)` — imported stub. Called by
 *  the factory C2 with `%rsi = 0` (initial-count = 0). Not yet transcribed. */
function PCSingleton_ctor_stub(_this: unknown, _flag: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) __ZN11PCSingletonC2Ej " +
      "@ProChannel imported stub 0xacb46 — not yet transcribed",
  );
}

/** `PCSingleton::~PCSingleton()` — imported stub. Called by D0
 *  @0xa68e2. Not yet transcribed. */
function PCSingleton_dtor_stub(_this: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton() __ZN11PCSingletonD2Ev " +
      "@ProChannel imported stub 0xacb4c — not yet transcribed",
  );
}

/** `PCString::PCString(__CFString const*)` — imported stub. Called by
 *  `description` @0xa69d4 and `manufacturer` @0xa6a0e to package a
 *  CFString literal into a PCString return value. Not yet transcribed. */
function PCString_ctor_cf_stub(_out: unknown, _cf: string): void {
  throw new Error(
    "PCString::PCString(__CFString const*) __ZN8PCStringC1EPK10__CFString " +
      "@ProChannel imported stub 0xaccfc — not yet transcribed",
  );
}

/** `PCString::PCString()` — imported stub (default ctor: empty PCString).
 *  Called by `getCategoryName` @0xa6a3b, `getEnglishCategoryName`
 *  @0xa6a53, `getIconNameInternal` @0xa6a79, `getIconNameBWInternal`
 *  @0xa6a91, `getLibraryIconNameInternal` @0xa6ab5. Not yet transcribed. */
function PCString_default_ctor_stub(_out: unknown): void {
  throw new Error(
    "PCString::PCString() __ZN8PCStringC1Ev " +
      "@ProChannel imported stub 0xacd1a — not yet transcribed",
  );
}

/** OZFactoryBase (or OZChannelFactory) vtable slot +0x28 — the
 *  `description()`-family virtual reached by `unlocalizedDescription`
 *  @0xa69ed-0xa69f0: `movq (%rsi), %rax ; callq *0x28(%rax)`. Signature
 *  is `void slot28(PCString* sret, OZFactoryBase* self)`. Not yet
 *  resolved. */
function OZFactoryBase_vslot0x28_stub(_out: unknown, _self: unknown): void {
  throw new Error(
    "OZFactoryBase vtable slot 0x28 (description()-family) " +
      "@ProChannel not yet resolved (dispatched from unlocalizedDescription @0xa69f0)",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Data — recovered from framework .rodata / __cfstring / __cstring.
// Each constant carries the @0xADDR of the LITERAL / RIP-relative load.
// ═════════════════════════════════════════════════════════════════════════

/** The factory advertises its OWNING channel class as size 0x378 bytes.
 *  Read verbatim from `movl $0x378, %edi` in every `create*` method:
 *  @ProChannel 0xa6912 (`create`), 0xa695a (`createCopy`),
 *  @ProChannel 0xa6ad8 (`createChannel`), 0xa6b20 (`createChannelCopy`). */
const OZ_CHANNEL_POSITION_PERCENT_3D_SIZEOF = 0x378;

/** First PCUUID passed to `OZFactory::OZFactory(PCUUID, PCUUID, u32=1)`
 *  by the factory C2. Loaded via `movaps 0xb355(%rip), %xmm0` @0xa6834
 *  → __const VA 0xb1b90. Sixteen raw bytes read out-of-band via
 *  `xxd` on the framework binary; see raw-port/re/disasm/ProChannel.
 *  OZChannelPositionPercent3D_Factory.OZChannelPositionPercent3D_Factory.s
 *  for the encoded RIP-relative offset. */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_UUID_A = new Uint8Array([
  // @ProChannel 0xb1b90 (16 bytes; PCUUID is a raw 128-bit id, not a
  // parsed hex-with-dashes string).
  0x5b, 0xd2, 0xb7, 0x05, 0xda, 0x46, 0x63, 0xa1,
  0x01, 0x62, 0xfc, 0xa3, 0x33, 0xe8, 0xad, 0x7d,
]);

/** Second PCUUID. Loaded via `movaps 0x8e97(%rip), %xmm0` @0xa6842
 *  → __const VA 0xaf6e0. */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_UUID_B = new Uint8Array([
  // @ProChannel 0xaf6e0 (16 bytes).
  0x11, 0x8b, 0x45, 0x98, 0x98, 0x49, 0xbc, 0x25,
  0xd6, 0x99, 0xc3, 0x97, 0x52, 0x0f, 0x24, 0xd1,
]);

/** `description()` returns a PCString built from a __cfstring literal.
 *  RIP-relative load `leaq 0x3e2bc(%rip), %rsi` @0xa69cd, target
 *  __cfstring VA 0xe4c90. The __cfstring entry there points at __cstring
 *  VA 0xbc3ea with length 7: **"Channel"**. */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_DESCRIPTION = "Channel";
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_DESCRIPTION_CFSTR_ADDR = 0xe4c90;

/** `manufacturer()` — same shape. `leaq 0x3e2a2(%rip), %rsi` @0xa6a07,
 *  target __cfstring VA 0xe4cb0 → __cstring VA 0xbc3f2 length 5:
 *  **"Apple"**. */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_MANUFACTURER = "Apple";
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_MANUFACTURER_CFSTR_ADDR = 0xe4cb0;

/** `getBundleID()` returns a raw C-string ptr — `leaq 0x1598b(%rip), %rax`
 *  @0xa6a66, target __cstring VA 0xbc3f8: **empty string ""**. Unlike
 *  description/manufacturer, this path SKIPS the PCString wrapper. */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_BUNDLE_ID = "";
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_BUNDLE_ID_LIT_ADDR = 0xbc3f8;

/** `version()` returns `1` (mov `$0x1, %eax` @0xa6a22). */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_VERSION = 1;

/** `revision()` returns `0` (xor %eax @0xa6a2e). */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_REVISION = 0;

/** `getIconIDInternal()` returns `-1` (`$0xffffffff` sign-extended to
 *  Int32 → -1). @ProChannel 0xa6aa4. */
const OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_ICON_ID_INTERNAL = -1;

// ═════════════════════════════════════════════════════════════════════════
// The factory class. Every method is line-by-line transcribed and cites
// its @0xADDR.
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZChannelPositionPercent3D_Factory` — ProChannel factory singleton.
 *
 * Inheritance is 3 layers deep (all frontier so far):
 *   OZFactoryBase          <-- __ZTI13OZFactoryBase (referenced @0xa6967)
 *   OZFactory              <-- OZFactoryBase (ctor called from our C2 @0xa6855)
 *   OZChannelFactory       <-- OZFactory     (its vtable installed @0xa685a)
 *   OZChannelPositionPercent3D_Factory <-- OZChannelFactory
 *
 * Every "create" method returns a raw `OZChannelPositionPercent3D*`.
 *
 * The class layout is not observable directly from these methods (they
 * only read/write vptr slots and inherited base-subobject storage). What
 * we CAN prove:
 *   +0x000  primary vptr    (twice installed: OZChannelFactory's @0xa6865
 *                            first, then this class's @0xa6881)
 *   +0x080  secondary vptr  / PCSingleton subobject
 *                            (PCSingleton C2 @0xa6871 with %rdi=this+0x80,
 *                             then vptr slot rewritten @0xa688a)
 *   [size]  unspecified — dtor teardown does not reach any other member
 */
export class OZChannelPositionPercent3D_Factory {
  /**
   * The static singleton pointer & call_once flag are true program-globals
   * in the C++ (not per-instance state) — `_instanceOnce` @ProChannel
   * `__ZN34OZChannelPositionPercent3D_Factory13_instanceOnceE` and
   * `_instance` @ProChannel `__ZN34OZChannelPositionPercent3D_Factory9_instanceE`.
   * We model them here as ordinary class-level statics.
   */
  private static _instance: OZChannelPositionPercent3D_Factory | null = null;
  private static _instanceOnce: 0 | 1 = 0; // 0 = not yet run; 1 = run.

  /**
   * `OZChannelPositionPercent3D_Factory::OZChannelPositionPercent3D_Factory()`
   * @ProChannel 0xa6826 (C2 body).
   *
   *   0xa6826  standard prolog
   *   0xa6834  movaps 0xb355(%rip), %xmm0     ; UUID_A (@const 0xb1b90)
   *   0xa683b  leaq -0x30(%rbp), %rsi
   *   0xa683f  movaps %xmm0, (%rsi)           ; spill UUID_A on stack
   *   0xa6842  movaps 0x8e97(%rip), %xmm0     ; UUID_B (@const 0xaf6e0)
   *   0xa6849  leaq -0x20(%rbp), %rdx
   *   0xa684d  movaps %xmm0, (%rdx)           ; spill UUID_B on stack
   *   0xa6850  movl $0x1, %ecx                ; flag=1
   *   0xa6855  callq OZFactory::OZFactory(this, &UUID_A, &UUID_B, 1)
   *   0xa685a  leaq &OZChannelFactory_vtable, %rax
   *   0xa6861  addq $0x10, %rax               ; vtable + 0x10 = primary slot
   *   0xa6865  movq %rax, (%rbx)              ; install OZChannelFactory vptr
   *   0xa6868  leaq 0x80(%rbx), %rdi          ; %rdi = this + 0x80
   *   0xa686f  xorl %esi, %esi                ; flag=0
   *   0xa6871  callq PCSingleton::PCSingleton(this+0x80, 0)
   *   0xa6876  leaq &OZChannelPositionPercent3D_Factory_vtable, %rax
   *   0xa687d  leaq 0x10(%rax), %rcx          ; primary slot
   *   0xa6881  movq %rcx, (%rbx)              ; REWRITE primary vptr
   *   0xa6884  addq $0xe0, %rax               ; vtable + 0xe0 = secondary slot
   *   0xa688a  movq %rax, 0x80(%rbx)          ; install secondary vptr
   *   0xa6891  epilog, ret
   *   0xa689a  landing pad: OZFactory::~OZFactory + __Unwind_Resume
   *
   * The two-phase vptr install (OZChannelFactory's, then ours) is the
   * standard C++ subobject-construction sequence when the base class has
   * its own vtable. Both are direct writes; we mirror them here as
   * comments only, because in JS the vptr identity is implicit in the
   * prototype chain.
   */
  constructor() {
    // OZFactory::OZFactory(this, &UUID_A, &UUID_B, 1) — frontier.
    OZFactory_ctor_uuu_stub(
      this,
      OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_UUID_A,
      OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_UUID_B,
      1,
    );
    // Vtable install #1 — OZChannelFactory (implicit in JS).
    // PCSingleton subobject construction at this+0x80.
    PCSingleton_ctor_stub(this, 0);
    // Vtable install #2 — this class's own vtable, primary + secondary.
    // Implicit in JS.
  }

  /**
   * `~OZChannelPositionPercent3D_Factory()` D0 (deleting dtor) @ProChannel
   * 0xa68d2. The D1/D2 thunks tail-call the same teardown then differ
   * only in whether they `operator delete` at the end (D0 does).
   *
   *   0xa68db  addq $0x80, %rdi                    ; %rdi = this + 0x80
   *   0xa68e2  callq PCSingleton::~PCSingleton     ; teardown singleton subobject
   *   0xa68e7  movq %rbx, %rdi                     ; %rdi = this
   *   0xa68ea  callq OZFactory::~OZFactory         ; teardown base
   *   0xa68f8  jmp operator delete                 ; D0-only free
   *
   * Vptr resets before dtor calls are NOT emitted (this class has no
   * further destructor logic to run after those two calls), which is a
   * common optimization when the subobject dtors don't dispatch virtually
   * against `this`.
   */
  destroy(): void {
    // Reverse-order teardown: PCSingleton subobject (this+0x80) then
    // OZFactory base (this).
    PCSingleton_dtor_stub(this);
    OZFactory_dtor_stub(this);
    OperatorDelete_stub(this);
  }

  /**
   * `OZChannelPositionPercent3D_Factory::getInstance()` @ProChannel 0xa6186.
   *
   *   0xa6186  movq _instanceOnce(%rip), %rax
   *   0xa618d  cmpq $-0x1, %rax                      ; already run?
   *   0xa6191  je   0xa61c5                          ; yes -> skip
   *   0xa6193  ... build call_once thunk frame ...
   *   0xa61bb  callq std::__1::__call_once(_instanceOnce, ctx-ptr, fn-ptr)
   *   0xa61c5  movq _instance(%rip), %rax
   *   0xa61cc  retq
   *
   * The call_once thunk constructs the singleton (an `OZChannelPositionPercent3D_Factory`
   * on the heap and stashes it in `_instance`) exactly once, guarded by
   * `_instanceOnce`. Subsequent calls just return `_instance`.
   *
   * NOTE on the sentinel: `_instanceOnce = -1` (all-ones) is the "already
   * run" state used by libc++'s std::call_once implementation. In JS we
   * simulate with 0/1.
   */
  static getInstance(): OZChannelPositionPercent3D_Factory {
    if (OZChannelPositionPercent3D_Factory._instanceOnce !== 1) {
      // Portable equivalent of __call_once_proxy — construct + stash.
      OZChannelPositionPercent3D_Factory._instance =
        new OZChannelPositionPercent3D_Factory();
      OZChannelPositionPercent3D_Factory._instanceOnce = 1;
    }
    return OZChannelPositionPercent3D_Factory._instance!;
  }

  /**
   * `description()` @ProChannel 0xa69c4. Returns a PCString built from the
   * __cfstring literal at VA 0xe4c90 (contents: "Channel").
   *
   *   0xa69c4  prolog
   *   0xa69cd  leaq 0x3e2bc(%rip), %rsi              ; &cfstring[0xe4c90]
   *   0xa69d4  callq PCString::PCString(this=&sret, cfstring=&"Channel")
   *   0xa69dc  epilog; return sret
   *
   * The caller passes an sret PCString slot in %rdi; the method fills it
   * and returns the same pointer.
   */
  description(sret: unknown): unknown {
    PCString_ctor_cf_stub(
      sret, OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_DESCRIPTION,
    );
    return sret;
  }

  /**
   * `unlocalizedDescription()` @ProChannel 0xa69e4. Forwards to the
   * virtual `description()` on the incoming `%rsi` (which is the same
   * factory `this`) via vtable slot +0x28.
   *
   *   0xa69ea  movq %rdi, %rbx
   *   0xa69ed  movq (%rsi), %rax                     ; load %rsi's vptr
   *   0xa69f0  callq *0x28(%rax)                     ; vtable[0x28] (description)
   *
   * NOTE: %rsi IS the factory `this` (the C++ signature is
   * `unlocalizedDescription(PCString*, OZChannelPositionPercent3D_Factory*)`
   * per Itanium ABI's sret convention). The virtual call goes back through
   * this same class's vtable and lands on `description()` — so the observable
   * effect is: `unlocalizedDescription == description == "Channel"`.
   */
  unlocalizedDescription(sret: unknown): unknown {
    OZFactoryBase_vslot0x28_stub(sret, this);
    return sret;
  }

  /**
   * `manufacturer()` @ProChannel 0xa69fe. Same shape as `description`,
   * cfstring at VA 0xe4cb0 → "Apple".
   *
   *   0xa6a07  leaq 0x3e2a2(%rip), %rsi              ; &cfstring[0xe4cb0]
   *   0xa6a0e  callq PCString::PCString(sret, "Apple")
   */
  manufacturer(sret: unknown): unknown {
    PCString_ctor_cf_stub(
      sret, OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_MANUFACTURER,
    );
    return sret;
  }

  /**
   * `version()` @ProChannel 0xa6a1e. Returns 1 (`movl $0x1, %eax`).
   */
  version(): number {
    return OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_VERSION;
  }

  /**
   * `revision()` @ProChannel 0xa6a2a. Returns 0 (`xorl %eax, %eax`).
   */
  revision(): number {
    return OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_REVISION;
  }

  /**
   * `getCategoryName()` @ProChannel 0xa6a32. Returns an empty PCString.
   *
   *   0xa6a38  movq %rdi, %rbx
   *   0xa6a3b  callq PCString::PCString(sret)        ; default ctor
   *   0xa6a40  movq %rbx, %rax; ret                   ; return sret
   */
  getCategoryName(sret: unknown): unknown {
    PCString_default_ctor_stub(sret);
    return sret;
  }

  /**
   * `getEnglishCategoryName()` @ProChannel 0xa6a4a. Same as
   * `getCategoryName` — default-constructed PCString.
   *
   *   0xa6a53  callq PCString::PCString(sret)
   */
  getEnglishCategoryName(sret: unknown): unknown {
    PCString_default_ctor_stub(sret);
    return sret;
  }

  /**
   * `getBundleID()` @ProChannel 0xa6a62. Returns a raw `const char*`
   * pointer to the framework's empty-string literal at __cstring VA
   * 0xbc3f8.
   *
   *   0xa6a66  leaq 0x1598b(%rip), %rax              ; = 0xbc3f8 (const char *"")
   *   0xa6a6d  popq %rbp; retq
   *
   * NOTE: unlike description/manufacturer, this does NOT wrap in a
   * PCString — it returns the raw pointer directly. In JS we just return
   * the string content.
   */
  getBundleID(): string {
    return OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_BUNDLE_ID;
  }

  /**
   * `getIconNameInternal()` @ProChannel 0xa6a70. Empty PCString (same
   * shape as `getCategoryName`).
   */
  getIconNameInternal(sret: unknown): unknown {
    PCString_default_ctor_stub(sret);
    return sret;
  }

  /**
   * `getIconNameBWInternal()` @ProChannel 0xa6a88. Empty PCString.
   */
  getIconNameBWInternal(sret: unknown): unknown {
    PCString_default_ctor_stub(sret);
    return sret;
  }

  /**
   * `getIconIDInternal()` @ProChannel 0xa6aa0. Returns -1 (as Int32 from
   * the sign-extended `$0xffffffff`).
   */
  getIconIDInternal(): number {
    return OZ_CHANNEL_POSITION_PERCENT_3D_FACTORY_ICON_ID_INTERNAL;
  }

  /**
   * `getLibraryIconNameInternal()` @ProChannel 0xa6aac. Empty PCString.
   */
  getLibraryIconNameInternal(sret: unknown): unknown {
    PCString_default_ctor_stub(sret);
    return sret;
  }

  /**
   * `create(PCString const&, unsigned int)` @ProChannel 0xa68fe. Mints a
   * heap `OZChannelPositionPercent3D` with (this as OZFactory*, name, flags).
   *
   *   0xa6912  movl $0x378, %edi
   *   0xa6917  callq operator new(0x378)             ; alloc raw block
   *   0xa6922  movq %r12, %rsi                       ; %rsi = factory (this)
   *   0xa6925  movq %r15, %rdx                       ; %rdx = &name PCString
   *   0xa6928  movl %r14d, %ecx                      ; %ecx = flags u32
   *   0xa692b  callq OZChannelPositionPercent3D::OZChannelPositionPercent3D(
   *                    new_block, factory, name, flags)
   *   0xa6930  movq %rbx, %rax                       ; return new_block
   *   0xa693c  landing pad: __ZdlPv(new_block); __Unwind_Resume
   */
  create(name: unknown, flags: number): unknown {
    const p = OperatorNew_stub(OZ_CHANNEL_POSITION_PERCENT_3D_SIZEOF);
    try {
      OZChannelPositionPercent3D_ctor_fs_stub(p, this, name, flags);
    } catch (e: unknown) {
      OperatorDelete_stub(p);
      UnwindResume_stub(e);
    }
    return p;
  }

  /**
   * `createCopy(OZFactoryBase* src, unsigned int flags)` @ProChannel 0xa6950.
   *
   *   0xa695f  callq operator new(0x378)
   *   0xa6967  movq &typeinfo<OZFactoryBase>, %rsi
   *   0xa696e  leaq &typeinfo<OZChannelPositionPercent3D>, %rdx
   *   0xa6975  movq %r14, %rdi                        ; src
   *   0xa6978  xorl %ecx, %ecx                        ; ptrdiff = 0
   *   0xa697a  callq __dynamic_cast(src, &TI<OZFactoryBase>,
   *                                 &TI<OZChannelPositionPercent3D>, 0)
   *   0xa697f  movq %rbx, %rdi                        ; new_block
   *   0xa6982  movq %rax, %rsi                        ; %rsi = cast result
   *   0xa6985  xorl %edx, %edx                        ; folder = nullptr
   *   0xa6987  callq OZChannelPosition3D::OZChannelPosition3D(
   *                    new_block, castedSrc, nullptr)    ; parent-class copy ctor
   *   0xa698c  leaq <vtable+X>, %rax
   *   0xa6993  movq %rax, (%rbx)                      ; REWRITE primary vptr
   *   0xa6996  leaq <vtable+Y>, %rax
   *   0xa699d  movq %rax, 0x10(%rbx)                  ; secondary vptr slot @+0x10
   *   0xa69a1  return new_block
   *
   * Key observation: this method SLICES the source through the PARENT
   * copy ctor (`OZChannelPosition3D::OZChannelPosition3D`), NOT the
   * subclass's own copy ctor. Then it fixes up the vptrs so the new
   * object's dynamic type is `OZChannelPositionPercent3D` (not
   * `OZChannelPosition3D`). This is only safe because
   * `OZChannelPositionPercent3D` adds NO new data members beyond its
   * parent — i.e., 0x378 == sizeof(OZChannelPosition3D). Confirmed by
   * the identical size literals in create() and createCopy().
   *
   * The two vtable-slot RIP-relative loads at 0xa698c and 0xa6996 write
   * ptrs into +0x00 and +0x10 (matching the two-vptr install pattern
   * of every OZChannel-lineage class); the exact vtable offsets aren't
   * yet resolved but the SITE addresses are cited above.
   */
  createCopy(src: unknown, _flags: number): unknown {
    const p = OperatorNew_stub(OZ_CHANNEL_POSITION_PERCENT_3D_SIZEOF);
    try {
      // __dynamic_cast(src, &typeinfo<OZFactoryBase>, &typeinfo<OZChannelPositionPercent3D>, 0)
      const casted = DynamicCast_stub(src, undefined, undefined, 0);
      // Parent-class copy ctor, folder = null.
      OZChannelPosition3D_copyCtor_stub(p, casted, null);
      // Vtable install into +0x00 and +0x10 is implicit in JS (prototype).
    } catch (e: unknown) {
      OperatorDelete_stub(p);
      UnwindResume_stub(e);
    }
    return p;
  }

  /**
   * `createInstance(OZFactoryBase*)` @ProChannel 0xa69bc.
   *
   *   0xa69c0  xorl %eax, %eax
   *   0xa69c2  popq %rbp; retq
   *
   * Returns `nullptr` unconditionally. This is the class's opt-out from
   * the "create-from-existing-factory-instance" pathway — a factory that
   * doesn't inherit instance state from another factory returns null.
   */
  createInstance(_src: unknown): null {
    return null;
  }

  /**
   * `createChannel(PCString const&, unsigned int)` @ProChannel 0xa6ac4.
   *
   * Byte-identical to `create()` — same 0x378 alloc, same OZChannelPositionPercent3D
   * C2 call, same exception path. In the C++ this is a distinct virtual
   * override (part of the OZChannelFactory interface, which
   * OZChannelPositionPercent3D_Factory implements), even though its body
   * happens to be the same as the non-virtual `create()`. See disasm
   * side-by-side @0xa68fe (create) vs @0xa6ac4 (createChannel).
   */
  createChannel(name: unknown, flags: number): unknown {
    const p = OperatorNew_stub(OZ_CHANNEL_POSITION_PERCENT_3D_SIZEOF);
    try {
      OZChannelPositionPercent3D_ctor_fs_stub(p, this, name, flags);
    } catch (e: unknown) {
      OperatorDelete_stub(p);
      UnwindResume_stub(e);
    }
    return p;
  }

  /**
   * `createChannelCopy(OZChannelBase* src, unsigned int flags)` @ProChannel 0xa6b16.
   *
   * Byte-identical to `createCopy()` — the only differences are the input
   * pointer type (`OZChannelBase*` vs `OZFactoryBase*`, reflected in a
   * different typeinfo constant fed to __dynamic_cast @0xa6b2d vs 0xa6967)
   * and the vtable-slot literals used to install vptrs after the parent
   * copy ctor returns (@0xa6b52/@0xa6b5c vs @0xa698c/@0xa6996). The
   * semantic shape is identical: slice through the parent copy ctor, then
   * re-vptr to our own dynamic type.
   */
  createChannelCopy(src: unknown, _flags: number): unknown {
    const p = OperatorNew_stub(OZ_CHANNEL_POSITION_PERCENT_3D_SIZEOF);
    try {
      const casted = DynamicCast_stub(src, undefined, undefined, 0);
      OZChannelPosition3D_copyCtor_stub(p, casted, null);
    } catch (e: unknown) {
      OperatorDelete_stub(p);
      UnwindResume_stub(e);
    }
    return p;
  }

  /**
   * `createChannelInstance(OZChannelBase*)` @ProChannel 0xa6b82.
   *
   *   0xa6b86  xorl %eax, %eax; ret
   *
   * Returns `nullptr` unconditionally, same as `createInstance`.
   */
  createChannelInstance(_src: unknown): null {
    return null;
  }
}
