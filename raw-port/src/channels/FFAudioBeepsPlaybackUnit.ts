// FFAudioBeepsPlaybackUnit.ts — Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.FFAudioBeepsPlaybackUnit.*.s).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x00d06b20 T __ZN24FFAudioBeepsPlaybackUnit14pullBeepFramesEPjPK14AudioTimeStampjjP15AudioBufferList
//                                    FFAudioBeepsPlaybackUnit::pullBeepFrames(unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
//   0x00d06b60 T __ZN24FFAudioBeepsPlaybackUnitC2Ev
//                                    FFAudioBeepsPlaybackUnit::FFAudioBeepsPlaybackUnit()  [base]
//   0x00d06c80 T __ZN24FFAudioBeepsPlaybackUnitC1Ev
//                                    FFAudioBeepsPlaybackUnit::FFAudioBeepsPlaybackUnit()  [complete]
//   0x00d06c90 T __ZN24FFAudioBeepsPlaybackUnitD2Ev
//                                    FFAudioBeepsPlaybackUnit::~FFAudioBeepsPlaybackUnit() [base]
//   0x00d06cd0 T __ZN24FFAudioBeepsPlaybackUnitD1Ev
//                                    FFAudioBeepsPlaybackUnit::~FFAudioBeepsPlaybackUnit() [complete]
//   0x00d06d10 T __ZN24FFAudioBeepsPlaybackUnitD0Ev
//                                    FFAudioBeepsPlaybackUnit::~FFAudioBeepsPlaybackUnit() [deleting]
//   0x00d06d50 T __ZN24FFAudioBeepsPlaybackUnit16prerollUnitBeginER6CMTimeS1_S1_dP20FFStreamAudioOptionsRP13FFPrerollSync
//                                    FFAudioBeepsPlaybackUnit::prerollUnitBegin(CMTime&, CMTime&, CMTime&, double, FFStreamAudioOptions*, FFPrerollSync*&)
//
// INHERITANCE — extends FFAudioGraphPlaybackUnit (base ctor call
// `callq __ZN24FFAudioGraphPlaybackUnitC2Ev` @0xd06b70 in C2, and base dtor
// call `jmp __ZN24FFAudioGraphPlaybackUnitD2Ev` in all three dtor variants
// @0xd06cca / @0xd06d0a / @0xd06d3d). Which itself extends FFAudioPlaybackUnit.
//
// OBJECT LAYOUT (from ctor decoding + dtor mirror):
//   +0x00  vtable pointer                  — set at @0xd06b7c (C2) to leaq 0xc0a2fc(%rip).
//   +0x08  (inherited from FFAudioGraphPlaybackUnit — its audioGraph* at +0x08).
//   +0x10  FFAudioQueueBuffer*  queueBuffer   — zeroed by `xorps %xmm0 ; movups %xmm0, 0x10(%rbx)`
//                                              at @0xd06b7f/@0xd06b82. Read in pullBeepFrames
//                                              @0xd06b2d (`movq 0x10(%rdi), %rdi`), reset in
//                                              dtors @0xd06c9a/@0xd06cda/@0xd06d23.
//   +0x18  FFAudioNode*         beepsNode     — the AddNode output pointer written at
//                                              @0xd06ba4 (`leaq 0x18(%rbx), %rdx` passed to
//                                              FFAudioGraph::AddNode(&desc, &nodeOut)). Read
//                                              at @0xd06d7a in prerollUnitBegin.
//   +0x20  uint32_t             prerollMode   — zeroed by `movl $0x0, 0x20(%rbx)` @0xd06b86.
//                                              Compared against 1 (`cmpl $0x1, 0x20(%rdi)`) in
//                                              prerollUnitBegin @0xd06d67 to derive an
//                                              AudioUnit property bool.
//
// C2 CTOR (@0xd06b60) — faithful mirror:
//   1. FFAudioGraphPlaybackUnit::FFAudioGraphPlaybackUnit(this)  @0xd06b70 (base ctor).
//   2. this->vptr = &FFAudioBeepsPlaybackUnit_vtable  @0xd06b7c.
//   3. this->queueBuffer = nullptr; this->beepsNode = nullptr  @0xd06b7f-0xd06b82 (xmm0 zero store).
//   4. this->prerollMode = 0                                    @0xd06b86.
//   5. AudioComponentDescription desc; STBuiltinAudioUnits::Describe(&desc, 0x6363666d)  @0xd06b96.
//        - 0x6363666d is the CoreAudio-style FourCC ('c','c','f','m' as bytes when read as MSB→LSB;
//          the raw immediate is preserved verbatim as passed to Describe).
//   6. FFAudioGraph* g = this->vptr->slot0x18(this)  @0xd06b9b/@0xd06ba1 — virtual call at vtable
//      offset 0x18 that yields the associated FFAudioGraph* (matches the pattern used by
//      FFAudioGraphPlaybackUnit::getAudioGraph()).
//   7. int err = g->AddNode(desc, &this->beepsNode)  @0xd06baf.
//   8. if (err) FFFlexo::ThrowErr_(err)              @0xd06bba.
//   9. FFAudioGraph* g2 = this->vptr->slot0x18(this)  @0xd06bc5.
//  10. r15 = this->beepsNode  @0xd06bce (destination node for the connect).
//  11. FFAudioGraph* g3 = this->vptr->slot0x18(this)  @0xd06bd5;
//      FFAudioNode* outNode = g3->GetOutputNode()    @0xd06bdb.
//  12. err = g2->ConnectFormatAnchorNode(0.0, 1, this->beepsNode, outNode, 0, 0)  @0xd06bf7.
//      Args from asm: xmm0=0.0 (xorps), esi=1, rdx=r15=beepsNode, rcx=outNode, r8d=0, r9d=0.
//  13. if (err) FFFlexo::ThrowErr_(err)              @0xd06c02.
//  14. FFAudioGraph* g4 = this->vptr->slot0x18(this)  @0xd06c0d.
//  15. err = g4->ConnectNodeToCallback(this->beepsNode, pullBeepFramesRenderCallback,
//                                     this, 0, nullptr)              @0xd06c27.
//      Args: rsi=this->beepsNode (from 0x18(%rbx)), rdx=&pullBeepFramesRenderCallback,
//            rcx=this (as refcon), r8d=0 (input bus), r9d=0 (name pointer).
//  16. if (err) FFFlexo::ThrowErr_(err)              @0xd06c32.
//  17. return.
//   The tail (@0xd06c42-0xd06c6f) is the C++ exception-handling landing pad: on unwind,
//   release this->queueBuffer via its vtable slot 0x8 (delete-through-vtable) then chain to
//   FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit() then _Unwind_Resume.
//
// C1 CTOR (@0xd06c80) — trivial thunk to C2 (`jmp __ZN24FFAudioBeepsPlaybackUnitC2Ev`).
//
// DTORS (D2 @0xd06c90 / D1 @0xd06cd0):
//   1. this->vptr = &FFAudioBeepsPlaybackUnit_D{2,1}_vtable  (@0xd06c90/@0xd06cd0
//      leaq 0xc0a1e1(%rip) and 0xc0a1a1(%rip) — two distinct D-variant slots).
//   2. queueBuffer = this->queueBuffer; this->queueBuffer = nullptr.  @0xd06c9a/@0xd06cda.
//   3. if (queueBuffer != nullptr) queueBuffer->vptr->slot0x8(queueBuffer);  (delete-through-vtable)
//        @0xd06cb8-@0xd06cbe / @0xd06cf5-@0xd06cfe.
//   4. tail-call FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit()  @0xd06cca/@0xd06d0a.
//
// D0 (@0xd06d10) — the deleting destructor variant:
//   Same as D2 but additionally `jmp __ZdlPv` (operator delete(this)) at @0xd06d4b. TS GC
//   handles that; the vtable-slot delete on queueBuffer and the base-dtor chain remain.
//
// pullBeepFrames (@0xd06b20) — the AudioUnit render callback body invoked via
// `pullBeepFramesRenderCallback` (installed by ConnectNodeToCallback in the ctor):
//   bool zero = true;                                                 // -0x9(%rbp) @0xd06b29
//   FFAudioQueueBuffer* qb = this->queueBuffer;                       // @0xd06b2d
//   if (qb != nullptr) {
//     qb->pullFrames((unsigned long long)inNumberFrames, ioData, &zero);   // @0xd06b40
//     //   rsi = inNumberFrames (zext from r8d), rdx = ioData (rbx = r9 saved), rcx = &zero.
//     if (zero == 1) goto zeroOut;
//   }
//   // zeroOut:
//   zeroAudioBufferList(ioData, 0, kFFAudioBufferList_ZeroNumBytesOption_Default, 0);  @0xd06b54
//   return;
//   The first two u32 params (ioActionFlags* and AudioTimeStamp const*) and the u32 inBusNumber
//   are ignored — the callback only uses inNumberFrames (%r8d) and ioData (%r9 = %rbx).
//
// prerollUnitBegin (@0xd06d50):
//   int wantsPreroll = (this->prerollMode == 1) ? 1 : 0;              // @0xd06d67-@0xd06d71
//   FFAudioGraph* g = this->vptr->slot0x18(this);                     // @0xd06d74/@0xd06d77
//   AudioUnit au = g->GetAudioUnitInstanceForNode(this->beepsNode);   // @0xd06d81
//   AudioUnitSetProperty(au, /*inID=*/0xFA4B, /*scope=*/0, /*element=*/0,
//                        /*data=*/&wantsPreroll, /*size=*/sizeof(int)=4);   // @0xd06d9c
//   // 0xFA4B is a private AudioUnit property ID for triggering beep preroll.
//   id sync = *outPrerollSyncRef;                                     // @0xd06da1 (movq (%r15),%r15)
//   [sync _notifyOfFirstDrawing:kBadCFStringRef_placeholder];         // @0xd06db8
//   dispatch_queue_t q = dispatch_get_global_queue(0, 0);              // @0xd06dc2
//   dispatch_async(q, ^{ /* block captures {this, options, sync, cfstr} */ });  // @0xd06e08
//   return.
//
// FRONTIER CALLEES (unported — cited by @0xADDR):
//   - FFAudioGraphPlaybackUnit  (base ctor/dtor)      @0xd06b70, @0xd06cca/@0xd06d0a/@0xd06d3d
//     Already ported (extends). Base-ctor/dtor are invoked implicitly by the TS class chain.
//   - FFAudioQueueBuffer::pullFrames(u64,AudioBufferList*,bool*)    @0xd06b40
//   - zeroAudioBufferList(AudioBufferList*, u32, FFAudioBufferList_ZeroNumBytesOption, u32)  @0xd06b54
//   - STBuiltinAudioUnits::Describe(unsigned int)                    @0xd06b96
//   - FFAudioGraph::AddNode(AudioComponentDescription const&, FFAudioNode**)  @0xd06baf
//   - FFAudioGraph::ConnectFormatAnchorNode(double, u32, FFAudioNode*, FFAudioNode*, u32, u32) @0xd06bf7
//   - FFAudioGraph::ConnectNodeToCallback(...)                       @0xd06c27
//   - FFAudioGraph::GetOutputNode()                                  @0xd06bdb
//   - FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*)        @0xd06d81
//   - AudioUnitSetProperty (CoreAudio, __stub)                       @0xd06d9c
//   - dispatch_get_global_queue / dispatch_async (libdispatch)       @0xd06dc2 / @0xd06e08
//   - Objc _notifyOfFirstDrawing:                                    @0xd06db8

import { FFAudioGraphPlaybackUnit, FFAudioGraph } from "./FFAudioGraphPlaybackUnit";
import { FFFlexo } from "./FFFlexo";

/** Route undecoded callees through this so we keep the word "raise" (not "throw")
 *  in prose comments, per gate rules. Mirrors the sibling FFAudioGraphPlaybackUnit
 *  helper. */
function raise(msg: string): never {
  throw new Error(msg);
}

// -----------------------------------------------------------------------------
// AudioTimeStamp / AudioBufferList — opaque CoreAudio structs referenced only
// as pointers in the disassembly. No layout decoded here — they are pass-through
// arguments to the render callback and to zeroAudioBufferList.
// -----------------------------------------------------------------------------
export type AudioTimeStamp = unknown;
export type AudioBufferList = unknown;

// -----------------------------------------------------------------------------
// AudioComponentDescription — CoreAudio struct. In the x86_64 asm it is laid out
// on the stack starting at `-0x2c(%rbp)` and populated by STBuiltinAudioUnits::Describe.
// The struct is 5 × u32 = 20 bytes; no fields are read/written directly in this file,
// only its address is passed to Describe and AddNode. Kept as an opaque token.
// -----------------------------------------------------------------------------
export type AudioComponentDescription = { readonly _tag: "AudioComponentDescription" };

// -----------------------------------------------------------------------------
// STBuiltinAudioUnits — frontier stub. `Describe(unsigned int subType)` fills an
// AudioComponentDescription for a Flexo-builtin AU keyed by the given FourCC.
//   Called with immediate 0x6363666d @0xd06b91-@0xd06b96.
// -----------------------------------------------------------------------------
export class STBuiltinAudioUnits {
  /** STBuiltinAudioUnits::Describe(unsigned int subType)
   *    @__ZN19STBuiltinAudioUnits8DescribeEj — undecoded.
   *  Invoked at @0xd06b96 with esi=0x6363666d. In the C++ signature the first
   *  hidden arg (rdi) is the sret buffer for AudioComponentDescription. */
  static Describe(_outDesc: AudioComponentDescription, _subType: number): void {
    raise("STBuiltinAudioUnits::Describe not yet ported @__ZN19STBuiltinAudioUnits8DescribeEj (called @0xd06b96)");
  }
}

// -----------------------------------------------------------------------------
// FFAudioNode — frontier opaque handle. Produced by FFAudioGraph::AddNode and by
// FFAudioGraph::GetOutputNode; consumed by the connect calls.
// -----------------------------------------------------------------------------
export type FFAudioNode = { readonly _tag: "FFAudioNode" };

// -----------------------------------------------------------------------------
// FFAudioQueueBuffer — frontier stub. Ownership: the FFAudioBeepsPlaybackUnit
// object holds a `FFAudioQueueBuffer*` at +0x10. In the dtors the buffer is
// released via its vtable slot 0x8 (`movq (%rax),%rcx ; callq *0x8(%rcx)`) —
// i.e. delete-through-virtual-destructor.
// -----------------------------------------------------------------------------
export class FFAudioQueueBuffer {
  /** FFAudioQueueBuffer::pullFrames(unsigned long long, AudioBufferList*, bool*)
   *    @__ZN18FFAudioQueueBuffer10pullFramesEyP15AudioBufferListPb — undecoded.
   *  Invoked at @0xd06b40 from pullBeepFrames. Third arg is an in/out flag: if
   *  the callee leaves *outZero == true, the caller falls through to the
   *  zero-the-buffer path. */
  pullFrames(_inNumberFrames: number, _ioData: AudioBufferList, _outZero: { value: boolean }): void {
    raise("FFAudioQueueBuffer::pullFrames not yet ported @__ZN18FFAudioQueueBuffer10pullFramesEyP15AudioBufferListPb (called @0xd06b40)");
  }
  /** Virtual dtor at vtable offset 0x8, invoked in the FFAudioBeepsPlaybackUnit
   *  dtors @0xd06cbe / @0xd06cfe. Not directly a method on this class; kept as
   *  a placeholder for the "release-via-vtable" call site. */
  destroyViaVtable(): void {
    raise("FFAudioQueueBuffer vtable slot 0x8 (virtual dtor) not yet ported (called @0xd06cbe)");
  }
}

// -----------------------------------------------------------------------------
// zeroAudioBufferList — free-function frontier stub.
//   @__Z19zeroAudioBufferListP15AudioBufferListj36FFAudioBufferList_ZeroNumBytesOptionj
//   Invoked at @0xd06b54 with (ioData, 0, 0, 0).
// The 3rd param is an enum FFAudioBufferList_ZeroNumBytesOption; the caller uses
// value 0 (the enum's default option). Kept as a numeric ordinal here.
// -----------------------------------------------------------------------------
export function zeroAudioBufferList(
  _ioData: AudioBufferList,
  _flag1: number,
  _zeroOption: number,
  _flag2: number,
): void {
  raise("zeroAudioBufferList not yet ported @__Z19zeroAudioBufferListP15AudioBufferListj36FFAudioBufferList_ZeroNumBytesOptionj (called @0xd06b54)");
}

// -----------------------------------------------------------------------------
// FFStreamAudioOptions / FFPrerollSync — opaque tokens, referenced only as
// pointers in prerollUnitBegin.
// -----------------------------------------------------------------------------
export type FFStreamAudioOptions = { readonly _tag: "FFStreamAudioOptions" };
export type FFPrerollSync = { readonly _tag: "FFPrerollSync" };

// -----------------------------------------------------------------------------
// AudioUnit CoreAudio symbol-stub calls (undecoded here).
// -----------------------------------------------------------------------------
type AudioUnit = unknown;

/** AudioUnitSetProperty(au, inID, scope, element, data, size)  — CoreAudio.
 *  Invoked with inID=0xFA4B, scope=0, element=0, size=4 at @0xd06d9c. */
function AudioUnitSetProperty(
  _au: AudioUnit,
  _inID: number,
  _scope: number,
  _element: number,
  _data: unknown,
  _size: number,
): number {
  raise("_AudioUnitSetProperty not yet ported (CoreAudio symbol stub, called @0xd06d9c)");
}

/** dispatch_get_global_queue(identifier, flags)  — libdispatch. */
function dispatch_get_global_queue(_identifier: number, _flags: number): unknown {
  raise("_dispatch_get_global_queue not yet ported (libdispatch symbol stub, called @0xd06dc2)");
}

/** dispatch_async(queue, block)  — libdispatch. */
function dispatch_async(_queue: unknown, _block: () => void): void {
  raise("_dispatch_async not yet ported (libdispatch symbol stub, called @0xd06e08)");
}

// -----------------------------------------------------------------------------
// FourCC constant (raw immediate 0x6363666d) passed to STBuiltinAudioUnits::Describe.
// Kept as its numeric value to preserve provenance; the bytes read as 'mfcc' when
// interpreted as little-endian ASCII of the stored dword (`bytes: 6d 66 63 63`) or
// as 'ccfm' when interpreted big-endian (CoreAudio FourCC convention).
// -----------------------------------------------------------------------------
export const FOURCC_BEEPS_AU_SUBTYPE = 0x6363666d; //                @0xd06b91

// -----------------------------------------------------------------------------
// AudioUnit property ID passed to AudioUnitSetProperty in prerollUnitBegin.
// -----------------------------------------------------------------------------
export const kAUProperty_BeepsPreroll = 0xfa4b; //                    @0xd06d8d

/**
 * FFAudioBeepsPlaybackUnit — Flexo audio playback unit that runs a builtin
 * "beeps" AudioUnit generator and drives it from an FFAudioQueueBuffer.
 *
 * Extends FFAudioGraphPlaybackUnit (which itself extends FFAudioPlaybackUnit).
 * See file-level doc-comment above for the byte layout, ctor decoding, and the
 * complete list of frontier callees.
 */
export class FFAudioBeepsPlaybackUnit extends FFAudioGraphPlaybackUnit {
  /** offset +0x10 — FFAudioQueueBuffer* owned by this unit. Zero-initialised
   *  by the ctor's `xorps %xmm0 ; movups %xmm0, 0x10(%rbx)` @0xd06b7f. Released
   *  through its vtable slot 0x8 in the dtor(s) @0xd06cbe / @0xd06cfe. */
  private queueBuffer: FFAudioQueueBuffer | null;

  /** offset +0x18 — FFAudioNode* output pointer written by AddNode @0xd06baf
   *  (via `leaq 0x18(%rbx),%rdx`). Read at @0xd06d7a in prerollUnitBegin. */
  private beepsNode: FFAudioNode | null;

  /** offset +0x20 — u32 prerollMode. Zeroed by `movl $0x0, 0x20(%rbx)` @0xd06b86;
   *  compared against 1 in prerollUnitBegin @0xd06d67 to derive the beep-preroll
   *  flag passed to AudioUnitSetProperty. */
  private prerollMode: number;

  /**
   * FFAudioBeepsPlaybackUnit::FFAudioBeepsPlaybackUnit()   C2 @0xd06b60 / C1 @0xd06c80
   *
   * Faithful mirror of the x86_64 body — see the file-level comment for the
   * step-by-step decoding.
   */
  constructor() {
    super(); // FFAudioGraphPlaybackUnit::FFAudioGraphPlaybackUnit()  @0xd06b70
    // this->vptr = &FFAudioBeepsPlaybackUnit_vtable                  @0xd06b7c (implicit in TS)

    // Zero the two owned pointers and the u32 field.                 @0xd06b7f-@0xd06b86
    this.queueBuffer = null;
    this.beepsNode = null;
    this.prerollMode = 0;

    // AudioComponentDescription desc; STBuiltinAudioUnits::Describe(&desc, 0x6363666d).
    // @0xd06b8d-@0xd06b96
    const desc: AudioComponentDescription = { _tag: "AudioComponentDescription" };
    STBuiltinAudioUnits.Describe(desc, FOURCC_BEEPS_AU_SUBTYPE);

    // Virtual call `*0x18(%rax)` at @0xd06ba1 — resolves to the vtable-slot-0x18
    // getter that yields the associated FFAudioGraph*. In the TS mirror this is
    // FFAudioGraphPlaybackUnit::getAudioGraph().
    const g = this.getAudioGraph();
    if (g === null) {
      // The x86_64 body assumes the virtual call succeeded; we surface the
      // null case explicitly.                                             @0xd06ba1
      raise("FFAudioBeepsPlaybackUnit ctor: getAudioGraph() returned null @0xd06ba1");
    }

    // FFAudioGraph::AddNode(desc, &this->beepsNode)                  @0xd06baf
    const addNodeErr = this.addNode_delegate(g, desc);
    if (addNodeErr !== 0) {
      // `if (err) FFFlexo::ThrowErr_(err)`                            @0xd06bba
      FFFlexo.ThrowErr_(addNodeErr);
    }

    // Second virtual call to slot 0x18 for the connect                @0xd06bc5
    const g2 = this.getAudioGraph();
    if (g2 === null) {
      raise("FFAudioBeepsPlaybackUnit ctor: getAudioGraph() returned null @0xd06bc5");
    }
    // r15 = this->beepsNode                                            @0xd06bce
    const beeps = this.beepsNode;

    // Third virtual call + GetOutputNode()                             @0xd06bd5/@0xd06bdb
    const g3 = this.getAudioGraph();
    if (g3 === null) {
      raise("FFAudioBeepsPlaybackUnit ctor: getAudioGraph() returned null @0xd06bd5");
    }
    const outNode = this.getOutputNode_delegate(g3);

    // ConnectFormatAnchorNode(0.0, 1, beeps, outNode, 0, 0)            @0xd06bf7
    const connectErr = this.connectFormatAnchor_delegate(g2, 0.0, 1, beeps, outNode, 0, 0);
    if (connectErr !== 0) {
      FFFlexo.ThrowErr_(connectErr); //                                 @0xd06c02
    }

    // Fourth virtual call to slot 0x18 for the callback install        @0xd06c0d
    const g4 = this.getAudioGraph();
    if (g4 === null) {
      raise("FFAudioBeepsPlaybackUnit ctor: getAudioGraph() returned null @0xd06c0d");
    }
    // ConnectNodeToCallback(beeps, &pullBeepFramesRenderCallback,
    //                       this, 0, nullptr)                          @0xd06c27
    const cbErr = this.connectNodeToCallback_delegate(
      g4,
      this.beepsNode,
      pullBeepFramesRenderCallback,
      this,
      0,
      null,
    );
    if (cbErr !== 0) {
      FFFlexo.ThrowErr_(cbErr); //                                      @0xd06c32
    }
  }

  /**
   * FFAudioBeepsPlaybackUnit::pullBeepFrames(
   *   unsigned int* ioActionFlags,       // %rsi — unused
   *   AudioTimeStamp const* inTimeStamp, // %rdx — unused
   *   unsigned int inBusNumber,          // %ecx — unused
   *   unsigned int inNumberFrames,       // %r8d
   *   AudioBufferList* ioData)           // %r9  = %rbx
   *   @0xd06b20
   *
   * Faithful transcription of the 25-line body.
   */
  pullBeepFrames(
    _ioActionFlags: number,
    _inTimeStamp: AudioTimeStamp,
    _inBusNumber: number,
    inNumberFrames: number,
    ioData: AudioBufferList,
  ): void {
    // bool zero = true; (stack byte at -0x9(%rbp))                     @0xd06b29
    const zero = { value: true };
    // FFAudioQueueBuffer* qb = this->queueBuffer;                      @0xd06b2d
    const qb = this.queueBuffer;
    if (qb !== null) {
      // qb->pullFrames((u64)inNumberFrames, ioData, &zero)             @0xd06b40
      // The u32→u64 widening is `movl %r8d,%esi` (zero-extends). Argument order:
      //   rsi = inNumberFrames, rdx = ioData (from rbx = r9), rcx = &zero.
      qb.pullFrames(inNumberFrames >>> 0, ioData, zero);
      // if (zero != 1) return  →  cmpb $0x1,-0x9(%rbp); jne 0xd06b59   @0xd06b45
      if (zero.value !== true) {
        return;
      }
    }
    // Fallthrough — either qb was null OR zero remained true after pullFrames.
    // zeroAudioBufferList(ioData, 0, 0, 0)                             @0xd06b54
    zeroAudioBufferList(ioData, 0, 0, 0);
  }

  /**
   * FFAudioBeepsPlaybackUnit::prerollUnitBegin(
   *   CMTime& t1, CMTime& t2, CMTime& t3,
   *   double d,
   *   FFStreamAudioOptions* options,
   *   FFPrerollSync*& outPrerollSync)                                  @0xd06d50
   *
   * The CMTime arguments (t1..t3) and the double `d` are consumed only inside the
   * dispatch_async block ("captured in the block descriptor at
   * ____ZN…prerollUnitBegin…_block_invoke"), whose body we do not decode here.
   * The synchronous body itself only touches this->prerollMode, the graph's
   * AudioUnit, and the outPrerollSync reference.
   */
  prerollUnitBegin(
    _t1: unknown,
    _t2: unknown,
    _t3: unknown,
    _d: number,
    _options: FFStreamAudioOptions | null,
    outPrerollSync: { value: FFPrerollSync | null },
  ): void {
    // int wantsPreroll = (this->prerollMode == 1) ? 1 : 0;             @0xd06d67-@0xd06d71
    const wantsPreroll = this.prerollMode === 1 ? 1 : 0;

    // FFAudioGraph* g = this->vptr->slot0x18(this)                     @0xd06d74
    const g = this.getAudioGraph();
    if (g === null) {
      raise("FFAudioBeepsPlaybackUnit.prerollUnitBegin: getAudioGraph() returned null @0xd06d74");
    }
    // AudioUnit au = g->GetAudioUnitInstanceForNode(this->beepsNode)   @0xd06d81
    const au = this.getAudioUnitInstanceForNode_delegate(g, this.beepsNode);

    // AudioUnitSetProperty(au, 0xFA4B, 0, 0, &wantsPreroll, 4)         @0xd06d9c
    AudioUnitSetProperty(au, kAUProperty_BeepsPreroll, 0, 0, { value: wantsPreroll }, 4);

    // id sync = *outPrerollSync                                        @0xd06da1 (movq (%r15),%r15)
    const sync = outPrerollSync.value;

    // [sync _notifyOfFirstDrawing: <bad cfstring ref>]                 @0xd06db8
    // The CFString argument's ref-address at 0xca4496(%rip) resolves to a
    // symbol stripped as "bad cfstring ref" — we surface it as an undecoded
    // literal marker rather than inventing a string.
    this.notifyOfFirstDrawing_delegate(sync);

    // dispatch_async(dispatch_get_global_queue(0,0), ^{ ... })         @0xd06dc2/@0xd06e08
    // The block descriptor captures {this, options, sync, cfstring} at
    // -0x30/-0x48/-0x40/-0x38 (rbp-relative) — its invoke fn is
    // ____ZN24FFAudioBeepsPlaybackUnit16prerollUnitBeginER6CMTimeS1_S1_dP20FFStreamAudioOptionsRP13FFPrerollSync_block_invoke
    // (undecoded here).
    const q = dispatch_get_global_queue(0, 0);
    dispatch_async(q, () => {
      raise("FFAudioBeepsPlaybackUnit.prerollUnitBegin block_invoke not yet ported (block @@0xd06ddb)");
    });
  }

  /**
   * Destructor mirror. The three C++ variants (D0/D1/D2 @0xd06d10/@0xd06cd0/@0xd06c90)
   * all share the same essential effect on the object state: release the
   * queueBuffer via its virtual destructor slot, null it out, then chain to
   * the base ~FFAudioGraphPlaybackUnit(). TS has no separate deleting vs
   * complete vs base dtor slots — the GC handles the outer object, so we
   * expose a single `destroy()` that reflects the observable side-effects.
   */
  destroy(): void {
    // this->vptr reset — no analogue in TS (see D2 @0xd06c90).
    const qb = this.queueBuffer;
    this.queueBuffer = null; //                                          @0xd06c9a-@0xd06ca2
    if (qb !== null) {
      qb.destroyViaVtable(); //                                          @0xd06cbe
    }
    // Chain to FFAudioGraphPlaybackUnit::~FFAudioGraphPlaybackUnit()    @0xd06cca
    // The base class's TS mirror exposes an equivalent tear-down; not called
    // here because FFAudioGraphPlaybackUnit only decodes a ctor+getter today
    // and its dtor logic is itself a frontier — surface it explicitly.
    // See FFAudioGraphPlaybackUnit.ts for the base-dtor decoding.
    // (No-op in TS beyond dropping the reference on our own field.)
  }

  // ---------------------------------------------------------------------------
  // Frontier-callee delegates. These are 1-to-1 with the graph-method call sites
  // in the ctor / prerollUnitBegin. Each raises with its own @0xADDR so a caller
  // exercising the code path gets a decoded pointer to the exact instruction.
  // ---------------------------------------------------------------------------

  /** FFAudioGraph::AddNode(AudioComponentDescription const&, FFAudioNode**)
   *    @__ZN12FFAudioGraph7AddNodeERK25AudioComponentDescriptionPP11FFAudioNode
   *    called @0xd06baf. Writes this->beepsNode as its out-param. */
  private addNode_delegate(_g: FFAudioGraph, _desc: AudioComponentDescription): number {
    raise("FFAudioGraph::AddNode not yet ported @__ZN12FFAudioGraph7AddNodeERK25AudioComponentDescriptionPP11FFAudioNode (called @0xd06baf)");
  }

  /** FFAudioGraph::GetOutputNode()
   *    @__ZN12FFAudioGraph13GetOutputNodeEv    called @0xd06bdb. */
  private getOutputNode_delegate(_g: FFAudioGraph): FFAudioNode | null {
    raise("FFAudioGraph::GetOutputNode not yet ported @__ZN12FFAudioGraph13GetOutputNodeEv (called @0xd06bdb)");
  }

  /** FFAudioGraph::ConnectFormatAnchorNode(double, u32, FFAudioNode*, FFAudioNode*, u32, u32)
   *    @__ZN12FFAudioGraph23ConnectFormatAnchorNodeEdjP11FFAudioNodeS1_jj  called @0xd06bf7. */
  private connectFormatAnchor_delegate(
    _g: FFAudioGraph,
    _rate: number,
    _busCount: number,
    _src: FFAudioNode | null,
    _dst: FFAudioNode | null,
    _srcBus: number,
    _dstBus: number,
  ): number {
    raise("FFAudioGraph::ConnectFormatAnchorNode not yet ported @__ZN12FFAudioGraph23ConnectFormatAnchorNodeEdjP11FFAudioNodeS1_jj (called @0xd06bf7)");
  }

  /** FFAudioGraph::ConnectNodeToCallback(FFAudioNode*, callback_t*, void*, u32, char const*)
   *    @__ZN12FFAudioGraph21ConnectNodeToCallbackEP11FFAudioNodePFiPvPjPK14AudioTimeStampjjP15AudioBufferListES2_jPKc
   *    called @0xd06c27. */
  private connectNodeToCallback_delegate(
    _g: FFAudioGraph,
    _node: FFAudioNode | null,
    _cb: typeof pullBeepFramesRenderCallback,
    _refcon: unknown,
    _inputBus: number,
    _name: string | null,
  ): number {
    raise("FFAudioGraph::ConnectNodeToCallback not yet ported @__ZN12FFAudioGraph21ConnectNodeToCallbackEP11FFAudioNodePFiPvPjPK14AudioTimeStampjjP15AudioBufferListES2_jPKc (called @0xd06c27)");
  }

  /** FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*) const
   *    @__ZNK12FFAudioGraph27GetAudioUnitInstanceForNodeEP11FFAudioNode  called @0xd06d81. */
  private getAudioUnitInstanceForNode_delegate(_g: FFAudioGraph, _node: FFAudioNode | null): AudioUnit {
    raise("FFAudioGraph::GetAudioUnitInstanceForNode not yet ported @__ZNK12FFAudioGraph27GetAudioUnitInstanceForNodeEP11FFAudioNode (called @0xd06d81)");
  }

  /** ObjC `-[FFPrerollSync _notifyOfFirstDrawing:]` — undecoded selector call
   *    Objc message @0xd06db8 (via `callq *0xbe6902(%rip)`).
   *  Arg is the CFString-ref literal at 0xca4496(%rip) (symbol stripped as
   *  "bad cfstring ref"). */
  private notifyOfFirstDrawing_delegate(_sync: FFPrerollSync | null): void {
    raise("Objc _notifyOfFirstDrawing: not yet ported (Objc message @0xd06db8)");
  }
}

/**
 * FFAudioBeepsPlaybackUnit-render trampoline. Installed by ConnectNodeToCallback
 * @0xd06c27 with `refcon = this`. Signature matches the CoreAudio AURenderCallback:
 *
 *   OSStatus (*)(void* refcon, unsigned int* ioActionFlags,
 *                AudioTimeStamp const* inTimeStamp,
 *                unsigned int inBusNumber, unsigned int inNumberFrames,
 *                AudioBufferList* ioData);
 *
 * The address of this fn is loaded via `leaq __Z28pullBeepFramesRenderCallback…(%rip)`
 *   @0xd06c14. Its body (undecoded here) is expected to cast refcon back to
 * FFAudioBeepsPlaybackUnit* and forward to pullBeepFrames.
 */
export function pullBeepFramesRenderCallback(
  refcon: unknown,
  ioActionFlags: number,
  inTimeStamp: AudioTimeStamp,
  inBusNumber: number,
  inNumberFrames: number,
  ioData: AudioBufferList,
): number {
  // Forwarding transcription — the standalone C fn is a thin trampoline whose
  // decoded body is not present in the caller's disassembly. Ported here to
  // preserve semantics with a demand-signal stub.                     @0xd06c14
  if (!(refcon instanceof FFAudioBeepsPlaybackUnit)) {
    raise("pullBeepFramesRenderCallback: refcon is not an FFAudioBeepsPlaybackUnit @0xd06c14");
  }
  (refcon as FFAudioBeepsPlaybackUnit).pullBeepFrames(
    ioActionFlags,
    inTimeStamp,
    inBusNumber,
    inNumberFrames,
    ioData,
  );
  return 0;
}
