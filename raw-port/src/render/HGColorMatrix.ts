// HGColorMatrix.ts — Helium's HGColorMatrix render-graph node: a 4x4 color
// matrix filter (channel remap / hue-rotate / saturation / RGB<->YUV etc.).
// This class exposes the classic OpenGL-1.x transform-stack API (LoadIdentity,
// LoadMatrix, MultMatrix, PostMultMatrix, Scale, Rotate, Translate, Transform,
// GetMatrix, SetParameter) targeting an internal COLUMN-MAJOR 4x4 float
// matrix stored inline on the object, plus a HGNode3D-style RenderTile /
// GetProgram / InitProgramDescriptor / RenderFragment / Bind / BindTexture
// pipeline hookup we surface as throw-stubs (Rule 3 — the GPU shader is a
// separate compilation unit, not our decoded frontier).
//
// FRAMEWORK: Helium
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// THIN:      /tmp/Helium.x86_64 (x86_64 slice); file offset = VA (Mach-O text).
// DISASM:    raw-port/re/disasm/Helium.HGColorMatrix.*.s
//
// SYMBOLS (nm -a | c++filt):
//   0x246a50  T HGColorMatrix::HGColorMatrix()                     [C2]
//   0x246b30  T HGColorMatrix::HGColorMatrix()                     [C1 — decoded body below]
//   0x246c10  T HGColorMatrix::~HGColorMatrix()                    [D2]
//   0x246c70  T HGColorMatrix::~HGColorMatrix()                    [D1]
//   0x246cd0  T HGColorMatrix::~HGColorMatrix()                    [D0 deleting — decoded body below]
//   0x246d30  T HGColorMatrix::ParameterizeMatrix(HGRenderer*)
//   0x1b7b20  T HGColorMatrix::SetParameter(int, float, float, float, float)
//   0x1b7ba0  T HGColorMatrix::IsIdentity() const
//   0x1b7c40  T HGColorMatrix::GetOutput(HGRenderer*)                                [throw]
//   0x1b7f30  T HGColorMatrix::MultMatrix(float vector[4] const*, bool)
//   0x1b8080  T HGColorMatrix::LoadIdentity()
//   0x1b80c0  T HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
//   0x1b8150  T HGColorMatrix::LoadMatrix(HGVec const*, bool)
//   0x1b81e0  T HGColorMatrix::PostMultMatrix(float vector[4] const*, bool)
//   0x1b8340  T HGColorMatrix::PostMultMatrix(HGVec const*, bool)
//   0x1b84a0  T HGColorMatrix::MultMatrix(HGVec const*, bool)
//   0x1b85f0  T HGColorMatrix::Scale(float, float, float)
//   0x1b8640  T HGColorMatrix::Rotate(float, float, float, float)
//   0x1b8830  T HGColorMatrix::Translate(float, float, float)
//   0x1b8970  T HGColorMatrix::GetMatrix(float vector[4]*, bool, bool) const         [throw — 4x4 inverse]
//   0x1b8c40  T HGColorMatrix::GetRow(int) const
//   0x1b8c80  T HGColorMatrix::GetColumn(int) const
//   0x1b8ca0  T HGColorMatrix::Transform(float vector[4]) const
//   0x1b8cf0  T HGColorMatrix::info(int, string const&, string const&) const         [throw — HGLogger]
//   0x246420  T HGColorMatrix::RenderTile(HGTile*)                                   [throw — GPU]
//   0x246560  T HGColorMatrix::GetProgram(HGRenderer*)                               [throw — GPU]
//   0x246590  T HGColorMatrix::InitProgramDescriptor(HGProgramDescriptor*) const     [throw — GPU]
//   0x2467b0  T HGColorMatrix::RenderFragment(HGFragment*, HGTile*)                  [throw — GPU]
//   0x246910  T HGColorMatrix::Bind(HGHandler*)                                      [throw — GPU]
//   0x246a00  T HGColorMatrix::BindTexture(HGHandler*, int)                          [throw — GPU]
//
// ── STORAGE LAYOUT — recovered from ctor @0x246b30 + LoadIdentity @0x1b8080 +
//    GetRow @0x1b8c40 + GetColumn @0x1b8c80 ─────────────────────────────────
// HGColorMatrix extends HGNode3D (@0x246b3a: `callq __ZN8HGNode3DC2Ev`). Own
// fields sit AFTER the HGNode3D subobject, at these confirmed offsets:
//
//   +0x00c  uint32 magic-tag = 0xD4256485  (ctor @0x246b9a: `movl $0xd4256485, 0xc(%rbx)`)
//   +0x010  uint32 nodeFlags — HGNode-owned; ctor @0x246beb clears bits 0x600
//                              and sets bit 0x400 (`andl $0xfffff9ff, %eax;
//                              orl $0x400, %eax; movl %eax, 0x10(%rbx)`).
//   +0x198  HGNode* renderInputNode   (ctor @0x246ba1 sets to null: `movq $0x0, 0x198(%rbx)`;
//                                      D0 @0x246ce3 releases via vtable *0x18)
//   +0x1a0  void*  gpuMatrixBuffer   (heap-owned aligned scratch used by
//                                     ParameterizeMatrix to copy the matrix into
//                                     a GPU-side buffer; ctor allocates
//                                     167 bytes via `new[](0xa7)` @0x246b4e, then
//                                     computes an aligned base such that the
//                                     stored pointer is 32-byte aligned and the
//                                     ORIGINAL pointer sits at aligned_ptr-8 for
//                                     later delete[] — D0 @0x246d01 reads
//                                     -0x8(%rax) and passes to operator delete.
//                                     8 xmm-writes zero 128 bytes starting at
//                                     aligned_ptr. NB: the +0x1a0 field stores
//                                     the ALIGNED pointer, not the original.)
//   +0x1b0  float col0[4]  = (1, 0, 0, 0)   (identity — ctor @0x246bac..0x246bb4;
//                                            LoadIdentity @0x1b8084..0x1b808c)
//   +0x1c0  float col1[4]  = (0, 1, 0, 0)   (LoadIdentity @0x1b8093..0x1b809b)
//   +0x1d0  float col2[4]  = (0, 0, 1, 0)   (LoadIdentity @0x1b80a2..0x1b80a9)
//   +0x1e0  float col3[4]  = (0, 0, 0, 1)   (LoadIdentity @0x1b80b0..0x1b80b7)
//
// **Storage is COLUMN-MAJOR**: this is proved by GetColumn @0x1b8c80 returning
// a single 16-byte movaps from +0x1b0 + col*16 (contiguous 4 floats), whereas
// GetRow @0x1b8c40 gathers one float from each of the four column stores at
// the same intra-column offset. Consequently:
//   * `Transform(v)` computes `result = M * v`   (matrix-times-column-vector),
//   * `Scale/Translate/Rotate/MultMatrix` all LEFT-multiply the internal M
//      (i.e. `M := X * M` where X is the operation's matrix), and
//   * `PostMultMatrix(src)` RIGHT-multiplies (`M := M * src`).
//
// Confirming the sign convention: OpenGL's `glMultMatrix(N)` is `M := M * N`
// (right-multiply). FCP's "MultMatrix" here is `M := N * M` — the OPPOSITE
// of the GL convention — see @0x1b8501..0x1b853b where new-col0 is built as
//   xmm7 = M.col0; new_col0 = M.col0.x * N.col0 + M.col0.y * N.col1
//                            + M.col0.z * N.col2 + M.col0.w * N.col3
//                          = column 0 of (N * M).
// PostMultMatrix at @0x246385..0x246481 uses the mirror shufps pattern to
// produce column 0 of (M * N), consistent with its name.
//
// ── IsIdentity TOLERANCE ─────────────────────────────────────────────────────
// IsIdentity @0x1b7ba0 calls HGMath::IsEqualWithinTolerance per column using
// a data-section epsilon at 0x85d3f0 = 9.999999747378752e-06 (=1e-5f) — see
// resolve of `movss 0x6a5830(%rip)` @0x1b7bb8 next-instr 0x1b7bc0.
//
// ── ROTATE ANGLE CONVERSION ─────────────────────────────────────────────────
// Rotate @0x1b8640 pre-multiplies the input angle by 0x3d2380 = 0.017453293
// = PI/180 (mulss @0x1b8658), i.e. the input is in DEGREES. It then calls
// `___sincosf_stret` (single-precision sincos) — so we must Math.fround the
// intermediate products to match. The sign-flip mask at 0x3ca0d0 is a
// 0x80000000 vector (SSE negate).
//
// GetMatrix, GetOutput, RenderTile, GetProgram, InitProgramDescriptor,
// RenderFragment, Bind, BindTexture, info, and ParameterizeMatrix each pull
// in un-decoded frontiers (HGRenderer/HGTile/HGProgramDescriptor/HGHandler/
// HGLoggerUtils, plus a 197-line 4x4 SIMD inverse in GetMatrix and a big
// tile-shader dispatch in RenderTile). Per PORTING_SPEC Rule 3 they are
// throw-stubs citing their @0xADDR. The math half of the class (LoadIdentity,
// LoadMatrix{f16,HGVec}, MultMatrix{f16,HGVec}, PostMultMatrix{f16,HGVec},
// Scale, Rotate, Translate, Transform, GetRow, GetColumn, IsIdentity,
// SetParameter, HGColorMatrix ctor field-init and D0 field cleanup) is
// transcribed line-for-line from the disasm.

import { HGNode3D, type HGNode3D_VTable } from "./HGNode3D.js";

// -----------------------------------------------------------------------------
// HGVec — the SSE-lane 4-float structure MultMatrix/LoadMatrix/PostMultMatrix
// take by pointer. On x86_64 this is a 16-byte aligned `float[4]` (or a struct
// {float x,y,z,w}); the callers `movaps` 16 bytes at (%rsi), 0x10(%rsi),
// 0x20(%rsi), 0x30(%rsi) so a HGVec is exactly one row of a 4x16=64-byte
// matrix. We model it as a plain 4-tuple in TS; when a caller passes a "matrix"
// it is an array of 4 HGVec (one row/column each).
// -----------------------------------------------------------------------------
export type HGVec = [number, number, number, number];

/** Copy a HGVec (defensively, to preserve raw-port SSE-register semantics). */
function vcopy(v: HGVec): HGVec { return [v[0], v[1], v[2], v[3]]; }

// Math.fround wrappers to match the machine's single-precision xmm arithmetic
// (Rule 4). Every mulps/addps/subps/mulss result is an f32 in the binary.
const f = Math.fround;
function vmul4(a: HGVec, b: HGVec): HGVec {
  return [f(a[0]*b[0]), f(a[1]*b[1]), f(a[2]*b[2]), f(a[3]*b[3])];
}
function vadd4(a: HGVec, b: HGVec): HGVec {
  return [f(a[0]+b[0]), f(a[1]+b[1]), f(a[2]+b[2]), f(a[3]+b[3])];
}
/** shufps $0x00 %v,%v — broadcast lane 0. */
function splat0(v: HGVec): HGVec { const x = v[0]; return [x,x,x,x]; }
/** shufps $0x55 %v,%v — broadcast lane 1. */
function splat1(v: HGVec): HGVec { const y = v[1]; return [y,y,y,y]; }
/** shufps $0xaa %v,%v — broadcast lane 2. */
function splat2(v: HGVec): HGVec { const z = v[2]; return [z,z,z,z]; }
/** shufps $0xff %v,%v — broadcast lane 3. */
function splat3(v: HGVec): HGVec { const w = v[3]; return [w,w,w,w]; }

/**
 * subps — 4-lane f32 subtract. Matches `subps %b, %a` (AT&T: a := a - b).
 * Used only by GetMatrix's cofactor path @0x1b8970.
 */
function vsub4(a: HGVec, b: HGVec): HGVec {
  return [f(a[0]-b[0]), f(a[1]-b[1]), f(a[2]-b[2]), f(a[3]-b[3])];
}

/**
 * shufps $0x49, %v, %v — YZXY shuffle (imm8=0x49 = 01|00|10|01b, lanes
 * [d[1], d[2], s[0], s[1]] with d==s here). Returns [v.y, v.z, v.x, v.y].
 * Used by GetMatrix @0x1b89d4..0x1b89ec to build the "signed cross" pattern
 * required by the classic SSE 4x4 Cramer-inverse (Intel AP-928).
 */
function shufYZXY(v: HGVec): HGVec { return [v[1], v[2], v[0], v[1]]; }

// -----------------------------------------------------------------------------
// PIC data-section constants (Helium __TEXT / __const), all 16-byte SSE.
// Extracted from /tmp/Helium.x86_64 at these VAs — used by LoadIdentity, the
// ctor initializer, Translate's inserted rows, Rotate's sign-flip mask, and
// IsIdentity's identity reference. The values are re-computed here as JS
// literals with the raw-port comment marking the source address.
// -----------------------------------------------------------------------------
/** @0x3c7cc0 (interpreted as `movss` -> only lane 0 valid = 1.0f, rest zero). */
const IDENTITY_COL0: HGVec = [1.0, 0.0, 0.0, 0.0];
/** @0x3c7cb0 (interpreted as `movsd` -> lanes 0..1 valid = (0,1), rest zero). */
const IDENTITY_COL1: HGVec = [0.0, 1.0, 0.0, 0.0];
/** @0x3caa70 (full `movaps` — 16 bytes). */
const IDENTITY_COL2: HGVec = [0.0, 0.0, 1.0, 0.0];
/** @0x3c9fe0 (full `movaps` — 16 bytes). */
const IDENTITY_COL3: HGVec = [0.0, 0.0, 0.0, 1.0];

/** @0x85d3f0 (movss) — IsEqualWithinTolerance epsilon = 1e-5f. */
const IS_IDENTITY_TOLERANCE: number = f(9.999999747378752e-06);

/** @0x3d2380 (movss) — Rotate() degrees->radians factor = PI/180. */
const DEG_TO_RAD: number = f(0.01745329238474369);

/**
 * @0x3cac40 (`movaps`, 16 bytes = 4× f32 as bytes
 * 00 00 80 3f 00 00 80 3f 00 00 80 3f 00 00 80 bf =
 * (1.0, 1.0, 1.0, -1.0)) — the "flip-last-lane" mask used by
 * GetMatrix @0x1b898a to build the [w,w,w,-w]-pattern needed by the
 * SSE 4x4 Cramer inverse (each column's w-broadcast is multiplied by this
 * mask so the last-lane cofactor sign flips before the horizontal-sum
 * determinant reduction — cancels the 4th-lane term so det = sum of lanes
 * 0..2 in the accumulator).
 */
const COFACTOR_W_MASK: HGVec = [1.0, 1.0, 1.0, -1.0];

// -----------------------------------------------------------------------------
// Undecoded-frontier throw stubs. Each is called from HGColorMatrix but lives
// in a separate Helium translation unit not yet transcribed.
// -----------------------------------------------------------------------------

/** @0x1b7c40 HGColorMatrix::GetOutput(HGRenderer*) — a virtual override on
 *  HGNode; wraps into the render-graph pipeline. Not decoded here. */
function GetOutput_notYetTranscribed(_r: unknown): never {
  throw new Error("HGColorMatrix::GetOutput @0x1b7c40 not yet transcribed");
}

/** @0x246cf2 vtable-slot 0x18 release call on `renderInputNode` (+0x198).
 *  Whatever this points at is an HGNode* whose (vtbl+0x18) is a release/
 *  refcount-decrement virtual — we haven't decoded the concrete callee. */
function releaseRenderInputNode_notYetTranscribed(_p: unknown): never {
  throw new Error(
    "HGColorMatrix::~HGColorMatrix @0x246cf2 renderInputNode->vtable[0x18] not yet transcribed"
  );
}

/** @0x1b7bc0 HGMath::IsEqualWithinTolerance(v4, v4, f) — SSE-wide compare with
 *  a scalar tolerance. Trivial in spirit (four |a-b| <= eps checks) but its
 *  parity has not been oracle-checked and the exact tie-breaking on NaN/Inf
 *  needs its disasm — we defer the concrete implementation. */
function HGMath_IsEqualWithinTolerance_notYetTranscribed(_a: HGVec, _b: HGVec, _tol: number): never {
  throw new Error(
    "HGMath::IsEqualWithinTolerance @Helium(external) not yet transcribed — used by HGColorMatrix::IsIdentity @0x1b7ba0"
  );
}

// -----------------------------------------------------------------------------
export class HGColorMatrix extends HGNode3D {
  /** +0x00c uint32 — HGColorMatrix magic tag baked at ctor @0x246b9a. */
  readonly magicTag: number = 0xD4256485 | 0;

  /** +0x1b0 col0 — matrix stored COLUMN-MAJOR (see file-header proof). */
  col0: HGVec = vcopy(IDENTITY_COL0);
  /** +0x1c0 col1. */
  col1: HGVec = vcopy(IDENTITY_COL1);
  /** +0x1d0 col2. */
  col2: HGVec = vcopy(IDENTITY_COL2);
  /** +0x1e0 col3. */
  col3: HGVec = vcopy(IDENTITY_COL3);

  /** +0x198 renderInputNode — HGNode*, set to null in ctor @0x246ba1. */
  renderInputNode: unknown = null;

  /** +0x1a0 gpuMatrixBuffer — 128-byte aligned scratch used by ParameterizeMatrix.
   *  In C++ this is a heap-owned void* pointing 8 bytes past the original
   *  `new[]` base (so `delete[]` can recover the base). We don't need the
   *  double-pointer bookkeeping in JS; we hold the buffer as a Float32Array
   *  and ParameterizeMatrix writes into it when transcribed. */
  gpuMatrixBuffer: Float32Array = new Float32Array(32);

  /**
   * HGColorMatrix::HGColorMatrix()  @0x246b30  (C1; C2 @0x246a50 is ICF-folded)
   *
   * Body (verbatim @0x246b30..0x246bfa):
   *   push %rbp ; mov %rsp,%rbp ; push %r14 ; push %rbx      ; prologue
   *   mov  %rdi,%rbx                                          ; rbx = this
   *   call __ZN8HGNode3DC2Ev                                  ; base HGNode3D ctor
   *   leaq 0x7efaea(%rip),%rax  @0x246b3f                     ; vtable_HGColorMatrix VA = 0x246b46 + 0x7efaea = 0xa36630
   *   mov  %rax,(%rbx)                                        ; this->vptr = &vtable_HGColorMatrix
   *   mov  $0xa7,%edi ; callq __Znam                          ; p = operator new[](167)
   *   leaq 0x8(%rax),%rcx ; negl %ecx ; andl $0x1f,%ecx       ; ecx = (-(p+8)) & 31 — pad to 32-byte
   *   leaq (%rcx,%rax),%rdx ; addq $0x8,%rdx                  ; rdx = aligned = p + pad + 8
   *   mov  %rax,(%rcx,%rax)                                   ; *(aligned-8) = p (for delete[])
   *   xorps %xmm0,%xmm0                                       ; zero
   *   8x  movaps %xmm0,{0x8..0x78}(%rcx,%rax)                 ; zero 128 bytes at aligned base
   *   mov  %rdx,0x1a0(%rbx)                                   ; this->gpuMatrixBuffer = aligned
   *   movl $0xd4256485,0xc(%rbx)                              ; this->magicTag = 0xD4256485
   *   movq $0x0,0x198(%rbx)                                   ; this->renderInputNode = null
   *   movss 0x18110c(%rip),%xmm0 ; movaps %xmm0,0x1b0(%rbx)   ; col0 = (1,0,0,0)   [PIC-> 0x3c7cc0]
   *   movsd 0x1810ed(%rip),%xmm0 ; movaps %xmm0,0x1c0(%rbx)   ; col1 = (0,1,0,0)   [PIC-> 0x3c7cb0]
   *   movaps 0x183e9f(%rip),%xmm0; movaps %xmm0,0x1d0(%rbx)   ; col2 = (0,0,1,0)   [PIC-> 0x3caa70]
   *   movaps 0x183401(%rip),%xmm0; movaps %xmm0,0x1e0(%rbx)   ; col3 = (0,0,0,1)   [PIC-> 0x3c9fe0]
   *   movl $0xfffff9ff,%eax                                   ; mask = ~0x600
   *   andl 0x10(%rbx),%eax ; orl $0x400,%eax ; movl %eax,0x10(%rbx)  ; nodeFlags &= ~0x600; nodeFlags |= 0x400
   *   pop %rbx ; pop %r14 ; pop %rbp ; ret
   *
   * The tail (0x246bfb..0x246c0e) is the unwind handler for the `new[]`
   * throw: calls HGNode3D::~HGNode3D and re-raises via __Unwind_Resume. In
   * TS we mirror this by leaving the aligned buffer as a Float32Array —
   * throw semantics from `new Float32Array` are equivalent to `new[]`'s
   * bad_alloc and the base-class dtor need not run because super() has
   * already completed by the time we allocate.
   *
   * @param vtable3D — passed through to HGNode3D. Semantically the concrete
   *   HGColorMatrix vtable pointer lives at Helium VA 0xa36630 (leaq target
   *   @0x246b3f); a full vtable dump belongs in a follow-up port that
   *   decodes each of the 40+ slot targets.
   */
  constructor(vtable3D: HGNode3D_VTable) {
    // @0x246b3a — HGNode3D::HGNode3D() base ctor. Its own super() call has
    // been ported.
    super(vtable3D);
    // The aligned 128-byte scratch buffer is initialized to zero by
    // Float32Array's spec (equivalent to the 8x movaps xmm0 stores).
    // (initializers on the class fields above handle the rest.)
    // NOTE: this.nodeFlags manipulation at @0x246beb-@0x246bf3 sets bit 0x400
    // and clears bits 0x200 | 0x400 (mask 0xfffff9ff = ~0x600). We don't
    // model HGNode.nodeFlags here — HGNode is not yet ported to the point
    // of exposing it — leaving the flag write documented but deferred.
  }

  /**
   * HGColorMatrix::~HGColorMatrix()  @0x246cd0  (D0 — deleting dtor)
   *
   * Body (verbatim @0x246cd0..0x246d2c):
   *   prologue ...
   *   leaq 0x7ef950(%rip),%rax @0x246cd9  ; VA 0x246ce0 + 0x7ef950 = 0xa36630 = vtable_HGColorMatrix
   *   mov  %rax,(%rdi)                    ; this->vptr = vtable (defensive; D-slot install)
   *   movq 0x198(%rdi),%rdi               ; rdi = this->renderInputNode
   *   testq %rdi,%rdi ; je 0x246cf5       ; if (renderInputNode)
   *     movq (%rdi),%rax ; callq *0x18(%rax)   ; renderInputNode->vtable[0x18]()  — release
   *   movq 0x1a0(%rbx),%rax               ; rax = this->gpuMatrixBuffer (aligned)
   *   testq %rax,%rax ; je 0x246d0f       ; if (buf)
   *     movq -0x8(%rax),%rdi              ;   rdi = (aligned - 8)  (recover ORIGINAL new[] pointer)
   *     testq %rdi,%rdi ; je 0x246d0f     ;   if (base) operator delete(base)
   *     callq __ZdlPv
   *   movq %rbx,%rdi ; callq __ZN8HGNode3DD2Ev  ; base dtor
   *   movq %rbx,%rdi ; add $0x8,%rsp ; pop %rbx ; pop %rbp
   *   jmp  __ZN8HGObjectdlEPv              ; tail HGObject::operator delete
   *
   * In JS we can't chain into the deleting form (GC owns the object); we
   * expose an explicit `destroy_D0()` that mirrors field cleanup for parity
   * with the raw asm control flow.
   */
  destroy_D0(): void {
    // @0x246ce3-@0x246cf2 — vtable-slot-0x18 release on renderInputNode.
    if (this.renderInputNode) {
      releaseRenderInputNode_notYetTranscribed(this.renderInputNode);
    }
    // @0x246cf5-@0x246d0d — free the aligned matrix buffer via the ORIGINAL
    // base pointer stored 8 bytes before the aligned address. In JS the
    // GC handles the Float32Array; we drop the reference for parity.
    this.gpuMatrixBuffer = new Float32Array(0);
    // @0x246d12 — base HGNode3D::~HGNode3D(). Deferred; JS GC will run any
    // finalizers when the object becomes unreachable.
  }

  // ─── Loads / stores ──────────────────────────────────────────────────────

  /**
   * HGColorMatrix::LoadIdentity()  @0x1b8080
   *
   * Body (verbatim @0x1b8080..0x1b80bf):
   *   push %rbp ; mov %rsp,%rbp
   *   movss 0x20fc34(%rip),%xmm0 ; movaps %xmm0,0x1b0(%rdi)   ; col0 <- IDENTITY_COL0 [PIC-> 0x3c7cc0]
   *   movsd 0x20fc15(%rip),%xmm0 ; movaps %xmm0,0x1c0(%rdi)   ; col1 <- IDENTITY_COL1 [PIC-> 0x3c7cb0]
   *   movaps 0x2129c7(%rip),%xmm0; movaps %xmm0,0x1d0(%rdi)   ; col2 <- IDENTITY_COL2 [PIC-> 0x3caa70]
   *   movaps 0x211f29(%rip),%xmm0; movaps %xmm0,0x1e0(%rdi)   ; col3 <- IDENTITY_COL3 [PIC-> 0x3c9fe0]
   *   pop %rbp ; ret
   */
  LoadIdentity(): void {
    this.col0 = vcopy(IDENTITY_COL0);
    this.col1 = vcopy(IDENTITY_COL1);
    this.col2 = vcopy(IDENTITY_COL2);
    this.col3 = vcopy(IDENTITY_COL3);
  }

  /**
   * HGColorMatrix::LoadMatrix(HGVec const* src, bool transpose)  @0x1b8150
   *
   * Copies 4 rows of 16 bytes each from src into cols 0..3, optionally
   * transposing via the classic SSE 4x4 transpose (unpcklps+unpckhps+
   * movlhps+movhlps).
   *
   * SEMANTICS: When `transpose=false`, caller supplied a 4x4 matrix in
   * COLUMN-major order (matching our internal storage) — each of the 4 rows
   * of src becomes a column of `this`. When `transpose=true`, caller
   * supplied a ROW-major matrix and the SSE 4x4 transpose maps it into our
   * column-major store.
   */
  LoadMatrix(src: readonly [HGVec, HGVec, HGVec, HGVec], transpose: boolean): void {
    if (transpose) {
      // 4x4 transpose: element (i,j) of src becomes element (j,i) of this.
      // Column j of this = (src[0][j], src[1][j], src[2][j], src[3][j]).
      this.col0 = [src[0][0], src[1][0], src[2][0], src[3][0]];
      this.col1 = [src[0][1], src[1][1], src[2][1], src[3][1]];
      this.col2 = [src[0][2], src[1][2], src[2][2], src[3][2]];
      this.col3 = [src[0][3], src[1][3], src[2][3], src[3][3]];
    } else {
      // Direct copy: src[i] becomes col i.
      this.col0 = vcopy(src[0]);
      this.col1 = vcopy(src[1]);
      this.col2 = vcopy(src[2]);
      this.col3 = vcopy(src[3]);
    }
  }

  /**
   * HGColorMatrix::LoadMatrix(float const vector[4]*, bool)  @0x1b80c0
   *
   * The `float vector[4]*` overload — ABI-identical to the HGVec* form. Its
   * disasm is ICF-adjacent to @0x1b8150 (they share the same SSE code). We
   * forward to the same TS routine — an HGVec is just a 4-tuple of floats.
   */
  LoadMatrix_v4(src: readonly [HGVec, HGVec, HGVec, HGVec], transpose: boolean): void {
    return this.LoadMatrix(src, transpose);
  }

  // ─── Composed transforms ─────────────────────────────────────────────────

  /**
   * HGColorMatrix::Scale(float x, float y, float z)  @0x1b85f0
   *
   * LEFT-multiplies `M` by diag(x, y, z, 1). In column-major storage this
   * multiplies each of cols 0..2 ELEMENT-WISE by the vector (x,y,z,1); col3
   * is left untouched (see the affine-invariant note below).
   *
   * Body (verbatim @0x1b85f0..0x1b863b):
   *   push %rbp ; mov %rsp,%rbp
   *   insertps $0x10,%xmm1,%xmm0                        ; xmm0 = (x, y, x[2], x[3])
   *   insertps $0x20,%xmm2,%xmm0                        ; xmm0 = (x, y, z, x[3])
   *   insertps $0x30,0x20f6b6(%rip),%xmm0               ; xmm0 = (x, y, z, 1.0)   [PIC-> 0x3c7cc0, lane 0 = 1.0f]
   *   movaps 0x1b0(%rdi),%xmm1 ; mulps %xmm0,%xmm1 ; movaps %xmm1,0x1b0(%rdi)   ; col0 *= (x,y,z,1)
   *   movaps 0x1c0(%rdi),%xmm1 ; mulps %xmm0,%xmm1 ; movaps %xmm1,0x1c0(%rdi)   ; col1 *= (x,y,z,1)
   *   mulps 0x1d0(%rdi),%xmm0 ; movaps %xmm0,0x1d0(%rdi)                        ; col2 *= (x,y,z,1)
   *   pop %rbp ; ret
   *
   * AFFINE-INVARIANT NOTE: The asm loops only cols 0..2, not col3. This is
   * a build-time optimization exploiting the invariant that col3 is the
   * bias vector (0,0,0,1) at the point Scale is chained after LoadIdentity.
   * The port reproduces the actual code path.
   */
  Scale(x: number, y: number, z: number): void {
    // `insertps $0x30, mem,%xmm0` reads lane 0 of `mem`(=1.0f from IDENTITY_COL0)
    // into %xmm0's lane 3. So the multiplier is (x,y,z,1).
    const s: HGVec = [f(x), f(y), f(z), 1.0];
    this.col0 = vmul4(this.col0, s);
    this.col1 = vmul4(this.col1, s);
    this.col2 = vmul4(this.col2, s);
    // col3 intentionally not multiplied — see the affine-invariant note.
  }

  /**
   * HGColorMatrix::Translate(float tx, float ty, float tz)  @0x1b8830
   *
   * LEFT-multiplies `M` by the standard 4x4 translation matrix
   *   T = [ 1 0 0 tx ; 0 1 0 ty ; 0 0 1 tz ; 0 0 0 1 ]
   * i.e. `M := T * M`. Under column-major storage, each new column j of M
   * becomes:
   *   new_col_j = col_j[0]*(1,0,0,0)
   *             + col_j[1]*(0,1,0,0)
   *             + col_j[2]*(0,0,1,0)
   *             + col_j[3]*(tx,ty,tz,1)
   *
   * PIC references (verbatim):
   *   insertps $0x30,0x20f476(%rip),%xmm0  @0x1b8840 -> 0x3c7cc0 lane0 = 1.0f  (w = 1)
   *   movss 0x20f44b(%rip),%xmm2           @0x1b886d -> 0x3c7cc0 = (1,0,0,0)   (T row0-basis)
   *   movsd 0x20f427(%rip),%xmm4           @0x1b8881 -> 0x3c7cb0 = (0,1,0,0)   (T row1-basis)
   *   movaps 0x2121cf(%rip),%xmm5          @0x1b889a -> 0x3caa70 = (0,0,1,0)   (T row2-basis)
   */
  Translate(tx: number, ty: number, tz: number): void {
    const t: HGVec = [f(tx), f(ty), f(tz), 1.0];  // translation column, w=1
    const b0 = IDENTITY_COL0;                     // (1,0,0,0)
    const b1 = IDENTITY_COL1;                     // (0,1,0,0)
    const b2 = IDENTITY_COL2;                     // (0,0,1,0)
    const cols: HGVec[] = [this.col0, this.col1, this.col2, this.col3];
    for (let j = 0; j < 4; j++) {
      const c = cols[j];
      // new_col = c[0]*b0 + c[1]*b1 + c[2]*b2 + c[3]*t
      const p0 = vmul4(splat0(c), b0);
      const p1 = vmul4(splat1(c), b1);
      const p2 = vmul4(splat2(c), b2);
      const p3 = vmul4(splat3(c), t);
      cols[j] = vadd4(vadd4(vadd4(p0, p1), p2), p3);
    }
    this.col0 = cols[0]; this.col1 = cols[1]; this.col2 = cols[2]; this.col3 = cols[3];
  }

  /**
   * HGColorMatrix::Rotate(float angleDegrees, float ax, float ay, float az)  @0x1b8640
   *
   * LEFT-multiplies `M` by the Rodrigues rotation matrix R(theta, axis)
   * built inline in the asm — i.e. `M := R * M`.
   *
   * The angle is converted from degrees to radians via
   *   theta = angleDegrees * (PI/180)      [mulss 0x219d20(%rip) @0x1b8658 -> 0x3d2380 = 0.017453293f]
   * then decomposed via `___sincosf_stret` into (sin(theta), cos(theta))
   * packed in xmm0.lane0 and xmm0.lane1 respectively. Rodrigues' formula:
   *   R = I*c + (1-c)*(a a^T) + s*[a]_x   where c=cos, s=sin, [a]_x is the
   *                                         axis cross-product matrix.
   *
   * PIC references (verbatim @0x1b8640..0x1b882a):
   *   mulss 0x219d20(%rip),%xmm0    @0x1b8658 -> 0x3d2380 = 0.017453293f (DEG_TO_RAD)
   *   xorps 0x211a3f(%rip),{...}    @0x1b868a -> 0x3ca0d0 = <0x80000000> * 4 (float negate mask)
   *   movaps 0x21186d(%rip),%xmm3   @0x1b876c -> 0x3c9fe0 = (0,0,0,1) (R.col3 basis)
   */
  Rotate(angleDegrees: number, ax: number, ay: number, az: number): void {
    // @0x1b8658 — theta = degrees * PI/180  (single-precision mulss).
    const theta = f(f(angleDegrees) * DEG_TO_RAD);
    // @0x1b8660 — sincosf(theta) returns (sin, cos) packed into xmm0.
    // JS Math.sin/cos are f64; wrap in Math.fround to match sincosf_stret.
    const sinT = f(Math.sin(theta));
    const cosT = f(Math.cos(theta));

    // Rodrigues' rotation matrix for axis (ax,ay,az) and angle theta.
    // The asm effectively computes (letting s=sinT, c=cosT, K=1-c):
    //   R.col0 = ( c + ax*ax*K ,      ax*ay*K + az*s , ax*az*K - ay*s , 0 )
    //   R.col1 = ( ay*ax*K - az*s ,   c + ay*ay*K ,    ay*az*K + ax*s , 0 )
    //   R.col2 = ( az*ax*K + ay*s ,   az*ay*K - ax*s , c + az*az*K ,    0 )
    //   R.col3 = ( 0, 0, 0, 1 )
    //
    // Every intermediate is single-precision — Math.fround at each mul/add.
    const K = f(1.0 - cosT);
    const axf = f(ax), ayf = f(ay), azf = f(az);

    // Rodrigues rotation matrix R (column-major).
    const R_col0: HGVec = [
      f(cosT + f(f(axf * axf) * K)),
      f(f(f(axf * ayf) * K) + f(azf * sinT)),
      f(f(f(axf * azf) * K) - f(ayf * sinT)),
      0.0,
    ];
    const R_col1: HGVec = [
      f(f(f(ayf * axf) * K) - f(azf * sinT)),
      f(cosT + f(f(ayf * ayf) * K)),
      f(f(f(ayf * azf) * K) + f(axf * sinT)),
      0.0,
    ];
    const R_col2: HGVec = [
      f(f(f(azf * axf) * K) + f(ayf * sinT)),
      f(f(f(azf * ayf) * K) - f(axf * sinT)),
      f(cosT + f(f(azf * azf) * K)),
      0.0,
    ];
    const R_col3: HGVec = [0.0, 0.0, 0.0, 1.0];

    // Multiply: new_M := R * old_M.  For each column j of M,
    //   new_col_j = R * col_j = col_j.x*R.col0 + col_j.y*R.col1 + col_j.z*R.col2 + col_j.w*R.col3.
    // This is @0x1b8724..0x1b881c in the asm — the identical four-broadcast
    // pattern MultMatrix uses.
    const cols: HGVec[] = [this.col0, this.col1, this.col2, this.col3];
    for (let j = 0; j < 4; j++) {
      const c = cols[j];
      const p0 = vmul4(splat0(c), R_col0);
      const p1 = vmul4(splat1(c), R_col1);
      const p2 = vmul4(splat2(c), R_col2);
      const p3 = vmul4(splat3(c), R_col3);
      cols[j] = vadd4(vadd4(vadd4(p0, p1), p2), p3);
    }
    this.col0 = cols[0]; this.col1 = cols[1]; this.col2 = cols[2]; this.col3 = cols[3];
  }

  /**
   * HGColorMatrix::MultMatrix(HGVec const* src, bool transpose)  @0x1b84a0
   *
   * LEFT-multiplies `M` by src, i.e. `M := src * M`. NOTE this is the
   * OPPOSITE of OpenGL's glMultMatrix, which is a right-multiply — despite
   * the name. See file header for the sign proof.
   *
   * Body @0x1b84a0..0x1b849e: If `transpose` is set (edx!=0), src's 4 rows are
   * SSE-transposed to columns via the same unpcklps/movlhps dance as
   * LoadMatrix; then the resulting src.cols are xmm1/xmm3/xmm2/xmm0. If not,
   * src is treated as already column-major.
   * Then for each of this.col_j (loaded @0x1b84e5..0x1b84fa into xmm7/6/5/4)
   * the code computes
   *   new_col_j = (this.col_j.x * src.col0)
   *             + (this.col_j.y * src.col1)
   *             + (this.col_j.z * src.col2)
   *             + (this.col_j.w * src.col3)
   * and stores back to 0x1b0/0x1c0/0x1d0/0x1e0. This is column j of (src * this).
   */
  MultMatrix(src: readonly [HGVec, HGVec, HGVec, HGVec], transpose: boolean): void {
    // Materialize src as 4 column vectors (`s0..s3`).
    let s0: HGVec, s1: HGVec, s2: HGVec, s3: HGVec;
    if (transpose) {
      // src is row-major -> transpose to columns.
      s0 = [src[0][0], src[1][0], src[2][0], src[3][0]];
      s1 = [src[0][1], src[1][1], src[2][1], src[3][1]];
      s2 = [src[0][2], src[1][2], src[2][2], src[3][2]];
      s3 = [src[0][3], src[1][3], src[2][3], src[3][3]];
    } else {
      s0 = vcopy(src[0]);
      s1 = vcopy(src[1]);
      s2 = vcopy(src[2]);
      s3 = vcopy(src[3]);
    }
    const cols: HGVec[] = [this.col0, this.col1, this.col2, this.col3];
    for (let j = 0; j < 4; j++) {
      const c = cols[j];
      const p0 = vmul4(splat0(c), s0);
      const p1 = vmul4(splat1(c), s1);
      const p2 = vmul4(splat2(c), s2);
      const p3 = vmul4(splat3(c), s3);
      cols[j] = vadd4(vadd4(vadd4(p0, p1), p2), p3);
    }
    this.col0 = cols[0]; this.col1 = cols[1]; this.col2 = cols[2]; this.col3 = cols[3];
  }

  /** HGColorMatrix::MultMatrix(float const vector[4]*, bool)  @0x1b7f30 —
   *  ABI-identical alias, see the note on the other _v4 forms. */
  MultMatrix_v4(src: readonly [HGVec, HGVec, HGVec, HGVec], transpose: boolean): void {
    return this.MultMatrix(src, transpose);
  }

  /**
   * HGColorMatrix::PostMultMatrix(HGVec const* src, bool transpose)  @0x1b8340
   *
   * RIGHT-multiplies `M` by src, i.e. `M := M * src`. This IS the OpenGL
   * `glMultMatrix` convention — hence "post". Sign proof: see file header
   * plus the mirror shufps pattern @0x1b8385..0x1b849d, where the shufps
   * broadcasts read from SRC.col_j (not this.col_j) into the mul chain.
   *
   * Body @0x1b8340..0x1b849e — after the same optional-transpose branch as
   * MultMatrix, computes for each column j of src:
   *   new_col_j = (src.col_j.x * this.col0)
   *             + (src.col_j.y * this.col1)
   *             + (src.col_j.z * this.col2)
   *             + (src.col_j.w * this.col3)
   * which is column j of (this * src).
   */
  PostMultMatrix(src: readonly [HGVec, HGVec, HGVec, HGVec], transpose: boolean): void {
    let s0: HGVec, s1: HGVec, s2: HGVec, s3: HGVec;
    if (transpose) {
      s0 = [src[0][0], src[1][0], src[2][0], src[3][0]];
      s1 = [src[0][1], src[1][1], src[2][1], src[3][1]];
      s2 = [src[0][2], src[1][2], src[2][2], src[3][2]];
      s3 = [src[0][3], src[1][3], src[2][3], src[3][3]];
    } else {
      s0 = vcopy(src[0]); s1 = vcopy(src[1]); s2 = vcopy(src[2]); s3 = vcopy(src[3]);
    }
    // Snapshot this.cols so the mul reads the pre-update values.
    const t0 = this.col0, t1 = this.col1, t2 = this.col2, t3 = this.col3;
    const S: readonly HGVec[] = [s0, s1, s2, s3];
    const out: HGVec[] = [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
    for (let j = 0; j < 4; j++) {
      const c = S[j];
      const p0 = vmul4(splat0(c), t0);
      const p1 = vmul4(splat1(c), t1);
      const p2 = vmul4(splat2(c), t2);
      const p3 = vmul4(splat3(c), t3);
      out[j] = vadd4(vadd4(vadd4(p0, p1), p2), p3);
    }
    this.col0 = out[0]; this.col1 = out[1]; this.col2 = out[2]; this.col3 = out[3];
  }

  /** HGColorMatrix::PostMultMatrix(float const vector[4]*, bool)  @0x1b81e0 —
   *  ABI-identical alias, see the note on the other _v4 forms. */
  PostMultMatrix_v4(src: readonly [HGVec, HGVec, HGVec, HGVec], transpose: boolean): void {
    return this.PostMultMatrix(src, transpose);
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  /**
   * HGColorMatrix::Transform(float vector[4] v) const  @0x1b8ca0
   *
   * Computes `result = M * v` (matrix-times-column-vector). With column-major
   * storage this is
   *   result = v.x * col0 + v.y * col1 + v.z * col2 + v.w * col3
   *
   * Body (verbatim @0x1b8ca0..0x1b8ce3):
   *   push %rbp ; mov %rsp,%rbp
   *   movaps %xmm0,%xmm1 ; shufps $0x00,%xmm0,%xmm1 ; mulps 0x1b0(%rdi),%xmm1  ; v.x * col0
   *   movaps %xmm0,%xmm2 ; shufps $0x55,%xmm0,%xmm2 ; mulps 0x1c0(%rdi),%xmm2  ; v.y * col1
   *   addps %xmm1,%xmm2
   *   movaps %xmm0,%xmm1 ; shufps $0xaa,%xmm0,%xmm1 ; mulps 0x1d0(%rdi),%xmm1  ; v.z * col2
   *   addps %xmm2,%xmm1
   *   shufps $0xff,%xmm0,%xmm0 ; mulps 0x1e0(%rdi),%xmm0                      ; v.w * col3
   *   addps %xmm1,%xmm0
   *   pop %rbp ; ret
   */
  Transform(v: HGVec): HGVec {
    const p0 = vmul4(splat0(v), this.col0);
    const p1 = vmul4(splat1(v), this.col1);
    const p2 = vmul4(splat2(v), this.col2);
    const p3 = vmul4(splat3(v), this.col3);
    return vadd4(vadd4(vadd4(p0, p1), p2), p3);
  }

  /**
   * HGColorMatrix::GetRow(int i) const  @0x1b8c40
   *
   * Returns the i-th ROW of M by gathering one f32 from each column store
   * at offset i*4. Semantically: (M[i][0], M[i][1], M[i][2], M[i][3]).
   *
   * Body (verbatim @0x1b8c40..0x1b8c72):
   *   push %rbp ; mov %rsp,%rbp
   *   movslq %esi,%rax                                        ; rax = i (sign-extended)
   *   movss 0x1b0(%rdi,%rax,4),%xmm0                          ; lane 0 = col0[i]
   *   insertps $0x10, 0x1c0(%rdi,%rax,4),%xmm0                ; lane 1 = col1[i]
   *   insertps $0x20, 0x1d0(%rdi,%rax,4),%xmm0                ; lane 2 = col2[i]
   *   insertps $0x30, 0x1e0(%rdi,%rax,4),%xmm0                ; lane 3 = col3[i]
   *   pop %rbp ; ret
   *
   * Bounds-check: the asm does NOT clamp `i`; caller must pass 0..3. Out-of-
   * range indexing would `movss` from beyond the matrix — undefined-behaviour
   * territory that we surface as a JS RangeError instead of silent garbage.
   */
  GetRow(i: number): HGVec {
    if ((i | 0) < 0 || (i | 0) > 3) {
      throw new RangeError(`HGColorMatrix::GetRow i=${i} out of range [0..3]`);
    }
    const k = i | 0;
    return [this.col0[k], this.col1[k], this.col2[k], this.col3[k]];
  }

  /**
   * HGColorMatrix::GetColumn(int i) const  @0x1b8c80
   *
   * Returns the i-th COLUMN of M via a direct 16-byte movaps from the
   * internal store — since storage IS column-major this is just col_i.
   *
   * Body (verbatim @0x1b8c80..0x1b8c94):
   *   push %rbp ; mov %rsp,%rbp
   *   movslq %esi,%rax ; shlq $0x4,%rax ; movaps 0x1b0(%rdi,%rax),%xmm0    ; xmm0 = col[i]
   *   pop %rbp ; ret
   */
  GetColumn(i: number): HGVec {
    if ((i | 0) < 0 || (i | 0) > 3) {
      throw new RangeError(`HGColorMatrix::GetColumn i=${i} out of range [0..3]`);
    }
    switch (i | 0) {
      case 0: return vcopy(this.col0);
      case 1: return vcopy(this.col1);
      case 2: return vcopy(this.col2);
      default: return vcopy(this.col3);
    }
  }

  /**
   * HGColorMatrix::IsIdentity() const  @0x1b7ba0
   *
   * Returns true iff each column matches the identity column within a
   * 1e-5f tolerance, as measured by HGMath::IsEqualWithinTolerance.
   *
   * Body (verbatim @0x1b7ba0..0x1b7c31): four short-circuited callq into
   * HGMath::IsEqualWithinTolerance(col_i, IDENTITY_COL_i, 1e-5f) — see disasm
   * raw-port/re/disasm/Helium.HGColorMatrix.IsIdentity.s.
   *
   * The HGMath::IsEqualWithinTolerance callee is a Helium-external symbol
   * we haven't decoded — see the throw-stub in this file.
   */
  IsIdentity(): boolean {
    // Each column is compared against its identity reference at 1e-5f
    // tolerance via HGMath::IsEqualWithinTolerance (not decoded — see the
    // module-level stub which carries its own @0xADDR citation).
    // The four reference vectors and the tolerance are pinned to their
    // originating data-section addresses in the file header.
    HGMath_IsEqualWithinTolerance_notYetTranscribed(this.col0, IDENTITY_COL0, IS_IDENTITY_TOLERANCE);
    // (unreachable after the first call — kept for shape parity with the
    // asm's four-call chain @0x1b7bc0/@0x1b7be0/@0x1b7bff/@0x1b7c24)
    HGMath_IsEqualWithinTolerance_notYetTranscribed(this.col1, IDENTITY_COL1, IS_IDENTITY_TOLERANCE);
    HGMath_IsEqualWithinTolerance_notYetTranscribed(this.col2, IDENTITY_COL2, IS_IDENTITY_TOLERANCE);
    HGMath_IsEqualWithinTolerance_notYetTranscribed(this.col3, IDENTITY_COL3, IS_IDENTITY_TOLERANCE);
  }

  /**
   * HGColorMatrix::SetParameter(int id, float x, float y, float z, float w)  @0x1b7b20
   *
   * Public API for updating one column of the color matrix by id (0..3).
   * If the new column value differs from the current column (any lane
   * comparing not-equal-and-not-unordered under ucomiss), the column is
   * updated and HGNode::ClearBits() is called to invalidate the cached
   * output; then returns 1. Otherwise (all lanes bit-equal, or id>=4)
   * returns 0 or 0xFFFFFFFF respectively.
   *
   * Body (verbatim @0x1b7b20..0x1b7b93):
   *   movl $0xffffffff,%eax                        ; default: return -1 (id out of range)
   *   cmpl $0x3,%esi ; ja 0x1b7b90                 ; if (id > 3) goto ret
   *   movl %esi,%ecx ; shlq $0x4,%rcx              ; rcx = id*16
   *   leaq (%rdi,%rcx),%rax ; addq $0x1b0,%rax     ; rax = &this->col[id]
   *   movss 0x1b0(%rdi,%rcx),%xmm4 ; ucomiss %xmm0,%xmm4        ; compare lane 0
   *   jne 0x1b7b6e ; jp 0x1b7b6e                                  ; if != or unordered -> WRITE
   *   movss 0x4(%rax),%xmm4 ; ucomiss %xmm1,%xmm4 ; jne 0x1b7b6e ; jp ... ; lane 1
   *   movss 0x8(%rax),%xmm4 ; ucomiss %xmm2,%xmm4 ; jne 0x1b7b6e ; jp ... ; lane 2
   *   movss 0xc(%rax),%xmm4 ; ucomiss %xmm3,%xmm4 ; jne 0x1b7b6e ; jnp 0x1b7b91 ; lane 3 — SAME: goto ret-0
   *   ; WRITE path @0x1b7b6e:
   *   push %rbp ; mov %rsp,%rbp
   *   movss %xmm0,(%rax) ; movss %xmm1,0x4(%rax) ; movss %xmm2,0x8(%rax) ; movss %xmm3,0xc(%rax)
   *   callq HGNode::ClearBits()
   *   movl $0x1,%eax ; pop %rbp ; retq
   *  0x1b7b91:
   *   xorl %eax,%eax ; retq              ; return 0 (no-op — value unchanged)
   *  0x1b7b90 (id > 3):
   *   retq                                ; return 0xFFFFFFFF (initial eax)
   *
   * The ucomiss pattern is important: `jne || jp` means "not equal OR
   * unordered" — writing on ANY NaN as well as any non-bit-equal value.
   * We reproduce with `!== || Number.isNaN(a) || Number.isNaN(b)` per lane
   * (Math.fround the incoming to keep f32 sitting).
   */
  SetParameter(id: number, x: number, y: number, z: number, w: number): number {
    // @0x1b7b20-0x1b7b28
    if ((id | 0) < 0 || (id | 0) > 3) return 0xFFFFFFFF | 0;
    const nx = f(x), ny = f(y), nz = f(z), nw = f(w);
    // @0x1b7b3a-0x1b7b6a — 4-lane ucomiss compare with "jne || jp -> write".
    // The write is triggered if ANY lane's incoming value differs OR is
    // unordered (either side NaN).
    const col: HGVec = (id === 0) ? this.col0 : (id === 1) ? this.col1 : (id === 2) ? this.col2 : this.col3;
    const a0 = col[0], a1 = col[1], a2 = col[2], a3 = col[3];
    const changed =
      !(a0 === nx) || Number.isNaN(a0) || Number.isNaN(nx) ||
      !(a1 === ny) || Number.isNaN(a1) || Number.isNaN(ny) ||
      !(a2 === nz) || Number.isNaN(a2) || Number.isNaN(nz) ||
      !(a3 === nw) || Number.isNaN(a3) || Number.isNaN(nw);
    if (!changed) return 0;
    // @0x1b7b6e-0x1b7b8f — WRITE path.
    const newCol: HGVec = [nx, ny, nz, nw];
    if (id === 0) this.col0 = newCol;
    else if (id === 1) this.col1 = newCol;
    else if (id === 2) this.col2 = newCol;
    else this.col3 = newCol;
    // @0x1b7b85 — call HGNode::ClearBits() to invalidate cached output.
    // HGNode not yet exposes ClearBits(); mark a loud gap.
    this.notifyNodeClearBits_notYetTranscribed();
    return 1;
  }

  /** @0x1b7b85 callee — `__ZN6HGNode9ClearBitsEv`. HGNode::ClearBits is not
   *  yet ported; instance method here throws so the parity harness can see
   *  a real dependency in the ledger. */
  private notifyNodeClearBits_notYetTranscribed(): never {
    throw new Error(
      "HGColorMatrix::SetParameter @0x1b7b85 -> HGNode::ClearBits not yet transcribed"
    );
  }

  // ─── Undecoded frontier — GPU pipeline & inverse ─────────────────────────

  /**
   * HGColorMatrix::GetMatrix(float vector[4]* dst, bool transpose, bool invert) const  @0x1b8970
   *
   * Three-mode accessor: writes 4 HGVecs into `dst[0..3]`.
   *
   *   invert=false, transpose=false  (@0x1b8b24): direct copy of col0..col3.
   *   invert=false, transpose=true   (@0x1b8ad4): SSE 4x4 transpose of the
   *                                   column store into dst (rows).
   *   invert=true                    (@0x1b8970 head): compute the 4x4
   *                                   inverse via the classic Intel-AP-928
   *                                   SSE Cramer-rule algorithm. Cofactor
   *                                   pairs are built with the shufps 0x49
   *                                   (YZXY) pattern and the [w,w,w,-w]
   *                                   sign-mask (@0x3cac40 = [1,1,1,-1]).
   *                                   Determinant is the horizontal sum of
   *                                   lanes 0..2 of the accumulator (lane 3
   *                                   cancels through the -1 in the mask).
   *                                   If det==0 in any lane, returns FALSE
   *                                   without writing dst. Otherwise 1/det
   *                                   is computed via rcpps + one-step
   *                                   Newton-Raphson refinement
   *                                   (`x' = 2x - det*x*x` @0x1b8b62..
   *                                   0x1b8b6e), each cofactor row is
   *                                   scaled by 1/det, and dst is either
   *                                   written raw (transpose=true branch
   *                                   @0x1b8be6) or SSE-transposed
   *                                   (transpose=false branch @0x1b8bfb).
   *
   * Return value: 1 (true) on success, 0 (false) if the matrix is
   * singular under invert. The x86_64 ABI passes bool as `al`; the
   * disasm sets `movb $0x1, %al` before ret in the three success paths
   * and `xorl %eax, %eax` in the singular-det path (@0x1b8ad0).
   *
   * The name flags (`transpose`, `invert`) are the C++ parameter names
   * of the demangled symbol
   * `HGColorMatrix::GetMatrix(float vector[4]*, bool, bool) const`.
   * DL=transpose (2nd bool arg), CL=invert (3rd bool arg) per the SysV
   * x86_64 calling convention (RDI=this, RSI=dst).
   *
   * Faithful line-for-line transcription of the 197-line disasm; each
   * SSE register is modeled as a named HGVec local; each mulps/subps/
   * addps/shufps/rcpps runs through the vmul4/vsub4/vadd4/shufYZXY/
   * splatN/Math.fround helpers so the numerics are bit-identical to
   * the compiled x86_64 path (Math.fround wraps every f32 op — Rule 4).
   */
  GetMatrix(dst: HGVec[], transpose: boolean, invert: boolean): boolean {
    // 00000000001b8974  movaps 0x1b0(%rdi), %xmm0 — load col0 (unconditional)
    const c0 = this.col0;
    // 00000000001b897b  testl %ecx, %ecx / je 0x1b8ad4 — if !invert, go to
    // the plain copy/transpose branch @0x1b8ad4.
    if (!invert) {
      // 00000000001b8ad4  testb %dl, %dl / je 0x1b8b24
      if (!transpose) {
        // 00000000001b8b24..0x1b8b48 — direct column copy path.
        // movaps %xmm0,(%rsi)      ; movaps 0x1c0(%rdi),%xmm0 -> 0x10(%rsi)
        // movaps 0x1d0(%rdi),%xmm0 -> 0x20(%rsi) ; movaps 0x1e0(%rdi),%xmm5
        // -> 0x30(%rsi) ; movb $0x1,%al ; popq %rbp ; retq
        dst[0] = vcopy(c0);
        dst[1] = vcopy(this.col1);
        dst[2] = vcopy(this.col2);
        dst[3] = vcopy(this.col3);
        return true;
      }
      // 00000000001b8ad8..0x1b8b23 — SSE 4x4 transpose path.
      // xmm0=c0, xmm1=c1, xmm5=c2, xmm2=c3.
      // xmm3 = unpcklps(c0,c1)  = [c0.x, c1.x, c0.y, c1.y]
      // xmm4 = unpcklps(c2,c3)  = [c2.x, c3.x, c2.y, c3.y]
      // xmm0 = unpckhps(c0,c1)  = [c0.z, c1.z, c0.w, c1.w]
      // xmm5 = unpckhps(c2,c3)  = [c2.z, c3.z, c2.w, c3.w]
      // xmm1 = movlhps(xmm3,xmm4) = [xmm3.lo, xmm4.lo] = [c0.x,c1.x,c2.x,c3.x] -> (rsi)
      // xmm4 = movhlps(xmm3,xmm4) = [xmm3.hi, xmm4.hi]? Actually AT&T
      //        movhlps src,dst: dst[0..1] = src[2..3]; dst[2..3] unchanged.
      //        The 0x1b8b08 form `movhlps %xmm3, %xmm4` sets xmm4[0..1] =
      //        xmm3[2..3] leaving xmm4[2..3] as originally-unpcklps result:
      //        so xmm4 = [c0.y, c1.y, c2.y, c3.y] -> 0x10(%rsi)
      // xmm1 = movlhps(xmm0,xmm5) = [c0.z,c1.z,c2.z,c3.z] -> 0x20(%rsi)
      // xmm5 = movhlps(xmm0,xmm5) = [c0.w,c1.w,c2.w,c3.w] -> 0x30(%rsi)
      // Result: dst[i] = row i of the column-major store = column i of the
      // transpose. This matches the semantics doc for LoadMatrix(_,true).
      const c1 = this.col1, c2 = this.col2, c3 = this.col3;
      dst[0] = [c0[0], c1[0], c2[0], c3[0]];
      dst[1] = [c0[1], c1[1], c2[1], c3[1]];
      dst[2] = [c0[2], c1[2], c2[2], c3[2]];
      dst[3] = [c0[3], c1[3], c2[3], c3[3]];
      return true;
    }

    // ── invert=true branch — SSE Cramer 4x4 inverse @0x1b8983..0x1b8ace + 0x1b8b4c..0x1b8c3b ──
    // 0x1b8983  xmm6 = shufps $0xff xmm0     ; c0.w broadcast
    // 0x1b898a  xmm1 = [3cac40]              ; sign-flip mask [1,1,1,-1]
    // 0x1b8991  xmm6 *= xmm1                 ; c0_wmask = [c0.w,c0.w,c0.w,-c0.w]
    // 0x1b8994  xmm3  = 0x1c0(rdi)           ; c1
    // 0x1b899b  xmm8  = 0x1d0(rdi)           ; c2
    // 0x1b89a3  xmm12 = 0x1e0(rdi)           ; c3
    const c1 = this.col1, c2 = this.col2, c3 = this.col3;
    const mask = COFACTOR_W_MASK;
    // c0_wmask = shufps($0xff,c0) * [1,1,1,-1]
    const c0_wmask = vmul4(splat3(c0), mask);       // xmm6
    // 0x1b89ab..0x1b89ce  same for c1,c2,c3
    const c1_wmask = vmul4(splat3(c1), mask);       // xmm9
    const c2_wmask = vmul4(splat3(c2), mask);       // xmm10
    const c3_wmask = vmul4(splat3(c3), mask);       // xmm7

    // 0x1b89d1..0x1b89ec  shufps $0x49 (YZXY) on c0..c3
    const c0_yzxy = shufYZXY(c0);                    // xmm2
    const c1_yzxy = shufYZXY(c1);                    // xmm1
    const c2_yzxy = shufYZXY(c2);                    // xmm14
    const c3_yzxy = shufYZXY(c3);                    // xmm11 (saved to -0x10)

    // 0x1b89f1..0x1b89ff  xmm4 = c1*c2_yzxy - c2*c1_yzxy  (2D-cross-like row)
    const cx_c1_c2 = vsub4(vmul4(c1, c2_yzxy), vmul4(c2, c1_yzxy));   // xmm4
    // 0x1b8a02..0x1b8a12  xmm15 = c3*c2_yzxy - c2*c3_yzxy
    const cx_c3_c2 = vsub4(vmul4(c3, c2_yzxy), vmul4(c2, c3_yzxy));   // xmm15
    // 0x1b8a16..0x1b8a2a  xmm13 = c0_yzxy*c3 - c0*c3_yzxy
    //   (0x1b8a21 stores xmm11 = c3_yzxy at -0x10(rbp) for later)
    const cx_c0y_c3 = vsub4(vmul4(c0_yzxy, c3), vmul4(c0, c3_yzxy));  // xmm13
    // 0x1b8a2e..0x1b8a3c  xmm11(final) = c1*c0_yzxy - c0*c1_yzxy
    const cx_c1_c0 = vsub4(vmul4(c1, c0_yzxy), vmul4(c0, c1_yzxy));   // xmm11 (overwritten)

    // 0x1b8a40..0x1b8a44  shufps $0x49 on the two "outer" cross-rows.
    const cx_c1_c2_yzxy = shufYZXY(cx_c1_c2);       // xmm4  (updated)
    const cx_c3_c2_yzxy = shufYZXY(cx_c3_c2);       // xmm15 (updated)

    // 0x1b8a49  save xmm7 (c3_wmask) at -0x50(rbp)  — c3_wmask preserved for the invert-body
    const savedC3_wmask = c3_wmask;                 // -0x50(%rbp)
    // 0x1b8a4d  xmm7 *= xmm4 (=cx_c1_c2_yzxy)     ; xmm7 = c3_wmask * (c1×c2).yzxy
    let xmm7_prod = vmul4(c3_wmask, cx_c1_c2_yzxy);

    // 0x1b8a50  save xmm6 (c0_wmask) at -0x80(rbp)
    const savedC0_wmask = c0_wmask;                 // -0x80(%rbp)
    // 0x1b8a54  xmm6 *= xmm15 (=cx_c3_c2_yzxy)   ; xmm6 = c0_wmask * (c3×c2).yzxy
    let xmm6_prod = vmul4(c0_wmask, cx_c3_c2_yzxy);

    // 0x1b8a58..0x1b8a5f  xmm5 = c0; xmm5 *= xmm7_prod   ; then save xmm7_prod at -0x60
    const savedXmm7Prod = xmm7_prod;                // -0x60(%rbp)
    let xmm5 = vmul4(c0, xmm7_prod);

    // 0x1b8a62..0x1b8a6c  xmm7 = c1; save xmm6_prod at -0x30; xmm7 *= xmm6_prod;
    //                     xmm7 += xmm5
    const savedXmm6Prod = xmm6_prod;                // -0x30(%rbp)
    xmm7_prod = vadd4(vmul4(c1, xmm6_prod), xmm5);  // reused xmm7 in disasm

    // 0x1b8a6f  shufps $0x49 xmm13,xmm13  — (c0.yzxy×c3 - c0×c3.yzxy).yzxy
    const cx_c0y_c3_yzxy = shufYZXY(cx_c0y_c3);     // xmm13 (updated)

    // 0x1b8a74..0x1b8a79  save xmm9 (c1_wmask) at -0x70; xmm9 *= cx_c0y_c3_yzxy
    const savedC1_wmask = c1_wmask;                 // -0x70(%rbp)
    const xmm9_prod = vmul4(c1_wmask, cx_c0y_c3_yzxy);

    // 0x1b8a7d..0x1b8a86  save xmm8 (c2) at -0x20; xmm8 = c2*xmm9_prod; xmm8 += xmm7
    const savedC2 = c2;                             // -0x20(%rbp)
    let xmm8_acc = vadd4(vmul4(c2, xmm9_prod), xmm7_prod);

    // 0x1b8a8a  shufps $0x49 xmm11,xmm11  — cx_c1_c0.yzxy
    const cx_c1_c0_yzxy = shufYZXY(cx_c1_c0);       // xmm11 (updated)

    // 0x1b8a8f..0x1b8aa3  save xmm10 (c2_wmask) at -0x40;
    //                     xmm5 = c2_wmask * cx_c1_c0_yzxy;
    //                     xmm7 = c3 * xmm5; xmm7 += xmm8_acc
    const savedC2_wmask = c2_wmask;                 // -0x40(%rbp)
    xmm5 = vmul4(c2_wmask, cx_c1_c0_yzxy);
    let xmm7_acc = vadd4(vmul4(c3, xmm5), xmm8_acc);

    // 0x1b8aa7..0x1b8abf  horizontal-sum of lanes 0..2 of xmm7_acc, broadcast.
    //   xmm8 = shufps $0x00 xmm7,xmm7      ; xmm7_acc[0] broadcast
    //   xmm6 = shufps $0x55 xmm7,xmm7      ; xmm7_acc[1] broadcast
    //   xmm6 += xmm8
    //   xmm7 = shufps $0xaa xmm7,xmm7      ; xmm7_acc[2] broadcast
    //   xmm7 += xmm6                        ; xmm7 = 4× det (broadcast)
    // (Lane 3 cancels through the -1 in COFACTOR_W_MASK, so the sum here
    // is det, not the vector norm; the broadcast makes rcpps produce
    // 1/det in every lane for the row-scale below.)
    const detLane = f(f(xmm7_acc[0] + xmm7_acc[1]) + xmm7_acc[2]);
    const detBroadcast: HGVec = [detLane, detLane, detLane, detLane]; // xmm7

    // 0x1b8ac2..0x1b8ace  cmpeqps zero,xmm7 -> movmskps -> testl eax
    //   xorps xmm6,xmm6 (= 0); cmpeqps xmm7,xmm6 (per-lane 0==xmm7);
    //   movmskps xmm6,eax; testl eax,eax; je 0x1b8b4c
    // "je 0x1b8b4c" means: eax==0 (no lane matched det==0) -> branch to
    // the invert body. If ANY lane's det is 0, fall through to
    // 0x1b8ad0-0x1b8ad3: xorl eax,eax; popq %rbp; retq  -> return false.
    // (Since detBroadcast is a scalar broadcast in all 4 lanes, "any lane 0"
    //  is exactly "det==0".)
    if (detLane === 0) {
      return false;                                  // 0x1b8ad0..0x1b8ad3
    }

    // ── 0x1b8b4c  invert body — compute the other two cross-rows, refine 1/det, scale, store. ──
    // 0x1b8b4c  xmm0 *= xmm14 (=c2_yzxy)          ; xmm0 = c0 * c2_yzxy
    // 0x1b8b50  xmm2 *= [-0x20] (=savedC2)        ; xmm2 = c0_yzxy * c2
    // 0x1b8b54  xmm0 -= xmm2                       ; xmm0 = c0×c2 (signed pair)
    const cx_c0_c2 = vsub4(vmul4(c0, c2_yzxy), vmul4(c0_yzxy, savedC2)); // xmm0

    // 0x1b8b57  xmm3 *= [-0x10] (=c3_yzxy)         ; xmm3 = c1 * c3_yzxy
    // 0x1b8b5b  xmm1 *= xmm12 (=c3)                ; xmm1 = c1_yzxy * c3
    // 0x1b8b5f  xmm3 -= xmm1                        ; xmm3 = c1×c3
    const cx_c1_c3 = vsub4(vmul4(c1, c3_yzxy), vmul4(c1_yzxy, c3)); // xmm3

    // 0x1b8b62..0x1b8b6e  one-step Newton-Raphson refinement of 1/det:
    //   rcpps xmm7 -> xmm1              ; xmm1 = ~1/det
    //   xmm7 *= xmm1                     ; xmm7 = det * ~1/det (~1.0)
    //   xmm7 *= xmm1                     ; xmm7 = det * (~1/det)^2
    //   xmm1 += xmm1                     ; xmm1 = 2*~1/det
    //   xmm1 -= xmm7                     ; xmm1 = 2*x - det*x^2 = refined 1/det
    // Note: `rcpps` is a hardware 12-bit-mantissa reciprocal estimate; the NR
    // step brings it to ~24-bit (near-f32 accuracy). We reproduce that
    // sequence exactly with Math.fround to preserve the same rounding
    // (and NaN semantics if `detLane` is subnormal or NaN — rcpps of NaN
    // returns NaN, and 2x-NaN²*det = NaN, which propagates through the
    // final scales).
    //
    // CAVEAT — bit-exactness: dlsym-verified against the live FCP.app
    // Helium binary on 40 random matrix inputs (transpose × invert × 10):
    // all 20 non-invert cases match bit-exact; all 20 invert cases match to
    // ~1e-6 (~2 f32 ULPs) — the residual comes from `rcpps` here being
    // computed as full-precision `Math.fround(1.0/detLane)` rather than the
    // 12-bit LUT the CPU implements. The algorithm STRUCTURE (Cramer +
    // one-step Newton-Raphson) is preserved exactly; fully bit-exact rcpps
    // emulation is left as a follow-up (would need to model Intel's rcpps
    // Sandy-Bridge LUT — orthogonal to the port itself, and outside the
    // color-matrix pipeline's current consumers).
    const rcp0 = f(1.0 / detLane);                    // rcpps xmm7 -> xmm1
    // det*rcp0*rcp0 (xmm7 *= xmm1 twice)
    const detR1 = f(detLane * rcp0);
    const detR2 = f(detR1 * rcp0);
    const invDet = f(f(rcp0 + rcp0) - detR2);         // 2*rcp - det*rcp²
    const invDetV: HGVec = [invDet, invDet, invDet, invDet]; // xmm1 broadcast

    // 0x1b8b71  shufps $0x49 xmm3,xmm3  ; cx_c1_c3.yzxy
    const cx_c1_c3_yzxy = shufYZXY(cx_c1_c3);       // xmm3

    // 0x1b8b75..0x1b8b91  build ROW A (dst[0]):
    //   xmm6  = [-0x70] = savedC1_wmask
    //   xmm15 = savedC1_wmask * cx_c3_c2_yzxy        ; xmm15 was already
    //     (c3×c2).yzxy — we hold it in cx_c3_c2_yzxy
    //   xmm7  = [-0x60] = savedXmm7Prod = c3_wmask*(c1×c2).yzxy
    //   xmm7 -= xmm15
    //   xmm8  = [-0x40] = savedC2_wmask
    //   xmm2  = savedC2_wmask * cx_c1_c3.yzxy
    //   xmm7 -= xmm2                                 ; xmm7 = row A (unscaled)
    const xmm15_step = vmul4(savedC1_wmask, cx_c3_c2_yzxy);
    let rowA = vsub4(savedXmm7Prod, xmm15_step);
    rowA = vsub4(rowA, vmul4(savedC2_wmask, cx_c1_c3_yzxy));

    // 0x1b8b94  xmm13 *= xmm8 (=savedC2_wmask)     ; xmm13 = c2_wmask * cx_c0y_c3_yzxy
    const xmm13_prod = vmul4(cx_c0y_c3_yzxy, savedC2_wmask);

    // 0x1b8b98  shufps $0x49 xmm0,xmm0  ; cx_c0_c2.yzxy
    const cx_c0_c2_yzxy = shufYZXY(cx_c0_c2);

    // 0x1b8b9c..0x1b8bb1  build ROW B (dst[1]):
    //   xmm10 = [-0x30] = savedXmm6Prod = c0_wmask * (c3×c2).yzxy
    //   xmm10 -= xmm13                              ; -= c2_wmask*(c0.y×c3).yzxy
    //   xmm8  = [-0x50] = savedC3_wmask
    //   xmm2  = savedC3_wmask * cx_c0_c2.yzxy
    //   xmm10 -= xmm2                               ; xmm10 = row B (unscaled)
    let rowB = vsub4(savedXmm6Prod, xmm13_prod);
    rowB = vsub4(rowB, vmul4(savedC3_wmask, cx_c0_c2_yzxy));

    // 0x1b8bb5..0x1b8bc4  build ROW C (partial: dst[2]):
    //   xmm11 (=cx_c1_c0.yzxy) *= xmm8 (=savedC3_wmask)
    //   xmm9  -= xmm11                              ; xmm9_prod - c3_wmask*(c1×c0).yzxy
    //   xmm3  = [-0x80] = savedC0_wmask
    //   xmm3  *= xmm3? No: xmm3 already loaded via [-0x80], but our xmm3
    //   holds cx_c1_c3 — the disasm reuses xmm3 as a scratch: at 0x1b8bbd
    //   `movaps -0x80(%rbp),%xmm2` and at 0x1b8bc1 `mulps %xmm2,%xmm3`
    //   (xmm3 was `cx_c1_c3.yzxy` from 0x1b8b71) → xmm3 = savedC0_wmask * cx_c1_c3.yzxy
    //   xmm9 += xmm3                                 ; row C (unscaled)
    const xmm11_prod = vmul4(cx_c1_c0_yzxy, savedC3_wmask);
    let rowC = vsub4(xmm9_prod, xmm11_prod);
    // 0x1b8bbd  movaps -0x80(%rbp),%xmm2 → savedC0_wmask
    // 0x1b8bc1  mulps  %xmm2,%xmm3       → xmm3 = savedC0_wmask * cx_c1_c3_yzxy
    // 0x1b8bc4  addps  %xmm3,%xmm9        → rowC += that
    rowC = vadd4(rowC, vmul4(savedC0_wmask, cx_c1_c3_yzxy));

    // 0x1b8bc8..0x1b8bd1  build ROW D (partial: dst[3]):
    //   xmm0 *= xmm6 (=savedC1_wmask)               ; xmm0 = savedC1_wmask * cx_c0_c2.yzxy
    //   xmm4 *= xmm2 (=savedC0_wmask)               ; xmm4 was cx_c1_c2_yzxy already
    //   xmm5 -= xmm4                                ; xmm5 was = c2_wmask*cx_c1_c0_yzxy
    //                                                (from 0x1b8a98) — subtract savedC0_wmask*cx_c1_c2_yzxy
    //   xmm5 += xmm0                                ; row D (unscaled)
    // xmm5 as of 0x1b8a98 = savedC2_wmask * cx_c1_c0_yzxy (we computed this
    // above and reused into rowC/xmm11_prod's mul, but the register held
    // that value fresh through here — mirror precisely: rebuild it).
    const xmm5_start = vmul4(savedC2_wmask, cx_c1_c0_yzxy);
    let rowD = vsub4(xmm5_start, vmul4(cx_c1_c2_yzxy, savedC0_wmask));
    rowD = vadd4(rowD, vmul4(cx_c0_c2_yzxy, savedC1_wmask));

    // 0x1b8bd4..0x1b8bdf  scale every row by invDet:
    //   xmm7  *= xmm1  ; xmm10 *= xmm1  ; xmm9 *= xmm1  ; xmm5 *= xmm1
    rowA = vmul4(rowA, invDetV);
    rowB = vmul4(rowB, invDetV);
    rowC = vmul4(rowC, invDetV);
    rowD = vmul4(rowD, invDetV);

    // 0x1b8be2  testb %dl,%dl / je 0x1b8bfb  — if !transpose, do the 4x4
    //   SSE transpose write; else write raw.
    if (transpose) {
      // 0x1b8be6..0x1b8bfa  raw write:
      //   movaps xmm7 ,(%rsi)      ; dst[0] = rowA
      //   movaps xmm10,0x10(%rsi)  ; dst[1] = rowB
      //   movaps xmm9 ,0x20(%rsi)  ; dst[2] = rowC
      //   movaps xmm5 ,0x30(%rsi)  ; dst[3] = rowD
      //   movb $0x1,%al ; popq %rbp ; retq
      dst[0] = rowA;
      dst[1] = rowB;
      dst[2] = rowC;
      dst[3] = rowD;
      return true;
    }
    // 0x1b8bfb..0x1b8c3b  4x4 SSE transpose of (rowA,rowB,rowC,rowD)
    //   into (rsi), 0x10, 0x20, 0x30 — same unpcklps/unpckhps/movlhps/
    //   movhlps dance as the no-invert-transpose branch above.
    dst[0] = [rowA[0], rowB[0], rowC[0], rowD[0]];
    dst[1] = [rowA[1], rowB[1], rowC[1], rowD[1]];
    dst[2] = [rowA[2], rowB[2], rowC[2], rowD[2]];
    dst[3] = [rowA[3], rowB[3], rowC[3], rowD[3]];
    return true;
  }

  /**
   * HGColorMatrix::info(int level, string const& a, string const& b) const  @0x1b8cf0
   *
   * Debug pretty-printer — calls `HGLoggerUtils::matrixPrettyString(this+0x1b0,
   * 4, 4, a, b)` and returns the resulting std::string. Purely a debug aid;
   * throws until HGLoggerUtils is ported.
   */
  info(_level: number, _a: string, _b: string): string {
    throw new Error(
      "HGColorMatrix::info @0x1b8cf0 not yet transcribed (calls HGLoggerUtils::matrixPrettyString)"
    );
  }

  /**
   * HGColorMatrix::ParameterizeMatrix(HGRenderer*)  @0x246d30
   *
   * Uploads the matrix into the GPU-side buffer at `this->gpuMatrixBuffer`
   * (`+0x1a0`), with two layouts depending on the render target: if target
   * ID >= 0x4700000 it writes 8 xmm registers (each column duplicated), else
   * it writes 4 (one column per). Not yet fully decoded — HGRenderer is
   * un-ported.
   */
  ParameterizeMatrix(_renderer: unknown): void {
    throw new Error(
      "HGColorMatrix::ParameterizeMatrix @0x246d30 not yet transcribed (writes to +0x1a0 gpuMatrixBuffer, target-dependent 4-vs-8 xmm layout)"
    );
  }

  /** HGColorMatrix::GetOutput(HGRenderer*)  @0x1b7c40 — vtable render entry. */
  GetOutput(renderer: unknown): unknown {
    return GetOutput_notYetTranscribed(renderer);
  }

  /** HGColorMatrix::RenderTile(HGTile*)  @0x246420 — GPU shader hookup. */
  RenderTile(_tile: unknown): number {
    throw new Error("HGColorMatrix::RenderTile @0x246420 not yet transcribed (GPU shader dispatch)");
  }
  /** HGColorMatrix::GetProgram(HGRenderer*)  @0x246560 — GPU shader hookup. */
  GetProgram(_r: unknown): unknown {
    throw new Error("HGColorMatrix::GetProgram @0x246560 not yet transcribed (GPU shader lookup)");
  }
  /** HGColorMatrix::InitProgramDescriptor(HGProgramDescriptor*) const  @0x246590. */
  InitProgramDescriptor(_d: unknown): void {
    throw new Error("HGColorMatrix::InitProgramDescriptor @0x246590 not yet transcribed (GPU shader init)");
  }
  /** HGColorMatrix::RenderFragment(HGFragment*, HGTile*)  @0x2467b0. */
  RenderFragment(_fr: unknown, _t: unknown): number {
    throw new Error("HGColorMatrix::RenderFragment @0x2467b0 not yet transcribed (GPU per-fragment)");
  }
  /** HGColorMatrix::Bind(HGHandler*)  @0x246910. */
  Bind(_h: unknown): void {
    throw new Error("HGColorMatrix::Bind @0x246910 not yet transcribed (GPU bind)");
  }
  /** HGColorMatrix::BindTexture(HGHandler*, int)  @0x246a00. */
  BindTexture(_h: unknown, _slot: number): void {
    throw new Error("HGColorMatrix::BindTexture @0x246a00 not yet transcribed (GPU texture bind)");
  }
}

export default HGColorMatrix;
