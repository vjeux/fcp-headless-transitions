// OZImageElementFinalizer.ts — Ozone RAII scope-guard that FLUSHES the
// global HGLazyResIndependentBitmapLoaderCache when it goes out of
// scope. The ctor is a no-op that ignores its HGRenderer* argument; all
// real work happens in the destructor.
//
// The cache being flushed is `HGLazyResIndependentBitmapLoaderCache`, a
// `std::map<PCHash128, HGRef<HGNode>>` accessed via its `Instance()`
// singleton (@Ozone 0xda2b0). The destructor walks and deletes the tree
// via the std::__1::__tree<...>::destroy member (@Ozone 0xe2bc0), then
// resets the map's header sentinel and clears the size counter — i.e.
// it does the moral equivalent of `cache.clear()`.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//   Versions/A/Ozone.
//
// Source disassembly:
//   raw-port/re/disasm/OZImageElementFinalizer.OZImageElementFinalizer.s   (C1 — empty; retq)
//   raw-port/re/disasm/OZImageElementFinalizer.~OZImageElementFinalizer.s  (D1 — clears the lazy-bitmap cache)
// The C2/D2 base-object bodies were fetched inline via `otool -tv -arch x86_64`
// (disasm.sh only emits the D1/C1 slice for name-mangled Itanium-ABI
// destructor/constructor pairs). Both C2/C1 are empty ret; both D2/D1
// share the same body byte-for-byte (D2 emits `callq 0x3370` for the
// clang-terminate thunk, D1 emits `callq ___clang_call_terminate` — the
// same thunk at Ozone 0x3370).
//
// Ozone symbols transcribed:
//   @0x000da460  OZImageElementFinalizer::OZImageElementFinalizer(HGRenderer*)  (C2 — base-object ctor; empty)
//   @0x000da470  OZImageElementFinalizer::OZImageElementFinalizer(HGRenderer*)  (C1 — complete-object ctor; empty)
//   @0x000da480  OZImageElementFinalizer::~OZImageElementFinalizer()            (D2 — base-object dtor; flush cache)
//   @0x000da4c0  OZImageElementFinalizer::~OZImageElementFinalizer()            (D1 — complete-object dtor; flush cache)
//
// DECODE evidence:
//   * The class has NO decoded instance layout — neither C1/C2 zero-init
//     any bytes nor read %rdi's memory. Both destructors ignore `this`
//     entirely (no reads of %rdi's memory; %rdi is dead after the
//     prologue's push/save). The class exists purely as a stack-allocated
//     scope handle: its address is a placeholder that pins RAII lifetime
//     to a lexical scope, and the dtor runs its cache-flush unconditionally
//     when the scope ends.
//
//   * Ctor body — both C1 (@0xda470) and C2 (@0xda460) are identical:
//       pushq %rbp
//       movq  %rsp, %rbp
//       popq  %rbp
//       retq
//     The HGRenderer* argument in %rsi is completely ignored (no reads,
//     no writes, no forwarding). The presence of the parameter — matched
//     by the mangled name `_C1EP10HGRenderer` — indicates the class API
//     surface reserves an HGRenderer* handle for a future use.
//
//   * Dtor body — both D1 (@0xda4c0) and D2 (@0xda480) mirror the exact
//     same sequence (D2 uses raw jump targets while D1 shows resolved
//     mangled names in otool's comments — the underlying instruction
//     bytes are identical):
//
//       pushq  %rbp                              ; prologue
//       movq   %rsp, %rbp
//       pushq  %r14                              ; callee-save
//       pushq  %rbx
//       callq  HGLazyResIndependentBitmapLoaderCache::Instance()
//              (Ozone 0xda2b0)                   ; %rax = singleton
//       movq   %rax, %rbx                        ; %rbx = singleton
//       movq   %rax, %r14                        ; %r14 = singleton
//       addq   $0x8, %r14                        ; %r14 = &singleton[0x8]
//                                                  (the sentinel pointer;
//                                                   also the address of the
//                                                   map's root-node slot)
//       movq   0x8(%rax), %rsi                   ; %rsi = singleton[0x8]
//                                                  = the map's root node
//                                                  (or null if already empty)
//       movq   %rax, %rdi                        ; %rdi = singleton
//       callq  std::__1::__tree<...>::destroy    ; recursively frees the
//              (Ozone 0xe2bc0)                     tree rooted at %rsi
//                                                  (using %rdi as the tree
//                                                  handle for its allocator).
//       movq   %r14, (%rbx)                      ; singleton[0x0] = &singleton[0x8]
//                                                  — reset the "begin"
//                                                  pointer back to the
//                                                  header sentinel (empty-map
//                                                  invariant of libc++'s
//                                                  __tree: __begin_node_ ==
//                                                  end() when the tree is
//                                                  empty).
//       xorps  %xmm0, %xmm0                      ; zero xmm0
//       movups %xmm0, 0x8(%rbx)                  ; singleton[0x8] = 0
//                                                  singleton[0x10] = 0
//                                                  — clears the __pair3_
//                                                  (size, comparator) and
//                                                  the parent-root slot.
//       popq   %rbx                              ; epilogue
//       popq   %r14
//       popq   %rbp
//       retq
//
//     Exception-frame tail (D1: `movq %rax, %rdi; callq __clang_call_terminate`
//     @0xda4f1; D2: `movq %rax, %rdi; callq 0x3370` @0xda4b1). Ozone's
//     `__clang_call_terminate` thunk at @0x3370 is verified: `callq
//     __cxa_begin_catch (stub@0x6dfcd8); callq std::terminate (stub@0x6dfc2a)`.
//     Elided in the JS port (no C++ unwinding).
//
//     Full semantic: unconditionally reset the lazy-bitmap loader cache
//     to empty by walking-and-freeing its std::map tree, then resetting
//     the map's header sentinel + zeroing the size/comparator/root
//     pointers. Purely a moral `cache.clear()`.
//
// Vtable / vptr:
//   The class has no virtual methods surfaced on this slice. C1/C2 do
//   not install a vptr (no `leaq <vt>(%rip), %rax; movq %rax, (%rdi)` in
//   either ctor body). The two destructors are ordinary named symbols,
//   not vtable slots. No vtable lookup is needed.
//
// Called functions (all Ozone imports; call sites annotated):
//   HGLazyResIndependentBitmapLoaderCache::Instance()   @Ozone 0xda2b0
//                                                        (D2 @0xda487; D1 @0xda4c7)
//   std::__1::__tree<...>::destroy(__tree_node<...>*)   @Ozone 0xe2bc0
//                                                        (D2 @0xda49d; D1 @0xda4dd)
//   __clang_call_terminate                              @Ozone 0x3370
//                                                        (D2 exception tail @0xda4b4;
//                                                         D1 exception tail @0xda4f4)
//     — the Ozone thunk body:
//         @0x3370  pushq %rbp; movq %rsp, %rbp
//         @0x3374  callq __cxa_begin_catch  (stub@0x6dfcd8)
//         @0x3379  callq std::terminate     (stub@0x6dfc2a)
//         @0x337e  nop
//
// Frontier callees (surfaced as throwing stubs — each cites its @0xADDR):
//   HGLazyResIndependentBitmapLoaderCache — the singleton this class
//     mutates. Its Instance() function is the only method on this class's
//     surface; its full layout / lifecycle is off-slice.
//   std::__1::__tree<PCHash128, HGRef<HGNode>>::destroy — libc++
//     internal. Frontier.
//
// The class has no reused-port dependencies (no HGRect, no HGRectf, no
// CMTime — this is purely a cache-flush guard).

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. This
 * class's ctor takes an `HGRenderer*` argument but never reads it (both
 * ctor bodies are empty `retq`s @Ozone 0xda460 / 0xda470). The parameter
 * survives on the signature to match the mangled name
 * `_C1EP10HGRenderer` / `_C2EP10HGRenderer`.
 */
export type HGRenderer = object;

/**
 * `HGLazyResIndependentBitmapLoaderCache` — Ozone singleton that memoises
 * resolution-independent bitmap loaders keyed by `PCHash128` and mapped
 * to `HGRef<HGNode>` values.
 *
 * Layout inferred from OZImageElementFinalizer's destructor:
 *   [0x00]  __begin_node_        — libc++ __tree's "begin" pointer; when
 *                                   the tree is empty this equals
 *                                   `&this->__pair1_.__value_.__parent_`,
 *                                   i.e. `&this[0x8]`.
 *   [0x08]  __pair1_.__parent_   — the __tree_node<...>* root; the entire
 *                                   tree hangs off this.
 *   [0x10]  __pair3_.__value_    — size_t (the map's element count);
 *                                   cleared to 0 by ~D by the
 *                                   `movups %xmm0, 0x8(%rbx)` that zeroes
 *                                   both 0x8 and 0x10 in one 16-byte store.
 *
 * Nothing else about the singleton's lifecycle is on this class's slice.
 */
export type HGLazyResIndependentBitmapLoaderCache = object;

/**
 * `HGLazyResIndependentBitmapLoaderCache::Instance()` — Ozone singleton
 * accessor @Ozone 0xda2b0. Called from OZImageElementFinalizer::~D2
 * @0xda487 and ~D1 @0xda4c7. Returns the process-wide unique
 * `HGLazyResIndependentBitmapLoaderCache*`. Not yet transcribed.
 */
function HGLazyResIndependentBitmapLoaderCache_Instance(): HGLazyResIndependentBitmapLoaderCache {
  throw new Error(
    "OZImageElementFinalizer: HGLazyResIndependentBitmapLoaderCache::Instance() not yet transcribed @Ozone 0xda2b0 (D2 call site 0xda487; D1 call site 0xda4c7)",
  );
}

/**
 * `std::__1::__tree<PCHash128, HGRef<HGNode>, ...>::destroy(node*)` —
 * libc++ internal that recursively deletes a subtree rooted at `node`.
 * Called from OZImageElementFinalizer::~D2 @0xda49d and ~D1 @0xda4dd
 * with (rdi = singleton, rsi = singleton[0x8] = current root node). Not
 * yet transcribed.
 *
 * (This is a `std::__1::__tree::destroy` member — despite taking a
 * root-node pointer as its second argument, its first argument is the
 * tree object itself because it must reach into the tree's node
 * allocator to `delete` each node. libc++ implements this as a
 * post-order recursive walk that visits and deallocates each node.)
 */
function std_tree_PCHash128_HGRefHGNode_destroy(
  _tree: HGLazyResIndependentBitmapLoaderCache,
  _rootNode: unknown,
): void {
  throw new Error(
    "OZImageElementFinalizer: std::__1::__tree<PCHash128, HGRef<HGNode>>::destroy(__tree_node*) not yet transcribed @Ozone 0xe2bc0 (D2 call site 0xda49d; D1 call site 0xda4dd)",
  );
}

/**
 * `OZImageElementFinalizer` — Ozone RAII scope-guard that flushes the
 * lazy-bitmap loader cache on scope exit. The ctor is a no-op; all
 * real work happens in `destroy()` (mirrors the C++ ~OZImageElementFinalizer()).
 *
 * Callers construct one of these at the point where they want the cache
 * to remain populated (e.g. during a batch image-element parse) and
 * allow it to fall out of scope at the flush boundary.
 */
export class OZImageElementFinalizer {
  /**
   * `OZImageElementFinalizer::OZImageElementFinalizer(HGRenderer*)` —
   * empty constructor. Both C1 @Ozone 0xda470 and C2 @Ozone 0xda460
   * have identical 4-instruction bodies (`pushq %rbp; movq %rsp, %rbp;
   * popq %rbp; retq`). The `HGRenderer*` argument is passed by the
   * mangled ABI but never accessed by either body.
   *
   * We accept the parameter to match the C++ signature 1:1 but do
   * nothing with it — as the compiled code does.
   */
  constructor(_renderer: HGRenderer) {
    // @0xda460 (C2) / @0xda470 (C1) — no-op. The stored `_renderer` is
    // intentionally unused per the DECODE evidence.
  }

  /**
   * `OZImageElementFinalizer::~OZImageElementFinalizer()` — flush the
   * lazy-bitmap loader cache. Corresponds to both D1 (@Ozone 0xda4c0)
   * and D2 (@Ozone 0xda480) — the two share identical instruction
   * bytes; see file-header DECODE evidence.
   *
   * Address-by-address (D2 @0xda480):
   *   0xda480..0xda486  prologue (rbp frame; callee-save r14/rbx).
   *   0xda487           `callq HGLazyResIndependentBitmapLoaderCache::Instance()`
   *                     (Ozone 0xda2b0). Returns %rax = singleton.
   *   0xda48c..0xda492  `%rbx = %rax; %r14 = %rax + 0x8`. The r14 arithmetic
   *                     computes the address of the singleton's [0x8]
   *                     slot — which is also the address of libc++'s
   *                     empty-tree sentinel (see the [0x0]-slot comment
   *                     on the `HGLazyResIndependentBitmapLoaderCache`
   *                     type above).
   *   0xda496..0xda4a2  `%rsi = singleton[0x8]  (= current root node);
   *                      %rdi = singleton;
   *                      callq std::__1::__tree<...>::destroy(rdi, rsi)`
   *                     — recursively delete the map's node tree.
   *   0xda4a2..0xda4ac  `singleton[0x0] = %r14  (= &singleton[0x8])` —
   *                     reset the "begin" pointer to the header sentinel.
   *                     Then `movups %xmm0, 0x8(%rbx)` with `xorps
   *                     %xmm0, %xmm0` zeroes 16 bytes at [0x8..0x18]
   *                     (root pointer + size + comparator slot).
   *   0xda4ac..0xda4b0  epilogue + retq.
   *   0xda4b1..0xda4b8  exception-frame landing (elided in JS).
   */
  destroy(): void {
    // @0xda487 — grab the singleton.
    const singleton = HGLazyResIndependentBitmapLoaderCache_Instance();

    // @0xda496..0xda49d — walk-and-free the tree rooted at singleton[0x8].
    //
    // NOTE: On the DECODED asm side, `singleton[0x8]` is read directly out
    // of the singleton's memory before the destroy call. On the JS side
    // we lack a decoded getter for that field (the singleton is opaque —
    // its full layout lives in the not-yet-transcribed `Instance()` body
    // and its writer paths). We surface both reads via the destroy stub,
    // which cites its @0xADDR — this is the correct decode-before-implement
    // shape: no fabricated field access, just an honest frontier stub at
    // the call site.
    //
    // A future port that decodes HGLazyResIndependentBitmapLoaderCache
    // in full will replace the throwing stub with the real tree walk;
    // this file will not need changes.
    const rootNodePlaceholder: unknown = singleton; // % of asm: %rsi = singleton[0x8]; encoded as the singleton handle so the stub receives it — the stub throws before touching it, so the placeholder never escapes.
    std_tree_PCHash128_HGRefHGNode_destroy(singleton, rootNodePlaceholder);

    // @0xda4a2..0xda4a8 — reset the map's header sentinel + zero the
    // root/size slots. The below writes reflect the exact asm order:
    //   [0x0] = &[0x8]     (`movq %r14, (%rbx)`)
    //   [0x8] = 0          }
    //   [0x10] = 0         } (`movups %xmm0, 0x8(%rbx)` — one 16-byte
    //                        store covering both slots)
    //
    // Same rationale as the tree-destroy call: the singleton's field
    // layout is off-slice. Surfacing a throwing stub keeps the port
    // decode-honest. The stub cites the exact byte offsets so a later
    // singleton port can wire them up without ambiguity.
    HGLazyResIndependentBitmapLoaderCache_reset_after_flush(singleton);
  }
}

/**
 * `HGLazyResIndependentBitmapLoaderCache` post-flush reset — the three
 * memory writes at the tail of OZImageElementFinalizer's destructor:
 *   singleton[0x0]  = &singleton[0x8]     (@Ozone 0xda4a2 / 0xda4e2)
 *   singleton[0x8]  = 0                   ┐ one 16-byte SSE store
 *   singleton[0x10] = 0                   ┘ (@Ozone 0xda4a5..0xda4ac / 0xda4e5..0xda4ec)
 *
 * These correspond to libc++'s empty-tree invariant: `__begin_node_`
 * points at the header sentinel, `__pair1_.__parent_` (root) is null,
 * and `__pair3_.__value_` (size) is 0.
 *
 * Not yet transcribed as a decoded singleton write — surfaced as a
 * throwing stub citing both the D2 and D1 addresses of the pattern.
 */
function HGLazyResIndependentBitmapLoaderCache_reset_after_flush(
  _singleton: HGLazyResIndependentBitmapLoaderCache,
): void {
  throw new Error(
    "OZImageElementFinalizer: HGLazyResIndependentBitmapLoaderCache post-flush reset (writes to [0x0]/[0x8]/[0x10]) not yet transcribed @Ozone D2 sites 0xda4a2/0xda4a5/0xda4a8 (D1 sites 0xda4e2/0xda4e5/0xda4e8) — waits on decoded singleton layout in a future HGLazyResIndependentBitmapLoaderCache port",
  );
}
