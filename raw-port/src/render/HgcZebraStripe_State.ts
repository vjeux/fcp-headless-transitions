// raw-port: HgcZebraStripe::State (Ozone.framework) — the base-object constructor.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * HgcZebraStripe::State::State()  [C2, base-object ctor]  @Ozone 0x691270
//     __ZN14HgcZebraStripe5StateC2Ev
//     re/disasm: raw-port/re/disasm/__ZN14HgcZebraStripe5StateC2Ev.s  (88 lines)
//
// `HgcZebraStripe::State` is the parameter block for Ozone's "zebra stripe"
// exposure-warning overlay (the Hgc* family are GPU compute-kernel nodes; a
// nested `State` holds the kernel's uniforms). This ctor is a PURE CONSTANT
// FILL: it writes 0x200 bytes and calls nothing.
//
// FRONTIER CALLEES — none. `depgraph.py` reports `deps: []`, `n_extern_oos: 0`,
// `indirect: 0`: no callq, no symbol stub, no virtual dispatch anywhere in the
// 88-line body. Every instruction is a load of a 16-byte literal followed by
// two 16-byte stores.
//
// -----------------------------------------------------------------------------
// SHAPE OF THE BODY — sixteen PAIRS of identical 16-byte stores
// -----------------------------------------------------------------------------
// The ctor fills 0x200 = 512 bytes = 32 sixteen-byte slots, and it does so as
// SIXTEEN PAIRS: each pair loads one 16-byte value and stores it to BOTH slots
// of a 32-byte group, HIGH HALF FIRST. The recurring shape (here for the pair
// at +0x40/+0x50) is:
//
//   0x6912a5  movaps 0x83184(%rip), %xmm1     ; load the literal
//   0x6912ac  movaps %xmm1, -0x40(%rbp)       ; spill to the frame
//   0x6912b0  movaps -0x40(%rbp), %xmm1       ; reload it, unchanged
//   0x6912b4  movaps %xmm1, 0x50(%rax)        ; store the HIGH half first
//   0x6912b8  movaps %xmm1, 0x40(%rax)        ; then the LOW half
//
// The spill/reload round trip through `-0x40(%rbp)` (and the matching slots at
// -0x30 down to -0x110) is an unoptimised-codegen artifact: the value written
// is the value read back, so it moves no data. It is documented per pair below
// and is not modelled — modelling it would change nothing, and inventing frame
// storage the object does not have would be worse than transcribing the effect.
//
// `%xmm0` is zeroed ONCE by `xorps %xmm0, %xmm0` @0x691283 and is never written
// again (only `%xmm1` is reloaded), which is why the first two pairs (+0x00,
// +0x20) and the last pair (+0x1e0) all store zero.
//
// -----------------------------------------------------------------------------
// THE SIXTEEN LITERALS — resolved, not guessed
// -----------------------------------------------------------------------------
// Each RIP-relative operand was resolved as VA = instr_addr + instr_len + disp
// (raw-port/army/tools/resolve.py Ozone ripconst) and the 16 bytes at that VA
// read straight out of the Ozone x86_64 slice. Instruction lengths come from
// the address delta to the next instruction in the disasm: 7 for the `movaps`
// loads, 8 for the two `movss` loads.
//
//   pair   dst slots        instr      VA          16-byte value (as u32 words)
//   ----   --------------   --------   --------    ----------------------------
//    1     +0x000/+0x010    xorps      —           00000000 00000000 00000000 00000000
//    2     +0x020/+0x030    xorps      —           00000000 00000000 00000000 00000000
//    3     +0x040/+0x050    0x6912a5   0x714430    3e124925 3e124925 00000000 00000000
//    4     +0x060/+0x070    0x6912bc   0x714440    40e00000 40e00000 00000000 00000000
//    5     +0x080/+0x090    0x6912d3   0x7144c0    3e924925 00000000 00000000 00000000
//    6     +0x0a0/+0x0b0    0x6912f1   0x7144c4    3fdb6db8 00000000 00000000 00000000
//    7     +0x0c0/+0x0d0    0x69130f   0x714450    3f800000 3f000000 00000000 00000000
//    8     +0x0e0/+0x0f0    0x69132c   0x714460    ff800000 3e99999a 00000000 3ba3d70a
//    9     +0x100/+0x110    0x69134f   0x714470    7fffffff 00000000 00000000 00000000
//   10     +0x120/+0x130    0x691372   0x714480    ffffffff ffffffff ffffffff 00000000
//   11     +0x140/+0x150    0x691395   0x708570    00000000 00000000 00000000 3f800000
//   12     +0x160/+0x170    0x6913b8   0x709a10    3f800000 3f800000 3f800000 00000000
//   13     +0x180/+0x190    0x6913db   0x714490    00000000 00000000 00000000 ff800000
//   14     +0x1a0/+0x1b0    0x6913fe   0x7144a0    3f800000 3f800000 3f800000 7f800000
//   15     +0x1c0/+0x1d0    0x691421   0x7144b0    80000000 00000000 00000000 00000000
//   16     +0x1e0/+0x1f0    xorps      —           00000000 00000000 00000000 00000000
//
// The two `movss` loads (pairs 5 and 6) read only FOUR bytes: the load form of
// `movss m32, %xmm` zero-extends, clearing bits 32..127. So the stored 16 bytes
// are (literal, 0, 0, 0) — which is why those two rows show one non-zero word.
// Their VAs 0x7144c0 and 0x7144c4 are ADJACENT scalars in the constant pool,
// not 16-byte vectors, consistent with the narrower load.
//
// -----------------------------------------------------------------------------
// WHY THE OBJECT IS MODELLED AS RAW 32-BIT WORDS
// -----------------------------------------------------------------------------
// Six of the sixteen literals are not ordinary finite floats: 0x7fffffff (the
// per-lane sign-clear mask), 0xffffffff x3 (an all-ones lane mask), 0xff800000
// and 0x7f800000 (-inf / +inf clamp rails), and 0x80000000 (negative zero).
// Storing those through a JS `number` would round-trip a mask through an
// IEEE-754 NaN, which is exactly the kind of silent corruption Rule 4 exists to
// prevent. The State is therefore a 512-byte buffer written as exact u32 words,
// with a Float32Array view provided for the consumers that read it as floats.
// Both views alias the SAME bytes, so the object is bit-identical to FCP's.

/** One 16-byte SSE literal as its four little-endian 32-bit words — the exact
 *  bytes `movaps`/`movss` puts in `%xmm1`, before any float interpretation. */
type Xmm128 = readonly [number, number, number, number];

/** The zero register: `xorps %xmm0, %xmm0` @0x691283. Reused by pairs 1, 2 and
 *  16 because nothing ever writes `%xmm0` again. */
const XMM_ZERO: Xmm128 = [0x00000000, 0x00000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x714430 — loaded by `movaps 0x83184(%rip), %xmm1` @0x6912a5.
 *  As f32: (0.1428571492433548, 0.1428571492433548, 0, 0) — 0x3e124925 is the
 *  float32 nearest 1/7. */
const K_0x714430: Xmm128 = [0x3e124925, 0x3e124925, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x714440 — loaded by `movaps 0x8317d(%rip), %xmm1` @0x6912bc.
 *  As f32: (7, 7, 0, 0) — the reciprocal partner of K_0x714430. */
const K_0x714440: Xmm128 = [0x40e00000, 0x40e00000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x7144c0 — loaded by `movss 0x831e5(%rip), %xmm1` @0x6912d3.
 *  A 4-byte scalar load, so lanes 1..3 are zeroed by the instruction.
 *  As f32: (0.2857142984867096, 0, 0, 0) — the float32 nearest 2/7. */
const K_0x7144c0: Xmm128 = [0x3e924925, 0x00000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x7144c4 — loaded by `movss 0x831cb(%rip), %xmm1` @0x6912f1.
 *  A 4-byte scalar load, so lanes 1..3 are zeroed by the instruction.
 *  As f32: (1.7142858505249023, 0, 0, 0) — the float32 nearest 12/7. */
const K_0x7144c4: Xmm128 = [0x3fdb6db8, 0x00000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x714450 — loaded by `movaps 0x8313a(%rip), %xmm1` @0x69130f.
 *  As f32: (1, 0.5, 0, 0). */
const K_0x714450: Xmm128 = [0x3f800000, 0x3f000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x714460 — loaded by `movaps 0x8312d(%rip), %xmm1` @0x69132c.
 *  As f32: (-Infinity, 0.30000001192092896, 0, 0.004999999888241291). Lane 0 is
 *  the bit pattern 0xff800000 (-inf), a lower clamp rail, not a finite value. */
const K_0x714460: Xmm128 = [0xff800000, 0x3e99999a, 0x00000000, 0x3ba3d70a];

/** @0xADDR Ozone 0x714470 — loaded by `movaps 0x8311a(%rip), %xmm1` @0x69134f.
 *  Lane 0 is 0x7fffffff, the per-lane sign-clear (absolute value) mask — a BIT
 *  PATTERN, not a float. Lanes 1..3 are zero. */
const K_0x714470: Xmm128 = [0x7fffffff, 0x00000000, 0x00000000, 0x00000000];

/** @0xADDR Ozone 0x714480 — loaded by `movaps 0x83107(%rip), %xmm1` @0x691372.
 *  Lanes 0..2 are 0xffffffff (all-ones lane mask), lane 3 is zero. Bit
 *  patterns, not floats — the classic "select xyz, drop w" SSE mask. */
const K_0x714480: Xmm128 = [0xffffffff, 0xffffffff, 0xffffffff, 0x00000000];

/** @0xADDR Ozone 0x708570 — loaded by `movaps 0x771d4(%rip), %xmm1` @0x691395.
 *  As f32: (0, 0, 0, 1) — the homogeneous w-unit vector. Note this literal
 *  lives in a different pool region from the 0x7144xx cluster, i.e. it is a
 *  constant shared with other Ozone translation units. */
const K_0x708570: Xmm128 = [0x00000000, 0x00000000, 0x00000000, 0x3f800000];

/** @0xADDR Ozone 0x709a10 — loaded by `movaps 0x78651(%rip), %xmm1` @0x6913b8.
 *  As f32: (1, 1, 1, 0). Also from the shared pool region. */
const K_0x709a10: Xmm128 = [0x3f800000, 0x3f800000, 0x3f800000, 0x00000000];

/** @0xADDR Ozone 0x714490 — loaded by `movaps 0x830ae(%rip), %xmm1` @0x6913db.
 *  As f32: (0, 0, 0, -Infinity). Lane 3 is the bit pattern 0xff800000. */
const K_0x714490: Xmm128 = [0x00000000, 0x00000000, 0x00000000, 0xff800000];

/** @0xADDR Ozone 0x7144a0 — loaded by `movaps 0x8309b(%rip), %xmm1` @0x6913fe.
 *  As f32: (1, 1, 1, +Infinity). Lane 3 is the bit pattern 0x7f800000 — the
 *  upper rail matching the -inf lower rail in K_0x714490. */
const K_0x7144a0: Xmm128 = [0x3f800000, 0x3f800000, 0x3f800000, 0x7f800000];

/** @0xADDR Ozone 0x7144b0 — loaded by `movaps 0x83088(%rip), %xmm1` @0x691421.
 *  Lane 0 is 0x80000000 — NEGATIVE ZERO (the sign-bit-only pattern, used both
 *  as -0.0f and as an SSE sign-flip mask). Lanes 1..3 are +0. This is exactly
 *  the case a float round trip would silently normalise to +0. */
const K_0x7144b0: Xmm128 = [0x80000000, 0x00000000, 0x00000000, 0x00000000];

/** Total size of the object this ctor fills: the last store lands at +0x1f0 and
 *  is 16 bytes wide, so the ctor writes exactly 0x200 bytes and never beyond. */
export const HGC_ZEBRA_STRIPE_STATE_SIZE = 0x200;

/**
 * `HgcZebraStripe::State` — the 0x200-byte uniform block this ctor fills.
 *
 * Every byte is modelled, none of it is named: the ctor writes sixteen 32-byte
 * groups of undifferentiated 16-byte slots and reveals no field boundaries
 * beyond that pairing, so per-Rule-5 discipline the port records the exact
 * bytes and the pair structure rather than inventing uniform names. Whichever
 * `HgcZebraStripe` method consumes these slots is a separate ledger unit and
 * will ground the field names when it is transcribed.
 *
 * `u32` and `f32` are two views over the SAME `ArrayBuffer`, so a consumer may
 * read a slot as four floats while the stored bit patterns (masks, ±inf, -0)
 * stay exactly what the binary wrote.
 *
 * @0xADDR Ozone 0x691270
 */
export class HgcZebraStripe_State {
  /** The raw 0x200 bytes. Zero-filled at allocation, which is what the two
   *  `%xmm0` pairs would have written anyway. */
  readonly bytes: ArrayBuffer = new ArrayBuffer(HGC_ZEBRA_STRIPE_STATE_SIZE);
  /** 32-bit-word view — the authoritative one; stores go through it so bit
   *  patterns survive verbatim. 128 words = 0x200 bytes. */
  readonly u32: Uint32Array = new Uint32Array(this.bytes);
  /** float32 view over the same bytes, for consumers that read uniforms. */
  readonly f32: Float32Array = new Float32Array(this.bytes);

  /**
   * `movaps %xmm, <byteOffset>(%rax)` — a 16-byte aligned store of the four
   * words currently in the register. This models the x86 INSTRUCTION (the same
   * category as the `blendvps`/`cmpltps` helpers in doToneMap_OSFA.ts), not any
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
   * `HgcZebraStripe::State::State()` [C2, base-object ctor] — @Ozone 0x691270
   * (`__ZN14HgcZebraStripe5StateC2Ev`).
   *
   * Faithful transcription of the 88-line body. Prologue @0x691270..0x69127f
   * (`pushq %rbp; movq %rsp,%rbp; subq $0x90,%rsp; movq %rdi,-0x8(%rbp)`) sets
   * up the frame and spills `this`; @0x69127f reloads it into `%rax`, which is
   * the base register for every store below. Epilogue @0x691460..0x691468
   * (`addq $0x90,%rsp; popq %rbp; retq`). No return value — a C2 ctor.
   *
   * The sixteen pairs run in address order of their destinations, and within
   * each pair the HIGH slot is written before the LOW one, exactly as below.
   * Nothing else happens: no callee, no branch, no loop.
   *
   * @param self  `%rdi` — the storage to construct into.
   * @returns     `self`, constructed.
   *
   * @0xADDR Ozone 0x691270
   */
  static C2(self: HgcZebraStripe_State): HgcZebraStripe_State {
    // @0x691283  xorps %xmm0, %xmm0            ; xmm0 = 0, and stays 0 for the
    //                                            whole body (pairs 1, 2, 16).

    // --- pair 1 -------------------------------------------------------------
    // @0x691286/0x69128a  spill+reload of xmm0 through -0x20(%rbp) (no-op).
    // @0x69128e  movaps %xmm1, 0x10(%rax)
    self.store128(0x010, XMM_ZERO);
    // @0x691292  movaps %xmm1, (%rax)
    self.store128(0x000, XMM_ZERO);

    // --- pair 2 -------------------------------------------------------------
    // @0x691295/0x691299  spill+reload of xmm0 through -0x30(%rbp) (no-op).
    // @0x69129d  movaps %xmm1, 0x30(%rax)
    self.store128(0x030, XMM_ZERO);
    // @0x6912a1  movaps %xmm1, 0x20(%rax)
    self.store128(0x020, XMM_ZERO);

    // --- pair 3 -------------------------------------------------------------
    // @0x6912a5  movaps 0x83184(%rip), %xmm1   ; -> 0x714430
    // @0x6912ac/0x6912b0  spill+reload through -0x40(%rbp) (no-op).
    // @0x6912b4  movaps %xmm1, 0x50(%rax)
    self.store128(0x050, K_0x714430);
    // @0x6912b8  movaps %xmm1, 0x40(%rax)
    self.store128(0x040, K_0x714430);

    // --- pair 4 -------------------------------------------------------------
    // @0x6912bc  movaps 0x8317d(%rip), %xmm1   ; -> 0x714440
    // @0x6912c3/0x6912c7  spill+reload through -0x50(%rbp) (no-op).
    // @0x6912cb  movaps %xmm1, 0x70(%rax)
    self.store128(0x070, K_0x714440);
    // @0x6912cf  movaps %xmm1, 0x60(%rax)
    self.store128(0x060, K_0x714440);

    // --- pair 5 -------------------------------------------------------------
    // @0x6912d3  movss 0x831e5(%rip), %xmm1    ; -> 0x7144c0, lanes 1..3 zeroed
    // @0x6912db/0x6912df  spill+reload through -0x60(%rbp) (no-op).
    // @0x6912e3  movaps %xmm1, 0x90(%rax)
    self.store128(0x090, K_0x7144c0);
    // @0x6912ea  movaps %xmm1, 0x80(%rax)
    self.store128(0x080, K_0x7144c0);

    // --- pair 6 -------------------------------------------------------------
    // @0x6912f1  movss 0x831cb(%rip), %xmm1    ; -> 0x7144c4, lanes 1..3 zeroed
    // @0x6912f9/0x6912fd  spill+reload through -0x70(%rbp) (no-op).
    // @0x691301  movaps %xmm1, 0xb0(%rax)
    self.store128(0x0b0, K_0x7144c4);
    // @0x691308  movaps %xmm1, 0xa0(%rax)
    self.store128(0x0a0, K_0x7144c4);

    // --- pair 7 -------------------------------------------------------------
    // @0x69130f  movaps 0x8313a(%rip), %xmm1   ; -> 0x714450
    // @0x691316/0x69131a  spill+reload through -0x80(%rbp) (no-op).
    // @0x69131e  movaps %xmm1, 0xd0(%rax)
    self.store128(0x0d0, K_0x714450);
    // @0x691325  movaps %xmm1, 0xc0(%rax)
    self.store128(0x0c0, K_0x714450);

    // --- pair 8 -------------------------------------------------------------
    // @0x69132c  movaps 0x8312d(%rip), %xmm1   ; -> 0x714460
    // @0x691333/0x69133a  spill+reload through -0x90(%rbp) (no-op).
    // @0x691341  movaps %xmm1, 0xf0(%rax)
    self.store128(0x0f0, K_0x714460);
    // @0x691348  movaps %xmm1, 0xe0(%rax)
    self.store128(0x0e0, K_0x714460);

    // --- pair 9 -------------------------------------------------------------
    // @0x69134f  movaps 0x8311a(%rip), %xmm1   ; -> 0x714470
    // @0x691356/0x69135d  spill+reload through -0xa0(%rbp) (no-op).
    // @0x691364  movaps %xmm1, 0x110(%rax)
    self.store128(0x110, K_0x714470);
    // @0x69136b  movaps %xmm1, 0x100(%rax)
    self.store128(0x100, K_0x714470);

    // --- pair 10 ------------------------------------------------------------
    // @0x691372  movaps 0x83107(%rip), %xmm1   ; -> 0x714480
    // @0x691379/0x691380  spill+reload through -0xb0(%rbp) (no-op).
    // @0x691387  movaps %xmm1, 0x130(%rax)
    self.store128(0x130, K_0x714480);
    // @0x69138e  movaps %xmm1, 0x120(%rax)
    self.store128(0x120, K_0x714480);

    // --- pair 11 ------------------------------------------------------------
    // @0x691395  movaps 0x771d4(%rip), %xmm1   ; -> 0x708570
    // @0x69139c/0x6913a3  spill+reload through -0xc0(%rbp) (no-op).
    // @0x6913aa  movaps %xmm1, 0x150(%rax)
    self.store128(0x150, K_0x708570);
    // @0x6913b1  movaps %xmm1, 0x140(%rax)
    self.store128(0x140, K_0x708570);

    // --- pair 12 ------------------------------------------------------------
    // @0x6913b8  movaps 0x78651(%rip), %xmm1   ; -> 0x709a10
    // @0x6913bf/0x6913c6  spill+reload through -0xd0(%rbp) (no-op).
    // @0x6913cd  movaps %xmm1, 0x170(%rax)
    self.store128(0x170, K_0x709a10);
    // @0x6913d4  movaps %xmm1, 0x160(%rax)
    self.store128(0x160, K_0x709a10);

    // --- pair 13 ------------------------------------------------------------
    // @0x6913db  movaps 0x830ae(%rip), %xmm1   ; -> 0x714490
    // @0x6913e2/0x6913e9  spill+reload through -0xe0(%rbp) (no-op).
    // @0x6913f0  movaps %xmm1, 0x190(%rax)
    self.store128(0x190, K_0x714490);
    // @0x6913f7  movaps %xmm1, 0x180(%rax)
    self.store128(0x180, K_0x714490);

    // --- pair 14 ------------------------------------------------------------
    // @0x6913fe  movaps 0x8309b(%rip), %xmm1   ; -> 0x7144a0
    // @0x691405/0x69140c  spill+reload through -0xf0(%rbp) (no-op).
    // @0x691413  movaps %xmm1, 0x1b0(%rax)
    self.store128(0x1b0, K_0x7144a0);
    // @0x69141a  movaps %xmm1, 0x1a0(%rax)
    self.store128(0x1a0, K_0x7144a0);

    // --- pair 15 ------------------------------------------------------------
    // @0x691421  movaps 0x83088(%rip), %xmm1   ; -> 0x7144b0
    // @0x691428/0x69142f  spill+reload through -0x100(%rbp) (no-op).
    // @0x691436  movaps %xmm1, 0x1d0(%rax)
    self.store128(0x1d0, K_0x7144b0);
    // @0x69143d  movaps %xmm1, 0x1c0(%rax)
    self.store128(0x1c0, K_0x7144b0);

    // --- pair 16 ------------------------------------------------------------
    // @0x691444/0x69144b  spill+reload of the still-zero xmm0 through
    //                     -0x110(%rbp) (no-op).
    // @0x691452  movaps %xmm0, 0x1f0(%rax)
    self.store128(0x1f0, XMM_ZERO);
    // @0x691459  movaps %xmm0, 0x1e0(%rax)
    self.store128(0x1e0, XMM_ZERO);

    // @0x691460..0x691468  addq $0x90,%rsp ; popq %rbp ; retq
    return self;
  }
}
