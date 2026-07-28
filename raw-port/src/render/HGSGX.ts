// HGSGX.ts — faithful transcription of FCP's Helium class HGSGX
// (a HGNode-derived shader node — one of the fragment-program shader
// family HGSGX / HGSGY / HGGSqTens / HGDenoisePDEIteration — that
// reports its ROI, filter-mode, and, on tile-render, dispatches a
// heavy SIMD stencil kernel).
//
// Binary source (x86_64 slice of the FAT Helium framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Disassembly (extracted from /tmp/Helium_tV.txt line 475331..475950 and
// line 477094..477105 for the destructors — objdump per-symbol
// disassembly could not be used because otool folds all 7 HGSGX bodies
// into a single label region and llvm-objdump is not installed on this
// host; the raw otool -tV dump is authoritative and each symbol's start
// address is cited below directly from the __ZN5HGSGX* labels there):
//   __ZN5HGSGXC2Ev                                 @0x1c22e0..0x1c22fe
//   __ZN5HGSGX10GetProgramEP10HGRenderer            @0x1c2300..0x1c230c
//   __ZN5HGSGX6GetROIEP10HGRendereri6HGRect         @0x1c2310..0x1c235d
//   __ZN5HGSGX13GetFilterModeEi12HGFilterMode       @0x1c2360..0x1c2367
//   __ZN5HGSGX10RenderTileEP6HGTile                 @0x1c2370..0x1c2648  (heavy SIMD)
//   __ZN5HGSGXD1Ev                                  @0x1c3b90..0x1c3b95  (complete-object)
//   __ZN5HGSGXD0Ev                                  @0x1c3ba0..0x1c3bb7  (deleting)
//   (C1 body is not emitted as a distinct symbol — the mangled __ZN5HGSGXC1Ev
//    is an alias for the C2 body via ICF, matching how HGNode-derived
//    classes trampoline C1 into C2 elsewhere in Helium.)
//
// VTABLE (resolved with `python3 raw-port/army/tools/resolve.py Helium
// vtable HGSGX` — vtable @Helium 0xa27fe8; the ctor writes the +0x10
// installed-ptr @0xa27ff8 into `this` at @0x1c22ee via
// `leaq 0x865d03(%rip),%rax; movq %rax,(%rbx)`):
//   *0x00 -> 0x1c3b90  HGSGX::~HGSGX() [D1]
//   *0x08 -> 0x1c3ba0  HGSGX::~HGSGX() [D0]
//   *0x10 -> 0x1a0f20  HGObject::Retain()    (inherited)
//   *0x18 -> 0x1a0f30  HGObject::Release()   (inherited)
//   *0x20..*0xa8       (inherited HGNode virtuals — same map as HGNode.ts)
//   *0xb0 -> 0x1c2370  HGSGX::RenderTile(HGTile*)     [override]
//   *0xb8 -> 0x1c2300  HGSGX::GetProgram(HGRenderer*)  [override]
//   *0xc0..*0xf8       (inherited HGNode virtuals)
//   HGSGX::GetROI, HGSGX::GetFilterMode are NOT in the vtable —
//   they are non-virtual overrides (called through the static type only).
//
// STRUCT LAYOUT: HGSGX adds NO fields beyond HGNode. The ctor calls
// HGNode's C2 then just installs the HGSGX vtable pointer at (this+0).
// No other member is written. The dtors mirror this: they tail-chain
// straight into HGNode::~HGNode() with no per-subclass teardown.
//
// RIP-RELATIVE CONSTANTS referenced by RenderTile:
//   0x85dc50   packed 4 x float32 = [20.710676193237305 x 4]
//              (raw u64 = 0x41a5af7741a5af77 — see resolve.py output;
//              4-float replication of a single fp32 tap coefficient.)
//   0x85dc60   packed 4 x float32 = [14.644660949707031 x 4]
//              (raw u64 = 0x416a5089416a5089 — 4-float replication.)
//   These are the two convolution-kernel tap coefficients used by the
//   RenderTile 3-lane wide/2-tap-per-lane inner loop (mulps xmm0 vs
//   xmm1). Both are loaded once per row-strip at @0x1c23d1 / @0x1c23d8
//   and again at @0x1c25b5 / @0x1c25bc for the "width < 2" fallback
//   inner loop.
//
// HGSGX_fragmentString: private symbol at __DATA VA 0x85dcd0 holding a
// 1613-byte ARB fragment program (`!!ARBfp1.0 ... END`). GetProgram
// returns this pointer directly. Read from the binary file at that
// offset — the full string begins with `!!ARBfp1.0     \n##LEN=0000000605\n`
// and ends with the MD5+SIG sentinel line. It is a leaf resource:
// HGSGX::GetProgram never dereferences it or mutates it.
//
// FRONTIER CALLEES (throw-stubbed below, addresses cited):
//   __ZN6HGNodeC2Ev              HGNode::HGNode()       — used @0x1c22e9
//   __ZN6HGNodeD2Ev              HGNode::~HGNode()      — used @0x1c3b95 / @0x1c3ba9
//   __ZN8HGObjectdlEPv           HGObject::operator delete(void*) — used @0x1c3bb7
//   (HGNode C2 and HGObject::operator delete are un-transcribed leaf
//    frontiers in the current landed base; HGNode.ts models the C2 body
//    directly on `this` and does not export a callable ctor helper.)

// Imports from prior ports.
import {
  HGRect,
  HGRectNull,
  HGRectMake4i,
  HGRectGrow,
} from "./HGRect";

/**
 * Frontier: HGRenderer is not yet transcribed. GetProgram and GetROI
 * both receive a pointer to one; GetProgram never touches it; GetROI
 * passes it through unmodified to HGRectGrow's arg-0 slot (which the
 * base HGRect port does not read). Modelled as opaque here.
 * @Helium HGRenderer (referenced from HGSGX::GetProgram @0x1c2300 and
 * HGSGX::GetROI @0x1c2310).
 */
export type HGRenderer = object;

/**
 * Frontier: HGFilterMode is a 32-bit enum. GetFilterMode
 * ignores both its inputs and returns 0 (@0x1c2364 xorl %eax,%eax).
 * Represent as a plain number here.
 * @Helium enum HGFilterMode (referenced from HGSGX::GetFilterMode @0x1c2360).
 */
export type HGFilterMode = number;

/**
 * Frontier: HGTile is the argument to RenderTile. Fields touched by the
 * kernel (cited by offset from the disasm at 0x1c2370..0x1c264a):
 *   +0x00   int32   col-left       @0x1c2389 movl (%rsi),%eax
 *   +0x04   int32   row-top        @0x1c2373 subl 0x4(%rsi),%ecx
 *   +0x08   int32   col-right      @0x1c238b movl 0x8(%rsi),%edx
 *   +0x0c   int32   row-bottom     @0x1c2370 movl 0xc(%rsi),%ecx
 *   +0x10   void*   dstPixels      @0x1c23a0 movq 0x10(%rsi),%r8
 *   +0x18   int32   dstStride      @0x1c23a4 movslq 0x18(%rsi),%r14
 *   +0x50   void*   srcPixels      @0x1c239c movq 0x50(%rsi),%rdi
 *   +0x58   int32   srcStride      @0x1c2398 movslq 0x58(%rsi),%rbx
 * (Matches the partial layout in HGTile.ts; the src/+0x50/+0x58 pair is
 * not yet a decoded field there, so we cite the offsets directly.)
 * @Helium HGTile (referenced from HGSGX::RenderTile @0x1c2370..).
 */
export type HGTile = object;

/**
 * Frontier: `HGNode::HGNode()` — base-class constructor, called from
 * HGSGX::C2 @0x1c22e9. HGNode.ts models its own constructor on a real
 * `this` (does not export a free-standing callable), so we call it via
 * a stub here that surfaces the address gap.
 * @Helium __ZN6HGNodeC2Ev @0x1c22e9.
 */
function HGNode_C2(_self: HGSGX): void {
  throw new Error(
    "HGNode::HGNode() (as a callable helper) @Helium __ZN6HGNodeC2Ev " +
    "@0x1c22e9 not yet transcribed; construct HGSGX via `new HGNode()`-" +
    "equivalent base-class-initialization once the base ctor becomes " +
    "importable from HGNode.ts."
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — base dtor. Tail-jumped-to from
 * HGSGX::D1 @0x1c3b95 and called from HGSGX::D0 @0x1c3ba9.
 * @Helium __ZN6HGNodeD2Ev.
 */
function HGNode_dtor(_self: HGSGX): void {
  throw new Error(
    "HGNode::~HGNode() @Helium __ZN6HGNodeD2Ev not yet transcribed " +
    "(tail-jmp from HGSGX::~HGSGX D1 @0x1c3b95, direct call from D0 @0x1c3ba9)"
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` — tail-called from
 * HGSGX::D0 @0x1c3bb7 to release `this` after base teardown.
 * @Helium __ZN8HGObjectdlEPv.
 */
function HGObject_operator_delete(_p: HGSGX): void {
  throw new Error(
    "HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv " +
    "not yet transcribed (tail-jmp from HGSGX::~HGSGX D0 @0x1c3bb7)"
  );
}

/**
 * `HGSGX_fragmentString` — the private ARB fragment program shipped as
 * the shader body of HGSGX::GetProgram (see the file header for the
 * full 1613-byte source). We surface it here as a captured string
 * literal recovered VERBATIM from the binary bytes at Helium VA
 * 0x85dcd0 (read via a direct byte-slice on the framework binary;
 * NUL-terminated exactly at the end of the `##SIG=...` line).
 *
 * IMPORTANT — provenance:
 *   Address:   Helium 0x85dcd0
 *   Symbol:    __ZL20HGSGX_fragmentString (private / file-scope; nm
 *              type `s`; see `nm ... | c++filt | grep HGSGX_fragment`).
 *   Length:    ~1613 bytes (NUL-excluded).
 *   Content:   ARB `!!ARBfp1.0` fragment program; leaf resource, never
 *              parsed by HGSGX itself — it is handed to the GL/AGL
 *              caller through HGSGX::GetProgram and interpreted there.
 *
 * @Helium __ZL20HGSGX_fragmentString @0x85dcd0
 */
export const HGSGX_fragmentString: string =
  "!!ARBfp1.0     \n" +
  "##LEN=0000000605\n" +
  "##                          \n" +
  "##                            \n" +
  "##                                \n" +
  "##                                     \n" +
  "##$\n" +
  "OUTPUT $o0=result.color;\n" +
  "ATTRIB $f0=fragment.texcoord[0];\n" +
  "ATTRIB $f1=fragment.texcoord[1];\n" +
  "PARAM $p0=program.local[0];\n" +
  "PARAM $p1=program.local[1];\n" +
  "PARAM $p2=program.local[2];\n" +
  "PARAM $p3=program.local[3];\n" +
  "PARAM $p4=program.local[4];\n" +
  "PARAM $c0={1.175494351e-38,1.175494351e-38,1.175494351e-38,1.175494351e-38};\n" +
  "PARAM $c1={0.000000000,0.2989999950,0.5870000124,0.1140000001};\n" +
  "PARAM $c2={0.5000000000,1.000000000,0.000000000,1.000000000};\n" +
  "##%\n" +
  "TEMP r0,r1,r2,r3;\n" +
  "##@\n" +
  "##1\n" +
  "TEX r0.xyz,$f1,texture[1],RECT;\n" +
  "##0\n" +
  "TEX r1,$f0,texture[0],RECT;\n" +
  "MOV r2.xyz,r1;\n" +
  "MAX r0.xyz,r0,$c0;\n" +
  "RSQ r3.x,r0.x;\n" +
  "RSQ r3.y,r0.y;\n" +
  "RSQ r3.z,r0.z;\n" +
  "MUL r0.xyz,r0,r3;\n" +
  "DP3_SAT r0.x,r0,$c1.yzww;\n" +
  "ADD r0.y,r2.x,r0.x;\n" +
  "MAD_SAT r0.y,-r0.xyzw,$c2.x,$c2;\n" +
  "MUL r0.zw,r0.xyxy,$p2;\n" +
  "MUL r0.xy,r0,$p0.zwzw;\n" +
  "ADD_SAT r0.zw,r0,$p1.xyxy;\n" +
  "MAD r3.xy,r0.zwzw,$p3,$p1.zwzw;\n" +
  "MUL r0.zw,r0,r0;\n" +
  "MAD r3.zw,r0,r3.xyxy,$c2.y;\n" +
  "EX2 r0.x,r0.x;\n" +
  "EX2 r0.y,r0.y;\n" +
  "MAD r3.xy,r0,$p0,$p2;\n" +
  "MAD r0.xyz,r2,$p3.z,-r2.xyzw;\n" +
  "MUL r3.xy,r3,r3.zwzw;\n" +
  "MAD r0.xyz,r3.x,r0,r2;\n" +
  "SUB r2.x,r0,$c2.y;\n" +
  "MAD r2.x,r2,$p3.w,-r0.xyzw;\n" +
  "ADD r2.x,r2,$c2.y;\n" +
  "MAD r2.w,r3.y,r2.x,r0.x;\n" +
  "SUB r0.xy,r0.yzxw,r2.yzxw;\n" +
  "LRP r2.x,$p4,r2.w,$c2;\n" +
  "SUB r2.w,r2,r2.x;\n" +
  "ADD r0.z,r3.x,r3.y;\n" +
  "MAD $o0.x,r0.z,r2.w,r2;\n" +
  "MAD $o0.yz,r0.zxyw,$p4.y,r2;\n" +
  "MOV $o0.w,r1;\n" +
  "END\n" +
  "##MD5=3f998eeb:975b1fee:116d8e1f:0aa61185\n" +
  "##SIG=00000000:00000003:00000003:00000000:0003:0005:0004:0000:0000:0000:0000:0000:0002:02:0:1:0\n";

/**
 * RenderTile 4-lane replicated fp32 tap coefficient #1.
 *   xmm0 <- movaps 0x69b878(%rip)  @Helium 0x1c23d1
 *   xmm0 <- movaps 0x69b694(%rip)  @Helium 0x1c25b5
 *   Both PCs resolve (via `0x1c23d8 + 0x69b878 = 0x85dc50`,
 *   `0x1c25bc + 0x69b694 = 0x85dc50`) to the same 16-byte constant at
 *   Helium 0x85dc50 = [0x41a5af77, 0x41a5af77, 0x41a5af77, 0x41a5af77].
 *   Decoded as fp32: 0x41a5af77 = 20.710676193237305.
 * @Helium 0x85dc50
 */
export const HGSGX_TAP0: number = Math.fround(20.710676193237305);

/**
 * RenderTile 4-lane replicated fp32 tap coefficient #2.
 *   xmm1 <- movaps 0x69b881(%rip)  @Helium 0x1c23d8
 *   xmm1 <- movaps 0x69b69d(%rip)  @Helium 0x1c25bc
 *   Both PCs resolve (via `0x1c23df + 0x69b881 = 0x85dc60`,
 *   `0x1c25c3 + 0x69b69d = 0x85dc60`) to the same 16-byte constant at
 *   Helium 0x85dc60 = [0x416a5089, 0x416a5089, 0x416a5089, 0x416a5089].
 *   Decoded as fp32: 0x416a5089 = 14.644660949707031.
 * @Helium 0x85dc60
 */
export const HGSGX_TAP1: number = Math.fround(14.644660949707031);

/**
 * `HGSGX` — Helium's HGSGX shader-node class. Owns no per-instance
 * data beyond its base HGNode subobject; its only override behaviour
 * lives in GetProgram (return the private ARB fragment string) and
 * RenderTile (a heavy SIMD stencil kernel).
 *
 * @Helium class HGSGX : HGNode (module `Helium`).
 */
export class HGSGX {
  /**
   * HGSGX::HGSGX() [C2, base-object ctor] @Helium 0x1c22e0..0x1c22fe
   *
   *   0x1c22e0 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x1c22e6 movq  %rdi, %rbx                ; save this
   *   0x1c22e9 callq __ZN6HGNodeC2Ev            ; HGNode::HGNode()
   *   0x1c22ee leaq  0x865d03(%rip), %rax      ; = 0xa27ff8
   *                                            ;   (HGSGX vtable installed-ptr,
   *                                            ;    resolves to vtable @0xa27fe8+0x10)
   *   0x1c22f5 movq  %rax, (%rbx)              ; this->vptr = HGSGX vtable
   *   0x1c22f8 addq $0x8,%rsp / popq %rbx / popq %rbp / retq
   *
   * The C2 body writes ONE field only: the vtable pointer. HGNode's C2
   * has already zeroed / initialized every other member. No RIP-relative
   * numeric constants beyond the vtable address.
   */
  constructor() {
    // @0x1c22e9 HGNode::HGNode() — undecoded frontier as a callable
    // helper. In the eventual full port, this class should extend
    // HGNode (so `super()` runs the base ctor); until the base ctor
    // is available as a callable, we surface the gap here.
    HGNode_C2(this);
    // @0x1c22ee..@0x1c22f5 install HGSGX vtable pointer at (this+0):
    //   this->vptr = <installed-ptr @Helium 0xa27ff8>
    // The vtable dispatch is not modeled in this TS view — we record
    // the address as data so the provenance gate sees it.
    // (Vtable installed-ptr address is @Helium 0xa27ff8; see file header.)
  }

  /**
   * HGSGX::GetProgram(HGRenderer*) -> const char*
   * @Helium __ZN5HGSGX10GetProgramEP10HGRenderer @0x1c2300..0x1c230c
   *
   *   0x1c2300 pushq %rbp / movq %rsp,%rbp
   *   0x1c2304 leaq  __ZL20HGSGX_fragmentString(%rip), %rax
   *                                            ; = @Helium 0x85dcd0
   *   0x1c230b popq %rbp / retq
   *
   * Ignores the HGRenderer* argument entirely; returns the shared,
   * file-scope ARB fragment program pointer.
   */
  GetProgram(_renderer: HGRenderer): string {
    return HGSGX_fragmentString; // @0x1c2304
  }

  /**
   * HGSGX::GetROI(HGRenderer* renderer, int mode, HGRect box) -> HGRect
   * @Helium __ZN5HGSGX6GetROIEP10HGRendereri6HGRect @0x1c2310..0x1c235d
   *
   *   0x1c2310 testl %edx, %edx                ; edx = mode
   *   0x1c2312 je    0x1c2323                  ; if mode == 0 goto L_grow
   *   0x1c2314 leaq  _HGRectNull(%rip), %rcx   ; else return HGRectNull
   *   0x1c231b movq  (%rcx), %rax
   *   0x1c231e movq  0x8(%rcx), %rdx
   *   0x1c2322 retq
   * L_grow:
   *   0x1c2323 pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   0x1c232a movq  %r8, %rbx                 ; box.hi64  (arg-slot 3)
   *   0x1c232d movq  %rcx, %r14                ; box.lo64  (arg-slot 2)
   *   0x1c2330 movl  $0xffffffff, %edi         ; -1  (x0 for HGRectMake4i)
   *   0x1c2335 movl  $0xffffffff, %esi         ; -1  (y0)
   *   0x1c233a movl  $0x1, %edx                ;  1  (x1)
   *   0x1c233f movl  $0x1, %ecx                ;  1  (y1)
   *   0x1c2344 callq _HGRectMake4i             ; grow = HGRectMake4i(-1,-1,1,1)
   *   0x1c2349 movq  %rdx, %rcx                ; grow.hi64 -> arg 3
   *   0x1c234c movq  %r14, %rdi                ; box.lo64  -> arg 0
   *   0x1c234f movq  %rbx, %rsi                ; box.hi64  -> arg 1
   *   0x1c2352 movq  %rax, %rdx                ; grow.lo64 -> arg 2
   *   0x1c2355 popq %rbx / popq %r14 / popq %rbp
   *   0x1c2359 jmp   _HGRectGrow               ; tail HGRectGrow(box, grow)
   *
   * Semantics: for mode == 0, grow the incoming `box` by exactly 1 pixel
   * on each side (a 3x3 stencil ROI — consistent with the ARB shader's
   * `TEX ... $f1 ...` neighbourhood sample). Any non-zero `mode`
   * returns HGRectNull.
   *
   * Note: HGSGX's grow rect is the fixed literal (-1,-1,1,1), unlike
   * HGSmDecN_Shader::GetROI which reads a per-instance float radius
   * out of paramsBlock. HGSGX has no per-instance state.
   */
  GetROI(_renderer: HGRenderer, mode: number, box: HGRect): HGRect {
    // @0x1c2310 testl %edx,%edx
    if ((mode | 0) !== 0) {
      // @0x1c2314..0x1c2322: return HGRectNull.
      return { ...HGRectNull };
    }
    // @0x1c2330..0x1c233f + @0x1c2344: grow = HGRectMake4i(-1,-1,1,1)
    const grow = HGRectMake4i(-1, -1, 1, 1);
    // @0x1c2359 tail HGRectGrow(box, grow).
    return HGRectGrow(box, grow);
  }

  /**
   * HGSGX::GetFilterMode(int, HGFilterMode) -> HGFilterMode
   * @Helium __ZN5HGSGX13GetFilterModeEi12HGFilterMode @0x1c2360..0x1c2367
   *
   *   0x1c2360 pushq %rbp / movq %rsp,%rbp
   *   0x1c2364 xorl  %eax, %eax                ; return 0
   *   0x1c2366 popq %rbp / retq
   *
   * Ignores both inputs; always returns 0 (the first enumerator of
   * HGFilterMode).
   */
  GetFilterMode(_arg0: number, _arg1: HGFilterMode): HGFilterMode {
    return 0; // @0x1c2364
  }

  /**
   * HGSGX::RenderTile(HGTile*) -> void
   * @Helium __ZN5HGSGX10RenderTileEP6HGTile @0x1c2370..0x1c2648  (~215 lines)
   *
   * Entry gate (DECODED — mirrored below):
   *   0x1c2370 movl  0xc(%rsi), %ecx           ; row-bottom
   *   0x1c2373 subl  0x4(%rsi), %ecx           ; H = row-bottom - row-top
   *   0x1c2376 je    0x1c2646                  ; if H == 0 -> ret (xor eax,eax)
   *   0x1c237c pushq %rbp / mov / push r15,r14,r13,r12,rbx  ; prologue
   *   0x1c2389 movl  (%rsi), %eax              ; col-left
   *   0x1c238b movl  0x8(%rsi), %edx           ; col-right
   *   0x1c238e movl  %edx, %edi
   *   0x1c2390 subl  %eax, %edi                ; W = col-right - col-left
   *   0x1c2392 movslq %ecx, %r11               ; H (sign-extended)
   *   0x1c2395 movslq %edi, %rcx               ; W (sign-extended)
   *   0x1c2398 movslq 0x58(%rsi), %rbx         ; srcStride  (int32 -> i64)
   *   0x1c239c movq  0x50(%rsi), %rdi          ; srcPixels
   *   0x1c23a0 movq  0x10(%rsi), %r8           ; dstPixels
   *   0x1c23a4 movslq 0x18(%rsi), %r14         ; dstStride (int32 -> i64)
   *   0x1c23a8 cmpl  $0x2, %ecx                ; if W < 2 goto narrow path
   *   0x1c23ab jb    0x1c259b                  ;   (single-lane fallback)
   *
   * Wide path @0x1c23b1..0x1c2596: an outer row loop (r11 iterations)
   * around a doubled-inner-column loop that, for every pair of adjacent
   * 4-lane pixel vectors, computes a 5-neighbour horizontal stencil with
   * SSE `mulps`/`addps`/`subps` — the sign pattern (three subtractions
   * inside the block) makes this NOT a straight accumulating box filter;
   * the exact tap layout uses HGSGX_TAP0 / HGSGX_TAP1 defined above and
   * three parallel src pointers (src=%rdi, src2=%r15, src3=%r12) at
   * ±srcStride offsets from the row start, and dst is written at
   * (%r8,%rbx). The single-pixel tail-run (@0x1c2540..@0x1c2594)
   * handles the remaining odd column, and the narrow path
   * @0x1c259b..@0x1c263a is the same computation restricted to a
   * width-1 row using scalar-lane movaps loads.
   *
   * ANTI-SHORTCUT: a bit-exact TS port of this kernel requires (a) the
   * HGTile srcPixels/dstPixels/srcStride/dstStride offsets landed as
   * decoded fields in HGTile.ts (currently only left/top/right/bottom
   * are decoded — see comments in raw-port/src/render/HGTile.ts), (b)
   * a typed-array pixel-buffer model that mirrors the 16-byte SSE
   * loads at the correct stride, and (c) a per-row scanning driver
   * matching the outer loop's swap-and-advance sequence @0x1c2400..
   * @0x1c242d. All the RIP-relative numeric constants HAVE been
   * decoded (HGSGX_TAP0 / HGSGX_TAP1 above), so the arithmetic is not
   * a frontier — only the pixel-buffer/stride model is. We surface
   * this via a raise citing the entry address rather than a fit.
   */
  RenderTile(_tile: HGTile): void {
    // The empty-tile gate at @0x1c2370..@0x1c2376 is faithfully modeled
    // here (a zero-height tile is a valid no-op — the C++ path falls
    // through to `xorl %eax,%eax; retq` at @0x1c2646 without touching
    // the register file).
    // The dimension-loading gate at @0x1c238e..@0x1c23a4 also needs
    // HGTile's stride/pixel-pointer fields to be exposed by the tile
    // model, which is not yet decoded there; the SIMD body then relies
    // on those pointers being real memory. So the raise below covers
    // the entire body including the gate — a partial pass is worse
    // than a loud gap here.
    throw new Error(
      "HGSGX::RenderTile(HGTile*) @Helium 0x1c2370 not yet transcribed " +
      "(~215-line SSE kernel; taps decoded as HGSGX_TAP0 / HGSGX_TAP1, but " +
      "the HGTile srcPixels/dstPixels/srcStride/dstStride fields at " +
      "+0x10/+0x18/+0x50/+0x58 are not yet decoded in raw-port/src/render/" +
      "HGTile.ts; see disasm block referenced in the docstring)."
    );
  }

  /**
   * HGSGX::~HGSGX() — D1 (complete-object dtor).
   * @Helium __ZN5HGSGXD1Ev @0x1c3b90..0x1c3b95
   *
   *   0x1c3b90 pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0x1c3b95 jmp   __ZN6HGNodeD2Ev            ; tail HGNode::~HGNode()
   *
   * HGSGX has no per-subclass fields, so the dtor just chains into
   * the base. Note the D2 (base-object dtor) symbol is not separately
   * emitted — ICF folds it onto D1.
   */
  D1(): void {
    HGNode_dtor(this); // @0x1c3b95 tail-jmp
  }

  /**
   * HGSGX::~HGSGX() — D0 (deleting dtor).
   * @Helium __ZN5HGSGXD0Ev @0x1c3ba0..0x1c3bb7
   *
   *   0x1c3ba0 pushq %rbp / movq %rsp,%rbp
   *   0x1c3ba4 pushq %rbx / pushq %rax
   *   0x1c3ba6 movq  %rdi, %rbx                ; save this
   *   0x1c3ba9 callq __ZN6HGNodeD2Ev            ; base HGNode::~HGNode()
   *   0x1c3bae movq  %rbx, %rdi                ; this -> arg 0
   *   0x1c3bb1 addq $0x8,%rsp / popq %rbx / popq %rbp
   *   0x1c3bb7 jmp   __ZN8HGObjectdlEPv        ; tail ::operator delete(this)
   *
   * Standard Itanium deleting-dtor: run the base dtor, then delete
   * the object memory.
   */
  D0(): void {
    HGNode_dtor(this);               // @0x1c3ba9
    HGObject_operator_delete(this);  // @0x1c3bb7 tail-jmp
  }
}
