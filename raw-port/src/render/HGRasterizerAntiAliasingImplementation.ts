// HGRasterizerAntiAliasingImplementation.ts — Helium's rasterizer anti-alias
// configuration object (a small POD-shaped subclass of HGObject that just
// holds a bool enable flag, a technique enum, and a requested MSAA sample
// count, and derives the effective MSAA sample count from those three).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (nine member functions + the deleting dtor):
//   @Helium 0x0000000000194c10  HGRasterizerAntiAliasingImplementation::GetAntiAlias() const
//   @Helium 0x0000000000194c20  HGRasterizerAntiAliasingImplementation::SetAntiAlias(bool)
//   @Helium 0x0000000000194c30  HGRasterizerAntiAliasingImplementation::GetAntiAliasTechnique() const
//   @Helium 0x0000000000194c40  HGRasterizerAntiAliasingImplementation::SetAntiAliasTechnique(AntiAliasTechnique)
//   @Helium 0x0000000000194c50  HGRasterizerAntiAliasingImplementation::GetAntiAliasSampleCountDefault() const  [ICF-folded with Maximum]
//   @Helium 0x0000000000194c50  HGRasterizerAntiAliasingImplementation::GetAntiAliasSampleCountMaximum() const  [ICF-folded with Default]
//   @Helium 0x0000000000194c60  HGRasterizerAntiAliasingImplementation::GetAntiAliasSampleCount() const
//   @Helium 0x0000000000194c70  HGRasterizerAntiAliasingImplementation::SetAntiAliasSampleCount(unsigned int)
//   @Helium 0x0000000000194c80  HGRasterizerAntiAliasingImplementation::GetMSAASamples() const
//   @Helium 0x00000000001a0580  HGRasterizerAntiAliasingImplementation::~HGRasterizerAntiAliasingImplementation()  (D1, in-place — ICF-folded with D0 body @0x1a0590)
//   @Helium 0x00000000001a0590  HGRasterizerAntiAliasingImplementation::~HGRasterizerAntiAliasingImplementation()  (D0, deleting)
//
// ICF confirmation (nm -arch x86_64 -n Helium | c++filt):
//   0x0000000000194c50 t HGRasterizerAntiAliasingImplementation::GetAntiAliasSampleCountDefault() const
//   0x0000000000194c50 t HGRasterizerAntiAliasingImplementation::GetAntiAliasSampleCountMaximum() const
// Both mangled names resolve to the same 12-byte body `movl $0x8, %eax; retq`,
// so both are transcribed as returning the same constant `8`.
//
// SOURCE DISASSEMBLY (raw-port/re/disasm/):
//   Helium.HGRasterizerAntiAliasingImplementation.GetAntiAlias.s                     @0x194c10
//   Helium.HGRasterizerAntiAliasingImplementation.SetAntiAlias.s                     @0x194c20
//   Helium.HGRasterizerAntiAliasingImplementation.GetAntiAliasTechnique.s            @0x194c30
//   Helium.HGRasterizerAntiAliasingImplementation.SetAntiAliasTechnique.s            @0x194c40
//   Helium.HGRasterizerAntiAliasingImplementation.GetAntiAliasSampleCountMaximum.s   @0x194c50
//   Helium.HGRasterizerAntiAliasingImplementation.GetAntiAliasSampleCount.s          @0x194c60
//   Helium.HGRasterizerAntiAliasingImplementation.SetAntiAliasSampleCount.s          @0x194c70
//   Helium.HGRasterizerAntiAliasingImplementation.GetMSAASamples.s                   @0x194c80
//   Helium.HGRasterizerAntiAliasingImplementation.~HGRasterizerAntiAliasingImplementation.s  @0x1a0590 (D0)
//
// STRUCT LAYOUT (recovered from the exact byte offsets touched by the ten
// exported methods; see per-method comments for the loads/stores):
//
//   struct HGRasterizerAntiAliasingImplementation : HGObject {  // sizeof >= 0x18
//     // +0x00..+0x07  base HGObject subobject (vptr, refcount, etc. —
//     //               see raw-port/src/render/HGObject-family; not touched
//     //               by any exported method of THIS class).
//     // +0x08..+0x0b  4 bytes never touched by any exported method here
//     //               (possibly tail padding of the HGObject base, or a
//     //               base-class field this subclass does not access).
//     bool     antiAliasEnabled;      // +0x0C   (byte).  Read as movzbl in
//                                     //         GetAntiAlias @0x194c14; written
//                                     //         as movb in SetAntiAlias @0x194c24;
//                                     //         compared byte-wise ("cmpb $0x1") in
//                                     //         GetMSAASamples @0x194c89.
//     // +0x0D..+0x0F  3 bytes of alignment padding before the next 4-byte field.
//     uint32_t technique;             // +0x10   (dword). This is the
//                                     //         AntiAliasTechnique enum; its
//                                     //         underlying type is a 4-byte
//                                     //         int (SetAntiAliasTechnique @0x194c44
//                                     //         stores %esi (32-bit) into +0x10;
//                                     //         GetAntiAliasTechnique @0x194c34
//                                     //         reads +0x10 as movl into %eax;
//                                     //         GetMSAASamples @0x194c8f compares
//                                     //         +0x10 to zero as cmpl).
//                                     //         Concrete enumerator values are
//                                     //         not observable from this class's
//                                     //         own methods; the only encoded
//                                     //         invariant is:
//                                     //           technique == 0  ==> MSAA path
//                                     //                              (uses sampleCount)
//                                     //           technique != 0  ==> non-MSAA path
//                                     //                              (forces 1 sample)
//                                     //         So enumerator 0 IS the "MSAA"
//                                     //         value (deduced from GetMSAASamples
//                                     //         @0x194c8f-0x194c9a).
//     uint32_t sampleCount;           // +0x14   (dword). Read as movl in
//                                     //         GetAntiAliasSampleCount @0x194c64
//                                     //         and in GetMSAASamples @0x194c97;
//                                     //         written as movl in
//                                     //         SetAntiAliasSampleCount @0x194c74.
//   };
//
// The Default() / Maximum() methods are pure (no `this` load) and share the
// exact same 12-byte body under Apple's ICF-folded link, so they neither read
// nor write the instance — the value `8` is a compile-time property of the
// class, not of any field.
//
// This file transcribes the ten methods 1:1 against the disasm above. Because
// this class is a plain configuration record and the eight non-dtor methods
// have no external callees (no callq in any of the ten bodies except the
// dtor's HGObject chain), there are no throw-stubs for undecoded callees.

import { HGObject } from "./HGObject.js";

// The concrete enumerator values are not observable from this class's own
// disassembly (SetAntiAliasTechnique stores whatever %esi is passed, without
// any range check or lookup table). All we can prove from THIS class's asm is
// the invariant enforced by GetMSAASamples @0x194c80 — namely that value 0
// takes the MSAA branch and every other value takes the non-MSAA branch.
// Therefore the enum is modeled as a numeric brand with the single named
// enumerator "MSAA = 0" and any other integer is an opaque "non-MSAA
// technique" whose meaning is defined by other classes that read technique
// (out of scope for this file).
export type AntiAliasTechnique = number & { readonly __antiAliasTechniqueBrand: unique symbol };
export const AntiAliasTechnique_MSAA: AntiAliasTechnique = 0 as AntiAliasTechnique;

// Instance state — mirrors the fields at +0x0c/+0x10/+0x14 of the C++ object.
// (The +0x00..+0x0b HGObject base subobject is modeled elsewhere via
// HGObject.ts; this class does not read or write any byte in that range.)
export interface HGRasterizerAntiAliasingImplementation {
  antiAliasEnabled: boolean;   // +0x0C
  technique: AntiAliasTechnique; // +0x10
  sampleCount: number;         // +0x14 — uint32
}

// GetAntiAlias() const — @Helium 0x0000000000194c10
// Disasm (raw-port/re/disasm/Helium.HGRasterizerAntiAliasingImplementation.GetAntiAlias.s):
//   0x194c10  pushq %rbp / movq %rsp,%rbp
//   0x194c14  movzbl 0xc(%rdi), %eax     ; %eax = zero-extended byte at +0xc
//   0x194c18  popq %rbp / retq
// Returns the enable flag verbatim (any non-zero byte -> true, zero -> false).
export function HGRasterizerAntiAliasingImplementation_GetAntiAlias(
  self: HGRasterizerAntiAliasingImplementation,
): boolean {
  return self.antiAliasEnabled;
}

// SetAntiAlias(bool) — @Helium 0x0000000000194c20
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.SetAntiAlias.s):
//   0x194c20  pushq %rbp / movq %rsp,%rbp
//   0x194c24  movb  %sil, 0xc(%rdi)      ; store low byte of the bool arg to +0xc
//   0x194c28  popq %rbp / retq
export function HGRasterizerAntiAliasingImplementation_SetAntiAlias(
  self: HGRasterizerAntiAliasingImplementation,
  v: boolean,
): void {
  self.antiAliasEnabled = v;
}

// GetAntiAliasTechnique() const — @Helium 0x0000000000194c30
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.GetAntiAliasTechnique.s):
//   0x194c30  pushq %rbp / movq %rsp,%rbp
//   0x194c34  movl  0x10(%rdi), %eax     ; %eax = 32-bit int at +0x10
//   0x194c37  popq %rbp / retq
export function HGRasterizerAntiAliasingImplementation_GetAntiAliasTechnique(
  self: HGRasterizerAntiAliasingImplementation,
): AntiAliasTechnique {
  return self.technique;
}

// SetAntiAliasTechnique(AntiAliasTechnique) — @Helium 0x0000000000194c40
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.SetAntiAliasTechnique.s):
//   0x194c40  pushq %rbp / movq %rsp,%rbp
//   0x194c44  movl  %esi, 0x10(%rdi)     ; store the 32-bit enum arg at +0x10
//   0x194c47  popq %rbp / retq
// Note: no range check — the store is unconditional; whatever caller passes
// lands verbatim. Preserve that behavior here (no clamp / no validation).
export function HGRasterizerAntiAliasingImplementation_SetAntiAliasTechnique(
  self: HGRasterizerAntiAliasingImplementation,
  v: AntiAliasTechnique,
): void {
  self.technique = v;
}

// GetAntiAliasSampleCountDefault() const — @Helium 0x0000000000194c50
// GetAntiAliasSampleCountMaximum() const — @Helium 0x0000000000194c50 (ICF-folded, same body)
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.GetAntiAliasSampleCountMaximum.s):
//   0x194c50  pushq %rbp / movq %rsp,%rbp
//   0x194c54  movl  $0x8, %eax           ; constant 8
//   0x194c59  popq %rbp / retq
// The two methods share a single body under the linker's identical-code
// folding pass — proven above by matching addresses in `nm -n` output.
export function HGRasterizerAntiAliasingImplementation_GetAntiAliasSampleCountDefault(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _self: HGRasterizerAntiAliasingImplementation,
): number {
  return 8;
}
export function HGRasterizerAntiAliasingImplementation_GetAntiAliasSampleCountMaximum(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _self: HGRasterizerAntiAliasingImplementation,
): number {
  return 8;
}

// GetAntiAliasSampleCount() const — @Helium 0x0000000000194c60
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.GetAntiAliasSampleCount.s):
//   0x194c60  pushq %rbp / movq %rsp,%rbp
//   0x194c64  movl  0x14(%rdi), %eax     ; %eax = 32-bit sampleCount at +0x14
//   0x194c67  popq %rbp / retq
export function HGRasterizerAntiAliasingImplementation_GetAntiAliasSampleCount(
  self: HGRasterizerAntiAliasingImplementation,
): number {
  return self.sampleCount;
}

// SetAntiAliasSampleCount(unsigned int) — @Helium 0x0000000000194c70
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.SetAntiAliasSampleCount.s):
//   0x194c70  pushq %rbp / movq %rsp,%rbp
//   0x194c74  movl  %esi, 0x14(%rdi)     ; store the 32-bit unsigned arg at +0x14
//   0x194c77  popq %rbp / retq
// Signature takes `unsigned int` — the store is a plain 32-bit movl, no
// masking / clamping. Callers pass values that also come from unsigned int
// (e.g. GetAntiAliasSampleCountDefault returns 8), so this stays as a plain
// integer with the same signedness contract at the field level.
export function HGRasterizerAntiAliasingImplementation_SetAntiAliasSampleCount(
  self: HGRasterizerAntiAliasingImplementation,
  v: number,
): void {
  // Model C's 32-bit unsigned truncation: `movl %esi, 0x14(%rdi)` stores only
  // the low 32 bits of whatever was in %esi (32-bit source register).
  self.sampleCount = v >>> 0;
}

// GetMSAASamples() const — @Helium 0x0000000000194c80
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.GetMSAASamples.s):
//   0x194c80  pushq %rbp / movq %rsp,%rbp
//   0x194c84  movl  $0x1, %eax           ; eax = 1  (default: 1 sample)
//   0x194c89  cmpb  $0x1, 0xc(%rdi)      ; if antiAliasEnabled != 1 (i.e. == 0)
//   0x194c8d  jne   0x194c95             ;   fall through to ret with eax=1
//   0x194c8f  cmpl  $0x0, 0x10(%rdi)     ; else if technique != 0 (non-MSAA)
//   0x194c93  je    0x194c97             ;   fall through to ret with eax=1
//   0x194c95  popq %rbp / retq           ; return 1
//   0x194c97  movl  0x14(%rdi), %eax     ; else (AA on, technique == 0 / MSAA)
//   0x194c9a  popq %rbp / retq           ; return sampleCount
//
// Note: the byte compare is `cmpb $0x1` (equals 1 exactly). Any non-1 value
// of the flag byte (including 0) takes the "AA off" path. In practice
// SetAntiAlias stores %sil which for a `bool` argument is 0 or 1, so this is
// equivalent to `if (antiAliasEnabled) …` — we preserve the exact literal
// compare here.
export function HGRasterizerAntiAliasingImplementation_GetMSAASamples(
  self: HGRasterizerAntiAliasingImplementation,
): number {
  // @0x194c89 cmpb $0x1, 0xc(%rdi) / jne -> return 1
  // Compare the raw flag byte to literal 1 (not "truthy").
  const flagByte = self.antiAliasEnabled ? 1 : 0;
  if (flagByte !== 1) return 1;
  // @0x194c8f cmpl $0x0, 0x10(%rdi) / je -> return sampleCount ; else 1
  if ((self.technique as unknown as number) !== 0) return 1;
  // @0x194c97 movl 0x14(%rdi), %eax
  return self.sampleCount >>> 0;
}

// ~HGRasterizerAntiAliasingImplementation() — @Helium 0x00000000001a0590 (D0, deleting)
// Disasm (Helium.HGRasterizerAntiAliasingImplementation.~HGRasterizerAntiAliasingImplementation.s):
//   0x1a0590  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//   0x1a0596  movq  %rdi, %rbx
//   0x1a0599  callq __ZN8HGObjectD2Ev              ## HGObject::~HGObject()  @Helium 0x1a0ed0
//   0x1a059e  movq  %rbx, %rdi
//   0x1a05a1  addq  $0x8, %rsp / popq %rbx / popq %rbp
//   0x1a05a7  jmp   __ZN8HGObjectdlEPv             ## HGObject::operator delete(void*)  @Helium 0x1a0f10
//
// D0 (deleting dtor): (1) run the HGObject base destructor in-place on `this`
//                     via `HGObject::~HGObject()` @Helium 0x1a0ed0
//                     (see raw-port/src/render/HGObject.ts::destruct — a no-op
//                     because HGObject holds no owned resources),
//                     (2) tail-call `HGObject::operator delete(this)` @Helium
//                     0x1a0f10 (see raw-port/src/render/HGObject.ts::operatorDelete
//                     — a no-op in a GC'd runtime).
// This class has no owned resources beyond its POD fields — the entire body
// is chained down into HGObject. The D1 in-place dtor at @0x1a0580 has an
// even shorter body (just the HGObject::~HGObject() call, no operator delete)
// but its exact disasm is not extracted here because otool -tV emits no label
// for it under Apple's ICF pass (D0 and D1 folded); the D0 body above IS the
// full deleting-dtor semantics.
export function HGRasterizerAntiAliasingImplementation_dtor_D0(
  self: HGRasterizerAntiAliasingImplementation,
): void {
  // callq __ZN8HGObjectD2Ev  @Helium 0x1a0ed0 — HGObject base destructor
  HGObject.prototype.destruct.call(self as unknown as HGObject);
  // jmp   __ZN8HGObjectdlEPv @Helium 0x1a0f10 — HGObject::operator delete
  HGObject.operatorDelete(self as unknown as HGObject);
}
