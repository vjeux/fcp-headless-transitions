// raw-port/src/channels/OZFactory.ts
//
// FCP `OZFactory` (ProChannel.framework) — the abstract base class for the
// object factory registry. An OZFactory instance carries:
//   - a "self" PCUUID at +0x8 that identifies THIS factory,
//   - a "super" PCUUID at +0x18 that names the parent factory (chained
//     lookups walk via getSuperFactory() → OZFactories::findFactory(super)),
//   - a PCMutex at +0x38 guarding the +0x30 super-factory pointer cache,
//   - a flags word at +0x28 (u32) passed as the 3rd ctor arg,
//   - a per-thread (needsSaving, fileRefID) tuple accessed through the
//     `getThreadSpecificForFactory(OZFactory const*)` helper in an
//     anonymous namespace — the actual `needsSaving` bit and `fileRefID`
//     u32 live in that TLS block, NOT in the OZFactory instance itself.
//
// This file is the FAITHFUL transcription of the base class methods
// `__ZN9OZFactory*` in ProChannel (x86_64 slice; file offset 0x4000;
// VAs as reported by capstone linear sweep of /tmp/ProChannel.x86_64
// because most bodies are ICF-folded out of `otool -tV` output).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel (x86_64).
//
// Disassembly saved at:
//   raw-port/re/disasm/ProChannel.OZFactory.needsSaving.s        (@0x134c8)
//   raw-port/re/disasm/ProChannel.OZFactory.setNeedsSaving.s     (@0x1360c)
//   raw-port/re/disasm/ProChannel.OZFactory.fileRefID.s          (@0x13622)
//   raw-port/re/disasm/ProChannel.OZFactory.setFileRefID.s       (@0x13630)
//   raw-port/re/disasm/ProChannel.OZFactory.getSuperFactory.s    (@0x13648)
//   raw-port/re/disasm/ProChannel.OZFactory.isKindOfClass.s      (@0x136c8)
//   raw-port/re/disasm/ProChannel.OZFactory.getIconName.s        (@0x13712)
//   raw-port/re/disasm/ProChannel.OZFactory.getIconNameBW.s      (@0x137a4)
//   raw-port/re/disasm/ProChannel.OZFactory.getIconID.s          (@0x13836)
//   (C2 @0x13428 is ICF-folded and dumped inline from capstone below.)
//   (D2 @0x134b0 is ICF-folded and dumped inline from capstone below.)
//   (D0 @0xac15a, D1 @0xac154 both trap with `ud2` — verified via nm+capstone.)
//
// Ledger addresses (ProChannel.ledger.json):
//   0x13428   OZFactory::OZFactory(PCUUID self, PCUUID super, unsigned int flags)  [C2]
//   0x134b0   OZFactory::~OZFactory()                                              [D2]
//   0x134c8   OZFactory::needsSaving()
//   0x1360c   OZFactory::setNeedsSaving(bool)
//   0x13622   OZFactory::fileRefID()
//   0x13630   OZFactory::setFileRefID(unsigned int)
//   0x13648   OZFactory::getSuperFactory() const
//   0x136c8   OZFactory::isKindOfClass(PCUUID) const
//   0x13712   OZFactory::getIconName()
//   0x137a4   OZFactory::getIconNameBW()
//   0x13836   OZFactory::getIconID()
//   0x13a9e   OZFactory::getLibraryIconName()
//   0xac154   OZFactory::~OZFactory()                                              [D1 — ud2 trap]
//   0xac15a   OZFactory::~OZFactory()                                              [D0 — ud2 trap]
//
// STRUCT LAYOUT (recovered from C2 @0x13428 disasm):
//   OZFactory {
//     +0x00  vptr                                     (installed at @0x1343e
//                                                       to vtable+0x10 =
//                                                       0xd12cf; base-class
//                                                       vtable = 0xd12c8
//                                                       re-installed by D2)
//     +0x08  PCUUID  selfUUID     (movups xmm0, [rsi]; movups [rdi+0x8], xmm0
//                                   @0x13441..@0x13444; 16 bytes)
//     +0x18  PCUUID  superUUID    (movups xmm0, [rdx]; movups [rdi+0x18], xmm0
//                                   @0x13448..@0x1344b; 16 bytes)
//     +0x28  u32     flags        (`mov [r14+0x28], ebx` @0x13476)
//     +0x30  OZFactory* cachedSuper  (initialized to null @0x1344f; lazily
//                                     filled by getSuperFactory under mutex)
//     +0x38  PCMutex mutex          (PCMutex::PCMutex() called @0x1345e)
//   }
//   sizeof(OZFactory) ≈ 0x40 (PCMutex trailing size not counted; whatever
//                              PCMutex adds sits at +0x38..).
//
// TLS SHAPE (from needsSaving/fileRefID accessors):
//   struct FactoryTls {
//     u8   needsSaving;    (offset 0 in TLS block; read by @0x134d1, written
//                            by @0x13619)
//     /* padding to align next u32 */
//     u32  fileRefID;      (offset 4 in TLS block; read by @0x1362b, written
//                            by @0x1363d)
//   };
//   The TLS block is 8 bytes minimum; keyed by (thread, OZFactory*). The
//   allocator + `pthread_once` (@0xacf72 stub) initializer live in the
//   anonymous-namespace helper `getThreadSpecificForFactory` — currently
//   a frontier stub.

/* eslint-disable @typescript-eslint/no-unused-vars */

/** Opaque handle for ProChannel's `PCUUID` — 16 raw bytes. */
export interface PCUUID {
  readonly bytes: Uint8Array; // length === 16
}

/** Opaque handle for ProChannel's `PCMutex`. */
export interface PCMutex {
  readonly __brand: "PCMutex";
}

/**
 * Per-thread state block accessed by `(anonymous namespace)::
 * getThreadSpecificForFactory(OZFactory const*)` — see @0x134cc call
 * from needsSaving. The block is initialized-once (via `pthread_once`
 * @0xacf72 stub) and keyed by (thread, factory).
 */
export interface FactoryTls {
  needsSaving: boolean; // offset 0, u8
  fileRefID: number; // offset 4, u32
}

/**
 * TypeScript mirror of the recovered `OZFactory` object layout.
 */
export interface OZFactoryState {
  __vptr: string;
  /** +0x08 — 16-byte PCUUID identifying THIS factory. */
  selfUUID: PCUUID;
  /** +0x18 — 16-byte PCUUID naming the parent factory. */
  superUUID: PCUUID;
  /** +0x28 — u32 flags word (ctor arg). */
  flags: number;
  /** +0x30 — lazily-cached OZFactory* result of findFactory(superUUID). */
  cachedSuper: OZFactoryState | null;
  /** +0x38 — PCMutex protecting cachedSuper. */
  mutex: PCMutex;
}

/**
 * `OZFactory::OZFactory(PCUUID self, PCUUID super, unsigned int flags)`
 *
 * @ProChannel 0x13428 (`__ZN9OZFactoryC2E6PCUUIDS0_j`).
 *
 * Faithful transcription of the capstone linear-sweep disassembly of
 * /tmp/ProChannel.x86_64 at file offset 0x13428 (36 lines up to `ret`):
 *
 *   0x13428  push rbp; mov rbp, rsp; push r15/r14/rbx/rax
 *   0x13432  mov  ebx, ecx                    ; save flags arg (u32)
 *   0x13434  mov  r14, rdi                    ; save this
 *   0x13437  lea  rax, [rip + 0xbde8a]        ; = 0xd12cf (installed vptr =
 *                                              vtable-for-OZFactory + 0x10)
 *   0x1343e  mov  [rdi], rax                  ; this->vptr = vtable
 *   0x13441  movups xmm0, [rsi]               ; load 16 bytes: arg1 (self PCUUID)
 *   0x13444  movups [rdi + 0x8], xmm0         ; +0x8..+0x17 = selfUUID
 *   0x13448  movups xmm0, [rdx]               ; load 16 bytes: arg2 (super PCUUID)
 *   0x1344b  movups [rdi + 0x18], xmm0        ; +0x18..+0x27 = superUUID
 *   0x1344f  mov qword [rdi + 0x30], 0        ; cachedSuper = null
 *   0x13457  lea r15, [rdi + 0x38]            ; &this->mutex
 *   0x1345e  call 0xaccb4                     ; PCMutex::PCMutex() @stub 0xaccb4
 *   0x13463  lea rdi, [rip + 0xd83b6]         ; = &once_control @0xeb820
 *   0x1346a  lea rsi, [rip + 0x27]            ; = &init_fn @0x13498
 *   0x13471  call 0xacf72                     ; pthread_once @stub 0xacf72
 *   0x13476  mov [r14 + 0x28], ebx            ; this->flags = ebx
 *   0x1347a  add rsp, 8; pop rbx/r14/r15/rbp; ret
 *
 * The `pthread_once` at @0x13471 lazily initializes the TLS key used by
 * the anonymous-namespace `getThreadSpecificForFactory` helper (the same
 * function every accessor calls). The exception-cleanup tail at
 * @0x13485..@0x13493 destroys the PCMutex on unwind (`__ZN7PCMutexD1Ev`
 * @stub 0xaccc0, then `__Unwind_Resume` @stub 0xacaf2) — not modeled here
 * (TS doesn't have C++ unwind semantics; the mutex ctor is a stub anyway).
 */
export function OZFactory_C2(
  self: OZFactoryState,
  selfUUID: PCUUID,
  superUUID: PCUUID,
  flags: number,
): void {
  // @0x1343e — install vtable pointer. Installed ptr = 0xd12cf (from `leaq
  // [rip + 0xbde8a]` at @0x13437, rip = 0x13445).
  self.__vptr = "vtable-for-OZFactory @ProChannel 0xd12cf";
  // @0x13441..@0x13444 — copy 16 bytes of selfUUID into +0x8.
  self.selfUUID = { bytes: new Uint8Array(selfUUID.bytes) };
  // @0x13448..@0x1344b — copy 16 bytes of superUUID into +0x18.
  self.superUUID = { bytes: new Uint8Array(superUUID.bytes) };
  // @0x1344f — cachedSuper = null.
  self.cachedSuper = null;
  // @0x1345e — PCMutex::PCMutex() at +0x38.
  self.mutex = PCMutex_C1();
  // @0x13471 — pthread_once(&onceControl@0xeb820, factoryTlsKeyInit@0x13498).
  //   The one-time init installs the TLS key that
  //   `getThreadSpecificForFactory` uses; we defer to the frontier stub
  //   since neither pthread nor the anonymous-namespace helper are ported.
  factoryTlsPthreadOnce();
  // @0x13476 — store the flags argument (u32) at +0x28.
  self.flags = flags >>> 0;
}

/**
 * `OZFactory::~OZFactory()` — D2 base-object destructor.
 *
 * @ProChannel 0x134b0 (`__ZN9OZFactoryD2Ev`).
 *
 * Faithful transcription of capstone linear-sweep disasm at 0x134b0
 * (7 lines):
 *
 *   0x134b0  push rbp; mov rbp, rsp
 *   0x134b4  lea rax, [rip + 0xbde0d]         ; = 0xd12c8 (base-vtable +0x10)
 *   0x134bb  mov [rdi], rax                   ; reset vptr to base
 *   0x134be  add rdi, 0x38                    ; &this->mutex
 *   0x134c2  pop rbp
 *   0x134c3  jmp 0xaccc0                      ; tail: PCMutex::~PCMutex()
 *
 * The vtable-reset at @0x134bb is the standard "during base dtor, don't
 * dispatch to derived virtuals" trick — installed_ptr = 0xd12c8 is 7
 * bytes below the ctor's installed value (0xd12cf), i.e. a DIFFERENT
 * vtable object (base-class-only variant). We record the pointer address
 * in the brand string for provenance.
 */
export function OZFactory_D2(self: OZFactoryState): void {
  // @0x134b4..@0x134bb — reset vptr.
  self.__vptr = "vtable-for-OZFactory-base @ProChannel 0xd12c8";
  // @0x134be..@0x134c3 — tail-call PCMutex dtor at +0x38.
  PCMutex_D1(self.mutex);
}

/**
 * `OZFactory::~OZFactory()` — D1 (complete-object) destructor.
 *
 * @ProChannel 0xac154 (`__ZN9OZFactoryD1Ev`).
 *
 * Body (capstone @0xac154): `push rbp; mov rbp, rsp; ud2`. This class is
 * abstract with respect to D1 — the complete-object dtor traps because
 * no direct OZFactory instances exist; the derived classes install their
 * own D1 slots.
 */
export function OZFactory_D1(_self: OZFactoryState): never {
  throw new Error(
    "OZFactory::~OZFactory (D1 complete-object dtor) @ProChannel 0xac154 traps (ud2): abstract class has no direct instances",
  );
}

/**
 * `OZFactory::~OZFactory()` — D0 (deleting) destructor.
 *
 * @ProChannel 0xac15a (`__ZN9OZFactoryD0Ev`).
 *
 * Body (capstone @0xac15a): `push rbp; mov rbp, rsp; ud2`. Same as D1 —
 * abstract-class trap.
 */
export function OZFactory_D0(_self: OZFactoryState): never {
  throw new Error(
    "OZFactory::~OZFactory (D0 deleting dtor) @ProChannel 0xac15a traps (ud2): abstract class has no direct instances",
  );
}

/**
 * `OZFactory::needsSaving()` — return the per-thread "needs saving" bit.
 *
 * @ProChannel 0x134c8 (`__ZN9OZFactory11needsSavingEv`).
 *
 * Faithful transcription of raw-port/re/disasm/ProChannel.OZFactory.
 * needsSaving.s (7 lines):
 *
 *   0x134c8  push rbp; mov rbp, rsp
 *   0x134cc  callq __ZN12_GLOBAL__N_127getThreadSpecificForFactoryEPK9OZFactory
 *   0x134d1  movb  (%rax), %al                ; al = tls->needsSaving (u8)
 *   0x134d3  pop rbp; retq
 */
export function OZFactory_needsSaving(self: OZFactoryState): boolean {
  const tls = getThreadSpecificForFactory(self);
  // @0x134d1 — u8 read from offset 0 of the TLS block.
  return tls.needsSaving;
}

/**
 * `OZFactory::setNeedsSaving(bool)` — write the per-thread "needs saving"
 * bit.
 *
 * @ProChannel 0x1360c (`__ZN9OZFactory14setNeedsSavingEb`).
 *
 * Faithful transcription of raw-port/re/disasm/ProChannel.OZFactory.
 * setNeedsSaving.s (12 lines):
 *
 *   0x1360c  push rbp; mov rbp, rsp; push rbx; push rax
 *   0x13612  mov  ebx, esi                    ; save the bool arg
 *   0x13614  callq getThreadSpecificForFactory
 *   0x13619  movb %bl, (%rax)                 ; tls->needsSaving = bool
 *   0x1361b  add rsp, 8; pop rbx; pop rbp; ret
 */
export function OZFactory_setNeedsSaving(
  self: OZFactoryState,
  needsSaving: boolean,
): void {
  const tls = getThreadSpecificForFactory(self);
  // @0x13619 — u8 write to offset 0 of the TLS block.
  tls.needsSaving = needsSaving;
}

/**
 * `OZFactory::fileRefID()` — return the per-thread fileRefID (u32).
 *
 * @ProChannel 0x13622 (`__ZN9OZFactory9fileRefIDEv`).
 *
 * Faithful transcription of raw-port/re/disasm/ProChannel.OZFactory.
 * fileRefID.s (7 lines):
 *
 *   0x13622  push rbp; mov rbp, rsp
 *   0x13626  callq getThreadSpecificForFactory
 *   0x1362b  movl  0x4(%rax), %eax            ; eax = tls->fileRefID (u32)
 *   0x1362e  pop rbp; retq
 */
export function OZFactory_fileRefID(self: OZFactoryState): number {
  const tls = getThreadSpecificForFactory(self);
  // @0x1362b — u32 read from offset 4 of the TLS block.
  return tls.fileRefID >>> 0;
}

/**
 * `OZFactory::setFileRefID(unsigned int)` — write the per-thread fileRefID.
 *
 * @ProChannel 0x13630 (`__ZN9OZFactory12setFileRefIDEj`).
 *
 * Faithful transcription of raw-port/re/disasm/ProChannel.OZFactory.
 * setFileRefID.s (13 lines):
 *
 *   0x13630  push rbp; mov rbp, rsp; push rbx; push rax
 *   0x13636  mov  ebx, esi                    ; save the u32 arg
 *   0x13638  callq getThreadSpecificForFactory
 *   0x1363d  mov  [rax + 0x4], ebx            ; tls->fileRefID = arg
 *   0x13640  add rsp, 8; pop rbx; pop rbp; ret
 */
export function OZFactory_setFileRefID(
  self: OZFactoryState,
  fileRefID: number,
): void {
  const tls = getThreadSpecificForFactory(self);
  // @0x1363d — u32 write to offset 4 of the TLS block.
  tls.fileRefID = fileRefID >>> 0;
}

/**
 * `OZFactory::getSuperFactory() const` — return the parent factory.
 *
 * @ProChannel 0x13648 (`__ZNK9OZFactory15getSuperFactoryEv`).
 *
 * Lazy-caches the parent under `this->mutex`. Faithful transcription of
 * raw-port/re/disasm/ProChannel.OZFactory.getSuperFactory.s (40 lines):
 *
 *   0x13648  frame setup
 *   0x13654  mov  rax, [rdi + 0x30]           ; cached super
 *   0x13658  test rax, rax; jne 0x136a0       ; if cached, return it
 *   0x1365d  lea  rdi, [rbx + 0x38]           ; &this->mutex
 *   0x13665  callq PCMutex::lock()   @stub 0xacca8
 *   0x1366a  mov byte [rbp - 0x10], 1         ; sentry: mutex held
 *   0x1366e  mov  rax, [rbx + 0x30]           ; re-read cached after lock
 *   0x13675  test rax, rax; jne 0x1368c       ; still null? do the lookup
 *   0x13677  callq OZFactories::getInstance()
 *   0x1367c  lea  rsi, [rbx + 0x18]           ; &this->superUUID
 *   0x13683  callq OZFactories::findFactory(PCUUID const&)
 *   0x13688  xchgq %rax, [rbx + 0x30]         ; publish + atomic swap
 *   0x1368c..0x1369b  release the mutex (PCMutex::unlock @stub 0xaccae)
 *   0x136a0  mov  rax, [rbx + 0x30]           ; final load
 *   0x136a4  epilogue: return rax
 *
 * The `xchgq` (rather than `movq`) does a full 64-bit atomic swap — the
 * old value is discarded (rax is overwritten by the epilogue's re-read at
 * @0x136a0). This is the classic double-checked-locking cache.
 *
 * The exception-cleanup tail (@0x136b3..@0x136c2) drops the
 * `PCLockSentry<PCMutex>` via `__ZN12PCLockSentryI7PCMutexED1Ev` and
 * calls `__Unwind_Resume`. Not modeled here (no unwind in TS; the mutex
 * stub throws immediately if not present).
 */
export function OZFactory_getSuperFactory(
  self: OZFactoryState,
): OZFactoryState | null {
  // @0x13654..@0x1365b — fast path: return cached.
  if (self.cachedSuper !== null) {
    return self.cachedSuper;
  }
  // @0x13665..@0x1366e — take the mutex, re-check.
  PCMutex_lock(self.mutex);
  try {
    // @0x1366e..@0x13675 — double-check under lock.
    if (self.cachedSuper === null) {
      // @0x13677 — OZFactories::getInstance() (singleton).
      const registry = OZFactories_getInstance();
      // @0x13683 — OZFactories::findFactory(&this->superUUID).
      const found = OZFactories_findFactory(registry, self.superUUID);
      // @0x13688 — xchgq: atomic swap (we assign; the old value was null
      //   by the guard above so xchg == store here).
      self.cachedSuper = found;
    }
  } finally {
    // @0x1369b — PCMutex::unlock().
    PCMutex_unlock(self.mutex);
  }
  // @0x136a0 — final load and return.
  return self.cachedSuper;
}

/**
 * `OZFactory::isKindOfClass(PCUUID) const` — walk the factory chain and
 * return true iff any ancestor's `selfUUID` equals the query.
 *
 * @ProChannel 0x136c8 (`__ZNK9OZFactory13isKindOfClassE6PCUUID`).
 *
 * Faithful transcription of raw-port/re/disasm/ProChannel.OZFactory.
 * isKindOfClass.s (30 lines):
 *
 *   0x136c8  test rdi, rdi; je 0x13705       ; null this → return false
 *   0x136d3  mov rbx, rsi                    ; save query PCUUID pointer
 *   0x136d6  mov rax, rdi                    ; walker = this
 *   0x136d9  movdqu xmm0, [rax + 0x8]        ; xmm0 = walker->selfUUID (16B)
 *   0x136de  ptest xmm0, xmm0                ; is selfUUID all-zeros?
 *   0x136e3  je 0x13701                      ; all-zero → return false
 *   0x136e5  movdqu xmm1, [rbx]              ; xmm1 = query
 *   0x136e9  pxor xmm1, xmm0                 ; xmm0 ^= query
 *   0x136ed  ptest xmm0, xmm0                ; equal? (xor is all-zero)
 *   0x136f2  je 0x13708                      ; equal → return true
 *   0x136f4  mov rdi, rax                    ; else walker = getSuperFactory(walker)
 *   0x136f7  callq __ZNK9OZFactory15getSuperFactoryEv
 *   0x136fc  test rax, rax; jne 0x136d9      ; loop while non-null
 *   0x13701  xorl eax, eax; jmp epilogue     ; return false (u8 in al)
 *   0x13708  movb $1, %al                    ; return true
 *   0x13701..0x13710 epilogue
 *
 * The `ptest xmm0, xmm0` after xor is the "PCUUID equality" check: if the
 * xor is all zeros, the two UUIDs are byte-identical. The `ptest` before
 * that is a "is this UUID nil" short-circuit — an all-zero UUID is
 * treated as "no super", terminating the walk.
 *
 * NOTE: The `rax` in the SIMD loop is REassigned by getSuperFactory's
 * return value; the loop invariant is `walker = rax`. We mirror it with
 * an explicit while.
 */
export function OZFactory_isKindOfClass(
  self: OZFactoryState | null,
  query: PCUUID,
): boolean {
  // @0x136c8..@0x136cb — null-this → false.
  if (self === null) {
    return false;
  }
  let walker: OZFactoryState | null = self;
  while (walker !== null) {
    // @0x136d9 — load walker->selfUUID.
    const uuid = walker.selfUUID.bytes;
    // @0x136de..@0x136e3 — ptest for all-zero (nil UUID → terminate).
    let anySet = false;
    for (let i = 0; i < 16; i++) {
      if (uuid[i] !== 0) {
        anySet = true;
        break;
      }
    }
    if (!anySet) {
      // @0x13701 — return false.
      return false;
    }
    // @0x136e5..@0x136f2 — compare 16 bytes of query vs walker->selfUUID.
    let equal = true;
    for (let i = 0; i < 16; i++) {
      if (uuid[i] !== query.bytes[i]) {
        equal = false;
        break;
      }
    }
    if (equal) {
      // @0x13708 — return true.
      return true;
    }
    // @0x136f4..@0x136fc — walker = getSuperFactory(walker); loop.
    walker = OZFactory_getSuperFactory(walker);
  }
  // @0x13701 — end of chain.
  return false;
}

/**
 * `OZFactory::getIconID()` — walk the factory chain and return the first
 * non-(-1) icon id from any ancestor's `getIconID` virtual (vtable slot
 * *0x98).
 *
 * @ProChannel 0x13836 (`__ZN9OZFactory9getIconIDEv`).
 *
 * Faithful transcription of raw-port/re/disasm/ProChannel.OZFactory.
 * getIconID.s (29 lines):
 *
 *   0x13836  frame; test rdi, rdi; je 0x13865  ; null → -1
 *   0x13841  mov rbx, rdi                       ; walker = this
 *   0x13844  mov rax, [rbx]                     ; vtable
 *   0x13847  mov rdi, rbx
 *   0x1384a  callq *0x98(rax)                   ; walker->vt[0x98]() (virtual)
 *   0x13850  cmp eax, -1; jne 0x13871           ; got a real id → return it
 *   0x13855  mov rdi, rbx
 *   0x13858  callq OZFactory::getSuperFactory()
 *   0x1385d  mov rbx, rax; test rax, rax; jne 0x13844  ; keep walking
 *   0x13865  mov eax, 0xffffffff                ; return -1
 *   0x13871  tail-call *0x98(rax) via jmpq      ; return the found id
 *
 * The last tail-call at @0x1387d is a `jmpq *0x98(%rax)` — the walker's
 * vtable[0x98] is re-invoked for the return value (which the CPU expects
 * in %eax). Semantically identical to `return walker->vt[0x98]()`.
 *
 * Vtable slot *0x98 is `getIconID()` on the concrete factory subclass.
 * We model it as a frontier stub `Factory_vt_0x98_getIconID`.
 */
export function OZFactory_getIconID(self: OZFactoryState | null): number {
  // @0x13836..@0x1383f — null → -1.
  if (self === null) {
    return -1 >>> 0 ? -1 : -1; // canonical -1 (i32); JS number handles it fine.
  }
  let walker: OZFactoryState | null = self;
  while (walker !== null) {
    // @0x13844..@0x1384a — virtual dispatch to *0x98 = getIconID.
    const id = Factory_vt_0x98_getIconID(walker);
    // @0x13850..@0x13853 — return if not -1.
    if (id !== -1) {
      return id | 0;
    }
    // @0x13855..@0x1385d — walker = getSuperFactory(walker).
    walker = OZFactory_getSuperFactory(walker);
  }
  // @0x13865 — end of chain.
  return -1;
}

// ─── Undecoded frontier — throwing stubs (Rule 3: cite @0xADDR) ────────────

/**
 * `OZFactory::getIconName()` — sret PCString return, walks factory chain
 * calling vtable *0x88 on each; returns the first non-empty PCString or
 * an empty PCString if the chain terminates.
 *
 * @ProChannel 0x13712 (`__ZN9OZFactory11getIconNameEv`).
 *
 * NOT YET TRANSCRIBED — PCString ctor/dtor/empty/copy calls at stubs
 * 0xacd1a/0xacd20/0xacd9e are not modeled; the sret ABI (returning
 * PCString by value through %rdi) is class-specific.
 */
export function OZFactory_getIconName(
  _self: OZFactoryState,
): never {
  throw new Error(
    "OZFactory::getIconName @ProChannel 0x13712 not yet transcribed (needs PCString sret ABI + vtable *0x88 subclass hook)",
  );
}

/**
 * `OZFactory::getIconNameBW()` — same chain-walk pattern as getIconName
 * but with vtable slot *0x90 (getIconNameBW) instead of *0x88.
 *
 * @ProChannel 0x137a4 (`__ZN9OZFactory13getIconNameBWEv`).
 *
 * NOT YET TRANSCRIBED — same PCString + vtable dependency as getIconName.
 */
export function OZFactory_getIconNameBW(
  _self: OZFactoryState,
): never {
  throw new Error(
    "OZFactory::getIconNameBW @ProChannel 0x137a4 not yet transcribed (needs PCString sret ABI + vtable *0x90 subclass hook)",
  );
}

/**
 * `OZFactory::getLibraryIconName()` — chain-walk with vtable slot *0xa0
 * (getLibraryIconName), plus a name-conversion vtable *0x80 tail call.
 *
 * @ProChannel 0x13a9e (`__ZN9OZFactory18getLibraryIconNameEv`).
 *
 * NOT YET TRANSCRIBED — needs PCString ABI + vtable *0xa0 + *0x80.
 */
export function OZFactory_getLibraryIconName(
  _self: OZFactoryState,
): never {
  throw new Error(
    "OZFactory::getLibraryIconName @ProChannel 0x13a9e not yet transcribed (needs PCString sret ABI + vtable *0xa0 subclass hook + *0x80 conversion)",
  );
}

// ─── Cross-file frontier stubs (Rule 3: cite @0xADDR) ──────────────────────

/**
 * Frontier: `(anonymous namespace)::getThreadSpecificForFactory(OZFactory
 * const*)` — the TLS accessor every needsSaving/fileRefID call goes
 * through. Address of the anonymous-namespace function is not exposed as
 * a public symbol; its call sites are @0x134cc (needsSaving), @0x13614
 * (setNeedsSaving), @0x13626 (fileRefID), @0x13638 (setFileRefID).
 * pthread_once-guarded (@0x13471 in C2) key installation lives inside.
 */
function getThreadSpecificForFactory(_self: OZFactoryState): FactoryTls {
  throw new Error(
    "(anonymous namespace)::getThreadSpecificForFactory @ProChannel __ZN12_GLOBAL__N_127getThreadSpecificForFactoryEPK9OZFactory not yet transcribed (called from OZFactory accessors @0x134cc/@0x13614/@0x13626/@0x13638)",
  );
}

/**
 * Frontier: `pthread_once` @stub 0xacf72, called from OZFactory::C2
 * @0x13471 with the ProChannel-global once-control at @0xeb820 and the
 * init function at @0x13498 (which sets up the TLS key for the anonymous-
 * namespace `getThreadSpecificForFactory`).
 */
function factoryTlsPthreadOnce(): void {
  throw new Error(
    "pthread_once @ProChannel __stubs 0xacf72 (called from OZFactory::C2 @0x13471 with once-control @0xeb820 + init fn @0x13498) not yet transcribed",
  );
}

/**
 * Frontier: `PCMutex::PCMutex()` @stub 0xaccb4 (a.k.a. `__ZN7PCMutexC1Ev`).
 * Called from OZFactory::C2 @0x1345e.
 */
function PCMutex_C1(): PCMutex {
  throw new Error(
    "PCMutex::PCMutex @ProChannel __stubs 0xaccb4 (called from OZFactory::C2 @0x1345e) not yet transcribed",
  );
}

/**
 * Frontier: `PCMutex::~PCMutex()` @stub 0xaccc0 (a.k.a. `__ZN7PCMutexD1Ev`).
 * Called from OZFactory::D2 @0x134c3 (tail-jmp).
 */
function PCMutex_D1(_m: PCMutex): void {
  throw new Error(
    "PCMutex::~PCMutex @ProChannel __stubs 0xaccc0 (called from OZFactory::D2 @0x134c3) not yet transcribed",
  );
}

/**
 * Frontier: `PCMutex::lock()` @stub 0xacca8 (a.k.a. `__ZN7PCMutex4lockEv`).
 * Called from OZFactory::getSuperFactory @0x13665.
 */
function PCMutex_lock(_m: PCMutex): void {
  throw new Error(
    "PCMutex::lock @ProChannel __stubs 0xacca8 (called from OZFactory::getSuperFactory @0x13665) not yet transcribed",
  );
}

/**
 * Frontier: `PCMutex::unlock()` @stub 0xaccae (a.k.a. `__ZN7PCMutex6unlockEv`).
 * Called from OZFactory::getSuperFactory @0x1369b.
 */
function PCMutex_unlock(_m: PCMutex): void {
  throw new Error(
    "PCMutex::unlock @ProChannel __stubs 0xaccae (called from OZFactory::getSuperFactory @0x1369b) not yet transcribed",
  );
}

/**
 * Frontier: `OZFactories::getInstance()` (singleton accessor). Called
 * from OZFactory::getSuperFactory @0x13677.
 */
function OZFactories_getInstance(): OZFactoriesRegistry {
  throw new Error(
    "OZFactories::getInstance @ProChannel __ZN11OZFactories11getInstanceEv (called from OZFactory::getSuperFactory @0x13677) not yet transcribed",
  );
}

/**
 * Frontier: `OZFactories::findFactory(PCUUID const&)` @ProChannel. Called
 * from OZFactory::getSuperFactory @0x13683.
 */
function OZFactories_findFactory(
  _registry: OZFactoriesRegistry,
  _uuid: PCUUID,
): OZFactoryState | null {
  throw new Error(
    "OZFactories::findFactory @ProChannel __ZN11OZFactories11findFactoryERK6PCUUID (called from OZFactory::getSuperFactory @0x13683) not yet transcribed",
  );
}

/** Opaque handle for the OZFactories singleton returned by getInstance(). */
export interface OZFactoriesRegistry {
  readonly __brand: "OZFactoriesRegistry";
}

/**
 * Frontier: virtual vtable slot *0x98 on a concrete OZFactory subclass —
 * `int getIconID()`. Called from OZFactory::getIconID @0x1384a and @0x1387d.
 */
function Factory_vt_0x98_getIconID(_walker: OZFactoryState): number {
  throw new Error(
    "OZFactory vtable *0x98 getIconID @ProChannel (called from OZFactory::getIconID @0x1384a) not yet transcribed (concrete subclass hook)",
  );
}
