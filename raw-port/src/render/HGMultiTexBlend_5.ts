// HGMultiTexBlend_5.ts — raw transcription of Helium's `HGMultiTexBlend<5>`.
//
// Template instantiation naming: `<5>` becomes `_5`, matching the landed
// precedents raw-port/src/channels/HDemosaic_1.ts, raw-port/src/render/HDemosaic_2.ts
// and raw-port/src/render/HgcBlendBlur_3.ts (and PORTING_SPEC's PCMatrix44Tmpl
// rule). The non-template base class is landed separately as
// raw-port/src/render/HGMultiTexBlendBase.ts.
//
// ONE symbol is transcribed in this file — `setWeight(int, float)`. Every other
// member of this instantiation is a SEPARATE ledger unit and is NOT ported here:
//   0x10fa30  HGMultiTexBlend<5>()                       [C1]
//   0x110860  HGMultiTexBlend<5>()                       [C2]
//   0x10fb30  _createMultiTexBlendNode()
//   0x110a90/0x110b40/0x110b50  ~HGMultiTexBlend<5>()    [D2/D1/D0]
//   0x110b70  setTransform(int, HGTransform*)            (read below, not ported)
//   0x110be0  GetOutput(HGRenderer*)
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x110bc0  HGMultiTexBlend<5>::setWeight(int, float)
//                __ZN15HGMultiTexBlendILi5EE9setWeightEif
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZN15HGMultiTexBlendILi5EE9setWeightEif Helium`):
//   raw-port/re/disasm/Helium.__ZN15HGMultiTexBlendILi5EE9setWeightEif.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x110bc0  pushq  %rbp                          ; frame setup (no TS counterpart)
//   0x110bc1  movq   %rsp, %rbp
//   0x110bc4  movslq %esi, %rax                    ; SIGN-extend the index
//   0x110bc7  movss  %xmm0, 0x198(%rdi,%rax,4)     ; weights[index] = w  (4-byte store)
//   0x110bd0  popq   %rbp
//   0x110bd1  retq
//   0x110bd2  nopw   %cs:(%rax,%rax)               ; padding, not executed
//
// TWO things this body does NOT do, both worth stating because a "reasonable"
// port would add them:
//   * NO BOUNDS CHECK. There is no compare and no branch — any index is used.
//   * The index is SIGN-extended (`movslq`, not `movl`), so a NEGATIVE index
//     addresses BEFORE the array and writes into whatever member lives there.
//     Measured on the live function: index -1 and -2 write at +0x194 and +0x190
//     exactly (the harness places the object mid-arena so those stores stay in
//     its own allocation).
//
// ---------------------------------------------------------------------------
// STRUCT LAYOUT (partial — only what a decoded instruction proves)
// ---------------------------------------------------------------------------
//   +0x198  float weights[5]   — this unit's array; 4-byte stride from the
//                                `,4)` scale factor. Spans +0x198..+0x1ab.
//   +0x1c0  HGTransform* transforms[5] — the sibling `setTransform(int,
//                                HGTransform*)` @0x110b7d indexes it with an
//                                8-byte stride (`0x1c0(%rdi,%r14,8)`), also with
//                                a `movslq` and no bounds check. Read here only
//                                to bound the weights array: the next member
//                                starts at +0x1c0, which leaves room for exactly
//                                5 floats plus padding — corroborating the
//                                template parameter. NOT ported here.
//   everything else — the opaque HGMultiTexBlendBase/HGNode subobject; untouched
//                     by this unit and deliberately not modelled (Rule 5).
//
// CALLEES: none — no callq, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/HGMultiTexBlend_5_setWeight_oracle.py calls the LIVE
// function. The symbol is LOCAL (`nm` type `t` — a template instantiation with
// internal linkage), so dlsym cannot reach it; it is called at dyld slide +
// 0x110bc0 through ozone_loader.py, which refuses to run outside x86_64. 120
// cases (indices -2..7 x 12 float BIT PATTERNS: ±0.0, ±1.0, ±inf, a quiet NaN
// with a payload, a SIGNALLING NaN, 0.1f, 65535.0f, the smallest subnormal):
// every store landed at exactly 0x198 + index*4, carried the exact 32 bits, and
// changed NO other byte of a 0x800-byte arena — 120/120.
// NEGATIVE CONTROLS (measured, same 120 cases): an UNSIGNED index -> 24 wrong;
// an 8-byte stride (the transform array's) -> 108 wrong; basing the array at
// +0x1c0 -> 120 wrong.
// HARNESS NOTE worth keeping: `ctypes.c_float(python_float)` routes through a C
// double and QUIETS a signalling NaN, which showed up as 10 false divergences
// against this (correct) port until the harness injected the bits directly into
// a c_float. The mangling was on the way IN, not on the way out.

/**
 * `HGMultiTexBlend<5>` — Helium's 5-texture blend node.
 *
 * Only the weights array this unit writes is modelled; the rest of the layout
 * (including the `HGTransform*` array at +0x1c0 that `setTransform` @0x110b70
 * owns) belongs to other ledger units.
 *
 * @Helium 0x110bc0
 */
export class HGMultiTexBlend_5 {
  /**
   * @Helium HGMultiTexBlend<5>@0x198 — `float weights[5]`, written by
   * `setWeight` @0x110bc7 with `movss %xmm0, 0x198(%rdi,%rax,4)`. The 4-byte
   * scale factor in that addressing mode is what fixes the element width, and
   * the sibling array at +0x1c0 is what bounds the length at 5 (the template
   * parameter). A Float32Array stores the exact 32-bit pattern the `movss`
   * stores, including NaN payloads and signed zero — verified bit-for-bit
   * against the live function.
   */
  weights_at_0x198: Float32Array = new Float32Array(5); // @Helium HGMultiTexBlend<5>@0x198

  /**
   * `HGMultiTexBlend<5>::setWeight(int index, float w)` — @Helium 0x110bc0
   *   __ZN15HGMultiTexBlendILi5EE9setWeightEif
   *
   * Stores `w` into `weights[index]`. The entire body is one `movss` between a
   * frame prologue and a `retq`: no bounds check, no clamp, no branch, no
   * callee — see the FULL DISASM block in the file header.
   *
   * @param index the weight slot (SysV %esi, SIGN-extended by `movslq` @0x110bc4).
   * @param w     the weight (SysV %xmm0, float32).
   */
  setWeight(index: number, w: number): void {
    // @0x110bc4 — movslq %esi, %rax : the index is a SIGNED 32-bit value.
    //   `| 0` reproduces that sign, so a negative index stays negative here
    //   instead of becoming a huge positive one.
    const i = index | 0;

    if (i < 0 || i >= this.weights_at_0x198.length) {
      // The machine has NO bounds check: it computes 0x198 + i*4 and stores
      // there, so an out-of-range index writes over a NEIGHBOURING MEMBER (a
      // negative one writes before the array; i >= 10 reaches the +0x1c0
      // transform pointers). A Float32Array would instead swallow the write
      // silently, which is a DIFFERENT behaviour and exactly the quiet-wrong
      // class this project keeps getting burned by, and modelling the real
      // effect would require a byte-level model of a layout that is not
      // decoded. So this is the loud gap PORTING_SPEC Rule 3 asks for.
      throw new Error(
        `HGMultiTexBlend<5>::setWeight @Helium 0x110bc7: index ${i} is outside ` +
          'weights[5] — the binary performs an UNCHECKED store at 0x198 + index*4 ' +
          'and would overwrite an adjacent member; this port will not silently ' +
          'drop the write',
      );
    }

    // @0x110bc7 — movss %xmm0, 0x198(%rdi,%rax,4) : one 4-byte store.
    //   Assigning into a Float32Array performs exactly the float32 store the
    //   machine does (`Math.fround` would be redundant: the element type
    //   already rounds, and a NaN payload survives either way).
    this.weights_at_0x198[i] = w;
    // @0x110bd0/@0x110bd1 — epilogue + retq (void).
  }
}
