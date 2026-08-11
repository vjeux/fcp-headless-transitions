// getCodecGroup_driver.mts — the TS half of the getCodecGroup differential.
//
//   node --experimental-strip-types getCodecGroup_driver.mts <module.ts>
//   stdin : {"inputs":[<uint32>, ...]}
//   stdout: {"out":[<uint32>, ...]}
//
// It imports the REAL ported module (no build step, no tsx — Node strips the
// types natively), so what is measured is what ships. The module path is an
// argument rather than a fixed import so the same driver can run the shipped
// source and the mutant copies the oracle generates, all through one code
// path — a mutant that took a different route would not be a control.
//
// Values cross as JSON integers in the unsigned 32-bit domain (FourCCs), so
// there is no float round-trip on this wire; `>>> 0` pins the sign on the way
// out.
import { pathToFileURL } from "node:url";

const modPath = process.argv[2];
if (!modPath) {
  console.error("usage: getCodecGroup_driver.mts <module.ts>");
  process.exit(2);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const { inputs } = JSON.parse(raw) as { inputs: number[] };

const mod = (await import(pathToFileURL(modPath).href)) as {
  getCodecGroup(codec: number): number;
};

const out = inputs.map((x) => mod.getCodecGroup(x >>> 0) >>> 0);
process.stdout.write(JSON.stringify({ out }) + "\n");
