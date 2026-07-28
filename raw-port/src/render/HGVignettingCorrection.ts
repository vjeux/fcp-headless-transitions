// raw-port/src/render/HGVignettingCorrection.ts
//
// FCP `HGVignettingCorrection` — Helium HGNode subclass that composes two
// child HGNode kernels (an HGVignetting to add vignetting and an
// HGDeVignetting to remove it) and, at render time, dispatches to exactly
// one of them based on the sign of its `amount` parameter. This is the
// render-graph-facing wrapper node; the actual per-pixel shader math lives
// in HGVignetting / HGDeVignetting (separate ports).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice, VA space is
//             file offset 0x0-based per `raw-port/tools/disasm.sh` guidance).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGVignettingCorrection.HGVignettingCorrection.s
//                                                       (C1 @0x23ee70, tail
//                                                        jmp to C2 @0x23edb0)
//   raw-port/re/disasm/Helium.HGVignettingCorrection.SetParameter.s @0x23ef70
//   raw-port/re/disasm/Helium.HGVignettingCorrection.GetOutput.s    @0x23f080
//
// Vtable @Helium 0xa36048 (installed-ptr 0xa36058, from ctor's
// `leaq 0x7f728f(%rip)` @0x23edc2). Slot map (from
// raw-port/army/tools/resolve.py Helium vtable HGVignettingCorrection —
// only entries that DIFFER from base HGNode are class-owned):
//   *0x00 -> 0x23eed0  ~HGVignettingCorrection() [D1 complete dtor]
//   *0x08 -> 0x23ef20  ~HGVignettingCorrection() [D0 deleting dtor]
//   *0x60 -> 0x23ef70  SetParameter(int,float,float,float,float)  ← override
//   (all other slots inherit HGNode's implementations verbatim: 0x10/0x18
//    are HGObject::Retain/Release, 0x78 is HGNode::SetInput, etc.)
// Note: `GetOutput(HGRenderer*)` is exported as a T-symbol but is NOT in the
// vtable at slot 0xb8 (which would be RenderTile) — HGVignettingCorrection
// wires no RenderTile / GetProgram / Bind of its own. GetOutput is called
// directly by the render graph as a non-virtual method on this class type.
//
// STRUCT LAYOUT (recovered field-by-field from C2 @0x23edb0):
//   HGVignettingCorrection : public HGNode {
//     +0x000..+0x197                  (HGNode base subobject; C2 first calls
//                                      HGNode::HGNode() @0x11baf0)
//     +0x000  vptr                    (overwritten @0x23edc9 to the class
//                                      vtable installed-ptr = 0xa36058)
//     +0x198  float amount            (init 0.0f — first lane of movaps
//                                      loaded from @0x3cb140 = {0.0, 0.0,
//                                      1.0, 1.0} then movups @0x198)
//     +0x19c  float radius            (init 0.0f — 2nd lane of same movaps)
//     +0x1a0  float softness          (init 1.0f — 3rd lane)
//     +0x1a4  float centerX           (init 1.0f — 4th lane)
//     +0x1a8  float centerY           (init 1.0f — 1st lane of movsd loaded
//                                      from @0x85f9d0 = {1.0f, 0.5f}; movsd
//                                      writes 8 bytes @0x1a8..0x1b0)
//     +0x1ac  float scaleX            (init 0.5f — 2nd lane of that movsd)
//     +0x1b0  float scaleY            (init 0.5f — imm movl $0x3f000000 @0x1b0)
//     +0x1b4..+0x1bf                  (padding — never written by ctor)
//     +0x1c0  HGVignetting*   posKernel   (heap-owned, size 0x1a0 — @0x23edf4
//                                          `movl $0x1a0, %edi ; call
//                                          HGObject::operator new` @0x23edf9,
//                                          then `HGVignetting::HGVignetting()`
//                                          @0x23ee04, install @0x23ee09)
//     +0x1c8  HGDeVignetting* negKernel   (heap-owned, size 0x1a0 — same
//                                          allocation dance @0x23ee10..0x23ee25)
//   }
// sizeof = 0x1d0 (last field is at +0x1c8, an 8-byte pointer). The child
// pointers are read as `movq 0x1c0(%rbx,%rax,8), %rax` at the end of
// GetOutput (@0x23f2db) — so posKernel/negKernel form a 2-entry array
// selected by a 0/1 index derived from the sign of `amount`.
//
// The 4 initial-value constants are all in Helium's __const:
//   @0x3cb140 : {0.0f, 0.0f, 1.0f, 1.0f}   (amount, radius, softness, centerX)
//   @0x85f9d0 : {1.0f, 0.5f}               (centerY, scaleX)
// (verified via `raw-port/army/tools/resolve.py Helium const 0x3cb140` etc.)

import { HGNode } from "./HGNode";

/**
 * Opaque pointer types for the two child kernels. They are HGNode subclasses
 * with a full HGNode-shaped vtable — this class only ever touches slot 0x60
 * (SetParameter) and slot 0x78 (SetInput). Their true layouts / shader math
 * are ported in separate files (HGVignetting.ts / HGDeVignetting.ts — not
 * yet transcribed).
 *
 * The typed shape we DO care about at this layer is exactly the two vtable
 * entry points GetOutput reaches into, both of which live on their HGNode
 * base's vtable:
 *
 *   *0x60 = SetParameter(int index, float x, float y, float z, float w) : i32
 *   *0x78 = SetInput   (int slot,  HGNode* source)                       : i32
 *
 * We model those via a plain interface below to keep the port faithful to
 * the vfn dispatch pattern (never inline / never guess a direct call —
 * `callq *0x60(%rax)` is preserved as a method call on this interface).
 */
export interface HGVignettingChild extends HGNode {
  /** @Helium HGVignetting::SetParameter @0x23d260 / HGDeVignetting::SetParameter @0x23eaf0 (vtable slot 0x60). */
  SetParameter(index: number, x: number, y: number, z: number, w: number): number;
  /** @Helium HGNode::SetInput @0x11c5f0 (vtable slot 0x78, inherited unchanged by both children). Returns 1 on success, 0 on no-op — see HGNode.ts. */
  SetInput(slot: number, source: HGNode | null): number;
}

/**
 * Opaque HGRenderer stub. Its only use in this file is as the argument
 * type of `GetInput` (called at the top of GetOutput). `HGRenderer::GetInput
 * @0x1????` is a separate port; we model just the callable shape.
 */
export interface HGRendererLike {
  /** @Helium HGRenderer::GetInput(HGNode*, int) — invoked as `callq __ZN10HGRenderer8GetInputEP6HGNodei` @0x23f096. */
  GetInput(node: HGNode, slot: number): HGNode | null;
}

/**
 * `HGVignettingCorrection` — the composite two-child vignetting node.
 *
 * See the file header for a full field-by-field layout, provenance and
 * vtable derivation. Below, every method mirrors its Helium disassembly
 * line-for-line; any un-decoded sub-behavior (e.g. `HGNode::ClearBits()`
 * which the base class ports as a throwing stub of its own) is invoked
 * through the base and left to that class to loudly-fault.
 */
export class HGVignettingCorrection extends HGNode {
  /** @Helium C2 @0x23edcc-0x23edd3: movaps @0x3cb140 first lane written @+0x198. */
  amount: number = Math.fround(0.0);
  /** @Helium C2 @0x23edcc-0x23edd3: 2nd lane of the same movaps @+0x19c. */
  radius: number = Math.fround(0.0);
  /** @Helium C2 @0x23edcc-0x23edd3: 3rd lane @+0x1a0. */
  softness: number = Math.fround(1.0);
  /** @Helium C2 @0x23edcc-0x23edd3: 4th lane @+0x1a4. */
  centerX: number = Math.fround(1.0);
  /** @Helium C2 @0x23edda-0x23ede2: 1st lane of movsd @0x85f9d0 written @+0x1a8. */
  centerY: number = Math.fround(1.0);
  /** @Helium C2 @0x23edda-0x23ede2: 2nd lane of that movsd @+0x1ac. */
  scaleX: number = Math.fround(0.5);
  /** @Helium C2 @0x23edea: `movl $0x3f000000, 0x1b0(%rbx)` = 0.5f @+0x1b0. */
  scaleY: number = Math.fround(0.5);

  /**
   * @Helium C2 @0x23ee04-0x23ee09: new HGVignetting(); *(this+0x1c0)=ptr.
   * Populated by the constructor via `HGObject::operator new(0x1a0)` +
   * `HGVignetting::HGVignetting()` and read back throughout GetOutput as
   * the first slot of the 2-entry child array indexed by the sign of
   * `amount` (positive amount → this kernel is bypassed via the tail
   * `setae` at @0x23f2d8 and negKernel is returned instead — see
   * GetOutput below for the exact index derivation).
   */
  posKernel!: HGVignettingChild;

  /** @Helium C2 @0x23ee20-0x23ee25: new HGDeVignetting(); *(this+0x1c8)=ptr. */
  negKernel!: HGVignettingChild;

  /**
   * `HGVignettingCorrection::HGVignettingCorrection()` — Helium C2 body
   * @0x23edb0. The C1 body @0x23ee70 is a bare tail-jmp to C2, so both
   * signatures share this one.
   *
   * Line-for-line transcription:
   *   0x23edbd: callq __ZN6HGNodeC2Ev              ; HGNode::HGNode()
   *   0x23edc2: leaq  0x7f728f(%rip), %rax         ; = 0xa36058 vtable inst ptr
   *   0x23edc9: movq  %rax, (%rbx)                 ; this->vptr = <vtable>
   *   0x23edcc: movaps 0x18c36d(%rip), %xmm0       ; = 0x3cb140 {0,0,1,1}
   *   0x23edd3: movups %xmm0, 0x198(%rbx)          ; amount/radius/softness/centerX
   *   0x23edda: movsd  0x620bee(%rip), %xmm0       ; = 0x85f9d0 {1.0f, 0.5f}
   *   0x23ede2: movsd  %xmm0, 0x1a8(%rbx)          ; centerY / scaleX
   *   0x23edea: movl   $0x3f000000, 0x1b0(%rbx)    ; scaleY = 0.5f
   *   0x23edf4-0x23ee09: new HGVignetting(); posKernel = ptr @+0x1c0
   *   0x23ee10-0x23ee25: new HGDeVignetting(); negKernel = ptr @+0x1c8
   * The tail (0x23ee2c..0x23ee36) is the standard cleanup + retq.
   * The 0x23ee37 landing pad is C++ exception unwind: if HGVignetting's
   * ctor or the second `operator new` throws, `HGObject::operator delete`
   * frees whatever we allocated (only the one whose ctor didn't complete),
   * then `HGNode::~HGNode()` runs, then __Unwind_Resume propagates. We
   * mirror that intent by allocating & constructing in this order and
   * letting the JS runtime throw naturally (the vtable-based dtor chain
   * doesn't matter in TS because there's no manual memory ownership).
   */
  constructor(
    // The two child allocators are injected because HGVignetting /
    // HGDeVignetting are separately-ported (undecoded) HGNode subclasses.
    // In the FCP binary they're `HGObject::operator new(0x1a0)` +
    // `HGVignetting::HGVignetting()` and the mirrored HGDeVignetting pair
    // (see the ctor transcription above). Passing them in as factories
    // keeps this file at ONE class (Rule 6) — the alternative would be
    // reaching into unported files. Callers that instantiate this class
    // from parseScene must plug in the real ctors once those classes land.
    makePosKernel?: () => HGVignettingChild,
    makeNegKernel?: () => HGVignettingChild,
  ) {
    super(); // @Helium 0x23edbd: HGNode::HGNode()

    // vptr install is implicit in JS class dispatch; the binary's
    // `movq %rax, (%rbx)` at 0x23edc9 has no direct JS analogue.

    // Field initializers above (amount..scaleY) faithfully mirror
    // 0x23edcc..0x23edea — TS class-field syntax runs them BEFORE the
    // super() would in general, but semantically these are single-word
    // stores after HGNode's ctor, exactly as in the disassembly.

    if (makePosKernel === undefined || makeNegKernel === undefined) {
      // The undecoded-callee gap (Rule 3): HGVignetting / HGDeVignetting
      // ctors aren't transcribed yet, so callers must supply them. Any
      // instantiation without those factories is a decode-frontier we
      // refuse to silently paper over.
      throw new Error(
        "HGVignetting::HGVignetting @Helium 0x23e9f0 (called @0x23ee04) and " +
          "HGDeVignetting::HGDeVignetting @Helium 0x23e700 (called @0x23ee20) " +
          "not yet transcribed",
      );
    }

    // @Helium 0x23edf4..0x23ee09: allocate + construct posKernel, install at +0x1c0.
    this.posKernel = makePosKernel();
    // @Helium 0x23ee10..0x23ee25: allocate + construct negKernel, install at +0x1c8.
    this.negKernel = makeNegKernel();
  }

  /**
   * `HGVignettingCorrection::SetParameter(int idx, float f0, float f1, float f2, float f3)`
   * — Helium @0x23ef70. Overrides vtable slot 0x60.
   *
   * Structure: `cmpl $0x4, %esi ; ja default` @0x23ef70-0x23ef73 gates on
   * `idx > 4`, then a 5-entry jump table selects one of 5 update paths.
   * Each path compares the incoming float(s) against the currently-stored
   * value(s) using `ucomiss` (which mirrors IEEE unordered semantics: two
   * NaNs compare "unequal" and take the update path). Only if the value
   * genuinely changed does the fn tail-call `HGNode::ClearBits()` and
   * return 1; otherwise it returns 0 with no side effects. `idx > 4`
   * returns 0xFFFFFFFF (i.e. -1 as a signed int).
   *
   * The 5 cases + their offsets are recovered from the jump-table body:
   *   case 0 @0x23ef8b: f0 /= 100.0f (`divss 0x18b301(%rip),%xmm0` — that
   *                     RIP-relative target resolves to 0x23ef93+0x18b301 =
   *                     0x3CA294, whose first float is 100.0f. This is the
   *                     SAME __const quad {100.0f, 254.0f, 500.0f, 16.0f}
   *                     read by GetOutput's `mulss 0x18b192(%rip)` @0x23f0fa
   *                     for the "1+99·amt" scale below — the parameter API
   *                     uses `amount` in percent (0..100) and stores it
   *                     internally as normalized [0..1]). Then compare/store
   *                     to `amount` (+0x198).
   *   case 1 @0x23f030: f0 vs radius (+0x19c). (Simple single-scalar case
   *                     with just one ucomiss + branch + store.)
   *   case 2 @0x23efe7: f0 vs softness (+0x1a0). (Same shape as case 1.)
   *   case 3 @0x23f000: (f0, f1) pair vs (centerX@+0x1a4, centerY@+0x1a8).
   *                     ucomiss BOTH, ucomiss guards NaN, store both if
   *                     ANY lane differs.
   *   case 4 @0x23efb3: (f0, f1) pair vs (scaleX@+0x1ac, scaleY@+0x1b0).
   *                     (Same shape as case 3.)
   * Common tail @0x23f047-0x23f056:
   *   pushq %rbp/mov rbp; callq HGNode::ClearBits(); mov $1,%eax; ret.
   * "no change" tail @0x23f057-0x23f059: xor %eax,%eax; ret.
   * "out of range" tail @0x23f05a: mov $-1,%eax; ret.
   *
   * Jump-table @0x23f060 (5x i32 disp, relative to 0x23f060):
   *   idx 0 → 0x23ef8b (amount + divss/100)
   *   idx 1 → 0x23f030 (radius)
   *   idx 2 → 0x23efe7 (softness)
   *   idx 3 → 0x23f000 (centerX, centerY pair)
   *   idx 4 → 0x23efb3 (scaleX,  scaleY  pair)
   * (Decoded by reading disp32 words at 0x23f060+i*4 and adding to base
   *  0x23f060 — verified via `python3 -c` on the thin x86_64 binary.)
   *
   * NOTE case 0's `divss 0x18b301(%rip)`: instruction is at 0x23ef8b, next
   * instruction @0x23ef93, so target = 0x23ef93 + 0x18b301 = 0x3CA294.
   * That address holds 100.0f as its first float (the same {100.0f, 254.0f,
   * 500.0f, 16.0f} __const quad GetOutput also reads at lane 0 for the
   * "amount * 100" step). So `amount` is set as `f0 / 100.0f` — the API
   * takes the parameter in percent (0..100) and normalizes it to [0..1].
   * Verified via `raw-port/army/tools/resolve.py Helium const 0x3ca294`.
   */
  SetParameter(idx: number, f0: number, f1: number, f2: number, f3: number): number {
    // @Helium 0x23ef70-0x23ef73: `cmpl $0x4, %esi ; ja default`
    if ((idx >>> 0) > 4) {
      // @Helium 0x23f05a: `movl $0xffffffff, %eax ; retq`
      return -1;
    }

    // We keep the exact "compare-before-store; only ClearBits if changed"
    // semantics per case. Note that `ucomiss` treats NaN==NaN as unequal,
    // so a NaN param always takes the update branch — we mirror that by
    // using `!(a === b)` (which reduces to `a !== b`, and JS `NaN !== NaN`).
    let changed = false;

    switch (idx | 0) {
      case 0: {
        // @Helium 0x23ef8b: divss 0x18b301(%rip),%xmm0    ; f0 /= 100.0f
        // (RIP target = 0x23ef93 + 0x18b301 = 0x3CA294, and
        //  `resolve.py Helium const 0x3ca294` reads `float=100.0`.)
        const v = Math.fround(f0 / Math.fround(100.0));
        // @Helium 0x23ef93-0x23efae: ucomiss stored vs v; store only if diff.
        if (this.amount !== v) {
          this.amount = v;
          changed = true;
        }
        break;
      }
      case 1: {
        // @Helium 0x23f030-0x23f045: f0 vs radius (+0x19c).
        const v = Math.fround(f0);
        if (this.radius !== v) {
          this.radius = v;
          changed = true;
        }
        break;
      }
      case 2: {
        // @Helium 0x23efe7-0x23effe: f0 vs softness (+0x1a0).
        const v = Math.fround(f0);
        if (this.softness !== v) {
          this.softness = v;
          changed = true;
        }
        break;
      }
      case 3: {
        // @Helium 0x23f000-0x23f02e: (f0, f1) pair vs (centerX, centerY).
        // The disassembly does two ucomiss guarded by `jne/jp` (any
        // difference OR any NaN takes the "changed" path). Faithfully:
        const a0 = Math.fround(f0), a1 = Math.fround(f1);
        if (this.centerX !== a0 || this.centerY !== a1) {
          this.centerX = a0;
          this.centerY = a1;
          changed = true;
        }
        break;
      }
      case 4: {
        // @Helium 0x23efb3-0x23efe5: (f0, f1) pair vs (scaleX, scaleY).
        const a0 = Math.fround(f0), a1 = Math.fround(f1);
        if (this.scaleX !== a0 || this.scaleY !== a1) {
          this.scaleX = a0;
          this.scaleY = a1;
          changed = true;
        }
        break;
      }
      default:
        // unreachable (guarded by the `>4` check above).
        return -1;
    }

    if (!changed) {
      // @Helium 0x23f057-0x23f059: xor %eax,%eax ; retq.
      return 0;
    }

    // @Helium 0x23f047-0x23f056: pushq %rbp/mov rbp;
    //                            callq __ZN6HGNode9ClearBitsEv @0x11c890;
    //                            movl $0x1, %eax; popq %rbp; retq.
    // HGNode::ClearBits() (the void-arg thunk) tail-jumps to
    // HGNode::ClearBits(int) with mask 0xffff — see HGNode.ts's ClearBitsAll.
    this.ClearBitsAll();
    return 1;
  }

  /**
   * `HGVignettingCorrection::GetOutput(HGRenderer* r)` — Helium @0x23f080.
   *
   * Not in the vtable — called directly by parent nodes via the concrete
   * class type. Flow (transcribed line-for-line from the disasm):
   *
   *   0x23f094-0x23f09a: xor %edx,%edx ;
   *                      callq HGRenderer::GetInput(this, 0)
   *     — fetch the upstream node at input slot 0 (this class has exactly
   *       one input slot; result is saved to r14 later for the SetInput
   *       forwarding).
   *
   *   0x23f09b-0x23f0ab: if (radius == 0.0f) goto passthrough_epilogue.
   *     — `movss 0x19c(%rbx),%xmm3 ; xorps %xmm0,%xmm0 ; ucomiss %xmm0,%xmm3
   *        ; jne .keep ; jnp .early_return`  is the NaN-safe (a==0.0f) test.
   *       .early_return (@0x23f2e3) skips ALL the child-node plumbing and
   *       ALL the "which kernel do we return" tail — %rax at that point
   *       still holds the result of HGRenderer::GetInput @0x23f096, so the
   *       function returns the upstream input unmodified. This is the
   *       "if the vignette radius is zero, the filter is a no-op" fast path.
   *
   *   0x23f0b1-0x23f0d9: computes `param3 = softness * 0.5 *
   *                                sqrt(centerX^2 + centerY^2)`, stashed
   *                      at -0x18(%rbp).
   *     — Load `xmm1 = (centerX, centerY, ...)` from packed movsd at
   *       +0x1a4 (reads 8 bytes = both floats).
   *       Load `xmm0 = (0.5, 0.5, 0.0, 0.0)` from @0x3C9FF0 (movaps).
   *       `mulps` scales, `mulps xmm0,xmm0` squares, `movshdup` +`addss`
   *       reduces low two lanes to their sum, `sqrtss` roots it. That
   *       gives 0.5 * sqrt(cx^2 + cy^2). Multiply by `softness` (xmm3
   *       reloaded from +0x19c above) → stashed at rbp-0x18.
   *
   *   0x23f0de-0x23f13b: computes `param2 = 1.0 - 1.0 / abs_scale` where
   *                       `abs_scale = |1.0f + 99.0f * amount|` if `amount<0`
   *                       else `1.0f + 99.0f * amount`.
   *     — `xmm3 = amount` (from +0x198); `xmm2 = 1.0f - amount` (movss
   *       @0x3C7CC0 = 1.0f, subss). `xmm3 *= 100.0f` (mulss @0x3CA294 =
   *       100.0f). `xmm3 += xmm2` → xmm3 = 1 + 99*amount.
   *     — `cmpnless xmm3,xmm0` with xmm0=0 produces all-1s where NOT(0 <=
   *       amount), i.e. where `amount < 0`. `andps @0x3C7C30,xmm3` computes
   *       |xmm3| via the {0x7FFFFFFF}x4 sign-bit mask. `blendvps xmm0,
   *       xmm2, xmm3` selects: for lanes where the mask MSB is 1 (i.e.
   *       amount<0), pick xmm2=|xmm3|; else keep xmm3 = the unsigned val.
   *     — Store xmm3 to -0x30(%rbp) for later re-use in the negKernel
   *       parameter-1 push (mirror of the same value going to posKernel
   *       parameter 1). Then `cvtss2sd`, `divsd 1.0(=@0x3CA260)/x`,
   *       `subsd`, `cvtsd2ss` to compute `1.0 - 1.0/x` as a float; stash
   *       at -0x14(%rbp).
   *
   *   0x23f140-0x23f165: computes `param4 = (scaleX*centerX, scaleY*centerY)`
   *                       (stored as two floats in -0x1c and -0x40).
   *     — `xmm0 = softness` (loaded @+0x1a0 for param0 use below), unused
   *       for this step. `xmm2 = scaleX` (from +0x1ac); `mulss xmm1` where
   *       xmm1's low still equals centerX → xmm2 = scaleX*centerX.
   *       Store to -0x1c(%rbp).
   *     — `movshdup xmm1,xmm1` shuffles centerY to low; `mulss scaleY (=+0x1b0)`
   *       → xmm1 = scaleY*centerY. Store to -0x40(%rbp).
   *
   *   0x23f169-0x23f201: five `posKernel.SetParameter(k, ...)` vfn calls,
   *                       via `callq *0x60(%rcx/%rax)` (vtable slot 0x60).
   *     Their scalar arguments (xmm0..xmm3 packed with same value except
   *     case 4 which passes centerX*scaleX, centerY*scaleY, 0, 0):
   *       (0, softness,   softness,   softness,   softness)
   *       (1, |1+99·amt|, |1+99·amt|, |1+99·amt|, |1+99·amt|)   ← -0x30
   *       (2, 1-1/|1+99·amt|, ..., ..., ...)                    ← -0x14
   *       (3, softness*sqrt/2, ..., ..., ...)                   ← -0x18
   *       (4, scaleX*centerX, scaleY*centerY, 0.0, 0.0)         ← -0x1c,-0x40
   *
   *   0x23f204-0x23f2a1: identical five-call sequence on negKernel
   *                       (via `movq 0x1c8(%rbx),%rdi ; callq *0x60(%rax)`).
   *
   *   0x23f2a4-0x23f2c5: `posKernel.SetInput(0, upstream)`,
   *                       `negKernel.SetInput(0, upstream)` — both use
   *                       `callq *0x78(%rax)` (vtable slot 0x78), passing
   *                       %r14 = the earlier HGRenderer::GetInput result.
   *
   *   0x23f2c8-0x23f2eb: `return (amount >= 0.0f) ? negKernel : posKernel`.
   *     — `xmm0 = amount ; xor %eax,%eax ; xorps xmm1,xmm1 ; ucomiss
   *        xmm1,xmm0 ; setae %al ; movq 0x1c0(%rbx,%rax,8),%rax ; retq`.
   *     — setae is TRUE iff the ucomiss comparison is "above or equal",
   *       which for `ucomiss 0.0f, amount` is true iff `amount >= 0.0f`
   *       AND neither operand is NaN. Index 0 → +0x1c0 (posKernel);
   *       index 1 → +0x1c8 (negKernel). So amount<0 → posKernel (add
   *       vignetting); amount>=0 → negKernel (de-vignetting correction).
   *
   * The interpretation of the parameter contract (which the shader kernels
   * consume) is fully recovered by inspection of the calls alone; the
   * per-kernel meaning of parameters 0..4 is decided by HGVignetting /
   * HGDeVignetting's SetParameter overrides (each dispatches on `index`
   * exactly like this class does, per their vtable slot 0x60 targets @0x23d260
   * / @0x23eaf0 — separate ports).
   */
  GetOutput(r: HGRendererLike): HGNode | null {
    // @Helium 0x23f094-0x23f09a: upstream = r->GetInput(this, 0).
    const upstream = r.GetInput(this, 0);

    // @Helium 0x23f09b-0x23f0ab: if (radius == 0.0f) return upstream.
    // Note: ucomiss's ordered/NaN treatment is that NaN != anything, so if
    // radius is NaN we DO take the "keep processing" branch. That mirrors
    // exactly with `radius !== 0` in JS (`NaN !== 0` is true).
    if (this.radius === Math.fround(0.0)) {
      return upstream;
    }

    // @Helium 0x23f0b1-0x23f0d9:
    //   param3 = softness * 0.5 * sqrt(centerX*centerX + centerY*centerY)
    // The 0.5 scaling comes from the movaps of {0.5,0.5,0,0} @0x3C9FF0 before
    // the mulps/mulps/movshdup/addss/sqrtss chain — algebraically the same
    // as sqrt((0.5·cx)^2 + (0.5·cy)^2) = 0.5·sqrt(cx² + cy²). We faithfully
    // preserve the double-half-scale semantics by using Math.fround at
    // every stage that the binary uses single-precision.
    const cx = Math.fround(this.centerX);
    const cy = Math.fround(this.centerY);
    const halfCx = Math.fround(Math.fround(0.5) * cx);
    const halfCy = Math.fround(Math.fround(0.5) * cy);
    const sumSq = Math.fround(Math.fround(halfCx * halfCx) + Math.fround(halfCy * halfCy));
    const radLen = Math.fround(Math.sqrt(sumSq)); // sqrtss
    const param3 = Math.fround(radLen * Math.fround(this.softness));

    // @Helium 0x23f0de-0x23f13b:
    //   scaled  = 1.0f + 99.0f * amount   ; via subss(1,x) + mulss(x,100) + addss.
    //   if (amount < 0.0f) scaled = |scaled|      ; via cmpnless + andps + blendvps.
    //   param2  = float( 1.0 - 1.0 / double(scaled) )
    const amount = Math.fround(this.amount);
    const oneMinusAmt = Math.fround(Math.fround(1.0) - amount);
    const amt100 = Math.fround(amount * Math.fround(100.0));
    let scaled = Math.fround(amt100 + oneMinusAmt); // = 1 + 99*amount

    // cmpnless with a zero xmm0 computes mask := !(0 <= scaled_before) —
    // BUT the binary compares against `xmm3` at that program point, and
    // xmm3 there is the SAME value `scaled` (post `addss`). So the mask
    // predicate is (scaled < 0) — equivalently (amount < 0) since the
    // transform 1+99·x is monotone with x and equals 1 at x=0.
    // Faithfully implement the abs-when-negative pass:
    if (scaled < 0) {
      // Sign-bit mask andps @0x3C7C30 (= {0x7FFFFFFF}x4) computes |x| in float.
      scaled = Math.fround(Math.abs(scaled));
    }

    // Double-precision divsd + subsd, then cvtsd2ss:
    const scaledD = scaled; // JS numbers are already f64; cvtss2sd is a no-op here.
    const invD = 1.0 / scaledD;
    const oneMinusInvD = 1.0 - invD;
    const param2 = Math.fround(oneMinusInvD);

    // @Helium 0x23f140-0x23f165:
    //   scaleParamX = scaleX * centerX
    //   scaleParamY = scaleY * centerY
    // (xmm1's packed low = (centerX, centerY) from the earlier movsd load;
    //  0x23f150 multiplies with scaleX; movshdup rotates centerY to low;
    //  0x23f15d multiplies with scaleY.)
    const scaleParamX = Math.fround(Math.fround(this.scaleX) * cx);
    const scaleParamY = Math.fround(Math.fround(this.scaleY) * cy);

    // @Helium 0x23f169-0x23f201: forward 5 params to posKernel via
    // vtable slot 0x60. Each call passes all 4 xmm regs — for scalar
    // cases the same value is broadcast; for the (scaleParamX, scaleParamY)
    // pair only the low two lanes are meaningful (the callee's
    // SetParameter dispatch reads only the operands relevant to `index`).
    const softness = Math.fround(this.softness);
    this.posKernel.SetParameter(0, softness, softness, softness, softness);
    this.posKernel.SetParameter(1, scaled, scaled, scaled, scaled);
    this.posKernel.SetParameter(2, param2, param2, param2, param2);
    this.posKernel.SetParameter(3, param3, param3, param3, param3);
    // @Helium 0x23f1ed-0x23f201: `xorps xmm2,xmm2 ; xorps xmm3,xmm3` — the
    // 3rd/4th operands to case 4 are always +0.0f.
    this.posKernel.SetParameter(4, scaleParamX, scaleParamY, Math.fround(0.0), Math.fround(0.0));

    // @Helium 0x23f204-0x23f2a1: same 5 calls, now on negKernel.
    this.negKernel.SetParameter(0, softness, softness, softness, softness);
    this.negKernel.SetParameter(1, scaled, scaled, scaled, scaled);
    this.negKernel.SetParameter(2, param2, param2, param2, param2);
    this.negKernel.SetParameter(3, param3, param3, param3, param3);
    this.negKernel.SetParameter(4, scaleParamX, scaleParamY, Math.fround(0.0), Math.fround(0.0));

    // @Helium 0x23f2a4-0x23f2c5: SetInput(0, upstream) on both children.
    this.posKernel.SetInput(0, upstream);
    this.negKernel.SetInput(0, upstream);

    // @Helium 0x23f2c8-0x23f2db: setae-driven select.
    //   ucomiss(0.0f, amount)  ordered/set-above-equal → true iff
    //   amount is >= 0.0f AND neither operand is NaN.
    //   The setae bit selects the child pointer via `movq 0x1c0(%rbx,%rax,8)`.
    // We reproduce that exactly (NaN falls through to `false`, so
    // NaN-amount routes to posKernel; that mirrors the setae semantic).
    const selectNeg = !(isNaN(amount)) && amount >= Math.fround(0.0);
    return selectNeg ? this.negKernel : this.posKernel;
  }
}
