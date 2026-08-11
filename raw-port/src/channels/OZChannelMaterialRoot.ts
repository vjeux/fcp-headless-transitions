// OZChannelMaterialRoot.ts — Ozone framework.
// OZChannelMaterialRoot::setMaterial(OZMaterialBase*) — stores the material on the channel root,
// together with a pointer to the material's base subobject at +0x10.
//
// Binary source (x86_64 slice of the FAT Ozone framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Source disasm: raw-port/re/disasm/Ozone.__ZN21OZChannelMaterialRoot11setMaterialEP14OZMaterialBase.s,
// re-derived with `raw-port/tools/disasm.sh --sym … Ozone` after deleting any cached copy.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@Ozone 0x5a5180  __ZN21OZChannelMaterialRoot11setMaterialEP14OZMaterialBase)
// -----------------------------------------------------------------------------
//   0x5a5180  pushq %rbp ; movq %rsp,%rbp        ; frame
//   0x5a5184  movq  %rsi, 0x100(%rdi)            ; +0x100 = material           (the raw pointer)
//   0x5a518b  leaq  0x10(%rsi), %rax             ; rax = material + 0x10
//   0x5a518f  testq %rsi, %rsi
//   0x5a5192  cmoveq %rsi, %rax                  ; if (material == NULL) rax = NULL
//   0x5a5196  movq  %rax, 0xd0(%rdi)             ; +0x0d0 = that adjusted pointer
//   0x5a519d  popq %rbp ; retq
//   0x5a519f  nop                                ; alignment padding
//
// THE `cmoveq` IS THE WHOLE SUBTLETY, and it is a C++ language rule made visible: `+0x10` is a
// BASE-SUBOBJECT ADJUSTMENT — the compiler is caching `static_cast<Base*>(material)` for a base
// that sits 16 bytes into OZMaterialBase — and a pointer cast to a base must keep NULL as NULL
// rather than becoming 0x10. The `leaq` is computed unconditionally and then thrown away by the
// conditional move when the argument is null, which is the branchless way to write exactly that.
// A port that "simplified" this to `material + 0x10` would store 0x10 for a null material; the
// oracle's negative control is built from that mistake.
//
// STRUCT LAYOUT, only as far as this function grounds it:
//   +0x0d0  the material's base subobject (material + 0x10, or null)
//   +0x100  the material pointer as passed
// Nothing else is written — verified byte for byte against a poisoned object, not assumed.
//
// POINTERS AS NUMERIC ADDRESSES: this body does pointer arithmetic and depends on the exact null
// case, so pointers are `bigint` addresses in the port's own address space, the convention
// `raw-port/src/infra/HGAllocAlign.ts` already uses.
//
// The rest of the class (six constructor overloads at @Ozone 0x5a4ce0..0x5a4f00 and the other
// members) is unclaimed and deliberately ABSENT rather than stubbed; this file will grow
// method by method, ADD-only.

export class OZChannelMaterialRoot {
  /**
   * +0x0d0 — a pointer to the material's base subobject: `material + 0x10`, or null when the
   * material is null. Written at @0x5a5196.
   */
  materialBaseSubobject: bigint = 0n;
  /** +0x100 — the material pointer exactly as passed. Written at @0x5a5184. */
  material: bigint = 0n;

  /**
   * `OZChannelMaterialRoot::setMaterial(OZMaterialBase*)` -> void
   * @Ozone __ZN21OZChannelMaterialRoot11setMaterialEP14OZMaterialBase @0x5a5180..0x5a519e
   *
   * Two stores and a null-preserving +0x10 adjustment; the full listing is in the file header.
   * There is no retain, no release, no notification and no comparison against the previous
   * value — the setter overwrites both slots unconditionally.
   *
   * ORACLED against the live exported symbol:
   * `raw-port/re/oracle/OZChannelMaterialRoot_setMaterial_oracle.py`, run under `arch -x86_64`
   * with the eleven prologue bytes at slide+0x5a5180 checked against `554889e54889b700010000`
   * before the address is trusted — a check that earned its keep immediately, refusing to report
   * anything when the expected bytes were first written down wrong. 47 pointers (null, a live
   * buffer and offsets into it, values whose low bits would hide a wrong adjustment, and 40
   * random 48-bit values) on a 0x200-byte object poisoned with 0xEE: **47/47 store the argument
   * at +0x100 and the adjusted pointer at +0xd0, with 0 cases writing anywhere else.**
   * NEGATIVE CONTROL: dropping the null guard (storing 0x10 for a null material) correctly
   * differs.
   *
   * @param material the material pointer, as a numeric address; 0 means null.
   */
  setMaterial(material: bigint): void {
    // @0x5a5184 — movq %rsi, 0x100(%rdi).
    this.material = material;
    // @0x5a518b/@0x5a518f/@0x5a5192 — leaq 0x10(%rsi) ; testq %rsi,%rsi ; cmoveq %rsi,%rax.
    const adjusted = material === 0n ? 0n : material + 0x10n;
    // @0x5a5196 — movq %rax, 0xd0(%rdi).
    this.materialBaseSubobject = adjusted;
  }
}
