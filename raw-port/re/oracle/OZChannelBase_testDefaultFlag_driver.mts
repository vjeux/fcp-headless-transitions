// OZChannelBase_testDefaultFlag_driver.mts — the TypeScript side of the
// differential for `OZChannelBase::testDefaultFlag(unsigned long long) const`
// @ProChannel 0x4a540.
//
// It imports the REAL ported class (no restatement of the port lives in this
// file, and none lives in the Python oracle either — that is the whole point:
// a Python re-implementation of the port shares any misreading of the
// disassembly with the port itself, and then agrees with it enthusiastically).
//
// Protocol: a JSON request on stdin, a JSON reply on stdout.
//   in : {"cases":[{"w":"0x…","m":"0x…","d38":"0x…","d48":"0x…"}, …]}
//   out: {"port":[0|1,…], "mutants":{"<name>":[0|1,…], …}}
// u64 values travel as hex STRINGS: JSON has no 64-bit integer, and a
// double-encoded 0xFFFFFFFFFFFFFFFF would come back rounded.
//
// The six mutants are negative controls and are evaluated in THIS process on
// the SAME corpus, so they are apples-to-apples with the port rather than with
// a differently-spawned run. Each is a plausible way to get this two-line
// function wrong; the oracle requires every one of them to DIVERGE from the
// live binary, which is what makes "the port agrees" mean something.
//
// Run by raw-port/re/oracle/OZChannelBase_testDefaultFlag_oracle.py via
// raw-port/node_modules/.bin/tsx (tsx, not plain `node
// --experimental-strip-types`, because the ported source imports its siblings
// through `.js` specifiers that node's type-stripping resolver does not map
// back to `.ts`).
import { OZChannelBase } from "../../src/channels/OZChannelBase.ts";

interface Case {
  w: string; // the u64 written at +0x40 (the default-state snapshot)
  m: string; // the u64 mask argument
  d38: string; // decoy: the live flags word at +0x38
  d48: string; // decoy: the neighbouring slot at +0x48
}

const U64 = 0xffffffffffffffffn;

const req = JSON.parse(await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
})) as { cases: Case[] };

/** Build the object the way the arena is built on the C++ side: the slot under
 *  test plus decoys in the two neighbouring qwords. */
function make(c: Case): OZChannelBase {
  const o = new OZChannelBase();
  // The three slots are `private` in the class body; this driver is a test
  // harness standing in for a heap arena, so it writes them positionally.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (o as any).__default_state_word_at_0x40 = BigInt(c.w) & U64; // +0x40
  (o as any).__flags_word_at_0x38 = BigInt(c.d38) & U64; // +0x38 decoy
  (o as any).__flags_at_0x38 = BigInt(c.d38) & U64; // (the file's second +0x38 model)
  (o as any).__objc_wrapper_at_0x48 = BigInt(c.d48) & U64; // +0x48 decoy
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return o;
}

// ---- the port itself --------------------------------------------------
const port: number[] = req.cases.map((c) =>
  make(c).testDefaultFlag(BigInt(c.m) & U64) ? 1 : 0
);

// ---- negative controls ------------------------------------------------
type Mutant = (c: Case) => number;
const mutants: Record<string, Mutant> = {
  // ZF read the wrong way round: `sete` instead of `setne`.
  inverted: (c) => ((BigInt(c.w) & U64) & (BigInt(c.m) & U64)) === 0n ? 1 : 0,
  // `testl` instead of `testq` — the 32-bit truncation the QWORD note warns
  // about. Only distinguishable on masks whose bits live above bit 31.
  and32: (c) =>
    (((BigInt(c.w) & U64) & (BigInt(c.m) & U64)) & 0xffffffffn) !== 0n ? 1 : 0,
  // OR where the machine ANDs.
  or_not_and: (c) => ((BigInt(c.w) & U64) | (BigInt(c.m) & U64)) !== 0n ? 1 : 0,
  // The wrong slot: +0x38 (the LIVE flags word) instead of +0x40 (the saved
  // default). This is the mistake the decoys exist to catch.
  slot_0x38: (c) => ((BigInt(c.d38) & U64) & (BigInt(c.m) & U64)) !== 0n ? 1 : 0,
  always_true: () => 1,
  always_false: () => 0,
};

const out: Record<string, number[]> = {};
for (const [name, f] of Object.entries(mutants)) {
  out[name] = req.cases.map(f);
}

process.stdout.write(JSON.stringify({ port, mutants: out }));
