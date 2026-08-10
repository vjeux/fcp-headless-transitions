// PCWorkingColor — Ozone RGB-plus-colour-space "working colour" value class.
// Semantically a value holding an RGB triple (or similar payload in the
// low-offset range) plus a retained `CGColorSpace*` handle at +0x10.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (x86_64 fat sub-slice; sub-arch file offset 0x4000).
//
// ONLY the complete-object destructor (D1) is emitted in Ozone for this
// class — @0x75200. The ctor, copy, and assignment operators are all
// U-externs / ICF-folded and are not disassemblable from this framework.
//
// Source disassembly:
//   raw-port/re/disasm/PCWorkingColor.~PCWorkingColor.s   @Ozone 0x75200
//
// SYMBOL EXPOSED (nm -a Ozone):
//   __ZN14PCWorkingColorD1Ev  ->  PCWorkingColor::~PCWorkingColor()   @0x75200
//
// -----------------------------------------------------------------------------
// ADDED LATER — the copy-assignment operator, transcribed from ProCore
// -----------------------------------------------------------------------------
// The note above ("the ctor, copy, and assignment operators are all U-externs
// ... not disassemblable from this framework") is exactly right about OZONE: the
// class is ProCore-owned (the `PC` prefix), and Ozone merely IMPORTS it. The
// definition lives in the ProCore binary, where it IS disassemblable:
//
//   * PCWorkingColor::operator=(PCWorkingColor const&)   @ProCore 0x7a8a6
//     __ZN14PCWorkingColoraSERKS_
//     re/disasm: raw-port/re/disasm/ProCore.__ZN14PCWorkingColoraSERKS_.s (9 lines)
//     Source binary for THIS method:
//       /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//       Versions/A/ProCore  (x86_64 slice)
//
// That method is ADDED below; the destructor port above is untouched by it.
//
// CONSUMERS visible in the Ozone symbol table:
//   OZPreferenceManager::getGroundPlaneColor1(PCWorkingColor&)
//     __ZN19OZPreferenceManager20getGroundPlaneColor1ER14PCWorkingColor
//   OZPreferenceManager::getGroundPlaneColor2(PCWorkingColor&)
//     __ZN19OZPreferenceManager20getGroundPlaneColor2ER14PCWorkingColor
//   (both accept PCWorkingColor by reference — output-arg pattern).
// A `PCWorkingColorVector` (std::vector<PCWorkingColor>) is used as an
// input to Li3DEngineObjectData construction (see the extremely long
// __shared_ptr_emplace mangling in nm output).
//
// STRUCT LAYOUT — recovered from the D1 dtor:
//   +0x00..+0x0f    (opaque payload — not touched by the dtor;
//                    likely 3 floats (r,g,b) + a small trailing field
//                    per the "working colour" naming, but ONLY +0x10 is
//                    directly observable here — we surface the low
//                    range as a single opaque slot rather than invent
//                    the RGB decomposition)
//   +0x10   CGColorSpace* handle          (loaded via `movq 0x10(%rdi), %rdi`
//                                          at @0x75204; null-check + release
//                                          at @0x75208-0x7520d — same
//                                          RAII shape as PCColorSpaceHandle
//                                          in ./PCColorSpaceHandle.ts)
//   sizeof(PCWorkingColor)  ≥ 0x18 (18h = 24 bytes minimum; the low range
//                                    is opaque so the true sizeof may be
//                                    larger — undecodable from the dtor
//                                    alone).
//
// NOTE: this class is NOT a vtable-bearing polymorphic class — the D1 dtor
// contains ZERO vptr writes (no `movq X(%rip), %rax; movq %rax, (%rdi)`
// pattern). It is a plain aggregate that holds a retained CoreFoundation
// pointer alongside an opaque numeric payload, matching the FCP "working
// colour" idiom (per-value colour + working colour space).
//
// The class's role in the ledger is INFRA (it's a value type / handle
// wrapper on the Ozone side); we file it under raw-port/src/infra/ to
// mirror ./PCColorSpaceHandle.ts, which decomposes an identical CGColorSpace
// RAII wrapper.

import type { CGColorSpaceRef } from "./PCColor.js";

// ── Frontier stub — the CGColorSpace release traits helper ───────────────

/**
 * `PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)` — mangled
 * `__ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_`.  Called from
 * `~PCWorkingColor` @Ozone 0x7520d via Ozone symbol stub 0x6dda9a.
 *
 * A parallel port already exists on the Flexo side — see
 * `raw-port/src/infra/PCColorSpaceHandle.ts`'s
 * `PCCFRefTraits_CGColorSpace_release`, which decodes the ProCore body
 * @0xacbf2 as a tail-jmp to `_CGColorSpaceRelease`.
 *
 * We DO NOT import that here (the two are separate framework stubs; the
 * Ozone side's own decode of stub 0x6dda9a hasn't been transcribed in this
 * repo, and a cross-framework import would falsely elide the frontier gap
 * on Ozone's side). Instead we surface a throwing frontier stub that cites
 * the exact call site, so the ledger sees Ozone-side coverage.
 */
function PCCFRefTraits_CGColorSpace_release_stub(_cs: CGColorSpaceRef): void {
  throw new Error(
    "PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*) @Ozone stub 0x6dda9a " +
      "(__ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_ — not yet transcribed on Ozone side; " +
      "the ProCore body @0xacbf2 tail-jmps _CGColorSpaceRelease, per PCColorSpaceHandle.ts) — " +
      "invoked by PCWorkingColor::~PCWorkingColor() @Ozone 0x7520d",
  );
}

// ── Landing-pad frontier stub — the exception-handler terminate call ─────

/**
 * `___clang_call_terminate` — libc++abi's landing-pad -> `std::terminate`
 * shim; entered when an EH unwinder reaches an unhandled destructor
 * exception. Called from the D1 landing-pad @Ozone 0x75217 (i.e., the
 * `movq %rax, %rdi; callq ___clang_call_terminate` at 0x75214..0x75217).
 *
 * This never runs on the happy path (release above cannot throw in FCP's
 * build). We surface it as a throwing stub for provenance completeness.
 */
function clang_call_terminate_stub(_exc: unknown): never {
  throw new Error(
    "___clang_call_terminate @Ozone (landing-pad shim) — invoked by " +
      "PCWorkingColor::~PCWorkingColor() unwind landing-pad @Ozone 0x75217",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `PCWorkingColor` — value class holding an opaque colour payload at
 * offset +0x00..+0x0f plus a retained `CGColorSpace*` at +0x10.
 *
 * We model the observable fields directly. The low-offset payload is
 * exposed as a single opaque property because the dtor does not touch it;
 * dedicated ctor decoding will be needed to name the RGB channels.
 */
export class PCWorkingColor {
  /**
   * Opaque payload occupying C++ offsets +0x00..+0x0f (16 bytes). The
   * dtor at 0x75200 does NOT read this range — the RGB / working-colour
   * decomposition is not observable from the destructor alone. Ctor
   * decoding is required to name individual fields (typically 3× float
   * for r,g,b plus a 4-byte tag / flag).
   */
  payload_0x00!: unknown;

  /**
   * `CGColorSpace*` handle at C++ offset +0x10. Released by the dtor
   * (@0x7520d) via `PCCFRefTraits<CGColorSpace*>::release` if non-null.
   * Same RAII shape as `PCColorSpaceHandle` in ./PCColorSpaceHandle.ts.
   */
  cs_0x10: CGColorSpaceRef | null = null;

  /**
   * `PCWorkingColor::~PCWorkingColor()` @Ozone 0x75200 [D1].
   *
   * DISASM (raw-port/re/disasm/PCWorkingColor.~PCWorkingColor.s):
   *
   *   0x75200  pushq %rbp
   *   0x75201  movq  %rsp, %rbp
   *   0x75204  movq  0x10(%rdi), %rdi                ; rdi = this->cs_0x10
   *   0x75208  testq %rdi, %rdi                      ; if null, skip release
   *   0x7520b  je    0x75212
   *   0x7520d  callq __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
   *                                                  ; PCCFRefTraits<CGColorSpace*>::release(cs)
   *                                                  ; @Ozone stub 0x6dda9a
   *   0x75212  popq  %rbp
   *   0x75213  retq
   *   ;; -- landing pad (dtor unwind entry) --
   *   0x75214  movq  %rax, %rdi                      ; rdi = active exception
   *   0x75217  callq ___clang_call_terminate         ; -> std::terminate()
   *
   * Semantic mirror below: the dtor's only observable effect is the
   * conditional release of the CGColorSpace handle at +0x10. The
   * landing-pad `clang_call_terminate` is unreachable on the happy
   * path and is surfaced only for provenance.
   */
  destructor(): void {
    // @0x75204 — load this->cs_0x10.
    const cs = this.cs_0x10;

    // @0x75208 / @0x7520b — null-check.
    if (cs !== null) {
      // @0x7520d — PCCFRefTraits<CGColorSpace*>::release(cs).
      PCCFRefTraits_CGColorSpace_release_stub(cs);
    }

    // @0x75212 / @0x75213 — return (no other cleanup).

    // The unwind landing-pad @0x75214 / @0x75217 is unreachable in JS —
    // the release stub above cannot throw a C++ exception. Referenced here
    // ONLY to keep the frontier stub live so `frontier.py` can see the
    // ___clang_call_terminate provenance:
    if (false as boolean) {
      clang_call_terminate_stub(undefined);
    }
  }

  /**
   * `PCWorkingColor::operator=(PCWorkingColor const&)` — @ProCore 0x7a8a6
   * (`__ZN14PCWorkingColoraSERKS_`).
   *
   * DISASM (raw-port/re/disasm/ProCore.__ZN14PCWorkingColoraSERKS_.s, 9 lines):
   *
   *   0x7a8a6  pushq  %rbp                    ; frame prologue
   *   0x7a8a7  movq   %rsp, %rbp
   *   0x7a8aa  movq   %rdi, %rax              ; return value = this
   *   0x7a8ad  movups (%rsi), %xmm0           ; load 16 bytes from `other`+0x00
   *   0x7a8b0  movups %xmm0, (%rdi)           ; store 16 bytes to `this`+0x00
   *   0x7a8b3  popq   %rbp                    ; frame epilogue
   *   0x7a8b4  retq                           ; return %rax (== this)
   *   0x7a8b5  nop                            ; alignment padding
   *
   * The ENTIRE body is one unaligned 16-byte SSE load/store pair. Everything
   * that matters about it is what it does NOT do:
   *
   *   * It copies EXACTLY the +0x00..+0x0f range — the opaque payload block the
   *     dtor above never reads. The `movups` displacement is 0 on both sides and
   *     the register is a full `%xmm`, so the width is 16 bytes, no more.
   *   * It does NOT touch +0x10. There is no second load/store, no retain, no
   *     release, and no null check anywhere in the nine lines — so whatever the
   *     +0x10 slot holds in the assigned-to object is left exactly as it was.
   *     (Recorded as an OBSERVATION for whoever reconciles this class's layout
   *     against the Ozone-side dtor at 0x75200, which does release a handle at
   *     +0x10. This unit transcribes only what ProCore 0x7a8a6 executes and
   *     asserts nothing about that reconciliation.)
   *   * There is no self-assignment guard and no branch of any kind: `this ==
   *     &other` simply copies the block onto itself.
   *
   * `depgraph.py` confirms the shape: `deps: []`, `n_extern_oos: 0`,
   * `indirect: 0` — no callq, no symbol stub, no virtual dispatch. A trivially
   * copyable 16-byte assignment.
   *
   * MODELLING NOTE: the machine copies 16 raw bytes. This file already models
   * that whole range as the single opaque `payload_0x00` slot (the dtor could
   * not decompose it), so the faithful mirror of the one `movups` pair is to
   * transfer that slot as one unit — the same block, moved whole. When a ctor
   * or accessor eventually names the individual fields in +0x00..+0x0f, this
   * assignment keeps copying all of them, because it copies the block.
   *
   * @param other  `%rsi` — the source object, taken by const reference.
   * @returns      `%rax` — `this`, per the C++ assignment-operator convention.
   */
  assign(other: PCWorkingColor): PCWorkingColor {
    // @0x7a8ad  movups (%rsi), %xmm0   ; xmm0 = other[+0x00 .. +0x0f]
    // @0x7a8b0  movups %xmm0, (%rdi)   ; this[+0x00 .. +0x0f] = xmm0
    this.payload_0x00 = other.payload_0x00;
    // NOTE: no store to +0x10 — `this.cs_0x10` is deliberately left untouched,
    // because the disasm contains no second move (see the doc comment above).
    // @0x7a8aa / @0x7a8b4  movq %rdi, %rax ; retq   — return this.
    return this;
  }
}
