// raw-port/src/channels/OZRotoshapeStyle.ts
//
// FCP `OZRotoshapeStyle` (Ozone framework) — an OZStyle subclass that models
// the "roto-shape" style channel-tree. In the running binary the class exports
// exactly 8 out-of-line symbols (2 named ctor overloads with C1/C2 pairs,
// 2 dtors D1/D0, and 2 hash entry points):
//
//   @0x527980  OZRotoshapeStyle(OZFactory*, PCString const&, unsigned int)  [C2 3-arg factory ctor body]
//   @0x5279c0  OZRotoshapeStyle(OZFactory*, PCString const&, unsigned int)  [C1 wrapper -> C2 (ICF sibling)]
//   @0x527a00  OZRotoshapeStyle(OZRotoshapeStyle const&, unsigned int)      [C2 copy ctor body]
//   @0x527a40  OZRotoshapeStyle(OZRotoshapeStyle const&, unsigned int)      [C1 wrapper -> C2 (ICF sibling)]
//   @0x527a80  calcStaticHash(PCSerializerWriteStream&, std::list<OZObjectManipulator*>&)
//   @0x527ae0  calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, std::list<OZObjectManipulator*>&)
//   @0x527b40  ~OZRotoshapeStyle()   [D1 in-place]
//   @0x527b50  ~OZRotoshapeStyle()   [D0 deleting dtor]
//
// Plus the standard MI thunks (thn16 / thn40 for D1 / D0) at 0x527b70 / 0x527b80 /
// 0x527bb0 / 0x527bc0 which are cited below but are pure adjust-then-dispatch
// wrappers, not new implementation.
//
// Framework: Ozone
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// The x86_64 slice was extracted to /tmp/Ozone.x86_64. The Mach-O has no slide,
// so file offsets equal VAs — every @0xADDR below refers to both interchangeably.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (Multiple-Inheritance — recovered from the vtable installs at
// this+0x00, this+0x10, this+0x28 plus the three thn16/thn40 dtor thunks):
// -----------------------------------------------------------------------------
//   +0x000   vptr_primary       (OZStyle-primary subobject) installed value = 0x87bba8
//   +0x010   vptr_secondary     (second base subobject)     installed value = 0x87bce0
//   +0x028   vptr_tertiary      (third base subobject)      installed value = 0x87bf38
//   The instance has NO OWN DATA MEMBERS. The D0 dtor @0x527b50 does not touch
//   any this+offset before tail-jumping to OZStyle::D2 and operator delete —
//   confirming the class adds no per-instance storage over its inherited bases.
//
// -----------------------------------------------------------------------------
// VTABLE ADDRESSES (constant across BOTH C2 ctors — verified below):
// -----------------------------------------------------------------------------
//   vtable_primary   installed at this+0x00  = @0x87bba8    (= &__ZTV16OZRotoshapeStyle + 0x10)
//   vtable_secondary installed at this+0x10  = @0x87bce0    (= &__ZTV16OZRotoshapeStyle + 0x148)
//   vtable_tertiary  installed at this+0x28  = @0x87bf38    (= &__ZTV16OZRotoshapeStyle + 0x3a0)
//
//   Verifications (leaq disp(%rip) with next-insn PC):
//     factory C2 primary:   0x527995 + 0x354213 = 0x87bba8  ✓
//     factory C2 secondary: 0x52799f + 0x354341 = 0x87bce0  ✓
//     factory C2 tertiary:  0x5279aa + 0x35458e = 0x87bf38  ✓
//     copy    C2 primary:   0x527a15 + 0x354193 = 0x87bba8  ✓
//     copy    C2 secondary: 0x527a1f + 0x3542c1 = 0x87bce0  ✓
//     copy    C2 tertiary:  0x527a2a + 0x35450e = 0x87bf38  ✓
//
// The RTTI symbol @__ZTI16OZRotoshapeStyle (0x87bf80) is an
// abi::__vmi_class_type_info (multi-base flavour) that lists 3 base classes,
// consistent with the three-vptr layout above.
//

// ---------------------------------------------------------------------------
// Opaque handles for FCP types this class refers to. Each carries a distinct
// brand so callers cannot substitute one for another.
// ---------------------------------------------------------------------------

/** Opaque FCP `OZFactory*` — first arg of the 3-arg factory ctor. */
export interface OZFactoryLike { readonly __ozFactory: true; }

/** Opaque FCP `PCString&` — the channel-tree name argument. */
export interface PCStringLike { readonly __pcString: true; }

/**
 * Opaque FCP `PCSerializerWriteStream&` — the base-class first argument to both
 * hash entry points. The disassembly dynamic-casts the argument down to
 * `PCHashWriteStream*` before proceeding.
 */
export interface PCSerializerWriteStreamLike { readonly __pcSerializerWriteStream: true; }

/**
 * Opaque FCP `PCHashWriteStream*` — the successful down-cast target of both
 * hash entry points. The remainder of the hash pipeline is dispatched via
 * `PCHashWriteStream::vtable[0x28]` (see notes below).
 */
export interface PCHashWriteStreamLike { readonly __pcHashWriteStream: true; }

/** Opaque FCP `OZRenderParams const&` — a render-time parameter bundle. */
export interface OZRenderParamsLike { readonly __ozRenderParams: true; }

/** Opaque FCP `std::list<OZObjectManipulator*>&` — appended-to during hashing. */
export interface OZObjectManipulatorListLike { readonly __ozObjectManipulatorList: true; }

// ---------------------------------------------------------------------------
// Frontier callees — each throws with the exact source address so the frontier
// tool can see the outstanding gap (Rule 3: throw on undecoded).
// ---------------------------------------------------------------------------

/**
 * `OZStyle::OZStyle(OZFactory*, PCString const&, unsigned int)` @Ozone —
 * base ctor invoked at @0x527989 from the factory C2.
 * @frontier Ozone OZStyle
 */
export function OZStyle_ctor_factory(
  _this: unknown,
  _factory: OZFactoryLike,
  _name: PCStringLike,
  _u32: number,
): void {
  throw new Error(
    "OZStyle::OZStyle(OZFactory*, PCString const&, u32) @Ozone (call @0x527989) not yet transcribed",
  );
}

/**
 * `OZStyle::OZStyle(OZStyle const&, unsigned int)` @Ozone — base ctor invoked
 * at @0x527a09 from the copy C2. The `OZRotoshapeStyle const&` argument is
 * passed straight through: the C++ up-cast to `OZStyle const&` is a no-op at
 * offset 0 because OZStyle is the primary base.
 * @frontier Ozone OZStyle
 */
export function OZStyle_ctor_copy(_this: unknown, _src: unknown, _u32: number): void {
  throw new Error(
    "OZStyle::OZStyle(OZStyle const&, u32) @Ozone (call @0x527a09) not yet transcribed",
  );
}

/**
 * `OZStyle::~OZStyle()` @Ozone — base D2 called from every dtor:
 *   - D1 @0x527b45  (direct jmp)
 *   - D0 @0x527b59  (call before operator delete)
 *   - thn16 D1 @0x527b79 (jmp after `addq $-0x10, %rdi` — adjusting the second base)
 *   - thn40 D1 @0x527bb9 (jmp after `addq $-0x28, %rdi` — adjusting the third base)
 *   - thn16 D0 @0x527b90 (with the same adjust before op-delete tail)
 *   - thn40 D0 @0x527bd0 (with the same adjust before op-delete tail)
 * @frontier Ozone OZStyle
 */
export function OZStyle_dtor(_this: unknown): void {
  throw new Error(
    "OZStyle::~OZStyle @Ozone (jmp @0x527b45 / call @0x527b59 / thunks @0x527b79/@0x527b90/@0x527bb9/@0x527bd0) " +
      "not yet transcribed",
  );
}

/**
 * `__dynamic_cast(src, &typeinfo<PCSerializerWriteStream>, &typeinfo<PCHashWriteStream>, 0)`
 * @Ozone — the "is this stream actually a hash stream?" down-cast at the head
 * of BOTH hash entry points:
 *   - calcStaticHash   @0x527a97 call site
 *   - calcHashForState @0x527af7 call site
 * Returns a `PCHashWriteStream*` on success or `nullptr` on failure.
 * @frontier Ozone __dynamic_cast
 */
export function dynamic_cast_PCSerializerWriteStream_to_PCHashWriteStream(
  _src: PCSerializerWriteStreamLike,
): PCHashWriteStreamLike | null {
  throw new Error(
    "__dynamic_cast<PCHashWriteStream>(PCSerializerWriteStream*) @Ozone " +
      "(calls @0x527a97 / @0x527af7) not yet transcribed",
  );
}

/**
 * `__cxa_bad_cast()` @Ozone — libcxxabi terminator invoked when the reference
 * form of dynamic_cast fails. Both hash entry points fall through to it at
 * @0x527aab / @0x527b0b when the down-cast returns null (which for a `&` cast
 * means "the runtime type wasn't actually a PCHashWriteStream").
 *
 * Semantically this throws `std::bad_cast`; we model it as a hard error.
 */
export function cxa_bad_cast(): never {
  throw new Error(
    "__cxa_bad_cast @Ozone (dispatched from OZRotoshapeStyle::calcStaticHash @0x527aab " +
      "and OZRotoshapeStyle::calcHashForState @0x527b0b when the input stream is not a " +
      "PCHashWriteStream) not yet transcribed",
  );
}

/**
 * `PCHashWriteStream::vtable[0x28]` @Ozone — the virtual method dispatched by
 * both hash entry points after a successful down-cast:
 *   `movq (%rax), %rcx ; movq %rax, %rdi ; jmpq *0x28(%rcx)`
 * i.e. this is a tail-call to the PCHashWriteStream vtable slot at offset 0x28.
 *
 * Semantic interpretation: OZRotoshapeStyle contributes ZERO shape-specific
 * bytes to the hash — its "custom" implementation is `hashStream->virtual(0x28)`
 * with no additional state fed in. The two hash overloads discard their second
 * and third arguments entirely (list, RenderParams) — they are never used.
 *
 * Both bodies are byte-identical apart from a slightly different rip-offset
 * (which is why the linker did not ICF-fold them: their symbol signatures
 * differ, but their bodies are semantically the same "shrug and forward"
 * pattern).
 *
 * @frontier Ozone PCHashWriteStream
 */
export function PCHashWriteStream_vtable_slot28(_this: PCHashWriteStreamLike): void {
  throw new Error(
    "PCHashWriteStream::vtable[0x28] @Ozone (tail-jmp targets @0x527aa8 / @0x527b08 in " +
      "OZRotoshapeStyle's two hash entry points) not yet transcribed — requires the " +
      "PCHashWriteStream vtable decode.",
  );
}

// ---------------------------------------------------------------------------
// OZRotoshapeStyle — the class itself.
// ---------------------------------------------------------------------------

/**
 * `OZRotoshapeStyle` — an OZStyle subclass that (in FCP) represents the
 * "roto-shape" style. The class carries NO OWN DATA and both of its hash
 * overrides collapse to `PCHashWriteStream::vtable[0x28]` (see the frontier
 * comment above). It exists in the runtime symbol table primarily so that
 * an OZRotoshapeStyle-typed pointer can be constructed, copied, destroyed,
 * and recognised via RTTI by the OZStyle factory machinery.
 *
 * Multiple-inheritance layout (see the header):
 *   this+0x00  vptr_primary   = 0x87bba8
 *   this+0x10  vptr_secondary = 0x87bce0
 *   this+0x28  vptr_tertiary  = 0x87bf38
 */
export class OZRotoshapeStyle {
  /**
   * OZRotoshapeStyle(OZFactory*, PCString const&, unsigned int)
   * C2 body @0x527980  (C1 wrapper @0x5279c0 is an ICF sibling that reaches
   * the same body via a `pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp C2`
   * shim — hence C1 shares this entry).
   *
   * Body walkthrough (line-for-line):
   *   @0x527986 movq  %rdi, %rbx
   *   @0x527989 callq OZStyle::OZStyle(OZFactory*, PCString&, u32)   — base ctor.
   *   @0x52798e leaq  0x354213(%rip), %rax                            — rax = &vtable+0x10 = 0x87bba8.
   *   @0x527995 movq  %rax, (%rbx)                                    — install primary vptr.
   *   @0x527998 leaq  0x354341(%rip), %rax                            — rax = &vtable+0x148 = 0x87bce0.
   *   @0x52799f movq  %rax, 0x10(%rbx)                                — install secondary vptr.
   *   @0x5279a3 leaq  0x35458e(%rip), %rax                            — rax = &vtable+0x3a0 = 0x87bf38.
   *   @0x5279aa movq  %rax, 0x28(%rbx)                                — install tertiary vptr.
   *   @0x5279ae..@0x5279b4 epilogue: restore + ret.
   *
   * There is NO in-object member initialisation — the class adds no state
   * over what OZStyle already stores. (`OZStyle::OZStyle` owns everything
   * that isn't a vptr.)
   *
   * Per Rule 3 the ctor @0x527980 throws pending decode of the OZStyle base.
   */
  constructor(
    _factory: OZFactoryLike,
    _name: PCStringLike,
    _u32: number,
  ) {
    throw new Error(
      "OZRotoshapeStyle::OZRotoshapeStyle(OZFactory*, PCString&, u32) @Ozone 0x527980 " +
        "not yet transcribed — requires OZStyle base ctor @0x527989.",
    );
  }

  /**
   * OZRotoshapeStyle(OZRotoshapeStyle const&, unsigned int)
   * C2 body @0x527a00 (C1 wrapper @0x527a40 is an ICF sibling).
   *
   *   @0x527a06 movq  %rdi, %rbx
   *   @0x527a09 callq OZStyle::OZStyle(OZStyle const&, u32)  — base copy ctor
   *                                                             (up-cast to primary base is
   *                                                             a no-op because OZStyle
   *                                                             lives at offset 0).
   *   @0x527a0e leaq  0x354193(%rip), %rax                     — same 3 vptrs as the factory ctor:
   *   @0x527a15 movq  %rax, (%rbx)                              — install primary vptr @0x87bba8.
   *   @0x527a18 leaq  0x3542c1(%rip), %rax
   *   @0x527a1f movq  %rax, 0x10(%rbx)                          — install secondary vptr @0x87bce0.
   *   @0x527a23 leaq  0x35450e(%rip), %rax
   *   @0x527a2a movq  %rax, 0x28(%rbx)                          — install tertiary vptr @0x87bf38.
   *   @0x527a2e..@0x527a34 epilogue.
   *
   * Per Rule 3, the ctor @0x527a00 throws pending decode of the OZStyle
   * base copy.
   */
  static copyConstruct(
    _dst: OZRotoshapeStyle,
    _src: OZRotoshapeStyle,
    _u32: number,
  ): void {
    throw new Error(
      "OZRotoshapeStyle::OZRotoshapeStyle(OZRotoshapeStyle const&, u32) @Ozone 0x527a00 " +
        "not yet transcribed — requires OZStyle::OZStyle(OZStyle const&, u32) @0x527a09.",
    );
  }

  /**
   * OZRotoshapeStyle::~OZRotoshapeStyle()
   *
   *   D1 @0x527b40 (base dtor):
   *     `pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp OZStyle::~OZStyle`
   *     i.e. a thin tail-jmp to the OZStyle base dtor.
   *
   *   D0 @0x527b50 (deleting dtor):
   *     @0x527b56 movq  %rdi, %rbx
   *     @0x527b59 callq OZStyle::~OZStyle().
   *     @0x527b5e movq  %rbx, %rdi
   *     @0x527b67 jmp   __ZdlPv                                — operator delete(this).
   *
   *   The MI thunks are pure address-adjusts:
   *     thn16 D1 @0x527b70:  `addq $-0x10, %rdi ; jmp OZStyle::~OZStyle`
   *     thn40 D1 @0x527bb0:  `addq $-0x28, %rdi ; jmp OZStyle::~OZStyle`
   *     thn16 D0 @0x527b80:  `addq $-0x10, %rbx ; call OZStyle::~OZStyle ; jmp __ZdlPv`
   *     thn40 D0 @0x527bc0:  `addq $-0x28, %rbx ; call OZStyle::~OZStyle ; jmp __ZdlPv`
   *
   * NO member-level teardown — this class owns no per-instance storage.
   */
  destroy(): void {
    // @0x527b59 (D0) / @0x527b45 (D1) — tail-call OZStyle::~OZStyle.
    OZStyle_dtor(this);
    // @0x527b67 (D0 only) jmp __ZdlPv — handled by GC at JS layer.
  }

  /**
   * calcStaticHash(PCSerializerWriteStream&, std::list<OZObjectManipulator*>&) @0x527a80
   *
   *   @0x527a84 movq  %rsi, %rdi                                — rdi = &stream.
   *   @0x527a87 movq  &__ZTI23PCSerializerWriteStream(%rip), %rsi  — src static type.
   *   @0x527a8e movq  &__ZTI17PCHashWriteStream(%rip), %rdx        — dst dynamic type.
   *   @0x527a95 xorl  %ecx, %ecx                                — hint = 0.
   *   @0x527a97 callq __dynamic_cast.
   *   @0x527a9c testq %rax, %rax
   *   @0x527a9f je    0x527aab                                  — cast failed => bad_cast.
   *   @0x527aa1 movq  (%rax), %rcx                              — rcx = casted->vptr.
   *   @0x527aa4 movq  %rax, %rdi                                — rdi = casted this.
   *   @0x527aa7 popq  %rbp
   *   @0x527aa8 jmpq  *0x28(%rcx)                               — tail-call vtable[0x28].
   *   @0x527aab callq __cxa_bad_cast                            — never returns.
   *
   * The `std::list<OZObjectManipulator*>&` argument (rdx) is passed in but is
   * NEVER referenced by the body. Neither is `this` (rdi is overwritten with
   * the stream pointer before the cast). The method essentially forwards the
   * stream — the "static" hash component contributed by OZRotoshapeStyle is
   * whatever PCHashWriteStream::vtable[0x28] does with a bare receiver.
   */
  calcStaticHash(
    stream: PCSerializerWriteStreamLike,
    _manipulators: OZObjectManipulatorListLike,
  ): void {
    // @0x527a97 — down-cast: PCSerializerWriteStream* -> PCHashWriteStream*.
    const casted = dynamic_cast_PCSerializerWriteStream_to_PCHashWriteStream(stream);
    // @0x527a9f — on failure jump to bad_cast (never returns).
    if (casted === null) {
      cxa_bad_cast();
    }
    // @0x527aa8 — tail-call PCHashWriteStream::vtable[0x28] on the casted receiver.
    PCHashWriteStream_vtable_slot28(casted);
  }

  /**
   * calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, std::list<OZObjectManipulator*>&) @0x527ae0
   *
   *   @0x527ae4 movq  %rsi, %rdi                                — rdi = &stream.
   *   @0x527ae7 movq  &__ZTI23PCSerializerWriteStream(%rip), %rsi
   *   @0x527aee movq  &__ZTI17PCHashWriteStream(%rip), %rdx
   *   @0x527af5 xorl  %ecx, %ecx
   *   @0x527af7 callq __dynamic_cast.
   *   @0x527afc testq %rax, %rax
   *   @0x527aff je    0x527b0b                                  — cast failed => bad_cast.
   *   @0x527b01 movq  (%rax), %rcx
   *   @0x527b04 movq  %rax, %rdi
   *   @0x527b07 popq  %rbp
   *   @0x527b08 jmpq  *0x28(%rcx)                               — tail-call vtable[0x28].
   *   @0x527b0b callq __cxa_bad_cast.
   *
   * Body is byte-identical to `calcStaticHash` apart from the RIP-relative
   * offsets to the same two typeinfo objects. Both the `OZRenderParams`
   * argument (rdx) and the `std::list<OZObjectManipulator*>` argument (rcx)
   * are UNUSED — they are never read from the body — so OZRotoshapeStyle
   * contributes nothing dynamic-state-dependent to the hash: the render-time
   * behaviour reduces to the same PCHashWriteStream::vtable[0x28] call as the
   * static form.
   */
  calcHashForState(
    stream: PCSerializerWriteStreamLike,
    _renderParams: OZRenderParamsLike,
    _manipulators: OZObjectManipulatorListLike,
  ): void {
    // @0x527af7 — down-cast: PCSerializerWriteStream* -> PCHashWriteStream*.
    const casted = dynamic_cast_PCSerializerWriteStream_to_PCHashWriteStream(stream);
    // @0x527aff — on failure jump to bad_cast (never returns).
    if (casted === null) {
      cxa_bad_cast();
    }
    // @0x527b08 — tail-call PCHashWriteStream::vtable[0x28] on the casted receiver.
    PCHashWriteStream_vtable_slot28(casted);
  }
}
