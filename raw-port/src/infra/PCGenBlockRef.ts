// raw-port/src/infra/PCGenBlockRef.ts
//
// FCP `PCGenBlockRef<T>` — ProCore.framework refcounted-buffer handle. It is
// the storage primitive under every `PCGenVector<T>` / `PCGenMatrix<T>` in the
// Levenberg–Marquardt / Matchmove linear-algebra stack. One class per file
// (PORTING_SPEC Rule 6); PCGenVector<T> lives in its own file and imports this.
//
// The struct is an 8-byte object holding a single `T*` pointer to the START
// OF USER ELEMENTS. Two `uint32`s live IN THE HEAP BUFFER, 8 bytes BEFORE
// that user pointer:
//
//   heap: [ sizeBytes:u32 | refcount:u32 | element[0] | element[1] | ... ]
//                                        ^ this address is stored in `ptr`
//
// So `ptr[-4]` is the reference count (byte offset -0x4) and `ptr[-8]` is the
// element-array size in BYTES (byte offset -0x8). This layout is used across
// PCGenBlockRef<float>, <double>, <int>, <char*> — the ICF linker folds
// `assign` into a single body (`__ZN13PCGenBlockRefIPcE6assignEPS0_`) which is
// shared by every T because it never dereferences the elements.
//
// DECODE (all ProCore):
//   raw-port/re/disasm/ProCore.PCGenBlockRef<float>.PCGenBlockRef.s          @0xba07c
//   raw-port/re/disasm/ProCore.PCGenBlockRef<float>.~PCGenBlockRef.s         @0xb6c4a
//   raw-port/re/disasm/ProCore.PCGenBlockRef<char*>.assign.s                 @0xba044
//     (ICF-folded body reused by <float>::assign @__ZN13PCGenBlockRefIfE6assignEPf,
//      <double>::assign, <int>::assign — same pointer-swap logic for all T)
//   raw-port/re/disasm/ProCore.PCGenVector<float>.unique.s                   @0xb7d6c
//     (independently confirms the -4/refcount and -8/deallocate offsets)
//
// SYMBOLS (all ProCore, from /tmp/ProCore_demangled.txt):
//   __ZN13PCGenBlockRefIfEC2Ei       PCGenBlockRef<float>::PCGenBlockRef(int)   @0xba07c
//   __ZN13PCGenBlockRefIfED2Ev       PCGenBlockRef<float>::~PCGenBlockRef()     @0xb6c4a
//   __ZN13PCGenBlockRefIfE6assignEPf PCGenBlockRef<float>::assign(float*)       (ICF -> 0xba044)
//   __ZN13PCGenBlockRefIPcE6assignEPS0_ PCGenBlockRef<char*>::assign(char**)    @0xba044
//   __ZN13PCGenBlockRefIdE6assignEPd  PCGenBlockRef<double>::assign(double*)    (ICF -> 0xba044)
//   0xde6c6  __Znam         operator new[](unsigned long)
//   0xde6ba  __ZdaPv        operator delete[](void*)
//   0xde79e  _bzero
//
// FRONTIER: none. Every operation on this class is decoded from the disasm
// above; there are no un-transcribed callees on the linear path.

// A PCGenBlockRef<T> is a POD 8-byte handle. In C++ it stores a raw `T*` into
// the middle of a heap allocation. In TypeScript we can't store two uint32s
// "in the bytes before" a Float32Array's origin, so we model the heap header
// as a first-class object — but only the header. The `T*` observable pointer
// value (used to identify "same buffer" in `assign`) is modeled as the
// header object identity: two PCGenBlockRef instances share a buffer iff
// their `.header` references the same object.

/**
 * Heap header living in the 8 bytes BEFORE the user pointer. Recovered from
 * the ctor @ProCore 0xba0a3..0xba0b0:
 *   0xba0a7  movl %r15d, (%rax)         sizeBytes  -> alloc+0x0
 *   0xba0aa  movl $0x1, 0x4(%rax)       refcount=1 -> alloc+0x4
 *   0xba0a3  leaq 0x8(%rax), %r14       userPtr = alloc + 8
 * The user pointer is the READ pointer; the header lives at userPtr - 8.
 */
export interface PCGenBlockRefHeader<TArr> {
  /** alloc+0x0 (userPtr-0x8): u32 element-array size in bytes (n * sizeof(T)). */
  sizeBytes: number;
  /** alloc+0x4 (userPtr-0x4): u32 reference count. Ctor sets 1; assign
   *  inc/dec's this; dtor dec's and frees when it hits 0. */
  refcount: number;
  /** userPtr .. userPtr + sizeBytes: the element buffer. Typed differently
   *  per T instantiation; typed at PCGenBlockRef<T>'s call site. */
  data: TArr | null;
}

/**
 * PCGenBlockRef<T> — the refcounted-buffer handle. Modeled as a class rather
 * than a bare struct because assign()/dtor mutate its single field in the
 * SAME ways FCP does (dec-old-and-maybe-free, then adopt-new-and-inc). All
 * three operations are transcribed line-for-line from the disasm.
 *
 * @ProCore  ctor 0xba07c, dtor 0xb6c4a, assign 0xba044
 */
export class PCGenBlockRef<
  TArr extends Float32Array | Float64Array | Int32Array | BigUint64Array,
> {
  /** +0x00 the sole field of the object: a reference to the header living at
   *  the START of the heap allocation. C++ stores the USER pointer (alloc+8)
   *  in this slot and reads size/refcount at negative offsets from it; we
   *  can't do that in TS, so we point directly at the header object and let
   *  every operation read/write `header.refcount` / `header.sizeBytes` /
   *  `header.data`. When this field is `null`, the block-ref is empty
   *  (the ctor's `n==0` branch @0xba0be sets `%r14d = 0` then `mov %r14, (%rbx)`). */
  header: PCGenBlockRefHeader<TArr> | null = null;

  /**
   * `PCGenBlockRef<T>::PCGenBlockRef(int n)` @ProCore 0xba07c.
   *
   * Line-for-line transcription:
   *   0xba089  testl %esi, %esi        // if (n == 0)
   *   0xba08b  je    0xba0be           //   goto empty
   *   0xba090  shll  $0x2, %r15d       // r15 = n * 4   (sizeof(float)=4;
   *                                    //  <double> template would be *8,
   *                                    //  <int>/<char*> also *4 on i64 abi
   *                                    //  for their T; here we take
   *                                    //  bytesPerElement as a parameter
   *                                    //  because the shift is baked in
   *                                    //  per-instantiation by the compiler)
   *   0xba094  leal  0x8(,%rsi,4), %eax // alloc size = 8 + n*4 bytes
   *   0xba09e  callq __Znam            // new[] returns raw buffer
   *   0xba0a3  leaq  0x8(%rax), %r14   // userPtr = alloc + 8
   *   0xba0a7  movl  %r15d, (%rax)     // header.sizeBytes = n*4
   *   0xba0aa  movl  $0x1, 0x4(%rax)   // header.refcount = 1
   *   0xba0b7  callq _bzero            // bzero(userPtr, n*4)
   *   0xba0be  xorl  %r14d, %r14d      // empty branch: userPtr = 0
   *   0xba0c1  movq  %r14, (%rbx)      // this->ptr = userPtr
   *
   * @param n                 element count; may be 0 (produces an empty ref).
   * @param bytesPerElement   sizeof(T) for this instantiation (4 for float/int/char*, 8 for double).
   * @param makeBuffer        typed-array constructor that gives us a zeroed buffer of `n` elements.
   */
  constructor(
    n: number,
    _bytesPerElement: number,
    makeBuffer: (count: number) => TArr,
  ) {
    if (n === 0) {
      // 0xba0be: empty branch. header stays null.
      this.header = null;
      return;
    }
    // 0xba090..0xba0b7: allocate, store size+refcount in the header, bzero
    // the data area. JS typed-array constructors give us zero-initialized
    // buffers — that IS the observable effect of `new[] + bzero`.
    this.header = {
      sizeBytes: n * _bytesPerElement,
      refcount: 1,
      data: makeBuffer(n),
    };
  }

  /**
   * `PCGenBlockRef<T>::~PCGenBlockRef()` @ProCore 0xb6c4a.
   *
   * Line-for-line:
   *   0xb6c53  movq  (%rdi), %rdi       // rdi = this->ptr (userPtr)
   *   0xb6c56  testq %rdi, %rdi         // if (ptr == 0)
   *   0xb6c59  je    0xb6c70            //   goto ret
   *   0xb6c5b  decl  -0x4(%rdi)         // if (--refcount != 0)
   *   0xb6c5e  jne   0xb6c70            //   goto ret
   *   0xb6c60  addq  $-0x8, %rdi        // alloc = ptr - 8
   *   0xb6c64  callq __ZdaPv            // delete[] alloc
   *   0xb6c69  movq  $0x0, (%rbx)       // this->ptr = 0
   *
   * (This function is ICF-folded with `PCGenVector<float>::~PCGenVector`
   *  because the vector's dtor's only observable work IS destroying its
   *  first-8-byte BlockRef subobject — both `nm -a` entries live at 0xb6c4a.)
   */
  dispose(): void {
    if (this.header === null) return;
    // 0xb6c5b: decl -0x4(%rdi)  — decrement refcount
    this.header.refcount -= 1;
    // 0xb6c5e: jne 0xb6c70    — if still referenced, don't free
    if (this.header.refcount !== 0) return;
    // 0xb6c60..0xb6c64: addq $-0x8, %rdi; callq __ZdaPv
    // In a GC runtime this is a no-op; we drop the reference so the
    // header + typed-array become unreachable.
    this.header.data = null;
    // 0xb6c69: movq $0x0, (%rbx)
    this.header = null;
  }

  /**
   * `PCGenBlockRef<T>::assign(T*)` @ProCore 0xba044.
   *
   * Adopts a new user pointer, releasing the old one and inc'ing the new
   * one's refcount. The disasm we have is the ICF body used by
   * `<char*>::assign(char**)`; `<float>::assign(float*)`, `<double>::assign(
   * double*)` and `<int>::assign(int*)` are ICF-folded into the same body
   * because none of them dereference an ELEMENT — they only touch the two
   * header uint32s at [-8]/[-4]. That justifies porting once and using it
   * across every PCGenBlockRef<T>.
   *
   * Line-for-line:
   *   0xba04e  movq  (%rdi), %rdi     // rdi = this->ptr (OLD)
   *   0xba051  cmpq  %rdi, %rsi       // if (new == old)
   *   0xba054  je    0xba077          //   return
   *   0xba059  testq %rdi, %rdi       // if (old == 0)
   *   0xba05c  je    0xba06c          //   skip release
   *   0xba05e  decl  -0x4(%rdi)       // if (--old.refcount != 0)
   *   0xba061  jne   0xba06c          //   skip free
   *   0xba063  addq  $-0x8, %rdi      // alloc = old - 8
   *   0xba067  callq __ZdaPv          // delete[] alloc
   *   0xba06c  movq  %rbx, (%r14)     // this->ptr = new
   *   0xba06f  testq %rbx, %rbx       // if (new != 0)
   *   0xba072  je    0xba077
   *   0xba074  incl  -0x4(%rbx)       //   ++new.refcount
   *
   * @param newHeader  the header of the buffer being adopted (or null for none).
   *                   In C++ this is the raw user-pointer `T*`; in TS we pass
   *                   the header object it aliases, so identity comparison at
   *                   0xba051 (`cmpq %rdi, %rsi`) becomes reference equality.
   */
  assign(newHeader: PCGenBlockRefHeader<TArr> | null): void {
    // 0xba051: cmpq %rdi, %rsi; je 0xba077  — pointer-identity short-circuit
    if (newHeader === this.header) return;
    // 0xba059..0xba067: release old
    if (this.header !== null) {
      this.header.refcount -= 1;
      if (this.header.refcount === 0) {
        // delete[] (alloc-8). GC handles the memory; drop the data ref.
        this.header.data = null;
      }
    }
    // 0xba06c: this->ptr = new
    this.header = newHeader;
    // 0xba06f..0xba074: if (new) ++new.refcount
    if (newHeader !== null) {
      newHeader.refcount += 1;
    }
  }
}

// --- Convenience factories that bake in `sizeof(T)` per instantiation. ------
// These correspond to the per-T ctor entries in the ProCore symbol table.
// They exist so callers (PCGenVector<float>, PCGenVector<double>, ...) can
// use the exact same class with the correct element size/typed-array kind.

/** PCGenBlockRef<float>::PCGenBlockRef(int) — @ProCore 0xba07c. */
export function newPCGenBlockRefFloat(n: number): PCGenBlockRef<Float32Array> {
  return new PCGenBlockRef<Float32Array>(
    n,
    4,
    (count) => new Float32Array(count),
  );
}

/** PCGenBlockRef<double>::PCGenBlockRef(int) — @ProCore (same shape as 0xba07c,
 *  different sizeof(T)). */
export function newPCGenBlockRefDouble(n: number): PCGenBlockRef<Float64Array> {
  return new PCGenBlockRef<Float64Array>(
    n,
    8,
    (count) => new Float64Array(count),
  );
}

/** PCGenBlockRef<int>::PCGenBlockRef(int) — @ProCore (same shape, i32 elements). */
export function newPCGenBlockRefInt(n: number): PCGenBlockRef<Int32Array> {
  return new PCGenBlockRef<Int32Array>(
    n,
    4,
    (count) => new Int32Array(count),
  );
}

/**
 * `PCGenBlockRef<char*>::PCGenBlockRef(int n)` @ProCore 0xbc820
 * (__ZN13PCGenBlockRefIPcEC2Ei).
 *
 * Ledger-claimed unit. Faithful line-for-line transcription:
 *
 *   0xbc820  pushq  %rbp                    ; prologue
 *   0xbc821  movq   %rsp, %rbp
 *   0xbc824  pushq  %r15
 *   0xbc826  pushq  %r14
 *   0xbc828  pushq  %rbx
 *   0xbc829  pushq  %rax                    ; 8-byte alignment pad
 *   0xbc82a  movq   %rdi, %rbx              ; rbx = this
 *   0xbc82d  testl  %esi, %esi              ; if (n == 0)
 *   0xbc82f  je     0xbc862                 ;   goto empty
 *   0xbc831  movl   %esi, %r15d             ; r15d = n
 *   0xbc834  shll   $0x3, %r15d             ; r15d = n << 3 = n * 8
 *                                           ;   (sizeof(char*) == 8 on
 *                                           ;    x86_64 → ×8, vs the ×4
 *                                           ;    baked into the <float>/
 *                                           ;    <int> instantiations)
 *   0xbc838  leal   0x8(,%rsi,8), %eax      ; eax = 8 + n*8  (alloc size)
 *   0xbc83f  movslq %eax, %rdi              ; rdi = sign-extend(eax)
 *   0xbc842  callq  __Znam                  ; rax = operator new[](rdi)
 *                                           ;   (stub @ProCore 0xde6c6)
 *   0xbc847  leaq   0x8(%rax), %r14         ; userPtr = alloc + 8
 *   0xbc84b  movl   %r15d, (%rax)           ; header.sizeBytes = n*8
 *   0xbc84e  movl   $0x1, 0x4(%rax)         ; header.refcount = 1
 *   0xbc855  movslq %r15d, %rsi             ; rsi = n*8 (size for bzero)
 *   0xbc858  movq   %r14, %rdi              ; rdi = userPtr
 *   0xbc85b  callq  _bzero                  ; bzero(userPtr, n*8)
 *                                           ;   (stub @ProCore 0xde79e)
 *   0xbc860  jmp    0xbc865                 ; skip empty branch
 *   0xbc862  xorl   %r14d, %r14d            ; empty branch: userPtr = 0
 *   0xbc865  movq   %r14, (%rbx)            ; this->ptr = userPtr
 *   0xbc86d..0xbc872 — epilogue.
 *
 * This body is textually identical to PCGenBlockRef<float>::PCGenBlockRef
 * @ProCore 0xba07c except for the shift constant (`$0x3` vs `$0x2`) and
 * the resulting `leal` scale (`,%rsi,8` vs `,%rsi,4`). ICF cannot fold
 * these two ctors because the shift/scale differ; each instantiation
 * has its own body. The rest — `__Znam` + header init + `_bzero` +
 * store-user-pointer — matches the generic layout modelled in this
 * file's `PCGenBlockRef` class @0x-8/-4 header and user-ptr storage.
 *
 * TypeScript model: `char*` is a 64-bit pointer on x86_64; the natural
 * typed-array analogue that both zero-fills and gives us the right
 * per-element size is `BigUint64Array` (8 bytes per element, ctor
 * returns zero-initialised — which IS the observable effect of
 * `new[] + bzero`). External clients that want string semantics can
 * either treat each element as a raw handle or maintain their own
 * side-table keyed by index; the class's own operations (assign, dtor,
 * refcount) don't dereference elements — they never touch string data
 * — so any element representation is invariant here (same reason the
 * <char*>/<float>/<double>/<int> `assign` bodies are ICF-folded).
 */
export function newPCGenBlockRefCharPtr(
  n: number,
): PCGenBlockRef<BigUint64Array> {
  // The shift @0xbc834 is $0x3 → ×8 bytes per element.  // @ProCore 0xbc834
  return new PCGenBlockRef<BigUint64Array>(
    n,
    8, // sizeof(char*) on x86_64 — cited @0xbc834 (`shll $0x3, %r15d`)
    (count) => new BigUint64Array(count),
  );
}
