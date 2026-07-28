// HGRetimeWithFrameBlend.ts — Helium
//
// HGRetimeWithFrameBlend is the outward-facing render-graph node for the
// "retime with frame blend" transition kernel. It lazily instantiates its
// inner `HgcRetimeWithFrameBlend` (a separate FCP class — undecoded
// frontier at this layer) inside GetOutput, then routes it two inputs
// (the two clips to blend between) and its own float parameter (the
// blend/phase in [0..1]).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassemblies (all in raw-port/re/disasm/):
//   Helium.HGRetimeWithFrameBlend.HGRetimeWithFrameBlend.s      (C1 @0x1e3860; C2 @0x1e3820 is an alias)
//   Helium.HGRetimeWithFrameBlend.~HGRetimeWithFrameBlend.s     (D0 deleting @0x1e3920; D1 @0x1e38e0, D2 @0x1e38a0 same body minus delete)
//   Helium.HGRetimeWithFrameBlend.SetParameter.s                (@0x1e3970)
//   Helium.HGRetimeWithFrameBlend.GetOutput.s                   (@0x1e39b0)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from ctor + accessor sites)
// -----------------------------------------------------------------------------
//   struct HGRetimeWithFrameBlend : HGNode {
//     // +0x000  vtable*  installed @0x1e386e/@0x1e3875 (leaq 0x847d53(%rip),%rax ; mov %rax,(%rbx))
//     // +0x010  uint32   HGNode flags (base — not touched by this class)
//     // +0x198  float32  phase              (SetParameter target; GetOutput @0x1e3a5d reads it)
//     // +0x1a0  HgcRetimeWithFrameBlend*  child_kernel  (lazily created in GetOutput; released
//     //                                                  in D0/D1/D2 via child->vtable[+0x18])
//   };
//
// -----------------------------------------------------------------------------
// External callees cited (all Helium; addresses are RIP-relative __stubs
// unless otherwise noted):
//   @0x1e3869  HGNode::HGNode()                                  (base ctor — frontier)
//   @0x1e3948  HGNode::~HGNode()                                 (base dtor — frontier)
//   @0x1e3956  HGObject::operator delete(void*)                  (D0 tail-jmp — frontier)
//   @0x1e399e  HGNode::ClearBits()                               (SetParameter invalidates cache)
//   @0x1e39c6  HGObject::operator new(unsigned long)             (allocates the child kernel)
//   @0x1e39d1  HgcRetimeWithFrameBlend::HgcRetimeWithFrameBlend  (child kernel ctor — frontier)
//   @0x1e3a1a  HGRenderer::GetInput(HGNode*, int)                (fetch input 0 — frontier)
//   @0x1e3a40  HGRenderer::GetInput(HGNode*, int)                (fetch input 1 — frontier)
//   @0x1e3a2b  child->vtable[0x78]  (child, 0, input0)           (attach source 0 — undecoded slot)
//   @0x1e3a53  child->vtable[0x78]  (child, 1, input1)           (attach source 1 — undecoded slot)
//   @0x1e3a73  child->vtable[0x60]  (child, 0, phase, 0, 0, 0)   (call child SetParameter — undecoded slot)
//   @0x1e3942/@0x1e3905/@0x1e38c5/@0x1e39ee/@0x1e3a08
//               child->vtable[0x18]  (child)                     (child release/dispose — undecoded slot)
//   @0x1e395e / @0x1e3a89 / @0x1e3aa4  __clang_call_terminate    (unwind cleanup — frontier)
//   @0x1e3ab7  __Unwind_Resume                                   (exception rethrow — frontier)
//
// The child_kernel's vtable slot 0x78 is a "SetInput(index, node)" hook
// (the same pattern used by every HG* multi-input node in the framework);
// slot 0x60 is a "SetParameter" hook that accepts up to four floats. Slot
// 0x18 is the standard HGObject release/dispose slot (called during
// destruction and when replacing an existing child pointer). None of the
// child's vtable slots are decoded at this leaf.

import { HGRectNull } from "./HGRect";
// (HGRectNull is not read by this class — imported so the render/ dir
//  namespace stays consistent with sibling ports. Referenced below via a
//  static assertion to keep imports live.)
type _UnusedGuard_HGRectNull = typeof HGRectNull;

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGRenderer* — opaque render context handle. */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HGNode base — this class extends HGNode. HGNode's own layout is
 *  undecoded at this leaf; we only surface the flags dword because the
 *  ctor's `HGNode::HGNode()` frontier call will populate it. */
export interface HGNode {
  /** self+0x10 — HGNode flags dword. Not touched by this class directly. */
  flags_at_0x10: number;
}

/** HgcRetimeWithFrameBlend* — the child kernel this node owns. Instantiated
 *  in GetOutput @0x1e39d1 via `HGObject::operator new(0x1a0)` + its C1 ctor.
 *  All uses go through its vtable's slot 0x78 (SetInput), 0x60
 *  (SetParameter), and 0x18 (dispose). Undecoded frontier. */
export interface HgcRetimeWithFrameBlend {
  /** self+0x00 — vtable*. Accessed as `movq (%r12),%rax ; callq *0x18(%rax)`
   *  etc. Not modelled as data on the interface. */
  readonly __brand: "HgcRetimeWithFrameBlend";
}

/** HGRetimeWithFrameBlend instance shape. See STRUCT LAYOUT above. */
export interface HGRetimeWithFrameBlend extends HGNode {
  /** self+0x198 — float32 phase parameter, clamped to [0..1] by SetParameter. */
  phase_at_0x198: number;
  /** self+0x1a0 — child HgcRetimeWithFrameBlend* (or null). */
  child_at_0x1a0: HgcRetimeWithFrameBlend | null;
}

// -----------------------------------------------------------------------------
// Frontier stubs.
// -----------------------------------------------------------------------------

/** HGNode::HGNode() — base ctor called @0x1e3869. Frontier stub. */
function HGNode_ctor(_self: HGNode): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed: called from HGRetimeWithFrameBlend ctor @Helium 0x1e3869 as an undecoded frontier symbol.",
  );
}

/** HGNode::~HGNode() — base dtor called @0x1e3948. Frontier stub. */
function HGNode_dtor(_self: HGNode): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed: called from HGRetimeWithFrameBlend D0 @Helium 0x1e3948 as an undecoded frontier symbol.",
  );
}

/** HGNode::ClearBits() — invalidation hook @0x1e399e. Frontier stub. */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() not yet transcribed: called from HGRetimeWithFrameBlend::SetParameter @Helium 0x1e399e as an undecoded frontier symbol.",
  );
}

/** HGObject::operator delete(void*) — @Helium __ZN8HGObjectdlEPv. Frontier. */
function HGObject_operator_delete(_self: HGNode): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed: tail-jmped from HGRetimeWithFrameBlend D0 @Helium 0x1e3956 as an undecoded frontier symbol.",
  );
}

/** HGObject::operator new(unsigned long) — @Helium __ZN8HGObjectnwEm.
 *  Frontier stub. Allocates a raw block of `size` bytes. Called from
 *  GetOutput @0x1e39c6 with size=0x1a0 (the sizeof(HgcRetimeWithFrameBlend)). */
function HGObject_operator_new(_size: number): HgcRetimeWithFrameBlend {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed: called from HGRetimeWithFrameBlend::GetOutput @Helium 0x1e39c6 with size=0x1a0 as an undecoded frontier symbol.",
  );
}

/** HgcRetimeWithFrameBlend::HgcRetimeWithFrameBlend() — child kernel C1.
 *  @Helium __ZN23HgcRetimeWithFrameBlendC1Ev. Frontier stub. */
function HgcRetimeWithFrameBlend_ctor(_self: HgcRetimeWithFrameBlend): void {
  throw new Error(
    "HgcRetimeWithFrameBlend::HgcRetimeWithFrameBlend() not yet transcribed: called from HGRetimeWithFrameBlend::GetOutput @Helium 0x1e39d1 as an undecoded frontier symbol.",
  );
}

/** HGRenderer::GetInput(HGNode*, int) — @Helium
 *  __ZN10HGRenderer8GetInputEP6HGNodei. Frontier stub. */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _self: HGNode,
  _which: number,
): HGNode {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed: called from HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a1a and 0x1e3a40 as an undecoded frontier symbol.",
  );
}

/** child->vtable[0x78] — "SetInput(index, node)". Frontier stub. */
function child_vslot0x78_setInput(
  _child: HgcRetimeWithFrameBlend,
  _index: number,
  _input: HGNode,
): void {
  throw new Error(
    "HgcRetimeWithFrameBlend::<vtable slot 0x78> (SetInput) not yet transcribed: virtual dispatch from HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a2b and 0x1e3a53 — vtable slot target undecoded.",
  );
}

/** child->vtable[0x60] — "SetParameter(index, x, y, z, w)". Frontier stub. */
function child_vslot0x60_setParameter(
  _child: HgcRetimeWithFrameBlend,
  _index: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void {
  throw new Error(
    "HgcRetimeWithFrameBlend::<vtable slot 0x60> (SetParameter) not yet transcribed: virtual dispatch from HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a73 — vtable slot target undecoded.",
  );
}

/** child->vtable[0x18] — "release/dispose". Frontier stub. Called during
 *  ownership handoff in GetOutput (@0x1e39ee for existing child if new one
 *  didn't take over; @0x1e3a08 for the freshly-constructed one if it wasn't
 *  installed) and during destruction (@0x1e38c5 in D2, @0x1e3905 in D1,
 *  @0x1e3942 in D0). */
function child_vslot0x18_release(_child: HgcRetimeWithFrameBlend): void {
  throw new Error(
    "HgcRetimeWithFrameBlend::<vtable slot 0x18> (release/dispose) not yet transcribed: virtual dispatch from HGRetimeWithFrameBlend D0/D1/D2 dtors @Helium 0x1e3942 / 0x1e3905 / 0x1e38c5 and GetOutput @Helium 0x1e39ee / 0x1e3a08 — vtable slot target undecoded.",
  );
}

// -----------------------------------------------------------------------------
// Constants recovered from RIP-relative loads.
// -----------------------------------------------------------------------------

/** SetParameter @0x1e3982: `movss 0x1e4336(%rip), %xmm1` — target VA
 *  0x3c7cc0. Reads 4 bytes = 0x3f800000 = 1.0f. This is the UPPER clamp
 *  bound for the phase parameter. The LOWER clamp bound is 0.0f built
 *  in-register via `xorps %xmm1, %xmm1` @0x1e397a. */
const SETPARAM_CLAMP_HI = 1.0;

// -----------------------------------------------------------------------------
// HGRetimeWithFrameBlend::HGRetimeWithFrameBlend() (C1 @Helium 0x1e3860;
// C2 @Helium 0x1e3820 is an alias body — same layout.)
//
//   @0x1e3869  callq HGNode::HGNode()                       ; base ctor
//   @0x1e386e-@0x1e3875  install vtable pointer at self+0x00
//   @0x1e3878  movq  $0x0, 0x1a0(%rbx)                      ; child = null
//   @0x1e3883  movl  $0x0, 0x198(%rbx)                      ; phase = 0 (as f32 int zero)
//   (no HGNode flag rewrite — unlike HgcApply3DLUTTetrahedralUniform_basekernel)
// -----------------------------------------------------------------------------

/** HGRetimeWithFrameBlend::ctor() @Helium 0x1e3860. Initializes phase to
 *  0.0f, child pointer to null, and installs the class vtable at self+0x00
 *  after chaining to HGNode's base ctor. */
export function HGRetimeWithFrameBlend_ctor(self: HGRetimeWithFrameBlend): void {
  // @0x1e3869 base ctor. Frontier stub.
  HGNode_ctor(self);
  // @0x1e386e-@0x1e3875 install vtable — not modelled as data in TS.
  // @0x1e3878 self->child_at_0x1a0 = null.
  self.child_at_0x1a0 = null;
  // @0x1e3883 self->phase_at_0x198 = 0.0f (via `movl $0x0` — 4-byte zero
  // store; interpretation as f32 is +0.0).
  self.phase_at_0x198 = 0.0;
}

// -----------------------------------------------------------------------------
// HGRetimeWithFrameBlend::~HGRetimeWithFrameBlend() (D2 @Helium 0x1e38a0;
// D1 @Helium 0x1e38e0; D0 @Helium 0x1e3920)
//
// All three share the same body up to the tail:
//   @<addr>+0x06  leaq  <vtable>(%rip), %rax
//   @<addr>+0x0d  movq  %rax, (%rdi)                        ; re-install this-class vtable
//   @<addr>+0x10  movq  0x1a0(%rdi), %rax                   ; rax = child
//   @<addr>+0x17  testq %rax, %rax ; je end                 ; if (!child) skip
//   @<addr>+0x1c  movq  (%rax), %rcx ; movq %rdi,%rbx       ; rcx = child->vtable
//                 movq  %rax, %rdi ; callq *0x18(%rcx)      ; child->release() (vslot 0x18)
//                 movq  %rbx, %rdi                          ; restore this
//   D2 ends here.
//   D1 = D2 body (same content — D1 tail-calls its own logic).
//   D0 adds:
//     @0x1e3948 callq HGNode::~HGNode()
//     @0x1e3956 jmp   HGObject::operator delete
// -----------------------------------------------------------------------------

/** HGRetimeWithFrameBlend::~*(D2) @Helium 0x1e38a0.
 *  Releases the child kernel (via its vtable slot 0x18) if present. Does
 *  NOT chain to HGNode::~HGNode() — that's D1's/D0's job on the C++ side.
 *  (In the FCP binary D2 is the base-only dtor called from D1/D0; C++
 *  ABI conventions.) */
export function HGRetimeWithFrameBlend_dtor_D2(
  self: HGRetimeWithFrameBlend,
): void {
  // @0x1e38a6-@0x1e38ad re-install this-class vtable — no-op in TS.
  // @0x1e38b0-@0x1e38ba test child != null.
  const child = self.child_at_0x1a0;
  if (child !== null) {
    // @0x1e38bc-@0x1e38c5 child->vtable[0x18](child) — release.
    child_vslot0x18_release(child);
  }
  // Note: the C++ D2 does NOT set self.child_at_0x1a0 = null after the
  // release call. Faithfully mirror that (dtor doesn't nil the pointer —
  // the object is about to be freed anyway).
}

/** HGRetimeWithFrameBlend::~*(D1) @Helium 0x1e38e0.
 *  Same body as D2 (release child if present). */
export function HGRetimeWithFrameBlend_dtor_D1(
  self: HGRetimeWithFrameBlend,
): void {
  // @0x1e38e6-@0x1e38ed re-install vtable.
  // @0x1e38f0-@0x1e38fa test child.
  const child = self.child_at_0x1a0;
  if (child !== null) {
    // @0x1e38fc-@0x1e3905 child->vtable[0x18](child).
    child_vslot0x18_release(child);
  }
}

/** HGRetimeWithFrameBlend::~*(D0 deleting) @Helium 0x1e3920.
 *  D2-body + `HGNode::~HGNode()` + tail-jmp `HGObject::operator delete`.
 *  Frontier: all three deallocators (child release, HGNode dtor, operator
 *  delete) are undecoded. */
export function HGRetimeWithFrameBlend_dtor_D0(
  self: HGRetimeWithFrameBlend,
): void {
  // @0x1e3929-@0x1e3930 re-install vtable — no-op.
  // @0x1e3933-@0x1e393d child release if present.
  const child = self.child_at_0x1a0;
  if (child !== null) {
    // @0x1e393f-@0x1e3942 child->vtable[0x18](child).
    child_vslot0x18_release(child);
  }
  // @0x1e3948 HGNode::~HGNode() — frontier throws.
  HGNode_dtor(self);
  // @0x1e3956 jmp HGObject::operator delete — frontier throws.
  HGObject_operator_delete(self);
}

// -----------------------------------------------------------------------------
// HGRetimeWithFrameBlend::SetParameter(int i, float x, float y, float z, float w) @Helium 0x1e3970
//
//   @0x1e3970  movl  $0xffffffff, %eax                      ; default rc = -1
//   @0x1e3975  testl %esi, %esi ; je _clamp ; retq          ; if (i != 0) return -1
//
//   ; _clamp: (x = xmm0)
//   @0x1e397a  xorps %xmm1, %xmm1                            ; xmm1 = 0.0
//   @0x1e397d  ucomiss %xmm0, %xmm1 ; ja _store              ; if (0.0 > x) -> store 0.0 (i.e. x < 0)
//   @0x1e3982  movss 0x1e4336(%rip), %xmm1                   ; xmm1 = 1.0f (const @0x3c7cc0)
//   @0x1e398a  ucomiss %xmm1, %xmm0 ; ja _store              ; if (x > 1.0) -> store 1.0
//   @0x1e398f  movaps %xmm0, %xmm1                            ; else xmm1 = x
//
//   ; _store:
//   @0x1e3996  movss %xmm1, 0x198(%rdi)                       ; self->phase = clamped
//   @0x1e399e  callq HGNode::ClearBits()                      ; invalidate cache
//   @0x1e39a3  movl  $0x1, %eax ; retq                        ; return 1 ("changed")
//
// Note: unlike Hgc*_basekernel::SetParameter, there is NO "unchanged"
// early-out — the clear+return-1 path is unconditional as long as `i == 0`.
// Also unlike SetParameter on the LUT kernel, only ONE float (x) is used;
// y/z/w are ignored. And the disasm does NOT use xorps/ucomiss to test NaN;
// `ucomiss ... ja` is a signed ordered "greater than" check — NaN forces
// the "not above" branch (falls through), so NaN inputs become the input
// x itself (movaps %xmm0,%xmm1) and are stored VERBATIM. Faithfully mirror.
// -----------------------------------------------------------------------------

/** HGRetimeWithFrameBlend::SetParameter @Helium 0x1e3970. Only parameter
 *  index 0 is valid; clamps `x` to [0.0f, 1.0f] via ucomiss ordered
 *  compares (NaN stores verbatim, matching the disasm). y/z/w unused.
 *  Returns 1 on success, -1 on invalid index. */
export function HGRetimeWithFrameBlend_SetParameter(
  self: HGRetimeWithFrameBlend,
  i: number,
  x: number,
  _y: number,
  _z: number,
  _w: number,
): number {
  // @0x1e3975 testl %esi,%esi ; je — only i == 0 is valid.
  if ((i | 0) !== 0) {
    // @0x1e3979 retq with eax = -1.
    return -1;
  }

  // @0x1e397a-@0x1e398f: clamp to [0, 1] via ordered compares. Match the
  // ucomiss semantics: `ja` is "unsigned above" but on floats it means
  // "ordered and greater than" — NaN falls through (which stores x
  // verbatim). We can express this as:
  //   if (0.0 > x)          y = 0.0
  //   else if (x > 1.0)     y = 1.0
  //   else                  y = x
  // In JS, comparisons with NaN are always false, so `0.0 > NaN` is
  // false and `NaN > 1.0` is false — the else branch fires and stores
  // NaN verbatim. That MATCHES the ucomiss+`ja` semantics.
  //
  // We must ALSO round to f32 (movss stores 4 bytes), so pass the input
  // through Math.fround before comparing (matching xmm0's single-
  // precision representation).
  const xf = Math.fround(x);
  let clamped: number;
  if (0.0 > xf) {
    clamped = 0.0;
  } else if (xf > SETPARAM_CLAMP_HI) {
    clamped = SETPARAM_CLAMP_HI;
  } else {
    clamped = xf;
  }

  // @0x1e3996 movss %xmm1, 0x198(%rdi) — store the clamped f32.
  self.phase_at_0x198 = clamped;

  // @0x1e399e callq HGNode::ClearBits() — invalidate cache.
  HGNode_ClearBits(self);

  // @0x1e39a3 movl $0x1, %eax — return 1 ("changed").
  return 1;
}

// -----------------------------------------------------------------------------
// HGRetimeWithFrameBlend::GetOutput(HGRenderer*) @Helium 0x1e39b0
//
// The interesting method — lazy child-kernel construction and wiring:
//
//   @0x1e39c1  movl  $0x1a0, %edi ; callq HGObject::operator new(0x1a0)
//   @0x1e39cb  movq  %rax, %r15
//   @0x1e39d1  callq HgcRetimeWithFrameBlend::HgcRetimeWithFrameBlend()    ; child ctor
//   @0x1e39d6  movq  0x1a0(%rbx), %r12                                     ; r12 = old_child
//   @0x1e39dd  cmpq  %r15, %r12
//   @0x1e39e0  je    _skip_replace                                         ; if (new == old) skip replace
//   @0x1e39e2  testq %r12, %r12 ; je _install_new                           ; if (!old) skip release
//   @0x1e39e7-@0x1e39ee   call old_child->vtable[0x18](old_child)          ; release old
//   @0x1e39f1  movq  %r15, 0x1a0(%rbx)                                      ; self->child = new
//   @0x1e39f8  movq  %r15, %r12                                              ; r12 = new (current)
//   @0x1e39fb  jmp   _use_child
//
//   _skip_replace:
//   @0x1e39fd  testq %r15, %r15 ; je _use_child                              ; (in practice new != null)
//   @0x1e3a02-@0x1e3a08  call new->vtable[0x18](new)                         ; new was === old — release the just-created copy
//   @0x1e3a0b  movq  0x1a0(%rbx), %r12                                       ; r12 = self->child (now the OLD one, still installed)
//
//   _use_child:
//   @0x1e3a12  callq HGRenderer::GetInput(this, 0)                           ; input0
//   @0x1e3a1f-@0x1e3a2b   child->vtable[0x78](child, 0, input0)               ; child->SetInput(0, input0)
//   @0x1e3a35-@0x1e3a53   input1 = HGRenderer::GetInput(this, 1)
//                         child->vtable[0x78](child, 1, input1)               ; child->SetInput(1, input1)
//   @0x1e3a56  movq  0x1a0(%rbx), %rdi
//   @0x1e3a5d  movss 0x198(%rbx), %xmm0                                       ; xmm0 = self->phase
//   @0x1e3a68-@0x1e3a6e  xorps %xmm1,%xmm1 ; xorps %xmm2,%xmm2 ; xorps %xmm3,%xmm3  ; y=z=w=0
//   @0x1e3a71  xorl  %esi, %esi                                                ; index = 0
//   @0x1e3a73  callq child->vtable[0x60]                                       ; child->SetParameter(0, phase, 0, 0, 0)
//   @0x1e3a76  movq  0x1a0(%rbx), %rax                                          ; return self->child
//   @0x1e3a7d-@0x1e3a85  epilogue: retq
//
// Exception-handler tails (@0x1e3a86-@0x1e3ab7): if any of the intervening
// calls throws, `__clang_call_terminate` (from operator new's exceptions)
// or a `HGObject::operator delete(new)` cleanup + `__Unwind_Resume` runs.
// We surface the successful path only — exceptions in TS just propagate.
//
// The `new === old_child` early-out path is odd but is exactly what the
// disasm does — presumably operator new is DETERMINISTIC in some cache-
// backed scenario and can hand back the SAME pointer as an in-use
// child_at_0x1a0. In that case the code releases the just-constructed
// duplicate (which was still owned in %r15) and leaves the installed
// child alone. Faithful transcription only.
// -----------------------------------------------------------------------------

/** HGRetimeWithFrameBlend::GetOutput @Helium 0x1e39b0. Lazily constructs
 *  (and possibly replaces) the child HgcRetimeWithFrameBlend kernel,
 *  wires renderer inputs 0 and 1 into it via the child's vtable slot
 *  0x78, pushes `self.phase_at_0x198` into slot 0x60 as parameter #0
 *  (with y=z=w=0), and returns the child pointer.
 *
 *  Every callee is a frontier stub — this function's shape is decoded
 *  but its downstream is undecoded. */
export function HGRetimeWithFrameBlend_GetOutput(
  self: HGRetimeWithFrameBlend,
  renderer: HGRenderer,
): HgcRetimeWithFrameBlend {
  // @0x1e39c1-@0x1e39d1 allocate + construct a fresh HgcRetimeWithFrameBlend.
  // Both allocator and ctor are frontier stubs — this line WILL throw. We
  // still express the shape faithfully so downstream ports can see the
  // wiring intent.
  const fresh = HGObject_operator_new(0x1a0);
  HgcRetimeWithFrameBlend_ctor(fresh);

  // @0x1e39d6-@0x1e3a0b: install-or-discard.
  const oldChild = self.child_at_0x1a0;
  let current: HgcRetimeWithFrameBlend;
  // @0x1e39dd cmpq %r15,%r12 ; @0x1e39e0 je _skip_replace
  if (oldChild === fresh) {
    // @0x1e39fd testq %r15,%r15 ; je _use_child — fresh must be non-null
    // (operator new either returns valid or throws), so the je branch
    // isn't taken in practice; disasm still emits it as a guard. Mirror.
    // Fresh === old: release the just-constructed duplicate and use old.
    // @0x1e3a02-@0x1e3a08 child->vtable[0x18](fresh).
    child_vslot0x18_release(fresh);
    // @0x1e3a0b movq 0x1a0(%rbx),%r12 — reload current from self->child_at_0x1a0.
    const reloaded = self.child_at_0x1a0;
    if (reloaded === null) {
      throw new Error(
        "HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a0b unreachable: self.child_at_0x1a0 was === fresh (non-null) but reloaded null — violates single-threaded invariant.",
      );
    }
    current = reloaded;
  } else {
    // @0x1e39e2 testq %r12,%r12 ; je _install_new
    if (oldChild !== null) {
      // @0x1e39e7-@0x1e39ee child->vtable[0x18](oldChild) — release old.
      child_vslot0x18_release(oldChild);
    }
    // @0x1e39f1 self->child_at_0x1a0 = fresh.
    self.child_at_0x1a0 = fresh;
    // @0x1e39f8 %r12 = fresh.
    current = fresh;
  }

  // @0x1e3a12-@0x1e3a2b: input0 wiring.
  // @0x1e3a18 xorl %edx,%edx ; @0x1e3a1a callq GetInput(this, 0)
  const input0 = HGRenderer_GetInput(renderer, self, 0);
  // @0x1e3a2b child->vtable[0x78](child, 0, input0)
  child_vslot0x78_setInput(current, 0, input0);

  // @0x1e3a35-@0x1e3a53: input1 wiring.
  // @0x1e3a2e movq 0x1a0(%rbx),%r15 — the disasm reloads the child ptr
  // here (r15 = self->child), then uses r15 as the receiver for slot
  // 0x78. In practice r15 === current after the install path (the
  // release+SetInput above cannot change self->child_at_0x1a0), but
  // faithfully reload to match the disasm.
  const currentReload1 = self.child_at_0x1a0;
  if (currentReload1 === null) {
    throw new Error(
      "HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a2e unreachable: self.child_at_0x1a0 became null between input0 and input1 — violates single-threaded invariant.",
    );
  }
  // @0x1e3a3b movl $0x1,%edx ; @0x1e3a40 callq GetInput(this, 1)
  const input1 = HGRenderer_GetInput(renderer, self, 1);
  // @0x1e3a53 child->vtable[0x78](child, 1, input1)
  child_vslot0x78_setInput(currentReload1, 1, input1);

  // @0x1e3a56-@0x1e3a73: parameter wiring.
  // @0x1e3a56 movq 0x1a0(%rbx),%rdi — reload child ptr again.
  const currentReload2 = self.child_at_0x1a0;
  if (currentReload2 === null) {
    throw new Error(
      "HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a56 unreachable: self.child_at_0x1a0 became null before SetParameter — violates single-threaded invariant.",
    );
  }
  // @0x1e3a5d movss 0x198(%rbx),%xmm0 — load phase as f32.
  const phase = Math.fround(self.phase_at_0x198);
  // @0x1e3a68-@0x1e3a71 y=z=w=0, index=0.
  // @0x1e3a73 child->vtable[0x60](child, 0, phase, 0, 0, 0)
  child_vslot0x60_setParameter(currentReload2, 0, phase, 0.0, 0.0, 0.0);

  // @0x1e3a76 movq 0x1a0(%rbx),%rax — return self->child (final reload;
  // disasm does this after the SetParameter call to pick up any pointer
  // change SetParameter might have caused — again in practice a no-op,
  // but faithful).
  const finalChild = self.child_at_0x1a0;
  if (finalChild === null) {
    throw new Error(
      "HGRetimeWithFrameBlend::GetOutput @Helium 0x1e3a76 unreachable: self.child_at_0x1a0 became null at return — violates single-threaded invariant.",
    );
  }
  return finalChild;
}
