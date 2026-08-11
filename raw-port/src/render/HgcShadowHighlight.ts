// HgcShadowHighlight.ts — raw transcription of Helium `HgcShadowHighlight`.
//
// The Helium GPU compositor node behind FCP's Shadows/Highlights adjustment.
// ONE method is transcribed here; the siblings (SetParameter, the ctor,
// GetOutput/GetDOD/GetROI, Bind/BindTexture, RenderTile/RenderTile_AVX, the
// dtors) are NOT — do not add them without their own disassembly and address
// citations.
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x323fe0  HgcShadowHighlight::GetParameter(int, float*)
//                __ZN18HgcShadowHighlight12GetParameterEiPf
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN18HgcShadowHighlight12GetParameterEiPf.s (20 lines)
//
// STRUCT LAYOUT (only what THIS method touches, corroborated by the two
// sibling bodies that write the same slot — nothing else is modelled):
//
//   struct HgcShadowHighlight {           // derives HGNode (0x000..0x197)
//     ...                                 // +0x000..+0x197 not decoded here
//     ParamEntry* paramTable;             // +0x198  (movq 0x198(%rdi),%rax @0x323fee)
//     ...
//   };
//
//   struct ParamEntry {                   // stride 0x20 — shlq $0x5 on the index
//     float v0;                           // +0x00
//     float v1;                           // +0x04
//     float v2;                           // +0x08
//     float v3;                           // +0x0c
//     // +0x10..+0x1f — a SECOND copy of the same four floats, not read here.
//   };
//
// Corroboration for the +0x198 table and its 0x20 stride (read, do not
// transcribe — these methods are separate ledger units):
//   * `HgcShadowHighlight::SetParameter(int,float,float,float,float)` @0x323f60
//     applies the IDENTICAL guard (`cmpl $0x7,%esi ; ja` @0x323f65) and the
//     IDENTICAL addressing (`movq 0x198(%rdi),%rcx ; movl %esi,%edx ;
//     shlq $0x5,%rdx` @0x323f6a-0x323f73). It compares the incoming 4 floats
//     against the slot's +0x00..+0x0c lanes and, when any differs, writes the
//     packed vector to BOTH `0x10(%rax)` @0x323fc1 and `(%rax)` @0x323fc5 —
//     which is where the duplicated upper half of each 32-byte slot comes from.
//   * The ctor `HgcShadowHighlight::HgcShadowHighlight()` [C2] @0x323c60
//     allocates the table with `__Znam(0x2c7)` @0x323c79, hand-aligns it to 32
//     bytes (`leaq 0x8(%rax),%rcx ; negl %ecx ; andl $0x1f,%ecx` @0x323c83),
//     stashes the raw allocation pointer at the aligned base and sets the table
//     pointer to alignedBase+8 (`leaq 0x8(%rdx)` chain @0x323c8c-0x323c90),
//     initialises the slots in the same +0x00/+0x10 PAIRS (e.g. @0x323d0a with
//     @0x323d12), and finally stores it: `movq %rdx, 0x198(%rbx)` @0x323e28.
//
// The bound is 8 slots for the accessor pair (indices 0..7), even though the
// ctor initialises slot pairs out to +0x298 — GetParameter/SetParameter simply
// refuse anything above 7.

/**
 * One 32-byte parameter slot of the `HgcShadowHighlight` table.
 *
 * Only the first four f32 lanes are decoded — they are the ones
 * `GetParameter` copies out. The upper 16 bytes of the stride hold the second
 * copy `SetParameter` writes @0x323fc1; that copy is not read by the method
 * ported here, so it is deliberately not modelled.
 *
 * @Helium 0x323fe0 (stride proven by `shlq $0x5` @0x323ff7; lanes by the four
 * `movss` loads @0x323ffb/@0x324004/@0x32400f/@0x32401a).
 */
export interface HgcShadowHighlightParamEntry {
  v0: number; // +0x00 (f32)
  v1: number; // +0x04 (f32)
  v2: number; // +0x08 (f32)
  v3: number; // +0x0c (f32)
}

/**
 * Minimal shape of `HgcShadowHighlight` for the field THIS method reads.
 * Do not expand it without decoding the corresponding method — a field this
 * port has not read from the binary does not belong here.
 *
 * @Helium 0x323fe0
 */
export interface HgcShadowHighlightState {
  /** +0x198 — the parameter table (`movq 0x198(%rdi), %rax` @0x323fee). */
  paramTable: HgcShadowHighlightParamEntry[];
}

/**
 * `HgcShadowHighlight::GetParameter(int paramIdx, float* out)`
 *   — @Helium 0x323fe0
 *   — __ZN18HgcShadowHighlight12GetParameterEiPf
 *
 * Copies the four f32 lanes of parameter slot `paramIdx` into `out[0..3]`.
 * Returns 0 on success and -1 (0xFFFFFFFF as an i32) when `paramIdx > 7`
 * under an UNSIGNED compare — the out-of-range path writes nothing to `out`.
 *
 * Full transcription — every instruction, in order:
 *
 *   0x323fe0  movl  $0xffffffff, %eax      ; rc = -1, preset for the OOR exit
 *   0x323fe5  cmpl  $0x7, %esi             ; flags on paramIdx - 7 (UNSIGNED)
 *   0x323fe8  ja    0x324028               ;   CF=0 & ZF=0 => paramIdx > 7 -> retq -1
 *   0x323fea  pushq %rbp                   ; frame setup (no TS counterpart)
 *   0x323feb  movq  %rsp, %rbp             ; frame setup (no TS counterpart)
 *   0x323fee  movq  0x198(%rdi), %rax      ; rax = this->paramTable
 *   0x323ff5  movl  %esi, %ecx             ; ecx = paramIdx (ZERO-EXTENDS to rcx)
 *   0x323ff7  shlq  $0x5, %rcx             ; rcx = paramIdx * 32 (0x20 stride)
 *   0x323ffb  movss (%rax,%rcx), %xmm0     ; xmm0 = table[i].v0
 *   0x324000  movss %xmm0, (%rdx)          ; out[0] = v0
 *   0x324004  movss 0x4(%rax,%rcx), %xmm0  ; xmm0 = table[i].v1
 *   0x32400a  movss %xmm0, 0x4(%rdx)       ; out[1] = v1
 *   0x32400f  movss 0x8(%rax,%rcx), %xmm0  ; xmm0 = table[i].v2
 *   0x324015  movss %xmm0, 0x8(%rdx)       ; out[2] = v2
 *   0x32401a  movss 0xc(%rax,%rcx), %xmm0  ; xmm0 = table[i].v3
 *   0x324020  movss %xmm0, 0xc(%rdx)       ; out[3] = v3
 *   0x324025  xorl  %eax, %eax             ; rc = 0
 *   0x324027  popq  %rbp                   ; frame teardown (no TS counterpart)
 *   0x324028  retq                         ; shared exit for both paths
 *   0x324029  nopl  (%rax)                 ; alignment padding, not executed
 *
 * AT&T decode note (PORTING_SPEC Rule 4): `cmpl $0x7, %esi` sets flags on
 * `dst - src` = `paramIdx - 7`, and `ja` is the UNSIGNED CF=0&ZF=0 pair, so the
 * bail-out is taken exactly when `(u32)paramIdx > 7`. A NEGATIVE `int` argument
 * reinterprets as a huge u32 and therefore ALSO bails out — hence the
 * `>>> 0` reinterpretation below rather than a signed range test. The
 * `movl %esi, %ecx` at 0x323ff5 is the zero-extension that makes the index
 * unsigned in the address computation too.
 *
 * Note the -1 is loaded BEFORE the guard and the two paths share the single
 * `retq` @0x324028: on the out-of-range path the prologue is never executed
 * and `out` is left completely untouched.
 *
 * `movss` is a 32-bit single-precision load/store, so every lane is wrapped in
 * `Math.fround` per the numerics rule (Rule 4). The four copies are
 * independent scalar moves — NOT a 16-byte vector move — and are reproduced in
 * the same order.
 *
 * ZERO callees of any kind: no in-scope call, no extern, no indirect and no
 * virtual dispatch (`depgraph.py deps` lists nothing).
 *
 * @param self     — the `HgcShadowHighlight` instance (`%rdi`).
 * @param paramIdx — 0-based parameter index (`%esi`), compared UNSIGNED vs 7.
 * @param out      — the `float*` output buffer (`%rdx`); lanes 0..3 are written
 *                   only on the in-range path.
 * @returns 0 on success, -1 (as a signed i32) when the index is out of range.
 */
export function HgcShadowHighlight_GetParameter(
  self: HgcShadowHighlightState,
  paramIdx: number,
  out: Float32Array,
): number {
  // @0x323fe0  movl $0xffffffff,%eax — the -1 is materialised first.
  // @0x323fe5-0x323fe8  cmpl $0x7,%esi ; ja 0x324028 — UNSIGNED compare, so a
  //   negative index reinterprets as a huge u32 and bails out here too.
  const idxU32 = paramIdx >>> 0;
  if (idxU32 > 7) {
    return -1; // 0xFFFFFFFF read back as a signed i32; `out` is untouched.
  }

  // @0x323fee  movq 0x198(%rdi),%rax — the parameter table pointer.
  const table = self.paramTable;
  // @0x323ff5-0x323ff7  movl %esi,%ecx ; shlq $0x5,%rcx — the 32-byte stride,
  //   modelled as a struct-array index rather than a raw byte offset (Rule 5).
  const e = table[idxU32];

  // @0x323ffb / @0x324000  movss (%rax,%rcx),%xmm0 ; movss %xmm0,(%rdx)
  out[0] = Math.fround(e.v0);
  // @0x324004 / @0x32400a  movss 0x4(%rax,%rcx),%xmm0 ; movss %xmm0,0x4(%rdx)
  out[1] = Math.fround(e.v1);
  // @0x32400f / @0x324015  movss 0x8(%rax,%rcx),%xmm0 ; movss %xmm0,0x8(%rdx)
  out[2] = Math.fround(e.v2);
  // @0x32401a / @0x324020  movss 0xc(%rax,%rcx),%xmm0 ; movss %xmm0,0xc(%rdx)
  out[3] = Math.fround(e.v3);

  // @0x324025  xorl %eax,%eax — success.
  return 0;
}
