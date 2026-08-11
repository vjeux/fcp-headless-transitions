// ts_js_hooks.mjs — a module-resolution hook that lets the node
// `--experimental-strip-types` differential recipe work on a port that IMPORTS A SIBLING.
//
// WHY THIS EXISTS. The house recipe for a real TypeScript<->binary differential is to
// import the ported `.ts` straight into node (no tsx, no build step). That works
// perfectly for a LEAF port. It breaks on the first port that imports another ported
// module, because this repo's tsconfig is NodeNext, so every intra-repo import must be
// written with a `.js` extension:
//
//     import { hgAlignedHeap } from "./HGAllocAlign.js";     // required by tsc (G2)
//
// Node then resolves that literally, finds no `HGAllocAlign.js` on disk (nothing is
// compiled), and the driver dies with ERR_MODULE_NOT_FOUND pointing at a file the repo
// never produces. The port is correct and the gate is green; only the harness cannot
// load it. Since most non-leaf ports import a sibling, without this hook the
// differential recipe silently narrows to leaf math functions.
//
// The hook maps a `.js` specifier to the `.ts` beside it, and ONLY when that `.ts`
// exists — a real `.js` (or a package import) still resolves normally.
//
//   import { register } from "node:module";
//   register("./ts_js_hooks.mjs", import.meta.url);
//   const mod = await import("../../src/infra/Whatever.ts");   // dynamic: after register
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith(".js") && (specifier.startsWith("./") || specifier.startsWith("../"))) {
    const asTs = new URL(specifier.slice(0, -3) + ".ts", context.parentURL);
    if (existsSync(fileURLToPath(asTs))) {
      return { url: pathToFileURL(fileURLToPath(asTs)).href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
