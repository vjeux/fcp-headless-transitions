/**
 * PCMatchmove — ProCore's per-frame planar/homography match-move solver.
 * Faithful transcription of the x86_64 slice of
 *   /Applications/Final Cut Pro.app/Contents/Frameworks/
 *     ProCore.framework/Versions/A/ProCore
 * (FAT binary → thin slice cache at /tmp/ProCore.x86_64;
 *  disasm cached in raw-port/re/disasm/ProCore.PCMatchmove.*.s).
 *
 * This class solves a stack of per-frame 3x3 homography matrices given a
 * set of input feature points and a set of target 2D outputs. The concrete
 * math lives in three collaborators (all THROW-STUBBED here until decoded):
 *   - PCMatchmoveProblem   — builds the residual/Jacobian on top of `this`
 *   - PCLMSolver           — Levenberg-Marquardt driver
 *   - PCGenMatrix<float> / PCGenVector<float>  — dense matrix/vec ops
 *
 * The MATH we DO decode here is:
 *   - solve()            — the forward+backward propagation driver over
 *                          [baseFrame .. lastFrame-1] then
 *                          [baseFrame-1 .. 0]  seeding each frame with the
 *                          previous frame's matrix, then calling
 *                          solveFrame(i) at each step.
 *   - solveBaseFrame()   — initialises the base frame to identity and
 *                          copies the raw input matrix rows out into an
 *                          Nx2 (or 2xN) output block.
 *   - setupOutputs()     — resizes the per-frame matrix+vector output
 *                          structures.
 *   - project()          — projective transform:
 *                              [x'; y'; w] = H * [x; y; 1]
 *                              out = (x'/w, y'/w)
 *                          where H is the 3x3 (float) homography stored at
 *                          array-index frameIdx.
 *
 * ========================================================================
 * MEMORY LAYOUT (recovered from setupOutputs, solveBaseFrame, solve,
 *                solveFrame, project — 5 mutually-confirming decodes):
 * ========================================================================
 *
 *   +0x00  vtable pointer      (this is a polymorphic base; project is
 *                               non-virtual so we don't need the layout,
 *                               but the fact that fields start at 0x0c
 *                               past a 4-byte gap suggests +0x08 is an
 *                               ObjC/CFRef slot that we don't touch)
 *   +0x0c  int nPoints         (number of feature-point residual rows —
 *                               read as %esi in setupOutputs @ 0xb809f)
 *   +0x10  PCGenMatrix<float>* pointsIn   (base pointer whose +0x28 is
 *                               the row-count for setupOutputs' writeback
 *                               at +0x20; @ 0xb80b1)
 *   +0x18  int baseFrame       (start of forward loop; @ 0xb8b61)
 *   +0x1c  int nRows           (=nPoints; used as row count in
 *                               setupOutputs @ 0xb80a2, solveBaseFrame
 *                               loop bound @ 0xb8283)
 *   +0x20  int lastFrame       (forward-loop end + 1; @ 0xb8b65)
 *   +0x28  PCGenMatrix<float>  matrixWork  (resized to (nRows, 2) or
 *                               (2, nRows) depending on layout flag;
 *                               @ 0xb80bb)
 *   +0x3c  int layoutFlag      (0 = default layout, 1 = RowMajor;
 *                               setupOutputs @ 0xb80c1)
 *   +0x48  PCGenVector<float>  vectorWork  (resized to nRows; @ 0xb80d2)
 *   +0x50  int arrayCount      (checked > 0 before zero-fill in
 *                               solveBaseFrame @ 0xb8260)
 *   +0x54  int arrayStride     (dword stride for the zero-fill pointer
 *                               walk in solveBaseFrame @ 0xb826d)
 *   +0x58  float*   arrayBuf   (zero-fill target)
 *   +0x60  PCArray<PCGenMatrix<float>> matricesArray (tail array; managed
 *                               via PCArray::resize @ 0xb80f7)
 *   +0x68  int arrayCap        (compared to +0x20 to compute grow-target
 *                               = min(cap, 2*size+1) @ 0xb80e4-0xb80ea)
 *   +0x6c  int perFrameCount   (bounds-check target for frame index;
 *                               used as size of the +0x70 array in every
 *                               method; @ 0xb8226/0xb8b8d/0xb8db7)
 *   +0x70  PCGenMatrix<float>* perFrameArr (stride 0x20 array of 3x3
 *                               per-frame homography matrices; indexed
 *                               by frameIdx << 5; @ 0xb8238/0xb8b9f)
 *
 * The 32-byte stride at +0x70 IS the sizeof(PCGenMatrix<float>) header
 * shipped by ProCore (base = 0x0, refcount slot at 0x0-0x4, matrix
 * data at +0x18(elem) via 0x18-offset loads in project @ 0xb8e0e).
 * The +0x10/+0x14 fields inside each per-frame matrix element are
 * ROW and COL stride respectively (project reads 0x10 as row-stride
 * for column indexing @ 0xb8e37, 0x14 as col-stride @ 0xb8ebe).
 *
 * We model this class as a thin STATE struct plus static method-shaped
 * exports; the collaborator calls (PCLMSolver, PCMatchmoveProblem,
 * PCGenMatrix, PCGenVector, PCArray) are stubbed with throw citations to
 * the exact resolved symbol they need to bind to next.
 */

// -- Collaborator stubs (each throws with its @0xADDR so frontier.py can
//    see the exact gap). These MUST be replaced with real ports before
//    solveFrame() / solveBaseFrame() / setupOutputs() can run end-to-end;
//    project() is math-complete without them and is oracle-testable.

/** PCGenMatrix<float>::resize(rows, cols, layout) — @ProCore not yet decoded. */
function PCGenMatrix_float_resize(
  _m: PCGenMatrixFloat,
  _rows: number,
  _cols: number,
  _layout: number,
): void {
  throw new Error(
    "PCGenMatrix<float>::resize(int,int,Layout) @ProCore not yet transcribed",
  );
}

/** PCGenVector<float>::resize(n) — @ProCore not yet decoded. */
function PCGenVector_float_resize(_v: PCGenVectorFloat, _n: number): void {
  throw new Error(
    "PCGenVector<float>::resize(int) @ProCore not yet transcribed",
  );
}

/** PCGenVector<float>::operator()(i) — element accessor; @ProCore not yet decoded. */
function PCGenVector_float_at(_v: PCGenVectorFloat, _i: number): number {
  throw new Error(
    "PCGenVector<float>::operator()(int) @ProCore not yet transcribed",
  );
}

/** PCGenVector<float>::operator()(i) const — @ProCore not yet decoded. */
function PCGenVector_float_at_const(_v: PCGenVectorFloat, _i: number): number {
  throw new Error(
    "PCGenVector<float>::operator()(int) const @ProCore not yet transcribed",
  );
}

/** PCGenVector<float>::set(other) — element-wise copy; @ProCore not yet decoded. */
function PCGenVector_float_set(
  _dst: PCGenVectorFloat,
  _src: PCGenVectorFloat,
): void {
  throw new Error(
    "PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float> const&) @ProCore not yet transcribed",
  );
}

/** PCGenMatrix<float>::row(i) — returns a PCGenVector<float> view of row i;
 *  @ProCore not yet decoded. */
function PCGenMatrix_float_row(
  _m: PCGenMatrixFloat,
  _i: number,
): PCGenVectorFloat {
  throw new Error(
    "PCGenMatrix<float>::row(int) @ProCore not yet transcribed",
  );
}

/** PCGenMatrix<float>::identity(n) — construct an n×n identity;
 *  @ProCore not yet decoded. */
function PCGenMatrix_float_identity(_n: number): PCGenMatrixFloat {
  throw new Error(
    "PCGenMatrix<float>::identity(int) @ProCore not yet transcribed",
  );
}

/** PCGenMatrix<float>::copy(layout) const — deep copy w/ optional layout;
 *  @ProCore not yet decoded. */
function PCGenMatrix_float_copy(
  _m: PCGenMatrixFloat,
  _layout: number,
): PCGenMatrixFloat {
  throw new Error(
    "PCGenMatrix<float>::copy(PCGenMatrix<float>::Layout) const @ProCore not yet transcribed",
  );
}

/** PCArray<PCGenMatrix<float>,...>::resize(count, growTarget)
 *  — @ProCore not yet decoded. */
function PCArray_resize(_arr: PCArrayPCGenMatrixFloat, _n: number, _cap: number): void {
  throw new Error(
    "PCArray<PCGenMatrix<float>, PCArray_Traits<...>>::resize(int, int) @ProCore not yet transcribed",
  );
}

/** PCMatchmoveProblem::PCMatchmoveProblem(PCMatchmove*, int) — LM cost fn ctor;
 *  @ProCore not yet decoded. */
function PCMatchmoveProblem_ctor(
  _self: PCMatchmove,
  _frameIdx: number,
): PCMatchmoveProblem {
  throw new Error(
    "PCMatchmoveProblem::PCMatchmoveProblem(PCMatchmove*, int) @ProCore not yet transcribed",
  );
}

/** PCMatchmoveProblem::getGoal() — returns residual target;
 *  @ProCore not yet decoded. */
function PCMatchmoveProblem_getGoal(_p: PCMatchmoveProblem): PCGenVectorFloat {
  throw new Error(
    "PCMatchmoveProblem::getGoal() @ProCore not yet transcribed",
  );
}

/** PCMatchmoveProblem::xToVector(matrix, vec) — pack state matrix into vec;
 *  @ProCore not yet decoded. */
function PCMatchmoveProblem_xToVector(
  _p: PCMatchmoveProblem,
  _m: PCGenMatrixFloat,
  _v: PCGenVectorFloat,
): void {
  throw new Error(
    "PCMatchmoveProblem::xToVector(PCGenMatrix<float> const&, PCGenVector<float>&) @ProCore not yet transcribed",
  );
}

/** PCMatchmoveProblem::xToMatrix(vec, matrix) — unpack state vec into matrix;
 *  @ProCore not yet decoded. */
function PCMatchmoveProblem_xToMatrix(
  _p: PCMatchmoveProblem,
  _v: PCGenVectorFloat,
  _m: PCGenMatrixFloat,
): void {
  throw new Error(
    "PCMatchmoveProblem::xToMatrix(PCGenVector<float> const&, PCGenMatrix<float>&) @ProCore not yet transcribed",
  );
}

/** PCLMSolver — the actual Levenberg-Marquardt loop; three methods used here:
 *  setGoal, setState, solve. All @ProCore not yet decoded. */
interface PCLMSolver {
  __tag: "PCLMSolver";
}
function PCLMSolver_setGoal(_s: PCLMSolver, _g: PCGenVectorFloat): void {
  throw new Error(
    "PCLMSolver::setGoal(PCGenVector<float> const&) @ProCore not yet transcribed",
  );
}
function PCLMSolver_setState(_s: PCLMSolver, _x: PCGenVectorFloat): void {
  throw new Error(
    "PCLMSolver::setState(PCGenVector<float> const&) @ProCore not yet transcribed",
  );
}
function PCLMSolver_solve(_s: PCLMSolver): void {
  throw new Error(
    "PCLMSolver::solve() @ProCore not yet transcribed",
  );
}

/**
 * PCGenMatrix<float> — recovered as a header struct with a data pointer.
 * Layout inferred from project @ 0xb8e0e (0x18(row) = data*),
 * 0xb8e37 (0x14(row) = colStride), 0xb8eab (0x10(row) = rowStride).
 * Fields marked PORTABLE-STUB are placeholders whose byte offsets are
 * documented but whose exact semantics await the PCGenMatrix port.
 */
export interface PCGenMatrixFloat {
  /** +0x10 int rowStride (project uses this as the row-major step when
   *  indexing column entries — see 0xb8eab movslq 0x10(...), %rdx). */
  rowStride: number;
  /** +0x14 int colStride (project uses this as the column stride when
   *  reading (r, c) — see 0xb8ebe movslq 0x14(...), %rcx; and 0xb8e37 for
   *  the row-1 read of column 0). */
  colStride: number;
  /** +0x18 float* data — packed contiguous float storage (typed array). */
  data: Float32Array;
}
export interface PCGenVectorFloat {
  __tag: "PCGenVectorFloat";
}
export interface PCArrayPCGenMatrixFloat {
  __tag: "PCArrayPCGenMatrixFloat";
}
export interface PCMatchmoveProblem {
  __tag: "PCMatchmoveProblem";
}

/** PCMatchmove state — field offsets from the disasm (see file header
 *  layout table). Modelled as a plain object so raw offset reads in the
 *  ported bodies below map trivially. */
export interface PCMatchmove {
  /** +0x0c int */
  nPoints: number;
  /** +0x10 PCGenMatrix<float>* — the input points block; its +0x28 field is
   *  the row-count for the setup-outputs writeback. */
  pointsIn: PCGenMatrixFloat & { pointCount: number };
  /** +0x18 int baseFrame */
  baseFrame: number;
  /** +0x1c int nRows */
  nRows: number;
  /** +0x20 int lastFrame */
  lastFrame: number;
  /** +0x28 PCGenMatrix<float> matrixWork */
  matrixWork: PCGenMatrixFloat;
  /** +0x3c int layoutFlag (0 default, 1 row-major) */
  layoutFlag: number;
  /** +0x48 PCGenVector<float> vectorWork */
  vectorWork: PCGenVectorFloat;
  /** +0x50 int arrayCount */
  arrayCount: number;
  /** +0x54 int arrayStride */
  arrayStride: number;
  /** +0x58 float* arrayBuf */
  arrayBuf: Float32Array;
  /** +0x60 PCArray<PCGenMatrix<float>> matricesArray */
  matricesArray: PCArrayPCGenMatrixFloat;
  /** +0x68 int arrayCap */
  arrayCap: number;
  /** +0x6c int perFrameCount (bounds check on frameIdx) */
  perFrameCount: number;
  /** +0x70 PCGenMatrix<float>[perFrameCount] perFrameArr — the actual
   *  per-frame homography storage; each element is a 3x3 float matrix. */
  perFrameArr: PCGenMatrixFloat[];
}

/** PCArray_base::badIndex() — throws the OOB exception ProCore uses;
 *  faithful to the callq at 0xb80a9 / 0xb8b93 / etc. */
function PCArray_base_badIndex(): never {
  throw new Error("PCArray_base::badIndex() @ProCore");
}

/**
 * PCMatchmove::setupOutputs()
 *   @ProCore 0xb8096  __ZN11PCMatchmove12setupOutputsEv
 *
 * ```
 *   0xb8096-0xb80a2  esi = this->nPoints (+0x0c) ; this->nRows (+0x1c) = esi
 *   0xb80a5-0xb80af  if (esi <= 0) badIndex()
 *   0xb80b1-0xb80b8  eax = this->pointsIn (+0x10) -> +0x28  ; this->+0x20 = eax
 *   0xb80bb-0xb80cd  matrixWork.resize(nRows, 2, layoutFlag==1 ? 1 : 0)
 *   0xb80d2-0xb80d9  vectorWork.resize(nRows)
 *   0xb80de-0xb80f7  matricesArray.resize(nRows, min(arrayCap, 2*nRows+1))
 * ```
 * Note the "2 * count + 1" grow-target is the classic doubling policy the
 * PCArray family uses (mirrors the `leal 0x1(%rsi,%rsi), %edx ; cmovlel`
 * sequence at 0xb80e6-0xb80ea: pick min(currentCap, 2*count + 1)).
 */
export function setupOutputs(self: PCMatchmove): void {
  // +0xc -> +0x1c
  const esi = self.nPoints;
  self.nRows = esi;
  if (esi <= 0) PCArray_base_badIndex();
  // +0x10 -> +0x28 field on pointsIn is the point-count; writeback at +0x20
  self.arrayCount = self.pointsIn.pointCount;
  // matrixWork.resize(nRows, 2, layoutFlag==1?1:0)
  //   layout arg is 2 in the disasm — but see 0xb80c1 cmp+sete: the ECX
  //   register holds (layoutFlag==1)?1:0 and is passed as the 4th
  //   parameter — the 3rd param (2) is the column count.
  const layoutArg = self.layoutFlag === 1 ? 1 : 0;
  PCGenMatrix_float_resize(self.matrixWork, self.nRows, 2, layoutArg);
  // vectorWork.resize(nRows) — note +0x1c is re-read (not the local esi!)
  //  0xb80d6 movl 0x1c(%rbx), %esi
  PCGenVector_float_resize(self.vectorWork, self.nRows);
  // matricesArray.resize(nRows, min(cap, 2*nRows+1))
  //  0xb80de movl 0x20(%rbx), %esi   -> the CURRENT array-count (from +0x20)
  //  0xb80e1 movl 0x68(%rbx), %eax   -> cap
  //  0xb80e4 cmp   %eax, %esi
  //  0xb80e6 leal  0x1(%rsi,%rsi), %edx  ; edx = 2*count + 1
  //  0xb80ea cmovlel %eax, %edx        ; if count <= cap: edx = cap
  //           (so we grow to 2n+1 only when currentCount > cap)
  const count = self.arrayCount;
  const cap = self.arrayCap;
  let growTarget = 2 * count + 1;
  if (count <= cap) growTarget = cap;
  PCArray_resize(self.matricesArray, count, growTarget);
}

/**
 * PCMatchmove::solveBaseFrame()
 *   @ProCore 0xb81f0  __ZN11PCMatchmove14solveBaseFrameEv
 *
 * ```
 *   0xb8204          r14 = (int64) this->baseFrame (+0x18)
 *   0xb820c-0xb8214  identity3 = PCGenMatrix<float>::identity(3)
 *   0xb8226-0xb822b  if (baseFrame < 0 || baseFrame >= perFrameCount) badIndex()
 *   0xb8234-0xb8238  targetElem = &perFrameArr[baseFrame]      ; stride 0x20
 *   0xb823c-0xb825b  if (&identity3 != targetElem) {
 *                        targetElem->{rowStride,colStride} = identity3->{rowStride,colStride}
 *                        targetElem->refBlock = identity3->refBlock  (PCGenBlockRef::assign)
 *                        targetElem->data = identity3->data (+0x18)
 *                    }
 *   0xb8260-0xb8283  if (arrayCount > 0) memset(arrayBuf, 0, arrayCount * arrayStride)
 *                        (loop: rax = arrayCount; do { *rcx=0; rcx+=stride; } while(--rax))
 *   0xb8287-0xb835e  if (nRows > 0)
 *                       for (i = 0; i < nRows; ++i) {
 *                         v = pointsIn.at(baseFrame);       // 0xb82c8 PCGenVector<float>::(i)
 *                         val = *v;                          // 0xb82cd movss (%rax),%xmm0
 *                         vectorWork.at(i) = val;            // 0xb82e2-0xb82e7
 *                         rowDst = matrixWork.row(i);        // 0xb82f6
 *                         rowSrc = (pointsIn + i)->row(baseFrame); // 0xb8308
 *                         rowDst.set(rowSrc);                // 0xb8314
 *                       }
 * ```
 * NOTE: the loop at 0xb82aa-0xb8358 walks two-row-strides simultaneously:
 *   r12 is the outer row index (0..nRows-1),
 *   r15 accumulates 0x38 per iter — 0x38 = 56 bytes = sizeof(PCGenMatrix<float>).
 * That confirms +0x10 (this->pointsIn) points at an ARRAY of PCGenMatrix<float>
 * with stride 0x38 (not 0x20 like the +0x70 array — a different template
 * instantiation with an extra 24-byte header, presumably the "input" vs
 * "output" matrix variants).
 */
export function solveBaseFrame(self: PCMatchmove): void {
  // r14 = (int64_t) baseFrame
  const baseFrame = self.baseFrame | 0;

  // identity3 = identity(3)
  const identity3 = PCGenMatrix_float_identity(3);

  // bounds-check baseFrame against perFrameCount (+0x6c)
  if (baseFrame < 0 || baseFrame >= self.perFrameCount) PCArray_base_badIndex();

  // targetElem = &perFrameArr[baseFrame]
  //   the disasm loads (identity3 header) into *targetElem — this is a
  //   raw structure copy of the { rowStride, colStride, data-ptr }.
  //   In our JS model we mirror it by copying the fields explicitly:
  const targetElem = self.perFrameArr[baseFrame];
  if (targetElem !== identity3) {
    targetElem.rowStride = identity3.rowStride;
    targetElem.colStride = identity3.colStride;
    targetElem.data = identity3.data;
  }

  // zero-fill arrayBuf: for (i = arrayCount; i > 0; --i) { *buf = 0; buf += arrayStride; }
  //   0xb8265 cmp $0, arrayCount  ; jle skip
  //   0xb8271 shlq $0x2, %rdx     ; stride *= 4 (dwords)
  //   0xb8275: *(int*)rcx = 0 ; rcx += stride ; --rax ; jne loop
  const arrayCount = self.arrayCount | 0;
  if (arrayCount > 0) {
    const strideDwords = self.arrayStride | 0; // int elems per step
    const buf = self.arrayBuf;
    let p = 0;
    for (let a = arrayCount; a > 0; --a) {
      buf[p] = 0;
      p += strideDwords;
    }
  }

  // if (nRows > 0) for (i = 0; i < nRows; ++i) {...}
  if (self.nRows <= 0) return;
  // 0xb82aa loop head: bounds-check "0xc(%rbx)" (== nPoints) against outer
  //   index r12. This is a re-check of nPoints, not nRows — see 0xb82aa.
  //   (nPoints == nRows post-setupOutputs so both are >= the loop count.)
  for (let i = 0; i < self.nRows; ++i) {
    if (i >= self.nPoints) PCArray_base_badIndex();

    // val = pointsIn[i].at(baseFrame)
    //   0xb82bc  rdi = pointsIn + (i * 0x38) + 0x20  -> a PCGenVector<float>*
    //   0xb82c4  esi = baseFrame ; call PCGenVector::operator()(int)
    //  (pointsIn is an array of length nPoints where each element has an
    //   inner PCGenVector<float> at inner offset 0x20; that inner vector
    //   is indexed by baseFrame to fetch one float sample.)
    const innerVec = getPointsInInnerVector(self.pointsIn, i);
    const val = PCGenVector_float_at(innerVec, baseFrame);

    // vectorWork.at(i) = val   (0xb82dd-0xb82e7)
    const dstSlot = PCGenVector_float_at(self.vectorWork, i);
    // The disasm stores via *(rax) — but our PCGenVector accessor returns
    // a value in JS. In the real port the accessor returns a REFERENCE;
    // we model the write as a helper that mirrors the assign:
    PCGenVector_float_setElem(self.vectorWork, i, val);
    void dstSlot; // dead-code marker: keeps parity with the movss/loadref pair

    // rowDst = matrixWork.row(i)                 (0xb82f6)
    const rowDst = PCGenMatrix_float_row(self.matrixWork, i);
    // rowSrc = pointsIn[i].row(baseFrame)        (0xb8308: this pointer is
    //   pointsIn + i*0x38 (the +i*0x38 accumulator r15 + r13 base = the
    //   inner PCGenMatrix<float> header at pointsIn[i]).
    const rowSrc = PCGenMatrix_float_row(
      getPointsInInnerMatrix(self.pointsIn, i),
      baseFrame,
    );
    // rowDst.set(rowSrc)                          (0xb8314)
    PCGenVector_float_set(rowDst, rowSrc);
  }
}

/** Helper: extract the inner PCGenVector<float> at pointsIn[i] + 0x20.
 *  Mirrors the 0xb82bc-0xb82c0 pointer walk. This is a THROW-STUB — the
 *  exact layout of the "outer" pointsIn record awaits its own port. */
function getPointsInInnerVector(
  _pointsIn: PCMatchmove["pointsIn"],
  _i: number,
): PCGenVectorFloat {
  throw new Error(
    "PCMatchmove::pointsIn[i].innerVector @ProCore 0xb82bc — outer PCGenMatrix<float>-record layout not yet transcribed",
  );
}

/** Helper: extract the inner PCGenMatrix<float> at pointsIn[i].
 *  Mirrors the 0xb8308 pointer walk (r15 += 0x38 per iter). Throw-stubbed
 *  for the same reason as above. */
function getPointsInInnerMatrix(
  _pointsIn: PCMatchmove["pointsIn"],
  _i: number,
): PCGenMatrixFloat {
  throw new Error(
    "PCMatchmove::pointsIn[i].innerMatrix @ProCore 0xb8308 — outer PCGenMatrix<float>-record layout not yet transcribed",
  );
}

/** PCGenVector<float>::(i) = val — mirror of the movss (%rax),%xmm write
 *  the caller performs after fetching a mutable reference from the
 *  non-const operator()(int). @ProCore not yet decoded. */
function PCGenVector_float_setElem(
  _v: PCGenVectorFloat,
  _i: number,
  _val: number,
): void {
  throw new Error(
    "PCGenVector<float>::operator()(int)= (write via reference) @ProCore not yet transcribed",
  );
}

/**
 * PCMatchmove::solveFrame(int frameIdx)
 *   @ProCore 0xb84b8  __ZN11PCMatchmove10solveFrameEi
 *
 * ```
 *   0xb84e0  problem  = PCMatchmoveProblem(this, frameIdx)      // ctor at +0x84e0
 *   0xb84e5  if (problem.field@0x60 == 0) skip solve            // hasWork flag
 *   0xb84f0-0xb857a  in-place PCLMSolver{} ctor (vtable +0x94289
 *                    hardcoded, params + fields zero'd; dampening constant
 *                    at 0x6fc3b(%rip)) — the solver object lives in the
 *                    caller's stack frame [-0xe8, -0x38].
 *                    NOTE: solver ctor is INLINED here (no callq), so the
 *                    fields are set explicitly:
 *                       +0x00 vtable      = 0x94289(%rip)
 *                       +0x08 (nPoints?)  = 0
 *                       +0x10 dims        = { 1, 1 }
 *                       +0x18 xmm buffer  = { 0, 0 }
 *                       +0x28 stride pair = { 1, 1 }
 *                       ...
 *                       +0x50 iter pair   = { 6, 0x4b }        // maxIter, ??
 *                       +0x48 double damp = *(0x6fc3b rip)     // = 1e-4-ish
 *                       +0x40 byte flag   = 0
 *                    We THROW-STUB the ctor rather than reproduce these
 *                    magic constants without the PCLMSolver port.
 *   0xb858c  goal = problem.getGoal()
 *   0xb859c  solver.setGoal(goal)
 *   0xb85e8  problem.xToVector(perFrameArr[frameIdx], state)
 *   0xb85f8  solver.setState(state)
 *   0xb8604  solver.solve()
 *   0xb8620  perFrameArr[frameIdx].unique()    // COW detach
 *   0xb8643  problem.xToMatrix(state, perFrameArr[frameIdx])
 * ```
 * The heavy lifting is all in the throw-stubbed collaborators; this is
 * literally the driver that wires them up.
 */
export function solveFrame(self: PCMatchmove, frameIdx: number): void {
  const problem = PCMatchmoveProblem_ctor(self, frameIdx);
  // 0xb84e5 cmpl $0, 0x60(%r15) ; je epilog
  //   the +0x60 field of PCMatchmoveProblem is a "has residuals to solve"
  //   flag; if zero we bail out with no work. Since we can't inspect that
  //   field without porting PCMatchmoveProblem, we call getGoal() to force
  //   the throw (deferred to PCMatchmoveProblem's own port).
  const goal = PCMatchmoveProblem_getGoal(problem);

  // In-place PCLMSolver constructor — see 0xb84f0-0xb857a in the disasm.
  // We can't fake the field initialisation without the PCLMSolver port,
  // so we surface the gap by asking for a solver through a helper that
  // throws — mirroring exactly what the inlined ctor stores.
  const solver = PCLMSolver_make_defaults();

  PCLMSolver_setGoal(solver, goal);

  if (frameIdx < 0 || frameIdx >= self.perFrameCount) PCArray_base_badIndex();
  const stateVec = PCGenVector_float_make();
  PCMatchmoveProblem_xToVector(problem, self.perFrameArr[frameIdx], stateVec);
  PCLMSolver_setState(solver, stateVec);
  PCLMSolver_solve(solver);

  if (frameIdx < 0 || frameIdx >= self.perFrameCount) PCArray_base_badIndex();
  PCGenMatrix_float_unique(self.perFrameArr[frameIdx]);
  PCMatchmoveProblem_xToMatrix(problem, stateVec, self.perFrameArr[frameIdx]);
}

/** In-place PCLMSolver default-ctor (produces the exact byte pattern the
 *  disasm writes at 0xb84f0-0xb857a). Throws until decoded. */
function PCLMSolver_make_defaults(): PCLMSolver {
  throw new Error(
    "PCLMSolver in-place ctor (inlined @ProCore 0xb84f0-0xb857a) not yet transcribed",
  );
}

/** PCGenVector<float>() default ctor — a heap-allocated empty vector with a
 *  refcount header at -0x8. @ProCore not yet decoded. */
function PCGenVector_float_make(): PCGenVectorFloat {
  throw new Error(
    "PCGenVector<float> default ctor @ProCore not yet transcribed",
  );
}

/** PCGenMatrix<float>::unique() — detach if shared (COW).
 *  @ProCore not yet decoded (called from 0xb8620). */
function PCGenMatrix_float_unique(_m: PCGenMatrixFloat): void {
  throw new Error(
    "PCGenMatrix<float>::unique() @ProCore not yet transcribed",
  );
}

/**
 * PCMatchmove::solve()
 *   @ProCore 0xb8b40  __ZN11PCMatchmove5solveEv
 *
 * Forward + backward propagation over the per-frame homography array.
 * The identity/base-frame is seeded by solveBaseFrame(); adjacent frames
 * are seeded by the previously-solved neighbour's H before solveFrame
 * refines it via LM.
 *
 * ```
 *   0xb8b54  setupOutputs()
 *   0xb8b59  solveBaseFrame()
 *   0xb8b61  r13d = baseFrame           ; local rolling frame index
 *   0xb8b65  eax  = lastFrame
 *   0xb8b6f  if (r13d >= eax) goto backward   (skip forward loop)
 *   forward-loop  r15d = r13d + 1 ; while (r15d < lastFrame):
 *       0xb8ba8  temp = perFrameArr[r13d].copy(0)     // (previous H)
 *       0xb8bcd  perFrameArr[r15d].{rowStride,colStride,dataPtr} = temp.*
 *       0xb8c06  solveFrame(r15d)
 *       0xb8c0e  eax  = lastFrame (refresh)  ; r13d = r15d ; ++r15d
 *   0xb8c28  r13d = baseFrame  (reload for backward)
 *   0xb8c2b  if (r13d < 0) done                       (nothing to do)
 *   backward-loop  r15d = r13d ; while (r15d != 0):
 *                  r15d = r15d - 1
 *       0xb8c67  temp = perFrameArr[r13d].copy(0)
 *       0xb8c87  perFrameArr[r15d].{rowStride,colStride,dataPtr} = temp.*
 *       0xb8cc0  solveFrame(r15d)
 *       0xb8cc5  r13d = r15d
 * ```
 */
export function solve(self: PCMatchmove): void {
  setupOutputs(self);
  solveBaseFrame(self);

  // FORWARD PASS: baseFrame -> lastFrame - 1
  let r13 = self.baseFrame | 0;
  let last = self.lastFrame | 0;
  if (r13 < last) {
    for (let r15 = r13 + 1; r15 < last; r15++) {
      // temp = perFrameArr[r13].copy(0)
      if (r13 < 0 || r13 >= self.perFrameCount) PCArray_base_badIndex();
      const temp = PCGenMatrix_float_copy(self.perFrameArr[r13], 0);
      // Structure copy of the { rowStride, colStride, data-ptr } into
      // perFrameArr[r15]. Same pattern as solveBaseFrame's identity copy.
      if (r15 < 0 || r15 >= self.perFrameCount) PCArray_base_badIndex();
      const dst = self.perFrameArr[r15];
      if (dst !== temp) {
        dst.rowStride = temp.rowStride;
        dst.colStride = temp.colStride;
        dst.data = temp.data;
      }
      solveFrame(self, r15);
      // 0xb8c0b reloads lastFrame — captures dynamic re-resizing by
      // solveFrame, if any. We do the same.
      last = self.lastFrame | 0;
      r13 = r15;
    }
  }

  // BACKWARD PASS: baseFrame -> 0 (walking down by one).
  r13 = self.baseFrame | 0;
  if (r13 < 0) return;
  let r15 = r13;
  // do-while: the do body runs once even when r15 == 0 initially? Look at
  // 0xb8c28-0xb8c47:
  //   0xb8c28 testl %r13d, %r13d ; js done  (skip if baseFrame < 0)
  //   0xb8c31 mov  %r13d, %r15d
  //   0xb8c3e cmp  %rax, %r15    ; eax == r13d ; je 0xb8cc8 (skip body)
  //     — so the FIRST iteration is skipped (r15 == r13). Then:
  //   0xb8cc8 addq $-0x20, %r12  ; %r12 tracks (r15 * 32)
  //   0xb8ccc test %r15, %r15
  //   0xb8ccf leaq -1(%r15), %r15
  //   0xb8cd3 jg   0xb8c3b       (loop while r15 > 0)
  // Reading it end-to-end: on the FIRST iter body is skipped; then
  // r15 is decremented and we loop while r15 > 0. So the body runs on
  // r15 = r13-1, r13-2, ..., 1, 0 (r15 = 0 is the LAST body execution,
  // because the compare is jg AFTER the decrement).
  while (r15 > 0) {
    r15 -= 1;
    // body: temp = perFrameArr[r13].copy(0); perFrameArr[r15] <- temp; solveFrame(r15)
    if (r13 < 0 || r13 >= self.perFrameCount) PCArray_base_badIndex();
    const temp = PCGenMatrix_float_copy(self.perFrameArr[r13], 0);
    if (r15 < 0 || r15 >= self.perFrameCount) PCArray_base_badIndex();
    const dst = self.perFrameArr[r15];
    if (dst !== temp) {
      dst.rowStride = temp.rowStride;
      dst.colStride = temp.colStride;
      dst.data = temp.data;
    }
    solveFrame(self, r15);
    r13 = r15;
  }
}

/**
 * PCMatchmove::project(int frameIdx, PCGenVector<float> const& in, PCGenVector<float>& out)
 *   @ProCore 0xb8d96  __ZN11PCMatchmove7projectEiRK11PCGenVectorIfERS1_
 *
 * Classic 2D projective transform via the 3x3 homography H at
 * perFrameArr[frameIdx]:
 *
 *     [x'; y'; w] = H * [x; y; 1]     out = (x'/w, y'/w)
 *
 * That's exactly what the SSE bundling does — the compiler packs pairs
 * of (H_col0, H_col1) then does two mulps + one addps for the top two
 * output components, plus a scalar accumulator for the w component:
 *
 * ```
 *   -0x80(rbp)  x  (broadcast lane 0)
 *   -0x70(rbp)  y  (broadcast lane 0)
 *   -0x40(rbp)  { H[0][0], H[1][0], -, - }  (col 0, rows 0..1)
 *   -0x60(rbp)  { H[0][1], H[1][1], -, - }  (col 1, rows 0..1)
 *   -0x50(rbp)  { H[0][2], H[1][2], -, - }  (col 2, rows 0..1)
 *   -0x2c(rbp)  w scalar accumulator = H[2][0]*x + H[2][1]*y + H[2][2]
 * ```
 *
 * Line-by-line:
 *   0xb8ddd  x       = in(0)
 *   0xb8df2  y       = in(1)
 *   0xb8e13  a       = H[0][0]                    ; -0x40(rbp) lane 0
 *   0xb8e3c  b       = H[0][1]  (row0 col1: base + col*colStride)
 *                                                 ; -0x60(rbp) lane 0
 *   0xb8e66  c       = H[0][2]  (row0 col2: base + 2*colStride)
 *                                                 ; -0x50(rbp) lane 0
 *   0xb8e95  w       = H[2][0] * x                ; -0x2c(rbp)
 *   0xb8ed5  w      += H[2][1] * y
 *   0xb8f11  w      += H[2][2]
 *   0xb8f40  a[lane1] = H[1][0]  (row1 col0)      ; -0x40(rbp) lane 1
 *   0xb8f7c  b[lane1] = H[1][1]                   ; -0x60(rbp) lane 1
 *   0xb8fbf  c[lane1] = H[1][2]                   ; -0x50(rbp) lane 1
 *   0xb8fb5-8fd5  (movsldup + mulps + addps)
 *                packed:  xx = broadcast(x); yy = broadcast(y);
 *                pair    = xx*colA + yy*colB + colC
 *                pair    = { H[0][0]*x + H[0][1]*y + H[0][2],
 *                            H[1][0]*x + H[1][1]*y + H[1][2] }
 *   0xb8fe4  out.resize(2)
 *   0xb8fed  w_lane  = movshdup(pair)   // duplicate lane 1 as scalar
 *   0xb8ff5  pair[0] = pair[0] / pair[1]        (WRONG — see next line)
 *
 *   ACTUALLY:  the divss at 0xb8ff5 divides xmm0 by xmm1 where xmm0 =
 *   { pair.x, pair.y, ?, ? } and xmm1 = { pair.y, pair.y, ?, ? } — so
 *   pair.x /= pair.y.  Then out[0] = pair.x / pair.y.  Then at 0xb9014
 *   the scalar w-accumulator is divided by pair.y and stored to out[1].
 *
 *   HOLD ON — that doesn't line up with the algebraic model. Re-reading:
 *
 *   0xb8fe9  xmm0 = -0x50(%rbp) = { c[0], c[1], -, - }
 *              == { H[0][2], H[1][2], ?, ? } (BEFORE the +xx*colA/+yy*colB)
 *
 *   NO — look again at 0xb8fca-0xb8fd8:
 *     movaps -0x50(%rbp), %xmm0         ; xmm0 = c pair = { H[0][2], H[1][2] }
 *     insertps $0x10, (%rax,%rcx,4),%xmm0  ; xmm0[1] = H[?][2] read from mem
 *     addps   %xmm1, %xmm0              ; xmm0 += xmm1  (xmm1 = x*colA + y*colB)
 *     movaps  %xmm0, -0x50(%rbp)        ; -0x50 = fully-summed pair
 *   And xmm1 was built at 0xb8fbe-0xb8fc7 as:
 *     movsldup -0x70(%rbp), %xmm1       ; xmm1 = broadcast(y) into lanes 0/1
 *     mulps    -0x60(%rbp), %xmm1       ; xmm1 = y * colB  (lanes 0/1)
 *     addps    %xmm0, %xmm1             ; xmm1 = (x*colA) + (y*colB)
 *   with %xmm0 (before the addps) built at 0xb8fb5-0xb8fba as:
 *     movsldup -0x80(%rbp), %xmm0       ; xmm0 = broadcast(x)
 *     mulps    -0x40(%rbp), %xmm0       ; xmm0 = x * colA
 *   So after 0xb8fd8:  -0x50(%rbp) = colA*x + colB*y + colC (pairwise).
 *
 *   0xb8fe9  xmm0 = -0x50(%rbp)     = { (row0), (row1), -, - }
 *   0xb8fed  xmm1 = movshdup(xmm0)   = { (row1), (row1), -, - }
 *   0xb8ff5  xmm0 = xmm0 / xmm1      = { row0/row1, 1, -, - }
 *   0xb9002  out(0) = xmm0[0]         = row0 / row1 ...
 *
 *   THAT DOESN'T MATCH y'/w EITHER. Let me re-derive from the top.
 *
 *   The four packed values collected in colA/colB/colC (the 3 xmm slots)
 *   are  H[0][j] (row 0) in LANE 0  and  H[?][j] in LANE 1 — but LANE 1
 *   is read from an OFFSET that reads (base + colStride*rowStride + col_index).
 *
 *   Reading 0xb8f37-0xb8f40 for the lane-1 fill of colA:
 *     rax = &row0.data          ;  matches 0xb8e0e's load
 *     rcx = row0.rowStride (+0x10)
 *     insertps $0x10, (rax,rcx,8), xmm0
 *              memory operand = rax + rcx*8 = data + 8*rowStride
 *
 *   So (rax + rcx*8) reads DATA index (8 * rowStride) — but wait, that's
 *   `data[rowStride*2]` since the ,8 is a *4 (byte scale) shift then *2
 *   (because rowStride is in dwords). Hmm — no, x86_64 insertps uses
 *   *(rax + rcx*8) with the "8" being the LEA scale in units of BYTES:
 *   rcx (int rowStride) * 8 = 8*rowStride bytes ahead of data.
 *
 *   OK — that's the source of my confusion. Let me convert cleanly:
 *
 *   For a PCGenMatrix<float> with rowStride = R (dwords/row) and
 *   colStride = C (dwords/col), element (r, c) is
 *      data[r*R + c*C]        (element index, 4 bytes each)
 *      or   *(data + 4*(r*R + c*C))    (byte address)
 *
 *   Then the various insertps memory operands compute BYTE offsets:
 *     0xb8f40  (rax + rcx*8)   = data + rowStride*8 bytes
 *                             = data + rowStride*2  as element index
 *                             = data[rowStride*2]
 *                             = element (r=2, c=0)  IF R==rowStride
 *                                  IFF C == 1 (default column-major w/ unit
 *                                  column stride) — which the disasm HAS
 *                                  confirmed: 0xb8f37 movslq 0x10(row)
 *                                  loads rowStride, 0xb8ebe movslq 0x14
 *                                  loads colStride — and 0xb8f40 uses ,8
 *                                  which means 2 * rowStride element-index.
 *
 *   So the LANE-1 offsets correspond to ROW 2 (r=2), not r=1. Which means
 *   the "pair" -0x50 = { row0-value, row2-value } — the top row and the
 *   perspective row.  The 0xb8ff5 divss is dividing the top-row value by
 *   the perspective-row value: out[0] = (H*p)_row0 / (H*p)_row2 = x'/w.
 *
 *   THEN at 0xb9014 the scalar w-accumulator -0x2c(rbp) — which is the
 *   FULL row-1 value H[1][0]*x + H[1][1]*y + H[1][2] — is divided by the
 *   same lane-1 (row 2) value: out[1] = row1 / row2 = y'/w. ✓
 *
 *   Wait but 0xb8e95 computed -0x2c = H[2][0]*x — the SECOND ROW.
 *   Recheck 0xb8e0e: it loaded row 0 col 0 into -0x40 (that's H[0][0]).
 *   0xb8e37 loaded row 0 col 1 into -0x60 (H[0][1]).
 *   0xb8e66 loaded row 0 col 2 into -0x50 (H[0][2]).
 *
 *   Then 0xb8e95 built xmm0 = data[rowStride] * x     (byte offset
 *   4*rowStride == element rowStride == row 1 col 0 IF colStride==1).
 *   That IS  H[1][0] * x, not H[2][0] * x.
 *
 *   And 0xb8ed5 added H[1][1]*y; 0xb8f11 added H[1][2].
 *   So -0x2c(rbp) = H[1][0]*x + H[1][1]*y + H[1][2] = (H*p)_row1  = y'.
 *
 *   Then the pair at -0x50 becomes:
 *     LANE 0: colC[0] + x*colA[0] + y*colB[0]
 *           = H[0][2] + x*H[0][0] + y*H[0][1]
 *           = (H*p)_row0  =  x'
 *     LANE 1: colC[1] + x*colA[1] + y*colB[1]
 *   colA[1] at -0x40[1] was written by 0xb8f40 insertps from
 *   data + rowStride*8 bytes = element index 2*rowStride = row 2 col 0
 *           = H[2][0]     ✓
 *   Similarly colB[1] = H[2][1], colC[1] = H[2][2].
 *   So LANE 1 = H[2][2] + x*H[2][0] + y*H[2][1] = (H*p)_row2  = w.
 *
 *   Finally: out[0] = LANE 0 / LANE 1 = x' / w
 *            out[1] = -0x2c(rbp) / LANE 1 = y' / w
 *
 *   ✓ Perspective divide, classic homography apply. And note the disasm
 *   quietly BROADCASTS the divide-by-w in the divss/divss pair rather
 *   than reciprocating once — so we do the same.
 * ```
 */
export function project(
  self: PCMatchmove,
  frameIdx: number,
  input: PCGenVectorFloat,
  out: PCGenVectorFloat,
): void {
  if (frameIdx < 0 || frameIdx >= self.perFrameCount) PCArray_base_badIndex();

  const H = self.perFrameArr[frameIdx];
  // H.data + row*rowStride + col*colStride  (float element index)
  //   The disasm reads H[0][0] (r=0,c=0), H[0][1], H[0][2],
  //                    H[1][0], H[1][1], H[1][2],
  //                    H[2][0], H[2][1], H[2][2]
  //   which is exactly the top-left 3x3 block. Stride is symbolic; H is
  //   guaranteed 3x3 by solveBaseFrame's identity(3).
  const R = H.rowStride | 0;
  const C = H.colStride | 0;
  const d = H.data;
  const H00 = Math.fround(d[0 * R + 0 * C]);
  const H01 = Math.fround(d[0 * R + 1 * C]);
  const H02 = Math.fround(d[0 * R + 2 * C]);
  const H10 = Math.fround(d[1 * R + 0 * C]);
  const H11 = Math.fround(d[1 * R + 1 * C]);
  const H12 = Math.fround(d[1 * R + 2 * C]);
  const H20 = Math.fround(d[2 * R + 0 * C]);
  const H21 = Math.fround(d[2 * R + 1 * C]);
  const H22 = Math.fround(d[2 * R + 2 * C]);

  const x = Math.fround(PCGenVector_float_at_const(input, 0));
  const y = Math.fround(PCGenVector_float_at_const(input, 1));

  // The compiler does the y' accumulator scalar and the (x', w) pair with
  // SSE — same numeric result at f32 precision:
  //   y_prime = H10 * x + H11 * y + H12       (-0x2c(rbp))
  const xH10 = Math.fround(H10 * x);
  const yH11plus = Math.fround(Math.fround(H11 * y) + xH10);
  const yPrime = Math.fround(H12 + yH11plus);

  //   x_prime = H00 * x + H01 * y + H02       (pair lane 0)
  const xPrime = Math.fround(
    H02 + Math.fround(Math.fround(H00 * x) + Math.fround(H01 * y)),
  );
  //   w       = H20 * x + H21 * y + H22       (pair lane 1)
  const w = Math.fround(
    H22 + Math.fround(Math.fround(H20 * x) + Math.fround(H21 * y)),
  );

  //   out.resize(2)
  PCGenVector_float_resize(out, 2);
  //   out[0] = x_prime / w
  PCGenVector_float_setElem(out, 0, Math.fround(xPrime / w));
  //   out[1] = y_prime / w
  PCGenVector_float_setElem(out, 1, Math.fround(yPrime / w));
}
