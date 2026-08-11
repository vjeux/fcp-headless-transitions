// HgcYUV420TriPlanar_alpha.ts — raw transcription of Helium `HgcYUV420TriPlanar_alpha`.
//
// One of Helium's `Hgc*` render-graph node classes: the alpha stage of the YUV 4:2:0 TRI-planar
// (separate Y, Cb and Cr planes) conversion path. ONE symbol is transcribed in this file —
// `shaderDescription() const`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x2e03c0  HgcYUV420TriPlanar_alpha::shaderDescription() const
//                __ZNK24HgcYUV420TriPlanar_alpha17shaderDescriptionEv
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZNK24HgcYUV420TriPlanar_alpha17shaderDescriptionEv Helium`):
//   raw-port/re/disasm/Helium.__ZNK24HgcYUV420TriPlanar_alpha17shaderDescriptionEv.s (22 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from `nm -n -arch x86_64` (all `t`, local):
//   Setup @0x2e0100, GetProgram @0x2e0170, InitProgramDescriptor @0x2e01a0, BindTexture @0x2e0410,
//   Bind @0x2e0480, RenderTile_AVX @0x2e04a0, RenderTile @0x2e0700, GetDOD @0x2e0a80,
//   GetROI @0x2e0aa0, C2 @0x2e0ac0, C1 @0x2e0bd0, D2 @0x2e0ce0, D1 @0x2e0d30, D0 @0x2e0d80,
//   SetParameter @0x2e0dd0, GetParameter @0x2e0de0, GetOutput @0x2e0df0.
//
// LAYOUT: none is observable from this body. The function returns `std::string` by value, so under
// the SysV ABI %rdi is the caller's sret buffer and `this` arrives in %rsi — and %rsi is never
// read. Inventing fields would be inventing a layout the instruction stream does not show; the real
// layout must come from the ctor/RenderTile units when those are claimed.
//
// CALLEES: one true out-of-scope extern, `operator new(unsigned long)` (`__Znwm`, reached through
// the Helium symbol stub at 0x3c4fb2 @0x2e03ce). It is the std::string heap allocation — see the
// method doc for why a TS string models it faithfully. No in-scope callee, no indirect or virtual
// dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `HgcYUV420TriPlanar_alpha` — the alpha node of the YUV 4:2:0 tri-planar path.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this`
 * (see the file header).
 *
 * @Helium 0x2e03c0
 */
export class HgcYUV420TriPlanar_alpha {
  /**
   * `HgcYUV420TriPlanar_alpha::shaderDescription() const` — @Helium 0x2e03c0
   *   `__ZNK24HgcYUV420TriPlanar_alpha17shaderDescriptionEv`
   *
   * FULL transcription — every instruction, in order. Returns `std::string` by value, so %rdi is
   * the caller-provided sret buffer and %rsi is `this`:
   *
   *   0x2e03c0  pushq  %rbp                    ; frame setup (no TS counterpart)
   *   0x2e03c1  movq   %rsp,%rbp
   *   0x2e03c4  pushq  %rbx
   *   0x2e03c5  pushq  %rax                    ; 16-byte stack alignment for the call
   *   0x2e03c6  movq   %rdi,%rbx               ; rbx = sret (the returned std::string)
   *   0x2e03c9  movl   $0x20,%edi              ; operator new size = 0x20 = 32 bytes
   *   0x2e03ce  callq  0x3c4fb2                ; symbol stub for __Znwm (operator new)
   *   0x2e03d3  movq   %rax,0x10(%rbx)         ; string.__data_ (+0x10) = heap buffer
   *   0x2e03d7  movq   $0x21,(%rbx)            ; string.__cap_  (+0x00) = 0x21
   *   0x2e03de  movq   $0x1f,0x8(%rbx)         ; string.__size_ (+0x08) = 0x1f = 31
   *   0x2e03e6  movups 0x69d456(%rip),%xmm0    ; 16 bytes from 0x2e03ed+0x69d456 = 0x97d843
   *   0x2e03ed  movups %xmm0,0xf(%rax)         ; -> buffer[0x0f..0x1e]
   *   0x2e03f1  movups 0x69d43c(%rip),%xmm0    ; 16 bytes from 0x2e03f8+0x69d43c = 0x97d834
   *   0x2e03f8  movups %xmm0,(%rax)            ; -> buffer[0x00..0x0f]
   *   0x2e03fb  movb   $0x0,0x1f(%rax)         ; NUL terminator at buffer[31]
   *   0x2e03ff  movq   %rbx,%rax               ; return the sret pointer
   *   0x2e0402  addq   $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   0x2e0409  nopl   (%rax)                  ; alignment padding, not executed
   *
   * WHAT IT BUILDS. libc++'s LONG (heap) string representation in the **x86_64** layout this port
   * is transcribed from: `+0x00 __cap_` with `is_long` in bit 0, `+0x08 __size_`, `+0x10 __data_`.
   * `__cap_ = 0x21` is capacity 0x20 = 32 with the is_long bit set, matching the `operator new(0x20)`
   * three instructions earlier; `__size_ = 0x1f` = 31 characters, one under the capacity so the NUL
   * fits. (The short/SSO form used by the landed `HgcVibrancy::shaderDescription` @Flexo 0x146ec90
   * tops out at 22 characters, hence the heap allocation here. The arm64 slice lays std::string out
   * differently — `is_long` in the sign bit of +0x17, data at +0x00 — which is why the oracle below
   * was run under Rosetta.)
   *
   * THE CHARACTERS. Both `movups` sources land in Helium's `__TEXT,__cstring` (section vmaddr
   * 0x8b51a0, file offset 9130400): 0x97d834 holds the 31-byte C string
   * "HgcYUV420TriPlanar_alpha [hgc1]", and 0x97d843 is that same literal + 0x0f, i.e. its last 16
   * bytes "nar_alpha [hgc1]". The two 16-byte stores tile 31 bytes as 16 + 16 with ONE byte of
   * overlap (the store at +0x0f rewrites buffer[0x0f] — 'a' of "Planar" — with the same value),
   * then the NUL lands at 0x1f. Reassembled, the buffer is exactly that literal. The trailing
   * " [hgc1]" is the shader-family marker every sibling description carries.
   *
   * MODELLING. A TS `string` is the faithful stand-in for the returned `std::string`: the heap
   * allocation, the capacity word and the NUL terminator are representation details of libc++'s
   * value, not observable content of it, and this project models `std::string` results as TS
   * strings throughout (precedent: the landed `HgcVibrancy::shaderDescription` @Flexo 0x146ec90 and
   * `HgcYUV420BiPlanar_luma_pack2::shaderDescription` @Helium 0x2fc270).
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local), so it is not
   * dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Helium) + 0x2e03c0`, with the vmaddr taken
   * from `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta:
   * OPS_LOG, worker 1, 2026-08-10). Called three times with a 24-byte sret buffer poisoned to 0xAA
   * and a dummy `this`. Live FCP wrote `__cap_=0x21`, `__size_=0x1f`, returned the sret pointer in
   * %rax, and the heap buffer held exactly "HgcYUV420TriPlanar_alpha [hgc1]" with a NUL at index 31
   * — identical on every call, and identical to what this port returns.
   *
   * @returns the shader description string.
   */
  shaderDescription(): string {
    // @0x2e03e6..0x2e03fb — the 31-byte literal at Helium 0x97d834, assembled 16 + 16 (overlapping
    // by one byte at +0x0f) + NUL.
    return "HgcYUV420TriPlanar_alpha [hgc1]";
  }
}
