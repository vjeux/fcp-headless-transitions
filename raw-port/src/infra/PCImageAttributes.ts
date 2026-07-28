// PCImageAttributes.ts — ProCore's image-attributes value type.
//
// Faithful transcription of ProCore.framework's `PCImageAttributes`
// class (7 exported symbols: default ctor C1/C2, copy ctor C1/C2,
// operator=, operator==, getCacheHashKey). No destructor is exported
// (implicit — the only owning field is `PCColorSpaceHandle` at +0x18,
// which owns its own dtor).
//
// Framework: ProCore (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                    ProCore.framework/Versions/A/ProCore).
//
// Ported symbols (all @ProCore):
//   @0x000000000004a890  PCImageAttributes::PCImageAttributes()  [C2]
//                        __ZN17PCImageAttributesC2Ev
//   @0x000000000004a8ec  PCImageAttributes::PCImageAttributes()  [C1]
//                        __ZN17PCImageAttributesC1Ev
//                        (C1 is a 3-instruction tail-jmp to C2.)
//   @0x000000000004a8f6  PCImageAttributes::PCImageAttributes(
//                          PCImageAttributes const&) [C2]
//                        __ZN17PCImageAttributesC2ERKS_
//   @0x000000000004a950  PCImageAttributes::PCImageAttributes(
//                          PCImageAttributes const&) [C1]
//                        __ZN17PCImageAttributesC1ERKS_
//                        (C1 is a 3-instruction tail-jmp to C2.)
//   @0x000000000004a95a  PCImageAttributes::operator=(
//                          PCImageAttributes const&)
//                        __ZN17PCImageAttributesaSERKS_
//   @0x000000000004a9b6  PCImageAttributes::operator==(
//                          PCImageAttributes const&) const
//                        __ZNK17PCImageAttributeseqERKS_
//   @0x000000000004aa1c  PCImageAttributes::getCacheHashKey() const
//                        __ZNK17PCImageAttributes15getCacheHashKeyEv
//
// Callees / data references (all @ProCore):
//   @ProCore data 0x125460  RIP-relative XMM literal used by C2 default
//                            ctor (@0x4a89a). Contents recovered via
//                            `resolve.py ProCore const`:
//                              qword[0x125460] = 0x0000000000000000
//                              qword[0x125468] = 0x0000000800000000
//                            i.e. 16 bytes = [u32:0, u32:0, u32:0, u32:8]
//                            written to this->+0x00..+0x0f.
//   @ProCore imm  0x500000004     movabsq to this->+0x10 (@0x4a8a4).
//                            = pack(low u32:0x00000004, high u32:0x00000005)
//                            → this->+0x10 = 4, this->+0x14 = 5.
//   @ProCore imm  0x85bd000084f5  movabsq to this->+0x20 (@0x4a8c6).
//                            = pack(low u32:0x000084f5, high u32:0x000085bd)
//                            → this->+0x20 = 0x84f5, this->+0x24 = 0x85bd.
//   @ProCore stub  __ZN6PCInfo25getDefaultRGBCGColorSpaceEv    @0x4a8b6
//                  PCInfo::getDefaultRGBCGColorSpace()  (returns CGColorSpace*)
//   @ProCore stub  __ZN18PCColorSpaceHandleC1EP12CGColorSpace  @0x4a8c1
//                  PCColorSpaceHandle::PCColorSpaceHandle(CGColorSpace*)
//   @ProCore stub  __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_  @0x4a91e
//                  PCCFRefTraits<CGColorSpace*>::retain(CGColorSpace*)
//   @ProCore stub  __ZN7PCCFRefIP12CGColorSpaceEaSERKS2_        @0x4a982
//                  PCCFRef<CGColorSpace*>::operator=(PCCFRef<CGColorSpace*> const&)
//   @ProCore stub  __ZN18PCColorSpaceHandle16isSameColorSpaceERKS_S1_  @0x4a9fd
//                  PCColorSpaceHandle::isSameColorSpace(
//                    PCColorSpaceHandle const&, PCColorSpaceHandle const&)
//   @ProCore stub  __ZNK18PCColorSpaceHandle15getCGColorSpaceEv  @0x4aab4
//                  PCColorSpaceHandle::getCGColorSpace() const
//   @ProCore stub  __ZN17PCHashWriteStreamC1Ev                   @0x4aa4b
//                  PCHashWriteStream::PCHashWriteStream()
//   @ProCore stub  __ZN17PCHashWriteStreamD1Ev                   @0x4ab01
//                  PCHashWriteStream::~PCHashWriteStream()
//   @ProCore stub  __ZN17PCHashWriteStream10writeValueEi         @0x4aa5a
//                  PCHashWriteStream::writeValue(int)
//   @ProCore stub  __ZN17PCHashWriteStream10writeValueEj         @0x4aa6a
//                  PCHashWriteStream::writeValue(unsigned int)
//   @ProCore stub  __ZN17PCHashWriteStream10writeValueEb         @0x4aaab
//                  PCHashWriteStream::writeValue(bool)
//   @ProCore stub  __ZN17PCHashWriteStream10writeValueEPKv       @0x4aac3
//                  PCHashWriteStream::writeValue(void const*)
//   @ProCore stub  __ZN17PCHashWriteStream7getHashEv             @0x4aaef
//                  PCHashWriteStream::getHash()   → returns 16-byte hash
//                  (movups (%rax),%xmm0 ; movups %xmm0,(%rbx) copies 16
//                   bytes to the return slot; matches PCHash size = 16).
//   @ProCore stub  ____chkstk_darwin / ___stack_chk_fail / __Unwind_Resume
//                  (frame prologue helpers — landing pad only).
//
// STRUCT LAYOUT (recovered from C2 default @0x4a890 and C2 copy @0x4a8f6):
//   +0x00  int32     `field_0x00`    — default 0; compared u32 first in ==.
//   +0x04  uint32    `field_0x04`    — default 0.
//   +0x08  uint32    `field_0x08`    — default 0.
//   +0x0c  uint32    `field_0x0c`    — default 8   (from XMM literal @0x125460).
//   +0x10  uint32    `field_0x10`    — default 4   (from movabsq @0x4a8a4).
//   +0x14  int32     `field_0x14`    — default 5   (high half of same movabsq).
//                                      Written LAST in getCacheHashKey
//                                      (@0x4aad8 after +0x20's write).
//   +0x18  PCColorSpaceHandle       — colorSpace. Default: constructed from
//                                      PCInfo::getDefaultRGBCGColorSpace()
//                                      via PCColorSpaceHandle ctor. Copy
//                                      ctor: mem-copies pointer at +0x18
//                                      and, if non-null, calls retain().
//                                      Assumed to be 8 bytes since ctor
//                                      copies only qword +0x18 (see @0x4a911
//                                      → @0x4a915). Layout size ≤ 8.
//   +0x20  int32     `field_0x20`    — default 0x84f5   (from movabsq @0x4a8c6).
//                                      A "kind" tag (compared as i32 in ==,
//                                      written by getCacheHashKey @0x4aac8).
//   +0x24  int32     `field_0x24`    — default 0x85bd   (high half of same
//                                      movabsq). NOT read by any of the 4
//                                      observable methods — a pad or
//                                      write-only field.
//   +0x28  bool      `flag_0x28`     — default false (movb $0x0 @0x4a8d4).
//                                      Copied by copy-ctor and operator=;
//                                      hashed by getCacheHashKey; NOT
//                                      compared by operator==.
//   +0x30  uint64    `field_0x30`    — default 0 (xmm zero-write @0x4a8db,
//                                      also covers +0x38).
//   +0x38  uint64    `field_0x38`    — default 0 (same xmm zero-write).
//                                      Copied by copy-ctor / operator=;
//                                      NOT read by ==, hash, or otherwise.
//   +0x40  uint64    `field_0x40`    — default 0 (movq $0 @0x4a8df).
//                                      Same: copied but never observed.
//
// STRUCT SIZE: sizeof(PCImageAttributes) >= 0x48 (from the last write at
// +0x40 + 8 = 0x48). The class exposes NO virtual methods (no vptr at
// +0x00 — the XMM write clobbers +0x00..+0x0f with numeric defaults).

/**
 * `PCColorSpaceHandle` — a small (≤ 8-byte per copy-ctor evidence) handle
 * wrapping a `CGColorSpace*`. Only referenced by name; its full impl lives
 * in ProCore but is not yet transcribed. Modeled as an opaque record so
 * PCImageAttributes can carry it faithfully.
 */
export interface PCColorSpaceHandle {
  /** @ProCore PCColorSpaceHandle +0x00 — `CGColorSpace*`. Loaded/copied
   *  by copy-ctor @0x4a911..@0x4a915 as a raw qword, then optionally
   *  retained via `PCCFRefTraits<CGColorSpace*>::retain(CGColorSpace*)`
   *  when non-null. */
  cgColorSpace: unknown;
}

/**
 * `PCInfo::getDefaultRGBCGColorSpace()` — external stub for
 * __ZN6PCInfo25getDefaultRGBCGColorSpaceEv (called @ProCore 0x4a8b6).
 * Not yet transcribed. Returns a `CGColorSpace*` used to seed the
 * default ctor's colorSpace field.
 */
function PCInfo_getDefaultRGBCGColorSpace_stub(): unknown {
  throw new Error(
    "PCInfo::getDefaultRGBCGColorSpace() @ProCore stub 0x4a8b6 " +
      "(__ZN6PCInfo25getDefaultRGBCGColorSpaceEv) not yet transcribed",
  );
}

/**
 * `PCColorSpaceHandle::PCColorSpaceHandle(CGColorSpace*)` — external
 * stub for __ZN18PCColorSpaceHandleC1EP12CGColorSpace (called
 * @ProCore 0x4a8c1). Not yet transcribed.
 */
function PCColorSpaceHandle_ctor_fromCGColorSpace_stub(
  _this: PCColorSpaceHandle,
  _cs: unknown,
): void {
  throw new Error(
    "PCColorSpaceHandle::PCColorSpaceHandle(CGColorSpace*) @ProCore stub 0x4a8c1 " +
      "(__ZN18PCColorSpaceHandleC1EP12CGColorSpace) not yet transcribed",
  );
}

/**
 * `PCCFRefTraits<CGColorSpace*>::retain(CGColorSpace*)` — external stub
 * for __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_ (called
 * @ProCore 0x4a91e). Not yet transcribed. Called by the copy-ctor when
 * the source colorSpace pointer is non-null.
 */
function PCCFRefTraits_CGColorSpace_retain_stub(_p: unknown): void {
  throw new Error(
    "PCCFRefTraits<CGColorSpace*>::retain(CGColorSpace*) @ProCore stub 0x4a91e " +
      "(__ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_) not yet transcribed",
  );
}

/**
 * `PCCFRef<CGColorSpace*>::operator=(PCCFRef<CGColorSpace*> const&)` —
 * external stub for __ZN7PCCFRefIP12CGColorSpaceEaSERKS2_ (called
 * @ProCore 0x4a982). Not yet transcribed. Called by operator= to
 * assign the +0x18 handle.
 */
function PCCFRef_CGColorSpace_assign_stub(
  _this: PCColorSpaceHandle,
  _rhs: PCColorSpaceHandle,
): void {
  throw new Error(
    "PCCFRef<CGColorSpace*>::operator=(PCCFRef<CGColorSpace*> const&) @ProCore stub 0x4a982 " +
      "(__ZN7PCCFRefIP12CGColorSpaceEaSERKS2_) not yet transcribed",
  );
}

/**
 * `PCColorSpaceHandle::isSameColorSpace(PCColorSpaceHandle const&,
 *                                        PCColorSpaceHandle const&)` —
 * external stub for __ZN18PCColorSpaceHandle16isSameColorSpaceERKS_S1_
 * (called @ProCore 0x4a9fd). Not yet transcribed. Used by operator==.
 */
function PCColorSpaceHandle_isSameColorSpace_stub(
  _a: PCColorSpaceHandle,
  _b: PCColorSpaceHandle,
): boolean {
  throw new Error(
    "PCColorSpaceHandle::isSameColorSpace(...) @ProCore stub 0x4a9fd " +
      "(__ZN18PCColorSpaceHandle16isSameColorSpaceERKS_S1_) not yet transcribed",
  );
}

/**
 * `PCColorSpaceHandle::getCGColorSpace() const` — external stub for
 * __ZNK18PCColorSpaceHandle15getCGColorSpaceEv (called @ProCore 0x4aab4).
 * Not yet transcribed. Used by getCacheHashKey to hash the raw CG pointer.
 */
function PCColorSpaceHandle_getCGColorSpace_stub(
  _this: PCColorSpaceHandle,
): unknown {
  throw new Error(
    "PCColorSpaceHandle::getCGColorSpace() @ProCore stub 0x4aab4 " +
      "(__ZNK18PCColorSpaceHandle15getCGColorSpaceEv) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream` — a 16-byte-hash accumulator used by getCacheHashKey.
 * Its full impl lives in ProCore (all 7 writeValue overloads + ctor/dtor
 * + getHash) but none are yet transcribed. Modeled here as an opaque
 * handle so the 16-byte hash output can be represented.
 */
export interface PCHashWriteStream {
  /** @ProCore internal state — untouched by this class. */
  __state?: unknown;
}

/**
 * `PCHash` — the 16-byte return value of `PCHashWriteStream::getHash()`.
 * getCacheHashKey copies it into the return-slot via
 * `movups (%rax),%xmm0 ; movups %xmm0,(%rbx)` @0x4aaf4..@0x4aaf7.
 */
export interface PCHash {
  /** 16 bytes of hash output. */
  bytes: Uint8Array;
}

/**
 * `PCHashWriteStream::PCHashWriteStream()` — external stub, @ProCore
 * 0x4aa4b (__ZN17PCHashWriteStreamC1Ev). Not yet transcribed. The
 * stream's stack frame in getCacheHashKey is 0x1050 bytes (from
 * `____chkstk_darwin(0x1050)` @0x4aa23).
 */
function PCHashWriteStream_ctor_stub(_this: PCHashWriteStream): void {
  throw new Error(
    "PCHashWriteStream::PCHashWriteStream() @ProCore stub 0x4aa4b " +
      "(__ZN17PCHashWriteStreamC1Ev) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::~PCHashWriteStream()` — external stub, @ProCore
 * 0x4ab01 (__ZN17PCHashWriteStreamD1Ev). Not yet transcribed.
 */
function PCHashWriteStream_dtor_stub(_this: PCHashWriteStream): void {
  throw new Error(
    "PCHashWriteStream::~PCHashWriteStream() @ProCore stub 0x4ab01 " +
      "(__ZN17PCHashWriteStreamD1Ev) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::writeValue(int)` — external stub, @ProCore 0x4aa5a
 * (__ZN17PCHashWriteStream10writeValueEi). Not yet transcribed.
 */
function PCHashWriteStream_writeValue_i32_stub(
  _this: PCHashWriteStream,
  _v: number,
): void {
  throw new Error(
    "PCHashWriteStream::writeValue(int) @ProCore stub 0x4aa5a " +
      "(__ZN17PCHashWriteStream10writeValueEi) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::writeValue(unsigned int)` — external stub, @ProCore
 * 0x4aa6a (__ZN17PCHashWriteStream10writeValueEj). Not yet transcribed.
 */
function PCHashWriteStream_writeValue_u32_stub(
  _this: PCHashWriteStream,
  _v: number,
): void {
  throw new Error(
    "PCHashWriteStream::writeValue(unsigned int) @ProCore stub 0x4aa6a " +
      "(__ZN17PCHashWriteStream10writeValueEj) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::writeValue(bool)` — external stub, @ProCore 0x4aaab
 * (__ZN17PCHashWriteStream10writeValueEb). Not yet transcribed.
 */
function PCHashWriteStream_writeValue_bool_stub(
  _this: PCHashWriteStream,
  _v: boolean,
): void {
  throw new Error(
    "PCHashWriteStream::writeValue(bool) @ProCore stub 0x4aaab " +
      "(__ZN17PCHashWriteStream10writeValueEb) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::writeValue(void const*)` — external stub, @ProCore
 * 0x4aac3 (__ZN17PCHashWriteStream10writeValueEPKv). Not yet transcribed.
 */
function PCHashWriteStream_writeValue_ptr_stub(
  _this: PCHashWriteStream,
  _v: unknown,
): void {
  throw new Error(
    "PCHashWriteStream::writeValue(void const*) @ProCore stub 0x4aac3 " +
      "(__ZN17PCHashWriteStream10writeValueEPKv) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::getHash()` — external stub, @ProCore 0x4aaef
 * (__ZN17PCHashWriteStream7getHashEv). Returns a pointer to the 16-byte
 * hash buffer; getCacheHashKey copies those 16 bytes into its return
 * slot. Not yet transcribed.
 */
function PCHashWriteStream_getHash_stub(_this: PCHashWriteStream): PCHash {
  throw new Error(
    "PCHashWriteStream::getHash() @ProCore stub 0x4aaef " +
      "(__ZN17PCHashWriteStream7getHashEv) not yet transcribed",
  );
}

/**
 * `PCImageAttributes` — value type describing an image's resolution/
 * format/color-space attributes and providing cache-hash keying.
 */
export class PCImageAttributes {
  /** @ProCore PCImageAttributes +0x00 — default 0 (XMM zero-lo half). */
  field_0x00: number = 0;
  /** @ProCore PCImageAttributes +0x04 — default 0 (XMM zero-lo half). */
  field_0x04: number = 0;
  /** @ProCore PCImageAttributes +0x08 — default 0 (XMM hi-lo u32). */
  field_0x08: number = 0;
  /** @ProCore PCImageAttributes +0x0c — default 8 (XMM hi-hi u32). */
  field_0x0c: number = 8;
  /** @ProCore PCImageAttributes +0x10 — default 4 (movabsq low u32
   *  0x500000004 @0x4a8a4). */
  field_0x10: number = 4;
  /** @ProCore PCImageAttributes +0x14 — default 5 (movabsq high u32
   *  0x500000004 @0x4a8a4). */
  field_0x14: number = 5;
  /** @ProCore PCImageAttributes +0x18 — PCColorSpaceHandle. */
  colorSpace_at_0x18: PCColorSpaceHandle = { cgColorSpace: null };
  /** @ProCore PCImageAttributes +0x20 — default 0x84f5 (movabsq low u32
   *  0x85bd000084f5 @0x4a8c6). */
  field_0x20: number = 0x84f5;
  /** @ProCore PCImageAttributes +0x24 — default 0x85bd (movabsq high u32
   *  0x85bd000084f5 @0x4a8c6). */
  field_0x24: number = 0x85bd;
  /** @ProCore PCImageAttributes +0x28 — default false (movb $0x0 @0x4a8d4). */
  flag_0x28: boolean = false;
  /** @ProCore PCImageAttributes +0x30 — default 0n (xmm zero-write @0x4a8db). */
  field_0x30: bigint = 0n;
  /** @ProCore PCImageAttributes +0x38 — default 0n (same xmm zero-write). */
  field_0x38: bigint = 0n;
  /** @ProCore PCImageAttributes +0x40 — default 0n (movq $0 @0x4a8df). */
  field_0x40: bigint = 0n;

  /**
   * `PCImageAttributes::PCImageAttributes()` C1/C2 @ProCore
   * 0x4a890 (C2) / 0x4a8ec (C1 — tail-jmp to C2).
   *
   * Full body of C2 (all @ProCore):
   *   0x4a890  prologue (r14/rbx saved)
   *   0x4a897  movq %rdi,%rbx
   *   0x4a89a  movaps 0xdabbf(%rip),%xmm0        ; xmm0 = qwords@0x125460
   *                                                = [0x0, 0x800000000]
   *   0x4a8a1  movups %xmm0,(%rdi)               ; this->+0x00..+0x0f = xmm0
   *                                                → +0x00=0 +0x04=0 +0x08=0
   *                                                  +0x0c=8
   *   0x4a8a4  movabsq $0x500000004, %rax        ; rax = 0x500000004
   *   0x4a8ae  movq %rax, 0x10(%rdi)             ; +0x10=4 +0x14=5
   *   0x4a8b2  leaq 0x18(%rdi), %r14             ; r14 = &this->+0x18
   *   0x4a8b6  callq PCInfo::getDefaultRGBCGColorSpace()
   *   0x4a8bb  movq %r14,%rdi ; movq %rax,%rsi
   *   0x4a8c1  callq PCColorSpaceHandle::PCColorSpaceHandle(CGColorSpace*)
   *                                                ; init this->+0x18
   *   0x4a8c6  movabsq $0x85bd000084f5, %rax
   *   0x4a8d0  movq %rax, 0x20(%rbx)             ; +0x20=0x84f5 +0x24=0x85bd
   *   0x4a8d4  movb $0x0, 0x28(%rbx)             ; +0x28=false
   *   0x4a8d8  xorps %xmm0,%xmm0
   *   0x4a8db  movups %xmm0, 0x30(%rbx)          ; +0x30=0 +0x38=0
   *   0x4a8df  movq $0x0, 0x40(%rbx)             ; +0x40=0
   *   0x4a8e7  epilogue → retq
   */
  constructor(_copy_src?: PCImageAttributes) {
    if (_copy_src !== undefined) {
      // Delegate to the copy-ctor path.
      this._copy_from(_copy_src);
      return;
    }
    // @0x4a89a..@0x4a8a1 — XMM literal at 0x125460 = 16 zeroes-ish:
    //   qword[0x125460] = 0                → +0x00=0, +0x04=0
    //   qword[0x125468] = 0x0000000800000000 → +0x08=0, +0x0c=8
    this.field_0x00 = 0;
    this.field_0x04 = 0;
    this.field_0x08 = 0;
    this.field_0x0c = 8;
    // @0x4a8a4..@0x4a8ae — movabsq 0x500000004 → +0x10=4, +0x14=5.
    this.field_0x10 = 4;
    this.field_0x14 = 5;
    // @0x4a8b2..@0x4a8c1 — colorSpace = PCColorSpaceHandle(
    //   PCInfo::getDefaultRGBCGColorSpace()).
    const cs = PCInfo_getDefaultRGBCGColorSpace_stub();
    PCColorSpaceHandle_ctor_fromCGColorSpace_stub(
      this.colorSpace_at_0x18,
      cs,
    );
    // @0x4a8c6..@0x4a8d0 — movabsq 0x85bd000084f5 → +0x20=0x84f5, +0x24=0x85bd.
    this.field_0x20 = 0x84f5;
    this.field_0x24 = 0x85bd;
    // @0x4a8d4 — +0x28 = false.
    this.flag_0x28 = false;
    // @0x4a8d8..@0x4a8db — +0x30 = 0, +0x38 = 0 (xmm zero).
    this.field_0x30 = 0n;
    this.field_0x38 = 0n;
    // @0x4a8df — +0x40 = 0.
    this.field_0x40 = 0n;
  }

  /**
   * `PCImageAttributes::PCImageAttributes(PCImageAttributes const&)`
   * C1/C2 @ProCore 0x4a8f6 (C2) / 0x4a950 (C1 — tail-jmp to C2).
   *
   * Full body of C2 (all @ProCore):
   *   0x4a8f6  prologue (r14/rbx saved)
   *   0x4a8fd  movq %rsi,%r14 ; movq %rdi,%rbx  ; r14=&src, rbx=this
   *   0x4a903  movups (%rsi),%xmm0
   *   0x4a906  movups %xmm0,(%rdi)              ; +0x00..+0x0f ← src
   *   0x4a909  movq 0x10(%rsi),%rax
   *   0x4a90d  movq %rax,0x10(%rdi)             ; +0x10..+0x17 ← src
   *   0x4a911  movq 0x18(%rsi),%rdi             ; rdi = src.+0x18
   *   0x4a915  movq %rdi,0x18(%rbx)             ; this.+0x18 ← src.+0x18
   *   0x4a919  testq %rdi,%rdi
   *   0x4a91c  je 0x4a923                       ; if NULL skip retain
   *   0x4a91e  callq __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_
   *                                              ; retain(src.+0x18)
   *   0x4a923  movq 0x20(%r14),%rax
   *   0x4a927  movq %rax,0x20(%rbx)             ; +0x20..+0x27 ← src
   *   0x4a92b  movb 0x28(%r14),%al
   *   0x4a92f  movb %al,0x28(%rbx)              ; +0x28 ← src
   *   0x4a932..0x4a946  copy +0x30 / +0x38 / +0x40 (three qwords)
   *   0x4a94a  epilogue → retq
   */
  private _copy_from(src: PCImageAttributes): void {
    // @0x4a903..@0x4a906 — 16-byte copy at +0x00.
    this.field_0x00 = src.field_0x00;
    this.field_0x04 = src.field_0x04;
    this.field_0x08 = src.field_0x08;
    this.field_0x0c = src.field_0x0c;
    // @0x4a909..@0x4a90d — 8-byte copy at +0x10 (+0x10, +0x14).
    this.field_0x10 = src.field_0x10;
    this.field_0x14 = src.field_0x14;
    // @0x4a911..@0x4a91c — copy +0x18 raw pointer; null-check.
    this.colorSpace_at_0x18 = { cgColorSpace: src.colorSpace_at_0x18.cgColorSpace };
    // @0x4a91e — retain if non-null.
    if (src.colorSpace_at_0x18.cgColorSpace !== null) {
      PCCFRefTraits_CGColorSpace_retain_stub(
        src.colorSpace_at_0x18.cgColorSpace,
      );
    }
    // @0x4a923..@0x4a927 — copy +0x20/+0x24.
    this.field_0x20 = src.field_0x20;
    this.field_0x24 = src.field_0x24;
    // @0x4a92b..@0x4a92f — copy +0x28.
    this.flag_0x28 = src.flag_0x28;
    // @0x4a932..@0x4a946 — copy +0x30/+0x38/+0x40.
    this.field_0x30 = src.field_0x30;
    this.field_0x38 = src.field_0x38;
    this.field_0x40 = src.field_0x40;
  }

  /**
   * `PCImageAttributes::operator=(PCImageAttributes const&)` @ProCore 0x4a95a.
   *
   * Full body (all @ProCore):
   *   0x4a95a  prologue (r14/rbx)
   *   0x4a961  movq %rdi,%rbx
   *   0x4a964  cmpq %rsi,%rdi
   *   0x4a967  je 0x4a9ae                       ; self-assign guard
   *   0x4a969  movq %rsi,%r14
   *   0x4a96c..0x4a976  copy +0x00..+0x17 via xmm+qword.
   *   0x4a97a  addq $0x18,%rsi                  ; rsi = &src.+0x18
   *   0x4a97e  leaq 0x18(%rbx),%rdi             ; rdi = &this.+0x18
   *   0x4a982  callq PCCFRef<CGColorSpace*>::operator=(PCCFRef const&)
   *                                              ; assign colorSpace
   *   0x4a987..0x4a9aa  copy +0x20..+0x47 (five qwords + 1 byte).
   *   0x4a9ae  movq %rbx,%rax                   ; return this
   *   0x4a9b1  epilogue → retq
   */
  operator_assign(rhs: PCImageAttributes): PCImageAttributes {
    // @0x4a964 — self-assign guard.
    if (this !== rhs) {
      // @0x4a96c..@0x4a976 — copy +0x00..+0x17 (via xmm + qword).
      this.field_0x00 = rhs.field_0x00;
      this.field_0x04 = rhs.field_0x04;
      this.field_0x08 = rhs.field_0x08;
      this.field_0x0c = rhs.field_0x0c;
      this.field_0x10 = rhs.field_0x10;
      this.field_0x14 = rhs.field_0x14;
      // @0x4a97a..@0x4a982 — colorSpace assignment via
      //   PCCFRef<CGColorSpace*>::operator=(PCCFRef const&).
      PCCFRef_CGColorSpace_assign_stub(
        this.colorSpace_at_0x18,
        rhs.colorSpace_at_0x18,
      );
      // @0x4a987..@0x4a9aa — copy the remaining fields.
      this.field_0x20 = rhs.field_0x20;
      this.field_0x24 = rhs.field_0x24;
      this.flag_0x28 = rhs.flag_0x28;
      this.field_0x30 = rhs.field_0x30;
      this.field_0x38 = rhs.field_0x38;
      this.field_0x40 = rhs.field_0x40;
    }
    // @0x4a9ae — return this.
    return this;
  }

  /**
   * `PCImageAttributes::operator==(PCImageAttributes const&) const`
   * @ProCore 0x4a9b6.
   *
   * Full body (all @ProCore):
   *   0x4a9b6  movl (%rdi),%eax ; cmpl (%rsi),%eax ; jne 0x4aa12
   *                                              ; short-circuit at +0x00
   *                                              ; if unequal → return 0
   *   0x4a9bc  prologue (r14/rbx)
   *   0x4a9c3  movq %rsi,%rbx ; movq %rdi,%r14
   *   0x4a9c9  cmp +0x04 as u32 ; jne 0x4aa15   ; short-circuit → return 0
   *   0x4a9d1  cmp +0x08 as u32 ; jne 0x4aa15
   *   0x4a9da  cmp +0x0c as u32 ; jne 0x4aa15
   *   0x4a9e3  cmp +0x10 as u32 ; jne 0x4aa15
   *   0x4a9ec  cmp +0x14 as u32 ; jne 0x4aa15
   *   0x4a9f5  leaq +0x18 for each ; callq PCColorSpaceHandle::isSameColorSpace
   *   0x4aa02  testb %al,%al ; je 0x4aa15
   *   0x4aa06  movl +0x20(%r14),%eax ; cmpl +0x20(%rbx),%eax ; sete %al
   *   0x4aa10  jmp 0x4aa17                      ; return al
   *   0x4aa12  xorl %eax,%eax ; retq            ; return 0 (early exit)
   *   0x4aa15  xorl %eax,%eax                   ; fall into cleanup
   *   0x4aa17  epilogue → retq
   *
   * NOTE: the u32 at +0x00 is compared BEFORE the prologue — if it
   * differs the function returns 0 WITHOUT establishing a frame. This
   * is faithful in the transcription.
   *
   * Fields NOT compared by ==: +0x24, +0x28, +0x30, +0x38, +0x40.
   * (Confirmed by walking every cmp/callq in the body.)
   */
  operator_equals(rhs: PCImageAttributes): boolean {
    // @0x4a9b6..@0x4a9ba — early-exit compare at +0x00.
    if (this.field_0x00 !== rhs.field_0x00) return false;
    // @0x4a9c9..@0x4a9f3 — sequence of u32 compares.
    if (this.field_0x04 !== rhs.field_0x04) return false;
    if (this.field_0x08 !== rhs.field_0x08) return false;
    if (this.field_0x0c !== rhs.field_0x0c) return false;
    if (this.field_0x10 !== rhs.field_0x10) return false;
    if (this.field_0x14 !== rhs.field_0x14) return false;
    // @0x4a9f5..@0x4aa04 — PCColorSpaceHandle::isSameColorSpace.
    if (
      !PCColorSpaceHandle_isSameColorSpace_stub(
        this.colorSpace_at_0x18,
        rhs.colorSpace_at_0x18,
      )
    ) {
      return false;
    }
    // @0x4aa06..@0x4aa10 — compare +0x20 as i32; result → al.
    return this.field_0x20 === rhs.field_0x20;
  }

  /**
   * `PCImageAttributes::getCacheHashKey() const` @ProCore 0x4aa1c.
   *
   * Full body (all @ProCore):
   *   0x4aa1c  prologue (r14/rbx)
   *   0x4aa23  ____chkstk_darwin(0x1050)         ; alloc 0x1050-byte frame
   *                                                for the PCHashWriteStream
   *   0x4aa30  movq %rsi,%r14 ; movq %rdi,%rbx  ; r14=this, rbx=&out
   *   0x4aa36  stack-guard load into -0x18(%rbp)
   *   0x4aa44  leaq -0x1058(%rbp),%rdi           ; rdi = &stream
   *   0x4aa4b  callq PCHashWriteStream::PCHashWriteStream()
   *   0x4aa50  writeValue(int)      +0x00 of this   ; hash +0x00 as i32
   *   0x4aa5f  writeValue(uint32)   +0x04                   as u32
   *   0x4aa6f  writeValue(uint32)   +0x08                   as u32
   *   0x4aa7f  writeValue(uint32)   +0x0c                   as u32
   *   0x4aa8f  writeValue(uint32)   +0x10                   as u32
   *   0x4aa9f  writeValue(bool)     +0x28                   as bool
   *   0x4aab0  leaq 0x18(%r14),%rdi ; callq PCColorSpaceHandle::getCGColorSpace
   *   0x4aac0  writeValue(void*)    result of getCGColorSpace()
   *   0x4aac8  writeValue(int)      +0x20                   as i32
   *   0x4aad8  writeValue(int)      +0x14                   as i32  (LAST)
   *   0x4aae8  callq PCHashWriteStream::getHash()  → xmm0 = 16 bytes
   *   0x4aaf4  movups (%rax),%xmm0 ; movups %xmm0,(%rbx)
   *                                              ; copy 16-byte hash into out
   *   0x4aafa  callq PCHashWriteStream::~PCHashWriteStream()
   *   0x4ab06  stack-guard check; retq            ; return &out (= %rbx)
   *
   * Hash includes: +0x00, +0x04, +0x08, +0x0c, +0x10, +0x28 (bool),
   *   the raw CGColorSpace* from the colorSpace, +0x20, +0x14.
   * Hash EXCLUDES: +0x24, +0x30, +0x38, +0x40.
   *
   * NOTE the ordering: +0x14 is written LAST, AFTER +0x20 — this is a
   * quirk of the compiled function and is preserved verbatim below.
   */
  getCacheHashKey(): PCHash {
    // @0x4aa4b — construct stream.
    const stream: PCHashWriteStream = {};
    PCHashWriteStream_ctor_stub(stream);
    try {
      // @0x4aa50..@0x4aa5a — writeValue(int) of +0x00 (SIGNED — the i
      //  overload is used only for +0x00, +0x20, +0x14; the others are j).
      PCHashWriteStream_writeValue_i32_stub(stream, this.field_0x00);
      // @0x4aa5f..@0x4aa6a — writeValue(u32) of +0x04.
      PCHashWriteStream_writeValue_u32_stub(stream, this.field_0x04);
      // @0x4aa6f..@0x4aa7a — writeValue(u32) of +0x08.
      PCHashWriteStream_writeValue_u32_stub(stream, this.field_0x08);
      // @0x4aa7f..@0x4aa8a — writeValue(u32) of +0x0c.
      PCHashWriteStream_writeValue_u32_stub(stream, this.field_0x0c);
      // @0x4aa8f..@0x4aa9a — writeValue(u32) of +0x10.
      PCHashWriteStream_writeValue_u32_stub(stream, this.field_0x10);
      // @0x4aa9f..@0x4aaab — writeValue(bool) of +0x28.
      PCHashWriteStream_writeValue_bool_stub(stream, this.flag_0x28);
      // @0x4aab0..@0x4aac3 — writeValue(void*) of colorSpace.getCGColorSpace().
      const cgcs = PCColorSpaceHandle_getCGColorSpace_stub(
        this.colorSpace_at_0x18,
      );
      PCHashWriteStream_writeValue_ptr_stub(stream, cgcs);
      // @0x4aac8..@0x4aad3 — writeValue(int) of +0x20 (SIGNED).
      PCHashWriteStream_writeValue_i32_stub(stream, this.field_0x20);
      // @0x4aad8..@0x4aae3 — writeValue(int) of +0x14 (SIGNED — written LAST).
      PCHashWriteStream_writeValue_i32_stub(stream, this.field_0x14);
      // @0x4aae8..@0x4aaf7 — read 16-byte hash + copy into return slot.
      return PCHashWriteStream_getHash_stub(stream);
    } finally {
      // @0x4aafa..@0x4ab01 — dtor. Faithful to the direct-call
      //  __ZN17PCHashWriteStreamD1Ev at the epilogue AND the two landing
      //  pads @0x4ab32/@0x4ab39.
      PCHashWriteStream_dtor_stub(stream);
    }
  }
}
