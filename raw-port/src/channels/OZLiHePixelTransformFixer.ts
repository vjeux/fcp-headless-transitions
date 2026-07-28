// OZLiHePixelTransformFixer.ts
// Faithful raw-port of Ozone::OZLiHePixelTransformFixer.
//
// Source: Ozone framework (macOS FCP).
//   Disassembly stashed under raw-port/re/disasm/OZLiHePixelTransformFixer.*.s
//   (x86_64 slice, from /tmp/Ozone_tV.txt).
//
// Ports:
//   - OZLiHePixelTransformFixer::~OZLiHePixelTransformFixer() [D1, base] @0x492d60
//   - OZLiHePixelTransformFixer::~OZLiHePixelTransformFixer() [D0, deleting] @0x492db0
//   - OZLiHePixelTransformFixer::pixelTransformSupport(LiRenderParameters const&) @0x492e00
//   - OZLiHePixelTransformFixer::estimateRenderMemory(std::set<PCHash128,...>&) @0x492e10
//   - OZLiHePixelTransformFixer::getHelium(LiAgent&) @0x492e20
//
// Object layout (derived from the method bodies and destructor):
//   0x00  LiImageSource base subobject (primary vptr set from VTT+0x8 in dtors)
//     0x00  LiImageSource primary vptr
//     0x08  LiImageSource::imageSpace (u32)  — inherited (see channels/LiImageSource.ts)
//     0x0c  pixelTransformSupport value (u32) — read by pixelTransformSupport() @0x492e04
//   0x10  PCShared_base secondary vptr (rewritten in dtors to PCShared_base's vtable+0x10)
//   0x18  PC_Sp_counted_base* — released via weak_release() when non-null (dtor)
//   ... (remaining fields opaque; the three methods above touch none of them)
//
// Note: pixelTransformSupport() ignores its LiRenderParameters& argument — the whole
//   body is `return *(uint32_t*)(this + 0xc)`. So the "fixer" state is a single u32
//   presumably describing which pixel-transform paths this fixer supports.

/**
 * Opaque PC_Sp_counted_base pointer type. Full PC_Sp_counted_base is not ported here;
 * we model the pointer nominally.
 */
export type PCSpCountedBasePtr = unknown | null;

/**
 * Undecoded frontier callee — LiImageSource base destructor.
 *
 * Symbol: __ZN13LiImageSourceD2Ev (call target 0x6dd842 — symbol stub).
 * Called by both ~OZLiHePixelTransformFixer variants at:
 *   @0x492d74 (D1) and @0x492dc4 (D0)
 * with `rdi = this` (LiImageSource base subobject is at offset 0) and
 *      `rsi = &VTT_OZLiHePixelTransformFixer + 0x8` (VTT-thunked base sub-vtable pointer).
 *
 * A throwing stub — LiImageSource::~LiImageSource @0x6dd842 is not yet ported.
 */
function LiImageSource_D2(_self: OZLiHePixelTransformFixer): void {
  throw new Error(
    "raw-port: LiImageSource::~LiImageSource() (D2, base dtor) is not yet ported " +
      "(callq @0x492d74/@0x492dc4 → 0x6dd842 symbol stub __ZN13LiImageSourceD2Ev)"
  );
}

/**
 * Undecoded frontier callee — PC_Sp_counted_base::weak_release().
 *
 * Symbol: __ZN18PC_Sp_counted_base12weak_releaseEv (call target 0x6de4fc — symbol stub).
 * Called from the destructor branch when `*(void**)(this + 0x18) != nullptr`:
 *   @0x492d91 (D1) and @0x492de1 (D0), with `rdi = *(void**)(this + 0x18)`.
 *
 * A throwing stub — PC_Sp_counted_base::weak_release @0x6de4fc is not yet ported.
 */
function PC_Sp_counted_base_weak_release(_counted: PCSpCountedBasePtr): void {
  throw new Error(
    "raw-port: PC_Sp_counted_base::weak_release() is not yet ported " +
      "(callq @0x492d91/@0x492de1 → 0x6de4fc symbol stub __ZN18PC_Sp_counted_base12weak_releaseEv)"
  );
}

/**
 * Undecoded frontier callee — operator delete(void*).
 *
 * Symbol: __ZdlPv (call target 0x6dfc36 — symbol stub).
 * Tail-jumped by ~OZLiHePixelTransformFixer [D0] @0x492def with `rdi = this` to free
 * the storage after running the base destructor.
 *
 * A throwing stub — operator delete @0x6dfc36 is not modeled at this layer.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "raw-port: ::operator delete(void*) is not yet ported " +
      "(jmp @0x492def → 0x6dfc36 symbol stub __ZdlPv)"
  );
}

/**
 * Undecoded frontier — vtable for PCShared_base.
 *
 * Symbol: __ZTV13PCShared_base (RIP-referenced @0x492d79 in D1 and @0x492dc9 in D0).
 * The destructors write `&__ZTV13PCShared_base + 0x10` into `*(void**)(this + 0x10)`
 * to rebind the secondary vptr back to PCShared_base as this subobject is torn down.
 *
 * We do not model the raw vtable pointer here — it's a per-process load-time address —
 * and instead reflect the store as a "secondary base bound to PCShared_base" flag.
 */

/** Opaque LiRenderParameters — its body is not touched by pixelTransformSupport(). */
export type LiRenderParameters = unknown;

/** Opaque PCHash128 element type; only the container reference is passed and ignored. */
export type PCHash128Set = unknown;

/** Opaque LiAgent — getHelium() ignores it. */
export type LiAgent = unknown;

/**
 * OZLiHePixelTransformFixer — a LiImageSource-derived "pixel transform support" fixer.
 *
 * Only the fields the three ported methods touch are modeled:
 *   - `pixelTransformSupportValue` (this+0x0c)  read by pixelTransformSupport()
 *   - `secondaryBoundToPCSharedBase` (this+0x10 subobject state)  rewritten by dtors
 *   - `pcSpCountedBase` (this+0x18)  released by dtors when non-null
 *
 * LiImageSource base fields (imageSpace @0x08, etc.) live in the inherited subobject
 * and are not read/written by any method on this class.
 */
export class OZLiHePixelTransformFixer {
  /**
   * @0x0c — the u32 returned by pixelTransformSupport(). The enum name is not
   * recovered from the binary; we keep it as a `number` (u32) verbatim.
   */
  public pixelTransformSupportValue: number = 0 | 0;

  /**
   * @0x10 — PCShared_base secondary vptr slot. In the destructors this is written
   * with `&__ZTV13PCShared_base + 0x10` (base sub-vtable address); we mirror the
   * bind as a boolean so tests can observe the transition without touching a
   * process-address-dependent pointer.
   */
  public secondaryBoundToPCSharedBase: boolean = false;

  /**
   * @0x18 — PC_Sp_counted_base pointer. If non-null, the destructor calls
   * `weak_release()` on it. See PC_Sp_counted_base_weak_release above.
   */
  public pcSpCountedBase: PCSpCountedBasePtr = null;

  /**
   * ~OZLiHePixelTransformFixer() [D1 — base/complete dtor] @0x492d60
   *
   * Mirrors the asm control flow:
   *   @0x492d69  rsi = &VTT_OZLiHePixelTransformFixer + 0x8  (base sub-vtable pointer)
   *   @0x492d74  callq __ZN13LiImageSourceD2Ev(this, sub_vtable)   — base dtor
   *   @0x492d79  rax = &__ZTV13PCShared_base
   *   @0x492d80  rax += 0x10
   *   @0x492d84  *(void**)(this + 0x10) = rax    — rebind secondary vptr
   *   @0x492d88  rdi = *(void**)(this + 0x18)
   *   @0x492d8c  testq rdi, rdi
   *   @0x492d8f  je   0x492d96                    — skip if null
   *   @0x492d91  callq __ZN18PC_Sp_counted_base12weak_releaseEv(rdi)
   *   @0x492d96  return
   */
  dtorD1(): void {
    // @0x492d74 — run LiImageSource base destructor (thunked via VTT + 0x8).
    LiImageSource_D2(this);
    // @0x492d84 — rebind the secondary base subobject vptr to PCShared_base's vtable+0x10.
    this.secondaryBoundToPCSharedBase = true;
    // @0x492d88..@0x492d8f — load PC_Sp_counted_base*; skip if null.
    const counted = this.pcSpCountedBase;
    if (counted !== null && counted !== undefined) {
      // @0x492d91 — release the weak count.
      PC_Sp_counted_base_weak_release(counted);
    }
    // @0x492d9c — retq
  }

  /**
   * ~OZLiHePixelTransformFixer() [D0 — deleting dtor] @0x492db0
   *
   * Same shape as D1, but tail-jumps into `operator delete(this)` at the end:
   *   @0x492db9  rsi = &VTT_OZLiHePixelTransformFixer + 0x8
   *   @0x492dc4  callq __ZN13LiImageSourceD2Ev(this, sub_vtable)
   *   @0x492dc9  rax = &__ZTV13PCShared_base ; @0x492dd0 rax += 0x10
   *   @0x492dd4  *(void**)(this + 0x10) = rax
   *   @0x492dd8  rdi = *(void**)(this + 0x18)
   *   @0x492ddc  testq rdi, rdi
   *   @0x492ddf  je   0x492de6
   *   @0x492de1  callq __ZN18PC_Sp_counted_base12weak_releaseEv(rdi)
   *   @0x492de6  rdi = this
   *   @0x492def  jmp  __ZdlPv                     — tail call operator delete(this)
   */
  dtorD0(): void {
    // @0x492dc4 — LiImageSource base destructor.
    LiImageSource_D2(this);
    // @0x492dd4 — rebind secondary vptr.
    this.secondaryBoundToPCSharedBase = true;
    // @0x492dd8..@0x492ddf — conditional weak_release.
    const counted = this.pcSpCountedBase;
    if (counted !== null && counted !== undefined) {
      // @0x492de1 — release the weak count.
      PC_Sp_counted_base_weak_release(counted);
    }
    // @0x492def — tail-jmp operator delete(this).
    operator_delete(this);
  }

  /**
   * OZLiHePixelTransformFixer::pixelTransformSupport(LiRenderParameters const&) @0x492e00
   *
   * Full body (7-line):
   *   pushq %rbp ; movq %rsp,%rbp
   *   @0x492e04 movl 0xc(%rdi), %eax   — load u32 from this+0x0c
   *   popq %rbp ; retq
   *
   * The `LiRenderParameters const&` argument is not read.
   */
  pixelTransformSupport(_params: LiRenderParameters): number {
    // @0x492e04: return *(uint32_t*)(this + 0x0c)
    return this.pixelTransformSupportValue | 0;
  }

  /**
   * OZLiHePixelTransformFixer::estimateRenderMemory(std::set<PCHash128,...>&) @0x492e10
   *
   * Full body:
   *   pushq %rbp ; movq %rsp,%rbp
   *   @0x492e14 xorl %eax,%eax          — return 0
   *   popq %rbp ; retq
   *
   * The std::set& argument is not read/written. Returns 0 (no memory estimated).
   */
  estimateRenderMemory(_visited: PCHash128Set): number {
    // @0x492e14: return 0
    return 0 | 0;
  }

  /**
   * OZLiHePixelTransformFixer::getHelium(LiAgent&) @0x492e20
   *
   * Full body:
   *   pushq %rbp ; movq %rsp,%rbp
   *   @0x492e24 movq %rdi, %rax          — return-value struct base = rdi (sret ptr)
   *   @0x492e27 movq $0x0, (%rdi)        — *(void**)ret = nullptr
   *   popq %rbp ; retq
   *
   * ABI: the return type occupies at least 8 bytes and is passed via `rdi` as an
   * sret pointer; the caller supplies the storage. This method fills only the first
   * 8 bytes with a null pointer — a "no Helium available" return.
   *
   * We surface that as an opaque object with a nulled `pointer` slot. Any additional
   * bytes in the caller's return-slot are left untouched (the asm doesn't write them).
   */
  getHelium(_agent: LiAgent): { pointer: null } {
    // @0x492e27: *(void**)sret = nullptr
    return { pointer: null };
  }
}
