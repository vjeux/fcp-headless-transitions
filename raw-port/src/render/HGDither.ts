// HGDither.ts — Helium's HGDither render node. Transcribed from the disassembly at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
// See raw-port/re/disasm/Helium.HGDither.*.s and grep on /tmp/Helium_symmap.tsv.
//
// ROLE. Dithering render node. Two float32 fields per parameter slot; a boolean clampMode flag.
// SetParameter(idx=0, x, _, _, _) toggles a hidden gain-nonzero bit at +0x1C0 and returns 1
// iff the bit's value CHANGED (the standard HGNode invalidation contract), else 0. SetClampMode
// writes the same byte from a bool. GetOutput drives an HGLUTCache-cached LUT-generation
// pipeline (@0x6fa50..@0x6fcfe) — not yet transcribed here.
//
// STRUCT LAYOUT (455+ bytes, recovered from ctor 0x6f8d0):
//   +0x000  vtbl                : *const void  // vtable pointer (leaq 0x999053(%rip) @0x6f8de ->
//                                              //   const at Helium 0x9a893a; 0x6f8e5 + 0x999053)
//   +0x008..+0x197              // HGNode base subobject (see raw-port/src/render/HGNode.ts;
//                               //   HGNode extends HGObject).
//   +0x198  paramSlots          : ptr/nullable  // movq $0, 0x198(%rbx) @0x6f8e8 - init to null.
//                               //   Populated later (likely a std::vector<float[4]> of size N
//                               //   per SetParameter's 4-float shape; the exact container isn't
//                               //   used by SetParameter idx=0 path so we leave layout tbd).
//   +0x1c0  clampOrGainNonzero  : uint8_t/bool  // movb $0x1, 0x1c0(%rbx) @0x6f8f3 - init true.
//                               //   Written by SetClampMode (raw bool @0x6fa04) AND by
//                               //   SetParameter idx=0 (the "gain != 0" derived bit @0x6fa37).
//                               //   The two writers being identical means the field is
//                               //   BOTH the clamp-mode flag AND the "has gain" flag — an
//                               //   overloaded state bit in the FCP encoding.
//                               //   [NOTE. The overlap looks suspicious but is what the asm does;
//                               //    a bug in FCP or a semantic-union we haven't decoded yet.
//                               //    We preserve it faithfully per PORTING_SPEC Rule 1/3.]
//
// The stored ctor vtable pointer const at Helium 0xa08938 is set BEFORE the HGNode ctor's
// vtable overwrite (which happens INSIDE HGNode::HGNode @Helium 0x11bafd's own ctor). The
// order here — HGNode base ctor first, then leaf ctor stores HGDither vtable at (%rbx) — is
// the standard Itanium C++ ABI derived-ctor sequence and mirrors HGNode::HGNode's own layering
// (HGObject then HGNode). We import the real HGNode base.
import { HGNode } from "./HGNode.js";

// ── vtable constant ──────────────────────────────────────────────────────────
/** Address of the HGDither vtable in Helium's __DATA (@0xa08938 — from
 *  `leaq 0x999053(%rip), %rax` @0x6f8de: 0x6f8e5 + 0x999053 = 0xa08938). */
const VTABLE_HGDITHER: number = 0xa08938;
// NB the numeric value above is the RESULT of the RIP-relative compute; kept as a documented
// constant for reviewer parity, not used at runtime.

/**
 * HGDither — dithering render node (HGNode subclass).
 * All addresses cited in Helium.
 */
export class HGDither extends HGNode {
  /** +0x198 — parameter-slots pointer, initialized null. */
  public paramSlots: unknown | null;

  /**
   * +0x1c0 — clampMode / gain-nonzero bit (overloaded — see class-header note).
   * Written by BOTH SetClampMode (raw bool @0x6fa04) AND SetParameter idx=0 (@0x6fa37: bit =
   * (gain != 0.0f)). We keep it as a boolean; the asm treats it as a 1-byte value.
   */
  public clampOrGainNonzero: boolean;

  /**
   * HGDither::HGDither()  @Helium 0x6f8d0  (C1; C2 aliases C1 per __ZN8HGDitherC2Ev entry).
   *
   * Disasm (raw-port/re/disasm/Helium.HGDither.HGDither.s):
   *   0x6f8d9  callq  __ZN6HGNodeC2Ev                ; HGNode::HGNode() base ctor
   *   0x6f8de  leaq   0x999053(%rip), %rax           ; vtable const @Helium 0x9a893a
   *   0x6f8e5  movq   %rax, (%rbx)                   ; this[0] = HGDither vtbl
   *   0x6f8e8  movq   $0x0, 0x198(%rbx)              ; paramSlots = null
   *   0x6f8f3  movb   $0x1, 0x1c0(%rbx)              ; clampOrGainNonzero = true
   */
  public constructor() {
    super();                                          // HGNode::HGNode() @Helium 0x11bafd
    // The HGNode vtable was already written by super's ctor at HGNode +0x11bb09; we now
    // overwrite that pointer with HGDither's own vtable. In JS the vtable is not observable
    // so we skip the write; kept as a comment for reviewer diff-parity with the asm.
    // this.vtable = 0xa08938;  // @0x6f8e5 (see VTABLE_HGDITHER above)
    void VTABLE_HGDITHER;
    this.paramSlots = null;                           // movq $0, 0x198 @0x6f8e8
    this.clampOrGainNonzero = true;                   // movb $1, 0x1c0 @0x6f8f3
  }

  /**
   * HGDither::SetClampMode(bool)  @Helium 0x6fa00.
   *
   *   0x6fa04  movb %sil, 0x1c0(%rdi)   ; this->clampOrGainNonzero = arg
   *   0x6fa0b  popq %rbp; retq
   *
   * NB. This IS a simple bool write — no invalidation return, no compare-and-set. Callers
   * that rely on a change-detected callback do so via SetParameter, not this method.
   */
  public setClampMode(clamp: boolean): void {
    this.clampOrGainNonzero = clamp;                  // movb %sil, 0x1c0 @0x6fa04
  }

  /**
   * HGDither::SetParameter(int idx, float gain, float, float, float)  @Helium 0x6fa10.
   * Returns 0xFFFFFFFF (-1 as u32) if idx != 0, else returns 1 iff (gain != 0) changed the
   * flag at +0x1c0, else 0. The three trailing floats are IGNORED (never referenced in the
   * disasm — the compiler doesn't even reserve stack for them).
   *
   *   0x6fa14  movl   $0xffffffff, %eax            ; default return = -1u
   *   0x6fa19  testl  %esi, %esi                    ; if idx == 0 continue
   *   0x6fa1b  je     0x6fa1f                       ;   else return -1u
   *   0x6fa1d  popq %rbp; retq
   *
   * The idx==0 path derives a bool from a float:
   *   0x6fa1f  xorps  %xmm1, %xmm1                  ; xmm1 = 0.0f (packed)
   *   0x6fa22  ucomiss %xmm1, %xmm0                 ; compare gain against 0.0f (single-prec)
   *   0x6fa25  setp   %al                           ; al = 1 iff PF (NaN or unordered)
   *   0x6fa28  setne  %cl                           ; cl = 1 iff not-equal
   *   0x6fa2b  orb    %al, %cl                      ; cl = "not-equal OR NaN" == "gain != 0.0"
   *                                                   (matches C++ (gain != 0.0f) semantics
   *                                                    with NaN treated as unequal.)
   *   0x6fa2d  xorl   %eax, %eax                    ; default result = 0 (unchanged)
   *   0x6fa2f  cmpb   %cl, 0x1c0(%rdi)              ; compare with stored flag
   *   0x6fa35  je     0x6fa1d                       ; if same, retq (result stays 0)
   *   0x6fa37  movb   %cl, 0x1c0(%rdi)              ; else write new flag
   *   0x6fa3d  movl   $1, %eax                      ;   result = 1 (changed)
   *   0x6fa42  popq %rbp; retq
   *
   * NB. The write happens ONLY on the changed branch — matching how HGNode invalidation
   * bubbles up: "return 1" means "recompute LUT". We mirror the branch structure exactly.
   */
  public setParameter(idx: number, gain: number, _p2: number, _p3: number, _p4: number): number {
    if ((idx | 0) !== 0) return 0xffffffff | 0;       // testl %esi,%esi; jne -> return -1u
    // Single-precision comparison: fround(gain) != fround(0.0). NaN treated as "not equal to 0"
    // per the setp|setne bitwise-or (matches C++ IEEE-754 "!=" on floats).
    const g = Math.fround(gain);
    const newBit: boolean = (g !== 0.0) || Number.isNaN(g);  // orb setp,setne @0x6fa2b
    // NB. IEEE-754 "NaN != 0.0" is already true in JS's `!==`, so the explicit Number.isNaN
    // catch is redundant — kept only to make the asm's setp path visible in review.
    void newBit;
    const asBool: boolean = g !== 0.0;                // in JS (g !== 0.0) is already NaN-safe
    if (this.clampOrGainNonzero === asBool) return 0; // cmpb %cl, 0x1c0; je -> return 0
    this.clampOrGainNonzero = asBool;                 // movb %cl, 0x1c0 @0x6fa37
    return 1;                                          // movl $1, %eax @0x6fa3d
  }

  /**
   * HGDither::GetOutput(HGRenderer*)  @Helium 0x6fa50 (284 lines of disasm).
   *
   * Drives an HGLUTCache-cached LUT-generation pipeline:
   *   @0x6fa64  once-check HGDither::GetOutput()::lutFactory guard var
   *   @0x6fa78  operator new(0x10)                    ; allocate a LUTInfo
   *   @0x6fa80..@0x6fa8a store its vtable + a 0x3 tag
   *   @0x6faa0  HGLUTCacheManager::getLUTCache(&lutFactory)
   *   @0x6faab  HGLUTCache::getNewLUT(cache, LUTInfo*)
   *   ... etc. Depends on:
   *     * HGLUTCacheManager                (not yet transcribed)
   *     * HGLUTCache                       (not yet transcribed)
   *     * HGDither::GetOutput()::lutFactory static (LUTEntryFactory subclass — the .cold.1)
   *     * HGRenderer's +0x228 field access
   *     * HGNode virtual-slot dispatches into the base
   *
   * Per PORTING_SPEC Rule 3 (throw on undecoded, never approximate) — cited stub.
   */
  public getOutput(_renderer: unknown): unknown {
    throw new Error(
      "HGDither::GetOutput @Helium 0x6fa50 not yet transcribed — depends on HGLUTCache," +
      " HGLUTCacheManager, and the .cold.1 lutFactory init at @Helium 0x6fcfe."
    );
  }

  /**
   * HGDither::~HGDither()  D0 (deleting) @Helium 0x6f910+.
   * D1/D2 aliases per the __ZN8HGDitherD{0,1,2}Ev entries. Not yet disassembled here —
   * the base HGNode dtor handles the heavy lifting; we no-op in JS.
   */
  public dispose(): void {
    /* no-op — JS has no explicit delete; HGNode dispose (if any) handled at base */
  }
}
