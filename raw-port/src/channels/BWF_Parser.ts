// BWF_Parser — Flexo class that parses the top-level chunk structure of a
// Broadcast Wave Format (BWF) / RF64 / RIFF WAVE file from an ObjC-backed
// byte stream and records every chunk it finds into a member ChunkList
// (this+8). Two Flexo methods are transcribed here:
//   0x0000000000dd2850  BWF_Parser::parse_chunks()
//   0x0000000000dd3f00  BWF_Parser::~BWF_Parser()  (D1)
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.BWF_Parser.parse_chunks.s   (parse_chunks @0xdd2850)
//   raw-port/re/disasm/Flexo.BWF_Parser.~BWF_Parser.s    (dtor D1     @0xdd3f00)
// Framework: Final Cut Pro / Flexo.framework.
//
// ── STRUCT LAYOUT (recovered from ctor+dtor+parse_chunks accesses) ──
// The parse_chunks and dtor bodies pin the field layout of BWF_Parser as:
//
//   +0x00  id     stream          // ObjC-backed byte-stream reader. Receives
//                                 //   [stream sel_length]   → int64  file size
//                                 //   [stream sel_seek: n]  → void   absolute-seek
//                                 //   [stream sel_read: buf len: n] → size_t bytesRead
//                                 // Released in the dtor via `_objc_release`
//                                 // then zeroed (`movq $0x0, (%rbx)` @0xdd3f12).
//   +0x08  ChunkList list         // In-place ChunkList (see below). Zeroed
//                                 // as a member by the ctor (not decoded here);
//                                 // parse_chunks writes into it via
//                                 // `BWF_Parser::ChunkList::push_back(this+8,…)`
//                                 // (call @0xdd2cb6, receiver = `-0x80(%rbp)` =
//                                 //  `leaq 0x8(%rbx), %rax` @0xdd2975).
//                                 // Sub-struct layout (from the temp ChunkList
//                                 // on the stack at -0x60(%rbp) — the dtor at
//                                 // @0xdd2cce…@0xdd2cdb calls `operator delete`
//                                 // on `-0x60(%rbp)` and stores the freed pointer
//                                 // back into `-0x58(%rbp)` before returning,
//                                 // matching the classical std::vector-style trio):
//                                 //     +0x00  Chunk* begin        (`-0x60`)
//                                 //     +0x08  Chunk* end          (`-0x58`)
//                                 //     +0x10  Chunk* endCap       (`-0x50`)
//                                 //   Each Chunk stride = 0x18 (deduced from
//                                 //   the `addq $0x18,%rax` scan @0xdd2c84 that
//                                 //   walks the same array).
//                                 //   Chunk field layout (from the ds64
//                                 //   sub-table lookup @0xdd2c80..@0xdd2c94):
//                                 //     +0x00  uint32_t id      (compared via
//                                 //                              `cmpl %esi,(%rax)`)
//                                 //     +0x10  uint64_t size    (loaded via
//                                 //                              `movq 0x10(%rax),%rcx`)
//   +0x20  uint8_t  finished       // Set to 1 unconditionally near the end
//                                 // via `movb $0x1, 0x20(%rbx)` @0xdd2ce0.
//                                 // This is the "parse_chunks has completed"
//                                 // flag; parse_chunks always sets it before
//                                 // returning `true`, and every early-exit
//                                 // branch (jumps to 0xdd2ce0) still sets it.
//   +0x21  uint8_t  invalid_size   // Set to 1 via `movb $0x1, 0x21(%rbx)`
//                                 // @0xdd2cca on the "chunk larger than file"
//                                 // / "bad size" bail-out path.
//
// sizeof(BWF_Parser) is at least 0x22; the exact size depends on the trailing
// ChunkList — its size isn't decoded here beyond the +0x08..+0x1F trio slice.
//
// ── SELREFS + RUNTIME STUBS (from the RIP-relative loads and stubs) ──
// All ObjC calls in parse_chunks route through a single indirected _objc_msgSend
// pointer that the function caches into `%r15` at @0xdd288a via
// `movq 0xb1ae2f(%rip), %r15` — the framework's slot for `_objc_msgSend`. The
// very first call @0xdd286e (before %r15 is cached) uses the sibling slot
// `0xb1ae4c(%rip)`, which resolves to the same `_objc_msgSend` (Flexo has two
// __la_symbol_ptr entries for it, one used for the first send in this function
// and one cached in the rest of the body — this is a linker artifact, not two
// different runtime funcs).
//
// The selectors used (loaded as RIP-relative selref loads; addresses cited on
// each call site below):
//   sel_length    @selref 0xdf6cc2  — [stream length]        → int64 total-size
//   sel_seek      @selref 0xdf6cae  — [stream seek: n]       → void
//   sel_read4     @selref 0xdf6c9d  — [stream read: buf len:4] → size_t bytesRead
//   sel_data      @selref 0xdea76d  — [wave stream: len]     → child-reader
//                                       (only used once @0xdd2924 with
//                                       `%rdi = %r12` = length; returns the
//                                       working sub-stream `%r12` that the
//                                       chunk loop then draws from).
// The selrefs are RIP-relative slots that fixup to `__objc_methname` C-strings.
// We do NOT decode the exact string bytes here — resolve.py's `const` mode
// reads the slot as a double and the `sym` walker on this build is too slow
// to enumerate in-band. We therefore name each selector after its ROLE in the
// instruction stream and mark it with the selref RIP-offset it came from.
//
// Runtime symbol stubs the function reaches:
//   `_objc_msgSend`   — every `callq *%r15` @[0xdd2896, 0xdd28ac, 0xdd28f4,
//                        0xdd290a, 0xdd292e, 0xdd293f, 0xdd2955, 0xdd2990,
//                        0xdd29a6, 0xdd29c5, 0xdd29db, 0xdd2a1f, 0xdd2a35,
//                        0xdd2a50, 0xdd2a66, 0xdd2a81, 0xdd2a97, 0xdd2ab6,
//                        0xdd2acc, 0xdd2b13, 0xdd2b29, 0xdd2b81, 0xdd2b97,
//                        0xdd2bba, 0xdd2bd0, 0xdd2bee, 0xdd2c04].
//   `__ZN10BWF_Parser9ChunkList9push_backEjxm`
//                     — call @[0xdd2af3, 0xdd2c2c, 0xdd2cb6].
//                       Signature per Itanium mangling: `push_back(unsigned int,
//                       long long, unsigned long)`. Not yet transcribed to TS;
//                       modelled as a throw-stub honouring rule 3 of
//                       raw-port/army/PORTING_SPEC.md.
//   `operator delete` (`__ZdlPv`)
//                     — call @0xdd2cdb (fall-through cleanup) and @0xdd2d11
//                       (landing-pad cleanup after an exception). Frees the
//                       temp ChunkList's backing storage.
//   `__Unwind_Resume` — @0xdd2d19, in the landing-pad tail.
//
// ── SEMANTICS RECOVERED FROM THE ASM ──
// parse_chunks() is a linear top-of-file walker that:
//   1. Asks the stream for its total length (@0xdd286e) and bails to
//      `this->finished = 1; return true;` if it's zero.
//   2. Seeks to 0 (@0xdd2896) and reads a 4-byte header magic (@0xdd28ac).
//      Accepts three raw fourccs — 0x34364652, 0x34365742, 0x52494646 — plus
//      one bswapped form 0x42573634 and one alternate 0x52463634. Anything
//      else bails.  In bytes these are the ASCII fourccs for RIFF-family
//      containers (RF64/BW64/RIFF); we keep the raw hex to avoid any
//      re-guessing of endianness beyond what the asm literally checks.
//      A per-file `is_wave64_or_variant` flag is stashed in `-0x2d(%rbp)`
//      when the header equals 0x34364652, and combined with the alternate
//      (`%r14b` = header == 0x34365742) via `orb %r14b,-0x2d(%rbp)` @0xdd2962
//      to form the `expect_ds64` bit later consumed at the ds64 dispatch.
//   3. Seeks +8 (past `fourcc + riffSize32`) (@0xdd28f4).
//   4. Reads the next 4 bytes and requires them to equal 0x45564157 = "WAVE"
//      little-endian (@0xdd2917). Bail otherwise.
//   5. Sends sel_data @0xdd2924 to obtain a working "wave stream" sub-reader
//      (`%r12`) whose length is the upper bound `%r14 = r12 + rdx` in the
//      per-chunk oversize check at @0xdd2cad.
//   6. Enters the main chunk loop from @0xdd2983 running with `%r13` as the
//      running byte-offset into the WAVE payload. Each iteration:
//        a. Seek `stream` to `r13` (@0xdd2990).
//        b. Read 4 bytes at `-0x2c(%rbp)` — the chunk id (@0xdd29a6). Bail
//           (`this->invalid_size = 1`) if fewer than 4 bytes were read.
//        c. Seek `r13+4` and read 4 more bytes — the low 32 bits of the
//           chunk size at `-0x2c(%rbp)` (@0xdd29db).
//        d. If the chunk id equals 0x34367364 ("ds64" fourcc-little-endian
//           per @0xdd29f2), branch into the ds64 sub-table decoder
//           (@0xdd2a01…@0xdd2c5b). The ds64 chunk carries:
//             - riff-size64  (skipped)
//             - data-size64  (`(hi<<32)|lo` from the two 4-byte reads at
//                              @0xdd2a35 and @0xdd2a66) — pushed into the
//                              temp ChunkList as key 0x64617461 ("data") with
//                              size=-1 override @0xdd2af3.
//             - sample-count (skipped)
//             - table-length N (@0xdd2acf) — followed by N × 12-byte
//                              (fourcc, uint64_size) entries which are also
//                              push_back'd into the temp list at @0xdd2c2c.
//        e. Otherwise (non-ds64 chunk) the code at @0xdd2c64 handles the
//           `size == 0xFFFFFFFF` sentinel (chunk-size-in-ds64-table lookup):
//           if the ds64-expected bit is set (`-0x2d(%rbp) == 1`), walk the
//           temp ChunkList for a matching id and pull its 64-bit size from
//           +0x10.  Otherwise fall through with the 32-bit size.
//        f. Compute the chunk's end offset `%r14 = size + r13` (@0xdd2ca9,
//           @0xdd2cad) and bail (`this->invalid_size = 1`) if it overruns
//           the wave-stream length `%r12`.
//        g. push_back(this+8, id, r13, size) @0xdd2cb6 — this is the ONLY
//           call that writes into the MEMBER ChunkList (via the pointer
//           stashed in -0x80(%rbp) at the top of the function).
//        h. Advance `r13` past the chunk body, aligning to 2 bytes
//           (`r14 & 1` + `r14`) @0xdd2cbb-@0xdd2cc2, and loop.
//   7. Fall-through cleanup: `operator delete(-0x60(%rbp))` frees the temp
//      list's backing (@0xdd2cdb), then `this->finished = 1; return true;`
//      (@0xdd2ce0-@0xdd2cf4).
//   8. Exception-unwind landing pad (@0xdd2d01-@0xdd2d19) — same delete,
//      then `_Unwind_Resume`.  We do NOT wrap the TS body in try/catch;
//      the landing pad is the C++ dtor of the stack ChunkList and TypeScript
//      has no direct equivalent — a JS throw escaping any callee corresponds
//      to that path, and no additional cleanup is meaningful in the port
//      (garbage collection handles the array's backing store).
//
// Every runtime dependency this file reaches (ObjC selectors, `push_back`,
// `_objc_release`, `operator delete`, `_Unwind_Resume`) is a raw-port frontier:
// each is exposed here as a throw-stub with its @0xADDR call site cited, per
// rule 3 of raw-port/army/PORTING_SPEC.md.

/**
 * Opaque handle for the ObjC byte-stream that BWF_Parser reads from. Modeled
 * as a nominal type — nothing about its internals is decoded from this class.
 * The stream is retained by the parser in its ctor (not transcribed here) and
 * released by the dtor via `_objc_release` @0xdd3f0c.
 */
export type BWFStream = { readonly __bwfStream: unique symbol };

/**
 * Opaque handle for the "wave sub-reader" that `sel_data` returns from the
 * outer stream (@0xdd2924 — the only selref loaded via `0xdea76d(%rip)`).
 * Distinct nominal type so we can't mix it up with `BWFStream` even though
 * both are ObjC ids at runtime.
 */
export type BWFWaveStream = { readonly __bwfWaveStream: unique symbol };

/**
 * One recovered chunk record — this is the shape used by the temporary ds64
 * list on the stack (`-0x60..-0x50(%rbp)`) and by the member ChunkList at
 * `this+8`. Layout at @0xdd2c80 / @0xdd2c94 pins:
 *   +0x00  uint32_t id
 *   +0x10  uint64_t size
 * Stride is 0x18 (@0xdd2c84 `addq $0x18, %rax`). Offset +0x08 is unread by
 * parse_chunks (probably the chunk file-offset written by push_back; we
 * expose it as `offset` because push_back's second arg is a signed 64-bit
 * offset per the Itanium mangling `push_backEjxm`).
 */
export interface BWFChunk {
  /** +0x00 — chunk fourcc as a raw little-endian uint32 (as the asm compares it). */
  id: number;
  /** +0x08 — inferred chunk file-offset (push_back's `long long` arg). */
  offset: bigint;
  /** +0x10 — chunk payload size in bytes (push_back's `unsigned long` arg). */
  size: bigint;
}

/**
 * Mirrors `BWF_Parser::ChunkList` — the C++ vector-like triple at +0x00..+0x18
 * of a ChunkList instance.  We keep the trio explicit so the ds64 scan at
 * @0xdd2c71..@0xdd2c94 (which walks `begin` to `end` in 0x18-byte strides) has
 * a direct one-to-one mirror.  In TS the underlying storage is a JS array;
 * `beginPtr/endPtr/capPtr` are represented implicitly (`items.length` == end,
 * capacity is left to the runtime).
 */
export interface BWFChunkList {
  /** The chunks that have been push_back'd so far. */
  items: BWFChunk[];
}

/** Fresh empty list — matches the `xorps %xmm0,%xmm0; movaps %xmm0,-0x60(%rbp);
 *  movq $0x0,-0x50(%rbp)` sequence @0xdd2966-@0xdd296d that zeroes the trio. */
export function bwfChunkListInit(): BWFChunkList {
  return { items: [] };
}

// ── Frontier stubs (rule 3: throw, cite @0xADDR) ─────────────────────────────

/**
 * `_objc_msgSend`(stream, sel_length) — call sites @0xdd286e (first send,
 * routed through the alternate slot `0xb1ae4c(%rip)`) and, semantically, the
 * initial length probe. Returns the total byte length of the underlying file.
 * Not yet transcribed: `_objc_msgSend` is the ObjC runtime dispatcher.
 */
function objc_msgSend_length(_stream: BWFStream): bigint {
  throw new Error(
    "BWF_Parser: [stream length] via _objc_msgSend @Flexo 0xdd286e " +
      "(selref 0xdf6cc2, msgSend slot 0xb1ae4c) not yet transcribed"
  );
}

/**
 * `_objc_msgSend`(stream, sel_seek, offset64) — abs-seek. Call sites @0xdd2896
 * (seek 0), @0xdd28f4 (seek 8), @0xdd292e (also used with `%r12` after
 * sel_data returns a sub-stream so this doubles as its seek), @0xdd293f
 * (seek +4), @0xdd2990 (seek r13), @0xdd29c5 (seek r13+4), @0xdd2a1f (seek
 * r13+0xc / ds64), @0xdd2a50, @0xdd2a81, @0xdd2ab6 (ds64 sub-fields),
 * @0xdd2b13 (ds64 table-length), @0xdd2b81 (ds64 table entry fourcc),
 * @0xdd2bba (ds64 table entry size-lo), @0xdd2bee (ds64 table entry size-hi).
 */
function objc_msgSend_seek(_stream: BWFStream, _offset: bigint): void {
  throw new Error(
    "BWF_Parser: [stream seek:] via _objc_msgSend " +
      "(selref 0xdf6cae, msgSend slot 0xb1ae2f) not yet transcribed"
  );
}

/**
 * `_objc_msgSend`(stream, sel_read4, out_buf, len) — bounded read. Returns the
 * number of bytes actually read (matches the `cmpq $4, %rax` checks throughout
 * the body). Call sites @0xdd28ac, @0xdd290a, @0xdd2955, @0xdd29a6, @0xdd29db,
 * @0xdd2a35, @0xdd2a66, @0xdd2a97, @0xdd2acc, @0xdd2b29, @0xdd2b97, @0xdd2bd0,
 * @0xdd2c04.
 *
 * The buffer parameter is modelled as a `{ value: number }` box — the asm
 * always reads into either `-0x60(%rbp)` (for the header fourcc, later
 * repurposed) or `-0x2c(%rbp)` (for every subsequent 4-byte int).  We
 * cannot faithfully re-materialise the RBP-relative stack from JS, so we
 * expose an outparam.
 */
function objc_msgSend_read4(_stream: BWFStream, out: { value: number }, len: number): bigint {
  // `len` is always the immediate 4 in the asm; we still carry it as an
  // argument so the stub's signature is honest to the runtime call.
  void out;
  void len;
  throw new Error(
    "BWF_Parser: [stream read:len:] via _objc_msgSend " +
      "(selref 0xdf6c9d, msgSend slot 0xb1ae2f) not yet transcribed"
  );
}

/**
 * `_objc_msgSend`(stream, sel_data, length) — the single call @0xdd2924 that
 * takes the total file length in `%r12` and returns a sub-stream (also stored
 * back into `%r12`) whose length becomes the wave-payload upper bound for the
 * oversize check @0xdd2cad.  We keep the name literal from the RIP offset
 * (0xdea76d) since we don't yet resolve the selector's ObjC string.
 */
function objc_msgSend_selref_0xdea76d(
  _stream: BWFStream,
  _length: bigint,
): BWFWaveStream {
  throw new Error(
    "BWF_Parser: [stream sel@0xdea76d:] via _objc_msgSend @Flexo 0xdd292e " +
      "(selref 0xdea76d, msgSend slot 0xb1ae2f) not yet transcribed"
  );
}

/**
 * `_objc_release`(stream) — dtor call @0xdd3f0c via the RIP-relative literal
 * pool slot at `0xb197f6(%rip)`.  The dtor's `movq $0x0, (%rbx)` @0xdd3f12
 * zeros the field before returning.
 */
function objc_release(_stream: BWFStream): void {
  throw new Error(
    "BWF_Parser::~BWF_Parser: _objc_release @Flexo 0xdd3f0c not yet transcribed"
  );
}

/**
 * `BWF_Parser::ChunkList::push_back(unsigned int id, long long offset,
 * unsigned long size)` @ mangled `__ZN10BWF_Parser9ChunkList9push_backEjxm`.
 * Call sites @0xdd2af3 (ds64 "data" pseudo-entry, size = -1), @0xdd2c2c
 * (ds64 table entry, size = (hi<<32)|lo), @0xdd2cb6 (regular chunk into the
 * member list at `this+8`).
 *
 * Not yet transcribed — it's a separate class we haven't ported.  The signature
 * from the Itanium mangling is `(uint32_t, int64_t, uint64_t)`; the third
 * argument is unsigned even though in one call site it's literally `-1`
 * (`movq $-0x1, %rdx` @0xdd2aec / @0xdd2c25) — that's C++'s cast of
 * `(unsigned long)-1`, i.e. 0xFFFFFFFFFFFFFFFFn as a sentinel.
 */
function ChunkList_push_back(
  _list: BWFChunkList,
  _id: number,
  _offset: bigint,
  _size: bigint,
): void {
  throw new Error(
    "BWF_Parser::ChunkList::push_back @Flexo 0xdd2af3/0xdd2c2c/0xdd2cb6 " +
      "(mangled __ZN10BWF_Parser9ChunkList9push_backEjxm) not yet transcribed"
  );
}

/**
 * `operator delete(void*)` @Flexo stub 0x1497404 — call sites @0xdd2cdb
 * (fall-through cleanup of the temp ChunkList's backing) and @0xdd2d11
 * (landing-pad cleanup).  Not modelled in TS (GC), so this is a documentation
 * shim that would only ever fire if reintroduced.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "BWF_Parser: operator delete @Flexo stub 0x1497404 " +
      "invoked from @0xdd2cdb/@0xdd2d11 — not applicable in the TS port"
  );
}

// ── Class ────────────────────────────────────────────────────────────────────

/**
 * Faithful transcription of Flexo's `BWF_Parser` C++ class. Only two methods
 * are transcribed here — the ones the ledger assigned (`parse_chunks` and
 * `~BWF_Parser`). The ctor, `~ChunkList`, and other members are separate raw-
 * port units.
 */
export class BWF_Parser {
  /** +0x00 — retained ObjC byte-stream. See STRUCT LAYOUT above. */
  public stream: BWFStream | null;

  /** +0x08 — member ChunkList that parse_chunks fills. */
  public list: BWFChunkList;

  /** +0x20 — set to true when parse_chunks returns (movb $0x1 @0xdd2ce0). */
  public finished: boolean;

  /**
   * +0x21 — set to true on any "invalid chunk size" bail path
   * (movb $0x1 @0xdd2cca).  Left false on the happy path.
   */
  public invalid_size: boolean;

  /**
   * Ctor is not the assigned unit for this file — we model just enough to
   * describe the field defaults (all-zero as seen in the parse_chunks entry
   * conditions: `finished` and `invalid_size` are read/written as `movb $0x1`
   * targets and are `0` on entry).  A future BWF_Parser::BWF_Parser port would
   * replace this body with its faithful transcription.
   */
  constructor(stream: BWFStream | null) {
    this.stream = stream;
    this.list = bwfChunkListInit();
    this.finished = false;
    this.invalid_size = false;
  }

  /**
   * `bool BWF_Parser::parse_chunks()` @Flexo 0xdd2850.
   *
   * Return type inferred from @0xdd2ce4 `movb $0x1, %al` (return true) — the
   * function has a single `retq` at @0xdd2cf4 and every bailout also falls
   * through to @0xdd2ce0-@0xdd2cf4, so the return value is ALWAYS `true`.
   * The parser communicates failure through `this.invalid_size` (early-fail
   * paths set +0x21) and success by leaving it clear while still setting +0x20.
   *
   * Control flow mirrors the disassembly one-to-one; each block cites the
   * @0xADDR range it corresponds to.
   */
  parse_chunks(): boolean {
    // @0xdd2861-0xdd2867 — load `this->stream` and prepare the sel_length send.
    const stream = this.stream;
    if (stream === null) {
      // The native code doesn't null-check — it derefs +0x00 directly. A null
      // stream would crash there. Faithful mirror: bail into the same
      // "finish + return true" tail via a throw so we don't silently no-op.
      // (The rest of the tail runs after this call in the asm, but only if
      //  the length probe returns non-zero. Native behaviour on nil is
      //  undefined per ObjC — [nil length] returns 0, so the tail's zero-
      //  check would fire and we'd fall through to @0xdd2ce0.)
      // We honour that ObjC-nil semantic here explicitly.
      this.finished = true;
      return true;
    }

    // @0xdd286e — [stream length] via _objc_msgSend (first send, alt slot).
    const totalLength: bigint = objc_msgSend_length(stream);
    // @0xdd2874-@0xdd2877 — `testq %rax,%rax; je 0xdd2ce0`.
    if (totalLength === 0n) {
      // @0xdd2ce0 — this->finished = 1; return true.
      this.finished = true;
      return true;
    }
    // @0xdd287d — `%r12 = totalLength`. The value survives every call in the
    // body because %r12 is callee-saved; parse_chunks reuses it as the WAVE
    // sub-stream after @0xdd2924.
    let waveStreamLen: bigint = totalLength;

    // @0xdd2891-@0xdd2896 — [stream seek: 0] via _objc_msgSend.  `%edx = 0`
    // (`xorl %edx,%edx` @0xdd2894) is the offset argument.
    objc_msgSend_seek(stream, 0n);

    // @0xdd28a3-@0xdd28ac — read 4 header bytes into `-0x60(%rbp)`.
    const headerBuf = { value: 0 };
    const nHeader = objc_msgSend_read4(stream, headerBuf, 4);
    // @0xdd28af-@0xdd28b3 — `cmpq $4, %rax; jne 0xdd2ce0`.
    if (nHeader !== 4n) {
      this.finished = true;
      return true;
    }
    const header: number = headerBuf.value >>> 0;

    // @0xdd28bc — `cmpl $0x34364652, %eax; sete -0x2d(%rbp)`. `-0x2d(%rbp)`
    // stashes a bool: "header is 0x34364652". `0x34364652` = ASCII "RF64" as
    // an LE uint32 (0x52 0x46 0x36 0x34).
    let isRF64: boolean = header === 0x34364652;

    // @0xdd28c5-@0xdd28cc — `cmpl $0x34365742, %eax; bswapl %eax; sete %r14b`.
    // `%r14b` = "header equals 0x34365742" ("BW64" as LE uint32).
    const isBW64: boolean = header === 0x34365742;

    // The `bswapl %eax` step mutates %eax IN PLACE — subsequent header
    // comparisons run against the bswapped word.
    const headerBS: number = ((((header & 0xff) << 24) |
      ((header & 0xff00) << 8) |
      ((header >>> 8) & 0xff00) |
      (header >>> 24)) >>> 0);

    // @0xdd28d0 — `cmpl $0x42573634, %eax; je 0xdd28e9` (accept).
    // @0xdd28d7 — `cmpl $0x52494646, %eax; je 0xdd28e9` (accept).
    // @0xdd28de — `cmpl $0x52463634, %eax; jne 0xdd2ce0` (reject if none).
    const bswapAccepted: boolean =
      headerBS === 0x42573634 || headerBS === 0x52494646 || headerBS === 0x52463634;
    if (!bswapAccepted) {
      this.finished = true;
      return true;
    }

    // @0xdd28e9-@0xdd28f4 — [stream seek: 8].  `%edx = 8` (`movl $0x8,%edx`).
    objc_msgSend_seek(stream, 8n);

    // @0xdd28f7-@0xdd290a — read 4 bytes at `-0x60(%rbp)`.
    const waveBuf = { value: 0 };
    const nWave = objc_msgSend_read4(stream, waveBuf, 4);
    // @0xdd290d-@0xdd2911 — cmpq $4; jne 0xdd2ce0.
    if (nWave !== 4n) {
      this.finished = true;
      return true;
    }
    // @0xdd2917 — `cmpl $0x45564157, -0x60(%rbp); jne 0xdd2ce0`.
    // 0x45564157 = "WAVE" as LE uint32 (0x57 0x41 0x56 0x45).
    if ((waveBuf.value >>> 0) !== 0x45564157) {
      this.finished = true;
      return true;
    }

    // @0xdd2924-@0xdd292e — [stream sel@0xdea76d: totalLength] → wave sub-
    // stream.  The receiver here is `%r12 = totalLength`, which for an ObjC
    // send would be a nonsense receiver (a raw integer) — this suggests the
    // build's assembler-comment guess is slightly off and the actual receiver
    // may be `%r12 = stream` and the length gets passed via `%rdx`.  We keep
    // the literal argument order since we cannot yet decode the selector, and
    // both interpretations flow through the same TS stub.
    const waveStream: BWFWaveStream = objc_msgSend_selref_0xdea76d(stream, totalLength);
    // @0xdd2931 — `%r12 = %rax`, the returned sub-stream.  From here on every
    // read/seek in the loop still uses the outer `stream` (`%rbx`'s +0x00), so
    // `waveStream` participates ONLY in the oversize check via `%r12` at
    // @0xdd2cad.  Its length is `%r12` — we still carry `totalLength` under
    // that name for the check.
    void waveStream;
    waveStreamLen = totalLength;

    // @0xdd2934-@0xdd293f — [stream seek: 4] again (re-align to the WAVE
    // fourcc's tail).  `%edx = 4`.
    objc_msgSend_seek(stream, 4n);

    // @0xdd2942-@0xdd2955 — one more 4-byte read (unused after `cmpq $4`);
    // this is the WAVE size32 in the RIFF header. Bail-if-short.
    const size32Buf = { value: 0 };
    const nSize32 = objc_msgSend_read4(stream, size32Buf, 4);
    if (nSize32 !== 4n) {
      this.finished = true;
      return true;
    }

    // @0xdd2962 — `orb %r14b, -0x2d(%rbp)`.  The ds64-expected flag is
    // (isRF64 || isBW64).  We fold it back into `isRF64` since that's the
    // slot the native code reuses.
    isRF64 = isRF64 || isBW64;

    // @0xdd2966-@0xdd296d — zero the temp ChunkList trio on the stack.
    const tempList: BWFChunkList = bwfChunkListInit();

    // @0xdd2975 — `-0x80(%rbp) = leaq 0x8(%rbx), %rax` — cache pointer to
    // `this->list`.  In TS we just reference `this.list`.
    // (No line-corresponding code needed; the reference is used below.)

    // @0xdd297d — `%r13d = 0xc` — the initial chunk cursor.  In the WAVE
    // container, the chunk area starts at offset 12 (RIFF header is 12 bytes).
    let cursor: bigint = 12n;

    // ── Chunk-scanning loop (@0xdd2983 … @0xdd2cc5 back-edge) ───────────────
    // We express the back-edge (`jmp 0xdd2983` @0xdd2cc5) as an outer while.
    // Every branch inside the loop either falls through to the tail cleanup
    // (@0xdd2cce onward) — modelled as `break` — or advances the cursor and
    // continues via `continue`.
    loop: while (true) {
      // @0xdd2983-@0xdd2990 — [stream seek: cursor].
      objc_msgSend_seek(stream, cursor);

      // @0xdd2993-@0xdd29a6 — read chunk fourcc into `-0x2c(%rbp)`.
      const idBuf = { value: 0 };
      const nId = objc_msgSend_read4(stream, idBuf, 4);
      // @0xdd29a9-@0xdd29ad — `cmpq $4; jne 0xdd2cce` (goes to cleanup).
      if (nId !== 4n) {
        break loop;
      }
      const chunkId: number = idBuf.value >>> 0;

      // @0xdd29b7 — `leaq 0x4(%r13), %rdx` — seek to cursor+4 for size32.
      // @0xdd29bb-@0xdd29c5 — [stream seek: cursor+4].
      objc_msgSend_seek(stream, cursor + 4n);

      // @0xdd29c8-@0xdd29db — read size32 into `-0x2c(%rbp)`.
      const size32BufL = { value: 0 };
      const nSizeLo = objc_msgSend_read4(stream, size32BufL, 4);
      if (nSizeLo !== 4n) {
        break loop;
      }
      let chunkSize32: number = size32BufL.value >>> 0;

      // @0xdd29eb — `leaq 0x8(%r13), %rdx` — next byte offset would be
      // cursor+8 (unused if not-ds64; consumed below in ds64 branch).
      // @0xdd29ef — `%esi = %r14d` (unused? %r14 was set to isBW64 flag
      //             earlier and re-clobbered in the ds64 branch).
      // @0xdd29f2 — `cmpl $0x34367364, %r14d`.  0x34367364 = ASCII "ds64" as
      // an LE uint32 (0x64 0x73 0x36 0x34).  Note the compare is against
      // `%r14d`, NOT `%chunkId` — but `%r14d` was loaded @0xdd29b3 from
      // `-0x2c(%rbp)` = the chunk id.  So this really is a chunk-id test.
      // @0xdd29f9 — `bswapl %esi` (the "not-ds64" branch below reads %esi
      //              as the bswapped form of the id; kept as `chunkIdBS`).
      const chunkIdBS: number = ((((chunkId & 0xff) << 24) |
        ((chunkId & 0xff00) << 8) |
        ((chunkId >>> 8) & 0xff00) |
        (chunkId >>> 24)) >>> 0);

      if (chunkId === 0x34367364) {
        // ── ds64 branch (@0xdd2a01 … @0xdd2c5b) ─────────────────────────────

        // @0xdd2a01-@0xdd2a04 — `cmpl $0x17, %ecx; jbe 0xdd2cca`. `%ecx` here
        // is `chunkSize32` from the read at @0xdd29db.  If the declared ds64
        // size is <= 23 there aren't enough bytes for the fixed header (24) —
        // bail with `this->invalid_size = 1`.
        if (chunkSize32 <= 0x17) {
          this.invalid_size = true;
          break loop;
        }

        // @0xdd2a0a-@0xdd2a1b — spill state to `-0x48(%rbp) = chunkSize32`,
        //                             `-0x34(%rbp) = chunkIdBS`,
        //                             `-0x40(%rbp) = cursor+8 (rdx)`.
        // The spills are re-loaded after the branch (@0xdd2b30-@0xdd2b37).
        const ds64PayloadOffset: bigint = cursor + 8n;

        // @0xdd2a11-@0xdd2a1f — [stream seek: cursor+8] (already the value
        // of `%rdx` from @0xdd29eb).
        objc_msgSend_seek(stream, ds64PayloadOffset);

        // @0xdd2a22-@0xdd2a35 — read riff-size64-lo (unused later).
        const ds64_riffLoBuf = { value: 0 };
        const nRLo = objc_msgSend_read4(stream, ds64_riffLoBuf, 4);
        if (nRLo !== 4n) {
          this.invalid_size = true;
          break loop;
        }

        // @0xdd2a42-@0xdd2a50 — [stream seek: cursor+0xc]. riff-size64-hi.
        objc_msgSend_seek(stream, cursor + 0xcn);
        // @0xdd2a53-@0xdd2a66 — read.
        const ds64_riffHiBuf = { value: 0 };
        const nRHi = objc_msgSend_read4(stream, ds64_riffHiBuf, 4);
        if (nRHi !== 4n) {
          this.invalid_size = true;
          break loop;
        }

        // @0xdd2a73-@0xdd2a81 — [stream seek: cursor+0x10]. data-size64-lo.
        objc_msgSend_seek(stream, cursor + 0x10n);
        // @0xdd2a84-@0xdd2a97 — read.
        const ds64_dataLoBuf = { value: 0 };
        const nDLo = objc_msgSend_read4(stream, ds64_dataLoBuf, 4);
        if (nDLo !== 4n) {
          this.invalid_size = true;
          break loop;
        }
        // @0xdd2aa4 — `%r14d = -0x2c(%rbp)` — the data-size64 low 32 bits.
        const dataLo: bigint = BigInt(ds64_dataLoBuf.value >>> 0);

        // @0xdd2aa8-@0xdd2ab6 — [stream seek: cursor+0x14]. data-size64-hi.
        objc_msgSend_seek(stream, cursor + 0x14n);
        // @0xdd2ab9-@0xdd2acc — read.
        const ds64_dataHiBuf = { value: 0 };
        const nDHi = objc_msgSend_read4(stream, ds64_dataHiBuf, 4);
        if (nDHi !== 4n) {
          this.invalid_size = true;
          break loop;
        }
        // @0xdd2adc-@0xdd2ae0 — `shlq $0x20, %rcx; orq %r14, %rcx` — combine
        // hi<<32 | lo into a 64-bit size.
        const dataHi: bigint = BigInt(ds64_dataHiBuf.value >>> 0);
        const dataSize64: bigint = (dataHi << 32n) | dataLo;

        // @0xdd2ae3-@0xdd2af3 — push_back(&tempList, 0x64617461, -1n, dataSize64).
        // 0x64617461 = "data" as LE uint32.
        // The `%rdx = -1` is the second arg (offset = -1n = "unknown"), and
        // the third arg (`%rcx`) is `dataSize64`.
        ChunkList_push_back(tempList, 0x64617461, -1n, dataSize64);

        // @0xdd2af8-@0xdd2aff — `%rcx = -0x48(%rbp) = chunkSize32; cmpl $0x1d;
        //                       jb 0xdd2c5b`.  If size < 29 there are no
        // trailing table entries; jump to the tail (@0xdd2c5b).
        if (chunkSize32 < 0x1d) {
          // @0xdd2c5b-@0xdd2c62 — reload chunkIdBS/ds64PayloadOffset and jump
          // to @0xdd2ca9 (the oversize check).  We continue by falling into
          // the shared oversize-check block below.
        } else {
          // @0xdd2b05-@0xdd2b13 — [stream seek: cursor+0x20]. table-length.
          objc_msgSend_seek(stream, cursor + 0x20n);
          // @0xdd2b16-@0xdd2b29 — read table-length.
          const ds64_tableLenBuf = { value: 0 };
          const nTL = objc_msgSend_read4(stream, ds64_tableLenBuf, 4);
          // @0xdd2b30-@0xdd2b3b — reload chunkIdBS (`-0x34`), ds64PayloadOffset
          //                        (`-0x40`), chunkSize32 (`-0x48`).  Then
          //                        `cmpq $4, %rax; jne 0xdd2ca9` — a short
          // read on the table-length bails to the oversize check (which then
          // finalises the ds64 chunk).
          if (nTL !== 4n) {
            // Fall through to the oversize check below (behaves as if there
            // were no table entries).
          } else {
            // @0xdd2b41 — `%eax = -0x2c(%rbp)`.
            // @0xdd2b44 — `-0x6c(%rbp) = %eax` — cache tableLen.
            const tableLen: number = ds64_tableLenBuf.value >>> 0;
            // @0xdd2b47-@0xdd2b56 — `sete %al` if tableLen == 0, `setb %dil`
            //                        if chunkSize32 < 0x28.  If either is
            //                        true, bail to @0xdd2ca9.
            const canScanTable: boolean =
              tableLen !== 0 && chunkSize32 >= 0x28;
            if (canScanTable) {
              // @0xdd2b5c-@0xdd2b60 — `r13 += 0x2c; %eax = 0x34; %r14d = 1`.
              // Wait — @0xdd2b5c has `addq $0x2c, %r13`.  `%r13` at this
              // point is the ORIGINAL `%r13`, i.e. `cursor`, because the
              // ds64 branch never overwrote it.  So the table-entry cursor
              // starts at `cursor + 0x2c`.
              // @0xdd2b60 — `%eax = 0x34` — the "next entry offset" seed
              //                             (0x34 = 0x2c + 8 = the offset of
              //                              the SECOND entry from `cursor`).
              // @0xdd2b65 — `%r14d = 1` — entry index (1-based, as an
              //                             iteration counter).
              let entryCursor: bigint = cursor + 0x2cn;
              let entryCounter: number = 1;
              let entryOffsetSeed: bigint = 0x34n;
              // The loop body starts at @0xdd2b73.
              while (true) {
                // @0xdd2b6b — `-0x68(%rbp) = %r12` — preserve waveStreamLen
                //                                      across the loop
                //                                      (waveStream sub-stream
                //                                       pointer).
                // @0xdd2b6f — `-0x78(%rbp) = %rax = entryOffsetSeed`.
                // @0xdd2b73-@0xdd2b81 — [stream seek: entryCursor - 8]
                //                        (`leaq -0x8(%r13), %rdx`).  This is
                //                        the fourcc slot of the current entry
                //                        (entryCursor-8..entryCursor-4).
                objc_msgSend_seek(stream, entryCursor - 8n);
                // @0xdd2b84-@0xdd2b97 — read entry fourcc.
                const entryIdBuf = { value: 0 };
                const nEId = objc_msgSend_read4(stream, entryIdBuf, 4);
                // @0xdd2b9a-@0xdd2b9e — `cmpq $4; jne 0xdd2c9e` — bail-branch.
                if (nEId !== 4n) {
                  break; // to shared bail block (@0xdd2c9e onward)
                }
                // @0xdd2ba4 — `-0x70(%rbp) = %r14d = entryCounter`.
                // @0xdd2ba8 — `%r14d = -0x2c(%rbp) = entryId`.
                const entryId: number = entryIdBuf.value >>> 0;
                // @0xdd2bac-@0xdd2bba — [stream seek: entryCursor - 4].
                //                        The size-lo slot.
                objc_msgSend_seek(stream, entryCursor - 4n);
                // @0xdd2bbd-@0xdd2bd0 — read size-lo.
                const entrySizeLoBuf = { value: 0 };
                const nESL = objc_msgSend_read4(stream, entrySizeLoBuf, 4);
                // @0xdd2bd3-@0xdd2bd7 — cmpq $4; jne 0xdd2c9a.
                if (nESL !== 4n) {
                  break;
                }
                // @0xdd2bdd — `%r12d = -0x2c(%rbp) = entrySizeLo` — note
                //              that %r12 is being reused here to hold the
                //              size-lo, and the outer waveStreamLen was
                //              preserved into `-0x68(%rbp)` @0xdd2b6b.
                const entrySizeLo: bigint = BigInt(entrySizeLoBuf.value >>> 0);
                // @0xdd2be1-@0xdd2bee — [stream seek: entryCursor].
                //                        The size-hi slot.
                objc_msgSend_seek(stream, entryCursor);
                // @0xdd2bf1-@0xdd2c04 — read size-hi.
                const entrySizeHiBuf = { value: 0 };
                const nESH = objc_msgSend_read4(stream, entrySizeHiBuf, 4);
                if (nESH !== 4n) {
                  break;
                }
                // @0xdd2c11 — `bswapl %r14d` — bswap the entry fourcc for
                //              push_back's first arg.
                const entryIdBS: number = ((((entryId & 0xff) << 24) |
                  ((entryId & 0xff00) << 8) |
                  ((entryId >>> 8) & 0xff00) |
                  (entryId >>> 24)) >>> 0);
                // @0xdd2c14-@0xdd2c1b — assemble the 64-bit size.
                const entrySize64: bigint =
                  (BigInt(entrySizeHiBuf.value >>> 0) << 32n) | entrySizeLo;
                // @0xdd2c1e-@0xdd2c2c — push_back(&tempList, entryIdBS,
                //                       -1n, entrySize64).
                ChunkList_push_back(tempList, entryIdBS, -1n, entrySize64);
                // @0xdd2c31-@0xdd2c39 — reload entryCounter, `cmpl -0x6c;
                //                        jae 0xdd2c9a`.  If we've hit the
                //                        table length, exit the table loop.
                if (entryCounter >= tableLen) {
                  break;
                }
                // @0xdd2c3b — `addq $0xc, %r13` — advance to next 12-byte
                //              entry.
                entryCursor += 0xcn;
                // @0xdd2c3f — `incl %r14d` — bump the counter.
                entryCounter += 1;
                // @0xdd2c42-@0xdd2c55 — reload chunkSize32 (`-0x48`) and
                //                        entryOffsetSeed (`-0x78`), compare
                //                        `cmpq %rcx,%rax; leaq 0xc(%rax),
                //                        %rax`, and reload waveStreamLen
                //                        (`-0x68`).  This is the "another
                //                        entry can fit in `chunkSize32`" test
                //                        expressed via arithmetic on the
                //                        seed.
                if (entryOffsetSeed > BigInt(chunkSize32)) {
                  // No more entries fit — reload waveStreamLen and drop out.
                  waveStreamLen = totalLength;
                  break;
                }
                entryOffsetSeed += 0xcn;
                waveStreamLen = totalLength;
              }
            }
            // Fall through to the shared post-ds64 block (@0xdd2ca9).
          }
        }

        // @0xdd2c5b or @0xdd2c9e-@0xdd2ca5 — reload chunkIdBS, ds64Payload
        //                                    offset, chunkSize32.  Then the
        //                                    shared oversize check @0xdd2ca9.
        // We inline the check here directly.  `%rcx = chunkSize32`,
        // `%rdx = ds64PayloadOffset = cursor + 8`, and `%r14 = %rcx + %rdx`.
        const ds64_endOffset: bigint = BigInt(chunkSize32) + ds64PayloadOffset;
        if (ds64_endOffset > waveStreamLen) {
          this.invalid_size = true;
          break loop;
        }
        // @0xdd2cb2-@0xdd2cb6 — push_back(&this.list, chunkIdBS, cursor,
        //                       chunkSize32).  The `%rdi = -0x80(%rbp)` is
        //                       `this + 8` = `&this.list`.  The `%rsi` for
        //                       this final push_back is `%esi = chunkIdBS`
        //                       from the reload; for the ds64 chunk the
        //                       chunkIdBS is `bswap(0x34367364) = 0x64733634`
        //                       ("64sd") — but the compiler set it back to
        //                       `%r14d` from the enclosing scope, which was
        //                       chunkIdBS from the ds64 chunk header itself.
        ChunkList_push_back(this.list, chunkIdBS, cursor, ds64_endOffset - cursor);

        // @0xdd2cbb-@0xdd2cc2 — `r14d &= 1; r13 = r14 + r13'`.  Advance
        // cursor to the aligned end of this chunk.  `r14` here is
        // `ds64_endOffset - cursor` — the payload+header length.  Then
        // `r13 = ds64_endOffset + (ds64_endOffset & 1)`.
        cursor = ds64_endOffset + (ds64_endOffset & 1n);
        continue loop;
      }

      // ── Non-ds64 branch (@0xdd2c64 … @0xdd2c98) ──────────────────────────
      // @0xdd2c64-@0xdd2c6f — `cmpl $-1, %ecx; sete %al; andb -0x2d(%rbp),%al;
      //                        cmpb $1,%al; jne 0xdd2ca9`.  Only try the ds64
      // sub-table if chunkSize32 == 0xFFFFFFFF AND ds64 is expected (isRF64).
      if (chunkSize32 === 0xffffffff && isRF64) {
        // @0xdd2c71-@0xdd2c98 — scan tempList for a matching id.  Note that
        // the compare `cmpl %esi, (%rax)` uses `%esi = chunkIdBS`, so we
        // match against the BSWAPPED chunk id — matching how ds64 push_back
        // stored the entry ids (bswapped @0xdd2c11).
        let found: BWFChunk | null = null;
        for (const entry of tempList.items) {
          if ((entry.id >>> 0) === chunkIdBS) {
            found = entry;
            break;
          }
        }
        if (found === null) {
          // @0xdd2c8d/@0xdd2c92 — `jmp 0xdd2cca` — invalid-size bail.
          this.invalid_size = true;
          break loop;
        }
        // @0xdd2c94 — `%rcx = 0x10(%rax)` — use the ds64 entry's size (+0x10).
        // In our TS Chunk model this is `entry.size`.
        // Now fall into the shared oversize check with `%rcx = entry.size`.
        // (The 32-bit chunkSize32 is thrown away in favour of the 64-bit
        //  size from the ds64 table.)
        const effectiveSize64: bigint = found.size;
        // @0xdd2ca9 — `%r14 = size + cursor`.
        const endOffset: bigint = effectiveSize64 + cursor;
        // @0xdd2cad-@0xdd2cb0 — `cmpq %r12,%r14; ja 0xdd2cca`.
        if (endOffset > waveStreamLen) {
          this.invalid_size = true;
          break loop;
        }
        // @0xdd2cb6 — push_back(&this.list, chunkIdBS, cursor, effectiveSize64).
        ChunkList_push_back(this.list, chunkIdBS, cursor, effectiveSize64);
        // @0xdd2cbb-@0xdd2cc2 — align + advance cursor.
        cursor = endOffset + (endOffset & 1n);
        continue loop;
      }

      // Regular chunk (size32, not ds64, not the -1 sentinel):
      // @0xdd2ca9 — `%r14 = %rcx + %rdx` where `%rcx = chunkSize32` and
      // `%rdx = cursor + 8` (per @0xdd2ca5 reload).  So `endOffset = size32 +
      // cursor + 8` — the "+ 8" is the chunk-header size (fourcc + size32)
      // that isn't part of the payload count.
      const endOffset: bigint = BigInt(chunkSize32) + (cursor + 8n);
      if (endOffset > waveStreamLen) {
        this.invalid_size = true;
        break loop;
      }
      // @0xdd2cb2-@0xdd2cb6 — push_back(&this.list, chunkIdBS, cursor,
      //                       chunkSize32).
      ChunkList_push_back(this.list, chunkIdBS, cursor, BigInt(chunkSize32));
      // @0xdd2cbb-@0xdd2cc2 — cursor advance with 2-byte alignment.
      cursor = endOffset + (endOffset & 1n);
      // @0xdd2cc5 — `jmp 0xdd2983` — back-edge.
      continue loop;
    }

    // ── Tail (@0xdd2cce … @0xdd2cf4) ────────────────────────────────────────
    // @0xdd2cce-@0xdd2cd5 — `movq -0x60(%rbp),%rdi; testq %rdi,%rdi;
    //                        je 0xdd2ce0`.  If tempList had storage, delete
    // it.  In TS, GC handles this; we keep the shape but no-op.
    void operator_delete;
    // Explicitly drop the reference to help mirror the free.
    tempList.items = [];

    // @0xdd2ce0 — `movb $0x1, 0x20(%rbx)` — mark parse complete.
    this.finished = true;
    // @0xdd2ce4-@0xdd2cf4 — `movb $0x1, %al; ... retq`.
    return true;
  }

  /**
   * `BWF_Parser::~BWF_Parser()` @Flexo 0xdd3f00 (D1, complete-object dtor).
   *
   * Body from raw-port/re/disasm/Flexo.BWF_Parser.~BWF_Parser.s:
   *   0xdd3f09  movq (%rdi), %rdi                 // arg = this->stream
   *   0xdd3f0c  callq *0xb197f6(%rip)             // literal pool -> _objc_release
   *   0xdd3f12  movq $0x0, (%rbx)                 // this->stream = null
   *   0xdd3f19  movq 0x8(%rbx), %rdi              // ChunkList.begin (this+8)
   *   0xdd3f1d  testq %rdi, %rdi
   *   0xdd3f20  je   0xdd3f31                     // if null: skip delete
   *   0xdd3f22  movq %rdi, 0x10(%rbx)             // this->list.endCap = begin
   *                                                //   (a "moved-from" marker
   *                                                //    that the ~ChunkList
   *                                                //    outside this dtor
   *                                                //    would honour)
   *   0xdd3f2c  jmp  __ZdlPv                      // operator delete(begin)
   *
   * D1 tail-jumps into `operator delete` when the list has storage, and
   * otherwise returns after zeroing the stream.  The landing pad @0xdd3f38
   * enters `___clang_call_terminate` — the noexcept trampoline.
   */
  destroy(): void {
    // @0xdd3f09-@0xdd3f0c — _objc_release(this->stream).
    const s = this.stream;
    if (s !== null) {
      // Native code does NOT null-check either; `objc_release(nil)` is a
      // documented no-op in the ObjC runtime.  We honour that.
      objc_release(s);
    }
    // @0xdd3f12 — this.stream = null.
    this.stream = null;

    // @0xdd3f19-@0xdd3f2c — free the ChunkList's backing if non-null.  We
    // model the trio as `items: BWFChunk[]`, so the "moved-from marker" step
    // (endCap = begin) has no analog; we simply drop the reference.  The
    // `operator_delete` symbol is kept as a documented frontier stub in case
    // a future ChunkList port needs it byte-exact.
    if (this.list.items.length !== 0) {
      // Native jumps into `__ZdlPv` here; we let JS GC reclaim the storage.
      this.list.items = [];
    }
    // No return-value; both D1 branches @0xdd3f2c and @0xdd3f37 hit `ret`
    // (or its tail-jmp equivalent) with %al unset.
  }
}
