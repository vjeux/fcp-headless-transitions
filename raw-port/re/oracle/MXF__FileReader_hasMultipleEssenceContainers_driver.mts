// MXF__FileReader_hasMultipleEssenceContainers_driver.mts — the TS side of the differential.
//
// Imports the REAL ported module (no build step, no tsx, no restatement) so the comparison is
// TypeScript-against-binary. Reads {"cases": ["<u64 as decimal string>", ...]} on stdin and prints
// {"port": [bool...], "mutants": {...}} on stdout — the mutants are evaluated HERE, in the same
// process, so they are apples-to-apples with the port rather than with a Python re-implementation.
//
//   node --experimental-strip-types MXF__FileReader_hasMultipleEssenceContainers_driver.mts
import {
  MXF__FileReader_hasMultipleEssenceContainers,
} from "../../src/channels/MXF__FileReader.ts";

const raw = await new Promise<string>((res) => {
  let s = "";
  process.stdin.on("data", (d) => (s += d));
  process.stdin.on("end", () => res(s));
});
const cases: string[] = JSON.parse(raw).cases;

// u64 -> the `number` the port's field holds. Exact below 2^53; above it the nearest double, which
// is what the header argues is harmless for a `>= 2` predicate.
const asNum = (s: string) => Number(BigInt(s));

const port = cases.map((c) =>
  MXF__FileReader_hasMultipleEssenceContainers({ essenceContainerCount: asNum(c) }),
);

// MUTANTS — plausible misreadings of `cmpq $0x2 ; setae`, each evaluated over the same corpus:
//   gt      : `seta`  (> 2)                      — the off-by-one on the boundary
//   signed  : `setge` (signed >= 2)              — reading the compare as signed
//   nonzero : `!= 0`  (testq/jne)                — "has any container" instead of "multiple"
//   eq2     : `== 2`  (sete)                     — reading setae as sete
const mutants = {
  gt: cases.map((c) => asNum(c) > 2),
  signed: cases.map((c) => BigInt.asIntN(64, BigInt(c)) >= 2n),
  nonzero: cases.map((c) => asNum(c) !== 0),
  eq2: cases.map((c) => asNum(c) === 2),
};

process.stdout.write(JSON.stringify({ port, mutants }));
