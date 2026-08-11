// TS side of the differential oracle for HGMetalDeviceInfo::isBuiltin() const @Helium 0x1c55a0.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HGMetalDeviceInfo_isBuiltin_oracle.py, which feeds the identical synthetic
// records to the live binary and to this port.
import { HGMetalDeviceInfo } from "../../src/render/HGMetalDeviceInfo.js";

interface WireCase {
  loc: number;
  vendor: number;
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const info = new HGMetalDeviceInfo();
    info.deviceFamily_at_0x20 = c.vendor;
    info.deviceLocation_at_0x28 = c.loc;
    return info.isBuiltin();
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
