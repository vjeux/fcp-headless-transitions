import { mat4Identity, mat4Multiply, mat4Translate, mat4RotateX } from '../src/evaluator/index.js';
// Replicate original formula: T(pos)·R·S·T(-anchor) with pos=0, anchor=-540, no rot
let m = mat4Identity();
m = mat4Multiply(mat4Translate(0, 0, 0), m); // pos
// no rot, no scale
m = mat4Multiply(mat4Translate(0, 540, 0), m); // -anchor = -(-540) = +540
console.log('pos=0,anchor=-540,no-rot: ty =', m[13]);
// with small X rotation
let m2 = mat4Identity();
m2 = mat4Multiply(mat4Translate(0, -77, 0), m2); // posY at p=0.14
m2 = mat4Multiply(mat4RotateX(12), m2); // ~0.21 rad = 12 deg
m2 = mat4Multiply(mat4Translate(0, 540, 0), m2);
console.log('p=0.14 approx: ty =', m2[13].toFixed(1), 'tz =', m2[14].toFixed(1));
