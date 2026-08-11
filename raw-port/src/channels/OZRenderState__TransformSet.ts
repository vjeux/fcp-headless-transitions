// OZRenderState__TransformSet.ts — Ozone framework.
//
// FCP `OZRenderState::TransformSet` — a nested class (file name joins the outer and inner names
// with a DOUBLE underscore, per PORTING_SPEC). Checked before creating the file:
//   find raw-port/src -iname '*TransformSet*'   -> no hits
//   find raw-port/src -iname '*OZRenderState*'  -> only channels/OZRenderState.ts, the OUTER class
// so this is a new file rather than the "same class filed twice in two layer directories" shape,
// and it sits in `channels/` beside its outer class.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//         (x86_64 slice, unadjusted VAs).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZN13OZRenderState12TransformSet8rotationEb
//       -- OZRenderState::TransformSet::rotation(bool)     @Ozone 0x277180   (`nm` T)
//   * __ZN13OZRenderState12TransformSet11translationEb
//       -- OZRenderState::TransformSet::translation(bool)  @Ozone 0x2771e0   (`nm` T)
//
// re/disasm: raw-port/re/disasm/__ZN13OZRenderState12TransformSet8rotationEb.s (13 lines) and
// ...11translationEb.s (12 lines), each re-derived from the binary after deleting the cached copy.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@Ozone 0x277180)
// -----------------------------------------------------------------------------
//   0x277180  pushq %rbp ; movq %rsp,%rbp    ; frame
//   0x277184  movq  (%rdi), %rax             ; rax = this->bits          (+0x00, 64-bit)
//   0x277187  movl  %eax, %ecx               ; ecx = (uint32)rax  -- ZERO-EXTENDS into %rcx
//   0x277189  andl  $0x3fc7, %ecx            ; ecx &= 0x3FC7  (0x3FFF with bits 3..5 removed)
//   0x27718f  orq   $0x38, %rax              ; rax |= 0x38    (bits 3..5)
//   0x277193  testl %esi, %esi               ; the bool argument, tested 32 bits wide
//   0x277195  cmoveq %rcx, %rax              ; ZF=1 (argument == 0) -> take the AND result
//   0x277199  movq  %rax, (%rdi)             ; store back into this->bits
//   0x27719c  popq %rbp ; retq
//   0x27719e  nop                            ; padding
//
// VERIFIED AGAINST THE RAW BYTES, not only against otool's rendering — a sibling in this same
// family is proof that the rendering cannot be trusted on its own (see THE SIBLING FAMILY below).
// Read out of the loaded image at slide+0x277180:
//
//   55 4889e5 488b07 89c1 81e1c73f0000 4883c838 85f6 480f44c1 488907 5dc3
//
// which decodes instruction for instruction as above: `89 c1` is `movl %eax,%ecx` (32-bit, so the
// upper half of %rcx is cleared), `81 e1 c7 3f 00 00` is `andl $0x3fc7,%ecx`, and `48 83 c8 38` is
// the REX.W `orq $0x38,%rax` — a 64-bit OR against a sign-extended imm8.
//
// -----------------------------------------------------------------------------
// THE TWO PATHS ARE NOT SYMMETRIC, AND THAT IS THE WHOLE CONTENT OF THIS FUNCTION
// -----------------------------------------------------------------------------
// The obvious model of a "set this flag group on/off" method is
//
//     bits = enable ? (bits | 0x38) : (bits & ~0x38);
//
// and it is wrong on every input with anything set outside 0x3FC7. The machine does not clear the
// group with a complement mask — it REPLACES the word with a POSITIVE mask, `andl $0x3fc7`, so the
// OFF path discards bits 14..63 as well as bits 3..5, while the ON path is a full 64-bit `orq` that
// preserves every other bit. The two paths are therefore not inverses of each other, and that
// asymmetry is the entire content of this function. Measured against the live symbol, the
// complement-mask model diverges on 32 of the oracle's 144 cases.
//
// Whether the upper bits are ever populated in a running FCP is not something this port may decide:
// the transcription is of the instruction, not of its likely operands (the standing rule this
// project keeps rejecting for).
//
// ONE THING THE MEASUREMENT SETTLED THAT READING DID NOT. `movl %eax,%ecx` truncates to 32 bits
// before the AND, and it is tempting to write that up as load-bearing. It is not: 0x3FC7 fits in 32
// bits, so `(x & 0xffffffff) & 0x3fc7` and `x & 0x3fc7` are the same function. The oracle carries
// the un-truncated model as a control and it kills **0 of 144** — an EQUIVALENT MUTANT, not a blind
// harness, and the difference matters: the other three controls fire on the same corpus (32, 48 and
// 24 of 144), so the instrument is demonstrably live. The port keeps `BigInt.asUintN(32, …)` because
// it is transcribing the instruction that is there, and this comment records that the choice is
// unobservable rather than pretending it was proven.
//
// -----------------------------------------------------------------------------
// THE SIBLING FAMILY — context for the layout, and a warning about the disassembly
// -----------------------------------------------------------------------------
// Five methods sit consecutively, each identical in shape and differing only in its two masks:
//
//   0x277160  pivot(bool)        andl $0x3ff8 / orq $0x7      bits 0..2
//   0x277180  rotation(bool)     andl $0x3fc7 / orq $0x38     bits 3..5     <- ported here
//   0x2771a0  scale(bool)        andl $0x3e3f / orq $0x1c0    bits 6..8
//   0x2771c0  shear(bool)        andl $0x39ff / orq $0x600    bits 9..10   (its own unit)
//   0x2771e0  translation(bool)  andl $0x07ff / orq $0x3800   bits 11..13  <- ported here
//
// Each AND mask is 0x3FFF with that method's group removed, which is what identifies the field as a
// 14-bit set of FOUR 3-bit groups AND ONE 2-BIT GROUP — `shear` at bits 9..10 is the odd one, and
// 3+3+3+2+3 = 14 is what closes the arithmetic. An earlier version of this line said "five 3-bit
// groups", which is 15 bits and does not even close on itself; reviewer 4 caught it and it is
// corrected here from the bytes, read out of the loaded image in one pass rather than inferred from
// the pattern:
//
//   pivot        554889e5 488b07 89c1 81e1f83f0000 4883c807   -> andl $0x3ff8 / orq $0x007
//   rotation     554889e5 488b07 89c1 81e1c73f0000 4883c838   -> andl $0x3fc7 / orq $0x038
//   scale        554889e5 488b07 89c1 81e13f3e0000 480dc0010000 -> andl $0x3e3f / orq $0x1c0
//   shear        554889e5 488b07 89c1 81e1ff390000 480d00060000 -> andl $0x39ff / orq $0x600
//   translation  554889e5 488b07 89c1 81e1ff070000 480d00380000 -> andl $0x07ff / orq $0x3800
//
// This matters beyond a wrong sentence: `pivot`, `scale` and `shear` are unclaimed units of the
// same body, and their author reads this header first. "Five 3-bit groups" would have sent the
// shear worker looking for three bits at 9..11. Each of those is its own ledger unit and its own export; `rotation` and
// `translation` are transcribed here, and `pivot`/`scale`/`shear` are added to this file as they
// are claimed (ADD-only: a landed export and its citations are never rewritten).
//
// WARNING, MEASURED WHILE READING THEM: on `translation` otool prints
//
//   0x2771ef  orq $"-[OZPanTool displayDefaultOnScreenControls]", %rax
//
// — an IMMEDIATE rendered as an ObjC selector, because `-tV` symbolizes the value against the
// symbol table and a local symbol happens to sit at that address. The bytes there are
// `48 0d 00 38 00 00`, so the immediate is 0x3800, exactly the bits the 0x07FF mask removes. The
// existing OPS_LOG entry records this misrendering for a `leaq` DISPLACEMENT; this is the same bug
// on an `orq` IMMEDIATE, which is a wider exposure than the entry claims. Decode the bytes whenever
// an operand names a symbol that makes no sense for the class.
//
// SO THE MASK IN `translation` BELOW IS TAKEN FROM THE BYTES, NOT FROM THE DISASSEMBLY. It is the
// one place in this file where the two disagree, and transcribing what otool printed would have
// meant transcribing a pan tool's selector into a bit mask.

/**
 * `OZRenderState::TransformSet` — a 14-bit set of transform-component groups (four of 3 bits and
 * one of 2, see the header table) packed into one 64-bit word at offset +0x00. Only what this method grounds is modelled (PORTING_SPEC Rule 5):
 * the word itself. Nothing here names what the bits within a group MEAN — no decoded method
 * distinguishes them, so calling them anything would be an invention.
 */
export interface OZRenderState__TransformSet_Fields {
  /** +0x00 — the packed flag word. Read @0x277184, written @0x277199, 64 bits wide (`movq`). */
  bits: bigint;
}

/** @0x277189 — the OFF path's mask: 0x3FFF with the rotation group (bits 3..5) removed. */
const ROTATION_OFF_MASK = 0x3fc7n;
/** @0x27718f — the ON path's immediate: bits 3..5. */
const ROTATION_BITS = 0x38n;
/** @0x2771e9 — the OFF path's mask: 0x3FFF with the translation group (bits 11..13) removed. */
const TRANSLATION_OFF_MASK = 0x7ffn;
/**
 * @0x2771ef — the ON path's immediate: bits 11..13. Read from the instruction BYTES
 * `48 0d 00 38 00 00` (`orq $0x3800, %rax`), because otool renders this immediate as an ObjC
 * selector — see the warning in the file header.
 */
const TRANSLATION_BITS = 0x3800n;

/**
 * `OZRenderState::TransformSet::rotation(bool)` -> void
 * @Ozone __ZN13OZRenderState12TransformSet8rotationEb @0x277180..0x27719d
 *
 * Every instruction is listed in the file header. Turn the rotation group on or off in the packed
 * word — asymmetrically, exactly as the machine does it: ON is a 64-bit OR that preserves every
 * other bit, OFF is a 32-bit truncating AND that also discards bits 14..63.
 *
 * The argument is the raw 32-bit value in `%esi`, because `testl %esi, %esi` tests the register 32
 * bits wide rather than testing a byte. A caller holding a C++ `bool` passes 0 or 1 (the ABI
 * zero-extends it), but the width is the instruction's, so the port keeps it: any non-zero low 32
 * bits take the ON path. The oracle passes 64-bit values in `%rsi` with garbage in the upper half
 * and confirms the machine ignores it.
 *
 * ORACLED against the live exported symbol (`nm` T, dlsym-able):
 * `raw-port/re/oracle/OZRenderState__TransformSet_rotation_oracle.py` runs under `arch -x86_64`,
 * self-checks the ten prologue bytes at slide+0x277180 against `554889e5488b0789c181e1c73f`, and
 * calls it on a poisoned 0x40-byte arena so that a write anywhere but +0x00..+0x08 fails the run.
 * 144 cases — 24 words crossed with 6 arguments: the empty word, single bits, every group's mask,
 * words with bits set above 0x3FFF and above 2^32, 0xffffffffffffffff and randoms, against the
 * arguments 0, 1, 2, 0x100, 0xffffffff and 0x1_0000_0000 (whose low 32 bits are zero, so the
 * machine must treat it as false). **144/144 agree with the port, 0 stray writes.**
 * Negative controls in the same run: the `& ~0x38` complement-mask model kills 32/144, a model that
 * ORs on the OFF path kills 48/144, and one that tests only the low BYTE of the argument kills
 * 24/144. A fourth control — ANDing in 64 bits, i.e. dropping the `movl` truncation — kills 0/144
 * because it is an equivalent mutant; see the header.
 *
 * @param self   the TransformSet (`%rdi`).
 * @param enable the argument as it arrives in `%esi`; zero turns the group off.
 */
export function TransformSet_rotation(
  self: OZRenderState__TransformSet_Fields,
  enable: number,
): void {
  // @0x277184 — movq (%rdi), %rax.
  const bits = self.bits;
  // @0x277187/@0x277189 — movl %eax,%ecx (truncate to 32 bits, zero-extending into %rcx) then
  // andl $0x3fc7,%ecx. Both halves of that matter: see the file header.
  const off = BigInt.asUintN(32, bits) & ROTATION_OFF_MASK;
  // @0x27718f — orq $0x38, %rax, in 64 bits.
  const on = BigInt.asUintN(64, bits | ROTATION_BITS);
  // @0x277193/@0x277195 — testl %esi,%esi ; cmoveq %rcx,%rax. The test is 32 bits wide.
  const chosen = (enable >>> 0) !== 0 ? on : off;
  // @0x277199 — movq %rax, (%rdi).
  self.bits = chosen;
}

/**
 * `OZRenderState::TransformSet::translation(bool)` -> void
 * @Ozone __ZN13OZRenderState12TransformSet11translationEb @0x2771e0..0x2771ff
 *
 * FULL DISASM (raw-port/re/disasm/__ZN13OZRenderState12TransformSet11translationEb.s, 12 lines),
 * with the one operand otool gets wrong replaced by what the bytes say:
 *
 *   0x2771e0  pushq %rbp ; movq %rsp,%rbp
 *   0x2771e4  movq  (%rdi), %rax             ; rax = this->bits
 *   0x2771e7  movl  %eax, %ecx               ; ecx = (uint32)rax
 *   0x2771e9  andl  $0x7ff, %ecx             ; ecx &= 0x7FF  (0x3FFF with bits 11..13 removed)
 *   0x2771ef  orq   $0x3800, %rax            ; rax |= 0x3800 (bits 11..13)
 *   0x2771f5  testl %esi, %esi
 *   0x2771f7  cmoveq %rcx, %rax
 *   0x2771fb  movq  %rax, (%rdi)
 *   0x2771fe  popq %rbp ; retq
 *
 * Raw bytes at slide+0x2771e0, which is where the 0x3800 comes from:
 *   55 4889e5 488b07 89c1 81e1ff070000 480d00380000 85f6 480f44c1 488907 5dc3
 * `48 0d imm32` is the REX.W `orq imm32, %rax` form — the mask does not fit in an imm8, which is
 * why this sibling encodes differently from `rotation`'s `48 83 c8 38` and why it is the one otool
 * mis-symbolizes.
 *
 * Structurally identical to `rotation` above, including the asymmetry that is the point of both:
 * ON preserves every other bit in 64 bits, OFF keeps only what is in the positive mask and so also
 * discards bits 14..63. Here the mask is 0x7FF rather than 0x3FC7, so OFF discards strictly more of
 * the low word — every group above bit 10 as well.
 *
 * ORACLED against the live exported symbol in the same run as `rotation`, same poisoned arena and
 * byte-diff, same 144 cases: **144/144 agree with the port, 0 stray writes** (288/288 for the file).
 * Negative controls for this method: complement-mask kills 32/144, ORs-on-both-paths 48/144,
 * low-byte argument test 24/144, and the un-truncated AND 0/144 for the same equivalent-mutant
 * reason as above. I expected the wider mask to kill MORE than rotation's 32 and it kills exactly
 * as many: every word in the corpus that distinguishes the two models does so through bits above
 * 0x3FFF, which both masks discard identically. Writing the prediction down and then reading the
 * number is the only reason that is a fact here rather than a plausible sentence.
 *
 * @param self   the TransformSet (`%rdi`).
 * @param enable the argument as it arrives in `%esi`; zero turns the group off.
 */
export function TransformSet_translation(
  self: OZRenderState__TransformSet_Fields,
  enable: number,
): void {
  // @0x2771e4 — movq (%rdi), %rax.
  const bits = self.bits;
  // @0x2771e7/@0x2771e9 — movl %eax,%ecx ; andl $0x7ff,%ecx.
  const off = BigInt.asUintN(32, bits) & TRANSLATION_OFF_MASK;
  // @0x2771ef — orq $0x3800, %rax, in 64 bits.
  const on = BigInt.asUintN(64, bits | TRANSLATION_BITS);
  // @0x2771f5/@0x2771f7 — testl %esi,%esi ; cmoveq %rcx,%rax.
  const chosen = (enable >>> 0) !== 0 ? on : off;
  // @0x2771fb — movq %rax, (%rdi).
  self.bits = chosen;
}
