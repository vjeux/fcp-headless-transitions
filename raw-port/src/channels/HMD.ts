// HMD — ProCore class whose two visible ctor symbols are the Itanium
// complete-object (C1) and base-object (C2) ctors.  C1 tail-jumps into C2;
// C2 carries the full zero-init body.
//
//   0x000000000002f158  HMD::HMD()  (C1, complete-object)
//   0x000000000002f04a  HMD::HMD()  (C2, base-object)
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.HMD.ctor_C1.s  (@0x2f158)
//   raw-port/re/disasm/ProCore.HMD.ctor_C2.s  (@0x2f04a)
// Framework: Final Cut Pro / ProCore.framework.
//
// ── DECODED STRUCT LAYOUT ────────────────────────────────────────────────
// Every offset below is pinned by the exact instruction that writes to it.
// The ctor is a giant zero-init pass with two nested matrix loops and one
// record-array loop; that lets us pin every field slot the ctor touches
// (though nothing forces us to name it precisely — a future accessor port
// will add semantics, this port only pins offsets, widths, and initial
// values).  Total decoded footprint: `sizeof(HMD) >= 0x758`.
//
// +0x000..+0x00F  (16 B)          `movups %xmm0, (%rdi)` @0x2f051
//                                  — head 16 bytes zeroed (very likely a
//                                    vtable-pointer slot + something; the
//                                    ctor doesn't install a vtable, which
//                                    would be surprising — but the field is
//                                    left as raw zero here per the asm).
// +0x010..+0x50F  (0x500 = 1280 B) — the "record array" (loop 3 below).
//                                    16 records × 0x50-byte stride.
// +0x510..+0x52F  (32 B)          `movups %xmm0, 0x510(%rdi)` @0x2f054
//                                  `movups %xmm0, 0x520(%rdi)` @0x2f05b
//                                  — 32 bytes zeroed.
// +0x530..+0x62F  (256 B)         — 2 × 4x4 double IDENTITY matrices
//                                    (loop 1 below).
// +0x630..+0x64F  (32 B)          `movups %xmm0, 0x630(%rdi)` @0x2f0bd
//                                  `movups %xmm0, 0x640(%rdi)` @0x2f0b6
//                                  — 32 bytes zeroed.
// +0x650..+0x74F  (256 B)         — 2 × 4x4 double IDENTITY matrices
//                                    (loop 2 below).
// +0x750..+0x757  (8 B)           `movq $0x0, 0x750(%rdi)` @0x2f10b
//                                  — 8-byte null pointer.
//
// Loop 3 — the record array (@0x2f116-@0x2f154).
//   The compiler codes this as an offset counter `rax` walking from 0x5d
//   to 0x55d in 0x50 strides, so a record covers `[base+rax-0x4d, base+rax)`
//   for a given `rax`. Iteration count = (0x55d - 0x5d) / 0x50 = 16.
//   Per-record layout (offsets are relative to the START of each record):
//     +0x00..+0x0F  xmm0 zero      @0x2f128 (`-0x3d(%rdi,%rax)` == start-0x00)
//     +0x10..+0x1F  xmm0 zero      @0x2f123 (`-0x2d`, i.e. start+0x10)
//     +0x20..+0x2F  xmm0 zero      @0x2f11e (`-0x1d`, i.e. start+0x20)
//     +0x30..+0x3F  xmm0 zero      @0x2f12d (`-0x4d`? — reordered store; see
//                                  the "asm reorder" note below).
//     +0x40..+0x47  quad zero      @0x2f132 (`movq $0x0, -0xd(%rdi,%rax)`).
//     +0x48..+0x4B  uint32 = 1     @0x2f13b (`movl $0x1, -0x5(%rdi,%rax)`).
//     +0x4C..+0x4D  uint16 zero    @0x2f143 (`movw $0x0, -0x1(%rdi,%rax)`).
//     +0x4E..+0x4F  (unwritten padding to the 0x50 stride).
//   NOTE on ordering: the asm stores the four xmm0-slots in order -0x1d, -0x2d,
//   -0x3d, -0x4d (DESCENDING negative displacements → ASCENDING absolute
//   offsets 0x20, 0x10, 0x00, then a wraparound to 0x30 via the -0x4d slot
//   which mathematically is rax-0x4d = record-start when rax starts at 0x5d).
//   Every one of those stores writes the SAME 16-byte zero vector, so their
//   order is observationally irrelevant — we express the record init in a
//   readable order.
// Loops 1+2 — the four 4x4 identity double matrices.
//   Each 128-byte block:
//     off +0x00, +0x28, +0x50, +0x78  →  1.0 double (`movq %rax,...`  with
//                                        %rax = 0x3ff0000000000000).
//     off +0x08, +0x18, +0x30, +0x40,
//         +0x58, +0x68                →  xmm0 = 0 (`movups %xmm0,...`).
//   The diagonal offsets 0, 40, 80, 120 are the row-major positions of the
//   4x4-identity's diagonal on 8-byte doubles (row r, col c) → r*32 + c*8.
//   The zero-slot offsets fill the remaining 12 doubles.  This IS a 4x4
//   identity matrix laid out row-major in doubles.
//
// ── FRONTIER CALLEES (none) ──────────────────────────────────────────────
// Neither C1 nor C2 makes any external call.  No throw-stubs needed.

/**
 * The 4×4 double identity matrix laid out in row-major order — exactly
 * what the ctor's inner loop writes to each 128-byte block at +0x530,
 * +0x5B0, +0x650, +0x6D0.  Values pinned by the movq at @0x2f06b
 * (`movabsq $0x3ff0000000000000, %rax` — the IEEE-754 bit pattern of 1.0
 * as a double) and the zeroing xorps at @0x2f04e.
 */
export type HMDMat4d = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

/** Fresh 4×4 identity mirror.  Layout matches the ctor's block init. */
function makeIdentity4d(): HMDMat4d {
  // @0x2f084 (+0x00) = 1.0    (row 0, col 0)
  // @0x2f088 (+0x08) = 0      (row 0, cols 1-2 as xmm0[0:16] = 2 doubles)
  // @0x2f08d (+0x18) = 0      (row 0, col 3 + row 1, col 0)
  // @0x2f07f (+0x28) = 1.0    (row 1, col 1)
  // @0x2f092 (+0x30) = 0      (row 1, cols 2-3)
  // @0x2f097 (+0x40) = 0      (row 2, cols 0-1)
  // @0x2f07a (+0x50) = 1.0    (row 2, col 2)
  // @0x2f09c (+0x58) = 0      (row 2, col 3 + row 3, col 0)
  // @0x2f0a1 (+0x68) = 0      (row 3, cols 1-2)
  // @0x2f075 (+0x78) = 1.0    (row 3, col 3)
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ];
}

/**
 * The 80-byte record type that loop 3 initialises.  Field names are
 * placeholders — the ctor writes bytes but the semantics come from the
 * accessors (not decoded in this port).  Every offset is pinned to the
 * instruction that writes it.
 */
export interface HMDRecord {
  /** +0x00..+0x0F — 16-byte zero block. */
  slot00: Uint8Array; // length 16
  /** +0x10..+0x1F — 16-byte zero block. */
  slot10: Uint8Array; // length 16
  /** +0x20..+0x2F — 16-byte zero block. */
  slot20: Uint8Array; // length 16
  /** +0x30..+0x3F — 16-byte zero block. */
  slot30: Uint8Array; // length 16
  /** +0x40..+0x47 — 8-byte zero. */
  q40: bigint;
  /** +0x48..+0x4B — uint32, initialised to 1 (@0x2f13b `movl $0x1,-0x5(...)`). */
  u48: number;
  /** +0x4C..+0x4D — 16-bit zero (@0x2f143 `movw $0x0,-0x1(...)`). */
  w4c: number;
  // +0x4E..+0x4F is stride padding — unwritten in the ctor and left
  // uninitialised in the native heap (the compiler didn't insert a fill).
}

/** Fresh zero-record with `u48 = 1` and everything else zero. */
function makeHMDRecord(): HMDRecord {
  return {
    slot00: new Uint8Array(16),
    slot10: new Uint8Array(16),
    slot20: new Uint8Array(16),
    slot30: new Uint8Array(16),
    q40: 0n,
    u48: 1, // @0x2f13b — the ONLY non-zero field in the record.
    w4c: 0,
  };
}

/**
 * `HMD` — ProCore class with a giant zero-init ctor.  Only the ctor is in
 * scope for this port; every accessor and virtual method is a separate
 * raw-port unit.
 */
export class HMD {
  /** +0x000..+0x00F — 16-byte zero head (see LAYOUT). */
  public head: Uint8Array; // length 16

  /** +0x010..+0x50F — 16-entry record array (see loop 3). */
  public records: HMDRecord[];

  /** +0x510..+0x52F — 32-byte zero gap (see LAYOUT). */
  public gap510: Uint8Array; // length 32

  /** +0x530..+0x5AF — first 4x4 identity double matrix (loop 1 iter 0). */
  public matA0: HMDMat4d;
  /** +0x5B0..+0x62F — second 4x4 identity double matrix (loop 1 iter 1). */
  public matA1: HMDMat4d;

  /** +0x630..+0x64F — 32-byte zero gap. */
  public gap630: Uint8Array; // length 32

  /** +0x650..+0x6CF — third 4x4 identity double matrix (loop 2 iter 0). */
  public matB0: HMDMat4d;
  /** +0x6D0..+0x74F — fourth 4x4 identity double matrix (loop 2 iter 1). */
  public matB1: HMDMat4d;

  /** +0x750..+0x757 — 8-byte null pointer (@0x2f10b `movq $0x0, 0x750(%rdi)`). */
  public ptr750: bigint;

  /**
   * `HMD::HMD()` @ProCore 0x2f04a (C2, base-object).  The complete-object
   * ctor C1 @0x2f158 is a two-instruction stub that tail-jumps into this
   * body (`pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp __ZN3HMDC2Ev`), so
   * both symbols share this exact implementation.
   *
   * Mirrors the full instruction stream:
   *   @0x2f04e-@0x2f05b  zero +0x00..+0x0F, +0x510..+0x52F.
   *   @0x2f062-@0x2f0b1  loop 1: initialise 2 × 128-byte identity matrices
   *                              at +0x530 and +0x5B0.
   *   @0x2f0b3-@0x2f0bd  zero +0x630..+0x64F.
   *   @0x2f0c4-@0x2f109  loop 2: initialise 2 × 128-byte identity matrices
   *                              at +0x650 and +0x6D0.
   *   @0x2f10b            zero +0x750.
   *   @0x2f116-@0x2f154  loop 3: initialise 16 × 80-byte records at +0x010.
   *   @0x2f156-@0x2f157  epilogue.
   *
   * Note the machine's `movabsq $0x3ff0000000000000, %rax` @0x2f06b loads
   * the IEEE-754 double `1.0` as a 64-bit immediate and REUSES the same %rax
   * in loop 2's diagonal stores (@0x2f0cd..@0x2f0dc) without reloading —
   * that's why loop 2 doesn't need its own `movabsq`.  Both loops produce
   * identical identity matrices.
   */
  constructor() {
    // @0x2f04e-@0x2f051 — xorps %xmm0,%xmm0; movups %xmm0,(%rdi) — head 16 B zero.
    this.head = new Uint8Array(16);

    // @0x2f054-@0x2f05b — movups %xmm0,0x510(%rdi); movups %xmm0,0x520(%rdi).
    this.gap510 = new Uint8Array(32);

    // ── Loop 1 (@0x2f062-@0x2f0b1) — two 4x4 identity matrices at +0x530 ──
    //   %rcx = self + 0x530.  %rdx iterates 0, 0x80 (matches `cmpq $0x100`
    //   sentinel + `subq $-0x80` = `+= 0x80`).  Each iteration writes the
    //   16 doubles of one 4x4 identity into `[rcx+rdx .. rcx+rdx+0x80)`.
    this.matA0 = makeIdentity4d(); // @rdx=0    → offset +0x530
    this.matA1 = makeIdentity4d(); // @rdx=0x80 → offset +0x5B0

    // @0x2f0b3-@0x2f0bd — zero +0x630..+0x64F.
    this.gap630 = new Uint8Array(32);

    // ── Loop 2 (@0x2f0c4-@0x2f109) — two 4x4 identity matrices at +0x650 ──
    this.matB0 = makeIdentity4d(); // @rdx=0    → offset +0x650
    this.matB1 = makeIdentity4d(); // @rdx=0x80 → offset +0x6D0

    // @0x2f10b — movq $0x0, 0x750(%rdi) — null 8-byte pointer.
    this.ptr750 = 0n;

    // ── Loop 3 (@0x2f116-@0x2f154) — 16 records × 0x50 bytes at +0x010 ──
    //   `%eax = 0x5d`, iterate `subq $-0x50` (i.e. += 0x50) until `%rax ==
    //   0x55d`.  16 iterations.  Each iteration writes 78 bytes of a 80-byte
    //   record (the top 2 bytes are stride padding).
    this.records = [];
    for (let i = 0; i < 16; i += 1) {
      this.records.push(makeHMDRecord());
    }
    // @0x2f156-@0x2f157 — popq %rbp; retq.
  }
}
