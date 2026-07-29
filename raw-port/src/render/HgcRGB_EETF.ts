// HgcRGB_EETF.ts — Helium `HgcRGB_EETF` inner render node worker for
// the composite `HGRGB_EETF` (Rec-2100 PQ Electro-Electrical Transfer
// Function). Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HgcRGB_EETF.GetParameter.s
//
// Helium symbols transcribed here:
//   @0x003bcd80  HgcRGB_EETF::GetParameter(int, float*)
//     mangled __ZN11HgcRGB_EETF12GetParameterEiPf
//
// Ctor / other methods remain FRONTIER (not yet decoded); the ctor
// is deliberately a no-op past `super()` so downstream leaves can be
// ported one at a time without inventing behaviour.
//
// STRUCT LAYOUT (partial — only fields touched by GetParameter):
//   0x00..0x197 : HGNode base (sizeof(HGNode) approx 0x198; see HGNode.ts).
//   0x198 : float*  paramBlocks
//                     A contiguous C array of stride 0x20 (=32 bytes =
//                     8 float32s) per parameter block. GetParameter
//                     reads the first 4 float32s (@+0x00..+0x0c) of the
//                     block indexed by the caller\'s `index` argument.
//                     Only indices 0 and 1 are valid — `index > 1` (as
//                     unsigned) returns -1 without touching `out`.
//                     (@0x003bcd8e loads (float*)(this+0x198) → rax;
//                      @0x003bcd97  shlq $5, %rcx == index * 32.)

import { HGNode } from "./HGNode";

/**
 * HgcRGB_EETF — inner RGB EETF worker used by `HGRGB_EETF` (wrapped as
 * subB at HGRGB_EETF+0x1a0). The FCP ctor is not yet decoded — the TS
 * ctor here only forwards to `HGNode()` and leaves subclass fields
 * uninitialised. Callers that construct this class directly and then
 * invoke `GetParameter` must set `paramBlocks_198` first; otherwise the
 * method throws a citing frontier error.
 *
 * Vtable @Helium (not yet resolved); ctor invoked from HGRGB_EETF::HGRGB_EETF
 * @0x00105860 (mangled __ZN11HgcRGB_EETFC1Ev).
 */
export class HgcRGB_EETF extends HGNode {
  /** +0x198 — a plain `float*` handed out by GetParameter with stride 0x20
   *  (8 float32s per block; only the first 4 are exposed per block). The
   *  ctor is a frontier — no real value is populated here; subclasses/tests
   *  that need it must set it explicitly. */
  paramBlocks_198: Float32Array | null = null;

  /** HgcRGB_EETF::HgcRGB_EETF() @Helium (mangled __ZN11HgcRGB_EETFC1Ev;
   *  called from HGRGB_EETF::HGRGB_EETF @0x00105860). Frontier — only the
   *  HGNode base ctor runs; subclass field init is not yet transcribed. */
  constructor() {
    super();
    // Deliberately no derived-class init here — see class-level note above.
    // Real ctor decoding is tracked as a separate ledger entry
    // (__ZN11HgcRGB_EETFC1Ev not yet transcribed).
  }

  /**
   * HgcRGB_EETF::GetParameter(int index, float* out) @Helium @0x003bcd80.
   *
   * Faithful transcription (AT&T; `dst - src` compare semantics):
   *
   *   00000000003bcd80  movl  $0xffffffff, %eax          ; ret = -1 (default)
   *   00000000003bcd85  cmpl  $0x1, %esi                 ; cmp index, 1  (i.e. index - 1)
   *   00000000003bcd88  ja    0x3bcdc8                   ; JA taken iff (index > 1) unsigned
   *   00000000003bcd8a  pushq %rbp
   *   00000000003bcd8b  movq  %rsp, %rbp
   *   00000000003bcd8e  movq  0x198(%rdi), %rax          ; rax = *(float**)(this+0x198)
   *   00000000003bcd95  movl  %esi, %ecx                 ; rcx = index (zero-ext)
   *   00000000003bcd97  shlq  $0x5, %rcx                 ; rcx = index * 32
   *   00000000003bcd9b  movss (%rax,%rcx), %xmm0         ; f32 [base + index*32 + 0x00]
   *   00000000003bcda0  movss %xmm0, (%rdx)              ; out[0] = ...
   *   00000000003bcda4  movss 0x4(%rax,%rcx), %xmm0      ; f32 [base + index*32 + 0x04]
   *   00000000003bcdaa  movss %xmm0, 0x4(%rdx)           ; out[1] = ...
   *   00000000003bcdaf  movss 0x8(%rax,%rcx), %xmm0      ; f32 [base + index*32 + 0x08]
   *   00000000003bcdb5  movss %xmm0, 0x8(%rdx)           ; out[2] = ...
   *   00000000003bcdba  movss 0xc(%rax,%rcx), %xmm0      ; f32 [base + index*32 + 0x0c]
   *   00000000003bcdc0  movss %xmm0, 0xc(%rdx)           ; out[3] = ...
   *   00000000003bcdc5  xorl  %eax, %eax                 ; ret = 0
   *   00000000003bcdc7  popq  %rbp
   *   00000000003bcdc8  retq
   *
   * Note: the JA at @0x003bcd88 branches past the frame prologue directly to
   * the trailing `retq`. `movl $0xffffffff` sets EAX before the compare, so
   * the "index out of range" path returns -1 while the "in range" path falls
   * through to `xorl %eax, %eax` (returns 0).
   *
   * `index` is treated as *unsigned* by JA — a negative signed value has its
   * high bit set and therefore compares unsigned-above 1, mapping to the
   * -1 return. `out` is written in-place; unchanged when we return -1.
   *
   * Returns: 0 on success (index in {0,1}); -1 otherwise.
   */
  GetParameter(index: number, out: Float32Array | number[]): number {
    // @0x003bcd80: default ret = -1.
    // @0x003bcd85..@0x003bcd88: JA (index > 1 unsigned) → return -1.
    // Treat `index` as uint32 to match the JA semantics exactly.
    const uidx = index >>> 0;
    if (uidx > 1) {
      return -1;
    }
    // @0x003bcd8e: rax = *(float**)(this+0x198).
    const base = this.paramBlocks_198;
    if (base === null) {
      throw new Error(
        "HgcRGB_EETF::GetParameter @Helium @0x003bcd80 — paramBlocks_198 " +
          "(field +0x198) is null; ctor __ZN11HgcRGB_EETFC1Ev not yet transcribed"
      );
    }
    // @0x003bcd97: rcx = index * 32 (stride 0x20 in bytes = 8 float32s).
    const off = uidx * 8; // in float32 units
    // @0x003bcd9b..@0x003bcdc0: copy 4 float32s [+0..+0xc] into out[0..3].
    // All movss ops are naturally f32; wrap in Math.fround defensively.
    out[0] = Math.fround(base[off + 0]);
    out[1] = Math.fround(base[off + 1]);
    out[2] = Math.fround(base[off + 2]);
    out[3] = Math.fround(base[off + 3]);
    // @0x003bcdc5: ret = 0.
    return 0;
  }
}
