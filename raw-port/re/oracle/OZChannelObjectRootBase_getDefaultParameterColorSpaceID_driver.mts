// Driver for OZChannelObjectRootBase_getDefaultParameterColorSpaceID_oracle.py — imports the REAL
// port and prints its answer as JSON.
//
// The port's module imports sibling TYPES only (`import type`), which node's type stripping erases,
// so a plain dynamic import through the repo's `.js` resolve hook is enough. (A NAMED value import
// of an interface would fail to load here — see the OPS_LOG entry on `import type`.)
import { register } from "node:module";
register("./ts_js_hooks.mjs", import.meta.url);

const mod = await import("../../src/channels/OZChannelObjectRootBase.ts");
const { OZChannelObjectRootBase } = mod as {
  OZChannelObjectRootBase: new () => { getDefaultParameterColorSpaceID(): number };
};

// Two instances: one plain, one whose modelled fields are deliberately left unset — the C side
// calls with a poisoned and then an unmapped `this`, and the port must be as indifferent to its
// receiver as the five-instruction body is.
const a = new OZChannelObjectRootBase();
const b = new OZChannelObjectRootBase();
console.log(JSON.stringify({
  value: a.getDefaultParameterColorSpaceID(),
  poisonedThis: b.getDefaultParameterColorSpaceID(),
}));
