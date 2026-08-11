// OZChannel_getFadeOutOffset_driver.mts — the TypeScript side of the getFadeOutOffset differential.
//
//     node --experimental-strip-types OZChannel_getFadeOutOffset_driver.mts   # JSON in, JSON out
//
// It runs the REAL `raw-port/src/channels/OZChannel.ts` — not a restatement of it — so the
// comparison the oracle prints is TypeScript against the live ProChannel binary. OPS_LOG's
// standing complaint about this repo's oracles is that most of them compare the binary to a PYTHON
// paraphrase of the port, which shares any misreading with the port itself; this avoids that.
//
// TWO THINGS TO KNOW BEFORE TRUSTING THE NUMBERS, both of them deliberate and both visible in the
// output rather than hidden here:
//
// 1. THE MODULE GRAPH AROUND THE FUNCTION IS STUBBED, THE FUNCTION IS NOT. `OZChannel.ts` imports
//    six siblings for its class body and its two ctor ports; `OZChannel_getFadeOutOffset` uses
//    none of them. Node cannot load them anyway: this repo's tsconfig is `moduleResolution:
//    "bundler"`, so those imports are written EXTENSIONLESS (correct for tsc, unresolvable for
//    node against an uncompiled tree), and the chain behind them additionally imports type-only
//    names as VALUES (`import { CMTime, kCMTimeFlags_Valid } from "./CMTime.js"` in
//    PCSerializerReadStream.ts), which `--experimental-strip-types` cannot elide. Measured, in
//    order, while writing this: without a resolve hook the import dies on `./OZChannelBase`; with
//    one, on `'../infra/CMTime.js' does not provide an export named 'CMTime'` two modules deeper.
//    So the hook (written by the oracle into a temp dir, never into the repo) maps each of those
//    six specifiers to a one-line stub and reports every substitution in `stubbed`. What it does
//    NOT stub is `../infra/CMTime`: that module is a LEAF (zero imports) and it is where
//    `kCMTimeZero` — the value this port returns on the null path — actually comes from, so the
//    constant under test is the real one, loaded from the real file.
//
// 2. THE MUTANTS ARE REAL MODULES, NOT PARAPHRASES. The oracle copies `OZChannel.ts` and changes
//    ONE token per copy, then hands the paths here; each is imported through the same hook and run
//    over the same corpus. `M0` is an unmutated copy that goes through the identical pipeline and
//    must kill 0 — a mutation table without that baseline cannot tell a working instrument from a
//    blind one (OPS_LOG, the dead/inflated/implied-control family).
//
// int64 fields cross the wire as HEX STRINGS, never JSON numbers: CMTime.value and .epoch are
// int64 and the corpus deliberately includes INT64_MAX, which JSON.parse would round.
import { register } from "node:module";

type Wire = { value: string; timescale: number; flags: number; epoch: string };
type Case = { savedNull: boolean; timeB: Wire; timeA: Wire };
type Req = { hook: string; modules: Record<string, string>; cases: Case[] };

type CMTimeLike = { value: bigint; timescale: number; flags: number; epoch: bigint };
type SavedLike = { timeA: CMTimeLike; timeB: CMTimeLike; x: number; y: number };

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
// Out the same way it came in: the comparison on the other side is over BYTES, so nothing here
// may normalise a field. `BigInt.asUintN` is the wire encoding, not a fixup of the port's value —
// the port returns whatever the struct held and this prints exactly that.
const wire = (t: CMTimeLike): Wire => ({
  value: "0x" + BigInt.asUintN(64, t.value).toString(16),
  timescale: t.timescale,
  flags: t.flags,
  epoch: "0x" + BigInt.asUintN(64, t.epoch).toString(16),
});

const { kCMTimeZero: kZero } = await import("../../src/infra/CMTime.ts");

async function runModule(path: string) {
  const mod = await import(path);
  const fn = mod.OZChannel_getFadeOutOffset as (self: unknown) => CMTimeLike;
  const out: (Wire | { threw: string })[] = [];
  let aliased = false;
  for (const c of req.cases) {
    // The `this` the machine is handed: an object whose implPrimary is an impl whose
    // savedStateAt10 is the snapshot (or null). Same shape the ctypes side builds in memory.
    const saved: SavedLike | null = c.savedNull
      ? null
      : { timeA: unwire(c.timeA), timeB: unwire(c.timeB), x: 0, y: 0 };
    const self = { implPrimary: { savedState: saved } };
    try {
      const got = fn(self);
      out.push(wire(got));
      // ALIASING, the one property a value comparison cannot see. The machine copies 24 bytes into
      // the CALLER's sret slot, so a caller can never reach savedState's storage — nor, on the null
      // path, CoreMedia's kCMTimeZero. A port that returns the source OBJECT agrees on every value
      // and still hands the caller a live reference to the snapshot. Mutate what came back and look
      // at the source: if the source moved, the port aliased it.
      const beforeValue = saved ? saved.timeB.value : null;
      got.value = got.value ^ 0x5a5a5a5an;
      if (saved && saved.timeB.value !== beforeValue) {
        aliased = true;
        saved.timeB.value = beforeValue as bigint;      // put the corpus back for the next case
      }
      if (!saved && (kZero as CMTimeLike).value !== 0n) {
        aliased = true;
        (kZero as CMTimeLike).value = 0n;               // and the shared constant, or every module
      }                                                  // imported after this one sees the damage
    } catch (e) {
      out.push({ threw: (e as Error).message });
    }
  }
  return { results: out, aliased, source: fn.toString() };
}

const answer: Record<string, unknown> = {};
for (const [name, path] of Object.entries(req.modules)) {
  answer[name] = await runModule(path);
}
// The real constant, from the real leaf module (imported once, above, so the aliasing check can
// also see whether a port handed the caller a reference to it), so the oracle can compare the TS
// kCMTimeZero to the bytes at the literal-pool target the binary itself loads.
answer["kCMTimeZero"] = wire(kZero as CMTimeLike);
process.stdout.write(JSON.stringify(answer));
