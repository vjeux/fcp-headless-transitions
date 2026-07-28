// OZLightingStyle.ts — Ozone's lighting-style bank.
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SHAPE
// -----------------------------------------------------------------------------
// OZLightingStyle is a NAMESPACE-LEVEL / static helper class: it exposes
// exactly two functions and holds no per-instance state.  Both are effectively
// static (no `this` field is read):
//
//   * `getLights(int style)`                 @0x1c13c2  (32-byte function
//        prologue at 0x1c13c0 padding + 0x1c13c2 body start;  the symbol map
//        `Ozone::__ZN15OZLightingStyle9getLightsEi` reports the entry as
//        0x1c13c0 — the `otool -tV` output has no label there because the
//        preceding function's tail padding absorbed it, but the body is
//        clearly a switch on `%esi` (the light-style enum, 0..0xb).
//   * `getLightSet(int style, FxColorDescription const& colorDesc)`
//                                            @0x1c4170  — wraps `getLights` and
//        assembles an owned `LiLightSet` from the returned OZLight* array.
//
// -----------------------------------------------------------------------------
// getLights(int style)  @0x1c13c2   — HUGE UNDECODED FRONTIER
// -----------------------------------------------------------------------------
// The compiled body is a ~2,300-line jump-table switch on `%esi` (values
// 0..0xb) that constructs up to a dozen distinct `LightingStyleLight` records
// per case, each holding a PCColor triple (PCColorSpaceCache::cgRec709Linear),
// a PCString name, a PCVector3-family position/direction/scale triple, and
// an intensity double.  It returns a heap-allocated `std::vector<OZLight*>`
// via SRVO in %rdi.  The switch dispatches through
//
//     leaq  0x2ae0(%rip), %rcx     ;  @0x1c13fd — jump-table base
//     movslq (%rcx,%rax,4), %rax
//     addq  %rcx, %rax
//     jmpq  *%rax                   ;  @0x1c140b
//
// Each arm calls a long list of Ozone constructors — none of which are yet
// ported: PCColorSpaceCache::cgRec709Linear (@0x6de2fe stub), PCColor::PCColor
// (@0x6dee92), PCString::PCString (@0x6df09c), PCVector3<double>::PCVector3,
// LightingStyleLight::LightingStyleLight, and the
// std::vector<LightingStyleLight>::emplace_back_slow_path @0x1c42e0 that
// backs each push.  Decoding this cleanly would require porting the entire
// PCColor / PCString / LightingStyleLight subsystem AND the 12-arm
// content of each preset, which is well beyond a single class port.  We
// throw-stub with the citation and leave the shape entry so downstream
// consumers get a real, honest crash pointing at the frontier.
//
// -----------------------------------------------------------------------------
// getLightSet(int style, FxColorDescription const& colorDesc)
// @0x00000000001c4170  — returns LiLightSet by value (SRVO in %rdi)
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Ozone_tV.txt line 470406):
//     pushq %rbp / movq %rsp,%rbp
//     pushq %r15 / pushq %r14 / pushq %r13 / pushq %r12 / pushq %rbx
//     subq  $0x4e8, %rsp                                       ; local frame
//     movq  %rdx, -0x48(%rbp)                                  ; save colorDesc*
//
//     ; -- construct the empty LiLightSet at *rdi (the SRVO return slot) --
//     leaq  vtable-for-PCArray<LiLight, PCArray_Traits<LiLight>>(%rip), %rax
//     addq  $0x10, %rax                                        ; installed vptr
//     movq  %rax, (%rdi)                                       ; LiLightSet.vptr
//     xorps %xmm0, %xmm0
//     movups %xmm0, 0x8(%rdi)                                  ; LiLightSet.begin/end = NULL,NULL
//     movq  %rdi, -0x30(%rbp)                                  ; save this
//     movb  $0x0, 0x18(%rdi)                                   ; LiLightSet.tail-flag = 0
//
//     ; -- call getLights(style) into a local vector at -0x60(%rbp) --
//     leaq  -0x60(%rbp), %rdi
//     callq __ZN15OZLightingStyle9getLightsEi
//     movq  -0x60(%rbp), %r14                                  ; r14 = lights.begin (OZLight**)
//     movq  -0x58(%rbp), %rax                                  ; rax = lights.end
//     movq  %rax, -0x40(%rbp)
//     subq  %r14, %rax
//     sarq  $3, %rax                                            ; count = (end - begin) / 8
//     movq  %rax, -0x38(%rbp)
//     testl %eax, %eax / jle 0x1c4237                          ; skip loop if empty
//
//     ; -- FOR EACH light: set working color space, build LiLight, add to set --
//     movq  -0x38(%rbp), %rbx / andl $0x7fffffff, %ebx          ; ebx = |count| (signed clamp)
//     xorl  %r15d, %r15d                                       ; i = 0
//     leaq  -0x168(%rbp), %r12                                 ; r12 = &renderState
//     leaq  -0x510(%rbp), %r13                                 ; r13 = &tmpLiLight
//   loop @0x1c41f0:
//     movq  (%r14, %r15, 8), %rdi                              ; lights[i]
//     movq  -0x48(%rbp), %rsi                                  ; colorDesc*
//     callq __ZN7OZLight31setLightWorkingColorDescriptionERK18FxColorDescription
//     movq  %r12, %rdi                                         ; renderState
//     callq __ZN13OZRenderStateC1Ev                            ; OZRenderState()
//     movq  (%r14, %r15, 8), %rsi                              ; OZLight*
//     movq  %r13, %rdi / movq %r12, %rdx
//     callq __ZNK7OZLight12buildLiLightERK13OZRenderState      ; tmpLiLight = light->buildLiLight(rs)
//     movb  $0x1, -0x240(%rbp)                                 ; frame-owns-tmpLiLight = true
//     movq  -0x30(%rbp), %rdi                                  ; this LiLightSet*
//     movq  %r13, %rsi                                         ; &tmpLiLight
//     callq _stub_LiLightSet_add                               ; LiLightSet::add(LiLight const&)
//     movq  %r13, %rdi
//     callq _stub_LiLight_dtor                                 ; ~LiLight()
//     incq  %r15 / cmpq %r15, %rbx / jne 0x1c41f0
//
//     ; -- Cleanup the OZLight* vector (delete each pointer via *vptr[0x8], free storage) --
//   after_loop @0x1c4237:
//     cmpq  %r14, -0x40(%rbp) / je 0x1c4269                     ; empty vector?
//     xorl  %ebx, %ebx / movq -0x38(%rbp), %r15                 ; i = 0; count
//     jmp   0x1c4258
//   free_loop @0x1c4250:
//     incq  %rbx / cmpq %rbx, %r15 / je 0x1c426e
//   @0x1c4258:
//     movq  (%r14, %rbx, 8), %rdi                              ; OZLight* p = lights[i]
//     testq %rdi, %rdi / je 0x1c4250                            ; if null skip
//     movq  (%rdi), %rax                                       ; vptr
//     callq *0x8(%rax)                                         ; delete via D0 slot (*0x8)
//     jmp   0x1c4250
//   @0x1c4269:
//     testq %r14, %r14 / je 0x1c4276
//     movq  %r14, %rdi / callq _stub_operator_delete           ; free the OZLight** buffer
//   @0x1c4276:
//     movq  -0x30(%rbp), %rax                                  ; return LiLightSet*
//     ...pop / ret
//
// The unwind/landingpad tail (@0x1c428c..@0x1c42d7) mirrors the same cleanup
// under exception unwinding; it's the ABI standard EH suffix and doesn't
// affect the happy-path semantics.
//
// -----------------------------------------------------------------------------
// TypeScript port
// -----------------------------------------------------------------------------

/** `FxColorDescription` — Apple FxPlug color-space descriptor. Not decoded. */
export type FxColorDescription = { readonly __brand: "FxColorDescription" };

/**
 * `OZLight` — an Ozone light source. Not yet ported.  Its full vtable is
 * used at multiple call sites in `getLightSet`:
 *   *0x08 -> deleting destructor
 *   the concrete member `setLightWorkingColorDescription(FxColorDescription const&)`
 *   the const member `buildLiLight(OZRenderState const&) const`
 * All required call sites throw-stub below when the runtime path is hit.
 */
export type OZLight = { readonly __brand: "OZLight" };

/**
 * `LiLight` — a Lithium engine light record built from an OZLight.  Not yet
 * ported.  Constructed by `OZLight::buildLiLight` @0x1c420f and added to the
 * LiLightSet via `LiLightSet::add` (stub 0x6dd386).  Its destructor is stub
 * 0x6debf2.
 */
export type LiLight = { readonly __brand: "LiLight" };

/**
 * `LiLightSet` — a `PCArray<LiLight>` derivative with tail-flag byte at +0x18.
 * The vtable installed in the SRVO slot is `PCArray<LiLight, PCArray_Traits<LiLight>>`
 * (`__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE` + 0x10).  Not yet ported —
 * we expose an opaque handle shape and a throw-stub `add`.
 */
export interface LiLightSet {
  /** @native +0x00 — PCArray vptr (installed at vtable+0x10). Opaque here. */
  vptr: unknown;
  /** @native +0x08 — begin pointer (LiLight*) — null in the freshly-built empty set. */
  begin: null;
  /** @native +0x10 — end pointer (LiLight*) — null in the freshly-built empty set. */
  end: null;
  /** @native +0x18 — one-byte trailing flag/pad; init 0 @0x1c41a1. */
  flag: number;
}

/**
 * @asm __ZN10LiLightSet3addERK7LiLight  (stub @0x6dd386)
 * Add a copy of `light` to `set`.  Not yet ported.
 */
function LiLightSet_add_stub(_set: LiLightSet, _light: LiLight): void {
  throw new Error(
    "LiLightSet::add(LiLight const&) @stub 0x6dd386 — not yet ported. " +
      "Required by OZLightingStyle::getLightSet @0x1c4222.",
  );
}

/**
 * @asm __ZN7OZLight31setLightWorkingColorDescriptionERK18FxColorDescription
 *  — Ozone.framework internal callsite @0x1c41f8.
 */
function OZLight_setLightWorkingColorDescription_stub(
  _light: OZLight,
  _cd: FxColorDescription,
): void {
  throw new Error(
    "OZLight::setLightWorkingColorDescription(FxColorDescription const&) — " +
      "not yet ported. Required by OZLightingStyle::getLightSet @0x1c41f8.",
  );
}

/**
 * @asm __ZN13OZRenderStateC1Ev  — Ozone default-ctor for OZRenderState, called
 * per-light @0x1c4200 to give buildLiLight a fresh render state.
 */
function OZRenderState_default_ctor_stub(): unknown {
  throw new Error(
    "OZRenderState::OZRenderState() — not yet ported. " +
      "Required by OZLightingStyle::getLightSet @0x1c4200.",
  );
}

/**
 * @asm __ZNK7OZLight12buildLiLightERK13OZRenderState — const member @0x1c420f.
 */
function OZLight_buildLiLight_stub(_light: OZLight, _rs: unknown): LiLight {
  throw new Error(
    "OZLight::buildLiLight(OZRenderState const&) const — not yet ported. " +
      "Required by OZLightingStyle::getLightSet @0x1c420f.",
  );
}

/**
 * @asm __ZN7LiLightD1Ev  (stub @0x6debf2) — destroys the temp LiLight after add.
 */
function LiLight_dtor_stub(_l: LiLight): void {
  throw new Error(
    "LiLight::~LiLight() @stub 0x6debf2 — not yet ported. " +
      "Required by OZLightingStyle::getLightSet @0x1c422a.",
  );
}

/**
 * `PCArray<LiLight, PCArray_Traits<LiLight>>` vptr (`__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE`
 * + 0x10) — the installed pointer written at 0x1c4193.  Represented as an
 * opaque sentinel; a real port must instantiate this array type.
 */
const LILIGHTSET_INSTALLED_VPTR: unknown = Object.freeze({
  __installed_vtable_of:
    "PCArray<LiLight, PCArray_Traits<LiLight>>  (installed = __ZTV + 0x10)",
  ozone_addr: 0x1c4188,
});

/**
 * Ozone `OZLightingStyle` — namespace-like helper (no per-instance state).
 * Everything is expressed as static-side operations because the compiled
 * body never reads a `this` field.
 */
export const OZLightingStyle = {
  /**
   * `OZLightingStyle::getLights(int style)`  @Ozone 0x1c13c0 / body @0x1c13c2.
   *
   * ~2,300 lines of undecoded switch-table construction of a
   * `std::vector<OZLight*>` populated with per-style LightingStyleLight
   * records (PCColor + PCString name + PCVector3 xyz + intensity).  See
   * the module-level comment for the full frontier list.
   *
   * Throws with the citation until PCColor / PCString / PCVector3 /
   * LightingStyleLight / OZLight are ported.  This function IS the shape
   * of the light-preset registry; any downstream that needs it should
   * see a real crash pointing at the missing decode work.
   */
  getLights(style: number): OZLight[] {
    // The compiled function bounds-checks first: `cmpl $0xb, %esi ; ja 0x1c3b7a`.
    // Style 0..11 is valid; anything else falls into a big error/default block
    // (not yet decoded).  We mirror the bounds-check to expose the API contract,
    // then throw with the concrete address for any valid style.
    if (style >>> 0 > 0xb) {
      // The compiled `ja 0x1c3b7a` fallout — an OOB style value ends up in an
      // error path that is also undecoded.  Throwing with citation is faithful.
      throw new Error(
        `OZLightingStyle::getLights: style=${style} exceeds 0xb bounds ` +
          `(see Ozone @0x1c13f2 cmpl / ja 0x1c3b7a — OOB fallthrough undecoded).`,
      );
    }
    throw new Error(
      "OZLightingStyle::getLights(int) @Ozone 0x1c13c0 — not yet ported. " +
        "12-arm switch @0x1c1404 constructing OZLight* vector via PCColor / " +
        "PCString / PCVector3 / LightingStyleLight (all undecoded frontier).",
    );
  },

  /**
   * `OZLightingStyle::getLightSet(int style, FxColorDescription const&)`
   *  @Ozone 0x1c4170  →  returns LiLightSet by value.
   *
   * Faithful mirror of the compiled body:
   *   1. Construct an empty LiLightSet on the return slot (vptr installed,
   *      begin/end nulled, trailing flag byte cleared).
   *   2. Call `getLights(style)` to get a std::vector<OZLight*>.
   *   3. For each light in that vector:
   *        light.setLightWorkingColorDescription(colorDesc);
   *        rs = OZRenderState();
   *        tmp = light.buildLiLight(rs);
   *        lightSet.add(tmp);
   *        tmp.~LiLight();
   *   4. Destroy the vector's contents (delete each OZLight* via its D0 slot)
   *      and free the storage buffer.
   *   5. Return the LiLightSet.
   *
   * All the downstream calls (getLights, setLightWorkingColorDescription,
   * OZRenderState ctor, buildLiLight, LiLightSet::add, ~LiLight) throw-stub
   * with their addresses; the CONTROL FLOW here is fully decoded and
   * verbatim, and passing a valid style through this function will crash
   * inside getLights (the first frontier hit).
   */
  getLightSet(style: number, colorDesc: FxColorDescription): LiLightSet {
    // @0x1c4188..@0x1c41a5 — allocate an empty LiLightSet on the "return slot".
    const set: LiLightSet = {
      vptr: LILIGHTSET_INSTALLED_VPTR,
      begin: null,
      end: null,
      flag: 0,
    };

    // @0x1c41a9 — call getLights(style).  This is the throw-stub frontier —
    // any invocation with a well-formed style will crash here until PCColor,
    // PCString, PCVector3, LightingStyleLight and OZLight are ported.
    const lights: OZLight[] = OZLightingStyle.getLights(style);

    // @0x1c41ba-0x1c41c7 — count = (end - begin) / 8; if count <= 0 skip loop.
    // Signed-clamped iteration count (`andl $0x7fffffff, %ebx`).
    const count = Math.min(lights.length, 0x7fffffff);

    // @0x1c41f0..@0x1c4235 — for i in 0..count: setColor, buildLiLight, add, ~tmp
    for (let i = 0; i < count; i++) {
      const light = lights[i];
      // @0x1c41f8
      OZLight_setLightWorkingColorDescription_stub(light, colorDesc);
      // @0x1c4200
      const rs = OZRenderState_default_ctor_stub();
      // @0x1c420f
      const tmpLiLight = OZLight_buildLiLight_stub(light, rs);
      // @0x1c4222
      LiLightSet_add_stub(set, tmpLiLight);
      // @0x1c422a
      LiLight_dtor_stub(tmpLiLight);
    }

    // @0x1c4237..@0x1c4276 — destroy the OZLight vector's contents and free
    // the storage.  In the compiled ABI this reads each light's vptr and jumps
    // to *0x8 (D0 destructor).  We don't have those subclasses ported yet;
    // faithfully citing the call site is the honest thing to do.
    for (let i = 0; i < count; i++) {
      const p = lights[i];
      if (p != null) {
        // @0x1c4261..@0x1c4264: `movq (%rdi),%rax ; callq *0x8(%rax)`
        // This is the deleting destructor call through the light's vtable.
        // Not portable without the concrete OZLight subclass vtables.
        // Non-null lights would trigger this branch under real evaluation;
        // since getLights itself has already thrown above for real style
        // values, this loop is unreachable in practice — but keep the shape.
        void p; // decode-preserving no-op; the real branch would delete p.
      }
    }
    // @0x1c4271 — operator delete on the OZLight** buffer.  In JS the array
    // is GCed automatically; this is a no-op equivalent to the compiled path.

    // @0x1c4276 — return the LiLightSet.
    return set;
  },
};
