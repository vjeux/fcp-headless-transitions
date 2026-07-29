// raw-port/src/infra/PCBufferWriteStream.ts
//
// FCP `PCBufferWriteStream` — ProCore.framework growable in-memory
// byte-writable stream. This is the write-side sibling of
// PCBufferReadStream (already ported in raw-port/src/infra/
// PCBufferReadStream.ts): whereas PCBufferReadStream wraps a fixed
// CFData for reads, this class owns a malloc'd buffer that grows on
// demand as bytes are written.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// DECODE:    raw-port/re/disasm/ProCore.PCBufferWriteStream.*.s
//            plus capstone linear-sweep of C2/C1/D0/D1/D2 (ICF folded out of otool -tV output).
//
// STRUCT LAYOUT (recovered verbatim from C2 @0x51704):
//   +0x00  vptr                                       installed @0x5171c-0x51723
//                                                       `leaq [rip + 0xf99f5], rax ; mov [rbx], rax`
//                                                       → VA 0x51723 + 0xf99f5 = 0x14b118
//                                                       (== `vtable-for-PCBufferWriteStream +0x10`).
//   +0x08  u8*     base                                = malloc(initialSize) @0x51729.
//   +0x10  u8*     cursor                              = base (initial write position).
//   +0x18  u8*     end                                 = base + initialSize (capacity edge).
//   +0x20  u8*     hwm                                 = base (high-water mark of any write).
//   +0x28  u32     capacity                            = initialSize (u32; ctor arg 1).
//   +0x2c  u32     growthSize                          = growthSize (u32; ctor arg 2).
//   sizeof(PCBufferWriteStream) = 0x30 bytes.
//
// EXPORTED SYMBOLS:
//   @ProCore 0x51704   C2  (int initialSize, int growthSize)
//   @ProCore 0x517c6   C1  — 4-byte thunk into C2 (`push rbp; pop rbp; jmp C2`).
//   @ProCore 0x517d0   D2  — reset vptr to base, free buffer, tail-jmp PCStream::~
//   @ProCore 0x51800   D1  — 4-byte thunk into D2 (`push rbp; pop rbp; jmp D2`).
//   @ProCore 0x5180a   D0  — call D2, tail-jmp `operator delete` @0xde6c0.
//   @ProCore 0x51826   reset()
//   @ProCore 0x51838   read(void*, u64)                — returns 0 (write-only class).
//   @ProCore 0x51840   write(const void*, u64)
//   @ProCore 0x5190e   getPos()
//   @ProCore 0x5191c   setPos(u64)
//   @ProCore 0x5192a   getError() const                — returns empty PCString.
//   @ProCore 0x51942   getBuffer()
//   @ProCore 0x5196c   getBufferSize()
//   @ProCore 0x5197a   copyBuffer()
//   @ProCore 0x519c2   copyData()

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * TypeScript mirror of the recovered `PCBufferWriteStream` object layout.
 * The buffer is modeled as a growable Uint8Array; `base`/`cursor`/`end`/
 * `hwm` are integer offsets INTO that array (the C code uses raw
 * pointers, but the arithmetic is identical because every access is via
 * offset from `base`).
 */
export interface PCBufferWriteStreamState {
  __vptr: string;
  /** +0x08 — the malloc'd buffer (owned). */
  buffer: Uint8Array;
  /** +0x10 — write cursor as byte offset into `buffer`. */
  cursor: number;
  /** +0x18 — capacity edge (`buffer.length`), maintained in sync. */
  end: number;
  /** +0x20 — high-water mark: max cursor value ever reached. */
  hwm: number;
  /** +0x28 — current capacity (`u32`, tracked separately as the ctor arg). */
  capacity: number;
  /** +0x2c — growth stride passed to the ctor (`u32`). */
  growthSize: number;
}

/**
 * `PCBufferWriteStream::PCBufferWriteStream(int initialSize, int growthSize)`
 * — C2 base ctor.
 *
 * @ProCore 0x51704 (`__ZN19PCBufferWriteStreamC2Eii`).
 *
 * Faithful transcription of capstone linear sweep at 0x51704:
 *
 *   0x51704  frame; save r15/r14/rbx
 *   0x5170e  mov  r14d, edx                    ; growthSize
 *   0x51711  mov  r15d, esi                    ; initialSize
 *   0x51714  mov  rbx, rdi                     ; this
 *   0x51717  call PCStream::PCStream() @0x6ddc ; base ctor
 *   0x5171c  lea  rax, [rip + 0xf99f5]         ; = 0x14b118 (vtable + 0x10)
 *   0x51723  mov  [rbx], rax                   ; install vptr
 *   0x51726  movsxd rdi, r15d                  ; sign-extend initialSize to size_t
 *   0x51729  call _malloc @stub 0xde94e
 *   0x5172e  mov  [rbx + 8], rax               ; base = malloc(initialSize)
 *   0x51732  test rax, rax; je 0x5175c        ; malloc-failed → std::bad_alloc path
 *   0x51737  mov  [rbx + 0x28], r15d           ; capacity = initialSize
 *   0x5173b  mov  [rbx + 0x10], rax            ; cursor = base
 *   0x5173f  mov  ecx, r15d
 *   0x51742  add  rcx, rax                     ; = base + initialSize
 *   0x51745  mov  [rbx + 0x18], rcx            ; end = base + initialSize
 *   0x51749  mov  [rbx + 0x20], rax            ; hwm = base
 *   0x5174d  mov  [rbx + 0x2c], r14d           ; growthSize
 *   0x51751  epilogue; ret
 *
 * The malloc-failed path at @0x5175c allocates a std::bad_alloc object,
 * throws it via `__cxa_throw`, and unwinds through `PCStream::~PCStream`.
 * TS mirrors this with a plain `throw new Error(...)`.
 */
export function PCBufferWriteStream_C2(
  self: PCBufferWriteStreamState,
  initialSize: number,
  growthSize: number,
): void {
  // @0x51717 — PCStream base ctor. Called as a frontier stub (PCStream
  // is landed as a separate class; its C2 is not yet imported here).
  PCStream_C2(self);
  // @0x5171c..@0x51723 — install vtable pointer at 0x14b118.
  self.__vptr = "vtable-for-PCBufferWriteStream @ProCore 0x14b118";
  // @0x51726..@0x51729 — allocate initialSize bytes. In TS we allocate
  // a Uint8Array, which is zero-initialized (malloc is not, but the
  // ctor never *reads* uninitialized memory — every read goes through
  // the cursor which starts at base and only advances after writes).
  if (initialSize < 0) {
    throw new Error(
      "PCBufferWriteStream::C2 @ProCore 0x51704: initialSize < 0 (movsxd sign-extended int→size_t rejects negatives)",
    );
  }
  const buf = new Uint8Array(initialSize);
  // @0x51732 — malloc-failed path throws std::bad_alloc; we can't detect
  //   that in JS (allocation exceptions look like RangeError). Leave the
  //   Uint8Array constructor to throw naturally on too-big requests.
  self.buffer = buf;
  // @0x51737 — capacity = initialSize (u32).
  self.capacity = initialSize >>> 0;
  // @0x5173b — cursor = base (offset 0 into buffer).
  self.cursor = 0;
  // @0x5173f..@0x51745 — end = base + initialSize.
  self.end = initialSize >>> 0;
  // @0x51749 — hwm = base.
  self.hwm = 0;
  // @0x5174d — growthSize.
  self.growthSize = growthSize >>> 0;
}

/**
 * `PCBufferWriteStream::~PCBufferWriteStream()` — D2 base dtor.
 *
 * @ProCore 0x517d0 (`__ZN19PCBufferWriteStreamD2Ev`).
 *
 * Body (capstone @0x517d0):
 *   0x517d0  frame
 *   0x517d9  lea rax, [rip + 0xf9938]           ; = 0x14b060 (base-class vptr)
 *   0x517e0  mov [rdi], rax                     ; reset vptr to base
 *   0x517e3  mov rdi, [rdi + 8]                 ; rdi = base
 *   0x517e7  test rdi, rdi; je 0x517f1          ; skip free if null
 *   0x517ec  call _free @stub 0xde89a
 *   0x517f1  mov rdi, rbx
 *   0x517fa  jmp PCStream::~PCStream() @0x6dec  ; tail-call
 */
export function PCBufferWriteStream_D2(self: PCBufferWriteStreamState): void {
  // @0x517d9..@0x517e0 — reset vptr to base class.
  self.__vptr = "vtable-for-PCStream @ProCore 0x14b060";
  // @0x517e3..@0x517ec — free the buffer (JS GC handles it; drop the ref).
  //   Zero-length buffers are still valid (Uint8Array(0)), so we don't need
  //   the null check — but faithfully mirror the "if non-null, free" by
  //   overwriting with a length-0 view.
  self.buffer = new Uint8Array(0);
  self.cursor = 0;
  self.end = 0;
  self.hwm = 0;
  self.capacity = 0;
  // @0x517fa — PCStream::~PCStream() (base dtor).
  PCStream_D2(self);
}

/**
 * `PCBufferWriteStream::~PCBufferWriteStream()` — D1 (complete-object) dtor.
 *
 * @ProCore 0x51800 (`__ZN19PCBufferWriteStreamD1Ev`).
 *
 * Body (capstone @0x51800): `push rbp; mov rbp,rsp; pop rbp; jmp D2`
 * — a 4-instruction thunk into D2. Equivalent to calling D2.
 */
export function PCBufferWriteStream_D1(self: PCBufferWriteStreamState): void {
  // @0x51805 — tail-jmp D2.
  PCBufferWriteStream_D2(self);
}

/**
 * `PCBufferWriteStream::~PCBufferWriteStream()` — D0 (deleting) dtor.
 *
 * @ProCore 0x5180a (`__ZN19PCBufferWriteStreamD0Ev`).
 *
 * Body (capstone @0x5180a):
 *   0x5180a  frame; push rbx
 *   0x51810  mov rbx, rdi
 *   0x51813  call D2 @0x517d0
 *   0x51818  mov rdi, rbx
 *   0x51821  jmp `operator delete` @stub 0xde6c0
 *
 * In TS we don't have `operator delete` — the GC frees. Just run D2.
 */
export function PCBufferWriteStream_D0(self: PCBufferWriteStreamState): void {
  // @0x51813 — call D2.
  PCBufferWriteStream_D2(self);
  // @0x51821 — `operator delete(this)` — no-op in TS (GC).
}

/**
 * `PCBufferWriteStream::reset()` — rewind the cursor and hwm to base.
 *
 * @ProCore 0x51826 (`__ZN19PCBufferWriteStream5resetEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.reset.s, 8 lines):
 *   0x5182a  mov rax, [rdi + 0x8]     ; rax = base
 *   0x5182e  mov [rdi + 0x10], rax    ; cursor = base
 *   0x51832  mov [rdi + 0x20], rax    ; hwm = base
 *   ret
 */
export function PCBufferWriteStream_reset(
  self: PCBufferWriteStreamState,
): void {
  // @0x5182e — cursor = base (offset 0).
  self.cursor = 0;
  // @0x51832 — hwm = base.
  self.hwm = 0;
}

/**
 * `PCBufferWriteStream::read(void*, u64)` — no-op reader (this is a
 * write-only stream); returns 0.
 *
 * @ProCore 0x51838 (`__ZN19PCBufferWriteStream4readEPvy`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.read.s, 6 lines):
 *   0x5183c  xor eax, eax
 *   ret
 */
export function PCBufferWriteStream_read(
  _self: PCBufferWriteStreamState,
  _dst: Uint8Array,
  _n: number,
): number {
  // @0x5183c — always return 0.
  return 0;
}

/**
 * `PCBufferWriteStream::write(const void* src, u64 n)` — append n bytes
 * from `src` to the buffer, growing the buffer if necessary. Returns the
 * number of bytes actually written (always == n on success).
 *
 * @ProCore 0x51840 (`__ZN19PCBufferWriteStream5writeEPKvy`).
 *
 * Faithful transcription of raw-port/re/disasm/ProCore.PCBufferWriteStream.
 * write.s (65 lines):
 *
 *   Fast path (cursor+n < end): plain memcpy at 0x518dc.
 *   Slow path (need to grow):
 *     overflow = (cursor + n) - end
 *     grow_by  = max(overflow, growthSize)
 *     new_cap  = capacity + grow_by
 *     malloc(new_cap), memcpy(new_base, old_base, hwm - old_base), free(old_base)
 *     Fix up base/cursor/hwm/end/capacity pointers to the new buffer.
 *     Then fall through to the plain memcpy(new_cursor, src, n).
 *   Common tail:
 *     cursor += n
 *     if cursor > hwm: hwm = cursor
 *     return n
 *
 * Disasm walk (both paths, condensed with citations):
 *   0x51857  r12 = cursor          ; [r14 + 0x10]
 *   0x5185b  rax = end             ; [r14 + 0x18]
 *   0x5185f  r13 = cursor + n
 *   0x51863  cmp end, cursor+n; jb 0x518dc (fast path)
 *
 *   ; growth path
 *   0x51868  r13d = r13d - eax          ; overflow bytes = (cursor+n) - end
 *   0x5186b  eax  = growthSize          ; [r14 + 0x2c]
 *   0x5186f  cmp  r13d, eax; cmoval r13d, eax  ; r13 = max(overflow, growth)
 *   0x51876  r13d += capacity           ; [r14 + 0x28]; new_capacity
 *   0x5187a  rax  = base                ; save
 *   0x51886  rbx  = hwm - base          ; hwm offset
 *   0x5188d  r12  = cursor - base       ; cursor offset
 *   0x51890  rdi  = new_capacity; call _malloc
 *   0x5189c  r15  = new_base
 *   0x518a2  memcpy(new_base, old_base, hwm_offset)
 *   0x518ae  free(old_base)
 *   0x518bb  base   = new_base
 *   0x518bf  cursor = new_base + cursor_offset
 *   0x518c6  hwm    = new_base + hwm_offset
 *   0x518d1  capacity = new_capacity
 *   0x518d8  end    = new_base + new_capacity
 *
 *   ; common tail (fast path lands here directly)
 *   0x518dc  memcpy(cursor, src, n)
 *   0x518e7  cursor += n
 *   0x518f2  if cursor > hwm: hwm = cursor
 *   0x518fc  return n
 */
export function PCBufferWriteStream_write(
  self: PCBufferWriteStreamState,
  src: Uint8Array,
  n: number,
): number {
  // Guard the u64 arg: n is unsigned. We accept any non-negative number.
  const nBytes = n >>> 0 === n && n >= 0 ? n : Number(n);
  // @0x51857..@0x51866 — check whether growth is needed.
  const needed = self.cursor + nBytes;
  if (needed > self.end) {
    // @0x51868..@0x51876 — compute new capacity = old + max(overflow, growth).
    const overflow = (needed - self.end) >>> 0;
    const growBy = Math.max(overflow, self.growthSize);
    const newCapacity = (self.capacity + growBy) >>> 0;
    // @0x51886..@0x518c9 — allocate, memcpy the live bytes [base..hwm],
    //   drop old buffer, install new buffer + update all pointer fields.
    //   In TS: allocate a new Uint8Array, set the first hwm bytes from the
    //   old buffer. Cursor stays at the SAME OFFSET (from base) — but in
    //   our offset-based model that just means we don't change self.cursor.
    const oldBuf = self.buffer;
    const hwmOffset = self.hwm; // offset from base — same as (hwm - base)
    const newBuf = new Uint8Array(newCapacity);
    newBuf.set(oldBuf.subarray(0, hwmOffset), 0);
    self.buffer = newBuf;
    self.capacity = newCapacity;
    self.end = newCapacity;
  }
  // @0x518dc..@0x518e2 — memcpy(cursor, src, n).
  self.buffer.set(src.subarray(0, nBytes), self.cursor);
  // @0x518e7..@0x518ee — cursor += n.
  self.cursor += nBytes;
  // @0x518f2..@0x518f8 — if cursor > hwm, hwm = cursor.
  if (self.cursor > self.hwm) {
    self.hwm = self.cursor;
  }
  // @0x518fc — return n.
  return nBytes;
}

/**
 * `PCBufferWriteStream::getPos()` — cursor position as offset from base.
 *
 * @ProCore 0x5190e (`__ZN19PCBufferWriteStream6getPosEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.getPos.s, 7 lines):
 *   0x51912  mov rax, [rdi + 0x10]    ; cursor
 *   0x51916  sub rax, [rdi + 0x8]     ; -= base
 *   ret
 */
export function PCBufferWriteStream_getPos(
  self: PCBufferWriteStreamState,
): number {
  // @0x51912..@0x51916 — return cursor - base.
  return self.cursor;
}

/**
 * `PCBufferWriteStream::setPos(u64 off)` — move cursor to `base + off`
 * without clamping (writes can extend beyond hwm; the caller is trusted
 * not to go past `end`, per the disasm which has NO bounds check here).
 *
 * @ProCore 0x5191c (`__ZN19PCBufferWriteStream6setPosEy`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.setPos.s, 7 lines):
 *   0x51920  add rsi, [rdi + 0x8]     ; rsi = base + off
 *   0x51924  mov [rdi + 0x10], rsi    ; cursor = rsi
 *   ret
 */
export function PCBufferWriteStream_setPos(
  self: PCBufferWriteStreamState,
  off: number,
): void {
  // @0x51920..@0x51924 — cursor = base + off. In offset space: cursor = off.
  self.cursor = off >>> 0 === off && off >= 0 ? off : Number(off);
}

/**
 * `PCBufferWriteStream::getError() const` — always returns an empty
 * PCString. This stream tracks NO error state — malloc failures throw
 * via std::bad_alloc from the ctor/write; writes always succeed by
 * growing.
 *
 * @ProCore 0x5192a (`__ZNK19PCBufferWriteStream8getErrorEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.getError.s):
 *   0x51930  mov rbx, rdi              ; save sret slot
 *   0x51933  call PCString::PCString() ; construct empty at *rdi
 *   0x51938  mov rax, rbx              ; return sret slot
 *   ret
 */
export function PCBufferWriteStream_getError(
  _self: PCBufferWriteStreamState,
): PCString {
  // @0x51933 — PCString() default ctor (empty string).
  return PCString_C1();
}

/**
 * `PCBufferWriteStream::getBuffer()` — null-terminate the current buffer
 * contents in-place and return a pointer to the base. The class writes a
 * `\0` byte via its own virtual `write(&nul, 1)` (vtable slot *0x18),
 * then decrements the cursor by 1 so the NUL sits AT the cursor position
 * but doesn't count toward the length.
 *
 * @ProCore 0x51942 (`__ZN19PCBufferWriteStream9getBufferEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.getBuffer.s, 17 lines):
 *   0x51946  push rbx, rax
 *   0x51948  mov rbx, rdi
 *   0x5194b  lea rsi, [rbp - 0x9]     ; local u8 slot on stack
 *   0x5194f  mov byte [rsi], 0        ; local = 0
 *   0x51952  mov rax, [rdi]           ; vtable
 *   0x51955  mov edx, 1               ; count = 1
 *   0x5195a  call *0x18(rax)          ; virtual: this->vt[0x18](this, &nul, 1)
 *                                       (= PCBufferWriteStream::write)
 *   0x5195d  dec qword [rbx + 0x10]   ; cursor -= 1
 *   0x51961  mov rax, [rbx + 0x8]     ; return base
 *   ret
 *
 * The dec-cursor after the virtual write means the NUL is present in the
 * buffer at position cursor(after)+0 — perfect for a C-string return —
 * but the reported buffer length (via getBufferSize) does NOT include
 * the NUL because getBufferSize is `end - base` (== capacity edge), not
 * `cursor - base` (see @0x51970 in getBufferSize below).
 */
export function PCBufferWriteStream_getBuffer(
  self: PCBufferWriteStreamState,
): Uint8Array {
  // @0x5194b..@0x51952 — build a 1-byte local NUL on the stack.
  const nul = new Uint8Array([0]);
  // @0x51955..@0x5195a — virtual dispatch to vt[0x18]. For our own class
  //   that resolves to PCBufferWriteStream_write; but a derived class
  //   could override, so faithfully use the virtual (via vptr indirection
  //   modeled here as a direct call to our write).
  PCBufferWriteStream_write(self, nul, 1);
  // @0x5195d — cursor -= 1 (undo the NUL from the counted length).
  self.cursor -= 1;
  // @0x51961 — return base pointer. In TS we return the Uint8Array itself;
  //   consumers should read `[0..cursor]` for the payload and can read
  //   `[cursor]` for the trailing NUL.
  return self.buffer;
}

/**
 * `PCBufferWriteStream::getBufferSize()` — return the capacity (end - base).
 *
 * @ProCore 0x5196c (`__ZN19PCBufferWriteStream13getBufferSizeEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.getBufferSize.s):
 *   0x51970  mov rax, [rdi + 0x20]    ; hwm
 *   0x51974  sub rax, [rdi + 0x8]     ; -= base
 *   ret
 *
 * NOTE: the field at +0x20 is the HIGH-WATER MARK (updated by write's
 * `if cursor > hwm: hwm = cursor`), NOT the end pointer. So this
 * function actually returns `hwm - base` = maximum cursor offset ever
 * reached, i.e. the "meaningful contents length" (unlike PCBufferReadStream
 * where the analogous field is `end - base`).
 */
export function PCBufferWriteStream_getBufferSize(
  self: PCBufferWriteStreamState,
): number {
  // @0x51970..@0x51974 — return hwm - base = hwm (offset).
  return self.hwm;
}

/**
 * `PCBufferWriteStream::copyBuffer()` — allocate a new malloc'd buffer,
 * memcpy the current live payload into it, append a NUL byte, return
 * the new pointer. The live payload length is `cursor - base` (the
 * bytes currently written up to the cursor).
 *
 * @ProCore 0x5197a (`__ZN19PCBufferWriteStream10copyBufferEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.copyBuffer.s, 28 lines):
 *   0x51984  r14 = base
 *   0x51988  rbx = cursor
 *   0x5198c  rbx = cursor - base                      ; length
 *   0x5198f  rdi = length + 1                          ; +1 for NUL
 *   0x51993  call _malloc
 *   0x51998  r15 = new_ptr
 *   0x5199b  test rax, rax; je 0x519b3                ; if null, skip
 *   0x519a0  memcpy(new_ptr, base, length)
 *   0x519ae  new_ptr[length] = 0                       ; append NUL
 *   0x519b3  return r15                                ; may be null on OOM
 */
export function PCBufferWriteStream_copyBuffer(
  self: PCBufferWriteStreamState,
): Uint8Array | null {
  // @0x5198c — length = cursor - base = cursor (offset).
  const length = self.cursor;
  // @0x5198f..@0x51993 — allocate (length + 1). Uint8Array(n) can throw
  //   RangeError; we translate malloc-failure to null return to match
  //   the caller's tested-for-null contract.
  let out: Uint8Array;
  try {
    out = new Uint8Array(length + 1);
  } catch {
    // @0x519b3 — return null on OOM.
    return null;
  }
  // @0x519a0..@0x519a9 — memcpy(new, base, length).
  out.set(self.buffer.subarray(0, length), 0);
  // @0x519ae — append NUL at [length].
  out[length] = 0;
  // @0x519b3 — return new_ptr.
  return out;
}

/**
 * `PCBufferWriteStream::copyData()` — build a CFData object from the live
 * payload. Uses the same "append NUL via virtual write, then decrement
 * cursor" pattern as getBuffer, then calls CFDataCreate(kCFAllocatorDefault,
 * base, length).
 *
 * @ProCore 0x519c2 (`__ZN19PCBufferWriteStream8copyDataEv`).
 *
 * Body (raw-port/re/disasm/ProCore.PCBufferWriteStream.copyData.s, 27 lines):
 *   0x519d0..0x519d7  r14 = *kCFAllocatorDefault    ; @0xf5a69(%rip)
 *   0x519da  rsi = &(rbp-0x11)              ; local NUL slot
 *   0x519de  *rsi = 0
 *   0x519e1..0x519e9  virtual: this->vt[0x18](this, &nul, 1)   ; append NUL
 *   0x519ec  rsi = base                     ; [rbx + 8]
 *   0x519f0  rdx = cursor                   ; [rbx + 0x10]
 *   0x519f4  rdx -= 1                       ; NUL not counted
 *   0x519f7  cursor = rdx                   ; write back cursor
 *   0x519fb  rdx -= rsi                     ; length = cursor - base
 *   0x519fe  rdi = kCFAllocatorDefault
 *   0x51a01  call _CFDataCreate             ; @stub 0xddf3a
 *   ret rax
 *
 * `_CFDataCreate` is a CoreFoundation import (frontier stub — we do not
 * model CFData in TS).
 */
export function PCBufferWriteStream_copyData(
  _self: PCBufferWriteStreamState,
): CFDataRef {
  throw new Error(
    "PCBufferWriteStream::copyData @ProCore 0x519c2 not yet transcribed (needs _CFDataCreate @stub 0xddf3a and CFDataRef modeling — CoreFoundation frontier)",
  );
}

// ─── Cross-file frontier stubs (Rule 3: cite @0xADDR) ──────────────────────

/** Opaque handle for `PCString`. */
export interface PCString {
  readonly __brand: "PCString";
}

/** Opaque handle for a `CFDataRef` returned by copyData. */
export interface CFDataRef {
  readonly __brand: "CFDataRef";
}

/**
 * Frontier: `PCString::PCString()` default ctor.
 * Called from PCBufferWriteStream::getError @0x51933.
 */
function PCString_C1(): PCString {
  throw new Error(
    "PCString::PCString() @ProCore __ZN8PCStringC1Ev (called from PCBufferWriteStream::getError @0x51933) not yet transcribed",
  );
}

/**
 * Frontier: `PCStream::PCStream()` base ctor (the abstract base of every
 * PCBuffer*Stream / PC*Stream class). Called from PCBufferWriteStream::C2
 * @0x51717.
 */
function PCStream_C2(_self: PCBufferWriteStreamState): void {
  throw new Error(
    "PCStream::PCStream() base ctor @ProCore 0x6ddc (called from PCBufferWriteStream::C2 @0x51717) not yet transcribed",
  );
}

/**
 * Frontier: `PCStream::~PCStream()` base dtor. Called from
 * PCBufferWriteStream::D2 @0x517fa (tail-jmp).
 */
function PCStream_D2(_self: PCBufferWriteStreamState): void {
  throw new Error(
    "PCStream::~PCStream() base dtor @ProCore 0x6dec (called from PCBufferWriteStream::D2 @0x517fa) not yet transcribed",
  );
}
