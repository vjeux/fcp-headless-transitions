// TS side of the differential oracle for PCStream::~PCStream() [D2] @ProCore 0x6dec.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/PCStream_D2_oracle.py.
//
// The live half of the oracle proves the real D2 writes nothing to the object. The TS half
// proves the same of the port: the machine's "no stores" must show up here as "no observable
// property changes" (in particular the vptr at +0x00 is NOT reset) and no throw — an empty
// body is not a trap, unlike the sibling D1/D0 slots at 0xDD34C/0xDD352.
import { PCStream } from "../../src/infra/PCStream.js";

class ProbeStream extends PCStream {
  writes: Array<[string, number]> = [];
  write(bytes: string, len: number): void {
    this.writes.push([bytes, len]);
  }
}

const s = new ProbeStream();
const before = JSON.stringify({ vptr: String(s.__vptr), writes: s.writes });
s.destroyD2();
const after = JSON.stringify({ vptr: String(s.__vptr), writes: s.writes });

if (before !== after) {
  console.log("TS_MUTATED " + before + " -> " + after);
  process.exit(1);
}
if (s.writes.length !== 0) {
  console.log("TS_WROTE_TO_SINK");
  process.exit(1);
}
console.log("TS_NO_EFFECT");
