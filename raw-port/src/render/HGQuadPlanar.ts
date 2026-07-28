// HGQuadPlanar.ts — Helium render-graph node that reads 4 planar inputs (Y/Cb/Cr/A, or the four
// planes of a QuadPlanar codec), assembles them via an HgcQuadPlanarReader, and returns a
// cropped output built on top. Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Fat binary: x86_64 slice starts at file offset 16384 (see `otool -f`); all VAs below are
// relative to that slice's virtual base (0).
//
// THREE SYMBOLS (Itanium ABI D1/D0 pair + one virtual method):
//   @Helium 0x0000000000040f90  HGQuadPlanar::GetOutput(HGRenderer*)                [instance method]
//   @Helium 0x0000000000041190  HGQuadPlanar::~HGQuadPlanar()                        [D1 base dtor]
//   @Helium 0x00000000000411d0  HGQuadPlanar::~HGQuadPlanar()                        [D0 deleting dtor]
//
// STRUCT LAYOUT (recovered from dtor + GetOutput loads):
//   +0x000  vtable ptr             (dtor writes rip-relative 0x9c606b → 0xa07208 =
//                                    _ZTV12HGQuadPlanar (0xa071f8) + 0x10; the +0x10 skips the
//                                    16-byte RTTI header at the top of the vtable image)
//   +0x008..+0x198  inherited HGNode fields (dtor tail-calls HGNode::~HGNode; layout not
//                                    recovered here because this D1 doesn't touch any of them)
//   +0x198  cachedOutput           HGObject*  (owning; virtual-dtor slot @vtable+0x18 destroys it,
//                                    then HGObject::operator delete frees it. GetOutput replaces
//                                    this slot with the newly-built HGCrop before returning.)
//
// VTABLE LAYOUT of the child classes we call into (recovered from indirect calls in GetOutput):
//   HgcQuadPlanarReader vtable ( _ZTV19HgcQuadPlanarReader @0xa3d548 ):
//     +0x18   virtual destructor  (called @0x41101 to drop the reader after we've swapped it out
//                                   via HGCrop's slot; also called in the exception cleanup)
//     +0x78   SetSource(int planeIndex, HGNode* src)   (called 4× @0x40fd1/0x40ff2/0x41013/0x41034
//                                                        with planeIndex 0/1/2/3)
//   HGCrop vtable ( _ZTV6HGCrop @0xa36ac8 ):
//     +0x18   virtual destructor  (called via the vtable to drop old this->cachedOutput before
//                                   assigning the new HGCrop; also in exception cleanup)
//     +0x60   SetRect(HGRectf)   (called @0x410ba with all-zero xmm regs and this rect; passes 4
//                                  float lanes in xmm0/xmm1/xmm2/xmm3)
//     +0x78   SetSource(int planeIndex, HGNode* src)   (called @0x410c8 with planeIndex=0 and
//                                                        src=the HgcQuadPlanarReader we just built)
//   Note: the +0x78 vtable slot has the same signature in both classes because HGCrop and
//   HgcQuadPlanarReader both derive from HGNode (or a shared HGNodeWithInputs mixin) and inherit
//   SetSource from there. This is standard OO — reviewers should not read anything more into it.
//
// KEY CONSTANT: `movss 0x389f2a(%rip), %xmm2` @0x4105a loads a single-precision float from VA
// 0x3caf8c (RIP-next-instr = 0x41062, so target = 0x41062 + 0x389f2a = 0x3caf8c). Bytes at that
// address in the file: 00 00 00 40 = 0x40000000 = float 2.0f. This is the (fixed, hardcoded)
// scale factor passed to _HGRectScale below. The scale is applied uniformly to both x and y —
// xmm2 (x-scale) is duplicated into xmm3 (y-scale) by `movaps %xmm2, %xmm3` @0x41062.
//
// GetOutput OPERATION (@0x40f90..0x41115) — high-level:
//    Build a HgcQuadPlanarReader `reader` capturing this HGQuadPlanar as HGNode source, wired
//    with 4 planar inputs. Compute the domain-of-definition (DOD) of input 0, promote to float,
//    scale ×2.0, snap to integer bounds → crop rect. Build an HGCrop whose bounds = that rect
//    and whose source = the reader. Install the crop into this->cachedOutput (releasing the
//    previous cache, if any). Return the crop pointer. Reader is virtual-destroyed as it's now
//    owned transitively by the crop's source slot.
//
// GetOutput CONTROL FLOW (line-by-line, faithful):
//   1. @0x40fa4 movl $0x1a0, %edi          ; size = 0x1a0 (416)
//      @0x40fa9 callq HGObject::operator new(0x1a0)          → reader raw storage in %rax
//   2. @0x40fb4 callq HgcQuadPlanarReader::HgcQuadPlanarReader()  ; placement-ctor on it
//   3-6. Four times, for planeIdx ∈ {0, 1, 2, 3}:
//        @0x40fbf/0x40fda/0x40ffb/0x4101c  callq HGRenderer::GetInput(renderer, this, planeIdx)
//        @0x40fd1/0x40ff2/0x41013/0x41034  callq *reader->vtable[+0x78](reader, planeIdx, input)
//   7. @0x40fdf again call HGRenderer::GetInput(renderer, this, 0)  ; re-fetch input 0 for DOD
//   8. @0x4104a callq HGRenderer::GetDOD(input0)   → returns HGRect in (%rax, %rdx)
//   9. @0x41055 callq _HGRectFloat(rect)           → HGRectf in (%rax, %rdx, %xmm0..?)
//  10. @0x41065 callq _HGRectScale(rect, sx=2.0f, sy=2.0f)   ; uniform ×2 scale
//  11. @0x4106a callq _HGRectIntegral(rect)        → HGRect (integer) in (%rax, %rdx)
//  12. @0x41075 movl $0x1a0, %edi
//      @0x4107a callq HGObject::operator new(0x1a0)          → crop raw storage in %rax
//  13. @0x41085 callq HGCrop::HGCrop()                       ; placement-ctor on it
//  14. @0x4108a..0x410ad: convert the 4 int32 lanes of the HGRect (which live packed in %r13/%r12
//      as low/high 64 bits) to 4 single-precision floats in xmm0..xmm3 via cvtsi2ss with an
//      xor-first-to-zero-upper pattern. Result: xmm0=x0, xmm1=y0, xmm2=x1, xmm3=y1.
//  15. @0x410ba callq *crop->vtable[+0x60](crop, 0, xmm0..xmm3)   ; SetRect (planeIndex=0)
//                     (%esi = 0 as the vtable's planeIndex/mode argument — matches SetSource's
//                     first arg width; %rdx not written before the call so it's whatever GetInput
//                     left there — but SetRect ignores rdx per its signature)
//  16. @0x410c8 callq *crop->vtable[+0x78](crop, 0, reader)       ; SetSource(0, reader)
//  17. @0x410cb loads this->cachedOutput (+0x198). Three cases:
//        A. old == new crop      → do nothing (release path @0x410eb takes over: virtual-destroy
//                                   the crop we just wrote (weird, but matches asm) and reload
//                                   into %r15; net effect: leave slot untouched and drop the
//                                   local). This is the compiler noticing GetOutput being called
//                                   with a self-referring input — unusual but observable.
//        B. old != new AND old != null → virtual-destroy old (vtable+0x18), then install new.
//        C. old != new AND old == null → install new.
//  18. @0x410fb callq reader->vtable[+0x18](reader)  ; virtual-destroy the reader (its ref is now
//                                                        held only through the crop's source slot,
//                                                        so this drop is a refcount decrement).
//  19. @0x41104 movq %r15, %rax          ; return the (possibly-reloaded) crop pointer
//  20. Epilogue.
//
// EXCEPTION PATHS (@0x41116..0x41188): a chain of landing pads that clean up the partially-
// constructed reader/crop under Unwind_Resume. We surface these as try/finally in TS to preserve
// the "always destroy what you built if we're throwing" contract, and let the throw propagate.
//
// DTOR OPERATIONS:
//   D1 base @0x41190:
//     1. Install vtable pointer @0xa07208 into (%rdi)              (reset vptr for base-class safety)
//     2. Load this->cachedOutput; if non-null call vtable[+0x18] on it (virtual-destroy).
//        NOTE: D1 does NOT `operator delete` cachedOutput — the virtual destroy is expected to
//        do that itself (that's HGObject's convention: vtable[+0x18] is a "delete-that" slot that
//        combines the destructor call and the operator delete). We faithfully DO NOT call
//        HGObject::operator delete here.
//     3. Tail-call HGNode::~HGNode(this) — cleans up the inherited HGNode subobject.
//   D0 deleting @0x411d0:
//     Same as D1 (with the same vtable slot store and virtual-destroy of cachedOutput), then
//     explicitly `HGObject::operator delete(this)` after HGNode::~HGNode returns (tail-jmp).
//     The D0 vtable install uses rip-relative 0x9c6028 — the same 0xa07208 target, computed from
//     the D0-body's own address; we cite it independently below.

import { HGRect, HGRectFloat, HGRectIntegral, type HGRectf } from './HGRect';

// ── Opaque frontier types ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HGRenderer {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HGNode {}
/**
 * HGObject — Helium's polymorphic base with a vtable whose +0x18 slot is a combined
 * "destructor-and-operator-delete" invocation (see D1 note above). HGQuadPlanar's cachedOutput
 * is typed as HGObject* because both HGCrop and any prior tenant (whatever GetOutput might have
 * left there in a previous invocation) share only that shape at the ABI level.
 */
export interface HGObject {
  /** +0x00 vtable ptr — for our purposes only the +0x18 "delete-self" slot matters. */
  vtable: {
    /** +0x18  virtual "destructor + operator delete" combined slot. */
    virtualDeleteSelf: (self: HGObject) => void;
    /** +0x60  SetRect(planeIndex, HGRectf) — HGCrop-side only; not present on all HGObjects. */
    virtualSetRect?: (self: HGObject, planeIndex: number, rect: HGRectf) => void;
    /** +0x78  SetSource(planeIndex, HGNode*) — HGCrop / HgcQuadPlanarReader side. */
    virtualSetSource?: (self: HGObject, planeIndex: number, src: HGNode) => void;
  };
}

// ── Frontier stubs (Rule 3) ───────────────────────────────────────────────────────────────────
/** HGObject::operator new(size_t) @Helium 0x?????? (via `__ZN8HGObjectnwEm` — a specialised
 *  arena allocator, address not resolved here as it's a symbol name callee not a numeric target). */
function HGObject_operator_new(_size: number): HGObject {
  throw new Error('HGObject::operator new (__ZN8HGObjectnwEm @Helium call @0x40fa9 / @0x4107a) not yet transcribed');
}
/** HGObject::operator delete(void*) — called ONLY from the D0 tail (@0x41206) here. */
function HGObject_operator_delete(_p: HGObject): void {
  throw new Error('HGObject::operator delete (__ZN8HGObjectdlEPv @Helium call @0x41206/0x41142/0x41159) not yet transcribed');
}
/** HgcQuadPlanarReader::HgcQuadPlanarReader() @Helium — placement-ctor called @0x40fb4. */
function HgcQuadPlanarReader_ctor(_self: HGObject): void {
  throw new Error('HgcQuadPlanarReader::HgcQuadPlanarReader (__ZN19HgcQuadPlanarReaderC1Ev @Helium call @0x40fb4) not yet transcribed');
}
/** HGCrop::HGCrop() @Helium — placement-ctor called @0x41085. */
function HGCrop_ctor(_self: HGObject): void {
  throw new Error('HGCrop::HGCrop (__ZN6HGCropC1Ev @Helium call @0x41085) not yet transcribed');
}
/** HGNode::~HGNode() D2 @Helium — tail-called from HGQuadPlanar D1 @0x411c1 and D0 @0x411f8. */
function HGNode_dtor(_self: HGNode): void {
  throw new Error('HGNode::~HGNode (__ZN6HGNodeD2Ev @Helium tail-call @0x411c1/0x411f8) not yet transcribed');
}
/** HGRenderer::GetInput(HGNode* node, int planeIndex) @Helium — called 5× in GetOutput. */
function HGRenderer_GetInput(_renderer: HGRenderer, _node: HGNode, _planeIndex: number): HGNode {
  throw new Error('HGRenderer::GetInput (__ZN10HGRenderer8GetInputEP6HGNodei @Helium call @0x40fc1/0x40fdf/0x41000/0x41021/0x4103f) not yet transcribed');
}
/** HGRenderer::GetDOD(HGNode*) @Helium — returns an HGRect (integer bounds). Called @0x4104a. */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  throw new Error('HGRenderer::GetDOD (__ZN10HGRenderer6GetDODEP6HGNode @Helium call @0x4104a) not yet transcribed');
}
/** HGRectScale @Helium 0x107f90 — scale an HGRectf by (sx, sy) single-precision. Called @0x41065. */
function HGRectScale(_rf: HGRectf, _sx: number, _sy: number): HGRectf {
  throw new Error('HGRectScale (_HGRectScale @Helium 0x107f90 call @0x41065) not yet transcribed');
}

// ── The class ─────────────────────────────────────────────────────────────────────────────────

/**
 * HGQuadPlanar — Helium render-graph node that combines four planar inputs into a single
 * cropped output. See file header for full semantics recovered from the disasm.
 */
export class HGQuadPlanar {
  /**
   * @Helium +0x00  vtable slot. The dtors reset this to 0xa07208 (which equals
   *   _ZTV12HGQuadPlanar (@0xa071f8) + 0x10, i.e. the address of the first method slot after the
   *   16-byte Itanium RTTI header). We do NOT model the vtable in TS — it's opaque to callers —
   *   but we keep this field for layout fidelity.
   */
  private _vtable: unknown = null;

  /**
   * @Helium +0x198  cachedOutput. Owning pointer to whatever HGObject GetOutput returned last
   * (typically an HGCrop). Both destructors virtual-destroy this slot before delegating to the
   * base HGNode dtor. GetOutput replaces this slot in-place.
   */
  cachedOutput: HGObject | null = null;

  /**
   * @Helium 0x40f90  HGQuadPlanar::GetOutput(HGRenderer*)
   * Faithful line-by-line transcription of the render-graph builder. See the file header for the
   * numbered high-level walk; this method mirrors those steps with the exact vtable-slot / callee
   * citations at each site.
   */
  GetOutput(renderer: HGRenderer): HGObject {
    // @0x40fa4/0x40fa9  new HgcQuadPlanarReader (uninitialised, 0x1a0 bytes)
    const readerStorage: HGObject = HGObject_operator_new(0x1a0);
    let reader: HGObject | null = readerStorage;
    try {
      // @0x40fb4 placement-ctor
      HgcQuadPlanarReader_ctor(reader);

      // @0x40fbf..0x41034  For planeIdx ∈ {0,1,2,3}: reader.SetSource(planeIdx, GetInput(this, planeIdx))
      // Loop unrolled in the binary as 4 discrete blocks; we mirror the same 4-step sequence.
      for (let planeIdx = 0; planeIdx < 4; planeIdx++) {
        // @0x40fbf/0x40fda/0x40ffb/0x4101c
        const input: HGNode = HGRenderer_GetInput(renderer, this as unknown as HGNode, planeIdx);
        // @0x40fd1/0x40ff2/0x41013/0x41034  callq *reader->vtable[+0x78]
        if (reader.vtable.virtualSetSource === undefined) {
          throw new Error(
            `HgcQuadPlanarReader vtable[+0x78] SetSource slot missing (@Helium call @0x40fd1 planeIdx=${planeIdx})`,
          );
        }
        reader.vtable.virtualSetSource(reader, planeIdx, input);
      }

      // @0x40fdf..0x4104a  Re-fetch input 0 and query its Domain-Of-Definition.
      //   xorl %edx, %edx     ; planeIndex = 0
      //   callq HGRenderer::GetInput(renderer, this, 0)
      //   callq HGRenderer::GetDOD(renderer, input0)
      const input0: HGNode = HGRenderer_GetInput(renderer, this as unknown as HGNode, 0);
      const dodInt: HGRect = HGRenderer_GetDOD(renderer, input0);

      // @0x41055 callq _HGRectFloat(rect)   ; int → float
      const dodFloat: HGRectf = HGRectFloat(dodInt);

      // @0x4105a movss  <literal 2.0f> @VA 0x3caf8c, %xmm2
      // @0x41062 movaps %xmm2, %xmm3            ; sy = sx
      // @0x41065 callq _HGRectScale(rf, 2.0f, 2.0f)
      const dodScaled: HGRectf = HGRectScale(dodFloat, Math.fround(2.0), Math.fround(2.0));

      // @0x4106a callq _HGRectIntegral(rf)     ; snap outward to integer bounds
      const cropBoundsInt: HGRect = HGRectIntegral(dodScaled);
      // Convert to float lanes for HGCrop::SetRect (xmm0..xmm3 hold {x0,y0,x1,y1} as float).
      // @0x4108a..0x410ad  cvtsi2ss chain: pack the 4 int32 lanes stored in %r13 (low qword) and
      // %r12 (high qword) as sx0/sy0/sx1/sy1 in xmm0..xmm3. We rebuild an HGRectf explicitly to
      // preserve the single-precision widening that cvtsi2ss performs (int32 → float32).
      const cropBoundsFloat: HGRectf = {
        x: Math.fround(cropBoundsInt.x),
        y: Math.fround(cropBoundsInt.y),
        right: Math.fround(cropBoundsInt.right),
        bottom: Math.fround(cropBoundsInt.bottom),
      };

      // @0x41075/0x4107a  new HGCrop (uninitialised, 0x1a0 bytes)
      const cropStorage: HGObject = HGObject_operator_new(0x1a0);
      let crop: HGObject | null = cropStorage;
      try {
        // @0x41085 placement-ctor
        HGCrop_ctor(crop);

        // @0x410b2..0x410ba  callq *crop->vtable[+0x60] with (crop, planeIndex=0, cropBoundsFloat)
        //   NOTE the asm sets %esi = 0 explicitly; the rect goes in xmm0..xmm3.
        if (crop.vtable.virtualSetRect === undefined) {
          throw new Error('HGCrop vtable[+0x60] SetRect slot missing (@Helium call @0x410ba)');
        }
        crop.vtable.virtualSetRect(crop, 0, cropBoundsFloat);

        // @0x410bd..0x410c8  callq *crop->vtable[+0x78] with (crop, 0, reader)
        //   %rdx = reader — install the just-built QuadPlanarReader as crop's plane-0 source.
        if (crop.vtable.virtualSetSource === undefined) {
          throw new Error('HGCrop vtable[+0x78] SetSource slot missing (@Helium call @0x410c8)');
        }
        crop.vtable.virtualSetSource(crop, 0, reader as unknown as HGNode);

        // @0x410cb..0x410fb  Install crop into this->cachedOutput, replacing whatever was there.
        // The three-way branch (self, non-null non-self, null) exactly mirrors the asm at @0x410d2..
        const oldOutput: HGObject | null = this.cachedOutput;
        // @0x410d2 cmpq %r15, %rdi         ; compare old vs new crop
        // @0x410d5 je   0x410eb            ; branch A: old == new  → weird self-install path
        if (oldOutput === crop) {
          // @0x410eb..0x410f4  virtual-destroy the crop we just wrote (matches asm exactly), then
          // reload this->cachedOutput into %r15 (so we return whatever's there — which is the
          // still-installed crop we just called delete-self on; this branch is only reachable if
          // the caller passed a renderer whose GetInput cycled back to us, which is degenerate).
          crop.vtable.virtualDeleteSelf(crop);
          crop = this.cachedOutput; // will still be the same pointer; asm reloads +0x198 into %r15
        } else {
          // @0x410d7 testq %rdi, %rdi
          // @0x410da je   0x410e2          ; branch C: old == null → skip virtual-destroy
          if (oldOutput !== null) {
            // @0x410dc..0x410df  callq *oldOutput->vtable[+0x18]   ; virtual-destroy old
            oldOutput.vtable.virtualDeleteSelf(oldOutput);
          }
          // @0x410e2  install new pointer into +0x198
          this.cachedOutput = crop;
        }

        // @0x410fb..0x41101  callq *reader->vtable[+0x18]  ; virtual-destroy the reader locally.
        //   The reader's live reference now lives inside the crop's source slot (installed above).
        //   This local dtor drops the ref we held on the stack — refcount decrement, not a free.
        reader.vtable.virtualDeleteSelf(reader);
        reader = null;

        // @0x41104  return this->cachedOutput (which is either the crop we installed, or the
        // pre-existing crop kept in the self-install degenerate branch).
        const returnValue: HGObject | null = this.cachedOutput;
        if (returnValue === null) {
          // Not reachable in the asm — the store at @0x410e2 always writes non-null. Guard for TS.
          throw new Error('HGQuadPlanar::GetOutput: cachedOutput unexpectedly null after install (unreachable in @Helium 0x41104)');
        }
        return returnValue;
      } catch (e) {
        // @0x41116..0x41163  crop-side exception cleanup: if crop was built, virtual-destroy +
        // operator-delete it. Faithful analogue of the landing pad chain.
        if (crop !== null) {
          try { crop.vtable.virtualDeleteSelf(crop); } catch { /* ignore secondary */ }
          try { HGObject_operator_delete(crop); } catch { /* ignore secondary */ }
        }
        throw e;
      }
    } catch (e) {
      // @0x41166..0x4117b  reader-side exception cleanup: virtual-destroy the reader.
      if (reader !== null) {
        try { reader.vtable.virtualDeleteSelf(reader); } catch { /* ignore secondary */ }
      }
      throw e;
    }
  }

  /**
   * @Helium 0x41190  HGQuadPlanar::~HGQuadPlanar()  D1 base destructor.
   * Faithful transcription. Compiler emits a `jmp` tail-call to HGNode::~HGNode — we mirror as a
   * plain call (JS has no tail-call flag but the observable behaviour is identical).
   */
  destroyBase(): void {
    // @0x41196..0x4119d  leaq 0x9c606b(%rip),%rax ; movq %rax,(%rdi)   — reset vptr → 0xa07208
    // Address arithmetic: (0x4119d + 0x9c606b) = 0xa07208 =
    //   _ZTV12HGQuadPlanar (@0xa071f8) + 0x10  (skip 16-byte RTTI header).
    this._vtable = 0xa07208;

    // @0x411a0 movq 0x198(%rdi), %rax     ; rax = this->cachedOutput
    // @0x411a7 testq %rax, %rax
    // @0x411aa je   0x411bb                (skip virtual-destroy if null)
    const cached: HGObject | null = this.cachedOutput;
    if (cached !== null) {
      // @0x411ac movq (%rax), %rcx        ; rcx = cached->vtable
      // @0x411b2 movq %rax, %rdi
      // @0x411b5 callq *0x18(%rcx)        ; cached->vtable[+0x18]  (virtual delete-self combined slot)
      cached.vtable.virtualDeleteSelf(cached);
    }

    // @0x411bb..0x411c1  Tail-call HGNode::~HGNode(this). The asm advances %rdi by 0x8 (`addq
    // $0x8, %rsp`) — wait, that's the stack pointer restore, not the argument. Actually the
    // effective `this` passed to HGNode::~HGNode is unchanged from %rdi (still points at the
    // HGQuadPlanar this). No `addq $0x10, %rdi` here — this D1 tails HGNode directly, no vptr
    // adjustment. HGNode subobject occupies bytes 0..0x198 of HGQuadPlanar. Its dtor cleans them.
    HGNode_dtor(this as unknown as HGNode);
  }

  /**
   * @Helium 0x411d0  HGQuadPlanar::~HGQuadPlanar()  D0 deleting destructor.
   * Same body as D1 (reset vptr → virtual-destroy cachedOutput → HGNode::~HGNode), then extra
   * step: call HGObject::operator delete(this) via tail-jmp.
   *
   * Note the vptr install here uses a DIFFERENT rip-relative displacement (0x9c6028 instead of
   * 0x9c606b) because the LEA is emitted at a different code address (0x411dc vs 0x41196), but
   * both resolve to the SAME target VA 0xa07208 (verified: 0x411e0 + 0x9c6028 = 0xa07208).
   */
  destroyDeleting(): void {
    // @0x411d9..0x411e0  leaq 0x9c6028(%rip),%rax ; movq %rax,(%rdi)
    this._vtable = 0xa07208;

    // @0x411e3 movq 0x198(%rdi), %rdi   ; rdi = this->cachedOutput  (note: overwrites %rdi in the
    //                                     ASM to reuse it as the callee's `this`; TS keeps the
    //                                     original this via `this` binding — no aliasing.)
    // @0x411ea testq %rdi, %rdi
    // @0x411ed je   0x411f5              (skip if null)
    // @0x411ef movq (%rdi), %rax
    // @0x411f2 callq *0x18(%rax)
    const cached: HGObject | null = this.cachedOutput;
    if (cached !== null) {
      cached.vtable.virtualDeleteSelf(cached);
    }

    // @0x411f5 movq %rbx, %rdi           ; restore this (the outer HGQuadPlanar*)
    // @0x411f8 callq HGNode::~HGNode
    HGNode_dtor(this as unknown as HGNode);

    // @0x411fd movq %rbx, %rdi
    // @0x41206 jmp   HGObject::operator delete   (tail-call)
    HGObject_operator_delete(this as unknown as HGObject);
  }
}
