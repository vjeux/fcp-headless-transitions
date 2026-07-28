// FFSilentAudioSignal.ts — FCP Flexo FFSilentAudioSignal. A trivially-simple
// audio "silence source": clones itself with a stored duration, reports itself
// as an indefinite signal, and no-ops sample processing (silence is already the
// zeroed-out sample buffer the caller provided).
//
// DECODE: raw-port/re/disasm/Flexo.FFSilentAudioSignal.*.s (framework Flexo x86_64 slice)
//   __ZN19FFSilentAudioSignalD0Ev              @0x000a6e50  ~FFSilentAudioSignal (deleting dtor)
//   __ZNK19FFSilentAudioSignal10copySignalEv   @0x000a6e60  copySignal() const
//   __ZNK19FFSilentAudioSignal18isIndefiniteSignalEv @0x000a6ea0  isIndefiniteSignal() const
//   __ZNK19FFSilentAudioSignal14processSamplesEPfyy  @0x000a6eb0  processSamples(float*, u64, u64) const
//
// Struct layout (from copySignal @0x000a6e73..91):
//   0x00  vtable ptr           (installed at @0x000a6e83..8e; vtable+0x10 offset)
//   0x08  uint64 duration      (copied from source at @0x000a6e73/0x000a6e91)
//   0x10  uint64 field2 = 0    (zero-init in the new instance @0x000a6e77)
//   0x18  uint8  flag = 0      (zero-init @0x000a6e7f — an "indefinite override" bit?)

/** operator delete @0x1497404 — __ZdlPv. Tail-called by the deleting dtor
 *  @0x000a6e55 with `jmp` (`this` is the arg). // @0x000a6e55 */
function operator_delete(_p: unknown): void { // @0x000a6e55
  throw new Error("FFSilentAudioSignal frontier callee not yet transcribed: operator delete @0x1497404 (call-site 0x000a6e55)"); // @0x000a6e55
}

/** operator new @0x1497452 — __Znwm. Called from copySignal with 0x20 bytes
 *  @0x000a6e6e (matches the 0x20-byte struct). // @0x000a6e6e */
function operator_new(_sz: number): FFSilentAudioSignal { // @0x000a6e6e
  throw new Error("FFSilentAudioSignal frontier callee not yet transcribed: operator new @0x1497452 (call-site 0x000a6e6e)"); // @0x000a6e6e
}

export class FFSilentAudioSignal {
  // Struct offsets per the copySignal store sequence @0x000a6e73..91.
  duration = 0n;         // @0x08
  field10 = 0n;          // @0x10 (zeroed on construction @0x000a6e77)
  flag18 = 0;            // @0x18 (zeroed on construction @0x000a6e7f)

  /**
   * ~FFSilentAudioSignal (deleting dtor) — __ZN19FFSilentAudioSignalD0Ev @0x000a6e50.
   *  The body is a single tail-jump to operator delete(this). No member cleanup
   *  is emitted (all fields are POD u64/u8). // @0x000a6e50
   */
  destroyDeleting(): void { // @0x000a6e50
    // @0x000a6e55  jmp __ZdlPv (this is in %rdi from the caller's ABI).
    operator_delete(this); // @0x000a6e55
  }

  /**
   * copySignal() const — __ZNK19FFSilentAudioSignal10copySignalEv @0x000a6e60.
   *  Allocates 0x20 bytes, zero-inits fields @0x10 and @0x18, installs the
   *  vtable, and copies `duration` (@0x08) from `this` into the new instance.
   *
   *  Returns FFSilentAudioSignal* (the caller frees).
   */
  copySignal(): FFSilentAudioSignal { // @0x000a6e60
    // @0x000a6e69..6e  movl $0x20,%edi ; callq __Znwm — routed through the frontier.
    const clone = operator_new(0x20);                       // @0x000a6e6e
    // @0x000a6e73  movq 0x8(%rbx),%rcx — read this->duration
    const dur = this.duration;                              // @0x000a6e73
    // @0x000a6e77..7f  zero-init 0x10 (u64) and 0x18 (u8)
    clone.field10 = 0n;                                     // @0x000a6e77
    clone.flag18 = 0;                                       // @0x000a6e7f
    // @0x000a6e83..8e  install vtable (vtable-for-class + 0x10) at 0x00. In our
    //  TS port the constructor picks the vtable via prototype linkage; the raw
    //  install site is documented for provenance only.
    // @0x000a6e91  movq %rcx,0x8(%rax) — write duration into the clone
    clone.duration = dur;                                   // @0x000a6e91
    return clone;                                            // @0x000a6e9b  retq
  }

  /**
   * isIndefiniteSignal() const — __ZNK19FFSilentAudioSignal18isIndefiniteSignalEv @0x000a6ea0.
   *  Constant true. Body: `movb $0x1,%al ; retq`. // @0x000a6ea0
   */
  isIndefiniteSignal(): boolean { // @0x000a6ea0
    return true; // @0x000a6ea4  movb $0x1, %al
  }

  /**
   * processSamples(float*, u64, u64) const — __ZNK19FFSilentAudioSignal14processSamplesEPfyy
   *  @0x000a6eb0. No-op: three-instruction body is just the prologue+retq. The
   *  caller's buffer is assumed already zeroed (or its contents ignored). // @0x000a6eb0
   */
  processSamples(_dst: Float32Array, _nFrames: bigint, _startFrame: bigint): void { // @0x000a6eb0
    // @0x000a6eb0..b5  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq — no-op.
  }
}
