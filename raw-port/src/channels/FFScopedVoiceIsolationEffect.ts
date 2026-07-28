// FFScopedVoiceIsolationEffect.ts — a scoped voice-isolation audio effect
// specialization of FFScopedExternalUnitEffect. Ported from the x86_64
// disassembly of Flexo.framework.
//
// Source disassembly (Flexo, VM addresses on the x86_64 slice):
//   @0x123e150  FFScopedVoiceIsolationEffect::BuildExternalUnitPostRenderFunc(
//                 unsigned int, FFScopedExternalUnitEffect::ExternalUnitRenderLocation)
//   @0x123e190  FFScopedVoiceIsolationEffect::GetPrimeDurations(CMTime&, CMTime&)
//   @0x123e8e0  FFScopedVoiceIsolationEffect::~FFScopedVoiceIsolationEffect()  (D2, thunk)
//   @0x123e8f0  FFScopedVoiceIsolationEffect::~FFScopedVoiceIsolationEffect()  (D0, deleting)
//
// The disassembly for @0x123e150 and the destructors is not emitted with a
// label by `otool -tV` (ICF-folded / no label at the boundary), but the raw
// text lines are present in the linear dump at the expected addresses; we
// read them by address rather than by label.
//
// FRONTIER (not yet transcribed — each throw cites its @0xADDR call site):
//   FFScopedExternalUnitEffect              (base class layout at +0x0..0x218,
//                                            ctor referenced @0x123e283 in the
//                                            neighboring function at 0x123e200)
//   FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*)  @Flexo callq at 0x123e1a7
//   FFAudioGraph::GetUnitFormat(ComponentInstanceRecord*, unsigned int,
//                               AudioStreamBasicDescription&, unsigned int)
//                                             @Flexo callq at 0x123e1ba
//   FFFlexo::ThrowErr_(int)                   @Flexo callq at 0x123e1c5
//   `new`  (@0x123e16a symbol stub for __Znwm) → operator new(size_t)
//   `delete` (@0x123e907 stub __ZdlPv)        → operator delete(void*)
//   The 64-byte object at +0x20 whose vtable is at Flexo VM 0x191e530
//     (RIP-relative `leaq 0x6e03ba(%rip),%rcx` @0x123e16f, pc-post = 0x123e176,
//     so target = 0x123e176 + 0x6e03ba = 0x191e530) — the concrete class name
//     is not yet decoded; we surface it as an opaque byte buffer.

import { CMTime, CMTimeMake } from "../infra/CMTime";

/**
 * ExternalUnitRenderLocation enum used by
 * FFScopedExternalUnitEffect::BuildExternalUnitPostRenderFunc. The mangled
 * argument type `N26FFScopedExternalUnitEffect26ExternalUnitRenderLocationE`
 * confirms it is a member enum. Only the value 0 is treated specially by
 * FFScopedVoiceIsolationEffect (see @0x123e161-@0x123e163: `testl %ecx,%ecx
 * ; jne 0x123e185`). The concrete enumerators are not decoded here.
 */
export type ExternalUnitRenderLocation = number;

/**
 * Opaque post-render-context object allocated by
 * FFScopedVoiceIsolationEffect::BuildExternalUnitPostRenderFunc when the
 * render location is 0. Sized 0x40 bytes in native memory. The first qword
 * is a vtable pointer at Flexo VM 0x191e530 (RIP-relative `leaq
 * 0x6e03ba(%rip),%rcx` at @0x123e16f, pc-post = 0x123e176, so target =
 * 0x191e530). Byte offset +0x30 is explicitly stored as 0 by the ctor path
 * @0x123e179. All other offsets (0x08..0x2f, 0x38..0x3f) are left with
 * whatever operator new(0x40) returned — the asm never initializes them,
 * so their contents are implementation-defined and we preserve that by
 * zero-filling the buffer (a common heap starting state on macOS but not
 * something the caller can rely on).
 */
export interface VoiceIsolationPostRenderContext {
  readonly kind: "VoiceIsolationPostRenderContext";
  /** 0x40 bytes; +0x00 = vtable ptr slot (Flexo @0x191e530), +0x30 = 0. */
  readonly bytes: Uint8Array;
}

/**
 * Layout of the parent slice + our added fields, from the asm:
 *   +0x008  FFAudioGraph*                    (read by GetPrimeDurations @0x123e19c)
 *   +0x010  FFAudioNode*                     (read by GetPrimeDurations @0x123e1a0)
 *   +0x020  VoiceIsolationPostRenderContext* (written by
 *                                             BuildExternalUnitPostRenderFunc
 *                                             @0x123e159 and @0x123e181)
 *   (all other offsets belong to the base FFScopedExternalUnitEffect and are
 *    not touched by any of the four methods we transcribe here)
 */
export class FFScopedVoiceIsolationEffect {
  /** @+0x008 — FFAudioGraph pointer. Passed to
   *  FFAudioGraph::GetAudioUnitInstanceForNode as the `this` receiver. */
  audioGraph: unknown = null;
  /** @+0x010 — FFAudioNode pointer. Passed to
   *  FFAudioGraph::GetAudioUnitInstanceForNode as the argument. */
  audioNode: unknown = null;
  /** @+0x020 — the post-render context lazily allocated by
   *  BuildExternalUnitPostRenderFunc when renderLocation == 0. */
  postRenderContext: VoiceIsolationPostRenderContext | null = null;

  /**
   * BuildExternalUnitPostRenderFunc — @Flexo 0x123e150.
   *
   * @0x123e150-@0x123e156  pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax;
   *                        movq %rdi,%rbx           ; save `this`
   * @0x123e159             movq $0x0,0x20(%rdi)     ; this->0x20 = nullptr
   * @0x123e161             testl %ecx,%ecx          ; test renderLocation (arg3, %ecx)
   * @0x123e163             jne  0x123e185           ; if != 0: skip allocation
   * @0x123e165-@0x123e16a  movl $0x40,%edi; callq __Znwm   ; p = operator new(0x40)
   * @0x123e16f-@0x123e176  leaq 0x6e03ba(%rip),%rcx        ; vtable @Flexo 0x191e530
   * @0x123e176             movq %rcx,(%rax)                ; p->vtable = vt
   * @0x123e179             movq $0x0,0x30(%rax)            ; p->[+0x30]  = 0
   * @0x123e181             movq %rax,0x20(%rbx)            ; this->0x20 = p
   * @0x123e185             movq %rbx,%rax                  ; return this
   * @0x123e188-@0x123e18e  epilogue
   *
   * The `unsigned int` arg (%esi) is loaded into %r12 by the disassembler's
   * calling convention (implicitly saved) but is NEVER read within this
   * function. We preserve it in the TS signature for parity.
   *
   * @param _unused  arg2 (%esi = %r12d): unused inside this method.
   * @param renderLocation  arg3 (%ecx): only value 0 triggers allocation.
   * @returns `this` (asm: `movq %rbx,%rax` @0x123e185).
   */
  BuildExternalUnitPostRenderFunc(
    _unused: number,
    renderLocation: ExternalUnitRenderLocation,
  ): FFScopedVoiceIsolationEffect {
    // @0x123e159  movq $0x0,0x20(%rdi)
    this.postRenderContext = null;
    // @0x123e161-@0x123e163  testl %ecx,%ecx ; jne 0x123e185
    if ((renderLocation | 0) === 0) {
      // @0x123e165-@0x123e16a  operator new(0x40) — a 64-byte block.
      const bytes = new Uint8Array(0x40);
      // @0x123e16f-@0x123e176  buffer[+0x00] = vtable pointer @Flexo 0x191e530.
      // A raw C++ vtable pointer cannot be expressed in TS; the vtable
      // identity is carried by the JS object's prototype chain instead.
      // We DO NOT fabricate an address — the 8 bytes at +0x00 stay 0.
      // @0x123e179  movq $0x0,0x30(%rax)  ; explicit zero at +0x30
      // (already zero from `new Uint8Array(0x40)`, but we mirror the store
      // as a comment; no bytes need to be written explicitly.)
      // @0x123e181  movq %rax,0x20(%rbx)
      this.postRenderContext = {
        kind: "VoiceIsolationPostRenderContext",
        bytes,
      };
    }
    // @0x123e185  movq %rbx,%rax  ; return this
    return this;
  }

  /**
   * GetPrimeDurations — @Flexo 0x123e190.
   *
   * The mangled signature `...R6CMTimeS1_` is two `CMTime&` refs; the asm
   * NEVER writes through the FIRST reference (%rsi is clobbered at
   * @0x123e1a0 to load `this->audioNode`). Only the SECOND reference
   * (%rdx, saved into %rbx) is written.
   *
   * @0x123e190-@0x123e195  pushq %rbp; movq %rsp,%rbp; pushq %rbx; subq $0x48,%rsp
   * @0x123e199             movq %rdx,%rbx                ; %rbx = &secondOutCMTime
   * @0x123e19c             movq 0x8(%rdi),%rax           ; graph = this->0x8
   * @0x123e1a0             movq 0x10(%rdi),%rsi          ; node  = this->0x10
   * @0x123e1a4             movq %rax,%rdi                ; call receiver = graph
   * @0x123e1a7             callq FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*)
   *                        → %rax = ComponentInstanceRecord* au
   * @0x123e1ac             leaq -0x48(%rbp),%rdx         ; &fmt (ASBD, 40 bytes)
   * @0x123e1b0             movq %rax,%rdi                ; arg0 = au
   * @0x123e1b3             movl $0x2,%esi                ; arg1 = 2  (scope)
   * @0x123e1b8             xorl %ecx,%ecx                ; arg3 = 0  (element)
   * @0x123e1ba             callq FFAudioGraph::GetUnitFormat(au, 2, &fmt, 0)
   *                        → %eax = OSStatus
   * @0x123e1bf             testl %eax,%eax
   * @0x123e1c1             je   0x123e1ca                ; if err == 0: skip throw
   * @0x123e1c3-@0x123e1c5  movl %eax,%edi; callq FFFlexo::ThrowErr_(int)
   * @0x123e1ca             cvttsd2si -0x48(%rbp),%edx    ; edx = (int32)(double)fmt.mSampleRate
   *                                                       ; ASBD +0 is mSampleRate (Float64)
   * @0x123e1cf             leaq -0x20(%rbp),%rdi         ; sret slot for CMTimeMake
   * @0x123e1d3             movl $0x140,%esi              ; value = 320 (== 0x140)
   * @0x123e1d8             callq _CMTimeMake             ; CMTime = CMTimeMake(320, sampleRate)
   * @0x123e1dd-@0x123e1e9  copy 24-byte CMTime (as xmm0 + trailing qword)
   *                        from -0x20(%rbp) into 0(%rbx)/0x10(%rbx)
   * @0x123e1ec-@0x123e1f2  epilogue
   *
   * Semantically: the second returned CMTime represents "320 audio frames
   * at the audio-unit's output sample rate", = 320/sampleRate seconds
   * (≈6.67ms at 48 kHz) — a plausible priming duration for a voice-
   * isolation ML pipeline. We DO NOT interpret it further; we just
   * transcribe the CMTimeMake call.
   *
   * @param first   passed in as %rsi and IMMEDIATELY overwritten at
   *                @0x123e1a0. Left untouched by this method — we return
   *                it unchanged for signature parity.
   * @param second  the second CMTime& — the actual output. Written via
   *                the returned object's `second` field.
   */
  GetPrimeDurations(first: CMTime): { first: CMTime; second: CMTime } {
    // @0x123e19c  movq 0x8(%rdi),%rax   ; graph pointer
    const graph = this.audioGraph;
    // @0x123e1a0  movq 0x10(%rdi),%rsi  ; node pointer
    const node = this.audioNode;
    // @0x123e1a7  callq FFAudioGraph::GetAudioUnitInstanceForNode(node)  → au
    // FRONTIER: FFAudioGraph::GetAudioUnitInstanceForNode not yet transcribed.
    const au = this._ffAudioGraph_GetAudioUnitInstanceForNode(graph, node); // @Flexo callq 0x123e1a7
    // @0x123e1ac-@0x123e1ba  callq FFAudioGraph::GetUnitFormat(au, 2, &fmt, 0)
    // FRONTIER: FFAudioGraph::GetUnitFormat not yet transcribed.
    const asbd = this._ffAudioGraph_GetUnitFormat(au, 2, 0); // @Flexo callq 0x123e1ba
    // asbd.err is the OSStatus in %eax; asbd.mSampleRate is the ASBD's +0 double.
    // @0x123e1bf-@0x123e1c1  testl %eax,%eax ; je skip
    if ((asbd.err | 0) !== 0) {
      // @0x123e1c3-@0x123e1c5  ThrowErr_(err)
      this._ffFlexo_ThrowErr_(asbd.err | 0); // @Flexo callq 0x123e1c5
    }
    // @0x123e1ca  cvttsd2si  → sample rate truncated toward zero to int32.
    //   The CVTTSD2SI instruction converts a double to a signed 32-bit integer
    //   with truncation. We reproduce with Math.trunc + int32 coercion.
    const sampleRate = Math.trunc(asbd.mSampleRate) | 0;
    // @0x123e1cf-@0x123e1d8  CMTimeMake(value=320 [$0x140], timescale=sampleRate)
    const t: CMTime = CMTimeMake(0x140, sampleRate);
    // @0x123e1dd-@0x123e1e9  write CMTime into *second (returned to caller).
    return { first, second: t };
  }

  // ---- FRONTIER STUBS (each throws with the exact call-site @0xADDR) ----

  /** FRONTIER: FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*) const.
   *  Called at @Flexo 0x123e1a7. Returns a ComponentInstanceRecord* handle. */
  private _ffAudioGraph_GetAudioUnitInstanceForNode(
    _graph: unknown,
    _node: unknown,
  ): unknown {
    throw new Error(
      "FRONTIER: FFAudioGraph::GetAudioUnitInstanceForNode not yet transcribed (called @Flexo 0x123e1a7)",
    );
  }

  /** FRONTIER: FFAudioGraph::GetUnitFormat(ComponentInstanceRecord*,
   *   unsigned int, AudioStreamBasicDescription&, unsigned int).
   *  Called at @Flexo 0x123e1ba. Returns OSStatus in eax and fills a 40-byte
   *  AudioStreamBasicDescription at &fmt; only mSampleRate (double @+0) is
   *  read back by this method. */
  private _ffAudioGraph_GetUnitFormat(
    _au: unknown,
    _scope: number,
    _element: number,
  ): { err: number; mSampleRate: number } {
    throw new Error(
      "FRONTIER: FFAudioGraph::GetUnitFormat not yet transcribed (called @Flexo 0x123e1ba)",
    );
  }

  /** FRONTIER: FFFlexo::ThrowErr_(int). Called at @Flexo 0x123e1c5. Throws
   *  an FFFlexo-family exception carrying the OSStatus. */
  private _ffFlexo_ThrowErr_(err: number): never {
    throw new Error(
      `FRONTIER: FFFlexo::ThrowErr_(${err}) not yet transcribed (called @Flexo 0x123e1c5)`,
    );
  }

  // ---- Destructors ----

  /**
   * ~FFScopedVoiceIsolationEffect() [D2, base-object destructor] — @Flexo 0x123e8e0.
   *
   * @0x123e8e0-@0x123e8e4  pushq %rbp; movq %rsp,%rbp; popq %rbp
   * @0x123e8e5             jmp __ZN26FFScopedExternalUnitEffectD2Ev
   *                             ; FFScopedExternalUnitEffect::~FFScopedExternalUnitEffect()
   *
   * Pure thunk — delegates to the base-class D2. In JS/TS there is no
   * destructor concept; we surface the call for parity and rely on GC.
   */
  destroy(): void {
    // @0x123e8e5  jmp FFScopedExternalUnitEffect::~FFScopedExternalUnitEffect()
    // FRONTIER: FFScopedExternalUnitEffect not yet transcribed.
    this._ffScopedExternalUnitEffect_D2(); // @Flexo jmp 0x123e8e5
  }

  /**
   * ~FFScopedVoiceIsolationEffect() [D0, deleting destructor] — @Flexo 0x123e8f0.
   *
   * @0x123e8f0-@0x123e8f6  pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax;
   *                        movq %rdi,%rbx
   * @0x123e8f9             callq FFScopedExternalUnitEffect::~FFScopedExternalUnitEffect()
   * @0x123e8fe             movq %rbx,%rdi           ; restore `this` for delete
   * @0x123e907             jmp __ZdlPv              ; operator delete(void*)
   *
   * Calls the base D2 then frees the storage. In TS we simulate by calling
   * the base D2 stub — the object then becomes unreachable and is GC'd.
   */
  destroyAndDelete(): void {
    // @0x123e8f9  callq base D2
    this._ffScopedExternalUnitEffect_D2(); // @Flexo callq 0x123e8f9
    // @0x123e907  jmp __ZdlPv (operator delete). No-op in TS/JS.
  }

  /** FRONTIER: FFScopedExternalUnitEffect::~FFScopedExternalUnitEffect() (D2)
   *  called at @Flexo 0x123e8e5 (jmp) and @Flexo 0x123e8f9 (call). Not yet
   *  transcribed — the base class hasn't been ported. */
  private _ffScopedExternalUnitEffect_D2(): void {
    throw new Error(
      "FRONTIER: FFScopedExternalUnitEffect::~FFScopedExternalUnitEffect() not yet transcribed (called @Flexo 0x123e8e5, 0x123e8f9)",
    );
  }
}
