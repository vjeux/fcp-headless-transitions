// AudioChannelStream.ts — Flexo abstract-base "audio channel stream" cursor. It is a per-channel
// pull-model iterator over a source of PCM samples: NextSample() returns the next float,
// AtEnd() reports EOS, Tell/SeekTo/CanSeek expose (optional) random access, SampleRate() reports
// the source rate. The base-class here supplies default implementations for the three non-pure
// slots that don't need media backing: an EOS-driven SkipSamples loop, a "no, I don't support
// random access" CanSeek, and an empty SeekTo. The pure slots (NextSample/SampleRate/AtEnd/Tell)
// have no base impl — they crash via `ud2` if called through the base vtable, and the D0/D1
// dtors are equally `ud2` because the base class is abstract-only and clang never actually
// generates a body for them (any concrete subclass emits its own D-thunks that chain into D2).
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// SYMBOLS (from /tmp/Flexo_mangled.txt + /tmp/Flexo_nm_full.txt):
//   __ZN18AudioChannelStreamC2Ev            @0x01226e60  AudioChannelStream::AudioChannelStream() [C2 base-object ctor]
//   __ZN18AudioChannelStream11SkipSamplesEy @0x01226e70  AudioChannelStream::SkipSamples(unsigned long long)
//   __ZNK18AudioChannelStream7CanSeekEv     @0x01226eb0  AudioChannelStream::CanSeek() const
//   __ZN18AudioChannelStream6SeekToEy       @0x01226ec0  AudioChannelStream::SeekTo(unsigned long long)
//   __ZN18AudioChannelStreamD2Ev            @0x0057c860  AudioChannelStream::~AudioChannelStream() [D2 base-object dtor — ICF-folded with FFPlayerThreadStateManager::playerThreadOnly() at same address, both being trivial empty functions]
//   __ZN18AudioChannelStreamD1Ev            @0x0148fd40  AudioChannelStream::~AudioChannelStream() [D1 complete-object dtor — body is `ud2`]
//   __ZN18AudioChannelStreamD0Ev            @0x0148fd50  AudioChannelStream::~AudioChannelStream() [D0 deleting     dtor — body is `ud2`]
//   __ZTV18AudioChannelStream               @0x0191d820  vtable
//   __ZTI18AudioChannelStream               @0x0191d870  typeinfo
//   __ZTS18AudioChannelStream               @0x0158195f  typeinfo name "18AudioChannelStream"
//
// CTOR VTABLE PATCH (from disasm @0x1226e64):
//   leaq  0x6f69c5(%rip), %rax        ; %rip after this insn = 0x1226e6b; +0x6f69c5 = 0x1926830
//   movq  %rax, (%rdi)                ; store vtable-first-slot into *this
// So `AudioChannelStream::AudioChannelStream()` writes the address `0x1926830` at obj[0]. That
// address is the first-virtual-method slot of __ZTV18AudioChannelStream (i.e. vtable + 0x10:
// after the 8-byte offset-to-top and the 8-byte typeinfo pointer). Vtable object itself starts
// at 0x0191d820 — the ctor's stored pointer is 16 bytes past that. This distance is the
// canonical Itanium vptr = &vtable[2]. NOTE: nm reports __ZTV18AudioChannelStream at
// 0x0191d820, which is 0xd020 shy of 0x1926830 — the 0xd020 gap is not the vtable-header
// distance; likely __ZTV18AudioChannelStream in nm is the *symbol-relative* offset within the
// __DATA segment while the ctor stores an absolute VA (loaded slide differs). We record both
// unmodified; the correct semantic is "install this vtable's first-slot pointer".
//
// STRUCT LAYOUT (deducible):
//   +0x00  vptr  (8 bytes)   — the C2 ctor writes this, nothing else.
//   Total observable size on the base class: 8 bytes (one vptr, no fields). Subclasses layer
//   their own state after +0x08 — e.g. FFAudioFileChannelStream (@0x01226ed0) zeros +0x8, +0x18
//   and writes 0 to +0x28, so it has ~40 bytes of extra state after the base.
//
// VTABLE SHAPE (deduced from callq patterns in SkipSamples @0x1226e86 / 0x1226e93 plus the
//   subclass method inventory of FFAudioFileChannelStream: NextSample / SampleRate / SkipSamples
//   / SeekTo / AtEnd / CanSeek / Tell / Open — subtracting the four we can see this base
//   implements (SkipSamples, SeekTo, CanSeek, and dtor) leaves the pure-virtual slots
//   NextSample, SampleRate, AtEnd, Tell as the ones the base cannot supply):
//
//     Slot   Offset  Signature                                Provenance
//     ---------------------------------------------------------------------------------------
//     0      +0x00   ~AudioChannelStream() [D1]                observed: ud2 (never called)
//     1      +0x08   ~AudioChannelStream() [D0]                observed: ud2 (never called)
//     2      +0x10   virtual void NextSample()                  called from SkipSamples @0x1226e93 (`callq *0x10(%rax)`)
//     3      +0x18   virtual double SampleRate() const ?        pure — subclass FFAudioFileChannelStream::SampleRate
//     4      +0x20   virtual bool AtEnd() const                 called from SkipSamples @0x1226e86 (`callq *0x20(%rax)`); return in %al tested `testb %al, %al`
//     5      +0x28   virtual uint64_t Tell() const ?            pure — subclass FFAudioFileChannelStream::Tell
//     6      +0x30   virtual bool CanSeek() const               base impl returns 0
//     7      +0x38   virtual void SeekTo(uint64_t)              base impl empty (no-op)
//     8      +0x40   virtual uint64_t SkipSamples(uint64_t)     base impl loops NextSample until AtEnd
//
//   The exact positions of SampleRate/Tell are inferences from the subclass's method roster
//   and the standard Itanium ordering (dtors first, then declarations in source order). What
//   we can SEE unambiguously is that slot +0x10 advances one sample and slot +0x20 returns a
//   bool "is at end" — both from the SkipSamples disasm. The other pure slots are documented
//   as raising-stub declarations without a bound implementation.
//
// FRONTIER (undecoded / opaque):
//   - AudioFile / CoreAudio backing — subclasses (FFAudioFileChannelStream) drive real PCM;
//     the base has none. Not decoded here.
//   - The abstract subclass FFAudioFileChannelStream — separate port; brings NextSample /
//     SampleRate / AtEnd / Tell / Open into play.

/**
 * AudioChannelStream — abstract-base per-channel PCM pull cursor from Flexo. Subclasses
 * (e.g. FFAudioFileChannelStream) supply the source; the base only wires up SkipSamples on top
 * of the two abstract advance primitives (NextSample, AtEnd) and reports "no random access"
 * via CanSeek/SeekTo.
 *
 * The instance is 8 bytes in the C++ layout (a single vptr at +0x00). In TS we model that vptr
 * via method dispatch on the class itself; no fields are stored.
 */
export abstract class AudioChannelStream {
  /**
   * AudioChannelStream::AudioChannelStream() — C2 base-object constructor @Flexo 0x01226e60.
   *
   * Full disassembly (5 instructions):
   *   01226e60  pushq   %rbp
   *   01226e61  movq    %rsp, %rbp
   *   01226e64  leaq    0x6f69c5(%rip), %rax   ; = 0x1926830 (vtable first-method-slot)
   *   01226e6b  movq    %rax, (%rdi)           ; obj[+0x00] = vptr
   *   01226e6e  popq    %rbp
   *   01226e6f  retq
   *
   * Body: installs the AudioChannelStream vtable pointer at offset 0 of the instance. No
   * fields to initialize. In TS this is empty — the JavaScript runtime binds virtual dispatch
   * through the class prototype chain instead of a manual vptr store.
   */
  protected constructor() {
    // C++ body @0x1226e64: `movq &vtable[2], (this)`. Nothing else. In TS: implicit prototype
    // linkage replaces the manual vptr install.
  }

  /**
   * AudioChannelStream::SkipSamples(unsigned long long n) — @Flexo 0x01226e70.
   *
   * Full disassembly (transcribed byte-for-byte):
   *   01226e70  testq   %rsi, %rsi           ; if (n == 0)
   *   01226e73  je      0x1226e9e            ;   -> return 0 (fast-path early exit)
   *   01226e75  pushq   %rbp
   *   01226e76  movq    %rsp, %rbp
   *   01226e79  pushq   %rbx
   *   01226e7a  pushq   %rax                 ; 16-byte stack align pad
   *   01226e7b  movq    %rdi, %rbx           ; %rbx = this  (callee-save survives vtable calls)
   *   01226e7e  nop
   *   ; ---- loop head @0x1226e80 ----
   *   01226e80  movq    (%rbx), %rax         ; %rax = vptr
   *   01226e83  movq    %rbx, %rdi           ; arg0 = this
   *   01226e86  callq   *0x20(%rax)          ; vtable[+0x20] -> AtEnd() ; returns bool in %al
   *   01226e89  testb   %al, %al             ; if (AtEnd())
   *   01226e8b  jne     0x1226e98            ;   -> break out of loop
   *   01226e8d  movq    (%rbx), %rax         ; %rax = vptr    (reload — vtable calls may clobber %rax)
   *   01226e90  movq    %rbx, %rdi           ; arg0 = this
   *   01226e93  callq   *0x10(%rax)          ; vtable[+0x10] -> NextSample() ; discards return
   *   01226e96  jmp     0x1226e80            ; continue loop (unconditionally — no counter decrement!)
   *   ; ---- loop exit @0x1226e98 ----
   *   01226e98  addq    $0x8, %rsp
   *   01226e9c  popq    %rbx
   *   01226e9d  popq    %rbp
   *   01226e9e  xorl    %eax, %eax           ; return 0
   *   01226ea0  retq
   *
   * SEMANTICS — subtle but exact:
   *   1. n==0 -> return 0 immediately (no vtable calls, no side effects).
   *   2. Otherwise loop *forever* pulling NextSample() until AtEnd() returns true. The
   *      parameter `n` is EFFECTIVELY IGNORED past the initial zero-check — the compiler
   *      never emitted a counter or a decrement. This isn't a bug we're smoothing over: this
   *      IS the shipped body of the base class. Subclasses (e.g. FFAudioFileChannelStream)
   *      override SkipSamples with a real n-honoring loop. The base's role is to be a
   *      "drain to EOS" fallback that any subclass which doesn't need `n` can rely on.
   *   3. The return value is always 0. A more useful non-abstract API might have returned
   *      "how many samples were actually skipped" — but the base returns unsigned-long-long 0
   *      unconditionally (the `xorl %eax, %eax` at 0x1226e9e is the only path that writes
   *      %rax before retq, and both fall-through paths go through it).
   *
   * Callees (vtable-dispatched — see class-header vtable table):
   *   *0x20(vptr)  @callq 0x1226e86 -> virtual bool AtEnd() const
   *   *0x10(vptr)  @callq 0x1226e93 -> virtual void NextSample()
   */
  SkipSamples(n: bigint): bigint {
    // @0x1226e70-73: fast-path zero check.
    if (n === 0n) return 0n;
    // @0x1226e80-96: drain-to-EOS loop. `n` is not consulted past the zero-check — mirrored.
    for (;;) {
      // @0x1226e80-8b: vtable[+0x20] AtEnd() -> break on true.
      if (this.AtEnd()) break;
      // @0x1226e8d-96: vtable[+0x10] NextSample() ; loop unconditionally.
      this.NextSample();
    }
    // @0x1226e9e-a0: return 0 always.
    return 0n;
  }

  /**
   * AudioChannelStream::CanSeek() const — @Flexo 0x01226eb0.
   *
   * Full disassembly (5 instructions):
   *   01226eb0  pushq   %rbp
   *   01226eb1  movq    %rsp, %rbp
   *   01226eb4  xorl    %eax, %eax           ; return false
   *   01226eb6  popq    %rbp
   *   01226eb7  retq
   *
   * Body: returns false unconditionally. Base class advertises no random-access support;
   * subclasses that ARE seekable (FFAudioFileChannelStream::CanSeek is a separate symbol
   * @Flexo, not disassembled here) override this slot.
   */
  CanSeek(): boolean {
    // @0x1226eb4: `xorl %eax, %eax` -> false. Base class is not seekable.
    return false;
  }

  /**
   * AudioChannelStream::SeekTo(unsigned long long) — @Flexo 0x01226ec0.
   *
   * Full disassembly (4 instructions):
   *   01226ec0  pushq   %rbp
   *   01226ec1  movq    %rsp, %rbp
   *   01226ec4  popq    %rbp
   *   01226ec5  retq
   *
   * Body: pure prologue+epilogue, no body. The base class is not seekable (CanSeek == false),
   * so SeekTo is a no-op — a caller that ignores CanSeek and calls SeekTo anyway simply gets
   * no effect (rather than a crash). Subclasses override; the pairing with a false CanSeek is
   * the standard "optional protocol" idiom.
   */
  SeekTo(_position: bigint): void {
    // @0x1226ec0-c5: no-op. Base class has no seek behavior; parameter intentionally unused.
  }

  // -------------------------------------------------------------------------------------------
  // ABSTRACT SLOTS — pure virtuals in the C++ base. Concrete subclasses override these; the
  // base vtable never binds them (they'd raise a pure-virtual call at runtime). Declared here
  // so the TS class matches the C++ interface a subclass must satisfy.
  // -------------------------------------------------------------------------------------------

  /**
   * virtual void NextSample() — vtable slot +0x10. Called from SkipSamples @0x1226e93. Pure
   * on the base class; a subclass (e.g. FFAudioFileChannelStream::NextSample @Flexo) supplies
   * the real advance.
   */
  abstract NextSample(): void;

  /**
   * virtual double SampleRate() — vtable slot +0x18 (inferred). Pure on base; the subclass
   * FFAudioFileChannelStream::SampleRate @Flexo supplies the source rate.
   */
  abstract SampleRate(): number;

  /**
   * virtual bool AtEnd() const — vtable slot +0x20. Called from SkipSamples @0x1226e86. Pure
   * on the base class; a subclass (FFAudioFileChannelStream::AtEnd @Flexo) reports EOS.
   */
  abstract AtEnd(): boolean;

  /**
   * virtual uint64_t Tell() const — vtable slot +0x28 (inferred). Pure on base; the subclass
   * FFAudioFileChannelStream::Tell @Flexo reports the current sample index.
   */
  abstract Tell(): bigint;

  // -------------------------------------------------------------------------------------------
  // DESTRUCTORS — the D-thunk trio.
  //
  //   D2 @0x057c860 : trivial empty body (ICF-folded with FFPlayerThreadStateManager::
  //                    playerThreadOnly at the same address — both compile to the same 4-byte
  //                    prologue+epilogue and clang deduplicated them). This is the "base-
  //                    object" destructor that a subclass D2 tail-calls to destroy the
  //                    AudioChannelStream slice.
  //
  //   D1 @0x148fd40 : body is `ud2` — a trap. clang never generated a real complete-object
  //                    dtor for this abstract class because no code path deletes a raw
  //                    AudioChannelStream*; every deletion goes through a subclass D0/D1.
  //
  //   D0 @0x148fd50 : body is `ud2` — same reason. The deleting dtor is unreachable through
  //                    the type system (the base is abstract, cannot be instantiated).
  //
  // We surface D1/D0 as raising stubs to preserve the demand signal. D2 is a no-op — reachable
  // via subclass D2 chaining, and has a legitimate (empty) implementation.
  // -------------------------------------------------------------------------------------------

  /**
   * ~AudioChannelStream() [D2 base-object dtor] — @Flexo 0x0057c860.
   *
   * Full disassembly (5 instructions):
   *   0057c860  pushq   %rbp
   *   0057c861  movq    %rsp, %rbp
   *   0057c864  popq    %rbp
   *   0057c865  retq
   *   0057c866  nopw    %cs:(%rax,%rax)
   *
   * Body: empty. ICF-folded with FFPlayerThreadStateManager::playerThreadOnly() at the exact
   * same address 0x057c860 (both trivial functions with identical bodies were merged). The D2
   * slot is called by subclass D2 dtors to destroy the base-class slice; here there's nothing
   * to destroy (no fields).
   */
  protected _dtorD2(): void {
    // No-op — see method header. Corresponds to the trivial base-object destructor @0x057c860.
  }

  /**
   * ~AudioChannelStream() [D1 complete-object dtor] — @Flexo 0x0148fd40.
   *
   * Full disassembly (4 instructions):
   *   0148fd40  pushq   %rbp
   *   0148fd41  movq    %rsp, %rbp
   *   0148fd44  ud2                          ; illegal instruction — traps immediately
   *   0148fd46  nopw    %cs:(%rax,%rax)
   *
   * Body: unconditionally executes `ud2`, which raises SIGILL. clang emits this when a class
   * is abstract-only and there is no reachable code path that deletes a base pointer — the
   * complete-object dtor is legally required to exist (for vtable population) but is
   * statically unreachable. Raising stub in TS mirrors that: calling _dtorD1() is a bug.
   */
  protected _dtorD1(): never {
    // @0x148fd44: ud2. Abstract class complete-object dtor — statically unreachable in C++.
    throw new Error(
      "AudioChannelStream::~AudioChannelStream() [D1] @Flexo 0x0148fd40 executes `ud2` — abstract base class complete-object dtor is unreachable (raise mirrors the C++ trap)",
    );
  }

  /**
   * ~AudioChannelStream() [D0 deleting dtor] — @Flexo 0x0148fd50.
   *
   * Full disassembly (4 instructions):
   *   0148fd50  pushq   %rbp
   *   0148fd51  movq    %rsp, %rbp
   *   0148fd54  ud2                          ; illegal instruction — traps immediately
   *   0148fd56  nopw    %cs:(%rax,%rax)
   *
   * Body: unconditionally `ud2`. Same reasoning as D1 — the deleting dtor is required to
   * exist in the vtable but is unreachable through the type system on an abstract class.
   */
  protected _dtorD0(): never {
    // @0x148fd54: ud2. Abstract class deleting dtor — statically unreachable in C++.
    throw new Error(
      "AudioChannelStream::~AudioChannelStream() [D0] @Flexo 0x0148fd50 executes `ud2` — abstract base class deleting dtor is unreachable (raise mirrors the C++ trap)",
    );
  }
}
