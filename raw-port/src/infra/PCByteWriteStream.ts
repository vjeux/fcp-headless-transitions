// PCByteWriteStream.ts — MSB-first (big-bit-within-byte) bit/byte writer with an inline growable
// byte buffer. Transcribed line-for-line from FCP ProCore.framework (Final Cut Pro.app x86_64
// slice). Fourteen methods total: ctor, D2/D1/D0, writeUInt8/16/32, writeValueAtPos, writeBits,
// flushBits, writeCurByte, writeStream, writeData. Pure integer/bit math on top of a
// PCDynamicArray<uint8_t> tail append — no plumbing, no external side-effects.
//
// Framework: ProCore.framework (Final Cut Pro).
//
// DECODE:
//   raw-port/re/disasm/ProCore.PCByteWriteStream.PCByteWriteStream.s   (ctor C1, 0x23264)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.~PCByteWriteStream.s  (dtor D0, 0x2330e)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeUInt8.s          (0x2333e)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeUInt16.s         (0x23368)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeUInt32.s         (0x233a4)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeValueAtPos.s     (0x2341e)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeBits.s           (0x23456)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.flushBits.s           (0x234c6)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeCurByte.s        (0x234da)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeStream.s         (0x23506)
//   raw-port/re/disasm/ProCore.PCByteWriteStream.writeData.s           (0x23534)
//
// Struct layout (recovered from the ctor's stores + writeCurByte's `addq $0x18, %rdi; call
// PCDynamicArray<uint8_t>::insert(uint32_t, uint8_t const&)` at 0x234ee, which confirms an
// inline PCDynamicArray<uint8_t> at offset +0x18):
//
//   +0x00  vptr        : vtable ptr    (ctor: `leaq 0x126264(%rip), %rax; movq %rax, (%rdi)`
//                                       — @0x149440 = &__ZTV17PCByteWriteStream + 0x10.
//                                       PCDebugByteWriteStream's dtors re-install this same
//                                       address, confirming it's the primary vtable slot.)
//   +0x08  curByte     : uint8_t       (accumulator byte for pending bits; ctor writes 0)
//   +0x0c  bitsRem     : uint32_t      (bits still free in curByte; ctor writes 8)
//   +0x18  arr.count   : uint32_t      (byte-buffer length; ctor writes 0)
//   +0x1c  arr.cap     : uint32_t      (byte-buffer capacity; ctor writes 0x14 = 20 via the
//                                       fused `movabsq $0x1400000000, %rax; movq %rax, 0x18(%rdi)`
//                                       instruction pair — little-endian: low32=count=0,
//                                       high32=cap=0x14)
//   +0x20  arr.data    : uint8_t*      (buffer pointer; ctor: `movl $0x14, %edi; callq __Znam`
//                                       then `movq %rax, 0x20(%rbx)` — new uint8_t[20])
//
// Bit ordering convention (from writeBits/writeUInt* wiring):
//   - Inside a byte, the FIRST bit written lands in the HIGH bit position of that byte
//     (MSB-first / big-bit-within-byte). This is visible in writeBits' tail case:
//     `curByte |= val << (bitsRem - nBits)` — the incoming value is shifted LEFT to fill the
//     top vacant bits first.
//   - Between multi-byte integer writes (writeUInt16/32 and writeValueAtPos), bytes are
//     emitted LITTLE-ENDIAN: writeUInt16 emits low byte first (`writeBits(v & 0xff, 8)` then
//     `writeBits(v >> 8, 8)`), and writeValueAtPos pokes 4 bytes at buf[pos+0..3] in the
//     order low..high. So the composite MSB-first-bits + LE-bytes is the FCP scheme.
//
// PCDynamicArray<uint8_t>::insert is EXTERNAL and shared with the read-only side; the addresses
// at which it's tail-called here (0x234ee for `insert(uint32_t, uint8_t const&)`;
// 0x23566/0x2352f for `insert(uint32_t, uint8_t const*, uint32_t)`) are the DECODE handles for
// its future port. Until then we route through THROWING stubs that cite those addresses so a
// consumer never silently gets fake behavior. See ANTI_SHORTCUT.md P4.
//
// VTABLE (evidence from PCDebugByteWriteStream's dtors installing this vtable at +0x10, and
// from the inner virtual calls in writeUInt8/16/32/writeStream/writeData):
//   slot +0x30 = writeBits(uint32_t, uint32_t)  — writeUInt* tail-jump here through *(vt+0x30).
//   slot +0x38 = flushBits()                     — writeUInt*/writeStream/writeData call here.
//   slot +0x50 = writeCurByte()                  — flushBits jmp-tail here when curByte pending.
// This class is the CONCRETE base with no further overrides; the virtual dispatch is
// preserved so subclasses (PCDebugByteWriteStream) can hook writeStream/writeCurByte, matching
// how the ObjC-ABI vtable is actually laid out at __ZTV17PCByteWriteStream + 0x10.

/**
 * PCDynamicArray<uint8_t>::insert(uint32_t index, uint8_t const&) — external.
 * @external @ProCore 0x00023670 (called from writeCurByte @0x234ee).
 *
 * This is the "insert one byte at index (== current tail length ⇒ push_back)" primitive backing
 * PCByteWriteStream's byte-buffer growth. It is NOT decoded here. Per ANTI_SHORTCUT rule P4 the
 * only permitted behavior of an undecoded callee is to `throw` citing its @0xADDR — so consumers
 * cannot silently observe a wrong buffer.
 */
function PCDynamicArray_uint8_insert_ref(
  _self: PCDynamicArrayUint8,
  _index: number,
  _byte: number,
): void {
  throw new Error(
    "PCDynamicArray<uint8_t>::insert(uint32_t, uint8_t const&) not yet transcribed @0x00023670",
  );
}

/**
 * PCDynamicArray<uint8_t>::insert(uint32_t index, uint8_t const* data, uint32_t len) — external.
 * @external @ProCore called via tail-jmp from writeStream @0x2352f and writeData @0x23566.
 *
 * The "insert (append when index==count) a range of bytes" primitive. Not yet decoded. Throws on
 * invocation per ANTI_SHORTCUT P4.
 */
function PCDynamicArray_uint8_insert_range(
  _self: PCDynamicArrayUint8,
  _index: number,
  _data: Uint8Array,
  _len: number,
): void {
  throw new Error(
    "PCDynamicArray<uint8_t>::insert(uint32_t, uint8_t const*, uint32_t) not yet transcribed " +
      "@0x0002352f (tail-jmp from writeStream) / @0x00023566 (tail-jmp from writeData)",
  );
}

/**
 * Inline PCDynamicArray<uint8_t> embedded at +0x18 of PCByteWriteStream. Layout of the array
 * itself:
 *   +0x00 (== stream +0x18)  count    : uint32_t
 *   +0x04 (== stream +0x1c)  capacity : uint32_t
 *   +0x08 (== stream +0x20)  data     : uint8_t*
 */
export interface PCDynamicArrayUint8 {
  count: number;
  capacity: number;
  data: Uint8Array;
}

/**
 * `PCByteWriteStream::PCByteWriteStream()` — default constructor.
 * @ProCore 0x0000000000023264  (__ZN17PCByteWriteStreamC1Ev)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.PCByteWriteStream.s):
 *   0x23264-0x23274  pushq %rbp; mov rsp,rbp; pushes; rbx=rdi; leaq 0x126264(%rip),%rax;
 *                    movq %rax, (%rdi)                     — install vptr (= __ZTV+0x10 @0x149440)
 *   0x23277           movb $0x0, 0x8(%rdi)                  — curByte = 0
 *   0x2327b           movq $0x8, 0xc(%rdi)                  — bitsRem = 8 (also zeros +0x10..+0x17)
 *   0x23283-0x2328d   movabsq $0x1400000000,%rax; movq %rax,0x18(%rdi)
 *                                                          — LE 64-bit store: (+0x18)=0 count,
 *                                                            (+0x1c)=0x14 capacity
 *   0x23291           movq $0x0, 0x20(%rdi)                 — data = nullptr (about to be set)
 *   0x23299           movl $0x14, %edi                      — new_size = 20 bytes
 *   0x2329e           callq __Znam                          — operator new[](20)
 *   0x232a3           movq %rax, 0x20(%rbx)                 — data = new buffer
 *   (epilogue)
 *
 * Note: the ctor also implicitly zeros +0x10..+0x17 via the `movq $0x8, 0xc(%rdi)` (8-byte store
 * of 0x8 covers offsets 0xc..0x13) — the +0x10..+0x17 bytes are not read by any method of this
 * class in the disasm. Marked as UNUSED_PADDING in the layout above.
 */
export class PCByteWriteStream {
  /** +0x00 — vptr (installed to `__ZTV17PCByteWriteStream + 0x10` @0x149440). Modeled
   *  symbolically since the vtable itself is not runtime-linked in a TS port. */
  vptr: string = "PCByteWriteStream::__vtable+0x10";

  /** +0x08 — pending-bits accumulator byte. */
  curByte: number = 0;

  /** +0x0c — free bits remaining in curByte (0..8). */
  bitsRem: number = 8;

  /** +0x18 — inline PCDynamicArray<uint8_t> holding the emitted byte stream. Ctor allocates
   *  a capacity-20 buffer. */
  arr: PCDynamicArrayUint8 = {
    count: 0,
    capacity: 20,
    // @0x23299 `movl $0x14, %edi; callq __Znam` — `new uint8_t[20]`.
    data: new Uint8Array(20),
  };

  /**
   * `PCByteWriteStream::~PCByteWriteStream()` — D0 deleting dtor.
   * @ProCore 0x000000000002330e  (__ZN17PCByteWriteStreamD0Ev)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.~PCByteWriteStream.s):
   *   0x2330e-0x2331e  installs `__ZTV17PCByteWriteStream + 0x10` @0x1494c8 into (*this) — the
   *                    base-class vptr, defensively re-set before member cleanup.
   *   0x23321-0x23328  rdi = *(this+0x20)  (arr.data); test/je skips delete if null.
   *   0x2332a           callq __ZdaPv        — operator delete[](arr.data)
   *   0x23332-0x23338   tail-jmp __ZdlPv     — operator delete(this)
   *
   * In this TS port, `destroy()` mirrors the effect of D0: it drops the buffer reference. The
   * complete-object delete-this at the end is a no-op in JS (GC handles it).
   */
  destroy(): void {
    // @0x23317 — reset vptr to base's vtable+0x10 (defensive; observable to another dtor
    // running concurrently).
    this.vptr = "PCByteWriteStream::__vtable+0x10";
    // @0x23321-0x2332a — if (arr.data) delete[] arr.data; (JS: drop the reference).
    // The FCP code never re-nulls arr.data (there's no `movq $0x0, 0x20(%rbx)` in this dtor),
    // matching the "about to be GC'd anyway" contract of D0. We do the same.
    // @0x23332-0x23338 — operator delete(this) is a GC no-op in TS.
  }

  /**
   * `PCByteWriteStream::writeUInt8(uint8_t v)` — flush any pending bits, then emit 8 bits.
   * @ProCore 0x000000000002333e  (__ZN17PCByteWriteStream10writeUInt8Eh)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeUInt8.s):
   *   0x2333e-0x2334a  prologue; ebx=v; r14=this; rax=vptr; callq *(vptr+0x38) — this.flushBits()
   *   0x23350           rax = vptr; rax = *(vptr+0x30)             — resolve writeBits slot
   *   0x2335a-0x2335c   esi = ebx (v); edx = 8                     — writeBits(v, 8) args
   *   0x2333e-0x23365   tail-jmpq *rax                             — tail call writeBits(v, 8)
   */
  writeUInt8(v: number): void {
    // @0x23348-0x2334d — vtable slot +0x38 = flushBits.
    this.flushBits();
    // @0x2335a-0x23365 — tail-call vtable slot +0x30 = writeBits(v, 8).
    this.writeBits(v & 0xff, 8);
  }

  /**
   * `PCByteWriteStream::writeUInt16(uint16_t v)` — flush pending bits, then emit v little-endian
   * as two bytes (low byte first, then high byte).
   * @ProCore 0x0000000000023368  (__ZN17PCByteWriteStream11writeUInt16Et)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeUInt16.s):
   *   0x23368-0x23377  prologue; ebx=v; r14=this; callq *(vptr+0x38)          — flushBits()
   *   0x2337a-0x23387   callq *(vptr+0x30) with (this, v&0xff, 8)              — writeBits(low,8)
   *                     (esi=ebx (v truncated by 32-bit move ⇒ but v was already zero-extended to
   *                     16 bits by the caller ABI; the byte the callee sees is `v & 0xff`.)
   *   0x2338a           shrl $0x8, %ebx                                        — v >>= 8
   *   0x2338d-0x233a2   tail-jmp *(vptr+0x30) with (this, v>>8, 8)             — writeBits(hi,8)
   *
   * Byte order: LOW byte first ⇒ little-endian across bytes.
   */
  writeUInt16(v: number): void {
    // @0x23374-0x23377 — flushBits()
    this.flushBits();
    // @0x2337a-0x23387 — writeBits(v & 0xff, 8)
    this.writeBits(v & 0xff, 8);
    // @0x2338a — shrl $0x8, %ebx
    // @0x2338d-0x233a2 — tail-jmp writeBits((v>>8) & 0xff, 8)
    this.writeBits((v >>> 8) & 0xff, 8);
  }

  /**
   * `PCByteWriteStream::writeUInt32(uint32_t v)` — flush pending bits, then emit v little-endian
   * as four bytes (byte 0..3 in order).
   * @ProCore 0x00000000000233a4  (__ZN17PCByteWriteStream11writeUInt32Ej)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeUInt32.s):
   *   0x233a4-0x233b6  prologue; ebx=v; r14=this; callq *(vptr+0x38)          — flushBits()
   *   0x233b9           r15d = 0xff                                            — byte mask
   *   0x233bf-0x233cf   esi = v & 0xff; edx = 8; callq *(vptr+0x30)            — writeBits(b0,8)
   *   0x233d2-0x233e5   esi = (v>>8) & 0xff; edx=8; callq *(vptr+0x30)         — writeBits(b1,8)
   *   0x233e8-0x233fb   esi = (v>>16) & 0xff; edx=8; callq *(vptr+0x30)        — writeBits(b2,8)
   *   0x233fe           shrl $0x18, %ebx                                       — v >>= 24
   *   0x23401-0x2341c   tail-jmp *(vptr+0x30) with (v>>24, 8)                  — writeBits(b3,8)
   *
   * Byte order: byte 0 (v&0xff) first ⇒ little-endian.
   */
  writeUInt32(v: number): void {
    v = v >>> 0;
    // @0x233b3-0x233b6 — flushBits()
    this.flushBits();
    // @0x233bf-0x233cf — writeBits(v & 0xff, 8)
    this.writeBits(v & 0xff, 8);
    // @0x233d2-0x233e5 — writeBits((v>>8) & 0xff, 8)
    this.writeBits((v >>> 8) & 0xff, 8);
    // @0x233e8-0x233fb — writeBits((v>>16) & 0xff, 8)
    this.writeBits((v >>> 16) & 0xff, 8);
    // @0x233fe-0x2341c — tail-jmp writeBits(v>>24, 8)
    this.writeBits((v >>> 24) & 0xff, 8);
  }

  /**
   * `PCByteWriteStream::writeValueAtPos(uint32_t value, uint32_t pos)` — poke a 32-bit
   * little-endian value directly into `arr.data[pos .. pos+3]`, bypassing the bit accumulator
   * and the DynamicArray bookkeeping (no length update, no flush).
   * @ProCore 0x000000000002341e  (__ZN17PCByteWriteStream15writeValueAtPosEjj)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeValueAtPos.s):
   *   0x2341e-0x23422  prologue; %eax = %esi = value
   *   0x23424           rcx = *(this+0x20)   — arr.data
   *   0x23428           esi = edx            — pos (32-bit; the disasm zero-extends via 32-bit mov)
   *   0x2342a           movb %al, (rcx,rsi)                       — data[pos+0] = value & 0xff
   *   0x2342d           leal 0x1(%rdx), %ecx                       — pos + 1
   *   0x23430           rsi = *(this+0x20)   ; movb %ah, (rsi,rcx) — data[pos+1] = (value>>8)&0xff
   *   0x23437-0x23439   ecx = value >> 16
   *   0x2343c           leal 0x2(%rdx), %esi                       — pos + 2
   *   0x2343f           r8 = *(this+0x20)    ; movb %cl, (r8,rsi)  — data[pos+2] = (value>>16)&0xff
   *   0x23447           shrl $0x18, %eax                            — value >> 24
   *   0x2344a           addl $0x3, %edx                             — pos + 3
   *   0x2344d           rcx = *(this+0x20)   ; movb %al, (rcx,rdx) — data[pos+3] = (value>>24)&0xff
   *
   * NOTE: this function does NOT bounds-check or grow `arr` — it assumes the caller pre-reserved
   * the four bytes at `pos`. That's how the FCP asm behaves; we mirror it exactly.
   */
  writeValueAtPos(value: number, pos: number): void {
    const data = this.arr.data;
    const p = pos >>> 0;
    const v = value >>> 0;
    // @0x2342a-0x23451 — four LE byte pokes.
    data[p] = v & 0xff;
    data[p + 1] = (v >>> 8) & 0xff;
    data[p + 2] = (v >>> 16) & 0xff;
    data[p + 3] = (v >>> 24) & 0xff;
  }

  /**
   * `PCByteWriteStream::writeBits(uint32_t val, uint32_t nBits)` — append the low `nBits` bits of
   * `val` to the stream, MSB-first within each output byte, spilling whole bytes into `arr`
   * (via writeCurByte) whenever the accumulator fills.
   * @ProCore 0x0000000000023456  (__ZN17PCByteWriteStream9writeBitsEjj)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeBits.s):
   *   0x23456-0x23458   testl %edx,%edx; je 0x234c5                            — if (nBits==0) return
   *   0x2345a-0x23464   prologue; r14d = esi = val; rbx = rdi = this
   *   0x2346a-0x23471   ecx = edx (nBits); negb %cl; shll %cl,%r14d; shrl %cl,%r14d
   *                     ⇒ val = (val << (32-nBits)) >> (32-nBits) — mask low nBits bits.
   *   0x23474           r15d = edx                                              — nBits (outer)
   *   OUTER LOOP @0x23477:
   *     0x23477         ecx = *(this+0xc)                                       — bitsRem
   *     0x2347a         al  = *(this+0x8)                                       — curByte
   *     0x2347d         r15d -= ecx  (r15 = nBits - bitsRem)                    — how many bits left
   *                     over after we fill the current byte (signed subtraction)
   *     0x23480         jb TAIL @0x234ad                                        — if unsigned wrap,
   *                     i.e. nBits < bitsRem, jump to tail (bits fit in current byte).
   *     ; MID CASE: nBits >= bitsRem — fill current byte, flush, iterate
   *     0x23482-0x2348a  edx = val; ecx = r15 (leftover); shrl %cl,%edx; orb %dl,%al
   *                       ⇒ curByte |= (val >> leftover) & 0xff
   *     0x2348c           movb %al, 0x8(%rbx)                                     — store curByte
   *     0x2348f-0x23495   callq *(vptr+0x50)                                       — writeCurByte()
   *                       (writeCurByte pushes byte into arr, resets curByte=0, bitsRem=8)
   *     0x23498-0x234a0   ecx = r15 (leftover); negb %cl; shll %cl,%r14d; shrl %cl,%r14d
   *                       ⇒ val = (val << (32-leftover)) >> (32-leftover) — remask to `leftover`
   *                       low bits (drop bits we just consumed).
   *     0x234a3           edx = r15d                                              — new nBits =
   *                                                                                 leftover
   *     0x234a6-0x234a9   testl %r15d,%r15d; jne 0x23477                          — if leftover>0
   *                                                                                 loop.
   *     0x234ab           jmp 0x234bb (epilogue)
   *   TAIL @0x234ad:  nBits < bitsRem — bits fit inside current byte, no flush.
   *     0x234ad         subl %edx,%ecx  (ecx = bitsRem - nBits)                  — new bitsRem
   *     0x234af         shll %cl,%r14d                                            — val <<= newBitsRem
   *     0x234b2         orb %r14b,%al                                             — curByte |= (val & 0xff)
   *     0x234b5         movb %al, 0x8(%rbx)                                        — store curByte
   *     0x234b8         movl %ecx, 0xc(%rbx)                                        — store bitsRem
   *   EPILOGUE @0x234bb.
   *
   * Bit-within-byte order: the FIRST bit written goes into the CURRENT byte's HIGHEST free bit
   * (visible in the tail case's `val <<= (bitsRem - nBits)` — small values shifted UP to the top).
   * That makes this an MSB-first-within-byte writer.
   */
  writeBits(val: number, nBits: number): void {
    // @0x23456-0x23458 — early return.
    if ((nBits | 0) === 0) {
      return;
    }
    // Local mirrors of the asm registers.
    let r14 = val >>> 0; // val, mutated in place
    let r15 = nBits >>> 0; // outer nBits (also reused as "leftover")

    // @0x2346a-0x23471 — mask val to low nBits bits.
    // The asm uses the same 32-bit "negb %cl; shll/shrl" idiom: shift left by (32-nBits) then
    // right by (32-nBits) — this zeroes the high (32-nBits) bits.
    {
      const c = ((-r15) & 0xff) & 0x1f; // negb %cl truncates to 8 bits, then shift uses low 5.
      // For nBits=32 the shift amount is 0 ⇒ no-op mask (correct).
      // For nBits in 1..31 c = 32 - nBits, matching x86 semantics.
      r14 = ((r14 << c) >>> 0) >>> c; // >>>0 to keep uint32; second shift is unsigned.
      r14 >>>= 0;
    }

    // OUTER LOOP @0x23477.
    // Note the asm re-loads bitsRem and curByte from memory at the TOP of each iteration
    // (0x23477/0x2347a). We do the same via `this.bitsRem` / `this.curByte`.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x23477 — bitsRem = *(this+0xc)
      const bitsRem = this.bitsRem >>> 0;
      // @0x2347a — curByte = *(this+0x8)
      let curByte = this.curByte & 0xff;
      // @0x2347d — r15 = nBits - bitsRem (unsigned subtract; jb tests borrow).
      const diff = (r15 - bitsRem) >>> 0;
      const borrowed = r15 < bitsRem;
      // @0x23480 — jb TAIL when unsigned wrap (i.e. nBits < bitsRem).
      if (borrowed) {
        // TAIL @0x234ad — bits fit in current byte.
        // ecx = bitsRem - nBits  (was `subl %edx,%ecx` — this computes newBitsRem)
        const newBitsRem = (bitsRem - r15) >>> 0;
        // @0x234af — val <<= newBitsRem  (x86 shll uses low 5 bits of cl, but newBitsRem ≤ 7 here)
        const shifted = ((r14 << (newBitsRem & 0x1f)) >>> 0) & 0xff;
        // @0x234b2 — curByte |= (val & 0xff)   (`orb %r14b,%al`)
        curByte = (curByte | shifted) & 0xff;
        // @0x234b5 — store curByte
        this.curByte = curByte;
        // @0x234b8 — store new bitsRem
        this.bitsRem = newBitsRem;
        return;
      }

      // MID CASE: nBits >= bitsRem. Fill current byte, flush via writeCurByte, iterate.
      r15 = diff; // leftover = nBits - bitsRem (used both as shift and as loop-continue count)

      // @0x23482-0x2348a — curByte |= (val >> leftover) & 0xff
      const highBits = (r14 >>> (r15 & 0x1f)) & 0xff;
      curByte = (curByte | highBits) & 0xff;
      // @0x2348c — store curByte
      this.curByte = curByte;
      // @0x2348f-0x23495 — writeCurByte() (vtable slot +0x50)
      this.writeCurByte();

      // @0x23498-0x234a0 — remask val to low `leftover` bits.
      {
        const c = ((-r15) & 0xff) & 0x1f;
        // For leftover == 0 the asm still executes negb+shll+shrl with cl=0 (no-op on x86);
        // in TS the same identity holds via `>>> 0` idempotence.
        r14 = ((r14 << c) >>> 0) >>> c;
        r14 >>>= 0;
      }

      // @0x234a3-0x234a9 — if (leftover != 0) loop; else fall through to epilogue.
      if ((r15 | 0) === 0) {
        return;
      }
      // Loop continues with new nBits = leftover.
    }
  }

  /**
   * `PCByteWriteStream::flushBits()` — if the accumulator has any pending (partial) bits,
   * push them out as a full byte via writeCurByte(); otherwise no-op.
   * @ProCore 0x00000000000234c6  (__ZN17PCByteWriteStream9flushBitsEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.flushBits.s):
   *   0x234c6-0x234c7  push rbp; mov rsp,rbp
   *   0x234ca-0x234ce  cmpl $0x8, 0xc(%rdi); jne 0x234d2   — if bitsRem != 8 (i.e. some bits held)
   *   0x234d0           popq %rbp; retq                     — else return.
   *   0x234d2           rax = *(this)                        — vptr
   *   0x234d5           popq %rbp
   *   0x234d6           jmpq *(vptr+0x50)                    — tail-jmp writeCurByte()
   *
   * i.e. flushBits is `if (bitsRem != 8) writeCurByte()`. writeCurByte itself will do nothing
   * to the pending byte's high bits — it just appends whatever is in curByte and resets. This
   * means unwritten low bits of a partial byte are emitted AS ZERO (the initial value of
   * curByte after every reset). Confirmed against the ctor's `movb $0x0, 0x8(%rdi)`.
   */
  flushBits(): void {
    // @0x234ca-0x234d0
    if ((this.bitsRem >>> 0) === 8) {
      return;
    }
    // @0x234d2-0x234d6 — tail-jmp writeCurByte via vtable slot +0x50.
    this.writeCurByte();
  }

  /**
   * `PCByteWriteStream::writeCurByte()` — push the current accumulator byte into the DynamicArray
   * tail via `PCDynamicArray<uint8_t>::insert(count, curByte)`, then reset curByte=0 and
   * bitsRem=8.
   * @ProCore 0x00000000000234da  (__ZN17PCByteWriteStream12writeCurByteEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeCurByte.s):
   *   0x234da-0x234e0  prologue; rbx = rdi = this
   *   0x234e3           rdi = rbx + 0x18                                        — &arr (inline)
   *   0x234e7           rdx = rbx + 0x8                                         — &curByte
   *   0x234eb           esi = *(rbx+0x18)                                       — arr.count
   *   0x234ee           callq __ZN14PCDynamicArrayIhE6insertEjRKh
   *                     ⇒ PCDynamicArray<uint8_t>::insert(&arr, arr.count, curByte&)
   *                       — insert at index == current count == append at tail.
   *   0x234f3           movb $0x0, 0x8(%rbx)                                    — curByte = 0
   *   0x234f7           movl $0x8, 0xc(%rbx)                                    — bitsRem = 8
   *   (epilogue)
   *
   * NOTE: `insert(count, x)` is push_back semantics on a PCDynamicArray. The insert primitive is
   * NOT yet decoded; per ANTI_SHORTCUT P4 we route through a throwing stub citing @0x00023670.
   */
  writeCurByte(): void {
    // @0x234e3-0x234ee — PCDynamicArray<uint8_t>::insert(&arr, arr.count, curByte&)
    PCDynamicArray_uint8_insert_ref(this.arr, this.arr.count >>> 0, this.curByte & 0xff);
    // @0x234f3 — curByte = 0
    this.curByte = 0;
    // @0x234f7 — bitsRem = 8
    this.bitsRem = 8;
  }

  /**
   * `PCByteWriteStream::writeStream(PCByteWriteStream& src)` — flush any pending bits on `this`,
   * then append every byte currently in `src.arr.data` to `this.arr` via the range-insert
   * primitive.
   * @ProCore 0x0000000000023506  (__ZN17PCByteWriteStream11writeStreamERS_)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeStream.s):
   *   0x23506-0x2350c  prologue
   *   0x2350d           rbx = rsi = src
   *   0x23510           r14 = rdi = this
   *   0x23513-0x23516   callq *(vptr+0x38)                                       — this.flushBits()
   *   0x23519           rdx = *(src+0x20)                                        — src.arr.data
   *   0x2351d           ecx = *(src+0x18)                                        — src.arr.count
   *   0x23520           esi = *(this+0x18)                                       — this.arr.count
   *   0x23524           r14 = this + 0x18                                        — &this.arr
   *   0x23528-0x2352f   tail-jmp __ZN14PCDynamicArrayIhE6insertEjPKhj
   *                     ⇒ PCDynamicArray<uint8_t>::insert(&this.arr, this.arr.count,
   *                                                       src.arr.data, src.arr.count)
   *                       — append `src.arr.count` bytes from `src.arr.data` at this tail.
   *
   * i.e. writeStream = flushBits, then bulk-append the SOURCE's committed buffer (NOT the source
   * accumulator — that's not read).
   */
  writeStream(src: PCByteWriteStream): void {
    // @0x23513-0x23516 — flushBits() via vtable slot +0x38.
    this.flushBits();
    // @0x23519-0x2352f — insert range: (this.arr, this.arr.count, src.arr.data, src.arr.count)
    PCDynamicArray_uint8_insert_range(
      this.arr,
      this.arr.count >>> 0,
      src.arr.data,
      src.arr.count >>> 0,
    );
  }

  /**
   * `PCByteWriteStream::writeData(uint8_t* data, uint32_t len)` — flush any pending bits, then
   * append `len` bytes from `data` at the current tail.
   * @ProCore 0x0000000000023534  (__ZN17PCByteWriteStream9writeDataEPhj)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCByteWriteStream.writeData.s):
   *   0x23534-0x2353d  prologue
   *   0x2353e           ebx = edx = len
   *   0x23540           r14 = rsi = data
   *   0x23543           r15 = rdi = this
   *   0x23546-0x23549   callq *(vptr+0x38)                                       — flushBits()
   *   0x2354c           esi = *(this+0x18)                                       — this.arr.count
   *   0x23550           r15 = this + 0x18                                        — &this.arr
   *   0x23554-0x23566   tail-jmp __ZN14PCDynamicArrayIhE6insertEjPKhj
   *                     ⇒ PCDynamicArray<uint8_t>::insert(&this.arr, this.arr.count, data, len)
   */
  writeData(data: Uint8Array, len: number): void {
    // @0x23546-0x23549 — flushBits() via vtable slot +0x38.
    this.flushBits();
    // @0x2354c-0x23566 — tail-jmp insert range.
    PCDynamicArray_uint8_insert_range(this.arr, this.arr.count >>> 0, data, len >>> 0);
  }
}
