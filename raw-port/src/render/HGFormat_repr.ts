// HGFormat_repr.ts — Helium free function HGFormat_repr(HGFormat).
// Maps an HGFormat enum value to its short human-readable string name (used
// for debug/logging of Helium GPU buffer element formats). This is a compiler-
// emitted jump-table lookup: a 44-entry table of PC-relative 32-bit offsets
// (base = the table itself) that yields a `const char*`, with an out-of-range
// guard that returns the literal "unknown format".
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    raw-port/re/disasm/Helium.__Z13HGFormat_repr8HGFormat.s
//
// SYMBOL:
//   __Z13HGFormat_repr8HGFormat  @0x00041220  ; HGFormat_repr(HGFormat)  -> const char*
//
// DISASSEMBLY (verbatim):
//   0000000000041220  pushq  %rbp
//   0000000000041221  movq   %rsp, %rbp
//   0000000000041224  cmpl   $0x2b, %edi              ; compare fmt (edi) with 43
//   0000000000041227  ja     0x4123b                  ; unsigned fmt > 43 -> default
//   0000000000041229  movl   %edi, %eax               ; eax = fmt (zero-extended index)
//   000000000004122b  leaq   0x38a19e(%rip), %rcx     ; rcx = &table @0x3cb3d0
//   0000000000041232  movslq (%rcx,%rax,4), %rax      ; rax = (int32)table[fmt]  (rel offset)
//   0000000000041236  addq   %rcx, %rax               ; rax = table_base + offset = char*
//   0000000000041239  popq   %rbp
//   000000000004123a  retq
//   000000000004123b  leaq   0x38a17e(%rip), %rax     ; rax = &"unknown format" @0x3cb3c0
//   0000000000041242  popq   %rbp
//   0000000000041243  retq
//   0000000000041244  nopw   %cs:(%rax,%rax)           ; alignment padding, not code
//
// DECODE — the jump table:
//   The `leaq 0x38a19e(%rip)` @0x4122b (RIP=0x41232) resolves the table base to
//   VM addr 0x3cb3d0. `movslq (%rcx,%rax,4)` reads a signed 32-bit relative
//   offset table[fmt]; the pointer is `table_base + offset`. The default-string
//   `leaq 0x38a17e(%rip)` @0x4123b (RIP=0x41242) resolves to VM addr 0x3cb3c0 =
//   the C string "unknown format".
//   All 44 table entries + the default were read out of the x86_64 slice
//   (fat fileoff 0x4000) by following each relative offset to its C string
//   (verified via a VM-addr->file-offset dump of the Helium binary). Several
//   in-range indices (9,16,18,26,29,31,32,33,34,35) point at the SAME
//   "unknown format" string — these are gaps in the HGFormat enum that the
//   compiler filled with the default entry. This is a faithful transcription
//   of the exact table contents, not a guessed mapping.
//
// The comparison `cmpl $0x2b,%edi; ja` is UNSIGNED (ja = CF=0&ZF=0 on dst-src,
// i.e. fmt > 43), so any fmt in [0,43] indexes the table and anything else
// (including negative values reinterpreted as large unsigned) returns default.

/** The HGFormat enum is passed as a 32-bit value in %edi. */
export type HGFormat = number;

// The literal table strings, read verbatim from Helium @0x3cb3d0 (base) by
// following each 32-bit relative offset. Index = HGFormat value.
// @0x3cb3d0 (table base) / @0x3cb3c0 ("unknown format").
const HGFORMAT_REPR_TABLE: readonly string[] = [
  /*  0 */ "HGFormat_Null",
  /*  1 */ "V1B",
  /*  2 */ "V1B_M",
  /*  3 */ "V1S",
  /*  4 */ "V1S_M",
  /*  5 */ "V1H",
  /*  6 */ "V1H_M",
  /*  7 */ "V1F",
  /*  8 */ "V1F_M",
  /*  9 */ "unknown format",
  /* 10 */ "V2B",
  /* 11 */ "V2S",
  /* 12 */ "V2H",
  /* 13 */ "V2F",
  /* 14 */ "V2B_YXZX",
  /* 15 */ "V2B_XYXZ",
  /* 16 */ "unknown format",
  /* 17 */ "V3B",
  /* 18 */ "unknown format",
  /* 19 */ "V3S",
  /* 20 */ "V3H",
  /* 21 */ "V3F",
  /* 22 */ "V4B_WXYZ",
  /* 23 */ "V4B_ZYXW",
  /* 24 */ "V4B",
  /* 25 */ "V4S",
  /* 26 */ "unknown format",
  /* 27 */ "V4H",
  /* 28 */ "V4F",
  /* 29 */ "unknown format",
  /* 30 */ "V4S14",
  /* 31 */ "unknown format",
  /* 32 */ "unknown format",
  /* 33 */ "unknown format",
  /* 34 */ "unknown format",
  /* 35 */ "unknown format",
  /* 36 */ "V1S",
  /* 37 */ "V1D",
  /* 38 */ "V2I",
  /* 39 */ "V2D",
  /* 40 */ "V3I",
  /* 41 */ "V3D",
  /* 42 */ "V4I",
  /* 43 */ "V4D",
];

/** Default string returned for out-of-range HGFormat values. @0x3cb3c0 */
const HGFORMAT_REPR_DEFAULT = "unknown format";

/**
 * HGFormat_repr(HGFormat fmt) -> const char*   @Helium 0x00041220
 *
 * `cmpl $0x2b,%edi; ja default` @0x41224 — UNSIGNED range check: if fmt > 43
 * return "unknown format"; otherwise index the 44-entry relative-offset table
 * @0x3cb3d0 (`movslq (%rcx,%rax,4); addq %rcx,%rax` @0x41232) to get the string.
 */
export function HGFormat_repr(fmt: HGFormat): string {
  // Unsigned compare vs 0x2b (43): treat fmt as a uint32 to match `cmpl/ja`.
  const u = fmt >>> 0;
  if (u > 0x2b) {
    return HGFORMAT_REPR_DEFAULT; // leaq @0x4123b
  }
  return HGFORMAT_REPR_TABLE[u]; // table_base + (int32)table[fmt]
}
