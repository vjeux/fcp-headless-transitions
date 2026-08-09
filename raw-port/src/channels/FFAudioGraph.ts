// FFAudioGraph.ts — FCP Flexo framework's audio render-graph object. This
// file ports the single leaf accessor GetMaxPullFrames, faithfully
// transcribed from the FCP Flexo binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (x86_64 slice; unadjusted VAs — the same addresses raw-port/re/disasm uses).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from GetMaxPullFrames' reads)
// -----------------------------------------------------------------------------
//   +0x08  <owner>*   ; a pointer to an object that itself holds the AudioUnit
//                       (read @0xd3be32 `movq 0x8(%rdi),%rax`)
//     within that object:
//   +0x18  AudioUnit  ; the AudioComponentInstance / AudioUnit handle
//                       (read @0xd3be36 `movq 0x18(%rax),%rdi`)
//
// GetMaxPullFrames only READS these two slots to reach the AudioUnit; it does
// not decode their wider layout, so we model +0x8 as an opaque owner holding
// an opaque `audioUnitAt18` handle. We do NOT invent the rest of either
// struct (Rule 5) — only the two fields this method actually dereferences.
//
// -----------------------------------------------------------------------------
// EXTERN BOUNDARY (OUT OF PORT SCOPE — AudioToolbox, Apple's OS runtime)
// -----------------------------------------------------------------------------
// GetMaxPullFrames tail-calls a single AudioToolbox function that is NOT part
// of the five-framework port (ProCore/ProChannel/Helium/Ozone/Flexo). Per
// PORTING_SPEC Rule 3, an out-of-scope callee is surfaced as a LOUD boundary
// stub that throws (citing the call-site @0xADDR), never a silent guess:
//   * _AudioUnitGetProperty  @0xd3be47  callq (symbol stub 0x1494614)
// It is modelled through the injectable `AudioUnitExtern` interface so a host
// that DOES have AudioToolbox (a native bridge) can plug the real behaviour
// in, while a pure-JS realm gets the loud throw. The property-request setup
// (property id 0xe, scope 0, element 0, a 4-byte inout size buffer) is the
// real, decoded work and is transcribed in full below.

/**
 * The AudioToolbox extern boundary used by FFAudioGraph::GetMaxPullFrames.
 * `AudioUnitGetProperty` lives in AudioToolbox, OUTSIDE the five in-scope FCP
 * frameworks, so it is modelled as an injectable boundary rather than ported.
 * A native host may supply a real implementation; the default
 * (`ThrowingAudioUnitExtern`) throws loudly.
 */
export interface AudioUnitExtern {
  /**
   * `OSStatus AudioUnitGetProperty(AudioUnit inUnit,
   *      AudioUnitPropertyID inID, AudioUnitScope inScope,
   *      AudioUnitElement inElement, void* outData, UInt32* ioDataSize)`
   * — AudioToolbox. Writes the requested property into `outData` (here a
   * single UInt32) and updates `*ioDataSize` with the bytes written; returns
   * an OSStatus (0 == noErr).
   * @extern _AudioUnitGetProperty (symbol stub @0x1494614), called @0xd3be47.
   */
  audioUnitGetProperty(
    inUnit: unknown,
    inID: number,
    inScope: number,
    inElement: number,
    outData: { value: number },
    ioDataSize: { value: number },
  ): number;
}

/**
 * Default extern boundary: a pure-JS realm has no AudioToolbox, so the call
 * throws loudly with its call-site address (PORTING_SPEC Rule 3 — a loud gap,
 * never a silent approximation).
 */
export class ThrowingAudioUnitExtern implements AudioUnitExtern {
  audioUnitGetProperty(
    _inUnit: unknown,
    _inID: number,
    _inScope: number,
    _inElement: number,
    _outData: { value: number },
    _ioDataSize: { value: number },
  ): number {
    throw new Error(
      '_AudioUnitGetProperty @0xd3be47 (AudioToolbox extern, out of port scope) not available in this realm',
    );
  }
}

/**
 * `kAudioUnitProperty_MaximumFramesPerSlice` = 0x0e (14). The property id
 * loaded into `%esi` @0xd3be3e (`movl $0xe,%esi`) — the maximum number of
 * frames the AudioUnit will be asked to render in a single pull.
 * @Flexo immediate 0xe @0xd3be3e.
 */
const kAudioUnitProperty_MaximumFramesPerSlice = 0x0e;

/**
 * `kAudioUnitScope_Global` = 0. The scope loaded into `%edx` @0xd3be43
 * (`xorl %edx,%edx`).
 * @Flexo immediate 0 @0xd3be43.
 */
const kAudioUnitScope_Global = 0;

/**
 * Element 0. Loaded into `%ecx` @0xd3be45 (`xorl %ecx,%ecx`).
 * @Flexo immediate 0 @0xd3be45.
 */
const kElement0 = 0;

/**
 * The property data size in bytes: 4 (a single UInt32). Stored to the stack
 * `-0x4(%rbp)` @0xd3be2b (`movl $0x4,-0x4(%rbp)`) and passed by address as
 * the inout `ioDataSize`.
 * @Flexo immediate 4 @0xd3be2b.
 */
const kMaxFramesDataSize = 4;

/**
 * A minimal opaque model of the object at FFAudioGraph+0x8 — it holds the
 * AudioUnit handle at its own +0x18. Only that one field is decoded (it's the
 * only slot GetMaxPullFrames reads); the rest is intentionally not modelled.
 */
export interface FFAudioGraphAudioUnitOwner {
  /** +0x18 within the +0x8 owner — the AudioUnit handle (read @0xd3be36). */
  audioUnitAt18: unknown;
}

/**
 * FFAudioGraph — FCP's audio render graph. Only GetMaxPullFrames is ported in
 * this file (its owning class per PORTING_SPEC's one-class-per-file rule).
 * @Flexo (Flexo.framework)
 */
export class FFAudioGraph {
  /**
   * `this+0x8` — pointer to the object that owns the AudioUnit (read
   * @0xd3be32 `movq 0x8(%rdi),%rax`). Opaque; only its +0x18 (the AudioUnit)
   * is dereferenced here.
   */
  ownerAt8: FFAudioGraphAudioUnitOwner = { audioUnitAt18: null };

  /**
   * The injected AudioToolbox boundary. Defaults to the loud-throwing stub; a
   * native host can supply a real implementation.
   */
  private readonly audio: AudioUnitExtern;

  constructor(audio: AudioUnitExtern = new ThrowingAudioUnitExtern()) {
    this.audio = audio;
  }

  /**
   * `FFAudioGraph::GetMaxPullFrames(unsigned int& out)` -> void
   *   — @Flexo 0xd3be20
   *   — __ZN12FFAudioGraph16GetMaxPullFramesERj
   *
   * Faithful line-for-line transcription of the 17-line disassembly:
   *   0xd3be20  pushq  %rbp
   *   0xd3be21  movq   %rsp, %rbp
   *   0xd3be24  subq   $0x10, %rsp                  ; 16-byte local frame
   *   0xd3be28  movq   %rsi, %r8                    ; r8 = &out (2nd arg → outData)
   *   0xd3be2b  movl   $0x4, -0x4(%rbp)             ; dataSize = 4  (a UInt32)
   *   0xd3be32  movq   0x8(%rdi), %rax              ; rax = this->ownerAt8 (+0x8)
   *   0xd3be36  movq   0x18(%rax), %rdi             ; rdi = owner->audioUnitAt18 (+0x18)
   *   0xd3be3a  leaq   -0x4(%rbp), %r9              ; r9 = &dataSize (ioDataSize)
   *   0xd3be3e  movl   $0xe, %esi                   ; esi = 0xe (MaximumFramesPerSlice)
   *   0xd3be43  xorl   %edx, %edx                   ; edx = 0 (scope = Global)
   *   0xd3be45  xorl   %ecx, %ecx                   ; ecx = 0 (element = 0)
   *   0xd3be47  callq  _AudioUnitGetProperty        ; fill *out with the UInt32
   *   0xd3be4c  addq   $0x10, %rsp
   *   0xd3be50  popq   %rbp
   *   0xd3be51  retq
   *
   * SEMANTICS: reads the AudioUnit's kAudioUnitProperty_MaximumFramesPerSlice
   * (a UInt32) into the caller's `out` reference. The 4-byte inout size buffer
   * is set up on the stack and passed by address. The AudioUnit is reached via
   * `this->ownerAt8->audioUnitAt18`. The OSStatus returned by the extern is
   * DISCARDED (the demangled signature returns void — `ERj` → `void(unsigned
   * int&)`; the disasm does not test `%eax` after the call), so we ignore it.
   *
   * REGISTER→ARG mapping (SysV AAPCS) for AudioUnitGetProperty:
   *   rdi=inUnit, esi=inID(0xe), edx=inScope(0), ecx=inElement(0),
   *   r8=outData(&out), r9=ioDataSize(&dataSize).
   *
   * DEPENDENCIES: zero in-scope callees. One OUT-OF-SCOPE AudioToolbox extern
   * (_AudioUnitGetProperty @0xd3be47) routed through the injectable boundary
   * (loud throw by default).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Flexo.__ZN12FFAudioGraph16GetMaxPullFramesERj.s (17 lines)
   *
   * @param out receives the max frames-per-slice UInt32 (an inout reference;
   *   modelled as a `{ value }` box so JS can emulate C++ `unsigned int&`).
   */
  GetMaxPullFrames(out: { value: number }): void {
    // @0xd3be2b  movl $0x4,-0x4(%rbp)  ; dataSize = 4 (bytes; a UInt32)
    const dataSize = { value: kMaxFramesDataSize };

    // @0xd3be32  movq 0x8(%rdi),%rax    ; rax = this->ownerAt8
    // @0xd3be36  movq 0x18(%rax),%rdi   ; rdi = owner->audioUnitAt18
    const audioUnit = this.ownerAt8.audioUnitAt18;

    // @0xd3be28 movq %rsi,%r8 (outData=&out); @0xd3be3a leaq -0x4(%rbp),%r9 (ioDataSize=&dataSize)
    // @0xd3be3e movl $0xe,%esi; @0xd3be43 xorl %edx,%edx; @0xd3be45 xorl %ecx,%ecx
    // @0xd3be47 callq _AudioUnitGetProperty
    //   AudioUnitGetProperty(audioUnit, 0xe, Global(0), element(0), &out, &dataSize)
    this.audio.audioUnitGetProperty(
      audioUnit,
      kAudioUnitProperty_MaximumFramesPerSlice,
      kAudioUnitScope_Global,
      kElement0,
      out,
      dataSize,
    );

    // @0xd3be4c-0xd3be51  epilogue + retq. OSStatus in %eax is discarded (void return).
  }
}
