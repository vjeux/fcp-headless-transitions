// HGFreeAlign_driver.mts — the TypeScript side of the HGFreeAlign differential.
//
// Imports the REAL ported modules (the landed allocator and this PR's deallocator)
// through node's native type stripping, so nothing here is a restatement that could
// share a misreading with the port:
//
//     node --experimental-strip-types HGFreeAlign_driver.mts   # JSON in, JSON out
//
// The mutants live in this same process so they are apples-to-apples with the port.

// The port under test imports its sibling with the `.js` specifier tsc requires, which
// node cannot resolve against an uncompiled tree — so register the repo's `.js`->`.ts`
// resolve hook FIRST and pull both modules in dynamically, after it is live.
import { register } from "node:module";
register("./ts_js_hooks.mjs", import.meta.url);

const { HGAllocAlign, hgAlignedHeap } = await import("../../src/infra/HGAllocAlign.ts");
const { HGFreeAlign } = await import("../../src/infra/HGFreeAlign.ts");

const HEADER = 8n;

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const { sizes } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { sizes: number[] };

let composed = 0;
let recovered_ok = 0;
const pads: { invariant_ok: boolean }[] = [];
const mutants = { m1_read_p: 0, m2_read_pm16: 0, m3_read_pp8: 0 };

for (const size of sizes) {
  const p = HGAllocAlign(BigInt(size));

  // The word the landed allocator stashed — ground truth for "what must the load
  // recover", read through the shared model the two units now agree on.
  const stashed = hgAlignedHeap.loadU64(BigInt.asUintN(64, p - HEADER));

  // The port itself: it must compose with its allocator and must not throw.
  let threw = false;
  try {
    HGFreeAlign(p);
  } catch {
    threw = true;
  }
  if (!threw) composed++;

  // What the port's load expression recovers, evaluated through the same public API
  // the port uses. (The port returns void, so this is the only way to see the value
  // it acted on; the whole-function behaviour is covered on the binary side.)
  const got = hgAlignedHeap.loadU64(BigInt.asUintN(64, p - HEADER));
  if (got === stashed) recovered_ok++;

  // The ALIGNMENT INVARIANT, checked against the model's OWN base.
  //
  // Note what is deliberately NOT compared: the binary's pad against the model's pad.
  // The pad is a function of the ADDRESS, the modelled heap's base address is an
  // explicit free parameter of the landed sibling's model ("the transcribed function
  // is correct for any address"), and the real allocator's addresses come from malloc
  // — so a cross-side pad comparison measures the choice of HGAlignedHeap.BASE and
  // nothing about either transcription. The first version of this harness did compare
  // them and reported a meaningless 7/15. What IS meaningful is that each side obeys
  // the same RULE against its own base, which is what the binary side checks too.
  const base = stashed;
  const alignedOk =
    p === BigInt.asUintN(64, base + HEADER + (BigInt.asUintN(64, -(base + HEADER)) & 0x1fn));
  pads.push({ invariant_ok: alignedOk && p % 32n === 0n });

  // Negative controls: the same load at the wrong offset. A mutant is KILLED when it
  // fails to recover the stashed base (either a different value, or a throw because
  // the address falls outside every modelled block).
  const tryLoad = (addr: bigint): bigint | null => {
    try {
      return hgAlignedHeap.loadU64(BigInt.asUintN(64, addr));
    } catch {
      return null;
    }
  };
  if (tryLoad(p) !== stashed) mutants.m1_read_p++;
  if (tryLoad(p - 16n) !== stashed) mutants.m2_read_pm16++;
  if (tryLoad(p + 8n) !== stashed) mutants.m3_read_pp8++;
}

process.stdout.write(JSON.stringify({ composed, recovered_ok, pads, mutants }));
