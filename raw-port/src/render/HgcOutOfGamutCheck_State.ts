// HgcOutOfGamutCheck_State.ts — Ozone framework (render layer).
//
// FCP `HgcOutOfGamutCheck::State` — the 0x80-byte accumulator block the
// out-of-gamut checker carries across a pass. Its own file per PORTING_SPEC
// Rule 6 / the strict naming rule: it is a distinct FCP class, so it gets the
// `Class_NestedClass` filename already used by siblings in this tree
// (FFDecodeCostInfo_AdjustedPPF.ts, OZChannelBase_Factory.ts, …).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (macOS FCP; x86_64 slice at file offset 0x4000,
//         so every VA below is `file offset - 0x4000`).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS UNIT
// -----------------------------------------------------------------------------
//   * HgcOutOfGamutCheck::State::State()  [C2, base-object ctor]  @Ozone 0x69a490
//     __ZN18HgcOutOfGamutCheck5StateC2Ev
//
// re/disasm:
//   raw-port/re/disasm/__ZN18HgcOutOfGamutCheck5StateC2Ev.s
//
// -----------------------------------------------------------------------------
// FULL DISASM (26 real insns, @0x69a490..0x69a4f5; 0x69a4f6 is padding)
// -----------------------------------------------------------------------------
// Built at -O0, so each 16-byte constant is first parked in a stack slot and
// then re-read before being stored — the round-trips carry no semantics.
//
//   __ZN18HgcOutOfGamutCheck5StateC2Ev:
//     0x69a490  pushq   %rbp
//     0x69a491  movq    %rsp, %rbp
//     0x69a494  movq    %rdi, -0x8(%rbp)        ; this
//     0x69a498  movq    -0x8(%rbp), %rax        ; rax = this
//     -- constant A: all zero ------------------------------------------------
//     0x69a49c  xorps   %xmm0, %xmm0
//     0x69a49f  movaps  %xmm0, -0x20(%rbp)      ; stack round-trip
//     0x69a4a3  movaps  -0x20(%rbp), %xmm0
//     0x69a4a7  movaps  %xmm0, 0x10(%rax)       ; this[+0x10] = A
//     0x69a4ab  movaps  %xmm0, (%rax)           ; this[+0x00] = A
//     -- constant B @0x714560 ------------------------------------------------
//     0x69a4ae  movaps  0x7a0ab(%rip), %xmm0    ; 0x69a4b5 + 0x7a0ab = 0x714560
//     0x69a4b5  movaps  %xmm0, -0x30(%rbp)
//     0x69a4b9  movaps  -0x30(%rbp), %xmm0
//     0x69a4bd  movaps  %xmm0, 0x30(%rax)       ; this[+0x30] = B
//     0x69a4c1  movaps  %xmm0, 0x20(%rax)       ; this[+0x20] = B
//     -- constant C @0x708570 ------------------------------------------------
//     0x69a4c5  movaps  0x6e0a4(%rip), %xmm0    ; 0x69a4cc + 0x6e0a4 = 0x708570
//     0x69a4cc  movaps  %xmm0, -0x40(%rbp)
//     0x69a4d0  movaps  -0x40(%rbp), %xmm0
//     0x69a4d4  movaps  %xmm0, 0x50(%rax)       ; this[+0x50] = C
//     0x69a4d8  movaps  %xmm0, 0x40(%rax)       ; this[+0x40] = C
//     -- constant D @0x714570 ------------------------------------------------
//     0x69a4dc  movaps  0x7a08d(%rip), %xmm0    ; 0x69a4e3 + 0x7a08d = 0x714570
//     0x69a4e3  movaps  %xmm0, -0x50(%rbp)
//     0x69a4e7  movdqa  -0x50(%rbp), %xmm0      ; NOTE: INTEGER-domain reload
//     0x69a4ec  movaps  %xmm0, 0x70(%rax)       ; this[+0x70] = D
//     0x69a4f0  movaps  %xmm0, 0x60(%rax)       ; this[+0x60] = D
//     0x69a4f4  popq    %rbp
//     0x69a4f5  retq
//     0x69a4f6  nopw    %cs:(%rax,%rax)         ; padding, not code
//
// Note the store ORDER within each pair: the HIGHER offset is written first
// (+0x10 before +0x00, +0x30 before +0x20, …). Reproduced below.
//
// No vtable is installed — the ctor never writes a code address into any slot,
// so this class has no virtual functions. No base-class ctor is called, and
// there is no `callq` of any kind: the body is a pure bit-blit.
//
// -----------------------------------------------------------------------------
// THE FOUR CONSTANTS (read straight out of the binary)
// -----------------------------------------------------------------------------
//   A  (xorps, no address)  00000000 00000000 00000000 00000000
//        as f32: { 0.0, 0.0, 0.0, 0.0 }      as u32: { 0, 0, 0, 0 }
//   B  @Ozone 0x714560      00000080 00000080 00000080 00000000
//        as f32: { -0.0, -0.0, -0.0, +0.0 }  as u32: { 2^31, 2^31, 2^31, 0 }
//   C  @Ozone 0x708570      00000000 00000000 00000000 0000803f
//        as f32: { 0.0, 0.0, 0.0, 1.0 }      as u32: { 0, 0, 0, 0x3f800000 }
//   D  @Ozone 0x714570      ffffffff 00000000 00000000 00000000
//        as f32: { NaN, 0.0, 0.0, 0.0 }      as i32: { -1, 0, 0, 0 }
//
// WHICH READING EACH ONE GETS, and why:
//   * B is float. The only difference between its lanes and all-zero is the
//     SIGN bit; as an integer that is a meaningless 2^31, whereas as f32 it is
//     the canonical negative-zero triple.
//   * C is float. 0x3f800000 in lane 3 is exactly 1.0f — a w = 1 homogeneous
//     coordinate / opaque alpha. As an integer it would be an arbitrary
//     1065353216.
//   * D is INTEGER, and the machine says so directly: its reload @0x69a4e7 is
//     `movdqa` (integer domain) while every other reload in the function is
//     `movaps` (float domain). Clang picks the domain from the constant's
//     declared type, so D is an integer vector — { -1, 0, 0, 0 }, an all-ones
//     lane-0 mask. Reading it as f32 would make lane 0 a NaN.
//   * A is written by `xorps` with no constant-pool entry and is bit-identical
//     under either reading; it is typed float here to match its neighbours.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT
// -----------------------------------------------------------------------------
//   HgcOutOfGamutCheck::State {          // sizeof = 0x80 (the ctor fills
//     +0x00  float32x4  slot00 = A       //  0x00..0x7f exactly, no gaps)
//     +0x10  float32x4  slot10 = A
//     +0x20  float32x4  slot20 = B
//     +0x30  float32x4  slot30 = B
//     +0x40  float32x4  slot40 = C
//     +0x50  float32x4  slot50 = C
//     +0x60  int32x4    slot60 = D
//     +0x70  int32x4    slot70 = D
//   }
// The eight slots are written with `movaps`, which FAULTS on a misaligned
// address — so every slot, and `State` itself, is 16-byte aligned.
//
// The slots are named POSITIONALLY, not semantically. This ctor is the only
// unit decoded so far and it shows what each slot is seeded with, never what
// any slot MEANS; the constants pair up (A,A) (B,B) (C,C) (D,D), which is
// consistent with four two-vector records, but nothing here proves that
// grouping. Per PORTING_SPEC Rule 5 the offsets are documented and no semantic
// name is invented; the units that READ these slots will pin the meanings.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero. The body has no `callq`, no `jmp` to a stub, and no indirect or
// virtual call — 26 instructions of constant materialisation and stores.
// `depgraph.py deps __ZN18HgcOutOfGamutCheck5StateC2Ev` reports nothing at all
// (0 in-scope callees, 0 externs, 0 indirect) — a wave-0 leaf.
//
// -----------------------------------------------------------------------------
// NUMERICS
// -----------------------------------------------------------------------------
// The float slots are SINGLE precision (`movaps` over 4x f32 lanes), so they
// are `Float32Array`, which rounds exactly like the hardware; Math.fround is
// unnecessary because the values are stored, never computed. The `-0.0` lanes
// of constant B are written as `-0` so the sign bit survives — the commit
// message records the resulting bit patterns checked against the bytes above.

/**
 * Constant B — the 16 bytes at @Ozone 0x714560, loaded @0x69a4ae and stored to
 * slots +0x20 and +0x30. Raw: `00000080 00000080 00000080 00000000`, i.e. the
 * f32 quad { -0.0, -0.0, -0.0, +0.0 }.
 */
const HGOOG_STATE_CONST_B: readonly number[] = Object.freeze([-0, -0, -0, 0]);

/**
 * Constant C — the 16 bytes at @Ozone 0x708570, loaded @0x69a4c5 and stored to
 * slots +0x40 and +0x50. Raw: `00000000 00000000 00000000 0000803f`, i.e. the
 * f32 quad { 0.0, 0.0, 0.0, 1.0 } (0x3f800000 == 1.0f).
 */
const HGOOG_STATE_CONST_C: readonly number[] = Object.freeze([0, 0, 0, 1]);

/**
 * Constant D — the 16 bytes at @Ozone 0x714570, loaded @0x69a4dc and reloaded
 * in the INTEGER domain by `movdqa` @0x69a4e7, then stored to slots +0x60 and
 * +0x70. Raw: `ffffffff 00000000 00000000 00000000`, i.e. the i32 quad
 * { -1, 0, 0, 0 }.
 */
const HGOOG_STATE_CONST_D: readonly number[] = Object.freeze([-1, 0, 0, 0]);

/**
 * `HgcOutOfGamutCheck::State` — the 0x80-byte, 16-byte-aligned accumulator
 * block of Ozone's out-of-gamut checker.
 *
 * Only the C2 base-object constructor is transcribed in this file. Every other
 * member of the class is a separate ledger unit and must be ADDED here as it
 * lands, without disturbing what is present.
 */
export class HgcOutOfGamutCheck_State {
  /** +0x00 — 4x f32; seeded with constant A (all zero) @0x69a4ab. */
  readonly slot00 = new Float32Array(4);
  /** +0x10 — 4x f32; seeded with constant A (all zero) @0x69a4a7. */
  readonly slot10 = new Float32Array(4);
  /** +0x20 — 4x f32; seeded with constant B @0x69a4c1. */
  readonly slot20 = new Float32Array(4);
  /** +0x30 — 4x f32; seeded with constant B @0x69a4bd. */
  readonly slot30 = new Float32Array(4);
  /** +0x40 — 4x f32; seeded with constant C @0x69a4d8. */
  readonly slot40 = new Float32Array(4);
  /** +0x50 — 4x f32; seeded with constant C @0x69a4d4. */
  readonly slot50 = new Float32Array(4);
  /** +0x60 — 4x i32; seeded with constant D @0x69a4f0. */
  readonly slot60 = new Int32Array(4);
  /** +0x70 — 4x i32; seeded with constant D @0x69a4ec. */
  readonly slot70 = new Int32Array(4);

  /**
   * `HgcOutOfGamutCheck::State::State()` [C2, base-object ctor]
   *   — @Ozone 0x69a490 (__ZN18HgcOutOfGamutCheck5StateC2Ev).
   *
   * Faithful transcription of the 26-instruction body quoted in the header:
   * materialise four 16-byte constants and blit each into two adjacent
   * 16-byte slots, higher offset first. Nothing else happens — no base ctor,
   * no vtable install, no call of any kind.
   *
   * The per-constant stack round-trips at -0x20/-0x30/-0x40/-0x50(%rbp) are
   * -O0 spill/reload artefacts with no observable effect and are not modelled.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN18HgcOutOfGamutCheck5StateC2Ev.s
   */
  constructor() {
    // @0x69a49c  xorps %xmm0,%xmm0 — constant A is all-zero.
    // @0x69a4a7  this[+0x10] = A   (written BEFORE +0x00)
    this.slot10.fill(0);
    // @0x69a4ab  this[+0x00] = A
    this.slot00.fill(0);

    // @0x69a4ae  xmm0 = *(16B @0x714560) = B
    // @0x69a4bd  this[+0x30] = B
    this.slot30.set(HGOOG_STATE_CONST_B);
    // @0x69a4c1  this[+0x20] = B
    this.slot20.set(HGOOG_STATE_CONST_B);

    // @0x69a4c5  xmm0 = *(16B @0x708570) = C
    // @0x69a4d4  this[+0x50] = C
    this.slot50.set(HGOOG_STATE_CONST_C);
    // @0x69a4d8  this[+0x40] = C
    this.slot40.set(HGOOG_STATE_CONST_C);

    // @0x69a4dc  xmm0 = *(16B @0x714570) = D   (reloaded by movdqa @0x69a4e7)
    // @0x69a4ec  this[+0x70] = D
    this.slot70.set(HGOOG_STATE_CONST_D);
    // @0x69a4f0  this[+0x60] = D
    this.slot60.set(HGOOG_STATE_CONST_D);
  }
}
