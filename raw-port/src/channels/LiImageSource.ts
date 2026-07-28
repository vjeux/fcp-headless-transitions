// LiImageSource.ts
// Faithful raw-port of Ozone::LiImageSource.
//
// Source: Ozone framework (macOS FCP)
//   ports:
//     - LiImageSource::imageSpace()                                    @0xdf040
//     - LiImageSource::setImageSpace(LiImageSource::ImageSpace)        @0xdf050
//     - LiImageSource::getSourceAtTime(CMTime, bool, OZRenderParams const&)  @0xdf060
//
// Provenance: every load/store and callq is cited by @0xADDR from the disassembly at
//   raw-port/re/disasm/LiImageSource.*.s
//
// Object layout (derived from the three method bodies):
//   0x00 rawSourcePtr       // raw PCShared_base* (written by getSourceAtTime @0xdf069)
//   0x08 imageSpace         // ImageSpace enum, u32 (loaded @0xdf044, stored @0xdf054)
//   ... (remaining fields opaque)

/**
 * Opaque PCShared_base pointer type. The full PCShared_base struct + vtable are not yet
 * ported at this layer; we model the pointer nominally.
 */
export type PCSharedBasePtr = unknown | null;

/**
 * Undecoded frontier callee cited @0xdf083.
 *
 * Symbol: __ZN13PCSharedCountC1EP13PCShared_base (call target 0x6ddadc — symbol stub).
 * ABI: PCSharedCount::PCSharedCount(PCShared_base* adjustedBase) with `this = rdi`.
 * The `rdi` at the call site is `originalThis + 0x8` (the PCSharedCount subobject),
 * and `rsi` is either 0 (when source was null) or the RTTI-offset-adjusted pointer
 * `source + *(int64_t*)(vptr(source) - 0x18)`.
 *
 * This is a throwing stub — decoding PCSharedCount is the next unit's job.
 */
function PCSharedCount_ctor(_selfObj: LiImageSource, _adjustedBase: PCSharedBasePtr): void {
  throw new Error(
    "raw-port: PCSharedCount::PCSharedCount(PCShared_base*) is not yet ported " +
      "(callq @0xdf083 → 0x6ddadc symbol stub __ZN13PCSharedCountC1EP13PCShared_base)"
  );
}

/**
 * LiImageSource — thin wrapper.
 *
 * The three ported methods only touch fields at +0x0 and +0x8. Other fields are opaque
 * and preserved (never read/written).
 */
export class LiImageSource {
  /** field @0x00 — raw PCShared_base*. Written by getSourceAtTime @0xdf069. */
  public rawSourcePtr: PCSharedBasePtr = null;

  /** field @0x08 — ImageSpace enum (u32). Loaded by imageSpace(), stored by setImageSpace(). */
  public _imageSpace: number = 0 | 0;

  /**
   * LiImageSource::imageSpace() @0xdf040
   *
   * Full body:
   *   pushq %rbp ; movq %rsp,%rbp
   *   @0xdf044 movl 0x8(%rdi), %eax   — load u32 from this+0x8
   *   popq %rbp ; retq
   */
  imageSpace(): number {
    // @0xdf044: return *(uint32_t*)(this + 0x8)
    return this._imageSpace | 0;
  }

  /**
   * LiImageSource::setImageSpace(LiImageSource::ImageSpace) @0xdf050
   *
   * Full body:
   *   pushq %rbp ; movq %rsp,%rbp
   *   @0xdf054 movl %esi, 0x8(%rdi)   — store the u32 arg into this+0x8
   *   popq %rbp ; retq
   *
   * `LiImageSource::ImageSpace` is a scoped enum; we do not know its variants. u32 semantics.
   */
  setImageSpace(space: number): void {
    // @0xdf054: *(uint32_t*)(this + 0x8) = space
    this._imageSpace = space | 0;
  }

  /**
   * LiImageSource::getSourceAtTime(CMTime, bool, OZRenderParams const&) @0xdf060
   *
   * Full body @0xdf060..0xdf091:
   *   @0xdf060..0xdf065  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   @0xdf066           movq %rdi, %rbx         — rbx = this (returned value)
   *   @0xdf069           movq %rsi, (%rdi)       — *this = rsi (raw PCShared_base*)
   *   @0xdf06c           testq %rsi, %rsi
   *   @0xdf06f           je 0xdf07a
   *   @0xdf071           movq (%rsi), %rax       — rax = *(void**)rsi        (vptr)
   *   @0xdf074           addq -0x18(%rax), %rsi  — rsi += *(int64_t*)(rax-0x18)  (RTTI offset-to-base)
   *   @0xdf078           jmp 0xdf07c
   *   @0xdf07a           xorl %esi, %esi         — else rsi = 0
   *   @0xdf07c           movq %rbx, %rdi
   *   @0xdf07f           addq $0x8, %rdi         — rdi = this + 0x8
   *   @0xdf083           callq __ZN13PCSharedCountC1EP13PCShared_base
   *   @0xdf088           movq %rbx, %rax         — return this
   *
   * ABI note: the three source-level args (CMTime by-value, bool, OZRenderParams const&) do
   * NOT appear in this leaf's body — every non-prologue instruction operates on %rsi as a
   * pointer-sized value. The Itanium/SysV small-struct ABI passes CMTime's low 8 bytes in
   * %rsi (a CMTimeValue int64), which the compiler here re-uses as a raw pointer for the
   * PCShared_base transfer. We surface the raw pointer as a distinct `sourcePtr` parameter
   * to make the observable transfer explicit; the original CMTime/bool/OZRenderParams are
   * preserved as parameters for source-level parity (never used by this leaf's asm).
   *
   * @returns `this` (the FCP method sets rax = rbx = this before ret).
   */
  getSourceAtTime(
    _cmTime: unknown /* CMTime, opaque here */,
    _flag: boolean,
    _renderParams: unknown /* OZRenderParams const& */,
    sourcePtr: PCSharedBasePtr
  ): this {
    // @0xdf069 movq %rsi, (%rdi)  — *this = raw pointer, ALWAYS (before the null check).
    this.rawSourcePtr = sourcePtr;

    // @0xdf06c..0xdf07c — compute the RTTI-adjusted pointer for the PCSharedCount ctor.
    // The adjusted pointer lives only in %rsi and feeds the callq at @0xdf083; it is never
    // stored back onto `this`. Decoding the vtable arithmetic requires PCShared_base's
    // vtable to be ported; today we throw in PCSharedCount_ctor which prevents any caller
    // from observing the (RTTI-adjusted) adjusted value. Faithful: we cite the intended math
    // in the comment and defer the actual adjustment to the frontier port.
    //
    //   if (sourcePtr) {
    //     const vptr = *(void**)sourcePtr;                       // @0xdf071
    //     adjusted = sourcePtr + *(int64_t*)(vptr - 0x18);        // @0xdf074 (RTTI offset)
    //   } else {
    //     adjusted = 0;                                          // @0xdf07a
    //   }
    //
    // We forward the raw pointer to the throwing stub — the stub throws before any observer
    // could distinguish raw-vs-adjusted, keeping the port honest.
    const adjustedBaseForCtor: PCSharedBasePtr = sourcePtr;

    // @0xdf07f..0xdf083 : PCSharedCount(this + 0x8, adjustedBaseForCtor)
    PCSharedCount_ctor(this, adjustedBaseForCtor);

    // @0xdf088 movq %rbx, %rax  — return this
    return this;
  }
}

export default LiImageSource;
