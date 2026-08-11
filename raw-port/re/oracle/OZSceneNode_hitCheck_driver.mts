// OZSceneNode_hitCheck_driver.mts — the TypeScript half of the OZSceneNode::hitCheck @Ozone 0x90e70
// differential. Reads the SAME cases the oracle sent to the live binary on stdin, runs them through
// the REAL ported file (no restatement), and prints one JSON line per case.
//
// Run with the vendored tsx (raw-port/node_modules/.bin/tsx): `node --experimental-strip-types`
// cannot resolve this tree's extensionless/`.js` specifiers (ops/2026-08-11-the-mandated-ts-driver-
// recipe-cannot-load-40-ported-files.md).
//
// The two MUTANTS live in this same process so they are apples-to-apples with the port: they exist
// to show the comparison can fail. Mutant A returns true; mutant B keeps the return value but
// writes the hit point the real function never touches.
import { OZSceneNode } from "../../src/nodes/OZSceneNode.ts";

interface Case {
  i: number;
  point: { x: number; y: number };
  camera: boolean; // false => LiCamera const* was NULL on the C++ side
  flags: number;
  hitPoint: [string, string, string]; // the poisoned arena, as hex bit patterns
}

function bitsToF64(hex: string): number {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setBigUint64(0, BigInt("0x" + hex));
  return dv.getFloat64(0);
}
function f64ToBits(v: number): string {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, v);
  return dv.getBigUint64(0).toString(16).padStart(16, "0");
}

const cases: Case[] = JSON.parse(await new Promise<string>((res) => {
  let s = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (s += d));
  process.stdin.on("end", () => res(s));
}));

const node = new OZSceneNode();
// A stand-in for the caller-owned OZRenderState/LiCamera: the port must not read either, and the
// live function provably does not (it reads none of its arguments).
const state = {} as never;

for (const c of cases) {
  const hp = new Float64Array(c.hitPoint.map(bitsToF64));
  const ret = node.hitCheck(c.point, state, c.camera ? ({} as never) : null, hp, c.flags);

  // mutant A — same signature, wrong answer.
  const hpA = new Float64Array(c.hitPoint.map(bitsToF64));
  const mutA = { ret: true, hitPoint: Array.from(hpA).map(f64ToBits) };

  // mutant B — right answer, but writes the out-parameter the machine leaves alone.
  const hpB = new Float64Array(c.hitPoint.map(bitsToF64));
  hpB[0] = c.point.x;
  const mutB = { ret: false, hitPoint: Array.from(hpB).map(f64ToBits) };

  console.log(JSON.stringify({
    i: c.i,
    ret,
    hitPoint: Array.from(hp).map(f64ToBits),
    mutA,
    mutB,
  }));
}
