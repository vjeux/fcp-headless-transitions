// FFCachesForRepeatedRetimingCalculations_mediaEndTime_driver.mts — the TypeScript side.
//
//     node --experimental-strip-types FFCachesForRepeatedRetimingCalculations_mediaEndTime_driver.mts
//
// Runs the REAL `raw-port/src/channels/FFCachesForRepeatedRetimingCalculations.ts` and the mutants
// as real modules (the Python side writes each as a copy with ONE token changed). The port imports
// only `../infra/CMTime`, a leaf module, which is loaded for real through a resolve hook that maps
// that ONE extensionless specifier to the actual file — nothing is stubbed, and the hook exists
// only because node cannot resolve an extensionless specifier against an uncompiled tree.
//
// Reported per case: the returned CMTime, the STATE's slot after the call (this method's real
// effect is a write-back into the cache, which a return-value comparison cannot see), whether the
// port threw (the ObjC path must), and whether the returned object aliases the slot.
import { register } from "node:module";

type Wire = { value: string; timescale: number; flags: number; epoch: string };
type Case = { slot: Wire; effectNull: boolean };
type Req = { hook: string; modules: Record<string, string>; cases: Case[] };

type CMTimeLike = { value: bigint; timescale: number; flags: number; epoch: bigint };

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Req;
register(req.hook, import.meta.url);

const unwire = (w: Wire): CMTimeLike => ({
  value: BigInt.asIntN(64, BigInt(w.value)),
  timescale: w.timescale,
  flags: w.flags,
  epoch: BigInt.asIntN(64, BigInt(w.epoch)),
});
const wire = (t: CMTimeLike): Wire => ({
  value: "0x" + BigInt.asUintN(64, t.value).toString(16),
  timescale: t.timescale,
  flags: t.flags,
  epoch: "0x" + BigInt.asUintN(64, t.epoch).toString(16),
});

const answer: Record<string, unknown> = {};
for (const [name, path] of Object.entries(req.modules)) {
  const mod = await import(path);
  const fn = mod.FFCachesForRepeatedRetimingCalculations_mediaEndTime as
    (self: { mediaEndTimeCacheAt18: CMTimeLike }, effect: unknown) => CMTimeLike;
  const results: unknown[] = [];
  for (const c of req.cases) {
    const self = { mediaEndTimeCacheAt18: unwire(c.slot) };
    // A non-null effect is an opaque handle here: the two implemented paths never dereference it,
    // and the live side is handed a poisoned pointer for the same reason.
    const effect = c.effectNull ? null : ({} as unknown);
    try {
      const got = fn(self, effect);
      // Capture BOTH observables BEFORE probing for aliasing. Getting this order wrong is not
      // hypothetical — the first revision probed first and then "restored" with a second XOR,
      // which for an ALIASING port applied the perturbation twice and left the slot corrupted.
      // The aliasing mutant then died on VALUES too, which is precisely the story the aliasing
      // column exists to keep separate: an instrument must not damage the thing it is measuring.
      const ret = wire(got);
      const slotAfter = wire(self.mediaEndTimeCacheAt18);
      const before = self.mediaEndTimeCacheAt18.value;
      got.value = got.value ^ 0x5a5a5a5an;
      const aliased = self.mediaEndTimeCacheAt18.value !== before;
      if (aliased) self.mediaEndTimeCacheAt18.value = before;   // put the subject back, exactly once
      results.push({ threw: false, ret, slot: slotAfter, aliased });
    } catch (e) {
      results.push({ threw: true, message: (e as Error).message.slice(0, 120),
                     slot: wire(self.mediaEndTimeCacheAt18) });
    }
  }
  answer[name] = { results, source: fn.toString() };
}
process.stdout.write(JSON.stringify(answer));
