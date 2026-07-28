// FFAudioSignal — Flexo audio-signal generator base class. Polymorphic base
// for a family of time-varying scalar signals rendered into a Float32 output
// buffer. Subclasses override the render primitives via slots +0x18 and +0x20
// of the vtable.
//
// Faithful transcription of Flexo class FFAudioSignal (5 exported methods).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFAudioSignal.array.s              (variadic ctor, @0x1257a90)
//   raw-port/re/disasm/Flexo.FFAudioSignal.copyArray.s          (variadic clone,  @0x1257d30)
//   raw-port/re/disasm/Flexo.FFAudioSignal.copyList.s           (vector<*> clone, @0x1257fa0)
//   raw-port/re/disasm/Flexo.FFAudioSignal.render.s             (main loop,       @0x1258150)
//   raw-port/re/disasm/Flexo.FFAudioSignal.isIndefiniteSignal.s (const false,     @0x12592b0)
// Framework: Final Cut Pro / Flexo.framework
//
// DECODE — struct layout (recovered from the render loop's field accesses at
// 0x1258171/0x12581be/0x12581c4/0x12581af — every field read/written is at
// these offsets and nowhere else, plus the vtable-load `movq (%r15), %rax`
// @0x1258196):
//   +0x00  vtable*        vtbl        // installed by base ctor (not in
//                                     //   this decode; render()'s
//                                     //   `movq (%r15), %rax` @0x1258196
//                                     //   reads the vtable pointer here).
//   +0x08  uint64         period      // read at @0x12581be, compared
//                                     //   against phase to detect wrap.
//                                     //   Interpreted as a "cycle length in
//                                     //   sample slots".
//   +0x10  uint64         phase       // written at @0x12581af, read at
//                                     //   @0x1258171 (initial load into %r12
//                                     //   before entering the loop).
//                                     //   Current position within the cycle;
//                                     //   updated per rendered chunk.
//   +0x18  uint8          repeat      // read at @0x12581c4 (`cmpb $0x1`).
//                                     //   When 1, the render loop consults
//                                     //   the vtable's isEnabled slot at
//                                     //   +0x18 to decide whether the next
//                                     //   cycle is emitted; when 0 the same
//                                     //   check is skipped and the fill
//                                     //   proceeds unconditionally.
// The class carries no fields beyond +0x18 that render()/isIndefiniteSignal()
// reference — a full width will be established by the ctor (not in this
// port unit's methods brief).
//
// VTABLE (partial — recovered from the two indirect calls in render()):
//   +0x18  bool ()(FFAudioSignal*)                  // "isEnabled" probe.
//                                                   //   `callq *0x18(%rax)`
//                                                   //   @0x12581d1; return in
//                                                   //   %al drives the
//                                                   //   emit/skip of a cycle.
//   +0x20  void ()(FFAudioSignal*, float* dst,      // "renderChunk" primitive.
//                  uint64 phaseInCycle,             //   `callq *0x20(%rax)`
//                  uint64 sampleCount)              //   @0x12581a2; writes
//                                                   //   `sampleCount` floats
//                                                   //   into `dst` starting
//                                                   //   at `phaseInCycle`
//                                                   //   within the cycle.
// Neither vtable slot has been resolved to a concrete symbol yet — see
// raw-port/army/tools/vtable.py for the query surface. The virtual dispatch
// is preserved in the port through the FFAudioSignalVTable interface below,
// which subclasses must fill in. The throw-stubs are the correct signal to
// downstream workers that a concrete FFAudioSignal subclass needs porting.
//
// Numeric contract:
//   render()'s only arithmetic is unsigned integer modulo (`divl`/`divq`)
//   and 64-bit adds — see the loop at @0x125817a..@0x12581f3 for the
//   phase-wrap arithmetic. No float math is performed by the BASE class;
//   the subclass's `renderChunk` slot does the float generation.

/**
 * Minimal virtual-dispatch shape for FFAudioSignal — the two slots the
 * base-class `render()` invokes. Subclasses (still to be ported) implement
 * these to define the actual signal shape.
 */
export interface FFAudioSignalVTable {
  /**
   * vtable slot +0x18 — probes whether the signal wants to emit the next
   * cycle. Called from `render` @0x12581d1 when the repeat flag (+0x18)
   * is set. Corresponds to `callq *0x18(%rax)` where %rax is `this->vtbl`.
   */
  isEnabled(self: FFAudioSignal): boolean;

  /**
   * vtable slot +0x20 — writes `sampleCount` float32 samples into `dst`,
   * starting at position `phaseInCycle` within the signal's cycle.
   * Called from `render` @0x12581a2. Corresponds to
   * `callq *0x20(%rax)` where %rax is `this->vtbl` and the C++ signature
   * matches the SysV register loading at @0x1258196..@0x12581a2:
   *   %rdi = this   (base) @0x1258199
   *   %rsi = dst    (output pointer, offset into caller's buf by 4*%r14)
   *                                              @0x1258192 (leaq (%rax,%r14,4), %rsi)
   *   %rdx = phase-in-cycle (%r12)               @0x125819c
   *   %rcx = sampleCount (%r13)                  @0x125819f
   */
  renderChunk(
    self: FFAudioSignal,
    dst: Float32Array,
    dstOffset: number,
    phaseInCycle: bigint,
    sampleCount: bigint,
  ): void;
}

/**
 * FFAudioSignal — polymorphic base for a time-varying scalar signal.
 * Only `isIndefiniteSignal` is fully transcribed here; the other four
 * methods each surface their @0xADDR in their runtime error message; the
 * remaining decode work needs vtable + std::vector resolution by follow-up
 * port units.
 */
export class FFAudioSignal {
  /** Struct field +0x08 — cycle length ("period"). See DECODE header. */
  period: bigint = 0n;
  /** Struct field +0x10 — current phase within cycle. See DECODE header. */
  phase: bigint = 0n;
  /** Struct field +0x18 — repeat flag (0 or 1). See DECODE header. */
  repeat: number = 0;
  /** Vtable pointer stored at +0x00 — set by subclasses on construction. */
  protected vtbl!: FFAudioSignalVTable;

  /**
   * `FFAudioSignal::isIndefiniteSignal() const` @0x12592b0
   *   (__ZNK13FFAudioSignal18isIndefiniteSignalEv).
   *
   * Instructions (7 total, prologue/epilogue only):
   *   @0x12592b0  pushq %rbp
   *   @0x12592b1  movq  %rsp, %rbp
   *   @0x12592b4  xorl  %eax, %eax   ; return value = 0 (false)
   *   @0x12592b6  popq  %rbp
   *   @0x12592b7  retq
   *
   * The base class always reports "not indefinite". Subclasses that model
   * DC/silence/noise-forever streams override this vtable slot elsewhere
   * (not in the FFAudioSignal.* symbols brief).
   */
  isIndefiniteSignal(): boolean {
    // Direct TS mapping of `xorl %eax, %eax; retq` @0x12592b4.
    return false;
  }

  /**
   * `FFAudioSignal::render(float*, unsigned long long)` @0x1258150
   *   (__ZN13FFAudioSignal6renderEPfy).
   *
   * NOT YET TRANSCRIBED. The 67-line disasm at
   * raw-port/re/disasm/Flexo.FFAudioSignal.render.s is a phase-wrap loop
   * that:
   *   - Reads `this->phase` (+0x10, @0x1258171) as the starting cursor.
   *   - Loops while `%r14` (bytes written) < `%rbx` (dstLen requested).
   *   - Per iteration: computes `remaining = period - (phase % period)`,
   *     clamps against still-to-write, calls vtable+0x20 with
   *     (dst+off, phase%period, chunkLen) @0x12581a2,
   *     advances phase (+0x10) by chunkLen.
   *   - When phase reaches `this->period` (+0x8) it consults
   *     vtable+0x18 (`isEnabled`) @0x12581d1 to decide whether to emit
   *     the next cycle; if repeat flag (+0x18) is 0 it skips that check
   *     and unconditionally advances.
   *   - The wrap arithmetic switches between `divl` @0x125817f (fits in
   *     32-bit) and `divq` @0x12581ed (needs 64-bit) based on
   *     `(phase | period) >> 32 == 0` @0x12581df/@0x12581e6.
   *
   * Full transcription depends on decoding the two vtable slots
   * (+0x18 isEnabled, +0x20 renderChunk) into concrete subclass symbols;
   * see raw-port/army/tools/vtable.py FFAudioSignal for that surface.
   */
  render(_dst: Float32Array, _dstOffset: number, _sampleCount: bigint): void {
    throw new Error(
      "FFAudioSignal::render(float*, unsigned long long) @0x1258150 not yet transcribed — 67-line phase-wrap loop with two indirect vtable calls at +0x18 (@0x12581d1) and +0x20 (@0x12581a2) whose targets need vtable.py resolution",
    );
  }

  /**
   * `FFAudioSignal::array(FFAudioSignal*, ...)` @0x1257a90
   *   (__ZN13FFAudioSignal5arrayEPS_z).
   *
   * NOT YET TRANSCRIBED. Variadic factory — builds a std::vector<FFAudioSignal*>
   * from a va_list of FFAudioSignal* pointers terminated by NULL.
   * Standard SysV vararg-marshalling prologue @0x1257ac0..@0x1257af5
   * (spilling xmm0..xmm7 when %al != 0) followed by a
   *   for (va_arg; ptr != NULL; va_arg) vec.push_back(ptr)
   * loop @0x1257b19..@0x1257c85. Needs a std::vector<FFAudioSignal*>
   * port and a JS-side variadic bridging design; deferred.
   */
  static array(_first: FFAudioSignal, ..._rest: FFAudioSignal[]): FFAudioSignal[] {
    throw new Error(
      "FFAudioSignal::array(FFAudioSignal*, ...) @0x1257a90 not yet transcribed — variadic std::vector<FFAudioSignal*> factory using va_list, requires std::vector layout port and vararg bridging",
    );
  }

  /**
   * `FFAudioSignal::copyArray(FFAudioSignal*, ...)` @0x1257d30
   *   (__ZN13FFAudioSignal9copyArrayEPS_z).
   *
   * NOT YET TRANSCRIBED. Sister factory to `array` — same varargs plumbing
   * but each pushed pointer is first cloned via the vtable's +0x10 slot
   * (whose target isn't resolved in this port unit's disassembly).
   * See raw-port/re/disasm/Flexo.FFAudioSignal.copyArray.s (157 lines).
   */
  static copyArray(_first: FFAudioSignal, ..._rest: FFAudioSignal[]): FFAudioSignal[] {
    throw new Error(
      "FFAudioSignal::copyArray(FFAudioSignal*, ...) @0x1257d30 not yet transcribed — variadic clone-and-collect using vtable slot +0x10 whose target is unresolved",
    );
  }

  /**
   * `FFAudioSignal::copyList(std::vector<FFAudioSignal*> const&)` @0x1257fa0
   *   (__ZN13FFAudioSignal8copyListERKNSt3__16vectorIPS_NS0_9allocatorIS2_EEEE).
   *
   * NOT YET TRANSCRIBED. Non-variadic sibling of copyArray: builds a
   * std::vector<FFAudioSignal*> by cloning each element of the input
   * vector via the vtable's +0x10 slot @0x1258016
   *   (`callq *0x10(%rax)` where %rax = clone->vtbl).
   * See raw-port/re/disasm/Flexo.FFAudioSignal.copyList.s (117 lines).
   * Needs vtable slot +0x10 to be resolved to a concrete "clone"
   * subclass override before this can be transcribed.
   */
  static copyList(_src: FFAudioSignal[]): FFAudioSignal[] {
    throw new Error(
      "FFAudioSignal::copyList(std::vector<FFAudioSignal*> const&) @0x1257fa0 not yet transcribed — per-element clone via unresolved vtable slot +0x10 (@0x1258016)",
    );
  }
}
