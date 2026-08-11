// OZChannelBase_allowsDrag_driver.mts — the TypeScript half of the
// `OZChannelBase::allowsDrag(OZChannelBase const*)` @ProChannel 0x49f44 differential.
// Run through the repo's own `tsx`; the Python oracle spawns it and reads this JSON.
//
// The live side answers 1 for all 49 (this, other) pairs, so agreement alone proves very little —
// `return true` and a broken stub are the same function on that corpus. What the mutants price is
// the two ways a constant-returning port can be wrong: returning the OTHER constant, and quietly
// making the answer depend on an operand the machine never reads.
import { OZChannelBase, OZChannelBase_allowsDrag } from "../../src/channels/OZChannelBase.ts";

const self = new OZChannelBase();
const other = new OZChannelBase();
// The same shape the C side probes: both operands present, and the argument absent.
const pairs: Array<[OZChannelBase, OZChannelBase | null]> = [];
for (const a of [self, other]) for (const b of [self, other, null]) pairs.push([a, b]);
// pad to the C side's 49 by repeating the grid — the point is the per-case verdict, not the count
while (pairs.length < 49) pairs.push(pairs[pairs.length % 6]!);

const LIVE = true; // the live function returned 1 for every pair (checked on the Python side)

const port = pairs.map(([a, b]) => OZChannelBase_allowsDrag(a, b));
const M0 = pairs.map(() => true);                       // unmutated restatement — must kill 0
const M1 = pairs.map(() => false);                      // the other constant
const M2 = pairs.map(([, b]) => b !== null);            // an operand the machine never reads

const kills = (xs: boolean[]) => xs.filter((v) => v !== LIVE).length;

process.stdout.write(JSON.stringify({
  port_agrees: port.filter((v) => v === LIVE).length,
  M0_kills: kills(M0),
  M1_kills: kills(M1),
  M2_kills: kills(M2),
}));
