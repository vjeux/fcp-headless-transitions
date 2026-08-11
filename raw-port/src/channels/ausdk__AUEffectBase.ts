// ausdk__AUEffectBase.ts — Flexo.framework (channels layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo  (macOS FCP, x86_64 slice).
//
// FILE NAMING: the C++ entity is `ausdk::AUEffectBase`, and the repo joins qualified names with a
// DOUBLE underscore (PORTING_SPEC "Nested-class file naming"), so the file is
// `ausdk__AUEffectBase.ts` — the same convention the landed `MXF__MXFPartitionData.ts` and
// `OZOpticalFlow__Private__CacheFileHeader.ts` use. `ausdk` is Apple's Audio Unit SDK namespace,
// statically linked into Flexo; it is IN SCOPE because the symbol is DEFINED in one of the five
// framework binaries (the #280 rule), not an undefined extern.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * ausdk::AUEffectBase::SetBypassEffect(bool)   @Flexo 0x1241600
//     __ZN5ausdk12AUEffectBase15SetBypassEffectEb
//
// re/disasm:
//   raw-port/re/disasm/Flexo.__ZN5ausdk12AUEffectBase15SetBypassEffectEb.s
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. One byte store; no callq, no branch, no rip-relative operand.
// `depgraph.py deps __ZN5ausdk12AUEffectBase15SetBypassEffectEb` reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM (6 instructions, @0x1241600..@0x124160d)
// -----------------------------------------------------------------------------
//   0x1241600  pushq %rbp                      ; frame prologue
//   0x1241601  movq  %rsp, %rbp
//   0x1241604  movb  %sil, 0x268(%rdi)         ; this->bypassEffect (u8) = (byte)arg
//   0x124160b  popq  %rbp                      ; epilogue
//   0x124160c  retq
//   0x124160d  nopl  (%rax)                    ; padding — not executed
//
// `%rdi` is the implicit `this`, `%sil` is the LOW BYTE of arg 1 (`%rsi`, the `bool` — the `b`
// in the mangling). The store is `movb`, so the field is exactly ONE byte wide, not a word.
//
// The offset and the width are independently pinned by the matched reader
// `ausdk::AUEffectBase::ShouldBypassEffect()` @Flexo 0x1241610 — the very next function, 0x10
// bytes along — whose whole body is `movzbl 0x268(%rdi), %eax` @0x1241614: a ZERO-EXTENDING
// one-byte load of the same slot. A matched movb/movzbl store-load pair over one offset is what
// fixes both the location and the width. (ShouldBypassEffect is a separate ledger entry and is
// NOT ported here; it is quoted as evidence.)
//
// -----------------------------------------------------------------------------
// ORACLE — differential against the live binary, all 256 byte values, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/ausdk_AUEffectBase_SetBypassEffect_oracle.py. Both symbols are LOCAL (`t` in
// the cached symbol table), so they are called at x86_64 vmaddr + the loaded image's slide, under
// `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice these addresses come from (OPS_LOG
// "wrong architecture" — the mismatch fails silently toward VERIFIED). Flexo does not plain-dlopen
// outside the app bundle, so the harness preloads its @rpath chain depth-first first.
//
// For each of the 256 possible argument bytes, over a 0xAA-poisoned 0x300-byte object:
//   wrong byte at +0x268      = 0    (the byte lands verbatim)
//   any OTHER byte touched    = 0    (so it is a 1-byte store, not a 4- or 8-byte one — a wider
//                                     store would have clobbered +0x269.. and been counted here)
//   ShouldBypassEffect mismatch = 0  (the reader hands the same byte back, zero-extended)
//
// A NOTE ON THE TYPE. The machine stores whatever byte the caller put in `%sil`, and the oracle
// above confirms all 256 values round-trip. The declared parameter type is nevertheless `bool`
// (the Itanium `b` suffix), whose object representation the ABI restricts to 0 and 1 — any other
// byte is undefined behaviour on the C++ side, not a supported input. So this port types the
// parameter `boolean` and models the field as `boolean`, exactly as the landed
// `PCImage::setIsPremultiplied(bool)` @ProCore 0x4af6c does for the same `movb %sil, off(%rdi)`
// shape. The full-byte behaviour is recorded here so a future port of `ShouldBypassEffect` — whose
// `movzbl` WOULD surface a non-0/1 byte — can decide the representation with the evidence in hand.

/**
 * `ausdk::AUEffectBase` — Apple Audio Unit SDK effect base class, as statically linked into
 * Flexo. Only the ONE field this unit writes is modelled; every other offset is undecoded and
 * deliberately absent (PORTING_SPEC Rule 5 — no fabricated fields).
 */
export class ausdk__AUEffectBase {
  /**
   * `this+0x268` — the bypass flag. A ONE-BYTE instance field, written by
   * `SetBypassEffect` (`movb %sil, 0x268(%rdi)` @0x1241604) and read back by
   * `ShouldBypassEffect` (`movzbl 0x268(%rdi), %eax` @0x1241614, a separate ledger entry).
   * Initialised `false` here so the field exists and is typed; the true reset value is
   * established by AUEffectBase's ctor, which is another ledger unit.
   */
  bypassEffect: boolean = false; // @Flexo ausdk::AUEffectBase@0x268

  /**
   * `ausdk::AUEffectBase::SetBypassEffect(bool)` — @Flexo 0x1241600
   *   (__ZN5ausdk12AUEffectBase15SetBypassEffectEb)
   *
   * Faithful transcription of the whole 6-instruction body: one byte store into the +0x268
   * slot. No callees, no validation, no branches. See the file header for the listing, the
   * matched-reader evidence that pins the offset and width, and the 256-value differential
   * against the live binary.
   *
   * @param bypass — the `bool` argument (SysV `%rsi`; only its low byte `%sil` is stored).
   */
  SetBypassEffect(bypass: boolean): void {
    // ------------------------------------------------------------
    // @0x1241600..0x1241601 — prologue (no TS-visible effect).
    // @0x1241604 — movb %sil, 0x268(%rdi) : store the low byte at offset +0x268.
    //   Verified live: exactly this one byte changes, for every one of the 256
    //   possible argument bytes, and no other byte of the object moves.
    // @0x124160b..0x124160c — epilogue + retq.
    // ------------------------------------------------------------
    this.bypassEffect = bypass;
  }
}
