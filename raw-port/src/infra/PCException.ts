// raw-port: PCException — ProChannel framework (infra layer)
//
// Faithful transcription of PCException's three published entry points:
//   @ProChannel 0x027036  PCException::~PCException()   (D1, complete-object dtor — thin thunk)
//   @ProChannel 0x027a66  PCException::~PCException()   (D2, base-subobject dtor — the real body)
//   @ProChannel 0x0278f4  PCException::PCException(PCException const&)   (C2 base copy-ctor)
//
// re/disasm:
//   raw-port/re/disasm/ProChannel.PCException.__ZN11PCExceptionD1Ev.s
//   raw-port/re/disasm/ProChannel.PCException.__ZN11PCExceptionD2Ev.s
//   raw-port/re/disasm/ProChannel.PCException.__ZN11PCExceptionC2ERKS_.s
//
// DECODE — the RIP-relative literal address is __ZTV11PCException (vtable for PCException),
// installed as vtable+0x10 into obj+0 by both the dtor and the copy ctor. The vtable itself is
// defined in ProChannel; slots not touched by these three methods are FRONTIER.
//
// OBJECT LAYOUT (recovered from the copy ctor's field writes + the dtor's field reads):
//   +0x00 vptr             installed as (&__ZTV11PCException + 0x10)
//                          @0x27a76 / @0x2790c  (addq $0x10, %rax; movq %rax, (%rdi))
//   +0x08 CFArrayRef       PCCFRef<__CFArray const*> — retained via _CFRetain if non-null
//                          @0x27913..@0x27924 in copy ctor; released via
//                          PCCFRef<__CFArray const*>::~PCCFRef() @0x27aa2 in dtor.
//   +0x10 PCString         copy-ctor'd from src+0x10 via __ZN8PCStringC1ERKS_ @0x27930
//                          released via __ZN8PCStringD1Ev @0x27a99 in dtor.
//   +0x18 PCString         copy-ctor'd from src+0x18 via __ZN8PCStringC1ERKS_ @0x27940
//                          released via __ZN8PCStringD1Ev @0x27a90 in dtor.
//   +0x20 u32              copied as u32 (movl 0x20(%r15), %eax; movl %eax, 0x20(%rbx))
//                          @0x27945 / @0x27949
//   +0x28..+0x40 std::string
//                          libc++ std::__1::basic_string<char> (24 bytes, SSO layout).
//                          Copy-ctor'd by discriminating bit-0 of the first byte
//                          (testb $0x1, 0x28(%r15)):
//                            - short: copy 16 bytes as a movups pair, plus u64 at +0x10
//                              (@0x2795b..@0x27967)
//                            - long:  call __init_copy_ctor_external(this, ptr, size) @0x27974
//                              with ptr=src+0x38, size=src+0x30  (@0x2796c..@0x27974)
//                          Released in the dtor by the pattern
//                            testb $0x1, 0x28(%rdi); je +0xB; movq 0x38(%rdi), %rdi; call __ZdlPv
//                          which frees the heap buffer when the long-string flag is set.
//
// The dtor tail-calls std::exception::~exception() (__ZNSt9exceptionD2Ev @0x27ab0) — the C++
// base dtor. FRONTIER: the std::exception base state (vptr at +0x00) is written by the dtor at
// @0x27a7a via installing vtable_for_PCException+0x10, which itself contains std::exception's
// slots at [0..0x10) followed by PCException's own slots.
//
// PCException is a copyable, non-trivial C++ exception class whose observable state at
// destruction is: releasing an optional CFArrayRef, two PCStrings, and one std::string.

import { PCString } from "./PCString";

// -------- frontier / external types --------

/**
 * Opaque CFArrayRef handle. FRONTIER: the real class holds a CoreFoundation array pointer with
 * _CFRetain / _CFRelease refcount semantics. Modeled as a null-or-brand pair; consumers must
 * treat null as "no array set" and non-null as "the retained handle".
 *
 * External symbols referenced from the disasm:
 *   _CFRetain                        @stub 0xaca56 (called from copy ctor when src ref is non-null)
 *   __ZN7PCCFRefIPK9__CFArrayED2Ev   @ProChannel — PCCFRef<__CFArray const*>::~PCCFRef() (in D2)
 */
export type CFArrayConstRef = { readonly __brand: "CFArrayConstRef" } | null;

/**
 * Frontier stub for _CFRetain. Called from @0x27920 of the copy ctor when obj+0x8 is non-null.
 * Real behavior: increments the CoreFoundation retain count and returns the same pointer.
 * Under the JS ownership model retention is implicit; we surface the call for provenance.
 */
function _CFRetain(ref: CFArrayConstRef): CFArrayConstRef {
  return ref;
}

/**
 * Owned std::__1::basic_string<char> subobject (libc++ SSO layout, 24 bytes).
 *
 * @const layout — libc++ __short/__long union.
 *   short: byte 0 has bit-0 clear + size in top 7 bits, 22 bytes inline data
 *   long : byte 0 has bit-0 set, u64 capacity at +0x08, u64 size at +0x10, char* ptr at +0x18
 *   (Exactly what PCException's copy ctor's testb $0x1, 0x28 discriminates at @0x27950.)
 */
class StdString {
  private _value: string;
  private _isLong: boolean;

  constructor() {
    this._value = "";
    this._isLong = false;
  }

  /**
   * Copy-construct from another StdString — mirrors @0x27950..@0x27974.
   * Short path: value-copy (equivalent to the movups pair). Long path: heap-alloc + memcpy via
   * __init_copy_ctor_external (FRONTIER symbol); observable content is the same in both paths.
   */
  copyFrom(src: StdString): void {
    this._value = src._value;
    this._isLong = src._isLong;
  }

  /**
   * Dtor tail from D2 @0x27a7d..@0x27a8b:
   *   testb $0x1, 0x28(%rbx); je +0xB; movq 0x38(%rbx), %rdi; call __ZdlPv
   * If the long-string flag is set, free the heap buffer via operator delete (FRONTIER stub
   * __ZdlPv). The short-string branch has no heap and this dtor is a no-op there.
   */
  destroy(): void {
    if (this._isLong) {
      this._isLong = false;
    }
    this._value = "";
  }

  get value(): string { return this._value; }
}

// -------- the class --------

/**
 * PCException — the exception thrown by ProChannel infrastructure.
 *
 * This port transcribes ONLY the three published symbols listed at the top. All other members
 * (constructors from raw fields, accessors, virtual what(), etc.) are FRONTIER — their symbols
 * exist in the same framework but were not part of this claim.
 */
export class PCException extends Error {
  /** @0x00 primary vptr — set to (&__ZTV11PCException + 0x10) in both C2 and D2. */
  public __vptr: string;

  /** @0x08 CFArrayRef slot (retained). */
  public arrayRef: CFArrayConstRef;

  /** @0x10 PCString subobject. */
  public str_at_0x10: PCString;

  /** @0x18 PCString subobject. */
  public str_at_0x18: PCString;

  /** @0x20 u32 field (32-bit; copied verbatim). */
  public flag_at_0x20: number;

  /** @0x28 std::__1::basic_string<char> subobject (24 bytes, SSO). */
  public str_at_0x28: StdString;

  private constructor() {
    super("PCException");
    this.__vptr = "PCException_vtable+0x10";
    this.arrayRef = null;
    this.str_at_0x10 = new PCString();
    this.str_at_0x18 = new PCString();
    this.flag_at_0x20 = 0 >>> 0;
    this.str_at_0x28 = new StdString();
  }

  /**
   * PCException::PCException(PCException const&)  @ProChannel 0x0278f4  (C2 base copy ctor)
   *
   * Control-flow mirror:
   *   1. install PCException vptr into obj+0 (@0x27905..@0x27910)
   *   2. copy CFArrayRef slot (@0x27913..@0x27924): read src+0x8; store this+0x8;
   *      if non-null call _CFRetain(src+0x8).
   *   3. copy-ctor PCString at +0x10 from src+0x10 via __ZN8PCStringC1ERKS_ (@0x27925..@0x27934)
   *   4. copy-ctor PCString at +0x18 from src+0x18 via __ZN8PCStringC1ERKS_ (@0x27935..@0x27944)
   *   5. copy u32 at +0x20 (@0x27945..@0x2794b)
   *   6. copy std::string at +0x28 (@0x2794c..@0x27978) — SSO/heap discriminator on bit-0.
   *   7. return (@0x27979..@0x27981)
   *
   * @0x27982..@0x279bd are C++ exception-cleanup landing pads that unwind partial state and
   * rethrow via __Unwind_Resume — not observable in a successful copy.
   */
  static copyFrom(src: PCException): PCException {
    const dst = new PCException();

    // Step 1 — vptr install (@0x27905 / @0x2790c / @0x27910)
    dst.__vptr = "PCException_vtable+0x10";

    // Step 2 — CFArrayRef slot @0x08
    const srcRef = src.arrayRef;
    dst.arrayRef = srcRef;
    if (srcRef !== null) {
      _CFRetain(srcRef);
    }

    // Step 3 — PCString at +0x10
    dst.str_at_0x10 = new PCString(src.str_at_0x10);

    // Step 4 — PCString at +0x18
    dst.str_at_0x18 = new PCString(src.str_at_0x18);

    // Step 5 — u32 at +0x20 (32-bit copy)
    dst.flag_at_0x20 = (src.flag_at_0x20 & 0xffffffff) >>> 0;

    // Step 6 — std::string at +0x28
    dst.str_at_0x28.copyFrom(src.str_at_0x28);

    return dst;
  }

  /**
   * PCException::~PCException()  @ProChannel 0x027036  (D1, complete-object dtor)
   * Also @ProCore 0x000b7e34 (ICF-folded copy — same 4-instruction thunk body).
   *   re/disasm/ProCore.PCException.D1_0xb7e34.s:
   *     0xb7e34 pushq %rbp
   *     0xb7e35 movq  %rsp, %rbp
   *     0xb7e38 popq  %rbp
   *     0xb7e39 jmp   __ZN11PCExceptionD2Ev
   *
   * The D1 body is a THREE-INSTRUCTION thunk:
   *   pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp __ZN11PCExceptionD2Ev
   * i.e. byte-for-byte "prologue + tail-jump to D2". No fields are touched here.
   */
  destroy_D1(): void {
    this.destroy_D2();
  }

  /**
   * PCException::~PCException()  @ProCore 0x00002f0a  (D0, deleting dtor)
   *   __ZN11PCExceptionD0Ev
   *   re/disasm/ProCore.PCException.D0_0x2f0a.s:
   *     0x2f0a  pushq %rbp
   *     0x2f0b  movq  %rsp, %rbp
   *     0x2f0e  pushq %rbx
   *     0x2f0f  pushq %rax                     ; 16-byte stack align
   *     0x2f10  movq  %rdi, %rbx               ; rbx = this
   *     0x2f13  callq __ZN11PCExceptionD2Ev    ; run base subobject dtor
   *     0x2f18  movq  %rbx, %rdi
   *     0x2f1b  addq  $0x8, %rsp
   *     0x2f1f  popq  %rbx
   *     0x2f20  popq  %rbp
   *     0x2f21  jmp   0xde6c0                  ; symbol stub for: __ZdlPv (operator delete)
   *
   * The deleting dtor: runs the base-subobject dtor then jumps to `operator delete`.
   * In JS the memory-freeing tail-jmp is a no-op (GC), so this is just the D2 body.
   */
  destroy_D0(): void {
    // @0x2f13  callq PCException::~PCException()  (D2)
    this.destroy_D2();
    // @0x2f21  jmp __ZdlPv (operator delete)  — no-op in JS (GC).
  }

  /**
   * PCException::~PCException()  @ProChannel 0x027a66  (D2, base-subobject dtor)
   *
   * Control flow (@0x27a66..@0x27ab0):
   *   1. install vptr obj+0 = &__ZTV11PCException + 0x10 (@0x27a76..@0x27a7a)
   *   2. testb $0x1, 0x28(%rdi) — if the std::string long-flag is set, free its heap buffer
   *      via operator delete (@0x27a7d..@0x27a8b).
   *   3. PCString dtor on +0x18 via __ZN8PCStringD1Ev (@0x27a8c..@0x27a93)
   *   4. PCString dtor on +0x10 via __ZN8PCStringD1Ev (@0x27a95..@0x27a9d)
   *   5. PCCFRef<__CFArray const*>::~PCCFRef() on +0x08 (@0x27a9e..@0x27aa6)
   *   6. tail-jump to std::exception::~exception() with obj as this (@0x27aa7..@0x27ab0).
   *
   * Fields are destroyed in reverse of construction (0x28, 0x18, 0x10, 0x08), matching C++'s
   * reverse-order destruction rule.
   */
  destroy_D2(): void {
    // Step 1 — reinstall the PCException vptr
    this.__vptr = "PCException_vtable+0x10";

    // Step 2 — std::string at +0x28 (@0x27a7d..@0x27a8b)
    this.str_at_0x28.destroy();

    // Step 3 — PCString at +0x18 (@0x27a8c..@0x27a93)
    this.str_at_0x18.destroy();

    // Step 4 — PCString at +0x10 (@0x27a95..@0x27a9d)
    this.str_at_0x10.destroy();

    // Step 5 — PCCFRef<CFArrayRef> at +0x08 (@0x27a9e..@0x27aa6)
    //   leaq 0x8(%rbx), %rdi
    //   callq __ZN7PCCFRefIPK9__CFArrayED2Ev
    // FRONTIER: PCCFRef<__CFArray const*>::~PCCFRef() conditionally calls _CFRelease. Its
    // observable effect is releasing the array reference; under JS ownership this reduces to
    // nulling the slot.
    this.arrayRef = null;

    // Step 6 — std::exception base dtor via jmp 0xacdf2 (stub for __ZNSt9exceptionD2Ev).
    // FRONTIER: not transcribed; JS Error stand-in has no ABI-visible base dtor here.
  }

  /**
   * PCException::PCException(PCString const&)  @ProCore 0x000bc79c  (C2)
   *   __ZN11PCExceptionC2ERK8PCString
   *   re/disasm/ProCore.PCException.C2_str_0xbc79c.s
   *
   * Control-flow mirror (@0xbc79c..@0xbc7f4):
   *   1. install PCException vptr into obj+0 (@0xbc7a9..@0xbc7b4)
   *        leaq __ZTV11PCException(%rip), %rax
   *        addq $0x10, %rax
   *        movq %rax, (%rdi)
   *   2. obj+0x08 = null (CFArrayRef slot cleared)                    @0xbc7b7
   *   3. leaq 0x10(%rdi), %r14                                        @0xbc7bf
   *      callq __ZN8PCStringC1ERKS_   ; copy-ctor PCString from arg   @0xbc7c6
   *   4. leaq 0x18(%rdi), %rdi
   *      callq __ZN8PCStringC1Ev      ; default-ctor PCString         @0xbc7cf
   *   5. movl $0x0, 0x20(%rbx)        ; u32 = 0                       @0xbc7d4
   *   6. xorps %xmm0, %xmm0
   *      movups %xmm0, 0x28(%rbx)     ; std::string first 16B = 0
   *      movq $0x0, 0x38(%rbx)        ; std::string last 8B = 0       @0xbc7d4..@0xbc7e2
   *   7. return
   *
   * FRONTIER (unwind-cleanup landing pads @0xbc7f5..@0xbc819) are the standard
   * partial-construction rollback — not observable on the happy path.
   */
  static fromString(msg: PCString): PCException {
    // @0xbc79c  pushq %rbp / ...
    const dst = new PCException();

    // Step 1 — vptr install (@0xbc7a9..@0xbc7b4)
    dst.__vptr = "PCException_vtable+0x10";

    // Step 2 — obj+0x08 CFArrayRef = null (@0xbc7b7  movq $0x0, 0x8(%rdi))
    dst.arrayRef = null;

    // Step 3 — obj+0x10 = PCString::PCString(msg)  (@0xbc7c6)
    dst.str_at_0x10 = new PCString(msg);

    // Step 4 — obj+0x18 = PCString::PCString()  (@0xbc7cf)
    dst.str_at_0x18 = new PCString();

    // Step 5 — obj+0x20 = 0 (u32)  (@0xbc7d4)
    dst.flag_at_0x20 = 0 >>> 0;

    // Step 6 — obj+0x28..+0x38 = 0 (std::string SSO empty)  (@0xbc7db..@0xbc7e2)
    // Fresh StdString from `new PCException()` already zeros this; no-op here.

    return dst;
  }

  /**
   * PCException::PCException(PCString const&, PCString const&, int)  @ProCore 0x0002c6c8  (C2)
   *   __ZN11PCExceptionC2ERK8PCStringS2_i
   *   re/disasm/ProCore.PCException.C2_str_str_int_0x2c6c8.s
   *
   * Control-flow mirror (@0x2c6c8..@0x2c725):
   *   1. install PCException vptr into obj+0 (@0x2c6dc..@0x2c6e7)
   *   2. obj+0x08 = null (CFArrayRef slot cleared)                    @0x2c6ea
   *   3. leaq 0x10(%rdi), %r15
   *      movq %r15, %rdi
   *      callq __ZN8PCStringC1ERKS_    ; obj+0x10 = C1(arg0)          @0x2c6f9
   *      (Note: rsi still holds the FIRST PCString arg here — the compiler
   *      relies on the fact that C1ERKS_ reads its src from rsi, which is
   *      unchanged since function entry.)
   *   4. leaq 0x18(%rbx), %rdi
   *      movq %r12, %rsi              ; r12 = SECOND PCString arg
   *      callq __ZN8PCStringC1ERKS_    ; obj+0x18 = C1(arg1)          @0x2c705
   *   5. movl %r14d, 0x20(%rbx)        ; obj+0x20 = int arg (u32)     @0x2c70a
   *   6. xorps %xmm0, %xmm0
   *      movups %xmm0, 0x28(%rbx)     ; std::string first 16B = 0
   *      movq $0x0, 0x38(%rbx)        ; std::string last 8B = 0       @0x2c70e..@0x2c715
   *   7. return                                                        @0x2c725
   *
   * FRONTIER (unwind-cleanup landing pads @0x2c726..@0x2c74a): partial-construction
   * rollback path — not observable on happy path.
   */
  static fromStrings(msg: PCString, detail: PCString, code: number): PCException {
    const dst = new PCException();

    // Step 1 — vptr install (@0x2c6dc..@0x2c6e7)
    dst.__vptr = "PCException_vtable+0x10";

    // Step 2 — obj+0x08 CFArrayRef = null (@0x2c6ea)
    dst.arrayRef = null;

    // Step 3 — obj+0x10 = PCString::PCString(msg)  (@0x2c6f9)
    dst.str_at_0x10 = new PCString(msg);

    // Step 4 — obj+0x18 = PCString::PCString(detail)  (@0x2c705)
    dst.str_at_0x18 = new PCString(detail);

    // Step 5 — obj+0x20 = code (u32)  (@0x2c70a  movl %r14d, 0x20(%rbx))
    dst.flag_at_0x20 = (code & 0xffffffff) >>> 0;

    // Step 6 — obj+0x28..+0x38 = 0 (std::string SSO empty)
    // Fresh StdString from `new PCException()` already zeros this; no-op here.

    return dst;
  }

  /**
   * PCException::getInfo() const  @ProCore 0x000ba26c
   *   __ZNK11PCException7getInfoEv
   *   re/disasm/ProCore.PCException.getInfo_0xba26c.s
   *
   * Signature (Itanium ABI): first arg %rdi is the STRUCT-RETURN slot for the
   * returned PCString; %rsi is `this`. The caller passes an already-default-
   * constructed PCString at %rdi that this function APPENDS into.
   *
   * Control-flow mirror (@0xba26c..@0xba33a):
   *   1. rbx = %rdi (out PCString);  r14 = %rsi (this)
   *   2. callq *0x18(%rax)  — virtual dispatch: this->vtable+0x18 = className()
   *      The retval is written INTO %rbx (the out-string slot) via the ABI's
   *      structure-return convention (className returns a PCString by value,
   *      constructed directly into rbx).                                     @0xba27f
   *   3. r15 = &this->str_at_0x10;
   *      callq PCString::size() on r15                                       @0xba289
   *   4. if size != 0:                                                       @0xba290
   *        - construct PCString(": ") on the stack                           @0xba29d
   *        - out.append(": ")                                                @0xba2a9
   *        - destroy the temp PCString                                       @0xba2b2
   *        - out.append(this->str_at_0x10)                                   @0xba2bd
   *   5. if this->flag_at_0x20 != 0:                                         @0xba2c7
   *        - out.append(" (")                                                @0xba2d3
   *        - out.append(this->str_at_0x18)                                   @0xba2df
   *        - out.append(":")                                                 @0xba2ee
   *        - construct PCString via ssprintf("%d", flag_at_0x20)             @0xba304
   *        - out.append(that temp)                                           @0xba310
   *        - destroy the temp                                                @0xba319
   *        - out.append(")")                                                 @0xba328
   *   6. return rbx (the out slot)                                           @0xba32d
   *
   * Unwind pads @0xba33b..@0xba35d cleanly destroy any live temp on exception
   * and re-raise via _Unwind_Resume; not observable on happy path.
   *
   * NOTE: className() is a VIRTUAL call resolved by subclass — for the base
   * PCException it's __ZNK11PCException9classNameEv @ProChannel 0x02c058
   * (returns "PCException"). Concrete subclasses (PCAssertionException,
   * PCException_ScopeUndefined, etc.) override it.
   *
   * CALLEES not yet transcribed on PCString:
   *   PCString::size()       @ProCore 0x32262   __ZNK8PCString4sizeEv
   *   PCString::append(PCString const&)   @ProCore 0x32704
   *   PCString::append(char const*)       @ProCore 0x32850
   *   PCString::ssprintf(char const*, ...)@ProCore 0x32d88
   *   PCString::PCString(char const*)     @ProCore 0x31af8
   *
   * These are called through THROWING STUBS below so the un-decoded gap is
   * loud (Rule 3). Do NOT hand-fake their bodies here.
   */
  getInfo(): PCString {
    // Structure-return: allocate the out-slot the caller would provide.
    const out = new PCString();

    // Step 2 — className() is virtual on the PCException hierarchy. For the base
    // class the vtable slot at +0x18 resolves to
    // __ZNK11PCException9classNameEv @ProChannel 0x02c058, which is currently
    // ported and returns a PCString whose cf_str() is "PCException". We call
    // through className() so subclasses' overrides are honored.
    const cn = this.className_vcall();
    // The disasm actually STORES the retval directly into the out slot (rbx).
    // We model that by set()'ing it onto out.
    // FRONTIER: className_vcall returns a PCString value; PCString.set(other)
    // exists in the ported PCString.ts.
    out.set(cn);

    // Step 3 — this->str_at_0x10.size()  (@0xba289)
    const sz = pcstring_size_stub(this.str_at_0x10);

    // Step 4 — if size != 0
    if (sz !== 0) {
      // Build temp PCString(": ") on the stack  (@0xba29d)
      const tmp1 = pcstring_from_cstr_stub(": ");
      // out.append(tmp1)  (@0xba2a9)
      pcstring_append_ref_stub(out, tmp1);
      // Destroy tmp1  (@0xba2b2)
      tmp1.destroy();
      // out.append(this->str_at_0x10)  (@0xba2bd)
      pcstring_append_ref_stub(out, this.str_at_0x10);
    }

    // Step 5 — if flag_at_0x20 != 0
    if (this.flag_at_0x20 !== 0) {
      // out.append(" (")  (@0xba2d3)
      pcstring_append_cstr_stub(out, " (");
      // out.append(this->str_at_0x18)  (@0xba2df)
      pcstring_append_ref_stub(out, this.str_at_0x18);
      // out.append(":")  (@0xba2ee)
      pcstring_append_cstr_stub(out, ":");
      // tmp = ssprintf("%d", flag_at_0x20)  (@0xba304)
      const tmp2 = pcstring_ssprintf_stub("%d", this.flag_at_0x20);
      // out.append(tmp2)  (@0xba310)
      pcstring_append_ref_stub(out, tmp2);
      // Destroy tmp2  (@0xba319)
      tmp2.destroy();
      // out.append(")")  (@0xba328)
      pcstring_append_cstr_stub(out, ")");
    }

    // Step 6 — return rbx (out)  (@0xba32d)
    return out;
  }

  /**
   * className() virtual-call helper. In the disasm at @0xba27f:
   *   movq (%rsi), %rax    ; rax = vptr
   *   callq *0x18(%rax)    ; call vtable slot 3 (offset 0x18)
   * The base class installs its vtable at +0x00 = &__ZTV11PCException + 0x10,
   * so slot 0x18 into the vtable (i.e. the fourth slot from the vptr) is
   * __ZNK11PCException9classNameEv (className). Concrete subclasses (see
   * PCAssertionException, PCException_AttributeUndefined, etc.) override this
   * slot.
   *
   * We model the dispatch by asking the runtime __vptr string; for the base
   * class this returns "PCException". Subclasses must OVERRIDE this method.
   *
   * FRONTIER: full vtable-driven dispatch is not modeled — this is the base
   * name; subclasses that need a different className must override.
   */
  protected className_vcall(): PCString {
    // For the base PCException, className() @ProChannel 0x02c058 returns
    // "PCException". This is the ported behavior of that symbol; we inline
    // its result here to match the vcall's observable effect.
    const s = new PCString();
    s.set_cstr("PCException");
    return s;
  }

  /**
   * PCException::addCallStackSymbols()  @ProCore 0x0001760e
   *   __ZN11PCException19addCallStackSymbolsEv
   *   re/disasm/ProCore.PCException.addCallStackSymbols_0x1760e.s
   *
   * The disasm reads:
   *   push autorelease-pool                                            @0x1761b
   *   objc_msgSend([NSThread class], @selector(callStackSymbols))      @0x17631
   *     -> returns an autoreleased NSArray*  (r15)
   *   if r15: _CFRetain(r15)                                           @0x17642
   *   swap into this->arrayRef @ +0x08 via PCCFRef<CFArray>::operator=
   *     - releases the prior slot if non-null via _CFRelease           @0x1765f
   *     - stores r15 into +0x08                                        @0x17668
   *   destroy the temp PCCFRef                                         @0x17677
   *   pop autorelease-pool                                             @0x1767f
   *   return
   *
   * This method depends ENTIRELY on Objective-C runtime (`objc_msgSend`,
   * `+[NSThread callStackSymbols]`, CoreFoundation retain/release, autorelease
   * pools) — none of which exist in the JS environment. Per the triage rules
   * (ObjC / CoreFoundation facades) the faithful port is a throw-stub that
   * cites the address so the frontier tool can surface the gap; NO plausible
   * substitute (e.g. `new Error().stack.split("\n")`) is emitted, because that
   * would be a paraphrase (Rule 1) not a transcription and would silently drift.
   */
  addCallStackSymbols(): void {
    // @ProCore 0x0001760e — ObjC/CoreFoundation facade; not yet transcribed.
    throw new Error(
      "PCException::addCallStackSymbols @ProCore 0x0001760e not yet transcribed " +
      "(depends on +[NSThread callStackSymbols] via objc_msgSend and CFRetain/CFRelease " +
      "on a PCCFRef<CFArray>; no JS analogue is emitted to avoid a paraphrase)."
    );
  }
}

// -------- frontier / PCString helper stubs --------
//
// getInfo() @0xba26c calls four PCString methods that are NOT yet ported into
// raw-port/src/infra/PCString.ts. Per Rule 3 we surface them as throwing stubs
// that cite the exact @0xADDR they defer to, so `frontier.py` can see the gap.

/**
 * PCString::size() const  @ProCore 0x00032262  __ZNK8PCString4sizeEv
 * Returns the CFString length. FRONTIER — not transcribed yet.
 */
function pcstring_size_stub(_s: PCString): number {
  throw new Error(
    "PCString::size @ProCore 0x00032262 not yet transcribed (needed by " +
    "PCException::getInfo @0xba26c step 3)."
  );
}

/**
 * PCString::PCString(char const*)  @ProCore 0x00031af8  __ZN8PCStringC1EPKc
 * FRONTIER — not transcribed yet.
 */
function pcstring_from_cstr_stub(_cstr: string): PCString {
  throw new Error(
    "PCString::PCString(char const*) @ProCore 0x00031af8 not yet transcribed " +
    "(needed by PCException::getInfo @0xba26c steps 4 and 5)."
  );
}

/**
 * PCString::append(PCString const&)  @ProCore 0x00032704
 *   __ZN8PCString6appendERKS_
 * FRONTIER — not transcribed yet.
 */
function pcstring_append_ref_stub(_dst: PCString, _src: PCString): void {
  throw new Error(
    "PCString::append(PCString const&) @ProCore 0x00032704 not yet transcribed " +
    "(needed by PCException::getInfo @0xba26c steps 4 and 5)."
  );
}

/**
 * PCString::append(char const*)  @ProCore 0x00032850
 *   __ZN8PCString6appendEPKc
 * FRONTIER — not transcribed yet.
 */
function pcstring_append_cstr_stub(_dst: PCString, _cstr: string): void {
  throw new Error(
    "PCString::append(char const*) @ProCore 0x00032850 not yet transcribed " +
    "(needed by PCException::getInfo @0xba26c step 5)."
  );
}

/**
 * PCString::ssprintf(char const*, ...)  @ProCore 0x00032d88
 *   __ZN8PCString8ssprintfEPKcz
 * Variadic printf-style formatter that RETURNS a new PCString by value.
 * FRONTIER — not transcribed yet.
 */
function pcstring_ssprintf_stub(_fmt: string, ..._args: unknown[]): PCString {
  throw new Error(
    "PCString::ssprintf @ProCore 0x00032d88 not yet transcribed " +
    "(needed by PCException::getInfo @0xba26c step 5)."
  );
}
