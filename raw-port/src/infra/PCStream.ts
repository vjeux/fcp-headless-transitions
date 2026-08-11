// PCStream — ProCore.framework  (infra layer).
//
// The ProCore text-output stream base class. Faithful port of all 7 methods (ctor + 3 dtors +
// indent + two operator<< overloads). PCStream is an abstract WRITE-only text sink: it exposes a
// single pure-virtual "write raw bytes" slot at vtable *0x18 that concrete subclasses (e.g.
// PCStdoutStream, hash streams, buffer streams) override. Everything else (indentation, the
// operator<< helpers) is inline in this base and DISPATCHES through *0x18.
//
// VTABLE (ProCore @0x148B48; installed-ptr @0x148B58):
//   *0x00 -> 0xDD34C  ~PCStream (D1 base dtor)     — `ud2` (abstract)
//   *0x08 -> 0xDD352  ~PCStream (D0 deleting dtor) — `ud2` (abstract)
//   (D2, the base-object dtor @0x6DEC, is NOT a vtable slot: it is called directly, by name,
//    from each derived class's dtor. That is why it is an ordinary empty function while the
//    two vtable dtor slots above are `ud2` traps.)
//   *0x18            "write(void*, size_t)"        — pure virtual; installed by subclass
//   ... (typeinfo/vtable-embedded PCCurveFit at *0xE0/*0xE8/*0xF0 is a SEPARATE typeinfo
//        contiguously laid out after PCStream's — an artefact of ProCore's build unit; not
//        part of PCStream itself).
//
// STRUCT LAYOUT (recovered from ctor + methods):
//   +0x00  vptr — set to `&__ZTV8PCStream + 0x10` by the default ctor @0x6DDC.
//   (No other decoded fields; concrete subclasses add their state after +0x08.)
//
// CALLER CONVENTION FOR THE PURE-VIRTUAL SLOT (*0x18):
//   Called with (this=%rdi, buf=%rsi, len=%rdx). All three call sites in this file
//   (indent @0x6E1C / @0x6E3C, operator<<(char*) @0x6E87, operator<<(PCString&) @0x6EC9)
//   match this signature. This is thus modelled as `write(bytes: string, len: number)`.
//
// The base class is ABSTRACT: both dtor slots are `ud2` traps (the canonical clang shape for
// "compiler-emitted dtor thunks that are unreachable because every derived class overrides them").

import { PCString } from "./PCString.js";

/** PCString::size() const — ProCore @0x32262 (__ZNK8PCString4sizeEv). NOT yet exposed on the
 *  landed PCString class (see raw-port/src/infra/PCString.ts). Called from
 *  PCStream::operator<<(PCString const&) @0x6EA5. */
function PCString_size(_s: PCString): number {
  throw new Error(
    "PCString::size() const @ProCore 0x32262 (__ZNK8PCString4sizeEv; call site @0x6EA5) not yet transcribed on PCString",
  );
}

/** PCString::createCStr() const — ProCore @0x32278 (__ZNK8PCString10createCStrEv). Returns a
 *  freshly-malloc'd C string that the caller must free(). NOT yet exposed on PCString. Called
 *  from PCStream::operator<<(PCString const&) @0x6EB0. */
function PCString_createCStr(_s: PCString): string {
  throw new Error(
    "PCString::createCStr() const @ProCore 0x32278 (__ZNK8PCString10createCStrEv; call site @0x6EB0) not yet transcribed on PCString",
  );
}

/** `_free` @ProCore __stub 0xDE89A. C libc free(). Called from operator<<(PCString&) @0x6ECF to
 *  release the buffer returned by PCString::createCStr. In TS the string is GC-managed; this
 *  is a semantic no-op but retained for provenance. */
function libc_free(_p: string): void {
  // no-op: JS strings are GC-managed; the C buffer this would free doesn't exist here.
  // Cited @ProCore __stub 0xDE89A / call site 0x6ECF.
}

/** `_strlen` @ProCore __stub 0xDEB6A. C libc strlen(const char*). Called from
 *  operator<<(char const*) @0x6E6F when the input has length >= 2 characters (the 1-char
 *  fast-path @0x6E79 short-circuits with length=1). */
function libc_strlen(s: string): number {
  // Faithful: strlen counts bytes up to the first NUL. Our TS `string` has no embedded NULs
  // in practice (callers pass source-code / diagnostic literals); returning .length matches
  // the byte count for ASCII-only content, which is what PCStream sinks handle.
  // Cited @ProCore __stub 0xDEB6A / call site 0x6E6F.
  return s.length;
}

/**
 * `forty_spaces` — a 40-byte static buffer of ASCII spaces at ProCore 0xE20F0 (symbol
 * `__ZL12forty_spaces`, section flag `s` = local data). Verified from the extracted x86_64
 * slice: bytes 0..39 are 0x20 followed by a NUL. Referenced twice from indent() @0x6E07 and
 * @0x6E2F as the argument for a *0x18 write of length 40 (first path) or `2 * n` (final path).
 */
const forty_spaces = "                                        "; // 40 × 0x20 @ProCore 0xE20F0

/** Vtable base sentinel for PCStream: (this+0x0) is set to `&__ZTV8PCStream + 0x10` by the ctor
 *  @0x6DE0..0x6DE7 (`leaq 0x141d71(%rip),%rax ; movq %rax,(%rdi)`, target = 0x148B58 = TV+0x10). */
const PCStream_vtable_plus_0x10: unique symbol = Symbol("__ZTV8PCStream+0x10");

export abstract class PCStream {
  /** (+0x00) vptr — installed by the default ctor @0x6DE0. Concrete subclasses overwrite it. */
  __vptr: symbol = PCStream_vtable_plus_0x10;

  /**
   * PCStream::write(bytes, len) — pure-virtual slot at vtable *0x18. Every concrete PCStream
   * subclass provides its own implementation. Called by every method below. Undecoded on the
   * base (there is nothing to decode — the base has no body for it).
   */
  abstract write(bytes: string, len: number): void;

  /**
   * PCStream::PCStream() @ProCore 0x6DDC (__ZN8PCStreamC2Ev).
   * Body (7 lines):
   *   pushq %rbp; movq %rsp,%rbp
   *   leaq  0x141d71(%rip),%rax    ; = &__ZTV8PCStream + 0x10 (0x148B58, i.e. vt+0x10)
   *   movq  %rax,(%rdi)             ; this->vptr = &vt + 0x10
   *   popq  %rbp; retq
   * Sets the vptr and returns. No other fields to init.
   */
  constructor() {
    // vptr install — matches @0x6DE0..0x6DE7. Concrete subclasses will overwrite this immediately.
    this.__vptr = PCStream_vtable_plus_0x10;
  }

  /**
   * PCStream::~PCStream() (D1) @ProCore 0xDD34C (__ZN8PCStreamD1Ev).
   * Body:
   *   pushq %rbp; movq %rsp,%rbp
   *   ud2                            ; illegal-instruction trap
   * The base D1 is a trap — PCStream is abstract; only concrete-subclass dtors are reachable.
   */
  destroyD1(): never {
    throw new Error("PCStream::~PCStream() D1 @ProCore 0xDD34C is `ud2` — abstract-class trap, must never be reached");
  }

  /**
   * PCStream::~PCStream() (D0 — deleting) @ProCore 0xDD352 (__ZN8PCStreamD0Ev).
   * Body:
   *   pushq %rbp; movq %rsp,%rbp
   *   ud2                            ; illegal-instruction trap
   * Same trap semantics as D1 — the vtable slot exists for RTTI/vtable completeness only.
   * (The disassembly appears to continue past the `ud2` because otool -tV linearly decoded the
   *  NEXT function `PCCurveFit::getInstance` into the same block; the true PCStream D0 body is
   *  exactly the 3-instruction trap above.)
   */
  destroyD0(): never {
    throw new Error("PCStream::~PCStream() D0 @ProCore 0xDD352 is `ud2` — abstract-class trap, must never be reached");
  }

  /**
   * PCStream::~PCStream() (D2 — base-object dtor) @ProCore 0x6DEC (__ZN8PCStreamD2Ev).
   *
   * Full transcription of the entire 5-line body
   * (raw-port/re/disasm/ProCore.__ZN8PCStreamD2Ev.s):
   *
   *   0x6dec  pushq %rbp        ; frame prologue
   *   0x6ded  movq  %rsp, %rbp
   *   0x6df0  popq  %rbp        ; epilogue
   *   0x6df1  retq
   *
   * The body is EMPTY — a frame is built and immediately torn down. There is no store, no
   * call, no vptr write, and (unlike the D1/D0 slots above) no `ud2`. That is exactly what
   * the C++ says: PCStream's only decoded member is the vptr at +0x00, it owns no heap
   * resource, and a base-object destructor does not reset the vptr, so the compiler had
   * nothing to emit. `destroyD2()` therefore does nothing, and doing nothing IS the port —
   * a throw here would be WRONG (it would turn a reachable, side-effect-free dtor into a
   * trap, and D2 is the one dtor variant of the three that is genuinely callable).
   *
   * THE EMPTINESS IS VERIFIED, NOT ASSUMED. Two independent checks, because a body that
   * "looks empty" is precisely the shape OPS_LOG #368 describes when a slicer truncates a
   * REAL body:
   *   (a) EXTENT — the function is 6 bytes, 0x6dec..0x6df1 inclusive, and the very next
   *       exported symbol `PCStream::indent(unsigned int)` (__ZN8PCStream6indentEj) starts
   *       at 0x6df2, one byte past the `retq`. There is no room for a dropped instruction:
   *       the address range is fully accounted for by the four instructions above.
   *   (b) DIFFERENTIAL — raw-port/re/oracle/PCStream_D2_oracle.py dlsym's the live exported
   *       symbol (`nm` type `T` @0x6dec) under `arch -x86_64` and calls it on a 0x100-byte
   *       record, then compares the record byte-for-byte with its pre-call contents, over 32
   *       fills (0x00, 0xEE, 0xFF, 0xA5 and 28 seeded-random ones, several with a
   *       plausible-looking vptr in the first qword): 32 records, 0x100 bytes each,
   *       **0 mutated bytes**. Had the real D2 reset the vptr — the single most likely
   *       non-empty behaviour for a base dtor, and the one a truncated disasm would hide —
   *       the +0x00 qword would differ on every fill.
   */
  destroyD2(): void {
    // @0x6dec..0x6df1 — pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq.
    // Prologue and epilogue only: no field is written, the vptr at +0x00 is left alone,
    // and nothing is called. The empty body is the whole function.
  }

  /**
   * PCStream::indent(unsigned int n) @ProCore 0x6DF2 (__ZN8PCStream6indentEj).
   * Body (34 lines) — writes `2*n` spaces to the stream, in chunks of 40 (the `forty_spaces`
   * buffer). Faithful control-flow transcription:
   *
   *   @0x6DFC:  r14d = n                                  (arg1 saved)
   *   @0x6DFF:  rbx  = this
   *   @0x6E02:  cmpl $0x15,%esi                            ; n < 21 ?
   *   @0x6E05:  jb   0x6E29                                ; skip the 40-space loop
   *   @0x6E07:  r15 = &forty_spaces                        ; loop header
   *   @0x6E0E:  rax = *(rbx)                               ; load vptr
   *   @0x6E11:  edx = 0x28  (= 40)                         ; length
   *   @0x6E16..0x6E1C:  this->[*0x18](&forty_spaces, 40)   ; write 40 spaces
   *   @0x6E1F:  r14d -= 20                                 ; consumed 20 pairs (40 chars)
   *   @0x6E23:  cmpl $0x14,%r14d ; ja 0x6E0E              ; while (remaining > 20) loop
   *   @0x6E29:  r14 = 2 * remaining                        ; final chunk: 2*n' spaces
   *   @0x6E2C..0x6E3C:  this->[*0x18](&forty_spaces, 2*r)  ; write the tail
   *   @0x6E3F..:  return this
   *
   * i.e. `indent(n)` writes 2·n space bytes total, chunked as (40, 40, …, 2·(n mod 20)). The
   * loop consumes 20 units of `n` at a time (each iteration emits 40 characters). Return value
   * is `this` (used for chained operator<<).
   */
  indent(n: number): this {
    // Mirror the asm: uint32 arithmetic. The compiler chose an "n < 21" pre-check so that
    // strictly-below-21 counts skip straight to the tail write.
    let r = n >>> 0;
    if (r >= 0x15) {
      do {
        // this->write(forty_spaces, 40) — pure-virtual call @0x6E1C.
        this.write(forty_spaces, 0x28);
        r = (r - 0x14) >>> 0;
      } while (r > 0x14);
    }
    // Final chunk: 2 * r bytes from the same forty_spaces buffer @0x6E2C..0x6E3C.
    this.write(forty_spaces, (r + r) >>> 0);
    return this;
  }

  /**
   * PCStream::operator<<(char const* s) @ProCore 0x6E4E (__ZN8PCStreamlsEPKc).
   * Body (27 lines) — writes a C string, choosing length via `strlen` (for >=2 chars) or the
   * constant 1 (single-char fast path). If s is NULL or empty, no write is issued.
   *
   *   @0x6E58:  if (s == NULL) goto ret                    (test/je 0x6E8A)
   *   @0x6E60:  r14 = s
   *   @0x6E63:  if (*s == 0) goto ret                       (empty string)
   *   @0x6E65:  if (s[1] == 0) { edx = 1; goto write }      (1-char fast path)
   *   @0x6E6C:  rdx = strlen(s)                              (2+ char path)
   *   @0x6E7E..0x6E87:  this->[*0x18](s, len)                (write)
   *   @0x6E8A..:  return this
   */
  writeCString(s: string | null): this {
    // @0x6E58 test/je: null skips.
    if (s === null) return this;
    // @0x6E63 cmpb $0x0,(%rsi): empty string skips.
    if (s.length === 0) return this;
    // @0x6E65 cmpb $0x0,0x1(%r14): 1-char fast path emits length=1.
    let len: number;
    if (s.length === 1) {
      len = 1; // @0x6E79 movl $0x1,%edx
    } else {
      len = libc_strlen(s) >>> 0; // @0x6E6F callq _strlen
    }
    // @0x6E7E..0x6E87: this->write(s, len) via vtable *0x18.
    this.write(s, len);
    return this;
  }

  /**
   * PCStream::operator<<(PCString const& p) @ProCore 0x6E92 (__ZN8PCStreamlsERK8PCString).
   * Body (31 lines):
   *   @0x6EA5:  r15d = p.size()                          (PCString::size — ProCore 0x32262)
   *   @0x6EB0:  r14  = p.createCStr()                     (PCString::createCStr — 0x32278)
   *   @0x6EB8:  if (size == 0) goto free                 (empty PCString skips the write)
   *   @0x6EC0..0x6EC9:  this->[*0x18](r14, size)          (write)
   *   @0x6ECF:  free(r14)                                 (release the malloc'd buffer)
   *   @0x6ED4..:  return this
   *
   * Two things worth calling out for faithfulness:
   *  (a) `size` from PCString::size() is the character count; `createCStr` returns a malloc'd
   *      NUL-terminated copy the caller must free. We forward both to throwing stubs @their
   *      real addresses until PCString grows those methods.
   *  (b) If size==0, the buffer is STILL allocated and STILL freed (matches the branch @0x6EBB
   *      which jumps past the write to the free) — we mirror that ordering.
   */
  writePCString(p: PCString): this {
    // @0x6EA5: PCString::size() — throwing stub @ProCore 0x32262 (undecoded on PCString).
    const size = PCString_size(p) >>> 0;
    // @0x6EB0: PCString::createCStr() — throwing stub @ProCore 0x32278 (undecoded on PCString).
    const cstr = PCString_createCStr(p);
    // @0x6EB8/0x6EBB: skip the write iff size==0, but STILL free the buffer.
    if (size !== 0) {
      this.write(cstr, size); // @0x6EC0..0x6EC9
    }
    libc_free(cstr); // @0x6ECF
    return this;
  }
}
