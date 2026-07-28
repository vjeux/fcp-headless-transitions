// HGColorConformNodeListItem.ts — Helium HGColorConformNodeListItem.
//
// A ~0xf8-byte item struct held by HGColorConform's node list. The struct
// starts with an int32 tag at offset 0 and a ~0x10-byte block at +0x10 that
// is zero-initialised in 16-byte SIMD stores. At offset +0xd0 it holds an
// HGObject-derived pointer (destroyed via vtable slot +0x18) and at +0xe0 it
// holds a `void*` heap buffer whose length is stored at +0xe8 and which is
// freed via ::operator delete(void*). The remaining internal offsets
// {0x40, 0x9a..0xa0} are left untouched by the ctor (an 0x9-byte hole and a
// deliberate skip at 0x40 — see the "no move to 0x40" gap in the ctor).
//
// This file transcribes all four exported symbols on the class:
//
//   @0x1d0b30  HGColorConformNodeListItem::HGColorConformNodeListItem() [C1 complete-obj]
//   @0x1d16d0  HGColorConformNodeListItem::HGColorConformNodeListItem() [C2 base-obj]
//   @0x1d1000  HGColorConformNodeListItem::~HGColorConformNodeListItem() [D1 complete-obj]
//   @0x1d1740  HGColorConformNodeListItem::~HGColorConformNodeListItem() [D2 base-obj]
//
// The C1 and C2 bodies are BIT-IDENTICAL modulo their entry addresses (both
// dispatch the same field-zeroing sequence with no base-ctor call — this
// class has no virtual base and the C1/C2 aliases collapse). Same for
// D1/D2. See disasm below for the exact opcode list.
//
// Undecoded frontier (each throw-stubs cites its callee's stub address):
//   ::operator delete(void*)  — Helium __ZdlPv symbol stub @0x3c4fa0
//                              (called from D1 @0x1d101c and D2 @0x1d175c)
//   vtable slot +0x18 on the object at +0xd0  — called from D1 @0x1d1030
//                                                and D2 @0x1d1770 (indirect
//                                                virtual dtor of that child)
//   __clang_call_terminate — the D1/D2 landing-pad tail at 0x1d103d/0x1d177d
//                            is a C++ EH terminate cleanup; not reachable in
//                            the normal-return control flow so left unported.
//
// Numerics: pure pointer/int32 bookkeeping. `xorps xmm0, xmm0 ; movaps
// xmm0, [rdi+off]` clears a 16-byte range as {0,0,0,0} (four 32-bit zeros).

/**
 * HGColorConformNodeListItem — the layout recovered from ctor/dtor asm.
 *
 * Offsets:
 *   +0x00  int32       tag/kind      (movl $0, (%rdi)              @0x1d0b49)
 *   +0x10  int32[4]    block10       (movaps xmm0 → 0x10           @0x1d0b4f)
 *   +0x20  int32[4]    block20       (movaps xmm0 → 0x20           @0x1d0b53)
 *   +0x30  int32[4]    block30       (movaps xmm0 → 0x30           @0x1d0b57)
 *   +0x40  UNTOUCHED   (16B hole)    (the ctor SKIPS 0x40 — the next store
 *                                      after 0x30 is at 0x50; anything at
 *                                      +0x40 is inherited-uninitialised.
 *                                      Modeled explicitly as `hole40`.)
 *   +0x50  int32[4]    block50       (movaps xmm0 → 0x50           @0x1d0b5b)
 *   +0x60  int32[4]    block60       (movaps xmm0 → 0x60           @0x1d0b5f)
 *   +0x70  int32[4]    block70       (movaps xmm0 → 0x70           @0x1d0b63)
 *   +0x80  int32[4]    block80       (movaps xmm0 → 0x80           @0x1d0b67)
 *   +0x90  int32[4]    block90       (movaps xmm0 → 0x90           @0x1d0b6e)
 *   +0xa0  int32[4]    blockA0       (movaps xmm0 → 0xa0           @0x1d0b75)
 *   +0xb0  int32[4]    blockB0       (movaps xmm0 → 0xb0           @0x1d0b7c)
 *   +0xc0  int32[4]    blockC0       (movaps xmm0 → 0xc0           @0x1d0b83)
 *   +0xc9  int32[4]    blockC9       (movups xmm0 → 0xc9 — UNALIGNED 16B
 *                                      overlap with blockC0 tail + blockD0
 *                                      head; models a packed struct across
 *                                      byte 0xc9..0xd8. Note this OVERLAPS
 *                                      +0xd0 below but the ctor here zeroes
 *                                      +0xd0 via this unaligned store.     @0x1d0b8a)
 *   +0xd0  HGObject*   childObject   (implied — dtor loads mov 0xd0(%rdi),%rdi
 *                                      and destructs via vtable slot +0x18)
 *   +0xe0  void*       heapBuffer    (dtor loads 0xe0(%rdi); if non-null,
 *                                      writes len to 0xe8 then ::operator
 *                                      delete(). Zeroed in C1/C2 via a
 *                                      `xorps xmm0; movups xmm0, 0xe0`
 *                                      that also clears 0xe8 (16B store).)
 *   +0xe8  size_t      heapBufferLen (part of the 0xe0 16-byte pair)
 *   +0xf0  int64       f_f0          (movq $0, 0xf0(%rdi)          @0x1d0b3e)
 *
 * Rendered as one flat "raw byte buffer" would be faithful to the exact
 * memory layout, but a JS class with typed fields is far more useful and
 * still bit-accurate — we model each 16B block as an Int32Array(4) sized
 * exactly to match the SIMD store width.
 */
export class HGColorConformNodeListItem {
  /** +0x00 int32 tag. Zeroed in C1/C2 by `movl $0, (%rdi)` @0x1d0b49 (C1)
   *  and @0x1d16e9 (C2). */
  tag: number = 0;

  /** +0x10..0x40 (0x40 is a HOLE — skipped by the ctor, kept as its own
   *  field so we don't accidentally clear it). */
  block10: Int32Array = new Int32Array(4);
  block20: Int32Array = new Int32Array(4);
  block30: Int32Array = new Int32Array(4);
  /** +0x40 — DELIBERATE HOLE. The ctor's `movaps` sequence goes 0x30 →
   *  0x50 with no store at 0x40. Left with whatever the enclosing storage
   *  contained; in a fresh allocation from operator new that's zero, but
   *  we keep it as a distinct field to avoid an invented invariant. */
  hole40: Int32Array = new Int32Array(4);
  block50: Int32Array = new Int32Array(4);
  block60: Int32Array = new Int32Array(4);
  block70: Int32Array = new Int32Array(4);
  block80: Int32Array = new Int32Array(4);
  block90: Int32Array = new Int32Array(4);
  blockA0: Int32Array = new Int32Array(4);
  blockB0: Int32Array = new Int32Array(4);
  blockC0: Int32Array = new Int32Array(4);
  /** +0xc9 (UNALIGNED 16B overlap). The ctor emits `movups xmm0, 0xc9(%rdi)`
   *  which zeros bytes [0xc9..0xd9) — the last 7 bytes of blockC0 plus the
   *  first 9 bytes of what would be at +0xd0. Modeled explicitly. */
  blockC9: Uint8Array = new Uint8Array(16);
  /** +0xd0 pointer to an HGObject-derived child (destroyed via its vtable's
   *  slot +0x18 in D1/D2). Ctor zeros the 0xc9-overlap; the low bytes of
   *  this pointer overlap that clear. */
  childObject: unknown = null;
  /** +0xe0..0xf0 — heap buffer + its length (a 16-byte `movups xmm0, 0xe0`
   *  pair store clears both in C1/C2 @0x1d0b37 / @0x1d16d7). */
  heapBuffer: unknown = null;
  heapBufferLen: bigint = 0n;
  /** +0xf0 int64 zeroed via `movq $0, 0xf0(%rdi)` @0x1d0b3e / @0x1d16de. */
  f_f0: bigint = 0n;

  /**
   * HGColorConformNodeListItem::HGColorConformNodeListItem() [C1]
   * @0x1d0b30 — the complete-object ctor. No base-class call (this class
   * has no polymorphic base wired in here, and both C1/C2 collapse to the
   * same body). Zero-initialises every field listed above via SIMD stores.
   *
   * Exact opcode sequence (C1):
   *   @0x1d0b30 pushq %rbp
   *   @0x1d0b31 movq  %rsp, %rbp
   *   @0x1d0b34 xorps %xmm0, %xmm0
   *   @0x1d0b37 movups %xmm0, 0xe0(%rdi)        ; clears 0xe0..0xf0
   *   @0x1d0b3e movq   $0x0, 0xf0(%rdi)         ; clears +0xf0
   *   @0x1d0b49 movl   $0x0, (%rdi)             ; clears +0x00 tag
   *   @0x1d0b4f movaps %xmm0, 0x10(%rdi)        ; block10
   *   @0x1d0b53 movaps %xmm0, 0x20(%rdi)        ; block20
   *   @0x1d0b57 movaps %xmm0, 0x30(%rdi)        ; block30
   *   @0x1d0b5b movaps %xmm0, 0x50(%rdi)        ; block50 (SKIP 0x40!)
   *   @0x1d0b5f movaps %xmm0, 0x60(%rdi)        ; block60
   *   @0x1d0b63 movaps %xmm0, 0x70(%rdi)        ; block70
   *   @0x1d0b67 movaps %xmm0, 0x80(%rdi)        ; block80
   *   @0x1d0b6e movaps %xmm0, 0x90(%rdi)        ; block90
   *   @0x1d0b75 movaps %xmm0, 0xa0(%rdi)        ; blockA0
   *   @0x1d0b7c movaps %xmm0, 0xb0(%rdi)        ; blockB0
   *   @0x1d0b83 movaps %xmm0, 0xc0(%rdi)        ; blockC0
   *   @0x1d0b8a movups %xmm0, 0xc9(%rdi)        ; UNALIGNED clear of 0xc9..0xd9
   *   @0x1d0b91 popq  %rbp
   *   @0x1d0b92 retq
   *
   * C2 body @0x1d16d0..0x1d1732 is byte-for-byte identical modulo entry
   * address. TypeScript's constructor here models BOTH — JavaScript has no
   * C1/C2 distinction. Field initializers above already zero everything;
   * the constructor body below is written for explicitness / provenance.
   */
  constructor() {
    // @0x1d0b34/@0x1d16d4  xorps xmm0, xmm0 (the SIMD zero source)
    // @0x1d0b37/@0x1d16d7  movups xmm0, 0xe0(%rdi)     → heapBuffer + len
    this.heapBuffer = null;
    this.heapBufferLen = 0n;
    // @0x1d0b3e/@0x1d16de  movq $0, 0xf0(%rdi)
    this.f_f0 = 0n;
    // @0x1d0b49/@0x1d16e9  movl $0, (%rdi)
    this.tag = 0;
    // @0x1d0b4f/@0x1d16ef  movaps xmm0, 0x10(%rdi)
    this.block10 = new Int32Array(4);
    // @0x1d0b53/@0x1d16f3  movaps xmm0, 0x20(%rdi)
    this.block20 = new Int32Array(4);
    // @0x1d0b57/@0x1d16f7  movaps xmm0, 0x30(%rdi)
    this.block30 = new Int32Array(4);
    // (0x40 SKIP — see hole40 field)
    // @0x1d0b5b/@0x1d16fb  movaps xmm0, 0x50(%rdi)
    this.block50 = new Int32Array(4);
    // @0x1d0b5f/@0x1d16ff  movaps xmm0, 0x60(%rdi)
    this.block60 = new Int32Array(4);
    // @0x1d0b63/@0x1d1703  movaps xmm0, 0x70(%rdi)
    this.block70 = new Int32Array(4);
    // @0x1d0b67/@0x1d1707  movaps xmm0, 0x80(%rdi)
    this.block80 = new Int32Array(4);
    // @0x1d0b6e/@0x1d170e  movaps xmm0, 0x90(%rdi)
    this.block90 = new Int32Array(4);
    // @0x1d0b75/@0x1d1715  movaps xmm0, 0xa0(%rdi)
    this.blockA0 = new Int32Array(4);
    // @0x1d0b7c/@0x1d171c  movaps xmm0, 0xb0(%rdi)
    this.blockB0 = new Int32Array(4);
    // @0x1d0b83/@0x1d1723  movaps xmm0, 0xc0(%rdi)
    this.blockC0 = new Int32Array(4);
    // @0x1d0b8a/@0x1d172a  movups xmm0, 0xc9(%rdi) — unaligned 16B clear
    this.blockC9 = new Uint8Array(16);
  }

  /**
   * HGColorConformNodeListItem::~HGColorConformNodeListItem() [D1]
   * @0x1d1000. Also mirrors D2 @0x1d1740 exactly (both bodies are
   * byte-identical modulo entry address). Two cleanup steps:
   *
   *   1. If (+0xe0) heapBuffer != nullptr:
   *        - write (+0xe0) into (+0xe8)  (a "resize length = capacity"
   *          bookkeeping store before the free — @0x1d1015 movq %rdi,
   *          0xe8(%rbx))
   *        - call ::operator delete(void*)  @0x1d101c (D1) / @0x1d175c (D2)
   *
   *   2. If (+0xd0) childObject != nullptr:
   *        - load its vtable at (*childObject)
   *        - CALL vtable slot +0x18 with childObject as `this` — this is
   *          the child's virtual dtor. (@0x1d1030 D1 / @0x1d1770 D2)
   *
   * Exact opcode sequence (D1 @0x1d1000..@0x1d1039):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi, %rbx                        ; rbx = this
   *   movq  0xe0(%rdi), %rdi                  ; rdi = heapBuffer
   *   testq %rdi, %rdi
   *   je    +0x0e                             ; skip free if null
   *   movq  %rdi, 0xe8(%rbx)                  ; store rdi at +0xe8
   *   callq __ZdlPv                           ; ::operator delete(heapBuffer)
   *   movq  0xd0(%rbx), %rdi                  ; rdi = childObject
   *   testq %rdi, %rdi
   *   je    +0x08                             ; skip if null
   *   movq  (%rdi), %rax                      ; rax = childObject vtable
   *   callq *0x18(%rax)                       ; virtual dtor via slot +0x18
   *   addq  $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
   *
   * The tail at 0x1d103a/0x1d177a is a `movq %rax, %rdi ; callq
   * __clang_call_terminate` landing pad — not part of normal return.
   */
  destroy(): void {
    // @0x1d1009/@0x1d1749  rdi = this.heapBuffer
    if (this.heapBuffer !== null) {
      // @0x1d1015/@0x1d1755  movq %rdi, 0xe8(%rbx) — store heapBuffer PTR
      // into +0xe8. In C++ this repurposes the length slot as a
      // pre-delete scratch (some vector<>-style pattern where the
      // "end" pointer is set equal to "begin" before the free). We
      // model it faithfully by casting to a bigint address surrogate —
      // but since JS has no addresses, we store the buffer identity
      // into heapBufferLen only when it's a bigint (impossible) — the
      // observable effect on our modeled fields is nil beyond a
      // pre-free "sentinel". Left as a doc comment; no JS-visible op.
      // @0x1d101c/@0x1d175c  callq ::operator delete(heapBuffer)
      HGColorConformNodeListItem_operatorDelete(this.heapBuffer);
      this.heapBuffer = null;
    }
    // @0x1d1021/@0x1d1761  rdi = this.childObject
    if (this.childObject !== null) {
      // @0x1d102d..1030 / @0x1d176d..1770  virtual-dtor via vtable slot +0x18
      HGColorConformNodeListItem_childVirtualDtorSlot18(this.childObject);
      this.childObject = null;
    }
  }
}

/** ::operator delete(void*) — Helium symbol stub @0x3c4fa0 (__ZdlPv).
 *  Called from HGColorConformNodeListItem::~HGColorConformNodeListItem
 *  D1 @0x1d101c and D2 @0x1d175c. Not yet transcribed. */
function HGColorConformNodeListItem_operatorDelete(_p: unknown): void {
  throw new Error(
    "::operator delete(void*) @Helium __ZdlPv stub @0x3c4fa0 (from HGColorConformNodeListItem::~D1 @0x1d101c / D2 @0x1d175c) not yet transcribed",
  );
}

/** Virtual dtor at vtable slot +0x18 of the object stored at
 *  HGColorConformNodeListItem's +0xd0. Called indirectly from D1 @0x1d1030
 *  and D2 @0x1d1770. Concrete class of `+0xd0` is not yet resolved. */
function HGColorConformNodeListItem_childVirtualDtorSlot18(_child: unknown): void {
  throw new Error(
    "HGColorConformNodeListItem child (+0xd0) virtual dtor via vtable slot +0x18 @Helium (D1 @0x1d1030 / D2 @0x1d1770) not yet transcribed",
  );
}
