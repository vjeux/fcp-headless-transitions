// fourCCToString.ts — a Flexo free function that formats a 32-bit FourCC (`unsigned int`)
// into a caller-provided fixed byte buffer (sret). Faithfully transcribed from the FCP Flexo
// framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly:
//   raw-port/re/disasm/Flexo.__Z14fourCCToStringj.s   (__Z14fourCCToStringj @0xe41d20)
//
// ABI: sret. The buffer pointer arrives in %rdi (moved to %rax); the FourCC arrives in %esi.
// (The demangled prototype `fourCCToString(unsigned int)` returns a small aggregate BY VALUE,
// so the compiler passes the return slot as the hidden first pointer arg %rdi.) The function
// writes a leading tag byte at offset 0, the character bytes starting at offset 1, and a NUL
// terminator, then returns.
//
// The body has exactly two cases keyed on the FourCC value:
//
//   SPECIAL CASE  (fourCC == 0x20, i.e. the ASCII space ' '):
//     @0xe41d2c movabsq $0x2942475241283233,%rcx ; movq %rcx,0x1(%rax)
//        -> writes the 8 bytes "32(ARGB)" (little-endian store of the immediate) at buf[1..8].
//     @0xe41d3c movl $0x9,%edx ; movb $0x0,(%rax,%rdx)  -> buf[9] = 0x00 (NUL terminator).
//     @0xe41d3a movb $0x10,%cl ; @0xe41d45 movb %cl,(%rax) -> buf[0] = 0x10 (tag byte = 16).
//
//   NORMAL CASE   (fourCC != 0x20):
//     @0xe41d49 bswapl %esi ; movl %esi,0x1(%rax)
//        -> byte-swaps the FourCC to big-endian order (human-readable 4 chars) at buf[1..4].
//     @0xe41d50 movl $0x5,%edx ; movb $0x0,(%rax,%rdx)  -> buf[5] = 0x00 (NUL terminator).
//     @0xe41d4e movb $0x8,%cl ; @0xe41d59 movb %cl,(%rax) -> buf[0] = 0x08 (tag byte = 8).
//
// The leading tag byte is exactly twice the character count (0x10=16 for 8 chars, 0x08=8 for
// 4 chars) — faithfully transcribed as the literal the machine stores, not re-derived. The max
// byte offset the machine ever writes is 9 (special case), so the buffer here is sized to that
// written extent (10 bytes); the caller owns the real allocation. Bytes the machine does not
// write are left 0 (this port does not read them and the machine leaves them untouched).
//
// No in-scope callees, no externs, no indirect calls — pure buffer fill.

/**
 * fourCCToString(unsigned int) -> filled byte buffer (sret)
 * @0xADDR Flexo 0x0000000000e41d20  (__Z14fourCCToStringj)
 *
 * Returns the caller's return-slot buffer (the machine returns %rax == the sret pointer).
 * Here we model the sret slot as a fresh Uint8Array of the 10-byte written extent.
 *
 * @param fourCC the 32-bit FourCode (passed in %esi as an unsigned int).
 */
export function fourCCToString(fourCC: number): Uint8Array {
  // sret buffer (the machine's %rdi/%rax). 10 = highest written offset (9) + 1.
  const buf = new Uint8Array(10);
  const esi = fourCC >>> 0;

  // @0xe41d27 cmpl $0x20,%esi ; @0xe41d2a jne 0xe41d49 : special-case iff fourCC == 0x20.
  if (esi === 0x20) {
    // @0xe41d2c movabsq $0x2942475241283233,%rcx ; @0xe41d36 movq %rcx,0x1(%rax) :
    //   little-endian store of the 64-bit immediate = the ASCII bytes "32(ARGB)".
    const magic = 0x2942475241283233n;
    for (let i = 0; i < 8; i++) {
      buf[1 + i] = Number((magic >> BigInt(8 * i)) & 0xffn);
    }
    // @0xe41d3c movl $0x9,%edx ; @0xe41d41 movb $0x0,(%rax,%rdx) : buf[9] = 0.
    buf[9] = 0x00;
    // @0xe41d3a movb $0x10,%cl ; @0xe41d45 movb %cl,(%rax) : buf[0] = 0x10.
    buf[0] = 0x10;
    // @0xe41d47 retq : return %rax (the buffer).
    return buf;
  }

  // --- normal case @0xe41d49 ---
  // @0xe41d49 bswapl %esi : reverse the 4 bytes of the FourCC (-> big-endian char order).
  const be =
    (((esi & 0xff) << 24) |
      ((esi & 0xff00) << 8) |
      ((esi >>> 8) & 0xff00) |
      ((esi >>> 24) & 0xff)) >>>
    0;
  // @0xe41d4b movl %esi(bswapped),0x1(%rax) : little-endian store of the swapped word at buf[1..4].
  buf[1] = be & 0xff;
  buf[2] = (be >>> 8) & 0xff;
  buf[3] = (be >>> 16) & 0xff;
  buf[4] = (be >>> 24) & 0xff;
  // @0xe41d50 movl $0x5,%edx ; @0xe41d55 movb $0x0,(%rax,%rdx) : buf[5] = 0.
  buf[5] = 0x00;
  // @0xe41d4e movb $0x8,%cl ; @0xe41d59 movb %cl,(%rax) : buf[0] = 0x08.
  buf[0] = 0x08;
  // @0xe41d5b retq : return %rax (the buffer).
  return buf;
}
