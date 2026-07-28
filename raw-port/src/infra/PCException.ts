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
   *
   * The D1 body is a THREE-INSTRUCTION thunk:
   *   pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp __ZN11PCExceptionD2Ev
   * i.e. byte-for-byte "prologue + tail-jump to D2". No fields are touched here.
   */
  destroy_D1(): void {
    this.destroy_D2();
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
}
