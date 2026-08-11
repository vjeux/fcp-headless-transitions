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
//   * HGGPURenderer::GetMetalHandler() const     @Helium 0x11d30
//     __ZNK13HGGPURenderer15GetMetalHandlerEv
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN13HGGPURenderer15GetMetalContextEv.s
//   raw-port/re/disasm/Helium.__ZNK13HGGPURenderer10GetGLStateEv.s
//   raw-port/re/disasm/Helium.__ZNK13HGGPURenderer18UsingSharedStorageEv.s
//   raw-port/re/disasm/Helium.__ZNK13HGGPURenderer15GetMetalHandlerEv.s
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
// FULL DISASM (6 lines, @0x11d30..@0x11d3c)
// -----------------------------------------------------------------------------
//   __ZNK13HGGPURenderer15GetMetalHandlerEv:
//     0x11d30  pushq  %rbp                    ; frame prologue
//     0x11d31  movq   %rsp, %rbp
//     0x11d34  movq   0x520(%rdi), %rax       ; rax = this[+0x520]
//     0x11d3b  popq   %rbp                    ; frame epilogue
//     0x11d3c  retq
//     0x11d3d  nopl   (%rax)                  ; alignment padding (not code)
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

import { HGMetalSharedEvent } from "./HGMetalSharedEvent.js";

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
 * `HGMetalHandler` — opaque handle to Helium's Metal command handler, the object
 * `HGGPURenderer::GetMetalHandler() const` @Helium 0x11d30 hands back from this[+0x520].
 *
 * PROVENANCE OF THE TYPE NAME (a load has no type, so the name is evidence-backed, not guessed):
 * the SLOT's writer is `HGGPURenderer::InitMetal()` @Helium 0x9d8f..0x9dab, which allocates
 * 0x790 bytes with `operator new` (`movl $0x790, %edi ; callq __Znwm`), passes the renderer's own
 * `HGMetalContext*` from +0x458 (`movq 0x458(%rbx), %rsi`), calls
 * `__ZN14HGMetalHandlerC1EP14HGMetalContext` — i.e. `HGMetalHandler::HGMetalHandler(
 * HGMetalContext*)` — and stores the result with `movq %r14, 0x520(%rbx)` @0x9dab. That
 * matched 8-byte store/load pair is what fixes both the offset and the width, and the ctor's own
 * mangled name is what fixes the type.
 *
 * Nothing about the pointee is modelled: HGMetalHandler is its own (not yet ported) ledger unit,
 * and inventing fields for a 0x790-byte object from a single load would be exactly the
 * magic-offset guesswork PORTING_SPEC Rule 5 forbids. Branded like the two handles above so the
 * opaque pointers cannot be interchanged at the type level.
 */
export interface HGMetalHandler {
  readonly __hgMetalHandler: unique symbol;
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
   * @Helium offset +0x520 — the `HGMetalHandler*` this renderer owns. Read by
   * `GetMetalHandler` @0x11d34 via `movq 0x520(%rdi), %rax`, and written by `InitMetal`
   * @0x9dab via `movq %r14, 0x520(%rbx)` after `HGMetalHandler::HGMetalHandler(HGMetalContext*)`
   * constructs a fresh 0x790-byte instance from this[+0x458].
   *
   * NULLABLE, and that is not a modelling convenience: the slot is only filled by `InitMetal`,
   * and the dtor @0xa0d7/@0xa235 plus `FinishMetalCommandBuffer` @0xa4c5, `RenderEnd` @0xc22b,
   * `FrameEnd` @0xc3d9/@0xc42d, `WaitForCommandBuffers` @0xc4d2, `FlushMetalCommandBuffer`
   * @0x106eb and `ReadbackMetalTexture` @0xb84f all load it, so a renderer that never ran
   * InitMetal hands back whatever the ctor left there. The getter below does NOT null-check —
   * neither does the machine.
   */
  metalHandler_at_0x520: HGMetalHandler | null = null;

  /**
   * @Helium offset +0x590 — int32, the renderer's MAXIMUM multi-sample count.
   *
   * Three decoded sites fix the width, the signedness and the meaning, and none of them is this
   * getter alone (each is its own ledger unit; cited here as evidence):
   *   * the ctor `HGGPURenderer(unsigned long long, bool)` @Helium 0x88a0 initialises it with
   *     `movabsq $-0x100000000,%rax ; movq %rax,0x590(%rbx)` @0x89b9/@0x89c3 — one 8-byte store
   *     whose LOW half is 0 and whose HIGH half (+0x594) is 0xFFFFFFFF, so this field starts at 0
   *     and its neighbour starts at -1;
   *   * `BindMultiSampleBuffer(int, bool, bool)` @0x116d0 consumes it as a CLAMP:
   *     `movl 0x590(%rbx),%eax ; cmpl %r13d,%eax ; cmovll %eax,%r13d` @0x11770..@0x11779 — and
   *     `cmovl` is the SIGNED conditional move, so the requested sample count is lowered to this
   *     value when this value is smaller, comparing as int32 rather than uint32;
   *   * this getter reads it with `movl`, a 32-bit load.
   * Hence `number` holding a SIGNED int32, and hence the `| 0` in the getter rather than `>>> 0`.
   */
  maxMultiSamples_at_0x590 = 0;

  /**
   * `HGGPURenderer::GetMaxMultiSamples() const` — @Helium 0x197d0
   *   `__ZNK13HGGPURenderer18GetMaxMultiSamplesEv`
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x197d0  pushq %rbp                    ; frame setup (no TS counterpart)
   *   0x197d1  movq  %rsp,%rbp               ; frame setup (no TS counterpart)
   *   0x197d4  movl  0x590(%rdi),%eax        ; return *(int32*)(this + 0x590)
   *   0x197da  popq  %rbp                    ; frame teardown (no TS counterpart)
   *   0x197db  retq
   *   0x197dc  nopl  (%rax)                  ; alignment padding, not executed
   *
   * A single 32-bit field read: no clamp, no branch, no callee, no indirect or virtual dispatch
   * (`depgraph.py deps` lists nothing). The clamping happens in the CALLER
   * (`BindMultiSampleBuffer` @0x11770) — this getter hands the raw stored value back, negative
   * values included, and the port must not "helpfully" clamp what the machine does not.
   *
   * `movl` into a 32-bit register is width-exact, so the value is the int32 at that offset; `| 0`
   * models that width, and SIGNED because the consumer compares it with `cmovl`.
   *
   * ORACLE (executed against live FCP, not read). The symbol is exported (`T`), so it was dlsym'd
   * from Helium in a Rosetta x86_64 process — `arch -x86_64 /usr/bin/python3`. A 0x200-byte object
   * poisoned with 0xCD, its int32 at +0x590 set to each of 0, 1, 4, INT32_MAX, 0xFFFFFFFF and
   * 0x80000000: live Helium returned 0, 1, 4, 2147483647, **-1** and **-2147483648** — i.e. it
   * really is a SIGNED int32, which is the one thing a reader could get wrong here. A byte-diff of
   * the object afterwards showed it UNMODIFIED (it is a const getter, and that is checked, not
   * assumed). NEGATIVE CONTROL: with a different value planted at the +0x594 neighbour — the half
   * the ctor sets to -1 — the return was still the +0x590 value, so the offset is pinned by
   * measurement and not just by reading the displacement.
   *
   * @returns the int32 stored at `this + 0x590`, verbatim.
   */
  GetMaxMultiSamples(): number {
    // @0x197d4  movl 0x590(%rdi),%eax : one 32-bit field read, returned unchanged.
    return this.maxMultiSamples_at_0x590 | 0;
  }

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

  /**
   * `HGGPURenderer::GetMetalHandler() const` — @Helium 0x11d30
   * (__ZNK13HGGPURenderer15GetMetalHandlerEv).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x11d30  pushq %rbp             ; frame setup (no TS counterpart)
   *   0x11d31  movq  %rsp,%rbp        ; frame setup (no TS counterpart)
   *   0x11d34  movq  0x520(%rdi),%rax ; rax = this[+0x520]
   *   0x11d3b  popq  %rbp             ; frame teardown (no TS counterpart)
   *   0x11d3c  retq                   ; returns the pointer in %rax
   *   0x11d3d  nopl  (%rax)           ; alignment padding (not code)
   *
   * Decode notes:
   *   * A single 8-byte load and a return. No branch, no null check, no callq, no extern, no
   *     indirect or virtual dispatch (`depgraph.py deps` lists nothing) — the value is handed
   *     back RAW, null included. Adding a guard the binary does not have would be a rewrite.
   *   * `const` in the mangled name (`__ZNK...`) and in the body: `this` is only read.
   *   * The structural twin of `GetMetalContext` @0xa560 and `GetGLState` @0x12070 above, one
   *     slot over; the only thing that differs is the offset and therefore the handle type.
   *
   * ORACLE: verified against the live Helium binary. The symbol is EXPORTED
   * (raw-port/army/inventory/Helium.syms.txt: `0000000000011d30 T`), so the harness dlopens
   * Helium under `arch -x86_64 /usr/bin/python3` — the port is transcribed from the x86_64 slice
   * and calling the arm64 image would compare against code this port did not transcribe — and
   * calls the real method on a 0x600-byte object POISONED with 0xEE, with a distinct sentinel
   * written into +0x520 for each case. See
   * raw-port/re/oracle/HGGPURenderer_GetMetalHandler_oracle.py: 1,000 sentinels (0, 1, -1, the
   * canary patterns, and seeded-random 64-bit values) all round-trip exactly, the poison at every
   * other offset never leaks into the result, and writing the SAME sentinel to the neighbouring
   * slots +0x518 / +0x528 while leaving +0x520 alone does not change the answer — which is what
   * pins the offset rather than merely being consistent with it.
   *
   * @returns %rax — the `HGMetalHandler*` at this[+0x520], unfiltered.
   */
  GetMetalHandler(): HGMetalHandler | null {
    // @0x11d34  movq 0x520(%rdi),%rax — returned raw, exactly as loaded.
    return this.metalHandler_at_0x520;
  }

  /**
   * @Helium offset +0x530 — the `HGMetalSharedEvent*` this renderer signals at the end of a
   * render pass (the "render event").
   *
   * THE TYPE IS NAMED BY THE BINARY, twice, so it is not inferred from the getter alone:
   *   * `HGGPURenderer::InitMetal()` @Helium 0x9b30 builds one and stores it here —
   *     `callq __ZN18HGMetalSharedEventC1E15HGMTLDeviceType` @0x9ce2 (i.e.
   *     `HGMetalSharedEvent::HGMetalSharedEvent(HGMTLDeviceType)`) followed by
   *     `movq %r14, 0x530(%rbx)` @0x9ce7 — the matched 8-byte store that fixes offset, width and
   *     type at once.
   *   * `HGGPURenderer::EncodeRenderEventSignal()` @Helium 0x11dc0 loads it into the receiver
   *     register — `movq 0x530(%rdi), %rdi` @0x11dd4 — and calls
   *     `__ZN18HGMetalSharedEvent6signalE21HGMTLCommandQueueType` @0x11df2 on it.
   *
   * NULLABLE, and the binary says so rather than this port assuming it: the constructor
   * `HGGPURenderer::HGGPURenderer(unsigned long long, bool)` @Helium 0x88a0 zeroes it as part of
   * the 16-byte `movups %xmm0, 0x528(%rbx)` @0x8977 (which covers +0x528 and +0x530), only
   * `InitMetal` ever fills it, and `EncodeRenderEventSignal` @0x11ddb explicitly tests it with
   * `testq %rdi, %rdi ; setne %cl` before using it. A renderer that never ran `InitMetal` therefore
   * holds null here — which is exactly what {@link HGGPURenderer.GetRenderEvent} hands back,
   * unfiltered.
   *
   * Typed with the real in-tree class rather than a branded opaque handle (the convention the
   * un-ported `HGMetalHandler`/`HGMetalContext` pointees above use) because this pointee IS ported:
   * `src/render/HGMetalSharedEvent.ts`. Nothing here models its internals — but note the sibling
   * `HGGPURenderer::GetLastRenderEventSignalValue() const` @Helium 0x11ec0, which is
   * `movq 0x530(%rdi),%rax ; movq 0x10(%rax),%rax`: it reads the +0x10 slot that
   * HGMetalSharedEvent.ts records as "zeroed by the ctor's 16-byte movups and never written again
   * by any decoded instruction here; role unknown". That sibling is its own ledger unit, and this
   * note is evidence for whoever claims it, not a change to that file.
   */
  renderEvent_at_0x530: HGMetalSharedEvent | null = null;

  /**
   * `HGGPURenderer::GetRenderEvent()` — @Helium 0x11eb0
   *   (__ZN13HGGPURenderer14GetRenderEventEv)
   *
   * One load: hand back the `HGMetalSharedEvent*` at +0x530, unchanged.
   *
   * FULL DISASM (raw-port/re/disasm/Helium.__ZN13HGGPURenderer14GetRenderEventEv.s — 6 lines:
   * the label plus five instructions), every instruction accounted for:
   *
   *   0x11eb0  55              pushq %rbp              ; frame setup (no TS counterpart)
   *   0x11eb1  48 89 e5        movq  %rsp, %rbp
   *   0x11eb4  48 8b 87 30 05 00 00
   *                            movq  0x530(%rdi), %rax ; rax = this->renderEvent_at_0x530
   *   0x11ebb  5d              popq  %rbp              ; epilogue (no TS counterpart)
   *   0x11ebc  c3              retq                    ; the loaded qword IS the return value
   *   0x11ebd  0f 1f 00        nopl  (%rax)            ; alignment pad — not executed
   *
   * THE BODY IS COMPLETE: the thirteen instruction bytes run 0x11eb0..0x11ebc, the three-byte
   * `nopl` pads to 0x11ec0, and the next symbol starts at exactly 0x11ec0
   * (`__ZNK13HGGPURenderer29GetLastRenderEventSignalValueEv`) — no room for anything else. The
   * disp32 form of the load (`48 8b 87 30 05 00 00`) is what a displacement above 0x7f requires,
   * and it is the only place the offset appears.
   *
   * NO NULL CHECK, NO RETAIN, NO SIDE EFFECT — there is no branch and no call in the body. A
   * renderer that never ran `InitMetal` gets null back (see the field note above); adding a guard
   * or a fallback here would be an instruction the machine does not execute.
   *
   * NOT `const`: the mangled name is `__ZN…` and not `__ZNK…`, unlike the sibling getters
   * `GetMetalHandler` @0x11d30 and `GetLastRenderEventSignalValue` @0x11ec0. The body reads and
   * writes nothing regardless; the qualifier is a signature fact, recorded because it is the one
   * way this symbol's name differs from its neighbours.
   *
   * DEPENDENCIES: none (`depgraph.py deps __ZN13HGGPURenderer14GetRenderEventEv` lists nothing).
   *
   * MEASURED AGAINST THE LIVE BINARY.
   * `raw-port/re/oracle/HGGPURenderer_GetRenderEvent_oracle.py` (under
   * `arch -x86_64 /usr/bin/python3`) dlsym's this exported `T` symbol, checks the address is
   * slide+0x11eb0 and that the 13 mapped opcode bytes are the ones listed above, then runs two
   * families over a 0xEE-poisoned 0x600-byte arena standing in for the renderer:
   *   * VALUE ROUND-TRIP (live only — a JS reference has no bit pattern to compare): 14 sentinels
   *     planted at +0x530, each returned bit-for-bit, including 0 (no substitution for null),
   *     0xFFFFFFFFFFFFFFFF (no sign or width mangling) and the poison word itself;
   *   * SLOT IDENTITY, as a TS-vs-binary DIFFERENTIAL: with a DISTINCT value in each of +0x458,
   *     +0x520, +0x528, +0x530 and +0x538, the live function must return the +0x530 one — and the
   *     REAL TypeScript below, driven by `HGGPURenderer_GetRenderEvent_driver.mts` with a distinct
   *     object in each modelled field, must return the object from the same slot. The arena is
   *     byte-identical after every call.
   * Five negative controls (read +0x520, read +0x458, null the result, fabricate a fresh event,
   * return the last-signal slot) must each diverge from the live answers, and do.
   * Result at Helium slide 0x10f00a000: **PASS, 0 checks failed** (26 checks).
   *
   * @returns the `HGMetalSharedEvent*` at `this + 0x530`, verbatim — null included.
   */
  GetRenderEvent(): HGMetalSharedEvent | null {
    // @0x11eb4  movq 0x530(%rdi), %rax — the whole body: one load, returned unchanged.
    return this.renderEvent_at_0x530;
  }
}
