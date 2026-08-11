// HGBitmapLoader.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * HGBitmapLoader::GetBitmapPtr() const   @Helium 0xf3e50
//     __ZNK14HGBitmapLoader12GetBitmapPtrEv
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK14HGBitmapLoader12GetBitmapPtrEv.s
//
// HGBitmapLoader is a large class (~35 exported methods: the upload/render path, the pixel-
// format conversion nodes, Duplicate, the ctors/dtors). Every one of them is a SEPARATE ledger
// entry; this file ports only the getter above and will be EXTENDED add-only as the others land.
// Two siblings are quoted below as LAYOUT EVIDENCE only, not ported.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. One load; no callq, no branch, no dispatch.
// `depgraph.py deps __ZNK14HGBitmapLoader12GetBitmapPtrEv` reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM (6 instructions, @0xf3e50..@0xf3e5d)
// -----------------------------------------------------------------------------
//   0xf3e50  pushq %rbp                    ; frame prologue
//   0xf3e51  movq  %rsp, %rbp
//   0xf3e54  movq  0x198(%rdi), %rax       ; return this->bitmap  (a full 64-bit load)
//   0xf3e5b  popq  %rbp                    ; epilogue
//   0xf3e5c  retq
//   0xf3e5d  nopl  (%rax)                  ; padding — not executed
//
// It is an UNCONDITIONAL, UNVALIDATED read: there is no `testq %rax,%rax`, no null check, no
// masking. A null slot is returned as null and a garbage slot is returned verbatim. That is
// worth stating because the sibling getter one slot along DOES branch, and copying its shape
// here would be wrong — `GetBitmapFormat` @0xf3e60 reads the same +0x198 pointer and then
//   0xf3e67  testq %rax,%rax ; 0xf3e6a je 0xf3e75   ; null -> return 0 without dereferencing
//   0xf3e70  movl  0x10(%rax),%eax                  ; else the u32 at bitmap+0x10
// so the null-handling belongs to THAT method, not to this one.
//
// -----------------------------------------------------------------------------
// THE FIELD AT +0x198 (proven three ways)
// -----------------------------------------------------------------------------
//   * this getter loads it                        movq  0x198(%rdi),%rax   @0xf3e54
//   * `HGBitmapLoader::SetBitmap(HGBitmap*)` @0xf3c90 — the writer — compares the incoming
//     pointer against it before doing any work:   cmpq  %rsi,0x198(%rdi)   @0xf3c9d
//     (and on a change calls HGNode::ClearBits() and sets the byte at +0x1b2)
//   * `HGBitmapLoader::GetBitmapFormat()` @0xf3e60 reads it and dereferences it at +0x10
//                                                 movq  0x198(%rdi),%rax   @0xf3e60
// The `P8HGBitmap` parameter in SetBitmap's mangling is what types it: `HGBitmap*`. Both
// siblings are separate ledger entries, cited here only as evidence.
//
// +0x198 is the same offset at which the Hgc* render nodes keep their first post-HGNode member
// (their parameter block) — consistent with it being the first subclass field after the shared
// HGNode base, but this file claims only what its own three citations prove.
//
// -----------------------------------------------------------------------------
// ORACLE — differential against the live binary, 506 cases, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/HGBitmapLoader_GetBitmapPtr_oracle.py. Called at x86_64 vmaddr + the
// loaded image's slide, under `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice
// these addresses come from (OPS_LOG "wrong architecture").
//
// On a 0xAA-poisoned 0x200-byte object with the slot planted: 0, 1, all-ones, 0xAAAA…,
// 0x00007FFFFFFFFFFF, 0xDEADBEEFCAFEF00D and 500 random 64-bit words —
//   wrong return   = 0   (every value comes back verbatim, null included)
//   object modified = 0  (it is a pure read)
// NEGATIVE CONTROLS on the same corpus: reading +0x1a0 instead of +0x198 — 505 caught;
// returning null when the slot "looks invalid" — 505; truncating the pointer to 32 bits — 504.

import type { HGBitmap } from "./HGBitmap.js";

/**
 * `HGBitmapLoader` — the Helium node that owns a bitmap and uploads it to the GPU. Only the ONE
 * field this unit reads is modelled; every other offset is undecoded and deliberately absent
 * (PORTING_SPEC Rule 5).
 */
export class HGBitmapLoader {
  /**
   * `+0x198  HGBitmap* bitmap` — the bitmap this loader renders.
   *
   * Read by `GetBitmapPtr` @0xf3e54 (this unit) and by `GetBitmapFormat` @0xf3e60; written by
   * `SetBitmap(HGBitmap*)` @0xf3c90, whose `cmpq %rsi, 0x198(%rdi)` @0xf3c9d both pins the
   * offset and — through the `P8HGBitmap` in its mangling — the type. Null until a ctor or
   * `SetBitmap` is transcribed (both separate ledger entries); the loader is explicitly allowed
   * to hold null, which is why `GetBitmapFormat` null-checks the slot before dereferencing it.
   */
  bitmap: HGBitmap | null = null; // @Helium HGBitmapLoader@0x198

  /**
   * `HGBitmapLoader::GetBitmapPtr() const` — @Helium 0xf3e50
   *   (__ZNK14HGBitmapLoader12GetBitmapPtrEv)
   *
   * Faithful transcription of the whole 6-instruction body: one 64-bit load of the +0x198 slot.
   * No null check, no validation, no callee — see the file header for the listing, the
   * three-way proof of the field, and the 506-case differential.
   *
   * The `const` qualifier matches the `__ZNK...` mangling; the body only reads (confirmed live:
   * no byte of the object changes on any call).
   *
   * @returns the stored `HGBitmap*`, verbatim — `null` when the slot is null.
   */
  GetBitmapPtr(): HGBitmap | null {
    // @0xf3e54 — movq 0x198(%rdi), %rax : return the pointer exactly as stored. Returning
    //   anything else for a null or unexpected value would be inventing a check the machine
    //   does not perform; its sibling GetBitmapFormat @0xf3e67 is where the null test lives.
    return this.bitmap;
  }
}
