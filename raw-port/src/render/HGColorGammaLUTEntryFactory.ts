// HGColorGammaLUTEntryFactory.ts — Helium's factory for color-gamma LUT
// cache entries. Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGColorGammaLUTEntryFactory.D1.s
//       @0x0fb200 = D1 (in-place / base destructor)
//   raw-port/re/disasm/Helium.HGColorGammaLUTEntryFactory.~HGColorGammaLUTEntryFactory.s
//       @0x0fce00 = D0 (deleting destructor)
//   raw-port/re/disasm/Helium.HGColorGammaLUTEntryFactory.createLUTEntry.s
//       @0x0fce10 = createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
//
// Symbol map (from Helium's nm|c++filt table):
//   __ZN27HGColorGammaLUTEntryFactoryD1Ev
//     HGColorGammaLUTEntryFactory::~HGColorGammaLUTEntryFactory()  @0x0fb200
//   __ZN27HGColorGammaLUTEntryFactoryD0Ev
//     HGColorGammaLUTEntryFactory::~HGColorGammaLUTEntryFactory()  @0x0fce00
//   __ZN27HGColorGammaLUTEntryFactory14createLUTEntryEPN10HGLUTCache7LUTInfoEP10HGRenderer
//     HGColorGammaLUTEntryFactory::createLUTEntry(...)             @0x0fce10
//
// ---------------------------------------------------------------------------
// HGColorGammaLUTEntryFactory LAYOUT
// ---------------------------------------------------------------------------
// Structural TWIN of HGColorConformLUTEntryFactory (which was ported already
// in this repo, see raw-port/src/render/HGColorConformLUTEntryFactory.ts).
// The class is a POLYMORPHIC FACTORY — a stateless vtable-only object.
// Neither dtor writes anything; createLUTEntry reads/writes NO instance
// fields; the entire object body is just the C++ vptr in the first 8 bytes.
//
//   struct HGColorGammaLUTEntryFactory {
//     const void* __vptr;      // +0x00
//   };                         // sizeof = 8 (trivial-body base class)
//
// The class extends the HG-cache "LUTEntryFactory" ABI (a virtual method
// `createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)` returning a fresh
// cache-entry object). The concrete override here — like the ConformLUT
// factory — builds an `HGApplyNDLUTEntry`. The distinction between the
// two factories is not in the object they build (both build
// HGApplyNDLUTEntry with the same ctor signature) but in the LUTInfo
// that will be passed in at each call site — a ColorGamma LUTInfo vs.
// a ColorConform LUTInfo — configured by whichever registry-side code
// selects which factory to invoke.
//
// ---------------------------------------------------------------------------
// D1 in-place destructor — HGColorGammaLUTEntryFactory::~HGColorGammaLUTEntryFactory
// @0x0fb200
// ---------------------------------------------------------------------------
//     pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
// A trivial no-op prologue+epilogue (see D1.s). The class holds no owned
// resources beyond the vptr, so the D1 destructor does nothing. No base-
// class destructor is called (no `callq` in the body) — the parent
// LUTEntryFactory dtor is empty in this binary too.
//
// ---------------------------------------------------------------------------
// D0 deleting destructor — HGColorGammaLUTEntryFactory::~HGColorGammaLUTEntryFactory
// @0x0fce00
// ---------------------------------------------------------------------------
//     pushq %rbp / movq %rsp,%rbp / popq %rbp
//     jmp   0x3c4fa0   ## symbol stub for: __ZdlPv   (operator delete(void*))
// The D0 (deleting) variant tail-calls `operator delete(this)` without doing
// any additional cleanup — the D1 body would be a no-op. Standard Itanium
// D0/D1 split for a trivial-body dtor.
//
// ---------------------------------------------------------------------------
// createLUTEntry — HGColorGammaLUTEntryFactory::createLUTEntry(
//                    HGLUTCache::LUTInfo*, HGRenderer*)
// @0x0fce10
// ---------------------------------------------------------------------------
// Direct transcription of the x86_64 body:
//
//     movq %rdx, %r14                    ; save arg2 (HGRenderer*)      @0x0fce1a
//     movq %rsi, %r15                    ; save arg1 (LUTInfo*)         @0x0fce1d
//     movl $0x28, %edi                   ; size = 0x28 = 40 bytes       @0x0fce20
//     callq __Znwm                       ; operator new(size_t)         @0x0fce25 -> 0x3c4fb2
//     movq %rax, %rbx                    ; rbx = raw storage            @0x0fce2a
//     movq %rax, %rdi                    ; this = new object            @0x0fce2d
//     movq %r15, %rsi                    ; arg1 = LUTInfo*              @0x0fce30
//     movq %r14, %rdx                    ; arg2 = HGRenderer*           @0x0fce33
//     callq HGApplyNDLUTEntry::HGApplyNDLUTEntry(LUTInfo*, HGRenderer*) @0x0fce36
//         ; direct (non-stub) call to __ZN17HGApplyNDLUTEntryC1EP...
//     movq %rbx, %rax                    ; return the new object        @0x0fce3b
//     ... popq / retq                                                   @0x0fce3e-@0x0fce48
//
// Cleanup landing pad (thrown from the ctor):
//     movq %rax, %r14                    ; save exception object        @0x0fce49
//     movq %rbx, %rdi                    ; rdi = raw storage            @0x0fce4c
//     callq __ZdlPv                      ; operator delete(void*)       @0x0fce4f -> 0x3c4fa0
//     movq %r14, %rdi                    ; rdi = exception              @0x0fce54
//     callq __Unwind_Resume              ; rethrow                      @0x0fce57 -> 0x3c4e02
//
// The "0x28 sizeof" here is the size of the CREATED object
// (HGApplyNDLUTEntry, 40 bytes), NOT of the factory itself. The
// `new(nothrow=false)` allocation is paired with a landing-pad
// `operator delete` in case the ctor throws — the classic Itanium-ABI
// `new T(args)` lowering.
//
// ---------------------------------------------------------------------------
// Callees / stubs (from otool inline stub annotations + direct-call symbol):
//   0x3c4fb2  __Znwm                = ::operator new(size_t)         (throwing)
//   0x3c4fa0  __ZdlPv               = ::operator delete(void*)
//   0x3c4e02  __Unwind_Resume       = libunwind rethrow
//   direct    HGApplyNDLUTEntry::HGApplyNDLUTEntry(LUTInfo*, HGRenderer*)
//             — reused from the twin factory
//             (raw-port/src/render/HGColorConformLUTEntryFactory.ts)
//             where it is already declared as a throwing frontier stub.
// ---------------------------------------------------------------------------
//
// This class is a stateless polymorphic factory — it holds no arithmetic.
// There is no pure-math oracle to bind, so raw-port/army/gate/oracle_map.json
// is NOT extended for this file.
//
// @class HGColorGammaLUTEntryFactory (Helium)

// Reuse the frontier types and ctor stub already declared for the twin
// factory (per PORTING_SPEC: "reuse existing ports — import, do not
// re-stub"). Both factories build HGApplyNDLUTEntry with the same
// signature (LUTInfo*, HGRenderer*).
import {
  HGApplyNDLUTEntry,
  HGApplyNDLUTEntry_ctor,
  HGLUTCache_LUTInfo,
  HGRenderer,
} from "./HGColorConformLUTEntryFactory";

/**
 * `HGColorGammaLUTEntryFactory` — a polymorphic factory for color-gamma
 * LUT cache entries. The concrete C++ class holds no instance state beyond
 * its C++ vptr; every instance is behaviourally identical. Layout and
 * behaviour are structurally identical to HGColorConformLUTEntryFactory
 * except at the vtable/registration boundary (which selects this factory
 * for color-gamma LUTInfo keys rather than color-conform ones).
 *
 * @source Helium
 * @classAddr n/a (no ctor exported by name)
 */
export class HGColorGammaLUTEntryFactory {
  /**
   * D1 in-place destructor — trivial. Faithful transcription of the
   * pushq/popq/retq body @0x0fb200 (D1.s); no members, no parent-dtor
   * call.
   *
   * @addr 0x0fb200 (Helium, __ZN27HGColorGammaLUTEntryFactoryD1Ev)
   */
  destroyInPlace(): void {
    // no-op: matches the empty prologue+epilogue at @0x0fb200.
  }

  /**
   * D0 deleting destructor — tail-calls `operator delete(this)`. In TS/JS
   * there is no manual `operator delete`; the equivalent runtime behaviour
   * is to drop the reference and let GC reclaim it. We call
   * `destroyInPlace()` (a no-op, matching the trivial D1 body) for
   * symmetry with the C++ ABI.
   *
   * @addr 0x0fce00 (Helium, __ZN27HGColorGammaLUTEntryFactoryD0Ev)
   */
  destroyAndDelete(): void {
    this.destroyInPlace();
    // `jmp __ZdlPv` @0x0fce05 -> 0x3c4fa0: `operator delete(void*)` —
    // a no-op in a GC'd host language. Kept as a documented boundary,
    // not simulated.
  }

  /**
   * `createLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)` — allocate a fresh
   * `HGApplyNDLUTEntry` (size 0x28 = 40 bytes) and construct it in place
   * from the given cache key and renderer.
   *
   * Faithful transcription of the body @0x0fce10:
   *   1. `operator new(0x28)` @0x0fce25 (throws on OOM).
   *   2. Call HGApplyNDLUTEntry ctor @0x0fce36 with (info, renderer).
   *   3. Return the raw pointer @0x0fce3b.
   *   4. On ctor throw, landing pad @0x0fce49-@0x0fce57 runs
   *      `operator delete(raw)` and rethrows via __Unwind_Resume —
   *      modelled here by letting the throw propagate (no leaked
   *      storage under GC; nothing to `operator delete`).
   *
   * @addr 0x0fce10 (Helium,
   *   __ZN27HGColorGammaLUTEntryFactory14createLUTEntryEPN10HGLUTCache7LUTInfoEP10HGRenderer)
   */
  createLUTEntry(
    info: HGLUTCache_LUTInfo,
    renderer: HGRenderer,
  ): HGApplyNDLUTEntry {
    // @0x0fce20/@0x0fce25: `movl $0x28,%edi ; callq __Znwm`.
    // `operator new(size_t)` = allocate 40 bytes of raw storage for
    // HGApplyNDLUTEntry. In TS we materialise the object as an opaque
    // handle; the actual byte layout is HGApplyNDLUTEntry's concern.
    const raw = {} as HGApplyNDLUTEntry;

    // @0x0fce36: `callq HGApplyNDLUTEntry::HGApplyNDLUTEntry(info, renderer)`.
    // The frontier stub raises so the port stays loud until the ctor is
    // ported. If it does raise, execution unwinds directly out of this
    // function — mirroring the __Unwind_Resume landing pad @0x0fce57,
    // just without the manual `operator delete(raw)` (GC handles it).
    HGApplyNDLUTEntry_ctor(raw, info, renderer);

    // @0x0fce3b: `movq %rbx,%rax ; retq` — return the new object.
    return raw;
  }
}
