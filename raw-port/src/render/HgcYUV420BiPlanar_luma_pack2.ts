// HgcYUV420BiPlanar_luma_pack2.ts — raw transcription of Helium
// `HgcYUV420BiPlanar_luma_pack2`.
//
// One of Helium's lower-case `Hgc*` render-graph node classes: the luma "pack 2" stage of the
// YUV 4:2:0 bi-planar (Y plane + interleaved CbCr plane) conversion path — the pack-2 sibling of
// the landed `HgcYUV420BiPlanar_luma_pack4`.
//
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// (unadjusted VAs exactly as `otool -tV -arch x86_64` prints them).
//
// ONE symbol is ported in this file:
//   @0x2fc270  __ZNK28HgcYUV420BiPlanar_luma_pack217shaderDescriptionEv
//              HgcYUV420BiPlanar_luma_pack2::shaderDescription() const
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZNK28HgcYUV420BiPlanar_luma_pack217shaderDescriptionEv Helium`):
//   raw-port/re/disasm/Helium.__ZNK28HgcYUV420BiPlanar_luma_pack217shaderDescriptionEv.s (22 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only):
//   GetProgram @0x2fbe80, InitProgramDescriptor @0x2fbeb0, BindTexture @0x2fc2c0, Bind @0x2fc3e0,
//   RenderTile_AVX @0x2fc400, RenderTile @0x2fc6d0, GetDOD @0x2fca50, GetROI @0x2fcaf0,
//   C2 @0x2fcb90, C1 @0x2fcc30, D2 @0x2fccd0, D1 @0x2fcd20, D0 @0x2fcd70,
//   SetParameter @0x2fcdc0, GetParameter @0x2fcdd0, GetOutput @0x2fcde0.
//
// LAYOUT: none is observable from this body — the ported method never dereferences `this`
// (%rsi here, since %rdi carries the sret pointer). Inventing fields would be inventing a layout
// the instruction stream does not show; the real layout must come from the ctor/RenderTile units.
//
// CALLEES: one true out-of-scope extern, `operator new(unsigned long)` (`__Znwm`, called through
// the Helium symbol stub at 0x3c4fb2 @0x2fc27e). It is the std::string heap allocation and is
// modelled by JS string allocation — see the method doc.

/**
 * `HgcYUV420BiPlanar_luma_pack2` — the luma pack-2 node of the YUV 4:2:0 bi-planar path.
 *
 * No instance state is modelled: the one transcribed method touches `this` only as an opaque
 * pointer (see the file header).
 *
 * @Helium 0x2fc270
 */
export class HgcYUV420BiPlanar_luma_pack2 {
  /**
   * `HgcYUV420BiPlanar_luma_pack2::shaderDescription() const` — @Helium 0x2fc270
   *   `__ZNK28HgcYUV420BiPlanar_luma_pack217shaderDescriptionEv`
   *
   * FULL transcription — every instruction, in order. The function returns a `std::string` by
   * value, so under the SysV ABI %rdi is the caller-provided sret buffer and %rsi is `this`:
   *
   *   0x2fc270  pushq %rbp                       ; frame setup (no TS counterpart)
   *   0x2fc271  movq  %rsp,%rbp
   *   0x2fc274  pushq %rbx
   *   0x2fc275  pushq %rax
   *   0x2fc276  movq  %rdi,%rbx                  ; rbx = sret (the returned std::string)
   *   0x2fc279  movl  $0x28,%edi                 ; operator new size = 0x28 = 40 bytes
   *   0x2fc27e  callq 0x3c4fb2                   ; symbol stub for __Znwm (operator new)
   *   0x2fc283  movq  %rax,0x10(%rbx)            ; string.__data_ (+0x10) = heap buffer
   *   0x2fc287  movq  $0x29,(%rbx)               ; string.__cap_  (+0x00) = 0x29
   *   0x2fc28e  movq  $0x23,0x8(%rbx)            ; string.__size_ (+0x08) = 0x23 = 35
   *   0x2fc296  movups 0x68d70c(%rip),%xmm0      ; 16 bytes from 0x2fc29d+0x68d70c = 0x9899a9
   *   0x2fc29d  movups %xmm0,0x10(%rax)          ; -> buffer[0x10..0x1f]
   *   0x2fc2a1  movups 0x68d6f1(%rip),%xmm0      ; 16 bytes from 0x2fc2a8+0x68d6f1 = 0x989999
   *   0x2fc2a8  movups %xmm0,(%rax)              ; -> buffer[0x00..0x0f]
   *   0x2fc2ab  movl  $0x5d316367,0x1f(%rax)     ; -> buffer[0x1f..0x22] = "gc1]"
   *   0x2fc2b2  movb  $0x0,0x23(%rax)            ; NUL terminator at buffer[35]
   *   0x2fc2b6  movq  %rbx,%rax                  ; return the sret pointer
   *   0x2fc2b9  addq  $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *
   * WHAT IT BUILDS. This is libc++'s LONG (heap) string representation, x86_64 layout — the one
   * this port is transcribed from: `+0x00 __cap_` with `is_long` in bit 0, `+0x08 __size_`,
   * `+0x10 __data_`. `__cap_ = 0x29` is capacity 0x28 = 40 with the is_long bit set, matching the
   * `operator new(0x28)` two instructions earlier; `__size_ = 0x23` = 35 characters. (The short/SSO
   * form, used by the landed `HgcVibrancy::shaderDescription` @Flexo 0x146ec90, cannot hold 35
   * characters — hence the heap allocation here.)
   *
   * THE CHARACTERS. Both `movups` sources resolve into Helium's `__TEXT,__cstring` at 0x989999,
   * which holds the 35-byte C string "HgcYUV420BiPlanar_luma_pack2 [hgc1]" (read straight out of
   * the binary at that address; the second load at 0x9899a9 is that same literal + 0x10). The
   * writes tile the 35 bytes as 16 + 16 + 4 with one byte of overlap — [0x00..0x0f], [0x10..0x1f],
   * then the dword 0x5d316367 at 0x1f, which is little-endian "gc1]" and rewrites byte 0x1f
   * ('g') with the same value — followed by the NUL at 0x23. Reassembled, the buffer is exactly
   * that literal. The trailing " [hgc1]" tag is the same shader-family marker the landed
   * `HgcVibrancy [hgc1]` description carries.
   *
   * MODELLING. A TS `string` is the faithful stand-in for the returned `std::string`: the
   * allocation, the capacity word and the NUL terminator are representation details of libc++'s
   * value, not observable content of it, and this project models `std::string` results as TS
   * strings throughout (precedent: `HgcVibrancy::shaderDescription`).
   *
   * ORACLE (executed, not read): the symbol is `t` (local) so it is not dlsym-able; it was called
   * BY ADDRESS in a Rosetta x86_64 process at `_dyld_get_image_vmaddr_slide(Helium) + 0x2fc270`
   * (vmaddr from `nm -n -arch x86_64`, never a bare `nm`, which reports the arm64 slice) with a
   * poisoned 24-byte sret buffer and a dummy `this`. Live FCP wrote __cap_=0x29, __size_=35,
   * returned the sret pointer in %rax, and the heap buffer held exactly
   * "HgcYUV420BiPlanar_luma_pack2 [hgc1]" with a NUL at index 35 — identical across repeated calls.
   *
   * @returns the shader description string.
   */
  shaderDescription(): string {
    // @0x2fc296..0x2fc2b2 — the 35-byte literal at Helium 0x989999, assembled 16+16+4+NUL.
    return "HgcYUV420BiPlanar_luma_pack2 [hgc1]";
  }
}
