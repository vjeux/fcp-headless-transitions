// HGDitherLUTInfo.ts — FCP Helium `HGDitherLUTInfo`: the compact cache-key /
// descriptor object HGLUTCache uses to look up (and, on miss, materialize via
// HGDitherLUTEntryFactory) a dither LUT. This class is the "info" (key +
// key-comparison) sibling of the already-ported HGDitherLUTEntryFactory
// (see raw-port/src/render/HGDitherLUTEntryFactory.ts). Structurally identical
// (bit-for-bit same asm shape, different addresses/class-name/vtable pointer)
// to HGAntiAliasLUTInfo — see raw-port/src/render/HGAntiAliasLUTInfo.ts for
// the sister transcription; both classes are minimum-viable descriptor
// subclasses of HGLUTCache::LUTInfo carrying a single uint32 payload.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (four member functions of the class):
//   @Helium 0x000000000006fed0  HGDitherLUTInfo::~HGDitherLUTInfo()   (D1, in-place)
//   @Helium 0x000000000006fee0  HGDitherLUTInfo::~HGDitherLUTInfo()   (D0, deleting)
//   @Helium 0x000000000006fef0  HGDitherLUTInfo::duplicate() const
//   @Helium 0x000000000006ff20  HGDitherLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   Helium.HGDitherLUTInfo.~HGDitherLUTInfo.s  (D0 body @0x6fee0..0x6fee9)
//     — D1 body @0x6fed0..0x6fed5 was recovered directly via
//       `otool -tV -p __ZN15HGDitherLUTInfoD1Ev …` (trivial frame + retq).
//   Helium.HGDitherLUTInfo.duplicate.s          (@0x6fef0..0x6ff19)
//   Helium.HGDitherLUTInfo.isEqual.s            (@0x6ff20..0x6ff65)
//
// ── STRUCT LAYOUT ───────────────────────────────────────────────────────────
//
//   sizeof = 0x10 (16 bytes). Proven by `movl $0x10, %edi` @0x6fef9 (the
//   `operator new(size_t)` call inside `duplicate`, which allocates a fresh
//   HGDitherLUTInfo of the same size as the receiver).
//
//     +0x00  const void* __vptr   ; vtable pointer for HGDitherLUTInfo.
//                                   Installed by `duplicate` at @0x6ff06-0x6ff0d:
//                                     leaq 0x998cc3(%rip), %rdx ; = 0xa08bd0
//                                     movq %rdx, (%rax)
//                                   RIP target 0xa08bd0 resolves via
//                                   `resolve.py Helium sym 0xa08bd0` to
//                                   `vtable for HGDitherLUTInfo (+0x10)`, i.e.
//                                   the Itanium-ABI virtual-fn slot base
//                                   (past the offset-to-top and RTTI slots).
//     +0x08  uint32_t   key       ; the ONLY payload field. Read/written in both
//                                   `duplicate` and `isEqual` as a plain 32-bit
//                                   value (movl / cmpl — no sign-extension is
//                                   ever performed on it, so it is unsigned
//                                   32-bit as far as this class can see).
//                                   `duplicate` @0x6ff03: `movl 0x8(%rbx),%ecx`
//                                                @0x6ff10: `movl %ecx,0x8(%rax)`
//                                   `isEqual`   @0x6ff51: `movl 0x8(%r14),%ecx`
//                                                @0x6ff55: `cmpl 0x8(%rax),%ecx`
//     +0x0C  4 bytes tail padding ; alignment slot up to sizeof=0x10. Never
//                                   touched by any exported method.
//
//   NO CONSTRUCTOR IS EXPORTED (no `__ZN15HGDitherLUTInfoC1E…` / `C2E…` symbol
//   in Helium's export table for this class). Instances are therefore built
//   either (a) inline in a header at the (unseen) HGLUTCache callsite that
//   requests a dither LUT, or (b) exclusively via `duplicate` from an
//   already-constructed template. Since `duplicate` installs the vptr and
//   copies +0x8 directly from an existing instance, this port treats the
//   `key: number` field as the ONLY external construction parameter and does
//   not invent a public ctor for it — it is set by the (out-of-scope) caller
//   that owns the first, non-duplicated HGDitherLUTInfo.
//
// ── INHERITANCE / RTTI ──────────────────────────────────────────────────────
//
//   `isEqual` @0x6ff2f loads the literal-pool address
//     `movq 0x9923aa(%rip), %rax   ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE`
//   (target = 0xa022e0 = literal pool entry containing &__ZTIN10HGLUTCache
//   7LUTInfoE) and passes it as the *destination type* to `__dynamic_cast`
//   (arg2) (@0x6ff47 `callq 0x3c5018  ## symbol stub for: ___dynamic_cast`)
//   with arg1 = the incoming `LUTInfo*` and arg3 = `__ZTI15HGDitherLUTInfo`
//   (source type, from `leaq __ZTI15HGDitherLUTInfo(%rip),%rdx` @0x6ff36).
//
//   Under Itanium ABI (see PORTING_SPEC "dynamic_cast"), `__dynamic_cast(src,
//   srcTypeInfo, dstTypeInfo, hint)` here — with `src = incoming pointer`,
//   `srcTypeInfo = HGLUTCache::LUTInfo` (the base) and `dstTypeInfo =
//   HGDitherLUTInfo` (the derived) — is a DOWNCAST: "does `incoming`
//   actually point at a HGDitherLUTInfo (or subclass thereof), viewed
//   through its HGLUTCache::LUTInfo base sub-object?". Returns the adjusted
//   HGDitherLUTInfo* on success, else nullptr. This is the standard
//   idiom by which a HGLUTCache::LUTInfo-family isEqual establishes
//   type-identity before comparing derived fields.
//
//   THEREFORE HGDitherLUTInfo publicly inherits from HGLUTCache::LUTInfo
//   (nested class). This is FURTHER confirmed by the argument type of
//   `isEqual` itself: `HGDitherLUTInfo::isEqual(HGLUTCache::LUTInfo*) const`
//   — a virtual override on the base-class interface. The base sub-object
//   contributes no observed field storage in the derived class's own methods
//   (D1 @0x6fed0 is completely empty — no base-dtor call — meaning the base
//   HGLUTCache::LUTInfo destructor is trivial / has been inlined away by the
//   compiler; either way it holds nothing this port needs to visit here).
//
// ── VTABLE HOOKUP ───────────────────────────────────────────────────────────
//   The vtable base address 0xa08bc0 (== 0xa08bd0 - 0x10) was NOT read
//   directly from any of these four methods, so its full slot inventory is
//   not enumerated here. `duplicate` and both destructors let us infer three
//   slots by their exported symbols and the sibling
//   `HGDitherLUTEntryFactory` template:
//     +0x00 offset-to-top = 0
//     +0x08 typeinfo -> __ZTI15HGDitherLUTInfo
//     +0x10 -> 0x6fed0  ~HGDitherLUTInfo (D1, in-place)
//     +0x18 -> 0x6fee0  ~HGDitherLUTInfo (D0, deleting)
//     +0x20 -> 0x6fef0  duplicate() const
//     +0x28 -> 0x6ff20  isEqual(HGLUTCache::LUTInfo*) const
//   (Order beyond D1/D0 is inferred from the sibling factory's already-
//   decoded vtable layout; not required for the four bodies below and left
//   here purely as an ABI hint.)
//
// ── FRONTIER CALLEES ────────────────────────────────────────────────────────
//   @Helium 0x6fefe  __Znwm       operator new(size_t)   (16-byte alloc in
//                                                          duplicate)
//   @Helium 0x6fee5  __ZdlPv      operator delete(void*) (D0 tail-call)
//   @Helium 0x6ff47  ___dynamic_cast   libc++abi RTTI downcast (isEqual)
//   The base class `HGLUTCache::LUTInfo` is deliberately treated as opaque —
//   it will be ported in its own task-queue entry. Same for the sibling
//   already-ported `HGDitherLUTEntryFactory` (see raw-port/src/render/
//   HGDitherLUTEntryFactory.ts): we DO NOT re-import its factory here
//   because HGDitherLUTInfo's four methods do not call it.
//
// ── REUSED PORTS ────────────────────────────────────────────────────────────
//   `HGLUTCache_LUTInfo` — the opaque base-class handle — is DUPLICATED here
//   as its own module-local interface rather than imported, matching the
//   pattern in the sibling HGAntiAliasLUTInfo.ts. A shared `HGLUTCache.ts`
//   port (with the full base-class layout + RTTI shim) is the correct future
//   consolidation point; until then, each descriptor subclass carries its
//   own brand to keep the file self-contained and its provenance atomic.
//
// ── PORTING NOTES (fp32-narrowed / bit-exact) ──────────────────────────────
// This class contains NO floating-point arithmetic. All observable state is
// a single unsigned 32-bit integer field and a virtual dispatch table. The
// port therefore has NO Math.fround / narrowing concerns; the only integer-
// width care is that `key` is unsigned 32-bit (`| 0` would be wrong — it is
// unsigned, so `>>> 0` on any incoming value keeps it in the same domain the
// C++ code sees via `movl`).
//
// This file transcribes: destructors D0/D1 (@0x6fed0 / @0x6fee0),
// duplicate (@0x6fef0), isEqual (@0x6ff20).

/**
 * Opaque handle to Helium's `HGLUTCache::LUTInfo` (the abstract base class
 * of every HG… LUT descriptor used by HGLUTCache). It has its own future
 * task-queue entry — this file must not draw its layout in. The four members
 * below only observe pointer identity and, via `__dynamic_cast`, RTTI-based
 * downcastability.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  ; RTTI typeinfo (literal pool ref at
 *                                       @0x6ff2f inside isEqual)
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

/**
 * `__dynamic_cast` frontier stub — libc++abi RTTI helper.
 *   @Helium 0x6ff47  callq 0x3c5018  ## symbol stub for: ___dynamic_cast
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
 * emulation port. Never weaken this to `return src as HGDitherLUTInfo`
 * (that would silently mis-compare two different LUTInfo subclasses).
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGDitherLUTInfo | null {
  // Faithful decode-don't-fit stub. See raw-port/army/PORTING_SPEC.md rule 3.
  throw new Error(
    "___dynamic_cast @Helium 0x6ff47 is not yet ported — the HGLUTCache::LUTInfo " +
      "class hierarchy (and its RTTI emulation) has not been decoded yet. This " +
      "throw is the demand signal that a shared JS-side RTTI shim is required " +
      "before HGDitherLUTInfo::isEqual can produce values on non-null args. " +
      "Do NOT weaken by returning src as-is: that would silently equate two " +
      "different LUTInfo subclasses whose +0x8 field happens to match.",
  );
}

/**
 * HGDitherLUTInfo — HGLUTCache's cache key/descriptor for dither LUTs.
 *
 * A tiny (16-byte) polymorphic value type that inherits from
 * `HGLUTCache::LUTInfo` and carries a single 32-bit `key` payload. HGLUTCache
 * uses these two virtual methods:
 *   - `duplicate()` — deep-copy the descriptor onto the heap (so the cache
 *                     can own its own key even after the caller's stack-
 *                     resident template goes away).
 *   - `isEqual(other)` — RTTI-checked equality: `other` must actually be a
 *                        HGDitherLUTInfo (via `__dynamic_cast`) AND its
 *                        `key` field must match.
 */
export class HGDitherLUTInfo {
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
   * @param key unsigned 32-bit dither LUT key (normalized via `>>> 0`
   *            to match the `movl`-into-uint32 width the C++ code sees).
   */
  constructor(key: number) {
    this.key = key >>> 0;
  }

  /**
   * D1 — complete-object destructor (in-place).
   *   @Helium 0x000000000006fed0..0x000000000006fed5
   *
   * Disassembly (recovered via `otool -tV -p __ZN15HGDitherLUTInfoD1Ev …`):
   *   0x6fed0  pushq %rbp
   *   0x6fed1  movq  %rsp, %rbp
   *   0x6fed4  popq  %rbp
   *   0x6fed5  retq
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
    // 0x6fed0-0x6fed5: frame prologue + retq, no observable effect.
  }

  /**
   * D0 — deleting destructor.
   *   @Helium 0x000000000006fee0..0x000000000006fee9
   *
   * Disassembly (from Helium.HGDitherLUTInfo.~HGDitherLUTInfo.s):
   *   0x6fee0  pushq %rbp
   *   0x6fee1  movq  %rsp, %rbp
   *   0x6fee4  popq  %rbp
   *   0x6fee5  jmp   0x3c4fa0                    ## symbol stub: __ZdlPv
   *   0x6feea  nopw  (%rax,%rax)                 ## alignment pad
   *
   * The body is a bare tail-call to `operator delete(void*)`. There is no
   * D1 call before it (D1 is empty anyway — see above), so the entire
   * "run field/base destructors" phase is elided by the compiler and the
   * D0 form just frees the storage.
   *
   * In JS/TS this is a no-op; the GC handles storage. Kept for provenance.
   */
  D0_destructor(): void {
    // 0x6fee5: tail-jmp to __ZdlPv (operator delete(void*)) — no JS analog.
  }

  /**
   * duplicate() — heap-copy this descriptor.
   *   @Helium 0x000000000006fef0..0x000000000006ff19
   *
   * Direct transcription of the x86_64 body:
   *
   *   0x6fef0  pushq %rbp
   *   0x6fef1  movq  %rsp, %rbp
   *   0x6fef4  pushq %rbx
   *   0x6fef5  pushq %rax                        ; align stack + reserve
   *   0x6fef6  movq  %rdi, %rbx                  ; rbx = this (source)
   *   0x6fef9  movl  $0x10, %edi                 ; edi = sizeof(HGDitherLUTInfo) = 16
   *   0x6fefe  callq __Znwm                      ; operator new(16)   -> rax
   *   0x6ff03  movl  0x8(%rbx), %ecx             ; ecx = this->key
   *   0x6ff06  leaq  0x998cc3(%rip), %rdx        ; rdx = &vtable[+0x10] = 0xa08bd0
   *   0x6ff0d  movq  %rdx, (%rax)                ; new->__vptr = vtable slot base
   *   0x6ff10  movl  %ecx, 0x8(%rax)             ; new->key = this->key
   *   0x6ff13  addq  $0x8, %rsp
   *   0x6ff17  popq  %rbx
   *   0x6ff18  popq  %rbp
   *   0x6ff19  retq                              ; rax = new HGDitherLUTInfo*
   *
   * Notes:
   *   • Size 16 (`$0x10`) at 0x6fef9 confirms sizeof == 16, matching the
   *     layout table at the top of this file.
   *   • `movl 0x8, %ecx / movl %ecx, 0x8` copies the SINGLE 32-bit payload;
   *     the tail padding at +0xC is left uninitialized in C++ (`operator
   *     new` returns raw storage; the compiler does not zero it). In JS
   *     the instance simply has one field.
   *   • `leaq 0x998cc3(%rip),%rdx` resolves (next-instr 0x6ff0d + 0x998cc3)
   *     = 0xa08bd0 = `vtable for HGDitherLUTInfo (+0x10)`. This installs
   *     the virtual-function base (past offset-to-top and RTTI slots) into
   *     the new object's vptr. In JS/TS the language handles virtual
   *     dispatch, so the return value is a `HGDitherLUTInfo` instance
   *     whose class identity is set by `new HGDitherLUTInfo(...)`.
   *
   * No exception path is emitted by the compiler here (operator new is the
   * only throwing call, and if it throws the compiler does not need any
   * cleanup because no other resource was acquired yet).
   */
  duplicate(): HGDitherLUTInfo {
    // 0x6fefe: __Znwm(16) — 16-byte allocation. In JS the runtime provides
    //  the object; the 16 bytes is a fact about the C++ layout.
    // 0x6ff03-0x6ff10: install vptr (0xa08bd0) and copy +0x8 uint32 key.
    //  In JS, `new HGDitherLUTInfo(this.key)` fuses both steps: it sets
    //  class identity (analogue of the vptr write) and initializes the
    //  single payload field via the ctor above.
    return new HGDitherLUTInfo(this.key);
  }

  /**
   * isEqual(other) — RTTI-checked descriptor equality.
   *   @Helium 0x000000000006ff20..0x000000000006ff65
   *
   * Direct transcription of the x86_64 body:
   *
   *   0x6ff20  pushq %rbp
   *   0x6ff21  movq  %rsp, %rbp
   *   0x6ff24  pushq %r14
   *   0x6ff26  pushq %rbx
   *   0x6ff27  testq %rsi, %rsi                  ; other == nullptr?
   *   0x6ff2a  je    0x6ff5d                     ; -> return 0
   *   0x6ff2c  movq  %rdi, %r14                  ; r14 = this
   *   0x6ff2f  movq  0x9923aa(%rip), %rax        ; literal pool: &__ZTIN10HGLUTCache7LUTInfoE
   *                                               ; (i.e. RTTI of the SRC type
   *                                               ;  HGLUTCache::LUTInfo — this
   *                                               ;  is the src-type-info arg
   *                                               ;  the ABI expects for a
   *                                               ;  downcast: cast starting
   *                                               ;  from the base sub-object)
   *   0x6ff36  leaq  __ZTI15HGDitherLUTInfo(%rip), %rdx
   *                                               ; rdx = dst-type-info
   *                                               ; (RTTI of THIS derived class)
   *   0x6ff3d  xorl  %ebx, %ebx                  ; ebx = 0 (default return)
   *   0x6ff3f  movq  %rsi, %rdi                  ; arg1 = src ptr (other)
   *   0x6ff42  movq  %rax, %rsi                  ; arg2 = src type-info
   *   0x6ff45  xorl  %ecx, %ecx                  ; arg4 = hint (0 = no hint)
   *   0x6ff47  callq 0x3c5018                    ## symbol stub: ___dynamic_cast
   *   0x6ff4c  testq %rax, %rax                  ; downcast succeeded?
   *   0x6ff4f  je    0x6ff5f                     ; nope -> ebx stays 0
   *   0x6ff51  movl  0x8(%r14), %ecx             ; ecx = this->key
   *   0x6ff55  cmpl  0x8(%rax), %ecx             ; cmp with cast->key
   *   0x6ff58  sete  %bl                         ; bl = (this->key == cast->key)
   *   0x6ff5b  jmp   0x6ff5f
   *   0x6ff5d  xorl  %ebx, %ebx                  ; other == null: ebx = 0
   *   0x6ff5f  movl  %ebx, %eax                  ; return ebx (uint32 bool)
   *   0x6ff61  popq  %rbx
   *   0x6ff62  popq  %r14
   *   0x6ff64  popq  %rbp
   *   0x6ff65  retq
   *
   * Semantics (three-branch decision tree, mirrored verbatim below):
   *   1. `other == nullptr`  -> return false.
   *   2. `dynamic_cast<HGDitherLUTInfo*>(other)` == nullptr -> return
   *      false. This catches HGLUTCache::LUTInfo pointers that actually
   *      point at some OTHER descriptor subclass (e.g. HGAntiAliasLUTInfo,
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
   * an actual `HGDitherLUTInfo` instance (in which case the JS runtime
   * makes the "downcast succeeded" branch trivial — see below).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x6ff27-0x6ff2a: `testq %rsi,%rsi; je 0x6ff5d` — null-guard, returns 0.
    if (other === null) {
      // 0x6ff5d: xorl %ebx,%ebx (return 0)
      return false;
    }

    // 0x6ff2f-0x6ff47: __dynamic_cast(src=other, srcType=HGLUTCache::LUTInfo,
    //                                  dstType=HGDitherLUTInfo, hint=0).
    // Returns adjusted derived pointer, or nullptr if `other` is not actually a
    // HGDitherLUTInfo. In JS/TS we model the "is this an instance of the
    // derived class?" question via `instanceof`: that produces the same
    // downcast-succeeded/failed decision the C++ code branches on at 0x6ff4f.
    // The stub below is only reached if some future call passes an opaque
    // (non-JS-class) LUTInfo that instanceof cannot classify — at that point a
    // proper RTTI-emulation port is required. See dynamicCast_stub above.
    let cast: HGDitherLUTInfo | null;
    if (other instanceof HGDitherLUTInfo) {
      // Downcast succeeded — `other` IS a HGDitherLUTInfo. The C++ code
      // adjusts the pointer via the ABI helper; in JS the object identity
      // is unchanged, so `cast = other` matches semantics exactly.
      cast = other;
    } else {
      // The incoming LUTInfo is an opaque brand (no runtime class identity in
      // JS). Faithful behaviour requires an RTTI check we do not have yet.
      cast = dynamicCast_stub(
        other,
        "N10HGLUTCache7LUTInfoE",
        "15HGDitherLUTInfo",
      );
    }

    // 0x6ff4c-0x6ff4f: `testq %rax,%rax; je 0x6ff5f` — cast failed -> 0.
    if (cast === null) {
      return false;
    }

    // 0x6ff51-0x6ff58: `movl 0x8(this),%ecx ; cmpl 0x8(cast),%ecx ; sete %bl`
    //   → uint32 equality of the +0x8 key field on both instances. The C++
    //   code compares as 32-bit `movl`/`cmpl`; in JS the ctor already
    //   normalized both sides via `>>> 0` so plain `===` gives the same
    //   answer bit-for-bit.
    return (this.key >>> 0) === (cast.key >>> 0);
  }
}
