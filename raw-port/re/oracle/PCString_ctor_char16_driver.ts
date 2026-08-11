// TS side of the differential oracle for PCString::PCString(unsigned short const*)
// @ProCore 0x31eac [C1] / 0x31e7a [C2]. Not part of the port (tsconfig only includes
// src/**). Driven by raw-port/re/oracle/PCString_ctor_char16_oracle.py, which feeds the
// identical UTF-16 buffers to the live binary and to this port.
//
// The wire format is arrays of CODE UNITS in both directions, never JS strings: a lone
// surrogate cannot survive a round trip through some JSON encoders, and this corpus
// deliberately contains lone surrogates (the machine does not repair them either).
import { PCString } from "../../src/infra/PCString.js";

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  // null = the NULL pointer case; otherwise a NUL-terminated code-unit buffer.
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as (number[] | null)[];
  const out = cases.map((units) => {
    const s = PCString.fromChar16(units === null ? null : Uint16Array.from(units));
    if (s.ref === null) return null;
    // Index by CODE UNIT, deliberately. `Array.from(str, ...)` iterates code
    // POINTS, which merges a surrogate pair into one element and silently drops
    // its low half — that readback bug made a correct port look like it truncated
    // an emoji on the first run of this harness.
    const outUnits: number[] = [];
    for (let i = 0; i < s.ref.length; i++) outUnits.push(s.ref.charCodeAt(i));
    return outUnits;
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
