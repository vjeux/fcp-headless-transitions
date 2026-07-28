// PCDebugByteWriteStream — ProCore debug subclass of PCByteWriteStream that
// mirrors every accepted byte to stderr via `fprintf(stderr, "%x\n", byte)`.
// A tiny wrapper class useful for inspecting the byte-level output of an
// arbitrary PCByteWriteStream stream in place.
//
// Framework: ProCore.framework (Final Cut Pro).
//
// Exported surface (nm evidence from the FCP-shipped ProCore x86_64 slice):
//
//   000000000002356c T __ZN22PCDebugByteWriteStream11writeStreamER17PCByteWriteStream
//   00000000000235c6 t __ZN22PCDebugByteWriteStreamD1Ev
//   00000000000235f6 t __ZN22PCDebugByteWriteStreamD0Ev
//   0000000000023626 t __ZN22PCDebugByteWriteStream12writeCurByteEv
//   0000000000149540 S __ZTV22PCDebugByteWriteStream
//   00000000001495a8 S __ZTI22PCDebugByteWriteStream
//
// The class inherits (single, non-virtual) from `PCByteWriteStream`. Evidence:
// both D1 and D0 install `&__ZTV17PCByteWriteStream + 0x10` (at 0x1494d8) into
// (*this) BEFORE running derived-class cleanup — this is the classic derived
// dtor "reset vptr to base's vtable" idiom, only emitted when the derived class
// inherits from that exact base class at offset 0. Same pattern that Itanium
// ABI uses everywhere.
//
// Layout inferred from asm:
//   offset 0x00   vptr                    (installed to this class's vtable +0x10 by ctor,
//                                          reset to PCByteWriteStream's vtable +0x10 in dtors)
//   offset 0x08   cur_byte    uint8_t     (accumulator; writeCurByte reads (%rbx+8), then zeroes)
//   offset 0x0c   bit_count   uint32_t    (bits-until-next-emit; writeCurByte resets to 8)
//   offset 0x18   len         uint32_t    (byte array length; writeStream reads (%rbx+0x18))
//   offset 0x20   data        uint8_t*    (byte array data ptr; D1/D0 test & delete[] it)
//
// The 0x18 (uint32_t length) + 0x20 (uint8_t*) pair AT OFFSETS 0x18/0x20 is
// the shape of `PCDynamicArray<uint8_t>` — its unrolled fields inlined into
// this object (single-inheritance is the alternative but the base at offset 0
// is `PCByteWriteStream` per the dtor evidence, so PCDynamicArray must be a
// MEMBER, not a base). writeCurByte passes `&(this+0x18)` to
// `PCDynamicArray<uint8_t>::insert(unsigned int, unsigned char const&)` at
// 0x23670 — that's the array's `this` pointer, confirming it's an inline
// member starting at +0x18. (Note: writeCurByte then hardcodes the length via
// `movl 0x18(%rbx), %esi` to pass the *current* length as the insert-index,
// i.e. always inserts at the tail.)
//
// Source disassembly (llvm-objdump/otool) committed under
//   raw-port/re/disasm/ProCore.PCDebugByteWriteStream.<method>.s
//
// Full disasm:
//
// (writeStream)
//   __ZN22PCDebugByteWriteStream11writeStreamER17PCByteWriteStream:
//     0x2356c cmpl  $0x0, 0x18(%rsi)                        ; if (source.len == 0)
//     0x23570 je    0x235c4                                 ;   return;
//     0x23572 pushq %rbp
//     0x23573 movq  %rsp, %rbp
//     0x23576 pushq %r15
//     0x23578 pushq %r14
//     0x2357a pushq %r13
//     0x2357c pushq %r12
//     0x2357e pushq %rbx
//     0x2357f pushq %rax                                    ; 16B stack align
//     0x23580 movq  %rsi, %rbx                              ; rbx = &source
//     0x23583 movq  0x20(%rsi), %r15                        ; r15 = source.data (uint8_t*)
//     0x23587 movq  0x124c9a(%rip), %r12                    ; r12 = &___stderrp (GOT @0x148228)
//     0x2358e leaq  0x10e5bc(%rip), %r14                    ; r14 = "%x\n" (@0x131b51)
//     0x23595 xorl  %r13d, %r13d                            ; i = 0
//   loop @0x23598:
//     0x23598 movq  (%r12), %rdi                            ; rdi = *___stderrp = stderr FILE*
//     0x2359c movzbl (%r15,%r13), %edx                      ; edx = source.data[i]  (uint8_t -> int)
//     0x235a1 movq  %r14, %rsi                              ; rsi = "%x\n"
//     0x235a4 xorl  %eax, %eax                              ; al = 0  (variadic float count)
//     0x235a6 callq _fprintf                                ; fprintf(stderr, "%x\n", byte)
//     0x235ab incq  %r13                                    ; i++
//     0x235ae movl  0x18(%rbx), %eax                        ; eax = source.len (uint32_t; zero-ext)
//     0x235b1 cmpq  %rax, %r13
//     0x235b4 jb    0x23598                                 ; loop while (i < len)
//     0x235b6..0x235c4 epilogue -> retq
//
// Uses ONE argument only: `source` (a `PCByteWriteStream&` — arg1 rsi). The
// derived `this` (rdi) is completely unused; this method reads exclusively
// from source. That's why the vtable slot must resolve to a virtual override
// of `PCByteWriteStream::writeStream(PCByteWriteStream&)` — the debug wrapper
// just fprintf's every byte and doesn't touch its own state at all.
//
// (D1 — complete-object dtor)
//   __ZN22PCDebugByteWriteStreamD1Ev:
//     0x235c6 pushq %rbp
//     0x235c7 movq  %rsp, %rbp
//     0x235ca pushq %rbx
//     0x235cb pushq %rax                                    ; 16B align
//     0x235cc movq  %rdi, %rbx                              ; spill this
//     0x235cf leaq  0x125f02(%rip), %rax                    ; @0x1494d8 = &PCByteWriteStream::__ZTV+0x10
//     0x235d6 movq  %rax, (%rdi)                            ; (*this).vptr = base's vtable+0x10
//     0x235d9 movq  0x20(%rdi), %rdi                        ; rdi = this->data (uint8_t*)
//     0x235dd testq %rdi, %rdi                              ; if (data)
//     0x235e0 je    0x235e7
//     0x235e2 callq operator delete[](void*)                ;   delete[] data;
//     0x235e7 movq  $0x0, 0x20(%rbx)                        ; this->data = nullptr
//     0x235ef..0x235f5 epilogue -> retq
//
// (D0 — deleting dtor)
//   __ZN22PCDebugByteWriteStreamD0Ev:
//     0x235f6 pushq %rbp
//     0x235f7 movq  %rsp, %rbp
//     0x235fa pushq %rbx
//     0x235fb pushq %rax                                    ; 16B align
//     0x235fc movq  %rdi, %rbx                              ; spill this
//     0x235ff leaq  0x125ed2(%rip), %rax                    ; @0x1494d8 = &PCByteWriteStream::__ZTV+0x10
//     0x23606 movq  %rax, (%rdi)                            ; (*this).vptr = base's vtable+0x10
//     0x23609 movq  0x20(%rdi), %rdi                        ; rdi = this->data
//     0x2360d testq %rdi, %rdi
//     0x23610 je    0x23617
//     0x23612 callq operator delete[](void*)                ; delete[] data;
//     0x23617 movq  %rbx, %rdi                              ; rdi = this
//     0x2361a addq  $0x8, %rsp
//     0x2361e popq  %rbx
//     0x2361f popq  %rbp
//     0x23620 jmp   operator delete(void*)                  ; tail-jmp `delete this`
//
// (D0 vs D1: D0 additionally tail-jmps to `operator delete(this)` to free the
//  heap slot. Note this is a THIN dtor — the D0 body does NOT chain the base
//  D2; it inlines the pertinent base-dtor state (vtable reset, this->data
//  delete[], this->data = 0) because those are the only cleanup steps
//  PCByteWriteStream needs done. This is unusual — normally a derived D0
//  chains to the base D2. It means `PCByteWriteStream` in this build has no
//  further cleanup beyond what D1/D0 already inline here, i.e. this class
//  effectively OWNS the `data` pointer and the `PCByteWriteStream` base is
//  otherwise trivially destructible. We keep the port faithful to the asm.)
//
// (writeCurByte — flushes the accumulated `cur_byte` to stderr + inserts it
//  at the tail of the PCDynamicArray<uint8_t>, then resets accumulator to 0
//  and bit_count to 8.)
//
//   __ZN22PCDebugByteWriteStream12writeCurByteEv:
//     0x23626 pushq %rbp
//     0x23627 movq  %rsp, %rbp
//     0x2362a pushq %r14
//     0x2362c pushq %rbx
//     0x2362d movq  %rdi, %rbx                              ; spill this
//     0x23630 movq  0x124bf1(%rip), %rax                    ; &___stderrp
//     0x23637 movq  (%rax), %rdi                            ; rdi = stderr FILE*
//     0x2363a leaq  0x8(%rbx), %r14                         ; r14 = &this->cur_byte
//     0x2363e movzbl 0x8(%rbx), %edx                        ; edx = this->cur_byte
//     0x23642 leaq  0x10e508(%rip), %rsi                    ; rsi = "%x\n"
//     0x23649 xorl  %eax, %eax                              ; variadic float count = 0
//     0x2364b callq _fprintf                                ; fprintf(stderr, "%x\n", cur_byte)
//     0x23650 leaq  0x18(%rbx), %rdi                        ; rdi = &this->arrayInline (@+0x18)
//     0x23654 movl  0x18(%rbx), %esi                        ; esi = arrayInline.len (uint32_t)
//                                                             (used as insert-position: end-of-array)
//     0x23657 movq  %r14, %rdx                              ; rdx = &this->cur_byte
//     0x2365a callq PCDynamicArray<uint8_t>::insert(uint32_t, uint8_t const&)
//                                                            ; array.insert(len, cur_byte)
//     0x2365f movb  $0x0, 0x8(%rbx)                         ; this->cur_byte = 0
//     0x23663 movl  $0x8, 0xc(%rbx)                         ; this->bit_count = 8
//     0x2366a..0x2366e epilogue -> retq
//
// RIP-relative constants:
//   @0x131b51 (4B)                          : 25 78 0a 00
//                                             = ASCII "%x\n\0" — printf format
//   @0x148228 = GOT slot for `___stderrp`   (`fprintf(*___stderrp, ...)`)
//   @0x1494d8 = `PCByteWriteStream::__ZTV + 0x10`
//                                            (installed at (*this) by D0/D1)
//   @0x149540 = `PCDebugByteWriteStream::__ZTV`  (this class's own vtable)
//   @0x1495a8 = `PCDebugByteWriteStream::__ZTI`  (RTTI — unreferenced in this
//                                                 slice's ported entrypoints;
//                                                 emitted for typeid support)
//
// Callees:
//   0x000de888  -> _fprintf                                (libSystem stub)
//   0x000de6ba  -> operator delete[](void*)  == __ZdaPv    (libc++abi stub)
//   0x000de6c0  -> operator delete(void*)    == __ZdlPv    (libc++abi stub)
//   0x00023670  -> PCDynamicArray<unsigned char>::insert(unsigned int, unsigned char const&)
//   0x00148228  -> ___stderrp GOT slot (bind to libSystem.___stderrp)
//
// None of those callees are ported yet. Each call is rendered as a stub
// citing its address (PORTING_SPEC.md P4 — undecoded callee is a stub with
// @0xADDR on the same line as its message).

// -----------------------------------------------------------------------------
// Undecoded external stubs.
// -----------------------------------------------------------------------------

//
// libSystem `fprintf` — first arg is a FILE*, second is a printf format, then
// varargs. Un-ported. Stub throws @0x000de888.
//
function libSystem_fprintf(_stream: unknown, _fmt: string, ..._args: number[]): number {
  throw new Error("fprintf not yet transcribed @0x000de888 (libSystem stub)");
}

//
// libc++abi `operator delete[](void*)`. Un-ported. Stub throws @0x000de6ba.
//
function operator_delete_array(_p: Uint8Array | null): void {
  throw new Error("operator delete[](void*) not yet transcribed @0x000de6ba (__ZdaPv)");
}

//
// libc++abi `operator delete(void*)`. Un-ported. Stub throws @0x000de6c0.
//
function operator_delete(_p: PCDebugByteWriteStream): void {
  throw new Error("operator delete(void*) not yet transcribed @0x000de6c0 (__ZdlPv)");
}

//
// `PCDynamicArray<unsigned char>::insert(unsigned int, unsigned char const&)`
// — arg1 = index, arg2 = ref to byte. Un-ported. Stub throws @0x00023670.
//
function PCDynamicArray_uint8_insert(
  _self: PCDynamicArrayUint8,
  _index: number,
  _byte: number,
): void {
  throw new Error(
    "PCDynamicArray<unsigned char>::insert(uint32_t, uint8_t const&) not yet transcribed @0x00023670",
  );
}

//
// libSystem GOT slot for `___stderrp` (a FILE**). Un-ported. Stub throws
// @0x00148228. Every ported entrypoint that needs `stderr` calls this to
// resolve it dynamically, exactly like the asm loads `*(*___stderrp GOT)`.
//
function libSystem_stderrp(): unknown {
  throw new Error("libSystem ___stderrp not yet transcribed @0x00148228 (GOT slot)");
}

// -----------------------------------------------------------------------------
// Static rodata — verbatim byte-level.
// -----------------------------------------------------------------------------

// @const 0x131b51 — printf format "%x\n" (four bytes: 25 78 0a 00).
const CONST_FMT_HEX_NL = "%x\n";

// @const 0x1494d8 — address stored into (*this) by D1/D0 (== base class's
// vtable + 0x10). The derived vtable @0x149540 is installed by the C1/C2
// ctors (not in this class's exported symbol set — the ctors live upstream
// on `PCByteWriteStream` or on a subclass factory).
const PC_BYTE_WRITE_STREAM_VTABLE_PLUS_10 = "PCByteWriteStream::__vtable+0x10";

// -----------------------------------------------------------------------------
// Structural stubs for the referenced but un-ported types.
// -----------------------------------------------------------------------------

//
// Forward-declared type for `PCByteWriteStream` (the base class). The
// exported writeStream method takes a reference to one and reads two of its
// fields (`len` at +0x18, `data` at +0x20) — exactly the same offsets the
// PCDynamicArray<uint8_t> uses, i.e. `PCByteWriteStream` most likely IS or
// EMBEDS a PCDynamicArray<uint8_t> at that offset. We model just the two
// fields the ported method touches.
//
export interface PCByteWriteStream {
  readonly len: number;         // uint32_t at +0x18
  readonly data: Uint8Array;    // uint8_t*   at +0x20 (length == len)
}

//
// Forward-declared type for `PCDynamicArray<unsigned char>` — inlined at
// offset 0x18 of this class. Its ported methods live elsewhere; we only need
// a nominal handle here so `insert` can accept it.
//
interface PCDynamicArrayUint8 {
  readonly len: number;         // uint32_t at +0x00 of the array (matches (this+0x18))
  readonly data: Uint8Array;    // uint8_t*   at +0x08 of the array (matches (this+0x20))
}

// -----------------------------------------------------------------------------
// PCDebugByteWriteStream — the actual port.
// -----------------------------------------------------------------------------

//
// A debug wrapper stream. Faithfully mirrors the layout described above and
// the exact behavior of the four exported symbols.
//
export class PCDebugByteWriteStream {
  // (*this)[0x00..0x08] — vptr. Installed to this class's vtable + 0x10 by
  // the (external) ctor; reset to PCByteWriteStream::__vtable+0x10 by D1/D0
  // before member cleanup.
  public vptr: string = "PCDebugByteWriteStream::__vtable+0x10";

  // +0x08 — current-byte accumulator (uint8_t). Reset to 0 by writeCurByte.
  public cur_byte: number = 0;

  // +0x0c — bits-until-next-flush (uint32_t). Reset to 8 by writeCurByte.
  public bit_count: number = 0;

  //
  // +0x18 — inline PCDynamicArray<uint8_t>. Modeled as { len, data } to
  // preserve the shape the asm actually reads/writes. writeCurByte inserts
  // at index `this.arrayInline.len` (i.e. at the tail).
  //
  public arrayInline: PCDynamicArrayUint8 = { len: 0, data: new Uint8Array(0) };

  //
  // Virtual `writeStream` override — mirrors every byte of `source` to
  // stderr. Reads source.len at +0x18, source.data at +0x20; writes NOTHING
  // to `this`. Early-exit if `source.len == 0`.
  //
  // @from PCDebugByteWriteStream::writeStream(PCByteWriteStream&) @0x2356c
  //
  writeStream(source: PCByteWriteStream): void {
    // @0x2356c-0x23570 — early-exit
    if (source.len === 0) {
      return;
    }

    // @0x23583 — r15 = source.data
    const data = source.data;
    // @0x23587 — r12 = &___stderrp
    const stderr = libSystem_stderrp();
    // @0x2358e — r14 = "%x\n"
    // (kept inline via CONST_FMT_HEX_NL below)

    // @0x23595 — i = 0
    let i = 0;
    // @0x23598..0x235b4 — loop while (i < source.len)
    //   NB: the asm reloads source.len each iteration (movl 0x18(%rbx), %eax).
    //   Any external mutation of source.len during the loop would be
    //   observable — we mirror by re-reading source.len every iteration.
    while ((i >>> 0) < (source.len >>> 0)) {
      // @0x2359c — edx = source.data[i] (zero-extended byte)
      const byte = data[i]! & 0xff;
      // @0x235a6 — fprintf(stderr, "%x\n", byte)
      libSystem_fprintf(stderr, CONST_FMT_HEX_NL, byte);
      // @0x235ab — i++
      i = (i + 1) >>> 0;
    }
    // @0x235b6..0x235c4 — epilogue
  }

  //
  // Complete-object dtor. Resets vptr to base's vtable+0x10, then if
  // `this.data` is non-null delete[]s it and nulls the pointer field.
  //
  // In the ported model, "this->data" is `arrayInline.data`. To preserve
  // the byte-level semantics, we set `arrayInline` to a fresh { len: 0,
  // data: empty } after the delete[] (mirroring `movq $0x0, 0x20(%rbx)`).
  //
  // @from PCDebugByteWriteStream::~PCDebugByteWriteStream() @0x235c6 (D1)
  //
  destroy(): void {
    // @0x235cf-0x235d6 — install base's vtable+0x10 into (*this)
    this.vptr = PC_BYTE_WRITE_STREAM_VTABLE_PLUS_10;

    // @0x235d9-0x235e0 — rdi = this->data; if (data) delete[] data;
    const data: Uint8Array | null = this.arrayInline.data.length > 0
      ? this.arrayInline.data
      : null;
    if (data !== null) {
      // @0x235e2 — operator delete[](data)
      operator_delete_array(data);
    }

    // @0x235e7 — this->data = nullptr
    this.arrayInline = { len: 0, data: new Uint8Array(0) };
  }

  //
  // Deleting dtor — same body as destroy(), then tail-jmps to
  // `operator delete(this)` (i.e. `delete this`).
  //
  // The asm does NOT chain to the base D2 — it inlines the same three cleanup
  // steps D1 does (vtable reset, delete[] data, this->data = 0). See the
  // class-level comment for the "thin dtor" note.
  //
  // @from PCDebugByteWriteStream::~PCDebugByteWriteStream() @0x235f6 (D0)
  //
  destroyAndDelete(): void {
    // @0x235ff-0x23606 — install base's vtable+0x10 into (*this)
    this.vptr = PC_BYTE_WRITE_STREAM_VTABLE_PLUS_10;

    // @0x23609-0x23610 — rdi = this->data; if (data) delete[] data;
    const data: Uint8Array | null = this.arrayInline.data.length > 0
      ? this.arrayInline.data
      : null;
    if (data !== null) {
      // @0x23612 — operator delete[](data)
      operator_delete_array(data);
    }

    // (NB: D0's body does NOT null out this->data before tail-jmp — asm
    //  goes straight to operator delete(this). We match that.)

    // @0x23620 — jmp operator delete(this)
    operator_delete(this);
  }

  //
  // Flushes `cur_byte` to stderr, appends it at the tail of `arrayInline`
  // via PCDynamicArray<uint8_t>::insert(len, cur_byte), then resets
  // cur_byte=0 and bit_count=8.
  //
  // @from PCDebugByteWriteStream::writeCurByte() @0x23626
  //
  writeCurByte(): void {
    // @0x23630-0x23637 — rdi = stderr FILE*
    const stderr = libSystem_stderrp();

    // @0x2363a-0x2363e — edx = this->cur_byte (uint8_t zero-extended)
    const b = this.cur_byte & 0xff;

    // @0x2364b — fprintf(stderr, "%x\n", cur_byte)
    libSystem_fprintf(stderr, CONST_FMT_HEX_NL, b);

    // @0x23650-0x2365a — array.insert(index = array.len, value = &cur_byte)
    //   The index is loaded fresh (movl 0x18(%rbx), %esi) each call, so we
    //   also snapshot it locally here — mirroring "insert at current tail".
    const insertIndex = this.arrayInline.len >>> 0;
    PCDynamicArray_uint8_insert(this.arrayInline, insertIndex, b);

    // @0x2365f — this->cur_byte = 0
    this.cur_byte = 0;
    // @0x23663 — this->bit_count = 8
    this.bit_count = 8;
  }
}
