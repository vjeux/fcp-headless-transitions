// raw-port: HgcCombineFields::State (Ozone.framework) — the base-object constructor.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * HgcCombineFields::State::State()  [C2, base-object ctor]  @Ozone 0x69fca0
//     __ZN16HgcCombineFields5StateC2Ev
//     re/disasm: raw-port/re/disasm/__ZN16HgcCombineFields5StateC2Ev.s  (79 lines)
//
// `HgcCombineFields::State` is the uniform block for Ozone's field-combining
// (interlace weave) compute node; the Hgc* family are GPU kernel nodes and each
// carries a nested `State` holding the kernel's uniforms. This ctor is a PURE
// CONSTANT FILL: it writes 0x200 bytes and calls nothing.
//
// FRONTIER CALLEES — none. The 79-line body contains no `callq`, no symbol
// stub and no indirect/virtual dispatch: every instruction is a literal load,
// a frame spill/reload, or a 16-byte store.
//
// -----------------------------------------------------------------------------
// SHAPE OF THE BODY — sixteen PAIRS of identical 16-byte stores
// -----------------------------------------------------------------------------
// The ctor fills 0x200 = 512 bytes = 32 sixteen-byte slots as SIXTEEN PAIRS:
// each pair puts ONE 16-byte value into BOTH slots of a 32-byte group, storing
// the HIGH half first. The recurring shape (here the pair at +0x40/+0x50) is:
//
//   0x69fce1  movaps 0x6e3e8(%rip), %xmm1    ; load the literal
//   0x69fce8  movaps %xmm1, -0x40(%rbp)      ; spill to the frame
//   0x69fcec  movaps -0x40(%rbp), %xmm0      ; reload it, unchanged
//   0x69fcf0  movaps %xmm0, 0x50(%rax)       ; store the HIGH half first
//   0x69fcf4  movaps %xmm0, 0x40(%rax)       ; then the LOW half
//
// The spill/reload round trip through `-0x20(%rbp)` … `-0x110(%rbp)` is an
// unoptimised-codegen artifact: the value written is the value read back, so it
// moves no data. It is not modelled — modelling it would change nothing, and
// inventing frame storage the object does not have would be worse than
// transcribing the effect. `%rax` is `this`, reloaded from the spill slot at
// -0x8(%rbp) (@0x69fcab/@0x69fcaf) before the first store.
//
// REGISTER REUSE — the reason only SEVEN literals cover sixteen pairs: `%xmm3`,
// `%xmm2` and `%xmm1` are each loaded ONCE (@0x69fcb3, @0x69fcca, @0x69fce1)
// and then re-spilled/reloaded for the later groups, so the FIRST TWELVE pairs
// cycle the same four values (xmm3, xmm2, xmm1, the 0x708570 literal) three
// times over +0x000..+0x17f. Pairs 13-15 load three fresh literals and pair 16
// stores the `xorps`-zeroed register.
//
// -----------------------------------------------------------------------------
// THE SEVEN LITERALS — resolved, not guessed
// -----------------------------------------------------------------------------
// Each RIP-relative operand was resolved as VA = instr_addr + instr_len + disp
// (raw-port/army/tools/resolve.py Ozone ripconst) and the bytes at that VA read
// straight out of the Ozone x86_64 slice. Instruction lengths come from the
// address delta to the next instruction: 8 for the `movss` load, 7 for each
// `movaps` load.
//
//   pair   dst slots        reg    instr      VA          16-byte value (u32 words)
//   ----   --------------   ----   --------   --------    -------------------------
//    1     +0x000/+0x010    xmm3   0x69fcb3   0x706f50    3f800000 00000000 00000000 00000000
//    2     +0x020/+0x030    xmm2   0x69fcca   0x70bae0    00000000 3f800000 00000000 00000000
//    3     +0x040/+0x050    xmm1   0x69fce1   0x70e0d0    00000000 00000000 3f800000 00000000
//    4     +0x060/+0x070    xmm0   0x69fcf8   0x708570    00000000 00000000 00000000 3f800000
//    5     +0x080/+0x090    xmm3   (reused)   0x706f50    3f800000 00000000 00000000 00000000
//    6     +0x0a0/+0x0b0    xmm2   (reused)   0x70bae0    00000000 3f800000 00000000 00000000
//    7     +0x0c0/+0x0d0    xmm1   (reused)   0x70e0d0    00000000 00000000 3f800000 00000000
//    8     +0x0e0/+0x0f0    xmm0   (reused)   0x708570    00000000 00000000 00000000 3f800000
//    9     +0x100/+0x110    xmm3   (reused)   0x706f50    3f800000 00000000 00000000 00000000
//   10     +0x120/+0x130    xmm2   (reused)   0x70bae0    00000000 3f800000 00000000 00000000
//   11     +0x140/+0x150    xmm1   (reused)   0x70e0d0    00000000 00000000 3f800000 00000000
//   12     +0x160/+0x170    xmm0   (reused)   0x708570    00000000 00000000 00000000 3f800000
//   13     +0x180/+0x190    xmm0   0x69fddd   0x714450    3f800000 3f000000 00000000 00000000
//   14     +0x1a0/+0x1b0    xmm0   0x69fe00   0x7145a0    3e800000 3e000000 00000000 00000000
//   15     +0x1c0/+0x1d0    xmm0   0x69fe23   0x7145b0    ffffffff ffffffff 00000000 00000000
//   16     +0x1e0/+0x1f0    xmm0   xorps      —           00000000 00000000 00000000 00000000
//
// Pair 1's load is `movss`, a FOUR-byte load whose register form zero-extends
// (clearing bits 32..127) — so even though the 16 bytes at 0x706f50 are
// `3f800000 3f000000 3ba3d70a 447a0000` (a shared scalar-pool region:
// 1.0, 0.5, 0.005, 1000.0), the value that reaches the object is
// (1.0, 0, 0, 0). Reading all 16 bytes there would be the classic mis-decode;
// the width of the instruction is what decides.
//
// The first twelve pairs are therefore the four rows of a 4x4 IDENTITY matrix
// — (1,0,0,0), (0,1,0,0), (0,0,1,0), (0,0,0,1) — laid down THREE times, each
// row duplicated into two adjacent 16-byte slots. That is consistent with three
// per-field colour/transform matrices being reset to identity, but no consumer
// of these slots is ported yet, so the port records the exact bytes and the
// pair structure rather than naming uniforms it cannot ground (Rule 5).
//
// -----------------------------------------------------------------------------
// WHY THE OBJECT IS MODELLED AS RAW 32-BIT WORDS
// -----------------------------------------------------------------------------
// Pair 15's literal is `ffffffff ffffffff 00000000 00000000` — an all-ones lane
// MASK, not a float. Storing it through a JS `number` would round-trip the bit
// pattern through an IEEE-754 NaN and could silently change its payload bits,
// exactly the corruption Rule 4 exists to prevent. The State is therefore a
// 512-byte buffer written as exact u32 words, with a Float32Array view for the
// consumers that read it as floats. Both views alias the SAME bytes, so the
// object is bit-identical to FCP's.

/** One 16-byte SSE literal as its four little-endian 32-bit words — the exact
 *  bytes `movaps`/`movss` puts in the register, before any float
 *  interpretation. */
type Xmm128 = readonly [number, number, number, number];

/** @0xADDR Ozone 0x706f50 — loaded by `movss 0x67295(%rip), %xmm3` @0x69fcb3.
 *  A 4-byte scalar load, so lanes 1..3 are zeroed BY THE INSTRUCTION.
 *  As f32: (1, 0, 0, 0). */
const K_0x706f50_movss: Xmm128 = [0x3f800000, 0x00000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x70bae0 — loaded by `movaps 0x6be0f(%rip), %xmm2` @0x69fcca.
 *  As f32: (0, 1, 0, 0). */
const K_0x70bae0: Xmm128 = [0x00000000, 0x3f800000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x70e0d0 — loaded by `movaps 0x6e3e8(%rip), %xmm1` @0x69fce1.
 *  As f32: (0, 0, 1, 0). */
const K_0x70e0d0: Xmm128 = [0x00000000, 0x00000000, 0x3f800000, 0x00000000];

/** @0xADDR Ozone 0x708570 — loaded by `movaps 0x68871(%rip), %xmm0` @0x69fcf8.
 *  As f32: (0, 0, 0, 1) — the homogeneous w-unit row. Shared constant-pool
 *  region (the same literal HgcZebraStripe::State's pair 11 loads). */
const K_0x708570: Xmm128 = [0x00000000, 0x00000000, 0x00000000, 0x3f800000];

/** @0xADDR Ozone 0x714450 — loaded by `movaps 0x7466c(%rip), %xmm0` @0x69fddd.
 *  As f32: (1, 0.5, 0, 0). */
const K_0x714450: Xmm128 = [0x3f800000, 0x3f000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x7145a0 — loaded by `movaps 0x74799(%rip), %xmm0` @0x69fe00.
 *  As f32: (0.25, 0.125, 0, 0) — the same ratio pair as K_0x714450 scaled by
 *  1/4 (both are exact binary fractions, so no rounding is involved). */
const K_0x7145a0: Xmm128 = [0x3e800000, 0x3e000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x7145b0 — loaded by `movaps 0x74786(%rip), %xmm0` @0x69fe23.
 *  Lanes 0..1 are 0xffffffff (all-ones lane mask), lanes 2..3 are zero. BIT
 *  PATTERNS, not floats — the classic "select xy, drop zw" SSE mask. */
const K_0x7145b0: Xmm128 = [0xffffffff, 0xffffffff, 0x00000000, 0x00000000];

/** The zero register: `xorps %xmm0, %xmm0` @0x69fe46, stored by the last pair. */
const XMM_ZERO: Xmm128 = [0x00000000, 0x00000000, 0x00000000, 0x00000000];

/** Total size of the object this ctor fills: the last store lands at +0x1f0 and
 *  is 16 bytes wide, so the ctor writes exactly 0x200 bytes and never beyond. */
export const HGC_COMBINE_FIELDS_STATE_SIZE = 0x200;

/**
 * `HgcCombineFields::State` — the 0x200-byte uniform block this ctor fills.
 *
 * Every byte is modelled, none of it is named: the ctor writes sixteen 32-byte
 * groups of undifferentiated 16-byte slots and reveals no field boundaries
 * beyond that pairing, so per Rule 5 the port records the exact bytes and the
 * pair structure rather than inventing uniform names. Whichever
 * `HgcCombineFields` method consumes these slots is a separate ledger unit and
 * will ground the field names when it is transcribed.
 *
 * `u32` and `f32` are two views over the SAME `ArrayBuffer`, so a consumer may
 * read a slot as four floats while the stored bit patterns (the all-ones mask
 * in pair 15) stay exactly what the binary wrote.
 *
 * @0xADDR Ozone 0x69fca0
 */
export class HgcCombineFields_State {
  /** The raw 0x200 bytes. Zero-filled at allocation, which is what the final
   *  `%xmm0` pair would have written anyway. */
  readonly bytes: ArrayBuffer = new ArrayBuffer(HGC_COMBINE_FIELDS_STATE_SIZE);
  /** 32-bit-word view — the authoritative one; stores go through it so bit
   *  patterns survive verbatim. 128 words = 0x200 bytes. */
  readonly u32: Uint32Array = new Uint32Array(this.bytes);
  /** float32 view over the same bytes, for consumers that read uniforms. */
  readonly f32: Float32Array = new Float32Array(this.bytes);

  /**
   * `movaps %xmm, <byteOffset>(%rax)` — a 16-byte aligned store of the four
   * words currently in the register. This models the x86 INSTRUCTION, not any
   * FCP function; it exists so each of the 32 stores below can cite its own
   * address without repeating four index expressions.
   */
  private store128(byteOffset: number, v: Xmm128): void {
    const w = byteOffset >>> 2;
    this.u32[w] = v[0] >>> 0;
    this.u32[w + 1] = v[1] >>> 0;
    this.u32[w + 2] = v[2] >>> 0;
    this.u32[w + 3] = v[3] >>> 0;
  }

  /**
   * `HgcCombineFields::State::State()` [C2] — @Ozone 0x69fca0.
   *
   * The thirty-two stores below are in the binary's exact order: within each
   * pair the HIGH slot is written before the LOW one, and the pairs run from
   * +0x000 upward. Prologue (@0x69fca0-@0x69fcaf: frame setup, `subq $0x90`,
   * `this` spilled to -0x8(%rbp) and reloaded into %rax) and epilogue
   * (@0x69fe65-@0x69fe6d) have no TS counterpart; the per-pair spill/reload
   * through the frame is a no-op and is not modelled (see the file header).
   */
  constructor() {
    // pair 1 — xmm3 = movss @0x706f50 (@0x69fcb3)
    this.store128(0x010, K_0x706f50_movss); // @0x69fcc3  movaps %xmm0, 0x10(%rax)
    this.store128(0x000, K_0x706f50_movss); // @0x69fcc7  movaps %xmm0, (%rax)
    // pair 2 — xmm2 = movaps @0x70bae0 (@0x69fcca)
    this.store128(0x030, K_0x70bae0); // @0x69fcd9  movaps %xmm0, 0x30(%rax)
    this.store128(0x020, K_0x70bae0); // @0x69fcdd  movaps %xmm0, 0x20(%rax)
    // pair 3 — xmm1 = movaps @0x70e0d0 (@0x69fce1)
    this.store128(0x050, K_0x70e0d0); // @0x69fcf0  movaps %xmm0, 0x50(%rax)
    this.store128(0x040, K_0x70e0d0); // @0x69fcf4  movaps %xmm0, 0x40(%rax)
    // pair 4 — xmm0 = movaps @0x708570 (@0x69fcf8)
    this.store128(0x070, K_0x708570); // @0x69fd07  movaps %xmm4, 0x70(%rax)
    this.store128(0x060, K_0x708570); // @0x69fd0b  movaps %xmm4, 0x60(%rax)
    // pair 5 — xmm3 re-spilled/reloaded (@0x69fd0f/@0x69fd13), same literal
    this.store128(0x090, K_0x706f50_movss); // @0x69fd17  movaps %xmm4, 0x90(%rax)
    this.store128(0x080, K_0x706f50_movss); // @0x69fd1e  movaps %xmm4, 0x80(%rax)
    // pair 6 — xmm2 re-spilled/reloaded (@0x69fd25/@0x69fd29)
    this.store128(0x0b0, K_0x70bae0); // @0x69fd2d  movaps %xmm4, 0xb0(%rax)
    this.store128(0x0a0, K_0x70bae0); // @0x69fd34  movaps %xmm4, 0xa0(%rax)
    // pair 7 — xmm1 re-spilled/reloaded (@0x69fd3b/@0x69fd3f)
    this.store128(0x0d0, K_0x70e0d0); // @0x69fd43  movaps %xmm4, 0xd0(%rax)
    this.store128(0x0c0, K_0x70e0d0); // @0x69fd4a  movaps %xmm4, 0xc0(%rax)
    // pair 8 — xmm0 re-spilled/reloaded (@0x69fd51/@0x69fd58)
    this.store128(0x0f0, K_0x708570); // @0x69fd5f  movaps %xmm4, 0xf0(%rax)
    this.store128(0x0e0, K_0x708570); // @0x69fd66  movaps %xmm4, 0xe0(%rax)
    // pair 9 — xmm3 again (@0x69fd6d/@0x69fd74)
    this.store128(0x110, K_0x706f50_movss); // @0x69fd7b  movaps %xmm3, 0x110(%rax)
    this.store128(0x100, K_0x706f50_movss); // @0x69fd82  movaps %xmm3, 0x100(%rax)
    // pair 10 — xmm2 again (@0x69fd89/@0x69fd90)
    this.store128(0x130, K_0x70bae0); // @0x69fd97  movaps %xmm2, 0x130(%rax)
    this.store128(0x120, K_0x70bae0); // @0x69fd9e  movaps %xmm2, 0x120(%rax)
    // pair 11 — xmm1 again (@0x69fda5/@0x69fdac)
    this.store128(0x150, K_0x70e0d0); // @0x69fdb3  movaps %xmm1, 0x150(%rax)
    this.store128(0x140, K_0x70e0d0); // @0x69fdba  movaps %xmm1, 0x140(%rax)
    // pair 12 — xmm0 again (@0x69fdc1/@0x69fdc8)
    this.store128(0x170, K_0x708570); // @0x69fdcf  movaps %xmm0, 0x170(%rax)
    this.store128(0x160, K_0x708570); // @0x69fdd6  movaps %xmm0, 0x160(%rax)
    // pair 13 — xmm0 = movaps @0x714450 (@0x69fddd)
    this.store128(0x190, K_0x714450); // @0x69fdf2  movaps %xmm0, 0x190(%rax)
    this.store128(0x180, K_0x714450); // @0x69fdf9  movaps %xmm0, 0x180(%rax)
    // pair 14 — xmm0 = movaps @0x7145a0 (@0x69fe00)
    this.store128(0x1b0, K_0x7145a0); // @0x69fe15  movaps %xmm0, 0x1b0(%rax)
    this.store128(0x1a0, K_0x7145a0); // @0x69fe1c  movaps %xmm0, 0x1a0(%rax)
    // pair 15 — xmm0 = movaps @0x7145b0 (@0x69fe23) — the all-ones lane mask
    this.store128(0x1d0, K_0x7145b0); // @0x69fe38  movaps %xmm0, 0x1d0(%rax)
    this.store128(0x1c0, K_0x7145b0); // @0x69fe3f  movaps %xmm0, 0x1c0(%rax)
    // pair 16 — xorps %xmm0, %xmm0 (@0x69fe46)
    this.store128(0x1f0, XMM_ZERO); // @0x69fe57  movaps %xmm0, 0x1f0(%rax)
    this.store128(0x1e0, XMM_ZERO); // @0x69fe5e  movaps %xmm0, 0x1e0(%rax)
  }
}
