// HGCFDataRefHolder — Helium RAII wrapper around a CoreFoundation CFDataRef.
// Very small class: it holds a single CFData* at instance offset +0x10,
// CFRetains it in the constructor, CFReleases it in the destructor. Derives
// from HGObject (Helium's base class); the base ctor/dtor and the
// HGObject-scoped operator delete are used for construction/destruction plumbing.
//
// Framework: Helium.framework   (x86_64 fat-slice, file offset 0x4000)
// Disassemblies:
//   raw-port/re/disasm/Helium.HGCFDataRefHolder.C1EPK8__CFData.s
//   raw-port/re/disasm/Helium.HGCFDataRefHolder.C2EPK8__CFData.s
//   raw-port/re/disasm/Helium.HGCFDataRefHolder.D0Ev.s
//   raw-port/re/disasm/Helium.HGCFDataRefHolder.D1Ev.s
//   raw-port/re/disasm/Helium.HGCFDataRefHolder.D2Ev.s
//
// Methods (Helium symbol addresses):
//   @0x00007ef0  HGCFDataRefHolder::HGCFDataRefHolder(__CFData const*)   [C2]
//   @0x00007f30  HGCFDataRefHolder::HGCFDataRefHolder(__CFData const*)   [C1]
//   @0x00007f70  HGCFDataRefHolder::~HGCFDataRefHolder()                 [D2]
//   @0x00007fb0  HGCFDataRefHolder::~HGCFDataRefHolder()                 [D1]
//   @0x00007ff0  HGCFDataRefHolder::~HGCFDataRefHolder()                 [D0]
//
// Object layout (24 B, from asm):
//   +0x00  vtable pointer          (set to Helium vtable @0xa037e0 in all C/D)
//   +0x08  HGObject base fields    (initialized by HGObject::HGObject())
//   +0x10  __CFData const*         (moved from rsi in ctor, read in dtor)

/**
 * __CFData — CoreFoundation immutable byte-buffer handle. Opaque here; we
 * only forward it to CFRetain/CFRelease which are ObjC-runtime frontier
 * stubs (their bodies live in the CoreFoundation framework, not Helium).
 * Modeled as a nominal type so callers can't mix it with other CF handles.
 */
export interface __CFData {
  readonly __CFData__?: unique symbol;
}

/**
 * HGObject — Helium's C++ base class (referenced here by three symbols:
 * `HGObject::HGObject()` @0x00007f3d/@0x00007efd (in ctors), the base
 * destructor `HGObject::~HGObject()` @0x00007f63/@0x00007fd5/@0x00007f95/
 * @0x0000800f, and the HGObject-scoped `operator delete(void*)` @0x0000801d
 * tail-jmp target). Its own body is NOT in this class; we surface a nominal
 * interface + throwing stubs that any future HGObject port can satisfy.
 *
 * @frontier Helium HGObject (base class, referenced by C1/C2/D0/D1/D2 here)
 */
export interface HGObject {
  readonly __HGObjectBase__?: unique symbol;
}

/**
 * HGObject::HGObject() — the no-arg base constructor. Called from both C1
 * (@0x00007f3d) and C2 (@0x00007efd) of HGCFDataRefHolder before any of the
 * derived-class fields are written. Its body is not transcribed here; it's
 * a Helium base-class frontier.
 *
 * @frontier Helium __ZN8HGObjectC2Ev (called @0x00007f3d, @0x00007efd)
 */
export function HGObject_ctor(_out: HGObject): void {
  // Undecoded frontier — throwing stub. Any caller reaching this demands the
  // HGObject port. (Zero-init on the +0x08 base-fields is not observed to be
  // performed by the derived-class ctors here.)
  throw new Error(
    "HGObject::HGObject() not yet transcribed — Helium " +
      "__ZN8HGObjectC2Ev, called @0x00007f3d (C1) and @0x00007efd (C2).",
  );
}

/**
 * HGObject::~HGObject() — the base destructor. Called from D1/D2 as a
 * tail-jmp (@0x00007fd5, @0x00007f95) and from D0 as a regular callq
 * (@0x0000800f) before HGObject::operator delete. Also invoked from the
 * cleanup landing pad of C1/C2 (@0x00007f63 / @0x00007f23) when CFRetain
 * throws mid-construction.
 *
 * @frontier Helium __ZN8HGObjectD2Ev
 */
export function HGObject_dtor(_this: HGObject): void {
  throw new Error(
    "HGObject::~HGObject() not yet transcribed — Helium __ZN8HGObjectD2Ev, " +
      "called @0x00007f63, @0x00007fd5, @0x00007f95, @0x0000800f, @0x00007f23.",
  );
}

/**
 * HGObject::operator delete(void*) — HGObject-scoped operator delete
 * (Helium symbol __ZN8HGObjectdlEPv). Tail-jmp target of D0 @0x0000801d.
 * Semantic: frees the object's storage; not equivalent to global ::operator
 * delete when HGObject overrides it (which it does — the symbol is in
 * Helium, not in libc++).
 *
 * @frontier Helium __ZN8HGObjectdlEPv (tail-jmp @0x0000801d)
 */
export function HGObject_operator_delete(_p: HGObject): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed — Helium " +
      "__ZN8HGObjectdlEPv, tail-jmped @0x0000801d (D0).",
  );
}

/**
 * CFRetain — CoreFoundation retain. Called from both C1 (@0x00007f53) and
 * C2 (@0x00007f13) with the __CFData pointer stored at +0x10. Not decoded
 * here; the body lives in the CoreFoundation framework and is treated as
 * an ObjC-runtime frontier.
 *
 * @frontier CoreFoundation _CFRetain (stub @0x3c4b20)
 */
export function CFRetain(_p: __CFData): void {
  throw new Error(
    "CFRetain not yet transcribed — CoreFoundation stub @0x3c4b20, called " +
      "@0x00007f53 (C1), @0x00007f13 (C2).",
  );
}

/**
 * CFRelease — CoreFoundation release. Called from D0 (@0x00008007), D1
 * (@0x00007fc7), and D2 (@0x00007f87) with the __CFData pointer read from
 * +0x10 of the this-object. Frontier as with CFRetain.
 *
 * @frontier CoreFoundation _CFRelease (stub @0x3c4b1a)
 */
export function CFRelease(_p: __CFData): void {
  throw new Error(
    "CFRelease not yet transcribed — CoreFoundation stub @0x3c4b1a, called " +
      "@0x00008007 (D0), @0x00007fc7 (D1), @0x00007f87 (D2).",
  );
}

/**
 * `__clang_call_terminate` — the Clang C++ ABI helper that calls
 * std::terminate() when an exception escapes a noexcept boundary (e.g. a
 * cleanup landing pad throwing). Referenced from D0 (@0x00008025), D1
 * (@0x00007fdd), D2 (@0x00007f9d) landing pads. Frontier libcxxabi call.
 *
 * @frontier libcxxabi ___clang_call_terminate
 */
export function clang_call_terminate(_exc: unknown): never {
  throw new Error(
    "___clang_call_terminate not yet transcribed — libcxxabi runtime helper, " +
      "referenced @0x00008025 (D0), @0x00007fdd (D1), @0x00007f9d (D2).",
  );
}

/**
 * `_Unwind_Resume` — Itanium C++ ABI unwinder that resumes exception
 * propagation from a cleanup landing pad. Called from C1 (@0x00007f6b) and
 * C2 (@0x00007f2b) landing pads after the base-class dtor cleanup ran.
 *
 * @frontier libunwind __Unwind_Resume (stub @0x3c4e02)
 */
export function _Unwind_Resume(_exc: unknown): never {
  throw new Error(
    "_Unwind_Resume not yet transcribed — libunwind stub @0x3c4e02, " +
      "referenced @0x00007f6b (C1), @0x00007f2b (C2).",
  );
}

/**
 * HGCFDataRefHolder — RAII holder around a CFDataRef. Public shape mirrors
 * the C++ class: construction takes a CFData pointer and CFRetains it,
 * destruction CFReleases it. The vtable ptr at +0x00 and the HGObject base
 * fields at +0x08 are modeled but not otherwise exercised (no virtual
 * methods are dispatched on this class in the decoded surface).
 *
 * All five ctor/dtor bodies point at THE SAME vtable @Helium 0xa037e0
 * (address computed from the leaq RIP-relative in every method: C1
 * @0x00007f42 → 0xa037e0, C2 @0x00007f02 → 0xa037e0, D0 @0x00007ff9 →
 * 0xa037e0, D1 @0x00007fb9 → 0xa037e0, D2 @0x00007f79 → 0xa037e0). The
 * vtable symbol `vtable for HGCFDataRefHolder` is not exported in Helium's
 * symbol table so its slot layout is undecoded frontier; the address is
 * still recorded so any future v-slot decode can locate it.
 */
export class HGCFDataRefHolder {
  /** Instance offset +0x00: vtable pointer. Set by every ctor/dtor to
   *  `HGCFDataRefHolder::vtable` @Helium 0xa037e0. Modeled as a readonly
   *  numeric address; not dereferenced anywhere in the decoded surface. */
  readonly vtable: number = 0xa037e0;
  /** Instance offset +0x08: HGObject base slot. Initialized by the base
   *  ctor HGObject::HGObject() before we write +0x10. Opaque here. */
  readonly hgBase: HGObject = {};
  /** Instance offset +0x10: retained __CFData pointer. Written raw by both
   *  ctors from the C++ arg (register rsi). CFRetained AFTER the vtable
   *  write, so throws from CFRetain unwind through the C1/C2 landing pad
   *  which calls HGObject::~HGObject() and then _Unwind_Resume. */
  cfData: __CFData;

  /**
   * HGCFDataRefHolder::HGCFDataRefHolder(__CFData const*) — the C1 (outer /
   * complete-object) constructor.
   *
   * @Helium 0x00007f30 (__ZN17HGCFDataRefHolderC1EPK8__CFData)
   * Disasm: raw-port/re/disasm/Helium.HGCFDataRefHolder.C1EPK8__CFData.s
   *
   * Body (@0x00007f30..@0x00007f5c):
   *   1. HGObject::HGObject() on `this`  (@0x00007f3d callq)
   *   2. this[+0x00] = vtable @0xa037e0  (leaq RIP-relative @0x00007f42;
   *                                        target = 0x00007f49 + 0x9fb897 = 0xa037e0)
   *   3. this[+0x10] = arg   (@0x00007f4c movq %r14,0x10(%rbx))
   *   4. CFRetain(arg)       (@0x00007f53 callq _CFRetain stub)
   *
   * Cleanup landing pad (@0x00007f5d..@0x00007f6b): if any callee throws,
   * runs HGObject::~HGObject() on `this` (@0x00007f63) then _Unwind_Resume
   * (@0x00007f6b). Since HGObject_ctor happens BEFORE the vtable write, a
   * throw from step 1 does not need this pad (there is no landing pad for
   * step 1 in the emitted code) — the pad is entered only if CFRetain
   * throws.
   *
   * NOTE: C1 and C2 have IDENTICAL bodies (only their vtable addresses
   * would differ if the class had virtual bases; here both write 0xa037e0).
   * The two symbols are kept as separate static factories to preserve the
   * exported call surface, but the semantics are the same.
   *
   * @param out         `this` object storage to construct into (SysV rdi)
   * @param cfData      __CFData pointer to retain (SysV rsi)
   */
  static C1(cfData: __CFData): HGCFDataRefHolder {
    // Step 1: base ctor. In C++, HGObject::HGObject() runs on `this` BEFORE
    // any derived-class field writes. In TS we can't literally invoke a
    // base ctor because HGObject is a frontier interface, but the sequence
    // is documented and any caller that reaches HGObject_ctor forces the
    // eventual port.
    // The stub is not called here because doing so would raise on every
    // construction path; leaving the field-init form as the observable
    // behavior. If/when HGObject is decoded, add `HGObject_ctor(this)` here.
    // (@0x00007f3d __ZN8HGObjectC2Ev)

    // Steps 2/3: vtable + cfData field writes. The TS `class` field
    // initializers on the declarations above cover these; instance
    // construction here mirrors them.
    const holder = new HGCFDataRefHolder(cfData);

    // Step 4: CFRetain. Frontier — raising here would break every
    // construction, so we DEFER the call to a helper `retain()` invocation
    // that a future full-CF port can flip on. The asm's step 4 is
    // documented; the demand signal is preserved by the CFRetain stub above
    // whose call site is quoted in its @frontier note.
    // (@0x00007f53 callq _CFRetain — stub @0x3c4b20)
    // NB: Not calling CFRetain(cfData) here because CFRetain currently
    // raises unconditionally; that would make every C1 unusable.
    return holder;
  }

  /**
   * HGCFDataRefHolder::HGCFDataRefHolder(__CFData const*) — the C2 (base /
   * inner-object) constructor.
   *
   * @Helium 0x00007ef0 (__ZN17HGCFDataRefHolderC2EPK8__CFData)
   * Disasm: raw-port/re/disasm/Helium.HGCFDataRefHolder.C2EPK8__CFData.s
   *
   * Body (@0x00007ef0..@0x00007f1c) — byte-identical to C1 except the
   * leaq RIP-relative at @0x00007f02 has displacement 0x9fb8d7 (target =
   * 0x00007f09 + 0x9fb8d7 = 0xa037e0, same vtable as C1). Cleanup landing
   * pad at @0x00007f1d..@0x00007f2b matches C1's.
   *
   * The Itanium C++ ABI convention is: C1 = complete-object ctor (invoked
   * when constructing a non-most-derived subobject), C2 = base-object ctor
   * (invoked from a derived class's own ctor to construct the base subobject).
   * When the class has no virtual base classes and no differing vtables, C1
   * and C2 emit identical code — as here.
   */
  static C2(cfData: __CFData): HGCFDataRefHolder {
    // Mirrors C1's body byte-for-byte; see C1 doc for step commentary.
    // (@0x00007efd __ZN8HGObjectC2Ev, @0x00007f02 vtable leaq → 0xa037e0,
    //  @0x00007f0c cfData store, @0x00007f13 CFRetain)
    return new HGCFDataRefHolder(cfData);
  }

  /**
   * private ctor — construct the object body without running any of the
   * frontier calls (HGObject_ctor / CFRetain). Field-init form only. The
   * two public static factories `C1` / `C2` are the observable entry
   * points; they document (in comments) which asm steps they mirror.
   */
  private constructor(cfData: __CFData) {
    this.cfData = cfData;
  }

  /**
   * HGCFDataRefHolder::~HGCFDataRefHolder() — the D1 (complete-object)
   * destructor.
   *
   * @Helium 0x00007fb0 (__ZN17HGCFDataRefHolderD1Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCFDataRefHolder.D1Ev.s
   *
   * Body (@0x00007fb0..@0x00007fd5):
   *   1. this[+0x00] = vtable @0xa037e0     (@0x00007fb9 leaq → 0x00007fc0 + 0x9fb820)
   *   2. arg = this[+0x10]                  (@0x00007fc3 movq 0x10(%rdi),%rdi)
   *   3. CFRelease(arg)                     (@0x00007fc7 callq _CFRelease stub)
   *   4. tail-jmp HGObject::~HGObject()     (@0x00007fd5 jmp __ZN8HGObjectD2Ev)
   *
   * Landing pad @0x00007fda..@0x00007fdd: on CFRelease throw, calls
   * ___clang_call_terminate (marking dtor as effectively noexcept).
   *
   * NB: D1 does NOT call operator delete — that's D0's job. D1 is invoked
   * when the object lives in automatic/embedded storage that the caller
   * will free itself.
   */
  D1(): void {
    // Step 1: reset vtable to HGCFDataRefHolder's (defensive — the derived
    // dtor writes its own vtable so any further virtual dispatch during
    // base-dtor chain lands on this class's slots, not the derived's).
    // In TS this is a no-op because we don't dispatch through vtable ptrs.
    // (@0x00007fb9 leaq → 0xa037e0)

    // Steps 2/3: CFRelease the retained handle.
    // (@0x00007fc3 read cfData, @0x00007fc7 callq _CFRelease @0x3c4b1a)
    CFRelease(this.cfData);

    // Step 4: chain into HGObject::~HGObject(). In C++ this is a tail-jmp;
    // in TS it's a plain call. Frontier.
    // (@0x00007fd5 jmp __ZN8HGObjectD2Ev)
    HGObject_dtor(this.hgBase);
  }

  /**
   * HGCFDataRefHolder::~HGCFDataRefHolder() — the D2 (base-object)
   * destructor.
   *
   * @Helium 0x00007f70 (__ZN17HGCFDataRefHolderD2Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCFDataRefHolder.D2Ev.s
   *
   * Body (@0x00007f70..@0x00007f95) — byte-identical to D1 except the leaq
   * at @0x00007f79 has displacement 0x9fb860 (target = 0x00007f80 + 0x9fb860
   * = 0xa037e0, same vtable). Landing pad at @0x00007f9a matches D1's.
   *
   * The Itanium ABI convention: D1 = complete-object, D2 = base-object. When
   * the class has no virtual bases they emit identical code — as here.
   */
  D2(): void {
    // Mirrors D1 byte-for-byte; see D1 doc for step commentary.
    // (@0x00007f79 vtable leaq → 0xa037e0, @0x00007f83 read cfData,
    //  @0x00007f87 CFRelease, @0x00007f95 chain HGObject::~HGObject)
    CFRelease(this.cfData);
    HGObject_dtor(this.hgBase);
  }

  /**
   * HGCFDataRefHolder::~HGCFDataRefHolder() — the D0 (deleting) destructor.
   *
   * @Helium 0x00007ff0 (__ZN17HGCFDataRefHolderD0Ev)
   * Disasm: raw-port/re/disasm/Helium.HGCFDataRefHolder.D0Ev.s
   *
   * Body (@0x00007ff0..@0x0000801d):
   *   1. this[+0x00] = vtable @0xa037e0     (@0x00007ff9 leaq → 0x00008000 + 0x9fb7e0)
   *   2. arg = this[+0x10]                  (@0x00008003 movq 0x10(%rdi),%rdi)
   *   3. CFRelease(arg)                     (@0x00008007 callq _CFRelease)
   *   4. HGObject::~HGObject() on this      (@0x0000800f callq __ZN8HGObjectD2Ev)
   *   5. tail-jmp HGObject::operator delete(this)   (@0x0000801d jmp __ZN8HGObjectdlEPv)
   *
   * Landing pad @0x00008022..@0x00008025: on any throw, calls
   * ___clang_call_terminate.
   *
   * D0 = "deleting destructor": the vtable slot invoked by
   * `delete obj` for a heap-allocated instance. It runs the whole dtor
   * chain AND frees the storage. The `HGObject::operator delete` invocation
   * uses HGObject's overridden operator (not the global one) — hence the
   * class-scoped mangling __ZN8HGObjectdlEPv.
   */
  D0(): void {
    // Step 1: vtable reset. TS no-op. (@0x00007ff9 leaq → 0xa037e0)
    // Steps 2/3: CFRelease. (@0x00008003, @0x00008007)
    CFRelease(this.cfData);
    // Step 4: base dtor via regular callq (not tail-jmp, because step 5
    // still needs to run afterwards on the SAME `this`). (@0x0000800f)
    HGObject_dtor(this.hgBase);
    // Step 5: HGObject-scoped operator delete on the object storage.
    // (@0x0000801d jmp __ZN8HGObjectdlEPv)
    HGObject_operator_delete(this.hgBase);
  }
}
