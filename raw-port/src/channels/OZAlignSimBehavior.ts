// OZAlignSimBehavior — Ozone alignment simulation behavior.
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @Ozone 0xADDR read from the
// disassembly under raw-port/re/disasm/OZAlignSimBehavior.*.s and any un-decoded frontier is a
// throwing stub that names the source address so the gap is loud.
//
// Symbols in this class (nm -arch x86_64 | c++filt | grep '^OZAlignSimBehavior::'):
//
//   @0x3f29a0  OZAlignSimBehavior::affectsRot()                                          — PORTED
//   @0x3f2970  OZAlignSimBehavior::affectsX()                                            — PORTED
//   @0x3f2980  OZAlignSimBehavior::affectsY()                                            — PORTED
//   @0x3f2990  OZAlignSimBehavior::affectsZ()                                            — PORTED
//   @0x3f1150  OZAlignSimBehavior::calcMaskVecAndNewZ(CMTime, PCVector3<double>*, PCVector3<double>*)     — PORTED
//   @0x3f1210  OZAlignSimBehavior::calcReorientMatrix(CMTime, PCMatrix33Tmpl<double>*)   — PORTED
//   @0x3f12b0  OZAlignSimBehavior::accumForces(OZSimStateArray*)                         — stub (531-line body)
//   @0x3f07c0  OZAlignSimBehavior::accumForces(OZSimulationState*, OZTransformNode*)     — stub
//   @0x3f2320  OZAlignSimBehavior::accumInitialValues(OZSimStateArray*, int)             — stub (331-line body)
//   @0x3f1da0  OZAlignSimBehavior::accumInitialValues(OZSimulationState*, OZTransformNode*) — stub
//   @0x3f0070  OZAlignSimBehavior::OZAlignSimBehavior(OZFactory*, PCString const&, unsigned int) — stub (ctor)
//   @0x3efd30  OZAlignSimBehavior::OZAlignSimBehavior(OZFactory*, PCString const&, unsigned int) — stub (ctor variant)
//   @0x3f01f0  OZAlignSimBehavior::OZAlignSimBehavior(OZAlignSimBehavior&, unsigned int) — stub (copy ctor)
//   @0x3f0080  OZAlignSimBehavior::OZAlignSimBehavior(OZAlignSimBehavior&, unsigned int) — stub (copy ctor variant)
//   @0x3f04d0  OZAlignSimBehavior::~OZAlignSimBehavior()  (D0 — deleting dtor)           — stub
//   @0x3f0290  OZAlignSimBehavior::~OZAlignSimBehavior()  (D1)                           — stub
//   @0x3f0200  OZAlignSimBehavior::~OZAlignSimBehavior()  (D2)                           — stub
//   @0x3f0720  OZAlignSimBehavior::operator=(OZBehavior const&)                          — stub
//
// PROVENANCE / DECODE dumps live at:
//   raw-port/re/disasm/OZAlignSimBehavior.affectsRot.s          @0x3f29a0
//   raw-port/re/disasm/OZAlignSimBehavior.affectsX.s            @0x3f2970
//   raw-port/re/disasm/OZAlignSimBehavior.affectsY.s            @0x3f2980
//   raw-port/re/disasm/OZAlignSimBehavior.affectsZ.s            @0x3f2990
//   raw-port/re/disasm/OZAlignSimBehavior.calcMaskVecAndNewZ.s  @0x3f1150
//   raw-port/re/disasm/OZAlignSimBehavior.calcReorientMatrix.s  @0x3f1210
//   raw-port/re/disasm/OZAlignSimBehavior.accumForces.s         @0x3f12b0
//   raw-port/re/disasm/OZAlignSimBehavior.accumInitialValues.s  @0x3f2320
//
// STRUCT LAYOUT (recovered from calc* methods — the ones that actually touch fields)
// -----------------------------------------------------------------------------------
//   +0x1f0   OZChannel*   axisChannel        — read by calcMaskVecAndNewZ @0x3f115d
//                                              (addq $0x1f0, %rdi; then OZChannel::getValueAsInt)
//                                              tri-state int: 0 / 1 / 2  → axis selector.
//   +0x2f0   OZChannel*   orientChannel      — read by calcReorientMatrix @0x3f1219
//                                              (addq $0x2f0, %rdi; then OZChannel::getValueAsInt)
//                                              tri-state int: 0 (identity/no-op) / 1 (Rz90) / 2 (Ry90).
//
// RODATA constants used by calc*  (verified via `otool -X -v -s __TEXT __const Ozone`)
//   0x7053e0:  00 00 00 00 00 00 f0 3f            = 1.0     (double, 0x3ff0000000000000)
//   0x707728:  00 00 00 00 00 00 f0 bf            = -1.0    (double, 0xbff0000000000000)
//   0x706de0:  00 00 00 00 00 00 f0 3f            = 1.0     (first  of a 16-byte pair)
//   0x706de8:  00 00 00 00 00 00 f0 3f            = 1.0     (second of the 16-byte pair)
//
// -----------------------------------------------------------------------------
// PER-METHOD DECODE — the six PORTED methods (byte-verbatim)
// -----------------------------------------------------------------------------
//
// affectsRot()                                                    @0x3f29a0
//   pushq %rbp; movq %rsp,%rbp; movb $0x1,%al; popq %rbp; retq
//   → returns 1 (true).
//
// affectsX() @0x3f2970 / affectsY() @0x3f2980 / affectsZ() @0x3f2990
//   pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
//   → returns 0 (false).
//
// calcMaskVecAndNewZ(CMTime t, PCVector3<double>* mask, PCVector3<double>* newZ)  @0x3f1150
//   ; rdi=this, rsi=mask (was rdx in disasm but rsi after arg-shuffling — see comment), rdx=newZ
//   ; Actually the CMTime is passed by-value on the stack (16 bytes at rbp+0x10), and the two
//   ; PCVector3<double>* land in rsi (mask) and rdx (newZ) — but the compiler moves rdx→rbx and
//   ; rsi→r14 up front, then treats r14=mask, rbx=newZ for the rest.  Confirmed by the write
//   ; addresses (see below).
//   ;
//   ; The C++ signature per the mangled name:
//   ;    OZAlignSimBehavior::calcMaskVecAndNewZ(CMTime, PCVector3<double>*, PCVector3<double>*)
//   ; but ABI-wise CMTime (16-byte struct) is passed on the stack, so:
//   ;    %rdi = this
//   ;    %rsi = &mask    → moved to %r14
//   ;    %rdx = &newZ    → moved to %rbx
//   ;    [%rbp+0x10]     = CMTime  (16-byte struct)
//   ;
//   ; 0x3f115d  addq $0x1f0, %rdi              ; rdi = &this->axisChannel
//   ; 0x3f1164  leaq 0x10(%rbp), %rsi          ; rsi = &CMTime on stack
//   ; 0x3f1168  xorps %xmm0, %xmm0             ; xmm0 = 0.0 (tolerance)
//   ; 0x3f116b  callq OZChannel::getValueAsInt(CMTime const&, double) const   ; → eax = tri-state int
//   ; 0x3f1170  cmpl $0x2, %eax; je case2
//   ; 0x3f1175  cmpl $0x1, %eax; je case1
//   ; 0x3f117a  testl %eax, %eax; jne epilogue    ; → default (case0)
//   ;
//   ; case 0 (eax==0):    mask = (0.0, 1.0, 1.0);  newZ = (1.0, 0.0, 0.0)
//   ;   xorps xmm0; xorps xmm1; movhps [0x7053e0], xmm1 → xmm1 = (0.0, 1.0)
//   ;   movups xmm1, (r14)                              ; mask.x=0.0,  mask.y=1.0
//   ;   movabsq $0x3ff0000000000000, rax   (= 1.0)
//   ;   movq   rax, 0x10(r14)                           ; mask.z=1.0
//   ;   movq   rax, (rbx)                               ; newZ.x=1.0
//   ;   movups xmm0, 0x8(rbx)                           ; newZ.y=0.0, newZ.z=0.0
//   ;
//   ; case 1 (eax==1):    mask = (1.0, 0.0, 1.0);  newZ = (0.0, 1.0, 0.0)
//   ;   movsd  [0x7053e0], xmm0                          ; xmm0 = (1.0, 0.0)
//   ;   movups xmm0, (r14)                               ; mask.x=1.0, mask.y=0.0
//   ;   movabsq $0x3ff0000000000000, rax  (= 1.0)
//   ;   movq   rax, 0x10(r14)                            ; mask.z=1.0
//   ;   xorps  xmm0
//   ;   movhps [0x7053e0], xmm0                          ; xmm0 = (0.0, 1.0)
//   ;   movups xmm0, (rbx)                               ; newZ.x=0.0, newZ.y=1.0
//   ;   movq   $0x0, 0x10(rbx)                           ; newZ.z=0.0
//   ;
//   ; case 2 (eax==2):    mask = (1.0, 1.0, 0.0);  newZ = (0.0, 0.0, 1.0)
//   ;   movaps [0x706de0], xmm0                          ; xmm0 = (1.0, 1.0)  [16-byte load]
//   ;   movups xmm0, (r14)                               ; mask.x=1.0, mask.y=1.0
//   ;   movq   $0x0, 0x10(r14)                           ; mask.z=0.0
//   ;   xorps  xmm0
//   ;   movups xmm0, (rbx)                               ; newZ.x=0.0, newZ.y=0.0
//   ;   movabsq $0x3ff0000000000000, rax  (= 1.0)
//   ;   movq   rax, 0x10(rbx)                            ; newZ.z=1.0
//   ;
//   ; default (eax not 0/1/2): both outputs LEFT UNMODIFIED — the function returns immediately.
//   ;  (Actually eax==0 falls through to case0; the "jne epilogue" branch only fires for eax<0 or eax>=3.)
//
// calcReorientMatrix(CMTime t, PCMatrix33Tmpl<double>* m)          @0x3f1210
//   ; %rdi = this,  %rsi = &m  → moved to %rbx,  [%rbp+0x10] = CMTime
//   ;
//   ; PCMatrix33Tmpl<double> layout (verified by the store offsets 0x00..0x40 = 9 doubles):
//   ;    m[0] = @+0x00   m[1] = @+0x08   m[2] = @+0x10
//   ;    m[3] = @+0x18   m[4] = @+0x20   m[5] = @+0x28
//   ;    m[6] = @+0x30   m[7] = @+0x38   m[8] = @+0x40
//   ; (row-major 3x3 stored as 9 contiguous doubles.)
//   ;
//   ; 0x3f1219  addq $0x2f0, %rdi              ; rdi = &this->orientChannel
//   ; 0x3f1220  leaq 0x10(%rbp), %rsi          ; rsi = &CMTime on stack
//   ; 0x3f1224  xorps %xmm0, %xmm0             ; xmm0 = 0.0 (tolerance)
//   ; 0x3f1227  callq OZChannel::getValueAsInt(CMTime const&, double) const   ; → eax
//   ; 0x3f122c  cmpl $0x2, %eax; je case2
//   ; 0x3f122f  cmpl $0x1, %eax; jne epilogue      ; case 0 → do NOTHING (matrix untouched)
//   ;
//   ; case 1 (eax==1):  m = [ 0, 1, 0 ;  -1, 0, 0 ;  0, 0, 1 ]   (Rz(+90°))
//   ;   xorps  xmm0; xorps xmm1; movhps [0x7053e0], xmm1  → xmm1 = (0.0, 1.0)
//   ;   movups xmm1, (rbx)                                ; m[0]=0, m[1]=1
//   ;   movups xmm0, 0x30(rbx)                            ; m[6]=0, m[7]=0
//   ;   xorps  xmm1; movhps [0x707728], xmm1  → xmm1 = (0.0, -1.0)
//   ;   movups xmm1, 0x10(rbx)                            ; m[2]=0, m[3]=-1.0
//   ;   movups xmm0, 0x20(rbx)                            ; m[4]=0, m[5]=0
//   ;   movabsq $0x3ff0000000000000, rax  (= 1.0)
//   ;   movq   rax, 0x40(rbx)                             ; m[8]=1.0
//   ;
//   ; case 2 (eax==2):  m = [ 0, 0, 1 ;  0, 1, 0 ;  -1, 0, 0 ]   (Ry(+90°))
//   ;   xorps  xmm0; movups xmm0, (rbx)                   ; m[0]=0, m[1]=0
//   ;   movsd  [0x707728], xmm0   → xmm0 = (-1.0, 0.0)
//   ;   movups xmm0, 0x30(rbx)                            ; m[6]=-1.0, m[7]=0
//   ;   movsd  [0x7053e0], xmm0   → xmm0 = (1.0, 0.0)
//   ;   movups xmm0, 0x10(rbx)                            ; m[2]=1.0, m[3]=0
//   ;   movups xmm0, 0x20(rbx)                            ; m[4]=1.0, m[5]=0
//   ;   movq   $0x0, 0x40(rbx)                            ; m[8]=0.0
//   ;
//   ; case 0 (default): matrix is NOT written — caller must have initialized it.

import type { CMTime } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier types — kept minimal, opaque here.
// -----------------------------------------------------------------------------

/**
 * OZChannel — Ozone parameter-channel base. Only `getValueAsInt` is used from
 * this class; the full class port is a separate frontier item.
 *
 * @provenance Ozone @0x3f116b / 0x3f1227 (`callq OZChannel::getValueAsInt(CMTime const&, double) const`).
 */
export interface OZChannel {
  /** OZChannel::getValueAsInt(CMTime const&, double) const — mangled `__ZNK9OZChannel13getValueAsIntERK6CMTimed`. */
  getValueAsInt(t: CMTime, tolerance: number): number;
}

/**
 * PCVector3<double> — 3-double vector, layout `{ x @+0x00, y @+0x08, z @+0x10 }`.
 * Recovered from calcMaskVecAndNewZ store offsets @0x3f118b/0x3f119d/0x3f11a0.
 */
export interface PCVector3d {
  x: number; // @+0x00
  y: number; // @+0x08
  z: number; // @+0x10
}

/**
 * PCMatrix33Tmpl<double> — 3x3 double matrix, 9 contiguous doubles at
 * `{ m[0..8] @+0x00, +0x08, +0x10, +0x18, +0x20, +0x28, +0x30, +0x38, +0x40 }`.
 * Recovered from calcReorientMatrix store offsets @0x3f1243..0x3f1266 and
 * @0x3f1274..0x3f1293.
 */
export interface PCMatrix33d {
  m: [number, number, number, number, number, number, number, number, number];
}

// Un-ported ABI-opaque frontier types for the accum* stubs and ctors — only needed
// so the signatures line up.  They are declared as `unknown` marker interfaces so
// no ungrounded structural fields leak in.
export interface OZFactory { readonly __ozFactory: unique symbol }
export interface PCString { readonly __pcString: unique symbol }
export interface OZSimStateArray { readonly __ozSimStateArray: unique symbol }
export interface OZSimulationState { readonly __ozSimulationState: unique symbol }
export interface OZTransformNode { readonly __ozTransformNode: unique symbol }
export interface OZBehavior { readonly __ozBehavior: unique symbol }

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

/**
 * OZAlignSimBehavior — an OZBehavior subclass that aligns a simulation object
 * along a chosen principal axis. Two runtime OZChannel*s (`axisChannel @+0x1f0`,
 * `orientChannel @+0x2f0`) each read as a tri-state int and drive:
 *
 *   axisChannel  → { mask, newZ } used by particle-alignment force accumulation
 *   orientChannel → a 3x3 reorientation matrix (identity / Rz90 / Ry90)
 *
 * Only the constant-return and matrix-math parts are ported here; the two
 * `accumForces` / `accumInitialValues` overloads (which drive the actual
 * simulation-state update) are 531-line and 331-line bodies that call out to
 * OZSimulationState / OZTransformNode virtual dispatch — deferred as throwing
 * stubs with @0xADDR citations so the frontier is loud.
 *
 * @provenance Ozone 0x3efd30..0x3f29a7 (class byte range).
 */
export class OZAlignSimBehavior {
  /**
   * Runtime axis-mode channel — read at +0x1f0 by calcMaskVecAndNewZ.  Tri-state
   * `int` value (0/1/2) selects one of three (mask, newZ) presets.
   *
   * @provenance Ozone @0x3f115d `addq $0x1f0, %rdi` before OZChannel::getValueAsInt.
   */
  axisChannel!: OZChannel; // @+0x1f0

  /**
   * Runtime reorient-mode channel — read at +0x2f0 by calcReorientMatrix.
   * Tri-state `int` value (0/1/2) selects identity / Rz(+90°) / Ry(+90°).
   *
   * @provenance Ozone @0x3f1219 `addq $0x2f0, %rdi` before OZChannel::getValueAsInt.
   */
  orientChannel!: OZChannel; // @+0x2f0

  // ---------------------------------------------------------------------------
  // Constant returns: affectsRot / affectsX / affectsY / affectsZ
  // ---------------------------------------------------------------------------

  /**
   * affectsRot() — @Ozone 0x3f29a0.
   *
   *   pushq %rbp; movq %rsp,%rbp; movb $0x1,%al; popq %rbp; retq
   *
   * Returns `true`.  This behavior IS a rotation-affecting behavior.
   *
   * @provenance Ozone @0x3f29a4 (`movb $0x1, %al`).
   */
  affectsRot(): boolean {
    return true; // @0x3f29a4 `movb $0x1,%al`
  }

  /**
   * affectsX() — @Ozone 0x3f2970.
   *
   *   pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
   *
   * Returns `false` — this behavior does not affect the X translation channel.
   *
   * @provenance Ozone @0x3f2974 (`xorl %eax,%eax`).
   */
  affectsX(): boolean {
    return false; // @0x3f2974 `xorl %eax,%eax`
  }

  /**
   * affectsY() — @Ozone 0x3f2980.
   *
   *   pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
   *
   * Returns `false`.
   *
   * @provenance Ozone @0x3f2984 (`xorl %eax,%eax`).
   */
  affectsY(): boolean {
    return false; // @0x3f2984 `xorl %eax,%eax`
  }

  /**
   * affectsZ() — @Ozone 0x3f2990.
   *
   *   pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
   *
   * Returns `false`.
   *
   * @provenance Ozone @0x3f2994 (`xorl %eax,%eax`).
   */
  affectsZ(): boolean {
    return false; // @0x3f2994 `xorl %eax,%eax`
  }

  // ---------------------------------------------------------------------------
  // calcMaskVecAndNewZ — axis-selector output pair.
  // ---------------------------------------------------------------------------

  /**
   * calcMaskVecAndNewZ(t, mask, newZ) — @Ozone 0x3f1150.
   *
   * Reads `this->axisChannel` (`this + 0x1f0`) as an int via
   * OZChannel::getValueAsInt(t, 0.0) and dispatches on the returned tri-state:
   *
   *   axis == 0 :   mask = (0.0, 1.0, 1.0)   newZ = (1.0, 0.0, 0.0)     (fall-through case in asm)
   *   axis == 1 :   mask = (1.0, 0.0, 1.0)   newZ = (0.0, 1.0, 0.0)     (`cmpl $0x1; je`)
   *   axis == 2 :   mask = (1.0, 1.0, 0.0)   newZ = (0.0, 0.0, 1.0)     (`cmpl $0x2; je`)
   *   otherwise  :   outputs LEFT UNMODIFIED (`testl %eax,%eax; jne epilogue` @0x3f117a-0x3f117c)
   *
   * Note the fall-through branch: the asm order is `cmp 2 → je`, `cmp 1 → je`,
   * `test %eax → jne epilogue`, so `eax == 0` (or any zero from `testl`) falls
   * into the `case 0` block.  Non-{0,1,2} values (including negatives) exit
   * without touching either output vector.
   *
   * All double literals come from Ozone rodata:
   *   0x7053e0 = 1.0     (verified `otool -X -v -s __TEXT __const Ozone`)
   *   0x706de0..0x706def = (1.0, 1.0)   [movaps 16-byte load in case2]
   *
   * @provenance Ozone @0x3f1150..0x3f1208.
   */
  calcMaskVecAndNewZ(t: CMTime, mask: PCVector3d, newZ: PCVector3d): void {
    // @0x3f115d  addq $0x1f0, %rdi          ; rdi = &this->axisChannel
    // @0x3f1168  xorps %xmm0, %xmm0         ; tolerance = 0.0
    // @0x3f116b  callq OZChannel::getValueAsInt
    const axis = this.axisChannel.getValueAsInt(t, 0.0);

    // @0x3f1170  cmpl $0x2, %eax; je case2
    if (axis === 2) {
      // case 2 body: @0x3f11dd..0x3f1208
      // movaps [0x706de0] → xmm0 = (1.0, 1.0); movups xmm0,(r14) → mask.x=1, mask.y=1
      mask.x = 1.0; // @0x3f11e4 `movups %xmm0, (%r14)` (xmm0 = [1.0,1.0] @0x706de0/0x706de8)
      mask.y = 1.0; // @0x3f11e4 second lane
      mask.z = 0.0; // @0x3f11e8 `movq $0x0, 0x10(%r14)`
      // xorps xmm0; movups xmm0,(rbx) → newZ.x=0, newZ.y=0
      newZ.x = 0.0; // @0x3f11f3 `movups %xmm0, (%rbx)` (xmm0 = 0)
      newZ.y = 0.0; // @0x3f11f3 second lane
      // movabsq 1.0 → rax; movq rax,0x10(rbx) → newZ.z=1.0
      newZ.z = 1.0; // @0x3f11f6-0x3f1200 movabsq $0x3ff0000000000000, %rax; movq %rax, 0x10(%rbx)
      return;
    }

    // @0x3f1175  cmpl $0x1, %eax; je case1
    if (axis === 1) {
      // case 1 body: @0x3f11a9..0x3f11dc
      // movsd [0x7053e0] → xmm0 = (1.0, 0.0); movups xmm0,(r14) → mask.x=1.0, mask.y=0.0
      mask.x = 1.0; // @0x3f11b1 `movups %xmm0, (%r14)` low  (from `movsd [0x7053e0]`)
      mask.y = 0.0; // @0x3f11b1 high (movsd zero-extends)
      // movabsq 1.0 → rax; movq rax,0x10(r14) → mask.z=1.0
      mask.z = 1.0; // @0x3f11bf-0x3f11c3 movabsq $0x3ff0000000000000, %rax; movq %rax, 0x10(%r14)
      // xorps xmm0; movhps [0x7053e0], xmm0 → xmm0 = (0.0, 1.0); movups xmm0,(rbx) → newZ.x=0, newZ.y=1
      newZ.x = 0.0; // @0x3f11cd `movups %xmm0, (%rbx)` low (xorps set low=0)
      newZ.y = 1.0; // @0x3f11cd high (from `movhps [0x7053e0]`)
      // movq $0, 0x10(rbx) → newZ.z=0
      newZ.z = 0.0; // @0x3f11d0 `movq $0x0, 0x10(%rbx)`
      return;
    }

    // @0x3f117a  testl %eax, %eax; jne epilogue   ; non-zero & non-{1,2} exits untouched
    if (axis !== 0) {
      return; // @0x3f117c `jne 0x3f11a4` (epilogue)
    }

    // case 0 (fall-through, eax == 0): @0x3f117e..0x3f11a3
    // xorps xmm0; xorps xmm1; movhps [0x7053e0], xmm1 → xmm1 = (0.0, 1.0); movups xmm1,(r14) → mask.x=0, mask.y=1
    mask.x = 0.0; // @0x3f118b `movups %xmm1, (%r14)` low  (xorps set low=0)
    mask.y = 1.0; // @0x3f118b high (from `movhps [0x7053e0]`)
    // movabsq 1.0 → rax; movq rax,0x10(r14) → mask.z=1.0
    mask.z = 1.0; // @0x3f118f-0x3f1199 movabsq $0x3ff0000000000000, %rax; movq %rax, 0x10(%r14)
    // movq rax,(rbx) → newZ.x=1.0; movups xmm0,0x8(rbx) → newZ.y=0, newZ.z=0
    newZ.x = 1.0; // @0x3f119d `movq %rax, (%rbx)` (rax=1.0)
    newZ.y = 0.0; // @0x3f11a0 `movups %xmm0, 0x8(%rbx)` low (xmm0 = 0)
    newZ.z = 0.0; // @0x3f11a0 high
  }

  // ---------------------------------------------------------------------------
  // calcReorientMatrix — orient-selector 3x3 output.
  // ---------------------------------------------------------------------------

  /**
   * calcReorientMatrix(t, m) — @Ozone 0x3f1210.
   *
   * Reads `this->orientChannel` (`this + 0x2f0`) as an int via
   * OZChannel::getValueAsInt(t, 0.0) and dispatches:
   *
   *   orient == 1 :   m = [  0  1  0 ; -1  0  0 ;  0  0  1 ]   (Rz(+90°))
   *   orient == 2 :   m = [  0  0  1 ;  0  1  0 ; -1  0  0 ]   (Ry(+90°))
   *   orient == 0 :   MATRIX NOT WRITTEN — caller must have initialized it.
   *   otherwise   :   MATRIX NOT WRITTEN.
   *
   * The asm structure is `cmp 2 → je case2`, then `cmp 1 → jne epilogue`, so
   * only `orient == 1` and `orient == 2` write; everything else falls straight
   * through the (matrix-untouched) epilogue @0x3f126a.
   *
   * All double literals come from Ozone rodata:
   *   0x7053e0 = 1.0
   *   0x707728 = -1.0     (verified `otool -X -v -s __TEXT __const Ozone`)
   *
   * @provenance Ozone @0x3f1210..0x3f12a1.
   */
  calcReorientMatrix(t: CMTime, matrix: PCMatrix33d): void {
    // @0x3f1219  addq $0x2f0, %rdi        ; rdi = &this->orientChannel
    // @0x3f1224  xorps %xmm0, %xmm0        ; tolerance = 0.0
    // @0x3f1227  callq OZChannel::getValueAsInt
    const orient = this.orientChannel.getValueAsInt(t, 0.0);

    // @0x3f122c  cmpl $0x2, %eax; je case2
    if (orient === 2) {
      // case 2 body: @0x3f1271..0x3f12a1
      // xorps xmm0; movups xmm0, (rbx) → m[0]=0, m[1]=0
      matrix.m[0] = 0.0; // @0x3f1274 `movups %xmm0, (%rbx)` low  (xmm0 = 0)
      matrix.m[1] = 0.0; // @0x3f1274 high
      // movsd [0x707728] → xmm0 = (-1.0, 0.0); movups xmm0, 0x30(rbx) → m[6]=-1.0, m[7]=0.0
      matrix.m[6] = -1.0; // @0x3f127f `movups %xmm0, 0x30(%rbx)` low (from `movsd [0x707728]`)
      matrix.m[7] = 0.0;  // @0x3f127f high (movsd zero-extends)
      // movsd [0x7053e0] → xmm0 = (1.0, 0.0); movups xmm0, 0x10(rbx) → m[2]=1.0, m[3]=0.0
      matrix.m[2] = 1.0; // @0x3f128b `movups %xmm0, 0x10(%rbx)` low (from `movsd [0x7053e0]`)
      matrix.m[3] = 0.0; // @0x3f128b high
      // movups xmm0, 0x20(rbx)  (xmm0 unchanged = (1.0, 0.0)) → m[4]=1.0, m[5]=0.0
      matrix.m[4] = 1.0; // @0x3f128f `movups %xmm0, 0x20(%rbx)` low (xmm0 still = (1.0, 0.0))
      matrix.m[5] = 0.0; // @0x3f128f high
      // movq $0, 0x40(rbx) → m[8]=0.0
      matrix.m[8] = 0.0; // @0x3f1293 `movq $0x0, 0x40(%rbx)`
      return;
    }

    // @0x3f1231  cmpl $0x1, %eax; jne epilogue
    if (orient !== 1) {
      return; // @0x3f1234 `jne 0x3f126a` (epilogue) — matrix untouched
    }

    // case 1 body: @0x3f1236..0x3f1269
    // xorps xmm0; xorps xmm1; movhps [0x7053e0], xmm1 → xmm1 = (0.0, 1.0)
    // movups xmm1, (rbx) → m[0]=0.0, m[1]=1.0
    matrix.m[0] = 0.0; // @0x3f1243 `movups %xmm1, (%rbx)` low (xorps set low=0)
    matrix.m[1] = 1.0; // @0x3f1243 high (from `movhps [0x7053e0]`)
    // movups xmm0, 0x30(rbx) → m[6]=0.0, m[7]=0.0 (xmm0 = 0)
    matrix.m[6] = 0.0; // @0x3f1246 `movups %xmm0, 0x30(%rbx)` low
    matrix.m[7] = 0.0; // @0x3f1246 high
    // xorps xmm1; movhps [0x707728], xmm1 → xmm1 = (0.0, -1.0)
    // movups xmm1, 0x10(rbx) → m[2]=0.0, m[3]=-1.0
    matrix.m[2] = 0.0;  // @0x3f1254 `movups %xmm1, 0x10(%rbx)` low  (xorps set low=0)
    matrix.m[3] = -1.0; // @0x3f1254 high (from `movhps [0x707728]`)
    // movups xmm0, 0x20(rbx) → m[4]=0.0, m[5]=0.0
    matrix.m[4] = 0.0; // @0x3f1258 `movups %xmm0, 0x20(%rbx)` low
    matrix.m[5] = 0.0; // @0x3f1258 high
    // movabsq 1.0 → rax; movq rax, 0x40(rbx) → m[8]=1.0
    matrix.m[8] = 1.0; // @0x3f125c-0x3f1266 movabsq $0x3ff0000000000000, %rax; movq %rax, 0x40(%rbx)
  }

  // ---------------------------------------------------------------------------
  // Frontier stubs — full transcription is deferred; every stub cites @0xADDR.
  // ---------------------------------------------------------------------------

  /**
   * accumForces(states) — @Ozone 0x3f12b0.
   *
   * 531-line body: iterates an OZSimStateArray, dispatches through
   * OZSimulationState / OZTransformNode virtual slots, calls into OZChannel and
   * PCVector3<double>/PCMatrix33Tmpl<double> math.  Full transcription is
   * deferred because it requires OZSimStateArray / OZSimulationState /
   * OZTransformNode ports and PCMath primitives that are themselves frontier.
   *
   * @provenance Ozone @0x3f12b0 (raw-port/re/disasm/OZAlignSimBehavior.accumForces.s).
   */
  accumForces(_states: OZSimStateArray): void {
    throw new Error("OZAlignSimBehavior::accumForces(OZSimStateArray*) @0x3f12b0 not yet transcribed");
  }

  /**
   * accumForces(sim, node) — @Ozone 0x3f07c0. Overload of the above.
   *
   * @provenance Ozone @0x3f07c0.
   */
  accumForcesForNode(_sim: OZSimulationState, _node: OZTransformNode): void {
    throw new Error("OZAlignSimBehavior::accumForces(OZSimulationState*, OZTransformNode*) @0x3f07c0 not yet transcribed");
  }

  /**
   * accumInitialValues(states, i) — @Ozone 0x3f2320.
   *
   * 331-line body — deferred (see accumForces).
   *
   * @provenance Ozone @0x3f2320 (raw-port/re/disasm/OZAlignSimBehavior.accumInitialValues.s).
   */
  accumInitialValues(_states: OZSimStateArray, _i: number): void {
    throw new Error("OZAlignSimBehavior::accumInitialValues(OZSimStateArray*, int) @0x3f2320 not yet transcribed");
  }

  /**
   * accumInitialValues(sim, node) — @Ozone 0x3f1da0.  Overload of the above.
   *
   * @provenance Ozone @0x3f1da0.
   */
  accumInitialValuesForNode(_sim: OZSimulationState, _node: OZTransformNode): void {
    throw new Error("OZAlignSimBehavior::accumInitialValues(OZSimulationState*, OZTransformNode*) @0x3f1da0 not yet transcribed");
  }

  /**
   * operator=(OZBehavior const&) — @Ozone 0x3f0720.
   *
   * @provenance Ozone @0x3f0720.
   */
  assignFrom(_src: OZBehavior): OZAlignSimBehavior {
    throw new Error("OZAlignSimBehavior::operator=(OZBehavior const&) @0x3f0720 not yet transcribed");
  }

  // ---------------------------------------------------------------------------
  // Constructors — deferred pending OZFactory / OZBehavior / PCString ports.
  // ---------------------------------------------------------------------------

  /**
   * Static ctor(OZFactory*, PCString const&, unsigned int) — @Ozone 0x3f0070 (C1)
   * and @0x3efd30 (variant C2/thunk into base).
   *
   * @provenance Ozone @0x3f0070 / @0x3efd30.
   */
  static construct(_factory: OZFactory, _name: PCString, _flags: number): OZAlignSimBehavior {
    throw new Error("OZAlignSimBehavior::OZAlignSimBehavior(OZFactory*, PCString const&, unsigned int) @0x3f0070 / @0x3efd30 not yet transcribed");
  }

  /**
   * Copy ctor OZAlignSimBehavior(OZAlignSimBehavior&, unsigned int) — @Ozone 0x3f01f0
   * (C1) and @0x3f0080 (variant).
   *
   * @provenance Ozone @0x3f01f0 / @0x3f0080.
   */
  static copyConstruct(_src: OZAlignSimBehavior, _flags: number): OZAlignSimBehavior {
    throw new Error("OZAlignSimBehavior::OZAlignSimBehavior(OZAlignSimBehavior&, unsigned int) @0x3f01f0 / @0x3f0080 not yet transcribed");
  }

  /**
   * Destructor ~OZAlignSimBehavior() — three emitted variants:
   *   @0x3f04d0  D0  (deleting dtor)
   *   @0x3f0290  D1  (complete-object dtor)
   *   @0x3f0200  D2  (base-object dtor)
   *
   * @provenance Ozone @0x3f04d0 / @0x3f0290 / @0x3f0200.
   */
  destroy(): void {
    throw new Error("OZAlignSimBehavior::~OZAlignSimBehavior() @0x3f04d0 / @0x3f0290 / @0x3f0200 not yet transcribed");
  }
}
