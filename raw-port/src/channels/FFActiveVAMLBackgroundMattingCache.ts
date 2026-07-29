// raw-port/src/channels/FFActiveVAMLBackgroundMattingCache.ts
//
// FCP `FFActiveVAMLBackgroundMattingCache` — a Flexo global singleton that
// caches VAML (Video-Analysis-Machine-Learning) background-matting NSObjects
// keyed by FFMD5 hashes, using PCWeakPointerValue for automatic zero-ing
// when the underlying VAMLBackgroundMatting is deallocated. Extends
// FFSynchronizable for the standard Flexo Lock()/Unlock() protocol and
// holds a std::__1::__tree<FFMD5, PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>>
// map starting at offset +0x90 (the tree root is at +0x90; the sentinel
// end-node ("__end_node") is at +0x98; the size counter is at +0xa0 — these
// three offsets are all recovered from CleanupZeroedWeakRefs' own body).
//
// Framework: Flexo
//
// Provenance (4 methods exported from Flexo.syms.txt):
//   ~FFActiveVAMLBackgroundMattingCache() [D1]     @0x6846d0
//   CleanupGlobalCacheNow() [static]               @0x684700
//   CleanupZeroedWeakRefs()                        @0x684720
//   copyOrCreateVAMLObjectForBackgroundMD5(
//       FFMD5 const&, void*, bool*)                @0x684a10
//
// (The nested Objective-C block invoke stub for
//  keepVAMLMattingBackgroundCachedFor:@0x687b80 is a __block_invoke helper
//  emitted by the compiler for a `^{...}` literal — it is not a user-visible
//  method of this class, so it is NOT ported here. When the parent
//  `keepVAMLMattingBackgroundCached...` method is ported, its inline block
//  literal will emit the equivalent closure.)
//
// EXTERNAL FUNCTIONS REFERENCED (boundary throw-stubs — each cites its addr):
//   * FFSynchronizable::~FFSynchronizable() [D1]  @Flexo __ZN16FFSynchronizableD1Ev
//       (tail-jmp target of D1 @Flexo 0x6846f5)
//   * FFSynchronizable::Lock()                    @Flexo __ZN16FFSynchronizable4LockEv
//       (called by CleanupZeroedWeakRefs @Flexo 0x684748 and by
//        copyOrCreateVAMLObjectForBackgroundMD5 @Flexo 0x684a41)
//   * FFSynchronizable::Unlock()                  @Flexo __ZN16FFSynchronizable6UnlockEv
//       (called by CleanupZeroedWeakRefs @Flexo 0x684852)
//   * std::__1::__tree<...>::destroy(node*)       @Flexo (long mangled;
//       called by D1 @Flexo 0x6846e7 to recursively free tree-nodes rooted
//       at +0x98 (the __end_node); node param is *(this+0x98))
//   * std::__1::__tree_remove<...>(base, base)    @Flexo (long mangled;
//       called by CleanupZeroedWeakRefs @Flexo 0x684795 to unlink a node)
//   * PCNSRef<...>::release() const               @Flexo stub 0x1496f96
//       (called by CleanupZeroedWeakRefs @Flexo 0x68479d on (%r14+0x30))
//   * operator delete(void*) [__ZdlPv]            @Flexo stub 0x1497404
//       (called by CleanupZeroedWeakRefs @Flexo 0x6847a5 on freed node)
//   * PCAutoreleasePool::PCAutoreleasePool() [C1] @Flexo stub 0x14965f4
//       (ctor of a stack pool used by CleanupZeroedWeakRefs @Flexo 0x684738
//        and by copyOrCreateVAMLObjectForBackgroundMD5 @Flexo 0x684a31)
//   * PCAutoreleasePool::~PCAutoreleasePool() [D1] @Flexo stub 0x14965fa
//       (dtor called from same two functions on cleanup paths @Flexo 0x68485b,
//        exception-unwind @Flexo 0x68487e / 0x6848a3)
//   * FFSynchronizer::~FFSynchronizer() [D1]      @Flexo __ZN14FFSynchronizerD1Ev
//       (called on the exception-unwind path from copyOrCreate @Flexo 0x68489a
//        — hints that the local at rbp-0x40 is an FFSynchronizer RAII guard)
//   * ObjC selector `skipFcpTrackerResultSmoothing` (nullary; via -[wk skipFcpTrackerResultSmoothing])
//       @Flexo (dispatched by CleanupZeroedWeakRefs @Flexo 0x6847c4 on
//        `*(node+0x30)` — the PCWeakPointerValue payload — to check whether
//        the weak ref is still live; a zero return causes the node to be
//        removed).
//   * static sActiveVAMLBackgroundMattingCache — file-local Flexo global
//       @Flexo __ZL33sActiveVAMLBackgroundMattingCache (the private-linkage
//        `sActiveVAMLBackgroundMattingCache` referenced at 0x684704).
//   * __clang_call_terminate                      @Flexo stub 0x684872 (local)
//   * __Unwind_Resume                             @Flexo stub 0x1495d30
//   * `off_1bb9cb0` (RIP-relative constant read by CleanupZeroedWeakRefs at
//        @0x684764 movq 0x1535545(%rip),%r12 -> 0x1bb9cb0) — a `void*`
//        placeholder used by the __tree_remove call as its 2nd arg. Origin
//        not decoded here; kept as a captured constant so the caller can be
//        transcribed against the same immediate the binary uses.
//
// STRUCT LAYOUT — recovered from D1 + CleanupZeroedWeakRefs body:
//   +0x00 .. +0x8f  inherited FFSynchronizable state (opaque here; see that
//                   file once ported). This includes the mutex + vptr slots.
//   +0x90           std::__1::__tree root pointer (`begin_node`) — the FIRST
//                   node in the map. D1 doesn't touch this directly; walks
//                   the tree via +0x98. CleanupZeroedWeakRefs' walk starts
//                   here at @0x68474d and detects "empty" as +0x90 == +0x98
//                   (which is how libc++'s __tree signals `begin() == end()`).
//   +0x98           std::__1::__tree `__end_node_` — the tree's sentinel end
//                   node. D1 reads it at +0x98 @0x6846e0 as the 2nd arg to
//                   __tree<...>::destroy(node*). CleanupZeroedWeakRefs uses
//                   it as the loop-termination sentinel and passes it to
//                   __tree_remove.
//   +0xa0           std::__1::__tree `__size_` (the map's live element count).
//                   Decremented (`decq 0xa0(%rbx)`) by CleanupZeroedWeakRefs
//                   @0x684784 each time a zeroed weak ref is unlinked.
//   Total instance size is at least 0xa8 (last read-write is at +0xa0);
//   no ctor is exported here (the static singleton
//   `sActiveVAMLBackgroundMattingCache` is a __ZL-linkage global constructed
//   by a Mach-O `__mod_init_func` slot that lives outside this class's
//   inventory entry — its size + vtable install site are recovered when the
//   compilation unit's static-init is ported separately).

// -- Boundary throw-stubs for undecoded externs ------------------------------------------

/**
 * FFSynchronizable::~FFSynchronizable() [D1] — base destructor.
 * @Flexo __ZN16FFSynchronizableD1Ev (tail-jmp target of this class's D1 @0x6846f5).
 */
function FFSynchronizable_D1(_this: FFActiveVAMLBackgroundMattingCache): void {
  throw new Error(
    "FFSynchronizable::~FFSynchronizable() @Flexo __ZN16FFSynchronizableD1Ev not yet transcribed (call-site @0x6846f5)",
  );
}

/**
 * FFSynchronizable::Lock() — take the class's synchronization mutex.
 * @Flexo __ZN16FFSynchronizable4LockEv.
 * Call sites in this file:
 *   - CleanupZeroedWeakRefs @0x684748
 *   - copyOrCreateVAMLObjectForBackgroundMD5 @0x684a41
 */
function FFSynchronizable_Lock(_this: FFActiveVAMLBackgroundMattingCache): void {
  throw new Error(
    "FFSynchronizable::Lock() @Flexo __ZN16FFSynchronizable4LockEv not yet transcribed",
  );
}

/**
 * FFSynchronizable::Unlock() — release the class's synchronization mutex.
 * @Flexo __ZN16FFSynchronizable6UnlockEv.
 * Call site: CleanupZeroedWeakRefs @0x684852.
 */
function FFSynchronizable_Unlock(_this: FFActiveVAMLBackgroundMattingCache): void {
  throw new Error(
    "FFSynchronizable::Unlock() @Flexo __ZN16FFSynchronizable6UnlockEv not yet transcribed",
  );
}

/**
 * std::__1::__tree<...>::destroy(node*) — recursively free the map's tree
 * of PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*> nodes rooted at
 * the given node.
 * @Flexo (long mangled name; call site @0x6846e7 in D1, called on `*(this+0x98)`).
 */
function libcxx_tree_destroy(
  _this: FFActiveVAMLBackgroundMattingCache,
  _rootNode: unknown,
): void {
  throw new Error(
    "std::__1::__tree<...>::destroy(node*) @Flexo not yet transcribed (D1 call-site @0x6846e7)",
  );
}

/**
 * std::__1::__tree_remove<node_base*>(base, base) — unlink a node from the
 * intrusive red-black tree without freeing it (the caller then frees).
 * @Flexo (call site @0x684795 in CleanupZeroedWeakRefs).
 */
function libcxx_tree_remove(_headArg: unknown, _nodeArg: unknown): void {
  throw new Error(
    "std::__1::__tree_remove<...>(base, base) @Flexo not yet transcribed (call-site @0x684795)",
  );
}

/**
 * PCNSRef<...>::release() const — decrement the retain count of the
 * PCWeakPointerValue held at (node+0x30) and, if it reached zero, dispose.
 * @Flexo stub 0x1496f96 (called by CleanupZeroedWeakRefs @0x68479d).
 */
function PCNSRef_release(_nodePayloadPtr: unknown): void {
  throw new Error(
    "PCNSRef<...>::release() @Flexo stub 0x1496f96 not yet transcribed (call-site @0x68479d)",
  );
}

/**
 * operator delete(void*) — libc++ deallocation stub.
 * @Flexo stub @0x1497404 (__ZdlPv). Called by CleanupZeroedWeakRefs @0x6847a5.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) @Flexo stub 0x1497404 not yet transcribed",
  );
}

/**
 * PCAutoreleasePool::PCAutoreleasePool() [C1] — push a new autorelease pool.
 * @Flexo stub 0x14965f4 (__ZN17PCAutoreleasePoolC1Ev).
 */
function PCAutoreleasePool_C1(_pool: unknown): void {
  throw new Error(
    "PCAutoreleasePool::PCAutoreleasePool() @Flexo stub 0x14965f4 not yet transcribed",
  );
}

/**
 * PCAutoreleasePool::~PCAutoreleasePool() [D1] — pop the pool, draining it.
 * @Flexo stub 0x14965fa (__ZN17PCAutoreleasePoolD1Ev).
 */
function PCAutoreleasePool_D1(_pool: unknown): void {
  throw new Error(
    "PCAutoreleasePool::~PCAutoreleasePool() @Flexo stub 0x14965fa not yet transcribed",
  );
}

/**
 * Objective-C `-[weakRef skipFcpTrackerResultSmoothing]` — nullary selector
 * dispatched by CleanupZeroedWeakRefs @0x6847c4 on `*(node+0x30)` (the
 * PCWeakPointerValue payload). A zero (nil) return means the weak ref has
 * been zeroed and the node should be removed. Left as a boundary throw-stub
 * because ObjC dispatch resolution is not modeled at this address yet.
 */
function objc_send_skipFcpTrackerResultSmoothing(
  _weakRefPayload: unknown,
): unknown {
  throw new Error(
    "objc_msgSend -[* skipFcpTrackerResultSmoothing] @Flexo 0x6847c4 not yet transcribed",
  );
}

/**
 * Handle for the file-local static singleton
 * `sActiveVAMLBackgroundMattingCache` referenced by CleanupGlobalCacheNow
 * @0x684704 via `leaq __ZL33sActiveVAMLBackgroundMattingCache(%rip),%rdi`.
 * The static-init construction site lives in a __mod_init_func not exported
 * as a class method, so this is exposed as an opaque handle only.
 * @Flexo __ZL33sActiveVAMLBackgroundMattingCache (private linkage).
 */
export const s_ActiveVAMLBackgroundMattingCache: FFActiveVAMLBackgroundMattingCache =
  {} as FFActiveVAMLBackgroundMattingCache;

// -- Struct handle -----------------------------------------------------------------------

/**
 * FFActiveVAMLBackgroundMattingCache instance. Layout (recovered from D1 +
 * CleanupZeroedWeakRefs; see file header for full byte accounting):
 *   +0x00..+0x8f  inherited FFSynchronizable state (mutex, vptr(s), …).
 *   +0x90         std::__1::__tree begin_node ptr  (walk start; loop
 *                                                    termination: == +0x98).
 *   +0x98         std::__1::__tree __end_node_    (sentinel).
 *   +0xa0         std::__1::__tree __size_        (element count).
 */
export interface FFActiveVAMLBackgroundMattingCache {
  /** +0x00 .. +0x8f — inherited FFSynchronizable state (opaque). */
  base_ffsynchronizable: unknown;
  /** +0x90 — std::__1::__tree begin_node pointer. */
  tree_begin_at90: unknown;
  /** +0x98 — std::__1::__tree __end_node_ sentinel. */
  tree_end_at98: unknown;
  /** +0xa0 — std::__1::__tree __size_ (u64 element count). */
  tree_size_ata0: bigint;
}

// =============================================================================================
//  Destructor
// =============================================================================================

/**
 * ~FFActiveVAMLBackgroundMattingCache() [D1] — complete-object destructor.
 * @Flexo __ZN34FFActiveVAMLBackgroundMattingCacheD1Ev @0x6846d0.
 *
 * Body (verbatim):
 *   0x6846d0  push %rbp
 *   0x6846d1  mov  %rsp,%rbp
 *   0x6846d4  push %rbx
 *   0x6846d5  push %rax                ; align/scratch
 *   0x6846d6  mov  %rdi,%rbx           ; save this
 *   0x6846d9  add  $0x90,%rdi          ; %rdi = this+0x90 (the __tree object)
 *   0x6846e0  mov  0x98(%rbx),%rsi     ; %rsi = *(this+0x98) = the __end_node_
 *   0x6846e7  callq __ZNSt3__16__tree… destroy … ; tree.destroy(end_node)
 *   0x6846ec  mov  %rbx,%rdi           ; restore this
 *   0x6846ef  add  $0x8,%rsp
 *   0x6846f3  pop  %rbx
 *   0x6846f4  pop  %rbp
 *   0x6846f5  jmp  __ZN16FFSynchronizableD1Ev   ; tail-jmp base D1
 *   0x6846fa  nop
 *
 * Semantic: destroy every remaining node in the weak-ref cache map (calling
 * ~PCNSRef on each payload as part of __tree_node destruction), then chain
 * into the FFSynchronizable base D1 to release the mutex etc.
 */
export function FFActiveVAMLBackgroundMattingCache_D1(
  self: FFActiveVAMLBackgroundMattingCache,
): void {
  // 0x6846e7  tree.destroy(*(this+0x98))
  libcxx_tree_destroy(self, self.tree_end_at98);
  // 0x6846f5  tail-jmp FFSynchronizable::~FFSynchronizable [D1]
  FFSynchronizable_D1(self);
}

// =============================================================================================
//  Static: CleanupGlobalCacheNow
// =============================================================================================

/**
 * FFActiveVAMLBackgroundMattingCache::CleanupGlobalCacheNow() — static
 * convenience that runs CleanupZeroedWeakRefs on the file-local singleton
 * `sActiveVAMLBackgroundMattingCache`.
 * @Flexo __ZN34FFActiveVAMLBackgroundMattingCache21CleanupGlobalCacheNowEv @0x684700.
 *
 * Body (verbatim):
 *   0x684700  push %rbp
 *   0x684701  mov  %rsp,%rbp
 *   0x684704  lea  __ZL33sActiveVAMLBackgroundMattingCache(%rip),%rdi
 *   0x68470b  pop  %rbp
 *   0x68470c  jmp  __ZN34FFActiveVAMLBackgroundMattingCache21CleanupZeroedWeakRefsEv
 *   0x684711  nop
 *
 * Semantic: tail-call CleanupZeroedWeakRefs on the process-wide singleton.
 */
export function FFActiveVAMLBackgroundMattingCache_CleanupGlobalCacheNow(): void {
  // 0x684704  %rdi = &sActiveVAMLBackgroundMattingCache
  // 0x68470c  jmp   CleanupZeroedWeakRefs
  FFActiveVAMLBackgroundMattingCache_CleanupZeroedWeakRefs(
    s_ActiveVAMLBackgroundMattingCache,
  );
}

// =============================================================================================
//  CleanupZeroedWeakRefs  — deep body (108 lines of x86); staged as a
//  boundary throw-stub with the entire disassembly captured in the header
//  above. Faithful port requires the FULL __tree in-order walk + ObjC
//  dispatch + tree-node removal; that is a multi-class dependency chain
//  (FFSynchronizable, PCAutoreleasePool, PCNSRef, libc++ __tree) — landing
//  as a stub keeps the gap loud instead of guessed.
// =============================================================================================

/**
 * FFActiveVAMLBackgroundMattingCache::CleanupZeroedWeakRefs() — walks the
 * cache map at +0x90 and removes any node whose PCWeakPointerValue payload
 * (at node+0x30) reports nil for `-[* skipFcpTrackerResultSmoothing]`.
 * @Flexo __ZN34FFActiveVAMLBackgroundMattingCache21CleanupZeroedWeakRefsEv @0x684720.
 *
 * Body summary (see the .s file at raw-port/re/disasm for the 108-instruction
 * verbatim): push an autorelease pool + FFSynchronizer guard, take the lock,
 * in-order traverse the tree via libcxx-internal successor navigation
 * (right-child dive + left-parent climb), for each node call
 * `-[node.payload skipFcpTrackerResultSmoothing]`; on zero return call
 * `__tree_remove` on the node, `PCNSRef::release` on the payload, then
 * `operator delete` on the node itself and decrement +0xa0. Unlock + pop
 * pool on exit; on any exception path also pop the pool via the landing pad
 * at 0x684877 / 0x684893 which calls `__Unwind_Resume`.
 *
 * Deferred as a boundary throw-stub: the full transcription depends on the
 * ported FFSynchronizable / PCAutoreleasePool / libcxx-__tree, none of which
 * are landed yet. Rule 3 (throw on undecoded) applies.
 */
export function FFActiveVAMLBackgroundMattingCache_CleanupZeroedWeakRefs(
  _self: FFActiveVAMLBackgroundMattingCache,
): void {
  throw new Error(
    "FFActiveVAMLBackgroundMattingCache::CleanupZeroedWeakRefs() @Flexo 0x684720 not yet transcribed (108-instruction __tree walk + ObjC dispatch)",
  );
}

// =============================================================================================
//  copyOrCreateVAMLObjectForBackgroundMD5 — 196-line body, deferred stub
// =============================================================================================

/**
 * FFActiveVAMLBackgroundMattingCache::copyOrCreateVAMLObjectForBackgroundMD5
 *   (FFMD5 const& md5, void* creatorContext, bool* outCreated)
 * @Flexo __ZN34FFActiveVAMLBackgroundMattingCache38copyOrCreateVAMLObjectForBackgroundMD5ERK5FFMD5PvPb @0x684a10.
 *
 * Body summary (196 instructions, see the .s file for full verbatim):
 *   0x684a10  standard 5-callee-saved prologue, sub $0x48,%rsp (frame 72B).
 *   0x684a24-2A  save creatorContext (%rdx->r12), md5 (%rsi->r14 for `this` lock),
 *              outCreated (%r8->r13), returnSlot (%rdi->rbx).
 *   0x684a31  PCAutoreleasePool_C1 on rbp-0x58 (stack pool).
 *   0x684a41  FFSynchronizable::Lock() on `this`.
 *   0x684a4a  *outReturn=NULL, *outCreated=false — initialize output.
 *   0x684a64  std::__1::__tree::find(md5) on tree at (this+0x90).
 *   0x684a70  cmp against __end_node — if found, load node+0x30 payload
 *              (PCNSRef<PCWeakPointerValue<VAMLBackgroundMatting*>*>),
 *              dispatch the weak-ref through the ObjC accessor and either
 *              return the strong reference or fall through to creation.
 *   (rest)   creation path: allocate a new PCWeakPointerValue wrapping the
 *              caller's VAMLBackgroundMatting*, __tree_insert it under the
 *              md5 key, set *outCreated=true.
 *   Unlock + pop pool on the normal exit; landing pad calls
 *   FFSynchronizer::~FFSynchronizer, PCAutoreleasePool::~, __Unwind_Resume.
 *
 * Deferred as a boundary throw-stub for the same reasons as
 * CleanupZeroedWeakRefs.
 */
export function FFActiveVAMLBackgroundMattingCache_copyOrCreateVAMLObjectForBackgroundMD5(
  _self: FFActiveVAMLBackgroundMattingCache,
  _md5: unknown,
  _creatorContext: unknown,
  _outCreated: unknown,
): unknown {
  throw new Error(
    "FFActiveVAMLBackgroundMattingCache::copyOrCreateVAMLObjectForBackgroundMD5() @Flexo 0x684a10 not yet transcribed (196-instruction __tree find/insert + ObjC dispatch)",
  );
}
