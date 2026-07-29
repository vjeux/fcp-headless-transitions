// raw-port/src/render/HGACEScct_Encode.ts
//
// FCP `HGACEScct::Encode` — nested Helium HGNode subclass. Wraps an owned
// `HgcLogVideo_encode` compositor and configures it, via two SetParameter
// calls, to implement the ACEScct forward transfer function (linear scene-
// linear → ACEScct log-encoded video).
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…`.
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGACEScct.Encode.s       (Encode ctors/dtors + GetOutput)
//   raw-port/re/disasm/Helium.HGACEScct.Encode_cold.s  (.cold.1..4 static-local init)
//
// SYMBOLS:
//   @Helium 0x1018c0  HGACEScct::Encode::Encode()            [C2 base-object ctor]  __ZN9HGACEScct6EncodeC2Ev
//   @Helium 0x1019d0  HGACEScct::Encode::Encode()            [C1 complete-object ctor — tail-jmp to C2]  __ZN9HGACEScct6EncodeC1Ev
//   @Helium 0x1019e0  HGACEScct::Encode::~Encode()           [D2]  __ZN9HGACEScct6EncodeD2Ev
//   @Helium 0x101a20  HGACEScct::Encode::~Encode()           [D1]  __ZN9HGACEScct6EncodeD1Ev
//   @Helium 0x101a60  HGACEScct::Encode::~Encode()           [D0 — deleting]  __ZN9HGACEScct6EncodeD0Ev
//   @Helium 0x101ab0  HGACEScct::Encode::GetOutput(HGRenderer*)   __ZN9HGACEScct6Encode9GetOutputEP10HGRenderer
//   @Helium 0x3c3770  HGACEScct::Encode::Encode().cold.1     [static-local init for `c`]
//   @Helium 0x3c37b0  HGACEScct::Encode::Encode().cold.2     [static-local init for `d`]
//   @Helium 0x3c3800  HGACEScct::Encode::Encode().cold.3     [static-local init for `bb`]
//   @Helium 0x3c3830  HGACEScct::Encode::Encode().cold.4     [static-local init for `cc`]
//
// VTABLE:
//   @Helium leaq 0x9163a7(%rip),%rax @0x1018d2 → 0xa17c80 = "vtable for
//   HGACEScct::Encode + 0x10"  (installed-ptr = vtable base + 0x10 per
//   Itanium ABI). Reinstalled at 0x101a69 (D0), 0x101a26 (D1), 0x1019e6 (D2).
//
// STRUCT LAYOUT (recovered from C2 @0x1018c0 + GetOutput @0x101ab0):
//   HGACEScct::Encode extends HGNode (base ctor called @0x1018cd, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HgcLogVideo_encode*  compositor  (allocated + ctor'd @0x1018e1/0x1018ec)
//     0x1a0 : float                d_f32       (ACEScct linear-region intercept, as float32; store @0x101930)
//     0x1a4 : float                bb_f32      (ACEScct log-region output constant; store @0x101940)
//     0x1a8 : float                cc_f32      (ACEScct log-region gain, as float32; store @0x101950)
//   Total sizeof = 0x1ac (or 0x1b0 with padding). No further fields
//   touched by any ported entry point.
//
// STATIC LOCALS (Itanium ABI guard-protected, initialised on first call):
//   __ZZN9HGACEScct6EncodeC1EvE1c    double `c`   @Helium BSS 0xaddf40
//                                    init @cold.1 @0x3c3784 movabsq $0x4025149a0a90f133
//                                    → 10.540237741654527d  (ACEScct linear-region slope A)
//   __ZZN9HGACEScct6EncodeC1EvE1d    double `d`   @Helium BSS 0xaddf50
//                                    init @cold.2 @0x3c37c4..0x3c37dc:
//                                      d = c * K1 + K2
//                                      K1 = [rip+0xd764]@0x3d0f38 = -0.0078125d       (breakpoint)
//                                      K2 = [rip+0xd764]@0x3d0f40 = 0.15525114155251146d
//                                    → d = 10.5402377... * -0.0078125 + 0.15525114...
//                                        = 0.07290553419583547d
//                                    This is the ACEScct linear-region intercept
//                                    ("B" in the ACES 1.0.3 spec = 0.0729055341958355).
//                                    Then `cvtsd2ss` @0x10192c yields the f32 stored at 0x1a0.
//   __ZZN9HGACEScct6EncodeC1EvE2bb   float  `bb`  @Helium BSS 0xaddf60
//                                    init @cold.3 @0x3c3814 movl  $0x3f0bce6d
//                                    → 0.5461185574531555f
//   __ZZN9HGACEScct6EncodeC1EvE2cc   float  `cc`  @Helium BSS 0xaddf70
//                                    init @cold.4 @0x3c3844..0x3c3858:
//                                      cc_double = c * K3
//                                      K3 = [rip+0xd5fc]@0x3d0e50 = 0.9d
//                                      cc_double = 10.5402377... * 0.9 = 9.486213967489074
//                                      cc_f32 = cvtsd2ss(cc_double) = 9.486213684082031f
//
// SEMANTICS — WHY these four numbers wire ACEScct:
//   The ACEScct 1.0.3 forward encoding (linear → log) is piecewise:
//     if lin <= 0.0078125:            out = A * lin + B
//                                     with A = 10.5402377416545 , B = 0.0729055341958355
//     else:                           out = (log2(lin) + 9.72) / 17.52
//   All four coefficients passed to the compositor's SetParameter slot 0x60
//   are derived from those spec constants:
//     • linear-region slope A     = c   = 10.5402377416545         (10.540237741654527 as double)
//     • linear-region intercept B = d   = 0.0729055341958355        (0.07290553419583547 as double,
//                                                                   0.072905533... as float32 stored at 0x1a0)
//     • log-region gain          = cc  = c * 0.9 = 9.486213967…    (see below)
//     • log-region output shift  = bb  = 0.5461185574531555f       (see below)
//     • xmm2 in call 1 = 1/17.52 (0x3d0fa8 = 0.05707762390375137f)  — the log-region log2 divisor
//     • xmm2 in call 2 = 0.0086805559f (0x3d0fac)                   — 1/115.2 = a related divisor
//   The two SetParameter calls (segment 0 = log region esi=0, segment 1 =
//   linear region esi=1) hand these coefficients to the underlying
//   `HgcLogVideo_encode` shader, which is the framework's generic
//   segmented log/linear encoder. We deliberately do NOT re-derive the
//   spec relationships here — the point is to ship the four bytes-exact
//   coefficients the binary loads; the shader semantics are decoded (or
//   will be) inside HgcLogVideo_encode, not here.
//
// GETOUTPUT (@0x101ab0..0x101b3e) — rendering-graph wiring:
//   1) input   = HGRenderer::GetInput(this, 0)                          @0x101ac9
//   2) compositor.vtable[0x78] (segment 0, in=input)                    @0x101ad9
//        args: esi=0, rdx=input (all xmm0..xmm3 clobbered by GetInput,
//              but not read on this path — see disasm; only esi + rdx
//              matter for slot 0x78's SetInput signature).
//   3) compositor.vtable[0x60] (esi=0, xmm0=1.0f, xmm1=0.0f, xmm2=1/17.52,
//                                     xmm3=bb)                          @0x101b03
//      (constants from RIP-relative loads @0x101aee/0x101af6.)
//   4) compositor.vtable[0x60] (esi=1, xmm0=cc, xmm1=d, xmm2=0.0086805559,
//                                     xmm3=0.0f)                        @0x101b30
//      (xmm0/xmm1 loaded from `this.field_1a8`/`this.field_1a0`;
//       xmm2 from RIP-relative @0x101b20.)
//   5) return this.compositor                                           @0x101b33
//
// UNDECODED CALLEES (throw-stubs required per PORTING_SPEC.md rule 3):
//   HgcLogVideo_encode::HgcLogVideo_encode()  @Helium __ZN18HgcLogVideo_encodeC1Ev  — invoked @0x1018ec
//   HgcLogVideo_encode vtable slot *0x60      (SetParameter-like) — invoked twice from GetOutput
//   HgcLogVideo_encode vtable slot *0x78      (SetInput-like)     — invoked once from GetOutput
//   HgcLogVideo_encode vtable slot *0x18      (Release)           — invoked from dtors
//   HGObject::operator new(unsigned long)     @Helium __ZN8HGObjectnwEm  — invoked @0x1018e1
//   HGObject::operator delete(void*)          @Helium __ZN8HGObjectdlEPv — invoked @0x101a96 (D0)
//   HGRenderer::GetInput(HGNode*, int)        @Helium __ZN10HGRenderer8GetInputEP6HGNodei — invoked @0x101ac9
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * The `GetInput` method is invoked at @Helium 0x101ac9 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x101ac9 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the compositor object owned at `this.field_198`. Not
 * yet transcribed — see raw-port/army/ledger for HgcLogVideo_encode.
 * Only the three vtable slots vcalled from HGACEScct::Encode are
 * exposed here; each throws until the class is ported.
 */
export interface HgcLogVideo_encode {
  /** vtable *0x18 @Helium — invoked from ~HGACEScct::Encode (D2 @0x101a05, D1 @0x101a45, D0 @0x101a82). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x101b03, @0x101b30). Argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput (@0x101ad9). Argument order (esi, rdx). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHgcLogVideo_encode()` — placeholder for the compositor
 * allocation + ctor sequence at @Helium 0x1018dc..0x1018ec.
 *
 * The binary emits:
 *   0x1018dc  movl  $0x1a0, %edi                     ; alloc size = 0x1A0 = 416 bytes
 *   0x1018e1  callq __ZN8HGObjectnwEm                ; HGObject::operator new(unsigned long)
 *   0x1018ec  callq __ZN18HgcLogVideo_encodeC1Ev     ; placement-ctor
 * — i.e. `new HgcLogVideo_encode()`. Both callees are undecoded, so this
 * stub throws (rule 3: loud gap, not silent approximation).
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGACEScct::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x1018e1/0x1018ec not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Static-local initializers (Itanium ABI __cxa_guard_acquire/release semantics).
// In the C++ source these are function-scope `static const` declarations inside
// HGACEScct::Encode::Encode; the compiler emits them once at first call and
// then reads them from BSS on every subsequent construction. In TS we compute
// them eagerly at module load — same observable result (the guard bits are a
// thread-safe first-write mechanism, not a runtime feature).
// ---------------------------------------------------------------------------

/**
 * `c` — HGACEScct::Encode static local double. @Helium BSS 0xaddf40.
 * Initialized @cold.1 @0x3c3784: `movabsq $0x4025149a0a90f133, %rax; movq %rax, c(%rip)`.
 * Bit-pattern 0x4025149a0a90f133 decodes to 10.540237741654527 as IEEE 754 double.
 * Semantically: the ACEScct 1.0.3 linear-region slope A = 10.5402377416545.
 */
const HGACEScct_Encode_c: number = 10.540237741654527;

/**
 * `d` — HGACEScct::Encode static local double. @Helium BSS 0xaddf50.
 * Initialized @cold.2 @0x3c37c4..0x3c37dc:
 *   xmm0 = c;
 *   xmm0 *= -0.0078125          (double at @Helium 0x3d0f38, RIP-relative +0xd764 from 0x3c37d4)
 *   xmm0 +=  0.15525114155251146 (double at @Helium 0x3d0f40, RIP-relative +0xd764 from 0x3c37dc)
 *   movsd xmm0, d(%rip)
 * → d = 10.540237741654527 * -0.0078125 + 0.15525114155251146
 *     = 0.07290553419583547
 * Matches the ACEScct 1.0.3 linear-region intercept B = 0.0729055341958355.
 */
const HGACEScct_Encode_d: number =
  HGACEScct_Encode_c * -0.0078125 + 0.15525114155251146;

/**
 * `bb` — HGACEScct::Encode static local float. @Helium BSS 0xaddf60.
 * Initialized @cold.3 @0x3c3814: `movl $0x3f0bce6d, bb(%rip)`.
 * Bit-pattern 0x3f0bce6d decodes to 0.5461185574531555 as IEEE 754 float32.
 * Passed as xmm3 to the log-segment SetParameter call in GetOutput.
 */
const HGACEScct_Encode_bb_f32: number = Math.fround(0.5461185574531555);

/**
 * `cc` — HGACEScct::Encode static local float. @Helium BSS 0xaddf70.
 * Initialized @cold.4 @0x3c3844..0x3c3858:
 *   xmm0 = c;                                (double 10.540237741654527)
 *   xmm0 *= 0.9                              (double at @Helium 0x3d0e50, RIP-relative +0xd5fc from 0x3c3854)
 *   xmm0 = cvtsd2ss(xmm0)                    (double → float32 narrowing)
 *   movss xmm0, cc(%rip)
 * → cc_f32 = fround(10.540237741654527 * 0.9) = fround(9.486213967489074) = 9.486213684082031
 * Passed as xmm0 to the log-segment SetParameter call in GetOutput.
 */
const HGACEScct_Encode_cc_f32: number = Math.fround(HGACEScct_Encode_c * 0.9);

// ---------------------------------------------------------------------------
// RIP-relative constants read at GetOutput @0x101ab0.
// ---------------------------------------------------------------------------

/**
 * xmm0 argument in the first SetParameter call (esi=0 log segment).
 * @Helium `movss 0x2c61ca(%rip), %xmm0` @0x101aee → data @0x3c7cc0 = 1.0f.
 */
const HGACEScct_Encode_getOutput_arg1_xmm0_f32: number = Math.fround(1.0);

/**
 * xmm2 argument in the first SetParameter call (esi=0 log segment).
 * @Helium `movss 0x2cf4aa(%rip), %xmm2` @0x101af6 → data @0x3d0fa8 = 0.05707762390375137f.
 * Numerically = 1 / 17.52; the ACEScct log-region divisor.
 */
const HGACEScct_Encode_getOutput_arg1_xmm2_f32: number = Math.fround(0.05707762390375137);

/**
 * xmm2 argument in the second SetParameter call (esi=1 linear segment).
 * @Helium `movss 0x2cf484(%rip), %xmm2` @0x101b20 → data @0x3d0fac = 0.0086805559694767f.
 */
const HGACEScct_Encode_getOutput_arg2_xmm2_f32: number = Math.fround(0.0086805559694767);

/**
 * `HGACEScct::Encode` — Helium HGNode subclass. Wraps an owned
 * `HgcLogVideo_encode` compositor configured for ACEScct forward encoding.
 *
 * @Helium ctors  @0x1018c0 (C2) / @0x1019d0 (C1);
 *         dtors  @0x1019e0 (D2) / @0x101a20 (D1) / @0x101a60 (D0);
 *         GetOutput @0x101ab0.
 */
export class HGACEScctEncode extends HGNode {
  /**
   * Owned `HgcLogVideo_encode` compositor. Field @0x198 in the C++ layout.
   * Assigned once in the ctor @0x1018f1: `movq %r14, 0x198(%rbx)`. No
   * pre-existing-pointer check — this is a fresh HGNode subclass whose
   * base ctor leaves 0x198 uninitialized.
   */
  compositor: HgcLogVideo_encode | null;

  /**
   * ACEScct linear-region intercept, as float32. Field @0x1a0.
   * Written in ctor @0x101930 from cvtsd2ss(HGACEScct_Encode_d).
   */
  d_f32: number;

  /**
   * ACEScct log-segment output shift, as float32. Field @0x1a4.
   * Written in ctor @0x101940 from HGACEScct_Encode_bb_f32.
   */
  bb_f32: number;

  /**
   * ACEScct log-segment gain, as float32. Field @0x1a8.
   * Written in ctor @0x101950 from HGACEScct_Encode_cc_f32.
   */
  cc_f32: number;

  /**
   * `HGACEScct::Encode::Encode()` — Helium @0x1018c0 (C2 base-object ctor).
   * C1 @0x1019d0 is a byte-for-byte `jmp` tail-call to C2, so only C2's
   * body needs modelling.
   *
   * Verbatim asm (@0x1018c0..0x1018c9 prologue elided; @0x101962 epilogue elided):
   *   0x1018cd  callq __ZN6HGNodeC2Ev                       ; base ctor
   *   0x1018d2  leaq  0x9163a7(%rip), %rax  ; = 0xa17c80    (own vtable installed ptr)
   *   0x1018d9  movq  %rax, (%rbx)                          ; *this = vtable
   *   0x1018dc  movl  $0x1a0, %edi                          ; alloc size 0x1A0
   *   0x1018e1  callq __ZN8HGObjectnwEm                     ; HGObject::operator new
   *   0x1018e6  movq  %rax, %r14                            ; r14 = compositor ptr
   *   0x1018ec  callq __ZN18HgcLogVideo_encodeC1Ev          ; placement ctor
   *   0x1018f1  movq  %r14, 0x198(%rbx)                     ; this.compositor = r14
   *   0x1018f8..0x101922  guard-acquire chain for statics c/d/bb/cc
   *                       (jumps into .cold.1..4 if a guard is 0).
   *   0x101924  movsd  c[static-double](%rip), %xmm0
   *   0x10192c  cvtsd2ss %xmm0, %xmm0                       ; double → float32 narrow
   *              (Note: this reads `d` not `c`. See asm — the movsd operand is
   *              __ZZN9HGACEScct6EncodeC1EvE1d, i.e. the `d` static double, not
   *              `c`. cvtsd2ss narrows to float and the result is stored at 0x1a0.)
   *   0x101930  movss  %xmm0, 0x1a0(%rbx)                   ; this.d_f32   = fround(d)
   *   0x101938  movss  bb[static-float](%rip), %xmm0
   *   0x101940  movss  %xmm0, 0x1a4(%rbx)                   ; this.bb_f32  = bb
   *   0x101948  movss  cc[static-float](%rip), %xmm0
   *   0x101950  movss  %xmm0, 0x1a8(%rbx)                   ; this.cc_f32  = cc
   *   0x101962  retq
   *
   * The exception-cleanup path @0x10199a..0x1019c8 (compositor delete +
   * HGNode dtor + __Unwind_Resume) exists only to handle allocation
   * failure or a throwing HgcLogVideo_encode ctor; it never executes on
   * a successful construction and is not modelled explicitly (TS
   * exceptions unwind through the stack naturally).
   */
  constructor() {
    // @Helium 0x1018cd: HGNode base ctor
    super();
    // @Helium 0x1018d9: install this class's vtable (installed ptr = 0xa17c80).
    this.vtable = 0xa17c80;
    // @Helium 0x1018dc..0x1018ec: alloc 0x1a0 bytes + HgcLogVideo_encode ctor.
    // Throws until HgcLogVideo_encode is transcribed (see stub above).
    const newComp = newHgcLogVideo_encode();
    // @Helium 0x1018f1: store compositor.  (No release-old path: the field
    // is uninitialized until this write — see comment on the field.)
    this.compositor = newComp;
    // @Helium 0x101924..0x101930: this.d_f32   = cvtsd2ss(d)
    this.d_f32 = Math.fround(HGACEScct_Encode_d);
    // @Helium 0x101938..0x101940: this.bb_f32  = bb
    this.bb_f32 = HGACEScct_Encode_bb_f32;
    // @Helium 0x101948..0x101950: this.cc_f32  = cc
    this.cc_f32 = HGACEScct_Encode_cc_f32;
  }

  /**
   * `HGACEScct::Encode::~Encode()` — Helium @0x1019e0 (D2, base-object)
   * / @0x101a20 (D1, complete-object) / @0x101a60 (D0, deleting).
   * All three share the same body up through the base-dtor call; D0
   * additionally tail-calls `HGObject::operator delete`. Bodies verbatim:
   *
   * D2 @0x1019e0..0x101a11 (verbatim, ex-handler elided):
   *   0x1019e6  leaq  0x916293(%rip), %rax   ; = 0xa17c80 (own installed vtable ptr)
   *   0x1019ed  movq  %rax, (%rdi)           ; *this = vtable (reinstall)
   *   0x1019f0  movq  0x198(%rdi), %rax      ; rax = compositor
   *   0x1019f7  testq %rax, %rax
   *   0x1019fa  je    0x101a0b               ; skip if null
   *   0x1019fc  movq  (%rax), %rcx           ; rcx = compositor.vtable
   *   0x1019ff  movq  %rdi, %rbx             ; save this
   *   0x101a02  movq  %rax, %rdi             ; rdi = compositor
   *   0x101a05  callq *0x18(%rcx)            ; compositor.Release()  (vtable slot 0x18)
   *   0x101a08  movq  %rbx, %rdi             ; restore this
   *   0x101a11  jmp   __ZN6HGNodeD2Ev        ; tail-call HGNode base dtor
   *
   * D1 @0x101a20 is byte-identical except the vtable-reload leaq offset
   * (@0x101a26 leaq 0x916253(%rip), %rax — same target 0xa17c80 with a
   * different displacement because the leaq PC is different). D0 @0x101a60
   * differs only in that after the HGNode dtor tail-call the epilogue
   * `jmp __ZN8HGObjectdlEPv` frees `this` via HGObject::operator delete;
   * we model D0's operator-delete step at the JS caller (see the `delete`
   * verb, i.e. dropping the reference).
   */
  destruct(): void {
    // @Helium 0x1019ed: vtable reinstall — modeled by assignment.
    this.vtable = 0xa17c80;
    // @Helium 0x1019f0..0x101a05: release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x101a11: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGACEScct::Encode::GetOutput(HGRenderer*)` — Helium @0x101ab0.
   *
   * Wires the owned `HgcLogVideo_encode` compositor into the render graph:
   *   1) fetch this node's input at slot 0
   *   2) hand it to the compositor as its input at slot 0 (vtable *0x78)
   *   3) call SetParameter for the LOG segment (esi=0) with
   *        (xmm0=1.0f, xmm1=0.0f, xmm2=1/17.52, xmm3=bb_f32)
   *   4) call SetParameter for the LINEAR segment (esi=1) with
   *        (xmm0=cc_f32, xmm1=d_f32, xmm2=0.0086805559f, xmm3=0.0f)
   *   5) return the compositor as this node's output.
   *
   * Verbatim asm (@0x101ab0..0x101b3e, prologue/epilogue elided):
   *   0x101aba  movq  0x198(%rdi), %r14           ; r14 = this.compositor
   *   0x101ac1  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x101ac4  movq  %rbx, %rsi                  ; rsi = this
   *   0x101ac7  xorl  %edx, %edx                  ; edx = 0
   *   0x101ac9  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x101ace  movq  (%r14), %rcx                ; rcx = compositor.vtable
   *   0x101ad1  movq  %r14, %rdi                  ; rdi = compositor
   *   0x101ad4  xorl  %esi, %esi                  ; esi = 0
   *   0x101ad6  movq  %rax, %rdx                  ; rdx = input
   *   0x101ad9  callq *0x78(%rcx)                 ; compositor.SetInput(0, input)
   *   0x101adc  movq  0x198(%rbx), %rdi           ; rdi = this.compositor
   *   0x101ae3  movss 0x1a4(%rbx), %xmm3          ; xmm3 = this.bb_f32
   *   0x101aeb  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x101aee  movss 0x2c61ca(%rip), %xmm0       ; xmm0 = 1.0f  @Helium 0x3c7cc0
   *   0x101af6  movss 0x2cf4aa(%rip), %xmm2       ; xmm2 = 0.05707762f (1/17.52) @Helium 0x3d0fa8
   *   0x101afe  xorps %xmm1, %xmm1                ; xmm1 = 0.0f
   *   0x101b01  xorl  %esi, %esi                  ; esi = 0
   *   0x101b03  callq *0x60(%rax)                 ; compositor.SetParameter(0, 1.0f, 0.0f, 1/17.52, bb_f32)
   *   0x101b06  movq  0x198(%rbx), %rdi           ; rdi = this.compositor
   *   0x101b0d  movss 0x1a8(%rbx), %xmm0          ; xmm0 = this.cc_f32
   *   0x101b15  movss 0x1a0(%rbx), %xmm1          ; xmm1 = this.d_f32
   *   0x101b1d  movq  (%rdi), %rax                ; rax = compositor.vtable
   *   0x101b20  movss 0x2cf484(%rip), %xmm2       ; xmm2 = 0.0086805559f @Helium 0x3d0fac
   *   0x101b28  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x101b2b  movl  $0x1, %esi                  ; esi = 1
   *   0x101b30  callq *0x60(%rax)                 ; compositor.SetParameter(1, cc_f32, d_f32, 0.0086805559, 0.0f)
   *   0x101b33  movq  0x198(%rbx), %rax           ; rax = this.compositor
   *   0x101b3e  retq                              ; return rax
   *
   * @param renderer  the containing HGRenderer (undecoded; only its
   *                  `GetInput` method is touched).
   * @returns         the compositor node this class wraps (i.e. the
   *                  output of the node graph for this filter).
   *
   * Throws if the compositor field is null (should be impossible after a
   * successful ctor) or if the compositor's vtable slots aren't yet
   * transcribed (they aren't — see HgcLogVideo_encode stub above).
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x101aba: rax = this.compositor. Invariant: non-null after ctor.
    const comp = this.compositor;
    if (comp == null) {
      // Not modelling the C++ path where this is unreachable — but
      // TypeScript's type-narrowing wants it, and a loud fault here
      // is preferable to `!` shorthand (rule 3).
      throw new Error(
        "HGACEScct::Encode::GetOutput @Helium 0x101aba — compositor null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x101ac9: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x101ad9: compositor.SetInput(0, input) via vtable *0x78
    comp.SetInput(0, input);
    // @Helium 0x101b03: compositor.SetParameter(0, 1.0f, 0.0f, 1/17.52, bb_f32) via vtable *0x60
    comp.SetParameter(
      0,
      HGACEScct_Encode_getOutput_arg1_xmm0_f32,
      Math.fround(0.0),
      HGACEScct_Encode_getOutput_arg1_xmm2_f32,
      this.bb_f32,
    );
    // @Helium 0x101b30: compositor.SetParameter(1, cc_f32, d_f32, 0.0086805559, 0.0f) via vtable *0x60
    comp.SetParameter(
      1,
      this.cc_f32,
      this.d_f32,
      HGACEScct_Encode_getOutput_arg2_xmm2_f32,
      Math.fround(0.0),
    );
    // @Helium 0x101b33..0x101b3e: return this.compositor (cast to HGNode by C++ inheritance).
    return comp as unknown as HGNode;
  }
}
