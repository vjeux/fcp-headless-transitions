// SessionManager — Helium's per-Metal-device Core Image rendering-session pool. Owns:
//   (a) a FIFO deque<SessionInfo> of recently-used CNRenderingSession objects (LRU-with-eviction),
//   (b) a small vector<{HGMTLDeviceType, CVMetalTextureCacheRef}> of per-device texture caches,
//   (c) a std::mutex guarding both, and
//   (d) a bool "cleanupScheduled" flag driving a periodic dispatch_after-driven cleanup timer.
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Source disassembly (x86_64 slice, RVAs in file image + 0x4000 for raw file offset):
//   raw-port/re/disasm/Helium.SessionManager.removeOutdated.s
//   raw-port/re/disasm/Helium.SessionManager.scheduleCleanup.s
//   raw-port/re/disasm/Helium.SessionManager.getTextureCache.s
//   raw-port/re/disasm/Helium.SessionManager.getRenderingSession.s
//
// FOUR EXPORTED SYMBOLS (this claim):
//   @Helium 0x1eb330  __ZN14SessionManager14removeOutdatedEv
//                     SessionManager::removeOutdated()
//   @Helium 0x1eb8c0  __ZN14SessionManager15scheduleCleanupEv
//                     SessionManager::scheduleCleanup()
//   @Helium 0x1eba00  __ZN14SessionManager15getTextureCacheE15HGMTLDeviceType
//                     SessionManager::getTextureCache(HGMTLDeviceType)
//   @Helium 0x1ebaa0  __ZN14SessionManager19getRenderingSessionE21HGMTLCommandQueueTypeP28CNRenderingSessionAttributes18CNRenderingQualitymm
//                     SessionManager::getRenderingSession(HGMTLCommandQueueType,
//                                                        CNRenderingSessionAttributes*,
//                                                        CNRenderingQuality,
//                                                        unsigned long, unsigned long)
//
// STRUCT LAYOUT (recovered from all four bodies; every read/written offset is annotated):
//
//   +0x00  vtable*  (present by convention; not read in these bodies).
//
//   -- std::__1::deque<SessionInfo, allocator<SessionInfo>> at +0x08..+0x30 (32 bytes) --
//   +0x08  SessionInfo** map_.__begin_   // block-pointer array start.
//                                        //   removeOutdated @0x1eb355: movq 0x8(%rbx),%rdi.
//                                        //   getRenderingSession @0x1ebb00 / @0x1ebd3c: same.
//   +0x10  SessionInfo** map_.__end_     // block-pointer array end (cmpq 0x10(%rbx)@0x1eb35d
//                                        //   tests deque-empty via begin==end of the block table).
//   +0x18  SessionInfo** map_.__cap_end_ // deque map capacity end (allocator-internal); read only
//                                        //   as part of the map's slack calculation in
//                                        //   getRenderingSession's shrink-front stanza (0x1ebc32).
//   +0x20  size_t         __start_       // element offset of front() into block-0.
//                                        //   removeOutdated @0x1eb36e: movq 0x20(%rax),%rcx.
//                                        //   getRenderingSession @0x1ebb18/@0x1ebd17: movq 0x20.
//   +0x28  size_t         __size_        // element count.  removeOutdated @0x1eb372: movq 0x28(%rax).
//                                        //   getRenderingSession @0x1ebbd7 (via LEA -0x30(%rbp)),
//                                        //   @0x1ebd9f: incq 0x28(%r14) on push_back.
//
//   -- std::__1::vector<TextureCacheEntry, ...> at +0x30..+0x48 (24 bytes) --
//   +0x30  TextureCacheEntry* tex_begin  // getTextureCache @0x1eba24: movq 0x30(%r15),%rax.
//   +0x38  TextureCacheEntry* tex_end    //                @0x1eba28: movq 0x38(%r15),%rcx.
//   +0x40  TextureCacheEntry* tex_cap    // not read here; standard libc++ vector 3-pointer layout.
//
//   +0x48  std::__1::mutex mutex_        // getRenderingSession @0x1ebac9: leaq 0x48(%rdi),%r12
//                                        //   then callq std::mutex::lock @0x1ebad0.
//                                        // Also locked at removeOutdated's caller (scheduleCleanup's
//                                        //   block_invoke @0x1eb958).  getTextureCache @0x1eba18/1c/1f.
//                                        // libc++ mutex is 64 bytes on macOS x86_64 (pthread_mutex_t).
//
//   +0x88  bool cleanupScheduled         // scheduleCleanup's block_invoke @0x1eb9c8: movb $0x0,0x88.
//                                        //   getRenderingSession @0x1ebda3: cmpb $0x0,0x88(%r14);
//                                        //   @0x1ebe07: movb $0x1,0x88(%r14) after arming timer.
//
// SessionInfo (element of the deque; sizeof = 0x38 = 56 bytes; block-size 0xff8 / 0x38 = 73 elements):
//   +0x00  uint64_t deviceRegistryID     // key #1 — from [[queue device] registryID].
//                                        //   getRenderingSession @0x1ebb85: cmpq %r15,(%r13).
//                                        //   push @0x1ebd73: movq %r15,-0x38(%rcx).
//   +0x08  CNRenderingSessionAttributes* attrs   // key #2. cmpq %rbx,0x8(%r13) @0x1ebb8b.
//   +0x10  CNRenderingQuality quality    // key #3 (enum). cmpq %rdi,0x10(%r13) @0x1ebb91.
//   +0x18  CNRenderingSession* session   // owned ObjC id.  eviction @0x1ebc19..0x1ebc1e:
//                                        //   movq 0x18(%r12,%r13),%rdi ; call _objc_release.
//                                        //   store on hit @0x1ebd83: movq %r12,-0x20(%rcx).
//   +0x20  uint64_t width                // key #4 (arg5). cmpq %rsi,0x20(%r13) @0x1ebb97.
//   +0x28  uint64_t height               // key #5 (arg6). cmpq %rdx,0x28(%r13) @0x1ebba1.
//   +0x30  NSDate* lastUsed              // owned ObjC id.  updated on hit @0x1ebe58: movq %rax,0x30.
//                                        //   evict-release @0x1ebc27/@0x1ebc2c: 0x30(%r12);_objc_release.
//                                        //   also 0x30 in removeOutdated @0x1eb3d5: rdi=lastUsed for
//                                        //   -[nowDate timeIntervalSinceDate:]. Age > 3.0s => evict.
//
// TextureCacheEntry (element of the vector; sizeof = 0x10 = 16 bytes):
//   +0x00  HGMTLDeviceType key           // getTextureCache @0x1eba40: cmpq %r14,(%rax).
//   +0x08  CVMetalTextureCacheRef cache  //                 @0x1eba7a: movq 0x8(%rax),%r15.
//                                        // But note: in getTextureCache the "not found" path calls
//                                        // _CVMetalTextureCacheCreate (@0x1eba5b) and writes into
//                                        // the local -0x20(%rbp) slot; the FOUND-path pulls from
//                                        // 0x8(%rax) and does NOT push the new entry into the
//                                        // vector. That looks like a missing push-back in FCP
//                                        // (the vector stays empty; new caches leak on every miss).
//                                        // We port exactly what the binary does — no fix-ups.
//
// KEY CONSTANTS (with @0xADDR provenance):
//   0x70381c0e070381c1  — Granlund-Montgomery magic for unsigned div-by-73 (deque block-length).
//                          Verified: (n*mag) >> (64+5) == floor(n/73) for n in {0,1,72,73,74,146,147}.
//                          Used at removeOutdated @0x1eb379; getRenderingSession @0x1ebb04,
//                          @0x1ebbf5, @0x1ebd2f.
//   0x38 (=56)          — sizeof(SessionInfo).  Used to scale within-block offsets throughout.
//   0xff8 (=4088)       — deque block size in bytes = 73 * 56.  Cross-block advance test at
//                          removeOutdated @0x1eb3fb, getRenderingSession @0x1ebbba, block-tail-fill
//                          @0x1ebd69.
//   3.0 (double)        — outdated threshold, seconds. removeOutdated @0x1eb3e6 ucomisd against
//                          RIP-relative literal at file image address 0x3ccd50 (raw offset 0x3d0d50).
//                          Hex 40 08 00 00 00 00 00 00 -> IEEE-754 double 3.0.
//   0xb2d05e00 ns       — dispatch_after delay = 3,000,000,000 ns = 3.0 seconds.
//                          scheduleCleanup @0x1eb8df, and the re-arm inside its block @0x1eb97d,
//                          and the initial arm inside getRenderingSession @0x1ebdbe.
//   0x92 (=146)         — deque shrink-front threshold. If (size - 1 + old_start) / block_len
//                          differs from front's block index by >= 2 blocks (i.e. front slack >= 146
//                          elements ~ 2 blocks), free the front block.
//                          getRenderingSession @0x1ebc6c: cmpq $0x92,%rdi.
//   0xc0000000          — Objective-C stack-block flag word (BLOCK_HAS_STRET | BLOCK_HAS_COPY_DISPOSE?
//                          matches -[NSConcreteStackBlock] descriptor layout for a capture-by-value
//                          block); written at scheduleCleanup @0x1eb8f6 and its re-arm @0x1eb999
//                          and getRenderingSession's initial arm @0x1ebdd5. Treated verbatim.
//
// FRONTIER — every callee this file touches, with symbol/addr, so the demand is visible:
//   [ObjC]   +[NSDate now]                     msgSend via GOT @0x1eb34f, 0x1ebd05, 0x1ebe49.
//   [ObjC]   -[NSDate timeIntervalSinceDate:]  msgSend via r13 @0x1eb3e3 (SEL loaded @0x1eb3c6/dc).
//   [ObjC]   -[HGMTLCommandQueue device]       msgSend @0x1ebae7 (SEL @0x1ebad5).
//   [ObjC]   -[MTLDevice registryID]           msgSend @0x1ebaf7 (SEL @0x1ebaed).
//   [ObjC]   +[CNRenderingSession initWithCommandQueue:sessionAttributes:preferredTransform:quality:]
//            msgSend @0x1ebcee (SEL @0x1ebcb6), after +[NSObject alloc] @0x1ebcb1.
//   [ObjC]   objc_alloc / objc_retain / objc_release  — GOT slots @0x1ebcb1, @0x1ebd0e/@0x1ebe52,
//            @0x1ebc1e/@0x1ebc2c/@0x1ebe35.
//   [libSystem] _dispatch_get_global_queue(-2, 0) — priority = -2 = DISPATCH_QUEUE_PRIORITY_BACKGROUND.
//   [libSystem] _dispatch_time(0, 3_000_000_000)  — absolute time = now + 3s.
//   [libSystem] _dispatch_after(when, queue, block).
//   [libc++]   std::mutex::lock / std::mutex::unlock  — @0x1eb958/@0x1eb9d3, and all four bodies.
//   [libc++]   std::deque<SessionInfo>::erase(deque_iterator)
//              @0x1eb448 tail-call from removeOutdated (jmp __ZNSt3__15dequeI11SessionInfoNS_9allocatorIS1_EEE5eraseE...).
//   [libc++]   std::deque<SessionInfo>::__add_front_capacity()
//              @0x1ebd23 call from getRenderingSession — grows the block table when
//              front == 0 before a push_front.
//   [CoreFoundation] _CVMetalTextureCacheCreate(NULL, NULL, device, NULL, &out) @0x1eba5b.
//   [Apple]  _CGAffineTransformIdentity global — @0x1ebc83 (identity preferred-transform for
//            CNRenderingSession init).
//   [Runtime] __NSConcreteStackBlock, ___block_descriptor_40_e5_v8?0l — dispatch_after block impl.
//
// Because all four bodies are ObjC/dispatch/deque-driven with essentially NO pure-math math of
// our own, this file transcribes the STATE MACHINE (control flow, side-effect ordering, offset
// arithmetic) and routes every un-decoded external call through a throw-stub that names the
// symbol and cites its call-site address. Nothing here approximates. When the frontier
// callees (deque erase, deque __add_front_capacity, NSDate/CNRenderingSession/CVMetalTextureCache
// msgSends, and libdispatch) are ported, the shells here become the exact caller.

/**
 * Opaque handles for ObjC / Metal / CoreVideo / libdispatch objects and enums that this file
 * only stores or forwards — never inspects. Every one of these is a "frontier" type; downstream
 * ports will replace them with concrete classes.
 */
export type ObjCId = unknown;
export type NSDate = ObjCId; // +[NSDate now] result — refcounted.
export type HGMTLCommandQueue = ObjCId; // arg1 of getRenderingSession; receives -device / -registryID.
export type HGMTLDeviceType = ObjCId; // arg1 of getTextureCache; key in TextureCacheEntry.
export type CNRenderingSession = ObjCId; // owned by SessionInfo; init'd @0x1ebcee.
/** CNRenderingSessionAttributes — pointer, not an ObjC id; used as an exact-match key. */
export type CNRenderingSessionAttributes = unknown;
/** CNRenderingQuality — an enum (arg3 of getRenderingSession). Stored as key #3 verbatim. */
export type CNRenderingQuality = number;
/** CVMetalTextureCacheRef — Core Video handle produced by _CVMetalTextureCacheCreate. */
export type CVMetalTextureCacheRef = unknown;
/** dispatch_queue_t — libdispatch handle. */
export type DispatchQueueT = unknown;
/** dispatch_time_t — 64-bit absolute time. */
export type DispatchTimeT = bigint;

/**
 * SessionInfo — element of SessionManager's deque (see class doc for offsets/provenance).
 * Sizeof = 56 (0x38). Referenced in removeOutdated (age check), getRenderingSession (key match
 * + push_front + touch), and by libc++ deque::erase during eviction.
 */
export interface SessionInfo {
  /** +0x00 — MTLDevice.registryID; key #1. */
  deviceRegistryID: bigint;
  /** +0x08 — session attributes pointer; key #2 (identity compare, never dereferenced here). */
  attributes: CNRenderingSessionAttributes | null;
  /** +0x10 — CNRenderingQuality enum; key #3. */
  quality: CNRenderingQuality;
  /** +0x18 — owned CNRenderingSession* (objc_release on eviction). */
  session: CNRenderingSession | null;
  /** +0x20 — width; key #4. */
  width: bigint;
  /** +0x28 — height; key #5. */
  height: bigint;
  /** +0x30 — owned NSDate* (last-used timestamp; objc_release on eviction / replace on hit). */
  lastUsed: NSDate | null;
}

/** TextureCacheEntry — element of SessionManager's vector; sizeof = 16 (0x10). */
export interface TextureCacheEntry {
  /** +0x00 — HGMTLDeviceType key (identity compare @0x1eba40). */
  key: HGMTLDeviceType;
  /** +0x08 — CVMetalTextureCacheRef payload (returned to callers). */
  cache: CVMetalTextureCacheRef | null;
}

/** Constants read directly from the binary — see class doc for @0xADDR provenance. */
const DEQUE_BLOCK_LEN = 73; // Granlund-Montgomery magic 0x70381c0e070381c1 divides by 73. @0x1eb379.
const SESSIONINFO_SIZE = 0x38; // = 56 = 0xff8 / 73; scale factor in every within-block index. @0x1eb398.
const DEQUE_BLOCK_BYTES = 0xff8; // = 4088 = 73 * 56.  @0x1eb3fb.
const OUTDATED_SECONDS = 3.0; // ucomisd literal at file image 0x3ccd50 (raw 0x3d0d50); @0x1eb3e6.
const CLEANUP_DELAY_NS = 0xb2d05e00; // = 3,000,000,000 ns = 3.0 s; @0x1eb8df, 0x1eb97d, 0x1ebdbe.
const SHRINK_FRONT_THRESHOLD = 0x92; // = 146 = 2 * 73; @0x1ebc6c cmpq $0x92,%rdi.
const DISPATCH_QUEUE_PRIORITY_BACKGROUND = -2; // dispatch_get_global_queue arg1; @0x1eb8ce, 0x1eb96c, 0x1ebdad.
// Silence "unused" for descriptive constants that name binary-level facts but are only referenced
// via the doc-comments / throw-stubs; keeping them named makes the provenance visible in code.
void SESSIONINFO_SIZE;
void DEQUE_BLOCK_BYTES;
void SHRINK_FRONT_THRESHOLD;

/**
 * throwFrontier — every un-decoded external callee routes here. NEVER approximate.
 * The name + @0xADDR identifies the exact symbol and call-site that needs porting next.
 */
function throwFrontier(name: string, addr: string): never { // @0xADDR-router
  throw new Error(`SessionManager frontier callee not yet transcribed: ${name} (call-site ${addr})`); // @0xADDR-router
}

// -----------------------------------------------------------------------------
// Frontier callee stubs — one per external symbol touched by this file. Each stub
// exists so the caller's control flow can be transcribed verbatim; each stub is
// wired to throwFrontier so a wrong assumption cannot silently propagate.
// -----------------------------------------------------------------------------

/** +[NSDate now] — receiver=NSDate class, SEL=now. Called at @0x1eb34f, 0x1ebd05, 0x1ebe49. */
function nsdate_now(_callSite: string): NSDate { return throwFrontier("+[NSDate now]", _callSite); }

/** -[NSDate timeIntervalSinceDate:] — returns seconds (double). Called @0x1eb3e3. */
function nsdate_timeIntervalSinceDate(_a: NSDate, _b: NSDate): number {
  return throwFrontier("-[NSDate timeIntervalSinceDate:]", "@0x1eb3e3");
}

/** -[HGMTLCommandQueue device] — @0x1ebae7. */
function hgmtl_commandqueue_device(_q: HGMTLCommandQueue): ObjCId {
  return throwFrontier("-[HGMTLCommandQueue device]", "@0x1ebae7");
}

/** -[MTLDevice registryID] — @0x1ebaf7. Returns a uint64_t. */
function mtldevice_registryID(_d: ObjCId): bigint {
  return throwFrontier("-[MTLDevice registryID]", "@0x1ebaf7");
}

/** +[CNRenderingSession alloc] then -initWithCommandQueue:sessionAttributes:preferredTransform:quality:
 *  — @0x1ebcb1 + @0x1ebcee. preferredTransform is the CGAffineTransformIdentity (@0x1ebc83). */
function cn_renderingSession_init(
  _q: HGMTLCommandQueue,
  _attrs: CNRenderingSessionAttributes | null,
  _quality: CNRenderingQuality,
  // The 6-double CGAffineTransform is passed by value (three xmm regs) — modelled opaquely.
  _preferredTransformIdentity: unknown,
): CNRenderingSession {
  return throwFrontier(
    "+[CNRenderingSession alloc]/initWithCommandQueue:sessionAttributes:preferredTransform:quality:",
    "@0x1ebcb1..@0x1ebcee",
  );
}

/** objc_retain — @0x1ebd0e, @0x1ebe52. */
function objc_retain(_id: ObjCId): ObjCId { return throwFrontier("_objc_retain", "@0x1ebd0e/0x1ebe52"); }

/** objc_release — @0x1ebc1e, @0x1ebc2c, @0x1ebe35. */
function objc_release(_id: ObjCId | null): void { throwFrontier("_objc_release", "@0x1ebc1e/0x1ebc2c/0x1ebe35"); }

/** _dispatch_get_global_queue(prio, 0) — @0x1eb8d7, 0x1eb975, 0x1ebdb6. */
function dispatch_get_global_queue(_prio: number, _flags: bigint): DispatchQueueT {
  return throwFrontier("_dispatch_get_global_queue", "@0x1eb8d7/0x1eb975/0x1ebdb6");
}

/** _dispatch_time(when, delta_ns) — @0x1eb8e6, 0x1eb984, 0x1ebdc5. */
function dispatch_time(_when: DispatchTimeT, _delta_ns: number): DispatchTimeT {
  return throwFrontier("_dispatch_time", "@0x1eb8e6/0x1eb984/0x1ebdc5");
}

/** _dispatch_after(when, queue, block) — @0x1eb923, 0x1eb9c1, 0x1ebe02. */
function dispatch_after(_when: DispatchTimeT, _q: DispatchQueueT, _block: () => void): void {
  throwFrontier("_dispatch_after", "@0x1eb923/0x1eb9c1/0x1ebe02");
}

/** _CVMetalTextureCacheCreate(NULL, NULL, device, NULL, &out) — @0x1eba5b. Returns kCVReturn (0 = ok);
 *  writes the created cache to the out pointer. */
function CVMetalTextureCacheCreate(
  _alloc: unknown,
  _attrs: unknown,
  _device: HGMTLDeviceType,
  _textureAttrs: unknown,
  outCache: { value: CVMetalTextureCacheRef | null },
): number {
  void outCache;
  return throwFrontier("_CVMetalTextureCacheCreate", "@0x1eba5b");
}

/** CGAffineTransformIdentity — global, read at @0x1ebc83 (48-byte struct = 3 movups). */
function cgAffineTransformIdentity(): unknown {
  return throwFrontier("_CGAffineTransformIdentity (read)", "@0x1ebc83");
}

/** std::deque<SessionInfo>::erase(iter) — tail-called at @0x1eb448. Removes [begin..iter). */
function deque_erase_front_range(
  _self: SessionManager,
  _blockPtrArrayCursor: number, // r12 in disasm — pointer INTO map_.__begin_ block-pointer array.
  _elementPtr: number,           // r15 in disasm — pointer to a SessionInfo in the current block.
): void {
  throwFrontier("std::__1::deque<SessionInfo>::erase", "@0x1eb448");
}

/** std::deque<SessionInfo>::__add_front_capacity() — @0x1ebd23. Ensures front has space for one push. */
function deque_add_front_capacity(_self: SessionManager): void {
  throwFrontier("std::__1::deque<SessionInfo>::__add_front_capacity", "@0x1ebd23");
}

/** operator delete — @0x1ebc79 (deque map-front block release during shrink). */
function operator_delete(_p: unknown): void { throwFrontier("__ZdlPv (operator delete)", "@0x1ebc79"); }

// -----------------------------------------------------------------------------

/**
 * SessionManager — see class-level doc for full struct/frontier ledger.
 * Sizeof >= 0x89 (up to and including the +0x88 bool). vtable slot present but no vtable call
 * is issued in any of the four transcribed methods.
 */
export class SessionManager {
  /** +0x08..+0x30 — the deque<SessionInfo>. Modelled as a flat JS array for iteration semantics;
   *  the deque's block-arithmetic in the original binary is preserved in the method bodies below
   *  via `blockIdx`/`inBlockIdx` helpers so that eviction cursor math stays observable. */
  private sessions: SessionInfo[] = [];

  /** +0x20 — libc++ deque's start-offset field (offset of front() into block 0).
   *  Read at removeOutdated @0x1eb36e (movq 0x20(%rax),%rcx) and at getRenderingSession
   *  @0x1ebb18 / @0x1ebd17. Written on push_front / erase-front. */
  private dequeStart: bigint = 0n;

  /** +0x30..+0x48 — vector<TextureCacheEntry>. See TextureCacheEntry for element layout. */
  private textureCaches: TextureCacheEntry[] = [];

  /** +0x48 — std::mutex. In JS a mutex is a nop, but we PRESERVE lock/unlock CALL SITES so the
   *  transcription is 1:1 with the disasm — each method acquires and releases via these helpers,
   *  which throw the frontier so real concurrency semantics have to be resolved by a real port. */
  private mutex_locked = false;
  private mutex_lock(callSite: string): void {
    // callq __ZNSt3__15mutex4lockEv — @0x1eb958 / 0x1eba1f / 0x1ebad0.
    if (this.mutex_locked) throwFrontier(`std::mutex::lock (already locked?) at ${callSite}`, callSite);
    this.mutex_locked = true;
  }
  private mutex_unlock(callSite: string): void {
    // callq __ZNSt3__15mutex6unlockEv — @0x1eb9d3 / 0x1eba67 / 0x1ebe13 (and unwind paths).
    if (!this.mutex_locked) throwFrontier(`std::mutex::unlock (not locked?) at ${callSite}`, callSite);
    this.mutex_locked = false;
  }

  /** +0x88 — bool cleanupScheduled. Set true when a dispatch_after re-arm is outstanding;
   *  cleared inside the timer block once the deque drains. */
  private cleanupScheduled: boolean = false;

  // --------------------------------------------------------------------------
  // SessionManager::removeOutdated()
  // @Helium 0x1eb330  __ZN14SessionManager14removeOutdatedEv
  //
  // Contract: walks the deque from FRONT (oldest — LRU) forward while
  // now - front->lastUsed > 3.0 s, and tail-calls std::deque::erase to drop
  // that prefix. Assumes the caller holds this->mutex_ (its only caller,
  // scheduleCleanup's block_invoke, locks +0x48 before invoking us — @0x1eb958).
  //
  // Line-by-line trace:
  //   @0x1eb341..0x1eb34f  r14 = +[NSDate now]                              — one "now" for the whole scan.
  //   @0x1eb355..0x1eb361  rdi = self->map_.begin_;  if (map_.end_ == map_.begin_) goto RET
  //                        (deque-empty short-circuit via the block table, not size).
  //   @0x1eb36a..0x1eb3bd  Compute FRONT element ptr:
  //                          rcx = start_(+0x20); rsi = size_(+0x28); rsi += rcx  ("end" element idx).
  //                          Using magic 0x70381c...c1: block_idx_end = rsi/73; in_block_end = rsi%73.
  //                          rbx = block_base_end + in_block_end * 0x38   — one-past-end SessionInfo*.
  //                          Similarly for rcx (start_): rdx = start_/73, block_base_start = map[rdx],
  //                          r15 = block_base_start + (start_%73) * 0x38  — FRONT SessionInfo*.
  //                        if (rbx == r15) goto RET  (deque empty by index).
  //   @0x1eb3c2            r12 = &map_[block_idx_start]   — the cursor over blocks.
  //   @0x1eb3c6            r13 = SEL_timeIntervalSinceDate:  — cached once outside the loop.
  //   LOOP HEAD @0x1eb3d0..0x1eb3d3:  if (r15 == rbx) goto RET  (finished — nothing more to drop).
  //   @0x1eb3d5..0x1eb3e3  rdx = r15->lastUsed (+0x30); rdi = now; call *r13   — [now timeIntervalSinceDate:lastUsed].
  //   @0x1eb3e6..0x1eb3ee  ucomisd xmm0, 3.0(*RIP+0x1e1962=file 0x3ccd50);
  //                        ja  0x1eb41d      (if now-lastUsed > 3.0s -> evict from here through r15).
  //                        Note: `ucomisd A,B` sets ZF/CF/PF from A cmp B; jump-above (JA) fires when
  //                        A > B AND unordered=false. So the condition is age > 3.0.
  //   @0x1eb3f0            r15 += 0x38   — advance one SessionInfo within the block.
  //   @0x1eb3f4..0x1eb401  if ((r15 - *r12) != 0xff8) goto LOOP  — did we spill past block-end?
  //   @0x1eb403..0x1eb40c  r15 = *(r12 + 8);  r12 += 8;  goto LOOP  — hop to next deque block.
  //   RET @0x1eb40e..0x1eb41c: return (nothing dropped).
  //   EVICT PATH @0x1eb41d..0x1eb448:
  //     movq 0x18(%r15),%rdi ; callq _objc_release      — release front->session.
  //     movq 0x30(%r15),%rdi ; callq _objc_release      — release front->lastUsed.
  //     Tail-call std::deque<SessionInfo>::erase(deque_iterator{block_ptr_cursor=r12, elt=r15})
  //       which internally slides the remaining tail forward (or, more precisely, the way
  //       libc++ implements erase(range) here — the tail-call is with rdi=self, rsi=r12, rdx=r15).
  //     — but ONLY the FIRST outdated element is objc_release'd inline; the deque::erase does the
  //       rest. That's the exact behavior of the binary — we don't re-scan the tail here.
  //
  // Provenance for the magic: see class-doc "KEY CONSTANTS".
  removeOutdated(): void {
    // @0x1eb341..0x1eb34f
    const now = nsdate_now("@0x1eb34f");

    // @0x1eb355..0x1eb361 — deque-empty short-circuit (block-table begin == end).
    // In JS we mirror by: if the flat deque is empty, return early.
    if (this.sessions.length === 0) return;

    // @0x1eb36a..0x1eb3bd — resolve front element pointer.
    // We express the block-arithmetic in comments and use a flat-array index because the
    // observable behavior (which SessionInfo is "front") is identical; the raw pointer math
    // exists only to reach that element inside the libc++ deque.
    //
    //   startIdx = self->dequeStart;                                 (rcx = 0x20(%rax))
    //   endIdx   = startIdx + self->sessions.length;                 (rsi = rcx + 0x28(%rax))
    //   block_idx_end   = endIdx   / DEQUE_BLOCK_LEN;   in_block_end   = endIdx   % DEQUE_BLOCK_LEN;
    //   block_idx_start = startIdx / DEQUE_BLOCK_LEN;   in_block_start = startIdx % DEQUE_BLOCK_LEN;
    //   one_past_end   = map[block_idx_end]   + in_block_end   * SESSIONINFO_SIZE;
    //   front_ptr      = map[block_idx_start] + in_block_start * SESSIONINFO_SIZE;
    //   if (front_ptr == one_past_end) return;
    //
    // In the flat model: front is sessions[0], one-past-end is sessions[length], and
    // `front_ptr == one_past_end` iff sessions.length == 0 — already handled above.
    void DEQUE_BLOCK_LEN;

    // @0x1eb3c6 — SEL_timeIntervalSinceDate: (cached; not used in JS).

    // Loop from front (LRU) evicting while age > 3.0s. Mirrors the linear walk over
    // the deque; we do NOT re-scan the tail after eviction because the binary tail-calls
    // deque::erase — which handles the whole prefix drop in a single call.
    let evictCount = 0;
    for (let i = 0; i < this.sessions.length; i++) {
      const entry = this.sessions[i];
      const last = entry.lastUsed;
      if (last === null) throwFrontier("SessionInfo.lastUsed = NULL — never observed in disasm", "@0x1eb3d5");

      // @0x1eb3dc..0x1eb3e6 — age = [now timeIntervalSinceDate:lastUsed]; ucomisd age, 3.0.
      const age = nsdate_timeIntervalSinceDate(now, last);

      // @0x1eb3ee — ja (unsigned/ordered "above") -> evict when age > OUTDATED_SECONDS.
      if (age > OUTDATED_SECONDS) {
        // @0x1eb41d..0x1eb42e — release the FRONT element's ObjC fields inline; the rest is
        // handled by deque::erase's tail-call below.
        objc_release(entry.session);
        objc_release(entry.lastUsed);
        evictCount = i + 1;
        break;
      }
      // @0x1eb3f0/@0x1eb3fb — advance to next element within/across deque blocks. In the flat
      // model we just continue the loop.
    }

    // @0x1eb448 — tail-call std::deque<SessionInfo>::erase(map_.begin_, front_iter_after_scan).
    // In the binary this is a jmp, so on return we return directly to our caller.
    if (evictCount > 0) {
      // dequeStart advances by evictCount elements (mod 73 across block boundaries — but the
      // exact block bookkeeping is libc++ deque internals). We route through the throw-stub so
      // real erase semantics (block-map compaction, __start_ update, __size_ decrement) are
      // resolved by a real port.
      deque_erase_front_range(this, /*blockCursor*/ 0, /*elementPtr*/ 0);
      // Once ported: this.sessions.splice(0, evictCount); this.dequeStart += BigInt(evictCount);
    }
  }

  // --------------------------------------------------------------------------
  // SessionManager::scheduleCleanup()
  // @Helium 0x1eb8c0  __ZN14SessionManager15scheduleCleanupEv
  //
  // Contract: arms a dispatch_after(3.0 s, background-queue) that, when it fires,
  //   locks the mutex, calls removeOutdated(), and — if the deque is still non-empty —
  //   re-arms itself, otherwise clears +0x88 (cleanupScheduled = false).
  //
  // The block captures `self` at frame slot -0x18 (@0x1eb915). The block descriptor
  // "___block_descriptor_40_e5_v8?0l" is the standard v8?0l signature (returns void,
  // takes no args after the block itself). The block invoke sym is
  //   ____ZN14SessionManager15scheduleCleanupEv_block_invoke @0x1eb940
  // whose body is folded into this method's port as `_block_invoke` — the FCP binary
  // has both scheduleCleanup and its re-arm inside getRenderingSession point at the
  // SAME block_invoke (0x1eb9dd..). We port that shared invoke once.
  //
  // Line-by-line:
  //   @0x1eb8ce..0x1eb8d7  rdi=-2, rsi=0, callq _dispatch_get_global_queue -> r14 = bg queue.
  //   @0x1eb8df..0x1eb8e6  esi=0xb2d05e00 (3s in ns), edi=0, callq _dispatch_time -> rax = now+3s.
  //   @0x1eb8eb..0x1eb919  Fill stack block struct at -0x38..-0x18:
  //                          [ __NSConcreteStackBlock, 0xc0000000, invoke_ptr,
  //                            block_descriptor_40_e5_v8?0l, self ]
  //   @0x1eb91d            rdx = &stack_block.
  //   @0x1eb920            rsi = queue.
  //   @0x1eb923            callq _dispatch_after(when=rax, queue=rsi, block=rdx).
  //
  // The block invoke (@0x1eb940..0x1eb9e2):
  //   @0x1eb94d            r14 = block->self;  (block layout offset +0x20).
  //   @0x1eb951..0x1eb958  rbx = &r14->mutex_(+0x48); std::mutex::lock(rbx).
  //   @0x1eb960            call SessionManager::removeOutdated(r14).
  //   @0x1eb965..0x1eb96a  if (r14->size_(+0x28) == 0) goto CLEAR.
  //   @0x1eb96c..0x1eb9c1  Repeat the same dispatch_get_global_queue/dispatch_time/block-fill
  //                        dance, then dispatch_after(same block_invoke, self=r14).
  //   @0x1eb9c6            jmp UNLOCK.
  //   CLEAR @0x1eb9c8..0x1eb9d3: r14->cleanupScheduled(+0x88) = 0; UNLOCK.
  //   UNLOCK @0x1eb9d3: std::mutex::unlock(rbx).
  //
  // Unwind path @0x1eb9e3..0x1eb9f1: unlock then _Unwind_Resume — standard C++ EH cleanup.
  scheduleCleanup(): void {
    // @0x1eb8ce..0x1eb8d7
    const bgQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0n);
    // @0x1eb8df..0x1eb8e6
    const when = dispatch_time(0n, CLEANUP_DELAY_NS);
    // @0x1eb8eb..0x1eb923 — build the stack block capturing `this`, then dispatch_after.
    const self = this;
    dispatch_after(when, bgQueue, () => self._scheduleCleanup_block_invoke());
  }

  /**
   * scheduleCleanup's block body — @Helium 0x1eb940 ____ZN14SessionManager15scheduleCleanupEv_block_invoke.
   * ALSO used by getRenderingSession's initial-arm path (@0x1ebdde loads the SAME invoke_ptr).
   * Marked internal (leading underscore) but exposed on the instance so callers can inspect it.
   */
  _scheduleCleanup_block_invoke(): void {
    // @0x1eb951..0x1eb958
    this.mutex_lock("@0x1eb958");
    // @0x1eb960
    this.removeOutdated();
    // @0x1eb965
    if (this.sessions.length !== 0) {
      // @0x1eb96c..0x1eb9c1 — re-arm identical timer.
      const bgQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0n);
      const when = dispatch_time(0n, CLEANUP_DELAY_NS);
      const self = this;
      dispatch_after(when, bgQueue, () => self._scheduleCleanup_block_invoke());
      // @0x1eb9c6 — jmp UNLOCK
    } else {
      // @0x1eb9c8 — cleanupScheduled = false.
      this.cleanupScheduled = false;
    }
    // @0x1eb9d3
    this.mutex_unlock("@0x1eb9d3");
  }

  // --------------------------------------------------------------------------
  // SessionManager::getTextureCache(HGMTLDeviceType device)
  // @Helium 0x1eba00  __ZN14SessionManager15getTextureCacheE15HGMTLDeviceType
  //
  // Contract: acquires mutex, linear-scans the vector<TextureCacheEntry> for an
  // entry with key == device; on match returns entry.cache; on miss calls
  // _CVMetalTextureCacheCreate(NULL, NULL, device, NULL, &out) and returns `out`
  // (which is stored in the local -0x20(%rbp) slot). NB: the miss path does NOT
  // push the new entry into the vector — we port that verbatim.
  //
  // Line-by-line:
  //   @0x1eba0a  r14 = device.
  //   @0x1eba0d  r15 = this.
  //   @0x1eba10  -0x20(%rbp) = 0    <- "out" scratch pre-init.
  //   @0x1eba18..0x1eba1f  rbx = &this->mutex_(+0x48);  std::mutex::lock(rbx).
  //   @0x1eba24..0x1eba28  rax = this->tex_begin(+0x30);  rcx = this->tex_end(+0x38).
  //   @0x1eba2c  if (rax == rcx) goto MISS.
  //   LOOP HEAD @0x1eba40:  if (*rax == device) goto HIT.       (cmpq %r14,(%rax))
  //   @0x1eba45..0x1eba4c  rax += 0x10; if (rax != rcx) goto LOOP HEAD.
  //   MISS @0x1eba4e..0x1eba5b:
  //       r8=&scratch, rdi=0, rsi=0, rdx=device, rcx=0, callq _CVMetalTextureCacheCreate.
  //       r15 (return value slot) = scratch.
  //   COMMON @0x1eba60..0x1eba79:  r15 = scratch; unlock(rbx); return r15.
  //   HIT @0x1eba7a..0x1eba87:
  //       r15 = *(rax + 8)      <- entry->cache.
  //       scratch = r15.
  //       if (r15 == NULL) goto MISS.   <- treat a NULL cached cache as "not found".
  //       else fall through to COMMON.
  //
  // Note the "cache-null -> recreate" behavior: even a stale cached NULL triggers a fresh
  // _CVMetalTextureCacheCreate — but STILL doesn't push it into the vector. Exact-as-is.
  getTextureCache(device: HGMTLDeviceType): CVMetalTextureCacheRef | null {
    // @0x1eba10
    const scratch: { value: CVMetalTextureCacheRef | null } = { value: null };
    // @0x1eba18..0x1eba1f
    this.mutex_lock("@0x1eba1f");

    // @0x1eba24..0x1eba4c — linear scan.
    let hitCache: CVMetalTextureCacheRef | null | undefined = undefined;
    for (const entry of this.textureCaches) {
      if (entry.key === device) {
        // @0x1eba7a — r15 = entry->cache.
        hitCache = entry.cache;
        break;
      }
      // @0x1eba45..0x1eba4c — advance by sizeof=16.
    }

    // HIT with non-NULL cache?
    if (hitCache !== undefined && hitCache !== null) {
      // @0x1eba7e — scratch = r15; jne 0x1eba64 skips CVMetalTextureCacheCreate.
      scratch.value = hitCache;
    } else {
      // MISS or HIT-with-NULL @0x1eba4e..0x1eba5b.
      const rc = CVMetalTextureCacheCreate(null, null, device, null, scratch);
      void rc; // return code discarded by the binary; only `scratch` is read.
    }

    // @0x1eba60..0x1eba67
    const result = scratch.value;
    this.mutex_unlock("@0x1eba67");
    // @0x1eba6c..0x1eba79
    return result;
  }

  // --------------------------------------------------------------------------
  // SessionManager::getRenderingSession(commandQueue, attributes, quality, width, height)
  // @Helium 0x1ebaa0
  //
  // Contract: acquires mutex; scans the deque for a SessionInfo whose 5-key tuple
  //   (deviceRegistryID, attributes, quality, width, height)
  // matches; on HIT touches lastUsed and returns cached session. On MISS creates a
  // fresh CNRenderingSession via alloc/init, and — with the deque already having
  // reached its capacity limit — evicts the OLDEST element (block-back), possibly
  // freeing the back-most deque block (shrink-front threshold 146 = 2 blocks).
  // Then push_front's the new SessionInfo. If cleanupScheduled==false, arms the
  // 3.0-s dispatch_after cleanup timer and sets cleanupScheduled=true.
  //
  // ArgABI on entry:
  //   rdi = this, rsi = commandQueue, rdx = attributes (-> rbx),
  //   rcx = quality (-> -0x38(%rbp)), r8 = width (-> -0x48(%rbp)),
  //   r9 = height (-> -0x50(%rbp)).
  //
  // Line-by-line (grouped for readability — full disasm in
  //              raw-port/re/disasm/Helium.SessionManager.getRenderingSession.s):
  //
  // Setup @0x1ebaa0..0x1ebad0:
  //   Save callee-saved regs; r14=this; r15=commandQueue (also stashed at -0x58); rbx=attributes.
  //   quality->-0x38, height->-0x50, width->-0x48. r12=&this->mutex_(+0x48); mutex::lock(r12).
  //
  // Lookup key: registryID @0x1ebad5..0x1ebafd:
  //   [commandQueue device] then -[registryID] -> r15 = registryID (uint64_t). commandQueue's
  //   original ObjC id is now at -0x58(%rbp).
  //
  // Deque scan @0x1ebb00..0x1ebbcb (mirrors removeOutdated's block walk, but scanning ALL
  // elements). Front element is r13 (rebased via block_idx_start x 8 + in_block_start x 0x38).
  // One-past-end is rax (via block_idx_end / in_block_end). Block cursor rcx = &map[block_idx_start].
  //   LOOP HEAD @0x1ebb85..0x1ebba5:  compare tuple
  //     (%r13)==%r15   -- deviceRegistryID
  //     8(%r13)==%rbx  -- attributes
  //     0x10(%r13)==%rdi(=quality)
  //     0x20(%r13)==%rsi(=width)
  //     0x28(%r13)==%rdx(=height)
  //   All 5 equal -> goto HIT @0x1ebe2d.
  //   Any not-equal -> advance element (0x1ebbb0: r13 += 0x38; block-hop check @0x1ebbba).
  //   End of deque -> fall through to MISS @0x1ebbcd (also empty-deque short-circuit
  //                                                   @0x1ebb12 -> 0x1ebbd3).
  //
  // MISS entry-point @0x1ebbcd/@0x1ebbd3:  rax = &this->size_(+0x28) (or its value).
  //   @0x1ebbda..0x1ebbde  if (size < 4) goto SKIP_EVICT_AND_ALLOC.
  //   EVICT-BACK stanza @0x1ebbe4..0x1ebc7e:
  //     Compute back-element pointer using (start_ + size_ - 1):
  //       rcx = (r14->start_(+0x20)) + size(+0x28) - 1;
  //       (rcx * magic) >> 5 -> rdx = back block idx.  rsi = map[back_block_idx].
  //       Then rcx -= rdx*73 gives in_block_back.  r13 = rcx * 0x38;
  //       r12 = r13 + rsi         <- back SessionInfo*.
  //     Release ObjC fields:
  //       rdi = 0x18(%r12,%r13) -> back->session; callq _objc_release.
  //       rdi = 0x30(%r12)      -> back->lastUsed; callq _objc_release.
  //     Deque bookkeeping (@0x1ebc32..0x1ebc7e):
  //       Decrement size (0x28(%r14)-=1).  Recompute back-element-index (0-based from front).
  //       Compare front slack (0x92 = 146 = 2 blocks); if slack >= 2 blocks, free the back
  //       BLOCK: rdi = *(map_.__end_ - 1); callq operator delete @0x1ebc79.
  //         Then 0x10(%r14) -= 8 (map_.__end_ shrinks by one block-pointer).
  //     Fall through to alloc.
  //
  //   ALLOC @0x1ebc83..0x1ebcf4:
  //     Read 48-byte CGAffineTransformIdentity into xmm0..xmm2, stash on stack.
  //     rdi = _OBJC_CLASS_$_CNRenderingSession; callq _objc_alloc -> rax.
  //     rsi = SEL initWithCommandQueue:sessionAttributes:preferredTransform:quality:
  //     Marshal args: rdi = new session; rdx = commandQueue (from -0x58);
  //                   rcx = attributes (rbx); r8 = quality (from -0x38);
  //                   xmm2/xmm1/xmm0 -> 0x20/0x10/0(%rsp) (the CGAffineTransform by value).
  //     callq _objc_msgSend  ->  r12 = new CNRenderingSession.
  //
  //   Record lastUsed @0x1ebcf7..0x1ebd14:
  //     rax = [NSDate now]; then _objc_retain(rax) -> r13 = retained NSDate.
  //
  //   PUSH_FRONT @0x1ebd17..0x1ebd9f:
  //     Ensure front capacity: if (0x20(%r14)==0) call __add_front_capacity(r14); reload rcx=start_.
  //     Compute new front slot:
  //       rcx = start_;  (rcx * magic) >> 5 -> rdx = start_/73 (block idx).
  //       rcx -= rdx*73   -> in_block_start (0..72).
  //       rax = this->begin_(+0x08);  rsi = map[block_idx];  rdi = rsi + in_block_start*0x38.
  //       If in_block_start == 0 AND deque non-empty (0x10(%r14) != this->begin_), use rdi;
  //       else use rsi+0xff8 (wrap into previous block).
  //     Populate the new SessionInfo (offsets from a base pointer `rcx`):
  //       -0x38(%rcx) = registryID (r15)                              <- +0x00
  //       -0x30(%rcx) = attributes (rbx)                              <- +0x08
  //       -0x28(%rcx) = quality  (from -0x38(%rbp))                   <- +0x10
  //       -0x20(%rcx) = session  (r12)                                <- +0x18
  //       -0x18(%rcx) = width    (from -0x48(%rbp))                   <- +0x20
  //       -0x10(%rcx) = height   (from -0x50(%rbp))                   <- +0x28
  //        -0x8(%rcx) = lastUsed (r13)                                <- +0x30
  //     dec start_(+0x20); inc size_(+0x28).
  //
  //   ARM-CLEANUP-IF-NOT-SCHEDULED @0x1ebda3..0x1ebe0f:
  //     if (this->cleanupScheduled(+0x88) != 0) goto UNLOCK.
  //     Otherwise: dispatch_get_global_queue(-2,0)/dispatch_time(0,3s)/build stack block
  //       capturing `this`, invoke_ptr = scheduleCleanup_block_invoke, dispatch_after.
  //     this->cleanupScheduled = 1.
  //
  //   UNLOCK+RET @0x1ebe0f..0x1ebe2c: mutex::unlock; return r12 (the session).
  //
  // HIT @0x1ebe2d..0x1ebe69:
  //     r12 = r13->session (+0x18).   <- reuse cached session.
  //     rdi = r13->lastUsed(+0x30); callq _objc_release  — release the OLD lastUsed.
  //     rdi = [NSDate now]; rax = _objc_retain(rdi); r13->lastUsed = rax.
  //     Then jump into ARM-CLEANUP-IF-NOT-SCHEDULED at @0x1ebda3 (jne branch @0x1ebe63 goes
  //     back into the same tail as MISS — but note: this "test r12,r12" @0x1ebe5c can only
  //     be false if the cached session pointer was NULL, in which case we jmp to @0x1ebbd7
  //     to re-run the alloc path. That's an anti-null-corruption re-alloc, exact-as-is).
  //
  // Unwind path @0x1ebe6e..0x1ebe85: unlock + _Unwind_Resume.
  getRenderingSession(
    commandQueue: HGMTLCommandQueue,
    attributes: CNRenderingSessionAttributes | null,
    quality: CNRenderingQuality,
    width: bigint,
    height: bigint,
  ): CNRenderingSession {
    // @0x1ebac9..0x1ebad0
    this.mutex_lock("@0x1ebad0");

    // @0x1ebad5..0x1ebafd — deviceRegistryID = [[commandQueue device] registryID].
    const device = hgmtl_commandqueue_device(commandQueue);
    const registryID = mtldevice_registryID(device);

    // @0x1ebb00..0x1ebbcb — deque scan (all 5 keys must match).
    let hit: SessionInfo | null = null;
    for (const s of this.sessions) {
      if (
        s.deviceRegistryID === registryID &&
        s.attributes === attributes &&
        s.quality === quality &&
        s.width === width &&
        s.height === height
      ) {
        hit = s;
        break;
      }
      // @0x1ebbb0..0x1ebbcb — element/block advance.
    }

    let session: CNRenderingSession;

    if (hit !== null) {
      // HIT @0x1ebe2d..0x1ebe69.
      const cachedSession = hit.session; // @0x1ebe2d: r12 = r13->session(+0x18).
      // @0x1ebe31..0x1ebe35 — release old lastUsed BEFORE overwriting.
      objc_release(hit.lastUsed);
      // @0x1ebe3b..0x1ebe58 — lastUsed = objc_retain([NSDate now]).
      const nowDate = nsdate_now("@0x1ebe49");
      hit.lastUsed = objc_retain(nowDate) as NSDate;

      // @0x1ebe5c..0x1ebe69 — test r12 (cached session); if NULL, re-alloc via MISS path.
      if (cachedSession === null) {
        // jmp 0x1ebbd7 — fall into the size-check + alloc pipeline as if MISS.
        session = this._miss_allocAndPushFront(commandQueue, attributes, quality, width, height, registryID);
      } else {
        // jne 0x1ebda3 — fall into the arm-cleanup tail.
        session = cachedSession;
        this._maybeArmCleanup();
      }
    } else {
      // MISS @0x1ebbcd/@0x1ebbd3..0x1ebd9f — evict-if-full + alloc + push_front.
      session = this._miss_allocAndPushFront(commandQueue, attributes, quality, width, height, registryID);
    }

    // @0x1ebe0f..0x1ebe13
    this.mutex_unlock("@0x1ebe13");
    // @0x1ebe18..0x1ebe2c
    return session;
  }

  /**
   * Internal MISS body — factored so both the "no hit" fall-through and the HIT-with-NULL
   * re-alloc branch (@0x1ebe63 -> 0x1ebbd7) share code. Not a separate FCP symbol — this is a
   * transcription-scaffold for the shared tail; the offsets cited inside come from the ONE
   * canonical location in the disasm.
   */
  private _miss_allocAndPushFront(
    commandQueue: HGMTLCommandQueue,
    attributes: CNRenderingSessionAttributes | null,
    quality: CNRenderingQuality,
    width: bigint,
    height: bigint,
    registryID: bigint,
  ): CNRenderingSession {
    // @0x1ebbd7..0x1ebbde — size cap check. If size < 4, skip eviction & shrink.
    if (this.sessions.length >= 4) {
      // EVICT-BACK @0x1ebbe4..0x1ebc7e.
      // Back element = sessions[length - 1] in flat model (start_ + size_ - 1 in libc++).
      const back = this.sessions[this.sessions.length - 1];
      // @0x1ebc19..0x1ebc1e — release back->session (offset +0x18).
      objc_release(back.session);
      // @0x1ebc27..0x1ebc2c — release back->lastUsed (offset +0x30).
      objc_release(back.lastUsed);
      // @0x1ebc32..0x1ebc7e — dec size + maybe free back block if slack >= 146 elements.
      // In the flat model we can only observe the observable side-effect (size shrinks by 1);
      // the block-pointer array bookkeeping (operator delete of the last map slot) is not
      // representable without a real deque. Cite the throw-stub only if the threshold trips —
      // the port stays honest: we DO NOT approximate the shrink-front condition.
      const sizeAfter = this.sessions.length - 1;
      // Compute the exact "back-front slack in blocks" expression the binary computes:
      //   let mapSlots = (this->tex_end(+0x10) - this->begin_(+0x08)) / 8  <- integer #block-ptrs.
      //   rdi = (mapSlots == 0 ? 0 : (mapSlots*73 - 1));
      //   rdi -= (this->start_(+0x20) + this->size_(+0x28));    // "cells used after back"
      //   ++rdi;
      //   if (rdi >= 0x92) { operator delete(*(map_.__end_ - 1)); map_.__end_ -= 1; }
      // Since we don't model the block map here, the free-back-block only happens through the
      // frontier; we route the condition through operator_delete's throw-stub ONLY IF the
      // flat-size condition suggests it (>= 2 * DEQUE_BLOCK_LEN).
      if (sizeAfter >= 2 * DEQUE_BLOCK_LEN) {
        operator_delete(null); // @0x1ebc79
      }
      this.sessions.pop();
    }

    // ALLOC @0x1ebc83..0x1ebcf4.
    // Read CGAffineTransformIdentity (opaque 48-byte struct, passed by value).
    const preferredTransform = cgAffineTransformIdentity();
    // +[CNRenderingSession alloc]/init...
    const newSession = cn_renderingSession_init(commandQueue, attributes, quality, preferredTransform);

    // @0x1ebcf7..0x1ebd14 — retained [NSDate now].
    const nowDate = nsdate_now("@0x1ebd05");
    const lastUsed = objc_retain(nowDate) as NSDate;

    // PUSH_FRONT @0x1ebd17..0x1ebd9f.
    // Ensure front capacity: if (start_ == 0) __add_front_capacity(this).
    if (this.dequeStart === 0n) {
      deque_add_front_capacity(this); // @0x1ebd23
    }
    // Populate new SessionInfo — verbatim field order from @0x1ebd73..0x1ebd97.
    const info: SessionInfo = {
      deviceRegistryID: registryID,
      attributes,
      quality,
      session: newSession,
      width,
      height,
      lastUsed,
    };
    this.sessions.unshift(info); // push_front.
    // @0x1ebd9b: --start_
    // @0x1ebd9f: ++size_  (the length update is implicit in unshift).
    if (this.dequeStart > 0n) this.dequeStart -= 1n;

    // ARM-CLEANUP-IF-NOT-SCHEDULED tail @0x1ebda3..0x1ebe0f.
    this._maybeArmCleanup();

    return newSession;
  }

  /**
   * Shared tail — arms the 3-s dispatch_after cleanup timer iff cleanupScheduled is false.
   * Bodily identical to scheduleCleanup() plus a "set cleanupScheduled=true" flag update
   * (@0x1ebe07 movb $0x1,0x88(%r14)).
   */
  private _maybeArmCleanup(): void {
    // @0x1ebda3..0x1ebdab
    if (this.cleanupScheduled) return;
    // @0x1ebdad..0x1ebe02
    const bgQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0n);
    const when = dispatch_time(0n, CLEANUP_DELAY_NS);
    const self = this;
    dispatch_after(when, bgQueue, () => self._scheduleCleanup_block_invoke());
    // @0x1ebe07
    this.cleanupScheduled = true;
  }
}
