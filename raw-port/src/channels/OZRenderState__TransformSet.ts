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
//       -- OZRenderState::TransformSet::rotation(bool)   @Ozone 0x277180   (`nm` T)
//
// re/disasm: raw-port/re/disasm/__ZN13OZRenderState12TransformSet8rotationEb.s (13 lines),
// re-derived from the binary after deleting the cached copy.
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
//   0x2771c0  shear(bool)        (its own unit; masks not decoded here)
//   0x2771e0  translation(bool)  andl $0x07ff / orq $0x3800   bits 11..13
//
// Each AND mask is 0x3FFF with that method's group removed, which is what identifies the field as a
// 14-bit set of five 3-bit groups. Each of those is its own ledger unit and its own export; only
// `rotation` is transcribed here.
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

/**
 * `OZRenderState::TransformSet` — a bit set of five 3-bit transform-component groups packed into
 * one 64-bit word at offset +0x00. Only what this method grounds is modelled (PORTING_SPEC Rule 5):
 * the word itself. Nothing here names what the three bits within a group MEAN — no decoded method
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
