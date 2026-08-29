// HgcBT2100_HLG_OOTF_InverseOOTF — Helium BT.2100 HLG render node.
//
// This file currently transcribes one method:
//
//   HgcBT2100_HLG_OOTF_InverseOOTF::shaderDescription() const
//   MANGLED: __ZNK30HgcBT2100_HLG_OOTF_InverseOOTF17shaderDescriptionEv
//   ADDRESS: Helium @0x003b2420 (x86_64 slice)
//
// Complete disassembly:
//
//   0x3b2420  pushq  %rbp
//   0x3b2421  movq   %rsp, %rbp
//   0x3b2424  pushq  %rbx
//   0x3b2425  pushq  %rax
//   0x3b2426  movq   %rdi, %rbx
//   0x3b2429  movl   $0x28, %edi
//   0x3b242e  callq  __Znwm
//   0x3b2433  movq   %rax, 0x10(%rbx)
//   0x3b2437  movq   $0x29, (%rbx)
//   0x3b243e  movq   $0x25, 0x8(%rbx)
//   0x3b2446  movabsq $0x5d316367685b2046, %rcx
//   0x3b2450  movq   %rcx, 0x1d(%rax)
//   0x3b2454  movups Helium.__cstring@0x009dec26, %xmm0
//   0x3b245b  movups %xmm0, 0x10(%rax)
//   0x3b245f  movups Helium.__cstring@0x009dec16, %xmm0
//   0x3b2466  movups %xmm0, (%rax)
//   0x3b2469  movb   $0x0, 0x25(%rax)
//   0x3b246d  movq   %rbx, %rax
//   0x3b2470  addq   $0x8, %rsp
//   0x3b2474  popq   %rbx
//   0x3b2475  popq   %rbp
//   0x3b2476  retq
//
// The ABI uses %rdi as the hidden std::string return slot. The body allocates
// 0x28 bytes, records long-string tag/capacity 0x29 and size 0x25 (37), copies
// the 37 payload bytes, appends NUL, and returns the slot. Allocation and the
// libc++ string representation are C++ implementation details; the observable
// TS value is the exact copied string.

/**
 * Literal assembled at @Helium 0x003b2446..0x003b2469 from cstring bytes at
 * @Helium 0x009dec16 and @Helium 0x009dec26 plus immediate
 * 0x5d316367685b2046 (`"F [hgc1]"` in little-endian byte order).
 */
export const HgcBT2100_HLG_OOTF_InverseOOTF_SHADER_DESCRIPTION =
  "HgcBT2100_HLG_OOTF_InverseOOTF [hgc1]" as const;

/**
 * `HgcBT2100_HLG_OOTF_InverseOOTF::shaderDescription() const`
 * — @Helium 0x003b2420.
 *
 * Returns the exact 37-byte string constructed by the machine body. The const
 * receiver is unused; the x86_64 ABI carries it in %rsi because %rdi is the
 * hidden std::string result slot.
 */
export function HgcBT2100_HLG_OOTF_InverseOOTF_shaderDescription(): string {
  return HgcBT2100_HLG_OOTF_InverseOOTF_SHADER_DESCRIPTION;
}
