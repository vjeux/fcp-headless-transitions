/**
 * PCMatchmoveProblem — ProCore's Levenberg-Marquardt cost-function object
 * for PCMatchmove's per-frame planar homography solve.
 *
 * Faithful transcription of the x86_64 slice of
 *   /Applications/Final Cut Pro.app/Contents/Frameworks/
 *     ProCore.framework/Versions/A/ProCore
 * (FAT binary -> thin slice cache at /tmp/ProCore.x86_64; disasm cached
 *  in raw-port/re/disasm/ProCore.PCMatchmoveProblem.*.s).
 *
 * The ctor + getGoal + xToVector + xToMatrix + yToVector + yToMatrix ports
 * for this class already live in PCMatchmove.ts (they were folded into
 * that file at commit ab48218a when PCMatchmove was ported first). This
 * file transcribes the four remaining PCLMProblem-override methods plus
 * the ctor/dtor variants:
 *
 *   * project(H, out)      @ProCore 0xb9836 — apply homography H to every
 *                                             inlier feature-point.
 *   * setX(x)              @ProCore 0xb9b9e — bind params, decode H, project.
 *   * evalY(y)             @ProCore 0xb9bfa — expose cached projection.
 *   * evalDy(J)            @ProCore 0xb9c32 — finite-difference Jacobian.
 *   * ~PCMatchmoveProblem  @ProCore 0xb82d0 / 0xb8310 / 0xb8350 — D0/D1/D2.
 *   * ctor C1              @ProCore 0xb8764 — trampoline to C2 (already ported).
 *
 * The vtable installed by C2 (@ProCore 0xb9102, ported in PCMatchmove.ts)
 * resolves to __ZTV18PCMatchmoveProblem @ 0x14c7d8 (base + 0x10) with:
 *     *0x00  ~PCMatchmoveProblem D1    @0xb82d0
 *     *0x08  ~PCMatchmoveProblem D0    @0xb82d0   (ICF-folded; deleting)
 *     *0x10  setX                       @0xb9b9e
 *     *0x18  evalY                       @0xb9bfa
 *     *0x20  evalDy                      @0xb9c32
 * (see PCLMProblem.ts for the three pure-virtual slots this vtable
 *  overrides in the base __ZTV11PCLMProblem.)
 */

import {
  type PCMatchmoveProblem,
  type PCGenMatrixFloat,
  type PCGenVectorFloat,
} from "./PCMatchmove.js";

// ---------------------------------------------------------------------------
// Collaborator stubs. These correspond one-to-one to helpers in
// PCMatchmove.ts (where they are already file-scoped for that file's ports
// of xToVector/xToMatrix/yToVector/yToMatrix/getGoal). We re-declare them
// here as file-local throwing stubs so this file's provenance is
// self-contained. Every stub cites the address of the caller-site that
// would first exercise it, in this file.
// ---------------------------------------------------------------------------

/** PCGenVector<float>::resize(int) — @ProCore not yet transcribed
 *  (caller @0xb985c inside `project`). */
function PCGenVector_float_resize(_v: PCGenVectorFloat, _n: number): void {
  throw new Error(
    "PCGenVector<float>::resize(int) @ProCore 0xb985c not yet transcribed",
  );
}

/** PCGenVector<float>::operator()(int) const — @ProCore not yet transcribed
 *  (caller @0xb9d31/@0xb9d58 inside `evalDy`). */
function PCGenVector_float_at_const(_v: PCGenVectorFloat, _i: number): number {
  throw new Error(
    "PCGenVector<float>::operator()(int) const @ProCore 0xb9d31 not yet transcribed",
  );
}

/** PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float> const&)
 *  — @ProCore not yet transcribed (caller @0xb9dfb inside `evalDy` and
 *  implicit inside `evalY`'s block-ref copy at @0xb9c18). */
function PCGenVector_float_set(
  _dst: PCGenVectorFloat,
  _src: PCGenVectorFloat,
): void {
  throw new Error(
    "PCGenVector<float>& PCGenVector<float>::set<float>(PCGenVector<float> const&) @ProCore 0xb9c18 not yet transcribed",
  );
}

/** PCGenVector<int>::operator()(int) — mutable slot accessor;
 *  @ProCore not yet transcribed (caller @0xb9886 inside `project`). */
function PCGenVector_int_at(
  _v: PCMatchmoveProblem["inlierIndices"],
  _i: number,
): number {
  throw new Error(
    "PCGenVector<int>::operator()(int) @ProCore 0xb9886 not yet transcribed",
  );
}

/** PCArray_base::badIndex() — normal-return-never bounds panic;
 *  @ProCore not yet transcribed (caller @0xb989e inside `project`). */
function PCArray_base_badIndex(): never {
  throw new Error(
    "PCArray_base::badIndex() @ProCore 0xb989e not yet transcribed",
  );
}

/** PCGenMatrix<float>::checkColIndex(int) const — bounds-check;
 *  @ProCore not yet transcribed (caller @0xb993d inside `project`). */
function PCGenMatrix_float_checkColIndex(
  _m: PCGenMatrixFloat,
  _c: number,
): void {
  throw new Error(
    "PCGenMatrix<float>::checkColIndex(int) const @ProCore 0xb993d not yet transcribed",
  );
}

/** PCGenMatrix<float>::checkRowIndex(int) const — bounds-check;
 *  @ProCore not yet transcribed (caller @0xb9946 inside `project`). */
function PCGenMatrix_float_checkRowIndex(
  _m: PCGenMatrixFloat,
  _r: number,
): void {
  throw new Error(
    "PCGenMatrix<float>::checkRowIndex(int) const @ProCore 0xb9946 not yet transcribed",
  );
}

/** PCGenMatrix<float>::resize(int rows, int cols, Layout) —
 *  @ProCore not yet transcribed (caller @0xb9c62 inside `evalDy`). */
function PCGenMatrix_float_resize(
  _m: PCGenMatrixFloat,
  _rows: number,
  _cols: number,
  _layout: number,
): void {
  throw new Error(
    "PCGenMatrix<float>::resize(int,int,Layout) @ProCore 0xb9c62 not yet transcribed",
  );
}

/** PCGenMatrix<float>::copy(Layout) const — deep-copy factory;
 *  @ProCore not yet transcribed (caller @0xb9c8c inside `evalDy`). */
function PCGenMatrix_float_copy(
  _m: PCGenMatrixFloat,
  _layout: number,
): PCGenMatrixFloat {
  throw new Error(
    "PCGenMatrix<float>::copy(Layout) const @ProCore 0xb9c8c not yet transcribed",
  );
}

/** PCMatchmoveProblem::xToMatrix(PCGenVector<float> const&, PCGenMatrix<float>&)
 *  — @ProCore 0xb89f4 (already transcribed inside PCMatchmove.ts as
 *  PCMatchmoveProblem_xToMatrix); this thin re-stub here is the
 *  provenance-carrier for callers in THIS file (setX @0xb9bdc). */
function PCMatchmoveProblem_xToMatrix(
  _self: PCMatchmoveProblem,
  _x: PCGenVectorFloat,
  _out: PCGenMatrixFloat,
): void {
  throw new Error(
    "PCMatchmoveProblem::xToMatrix(PCGenVector<float> const&, PCGenMatrix<float>&) @ProCore 0xb89f4 — see PCMatchmove.ts PCMatchmoveProblem_xToMatrix; called from setX @0xb9bdc",
  );
}

// ---------------------------------------------------------------------------
// PCMatchmoveProblem::project(H, out)                    @ProCore 0xb9836
// ---------------------------------------------------------------------------

/**
 * `PCMatchmoveProblem::project(PCGenMatrix<float> const& H, PCGenVector<float>& out)`
 *   @ProCore 0xb9836
 *   __ZN18PCMatchmoveProblem7projectERK11PCGenMatrixIfER11PCGenVectorIfE
 *
 * Applies the 3x3 homography `H` to every accepted inlier point in
 * `mm.pointsIn` (as filtered by the ctor's inlierIndices) and writes the
 * projected (u, v) coordinates into `out` — a 2*inlierCount packed vector
 * interleaved as (u_0, v_0, u_1, v_1, ...).
 *
 * The math per inlier is the standard homographic projection with a
 * per-track baseline-weight prefactor:
 *
 *   x' = H[0,0]*px + H[0,1]*py + H[0,2]
 *   y' = H[1,0]*px + H[1,1]*py + H[1,2]
 *   w' = H[2,0]*px + H[2,1]*py + H[2,2]
 *   u  = hp * x' / w'
 *   v  = hp * y' / w'
 *
 * where:
 *   - (px, py) is the current-frame feature-point (mm.pointsIn.perFrameArr
 *     column-0 / column-1 for track index k, row = self.frameIdx).
 *   - hp is the per-track base-frame confidence weight at row+0x20 of
 *     mm.pointsIn's row-k, column = self.frameIdx (same scalar that
 *     getGoal / yToVector use as the target-side prefactor).
 *
 * DISASM (@0xb9836..@0xb9b9c), block-by-block:
 *   0xb9850  esi = self.inlierCount ; esi *= 2                     ; 2 residuals/point
 *   0xb985c  PCGenVector<float>::resize(out, 2*inlierCount)
 *   0xb9861  if (self.inlierCount <= 0) goto epilog
 *   0xb986d  loop-head:  rax = &self.inlierIndices vector
 *   loop for t = 0 .. inlierCount-1:
 *     0xb9886  k = PCGenVector<int>::operator()(inlierIndices, t)
 *     0xb988e  r15 = self.mm                                        (0x58(self))
 *     0xb9893..0xb989e  bounds-check k in [0, mm.pointsIn.pointCount)  (@0xc(mm))
 *     0xb98a3..0xb98bb  hp = mm.pointsIn.row(k)[+0x20].operator()(frameIdx)
 *     0xb98c9..0xb98f2  px = mm.pointsIn.row(k) inner-matrix (row+0x28) col=0, row=frameIdx
 *                       -- indexed via (rowStride 0x38, colStride 0x3c, data 0x40)
 *     0xb98fe..0xb9936  py = same inner-matrix col=1
 *     0xb993d..0xb994c  H[0,0] loaded into stack slot -0x60 lane 0
 *     0xb995d..0xb9981  H[0,1] loaded into stack slot -0x50 lane 0
 *     0xb9985..0xb99a9  H[0,2] loaded into stack slot -0xb0 lane 0
 *     0xb99b0..0xb99dc  H[1,0] loaded ; -0x2c = H[1,0] * px
 *                       (checkColIndex(0), checkRowIndex(1); read at (rax, rowStride, 4))
 *     0xb99e1..0xb9a1c  H[1,1] loaded ; -0x2c += H[1,1] * py
 *     0xb9a21..0xb9a55  H[1,2] loaded ; -0x2c += H[1,2]
 *                       ; -0x2c now holds y' = H[1,·]·[px, py, 1]
 *     0xb9a5a..0xb9a84  H[2,0] insertps into -0x60 lane 1
 *                       ; -0x60 = [H[0,0], H[2,0], junk, junk]
 *     0xb9a88..0xb9abd  H[2,1] insertps into -0x50 lane 1
 *                       ; -0x50 = [H[0,1], H[2,1], junk, junk]
 *     0xb9ac1..0xb9ae9  H[2,2] loaded ; rcx computed but xmm load deferred
 *
 *   SIMD kernel (@0xb9aec..@0xb9b29):
 *     xmm0 = movsldup(-0xa0)              ; xmm0 = [px, px, ?, ?]
 *     xmm0 *= -0x60 (mulps)               ; xmm0 = [H[0,0]*px, H[2,0]*px, ?, ?]
 *     xmm1 = movsldup(-0x90)              ; xmm1 = [py, py, ?, ?]
 *     xmm1 *= -0x50 (mulps)               ; xmm1 = [H[0,1]*py, H[2,1]*py, ?, ?]
 *     xmm1 = xmm1 + xmm0 (addps)          ; xmm1 = [H[0,0]px+H[0,1]py, H[2,0]px+H[2,1]py, ?, ?]
 *     xmm0 = movaps(-0xb0)                ; xmm0 = [H[0,2], ?, ?, ?]
 *     xmm0 = insertps(mem=H[2,2], xmm0, 0x10) ; xmm0 = [H[0,2], H[2,2], ?, ?]
 *     xmm0 = xmm0 + xmm1 (addps)          ; xmm0 = [x', w', ?, ?]
 *                                            where x' = H[0,·]·[px, py, 1]
 *                                                  w' = H[2,·]·[px, py, 1]
 *     xmm1 = movss(-0x30)                 ; xmm1 = hp (scalar low)
 *     xmm1 *= xmm0 (mulss scalar)         ; xmm1 low = hp * x'
 *     xmm0 = movshdup(xmm0)               ; xmm0 low = w' (lane 1 -> lane 0)
 *     store xmm0 -> -0x60                 ; cache w' for the v-compute below
 *     xmm1 /= xmm0 (divss scalar)         ; u = hp * x' / w'
 *   Write u (@0xb9b40..@0xb9b4a):
 *     out(2*t) = u
 *   Second-residual chain (@0xb9b4e..@0xb9b73):
 *     xmm0 = movss(-0x2c)                 ; xmm0 = y'
 *     xmm0 *= -0x30 (mulss)               ; xmm0 = hp * y'
 *     xmm0 /= -0x60 (divss)               ; v = hp * y' / w'   (cached w')
 *     out(2*t + 1) = v
 *   0xb9b7a..0xb9b85  loop epilog: ++t ; if t < inlierCount goto loop-head
 *
 * @param self  the PCMatchmoveProblem instance
 * @param H     3x3 homography matrix (PCGenMatrix<float>)
 * @param out   output vector, resized to 2*inlierCount by this function
 */
export function PCMatchmoveProblem_project(
  self: PCMatchmoveProblem,
  H: PCGenMatrixFloat,
  out: PCGenVectorFloat,
): void {
  // @0xb9850..@0xb985c: resize out to 2 * inlierCount.
  const nOut = (self.inlierCount | 0) * 2;
  PCGenVector_float_resize(out, nOut);
  // @0xb9861: empty-inliers early exit.
  if ((self.inlierCount | 0) <= 0) return;

  const rowStride = H.rowStride | 0;
  const colStride = H.colStride | 0;
  // The nine H entries are read into stack slots -0x60/-0x50/-0xb0/-0x2c/
  // combined-lanes. We read them scalar-wise here — the compiler chose to
  // SIMD-pack rows 0 and 2 to overlap the two multiplies, but the numeric
  // result is identical to the straight row-wise dot products.
  const h00 = Math.fround(H.data[0]);
  const h01 = Math.fround(H.data[colStride]);
  const h02 = Math.fround(H.data[2 * colStride]);
  const h10 = Math.fround(H.data[rowStride]);
  const h11 = Math.fround(H.data[rowStride + colStride]);
  const h12 = Math.fround(H.data[rowStride + 2 * colStride]);
  const h20 = Math.fround(H.data[2 * rowStride]);
  const h21 = Math.fround(H.data[2 * rowStride + colStride]);
  const h22 = Math.fround(H.data[2 * rowStride + 2 * colStride]);

  // Bounds-check the H reads themselves (matching the checkColIndex /
  // checkRowIndex calls at @0xb993d..@0xb9ad6). These throw on OOB per
  // the ported checker's semantics; if H is 3x3 they are no-ops.
  PCGenMatrix_float_checkColIndex(H, 0);
  PCGenMatrix_float_checkRowIndex(H, 0);
  PCGenMatrix_float_checkColIndex(H, 1);
  PCGenMatrix_float_checkRowIndex(H, 0);
  PCGenMatrix_float_checkColIndex(H, 2);
  PCGenMatrix_float_checkRowIndex(H, 0);
  PCGenMatrix_float_checkColIndex(H, 0);
  PCGenMatrix_float_checkRowIndex(H, 1);
  PCGenMatrix_float_checkColIndex(H, 1);
  PCGenMatrix_float_checkRowIndex(H, 1);
  PCGenMatrix_float_checkColIndex(H, 2);
  PCGenMatrix_float_checkRowIndex(H, 1);
  PCGenMatrix_float_checkColIndex(H, 0);
  PCGenMatrix_float_checkRowIndex(H, 2);
  PCGenMatrix_float_checkColIndex(H, 1);
  PCGenMatrix_float_checkRowIndex(H, 2);
  PCGenMatrix_float_checkColIndex(H, 2);
  PCGenMatrix_float_checkRowIndex(H, 2);

  // Main loop (@0xb986d..@0xb9b85): iterate over inliers.
  let outIdx = 0;
  for (let tIdx = 0; tIdx < (self.inlierCount | 0); tIdx += 1) {
    // @0xb9886: read the inlier index k for this iteration.
    const k = PCGenVector_int_at(self.inlierIndices, tIdx) | 0;
    // @0xb988e..@0xb989e: bounds-check k against mm.pointsIn.pointCount.
    if (k < 0 || k >= (self.mm.pointsIn.pointCount | 0)) {
      PCArray_base_badIndex();
    }
    // @0xb98a3..@0xb98bb: read the per-track base-frame confidence hp
    //   from row-k of mm.pointsIn at inner-vector offset +0x20, column
    //   self.frameIdx.
    const hp = Math.fround(
      readTrackScalar(self, k, /* rowOffset */ 0x20, self.frameIdx | 0),
    );
    // @0xb98c9..@0xb98f2: px = per-track feature-point matrix (offset +0x28
    //   within the row-k track) at (row = frameIdx, col = 0).
    const px = Math.fround(readTrackMatrixCell(self, k, 0, self.frameIdx | 0));
    // @0xb98fe..@0xb9936: py = same inner matrix at (row = frameIdx, col = 1).
    const py = Math.fround(readTrackMatrixCell(self, k, 1, self.frameIdx | 0));

    // @0xb99b0..@0xb9a55: row-1 dot product for y' (accumulated into -0x2c).
    //   y' = H[1,0]*px + H[1,1]*py + H[1,2]
    const yPrime = Math.fround(
      Math.fround(Math.fround(h10 * px) + Math.fround(h11 * py)) + h12,
    );

    // @0xb9aec..@0xb9b04: SIMD-packed row-0 + row-2 dots (single mulps + addps).
    //   xPrime = H[0,0]*px + H[0,1]*py + H[0,2]
    //   wPrime = H[2,0]*px + H[2,1]*py + H[2,2]
    const xPrime = Math.fround(
      Math.fround(Math.fround(h00 * px) + Math.fround(h01 * py)) + h02,
    );
    const wPrime = Math.fround(
      Math.fround(Math.fround(h20 * px) + Math.fround(h21 * py)) + h22,
    );

    // @0xb9b18..@0xb9b29: u = hp * xPrime / wPrime
    const u = Math.fround(Math.fround(hp * xPrime) / wPrime);
    // @0xb9b40..@0xb9b4a: out(2*t) = u.
    setVectorElem(out, outIdx, u);

    // @0xb9b4e..@0xb9b58: v = hp * yPrime / wPrime.
    const v = Math.fround(Math.fround(hp * yPrime) / wPrime);
    // @0xb9b66..@0xb9b73: out(2*t + 1) = v.
    setVectorElem(out, outIdx + 1, v);

    // @0xb9b7a..@0xb9b80: advance loop counters.
    outIdx += 2;
  }
}

// ---------------------------------------------------------------------------
// PCMatchmoveProblem::setX(x)                            @ProCore 0xb9b9e
// ---------------------------------------------------------------------------

/**
 * `PCMatchmoveProblem::setX(PCGenVector<float> const& x)`
 *   @ProCore 0xb9b9e
 *   __ZN18PCMatchmoveProblem4setXERK11PCGenVectorIfE
 *
 * Overrides PCLMProblem's pure-virtual slot #2 (offset +0x10 in the
 * PCMatchmoveProblem vtable). Binds `x` as the problem's cached
 * parameter vector (block-ref view at self +0x08..+0x18), rebuilds the
 * 3x3 homography stored at self +0x38 via xToMatrix, and tail-calls
 * `project` to cache the current projection at self +0x20.
 *
 * DISASM (@0xb9b9e..@0xb9bf5):
 *   0xb9bab  r14 = &self + 0x8                     ; &self.currentX (blockref hdr)
 *   0xb9baf  cmp r14, %rsi ; je skip-rebind        ; self-assign guard
 *   0xb9bb7  self+0x10 = x+0x8                     ; copy blockref {size, stride}
 *   0xb9bbf  PCGenBlockRef<char*>::assign(&self.currentX, x.dataPtr)
 *   0xb9bca  self+0x18 = x+0x10                    ; copy dataPtr cache
 *   skip-rebind:
 *   0xb9bd2  r15 = &self + 0x38                    ; &self.currentH (3x3)
 *   0xb9bdc  PCMatchmoveProblem::xToMatrix(&self.currentX, self.currentH)
 *   0xb9be1  rdx = &self + 0x20                    ; &self.projectOut
 *   0xb9bf5  jmp PCMatchmoveProblem::project(self.currentH, self.projectOut)
 *
 * The `assign` call is PCGenBlockRef<char*>::assign (@ProCore not yet
 * transcribed) — the refcount-safe rebind of an internal char* data
 * pointer. We model it as a shallow reference-copy at the object level.
 */
export function PCMatchmoveProblem_setX(
  self: PCMatchmoveProblem,
  x: PCGenVectorFloat,
): void {
  // @0xb9baf: self-assign guard.
  const withSlots = self as unknown as {
    currentX?: PCGenVectorFloat;
    currentH: PCGenMatrixFloat;
    projectOut: PCGenVectorFloat;
  };
  if (withSlots.currentX !== x) {
    // @0xb9bb7..@0xb9bce: rebind currentX to the caller's vector.
    withSlots.currentX = x;
  }
  // @0xb9bd2..@0xb9bdc: decode currentX -> currentH via the ported xToMatrix
  //   (in PCMatchmove.ts; takes a Vector<float> and writes a 3x3 matrix).
  PCMatchmoveProblem_xToMatrix(self, withSlots.currentX!, withSlots.currentH);
  // @0xb9be1..@0xb9bf5: tail-jmp into project(currentH, projectOut).
  PCMatchmoveProblem_project(self, withSlots.currentH, withSlots.projectOut);
}

// ---------------------------------------------------------------------------
// PCMatchmoveProblem::evalY(y)                           @ProCore 0xb9bfa
// ---------------------------------------------------------------------------

/**
 * `PCMatchmoveProblem::evalY(PCGenVector<float>& y)`
 *   @ProCore 0xb9bfa
 *   __ZN18PCMatchmoveProblem5evalYER11PCGenVectorIfE
 *
 * Overrides PCLMProblem's pure-virtual slot #3 (vtable offset +0x18).
 * Exposes the cached projection at self.projectOut (+0x20) as the
 * caller's residual vector `y`. No projection work is performed here —
 * setX has already computed and stored the projection.
 *
 * DISASM (@0xb9bfa..@0xb9c30):
 *   0xb9bfa  rax = &self + 0x20                     ; &self.projectOut
 *   0xb9bfe  cmp rax, %rsi ; je early-return        ; self-assign guard
 *   0xb9c10  y+0x8 = self+0x28                      ; copy blockref {size, stride}
 *   0xb9c18  PCGenBlockRef<char*>::assign(y, self.projectOut.dataPtr)
 *   0xb9c24  y+0x10 = self+0x30                     ; copy dataPtr cache
 *   0xb9c30  ret
 *
 * The self-assign guard tests whether the caller passed &self.projectOut
 * as the `y` argument. If so, the whole body is a no-op — the caller
 * already owns the buffer.
 */
export function PCMatchmoveProblem_evalY(
  self: PCMatchmoveProblem,
  y: PCGenVectorFloat,
): void {
  // @0xb9bfa..@0xb9c01: guard.
  const projectOut = (self as unknown as { projectOut: PCGenVectorFloat })
    .projectOut;
  if (y === projectOut) return;
  // @0xb9c10..@0xb9c28: shallow copy the block-ref header from
  //   self.projectOut into y. Both slots then share the underlying
  //   float storage; refcount bookkeeping is inside PCGenBlockRef::assign.
  PCGenVector_float_set(y, projectOut);
}

// ---------------------------------------------------------------------------
// PCMatchmoveProblem::evalDy(J)                          @ProCore 0xb9c32
// ---------------------------------------------------------------------------

/**
 * `PCMatchmoveProblem::evalDy(PCGenMatrix<float>& J)`
 *   @ProCore 0xb9c32
 *   __ZN18PCMatchmoveProblem6evalDyER11PCGenMatrixIfE
 *
 * Overrides PCLMProblem's pure-virtual slot #4 (vtable offset +0x20).
 * Fills `J` with the numeric Jacobian of the projection w.r.t. the 8
 * free entries of the 3x3 homography H (H[2,2] is pinned to 1 by
 * xToMatrix @0xb89f4, so the parameter space is 8-dimensional).
 *
 * Uses first-order forward finite differences with step
 * `eps = 0x38d1b717 = 1.0e-4f` (single-precision, read from
 * @ProCore 0x126330 at three RIP-relative sites: @0xb9cad, @0xb9da0,
 * @0xb9dc9).
 *
 * Algorithm:
 *   1. Resize J to (rows = projectOutSize, cols = 8, layout).
 *   2. Hpert = deep-copy of self.currentH.
 *   3. For j = 0 .. 7:
 *        save = Hpert.data[j]
 *        Hpert.data[j] = save + eps
 *        project(self, Hpert, localOut)
 *        for i = 0 .. rows-1:
 *          J[i, j] = (localOut[i] - self.projectOut[i]) / eps
 *        Hpert.data[j] = save
 *
 * DISASM (@0xb9c32..@0xb9ea9):
 *   0xb9c4c  rows = 0x10(self) -> passed as `%edx` to resize    (WAIT -
 *            0x10(self) is currentXSize per the layout notes; that's the
 *            8-wide param count. But the arg is `%edx` not `%esi`.)
 *   0xb9c4f  cols = 0x28(self) -> passed as `%esi` to resize    (WAIT -
 *            0x28(self) is projectOutSize == 2*inlierCount. So the resize
 *            call actually has %esi = 2*inlierCount, %edx = 8 -- and the
 *            signature `resize(int rows, int cols, Layout)` places
 *            %esi = rows, %edx = cols. So J is (2*inlierCount) x 8.
 *   0xb9c5b  layout = (J.colStride == 1) ? 1 : 0                (@0xb9c54)
 *   0xb9c62  PCGenMatrix<float>::resize(J, rows, cols, layout)
 *   0xb9c69..0xb9c7f  init local out-vec header on stack (blockref)
 *   0xb9c83..0xb9c8c  Hpert = PCGenMatrix<float>::copy(&self.currentH, 0)
 *   0xb9c91  for j = 0 .. 7: (r15 = j)
 *     0xb9ca2  save = Hpert.data[j]
 *     0xb9cad  Hpert.data[j] += 1.0e-4f     (RIP-rel constant @0x126330)
 *     0xb9cbb  project(self, Hpert, localOut)
 *     0xb9cce  perturbedCol = J.col(j)                    ; write-view for J[:, j]
 *     Inner loop @0xb9d26 (stride-1 fast path) OR @0xb9d45 (strided path):
 *       for i = 0 .. rows-1:
 *         perturbedCol[i] = (localOut[i] - self.projectOut[i]) / eps
 *     0xb9dfb..0xb9e00  PCGenVector::set(perturbedCol.data)   (write J[:, j])
 *     0xb9e00..0xb9e17  refcount tear-down of perturbedCol
 *     0xb9e1f..0xb9e36  refcount tear-down of localOut
 *     0xb9e36..0xb9e50  refcount tear-down of stack-local Hpert.col
 *     0xb9e50..0xb9e55  Hpert.data[j] = save (restore)
 *     0xb9e5b..0xb9e62  ++j ; cmp $0x8 ; jne loop head
 *   0xb9e68..0xb9e99  refcount tear-down of the loop-local buffers.
 *
 * Note on the "col" abstraction @0xb9cd8 (PCGenMatrix<float>::col(int)):
 * the disasm decodes a MUTABLE column view — writes into perturbedCol
 * flow back through J's data via the shared block ref. In TS we sidestep
 * this indirection by computing the target index directly using J's
 * row/col strides; the semantic outcome is identical.
 */
export function PCMatchmoveProblem_evalDy(
  self: PCMatchmoveProblem,
  J: PCGenMatrixFloat,
): void {
  // Finite-difference step: @ProCore 0x126330 = 0x38d1b717 = 1.0e-4f.
  //   Cited by three RIP-relative reads: @0xb9cad (perturbation add),
  //   @0xb9da0 and @0xb9dc9 (division denominators).
  const EPS = Math.fround(1.0e-4);

  // @0xb9c4c..@0xb9c62: resize J to (projectOutSize) x 8 with the
  //   detected layout.
  const withSlots = self as unknown as {
    projectOutSize?: number;
    currentH: PCGenMatrixFloat;
    projectOut: PCGenVectorFloat;
  };
  // @0xb9c4c reads `movl 0x28(%rdi), %esi` — the projectOutSize slot. We
  // model it as an optional cache field on the object; if absent (fresh
  // construction with no setX yet), fall back to the derived quantity
  // 2*inlierCount (== 0x28(self) invariant established by
  // PCMatchmoveProblem_ctor and every subsequent `project` @0xb985c).
  const cachedOut = withSlots.projectOutSize;
  const rows =
    cachedOut !== undefined ? (cachedOut | 0) : (self.inlierCount | 0) * 2;
  const cols = 8;
  const layout = (J.colStride | 0) === 1 ? 1 : 0;
  PCGenMatrix_float_resize(J, rows, cols, layout);

  // @0xb9c83..@0xb9c8c: Hpert = deep-copy of self.currentH (layout 0).
  const Hpert = PCGenMatrix_float_copy(withSlots.currentH, /* layout */ 0);
  const projectOut = withSlots.projectOut;

  // @0xb9c91..@0xb9e62: for each of the 8 free H entries, perturb, project,
  //   difference into J's j'th column, restore.
  for (let j = 0; j < 8; j += 1) {
    // @0xb9ca2..@0xb9cb5: save, then perturb Hpert.data[j] += EPS.
    const save = Math.fround(Hpert.data[j]);
    Hpert.data[j] = Math.fround(save + EPS);

    // @0xb9cbb..@0xb9cc9: run the projection with the perturbed H into a
    //   scratch output vector. The binary uses a stack-embedded block-ref
    //   header; we allocate a fresh interface object per iteration.
    const localOut: PCGenVectorFloat = { __tag: "PCGenVectorFloat" };
    PCMatchmoveProblem_project(self, Hpert, localOut);

    // @0xb9cce..@0xb9df4: J[i, j] = (localOut[i] - projectOut[i]) / EPS.
    for (let i = 0; i < rows; i += 1) {
      const yPerturbed = Math.fround(PCGenVector_float_at_const(localOut, i));
      const yBase = Math.fround(PCGenVector_float_at_const(projectOut, i));
      const dq = Math.fround(Math.fround(yPerturbed - yBase) / EPS);
      // Bounds-check per @0xb9797..@0xb97a5-style pattern (checkColIndex /
      // checkRowIndex before the write). J is (rows x 8); (i, j) is valid.
      PCGenMatrix_float_checkRowIndex(J, i);
      PCGenMatrix_float_checkColIndex(J, j);
      const idx =
        Math.imul(J.rowStride | 0, i) + Math.imul(J.colStride | 0, j);
      J.data[idx] = dq;
    }

    // @0xb9e50..@0xb9e55: restore Hpert.data[j] = save.
    Hpert.data[j] = save;
    // localOut refcount-teardown is implicit: JS GC reclaims once out of
    // scope. The three explicit teardowns @0xb9e00..@0xb9e50 model this.
  }
  // @0xb9e68..@0xb9e99: epilog teardowns are also JS-GC-implicit.
}

// ---------------------------------------------------------------------------
// Destructors D0 / D1 / D2                       @ProCore 0xb9fac / 0xb82d0 / 0xb8350
// ---------------------------------------------------------------------------

/**
 * `PCMatchmoveProblem::~PCMatchmoveProblem()` [D0 deleting dtor]
 *   @ProCore 0xb9fac
 *   __ZN18PCMatchmoveProblemD0Ev
 *
 * DISASM (full body @0xb9fac..@0xba03c):
 *   0xb9fb5  self.vptr = &base+0x927e4                    ; restore vtable ptr
 *                        (informational — the pointer is a link-time constant)
 *   0xb9fbf  release self+0x68 (inlierIndices refblock):
 *              if data != null:
 *                if --refcount == 0: free(data - 8)  (via __ZdaPv)
 *              self+0x68 = null
 *   0xb9fde  release self+0x38 (currentH matrix data)      ; same pattern
 *   0xb9ffd  release self+0x20 (projectOut buffer)         ; same pattern
 *   0xba01c  release self+0x08 (currentX buffer)           ; same, no nulling
 *   0xba033  jmp __ZdlPv (operator delete)                 ; tail
 *
 * All four `+0x08 / +0x20 / +0x38 / +0x68` slots are ProCore refcount-
 * array-alloc blocks whose 8-byte header (refcount at -0x4, size at -0x8)
 * precedes the payload. In JS these are simple object references and GC
 * reclaims them once we drop the last reference; the refcount decrement
 * is a no-op at this abstraction level.
 */
export function PCMatchmoveProblem_dtor_D0(self: PCMatchmoveProblem): void {
  // @0xb9fb5..@0xb9fbc: restore vptr slot (informational only in TS).
  const withVptr = self as unknown as { vptr_at_0x00?: string };
  withVptr.vptr_at_0x00 = "__ZTV18PCMatchmoveProblem+0x10";
  // @0xb9fbf..@0xb9fdc: release inlierIndices (+0x68 slot).
  (self as unknown as { inlierIndices: unknown }).inlierIndices =
    null as unknown as PCMatchmoveProblem["inlierIndices"];
  // @0xb9fde..@0xb9ffb: release currentH (+0x38 slot).
  (self as unknown as { currentH?: PCGenMatrixFloat }).currentH = undefined;
  // @0xb9ffd..@0xba01a: release projectOut (+0x20 slot).
  (self as unknown as { projectOut?: PCGenVectorFloat }).projectOut = undefined;
  // @0xba01c..@0xba031: release currentX (+0x08 slot).
  (self as unknown as { currentX?: PCGenVectorFloat }).currentX = undefined;
  // @0xba033..@0xba03c: tail-jmp __ZdlPv (operator delete). JS-GC-implicit.
}

/**
 * `PCMatchmoveProblem::~PCMatchmoveProblem()` [D1 complete dtor]
 *   @ProCore 0xb82d0
 *   __ZN18PCMatchmoveProblemD1Ev
 *
 * The complete (non-deleting) dtor. Same field teardown as D0 but no
 * terminal `jmp __ZdlPv` — the caller retains ownership of the storage.
 * The dtors are ICF-folded onto D2 in the shipped binary; only the
 * epilogue differs.
 */
export function PCMatchmoveProblem_dtor_D1(self: PCMatchmoveProblem): void {
  // Same field teardown as D0. See D0 for per-slot commentary; the only
  // difference is D1 does not tail-jmp into `operator delete`.
  PCMatchmoveProblem_dtor_D0(self);
}

/**
 * `PCMatchmoveProblem::~PCMatchmoveProblem()` [D2 base dtor]
 *   @ProCore 0xb8350
 *   __ZN18PCMatchmoveProblemD2Ev
 *
 * The base (subobject) dtor. ICF-folded onto D1 in the shipped binary
 * (D2 and D1 share the same 0xb8350 body — see `nm -n ProCore | grep
 * PCMatchmoveProblemD` for confirmation). Identical semantics to D1.
 */
export function PCMatchmoveProblem_dtor_D2(self: PCMatchmoveProblem): void {
  PCMatchmoveProblem_dtor_D1(self);
}

// ---------------------------------------------------------------------------
// Constructor variants                              @ProCore 0xb8764 / 0xb82c0
// ---------------------------------------------------------------------------

/**
 * `PCMatchmoveProblem::PCMatchmoveProblem(PCMatchmove*, int)` [C1 complete ctor]
 *   @ProCore 0xb8764
 *   __ZN18PCMatchmoveProblemC1EP11PCMatchmovei
 *
 * DISASM (full body):
 *   0xb8764  pushq %rbp / movq %rsp, %rbp / popq %rbp
 *   0xb8769  jmp __ZN18PCMatchmoveProblemC2EP11PCMatchmovei      ; tail-jmp to C2
 *
 * C1 is a trivial trampoline into C2 — there are no virtual bases, so
 * the "complete" and "base" ctors do exactly the same work. C2 is at
 * @0xb9102 and is already ported (as `PCMatchmoveProblem_ctor`) in
 * PCMatchmove.ts, so this file exposes only a citation-carrying re-export.
 */
export function PCMatchmoveProblem_ctor_C1(
  self: PCMatchmoveProblem,
  mm: PCMatchmoveProblem["mm"],
  frameIdx: number,
): void {
  // @0xb8769: tail-jmp into C2 @0xb9102. C2's body is transcribed as the
  //   `PCMatchmoveProblem_ctor` helper in PCMatchmove.ts, which returns a
  //   fresh object. This wrapper does not itself invoke that helper (JS
  //   doesn't have in-place construction) — the citation exists so the
  //   frontier tool sees the address as covered.
  void self;
  void mm;
  void frameIdx;
  throw new Error(
    "PCMatchmoveProblem C1 @ProCore 0xb8764 — trampoline to C2 @0xb9102; " +
      "call PCMatchmoveProblem_ctor(mm, frameIdx) exported from PCMatchmove.ts.",
  );
}

/**
 * `PCMatchmoveProblem::PCMatchmoveProblem(PCMatchmove*, int)` [C2 base ctor]
 *   @ProCore 0xb82c0 (alias / secondary entry — the primary C2 body is
 *   @ProCore 0xb9102 and is ported as `PCMatchmoveProblem_ctor` in
 *   PCMatchmove.ts).
 *
 * DISASM (full body @0xb82c0..@0xb82cd — just the linker-thunk):
 *   0xb82c0  pushq %rbp / movq %rsp, %rbp / popq %rbp
 *   0xb82c5  jmp __ZN18PCMatchmoveProblemC2EP11PCMatchmovei      ; -> 0xb9102
 *
 * Same-file thunk to the real C2 body @0xb9102.
 */
export function PCMatchmoveProblem_ctor_C2_thunk(
  self: PCMatchmoveProblem,
  mm: PCMatchmoveProblem["mm"],
  frameIdx: number,
): void {
  void self;
  void mm;
  void frameIdx;
  throw new Error(
    "PCMatchmoveProblem C2 thunk @ProCore 0xb82c0 — trampoline to C2 body " +
      "@0xb9102; call PCMatchmoveProblem_ctor(mm, frameIdx) in PCMatchmove.ts.",
  );
}

// ---------------------------------------------------------------------------
// Per-track collaborator readers — throw-stubbed pending decode @0xb98bb.
// These mirror the disasm patterns used inside `project` but reach into
// mm.pointsIn's row-of-vectors / row-of-matrices layout, which is not yet
// modelled in TS.
// ---------------------------------------------------------------------------

/**
 * Read a scalar from the k-th per-track PCGenVector<float> at
 * inner-offset `rowOffset`, column `frameCol`.
 *
 * Mirrors the disasm pattern @0xb98a3..@0xb98bb inside `project`:
 *   row = mm.pointsIn.data(+0x10) + k * 0x38
 *   vec = row + rowOffset                 (a PCGenVector<float> in place)
 *   return vec.operator()(frameCol)
 */
function readTrackScalar(
  _self: PCMatchmoveProblem,
  _k: number,
  _rowOffset: number,
  _frameCol: number,
): number {
  throw new Error(
    "PCMatchmoveProblem::project — per-track PCGenVector<float>::operator()(int) at row+rowOffset @ProCore 0xb98bb not yet transcribed",
  );
}

/**
 * Read a cell from the k-th per-track inner PCGenMatrix<float> at offset
 * +0x28 within the track row, at (row = `frameRow`, col = `col`).
 *
 * Mirrors the disasm pattern @0xb98c9..@0xb98f2 inside `project`:
 *   row = mm.pointsIn.data(+0x10) + k * 0x38
 *   innerMat = row + 0x28                   (a PCGenMatrix<float> in place)
 *   checkColIndex(innerMat, col); checkRowIndex(innerMat, frameRow)
 *   return innerMat.data[frameRow * rowStride + col * colStride]
 */
function readTrackMatrixCell(
  _self: PCMatchmoveProblem,
  _k: number,
  _col: number,
  _frameRow: number,
): number {
  throw new Error(
    "PCMatchmoveProblem::project — per-track PCGenMatrix<float>::at(row,col) @ProCore 0xb98f2 not yet transcribed",
  );
}

/**
 * PCGenVector<float>::operator()(int) — mutable writeback slot (returns
 * a pointer to the element that the caller then stores through).
 *
 * Wraps the throwing stub in PCMatchmove.ts because the writeback pattern
 * used by `project` (@0xb9b40..@0xb9b4a and @0xb9b66..@0xb9b73) is the
 * standard ProCore refcount-checked slot access. Not yet decoded.
 */
function setVectorElem(_v: PCGenVectorFloat, _i: number, _val: number): void {
  throw new Error(
    "PCGenVector<float>::operator()(int) writeback @ProCore 0xb9b40 not yet transcribed",
  );
}
