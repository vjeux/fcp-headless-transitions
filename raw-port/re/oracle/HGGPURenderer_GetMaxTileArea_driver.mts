// HGGPURenderer_GetMaxTileArea_driver.mts — the TypeScript side of the differential for
// `HGGPURenderer::GetMaxTileArea() const` @Helium 0x15d90.
//
// Imports the REAL ported class (`raw-port/src/render/HGGPURenderer.ts`); neither this file nor the
// Python oracle contains a restatement of the port. The oracle plants an int32 at +0x294 of a
// poisoned arena and calls live Helium; this driver puts the same int32 in the modelled field and
// calls the committed TypeScript.
//
// Protocol: JSON on stdin  -> {"cases":[<int32 as decimal string>, …]}
//           JSON on stdout -> {"src":"…","port":[<u32 as decimal string>, …],
//                              "mutants":{"<name>":[<decimal string>, …], …}}
// Everything crosses the wire as a DECIMAL STRING: a JSON number would let the wire's own coercion
// decide the answer, and the property under test is precisely which 32-bit reading is right
// (OPS_LOG: "the coercion in your wire encoding is part of the instrument").
//
// Run by raw-port/re/oracle/HGGPURenderer_GetMaxTileArea_oracle.py via raw-port/node_modules/.bin/tsx.
import { HGGPURenderer } from "../../src/render/HGGPURenderer.ts";

const req = JSON.parse(await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
})) as { cases: string[] };

const cases = req.cases.map((s) => Number(BigInt.asIntN(32, BigInt(s))));

/** The port itself, called on a real HGGPURenderer with only the modelled field set. */
function port(x: number): string {
  const r = new HGGPURenderer();
  r.defaultPageSize_at_0x294 = x;
  return String(r.GetMaxTileArea());
}

// MUTANTS. Each is a plausible misreading of `movl ; imull ; addl ; ret`, and each carries the
// verdict this harness EXPECTS of it, so that a mutant which cannot be distinguished is declared in
// advance rather than discovered as a silent zero-kill row:
//   "kill"    the oracle requires this one to diverge from live Helium
//   "same"    this one is provably indistinguishable at this interface, and the oracle requires it
//             to AGREE — a "kill" here would mean the harness is measuring something else
const MUTANTS: Record<string, { verdict: "kill" | "same"; f: (x: number) => string }> = {
  // `| 0` on the way out instead of `>>> 0`: the reading in which hg_clip's last parameter is
  // `int` rather than `unsigned int`. Negative for every page size >= 46341.
  signedReturn: { verdict: "kill", f: (x) => String(((Math.imul(x, x) + Math.imul(x, x)) | 0)) },
  // Arithmetic in doubles, with no 32-bit truncation anywhere — the "it is just 2*x*x" reading.
  noWrap: { verdict: "kill", f: (x) => String(2 * x * x) },
  // The `addl %eax,%eax` missed: the tile AREA rather than twice it.
  squareOnly: { verdict: "kill", f: (x) => String(Math.imul(x, x) >>> 0) },
  // `addl` read as happening BEFORE the multiply: (2x)^2 instead of 2*(x^2).
  doubleThenSquare: { verdict: "kill", f: (x) => String(Math.imul(x << 1, x << 1) >>> 0) },
  // The field read UNSIGNED before the multiply (`>>> 0` instead of `| 0` at the load).
  // `imull` keeps the low 32 bits of the product, which are the same bits either way, so this one
  // CANNOT be distinguished here — declared, not discovered.
  unsignedField: {
    verdict: "same",
    f: (x) => {
      const u = x >>> 0;
      const sq = Math.imul(u, u);
      return String(((sq + sq) | 0) >>> 0);
    },
  },
};

const mutants: Record<string, string[]> = {};
const verdicts: Record<string, string> = {};
for (const [name, m] of Object.entries(MUTANTS)) {
  mutants[name] = cases.map(m.f);
  verdicts[name] = m.verdict;
}

process.stdout.write(JSON.stringify({
  src: HGGPURenderer.prototype.GetMaxTileArea.toString(),
  port: cases.map(port),
  mutants,
  verdicts,
}));
