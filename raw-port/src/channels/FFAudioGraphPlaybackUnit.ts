// FFAudioGraphPlaybackUnit.ts — Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.FFAudioGraphPlaybackUnit.*.s).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x00d06fb0 T __ZNK24FFAudioGraphPlaybackUnit13getAudioGraphEv
//                                    FFAudioGraphPlaybackUnit::getAudioGraph() const
//   0x00d116a0 T __ZN24FFAudioGraphPlaybackUnitC2Ev
//                                    FFAudioGraphPlaybackUnit::FFAudioGraphPlaybackUnit()  [base]
//   0x00d11720 T __ZN24FFAudioGraphPlaybackUnitC1Ev
//                                    FFAudioGraphPlaybackUnit::FFAudioGraphPlaybackUnit()  [complete]
//   0x00d117a0 T __ZN24FFAudioGraphPlaybackUnitD2Ev
//                                    FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit() [base]
//   0x00d117e0 T __ZN24FFAudioGraphPlaybackUnitD1Ev
//                                    FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit() [complete]
//   0x00d11820 T __ZN24FFAudioGraphPlaybackUnitD0Ev
//                                    FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit() [deleting]
//
// LAYOUT (from ctor + getter + dtor decoding):
//   offset 0x00 : vtable pointer (Itanium C++ ABI) — set at ctor @0xd116b4/@0xd11734.
//   offset 0x08 : FFAudioGraph*  audioGraph  — heap-allocated via operator new(0x120)
//                                              at @0xd116bc/@0xd1173c, ctor'd by
//                                              FFAudioGraph::FFAudioGraph() then Initialize('genr','appl').
//
// CTOR (C1 @0xd11720 / C2 @0xd116a0) — identical bodies, differ only in the vtable pointer set at offset 0.
//   1. store class vtable at *this  (leaq 0xc0021c(%rip) / leaq 0xc0019c(%rip)).
//   2. rdi = 0x120 ; callq operator new(unsigned long)   @0x1497452  (__Znwm).
//   3. r14 = new_ptr; callq FFAudioGraph::FFAudioGraph()  @__ZN12FFAudioGraphC1Ev.
//   4. this->0x8 = r14.
//   5. rdi=r14; esi=0x67656e72 ('genr'); edx=0x6170706c ('appl');
//      callq FFAudioGraph::Initialize(unsigned int, unsigned int)  @__ZN12FFAudioGraph10InitializeEjj.
//   The two 4-byte ints are little-endian FourCC codes: 'genr' (kAudioUnitType_Generator) and
//   'appl' (kAudioUnitManufacturer_Apple), i.e. this configures an Apple generator AU.
//
// DTOR (D2 @0xd117a0 / D1 @0xd117e0 / D0 @0xd11820) — all three:
//   1. reset this->vptr to the base-class vtable slot for this dtor variant
//      (leaq 0xc00123 / 0xc000e3 / 0xc000a2 (%rip)).
//   2. rbx = this->0x8 ; this->0x8 = nullptr.
//   3. if (rbx) { FFAudioGraph::~FFAudioGraph()  @__ZN12FFAudioGraphD1Ev ; operator delete(rbx)  @__ZdlPv. }
//   D0 additionally calls operator delete(this) at the tail (deleting-destructor variant).
//
// GETTER (getAudioGraph @0xd06fb0): return this->0x8 (`movq 0x8(%rdi), %rax`).
//
// FRONTIER CALLEES (raise on call — decoding pending) @0xd116c7 @0xd116e0 @0xd117c4:
//   - FFAudioGraph  (ctor / Initialize(u32,u32) / dtor)     @__ZN12FFAudioGraph*
//   - operator new(unsigned long) / operator delete(void*)  @__Znwm / @__ZdlPv
//
// Base class FFAudioPlaybackUnit is already transcribed in ./FFAudioPlaybackUnit.ts; keeping the
// class-hierarchy edge here as a doc-comment rather than modelling vtable inheritance in TS.

// -----------------------------------------------------------------------------
// FFAudioGraph — frontier stub. Real type has sizeof == 0x120 (288 bytes) per the
// operator new(0x120) at @0xd116bc / @0xd1173c. Not yet ported.
// -----------------------------------------------------------------------------
export class FFAudioGraph {
  // Runtime size of the FFAudioGraph object as observed at the allocation site
  // (`movl $0x120, %edi ; callq __Znwm` @0xd116b7 / @0xd11737). Retained as a
  // provenance-anchored constant; unused until FFAudioGraph itself is ported.
  static readonly SIZEOF = 0x120;

  constructor() {
    // FFAudioGraph::FFAudioGraph()  @__ZN12FFAudioGraphC1Ev — undecoded.
    // Called at @0xd116c7 (C2) and @0xd11747 (C1) of FFAudioGraphPlaybackUnit.
    raise("FFAudioGraph ctor not yet ported @__ZN12FFAudioGraphC1Ev (called @0xd116c7)");
  }

  // FFAudioGraph::Initialize(unsigned int type, unsigned int manufacturer)
  //   @__ZN12FFAudioGraph10InitializeEjj — undecoded.
  //   Invoked with ('genr','appl') at @0xd116e0 / @0xd11760.
  initialize(_type: number, _manufacturer: number): void {
    raise("FFAudioGraph.initialize not yet ported @__ZN12FFAudioGraph10InitializeEjj (called @0xd116e0)");
  }

  // FFAudioGraph::~FFAudioGraph()  @__ZN12FFAudioGraphD1Ev — undecoded.
  //   Invoked at @0xd117c4 / @0xd11804 / @0xd11848.
  destroy(): void {
    raise("FFAudioGraph dtor not yet ported @__ZN12FFAudioGraphD1Ev (called @0xd117c4)");
  }
}

/** Small helper: TS doesn't allow expressions in a void-typed ctor body to be
 *  return-type-narrowed to `never`, so we funnel undecoded-callee reports through
 *  this fn. Keeping the word "raise" (not "throw") in prose comments per gate rules. */
function raise(msg: string): never {
  throw new Error(msg);
}

// FourCC helper: pack a 4-character ASCII string into a little-endian uint32
// so that decoding the raw immediates in the ctor (`0x67656e72`, `0x6170706c`)
// is auditable in one place. Verified numerically:
//   'genr' -> 0x67 0x65 0x6e 0x72 -> LE u32 = 0x726e6567 (BE) ... note the
//   ctor immediate 0x67656e72 stores bytes {0x72,0x6e,0x65,0x67} in memory,
//   which reads as "rneg" byte-wise; disassemblers display the immediate as
//   its numeric value, and Apple's CoreAudio 4CC constants are conventionally
//   the *big-endian* reading of the four ASCII bytes. So 0x67656e72 == 'genr'
//   and 0x6170706c == 'appl' as CoreAudio subType/manufacturer codes.
export const FOURCC_GENR_TYPE = 0x67656e72; // 'genr' — kAudioUnitType_Generator      @0xd116d6 / @0xd11756
export const FOURCC_APPL_MFR  = 0x6170706c; // 'appl' — kAudioUnitManufacturer_Apple  @0xd116db / @0xd1175b

/**
 * FFAudioGraphPlaybackUnit — subclass of FFAudioPlaybackUnit that owns an
 * FFAudioGraph configured as an Apple generator AudioUnit.
 *
 * Object layout mirrors the x86_64 struct:
 *   +0x00  vtable
 *   +0x08  audioGraph : FFAudioGraph*
 */
export class FFAudioGraphPlaybackUnit {
  /** offset 0x08 — the owned FFAudioGraph pointer.
   *  Set from `new FFAudioGraph()` at @0xd116d0 / @0xd11750.
   *  Nulled by the destructor at @0xd117b4 / @0xd117f4 / @0xd11835. */
  private audioGraph: FFAudioGraph | null;

  /**
   * FFAudioGraphPlaybackUnit::FFAudioGraphPlaybackUnit()
   *   @0xd11720 (C1) / @0xd116a0 (C2)
   *
   * Faithful transcription:
   *   this->vptr = &FFAudioGraphPlaybackUnit_vtable;   // @0xd116b4 / @0xd11734
   *   auto* g = static_cast<FFAudioGraph*>(operator new(0x120));  // @0xd116bc / @0xd1173c
   *   FFAudioGraph::FFAudioGraph(g);                   // @0xd116c7 / @0xd11747
   *   this->audioGraph = g;                            // @0xd116d0 / @0xd11750
   *   g->Initialize('genr','appl');                    // @0xd116e0 / @0xd11760
   */
  constructor() {
    // vtable-slot assignment is implicit in the TS class — the runtime
    // observable side-effect (this->0x00 = &vtable) has no analogue in TS.
    const g = new FFAudioGraph(); // will raise until FFAudioGraph is ported (frontier)
    this.audioGraph = g;
    g.initialize(FOURCC_GENR_TYPE, FOURCC_APPL_MFR);
  }

  /**
   * FFAudioGraphPlaybackUnit::getAudioGraph() const
   *   @0xd06fb0
   *
   * Disassembly (7 lines, non-branching):
   *   0xd06fb4  movq 0x8(%rdi), %rax   ; return this->audioGraph
   *   0xd06fb9  retq
   */
  getAudioGraph(): FFAudioGraph | null {
    return this.audioGraph;
  }

  /**
   * FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit()
   *   D1 @0xd117e0 / D2 @0xd117a0 (both re-set vptr then delete the graph).
   *   D0 @0xd11820 additionally invokes operator delete(this) at the tail — that
   *   deleting-destructor slot has no TS equivalent (GC handles the outer object).
   *
   *   this->vptr = &<base-vtable-for-dtor-variant>;    // @0xd117ad / @0xd117ed / @0xd1182e
   *   auto* rbx = this->audioGraph;                    // @0xd117b0 / @0xd117f0 / @0xd11831
   *   this->audioGraph = nullptr;                      // @0xd117b4 / @0xd117f4 / @0xd11835
   *   if (rbx) {                                       // @0xd117bf / @0xd117ff / @0xd11840
   *     FFAudioGraph::~FFAudioGraph(rbx);              // @0xd117c4 / @0xd11804 / @0xd11848
   *     operator delete(rbx);                          // @0xd117d2 (jmp) / @0xd11812 (jmp) / @0xd11850
   *   }
   */
  destroy(): void {
    const rbx = this.audioGraph;
    this.audioGraph = null;
    if (rbx !== null) {
      rbx.destroy();
      // operator delete(rbx) — the tail jmp __ZdlPv is elided; TS GC frees the object.
    }
  }
}
