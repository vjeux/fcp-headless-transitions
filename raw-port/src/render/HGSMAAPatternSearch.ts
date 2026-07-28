// HGSMAAPatternSearch — SMAA (Subpixel Morphological Anti-Aliasing) "pattern search" pass node.
// Framework: Helium
// Provenance (raw-port/re/disasm/Helium.HGSMAAPatternSearch.*.s):
//   ~HGSMAAPatternSearch (D2/base)             @0x211b10  (raw otool listing — ICF-adjacent)
//   ~HGSMAAPatternSearch (D0/deleting)         @0x211b60  (__ZN19HGSMAAPatternSearchD0Ev)
//   GetDOD(HGRenderer*, int, HGRect)           @0x211bb0  (__ZN19HGSMAAPatternSearch6GetDODEP10HGRendereri6HGRect)
//   GetROI(HGRenderer*, int, HGRect)           @0x211bd0  (__ZN19HGSMAAPatternSearch6GetROIEP10HGRendereri6HGRect)
//
// Callees / vtable refs (resolved via raw-port/army/tools/resolve.py Helium ...):
//   _HGRectNull                @0x3d2284     (16 zero bytes; import from ./HGRect)
//   _HGRectMake4i              @0x107710     (see ./HGRect HGRectMake4i)
//   _HGRectGrow                @0x107960     (see ./HGRect HGRectGrow)
//   __ZN6HGNodeD2Ev            HGNode::~HGNode() — base-class destructor (not yet transcribed)
//   __ZN8HGObjectdlEPv         HGObject::operator delete(void*) — deleting-dtor slab free (not yet transcribed)
//   __ZdlPv                    operator delete(void*) — libc++ heap free (not yet transcribed)
//   vtable @0xa2ea10           = vtable for HgcSMAAPatternSearch (+0x10) — so this class inherits
//                                from HGNode and its vptr is patched to HgcSMAAPatternSearch's vtable
//                                in the destructor prolog before running the base tear-down.
//
// STRUCT LAYOUT (recovered from method disasms only — this is a partial view):
//   +0x000  vptr                                       (patched to vtable for HgcSMAAPatternSearch)
//   +0x198  unknown owning pointer (some allocation);  freed via operator delete on the value at *(*+0x198 - 8)
//   +0x1a0  HGRect roiPass1.lo (int32 x, int32 y)      (read by GetROI when passIndex == 1)
//   +0x1a8  HGRect roiPass1.hi (int32 right, int32 bottom)
//   +0x1b0  HGRect roiPass2.lo                         (read by GetROI when passIndex == 2)
//   +0x1b8  HGRect roiPass2.hi
//
// The two stored HGRects at +0x1a0/+0x1b0 are almost certainly the SMAA
// "area / search" texture ROIs for passes 1 and 2 (this class is one node in
// the multi-pass SMAA chain). Their values are set elsewhere (constructor /
// setter — not visible from GetROI alone), so we model them as fields.

import type { HGRect } from './HGRect';
import { HGRectNull, HGRectMake4i, HGRectGrow } from './HGRect';

/**
 * HGSMAAPatternSearch — SMAA "pattern search" pass node.
 *
 * This is a thin Helium-facing wrapper around HgcSMAAPatternSearch (see the
 * vtable pointer patched in the destructor prolog @0x211b10 / @0x211b69).
 * It is a subclass of HGNode; the base destructor cleanup and the deleting
 * form are transcribed below but delegate to un-ported base helpers.
 */
export class HGSMAAPatternSearch {
  /**
   * Some owning allocation stored at struct-offset +0x198.
   *
   * The destructor reads *(this+0x198); if non-null, reads *(that-8); if
   * that inner pointer is non-null, passes it to operator delete. That is
   * the classic "aligned/oversized allocation cookie" free pattern (the real
   * base of the allocation sits 8 bytes before the visible pointer). We keep
   * the outer field opaque here since its concrete type is not recovered.
   */
  _field_0x198: { _rawBase: unknown | null } | null = null;

  /** HGRect at struct-offset +0x1a0 — ROI returned by GetROI(passIndex=1). */
  _roiPass1: HGRect = { x: 0, y: 0, right: 0, bottom: 0 };

  /** HGRect at struct-offset +0x1b0 — ROI returned by GetROI(passIndex=2). */
  _roiPass2: HGRect = { x: 0, y: 0, right: 0, bottom: 0 };

  /**
   * HGSMAAPatternSearch::~HGSMAAPatternSearch() @0x211b10 (base, D2).
   *
   *   0x211b10  leaq   0x81cef9(%rip), %rax        // vtable for HgcSMAAPatternSearch (+0x10) @0xa2ea10
   *   0x211b17  movq   %rax, (%rdi)                //   patch vptr before running base dtor
   *   0x211b1a  movq   0x198(%rdi), %rax           // load field_0x198
   *   0x211b21  testq  %rax, %rax
   *   0x211b24  je     HGNode::~HGNode()           //   tail-call to base if null
   *   0x211b2a  movq   -0x8(%rax), %rax            // rax = *(field_0x198 - 8)  (inner alloc base)
   *   0x211b2e  testq  %rax, %rax
   *   0x211b31  je     HGNode::~HGNode()           //   tail-call to base if inner null
   *   0x211b43  callq  __ZdlPv                     // operator delete(inner)
   *   0x211b51  jmp    HGNode::~HGNode()           // tail-call to base dtor
   *
   * The vptr patch (line 1-2) is only meaningful for the deleting form / for
   * any virtual dispatch that might happen during the base run. In TS we have
   * no vtables to patch, so we skip that step and just do the two owning
   * releases in the exact order the machine code did.
   */
  destroy(): void {
    // *(this+0x198) — if non-null, free *(that-8) via operator delete.
    const f198 = this._field_0x198;
    if (f198 !== null) {
      const inner = f198._rawBase;
      if (inner !== null && inner !== undefined) {
        // callq __ZdlPv @0x211b43 — operator delete(inner). Not yet transcribed;
        // in TS the GC owns lifetimes, so we drop the reference.
        f198._rawBase = null;
      }
      this._field_0x198 = null;
    }
    // jmp __ZN6HGNodeD2Ev — HGNode::~HGNode() base cleanup — not yet transcribed @0x211b51.
    // No-op in TS; a real port would call super.destroy() once HGNode lands.
  }

  /**
   * HGSMAAPatternSearch::~HGSMAAPatternSearch() @0x211b60 (deleting, D0).
   *
   *   0x211b69  leaq   0x81cea0(%rip), %rax        // vtable for HgcSMAAPatternSearch (+0x10) @0xa2ea10
   *   0x211b70  movq   %rax, (%rdi)                //   patch vptr
   *   0x211b73  movq   0x198(%rdi), %rax
   *   0x211b7a  testq  %rax, %rax
   *   0x211b7d  je     0x211b8d
   *   0x211b7f  movq   -0x8(%rax), %rdi
   *   0x211b83  testq  %rdi, %rdi
   *   0x211b86  je     0x211b8d
   *   0x211b88  callq  __ZdlPv                     // operator delete(inner)
   *   0x211b90  callq  __ZN6HGNodeD2Ev             // HGNode::~HGNode() (base dtor, non-tail)
   *   0x211b9e  jmp    __ZN8HGObjectdlEPv          // HGObject::operator delete(this)
   *
   * Identical body to the base form, plus a final tail-call to
   * HGObject::operator delete that frees the outer object slab. Not yet
   * transcribed; TS GC handles the outer free.
   */
  destroyAndDelete(): void {
    this.destroy();
    // jmp __ZN8HGObjectdlEPv — HGObject::operator delete(this) — not yet transcribed @0x211b9e.
  }

  /**
   * HGSMAAPatternSearch::GetDOD(HGRenderer*, int passIndex, HGRect input) @0x211bb0.
   *
   * Returns the "Domain of Definition" for a given pass. In C++ ABI the
   * HGRect return is packed into (rax, rdx); input HGRect arrives in
   * (rcx, r8). Mirroring the asm exactly:
   *
   *   0x211bb0  movq   %rcx, %rax        // rax = input.lo
   *   0x211bb3  testl  %edx, %edx
   *   0x211bb5  je     0x211bca          // if passIndex == 0 -> return input (rax=input.lo, r8=input.hi)
   *   0x211bbb  leaq   _HGRectNull(%rip), %rcx
   *   0x211bc2  movq   (%rcx), %rax      // rax = HGRectNull.lo (0)
   *   0x211bc5  movq   0x8(%rcx), %r8    // r8  = HGRectNull.hi (0)
   *   0x211bca  movq   %r8, %rdx         // return (rax, rdx)
   *
   * i.e. passIndex == 0 -> the DOD equals the input rect; every other pass
   * has an empty DOD (HGRectNull). (The DOD of the later passes is degenerate
   * because SMAA pattern-search writes fully cover the input area.)
   *
   * @param _renderer  unused by this override (rsi is never read)
   * @param passIndex  which SMAA sub-pass (edx)
   * @param input      the caller's supplied rect (rcx / r8)
   */
  GetDOD(_renderer: unknown, passIndex: number, input: HGRect): HGRect {
    if ((passIndex | 0) === 0) {
      return input;
    }
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }

  /**
   * HGSMAAPatternSearch::GetROI(HGRenderer*, int passIndex, HGRect input) @0x211bd0.
   *
   * Returns the "Region of Interest" (the source area this node reads to
   * produce input) for a given pass.
   *
   *   0x211bd0  cmpl   $0x2, %edx
   *   0x211bd3  je     0x211c28          // passIndex == 2 -> return *(this+0x1b0..+0x1b8)
   *   0x211bd5  cmpl   $0x1, %edx
   *   0x211bd8  je     0x211c19          // passIndex == 1 -> return *(this+0x1a0..+0x1a8)
   *   0x211bda  testl  %edx, %edx
   *   0x211bdc  jne    0x211c37          // passIndex != 0 (and != 1, != 2) -> return HGRectNull
   *   //  --- passIndex == 0 fallthrough ---
   *   0x211be5  movl   $0xfffffff5, %edi // edi = -11  (HGRectMake4i.x0)
   *   0x211bea  movl   $0xfffffff5, %esi // esi = -11  (HGRectMake4i.y0)
   *   0x211bef  movl   $0xc,       %edx  // edx = 12   (HGRectMake4i.x1)
   *   0x211bf4  movq   %rcx, %rbx        // rbx = input.lo (save across call)
   *   0x211bf7  movl   $0xc,       %ecx  // ecx = 12   (HGRectMake4i.y1)
   *   0x211bfc  movq   %r8,  %r14        // r14 = input.hi (save across call)
   *   0x211bff  callq  _HGRectMake4i     // -> (rax, rdx) = HGRectMake4i(-11,-11,12,12)
   *   0x211c04  movq   %rdx, %rcx        // grow.hi
   *   0x211c07  movq   %rbx, %rdi        // input.lo
   *   0x211c0a  movq   %r14, %rsi        // input.hi
   *   0x211c0d  movq   %rax, %rdx        // grow.lo
   *   0x211c14  jmp    _HGRectGrow       // tail-call HGRectGrow(input, growRect)
   *
   *   0x211c19  movq   0x1a0(%rdi), %rax // passIndex == 1 branch
   *   0x211c20  movq   0x1a8(%rdi), %rdx
   *   0x211c27  retq
   *
   *   0x211c28  movq   0x1b0(%rdi), %rax // passIndex == 2 branch
   *   0x211c2f  movq   0x1b8(%rdi), %rdx
   *   0x211c36  retq
   *
   *   0x211c37  leaq   _HGRectNull(%rip), %rcx // default branch
   *   0x211c3e  movq   (%rcx), %rax
   *   0x211c41  movq   0x8(%rcx), %rdx
   *   0x211c45  retq
   *
   * Summary:
   *   passIndex 0 -> HGRectGrow(input, HGRectMake4i(-11, -11, 12, 12))
   *                  (pass 0 needs an 11px border on the min side and 12px on the max side —
   *                   this matches SMAA's 11px search-distance kernel).
   *   passIndex 1 -> stored ROI at struct-offset +0x1a0 (this._roiPass1)
   *   passIndex 2 -> stored ROI at struct-offset +0x1b0 (this._roiPass2)
   *   else        -> HGRectNull
   */
  GetROI(_renderer: unknown, passIndex: number, input: HGRect): HGRect {
    const p = passIndex | 0;
    if (p === 2) {
      // *(this+0x1b0) / *(this+0x1b8)
      return {
        x: this._roiPass2.x,
        y: this._roiPass2.y,
        right: this._roiPass2.right,
        bottom: this._roiPass2.bottom,
      };
    }
    if (p === 1) {
      // *(this+0x1a0) / *(this+0x1a8)
      return {
        x: this._roiPass1.x,
        y: this._roiPass1.y,
        right: this._roiPass1.right,
        bottom: this._roiPass1.bottom,
      };
    }
    if (p !== 0) {
      // default fall-through @0x211c37
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // p === 0 fall-through @0x211bde
    const grow = HGRectMake4i(-11, -11, 12, 12);
    return HGRectGrow(input, grow);
  }
}
