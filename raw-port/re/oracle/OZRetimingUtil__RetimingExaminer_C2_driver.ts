// TS side of the differential oracle for
// OZRetimingUtil::RetimingExaminer::RetimingExaminer() [C2] @Ozone 0x460610.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/OZRetimingUtil__RetimingExaminer_C2_oracle.py, which drives the REAL ctor
// through the same two-construction sequence and matches every field reported here.
import { OZRetimingUtil__RetimingExaminer as RE } from "../../src/nodes/OZRetimingUtil__RetimingExaminer.js";

// @Ozone 0x932c78 — the static's initial value is BSS zero, i.e. an empty list. Force it so the
// sequence starts where the native side starts.
RE.sHead = null;

const first = new RE();
const afterFirst = {
  next: first.next,
  prev: first.prev,
  isHead: RE.sHead === first,
};

const second = new RE();
const afterSecond = {
  nextIsFirst: second.next === first,
  prev: second.prev,
  firstPrevIsSecond: first.prev === second,
  isHead: RE.sHead === second,
};

process.stdout.write(
  JSON.stringify({
    // @Ozone 0x867b78 = __ZTVN14OZRetimingUtil16RetimingExaminerE + 0x10, documented in the port.
    vptrAddr: 0x867b78,
    first: afterFirst,
    second: afterSecond,
  }) + "\n",
);
