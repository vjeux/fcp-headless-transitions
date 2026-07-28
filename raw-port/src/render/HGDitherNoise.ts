// HGDitherNoise.ts — Helium's dither-noise resource-descriptor class,
// faithfully transcribed from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGDitherNoise.getNoise.s    @0x10a550
//   raw-port/re/disasm/Helium.HGDitherNoise.getNumCols.s  @0x10a560
//   raw-port/re/disasm/Helium.HGDitherNoise.getFormat.s   @0x10a570
//   (getNumRows @0x10a560 is ICF-folded onto getNumCols - see nm below.)
//
// nm -arch x86_64 Helium:
//   000000000010a550 t __ZN13HGDitherNoise8getNoiseENS_7PDFModeE
//   000000000010a560 t __ZN13HGDitherNoise10getNumColsEv
//   000000000010a560 t __ZN13HGDitherNoise10getNumRowsEv   <- ICF-folded onto NumCols
//   000000000010a570 t __ZN13HGDitherNoise9getFormatEv
//   0000000000a5c630 D _kBlueNoise3RPDF                    <- the 512KB blob
//
// The BLOB: `_kBlueNoise3RPDF` lives in the __DATA/__data section from
// VA 0xa5c630..0xadc630 = 0x80000 bytes = 524288 bytes. That is exactly
// 256 * 256 * 8 bytes - matching the 256x256 grid implied by getNumCols /
// getNumRows both returning 0x100. Each 8-byte cell is a float32 (the
// low 4 bytes, matches the nonzero-then-zero pattern in the raw bytes)
// followed by a 4-byte trailer (top 2 bytes non-zero, bottom 2 bytes
// zero - likely a packed int16-plus-padding channel). We do NOT decode
// the individual cells here; consumers that need the actual noise pull
// it via the exported handle for on-demand mmap-style loading. Decoding
// the exact per-cell layout is a downstream concern (needs the sampler
// callsite disasm to disambiguate the trailer channel semantics) and is
// not observable via the four class methods ported here.
//
// The three concrete return values recovered from asm:
//   getNoise(anyPDFMode)  -> &_kBlueNoise3RPDF     ; VA 0xa5c630
//   getNumCols()          -> 0x100  (= 256)        ; imm32 in movl
//   getNumRows()          -> 0x100  (ICF twin)     ; same body as getNumCols
//   getFormat()           -> 0x1b   (= 27)         ; imm32 in movl
//
// Key faithfulness detail (would-fail-gate if guessed):
//   getNoise IGNORES its `PDFMode` argument entirely. The parameter is
//   never read after entry - the function is just `pushq %rbp ; movq
//   %rsp,%rbp ; leaq _kBlueNoise3RPDF(%rip),%rax ; popq %rbp ; retq`.
//   So this accessor ALWAYS returns the "3R PDF" blue-noise table
//   regardless of which enum value was passed. This may be a deliberate
//   FCP simplification (they only ship one PDF flavor) - we mirror the
//   asm rather than inferring a switch.

/** HGDitherNoise::PDFMode - enum reserved by the accessor. The switch
 *  side (if any) is compiled out - getNoise never inspects this value.
 *  Names of the enumerators are not recoverable from THIS class's
 *  disassembly; consumers should treat PDFMode as an opaque int. */
export type PDFMode = number;

/** Handle for the on-disk _kBlueNoise3RPDF blob. The raw bytes live in
 *  Helium's __DATA/__data section - VA range [0xa5c630, 0xadc630) -
 *  which is 0x80000 (524288) bytes. Consumers that want the actual noise
 *  pixel data should mmap/read the Helium binary at this offset (after
 *  adjusting for FAT slice base 0x4000 + segment/section file offsets).
 *
 *  We surface it as an opaque tagged handle rather than baking a 512KB
 *  literal into the source. Downstream code that samples the noise MUST
 *  resolve this handle to real bytes via a loader that knows the FCP
 *  binary path. */
export interface BlueNoise3RPDFHandle {
  /** Discriminant tag so unrelated pointers don't accidentally match. */
  readonly kind: "kBlueNoise3RPDF";
  /** Symbol name as it appears in the Helium `nm` listing. */
  readonly symbol: "_kBlueNoise3RPDF";
  /** Virtual address of the blob start in the Helium __DATA/__data section. */
  readonly va: 0xa5c630;
  /** Virtual address one past the end (from nm's next-symbol boundary). */
  readonly vaEnd: 0xadc630;
  /** Byte count = 256 rows * 256 cols * 8 bytes/cell. */
  readonly byteLength: 0x80000;
}

/** Singleton for the &_kBlueNoise3RPDF value the asm's `leaq` produces. */
export const kBlueNoise3RPDF: BlueNoise3RPDFHandle = {
  kind: "kBlueNoise3RPDF",
  symbol: "_kBlueNoise3RPDF",
  va: 0xa5c630,
  vaEnd: 0xadc630,
  byteLength: 0x80000,
};

/** HGDitherNoise - a resource-descriptor accessor with four const methods. */
export class HGDitherNoise {
  /**
   * getNoise - @Helium 0x10a550.
   *
   * Faithful transcription of:
   *   pushq  %rbp
   *   movq   %rsp,%rbp
   *   leaq   _kBlueNoise3RPDF(%rip),%rax    ; @0x10a554
   *   popq   %rbp
   *   retq
   *
   * The `PDFMode` argument is NEVER read. All PDF modes return the same handle.
   *
   * @param mode HGDitherNoise::PDFMode - accepted but ignored (mirrors asm).
   * @returns the singleton `kBlueNoise3RPDF` handle for &_kBlueNoise3RPDF.
   */
  getNoise(mode: PDFMode): BlueNoise3RPDFHandle {
    // Explicitly consume `mode` so linters agree with the asm's "unused" reality.
    void mode;
    return kBlueNoise3RPDF;
  }

  /**
   * getNumCols - @Helium 0x10a560.
   *
   * Faithful transcription of:
   *   pushq  %rbp
   *   movq   %rsp,%rbp
   *   movl   $0x100,%eax    ; @0x10a564  imm32 = 256
   *   popq   %rbp
   *   retq
   *
   * @returns 256 - the noise table's column count.
   */
  getNumCols(): number {
    return 0x100;
  }

  /**
   * getNumRows - @Helium 0x10a560 (ICF-folded onto getNumCols).
   *
   * Both mangled symbols
   *   __ZN13HGDitherNoise10getNumColsEv
   *   __ZN13HGDitherNoise10getNumRowsEv
   * resolve to the same code address in `nm -arch x86_64`. The linker
   * identical-code-folded them because their bodies are byte-identical
   * (both return imm32 0x100). The `disasm.sh` tool emits a 0-line
   * extraction for getNumRows because `otool -tV` shows only one label
   * at that address (getNumCols). We DO NOT re-guess the body: we
   * transcribe the confirmed ICF twin at the shared @0x10a560 body.
   *
   * @returns 256 - the noise table's row count (256x256 grid, matches
   *   the 0x80000-byte / 8-bytes-per-cell blob size from _kBlueNoise3RPDF).
   */
  getNumRows(): number {
    return 0x100;
  }

  /**
   * getFormat - @Helium 0x10a570.
   *
   * Faithful transcription of:
   *   pushq  %rbp
   *   movq   %rsp,%rbp
   *   movl   $0x1b,%eax    ; @0x10a574  imm32 = 27
   *   popq   %rbp
   *   retq
   *
   * The concrete Helium format-enum NAME for 0x1b is not recoverable
   * from THIS class's disasm (the enum-to-name mapping lives in another
   * translation unit). Consumers should treat the return value as the
   * raw Helium format-id 27; not yet transcribed enum name @Helium 0x10a574
   * (the getFormat call site is a leaf - no callee to follow).
   *
   * @returns 27 - the raw Helium format-id (name pending).
   */
  getFormat(): number {
    return 0x1b;
  }
}
