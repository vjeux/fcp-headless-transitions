// raw-port/src/render/HgcAnaglyph.ts
//
// FCP `HgcAnaglyph` — Helium GPU compositor for the anaglyph (3D) blend
// effect. This is the low-level `Hgc*` node owned by the higher-level
// `HGAnaglyph` wrapper (see raw-port/src/render/HGAnaglyph.ts).
//
// This file currently transcribes exactly ONE method:
//   @Helium 0x2d8490  HgcAnaglyph::GetParameter(int, float*)
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HgcAnaglyph.GetParameter.s   (21 lines)
//
// Sibling methods (SetParameter, ctors, RenderTile, etc.) are NOT
// transcribed here — do not add them without their own disassembly and
// address citation.
//
// STRUCT LAYOUT (recovered from GetParameter @0x2d8490 alone; keep this
// scoped to what THIS method touches — other fields are unknown from
// this disasm slice):
//
//   struct HgcAnaglyph {
//     ...                                   // +0x000 .. +0x197 unknown here
//     ParamEntry* paramTable;               // +0x198  (movq 0x198(%rdi), %rax)
//     ...
//   };
//
//   struct ParamEntry {                     // stride = 0x20 (shlq $5 on paramIdx)
//     float v0;                             // +0x00
//     float v1;                             // +0x04
//     float v2;                             // +0x08
//     float v3;                             // +0x0c
//     // +0x10 .. +0x1f unused by GetParameter (only 4 f32 are copied)
//   };
//
// The paramTable is written by `HgcAnaglyph::SetParameter(int, float,
// float, float, float)` (not yet transcribed). GetParameter is a pure
// bounds-checked reader that copies 4×f32 out and returns 0 on success,
// -1 (0xFFFFFFFF as a signed 32-bit int) when paramIdx is out of range.
//
// Bounds check semantics (@0x2d8495 .. @0x2d8498):
//   cmpl $0x2, %esi        ; %esi = paramIdx (unsigned compare)
//   ja   0x2d84d8          ; if paramIdx > 2 -> return -1
// So valid indices are 0, 1, 2 exactly. `esi` is treated as UNSIGNED
// (ja = above; a negative int reinterpreted as huge unsigned also
// falls through to the -1 branch).

/**
 * Faithful shape of the FCP `ParamEntry` slots that back
 * `HgcAnaglyph::GetParameter`. Only the first 4 lanes are read by this
 * method; the remaining 16 bytes of the 32-byte stride are ignored here
 * (SetParameter may write them — that method is not yet transcribed).
 *
 * @Helium 0x2d8490 (implied by shlq $5 = 32-byte stride and 4×movss reads)
 */
export interface HgcAnaglyphParamEntry {
  v0: number; // +0x00 (Math.fround f32)
  v1: number; // +0x04 (Math.fround f32)
  v2: number; // +0x08 (Math.fround f32)
  v3: number; // +0x0c (Math.fround f32)
}

/**
 * Minimal shape of `HgcAnaglyph` for the fields THIS method reads.
 * Do not expand this without decoding the ctor / SetParameter — leaves
 * of the struct not touched by @0x2d8490 must not be invented here.
 *
 * @Helium 0x2d8490
 */
export interface HgcAnaglyphState {
  /** +0x198 — array of parameter entries (movq 0x198(%rdi), %rax @0x2d849e). */
  paramTable: HgcAnaglyphParamEntry[];
}

/**
 * `HgcAnaglyph::GetParameter(int paramIdx, float* out)` — Helium GPU
 * compositor parameter-getter. Copies 4 float32 lanes from the parameter
 * table entry at `paramIdx` into `out[0..3]`. Returns 0 on success, -1
 * (0xFFFFFFFF as i32) when `paramIdx > 2` (unsigned compare).
 *
 * Mangled: `__ZN11HgcAnaglyph12GetParameterEiPf`
 * @Helium 0x2d8490
 *
 * Verbatim decode of the 21-line disasm:
 *
 *   0x2d8490  movl  $0xffffffff, %eax        ; rc = -1 (preset for OOR path)
 *   0x2d8495  cmpl  $0x2, %esi               ; unsigned cmp: paramIdx vs 2
 *   0x2d8498  ja    0x2d84d8                 ; if paramIdx > 2u -> retq (rc=-1)
 *   0x2d849a  pushq %rbp
 *   0x2d849b  movq  %rsp, %rbp
 *   0x2d849e  movq  0x198(%rdi), %rax        ; %rax = this->paramTable
 *   0x2d84a5  movl  %esi, %ecx               ; zext paramIdx to 64
 *   0x2d84a7  shlq  $5,   %rcx               ; %rcx = paramIdx * 32
 *   0x2d84ab  movss  (%rax,%rcx),  %xmm0     ; xmm0 = table[i].v0
 *   0x2d84b0  movss %xmm0,          (%rdx)   ; out[0] = v0
 *   0x2d84b4  movss 0x4(%rax,%rcx), %xmm0    ; xmm0 = table[i].v1
 *   0x2d84ba  movss %xmm0,      0x4(%rdx)    ; out[1] = v1
 *   0x2d84bf  movss 0x8(%rax,%rcx), %xmm0    ; xmm0 = table[i].v2
 *   0x2d84c5  movss %xmm0,      0x8(%rdx)    ; out[2] = v2
 *   0x2d84ca  movss 0xc(%rax,%rcx), %xmm0    ; xmm0 = table[i].v3
 *   0x2d84d0  movss %xmm0,      0xc(%rdx)    ; out[3] = v3
 *   0x2d84d5  xorl  %eax, %eax               ; rc = 0
 *   0x2d84d7  popq  %rbp
 *   0x2d84d8  retq
 *
 * `movss` is a 32-bit single-precision load/store — every lane is wrapped
 * in `Math.fround` per the numerics rule (Rule 4).
 *
 * @param self      — the `HgcAnaglyph` instance (this).
 * @param paramIdx  — 0-based parameter index; unsigned compare against 2.
 * @param out       — 4-lane float32 output buffer (`float* %rdx`); the
 *                    method writes lanes 0..3 only when paramIdx <= 2.
 * @returns 0 on success, -1 (as a signed i32) when paramIdx is out of range.
 */
export function HgcAnaglyph_GetParameter(
  self: HgcAnaglyphState,
  paramIdx: number,
  out: Float32Array,
): number {
  // @0x2d8490 : movl $0xffffffff, %eax  ; @0x2d8495-8 : cmpl $2 / ja
  // Unsigned compare: reinterpret paramIdx as u32. Any negative value
  // (or > 2) takes the ja and returns -1 without touching `out`.
  const idxU32 = paramIdx >>> 0; // u32-reinterpret (mirrors zext + unsigned cmp)
  if (idxU32 > 2) {
    return -1; // signed i32; 0xFFFFFFFF -> -1 in TS number space
  }

  // @0x2d849e : movq 0x198(%rdi), %rax  ; %rax = this->paramTable
  const table = self.paramTable;
  // @0x2d84a5-b : ecx = idx ; rcx = idx << 5  (32-byte stride) — modeled as
  // a struct-array index, not a raw byte offset, per Rule 5.
  const e = table[idxU32];

  // @0x2d84ab..d0 : four movss loads/stores. f32 fidelity via Math.fround.
  out[0] = Math.fround(e.v0); // @0x2d84ab / @0x2d84b0
  out[1] = Math.fround(e.v1); // @0x2d84b4 / @0x2d84ba
  out[2] = Math.fround(e.v2); // @0x2d84bf / @0x2d84c5
  out[3] = Math.fround(e.v3); // @0x2d84ca / @0x2d84d0

  // @0x2d84d5 : xorl %eax, %eax ; @0x2d84d7-8 : popq/retq
  return 0;
}
