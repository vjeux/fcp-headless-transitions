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
//   OZExportSettings::OZExportSettings()                        @Ozone 0x33def0  [C1 default ctor]
//     disasm: raw-port/re/disasm/__ZN16OZExportSettingsC1Ev.s
//   OZExportSettings::OZExportSettings(OZExportSettings const&) @Ozone 0x33dfe0
//   OZExportSettings::getRenderQuality() const                  @Ozone 0x33e160
//     disasm: raw-port/re/disasm/__ZNK16OZExportSettings16getRenderQualityEv.s
//   OZExportSettings::setRenderQuality(OZExportQuality)         @Ozone 0x33e1a0
//     disasm: raw-port/re/disasm/__ZN16OZExportSettings16setRenderQualityE15OZExportQuality.s

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

/**
 * OZExportSettings::setRenderQuality(OZExportQuality)
 * @0x000000000033e1a0  Ozone
 * (mangled: __ZN16OZExportSettings16setRenderQualityE15OZExportQuality)
 *
 * The writer counterpart of `OZExportSettings_getRenderQuality` @0x33e160
 * above: it stamps the requested quality code into the two 32-bit halves of
 * the +0x24 qword and then re-derives the three cached predicate bytes at
 * +0x2c/+0x2d/+0x2e that the getter cross-checks.
 *
 * FULL DISASM (13 lines — raw-port/re/disasm/
 * __ZN16OZExportSettings16setRenderQualityE15OZExportQuality.s):
 *
 *   0x33e1a0  pushq %rbp                   ; prologue
 *   0x33e1a1  movq  %rsp, %rbp
 *   0x33e1a4  movl  %esi, 0x24(%rdi)       ; this[+0x24] = q      (32-bit)
 *   0x33e1a7  cmpl  $0x8, %esi             ; q == 8 ?
 *   0x33e1aa  je    0x33e1c1               ; YES -> return, leaving +0x28 and
 *                                          ;        the three bytes UNTOUCHED
 *   0x33e1ac  movl  %esi, 0x28(%rdi)       ; this[+0x28] = q      (32-bit)
 *   0x33e1af  cmpl  $0x2, %esi             ; flags on (q - 2)
 *   0x33e1b2  setge 0x2d(%rdi)             ; this[+0x2d] = (q >= 2)  SIGNED
 *   0x33e1b6  cmpl  $0x6, %esi             ; flags on (q - 6)
 *   0x33e1b9  setge 0x2c(%rdi)             ; this[+0x2c] = (q >= 6)  SIGNED
 *   0x33e1bd  setge 0x2e(%rdi)             ; this[+0x2e] = (q >= 6)  — SAME
 *                                          ;   flags, NOT recomputed
 *   0x33e1c1  popq  %rbp                   ; shared epilogue
 *   0x33e1c2  retq                         ; void
 *   0x33e1c3  nopw  %cs:(%rax,%rax)        ; alignment padding, not code
 *
 * Three details a paraphrase would lose, all transcribed literally below:
 *
 *  1. **`q == 8` is an early-out that still writes +0x24.** The store at
 *     @0x33e1a4 happens BEFORE the compare, so quality code 8 lands in the
 *     low half while +0x28 and the three predicate bytes keep their previous
 *     values. (8 is also the "inconsistent" sentinel the getter returns at
 *     @0x33e18f, so this is the binary's way of parking that code without
 *     disturbing the derived state.)
 *  2. **The last two `setge`s share ONE compare.** @0x33e1bd has no `cmpl`
 *     of its own — it reuses the flags from `cmpl $0x6` @0x33e1b6, so +0x2c
 *     and +0x2e are written the SAME value, not two independently derived
 *     predicates. The port computes `q >= 6` once and stores it twice.
 *  3. **`setge` is the SIGNED condition** (SF == OF), and `cmpl` computes
 *     `dst - src` = `q - 2` / `q - 6` (PORTING_SPEC Rule 4 cheat-sheet), so
 *     these are `q >= 2` and `q >= 6` over the SIGNED 32-bit enum value — a
 *     negative code makes both false. The port therefore compares the
 *     sign-extended `q | 0`, not a `>>> 0` unsigned reading.
 *
 * FIELD MAPPING to the interface above: exactly as
 * `OZExportSettings_getRenderQuality` documents, +0x24 and +0x28 are the
 * little-endian LOW and HIGH 32-bit halves of the single 8-byte slot the copy
 * ctor @0x33dfe0 moves with one `movq 0x24(%rsi),%rax` — modelled by the
 * existing `field0x24: bigint`. This unit writes those halves in place and
 * invents no new field, so the interface is unchanged.
 *
 * Cross-check against the getter (an observation, not an added behaviour):
 * the getter requires `+0x2c == (q == 6)` @0x33e172-0x33e17e, whereas this
 * setter stores `q >= 6`. The two agree for every code `q <= 6`; for `q > 6`
 * the getter sees a mismatch and reports its 8 sentinel. Nothing here
 * "corrects" that — the instruction stream is reproduced as-is.
 *
 * FRONTIER CALLEES: none — leaf function (no calls, no externs, no indirect
 * or virtual dispatch, no allocation).
 *
 * @param self    the `OZExportSettings` — `this` (%rdi) in the native method.
 * @param quality the `OZExportQuality` enum code — `%esi` (signed 32-bit).
 */
export function OZExportSettings_setRenderQuality(
  self: OZExportSettings_Fields,
  quality: number,
): void {
  // %esi holds the enum as a 32-bit value; `| 0` reproduces that width.
  const q = quality | 0;

  // @0x33e1a4 — movl %esi, 0x24(%rdi): write the LOW half of the +0x24 qword,
  // leaving the high half (+0x28) byte-for-byte as it was.
  self.field0x24 =
    (self.field0x24 & 0xffffffff00000000n) | BigInt(q >>> 0);

  // @0x33e1a7/@0x33e1aa — cmpl $0x8, %esi ; je 0x33e1c1 (shared epilogue).
  if (q === 0x8) {
    return;
  }

  // @0x33e1ac — movl %esi, 0x28(%rdi): write the HIGH half of the same qword.
  self.field0x24 =
    (self.field0x24 & 0xffffffffn) | (BigInt(q >>> 0) << 32n);

  // @0x33e1af/@0x33e1b2 — cmpl $0x2, %esi ; setge 0x2d(%rdi)  (signed >=).
  self.field0x2d = q >= 2 ? 1 : 0;

  // @0x33e1b6 — cmpl $0x6, %esi: the ONE compare feeding both setges below.
  const qGE6 = q >= 6 ? 1 : 0;
  // @0x33e1b9 — setge 0x2c(%rdi).
  self.field0x2c = qGE6;
  // @0x33e1bd — setge 0x2e(%rdi): reuses the @0x33e1b6 flags, same value.
  self.field0x2e = qGE6;

  // @0x33e1c1/@0x33e1c2 — epilogue, void return.
}

/**
 * OZExportSettings::OZExportSettings()  — DEFAULT constructor
 * @0x000000000033def0  Ozone   (mangled: __ZN16OZExportSettingsC1Ev)  [C1 — complete object]
 *
 * FULL DISASM (17 lines — raw-port/re/disasm/__ZN16OZExportSettingsC1Ev.s):
 *
 *   0x33def0  pushq    %rbp                        ; prologue
 *   0x33def1  movq     %rsp, %rbp
 *   0x33def4  leaq     0x5128d5(%rip), %rax        ; 0x33defb + 0x5128d5 = 0x8507d0
 *   0x33defb  movq     %rax, (%rdi)                ; this[+0x00] = vtable+0x10
 *   0x33defe  movaps   0x3cdaab(%rip), %xmm0       ; 0x33df05 + 0x3cdaab = 0x70b9b0
 *   0x33df05  movups   %xmm0, 0x8(%rdi)            ; 16 B -> this[+0x08 .. +0x17]
 *   0x33df09  movabsq  $0x300000003, %rax
 *   0x33df13  movq     %rax, 0x18(%rdi)            ;  8 B -> this[+0x18 .. +0x1f]
 *   0x33df17  movb     $0x1, 0x20(%rdi)            ; this[+0x20] = 1
 *   0x33df1b  movabsq  $0x60000000a, %rax
 *   0x33df25  movq     %rax, 0x24(%rdi)            ;  8 B -> this[+0x24 .. +0x2b]
 *   0x33df29  movw     $0x101, 0x2c(%rdi)          ;  2 B -> this[+0x2c], this[+0x2d]
 *   0x33df2f  movb     $0x1, 0x2e(%rdi)            ; this[+0x2e] = 1
 *   0x33df33  movaps   0x3cda86(%rip), %xmm0       ; 0x33df3a + 0x3cda86 = 0x70b9c0
 *   0x33df3a  movups   %xmm0, 0x30(%rdi)           ; 16 B -> this[+0x30 .. +0x3f]
 *   0x33df3e  movaps   0x3c96db(%rip), %xmm0       ; 0x33df45 + 0x3c96db = 0x707620
 *   0x33df45  movups   %xmm0, 0x40(%rdi)           ; 16 B -> this[+0x40 .. +0x4f]
 *   0x33df49  popq     %rbp
 *   0x33df4a  retq
 *
 * The vptr target 0x8507d0 is the SAME address the copy ctor loads
 * (`lea 0x5127e5(%rip)` @0x33dfe4), i.e. the existing
 * `OZExportSettings_VTABLE_ADDR` constant — not a second vtable.
 *
 * CONSTANT-POOL READS. Three of the stores are 16-byte SIMD copies out of the
 * read-only constant pool in __TEXT. Their contents are read straight from the
 * Mach-O at the resolved addresses (little-endian 4x int32 — every lane is a
 * small integer, and the neighbouring accessors treat these slots as 32-bit
 * ints, never floats):
 *
 *   @Ozone 0x70b9b0 : 00000000 00000000 03000000 02000000  -> [0, 0, 3, 2]
 *   @Ozone 0x70b9c0 : 02000000 02000000 02000000 00000000  -> [2, 2, 2, 0]
 *   @Ozone 0x707620 : 02000000 02000000 02000000 02000000  -> [2, 2, 2, 2]
 *
 * FIELD MAPPING onto the interface this file already defines (no field is
 * added, renamed or re-grouped — the SIMD stores simply straddle the existing
 * slot boundaries, because the compiler is writing the widest store it can):
 *
 *   this[+0x08]        = 0            <- lane 0 of the @0x70b9b0 constant  -> base0x08
 *   this[+0x0c/10/14]  = 0, 3, 2      <- lanes 1..3 of the same constant   -> block0x0c[0..2]
 *   this[+0x18]        = 3            <- LOW half of movabsq $0x300000003  -> block0x0c[3]
 *   this[+0x1c]        = 3            <- HIGH half of the same movabsq     -> field0x1c
 *   this[+0x20]        = 1                                                 -> field0x20
 *   this[+0x24/+0x28]  = 0xa, 0x6     <- movabsq $0x60000000a (lo, hi)     -> field0x24 (u64)
 *   this[+0x2c/+0x2d]  = 1, 1         <- movw $0x101 (little-endian byte pair)
 *   this[+0x2e]        = 1
 *   this[+0x30..0x3f]  = [2, 2, 2, 0]                                      -> block0x30
 *   this[+0x40..0x4f]  = [2, 2, 2, 2]                                      -> block0x40
 *
 * Two details worth stating because a paraphrase would smooth them over:
 *
 *  1. **The 16-byte store at +0x08 covers the slot the COPY ctor skips.** The
 *     copy ctor starts its block copy at +0x0c and never touches +0x08 (see its
 *     doc-comment above); the default ctor DOES initialize +0x08, to 0. Both
 *     facts are literal: one function's first 16-byte store begins at +0x08, the
 *     other's at +0x0c.
 *  2. **+0x24 and +0x28 are seeded to DIFFERENT values** (10 and 6) by the single
 *     `movabsq $0x60000000a`, even though `OZExportSettings_setRenderQuality`
 *     @0x33e1a0 writes the same code into both halves. Nothing here reconciles
 *     them — the default state is transcribed exactly as the constant encodes it.
 *
 * FRONTIER CALLEES: none — leaf function (no calls, no externs, no indirect or
 * virtual dispatch, no allocation).
 *
 * @param self the `OZExportSettings` — `this` (%rdi) in the native method. The
 *   storage is caller-allocated exactly as in C++; this function only fills it.
 */
export function OZExportSettings_ctor(self: OZExportSettings_Fields): void {
  // @0x33def4/@0x33defb — movq %rax, (%rdi): vptr = OZExportSettings vtable+0x10
  // (0x8507d0 === OZExportSettings_VTABLE_ADDR).
  self.vtable = "OZExportSettings@vtable+0x10";

  // @0x33defe/@0x33df05 — movups %xmm0, 0x8(%rdi): the 16 B constant at
  // @Ozone 0x70b9b0 = [0, 0, 3, 2] lands across +0x08 .. +0x17.
  self.base0x08 = 0; // lane 0 -> +0x08
  // lanes 1..3 -> +0x0c, +0x10, +0x14; lane at +0x18 comes from the movabsq below.
  // @0x33df09/@0x33df13 — movabsq $0x300000003 ; movq %rax, 0x18(%rdi):
  // little-endian, so +0x18 = 3 (low) and +0x1c = 3 (high).
  self.block0x0c = [0, 3, 2, 3];
  self.field0x1c = 3;

  // @0x33df17 — movb $0x1, 0x20(%rdi).
  self.field0x20 = 1;

  // @0x33df1b/@0x33df25 — movabsq $0x60000000a ; movq %rax, 0x24(%rdi):
  // one 8-byte store whose low half (+0x24) is 0xa and high half (+0x28) is 0x6.
  self.field0x24 = 0x0000000600000000an;

  // @0x33df29 — movw $0x101, 0x2c(%rdi): a 2-byte store, low byte to +0x2c and
  // high byte to +0x2d, both 1.
  self.field0x2c = 1;
  self.field0x2d = 1;
  // @0x33df2f — movb $0x1, 0x2e(%rdi).
  self.field0x2e = 1;

  // @0x33df33/@0x33df3a — movups %xmm0, 0x30(%rdi): constant @Ozone 0x70b9c0.
  self.block0x30 = [2, 2, 2, 0];

  // @0x33df3e/@0x33df45 — movups %xmm0, 0x40(%rdi): constant @Ozone 0x707620.
  self.block0x40 = [2, 2, 2, 2];

  // @0x33df49/@0x33df4a — epilogue, void return.
}
