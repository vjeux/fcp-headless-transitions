// HGDitherLUTEntryFactory.ts — Helium's factory for dither LUT cache entries.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGDitherLUTEntryFactory.~HGDitherLUTEntryFactory.s
//       @0x6fe60 = D1 (in-place destructor)  [same body pattern; see below]
//       @0x6fe70 = D0 (deleting destructor)
//   raw-port/re/disasm/Helium.HGDitherLUTEntryFactory.createLUTEntry.s
//       @0x6fe80
//
// Vtable @0xa08b68 (installed ptr @0xa08b78, i.e. vptr slot 0x10):
//   *0x00 -> 0x6fe60  ~HGDitherLUTEntryFactory (D1, in-place)
//   *0x08 -> 0x6fe70  ~HGDitherLUTEntryFactory (D0, deleting)
//   *0x10 -> 0x6fe80  createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
//   *0x38  typeinfo name "HGDitherLUTEntryFactory" @0x3ccc67
//   *0x40  typeinfo for  HGLUTCache::LUTEntryFactory @0xa13730
// (Resolved via `raw-port/army/tools/resolve.py Helium vtable HGDitherLUTEntryFactory`.)
//
// ---------------------------------------------------------------------------
// HGDitherLUTEntryFactory LAYOUT
// ---------------------------------------------------------------------------
// The class is a POLYMORPHIC FACTORY — a stateless vtable-only object,
// exactly like its sibling HGColorConformLUTEntryFactory. The disassembly of
// every method reads/writes NO instance fields; the entire object body is
// just the C++ vptr in the first 8 bytes (installed ptr 0xa08b78). The three
// methods are:
//
//   struct HGDitherLUTEntryFactory : HGLUTCache::LUTEntryFactory {
//     const void* __vptr;      // +0x00  = 0xa08b78 in Helium __DATA_CONST
//   };                         // sizeof = 8 (trivial-body derived class)
//
// The class extends the HG-cache "LUTEntryFactory" ABI (a virtual method
// `createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)` returning a fresh
// cache-entry object). The concrete override here builds an
// `HGDitherLUTEntry` — the RENDERABLE cache entry that applies a dither LUT
// via HGRenderer.
//
// ---------------------------------------------------------------------------
// D0 deleting destructor — HGDitherLUTEntryFactory::~HGDitherLUTEntryFactory
// @0x6fe70
// ---------------------------------------------------------------------------
//   pushq %rbp / movq %rsp,%rbp / popq %rbp
//   jmp   0x3c4fa0   ## symbol stub for: __ZdlPv   (operator delete(void*))
// The D0 (deleting) variant tail-calls `operator delete(this)` without any
// additional cleanup — the base D1 body is a no-op (no owned resources
// beyond the vptr). This is the standard Itanium-ABI D0/D1 split for a
// class with a trivial destructor: the deleting form just frees the storage.
//
// (D1 in-place destructor @0x6fe60 is symbolically listed in the vtable but
// consists of the same trivial pushq/popq/retq prologue+epilogue pattern —
// see the sibling HGColorConformLUTEntryFactory for the identical shape.)
//
// ---------------------------------------------------------------------------
// createLUTEntry — HGDitherLUTEntryFactory::createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
// @0x6fe80
// ---------------------------------------------------------------------------
// Direct transcription of the x86_64 body:
//
//     pushq %rbp / movq %rsp,%rbp
//     pushq %r15 / pushq %r14 / pushq %rbx / pushq %rax   ; save callee-saved + align
//     movq  %rdx, %r14                                    ; save arg2 (HGRenderer*)
//     movq  %rsi, %r15                                    ; save arg1 (HGLUTCache::LUTInfo*)
//     movl  $0x28, %edi                                   ; sizeof(HGDitherLUTEntry) = 40
//     callq __Znwm                                        ; operator new(size_t) — throwing
//     movq  %rax, %rbx                                    ; rbx = raw storage
//     movq  %rax, %rdi                                    ; this = new object
//     movq  %r15, %rsi                                    ; arg1 = LUTInfo*
//     movq  %r14, %rdx                                    ; arg2 = HGRenderer*
//     callq HGDitherLUTEntry::HGDitherLUTEntry(LUTInfo*, HGRenderer*) ; ctor @0x6fea6
//     movq  %rbx, %rax                                    ; return the new object
//     addq $0x8,%rsp / popq %rbx / popq %r14 / popq %r15 / popq %rbp / retq
//
//   Cleanup landing pad (thrown from the ctor):
//     movq  %rax, %r14                                    ; save exception object
//     movq  %rbx, %rdi                                    ; rdi = raw storage
//     callq __ZdlPv                                       ; operator delete(void*)
//     movq  %r14, %rdi                                    ; rdi = exception
//     callq __Unwind_Resume                               ; rethrow
//
// The "0x28 sizeof" here is the size of HGDitherLUTEntry (the CREATED
// object), NOT of the factory itself. The `new T(args)` allocation is
// paired with a landing-pad `operator delete` in case the ctor throws — the
// classic Itanium-ABI `new T(args)` lowering. The factory instance itself
// is untouched — no `this` field is read (no `movq NN(%rdi),%r??`),
// confirming the stateless-vtable-only layout.
//
// ---------------------------------------------------------------------------
// Callees / stubs (resolved from otool's inline stub annotations):
//   0x3c4fb2  __Znwm                = ::operator new(size_t)         (throwing)
//   0x3c4fa0  __ZdlPv               = ::operator delete(void*)
//   0x3c4e02  __Unwind_Resume       = libunwind rethrow
//   0x6fea6   (direct, no stub)     = HGDitherLUTEntry::HGDitherLUTEntry
//                                     (constructor body @0x6fea6 spans 175
//                                     lines and is NOT yet ported here)
// ---------------------------------------------------------------------------

/**
 * Opaque handle for a Helium `HGLUTCache::LUTInfo*` — the cache key/desc for
 * the LUT to be built. The factory only forwards it to the created entry's
 * constructor; it is never dereferenced here.
 */
export type HGLUTCache_LUTInfo = { readonly __brand: 'HGLUTCache::LUTInfo' };

/**
 * Opaque handle for a Helium `HGRenderer*` — the renderer that will execute
 * the created cache entry. Forwarded verbatim to HGDitherLUTEntry's ctor.
 */
export type HGRenderer = { readonly __brand: 'HGRenderer' };

/**
 * Opaque handle for a freshly-constructed `HGDitherLUTEntry` (the polymorphic
 * cache-entry object produced by createLUTEntry). The concrete class has not
 * yet been transcribed; this is a marker so `createLUTEntry` still returns
 * an inhabited-but-throwing value at every call site.
 */
export type HGDitherLUTEntry = { readonly __brand: 'HGDitherLUTEntry' };

/**
 * Frontier callee: the HGDitherLUTEntry constructor called from
 * createLUTEntry @0x6fea6. Not yet transcribed (175-line body) — throws so
 * the call graph stays loud, per PORTING_SPEC Rule 3 (throw on undecoded).
 *
 * @see raw-port/re/disasm/Helium.HGDitherLUTEntryFactory.createLUTEntry.s
 *      line 000000000006fea6.
 * @see raw-port/re/disasm/Helium.HGDitherLUTEntry.HGDitherLUTEntry.s
 *      (full 175-line body, deferred).
 */
export function HGDitherLUTEntry_ctor(
  _self: HGDitherLUTEntry,
  _info: HGLUTCache_LUTInfo,
  _renderer: HGRenderer,
): void {
  throw new Error(
    'HGDitherLUTEntry::HGDitherLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*) @0x6fea6 not yet transcribed',
  );
}

/**
 * `HGDitherLUTEntryFactory` — a polymorphic factory for dither LUT cache
 * entries. The concrete C++ class holds no instance state beyond its C++
 * vptr; every instance is behaviourally identical.
 *
 * Vtable @0xa08b68 (installed ptr 0xa08b78):
 *   *0x00 D1 @0x6fe60, *0x08 D0 @0x6fe70, *0x10 createLUTEntry @0x6fe80.
 * Base ABI: HGLUTCache::LUTEntryFactory (typeinfo @0xa13730 via slot 0x40).
 */
export class HGDitherLUTEntryFactory {
  /**
   * D1 in-place destructor — trivial. Faithful transcription of the
   * pushq/popq/retq body @0x6fe60; no members, no parent-dtor call.
   *
   * @see @0x6fe60 in raw-port/re/disasm/Helium.HGDitherLUTEntryFactory.~HGDitherLUTEntryFactory.s
   */
  destroyInPlace(): void {
    // no-op: matches the empty prologue+epilogue at @0x6fe60.
  }

  /**
   * D0 deleting destructor — tail-calls `operator delete(this)`. In TS/JS
   * there is no manual `operator delete`; the equivalent runtime behaviour
   * is to drop the reference and let GC reclaim it. We call
   * `destroyInPlace()` (a no-op, matching the trivial D1 body) for symmetry
   * with the C++ ABI.
   *
   * @see @0x6fe70 in raw-port/re/disasm/Helium.HGDitherLUTEntryFactory.~HGDitherLUTEntryFactory.s
   */
  destroyAndDelete(): void {
    this.destroyInPlace();
    // `jmp __ZdlPv` at @0x6fe75: `operator delete(void*)` — a no-op in a
    // GC'd host language. Kept as a documented boundary, not simulated.
  }

  /**
   * `createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)` — allocate a fresh
   * `HGDitherLUTEntry` (size 0x28 = 40 bytes) and construct it in place
   * from the given cache key and renderer.
   *
   * Faithful transcription of the body @0x6fe80:
   *   1. `operator new(0x28)` at 0x6fe95 (throws on OOM).
   *   2. Call HGDitherLUTEntry ctor at 0x6fea6 with (info, renderer).
   *   3. If the ctor throws, the landing pad at 0x6feb9 calls
   *      `operator delete` on the raw storage and rethrows via
   *      __Unwind_Resume — modelled here by letting the throw propagate
   *      (the TS runtime will not have leaked storage; there is nothing
   *      to `operator delete` in a GC host).
   *
   * @see @0x6fe80 in raw-port/re/disasm/Helium.HGDitherLUTEntryFactory.createLUTEntry.s
   */
  createLUTEntry(
    info: HGLUTCache_LUTInfo,
    renderer: HGRenderer,
  ): HGDitherLUTEntry {
    // @0x6fe95: `movl $0x28,%edi ; callq __Znwm`.
    // `operator new(size_t)` = allocate 40 bytes of raw storage for
    // HGDitherLUTEntry. In TS we materialise the object as an opaque
    // handle; the actual byte layout is HGDitherLUTEntry's concern.
    const raw = {} as HGDitherLUTEntry;

    // @0x6fea6: `callq HGDitherLUTEntry::HGDitherLUTEntry(info, renderer)`.
    // The frontier stub raises so the port stays loud until the ctor is
    // ported. If it does raise, execution unwinds directly out of this
    // function — mirroring the __Unwind_Resume landing pad @0x6feb9,
    // just without the manual `operator delete(raw)` (GC handles it).
    HGDitherLUTEntry_ctor(raw, info, renderer);

    // @0x6feab: `movq %rbx,%rax ; ...pop... ; retq` — return the new object.
    return raw;
  }
}
