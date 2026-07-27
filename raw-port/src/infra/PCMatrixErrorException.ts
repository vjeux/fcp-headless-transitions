// PCMatrixErrorException.ts — Ozone PCMatrixErrorException. A matrix-domain error
// exception, subclass of PCException (which is itself a std::exception subclass).
//
// DECODE: recovered from disassembly of PCMatrixErrorException methods in
// Ozone.framework (see raw-port/re/disasm/PCMatrixErrorException.*.s). Symbols
// were resolved via nm+c++filt (see /tmp/Ozone_symmap.tsv).
//
// Struct layout (recovered from the PCMatrixErrorException(PCString const&) ctor
// @0x88a90, and confirmed by the two dtors @0x88b20 (D1) and @0x88b80 (D0)):
//   +0x00  vtable*                     (set to __ZTV22PCMatrixErrorException+0x10 at end of
//                                       ctor; transiently set to __ZTV11PCException+0x10 first
//                                       because the base sub-object is constructed in place)
//   +0x08  cfArrayRef      __CFArray*  (init NULL; released via CFRelease in dtors if non-NULL)
//   +0x10  strA            PCString    (16 bytes; copy-constructed from ctor arg)
//   +0x18  strB            PCString    (16 bytes; default-constructed)
//   +0x20  flags           int32       (init 0)
//   +0x24  <pad>           4 bytes
//   +0x28  inlineOrHeap    u128        (init 0; low bit gates whether +0x38 owns a heap ptr —
//                                       small-string / small-buffer optimisation)
//   +0x38  heapPtr         void*       (init NULL; delete'd in dtors when (byte@+0x28 & 1) != 0)
//   size = 0x40
//
// The base class PCException (with vtable __ZTV11PCException) occupies the same
// storage; PCException itself derives from std::exception and its layout is what
// dictates the +0x00..+0x40 fields above. The D0 destructor ends with
// `jmp __ZdlPv` (operator delete) after running the D1 dtor logic, matching the
// standard Itanium-ABI "deleting destructor" pattern.
//
// FRONTIER: PCException, PCString, PCCFRef, and std::exception are undecoded.
// All calls into them are modelled as stubs that raise an error citing the
// exact `@0xADDR` (and stub symbol) of the FCP callee they defer.

// ---------------------------------------------------------------------------
// Undecoded-frontier stubs — every callee cites the stub address in Ozone.
// ---------------------------------------------------------------------------

/**
 * PCString copy constructor: `__ZN8PCStringC1ERKS_` (stub @0x6df0ba, called
 * from ctor @0x88aba). Not yet transcribed.
 */
function PCString_copy(_src: unknown): unknown {
  throw new Error(
    'PCString::PCString(PCString const&) @stub 0x6df0ba not yet transcribed',
  );
}

/**
 * PCString default constructor: `__ZN8PCStringC1Ev` (stub @0x6df0c0, called
 * from ctor @0x88ac3). Not yet transcribed.
 */
function PCString_default(): unknown {
  throw new Error(
    'PCString::PCString() @stub 0x6df0c0 not yet transcribed',
  );
}

/**
 * PCString destructor: `__ZN8PCStringD1Ev` (stub @0x6df0c6, called from
 * ctor cleanup @0x88afd and from both dtors @0x88b4a/@0x88b53/@0x88baa/@0x88bb3).
 * Not yet transcribed.
 */
function PCString_dtor(_s: unknown): void {
  throw new Error(
    'PCString::~PCString() @stub 0x6df0c6 not yet transcribed',
  );
}

/**
 * PCString ctor from CFStringRef: `__ZN8PCStringC1EPK10__CFString`
 * (stub @0x6df084, called from className() @0x88c00). Not yet transcribed.
 */
function PCString_fromCFString(_cf: unknown): unknown {
  throw new Error(
    'PCString::PCString(CFStringRef) @stub 0x6df084 not yet transcribed',
  );
}

/**
 * PCCFRef<__CFArray const*> destructor: `__ZN7PCCFRefIPK9__CFArrayED1Ev`
 * (direct call @0x88b0b in the ctor unwind path). Not yet transcribed.
 * NOTE: the D1/D0 destructors of PCMatrixErrorException do NOT go through
 * PCCFRef::~PCCFRef; they inline the release: `if (cfArrayRef) CFRelease(cfArrayRef)`.
 */
function PCCFRef_CFArray_dtor(_r: unknown): void {
  throw new Error(
    'PCCFRef<__CFArray const*>::~PCCFRef() @0x88b0b not yet transcribed',
  );
}

/**
 * std::exception base destructor: `__ZNSt9exceptionD2Ev` (stub @0x6dfc24,
 * called from ctor unwind @0x88b13 and from both dtors @0x88b6f/@0x88bc9).
 * Not yet transcribed.
 */
function std_exception_dtor(_e: unknown): void {
  throw new Error(
    'std::exception::~exception() @stub 0x6dfc24 not yet transcribed',
  );
}

/**
 * `operator delete(void*)`: `__ZdlPv` (stub @0x6dfc36, called in the two
 * places where the low bit of the byte at +0x28 indicates the +0x38 slot owns
 * a heap allocation, and as the tail-jmp of the D0 deleting destructor).
 * Not yet transcribed.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    'operator delete(void*) @stub 0x6dfc36 not yet transcribed',
  );
}

/**
 * `CFRelease`: (stub @0x6dc810, called in both dtors when +0x08 is non-NULL).
 * Not yet transcribed.
 */
function CFRelease_stub(_cf: unknown): void {
  throw new Error(
    'CFRelease @stub 0x6dc810 not yet transcribed',
  );
}

/**
 * `_Unwind_Resume`: (stub @0x6dd07a, tail-called in the ctor's landing-pad).
 * Not yet transcribed.
 */
function Unwind_Resume(_x: unknown): never {
  throw new Error(
    '_Unwind_Resume @stub 0x6dd07a not yet transcribed',
  );
}

/**
 * `___clang_call_terminate`: called in both dtors' cleanup landing pads
 * (@0x88b77, @0x88bdf). Not yet transcribed.
 */
function clang_call_terminate(_x: unknown): never {
  throw new Error(
    '__clang_call_terminate @0x88b77/0x88bdf not yet transcribed',
  );
}

// ---------------------------------------------------------------------------
// PCMatrixErrorException — Ozone matrix-domain exception.
// ---------------------------------------------------------------------------

export class PCMatrixErrorException {
  /** +0x08 — CFArrayRef, init NULL, CFRelease'd in dtor when non-NULL. */
  cfArrayRef: unknown = null;
  /** +0x10 — PCString, copy-constructed from ctor arg. */
  strA: unknown;
  /** +0x18 — PCString, default-constructed. */
  strB: unknown;
  /** +0x20 — int32, init 0. */
  flags: number = 0;
  /**
   * +0x28 — 16-byte inline slot; bit 0 of the byte at +0x28 is the
   * "heap-owned" flag for +0x38. Modelled as two u64 halves; init both to 0
   * (`xorps %xmm0,%xmm0; movups %xmm0, 0x28(%rbx)` @0x88acf/@0x88ad2).
   */
  inlineLo: bigint = 0n;
  inlineHi: bigint = 0n;
  /** +0x38 — void*, init NULL; `operator delete`'d in dtor when `inlineLo & 1n`. */
  heapPtr: unknown = null;

  /**
   * `PCMatrixErrorException::PCMatrixErrorException(PCString const&)` @0x88a90.
   *
   * Prologue installs the PCException base vtable (`__ZTV11PCException + 0x10`,
   * loaded via RIP-relative literal-pool ref @0x88a9d) into `*this` — required
   * because the std::exception base sub-object must be alive during the field
   * inits (so unwind can destroy it if a field ctor throws). At the very end
   * of the body (@0x88ade..@0x88ae9) `*this` is overwritten with
   * `__ZTV22PCMatrixErrorException + 0x10` to finalise the most-derived vtable.
   *
   * Field inits, in order:
   *   +0x08 = 0                                             (@0x88aab)
   *   PCString::PCString(*this+0x10, msg)  copy ctor        (@0x88aba stub 0x6df0ba)
   *   PCString::PCString(*this+0x18)       default ctor     (@0x88ac3 stub 0x6df0c0)
   *   +0x20 = 0 (int32)                                     (@0x88ac8)
   *   *(u128*)(*this+0x28) = 0  (xorps xmm0; movups)        (@0x88acf/@0x88ad2)
   *   +0x38 = 0                                             (@0x88ad6)
   *
   * Landing pad (@0x88af7..@0x88b1b): if the second PCString ctor throws, the
   * first PCString is destructed (@0x88afd), then the CFArrayRef holder at
   * +0x08 is torn down via PCCFRef<__CFArray const*>::~PCCFRef (@0x88b0b),
   * then std::exception's dtor runs (@0x88b13), then `_Unwind_Resume` (@0x88b1b).
   */
  constructor(msg: unknown) {
    // Base sub-object vtable install (PCException); overwritten at end of ctor.
    // (Modelled as a no-op field — TS has no explicit vtable slot.)

    // +0x08 = NULL
    this.cfArrayRef = null;

    // +0x10: copy-construct PCString from `msg` (arg).
    // FRONTIER: stub throws.
    this.strA = PCString_copy(msg);

    // +0x18: default-construct PCString.
    // FRONTIER: stub throws. (If the previous line has thrown, we would not
    // reach here — the ctor's landing pad handles that case.)
    this.strB = PCString_default();

    // +0x20 = 0 (int32) — already initialised at field-decl site.
    // +0x28 = 0 (u128) — already initialised at field-decl site.
    // +0x38 = 0 (void*) — already initialised at field-decl site.

    // NOTE: the vtable overwrite at @0x88ae9 (to PCMatrixErrorException's own
    // vtable + 0x10) is not modelled — TS dispatches by class identity, so the
    // effect is achieved simply by `this` being an instance of this class.

    // Suppress "unused frontier" lints in case the analyser strips the throws.
    void Unwind_Resume; void PCCFRef_CFArray_dtor; void std_exception_dtor;
    void PCString_dtor; void CFRelease_stub; void operator_delete;
    void clang_call_terminate;
  }

  /**
   * `PCMatrixErrorException::~PCMatrixErrorException()` @0x88b20 (D1 — the
   * complete-object destructor).
   *
   * Body (mirroring the disasm line-for-line):
   *   1. `*this = &__ZTV11PCException + 0x10` — reinstall base vtable before
   *      running the base sub-object teardown. (@0x88b29..@0x88b34)
   *   2. `if ((*(u8*)(this+0x28)) & 1) operator delete(*(void**)(this+0x38))`
   *      (@0x88b37..@0x88b41).
   *   3. `PCString::~PCString(this+0x18)` (@0x88b4a stub 0x6df0c6).
   *   4. `PCString::~PCString(this+0x10)` (@0x88b53 stub 0x6df0c6).
   *   5. `if (*(void**)(this+0x08)) CFRelease(*(void**)(this+0x08))`
   *      (@0x88b58..@0x88b61 stub 0x6dc810).
   *   6. `std::exception::~exception(this)` — tail-jmp (@0x88b6f stub 0x6dfc24).
   *
   * Cleanup landing pad @0x88b74..@0x88b77 calls `__clang_call_terminate` if
   * any of the above throws (double-throw during unwind is fatal).
   */
  dispose(): void {
    // (1) is not modelled (no explicit vtable slot in TS).

    // (2) — heap-owned flag check.
    if ((this.inlineLo & 1n) !== 0n) {
      operator_delete(this.heapPtr);
    }

    // (3) — destruct strB.
    PCString_dtor(this.strB);

    // (4) — destruct strA.
    PCString_dtor(this.strA);

    // (5) — CFRelease the CFArrayRef if non-NULL.
    if (this.cfArrayRef !== null) {
      CFRelease_stub(this.cfArrayRef);
    }

    // (6) — std::exception base dtor.
    std_exception_dtor(this);
  }

  /**
   * `PCMatrixErrorException::~PCMatrixErrorException()` @0x88b80 (D0 — the
   * deleting destructor). Identical body to D1 above, except the tail is
   *
   *     `std::exception::~exception(this); operator delete(this);`
   *
   * instead of D1's plain `std::exception::~exception(this)`. Specifically
   * @0x88bc9 calls `__ZNSt9exceptionD2Ev` and then @0x88bd7 tail-jmps to
   * `__ZdlPv` (`operator delete`).
   */
  dispose_and_delete(): void {
    // Same body as dispose():
    if ((this.inlineLo & 1n) !== 0n) {
      operator_delete(this.heapPtr);
    }
    PCString_dtor(this.strB);
    PCString_dtor(this.strA);
    if (this.cfArrayRef !== null) {
      CFRelease_stub(this.cfArrayRef);
    }
    std_exception_dtor(this);
    // Deleting-dtor tail:
    operator_delete(this);
  }

  /**
   * `PCMatrixErrorException::className() const` @0x88bf0.
   *
   * Disasm:
   *   pushq  %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq   %rdi, %rbx                              ; rbx = out-param (return-by-value PCString)
   *   leaq   0x805f70(%rip), %rsi                    ; rsi = CFStringRef constant
   *                                                    (otool label: "bad cfstring ref")
   *   callq  0x6df084                                ; PCString::PCString(CFStringRef)
   *   movq   %rbx, %rax                              ; return the out-param
   *   ret
   *
   * i.e. the source is `PCString PCMatrixErrorException::className() const { return PCString(<CFSTR>); }`
   * The CFStringRef @rip+0x805f70 is the class-name string literal. otool
   * labels the ref site with "bad cfstring ref", meaning the __cfstring entry
   * at that RVA does not resolve to a printable CFString in the static dump
   * we produced — the actual class-name string is not recoverable from this
   * disassembly alone. Per PORTING_SPEC Rule 3 we must NOT invent a value; we
   * mark the string as an undecoded constant and throw when called.
   */
  className(): unknown {
    // FRONTIER: the CFStringRef @rip+0x805f70 is not decoded. Do NOT invent
    // "PCMatrixErrorException" or any other guess — throw the citation.
    throw new Error(
      'PCMatrixErrorException::className() @0x88bf0 — CFStringRef constant at ' +
        'Ozone RIP+0x805f70 (otool: "bad cfstring ref") not yet decoded; ' +
        'PCString::PCString(CFStringRef) @stub 0x6df084 also undecoded.',
    );
    // Would be: return PCString_fromCFString(<CFSTR @rip+0x805f70>);
    void PCString_fromCFString;
  }
}
