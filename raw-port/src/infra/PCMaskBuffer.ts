// PCMaskBuffer — 8-bit-per-pixel binary/coverage grid used by ProCore's mask pipeline.
// Faithful port of the ProCore x86_64 disassembly. Every method cites its source @ProCore addr.
//
// Framework: ProCore
// Provenance (raw-port/re/disasm/ProCore.PCMaskBuffer.*.s):
//   PCMaskBuffer::PCMaskBuffer()                          @0x0c4858 (C1)  /  @0x0c4840 (C2)
//   PCMaskBuffer::PCMaskBuffer(u8*, w, h, ?)              @0x0c481a (C1)  /  @0x0c47f4 (C2)
//   PCMaskBuffer::~PCMaskBuffer()                         @0x0c4876 (D1)  /  @0x0c4870 (D2)
//   PCMaskBuffer::setBoundingBox(int, int, int, int)      @0x0c447c
//   PCMaskBuffer::setToZero()                             @0x0c4490
//   PCMaskBuffer::setValueAt(int val, int x, int y)       @0x0c44ac
//   PCMaskBuffer::alloc(int w, int h)                     @0x0c487c
//   PCMaskBuffer::dealloc()                               @0x0c48cc
//   PCMaskBuffer::isEmpty()                               @0x0c48fa
//   PCMaskBuffer::getValueAt(int x, int y)                @0x0c491e
//   PCMaskBuffer::getCoverageInArea(int x0, int x1, int y0, int y1) @0x0c494c
//   PCMaskBuffer::getBoundingBox(int*, int*, int*, int*)  @0x0c49d2
//   PCMaskBuffer::getMinimalBoundingBoxFromMask(...)      @0x0c49ee
//   PCMaskBuffer::getMinimalBoundingBox(...)              @0x0c4a0a
//
// Decoded struct layout — from ctors + alloc + accessor disasm (re/disasm/ProCore.PCMaskBuffer.*.s).
// Total size = 0x24 = 36 bytes (as confirmed by dealloc's `xmm0 -> 0x10(rbx); xmm0 -> (rbx); i32 0 -> 0x20(rbx)`
// clearing exactly 0x24 bytes @0x0c48e2..0x0c48ec).
//   +0x00  data  (uint8_t*)                — row-major grid, byte per cell; set by alloc @0x0c489b
//   +0x08  width  (int32)                  — logical grid width;  set by alloc @0x0c489e
//   +0x0c  height (int32)                  — logical grid height; set by alloc @0x0c48a2
//   +0x10  rowStride (int32)               — bytes per row (== width when self-allocated); set @0x0c48a6
//   +0x14  bbXmin (int32)                  — stored bounding-box min-x (inclusive)
//   +0x18  bbXmax (int32)                  — stored bounding-box max-x (inclusive)
//   +0x1c  bbYmin (int32)                  — stored bounding-box min-y (inclusive)
//   +0x20  bbYmax (int32)                  — stored bounding-box max-y (inclusive)
//
// Signature note (recovered from getBoundingBox @0x0c49d2, whose writes go
// (rsi)=bbXmin,(rdx)=bbXmax,(rcx)=bbYmin,(r8)=bbYmax): the 4-int-pointer methods take
//   (int* xMin_out, int* xMax_out, int* yMin_out, int* yMax_out)
// — NOT (xMin, yMin, xMax, yMax). Applies to getBoundingBox, getMinimalBoundingBoxFromMask, and
// getMinimalBoundingBox. This is decoded from the binary, not from a header we have.
//
// getCoverageInArea @0x0c494c argument order is (int xLow, int xHigh, int yLow, int yHigh)
// — see the clip pattern (esi vs bbXmin/max, edx vs bbXmax, ecx vs bbYmin, r8d vs bbYmax).
//
// FAITHFUL PORT — every function cites its @ProCore 0xADDR. Undecoded callees throw citing their
// FCP address (PORTING_SPEC.md Rule 3). No approximations, no invented helpers.

/**
 * PCMaskBuffer — 8-bit-per-pixel binary/coverage mask with an inscribed axis-aligned bounding
 * box. Storage is a raw uint8_t array indexed as `data[y*rowStride + x]`.
 *
 * The class holds two independent notions of extent:
 *   - the buffer extent (`width` x `height` cells, backed by `data`), and
 *   - a bounding box (`bbXmin..bbXmax` x `bbYmin..bbYmax`) that callers can set/query
 *     independently (see `setBoundingBox` / `getBoundingBox`).
 *
 * `getMinimalBoundingBox` computes the tight box of nonzero cells by scanning `data`.
 */
export class PCMaskBuffer {
  /** +0x00 — packed byte grid (row-major, `rowStride` bytes per row). Owned by this instance
   *  when set through `alloc()` — freed by `dealloc()` via `operator delete[]` @0x0c48dd. */
  data: Uint8Array | null = null;

  /** +0x08 — grid width in cells (columns). */
  width: number = 0;

  /** +0x0c — grid height in cells (rows). */
  height: number = 0;

  /** +0x10 — bytes per row; equal to `width` when the buffer is self-allocated. */
  rowStride: number = 0;

  /** +0x14 — bounding box: inclusive min x. */
  bbXmin: number = 0;

  /** +0x18 — bounding box: inclusive max x. */
  bbXmax: number = 0;

  /** +0x1c — bounding box: inclusive min y. */
  bbYmin: number = 0;

  /** +0x20 — bounding box: inclusive max y. */
  bbYmax: number = 0;

  /**
   * Default constructor — `PCMaskBuffer::PCMaskBuffer()`.
   *
   * @ProCore 0x0c4858 (C1, `__ZN12PCMaskBufferC1Ev`) — identical body at @0x0c4840 (C2).
   *
   * Disasm zeroes exactly 0x24 bytes of the object:
   *   0x0c485c  xorps %xmm0,%xmm0                    (xmm0 = 0)
   *   0x0c485f  movups %xmm0,0x10(%rdi)              (zero 0x10..0x1f: rowStride,bbXmin,bbXmax,bbYmin)
   *   0x0c4863  movups %xmm0,(%rdi)                  (zero 0x00..0x0f: data,width,height,rowStride/pad)
   *   0x0c4866  movl $0,0x20(%rdi)                   (zero 0x20: bbYmax)
   *
   * All fields default to 0 / null. In TS, the field initializers above already realize this.
   */
  static create_default(): PCMaskBuffer {
    return new PCMaskBuffer();
  }

  /**
   * Parameterized constructor — `PCMaskBuffer::PCMaskBuffer(uint8_t* data, int w, int h, int ?)`.
   *
   * @ProCore 0x0c481a (C1, `__ZN12PCMaskBufferC1EPhiii`) — identical body at @0x0c47f4 (C2).
   *
   * Disasm — note that the `uint8_t*` (rsi) and the fourth int (r8d) are IGNORED:
   *   0x0c481e  decl %edx                            (edx = w - 1)
   *   0x0c4820  xorps %xmm0,%xmm0
   *   0x0c4823  movups %xmm0,(%rdi)                  (data=null, width=0, height=0, rowStride=0(hi))
   *   0x0c4826  movq $0,0x10(%rdi)                   (rowStride=0, bbXmin=0)
   *   0x0c482e  movl %edx,0x18(%rdi)                 (bbXmax = w - 1)
   *   0x0c4831  movl $0,0x1c(%rdi)                   (bbYmin = 0)
   *   0x0c4838  decl %ecx                            (ecx = h - 1)
   *   0x0c483a  movl %ecx,0x20(%rdi)                 (bbYmax = h - 1)
   *
   * So this ctor initializes an EMPTY buffer whose bounding box is set to a `[0..w-1] x [0..h-1]`
   * inclusive rectangle — without storing the incoming data pointer or width/height as buffer
   * dimensions. This matches the observed instruction bytes exactly; whether that "loses" the
   * pointer intentionally or is a stale-API stub is FCP's business, not ours.
   */
  static create_with_bbox(
    _data: Uint8Array | null,
    w: number,
    h: number,
    _unused: number,
  ): PCMaskBuffer {
    const b = new PCMaskBuffer();
    // b.data, b.width, b.height, b.rowStride, b.bbXmin, b.bbYmin already 0 from field inits
    // matching the xorps/movups+mov $0 zero-fill at @0x0c4823..0x0c4831.
    b.bbXmax = (w | 0) - 1; // @0x0c481e (`decl %edx`) then @0x0c482e store
    b.bbYmax = (h | 0) - 1; // @0x0c4838 (`decl %ecx`) then @0x0c483a store
    return b;
  }

  /**
   * `PCMaskBuffer::~PCMaskBuffer()` — trivial destructor (Itanium ABI D1 == D2 body here).
   *
   * @ProCore 0x0c4876 (D1, `__ZN12PCMaskBufferD1Ev`) — identical to D2 @0x0c4870.
   *
   * Disasm is empty prologue+epilogue only:
   *   0x0c4876  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * This dtor does NOT call `dealloc()` — callers must invoke that explicitly. In TS a no-op.
   */
  destructor(): void {
    // Faithful: nothing happens here. The compiler emitted only prologue/epilogue @0x0c4876..0x0c487b.
  }

  /**
   * `PCMaskBuffer::setBoundingBox(int xMin, int xMax, int yMin, int yMax)`.
   *
   * @ProCore 0x0c447c (`__ZN12PCMaskBuffer14setBoundingBoxEiiii`).
   *
   * Disasm — pure field writes:
   *   0x0c4480  movl %esi,0x14(%rdi)   (bbXmin = arg1)
   *   0x0c4483  movl %edx,0x18(%rdi)   (bbXmax = arg2)
   *   0x0c4486  movl %ecx,0x1c(%rdi)   (bbYmin = arg3)
   *   0x0c4489  movl %r8d,0x20(%rdi)   (bbYmax = arg4)
   *
   * Argument order matches getBoundingBox's write order (xMin, xMax, yMin, yMax).
   */
  setBoundingBox(xMin: number, xMax: number, yMin: number, yMax: number): void {
    this.bbXmin = xMin | 0;
    this.bbXmax = xMax | 0;
    this.bbYmin = yMin | 0;
    this.bbYmax = yMax | 0;
  }

  /**
   * `PCMaskBuffer::setToZero()` — zero-fill the full `width * height` bytes of `data`.
   *
   * @ProCore 0x0c4490 (`__ZN12PCMaskBuffer9setToZeroEv`).
   *
   * Disasm tail-calls `___bzero(data, width * height)`:
   *   0x0c4494  movq (%rdi),%rax               (rax = data)
   *   0x0c4497  movslq 0xc(%rdi),%rcx          (rcx = (int64)height)
   *   0x0c449b  movslq 0x10(%rdi),%rsi         (rsi = (int64)rowStride)
   *   0x0c449f  imulq %rcx,%rsi                (rsi = height * rowStride)
   *   0x0c44a3  movq %rax,%rdi                 (rdi = data)
   *   0x0c44a6  popq %rbp ; jmp ___bzero       (tail call)
   *
   * Note the size is `height * rowStride` — NOT `width * height`. This matters when `rowStride`
   * differs from `width` (an externally-supplied buffer). Transcribe exactly.
   */
  setToZero(): void {
    if (this.data === null) return; // ___bzero with a null buffer is UB; the disasm doesn't guard,
    // but a null-guarded early return keeps our port memory-safe without diverging on any legal
    // (non-null-data) input. Documented per PORTING_SPEC Rule 4 (numerics match) — the guard is
    // a null-safety fence not a numeric shortcut.
    const n = (this.height | 0) * (this.rowStride | 0);
    for (let i = 0; i < n; i++) this.data[i] = 0;
  }

  /**
   * `PCMaskBuffer::setValueAt(int val, int x, int y)`.
   *
   * @ProCore 0x0c44ac (`__ZN12PCMaskBuffer10setValueAtEiii`).
   *
   * Argument order recovered from disasm: esi=val (compared against 0x100 as a byte-range check),
   * edx=x (compared against `width` @0x08), ecx=y (compared against `height` @0x0c).
   *
   * Disasm:
   *   0x0c44ac  cmpl $0x100,%esi                    (val >= 256?)
   *   0x0c44b2  setae %al
   *   0x0c44b5  testl %edx,%edx                     (x sign)
   *   0x0c44b7  sets %r8b                           (x < 0)
   *   0x0c44bb  orb  %al,%r8b                       (val>=256 || x<0)
   *   0x0c44be  jne  0x0c44e3                       (if either -> return)
   *   0x0c44c0  testl %ecx,%ecx
   *   0x0c44c2  js   0x0c44e3                       (y < 0 -> return)
   *   0x0c44c4  cmpl 0x8(%rdi),%edx                 (x vs width)
   *   0x0c44c7  jge  0x0c44e3                       (x >= width -> return)
   *   0x0c44c9  cmpl 0xc(%rdi),%ecx                 (y vs height)
   *   0x0c44cc  jge  0x0c44e3                       (y >= height -> return)
   *   0x0c44d2  imull 0x10(%rdi),%ecx               (ecx = y * rowStride)
   *   0x0c44d6  movq (%rdi),%rax                    (rax = data)
   *   0x0c44d9  addl %edx,%ecx                      (ecx = y*rowStride + x)
   *   0x0c44db  movslq %ecx,%rcx
   *   0x0c44de  movb %sil,(%rax,%rcx)               (data[y*rowStride+x] = (byte)val)
   *
   * Note: `val` is NOT tested for `< 0`. The `cmpl $0x100,%esi ; setae` yields true only when
   * (unsigned)val >= 0x100. Because %esi is 32-bit unsigned in that compare, a negative int gets
   * a huge unsigned value >= 0x100 and is thus rejected too — matching the C++ intent of "byte
   * value only". Transcribed as (val >>> 0) >= 0x100.
   */
  setValueAt(val: number, x: number, y: number): void {
    // @0x0c44ac..@0x0c44be — val out-of-byte-range check (unsigned)
    if ((val >>> 0) >= 0x100) return;
    // @0x0c44b5..@0x0c44be — x < 0 check
    if ((x | 0) < 0) return;
    // @0x0c44c0..@0x0c44c2 — y < 0 check
    if ((y | 0) < 0) return;
    // @0x0c44c4..@0x0c44c7 — x >= width
    if ((x | 0) >= (this.width | 0)) return;
    // @0x0c44c9..@0x0c44cc — y >= height
    if ((y | 0) >= (this.height | 0)) return;
    // @0x0c44d2..@0x0c44de — data[y*rowStride + x] = (byte)val
    if (this.data === null) return; // null-safe fence; disasm has no null guard because caller must alloc first
    const idx = (y | 0) * (this.rowStride | 0) + (x | 0);
    this.data[idx] = val & 0xff;
  }

  /**
   * `PCMaskBuffer::alloc(int w, int h)`.
   *
   * @ProCore 0x0c487c (`__ZN12PCMaskBuffer5allocEii`).
   *
   * Disasm allocates a `w * h` byte array via `operator new[]` and initializes fields:
   *   0x0c4890  imull %esi,%eax                    (eax = w * h)         [esi=w, edx=h]
   *   0x0c4893  movslq %eax,%rdi                   (rdi = (int64)(w*h))
   *   0x0c4896  callq __Znam                       (rax = new uint8_t[w*h])
   *   0x0c489b  movq %rax,(%r15)                   (this->data = rax)
   *   0x0c489e  movl %r14d,0x8(%r15)               (this->width = w)
   *   0x0c48a2  movl %ebx,0xc(%r15)                (this->height = h)
   *   0x0c48a6  movl %r14d,0x10(%r15)              (this->rowStride = w)
   *   0x0c48aa  xorl %eax,%eax
   *   0x0c48ac  movl %eax,0x14(%r15)               (bbXmin = 0)
   *   0x0c48b0  decl %r14d                         (r14d = w - 1)
   *   0x0c48b3  movl %r14d,0x18(%r15)              (bbXmax = w - 1)
   *   0x0c48b7  movl %eax,0x1c(%r15)               (bbYmin = 0)
   *   0x0c48bb  decl %ebx                          (ebx = h - 1)
   *   0x0c48bd  movl %ebx,0x20(%r15)               (bbYmax = h - 1)
   *
   * Note: this leaks any prior buffer — no `delete[]` on the old data. `dealloc()` must be called
   * first if `data` is non-null. Faithful port preserves this behavior.
   */
  alloc(w: number, h: number): void {
    const W = w | 0;
    const H = h | 0;
    // @0x0c4890..@0x0c4896 — `operator new[](w*h)`. In JS this is a fresh Uint8Array (zeroed).
    // The disasm's `__Znam` does NOT zero-initialize — but our subsequent behavior (getValueAt
    // returning 0 for a not-yet-written cell) is identical either way, and callers that need a
    // guaranteed-zero grid call setToZero() explicitly (as they must in C++ too).
    this.data = new Uint8Array(W * H);
    this.width = W;
    this.height = H;
    this.rowStride = W;
    this.bbXmin = 0;
    this.bbXmax = W - 1;
    this.bbYmin = 0;
    this.bbYmax = H - 1;
  }

  /**
   * `PCMaskBuffer::dealloc()`.
   *
   * @ProCore 0x0c48cc (`__ZN12PCMaskBuffer7deallocEv`).
   *
   * Disasm frees `data` (if non-null) and zeroes 0x24 bytes of the object:
   *   0x0c48d5  movq (%rdi),%rdi                   (rdi = data)
   *   0x0c48d8  testq %rdi,%rdi
   *   0x0c48db  je   0x0c48e2                      (skip delete if null)
   *   0x0c48dd  callq __ZdaPv                      (operator delete[])
   *   0x0c48e2  xorps %xmm0,%xmm0
   *   0x0c48e5  movups %xmm0,0x10(%rbx)            (zero 0x10..0x1f)
   *   0x0c48e9  movups %xmm0,(%rbx)                (zero 0x00..0x0f)
   *   0x0c48ec  movl $0,0x20(%rbx)                 (zero 0x20)
   */
  dealloc(): void {
    // @0x0c48d5..@0x0c48dd — delete[] data (a no-op in JS: GC will reclaim).
    this.data = null;
    // @0x0c48e2..@0x0c48ec — zero the trailing metadata fields (fields at +0x08..+0x20 inclusive).
    this.width = 0;
    this.height = 0;
    this.rowStride = 0;
    this.bbXmin = 0;
    this.bbXmax = 0;
    this.bbYmin = 0;
    this.bbYmax = 0;
  }

  /**
   * `PCMaskBuffer::isEmpty()` — return 1 iff bbXmin==bbXmax==bbYmin==bbYmax==0.
   *
   * @ProCore 0x0c48fa (`__ZN12PCMaskBuffer7isEmptyEv`).
   *
   * Disasm compares each of the four bbox fields against 0 and short-circuits on any nonzero:
   *   0x0c48fe  cmpl $0,0x14(%rdi) ; jne .fail       (bbXmin != 0 -> not empty)
   *   0x0c4904  cmpl $0,0x18(%rdi) ; jne .fail       (bbXmax != 0)
   *   0x0c490a  cmpl $0,0x1c(%rdi) ; jne .fail       (bbYmin != 0)
   *   0x0c4910  cmpl $0,0x20(%rdi) ; je  .ret_true   (bbYmax == 0 -> return 1)
   *   .fail:  xorl %eax,%eax ; ret                   (return 0)
   *   .ret_true: movb $1,%al ; jmp .fail_ret         (return 1)
   *
   * This is a strict "all four bbox fields are exactly zero" test — not a geometric emptiness
   * check. Following a fresh default ctor (all fields zero) this returns true; after `alloc(w,h)`
   * with w>=2 or h>=2 it returns false because bbXmax=w-1 (or bbYmax=h-1) is nonzero.
   */
  isEmpty(): boolean {
    if ((this.bbXmin | 0) !== 0) return false;
    if ((this.bbXmax | 0) !== 0) return false;
    if ((this.bbYmin | 0) !== 0) return false;
    if ((this.bbYmax | 0) !== 0) return false;
    return true;
  }

  /**
   * `PCMaskBuffer::getValueAt(int x, int y) const`.
   *
   * @ProCore 0x0c491e (`__ZNK12PCMaskBuffer10getValueAtEii`).
   *
   * Returns the byte at `data[y*rowStride + x]`, or -1 (0xFFFFFFFF as signed int) if out of range.
   *
   * Disasm:
   *   0x0c491e  movl $-1,%eax                        (default return: -1)
   *   0x0c4923  testl %esi,%esi ; js .ret            (x < 0)
   *   0x0c4927  testl %edx,%edx ; js .ret            (y < 0)
   *   0x0c492b  cmpl 0x8(%rdi),%esi ; jge .ret       (x >= width)
   *   0x0c4930  cmpl 0xc(%rdi),%edx ; jge .ret       (y >= height)
   *   0x0c4939  imull 0x10(%rdi),%edx                (edx = y * rowStride)
   *   0x0c493d  movq (%rdi),%rax                     (rax = data)
   *   0x0c4940  addl %esi,%edx                       (edx = y*rowStride + x)
   *   0x0c4945  movzbl (%rax,%rcx),%eax              (eax = (uint8_t)data[idx])
   *   0x0c4949  ret
   *
   * Note the zero-extend `movzbl`: valid returns are 0..255; the out-of-range sentinel is -1.
   */
  getValueAt(x: number, y: number): number {
    const X = x | 0;
    const Y = y | 0;
    if (X < 0) return -1;
    if (Y < 0) return -1;
    if (X >= (this.width | 0)) return -1;
    if (Y >= (this.height | 0)) return -1;
    if (this.data === null) return -1; // null-safe fence
    return this.data[Y * (this.rowStride | 0) + X] & 0xff;
  }

  /**
   * `PCMaskBuffer::getCoverageInArea(int xLow, int xHigh, int yLow, int yHigh) const`.
   *
   * @ProCore 0x0c494c (`__ZNK12PCMaskBuffer17getCoverageInAreaEiiii`).
   *
   * Returns the count of cells with `data[...] >= 1` in the intersection of the caller's
   * `[xLow..xHigh] x [yLow..yHigh]` rectangle (inclusive) and the stored bounding box.
   *
   * Disasm — argument order (xLow=esi, xHigh=edx, yLow=ecx, yHigh=r8d) recovered from the
   * clip pattern:
   *   0x0c4950  movl 0x14(%rdi),%r9d                 (r9d = bbXmin)
   *   0x0c4954  cmpl %r9d,%esi ; cmovgl %esi,%r9d    (r9d = max(bbXmin, xLow))
   *   0x0c4954  movl 0x1c(%rdi),%r10d                (r10d = bbYmin)
   *   0x0c495b  cmpl %r10d,%ecx ; cmovgl %ecx,%r10d  (r10d = max(bbYmin, yLow))
   *   0x0c4962  movl 0x20(%rdi),%ecx                 (ecx = bbYmax)
   *   0x0c4965  cmpl %ecx,%r8d ; cmovll %r8d,%ecx    (ecx = min(bbYmax, yHigh))
   *   0x0c496c  xorl %eax,%eax
   *   0x0c496e  cmpl %ecx,%r10d ; jg  .ret           (empty y range?)
   *   0x0c4978  movl 0x18(%rdi),%esi                 (esi = bbXmax)
   *   0x0c497b  cmpl %esi,%edx ; cmovll %edx,%esi    (esi = min(bbXmax, xHigh))
   *   0x0c4980  leal 0x1(%rsi),%edx                  (edx = xHi_clipped + 1)
   *   0x0c4985 for r8d = r9d ; r8d <= xHi_clipped ; r8d++:
   *     0x0c498d  testl %r8d,%r8d ; js .skip         (x < 0)
   *     0x0c4992  testl %r10d,%r10d ; js .skip       (y < 0)
   *     0x0c4997  cmpl 0x8(%rdi),%r8d ; jge .skip    (x >= width)
   *     0x0c499d  cmpl 0xc(%rdi),%r10d ; jge .skip   (y >= height)
   *     0x0c49a6  movl 0x10(%rdi),%ebx ; imull %r10d,%ebx  (ebx = y*rowStride)
   *     0x0c49ad  addl %r8d,%ebx                     (ebx = y*rowStride + x)
   *     0x0c49b3  cmpb $0x1,(%r11,%rbx)              (CF = data[idx] < 1  <=>  data[idx]==0)
   *     0x0c49b8  sbbl $-1,%eax                      (eax += 1 - CF: adds 1 iff data[idx]>=1)
   *   0x0c49c3 for r10d (y) from r10d to ecx inclusive
   *
   * The inclusive-range x loop uses the pre-increment sentinel edx = xHi_clipped+1 (post-clip),
   * so the loop covers x = xLo_clipped..xHi_clipped inclusive. Same for y.
   */
  getCoverageInArea(xLow: number, xHigh: number, yLow: number, yHigh: number): number {
    // @0x0c4950..@0x0c4958 — clip x-low to stored bbox
    const xLoClipped = Math.max(this.bbXmin | 0, xLow | 0);
    // @0x0c4954..@0x0c495e — clip y-low to stored bbox
    const yLoClipped = Math.max(this.bbYmin | 0, yLow | 0);
    // @0x0c4962..@0x0c496b — clip y-high to stored bbox
    const yHiClipped = Math.min(this.bbYmax | 0, yHigh | 0);
    // @0x0c496e — early-out on empty y range
    if (yLoClipped > yHiClipped) return 0;
    // @0x0c4978..@0x0c497d — clip x-high to stored bbox
    const xHiClipped = Math.min(this.bbXmax | 0, xHigh | 0);
    // @0x0c4988 — early-out on empty x range (the outer `cmpl %esi,%r9d ; jg 0x0c49c3` inside
    // the y loop means: if xLoClipped > xHiClipped, we skip the inner x loop each row — same as
    // returning 0). Faithful transcription of that skip: check once and continue-y-only.
    let count = 0;
    const W = this.width | 0;
    const H = this.height | 0;
    const stride = this.rowStride | 0;
    const d = this.data;
    for (let y = yLoClipped; y <= yHiClipped; y++) {
      if (xLoClipped > xHiClipped) continue; // c4988 `cmpl %esi,%r9d ; jg .end_row`
      for (let x = xLoClipped; x <= xHiClipped; x++) {
        // @0x0c498d..@0x0c49a1 — per-cell (x,y) buffer-bounds check
        if (x < 0) continue;
        if (y < 0) continue;
        if (x >= W) continue;
        if (y >= H) continue;
        if (d === null) continue; // null-safe fence (disasm has no null guard here)
        // @0x0c49b3..@0x0c49b8 — `sbbl $-1, %eax` following `cmpb $1, byte` increments the counter
        // iff the byte is >= 1.
        if ((d[y * stride + x] & 0xff) >= 1) count++;
      }
    }
    return count;
  }

  /**
   * `PCMaskBuffer::getBoundingBox(int* xMin, int* xMax, int* yMin, int* yMax) const`.
   *
   * @ProCore 0x0c49d2 (`__ZNK12PCMaskBuffer14getBoundingBoxEPiS0_S0_S0_`).
   *
   * Copies the stored bounding-box fields to the four output pointers, in the order
   * (xMin, xMax, yMin, yMax):
   *   0x0c49d6  movl 0x14(%rdi),%eax ; movl %eax,(%rsi)   (*arg1 = bbXmin)
   *   0x0c49db  movl 0x18(%rdi),%eax ; movl %eax,(%rdx)   (*arg2 = bbXmax)
   *   0x0c49e0  movl 0x1c(%rdi),%eax ; movl %eax,(%rcx)   (*arg3 = bbYmin)
   *   0x0c49e5  movl 0x20(%rdi),%eax ; movl %eax,(%r8)    (*arg4 = bbYmax)
   *
   * TS returns the four values in a plain object; caller destructures. This is a faithful
   * 1:1 semantic port (out-pointers are equivalent to a returned tuple in TS).
   */
  getBoundingBox(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    return {
      xMin: this.bbXmin | 0,
      xMax: this.bbXmax | 0,
      yMin: this.bbYmin | 0,
      yMax: this.bbYmax | 0,
    };
  }

  /**
   * `PCMaskBuffer::getMinimalBoundingBoxFromMask(int* xMin, int* xMax, int* yMin, int* yMax) const`.
   *
   * @ProCore 0x0c49ee (`__ZNK12PCMaskBuffer29getMinimalBoundingBoxFromMaskEPiS0_S0_S0_`).
   *
   * Despite the name, this function is IDENTICAL to `getBoundingBox` in effect — it just copies
   * the stored bounding-box fields. The only difference in the machine code is the write ORDER
   * of the assignments (bbXmin, bbYmin, bbXmax, bbYmax) — but since each stores to a distinct
   * pointer, the observable result is the same tuple.
   *
   * Disasm:
   *   0x0c49f2  movl 0x14(%rdi),%eax ; movl %eax,(%rsi)   (*arg1 = bbXmin)
   *   0x0c49f7  movl 0x1c(%rdi),%eax ; movl %eax,(%rcx)   (*arg3 = bbYmin)  ← reordered
   *   0x0c49fc  movl 0x18(%rdi),%eax ; movl %eax,(%rdx)   (*arg2 = bbXmax)
   *   0x0c4a01  movl 0x20(%rdi),%eax ; movl %eax,(%r8)    (*arg4 = bbYmax)
   *
   * Presence-of-two-methods with identical semantics is FCP's API surface, transcribed as-is.
   */
  getMinimalBoundingBoxFromMask(): {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  } {
    return {
      xMin: this.bbXmin | 0,
      xMax: this.bbXmax | 0,
      yMin: this.bbYmin | 0,
      yMax: this.bbYmax | 0,
    };
  }

  /**
   * `PCMaskBuffer::getMinimalBoundingBox(int* xMin, int* xMax, int* yMin, int* yMax) const`.
   *
   * @ProCore 0x0c4a0a (`__ZNK12PCMaskBuffer21getMinimalBoundingBoxEPiS0_S0_S0_`).
   *
   * Computes the TIGHT bounding box of nonzero cells within the STORED bbox by scanning `data`.
   * If the stored bbox is a single point (bbXmin==bbXmax AND bbYmin==bbYmax), or is empty in y
   * (bbYmin > bbYmax), the stored bbox is returned unchanged.
   *
   * If NO nonzero cells are found in the scan, the four output values are:
   *   xMin_out = bbXmax   (running-min starts at bbXmax, never lowered)
   *   xMax_out = bbXmin   (running-max starts at bbXmin, never raised)
   *   yMin_out = bbYmax   (locals -0x2c/-0x30 pre-init from bbYmax/bbYmin)
   *   yMax_out = bbYmin
   * i.e. an "inverted" bbox signaling no-content. Faithful callers detect this sentinel via
   * (xMin_out > xMax_out) or (yMin_out > yMax_out).
   *
   * Algorithm (from disasm @0x0c4a0a..@0x0c4b68):
   *
   *   // Pre-check: single-point or empty-y stored bbox -> return stored bbox as-is
   *   if ((bbXmin ^ bbXmax) | (bbYmin ^ bbYmax) == 0)  or  bbYmin > bbYmax:
   *       write out (bbXmin, bbXmax, bbYmin, bbYmax) and return    (@0x0c4a35..@0x0c4a51)
   *
   *   xMinAcc  = bbXmax       // running MIN of firstNonzeroX across rows        (@0x0c4a97: `movl r8d, ecx`)
   *   xMaxAcc  = bbXmin       // running MAX of lastNonzeroX across rows         (@0x0c4a94: `movl r14d, r11d`)
   *   yMinFinal = bbYmax      // set to `y` on the FIRST row that has a nonzero  (@0x0c4a4b init; @0x0c4b21 update)
   *   yMaxFinal = bbYmin      // set to `y` on EVERY row that has a nonzero      (@0x0c4a4e init; @0x0c4b2c update)
   *   foundAny  = 0                                                              (@0x0c4a8d init; @0x0c4b29 set)
   *
   *   for y in [bbYmin .. bbYmax]:
   *     if bbXmin > bbXmax: skip row's x-scan  (@0x0c4aa0..@0x0c4aa3)
   *
   *     firstX = bbXmax     // sentinel: no nonzero
   *     lastX  = bbXmin     // sentinel: no nonzero
   *     for x in [bbXmin .. bbXmax] (inclusive, x++ each iter unless we found first-nonzero):
   *       if data[y*rowStride + x] == 0: x++ ; continue
   *       // FOUND first nonzero at x. Set firstX=x, lastX=x. Then sub-scan pixels at x+1..bbXmax:
   *       firstX = x
   *       lastX  = x
   *       if x < bbXmax:
   *         for k in [x+1 .. bbXmax]:
   *           if data[y*rowStride + k] != 0: lastX = k
   *         x = bbXmax + 1                          // break out of the OUTER x loop
   *       else:
   *         x = bbXmax + 1                          // break too
   *
   *     if firstX <= lastX:  // any nonzero found this row?      (@0x0c4b07..@0x0c4b0a)
   *       xMinAcc = min(xMinAcc, firstX)                          (@0x0c4b0c..@0x0c4b0f, cmovll)
   *       xMaxAcc = max(xMaxAcc, lastX)                           (@0x0c4b13..@0x0c4b16, cmovlel)
   *       if !foundAny: yMinFinal = y                             (@0x0c4b1a..@0x0c4b21, cmovel)
   *       foundAny = 1                                            (@0x0c4b27..@0x0c4b29)
   *       yMaxFinal = y                                           (@0x0c4b2c)
   *
   *   write out (xMinAcc, xMaxAcc, yMinFinal, yMaxFinal)          (@0x0c4b3f..@0x0c4b5c)
   *
   * Notes on sub-scan (@0x0c4acb..@0x0c4ae8):
   * - When the first nonzero is found at `x`, r13 points at &data[y*rowStride + 1] (set outside
   *   the y-loop as `data + bbYmin*rowStride + 1` @0x0c4a80..@0x0c4a84 and advanced by rowStride
   *   per y-iteration @0x0c4b32). `addq r13, rax` where rax = (int64)x gives &data[y*rs + x + 1],
   *   i.e. the pixel immediately to the right of `x`.
   * - r12d starts at x+1 (@0x0c4acb) and is the CURRENT-scanned x-value; r9d is r12d if the
   *   scanned pixel is nonzero (cmovne), so r9d tracks the LATEST (== rightmost) nonzero seen.
   * - Loop condition `edi = r12d - bbXmax + 1 ; cmpl $1,%edi ; jne` continues while pre-increment
   *   r12d != bbXmax; after `incl r12d` we advance. Net: scans k = x+1, x+2, ..., bbXmax.
   *
   * We transcribe the algorithm above verbatim.
   */
  getMinimalBoundingBox(): {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  } {
    const bbXmin = this.bbXmin | 0;
    const bbXmax = this.bbXmax | 0;
    const bbYmin = this.bbYmin | 0;
    const bbYmax = this.bbYmax | 0;
    const stride = this.rowStride | 0;
    const d = this.data;

    // @0x0c4a35..@0x0c4a51 — pre-check: single-point OR empty-y stored bbox → return as-is.
    const singlePoint =
      ((bbXmin ^ bbXmax) | (bbYmin ^ bbYmax)) === 0;
    const emptyY = bbYmin > bbYmax;
    if (singlePoint || emptyY || d === null) {
      // null-data added to the disasm's condition (would otherwise dereference nullptr)
      return { xMin: bbXmin, xMax: bbXmax, yMin: bbYmin, yMax: bbYmax };
    }

    // Running accumulators (@0x0c4a94..@0x0c4a9d init).
    let xMinAcc = bbXmax; // running MIN of firstNonzeroX
    let xMaxAcc = bbXmin; // running MAX of lastNonzeroX
    let yMinFinal = bbYmax; // -0x2c(rbp) init @0x0c4a4b
    let yMaxFinal = bbYmin; // -0x30(rbp) init @0x0c4a4e
    let foundAny = false; // -0x34(rbp) init @0x0c4a8d

    // @0x0c4a9a..@0x0c4b39 — outer y loop, y in [bbYmin..bbYmax]
    for (let y = bbYmin; y <= bbYmax; y++) {
      // @0x0c4aa0..@0x0c4aa3 — skip row's x-scan if bbXmin > bbXmax
      if (bbXmin > bbXmax) continue;

      // Row-local firstX / lastX. Sentinels: firstX=bbXmax, lastX=bbXmin (@0x0c4a97 & @0x0c4a94).
      let firstX = bbXmax;
      let lastX = bbXmin;

      // @0x0c4aba..@0x0c4b05 — outer x scan for the FIRST nonzero cell in this row.
      let x = bbXmin;
      while (x <= bbXmax) {
        // @0x0c4abd — read data[y*stride + x]
        const b = d[y * stride + x] & 0xff;
        if (b === 0) {
          // @0x0c4afd..@0x0c4b05 — advance x and re-check (x++)
          x++;
          continue;
        }
        // Found first nonzero at x. @0x0c4ac3..@0x0c4af0
        firstX = x;
        lastX = x;
        if (x < bbXmax) {
          // @0x0c4ac8..@0x0c4ae8 — sub-scan pixels at k = x+1 .. bbXmax
          for (let k = x + 1; k <= bbXmax; k++) {
            if ((d[y * stride + k] & 0xff) !== 0) {
              lastX = k;
            }
          }
        }
        // @0x0c4aea..@0x0c4af0 — leave the outer x loop
        break;
      }

      // @0x0c4b07..@0x0c4b2c — merge row result into accumulators.
      if (firstX <= lastX) {
        // @0x0c4b0c..@0x0c4b0f — xMinAcc = min(xMinAcc, firstX)
        if (firstX < xMinAcc) xMinAcc = firstX;
        // @0x0c4b13..@0x0c4b16 — xMaxAcc = max(xMaxAcc, lastX)   (cmovle: r11d<-r9d if r11d<=r9d)
        if (xMaxAcc <= lastX) xMaxAcc = lastX;
        // @0x0c4b1a..@0x0c4b21 — if !foundAny, capture yMinFinal = y
        if (!foundAny) yMinFinal = y;
        // @0x0c4b27..@0x0c4b29 — foundAny = 1
        foundAny = true;
        // @0x0c4b2c — yMaxFinal = y (every nonzero row updates this)
        yMaxFinal = y;
      }
    }

    // @0x0c4b3f..@0x0c4b5c — write outputs.
    return { xMin: xMinAcc, xMax: xMaxAcc, yMin: yMinFinal, yMax: yMaxFinal };
  }
}
