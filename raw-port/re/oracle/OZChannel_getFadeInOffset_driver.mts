// OZChannel_getFadeInOffset_driver.mts — runs the SHIPPED port, not a restatement of it.
//
// WHY THIS FILE EXISTS. The two probes beside it measure the live ProChannel function and leave the
// correspondence with the TypeScript to the reader. That is exactly the gap a reviewer found on this
// PR: `getFadeInOffset` returned a live REFERENCE where the machine copies 24 bytes into the
// caller's sret slot, so a caller mutating its own result reached back into `savedState` — and on
// the null path into the process-wide `kCMTimeZero`. Every static gate was green, both probes
// PASSed, and the diff read correctly, because nothing executed the port. This driver does.
//
// WHY tsx AND NOT `node --experimental-strip-types`. The house recipe is plain node, and it does not
// work on this port — measured, twice, before falling back:
//   * `src/channels/OZChannel.ts` imports its siblings WITHOUT an extension
//     (`import { OZChannelBase } from "./OZChannelBase"`), which tsc resolves and node does not, so
//     `ts_js_hooks.mjs` (which maps a `.js` specifier to the `.ts` beside it) does not cover it;
//   * past that, a LANDED sibling in the graph — `src/infra/PCSerializerReadStream.ts:17` —
//     imports a TYPE without the `type` keyword (`import { CMTime, kCMTimeFlags_Valid } from
//     "./CMTime.js"`). Type stripping cannot know `CMTime` is a type, so node demands a runtime
//     export that does not exist: `SyntaxError: The requested module './CMTime.js' does not provide
//     an export named 'CMTime'`.
// `tsx` (already in raw-port/node_modules/.bin) elides unused/type-only imports and resolves
// extensionless siblings, so it loads the SHIPPED file unmodified — which is the property that
// matters here. Neither point is this port's defect, and neither is a reason to compare against a
// restatement instead of the real file.
//
//   raw-port/node_modules/.bin/tsx OZChannel_getFadeInOffset_driver.mts   # JSON in, JSON out
//
// It is invoked by OZChannel_getFadeInOffset_probe.py, which feeds it the SAME cases it fed to the
// live symbol and compares field by field. It also answers the two questions a value comparison
// cannot: does the returned object ALIAS its source, and does the null path hand back the shared
// kCMTimeZero singleton.

// Dynamic import for symmetry with the node recipe (and so a resolution failure is an error this
// file can explain rather than a load-time crash).
const OZ = await import("../../src/channels/OZChannel.ts");
const CM = await import("../../src/infra/CMTime.ts");

type WireTime = { value: string; timescale: number; flags: number; epoch: string };
type WireCase = { label: string; saved: boolean; a?: WireTime; b?: WireTime };

const out = (t: { value: bigint; timescale: number; flags: number; epoch: bigint }): WireTime => ({
  value: t.value.toString(),
  timescale: t.timescale,
  flags: t.flags,
  epoch: t.epoch.toString(),
});
const inn = (w: WireTime) => ({
  value: BigInt(w.value),
  timescale: w.timescale,
  flags: w.flags,
  epoch: BigInt(w.epoch),
});

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const cases: WireCase[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));

const results = cases.map((c) => {
  // The minimal shape the two units read: this+0x70 -> impl, impl+0x10 -> savedState (nullable),
  // savedState+0x00 -> CMTime a, savedState+0x18 -> CMTime b (the decoy the probe plants).
  const a = c.saved && c.a ? inn(c.a) : null;
  const self = {
    implPrimary: {
      savedStateAt10: a
        ? { fadeInCurveAt30: 0, fadeInOffsetAt00: a, fadeInOffsetDecoyAt18: c.b ? inn(c.b) : null }
        : null,
    },
  } as unknown as Parameters<typeof OZ.OZChannel_getFadeInOffset>[0];

  const r = OZ.OZChannel_getFadeInOffset(self);
  const returned = out(r);

  // ALIASING, the thing a value comparison cannot see. The machine copies into the caller's own
  // 24 bytes, so writing to the result must not be observable anywhere else.
  const sentinel = 0x5a5a5a5an;
  r.value = sentinel;
  const sourceMutated = a !== null ? a.value === sentinel : false;
  const zeroMutated = CM.kCMTimeZero.value === sentinel;
  // ...and a LATER call must still produce the original answer.
  const again = out(OZ.OZChannel_getFadeInOffset(self));

  return { label: c.label, returned, again, sourceMutated, zeroMutated };
});

process.stdout.write(JSON.stringify(results));
