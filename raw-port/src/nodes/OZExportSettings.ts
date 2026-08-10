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
//
// SYMBOLS PORTED IN THIS FILE:
//   OZExportSettings::OZExportSettings(OZExportSettings const&) @Ozone 0x33dfe0
//   OZExportSettings::getRenderQuality() const                  @Ozone 0x33e160
//     disasm: raw-port/re/disasm/__ZNK16OZExportSettings16getRenderQualityEv.s

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

/**
 * `OZExportSettings::getRenderQuality() const` — @0x000000000033e160  Ozone
 * (mangled: `__ZNK16OZExportSettings16getRenderQualityEv`).
 *
 * Full transcription — every instruction of the function, in order
 * (raw-port/re/disasm/__ZNK16OZExportSettings16getRenderQualityEv.s):
 *
 *   0x33e160  pushq  %rbp                  ; frame setup (no TS counterpart)
 *   0x33e161  movq   %rsp, %rbp            ; frame setup (no TS counterpart)
 *   0x33e164  movl   $0xa, %eax            ; eax = 10  (the "override" result)
 *   0x33e169  cmpl   $0xa, 0x24(%rdi)      ; (u32 @+0x24) - 10
 *   0x33e16d  je     0x33e194              ;   == 10 -> return eax (= 10)
 *   0x33e16f  movl   0x28(%rdi), %eax      ; eax = q = (u32 @+0x28)
 *   0x33e172  cmpl   $0x6, %eax            ; q - 6
 *   0x33e175  sete   %dl                   ; dl = (q == 6)
 *   0x33e178  movzbl 0x2c(%rdi), %ecx      ; cl = (u8 @+0x2c), zero-extended
 *   0x33e17c  cmpb   %dl, %cl              ; cl - dl
 *   0x33e17e  jne    0x33e18f              ;   mismatch -> return 8
 *   0x33e180  testl  %eax, %eax            ; q - 0
 *   0x33e182  setne  %dl                   ; dl = (q != 0)
 *   0x33e185  cmpb   %dl, 0x2d(%rdi)       ; (u8 @+0x2d) - dl
 *   0x33e188  jne    0x33e18f              ;   mismatch -> return 8
 *   0x33e18a  cmpb   %cl, 0x2e(%rdi)       ; (u8 @+0x2e) - cl
 *   0x33e18d  je     0x33e194              ;   equal -> return eax (= q)
 *   0x33e18f  movl   $0x8, %eax            ; eax = 8  (the "inconsistent" result)
 *   0x33e194  popq   %rbp                  ; frame teardown (no TS counterpart)
 *   0x33e195  retq                         ; return eax
 *   0x33e196  nopw   %cs:(%rax,%rax)       ; alignment padding, not executed
 *
 * WHAT %eax HOLDS AT THE JOIN (the easy thing to get wrong): the epilogue at
 * 0x33e194 is reached from THREE places, and `%eax` is different at each:
 *   • via `je` @0x33e16d  -> eax is still the 10 loaded @0x33e164;
 *   • via `je` @0x33e18d  -> eax was OVERWRITTEN @0x33e16f with q, so the
 *                            function returns the raw field value q, NOT 10;
 *   • via fall-through @0x33e18f -> eax = 8.
 *
 * So the decoded logic is:
 *
 *   if ((u32 @+0x24) == 10) return 10;             // 10 short-circuits
 *   q = (u32 @+0x28);
 *   if ((u8 @+0x2c) != (q == 6 ? 1 : 0)) return 8;
 *   if ((u8 @+0x2d) != (q != 0 ? 1 : 0)) return 8;
 *   if ((u8 @+0x2e) != (u8 @+0x2c))      return 8;
 *   return q;
 *
 * i.e. the three cached booleans at +0x2c/+0x2d/+0x2e must AGREE with what
 * the quality code q implies (`q == 6`, `q != 0`, and the same `q == 6` again
 * for +0x2e — @0x33e18a compares +0x2e against `%cl`, the +0x2c byte, not
 * against a freshly computed predicate); if any of them disagrees, the
 * settings object is internally inconsistent and the method reports 8.
 *
 * AT&T decode notes (PORTING_SPEC Rule 4): every compare here is `dst - src`
 * with a ZF-only condition (`je`/`jne`/`sete`/`setne`) — pure equality, no
 * ordering, so no signed/unsigned question arises. The byte compares use the
 * RAW byte values (`movzbl` zero-extends +0x2c), so a stored byte of, say, 2
 * does NOT equal the 1 produced by `sete`; the port therefore compares the
 * masked byte against 0/1 rather than coercing both sides to booleans.
 *
 * FIELD MAPPING to the interface above: the copy-ctor @0x33dfe0 copies +0x24
 * as ONE 8-byte `movq` (`mov 0x24(%rsi),%rax`), which is why the model holds
 * that slot as the single u64 `field0x24`. This method reads its two 32-bit
 * halves separately, so they are recovered here as the little-endian low half
 * (+0x24) and high half (+0x28) of that same qword — no new field is invented
 * and the existing interface is unchanged.
 *
 * FRONTIER CALLEES: none — leaf function (no calls, no externs, no indirect
 * or virtual dispatch).
 *
 * @param self the `OZExportSettings` — `this` (%rdi) in the native method.
 * @returns the effective render-quality code (u32).
 */
export function OZExportSettings_getRenderQuality(
  self: OZExportSettings_Fields,
): number {
  // @0x33e169 — cmpl $0xa, 0x24(%rdi): the LOW 32 bits of the +0x24 qword.
  const field0x24_lo = Number(self.field0x24 & 0xffffffffn) >>> 0;
  if (field0x24_lo === 0xa) {
    // @0x33e164/@0x33e16d — eax was preloaded with 10 and never clobbered.
    return 0xa;
  }
  // @0x33e16f — movl 0x28(%rdi), %eax: the HIGH 32 bits of the same qword.
  const q = Number((self.field0x24 >> 32n) & 0xffffffffn) >>> 0;
  // @0x33e172/@0x33e175 — sete %dl: dl = (q == 6).
  const qIsSix = q === 0x6 ? 1 : 0;
  // @0x33e178 — movzbl 0x2c(%rdi), %ecx.
  const b2c = self.field0x2c & 0xff;
  // @0x33e17c/@0x33e17e — cmpb %dl, %cl ; jne -> 8.
  if (b2c !== qIsSix) {
    // @0x33e18f — movl $0x8, %eax.
    return 0x8;
  }
  // @0x33e180/@0x33e182 — setne %dl: dl = (q != 0).
  const qIsNonZero = q !== 0 ? 1 : 0;
  // @0x33e185/@0x33e188 — cmpb %dl, 0x2d(%rdi) ; jne -> 8.
  if ((self.field0x2d & 0xff) !== qIsNonZero) {
    // @0x33e18f — movl $0x8, %eax.
    return 0x8;
  }
  // @0x33e18a/@0x33e18d — cmpb %cl, 0x2e(%rdi) ; je -> return eax (= q).
  if ((self.field0x2e & 0xff) !== b2c) {
    // @0x33e18f — movl $0x8, %eax.
    return 0x8;
  }
  // @0x33e194 — retq with %eax still holding q from @0x33e16f.
  return q;
}
