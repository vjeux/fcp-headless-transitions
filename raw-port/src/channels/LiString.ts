// LiString — Ozone.framework class: a refcounted copy-on-write byte string.
// Layout is a single-pointer-to-heap-block, where the heap block carries three
// int32 metadata slots IMMEDIATELY BEFORE the character buffer:
//
//    buffer[-0xc]  int32  refcount  // atomic; lock-decl'd on destroy, xchg'd on init.
//    buffer[-0x8]  int32  length    // number of bytes stored (excluding NUL terminator).
//    buffer[-0x4]  int32  capacity  // allocated capacity for characters (excluding NUL).
//    buffer[0..length]  char[]      // characters, always NUL-terminated at buffer[length].
//
// The public LiString object owns only a single pointer (%rdi + 0x00) — the
// character buffer, i.e. `(%rdi)`. To reach the metadata prefix, code subtracts
// (0xc, 0x8, or 0x4). The pointer itself is nullable (0 == empty/unattached
// string); every method checks it before dereferencing.
//
// Ref-counting protocol observed here:
//   ~LiString    @0x1e40c0  : atomically `refcount -= 1`; if 0, then also zero
//                             the first char (`buffer[0] = 0`) and zero the
//                             length (`buffer[-0x8] = 0`), then `_free(buffer
//                             - 0xc)` — the block base — and null out
//                             `(*this)`. If not 0, just return.
//   append       @0x1e5dc0  : three-branch COW body:
//                             (a) buffer==NULL: `_malloc(len+13)`, init prefix
//                                 (refcount=1, length=len, capacity=len+1),
//                                 memcpy src->buffer, NUL-terminate.
//                             (b) buffer!=NULL AND (oldLen+len) <= capacity:
//                                 mutate in place — memcpy src to buffer+oldLen,
//                                 update length, NUL-terminate.
//                             (c) buffer!=NULL AND (oldLen+len) > capacity:
//                                 allocate a fresh block; copy the OLD contents
//                                 then the NEW appendee; publish the new block
//                                 (with an xchgl gymnastic to swap refcount);
//                                 drop the OLD block's ref (identical to the
//                                 dtor's decl+cleanup), then bump new block's
//                                 refcount.
//                             Silently returns if src==NULL or len==0.
//
// Framework: Final Cut Pro / Ozone.framework
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/…/Ozone
//
// Source disassembly (via raw-port/tools/disasm.sh):
//   __ZN8LiStringD1Ev          @0x00000000001e40c0
//   __ZN8LiString6appendEPKci  @0x00000000001e5dc0
//
// (Only these two methods are exported for LiString in Ozone's symbol table;
// there is no ctor, copy-ctor, or D0 variant present, so this file transcribes
// exactly the two decoded bodies — no invented ctors, no invented accessors.)
//
// Frontier callees (all C stdlib symbol stubs; call sites cited inline):
//   _malloc  stub 0x6dff7e  @0x1e5e2e (append/malloc-fresh)
//                            @0x1e5e78 (append/malloc-grow)
//   _memcpy  stub 0x6dff8a  @0x1e5e09 (append/inplace)
//                            @0x1e5e55 (append/fresh-copy-appendee)
//                            @0x1e5ea6 (append/grow-copy-old)
//                            @0x1e5ebf (append/grow-copy-appendee)
//   _free    stub 0x6dfe3a  @0x1e40f6 (dtor)
//                            @0x1e5ef2 (append/grow-drop-old-block)

// Runtime C stdlib surface. Modeled here as an opaque byte-buffer with a base
// pointer + read/write primitives — enough to faithfully transcribe the metadata
// prefix layout and character storage without inventing a JS-native String.

/**
 * A raw byte block returned by _malloc. Sized in bytes. `base` is byte offset 0.
 * The LiString "buffer" pointer stored in (*this) always lands at base+0xc
 * (immediately after the 12-byte metadata prefix).
 */
export interface LiStringBlock {
  /** total allocation size in bytes (== the request handed to _malloc). */
  readonly size: number;
  /** raw byte view over the block, base at index 0. */
  readonly bytes: Uint8Array;
}

/**
 * `_malloc(n)` — libc / system runtime allocator. Called from LiString::append
 * @0x1e5e2e and @0x1e5e78. Faithful port keeps it as an opaque runtime
 * dependency (JS has no direct counterpart); we simulate with a Uint8Array of
 * the requested size, which suffices for the byte-level pointer arithmetic
 * LiString does.
 */
function _malloc(n: number): LiStringBlock {
  // stub 0x6dff7e — callq at @0x1e5e2e and @0x1e5e78.
  return { size: n, bytes: new Uint8Array(n) };
}

/**
 * `_free(p)` — libc / system runtime deallocator. Called from
 * @0x1e40f6 (dtor) and @0x1e5ef2 (append grow-drop-old-block). In JS there is
 * no explicit free — the block is simply dropped and GC reclaims it. We model
 * this as a no-op sink; the CALL SITE'S post-state (pointer nulled or replaced)
 * is what actually matters for observable behavior.
 */
function _free(_block: LiStringBlock | null): void {
  // stub 0x6dfe3a. Intentionally empty; GC handles reclamation. The C++
  // semantic (raw storage returned to allocator) has no observable
  // counterpart in JS beyond dropping the reference.
}

/**
 * `_memcpy(dst, src, n)` — libc byte copy. Called from
 * @0x1e5e09 (append/inplace), @0x1e5e55 (append/fresh-copy-appendee),
 * @0x1e5ea6 (append/grow-copy-old), @0x1e5ebf (append/grow-copy-appendee).
 * A faithful port models the byte-copy semantics directly on Uint8Array.
 *
 * The `src` here is the caller-supplied `char const*` — modeled as a
 * Uint8Array for symmetry (JS strings are UTF-16; the FCP API is byte-
 * oriented, so a caller must convert first — that conversion is not part of
 * LiString's own decoded surface).
 */
function _memcpy(dst: Uint8Array, dstOff: number, src: Uint8Array, srcOff: number, n: number): void {
  // stub 0x6dff8a. Straightforward byte copy. The asm passes raw pointers as
  // (dst, src, len) — here we split each pointer into (buffer, offset) since
  // JS has no raw pointer arithmetic.
  dst.set(src.subarray(srcOff, srcOff + n), dstOff);
}

// -----------------------------------------------------------------------------
// LiString itself.
// -----------------------------------------------------------------------------

/**
 * `LiString` — Ozone refcounted copy-on-write byte string.
 *
 * The one-and-only member is a pointer to a heap block whose metadata prefix
 * (refcount@-0xc, length@-0x8, capacity@-0x4) precedes the character buffer.
 * We model the pointer as `{ block, off }` — `block` is the underlying
 * LiStringBlock (== the address returned by _malloc, aka `buffer - 0xc`) and
 * `off` is the fixed 0xc offset from block.base to the char buffer, which is
 * what (*this) stores in the C++ image. Nullability is preserved: `null` means
 * "unattached" (the initial state), matching the C++ `nullptr` sentinel that
 * the dtor's initial `testq %rax,%rax` @0x1e40c3 checks against and that
 * append's `if (buffer==NULL)` branch @0x1e5df0 handles.
 */
export class LiString {
  /**
   * Layout offset 0 in the C++ class — a single pointer to `buffer` (which is
   * the character array; the metadata prefix lives at buffer[-0xc..0]).
   *
   * We store both `block` (== buffer-0xc, the true allocation base) and the
   * fixed offset 0xc so pointer arithmetic in the ported dtor/append maps
   * one-for-one to the asm's `-0xc(%rax)` / `-0x8(%rax)` / `-0x4(%rax)` /
   * `(%rax,%rN)` accesses.
   *
   * `null` matches the C++ nullptr sentinel — the unattached state.
   */
  private buffer: { block: LiStringBlock; readonly bufferOff: 0xc } | null = null;

  // ---- prefix accessors (0xc/0x8/0x4-below-buffer int32 slots). ----
  // These are the *only* metadata slots the two decoded methods touch, and
  // every access is cited by @0xADDR in the caller sites below.

  /** refcount @ buffer[-0xc]. int32. Atomic increments/decrements per COW. */
  private static readPrefix_refcount(block: LiStringBlock): number {
    // metadata slot at block.base + 0x0 == buffer-0xc.
    const view = new DataView(block.bytes.buffer, block.bytes.byteOffset, block.bytes.byteLength);
    return view.getInt32(0x0, true);
  }
  private static writePrefix_refcount(block: LiStringBlock, v: number): void {
    const view = new DataView(block.bytes.buffer, block.bytes.byteOffset, block.bytes.byteLength);
    view.setInt32(0x0, v | 0, true);
  }
  /**
   * `lock decl -0xc(%rax)` — atomic decrement returning the *new* value (via
   * ZF, i.e. "je" on 0). Modeled here as a plain decrement returning the new
   * value; the atomicity is a property of the underlying memory model, not
   * of the arithmetic — JS's single-threaded model preserves it trivially.
   */
  private static atomicDec_refcount(block: LiStringBlock): number {
    const v = LiString.readPrefix_refcount(block) - 1;
    LiString.writePrefix_refcount(block, v);
    return v;
  }
  /**
   * `lock incl (%r15)` — atomic increment @0x1e5efb (append/grow tail).
   * Same model as atomicDec_refcount.
   */
  private static atomicInc_refcount(block: LiStringBlock): void {
    LiString.writePrefix_refcount(block, LiString.readPrefix_refcount(block) + 1);
  }
  /**
   * `xchgl (%r13/%r15), $imm` — atomic exchange into refcount slot used to
   * publish the newly-allocated block. Observed at:
   *   @0x1e5e3f  movl $0x1,%eax ; xchgl %eax,(%r13)   — fresh block, set rc=1.
   *   @0x1e5e8c  movl $0x1,%eax ; xchgl %eax,(%r15)   — grow block, set rc=1
   *                                                    (pre-swap).
   *   @0x1e5e99  xorl %eax,%eax ; xchgl %eax,(%r15)  — then clear to 0
   *                                                    before the copies (see
   *                                                    the grow branch note).
   */
  private static xchg_refcount(block: LiStringBlock, v: number): void {
    LiString.writePrefix_refcount(block, v | 0);
  }

  /** length @ buffer[-0x8]. int32. Bytes stored (excluding trailing NUL). */
  private static readPrefix_length(block: LiStringBlock): number {
    const view = new DataView(block.bytes.buffer, block.bytes.byteOffset, block.bytes.byteLength);
    // metadata slot at block.base + 0x4 == buffer-0x8.
    return view.getInt32(0x4, true);
  }
  private static writePrefix_length(block: LiStringBlock, v: number): void {
    const view = new DataView(block.bytes.buffer, block.bytes.byteOffset, block.bytes.byteLength);
    view.setInt32(0x4, v | 0, true);
  }

  /** capacity @ buffer[-0x4]. int32. Bytes reserved (excluding trailing NUL). */
  private static readPrefix_capacity(block: LiStringBlock): number {
    const view = new DataView(block.bytes.buffer, block.bytes.byteOffset, block.bytes.byteLength);
    // metadata slot at block.base + 0x8 == buffer-0x4.
    return view.getInt32(0x8, true);
  }
  private static writePrefix_capacity(block: LiStringBlock, v: number): void {
    const view = new DataView(block.bytes.buffer, block.bytes.byteOffset, block.bytes.byteLength);
    view.setInt32(0x8, v | 0, true);
  }

  /** buffer[i] (byte). i must satisfy 0 <= i <= capacity (NUL at [length]). */
  private static readBuf_byte(block: LiStringBlock, i: number): number {
    return block.bytes[0xc + i];
  }
  private static writeBuf_byte(block: LiStringBlock, i: number, v: number): void {
    block.bytes[0xc + i] = v & 0xff;
  }
  /** copy `src[srcOff..srcOff+n]` -> `buffer[i..i+n]`. */
  private static writeBuf_bytes(block: LiStringBlock, i: number, src: Uint8Array, srcOff: number, n: number): void {
    _memcpy(block.bytes, 0xc + i, src, srcOff, n);
  }

  /**
   * `~LiString()` — Ozone `__ZN8LiStringD1Ev` @0x1e40c0.
   *
   * Byte-for-byte transcription:
   *   @0x1e40c0  movq (%rdi),%rax           — load buffer pointer.
   *   @0x1e40c3  testq %rax,%rax            — buffer NULL?
   *   @0x1e40c6  je 0x1e4108                — yes -> retq (nothing to do).
   *   @0x1e40c8  lock decl -0xc(%rax)       — atomic refcount -= 1.
   *   @0x1e40cc  jne 0x1e4108               — new refcount != 0 -> retq (someone
   *                                            else still holds the block).
   *   -- refcount hit 0 branch --
   *   @0x1e40ce..@0x1e40d3  prologue (pushq %rbp/movq %rsp,%rbp/pushq %rbx/
   *                          pushq %rax for align).
   *   @0x1e40d4  movq (%rdi),%rax           — reload buffer (stack-safety
   *                                            reload after any earlier
   *                                            atomic op).
   *   @0x1e40d7  movb $0x0,(%rax)           — buffer[0] = 0 (zero the leading
   *                                            char BEFORE freeing — this is a
   *                                            defensive "make the string
   *                                            appear empty even if a stray
   *                                            reader races here" step; it
   *                                            has no post-condition effect
   *                                            since the block is about to be
   *                                            freed, but we transcribe it
   *                                            because it IS in the asm).
   *   @0x1e40da  movq (%rdi),%rcx           — reload buffer as %rcx.
   *   @0x1e40dd  movq $0x0,-0x8(%rcx)       — write 0 into the (int32 length,
   *                                            int32 capacity) pair as a
   *                                            single 8-byte store: length = 0
   *                                            AND capacity = 0.
   *   @0x1e40e5  leaq -0xc(%rcx),%rax       — compute block base = buffer - 0xc.
   *   @0x1e40e9  testq %rcx,%rcx            — buffer NULL? (defensive re-check
   *                                            after the reloads).
   *   @0x1e40ec  cmoveq %rcx,%rax           — if buffer==NULL, %rax = NULL
   *                                            (avoid computing NULL-0xc);
   *                                            otherwise keep block base.
   *   @0x1e40f0  movq %rdi,%rbx             — save `this`.
   *   @0x1e40f3  movq %rax,%rdi             — %rdi = block base (or NULL).
   *   @0x1e40f6  callq _free                — free the block.
   *   @0x1e40fb  movq $0x0,(%rbx)           — *this = NULL (drop buffer ptr).
   *   @0x1e4102..@0x1e4107  epilogue.
   *   @0x1e4108  retq.
   */
  destroy(): void {
    // @0x1e40c0..@0x1e40c6 — early-out on empty string.
    const b = this.buffer;
    if (b === null) return;

    // @0x1e40c8 / @0x1e40cc — atomic refcount decrement; return if still alive.
    const newRc = LiString.atomicDec_refcount(b.block);
    if (newRc !== 0) return;

    // @0x1e40d7 — buffer[0] = 0. Defensive zeroing before free.
    LiString.writeBuf_byte(b.block, 0, 0);

    // @0x1e40dd — length = 0 AND capacity = 0 (single 8-byte store of 0 into
    // the two adjacent int32 slots at buffer[-0x8..0]).
    LiString.writePrefix_length(b.block, 0);
    LiString.writePrefix_capacity(b.block, 0);

    // @0x1e40e5..@0x1e40f6 — free the whole block (the -0xc adjustment lands
    // us on the malloc'd base). The cmoveq NULL-guard is redundant here since
    // we already null-checked at entry, but the asm emits it anyway; we honor
    // the semantic (free is a no-op on NULL in the JS model).
    _free(b.block);

    // @0x1e40fb — *this = NULL.
    this.buffer = null;
  }

  /**
   * `LiString::append(char const* src, int len)` — Ozone
   * `__ZN8LiString6appendEPKci` @0x1e5dc0.
   *
   * Guard head:
   *   @0x1e5dc0  testq %rsi,%rsi ; sete %al       — src == NULL ?
   *   @0x1e5dc6  testl %edx,%edx ; sete %cl       — len == 0 ?
   *   @0x1e5dcb  orb %al,%cl ; jne 0x1e5f0c       — either -> retq (no-op).
   *
   * Three branches after the guard, selected by the state of this->buffer and
   * of its metadata:
   *
   * (a) buffer == NULL   (@0x1e5df0 je 0x1e5e1f):
   *     malloc(len+13); prefix slots refcount(xchg 1)/length(=len)/capacity(=len+1);
   *     memcpy(buffer, src, len); buffer[len] = 0; publish.
   *     -- reads: nothing (buffer was NULL).
   *     -- writes: *this = new buffer; prefix rc=1, length=len, capacity=len+1;
   *                buffer[0..len] = src; buffer[len] = 0.
   *
   * (b) buffer != NULL AND (oldLen + len) <= capacity  (@0x1e5e01 !jle):
   *     mutate in place — memcpy into buffer + oldLen; length = oldLen+len;
   *     NUL-terminate.
   *     -- reads: buffer, oldLen (@-0x8), capacity (@-0x4).
   *     -- writes: buffer[oldLen..oldLen+len] = src; buffer[oldLen+len] = 0;
   *                length = oldLen+len (via  movl %r13d, -0x8(%rax)  @0x1e5e11).
   *
   * (c) buffer != NULL AND (oldLen + len) > capacity  (@0x1e5e01 jle):
   *     malloc a fresh block with capacity = (oldLen+len)+1; xchg-publish rc=1
   *     THEN xchg it back to 0 (the "installed but not yet ref-owned"
   *     transient state — see the pair @0x1e5e8c/@0x1e5e99); publish `*this =
   *     new_buffer` @0x1e5e97 (movq %rdi,-0x30(%rbp)) — actually publish is
   *     via  movq %rdi,(%rbx)  a bit later @0x1e5ef7 — copy OLD content
   *     (`_memcpy(new_buffer, old_buffer, oldLen)` @0x1e5ea6), then copy the
   *     new appendee (`_memcpy(new_buffer+oldLen, src, len)` @0x1e5ebf),
   *     NUL-terminate at new_buffer[oldLen+len]. Then drop the OLD block's
   *     refcount (same dtor-shape at @0x1e5ed0..@0x1e5ef2 — zero buffer[0],
   *     zero length+capacity, free old block); finally atomic-inc new block's
   *     refcount @0x1e5efb — putting it at 1.
   *     -- The xchg-to-0-then-inc-to-1 dance keeps the ABI-mandated "no other
   *        thread ever sees a refcount of exactly 1 before publication"
   *        invariant that Ozone's readers rely on.
   *
   * All three branches fall through to the common epilogue @0x1e5efe..@0x1e5f0c.
   *
   * @param src  UTF-8-ish byte source (`char const*` in the C++ API); JS
   *             callers must convert their JS string to bytes first — the
   *             conversion is NOT part of this decoded method.
   * @param len  number of bytes to append from src.
   */
  append(src: Uint8Array | null, len: number): void {
    // @0x1e5dc0..@0x1e5dcd — src==NULL or len==0 fast-out.
    if (src === null || (len | 0) === 0) return;

    const r15 = len | 0;                               // %r15d = len (as int32).

    // @0x1e5dea — %r14 = (*this) — the current buffer pointer.
    const currentBuf = this.buffer;

    // @0x1e5df0 — testq %r14,%r14 ; je 0x1e5e1f  — branch on buffer==NULL.
    if (currentBuf === null) {
      // ---- branch (a): buffer == NULL, allocate a fresh block. ----
      // @0x1e5e1f  leal 0x1(%r15),%r12d       — %r12d = len + 1 (this becomes
      //                                          capacity+1 -> stored at -0x4
      //                                          later as length+1... actually
      //                                          @0x1e5e36 movl %r12d,0x8(%rax)
      //                                          writes it to block.base+0x8,
      //                                          i.e. buffer-0x4 = capacity).
      // @0x1e5e23  movslq %r15d,%r14           — sign-extend len -> %r14 (used
      //                                          as the memcpy `n`).
      // @0x1e5e26  leaq 0xd(%r14),%rdi         — malloc size = len + 0xd
      //                                          = 12-byte prefix + len + 1
      //                                          NUL byte.
      // @0x1e5e2e  callq _malloc
      const capPlus1 = (r15 + 1) | 0;                  // %r12d after @0x1e5e1f.
      const blockSize = (r15 + 0xd) | 0;               // @0x1e5e26.
      const newBlock = _malloc(blockSize);             // @0x1e5e2e.

      // @0x1e5e36  movl %r12d, 0x8(%rax)       — block.base+0x8 == buffer-0x4
      //                                          == capacity  = len + 1.
      LiString.writePrefix_capacity(newBlock, capPlus1);

      // @0x1e5e3a..@0x1e5e3f  movl $0x1,%eax ; xchgl %eax,(%r13)
      //                                        — refcount = 1 (via xchg).
      LiString.xchg_refcount(newBlock, 1);

      // @0x1e5e43  leaq 0xc(%r13),%rdi         — %rdi = &buffer (== block.base+0xc).
      // @0x1e5e47  movq %rdi,(%rbx)            — *this = buffer.
      const newBuffer = { block: newBlock, bufferOff: 0xc as const };
      this.buffer = newBuffer;

      // @0x1e5e4a  movl %r15d, 0x4(%r13)       — block.base+0x4 == buffer-0x8
      //                                          == length = len.
      LiString.writePrefix_length(newBlock, r15);

      // @0x1e5e4e..@0x1e5e55  _memcpy(buffer, src, len).
      LiString.writeBuf_bytes(newBlock, 0, src, 0, r15);

      // @0x1e5e5a  movb $0x0, 0xc(%r13,%r14)  — buffer[len] = 0 (NUL terminate).
      LiString.writeBuf_byte(newBlock, r15, 0);

      // @0x1e5e60  jmp 0x1e5efe                — fallthrough to common epilogue.
      return;
    }

    // ---- shared preface for branches (b) and (c): read old length/capacity ----
    // @0x1e5df2  movslq -0x8(%r14),%r12        — %r12 = oldLen (int32 -> int64).
    // @0x1e5df6  movslq %r15d,%rdx             — %rdx = len (int32 -> int64).
    // @0x1e5df9  leaq (%r12,%rdx),%r13         — %r13 = oldLen + len.
    // @0x1e5dfd  cmpl %r13d, -0x4(%r14)        — capacity vs (oldLen+len).
    // @0x1e5e01  jle 0x1e5e65                  — grow branch if capacity <=
    //                                             (oldLen+len)  (i.e. NOT
    //                                             enough room).
    const oldLen = LiString.readPrefix_length(currentBuf.block);
    const capacity = LiString.readPrefix_capacity(currentBuf.block);
    const totalLen = (oldLen + r15) | 0;

    if (capacity > totalLen) {
      // ---- branch (b): in-place append. ----
      // @0x1e5e03  addq %r12, %r14              — %r14 = buffer + oldLen (dst).
      // @0x1e5e06  movq %r14, %rdi
      // @0x1e5e09  callq _memcpy                — memcpy(buffer+oldLen, src, len).
      LiString.writeBuf_bytes(currentBuf.block, oldLen, src, 0, r15);

      // @0x1e5e0e  movq (%rbx),%rax             — reload buffer (post-memcpy).
      // @0x1e5e11  movl %r13d, -0x8(%rax)       — length = oldLen + len.
      LiString.writePrefix_length(currentBuf.block, totalLen);

      // @0x1e5e15  movb $0x0, (%rax,%r13)       — buffer[oldLen+len] = 0 NUL.
      LiString.writeBuf_byte(currentBuf.block, totalLen, 0);

      // @0x1e5e1a  jmp 0x1e5efe                 — fallthrough to epilogue.
      return;
    }

    // ---- branch (c): grow (out-of-line) — realloc into fresh block. ----
    // @0x1e5e65  leal 0x1(%r13),%eax            — new-capacity = (oldLen+len)+1.
    // @0x1e5e69  movl %eax, -0x30(%rbp)         — spill new-capacity.
    // @0x1e5e6c  leaq 0xd(%r13),%rdi            — malloc size = (oldLen+len)+0xd
    //                                              = 12-byte prefix + total + NUL.
    // @0x1e5e78  callq _malloc.
    const newCap = (totalLen + 1) | 0;
    const growBlockSize = (totalLen + 0xd) | 0;
    const growBlock = _malloc(growBlockSize);

    // @0x1e5e83  movl -0x30(%rbp), %eax ; movl %eax, 0x8(%r15)
    //                                        — new_block.capacity = newCap.
    LiString.writePrefix_capacity(growBlock, newCap);

    // @0x1e5e87..@0x1e5e8c  movl $0x1,%eax ; xchgl %eax,(%r15)
    //                                        — new_block.refcount = 1 (xchg).
    LiString.xchg_refcount(growBlock, 1);

    // @0x1e5e8f  leaq 0xc(%r15),%rdi            — new_buffer_ptr = new_block+0xc.
    // @0x1e5e93  movq %rdi, -0x30(%rbp)         — spill new_buffer_ptr.
    const newGrowBuffer = { block: growBlock, bufferOff: 0xc as const };

    // @0x1e5e97..@0x1e5e99  xorl %eax,%eax ; xchgl %eax,(%r15)
    //                                        — refcount = 0 (transient
    //                                          "installed but not yet
    //                                          ref-owned" state; the final
    //                                          incl @0x1e5efb bumps to 1).
    LiString.xchg_refcount(growBlock, 0);

    // @0x1e5e9c  movl %r13d, 0x4(%r15)          — new_block.length = totalLen.
    LiString.writePrefix_length(growBlock, totalLen);

    // @0x1e5ea0..@0x1e5ea6  _memcpy(new_buffer, old_buffer, oldLen).
    LiString.writeBuf_bytes(growBlock, 0, currentBuf.block.bytes, 0xc, oldLen);

    // @0x1e5eab..@0x1e5ebf  _memcpy(new_buffer+oldLen, src, len).
    LiString.writeBuf_bytes(growBlock, oldLen, src, 0, r15);

    // @0x1e5ec4  movb $0x0, 0xc(%r15,%r13)      — new_buffer[totalLen] = 0.
    LiString.writeBuf_byte(growBlock, totalLen, 0);

    // @0x1e5eca..@0x1e5ecd  cmpq %r14,%r12 ; je 0x1e5efe
    //                                        — %r12 was reused as spilled
    //                                          new_buffer_ptr @0x1e5eb3
    //                                          (movq -0x30(%rbp),%r12), so
    //                                          the compare here is between the
    //                                          NEW buffer pointer and the OLD
    //                                          block base %r14 — they can't
    //                                          equal (fresh malloc), so this
    //                                          branch's je is essentially never
    //                                          taken in normal use; we DO
    //                                          transcribe it as a defensive
    //                                          identity guard: "if the fresh
    //                                          block accidentally aliases the
    //                                          old one, skip the old-drop".
    //                                          (@0x1e5eb3 is the reason %r12 no
    //                                          longer holds oldLen at this
    //                                          point — see the mov note.)
    // In the ported model we compare block identity directly: the fresh
    // growBlock is a NEW Uint8Array allocation and will not === the old block,
    // so the below drop-old-block sequence always runs when we take branch (c).
    if ((newGrowBuffer as unknown) !== (currentBuf as unknown)) {
      // @0x1e5ecf  lock decl -0xc(%r14)         — atomic dec old refcount.
      // @0x1e5ed4  jne 0x1e5ef7                 — !=0 -> skip old-block cleanup.
      const oldNewRc = LiString.atomicDec_refcount(currentBuf.block);
      if (oldNewRc === 0) {
        // @0x1e5ed6..@0x1e5ef2  identical dtor tail on the OLD block:
        //   movq (%rbx),%rax ; movb $0x0,(%rax) ; movq (%rbx),%rax ;
        //   movq $0,-0x8(%rax) ; leaq -0xc(%rax),%rdi ; testq %rax,%rax ;
        //   cmoveq %rax,%rdi ; callq _free.
        //   (Note this operates on `(%rbx)` — which by now still holds the
        //   OLD buffer pointer, because the publish `*this = new_buffer`
        //   happens AFTER at @0x1e5ef7. So this cleanup is on the OLD block.)
        LiString.writeBuf_byte(currentBuf.block, 0, 0);
        LiString.writePrefix_length(currentBuf.block, 0);
        LiString.writePrefix_capacity(currentBuf.block, 0);
        _free(currentBuf.block);
      }
      // @0x1e5ef7  movq %r12, (%rbx)             — *this = new_buffer_ptr
      //                                            (publish AFTER old-block drop).
      this.buffer = newGrowBuffer;
      // @0x1e5efa..@0x1e5efb  lock incl (%r15)   — atomic inc new_block
      //                                            refcount (0 -> 1).
      LiString.atomicInc_refcount(growBlock);
    } else {
      // Defensive alias path (unreachable in practice — fresh malloc can't
      // alias). We still publish and refcount-bump to preserve the invariant.
      this.buffer = newGrowBuffer;
      LiString.atomicInc_refcount(growBlock);
    }
    // @0x1e5efe..@0x1e5f0c — epilogue + retq.
  }

  // ---- test / equality helpers not part of the decoded surface. ----
  // (No such helpers are exported by Ozone for LiString beyond the two decoded
  // methods above; we DELIBERATELY do NOT invent any. Callers wanting a JS
  // string view must decode `this.buffer.block.bytes.slice(0xc, 0xc+length)`
  // themselves.)

  /**
   * Read the current byte length. Not a decoded method — supplied only as a
   * test hook so raw-port callers can assert dtor/append postconditions.
   * Reads buffer-0x8 exactly like the C++ code at @0x1e5df2.
   */
  __test_length(): number {
    return this.buffer === null ? 0 : LiString.readPrefix_length(this.buffer.block);
  }

  /**
   * Read the current capacity. Same disclaimer as __test_length; reads
   * buffer-0x4 exactly like the C++ code at @0x1e5dfd.
   */
  __test_capacity(): number {
    return this.buffer === null ? 0 : LiString.readPrefix_capacity(this.buffer.block);
  }
}

