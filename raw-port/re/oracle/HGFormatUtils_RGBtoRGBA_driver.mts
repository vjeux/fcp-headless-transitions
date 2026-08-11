// HGFormatUtils_RGBtoRGBA_driver.mts — TS half of the RGBtoRGBA differential.
//
//   node --experimental-strip-types HGFormatUtils_RGBtoRGBA_driver.mts <mod.ts>
//   stdin : {"inputs":[<int32>, ...]}
//   stdout: {"out":[{"value":<int32>|null,"threw":<string|null>}, ...]}
//
// A RAISE IS REPORTED, NOT SWALLOWED. The port deliberately refuses the inputs
// where the binary reads past formatInfos (@Helium 0xa1d13), so the throw is a
// result the oracle has to see and classify — catching it here and reporting
// `value: null` is what lets the Python side score a refusal separately from
// agreement, instead of a try/catch quietly turning UB into a pass.
//
// The module path is an argument so the shipped source and every mutant run
// through one code path.
import { pathToFileURL } from "node:url";

const modPath = process.argv[2];
if (!modPath) {
  console.error("usage: HGFormatUtils_RGBtoRGBA_driver.mts <module.ts>");
  process.exit(2);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const { inputs } = JSON.parse(raw) as { inputs: number[] };

const mod = (await import(pathToFileURL(modPath).href)) as {
  HGFormatUtils_RGBtoRGBA(fmt: number): number;
};

const out = inputs.map((x) => {
  try {
    // NO `| 0` HERE: normalising the result would silently repair an
    // unsigned-view return (4294967288 vs -8), which is one of the defects
    // under test. Report exactly what the port returned.
    return { value: mod.HGFormatUtils_RGBtoRGBA(x), threw: null };
  } catch (e: unknown) {
    return { value: null, threw: String((e as Error)?.message ?? e).slice(0, 160) };
  }
});

process.stdout.write(JSON.stringify({ out }) + "\n");
