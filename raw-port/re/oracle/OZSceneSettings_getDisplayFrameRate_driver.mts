// OZSceneSettings_getDisplayFrameRate_driver.mts
//
//   node --experimental-strip-types <this> <module.ts>
//   stdin : {"cases":[{"bits":<u64 as number>,"flag":<int>}, ...]}
//   stdout: {"out":[<u64 bit pattern as number>, ...]}
//
// BIT PATTERNS BOTH WAYS. The frame rate arrives as the raw u64 of an IEEE
// double and the result leaves the same way, rebuilt/read through a DataView.
// Passing JS numbers instead would lose signed zero and NaN payloads, and
// Python's json.dump cannot even emit a bare NaN that JSON.parse will accept.
// The u64s are carried as HEX STRINGS and rebuilt with BigInt, because a
// double's bit pattern routinely exceeds 2**53 — as JSON numbers they would be
// silently rounded in transit, corrupting both the corpus and the results.
import { pathToFileURL } from "node:url";

const modPath = process.argv[2];
if (!modPath) {
  console.error("usage: <driver> <module.ts>");
  process.exit(2);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const { cases } = JSON.parse(raw) as { cases: { bits: string; flag: number }[] };

const mod = (await import(pathToFileURL(modPath).href)) as {
  OZSceneSettings: new () => {
    frameRateAt20: number;
    ntscFlagAt28: number;
    getDisplayFrameRate(): number;
  };
};

const buf = new ArrayBuffer(8);
const dv = new DataView(buf);

const out = cases.map((c) => {
  dv.setBigUint64(0, BigInt("0x" + c.bits), true);
  const rate = dv.getFloat64(0, true);
  const o = new mod.OZSceneSettings();
  o.frameRateAt20 = rate;
  o.ntscFlagAt28 = c.flag;
  const r = o.getDisplayFrameRate();
  dv.setFloat64(0, r, true);
  return dv.getBigUint64(0, true).toString(16).padStart(16, "0");
});

process.stdout.write(JSON.stringify({ out }) + "\n");
