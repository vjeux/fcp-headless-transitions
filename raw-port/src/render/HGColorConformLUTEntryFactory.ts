// HGColorConformLUTEntryFactory.ts — Helium's factory for color-conform LUT cache entries.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGColorConformLUTEntryFactory.~HGColorConformLUTEntryFactory.s
//       @0x1c9d90 = D1 (in-place destructor)
//       @0x1d2170 = D0 (deleting destructor)
//   raw-port/re/disasm/Helium.HGColorConformLUTEntryFactory.createLUTEntry.s
//       @0x1d2180
//
// Vtable @0xa29ed0 (installed ptr @0xa29ee0, i.e. vptr slot 0x10):
//   *0x00 -> 0x1c9d90  ~HGColorConformLUTEntryFactory (D1, in-place)
//   *0x08 -> 0x1d2170  ~HGColorConformLUTEntryFactory (D0, deleting)
//   *0x10 -> 0x1d2180  createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
// (Resolved via `raw-port/army/tools/resolve.py Helium vtable HGColorConformLUTEntryFactory`.)
//
// ---------------------------------------------------------------------------
// HGColorConformLUTEntryFactory LAYOUT
// ---------------------------------------------------------------------------
// The class is a POLYMORPHIC FACTORY — a stateless vtable-only object. The
// disassembly of every method reads/writes NO instance fields; the entire
// object body is just the C++ vptr in the first 8 bytes (installed ptr
// 0xa29ee0). The three methods are:
//
//   struct HGColorConformLUTEntryFactory {
//     const void* __vptr;      // +0x00  = 0xa29ee0 in Helium __DATA_CONST
//   };                         // sizeof = 8 (trivial-body base class)
//
// The class extends the HG-cache "LUTEntryFactory" ABI (a virtual method
// `createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)` returning a fresh
// cache-entry object). The concrete override here builds an
// `HGApplyNDLUTEntry`, which is the RENDERABLE cache entry that applies an
// N-dimensional color-conform LUT via HGRenderer.
//
// ---------------------------------------------------------------------------
// D1 in-place destructor — HGColorConformLUTEntryFactory::~HGColorConformLUTEntryFactory
// @0x1c9d90
// ---------------------------------------------------------------------------
//   pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
// A trivial no-op prologue+epilogue. The class holds no owned resources
// beyond the vptr, so the D1 destructor does nothing. (The base class
// LUTEntryFactory's own destructor is also empty at this call site — there
// is no `callq` to a parent destructor and no member cleanup.)
//
// ---------------------------------------------------------------------------
// D0 deleting destructor — HGColorConformLUTEntryFactory::~HGColorConformLUTEntryFactory
// @0x1d2170
// ---------------------------------------------------------------------------
//   pushq %rbp / movq %rsp,%rbp / popq %rbp
//   jmp   0x3c4fa0   ## symbol stub for: __ZdlPv   (operator delete(void*))
// The D0 (deleting) variant tail-calls `operator delete(this)` without doing
// any additional cleanup — again because the D1 body would be a no-op.
// This is the standard Itanium-ABI D0/D1 split for a class with a trivial
// destructor: the deleting form just frees the storage.
//
// ---------------------------------------------------------------------------
// createLUTEntry — HGColorConformLUTEntryFactory::createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
// @0x1d2180
// ---------------------------------------------------------------------------
// Direct transcription of the x86_64 body:
//
//     movq %rdx, %r14                    ; save arg2 (HGRenderer*)
//     movq %rsi, %r15                    ; save arg1 (HGLUTCache::LUTInfo*)
//     movl $0x28, %edi                   ; sizeof(HGApplyNDLUTEntry) = 40 bytes
//     callq __Znwm                       ; operator new(size_t)  (throws std::bad_alloc)
//     movq %rax, %rbx                    ; rbx = raw storage
//     movq %rax, %rdi                    ; this = new object
//     movq %r15, %rsi                    ; arg1 = LUTInfo*
//     movq %r14, %rdx                    ; arg2 = HGRenderer*
//     callq HGApplyNDLUTEntry::HGApplyNDLUTEntry(LUTInfo*, HGRenderer*)   ; ctor
//     movq %rbx, %rax                    ; return the new object
//     retq
//
//   Cleanup landing pad (thrown from the ctor):
//     movq %rax, %r14                    ; save exception object
//     movq %rbx, %rdi                    ; rdi = raw storage
//     callq __ZdlPv                      ; operator delete(void*)
//     movq %r14, %rdi                    ; rdi = exception
//     callq __Unwind_Resume              ; rethrow
//
// The "0x28 sizeof" here is the size of HGApplyNDLUTEntry (the CREATED
// object), NOT of the factory itself. The `new(nothrow=false)` allocation is
// paired with a landing-pad `operator delete` in case the ctor throws — the
// classic Itanium-ABI `new T(args)` lowering.
//
// ---------------------------------------------------------------------------
// Callees / stubs (resolved from otool's inline stub annotations):
//   0x3c4fb2  __Znwm                = ::operator new(size_t)         (throwing)
//   0x3c4fa0  __ZdlPv               = ::operator delete(void*)
//   0x3c4e02  __Unwind_Resume       = libunwind rethrow
//   0x1d21a6 (direct call, no stub) = HGApplyNDLUTEntry::HGApplyNDLUTEntry
//                                     (constructor, not yet transcribed)
// ---------------------------------------------------------------------------

/**
 * Opaque handle for a Helium `HGLUTCache::LUTInfo*` — the cache key/desc for
 * the LUT to be built. The factory only forwards it to the created entry's
 * constructor; it is never dereferenced here.
 */
export type HGLUTCache_LUTInfo = { readonly __brand: 'HGLUTCache::LUTInfo' };

/**
 * Opaque handle for a Helium `HGRenderer*` — the renderer that will execute
 * the created cache entry. Forwarded verbatim to HGApplyNDLUTEntry's ctor.
 */
export type HGRenderer = { readonly __brand: 'HGRenderer' };

/**
 * Opaque handle for a freshly-constructed `HGApplyNDLUTEntry` (the polymorphic
 * cache-entry object produced by createLUTEntry). The concrete class has not
 * yet been transcribed; this is a marker so `createLUTEntry` still returns
 * an inhabited-but-throwing value at every call site.
 */
export type HGApplyNDLUTEntry = { readonly __brand: 'HGApplyNDLUTEntry' };

/**
 * Frontier callee: the HGApplyNDLUTEntry constructor called from
 * createLUTEntry @0x1d21a6. Not yet transcribed — throws so the call graph
 * stays loud, per PORTING_SPEC Rule 3.
 *
 * @see raw-port/re/disasm/Helium.HGColorConformLUTEntryFactory.createLUTEntry.s
 *      line 00000000001d21a6.
 */
export function HGApplyNDLUTEntry_ctor(
  _self: HGApplyNDLUTEntry,
  _info: HGLUTCache_LUTInfo,
  _renderer: HGRenderer,
): void {
  throw new Error(
    'HGApplyNDLUTEntry::HGApplyNDLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*) @0x1d21a6 not yet transcribed',
  );
}

/**
 * `HGColorConformLUTEntryFactory` — a polymorphic factory for
 * color-conform LUT cache entries. The concrete C++ class holds no instance
 * state beyond its C++ vptr; every instance is behaviourally identical.
 *
 * Vtable @0xa29ed0 (installed ptr 0xa29ee0):
 *   *0x00 D1 @0x1c9d90, *0x08 D0 @0x1d2170, *0x10 createLUTEntry @0x1d2180.
 */
export class HGColorConformLUTEntryFactory {
  /**
   * D1 in-place destructor — trivial. Faithful transcription of the
   * pushq/popq/retq body @0x1c9d90; no members, no parent-dtor call.
   *
   * @see @0x1c9d90 in raw-port/re/disasm/Helium.HGColorConformLUTEntryFactory.~HGColorConformLUTEntryFactory.s
   */
  destroyInPlace(): void {
    // no-op: matches the empty prologue+epilogue at @0x1c9d90.
  }

  /**
   * D0 deleting destructor — tail-calls `operator delete(this)`. In TS/JS
   * there is no manual `operator delete`; the equivalent runtime behaviour
   * is to drop the reference and let GC reclaim it. We call
   * `destroyInPlace()` (a no-op, matching the trivial D1 body) for symmetry
   * with the C++ ABI.
   *
   * @see @0x1d2170 in raw-port/re/disasm/Helium.HGColorConformLUTEntryFactory.~HGColorConformLUTEntryFactory.s
   */
  destroyAndDelete(): void {
    this.destroyInPlace();
    // `jmp __ZdlPv` at @0x1d2175: `operator delete(void*)` — a no-op in a
    // GC'd host language. Kept as a documented boundary, not simulated.
  }

  /**
   * `createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)` — allocate a fresh
   * `HGApplyNDLUTEntry` (size 0x28 = 40 bytes) and construct it in place
   * from the given cache key and renderer.
   *
   * Faithful transcription of the body @0x1d2180:
   *   1. `operator new(0x28)` at 0x1d2195 (throws on OOM).
   *   2. Call HGApplyNDLUTEntry ctor at 0x1d21a6 with (info, renderer).
   *   3. If the ctor throws, the landing pad at 0x1d21b9 calls
   *      `operator delete` on the raw storage and rethrows via
   *      __Unwind_Resume — modelled here by letting the throw propagate
   *      (the TS runtime will not have leaked storage; there is nothing
   *      to `operator delete` in a GC host).
   *
   * @see @0x1d2180 in raw-port/re/disasm/Helium.HGColorConformLUTEntryFactory.createLUTEntry.s
   */
  createLUTEntry(
    info: HGLUTCache_LUTInfo,
    renderer: HGRenderer,
  ): HGApplyNDLUTEntry {
    // @0x1d2195: `movl $0x28,%edi ; callq __Znwm`.
    // `operator new(size_t)` = allocate 40 bytes of raw storage for
    // HGApplyNDLUTEntry. In TS we materialise the object as an opaque
    // handle; the actual byte layout is HGApplyNDLUTEntry's concern.
    const raw = {} as HGApplyNDLUTEntry;

    // @0x1d21a6: `callq HGApplyNDLUTEntry::HGApplyNDLUTEntry(info, renderer)`.
    // The frontier stub raises so the port stays loud until the ctor is
    // ported. If it does raise, execution unwinds directly out of this
    // function — mirroring the __Unwind_Resume landing pad @0x1d21b9,
    // just without the manual `operator delete(raw)` (GC handles it).
    HGApplyNDLUTEntry_ctor(raw, info, renderer);

    // @0x1d21ab: `movq %rbx,%rax ; retq` — return the new object.
    return raw;
  }
}
