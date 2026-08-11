// HgcYUV444TriPlanar_444To444_Type2.ts — raw transcription of Helium
// `HgcYUV444TriPlanar_444To444_Type2`.
//
// One of Helium's `Hgc*` render-graph node classes: the "Type 2" variant of the YUV 4:4:4
// tri-planar (separate Y, Cb and Cr planes) 444-to-444 conversion path. ONE symbol is transcribed
// in this file — `shaderDescription() const`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x2f71e0  HgcYUV444TriPlanar_444To444_Type2::shaderDescription() const
//                __ZNK33HgcYUV444TriPlanar_444To444_Type217shaderDescriptionEv
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZNK33HgcYUV444TriPlanar_444To444_Type217shaderDescriptionEv Helium`):
//   raw-port/re/disasm/Helium.__ZNK33HgcYUV444TriPlanar_444To444_Type217shaderDescriptionEv.s
//   (24 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from the symbol inventory (`raw-port/army/inventory/Helium.syms.txt`; all `t`):
//   GetProgram @0x2f6e80, InitProgramDescriptor @0x2f6eb0, BindTexture @0x2f7240, Bind @0x2f7320,
//   RenderTile_AVX @0x2f7340, RenderTile @0x2f75c0, GetDOD @0x2f7870, GetROI @0x2f7890,
//   C2 @0x2f78b0, C1 @0x2f7930, D2 @0x2f79b0, D1 @0x2f7a00, D0 @0x2f7a50,
//   SetParameter @0x2f7aa0, GetParameter @0x2f7ab0, GetOutput @0x2f7ac0.
//
// LAYOUT: none is observable from this body. The function returns `std::string` by value, so under
// the SysV ABI %rdi is the caller's sret buffer and `this` arrives in %rsi — and %rsi is never
// read. The class's real field layout must come from the ctor/RenderTile units when those are
// claimed; asserting anything here would be inventing what the instruction stream does not show.
//
// CALLEES: one true out-of-scope extern, `operator new(unsigned long)` (`__Znwm`, through the
// Helium symbol stub at 0x3c4fb2 @0x2f71ee) — the std::string heap allocation. No in-scope callee,
// no indirect or virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `HgcYUV444TriPlanar_444To444_Type2` — the Type-2 node of the YUV 4:4:4 tri-planar path.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this`
 * (see the file header).
 *
 * @Helium 0x2f71e0
 */
export class HgcYUV444TriPlanar_444To444_Type2 {
  /**
   * `HgcYUV444TriPlanar_444To444_Type2::shaderDescription() const` — @Helium 0x2f71e0
   *   `__ZNK33HgcYUV444TriPlanar_444To444_Type217shaderDescriptionEv`
   *
   * FULL transcription — every instruction, in order. Returns `std::string` by value, so %rdi is
   * the caller-provided sret buffer and %rsi is `this`:
   *
   *   0x2f71e0  pushq  %rbp                    ; frame setup (no TS counterpart)
   *   0x2f71e1  movq   %rsp,%rbp
   *   0x2f71e4  pushq  %rbx
   *   0x2f71e5  pushq  %rax                    ; 16-byte stack alignment for the call
   *   0x2f71e6  movq   %rdi,%rbx               ; rbx = sret (the returned std::string)
   *   0x2f71e9  movl   $0x30,%edi              ; operator new size = 0x30 = 48 bytes
   *   0x2f71ee  callq  0x3c4fb2                ; symbol stub for __Znwm (operator new)
   *   0x2f71f3  movq   %rax,0x10(%rbx)         ; string.__data_ (+0x10) = heap buffer
   *   0x2f71f7  movq   $0x31,(%rbx)            ; string.__cap_  (+0x00) = 0x31
   *   0x2f71fe  movq   $0x28,0x8(%rbx)         ; string.__size_ (+0x08) = 0x28 = 40
   *   0x2f7206  movabsq $0x5d316367685b2032,%rcx ; 8 chars, little-endian = "2 [hgc1]"
   *   0x2f7210  movq   %rcx,0x20(%rax)         ; -> buffer[0x20..0x27]
   *   0x2f7214  movups 0x68fbfd(%rip),%xmm0    ; 16 bytes from 0x2f721b+0x68fbfd = 0x986e18
   *   0x2f721b  movups %xmm0,0x10(%rax)        ; -> buffer[0x10..0x1f]
   *   0x2f721f  movups 0x68fbe2(%rip),%xmm0    ; 16 bytes from 0x2f7226+0x68fbe2 = 0x986e08
   *   0x2f7226  movups %xmm0,(%rax)            ; -> buffer[0x00..0x0f]
   *   0x2f7229  movb   $0x0,0x28(%rax)         ; NUL terminator at buffer[40]
   *   0x2f722d  movq   %rbx,%rax               ; return the sret pointer
   *   0x2f7230  addq   $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   0x2f7237  nopw   (%rax,%rax)             ; alignment padding, not executed
   *
   * WHAT IT BUILDS. libc++'s LONG (heap) string representation in the **x86_64** layout this port
   * is transcribed from: `+0x00 __cap_` with `is_long` in bit 0, `+0x08 __size_`, `+0x10 __data_`.
   * `__cap_ = 0x31` is capacity 0x30 = 48 with the is_long bit set, matching the
   * `operator new(0x30)` above; `__size_ = 0x28` = 40 characters, with the NUL as the 41st byte.
   * (The short/SSO form used by the landed `HgcVibrancy::shaderDescription` @Flexo 0x146ec90 tops
   * out at 22 characters. The arm64 slice lays std::string out differently — is_long in the sign
   * bit of byte +0x17, data at +0x00 — which is why the oracle below runs under Rosetta.)
   *
   * THE CHARACTERS, assembled from three stores of two different kinds — 16 + 16 + 8, no overlap:
   *   * `movups` from Helium's `__TEXT,__cstring` at 0x986e08 (section vmaddr 0x8b51a0, file
   *     offset 9130400), which holds the 40-byte C string
   *     "HgcYUV444TriPlanar_444To444_Type2 [hgc1]" -> buffer[0x00..0x0f];
   *   * `movups` from 0x986e18, that same literal + 0x10 -> buffer[0x10..0x1f];
   *   * the `movabsq` immediate 0x5d316367685b2032, little-endian "2 [hgc1]" -> buffer[0x20..0x27].
   * Note the compiler emits the LAST 8 bytes as an immediate rather than a third load, which is why
   * the string's tail appears twice in the disassembly listing — once in the literal it is part of,
   * once as a hex constant. Reassembled, the buffer is exactly that 40-byte literal.
   *
   * MODELLING. A TS `string` is the faithful stand-in for the returned `std::string`: the heap
   * allocation, the capacity word and the NUL terminator are representation details of libc++'s
   * value, not observable content of it, and this project models `std::string` results as TS
   * strings throughout (precedent: the landed `HgcVibrancy::shaderDescription` @Flexo 0x146ec90 and
   * `HgcYUV420BiPlanar_luma_pack2::shaderDescription` @Helium 0x2fc270).
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local), so it is not
   * dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Helium) + 0x2f71e0`, with the vmaddr taken
   * from `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta:
   * OPS_LOG, worker 1, 2026-08-10). Three calls with a 24-byte sret buffer poisoned to 0xAA: live
   * Helium wrote `__cap_ = 0x31`, `__size_ = 0x28`, returned the sret pointer in %rax, and the heap
   * buffer held exactly "HgcYUV444TriPlanar_444To444_Type2 [hgc1]" with a NUL at index 40 — every
   * time, and identical to what this port returns.
   *
   * @returns the shader description string.
   */
  shaderDescription(): string {
    // @0x2f7206..0x2f7229 — the 40-byte literal at Helium 0x986e08, assembled 16 + 16 + an 8-byte
    // immediate tail, then the NUL.
    return "HgcYUV444TriPlanar_444To444_Type2 [hgc1]";
  }
}
