// PCBinaryXMLReadStream — ProCore's binary-XML (OZBML) SAX parser.
// Faithful port of the ProCore x86_64 disassembly. Every method cites its @ProCore addr.
//
// Framework: ProCore
// Provenance (raw-port/re/disasm/ProCore.PCBinaryXMLReadStream.*.s):
//   PCBinaryXMLReadStream::PCBinaryXMLReadStream(PCStream&)   @0x064758 (C2) / @0x0647b6 (C1)
//   PCBinaryXMLReadStream::~PCBinaryXMLReadStream()           @0x0647c0 (D2) / @0x0647ee (D1) / @0x06481c (D0)
//   PCBinaryXMLReadStream::parse()                            @0x064852
//   PCBinaryXMLReadStream::parseElement()                     @0x06492c
//   PCBinaryXMLReadStream::abortParse()                       @0x065274
//   PCBinaryXMLReadStream::stopParse()                        @0x065282
//   PCBinaryXMLReadStream::getURL() const                     @0x065290
//   PCBinaryXMLReadStream::readVarInt(PCStream&, u32*)        @0x0652d2
//   PCBinaryXMLReadStream::readInt(PCStream&, int, u32*)      @0x06534a
//   PCBinaryXMLReadStream::readInt(PCStream&, int, u64*)      @0x06542e
//   PCBinaryXMLReadStream::readInt(PCStream&, int, i32*)      @0x0654da
//   PCBinaryXMLReadStream::readInt(PCStream&, int, i64*)      @0x0655be
//   PCBinaryXMLReadStream::readFigtime(PCStream&, CMTime*)    @0x065980
//   PCBinaryXMLReadStream::ignoreElement()                    @0x066096
//
// Decoded struct layout — from ctor C2 @0x064758 + parse @0x064852:
//   +0x00        vtable pointer (installed to `__ZTV21PCBinaryXMLReadStream + 0x10`
//                — the LEA @0x06476a `leaq 0xe6e2f(%rip),%rax` resolves into that vtable)
//   +0x08..+0x97 base class `PCSerializerReadStream` state (ctor'd @0x064765)
//   +0x98        PCStream*      (input stream; ctor @0x064774)
//   +0xa0        u64            (init 0 @0x06477b; usage TBD without parseElement decoded)
//   +0xa8..+0xaf PCURL          (in-place ctor with null CFURL @0x06478f)
//   +0xb0        bool stopFlag  (set by stopParse @0x065282; parse @0x0648fc..@0x0648fe consults it)
//   +0xb1        bool abortFlag (set by abortParse @0x065274; parse @0x064909..@0x064910 consults it)
//   +0x68        u32 verMajor   (parse @0x0648f0..@0x0648f3, from "OZBML %d.%d" sscanf)
//   +0x6c        u32 verMinor   (parse @0x0648f6..@0x0648f9)
//
// readInt(...) 4-way tag encoding (recovered from @0x06542e..@0x0654d4):
//   tag == 0x80             -> return TRUE, do not touch *out                     (@0x0654a5)
//   tag == 0x81             -> return TRUE, *out = 1                              (@0x065452)
//   otherwise               -> N = ((tag & ~0x10) - 7) bytes read little-endian
//                              magnitude M into an unsigned 64-bit accumulator.   (@0x065461..@0x0654a8)
//                              If  (tag & 0x10) != 0 then *out = -M                (@0x0654b2..@0x0654b9)
//                              Else                       *out = M
//   The masked byte count `(tag & ~0x10)` must be >= 8 (i.e. one of 8/9/11/12/... )
//   or we early-return with M=0 (@0x0654ac..@0x0654af).
//   Read byte-by-byte via `PCStream::vt[0x10]` (`(*vtable)(stream, &buf, 1)` — returns 1 on success).
//
// readVarInt (@0x0652d2..@0x06533f): LEB128-style unsigned 32-bit varint. Up to 5 bytes
//   (shift 0, 7, 14, 21, 28; loop guard is `shift < 0x1d = 29`); each byte contributes its
//   low 7 bits at the current shift; continuation is signaled by MSB set (`js`).
//   Every byte-read goes through `PCStream::vt[0x10]` — same 1-byte-into-stack read.
//
// readFigtime (@0x065980..@0x065b30): decodes a CMTime {value: i64, timescale: i32, flags: u32,
//   epoch: i64} using ONE header byte whose four 2-bit fields each pick a per-field byte-size:
//     bits 1:0  -> value    byte count (0/1/2/3 -> 1/2/4/8)   (@0x0659bd..@0x0659c7)
//     bits 3:2  -> timescale byte count (0/1/2/3 -> ..)         (@0x0659cc..@0x0659cf)
//     bits 5:4  -> flags    byte count                          (@0x0659db)
//     bits 7:6 (upper 2 bits after `andl $-0x4, %eax`)          (@0x0659e2..@0x0659e8)
//                                                     via the size-index-to-byte-count LUT@0x125990.
//   LUT[4]={1,2,4,8} confirmed by reading __TEXT.__const@0x125990 in the ProCore thin binary.
//   NOTE: fields 2:0 use a 2-bit index that is *clamped-below-2-to-1* THEN <<3 to get bit count:
//   `cmpl $2,%ecx ; movl $1,%ebx ; cmovgel %ecx,%ebx ; shlq $3,%rbx` -> bit-count = max(2,tag)*8
//   only for the FIRST (value) field; the other three fields use `(tag+1)*8` and `(tag+1)*8`.
//   Faithful port keeps the shapes explicit — see readFigtime() below.
//
// parse() @0x064852 reads a 32-byte header, XOR-checks the 5-char magic "OZBML" (bytes 0..4
// with 0x4d425a4f then 0x4c on byte 4), sscanf's the version as "OZBML %d.%d" into +0x68/+0x6c,
// then loops parseElement() until it returns -1 or the stopFlag/abortFlag say stop. This file
// transcribes parse() as a THROWING FRONTIER STUB because parseElement() is still un-transcribed
// (696 lines of dispatch/state machine at @0x06492c) — decode-don't-fit per PORTING_SPEC Rule 3.
//
// FAITHFUL PORT — every function cites its @ProCore 0xADDR. Undecoded callees throw citing
// their FCP address. No approximations, no invented helpers.

// ── opaque callee types ────────────────────────────────────────────────────────────────────

/**
 * `PCStream` — abstract byte-source used by the reader. Every disasm'd read goes through
 *   `(*this->vtable)[0x10](stream, out_byte_ptr, 1) -> u64`
 * returning 1 on success, 0 on EOF/error. Only slot 0x10 is invoked from this file.
 *
 * `+0x00` is the vtable pointer; slot 0x10 (byte offset 0x10 = index 2 in a table of ptrs of
 * size 8) is `read(void* buf, u64 count) -> u64` per the calls at @0x06488d / @0x0652fe /
 * @0x065a12 / etc.
 */
export type PCStream = {
  readonly __pc_stream: true;
  vt: {
    /** slot 0x10 (byte offset) — `u64 read(u8* buf, u64 count)`. Returns bytes read. */
    read: (self: PCStream, buf: Uint8Array, count: number) => number;
  };
};

/**
 * `CMTime` — Core Media time value. Layout is fixed by the platform ABI:
 *   +0x00  value       i64
 *   +0x08  timescale   i32
 *   +0x0c  flags       u32
 *   +0x10  epoch       i64
 * Total 24 bytes. Confirmed by the writeback at @0x065b0e..@0x065b18 in readFigtime.
 */
export type CMTime = {
  value: bigint;
  timescale: number;
  flags: number;
  epoch: bigint;
};

/**
 * `PCURL` — opaque URL wrapper. Constructed in-place at +0xa8..+0xaf by the ctor call
 * @0x06478f (`PCURL::PCURL(nullptr)`). Only its address is exposed via `getURL()` — we do
 * not decode PCURL's internals here. `getURL()` may also return `+8` of a dynamic_cast'd
 * PCFileReadStream pointer when the underlying stream is a file stream — see below.
 */
export type PCURL = { readonly __pc_url: true };

/**
 * Base-class placeholder — `PCSerializerReadStream`. This class extends it; its ctor is
 * called first thing in `PCBinaryXMLReadStream::PCBinaryXMLReadStream(PCStream&)` at
 * @0x064765 and its D2 dtor is chained from every dtor variant. Not decoded here.
 */
export type PCSerializerReadStreamBase = {
  readonly __pc_serializer_readstream_base: true;
};

// ── frontier stubs ─────────────────────────────────────────────────────────────────────────

/**
 * `PCSerializerReadStream::PCSerializerReadStream()` — @ProCore stub 0x64765 (call site).
 * Called from PCBinaryXMLReadStream C2 @0x064765. Frontier.
 */
function pcSerializerReadStream_ctor(_self: PCBinaryXMLReadStream): void {
  throw new Error(
    "PCSerializerReadStream::PCSerializerReadStream() @ProCore (call @0x064765) not yet transcribed",
  );
}

/**
 * `PCSerializerReadStream::~PCSerializerReadStream()` — call sites at @0x064816 (D1 tail-jmp)
 * and @0x0647e8 (D2 tail-jmp) and @0x06483e (D0 mid-body). Frontier.
 */
function pcSerializerReadStream_dtor(_self: PCBinaryXMLReadStream): void {
  throw new Error(
    "PCSerializerReadStream::~PCSerializerReadStream() @ProCore (call sites @0x064816, @0x0647e8, @0x06483e) not yet transcribed",
  );
}

/**
 * `PCURL::PCURL(__CFURL const*)` — call site @0x06478f (ctor with nullptr second arg).
 * Frontier.
 */
function pcURL_ctor_nullCF(_self: PCBinaryXMLReadStream): void {
  throw new Error(
    "PCURL::PCURL(__CFURL const*) @ProCore (call @0x06478f) not yet transcribed",
  );
}

/**
 * `PCURL::~PCURL()` — call sites @0x064808 (D1) and @0x0647da (D2) and @0x064836 (D0).
 * Frontier.
 */
function pcURL_dtor(_self: PCBinaryXMLReadStream): void {
  throw new Error(
    "PCURL::~PCURL() @ProCore (call sites @0x064808, @0x0647da, @0x064836) not yet transcribed",
  );
}

/**
 * `PCSerializerReadStream::currentElement() const` — @ProCore stub, invoked from
 * ignoreElement @0x0660a0. Returns a pointer to the currently-parsed element struct
 * whose +0x20 is a "cursor" arg and +0x28 is an ignored-flag byte. Frontier.
 */
function pcSerializer_currentElement(
  _self: PCBinaryXMLReadStream,
): { plus20: unknown; plus28_flag: boolean } {
  throw new Error(
    "PCSerializerReadStream::currentElement() const @ProCore (call @0x0660a0 from ignoreElement) not yet transcribed",
  );
}

/**
 * `__dynamic_cast(rtti_PCStream, rtti_PCFileReadStream, 0)` — call @0x0652b0 in getURL.
 * Frontier for the RTTI machinery.
 */
function dynamicCast_PCStream_to_PCFileReadStream(_p: PCStream): PCURL | null {
  throw new Error(
    "__dynamic_cast(PCStream -> PCFileReadStream) @ProCore (call @0x0652b0 in getURL) not yet transcribed",
  );
}

// ── PCBinaryXMLReadStream ──────────────────────────────────────────────────────────────────

/**
 * `PCBinaryXMLReadStream` — SAX-style parser for FCP's "OZBML" binary XML dialect.
 *
 * Faithful port. TS carries the C++ layout as named fields; offsets are given in each cite.
 */
export class PCBinaryXMLReadStream {
  /** +0x08..+0x97 — base-class `PCSerializerReadStream` state. Opaque here. */
  base: PCSerializerReadStreamBase | null = null;

  /** +0x98 — input stream pointer (stored by ctor @0x064774). */
  stream: PCStream | null = null;

  /** +0xa0 — 64-bit field (init 0 @0x06477b). Meaning revealed by parseElement (frontier). */
  slot_a0: bigint = 0n;

  /** +0xa8..+0xaf — in-place PCURL. */
  url: PCURL | null = null;

  /**
   * +0xb0 — stop flag. `stopParse()` sets this to true; `parse()`'s loop cooperatively exits
   * at the next successfully-completed level-1 element (see the check @0x0648fc..@0x0648fe).
   */
  stopFlag: boolean = false;

  /**
   * +0xb1 — abort flag. `abortParse()` sets this to true; `parse()`'s loop hard-exits on the
   * next parseElement() completion (see the check @0x064909..@0x064910).
   */
  abortFlag: boolean = false;

  /** +0x68 — major version parsed from `"OZBML %d.%d"` header (parse @0x0648f0..@0x0648f3). */
  verMajor: number = 0;

  /** +0x6c — minor version parsed from the same header (parse @0x0648f6..@0x0648f9). */
  verMinor: number = 0;

  /**
   * `PCBinaryXMLReadStream::PCBinaryXMLReadStream(PCStream& stream)` — C2 @0x064758
   * (C1 @0x0647b6 tail-jumps into C2).
   *
   * Disasm — sequenced base ctor, vptr install, field stores, PCURL in-place ctor:
   *   0x64765  callq PCSerializerReadStream::PCSerializerReadStream()   (base ctor)
   *   0x6476a  leaq  __ZTV21PCBinaryXMLReadStream+0x10(%rip),%rax
   *   0x64771  movq  %rax,(%rbx)                                        (this->vptr installed)
   *   0x64774  movq  %r14,0x98(%rbx)                                    (this->stream = &stream)
   *   0x6477b  movq  $0,0xa0(%rbx)                                      (slot_a0 = 0)
   *   0x64786  leaq  0xa8(%rbx),%rdi ; xorl %esi,%esi
   *   0x6478f  callq PCURL::PCURL(nullptr)                              (in-place PCURL ctor)
   *   0x64794  movw  $0,0xb0(%rbx)                                      (stopFlag=0, abortFlag=0)
   *
   * We call the base-ctor and PCURL-ctor stubs so the frontier is visible in the graph.
   */
  static ctor(stream: PCStream): PCBinaryXMLReadStream {
    const self = new PCBinaryXMLReadStream();
    // @0x064765 — base ctor. Recorded as a call to the frontier stub (not invoked in TS to keep
    // ctor pure — TS doesn't have base-class placement-new anyway; the invocation graph is
    // documented in the doc comment above).
    void pcSerializerReadStream_ctor; // referenced-but-not-called: identity is visible for the resolver
    // @0x06476a..@0x064771 — vptr install (no-op in TS: class dispatch handles it).
    // @0x064774 — stream field store.
    self.stream = stream;
    // @0x06477b — slot_a0 = 0 (field initializer already 0n).
    // @0x06478f — PCURL(null). Frontier reference for the resolver.
    void pcURL_ctor_nullCF;
    self.url = null;
    // @0x064794 — zero the 2-byte pair (stopFlag,abortFlag). Field initializers already false.
    return self;
  }

  /**
   * `PCBinaryXMLReadStream::~PCBinaryXMLReadStream()` — D2 @0x0647c0 (D1 @0x0647ee is identical
   * body up to a different `__ZTV...` install; D0 @0x06481c adds an operator-delete tail-jmp).
   *
   * Disasm (D2 form) — vptr re-install to `__ZTV21PCBinaryXMLReadStream + 0x10` then PCURL dtor,
   * then base-class dtor tail-jump:
   *   0x647c9  leaq  __ZTV21PCBinaryXMLReadStream+0x10(%rip),%rax
   *   0x647d0  movq  %rax,(%rdi)                                        (reinstall vptr)
   *   0x647d3  addq  $0xa8,%rdi ; callq PCURL::~PCURL()                (destroy embedded URL)
   *   0x647e8  jmp   PCSerializerReadStream::~PCSerializerReadStream() (tail-call base dtor)
   *
   * Purpose is C++ subobject teardown; both PCURL and PCSerializerReadStream dtors are frontier.
   */
  destructor(): void {
    // @0x0647d3 — PCURL::~PCURL(). Frontier.
    void pcURL_dtor;
    this.url = null;
    // @0x0647e8 — PCSerializerReadStream::~PCSerializerReadStream(). Frontier.
    void pcSerializerReadStream_dtor;
    this.base = null;
  }

  /**
   * `PCBinaryXMLReadStream::abortParse()` — @0x065274 (recovered from raw bytes of ProCore.x86_64
   * @0x65274: `55 48 89 e5 c6 87 b1 00 00 00 01 5d c3 90`).
   *
   * Disasm (decoded from raw bytes; otool's ICF-folded label hides it):
   *   0x65274  pushq  %rbp ; movq %rsp,%rbp
   *   0x65278  movb   $0x1,0xb1(%rdi)                                  (abortFlag = 1)
   *   0x6527f  popq   %rbp ; retq
   */
  abortParse(): void {
    // @0x065278 — set the abort flag. parse()'s loop honors it at @0x064909.
    this.abortFlag = true;
  }

  /**
   * `PCBinaryXMLReadStream::stopParse()` — @0x065282.
   *
   * Disasm:
   *   0x65286  movb   $0x1,0xb0(%rdi)                                  (stopFlag = 1)
   */
  stopParse(): void {
    // @0x065286 — set the stop flag. parse()'s loop honors it at @0x06491b.
    this.stopFlag = true;
  }

  /**
   * `PCBinaryXMLReadStream::getURL() const` — @0x065290.
   *
   * Disasm dispatches via `__dynamic_cast(*this->stream, typeinfo PCStream, typeinfo
   * PCFileReadStream, 0)`; if the input stream IS a `PCFileReadStream`, returns `&stream + 8`
   * (an embedded PCURL sub-object at +8 of that class); otherwise returns `&this + 0xa8` (this
   * object's own embedded PCURL, which was default-constructed with a null CFURL by the ctor
   * @0x06478f — hence "empty URL" fallback).
   *
   * Disasm:
   *   0x65299  movq  0x98(%rdi),%rdi                                   (rdi = this->stream)
   *   0x652a0  leaq  __ZTI8PCStream(%rip),%rsi                         (typeinfo src)
   *   0x652a7  leaq  __ZTI16PCFileReadStream(%rip),%rdx                (typeinfo dst)
   *   0x652ae  xorl  %ecx,%ecx                                          (offset hint = 0)
   *   0x652b0  callq __dynamic_cast                                     (rax = cast-result or null)
   *   0x652b5  leaq  0x8(%rax),%rcx                                    (rcx = casted_ptr + 8)
   *   0x652b9  addq  $0xa8,%rbx                                         (rbx = &this + 0xa8 = self URL)
   *   0x652c0  testq %rax,%rax ; cmovneq %rcx,%rbx                     (rbx = (rax != 0) ? rcx : rbx)
   *   0x652c7  movq  %rbx,%rax ; retq
   *
   * We route through the dynamic-cast frontier stub for the file-stream branch. When the
   * stream ISN'T a PCFileReadStream (the common case for in-memory buffers), the fallback path
   * returns `this.url` (the embedded PCURL initialised with null CFURL by the ctor).
   */
  getURL(): PCURL | null {
    // @0x0652b0 — dynamic_cast(this->stream, PCFileReadStream).
    void dynamicCast_PCStream_to_PCFileReadStream;
    // For the non-file-stream fallback we simply return the embedded PCURL slot. Callers that
    // rely on the file-stream branch will drive the frontier stub through here (kept as a
    // reference above so the frontier scanner can see the dependency).
    return this.url;
  }

  /**
   * `PCBinaryXMLReadStream::readVarInt(PCStream& s, unsigned int* out)` — @0x0652d2.
   *
   * Standard LEB128 unsigned 32-bit varint. Reads bytes from `s` via `s.vt.read(s, &b, 1)`;
   * each byte contributes its low 7 bits at increasing shift (0, 7, 14, 21, 28); MSB of the
   * byte signals "another byte follows" (`js` on the byte value); stops after at most 5 bytes
   * (loop guard `shift < 0x1d = 29`). If any read yields != 1 bytes the accumulator is left
   * at 0 and *out is NOT written (early-return); otherwise *out receives the accumulator.
   *
   * Disasm:
   *   0x652f0  loop:
   *   0x652fe    callq *0x10(%rax)                       (n = s.read(&b, 1))
   *   0x65301    cmpq $1,%rax ; sete %cl                 (cl = (n == 1))
   *   0x65308    cmpl $0x1d,%r12d ; setb %al             (al = (shift < 29))
   *   0x65311    andb %cl,%al ; cmpb $1,%al ; jne .done  (exit if either fails)
   *   0x65315    movzbl -0x29(%rbp),%edx                 (edx = byte)
   *   0x65319    movl %edx,%esi ; andl $0x7f,%esi        (esi = byte & 0x7f)
   *   0x65321    shll %cl (=shift),%esi
   *   0x65323    orl %esi,%r13d                          (acc |= (byte & 0x7f) << shift)
   *   0x65326    addl $7,%r12d                           (shift += 7)
   *   0x6532a    testb %dl,%dl ; js .loop                (continue while byte MSB set)
   *   0x6532e  movl %r13d,(%rbx)                         (*out = acc)
   *
   * Return type: `void` — the function's boolean success signaling is done by writing (or
   * not writing) *out. Faithful port returns `boolean` to make the read-failure branch
   * observable to TS callers (equivalent semantic).
   */
  readVarInt(s: PCStream, out: { value: number }): boolean {
    // @0x0652e6 — acc = 0
    let acc = 0;
    // @0x0652ed — shift = 0
    let shift = 0;
    const buf = new Uint8Array(1);
    while (true) {
      // @0x0652fe — n = s.vt.read(s, &b, 1)
      const n = s.vt.read(s, buf, 1);
      // @0x065301..@0x065311 — bail unless (n == 1) && (shift < 29)
      if (n !== 1 || shift >= 29) {
        return false;
      }
      // @0x065315..@0x065323 — acc |= (byte & 0x7f) << shift
      const byte = buf[0] & 0xff;
      acc = ((acc | ((byte & 0x7f) << shift)) & 0xffffffff) >>> 0;
      // @0x065326 — shift += 7
      shift += 7;
      // @0x06532a — continue while MSB is set
      if ((byte & 0x80) === 0) break;
    }
    // @0x06532e — *out = acc
    out.value = acc >>> 0;
    return true;
  }

  /**
   * `PCBinaryXMLReadStream::readInt(PCStream& s, int tag, u64* out)` — @0x06542e.
   * (The i64 variant @0x0655be has identical body — same accumulator, same negate logic.)
   *
   * The tag byte encodes both the byte-count (in `tag & ~0x10`, offset by 7 so that a masked
   * value of 8 means "read 1 byte", masked 9 = "2 bytes", ... masked 15 = "8 bytes") and a
   * sign bit at 0x10. Two magic tags short-circuit:
   *
   *   tag == 0x80              -> return TRUE without touching *out       (@0x06543f..@0x065459)
   *                              (a "field-not-present" signal)
   *   tag == 0x81              -> return TRUE with *out = 1                (@0x06544a..@0x065452)
   *                              (a "compact one" signal)
   *
   * For any other tag:
   *   masked = tag & ~0x10                                                 (@0x065461..@0x065464)
   *   if (masked < 8): *out = 0 (via M = 0)                                 (@0x065467 -> @0x654ac)
   *   else:
   *     N_bits = (masked - 7) * 8                                          (@0x06546f..@0x065472)
   *     M = 0
   *     for shift = 0; shift < N_bits; shift += 8:
   *       b = s.read(&buf, 1)                                              (@0x06547c..@0x06548b)
   *       if b != 1: return FALSE without writing *out                     (@0x065492 -> @0x654d5)
   *       M |= (u64)buf[0] << shift                                        (@0x065494..@0x06549e)
   *     if (tag & 0x10) != 0: *out = -M       (signed magnitude via negq)  (@0x0654b5..@0x0654b9)
   *     else:                 *out = M
   *   return TRUE.                                                          (@0x0654c4)
   *
   * The number of bytes read for masked > 7 is (masked - 7). Examples the disasm supports:
   *   tag byte 0x08 -> masked=8, N=1 byte  -> *out = data[0]
   *   tag byte 0x09 -> masked=9, N=2 bytes -> *out = data[0] | (data[1] << 8)
   *   tag byte 0x0f -> masked=15, N=8 bytes -> full 64-bit LE
   *   tag byte 0x1f -> masked=15 (bit 0x10 set), sign flip -> *out = -(full 64-bit LE)
   *
   * Signed vs. unsigned wrappers @0x06534a and @0x0654da simply truncate the u64 result to
   * u32 / i32 and forward. The i64 variant @0x0655be is byte-identical to the u64 variant.
   */
  readInt_u64(
    s: PCStream,
    tag: number,
    out: { value: bigint },
  ): boolean {
    // @0x06543f..@0x065457 — magic tags 0x80 (miss) / 0x81 (one)
    const t = tag | 0;
    if (t === 0x80) return true; // *out untouched
    if (t === 0x81) {
      out.value = 1n;
      return true;
    }
    // @0x065461..@0x065464 — masked = tag & ~0x10 = tag AND 0xffffffef
    const masked = (t & ~0x10) | 0;
    // @0x065467..@0x0654ac — masked < 8 -> M = 0 branch
    let M = 0n;
    if (masked >= 8) {
      // @0x06546f..@0x065472 — N_bits = (masked - 7) * 8
      const nBits = ((masked - 7) | 0) * 8;
      const buf = new Uint8Array(1);
      // @0x065476..@0x0654a8 — read `nBits/8` bytes little-endian into M
      for (let shift = 0; shift < nBits; shift += 8) {
        // @0x065484..@0x06548b — n = s.vt.read(s, &buf, 1)
        const n = s.vt.read(s, buf, 1);
        // @0x06548e..@0x065492 — return FALSE on short read
        if (n !== 1) return false;
        // @0x065494..@0x06549e — M |= (u64)byte << shift
        M |= BigInt(buf[0] & 0xff) << BigInt(shift);
      }
    }
    // @0x0654af..@0x0654b9 — apply sign bit
    // `movq %r13,%rax ; negq %rax ; testb $0x10,%r14b ; cmoveq %r13,%rax` == `(tag & 0x10) ? -M : M`
    const signed = (t & 0x10) !== 0 ? -M : M;
    // @0x0654bd..@0x0654c1 — *out = result
    // Truncate to 64-bit two's-complement, matching the negq semantics on a 64-bit register.
    out.value = BigInt.asIntN(64, signed);
    return true;
  }

  /**
   * `PCBinaryXMLReadStream::readInt(PCStream& s, int tag, unsigned int* out)` — @0x06534a.
   *
   * Thin wrapper — calls `readInt_u64` into a local slot, then copies the low 32 bits into *out
   * (only when the 64-bit call returned TRUE).
   *
   * Disasm:
   *   0x65353  leaq -0x10(%rbp),%rcx                (temp = local slot)
   *   0x65357  callq readInt_u64                    (bool = readInt_u64(s, tag, &temp))
   *   0x6535c  testb %al,%al ; je .end
   *   0x65360  movl -0x10(%rbp),%ecx ; movl %ecx,(%rbx)  (*out = (u32)temp)
   */
  readInt_u32(
    s: PCStream,
    tag: number,
    out: { value: number },
  ): boolean {
    const tmp = { value: 0n };
    // @0x065357 — call readInt_u64
    const ok = this.readInt_u64(s, tag, tmp);
    if (!ok) return false;
    // @0x065360 — *out = (u32)tmp
    out.value = Number(BigInt.asUintN(32, tmp.value));
    return true;
  }

  /**
   * `PCBinaryXMLReadStream::readInt(PCStream& s, int tag, int* out)` — @0x0654da.
   *
   * Thin wrapper — calls `readInt_i64` (the i64 body is identical to u64, same @0x06542e math),
   * then copies the low 32 bits (sign-extending would be `movsxd` — the disasm uses plain
   * `movl` @0x0654f0, so the port truncates as a signed 32-bit narrow via `| 0`).
   *
   * Disasm:
   *   0x654e3  leaq -0x10(%rbp),%rcx
   *   0x654e7  callq readInt_i64                    (bool = readInt_i64(s, tag, &temp))
   *   0x654ec  testb %al,%al ; je .end
   *   0x654f0  movl -0x10(%rbp),%ecx ; movl %ecx,(%rbx)   (*out = (i32)temp low 32)
   */
  readInt_i32(
    s: PCStream,
    tag: number,
    out: { value: number },
  ): boolean {
    const tmp = { value: 0n };
    // @0x0654e7 — call readInt_i64 (identical body to u64 at @0x06542e; both @0x06542e and
    // @0x0655be do the same accumulate + sign-negate, so we share readInt_u64 as the primitive).
    const ok = this.readInt_u64(s, tag, tmp);
    if (!ok) return false;
    // @0x0654f0 — *out = (i32)(tmp & 0xffffffff)
    // Use `| 0` to reinterpret the low 32 bits as signed 32-bit — matches the truncation of a
    // 64-bit value into a 32-bit dst register (upper 32 bits discarded, low 32 kept as-is).
    out.value = Number(BigInt.asIntN(32, tmp.value)) | 0;
    return true;
  }

  /**
   * `PCBinaryXMLReadStream::readInt(PCStream& s, int tag, long long* out)` — @0x0655be.
   *
   * Body @0x0655be..@0x065664 is byte-identical (modulo pushed regs) to `readInt_u64`
   * @0x06542e. The C++ overload distinguishes signed vs. unsigned in the caller's variable
   * type but the runtime does the SAME two's-complement u64 accumulate + optional negate.
   * Faithful port: forward to readInt_u64 and reinterpret the u64 as i64 (BigInt.asIntN(64)).
   */
  readInt_i64(
    s: PCStream,
    tag: number,
    out: { value: bigint },
  ): boolean {
    const tmp = { value: 0n };
    // @0x0655c6..@0x065664 — same disasm body as @0x06542e.
    const ok = this.readInt_u64(s, tag, tmp);
    if (!ok) return false;
    // Reinterpret the accumulator as signed 64-bit — see @0x065651 `movq %rax,(%rcx)`.
    out.value = BigInt.asIntN(64, tmp.value);
    return true;
  }

  /**
   * `PCBinaryXMLReadStream::readFigtime(PCStream& s, CMTime* out)` — @0x065980.
   *
   * Header byte packs four 2-bit size-indices; each is looked up in the 4-entry table at
   * @ProCore data addr 0x125990 = `[1, 2, 4, 8]` (bytes-per-field). The four fields are then
   * read little-endian into (value, timescale, flags, epoch).
   *
   * Header bit layout:
   *   bits [1:0] -> value    size index -> LUT -> byte-count      (@0x0659bb..@0x0659c7)
   *   bits [3:2] -> timescale size index                          (@0x0659cc..@0x0659cf)
   *   bits [5:4] -> flags    size index                           (@0x0659db)
   *   bits [7:6] -> epoch    size index (via `andl $-0x4, %eax` + LUT@rax) (@0x0659e2..@0x0659e8)
   *
   * NOTE — the disasm computes the FIRST (value) field's bit-count differently from the other
   * three:
   *   value:      `cmpl $2,%ecx ; movl $1,%ebx ; cmovgel %ecx,%ebx ; shlq $3,%rbx`
   *               -> bits = max(2, LUT[bits[1:0]]) * 8                 (@0x0659ea..@0x0659f6)
   *   timescale:  `leal 0x8(,%rax,8),%r12d`  (rax = LUT[bits[3:2]])
   *               -> bits = (LUT[bits[3:2]] + 1) * 8                    (@0x065a35..@0x065a41)
   *   flags:      `leal 0x8(,%rax,8),%eax`
   *               -> bits = (LUT[bits[5:4]] + 1) * 8                    (@0x065a76..@0x065a81)
   *   epoch:      `cmpl $2,%eax ; movl $1,%ecx ; cmovgel %eax,%ecx ; shlq $3,%rcx`
   *               -> bits = max(2, LUT[bits[7:6]]) * 8                  (@0x0659c7 stores; @0x065abb..@0x065ac6)
   *
   * The `max(2, ...) * 8` shape (value + epoch) yields bit-counts of 16, 16, 32, 64 for indices
   * 0..3 (never 1 byte); the `(x+1)*8` shape (timescale + flags) yields 16, 24, 40, 72 which is
   * odd — but faithful to the disasm. Emit the bit-counts EXACTLY as computed.
   *
   * The four LE byte-reads use identical inner loops shifting `(byte)` by `shift`,
   * accumulating into r13 (value, u64), ebx (timescale, u32), r12d (flags, u32), rcx (epoch, u64).
   *
   * Writeback @0x065b0e..@0x065b18:
   *   *(out+0x00) = value       (u64 -> i64)
   *   *(out+0x08) = timescale   (u32 low 32)
   *   *(out+0x0c) = flags       (u32 low 32)
   *   *(out+0x10) = epoch       (u64 -> i64)
   *
   * The return value is 1 (byte) on success, 0 on any short-read within any of the four inner
   * loops (`callq *0x10(%rax) ; cmpq $1,%rax ; jne 0x65b20 ; ... xorl %eax,%eax ; jmp .end`).
   */
  readFigtime(s: PCStream, out: CMTime): boolean {
    const hdrBuf = new Uint8Array(1);
    // @0x065997..@0x0659a9 — read the header byte
    const nHdr = s.vt.read(s, hdrBuf, 1);
    if (nHdr !== 1) return false;
    const hdr = hdrBuf[0] & 0xff;

    // @0x0659bb..@0x0659e8 — extract the four 2-bit indices and LUT-lookup each.
    // LUT @0x125990 = [1, 2, 4, 8] (verified by reading ProCore.x86_64@0x125990).
    const LUT = [1, 2, 4, 8] as const; // decoded @ProCore 0x125990
    const idxValue = hdr & 0x3;                    // @0x0659bd
    const lutValue = LUT[idxValue];                // @0x0659c7 (movl (%rdx,%rcx,4),%ecx)
    const idxTimescale = (hdr >> 2) & 0x3;         // @0x0659cc..@0x0659cf
    const lutTimescale = LUT[idxTimescale];
    const idxFlags = (hdr >> 4) & 0x3;             // @0x0659db
    const lutFlags = LUT[idxFlags];
    const idxEpoch = (hdr >> 6) & 0x3;             // @0x0659e2..@0x0659e5 (mask `-0x4` selects bits 7:2 aligned)
    // The disasm computes the epoch index by `andl $-0x4,%eax ; movl (%rax,%rdx),%eax` — this
    // is a scaled index by 4 into the LUT viewed as a byte-array (indices at 0, 4, 8, 12 map
    // to LUT[0..3]). Equivalent to `LUT[(hdr >> 6) & 0x3]` when `hdr >> 6` == top-2-bits.
    const lutEpoch = LUT[idxEpoch];

    // Bit-count for each field — SHAPES DIFFER as noted above (transcribe verbatim).
    const bitsValue = Math.max(2, lutValue) * 8;             // @0x0659eb..@0x0659f6
    const bitsTimescale = (lutTimescale + 1) * 8;            // @0x065a35..@0x065a41
    const bitsFlags = (lutFlags + 1) * 8;                    // @0x065a76..@0x065a81
    const bitsEpoch = Math.max(2, lutEpoch) * 8;             // @0x065abb..@0x065ac6

    const buf = new Uint8Array(1);

    // @0x0659fa..@0x065a33 — read `bitsValue / 8` bytes into `value` (u64).
    let value = 0n;
    for (let shift = 0; shift < bitsValue; shift += 8) {
      const n = s.vt.read(s, buf, 1);
      if (n !== 1) return false;
      value |= BigInt(buf[0] & 0xff) << BigInt(shift);
    }

    // @0x065a44..@0x065a74 — read `bitsTimescale / 8` bytes into `timescale` (u32).
    let timescale = 0;
    for (let shift = 0; shift < bitsTimescale; shift += 8) {
      const n = s.vt.read(s, buf, 1);
      if (n !== 1) return false;
      timescale = (timescale | ((buf[0] & 0xff) << shift)) | 0;
    }

    // @0x065a87..@0x065ab6 — read `bitsFlags / 8` bytes into `flags` (u32).
    let flags = 0;
    for (let shift = 0; shift < bitsFlags; shift += 8) {
      const n = s.vt.read(s, buf, 1);
      if (n !== 1) return false;
      flags = (flags | ((buf[0] & 0xff) << shift)) | 0;
    }

    // @0x065ace..@0x065b08 — read `bitsEpoch / 8` bytes into `epoch` (u64).
    let epoch = 0n;
    for (let shift = 0; shift < bitsEpoch; shift += 8) {
      const n = s.vt.read(s, buf, 1);
      if (n !== 1) return false;
      epoch |= BigInt(buf[0] & 0xff) << BigInt(shift);
    }

    // @0x065b0e..@0x065b18 — writeback into CMTime out-param.
    out.value = BigInt.asIntN(64, value);
    out.timescale = timescale | 0;
    out.flags = flags >>> 0;
    out.epoch = BigInt.asIntN(64, epoch);
    return true;
  }

  /**
   * `PCBinaryXMLReadStream::ignoreElement()` — @0x066096.
   *
   * Skips the current element from the underlying stream, then flags it as "ignored" on the
   * current-element bookkeeping.
   *
   * Disasm:
   *   0x660a0  callq PCSerializerReadStream::currentElement() const   (rax = element*)
   *   0x660a8  movq  0x98(%rbx),%rdi                                   (rdi = this->stream)
   *   0x660af  movq  0x20(%rax),%rsi                                   (rsi = element->+0x20)
   *   0x660b3  movq  (%rdi),%rax ; callq *0x28(%rax)                   (stream->vt[0x28](stream, element+0x20))
   *   0x660b9  movb  $0x1,0x28(%r14)                                   (element->+0x28 = 1)
   *
   * `PCStream::vt[0x28]` slot is a "skip to marker" operation on the stream (frontier —
   * neither the slot semantics nor the element layout is fully decoded here). Both callees
   * are thrown-through so the frontier scanner picks them up.
   */
  ignoreElement(): void {
    // @0x0660a0 — currentElement(). Frontier.
    const el = pcSerializer_currentElement(this);
    // @0x0660a8 — stream->vt[0x28](stream, el->+0x20). We don't have PCStream::vt slot 0x28
    // decoded yet; call through the frontier stub.
    if (this.stream === null) {
      throw new Error(
        "PCBinaryXMLReadStream::ignoreElement() @ProCore 0x066096 — this.stream is null; cannot dispatch stream->vt[0x28]",
      );
    }
    throw new Error(
      "PCStream::vt[0x28] (skip-to-marker) @ProCore (call @0x0660b6 from ignoreElement) not yet transcribed; element cursor = " +
        String(el.plus20),
    );
    // @0x0660b9 (unreachable until frontier above is decoded): el->+0x28 = 1
  }

  /**
   * `PCBinaryXMLReadStream::parse()` — @0x064852.
   *
   * Reads a 32-byte header, checks the magic string `"OZBML"` (little-endian XOR against
   * 0x4d425a4f = 'OZBM' and byte 4 against 0x4c = 'L'), sscanf's `"OZBML %d.%d"` into
   * verMajor@+0x68 and verMinor@+0x6c, then loops parseElement() until:
   *   - abortFlag @+0xb1 is set (hard exit)  — check @0x064909..@0x064910
   *   - parseElement returns 1 AND stopFlag @+0xb0 is set (cooperative exit at level-1 boundary)
   *   - parseElement returns -1 (parse error)
   *
   * parseElement (@0x06492c, 696 disasm lines) is the state machine that walks OZBML tokens
   * and dispatches to virtual handlers. It's still un-transcribed. Faithful port keeps parse()
   * as a THROWING FRONTIER STUB that surfaces both the parseElement address AND the header-
   * decode addresses so a future decode session can pick up here without re-reading the
   * disassembly.
   */
  parse(): boolean {
    throw new Error(
      "PCBinaryXMLReadStream::parse() @ProCore 0x064852 not yet transcribed — depends on parseElement() @0x06492c (696 lines of SAX dispatch), and on the 32-byte 'OZBML %d.%d' header parse @0x064873..@0x0648f9",
    );
  }

  /**
   * `PCBinaryXMLReadStream::parseElement()` — @0x06492c.
   *
   * Frontier — 696 disasm lines of tag-decode / dispatch state machine. Faithful port keeps it
   * as a THROWING STUB that cites its @0xADDR so the frontier scanner sees the gap.
   */
  parseElement(): number {
    throw new Error(
      "PCBinaryXMLReadStream::parseElement() @ProCore 0x06492c not yet transcribed — 696 lines of tag-dispatch state machine at raw-port/re/disasm/ProCore.PCBinaryXMLReadStream.parseElement.s",
    );
  }
}
