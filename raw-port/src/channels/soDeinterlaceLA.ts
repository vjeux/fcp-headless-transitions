// soDeinterlaceLA.ts — Helium soDeinterlaceLA: a per-tile line-average
// deinterlace channel operator. This class inherits from Hgc2DeinterlaceLA
// and overrides four methods: GetROI, RenderTile, and the standard C++
// D1/D0 destructor pair.
//
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.soDeinterlaceLA.GetROI.s
//   raw-port/re/disasm/Helium.soDeinterlaceLA.RenderTile.s
//   raw-port/re/disasm/Helium.soDeinterlaceLA.D1.s
//   raw-port/re/disasm/Helium.soDeinterlaceLA.D0.s
//
// Helium symbols transcribed:
//   @0x0003e390  soDeinterlaceLA::GetROI(HGRenderer*, int, HGRect)
//   @0x0003e480  soDeinterlaceLA::RenderTile(HGTile*)          — SIMD kernel, throw-stub
//   @0x0003e930  soDeinterlaceLA::~soDeinterlaceLA()  (D1)
//   @0x0003e940  soDeinterlaceLA::~soDeinterlaceLA()  (D0)
//
// Called stubs / data (from otool -tV comments):
//   _HGRectNull                     Helium data symbol; RIP-load @0x0003e3b1 (GetROI which-!=-0 path)
//   _HGRectMake4i                   HGRectMake4i(int,int,int,int)
//                                   callq @0x0003e407 (GetROI)
//   _HGRectGrow                     HGRectGrow(HGRect, HGRect)
//                                   callq @0x0003e418 (GetROI)
//   ___stack_chk_guard              stack canary (compiler-emitted, not
//                                   surfaced in TS since JS has no stack
//                                   canary; canary loads are documented
//                                   @0x0003e39f/@0x0003e3c6/@0x0003e460)
//   ___stack_chk_fail               callq @0x0003e474 (canary mismatch;
//                                   process abort — unreachable in a
//                                   correct execution, not surfaced in TS)
//   vtable slot @0x68               virtual call `callq *0x68(%rax)`
//                                   @0x0003e436 — a member of self's own
//                                   vtable (rax = *(void**)%rdi) that
//                                   writes an HGRectf (4×float32) to a
//                                   caller-supplied out pointer. Not yet
//                                   decoded; treated as a throw-stub.
//   __ZN17Hgc2DeinterlaceLAD2Ev     Hgc2DeinterlaceLA::~Hgc2DeinterlaceLA()
//                                   tail-jmp @0x0003e935 (from D1)
//                                   callq   @0x0003e949 (from D0)
//   __ZN8HGObjectdlEPv              HGObject::operator delete(void*)
//                                   tail-jmp @0x0003e957 (from D0)
//
// Literal-pool constants (RIP-relative loads inside RenderTile):
//   @0x003c7c70    16 bytes = {0.5, 0.5, 0.5, 0.5}   float4  broadcast
//                  scale used by the 2-tap line-average kernel (loaded into
//                  xmm2 at RenderTile @0x0003e54a / @0x0003e57b — same
//                  literal address in both spots). Verified by xxd of the
//                  Helium x86_64 slice at file-offset 0x003c7c70+0x4000
//                  (FAT prefix): four "00 00 00 3f" = four float32(0.5).
//   Other RenderTile RIP loads at @0x0003e4cf / @0x0003e4e6 are undecoded
//   here; they participate in the intra-loop y-index math on the SIMD
//   kernel — see the RenderTile throw-stub.
//
// Frontier callees (not-yet-transcribed):
//   HgcNode::vfn_at_vtable_offset_0x68(int, HGRectf*)  — throw-stub
//   Hgc2DeinterlaceLA::~Hgc2DeinterlaceLA()            — throw-stub
//   HGObject::operator delete(void*)                    — JS GC; documented only
//   soDeinterlaceLA::RenderTile(HGTile*)                — ~150 lines of
//     SIMD line-average with boundary handling; decoded to schematic
//     level but body not fully transcribed at @0x0003e480.
//     Full RenderTile port needs HGTile struct layout decoded elsewhere
//     in raw-port; the throw-stub below cites @0x0003e480.

import {
  HGRect,
  HGRectNull as HGRectNullConst,
  HGRectMake4i,
  HGRectGrow,
} from "../render/HGRect.js";
import type { HGRectf } from "../render/HGRect.js";
export { HGRect };

// ---------------------------------------------------------------------------
// Frontier types
// ---------------------------------------------------------------------------

/** HGTile — the per-tile render descriptor passed to RenderTile. Layout
 *  not yet decoded. Reads observed in RenderTile at offsets:
 *    +0x00  (int32 x_first, via `movl (%r8), %ecx` @0x0003e4a9 negation
 *            with +0x08)
 *    +0x04  (int32 y_first, via `movl 0x4(%rsi), %eax` @0x0003e491)
 *    +0x08  (int32 x_last,  via `movl 0x8(%r8), %ecx` @0x0003e4a5)
 *    +0x0c  (int32 y_last,  via `cmpl %eax, 0xc(%rsi)` @0x0003e498)
 *    +0x10  (row_ptrs*,     via `movq 0x10(%r8), %rdi` @0x0003e508)
 *    +0x18  (int32 field_1, via `movslq 0x18(%r8), %r14` @0x0003e4bb)
 *    +0x30  (float* p0,     via `movq 0x30(%rdi), %rcx` @0x0003e4b3
 *            — indexed from `self`, not %r8; contains 3 float coefficients
 *            read via `cvttss2si` at +0x0/+0x4/+0x8)
 *    +0x50  (row_stride?,   via `movq 0x50(%r8), %r12` @0x0003e50c)
 *    +0x58  (int32 field_2, via `movslq 0x58(%r8), %r10` @0x0003e4af)
 *  Full layout not decoded here. */
export interface HGTile {}

/** HGRenderer — opaque render context; not read by GetROI here. */
export interface HGRenderer {}

/** Hgc2DeinterlaceLA — the Helium base class of soDeinterlaceLA. Only its
 *  destructor is referenced from this file (@0x0003e935 tail-jmp from D1,
 *  @0x0003e949 callq from D0). */
export interface Hgc2DeinterlaceLA {
  /** Hgc2DeinterlaceLA::~Hgc2DeinterlaceLA() @Helium — base destructor.
   *  Not yet transcribed. */
  __dtor_base(): void;

  /** Self's own vtable slot at byte offset 0x68 — a virtual function
   *  invoked in GetROI as `callq *0x68(%rax)` @0x0003e436 with the arg
   *  pattern `(self, 0, HGRectf* out)`. Writes 4 float32s to `out`. Not
   *  yet decoded (which subclass override lives in slot 0x68 depends on
   *  the concrete instance). */
  __vfn_at_0x68(index: number, out: HGRectf): void;
}

/** soDeinterlaceLA — the class this file transcribes. Adds no new fields
 *  we read (GetROI only calls a virtual on the base sub-object). */
export interface soDeinterlaceLA extends Hgc2DeinterlaceLA {}

// ---------------------------------------------------------------------------
// soDeinterlaceLA::GetROI(HGRenderer*, int, HGRect) @Helium 0x0003e390
//
// Faithful to raw-port/re/disasm/Helium.soDeinterlaceLA.GetROI.s.
//
// ABI: %rdi=self, %rsi=renderer, %edx=which, %rcx=inRect.lo, %r8=inRect.hi.
// Returns HGRect in {rax, rdx}.
//
// Prologue @0x0003e390-@0x0003e39b: save r15/r14/r12/rbx, subq $0x20 (stack
// scratch for HGRectf; the compiler also stores/checks a stack canary at
// -0x28(%rbp) via the ___stack_chk_guard loads @0x0003e39f/@0x0003e3c6/
// @0x0003e460 and the abort call @0x0003e474 — these do not affect the
// return value and are omitted from the TS transcription).
//
// @0x0003e3ad  testl %edx, %edx
// @0x0003e3af  je    0x3e3f0            ; if (which == 0) go to grow path
// ---- (which != 0) path ----
// @0x0003e3b1  leaq  _HGRectNull(%rip), %rax
// @0x0003e3b8  movq  (%rax), %rbx       ; rbx = HGRectNull.lo (= 0)
// @0x0003e3bb  movq  0x8(%rax), %rdx    ; rdx = HGRectNull.hi (= 0)
// @0x0003e3bf  movq  %rbx, %rcx         ; \
// @0x0003e3c2  shrq  $0x20, %rcx        ; | rcx = high32(rbx); rbx & rdx
// (stack canary check, then fall into the shared epilogue @0x0003e3da)   ; | are trivially zero
// @0x0003e3da  shlq  $0x20, %rcx        ; | but the compiler still splices
// @0x0003e3de  movl  %ebx, %eax         ; | them across the canary check
// @0x0003e3e0  orq   %rcx, %rax         ; / — the return value is HGRectNull.
//
// ---- (which == 0) path @0x0003e3f0 ----
// @0x0003e3f0  movq  %r8, %rbx           ; rbx = inRect.hi (save)
// @0x0003e3f3  movq  %rcx, %r14          ; r14 = inRect.lo (save)
// @0x0003e3f6  movq  %rdi, %r15          ; r15 = self (save)
// @0x0003e3f9  xorl  %edi, %edi          ; arg1 = 0    ; growVec.x = 0
// @0x0003e3fb  movl  $0xffffffff, %esi   ; arg2 = -1   ; growVec.y = -1
// @0x0003e400  xorl  %edx, %edx          ; arg3 = 0    ; growVec.right = 0
// @0x0003e402  movl  $0x1, %ecx          ; arg4 = +1   ; growVec.bottom = +1
// @0x0003e407  callq _HGRectMake4i       ; {rax, rdx} = growVec {0,-1,0,+1}
// @0x0003e40c  movq  %rdx, %rcx          ; \
// @0x0003e40f  movq  %r14, %rdi          ; | args to HGRectGrow:
// @0x0003e412  movq  %rbx, %rsi          ; |   (inRect.lo, inRect.hi,
// @0x0003e415  movq  %rax, %rdx          ; /   growVec.lo, growVec.hi)
// @0x0003e418  callq _HGRectGrow          ; {rax, rdx} = grownRect
// @0x0003e41d  movq  %rax, %rbx          ; rbx = grownRect.lo (x | y<<32)
// @0x0003e420  movq  %rdx, %r14          ; r14 = grownRect.hi (right | bottom<<32)
// @0x0003e423  movq  %rax, %r12          ;
// @0x0003e426  shrq  $0x20, %r12         ; r12d = grownRect.y (high32 of rbx)
// @0x0003e42a  movq  (%r15), %rax        ; rax = *(void**)self = vtable ptr
// @0x0003e42d  leaq  -0x40(%rbp), %rdx   ; rdx = &scratch (16-byte HGRectf slot)
// @0x0003e431  movq  %r15, %rdi          ; arg1 = self
// @0x0003e434  xorl  %esi, %esi          ; arg2 = 0
// @0x0003e436  callq *0x68(%rax)         ; self.__vfn_at_0x68(0, &scratch)
//                                        ; -> writes an HGRectf {x,y,right,bottom}
//                                        ;    to [rbp-0x40 .. rbp-0x30]
// @0x0003e439  cvttss2si -0x3c(%rbp), %ecx
//                                        ; ecx = int(scratch.y)   -- read offset +4 (HGRectf.y)
// @0x0003e43e  cmpl  %ecx, %r12d
// @0x0003e441  cmovgl %r12d, %ecx        ; cmovg: if r12d > ecx (signed),
//                                        ; ecx = r12d
//                                        ; -> ecx = max(grownRect.y, int(scratch.y))
// @0x0003e445  movq  %r14, %rax          ; rax = grownRect.hi
// @0x0003e448  cvttss2si -0x38(%rbp), %esi
//                                        ; esi = int(scratch.right) -- read offset +8 (HGRectf.right)
// @0x0003e44d  shrq  $0x20, %rax         ; rax = grownRect.bottom
// @0x0003e451  cmpl  %esi, %eax
// @0x0003e453  cmovll %eax, %esi         ; cmovl: if eax < esi (signed),
//                                        ; esi = eax
//                                        ; -> esi = min(grownRect.bottom, int(scratch.right))
// @0x0003e456  shlq  $0x20, %rsi
// @0x0003e45a  movl  %r14d, %edx         ; edx = grownRect.right (low32 of r14)
// @0x0003e45d  orq   %rsi, %rdx          ; rdx = grownRect.right | (clamped_bottom << 32)
//   (stack canary check @0x0003e460..@0x0003e46e, falls into shared epilogue)
// @0x0003e3da  shlq  $0x20, %rcx         ; rcx = clamped_y << 32
// @0x0003e3de  movl  %ebx, %eax          ; eax = grownRect.x (low32 of rbx)
// @0x0003e3e0  orq   %rcx, %rax          ; rax = grownRect.x | (clamped_y << 32)
//
// Return {rax, rdx} = {
//   x:      grownRect.x,
//   y:      max(grownRect.y, int(scratch.y)),
//   right:  grownRect.right,
//   bottom: min(grownRect.bottom, int(scratch.right)),
// }
//
// Semantic reading (informal — not part of the transcription): the "grow"
// step widens the requested ROI by 1 pixel top-to-bottom (growVec =
// {0,-1,0,+1}) to satisfy the 2-tap line-average kernel's neighbour reads;
// then the y-top gets clamped up to the input DOD's top and the y-bottom
// gets clamped down against the input DOD's third-float — note that the
// scratch offsets read here are +4 (y) and +8 (right), NOT +4 (y) and +12
// (bottom). This apparent y/right pairing is faithful to the disasm; a
// separate follow-up decoding of the __vfn_at_0x68 override would be
// needed to explain the semantics (it may be that this vtable slot writes
// an HGRectf where the "right" lane is actually used as a y-bottom bound
// for the deinterlace pipeline).
// ---------------------------------------------------------------------------

/** soDeinterlaceLA::GetROI(renderer, which, rect) @Helium 0x0003e390.
 *  For `which != 0` returns HGRectNull. For `which == 0` grows the
 *  requested ROI by 1 pixel top-to-bottom, then clamps y and bottom
 *  against a scratch HGRectf produced by the base class's vtable slot
 *  0x68. `renderer` is unused (%rsi is not read anywhere in the body). */
export function soDeinterlaceLA_GetROI(
  self: soDeinterlaceLA,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x0003e3ad testl %edx, %edx ; @0x0003e3af je 0x3e3f0
  if (which !== 0) {
    // @0x0003e3b1-@0x0003e3e0 (via canary-check split): return HGRectNull.
    return HGRectNullConst;
  }
  // @0x0003e3f9-@0x0003e407 callq HGRectMake4i(0, -1, 0, +1)
  const growVec = HGRectMake4i(0, -1, 0, 1);
  // @0x0003e40c-@0x0003e418 callq HGRectGrow(inRect, growVec)
  const grownRect = HGRectGrow(rect, growVec);
  // @0x0003e42d leaq -0x40(%rbp), %rdx  (stack HGRectf scratch)
  const scratch: HGRectf = { x: 0, y: 0, right: 0, bottom: 0 };
  // @0x0003e436 callq *0x68(%rax) — self.__vfn_at_0x68(0, &scratch)
  self.__vfn_at_0x68(0, scratch);
  // @0x0003e439-@0x0003e441 cmovg pattern:
  //   ecx = int(scratch.y);  if (grownRect.y > ecx) ecx = grownRect.y;
  //   -> clamped_y = max(grownRect.y, int(scratch.y))
  const clamped_y = Math.max(grownRect.y, scratch.y | 0);
  // @0x0003e448-@0x0003e453 cmovl pattern:
  //   esi = int(scratch.right);  if (grownRect.bottom < esi) esi = grownRect.bottom;
  //   -> clamped_bottom = min(grownRect.bottom, int(scratch.right))
  const clamped_bottom = Math.min(grownRect.bottom, scratch.right | 0);
  // @0x0003e3da-@0x0003e3e0 / @0x0003e456-@0x0003e45d: rebuild rect
  //   with grownRect's x/right kept and y/bottom replaced.
  return {
    x: grownRect.x,
    y: clamped_y,
    right: grownRect.right,
    bottom: clamped_bottom,
  };
}

// ---------------------------------------------------------------------------
// soDeinterlaceLA::RenderTile(HGTile*) @Helium 0x0003e480   — SIMD kernel
//
// SCHEMATIC (from raw-port/re/disasm/Helium.soDeinterlaceLA.RenderTile.s):
//
//   The body is a ~150-line SIMD pixel loop that implements a 2-tap
//   line-average deinterlace. Key structural landmarks:
//
//   * @0x0003e491  movl 0x4(%rsi), %eax             ; ecx-band low  y (tile->y_first)
//   * @0x0003e498  cmpl %eax, 0xc(%rsi) ; jle 0x3e683
//                                                    ; if (tile->y_last <= tile->y_first)
//                                                    ; -> jump to the "return 0" epilogue.
//   * @0x0003e4a5-@0x0003e4ac  ecx = tile->x_last - tile->x_first  (loop pixel width)
//   * @0x0003e4b3-@0x0003e501  reads *self+0x30 (a float* of 3 coefficients),
//                              cvttss2si's the first three floats into
//                              32-bit ints; also reads *tile+0x18 (int32)
//                              and *tile+0x58 (int32) as scalar helpers.
//   * @0x0003e4cf/@0x0003e4e6  two float RIP-loaded constants used to
//                              massage a y-index (undecoded).
//   * @0x0003e54a  movaps  literal-@0x003c7c70(%rip), %xmm2
//                              ; xmm2 = {0.5, 0.5, 0.5, 0.5}
//                              ; (verified — see LITERAL_003C7C70 below)
//   * @0x0003e57b  movaps  literal-@0x003c7c70(%rip), %xmm2  (same address)
//   * @0x0003e5f0-@0x0003e627  the vectorised INNER loop, unrolled 2×:
//         movaps (%rbx,%rax), %xmm0        ; row-A pixel4  (rbx = &rowA[x])
//         movaps 0x10(%rbx,%rax), %xmm1    ; row-A pixel4  (next 16 bytes)
//         addps  (%r15,%rax), %xmm0        ; += row-B pixel4  (r15 = &rowB[x])
//         addps  0x10(%r15,%rax), %xmm1    ; += row-B pixel4  (next)
//         mulps  %xmm2, %xmm0              ; * 0.5
//         mulps  %xmm2, %xmm1              ; * 0.5
//         movaps %xmm0, (%rdi,%rax)        ; store to out row
//         movaps %xmm1, 0x10(%rdi,%rax)
//         addq   $0x20, %rax               ; step 32 bytes
//         ...
//   * @0x0003e660-@0x0003e67e  a SCALAR-STEP cleanup loop (1× pixel4 per
//         iteration) for the tail when the unrolled 2× can't be run.
//   * @0x0003e683-@0x0003e693  epilogue: rax = 0 (returns int32 0), restore
//         callee-saved, retq.
//
//   The value stored at output offset (rdi + (loop_index<<4) + 4*byte_x)
//   is  0.5f * (rowA[x] + rowB[x])  computed lane-wise across an f32×4
//   pixel (this is a 4-channel float image — RGBA float32 or single-plane
//   float32 packed as 4-per-vector).
//
//   Boundary handling (@0x0003e5b8-@0x0003e63e) selects which two source
//   rows to average based on parity of (yOut + baseYOffset) and edge
//   conditions — the branches at @0x0003e5cb/@0x0003e5d1/@0x0003e5df pick
//   between "average two neighbour rows", "duplicate a single row" and
//   "clamp to the last valid row" cases. The exact index arithmetic is
//   not yet transcribed.
//
// DEMAND SIGNAL: a full transcription needs HGTile's struct decoded
// (specifically offsets +0x00, +0x04, +0x08, +0x0c, +0x10, +0x18, +0x30,
// +0x50, +0x58 — see the HGTile interface above for the reads observed
// here) plus a decoding of the two literal-pool floats loaded at
// @0x0003e4cf and @0x0003e4e6 (used to bias the y-index). Once those are
// available, the inner loop above should be transcribed straight from
// the disasm — the SIMD math itself is simple (2-tap average with
// broadcast constant 0.5).
// ---------------------------------------------------------------------------

/** LITERAL @Helium 0x003c7c70 — 16 bytes = 4×float32(0.5). Loaded into
 *  xmm2 at both @0x0003e54a and @0x0003e57b (same address; two RIP
 *  offsets differ because the two `movaps` instructions live at different
 *  addresses). Broadcast 0.5f used by the 2-tap line-average `x = 0.5 *
 *  (a + b)`. Verified via xxd of the Helium x86_64 slice at file-offset
 *  0x003c7c70+0x4000 (FAT prefix): four "00 00 00 3f" = four float32(0.5). */
export const LITERAL_003C7C70: readonly [number, number, number, number] = [
  Math.fround(0.5),
  Math.fround(0.5),
  Math.fround(0.5),
  Math.fround(0.5),
];

/** soDeinterlaceLA::RenderTile(HGTile*) @Helium 0x0003e480.
 *  ~150-line SIMD kernel; not yet transcribed. See the block-comment
 *  above for the schematic (2-tap line-average, xmm2={0.5,0.5,0.5,0.5},
 *  unrolled-2× inner loop @0x0003e5f0-@0x0003e627 with scalar tail
 *  @0x0003e660-@0x0003e67e). */
export function soDeinterlaceLA_RenderTile(_self: soDeinterlaceLA, _tile: HGTile): number {
  throw new Error(
    "soDeinterlaceLA::RenderTile @Helium 0x0003e480 (SIMD 2-tap line-average, ~150 lines) not yet transcribed",
  );
}

// ---------------------------------------------------------------------------
// soDeinterlaceLA::~soDeinterlaceLA() (D1) @Helium 0x0003e930
//
// Faithful to raw-port/re/disasm/Helium.soDeinterlaceLA.D1.s:
//   @0x0003e930  pushq %rbp ; movq %rsp, %rbp
//   @0x0003e934  popq %rbp
//   @0x0003e935  jmp __ZN17Hgc2DeinterlaceLAD2Ev   ; tail-call base dtor
// ---------------------------------------------------------------------------

/** soDeinterlaceLA::~soDeinterlaceLA() (D1) @Helium 0x0003e930.
 *  Tail-jumps to Hgc2DeinterlaceLA::~Hgc2DeinterlaceLA(). */
export function soDeinterlaceLA_dtor_D1(self: soDeinterlaceLA): void {
  // @0x0003e935 jmp __ZN17Hgc2DeinterlaceLAD2Ev
  self.__dtor_base();
}

// ---------------------------------------------------------------------------
// soDeinterlaceLA::~soDeinterlaceLA() (D0) @Helium 0x0003e940
//
// Faithful to raw-port/re/disasm/Helium.soDeinterlaceLA.D0.s:
//   @0x0003e940  pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   @0x0003e946  movq  %rdi, %rbx
//   @0x0003e949  callq __ZN17Hgc2DeinterlaceLAD2Ev   ; base dtor
//   @0x0003e94e  movq  %rbx, %rdi
//   @0x0003e951  addq $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x0003e957  jmp   __ZN8HGObjectdlEPv              ; operator delete
// ---------------------------------------------------------------------------

/** soDeinterlaceLA::~soDeinterlaceLA() (D0) @Helium 0x0003e940.
 *  Calls the base destructor, then tail-calls HGObject::operator delete.
 *  Only the base-dtor call is surfaced in TS (JS GC replaces `operator
 *  delete`). */
export function soDeinterlaceLA_dtor_D0(self: soDeinterlaceLA): void {
  // @0x0003e949 callq __ZN17Hgc2DeinterlaceLAD2Ev
  self.__dtor_base();
  // @0x0003e957 jmp __ZN8HGObjectdlEPv (HGObject::operator delete(void*)).
  // No-op in TypeScript; JS GC reclaims the object.
}
