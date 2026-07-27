// raw-port: FxColorDescription — Ozone framework (channels layer)
//
// Two published entry points:
//   0x000325f0  FxColorDescription::~FxColorDescription()               (D1, base)
//   0x000d0230  FxColorDescription::operator=(FxColorDescription const&) (copy-assign)
//
// Object layout inferred from these two functions:
//   +0x00 colorSpace  — CGColorSpaceRef, refcounted via PCCFRefTraits<CGColorSpace*>
//                       (retain @0x6dda94, release @0x6dda9a)
//   +0x08 qword       — an 8-byte field (unnamed here; assignment copies it whole)
//   +0x10 dword       — a 4-byte u32 field (movl at @0xd0266/@0xd026a)
//   +0x18 byte        — a 1-byte field (movzbl at @0xd0275/@0xd027a)
//
// Total on-disk size: 0x19 bytes (padded up per ABI). The absence of a
// vptr write in either function proves this is a NON-polymorphic value
// type (no vtable pointer at +0x00 to reset).

/**
 * Opaque handle to a CoreGraphics CGColorSpaceRef. The actual retain and
 * release calls (@0x6dda94 / @0x6dda9a in Ozone) go through
 * `PCCFRefTraits<CGColorSpace*>::retain` / `::release`, which are external
 * Ozone symbols wrapping `CGColorSpaceRetain` / `CGColorSpaceRelease`.
 * Un-injected callers hit the throwing stubs below.
 */
export type CGColorSpaceRef = { readonly __brand: "CGColorSpaceRef" };

/** PCCFRefTraits<CGColorSpace*>::retain(cs)  — @0x6dda94 in Ozone. */
export type CGColorSpaceRetainFn = (cs: CGColorSpaceRef) => CGColorSpaceRef;
/** PCCFRefTraits<CGColorSpace*>::release(cs) — @0x6dda9a in Ozone. */
export type CGColorSpaceReleaseFn = (cs: CGColorSpaceRef) => void;

/**
 * FxColorDescription — value type describing a rendered color region
 * (color space + a few numeric fields whose exact semantics are not
 * decoded here; only the copy-assign and dtor are published at these
 * addresses).
 */
export class FxColorDescription {
  /**
   * +0x00: CGColorSpaceRef, or null.
   *   D1  @0x325f4 movq (%rdi), %rdi
   *   op= @0xd023d/@0xd0240 read; @0xd0258 store; @0xd0250 release; @0xd0261 retain
   */
  public colorSpace: CGColorSpaceRef | null = null;

  /**
   * +0x08: 8-byte scalar (asm treats it as a qword — could be a size_t,
   * a double, or a CFTypeRef; the two decoded functions only copy it
   * verbatim, so we mirror as a plain number and let JS BigInt-widen
   * callers deal with it if a decoded ctor lands later).
   *   op= @0xd026d movq 0x8(%r14), %rax ; @0xd0271 movq %rax, 0x8(%rbx)
   */
  public field_0x08: number = 0;

  /**
   * +0x10: 4-byte unsigned field (movl width).
   *   op= @0xd0266 movl 0x10(%r14), %eax ; @0xd026a movl %eax, 0x10(%rbx)
   */
  public field_0x10: number = 0;

  /**
   * +0x18: 1-byte field (u8; movzbl load, movb store).
   *   op= @0xd0275 movzbl 0x18(%r14), %eax ; @0xd027a movb %al, 0x18(%rbx)
   */
  public field_0x18: number = 0;

  /** Injected CGColorSpace retain/release (external Ozone symbols). */
  protected _retain: CGColorSpaceRetainFn | null = null;
  protected _release: CGColorSpaceReleaseFn | null = null;

  constructor(retain: CGColorSpaceRetainFn | null = null, release: CGColorSpaceReleaseFn | null = null) {
    this._retain = retain;
    this._release = release;
  }

  /**
   * FxColorDescription::~FxColorDescription()  @0x000325f0
   *
   * Faithful asm mirror:
   *   @0x325f0  push %rbp; mov %rsp,%rbp
   *   @0x325f4  mov (%rdi), %rdi          ; rdi = this->colorSpace
   *   @0x325f7  test %rdi, %rdi           ; if null skip
   *   @0x325fa  je   0x32601
   *   @0x325fc  call PCCFRefTraits<CGColorSpace*>::release(cs)   ; stub 0x6dda9a
   *   @0x32601  pop %rbp; ret
   *
   * No vptr write; no other fields touched. The +0x08/+0x10/+0x18 fields
   * are plain scalars, no cleanup needed.
   */
  destroy(): void {
    // @0x325f4..0x325fa — null check on colorSpace.
    const cs = this.colorSpace;
    if (cs === null || cs === undefined) {
      return;
    }
    // @0x325fc — external release. Frontier if no impl injected.
    if (this._release === null) {
      throw new Error(
        "FxColorDescription.destroy: no CGColorSpace release backend injected — undecoded frontier @0x325fc (symbol stub _ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_)",
      );
    }
    this._release(cs);
  }

  /**
   * FxColorDescription::operator=(FxColorDescription const&)  @0x000d0230
   *
   * Faithful asm mirror:
   *   @0xd023d  mov  (%rdi), %rax                  ; rax = this->colorSpace
   *   @0xd0240  mov  (%rsi), %rdi                  ; rdi = other.colorSpace
   *   @0xd0243  cmpq %rdi, %rax                    ; if same pointer:
   *   @0xd0246  je   0xd0266                       ;   skip retain/release, jump to scalars
   *   @0xd0248  test %rax, %rax                    ; if this->cs != null:
   *   @0xd024b  je   0xd0258
   *   @0xd024d  mov  %rax, %rdi
   *   @0xd0250  call PCCFRefTraits<CGColorSpace*>::release(old)  ; stub 0x6dda9a
   *   @0xd0255  mov  (%r14), %rdi                  ; reload other.cs (release may have clobbered rdi)
   *   @0xd0258  mov  %rdi, (%rbx)                  ; this->cs = other.cs
   *   @0xd025b  cmpq $0, (%r14)                    ; if other.cs != null:
   *   @0xd025f  je   0xd0266
   *   @0xd0261  call PCCFRefTraits<CGColorSpace*>::retain(new)   ; stub 0x6dda94
   *   @0xd0266  movl 0x10(%r14), %eax ; movl %eax, 0x10(%rbx)  ; copy +0x10 (u32)
   *   @0xd026d  movq 0x8(%r14), %rax  ; movq %rax, 0x8(%rbx)   ; copy +0x08 (u64)
   *   @0xd0275  movzbl 0x18(%r14), %eax ; movb %al, 0x18(%rbx) ; copy +0x18 (u8)
   *   @0xd027d  mov  %rbx, %rax                    ; return *this
   *
   * Notes:
   *   • Self-assignment SAFETY: the `je 0xd0266` at @0xd0246 correctly skips
   *     both release AND retain when the pointers match, preventing a
   *     release→retain flicker on same-object assignment. We mirror.
   *   • Retain happens AFTER the store (@0xd0258), which is fine because
   *     other's owner still holds a ref. If we assigned from a temporary
   *     whose only ref was released above, this ordering would be a bug —
   *     but that's a caller concern; the asm makes this choice.
   *   • The +0x10 field is copied BEFORE +0x08 in the asm ordering, but
   *     both are independent memory locations so the order is a stylistic
   *     compiler choice (not observable).
   */
  assign(other: FxColorDescription): FxColorDescription {
    // @0xd023d..0xd0266 — colorSpace retain/release dance.
    const oldCs = this.colorSpace;
    const newCs = other.colorSpace;
    // @0xd0243/@0xd0246 — pointer identity check.
    if (oldCs !== newCs) {
      // @0xd0248..@0xd0250 — release old if non-null.
      if (oldCs !== null && oldCs !== undefined) {
        if (this._release === null) {
          throw new Error(
            "FxColorDescription.assign: no CGColorSpace release backend injected — undecoded frontier @0xd0250 (symbol stub _ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_)",
          );
        }
        this._release(oldCs);
      }
      // @0xd0258 — store new pointer.
      this.colorSpace = newCs;
      // @0xd025b..@0xd0261 — retain new if non-null.
      if (newCs !== null && newCs !== undefined) {
        if (this._retain === null) {
          throw new Error(
            "FxColorDescription.assign: no CGColorSpace retain backend injected — undecoded frontier @0xd0261 (symbol stub _ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_)",
          );
        }
        // Note: the asm discards the retain() return value (call, no store).
        // PCCFRefTraits<CGColorSpace*>::retain returns the same ref it was
        // handed. We call and drop.
        this._retain(newCs);
      }
    }
    // @0xd0266 — copy the plain scalars. Widths: u32 / u64 / u8.
    this.field_0x10 = other.field_0x10 >>> 0; // movl (u32)
    this.field_0x08 = other.field_0x08;        // movq (u64) — preserve as JS number
    this.field_0x18 = other.field_0x18 & 0xff; // movzbl/movb (u8)
    // @0xd027d — mov %rbx, %rax → return *this.
    return this;
  }
}
