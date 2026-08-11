// OZ3DEngineSceneFileImpl_postReadMedia_driver.mts — the TypeScript side of the differential for
// `OZ3DEngineSceneFileImpl::postReadMedia()` @Ozone 0x3c0950.
//
// Imports the REAL ported class; no restatement of the port lives here or in the Python oracle.
// The port takes no argument and reads no field, so the corpus is a list of case NAMES (each one an
// arena the oracle poisons or plants differently) and the port is called once per case — which is
// the point: the answer must not depend on the object.
//
// Protocol: {"cases":["<name>", …]} on stdin -> {"src":…, "port":[bool…], "mutants":{…}} on stdout.
//
// Run by raw-port/re/oracle/OZ3DEngineSceneFileImpl_postReadMedia_oracle.py via
// raw-port/node_modules/.bin/tsx.
import { OZ3DEngineSceneFileImpl } from "../../src/channels/OZ3DEngineSceneFileImpl.ts";

const req = JSON.parse(await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
})) as { cases: string[] };

const port = req.cases.map(() => new OZ3DEngineSceneFileImpl().postReadMedia());

// The only misreading available for `movb $0x1,%al` is the value itself, so there is exactly one
// mutant worth writing. Its job is to prove the comparison can fail at all; the harness's ability
// to see a value OTHER than 1 coming out of live Ozone is established on the binary side, by the
// two controls the oracle runs (a sibling whose return the harness plants, and the real override of
// this same virtual).
const mutants = {
  alwaysFalse: req.cases.map(() => false),
};

process.stdout.write(JSON.stringify({
  src: OZ3DEngineSceneFileImpl.prototype.postReadMedia.toString(),
  port,
  mutants,
}));
