// raw-port: HGBitmap — Helium framework bitmap wrapper.
//
// This file contributes ONE method (GetStorage) and the opaque model of
// the storage pointer it returns. The class as a whole is a Helium bitmap
// buffer wrapper (peer methods include GetWidth/GetHeight/GetFormat/
// GetBytesPerRow/etc. — each unlocks in its own file when its accessor is
// ported). This file only lands what THIS unit strictly requires.
//
// Framework: Helium
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/Helium.__ZN8HGBitmap10GetStorageEv.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (fields discovered from GetStorage's read; other slots are
// as-yet-undecoded and left OPAQUE — no invented fields)
// -----------------------------------------------------------------------------
//   +0x78  void*  storageAt78   ; @0x1e5d04 read (8 bytes, 64-bit pointer)
//
// The +0x78 slot holds an opaque pointer that GetStorage returns unchanged.
// From peer methods (not yet transcribed) we may later learn that this points
// to a raw pixel buffer, a HGStorage object, or an ObjC MTLBuffer wrapper —
// but this getter alone tells us only the offset and the pointer-sized
// (`movq`) width. Per Rule 5 we model it as `unknown` (an opaque handle).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN8HGBitmap10GetStorageEv
//       — HGBitmap::GetStorage() @Helium 0x1e5d00
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN8HGBitmap10GetStorageEv.s)
// -----------------------------------------------------------------------------
//   __ZN8HGBitmap10GetStorageEv:
//     0x1e5d00  pushq  %rbp                        ; frame prologue
//     0x1e5d01  movq   %rsp, %rbp
//     0x1e5d04  movq   0x78(%rdi), %rax             ; rax = this[+0x78]
//     0x1e5d08  popq   %rbp                        ; frame epilogue
//     0x1e5d09  retq                                ; return rax

/**
 * `HGBitmap` — Helium bitmap buffer wrapper. Only the storage slot at +0x78
 * is decoded at this layer; the rest of the object is OPAQUE (undecoded)
 * and is intentionally NOT modelled here — future ports of other HGBitmap
 * methods (GetWidth/GetHeight/GetFormat/GetBytesPerRow/…) will add fields
 * as their addresses are read.
 */
export class HGBitmap {
  /**
   * @Helium offset +0x78 — a pointer-sized (8-byte) opaque storage slot
   * read by `GetStorage()` @0x1e5d04 via `movq 0x78(%rdi), %rax`.
   *
   * The `movq` (64-bit load) fixes the field as a pointer; the value it
   * points to is not decoded by THIS unit (the getter returns it
   * unchanged as an opaque `void*`). Peer methods (GetWidth/GetPixels/
   * etc.) that dereference this slot will ground it as a concrete
   * struct/handle when ported.
   *
   * Modelled as `unknown` (opaque handle) to preserve the "pointer, no
   * decoded interior" semantics faithfully — Rule 5 forbids inventing a
   * shape for an un-touched interior.
   */
  storageAt78: unknown = null;

  /**
   * `HGBitmap::GetStorage()`
   *   — @Helium 0x1e5d00
   *   — __ZN8HGBitmap10GetStorageEv
   *
   * Faithful line-for-line transcription of the 6-instruction disassembly:
   *   0x1e5d00  pushq  %rbp                        ; frame prologue
   *   0x1e5d01  movq   %rsp, %rbp
   *   0x1e5d04  movq   0x78(%rdi), %rax             ; rax = this[+0x78]
   *   0x1e5d08  popq   %rbp                        ; frame epilogue
   *   0x1e5d09  retq                                ; return %rax
   *
   * Single-instruction body: load the 8-byte pointer at offset +0x78 of
   * `this` into the return register (`%rax`). Zero in-scope callees,
   * zero externs, no indirect calls — pure field read.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN8HGBitmap10GetStorageEv.s (7 lines)
   */
  GetStorage(): unknown {
    // @0x1e5d04  movq 0x78(%rdi), %rax
    //   Return the opaque 8-byte pointer stored at this[+0x78] unchanged.
    return this.storageAt78;
  }
}

/**
 * Alias export: mangled symbol name.
 * @0x1e5d00 Helium  __ZN8HGBitmap10GetStorageEv
 */
export function __ZN8HGBitmap10GetStorageEv(self: HGBitmap): unknown {
  return self.GetStorage();
}
