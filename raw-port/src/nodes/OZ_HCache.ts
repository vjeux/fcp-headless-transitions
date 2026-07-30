// OZ_HCache — an Ozone framework internal cache class. This file adds the
// FIRST decoded piece of OZ_HCache: the default constructor. Field layout
// below is recovered ENTIRELY from the constructor's writes (Rule 5 — model
// structs, no magic offsets). No callers/getters have been ported yet, so we
// don't invent semantics for slots the machine only zeros — the offset IS the
// field name for those.
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
// Disasm:   /tmp/Ozone_tV.txt lines 1482622-1482657 (35-line body).
//
// Symbols ported here (mangled → address):
//   * __ZN9OZ_HCacheC1Ev   — OZ_HCache::OZ_HCache() @Ozone 0x5a8ea0
//     (C1 is the "complete-object" constructor variant; the disasm body
//      lives at 0x5a8ea0-0x5a8f2e, 143 bytes.)
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (from ctor writes; total object size ≥ 0x9c bytes)
// -----------------------------------------------------------------------------
//   +0x00  void*    vtablePtr           ; @0x5a8eab-b2 leaq @VA 0x8806f8, movq
//                                       ; (vtable pointer for OZ_HCache; the
//                                       ; loaded address is __DATA_CONST/__const
//                                       ; 0x8806f8 which sits inside the vtable
//                                       ; region — modelled OPAQUELY here)
//   +0x08  uint32   flagOrCountAt8      ; @0x5a8ea4 movl $0x1, initialized to 1
//   +0x0c  <16 bytes zeroed>            ; @0x5a8ec7 movups xmm0=0, 16 bytes
//                                       ;   -> covers +0x0c..+0x1b (four u32
//                                       ;   or two u64 slots; we don't decode
//                                       ;   sub-fields because no reader is
//                                       ;   ported yet)
//   +0x1c  uint64   zeroedAt1c          ; @0x5a8ecb movq $0x0
//   +0x28  uint64   zeroedAt28          ; @0x5a8ebc movq $0x0
//   +0x30  double   doubleAt30          ; @0x5a8ed3-db movsd from RIP-const
//                                       ;   VA 0x706e00; the constant is the
//                                       ;   f64 value 2^-15 = 3.0517578125e-5
//                                       ;   (bit pattern 0x3f000000_3f000000 —
//                                       ;   sign=0, exp=1008, mantissa=0).
//   +0x38  uint64   sentinelAt38        ; @0x5a8ee0 movq $0x40000000 (=2^30)
//   +0x40  void*    listHeadNext        ; @0x5a8ef0 movq %rax = &this[+0x48]
//   +0x48  uint64   listHeadValAt48     ; @0x5a8ef8 movq $0x0
//   +0x50  void*    listHeadPrev        ; @0x5a8ef4 movq %rcx = &this[+0x40]
//                                       ;   (init: head.next = &head; head.prev
//                                       ;    = &head; head.val = 0 — this is
//                                       ;    the classic std::__list-style
//                                       ;    circular sentinel node inline in
//                                       ;    the object.)
//   +0x58  void*    list2HeadNext       ; @0x5a8f08 movq %rax = &this[+0x60]
//   +0x60  uint64   list2HeadValAt60    ; @0x5a8f10 movq $0x0
//   +0x68  void*    list2HeadPrev       ; @0x5a8f0c movq %rcx = &this[+0x58]
//                                       ;   (second identical inline circular-
//                                       ;    list sentinel node.)
//   +0x70  uint32   capacityAt70        ; @0x5a8eb5 movl $0x400 = 1024
//                                       ;   (read by the ~OZ_HCache dtor at
//                                       ;    +0x5a8f54 as the length of the
//                                       ;    +0x78 pointer array — so this is
//                                       ;    the capacity/bucket-count of a
//                                       ;    hash table backed by that array.)
//   +0x78  <16 bytes zeroed>            ; @0x5a8f18 movups xmm0=0
//                                       ;   -> +0x78 = bucket-array pointer
//                                       ;   (dtor iterates buckets[0..cap-1]);
//                                       ;   +0x80 = a second u64 slot (size?).
//   +0x88  <16 bytes zeroed>            ; @0x5a8f1c movups xmm0=0
//                                       ;   -> +0x88..+0x97 zero
//   +0x98  uint32   zeroedAt98          ; @0x5a8f23 movl $0x0
//
// -----------------------------------------------------------------------------
// FULL DISASM (__ZN9OZ_HCacheC1Ev @0x5a8ea0-0x5a8f2e)
// -----------------------------------------------------------------------------
//   0x5a8ea0  pushq  %rbp
//   0x5a8ea1  movq   %rsp, %rbp
//   0x5a8ea4  movl   $0x1, 0x8(%rdi)              ; this->+0x08 = 1 (u32)
//   0x5a8eab  leaq   0x2d7846(%rip), %rax         ; %rax = VA 0x8806f8 (vtable)
//   0x5a8eb2  movq   %rax, (%rdi)                 ; this->vtable = &vtable
//   0x5a8eb5  movl   $0x400, 0x70(%rdi)           ; this->+0x70 = 0x400 = 1024
//   0x5a8ebc  movq   $0x0, 0x28(%rdi)             ; this->+0x28 = 0 (u64)
//   0x5a8ec4  xorps  %xmm0, %xmm0                 ; xmm0 = 0 (16 zero bytes)
//   0x5a8ec7  movups %xmm0, 0xc(%rdi)             ; this->+0x0c..+0x1b = 0
//   0x5a8ecb  movq   $0x0, 0x1c(%rdi)             ; this->+0x1c = 0 (u64)
//   0x5a8ed3  movsd  0x15df25(%rip), %xmm1        ; xmm1 = *(f64*) VA 0x706e00
//                                                 ;    = 2^-15 = 3.0517578125e-5
//   0x5a8edb  movsd  %xmm1, 0x30(%rdi)            ; this->+0x30 = 2^-15
//   0x5a8ee0  movq   $0x40000000, 0x38(%rdi)      ; this->+0x38 = 0x40000000 = 2^30
//   0x5a8ee8  leaq   0x48(%rdi), %rax             ; rax = &this[+0x48]
//   0x5a8eec  leaq   0x40(%rdi), %rcx             ; rcx = &this[+0x40]
//   0x5a8ef0  movq   %rax, 0x40(%rdi)             ; this->+0x40 = &this[+0x48]
//   0x5a8ef4  movq   %rcx, 0x50(%rdi)             ; this->+0x50 = &this[+0x40]
//   0x5a8ef8  movq   $0x0, 0x48(%rdi)             ; this->+0x48 = 0 (u64)
//   0x5a8f00  leaq   0x60(%rdi), %rax             ; rax = &this[+0x60]
//   0x5a8f04  leaq   0x58(%rdi), %rcx             ; rcx = &this[+0x58]
//   0x5a8f08  movq   %rax, 0x58(%rdi)             ; this->+0x58 = &this[+0x60]
//   0x5a8f0c  movq   %rcx, 0x68(%rdi)             ; this->+0x68 = &this[+0x58]
//   0x5a8f10  movq   $0x0, 0x60(%rdi)             ; this->+0x60 = 0 (u64)
//   0x5a8f18  movups %xmm0, 0x78(%rdi)            ; this->+0x78..+0x87 = 0
//   0x5a8f1c  movups %xmm0, 0x88(%rdi)            ; this->+0x88..+0x97 = 0
//   0x5a8f23  movl   $0x0, 0x98(%rdi)             ; this->+0x98 = 0 (u32)
//   0x5a8f2d  popq   %rbp
//   0x5a8f2e  retq
//
// The constant at VA 0x706e00 was read directly from the __TEXT/__const
// section of the Ozone x86_64 slice: bytes `00 00 00 3f 00 00 00 3f`, which
// as an f64 little-endian equals 2^-15 (sign=0, biased-exp=0x3F0=1008,
// mantissa=0). No callers ported yet, so we don't know its role.

/**
 * OZ_HCache — Ozone hash cache (a bucketed cache with two inline circular
 * lists plus a bucket-array pointer). Only the ctor's writes are decoded;
 * every field name mirrors the offset until a getter/user reveals its
 * semantic role. Modelled as a class so the ctor stamps the same shape
 * the machine does.
 *
 * All 8-byte pointer/handle slots are typed `number` here — they are
 * pointer fields in the C++ layout, but no reader/writer has been ported
 * yet so the ONLY thing we can port faithfully is the "was zero", "was
 * $0x1", or "was &this[+off]" values the constructor stamps. Sentinel
 * self-links for the two inline circular lists are represented by
 * setting `listHeadNext = this` and `listHeadPrev = this` (the machine
 * writes those two slots to `&this[+0x48]` and `&this[+0x40]`, which
 * addresses inside this same object — so in TS-land `this` is the
 * faithful pointer analogue).
 */
export class OZ_HCache {
  /** @Ozone offset +0x00 — vtable pointer, set @0x5a8eb2 to VA 0x8806f8. */
  vtablePtr: unknown = null;

  /** @Ozone offset +0x08 — u32, ctor sets to 1 @0x5a8ea4 (`movl $0x1`). */
  flagOrCountAt8: number = 0;

  /** @Ozone offset +0x0c..+0x1b — 16 bytes zeroed @0x5a8ec7 (movups xmm0=0). */
  zeroedAtC: number = 0;
  zeroedAt10: number = 0;
  zeroedAt14: number = 0;
  zeroedAt18: number = 0;

  /** @Ozone offset +0x1c — u64 zeroed @0x5a8ecb. */
  zeroedAt1c: number = 0;

  /** @Ozone offset +0x28 — u64 zeroed @0x5a8ebc. */
  zeroedAt28: number = 0;

  /**
   * @Ozone offset +0x30 — f64, ctor loads from RIP-const @VA 0x706e00
   * and stores here @0x5a8edb (movsd). The constant is the exact
   * IEEE-754 f64 value 2^-15 = 3.0517578125e-5 (bit pattern
   * 0x3f000000_3f000000 read as little-endian f64).
   */
  doubleAt30: number = 0;

  /** @Ozone offset +0x38 — u64 = 0x40000000 (=2^30) @0x5a8ee0. */
  sentinelAt38: number = 0;

  /**
   * @Ozone offset +0x40..+0x50 — an inline circular-list sentinel node.
   * The ctor writes:
   *   this[+0x40] = &this[+0x48]   (head.next = &self)
   *   this[+0x50] = &this[+0x40]   (head.prev = &self)
   *   this[+0x48] = 0              (payload / count)
   * Modelled as a small object; `next`/`prev` are `this`-references in
   * the initial (empty) state to mirror the machine's self-referencing
   * sentinel layout.
   */
  listHeadAt40: { next: unknown; valAt48: number; prev: unknown } = {
    next: null,
    valAt48: 0,
    prev: null,
  };

  /**
   * @Ozone offset +0x58..+0x68 — a second inline circular-list sentinel
   * node, identical shape to the +0x40 list.
   */
  list2HeadAt58: { next: unknown; valAt60: number; prev: unknown } = {
    next: null,
    valAt60: 0,
    prev: null,
  };

  /**
   * @Ozone offset +0x70 — u32 = 1024 (0x400) @0x5a8eb5. Read by the
   * OZ_HCache destructor as the length of the pointer array at +0x78,
   * so this is the capacity / bucket-count of the hash table.
   */
  capacityAt70: number = 0;

  /** @Ozone offset +0x78..+0x87 — 16 bytes zeroed @0x5a8f18. */
  bucketsPtrAt78: unknown = null;
  zeroedAt80: number = 0;

  /** @Ozone offset +0x88..+0x97 — 16 bytes zeroed @0x5a8f1c. */
  zeroedAt88: number = 0;
  zeroedAt90: number = 0;

  /** @Ozone offset +0x98 — u32 zeroed @0x5a8f23. */
  zeroedAt98: number = 0;

  /**
   * `OZ_HCache::OZ_HCache()` — @Ozone 0x5a8ea0
   *   — __ZN9OZ_HCacheC1Ev  (complete-object ctor variant)
   *
   * Faithful line-for-line transcription of the 35-line disassembly
   * quoted in the file header. Every store the constructor performs is
   * mirrored here in source order.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field-init constructor.
   *
   * Numeric-fidelity notes:
   *   - `+0x30` is an f64 loaded from a RIP-const (bit pattern
   *     0x3f000000_3f000000). The exact value is 2^-15 =
   *     3.0517578125e-5; a `Math.pow(2, -15)` computation is exact in
   *     IEEE-754 f64 (representable), so we can spell it either as a
   *     literal or as a call to `Math.pow`. We use the literal that
   *     matches the constant's decoded value.
   *   - `+0x38` is a `movq $0x40000000` — the immediate is exactly 2^30
   *     (0x40000000 = 1073741824) which fits in a JS `number` without
   *     precision loss.
   *   - The two circular-list sentinels' next/prev pointers point INTO
   *     this same object at specific offsets. In TS-land the analogue
   *     is a `this`-reference; we cannot preserve the exact offset-into-
   *     object semantic without a byte-buffer backing, but the invariant
   *     the ctor establishes ("next == prev == self") is preserved.
   */
  constructor() {
    // @0x5a8ea4  movl $0x1,0x8(%rdi)          this[+0x08] = 1
    this.flagOrCountAt8 = 1;

    // @0x5a8eab  leaq 0x2d7846(%rip),%rax     rax = VA 0x8806f8 (vtable)
    // @0x5a8eb2  movq %rax,(%rdi)             this[+0x00] = &vtable
    //   Vtable identity is not modelled — TS classes have their own
    //   method dispatch. Recorded as a comment for provenance.
    this.vtablePtr = { addr: 0x8806f8 };

    // @0x5a8eb5  movl $0x400,0x70(%rdi)       this[+0x70] = 1024
    this.capacityAt70 = 0x400;

    // @0x5a8ebc  movq $0x0,0x28(%rdi)          this[+0x28] = 0
    this.zeroedAt28 = 0;

    // @0x5a8ec4  xorps %xmm0,%xmm0             xmm0 = 0 (16 zero bytes)
    // @0x5a8ec7  movups %xmm0,0xc(%rdi)        this[+0x0c..+0x1b] = 0
    this.zeroedAtC = 0;
    this.zeroedAt10 = 0;
    this.zeroedAt14 = 0;
    this.zeroedAt18 = 0;

    // @0x5a8ecb  movq $0x0,0x1c(%rdi)         this[+0x1c] = 0 (u64)
    this.zeroedAt1c = 0;

    // @0x5a8ed3  movsd 0x15df25(%rip),%xmm1   xmm1 = *(f64*) VA 0x706e00
    // @0x5a8edb  movsd %xmm1,0x30(%rdi)       this[+0x30] = 2^-15
    //   The constant at VA 0x706e00 in Ozone's __TEXT/__const is the
    //   f64 value 2^-15 = 3.0517578125e-5 (bytes 0x3f000000_3f000000).
    this.doubleAt30 = Math.pow(2, -15);

    // @0x5a8ee0  movq $0x40000000,0x38(%rdi)  this[+0x38] = 2^30
    this.sentinelAt38 = 0x40000000;

    // @0x5a8ee8  leaq 0x48(%rdi),%rax          rax = &this[+0x48]
    // @0x5a8eec  leaq 0x40(%rdi),%rcx          rcx = &this[+0x40]
    // @0x5a8ef0  movq %rax,0x40(%rdi)          this[+0x40] = &this[+0x48]
    // @0x5a8ef4  movq %rcx,0x50(%rdi)          this[+0x50] = &this[+0x40]
    // @0x5a8ef8  movq $0x0,0x48(%rdi)          this[+0x48] = 0
    //   The +0x40 list-head sentinel: next=self, prev=self, val=0.
    this.listHeadAt40 = {
      next: this.listHeadAt40, // will be self-referenced below
      valAt48: 0,
      prev: this.listHeadAt40,
    };
    this.listHeadAt40.next = this.listHeadAt40;
    this.listHeadAt40.prev = this.listHeadAt40;

    // @0x5a8f00  leaq 0x60(%rdi),%rax          rax = &this[+0x60]
    // @0x5a8f04  leaq 0x58(%rdi),%rcx          rcx = &this[+0x58]
    // @0x5a8f08  movq %rax,0x58(%rdi)          this[+0x58] = &this[+0x60]
    // @0x5a8f0c  movq %rcx,0x68(%rdi)          this[+0x68] = &this[+0x58]
    // @0x5a8f10  movq $0x0,0x60(%rdi)          this[+0x60] = 0
    //   The +0x58 list-head sentinel: next=self, prev=self, val=0.
    this.list2HeadAt58 = {
      next: this.list2HeadAt58,
      valAt60: 0,
      prev: this.list2HeadAt58,
    };
    this.list2HeadAt58.next = this.list2HeadAt58;
    this.list2HeadAt58.prev = this.list2HeadAt58;

    // @0x5a8f18  movups %xmm0,0x78(%rdi)       this[+0x78..+0x87] = 0
    //   +0x78 is the bucket-array pointer (null at construction; the
    //   dtor tests it against 0 before iterating). +0x80 is a paired u64.
    this.bucketsPtrAt78 = null;
    this.zeroedAt80 = 0;

    // @0x5a8f1c  movups %xmm0,0x88(%rdi)       this[+0x88..+0x97] = 0
    this.zeroedAt88 = 0;
    this.zeroedAt90 = 0;

    // @0x5a8f23  movl $0x0,0x98(%rdi)          this[+0x98] = 0 (u32)
    this.zeroedAt98 = 0;

    // @0x5a8f2d  popq %rbp
    // @0x5a8f2e  retq
  }
}
