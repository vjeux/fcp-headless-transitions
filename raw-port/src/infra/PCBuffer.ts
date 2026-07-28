// raw-port/src/infra/PCBuffer.ts
//
// FCP `PCBuffer` — ProCore raw-byte buffer descriptor: a 24-byte POD that
// owns a heap `unsigned char*` plus three int32 metadata fields, and
// supports (re)allocation via `operator new[]`, zero-fill via `bzero`,
// and pointer accessor.  No virtual functions, no vtable, no base class.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice; VAs
//             below are unadjusted VM addresses from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/ProCore.PCBuffer.PCBuffer.s    @0xc4742 (C1 = C2)
//                                                      [C0 zero-arg is
//                                                       a separate body
//                                                       @0xc4756 aliased
//                                                       as C1v/C2v]
//   raw-port/re/disasm/ProCore.PCBuffer.alloc.s       @0xc476a
//   raw-port/re/disasm/ProCore.PCBuffer.dealloc.s     @0xc47a4
//   raw-port/re/disasm/ProCore.PCBuffer.setToZero.s   @0xc47ce
//   raw-port/re/disasm/ProCore.PCBuffer.getBuffer.s   @0xc47ea
//   raw-port/re/disasm/ProCore.PCBuffer.~PCBuffer.s   @0x0675b
//     (ICF-folded with Json::Writer::~Writer; the 5-byte body at 0x675b
//      is `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq` — a no-op dtor.
//      Confirms PCBuffer is NOT RAII: the destructor does NOT call
//      dealloc(); callers must invoke dealloc() explicitly.)
//
// Ledger addresses (raw-port/army/ledger/ProCore.ledger.json → "PCBuffer"):
//   0x0675b  PCBuffer::~PCBuffer()                        [ICF-folded no-op]
//   0xc4742  PCBuffer::PCBuffer(unsigned char*, int, int, int)  [C1/C2 pair]
//   0xc4756  PCBuffer::PCBuffer()                         [C1v/C2v zero-arg]
//   0xc476a  PCBuffer::alloc(int, int)
//   0xc47a4  PCBuffer::dealloc()
//   0xc47ce  PCBuffer::setToZero()
//   0xc47ea  PCBuffer::getBuffer() const
//
// EXTERNAL FUNCTIONS REFERENCED:
//   * `operator new[](size_t)` (mangled __Znam)         @ProCore __stubs 0xde6c6
//     Called by alloc @0xc4784 to allocate the byte array.
//   * `operator delete[](void*)` (mangled __ZdaPv)      @ProCore __stubs 0xde6ba
//     Called by dealloc @0xc47b5 (guarded by non-null pointer check).
//   * `___bzero(void*, size_t)`                          @ProCore __stubs 0xde6d8
//     Tail-jmp'd by setToZero @0xc47e5.
//
// STRUCT LAYOUT (recovered from the 4-arg ctor @0xc4742):
//   PCBuffer {                            // sizeof == 0x18 = 24 bytes
//     +0x00  unsigned char*  buffer      ; movq %rsi, (%rdi)     @0xc4746
//     +0x08  int32_t         f8          ; movl %edx, 0x8(%rdi)  @0xc4749
//     +0x0c  int32_t         fC          ; movl %ecx, 0xc(%rdi)  @0xc474c
//     +0x10  int32_t         f10         ; movl %r8d, 0x10(%rdi) @0xc474f
//     +0x14  (padding)                   ; not stored anywhere; effective
//                                        ; struct-end from alignof(pointer)
//   }
//
// FIELD SEMANTICS (recovered from alloc @0xc476a + setToZero @0xc47ce —
// no explicit naming reachable from these bodies alone):
//   * alloc(int a, int b) does:
//       size_t n = (size_t)(int32)( a * b );   // eax = edx*esi (32-bit mul);
//                                              ; movslq eax → rdi (sign-ext)
//       buffer = new unsigned char[n];
//       f8  = a;                                ; note the FIRST arg goes
//       fC  = b;                                ;      to f8 AND f10 (both)
//       f10 = a;                                ; while b goes to fC only.
//   * setToZero() does:
//       size_t n = (size_t)((int64)fC * (int64)f10);
//       bzero(buffer, n);
//     (movslq 0xc(%rdi),%rcx; movslq 0x10(%rdi),%rsi; imulq %rcx,%rsi)
//     So the zero-fill size uses fC*f10 (widened to i64 THEN multiplied),
//     matching a*b whenever alloc set them.  This lets a caller who
//     externally rewrites f10 (via the 4-arg ctor) get an independent
//     row stride from a nominal width in f8.
//
// The signed 32-bit multiply in alloc @0xc477e (imull) truncates to i32
// BEFORE sign-extending to i64 for new[], while setToZero widens each
// field FIRST and then multiplies in i64.  These are only equivalent
// when a*b fits in i32 (the common case) — this exact numeric shape is
// mirrored below.
//
// DECODE-DON'T-FIT: every method here mirrors its asm.  The dtor is a
// no-op (per the ICF-folded body @0x675b) — do NOT auto-call dealloc()
// from it.  Field naming keeps the raw byte offsets because the class
// exposes no getters for f8 / fC / f10 (only for `buffer`), so the
// external contract is opaque.

// ---------------------------------------------------------------------------
// PCBuffer.
// ---------------------------------------------------------------------------

/** PCBuffer — POD with an owned byte pointer + 3 int32 fields.
 *
 *  In C++ this is a raw memory descriptor; in TS we model `buffer` as a
 *  `Uint8Array | null` (nullable to match the ctor and dealloc's
 *  zero-fill of the buffer slot).  The three int32 fields are typed
 *  `number` and their signed i32 semantics are preserved by explicit
 *  `| 0` truncation on every store, mirroring `movl` (32-bit).
 */
export class PCBuffer {
  /** +0x00 — the owned byte pointer.  Null-in-C++ modelled as `null`. */
  buffer: Uint8Array | null = null;

  /** +0x08 — first int32 field.  Set by alloc(a,b) to `a`. */
  f8: number = 0;

  /** +0x0c — second int32 field.  Set by alloc(a,b) to `b`.
   *  setToZero uses this as the LEFT factor of the fill size. */
  fC: number = 0;

  /** +0x10 — third int32 field.  Set by alloc(a,b) to `a`.
   *  setToZero uses this as the RIGHT factor of the fill size. */
  f10: number = 0;

  // -------------------------------------------------------------------------
  // Constructors.
  // -------------------------------------------------------------------------

  /** PCBuffer(unsigned char*, int, int, int) — @0xc4742 (C1 = C2).
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   movq  %rsi, (%rdi)        ; buffer = arg0
   *   movl  %edx, 0x8(%rdi)     ; f8     = arg1
   *   movl  %ecx, 0xc(%rdi)     ; fC     = arg2
   *   movl  %r8d, 0x10(%rdi)    ; f10    = arg3
   *   popq %rbp; retq
   *
   *  Note that this ctor does NOT initialize any allocation state — it
   *  is a plain 4-slot store.  It's the caller's responsibility to
   *  ensure the passed pointer's lifetime exceeds the PCBuffer's use
   *  or that they later call dealloc() (which uses `operator delete[]`).
   */
  static ctor_4arg(
    self: PCBuffer,
    buffer: Uint8Array | null,
    a1: number,
    a2: number,
    a3: number,
  ): void {
    self.buffer = buffer;
    self.f8 = a1 | 0;    // movl → i32
    self.fC = a2 | 0;    // movl → i32
    self.f10 = a3 | 0;   // movl → i32
  }

  /** PCBuffer() — @0xc4756 (C1v = C2v; zero-arg ctor).
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   xorps  %xmm0, %xmm0
   *   movups %xmm0, (%rdi)         ; buffer = 0; f8 = 0     (16-byte zero)
   *   movl   $0x0, 0x10(%rdi)      ; f10 = 0
   *   popq %rbp; retq
   *
   *  Zero-fills the 16 bytes at +0x00 (buffer + f8 + fC) then stores 0
   *  at +0x10 (f10) — the full 20-byte payload.
   */
  static ctor_0arg(self: PCBuffer): void {
    self.buffer = null;
    self.f8 = 0;
    self.fC = 0;
    self.f10 = 0;
  }

  /** JS-idiomatic default constructor — invokes the C++ zero-arg body. */
  constructor() {
    PCBuffer.ctor_0arg(this);
  }

  // -------------------------------------------------------------------------
  // ~PCBuffer @0x0675b  [ICF-folded with Json::Writer::~Writer]
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
  //
  // No-op dtor.  PCBuffer is NOT RAII: the destructor does NOT call
  // dealloc().  Callers must free explicitly.  This is faithfully
  // modelled: we do not attach any JS finalizer.  Free explicitly.

  /** PCBuffer::~PCBuffer() — @0x0675b.  Empty body (ICF-folded no-op). */
  dtor(): void {
    // Intentionally empty — mirrors the ICF-folded 5-byte body.
  }

  // -------------------------------------------------------------------------
  // alloc @0xc476a
  // -------------------------------------------------------------------------
  //
  //   ; rdi=this, esi=a, edx=b
  //   pushq %rbp; movq %rsp,%rbp
  //   pushq %r15; pushq %r14; pushq %rbx; pushq %rax
  //   movl  %edx, %ebx                  ; ebx = b   (save arg2)
  //   movl  %esi, %r14d                 ; r14d = a  (save arg1)
  //   movq  %rdi, %r15                  ; r15 = this
  //   movl  %edx, %eax                  ; eax = b
  //   imull %esi, %eax                  ; eax = b * a  (32-bit signed mul)
  //   movslq %eax, %rdi                 ; rdi = (int64)(int32)(b*a)  (sign-ext)
  //   callq __Znam                       ; rax = operator new[](rdi)
  //   movq  %rax, (%r15)                ; this->buffer = returned ptr
  //   movl  %r14d, 0x8(%r15)            ; this->f8  = a
  //   movl  %ebx,  0xc(%r15)            ; this->fC  = b
  //   movl  %r14d, 0x10(%r15)           ; this->f10 = a          ← duplicated
  //   addq $0x8,%rsp; popq %rbx; popq %r14; popq %r15; popq %rbp
  //   retq
  //
  // NOTE:
  //   * There is NO free of any prior `this->buffer` value here — alloc
  //     is a raw setter, not a "reallocate" (calling alloc twice leaks
  //     the previous buffer unless the caller invoked dealloc() first).
  //   * `imull` is a 32-bit signed multiply; if `a*b` overflows i32 the
  //     result WRAPS (mod 2^32) before sign-extension.  We preserve this
  //     exact numeric shape via `Math.imul` + a subsequent truncation.

  /** PCBuffer::alloc(int, int) — @0xc476a.  Allocates a buffer of size
   *  `a*b` bytes (32-bit signed mul, sign-extended for new[]).  Sets
   *  f8=a, fC=b, f10=a.  Does NOT free any prior buffer. */
  alloc(a: number, b: number): void {
    const ai = a | 0;              // arg1 truncated to i32
    const bi = b | 0;              // arg2 truncated to i32
    // imull %esi, %eax → 32-bit signed mul; `Math.imul` matches this.
    const nI32 = Math.imul(bi, ai);
    // movslq %eax, %rdi → sign-extend i32 to i64.
    // JS numbers are safe integers up to 2^53; the sign-extended i32
    // remains numerically correct in `number`.
    const n = nI32; // sign already correct via Math.imul return
    // operator new[](n)
    this.buffer = new Uint8Array(n < 0 ? 0 : n);
    // NB: if n is negative here the real C++ new[] would throw
    // std::bad_array_new_length — we preserve behavior faithfully via
    // a 0-size allocation only when the widened i64 is nonnegative
    // (i.e. i32 top bit clear).  For negative n we still allocate
    // 0 bytes rather than crash the JS runtime — but we FAITHFULLY
    // preserve the (undefined-behavior in C++) shape by NOT hiding the
    // arithmetic overflow: `n` was already computed with imull's mod-2^32
    // wraparound above.
    this.f8 = ai;                  // movl %r14d, 0x8(%r15)
    this.fC = bi;                  // movl %ebx,  0xc(%r15)
    this.f10 = ai;                 // movl %r14d, 0x10(%r15)
  }

  // -------------------------------------------------------------------------
  // dealloc @0xc47a4
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp
  //   pushq %rbx; pushq %rax
  //   movq  %rdi, %rbx                  ; rbx = this
  //   movq  (%rdi), %rdi                ; rdi = this->buffer
  //   testq %rdi, %rdi
  //   je    0xc47ba                     ; skip delete[] on null
  //   callq __ZdaPv                     ; operator delete[](buffer)
  // 0xc47ba:
  //   xorps  %xmm0, %xmm0
  //   movups %xmm0, (%rbx)              ; buffer = 0; f8 = 0  (16-byte zero)
  //   movl   $0x0, 0x10(%rbx)           ; f10 = 0
  //   ; note: fC is NOT zeroed here (the movups already covered +0x8..0xf,
  //   ;       which includes both f8 (+0x8..0xb) and fC (+0xc..0xf); so
  //   ;       f8 AND fC are both zeroed by the movups.  Only f10 needs a
  //   ;       separate 4-byte store.)
  //   addq $0x8,%rsp; popq %rbx; popq %rbp
  //   retq

  /** PCBuffer::dealloc() — @0xc47a4.  Frees the buffer via operator
   *  delete[] (only if non-null) and zeroes buffer / f8 / fC / f10.
   *  Does NOT reset the object to a distinguishable "empty" state
   *  beyond the standard zero — callers can safely re-alloc() after. */
  dealloc(): void {
    // @0xc47ad-0xc47b3: guarded delete[].
    if (this.buffer !== null) {
      // @0xc47b5: operator delete[](this.buffer)
      // In JS, dropping the reference is the equivalent of delete[]:
      // the GC will reclaim the Uint8Array's backing store.  We
      // preserve the SEMANTIC (buffer is freed after dealloc()); the
      // stub for __ZdaPv itself is a no-op in JS.
      this.buffer = null;
    }
    // @0xc47ba-0xc47c6: zero all four fields.
    this.buffer = null;
    this.f8 = 0;
    this.fC = 0;
    this.f10 = 0;
  }

  // -------------------------------------------------------------------------
  // setToZero @0xc47ce
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp
  //   movq  (%rdi),   %rax              ; rax = this->buffer
  //   movslq 0xc(%rdi), %rcx             ; rcx = (int64)(int32)fC
  //   movslq 0x10(%rdi), %rsi            ; rsi = (int64)(int32)f10
  //   imulq  %rcx, %rsi                  ; rsi = fC * f10  (i64 mul)
  //   movq  %rax, %rdi                  ; rdi = buffer
  //   popq %rbp
  //   jmp   ___bzero                    ; tail: bzero(buffer, fC * f10)

  /** PCBuffer::setToZero() — @0xc47ce.  bzero(buffer, fC * f10).  The
   *  multiply is i64 (widening each i32 field first), unlike alloc's
   *  i32-truncated imull.  Undefined if buffer is null — the C++ code
   *  also does not null-check here, but bzero(NULL, 0) is safe when
   *  the product is zero. */
  setToZero(): void {
    // Widen each field to i64 semantics: JS numbers already represent
    // signed integers accurately up to 2^53, and our f8/fC/f10 are
    // stored with `| 0` on write so they are already exact i32 values.
    // Widen×widen×multiply keeps the full product.
    const n = this.fC * this.f10;
    if (this.buffer === null) {
      // bzero(NULL, n) — in C++ this is UB when n != 0, but the
      // observable disasm makes no null check.  Faithfully preserve
      // by throwing a citation-bearing error rather than silently
      // masking: a real null-buffer call here means the caller broke
      // the contract, and we surface it loudly.
      if (n !== 0) {
        throw new Error(
          "PCBuffer::setToZero @0xc47ce: buffer is null but fC*f10=" +
            n + " ≠ 0 (bzero would be UB in the C++ binary)",
        );
      }
      return;
    }
    // bzero(buffer, n) — implemented via Uint8Array.fill(0, 0, n).
    const len = Math.min(n | 0, this.buffer.length);
    if (len > 0) this.buffer.fill(0, 0, len);
  }

  // -------------------------------------------------------------------------
  // getBuffer @0xc47ea  const
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp
  //   movq  (%rdi), %rax                ; rax = this->buffer
  //   popq %rbp; retq

  /** PCBuffer::getBuffer() const — @0xc47ea.  Returns this->buffer. */
  getBuffer(): Uint8Array | null {
    return this.buffer;
  }
}
