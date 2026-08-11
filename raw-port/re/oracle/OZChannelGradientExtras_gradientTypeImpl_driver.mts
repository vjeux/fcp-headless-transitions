// Driver for OZChannelGradientExtras_gradientTypeImpl_oracle.py — imports the REAL port and
// reports what its first call does, as JSON on the last stdout line.
//
//   node --experimental-strip-types OZChannelGradientExtras_gradientTypeImpl_driver.mts
//
// The port is imported directly (no build step, no tsx). It imports nothing itself, so the plain
// static import below is correct and the `.js`-specifier resolve hook is not needed here.
import { OZChannelGradientExtras_gradientTypeImpl } from "../../src/channels/OZChannelGradientExtras_gradientTypeImpl.ts";

let out: { threw: boolean; message: string; returned: string | null };
try {
  const v = OZChannelGradientExtras_gradientTypeImpl.getInstance();
  out = { threw: false, message: "", returned: String(v) };
} catch (e) {
  out = { threw: true, message: (e as Error).message, returned: null };
}
console.log(JSON.stringify(out));
