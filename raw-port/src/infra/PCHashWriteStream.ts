// PCHashWriteStream.ts — ProCore's hashing serializer sink.
//
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore
//
// `PCHashWriteStream` is the `PCSerializerWriteStream` subclass that, instead
// of emitting bytes to a file, funnels everything an object serializes into a
// `PCHash128` — this is how FCP fingerprints a serialized object graph. It
// buffers writes in an inline byte buffer at +0x40 and folds the buffer into
// the hash whenever it fills or the stream is closed.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS FILE (one C++ method = one member citing its @0xADDR)
// -----------------------------------------------------------------------------
//   * PCHashWriteStream::setHash(PCHash128 const&)   @ProCore 0x24b66
//     __ZN17PCHashWriteStream7setHashERK9PCHash128
//     DECODE: raw-port/re/disasm/ProCore.__ZN17PCHashWriteStream7setHashERK9PCHash128.s
//
// Every other member (the ctors @0x237ca / @0x23832, the dtors @0x2383c /
// @0x23866 / @0x23890, close @0x238c8, reset @0x238fe, the writeValue /
// writeAttribute overload families @0x2392c..@0x24b24, getHash @0x24b2a,
// print @0x24b82, isHashStream @0x24bee) is NOT ported here — this file is
// ADD-ONLY and each lands as its own member when its unit is claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — every offset cited to the instruction it was recovered from
// -----------------------------------------------------------------------------
// Primary evidence: the default ctor `PCHashWriteStream::PCHashWriteStream()`
// @ProCore 0x237ca (raw-port/re/disasm/ProCore.__ZN17PCHashWriteStreamC2Ev.s),
// cross-checked against the two flush methods that read the same slots,
// `close()` @0x238c8 and `getHash()` @0x24b2a, and against `reset()` @0x238fe
// (whose first four instructions are byte-identical to setHash's).
//
//   PCHashWriteStream : PCSerializerWriteStream {
//     +0x00  vptr                    [ctor @0x237e0 `movq %rax,(%rbx)`, after
//                                     the base ctor call
//                                     `PCSerializerWriteStream::PCSerializerWriteStream()`
//                                     @0x237d4]
//     +0x08..0x1f  base-class fields  [the unwind path @0x23818 touches +0x08
//                                     and +0x10; not decoded by this unit]
//     +0x20  PCHash128 hash (16 B)   [ctor @0x237e3 `leaq 0x20(%rbx),%rdi` ->
//                                     @0x237e7 `callq PCHash128::PCHash128()`;
//                                     getHash @0x24b3d passes the same address
//                                     as the PCHash128 `this` to
//                                     PCHash128::addData @0x24b45, and returns
//                                     it @0x24b58 `addq $0x20,%rbx`]
//     +0x30  uint32 bufferCapacity   [ctor @0x237ec `movabsq $0x100000001000,%rax`
//                                     -> @0x237f6 `movq %rax,0x30(%rbx)`: the LOW
//                                     eightbyte-half lands 0x1000 in +0x30]
//     +0x34  uint32 bufferRemaining  [the HIGH half of that same 8-byte store =
//                                     0x1000; read by close @0x238d4 and
//                                     getHash @0x24b36]
//     +0x38  uint8* writeCursor      [ctor @0x237fa `leaq 0x40(%rbx),%rax` ->
//                                     @0x237fe `movq %rax,0x38(%rbx)`: initialized
//                                     to point AT the inline buffer]
//     +0x40  uint8 buffer[0x1000]    [the address `this+0x40` is what +0x38 is
//                                     reset to (ctor @0x237fa, close @0x238ee,
//                                     getHash @0x24b50, setHash @0x24b70) and is
//                                     the data pointer handed to
//                                     PCHash128::addData (close @0x238df,
//                                     getHash @0x24b41). Its length is the
//                                     capacity constant 0x1000 read @0x237ec.]
//   }
//
// PENDING-BYTE ACCOUNTING (decoded from close @0x238c8 and getHash @0x24b2a,
// which share one body shape):
//     edx = *(u32*)(this+0x30)        ; capacity
//     eax = *(u32*)(this+0x34)        ; remaining
//     edx -= eax                      ; pending = capacity - remaining
//     if (pending != 0)
//         PCHash128::addData(&this->hash, &this->buffer, pending)
//     *(u32*)(this+0x34) = *(u32*)(this+0x30)   ; remaining = capacity
//     *(void**)(this+0x38) = this+0x40          ; cursor = &buffer
// i.e. +0x34 counts DOWN as bytes are buffered, and `capacity - remaining` is
// the number of live bytes sitting in the buffer.
//
// FRONTIER CALLEES: none for this unit — `setHash` is a leaf (no calls, no
// externs, no indirect/virtual dispatch).
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6.

import { PCHash128 } from "./PCHash128";

export class PCHashWriteStream {
  /**
   * `+0x20  PCHash128 hash` — the accumulating 128-bit digest.
   *
   * Default-constructed in place by the ctor: `leaq 0x20(%rbx),%rdi`
   * @ProCore 0x237e3 followed by `callq PCHash128::PCHash128()` @0x237e7,
   * which zero-fills all 16 bytes. `getHash()` @0x24b58 returns this very
   * sub-object's address (`addq $0x20,%rbx`), and `close()`/`getHash()` pass
   * it as the receiver of `PCHash128::addData` (@0x238e3 / @0x24b45).
   */
  hash: PCHash128 = new PCHash128();

  /**
   * `+0x30  uint32 bufferCapacity` — the size of the inline buffer, 0x1000.
   *
   * Set by the ctor's single 8-byte store of the immediate
   * `movabsq $0x100000001000, %rax` @ProCore 0x237ec / `movq %rax, 0x30(%rbx)`
   * @0x237f6: the low half of that immediate (0x00001000) lands here.
   */
  bufferCapacity = 0x1000;

  /**
   * `+0x34  uint32 bufferRemaining` — bytes still free in the inline buffer;
   * `bufferCapacity - bufferRemaining` is the number of buffered bytes not yet
   * folded into the hash (see the PENDING-BYTE ACCOUNTING block above).
   *
   * Initialized to 0x1000 (empty buffer) by the HIGH half of the same ctor
   * store @ProCore 0x237f6.
   */
  bufferRemaining = 0x1000;

  /**
   * `+0x38  uint8* writeCursor` — where the next serialized byte goes.
   *
   * In the binary this is an absolute pointer, initialized to `this + 0x40`
   * (`leaq 0x40(%rbx),%rax` @ProCore 0x237fa / `movq %rax,0x38(%rbx)`
   * @0x237fe) and reset to that same address by close @0x238ee, getHash
   * @0x24b50 and setHash @0x24b70. Since the only address it ever holds is
   * inside {@link PCHashWriteStream.buffer}, it is modelled as a BYTE OFFSET
   * from the start of that buffer: offset 0 IS the pointer value `this+0x40`.
   * No decoded code compares it against anything but the buffer base, and the
   * pending-byte count is derived from +0x30/+0x34 rather than from this
   * pointer, so the offset representation is observationally identical.
   */
  writeCursor = 0;

  /**
   * `+0x40  uint8 buffer[0x1000]` — the inline staging buffer whose address is
   * handed to `PCHash128::addData` (close @ProCore 0x238df, getHash @0x24b41).
   * Its length is the capacity constant 0x1000 read @0x237ec.
   */
  buffer = new Uint8Array(0x1000);

  /**
   * `PCHashWriteStream::setHash(PCHash128 const& src)` — ProCore @0x00024b66
   * (mangled `__ZN17PCHashWriteStream7setHashERK9PCHash128`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/ProCore.__ZN17PCHashWriteStream7setHashERK9PCHash128.s):
   *
   *   0x24b66  pushq  %rbp                  ; frame setup (no TS counterpart)
   *   0x24b67  movq   %rsp, %rbp            ; frame setup (no TS counterpart)
   *   0x24b6a  movl   0x30(%rdi), %eax      ; eax = this->bufferCapacity
   *   0x24b6d  movl   %eax, 0x34(%rdi)      ; this->bufferRemaining = capacity
   *   0x24b70  leaq   0x40(%rdi), %rax      ; rax = &this->buffer[0]
   *   0x24b74  movq   %rax, 0x38(%rdi)      ; this->writeCursor = &buffer[0]
   *   0x24b78  movups (%rsi), %xmm0         ; xmm0 = the 16-byte src PCHash128
   *   0x24b7b  movups %xmm0, 0x20(%rdi)     ; this->hash = src   (16-byte copy)
   *   0x24b7f  popq   %rbp                  ; frame teardown (no TS counterpart)
   *   0x24b80  retq                         ; void return
   *   0x24b81  nop                          ; alignment padding, not executed
   *
   * Semantics: OVERWRITE the accumulated digest with `src` and empty the
   * staging buffer.
   *
   * The buffer reset is the SAME three-instruction sequence the flush methods
   * end with (`close` @0x238eb-@0x238f2, `getHash` @0x24b4d-@0x24b54) and that
   * `reset()` @0x238fe opens with — but note what setHash does NOT do: it never
   * calls `PCHash128::addData`. `close`/`getHash` first fold any pending bytes
   * (`capacity - remaining != 0`) into the digest @0x238e3 / @0x24b45; setHash
   * has no such test and no such call, so buffered bytes are DISCARDED, not
   * hashed. Transcribing the missing call as "flush first" would be a rewrite.
   *
   * The two `movups` are one unaligned 16-byte load/store pair — a whole-object
   * copy of the 4x uint32 PCHash128 state (a,b,c,d), which is why the port
   * copies all four fields rather than aliasing the source object (the native
   * code copies BYTES into this object; it does not retain the reference).
   *
   * Zero callees, zero externs, zero indirect calls, no null check.
   *
   * @param src the `PCHash128 const&` to copy in (`%rsi`).
   */
  setHash(src: PCHash128): void {
    // @ProCore 0x24b6a: movl 0x30(%rdi), %eax
    // @ProCore 0x24b6d: movl %eax, 0x34(%rdi)  — remaining = capacity.
    this.bufferRemaining = this.bufferCapacity >>> 0;
    // @ProCore 0x24b70: leaq 0x40(%rdi), %rax
    // @ProCore 0x24b74: movq %rax, 0x38(%rdi)  — cursor = &buffer[0], i.e. 0.
    this.writeCursor = 0;
    // @ProCore 0x24b78: movups (%rsi), %xmm0
    // @ProCore 0x24b7b: movups %xmm0, 0x20(%rdi) — 16-byte copy of the state.
    this.hash.a = src.a >>> 0;
    this.hash.b = src.b >>> 0;
    this.hash.c = src.c >>> 0;
    this.hash.d = src.d >>> 0;
  }
}
