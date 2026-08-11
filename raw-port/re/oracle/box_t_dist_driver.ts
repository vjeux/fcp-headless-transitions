// TS side of the differential oracle for videoanalysis::collation::box_t::dist(box_t const&)
// const @Flexo 0x1322200. Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/box_t_dist_oracle.py.
//
// Doubles cross the JSON boundary as 16-hex-digit IEEE-754 bit patterns in BOTH directions:
// Python's json.dump emits bare NaN/Infinity, which JSON.parse rejects (OPS_LOG, worker 1), and
// bit patterns also make the comparison exact for signed zero and NaN payloads.
import { videoanalysis__collation__box_t } from "../../src/infra/videoanalysis__collation__box_t.js";

interface WireBox {
  x: string;
  y: string;
  w: string;
  h: string;
  sx: string;
  sy: string;
}

interface WireCase {
  a: WireBox;
  b: WireBox;
}

const scratch = new DataView(new ArrayBuffer(8));

function fromBits(hex: string): number {
  scratch.setBigUint64(0, BigInt("0x" + hex));
  return scratch.getFloat64(0);
}

function toBits(v: number): string {
  scratch.setFloat64(0, v);
  return scratch.getBigUint64(0).toString(16).padStart(16, "0");
}

function makeBox(w: WireBox): videoanalysis__collation__box_t {
  const box = new videoanalysis__collation__box_t();
  box.rect = {
    x: fromBits(w.x),
    y: fromBits(w.y),
    width: fromBits(w.w),
    height: fromBits(w.h),
  };
  box.scaleX = fromBits(w.sx);
  box.scaleY = fromBits(w.sy);
  return box;
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => toBits(makeBox(c.a).dist(makeBox(c.b))));
  process.stdout.write(JSON.stringify(out) + "\n");
});
