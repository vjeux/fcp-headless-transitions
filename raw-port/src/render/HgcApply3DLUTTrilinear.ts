// HgcApply3DLUTTrilinear — Helium HGNode subclass that applies a 3D-LUT
// with trilinear interpolation to its single input image. This class is
// the wrapper over the shader-carrying base `HgcApply3DLUTTrilinear_basekernel`
// which owns the actual per-tile compute program.
//
// From this class's decoded surface we see FOUR own exported symbols
// (nm evidence from Helium `_symmap.tsv`):
//   0000000000073e10 t __ZN22HgcApply3DLUTTrilinearD1Ev   HgcApply3DLUTTrilinear::~HgcApply3DLUTTrilinear()  ; D1
//   0000000000073e20 t __ZN22HgcApply3DLUTTrilinearD0Ev   HgcApply3DLUTTrilinear::~HgcApply3DLUTTrilinear()  ; D0
//   0000000000073e40 t __ZN22HgcApply3DLUTTrilinear6GetDODEP10HGRendereri6HGRect
//   0000000000073e60 t __ZN22HgcApply3DLUTTrilinear6GetROIEP10HGRendereri6HGRect
//
// The class inherits (single inheritance — the D1 dtor's body is a plain
// tail-jmp to `HgcApply3DLUTTrilinear_basekernel::~HgcApply3DLUTTrilinear_basekernel()`
// [D2]) from `HgcApply3DLUTTrilinear_basekernel`. Sibling classes in Helium
// following the same wrapper-over-basekernel pattern (nm evidence — grep on
// `HgcApply3DLUT` in the symbol map): HgcApply3DLUTTetrahedral,
// HgcApply3DLUTTrilinearFast, HgcApply3DLUTTetrahedralFast,
// HgcApply3DLUTTrilinearUniform, ... — each has exactly the same four
// own exported symbols (D0, D1, GetDOD, GetROI). This is Helium's
// established pattern where the wrapper carries render-graph plumbing
// (DOD/ROI predicates) and the "_basekernel" sibling carries the shader.
//
// Faithful transcription of exactly FOUR exported symbols. Source disasm
// dumped via raw-port/tools/disasm.sh under raw-port/re/disasm/:
//   Helium.HgcApply3DLUTTrilinear.GetDOD.s      (GetDOD @0x73e40)
//   Helium.HgcApply3DLUTTrilinear.GetROI.s      (GetROI @0x73e60)
// The two dtors were recovered via awk pulls on the Helium `_tV.txt`
// (`__ZN22HgcApply3DLUTTrilinearD1Ev:` and D0Ev). Framework: Final Cut
// Pro / Helium.framework.
//
// Instance-layout note (from GetROI): this class reads exactly one int32
// field at offset +0x1a0 — the LUT's per-edge cube size N (typically 17,
// 33, or 65 for a Rec.709/2020 grade LUT). All other GetROI outputs are
// derived from N. That field lives on the `HgcApply3DLUTTrilinear_basekernel`
// base subobject — this class exports NO OWN fields.
//
// Source disassembly:
//
// (D1 — complete-object dtor)
//   __ZN22HgcApply3DLUTTrilinearD1Ev:
//     0x73e10 pushq %rbp
//     0x73e11 movq  %rsp, %rbp
//     0x73e14 popq  %rbp
//     0x73e15 jmp   __ZN33HgcApply3DLUTTrilinear_basekernelD2Ev
//                                                        ; HgcApply3DLUTTrilinear_basekernel::~...()
//     0x73e1a nopw  (%rax,%rax)                          ; alignment
//
// (D0 — deleting dtor)
//   __ZN22HgcApply3DLUTTrilinearD0Ev:
//     0x73e20 pushq %rbp
//     0x73e21 movq  %rsp, %rbp
//     0x73e24 pushq %rbx
//     0x73e25 pushq %rax                                 ; 16B align
//     0x73e26 movq  %rdi, %rbx                           ; spill this
//     0x73e29 callq __ZN33HgcApply3DLUTTrilinear_basekernelD2Ev
//                                                        ; chain base dtor
//     0x73e2e movq  %rbx, %rdi
//     0x73e31 addq  $0x8, %rsp
//     0x73e35 popq  %rbx
//     0x73e36 popq  %rbp
//     0x73e37 jmp   __ZN8HGObjectdlEPv                   ; tail-jmp HGObject::operator delete
//     0x73e3c nopl  (%rax)                               ; alignment
//
// (GetDOD)
//   __ZN22HgcApply3DLUTTrilinear6GetDODEP10HGRendereri6HGRect:
//     0x73e40 movq   %rcx, %rax                          ; rax = arg.rect.lo qword
//     0x73e43 testl  %edx, %edx                          ; test the int mode arg
//     0x73e45 je     0x73e5a                             ; edx==0 -> return input rect UNCHANGED
//     0x73e47 pushq  %rbp                                ; edx!=0 -> HGRectNull branch
//     0x73e48 movq   %rsp, %rbp
//     0x73e4b leaq   _HGRectNull(%rip), %rcx
//     0x73e52 movq   (%rcx), %rax                        ; rax = HGRectNull.lo
//     0x73e55 movq   0x8(%rcx), %r8                      ; r8  = HGRectNull.hi
//     0x73e59 popq   %rbp
//     0x73e5a movq   %r8, %rdx                           ; ---- shared return ----
//     0x73e5d retq                                       ; 16B struct return in {rax,rdx}
//     0x73e5e nop
//
//   NOTE the polarity flip vs. HGCColorGamma_chroma_downsample_f1's
//   GetDOD: HERE `edx == 0` is the "return the passed-in rect verbatim"
//   fast path and `edx != 0` is the "declare HGRectNull" branch. In
//   HGCColorGamma_… GetDOD, `edx == 0` was the "query input via renderer"
//   normal path. Both are valid Helium node conventions — the per-node
//   choice reflects whether the node's DOD is a pure identity of its
//   input (this class) or a queried property (chroma downsample). No
//   guessing: the machine encoding is unambiguous — `je 0x73e5a` after
//   `testl %edx, %edx` jumps ONLY when edx==0, and that landing zone is
//   the merge point that returns {rax = original rcx, rdx = original r8}.
//
// (GetROI)
//   __ZN22HgcApply3DLUTTrilinear6GetROIEP10HGRendereri6HGRect:
//     0x73e60 pushq  %rbp
//     0x73e61 movq   %rsp, %rbp
//     0x73e64 pushq  %r15                                ; callee-saved
//     0x73e66 pushq  %r14
//     0x73e68 pushq  %r13
//     0x73e6a pushq  %r12
//     0x73e6c pushq  %rbx
//     0x73e6d pushq  %rax                                ; 16B align
//     0x73e6e movq   %r8,  -0x30(%rbp)                   ; spill arg.rect.hi (input.right|bottom)
//     0x73e72 movq   %rcx, %r14                          ; spill arg.rect.lo (input.x|y)
//     0x73e75 movl   %edx, %r15d                         ; spill mode enum
//     0x73e78 movq   %rdi, %rbx                          ; spill this
//     0x73e7b movl   0x1a0(%rdi), %ecx                   ; N = this->lutSize (i32 @ +0x1a0)
//     0x73e81 movl   %ecx, %edx                          ; edx = N
//     0x73e83 imull  %ecx, %edx                          ; edx = N*N
//     0x73e86 incl   %edx                                ; edx = N*N + 1  (rect1.right)
//     0x73e88 incl   %ecx                                ; ecx = N + 1    (rect1.bottom)
//     0x73e8a xorl   %edi, %edi                          ; edi = 0        (rect1.x)
//     0x73e8c xorl   %esi, %esi                          ; esi = 0        (rect1.y)
//     0x73e8e callq  _HGRectMake4i                       ; rect1 = HGRectMake4i(0, 0, N*N+1, N+1)
//     0x73e93 movq   %rax, %r12                          ; spill rect1.lo
//     0x73e96 movq   %rdx, %r13                          ; spill rect1.hi
//     0x73e99 movl   0x1a0(%rbx), %edx                   ; edx = N        (rect2.right)
//     0x73e9f xorl   %edi, %edi                          ; edi = 0        (rect2.x)
//     0x73ea1 xorl   %esi, %esi                          ; esi = 0        (rect2.y)
//     0x73ea3 movl   $0x1, %ecx                          ; ecx = 1        (rect2.bottom)
//                                                          ; NOTE: rect2.right is the raw N from
//                                                          ;   0x1a0(this), NOT N+1. incl was only
//                                                          ;   applied to the rect1 args; the rect2
//                                                          ;   call re-loads a fresh N. This is a
//                                                          ;   bug-free intentional asymmetry.
//     0x73ea8 callq  _HGRectMake4i                       ; rect2 = HGRectMake4i(0, 0, N,   1)
//                                                          ; result now sits in {rax, rdx}
//     0x73ead cmpl   $0x2, %r15d
//     0x73eb1 je     0x73edd                             ; mode==2 -> return {rax,rdx} = rect2
//     0x73eb3 cmpl   $0x1, %r15d
//     0x73eb7 je     0x73ec7                             ; mode==1 -> load rect1, then goto end
//     0x73eb9 testl  %r15d, %r15d
//     0x73ebc jne    0x73ecf                             ; mode not in {0,1,2} -> HGRectNull branch
//     0x73ebe movq   %r14, %rax                          ; mode==0 -> load input rect
//     0x73ec1 movq   -0x30(%rbp), %rdx
//     0x73ec5 jmp    0x73edd
//     0x73ec7 movq   %r12, %rax                          ; mode==1 branch target: load rect1
//     0x73eca movq   %r13, %rdx
//     0x73ecd jmp    0x73edd
//     0x73ecf leaq   _HGRectNull(%rip), %rcx             ; other-mode branch target
//     0x73ed6 movq   (%rcx), %rax                        ; return HGRectNull
//     0x73ed9 movq   0x8(%rcx), %rdx
//     0x73edd addq   $0x8, %rsp                          ; ---- shared return ----
//     0x73ee1 popq   %rbx
//     0x73ee2 popq   %r12
//     0x73ee4 popq   %r13
//     0x73ee6 popq   %r14
//     0x73ee8 popq   %r15
//     0x73eea popq   %rbp
//     0x73eeb retq
//     0x73eec nopl   (%rax)
//
// Semantics decoded:
//
//   GetDOD: same-rect identity when mode==0 (this is a per-pixel colour
//   transform — its output covers exactly the pixels its input covers,
//   nothing added or removed). mode!=0 -> HGRectNull (estimate/thumbnail
//   fast-out).
//
//   GetROI: FOUR mode-dependent outputs. This is NOT a spatial-support
//   ROI (a per-pixel LUT sampler needs zero neighbouring input pixels —
//   trilinear interpolation happens inside the LUT cube, not across the
//   image plane). Instead this method is being called via the Helium
//   render-graph ABI in a POLYMORPHIC role where each `mode` selects a
//   different rect the caller wants — the return meanings, inferred from
//   the shape of the constants (N, N*N+1, N+1, and 1):
//     mode == 0 : return the incoming rect verbatim (the image ROI —
//                 same-rect identity for the pixel-plane input).
//     mode == 1 : return HGRectMake4i(0, 0, N*N+1, N+1)
//                 = the flat "2D-unroll of the 3D LUT" rect:
//                   width  = N*N + 1  (the (r,g) grid unrolled into a
//                                       row, one column of padding),
//                   height = N + 1    (the b axis + one row of padding).
//                 This is the LUT-texture ROI in the buffer where the
//                 3D grid lives (padding of +1 on each axis is the
//                 classic linear-sampler border cell so trilinear taps
//                 at the cube edge never fall off the texture).
//     mode == 2 : return HGRectMake4i(0, 0, N,   1)
//                 = a 1D "N x 1" rect. Very likely the domain of the
//                 1D input axis LUT used by trilinear (per-channel
//                 shaper LUT), or a "one row per axis" auxiliary
//                 buffer.
//     other     : HGRectNull (no ROI declared).
//   The exact meaning of each mode-index is a Helium ABI convention on
//   HGNode::GetROI that this slice does not itself decode — it just
//   dispatches. Callers know what they asked for.
//
// Vtable — installed vptr for this class is at Helium's __ZTV22HgcApply3DLUTTrilinear
// (typeinfo at __ZTI22HgcApply3DLUTTrilinear). This class overrides the
// D0/D1 dtor slots plus GetDOD and GetROI; every other slot inherits
// through the `HgcApply3DLUTTrilinear_basekernel` base and, ultimately, HGNode.
//
// Frontier callees (each becomes a throwing stub — call sites cited):
//   HgcApply3DLUTTrilinear_basekernel::~HgcApply3DLUTTrilinear_basekernel() [D2]
//                                          @Helium D1 tail-jmp 0x73e15 / D0 callq 0x73e29
//   HGObject::operator delete(void*)       @Helium D0 tail-jmp 0x73e37
//   HGRectMake4i                           @Helium GetROI callq 0x73e8e / 0x73ea8
//                                          (imported live from HGRect.ts)
//
// Reused ports:
//   HGRect, HGRectMake4i, HGRectNull — from raw-port/src/render/HGRect.ts.

import { HGRect, HGRectMake4i, HGRectNull } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. Not
 * referenced by any own method of this class (the `renderer` arg to GetDOD
 * and GetROI is DEAD in both — neither method actually reads through it).
 */
export type HGRenderer = object;

/**
 * `HgcApply3DLUTTrilinear_basekernel::~HgcApply3DLUTTrilinear_basekernel()`
 * [D2 base-object dtor] — the primary base class's destructor. Chained by
 * both this class's dtors. Its body — and the actual per-tile compute
 * kernel plumbing (GetProgram / RenderTile / BindTexture / GetParameter /
 * SetParameter / Bind / GetOutput) that lives on the basekernel base — is
 * frontier from this slice.
 */
function HgcApply3DLUTTrilinear_basekernel_D2_dtor(
  _this: HgcApply3DLUTTrilinear,
): void {
  throw new Error(
    "HgcApply3DLUTTrilinear: " +
      "HgcApply3DLUTTrilinear_basekernel::~HgcApply3DLUTTrilinear_basekernel() " +
      "[D2] not yet transcribed @Helium D1 tail-jmp 0x73e15 / D0 callq 0x73e29",
  );
}

/**
 * `HGObject::operator delete(void*)` — Helium's HGObject-scoped operator
 * delete (NOT the global one). Tail-jmp'd from D0 @0x73e37 with (`this`).
 * Not on this class's decoded surface.
 */
function HGObject_operator_delete(_p: HgcApply3DLUTTrilinear): void {
  throw new Error(
    "HgcApply3DLUTTrilinear: HGObject::operator delete(void*) not yet " +
      "transcribed @Helium D0 tail-jmp 0x73e37",
  );
}

/**
 * `HgcApply3DLUTTrilinear` — HGNode wrapper for a 3D-LUT trilinear-interp
 * colour transform. This class's own slice exports only the dtor pair and
 * the two GetDOD / GetROI overrides. All render machinery (program binding,
 * texture binding, per-tile execution) lives on the
 * `HgcApply3DLUTTrilinear_basekernel` base.
 *
 * Instance layout (partial — recovered from GetROI reads):
 *   +0x1a0 : int32  LUT edge size N (typically 17, 33, or 65). Lives on the
 *                    HgcApply3DLUTTrilinear_basekernel base subobject.
 */
export class HgcApply3DLUTTrilinear {
  /**
   * Basekernel-owned field at instance offset +0x1a0: the 3D-LUT's per-edge
   * cube size N. Read by GetROI @0x73e7b and @0x73e99 as `movl 0x1a0(%rdi), %ecx/%edx`.
   *
   * Modelled here as an own property of the JS instance because the
   * inheritance chain's exact layout above +0x1a0 is not on this class's
   * decoded surface (see class comment) — the field is nonetheless
   * OBSERVABLE at this exact byte offset in the running Helium binary.
   */
  private lutSize_at_0x1a0: number = 0;

  /**
   * `HgcApply3DLUTTrilinear::~HgcApply3DLUTTrilinear()` [D1 — complete-object
   * dtor] @Helium 0x73e10. Single tail-jmp into the basekernel base's D2.
   *
   *   0x73e10 pushq %rbp
   *   0x73e11 movq  %rsp, %rbp
   *   0x73e14 popq  %rbp
   *   0x73e15 jmp   HgcApply3DLUTTrilinear_basekernel::~...() [D2]
   */
  D1_dtor(): void {
    // @0x73e15
    HgcApply3DLUTTrilinear_basekernel_D2_dtor(this);
  }

  /**
   * `HgcApply3DLUTTrilinear::~HgcApply3DLUTTrilinear()` [D0 — deleting dtor]
   * @Helium 0x73e20. Chains base D2 dtor, then tail-jmps HGObject::operator
   * delete on the same pointer.
   *
   *   0x73e20 pushq %rbp
   *   0x73e21 movq  %rsp, %rbp
   *   0x73e24 pushq %rbx
   *   0x73e25 pushq %rax
   *   0x73e26 movq  %rdi, %rbx        ; spill this
   *   0x73e29 callq HgcApply3DLUTTrilinear_basekernel::~...() [D2]
   *   0x73e2e movq  %rbx, %rdi        ; restore this
   *   0x73e31 addq  $0x8, %rsp
   *   0x73e35 popq  %rbx
   *   0x73e36 popq  %rbp
   *   0x73e37 jmp   HGObject::operator delete(void*)
   */
  D0_dtor(): void {
    // @0x73e29
    HgcApply3DLUTTrilinear_basekernel_D2_dtor(this);
    // @0x73e37
    HGObject_operator_delete(this);
  }

  /**
   * `HgcApply3DLUTTrilinear::GetDOD(HGRenderer*, int, HGRect)` @Helium 0x73e40.
   *
   * mode == 0 -> return the passed-in rect UNCHANGED (per-pixel colour
   *              transform: output DOD == input DOD, identity).
   * mode != 0 -> return HGRectNull.
   *
   * The `renderer` argument (`%rsi`) is DEAD in this method.
   *
   *   0x73e40 movq  %rcx, %rax
   *   0x73e43 testl %edx, %edx
   *   0x73e45 je    0x73e5a            ; mode==0 -> identity return
   *   0x73e47..0x73e59  ; mode!=0 -> HGRectNull load into (rax, r8)
   *   0x73e5a movq  %r8, %rdx
   *   0x73e5d retq
   */
  GetDOD(_renderer: HGRenderer, mode: number, rect: HGRect): HGRect {
    // @0x73e43 — testl %edx, %edx / je 0x73e5a
    if ((mode | 0) === 0) {
      // @0x73e45 -> 0x73e5a: return input rect UNCHANGED
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
    }
    // @0x73e47..0x73e5d: return HGRectNull
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }

  /**
   * `HgcApply3DLUTTrilinear::GetROI(HGRenderer*, int, HGRect)` @Helium 0x73e60.
   *
   * Four-way switch on `mode`, ALWAYS computing both rect1 and rect2 up
   * front (the asm evaluates both `_HGRectMake4i` calls before the switch
   * for register-pressure / branch-prediction reasons — this is faithful
   * to the bit-for-bit decode).
   *
   *   N       = this[+0x1a0]          ; int32, the LUT cube edge size
   *   rect1   = HGRectMake4i(0, 0, N*N + 1, N + 1)
   *   rect2   = HGRectMake4i(0, 0, N,       1)          ; note: uses raw N, not N+1
   *
   *   switch (mode) {
   *     case 0: return `rect` (the passed-in argument)                     ; @0x73ebc/0x73ec5
   *     case 1: return rect1  = HGRectMake4i(0, 0, N*N+1, N+1)              ; @0x73eb3/0x73ec7
   *     case 2: return rect2  = HGRectMake4i(0, 0, N,     1)                ; @0x73ead/0x73eb1
   *     default:return HGRectNull                                           ; @0x73ecf/0x73ed9
   *   }
   *
   * The `renderer` argument is DEAD in this method.
   *
   * The dispatch uses `cmpl $0x2 / je` first, `cmpl $0x1 / je` second, then
   * `testl / jne` — meaning the machine-order tests are (mode==2)? (mode==1)?
   * (mode==0)? default. The equivalent structured switch is identical in
   * observable behaviour.
   */
  GetROI(_renderer: HGRenderer, mode: number, rect: HGRect): HGRect {
    // @0x73e7b — read N from the basekernel field at +0x1a0
    const N = this.lutSize_at_0x1a0 | 0;

    // @0x73e81..0x73e8e — compute rect1 = HGRectMake4i(0, 0, N*N+1, N+1)
    //   edx = N;   imull N -> edx = N*N;    incl -> N*N + 1
    //   ecx = N;                            incl -> N + 1
    //   x=0, y=0, right=N*N+1, bottom=N+1
    const rect1 = HGRectMake4i(0, 0, ((Math.imul(N, N) + 1) | 0), ((N + 1) | 0));

    // @0x73e99..0x73ea8 — compute rect2 = HGRectMake4i(0, 0, N, 1)
    //   fresh reload of `movl 0x1a0(%rbx), %edx` -> edx = N (NOT N+1: the
    //   incl at 0x73e88 landed on %ecx, not on the source field)
    //   x=0, y=0, right=N, bottom=1
    const rect2 = HGRectMake4i(0, 0, N, 1);

    // @0x73ead..0x73ecd — mode dispatch. The asm's own order is (==2),
    // (==1), (==0), else — we preserve that ordering exactly.
    const m = mode | 0;
    if (m === 2) {
      // @0x73eb1 -> 0x73edd
      return rect2;
    }
    if (m === 1) {
      // @0x73eb7 -> 0x73ec7 -> 0x73edd
      return rect1;
    }
    if (m === 0) {
      // @0x73ebc -> 0x73ebe -> 0x73edd (input rect passed through)
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
    }
    // @0x73ecf..0x73ed9 -> HGRectNull
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }
}
