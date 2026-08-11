// raw-port of Helium C++ class HGShaderTiling (7 methods)
// Source: Helium binary (x86_64 slice). All addresses cite the raw file offset.
//
// HGShaderTiling is a small POD-ish descriptor object read by shader
// kernels: it tells them how to fold a scalar input index into (x,y)
// coordinates, whether a given axis is "tiled" (packed into the mask)
// or "wrapped" (linear + modular), and how to reserve slots for a
// per-loop accumulator.
//
// STRUCT LAYOUT (partial; only offsets referenced by the 7 methods here
// have been recovered from disasm — no field names exist in the binary
// because there is no printf-based print() method on this class).
//
//   0x28 uint32 flags      (bits 0x40000000 loop-active, 0x08000000 acc,
//                           0x10000000 parametric-mask, aliased at byte
//                           0x2b: bit 0x08 = acc, bit 0x10 = parametric)
//   0x2b uint8  = high byte of the flags word at 0x28
//                 (kept as a separate field access because the binary
//                 reads it as movzbl 0x2b(%rdi))
//   0x30 uint32 base       (added into every init/loop result)
//   0x34 uint32 tile_mask  (bit i set ⇒ axis i is tiled/coord-passthru)
//   0x38 uint32 axis_off   (start offset used by texcoord)
//   0x3c uint32 axis_len   (axis extent — texcoord clamps ≥ this to 0)
//   0x48 uint32 acc_limit  (upper bound of accumulator window)
//   0x4c uint32 acc_size   (size of accumulator window / step)
//
// The `& 0x1` on shifted values, the `>> 0x1f` sar (arith-sign-extract),
// and the popcount-like reduce loop in texcoord are all mirrored 1:1.

/**
 * HGShaderTiling — 1:1 port of the FCP Helium class.
 * @see raw-port/re/disasm/Helium.HGShaderTiling.*.s
 */
export class HGShaderTiling {
  // Field mirror. All uint32. Access via `>>> 0` to model unsigned semantics.
  /**
   * @0x00..@0x1c — EIGHT consecutive uint32 axis slots, `axisSlot[i]` at
   * `+4*i`. Read by the free function `tile_hoist` @Helium 0xc78f0, which
   * tests each against 0xffffffff (`cmpl $-0x1, 0x<4i>(%rcx)` @0xc790b,
   * @0xc7924, @0xc7937, @0xc794a, @0xc795d, @0xc7970, @0xc7983, @0xc7995) —
   * i.e. 0xffffffff is this array's "unset" sentinel. The 32-bit compare
   * operand is what pins each element's width, and the eight offsets 0x00,
   * 0x04, 0x08, 0x0c, 0x10, 0x14, 0x18, 0x1c pin the extent. Slot i pairs
   * with bit i of `tile_mask` @0x34.
   *
   * Modelled as a fixed 8-element array of u32; unset slots hold 0xffffffff.
   * Nothing here claims what an axis slot MEANS — only that tile_hoist reads
   * eight of them and treats 0xffffffff as absent.
   */
  axisSlots_at_0x00: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  /**
   * @0x20 uint32 — a NINTH slot with the same 0xffffffff sentinel, but NOT
   * covered by `tile_mask`: `tile_hoist` tests it on its own
   * (`cmpl $-0x1, 0x20(%rcx)` @0xc799f) and pairs it with flag bit 0x20 of
   * byte 0x2b instead of with a mask bit. Kept as its own field rather than
   * as `axisSlots[8]` precisely because the binary treats it differently.
   */
  extraSlot_at_0x20: number = 0;

  flags: number = 0;      // @0x28
  base: number = 0;       // @0x30
  tile_mask: number = 0;  // @0x34
  axis_off: number = 0;   // @0x38
  axis_len: number = 0;   // @0x3c
  acc_limit: number = 0;  // @0x48
  acc_size: number = 0;   // @0x4c

  /**
   * @0xc79c0 — HGShaderTiling::istiled(unsigned int) const
   * Returns bit `idx` of tile_mask (0 or 1).
   *
   *   movl 0x34(%rdi), %eax
   *   btl  %esi, %eax
   *   setb %al
   */
  istiled(idx: number): number {
    // btl treats %esi (idx) mod 32 as the bit position on a 32-bit reg.
    const shift = (idx >>> 0) & 0x1f; // @0xc79c7
    return ((this.tile_mask >>> shift) & 1) >>> 0; // @0xc79c4 @0xc79ca
  }

  /**
   * @0xc79d0 — HGShaderTiling::isaccumulator(unsigned int) const
   * Returns 1 iff idx is in the half-open window [acc_limit - acc_size, acc_limit).
   *
   *   movl 0x48(%rdi), %eax     ; eax = acc_limit
   *   cmpl %eax, %esi           ; if idx >= acc_limit → return 0
   *   jae  .L1
   *   subl 0x4c(%rdi), %eax     ; eax = acc_limit - acc_size
   *   cmpl %eax, %esi
   *   setae %al                 ; return (idx >= acc_limit - acc_size)
   */
  isaccumulator(idx: number): number {
    const i = idx >>> 0;
    const limit = this.acc_limit >>> 0; // @0xc79d4
    if (i >= limit) return 0;           // @0xc79d7 jae -> xor eax,eax @0xc79e5
    const lo = (limit - (this.acc_size >>> 0)) >>> 0; // @0xc79db
    return i >= lo ? 1 : 0;             // @0xc79de setae
  }

  /**
   * @0xc79f0 — HGShaderTiling::isparametric() const
   * Returns bit 4 of byte flags[0x2b]  (== bit 28 of the u32 at flags@0x28).
   *
   *   movzbl 0x2b(%rdi), %eax
   *   andb   $0x10, %al
   *   shrb   $0x4,  %al
   */
  isparametric(): number {
    // Field aliasing: flags@0x28 is a u32; byte 0x2b is its top byte.
    // Bit 4 of that byte = bit 28 of the u32 = mask 0x10000000.
    return ((this.flags >>> 28) & 1) >>> 0; // @0xc79f4 @0xc79f8 @0xc79fa
  }

  /**
   * @0xc7a00 — HGShaderTiling::values(bool) const
   * If arg is falsy → 0.
   * Else if bit 3 of flags@0x2b (== bit 27 of flags@0x28, mask 0x08000000)
   * is not set → 0.
   * Otherwise → acc_size.
   *
   *   xorl  %eax, %eax
   *   testl %esi, %esi          ; !arg
   *   je    .L1
   *   testb $0x8, 0x2b(%rdi)    ; !(flags & 0x08000000)
   *   je    .L1
   *   movl  0x4c(%rdi), %eax    ; return acc_size
   */
  values(active: boolean): number {
    if (!active) return 0;                        // @0xc7a06 je
    if (((this.flags >>> 0) & 0x08000000) === 0)  // @0xc7a0a testb 0x8, 0x2b
      return 0;                                   // @0xc7a0e je
    return this.acc_size >>> 0;                   // @0xc7a10
  }

  /**
   * @0xc7a20 — HGShaderTiling::init(unsigned int, unsigned int) const
   * Returns  ((i*j) & mask28) + base
   * where mask28 = (flags & 0x10000000) ? 0xFFFFFFFF : 0
   * (recovered from  shll $3, sarl $0x1f  which arith-extracts bit 28).
   *
   *   movl  0x28(%rdi), %eax
   *   shll  $0x3,  %eax          ; bit 28 → bit 31
   *   sarl  $0x1f, %eax          ; arith-broadcast sign bit → 0 or -1
   *   imull %edx, %esi           ; esi = i * j
   *   andl  %esi, %eax           ; eax = mask & (i*j)
   *   addl  0x30(%rdi), %eax     ; eax += base
   */
  init(i: number, j: number): number {
    const shifted = ((this.flags >>> 0) << 3) | 0;   // @0xc7a27 shll $3
    const mask28 = shifted >> 31;                    // @0xc7a2a sarl $0x1f (arith)
    const prod = Math.imul(j | 0, i | 0);            // @0xc7a2d imull edx,esi
    const masked = (mask28 & prod) >>> 0;            // @0xc7a30 andl
    return (masked + (this.base >>> 0)) >>> 0;       // @0xc7a32 addl 0x30(%rdi)
  }

  /**
   * @0xc7a40 — HGShaderTiling::loop(unsigned int, unsigned int) const
   * If !(flags & 0x40000000) → 0xFFFFFFFF (sentinel "no loop").
   * Else compute like init() but also add acc_size when flags & 0x08000000.
   *
   *   movl  0x28(%rdi), %ecx
   *   movl  $0xffffffff, %eax
   *   testl $0x40000000, %ecx
   *   je    .LRET                  ; return -1 (u32 sentinel)
   *   leal  (,%rcx,8), %eax        ; eax = flags << 3
   *   sarl  $0x1f, %eax            ; mask28 = flags & 0x10000000 ? -1 : 0
   *   imull %esi, %edx             ; edx = i*j
   *   andl  %eax, %edx             ; edx = mask28 & (i*j)
   *   addl  0x30(%rdi), %edx       ; edx += base
   *   xorl  %eax, %eax
   *   testl $0x8000000, %ecx       ; flags & 0x08000000 ?
   *   je    .L2
   *   movl  0x4c(%rdi), %eax       ; eax = acc_size
   * .L2:
   *   addl  %eax, %edx             ; edx += (acc_size or 0)
   *   movl  %edx, %eax
   */
  loop(i: number, j: number): number {
    const flags = this.flags >>> 0;
    if ((flags & 0x40000000) === 0)                          // @0xc7a4c testl 0x40000000
      return 0xffffffff >>> 0;                               // @0xc7a47 movl $0xffffffff,%eax; @0xc7a52 je
    // leal (,%rcx,8),%eax === flags << 3 (u32)
    const shifted = (flags << 3) | 0;                        // @0xc7a54
    const mask28 = shifted >> 31;                            // @0xc7a5b sarl $0x1f (arith)
    const prod = Math.imul(i | 0, j | 0);                    // @0xc7a5e imull esi,edx
    const masked = (mask28 & prod) >>> 0;                    // @0xc7a61 andl eax,edx
    let out = (masked + (this.base >>> 0)) >>> 0;            // @0xc7a63 addl 0x30(%rdi)
    let extra = 0;                                           // @0xc7a66 xorl eax,eax
    if ((flags & 0x08000000) !== 0) extra = this.acc_size >>> 0; // @0xc7a68 testl / @0xc7a70 movl 0x4c
    out = (out + extra) >>> 0;                               // @0xc7a73 addl
    return out;
  }

  /**
   * @0xc7a80 — HGShaderTiling::texcoord(unsigned int idx, bool wrap,
   *                                     int px, int py,
   *                                     uint mult1, uint /_mult2 unused_/,
   *                                     float* out) const
   *
   * Writes 4 floats into `out` (a vec4 texcoord slot: out[0..1] = x/y,
   * out[2..3] = 0) and returns a modified idx.
   *
   * Path A — TILED (bit `idx` of tile_mask is 1):
   *   out[0..1] = ((float)px, (float)py)  (from int32 args)
   *   out[2..3] = 0
   *   return idx
   *
   * Path B — CLAMPED (idx out of range):
   *   if !wrap and axis_off < acc_limit then start = axis_off + acc_size
   *   else start = axis_off
   *   local = idx - start
   *   if local < 0 (unsigned underflow) OR idx >= axis_len → out[0..3] = 0; return idx
   *
   * Path C — WRAPPED: unpack idx into (x, y) via
   *   n     = popcount(tile_mask)
   *   local = idx - start + n
   *   quo   = local / n            ; then rem_h = local % n (unused)
   *   y     = quo / mult1
   *   x     = quo % mult1  (mirrored to mult1-1-x on odd rows for zig-zag)
   *   out[0..1] = ((float)x, (float)y)
   *   out[2..3] = 0
   *   Then post-compute:
   *     esi2 = (idx + n - y)                          ; from disasm this is
   *                                                     (idx + n - ecx),
   *                                                     with ecx=quo above.
   *     rem2 = esi2 % n
   *     if rem2 == 0 → return 0
   *     else return the (rem2)-th set bit index of tile_mask (0-based;
   *          walks incl. -1→scan until rem2 set bits consumed).
   */
  texcoord(
    idx: number,
    wrap: boolean,
    px: number,
    py: number,
    mult1: number,
    _mult2: number,
    out: Float32Array,
    outOff: number = 0
  ): number {
    const uidx = idx >>> 0;
    const flagsWrap = wrap ? 1 : 0;
    // @0xc7a85 ebx = axis_off
    let ebx = this.axis_off >>> 0;
    // @0xc7a88 testl %edx,%edx ; @0xc7a8a jne skip
    if (flagsWrap === 0) {
      // @0xc7a8c cmpl 0x48(%rdi),%ebx ; @0xc7a8f jae skip
      if (ebx < (this.acc_limit >>> 0)) {
        ebx = (ebx + (this.acc_size >>> 0)) >>> 0; // @0xc7a91 addl 0x4c(%rdi),%ebx
      }
    }
    const r10 = this.tile_mask >>> 0; // @0xc7a98
    // @0xc7a9c btl %esi,%r10d ; @0xc7aa0 jae PathBC
    const bit = (r10 >>> (uidx & 0x1f)) & 1;
    if (bit === 1) {
      // PathA — tiled: out[0..1] = (float)(int32) coords, out[2..3] = 0
      out[outOff + 0] = Math.fround(px | 0); // @0xc7aa2 cvtsi2ss %ecx
      out[outOff + 1] = Math.fround(py | 0); // @0xc7aa6 cvtsi2ss %r8d
      out[outOff + 2] = 0;                   // @0xc7ab6 movq $0,0x8(%r11)
      out[outOff + 3] = 0;
      return uidx; // @0xc7abe movl %esi,%eax
    }
    // @0xc7ac3 eax = uidx - ebx
    const diff = (uidx - ebx) >>> 0;
    // @0xc7ac5 jb (unsigned underflow) → PathBzero
    const borrow = uidx < ebx;
    // @0xc7acd cmpl 0x3c(%rdi),%esi ; @0xc7ad0 jae PathBzero
    if (borrow || uidx >= (this.axis_len >>> 0)) {
      // PathB — zero fill, return original idx
      out[outOff + 0] = 0; // @0xc7b60 xorps ; movups xmm0,(r11)
      out[outOff + 1] = 0;
      out[outOff + 2] = 0;
      out[outOff + 3] = 0;
      return uidx; // @0xc7b67 movl %esi,%eax
    }
    // PathC — WRAPPED: popcount(tile_mask) via the exact shift-and-add loop
    // @0xc7ad6..0xc7af1
    let popcount = 0;
    {
      let edx = r10;
      let ecx = r10;
      // do { r8=edx&1; edi+=r8; ecx>>=1; if(edx>1) edx=ecx } while(edx>1)
      // Note: `movl %ecx,%edx` happens BEFORE the ja compares, so on last
      // iter edx becomes ecx = 0 and we exit. Mirror 1:1.
      // (loop guaranteed to execute at least once because the do/while form
      // in x86 starts with the body then tests.)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const r8b = edx & 1;               // @0xc7ae0 movl %edx,%r8d; @0xc7ae3 andl $1
        popcount = (popcount + r8b) >>> 0; // @0xc7ae7 addl %r8d,%edi
        ecx = ecx >>> 1;                   // @0xc7aea shrl %ecx
        const cont = edx > 1;              // @0xc7aec cmpl $1,%edx ; @0xc7af1 ja
        edx = ecx;                         // @0xc7aef movl %ecx,%edx (BEFORE the ja)
        if (!cont) break;
      }
    }
    if (popcount === 0) {
      // divl by zero would #DE in x86. The binary never guards this — it
      // implicitly assumes the tiling mask has at least one bit set on
      // this path (the tile_mask is populated by the shader compiler).
      throw new Error(
        'HGShaderTiling.texcoord: popcount(tile_mask)==0 hits divl-by-zero — not yet transcribed @0xc7af7'
      );
    }
    // @0xc7af3 eax = diff + popcount
    const eaxAfterAdd = (diff + popcount) >>> 0;
    // @0xc7af5 divl %edi ; eax = q1, edx = r1  (unused r1)
    const q1 = (eaxAfterAdd / popcount) >>> 0; // @0xc7af7
    // @0xc7af9 ecx = q1
    const ecx1 = q1;
    // @0xc7afb divl %r9d ; eax = q2, edx = r2
    const q2 = (q1 / (mult1 >>> 0)) >>> 0; // @0xc7afd
    const r2 = (q1 - Math.imul(q2, mult1 >>> 0)) >>> 0;
    // @0xc7b00 r8d = r2 ; @0xc7b03 notl r8d ; @0xc7b06 addl r9d,r8d
    // = mult1 + (~r2) = mult1 - r2 - 1  (u32 arith)
    let r8v = (((~r2) >>> 0) + (mult1 >>> 0)) >>> 0;
    // @0xc7b09 testb $1,%al ; @0xc7b0b cmovel %edx,%r8d
    //   if (q2 & 1) == 0 → r8 = r2  (even rows: passthrough)
    //   else            → r8 stays  (odd rows: mirrored — zig-zag)
    if ((q2 & 1) === 0) r8v = r2;
    // @0xc7b0f cvtsi2ss %r8, %xmm0  (64-bit source — but r8 fits in u32
    //          since it's either r2<mult1 or mult1-1-r2, both <mult1<2^32,
    //          and the upper 32 bits of r8 were zeroed by the `movl %edx,%r8d`
    //          at 0xc7b00 — x86-64 movl zero-extends). So this is
    //          effectively cvtsi2ss of a non-negative int64 that fits in u32.
    out[outOff + 0] = Math.fround(r8v);          // @0xc7b19
    // @0xc7b14 cvtsi2ss %rax, %xmm1 — rax holds q2 (uint32, zero-extended)
    out[outOff + 1] = Math.fround(q2);           // @0xc7b1e
    out[outOff + 2] = 0;                         // @0xc7b24 movq $0,0x8(%r11)
    out[outOff + 3] = 0;
    // @0xc7b2c esi = uidx + popcount
    // @0xc7b2e esi -= ecx1 (= q1)
    let esi2 = (((uidx + popcount) >>> 0) - ecx1) >>> 0;
    // @0xc7b30 eax = esi2 ; @0xc7b32 divl %edi ; edx = esi2 % popcount
    const rem2 = (esi2 - Math.imul((esi2 / popcount) >>> 0, popcount)) >>> 0;
    // @0xc7b36 esi = 0 ; @0xc7b3b testl edx,edx ; @0xc7b3d je → return 0
    if (rem2 === 0) return 0;
    // @0xc7b43 esi = -1 ; then loop: inc esi; bt r10,esi; sbb edx,0; jne
    // → walk the bits of tile_mask; each set bit encountered decrements
    //   edx (via sbb $0 with CF=1). Exit when edx reaches 0.
    let esiOut = 0xffffffff | 0;
    let edxRem = rem2 | 0;
    // Mirror the sbb-based semantics exactly. sbbl $0,%edx with CF=bit(esi):
    //   edx -= 0 + CF  →  edx -= bit
    // The loop exits when the ZF from sbbl is set, i.e. edx == 0 after sub.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      esiOut = (esiOut + 1) | 0;                 // @0xc7b50 incl %esi
      const cf = (r10 >>> (esiOut & 0x1f)) & 1;  // @0xc7b52 btl %esi,%r10d
      edxRem = (edxRem - cf) | 0;                // @0xc7b56 sbbl $0,%edx
      if (edxRem === 0) break;                   // @0xc7b59 jne (exit on zero)
    }
    // @0xc7b5b jmp .Lret ; @0xc7abe movl %esi,%eax
    return esiOut >>> 0;
  }
}
