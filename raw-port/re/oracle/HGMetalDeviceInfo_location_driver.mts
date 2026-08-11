// HGMetalDeviceInfo location trio — TS side of the live differential.
// Imports the REAL port and answers the same corpus the Python side just put
// through the live Helium symbols.
//
//   node --experimental-strip-types HGMetalDeviceInfo_location_driver.mts
//   stdin : {"values":[u32...]}
//   stdout: {"shipped":[...],"aliased":{...},"controls":{...}}
//
// Three things are reported per case:
//   * shipped  — the port as it stands, all three predicates over the single
//                landed field `deviceLocation_at_0x28`;
//   * aliased  — the arrangement review rejected, modelled here rather than
//                described: a SECOND property for the same +0x28 dword, driven
//                three ways (landed field only / alias only / both), which is
//                what makes the aliasing visible at all;
//   * controls — one-decision mutants of isSlotted, each priced against live.
import { HGMetalDeviceInfo } from "../../src/render/HGMetalDeviceInfo.ts";

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const values: number[] = JSON.parse(Buffer.concat(chunks).toString()).values;

type Row = { isBuiltin: boolean; isSlotted: boolean; isExternal: boolean };

const shipped: Row[] = values.map((v) => {
  const o = new HGMetalDeviceInfo();
  o.deviceLocation_at_0x28 = v >>> 0;
  return { isBuiltin: o.isBuiltin(), isSlotted: o.isSlotted(), isExternal: o.isExternal() };
});

// The rejected arrangement: one machine dword modelled as TWO properties.
class Aliased {
  deviceLocation_at_0x28 = 0;
  location_at_0x28 = 0;
  isBuiltin(): boolean { return (this.deviceLocation_at_0x28 >>> 0) === 0; }
  isSlotted(): boolean { return (this.location_at_0x28 >>> 0) === 1; }
  isExternal(): boolean { return (this.deviceLocation_at_0x28 >>> 0) === 2; }
}
const drive = (mode: "landed" | "alias" | "both"): Row[] =>
  values.map((v) => {
    const o = new Aliased();
    if (mode !== "alias") o.deviceLocation_at_0x28 = v >>> 0;
    if (mode !== "landed") o.location_at_0x28 = v >>> 0;
    return { isBuiltin: o.isBuiltin(), isSlotted: o.isSlotted(), isExternal: o.isExternal() };
  });

const controls: Record<string, boolean[]> = {
  "truthiness instead of === 1": values.map((v) => !!(v >>> 0)),
  ">= 1 range test instead of sete": values.map((v) => (v >>> 0) >= 1),
  "compares against 0 (isBuiltin's immediate)": values.map((v) => (v >>> 0) === 0),
  "reads the +0x20 vendor slot instead": values.map(() => false), // that field is never written here
  "16-bit compare instead of the 32-bit cmpl": values.map((v) => ((v >>> 0) & 0xffff) === 1),
};

process.stdout.write(JSON.stringify({
  shipped,
  aliased: { writeLandedOnly: drive("landed"), writeAliasOnly: drive("alias"), writeBoth: drive("both") },
  controls,
}));
