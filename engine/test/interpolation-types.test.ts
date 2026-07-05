/**
 * Validates evaluateCurve for every interpolation type against reference values
 * measured from the REAL FCP engine (ruler renders of single-type 2-keyframe
 * curves, 0 -> 1080 over the Push animation domain). See docs/DEBUGGING.md.
 *
 * Reference arrays are the decoded per-frame displacements (frame i at
 * u = i/49). We reconstruct the same 2-keyframe curve in-engine and compare.
 */
import { evaluateCurve } from '../src/evaluator/curves.js';
import type { Curve } from '../src/types.js';

const T_LAST = 200200 / 120000;

// Measured from the real engine (tools/decode_ruler.py on /tmp/interp_out_<ty>).
// Only frames where source A is still on-screen are meaningful; we test 0..38.
const REF: Record<number, number[]> = {
  6:  [0,1,5,12,21,32,45,60,77,96,117,139,163,188,214,242,270,300,330,361,393,425,458,491,524,557,590,622,655,687,719,750,780,810,838,866,892,917,941],
  7:  [0,1,2,5,9,14,20,27,35,45,55,67,79,93,107,123,139,157,175,194,215,236,258,281,304,329,354,380,407,434,462,491,520,550,581,611,643,675,707],
  8:  [0,35,69,104,138,172,207,240,274,307,340,373,405,437,469,500,530,560,589,618,646,673,700,726,751,776,800,822,844,866,886,905,924,941,958,973,988,1001,1014],
  15: [0,1,5,11,19,30,43,59,77,97,120,145,173,202,231,261,290,320,349,378,408,437,467,496,525,555,584,614,643,672,702,731,760,790,819,849,878,907,935],
  16: [0,1,2,5,10,15,22,30,39,49,60,73,87,101,118,135,154,173,194,217,240,265,290,317,346,375,404,434,463,492,522,551,580,610,639,669,698,727,757],
  17: [0,30,59,88,118,147,176,206,235,265,294,323,353,382,411,441,470,500,529,558,588,617,647,676,705,735,763,790,816,840,864,886,907,927,945,963,979,994,1007],
};

function make2kf(interp: number): Curve {
  return {
    type: 1, default: 0, value: 0,
    keyframes: [
      { time: { value: 0, timescale: 120000 }, value: 0, interpolation: interp, flags: 128 } as any,
      { time: { value: 200200, timescale: 120000 }, value: -1080, interpolation: interp, flags: 128 } as any,
    ],
  };
}

let pass = 0, fail = 0;
for (const ty of [6, 7, 8, 15, 16, 17]) {
  const curve = make2kf(ty);
  const ref = REF[ty];
  let maxErr = 0, sumErr = 0;
  for (let i = 0; i < ref.length; i++) {
    const t = (i / 49) * T_LAST;
    const v = -evaluateCurve(curve, t); // curve goes 0 -> -1080; displacement = -value
    const err = Math.abs(v - ref[i]);
    maxErr = Math.max(maxErr, err); sumErr += err;
  }
  const mean = sumErr / ref.length;
  const ok = maxErr < 2.0; // ruler-decode precision is ~1px
  console.log(`  interp ${String(ty).padStart(2)} (${['','','','','','','CatmullRom','EaseIn','EaseOut','','','','','','','Ease','Accelerate','Decelerate'][ty]}): mean ${mean.toFixed(2)}px max ${maxErr.toFixed(2)}px  ${ok ? 'PASS' : 'FAIL'}`);
  if (ok) pass++; else fail++;
}
console.log(`\n${pass}/${pass + fail} interpolation types match the real engine`);
if (fail > 0) process.exit(1);
