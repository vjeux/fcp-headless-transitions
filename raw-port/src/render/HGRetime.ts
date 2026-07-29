// raw-port/src/render/HGRetime.ts
//
// HGRetime — Helium (render). Outward-facing HGNode subclass for the FCP
// "retime" transition kernel. In GetOutput it lazily allocates ONE of two
// internal implementation kernels — `HgcRetimeFullRez` (VariableRez==0
// branch) or `HgcRetimeVariableRez` (VariableRez==1 branch) — depending on
// self->useVariableRez (field +0x1a4). It then pushes its cached parameter
// state into that kernel through slots on the kernel's vtable and finally
// wires up three inputs from the HGRenderer.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassemblies (all in raw-port/re/disasm/):
//   Helium.HGRetime.HGRetime.s      C1 @0x193de0 (C2 @0x193d80 is the base-only alias body)
//   Helium.HGRetime.~HGRetime.s     D0 @0x193ec0 (D1 @0x193e80, D2 @0x193e40 — same body, decoded via capstone)
//   Helium.HGRetime.SetParameter.s  @0x193f10
//   Helium.HGRetime.GetOutput.s     @0x194020
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from ctor + SetParameter + GetOutput accesses)
// -----------------------------------------------------------------------------
//   struct HGRetime : HGNode {
//     // +0x000  vtable*  installed @0x193dee/@0x193df5 (leaq 0x88fdeb(%rip),%rax; mov %rax,(%rbx))
//     // +0x198  float32  scale_x                   (param 4 lane 0; +0x19c is lane 1)
//     // +0x19c  float32  scale_y                   (param 4 lane 1)
//     // +0x1a0  float32  phase                     (param 0; clamped to [0..1])
//     // +0x1a4  int32    useVariableRez            (param 3; ctor default = 1 — variable-rez ON)
//     // +0x1a8  int32    reverse_or_flag           (param 2; ctor default = 0)
//     // +0x1ac  float32  neg_x_or_one              (param 1 lane 0; ctor default = 1.0)
//     // +0x1b0  float32  y_or_one                  (param 1 lane 1; ctor default = 1.0)
//     // +0x1b4  ...      (unused by this class at this level)
//     // +0x1b8  Hgc*Retime*Rez*  child_kernel      (lazily created in GetOutput; released in
//     //                                             D0/D1/D2 via child->vtable[+0x18])
//   };
//
//   The ctor's `movsd 0x236290(%rip), %xmm0 ; movsd %xmm0, 0x1ac(%rbx)` reads
//   the QWORD at Helium file offset 0x3ca0b0 = {1.0f, 1.0f} and stores it as
//   two adjacent float32s — hence +0x1ac AND +0x1b0 default to 1.0f.
//
// -----------------------------------------------------------------------------
// External callees cited (all Helium; addresses are call-site VAs in this class):
//   @0x193de9  HGNode::HGNode()                                  (base ctor — frontier)
//   @0x193ee8  HGNode::~HGNode()                                 (D0 base dtor — frontier)
//   @0x193ef6  HGObject::operator delete(void*)                  (D0 tail-jmp — frontier)
//   @0x193e71  HGNode::~HGNode()                                 (D2 tail-jmp to @0x11bf20 — frontier)
//   @0x193eb1  HGNode::~HGNode()                                 (D1 tail-jmp to @0x11bf20 — frontier)
//   @0x193ff1  HGNode::ClearBits()                               (SetParameter cache-invalidate)
//   @0x194068  HGObject::operator new(unsigned long)             (allocates the child kernel, size=0x1b0)
//   @0x194078  __bzero                                           (zeros the freshly allocated child)
//   @0x19409b  HgcRetimeFullRez::HgcRetimeFullRez()              (child ctor — VariableRez==0 branch)
//   @0x194140  HgcRetimeVariableRez::HgcRetimeVariableRez()      (child ctor — VariableRez==1 branch)
//   @0x1940cc  HgcRetimeFullRez::SetParameter(0, phase+..., ...) (SetParameter on child kernel)
//   @0x194171  HgcRetimeVariableRez::SetParameter(0, ...)        (SetParameter on child kernel)
//   @0x1940fe  child->vtable[0x60] (child, 1, ...)               (child SetParameter — undecoded slot)
//   @0x194124  child->vtable[0x60] (child, 2, ...)               (child SetParameter — undecoded slot)
//   @0x19419f  child->vtable[0x60] (child, 1, ...)               (child SetParameter — undecoded slot)
//   @0x1941ce  child->vtable[0x60] (child, 2, ...)               (child SetParameter — undecoded slot)
//   @0x1941fc/@0x19421a/@0x19423b  HGRenderer::GetInput(HGNode*, int)  (fetch inputs 0, 1, 2 — frontier)
//   @0x19420c/@0x19422d/@0x19424e  child->vtable[0x78] (child, i, input)  (child SetInput — undecoded)
//   @0x193ee2/@0x193e65/@0x193ea5  child->vtable[0x18] (child)   (child release — undecoded slot; called from D0/D2/D1)
//
// The child kernel's vtable slot 0x60 is a SetParameter-style hook accepting
// (index, f, f, f, f) matching the FCP-wide HGNode::SetParameter contract.
// Slot 0x78 is a SetInput hook. Slot 0x18 is the HGObject dispose/release
// slot. None of the child's vtable slot targets are decoded at this leaf.
//
// -----------------------------------------------------------------------------
// PARAMETER MODEL (SetParameter @0x193f10)
// -----------------------------------------------------------------------------
// `int SetParameter(int which, float a, float b, float c, float d)` — jump
// table @0x193f1b covers which=0..4. Anything else -> return -1
// (`movl $0xffffffff, %eax ; retq` @0x193fc5).
// On a valid case the function falls through to a shared epilogue @0x193fed
// that calls `HGNode::ClearBits()` on `self` and returns 1.
//
// AT&T-order convention: `ucomiss %A, %B` == Intel `ucomiss B, A`, comparing
// flags(B, A). So `ja` fires when B > A. Cases below cite that explicit
// direction on every branch.
//
//   which=0 @0x193f2b-@0x193f4b:
//     phase = clamp(a, 0.0, 1.0) stored @+0x1a0.
//       @0x193f2b xorps xmm1,xmm1                 ; xmm1 = 0
//       @0x193f2e ucomiss %xmm0,%xmm1             ; flags(xmm1=0, xmm0=a)
//       @0x193f31 ja 0x193f43                     ; 0 > a i.e. a<0 -> store xmm1(=0)
//       @0x193f33 movss 0x233d85(%rip),xmm1       ; xmm1 = 1.0 (from @0x3c7cc0)
//       @0x193f3b ucomiss %xmm1,%xmm0             ; flags(xmm0=a, xmm1=1.0)
//       @0x193f3e ja 0x193f43                     ; a > 1.0 -> store xmm1(=1.0)
//       @0x193f40 movaps %xmm0,%xmm1              ; else xmm1 = a (pass-through)
//       @0x193f43 movss  xmm1,0x1a0(%rdi)
//
//   which=1 @0x193f50-@0x193f82:
//     lane a (+0x1ac):
//       @0x193f50 xorps xmm3,xmm3                 ; xmm3 = 0
//       @0x193f53 movaps xmm0,xmm2                ; xmm2 = a
//       @0x193f56 cmpnless %xmm3,%xmm2            ; xmm2 = (xmm2 !< xmm3, ordered) ? -1 : 0
//                                                 ; = (a >= 0.0, ORDERED) mask per lane
//       @0x193f5b movaps 0x233cde(%rip),xmm4      ; xmm4 = {1,1,1,1} (@0x3c7c40)
//       @0x193f62 movaps xmm0,xmm5                ; xmm5 = a (broadcast lane0)
//       @0x193f65 movaps xmm2,xmm0                ; xmm0 = mask (implicit blendv operand)
//       @0x193f68 blendvps xmm0,xmm5,xmm4         ; xmm4[lane] = mask[lane] ? xmm5[lane] : xmm4[lane]
//                                                 ; lane0: (a>=0.0) ? a : 1.0
//       @0x193f6d movss xmm4,0x1ac(%rdi)
//     lane b (+0x1b0):
//       @0x193f75 ucomiss %xmm1,%xmm3             ; flags(xmm3=0, xmm1=b)
//       @0x193f78 jae 0x193fcb                    ; 0 >= b i.e. b <= 0 -> store 1.0
//       @0x193f7a movss xmm1,0x1b0(%rdi)          ; else store b
//       @0x193fcb movl $0x3f800000,0x1b0(%rdi)    ; b<=0 -> store 1.0
//
//   which=2 @0x193f84-@0x193f98 / @0x193fd7:
//     +0x1a8 = (a != 0.0, NaN-ordered "not equal") ? 1 : 0.
//       @0x193f84 xorps xmm1,xmm1                 ; xmm1 = 0
//       @0x193f87 ucomiss %xmm0,%xmm1             ; flags(xmm1=0, xmm0=a)
//       @0x193f8a jne 0x193f8e                    ; ZF=0 -> a != 0 numerically -> store 1
//       @0x193f8c jnp 0x193fd7                    ; ordered (PF=0) AND ZF=1 -> a == 0 exactly -> store 0
//       @0x193f8e movl $0x1,0x1a8(%rdi)
//       @0x193fd7 movl $0x0,0x1a8(%rdi)
//     Both `!== 0.0` and the CPU sequence agree on all three inputs:
//       exact 0.0  -> 0; nonzero real -> 1; NaN -> 1 (unordered leaves PF=1 so
//       jnp not taken and fallthrough stores 1; NaN !== anything is true in JS).
//
//   which=3 @0x193f9a-@0x193fae / @0x193fe3: identical shape as which=2 but
//     target field is +0x1a4 (useVariableRez).
//
//   which=4 @0x193fb0-@0x193fc3:
//       @0x193fb0 insertps $0x10,xmm1,xmm0        ; xmm0[1] = xmm1[0], other lanes preserved
//                                                 ; effective packed (a, b, prev2, prev3)
//       @0x193fb6 xorps xmm1,xmm1                 ; xmm1 = 0
//       @0x193fb9 maxps %xmm0,%xmm1               ; Intel maxps xmm1, xmm0 -> xmm1[i]=max(xmm1[i],xmm0[i])
//                                                 ; on NaN, Intel maxps returns SRC (xmm0)
//       @0x193fbc movlps xmm1,0x198(%rdi)         ; store two f32 -> +0x198, +0x19c
//     Effective: (scale_x, scale_y) = (max(a, 0), max(b, 0)).
//
// -----------------------------------------------------------------------------
// GetOutput (@0x194020) — NOT ported here.
// This method is a pipeline stitch: it queries `HGRenderer::GetInput`,
// allocates a child kernel (HgcRetimeFullRez or HgcRetimeVariableRez),
// calls SetParameter on that kernel with the cached state, and wires
// three input slots via the child's vtable. Every callee at that boundary
// (HGObject::operator new, __bzero, both child ctors, both child
// SetParameter symbols, three child vtable[0x60]/[0x78] dispatches, and
// HGRenderer::GetInput) is an undecoded frontier symbol at this leaf.
// Per PORTING_SPEC Rule 3 we surface a throwing stub citing @0x194020
// and enumerate the frontier in its message.

import { HGRectNull } from "./HGRect";
// Keep the render/ import namespace consistent with sibling ports; not
// otherwise consumed at this leaf.
type _UnusedGuard_HGRectNull = typeof HGRectNull;

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGRenderer* — opaque render context handle. */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HGNode base — undecoded at this leaf (only the flags dword is surfaced,
 *  matching the sibling HGRetimeWithFrameBlend port). */
export interface HGNode {
  /** self+0x10 — HGNode flags dword. Not touched by this class directly. */
  flags_at_0x10: number;
}

/** HgcRetimeFullRez* — child kernel selected when useVariableRez==0.
 *  Instantiated @0x19409b via HGObject::operator new(0x1b0) + __bzero + its
 *  C2 ctor. All uses of this pointer thereafter go through the kernel's
 *  vtable slot 0x18 (release), 0x60 (SetParameter), 0x78 (SetInput).
 *  Undecoded frontier at this leaf. */
export interface HgcRetimeFullRez {
  readonly __brand: "HgcRetimeFullRez";
}

/** HgcRetimeVariableRez* — child kernel selected when useVariableRez!=0
 *  (the default). Same shape / same vtable slot usage as HgcRetimeFullRez.
 *  Instantiated @0x194140. Undecoded frontier at this leaf. */
export interface HgcRetimeVariableRez {
  readonly __brand: "HgcRetimeVariableRez";
}

/** Union of both child kernel types. `child_at_0x1b8` holds ONE of them
 *  (dispatched by useVariableRez at GetOutput time). */
export type HGRetimeChildKernel = HgcRetimeFullRez | HgcRetimeVariableRez;

/** HGRetime instance shape. See STRUCT LAYOUT above.
 *  All floats are float32 semantics — Math.fround is applied on every store
 *  below to preserve the machine's single-precision truncation. */
export interface HGRetime extends HGNode {
  /** self+0x198 — float32 scale_x  (param 4 lane 0). */
  scale_x_at_0x198: number;
  /** self+0x19c — float32 scale_y  (param 4 lane 1). */
  scale_y_at_0x19c: number;
  /** self+0x1a0 — float32 phase, clamped to [0..1]. */
  phase_at_0x1a0: number;
  /** self+0x1a4 — int32 useVariableRez  (0 -> FullRez branch; nonzero -> VariableRez branch). */
  useVariableRez_at_0x1a4: number;
  /** self+0x1a8 — int32 flag  (param 2 -> {0,1}).  Named reverse_or_flag pending semantic decode. */
  reverse_or_flag_at_0x1a8: number;
  /** self+0x1ac — float32 neg_x_or_one  (param 1 lane 0). Default 1.0. */
  neg_x_or_one_at_0x1ac: number;
  /** self+0x1b0 — float32 y_or_one     (param 1 lane 1). Default 1.0. */
  y_or_one_at_0x1b0: number;
  /** self+0x1b8 — Hgc*Retime*Rez* child_kernel  (or null). Owned. */
  child_at_0x1b8: HGRetimeChildKernel | null;
}

// -----------------------------------------------------------------------------
// Frontier stubs (throw-with-address-citation per PORTING_SPEC Rule 3).
// -----------------------------------------------------------------------------

/** HGNode::HGNode() — base ctor called @0x193de9. Frontier stub. */
function HGNode_ctor(_self: HGNode): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed: called from HGRetime ctor @Helium 0x193de9 as an undecoded frontier symbol.",
  );
}

/** HGNode::~HGNode() — base dtor tail-jmped from D0 @0x193ee8 (via callq)
 *  and from D1 @0x193eb1 / D2 @0x193e71 (via bare jmp to 0x11bf20).
 *  Frontier stub. */
function HGNode_dtor(_self: HGNode): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed: called from HGRetime D0 @Helium 0x193ee8 (and tail-jmped from D1 @0x193eb1 / D2 @0x193e71 to HGNode::~HGNode() @0x11bf20) as an undecoded frontier symbol.",
  );
}

/** HGNode::ClearBits() — invalidation hook called @0x193ff1. Frontier stub. */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() not yet transcribed: called from HGRetime::SetParameter @Helium 0x193ff1 as an undecoded frontier symbol.",
  );
}

/** HGObject::operator delete(void*) — @Helium __ZN8HGObjectdlEPv, tail-jmped
 *  from D0 @0x193ef6. Frontier stub. */
function HGObject_operator_delete(_self: HGNode): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed: tail-jmped from HGRetime D0 @Helium 0x193ef6 as an undecoded frontier symbol.",
  );
}

/** child->vtable[0x18] — release/dispose. Frontier stub. Called from D0
 *  @0x193ee2, D1 @0x193ea5, D2 @0x193e65 (each preceded by
 *  `movq (%rax),%rcx` to load the child's vtable and by loading
 *  self+0x1b8 into %rax). */
function child_vslot0x18_release(_child: HGRetimeChildKernel): void {
  throw new Error(
    "HGRetime-child <vtable slot 0x18> (release/dispose) not yet transcribed: virtual dispatch from HGRetime D0/D1/D2 @Helium 0x193ee2 / 0x193ea5 / 0x193e65 — vtable slot target undecoded.",
  );
}

// -----------------------------------------------------------------------------
// Constants recovered from RIP-relative loads (SetParameter body).
// -----------------------------------------------------------------------------

/** SetParameter which=0 @0x193f33: `movss 0x233d85(%rip), %xmm1` — target
 *  VA 0x3c7cc0. 4 bytes = 0x3f800000 = 1.0f. Upper clamp bound for the
 *  phase parameter. Lower clamp is 0.0f built in-register via
 *  `xorps %xmm1,%xmm1` @0x193f2b. */
const SETPARAM_PHASE_HI = 1.0; // @Helium 0x193f33 -> file offset 0x3c7cc0 = 0x3f800000

/** SetParameter which=1 @0x193f5b: `movaps 0x233cde(%rip), %xmm4` — target
 *  VA 0x3c7c40. 16 bytes = {0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000}
 *  = {1.0f, 1.0f, 1.0f, 1.0f}. Serves as the "fallback = 1.0" lane-vector
 *  for the `blendvps` at @0x193f68 — when the mask lane is 0 (i.e. the
 *  input a was negative), the destination stays 1.0. */
const SETPARAM_BLENDV_FALLBACK_LANE_A = 1.0; // @Helium 0x193f5b -> file offset 0x3c7c40

/** SetParameter which=1 @0x193fcb: `movl $0x3f800000, 0x1b0(%rdi)` — an
 *  immediate 1.0f store when b <= 0.0. */
const SETPARAM_LANE_B_ZERO_REPLACEMENT = 1.0; // @Helium 0x193fcb (imm=0x3f800000)

// -----------------------------------------------------------------------------
// HGRetime::HGRetime() @Helium 0x193de0 (C1). C2 @0x193d80 is the alias.
//
//   @0x193de9  callq HGNode::HGNode()                       ; base ctor
//   @0x193dee-@0x193df5  install vtable pointer at self+0x00
//   @0x193df8  movl  $0x0, 0x1a0(%rbx)                      ; phase = 0.0f
//   @0x193e02  movq  $0x0, 0x198(%rbx)                      ; scale_x=scale_y=0.0f (two f32s zeroed via 8-byte store)
//   @0x193e0d  movq  $0x1, 0x1a4(%rbx)                      ; useVariableRez=1 ; +0x1a8 zeroed by upper 4 bytes of qword
//   @0x193e18  movsd 0x236290(%rip), %xmm0                  ; xmm0 low64 = {1.0f, 1.0f} (@file 0x3ca0b0)
//   @0x193e20  movsd %xmm0, 0x1ac(%rbx)                     ; +0x1ac = 1.0f ; +0x1b0 = 1.0f
//   @0x193e28  movq  $0x0, 0x1b8(%rbx)                      ; child_kernel = null
// -----------------------------------------------------------------------------

/** HGRetime::ctor() @Helium 0x193de0. Chains to `HGNode::HGNode()`, installs
 *  the class vtable at self+0x00, then initializes the plain-data fields
 *  per the disassembled ctor above.
 *
 *  Defaults on exit:
 *    scale_x = scale_y = 0.0f
 *    phase = 0.0f
 *    useVariableRez = 1  (the VariableRez kernel branch is the default)
 *    reverse_or_flag = 0
 *    neg_x_or_one = 1.0f
 *    y_or_one     = 1.0f
 *    child_kernel = null
 */
export function HGRetime_ctor(self: HGRetime): void {
  // @0x193de9 chain to base ctor.
  HGNode_ctor(self);
  // @0x193dee-@0x193df5 install vtable — not modelled as data.
  // @0x193df8 phase = 0.0f (movl $0x0 — 4-byte zero interpreted as f32 +0.0).
  self.phase_at_0x1a0 = Math.fround(0.0);
  // @0x193e02 movq $0x0, 0x198(%rbx) — 8-byte zero store: two adjacent f32 = 0.0f.
  self.scale_x_at_0x198 = Math.fround(0.0);
  self.scale_y_at_0x19c = Math.fround(0.0);
  // @0x193e0d movq $0x1, 0x1a4(%rbx) — 8-byte store {01,00,00,00, 00,00,00,00}:
  //   +0x1a4 = int32 1 ; +0x1a8 = int32 0.
  self.useVariableRez_at_0x1a4 = 1;
  self.reverse_or_flag_at_0x1a8 = 0;
  // @0x193e18/@0x193e20 movsd load of {1.0f,1.0f} from @Helium file 0x3ca0b0
  //   stored to +0x1ac (two adjacent f32s = 1.0f each).
  self.neg_x_or_one_at_0x1ac = Math.fround(1.0);
  self.y_or_one_at_0x1b0 = Math.fround(1.0);
  // @0x193e28 child = null.
  self.child_at_0x1b8 = null;
}

// -----------------------------------------------------------------------------
// HGRetime::~HGRetime()  D2 @0x193e40, D1 @0x193e80, D0 @0x193ec0
//
// D2 and D1 share the same body byte-for-byte (verified via capstone on
// the raw bytes at each addr, since otool -tV only emits one label for the
// ICF-folded pair):
//   push rbp/rsp,rbx,rax
//   leaq <vtable_for_this_class>(%rip), %rax ; movq %rax,(%rdi)   ; re-install our vtable
//   movq  0x1b8(%rdi), %rax                                        ; rax = child
//   test  %rax, %rax ; je end                                     ; skip if null
//   movq  (%rax), %rcx ; movq %rdi,%rbx                           ; rcx = child->vtable, save this
//   movq  %rax, %rdi ; callq *0x18(%rcx)                          ; child->release()
//   movq  %rbx, %rdi                                              ; restore this
//   pop rbx; pop rbp; jmp HGNode::~HGNode()@0x11bf20               ; tail-jmp to base dtor
//
// D0 @0x193ec0 has the same release-child body then:
//   callq HGNode::~HGNode()    @0x193ee8
//   jmp   HGObject::operator delete    @0x193ef6
// -----------------------------------------------------------------------------

/** HGRetime::~HGRetime() base-body — shared by D2 @Helium 0x193e40 and
 *  D1 @0x193e80. Re-installs this class's vtable (a no-op in TS), releases
 *  the child kernel via its vtable slot 0x18 if present, then tail-jmps to
 *  HGNode::~HGNode() (frontier stub). */
export function HGRetime_dtor_D2(self: HGRetime): void {
  // @0x193e46-@0x193e4d install this class's vtable — not modelled as data.
  // @0x193e50 rax = self->child_at_0x1b8.
  const child = self.child_at_0x1b8;
  // @0x193e5a `je` — if child is null, skip.
  if (child !== null) {
    // @0x193e5c-@0x193e65 rcx = child->vtable ; child->release() (vslot 0x18). Frontier stub.
    child_vslot0x18_release(child);
    // @0x193e68 restore %rdi = self — no-op in TS.
  }
  // @0x193e71 tail-jmp to HGNode::~HGNode() @0x11bf20. Frontier stub.
  HGNode_dtor(self);
}

/** HGRetime::~HGRetime() D1 @Helium 0x193e80. Same body as D2 (byte-for-byte
 *  identical per capstone). The corresponding `jmp` tail-call target is the
 *  same HGNode::~HGNode() @0x11bf20 (relative offset 0x88fd53 in D1 vs
 *  0x88fd93 in D2 — same absolute target, different displacement encoding). */
export function HGRetime_dtor_D1(self: HGRetime): void {
  HGRetime_dtor_D2(self);
}

/** HGRetime::~HGRetime() D0 (deleting dtor) @Helium 0x193ec0.
 *
 *   @0x193ec9-@0x193ed0  install vtable at self+0x00
 *   @0x193ed3            rdi = self->child_at_0x1b8    (NB: loaded into %rdi directly here,
 *                        not into %rax as in D1/D2 — the release call thus takes %rdi as
 *                        the child pointer without the swap)
 *   @0x193edd            je 0x193ee5                   ; skip if child null
 *   @0x193edf-@0x193ee2  movq (%rdi),%rax ; callq *0x18(%rax)  ; child->release()
 *   @0x193ee5            movq %rbx,%rdi                ; %rdi = this
 *   @0x193ee8            callq HGNode::~HGNode()
 *   @0x193eed-@0x193ef6  restore stack, then jmp HGObject::operator delete(this)
 */
export function HGRetime_dtor_D0(self: HGRetime): void {
  // @0x193ec9-@0x193ed0 install vtable — not modelled.
  const child = self.child_at_0x1b8;
  if (child !== null) {
    // @0x193edf-@0x193ee2 child->release().
    child_vslot0x18_release(child);
  }
  // @0x193ee8 HGNode::~HGNode()(this).
  HGNode_dtor(self);
  // @0x193ef6 tail-jmp HGObject::operator delete(this).
  HGObject_operator_delete(self);
}

// -----------------------------------------------------------------------------
// HGRetime::SetParameter(int which, float a, float b, float c, float d) @0x193f10
//
// Returns int32. On invalid `which` returns -1. On any valid case does the
// per-`which` store then calls `HGNode::ClearBits()` on `this` and returns 1.
// -----------------------------------------------------------------------------

/** HGRetime::SetParameter @Helium 0x193f10. Faithful transcription of the
 *  jump-table dispatch and all five cases (see the file header PARAMETER
 *  MODEL block for the annotated disassembly of every branch).
 *
 *  Return: 1 on any valid `which` in [0..4]; -1 (0xffffffff sign-extended
 *  in x86) otherwise. */
export function HGRetime_SetParameter(
  self: HGRetime,
  which: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  // Silence unused-param diagnostics; c and d are passed by callers but this
  // class never reads them (the disassembled body only touches xmm0 and xmm1
  // = a and b, per the SysV ABI's float-arg register assignment).
  void c;
  void d;

  // @0x193f10 cmpl $0x4, %esi ; @0x193f13 ja default -> return -1.
  //   Compare is UNSIGNED (`ja`): a negative `which` is 0xffffffffu and
  //   will therefore also be > 4 and fall through to the default.
  const w = which >>> 0;
  if (w > 4) {
    // @0x193fc5 movl $0xffffffff, %eax ; retq — return -1 (int32).
    return -1;
  }

  // @0x193f19-@0x193f29 jump table dispatch on `w`.
  switch (w) {
    case 0: {
      // @0x193f2b-@0x193f4b: phase = clamp(a, 0.0, 1.0), stored @+0x1a0.
      // See file header PARAMETER MODEL for the branch-by-branch AT&T
      // ucomiss operand-order derivation.
      let clamped: number;
      if (a < 0.0) {
        // @0x193f31 `ja 0x193f43` on flags(xmm1=0, xmm0=a): fires when 0 > a.
        clamped = 0.0;
      } else if (a > SETPARAM_PHASE_HI) {
        // @0x193f3e `ja 0x193f43` on flags(xmm0=a, xmm1=1.0): fires when a > 1.
        clamped = SETPARAM_PHASE_HI;
      } else {
        // @0x193f40 fallthrough: xmm1 = a.
        clamped = a;
      }
      // @0x193f43 movss xmm1 -> +0x1a0.
      self.phase_at_0x1a0 = Math.fround(clamped);
      break;
    }
    case 1: {
      // @0x193f50-@0x193f82.
      // Lane a (target +0x1ac): blendvps of {1,1,1,1} with a using mask
      // "a >= 0.0 (ORDERED)" — see file header for cmpnless + blendvps
      // trace. Result: (a >= 0.0) ? a : 1.0.
      const lane_a = (a >= 0.0) ? a : SETPARAM_BLENDV_FALLBACK_LANE_A;
      self.neg_x_or_one_at_0x1ac = Math.fround(lane_a);

      // Lane b (target +0x1b0): @0x193f78 `jae 0x193fcb` on flags(xmm3=0, xmm1=b):
      // fires when 0 >= b -> store 1.0 (@0x193fcb). Else store b.
      const lane_b = (b <= 0.0) ? SETPARAM_LANE_B_ZERO_REPLACEMENT : b;
      self.y_or_one_at_0x1b0 = Math.fround(lane_b);
      break;
    }
    case 2: {
      // @0x193f84-@0x193f98 / @0x193fd7: +0x1a8 = (a == 0.0, ORDERED) ? 0 : 1.
      // The jne/jnp pair is the NaN-ordered "equal" idiom; see PARAMETER
      // MODEL block. In TS, `a !== 0.0` returns true for NaN (NaN !== x is
      // always true), matching the CPU's fallthrough-to-store-1 on NaN.
      self.reverse_or_flag_at_0x1a8 = (a !== 0.0) ? 1 : 0;
      break;
    }
    case 3: {
      // @0x193f9a-@0x193fae / @0x193fe3: identical shape as case 2 but
      // target field is +0x1a4 (useVariableRez).
      self.useVariableRez_at_0x1a4 = (a !== 0.0) ? 1 : 0;
      break;
    }
    case 4: {
      // @0x193fb0-@0x193fc3:
      //   insertps $0x10 puts b in lane1, keeps a in lane0 -> (a, b, ., .).
      //   maxps with {0,0,0,0} clamps each lane to >= 0. On NaN, Intel maxps
      //   returns SRC (xmm0={a,b,...}), matching JS Math.max(NaN, 0) = NaN.
      //   movlps stores lanes 0,1 as f32 to +0x198 and +0x19c.
      self.scale_x_at_0x198 = Math.fround(Math.max(a, 0.0));
      self.scale_y_at_0x19c = Math.fround(Math.max(b, 0.0));
      break;
    }
    default: {
      // Unreachable: the initial `w > 4` early-return covers this.
      return -1;
    }
  }

  // @0x193fed-@0x193ffc shared epilogue: ClearBits(this); return 1.
  HGNode_ClearBits(self);
  // @0x193ff6 movl $0x1, %eax ; retq — return int32 1.
  return 1;
}

// -----------------------------------------------------------------------------
// HGRetime::GetOutput(HGRenderer*) @Helium 0x194020 — NOT ported (frontier
// pipeline stitch; see the file header for the exhaustive list of undecoded
// callees that its body dispatches to). Surfaced as a throwing stub so
// callers do not accidentally silently run against a null child kernel.
// -----------------------------------------------------------------------------

/** HGRetime::GetOutput @Helium 0x194020. Frontier stub — the body is a
 *  pipeline stitch that touches HGObject::operator new(0x1b0) @0x194068,
 *  __bzero @0x194078, HgcRetimeFullRez::HgcRetimeFullRez() @0x19409b,
 *  HgcRetimeVariableRez::HgcRetimeVariableRez() @0x194140,
 *  HgcRetimeFullRez::SetParameter @0x1940cc,
 *  HgcRetimeVariableRez::SetParameter @0x194171,
 *  child->vtable[0x60] @0x1940fe / @0x194124 / @0x19419f / @0x1941ce,
 *  HGRenderer::GetInput @0x1941fc / @0x19421a / @0x19423b, and
 *  child->vtable[0x78] @0x19420c / @0x19422d / @0x19424e — every one an
 *  undecoded frontier symbol at this leaf. */
export function HGRetime_GetOutput(
  _self: HGRetime,
  _renderer: HGRenderer,
): HGRetimeChildKernel {
  throw new Error(
    "HGRetime::GetOutput not yet transcribed: body @Helium 0x194020 dispatches to undecoded frontier symbols including HGObject::operator new @0x194068, __bzero @0x194078, HgcRetimeFullRez::HgcRetimeFullRez() @0x19409b, HgcRetimeVariableRez::HgcRetimeVariableRez() @0x194140, HgcRetimeFullRez::SetParameter @0x1940cc, HgcRetimeVariableRez::SetParameter @0x194171, child->vtable[0x60] @0x1940fe / @0x194124 / @0x19419f / @0x1941ce, HGRenderer::GetInput @0x1941fc / @0x19421a / @0x19423b, and child->vtable[0x78] @0x19420c / @0x19422d / @0x19424e.",
  );
}
