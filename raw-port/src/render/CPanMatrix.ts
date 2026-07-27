/**
 * CPanMatrix (Flexo framework) — audio pan/gain routing matrix.
 *
 * An NxN row-major matrix of single-precision floats. Storage is a single
 * contiguous `float[n*n]` block on the heap, zero-initialized at ctor.
 * Used as a channel-to-channel gain routing matrix (row i is the gain
 * vector applied when producing output channel i).
 *
 * Struct layout (recovered from ctor / dtor / op= / op[] / assignToArray disasm):
 *   +0x00  uint32_t  n     — matrix side length (channel count)
 *   +0x08  float*    data  — pointer to `new float[n*n]`  (bzero'd at ctor)
 *
 * Methods transcribed (Flexo @ x86_64):
 *   CPanMatrix::CPanMatrix(unsigned int)      @0x124b4f0
 *   CPanMatrix::CPanMatrix(CPanMatrix const&) @0x124b530
 *   CPanMatrix::~CPanMatrix()                 @0x124b630
 *   CPanMatrix::operator=(CPanMatrix const&)  @0x124b650
 *   CPanMatrix::operator[](unsigned int)      @0x124b770
 *   CPanMatrix::assignToArray(float*)         @0x124b780
 */

// Struct field byte offsets, recovered from disasm.
// (Kept as consts for documentation; TS fields below cite them by comment.)
// +0x00 uint32_t n
// +0x08 float*   data  (allocation size = n * n * sizeof(float) bytes)

export class CPanMatrix {
  /** +0x00 uint32_t — matrix side length (channels). */
  private _n: number;
  /**
   * +0x08 float* — n*n row-major single-precision floats.
   * Corresponds to `new float[n*n]` in the FCP ctor (bzero'd).
   */
  private _data: Float32Array;

  /**
   * CPanMatrix::CPanMatrix(unsigned int n) @0x124b4f0
   *
   * Disasm:
   *   movl %esi, (%rdi)                 ; this->n = n              (+0x00)
   *   movq $0x0, 0x8(%rdi)              ; this->data = nullptr     (+0x08)
   *   movl %esi, %edi
   *   imull %edi, %edi                  ; edi = n*n     (32-bit imull)
   *   shlq  $0x2, %rdi                  ; rdi = n*n*4   (bytes)
   *   callq __Znam                      ; operator new[](n*n*4)  @stub 0x1497446
   *   movq %rax, 0x8(%r14)              ; this->data = alloc
   *   ... jmp __stub _bzero             ; bzero(data, n*n*4)     @stub 0x1497584
   *
   * @0xADDR 0x124b4f0
   */
  constructor(n: number);
  /**
   * CPanMatrix::CPanMatrix(CPanMatrix const& other) @0x124b530
   *
   * Disasm:
   *   movl (%rsi), %r15d ; movl %r15d, (%rdi)  ; this->n = other.n
   *   imull %r15d, %r15d ; leaq (,%r15,4), %rdi ; edi = n*n*4
   *   callq __Znam                             ; alloc n*n floats  @stub 0x1497446
   *   movq %rax, 0x8(%r14)                     ; this->data = alloc
   *   testl %r15d, %r15d ; je end              ; if (n == 0) done
   *   ; --- inlined memcpy over n*n floats (SSE 8-float unroll + scalar tail) ---
   *   ;   movups (%rcx,%rsi,4),%xmm0 ; movups %xmm0,(%rax,%rsi,4)  x2  per 8 floats
   *   ;   movss  (%rcx,%rsi,4),%xmm0 ; movss  %xmm0,(%rax,%rsi,4)      scalar tail
   *   ; observable effect: dst[i] = src[i] for i in 0..n*n
   *
   * @0xADDR 0x124b530
   */
  constructor(other: CPanMatrix);
  constructor(arg: number | CPanMatrix) {
    if (typeof arg === 'number') {
      // n-arg ctor @0x124b4f0
      this._n = arg >>> 0;                              // movl %esi,(%rdi) — uint32
      const total = Math.imul(this._n, this._n) >>> 0;  // imull  (32-bit)
      // __Znam + bzero -> zero-initialized backing storage of exactly n*n floats
      this._data = new Float32Array(total);
    } else {
      // copy ctor @0x124b530
      this._n = arg._n >>> 0;                           // movl (%rsi),%r15d
      const total = Math.imul(this._n, this._n) >>> 0;  // imull %r15d,%r15d
      this._data = new Float32Array(total);             // __Znam
      if (this._n !== 0) {                              // testl %r15d,%r15d ; je 0x124b617
        // Element-wise float32 copy. Matches the movss/movups loop bit-for-bit
        // for finite floats (typed-array float32 store preserves IEEE-754 payload).
        for (let i = 0; i < total; i++) {
          this._data[i] = arg._data[i];
        }
      }
    }
  }

  /**
   * CPanMatrix::~CPanMatrix() @0x124b630
   *
   * Disasm:
   *   movq 0x8(%rdi), %rdi              ; rdi = this->data
   *   testq %rdi, %rdi ; je 0x124b643
   *   ... jmp __stub __ZdaPv            ; operator delete[](data)  @stub 0x14973fe
   *   retq
   *
   * TypeScript has no C++ destructor; `dispose()` mirrors the delete[]
   * side effect (drops the storage reference). The object must not be
   * used after this call, matching the C++ post-condition.
   *
   * @0xADDR 0x124b630
   */
  dispose(): void {
    // delete[] this->data — modeled as reference drop.
    this._data = new Float32Array(0);
  }

  /**
   * CPanMatrix::operator=(CPanMatrix const& other) @0x124b650
   *
   * Disasm:
   *   cmpq %rsi, %rdi ; je 0x124b757     ; self-assign guard: return *this
   *   movq 0x8(%rbx), %rdi
   *   testq %rdi, %rdi ; je skip_del     ; if (data) delete[] data
   *   callq __ZdaPv                      ; @stub 0x14973fe
   * skip_del:
   *   movl (%r14), %r15d ; movl %r15d, (%rbx)   ; this->n = other.n
   *   imull %r15d, %r15d ; leaq (,%r15,4), %rdi ; edi = n*n*4
   *   callq __Znam                              ; alloc new       @stub 0x1497446
   *   movq %rax, 0x8(%rbx)                      ; this->data = alloc
   *   testl %r15d, %r15d ; je 0x124b757         ; if (n == 0) done
   *   ; --- same SSE/scalar element-wise copy of n*n floats as copy-ctor ---
   *   movq %rbx, %rax                           ; return this
   *
   * @0xADDR 0x124b650
   */
  assign(other: CPanMatrix): CPanMatrix {
    if (other === this) return this;                    // cmpq %rsi,%rdi ; je 0x124b757
    // delete[] old data (guarded by non-null in asm; JS ref just gets replaced).
    this._n = other._n >>> 0;                           // movl (%r14),%r15d
    const total = Math.imul(this._n, this._n) >>> 0;
    this._data = new Float32Array(total);               // __Znam
    if (this._n !== 0) {                                // testl %r15d,%r15d ; je 0x124b757
      for (let i = 0; i < total; i++) {
        this._data[i] = other._data[i];
      }
    }
    return this;                                        // movq %rbx,%rax
  }

  /**
   * CPanMatrix::operator[](unsigned int i) @0x124b770
   *
   * Disasm (entire body):
   *   movl %esi, %eax
   *   shlq $0x2, %rax           ; rax = i * 4  (bytes)
   *   addq 0x8(%rdi), %rax      ; rax = this->data + i    (as float*)
   *   retq
   *
   * Returns a `float*` to element index `i` in the flat n*n storage.
   * NOTE: this is exactly `data + i` (float-stride), NOT `data + i*n`.
   * Callers stride by `n` themselves when they want a row pointer.
   *
   * We expose the pair (buffer, offset) so callers can index either as
   * a row-start (with a stride of n) or as a single element.
   *
   * @0xADDR 0x124b770
   */
  index(i: number): { buffer: Float32Array; offset: number } {
    // Direct translation: pointer arithmetic `&data[i]`. No bounds check
    // (there is none in the FCP body — undefined behavior on out-of-range
    // is inherited; JS Float32Array read at OOB offset returns undefined,
    // write is a silent no-op).
    return { buffer: this._data, offset: i >>> 0 };
  }

  /**
   * CPanMatrix::assignToArray(float* dst) @0x124b780
   *
   * Disasm (~400 lines — an unrolled/vectorized copy with two paths):
   *   movl (%rdi), %eax               ; eax = this->n
   *   testq %rax, %rax ; je 0x124be05 ; if (n == 0) return
   *   movq 0x8(%rdi), %rcx            ; rcx = this->data
   *   cmpl $0x7, %eax ; ja 0x124b7bb  ; branch: n>=8 vector path, n<=7 unrolled
   *   ; --- outer loop r11 = 0..n ---
   *   ;   n<=7 path: inline unrolled copy of `n` floats via movss
   *   ;             (special-cased for n = 1..7 via cmpl $0x1..$0x6)
   *   ;   n>=8 path: SSE movups pairs (8 floats/iter) + scalar 8-float remainder
   *   ; --- advance rcx += n*4 ; rsi += n*4 ; loop until r11 == n ---
   *
   * Semantic: copies exactly `n * n` floats from `this->data` to `dst`, in
   * order. Every read is `movss` (float32) and every write is `movss`
   * (float32) — no reinterpretation, no scaling, no accumulation.
   *
   * Equivalent to:
   *   if (n == 0) return;
   *   memcpy(dst, this->data, n * n * sizeof(float));
   *
   * @0xADDR 0x124b780
   */
  assignToArray(dst: Float32Array): void {
    const n = this._n;
    if (n === 0) return;                                // testq %rax,%rax ; je 0x124be05
    const total = Math.imul(n, n) >>> 0;
    // The FCP body unrolls a row-by-row copy; observable effect is a linear
    // memcpy of n*n floats. Preserve that: single flat loop, float32 stores.
    for (let i = 0; i < total; i++) {
      dst[i] = this._data[i];
    }
  }

  /** Non-ABI accessors reflecting the recovered layout. */
  get n(): number {
    return this._n;
  }
  get data(): Float32Array {
    return this._data;
  }
}
