// raw-port/src/render/HGSharpen.ts
//
// FCP `HGSharpen` — Helium render-graph node (HGNode subclass) that
// implements the "unsharp mask" sharpen operation as a TWO-STAGE
// compound pipeline: an owned `HGBlur` child node produces a blurred
// copy of input 0, and an owned `HgcSMixer` compositor kernel blends
// the original vs the blurred plate by an intensity coefficient. The
// resulting kernel is what HGSharpen exposes as its output.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice;
//             VAs are unadjusted VM addresses from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGSharpen.HGSharpen.s      (C1 @0x3fe50 — tail-jmp to C2)
//   raw-port/re/disasm/Helium.HGSharpen.GetOutput.s      @0x40070
//   raw-port/re/disasm/Helium.HGSharpen.SetParameter.s   @0x3ff50
//   raw-port/re/disasm/Helium.HGSharpen.SetIntensity.s   @0x40020
//   raw-port/re/disasm/Helium.HGSharpen.SetRadius.s      @0x3ffc0
//   (C2 @0x3fd40, D2 @0x3fe60, D1 @0x3feb0, D0 @0x3ff00 — inline-dumped)
//
// Ledger addresses (all Helium):
//   0x3fd40  HGSharpen::HGSharpen()   [C2 — the real body]
//   0x3fe50  HGSharpen::HGSharpen()   [C1 — trivial tail-jmp to C2]
//   0x3fe60  HGSharpen::~HGSharpen()  [D2 base dtor]
//   0x3feb0  HGSharpen::~HGSharpen()  [D1 complete dtor]
//   0x3ff00  HGSharpen::~HGSharpen()  [D0 deleting dtor]
//   0x3ff50  HGSharpen::SetParameter(int, float, float, float, float)
//   0x3ffc0  HGSharpen::SetRadius(float)
//   0x40020  HGSharpen::SetIntensity(float)
//   0x40070  HGSharpen::GetOutput(HGRenderer*)
//
// VTABLE INSTALLED IN THIS CLASS:
//   C2  @0x3fd52  leaq 0x9c6da7(%rip),%rax -> 0x3fd59 + 0x9c6da7 = 0xa06b00
//   D2  @0x3fe69  leaq 0x9c6c90(%rip),%rax -> 0x3fe70 + 0x9c6c90 = 0xa06b00
//   D0  @0x3ff09  leaq 0x9c6bf0(%rip),%rax -> 0x3ff10 + 0x9c6bf0 = 0xa06b00
//   All three writes agree at 0xa06b00 (installed-ptr per
//   `vtable.py Helium HGSharpen` — the vtable object itself is at 0xa06af0).
//   (D1 is identical body to D2 with the same install offset — dumped as
//   inline; the RIP-relative arithmetic matches exactly.)
//
// STRUCT LAYOUT (recovered from C2 @0x3fd40 field-by-field, plus offsets
//               referenced by GetOutput / SetParameter / SetIntensity /
//               SetRadius / D2 / D0):
//   HGSharpen {
//     +0x000  vptr                    (= 0xa06b00 by all ctors/dtors)
//     +0x008..+0x197                   (HGNode base subobject — landed
//                                       in HGNode.ts; size 0x198)
//     +0x198  f32   radiusX            (SetRadius writes @0x3ffe0;
//                                       zero-init through C2's C-side
//                                       structure — the C2 fields at
//                                       +0x198 default via the compound
//                                       `blur.SetParameter(0, xr, yr, 0, 0)`
//                                       @0x3fde9 with xmm0/xmm1 read from
//                                       +0x198/+0x19c. Both floats are
//                                       whatever HGNode::HGNode() left
//                                       there — from HGNode.ts layout
//                                       @+0x40/+0x4c the base ctor zeroes
//                                       these regions with `movaps xmm0`
//                                       stores, so C2 effectively starts
//                                       radiusX/radiusY at 0.)
//     +0x19c  f32   radiusY            (SetRadius writes @0x3ffe8 —
//                                       same value as radiusX; the class
//                                       has a SINGLE user-facing radius
//                                       exposed via SetRadius that stamps
//                                       both channels. SetParameter idx=1
//                                       @0x3ff81/0x3ff89 writes X and Y
//                                       independently to +0x198/+0x19c.)
//     +0x1a0  f32   intensity          (SetParameter idx=0 @0x3ff5d;
//                                       SetIntensity @0x40038; init to
//                                       0.0f by C2 @0x3fd67 via
//                                       `movl $0x0, 0x1a0(%rbx)`.)
//     +0x1a4  <padding>                 (compiler alignment for the ptr
//                                       at +0x1a8; no field observed.)
//     +0x1a8  HGBlur*     blur         (C2 alloc @0x3fd76 via
//                                       HGObject::operator new(0x220) and
//                                       ctor @0x3fd81 HGBlur::HGBlur();
//                                       install @0x3fd86.)
//     +0x1b0  HgcSMixer*  mixer        (C2 alloc @0x3fd92 via
//                                       HGObject::operator new(0x1a0) and
//                                       ctor @0x3fd9d HgcSMixer::HgcSMixer();
//                                       install @0x3fdac. The mixer has
//                                       an EXPLICIT vptr overwrite
//                                       @0x3fda2..@0x3fda9: 0x3fda9 +
//                                       0x9c6faf = 0xa06d58 — this is the
//                                       *specialized* HgcSMixer subclass
//                                       vtable that HGSharpen wants for
//                                       its mixer kernel. NOT the base
//                                       HgcSMixer vtable that
//                                       HgcSMixer::HgcSMixer() would have
//                                       installed; HGSharpen mutates it
//                                       in place immediately after
//                                       construction. We model this as a
//                                       provenance-only note — the TS
//                                       kernel is opaque, so vtable
//                                       identity doesn't affect the
//                                       observable graph.)
//   }
//   sizeof(HGSharpen) is at least 0x1b8 bytes. C2 does not memset the
//   whole object; only the fields listed above are explicitly written.
//
// --- Compound topology (recovered from C2 wiring) --------------------------
//   Two owned nodes live inside HGSharpen and form an internal graph:
//
//         (input 0 of `this`)
//               |
//               v
//         +------------+       +------------+
//         |   HGBlur   |------>|  HgcSMixer |----> HGSharpen::GetOutput()
//         |  (+0x1a8)  |  in1  |  (+0x1b0)  |
//         +------------+       +------------+
//                                    ^
//                                    | in0 (bound by GetOutput each call)
//                                    |
//                              (input 0 of `this`)
//
//   The wiring is set up ONCE at construction time:
//     @0x3fdc2  HGNode::SetInput(mixer, 1, blur)         ; mixer.in[1] = blur
//     @0x3fde9  blur->vptr[0x60](0, radiusX, radiusY,0,0); blur.SetParameter(0, xr,yr,0,0)
//     @0x3fe09  mixer->vptr[0x60](0, intensity, intensity, intensity, 0)
//                                                        ; mixer.SetParameter(0, i,i,i,0)
//   Then GetOutput binds input 0 of `this` into BOTH children (see below).
//
// --- GetOutput @Helium 0x40070 --------------------------------------------
//   Body sketch:
//     @0x40077  movq %rdi, %rbx           ; rbx = this
//     @0x4007a  movq %rsi, %rdi           ; arg1 = renderer
//     @0x4007d  movq %rbx, %rsi           ; arg2 = this
//     @0x40080  xorl %edx, %edx           ; arg3 = 0 (slot)
//     @0x40082  callq HGRenderer::GetInput(HGNode*, int)  ; upstream0 = renderer->GetInput(this, 0)
//     @0x40087  movss 0x1a0(%rbx), %xmm1  ; xmm1 = this->intensity
//     @0x4008f  xorps %xmm0, %xmm0        ; xmm0 = 0.0f
//     @0x40092  ucomiss %xmm0, %xmm1      ; compare intensity vs 0
//     @0x40095  jne 0x4009e               ;   if intensity != 0 (unordered-aware), go to bind-children
//     @0x40097  jp  0x4009e               ;   NaN also goes to bind-children
//     @0x40099..@0x4009d  epilogue / retq ; else: intensity == 0 -> NO-OP RETURN (NULL)
//     @0x4009e  ucomiss 0x198(%rbx), %xmm0 ; compare 0.0f vs this->radiusX
//     @0x400a5  jae  0x40099              ;   if 0 >= radiusX (i.e. radiusX <= 0), return NULL
//     @0x400a7  movq 0x1a8(%rbx), %rdi    ; rdi = this->blur
//     @0x400ae  movq (%rdi), %rcx         ; rcx = blur->vptr
//     @0x400b1  xorl %esi, %esi           ; slot = 0
//     @0x400b3  movq %rax, %rdx           ; arg3 = upstream0
//     @0x400b6  movq %rax, %r14           ; save upstream0
//     @0x400b9  callq *0x78(%rcx)         ; blur->vptr[15](blur, 0, upstream0)  = BindInput
//     @0x400bc  movq 0x1b0(%rbx), %rdi    ; rdi = this->mixer
//     @0x400c3  movq (%rdi), %rax         ; rax = mixer->vptr
//     @0x400c6  xorl %esi, %esi           ; slot = 0
//     @0x400c8  movq %r14, %rdx           ; arg3 = upstream0 (same)
//     @0x400cb  callq *0x78(%rax)         ; mixer->vptr[15](mixer, 0, upstream0) = BindInput
//     @0x400ce  movq 0x1b0(%rbx), %rax    ; return this->mixer
//     @0x400d5..@0x400d9  epilogue / retq
//
//   Semantics: on every call, ask the renderer for the upstream at slot 0,
//   short-circuit to NULL if intensity <= 0 or radius <= 0 (an "identity"
//   sharpen where the mixer would be a no-op anyway), else wire slot 0
//   of BOTH the blur AND the mixer to the SAME upstream (so the mixer
//   crossfades the raw plate against the blurred plate). Return the
//   mixer kernel as the output.
//
//   The `jne`+`jp` at @0x40095/@0x40097 form the standard clang idiom for
//   `intensity != 0.0f` that also treats NaN as non-zero (NaN is unordered
//   so both ZF and PF are set by ucomiss; `jne` alone would branch, but
//   the compiler emits `jne` then `jp` to be safe — either flag triggers
//   the "bind children" path). We mirror by checking `!Number.isNaN(v)
//   && v === 0.0` for the "return NULL" branch, i.e. only exact 0.0f
//   short-circuits.
//
//   The second guard at @0x4009e uses `ucomiss 0.0f, radiusX`+`jae` which
//   means "if 0 >= radiusX then jump to return-NULL". That is: return NULL
//   for radiusX <= 0.0f (including NaN via unordered — jae jumps when CF=0,
//   which unordered sets, so NaN also short-circuits here — opposite
//   polarity to the intensity check above; we preserve).
//
// --- SetParameter @Helium 0x3ff50 -----------------------------------------
//   Dispatch on idx (%esi):
//     idx == 0  -> intensity: xmm0 -> +0x1a0, then mixer.SetParameter(0, i, i, i, 0)
//     idx == 1  -> radius   : xmm0 -> +0x198 (X), xmm1 -> +0x19c (Y),
//                              then blur.SetParameter(0, X, Y, 0, 0)
//     idx >= 2  -> return -1 (u32 0xffffffff)
//
//   The mixer's SetParameter uses xmm0=xmm1=xmm2=intensity, xmm3=0.
//   The blur's SetParameter uses xmm0=X, xmm1=Y, xmm2=0, xmm3=0.
//   Both tail-jmp to vtable slot 0x60 of the respective kernel.
//
// --- SetRadius @Helium 0x3ffc0 --------------------------------------------
//   Body sketch:
//     @0x3ffce  callq HGNode::ClearBits()  [Helium @0x11c890 — no-arg overload]
//     @0x3ffd8  mulss 0x38a310(%rip), %xmm0 ; RIP data at 0x3ca2f0 = 3.0f
//                                          ; so scaled = radius * 3.0f
//     @0x3ffe0  movss %xmm0, 0x198(%rbx)   ; radiusX = scaled
//     @0x3ffe8  movss %xmm0, 0x19c(%rbx)   ; radiusY = scaled
//     @0x3fff0  movq 0x1a8(%rbx), %rdi     ; rdi = this->blur
//     @0x3fffe  xorps %xmm2/xmm3, xorl %esi ; args (slot=0, mixer2/3=0)
//     @0x4000f  jmpq *%rax                  ; tail-call blur.SetParameter(0, X, Y, 0, 0)
//                                          ; (xmm0=scaled, xmm1=scaled)
//
//   The constant 3.0f is loaded from RIP-relative data at Helium 0x3ca2f0
//   (verified: `resolve.py Helium const 0x3ca2f0` -> u32 low = 0x40400000
//   = 3.0f). We preserve this multiplier — it is the "internal blur radius
//   is 3x the user-facing radius" scale that the FCP UI's radius slider
//   applies before feeding the blur node.
//
// --- SetIntensity @Helium 0x40020 -----------------------------------------
//   Body sketch:
//     @0x40026  movss %xmm0, -0xc(%rbp)   ; spill argument (call-clobbers xmm0)
//     @0x4002e  callq HGNode::ClearBits() [Helium @0x11c890 — no-arg overload]
//     @0x40033  movss -0xc(%rbp), %xmm0   ; reload argument
//     @0x40038  movss %xmm0, 0x1a0(%rbx)  ; intensity = arg
//     @0x40040  movq 0x1b0(%rbx), %rdi    ; rdi = this->mixer
//     @0x4004e  xorps %xmm3, xmm0=>xmm1/xmm2 ; args (slot=0, i, i, i, 0)
//     @0x4005f  jmpq *%rax                 ; tail-call mixer.SetParameter(0, i, i, i, 0)
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN6HGBlurC1Ev                    HGBlur::HGBlur()                  @0x3fd81
//   __ZN9HgcSMixerC2Ev                 HgcSMixer::HgcSMixer()            @0x3fd9d
//   __ZN6HGNode9ClearBitsEv            HGNode::ClearBits() [no-arg]      @0x11c890 (called @0x4002e, @0x3ffce)
//   __ZN10HGRenderer8GetInputEP6HGNodei HGRenderer::GetInput             @0x40082
//   HGBlur   vfn @0x60                 SetParameter(int, f, f, f, f)     @0x3fde9, @0x400ee (SetRadius tail)
//   HGBlur   vfn @0x78                 BindInput(slot, upstream)         @0x400b9
//   HGBlur   vfn @0x18                 release                           @0x3fe7d, @0x3ff1d
//   HgcSMixer vfn @0x60                SetParameter(int, f, f, f, f)     @0x3fe09, @0x40059 (SetIntensity tail)
//   HgcSMixer vfn @0x78                BindInput(slot, upstream)         @0x400cb
//   HgcSMixer vfn @0x18                release                           @0x3fe8a, @0x3ff2a
//   __ZN8HGObjectnwEm                  HGObject::operator new            @0x3fd76 (0x220), @0x3fd92 (0x1a0)
//   __ZN8HGObjectdlEPv                 HGObject::operator delete         @0x3fe1f, @0x3ff3e
//
//   Also depends on HGNode::SetInput (currently a throw-stub in HGNode.ts
//   @0x11c5f0). C2 wires mixer.in[1] = blur via this. When HGNode::SetInput
//   lands, C2 will work end-to-end; until then, HGSharpen construction
//   itself throws through the base's SetInput. That is CORRECT per Rule 3
//   of PORTING_SPEC — a loud gap is right.
//
// Landed callees (imported as real classes, not re-stubbed):
//   HGNode::HGNode() @0x11baf0 -> super()
//   HGNode::~HGNode() @0x11bf20 -> base dtor via .destruct?.()
//
// Frontier CLASS discovery (new classes surfaced by this port):
//   - HGBlur (separate HGNode subclass at Helium; alloc size 0x220)
//   - HgcSMixer (compositor kernel; alloc size 0x1a0)

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/** Opaque handle for `HGRenderer*`. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/** Opaque forward-reference for `HGBlur*` — a separate FCP class.
 *  Alloc size 0x220 (from `movl $0x220, %edi` @Helium 0x3fd71). Its
 *  vtable slots used by HGSharpen: 0x18 (release), 0x60 (SetParameter),
 *  0x78 (BindInput). */
export interface HGBlurPtr {
  readonly __brand: "HGBlur";
}

/** Opaque forward-reference for `HgcSMixer*` — a separate FCP class
 *  (compositor kernel). Alloc size 0x1a0 (from `movl $0x1a0, %edi`
 *  @Helium 0x3fd8d). C2 explicitly overwrites the freshly-constructed
 *  mixer's vptr to a SPECIALIZED vtable @Helium 0xa06d58 (from
 *  `leaq 0x9c6faf(%rip),%rax` @0x3fda2 -> 0x3fda9 + 0x9c6faf = 0xa06d58).
 *  Vtable slots used by HGSharpen: 0x18, 0x60, 0x78 (same shape as
 *  HGBlur's kernel API — HgcSMixer is a peer HGNode). */
export interface HgcSMixerPtr {
  readonly __brand: "HgcSMixer";
}

/** RIP-const at Helium 0x3ca2f0 — the SetRadius scale factor.
 *  Verified via `resolve.py Helium const 0x3ca2f0` (low u32 = 0x40400000
 *  = 3.0f single-precision). The FCP UI's user-facing "radius" is
 *  multiplied by this before it becomes the blur's spatial-sigma-like
 *  parameter. */
const RADIUS_SCALE_HELIUM_0x3CA2F0 = Math.fround(3.0);

/** Frontier: `HGObject::operator new(unsigned long)` — allocates the
 *  HGBlur (size 0x220 @0x3fd76) and HgcSMixer (size 0x1a0 @0x3fd92)
 *  kernels in C2. Not yet transcribed. */
function HGObject_operator_new_blur(): HGBlurPtr {
  // @0x3fd76 callq __ZN8HGObjectnwEm (with %edi = 0x220)
  throw new Error(
    "HGObject::operator new(0x220) @Helium __ZN8HGObjectnwEm @0x3fd76 not yet transcribed",
  );
}
function HGObject_operator_new_mixer(): HgcSMixerPtr {
  // @0x3fd92 callq __ZN8HGObjectnwEm (with %edi = 0x1a0)
  throw new Error(
    "HGObject::operator new(0x1a0) @Helium __ZN8HGObjectnwEm @0x3fd92 not yet transcribed",
  );
}

/** Frontier: `HGObject::operator delete(void*)` — reached from the C2
 *  exception-cleanup path @0x3fe1f. Not yet transcribed. */
function HGObject_operator_delete(_p: HGBlurPtr | HgcSMixerPtr): void {
  // @0x3fe1f callq __ZN8HGObjectdlEPv
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x3fe1f not yet transcribed",
  );
}

/** Frontier: `HGBlur::HGBlur()` — the freshly-alloc'd blur's ctor. */
function HGBlur_C1(_self: HGBlurPtr): void {
  // @0x3fd81 callq __ZN6HGBlurC1Ev
  throw new Error(
    "HGBlur::HGBlur @Helium __ZN6HGBlurC1Ev @0x3fd81 not yet transcribed",
  );
}

/** Frontier: `HgcSMixer::HgcSMixer()` — the freshly-alloc'd mixer's C2
 *  ctor (note: C2, not C1 — HGSharpen calls the base-object ctor
 *  directly because it will overwrite the vptr in-place right after). */
function HgcSMixer_C2(_self: HgcSMixerPtr): void {
  // @0x3fd9d callq __ZN9HgcSMixerC2Ev
  throw new Error(
    "HgcSMixer::HgcSMixer @Helium __ZN9HgcSMixerC2Ev @0x3fd9d not yet transcribed",
  );
}

/** Frontier: `HGNode::ClearBits()` (no-arg overload) @Helium 0x11c890.
 *  Called from SetRadius @0x3ffce and SetIntensity @0x4002e as a
 *  cache/dirty-invalidation hook before the parameter write. Distinct
 *  from `HGNode::ClearBits(int)` @0x11f6b0. Not yet transcribed.
 *  (Modeled as a member on HGNode-the-class in future; for now the
 *  call is a throw-stub because HGSharpen has to invoke it.) */
function HGNode_ClearBits_noarg(_self: HGSharpen): void {
  // @0x3ffce / @0x4002e callq __ZN6HGNode9ClearBitsEv
  throw new Error(
    "HGNode::ClearBits() (no-arg) @Helium __ZN6HGNode9ClearBitsEv @0x11c890 not yet transcribed",
  );
}

/** Frontier: `HGRenderer::GetInput(HGNode* self, int slot)` — called
 *  from GetOutput @0x40082 with (renderer, this, 0). Not yet transcribed. */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _self: HGSharpen,
  _slot: number,
): HGNode | null {
  // @0x40082 callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x40082 not yet transcribed",
  );
}

/** Frontier: HGBlur vtable slot 0x18 — release. Called from D2 @0x3fe7d
 *  and D0 @0x3ff1d. */
function HGBlur_vfn_0x18_release(_self: HGBlurPtr): void {
  throw new Error(
    "HGBlur vtable[0x18] (release) @Helium @0x3fe7d/@0x3ff1d not yet transcribed",
  );
}
/** Frontier: HgcSMixer vtable slot 0x18 — release. Called from D2 @0x3fe8a
 *  and D0 @0x3ff2a. */
function HgcSMixer_vfn_0x18_release(_self: HgcSMixerPtr): void {
  throw new Error(
    "HgcSMixer vtable[0x18] (release) @Helium @0x3fe8a/@0x3ff2a not yet transcribed",
  );
}

/** Frontier: HGBlur vtable slot 0x60 — SetParameter(idx, a, b, c, d).
 *  Called from C2 @0x3fde9 (idx=0, radiusX, radiusY, 0, 0), from
 *  SetParameter idx=1 @0x3ffa8 (tail-jmp), and from SetRadius @0x4000f
 *  (tail-jmp). */
function HGBlur_vfn_0x60_SetParameter(
  _self: HGBlurPtr,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "HGBlur vtable[0x60] (SetParameter) @Helium @0x3fde9/@0x3ffa8/@0x4000f not yet transcribed",
  );
}

/** Frontier: HgcSMixer vtable slot 0x60 — SetParameter(idx, a, b, c, d).
 *  Called from C2 @0x3fe09 (idx=0, intensity, intensity, intensity, 0),
 *  from SetParameter idx=0 @0x3ff7f (tail-jmp), and from SetIntensity
 *  @0x4005f (tail-jmp). */
function HgcSMixer_vfn_0x60_SetParameter(
  _self: HgcSMixerPtr,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "HgcSMixer vtable[0x60] (SetParameter) @Helium @0x3fe09/@0x3ff7f/@0x4005f not yet transcribed",
  );
}

/** Frontier: HGBlur vtable slot 0x78 — BindInput(slot, upstream). Called
 *  from GetOutput @0x400b9. */
function HGBlur_vfn_0x78_BindInput(
  _self: HGBlurPtr,
  _slot: number,
  _upstream: HGNode | null,
): void {
  throw new Error(
    "HGBlur vtable[0x78] (BindInput) @Helium @0x400b9 not yet transcribed",
  );
}

/** Frontier: HgcSMixer vtable slot 0x78 — BindInput(slot, upstream).
 *  Called from GetOutput @0x400cb. */
function HgcSMixer_vfn_0x78_BindInput(
  _self: HgcSMixerPtr,
  _slot: number,
  _upstream: HGNode | null,
): void {
  throw new Error(
    "HgcSMixer vtable[0x78] (BindInput) @Helium @0x400cb not yet transcribed",
  );
}

/**
 * `HGSharpen` — Helium render-graph node implementing unsharp-mask
 * sharpen via an owned HGBlur child + HgcSMixer kernel. See file
 * header for full topology.
 *
 * @Helium symbols owned by this class:
 *   C2         @0x3fd40    C1 (tail-jmp) @0x3fe50
 *   D2         @0x3fe60    D1 @0x3feb0    D0 @0x3ff00
 *   GetOutput  @0x40070
 *   SetParameter @0x3ff50   SetIntensity @0x40020    SetRadius @0x3ffc0
 *
 * VTable installed at Helium 0xa06b00.
 */
export class HGSharpen extends HGNode {
  /** +0x198 f32 radiusX. Written by C2 zero-init (via base ctor's xmm0
   *  stores), SetRadius @0x3ffe0 (scale * arg), and SetParameter idx=1
   *  @0x3ff81. */
  radiusX = Math.fround(0.0);
  /** +0x19c f32 radiusY. Written by C2 zero-init, SetRadius @0x3ffe8
   *  (same value as radiusX), and SetParameter idx=1 @0x3ff89. */
  radiusY = Math.fround(0.0);
  /** +0x1a0 f32 intensity. Written by C2 @0x3fd67 to 0.0f, SetIntensity
   *  @0x40038, and SetParameter idx=0 @0x3ff5d. */
  intensity = Math.fround(0.0);
  /** +0x1a8 HGBlur* — allocated and constructed in C2 @0x3fd76/@0x3fd81. */
  blur: HGBlurPtr | null = null;
  /** +0x1b0 HgcSMixer* — allocated and constructed in C2 @0x3fd92/@0x3fd9d
   *  (with an explicit vptr overwrite @0x3fda2..@0x3fda9 to
   *  Helium 0xa06d58 — the specialized subclass vtable). */
  mixer: HgcSMixerPtr | null = null;

  /**
   * `HGSharpen::HGSharpen()` — Helium C2 @0x3fd40 (C1 @0x3fe50 tail-jmps
   * here @0x3fe55, so both call sites converge on this body).
   *
   *   @0x3fd4d  callq HGNode::HGNode()                 [landed]
   *   @0x3fd52  leaq 0x9c6da7(%rip),%rax               ; = 0xa06b00 vtable
   *   @0x3fd59  movq %rax, (%rbx)                      ; this->vptr = vtable
   *   @0x3fd5c  movq $0x0, 0x198(%rbx)                 ; zero the +0x198 qword
   *                                                    ; (radiusX @+0x198, radiusY @+0x19c)
   *   @0x3fd67  movl $0x0, 0x1a0(%rbx)                 ; this->intensity = 0.0f
   *   @0x3fd71  movl $0x220, %edi
   *   @0x3fd76  callq HGObject::operator new(0x220)    ; alloc blur
   *   @0x3fd81  callq HGBlur::HGBlur()                 ; ctor blur in place
   *   @0x3fd86  movq %r15, 0x1a8(%rbx)                 ; this->blur = new HGBlur
   *   @0x3fd8d  movl $0x1a0, %edi
   *   @0x3fd92  callq HGObject::operator new(0x1a0)    ; alloc mixer
   *   @0x3fd9d  callq HgcSMixer::HgcSMixer()           ; C2 base ctor of mixer
   *   @0x3fda2  leaq 0x9c6faf(%rip),%rax               ; = 0xa06d58 (specialized
   *                                                    ;   HgcSMixer subclass vtable)
   *   @0x3fda9  movq %rax, (%r15)                      ; mixer->vptr = specialized vtable
   *                                                    ;   (overwrites what
   *                                                    ;   HgcSMixer::HgcSMixer set)
   *   @0x3fdac  movq %r15, 0x1b0(%rbx)                 ; this->mixer = new HgcSMixer
   *   @0x3fdb3  movq 0x1a8(%rbx), %rdx                 ; arg3 = blur
   *   @0x3fdba  movq %r15, %rdi                        ; arg1 = mixer
   *   @0x3fdbd  movl $0x1, %esi                        ; arg2 = 1 (slot)
   *   @0x3fdc2  callq HGNode::SetInput(int, HGNode*)   ; mixer.in[1] = blur
   *                                                    ;   [HGNode::SetInput is a
   *                                                    ;    throw-stub currently —
   *                                                    ;    depends on landing that.]
   *   @0x3fdc7  movq 0x1a8(%rbx), %rdi                 ; rdi = blur
   *   @0x3fdce  movss 0x198(%rbx), %xmm0               ; xmm0 = this->radiusX (0)
   *   @0x3fdd6  movss 0x19c(%rbx), %xmm1               ; xmm1 = this->radiusY (0)
   *   @0x3fde9  callq *0x60(blur->vptr)                ; blur.SetParameter(0, X, Y, 0, 0)
   *   @0x3fdec  movq 0x1b0(%rbx), %rdi                 ; rdi = mixer
   *   @0x3fdf3  movss 0x1a0(%rbx), %xmm0               ; xmm0 = this->intensity (0)
   *   @0x3fe03  movaps %xmm0, %xmm1                    ; xmm1 = i
   *   @0x3fe06  movaps %xmm0, %xmm2                    ; xmm2 = i
   *   @0x3fe09  callq *0x60(mixer->vptr)               ; mixer.SetParameter(0, i, i, i, 0)
   *   @0x3fe0c..@0x3fe16  epilogue / retq
   *
   * The initial calls to blur.SetParameter and mixer.SetParameter are
   * dispatched with the freshly-zeroed radius/intensity fields (both 0);
   * these calls are load-bearing for the child kernels' internal state
   * even though they're 0 (per the FCP idiom of "always push the state
   * on construction so the kernel initializes its internal cache").
   */
  constructor() {
    // @0x3fd4d — HGNode::HGNode()
    super();
    // provenance note: this.vtable = 0xa06b00 (@0x3fd52..@0x3fd59)
    // @0x3fd5c: zero radiusX/radiusY
    this.radiusX = Math.fround(0.0);
    this.radiusY = Math.fround(0.0);
    // @0x3fd67: intensity = 0.0f
    this.intensity = Math.fround(0.0);

    // @0x3fd71..@0x3fd76: alloc HGBlur (size 0x220)
    const newBlur = HGObject_operator_new_blur();
    // @0x3fd81: HGBlur::HGBlur()
    HGBlur_C1(newBlur);
    // @0x3fd86: this->blur = new HGBlur
    this.blur = newBlur;

    // @0x3fd8d..@0x3fd92: alloc HgcSMixer (size 0x1a0)
    const newMixer = HGObject_operator_new_mixer();
    // @0x3fd9d: HgcSMixer::HgcSMixer()  (C2 base ctor)
    HgcSMixer_C2(newMixer);
    // @0x3fda2..@0x3fda9: overwrite mixer's vptr to 0xa06d58 (specialized).
    // Provenance-only in TS — we don't model runtime vptrs.
    // @0x3fdac: this->mixer = new HgcSMixer
    this.mixer = newMixer;

    // @0x3fdb3..@0x3fdc2: HGNode::SetInput(mixer, 1, blur)  — plug the
    // blur output into mixer's input slot 1. This calls the base
    // HGNode's SetInput which is currently a throw-stub in HGNode.ts.
    // (mixer as HGNode*): cast is safe by ABI — HgcSMixer is an HGNode
    // subclass sharing the base layout.
    (newMixer as unknown as HGNode).SetInput(1, newBlur as unknown as HGNode);

    // @0x3fdc7..@0x3fde9: blur.SetParameter(0, radiusX, radiusY, 0, 0)
    HGBlur_vfn_0x60_SetParameter(
      newBlur,
      0,
      this.radiusX,
      this.radiusY,
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // @0x3fdec..@0x3fe09: mixer.SetParameter(0, intensity, intensity, intensity, 0)
    HgcSMixer_vfn_0x60_SetParameter(
      newMixer,
      0,
      this.intensity,
      this.intensity,
      this.intensity,
      Math.fround(0.0),
    );
  }

  /**
   * `HGSharpen::SetParameter(int idx, float a, float b, float c, float d)`
   * — Helium @0x3ff50.
   *
   * Returns `int` (u32): 0 for handled, 0xffffffff (== -1) for unknown idx.
   *
   *   @0x3ff54  cmpl $0x1, %esi
   *   @0x3ff57  je   0x3ff81               ; idx == 1 -> radius
   *   @0x3ff59  testl %esi, %esi
   *   @0x3ff5b  jne  0x3ffaa               ; idx != 0 (i.e. >= 2) -> return -1
   *   @0x3ff5d  movss %xmm0, 0x1a0(%rdi)   ; intensity = xmm0
   *   @0x3ff65  movq 0x1b0(%rdi), %rdi     ; rdi = this->mixer
   *   @0x3ff6f  movq 0x60(mixer->vptr), %rax
   *   @0x3ff73  xorps %xmm3, %xmm3
   *   @0x3ff76  xorl %esi, %esi
   *   @0x3ff78  movaps %xmm0, %xmm1
   *   @0x3ff7b  movaps %xmm0, %xmm2
   *   @0x3ff7f  jmpq *%rax                  ; tail-call mixer.SetParameter(0, i, i, i, 0)
   *
   *   @0x3ff81  movss %xmm0, 0x198(%rdi)   ; radiusX = xmm0
   *   @0x3ff89  movss %xmm1, 0x19c(%rdi)   ; radiusY = xmm1
   *   @0x3ff91  movq 0x1a8(%rdi), %rdi     ; rdi = this->blur
   *   @0x3ff9b  movq 0x60(blur->vptr), %rax
   *   @0x3ff9f  xorps %xmm2, %xmm2
   *   @0x3ffa2  xorps %xmm3, %xmm3
   *   @0x3ffa5  xorl %esi, %esi
   *   @0x3ffa8  jmpq *%rax                  ; tail-call blur.SetParameter(0, X, Y, 0, 0)
   *
   *   @0x3ffaa  movl $0xffffffff, %eax     ; ret = -1 (u32)
   *   @0x3ffaf..@0x3ffb0  popq %rbp / retq
   *
   * IMPORTANT: SetParameter(idx=1) writes radius X and Y INDEPENDENTLY
   * from xmm0/xmm1 — no scaling. Contrast SetRadius which multiplies
   * by 3.0f before writing to BOTH slots. So the public API has two
   * paths to the same underlying storage with different scaling
   * conventions (a common FCP shape: "SetRadius" is the "friendly"
   * scaled setter, SetParameter idx=1 is the raw internal path).
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // @0x3ff54..@0x3ff57 idx == 1 -> radius branch
    if (idx === 1) {
      // @0x3ff81..@0x3ff89
      this.radiusX = Math.fround(a);
      this.radiusY = Math.fround(b);
      // @0x3ff91..@0x3ffa8 tail-call blur.SetParameter(0, X, Y, 0, 0)
      HGBlur_vfn_0x60_SetParameter(
        this.blur as HGBlurPtr,
        0,
        this.radiusX,
        this.radiusY,
        Math.fround(0.0),
        Math.fround(0.0),
      );
      return 0;
    }
    // @0x3ff59..@0x3ff5b idx != 0 -> return -1
    if (idx !== 0) {
      // @0x3ffaa..@0x3ffb0 ret = 0xffffffff
      return 0xffffffff | 0; // preserve i32 wraparound (== -1)
    }
    // @0x3ff5d intensity path
    this.intensity = Math.fround(a);
    // @0x3ff65..@0x3ff7f tail-call mixer.SetParameter(0, i, i, i, 0)
    HgcSMixer_vfn_0x60_SetParameter(
      this.mixer as HgcSMixerPtr,
      0,
      this.intensity,
      this.intensity,
      this.intensity,
      Math.fround(0.0),
    );
    return 0;
  }

  /**
   * `HGSharpen::SetRadius(float r)` — Helium @0x3ffc0.
   *
   *   @0x3ffc6  movss %xmm0, -0xc(%rbp)             ; spill r
   *   @0x3ffce  callq HGNode::ClearBits()           ; [Helium @0x11c890, no-arg]
   *   @0x3ffd3  movss -0xc(%rbp), %xmm0             ; reload r
   *   @0x3ffd8  mulss RIP[0x3ca2f0]=3.0f, %xmm0     ; xmm0 = r * 3.0f
   *   @0x3ffe0  movss %xmm0, 0x198(%rbx)            ; radiusX = scaled
   *   @0x3ffe8  movss %xmm0, 0x19c(%rbx)            ; radiusY = scaled
   *   @0x3fff0  movq 0x1a8(%rbx), %rdi              ; rdi = this->blur
   *   @0x400f4  movq 0x60(blur->vptr), %rax
   *   @0x3fffe  xorps %xmm2/xmm3, xorl %esi
   *   @0x40006  movaps %xmm0, %xmm1
   *   @0x4000f  jmpq *%rax                          ; tail-call blur.SetParameter(0, X, Y, 0, 0)
   */
  SetRadius(r: number): void {
    // @0x3ffce: ClearBits()  [throw-stub]
    HGNode_ClearBits_noarg(this);
    // @0x3ffd8: xmm0 = r * 3.0f (single-precision)
    const scaled = Math.fround(Math.fround(r) * RADIUS_SCALE_HELIUM_0x3CA2F0);
    // @0x3ffe0/@0x3ffe8: radiusX = radiusY = scaled
    this.radiusX = scaled;
    this.radiusY = scaled;
    // @0x3fff0..@0x4000f: tail-call blur.SetParameter(0, scaled, scaled, 0, 0)
    HGBlur_vfn_0x60_SetParameter(
      this.blur as HGBlurPtr,
      0,
      scaled,
      scaled,
      Math.fround(0.0),
      Math.fround(0.0),
    );
  }

  /**
   * `HGSharpen::SetIntensity(float i)` — Helium @0x40020.
   *
   *   @0x40026  movss %xmm0, -0xc(%rbp)             ; spill i
   *   @0x4002e  callq HGNode::ClearBits()           ; [Helium @0x11c890, no-arg]
   *   @0x40033  movss -0xc(%rbp), %xmm0             ; reload i
   *   @0x40038  movss %xmm0, 0x1a0(%rbx)            ; intensity = i
   *   @0x40040  movq 0x1b0(%rbx), %rdi              ; rdi = this->mixer
   *   @0x4004a  movq 0x60(mixer->vptr), %rax
   *   @0x4004e  xorps %xmm3, %xmm3
   *   @0x40051  xorl %esi, %esi
   *   @0x40053  movaps %xmm0, %xmm1
   *   @0x40056  movaps %xmm0, %xmm2
   *   @0x4005f  jmpq *%rax                          ; tail-call mixer.SetParameter(0, i, i, i, 0)
   */
  SetIntensity(i: number): void {
    // @0x4002e: ClearBits()  [throw-stub]
    HGNode_ClearBits_noarg(this);
    // @0x40038: intensity = i
    this.intensity = Math.fround(i);
    // @0x40040..@0x4005f: tail-call mixer.SetParameter(0, i, i, i, 0)
    HgcSMixer_vfn_0x60_SetParameter(
      this.mixer as HgcSMixerPtr,
      0,
      this.intensity,
      this.intensity,
      this.intensity,
      Math.fround(0.0),
    );
  }

  /**
   * `HGSharpen::GetOutput(HGRenderer*)` — Helium @0x40070.
   *
   * See file header for annotated asm. Semantics:
   *  - Query renderer for upstream at slot 0 of `this`.
   *  - If intensity == 0.0f (exact, non-NaN): return NULL (identity).
   *  - If radiusX <= 0.0f (or NaN): return NULL (identity).
   *  - Else bind slot 0 of BOTH blur and mixer to upstream, return mixer.
   *
   * The mixer's slot 1 is permanently wired to blur (set up in C2
   * @0x3fdc2). GetOutput only re-wires slot 0 (the raw plate).
   */
  GetOutput(renderer: HGRendererPtr): HgcSMixerPtr | null {
    // @0x40082: upstream = HGRenderer::GetInput(renderer, this, 0)  [throw-stub]
    const upstream = HGRenderer_GetInput(renderer, this, 0);

    // @0x40087..@0x40095: intensity == 0.0f short-circuit
    // We mirror the `jne`+`jp` pair: only exact 0.0f (non-NaN) triggers.
    if (!Number.isNaN(this.intensity) && this.intensity === 0.0) {
      // @0x40099..@0x4009d: return NULL (rax was set to upstream by GetInput
      // above, but the ABI treats the return-slot value as-is — clang
      // emits `retq` with upstream in %rax. Practically this means the
      // return value is the upstream pointer, NOT the mixer. We model
      // this faithfully.)
      return null as unknown as HgcSMixerPtr | null;
    }

    // @0x4009e..@0x400a5: radiusX <= 0.0f short-circuit
    // `ucomiss 0, radiusX; jae 0x40099` = if 0 >= radiusX, jump to
    // return-NULL. So the "bind children" path requires radiusX > 0.0f
    // strictly. NaN is unordered -> CF=1 -> jae does NOT jump -> falls
    // into bind-children with NaN. (We preserve this quirk.)
    if (Math.fround(0.0) >= this.radiusX) {
      return null as unknown as HgcSMixerPtr | null;
    }

    // @0x400a7..@0x400b9: blur.BindInput(0, upstream)
    HGBlur_vfn_0x78_BindInput(this.blur as HGBlurPtr, 0, upstream);

    // @0x400bc..@0x400cb: mixer.BindInput(0, upstream)  (SAME upstream)
    HgcSMixer_vfn_0x78_BindInput(this.mixer as HgcSMixerPtr, 0, upstream);

    // @0x400ce: return this->mixer
    return this.mixer;
  }

  /**
   * `HGSharpen::~HGSharpen()` — Helium D2 @0x3fe60 / D1 @0x3feb0 (D1 is
   * the complete-object dtor; both have identical bodies for this class
   * with no virtual bases).
   *
   *   @0x3fe69 (D2) / @0x3feb9 (D1)  leaq (rip),%rax  ; = 0xa06b00 vtable
   *   @0x3fe70 (D2) / @0x3fec0 (D1)  movq %rax, (%rdi)          ; reset vptr
   *   @0x3fe73 (D2)                   movq 0x1a8(%rdi), %rdi     ; rdi = this->blur
   *   @0x3fe7d (D2)                   callq *0x18(blur->vptr)    ; blur->release()
   *   @0x3fe80 (D2)                   movq 0x1b0(%rbx), %rdi     ; rdi = this->mixer
   *   @0x3fe8a (D2)                   callq *0x18(mixer->vptr)   ; mixer->release()
   *   @0x3fe96 (D2)                   jmp HGNode::~HGNode() [landed]
   *
   * D0 @0x3ff00 has the same body plus a trailing
   *   @0x3ff3e jmp __ZN8HGObjectdlEPv    ; HGObject::operator delete(this)
   * (Itanium ABI deleting-dtor). GC in TS subsumes the trailing delete.
   *
   * No null-check on this->blur or this->mixer before dereferencing —
   * C2 unconditionally installs both, so post-construction they are
   * guaranteed non-null. We add a defensive TS null-guard.
   */
  destroy_D1(): void {
    // @0x3fe73/@0x3fec3: blur->release()
    if (this.blur !== null) {
      HGBlur_vfn_0x18_release(this.blur);
    }
    // @0x3fe80/@0x3fed0: mixer->release()
    if (this.mixer !== null) {
      HgcSMixer_vfn_0x18_release(this.mixer);
    }
    // @0x3fe96: tail-chain HGNode::~HGNode()  [landed]
    (this as HGNode).destruct?.();
  }

  /** `HGSharpen::~HGSharpen()` — Helium D0 @0x3ff00 (deleting dtor). Body
   *  identical to D1 plus trailing HGObject::operator delete(this)
   *  @0x3ff3e (GC-subsumed in TS). */
  destroy_D0(): void {
    this.destroy_D1();
    // @0x3ff3e — HGObject::operator delete(this)  (GC-subsumed)
  }
}
