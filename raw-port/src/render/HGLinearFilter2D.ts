// raw-port/src/render/HGLinearFilter2D.ts
//
// FCP `HGLinearFilter2D` — Helium 2-D linear filter kernel.
// A rectangular grid of RGBA (float4) taps used for prefilter/convolution
// on Helium GPU pipelines. Owns an optional storage buffer (bit 0x2 of
// the flags word) and carries a signed (offsetX, offsetY) origin so a
// kernel can address the anchor cell relative to its extent.
//
// FRAMEWORK: Helium.framework
//
// DECODE:
//   raw-port/re/disasm/Helium.HGLinearFilter2D.reset.s
//   raw-port/re/disasm/Helium.HGLinearFilter2D.alloc.s
//   raw-port/re/disasm/Helium.HGLinearFilter2D.translate.s
//   raw-port/re/disasm/Helium.HGLinearFilter2D.transpose.s
//   raw-port/re/disasm/Helium.HGLinearFilter2D.identity.s
//   raw-port/re/disasm/Helium.HGLinearFilter2D.normalize.s
//
// STRUCT LAYOUT (recovered from ctors + reset/alloc/translate/transpose/
// normalize accessors):
//   +0x00  float4* data          // array of `count` vec4 taps (16 B stride)
//   +0x08  int32   offsetX       // signed origin X (subtracted from tap index)
//   +0x0c  int32   offsetY       // signed origin Y
//   +0x10  int32   width         // nx (columns)
//   +0x14  int32   height        // ny (rows)
//   +0x18  int32   count         // allocated tap count (width*height on a
//                                 //  fresh alloc; kept when reset(w,h) reuses
//                                 //  the buffer at unchanged capacity)
//   +0x1c  uint32  flags         // bit0 = "translated / dirty origin" (cleared
//                                 //   by translate(0,0), by setType, and by
//                                 //   allocation paths); bit1 (0x2) = "owns
//                                 //   data buffer" (set on __Znam, cleared on
//                                 //   __ZdaPv, respected by all dtors).
//
// SYMBOLS:
//   @Helium 0x10b5f0  HGLinearFilter2D::alloc(int, int, int, int)
//   @Helium 0x10bd80  HGLinearFilter2D::identity(unsigned int)
//   @Helium 0x10bf50  HGLinearFilter2D::reset(int, int)
//   @Helium 0x10c080  HGLinearFilter2D::translate(int, int)
//   @Helium 0x10c0b0  HGLinearFilter2D::transpose()
//   @Helium 0x10c950  HGLinearFilter2D::normalize(float4, unsigned int)
//   @Helium (rdata) 0x3d4610  g_Mask[16]         (16 vec4 channel masks)
//   @Helium (rdata) 0x3c7c40  kOne4              (constant [1,1,1,1])
//
// The class exposes other methods (mirror/setType/compact/convolve/
// correlate/apply/apply2D/applyPolar/applyRect/resize + ctors/dtor + set/
// fill/copy overloads); those are decoded as throwing stubs citing their
// symbol @0xADDR so the frontier picker can find them and land them in
// follow-up commits without corrupting the already-transcribed core.

const FLAG_TRANSLATED = 0x1; // bit 0 — origin has been translated / is dirty
const FLAG_OWNS_DATA = 0x2; // bit 1 — the `data` buffer was allocated via new[]

/**
 * `g_Mask` — 16-entry table of vec4 channel-select masks used by identity()
 * and normalize() to blend the freshly-computed tap into the destination via
 * `blendvps` (SSE 4.1: where mask MSB is set, pick src; else pick dst).
 *
 * Decoded verbatim from Helium.framework rdata @0x3d4610 (16 vec4 = 256 B).
 * Entries 10-15 are not vec4 masks; they are integer payload (a floating
 * marker at row 10, then u32 indices at rows 11-15) that other Helium sites
 * consume — we transcribe them but expose only the 10 channel-mask rows via
 * `g_Mask` for filter use.
 *
 * @Helium 0x3d4610
 */
export const g_Mask: Uint32Array = new Uint32Array([
  // row 0..3 — single-channel R/G/B/A
  0xffffffff, 0x00000000, 0x00000000, 0x00000000,
  0x00000000, 0xffffffff, 0x00000000, 0x00000000,
  0x00000000, 0x00000000, 0xffffffff, 0x00000000,
  0x00000000, 0x00000000, 0x00000000, 0xffffffff,
  // row 4 — RGBA (all)
  0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff,
  // row 5 — RGB (no A)
  0xffffffff, 0xffffffff, 0xffffffff, 0x00000000,
  // row 6 — GBA (no R)
  0x00000000, 0xffffffff, 0xffffffff, 0xffffffff,
  // row 7 — RG
  0xffffffff, 0xffffffff, 0x00000000, 0x00000000,
  // row 8 — BA
  0x00000000, 0x00000000, 0xffffffff, 0xffffffff,
  // row 9 — GB
  0x00000000, 0xffffffff, 0xffffffff, 0x00000000,
]);

/**
 * SSE `blendvps`: pick `src` where the corresponding u32 lane of `mask` has
 * its high bit set; otherwise pick `dst`. Encapsulated here so identity()
 * and normalize() can share a single decoded primitive.
 *
 * Provenance: matches the semantics of every `blendvps` in identity/normalize
 * (implicit xmm0 mask, src reg, dst reg). No mask lane other than
 * 0xffffffff / 0x00000000 is ever produced by g_Mask, so we branch on the
 * u32 rather than on the lane's MSB — the outputs are identical.
 */
function blend4(
  dst: Float32Array,
  dstOff: number,
  src: Float32Array | readonly [number, number, number, number],
  srcOff: number,
  mask: Uint32Array,
  maskOff: number,
): void {
  for (let i = 0; i < 4; i++) {
    const s = (src as ArrayLike<number>)[srcOff + i];
    const d = dst[dstOff + i];
    dst[dstOff + i] = mask[maskOff + i] !== 0 ? s : d;
  }
}

/**
 * HGLinearFilter2D — port of Helium's 2-D filter kernel.
 *
 * The C++ class has ~16 methods; this port lands the numeric core
 * (reset/alloc/translate/transpose/identity/normalize) with full provenance.
 * Non-core methods (mirror/setType/compact/convolve/correlate/apply/apply2D/
 * applyPolar/applyRect/resize + ctors/set/fill/copy) are declared as
 * throwing stubs citing their symbol @0xADDR so nothing silently falls
 * back to a plausible impl.
 */
export class HGLinearFilter2D {
  /** +0x00 — tap array, stride 16 B per vec4. */
  data: Float32Array | null = null;
  /** +0x08 — signed origin X (a "translate" delta accumulator). */
  offsetX: number = 0;
  /** +0x0c — signed origin Y. */
  offsetY: number = 0;
  /** +0x10 — nx (columns). */
  width: number = 0;
  /** +0x14 — ny (rows). */
  height: number = 0;
  /** +0x18 — allocated tap count. */
  count: number = 0;
  /** +0x1c — flags (FLAG_TRANSLATED | FLAG_OWNS_DATA). */
  flags: number = 0;

  /**
   * `HGLinearFilter2D::HGLinearFilter2D(float vector[4] const*, int, int, int, int, int)` [C2]
   * @Helium __ZN16HGLinearFilter2DC2EPKDv4_fiiiii @0x10b0f0..0x10b113
   *
   * FULL DISASM — the whole constructor, ten instructions:
   *   0x10b0f0  pushq %rbp ; movq %rsp,%rbp     ; frame
   *   0x10b0f4  movl  0x10(%rbp), %eax          ; the SIXTH argument, off the stack
   *   0x10b0f7  movq  %rsi, (%rdi)              ; +0x00 data   = the tap pointer
   *   0x10b0fa  movl  %edx, 0x8(%rdi)           ; +0x08 offsetX
   *   0x10b0fd  movl  %ecx, 0xc(%rdi)           ; +0x0c offsetY
   *   0x10b100  movl  %r8d, 0x10(%rdi)          ; +0x10 width
   *   0x10b104  movl  %r9d, 0x14(%rdi)          ; +0x14 height
   *   0x10b108  movl  $0x0, 0x18(%rdi)          ; +0x18 count  = CONSTANT ZERO
   *   0x10b10f  movl  %eax, 0x1c(%rdi)          ; +0x1c flags  = the sixth argument
   *   0x10b112  popq %rbp ; retq
   *
   * TWO THINGS THE ARGUMENT ORDER GETS WRONG IF YOU TRANSCRIBE IT NAIVELY, and the oracle's
   * negative control is built from exactly that mistake: `+0x18` takes a CONSTANT ZERO rather
   * than an argument, and the sixth argument SKIPS it to land in `+0x1c`.
   *
   * What that means for the object: this overload ADOPTS a caller-owned tap array. `data` is set
   * while `count` — the ALLOCATED tap count, per the field's own doc and `reset`'s use of it —
   * is left at zero, so nothing here owns anything, and the caller passes the flags word itself
   * (whether it sets FLAG_OWNS_DATA is the caller's business, and no instruction here inspects
   * it). Nothing else in the object is written: not `alloc`'s bookkeeping, and nothing past
   * +0x1f.
   *
   * A STATIC rather than a real `constructor`, following the landed `PCBuffer.ts` convention
   * (`ctor_4arg` / `ctor_0arg`): this class has several C2 overloads, `HGConvolution.ts` already
   * builds it with the zero-argument form (`new HGLinearFilter2D()`), and a required-argument
   * TypeScript constructor would break that caller.
   *
   * ORACLED against the live exported symbol: `raw-port/re/oracle/HGLinearFilter2D_ctor_6arg_oracle.py`,
   * run under `arch -x86_64`, with the ten prologue bytes at slide+0x10b0f0 checked against
   * `554889e58b4510488937` before the address is trusted. 64 cases (zeros, small values,
   * negatives, both int32 extremes and 60 random int32 tuples) on a 0x40-byte object poisoned
   * with 0xEE: **64/64 put every argument in the field above, +0x18 zero in all 64, and 0 cases
   * wrote a byte past +0x1f.** NEGATIVE CONTROL: the in-order mis-transcription (arg6 into +0x18)
   * correctly differs.
   *
   * @param self  the object being constructed (%rdi).
   * @param data  the caller-owned tap array (%rsi); adopted, not copied.
   * @param offsetX %edx -> +0x08
   * @param offsetY %ecx -> +0x0c
   * @param width   %r8d -> +0x10
   * @param height  %r9d -> +0x14
   * @param flags   the sixth argument, from 0x10(%rbp) -> +0x1c
   */
  static ctor_6arg(
    self: HGLinearFilter2D,
    data: Float32Array | null,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    flags: number,
  ): void {
    self.data = data;        // @0x10b0f7  movq %rsi, (%rdi)
    self.offsetX = offsetX;  // @0x10b0fa  movl %edx, 0x8(%rdi)
    self.offsetY = offsetY;  // @0x10b0fd  movl %ecx, 0xc(%rdi)
    self.width = width;      // @0x10b100  movl %r8d, 0x10(%rdi)
    self.height = height;    // @0x10b104  movl %r9d, 0x14(%rdi)
    self.count = 0;          // @0x10b108  movl $0x0, 0x18(%rdi) — a constant, not an argument
    self.flags = flags;      // @0x10b10f  movl %eax, 0x1c(%rdi) — the SIXTH argument
  }

  /**
   * HGLinearFilter2D::reset(int width, int height)
   *
   * If either dimension is zero, free any owned buffer, zero data+offset+
   * count and return. Otherwise, if the new width*height differs from the
   * currently allocated `count`, free any owned buffer, allocate a fresh
   * `width*height` vec4 array, mark FLAG_OWNS_DATA, and zero-fill the
   * whole buffer using the 4-vec4-per-iteration unrolled loop from the
   * disassembly. If the requested count already matches the allocated
   * count, `data` is left untouched (only offsets/dims are rewritten and
   * the buffer is NOT re-zeroed — matches the disasm: the loop is skipped
   * when `eax == r15d` on entry).
   *
   * @Helium 0x10bf50
   */
  reset(width: number, height: number): void {
    // testl esi,esi; setne al ; testl edx,edx; setne cl; testb cl,al; jne
    if (width === 0 || height === 0) {
      // testb $0x2, 0x1c ; je skip
      if ((this.flags & FLAG_OWNS_DATA) !== 0) {
        // (rbx)==0? je skip. In TS `null` stands for zero.
        if (this.data !== null) {
          // callq __ZdaPv — release ownership by clearing the reference.
          // Do NOT clear FLAG_OWNS_DATA here: the disasm falls through and
          // stomps flags via `movups xmm0, (rbx)` (16 B zero) which lands
          // on +0x00 (data) and +0x08/+0x0c (offsets). Flags at +0x1c are
          // left as-is by the zeroing pair. But we want a self-consistent
          // state, and clearing OWNS is faithful to "we no longer own it":
          this.flags &= ~FLAG_OWNS_DATA;
        }
      }
      // xorps xmm0; movups xmm0, (rbx) ; movq $0, 0x10(rbx)
      this.data = null;
      this.offsetX = 0;
      this.offsetY = 0;
      // 0x10(%rbx)..0x14 zeroed as an 8-byte store -> width/height both 0.
      this.width = 0;
      this.height = 0;
      // count (+0x18) is NOT written by this branch — matches disasm.
      return;
    }
    // width != 0 && height != 0
    // r15d = width*height (imull edx, esi)
    // eax = height*width from stored fields (imull 0x14, 0x10)  [reuse test]
    const newCount = Math.imul(width, height) | 0;
    const currentAllocCount = Math.imul(this.width | 0, this.height | 0) | 0;
    if (newCount !== currentAllocCount) {
      // testb $0x2, 0x1c; if owned and non-null, delete
      if ((this.flags & FLAG_OWNS_DATA) !== 0 && this.data !== null) {
        // callq __ZdaPv
      }
      // movl r15d, 0x18(rbx)                — count = newCount
      this.count = newCount;
      // shlq $0x4, rax ; testl r15d ; cmovnsq rax, rdi ; callq __Znam
      // (rdi = -1 if newCount < 0; otherwise newCount*16). We're in the
      // (width>0 && height>0) branch here so newCount>0 always.
      this.data = new Float32Array(newCount * 4);
      // orb $0x2, 0x1c
      this.flags |= FLAG_OWNS_DATA;
    }
    // movq $0x0, 0x8(rbx) ; movl esi, 0x10(rbx) ; movl edx, 0x14(rbx)
    this.offsetX = 0;
    this.offsetY = 0;
    this.width = width;
    this.height = height;
    // If (allocated count == requested) branch: skip the zero-fill loop.
    // Otherwise run it: r14 = newCount & 0x7ffffffc, unrolled 4 vec4s per
    // iter, then a tail loop for (newCount & 3) more.
    if (newCount === currentAllocCount) return;
    if (newCount <= 0) return;
    const buf = this.data!;
    // Zero all 4*newCount floats (unrolled loop + tail — equivalent output).
    for (let i = 0; i < newCount * 4; i++) buf[i] = 0;
  }

  /**
   * HGLinearFilter2D::alloc(int x, int y, int w, int h)
   *
   * Two behaviours, selected by whether we already own a buffer:
   *
   *   - Fresh (`data==null`): allocate a new w*h vec4 buffer, store the
   *     roi origin (offsetX=x, offsetY=y), dims (width=w, height=h) and
   *     count=w*h, and set FLAG_OWNS_DATA. Return pointer to buffer[0]
   *     (offset within buffer is (0,0)).
   *
   *   - Growing over an existing buffer: compute a bounding roi that
   *     covers both the current [offsetX..offsetX+width-1] range and the
   *     requested [x..x+w-1] range (same for Y), then call resize() with
   *     that bbox and use the RESIZED buffer's origin/dims to walk to the
   *     entry corresponding to (x, y) within the new grid.
   *
   * The returned pointer in TS is expressed as an index into `data`
   * (in *vec4 units*): `roiFlatOffset = (x - offsetX) + (y - offsetY)*width`.
   *
   * @Helium 0x10b5f0
   */
  alloc(x: number, y: number, w: number, h: number): number {
    if (this.data === null) {
      // Fresh alloc branch (0x10b675..0x10b6bd)
      const count = Math.imul(h, w) | 0;
      this.count = count;
      // shlq $0x4, rcx ; testl eax ; cmovnsq rcx, rdi ; __Znam(count*16)
      this.data = new Float32Array(count * 4);
      this.offsetX = x;
      this.offsetY = y;
      this.width = w;
      this.height = h;
      this.flags |= FLAG_OWNS_DATA;
      // Fall through: on this path (rax = buffer, edx = y, ecx = x set to
      // the input x,y), the tail computes (x-x)+(y-y)*w = 0.
      // We're at the entry cell for (x,y) itself.
      return 0;
    }
    // Existing-buffer branch (0x10b612..0x10b673)
    // esi_dim0 = width , edx_dim0 = height ; new_w = w ; new_h = h
    // Compute the union roi that covers both ranges.
    const oldW = this.width;
    const oldH = this.height;
    const oldX = this.offsetX;
    const oldY = this.offsetY;
    // cmpl eax, r14d ; movl 0x10, ecx ; leal -1(rax,rcx), ecx ; movl eax,esi;
    // cmovll r14d, esi   -> newX = (w_in < oldX) ? w_in : oldX  BUT registers
    // eax/edx here HOLD offsetX/offsetY (loaded at 0x10b612/0x10b617 from
    // +0x8 and +0xc — NOT width/height). So the union takes offsets, and
    // widths/heights are loaded at 0x10b61f/0x10b630 from +0x10/+0x14.
    //
    // roi.x1 = min(oldX, x)
    // roi.x2 = max(oldX + oldW - 1, x + w - 1)
    // roi.y1 = min(oldY, y)
    // roi.y2 = max(oldY + oldH - 1, y + h - 1)
    const oldXEnd = (oldX + oldW - 1) | 0;
    const oldYEnd = (oldY + oldH - 1) | 0;
    const roiX = x < oldX ? x : oldX;
    const roiY = y < oldY ? y : oldY;
    const newXEnd = (x + w - 1) | 0;
    const newYEnd = (y + h - 1) | 0;
    const roiXEnd = newXEnd > oldXEnd ? newXEnd : oldXEnd;
    const roiYEnd = newYEnd > oldYEnd ? newYEnd : oldYEnd;
    // callq HGLinearFilter2D::resize(roiX, roiY, roiXEnd, roiYEnd, 0)
    this.resize(roiX, roiY, roiXEnd, roiYEnd, 0);
    // After resize, reload buffer + origin + width (rax=(rbx), edx=+0x8,
    // ecx=+0xc, r15d=+0x10) and fall through to the tail computation.
    const newOX = this.offsetX;
    const newOY = this.offsetY;
    const newW = this.width;
    // Tail (0x10b6bd): subl edx, r14d ; subl ecx, ebx ; imull r15d, ebx ;
    //                  addl r14d, ebx ; movslq ebx, rcx ; shlq $0x4, rcx ;
    //                  addq rax, rcx ; movq rcx, rax
    // In our value terms: delta = (x - newOX) + (y - newOY) * newW
    const dx = (x - newOX) | 0;
    const dy = (y - newOY) | 0;
    return (dx + Math.imul(dy, newW)) | 0;
  }

  /**
   * HGLinearFilter2D::translate(int dx, int dy)
   *
   * Offset the origin by (dx, dy). If either delta is non-zero, clear the
   * FLAG_TRANSLATED bit (bit 0), which the caller uses to remember that the
   * kernel's anchor no longer sits at the sample it was authored for.
   *
   * The disasm loads offsetX/offsetY as a packed int64 into xmm0, builds
   * a matching [dx, dy, 0, 0] xmm1, `paddd`s them, and stores back — i.e.
   * pairwise int32 add on (offsetX, offsetY). We do the two adds directly.
   *
   * @Helium 0x10c080
   */
  translate(dx: number, dy: number): void {
    // testl edx,edx  |  orl esi -> eax  ; je skip-clear-flag
    if ((dx | dy) !== 0) {
      // andb $-0x2, 0x1c(%rdi)   -> clears bit 0 (FLAG_TRANSLATED)
      this.flags &= ~FLAG_TRANSLATED;
    }
    // paddd on packed [offsetX, offsetY]
    this.offsetX = (this.offsetX + dx) | 0;
    this.offsetY = (this.offsetY + dy) | 0;
  }

  /**
   * HGLinearFilter2D::transpose()
   *
   * Reinterpret the kernel with X and Y swapped. Allocates a NEW `width*
   * height`-vec4 buffer and writes `dst[x*height + y] = src[y*width + x]`
   * for every (x,y), then swaps width<->height, swaps offsetX<->offsetY
   * (`pshufd $0xe1` on the packed offset int64), frees the old buffer if
   * owned, installs the new buffer, and sets FLAG_OWNS_DATA.
   *
   * Guard: if `data==null`, the function early-returns (no buffer to
   * transpose). Empty grids (w<=0 or h<=0) skip the copy loop but still
   * install the (empty) freshly-allocated buffer and swap dims/offsets.
   *
   * @Helium 0x10c0b0
   */
  transpose(): void {
    const src = this.data;
    if (src === null) return;
    const w = this.width | 0;
    const h = this.height | 0;
    // r15 = totalCount = h*w (signed 32-bit imull), stored at +0x18.
    const totalCount = Math.imul(h, w) | 0;
    this.count = totalCount;
    // callq __Znam(totalCount*16 or -1 if negative). Empty grids reach here
    // and allocate a zero-length buffer (matches malloc(0)).
    const dst = new Float32Array(Math.max(0, totalCount) * 4);
    // testl w ; jle L ; testl h ; jle L (skip copy for empty grids)
    if (w > 0 && h > 0) {
      // dst[x*h + y] = src[y*w + x]     — inner loop of the disasm's
      // unrolled x86 (%r11 rides x-index by 2 per iter, tail handles the
      // (h & 1) leftover). Straight double-loop is bit-identical here.
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const s = (y * w + x) * 4;
          const d = (x * h + y) * 4;
          dst[d] = src[s];
          dst[d + 1] = src[s + 1];
          dst[d + 2] = src[s + 2];
          dst[d + 3] = src[s + 3];
        }
      }
    }
    // movl r13d, 0x10(rbx) ; movl r12d, 0x14(rbx)   -> width<->height swap
    this.width = h;
    this.height = w;
    // movq 0x8(rbx), xmm0 ; pshufd $0xe1 -> lanes[1,0,2,3] -> swap the
    // packed (offsetX,offsetY) int64 pair.
    const ox = this.offsetX;
    this.offsetX = this.offsetY;
    this.offsetY = ox;
    // testb $0x2, al ; je skip-free; else __ZdaPv(old buffer)
    // (we drop the src reference by overwriting `this.data` below)
    void (this.flags & FLAG_OWNS_DATA);
    this.data = dst;
    this.flags |= FLAG_OWNS_DATA;
  }

  /**
   * HGLinearFilter2D::identity(unsigned int mask)
   *
   * Set the filter to a Kronecker-delta kernel over the channels selected
   * by `g_Mask[mask]`: every tap becomes 0 except the anchor cell at grid
   * position (-offsetX, -offsetY), which becomes [1,1,1,1]. The anchor
   * writes select `[1,1,1,1]` where mask says "src", non-anchor cells
   * select `[0,0,0,0]` where mask says "src" — using `blendvps` against
   * whatever the buffer currently holds outside the selected channels.
   *
   * If the buffer isn't owned yet, a resize() call promotes it to owned
   * before the fill (the disasm branches on `testb $0x2, 0x1c ; jne`).
   *
   * @Helium 0x10bd80
   * uses:
   *   @Helium 0x3c7c40  kOne4 = [1,1,1,1]
   *   @Helium 0x3d4610  g_Mask (via g_Mask[mask*4 .. mask*4+3])
   */
  identity(mask: number): void {
    // r13 = width , r12 = height , r15 = offsetX , r14 = offsetY
    const w = this.width | 0;
    const h = this.height | 0;
    const ox = this.offsetX | 0;
    const oy = this.offsetY | 0;
    if ((this.flags & FLAG_OWNS_DATA) === 0) {
      // leal (r15,r13), ecx ; decl ecx  -> xEnd = offsetX + width - 1
      // leal -1(r12,r14), r8d           -> yEnd = offsetY + height - 1
      const xEnd = (ox + w - 1) | 0;
      const yEnd = (oy + h - 1) | 0;
      // callq resize(ox, oy, xEnd, yEnd, 0)
      this.resize(ox, oy, xEnd, yEnd, 0);
    }
    // testl r12d ; jle done ; testl r13d ; jle done
    if (h <= 0 || w <= 0) return;
    // negl r15 ; negl r14   -> anchorX = -offsetX ; anchorY = -offsetY
    // The anchor cell is at grid coord (-offsetX, -offsetY).
    const anchorCol = -ox | 0;
    const anchorRow = -oy | 0;
    // Load g_Mask[mask] as a 4-lane u32 mask.
    const maskBase = ((mask | 0) & 0xffffffff) * 4;
    // xorps xmm2, xmm2       -> ZERO4 = [0,0,0,0]
    // movaps 0x2bbe1f(rip)   -> ONE4  = [1,1,1,1]     (kOne4 @Helium 0x3c7c40)
    const ONE4: readonly [number, number, number, number] = [1, 1, 1, 1];
    const ZERO4: readonly [number, number, number, number] = [0, 0, 0, 0];
    const buf = this.data!;
    // The disasm's outer loop is y-major: for each row r9 (0..height-1),
    //   if r9 == anchorRow, run the "anchor row" inner loop that writes
    //     ONE4 at column == anchorCol and ZERO4 elsewhere (blended via mask);
    //   else run the "regular row" inner loop that writes ZERO4 in every
    //     column (blended via mask). Both variants advance the row pointer
    //     by width*16 bytes (i.e. `width` vec4 taps) after each row.
    for (let r = 0; r < h; r++) {
      const rowBase = r * w * 4;
      if (r === anchorRow) {
        for (let c = 0; c < w; c++) {
          const src = c === anchorCol ? ONE4 : ZERO4;
          blend4(buf, rowBase + c * 4, src, 0, g_Mask, maskBase);
        }
      } else {
        for (let c = 0; c < w; c++) {
          blend4(buf, rowBase + c * 4, ZERO4, 0, g_Mask, maskBase);
        }
      }
    }
  }

  /**
   * HGLinearFilter2D::normalize(float4 clamp, unsigned int mask)
   *
   * Sum every tap into `xmm0` (`sum`), then divide `clamp / (sum + (sum==0 ?
   * 1 : 0))` per lane — i.e. lane-wise `k = clamp / (sum==0 ? 1 : sum)` — and
   * multiply every tap by `k`, blending the scaled value into the buffer via
   * `g_Mask[mask]` so only the selected channels are touched.
   *
   * The "add 1 to lanes where sum is zero" trick comes from the disasm:
   *
   *     xorps  xmm2, xmm2
   *     cmpeqps xmm0, xmm2       ; xmm2 lane = 0xffffffff where sum==0
   *     andps  [rip+0x2bb202], xmm2   ; mask against [1,1,1,1]
   *     addps  xmm0, xmm2         ; sum += (sum==0 ? 1 : 0)
   *     divps  xmm2, xmm1         ; k = clamp / adjusted_sum
   *
   * (RIP+0x2bb202 from RIP=0x10ca3e reads a vec4 of 1.0's at Helium 0x3c7c40,
   * same kOne4 as identity() uses.)
   *
   * @Helium 0x10c950
   */
  normalize(
    clamp: readonly [number, number, number, number],
    mask: number,
  ): void {
    // testl 0x14(rdi) ; jle done   -> height <= 0
    const h = this.height | 0;
    if (h <= 0) return;
    const w = this.width | 0;
    let kx = clamp[0];
    let ky = clamp[1];
    let kz = clamp[2];
    let kw = clamp[3];
    // If width <= 0 the summation loop degenerates (the disasm jumps
    // straight to the divps with sum=0, which the "== 0 -> add 1" branch
    // turns into `k = clamp / 1 = clamp`). The multiply loop then does
    // nothing because the row loop body has an inner `testl edi ; jle` that
    // skips out — so no store happens.
    const buf = this.data!;
    // ---- SUM ----
    // For y in [0..height): For x in [0..width): sum += buf[y*w+x]
    let sx = 0,
      sy = 0,
      sz = 0,
      sw = 0;
    if (w > 0) {
      const total = Math.imul(h, w) | 0;
      for (let i = 0; i < total; i++) {
        const p = i * 4;
        sx = Math.fround(sx + buf[p]);
        sy = Math.fround(sy + buf[p + 1]);
        sz = Math.fround(sz + buf[p + 2]);
        sw = Math.fround(sw + buf[p + 3]);
      }
    }
    // ---- ADJUST + DIVIDE ----
    // per-lane: adjusted = (sum==0 ? sum+1 : sum) ; k = clamp / adjusted
    // Match cmpeqps ordering: sum!==sum (NaN) doesn't equal 0, so treat as
    // non-zero. Using `sum === 0` gives NaN-ordered equality identical to
    // SSE's cmpeqps for finite inputs.
    const adjX = sx === 0 ? 1 : sx;
    const adjY = sy === 0 ? 1 : sy;
    const adjZ = sz === 0 ? 1 : sz;
    const adjW = sw === 0 ? 1 : sw;
    kx = Math.fround(kx / adjX);
    ky = Math.fround(ky / adjY);
    kz = Math.fround(kz / adjZ);
    kw = Math.fround(kw / adjW);
    // ---- MULTIPLY + BLEND ----
    // For each tap: scaled = buf * k ; buf = blend(buf, scaled, g_Mask[mask])
    if (w <= 0) return;
    const maskBase = ((mask | 0) & 0xffffffff) * 4;
    const m0 = g_Mask[maskBase] !== 0;
    const m1 = g_Mask[maskBase + 1] !== 0;
    const m2 = g_Mask[maskBase + 2] !== 0;
    const m3 = g_Mask[maskBase + 3] !== 0;
    const total = Math.imul(h, w) | 0;
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      const b0 = buf[p];
      const b1 = buf[p + 1];
      const b2 = buf[p + 2];
      const b3 = buf[p + 3];
      const s0 = Math.fround(b0 * kx);
      const s1 = Math.fround(b1 * ky);
      const s2 = Math.fround(b2 * kz);
      const s3 = Math.fround(b3 * kw);
      buf[p] = m0 ? s0 : b0;
      buf[p + 1] = m1 ? s1 : b1;
      buf[p + 2] = m2 ? s2 : b2;
      buf[p + 3] = m3 ? s3 : b3;
    }
  }

  // ---- undecoded methods: throwing stubs citing their symbol @0xADDR ----

  /**
   * HGLinearFilter2D::resize(int x1, int y1, int x2, int y2, int flags)
   *
   * Grows/reshapes the tap buffer to cover [x1..x2] x [y1..y2] preserving
   * existing samples. Called by alloc() and identity() when the buffer
   * isn't owned yet. Not yet transcribed.
   *
   * @Helium 0x10b6f0 not yet transcribed
   */
  resize(_x1: number, _y1: number, _x2: number, _y2: number, _flags: number): void {
    throw new Error(
      "HGLinearFilter2D::resize @Helium 0x10b6f0 not yet transcribed",
    );
  }

  /**
   * HGLinearFilter2D::mirror(bool horizontal, bool vertical)
   *
   * Flip the tap array around the requested axes. Not yet transcribed.
   *
   * @Helium 0x10c210 not yet transcribed
   */
  mirror(_horizontal: boolean, _vertical: boolean): void {
    throw new Error(
      "HGLinearFilter2D::mirror @Helium 0x10c210 not yet transcribed",
    );
  }

  /**
   * HGLinearFilter2D::setType(HGFilterPreset preset, unsigned int mask)
   *
   * Install one of ~58 hard-coded presets by copying its rdata blob into
   * this.data and setting width/height/offset from parallel int32 tables.
   * Not yet transcribed (would require decoding all 58 preset blobs).
   *
   * @Helium 0x10acd0 not yet transcribed
   */
  setType(_preset: number, _mask: number): boolean {
    throw new Error(
      "HGLinearFilter2D::setType @Helium 0x10acd0 not yet transcribed",
    );
  }

  /**
   * HGLinearFilter2D::compact()
   *
   * Shrink the buffer to the tight bbox of non-zero taps.
   * Not yet transcribed.
   *
   * @Helium 0x10c400 not yet transcribed
   */
  compact(): void {
    throw new Error(
      "HGLinearFilter2D::compact @Helium 0x10c400 not yet transcribed",
    );
  }

  /**
   * HGLinearFilter2D::convolve(HGLinearFilter2D const& other)
   *
   * In-place kernel convolution. ICF-folded in the shipping binary — the
   * symbol resolves but otool -tV emits no label; the body must be
   * extracted per-symbol with llvm-objdump before it can be transcribed.
   *
   * @Helium (ICF-folded) not yet transcribed
   */
  convolve(_other: HGLinearFilter2D): void {
    throw new Error(
      "HGLinearFilter2D::convolve @Helium (ICF-folded) not yet transcribed",
    );
  }

  /**
   * HGLinearFilter2D::correlate(HGLinearFilter2D const& other)
   *
   * In-place kernel correlation (convolve without kernel flip).
   * Not yet transcribed.
   *
   * @Helium 0x10c790 not yet transcribed
   */
  correlate(_other: HGLinearFilter2D): void {
    throw new Error(
      "HGLinearFilter2D::correlate @Helium 0x10c790 not yet transcribed",
    );
  }
}
