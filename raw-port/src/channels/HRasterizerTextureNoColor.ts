// HRasterizerTextureNoColor — Helium HGNode wrapper around the lowercase
// sibling `HgcRasterizerTextureNoColor` (the class that carries the actual
// texture-lookup rasterizer machinery: GetProgram, RenderTile, BindTexture,
// Bind, Get/SetParameter, GetOutput, RenderFragment, GetDOD/GetROI, etc.).
//
// This capital-"H" class exports only FOUR symbols (nm evidence from the
// FCP-shipped Helium x86_64 slice):
//
//   0000000000055230 t __ZN25HRasterizerTextureNoColorC2Ev
//   0000000000055290 t __ZN25HRasterizerTextureNoColorC1Ev
//   00000000000552f0 t __ZN25HRasterizerTextureNoColorD1Ev
//   0000000000055300 t __ZN25HRasterizerTextureNoColorD0Ev
//
// All other rasterizer state/methods live on `HgcRasterizerTextureNoColor`
// (nm evidence: `RenderTile`, `Bind`, `BindTexture`, `SetParameter`, etc. all
// at 0x35f... / 0x36... on the lowercase base). Same Helium pattern documented
// on e.g. HGCColorGamma_chroma_downsample_f1 and HGLensGDC_BC — the capital
// wrapper installs its own vtable and delegates.
//
// The ctors initialize a 16-byte block at `this+0x1a4` to (1,1,1,1) and
// then call the base's `SetParameter(0, 1.0, 1.0, 1.0, 1.0)` — this is the
// "clear color" / default RGBA-1 parameter slot on the rasterizer (slot 0
// on HgcRasterizerTextureNoColor, four f32 arguments matching the
// `SetParameter(int, float, float, float, float)` signature at 0x361070).
//
// Framework: Final Cut Pro / Helium.framework.
//
// Source disassembly (llvm-objdump/otool) is committed under
//   raw-port/re/disasm/Helium.HRasterizerTextureNoColor.HRasterizerTextureNoColor.s
//
// Full disasm (C2 — base object ctor):
//
//   __ZN25HRasterizerTextureNoColorC2Ev:
//     0x55230 pushq %rbp
//     0x55231 movq  %rsp, %rbp
//     0x55234 pushq %r14
//     0x55236 pushq %rbx
//     0x55237 movq  %rdi, %rbx                              ; spill this
//     0x5523a callq 0x360d90 (HgcRasterizerTextureNoColor::HgcRasterizerTextureNoColor())
//                                                            ; call base ctor
//     0x5523f leaq  0x9b289a(%rip), %rax                    ; rax = &vtable+0x10
//                                                            ;   = 0xa07ad0 (vtable) + 0x10
//                                                            ;   = 0xa07ae0 (installed slot 0 addr)
//     0x55246 movq  %rax, (%rbx)                            ; (*this).vptr = installed vtable ptr
//     0x55249 movaps 0x3729f0(%rip), %xmm0                  ; @0x3c7c40 = (1.0,1.0,1.0,1.0) f32x4
//     0x55250 movups %xmm0, 0x1a4(%rbx)                     ; (*this)[0x1a4..0x1b4] = (1,1,1,1)
//     0x55257 movss  0x372a61(%rip), %xmm0                  ; @0x3c7cc0 = 1.0 f32 scalar
//     0x5525f movq  %rbx, %rdi                              ; rdi = this
//     0x55262 xorl  %esi, %esi                              ; esi = 0  (parameter index)
//     0x55264 movaps %xmm0, %xmm1                           ; f = 1.0
//     0x55267 movaps %xmm0, %xmm2                           ; g = 1.0
//     0x5526a movaps %xmm0, %xmm3                           ; h = 1.0
//     0x5526d callq 0x361070 (HgcRasterizerTextureNoColor::SetParameter(int,f,f,f,f))
//                                                            ; SetParameter(0, 1, 1, 1, 1)
//     0x55272 popq  %rbx
//     0x55273 popq  %r14
//     0x55275 popq  %rbp
//     0x55276 retq
//     0x55277 movq  %rax, %r14                              ; itanium-abi cleanup landing pad
//     0x5527a movq  %rbx, %rdi
//     0x5527d callq 0x360fb0 (HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor() [D2])
//     0x55282 movq  %r14, %rdi
//     0x55285 callq __Unwind_Resume                          ; rethrow
//     0x5528a nopw  (%rax,%rax)                              ; alignment padding
//
// (C1 — complete-object ctor: functionally identical to C2 modulo the entry
//  symbol. Same instruction sequence from 0x55290..0x552d6 that C2 has from
//  0x55230..0x55276, calling the same base C2 at 0x360d90, the same vtable
//  install at 0xa07ae0, same (1,1,1,1) fill at +0x1a4, same
//  SetParameter(0, 1,1,1,1). Cleanup pad calls the same base D2 at 0x360fb0.
//  C1 and C2 emit the same body for a class without virtual bases; ported
//  once here in `constructor` since the derived-class-observable behavior is
//  a single ctor body @0x55230-derived.)
//
// (D1 — complete-object dtor)
//   __ZN25HRasterizerTextureNoColorD1Ev:
//     0x552f0 pushq %rbp
//     0x552f1 movq  %rsp, %rbp
//     0x552f4 popq  %rbp
//     0x552f5 jmp   0x360fb0 (HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor() [D2])
//     0x552fa nopw  (%rax,%rax)                              ; alignment padding
//
// (D0 — deleting dtor)
//   __ZN25HRasterizerTextureNoColorD0Ev:
//     0x55300 pushq %rbp
//     0x55301 movq  %rsp, %rbp
//     0x55304 pushq %rbx
//     0x55305 pushq %rax                                    ; 16B stack align
//     0x55306 movq  %rdi, %rbx                              ; spill this
//     0x55309 callq 0x360fb0 (HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor() [D2])
//     0x5530e movq  %rbx, %rdi                              ; this again
//     0x55311 addq  $0x8, %rsp
//     0x55315 popq  %rbx
//     0x55316 popq  %rbp
//     0x55317 jmp   0x1a0f10 (HGObject::operator delete(void*))
//     0x5531c nopl  (%rax)                                  ; alignment padding
//
// RIP-relative constants (raw bytes read from /tmp/Helium.x86_64):
//   @0x3c7c40 (16B, movaps target)     : 00 00 80 3F  00 00 80 3F  00 00 80 3F  00 00 80 3F
//                                          = f32 x4 (1.0, 1.0, 1.0, 1.0) — fp32-narrowed
//   @0x3c7cc0 (4B,  movss  target)     : 00 00 80 3F
//                                          = f32 1.0 — fp32-narrowed
//   @0xa07ad0 = vtable for HRasterizerTextureNoColor
//   @0xa07ae0 = vtable + 0x10 (the address installed at (*this)[0..8])
//
// Symbol resolutions:
//   0x360d90  -> HgcRasterizerTextureNoColor::HgcRasterizerTextureNoColor() [C2]
//   0x360fb0  -> HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor() [D2]
//   0x361070  -> HgcRasterizerTextureNoColor::SetParameter(int, float, float, float, float)
//   0x1a0f10  -> HGObject::operator delete(void*)
//
// None of those callee classes are ported yet in raw-port/src — this port
// exposes exactly the observable surface (four functions) and delegates
// through throwing stubs for the base ctor / dtor / SetParameter / operator
// delete, per PORTING_SPEC.md (undecoded callee => throwing stub citing its
// address). That gives downstream callers a correct demand signal without
// inventing behavior.

// -----------------------------------------------------------------------------
// Undecoded callee stubs. Each throws with @0xADDR embedded in the message so
// gate.sh's provenance check accepts them (per PORTING_SPEC.md P4).
// -----------------------------------------------------------------------------

//
// HgcRasterizerTextureNoColor::HgcRasterizerTextureNoColor() (C2, base ctor)
// Un-ported — stub throws @0x360d90. Called from HRasterizerTextureNoColor's
// C1/C2 to run the base member/vtable init before the derived class installs
// its own vtable.
//
function HgcRasterizerTextureNoColor_C2(_this: HRasterizerTextureNoColor): void {
  throw new Error(
    "HgcRasterizerTextureNoColor::HgcRasterizerTextureNoColor() not yet transcribed @0x360d90",
  );
}

//
// HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor() (D2, base dtor).
// Un-ported — stub throws @0x360fb0. Chained from this class's D1 (tail-jmp)
// and D0 (before operator delete) and from C2's cleanup landing pad on
// SetParameter throw.
//
function HgcRasterizerTextureNoColor_D2(_this: HRasterizerTextureNoColor): void {
  throw new Error(
    "HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor() not yet transcribed @0x360fb0",
  );
}

//
// HgcRasterizerTextureNoColor::SetParameter(int, float, float, float, float)
// (base 4-channel parameter setter). Un-ported — stub throws @0x361070.
// Called from the ctor with SetParameter(0, 1.0, 1.0, 1.0, 1.0).
//
function HgcRasterizerTextureNoColor_SetParameter(
  _this: HRasterizerTextureNoColor,
  _index: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "HgcRasterizerTextureNoColor::SetParameter(int,float,float,float,float) not yet transcribed @0x361070",
  );
}

//
// HGObject::operator delete(void*) — Helium's placement-delete slot. D0
// tail-jumps here after chaining the base dtor. Un-ported — stub throws
// @0x1a0f10.
//
function HGObject_operator_delete(_p: HRasterizerTextureNoColor): void {
  throw new Error("HGObject::operator delete(void*) not yet transcribed @0x1a0f10");
}

// -----------------------------------------------------------------------------
// RIP-relative constants — verbatim from Helium __TEXT/__const at their exact
// addresses. Kept as Readonly tuples so the transcription mirrors the static
// .rodata that these movaps/movss instructions actually load from.
// -----------------------------------------------------------------------------

// @const 0x3c7c40 — f32 x 4 (1.0, 1.0, 1.0, 1.0); loaded by movaps @0x55249
const CONST_XMM_ONES: Readonly<[number, number, number, number]> = [
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
] as const;

// @const 0x3c7cc0 — f32 1.0; loaded by movss @0x55257
const CONST_F32_ONE: number = Math.fround(1.0);

//
// @const 0xa07ae0 — the address stored into (*this) by the ctor's
// `movq %rax, (%rbx)` at 0x55246 (== &__ZTV25HRasterizerTextureNoColor + 0x10,
// i.e. the vtable's first virtual-function slot pointer per Itanium ABI).
//
const VTABLE_INSTALLED_PTR = "HRasterizerTextureNoColor::__vtable+0x10";

// -----------------------------------------------------------------------------
// HRasterizerTextureNoColor
// -----------------------------------------------------------------------------

//
// Helium HGNode wrapper. State-wise the C++ class inherits (single, non-virtual)
// from HgcRasterizerTextureNoColor at offset 0 (D1's tail-jmp to D2 with the
// unchanged `this` pointer is the proof). The DERIVED class contributes:
//   - its own vtable installed at (*this)[0..8] (offset 0, aliased with the
//     base's vptr — this is a normal vtable override).
//   - the 16-byte f32 x 4 block at offset 0x1a4 filled with (1,1,1,1) by the
//     ctor, and immediately mirrored by a SetParameter(0, 1,1,1,1) call to
//     the base (so the base's parameter cache and this cache stay in sync —
//     same "default color = white" pattern the class name implies).
//
// We model just enough state here to preserve those writes byte-visibly. All
// other state lives on the base and is opaque to this port.
//
export class HRasterizerTextureNoColor {
  // Installed vtable pointer at (*this)[0..8] — see VTABLE_INSTALLED_PTR.
  public vptr: string = "";

  //
  // 16-byte f32 x 4 block at (*this)+0x1a4. Ctor writes (1,1,1,1) via a
  // movups from @0x3c7c40. Modeled as a fixed-length tuple so accidental
  // resize (which would be un-C++-like) can't happen.
  //
  public paramCacheAt1a4: [number, number, number, number] = [
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
  ];

  //
  // Constructor. Both C1 (@0x55290) and C2 (@0x55230) run this body — see
  // class-level comment for why they emit the same code.
  //
  // Body (exact mirror of asm):
  //   1. Call base HgcRasterizerTextureNoColor::HgcRasterizerTextureNoColor()
  //      (C2 @0x360d90).
  //   2. Install this class's vtable pointer at (*this)[0..8] =
  //      &vtable+0x10 = 0xa07ae0.
  //   3. Store (1,1,1,1) as f32 x 4 at (*this)+0x1a4 (movaps from @0x3c7c40).
  //   4. Load 1.0 f32 (movss from @0x3c7cc0) into xmm0, splat into
  //      xmm1/2/3, then call base SetParameter(0, 1.0, 1.0, 1.0, 1.0)
  //      (@0x361070).
  //
  // The cleanup landing pad at 0x55277 (raised if SetParameter throws) chains
  // the base dtor and rethrows via __Unwind_Resume. We mirror that with a
  // try/catch so a base-SetParameter throw runs the base dtor before
  // propagation, exactly like the itanium unwind entry.
  //
  // @from HRasterizerTextureNoColor::HRasterizerTextureNoColor() @0x55230 (C2)
  // @from HRasterizerTextureNoColor::HRasterizerTextureNoColor() @0x55290 (C1)
  //
  constructor() {
    // @0x5523a / @0x5529a — call base C2
    HgcRasterizerTextureNoColor_C2(this);

    try {
      // @0x5523f..0x55246 / @0x5529f..0x552a6 — install vtable ptr at (*this)
      this.vptr = VTABLE_INSTALLED_PTR;

      // @0x55249..0x55250 / @0x552a9..0x552b0 — movaps @0x3c7c40 -> movups @+0x1a4
      this.paramCacheAt1a4 = [
        CONST_XMM_ONES[0],
        CONST_XMM_ONES[1],
        CONST_XMM_ONES[2],
        CONST_XMM_ONES[3],
      ];

      // @0x55257..0x5526d / @0x552b7..0x552cd — SetParameter(0, 1,1,1,1)
      HgcRasterizerTextureNoColor_SetParameter(
        this,
        0,
        CONST_F32_ONE,
        CONST_F32_ONE,
        CONST_F32_ONE,
        CONST_F32_ONE,
      );
    } catch (e) {
      // @0x55277..0x55285 / @0x552d7..0x552e5 — cleanup landing pad:
      //   run base dtor with the partially-constructed `this`, then rethrow.
      HgcRasterizerTextureNoColor_D2(this);
      throw e;
    }
  }

  //
  // Complete-object dtor. Body is a pure tail-jmp to the base D2 with an
  // unchanged `this` — no derived-class members require cleanup.
  //
  // @from HRasterizerTextureNoColor::~HRasterizerTextureNoColor() @0x552f0 (D1)
  //
  destroy(): void {
    // @0x552f5 — jmp HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor()
    HgcRasterizerTextureNoColor_D2(this);
  }

  //
  // Deleting dtor — chains base dtor, then tail-jmps to
  // HGObject::operator delete(this). This is the "delete p;" entry the
  // derived vtable exposes.
  //
  // @from HRasterizerTextureNoColor::~HRasterizerTextureNoColor() @0x55300 (D0)
  //
  destroyAndDelete(): void {
    // @0x55309 — chain base D2 with `this`
    HgcRasterizerTextureNoColor_D2(this);
    // @0x55317 — jmp HGObject::operator delete(this)
    HGObject_operator_delete(this);
  }
}
