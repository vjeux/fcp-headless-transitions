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
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN13HGGPURenderer15GetMetalContextEv.s
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
// OBJECT LAYOUT (recovered from this method only)
// -----------------------------------------------------------------------------
//   +0x458  HGMetalContext*  metalContext   ; the sole field this method touches.
//     Read @0xa564 (`movq 0x458(%rdi), %rax`). We do NOT invent adjacent
//     fields — one method, one field, one offset. Other HGGPURenderer
//     methods will add their own fields as they are ported.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero. This is a pure inline getter — no callees at all (no in-scope, no
// externs, no indirect calls). `depgraph.py why` confirms: 0 in-scope deps,
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
}
