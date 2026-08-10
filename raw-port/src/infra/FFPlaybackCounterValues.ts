// FFPlaybackCounterValues.ts — playback-scoped counter snapshot for the FCP Flexo engine.
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.__ZN23FFPlaybackCounterValues24getLiveEditsThisPlaybackEv.s
//
// Exported symbol ported here (a trivial int32 field getter):
//   @Flexo 0x0000000000d70530  FFPlaybackCounterValues::getLiveEditsThisPlayback()
//
// Disassembly (verbatim):
//   0xd70530  pushq  %rbp
//   0xd70531  movq   %rsp, %rbp
//   0xd70534  movl   0x34(%rdi), %eax   ; eax = *(int32_t*)(this + 0x34)
//   0xd70537  popq   %rbp
//   0xd70538  retq
//
// STRUCT LAYOUT (recovered from this accessor):
//   +0x34  int32_t liveEditsThisPlayback   // read by getLiveEditsThisPlayback @0xd70534 (movl = 32-bit)
//
// NUMERICS: `movl 0x34(%rdi), %eax` is a plain 32-bit load into eax — a signed int32 field. No
// float conversions. Modelled as a JS `number` holding a 32-bit integer value.

/**
 * Per-playback counter snapshot (FCP class `FFPlaybackCounterValues`).
 *
 * Only one exported accessor was found for this class; the constructor and other
 * accessors are inlined at their callers. The single ported symbol reads the
 * int32 field at +0x34.
 */
export class FFPlaybackCounterValues {
  /** @Flexo +0x34 — int32 count of live edits during this playback; read at 0xd70534 (movl). */
  private liveEditsThisPlayback: number;

  /**
   * No explicit ctor symbol is exported by Flexo for this class (inlined at each
   * caller). The one behaviour the ported accessor assumes about a fresh instance
   * is that the +0x34 field is a readable int32; it is initialised to 0 here to
   * mirror the zero-initialised object shape callers construct.
   */
  constructor() {
    this.liveEditsThisPlayback = 0;
  }

  /**
   * Return the count of live edits made during this playback.
   *
   * @Flexo 0x0000000000d70530  FFPlaybackCounterValues::getLiveEditsThisPlayback()
   *
   *   movl 0x34(%rdi), %eax   ; return *(int32_t*)(this + 0x34)
   */
  getLiveEditsThisPlayback(): number {
    // @0xd70534 movl 0x34(%rdi), %eax — return this->liveEditsThisPlayback (int32)
    return this.liveEditsThisPlayback;
  }
}
