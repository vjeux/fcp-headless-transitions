// OZExportSettings — Ozone framework export/render settings (POD-ish struct
// with a vptr). Only the copy constructor is transcribed so far. The full
// class definition and the virtual method table live in FCP's binary and
// are pulled in progressively as the frontier scanner unlocks each method.
//
// Layout (recovered from copy-ctor @0x33dfe0):
//   +0x00 : vtable ptr           (set to VTABLE_ADDR below, not copied)
//   +0x08 : 4 bytes UNCOPIED     (base-class field, likely a refcount/lock;
//                                 caller's default-constructed value is kept)
//   +0x0c : 16 bytes (xmm0)      block "A" — e.g. 4×int32 or 2×float+int64
//   +0x1c : int32
//   +0x20 : uint8/bool
//   +0x21 : 3 bytes padding
//   +0x24 : uint64                (movq — could be a pointer/handle)
//   +0x2c : uint8/bool
//   +0x2d : uint8/bool
//   +0x2e : uint8/bool
//   +0x2f : 1 byte padding
//   +0x30 : 16 bytes (xmm0)      block "B"
//   +0x40 : 16 bytes (xmm0)      block "C"
//   size ≥ 0x50
//
// Provenance: /Applications/Final Cut Pro.app/.../Ozone

export interface OZExportSettings_Fields {
  // +0x00 vtable ptr — modelled as a constant identity string here.
  vtable: string;
  // +0x08 uncopied 4 bytes (base-class). We keep it typed but the copy-ctor
  // never touches it — the destination retains whatever value came out of
  // that field's own base-class ctor. Modelled as `number | undefined` so
  // callers can leave it unset when they mimic default-ctor state.
  base0x08: number | undefined;
  // +0x0c 16-byte block, treated as an opaque 4×int32 tuple until per-field
  // decode grounds the individual slots. Preserved as a bit-exact copy.
  block0x0c: [number, number, number, number];
  // +0x1c
  field0x1c: number;
  // +0x20
  field0x20: number;
  // +0x24 (u64) — bigint to preserve full 64-bit precision faithfully.
  field0x24: bigint;
  // +0x2c/+0x2d/+0x2e trailing bool triplet
  field0x2c: number;
  field0x2d: number;
  field0x2e: number;
  // +0x30 and +0x40 16-byte blocks
  block0x30: [number, number, number, number];
  block0x40: [number, number, number, number];
}

/**
 * OZExportSettings vtable pointer, taken from the LEA at @0x33dfe4:
 *   `lea 0x5127e5(%rip), %rax`  =>  effective address 0x8507d0
 *   (RIP-relative constant target; symbol resolution notes this is the
 *   `vtable for OZExportSettings` symbol at offset +0x10 — i.e. skipping
 *   the 2x8-byte RTTI/offset-to-top header that precedes virtual slots).
 */
export const OZExportSettings_VTABLE_ADDR = 0x8507d0;

/**
 * OZExportSettings::OZExportSettings(OZExportSettings const&)  — copy ctor
 * @0x000000000033dfe0  Ozone   (mangled: __ZN16OZExportSettingsC1ERKS_)
 *
 * Disasm trace (%rdi = this = dst, %rsi = other = src):
 *   lea    0x5127e5(%rip), %rax        # &vtable_for_OZExportSettings+0x10
 *   mov    %rax, (%rdi)                 # this->vptr = vtable
 *   movups 0xc(%rsi),  %xmm0            # copy 16 B block at +0x0c
 *   movups %xmm0,      0xc(%rdi)
 *   mov    0x1c(%rsi), %eax             # copy int32 @+0x1c
 *   mov    %eax,       0x1c(%rdi)
 *   movzbl 0x20(%rsi), %eax             # copy u8   @+0x20
 *   mov    %al,        0x20(%rdi)
 *   mov    0x24(%rsi), %rax             # copy u64  @+0x24
 *   mov    %rax,       0x24(%rdi)
 *   movzbl 0x2c(%rsi), %eax ; ...+0x2d ; ...+0x2e   # 3 bools
 *   movups 0x30(%rsi), %xmm0 ; movups %xmm0, 0x30(%rdi)
 *   movups 0x40(%rsi), %xmm0 ; movups %xmm0, 0x40(%rdi)
 *   ret
 *
 * The 4 bytes at offset +0x08 are NEVER read from `other` and NEVER written
 * to `this` — the caller-allocated `this` keeps whatever value that field
 * already held. This is characteristic of a base-class field constructed
 * in-place (e.g. a std::mutex or refcount) that is NOT copyable and whose
 * copy-ctor is defaulted to a fresh instance.
 */
export function OZExportSettings_copyCtor(
  self: OZExportSettings_Fields,
  other: OZExportSettings_Fields,
): void {
  // +0x00 vtable — always points at the fixed OZExportSettings vtable slot.
  self.vtable = "OZExportSettings@vtable+0x10";
  // (+0x08 deliberately NOT copied; see doc-comment.)

  // +0x0c block (16 B, movups)
  self.block0x0c = [
    other.block0x0c[0],
    other.block0x0c[1],
    other.block0x0c[2],
    other.block0x0c[3],
  ];

  // +0x1c int32
  self.field0x1c = other.field0x1c | 0;

  // +0x20 u8
  self.field0x20 = other.field0x20 & 0xff;

  // +0x24 u64 (bigint)
  self.field0x24 = other.field0x24;

  // +0x2c/+0x2d/+0x2e u8 triplet
  self.field0x2c = other.field0x2c & 0xff;
  self.field0x2d = other.field0x2d & 0xff;
  self.field0x2e = other.field0x2e & 0xff;

  // +0x30 block (16 B)
  self.block0x30 = [
    other.block0x30[0],
    other.block0x30[1],
    other.block0x30[2],
    other.block0x30[3],
  ];

  // +0x40 block (16 B)
  self.block0x40 = [
    other.block0x40[0],
    other.block0x40[1],
    other.block0x40[2],
    other.block0x40[3],
  ];
}
