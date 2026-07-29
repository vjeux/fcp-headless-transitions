// raw-port/src/render/HGLensDistort_kernel.ts
//
// FCP `HGLensDistort_kernel` — abstract base for the two per-mode
// lens-distortion kernels (distort + undistort). Each concrete
// subclass is a 0x200-byte HGNode subclass (see HGLensDistort.ts,
// which owns one instance of each).
//
// This file is the FAITHFUL transcription of the BASE-class methods
// __ZN20HGLensDistort_kernel* in Helium (x86_64 slice; file offset
// 0x4000; VAs as reported by `otool -tV`).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.HGLensDistort_kernel.s  (C2 @0x22a2c0)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.SetLensParams.s        (@0x22a0c0)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.SetParameter.s         (@0x22a460)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.GetParameter.s         (@0x22a5f0)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.GetOutput.s            (@0x22a380)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.GetROI.s               (@0x22a390)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.GetDOD.s               (@0x22a400)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.BindTexture.s          (@0x22a6e0)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.Bind.s                 (@0x22a780)
//   raw-port/re/disasm/Helium.HGLensDistort_kernel.~HGLensDistort_kernel.s (D0 @0x3c4a10)
//
// Ledger addresses (Helium.ledger.json):
//   0x22a0c0  HGLensDistort_kernel::SetLensParams(f, f, f, f, f, f, f)
//   0x22a2c0  HGLensDistort_kernel::HGLensDistort_kernel(unsigned int)  [C2]
//   0x22a380  HGLensDistort_kernel::GetOutput(HGRenderer*)
//   0x22a390  HGLensDistort_kernel::GetROI(HGRenderer*, int, HGRect)
//   0x22a400  HGLensDistort_kernel::GetDOD(HGRenderer*, int, HGRect)
//   0x22a460  HGLensDistort_kernel::SetParameter(int, f, f, f, f)
//   0x22a5f0  HGLensDistort_kernel::GetParameter(int, f*)
//   0x22a6e0  HGLensDistort_kernel::BindTexture(HGHandler*, int)
//   0x22a780  HGLensDistort_kernel::Bind(HGHandler*)
//   0x3c4a00  HGLensDistort_kernel::~HGLensDistort_kernel()  [D1 — ICF-folded with D0]
//   0x3c4a10  HGLensDistort_kernel::~HGLensDistort_kernel()  [D0 — body = `ud2` (trap)
//                                                             because this class is abstract]
//
// STRUCT LAYOUT (recovered from C2 @0x22a2c0 + SetParameter @0x22a460 +
// GetParameter @0x22a5f0 + SetLensParams @0x22a0c0 + Bind @0x22a780):
//   HGLensDistort_kernel : HGNode {
//     +0x000  vptr                       (installed at @0x22a2d1..@0x22a2d8
//                                         to vtable-for-HGLensDistort_kernel
//                                         at Helium 0xa32ee0)
//     +0x008..+0x0ff                     (HGNode base subobject)
//     +0x010  bits                       (HGNode flags word — modified by
//                                         `orl 0x10(%rbx), %ebx; andl ~0x600;
//                                         orl 0x400` @0x22a362..@0x22a372)
//     +0x0f0  int32  targetWidth         (int32, `cvtsi2ssl 0xf0` @0x22a743)
//     +0x0f4  int32  targetHeight        (int32, `cvtsi2ssl 0xf4` @0x22a74b)
//     +0x198  i64    dodXY               (`movq %rcx, 0x198(%rdi)` @0x22a407)
//     +0x1a0  i64    dodWH               (`movq %r8,  0x1a0(%rdi)` @0x22a40e)
//     +0x1a8  float  lensP0[0]           (SetLensParams param 0 → 0x1a8)
//     +0x1ac  float  lensP0[1]           (        param 1 → 0x1ac)
//     +0x1b0  float  lensP0[2]           (        param 2 → 0x1b0)
//     +0x1b4  float  lensP0[3]           (        param 3 → 0x1b4)
//     +0x1b8  float  lensP1[0]           (        param 4 → 0x1b8)
//     +0x1bc  float  lensP1[1]           (        param 5 → 0x1bc)
//     +0x1c0  float  lensP1[2]           (        param 6 → 0x1c0)
//     +0x1c4  float[4] derivedA          (        computed → 0x1c4..0x1d0
//                                         SIMD block)
//     +0x1d4  float                      (@0x22a22e movss xmm4, 0x1d4)
//     +0x1d8  float                      (@0x22a236 movss xmm3, 0x1d8)
//     +0x1dc  float                      (@0x22a23e movss xmm0, 0x1dc)
//     +0x1e0  float  1.0f                (C2 @0x22a319 writes 0x3f800000)
//     +0x1e4  float  2*tan(FOV/2)        (C2 @0x22a339 with FOV=0.5 rad; also
//                                         SetLensParams @0x22a257)
//     +0x1e8  float  1/(2*tan(FOV/2))    (C2 @0x22a34e; SetLensParams @0x22a25f)
//     +0x1f0  Uniform*  uniformBuffer    (`0x1f0(%rax)` in SetParameter reads
//                                         a pointer that owns the 4 x vec4
//                                         param block accessed with offsets
//                                         0x00/0x40/0x60/0x20 for slots
//                                         0/1/2/3; also used by Bind
//                                         @0x22a79e..@0x22a805)
//   }
//
// NOTE ON FLOAT PRECISION (Rule 4):
//   Every arithmetic op below matches the machine: `movss`/`mulss`/`divss`/
//   `cmpss` etc. are single-precision, so their TS ports wrap the result in
//   `Math.fround(...)`. The FOV/tan half-angle math is double-precision
//   (`cvtss2sd`, `mulsd`, `_tan`, `addsd`, `cvtsd2ss`) — those stay as
//   plain JS numbers (f64) and are `fround`-narrowed only at the store.
//
// CONST TARGETS READ FROM THE BINARY (RIP-relative resolved):
// Ctor constants (from `otool -tV` disasm; verified with resolve.py Helium const):
//   @0x88d410 = { 1.0, 1.0, 0.5, 0.5 } [4 x f32]  (movaps → +0x1a8)
//   @0x3c7c40 = { 1.0, 1.0, 1.0, 1.0 } [4 x f32]  (movaps → +0x1b8)
//   @0x88d420 = { 1.0, 1.0, 1.0, 0.5 } [4 x f32]  (movaps → +0x1c8)
//   @0x85f9c0 = { 0.5, 1.0 }           [2 x f32]  (movsd  → +0x1d8)
//   @0x3cc1c0 = 0.5                    [f64]      (movsd  → arg to _tan)
//   @0x3c7cc0 = 1.0                    [f32]      (movss  → dividend of divss)

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/** Opaque handle for Helium's `HGRenderer*`. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/** Opaque handle for Helium's `HGHandler*` (uniform/texture binder). */
export type HGHandlerPtr = { readonly __brand: "HGHandler" };

/**
 * Rectangle passed by value in HGRect ABI (two i64 packed into rcx:r8 = xy:wh).
 * FCP stores these as SIMD-packed 4x{i32} (see GetDOD @0x22a415..@0x22a427
 * `pinsrd 2/3` construction, and `cvtdq2ps xmm0` conversion to floats at
 * @0x22a43c which writes to `[uniformBuffer + 0x60]`).
 */
export interface HGRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * `HGLensDistort_kernel::HGLensDistort_kernel(unsigned int flags)` — base
 * constructor of the abstract kernel class.
 *
 * @Helium 0x22a2c0 (`__ZN20HGLensDistort_kernelC2Ej`).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.HGLensDistort_kernel.
 * HGLensDistort_kernel.s (37 lines):
 *
 *   0x22a2cc  callq __ZN6HGNodeC2Ev                  ; HGNode() base ctor
 *   0x22a2d1  leaq  0x808c08(%rip), %rax             ; = 0xa32ee0 (vtable)
 *   0x22a2d8  movq  %rax, (%r14)                     ; this->vptr = vtable
 *   0x22a2db  movaps 0x66312e(%rip), %xmm0           ; = @0x88d410 = {1,1,0.5,0.5}
 *   0x22a2e2  movups %xmm0, 0x1a8(%r14)              ; +0x1a8..+0x1b4 = lensP0
 *   0x22a2ea  movaps 0x19d94f(%rip), %xmm0           ; = @0x3c7c40 = {1,1,1,1}
 *   0x22a2f1  movups %xmm0, 0x1b8(%r14)              ; +0x1b8..+0x1c4 = lensP1
 *   0x22a2f9  movaps 0x663120(%rip), %xmm0           ; = @0x88d420 = {1,1,1,0.5}
 *   0x22a300  movups %xmm0, 0x1c8(%r14)              ; +0x1c8..+0x1d4 = derivedA
 *   0x22a308  movsd  0x6356b0(%rip), %xmm0           ; = @0x85f9c0 = {0.5f,1.0f}
 *   0x22a310  movsd  %xmm0, 0x1d8(%r14)              ; +0x1d8..+0x1e0 (two f32s)
 *   0x22a319  movl   $0x3f800000, 0x1e0(%r14)        ; +0x1e0 = 1.0f
 *   0x22a324  movsd  0x1a1e94(%rip), %xmm0           ; = @0x3cc1c0 = 0.5 (f64)
 *   0x22a32c  callq  _tan                            ; xmm0 = tan(0.5)
 *   0x22a331  addsd  %xmm0, %xmm0                    ; xmm0 = 2*tan(0.5)
 *   0x22a335  cvtsd2ss %xmm0, %xmm0                  ; narrow to f32
 *   0x22a339  movss  %xmm0, 0x1e4(%r14)              ; +0x1e4 = 2*tan(0.5)f
 *   0x22a342  movss  0x19d976(%rip), %xmm1           ; = @0x3c7cc0 = 1.0f
 *   0x22a34a  divss  %xmm0, %xmm1                    ; xmm1 = 1.0f / (2*tan(0.5))
 *   0x22a34e  movss  %xmm1, 0x1e8(%r14)              ; +0x1e8 = 1/(2*tan(0.5))f
 *   0x22a357  movq   $0, 0x1f0(%r14)                 ; uniformBuffer = null
 *   0x22a362  orl    0x10(%r14), %ebx                ; ebx |= this->bits
 *   0x22a366  andl   $~0x600, %ebx                   ; clear bits 9..10
 *   0x22a36c  orl    $0x400, %ebx                    ; set bit 10
 *   0x22a372  movl   %ebx, 0x10(%r14)                ; this->bits = ebx
 */
export function HGLensDistort_kernel_C2(
  self: HGLensDistort_kernelState,
  flags: number,
): void {
  // @0x22a2cc — call HGNode base ctor (frontier if HGNode.C2 not yet ported).
  HGNode_C2(self);
  // @0x22a2d1..@0x22a2d8 — install vtable pointer (vtable-for-HGLensDistort_kernel
  // at Helium 0xa32ee0). Modeled as a brand string here (we do not port vtables
  // as raw pointers; the two subclasses share this base install).
  self.__vptr = "vtable-for-HGLensDistort_kernel @Helium 0xa32ee0";
  // @0x22a2db..@0x22a2e2 — lensP0 = { 1.0f, 1.0f, 0.5f, 0.5f } from @0x88d410.
  self.lensP0 = [
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(0.5),
    Math.fround(0.5),
  ];
  // @0x22a2ea..@0x22a2f1 — lensP1 = { 1.0f, 1.0f, 1.0f, 1.0f } from @0x3c7c40.
  // (only the first 3 lanes are the exposed lensP1 fields at +0x1b8/+0x1bc/+0x1c0;
  // the 4th lane spills into +0x1c4 which is derivedA[0] and is immediately
  // overwritten by the next movups at +0x1c8..+0x1d4.)
  self.lensP1 = [Math.fround(1.0), Math.fround(1.0), Math.fround(1.0)];
  // @0x22a2f9..@0x22a300 — derivedA (4 floats) = { 1.0, 1.0, 1.0, 0.5 } from
  // @0x88d420. Written to +0x1c8..+0x1d4 as a 16-byte movups (overlapping the
  // spill lane from the previous movups; see comment above).
  self.derivedA = [
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(0.5),
  ];
  // @0x22a308..@0x22a310 — pair-of-floats at +0x1d8/+0x1dc = { 0.5f, 1.0f }
  // from @0x85f9c0 (moved as a movsd = 64 bits = two packed f32s).
  self.f1d8 = Math.fround(0.5);
  self.f1dc = Math.fround(1.0);
  // @0x22a319 — direct immediate store: +0x1e0 = 0x3f800000 = 1.0f.
  self.f1e0 = Math.fround(1.0);
  // @0x22a324..@0x22a339 — compute 2 * tan(0.5) as f32 → +0x1e4.
  //   tan is double-precision (@0x3cc1c0 = 0.5 as f64); we mirror by doing
  //   the tan on a plain JS number (f64), doubling it, then narrowing.
  const halfAngle = 0.5; // @0x3cc1c0 — 0.5 (f64)
  const twoTanHalf = Math.fround(2.0 * Math.tan(halfAngle));
  self.f1e4 = twoTanHalf;
  // @0x22a342..@0x22a34e — +0x1e8 = 1.0f / (2 * tan(0.5)) using divss (f32).
  //   The reciprocal is done on the ALREADY-NARROWED f32 (movss xmm1, 1.0f;
  //   divss xmm1, xmm0-which-was-cvtsd2ss'd). So do the reciprocal in f32.
  self.f1e8 = Math.fround(Math.fround(1.0) / twoTanHalf);
  // @0x22a357 — uniformBuffer at +0x1f0 initialized to null.
  self.uniformBuffer = null;
  // @0x22a362..@0x22a372 — flag manipulation:
  //     orl 0x10(%r14), %ebx  ; ebx = flags_arg | this->bits
  //     andl 0xfffff9ff, %ebx ; ebx &= ~0x600  (clear bits 9,10)
  //     orl  $0x400, %ebx     ; ebx |= 0x400   (set bit 10)
  //     movl %ebx, 0x10(%r14) ; this->bits = ebx
  const merged = (flags | (self.bits ?? 0)) >>> 0;
  const cleared = (merged & 0xfffff9ff) >>> 0;
  self.bits = (cleared | 0x400) >>> 0;
  // Fields the frontier stubs need to read but that C2 does not set are
  // initialized to safe defaults by HGNode_C2 above (per HGNode.ts layout).
  self.dodXY = 0;
  self.dodWH = 0;
}

/**
 * `HGLensDistort_kernel::~HGLensDistort_kernel()` — D0 (deleting) dtor.
 *
 * @Helium 0x3c4a10 (`__ZN20HGLensDistort_kernelD0Ev`).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.HGLensDistort_kernel.
 * ~HGLensDistort_kernel.s (5 lines): the body is `ud2` (abort). This class
 * is abstract; the deleting virtual destructor is a hard trap because no
 * direct instances of the base ever exist — the two concrete subclasses
 * own their own D0 slots.
 *
 *   0x3c4a10  pushq %rbp
 *   0x3c4a11  movq  %rsp, %rbp
 *   0x3c4a14  ud2
 */
export function HGLensDistort_kernel_D0(
  _self: HGLensDistort_kernelState,
): never {
  throw new Error(
    "HGLensDistort_kernel::~HGLensDistort_kernel (D0 deleting dtor) @Helium 0x3c4a10 traps (ud2): abstract class has no direct instances",
  );
}

/**
 * `HGLensDistort_kernel::~HGLensDistort_kernel()` — D1 (complete-object) dtor.
 *
 * @Helium 0x3c4a00 (`__ZN20HGLensDistort_kernelD1Ev`).
 *
 * The 16 raw bytes at file offset 0x3c4a00 are byte-for-byte identical to
 * the D0 body (`55 48 89 e5 0f 0b 66 2e 0f 1f 84 00 00 00 00 00`) — verified
 * by reading /tmp/Helium.x86_64 at both offsets. It is ICF-folded with D0
 * and is likewise `ud2`. (`nm -n` reports D1 at 0x3c4a00 and D0 at 0x3c4a10;
 * `otool -tV` emits only the D0 label because ICF.)
 */
export function HGLensDistort_kernel_D1(
  _self: HGLensDistort_kernelState,
): never {
  throw new Error(
    "HGLensDistort_kernel::~HGLensDistort_kernel (D1 complete-object dtor) @Helium 0x3c4a00 traps (ud2, ICF-folded with D0): abstract class has no direct instances",
  );
}

/**
 * `HGLensDistort_kernel::GetOutput(HGRenderer*)` — returns `this`.
 *
 * @Helium 0x22a380 (`__ZN20HGLensDistort_kernel9GetOutputEP10HGRenderer`).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.HGLensDistort_kernel.
 * GetOutput.s (7 lines) — pure identity:
 *
 *   0x22a380  pushq %rbp
 *   0x22a381  movq  %rsp, %rbp
 *   0x22a384  movq  %rdi, %rax      ; rax = this
 *   0x22a387  popq  %rbp
 *   0x22a388  retq
 */
export function HGLensDistort_kernel_GetOutput(
  self: HGLensDistort_kernelState,
  _renderer: HGRendererPtr,
): HGLensDistort_kernelState {
  return self;
}

/**
 * `HGLensDistort_kernel::SetParameter(int slot, f, f, f, f)` — write a
 * 4-float parameter slot into the kernel's uniform buffer, only if it
 * differs from the current value (then call HGNode::ClearBits()).
 *
 * @Helium 0x22a460 (`__ZN20HGLensDistort_kernel12SetParameterEiffff`).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.HGLensDistort_kernel.
 * SetParameter.s (116 lines). The function is a computed jump on the
 * `slot` argument (%esi):
 *
 *   0x22a460  cmpl $0x3, %esi
 *   0x22a463  ja   0x22a5c9        ; slot > 3 → return -1
 *   0x22a469..0x22a479  jump-table dispatch (leaq 0x162(%rip), %rcx; jmpq *rax)
 *
 * The jump-table (four 32-bit rip-relative offsets at 0x22a5d3) selects
 * one of four blocks that read `this->uniformBuffer` (at +0x1f0) and
 * compare-then-write 4 floats at a slot-specific offset:
 *
 *   slot 0 → uniformBuffer[+0x00..+0x0c]       (block @0x22a47b..@0x22a4c8)
 *   slot 1 → uniformBuffer[+0x40..+0x4c]       (block @0x22a4cd..@0x22a51c)
 *   slot 2 → uniformBuffer[+0x60..+0x6c]       (block @0x22a521..@0x22a56c)
 *   slot 3 → uniformBuffer[+0x20..+0x2c]       (block @0x22a56e..@0x22a5b9)
 *
 * Each block:
 *   - loads uniformBuffer via `movq 0x1f0(%rdi), %rax`
 *   - compares old[0..3] to xmm0..xmm3 with `ucomiss ...; jne .diff; jp .diff`
 *     — jne handles ordered-differ, jp handles unordered (NaN) as "differ".
 *   - if all four lanes match (jnp falls through) → jump to 0x22a5cf, return 0
 *     (nothing changed).
 *   - if any lane differs → `movss` the 4 args to old[0..3] and fall through
 *     to 0x22a5b9 which sets up a stack frame, calls HGNode::ClearBits(),
 *     and returns 1.
 *
 * Return value: 1 (changed), 0 (unchanged), -1 (bad slot).
 */
export function HGLensDistort_kernel_SetParameter(
  self: HGLensDistort_kernelState,
  slot: number,
  x: number,
  y: number,
  z: number,
  w: number,
): number {
  // @0x22a460..@0x22a463 — slot > 3 → return -1.
  if ((slot >>> 0) > 3) {
    return -1;
  }
  // @0x22a469..@0x22a479 — jump-table on slot. The four slot→offset
  // mappings are:
  //   slot 0 → +0x00, slot 1 → +0x40, slot 2 → +0x60, slot 3 → +0x20.
  const slotOffset = [0x00, 0x40, 0x60, 0x20][slot];
  const buf = self.uniformBuffer;
  if (buf === null) {
    throw new Error(
      "HGLensDistort_kernel::SetParameter @Helium 0x22a460 called before uniformBuffer allocated (frontier: uniformBuffer allocator not yet transcribed)",
    );
  }
  // @0x22a482..@0x22a4af (and parallel blocks) — compare all 4 lanes with
  // ucomiss + jne/jp. `ucomiss a, b` sets ZF=1 iff a==b (unordered = jp=1),
  // so the "any lane differs" path is taken when EITHER jne is true OR the
  // parity flag is set (any operand was NaN). Using `!==` (not Object.is)
  // matches the NaN-ordered idiom: NaN !== NaN is true, so any NaN pair
  // takes the differ path — exactly like `ucomiss + jne/jp` @0x22a486..@0x22a4b3.
  const base = slotOffset >>> 2; // f32 index (slotOffset bytes / 4)
  const old0 = Math.fround(buf.floats[base + 0]);
  const old1 = Math.fround(buf.floats[base + 1]);
  const old2 = Math.fround(buf.floats[base + 2]);
  const old3 = Math.fround(buf.floats[base + 3]);
  const nx = Math.fround(x);
  const ny = Math.fround(y);
  const nz = Math.fround(z);
  const nw = Math.fround(w);
  const same = old0 === nx && old1 === ny && old2 === nz && old3 === nw;
  if (same) {
    // @0x22a5cf..@0x22a5d1 — return 0 (unchanged).
    return 0;
  }
  // @0x22a4b5..@0x22a4c3 (and parallel blocks) — write the 4 floats.
  buf.floats[base + 0] = nx;
  buf.floats[base + 1] = ny;
  buf.floats[base + 2] = nz;
  buf.floats[base + 3] = nw;
  // @0x22a5b9..@0x22a5c8 — set up frame, call HGNode::ClearBits(), return 1.
  HGNode_ClearBits(self);
  return 1;
}

/**
 * `HGLensDistort_kernel::GetParameter(int slot, float* out)` — read a
 * 4-float parameter slot into `out[0..3]`.
 *
 * @Helium 0x22a5f0 (`__ZN20HGLensDistort_kernel12GetParameterEiPf`).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.HGLensDistort_kernel.
 * GetParameter.s (66 lines). Same jump-table structure as SetParameter
 * over slots 0..3 → offsets {+0x00, +0x40, +0x60, +0x20}. Each block:
 *   - reads `this->uniformBuffer` (@+0x1f0)
 *   - copies the first 3 floats verbatim
 *   - then reads the 4th float via a shared `movss (%rax), xmm0; movss xmm0, 0xc(%rdx)`
 *     after advancing rax to point at the 4th-float slot.
 *
 * Returns 0 on success, -1 on bad slot.
 */
export function HGLensDistort_kernel_GetParameter(
  self: HGLensDistort_kernelState,
  slot: number,
  out: Float32Array,
): number {
  // @0x22a5f0..@0x22a5f3 — slot > 3 → return -1.
  if ((slot >>> 0) > 3) {
    return -1;
  }
  // @0x22a5f9..@0x22a60d — jump-table dispatch (same table shape as SetParameter).
  const slotOffset = [0x00, 0x40, 0x60, 0x20][slot];
  const buf = self.uniformBuffer;
  if (buf === null) {
    throw new Error(
      "HGLensDistort_kernel::GetParameter @Helium 0x22a5f0 called before uniformBuffer allocated (frontier: uniformBuffer allocator not yet transcribed)",
    );
  }
  // Each block copies 3 floats + advances rax by (offset+0xc) then a shared
  // tail reads the 4th float. The net effect is: out[0..3] = buf[offset..offset+3].
  const base = slotOffset >>> 2;
  out[0] = Math.fround(buf.floats[base + 0]);
  out[1] = Math.fround(buf.floats[base + 1]);
  out[2] = Math.fround(buf.floats[base + 2]);
  out[3] = Math.fround(buf.floats[base + 3]);
  // @0x22a6bd..@0x22a6c0 — return 0.
  return 0;
}

// ─── Undecoded frontier — stubs (Rule 3: throw, cite @0xADDR) ──────────────

/**
 * `HGLensDistort_kernel::SetLensParams(f, f, f, f, f, f, f)` — recompute
 * derived uniform block (focal length, epsilons, scale factors) from a
 * 7-float lens parameter set.
 *
 * @Helium 0x22a0c0 (`__ZN20HGLensDistort_kernel13SetLensParamsEfffffff`).
 *
 * NOT YET TRANSCRIBED. 91-line dense SIMD math: fabs mask (@0x3c7c30),
 * FOV clamp against π (@0x3d23f8 f64, @0x3d2388 f32), 4-lane packed
 * subtraction/division with divisor-floor @0x3d89d0, half-angle tan
 * (`_tan` @f64 0.5·xmm0 → cvtsd2ss → divss 1.0f), tail-jmp to vtable
 * *0x240 (concrete subclass hook). The math is decodable but requires a
 * separate pass to model the parallel-lane packing exactly; leaving as
 * a throwing stub per PORTING_SPEC Rule 3.
 */
export function HGLensDistort_kernel_SetLensParams(
  _self: HGLensDistort_kernelState,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
  _e: number,
  _f: number,
  _g: number,
): void {
  throw new Error(
    "HGLensDistort_kernel::SetLensParams @Helium 0x22a0c0 not yet transcribed (91-line SIMD; needs parallel-lane packing pass; then vtable *0x240 tail-jmp to concrete subclass)",
  );
}

/**
 * `HGLensDistort_kernel::GetROI(HGRenderer*, int, HGRect)` — compute the
 * kernel's region-of-interest by intersecting the caller-supplied input
 * rect with the current DOD (stored at +0x198/+0x1a0), then padding the
 * result by a fixed offset.
 *
 * @Helium 0x22a390 (`__ZN20HGLensDistort_kernel6GetROIEP10HGRendereri6HGRect`).
 *
 * Body (30 lines):
 *   0x22a39c  movq (%rdi), %rax; callq *0x230(%rax)    ; virtual: this->vt[0x230]
 *                                                        (concrete subclass hook)
 *   0x22a3a8  movq 0x198(%rbx), %r8                    ; dod.xy
 *   0x22a3af  movq 0x1a0(%rbx), %rcx                   ; dod.wh
 *   0x22a3bc  callq _HGRectIntersection                ; external HGRect helper
 *   0x22a3c4..0x22a3ec  paddq/pblendw/paddq            ; pad by two 128-bit
 *                                                        constants at
 *                                                        [0x663056 rip] and
 *                                                        [0x663054 rip]
 *
 * Both constants live in Helium's __const and are NOT YET decoded here
 * (they are not simple 0/1 rects — they encode the ROI slack). Deferring.
 */
export function HGLensDistort_kernel_GetROI(
  _self: HGLensDistort_kernelState,
  _renderer: HGRendererPtr,
  _input: number,
  _rect: HGRect,
): HGRect {
  throw new Error(
    "HGLensDistort_kernel::GetROI @Helium 0x22a390 not yet transcribed (needs vtable *0x230 subclass hook + _HGRectIntersection external + two __const pad vectors at Helium __const)",
  );
}

/**
 * `HGLensDistort_kernel::GetDOD(HGRenderer*, int, HGRect)` — record the
 * caller-supplied DOD rect into +0x198/+0x1a0 and push its 4-lane float
 * form into the uniform buffer at +0x60, then tail-jmp to the vtable
 * *0x238 concrete-subclass hook.
 *
 * @Helium 0x22a400 (`__ZN20HGLensDistort_kernel6GetDODEP10HGRendereri6HGRect`).
 *
 * Body (21 lines):
 *   0x22a407  movq %rcx, 0x198(%rdi)              ; this->dod.xy = rect.xy
 *   0x22a40e  movq %r8,  0x1a0(%rdi)              ; this->dod.wh = rect.wh
 *   0x22a415..0x22a427  build xmm0 as 4×i32 = { x, y, w, h }
 *   0x22a42d  paddd 0x66301b(%rip), %xmm0         ; pad by a __const 4×i32
 *   0x22a43c  cvtdq2ps %xmm0, %xmm0               ; → 4×f32
 *   0x22a43f  movups %xmm0, 0x60(%rax)            ; uniformBuffer[+0x60] = padded rect
 *   0x22a446  movq  0x238(%rax), %rax             ; virtual: this->vt[0x238]
 *   0x22a450  jmpq  *%rax                         ; tail-call subclass hook
 *
 * The pad constant at Helium __const 0x88d454 (= 0x22a42d + 7 + 0x66301b)
 * is not yet decoded; the tail-jmp depends on the concrete subclass hook.
 * Deferring.
 */
export function HGLensDistort_kernel_GetDOD(
  _self: HGLensDistort_kernelState,
  _renderer: HGRendererPtr,
  _input: number,
  _rect: HGRect,
): void {
  throw new Error(
    "HGLensDistort_kernel::GetDOD @Helium 0x22a400 not yet transcribed (needs __const pad vector at Helium 0x88d454 + vtable *0x238 tail-jmp to concrete subclass)",
  );
}

/**
 * `HGLensDistort_kernel::BindTexture(HGHandler*, int)` — bind the input
 * texture to the kernel's shader unit, with a conditional bilinear-filter
 * upgrade path.
 *
 * @Helium 0x22a6e0 (`__ZN20HGLensDistort_kernel11BindTextureEP9HGHandleri`).
 *
 * Body (46 lines) — GPU binding facade:
 *   - calls `HGRenderer::GetTarget(0x60000)` off the HGHandler's
 *     renderer at +0x90;
 *   - if the returned target is either (a) `>= BufferReformatter::~D2` (an
 *     unusual pointer-compare that acts as a "is a BufferReformatter"
 *     RTTI check) OR (b) falls in the range [BufferReformatter::~D2 -
 *     0x60300, ...+0xf0], calls vtable *0x48 with (0, 0) then vtable
 *     *0x30 with (1, 1) — enabling bilinear filtering;
 *   - loads +0xf0 and +0xf4 (targetWidth/height as i32), converts to f32,
 *     and calls vtable *0x88 with (slot=4, xmm0=w, xmm1=h, xmm2=0, xmm3=0)
 *     — uploading the target-size uniform.
 *
 * All three vtable slots (*0x48 SetTexParam, *0x30 SetSampler, *0x88
 * SetShaderUniform) belong to HGHandler and are not yet decoded.
 * Deferring.
 */
export function HGLensDistort_kernel_BindTexture(
  _self: HGLensDistort_kernelState,
  _handler: HGHandlerPtr,
  _unit: number,
): number {
  throw new Error(
    "HGLensDistort_kernel::BindTexture @Helium 0x22a6e0 not yet transcribed (needs HGRenderer::GetTarget + HGHandler vtables *0x30/*0x48/*0x88)",
  );
}

/**
 * `HGLensDistort_kernel::Bind(HGHandler*)` — push 4×vec4 uniforms from
 * `this->uniformBuffer` at strides 0/0x20/0x40/0x60 into shader uniform
 * slots 0/1/2/3, after calling HGHandler::TexCoord(0,0,0,null).
 *
 * @Helium 0x22a780 (`__ZN20HGLensDistort_kernel4BindEP9HGHandler`).
 *
 * Body (46 lines):
 *   0x22a799  callq __ZN9HGHandler8TexCoordEiiiPKd    ; TexCoord(0,0,0,0)
 *   0x22a79e..0x22a7b2  vt[0x90](handler, slot=0, uniformBuffer+0x00, 1)
 *   0x22a7b8..0x22a7d3  vt[0x90](handler, slot=1, uniformBuffer+0x20, 1)
 *   0x22a7d9..0x22a7f4  vt[0x90](handler, slot=2, uniformBuffer+0x40, 1)
 *   0x22a7fa..0x22a815  vt[0x90](handler, slot=3, uniformBuffer+0x60, 1)
 *   0x22a81b  xorl %eax, %eax; ret                     ; returns 0
 *
 * HGHandler::TexCoord + vtable *0x90 (SetShaderUniformVec4 / Push4fv) are
 * not yet decoded; deferring.
 */
export function HGLensDistort_kernel_Bind(
  _self: HGLensDistort_kernelState,
  _handler: HGHandlerPtr,
): number {
  throw new Error(
    "HGLensDistort_kernel::Bind @Helium 0x22a780 not yet transcribed (needs HGHandler::TexCoord + vtable *0x90 for 4× uniform push)",
  );
}

// ─── State struct + frontier stubs for cross-class references ──────────────

/**
 * TypeScript mirror of the `HGLensDistort_kernel` object layout described
 * in the file header. Only the fields actually accessed by ported methods
 * carry decoded types; fields the frontier stubs will need are declared
 * so callers can allocate a shape that will still be valid once the
 * frontier lands.
 */
export interface HGLensDistort_kernelState extends HGNode {
  __vptr: string;
  /** +0x1a8..+0x1b4 — SetLensParams param 0..3 initial value. */
  lensP0: [number, number, number, number];
  /** +0x1b8..+0x1c0 — SetLensParams param 4..6 initial value. */
  lensP1: [number, number, number];
  /** +0x1c8..+0x1d4 — derived-A 4-float SIMD block. */
  derivedA: [number, number, number, number];
  /** +0x1d8 — from @0x85f9c0 low lane. */
  f1d8: number;
  /** +0x1dc — from @0x85f9c0 high lane. */
  f1dc: number;
  /** +0x1e0 — 1.0f. */
  f1e0: number;
  /** +0x1e4 — 2 * tan(0.5). */
  f1e4: number;
  /** +0x1e8 — 1 / (2 * tan(0.5)). */
  f1e8: number;
  /** +0x1f0 — pointer to uniform buffer (holds the 4 vec4 SetParameter slots). */
  uniformBuffer: HGLensDistortUniformBuffer | null;
  /** +0x10 — HGNode flags word (RMW in C2 with mask ~0x600 | 0x400). */
  bits: number;
  /** +0xf0 — targetWidth (i32). */
  targetWidth?: number;
  /** +0xf4 — targetHeight (i32). */
  targetHeight?: number;
  /** +0x198 — dod.xy (packed i64). */
  dodXY: number;
  /** +0x1a0 — dod.wh (packed i64). */
  dodWH: number;
}

/**
 * The 128+ byte uniform block pointed at by `uniformBuffer` at +0x1f0.
 * SetParameter/GetParameter treat it as an array of f32 laid out with
 * per-slot 16-byte strides:
 *   slot 0 → floats[0..3]     (+0x00)
 *   slot 3 → floats[8..11]    (+0x20)
 *   slot 1 → floats[16..19]   (+0x40)
 *   slot 2 → floats[24..27]   (+0x60)
 *
 * (The concrete allocator lives in an as-yet-undecoded HGNode / HGRenderer
 * setup hook. The shape here is faithful to the SetParameter offsets.)
 */
export interface HGLensDistortUniformBuffer {
  floats: Float32Array;
}

/**
 * Frontier: `HGNode::HGNode()` base ctor @Helium __ZN6HGNodeC2Ev, called
 * from HGLensDistort_kernel::C2 @0x22a2cc. Not yet transcribed here
 * (HGNode.ts in the tree does not currently export a callable C2).
 */
function HGNode_C2(_self: HGNode): void {
  throw new Error(
    "HGNode::HGNode() base ctor @Helium __ZN6HGNodeC2Ev not yet transcribed (called from HGLensDistort_kernel::C2 @0x22a2cc)",
  );
}

/**
 * Frontier: `HGNode::ClearBits()` @Helium __ZN6HGNode9ClearBitsEv, called
 * from SetParameter's "changed" tail @0x22a5bd. Not yet transcribed.
 */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits @Helium __ZN6HGNode9ClearBitsEv not yet transcribed (called from HGLensDistort_kernel::SetParameter @0x22a5bd)",
  );
}
