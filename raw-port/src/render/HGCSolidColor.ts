/**
 * HGCSolidColor — Helium framework
 *
 * A Helium render node ("HGC" = Helium Graphics Component) representing a
 * constant/solid-color source. Ports the three exported symbols:
 *
 *   @0x000000000011b330  HGCSolidColor::GetDOD(HGRenderer*, int, HGRect)
 *   @0x000000000011b700  HGCSolidColor::~HGCSolidColor()  [D1 base dtor]
 *   @0x000000000011b710  HGCSolidColor::~HGCSolidColor()  [D0 deleting dtor]
 *
 * Struct layout recovered from the disasm of GetDOD:
 *   struct HGCSolidColor {
 *     ... (parent + earlier fields, unresolved) ...
 *     HGRect   dod;   // at offset 0x1a0..0x1b0 — the cached Domain-of-Definition
 *     ...
 *   };
 *
 * The dtor thunks and delete-op callee (HGObject::operator delete) are cited
 * but only partly resolved — they remain THROWing stubs, per DECODE-DON'T-FIT.
 */

import { HGRect, HGRectNull } from './HGRect';

/** Forward decl — HGRenderer isn't ported yet; keep as opaque handle. */
export interface HGRenderer {}

export class HGCSolidColor {
  /**
   * Cached DOD rectangle at struct offset 0x1a0 (16 bytes). Faithfully modelled
   * as an HGRect field. All other fields are unresolved (parent hierarchy).
   */
  dod: HGRect = { x: 0, y: 0, right: 0, bottom: 0 };

  /**
   * @0x000000000011b330  __ZN13HGCSolidColor6GetDODEP10HGRendereri6HGRect
   *
   * Faithful transcription of:
   *   leaq  0x1a0(%rdi), %rax        ; rax = &this->dod  (low 8 bytes)
   *   addq  $0x1a8, %rdi             ; rdi = &this->dod + 8 (high 8 bytes)
   *   leaq  _HGRectNull(%rip), %rcx  ; rcx = &HGRectNull
   *   leaq  0x8(%rcx), %rsi          ; rsi = &HGRectNull + 8
   *   testl %edx, %edx               ; test int arg (`edx`)
   *   cmovneq %rcx, %rax             ; if edx != 0: rax = &HGRectNull
   *   cmoveq  %rdi, %rsi             ; if edx == 0: rsi = &this->dod+8
   *   movq  (%rsi), %rdx             ; rdx = high 8B
   *   movq  (%rax), %rax             ; rax = low 8B
   *   retq                           ; returns HGRect by value in (rax, rdx)
   *
   * Result (edx as the "which" selector):
   *   edx == 0 → return this->dod
   *   edx != 0 → return HGRectNull
   *
   * The HGRenderer* argument (rsi in the ABI, but never touched here) and the
   * incoming-by-value HGRect (passed in later regs) are UNUSED by this method
   * — this is a pure field-selector getter.
   */
  GetDOD(_renderer: HGRenderer | null, which: number, _r: HGRect): HGRect {
    // Force i32 semantics on the `which` selector (asm: testl %edx,%edx).
    const edx = which | 0;
    if (edx === 0) {
      // Return by-value copy — asm returns two 8B halves of this->dod.
      return {
        x: this.dod.x | 0,
        y: this.dod.y | 0,
        right: this.dod.right | 0,
        bottom: this.dod.bottom | 0,
      };
    }
    // edx != 0 → HGRectNull (all zeros per _HGRectNull @Helium 0x3d2284).
    return {
      x: HGRectNull.x | 0,
      y: HGRectNull.y | 0,
      right: HGRectNull.right | 0,
      bottom: HGRectNull.bottom | 0,
    };
  }

  /**
   * @0x000000000011b700  __ZN13HGCSolidColorD1Ev  (base object dtor)
   *
   * Faithful transcription:
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   jmp   __ZN13HgcSolidColorD2Ev  ## HgcSolidColor::~HgcSolidColor()
   *
   * NOTE the casing: the D1 thunk here jumps to `HgcSolidColor::~HgcSolidColor`
   * (lowercase 'g' 'c') — a different class from HGCSolidColor. Frontier
   * callee HgcSolidColor::~HgcSolidColor is not yet ported → THROWing stub.
   */
  destroyBase(): void {
    // jmp __ZN13HgcSolidColorD2Ev
    throw new Error(
      'HgcSolidColor::~HgcSolidColor (D2) @Helium unresolved — frontier callee cited by HGCSolidColor::~HGCSolidColor (D1) @0x11b705'
    );
  }

  /**
   * @0x000000000011b710  __ZN13HGCSolidColorD0Ev  (deleting dtor)
   *
   * Faithful transcription:
   *   pushq %rbp / movq %rsp,%rbp
   *   pushq %rbx
   *   pushq %rax                     ; align stack
   *   movq  %rdi, %rbx               ; save this
   *   callq __ZN13HgcSolidColorD2Ev  ## HgcSolidColor::~HgcSolidColor()
   *   movq  %rbx, %rdi               ; restore this into arg0
   *   addq  $0x8, %rsp / popq %rbx / popq %rbp
   *   jmp   __ZN8HGObjectdlEPv       ## HGObject::operator delete(void*)
   *
   * Two frontier callees — both unresolved:
   *   HgcSolidColor::~HgcSolidColor (D2)  @Helium (not yet ported)
   *   HGObject::operator delete(void*)     @Helium (not yet ported)
   */
  destroyAndDelete(): void {
    // callq HgcSolidColor::~HgcSolidColor
    throw new Error(
      'HGCSolidColor::~HGCSolidColor (D0) @0x11b710: callees unresolved — HgcSolidColor::~HgcSolidColor (D2) + HGObject::operator delete @Helium'
    );
  }
}
