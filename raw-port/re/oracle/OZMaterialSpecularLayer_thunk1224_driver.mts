// OZMaterialSpecularLayer_thunk1224_driver.mts — the TypeScript half of the
// `__ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv` @Ozone 0x497dc0
// differential. Run through the repo's own `tsx` (raw-port/node_modules/.bin/tsx).
//
// The C side of this unit returns an ADDRESS (`leaq this+0x2f18`), which has no TypeScript
// counterpart to compare numerically — the port models the object structurally instead, so what is
// checked here is the property that survives that modelling: does the port hand back THE MEMBER AT
// +0x2f18, and not one of its neighbours? Every candidate field carries a distinct sentinel, so
// picking the wrong one is as visible as a wrong displacement is on the C side.
//
// The mutants live in this process, next to the port, and M0 is an unmutated restatement whose job
// is to be the control: if M0 is "killed", the harness is measuring itself.
import {
  OZMaterialSpecularLayer_specularShininessImageDeprecatedChannel_thunk1224,
  type OZMaterialSpecularLayerSecondaryBase,
} from "../../src/channels/OZMaterialSpecularLayer.ts";

type Obj = Record<string, unknown>;

function build(): OZMaterialSpecularLayerSecondaryBase {
  // The named member the thunk addresses, plus the neighbours a mis-decode would reach for:
  // +0x33e0 is the PRIMARY-vtable body's displacement (@0x497b50) and the one plausible wrong
  // answer, since 0x33e0 - 0x2f18 == 0x4c8 == the 1224 in the symbol name.
  return {
    specularShininessImageDeprecatedChannelAt0x2f18: "chan@0x2f18",
    primaryViewFieldAt0x33e0: "chan@0x33e0",
    neighbourAt0x2f10: "chan@0x2f10",
    selfAt0x0: "this",
  } as unknown as OZMaterialSpecularLayerSecondaryBase;
}

const o = build() as unknown as Obj;
const port = String(
  OZMaterialSpecularLayer_specularShininessImageDeprecatedChannel_thunk1224(build()),
);

const mutants: Record<string, [string, string]> = {
  M0: [String(o.specularShininessImageDeprecatedChannelAt0x2f18),
       "unmutated restatement — must NOT be killed"],
  M1: [String(o.primaryViewFieldAt0x33e0),
       "the PRIMARY body's +0x33e0 (the thunk adjustment ignored)"],
  M2: [String(o.neighbourAt0x2f10), "off by 8"],
  M3: [String(o.selfAt0x0), "returns `this` (no displacement)"],
};

process.stdout.write(JSON.stringify({ port, mutants }));
