// raw-port/src/infra/PCGenVector.ts
//
// FCP `PCGenVector<T>` — ProCore.framework refcounted, stride-aware vector.
// One class per file (PORTING_SPEC Rule 6). Storage is a `PCGenBlockRef<T>`
// subobject at +0x00 (see PCGenBlockRef.ts for the header/refcount layout).
//
// LAYOUT (24 bytes total, confirmed by disasm — matches the guess in
// PCLMSolver.ts's PCGenVectorFloatShape interface):
//
//   +0x00  PCGenBlockRef<T> blockRef   // 8B: sole field is a T* user-ptr
//                                       //   into the heap; header (sizeBytes,
//                                       //   refcount) lives at ptr-8 / ptr-4.
//                                       //   The subobject IS the first 8B of
//                                       //   PCGenVector — no separate slot.
//   +0x08  int32  size                 // number of ELEMENTS in the view
//   +0x0c  int32  stride               // element stride (in T's); 1 = contig.
//                                       //   Confirmed by resize @0xb814b:
//                                       //   `cmpq $0x1, %rax; jne` — chooses
//                                       //   memcpy vs strided elt-copy.
//   +0x10  T*     data                 // dereferenced backing pointer.
//                                       //   In `unique`/`resize`, this is
//                                       //   set to `blockRef.userPtr` (see
//                                       //   0xb7dac, 0xb81a4). It's stride-
//                                       //   walkable: element i lives at
//                                       //   data[i * stride].
//
// This confirms and refines the guess in PCLMSolver.ts's layout comment:
//   +0x00 char** blockRef  (24B)  — YES, but blockRef occupies +0x00..+0x07.
//   +0x08 u32 size                — YES.
//   +0x0c u32 strideFlag          — semantically a STRIDE, not a bool flag
//                                    (=1 for contiguous, 0 for empty, and
//                                    >=1 for sub-vector views).
//   +0x10 T* data                 — YES, dereferenced backing ptr.
//
// DECODE (all ProCore):
//   raw-port/re/disasm/ProCore.PCGenVector<float>.PCGenVector.s       @0xba362  ctor(int, float)
//   raw-port/re/disasm/ProCore.PCGenVector<float>.~PCGenVector.s      @0xb6c4a  dtor
//     (ICF-folded with PCGenBlockRef<float>::~PCGenBlockRef — the vector
//      dtor's only work is destroying its BlockRef subobject; the trailing
//      16 bytes at +0x8..+0x18 are POD: size, stride, data.)
//   raw-port/re/disasm/ProCore.PCGenVector<float>.operator().s        @0xb7e3e  op()(int)
//   raw-port/re/disasm/ProCore.PCGenVector<float>.unique.s            @0xb7d6c  unique()
//   raw-port/re/disasm/ProCore.PCGenVector<float>.resize.s            @0xb80fc  resize(int)
//   raw-port/re/disasm/ProCore.PCGenVector<float>.set.s               @0xb7efc  set<T>(const&)
//
// SYMBOLS (all ProCore, from /tmp/ProCore_demangled.txt):
//   __ZN11PCGenVectorIfEC2Eif                 PCGenVector<float>::PCGenVector(int, float)  @0xba362
//   __ZN11PCGenVectorIfED1Ev                  PCGenVector<float>::~PCGenVector()           @0xb6c4a (ICF)
//   __ZN11PCGenVectorIfEclEi                  PCGenVector<float>::operator()(int)          @0xb7e3e
//   __ZNK11PCGenVectorIfEclEi                 PCGenVector<float>::operator()(int) const    (same body)
//   __ZN11PCGenVectorIfE6uniqueEv             PCGenVector<float>::unique()                 @0xb7d6c
//   __ZN11PCGenVectorIfE6resizeEi             PCGenVector<float>::resize(int)              @0xb80fc
//   __ZN11PCGenVectorIfE3setIfEERS0_RKS_IT_E  PCGenVector<float>::set<float>(const&)       @0xb7efc
//
// FRONTIER: the operator() / ctor / resize out-of-range and negative-length
// paths call PCString::ssprintf, PCException::PCException, and throw
// PCMatrixErrorException — those classes are on the port ledger and get
// throwing stubs here per PORTING_SPEC Rule 3.
//
// This port covers PCGenVector<float> because it's the instantiation used by
// PCLMSolver / PCMatchmoveProblem / PCMatchmove. The <double>/<int> vectors
// would use the same class shape with a Float64Array/Int32Array element type;
// they are not blocked by this pass and can reuse the class trivially.

import {
  PCGenBlockRef,
  newPCGenBlockRefFloat,
  type PCGenBlockRefHeader,
} from "./PCGenBlockRef.js";

// -----------------------------------------------------------------------------
// Frontier callees (undecoded — throw per PORTING_SPEC Rule 3)
// -----------------------------------------------------------------------------

/**
 * `PCString::ssprintf(char const*, ...)` — used by ctor @0xba3d9 and by
 * operator()(int) @0xb7e99 to format an error message. Not on this port's
 * decode path.
 */
function pcstring_ssprintf(_fmt: string, ..._args: unknown[]): never {
  throw new Error(
    "PCString::ssprintf @ProCore __ZN8PCString8ssprintfEPKcz — not yet transcribed (@0xba3d9/@0xb7e99)",
  );
}

/**
 * Throw a `PCMatrixErrorException` after formatting the message with ssprintf,
 * exactly as the disasm does at:
 *   @0xba3bc..@0xba405 (ctor negative-length path)
 *   @0xb7e76..@0xb7ec5 (operator() out-of-range path)
 *
 * The full exception construction chain — __cxa_allocate_exception (0xde6de),
 * PCString::ssprintf, PCException::PCException, vtable install, __cxa_throw
 * (0xde71a) — is on the frontier. This helper stubs the whole chain but
 * still throws (matching the observable "noreturn" effect at the entry).
 */
function throw_PCMatrixErrorException(msg: string): never {
  // Chain @ProCore 0xba3bc / 0xba3c1 / 0xba3d9 / 0xba3e5 / 0xba3f4 / 0xba405
  //   and  @ProCore 0xb7e76 / 0xb7e7b / 0xb7e99 / 0xb7ea5 / 0xb7eb4 / 0xb7ec5
  // is not yet transcribed. Throw a plain Error so the pipeline surfaces the
  // exact site rather than silently returning a bad value.
  const err = new Error(
    `PCMatrixErrorException @ProCore (__cxa_throw @0xde71a) — not yet transcribed: ${msg}`,
  );
  (err as { name: string }).name = "PCMatrixErrorException";
  throw err;
}

// -----------------------------------------------------------------------------
// PCGenVector<float>
// -----------------------------------------------------------------------------

/**
 * ProCore's refcounted stride-aware float vector. Ports the exact 24-byte
 * layout FCP uses; every operation below is transcribed line-for-line from
 * the corresponding disasm.
 *
 * @ProCore  class defined by ctor @0xba362 and dtor @0xb6c4a.
 */
export class PCGenVector {
  /** +0x00 (8B): the PCGenBlockRef subobject. Its `header` field IS the
   *  8-byte "T* userPtr" slot in C++ — pointer identity semantics are
   *  preserved because `assign` compares by identity.
   *  Ctor @0xba37a: `callq PCGenBlockRef<float>::PCGenBlockRef(int)`. */
  blockRef_at_0x00: PCGenBlockRef<Float32Array> = newPCGenBlockRefFloat(0);

  /** +0x08 (4B): element count. Ctor @0xba37f: `movl %r15d, 0x8(%rbx)`. */
  size_at_0x08: number = 0;

  /** +0x0c (4B): element stride (in T's). Ctor @0xba383: `movl $0x1, 0xc(%rbx)`.
   *  Confirmed as a stride (not a bool) by resize @0xb814b: `cmpq $0x1, %rax;
   *  jne 0xb8167` — stride==1 fast-paths memcpy; else does elementwise copy
   *  with `addq %rax_shifted_by_2, %rsi` per element (@0xb8190). */
  stride_at_0x0c: number = 1;

  /** +0x10 (8B): backing data pointer. Ctor @0xba38f: `movq (%rbx), %rax;
   *  movq %rax, 0x10(%rbx)` — reads blockRef.userPtr and copies it into +0x10.
   *  Element i is at `data[i * stride]`. */
  data_at_0x10: Float32Array | null = null;

  /**
   * `PCGenVector<float>::PCGenVector(int n, float fillValue)` @ProCore 0xba362.
   *
   * Line-for-line:
   *   0xba37a  callq PCGenBlockRef<float>::PCGenBlockRef(int)  // ctor sub-obj
   *   0xba37f  movl  %r15d, 0x8(%rbx)                          // size = n
   *   0xba383  movl  $0x1, 0xc(%rbx)                           // stride = 1
   *   0xba38a  testl %r15d, %r15d
   *   0xba38d  js    0xba3bc                                   // if (n<0) throw
   *   0xba38f  movq  (%rbx), %rax
   *   0xba392  movq  %rax, 0x10(%rbx)                          // data = blockRef.userPtr
   *   0xba396  movss -0x24(%rbp), %xmm0                        // xmm0 = fillValue
   *   0xba39b  je    0xba3b1                                   // if (n==0) done
   *   0xba39d  incl  %r15d
   *   0xba3a0  movss %xmm0, (%rax)                             // *p = fillValue
   *   0xba3a4  addq  $0x4, %rax                                // p += 1
   *   0xba3a8  decl  %r15d
   *   0xba3ab  cmpl  $0x1, %r15d
   *   0xba3af  ja    0xba3a0
   *
   * The negative-length exception path @0xba3bc..@0xba405 throws
   * `PCMatrixErrorException("PCGenVector length %d must be nonnegative")`
   * (literal @0xba3c9). We faithfully reproduce the throw.
   */
  constructor(n: number, fillValue: number) {
    // 0xba37a: BlockRef sub-object ctor (already runs on field init above,
    // but n may differ). Replace the empty default with the sized one.
    this.blockRef_at_0x00 = newPCGenBlockRefFloat(Math.max(n, 0));
    // 0xba37f/0xba383: size & stride
    this.size_at_0x08 = n;
    this.stride_at_0x0c = 1;
    // 0xba38a/0xba38d: negative length check
    if (n < 0) {
      throw_PCMatrixErrorException(
        // Format string literal @ProCore 0xba3c9 verbatim:
        `PCGenVector length ${n} must be nonnegative`,
      );
    }
    // 0xba38f/0xba392: data = blockRef.userPtr
    const hdr = this.blockRef_at_0x00.header;
    this.data_at_0x10 = hdr === null ? null : hdr.data;
    // 0xba396..0xba3af: fill the buffer with fillValue.
    // Match cvtss2ss-style single-precision truncation: FCP wrote `movss
    // %xmm0, (%rax)` — a 32-bit store — so we round fillValue to f32.
    if (n > 0 && this.data_at_0x10 !== null) {
      const v = Math.fround(fillValue);
      this.data_at_0x10.fill(v);
    }
  }

  /**
   * `PCGenVector<float>::~PCGenVector()` @ProCore 0xb6c4a.
   *
   * ICF-folded with `PCGenBlockRef<float>::~PCGenBlockRef` — the vector
   * dtor's only work is destroying its BlockRef subobject at +0x00. The
   * trailing 16 bytes (size / stride / data) are POD.
   */
  dispose(): void {
    // 0xb6c4a: destroy the BlockRef sub-object.
    this.blockRef_at_0x00.dispose();
    // POD tail — no further work per the ICF fold with ~PCGenBlockRef.
    this.data_at_0x10 = null;
    this.size_at_0x08 = 0;
    this.stride_at_0x0c = 0;
  }

  /**
   * `PCGenVector<float>::operator()(int i)` @ProCore 0xb7e3e.
   * Also the entry point for the `const` overload (same body).
   *
   * Line-for-line:
   *   0xb7e4e  testl %esi, %esi
   *   0xb7e50  js    0xb7e76                    // if (i < 0) throw
   *   0xb7e52  cmpl  0x8(%r15), %r14d
   *   0xb7e56  jge   0xb7e76                    // if (i >= size) throw
   *   0xb7e58  movslq 0xc(%r15), %rcx           // rcx = stride
   *   0xb7e5c  movslq %r14d, %rax               // rax = i
   *   0xb7e5f  imulq %rcx, %rax                 // rax = i * stride
   *   0xb7e63  shlq  $0x2, %rax                 // rax *= 4  (byte offset)
   *   0xb7e67  addq  0x10(%r15), %rax           // rax = &data[i*stride]
   *   0xb7e6b  ...                              // return pointer
   *
   * NOTE: FCP returns a `float&` — a pointer/reference into the buffer. In
   * TS we return the VALUE (the more useful operation) via a companion
   * `set(i, v)` for the write side. This is faithful to the observable
   * effect: consumers dereference the returned pointer as `*p` for read
   * or `*p = v` for write, and we expose both operations directly.
   *
   * Out-of-range: throws `PCMatrixErrorException("PCGenVector index %d out
   * of range %d")` (literal @0xb7e89). We reproduce the throw.
   */
  at(i: number): number {
    // 0xb7e4e..0xb7e56: range check
    if (i < 0 || i >= this.size_at_0x08) {
      throw_PCMatrixErrorException(
        // Format string literal @ProCore 0xb7e89 verbatim:
        `PCGenVector index ${i} out of range ${this.size_at_0x08 - 1}`,
      );
    }
    if (this.data_at_0x10 === null) {
      throw_PCMatrixErrorException(
        `PCGenVector index ${i} out of range ${this.size_at_0x08 - 1}`,
      );
    }
    // 0xb7e58..0xb7e67: return data[i * stride].
    // Match `movss` (32-bit load) via Math.fround — Float32Array already
    // stores f32 exactly, but this makes the read parity explicit.
    return Math.fround(this.data_at_0x10[i * this.stride_at_0x0c]);
  }

  /**
   * Companion write for operator() — FCP callers do `vec(i) = v` which
   * decompiles to a store through the returned reference. We expose that
   * as a separate method so callers can express both read and write
   * paths without a TS-level reference type.
   *
   * The range-check + address-compute are identical to `at()` @0xb7e3e
   * (see the disasm cite above).
   */
  set(i: number, v: number): void {
    if (i < 0 || i >= this.size_at_0x08) {
      throw_PCMatrixErrorException(
        `PCGenVector index ${i} out of range ${this.size_at_0x08 - 1}`,
      );
    }
    if (this.data_at_0x10 === null) {
      throw_PCMatrixErrorException(
        `PCGenVector index ${i} out of range ${this.size_at_0x08 - 1}`,
      );
    }
    // Match `movss %xmm0, (%rax)` (32-bit store) — Math.fround to be explicit.
    this.data_at_0x10[i * this.stride_at_0x0c] = Math.fround(v);
  }

  /**
   * `PCGenVector<float>::unique()` @ProCore 0xb7d6c — COW-detach.
   *
   * If the underlying block-ref is currently shared (refcount > 1), allocate
   * a private copy of the elements so subsequent writes don't affect other
   * views. If we already own the buffer alone (refcount == 1), no-op.
   *
   * Line-for-line:
   *   0xb7d7c  movq  (%rdi), %rax               // rax = this->blockRef.ptr
   *   0xb7d7f  testq %rax, %rax
   *   0xb7d82  je    0xb7d8a                    // if (ptr == null) go
   *                                             //   allocate anyway (empty)
   *   0xb7d84  cmpl  $0x1, -0x4(%rax)           // if (refcount == 1)
   *   0xb7d88  je    0xb7df3                    //   return early (already unique)
   *   0xb7d8a  movl  0x8(%rbx), %r15d           // r15 = this->size
   *   0xb7d8e  leaq  -0x30(%rbp), %r14          // r14 = &tmpVector on stack
   *   0xb7d92  movq  %r14, %rdi
   *   0xb7d95  movl  %r15d, %esi
   *   0xb7d98  callq PCGenBlockRef<float>::PCGenBlockRef(int)   // alloc fresh
   *   0xb7d9d  movl  %r15d, 0x8(%r14)           // tmp.size = size
   *   0xb7da1  movl  $0x1, 0xc(%r14)            // tmp.stride = 1
   *   0xb7da9  movq  (%r14), %rax
   *   0xb7dac  movq  %rax, 0x10(%r14)           // tmp.data = tmp.blockRef.ptr
   *   0xb7db0..0xb7db6  callq set<float>(*this) // copy elements this -> tmp
   *   0xb7dbb  cmpq  %rbx, %r14
   *   0xb7dbe  je    0xb7ddc                    // (self-check; never true here)
   *   0xb7dc0  movq  -0x28(%rbp), %rax
   *   0xb7dc4  movq  %rax, 0x8(%rbx)            // this.size = tmp.size
   *   0xb7dc8  movq  -0x30(%rbp), %rsi          // rsi = tmp.blockRef.ptr
   *   0xb7dcf  callq PCGenBlockRef<char*>::assign(char**)      // adopt tmp's block
   *   0xb7dd4  movq  -0x20(%rbp), %rax          // rax = tmp.data
   *   0xb7dd8  movq  %rax, 0x10(%rbx)           // this.data = tmp.data
   *   0xb7ddc..0xb7dee  destroy tmp's local BlockRef (decref)
   *
   * The `set<float>` call at 0xb7db6 is the same routine as our set-from
   * copy below; we inline the equivalent effect (a straight elementwise
   * copy honoring stride on the SOURCE side) directly, since after the
   * fresh alloc the destination is stride==1.
   */
  unique(): void {
    // 0xb7d7c/0xb7d7f: read blockRef.ptr; test null.
    const oldHeader = this.blockRef_at_0x00.header;
    // 0xb7d84/0xb7d88: if refcount == 1, we already own it — nothing to do.
    if (oldHeader !== null && oldHeader.refcount === 1) return;

    // 0xb7d8a..0xb7d98: allocate a fresh BlockRef of size = this.size.
    const n = this.size_at_0x08;
    const tmpBlock = newPCGenBlockRefFloat(n);
    const tmpHeader = tmpBlock.header;
    // 0xb7d9d/0xb7da1: tmp.size = size, tmp.stride = 1 (implicit — this is
    // a fresh contiguous buffer). No separate storage; captured in the copy.
    // 0xb7da9/0xb7dac: tmp.data = tmp.blockRef.ptr.
    const tmpData = tmpHeader === null ? null : tmpHeader.data;

    // 0xb7db0..0xb7db6: `set<float>(*this)` — copy elements from `this` into
    // tmp. The set<float> body @0xb7efc, for the stride-aware copy path,
    // walks the SOURCE with `stride_a` bytes and writes to a stride-1 dst
    // (@0xb7fbc..@0xb7fe5). We replicate that here.
    if (n > 0 && tmpData !== null && this.data_at_0x10 !== null) {
      const src = this.data_at_0x10;
      const s = this.stride_at_0x0c;
      for (let i = 0; i < n; i++) {
        // Math.fround to mirror `movss` (32-bit) load/store.
        tmpData[i] = Math.fround(src[i * s]);
      }
    }

    // 0xb7dc0/0xb7dc4: this.size = tmp.size  (unchanged: same n)
    this.size_at_0x08 = n;
    // 0xb7dc8/0xb7dcf: blockRef.assign(tmp.blockRef.ptr) — adopt the fresh
    // buffer, releasing our old reference (which had refcount > 1, so the
    // decrement doesn't free it; other viewers keep it).
    this.blockRef_at_0x00.assign(tmpHeader);
    // 0xb7dd4/0xb7dd8: this.data = tmp.data (now points at the new buffer).
    this.data_at_0x10 = tmpData;
    // Stride resets to 1 — the ctor at 0xb7da1 wrote 1 into the tmp's stride
    // slot, and after the assign we effectively inherit that shape. C++
    // doesn't explicitly copy tmp.stride back into this.stride here
    // (the assign body is ICF'd for POD ptr swap), but note the C++ layout
    // treats `this` as adopting tmp's storage-and-shape (@0xb7dcf..@0xb7dd8);
    // any subsequent operator() reads use the stride field. We record the
    // new stride explicitly to keep the pointer/stride/data trio consistent
    // with the fresh contiguous alloc.
    this.stride_at_0x0c = 1;
    // 0xb7ddc..0xb7dee: destroy tmp's local BlockRef handle. In C++ this
    // decrements the refcount (which after the successful `assign` above is
    // 2, so the decrement leaves it at 1 — perfect: `this` is now sole
    // owner). We call tmpBlock.dispose() to model the same effect.
    tmpBlock.dispose();
  }

  /**
   * `PCGenVector<float>::resize(int newSize)` @ProCore 0xb80fc.
   *
   * Allocates a fresh block of `newSize` floats (zero-initialised), copies
   * min(oldSize, newSize) elements from the current view honoring stride,
   * and adopts the new block. Size becomes newSize, stride becomes 1.
   *
   * Line-for-line highlights:
   *   0xb810b  cmpl  %esi, 0x8(%rdi)             // if (this->size == newSize)
   *   0xb810e  je    0xb81ca                     //   return
   *   0xb811e  callq PCGenBlockRef<float>::PCGenBlockRef(int)  // tmp alloc
   *   0xb8126  movl  0x8(%rbx), %r12d            // r12 = oldSize
   *   0xb812a  cmpl  %r12d, %r14d
   *   0xb812d  cmovll %r14d, %r12d               // r12 = min(oldSize, newSize)
   *   0xb8131  movq  (%r15), %r15                // r15 = tmp.blockRef.userPtr
   *   0xb8134  movslq %r14d, %rsi
   *   0xb8137  shlq  $0x2, %rsi                  // rsi = newSize*4 bytes
   *   0xb813e  callq _bzero                      // bzero(tmp.data, newSize*4)
   *                                              //   NOTE: JS typed-array is
   *                                              //   already zeroed after alloc,
   *                                              //   so this is redundant here.
   *   0xb8143  movslq 0xc(%rbx), %rax            // rax = oldStride
   *   0xb8147  movq  0x10(%rbx), %rsi            // rsi = oldData
   *   0xb814b  cmpq  $0x1, %rax
   *   0xb814f  jne   0xb8167                     // if (stride != 1) go stride-copy
   *   0xb8151  testq %rsi, %rsi
   *   0xb8154  je    0xb8198                     // if (oldData == 0) skip
   *   0xb8156  movslq %r12d, %rdx
   *   0xb8159  shlq  $0x2, %rdx                  // rdx = min*4
   *   0xb815d  movq  %r15, %rdi
   *   0xb8160  callq _memcpy                     // memcpy(tmp.data, oldData, min*4)
   *   0xb8167  testq %rsi, %rsi                  // stride-copy path
   *   0xb816a  setne %cl
   *   0xb816d  testl %r12d, %r12d
   *   0xb8170  setg  %dl
   *   0xb8173  andb  %cl, %dl
   *   0xb8175  cmpb  $0x1, %dl
   *   0xb8178  jne   0xb8198                     // skip if empty
   *   0xb817a..0xb8196  loop:
   *      movss (%rsi), %xmm0
   *      movss %xmm0, (%r15,%rdx,4)
   *      addq  %rax_stride*4, %rsi              // src += stride*4 bytes
   *   0xb8198  callq PCGenBlockRef<char*>::assign(char**)   // adopt tmp
   *   0xb81a4  movq  %r15, 0x10(%rbx)            // this.data = tmp.data
   *   0xb81a8  movl  %r14d, 0x8(%rbx)            // this.size = newSize
   *   0xb81ac  movl  $0x1, 0xc(%rbx)             // this.stride = 1
   *   0xb81b3..0xb81c5  destroy tmp's BlockRef
   */
  resize(newSize: number): void {
    // 0xb810b/0xb810e: fast-return if size already matches.
    if (this.size_at_0x08 === newSize) return;

    // 0xb811e: allocate fresh block.
    const tmpBlock = newPCGenBlockRefFloat(newSize);
    const tmpHeader = tmpBlock.header;
    const tmpData = tmpHeader === null ? null : tmpHeader.data;

    // 0xb8126..0xb812d: r12 = min(oldSize, newSize)
    const copyN = Math.min(this.size_at_0x08, newSize);

    // 0xb813e: bzero(tmp.data, newSize*4) — Float32Array is already zeroed.

    // 0xb8143..0xb814f: dispatch on stride
    const oldStride = this.stride_at_0x0c;
    const oldData = this.data_at_0x10;
    if (oldStride === 1) {
      // 0xb8151..0xb8160: memcpy fast path
      if (oldData !== null && tmpData !== null && copyN > 0) {
        // typed-array `set` with a subarray is the observable equivalent of
        // memcpy for non-overlapping regions (tmp is freshly allocated so
        // it never overlaps oldData).
        tmpData.set(oldData.subarray(0, copyN), 0);
      }
    } else {
      // 0xb8167..0xb8196: stride-aware elementwise copy.
      if (oldData !== null && tmpData !== null && copyN > 0) {
        for (let i = 0; i < copyN; i++) {
          tmpData[i] = Math.fround(oldData[i * oldStride]);
        }
      }
    }

    // 0xb8198: assign(tmp.blockRef.ptr) — adopt fresh block; release old.
    this.blockRef_at_0x00.assign(tmpHeader);
    // 0xb81a4/0xb81a8/0xb81ac: update data / size / stride.
    this.data_at_0x10 = tmpData;
    this.size_at_0x08 = newSize;
    this.stride_at_0x0c = 1;
    // 0xb81b3..0xb81c5: destroy tmp's local BlockRef handle.
    tmpBlock.dispose();
  }

  /**
   * `PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float>
   * const&)` @ProCore 0xb7efc.
   *
   * Copies elements from `other` into `this`, respecting BOTH sides' strides.
   * If sizes differ, throws `PCMatrixErrorException` (@0xb7ff7 — the ctor'd
   * exception message would say "vector size mismatch" or similar; the exact
   * literal is fetched inside the throw chain, which is on the frontier).
   *
   * Line-for-line:
   *   0xb7f0e  cmpq  %rdi, %rsi
   *   0xb7f11  je    0xb7fe7                     // this === other -> no-op
   *   0xb7f1a  movl  0x8(%rbx), %r14d            // r14 = this.size
   *   0xb7f1e  cmpl  0x8(%rsi), %r14d
   *   0xb7f22  jne   0xb7ff7                     // size mismatch -> throw
   *   0xb7f28  movq  (%rbx), %rax
   *   0xb7f2e  je    0xb7fb7                     // if (this.blockRef.ptr == 0)
   *                                              //   go raw-copy path
   *   0xb7f34  cmpq  %rax, (%r15)
   *   0xb7f37  jne   0xb7fb7                     // if blockRefs differ, raw-copy
   *   0xb7f39..0xb7fb5  ALIASED case: allocate a fresh contiguous block,
   *                                   recurse `set<float>(*this)` into it,
   *                                   then straight-copy the resulting
   *                                   temp into this.
   *   0xb7fb7..0xb7fe5  DISJOINT case: stride-aware elementwise copy from
   *                                    other.data (stride %r15.stride) into
   *                                    this.data (stride %rbx.stride).
   *
   * The aliased case handles `a.set(a)` — a no-op semantically but must still
   * respect the copy semantics if strides differ. Since @0xb7f0e we already
   * return early on strict pointer equality, the "same blockRef but different
   * view" case is when the two vectors share storage but view it with
   * different strides/offsets. In that case FCP double-copies via a temp.
   *
   * For the port, we replicate: if pointers alias, allocate temp, copy self
   * elementwise into temp (respecting THIS's stride), then copy temp back into
   * self (contiguous). If disjoint, do the direct stride-aware copy.
   */
  copyFrom(other: PCGenVector): PCGenVector {
    // 0xb7f0e/0xb7f11: self-assignment short-circuit
    if (other === this) return this;
    // 0xb7f1a..0xb7f22: size check
    const n = this.size_at_0x08;
    if (n !== other.size_at_0x08) {
      throw_PCMatrixErrorException(
        `PCGenVector::set size mismatch: ${n} vs ${other.size_at_0x08}`,
      );
    }
    if (n === 0) return this;
    // 0xb7f28..0xb7f37: alias check.
    const thisHdr = this.blockRef_at_0x00.header;
    const otherHdr = other.blockRef_at_0x00.header;
    const aliased = thisHdr !== null && thisHdr === otherHdr;

    if (aliased) {
      // 0xb7f39..0xb7fb5: aliased path — go via a fresh contiguous temp.
      const tmp = newPCGenBlockRefFloat(n);
      const tmpData = tmp.header === null ? null : tmp.header.data;
      // First loop @0xb7f83..0xb7f9c: copy `this` elements into tmp
      // walking source with stride, dst contiguous.
      if (tmpData !== null && this.data_at_0x10 !== null) {
        const src = this.data_at_0x10;
        const s = this.stride_at_0x0c;
        for (let i = 0; i < n; i++) {
          tmpData[i] = Math.fround(src[i * s]);
        }
      }
      // Then copy tmp back into `this` (contiguous dst, stride-1 src == tmp).
      if (tmpData !== null && this.data_at_0x10 !== null) {
        const dst = this.data_at_0x10;
        const s = this.stride_at_0x0c;
        for (let i = 0; i < n; i++) {
          dst[i * s] = Math.fround(tmpData[i]);
        }
      }
      tmp.dispose();
      return this;
    }

    // 0xb7fb7..0xb7fe5: disjoint path — direct stride-aware copy.
    //   src = other.data + i*other.stride
    //   dst = this.data  + i*this.stride
    if (this.data_at_0x10 !== null && other.data_at_0x10 !== null) {
      const src = other.data_at_0x10;
      const dst = this.data_at_0x10;
      const ss = other.stride_at_0x0c;
      const ds = this.stride_at_0x0c;
      for (let i = 0; i < n; i++) {
        // movss loads then stores 32-bit — Math.fround for parity.
        dst[i * ds] = Math.fround(src[i * ss]);
      }
    }
    return this;
  }
}

// -----------------------------------------------------------------------------
// Interop shim for the layout-comment `PCGenVectorFloatShape` interface
// declared in PCLMSolver.ts. That interface was written before this class
// existed; a caller with a PCGenVector can produce the shape via `asShape()`.
// -----------------------------------------------------------------------------

export interface PCGenVectorFloatShapeCompat {
  blockRef_at_0x00: PCGenBlockRefHeader<Float32Array> | null;
  size_at_0x08: number;
  strideFlag_at_0x0c: number;
  data_at_0x10: Float32Array | null;
}

/**
 * Produce the `PCGenVectorFloatShape` view used by PCLMSolver.ts. The
 * `strideFlag_at_0x0c` field is our `stride_at_0x0c` — semantically a stride
 * (confirmed by resize @0xb814b), so the two names refer to the same 4 bytes
 * at struct offset +0x0c.
 */
export function pcGenVectorAsShape(
  v: PCGenVector,
): PCGenVectorFloatShapeCompat {
  return {
    blockRef_at_0x00: v.blockRef_at_0x00.header,
    size_at_0x08: v.size_at_0x08,
    strideFlag_at_0x0c: v.stride_at_0x0c,
    data_at_0x10: v.data_at_0x10,
  };
}
