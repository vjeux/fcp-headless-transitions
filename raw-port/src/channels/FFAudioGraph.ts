// FFAudioGraph.ts — Flexo audio-graph helpers.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice)
//
// This file ports `FFAudioGraph::GetUnitChannels(ComponentInstanceRecord*,
// unsigned int, unsigned int)` (@Flexo 0xd38770): query an AudioUnit's current
// stream format and return its channel count.
//
// -----------------------------------------------------------------------------
// FULL DISASM — FFAudioGraph::GetUnitChannels(ComponentInstanceRecord*, uint, uint)
//   raw-port/re/disasm/Flexo.__ZN12FFAudioGraph15GetUnitChannelsEP23ComponentInstanceRecordjj.s
// -----------------------------------------------------------------------------
//   0xd38770  pushq %rbp ; movq %rsp,%rbp ; subq $0x30,%rsp   ; frame + 0x30 stack
//   0xd38778  movl  %edx, %ecx                ; ecx = arg3 (element)
//   0xd3877a  movl  %esi, %edx                ; edx = arg2 (scope)
//   0xd3877c  movl  $0x28, -0x4(%rbp)         ; ioDataSize = 0x28 (40 = sizeof ASBD)
//   0xd38783  leaq  -0x30(%rbp), %r8          ; r8 = &outData (stack ASBD buffer)
//   0xd38787  leaq  -0x4(%rbp), %r9           ; r9 = &ioDataSize
//   0xd3878b  movl  $0x8, %esi                ; esi = inID = 8
//                                             ;   (kAudioUnitProperty_StreamFormat)
//   0xd38790  callq _AudioUnitGetProperty     ; OSStatus =
//                                             ;   AudioUnitGetProperty(
//                                             ;     inUnit  = rdi (the unit),
//                                             ;     inID    = 8,
//                                             ;     inScope = edx (scope),
//                                             ;     inElement = ecx (element),
//                                             ;     outData = r8 (&ASBD),
//                                             ;     ioDataSize = r9 (&size))
//   0xd38795  movl  %eax, %ecx                ; ecx = OSStatus result
//   0xd38797  xorl  %eax, %eax                ; eax = 0  (default return)
//   0xd38799  testl %ecx, %ecx                ; status == 0 ?
//   0xd3879b  jne   0xd387a0                  ;   nonzero => return 0
//   0xd3879d  movl  -0x14(%rbp), %eax         ; eax = *(u32*)(outData + 0x1c)
//                                             ;   = ASBD.mChannelsPerFrame
//                                             ;   (-0x14 = -0x30 + 0x1c)
//   0xd387a0  addq  $0x30,%rsp ; popq %rbp ; retq
//
// ABI (AudioUnitGetProperty, AudioToolbox):
//   OSStatus AudioUnitGetProperty(AudioUnit inUnit /rdi,
//     AudioUnitPropertyID inID /esi, AudioUnitScope inScope /edx,
//     AudioUnitElement inElement /ecx, void* outData /r8, UInt32* ioDataSize /r9)
//   The prologue shuffles the incoming (scope=esi, element=edx) into
//   (edx=scope, ecx=element) so they land in the inScope/inElement slots.
//
// AudioStreamBasicDescription (CoreAudioTypes) is 40 (0x28) bytes; the field
// read at +0x1c is `mChannelsPerFrame` (UInt32) — the offsets:
//   +0x00 mSampleRate (Float64), +0x08 mFormatID, +0x0c mFormatFlags,
//   +0x10 mBytesPerPacket, +0x14 mFramesPerPacket, +0x18 mBytesPerFrame,
//   +0x1c mChannelsPerFrame, +0x20 mBitsPerChannel, +0x24 mReserved.
//
// OUT-OF-SCOPE EXTERNS (modelled at the boundary, PORTING_SPEC Rule 3):
//   * _AudioUnitGetProperty (AudioToolbox)      @0xd38790 (stub 0x1494614)
//   * ComponentInstanceRecord* (Core Audio opaque AudioUnit handle) — the
//     `unit` argument; an opaque out-of-scope handle passed straight through.
//   Neither is an in-scope FCP callee. FRONTIER CALLEES: none in-scope.
//
// Dependencies: 0 in-scope, 0 indirect, 1 out-of-scope extern
// (_AudioUnitGetProperty).
// -----------------------------------------------------------------------------

/**
 * Opaque Core Audio `ComponentInstanceRecord*` (an AudioUnit handle). Passed
 * straight through to `_AudioUnitGetProperty`; FCP never dereferences it in
 * this method, so it is modelled as an opaque token.
 */
export type ComponentInstanceRecord = object;

/**
 * `AudioStreamBasicDescription` (CoreAudioTypes) — the 40-byte struct the
 * StreamFormat property fills. Only `mChannelsPerFrame` (+0x1c) is read here,
 * but the full layout is documented for provenance.
 */
export interface AudioStreamBasicDescription {
  /** +0x00 */ mSampleRate: number;
  /** +0x08 */ mFormatID: number;
  /** +0x0c */ mFormatFlags: number;
  /** +0x10 */ mBytesPerPacket: number;
  /** +0x14 */ mFramesPerPacket: number;
  /** +0x18 */ mBytesPerFrame: number;
  /** +0x1c */ mChannelsPerFrame: number;
  /** +0x20 */ mBitsPerChannel: number;
  /** +0x24 */ mReserved: number;
}

/**
 * `_AudioUnitGetProperty` — AudioToolbox out-of-scope extern
 * (@Flexo 0xd38790, stub 0x1494614). Returns an `OSStatus` (0 = success) and
 * fills `outData`. Modelled as a boundary stub: without a live AudioUnit we
 * cannot produce a real StreamFormat, so this raises — a loud gap, per
 * PORTING_SPEC Rule 3 (out-of-scope extern, cites addr). A real host wires an
 * actual AudioUnit here.
 */
function AudioUnitGetProperty(
  _inUnit: ComponentInstanceRecord,
  _inID: number,
  _inScope: number,
  _inElement: number,
  _outData: Partial<AudioStreamBasicDescription>,
  _ioDataSize: { value: number },
): number {
  throw new Error(
    "_AudioUnitGetProperty @Flexo 0xd38790 (AudioToolbox extern, stub " +
      "0x1494614) — out-of-scope Core Audio boundary; a live AudioUnit must " +
      "be provided by the host to fill the StreamFormat ASBD.",
  );
}

/**
 * `_AudioUnitSetProperty` — AudioToolbox out-of-scope extern
 * (@Flexo 0xd386c5, stub 0x1494644). Sets a property on an AudioUnit and
 * returns an `OSStatus` (0 = success). Modelled as a boundary stub: without a
 * live AudioUnit there is no property store to write, so this raises — a loud
 * gap, per PORTING_SPEC Rule 3 (out-of-scope extern, cites addr). A real host
 * wires an actual AudioUnit here. Mirrors the `_AudioUnitGetProperty` boundary
 * above (the read counterpart used by GetUnitChannels).
 */
function AudioUnitSetProperty(
  _inUnit: ComponentInstanceRecord,
  _inID: number,
  _inScope: number,
  _inElement: number,
  _inData: AudioStreamBasicDescription,
  _inDataSize: number,
): number {
  throw new Error(
    "_AudioUnitSetProperty @Flexo 0xd386c5 (AudioToolbox extern, stub " +
      "0x1494644) — out-of-scope Core Audio boundary; a live AudioUnit must " +
      "be provided by the host to receive the StreamFormat ASBD.",
  );
}

/**
 * `FFAudioGraph` — Flexo audio-graph helpers. Only `GetUnitChannels` is ported
 * in this file; other members are separate ledger entries.
 */
export class FFAudioGraph {
  /**
   * `FFAudioGraph::SetUnitFormat(ComponentInstanceRecord*, unsigned int,
   * AudioStreamBasicDescription const&, unsigned int)` — @Flexo 0xd386b0
   * (__ZN12FFAudioGraph13SetUnitFormatEP23ComponentInstanceRecordjRK27AudioStreamBasicDescriptionj).
   *
   * The write counterpart of GetUnitChannels: set the AudioUnit `unit`'s
   * StreamFormat (kAudioUnitProperty_StreamFormat = 8) for the given
   * `scope`/`element` from the caller-supplied ASBD `fmt`, and return the
   * AudioUnitSetProperty OSStatus.
   *
   * FULL DISASM (raw-port/re/disasm/Flexo.__ZN12FFAudioGraph13SetUnitFormatEP23ComponentInstanceRecordjRK27AudioStreamBasicDescriptionj.s — 9 lines):
   *   0xd386b0  pushq %rbp ; movq %rsp,%rbp
   *   0xd386b4  movq  %rdx, %r8              ; inData(r8)  = arg3 = &fmt
   *   0xd386b7  movl  %esi, %edx             ; inScope(edx) = arg2 = scope
   *   0xd386b9  movl  $0x8, %esi             ; inID(esi)    = 8 (kAudioUnitProperty_StreamFormat)
   *   0xd386be  movl  $0x28, %r9d            ; inDataSize(r9d) = 0x28 (40 = sizeof ASBD)
   *   0xd386c4  popq  %rbp
   *   0xd386c5  jmp   _AudioUnitSetProperty  ; TAIL-CALL (stub 0x1494644)
   *                                          ;   return AudioUnitSetProperty(
   *                                          ;     inUnit    = rdi (arg1, the unit),
   *                                          ;     inID      = 8,
   *                                          ;     inScope   = edx (arg2, scope),
   *                                          ;     inElement = ecx (arg4, element; passed through),
   *                                          ;     inData    = r8  (arg3, &fmt),
   *                                          ;     inDataSize = 0x28)
   *
   * ABI (AudioUnitSetProperty, AudioToolbox):
   *   OSStatus AudioUnitSetProperty(AudioUnit inUnit /rdi,
   *     AudioUnitPropertyID inID /esi, AudioUnitScope inScope /edx,
   *     AudioUnitElement inElement /ecx, const void* inData /r8, UInt32 inDataSize /r9)
   *
   * Static method (no `this`): like the sibling GetUnitChannels, the disasm
   * takes the unit as its first argument (%rdi) with no member access — a
   * free/static FFAudioGraph helper. The incoming registers are therefore
   * (rdi=unit, esi=scope, rdx=&fmt, rcx=element); the shuffle drops arg2(scope)
   * into inScope, sets inID=8 and inDataSize=0x28, and leaves inUnit=rdi and
   * inElement=ecx untouched, then tail-jumps.
   *
   * OUT-OF-SCOPE EXTERNS (modelled at the boundary, PORTING_SPEC Rule 3):
   *   * _AudioUnitSetProperty (AudioToolbox) @0xd386c5 (stub 0x1494644).
   *   * ComponentInstanceRecord* (opaque AudioUnit handle) — passed through.
   *   FRONTIER CALLEES: none in-scope.
   */
  static SetUnitFormat(
    unit: ComponentInstanceRecord,
    scope: number,
    fmt: AudioStreamBasicDescription,
    element: number,
  ): number {
    // @0xd386b4 movq %rdx,%r8 : inData = &fmt.
    // @0xd386b7 movl %esi,%edx : inScope = scope.
    // @0xd386b9 movl $0x8,%esi : inID = kAudioUnitProperty_StreamFormat.
    // @0xd386be movl $0x28,%r9d : inDataSize = 40 (sizeof ASBD).
    // @0xd386c5 jmp _AudioUnitSetProperty(unit, 8, scope, element, &fmt, 40)
    //   (inUnit = rdi = unit; inElement = ecx = element, passed through).
    return AudioUnitSetProperty(unit, 0x8, scope >>> 0, element >>> 0, fmt, 0x28);
  }

  /**
   * `FFAudioGraph::GetUnitChannels(ComponentInstanceRecord*, unsigned int,
   * unsigned int)` — @Flexo 0xd38770
   * (__ZN12FFAudioGraph15GetUnitChannelsEP23ComponentInstanceRecordjj).
   *
   * Query the AudioUnit `unit`'s current StreamFormat
   * (kAudioUnitProperty_StreamFormat = 8) for the given `scope`/`element`, and
   * return the resulting ASBD's `mChannelsPerFrame`. If the property fetch
   * returns a nonzero OSStatus, return 0.
   *
   * Static method (no `this`): the disasm takes the unit as its first
   * argument (%rdi) — there is no member access, so this is a free/static
   * FFAudioGraph helper.
   */
  static GetUnitChannels(
    unit: ComponentInstanceRecord,
    scope: number,
    element: number,
  ): number {
    // @0xd3877c movl $0x28,-0x4(%rbp) : ioDataSize = 40 (sizeof ASBD).
    const ioDataSize = { value: 0x28 };
    // @0xd38783 leaq -0x30(%rbp),%r8 : stack ASBD out buffer.
    const outData: Partial<AudioStreamBasicDescription> = {};
    // @0xd3878b movl $0x8,%esi : inID = kAudioUnitProperty_StreamFormat.
    // @0xd38790 callq _AudioUnitGetProperty(unit, 8, scope, element, &out, &size).
    //   (prologue mapped scope->edx=inScope, element->ecx=inElement).
    const status = AudioUnitGetProperty(
      unit,
      0x8,
      scope >>> 0,
      element >>> 0,
      outData,
      ioDataSize,
    );
    // @0xd38797 xorl %eax,%eax : default 0.
    // @0xd38799 testl %ecx,%ecx ; @0xd3879b jne : nonzero status => return 0.
    if (status !== 0) {
      // @0xd387a0 epilogue with eax = 0.
      return 0;
    }
    // @0xd3879d movl -0x14(%rbp),%eax : return ASBD.mChannelsPerFrame (+0x1c).
    return (outData.mChannelsPerFrame ?? 0) >>> 0;
  }
}
