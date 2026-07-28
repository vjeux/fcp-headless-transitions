// PCArray_base — ProCore.framework. The non-templated base of PCArray<T>. Two
// exported members transcribed here:
//   @ProCore 0xc4bd6  PCArray_base::gnomesortImpl(void*, int, int, int (*)(void const*, void const*))
//   @ProCore 0xc4cd0  PCArray_base::badIndex()
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.PCArray_base.gnomesortImpl.s
//   raw-port/re/disasm/ProCore.PCArray_base.badIndex.s
//
// ProCore stubs / symbols referenced (all resolved by nm on ProCore):
//   0xde6c6   __Znam                  operator new[](unsigned long)
//   0xde6ba   __ZdaPv                 operator delete[](void*)
//   0xde6c0   __ZdlPv                 operator delete(void*)   (used in the exception dtor)
//   0xde6de   ___cxa_allocate_exception
//   0xde71a   ___cxa_throw
//   0xde6fc   ___cxa_free_exception   (unwind cleanup — not on the linear path)
//   0xde50a   __Unwind_Resume         (unwind — not on the linear path)
//   0xde960   _memcpy
//   PCString::PCString(char const*)                     @ProCore 0xc4cf3
//   PCString::~PCString()                                @ProCore 0xc4d2d/0xc4d3b (unwind)
//   PCException::PCException(PCString const&)            @ProCore 0xc4cff
//   __ZTI19PCBadIndexException                           typeinfo (data symbol)
//   __ZN19PCBadIndexExceptionD1Ev                        dtor slot (data ptr, see below)
//   __ZTVN19PCBadIndexException...                       vtable (leaq at 0xc4d04, base 0x87bc5)
//
// Frontier callees: all of the above are undecoded in this pass — they belong
// to PCException/PCString/PCBadIndexException, which are separate classes on
// the port ledger. Per PORTING_SPEC Rule 3 they throw citing @0xADDR.

// ─── Frontier callees (undecoded — throw per Rule 3) ──────────────────────────────────

/**
 * operator new[](unsigned long) — heap allocation for a byte buffer.
 *   gnomesortImpl @ProCore 0xc4c48  callq 0xde6c6
 * Returns a raw byte pointer of the requested size.
 */
function operator_new_array(sizeBytes: number): Uint8Array {
  // Faithful to the ABI: __Znam(size) returns an uninitialised buffer. We
  // model it as a zero-initialised Uint8Array (JS has no uninitialised typed
  // arrays); the gnomesort logic writes every byte before reading it (memcpy),
  // so the initial contents are unobserved.
  return new Uint8Array(sizeBytes);
}

/**
 * operator delete[](void*) — free the temporary swap buffer.
 *   gnomesortImpl @ProCore 0xc4cbc  jmp 0xde6ba  (tail-call)
 * No-op in a GC runtime.
 */
function operator_delete_array(_buf: Uint8Array | null): void {
  // No-op; kept for the citation.
}

/**
 * memcpy(dst, src, n) — copy n bytes from src to dst. All three gnomesort swap
 * legs go through it:
 *   0xc4c60  callq _memcpy  (dst=tmp,  src=a[k-1], n=size)
 *   0xc4c6e  callq _memcpy  (dst=a[k], src=a[k-1], n=size)
 *   0xc4c7f  callq _memcpy  (dst=a[k-1], src=tmp, n=size)
 */
function memcpy_bytes(dst: Uint8Array, dstOff: number, src: Uint8Array, srcOff: number, n: number): void {
  // Uint8Array#set does the right thing; it faithfully models memcpy for
  // non-overlapping regions (which the three call-sites guarantee: tmp is a
  // separately allocated buffer, and a[k-1] vs a[k] never overlap for size>=1).
  dst.set(src.subarray(srcOff, srcOff + n), dstOff);
}

/**
 * PCArray_base::badIndex() body's exception-machinery symbols. None of them are
 * decoded in this pass; a single throwing stub is a faithful model of the
 * observable effect (control never returns from badIndex).
 *   @ProCore 0xc4cd0  entry
 *   @ProCore 0xc4ce0  callq ___cxa_allocate_exception
 *   @ProCore 0xc4cf3  callq PCString::PCString(char const*)  with "PCArray::operator[]"
 *   @ProCore 0xc4cff  callq PCException::PCException(PCString const&)
 *   @ProCore 0xc4d0b  set (*ex) = &PCBadIndexException_vtable + 0x10
 *   @ProCore 0xc4d1f  callq ___cxa_throw(ex, typeinfo, dtor)   [noreturn]
 */
function cxa_throw_PCBadIndexException(): never {
  // Chain @ProCore 0xc4cd0 (entry) / 0xc4ce0 / 0xc4cf3 / 0xc4cff / 0xc4d1f
  throw new Error(
    "PCArray_base::badIndex() @ProCore 0xc4cd0 — exception chain not yet transcribed " +
    "(0xc4ce0 ___cxa_allocate_exception, 0xc4cf3 PCString ctor with \"PCArray::operator[]\", " +
    "0xc4cff PCException::PCException, 0xc4d1f ___cxa_throw)"
  );
}

// ─── The exported statics ─────────────────────────────────────────────────────────────

/**
 * PCArray_base — namespace/holder class. The two members below are static in
 * PCArray_base's TU (no this pointer is loaded in either body — gnomesortImpl
 * takes no `this` register, badIndex has an unread `%rdi`).
 */
export class PCArray_base {
  /**
   * PCArray_base::gnomesortImpl(base, n, size, cmp)
   * @ProCore 0xc4bd6 (raw-port/re/disasm/ProCore.PCArray_base.gnomesortImpl.s)
   *
   * A gnome-sort of `n` elements, each `size` bytes wide, starting at `base`,
   * ordered by the C-style comparator `cmp(void const*, void const*) -> int`.
   * Element swaps go through a lazily-allocated `size`-byte scratch buffer
   * (three memcpys). Storage is released at exit via operator delete[].
   *
   * Registers (linear path only — the func-start alignment stubs at 0xc4bd3-5
   * belong to the preceding fn, not this one; entry is at 0xc4bd6):
   *   %rdi = base       -> stored at [rbp-0x48]                              @0xc4beb
   *   %esi = n          -> stored at [rbp-0x30]                              @0xc4bef
   *   %edx = size       -> stored at [rbp-0x2c] and sign-extended into rax  @0xc4bfb..
   *                        [rbp-0x40] = movslq size  (size as int64 for allocation)
   *   %rcx = cmp        -> stored at [rbp-0x50]                              @0xc4be7
   *   %r12d = k         (loop index; starts at 1)                           @0xc4c02
   *   %rbx = tmpbuf     (nullable temp scratch; 0 until first swap needs it) @0xc4c08
   *
   * Line-for-line:
   *   0xc4bd6  push rbp; mov rbp, rsp; push r15/r14/r13/r12/rbx; sub rsp, 0x28
   *   0xc4be7  mov  [rbp-0x50], rcx           ## save cmp
   *   0xc4beb  mov  [rbp-0x48], rdi           ## save base
   *   0xc4bef  mov  [rbp-0x30], esi           ## save n
   *   0xc4bf2  cmp  esi, 2
   *   0xc4bf5  jl   0xc4cc1                   ## if n < 2, skip everything (exit)
   *   0xc4bfb  movslq edx, rax                ## rax = (int64)size
   *   0xc4bfe  mov  [rbp-0x40], rax           ## save sizeQ (for allocation + memcpy len)
   *   0xc4c02  mov  r12d, 1                   ## k = 1
   *   0xc4c08  xor  ebx, ebx                  ## tmpbuf = NULL
   *   0xc4c0a  mov  [rbp-0x2c], edx           ## save size (32-bit)
   *   ── LOOP HEAD @0xc4c0d ──
   *   0xc4c0d  lea  r13d, [r12-1]             ## km1 = k-1
   *   0xc4c12  mov  eax, r13d
   *   0xc4c15  imul eax, edx                  ## eax = km1 * size
   *   0xc4c18  movslq eax, r15                ## r15 = sign-ext(eax)
   *   0xc4c1b  mov  rcx, [rbp-0x48]           ## rcx = base
   *   0xc4c1f  add  r15, rcx                  ## r15 = &base[km1*size] (byte ptr)
   *   0xc4c22  mov  eax, r12d
   *   0xc4c25  imul eax, edx                  ## eax = k * size
   *   0xc4c28  movslq eax, r14
   *   0xc4c2b  add  r14, rcx                  ## r14 = &base[k*size] (byte ptr)
   *   0xc4c2e  mov  rdi, r15                  ## cmp arg1 = &base[km1*size]
   *   0xc4c31  mov  rsi, r14                  ## cmp arg2 = &base[k*size]
   *   0xc4c34  call [rbp-0x50]                ## v = cmp(a[k-1], a[k])
   *   0xc4c37  test eax, eax
   *   0xc4c39  jle  0xc4c96                   ## if v <= 0 (in order), no swap: fall through
   *   ── SWAP path @0xc4c3b ──
   *   0xc4c3b  mov  [rbp-0x34], r13d          ## stash km1 for the "k -= 1" case
   *   0xc4c3f  test rbx, rbx
   *   0xc4c42  jne  0xc4c50                   ## if tmpbuf already allocated, skip alloc
   *   0xc4c44  mov  rdi, [rbp-0x40]           ## alloc size = sizeQ
   *   0xc4c48  call __Znam                    ## tmpbuf = operator new[](size)
   *   0xc4c4d  mov  rbx, rax
   *   ── tmpbuf now valid @0xc4c50 ──
   *   0xc4c50  mov  rdi, rbx                  ## memcpy(dst=tmpbuf, src=a[k-1], n=size)
   *   0xc4c53  mov  rsi, r15
   *   0xc4c56  mov  r13, rbx                  ## save tmpbuf into r13 for later
   *   0xc4c59  mov  rbx, [rbp-0x40]           ## rbx = sizeQ (also memcpy n)
   *   0xc4c5d  mov  rdx, rbx
   *   0xc4c60  call _memcpy                   ## tmpbuf <- a[k-1]
   *   0xc4c65  mov  rdi, r14                  ## memcpy(dst=a[k], src=a[k-1], n=size)
   *   0xc4c68  mov  rsi, r15
   *   0xc4c6b  mov  rdx, rbx
   *   0xc4c6e  call _memcpy                   ## a[k]   <- a[k-1]
   *   0xc4c73  mov  rdi, r15                  ## memcpy(dst=a[k-1], src=tmpbuf, n=size)
   *   0xc4c76  mov  rsi, r13
   *   0xc4c79  mov  rdx, rbx
   *   0xc4c7c  mov  rbx, r13                  ## restore rbx = tmpbuf pointer
   *   0xc4c7f  call _memcpy                   ## a[k-1] <- tmpbuf
   *   ── k adjust: gnome-sort's characteristic step-back @0xc4c84 ──
   *   0xc4c84  cmp  r12d, 2
   *   0xc4c88  lea  eax, [r12+1]              ## default new k = k+1
   *   0xc4c8d  cmovge eax, [rbp-0x34]         ## if k >= 2, new k = km1 = k-1
   *   0xc4c91  mov  r12d, eax                 ## k := (k>=2 ? k-1 : k+1)
   *   0xc4c94  jmp  0xc4c99
   *   ── in-order path @0xc4c96 ──
   *   0xc4c96  inc  r12d                      ## k := k+1
   *   ── loop tail @0xc4c99 ──
   *   0xc4c99  cmp  r12d, [rbp-0x30]          ## while (k < n)
   *   0xc4c9d  mov  edx, [rbp-0x2c]           ## reload size
   *   0xc4ca0  jl   0xc4c0d                   ## -> LOOP HEAD
   *   ── free tmpbuf & return @0xc4ca6 ──
   *   0xc4ca6  test rbx, rbx
   *   0xc4ca9  je   0xc4cc1                   ## if never allocated, no free
   *   0xc4cab  mov  rdi, rbx
   *   0xc4cae  add rsp,0x28; pop rbx/r12/r13/r14/r15/rbp
   *   0xc4cbc  jmp  __ZdaPv                   ## tail-jmp operator delete[](tmpbuf)
   *   ── no-tmpbuf return @0xc4cc1 ──
   *   0xc4cc1  add rsp,0x28; pop rbx/r12/r13/r14/r15/rbp
   *   0xc4ccf  ret
   */
  static gnomesortImpl(
    base: Uint8Array,
    baseOff: number,
    n: number,
    size: number,
    cmp: (a: Uint8Array, aOff: number, b: Uint8Array, bOff: number) => number,
  ): void {
    // @0xc4bf2..0xc4bf5 — if n < 2, nothing to do.
    if ((n | 0) < 2) {
      return;
    }
    // @0xc4bfb..0xc4bfe — sizeQ = sign-extend(size) to int64. In JS we keep it
    // as a Number; size is small (bytes per element), never near 2^53.
    const sizeQ = size | 0;
    // @0xc4c02..0xc4c08 — initialise the gnome index k and the lazy tmp slot.
    let k = 1;
    let tmpbuf: Uint8Array | null = null;
    // The 32-bit size stash at [rbp-0x2c] is folded into the same `size`
    // number here — the two locations exist only because the asm reloads
    // %edx after the memcpys clobbered it.
    while (k < (n | 0)) {
      // @0xc4c0d..0xc4c1f — compute km1 index and byte offset.
      const km1 = k - 1;
      // @0xc4c12..0xc4c1b — imul + sign-extend + add base. The imul is 32-bit
      // signed; km1 * size cannot exceed 2^31 for any realistic PCArray usage,
      // so a plain JS multiply matches.
      const off_km1 = (baseOff + Math.imul(km1, sizeQ)) | 0;
      // @0xc4c22..0xc4c2b — same for k.
      const off_k = (baseOff + Math.imul(k, sizeQ)) | 0;
      // @0xc4c2e..0xc4c34 — cmp(a[k-1], a[k]).
      const v = cmp(base, off_km1, base, off_k) | 0;
      // @0xc4c37..0xc4c39 — jle 0xc4c96: if v <= 0 (already ordered), no swap.
      if (v > 0) {
        // ── swap path ──
        // @0xc4c3f..0xc4c4d — lazy allocation of the temp buffer.
        if (tmpbuf === null) {
          tmpbuf = operator_new_array(sizeQ);
        }
        // @0xc4c50..0xc4c60 — tmpbuf <- a[k-1]  (3-memcpy classical swap).
        memcpy_bytes(tmpbuf, 0,       base,   off_km1, sizeQ);
        // @0xc4c65..0xc4c6e — a[k]   <- a[k-1]
        memcpy_bytes(base,   off_k,   base,   off_km1, sizeQ);
        // @0xc4c73..0xc4c7f — a[k-1] <- tmpbuf
        memcpy_bytes(base,   off_km1, tmpbuf, 0,       sizeQ);
        // @0xc4c84..0xc4c91 — gnome step-back: if k>=2, k := k-1; else k := k+1.
        // The asm computes both `lea eax, [r12+1]` (k+1) and `[rbp-0x34]=km1`
        // (k-1) then cmov's between them based on r12d >= 2. Faithful:
        k = (k >= 2) ? km1 : (k + 1);
        // @0xc4c94 — jmp 0xc4c99 (loop tail).
      } else {
        // @0xc4c96 — in-order: k := k+1
        k = k + 1;
      }
      // @0xc4c99..0xc4ca0 — loop condition (k < n). We already handle it above.
    }
    // @0xc4ca6..0xc4cbc — free the temp buffer if we allocated one.
    if (tmpbuf !== null) {
      operator_delete_array(tmpbuf);
    }
    // @0xc4cc1..0xc4ccf — return.
  }

  /**
   * PCArray_base::badIndex()
   * @ProCore 0xc4cd0 (raw-port/re/disasm/ProCore.PCArray_base.badIndex.s)
   *
   * `[[noreturn]]` — allocates a PCBadIndexException with message
   * "PCArray::operator[]" (as a PCString wrapping a C-string literal) and
   * throws it via ___cxa_throw. The nine subsequent instructions at
   * 0xc4d24..0xc4d55 are the clang-emitted exception cleanup epilogue
   * (destroy the PCString temporary; ___cxa_free_exception; __Unwind_Resume);
   * they are only reachable via unwind edges out of the ctor callq or the
   * throw itself, and are not part of the linear semantic path.
   *
   *   0xc4cd0  push rbp; mov rbp, rsp; push r14; push rbx; sub rsp, 0x10
   *   0xc4cdb  mov  edi, 0x40                                  ## exception size
   *   0xc4ce0  call ___cxa_allocate_exception                   ## rax = raw ex ptr
   *   0xc4ce5  mov  rbx, rax                                   ## rbx = ex
   *   0xc4ce8  lea  rsi, [rip+0x711eb]                         ## rsi = "PCArray::operator[]"
   *   0xc4cef  lea  rdi, [rbp-0x18]                            ## rdi = &pcs (temp PCString)
   *   0xc4cf3  call __ZN8PCStringC1EPKc                        ## PCString(char const*)
   *   0xc4cf8  lea  rsi, [rbp-0x18]                            ## rsi = &pcs
   *   0xc4cfc  mov  rdi, rbx                                   ## rdi = ex
   *   0xc4cff  call __ZN11PCExceptionC2ERK8PCString            ## PCException(PCString const&)
   *   0xc4d04  lea  rax, [rip+0x87bc5]                         ## rax = &vtable_PCBadIndexException + 0x10
   *   0xc4d0b  mov  [rbx], rax                                 ## *ex = vtable+0x10
   *   0xc4d0e  lea  rsi, [rip+ __ZTI19PCBadIndexException ]
   *   0xc4d15  lea  rdx, [rip+ __ZN19PCBadIndexExceptionD1Ev ]
   *   0xc4d1c  mov  rdi, rbx                                   ## rdi = ex
   *   0xc4d1f  call ___cxa_throw                               ## [[noreturn]]
   *   0xc4d24  ud2                                             ## unreachable
   */
  static badIndex(): never {
    // @0xc4cd0..0xc4d24 — the whole body is an [[noreturn]] throw chain. We
    // do not have PCException/PCBadIndexException/PCString ported yet; the
    // faithful surface is a single stub throw citing the entire chain.
    return cxa_throw_PCBadIndexException();
  }
}
