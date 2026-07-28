// HGAntiAliasLUTInfo.ts — FCP Helium `HGAntiAliasLUTInfo`: the compact cache-key /
// descriptor object HGLUTCache uses to look up (and, on miss, materialize via
// HGAntiAliasLUTEntryFactory) an anti-alias LUT. This class is the "info" (key +
// key-comparison) sibling of the already-ported HGAntiAliasLUTEntryFactory.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (four member functions of the class):
//   @Helium 0x0000000000211a70  HGAntiAliasLUTInfo::~HGAntiAliasLUTInfo()   (D1, in-place)
//   @Helium 0x0000000000211a80  HGAntiAliasLUTInfo::~HGAntiAliasLUTInfo()   (D0, deleting)
//   @Helium 0x0000000000211a90  HGAntiAliasLUTInfo::duplicate() const
//   @Helium 0x0000000000211ac0  HGAntiAliasLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   Helium.HGAntiAliasLUTInfo.~HGAntiAliasLUTInfo.s  (D0 body @0x211a80..0x211a89)
//     — D1 body @0x211a70..0x211a75 was recovered directly via
//       `otool -tV -p __ZN18HGAntiAliasLUTInfoD1Ev …` (trivial frame + retq).
//   Helium.HGAntiAliasLUTInfo.duplicate.s              (@0x211a90..0x211ab9)
//   Helium.HGAntiAliasLUTInfo.isEqual.s                (@0x211ac0..0x211b05)
//
// ── STRUCT LAYOUT ───────────────────────────────────────────────────────────
//
//   sizeof = 0x10 (16 bytes). Proven by `movl $0x10, %edi` @0x211a99 (the
//   `operator new(size_t)` call inside `duplicate`, which allocates a fresh
//   HGAntiAliasLUTInfo of the same size as the receiver).
//
//     +0x00  const void* __vptr   ; vtable pointer for HGAntiAliasLUTInfo.
//                                   Installed by `duplicate` at @0x211aa6-0x211aad:
//                                     leaq 0x81d6c3(%rip), %rdx ; = 0xa2f170
//                                     movq %rdx, (%rax)
//                                   RIP target 0xa2f170 resolves via
//                                   `resolve.py Helium sym 0xa2f170` to
//                                   `vtable for HGAntiAliasLUTInfo (+0x10)`, i.e.
//                                   the Itanium-ABI virtual-fn slot base
//                                   (past the offset-to-top and RTTI slots).
//     +0x08  uint32_t   key       ; the ONLY payload field. Read/written in both
//                                   `duplicate` and `isEqual` as a plain 32-bit
//                                   value (movl / cmpl — no sign-extension is
//                                   ever performed on it, so it is unsigned
//                                   32-bit as far as this class can see).
//                                   `duplicate` @0x211aa3: `movl 0x8(%rbx),%ecx`
//                                                @0x211ab0: `movl %ecx,0x8(%rax)`
//                                   `isEqual`   @0x211af1: `movl 0x8(%r14),%ecx`
//                                                @0x211af5: `cmpl 0x8(%rax),%ecx`
//     +0x0C  4 bytes tail padding ; alignment slot up to sizeof=0x10. Never
//                                   touched by any exported method.
//
//   NO CONSTRUCTOR IS EXPORTED (no `__ZN18HGAntiAliasLUTInfoC1E…` / `C2E…` symbol
//   in Helium's export table for this class). Instances are therefore built
//   either (a) inline in a header at the (unseen) HGLUTCache callsite that
//   requests an anti-alias LUT, or (b) exclusively via `duplicate` from an
//   already-constructed template. Since `duplicate` installs the vptr and
//   copies +0x8 directly from an existing instance, this port treats the
//   `key: number` field as the ONLY external construction parameter and does
//   not invent a public ctor for it — it is set by the (out-of-scope) caller
//   that owns the first, non-duplicated HGAntiAliasLUTInfo.
//
// ── INHERITANCE / RTTI ──────────────────────────────────────────────────────
//
//   `isEqual` @0x211acf loads the literal-pool address
//     `movq 0x7f080a(%rip), %rax   ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE`
//   and passes it as the *destination type* to `__dynamic_cast` (arg2)
//   (@0x211ae7 `callq 0x3c5018  ## symbol stub for: ___dynamic_cast`) with
//   arg1 = the incoming `LUTInfo*` and arg3 = `__ZTI18HGAntiAliasLUTInfo`
//   (source type, from `leaq __ZTI18HGAntiAliasLUTInfo(%rip),%rdx` @0x211ad6).
//
//   Under Itanium ABI (see PORTING_SPEC "dynamic_cast"), `__dynamic_cast(src,
//   srcTypeInfo, dstTypeInfo, hint)` here — with `src = incoming pointer`,
//   `srcTypeInfo = HGLUTCache::LUTInfo` (the base) and `dstTypeInfo =
//   HGAntiAliasLUTInfo` (the derived) — is a DOWNCAST: "does `incoming`
//   actually point at a HGAntiAliasLUTInfo (or subclass thereof), viewed
//   through its HGLUTCache::LUTInfo base sub-object?". Returns the adjusted
//   HGAntiAliasLUTInfo* on success, else nullptr. This is the standard
//   idiom by which a HGLUTCache::LUTInfo-family isEqual establishes
//   type-identity before comparing derived fields.
//
//   THEREFORE HGAntiAliasLUTInfo publicly inherits from HGLUTCache::LUTInfo
//   (nested class). This is FURTHER confirmed by the argument type of
//   `isEqual` itself: `HGAntiAliasLUTInfo::isEqual(HGLUTCache::LUTInfo*) const`
//   — a virtual override on the base-class interface. The base sub-object
//   contributes no observed field storage in the derived class's own methods
//   (D1 @0x211a70 is completely empty — no base-dtor call — meaning the base
//   HGLUTCache::LUTInfo destructor is trivial / has been inlined away by the
//   compiler; either way it holds nothing this port needs to visit here).
//
// ── VTABLE HOOKUP ───────────────────────────────────────────────────────────
//   The vtable base address 0xa2f160 (== 0xa2f170 - 0x10) was NOT read
//   directly from any of these four methods, so its full slot inventory is
//   not enumerated here. `duplicate` and both destructors let us infer three
//   slots by their exported symbols and the sibling
//   `HGAntiAliasLUTEntryFactory` template:
//     +0x00 offset-to-top = 0
//     +0x08 typeinfo -> __ZTI18HGAntiAliasLUTInfo
//     +0x10 -> 0x211a70  ~HGAntiAliasLUTInfo (D1, in-place)
//     +0x18 -> 0x211a80  ~HGAntiAliasLUTInfo (D0, deleting)
//     +0x20 -> 0x211a90  duplicate() const
//     +0x28 -> 0x211ac0  isEqual(HGLUTCache::LUTInfo*) const
//   (Order beyond D1/D0 is inferred from the sibling factory's already-
//   decoded vtable layout; not required for the four bodies below and left
//   here purely as an ABI hint.)
//
// ── FRONTIER CALLEES ────────────────────────────────────────────────────────
//   @Helium 0x211a9e __Znwm       operator new(size_t)   (16-byte alloc in
//                                                          duplicate)
//   @Helium 0x211a85 __ZdlPv      operator delete(void*) (D0 tail-call)
//   @Helium 0x211ae7 ___dynamic_cast   libc++abi RTTI downcast (isEqual)
//   The base class `HGLUTCache::LUTInfo` is deliberately treated as opaque —
//   it will be ported in its own task-queue entry. Same for the sibling
//   already-ported `HGAntiAliasLUTEntryFactory` (see raw-port/src/render/
//   HGAntiAliasLUTEntryFactory.ts): we DO NOT re-import its factory here
//   because HGAntiAliasLUTInfo's four methods do not call it.
//
// ── PORTING NOTES (fp32-narrowed / bit-exact) ──────────────────────────────
// This class contains NO floating-point arithmetic. All observable state is
// a single unsigned 32-bit integer field and a virtual dispatch table. The
// port therefore has NO Math.fround / narrowing concerns; the only integer-
// width care is that `key` is unsigned 32-bit (`| 0` would be wrong — it is
// unsigned, so `>>> 0` on any incoming value keeps it in the same domain the
// C++ code sees via `movl`).
//
// This file transcribes: destructors D0/D1 (@0x211a70 / @0x211a80),
// duplicate (@0x211a90), isEqual (@0x211ac0).

/**
 * Opaque handle to Helium's `HGLUTCache::LUTInfo` (the abstract base class
 * of every HG… LUT descriptor used by HGLUTCache). It has its own future
 * task-queue entry — this file must not draw its layout in. The four members
 * below only observe pointer identity and, via `__dynamic_cast`, RTTI-based
 * downcastability.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  ; RTTI typeinfo (literal pool ref at
 *                                       @0x211acf inside isEqual)
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

/**
 * `__dynamic_cast` frontier stub — libc++abi RTTI helper.
 *   @Helium 0x211ae7  callq 0x3c5018  ## symbol stub for: ___dynamic_cast
 *
 * Itanium-ABI signature:
 *   void* __dynamic_cast(const void* src, const std::type_info* srcType,
 *                        const std::type_info* dstType, ptrdiff_t hint);
 * Returns adjusted derived-pointer on success, nullptr on failure.
 *
 * The port cannot faithfully re-implement RTTI without the whole class
 * hierarchy in-hand, so this is a THROWING stub — reaching it is the demand
 * signal that either (a) the caller has to provide a JS-level identity
 * check, or (b) the entire HG… LUTInfo hierarchy needs a shared RTTI-
 * emulation port. Never weaken this to `return src as HGAntiAliasLUTInfo`
 * (that would silently mis-compare two different LUTInfo subclasses).
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGAntiAliasLUTInfo | null {
  // Faithful decode-don't-fit stub. See raw-port/army/PORTING_SPEC.md rule 3.
  throw new Error(
    "___dynamic_cast @Helium 0x2114e7 is not yet ported — the HGLUTCache::LUTInfo " +
      "class hierarchy (and its RTTI emulation) has not been decoded yet. This " +
      "throw is the demand signal that a shared JS-side RTTI shim is required " +
      "before HGAntiAliasLUTInfo::isEqual can produce values on non-null args. " +
      "Do NOT weaken by returning src as-is: that would silently equate two " +
      "different LUTInfo subclasses whose +0x8 field happens to match.",
  );
}

/**
 * HGAntiAliasLUTInfo — HGLUTCache's cache key/descriptor for anti-alias LUTs.
 *
 * A tiny (16-byte) polymorphic value type that inherits from
 * `HGLUTCache::LUTInfo` and carries a single 32-bit `key` payload. HGLUTCache
 * uses these two virtual methods:
 *   - `duplicate()` — deep-copy the descriptor onto the heap (so the cache
 *                     can own its own key even after the caller's stack-
 *                     resident template goes away).
 *   - `isEqual(other)` — RTTI-checked equality: `other` must actually be a
 *                        HGAntiAliasLUTInfo (via `__dynamic_cast`) AND its
 *                        `key` field must match.
 */
export class HGAntiAliasLUTInfo {
  /**
   * The single payload field at C++ offset +0x08. Unsigned 32-bit; treated
   * as an opaque key by this class's methods (no bit-manipulation, no
   * arithmetic — just movl / cmpl).
   */
  public key: number;

  /**
   * Public constructor — NOT exported by Helium, but required to bring an
   * instance into existence in this port. The single argument matches the
   * only observable member (`+0x08 key`). The vtable slot (@+0x00 in C++)
   * is not materialized in JS; virtual dispatch is a language construct
   * here.
   *
   * @param key unsigned 32-bit anti-alias LUT key (normalized via `>>> 0`
   *            to match the `movl`-into-uint32 width the C++ code sees).
   */
  constructor(key: number) {
    this.key = key >>> 0;
  }

  /**
   * D1 — complete-object destructor (in-place).
   *   @Helium 0x0000000000211a70..0x0000000000211a75
   *
   * Disassembly (recovered via `otool -tV -p __ZN18HGAntiAliasLUTInfoD1Ev …`):
   *   0x211a70  pushq %rbp
   *   0x211a71  movq  %rsp, %rbp
   *   0x211a74  popq  %rbp
   *   0x211a75  retq
   *
   * Completely trivial — no base-dtor call, no field teardown, no `operator
   * delete` (the deleting form D0 handles that). This is exactly the shape
   * Itanium ABI emits for a class whose only data member is a plain-old-
   * data uint32 and whose base class has a trivial destructor. In JS/TS
   * this is a no-op; the GC handles storage.
   *
   * Kept as a named method purely for provenance / vtable slot symmetry.
   */
  D1_destructor(): void {
    // 0x211a70-0x211a75: frame prologue + retq, no observable effect.
  }

  /**
   * D0 — deleting destructor.
   *   @Helium 0x0000000000211a80..0x0000000000211a89
   *
   * Disassembly (from Helium.HGAntiAliasLUTInfo.~HGAntiAliasLUTInfo.s):
   *   0x211a80  pushq %rbp
   *   0x211a81  movq  %rsp, %rbp
   *   0x211a84  popq  %rbp
   *   0x211a85  jmp   0x3c4fa0                    ## symbol stub: __ZdlPv
   *   0x211a8a  nopw  (%rax,%rax)                 ## alignment pad
   *
   * The body is a bare tail-call to `operator delete(void*)`. There is no
   * D1 call before it (D1 is empty anyway — see above), so the entire
   * "run field/base destructors" phase is elided by the compiler and the
   * D0 form just frees the storage.
   *
   * In JS/TS this is a no-op; the GC handles storage. Kept for provenance.
   */
  D0_destructor(): void {
    // 0x211a85: tail-jmp to __ZdlPv (operator delete(void*)) — no JS analog.
  }

  /**
   * duplicate() — heap-copy this descriptor.
   *   @Helium 0x0000000000211a90..0x0000000000211ab9
   *
   * Direct transcription of the x86_64 body:
   *
   *   0x211a90  pushq %rbp
   *   0x211a91  movq  %rsp, %rbp
   *   0x211a94  pushq %rbx
   *   0x211a95  pushq %rax                        ; align stack + reserve
   *   0x211a96  movq  %rdi, %rbx                  ; rbx = this (source)
   *   0x211a99  movl  $0x10, %edi                 ; edi = sizeof(HGAntiAliasLUTInfo) = 16
   *   0x211a9e  callq __Znwm                      ; operator new(16)   -> rax
   *   0x211aa3  movl  0x8(%rbx), %ecx             ; ecx = this->key
   *   0x211aa6  leaq  0x81d6c3(%rip), %rdx        ; rdx = &vtable[+0x10] = 0xa2f170
   *   0x211aad  movq  %rdx, (%rax)                ; new->__vptr = vtable slot base
   *   0x211ab0  movl  %ecx, 0x8(%rax)             ; new->key = this->key
   *   0x211ab3  addq  $0x8, %rsp
   *   0x211ab7  popq  %rbx
   *   0x211ab8  popq  %rbp
   *   0x211ab9  retq                              ; rax = new HGAntiAliasLUTInfo*
   *
   * Notes:
   *   • Size 16 (`$0x10`) at 0x211a99 confirms sizeof == 16, matching the
   *     layout table at the top of this file.
   *   • `movl 0x8, %ecx / movl %ecx, 0x8` copies the SINGLE 32-bit payload;
   *     the tail padding at +0xC is left uninitialized in C++ (`operator
   *     new` returns raw storage; the compiler does not zero it). In JS
   *     the instance simply has one field.
   *   • `leaq 0x81d6c3(%rip),%rdx` resolves (next-instr 0x211aad + 0x81d6c3)
   *     = 0xa2f170 = `vtable for HGAntiAliasLUTInfo (+0x10)`. This installs
   *     the virtual-function base (past offset-to-top and RTTI slots) into
   *     the new object's vptr. In JS/TS the language handles virtual
   *     dispatch, so the return value is a `HGAntiAliasLUTInfo` instance
   *     whose class identity is set by `new HGAntiAliasLUTInfo(...)`.
   *
   * No exception path is emitted by the compiler here (operator new is the
   * only throwing call, and if it throws the compiler does not need any
   * cleanup because no other resource was acquired yet).
   */
  duplicate(): HGAntiAliasLUTInfo {
    // 0x211a9e: __Znwm(16) — 16-byte allocation. In JS the runtime provides
    //  the object; the 16 bytes is a fact about the C++ layout.
    // 0x211aa3-0x211ab0: install vptr (0xa2f170) and copy +0x8 uint32 key.
    //  In JS, `new HGAntiAliasLUTInfo(this.key)` fuses both steps: it sets
    //  class identity (analogue of the vptr write) and initializes the
    //  single payload field via the ctor above.
    return new HGAntiAliasLUTInfo(this.key);
  }

  /**
   * isEqual(other) — RTTI-checked descriptor equality.
   *   @Helium 0x0000000000211ac0..0x0000000000211b05
   *
   * Direct transcription of the x86_64 body:
   *
   *   0x211ac0  pushq %rbp
   *   0x211ac1  movq  %rsp, %rbp
   *   0x211ac4  pushq %r14
   *   0x211ac6  pushq %rbx
   *   0x211ac7  testq %rsi, %rsi                  ; other == nullptr?
   *   0x211aca  je    0x211afd                    ; -> return 0
   *   0x211acc  movq  %rdi, %r14                  ; r14 = this
   *   0x211acf  movq  0x7f080a(%rip), %rax        ; literal pool: &__ZTIN10HGLUTCache7LUTInfoE
   *                                                 (i.e. RTTI of the SRC type
   *                                                  HGLUTCache::LUTInfo — this
   *                                                  is the src-type-info arg
   *                                                  the ABI expects for a
   *                                                  downcast: cast starting
   *                                                  from the base sub-object)
   *   0x211ad6  leaq  __ZTI18HGAntiAliasLUTInfo(%rip), %rdx
   *                                                 ; rdx = dst-type-info
   *                                                 ; (RTTI of THIS derived class)
   *   0x211add  xorl  %ebx, %ebx                  ; ebx = 0 (default return)
   *   0x211adf  movq  %rsi, %rdi                  ; arg1 = src ptr (other)
   *   0x211ae2  movq  %rax, %rsi                  ; arg2 = src type-info
   *   0x211ae5  xorl  %ecx, %ecx                  ; arg4 = hint (0 = no hint)
   *   0x211ae7  callq 0x3c5018                    ## symbol stub: ___dynamic_cast
   *   0x211aec  testq %rax, %rax                  ; downcast succeeded?
   *   0x211aef  je    0x211aff                    ; nope -> ebx stays 0
   *   0x211af1  movl  0x8(%r14), %ecx             ; ecx = this->key
   *   0x211af5  cmpl  0x8(%rax), %ecx             ; cmp with cast->key
   *   0x211af8  sete  %bl                         ; bl = (this->key == cast->key)
   *   0x211afb  jmp   0x211aff
   *   0x211afd  xorl  %ebx, %ebx                  ; other == null: ebx = 0
   *   0x211aff  movl  %ebx, %eax                  ; return ebx (uint32 bool)
   *   0x211b01  popq  %rbx
   *   0x211b02  popq  %r14
   *   0x211b04  popq  %rbp
   *   0x211b05  retq
   *
   * Semantics (three-branch decision tree, mirrored verbatim below):
   *   1. `other == nullptr`  -> return false.
   *   2. `dynamic_cast<HGAntiAliasLUTInfo*>(other)` == nullptr -> return
   *      false. This catches HGLUTCache::LUTInfo pointers that actually
   *      point at some OTHER descriptor subclass (e.g. HGDitherLUTInfo,
   *      HGColorGammaLUTInfo…). Two different LUT descriptors with the
   *      same 32-bit +0x8 field must NOT compare equal — that would
   *      corrupt HGLUTCache lookups by returning the wrong LUT.
   *   3. Otherwise compare the two `key` fields as 32-bit values and
   *      return the boolean equality result.
   *
   * Because branch 2 depends on `__dynamic_cast` and this port has no
   * ported RTTI helper yet, that branch throws (see `dynamicCast_stub`
   * above). Branches 1 and 3 are fully faithful: branch 1 short-circuits
   * before any RTTI lookup, and branch 3 is a plain uint32 compare on the
   * ALREADY-cast target. To reach branch 3 the caller currently must pass
   * an actual `HGAntiAliasLUTInfo` instance (in which case the JS runtime
   * makes the "downcast succeeded" branch trivial — see below).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x211ac7-0x211aca: `testq %rsi,%rsi; je 0x211afd` — null-guard, returns 0.
    if (other === null) {
      // 0x211afd: xorl %ebx,%ebx (return 0)
      return false;
    }

    // 0x211acf-0x211ae7: __dynamic_cast(src=other, srcType=HGLUTCache::LUTInfo,
    //                                    dstType=HGAntiAliasLUTInfo, hint=0).
    // Returns adjusted derived pointer, or nullptr if `other` is not actually a
    // HGAntiAliasLUTInfo. In JS/TS we model the "is this an instance of the
    // derived class?" question via `instanceof`: that produces the same
    // downcast-succeeded/failed decision the C++ code branches on at 0x211aef.
    // The stub below is only reached if some future call passes an opaque
    // (non-JS-class) LUTInfo that instanceof cannot classify — at that point a
    // proper RTTI-emulation port is required. See dynamicCast_stub above.
    let cast: HGAntiAliasLUTInfo | null;
    if (other instanceof HGAntiAliasLUTInfo) {
      // Downcast succeeded — `other` IS a HGAntiAliasLUTInfo. The C++ code
      // adjusts the pointer via the ABI helper; in JS the object identity
      // is unchanged, so `cast = other` matches semantics exactly.
      cast = other;
    } else {
      // The incoming LUTInfo is an opaque brand (no runtime class identity in
      // JS). Faithful behaviour requires an RTTI check we do not have yet.
      cast = dynamicCast_stub(
        other,
        "N10HGLUTCache7LUTInfoE",
        "18HGAntiAliasLUTInfo",
      );
    }

    // 0x211aec-0x211aef: `testq %rax,%rax; je 0x211aff` — cast failed -> 0.
    if (cast === null) {
      return false;
    }

    // 0x211af1-0x211af8: `movl 0x8(this),%ecx ; cmpl 0x8(cast),%ecx ; sete %bl`
    //   → uint32 equality of the +0x8 key field on both instances. The C++
    //   code compares as 32-bit `movl`/`cmpl`; in JS the ctor already
    //   normalized both sides via `>>> 0` so plain `===` gives the same
    //   answer bit-for-bit.
    return (this.key >>> 0) === (cast.key >>> 0);
  }
}
