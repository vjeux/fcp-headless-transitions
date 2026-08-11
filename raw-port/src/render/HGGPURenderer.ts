// HGGPURenderer.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGGPURenderer::GetMetalContext()           @Helium 0xa560
//     __ZN13HGGPURenderer15GetMetalContextEv
//   * HGGPURenderer::GetGLState() const          @Helium 0x12070
//     __ZNK13HGGPURenderer10GetGLStateEv
//   * HGGPURenderer::UsingSharedStorage() const  @Helium 0x17720
//     __ZNK13HGGPURenderer18UsingSharedStorageEv
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN13HGGPURenderer15GetMetalContextEv.s
//   raw-port/re/disasm/Helium.__ZNK13HGGPURenderer10GetGLStateEv.s
//   raw-port/re/disasm/Helium.__ZNK13HGGPURenderer18UsingSharedStorageEv.s
//
// -----------------------------------------------------------------------------
// FULL DISASM (7 lines, @0xa560..@0xa56c)
// -----------------------------------------------------------------------------
//   __ZN13HGGPURenderer15GetMetalContextEv:
//     0xa560  pushq  %rbp                     ; frame prologue
//     0xa561  movq   %rsp, %rbp
//     0xa564  movq   0x458(%rdi), %rax        ; rax = this[+0x458]
//     0xa56b  popq   %rbp                     ; frame epilogue
//     0xa56c  retq
//
// -----------------------------------------------------------------------------
// FULL DISASM (7 lines, @0x12070..@0x1207c)
// -----------------------------------------------------------------------------
//   __ZNK13HGGPURenderer10GetGLStateEv:
//     0x12070  pushq  %rbp                    ; frame prologue
//     0x12071  movq   %rsp, %rbp
//     0x12074  movq   0x490(%rdi), %rax       ; rax = this[+0x490]
//     0x1207b  popq   %rbp                    ; frame epilogue
//     0x1207c  retq
//     0x1207d  nopl   (%rax)                  ; alignment padding (not code)
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (recovered from the ported methods only)
// -----------------------------------------------------------------------------
//   +0x458  HGMetalContext*  metalContext   ; touched only by GetMetalContext.
//     Read @0xa564 (`movq 0x458(%rdi), %rax`). We do NOT invent adjacent
//     fields — one method, one field, one offset. Other HGGPURenderer
//     methods will add their own fields as they are ported.
//   +0x490  HGGLState*       glState        ; touched only by GetGLState.
//     Read @0x12074 (`movq 0x490(%rdi), %rax`). 8-byte load => pointer-sized.
//     Nothing between +0x458 and +0x490 is decoded by either method, so the
//     0x38 bytes in that span stay UNMODELLED (Rule 5 — no fabricated fields).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero, for BOTH methods. Each is a pure inline getter — no callees at all (no
// in-scope, no externs, no indirect calls). `depgraph.py deps` on
// __ZNK13HGGPURenderer10GetGLStateEv likewise lists nothing: 0 in-scope deps,
// 0 indirect, 0 out-of-scope externs; READY.

/**
 * `HGMetalContext` — opaque Metal-backed render-context handle. Not
 * modelled here (the concrete type lives in the Metal-context ledger
 * unit, currently `todo`). The port declares an opaque handle so
 * `GetMetalContext` has a legible return type; every downstream user
 * treats the value as an opaque pointer.
 *
 * A `unique symbol` phantom brand keeps this distinct from other opaque
 * handles at the type level — no observable runtime shape (the machine
 * just moves an 8-byte pointer around; we mirror that with a nominal-
 * typed reference).
 */
export interface HGMetalContext {
  readonly __hgMetalContext: unique symbol;
}

/**
 * `HGGLState` — opaque handle to Helium's OpenGL state object, the thing
 * `HGGPURenderer::GetGLState() const` @Helium 0x12070 hands back from
 * this[+0x490].
 *
 * PROVENANCE OF THE TYPE NAME: the disassembly itself proves only that the
 * slot is an 8-byte pointer-sized word (`movq 0x490(%rdi), %rax` @0x12074) —
 * a load has no type. The name comes from the method's own mangled symbol
 * (`__ZNK13HGGPURenderer10GetGLStateEv` → `GetGLState`) plus the fact that
 * `HGGLState` is a real, separately-mangled Helium class observed in the
 * binary's call graph (e.g. `__ZN9HGGLStateC1Ev` / `__ZN9HGGLStateD1Ev`
 * called from HGTransform's ctor @Helium 0x8d1d / 0xa2d8, and the nested
 * `__ZN9HGGLState22SetCurrentContextGuardC1EPS_14HGGLContextPtr` @0xaef7).
 * The Itanium mangling of GetGLState encodes no return type, so this is a
 * NAMED OPAQUE HANDLE, not a decoded struct — no fields are modelled and
 * none may be invented until HGGLState gets its own ledger unit.
 *
 * Branded like `HGMetalContext` above so the two opaque pointers can't be
 * interchanged at the type level; no observable runtime shape (the machine
 * just moves an 8-byte pointer).
 */
export interface HGGLState {
  readonly __hgGLState: unique symbol;
}

/**
 * `HGGPURenderer` — Helium GPU-backed renderer. Only the field touched
 * by `GetMetalContext` is decoded here; every other field is undecoded
 * and NOT modelled (per Rule 5 — no fabricated fields).
 */
export class HGGPURenderer {
  /**
   * @Helium offset +0x458 — the `HGMetalContext*` this renderer is
   * bound to. Read by `GetMetalContext` @0xa564 via
   * `movq 0x458(%rdi), %rax`.
   *
   * The `movq` load is 8-byte-wide, so the field is pointer-sized — a
   * heap reference to an opaque HGMetalContext instance (nullable
   * before the renderer is bound). The writer for this slot lives in a
   * different (not-yet-ported) HGGPURenderer method; its identity is
   * OUT OF SCOPE for this ledger unit.
   */
  metalContext_at_0x458: HGMetalContext | null = null;

  /**
   * `HGGPURenderer::GetMetalContext()` — @Helium 0xa560
   * (__ZN13HGGPURenderer15GetMetalContextEv).
   *
   * Faithful line-for-line transcription of the 7-line disassembly
   * quoted in the file header. Pure inline getter — returns the
   * `HGMetalContext*` stored at this[+0x458].
   *
   * No in-scope callees. No externs. No indirect calls. The disasm is
   * a single load-plus-return; we mirror that exactly (no defensive
   * null check — the machine reads the raw 8-byte word and returns
   * it, so if the slot is null we return null; C++ callers who
   * dereference before checking will crash exactly as the FCP binary
   * would).
   *
   * NB: the C++ signature is `GetMetalContext()` (non-const per its
   * mangling; the const variant would be `__ZNK13HGGPURenderer...`).
   * The single dependent read makes it functionally const anyway, but
   * we mirror the mangling — no `const` qualifier at the class level.
   */
  GetMetalContext(): HGMetalContext | null {
    // @0xa564  movq 0x458(%rdi), %rax
    //   rax = this->metalContext_at_0x458
    return this.metalContext_at_0x458;
  }

  /**
   * @Helium offset +0x490 — the `HGGLState*` this renderer owns. Read by
   * `GetGLState() const` @0x12074 via `movq 0x490(%rdi), %rax`.
   *
   * The load is 8-byte-wide, so the field is pointer-sized — a heap
   * reference to an opaque HGGLState instance (nullable before the
   * renderer builds its GL state). The writer for this slot lives in a
   * different (not-yet-ported) HGGPURenderer method — most likely the
   * ctor `__ZN13HGGPURendererC1E14HGGLContextPtrb`, which is OUT OF SCOPE
   * for this ledger unit — so nothing here initializes it beyond the
   * null default.
   */
  glState_at_0x490: HGGLState | null = null;

  /**
   * `HGGPURenderer::GetGLState() const` — @Helium 0x12070
   * (__ZNK13HGGPURenderer10GetGLStateEv).
   *
   * Faithful line-for-line transcription of the 7-line disassembly quoted
   * in the file header. Pure inline getter — returns the `HGGLState*`
   * stored at this[+0x490]:
   *
   *   0x12070  pushq %rbp                ; prologue — no semantic content
   *   0x12071  movq  %rsp, %rbp
   *   0x12074  movq  0x490(%rdi), %rax   ; THE one real instruction
   *   0x1207b  popq  %rbp                ; epilogue
   *   0x1207c  retq                      ; return rax
   *
   * No in-scope callees. No externs. No indirect calls. No branches, no
   * arithmetic, no flag-setting instruction — the whole body is one load
   * and a return, so there is nothing else to transcribe.
   *
   * As with `GetMetalContext`, there is deliberately NO defensive null
   * check: the machine reads the raw 8-byte word and returns it verbatim,
   * so a null slot yields null and a C++ caller that dereferences without
   * checking crashes exactly as the FCP binary would.
   *
   * NB on the mangling: this symbol is `__ZNK...` (K = const-qualified
   * `this`), unlike GetMetalContext's `__ZN...`. The const only constrains
   * the C++ type system; the emitted code is the same single load, and TS
   * has no const-member qualifier to mirror, so the distinction is
   * recorded here rather than in the signature.
   */
  GetGLState(): HGGLState | null {
    // @0x12074  movq 0x490(%rdi), %rax
    //   rax = this->glState_at_0x490
    return this.glState_at_0x490;
  }

  /**
   * @Helium offset +0x4f0 — a ONE-BYTE texture-storage hint. Read by
   * `UsingSharedStorage() const` @0x17724 via `cmpb $0x2, 0x4f0(%rdi)`, so the
   * field is a byte-wide enum, not a pointer or a bool.
   *
   * Its writers (each a separate, unported ledger unit) fix both the default
   * and the meaning of the value this getter tests for:
   *   * the ctor `HGGPURenderer::HGGPURenderer(unsigned long long, bool)` [C2]
   *     @0x8944 stores `movw $0x101,0x4f0(%rbx)` — a 16-bit store that sets
   *     THIS byte to 1 and its neighbour at +0x4f1 to 1. So the default hint is
   *     1, and +0x4f1 is a different field this unit must not disturb.
   *     (`HGGPURenderer::Init()` re-applies the same `movw $0x101` @0x9465.)
   *   * `HGGPURenderer::Init()` sets it to 2 — `movb $0x2,0x4f0(%rbx)` @0x9118
   *     — exactly when `HGMetalContext::deviceInfo()` @0x9107 →
   *     `HGMetalDeviceInfo::isIntel()` @0x910f returns true. An Intel
   *     integrated GPU shares physical memory with the CPU, which is what
   *     makes "2" mean SHARED storage.
   *   * `HGGPURenderer::InitTextureStorage()` @0x9e61 stores 2 the same way.
   *   * the environment override `HG_RENDERER_ENV::FORCE_TEXTURE_STORAGE_HINT`
   *     is copied in verbatim when it is not -1 — `movb %al,0x4f0(%rbx)`
   *     @0x9185 / @0x9ece — which is why the getter compares against a value
   *     rather than reading a bool.
   *   * `HGGPURenderer::SetParameter(HGRendererParameter, int)` @0xd16e writes
   *     it, and `HGGPURenderer::LoadTexture(HGRect, HGBitmap*, bool)` reads it
   *     @0xf7d7/@0xf7e1 (`cmpb $0x0` and `movzbl`), confirming the byte width
   *     and that 0 is a distinct third state.
   *
   * Modelled as a `number` holding the raw byte, defaulting to the ctor's 1.
   */
  textureStorageHint_at_0x4f0 = 1;

  /**
   * `HGGPURenderer::UsingSharedStorage() const` — @Helium 0x17720
   * (__ZNK13HGGPURenderer18UsingSharedStorageEv).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x17720  pushq %rbp             ; frame setup (no TS counterpart)
   *   0x17721  movq  %rsp,%rbp        ; frame setup (no TS counterpart)
   *   0x17724  cmpb  $0x2,0x4f0(%rdi) ; AT&T: computes this[+0x4f0] - 2
   *   0x1772b  sete  %al              ; al = (this[+0x4f0] == 2)
   *   0x1772e  popq  %rbp             ; frame teardown (no TS counterpart)
   *   0x1772f  retq                   ; returns the bool in %al
   *
   * Decode notes:
   *   * `cmpb` is a BYTE compare against the immediate 2 and `sete` keys on ZF
   *     alone, so this is an exact equality test on one byte — not a
   *     "non-zero" test and not a bitmask. Any other hint value (the default 1
   *     @0x8944, the 0 that LoadTexture @0xf7d7 tests for, or an arbitrary
   *     forced value from HG_RENDERER_ENV::FORCE_TEXTURE_STORAGE_HINT @0x9185)
   *     yields false.
   *   * `this` is read and never written; nothing else on the instance is
   *     touched. No callq, no in-scope dependency, no extern, no indirect or
   *     virtual dispatch (`depgraph.py deps` lists nothing).
   *   * the port masks the field to 8 bits before comparing because the machine
   *     only ever looks at the one byte at +0x4f0 — the neighbouring byte at
   *     +0x4f1 that the ctor's 16-bit `movw $0x101` also writes is NOT part of
   *     this test.
   *
   * @returns %al — true iff the +0x4f0 storage hint is exactly 2 (the value
   *          Init() installs for an Intel GPU @0x9118).
   */
  UsingSharedStorage(): boolean {
    // @0x17724..@0x1772b  cmpb $0x2,0x4f0(%rdi) ; sete %al
    return (this.textureStorageHint_at_0x4f0 & 0xff) === 0x2;
  }
}
