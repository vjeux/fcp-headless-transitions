// swizzleFloatPixels — anonymous-namespace helper from ProCore's PCBitmap channel-swizzle code.
// Builds a 4-byte channel-permutation map from a (srcOrder, dstOrder) SwizzleOrder pair and hands
// it to Accelerate.framework's vImagePermuteChannels_ARGBFFFF to permute the channels of a float
// (ARGB-FFFF) vImage_Buffer in place. There is an integer-8888 sibling in the same translation
// unit (calls _vImagePermuteChannels_ARGB8888 @0x46ea1) — a SEPARATE symbol, not ported here.
//
// Symbol: __ZN12_GLOBAL__N_118swizzleFloatPixelsERK13vImage_BufferN8PCBitmap12SwizzleOrderES2_S4_
// Demangled: (anonymous namespace)::swizzleFloatPixels(vImage_Buffer const&,
//                PCBitmap::SwizzleOrder, vImage_Buffer const&, PCBitmap::SwizzleOrder)
// Address:  @ProCore 0x46d54
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_118swizzleFloatPixelsERK13vImage_BufferN8PCBitmap12SwizzleOrderES2_S4_.s
//
// Register-level body (0x46d54..0x46df7):
//   0x46d54 movl %ecx,%eax            ; eax = dstOrder                      (arg4 %ecx)
//   0x46d56 cmpl %ecx,%esi            ; flags = srcOrder - dstOrder         (arg2 %esi)
//   0x46d58 jne  0x46d66              ; if srcOrder != dstOrder -> build permute
//   0x46d5a movq (%rdi),%rcx          ; rcx = src.data       (vImage_Buffer +0x00)   (arg1 %rdi)
//   0x46d5d cmpq (%rdx),%rcx          ; flags = src.data - dst.data         (arg3 %rdx = dst)
//   0x46d60 je   0x46df7              ; if same order AND same buffer -> ret (no-op)
//   ; ---- build permute map ----
//   0x46d6e leal (,%rsi,8),%ecx       ; cl = srcOrder*8  (bit-shift amount)
//   0x46d75 movl $0x2030001,%r9d ; 0x46d7b shrl %cl,%r9d    ; r9b  = (0x2030001 >> (srcOrder*8)) & 0xff
//   0x46d7e movl $0x1020102,%r8d ; 0x46d84 shrl %cl,%r8d    ; r8b  = (0x1020102 >> (srcOrder*8)) & 0xff
//   0x46d87 movl $0x3000300,%r10d; 0x46d8d shrl %cl,%r10d   ; r10b = (0x3000300 >> (srcOrder*8)) & 0xff
//   0x46d90 cmpl $0x3,%eax ; 0x46d93 ja 0x46de1 ; if (unsigned)dstOrder > 3 -> skip fill, call anyway
//   0x46d95 xorb $0x3,%sil           ; sil = srcOrder ^ 3
//   0x46d9b leaq 0x56(%rip),%rcx      ; rcx = jump-table base = 0x46da2 + 0x56 = 0x46df8
//   0x46da2 movslq (%rcx,%rax,4),%rax ; rax = table[dstOrder] (int32, sign-extended)
//   0x46da6 addq %rcx,%rax ; 0x46da9 jmpq *%rax
//   ; jump table @0x46df8 raw bytes: b3 ff ff ff | cf ff ff ff | bb ff ff ff | c5 ff ff ff
//   ;   dst=0 -> 0x46df8 - 77 = 0x46dab   dst=1 -> 0x46df8 - 49 = 0x46dc7
//   ;   dst=2 -> 0x46df8 - 69 = 0x46db3   dst=3 -> 0x46df8 - 59 = 0x46dbd
//   ; permMap bytes are written to -0x4(%rbp)[0]..-0x1(%rbp)[3] = [al, cl, r8b, sil]:
//   ; dst=0 @0x46dab: al=r10,cl=r9                     -> perm=[r10,  r9,   r8,   so^3]
//   ; dst=2 @0x46db3: al=r10,cl=so^3,sil=r9            -> perm=[r10,  so^3, r8,   r9  ]
//   ; dst=3 @0x46dbd: al=so^3,cl=r8,r8=r9,sil=r10      -> perm=[so^3, r8,   r9,   r10 ]
//   ; dst=1 @0x46dc7: al=r9,cl=r8,r8=so^3,sil=r10      -> perm=[r9,   r8,   so^3, r10 ]
//   0x46dd3 movb %al,-0x4(%rbp) ... 0x46ddd movb %sil,-0x1(%rbp)   ; store the 4 permute bytes
//   0x46de1 leaq -0x4(%rbp),%rax      ; rax = &permMap
//   0x46de5 movq %rdx,%rsi            ; arg2 = dst buffer  (%rdx = arg3 = dst)
//   0x46de8 movq %rax,%rdx            ; arg3 = &permMap
//   0x46deb xorl %ecx,%ecx            ; arg4 = 0 (kvImageNoFlags)
//   0x46ded callq _vImagePermuteChannels_ARGBFFFF   ; (src=%rdi, dest=%rsi, permuteMap=%rdx, flags=0)
//   0x46df7 retq
//
// NOTE on the ABI at the call: %rdi (arg1) is still the ORIGINAL src vImage_Buffer (never clobbered),
// %rsi is set from %rdx (the dst buffer), %rdx points at the freshly-built permute map. That matches
// vImagePermuteChannels_ARGBFFFF(const vImage_Buffer *src, const vImage_Buffer *dest,
//                                const uint8_t permuteMap[4], vImage_Flags flags).
//
// FAITHFUL PORT — the permute-map derivation (the machine's real work) is transcribed exactly; the
// terminal Accelerate call is a TRUE out-of-scope extern and throws at the boundary, exactly like
// dovImageTransform.ts / writeOpaqueBlack.ts handle their vImage/Accelerate calls.

/**
 * vImage_Buffer — Accelerate.framework struct (libaccelerate SDK header). Only `.data` is read by
 * this function (to short-circuit the same-order-same-buffer no-op); the rest is opaque here.
 *   +0x00 void*  data ; +0x08 size_t height ; +0x10 size_t width ; +0x18 size_t rowBytes
 */
export interface VImageBuffer {
  /** +0x00 base pointer to the pixel data (identity compared at @0x46d5d). */
  data: Float32Array | ArrayBuffer | null;
  /** +0x08 rows */
  height?: number;
  /** +0x10 pixels per row */
  width?: number;
  /** +0x18 bytes between rows */
  rowBytes?: number;
}

/**
 * PCBitmap::SwizzleOrder — a 0..3 channel-ordering enum. The exact symbolic names are not needed
 * for the permute arithmetic (the code operates purely on the numeric index 0..3); the three magic
 * words 0x2030001 / 0x1020102 / 0x3000300 encode, per source-order, the destination channel each
 * output slot reads from. Modelled as the raw 0..3 index the disasm uses.
 */
export type SwizzleOrder = number;

/**
 * (anonymous namespace)::swizzleFloatPixels(src, srcOrder, dst, dstOrder)
 * @ProCore 0x46d54  __ZN12_GLOBAL__N_118swizzleFloatPixelsERK13vImage_BufferN8PCBitmap12SwizzleOrderES2_S4_
 *
 * Faithful body: (1) same-order + same-buffer fast no-op; (2) build the 4-byte permute map from the
 * three shifted constants keyed by srcOrder and the jump-table case keyed by dstOrder; (3) hand it
 * to _vImagePermuteChannels_ARGBFFFF (out-of-scope Accelerate extern — throw at the boundary).
 *
 * Returns the built permuteMap (never in FCP — the machine returns void) purely so a reviewer / a
 * later Accelerate-boundary port can inspect the exact derivation before the throw; the actual
 * channel permutation is performed by Accelerate and is not reproduced here.
 */
export function swizzleFloatPixels(
  src: VImageBuffer,
  srcOrder: SwizzleOrder,
  dst: VImageBuffer,
  dstOrder: SwizzleOrder,
): void {
  // @0x46d54 movl %ecx,%eax ; @0x46d56 cmpl %ecx,%esi ; @0x46d58 jne — srcOrder vs dstOrder.
  // @0x46d5a..0x46d60 — if equal orders AND src.data === dst.data, it's a pure no-op; return.
  if (srcOrder === dstOrder) {
    // @0x46d5a movq (%rdi),%rcx ; @0x46d5d cmpq (%rdx),%rcx ; @0x46d60 je 0x46df7
    if (src.data === dst.data) {
      return;
    }
  }

  // @0x46d6e leal (,%rsi,8),%ecx — the shift amount is srcOrder*8 (byte lane select).
  const shift = (srcOrder << 3) & 0xff;

  // @0x46d75/0x46d7b, 0x46d7e/0x46d84, 0x46d87/0x46d8d — three constants shifted right by srcOrder*8,
  // low byte kept. Use >>> so the shift matches the machine's unsigned SHR of a 32-bit register.
  const r9 = (0x2030001 >>> shift) & 0xff; // @0x46d75 imm=0x2030001
  const r8 = (0x1020102 >>> shift) & 0xff; // @0x46d7e imm=0x1020102
  const r10 = (0x3000300 >>> shift) & 0xff; // @0x46d87 imm=0x3000300

  // @0x46d95 xorb $0x3,%sil — sil = srcOrder ^ 3 (used as one of the permute lanes).
  const soX3 = (srcOrder ^ 0x3) & 0xff;

  // permMap[4] laid out at -0x4(%rbp)[0]..-0x1(%rbp)[3]. @0x46d90 cmpl $0x3,%eax ; @0x46d93 ja:
  // when (unsigned)dstOrder > 3 the fill is SKIPPED (stack bytes left as-is) and the extern is still
  // called. We model the >3 path as an unpopulated map (the machine passes uninitialized stack here).
  let permMap: readonly [number, number, number, number] | null = null;

  // @0x46d9b..0x46da9 — jump table on dstOrder (0..3). Cases transcribed from the register moves
  // (see the header block for the exact per-case al/cl/r8b/sil traces).
  switch (dstOrder >>> 0) {
    case 0: // @0x46dab: al=r10, cl=r9 ; r8b=r8 ; sil=soX3
      permMap = [r10, r9, r8, soX3];
      break;
    case 1: // @0x46dc7: al=r9, cl=r8, r8=soX3 ; then @0x46dd0 sil=r10
      permMap = [r9, r8, soX3, r10];
      break;
    case 2: // @0x46db3: al=r10, cl=soX3, sil=r9 ; r8b=r8
      permMap = [r10, soX3, r8, r9];
      break;
    case 3: // @0x46dbd: al=soX3, cl=r8, r8=r9 ; then @0x46dd0 sil=r10
      permMap = [soX3, r8, r9, r10];
      break;
    default:
      // @0x46d93 ja 0x46de1 — dstOrder > 3: no fill; permMap stays null (uninitialized stack).
      permMap = null;
      break;
  }

  // @0x46de1..0x46ded — call _vImagePermuteChannels_ARGBFFFF(src, dst, &permMap, flags=0).
  // Accelerate.framework is a TRUE OUT-OF-SCOPE EXTERN (symbol stub @ProCore 0xdec12, dyld-resolved
  // to the live vImage implementation). Per policy (see dovImageTransform.ts / the CGColorSpace
  // externs) we throw at the boundary citing the call-site + import-stub addresses. The RECORD of
  // exactly what would be dispatched (the derived permute map) is preserved in the message so a
  // reviewer or a later Accelerate-boundary port can wire the real permutation.
  throw new Error(
    `swizzleFloatPixels @ProCore 0x46d54: would call vImagePermuteChannels_ARGBFFFF(` +
      `src=<vImage_Buffer data=${String(src.data && "set")}>, ` +
      `dest=<vImage_Buffer data=${String(dst.data && "set")}>, ` +
      `permuteMap=${permMap ? `[${permMap.join(",")}]` : "<uninitialized: dstOrder>3>"}, ` +
      `flags=0) via import stub @ProCore 0xdec12. ` +
      `_vImagePermuteChannels_ARGBFFFF is a TRUE out-of-scope extern (Accelerate.framework, ` +
      `libvImage) — boundary stub per policy (same as _vImageConvert_AnyToAny, _CGColorSpaceRelease).`,
  );
}
