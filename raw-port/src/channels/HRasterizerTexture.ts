// HRasterizerTexture.ts — Helium HRasterizerTexture: a subclass of
// HgcRasterizerTexture that publishes its own vtable and installs a
// specific-to-this-class default parameter configuration in its
// constructor. The two transcribed constructors are byte-identical
// (Itanium ABI C1 and C2 forms both delegate to
// HgcRasterizerTexture::HgcRasterizerTexture(), then patch the vtable
// pointer, initialise a 16-byte float4 at instance offset 0x1a4, and call
// HgcRasterizerTexture::SetParameter(this, 0, 1.0, 1.0, 1.0, 1.0)). The
// two destructors are the standard C++ D1/D0 pair (base-dtor + operator
// delete for D0).
//
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_C2.s
//   raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_C1.s
//   raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_D1.s
//   raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_D0.s
//
// Helium symbols transcribed:
//   @0x000e7340  HRasterizerTexture::HRasterizerTexture()  (C2)
//   @0x000e73a0  HRasterizerTexture::HRasterizerTexture()  (C1)
//   @0x000e7400  HRasterizerTexture::~HRasterizerTexture() (D1)
//   @0x000e7410  HRasterizerTexture::~HRasterizerTexture() (D0)
//
// Vtable & data symbols (resolved via nm -arch x86_64):
//   _ZTV18HRasterizerTexture  @0x00a11c60   (Itanium vtable start)
//   _ZTI18HRasterizerTexture  @0x00a11eb0   (typeinfo)
//   _ZTS18HRasterizerTexture  @0x003cf5ff   (typeinfo-name)
//
// The C++ "vtable pointer" installed at *this by the ctor is `_ZTV + 0x10`
// (i.e. 0x00a11c70) — the standard Itanium layout skips the two 8-byte
// header slots (offset-to-top and RTTI) so *this loads directly onto the
// first virtual-method slot. The first two virtual slots visible at
// 0x00a11c70/0x00a11c78 are 0x000e7400 (D1) and 0x000e7410 (D0), confirming
// this is HRasterizerTexture's own vtable.
//
// STRUCT LAYOUT (partial, recovered from stores in the ctor):
//   HRasterizerTexture inherits from HgcRasterizerTexture (base sub-object
//   size not decoded here; must be >= 0x1b4 given the stores). The stores
//   this class adds are:
//
//     offset      size  type    written value / meaning
//     ------      ----  ------  ------------------------------------------
//     0x0000      8     void*   vtable pointer (= _ZTV + 0x10 = 0x00a11c70)
//     0x01a4      16    float4  {1.0, 1.0, 1.0, 1.0}  (default per-channel
//                               tint or similar 4-float param; stored via
//                               `movups` -- unaligned 16-byte write)
//
//   All other offsets are owned by the HgcRasterizerTexture base and are
//   not touched by this class. In particular, the "default parameter #0"
//   (an int + 4 floats set to (0, 1.0, 1.0, 1.0, 1.0)) is installed by
//   the tail call to HgcRasterizerTexture::SetParameter — we do NOT
//   store those directly here; they live wherever SetParameter puts them
//   in the base class.
//
// Called stubs (from otool -tV comments in the disasm):
//   __ZN20HgcRasterizerTextureC2Ev   HgcRasterizerTexture::HgcRasterizerTexture()
//                                    callq @0x000e734a  (from C2)
//                                    callq @0x000e73aa  (from C1)
//   __ZN20HgcRasterizerTexture12SetParameterEiffff
//                                    HgcRasterizerTexture::SetParameter(int, float, float, float, float)
//                                    callq @0x000e737d  (from C2)
//                                    callq @0x000e73dd  (from C1)
//   __ZN20HgcRasterizerTextureD2Ev   HgcRasterizerTexture::~HgcRasterizerTexture()
//                                    tail-jmp @0x000e7405 (from D1)
//                                    callq @0x000e7419   (from D0)
//                                    plus two exception-cleanup call sites
//                                    at @0x000e738d/@0x000e73ed (the C++
//                                    unwind fixup after SetParameter — we
//                                    do not surface these in TypeScript
//                                    since JS has no such phase)
//   __ZN8HGObjectdlEPv               HGObject::operator delete(void*)
//                                    tail-jmp @0x000e7427  (from D0)
//
// Frontier callees (not-yet-transcribed):
//   HgcRasterizerTexture::HgcRasterizerTexture()                          — throw-stub
//   HgcRasterizerTexture::SetParameter(int, float, float, float, float)   — throw-stub
//   HgcRasterizerTexture::~HgcRasterizerTexture()                         — throw-stub
//   HGObject::operator delete(void*)                                      — JS GC; documented only

// ---------------------------------------------------------------------------
// Frontier types
// ---------------------------------------------------------------------------

/** HgcRasterizerTexture — the Helium base class of HRasterizerTexture.
 *  Layout not yet decoded. We surface the three referenced members
 *  (ctor / dtor / SetParameter) as opaque hooks so the ctor/dtor bodies
 *  transcribed here can be exercised by future ports. */
export interface HgcRasterizerTexture {
  /** Instance vtable pointer at offset 0 of the fully-constructed object.
   *  For HRasterizerTexture, the ctor writes `_ZTV18HRasterizerTexture + 0x10`
   *  (= 0x00a11c70) here. */
  __vtable_ptr: number;

  /** Storage for the 16-byte float4 that HRasterizerTexture writes at its
   *  instance offset 0x1a4. In C++ this is a plain struct member; we
   *  surface it here (on the base interface) so the ctor can write it
   *  without inventing a per-subclass layout. */
  member_at_0x1a4: [number, number, number, number];

  /** HgcRasterizerTexture::~HgcRasterizerTexture() @Helium — the base
   *  destructor. Referenced by HRasterizerTexture's D1 (tail-jmp
   *  @0x000e7405) and D0 (callq @0x000e7419). Not yet transcribed. */
  __hgc_dtor(): void;
}

/** HRasterizerTexture — the class this file transcribes. Inherits from
 *  HgcRasterizerTexture and adds no new fields (all stores at offset
 *  0/0x1a4 land inside the base sub-object). */
export interface HRasterizerTexture extends HgcRasterizerTexture {}

// ---------------------------------------------------------------------------
// Vtable & literal-pool constants (RIP-relative loads in the ctor).
// Verified by xxd of the Helium x86_64 slice (FAT prefix +0x4000).
// ---------------------------------------------------------------------------

/** _ZTV18HRasterizerTexture + 0x10 — the vtable pointer the ctor installs
 *  at *this. First two entries are HRasterizerTexture::~D1 (@0x000e7400)
 *  and HRasterizerTexture::~D0 (@0x000e7410), confirming ownership. */
export const HRasterizerTexture_VTABLE_PTR = 0x00a11c70;

/** Literal @Helium 0x003c7c40 — 16 bytes = 4×float32(1.0). Loaded by both
 *  ctors as the initial value for the instance's offset-0x1a4 float4
 *  (via `movaps 0x2e08e0(%rip), %xmm0 ; movups %xmm0, 0x1a4(%rbx)`
 *  @0x000e7359/@0x000e7360 and the C1 equivalent @0x000e73b9/@0x000e73c0).
 *
 *  A fresh tuple is emitted each call so callers can mutate the field
 *  without aliasing the shared literal back into other instances. */
function LITERAL_003C7C40_float4(): [number, number, number, number] {
  // xxd of x86_64 slice @ file-offset 0x003c7c40+0x4000: four "00 00 80 3f".
  return [
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
  ];
}

/** Literal @Helium 0x003c7cc0 — 4 bytes = float32(1.0). Loaded via
 *  `movss 0x2e0951(%rip), %xmm0` @0x000e7367 and the C1 equivalent
 *  @0x000e73c7, then broadcast across xmm0/1/2/3 for the SetParameter
 *  call.
 *
 *  xxd of x86_64 slice @ file-offset 0x003c7cc0+0x4000: "00 00 80 3f". */
const LITERAL_003C7CC0_float32 = Math.fround(1.0);

// ---------------------------------------------------------------------------
// Undecoded external helpers — throwing stubs cite their @0xADDR call sites.
// ---------------------------------------------------------------------------

/** HgcRasterizerTexture::HgcRasterizerTexture() @Helium — the base ctor.
 *  Call sites: @0x000e734a (C2), @0x000e73aa (C1). Not yet transcribed. */
export function HgcRasterizerTexture_ctor(_self: HgcRasterizerTexture): void {
  throw new Error(
    "HgcRasterizerTexture::HgcRasterizerTexture @Helium (callq @0x000e734a / @0x000e73aa) not yet transcribed",
  );
}

/** HgcRasterizerTexture::SetParameter(int, float, float, float, float)
 *  @Helium — installs a 5-tuple (index + 4 floats) into the base object.
 *  Call sites: @0x000e737d (C2), @0x000e73dd (C1). Not yet transcribed. */
export function HgcRasterizerTexture_SetParameter(
  _self: HgcRasterizerTexture,
  _index: number,
  _f0: number,
  _f1: number,
  _f2: number,
  _f3: number,
): void {
  throw new Error(
    "HgcRasterizerTexture::SetParameter @Helium (callq @0x000e737d / @0x000e73dd) not yet transcribed",
  );
}

// ---------------------------------------------------------------------------
// HRasterizerTexture::HRasterizerTexture() — C1/C2 ctor
//
// C1 @0x000e73a0 and C2 @0x000e7340 are byte-identical modulo the RIP
// offsets on the three literal loads (all three offsets resolve to the
// same absolute addresses 0x00a11c70 / 0x003c7c40 / 0x003c7cc0 — see the
// literal-pool constants above). Faithful to the C2 disasm at
// raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_C2.s:
//
//   @0x000e7340/@0x000e73a0  pushq %rbp ; movq %rsp, %rbp ; pushq %r14 ; pushq %rbx
//   @0x000e7347/@0x000e73a7  movq %rdi, %rbx           ; rbx = self (preserved)
//   @0x000e734a/@0x000e73aa  callq HgcRasterizerTexture::HgcRasterizerTexture()  ; base ctor
//   @0x000e734f/@0x000e73af  leaq 0x92a91a/0x92a8ba(%rip), %rax
//                              ; rax = _ZTV18HRasterizerTexture + 0x10 = 0x00a11c70
//   @0x000e7356/@0x000e73b6  movq %rax, (%rbx)          ; self.__vtable_ptr = 0x00a11c70
//   @0x000e7359/@0x000e73b9  movaps 0x2e08e0/0x2e0880(%rip), %xmm0
//                              ; xmm0 = *(float4*)literal @0x003c7c40 = {1,1,1,1}
//   @0x000e7360/@0x000e73c0  movups %xmm0, 0x1a4(%rbx)  ; self.member_at_0x1a4 = {1,1,1,1}
//   @0x000e7367/@0x000e73c7  movss 0x2e0951/0x2e08f1(%rip), %xmm0
//                              ; xmm0 = *(float32*)literal @0x003c7cc0 = 1.0
//   @0x000e736f/@0x000e73cf  movq %rbx, %rdi            ; arg1 (this) = self
//   @0x000e7372/@0x000e73d2  xorl %esi, %esi            ; arg2 (int index) = 0
//   @0x000e7374/@0x000e73d4  movaps %xmm0, %xmm1        ; xmm0=xmm1=xmm2=xmm3=1.0
//   @0x000e7377/@0x000e73d7  movaps %xmm0, %xmm2
//   @0x000e737a/@0x000e73da  movaps %xmm0, %xmm3
//   @0x000e737d/@0x000e73dd  callq HgcRasterizerTexture::SetParameter(this, 0, 1.0, 1.0, 1.0, 1.0)
//   @0x000e7382/@0x000e73e2  popq %rbx ; popq %r14 ; popq %rbp ; retq
//
// Trailing instructions @0x000e7387..0x000e738d (and @0x000e73e7..0x000e73ed)
// are the C++ exception-unwind fixup: if the base ctor's SetParameter
// throws, the compiler emits a call to the base destructor to unwind the
// partially-constructed object. In TypeScript there is no equivalent
// "partial-construction unwind" phase (any thrown exception simply leaves
// the object dangling for the GC), so we document but do not surface it.
// ---------------------------------------------------------------------------

/** HRasterizerTexture::HRasterizerTexture() — C1/C2 default constructor.
 *  @Helium 0x000e7340 (C2) / @Helium 0x000e73a0 (C1). Byte-identical.
 *  Delegates to HgcRasterizerTexture's ctor, installs
 *  HRasterizerTexture's vtable pointer, initialises the offset-0x1a4
 *  float4 to {1,1,1,1}, and invokes HgcRasterizerTexture::SetParameter(0,
 *  1.0, 1.0, 1.0, 1.0). */
export function HRasterizerTexture_ctor(self: HRasterizerTexture): void {
  // @0x000e734a/@0x000e73aa  callq HgcRasterizerTexture::HgcRasterizerTexture()
  HgcRasterizerTexture_ctor(self);
  // @0x000e734f/@0x000e73af  leaq _ZTV18HRasterizerTexture+0x10(%rip), %rax
  // @0x000e7356/@0x000e73b6  movq %rax, (%rbx)
  self.__vtable_ptr = HRasterizerTexture_VTABLE_PTR;
  // @0x000e7359/@0x000e73b9  movaps literal-@0x003c7c40(%rip), %xmm0
  // @0x000e7360/@0x000e73c0  movups %xmm0, 0x1a4(%rbx)
  self.member_at_0x1a4 = LITERAL_003C7C40_float4();
  // @0x000e7367/@0x000e73c7  movss literal-@0x003c7cc0(%rip), %xmm0
  //   -> xmm0 = 1.0f
  // @0x000e7372/@0x000e73d2  xorl %esi, %esi          ; index = 0
  // @0x000e7374..7a/@0x000e73d4..da  movaps %xmm0, %xmm{1,2,3}
  //   -> all four float args = 1.0f
  // @0x000e737d/@0x000e73dd  callq HgcRasterizerTexture::SetParameter(this, 0, 1, 1, 1, 1)
  HgcRasterizerTexture_SetParameter(
    self,
    0,
    LITERAL_003C7CC0_float32,
    LITERAL_003C7CC0_float32,
    LITERAL_003C7CC0_float32,
    LITERAL_003C7CC0_float32,
  );
}

// ---------------------------------------------------------------------------
// HRasterizerTexture::~HRasterizerTexture() — D1 @0x000e7400
//
// Faithful to raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_D1.s:
//   @0x000e7400  pushq %rbp ; movq %rsp, %rbp
//   @0x000e7404  popq %rbp
//   @0x000e7405  jmp __ZN20HgcRasterizerTextureD2Ev    ; tail-call base dtor
//
// Pure tail-call — no HRasterizerTexture-specific cleanup (this class
// only publishes a vtable and initialises fields in the base sub-object;
// there is nothing to tear down here).
// ---------------------------------------------------------------------------

/** HRasterizerTexture::~HRasterizerTexture() (D1) @Helium 0x000e7400.
 *  Tail-jumps to HgcRasterizerTexture::~HgcRasterizerTexture(). */
export function HRasterizerTexture_dtor_D1(self: HRasterizerTexture): void {
  // @0x000e7405 jmp __ZN20HgcRasterizerTextureD2Ev
  self.__hgc_dtor();
}

// ---------------------------------------------------------------------------
// HRasterizerTexture::~HRasterizerTexture() — D0 @0x000e7410
//
// Faithful to raw-port/re/disasm/Helium.HRasterizerTexture.HRasterizerTexture_D0.s:
//   @0x000e7410  pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   @0x000e7416  movq  %rdi, %rbx
//   @0x000e7419  callq __ZN20HgcRasterizerTextureD2Ev   ; base dtor
//   @0x000e741e  movq  %rbx, %rdi
//   @0x000e7421  addq $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x000e7427  jmp   __ZN8HGObjectdlEPv               ; operator delete(void*)
// ---------------------------------------------------------------------------

/** HRasterizerTexture::~HRasterizerTexture() (D0) @Helium 0x000e7410.
 *  Calls the base destructor, then tail-calls HGObject::operator delete.
 *  Only the base-dtor call is surfaced in TS (JS GC replaces `operator
 *  delete`). */
export function HRasterizerTexture_dtor_D0(self: HRasterizerTexture): void {
  // @0x000e7419 callq __ZN20HgcRasterizerTextureD2Ev
  self.__hgc_dtor();
  // @0x000e7427 jmp __ZN8HGObjectdlEPv (HGObject::operator delete(void*)).
  // No-op in TypeScript; JS GC reclaims the object.
}
