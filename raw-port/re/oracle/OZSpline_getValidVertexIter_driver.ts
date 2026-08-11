// TS side of the differential oracle for OZSpline::getValidVertexIter(void*) @ProChannel 0x2fdac.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/OZSpline_getValidVertexIter_oracle.py, which feeds the identical synthetic
// splines to the live binary and to this port and compares BOTH observable outputs (the returned
// index and the write-back to +0x80).
import {
  OZSpline_getValidVertexIter,
  type OZSplineFieldsM1,
  type OZVertexHandleM1,
} from "../../src/channels/OZSpline.m1.js";

interface WireCase {
  /** pool ids of the +0x48..+0x50 array's elements */
  result: number[];
  /** pool ids of the +0x58..+0x60 array's elements */
  search: number[];
  /** the +0x80 cached index on entry */
  hint: number;
  /** pool id of the searched-for pointer */
  v: number;
}

// One distinct object per pool id: identity (`===`) stands in for the machine's 64-bit pointer
// comparison, and distinct ids are distinct pointers in the native harness too.
const POOL: OZVertexHandleM1[] = [];
function handle(id: number): OZVertexHandleM1 {
  while (POOL.length <= id) {
    POOL.push({
      valueU: { value: 0, timescale: 1, flags: 1, epoch: 0 },
      normal: 0,
    } as unknown as OZVertexHandleM1);
  }
  return POOL[id]!;
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const sp: OZSplineFieldsM1 = {
      vertices: [],
      cachedLastValid: null,
      cachedFirstValid: null,
      cachedListValid: 0,
      clampExtrapolation: 0,
      dirty: 0,
      state: null,
      validIterResultVertices: c.result.map(handle),
      validIterSearchVertices: c.search.map(handle),
      validIterCachedIndex: c.hint,
    };
    const ret = OZSpline_getValidVertexIter(sp, handle(c.v));
    return [ret, sp.validIterCachedIndex];
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
