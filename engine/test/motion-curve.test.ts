/**
 * Validates the decompiled motion-curve.ts against reference values measured from
 * the REAL FCP engine (ruler renders of single-type 2-keyframe curves, 0 -> 1080
 * over the Push animation domain, decoded per-frame). See docs/DEBUGGING.md.
 */
import { evaluateMotionCurve, easeInOut, bezier, findParameter } from '../src/evaluator/motion-curve.js';
import type { CurveKeyframe } from '../src/evaluator/motion-curve.js';

const T_LAST = 200200 / 120000;

const REF: Record<number, number[]> = {
  6:  [0,1,5,12,21,32,45,60,77,96,117,139,163,188,214,242,270,300,330,361,393,425,458,491,524,557,590,622,655,687,719,750,780,810,838,866,892,917,941],
  7:  [0,1,2,5,9,14,20,27,35,45,55,67,79,93,107,123,139,157,175,194,215,236,258,281,304,329,354,380,407,434,462,491,520,550,581,611,643,675,707],
  8:  [0,35,69,104,138,172,207,240,274,307,340,373,405,437,469,500,530,560,589,618,646,673,700,726,751,776,800,822,844,866,886,905,924,941,958,973,988,1001,1014],
  15: [0,1,5,11,19,30,43,59,77,97,120,145,173,202,231,261,290,320,349,378,408,437,467,496,525,555,584,614,643,672,702,731,760,790,819,849,878,907,935],
  16: [0,1,2,5,10,15,22,30,39,49,60,73,87,101,118,135,154,173,194,217,240,265,290,317,346,375,404,434,463,492,522,551,580,610,639,669,698,727,757],
  17: [0,30,59,88,118,147,176,206,235,265,294,323,353,382,411,441,470,500,529,558,588,617,647,676,705,735,763,790,816,840,864,886,907,927,945,963,979,994,1007],
};
const NAME: Record<number, string> = {6:'CatmullRom',7:'EaseIn',8:'EaseOut',15:'Ease',16:'Accelerate',17:'Decelerate'};

function kfs(interp: number): CurveKeyframe[] {
  return [{ t: 0, v: 0, interp }, { t: T_LAST, v: -1080, interp }];
}

let pass = 0, fail = 0;
console.log('Decompiled motion-curve.ts vs real FCP engine:\n');
for (const ty of [6, 7, 8, 15, 16, 17]) {
  const ref = REF[ty], k = kfs(ty);
  let maxErr = 0, sum = 0;
  for (let i = 0; i < ref.length; i++) {
    const v = -evaluateMotionCurve(k, (i / 49) * T_LAST);
    const e = Math.abs(v - ref[i]); maxErr = Math.max(maxErr, e); sum += e;
  }
  const ok = maxErr < 2.0;
  console.log(`  type ${String(ty).padStart(2)} ${NAME[ty].padEnd(11)}: mean ${(sum/ref.length).toFixed(2)}px max ${maxErr.toFixed(2)}px  ${ok?'PASS':'FAIL'}`);
  ok ? pass++ : fail++;
}

// Unit checks on the primitives.
function approx(a: number, b: number, eps = 1e-9) { return Math.abs(a - b) < eps; }
const bez2kf: CurveKeyframe[] = [{t:0,v:0,interp:6},{t:1,v:1,interp:6}];
// 2-keyframe CatmullRom == smoothstep 3u²-2u³
let ssOk = true;
for (const u of [0.1,0.3,0.5,0.7,0.9]) {
  const got = evaluateMotionCurve(bez2kf, u);
  const ss = 3*u*u - 2*u*u*u;
  if (!approx(got, ss, 1e-6)) ssOk = false;
}
console.log(`\n  2-kf CatmullRom == smoothstep 3u²-2u³: ${ssOk ? 'PASS' : 'FAIL'}`);
if (!ssOk) fail++;
// easeInOut endpoints
console.log(`  easeInOut(0)=${easeInOut(0,0.25,0.25).toFixed(3)} easeInOut(1)=${easeInOut(1,0.25,0.25).toFixed(3)} (expect 0.000 / 1.000)`);

console.log(`\n${pass}/${pass+fail} checks passed`);
if (fail > 0) process.exit(1);

// ── Stored-tangent Bezier (type 2) — distinct from CatmullRom (type 6) ─────────
// Reference measured from the real engine for a 2-keyframe type-2 curve with
// strong stored tangents (out=(0.5,-800) at kf0, in=(-0.5,-200) at kf1).
{
  const T = 200200 / 120000;
  const k: CurveKeyframe[] = [
    { t: 0, v: 0, interp: 2, outTangentTime: 0.5, outTangentValue: -800, inTangentTime: -0.1, inTangentValue: 0 },
    { t: T, v: -1080, interp: 2, inTangentTime: -0.5, inTangentValue: -200, outTangentTime: 0.1, outTangentValue: 0 },
  ];
  const ref = [0,54,106,156,204,251,297,341,384,426,466,505,542,579,614,648,681,713,744,773,801,829,855,880,904,926,948,968,988,1006,1023];
  let maxErr = 0, sum = 0;
  for (let i = 0; i < ref.length; i++) {
    const v = -evaluateMotionCurve(k, (i / 49) * T);
    const e = Math.abs(v - ref[i]); maxErr = Math.max(maxErr, e); sum += e;
  }
  const ok = maxErr < 2.0;
  console.log(`  type  2 Bezier(stored): mean ${(sum/ref.length).toFixed(2)}px max ${maxErr.toFixed(2)}px  ${ok?'PASS':'FAIL'}`);
  if (!ok) process.exit(1);
}
