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
   * When `invert=false` and `transpose=false`, copies col0..col3 into
   * dst[0..3]. When `invert=false, transpose=true`, writes the transpose
   * (row-major layout in dst). When `invert=true`, computes the 4x4 inverse
   * via cofactor expansion using SIMD rcpps + Newton-Raphson (rcpps %xmm7,%xmm1
   * ; mulps %xmm1,%xmm7 ; mulps %xmm1,%xmm7 ; addps %xmm1,%xmm1 ; subps %xmm7,%xmm1
   * @0x1b8b62-0x1b8b6e — a classic 1-iteration reciprocal refinement of the
   * determinant), and optionally transposes the adjugate. This is a 197-line
   * SIMD-inverse routine (see raw-port/re/disasm/Helium.HGColorMatrix.GetMatrix.s)
   * and porting it faithfully is a follow-up unit; we surface a throw here
   * per PORTING_SPEC Rule 3.
   */
  GetMatrix(_dst: HGVec[], _transpose: boolean, _invert: boolean): boolean {
    throw new Error(
      "HGColorMatrix::GetMatrix @0x1b8970 not yet transcribed (4x4 SIMD inverse — 197 lines of disasm; classic det = rcpps + NR-refinement, cofactor matrix expansion)"
    );
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
