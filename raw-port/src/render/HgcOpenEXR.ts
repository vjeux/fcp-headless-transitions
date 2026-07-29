// HgcOpenEXR — Helium OpenEXR-decode render node (kernel-family class).
//
// This file only contains the ONE method ported here so far. All other
// methods listed in the ledger (GetProgram, InitProgramDescriptor,
// shaderDescription, BindTexture, Bind, RenderTile[_AVX], GetDOD, GetROI,
// SetParameter, GetOutput, ctors/dtor, etc.) remain "todo" in the Helium
// ledger — future leaves will add them here alongside GetParameter.
//
// STRUCT LAYOUT (partial — only fields touched by GetParameter):
//   +0x198  float32*   params        // raw pointer to a packed array of
//                                    //   SetParameter slots. Each slot is
//                                    //   32 bytes (4 floats + 4 bytes pad,
//                                    //   stride 0x20). GetParameter copies
//                                    //   the first 16 bytes (4 floats) of
//                                    //   slot `index`. Layout recovered
//                                    //   from GetParameter @0x3327b0 (shlq
//                                    //   $0x5,%rcx sets stride 32 → 8
//                                    //   floats/slot in memory; only 4 are
//                                    //   copied out, matching HGNode's
//                                    //   4-float SetParameter API).
//
// NOTE: The valid slot range in GetParameter is [0, 5] (cmpl $0x5,%esi ; ja
// error-exit). The other slot-count constants (e.g. how many are actually
// wired by ctor / SetParameter) remain to be recovered when those methods
// are ported.

/** Opaque handle for a HgcOpenEXR instance (only `params` is decoded so far). */
export interface HgcOpenEXRState {
  /** @0x198 — raw params buffer, stride 0x20 (32 bytes) per slot, 4 f32s used. */
  params: Float32Array;
}

/**
 * `HgcOpenEXR::GetParameter(int index, float* out)` — @Helium 0x3327b0
 * (`__ZN10HgcOpenEXR12GetParameterEiPf`).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.HgcOpenEXR.
 * GetParameter.s (21 lines):
 *
 *   00 movl  $0xffffffff, %eax      ; default return = -1 (unsigned)
 *   05 cmpl  $0x5, %esi             ; unsigned compare index <=> 5
 *   08 ja    0x3327f8               ; if index > 5, jump to retq (rax=-1)
 *   0a pushq %rbp / movq %rsp,%rbp
 *   0e movq  0x198(%rdi), %rax      ; rax = this->params
 *   15 movl  %esi, %ecx             ; ecx = index (zero-extended)
 *   17 shlq  $0x5, %rcx             ; rcx = index * 32 (byte offset)
 *   1b movss (%rax,%rcx),   %xmm0   ; out[0..3] = params[slot*8 + 0..3]
 *   20 movss %xmm0, (%rdx)
 *   24 movss 0x4(%rax,%rcx),%xmm0
 *   2a movss %xmm0, 0x4(%rdx)
 *   2f movss 0x8(%rax,%rcx),%xmm0
 *   35 movss %xmm0, 0x8(%rdx)
 *   3a movss 0xc(%rax,%rcx),%xmm0
 *   40 movss %xmm0, 0xc(%rdx)
 *   45 xorl  %eax, %eax             ; rax = 0 (success)
 *   47 popq  %rbp
 *   48 retq
 *
 * Returns 0 on success, 0xFFFFFFFF (unsigned -1) if `index > 5`.
 * Copies 4 single-precision floats (Math.fround per Rule 4).
 */
export function HgcOpenEXR_GetParameter(
  self: HgcOpenEXRState,
  index: number,
  out: Float32Array,
): number {
  // @0x3327b0..@0x3327b8 — cmpl $0x5,%esi ; ja err ; the compare is against
  // `esi` (unsigned) so a negative index taken via `>>> 0` is > 5 as well.
  if ((index >>> 0) > 5) {
    // @0x3327b0 movl $0xffffffff,%eax — falls through to retq with rax=-1.
    return 0xffffffff | 0;
  }
  // @0x3327be — rax = this->params (field @0x198).
  // @0x3327c5..@0x3327c7 — rcx = index * 32; slot base in f32 units = index*8.
  const base = (index >>> 0) * 8;
  const p = self.params;
  // @0x3327cb..@0x3327f0 — copy 4 f32s (movss/movss pairs). Rule 4: f32.
  out[0] = Math.fround(p[base + 0]);
  out[1] = Math.fround(p[base + 1]);
  out[2] = Math.fround(p[base + 2]);
  out[3] = Math.fround(p[base + 3]);
  // @0x3327f5..@0x3327f8 — xorl %eax,%eax ; retq — success.
  return 0;
}
